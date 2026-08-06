# Linguagem por Lista de Exercícios — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que o professor trave uma lista de exercícios inteira numa linguagem sua, mantendo o exercício com trava própria por cima e o caminho livre em que o aluno usa a linguagem dele.

**Architecture:** `exercise_lists` ganha as mesmas duas colunas de política que `exercises` já tem. A regra de precedência ("exercício vence, lista preenche o resto") vira uma função pura num módulo novo, `app/modules/languages/policy.py`, consumida pelo endpoint do exercício, pelo snapshot da submissão e pelo read-gate — nenhum consumidor reimplementa a regra. O front recebe a linguagem já resolvida em `effectiveLanguage` e nunca decide sozinho.

**Tech Stack:** FastAPI + SQLAlchemy async + Alembic (backend); pytest-asyncio + httpx sobre SQLite in-memory (testes backend); Next.js Pages Router + React 19 + TanStack Query + react-hook-form + zod + Tailwind v4 (front); Vitest + jsdom + `createRoot`/`act` (testes front).

**User Verification:** NO — o spec não pede confirmação humana. A verificação é por testes automatizados.

**Spec:** `docs/superpowers/specs/2026-08-06-linguagem-por-lista-de-exercicios-design.md`

---

## Contexto que o executor precisa saber

**O nível do exercício já está entregue e não muda.** `exercises.language_policy` + `locked_language_id`, a validação de dono, o snapshot na submissão, o read-gate e o seletor no form de exercício já existem e funcionam. Este plano só adiciona o nível da lista e centraliza a regra.

**Convenções do repositório que não são óbvias:**

- Os schemas Pydantic herdam de `CamelModel` (`backend/app/schemas/base.py`): Python usa `snake_case`, o JSON sai em `camelCase`, e `populate_by_name=True` faz os testes aceitarem os dois. Por isso os testes existentes mandam `{"exercise_id": ...}` e leem `data["languagePolicy"]`.
- Query params no FastAPI deste repo usam `alias` camelCase: `Query(default=None, alias="classId")`. Siga o padrão.
- **Os testes não rodam as migrations.** `tests/conftest.py:32` usa `Base.metadata.create_all` sobre SQLite in-memory. Uma migration quebrada passa na suíte inteira. O único jeito de verificar a migration é `uv run alembic upgrade head` contra o Postgres de dev.
- No SQLite o `Enum` do SQLAlchemy vira `VARCHAR`; o problema de tipo enum duplicado só existe no Postgres.
- O front chama a FastAPI **direto** via `lib/api`. Não crie `pages/api/exercise-lists/*`.
- Testes React neste repo **não usam @testing-library**. O padrão é o docblock `// @vitest-environment jsdom` na primeira linha, `createRoot` + `act`, e query por `container.querySelector`. Referência canônica: `packages/ide/src/views/dashboard/sidebar.spec.tsx`.
- `vitest.integration.config.ts` tem uma lista `include` **explícita**. `src/views/**` e `src/hooks/**` estão lá; `src/components/**` só entra arquivo a arquivo. Specs novos vão para `views/` ou `hooks/`.
- Ao mockar `lucide-react` com `vi.mock`, enumere **todos** os ícones que o componente sob teste importa, senão o import quebra.

**Comandos:**

```bash
# backend
cd backend && uv run pytest tests/ -v
cd backend && uv run alembic upgrade head

# front
cd packages/ide && npx tsc --noEmit
cd packages/ide && npm run test
cd packages/ide && npx vitest run --config vitest.integration.config.ts <caminho-do-spec>
```

---

## File Structure

**Backend**

| Arquivo | Responsabilidade | Ação |
|---|---|---|
| `backend/app/models/language.py` | Passa a ser a casa de `LanguagePolicy` e do objeto `Enum` compartilhado | modificar |
| `backend/app/models/exercise.py` | Re-exporta `LanguagePolicy`, usa o `Enum` compartilhado | modificar |
| `backend/app/models/exercise_list.py` | Ganha as duas colunas e a relação | modificar |
| `backend/migrations/versions/d4e5f6a7b8c9_exercise_list_language_policy.py` | Colunas + FK + CHECK, reusando o enum do Postgres | criar |
| `backend/app/modules/languages/policy.py` | Validação da política e regra de precedência | criar |
| `backend/app/modules/exercises/service.py` | Importa a validação; ganha `get_exercise_in_context` | modificar |
| `backend/app/modules/exercises/router.py` | `list_id` no GET, monta `effectiveLanguage` | modificar |
| `backend/app/schemas/exercises.py` | Dois campos novos no response | modificar |
| `backend/app/schemas/exercise_lists.py` | `ExerciseListUpdate`; política no response | modificar |
| `backend/app/modules/exercise_lists/service.py` | `update_exercise_list`; carregar `locked_language` | modificar |
| `backend/app/modules/exercise_lists/router.py` | `PATCH /{list_id}` | modificar |
| `backend/app/modules/languages/service.py` | Read-gate e delete guard enxergam a lista | modificar |
| `backend/app/modules/submissions/service.py` | Snapshot usa a resolução compartilhada | modificar |
| `backend/tests/factories.py` | `create_exercise_list` aceita política | modificar |
| `backend/tests/test_exercise_list_policy.py` | Toda a cobertura nova | criar |

**Front**

| Arquivo | Responsabilidade | Ação |
|---|---|---|
| `packages/ide/src/components/language-policy-field.tsx` | Rádio OPEN/LOCKED + select, controlado | criar |
| `packages/ide/src/views/exercises/components/create-exercise-modal.tsx` | Passa a consumir o componente | modificar |
| `packages/ide/src/types/api.ts` | Campos novos em `Exercise` e `ExerciseList` | modificar |
| `packages/ide/src/hooks/use-api-queries.ts` | `listId` na query do exercício; mutation de update da lista | modificar |
| `packages/ide/src/views/exercise-lists/components/create-list-modal.tsx` | Campo na criação | modificar |
| `packages/ide/src/views/exercise-lists/components/list-language-panel.tsx` | Painel de edição | criar |
| `packages/ide/src/views/exercise-lists/components/list-language-panel.spec.tsx` | Spec do painel | criar |
| `packages/ide/src/views/exercise-lists/components/teacher-detail-view.tsx` | Monta o painel | modificar |
| `packages/ide/src/components/exercise-workspace/LockedLanguageBanner.tsx` | Diz a origem da trava | modificar |
| `packages/ide/src/views/ide/components/locked-language-banner.spec.tsx` | Spec do banner | criar |
| `packages/ide/src/pages/exercises/workspace.tsx` | Usa `effectiveLanguage` | modificar |

---

### Task 1: Colunas de política em `exercise_lists`

**Goal:** `exercise_lists` guarda `language_policy` e `locked_language_id` com a mesma check constraint de `exercises`, e `LanguagePolicy` passa a morar em `models/language.py`.

**Files:**
- Modify: `backend/app/models/language.py`
- Modify: `backend/app/models/exercise.py:1-49`
- Modify: `backend/app/models/exercise_list.py`
- Create: `backend/migrations/versions/d4e5f6a7b8c9_exercise_list_language_policy.py`
- Modify: `backend/tests/factories.py:71-79`

**Acceptance Criteria:**
- [ ] `LanguagePolicy` importável de `app.models.language` **e** de `app.models.exercise` (compatibilidade)
- [ ] `ExerciseList.language_policy` default `OPEN`, server_default `'OPEN'`
- [ ] `ExerciseList.locked_language_id` FK com `ON DELETE RESTRICT`
- [ ] CHECK `ck_exercise_lists_locked_language_consistency`
- [ ] Os dois modelos compartilham **o mesmo objeto** `Enum`, para o Postgres não tentar criar `languagepolicy` duas vezes
- [ ] A suíte inteira segue verde sem edição de teste existente

**Verify:** `cd backend && uv run pytest tests/ -v` → todos passam

**Steps:**

- [ ] **Step 1: Mover `LanguagePolicy` para `models/language.py`**

Acrescente no topo de `backend/app/models/language.py`, depois dos imports existentes (e adicione `import enum` e `Enum` ao import do sqlalchemy):

```python
import enum
from sqlalchemy import Enum as SAEnum


class LanguagePolicy(str, enum.Enum):
    OPEN = "OPEN"
    LOCKED = "LOCKED"


# Um único objeto Enum compartilhado por `exercises` e `exercise_lists`.
# Duas instâncias com o mesmo `name` fariam o Postgres receber dois
# CREATE TYPE languagepolicy. `native_enum` continua ligado: no SQLite dos
# testes ele degrada para VARCHAR sozinho.
language_policy_type = SAEnum(LanguagePolicy, name="languagepolicy")
```

- [ ] **Step 2: `models/exercise.py` passa a importar em vez de definir**

Remova a definição local da classe (`backend/app/models/exercise.py:16-18`) e o `import enum` e `Enum` que ficarem sem uso. No lugar:

```python
from app.models.language import LanguagePolicy, language_policy_type  # noqa: F401

__all__ = ["Exercise", "LanguagePolicy"]
```

E troque a coluna (`backend/app/models/exercise.py:36-38`) para usar o tipo compartilhado:

```python
    language_policy: Mapped[LanguagePolicy] = mapped_column(
        language_policy_type, nullable=False, default=LanguagePolicy.OPEN, server_default="OPEN"
    )
```

O `if TYPE_CHECKING: from app.models.language import Language` que já existe continua — o import novo é em runtime e não cria ciclo, porque `language.py` não importa `exercise.py`.

- [ ] **Step 3: Colunas no `ExerciseList`**

Em `backend/app/models/exercise_list.py`, troque o `__table_args__` e acrescente as colunas e a relação:

```python
from sqlalchemy import CheckConstraint, Integer, String, ForeignKey, Index, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.language import LanguagePolicy, language_policy_type

if TYPE_CHECKING:
    from app.models.language import Language


class ExerciseList(Base):
    __tablename__ = "exercise_lists"
    __table_args__ = (
        Index("ix_exercise_lists_teacher_id", "teacher_id"),
        CheckConstraint(
            "(language_policy = 'LOCKED') = (locked_language_id IS NOT NULL)",
            name="ck_exercise_lists_locked_language_consistency",
        ),
    )

    # ... colunas existentes ...

    language_policy: Mapped[LanguagePolicy] = mapped_column(
        language_policy_type, nullable=False, default=LanguagePolicy.OPEN, server_default="OPEN"
    )
    locked_language_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("languages.id", ondelete="RESTRICT"), nullable=True
    )

    # ... relações existentes ...

    locked_language: Mapped["Language | None"] = relationship("Language")
```

- [ ] **Step 4: Migration**

Crie `backend/migrations/versions/d4e5f6a7b8c9_exercise_list_language_policy.py`:

```python
"""exercise list language policy

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-08-06 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "d4e5f6a7b8c9"
down_revision: Union[str, Sequence[str], None] = "c3d4e5f6a7b8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# create_type=False: o tipo `languagepolicy` já foi criado em b2c3d4e5f6a7.
language_policy_enum = postgresql.ENUM(
    "OPEN", "LOCKED", name="languagepolicy", create_type=False
)


def _apply_search_path() -> None:
    schema_name = op.get_context().config.get_main_option("schema_name") or "public"
    if schema_name != "public":
        schema_escaped = schema_name.replace('"', '""')
        op.execute(sa.text(f'SET search_path TO "{schema_escaped}"'))


def upgrade() -> None:
    """Upgrade schema."""
    _apply_search_path()

    bind = op.get_bind()
    policy_type = (
        language_policy_enum
        if bind.dialect.name == "postgresql"
        else sa.Enum("OPEN", "LOCKED", name="languagepolicy")
    )

    # server_default 'OPEN': listas criadas antes desta migration continuam
    # válidas e passam a significar "aluno usa a própria linguagem".
    op.add_column(
        "exercise_lists",
        sa.Column("language_policy", policy_type, nullable=False, server_default="OPEN"),
    )
    op.add_column(
        "exercise_lists", sa.Column("locked_language_id", sa.Integer(), nullable=True)
    )
    op.create_foreign_key(
        "fk_exercise_lists_locked_language_id",
        "exercise_lists",
        "languages",
        ["locked_language_id"],
        ["id"],
        ondelete="RESTRICT",
    )
    op.create_check_constraint(
        "ck_exercise_lists_locked_language_consistency",
        "exercise_lists",
        "(language_policy = 'LOCKED') = (locked_language_id IS NOT NULL)",
    )


def downgrade() -> None:
    """Downgrade schema."""
    _apply_search_path()

    op.drop_constraint(
        "ck_exercise_lists_locked_language_consistency", "exercise_lists", type_="check"
    )
    op.drop_constraint(
        "fk_exercise_lists_locked_language_id", "exercise_lists", type_="foreignkey"
    )
    op.drop_column("exercise_lists", "locked_language_id")
    op.drop_column("exercise_lists", "language_policy")
    # O tipo `languagepolicy` NÃO é dropado: `exercises` ainda o usa.
```

- [ ] **Step 5: Factory aceita a política**

Em `backend/tests/factories.py`, troque `create_exercise_list`:

```python
async def create_exercise_list(session: AsyncSession, teacher, **kwargs) -> ExerciseList:
    el = ExerciseList(
        teacher_id=teacher.id,
        title=kwargs.get("title", fake.sentence()),
        description=kwargs.get("description", fake.sentence()),
        language_policy=kwargs.get("language_policy", LanguagePolicy.OPEN),
        locked_language_id=kwargs.get("locked_language_id", None),
    )
    session.add(el)
    await session.flush()
    return el
```

E acrescente ao bloco de imports do arquivo:

```python
from app.models.language import LanguagePolicy
```

- [ ] **Step 6: Rodar a suíte inteira**

Run: `cd backend && uv run pytest tests/ -v`
Expected: PASS em tudo. Se algo quebrar, é o import de `LanguagePolicy` que ficou pendurado em algum módulo — corrija o import, não o teste.

- [ ] **Step 7: Verificar a migration contra o Postgres de dev**

Run: `cd backend && uv run alembic upgrade head`
Expected: sai sem erro. Um `DuplicateObject: type "languagepolicy" already exists` significa que o `create_type=False` não pegou.

Depois: `cd backend && uv run alembic downgrade -1 && uv run alembic upgrade head`
Expected: os dois sem erro — confirma que o downgrade não derruba o tipo que `exercises` ainda usa.

- [ ] **Step 8: Commit**

```bash
git add backend/app/models backend/migrations/versions/d4e5f6a7b8c9_exercise_list_language_policy.py backend/tests/factories.py
git commit -m "feat(backend): politica de linguagem na lista de exercicios"
```

```json:metadata
{"files": ["backend/app/models/language.py", "backend/app/models/exercise.py", "backend/app/models/exercise_list.py", "backend/migrations/versions/d4e5f6a7b8c9_exercise_list_language_policy.py", "backend/tests/factories.py"], "verifyCommand": "cd backend && uv run pytest tests/ -v", "acceptanceCriteria": ["LanguagePolicy importavel dos dois modulos", "default OPEN com server_default", "FK ON DELETE RESTRICT", "check constraint", "Enum compartilhado entre os dois modelos", "suite verde sem editar teste"], "requiresUserVerification": false}
```

---

### Task 2: `policy.py` — validação e precedência num lugar só

**Goal:** A validação da política e a regra "exercício vence, lista preenche o resto" existem em uma função cada, e `exercises/service.py` passa a consumi-las.

**Files:**
- Create: `backend/app/modules/languages/policy.py`
- Modify: `backend/app/modules/exercises/service.py:1-42, 50, 104`
- Create: `backend/tests/test_exercise_list_policy.py`

**Acceptance Criteria:**
- [ ] `validate_language_policy` extraída sem mudança de comportamento
- [ ] `resolve_effective_language` cobre as 4 combinações da matriz
- [ ] Devolve tupla `(Language | None, "exercise" | "list" | None)`
- [ ] É função pura e síncrona — sem `await`, sem I/O
- [ ] `tests/test_exercise_policy_and_snapshot.py` segue verde **sem edição**

**Verify:** `cd backend && uv run pytest tests/test_exercise_list_policy.py tests/test_exercise_policy_and_snapshot.py -v` → todos passam

**Steps:**

- [ ] **Step 1: Escrever o teste da matriz**

Crie `backend/tests/test_exercise_list_policy.py`:

```python
import os

os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only-not-for-production")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")

from app.models.exercise import Exercise
from app.models.exercise_list import ExerciseList
from app.models.language import Language, LanguagePolicy
from app.modules.languages.policy import resolve_effective_language


def _lang(name: str) -> Language:
    return Language(id=1, owner_id=1, name=name, customization={"n": name})


def _exercise(policy: LanguagePolicy, language: Language | None) -> Exercise:
    ex = Exercise(teacher_id=1, title="t", description="d", attachments="")
    ex.language_policy = policy
    ex.locked_language = language
    ex.locked_language_id = language.id if language else None
    return ex


def _list(policy: LanguagePolicy, language: Language | None) -> ExerciseList:
    el = ExerciseList(teacher_id=1, title="t", description="d")
    el.language_policy = policy
    el.locked_language = language
    el.locked_language_id = language.id if language else None
    return el


class TestResolveEffectiveLanguage:
    def test_exercise_lock_wins_over_list_lock(self):
        x, y = _lang("X"), _lang("Y")
        effective, source = resolve_effective_language(
            _exercise(LanguagePolicy.LOCKED, y), _list(LanguagePolicy.LOCKED, x)
        )
        assert effective is y
        assert source == "exercise"

    def test_open_exercise_inherits_list_lock(self):
        x = _lang("X")
        effective, source = resolve_effective_language(
            _exercise(LanguagePolicy.OPEN, None), _list(LanguagePolicy.LOCKED, x)
        )
        assert effective is x
        assert source == "list"

    def test_exercise_lock_applies_with_open_list(self):
        y = _lang("Y")
        effective, source = resolve_effective_language(
            _exercise(LanguagePolicy.LOCKED, y), _list(LanguagePolicy.OPEN, None)
        )
        assert effective is y
        assert source == "exercise"

    def test_both_open_leaves_student_free(self):
        effective, source = resolve_effective_language(
            _exercise(LanguagePolicy.OPEN, None), _list(LanguagePolicy.OPEN, None)
        )
        assert effective is None
        assert source is None

    def test_no_list_falls_back_to_exercise_only(self):
        y = _lang("Y")
        assert resolve_effective_language(_exercise(LanguagePolicy.LOCKED, y), None) == (y, "exercise")
        assert resolve_effective_language(_exercise(LanguagePolicy.OPEN, None), None) == (None, None)
```

- [ ] **Step 2: Rodar para ver falhar**

Run: `cd backend && uv run pytest tests/test_exercise_list_policy.py -v`
Expected: FAIL com `ModuleNotFoundError: No module named 'app.modules.languages.policy'`

- [ ] **Step 3: Escrever `policy.py`**

Crie `backend/app/modules/languages/policy.py`:

```python
from typing import Literal

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.exercise import Exercise
from app.models.exercise_list import ExerciseList
from app.models.language import Language, LanguagePolicy
from app.models.user import User, UserRole

EffectiveSource = Literal["exercise", "list"]


async def validate_language_policy(
    teacher_id: int,
    policy: LanguagePolicy,
    locked_language_id: int | None,
    session: AsyncSession,
) -> None:
    """Valida o par (política, linguagem) de um exercício ou de uma lista.

    Mesma regra nos dois níveis: só o dono da linguagem, ou qualquer um sobre
    uma linguagem do usuário SYSTEM, pode travar nela.
    """
    if policy == LanguagePolicy.LOCKED:
        if locked_language_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="locked_language_id is required when language_policy=LOCKED",
            )
        language = await session.get(Language, locked_language_id)
        if language is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="locked_language not found"
            )
        owner = await session.get(User, language.owner_id)
        if language.owner_id != teacher_id and (owner is None or owner.role != UserRole.SYSTEM):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Locked language must be owned by the teacher or by the SYSTEM user",
            )
    else:  # OPEN
        if locked_language_id is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="locked_language_id must be null when language_policy=OPEN",
            )


def resolve_effective_language(
    exercise: Exercise,
    exercise_list: ExerciseList | None,
) -> tuple[Language | None, EffectiveSource | None]:
    """Qual linguagem o aluno usa para resolver este exercício nesta lista.

    O mais específico vence: a trava do exercício sobrepõe a da lista, porque
    o mesmo exercício é reusável em várias listas e a trava dele costuma ser
    parte do enunciado. A lista trava apenas os itens OPEN.

    `None` significa livre: o aluno usa a linguagem ativa dele.

    Pura e síncrona de propósito — as duas entidades chegam com
    `locked_language` já carregada por `selectinload`.
    """
    if (
        exercise.language_policy == LanguagePolicy.LOCKED
        and exercise.locked_language is not None
    ):
        return exercise.locked_language, "exercise"
    if (
        exercise_list is not None
        and exercise_list.language_policy == LanguagePolicy.LOCKED
        and exercise_list.locked_language is not None
    ):
        return exercise_list.locked_language, "list"
    return None, None
```

- [ ] **Step 4: Rodar para ver passar**

Run: `cd backend && uv run pytest tests/test_exercise_list_policy.py -v`
Expected: PASS nos 5 testes

- [ ] **Step 5: `exercises/service.py` passa a importar**

Em `backend/app/modules/exercises/service.py`, apague a função local `_validate_language_policy` (linhas 14-42) e acrescente ao bloco de imports:

```python
from app.modules.languages.policy import validate_language_policy
```

Troque as duas chamadas:

```python
# em create_exercise (linha ~50)
    await validate_language_policy(
        current_user_id, data.language_policy, data.locked_language_id, session
    )

# em update_exercise (linha ~104)
    await validate_language_policy(current_user_id, next_policy, next_locked, session)
```

Remova de `exercises/service.py` os imports que ficaram sem uso: `Language`, `User`, `UserRole` e `LanguagePolicy` — confira com `grep -n "Language\|UserRole" app/modules/exercises/service.py` antes de apagar, porque `Exercise` continua importado da mesma linha.

- [ ] **Step 6: Confirmar que nada regrediu**

Run: `cd backend && uv run pytest tests/test_exercise_policy_and_snapshot.py tests/test_languages.py -v`
Expected: PASS, **sem nenhuma edição nesses arquivos**. Se um deles quebrar, a extração mudou comportamento — corrija `policy.py`.

- [ ] **Step 7: Commit**

```bash
git add backend/app/modules/languages/policy.py backend/app/modules/exercises/service.py backend/tests/test_exercise_list_policy.py
git commit -m "refactor(backend): centralizar validacao e precedencia da linguagem"
```

```json:metadata
{"files": ["backend/app/modules/languages/policy.py", "backend/app/modules/exercises/service.py", "backend/tests/test_exercise_list_policy.py"], "verifyCommand": "cd backend && uv run pytest tests/test_exercise_list_policy.py tests/test_exercise_policy_and_snapshot.py -v", "acceptanceCriteria": ["validate extraida sem mudanca", "resolve cobre as 4 combinacoes", "devolve tupla com source", "funcao pura e sincrona", "testes existentes verdes sem edicao"], "requiresUserVerification": false}
```

---

### Task 3: `PATCH /exercise-lists/{id}` e política na resposta

**Goal:** O professor dono edita título, descrição e política da lista; o `GET` devolve a linguagem travada expandida.

**Files:**
- Modify: `backend/app/schemas/exercise_lists.py`
- Modify: `backend/app/modules/exercise_lists/service.py:14-58`
- Modify: `backend/app/modules/exercise_lists/router.py`
- Modify: `backend/tests/test_exercise_list_policy.py`

**Acceptance Criteria:**
- [ ] `PATCH` só pelo professor dono; 404 caso contrário
- [ ] `LOCKED` sem `lockedLanguageId` → 400
- [ ] `OPEN` com `lockedLanguageId` → 400
- [ ] Linguagem de outro professor → 403
- [ ] `PATCH` só de `title` preserva a política
- [ ] Lista publicada e com submissão pode ser editada → 200
- [ ] `GET` traz `lockedLanguage` expandida

**Verify:** `cd backend && uv run pytest tests/test_exercise_list_policy.py tests/test_exercise_lists.py -v` → todos passam

**Steps:**

- [ ] **Step 1: Escrever os testes do PATCH**

Acrescente ao fim de `backend/tests/test_exercise_list_policy.py`:

```python
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.class_member import ClassMember
from app.models.user import UserRole
from tests.factories import (
    create_class,
    create_class_exercise_list,
    create_exercise,
    create_exercise_list,
    create_organization,
    create_user,
)

CUSTOM = {"mappings": [{"original": "if", "custom": "se", "tokenId": 28}]}


def _auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


async def _login(async_client: AsyncClient, email: str, password: str = "secret") -> str:
    r = await async_client.post("/auth/login", json={"email": email, "password": password})
    return r.json()["accessToken"]


async def _teacher(async_client, async_session, email="tl@x.com"):
    org = await create_organization(async_session)
    user = await create_user(
        async_session, org, email=email, password="secret", role=UserRole.TEACHER
    )
    return user, await _login(async_client, email), org


async def _language(async_session, owner, name="Portugolzinho") -> Language:
    lang = Language(owner_id=owner.id, name=name, customization=CUSTOM)
    async_session.add(lang)
    await async_session.flush()
    return lang


class TestPatchExerciseList:
    async def test_owner_locks_the_list(self, async_client, async_session):
        teacher, token, _ = await _teacher(async_client, async_session)
        lang = await _language(async_session, teacher)
        el = await create_exercise_list(async_session, teacher)

        r = await async_client.patch(
            f"/exercise-lists/{el.id}",
            json={"languagePolicy": "LOCKED", "lockedLanguageId": lang.id},
            headers=_auth(token),
        )
        assert r.status_code == 200
        data = r.json()
        assert data["languagePolicy"] == "LOCKED"
        assert data["lockedLanguageId"] == lang.id
        assert data["lockedLanguage"]["customization"] == CUSTOM

    async def test_non_owner_gets_404(self, async_client, async_session):
        teacher, _, _ = await _teacher(async_client, async_session, email="owner@x.com")
        _, other_token, _ = await _teacher(async_client, async_session, email="other@x.com")
        el = await create_exercise_list(async_session, teacher)

        r = await async_client.patch(
            f"/exercise-lists/{el.id}",
            json={"title": "roubado"},
            headers=_auth(other_token),
        )
        assert r.status_code == 404

    async def test_locked_without_language_returns_400(self, async_client, async_session):
        teacher, token, _ = await _teacher(async_client, async_session)
        el = await create_exercise_list(async_session, teacher)

        r = await async_client.patch(
            f"/exercise-lists/{el.id}",
            json={"languagePolicy": "LOCKED"},
            headers=_auth(token),
        )
        assert r.status_code == 400

    async def test_open_with_language_returns_400(self, async_client, async_session):
        teacher, token, _ = await _teacher(async_client, async_session)
        lang = await _language(async_session, teacher)
        el = await create_exercise_list(async_session, teacher)

        r = await async_client.patch(
            f"/exercise-lists/{el.id}",
            json={"languagePolicy": "OPEN", "lockedLanguageId": lang.id},
            headers=_auth(token),
        )
        assert r.status_code == 400

    async def test_other_teachers_language_returns_403(self, async_client, async_session):
        teacher_a, _, _ = await _teacher(async_client, async_session, email="a2@x.com")
        teacher_b, token_b, _ = await _teacher(async_client, async_session, email="b2@x.com")
        lang = await _language(async_session, teacher_a)
        el = await create_exercise_list(async_session, teacher_b)

        r = await async_client.patch(
            f"/exercise-lists/{el.id}",
            json={"languagePolicy": "LOCKED", "lockedLanguageId": lang.id},
            headers=_auth(token_b),
        )
        assert r.status_code == 403

    async def test_partial_patch_preserves_policy(self, async_client, async_session):
        teacher, token, _ = await _teacher(async_client, async_session)
        lang = await _language(async_session, teacher)
        el = await create_exercise_list(
            async_session, teacher, language_policy=LanguagePolicy.LOCKED,
            locked_language_id=lang.id,
        )

        r = await async_client.patch(
            f"/exercise-lists/{el.id}",
            json={"title": "novo titulo"},
            headers=_auth(token),
        )
        assert r.status_code == 200
        data = r.json()
        assert data["title"] == "novo titulo"
        assert data["languagePolicy"] == "LOCKED"
        assert data["lockedLanguageId"] == lang.id

    async def test_published_list_can_still_change_language(self, async_client, async_session):
        teacher, token, org = await _teacher(async_client, async_session, email="pub@x.com")
        lang = await _language(async_session, teacher)
        el = await create_exercise_list(async_session, teacher)
        cls = await create_class(async_session, org, teacher)
        await create_class_exercise_list(async_session, el, cls)

        r = await async_client.patch(
            f"/exercise-lists/{el.id}",
            json={"languagePolicy": "LOCKED", "lockedLanguageId": lang.id},
            headers=_auth(token),
        )
        assert r.status_code == 200
```

- [ ] **Step 2: Rodar para ver falhar**

Run: `cd backend && uv run pytest tests/test_exercise_list_policy.py -k Patch -v`
Expected: FAIL — o PATCH devolve 405 Method Not Allowed

- [ ] **Step 3: Schemas**

Em `backend/app/schemas/exercise_lists.py`, acrescente os imports e o schema novo, e estenda o response:

```python
from app.models.language import LanguagePolicy
from app.schemas.languages import LanguageResponse


class ExerciseListUpdate(CamelModel):
    title: str | None = None
    description: str | None = None
    language_policy: LanguagePolicy | None = None
    locked_language_id: int | None = None


class ExerciseListResponse(CamelModel):
    id: int
    teacher_id: int
    title: str
    description: str | None
    language_policy: LanguagePolicy
    locked_language_id: int | None = None
    locked_language: LanguageResponse | None = None
    created_at: datetime
    updated_at: datetime
    items: list[ExerciseListItemResponse]
    classes: list[ClassPublicationResponse]
    submitted_exercise_ids: list[int] = []
```

- [ ] **Step 4: Service**

Em `backend/app/modules/exercise_lists/service.py`, acrescente `selectinload(ExerciseList.locked_language)` às `options` **das duas** queries (`list_exercise_lists` linha ~18 e `get_exercise_list` linha ~43):

```python
        .options(
            selectinload(ExerciseList.items).selectinload(ExerciseListItem.exercise),
            selectinload(ExerciseList.classes),
            selectinload(ExerciseList.locked_language),
        )
```

E acrescente a função nova ao fim do arquivo:

```python
async def update_exercise_list(
    list_id: int,
    caller_id: int,
    data: ExerciseListUpdate,
    session: AsyncSession,
) -> ExerciseList:
    el = await get_exercise_list(list_id, session)
    if el.teacher_id != caller_id:
        # 404 e não 403: o resto do módulo não distingue "não existe" de
        # "não é seu" para quem não é dono.
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Exercise list not found"
        )

    payload = data.model_dump(exclude_unset=True)
    next_policy = payload.get("language_policy", el.language_policy)
    next_locked = payload.get("locked_language_id", el.locked_language_id)
    await validate_language_policy(caller_id, next_policy, next_locked, session)

    for field, value in payload.items():
        setattr(el, field, value)

    await session.flush()
    return await get_exercise_list(list_id, session)
```

Com os imports:

```python
from app.modules.languages.policy import validate_language_policy
from app.schemas.exercise_lists import ExerciseListUpdate
```

- [ ] **Step 5: Router**

Em `backend/app/modules/exercise_lists/router.py`, acrescente ao import do service `update_exercise_list`, ao import dos schemas `ExerciseListUpdate`, e o endpoint depois do `GET /{list_id}`:

```python
@router.patch("/{list_id}", response_model=ExerciseListResponse)
async def update_exercise_list_endpoint(
    list_id: int,
    data: ExerciseListUpdate,
    user_id: CurrentUserIdDep,
    session: SessionDep,
):
    el = await update_exercise_list(list_id, user_id, data, session)
    return ExerciseListResponse.model_validate(el)
```

- [ ] **Step 6: Rodar para ver passar**

Run: `cd backend && uv run pytest tests/test_exercise_list_policy.py tests/test_exercise_lists.py -v`
Expected: PASS em tudo

- [ ] **Step 7: Commit**

```bash
git add backend/app/schemas/exercise_lists.py backend/app/modules/exercise_lists backend/tests/test_exercise_list_policy.py
git commit -m "feat(backend): PATCH da lista com politica de linguagem"
```

```json:metadata
{"files": ["backend/app/schemas/exercise_lists.py", "backend/app/modules/exercise_lists/service.py", "backend/app/modules/exercise_lists/router.py", "backend/tests/test_exercise_list_policy.py"], "verifyCommand": "cd backend && uv run pytest tests/test_exercise_list_policy.py tests/test_exercise_lists.py -v", "acceptanceCriteria": ["PATCH so pelo dono", "404 para nao-dono", "400 LOCKED sem id", "400 OPEN com id", "403 linguagem alheia", "patch parcial preserva politica", "lista publicada editavel", "GET expande lockedLanguage"], "requiresUserVerification": false}
```

---

### Task 4: `effectiveLanguage` no endpoint do exercício

**Goal:** `GET /exercises/{id}?listId=N` devolve a linguagem já resolvida e a origem dela.

**Files:**
- Modify: `backend/app/schemas/exercises.py`
- Modify: `backend/app/modules/exercises/service.py`
- Modify: `backend/app/modules/exercises/router.py:23-25`
- Modify: `backend/tests/test_exercise_list_policy.py`

**Acceptance Criteria:**
- [ ] Sem `listId`, resolve só pelo exercício
- [ ] Com `listId`, aplica a precedência
- [ ] `effectiveLanguageSource` é `"exercise" | "list" | null`
- [ ] `listId` de lista inexistente → 400
- [ ] `listId` de lista que não contém o exercício → 400

**Verify:** `cd backend && uv run pytest tests/test_exercise_list_policy.py -v` → todos passam

**Steps:**

- [ ] **Step 1: Escrever os testes**

Acrescente ao fim de `backend/tests/test_exercise_list_policy.py`:

```python
from app.models.exercise_list_item import ExerciseListItem


class TestEffectiveLanguageEndpoint:
    async def _list_with_exercise(self, async_session, teacher, **list_kwargs):
        el = await create_exercise_list(async_session, teacher, **list_kwargs)
        ex = await create_exercise(async_session, teacher)
        async_session.add(
            ExerciseListItem(
                exercise_list_id=el.id, exercise_id=ex.id, grade_weight=1.0, order_index=0
            )
        )
        await async_session.flush()
        return el, ex

    async def test_open_exercise_inherits_list_language(self, async_client, async_session):
        teacher, token, _ = await _teacher(async_client, async_session, email="eff1@x.com")
        lang = await _language(async_session, teacher)
        el, ex = await self._list_with_exercise(
            async_session, teacher,
            language_policy=LanguagePolicy.LOCKED, locked_language_id=lang.id,
        )

        r = await async_client.get(
            f"/exercises/{ex.id}", params={"listId": el.id}, headers=_auth(token)
        )
        assert r.status_code == 200
        data = r.json()
        assert data["effectiveLanguage"]["id"] == lang.id
        assert data["effectiveLanguageSource"] == "list"

    async def test_exercise_lock_wins(self, async_client, async_session):
        teacher, token, _ = await _teacher(async_client, async_session, email="eff2@x.com")
        list_lang = await _language(async_session, teacher, name="DaLista")
        ex_lang = await _language(async_session, teacher, name="DoExercicio")
        el, ex = await self._list_with_exercise(
            async_session, teacher,
            language_policy=LanguagePolicy.LOCKED, locked_language_id=list_lang.id,
        )
        ex.language_policy = LanguagePolicy.LOCKED
        ex.locked_language_id = ex_lang.id
        await async_session.flush()

        r = await async_client.get(
            f"/exercises/{ex.id}", params={"listId": el.id}, headers=_auth(token)
        )
        assert r.status_code == 200
        data = r.json()
        assert data["effectiveLanguage"]["id"] == ex_lang.id
        assert data["effectiveLanguageSource"] == "exercise"

    async def test_both_open_returns_null(self, async_client, async_session):
        teacher, token, _ = await _teacher(async_client, async_session, email="eff3@x.com")
        el, ex = await self._list_with_exercise(async_session, teacher)

        r = await async_client.get(
            f"/exercises/{ex.id}", params={"listId": el.id}, headers=_auth(token)
        )
        assert r.status_code == 200
        data = r.json()
        assert data["effectiveLanguage"] is None
        assert data["effectiveLanguageSource"] is None

    async def test_without_list_id_resolves_from_exercise_only(self, async_client, async_session):
        teacher, token, _ = await _teacher(async_client, async_session, email="eff4@x.com")
        lang = await _language(async_session, teacher)
        el, ex = await self._list_with_exercise(
            async_session, teacher,
            language_policy=LanguagePolicy.LOCKED, locked_language_id=lang.id,
        )

        r = await async_client.get(f"/exercises/{ex.id}", headers=_auth(token))
        assert r.status_code == 200
        assert r.json()["effectiveLanguage"] is None

    async def test_unknown_list_id_returns_400(self, async_client, async_session):
        teacher, token, _ = await _teacher(async_client, async_session, email="eff5@x.com")
        ex = await create_exercise(async_session, teacher)

        r = await async_client.get(
            f"/exercises/{ex.id}", params={"listId": 999999}, headers=_auth(token)
        )
        assert r.status_code == 400

    async def test_exercise_not_in_list_returns_400(self, async_client, async_session):
        teacher, token, _ = await _teacher(async_client, async_session, email="eff6@x.com")
        el = await create_exercise_list(async_session, teacher)
        outsider = await create_exercise(async_session, teacher)

        r = await async_client.get(
            f"/exercises/{outsider.id}", params={"listId": el.id}, headers=_auth(token)
        )
        assert r.status_code == 400
```

- [ ] **Step 2: Rodar para ver falhar**

Run: `cd backend && uv run pytest tests/test_exercise_list_policy.py -k Effective -v`
Expected: FAIL com `KeyError: 'effectiveLanguage'`

- [ ] **Step 3: Schema**

Em `backend/app/schemas/exercises.py`, troque o import de `LanguagePolicy` para o módulo novo e acrescente os campos ao `ExerciseResponse`:

```python
from typing import Literal

from app.models.language import LanguagePolicy


class ExerciseResponse(CamelModel):
    # ... campos existentes ...
    effective_language: LanguageResponse | None = None
    effective_language_source: Literal["exercise", "list"] | None = None
```

- [ ] **Step 4: Service**

Acrescente ao fim de `backend/app/modules/exercises/service.py`:

```python
async def get_exercise_in_context(
    exercise_id: int, list_id: int | None, session: AsyncSession
) -> tuple[Exercise, Language | None, EffectiveSource | None]:
    """Carrega o exercício e resolve a linguagem no contexto de uma lista.

    `list_id` inconsistente é 400 e não silêncio: entregar ao aluno a
    linguagem de um contexto que não é o dele seria pior do que falhar.
    """
    exercise = await get_exercise(exercise_id, session)

    exercise_list = None
    if list_id is not None:
        result = await session.execute(
            select(ExerciseList)
            .where(ExerciseList.id == list_id)
            .options(selectinload(ExerciseList.locked_language))
        )
        exercise_list = result.scalar_one_or_none()
        if exercise_list is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="list_id not found"
            )
        is_item = (
            await session.execute(
                select(ExerciseListItem.exercise_id)
                .where(
                    ExerciseListItem.exercise_list_id == list_id,
                    ExerciseListItem.exercise_id == exercise_id,
                )
                .limit(1)
            )
        ).scalar_one_or_none()
        if is_item is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Exercise is not part of list_id",
            )

    effective, source = resolve_effective_language(exercise, exercise_list)
    return exercise, effective, source
```

Com os imports novos no topo do arquivo:

```python
from app.models.exercise_list import ExerciseList
from app.models.language import Language
from app.modules.languages.policy import (
    EffectiveSource,
    resolve_effective_language,
    validate_language_policy,
)
```

- [ ] **Step 5: Router**

Em `backend/app/modules/exercises/router.py`, troque o import do FastAPI para `from fastapi import APIRouter, Query`, acrescente `get_exercise_in_context` ao import do service, `LanguageResponse` ao import dos schemas, e reescreva o endpoint (linhas 23-25):

```python
@router.get("/{exercise_id}", response_model=ExerciseResponse)
async def get_exercise_endpoint(
    exercise_id: int,
    user_id: CurrentUserIdDep,
    session: SessionDep,
    list_id: int | None = Query(default=None, alias="listId"),
):
    exercise, effective, source = await get_exercise_in_context(
        exercise_id, list_id, session
    )
    response = ExerciseResponse.model_validate(exercise)
    response.effective_language = (
        LanguageResponse.model_validate(effective) if effective is not None else None
    )
    response.effective_language_source = source
    return response
```

- [ ] **Step 6: Rodar para ver passar**

Run: `cd backend && uv run pytest tests/test_exercise_list_policy.py -v`
Expected: PASS em tudo

- [ ] **Step 7: Commit**

```bash
git add backend/app/schemas/exercises.py backend/app/modules/exercises backend/tests/test_exercise_list_policy.py
git commit -m "feat(backend): effectiveLanguage no endpoint do exercicio"
```

```json:metadata
{"files": ["backend/app/schemas/exercises.py", "backend/app/modules/exercises/service.py", "backend/app/modules/exercises/router.py", "backend/tests/test_exercise_list_policy.py"], "verifyCommand": "cd backend && uv run pytest tests/test_exercise_list_policy.py -v", "acceptanceCriteria": ["sem listId resolve so pelo exercicio", "com listId aplica precedencia", "source correto", "lista inexistente 400", "exercicio fora da lista 400"], "requiresUserVerification": false}
```

---

### Task 5: Read-gate, delete guard e snapshot enxergam a lista

**Goal:** Os três pontos do backend que hoje só conhecem `Exercise.locked_language_id` passam a conhecer também o da lista.

**Files:**
- Modify: `backend/app/modules/languages/service.py:15-42, 104-124`
- Modify: `backend/app/modules/submissions/service.py:12-40`
- Modify: `backend/tests/test_exercise_list_policy.py`

**Acceptance Criteria:**
- [ ] Aluno de turma com lista `LOCKED` e exercício `OPEN` consegue `GET /languages/{id}` (hoje daria 403)
- [ ] Aluno sem vínculo com a turma segue levando 403
- [ ] `DELETE` de linguagem travada por uma lista → 409
- [ ] Submissão de exercício `OPEN` dentro de lista `LOCKED` grava o `customization` da lista
- [ ] Exercício `LOCKED` em lista `LOCKED` grava o do exercício
- [ ] Lista `OPEN` + exercício `OPEN` mantém o snapshot que o cliente mandou

**Verify:** `cd backend && uv run pytest tests/ -v` → todos passam

**Steps:**

- [ ] **Step 1: Escrever os testes**

Acrescente ao fim de `backend/tests/test_exercise_list_policy.py`:

```python
class TestListLockSideEffects:
    async def _published_list(self, async_session, **list_kwargs):
        org = await create_organization(async_session)
        teacher = await create_user(
            async_session, org, email="tsx@x.com", role=UserRole.TEACHER
        )
        student = await create_user(async_session, org, email="ssx@x.com")
        cls = await create_class(async_session, org, teacher)
        async_session.add(ClassMember(class_id=cls.id, student_id=student.id))
        el = await create_exercise_list(async_session, teacher, **list_kwargs)
        ex = await create_exercise(async_session, teacher)
        async_session.add(
            ExerciseListItem(
                exercise_list_id=el.id, exercise_id=ex.id, grade_weight=1.0, order_index=0
            )
        )
        await create_class_exercise_list(async_session, el, cls)
        await async_session.flush()
        return teacher, student, cls, el, ex

    async def test_student_reads_language_locked_by_the_list(self, async_client, async_session):
        org = await create_organization(async_session)
        teacher = await create_user(
            async_session, org, email="rg_t@x.com", role=UserRole.TEACHER
        )
        lang = await _language(async_session, teacher, name="Acessivel")
        student = await create_user(async_session, org, email="rg_s@x.com")
        cls = await create_class(async_session, org, teacher)
        async_session.add(ClassMember(class_id=cls.id, student_id=student.id))
        el = await create_exercise_list(
            async_session, teacher,
            language_policy=LanguagePolicy.LOCKED, locked_language_id=lang.id,
        )
        await create_class_exercise_list(async_session, el, cls)
        await async_session.flush()

        token = await _login(async_client, student.email, "secret123")
        r = await async_client.get(f"/languages/{lang.id}", headers=_auth(token))
        assert r.status_code == 200
        assert r.json()["customization"] == CUSTOM

    async def test_outsider_still_gets_403(self, async_client, async_session):
        org = await create_organization(async_session)
        teacher = await create_user(
            async_session, org, email="og_t@x.com", role=UserRole.TEACHER
        )
        lang = await _language(async_session, teacher, name="Privada")
        outsider = await create_user(async_session, org, email="og_s@x.com")
        el = await create_exercise_list(
            async_session, teacher,
            language_policy=LanguagePolicy.LOCKED, locked_language_id=lang.id,
        )
        await async_session.flush()

        token = await _login(async_client, outsider.email, "secret123")
        r = await async_client.get(f"/languages/{lang.id}", headers=_auth(token))
        assert r.status_code == 403

    async def test_delete_language_locked_by_list_returns_409(self, async_client, async_session):
        teacher, token, _ = await _teacher(async_client, async_session, email="del@x.com")
        lang = await _language(async_session, teacher, name="EmUso")
        await create_exercise_list(
            async_session, teacher,
            language_policy=LanguagePolicy.LOCKED, locked_language_id=lang.id,
        )
        await async_session.flush()

        r = await async_client.delete(f"/languages/{lang.id}", headers=_auth(token))
        assert r.status_code == 409

    async def test_snapshot_comes_from_the_list(self, async_client, async_session):
        org = await create_organization(async_session)
        teacher = await create_user(
            async_session, org, email="sn_t@x.com", role=UserRole.TEACHER
        )
        lang = await _language(async_session, teacher, name="DaLista2")
        student = await create_user(async_session, org, email="sn_s@x.com")
        cls = await create_class(async_session, org, teacher)
        async_session.add(ClassMember(class_id=cls.id, student_id=student.id))
        el = await create_exercise_list(
            async_session, teacher,
            language_policy=LanguagePolicy.LOCKED, locked_language_id=lang.id,
        )
        ex = await create_exercise(async_session, teacher)
        async_session.add(
            ExerciseListItem(
                exercise_list_id=el.id, exercise_id=ex.id, grade_weight=1.0, order_index=0
            )
        )
        await create_class_exercise_list(async_session, el, cls)
        await async_session.flush()

        token = await _login(async_client, student.email, "secret123")
        r = await async_client.post(
            "/submissions",
            json={
                "exercise_id": ex.id,
                "exercise_list_id": el.id,
                "class_id": cls.id,
                "code_snapshot": "code",
                "language_snapshot": {"cliente": "tenta-burlar"},
                "status": "SUBMITTED",
            },
            headers=_auth(token),
        )
        assert r.status_code == 201
        assert r.json()["languageSnapshot"] == CUSTOM

    async def test_open_list_and_open_exercise_keep_client_snapshot(
        self, async_client, async_session
    ):
        _, student, cls, el, ex = await self._published_list(async_session)
        token = await _login(async_client, student.email, "secret123")
        client_snap = {"do": "aluno"}

        r = await async_client.post(
            "/submissions",
            json={
                "exercise_id": ex.id,
                "exercise_list_id": el.id,
                "class_id": cls.id,
                "code_snapshot": "code",
                "language_snapshot": client_snap,
                "status": "SUBMITTED",
            },
            headers=_auth(token),
        )
        assert r.status_code == 201
        assert r.json()["languageSnapshot"] == client_snap
```

- [ ] **Step 2: Rodar para ver falhar**

Run: `cd backend && uv run pytest tests/test_exercise_list_policy.py -k SideEffects -v`
Expected: FAIL — o read-gate devolve 403, o delete devolve 204, o snapshot volta com o valor do cliente

- [ ] **Step 3: Read-gate**

Em `backend/app/modules/languages/service.py`, dentro de `_user_can_read_language`, depois do `return result.scalar_one_or_none() is not None` atual, troque o fim da função por:

```python
    result = await session.execute(stmt)
    if result.scalar_one_or_none() is not None:
        return True

    # A lista inteira pode travar a linguagem, e aí nenhum exercício dela
    # aponta para ela. Sem este caminho o aluno levaria 403 no caso mais
    # comum do recurso: lista travada com exercícios OPEN.
    list_stmt = (
        select(ExerciseList.id)
        .join(
            ClassExerciseList,
            ClassExerciseList.exercise_list_id == ExerciseList.id,
        )
        .join(
            ClassMember,
            and_(
                ClassMember.class_id == ClassExerciseList.class_id,
                ClassMember.student_id == user_id,
            ),
        )
        .where(ExerciseList.locked_language_id == language.id)
        .limit(1)
    )
    list_result = await session.execute(list_stmt)
    return list_result.scalar_one_or_none() is not None
```

Acrescente o import:

```python
from app.models.exercise_list import ExerciseList
```

- [ ] **Step 4: Delete guard**

No mesmo arquivo, em `delete_language`, troque o bloco `in_use` por:

```python
    in_use_by_exercise = (
        await session.execute(
            select(Exercise.id).where(Exercise.locked_language_id == language_id).limit(1)
        )
    ).scalar_one_or_none()
    if in_use_by_exercise is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Language is locked by at least one exercise and cannot be deleted",
        )

    in_use_by_list = (
        await session.execute(
            select(ExerciseList.id)
            .where(ExerciseList.locked_language_id == language_id)
            .limit(1)
        )
    ).scalar_one_or_none()
    if in_use_by_list is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Language is locked by at least one exercise list and cannot be deleted",
        )
```

- [ ] **Step 5: Snapshot**

Em `backend/app/modules/submissions/service.py`, troque o corpo inicial de `create_submission`:

```python
    result = await session.execute(
        select(Exercise)
        .where(Exercise.id == data.exercise_id)
        .options(selectinload(Exercise.locked_language))
    )
    exercise = result.scalar_one_or_none()
    if exercise is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exercise not found")

    list_result = await session.execute(
        select(ExerciseList)
        .where(ExerciseList.id == data.exercise_list_id)
        .options(selectinload(ExerciseList.locked_language))
    )
    exercise_list = list_result.scalar_one_or_none()

    # Override no servidor: o aluno não burla a trava mexendo no keywordMap.
    # Vale para a trava do exercício e para a herdada da lista.
    effective, _ = resolve_effective_language(exercise, exercise_list)
    language_snapshot = (
        dict(effective.customization) if effective is not None else data.language_snapshot
    )
```

Com os imports:

```python
from app.models.exercise import Exercise
from app.models.exercise_list import ExerciseList
from app.modules.languages.policy import resolve_effective_language
```

O `LanguagePolicy` deixa de ser usado neste arquivo — remova o import.

Nota: aqui uma `exercise_list_id` inexistente **não** vira 400; a FK já rejeita no flush, e a submissão não é o lugar de validar contexto.

- [ ] **Step 6: Rodar a suíte inteira**

Run: `cd backend && uv run pytest tests/ -v`
Expected: PASS em tudo, incluindo `test_exercise_policy_and_snapshot.py` e `test_languages.py` sem edição

- [ ] **Step 7: Commit**

```bash
git add backend/app/modules/languages/service.py backend/app/modules/submissions/service.py backend/tests/test_exercise_list_policy.py
git commit -m "feat(backend): lista travada concede leitura, bloqueia delete e vira snapshot"
```

```json:metadata
{"files": ["backend/app/modules/languages/service.py", "backend/app/modules/submissions/service.py", "backend/tests/test_exercise_list_policy.py"], "verifyCommand": "cd backend && uv run pytest tests/ -v", "acceptanceCriteria": ["aluno le linguagem travada pela lista", "outsider segue 403", "delete 409 por lista", "snapshot da lista", "snapshot do exercicio prevalece", "OPEN+OPEN mantem snapshot do cliente"], "requiresUserVerification": false}
```

---

### Task 6: `LanguagePolicyField` e tipos do front

**Goal:** O par rádio + select sai de dentro do modal de exercício para um componente reusável, e os tipos e queries carregam os campos novos.

**Files:**
- Create: `packages/ide/src/components/language-policy-field.tsx`
- Modify: `packages/ide/src/views/exercises/components/create-exercise-modal.tsx:177-240`
- Modify: `packages/ide/src/types/api.ts`
- Modify: `packages/ide/src/hooks/use-api-queries.ts`

**Acceptance Criteria:**
- [ ] `create-exercise-modal` usa o componente e continua funcionando igual
- [ ] `ExerciseList` tem `languagePolicy`, `lockedLanguageId`, `lockedLanguage`
- [ ] `Exercise` tem `effectiveLanguage` e `effectiveLanguageSource`
- [ ] `useExerciseQuery` aceita `listId` e o manda como `listId`
- [ ] A `queryKey` do exercício inclui o `listId` — senão a mesma entrada de cache serviria dois contextos
- [ ] `useUpdateExerciseListMutation` existe e invalida o cache da lista
- [ ] `tsc --noEmit` limpo

**Verify:** `cd packages/ide && npx tsc --noEmit && npm run test` → sem erro

**Steps:**

- [ ] **Step 1: Criar o componente**

Crie `packages/ide/src/components/language-policy-field.tsx`:

```tsx
import type { LanguagePolicy } from "@/types/api";

export type LanguagePolicyValue = {
  policy: LanguagePolicy;
  lockedLanguageId: number | null;
};

type LanguagePolicyFieldProps = {
  value: LanguagePolicyValue;
  onChange: (next: LanguagePolicyValue) => void;
  languages: { id: number; name: string }[];
  disabled?: boolean;
};

export function LanguagePolicyField({
  value,
  onChange,
  languages,
  disabled = false,
}: LanguagePolicyFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            aria-label="Aberto"
            checked={value.policy === "OPEN"}
            disabled={disabled}
            onChange={() => onChange({ policy: "OPEN", lockedLanguageId: null })}
          />
          Aberto (aluno usa sua linguagem)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            aria-label="Travado"
            checked={value.policy === "LOCKED"}
            disabled={disabled}
            onChange={() =>
              onChange({ policy: "LOCKED", lockedLanguageId: value.lockedLanguageId })
            }
          />
          Travado em uma linguagem
        </label>
      </div>

      {value.policy === "LOCKED" && (
        <select
          aria-label="Linguagem"
          className="h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-slate-100"
          value={value.lockedLanguageId ?? ""}
          disabled={disabled}
          onChange={(e) =>
            onChange({
              policy: "LOCKED",
              lockedLanguageId: e.target.value ? Number(e.target.value) : null,
            })
          }
        >
          <option value="">— selecione —</option>
          {languages.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Modal de exercício consome o componente**

Em `packages/ide/src/views/exercises/components/create-exercise-modal.tsx`, substitua os dois `FormField` de política (linhas 177-240) por um só:

```tsx
            <FormField
              control={form.control}
              name="languagePolicy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Linguagem permitida</FormLabel>
                  <FormControl>
                    <LanguagePolicyField
                      value={{
                        policy: field.value,
                        lockedLanguageId: form.watch("lockedLanguageId"),
                      }}
                      onChange={(next) => {
                        field.onChange(next.policy);
                        form.setValue("lockedLanguageId", next.lockedLanguageId);
                      }}
                      languages={languagesQuery.data ?? []}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
```

Acrescente o import e remova o `const languagePolicy = form.watch("languagePolicy");` da linha 79, que fica sem uso:

```tsx
import { LanguagePolicyField } from "@/components/language-policy-field";
```

A validação manual do `onSubmit` (linhas 98-107, que seta erro quando `LOCKED` sem id) **fica como está** — é regra do form, não do componente.

- [ ] **Step 3: Tipos**

Em `packages/ide/src/types/api.ts`, acrescente aos dois tipos:

```ts
export type Exercise = {
  // ... campos existentes ...
  effectiveLanguage: Language | null
  effectiveLanguageSource: "exercise" | "list" | null
}

export type ExerciseList = {
  // ... campos existentes ...
  languagePolicy: LanguagePolicy
  lockedLanguageId: number | null
  lockedLanguage: Language | null
}
```

- [ ] **Step 4: Query key com o contexto**

Em `packages/ide/src/lib/query-keys.ts`, troque a chave de detalhe do exercício:

```ts
    detail: (
      exerciseId: string | number | undefined,
      listId?: string | number | null,
    ) => ["exercises", exerciseId, listId ?? null] as const,
```

- [ ] **Step 5: Queries e mutation**

Em `packages/ide/src/hooks/use-api-queries.ts`, troque `useExerciseQuery`:

```ts
export function useExerciseQuery(
  exerciseId: string | number | undefined,
  enabled = true,
  listId?: string | number | null,
) {
  return useQuery({
    queryKey: queryKeys.exercises.detail(exerciseId, listId),
    queryFn: async () => {
      const { data } = await api.get(`/exercises/${exerciseId}`, {
        params: listId ? { listId } : undefined,
      });
      return data;
    },
    enabled: enabled && Boolean(exerciseId),
  });
}
```

Acrescente o input e a mutation, junto das outras de lista:

```ts
type UpdateExerciseListInput = {
  listId: string | number;
  title?: string;
  description?: string;
  languagePolicy?: "OPEN" | "LOCKED";
  lockedLanguageId?: number | null;
};

export function useUpdateExerciseListMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listId, ...body }: UpdateExerciseListInput) => {
      const { data } = await api.patch<ExerciseList>(
        `/exercise-lists/${listId}`,
        body,
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.exerciseLists.all,
      });
    },
  });
}
```

E estenda `CreateExerciseListInput`:

```ts
type CreateExerciseListInput = {
  title: string;
  description?: string;
  languagePolicy?: "OPEN" | "LOCKED";
  lockedLanguageId?: number | null;
};
```

- [ ] **Step 6: Verificar**

Run: `cd packages/ide && npx tsc --noEmit`
Expected: sem erro. Se `queryKeys.exerciseLists.all` não invalidar a chave de detalhe, confira que `detail` começa com `"exercise-lists"` — o TanStack Query casa prefixo.

Run: `cd packages/ide && npm run test`
Expected: PASS. Nenhum spec existente toca `useExerciseQuery` com posicional novo, mas confirme.

- [ ] **Step 7: Commit**

```bash
git add packages/ide/src/components/language-policy-field.tsx packages/ide/src/views/exercises/components/create-exercise-modal.tsx packages/ide/src/types/api.ts packages/ide/src/lib/query-keys.ts packages/ide/src/hooks/use-api-queries.ts
git commit -m "refactor(ide): extrair LanguagePolicyField e tipar a politica da lista"
```

```json:metadata
{"files": ["packages/ide/src/components/language-policy-field.tsx", "packages/ide/src/views/exercises/components/create-exercise-modal.tsx", "packages/ide/src/types/api.ts", "packages/ide/src/lib/query-keys.ts", "packages/ide/src/hooks/use-api-queries.ts"], "verifyCommand": "cd packages/ide && npx tsc --noEmit && npm run test", "acceptanceCriteria": ["modal usa o componente", "ExerciseList tipada", "Exercise com effectiveLanguage", "useExerciseQuery aceita listId", "queryKey inclui listId", "mutation de update existe", "tsc limpo"], "requiresUserVerification": false}
```

---

### Task 7: UI do professor — criar e editar a linguagem da lista

**Goal:** O professor define a linguagem ao criar a lista e altera depois na tela de detalhe, vendo quantos itens não herdam.

**Files:**
- Modify: `packages/ide/src/views/exercise-lists/components/create-list-modal.tsx`
- Create: `packages/ide/src/views/exercise-lists/components/list-language-panel.tsx`
- Create: `packages/ide/src/views/exercise-lists/components/list-language-panel.spec.tsx`
- Modify: `packages/ide/src/views/exercise-lists/components/teacher-detail-view.tsx`

**Acceptance Criteria:**
- [ ] `CreateListModal` envia `languagePolicy` e `lockedLanguageId`
- [ ] `LOCKED` sem linguagem escolhida bloqueia o submit
- [ ] O painel mostra a linguagem atual e dispara o `PATCH`
- [ ] O painel conta os itens com trava própria e avisa que não herdam
- [ ] O painel avisa quando a lista está publicada em N turmas
- [ ] Lista `OPEN` mostra o estado "aluno usa a própria linguagem"

**Verify:** `cd packages/ide && npx vitest run --config vitest.integration.config.ts src/views/exercise-lists/components/list-language-panel.spec.tsx` → PASS

**Steps:**

- [ ] **Step 1: Escrever o spec do painel**

Crie `packages/ide/src/views/exercise-lists/components/list-language-panel.spec.tsx`:

```tsx
// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ListLanguagePanel } from "./list-language-panel";
import type { ExerciseList } from "@/types/api";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const mutateAsyncMock = vi.fn();
const useLanguagesListMock = vi.fn();

vi.mock("@/hooks/use-api-queries", () => ({
  useUpdateExerciseListMutation: () => ({
    mutateAsync: mutateAsyncMock,
    isPending: false,
  }),
}));

vi.mock("@/hooks/useLanguages", () => ({
  useLanguagesList: () => useLanguagesListMock(),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock("lucide-react", () => ({
  Languages: () => <span>languages</span>,
  Lock: () => <span>lock</span>,
  Unlock: () => <span>unlock</span>,
}));

const LANG = { id: 3, name: "Portugolzinho" };

function buildList(overrides: Partial<ExerciseList> = {}): ExerciseList {
  return {
    id: 7,
    teacherId: 1,
    title: "Recursao",
    description: "",
    createdAt: "",
    updatedAt: "",
    items: [],
    classes: [],
    languagePolicy: "OPEN",
    lockedLanguageId: null,
    lockedLanguage: null,
    ...overrides,
  } as ExerciseList;
}

function render(list: ExerciseList, lockedItemCount = 0) {
  useLanguagesListMock.mockReturnValue({ data: [LANG] });
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(
      <ListLanguagePanel list={list} lockedItemCount={lockedItemCount} />,
    );
  });
  return { container, root };
}

function click(element: Element | null | undefined) {
  act(() => {
    element?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

describe("ListLanguagePanel", () => {
  beforeEach(() => {
    mutateAsyncMock.mockReset();
    mutateAsyncMock.mockResolvedValue({});
    useLanguagesListMock.mockReset();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("mostra o estado aberto quando a lista nao trava", () => {
    const { container } = render(buildList());
    expect(container.textContent).toContain("aluno usa a própria linguagem");
  });

  it("mostra a linguagem travada", () => {
    const { container } = render(
      buildList({
        languagePolicy: "LOCKED",
        lockedLanguageId: 3,
        lockedLanguage: { id: 3, name: "Portugolzinho" } as never,
      }),
    );
    expect(container.textContent).toContain("Portugolzinho");
  });

  it("avisa quantos itens nao herdam a linguagem", () => {
    const { container } = render(
      buildList({
        languagePolicy: "LOCKED",
        lockedLanguageId: 3,
        lockedLanguage: { id: 3, name: "Portugolzinho" } as never,
      }),
      2,
    );
    expect(container.textContent).toContain("2");
    expect(container.textContent).toContain("trava própria");
  });

  it("avisa quando a lista esta publicada", () => {
    const { container } = render(
      buildList({
        classes: [
          { classId: 1, totalGrade: 10, minRequired: 1, deadline: "" },
          { classId: 2, totalGrade: 10, minRequired: 1, deadline: "" },
        ],
      }),
    );
    expect(container.textContent).toContain("2 turmas");
  });

  it("salva a linguagem escolhida via PATCH", () => {
    const { container } = render(buildList());

    click(container.querySelector('button[aria-label="Alterar linguagem"]'));

    const lockedRadio = container.querySelector<HTMLInputElement>(
      'input[aria-label="Travado"]',
    );
    act(() => {
      lockedRadio?.click();
    });

    const select = container.querySelector<HTMLSelectElement>(
      'select[aria-label="Linguagem"]',
    );
    act(() => {
      Object.getOwnPropertyDescriptor(
        window.HTMLSelectElement.prototype,
        "value",
      )?.set?.call(select, "3");
      select?.dispatchEvent(new Event("change", { bubbles: true }));
    });

    click(container.querySelector('button[aria-label="Salvar linguagem"]'));

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      listId: 7,
      languagePolicy: "LOCKED",
      lockedLanguageId: 3,
    });
  });

  it("nao salva LOCKED sem linguagem escolhida", () => {
    const { container } = render(buildList());

    click(container.querySelector('button[aria-label="Alterar linguagem"]'));
    const lockedRadio = container.querySelector<HTMLInputElement>(
      'input[aria-label="Travado"]',
    );
    act(() => {
      lockedRadio?.click();
    });
    click(container.querySelector('button[aria-label="Salvar linguagem"]'));

    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Rodar para ver falhar**

Run: `cd packages/ide && npx vitest run --config vitest.integration.config.ts src/views/exercise-lists/components/list-language-panel.spec.tsx`
Expected: FAIL — `Failed to resolve import "./list-language-panel"`

- [ ] **Step 3: Escrever o painel**

Crie `packages/ide/src/views/exercise-lists/components/list-language-panel.tsx`:

```tsx
import { useState } from "react";
import { Languages, Lock, Unlock } from "lucide-react";
import { HeroButton } from "@/components/buttons/hero";
import {
  LanguagePolicyField,
  type LanguagePolicyValue,
} from "@/components/language-policy-field";
import { useToast } from "@/contexts/ToastContext";
import { useUpdateExerciseListMutation } from "@/hooks/use-api-queries";
import { useLanguagesList } from "@/hooks/useLanguages";
import type { ExerciseList } from "@/types/api";

export function ListLanguagePanel({
  list,
  lockedItemCount,
}: {
  list: ExerciseList;
  lockedItemCount: number;
}) {
  const { showToast } = useToast();
  const languagesQuery = useLanguagesList();
  const updateList = useUpdateExerciseListMutation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<LanguagePolicyValue>({
    policy: list.languagePolicy,
    lockedLanguageId: list.lockedLanguageId,
  });

  const publishedCount = list.classes.length;

  const handleSave = async () => {
    if (draft.policy === "LOCKED" && draft.lockedLanguageId === null) {
      showToast({ type: "error", message: "Escolha uma linguagem." });
      return;
    }
    try {
      await updateList.mutateAsync({
        listId: list.id,
        languagePolicy: draft.policy,
        lockedLanguageId: draft.policy === "LOCKED" ? draft.lockedLanguageId : null,
      });
      showToast({ type: "success", message: "Linguagem da lista atualizada." });
      setEditing(false);
    } catch {
      showToast({ type: "error", message: "Erro ao atualizar a linguagem." });
    }
  };

  return (
    <div className="bg-white/3 backdrop-blur-xl border border-white/8 rounded-2xl p-6 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <Languages className="w-4 h-4 text-[#0dccf2] shrink-0" />
          <h2 className="font-semibold text-slate-200">Linguagem da lista</h2>
        </div>
        {!editing && (
          <HeroButton
            variant="outline"
            aria-label="Alterar linguagem"
            onClick={() => setEditing(true)}
            className="px-3 py-1.5 text-xs"
          >
            Alterar
          </HeroButton>
        )}
      </div>

      {!editing && (
        <p className="flex items-center gap-2 text-sm text-slate-300">
          {list.languagePolicy === "LOCKED" && list.lockedLanguage ? (
            <>
              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-medium">{list.lockedLanguage.name}</span>
            </>
          ) : (
            <>
              <Unlock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Aberta — o aluno usa a própria linguagem</span>
            </>
          )}
        </p>
      )}

      {editing && (
        <div className="space-y-3">
          <LanguagePolicyField
            value={draft}
            onChange={setDraft}
            languages={languagesQuery.data ?? []}
            disabled={updateList.isPending}
          />
          <div className="flex gap-2">
            <HeroButton
              aria-label="Salvar linguagem"
              onClick={() => void handleSave()}
              disabled={updateList.isPending}
              className="px-3 py-1.5 text-xs"
            >
              Salvar
            </HeroButton>
            <HeroButton
              variant="outline"
              aria-label="Cancelar alteracao de linguagem"
              onClick={() => {
                setDraft({
                  policy: list.languagePolicy,
                  lockedLanguageId: list.lockedLanguageId,
                });
                setEditing(false);
              }}
              className="px-3 py-1.5 text-xs"
            >
              Cancelar
            </HeroButton>
          </div>
        </div>
      )}

      {/* A consequência da precedência, dita onde o professor decide. */}
      {list.languagePolicy === "LOCKED" && lockedItemCount > 0 && (
        <p className="text-xs text-amber-300/80">
          {lockedItemCount} {lockedItemCount === 1 ? "exercício tem" : "exercícios têm"}{" "}
          trava própria e {lockedItemCount === 1 ? "mantém" : "mantêm"} a linguagem
          dele{lockedItemCount === 1 ? "" : "s"}.
        </p>
      )}

      {publishedCount > 0 && (
        <p className="text-xs text-slate-500">
          Esta lista está publicada em {publishedCount}{" "}
          {publishedCount === 1 ? "turma" : "turmas"}. Alterar a linguagem vale para quem
          ainda não entregou; o que já foi enviado não muda.
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Rodar para ver passar**

Run: `cd packages/ide && npx vitest run --config vitest.integration.config.ts src/views/exercise-lists/components/list-language-panel.spec.tsx`
Expected: PASS nos 6 testes

- [ ] **Step 5: Montar o painel na tela da lista**

Em `packages/ide/src/views/exercise-lists/components/teacher-detail-view.tsx`, acrescente o import e monte o painel entre o card de header e o painel de exercícios (depois da linha 94):

```tsx
import { ListLanguagePanel } from "./list-language-panel";
import { useExercisesQuery } from "@/hooks/use-api-queries";
```

Dentro do componente, antes do `return`:

```tsx
  // Os itens da lista só trazem { id, title }; a política de cada exercício
  // vem da listagem do professor, que já está em cache.
  const exercisesQuery = useExercisesQuery();
  const lockedItemCount = (exercisesQuery.data ?? []).filter(
    (ex) =>
      ex.languagePolicy === "LOCKED" &&
      list.items.some((item) => item.exerciseId === ex.id),
  ).length;
```

E no JSX, logo depois do card de header:

```tsx
      <ListLanguagePanel list={list} lockedItemCount={lockedItemCount} />
```

- [ ] **Step 6: Campo na criação da lista**

Em `packages/ide/src/views/exercise-lists/components/create-list-modal.tsx`, estenda o schema, o default e o submit:

```tsx
const createListSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  languagePolicy: z.enum(["OPEN", "LOCKED"]),
  lockedLanguageId: z.number().int().positive().nullable(),
});
```

```tsx
    defaultValues: {
      title: "",
      description: "",
      languagePolicy: "OPEN",
      lockedLanguageId: null,
    },
```

```tsx
  const onSubmit = async (values: CreateListForm) => {
    if (values.languagePolicy === "LOCKED" && values.lockedLanguageId === null) {
      form.setError("lockedLanguageId", {
        message: "Escolha uma linguagem",
      });
      return;
    }
    try {
      await createList.mutateAsync({
        title: values.title,
        description: values.description,
        languagePolicy: values.languagePolicy,
        lockedLanguageId:
          values.languagePolicy === "LOCKED" ? values.lockedLanguageId : null,
      });
      showToast({ type: "success", message: "Lista criada com sucesso!" });
      form.reset();
      onOpenChange(false);
      onCreated?.();
    } catch {
      showToast({ type: "error", message: "Erro ao criar lista." });
    }
  };
```

E o campo, depois do `FormField` de descrição:

```tsx
            <FormField
              control={form.control}
              name="languagePolicy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Linguagem permitida</FormLabel>
                  <FormControl>
                    <LanguagePolicyField
                      value={{
                        policy: field.value,
                        lockedLanguageId: form.watch("lockedLanguageId"),
                      }}
                      onChange={(next) => {
                        field.onChange(next.policy);
                        form.setValue("lockedLanguageId", next.lockedLanguageId);
                      }}
                      languages={languagesQuery.data ?? []}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
```

Com os imports:

```tsx
import { LanguagePolicyField } from "@/components/language-policy-field";
import { useLanguagesList } from "@/hooks/useLanguages";
```

E, dentro do componente:

```tsx
  const languagesQuery = useLanguagesList();
```

- [ ] **Step 7: Verificar tudo**

Run: `cd packages/ide && npx tsc --noEmit && npm run test`
Expected: sem erro de tipo, todos os specs passam

- [ ] **Step 8: Commit**

```bash
git add packages/ide/src/views/exercise-lists/components
git commit -m "feat(ide): professor define a linguagem da lista"
```

```json:metadata
{"files": ["packages/ide/src/views/exercise-lists/components/create-list-modal.tsx", "packages/ide/src/views/exercise-lists/components/list-language-panel.tsx", "packages/ide/src/views/exercise-lists/components/list-language-panel.spec.tsx", "packages/ide/src/views/exercise-lists/components/teacher-detail-view.tsx"], "verifyCommand": "cd packages/ide && npx vitest run --config vitest.integration.config.ts src/views/exercise-lists/components/list-language-panel.spec.tsx", "acceptanceCriteria": ["criacao envia a politica", "LOCKED sem linguagem bloqueia", "painel dispara PATCH", "conta itens com trava propria", "avisa publicacao", "estado aberto visivel"], "requiresUserVerification": false}
```

---

### Task 8: Workspace do aluno usa `effectiveLanguage`

**Goal:** O aluno vê e usa a linguagem resolvida, com o banner dizendo de onde a trava veio.

**Files:**
- Modify: `packages/ide/src/components/exercise-workspace/LockedLanguageBanner.tsx`
- Create: `packages/ide/src/views/ide/components/locked-language-banner.spec.tsx`
- Modify: `packages/ide/src/pages/exercises/workspace.tsx:140-150, 315-325, 452-455`

**Acceptance Criteria:**
- [ ] O `useEffect` aplica `exercise.effectiveLanguage.customization`
- [ ] O banner aparece quando a trava vem da lista, não só do exercício
- [ ] O texto distingue "travada por este exercício" de "travada pela lista *X*"
- [ ] Sem trava, nada muda: o aluno segue na linguagem ativa dele
- [ ] "Clonar para meu acervo" continua funcionando nos dois casos
- [ ] A query do exercício passa o `listId` da rota

**Verify:** `cd packages/ide && npx tsc --noEmit && npm run test` → sem erro

**Steps:**

- [ ] **Step 1: Escrever o spec do banner**

Crie `packages/ide/src/views/ide/components/locked-language-banner.spec.tsx` (em `views/` porque o `include` do vitest não cobre `components/**`):

```tsx
// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LockedLanguageBanner } from "@/components/exercise-workspace/LockedLanguageBanner";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const mutateAsyncMock = vi.fn();

vi.mock("@/hooks/useLanguages", () => ({
  useCloneLanguage: () => ({ mutateAsync: mutateAsyncMock, isPending: false }),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock("lucide-react", () => ({
  Copy: () => <span>copy</span>,
  Lock: () => <span>lock</span>,
}));

const LANGUAGE = { id: 3, name: "Portugolzinho", description: null };

function render(props: Record<string, unknown>) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(<LockedLanguageBanner language={LANGUAGE} {...props} />);
  });
  return { container, root };
}

describe("LockedLanguageBanner", () => {
  beforeEach(() => {
    mutateAsyncMock.mockReset();
    mutateAsyncMock.mockResolvedValue({ name: "Portugolzinho (cópia)" });
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("diz que a trava e do exercicio", () => {
    const { container } = render({ source: "exercise" });
    expect(container.textContent).toContain("este exercício");
    expect(container.textContent).toContain("Portugolzinho");
  });

  it("diz que a trava e da lista e nomeia a lista", () => {
    const { container } = render({ source: "list", listTitle: "Recursao" });
    expect(container.textContent).toContain("Recursao");
  });

  it("mantem o botao de clonar", () => {
    const { container } = render({ source: "list", listTitle: "Recursao" });
    const button = container.querySelector("button");
    act(() => {
      button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(mutateAsyncMock).toHaveBeenCalledWith(3);
  });
});
```

- [ ] **Step 2: Rodar para ver falhar**

Run: `cd packages/ide && npx vitest run --config vitest.integration.config.ts src/views/ide/components/locked-language-banner.spec.tsx`
Expected: FAIL no primeiro teste — o texto atual é "Linguagem fixa:", sem origem

- [ ] **Step 3: Banner mostra a origem**

Em `packages/ide/src/components/exercise-workspace/LockedLanguageBanner.tsx`, troque o tipo das props e o parágrafo do título:

```tsx
type LockedLanguageBannerProps = {
  language: { id: number; name: string; description: string | null };
  source?: "exercise" | "list";
  listTitle?: string | null;
};

export function LockedLanguageBanner({
  language,
  source = "exercise",
  listTitle,
}: LockedLanguageBannerProps) {
```

E, dentro do JSX, no lugar do `<p className="font-medium truncate">` atual:

```tsx
          <p className="font-medium truncate">
            Linguagem fixa: <span className="font-semibold">{language.name}</span>
          </p>
          <p className="opacity-70 truncate text-xs">
            {source === "list" && listTitle
              ? `Travada pela lista "${listTitle}"`
              : "Travada por este exercício"}
          </p>
```

A `description` da linguagem, que hoje ocupa esse segundo parágrafo, sai: a origem da trava é a informação que o aluno precisa, e o nome já identifica a linguagem.

- [ ] **Step 4: Rodar para ver passar**

Run: `cd packages/ide && npx vitest run --config vitest.integration.config.ts src/views/ide/components/locked-language-banner.spec.tsx`
Expected: PASS nos 3 testes

- [ ] **Step 5: Workspace passa o `listId` e usa `effectiveLanguage`**

Em `packages/ide/src/pages/exercises/workspace.tsx`:

A query (linhas ~452-455):

```tsx
  const exerciseQuery = useExerciseQuery(
    exerciseId,
    Boolean(userId && exerciseId),
    listId,
  );
```

O `useEffect` que aplica a customização (linhas ~140-150):

```tsx
  // O backend já resolveu a precedência (exercício > lista > livre). O front
  // só aplica o que veio.
  useEffect(() => {
    const effective = exercise?.effectiveLanguage;
    if (effective?.customization) {
      applyExternalCustomization(effective.customization);
      return () => restoreActiveCustomization();
    }
    return undefined;
  }, [exercise, applyExternalCustomization, restoreActiveCustomization]);
```

O banner (linhas ~315-325):

```tsx
      {exercise?.effectiveLanguage && (
        <div className="relative z-10 px-6 py-2">
          <LockedLanguageBanner
            language={{
              id: exercise.effectiveLanguage.id,
              name: exercise.effectiveLanguage.name,
              description: exercise.effectiveLanguage.description,
            }}
            source={exercise.effectiveLanguageSource ?? "exercise"}
            listTitle={list?.title}
          />
        </div>
      )}
```

O componente que renderiza o banner precisa receber `list` — confira a assinatura em `workspace.tsx:300-309`: ela já tem `list?: ExerciseList`. Se o banner estiver em outro componente que não recebe `list`, passe a prop.

- [ ] **Step 6: Verificar tudo**

Run: `cd packages/ide && npx tsc --noEmit && npm run test`
Expected: sem erro de tipo, todos os specs passam

Run: `cd backend && uv run pytest tests/ -v`
Expected: PASS — confirmação final de que backend e front fecham juntos

- [ ] **Step 7: Commit**

```bash
git add packages/ide/src/components/exercise-workspace/LockedLanguageBanner.tsx packages/ide/src/views/ide/components/locked-language-banner.spec.tsx packages/ide/src/pages/exercises/workspace.tsx
git commit -m "feat(ide): workspace usa a linguagem efetiva e diz a origem da trava"
```

```json:metadata
{"files": ["packages/ide/src/components/exercise-workspace/LockedLanguageBanner.tsx", "packages/ide/src/views/ide/components/locked-language-banner.spec.tsx", "packages/ide/src/pages/exercises/workspace.tsx"], "verifyCommand": "cd packages/ide && npx tsc --noEmit && npm run test", "acceptanceCriteria": ["useEffect usa effectiveLanguage", "banner aparece com trava da lista", "texto distingue a origem", "sem trava nada muda", "clonar segue funcionando", "query passa listId"], "requiresUserVerification": false}
```
