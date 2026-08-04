# Linguagens pelo Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar a alunos e professores um caminho do dashboard até criar, editar e ativar linguagens personalizadas, com o wizard persistindo de verdade no backend.

**Architecture:** O backend ganha três colunas de identidade em `languages` para não perder imagem e preset no round-trip. O front ganha um item no `Sidebar` e uma página `/languages` que substitui o `LanguageLibraryModal`. O wizard passa a aceitar `?id=N` e delega a persistência a um hook novo (`useLanguagePersistence`) que ramifica entre `POST`, `PATCH` e localStorage conforme sessão e modo. O seletor de linguagem do IDE deixa de ler só do localStorage.

**Tech Stack:** FastAPI + SQLAlchemy async + Alembic (backend); Next.js Pages Router + React 19 + TanStack Query + Tailwind v4 (front); pytest-asyncio + httpx (testes backend); Vitest + jsdom + `createRoot`/`act` (testes front).

**User Verification:** NO — o spec não pede confirmação humana do resultado. A verificação é por testes automatizados.

**Spec:** `docs/superpowers/specs/2026-05-19-linguagens-personalizadas-por-usuario-design.md`, seção "Revisão 2026-08-04".

---

## Contexto que o executor precisa saber

**A primeira rodada já foi entregue e está na `main`.** Não recrie modelo `Language`, módulo `/languages`, `useLanguages.ts`, `languages-api.ts`, `LockedLanguageBanner` nem a policy de exercício. Este plano só cobre as lacunas.

**Convenções do repositório que não são óbvias:**

- O front chama a FastAPI **direto** via o cliente `lib/api`. **Não crie** `pages/api/languages/*` — esse diretório não existe de propósito.
- Os schemas Pydantic herdam de `CamelModel` (`backend/app/schemas/base.py`): o Python usa `snake_case`, o JSON sai em `camelCase`. Por isso o TS vê `imageUrl` enquanto a coluna é `image_url`.
- Testes React neste repo **não usam @testing-library**. O padrão é o docblock `// @vitest-environment jsdom` no topo, `createRoot` + `act`, e query por `container.querySelector`. Veja `packages/ide/src/views/ide/components/side-menu.spec.tsx` como referência canônica.
- `vitest.integration.config.ts` tem uma lista `include` **explícita**. Os globs `src/views/**/*.spec.tsx` e `src/hooks/**/*.spec.tsx` já estão lá; `src/components/**` e `src/pages/**` **não** estão de modo geral. Coloque specs novos sob `views/` ou `hooks/`, ou adicione o caminho ao `include`.
- Ao mockar `lucide-react` com `vi.mock`, você precisa enumerar **todos** os ícones que o componente sob teste importa, senão o import quebra.
- `KeywordProvider` **não** está no `_app.tsx`. Cada página que precisa dele o instancia (ex.: `pages/language-creator.tsx`). Não há aninhamento.
- Páginas protegidas usam `NomeDaPagina.requireAuth = true` no fim do arquivo; o `AuthGuard` em `_app.tsx` cuida do redirect.

**Comandos:**

```bash
# backend
cd backend && uv run pytest tests/ -v
cd backend && uv run alembic upgrade head

# front
cd packages/ide && npm run test
```

---

## File Structure

**Backend**

| Arquivo | Responsabilidade | Ação |
|---|---|---|
| `backend/migrations/versions/c3d4e5f6a7b8_language_presentation_fields.py` | Adicionar as três colunas | criar |
| `backend/app/models/language.py` | Mapear as três colunas | modificar |
| `backend/app/schemas/languages.py` | Expor os campos nos 4 schemas | modificar |
| `backend/app/modules/languages/service.py` | Propagar em create e clone | modificar |
| `backend/tests/test_languages_presentation.py` | Cobrir create/update/clone/summary | criar |

**Front — API e tipos**

| Arquivo | Responsabilidade | Ação |
|---|---|---|
| `packages/ide/src/lib/languages-api.ts` | Tipos e payloads com identidade | modificar |

**Front — navegação e página**

| Arquivo | Responsabilidade | Ação |
|---|---|---|
| `packages/ide/src/components/sidebar.tsx` | Item "Minhas Linguagens" nos dois menus | modificar |
| `packages/ide/src/pages/languages/index.tsx` | Shell da página, `requireAuth` | criar |
| `packages/ide/src/views/languages/components/languages-header.tsx` | Título + "Nova Linguagem" | criar |
| `packages/ide/src/views/languages/components/language-card.tsx` | Um card e suas quatro ações | criar |
| `packages/ide/src/views/languages/components/languages-grid.tsx` | Grid, loading, estado vazio | criar |
| `packages/ide/src/views/languages/languages-view.tsx` | Compõe header + grid, orquestra mutações | criar |
| `packages/ide/src/views/languages/languages-view.spec.tsx` | Teste da view | criar |
| `packages/ide/src/views/dashboard/sidebar.spec.tsx` | Teste do Sidebar | criar |

**Front — persistência do wizard**

| Arquivo | Responsabilidade | Ação |
|---|---|---|
| `packages/ide/src/hooks/useLanguagePersistence.ts` | Decidir e executar create/update/local | criar |
| `packages/ide/src/hooks/useLanguagePersistence.spec.tsx` | Teste dos três modos | criar |
| `packages/ide/src/pages/language-creator.tsx` | Ler `?id=N`, carregar, semear | modificar |
| `packages/ide/src/components/keyword-customizer.tsx` | Repassar props ao provider | modificar |
| `packages/ide/src/components/keyword-customizer/keyword-customizer-context.tsx` | Consumir o hook no save | modificar |
| `packages/ide/src/components/keyword-customizer/keyword-customizer-types.ts` | `saveMode` e `editingLanguageId` no contrato | modificar |
| `packages/ide/src/components/keyword-customizer/keyword-customizer-footer.tsx` | Rótulo conforme o modo | modificar |
| `packages/ide/src/components/keyword-customizer/keyword-customizer-header.tsx` | Nome em edição; remover botão do modal | modificar |
| `packages/ide/src/components/language-library/LanguageLibraryModal.tsx` | — | **remover** |

**Front — seletor do IDE**

| Arquivo | Responsabilidade | Ação |
|---|---|---|
| `packages/ide/src/hooks/useLanguageChoices.ts` | Unificar backend/localStorage numa lista só | criar |
| `packages/ide/src/hooks/useLanguageChoices.spec.tsx` | Teste dos dois caminhos | criar |
| `packages/ide/src/views/ide/components/language-selector.tsx` | Consumir o hook | modificar |
| `packages/ide/src/views/ide/components/side-explorer/language-panel.tsx` | Consumir o hook | modificar |

---

## Task 1: Campos de identidade no backend

**Goal:** `languages` guarda `image_url`, `image_query` e `preset_id`, e eles sobrevivem a create, update e clone.

**Files:**
- Create: `backend/migrations/versions/c3d4e5f6a7b8_language_presentation_fields.py`
- Modify: `backend/app/models/language.py`
- Modify: `backend/app/schemas/languages.py`
- Modify: `backend/app/modules/languages/service.py:63-79` (`create_language`), `:118-145` (`clone_language`)
- Test: `backend/tests/test_languages_presentation.py`

**Acceptance Criteria:**
- [ ] `POST /languages` aceita e devolve os três campos
- [ ] `PATCH /languages/:id` atualiza qualquer subconjunto dos três
- [ ] `POST /languages/:id/clone` copia os três da origem
- [ ] `GET /languages` (summary) traz `imageUrl` e **não** traz `imageQuery` nem `presetId`
- [ ] Linguagens pré-existentes continuam válidas com os três campos em `null`

**Verify:** `cd backend && uv run pytest tests/test_languages_presentation.py tests/test_languages.py -v` → todos PASS

**Steps:**

- [ ] **Step 1: Escrever os testes que falham**

Crie `backend/tests/test_languages_presentation.py`:

```python
import os

os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only-not-for-production")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")

import pytest
from httpx import AsyncClient

from app.models.user import UserRole
from tests.factories import create_organization, create_user

pytestmark = pytest.mark.asyncio

MINIMAL_CUSTOMIZATION = {
    "mappings": [],
    "operatorWordMap": {},
    "booleanLiteralMap": {"true": "true", "false": "false"},
    "statementTerminatorLexeme": ";",
    "blockDelimiters": {"open": "{", "close": "}"},
    "modes": {"semicolon": "required", "block": "braces", "typing": "static", "array": "brackets"},
    "languageDocumentation": {},
}


def _auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


async def _login(async_client: AsyncClient, async_session, email: str = "id@example.com") -> str:
    org = await create_organization(async_session)
    await create_user(
        async_session, organization_id=org.id, email=email,
        password="secret123", role=UserRole.STUDENT,
    )
    response = await async_client.post(
        "/auth/login", json={"email": email, "password": "secret123"}
    )
    return response.json()["accessToken"]


class TestPresentationFields:
    async def test_create_persists_presentation_fields(self, async_client, async_session):
        token = await _login(async_client, async_session)

        response = await async_client.post(
            "/languages",
            json={
                "name": "Gatinho",
                "customization": MINIMAL_CUSTOMIZATION,
                "imageUrl": "https://cdn.example/gato.png",
                "imageQuery": "gato",
                "presetId": "ptbr",
            },
            headers=_auth(token),
        )

        assert response.status_code == 201
        body = response.json()
        assert body["imageUrl"] == "https://cdn.example/gato.png"
        assert body["imageQuery"] == "gato"
        assert body["presetId"] == "ptbr"

    async def test_presentation_fields_default_to_null(self, async_client, async_session):
        token = await _login(async_client, async_session, "null@example.com")

        response = await async_client.post(
            "/languages",
            json={"name": "Sem imagem", "customization": MINIMAL_CUSTOMIZATION},
            headers=_auth(token),
        )

        assert response.status_code == 201
        body = response.json()
        assert body["imageUrl"] is None
        assert body["imageQuery"] is None
        assert body["presetId"] is None

    async def test_update_changes_presentation_fields(self, async_client, async_session):
        token = await _login(async_client, async_session, "upd@example.com")
        created = await async_client.post(
            "/languages",
            json={
                "name": "Antes",
                "customization": MINIMAL_CUSTOMIZATION,
                "imageUrl": "https://cdn.example/antes.png",
                "presetId": "free",
            },
            headers=_auth(token),
        )
        language_id = created.json()["id"]

        response = await async_client.patch(
            f"/languages/{language_id}",
            json={"imageUrl": "https://cdn.example/depois.png"},
            headers=_auth(token),
        )

        assert response.status_code == 200
        body = response.json()
        assert body["imageUrl"] == "https://cdn.example/depois.png"
        # Campos não enviados permanecem intactos.
        assert body["presetId"] == "free"

    async def test_clone_copies_presentation_fields(self, async_client, async_session):
        token = await _login(async_client, async_session, "clone@example.com")
        created = await async_client.post(
            "/languages",
            json={
                "name": "Original",
                "customization": MINIMAL_CUSTOMIZATION,
                "imageUrl": "https://cdn.example/orig.png",
                "imageQuery": "original",
                "presetId": "ptbr",
            },
            headers=_auth(token),
        )
        language_id = created.json()["id"]

        response = await async_client.post(
            f"/languages/{language_id}/clone", headers=_auth(token)
        )

        assert response.status_code == 201
        body = response.json()
        assert body["imageUrl"] == "https://cdn.example/orig.png"
        assert body["imageQuery"] == "original"
        assert body["presetId"] == "ptbr"
        assert body["clonedFromId"] == language_id

    async def test_summary_exposes_only_image_url(self, async_client, async_session):
        token = await _login(async_client, async_session, "sum@example.com")
        await async_client.post(
            "/languages",
            json={
                "name": "Resumo",
                "customization": MINIMAL_CUSTOMIZATION,
                "imageUrl": "https://cdn.example/resumo.png",
                "imageQuery": "resumo",
                "presetId": "ptbr",
            },
            headers=_auth(token),
        )

        response = await async_client.get("/languages", headers=_auth(token))

        assert response.status_code == 200
        entry = response.json()[0]
        assert entry["imageUrl"] == "https://cdn.example/resumo.png"
        assert "imageQuery" not in entry
        assert "presetId" not in entry
        assert "customization" not in entry
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd backend && uv run pytest tests/test_languages_presentation.py -v`
Expected: FAIL — `KeyError: 'imageUrl'` ou `assert None == 'https://cdn.example/gato.png'`, porque o schema ainda descarta os campos.

- [ ] **Step 3: Adicionar as colunas ao modelo**

Em `backend/app/models/language.py`, logo depois da coluna `customization`:

```python
    customization: Mapped[dict[str, Any]] = mapped_column(JSONType, nullable=False)
    image_url: Mapped[str | None] = mapped_column(String, nullable=True)
    image_query: Mapped[str | None] = mapped_column(String, nullable=True)
    preset_id: Mapped[str | None] = mapped_column(String, nullable=True)
```

- [ ] **Step 4: Criar a migration**

Crie `backend/migrations/versions/c3d4e5f6a7b8_language_presentation_fields.py`:

```python
"""language presentation fields

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-08-04 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c3d4e5f6a7b8"
down_revision: Union[str, Sequence[str], None] = "b2c3d4e5f6a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _apply_search_path() -> None:
    schema_name = op.get_context().config.get_main_option("schema_name") or "public"
    if schema_name != "public":
        schema_escaped = schema_name.replace('"', '""')
        op.execute(sa.text(f'SET search_path TO "{schema_escaped}"'))


def upgrade() -> None:
    """Upgrade schema."""
    _apply_search_path()

    # Nullable de propósito: linguagens criadas antes desta migration não têm
    # identidade visual e continuam válidas.
    op.add_column("languages", sa.Column("image_url", sa.String(), nullable=True))
    op.add_column("languages", sa.Column("image_query", sa.String(), nullable=True))
    op.add_column("languages", sa.Column("preset_id", sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    _apply_search_path()

    op.drop_column("languages", "preset_id")
    op.drop_column("languages", "image_query")
    op.drop_column("languages", "image_url")
```

- [ ] **Step 5: Estender os schemas**

Substitua o conteúdo de `backend/app/schemas/languages.py` por:

```python
from datetime import datetime
from typing import Any

from app.schemas.base import CamelModel


class LanguageCreate(CamelModel):
    name: str
    description: str | None = None
    customization: dict[str, Any]
    image_url: str | None = None
    image_query: str | None = None
    preset_id: str | None = None


class LanguageUpdate(CamelModel):
    name: str | None = None
    description: str | None = None
    customization: dict[str, Any] | None = None
    image_url: str | None = None
    image_query: str | None = None
    preset_id: str | None = None


class LanguageSummary(CamelModel):
    id: int
    owner_id: int
    name: str
    description: str | None
    image_url: str | None
    cloned_from_id: int | None
    updated_at: datetime


class LanguageResponse(CamelModel):
    id: int
    owner_id: int
    name: str
    description: str | None
    customization: dict[str, Any]
    image_url: str | None
    image_query: str | None
    preset_id: str | None
    cloned_from_id: int | None
    created_at: datetime
    updated_at: datetime


class ActiveLanguageUpdate(CamelModel):
    language_id: int | None = None
```

- [ ] **Step 6: Propagar em create e clone**

`update_language` já usa `data.model_dump(exclude_unset=True)`, então herda os campos novos sem alteração. `create_language` e `clone_language` constroem o objeto à mão e precisam dos campos.

Em `backend/app/modules/languages/service.py`, dentro de `create_language`:

```python
    language = Language(
        owner_id=user_id,
        name=data.name,
        description=data.description,
        customization=data.customization,
        image_url=data.image_url,
        image_query=data.image_query,
        preset_id=data.preset_id,
    )
```

E dentro de `clone_language`:

```python
    clone = Language(
        owner_id=user_id,
        name=name,
        description=source.description,
        customization=source.customization,
        image_url=source.image_url,
        image_query=source.image_query,
        preset_id=source.preset_id,
        cloned_from_id=source.id,
    )
```

- [ ] **Step 7: Rodar os testes**

Run: `cd backend && uv run pytest tests/test_languages_presentation.py tests/test_languages.py -v`
Expected: PASS em todos. `test_languages.py` não pode regredir — se `test_list_returns_only_my_languages` quebrar, é porque ele asserta o shape exato do summary; ajuste o teste para tolerar a chave `imageUrl` nova.

- [ ] **Step 8: Rodar a suíte inteira do backend**

Run: `cd backend && uv run pytest tests/ -v`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add backend/app/models/language.py backend/app/schemas/languages.py \
        backend/app/modules/languages/service.py \
        backend/migrations/versions/c3d4e5f6a7b8_language_presentation_fields.py \
        backend/tests/test_languages_presentation.py
git commit -m "feat(backend): guardar imagem, busca e preset das linguagens"
```

---

## Task 2: Identidade no cliente de API do front

**Goal:** Os tipos TypeScript e os payloads carregam os três campos, para as tarefas seguintes poderem usá-los.

**Files:**
- Modify: `packages/ide/src/lib/languages-api.ts`

**Acceptance Criteria:**
- [ ] `LanguageSummary` tem `imageUrl: string | null`
- [ ] `Language` tem `imageUrl`, `imageQuery`, `presetId`
- [ ] `CreateLanguageInput` e `UpdateLanguageInput` aceitam os três
- [ ] `npx tsc --noEmit` não acusa erro novo

**Verify:** `cd packages/ide && npx tsc --noEmit` → sem erros novos

**Steps:**

- [ ] **Step 1: Atualizar os tipos**

Em `packages/ide/src/lib/languages-api.ts`, substitua os quatro tipos do topo:

```ts
export type LanguageSummary = {
  id: number;
  ownerId: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  clonedFromId: number | null;
  updatedAt: string;
};

export type Language = LanguageSummary & {
  customization: StoredKeywordCustomization;
  imageQuery: string | null;
  presetId: string | null;
  createdAt: string;
};

export type CreateLanguageInput = {
  name: string;
  description?: string | null;
  customization: StoredKeywordCustomization;
  imageUrl?: string | null;
  imageQuery?: string | null;
  presetId?: string | null;
};

export type UpdateLanguageInput = Partial<{
  name: string;
  description: string | null;
  customization: StoredKeywordCustomization;
  imageUrl: string | null;
  imageQuery: string | null;
  presetId: string | null;
}>;
```

As funções de `languagesApi` não mudam — elas só repassam o objeto.

- [ ] **Step 2: Checar tipos**

Run: `cd packages/ide && npx tsc --noEmit`
Expected: sem erros. Se algum consumidor construía um `Language` literal em teste, ele agora exige os campos novos — adicione-os como `null`.

- [ ] **Step 3: Commit**

```bash
git add packages/ide/src/lib/languages-api.ts
git commit -m "feat(ide): tipar campos de identidade da linguagem"
```

---

## Task 3: Item "Minhas Linguagens" no Sidebar

**Goal:** Aluno e professor veem a mesma entrada no menu lateral, e ela fica ativa também durante a edição no wizard.

**Files:**
- Modify: `packages/ide/src/components/sidebar.tsx`
- Test: `packages/ide/src/views/dashboard/sidebar.spec.tsx`

**Acceptance Criteria:**
- [ ] O item aparece no menu do aluno
- [ ] O item aparece no menu do professor
- [ ] `href` é `/languages`
- [ ] O item fica com o estilo ativo em `/languages` **e** em `/language-creator`

**Verify:** `cd packages/ide && npx vitest run --config vitest.integration.config.ts src/views/dashboard/sidebar.spec.tsx` → PASS

**Steps:**

- [ ] **Step 1: Escrever o teste que falha**

O spec vai em `views/dashboard/` e não em `components/` porque o `include` do vitest cobre `src/views/**/*.spec.tsx` mas não `src/components/*.spec.tsx`.

Crie `packages/ide/src/views/dashboard/sidebar.spec.tsx`:

```tsx
// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Sidebar } from "@/components/sidebar";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const useRouterMock = vi.fn();
const useAuthMock = vi.fn();

vi.mock("next/router", () => ({
  useRouter: () => useRouterMock(),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("lucide-react", () => ({
  BookOpen: () => <span>book</span>,
  Code2: () => <span>code</span>,
  Languages: () => <span>languages</span>,
  LayoutDashboard: () => <span>dashboard</span>,
  ListChecks: () => <span>list</span>,
}));

function render(pathname: string, isTeacher: boolean) {
  useRouterMock.mockReturnValue({ pathname });
  useAuthMock.mockReturnValue({ isAuthenticated: true, isTeacher });

  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(<Sidebar />);
  });

  return { container, root };
}

describe("Sidebar", () => {
  beforeEach(() => {
    useRouterMock.mockReset();
    useAuthMock.mockReset();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("mostra Minhas Linguagens para o aluno", () => {
    const { container, root } = render("/dashboard", false);

    const link = container.querySelector('a[href="/languages"]');
    expect(link).toBeTruthy();
    expect(link?.textContent).toContain("Minhas Linguagens");

    act(() => root.unmount());
  });

  it("mostra Minhas Linguagens para o professor", () => {
    const { container, root } = render("/dashboard", true);

    const link = container.querySelector('a[href="/languages"]');
    expect(link).toBeTruthy();

    act(() => root.unmount());
  });

  it("marca o item como ativo em /languages", () => {
    const { container, root } = render("/languages", false);

    const link = container.querySelector('a[href="/languages"]');
    expect(link?.className).toContain("bg-[#251e3c]");

    act(() => root.unmount());
  });

  it("mantém o item ativo enquanto o wizard está aberto", () => {
    const { container, root } = render("/language-creator", false);

    const link = container.querySelector('a[href="/languages"]');
    expect(link?.className).toContain("bg-[#251e3c]");

    act(() => root.unmount());
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd packages/ide && npx vitest run --config vitest.integration.config.ts src/views/dashboard/sidebar.spec.tsx`
Expected: FAIL — `expect(link).toBeTruthy()` recebe `null`, porque o item ainda não existe.

- [ ] **Step 3: Adicionar o item nos dois menus**

Em `packages/ide/src/components/sidebar.tsx`, inclua `Languages` no import de ícones:

```tsx
import { BookOpen, Code2, Languages, LayoutDashboard, ListChecks } from "lucide-react";
```

Defina o item uma vez só, acima dos dois arrays, para não duplicar o objeto:

```tsx
// Mesma entrada para aluno e professor: o acervo de linguagens é pessoal,
// não depende do papel. `activeMatchers` inclui /language-creator porque o
// wizard é uma rota irmã, não filha de /languages.
const languagesMenuItem: MenuItem = {
  id: "linguagens",
  label: "Minhas Linguagens",
  icon: <Languages className="w-5 h-5" />,
  href: "/languages",
  activeMatchers: ["/languages", "/language-creator"],
};

const studentMenu: MenuItem[] = [
  {
    id: "turmas",
    label: "Minhas Turmas",
    icon: <BookOpen className="w-5 h-5" />,
    href: "/dashboard",
    activeMatchers: ["/dashboard", "/classes"],
  },
  languagesMenuItem,
];

const teacherMenu: MenuItem[] = [
  {
    id: "painel",
    label: "Painel do Professor",
    icon: <LayoutDashboard className="w-5 h-5" />,
    href: "/dashboard",
    activeMatchers: ["/dashboard", "/classes"],
  },
  {
    id: "exercicios",
    label: "Meus Exercícios",
    icon: <Code2 className="w-5 h-5" />,
    href: "/exercises",
    activeMatchers: ["/exercises"],
  },
  {
    id: "listas",
    label: "Minhas Listas",
    icon: <ListChecks className="w-5 h-5" />,
    href: "/exercise-lists",
    activeMatchers: ["/exercise-lists"],
  },
  languagesMenuItem,
];
```

O resto do componente não muda — ele já itera `menuItems` e aplica `activeMatchers`.

- [ ] **Step 4: Rodar o teste**

Run: `cd packages/ide && npx vitest run --config vitest.integration.config.ts src/views/dashboard/sidebar.spec.tsx`
Expected: PASS nos quatro casos.

- [ ] **Step 5: Commit**

```bash
git add packages/ide/src/components/sidebar.tsx packages/ide/src/views/dashboard/sidebar.spec.tsx
git commit -m "feat(ide): entrada Minhas Linguagens no sidebar"
```

---

## Task 4: Página `/languages`

**Goal:** Uma página listando as linguagens do usuário em cards, com criar, editar, ativar, duplicar e excluir — substituindo o `LanguageLibraryModal`.

**Files:**
- Create: `packages/ide/src/pages/languages/index.tsx`
- Create: `packages/ide/src/views/languages/components/languages-header.tsx`
- Create: `packages/ide/src/views/languages/components/language-card.tsx`
- Create: `packages/ide/src/views/languages/components/languages-grid.tsx`
- Create: `packages/ide/src/views/languages/languages-view.tsx`
- Test: `packages/ide/src/views/languages/languages-view.spec.tsx`

**Acceptance Criteria:**
- [ ] `/languages` exige autenticação
- [ ] A grid mostra um card por linguagem, com imagem, nome e descrição
- [ ] A linguagem ativa é distinguível
- [ ] Editar navega para `/language-creator?id=N`
- [ ] Ativar, duplicar e excluir chamam as mutações certas
- [ ] Excluir uma linguagem em uso mostra a mensagem de 409, não um erro genérico
- [ ] Estado vazio oferece criar a primeira

**Verify:** `cd packages/ide && npx vitest run --config vitest.integration.config.ts src/views/languages/languages-view.spec.tsx` → PASS

**Steps:**

- [ ] **Step 1: Escrever o teste que falha**

Crie `packages/ide/src/views/languages/languages-view.spec.tsx`:

```tsx
// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguagesView } from "./languages-view";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const pushMock = vi.fn();
const listQueryMock = vi.fn();
const setActiveMutateMock = vi.fn();
const cloneMutateMock = vi.fn();
const deleteMutateMock = vi.fn();
const showToastMock = vi.fn();

vi.mock("next/router", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/hooks/useLanguages", () => ({
  useLanguagesList: () => listQueryMock(),
  useSetActiveLanguage: () => ({
    mutateAsync: setActiveMutateMock,
    isPending: false,
  }),
  useCloneLanguage: () => ({ mutateAsync: cloneMutateMock, isPending: false }),
  useDeleteLanguage: () => ({ mutateAsync: deleteMutateMock, isPending: false }),
  useActiveLanguage: () => ({ data: { id: 1 } }),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ showToast: showToastMock }),
}));

vi.mock("lucide-react", () => ({
  Copy: () => <span>copy</span>,
  Languages: () => <span>languages</span>,
  Loader2: () => <span>loading</span>,
  Pencil: () => <span>pencil</span>,
  Plus: () => <span>plus</span>,
  Star: () => <span>star</span>,
  Trash2: () => <span>trash</span>,
}));

const LANGUAGES = [
  {
    id: 1,
    ownerId: 7,
    name: "PtBr-Lang",
    description: "Português",
    imageUrl: "https://cdn.example/ptbr.png",
    clonedFromId: null,
    updatedAt: "2026-08-01T00:00:00Z",
  },
  {
    id: 2,
    ownerId: 7,
    name: "MinhaLang",
    description: null,
    imageUrl: null,
    clonedFromId: 1,
    updatedAt: "2026-08-02T00:00:00Z",
  },
];

function render() {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(<LanguagesView />);
  });
  return { container, root };
}

function click(element: Element | null | undefined) {
  act(() => {
    element?.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    );
  });
}

describe("LanguagesView", () => {
  beforeEach(() => {
    pushMock.mockReset();
    setActiveMutateMock.mockReset().mockResolvedValue(undefined);
    cloneMutateMock.mockReset().mockResolvedValue({ name: "PtBr-Lang (cópia)" });
    deleteMutateMock.mockReset().mockResolvedValue(undefined);
    showToastMock.mockReset();
    listQueryMock.mockReturnValue({ data: LANGUAGES, isPending: false });
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renderiza um card por linguagem", () => {
    const { container, root } = render();

    const cards = container.querySelectorAll('[data-testid="language-card"]');
    expect(cards).toHaveLength(2);
    expect(container.textContent).toContain("PtBr-Lang");
    expect(container.textContent).toContain("MinhaLang");

    act(() => root.unmount());
  });

  it("marca visualmente a linguagem ativa", () => {
    const { container, root } = render();

    const active = container.querySelector('[data-language-active="true"]');
    expect(active).toBeTruthy();
    expect(active?.textContent).toContain("PtBr-Lang");

    act(() => root.unmount());
  });

  it("usa a imagem padrão quando a linguagem não tem imagem", () => {
    const { container, root } = render();

    const images = container.querySelectorAll("img");
    const sources = Array.from(images).map((image) => image.getAttribute("src"));
    expect(sources).toContain("https://cdn.example/ptbr.png");
    expect(sources).toContain("/images/language-default.png");

    act(() => root.unmount());
  });

  it("navega para o wizard com o id ao editar", () => {
    const { container, root } = render();

    click(container.querySelector('button[aria-label="Editar PtBr-Lang"]'));

    expect(pushMock).toHaveBeenCalledWith("/language-creator?id=1");

    act(() => root.unmount());
  });

  it("navega para o wizard sem id ao criar", () => {
    const { container, root } = render();

    click(container.querySelector('button[aria-label="Nova linguagem"]'));

    expect(pushMock).toHaveBeenCalledWith("/language-creator");

    act(() => root.unmount());
  });

  it("ativa a linguagem escolhida", async () => {
    const { container, root } = render();

    click(container.querySelector('button[aria-label="Tornar MinhaLang ativa"]'));
    await act(async () => {});

    expect(setActiveMutateMock).toHaveBeenCalledWith(2);

    act(() => root.unmount());
  });

  it("duplica a linguagem escolhida", async () => {
    const { container, root } = render();

    click(container.querySelector('button[aria-label="Duplicar PtBr-Lang"]'));
    await act(async () => {});

    expect(cloneMutateMock).toHaveBeenCalledWith(1);

    act(() => root.unmount());
  });

  it("explica o 409 ao excluir uma linguagem em uso", async () => {
    deleteMutateMock.mockRejectedValue({ response: { status: 409 } });
    vi.spyOn(window, "confirm").mockReturnValue(true);

    const { container, root } = render();

    click(container.querySelector('button[aria-label="Excluir PtBr-Lang"]'));
    await act(async () => {});

    expect(showToastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "error",
        message: expect.stringContaining("exercício"),
      }),
    );

    act(() => root.unmount());
  });

  it("oferece criar a primeira quando não há nenhuma", () => {
    listQueryMock.mockReturnValue({ data: [], isPending: false });

    const { container, root } = render();

    expect(container.textContent).toContain("Nenhuma linguagem");
    expect(
      container.querySelectorAll('[data-testid="language-card"]'),
    ).toHaveLength(0);

    act(() => root.unmount());
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd packages/ide && npx vitest run --config vitest.integration.config.ts src/views/languages/languages-view.spec.tsx`
Expected: FAIL — não consegue resolver `./languages-view`.

- [ ] **Step 3: Criar o card**

Crie `packages/ide/src/views/languages/components/language-card.tsx`:

```tsx
import { Copy, Pencil, Star, Trash2 } from "lucide-react";
import type { LanguageSummary } from "@/lib/languages-api";

const DEFAULT_LANGUAGE_IMAGE = "/images/language-default.png";

export type LanguageCardProps = {
  language: LanguageSummary;
  isActive: boolean;
  onEdit: (id: number) => void;
  onSetActive: (id: number, name: string) => void;
  onClone: (id: number, name: string) => void;
  onDelete: (id: number, name: string) => void;
};

export function LanguageCard({
  language,
  isActive,
  onEdit,
  onSetActive,
  onClone,
  onDelete,
}: LanguageCardProps) {
  return (
    <article
      data-testid="language-card"
      data-language-active={isActive ? "true" : "false"}
      className={`flex flex-col gap-3 rounded-2xl border p-4 transition-colors ${
        isActive
          ? "border-[#3b305c] bg-[#251e3c]"
          : "border-white/5 bg-white/5 hover:bg-white/10"
      }`}
    >
      <div className="flex items-start gap-3">
        <img
          src={language.imageUrl || DEFAULT_LANGUAGE_IMAGE}
          alt=""
          className="h-12 w-12 shrink-0 rounded-xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {isActive && (
              <Star
                className="size-4 shrink-0 text-yellow-500"
                fill="currentColor"
                aria-label="Linguagem ativa"
              />
            )}
            <h3 className="truncate font-semibold text-white">{language.name}</h3>
          </div>
          {language.description && (
            <p className="mt-0.5 truncate text-xs text-slate-400">
              {language.description}
            </p>
          )}
          {language.clonedFromId !== null && (
            <span className="text-[11px] text-slate-500">(clone)</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={`Editar ${language.name}`}
          title="Editar"
          onClick={() => onEdit(language.id)}
          className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <Pencil className="size-4" />
        </button>
        <button
          type="button"
          aria-label={`Tornar ${language.name} ativa`}
          title="Tornar ativa"
          disabled={isActive}
          onClick={() => onSetActive(language.id, language.name)}
          className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-40"
        >
          <Star className="size-4" />
        </button>
        <button
          type="button"
          aria-label={`Duplicar ${language.name}`}
          title="Duplicar"
          onClick={() => onClone(language.id, language.name)}
          className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <Copy className="size-4" />
        </button>
        <button
          type="button"
          aria-label={`Excluir ${language.name}`}
          title="Excluir"
          onClick={() => onDelete(language.id, language.name)}
          className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </article>
  );
}
```

- [ ] **Step 4: Criar a grid**

Crie `packages/ide/src/views/languages/components/languages-grid.tsx`:

```tsx
import { Loader2 } from "lucide-react";
import type { LanguageSummary } from "@/lib/languages-api";
import { LanguageCard, type LanguageCardProps } from "./language-card";

type LanguagesGridProps = Omit<LanguageCardProps, "language" | "isActive"> & {
  languages: LanguageSummary[];
  loading: boolean;
  activeLanguageId: number | null;
  onCreate: () => void;
};

export function LanguagesGrid({
  languages,
  loading,
  activeLanguageId,
  onCreate,
  ...actions
}: LanguagesGridProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-slate-500" />
      </div>
    );
  }

  if (languages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
        <p className="text-slate-400">
          Nenhuma linguagem salva ainda.
        </p>
        <button
          type="button"
          onClick={onCreate}
          className="mt-4 rounded-xl bg-blue-500 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-400"
        >
          Criar a primeira
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {languages.map((language) => (
        <LanguageCard
          key={language.id}
          language={language}
          isActive={language.id === activeLanguageId}
          {...actions}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Criar o header**

Crie `packages/ide/src/views/languages/components/languages-header.tsx`:

```tsx
import { Plus } from "lucide-react";
import { HeroButton } from "@/components/buttons/hero";
import { GradientText } from "@/components/text/gradient";
import { Subtitle } from "@/components/text/subtitle";
import { Title } from "@/components/text/title";

export function LanguagesHeader({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
      <div>
        <Title>
          <GradientText>Minhas Linguagens</GradientText>
        </Title>
        <Subtitle className="mt-1">
          Crie e mantenha suas próprias versões do Java--
        </Subtitle>
      </div>
      <HeroButton
        onClick={onCreate}
        aria-label="Nova linguagem"
        className="group gap-2 px-6 py-3"
      >
        <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
        Nova Linguagem
      </HeroButton>
    </div>
  );
}
```

- [ ] **Step 6: Criar a view que orquestra**

Crie `packages/ide/src/views/languages/languages-view.tsx`:

```tsx
import { useRouter } from "next/router";
import {
  useActiveLanguage,
  useCloneLanguage,
  useDeleteLanguage,
  useLanguagesList,
  useSetActiveLanguage,
} from "@/hooks/useLanguages";
import { useToast } from "@/contexts/ToastContext";
import { LanguagesGrid } from "./components/languages-grid";
import { LanguagesHeader } from "./components/languages-header";

export function LanguagesView() {
  const router = useRouter();
  const { showToast } = useToast();
  const listQuery = useLanguagesList();
  const activeQuery = useActiveLanguage();
  const setActiveMut = useSetActiveLanguage();
  const cloneMut = useCloneLanguage();
  const deleteMut = useDeleteLanguage();

  const languages = listQuery.data ?? [];
  const activeLanguageId = activeQuery.data?.id ?? null;

  const success = (message: string) => showToast({ type: "success", message });
  const failure = (message: string) => showToast({ type: "error", message });

  const goToCreator = (id?: number) => {
    void router.push(id === undefined ? "/language-creator" : `/language-creator?id=${id}`);
  };

  const handleSetActive = async (id: number, name: string) => {
    try {
      await setActiveMut.mutateAsync(id);
      success(`"${name}" agora é sua linguagem ativa.`);
    } catch {
      failure("Não foi possível ativar a linguagem.");
    }
  };

  const handleClone = async (id: number, name: string) => {
    try {
      const clone = await cloneMut.mutateAsync(id);
      success(`"${name}" duplicada como "${clone.name}".`);
    } catch {
      failure("Não foi possível duplicar.");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Excluir a linguagem "${name}"?`)) return;
    try {
      await deleteMut.mutateAsync(id);
      success(`"${name}" excluída.`);
    } catch (error: any) {
      // 409 significa que algum exercício trava nesta linguagem — vale dizer
      // isso ao usuário em vez de um erro genérico.
      failure(
        error?.response?.status === 409
          ? "Esta linguagem está travada em algum exercício e não pode ser excluída."
          : "Não foi possível excluir.",
      );
    }
  };

  return (
    <>
      <LanguagesHeader onCreate={() => goToCreator()} />
      <LanguagesGrid
        languages={languages}
        loading={listQuery.isPending}
        activeLanguageId={activeLanguageId}
        onCreate={() => goToCreator()}
        onEdit={(id) => goToCreator(id)}
        onSetActive={handleSetActive}
        onClone={handleClone}
        onDelete={handleDelete}
      />
    </>
  );
}
```

- [ ] **Step 7: Criar a página**

Crie `packages/ide/src/pages/languages/index.tsx`, espelhando o shell de `pages/dashboard/index.tsx`:

```tsx
import { SpaceBackground } from "@/components/space-background";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { LanguagesView } from "@/views/languages/languages-view";

export default function LanguagesPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0A0A0F] font-sans">
      <SpaceBackground />
      <Navbar />
      <div className="relative z-10 flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex w-full flex-1 flex-col overflow-y-auto">
          <main className="mx-auto w-full max-w-7xl px-6 py-12">
            <LanguagesView />
          </main>
        </div>
      </div>
    </div>
  );
}

LanguagesPage.requireAuth = true;
```

- [ ] **Step 8: Rodar o teste**

Run: `cd packages/ide && npx vitest run --config vitest.integration.config.ts src/views/languages/languages-view.spec.tsx`
Expected: PASS nos nove casos.

- [ ] **Step 9: Conferir que a imagem padrão existe**

Run: `ls packages/ide/public/images/language-default.png`
Expected: o arquivo existe (já é usado por `language-panel.tsx:37`). Se não existir, o card ainda funciona — só mostra imagem quebrada; nesse caso reporte, não invente um asset.

- [ ] **Step 10: Commit**

```bash
git add packages/ide/src/pages/languages packages/ide/src/views/languages
git commit -m "feat(ide): pagina /languages com o acervo de linguagens"
```

---

## Task 5: Hook `useLanguagePersistence`

**Goal:** Um único lugar decide entre `POST`, `PATCH` e localStorage, e traduz o 409 de nome duplicado.

**Files:**
- Create: `packages/ide/src/hooks/useLanguagePersistence.ts`
- Test: `packages/ide/src/hooks/useLanguagePersistence.spec.tsx`

**Acceptance Criteria:**
- [ ] Deslogado → `mode === "local"` e grava via `saveSavedKeywordLanguage`, sem chamada de rede
- [ ] Logado sem id → `mode === "create"` e chama `useCreateLanguage`
- [ ] Logado com id → `mode === "update"` e chama `useUpdateLanguage`
- [ ] Os cinco campos de identidade chegam no payload
- [ ] Um 409 volta como `{ ok: false, reason: "duplicate-name" }`
- [ ] Qualquer outro erro volta como `{ ok: false, reason: "unknown" }`

**Verify:** `cd packages/ide && npx vitest run --config vitest.integration.config.ts src/hooks/useLanguagePersistence.spec.tsx` → PASS

**Steps:**

- [ ] **Step 1: Escrever o teste que falha**

Crie `packages/ide/src/hooks/useLanguagePersistence.spec.tsx`:

```tsx
// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  useLanguagePersistence,
  type LanguageSaveInput,
  type LanguageSaveResult,
} from "./useLanguagePersistence";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const useAuthMock = vi.fn();
const createMutateMock = vi.fn();
const updateMutateMock = vi.fn();
const saveLocalMock = vi.fn();

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock("@/hooks/useLanguages", () => ({
  useCreateLanguage: () => ({ mutateAsync: createMutateMock, isPending: false }),
  useUpdateLanguage: () => ({ mutateAsync: updateMutateMock, isPending: false }),
}));

vi.mock("@/lib/keyword-language-storage", () => ({
  saveSavedKeywordLanguage: (...args: unknown[]) => saveLocalMock(...args),
}));

const CUSTOMIZATION = {
  mappings: [],
  operatorWordMap: {},
  booleanLiteralMap: { true: "true", false: "false" },
  statementTerminatorLexeme: ";",
  blockDelimiters: { open: "{", close: "}" },
  modes: { semicolon: "required", block: "braces", typing: "static", array: "brackets" },
  languageDocumentation: {},
} as unknown as LanguageSaveInput["customization"];

const INPUT: LanguageSaveInput = {
  name: "Gatinho",
  description: "Linguagem felina",
  imageUrl: "https://cdn.example/gato.png",
  imageQuery: "gato",
  presetId: "ptbr",
  customization: CUSTOMIZATION,
};

function mount(editingLanguageId: number | null) {
  const captured: { current: ReturnType<typeof useLanguagePersistence> | null } = {
    current: null,
  };

  function Probe() {
    captured.current = useLanguagePersistence(editingLanguageId);
    return null;
  }

  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(<Probe />);
  });

  return { captured, root };
}

describe("useLanguagePersistence", () => {
  beforeEach(() => {
    createMutateMock.mockReset().mockResolvedValue({ id: 42 });
    updateMutateMock.mockReset().mockResolvedValue({ id: 7 });
    saveLocalMock.mockReset();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("grava no localStorage quando não há sessão", async () => {
    useAuthMock.mockReturnValue({ isAuthenticated: false });
    const { captured, root } = mount(null);

    expect(captured.current?.mode).toBe("local");

    let result: LanguageSaveResult | undefined;
    await act(async () => {
      result = await captured.current?.persist(INPUT);
    });

    expect(saveLocalMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Gatinho",
        slug: "Gatinho",
        imageUrl: "https://cdn.example/gato.png",
        imageQuery: "gato",
        presetId: "ptbr",
      }),
    );
    expect(createMutateMock).not.toHaveBeenCalled();
    expect(updateMutateMock).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: true, mode: "local", languageId: null });

    act(() => root.unmount());
  });

  it("cria no backend quando logado e sem id", async () => {
    useAuthMock.mockReturnValue({ isAuthenticated: true });
    const { captured, root } = mount(null);

    expect(captured.current?.mode).toBe("create");

    let result: LanguageSaveResult | undefined;
    await act(async () => {
      result = await captured.current?.persist(INPUT);
    });

    expect(createMutateMock).toHaveBeenCalledWith({
      name: "Gatinho",
      description: "Linguagem felina",
      customization: CUSTOMIZATION,
      imageUrl: "https://cdn.example/gato.png",
      imageQuery: "gato",
      presetId: "ptbr",
    });
    expect(result).toEqual({ ok: true, mode: "create", languageId: 42 });

    act(() => root.unmount());
  });

  it("atualiza no backend quando logado e com id", async () => {
    useAuthMock.mockReturnValue({ isAuthenticated: true });
    const { captured, root } = mount(7);

    expect(captured.current?.mode).toBe("update");

    let result: LanguageSaveResult | undefined;
    await act(async () => {
      result = await captured.current?.persist(INPUT);
    });

    expect(updateMutateMock).toHaveBeenCalledWith({
      id: 7,
      input: {
        name: "Gatinho",
        description: "Linguagem felina",
        customization: CUSTOMIZATION,
        imageUrl: "https://cdn.example/gato.png",
        imageQuery: "gato",
        presetId: "ptbr",
      },
    });
    expect(result).toEqual({ ok: true, mode: "update", languageId: 7 });

    act(() => root.unmount());
  });

  it("reporta nome duplicado quando o backend devolve 409", async () => {
    useAuthMock.mockReturnValue({ isAuthenticated: true });
    createMutateMock.mockRejectedValue({ response: { status: 409 } });
    const { captured, root } = mount(null);

    let result: LanguageSaveResult | undefined;
    await act(async () => {
      result = await captured.current?.persist(INPUT);
    });

    expect(result).toEqual({ ok: false, reason: "duplicate-name" });

    act(() => root.unmount());
  });

  it("reporta falha genérica nos demais erros", async () => {
    useAuthMock.mockReturnValue({ isAuthenticated: true });
    createMutateMock.mockRejectedValue({ response: { status: 500 } });
    const { captured, root } = mount(null);

    let result: LanguageSaveResult | undefined;
    await act(async () => {
      result = await captured.current?.persist(INPUT);
    });

    expect(result).toEqual({ ok: false, reason: "unknown" });

    act(() => root.unmount());
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd packages/ide && npx vitest run --config vitest.integration.config.ts src/hooks/useLanguagePersistence.spec.tsx`
Expected: FAIL — não consegue resolver `./useLanguagePersistence`.

- [ ] **Step 3: Escrever o hook**

Crie `packages/ide/src/hooks/useLanguagePersistence.ts`:

```ts
import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateLanguage, useUpdateLanguage } from "@/hooks/useLanguages";
import { saveSavedKeywordLanguage } from "@/lib/keyword-language-storage";
import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import type { WizardPresetId } from "@/components/keyword-customizer/wizard-model";

export type LanguageSaveMode = "local" | "create" | "update";

export type LanguageSaveInput = {
  name: string;
  description: string;
  imageUrl: string;
  imageQuery: string;
  presetId: WizardPresetId;
  customization: StoredKeywordCustomization;
};

export type LanguageSaveResult =
  | { ok: true; mode: LanguageSaveMode; languageId: number | null }
  | { ok: false; reason: "duplicate-name" | "unknown" };

/**
 * Decide onde a linguagem editada no wizard é persistida.
 *
 * Deslogado continua no localStorage, exatamente como antes — é o que
 * permite usar o wizard sem conta. Logado, a linguagem vai para o backend:
 * cria quando o wizard foi aberto em branco, atualiza quando foi aberto
 * com `?id=N`.
 */
export function useLanguagePersistence(editingLanguageId: number | null) {
  const { isAuthenticated } = useAuth();
  const createMut = useCreateLanguage();
  const updateMut = useUpdateLanguage();

  const mode: LanguageSaveMode = !isAuthenticated
    ? "local"
    : editingLanguageId !== null
      ? "update"
      : "create";

  const persist = useCallback(
    async (input: LanguageSaveInput): Promise<LanguageSaveResult> => {
      if (mode === "local") {
        saveSavedKeywordLanguage({
          name: input.name,
          slug: input.name,
          description: input.description,
          imageUrl: input.imageUrl,
          imageQuery: input.imageQuery,
          presetId: input.presetId,
          customization: input.customization,
        });
        return { ok: true, mode, languageId: null };
      }

      const payload = {
        name: input.name,
        description: input.description,
        customization: input.customization,
        imageUrl: input.imageUrl,
        imageQuery: input.imageQuery,
        presetId: input.presetId,
      };

      try {
        if (mode === "update" && editingLanguageId !== null) {
          await updateMut.mutateAsync({ id: editingLanguageId, input: payload });
          return { ok: true, mode, languageId: editingLanguageId };
        }

        const created = await createMut.mutateAsync(payload);
        return { ok: true, mode, languageId: created.id };
      } catch (error: unknown) {
        // UNIQUE (owner_id, name) no backend. Vale distinguir do resto porque
        // é o único erro que o usuário consegue corrigir sozinho.
        const status = (error as { response?: { status?: number } })?.response
          ?.status;
        return {
          ok: false,
          reason: status === 409 ? "duplicate-name" : "unknown",
        };
      }
    },
    [createMut, editingLanguageId, mode, updateMut],
  );

  return {
    mode,
    persist,
    isPending: createMut.isPending || updateMut.isPending,
  };
}
```

- [ ] **Step 4: Rodar o teste**

Run: `cd packages/ide && npx vitest run --config vitest.integration.config.ts src/hooks/useLanguagePersistence.spec.tsx`
Expected: PASS nos cinco casos.

- [ ] **Step 5: Commit**

```bash
git add packages/ide/src/hooks/useLanguagePersistence.ts packages/ide/src/hooks/useLanguagePersistence.spec.tsx
git commit -m "feat(ide): hook de persistencia da linguagem do wizard"
```

---

## Task 6: Wizard vira criador e editor

**Goal:** `/language-creator?id=N` carrega a linguagem, o save persiste no backend quando logado, e o `LanguageLibraryModal` sai de cena.

**Files:**
- Modify: `packages/ide/src/pages/language-creator.tsx`
- Modify: `packages/ide/src/components/keyword-customizer.tsx`
- Modify: `packages/ide/src/components/keyword-customizer/keyword-customizer-context.tsx:69-82` (props), `:552-684` (`exit`/`save`)
- Modify: `packages/ide/src/components/keyword-customizer/keyword-customizer-types.ts`
- Modify: `packages/ide/src/components/keyword-customizer/keyword-customizer-footer.tsx`
- Modify: `packages/ide/src/components/keyword-customizer/keyword-customizer-header.tsx`
- Delete: `packages/ide/src/components/language-library/LanguageLibraryModal.tsx`

**Acceptance Criteria:**
- [ ] Sem `?id`, o wizard abre em branco como hoje
- [ ] Com `?id=N` e sessão, o wizard abre preenchido com a linguagem N
- [ ] O botão final diz "Salvar alterações" no modo update, "Salvar como nova" no create, "Salvar e Aplicar" no local
- [ ] O header mostra o nome da linguagem em edição
- [ ] Salvar logado redireciona para `/languages`; deslogado mantém o `exit()` atual
- [ ] Nome duplicado mostra a mensagem específica e mantém o usuário no wizard
- [ ] `LanguageLibraryModal.tsx` não existe mais e nada o importa
- [ ] `keyword-customizer.spec.tsx` continua verde

**Verify:** `cd packages/ide && npm run test` → PASS

**Steps:**

- [ ] **Step 1: Estender o contrato de tipos**

Em `packages/ide/src/components/keyword-customizer/keyword-customizer-types.ts`, importe o tipo do modo e acrescente dois campos ao valor do contexto:

```ts
import type { LanguageSaveMode } from "@/hooks/useLanguagePersistence";
```

E dentro de `KeywordCustomizerContextValue`, logo depois de `hasChanges`:

```ts
  hasChanges: boolean;
  saveMode: LanguageSaveMode;
  editingLanguageId: number | null;
  actions: KeywordCustomizerSyncActions & KeywordCustomizerWizardActions;
```

- [ ] **Step 2: Aceitar props no provider**

Em `keyword-customizer-context.tsx`, troque a assinatura e semeie o estado de identidade a partir da linguagem carregada. Os `useState` de identidade passam a receber um valor inicial:

```tsx
export function KeywordCustomizerProvider({
  children,
  editingLanguageId = null,
  initialLanguage = null,
}: {
  children: ReactNode;
  editingLanguageId?: number | null;
  initialLanguage?: Language | null;
}) {
  const router = useRouter();
  const {
    customization,
    setCustomization,
    validateKeyword,
    validateBlockDelimiters,
  } = useKeywords();
  const [draftCustomization, setDraftCustomization] =
    useState<IDEKeywordCustomizationState>(
      initialLanguage?.customization ?? customization,
    );
```

Adicione o import do tipo no topo do arquivo:

```tsx
import type { Language } from "@/lib/languages-api";
import { useLanguagePersistence } from "@/hooks/useLanguagePersistence";
```

E semeie os campos de identidade — substitua as quatro linhas de `useState` correspondentes (hoje em `:97-102`):

```tsx
  const [selectedPresetId, setSelectedPresetId] = useState<WizardPresetId>(
    (initialLanguage?.presetId as WizardPresetId | null) ?? "free",
  );
  const [languageName, setLanguageNameState] = useState(
    initialLanguage?.name ?? "",
  );
  const [languageDescription, setLanguageDescription] = useState(
    initialLanguage?.description ?? "",
  );
  const [languageImageUrl, setLanguageImageUrl] = useState(
    initialLanguage?.imageUrl ?? "",
  );
  const [languageImageQuery, setLanguageImageQuery] = useState(
    initialLanguage?.imageQuery ?? "",
  );
```

Os valores iniciais bastam porque a página só monta o provider depois de a query resolver (Step 5) — não é preciso um efeito de sincronização.

- [ ] **Step 3: Instanciar o hook de persistência**

Ainda em `keyword-customizer-context.tsx`, logo abaixo das declarações de estado:

```tsx
  const { mode: saveMode, persist } = useLanguagePersistence(editingLanguageId);
```

- [ ] **Step 4: Reescrever o final do `save`**

O `save` valida e monta `nextCustomization` exatamente como hoje. Só o bloco final muda. Substitua o trecho que hoje vai de `setDraftCustomization(nextCustomization);` até `exit();` (hoje `:655-671`) por:

```tsx
    setDraftCustomization(nextCustomization);
    setCustomization(nextCustomization);
    setCurrentError(null);
    setDelimiterError(null);
    setBooleanLiteralError(null);
    setStatementTerminatorError(null);
    setOperatorError(null);

    void persist({
      name: trimmedLanguageName,
      description: languageDescription.trim(),
      imageUrl: languageImageUrl,
      imageQuery: languageImageQuery.trim(),
      presetId: selectedPresetId,
      customization: nextCustomization,
    }).then((result) => {
      if (!result.ok) {
        // Mantém o usuário no wizard: o nome é corrigível ali mesmo.
        setCurrentError(
          result.reason === "duplicate-name"
            ? "Você já tem uma linguagem com esse nome."
            : "Não foi possível salvar a linguagem. Tente de novo.",
        );
        setActiveWizardStepId("identity");
        return;
      }

      if (result.mode === "local") {
        exit();
        return;
      }

      void router.push("/languages");
    });
  }, [
    draftCustomization,
    exit,
    getOperatorValidationDelimiters,
    languageImageQuery,
    languageImageUrl,
    languageDescription,
    languageName,
    persist,
    router,
    selectedPresetId,
    setCustomization,
    validateBlockDelimiters,
    validateDraftKeyword,
  ]);
```

Remova o import de `saveSavedKeywordLanguage` do topo do arquivo — a gravação local agora é responsabilidade do hook.

- [ ] **Step 5: Expor `saveMode` e `editingLanguageId` no valor do contexto**

No objeto `value` (hoje em `:686`), acrescente as duas chaves:

```tsx
  const value: KeywordCustomizerContextValue = {
    form,
    draftCustomization,
    preview,
    // ... demais campos inalterados ...
    hasChanges,
    saveMode,
    editingLanguageId,
    actions: { /* inalterado */ },
  };
```

- [ ] **Step 6: Repassar as props pelo componente**

Substitua o rodapé de `packages/ide/src/components/keyword-customizer.tsx`:

```tsx
export function KeywordCustomizer({
  editingLanguageId = null,
  initialLanguage = null,
}: {
  editingLanguageId?: number | null;
  initialLanguage?: Language | null;
}) {
  return (
    <KeywordCustomizerProvider
      editingLanguageId={editingLanguageId}
      initialLanguage={initialLanguage}
    >
      <KeywordCustomizerShell />
    </KeywordCustomizerProvider>
  );
}
```

E adicione o import no topo:

```tsx
import type { Language } from "@/lib/languages-api";
```

Em `KeywordCustomizerShell`, passe o modo ao footer:

```tsx
function KeywordCustomizerShell() {
  const {
    form,
    preview,
    activeStep,
    activeStepIndex,
    visibleSteps,
    actions,
    saveMode,
  } = useKeywordCustomizer();
```

e no JSX do footer:

```tsx
                <KeywordCustomizerFooter
                  activeStepIndex={activeStepIndex}
                  totalSteps={visibleSteps.length}
                  saveMode={saveMode}
                  onBack={actions.goToPreviousWizardStep}
                  onNext={actions.goToNextWizardStep}
                  onSave={actions.save}
                />
```

- [ ] **Step 7: Rótulo do botão conforme o modo**

Em `keyword-customizer-footer.tsx`, acrescente a prop e o mapa de rótulos:

```tsx
import { HeroButton } from "../buttons/hero";
import type { LanguageSaveMode } from "@/hooks/useLanguagePersistence";

const SAVE_LABELS: Record<LanguageSaveMode, string> = {
  local: "Salvar e Aplicar",
  create: "Salvar como nova",
  update: "Salvar alterações",
};

export type KeywordCustomizerFooterProps = {
  activeStepIndex: number;
  totalSteps: number;
  saveMode: LanguageSaveMode;
  onBack: () => void;
  onNext: () => void;
  onSave: () => void;
};

export function KeywordCustomizerFooter({
  activeStepIndex,
  totalSteps,
  saveMode,
  onBack,
  onNext,
  onSave,
}: KeywordCustomizerFooterProps) {
```

E no botão final, troque o texto fixo:

```tsx
            <HeroButton type="button" onClick={onSave}>
              {SAVE_LABELS[saveMode]}
            </HeroButton>
```

- [ ] **Step 8: Header mostra o nome em edição e perde o modal**

Substitua o corpo de `keyword-customizer-header.tsx` (mantendo os comentários já existentes no fim do arquivo, se quiser):

```tsx
import { GradientText } from "@/components/text/gradient";
import { Subtitle } from "@/components/text/subtitle";
import { Title } from "@/components/text/title";
import { useKeywordCustomizer } from "./keyword-customizer-context";
import { WizardStep } from "./keyword-customizer-types";
import { WizardStepId } from "./wizard-model";

export type KeywordCustomizerHeaderProps = {
  steps: readonly WizardStep[];
  activeStepId: WizardStepId;
};

export function KeywordCustomizerHeader({
  steps,
  activeStepId,
}: KeywordCustomizerHeaderProps) {
  const { saveMode, languageName } = useKeywordCustomizer();
  const isEditing = saveMode === "update" && languageName.trim().length > 0;

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-center -mt-4">
        <Title as="h4" id="keyword-customizer-title">
          <GradientText>
            {isEditing ? `Editando ${languageName}` : "Explorador Universal"}
          </GradientText>
        </Title>
        <div className="backdrop-blur-[2px] p-2 bg-slate-400/10 rounded-md ml-2 mt-1">
          <Subtitle id="keyword-customizer-description">
            {isEditing
              ? "Suas alterações substituem a linguagem salva."
              : "Torne a experiência de codar tão única quanto você."}
          </Subtitle>
        </div>
      </div>
    </div>
  );
}
```

As props `steps` e `activeStepId` continuam na assinatura porque o bloco de progresso comentado no arquivo original as usa; não mude a chamada em `keyword-customizer.tsx`.

- [ ] **Step 9: Ler `?id=N` na página do wizard**

Substitua `packages/ide/src/pages/language-creator.tsx`:

```tsx
import localFont from "next/font/local";
import { useRouter } from "next/router";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { SpaceBackground } from "@/components/space-background";
import { KeywordCustomizer } from "@/components/keyword-customizer";
import { KeywordProvider } from "@/contexts/keyword/KeywordContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguageDetail } from "@/hooks/useLanguages";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

function parseLanguageId(value: string | string[] | undefined): number | null {
  if (typeof value !== "string") return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export default function LanguageCreatorPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const editingLanguageId = parseLanguageId(router.query.id);
  // Só faz sentido buscar a linguagem se há sessão; deslogado o wizard é local.
  const shouldLoad = isAuthenticated && editingLanguageId !== null;
  const detailQuery = useLanguageDetail(
    editingLanguageId ?? undefined,
    shouldLoad,
  );

  // O provider semeia seu estado no mount, então só montamos quando a
  // linguagem já chegou — evita um efeito de sincronização brigando com o
  // rascunho do usuário.
  const isWaitingForLanguage = shouldLoad && detailQuery.isPending;

  return (
    <div className="relative overflow-x-hidden">
      <SpaceBackground />
      <Navbar />
      <main
        className={`${geistSans.variable} ${geistMono.variable} relative z-10 min-h-screen p-6 font-(family-name:--font-geist-sans) sm:p-8`}
      >
        <section>
          {isWaitingForLanguage ? (
            <p className="py-20 text-center text-slate-400">
              Carregando linguagem...
            </p>
          ) : (
            <KeywordProvider>
              <KeywordCustomizer
                editingLanguageId={shouldLoad ? editingLanguageId : null}
                initialLanguage={detailQuery.data ?? null}
              />
            </KeywordProvider>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 10: Remover o modal**

```bash
rm packages/ide/src/components/language-library/LanguageLibraryModal.tsx
rmdir packages/ide/src/components/language-library
```

Confirme que nada mais o importa:

Run: `grep -rn "LanguageLibraryModal\|language-library" packages/ide/src`
Expected: nenhuma saída.

- [ ] **Step 11: Checar tipos e rodar a suíte**

Run: `cd packages/ide && npx tsc --noEmit && npm run test`
Expected: PASS. Atenção a `keyword-customizer.spec.tsx` — ele exercita o caminho local do wizard. Se ele mockava `saveSavedKeywordLanguage` diretamente, agora a chamada passa pelo hook; ajuste o mock para `@/hooks/useLanguagePersistence` ou deixe o hook real rodar com `useAuth` mockado como deslogado, o que é o mais fiel.

- [ ] **Step 12: Commit**

```bash
git add packages/ide/src/pages/language-creator.tsx \
        packages/ide/src/components/keyword-customizer.tsx \
        packages/ide/src/components/keyword-customizer/ \
        packages/ide/src/components/language-library
git commit -m "feat(ide): wizard cria e edita linguagens no backend"
```

---

## Task 7: Seletor de linguagem do IDE lê do backend

**Goal:** O seletor e o painel do IDE param de contradizer a `/languages`, listando do backend quando há sessão.

**Files:**
- Create: `packages/ide/src/hooks/useLanguageChoices.ts`
- Test: `packages/ide/src/hooks/useLanguageChoices.spec.tsx`
- Modify: `packages/ide/src/views/ide/components/language-selector.tsx`
- **Modify: `packages/ide/src/views/ide/components/language-selector.spec.tsx`** (descoberto durante a execução — ver abaixo)
- Modify: `packages/ide/src/views/ide/components/side-explorer/language-panel.tsx:55-80,100-120,230-300`

> **Correção 2026-08-04 (durante a execução).** O plano original não sabia que
> `language-selector.spec.tsx` já existia. Ele existe, tem 2 casos, e cobre o
> caminho localStorage: monta o `LanguageSelector`, mocka `useKeywords`,
> semeia duas linguagens via `saveSavedKeywordLanguage` e verifica que trocar
> no `<select>` grava `keyword-customization-active` e chama
> `setCustomization`.
>
> **Esses 2 casos já falham hoje, antes de qualquer mudança nossa** —
> confirmado rodando a suíte em `8a18b42`. Eles só estavam invisíveis porque
> as dependências não estavam instaladas e o arquivo nem executava. Deixá-los
> verdes faz parte desta task, e são **dois** problemas distintos:
>
> **(a) A falha de hoje: `localStorage.clear is not a function`** no
> `beforeEach` (linha 32). Não é vazamento entre arquivos. Reproduzido num
> spec mínimo isolado: com jsdom 28.1.0 neste setup do vitest,
> `typeof localStorage === "object"` mas `typeof localStorage.clear ===
> "undefined"` — o `Storage` do jsdom não chega completo. Qualquer spec que
> chame `localStorage.clear()` quebra aqui. A correção é o spec não depender
> desse método: instale um stub próprio de `Storage` no `beforeEach`, ou
> remova as chaves usadas uma a uma com `removeItem`.
>
> Isso vale como aviso geral: **não use `localStorage.clear()` em spec novo
> neste repo.** Os specs das Tasks 5 e 7 escapam porque mockam o módulo
> `@/lib/keyword-language-storage` inteiro, sem tocar no `localStorage` real.
>
> **(b) A falha que a reescrita vai causar:** o componente passa a consumir
> `useLanguageChoices()`, que chama `useAuth()`. O spec não mocka `useAuth`.
> Ele precisa ganhar um mock de `@/contexts/AuthContext` devolvendo
> `{ isAuthenticated: false }` — justamente o cenário que os dois casos já
> descrevem. Os `expect` sobre localStorage e `setCustomization` seguem
> válidos como estão.

**Acceptance Criteria:**
- [ ] Logado, a lista vem de `useLanguagesList()`
- [ ] Deslogado, a lista vem de `listSavedKeywordLanguages()`
- [ ] Trocar de linguagem logado chama `useSetActiveLanguage()` e aplica a `customization`
- [ ] Trocar de linguagem deslogado chama `setActiveSavedKeywordLanguage()` como hoje
- [ ] A imagem sai de `imageUrl` nos dois caminhos
- [ ] O hook expõe a linguagem ativa **completa** (nome, descrição, imagem, `customization`), porque `language-panel.tsx` renderiza descrição e o "DNA" derivado dos `modes`

**Atenção — por que o hook devolve duas coisas:** o `LanguageSelector` só precisa de uma lista `{key, name, imageUrl}`, mas o `LanguagePanel` também mostra `description` e chama `getLanguageDNA(customization)`. No localStorage isso vinha de graça, porque `loadSavedKeywordLanguage(slug)` devolve o objeto inteiro de forma síncrona. No backend, `LanguageSummary` **não** traz `customization` — por isso o hook expõe `activeLanguage` separadamente, alimentado por `useActiveLanguage()` (que devolve o `Language` completo) quando logado.

**Verify:** `cd packages/ide && npm run test` → PASS

**Steps:**

- [ ] **Step 1: Escrever o teste que falha**

Crie `packages/ide/src/hooks/useLanguageChoices.spec.tsx`:

```tsx
// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageChoices } from "./useLanguageChoices";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const useAuthMock = vi.fn();
const listQueryMock = vi.fn();
const activeQueryMock = vi.fn();
const setActiveMutateMock = vi.fn();
const setCustomizationMock = vi.fn();
const listLocalMock = vi.fn();
const loadLocalMock = vi.fn();
const loadActiveLocalMock = vi.fn();
const setActiveLocalMock = vi.fn();
const getDetailMock = vi.fn();

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock("@/hooks/useLanguages", () => ({
  useLanguagesList: () => listQueryMock(),
  useActiveLanguage: () => activeQueryMock(),
  useSetActiveLanguage: () => ({
    mutateAsync: setActiveMutateMock,
    isPending: false,
  }),
}));

vi.mock("@/contexts/keyword/KeywordContext", () => ({
  useKeywords: () => ({ setCustomization: setCustomizationMock }),
}));

vi.mock("@/lib/languages-api", () => ({
  languagesApi: { get: (...args: unknown[]) => getDetailMock(...args) },
}));

vi.mock("@/lib/keyword-language-storage", () => ({
  listSavedKeywordLanguages: () => listLocalMock(),
  loadSavedKeywordLanguage: (...args: unknown[]) => loadLocalMock(...args),
  loadActiveSavedKeywordLanguage: () => loadActiveLocalMock(),
  setActiveSavedKeywordLanguage: (...args: unknown[]) =>
    setActiveLocalMock(...args),
}));

function mount() {
  const captured: { current: ReturnType<typeof useLanguageChoices> | null } = {
    current: null,
  };

  function Probe() {
    captured.current = useLanguageChoices();
    return null;
  }

  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(<Probe />);
  });

  return { captured, root };
}

const CUSTOMIZATION = { mappings: [] } as never;

describe("useLanguageChoices", () => {
  beforeEach(() => {
    listQueryMock.mockReset();
    activeQueryMock.mockReset().mockReturnValue({ data: null });
    setActiveMutateMock.mockReset().mockResolvedValue(undefined);
    setCustomizationMock.mockReset();
    listLocalMock.mockReset().mockReturnValue([]);
    loadLocalMock.mockReset();
    loadActiveLocalMock.mockReset().mockReturnValue(null);
    setActiveLocalMock.mockReset();
    getDetailMock.mockReset();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("lista do backend quando logado", () => {
    useAuthMock.mockReturnValue({ isAuthenticated: true });
    listQueryMock.mockReturnValue({
      data: [
        {
          id: 3,
          name: "PtBr-Lang",
          imageUrl: "https://cdn.example/p.png",
          description: null,
          ownerId: 1,
          clonedFromId: null,
          updatedAt: "2026-08-01T00:00:00Z",
        },
      ],
      isPending: false,
    });
    activeQueryMock.mockReturnValue({ data: { id: 3 } });

    const { captured, root } = mount();

    expect(captured.current?.choices).toEqual([
      { key: "3", name: "PtBr-Lang", imageUrl: "https://cdn.example/p.png" },
    ]);
    expect(captured.current?.activeKey).toBe("3");
    expect(listLocalMock).not.toHaveBeenCalled();

    act(() => root.unmount());
  });

  it("lista do localStorage quando deslogado", () => {
    useAuthMock.mockReturnValue({ isAuthenticated: false });
    listQueryMock.mockReturnValue({ data: undefined, isPending: false });
    listLocalMock.mockReturnValue([
      { name: "MinhaLang", slug: "minhalang", imageUrl: "/local.png" },
    ]);
    loadActiveLocalMock.mockReturnValue({
      slug: "minhalang",
      name: "MinhaLang",
      description: "Local",
      imageUrl: "/local.png",
      customization: CUSTOMIZATION,
    });

    const { captured, root } = mount();

    expect(captured.current?.choices).toEqual([
      { key: "minhalang", name: "MinhaLang", imageUrl: "/local.png" },
    ]);
    expect(captured.current?.activeKey).toBe("minhalang");

    act(() => root.unmount());
  });

  it("expõe a linguagem ativa completa vinda do backend", () => {
    useAuthMock.mockReturnValue({ isAuthenticated: true });
    listQueryMock.mockReturnValue({ data: [], isPending: false });
    activeQueryMock.mockReturnValue({
      data: {
        id: 9,
        name: "PtBr-Lang",
        description: null,
        imageUrl: null,
        customization: CUSTOMIZATION,
      },
    });

    const { captured, root } = mount();

    expect(captured.current?.activeLanguage).toEqual({
      key: "9",
      name: "PtBr-Lang",
      description: "",
      imageUrl: "",
      customization: CUSTOMIZATION,
    });

    act(() => root.unmount());
  });

  it("expõe a linguagem ativa completa vinda do localStorage", () => {
    useAuthMock.mockReturnValue({ isAuthenticated: false });
    listQueryMock.mockReturnValue({ data: undefined, isPending: false });
    listLocalMock.mockReturnValue([
      { name: "MinhaLang", slug: "minhalang", imageUrl: "/local.png" },
    ]);
    loadActiveLocalMock.mockReturnValue({
      slug: "minhalang",
      name: "MinhaLang",
      description: "Feita em casa",
      imageUrl: "/local.png",
      customization: CUSTOMIZATION,
    });

    const { captured, root } = mount();

    expect(captured.current?.activeLanguage).toEqual({
      key: "minhalang",
      name: "MinhaLang",
      description: "Feita em casa",
      imageUrl: "/local.png",
      customization: CUSTOMIZATION,
    });

    act(() => root.unmount());
  });

  it("ativa pelo backend quando logado", async () => {
    useAuthMock.mockReturnValue({ isAuthenticated: true });
    listQueryMock.mockReturnValue({ data: [], isPending: false });
    getDetailMock.mockResolvedValue({ id: 5, customization: CUSTOMIZATION });

    const { captured, root } = mount();

    await act(async () => {
      await captured.current?.selectLanguage("5");
    });

    expect(setActiveMutateMock).toHaveBeenCalledWith(5);
    expect(setCustomizationMock).toHaveBeenCalledWith(CUSTOMIZATION);
    expect(setActiveLocalMock).not.toHaveBeenCalled();

    act(() => root.unmount());
  });

  it("ativa pelo localStorage quando deslogado", async () => {
    useAuthMock.mockReturnValue({ isAuthenticated: false });
    listQueryMock.mockReturnValue({ data: undefined, isPending: false });
    loadLocalMock.mockReturnValue({
      slug: "minhalang",
      customization: CUSTOMIZATION,
    });

    const { captured, root } = mount();

    await act(async () => {
      await captured.current?.selectLanguage("minhalang");
    });

    expect(setActiveLocalMock).toHaveBeenCalledWith("minhalang");
    expect(setCustomizationMock).toHaveBeenCalledWith(CUSTOMIZATION);
    expect(setActiveMutateMock).not.toHaveBeenCalled();

    act(() => root.unmount());
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd packages/ide && npx vitest run --config vitest.integration.config.ts src/hooks/useLanguageChoices.spec.tsx`
Expected: FAIL — não consegue resolver `./useLanguageChoices`.

- [ ] **Step 3: Escrever o hook**

Crie `packages/ide/src/hooks/useLanguageChoices.ts`:

```ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useKeywords } from "@/contexts/keyword/KeywordContext";
import {
  useActiveLanguage,
  useLanguagesList,
  useSetActiveLanguage,
} from "@/hooks/useLanguages";
import { languagesApi } from "@/lib/languages-api";
import {
  listSavedKeywordLanguages,
  loadActiveSavedKeywordLanguage,
  loadSavedKeywordLanguage,
  setActiveSavedKeywordLanguage,
} from "@/lib/keyword-language-storage";

import type { StoredKeywordCustomization } from "@/contexts/keyword/types";

export type LanguageChoice = {
  /** id numérico como string no backend, slug no localStorage. */
  key: string;
  name: string;
  imageUrl: string;
};

/** A linguagem ativa por inteiro — o painel do IDE precisa de mais que o resumo. */
export type ActiveLanguageDetail = {
  key: string;
  name: string;
  description: string;
  imageUrl: string;
  customization: StoredKeywordCustomization;
};

/**
 * Fonte única das linguagens oferecidas no IDE.
 *
 * Logado, a verdade é o backend — é o mesmo acervo que a página /languages
 * mostra. Deslogado, cai no localStorage, que é onde o wizard grava sem
 * sessão. Sem isso o seletor do IDE e a /languages mostrariam listas
 * diferentes para o mesmo usuário.
 */
export function useLanguageChoices() {
  const { isAuthenticated } = useAuth();
  const { setCustomization } = useKeywords();
  const listQuery = useLanguagesList(isAuthenticated);
  const activeQuery = useActiveLanguage(isAuthenticated);
  const setActiveMut = useSetActiveLanguage();

  const [localChoices, setLocalChoices] = useState<LanguageChoice[]>([]);
  const [localActive, setLocalActive] = useState<ActiveLanguageDetail | null>(
    null,
  );

  useEffect(() => {
    if (isAuthenticated) return;

    setLocalChoices(
      listSavedKeywordLanguages().map((entry) => ({
        key: entry.slug,
        name: entry.name,
        imageUrl: entry.imageUrl,
      })),
    );

    const saved = loadActiveSavedKeywordLanguage();
    setLocalActive(
      saved
        ? {
            key: saved.slug,
            name: saved.name,
            description: saved.description ?? "",
            imageUrl: saved.imageUrl,
            customization: saved.customization,
          }
        : null,
    );
  }, [isAuthenticated]);

  const choices = useMemo<LanguageChoice[]>(() => {
    if (!isAuthenticated) return localChoices;

    return (listQuery.data ?? []).map((language) => ({
      key: String(language.id),
      name: language.name,
      imageUrl: language.imageUrl ?? "",
    }));
  }, [isAuthenticated, listQuery.data, localChoices]);

  const activeLanguage = useMemo<ActiveLanguageDetail | null>(() => {
    if (!isAuthenticated) return localActive;

    const language = activeQuery.data;
    if (!language) return null;

    return {
      key: String(language.id),
      name: language.name,
      description: language.description ?? "",
      imageUrl: language.imageUrl ?? "",
      customization: language.customization,
    };
  }, [activeQuery.data, isAuthenticated, localActive]);

  const activeKey = activeLanguage?.key ?? "";

  const selectLanguage = useCallback(
    async (key: string) => {
      if (isAuthenticated) {
        const languageId = Number.parseInt(key, 10);
        if (!Number.isInteger(languageId)) return;

        const language = await languagesApi.get(languageId);
        await setActiveMut.mutateAsync(languageId);
        setCustomization(language.customization);
        return;
      }

      const language = loadSavedKeywordLanguage(key);
      if (!language) return;

      setActiveSavedKeywordLanguage(key);
      setCustomization(language.customization);
      setLocalActive({
        key: language.slug,
        name: language.name,
        description: language.description ?? "",
        imageUrl: language.imageUrl,
        customization: language.customization,
      });
    },
    [isAuthenticated, setActiveMut, setCustomization],
  );

  return { choices, activeKey, activeLanguage, selectLanguage };
}
```

Note que o hook **não** aplica a linguagem ativa ao montar. Isso já é responsabilidade do `KeywordContext`, que hidrata do backend quando logado (`KeywordContext.tsx:292-295`) e do localStorage quando não (`:221`). O efeito equivalente que existe hoje em `language-panel.tsx:60-75` é redundante e sai na Step 6.

- [ ] **Step 4: Rodar o teste do hook**

Run: `cd packages/ide && npx vitest run --config vitest.integration.config.ts src/hooks/useLanguageChoices.spec.tsx`
Expected: PASS nos seis casos.

- [ ] **Step 5: Consumir o hook no seletor**

Substitua `packages/ide/src/views/ide/components/language-selector.tsx`:

```tsx
import { useMemo } from "react";
import { useLanguageChoices } from "@/hooks/useLanguageChoices";

export function LanguageSelector() {
  const { choices, activeKey, selectLanguage } = useLanguageChoices();

  const activeChoice = useMemo(
    () => choices.find((choice) => choice.key === activeKey) ?? null,
    [choices, activeKey],
  );

  if (!choices.length) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {activeChoice?.imageUrl ? (
        <img
          src={activeChoice.imageUrl}
          alt={activeChoice.name}
          className="h-8 w-8 rounded-lg object-cover"
        />
      ) : null}
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="hidden md:inline">Linguagem</span>
        <select
          aria-label="Selecionar linguagem salva"
          value={activeKey}
          onChange={(event) => {
            void selectLanguage(event.target.value);
          }}
          className="rounded-lg border border-black/10 bg-white/80 px-2 py-1 text-xs text-foreground outline-none dark:border-white/10 dark:bg-black/20"
        >
          {choices.map((choice) => (
            <option key={choice.key} value={choice.key}>
              {choice.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
```

- [ ] **Step 6: Consumir o hook no painel lateral**

`language-panel.tsx` tem quatro pontos de contato com o localStorage. Faça as cinco substituições abaixo; o JSX decorativo (gradientes, `PerfectScrollbar`, `Tooltip`) fica intacto.

**6a — imports.** Troque o bloco de import de `@/lib/keyword-language-storage` (linhas 22-28) e o de `useKeywords` por:

```tsx
import { useLanguageChoices, type ActiveLanguageDetail } from "@/hooks/useLanguageChoices";
import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
```

Remova também `useEffect`, `useState` e `useKeywords` dos imports se ficarem sem uso — o hook assumiu os dois primeiros, e `setCustomization` agora só é chamado dentro dele.

**6b — o alias de tipo.** `LanguageCustomization` era derivado do retorno de `loadSavedKeywordLanguage`, que sumiu. Substitua as linhas 32-34 por:

```tsx
export type LanguageCustomization = StoredKeywordCustomization;
```

**6c — o corpo de `LanguagePanel`.** Substitua da linha 52 até o `if (!languages.length)` (linha 93) por:

```tsx
export function LanguagePanel() {
  const editor = useEditor();
  const { choices, activeKey, activeLanguage, selectLanguage } =
    useLanguageChoices();

  const handleLexemeClick = (lexeme: string) => {
    editor.insertTextAtCursor(lexeme);
  };

  if (!choices.length) {
```

O `useEffect` que aplicava a linguagem ativa ao montar (linhas 60-75) **sai**: o `KeywordContext` já faz isso nos dois caminhos, e mantê-lo aqui criaria duas fontes disputando o mesmo estado. O `useMemo` de `visibleLanguage` (linhas 77-87) também sai — `activeLanguage` do hook o substitui.

**6d — as referências a `visibleLanguage` e `languages`.** No JSX restante:

| Antes | Depois |
|---|---|
| `visibleLanguage?.imageUrl` | `activeLanguage?.imageUrl` |
| `visibleLanguage?.name` | `activeLanguage?.name` |
| `visibleLanguage?.customization` | `activeLanguage?.customization` |
| `visibleLanguage={visibleLanguage}` | `activeLanguage={activeLanguage}` |
| `languages={languages}` | `choices={choices}` |
| `setCustomization={setCustomization}` `setSelectedSlug={setSelectedSlug}` `selectedSlug={selectedSlug}` | `activeKey={activeKey}` `onSelect={selectLanguage}` |

E ajuste `LanguageDescription` para a nova forma:

```tsx
function LanguageDescription({
  activeLanguage,
}: {
  activeLanguage: ActiveLanguageDetail | null;
}) {
  const description =
    activeLanguage?.description ||
    "Uma linguagem de programação personalizada criada com o Java--.";

  return (
    <div className="max-w-[83%]">
      <h2 className="truncate text-xl font-semibold text-white drop-shadow-sm sm:text-2xl">
        {activeLanguage?.name ?? "Java--"}
      </h2>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="mt-1 truncate text-sm text-white/90 cursor-help">
              {description}
            </p>
          </TooltipTrigger>
          <TooltipContent>{description}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
```

**6e — `LanguageOptionsMenu`.** Substitua a interface de props, o handler e o `.map` das opções:

```tsx
interface LanguageOptionsMenuProps {
  choices: LanguageChoice[];
  activeKey: string;
  onSelect: (key: string) => Promise<void>;
}

function LanguageOptionsMenu({
  choices,
  activeKey,
  onSelect,
}: LanguageOptionsMenuProps) {
```

Adicione `LanguageChoice` ao import do hook. O contador vira `{choices.length}`. E o `.map` interno:

```tsx
                  {choices.map((choice) => {
                    const isSelected = choice.key === activeKey;

                    return (
                      <DropdownMenuItem key={choice.key} asChild>
                        <button
                          type="button"
                          onClick={() => void onSelect(choice.key)}
                          className={cn(
                            "group relative overflow-hidden rounded-xl border px-3 py-2 text-left transition backdrop-blur-sm",
                            isSelected
                              ? "border-white/60 bg-white/12 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                              : "border-white/10 bg-white/5 text-white/90 hover:border-white/20 hover:bg-white/10",
                          )}
                        >
                          <div className="pointer-events-none absolute inset-0">
                            <Image
                              src={getDefaultLanguageImage(choice.imageUrl)}
                              alt={choice.name}
                              fill
                              sizes="(max-width: 768px) 100vw, 320px"
                              className="object-cover opacity-35 transition duration-300 group-hover:scale-[1.03]"
                            />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(34,211,238,0.18),transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.18)_0%,rgba(2,6,23,0.62)_100%)]" />
                            <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(34,211,238,0.05)_24%,rgba(34,211,238,0.16)_40%,rgba(34,211,238,0.04)_58%,transparent_78%)] opacity-80 mix-blend-screen" />
                          </div>

                          <div className="relative z-10 min-w-0">
                            <p className="text-sm font-medium leading-tight text-white">
                              {choice.name}
                            </p>
                          </div>
                        </button>
                      </DropdownMenuItem>
                    );
                  })}
```

A linha `<p className="text-xs text-white/65">{language.slug}</p>` **sai de propósito**: logado, a `key` é o id numérico da linguagem, e mostrar "7" embaixo do nome não informa nada ao usuário.

**6f — conferir que nada ficou para trás.**

Run: `grep -n "setActiveSavedKeywordLanguage\|listSavedKeywordLanguages\|loadSavedKeywordLanguage\|loadActiveSavedKeywordLanguage\|visibleLanguage\|selectedSlug" packages/ide/src/views/ide/components/side-explorer/language-panel.tsx`
Expected: nenhuma saída.

- [ ] **Step 7: Checar tipos e rodar a suíte inteira**

Run: `cd packages/ide && npx tsc --noEmit && npm run test`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add packages/ide/src/hooks/useLanguageChoices.ts \
        packages/ide/src/hooks/useLanguageChoices.spec.tsx \
        packages/ide/src/views/ide/components/language-selector.tsx \
        packages/ide/src/views/ide/components/side-explorer/language-panel.tsx
git commit -m "feat(ide): seletor de linguagem le do backend quando logado"
```

---

## Verificação final

Depois da Task 7, rode tudo de uma vez:

```bash
cd backend && uv run pytest tests/ -v
cd packages/ide && npx tsc --noEmit && npm run test && npm run lint
```

Todos devem passar, **com duas exceções conhecidas e documentadas**:

1. `packages/ide` tem **31 erros de `tsc`** pré-existentes, todos em arquivos
   `.spec` e código não relacionado a esta feature (`editor-language.spec.ts`,
   `submission-config.spec.ts`, `background-mascot-marquee.spec.tsx`,
   `token-card.spec.tsx`, `compiler-config.spec.ts`,
   `language-image-search.spec.ts`, `KeywordContext.spec.ts`). Nenhum toca os
   arquivos desta feature. O critério é **não aumentar esse número**, não
   zerá-lo — zerar é trabalho de outro dia.
2. `review-step.spec.tsx` tem **1 teste falhando** por um `ast-viewer` ausente,
   sem relação nenhuma com linguagens. Pré-existente, fora de escopo.

Ambos foram confirmados rodando a suíte em `8a18b42`, antes de qualquer
código desta rodada. Se aparecer qualquer falha **além** dessas, o trabalho
não está completo — reporte a saída real em vez de declarar sucesso.

E confirme o fluxo manualmente, com o backend migrado:

```bash
cd backend && uv run alembic upgrade head
cd packages/ide && npm run dev
```

Percorra: login → `/dashboard` → sidebar "Minhas Linguagens" → "Nova Linguagem" → preencher o wizard → "Salvar como nova" → volta em `/languages` com o card → ✎ editar → "Salvar alterações" → ★ tornar ativa → abrir o IDE e conferir que o seletor mostra a mesma linguagem.
