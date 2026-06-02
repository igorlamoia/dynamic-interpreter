# Linguagens Personalizadas por Usuário — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persistir linguagens customizadas por usuário no backend, vincular linguagens a exercícios (policy OPEN/LOCKED), e gravar snapshot da customização em cada submissão.

**Architecture:** Tabela `languages` com `customization` em JSONB (espelha `StoredKeywordCustomization` do front). Usuário-sistema (role `SYSTEM`) é dono de conteúdo oficial. `exercises` ganha policy + FK opcional para linguagem travada. `submissions` ganha snapshot imutável. Front (Next.js) consome via backend FastAPI/SQLAlchemy; logado lê a linguagem ativa do backend, deslogado/rascunho mantém `localStorage`.

**Tech Stack:** Backend FastAPI + SQLAlchemy async + Alembic + Pydantic. Front Next.js (Pages Router) + React 19 + TanStack Query + Monaco Editor.

**User Verification:** NO — não há requisito de feedback humano sobre o resultado; verificação é via testes automatizados e checagem manual de fluxos.

**Referência do spec:** [`docs/superpowers/specs/2026-05-19-linguagens-personalizadas-por-usuario-design.md`](../specs/2026-05-19-linguagens-personalizadas-por-usuario-design.md)

---

## File Structure

### Backend (criar)
- `backend/app/models/language.py` — modelo `Language`
- `backend/app/modules/languages/__init__.py`
- `backend/app/modules/languages/router.py`
- `backend/app/modules/languages/service.py`
- `backend/app/schemas/languages.py`
- `backend/migrations/versions/<rev>_languages_and_policy.py`
- `backend/tests/modules/test_languages.py`
- `backend/tests/modules/test_exercise_policy.py`
- `backend/tests/modules/test_submission_snapshot.py`

### Backend (modificar)
- `backend/app/models/__init__.py` — exportar `Language`
- `backend/app/models/user.py` — enum `SYSTEM`, `active_language_id`, relationships
- `backend/app/models/exercise.py` — `language_policy`, `locked_language_id`
- `backend/app/models/submission.py` — `language_snapshot` JSONB
- `backend/app/modules/exercises/router.py` + `service.py` — policy + expansão
- `backend/app/modules/submissions/router.py` + `service.py` — snapshot + override
- `backend/app/modules/users/router.py` + `service.py` — active-language endpoints
- `backend/app/schemas/exercises.py` — `language_policy`, `locked_language_id`, resposta com `locked_language` expandida
- `backend/app/schemas/submissions.py` — `language_snapshot`
- `backend/app/schemas/users.py` — `active_language_id`
- `backend/app/main.py` — registrar `languages_router`

### Front (criar)
- `packages/ide/src/lib/languages-api.ts` — cliente para `/languages` e `/users/me/active-language`
- `packages/ide/src/hooks/useLanguages.ts` — TanStack Query hooks
- `packages/ide/src/components/language-library/LanguageLibraryModal.tsx`
- `packages/ide/src/components/language-library/LanguageRow.tsx`
- `packages/ide/src/components/exercise-workspace/LockedLanguageBanner.tsx`

### Front (modificar)
- `packages/ide/src/contexts/keyword/KeywordContext.tsx` — branch logado/deslogado, `activeLanguageId`, `saveCurrent`, `setActive`
- `packages/ide/src/lib/keyword-language-storage.ts` — manter localStorage como rascunho mesmo logado
- `packages/ide/src/lib/query-keys.ts` — chaves `languages`
- Form de criação/edição de exercício do professor — campos `languagePolicy` e `lockedLanguageId`
- `packages/ide/src/views/exercise-workspace/` — banner + lock + envio de snapshot
- `packages/ide/src/pages/api/submissions/validate.ts` — se o backend já força LOCKED, manter assinatura

---

## Task 1: Schema — tabela `languages` e colunas relacionadas

**Goal:** Criar a tabela `languages`, estender `users`/`exercises`/`submissions` e enum `userrole`. Seed do usuário-sistema.

**Files:**
- Create: `backend/app/models/language.py`
- Modify: `backend/app/models/__init__.py`
- Modify: `backend/app/models/user.py` (enum `SYSTEM`, `active_language_id`, relationships)
- Modify: `backend/app/models/exercise.py` (`language_policy`, `locked_language_id`)
- Modify: `backend/app/models/submission.py` (`language_snapshot`)
- Create: `backend/migrations/versions/<rev>_languages_and_policy.py`
- Test: `backend/tests/modules/test_languages_migration.py` (smoke test do schema)

**Acceptance Criteria:**
- [ ] Tabela `languages` criada com `UNIQUE(owner_id, name)` e índice em `owner_id`
- [ ] `users.active_language_id` (nullable, FK ON DELETE SET NULL)
- [ ] `exercises.language_policy` ENUM('OPEN','LOCKED') NOT NULL DEFAULT 'OPEN' + `locked_language_id` (nullable, FK ON DELETE RESTRICT)
- [ ] CHECK constraint: `(language_policy = 'LOCKED') = (locked_language_id IS NOT NULL)`
- [ ] `submissions.language_snapshot` JSONB NOT NULL (com default `'{}'::jsonb` para migrar linhas existentes)
- [ ] Enum `userrole` estendido com `SYSTEM`
- [ ] Migration cria organization "System" e user `system@internal` com role `SYSTEM`
- [ ] `alembic upgrade head` e `alembic downgrade -1` rodam sem erro

**Verify:**
```bash
cd backend && uv run alembic upgrade head && uv run pytest tests/modules/test_languages_migration.py -v
```

**Steps:**

- [ ] **1.1 — Criar model `Language`**

`backend/app/models/language.py`:
```python
from datetime import datetime
from typing import TYPE_CHECKING, Any
from sqlalchemy import Integer, String, ForeignKey, UniqueConstraint, Index, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class Language(Base):
    __tablename__ = "languages"
    __table_args__ = (
        UniqueConstraint("owner_id", "name", name="uq_languages_owner_name"),
        Index("ix_languages_owner_id", "owner_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    owner_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(String, nullable=True)
    customization: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    cloned_from_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("languages.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    updated_at: Mapped[datetime] = mapped_column(default=func.now(), onupdate=func.now())

    owner: Mapped["User"] = relationship("User", back_populates="languages", foreign_keys=[owner_id])
    cloned_from: Mapped["Language | None"] = relationship("Language", remote_side="Language.id")
```

- [ ] **1.2 — Atualizar `User`**

Em `backend/app/models/user.py`:
- Adicionar `SYSTEM = "SYSTEM"` ao enum `UserRole`
- Adicionar coluna `active_language_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("languages.id", ondelete="SET NULL"), nullable=True)`
- Adicionar relationship: `languages: Mapped[list["Language"]] = relationship("Language", back_populates="owner", foreign_keys="Language.owner_id", cascade="all, delete-orphan")`
- Adicionar relationship `active_language` com `foreign_keys=[active_language_id]`

- [ ] **1.3 — Atualizar `Exercise`**

Em `backend/app/models/exercise.py`:
```python
import enum
# ...
class LanguagePolicy(str, enum.Enum):
    OPEN = "OPEN"
    LOCKED = "LOCKED"

# dentro de Exercise:
language_policy: Mapped[LanguagePolicy] = mapped_column(
    Enum(LanguagePolicy), default=LanguagePolicy.OPEN, nullable=False
)
locked_language_id: Mapped[int | None] = mapped_column(
    Integer, ForeignKey("languages.id", ondelete="RESTRICT"), nullable=True
)
locked_language: Mapped["Language | None"] = relationship("Language")
```

Adicionar `CheckConstraint` em `__table_args__`:
```python
CheckConstraint(
    "(language_policy = 'LOCKED') = (locked_language_id IS NOT NULL)",
    name="ck_exercises_locked_language_consistency"
)
```

- [ ] **1.4 — Atualizar `Submission`**

Em `backend/app/models/submission.py`:
```python
from sqlalchemy.dialects.postgresql import JSONB
# ...
language_snapshot: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
```

- [ ] **1.5 — Atualizar `__init__.py`**

Em `backend/app/models/__init__.py`, exportar `Language` e `LanguagePolicy`.

- [ ] **1.6 — Gerar migration**

```bash
cd backend && uv run alembic revision --autogenerate -m "languages and policy"
```

Editar a migration gerada:
- Garantir ordem: criar `languages` ANTES de adicionar FKs em `users`/`exercises`
- Adicionar valor `SYSTEM` ao enum existente: `op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'SYSTEM'")`
- Adicionar `language_policy` com `server_default='OPEN'`
- `language_snapshot` com `server_default=sa.text("'{}'::jsonb")` para linhas existentes
- Seed do system user:
```python
op.execute(sa.text("""
    INSERT INTO organizations (name, created_at) VALUES ('System', now())
    RETURNING id
"""))
# ou via op.bulk_insert para portabilidade
```
- No `downgrade()`: dropar colunas e tabela, mas **não** remover valor do enum (PostgreSQL não suporta sem recriar)

- [ ] **1.7 — Smoke test do schema**

`backend/tests/modules/test_languages_migration.py`:
```python
import pytest
from sqlalchemy import select
from app.models.language import Language
from app.models.user import User, UserRole
from app.models.exercise import Exercise, LanguagePolicy


@pytest.mark.asyncio
async def test_system_user_seeded(db_session):
    result = await db_session.execute(select(User).where(User.role == UserRole.SYSTEM))
    assert result.scalar_one_or_none() is not None


@pytest.mark.asyncio
async def test_language_unique_per_owner(db_session, make_user):
    user = await make_user()
    db_session.add(Language(owner_id=user.id, name="PortuJava", customization={}))
    await db_session.flush()
    db_session.add(Language(owner_id=user.id, name="PortuJava", customization={}))
    with pytest.raises(Exception):  # IntegrityError
        await db_session.flush()


@pytest.mark.asyncio
async def test_exercise_locked_requires_language(db_session, make_user):
    teacher = await make_user(role=UserRole.TEACHER)
    ex = Exercise(
        teacher_id=teacher.id, title="t", description="d",
        attachments="", language_policy=LanguagePolicy.LOCKED, locked_language_id=None
    )
    db_session.add(ex)
    with pytest.raises(Exception):
        await db_session.flush()
```

- [ ] **1.8 — Run tests + commit**

```bash
cd backend && uv run pytest tests/modules/test_languages_migration.py -v
git add backend/
git commit -m "feat(db): add languages table, policy and snapshot columns"
```

```json:metadata
{"files": ["backend/app/models/language.py", "backend/app/models/user.py", "backend/app/models/exercise.py", "backend/app/models/submission.py", "backend/migrations/versions/<rev>_languages_and_policy.py"], "verifyCommand": "cd backend && uv run alembic upgrade head && uv run pytest tests/modules/test_languages_migration.py -v", "acceptanceCriteria": ["languages table com UNIQUE(owner,name)", "users.active_language_id FK", "exercises.language_policy + locked_language_id + CHECK", "submissions.language_snapshot JSONB", "userrole tem SYSTEM", "system user seeded"], "requiresUserVerification": false}
```

---

## Task 2: API `/languages` (CRUD + active + clone)

**Goal:** Endpoints completos para o usuário gerenciar seu acervo, definir linguagem ativa e clonar linguagens acessíveis.

**Files:**
- Create: `backend/app/modules/languages/router.py`
- Create: `backend/app/modules/languages/service.py`
- Create: `backend/app/modules/languages/__init__.py`
- Create: `backend/app/schemas/languages.py`
- Modify: `backend/app/modules/users/router.py`, `service.py`, `backend/app/schemas/users.py`
- Modify: `backend/app/main.py`
- Test: `backend/tests/modules/test_languages.py`

**Acceptance Criteria:**
- [ ] `GET/POST /languages` retorna apenas linguagens do usuário
- [ ] `PATCH/DELETE /languages/:id` exige posse; DELETE retorna 409 se referenciada por `exercises.locked_language_id`
- [ ] `GET /languages/:id` aplica read-gate (dono | exercício acessível | SYSTEM)
- [ ] `POST /languages/:id/clone` reusa read-gate e cria nova com `owner_id=me, cloned_from_id=:id`
- [ ] `GET/PUT /users/me/active-language` operacional; PUT valida posse
- [ ] Bloqueia mudar `active_language_id` para uma linguagem que não é do usuário

**Verify:** `cd backend && uv run pytest tests/modules/test_languages.py -v`

**Steps:**

- [ ] **2.1 — Schemas Pydantic**

`backend/app/schemas/languages.py`:
```python
from datetime import datetime
from typing import Any
from app.schemas.base import CamelModel


class LanguageCreate(CamelModel):
    name: str
    description: str | None = None
    customization: dict[str, Any]


class LanguageUpdate(CamelModel):
    name: str | None = None
    description: str | None = None
    customization: dict[str, Any] | None = None


class LanguageResponse(CamelModel):
    id: int
    owner_id: int
    name: str
    description: str | None
    customization: dict[str, Any]
    cloned_from_id: int | None
    created_at: datetime
    updated_at: datetime


class LanguageSummary(CamelModel):
    id: int
    name: str
    description: str | None
    cloned_from_id: int | None
    updated_at: datetime


class ActiveLanguageUpdate(CamelModel):
    language_id: int | None
```

- [ ] **2.2 — Service: helpers de visibilidade e CRUD**

`backend/app/modules/languages/service.py`:
```python
from sqlalchemy import select, exists, and_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.language import Language
from app.models.user import User, UserRole
from app.models.exercise import Exercise, LanguagePolicy
from app.models.class_member import ClassMember
from app.models.class_exercise_list import ClassExerciseList
from app.models.exercise_list_item import ExerciseListItem
from app.schemas.languages import LanguageCreate, LanguageUpdate


async def _can_read(language: Language, user_id: int, session: AsyncSession) -> bool:
    if language.owner_id == user_id:
        return True
    owner = await session.get(User, language.owner_id)
    if owner and owner.role == UserRole.SYSTEM:
        return True
    # exercício acessível ao usuário que trava nesta linguagem
    stmt = (
        select(Exercise.id)
        .join(ExerciseListItem, ExerciseListItem.exercise_id == Exercise.id)
        .join(ClassExerciseList, ClassExerciseList.exercise_list_id == ExerciseListItem.exercise_list_id)
        .join(ClassMember, and_(
            ClassMember.class_id == ClassExerciseList.class_id,
            ClassMember.student_id == user_id,
        ))
        .where(Exercise.locked_language_id == language.id)
        .limit(1)
    )
    return (await session.execute(stmt)).scalar_one_or_none() is not None


async def list_my_languages(user_id: int, session: AsyncSession) -> list[Language]:
    result = await session.execute(select(Language).where(Language.owner_id == user_id))
    return list(result.scalars().all())


async def get_language(language_id: int, user_id: int, session: AsyncSession) -> Language:
    language = await session.get(Language, language_id)
    if not language:
        raise HTTPException(status_code=404, detail="Language not found")
    if not await _can_read(language, user_id, session):
        raise HTTPException(status_code=403, detail="Not allowed")
    return language


async def create_language(data: LanguageCreate, user_id: int, session: AsyncSession) -> Language:
    lang = Language(owner_id=user_id, name=data.name, description=data.description, customization=data.customization)
    session.add(lang)
    try:
        await session.flush()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=409, detail="Language name already exists for this user")
    return lang


async def update_language(language_id: int, data: LanguageUpdate, user_id: int, session: AsyncSession) -> Language:
    lang = await session.get(Language, language_id)
    if not lang or lang.owner_id != user_id:
        raise HTTPException(status_code=404, detail="Language not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(lang, field, value)
    try:
        await session.flush()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=409, detail="Name conflict")
    return lang


async def delete_language(language_id: int, user_id: int, session: AsyncSession) -> None:
    lang = await session.get(Language, language_id)
    if not lang or lang.owner_id != user_id:
        raise HTTPException(status_code=404, detail="Language not found")
    in_use = (await session.execute(
        select(Exercise.id).where(Exercise.locked_language_id == language_id).limit(1)
    )).scalar_one_or_none()
    if in_use is not None:
        raise HTTPException(status_code=409, detail="Language is in use by at least one exercise")
    await session.delete(lang)
    await session.flush()


async def clone_language(language_id: int, user_id: int, session: AsyncSession) -> Language:
    source = await get_language(language_id, user_id, session)  # aplica read-gate
    # gera nome único: "<name> (cópia)", "<name> (cópia 2)", ...
    base_name = f"{source.name} (cópia)"
    name = base_name
    i = 2
    while (await session.execute(
        select(Language.id).where(Language.owner_id == user_id, Language.name == name)
    )).scalar_one_or_none() is not None:
        name = f"{base_name} {i}"
        i += 1

    clone = Language(
        owner_id=user_id,
        name=name,
        description=source.description,
        customization=source.customization,
        cloned_from_id=source.id,
    )
    session.add(clone)
    await session.flush()
    return clone
```

- [ ] **2.3 — Router de languages**

`backend/app/modules/languages/router.py`:
```python
from fastapi import APIRouter
from app.core.dependencies import SessionDep, CurrentUserIdDep
from app.schemas.languages import (
    LanguageCreate, LanguageUpdate, LanguageResponse, LanguageSummary
)
from app.modules.languages.service import (
    list_my_languages, get_language, create_language,
    update_language, delete_language, clone_language
)

router = APIRouter(prefix="/languages", tags=["languages"])


@router.get("", response_model=list[LanguageSummary])
async def list_endpoint(user_id: CurrentUserIdDep, session: SessionDep):
    return await list_my_languages(user_id, session)


@router.get("/{language_id}", response_model=LanguageResponse)
async def get_endpoint(language_id: int, user_id: CurrentUserIdDep, session: SessionDep):
    return await get_language(language_id, user_id, session)


@router.post("", response_model=LanguageResponse, status_code=201)
async def create_endpoint(data: LanguageCreate, user_id: CurrentUserIdDep, session: SessionDep):
    return await create_language(data, user_id, session)


@router.patch("/{language_id}", response_model=LanguageResponse)
async def update_endpoint(language_id: int, data: LanguageUpdate, user_id: CurrentUserIdDep, session: SessionDep):
    return await update_language(language_id, data, user_id, session)


@router.delete("/{language_id}", status_code=204)
async def delete_endpoint(language_id: int, user_id: CurrentUserIdDep, session: SessionDep):
    await delete_language(language_id, user_id, session)


@router.post("/{language_id}/clone", response_model=LanguageResponse, status_code=201)
async def clone_endpoint(language_id: int, user_id: CurrentUserIdDep, session: SessionDep):
    return await clone_language(language_id, user_id, session)
```

- [ ] **2.4 — Endpoints de active-language**

Em `backend/app/modules/users/router.py`, adicionar:
```python
@router.get("/me/active-language", response_model=LanguageResponse | None)
async def get_active_language(user_id: CurrentUserIdDep, session: SessionDep):
    user = await session.get(User, user_id)
    if not user.active_language_id:
        return None
    return await session.get(Language, user.active_language_id)


@router.put("/me/active-language", response_model=LanguageResponse | None)
async def set_active_language(data: ActiveLanguageUpdate, user_id: CurrentUserIdDep, session: SessionDep):
    user = await session.get(User, user_id)
    if data.language_id is not None:
        lang = await session.get(Language, data.language_id)
        if not lang or lang.owner_id != user_id:
            raise HTTPException(status_code=403, detail="Language not owned by user")
    user.active_language_id = data.language_id
    await session.flush()
    if not user.active_language_id:
        return None
    return await session.get(Language, user.active_language_id)
```

- [ ] **2.5 — Registrar router**

Em `backend/app/main.py`:
```python
from app.modules.languages.router import router as languages_router
app.include_router(languages_router)
```

- [ ] **2.6 — Tests**

`backend/tests/modules/test_languages.py` — cobrir:
- Criar, listar, obter, atualizar, deletar (caminho feliz)
- Não dono recebe 404 em get/update/delete
- Delete bloqueado por 409 quando linguagem é `locked_language_id` de algum exercício
- Clone por dono cria cópia com nome único e `cloned_from_id`
- Clone por aluno membro de turma com exercício LOCKED nessa linguagem funciona
- Clone por usuário sem acesso retorna 403
- Clone de linguagem do usuário-sistema funciona para qualquer logado
- `PUT /users/me/active-language` rejeita id de outro usuário (403)

- [ ] **2.7 — Run + commit**

```bash
cd backend && uv run pytest tests/modules/test_languages.py -v
git add backend/
git commit -m "feat(api): /languages CRUD, clone, active-language endpoints"
```

```json:metadata
{"files": ["backend/app/modules/languages/router.py", "backend/app/modules/languages/service.py", "backend/app/schemas/languages.py", "backend/app/modules/users/router.py", "backend/app/main.py"], "verifyCommand": "cd backend && uv run pytest tests/modules/test_languages.py -v", "acceptanceCriteria": ["CRUD com auth do dono", "DELETE 409 quando referenciada", "POST /clone com read-gate", "PUT active-language valida posse"], "requiresUserVerification": false}
```

---

## Task 3: Policy em exercises e snapshot em submissions

**Goal:** Exercícios aceitam `language_policy` + `locked_language_id`; respostas expandem linguagem travada inline. Submissões gravam snapshot; o servidor sobrescreve com a linguagem travada quando o exercício é LOCKED.

**Files:**
- Modify: `backend/app/schemas/exercises.py`
- Modify: `backend/app/modules/exercises/service.py`, `router.py`
- Modify: `backend/app/schemas/submissions.py`
- Modify: `backend/app/modules/submissions/service.py`
- Test: `backend/tests/modules/test_exercise_policy.py`, `test_submission_snapshot.py`

**Acceptance Criteria:**
- [ ] `POST/PATCH /exercises` aceita `languagePolicy` e `lockedLanguageId`
- [ ] LOCKED + `locked_language_id` inválido → 400. Locked language deve ser do próprio teacher OU do usuário-sistema
- [ ] `GET /exercises/:id` retorna `lockedLanguage` (com `customization` inline) quando LOCKED
- [ ] `POST /submissions` exige `languageSnapshot`; quando exercise é LOCKED, servidor substitui pelo snapshot da linguagem travada antes de gravar
- [ ] Submission antiga continua acessível mesmo se a linguagem original for editada ou deletada (snapshot é cópia)

**Verify:**
```bash
cd backend && uv run pytest tests/modules/test_exercise_policy.py tests/modules/test_submission_snapshot.py -v
```

**Steps:**

- [ ] **3.1 — Schemas de exercises**

Em `backend/app/schemas/exercises.py`:
```python
from app.schemas.languages import LanguageResponse
from app.models.exercise import LanguagePolicy


class ExerciseCreate(CamelModel):
    title: str
    description: str
    attachments: str = ""
    language_policy: LanguagePolicy = LanguagePolicy.OPEN
    locked_language_id: int | None = None


class ExerciseUpdate(CamelModel):
    title: str | None = None
    description: str | None = None
    attachments: str | None = None
    language_policy: LanguagePolicy | None = None
    locked_language_id: int | None = None


class ExerciseResponse(CamelModel):
    id: int
    teacher_id: int
    title: str
    description: str
    attachments: str
    language_policy: LanguagePolicy
    locked_language_id: int | None
    locked_language: LanguageResponse | None = None
    created_at: datetime
    updated_at: datetime
    test_cases: list[TestCaseResponse] = []
```

- [ ] **3.2 — Validação na service de exercises**

Em `create_exercise` e `update_exercise`, adicionar:
```python
def _validate_policy(data, teacher_id, session) -> None:
    policy = data.language_policy
    locked_id = data.locked_language_id
    if policy == LanguagePolicy.LOCKED:
        if not locked_id:
            raise HTTPException(400, "locked_language_id required when policy=LOCKED")
        lang = await session.get(Language, locked_id)
        if not lang:
            raise HTTPException(400, "locked_language not found")
        owner = await session.get(User, lang.owner_id)
        if lang.owner_id != teacher_id and owner.role != UserRole.SYSTEM:
            raise HTTPException(403, "Language must be owned by teacher or by SYSTEM user")
    elif locked_id is not None:
        raise HTTPException(400, "locked_language_id must be null when policy=OPEN")
```

Em `get_exercise`, usar `selectinload(Exercise.locked_language)` para retornar a linguagem inline.

- [ ] **3.3 — Schemas e service de submissions**

Em `backend/app/schemas/submissions.py`:
```python
class SubmissionCreate(CamelModel):
    exercise_id: int
    exercise_list_id: int
    class_id: int
    code_snapshot: str
    language_snapshot: dict[str, Any]


class SubmissionResponse(CamelModel):
    # ... campos atuais ...
    language_snapshot: dict[str, Any]
```

Em `submissions/service.py::create_submission`:
```python
exercise = await session.get(Exercise, data.exercise_id, options=[selectinload(Exercise.locked_language)])
language_snapshot = data.language_snapshot
if exercise.language_policy == LanguagePolicy.LOCKED and exercise.locked_language:
    language_snapshot = exercise.locked_language.customization  # override server-side
submission = Submission(..., language_snapshot=language_snapshot)
```

Mesma lógica em `/submissions/validate` (se houver caminho independente; senão a rota Next.js `validate.ts` chama o backend que já aplica o override).

- [ ] **3.4 — Tests**

`test_exercise_policy.py`:
- Criar OPEN com `locked_language_id` → 400
- Criar LOCKED sem `locked_language_id` → 400
- Criar LOCKED com linguagem de outro professor → 403
- Criar LOCKED com linguagem do próprio professor → ok, GET retorna `lockedLanguage` expandida
- Criar LOCKED com linguagem do usuário-sistema → ok

`test_submission_snapshot.py`:
- Submit em exercício OPEN → grava `language_snapshot` exatamente como veio
- Submit em exercício LOCKED → grava `customization` da linguagem travada, ignorando o que o cliente enviou
- Editar a linguagem travada após a submissão NÃO altera `language_snapshot` da submissão antiga

- [ ] **3.5 — Run + commit**

```bash
cd backend && uv run pytest tests/modules/test_exercise_policy.py tests/modules/test_submission_snapshot.py -v
git add backend/
git commit -m "feat(api): exercise language policy and submission snapshot"
```

```json:metadata
{"files": ["backend/app/schemas/exercises.py", "backend/app/modules/exercises/service.py", "backend/app/schemas/submissions.py", "backend/app/modules/submissions/service.py"], "verifyCommand": "cd backend && uv run pytest tests/modules/test_exercise_policy.py tests/modules/test_submission_snapshot.py -v", "acceptanceCriteria": ["policy validada na criação e update", "GET expande lockedLanguage", "submission grava snapshot, LOCKED sobrescreve server-side"], "requiresUserVerification": false}
```

---

## Task 4: Front — biblioteca de linguagens + integração no IDE

**Goal:** UI para gerenciar linguagens salvas, hidratação do `KeywordContext` a partir do backend quando logado, banner + lock no workspace de exercício LOCKED, envio do snapshot no submit.

**Files:**
- Create: `packages/ide/src/lib/languages-api.ts`
- Create: `packages/ide/src/hooks/useLanguages.ts`
- Create: `packages/ide/src/components/language-library/LanguageLibraryModal.tsx`
- Create: `packages/ide/src/components/language-library/LanguageRow.tsx`
- Create: `packages/ide/src/components/exercise-workspace/LockedLanguageBanner.tsx`
- Modify: `packages/ide/src/contexts/keyword/KeywordContext.tsx`
- Modify: `packages/ide/src/lib/keyword-language-storage.ts`
- Modify: `packages/ide/src/lib/query-keys.ts`
- Modify: form de criação/edição de exercício do professor (campos `languagePolicy`, `lockedLanguageId`)
- Modify: workspace de exercício (banner + lock + envio do snapshot)
- Test: `packages/ide/src/contexts/keyword/KeywordContext.spec.ts` (expandir)
- Test: spec novo para `LanguageLibraryModal`

**Acceptance Criteria:**
- [ ] Logado: ao montar `KeywordProvider`, busca `/users/me/active-language` e hidrata `customization`
- [ ] Deslogado: comportamento atual (defaults + localStorage) preservado
- [ ] `localStorage` continua usado como rascunho mesmo logado (sem PUT por keystroke)
- [ ] Modal "Minhas Linguagens": lista, criar, renomear, editar (abre customizador), duplicar/clone, deletar, marcar ativa
- [ ] Em exercício LOCKED: editor pré-carregado com `lockedLanguage.customization`, seletor desabilitado, banner visível com botão "Clonar para meu acervo"
- [ ] Submit envia `languageSnapshot = customization` atual
- [ ] Form de exercício do professor expõe toggle `Aberto/Travado` + select de linguagem

**Verify:**
```bash
cd packages/ide && npm run lint && npm test -- keyword
```

**Steps:**

- [ ] **4.1 — Cliente HTTP**

`packages/ide/src/lib/languages-api.ts`:
```typescript
import { api } from "@/lib/api";
import type { StoredKeywordCustomization } from "@/contexts/keyword/types";

export type LanguageSummary = {
  id: number;
  name: string;
  description: string | null;
  clonedFromId: number | null;
  updatedAt: string;
};

export type Language = LanguageSummary & {
  ownerId: number;
  customization: StoredKeywordCustomization;
  createdAt: string;
};

export const languagesApi = {
  list: () => api.get<LanguageSummary[]>("/languages").then(r => r.data),
  get: (id: number) => api.get<Language>(`/languages/${id}`).then(r => r.data),
  create: (body: { name: string; description?: string; customization: StoredKeywordCustomization }) =>
    api.post<Language>("/languages", body).then(r => r.data),
  update: (id: number, body: Partial<{ name: string; description: string; customization: StoredKeywordCustomization }>) =>
    api.patch<Language>(`/languages/${id}`, body).then(r => r.data),
  delete: (id: number) => api.delete(`/languages/${id}`),
  clone: (id: number) => api.post<Language>(`/languages/${id}/clone`).then(r => r.data),

  getActive: () => api.get<Language | null>("/users/me/active-language").then(r => r.data),
  setActive: (languageId: number | null) =>
    api.put<Language | null>("/users/me/active-language", { languageId }).then(r => r.data),
};
```

- [ ] **4.2 — Hooks**

`packages/ide/src/hooks/useLanguages.ts` com TanStack Query (`useQuery`/`useMutation`), keys em `query-keys.ts`:
```typescript
export const languageKeys = {
  all: ["languages"] as const,
  detail: (id: number) => ["languages", id] as const,
  active: ["languages", "active"] as const,
};
```

Hooks: `useLanguagesList`, `useLanguageDetail(id)`, `useActiveLanguage`, `useCreateLanguage`, `useUpdateLanguage`, `useDeleteLanguage`, `useCloneLanguage`, `useSetActiveLanguage`. Invalidar chaves após mutations.

- [ ] **4.3 — KeywordContext logado/deslogado**

Em `KeywordContext.tsx`:
- Adicionar dependência de `useAuth()` (ou equivalente)
- Estado novo: `activeLanguageId: number | null`, `isDirty: boolean`
- Em `useEffect` de hidratação: se logado, chamar `languagesApi.getActive()`; se retornar linguagem, hidratar `customization` com `lang.customization` e setar `activeLanguageId`. Se não logado ou retorno nulo, manter comportamento atual (localStorage).
- `localStorage` segue como rascunho sempre (chave atual).
- Novo método `saveCurrentAsLanguage(name, description?)` → POST.
- Novo método `saveActiveLanguage()` → PATCH na linguagem ativa com `customization` atual.
- Novo método `setActiveLanguageId(id)` → PUT + hidratar customization.
- Manter API antiga (`buildKeywordMap`, `buildLexerConfig`, etc.) sem regressão.

- [ ] **4.4 — Modal `LanguageLibraryModal`**

Componente shadcn-style: dialog com tabela de linguagens, ações por linha (editar nome, abrir customizador para essa linguagem, clonar, deletar, "Tornar ativa"). Botão "Nova linguagem" abre input para nome → cria com `customization` atual ou defaults.

`LanguageRow` é o item da lista.

Acessível a partir do customizador de keywords e do menu do usuário.

- [ ] **4.5 — Form de exercício do professor**

Localizar o componente de criação/edição (provável `packages/ide/src/views/exercises/...` — explorar). Adicionar:
- `Select` ou `RadioGroup` para `languagePolicy` (Aberto / Travado em uma linguagem)
- Se Travado: `Combobox` carregando linguagens do professor + linguagens do usuário-sistema (extender API se preciso: `GET /languages?include=system` ou separar endpoint `/languages/system`)
- Validação client-side: LOCKED exige select

- [ ] **4.6 — Banner + lock no workspace de exercício**

`LockedLanguageBanner.tsx`: exibe nome da linguagem, descrição opcional e botão "Clonar para meu acervo" (chama `useCloneLanguage`, mostra toast com link "Ver em Minhas Linguagens").

No workspace:
- Ao montar, ler `exercise.lockedLanguage`. Se presente, sobrepor o `customization` do `KeywordContext` (usar método novo `applyExerciseLanguage(customization)`), desabilitar seletor de linguagem do usuário, exibir banner.
- Ao desmontar (sair do exercício), restaurar a `activeLanguage` do usuário (se logado) ou o estado anterior do rascunho.

- [ ] **4.7 — Envio do snapshot no submit**

No hook/handler de submit, montar body:
```typescript
{
  exerciseId,
  exerciseListId,
  classId,
  codeSnapshot,
  languageSnapshot: keywordContext.customization,
}
```

Server reescreve quando LOCKED — nenhum tratamento adicional do client.

- [ ] **4.8 — Tests do front**

Estender `KeywordContext.spec.ts`:
- Mock `languagesApi.getActive` → hidrata com linguagem
- Sem auth → fallback localStorage
- `saveCurrentAsLanguage` → POST + invalidar

Spec novo: `LanguageLibraryModal` renderiza lista, dispara delete/clone/setActive.

- [ ] **4.9 — Lint + tests + commit**

```bash
cd packages/ide && npm run lint && npm test
git add packages/ide/
git commit -m "feat(ide): language library modal, KeywordContext backend integration, exercise lock"
```

```json:metadata
{"files": ["packages/ide/src/lib/languages-api.ts", "packages/ide/src/hooks/useLanguages.ts", "packages/ide/src/components/language-library/LanguageLibraryModal.tsx", "packages/ide/src/contexts/keyword/KeywordContext.tsx", "packages/ide/src/components/exercise-workspace/LockedLanguageBanner.tsx"], "verifyCommand": "cd packages/ide && npm run lint && npm test -- keyword", "acceptanceCriteria": ["logado hidrata do backend, deslogado mantém localStorage", "modal CRUD/clone/active funciona", "exercise LOCKED força language, banner e clone visíveis", "submit envia languageSnapshot"], "requiresUserVerification": false}
```

---

## Self-Review

- **Spec coverage:** ✅ Modelo (Task 1), API `/languages` + active + clone (Task 2), policy + snapshot + override (Task 3), KeywordContext + modal + lock + submit (Task 4). Read-gate, RESTRICT em delete, usuário-sistema, ENUM `userrole.SYSTEM` cobertos.
- **Placeholder scan:** Sem TBD/TODO. Há um ponto a refinar na execução (Task 4.5): localizar o form exato de criação de exercício do professor — implementador deve grep `ExerciseForm`/`useCreateExercise` no `packages/ide/src/views/`.
- **Type consistency:** `LanguagePolicy`, `LanguageResponse`, `language_snapshot/languageSnapshot` (camelCase no front via `CamelModel`) consistentes entre tasks.
- **Verification scan:** Prompt original não pede confirmação humana sobre o resultado. **NO** — sem task de `requiresUserVerification`.