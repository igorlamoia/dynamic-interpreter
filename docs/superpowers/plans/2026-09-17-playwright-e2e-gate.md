# Suíte E2E Playwright como Gate de Regressão — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar uma suíte Playwright de quatro fluxos core rodando contra a stack Docker real, e fazer o deploy na VPS depender dela.

**Architecture:** Novo workspace npm `packages/e2e` com Playwright. Fixtures criam dados via a API FastAPI e autenticam injetando o cookie `lms_access_token`, para que os specs exercitem UI e não encanamento. O `deploy.yml` passa a ter jobs `unit` e `e2e`, e o job `deploy` ganha `needs: [unit, e2e]`.

**Tech Stack:** Playwright (`@playwright/test`), Docker Compose (`docker-compose.local.yml`), Next.js 16 / React 19 no frontend, FastAPI no backend, GitHub Actions.

**User Verification:** NO — no user verification required. O pedido original é "adicionar testes automatizados para verificar se quebramos funcionalidade core"; não há pedido de confirmação humana, sign-off ou feedback de usuário sobre o resultado. A verificação é a própria suíte, executada pelos comandos `Verify` de cada task.

---

## Contexto obrigatório para quem implementa

Leia a spec antes de começar: `docs/superpowers/specs/2026-09-17-playwright-e2e-gate-design.md`.

**Fatos do repositório que você precisa saber e que não são óbvios:**

1. **O lexer e o gerador de código intermediário rodam no navegador**, não no servidor. `useLexerAnalyse.ts` e `useIntermediatorCode.ts` importam `Lexer` e `TokenIterator` direto do pacote `compiler`. Não existe `/api/lexer` nem `/api/intermediator` (o `CLAUDE.md` está desatualizado nesse ponto).
2. **O IDE completo está embutido na landing `/`, que é pública.** `packages/ide/src/pages/index.tsx:32` renderiza `<IDEView />`. Não precisa de login para testar o compilador.
3. **Auth é um cookie**, não localStorage: `lms_access_token` (`packages/ide/src/lib/auth-cookies.ts:1`). O backend espera `Authorization: Bearer <token>`.
4. **O backend serializa em camelCase** (`CamelModel` em `backend/app/schemas/base.py`), mas aceita snake_case na entrada. Use camelCase nos payloads para espelhar o que o frontend envia.
5. **`POST /auth/register` exige `organizationId`** para `role` `student` e `teacher` (`backend/app/schemas/auth.py:19-24`). Busque o id em `GET /organizations`, que é público.
6. **`POST /auth/register` e `POST /auth/login` devolvem só `{accessToken, tokenType}`** — não devolvem o usuário. Para obter o `id`, chame `GET /auth/me`.
7. **O `entrypoint.sh` do backend roda `alembic upgrade head` e `scripts/seed.py`** antes do uvicorn. Depois de `make local-up`, o banco já tem CEFET-MG, `professor@gmail.com`/`professor`, `aluno@gmail.com`/`aluno` e as 5 linguagens oficiais.
8. **O `vitest.config.ts` da raiz não declara `include`**, então o glob padrão capturaria arquivos novos `*.spec.ts` em qualquer lugar do repo. Por isso os arquivos Playwright usam sufixo `.e2e.ts` **e** a Task 1 adiciona um `exclude`.

## Emendas descobertas durante a execução

Registradas aqui porque as tasks seguintes dependem delas.

1. **E-mails de teste usam `@example.com`, não `@test.local`.** O rascunho da
   Task 2 usava `.local`, que o `email_validator` (via `EmailStr`) rejeita como
   special-use domain da RFC 6761/6762 — é checagem de **sintaxe**, então falha
   mesmo com `check_deliverability=False`. Verificado: `POST /auth/register`
   devolve 422 com "The part after the @-sign is a special-use or reserved name"
   para `.local`, e 201 para `example.com`.

2. **`playwright install --with-deps` exige sudo sem senha.** Não disponível
   nesta máquina (Fedora). O fallback `npx playwright install chromium` (sem
   `--with-deps`) funciona e basta. O script `install-browsers` mantém
   `--with-deps` porque no `ubuntu-latest` do GitHub Actions ele funciona; a
   **Task 9 deve documentar o fallback local no README**.

3. **Corrida de leitura-após-escrita, conhecida e aceita.** `get_session`
   (`backend/app/db/session.py:24-30`) commita no teardown da dependência
   `yield`, então o cliente pode receber o `201` antes de o commit ficar visível
   para a requisição seguinte, em outra conexão do pool. Medido: 4 falhas em
   ~165 tentativas (2,4%), zero nas últimas 140 — sequenciais, com atraso, e
   concorrentes até 40 cadeias. **Nenhuma escrita é perdida** (as linhas que
   deram 404 todas existem no banco); só a leitura imediata perde a janela.
   **Decisão: não consertar neste trabalho.** Os `retries: 2` do CI absorvem, e
   um teste que só passa no retry é reportado como *flaky* — visível, não
   escondido. Consertar exigiria commit explícito em ~15 serviços **mais**
   migrar o `backend/tests/conftest.py` de `session.begin()`+rollback para
   savepoint/join-transaction, o que é desproporcional aqui.
   **Não adicione retry nem polling nas fixtures para mascarar isso.**

4a. **Bug consertado no caminho (commit `0799241`):** `FormControl` renderizava
   `<div id={formItemId}>` com o input como filho, sem `Slot`, então nenhum
   input recebia `id` e todo `htmlFor` apontava para um `<div>` — elemento não
   rotulável. Todo campo do app ficava sem nome acessível. Alcance: 10
   formulários, 29 usos. Corrigido com `<Slot>` do Radix. **Consequência
   operacional: o frontend roda de imagem buildada, então qualquer conserto em
   `packages/ide` exige `make local-up` antes de rodar as specs**, senão elas
   testam o bundle antigo.

4b. **Bug pré-existente a documentar no PR, não a consertar:** toda mensagem
   de erro de API mostrada ao usuário é o texto genérico de fallback.
   `getApiErrorMessage` (`packages/ide/src/lib/get-api-error-message.ts`) lê
   `data.error`, mas o backend sempre responde `{"detail": ...}` e **nunca**
   usa o campo `error` em rota alguma; `api.ts` só tem interceptor de request,
   sem nada que renomeie o campo. Então a razão real do servidor é sempre
   descartada em **10 pontos de chamada**: "Código inválido", "Erro ao criar
   exercício", "Erro ao criar turma", "Erro ao salvar nota", "Falha ao entrar",
   "Não foi possível importar a linguagem." Na prática, entrar numa turma com
   código errado, numa turma cheia ou numa em que o aluno já está mostra a
   mesma frase. Conserto seria ler `detail` com fallback para `error`, mas é
   escopo de UX fora deste gate.

5. **Bug pré-existente a documentar no PR, não a consertar:** os `testCases`
   que o modal de criar exercício envia são **descartados em silêncio**. A UI
   manda tudo num único `POST /exercises` (`use-api-queries.ts:325`), mas
   `ExerciseCreate` não declara o campo e `create_exercise` nunca o lê —
   verificado, a resposta volta com `"testCases": []`. Como a correção de
   submissão depende dos casos, o fluxo de nota está quebrado pela UI. As
   fixtures do E2E contornam usando o endpoint separado
   `POST /exercises/{id}/test-cases`, que funciona.

## Estrutura de arquivos

| Arquivo | Responsabilidade | Task |
|---|---|---|
| `packages/e2e/package.json` | Declara o workspace e o script `test` | 1 |
| `packages/e2e/tsconfig.json` | TS para os specs | 1 |
| `packages/e2e/playwright.config.ts` | baseURL, retries, trace, reporter | 1 |
| `packages/e2e/support/env.ts` | URLs do frontend e da API | 1 |
| `packages/e2e/specs/smoke.e2e.ts` | Prova que a stack responde | 1 |
| `vitest.config.ts` (raiz) | Excluir `packages/e2e` | 1 |
| `Makefile` | Alvo `e2e` | 1 |
| `packages/e2e/support/unique.ts` | Identificadores únicos por execução | 2 |
| `packages/e2e/fixtures/api.ts` | `ApiClient`: cria entidades no backend | 2 |
| `packages/e2e/fixtures/auth.ts` | Token → contexto de browser autenticado | 2 |
| `packages/e2e/fixtures/index.ts` | `test` estendido | 2 |
| `packages/e2e/specs/fixtures.e2e.ts` | Testa a própria camada de fixtures | 2 |
| `packages/ide/src/components/editor.tsx` | `data-testid="monaco-editor"` | 3 |
| `packages/ide/src/components/terminal/index.tsx` | `data-testid="terminal-panel"` | 3 |
| `packages/ide/src/components/terminal/body.tsx` | `terminal-output`, `terminal-input` | 3 |
| `packages/ide/src/views/tokens/show-tokens.tsx` | `data-testid="token-list"` | 3 |
| `packages/ide/src/views/tokens/list-intermediate-code.tsx` | `data-testid="intermediate-code-list"` | 3 |
| `packages/ide/src/pages/exercises/workspace.tsx` | `data-testid="submission-result-panel"` | 3 |
| `packages/e2e/specs/auth.e2e.ts` | Fluxo de autenticação | 4 |
| `packages/e2e/support/monaco.ts` | Escrever e ler código no Monaco | 5 |
| `packages/e2e/specs/ide-compiler.e2e.ts` | Fluxo do compilador na UI | 5 |
| `packages/e2e/specs/lms-flow.e2e.ts` | Ciclo professor → aluno → submissão | 6 |
| `packages/e2e/specs/custom-language.e2e.ts` | Importar e usar linguagem da comunidade | 7 |
| `.github/workflows/deploy.yml` | Jobs `unit` e `e2e` gateando `deploy` | 8 |
| `.githooks/pre-push` | Gate local leve | 9 |
| `README.MD` | Documentar como rodar | 9 |

---

### Task 1: Scaffold do pacote `packages/e2e` e smoke test

**Goal:** Um pacote Playwright que roda e prova que a stack Docker está de pé.

**Files:**
- Create: `packages/e2e/package.json`
- Create: `packages/e2e/tsconfig.json`
- Create: `packages/e2e/.gitignore`
- Create: `packages/e2e/playwright.config.ts`
- Create: `packages/e2e/support/env.ts`
- Create: `packages/e2e/specs/smoke.e2e.ts`
- Modify: `vitest.config.ts` (raiz, adicionar `exclude`)
- Modify: `Makefile` (adicionar alvo `e2e`)

**Acceptance Criteria:**
- [ ] `npm install` na raiz reconhece `@ts-compilator-for-java/e2e` como workspace
- [ ] `smoke.e2e.ts` passa com a stack no ar
- [ ] `npx vitest run` na raiz não coleta nenhum arquivo de `packages/e2e/`

**Verify:** `make local-up && npm run test -w @ts-compilator-for-java/e2e` → `2 passed`

**Steps:**

- [ ] **Step 1: Criar o `package.json` do pacote**

```json
{
  "name": "@ts-compilator-for-java/e2e",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:ui": "playwright test --ui",
    "report": "playwright show-report",
    "install-browsers": "playwright install --with-deps chromium"
  },
  "devDependencies": {
    "@playwright/test": "^1.50.0",
    "@types/node": "^20",
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: Criar o `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["node"]
  },
  "include": ["specs/**/*.ts", "fixtures/**/*.ts", "support/**/*.ts", "playwright.config.ts"]
}
```

- [ ] **Step 3: Criar o `.gitignore` do pacote**

```gitignore
playwright-report/
test-results/
blob-report/
.playwright/
```

- [ ] **Step 4: Criar `support/env.ts`**

```ts
/**
 * URLs da stack sob teste. Os defaults apontam para o que
 * `docker-compose.local.yml` expõe; o CI sobrescreve se mudar de porta.
 */
export const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3001";
export const API_URL = process.env.E2E_API_URL ?? "http://localhost:8000";

/**
 * Conta criada pelo seed idempotente (`backend/scripts/seed.py:156-164`).
 * Usada só para leitura, nos specs que precisam provar que o login real
 * funciona. Tudo que os testes escrevem usa contas criadas na hora.
 */
export const SEED_TEACHER = {
  email: "professor@gmail.com",
  password: "professor",
  name: "Prof. Carlos Silva",
} as const;
```

- [ ] **Step 5: Criar `playwright.config.ts`**

Não usamos `webServer`: a stack sobe pelo Compose, e o job de CI espera os
healthchecks antes de chamar o Playwright.

```ts
import { defineConfig, devices } from "@playwright/test";
import { BASE_URL } from "./support/env";

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./specs",
  testMatch: /.*\.e2e\.ts$/,
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: isCI
    ? [["list"], ["github"], ["html", { open: "never" }]]
    : [["list"]],
  use: {
    baseURL: BASE_URL,
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
```

- [ ] **Step 6: Escrever o smoke test (este é o teste que falha primeiro)**

Crie `packages/e2e/specs/smoke.e2e.ts`:

```ts
import { expect, test } from "@playwright/test";
import { API_URL } from "../support/env";

test("o backend responde no /health", async ({ request }) => {
  const response = await request.get(`${API_URL}/health`);

  expect(response.ok()).toBe(true);
  expect(await response.json()).toEqual({ status: "ok" });
});

test("a landing renderiza o shell do IDE", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("ide-shell")).toBeVisible();
});
```

Nota: `ide-shell` já existe em `packages/ide/src/views/ide/index.tsx:209` — não
precisa ser adicionado.

- [ ] **Step 7: Instalar dependências e o browser, e rodar o teste para ver falhar**

```bash
npm install
npm run install-browsers -w @ts-compilator-for-java/e2e
npm run test -w @ts-compilator-for-java/e2e
```

Esperado: FAIL com `connect ECONNREFUSED 127.0.0.1:8000` (a stack ainda não subiu).

- [ ] **Step 8: Subir a stack e rodar de novo**

```bash
make local-up
make local-status
npm run test -w @ts-compilator-for-java/e2e
```

Esperado: `2 passed`. Se `make local-status` não mostrar os três serviços como
`healthy`, espere — o backend tem `start_period: 60s`.

- [ ] **Step 9: Blindar o Vitest da raiz contra os arquivos do Playwright**

Edite `vitest.config.ts` na raiz. O bloco `test` atual é:

```ts
  test: {
    environment: "node",
  },
```

Substitua por:

```ts
  test: {
    environment: "node",
    // O glob padrão do Vitest alcançaria os arquivos do Playwright em
    // packages/e2e. O sufixo .e2e.ts já os separa; este exclude é a
    // segunda barreira, para o caso de alguém criar um .spec.ts lá.
    exclude: ["**/node_modules/**", "**/dist/**", "packages/e2e/**"],
  },
```

- [ ] **Step 10: Confirmar que o Vitest ignora o pacote**

```bash
npx vitest run --reporter=verbose 2>&1 | grep -c "packages/e2e"
```

Esperado: `0`

- [ ] **Step 11: Adicionar o alvo `e2e` ao Makefile**

Edite o `Makefile`. A linha `.PHONY` atual é:

```makefile
.PHONY: local-up local-down local-logs local-status local-reset
```

Substitua por:

```makefile
.PHONY: local-up local-down local-logs local-status local-reset e2e e2e-ui
```

E acrescente ao final do arquivo:

```makefile
e2e:
	$(LOCAL_COMPOSE) up --build --detach
	npm run test -w @ts-compilator-for-java/e2e

e2e-ui:
	npm run test:ui -w @ts-compilator-for-java/e2e
```

- [ ] **Step 12: Commit**

```bash
git add packages/e2e vitest.config.ts Makefile package-lock.json
git commit -m "test(e2e): scaffold do pacote Playwright com smoke test"
```

---

### Task 2: Fixtures de API, autenticação e dados únicos

**Goal:** Uma camada de fixtures que cria turma, exercício, lista e submissão pela API e entrega uma página já autenticada, sem que nenhum spec monte payload HTTP na mão.

**Files:**
- Create: `packages/e2e/support/unique.ts`
- Create: `packages/e2e/fixtures/api.ts`
- Create: `packages/e2e/fixtures/auth.ts`
- Create: `packages/e2e/fixtures/index.ts`
- Create: `packages/e2e/specs/fixtures.e2e.ts`

**Acceptance Criteria:**
- [ ] `ApiClient` cobre register, login, me, classes, join, exercises, test-cases, exercise-lists, publish e community languages
- [ ] Dois usuários criados na mesma execução nunca colidem de e-mail
- [ ] `authedPage` abre `/dashboard` já logado, sem passar pelo formulário
- [ ] Rodar `fixtures.e2e.ts` duas vezes seguidas passa nas duas

**Verify:** `npm run test -w @ts-compilator-for-java/e2e -- specs/fixtures.e2e.ts` → `3 passed`, e repetir o comando → `3 passed`

**Steps:**

- [ ] **Step 1: Criar `support/unique.ts`**

Atenção: com `fullyParallel` cada worker é um processo separado, então um
contador de módulo colidiria entre workers. Por isso todo identificador leva
um componente aleatório, não um contador.

```ts
import { randomUUID } from "node:crypto";

/** Identifica a execução inteira — útil para achar sobras no banco. */
export const RUN_ID = (process.env.GITHUB_RUN_ID ?? randomUUID()).slice(0, 8);

function token(): string {
  return randomUUID().replace(/-/g, "").slice(0, 10);
}

export function uniqueName(prefix: string): string {
  return `E2E-${prefix}-${RUN_ID}-${token()}`;
}

export function uniqueEmail(role: string): string {
  return `e2e-${role}-${RUN_ID}-${token()}@test.local`;
}

/** `classes.access_code` é UNIQUE; 8 caracteres hex em maiúsculas bastam. */
export function uniqueAccessCode(): string {
  return token().slice(0, 8).toUpperCase();
}
```

- [ ] **Step 2: Criar `fixtures/api.ts`**

```ts
import type { APIRequestContext, APIResponse } from "@playwright/test";
import { API_URL } from "../support/env";
import { uniqueAccessCode, uniqueEmail, uniqueName } from "../support/unique";

export const E2E_PASSWORD = "e2e-password";

export type Account = {
  token: string;
  id: number;
  email: string;
  password: string;
  name: string;
};

export type ClassRecord = { id: number; name: string; accessCode: string };
export type ExerciseRecord = { id: number; title: string };
export type ExerciseListRecord = { id: number; title: string };

/**
 * Único ponto do pacote que fala HTTP com o backend. Os specs recebem esta
 * classe pela fixture `api` e nunca montam requisição na mão — assim uma
 * mudança de contrato se corrige em um arquivo só.
 */
export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  private bearer(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  private async unwrap<T>(response: APIResponse, what: string): Promise<T> {
    if (!response.ok()) {
      throw new Error(
        `${what} falhou: HTTP ${response.status()} — ${await response.text()}`,
      );
    }
    return (await response.json()) as T;
  }

  /** `GET /organizations` é público. O seed cria CEFET-MG, UFJF e System. */
  async academicOrganizationId(): Promise<number> {
    const response = await this.request.get(`${API_URL}/organizations`);
    const orgs = await this.unwrap<Array<{ id: number; name: string }>>(
      response,
      "GET /organizations",
    );
    const cefet = orgs.find((org) => org.name === "CEFET-MG");
    if (!cefet) {
      throw new Error(
        "CEFET-MG não encontrada — o seed do backend não rodou. Tente `make local-reset && make local-up`.",
      );
    }
    return cefet.id;
  }

  async register(
    role: "teacher" | "student",
    namePrefix: string,
  ): Promise<Account> {
    const organizationId = await this.academicOrganizationId();
    const email = uniqueEmail(role);
    const name = uniqueName(namePrefix);

    const response = await this.request.post(`${API_URL}/auth/register`, {
      data: { email, password: E2E_PASSWORD, name, role, organizationId },
    });
    const { accessToken } = await this.unwrap<{ accessToken: string }>(
      response,
      "POST /auth/register",
    );

    // register devolve só o token; o id vem do /auth/me.
    const profile = await this.me(accessToken);

    return { token: accessToken, id: profile.id, email, password: E2E_PASSWORD, name };
  }

  async login(email: string, password: string): Promise<string> {
    const response = await this.request.post(`${API_URL}/auth/login`, {
      data: { email, password },
    });
    const { accessToken } = await this.unwrap<{ accessToken: string }>(
      response,
      "POST /auth/login",
    );
    return accessToken;
  }

  async me(token: string) {
    const response = await this.request.get(`${API_URL}/auth/me`, {
      headers: this.bearer(token),
    });
    return this.unwrap<{ id: number; name: string; email: string; role: string }>(
      response,
      "GET /auth/me",
    );
  }

  async createClass(token: string, namePrefix = "turma"): Promise<ClassRecord> {
    const response = await this.request.post(`${API_URL}/classes`, {
      headers: this.bearer(token),
      data: {
        name: uniqueName(namePrefix),
        description: "Turma criada pela suite E2E",
        accessCode: uniqueAccessCode(),
      },
    });
    return this.unwrap<ClassRecord>(response, "POST /classes");
  }

  async joinClass(token: string, accessCode: string) {
    const response = await this.request.post(`${API_URL}/classes/join`, {
      headers: this.bearer(token),
      data: { accessCode },
    });
    return this.unwrap<{ classId: number }>(response, "POST /classes/join");
  }

  async createExercise(
    token: string,
    options: { description: string; titlePrefix?: string },
  ): Promise<ExerciseRecord> {
    const response = await this.request.post(`${API_URL}/exercises`, {
      headers: this.bearer(token),
      data: {
        title: uniqueName(options.titlePrefix ?? "exercicio"),
        description: options.description,
      },
    });
    return this.unwrap<ExerciseRecord>(response, "POST /exercises");
  }

  async addTestCase(
    token: string,
    exerciseId: number,
    testCase: {
      label?: string;
      input: string;
      expectedOutput: string;
      orderIndex?: number;
    },
  ) {
    const response = await this.request.post(
      `${API_URL}/exercises/${exerciseId}/test-cases`,
      {
        headers: this.bearer(token),
        data: {
          label: testCase.label ?? "caso 1",
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          orderIndex: testCase.orderIndex ?? 0,
        },
      },
    );
    return this.unwrap<{ id: number }>(
      response,
      `POST /exercises/${exerciseId}/test-cases`,
    );
  }

  async createExerciseList(
    token: string,
    titlePrefix = "lista",
  ): Promise<ExerciseListRecord> {
    const response = await this.request.post(`${API_URL}/exercise-lists`, {
      headers: this.bearer(token),
      data: {
        title: uniqueName(titlePrefix),
        description: "Lista criada pela suite E2E",
      },
    });
    return this.unwrap<ExerciseListRecord>(response, "POST /exercise-lists");
  }

  async addExerciseToList(
    token: string,
    listId: number,
    exerciseId: number,
    options?: { gradeWeight?: number; orderIndex?: number },
  ) {
    const response = await this.request.post(
      `${API_URL}/exercise-lists/${listId}/exercises`,
      {
        headers: this.bearer(token),
        data: {
          exerciseId,
          gradeWeight: options?.gradeWeight ?? 10,
          orderIndex: options?.orderIndex ?? 0,
        },
      },
    );
    return this.unwrap<{ exerciseId: number }>(
      response,
      `POST /exercise-lists/${listId}/exercises`,
    );
  }

  async publishList(
    token: string,
    listId: number,
    classId: number,
    options?: { deadline?: Date; totalGrade?: number; minRequired?: number },
  ) {
    const deadline =
      options?.deadline ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const response = await this.request.post(
      `${API_URL}/exercise-lists/${listId}/publish`,
      {
        headers: this.bearer(token),
        data: {
          classId,
          totalGrade: options?.totalGrade ?? 100,
          minRequired: options?.minRequired ?? 1,
          deadline: deadline.toISOString(),
        },
      },
    );
    return this.unwrap<{ classId: number; exerciseListId: number }>(
      response,
      `POST /exercise-lists/${listId}/publish`,
    );
  }

  async communityLanguages(token: string) {
    const response = await this.request.get(`${API_URL}/languages/community`, {
      headers: this.bearer(token),
    });
    return this.unwrap<
      Array<{ id: number; name: string; ownerName: string | null }>
    >(response, "GET /languages/community");
  }

  async myLanguages(token: string) {
    const response = await this.request.get(`${API_URL}/languages`, {
      headers: this.bearer(token),
    });
    return this.unwrap<Array<{ id: number; name: string }>>(
      response,
      "GET /languages",
    );
  }
}
```

- [ ] **Step 3: Criar `fixtures/auth.ts`**

```ts
import type { BrowserContext } from "@playwright/test";
import { BASE_URL } from "../support/env";

const TOKEN_COOKIE = "lms_access_token";

/**
 * O frontend lê a sessão do cookie `lms_access_token`
 * (packages/ide/src/lib/auth-cookies.ts:1). Injetar o cookie evita passar pelo
 * formulário de login em todo spec: mais rápido, e um bug no login não derruba
 * a suíte inteira. O spec auth.e2e.ts é o único que exercita o formulário.
 */
export async function seedAuthCookie(
  context: BrowserContext,
  token: string,
): Promise<void> {
  await context.addCookies([
    {
      name: TOKEN_COOKIE,
      value: token,
      url: BASE_URL,
      sameSite: "Lax",
    },
  ]);
}
```

- [ ] **Step 4: Criar `fixtures/index.ts`**

```ts
import { test as base, expect } from "@playwright/test";
import { ApiClient, type Account } from "./api";
import { seedAuthCookie } from "./auth";

type Fixtures = {
  /** Cliente da API do backend, para montar cenário sem passar pela UI. */
  api: ApiClient;
  /** Professor recém-criado, isolado desta execução. */
  teacher: Account;
  /** Aluno recém-criado, isolado desta execução. */
  student: Account;
  /** Autentica o contexto atual do browser com o token informado. */
  loginAs: (token: string) => Promise<void>;
};

export const test = base.extend<Fixtures>({
  api: async ({ request }, use) => {
    await use(new ApiClient(request));
  },

  teacher: async ({ api }, use) => {
    await use(await api.register("teacher", "professor"));
  },

  student: async ({ api }, use) => {
    await use(await api.register("student", "aluno"));
  },

  loginAs: async ({ context }, use) => {
    await use(async (token: string) => {
      await seedAuthCookie(context, token);
    });
  },
});

export { expect };
```

- [ ] **Step 5: Escrever o teste das fixtures (falha primeiro)**

Crie `packages/e2e/specs/fixtures.e2e.ts`:

```ts
import { expect, test } from "../fixtures";
import { SEED_TEACHER } from "../support/env";

test("cria professor e aluno isolados por execução", async ({
  teacher,
  student,
}) => {
  expect(teacher.id).toBeGreaterThan(0);
  expect(student.id).toBeGreaterThan(0);
  expect(teacher.email).not.toBe(student.email);
  expect(teacher.email).toMatch(/^e2e-teacher-/);
});

test("monta turma, exercicio, lista e publicacao pela API", async ({
  api,
  teacher,
  student,
}) => {
  const turma = await api.createClass(teacher.token);
  expect(turma.accessCode).toHaveLength(8);

  const exercicio = await api.createExercise(teacher.token, {
    description: "Imprima a palavra ok",
  });
  await api.addTestCase(teacher.token, exercicio.id, {
    input: "",
    expectedOutput: "ok",
  });

  const lista = await api.createExerciseList(teacher.token);
  await api.addExerciseToList(teacher.token, lista.id, exercicio.id);
  const publicacao = await api.publishList(teacher.token, lista.id, turma.id);

  expect(publicacao.classId).toBe(turma.id);
  expect(publicacao.exerciseListId).toBe(lista.id);

  const matricula = await api.joinClass(student.token, turma.accessCode);
  expect(matricula.classId).toBe(turma.id);
});

test("cookie injetado autentica o dashboard sem passar pelo login", async ({
  api,
  page,
  loginAs,
}) => {
  const token = await api.login(SEED_TEACHER.email, SEED_TEACHER.password);
  await loginAs(token);

  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText(SEED_TEACHER.name)).toBeVisible();
});
```

- [ ] **Step 6: Rodar e confirmar que passa**

```bash
npm run test -w @ts-compilator-for-java/e2e -- specs/fixtures.e2e.ts
```

Esperado: `3 passed`.

Se o terceiro teste falhar em `getByText(SEED_TEACHER.name)`, inspecione onde
o dashboard renderiza o nome com `npm run test:headed -w @ts-compilator-for-java/e2e -- specs/fixtures.e2e.ts`
e ajuste o seletor para o elemento real, mantendo a asserção de URL.

- [ ] **Step 7: Provar o isolamento rodando duas vezes**

```bash
npm run test -w @ts-compilator-for-java/e2e -- specs/fixtures.e2e.ts
npm run test -w @ts-compilator-for-java/e2e -- specs/fixtures.e2e.ts
```

Esperado: `3 passed` nas duas. Se a segunda falhar com erro de unicidade, o
`support/unique.ts` está errado.

- [ ] **Step 8: Commit**

```bash
git add packages/e2e/fixtures packages/e2e/support packages/e2e/specs/fixtures.e2e.ts
git commit -m "test(e2e): fixtures de API, autenticacao por cookie e dados unicos"
```

---

### Task 3: Adicionar os sete `data-testid` que faltam

**Goal:** Dar âncora estável aos elementos sem semântica acessível, validando cada um pelos specs Vitest que já existem.

**Files:**
- Modify: `packages/ide/src/components/editor.tsx:32`
- Modify: `packages/ide/src/components/terminal/index.tsx:93`
- Modify: `packages/ide/src/components/terminal/body.tsx:255,280`
- Modify: `packages/ide/src/views/tokens/show-tokens.tsx:80`
- Modify: `packages/ide/src/views/tokens/list-intermediate-code.tsx:72`
- Modify: `packages/ide/src/pages/exercises/workspace.tsx:301`
- Test: `packages/ide/src/components/editor.spec.tsx`
- Test: `packages/ide/src/components/terminal/body.spec.tsx`

**Acceptance Criteria:**
- [ ] Os sete testids existem e nenhum duplica nome
- [ ] `npm test -w @ts-compilator-for-java/ide` continua verde
- [ ] Nenhum `className` ou comportamento existente mudou

**Verify:** `npm test -w @ts-compilator-for-java/ide` → todos os specs passam

**Steps:**

- [ ] **Step 1: Conhecer o idioma de teste do IDE**

**`@testing-library/react` NÃO está instalado neste projeto.** Não use
`render()` nem `screen` — eles não existem aqui. Os specs usam `createRoot` do
`react-dom/client` com `act`, e consultam o DOM direto via `container`. Veja o
padrão real:

```bash
sed -n '1,58p' packages/ide/src/components/editor.spec.tsx
```

Cada caso monta seu próprio `div`, cria um root, renderiza dentro de
`await act(async () => {...})`, e desmonta no fim. O arquivo abre com o
pragma `// @vitest-environment jsdom`.

- [ ] **Step 2: Acrescentar a asserção do testid no spec do editor (falha primeiro)**

Acrescente este caso dentro do `describe("Editor", ...)` de
`packages/ide/src/components/editor.spec.tsx`, seguindo o idioma do arquivo:

```tsx
  it("expõe o container do Monaco por data-testid para o E2E", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<Editor />);
    });

    expect(container.querySelector('[data-testid="monaco-editor"]')).not.toBeNull();

    await act(async () => {
      root.unmount();
    });
  });
```

- [ ] **Step 3: Rodar e ver falhar**

```bash
npx vitest run --config packages/ide/vitest.integration.config.ts src/components/editor.spec.tsx --root packages/ide
```

Esperado: FAIL com `expected null not to be null`.

- [ ] **Step 4: Adicionar o testid no `editor.tsx`**

Em `packages/ide/src/components/editor.tsx`, a última linha do componente é:

```tsx
  return <div ref={editorContainerRef} className="h-full w-full" />;
```

Substitua por:

```tsx
  return (
    <div
      ref={editorContainerRef}
      data-testid="monaco-editor"
      className="h-full w-full"
    />
  );
```

- [ ] **Step 5: Rodar e ver passar**

```bash
npx vitest run --config packages/ide/vitest.integration.config.ts src/components/editor.spec.tsx --root packages/ide
```

Esperado: PASS.

- [ ] **Step 6: Adicionar os testids do terminal**

Em `packages/ide/src/components/terminal/index.tsx`, o `motion.div` do painel
começa assim:

```tsx
          <motion.div
            initial={{ y: "50%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "50%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
```

Acrescente o atributo logo após a abertura da tag:

```tsx
          <motion.div
            data-testid="terminal-panel"
            initial={{ y: "50%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "50%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
```

Em `packages/ide/src/components/terminal/body.tsx`, o `PerfectScrollbar` é:

```tsx
    <PerfectScrollbar
      ref={scrollRef}
      className="overflow-x-hidden p-4 font-mono text-sm h-65 terminal-scroll"
    >
```

Substitua por:

```tsx
    <PerfectScrollbar
      ref={scrollRef}
      data-testid="terminal-output"
      className="overflow-x-hidden p-4 font-mono text-sm h-65 terminal-scroll"
    >
```

E o `<input>` do mesmo arquivo:

```tsx
        <input
          ref={inputRef}
          type="text"
```

Substitua por:

```tsx
        <input
          ref={inputRef}
          data-testid="terminal-input"
          aria-label="Entrada do terminal"
          type="text"
```

- [ ] **Step 7: Verificar se o `PerfectScrollbar` repassa `data-testid` ao DOM**

Alguns wrappers de scrollbar não repassam props arbitrárias. Confirme:

```bash
grep -rn "PerfectScrollbar" packages/ide/src/components/terminal/body.tsx | head -3
grep -rn "perfect-scrollbar\|PerfectScrollbar" packages/ide/package.json packages/ide/src --include='*.tsx' --include='*.ts' | grep -v spec | head -5
```

Se for um componente local, leia-o e confirme que espalha `...props` no
elemento raiz. **Se não repassar**, envolva o `PerfectScrollbar` num
`<div data-testid="terminal-output">` em vez de passar o atributo para ele, e
registre a mudança no commit.

- [ ] **Step 8: Adicionar os testids das views de token e código intermediário**

Em `packages/ide/src/views/tokens/show-tokens.tsx`, o container da sequência é:

```tsx
              <div className="flex gap-2 flex-wrap w-full bg-transparent">
```

Substitua por:

```tsx
              <div
                data-testid="token-list"
                className="flex gap-2 flex-wrap w-full bg-transparent"
              >
```

Em `packages/ide/src/views/tokens/list-intermediate-code.tsx`, o container das
instruções é:

```tsx
        <div className="relative ml-6 space-y-10 border-l-2 border-cyan-300/70 dark:border-cyan-700/60">
```

Substitua por:

```tsx
        <div
          data-testid="intermediate-code-list"
          className="relative ml-6 space-y-10 border-l-2 border-cyan-300/70 dark:border-cyan-700/60"
        >
```

- [ ] **Step 9: Adicionar o testid do painel de submissão**

Em `packages/ide/src/pages/exercises/workspace.tsx`, o painel de resultado é:

```tsx
      {showSubmitPanel && (
        <div className="relative z-10 border-b border-white/5">
```

Substitua por:

```tsx
      {showSubmitPanel && (
        <div
          data-testid="submission-result-panel"
          className="relative z-10 border-b border-white/5"
        >
```

- [ ] **Step 10: Rodar a suíte Vitest completa do IDE**

```bash
npm test -w @ts-compilator-for-java/ide
```

Esperado: todos os specs passam. Se algum spec de snapshot quebrar por causa
dos atributos novos, atualize o snapshot — a mudança é intencional.

- [ ] **Step 11: Confirmar que não há testid duplicado**

```bash
grep -rhoE 'data-testid="[^"]+"' packages/ide/src --include='*.tsx' | sort | uniq -d
```

Esperado: saída vazia.

- [ ] **Step 12: Commit**

```bash
git add packages/ide/src
git commit -m "test(ide): adicionar data-testid nos pontos sem ancora acessivel"
```

---

### Task 4: Spec de autenticação

**Goal:** Cobrir login, registro, erro de credencial e proteção de rota.

**Files:**
- Create: `packages/e2e/specs/auth.e2e.ts`

**Acceptance Criteria:**
- [ ] Login com o professor do seed chega ao `/dashboard`
- [ ] Registro de usuário novo chega ao `/dashboard`
- [ ] Senha errada mostra erro e permanece em `/login`
- [ ] Rota protegida sem sessão redireciona para `/login`

**Verify:** `npm run test -w @ts-compilator-for-java/e2e -- specs/auth.e2e.ts` → `4 passed`

**Steps:**

- [ ] **Step 1: Escrever o spec**

Os seletores vêm dos labels reais do shadcn Form
(`packages/ide/src/components/auth/login-form.tsx:48` e
`register-form.tsx:100-170`): "Endereço de E-mail", "Senha", "Nome Completo",
"Instituição". O botão de login é "Entrar no Painel".

```ts
import { expect, test } from "../fixtures";
import { E2E_PASSWORD } from "../fixtures/api";
import { SEED_TEACHER } from "../support/env";
import { uniqueEmail, uniqueName } from "../support/unique";

test("login com credencial do seed chega ao dashboard", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Endereço de E-mail").fill(SEED_TEACHER.email);
  await page.getByLabel("Senha").fill(SEED_TEACHER.password);
  await page.getByRole("button", { name: /Entrar no Painel/i }).click();

  await expect(page).toHaveURL(/\/dashboard/);
});

test("senha errada mostra erro e mantem o usuario no login", async ({
  page,
}) => {
  await page.goto("/login");

  await page.getByLabel("Endereço de E-mail").fill(SEED_TEACHER.email);
  await page.getByLabel("Senha").fill("senha-definitivamente-errada");
  await page.getByRole("button", { name: /Entrar no Painel/i }).click();

  await expect(page.getByText(/credenc|inválid|incorret|Falha ao entrar/i).first()).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test("registro de aluno novo chega ao dashboard", async ({ page }) => {
  await page.goto("/register");

  await page.getByRole("button", { name: "Aluno" }).click();
  await page.getByLabel("Nome Completo").fill(uniqueName("aluno-ui"));
  await page.getByLabel("Endereço de E-mail").fill(uniqueEmail("ui-student"));
  await page.getByLabel("Senha").fill(E2E_PASSWORD);
  await page.getByLabel(/Instituição/).selectOption({ label: "CEFET-MG" });

  await page.getByRole("button", { name: /Criar|Cadastr|Registr/i }).click();

  await expect(page).toHaveURL(/\/dashboard/);
});

test("rota protegida sem sessao redireciona para o login", async ({ page }) => {
  await page.goto("/languages");

  await expect(page).toHaveURL(/\/login/);
});
```

- [ ] **Step 2: Rodar e ajustar seletores pelo que a UI realmente renderiza**

```bash
npm run test -w @ts-compilator-for-java/e2e -- specs/auth.e2e.ts
```

Dois seletores são deliberadamente tolerantes porque não foram verificados no
levantamento e dependem de cópia que pode mudar:

- o texto de erro de credencial, que vem de `getApiErrorMessage` com fallback
  "Falha ao entrar" (`packages/ide/src/pages/login.tsx:51`);
- o rótulo do botão de submit do registro.

Se algum falhar, descubra o texto exato e **fixe o seletor**, trocando o regex
por string literal:

```bash
npm run test:headed -w @ts-compilator-for-java/e2e -- specs/auth.e2e.ts
grep -n "HeroButton" -A3 packages/ide/src/components/auth/register-form.tsx | tail -8
```

- [ ] **Step 3: Confirmar que os quatro passam**

```bash
npm run test -w @ts-compilator-for-java/e2e -- specs/auth.e2e.ts
```

Esperado: `4 passed`.

- [ ] **Step 4: Commit**

```bash
git add packages/e2e/specs/auth.e2e.ts
git commit -m "test(e2e): cobrir login, registro e protecao de rota"
```

---

### Task 5: Helper do Monaco e spec do compilador

**Goal:** Exercitar lexer, gerador de IR e interpretador pela UI pública, incluindo um caso de erro.

**Files:**
- Create: `packages/e2e/support/monaco.ts`
- Create: `packages/e2e/specs/ide-compiler.e2e.ts`

**Acceptance Criteria:**
- [ ] Escrever código no Monaco e executar produz a saída esperada no terminal
- [ ] O painel de tokens lista os tokens do programa
- [ ] O código intermediário mostra temporários `__temp` ou labels `__label`
- [ ] Um erro de sintaxe é reportado em vez de passar silenciosamente

**Verify:** `npm run test -w @ts-compilator-for-java/e2e -- specs/ide-compiler.e2e.ts` → `4 passed`

**Steps:**

- [ ] **Step 1: Criar `support/monaco.ts`**

Nunca use `fill()` no Monaco: o textarea real é `.inputarea`, o valor não é
controlado por ele e `fill` não dispara o modelo do editor. O caminho
confiável é focar o textarea e digitar.

```ts
import { expect, type Page } from "@playwright/test";

const EDITOR = '[data-testid="monaco-editor"]';
const INPUT_AREA = `${EDITOR} textarea.inputarea`;

/** Espera o Monaco terminar de montar dentro do container. */
export async function waitForMonaco(page: Page): Promise<void> {
  await expect(page.locator(EDITOR)).toBeVisible();
  await expect(page.locator(`${EDITOR} .monaco-editor`)).toBeVisible();
  await expect(page.locator(INPUT_AREA)).toBeAttached();
}

/**
 * Substitui todo o conteúdo do editor pelo código informado.
 *
 * `autoClosingBrackets` do Monaco duplicaria `)`, `}` e `"` se digitássemos
 * caractere por caractere, então o texto entra pela área de transferência via
 * `insertText`, que o Monaco trata como uma colagem única.
 */
export async function setEditorCode(page: Page, code: string): Promise<void> {
  await waitForMonaco(page);

  const inputArea = page.locator(INPUT_AREA);
  await inputArea.focus();

  const selectAll = process.platform === "darwin" ? "Meta+A" : "Control+A";
  await page.keyboard.press(selectAll);
  await page.keyboard.press("Delete");

  await page.locator(INPUT_AREA).evaluate((element, value) => {
    const textarea = element as HTMLTextAreaElement;
    textarea.focus();
    // insertText dispara o pipeline de input do Monaco, ao contrário de
    // atribuir textarea.value diretamente.
    document.execCommand("insertText", false, value);
  }, code);

  await expect(page.locator(`${EDITOR} .view-lines`)).toContainText(
    firstMeaningfulToken(code),
  );
}

/** Lê o texto visível das linhas do editor. */
export async function readEditorCode(page: Page): Promise<string> {
  await waitForMonaco(page);
  return (await page.locator(`${EDITOR} .view-lines`).innerText()).trim();
}

function firstMeaningfulToken(code: string): string {
  const firstLine = code.trim().split("\n")[0] ?? "";
  return firstLine.trim().split(/\s+/)[0] ?? "";
}
```

- [ ] **Step 2: Escrever o spec do compilador**

Os rótulos dos botões vêm de `packages/ide/src/i18n/locales/pt-BR/ui.ts:8-9`:
`run_all` = "Executar" e `run_lexer` = "Executar Análise Léxica". A gramática
Java-- usada é a de `packages/compiler/src/resource/input-code.java`.

```ts
import { expect, test } from "../fixtures";
import { readEditorCode, setEditorCode, waitForMonaco } from "../support/monaco";

const PROGRAMA_VALIDO = `int main() {
  int i;
  for(i = 0; i < 3; i = i + 1) {
    print(i);
  }
  print("fim");
}`;

const PROGRAMA_COM_ERRO = `int main() {
  int i
  print(i);
}`;

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await waitForMonaco(page);
});

test("executa o programa e mostra a saida no terminal", async ({ page }) => {
  await setEditorCode(page, PROGRAMA_VALIDO);

  await page.getByRole("button", { name: "Executar", exact: true }).click();

  const terminal = page.getByTestId("terminal-output");
  await expect(terminal).toBeVisible();
  await expect(terminal).toContainText("012");
  await expect(terminal).toContainText("fim");
});

test("a analise lexica lista os tokens do programa", async ({ page }) => {
  await setEditorCode(page, PROGRAMA_VALIDO);

  await page
    .getByRole("button", { name: "Executar Análise Léxica" })
    .click();

  await expect(page.getByText(/Tokens Gerados/)).toBeVisible();

  await page.getByRole("button", { name: "Mostrar Tokens" }).click();

  const tokens = page.getByTestId("token-list");
  await expect(tokens).toBeVisible();
  await expect(tokens).toContainText("main");
  await expect(tokens).toContainText("for");
});

test("gera codigo intermediario com temporarios ou labels", async ({
  page,
}) => {
  await setEditorCode(page, PROGRAMA_VALIDO);

  await page.getByRole("button", { name: "Executar", exact: true }).click();

  const ir = page.getByTestId("intermediate-code-list");
  await expect(ir).toBeVisible();
  await expect(ir).toContainText(/__temp\d+|__label\d+/);
});

test("erro de sintaxe e reportado em vez de passar batido", async ({
  page,
}) => {
  await setEditorCode(page, PROGRAMA_COM_ERRO);

  await page.getByRole("button", { name: "Executar", exact: true }).click();

  // O toast de erro vem de useIntermediatorCode.ts:103 com a mensagem da issue.
  await expect(
    page.getByText(/erro|esperado|inesperado|linha/i).first(),
  ).toBeVisible();

  // E o código não foi silenciosamente substituído.
  expect(await readEditorCode(page)).toContain("int i");
});
```

- [ ] **Step 3: Rodar e ver o que falha**

```bash
npm run test -w @ts-compilator-for-java/e2e -- specs/ide-compiler.e2e.ts
```

Dois pontos esperam ajuste:

- **`toContainText("012")`** depende de como o interpretador concatena a saída
  de `print(i)` em iterações consecutivas. Se falhar, rode o compilador
  localmente para ver a saída exata e ajuste a asserção ao valor real:
  ```bash
  cd packages/compiler && npm run start
  ```
  Não relaxe a asserção para `toBeVisible()` — ela precisa checar conteúdo.
- **O clique em "Executar" abre o terminal** (`views/ide/index.tsx:171`), mas o
  painel de tokens e o de IR ficam abaixo na página. Se não estiverem visíveis,
  acrescente `await page.getByTestId("token-list").scrollIntoViewIfNeeded()`
  antes da asserção.

- [ ] **Step 4: Se `setEditorCode` não colar o texto, usar o fallback de digitação**

`document.execCommand("insertText")` é depreciado e pode não funcionar em
todas as versões do Chromium. Se o editor ficar vazio, troque o corpo do
`evaluate` por digitação com auto-close desligado:

```ts
  // Fallback: desliga o auto-close do Monaco e digita.
  await page.evaluate(() => {
    const monaco = (window as unknown as { monaco?: typeof import("monaco-editor") })
      .monaco;
    monaco?.editor
      .getEditors()[0]
      ?.updateOptions({ autoClosingBrackets: "never", autoClosingQuotes: "never" });
  });
  await inputArea.focus();
  await page.keyboard.type(code, { delay: 5 });
```

- [ ] **Step 5: Confirmar que os quatro passam**

```bash
npm run test -w @ts-compilator-for-java/e2e -- specs/ide-compiler.e2e.ts
```

Esperado: `4 passed`.

- [ ] **Step 6: Commit**

```bash
git add packages/e2e/support/monaco.ts packages/e2e/specs/ide-compiler.e2e.ts
git commit -m "test(e2e): cobrir lexer, codigo intermediario e execucao pela UI"
```

---

### Task 6: Spec do ciclo LMS ponta a ponta

**Goal:** Provar que professor cria o cenário, aluno entra na turma, resolve e submete, e a submissão é avaliada pelos test cases.

**Files:**
- Create: `packages/e2e/specs/lms-flow.e2e.ts`

**Acceptance Criteria:**
- [ ] Aluno entra na turma pela UI usando o código de acesso
- [ ] Submissão com código correto mostra os test cases passando e o badge "✓ Enviado"
- [ ] Submissão com código errado mostra os erros e **não** marca como enviado
- [ ] O estado de "enviado" persiste ao recarregar a página

**Verify:** `npm run test -w @ts-compilator-for-java/e2e -- specs/lms-flow.e2e.ts` → `3 passed`

**Steps:**

- [ ] **Step 1: Escrever o spec**

O cenário é montado pela API (rápido e determinístico) e a **verificação** é
toda pela UI. O aluno chega ao exercício por
`/exercises/{id}?listId={listId}&classId={classId}`, que é exatamente a URL
que `student-detail-view.tsx:120` gera.

Asserções vêm de `components/test-case-results.tsx` ("Casos de Teste",
"{passed}/{total} passaram", "PASSED") e de `pages/exercises/workspace.tsx`
("✓ Enviado", "Submeter Resposta", "Submissão Falhou").

```ts
import { expect, test } from "../fixtures";
import { setEditorCode, waitForMonaco } from "../support/monaco";

const CODIGO_CORRETO = `int main() {
  print("ok");
}`;

const CODIGO_COM_ERRO = `int main() {
  print("ok")
}`;

/** Monta turma + exercicio + lista publicada, e matricula o aluno. */
async function montarCenario(
  api: import("../fixtures/api").ApiClient,
  teacherToken: string,
  studentToken: string,
) {
  const turma = await api.createClass(teacherToken);
  const exercicio = await api.createExercise(teacherToken, {
    description: "Escreva um programa que imprima exatamente: ok",
  });
  await api.addTestCase(teacherToken, exercicio.id, {
    label: "imprime ok",
    input: "",
    expectedOutput: "ok",
  });

  const lista = await api.createExerciseList(teacherToken);
  await api.addExerciseToList(teacherToken, lista.id, exercicio.id);
  await api.publishList(teacherToken, lista.id, turma.id);
  await api.joinClass(studentToken, turma.accessCode);

  return { turma, exercicio, lista };
}

test("aluno entra na turma pelo codigo de acesso", async ({
  api,
  teacher,
  student,
  page,
  loginAs,
}) => {
  const turma = await api.createClass(teacher.token);

  await loginAs(student.token);
  await page.goto("/dashboard");

  await page.getByRole("button", { name: /Entrar em nova turma/i }).click();
  await page.getByLabel("Código de Acesso").fill(turma.accessCode);
  await page
    .getByRole("button", { name: /Entrar|Confirmar|Participar/i })
    .last()
    .click();

  await expect(page.getByText(turma.name)).toBeVisible();
});

test("submissao correta passa nos test cases e marca como enviada", async ({
  api,
  teacher,
  student,
  page,
  loginAs,
}) => {
  const { turma, exercicio, lista } = await montarCenario(
    api,
    teacher.token,
    student.token,
  );

  await loginAs(student.token);
  await page.goto(
    `/exercises/${exercicio.id}?listId=${lista.id}&classId=${turma.id}`,
  );

  await expect(page.getByRole("heading", { name: exercicio.title })).toBeVisible();
  await waitForMonaco(page);
  await setEditorCode(page, CODIGO_CORRETO);

  await page.getByRole("button", { name: "Submeter Resposta" }).click();

  const painel = page.getByTestId("submission-result-panel");
  await expect(painel).toBeVisible();
  await expect(painel).toContainText("Submissão Enviada");
  await expect(painel).toContainText("Casos de Teste");
  await expect(painel).toContainText("1/1 passaram");
  await expect(painel).toContainText("PASSED");

  await expect(page.getByText("✓ Enviado")).toBeVisible();

  // O estado precisa sobreviver ao reload — vem do backend, não do estado local.
  await page.reload();
  await expect(page.getByText("✓ Enviado")).toBeVisible();
});

test("submissao com erro de compilacao nao e aceita", async ({
  api,
  teacher,
  student,
  page,
  loginAs,
}) => {
  const { turma, exercicio, lista } = await montarCenario(
    api,
    teacher.token,
    student.token,
  );

  await loginAs(student.token);
  await page.goto(
    `/exercises/${exercicio.id}?listId=${lista.id}&classId=${turma.id}`,
  );

  await waitForMonaco(page);
  await setEditorCode(page, CODIGO_COM_ERRO);

  await page.getByRole("button", { name: "Submeter Resposta" }).click();

  const painel = page.getByTestId("submission-result-panel");
  await expect(painel).toBeVisible();
  await expect(painel).toContainText(/Submissão Falhou/);

  await expect(page.getByText("✓ Enviado")).toHaveCount(0);
});
```

- [ ] **Step 2: Rodar e ajustar o que falhar**

```bash
npm run test -w @ts-compilator-for-java/e2e -- specs/lms-flow.e2e.ts
```

Pontos que o levantamento não conseguiu confirmar e que podem precisar de ajuste:

- **O botão de confirmar do `JoinClassModal`**: `join-class-modal.tsx:128` tem
  `type="submit"`, mas o rótulo não foi lido. Se o seletor tolerante falhar,
  leia o arquivo e fixe a string exata:
  ```bash
  sed -n '120,140p' packages/ide/src/views/dashboard/components/join-class-modal.tsx
  ```
- **Onde o nome da turma aparece após entrar**: se `getByText(turma.name)` não
  achar, confirme se o dashboard revalida a lista. Se não revalidar
  automaticamente, acrescente `await page.reload()` antes da asserção — e
  registre no commit que o dashboard não invalida a query após o join, porque
  isso é um bug de UX que vale reportar.
- **`1/1 passaram`**: confere com `expectedOutput: "ok"` e `normalizeOutput`
  aplicando `trimEnd` (`pages/api/submissions/validate.ts:62`). Se falhar com
  `0/1`, imprima o `actualOutput` abrindo o acordeão para ver a diferença.

- [ ] **Step 3: Confirmar que os três passam, duas vezes seguidas**

```bash
npm run test -w @ts-compilator-for-java/e2e -- specs/lms-flow.e2e.ts
npm run test -w @ts-compilator-for-java/e2e -- specs/lms-flow.e2e.ts
```

Esperado: `3 passed` nas duas.

- [ ] **Step 4: Commit**

```bash
git add packages/e2e/specs/lms-flow.e2e.ts
git commit -m "test(e2e): cobrir ciclo LMS de turma, exercicio e submissao"
```

---

### Task 7: Spec de linguagem customizada

**Goal:** Provar que uma linguagem do catálogo comunitário é importada, fica ativa e o remapeamento de palavras-chave chega até o lexer.

**Files:**
- Create: `packages/e2e/specs/custom-language.e2e.ts`

**Acceptance Criteria:**
- [ ] `/community/languages` lista as 5 linguagens oficiais do seed
- [ ] Importar "Didática em Português" faz ela aparecer em `/languages`
- [ ] Ativar a linguagem marca o card com `data-language-active="true"`
- [ ] Um programa escrito com as palavras em português executa e imprime a saída

**Verify:** `npm run test -w @ts-compilator-for-java/e2e -- specs/custom-language.e2e.ts` → `3 passed`

**Steps:**

- [ ] **Step 1: Escrever o spec**

O preset `didactic-pt` (`backend/scripts/community_language_presets.py:81-117`)
mapeia `int`→`numero_inteiro`, `print`→`escreva`, e delimita blocos com
`inicio`/`fim`, mantendo `;` obrigatório. Os cards de linguagem já expõem
`aria-label` por nome e `data-language-active`, então quase nada precisa de
testid aqui.

```ts
import { expect, test } from "../fixtures";
import { setEditorCode, waitForMonaco } from "../support/monaco";

const LINGUAGEM = "Didática em Português";

const OFICIAIS = [
  "Didática em Português",
  "Pythonica",
  "Minimalista",
  "Ruby-like",
  "Minerês",
];

/** Equivalente de `int main() { print("ola"); }` no preset didactic-pt. */
const PROGRAMA_PT = `numero_inteiro principal() inicio
  escreva("ola");
fim`;

test("o catalogo da comunidade lista as linguagens oficiais do seed", async ({
  student,
  page,
  loginAs,
}) => {
  await loginAs(student.token);
  await page.goto("/community/languages");

  const cards = page.getByTestId("community-language-card");
  await expect(cards.first()).toBeVisible();

  for (const nome of OFICIAIS) {
    await expect(page.getByRole("heading", { name: nome })).toBeVisible();
  }
});

test("importar uma linguagem da comunidade a coloca em /languages", async ({
  api,
  student,
  page,
  loginAs,
}) => {
  await loginAs(student.token);
  await page.goto("/community/languages");

  await expect(page.getByTestId("community-language-card").first()).toBeVisible();
  await page.getByRole("button", { name: `Importar ${LINGUAGEM}` }).click();

  await page.goto("/languages");
  const card = page
    .getByTestId("language-card")
    .filter({ hasText: LINGUAGEM });
  await expect(card).toBeVisible();

  // E o backend concorda com a UI.
  const minhas = await api.myLanguages(student.token);
  expect(minhas.map((l) => l.name)).toContain(LINGUAGEM);
});

test("a linguagem ativa remapeia as palavras-chave no editor", async ({
  student,
  page,
  loginAs,
}) => {
  await loginAs(student.token);

  await page.goto("/community/languages");
  await expect(page.getByTestId("community-language-card").first()).toBeVisible();
  await page.getByRole("button", { name: `Importar ${LINGUAGEM}` }).click();

  await page.goto("/languages");
  const card = page
    .getByTestId("language-card")
    .filter({ hasText: LINGUAGEM });
  await expect(card).toBeVisible();

  await card.getByRole("button", { name: `Tornar ${LINGUAGEM} ativa` }).click();
  await expect(card).toHaveAttribute("data-language-active", "true");

  // Com a linguagem ativa, o programa em português tem que compilar e rodar.
  await page.goto("/");
  await waitForMonaco(page);
  await setEditorCode(page, PROGRAMA_PT);

  await page.getByRole("button", { name: "Executar", exact: true }).click();

  const terminal = page.getByTestId("terminal-output");
  await expect(terminal).toBeVisible();
  await expect(terminal).toContainText("ola");
});
```

- [ ] **Step 2: Rodar e ajustar**

```bash
npm run test -w @ts-compilator-for-java/e2e -- specs/custom-language.e2e.ts
```

Dois riscos conhecidos:

- **A linguagem ativa é persistida em `localStorage`** pelo `KeywordContext` /
  `useLanguagePersistence`. Como `page.goto("/")` é no mesmo contexto do
  browser, o estado sobrevive. Se não sobreviver, confirme a chave:
  ```bash
  grep -n "localStorage\|STORAGE_KEY" packages/ide/src/lib/keyword-language-storage.ts | head
  ```
  e, se necessário, injete o estado via `context.addInitScript` em vez de
  depender da navegação.
- **`escreva` e `inicio`/`fim`**: se o programa não compilar, valide o preset
  isoladamente antes de culpar o teste:
  ```bash
  grep -n -A30 'name="Didática em Português"' backend/scripts/community_language_presets.py
  ```

- [ ] **Step 3: Confirmar que os três passam**

```bash
npm run test -w @ts-compilator-for-java/e2e -- specs/custom-language.e2e.ts
```

Esperado: `3 passed`.

- [ ] **Step 4: Rodar a suíte inteira**

```bash
npm run test -w @ts-compilator-for-java/e2e
```

Esperado: `17 passed` (2 smoke + 3 fixtures + 4 auth + 4 ide + 3 lms + 3 linguagem — ajuste a conta se você dividiu algum caso).

- [ ] **Step 5: Commit**

```bash
git add packages/e2e/specs/custom-language.e2e.ts
git commit -m "test(e2e): cobrir importacao e uso de linguagem da comunidade"
```

---

### Task 8: Gate no CI — `deploy.yml` vira pipeline completo

**Goal:** Fazer o deploy na VPS depender de unit tests e da suíte E2E, e rodar tudo em PR também.

**Files:**
- Modify: `.github/workflows/deploy.yml`

**Acceptance Criteria:**
- [ ] O workflow dispara em `pull_request` e em `push` na `main`
- [ ] O job `deploy` tem `needs: [unit, e2e]` e só roda em push na `main`
- [ ] Em falha, o relatório e os traces do Playwright vão como artifact
- [ ] O job `e2e` despeja os logs do Compose quando falha
- [ ] Uma quebra deliberada em fluxo core faz o `lms-flow` reprovar

**Verify:** `python3 -c "import yaml;yaml.safe_load(open('.github/workflows/deploy.yml'))"` passa, e um PR de teste executa `unit` e `e2e` sem executar `deploy`

**Steps:**

- [ ] **Step 1: Ler o workflow atual para preservar o job de deploy intacto**

```bash
cat .github/workflows/deploy.yml
```

O job de SSH existente **não muda**; ele só ganha `needs` e `if`.

- [ ] **Step 2: Substituir o arquivo inteiro**

Escreva `.github/workflows/deploy.yml`:

```yaml
name: CI e Deploy

on:
  push:
    branches:
      - main
  pull_request:

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  unit:
    name: Lint e testes unitários
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Instalar dependências do monorepo
        run: npm install

      - name: Build do compilador (dependência do IDE)
        run: npm run build -w @ts-compilator-for-java/compiler

      - name: Testes do compilador
        run: npm run test -w @ts-compilator-for-java/compiler

      - name: Testes do IDE
        run: npm run test -w @ts-compilator-for-java/ide

      - name: Lint do IDE
        run: npm run lint -w @ts-compilator-for-java/ide

      - name: Instalar uv
        uses: astral-sh/setup-uv@v5

      - name: Testes do backend
        working-directory: backend
        env:
          SECRET_KEY: ci-only-secret-key
        run: |
          uv sync --frozen
          uv run pytest -q

  e2e:
    name: Testes E2E (Playwright)
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Instalar dependências do monorepo
        run: npm install

      - name: Instalar o Chromium do Playwright
        run: npm run install-browsers -w @ts-compilator-for-java/e2e

      - name: Subir a stack local
        run: make local-up

      - name: Esperar a stack ficar saudável
        run: |
          echo "Aguardando backend em http://localhost:8000/health"
          for i in $(seq 1 60); do
            if curl -fsS http://localhost:8000/health > /dev/null; then
              echo "backend ok"
              break
            fi
            sleep 5
          done
          curl -fsS http://localhost:8000/health

          echo "Aguardando frontend em http://localhost:3001"
          for i in $(seq 1 60); do
            if curl -fsS http://localhost:3001 > /dev/null; then
              echo "frontend ok"
              break
            fi
            sleep 5
          done
          curl -fsS -o /dev/null http://localhost:3001

      - name: Rodar a suíte E2E
        run: npm run test -w @ts-compilator-for-java/e2e

      - name: Logs da stack (em caso de falha)
        if: failure()
        run: docker compose --env-file /dev/null -f docker-compose.local.yml logs --tail 300

      - name: Publicar relatório do Playwright
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: |
            packages/e2e/playwright-report/
            packages/e2e/test-results/
          retention-days: 7
          if-no-files-found: ignore

  deploy:
    name: Deploy na VPS
    needs: [unit, e2e]
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          command_timeout: 30m # build pode demorar
          script: |
            /home/vitola/scripts/deploy-tcc/deploy.sh
```

- [ ] **Step 3: Validar a sintaxe do YAML antes de empurrar**

```bash
python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/deploy.yml')); print('YAML ok')"
```

Esperado: `YAML ok`. Indentação de YAML é fácil de estragar ao colar — se
acusar erro, o traceback aponta a linha.

- [ ] **Step 4: Confirmar que os comandos de teste referenciados existem**

O job chama `npm run test -w @ts-compilator-for-java/compiler`. Confirme o
nome e o script:

```bash
node -e "const p=require('./packages/compiler/package.json'); console.log(p.name, JSON.stringify(p.scripts))"
```

Se o nome do pacote ou o script `test` divergir, ajuste o workflow ao que
existe — não invente script novo.

- [ ] **Step 5: Confirmar que o backend tem `uv.lock` para `--frozen`**

```bash
ls backend/uv.lock && echo "lock ok"
```

Se não existir, troque `uv sync --frozen` por `uv sync` no workflow.

- [ ] **Step 6: Provar que a suíte pega uma quebra real de fluxo core**

Um gate que nunca reprovou não é um gate. Quebre a avaliação de test cases de
propósito e confirme que o `lms-flow` reprova.

Em `packages/ide/src/pages/api/submissions/validate.ts`, a linha que decide se
um caso passou é:

```ts
                    const passed = !error && actualOutput === expectedNormalized
```

Troque temporariamente por:

```ts
                    const passed = false
```

Rebuilde a imagem do frontend (a rota vive dentro dela) e rode só o spec do
LMS:

```bash
make local-up
npm run test -w @ts-compilator-for-java/e2e -- specs/lms-flow.e2e.ts
```

Esperado: **FAIL** no caso "submissao correta passa nos test cases", com o
Playwright reclamando que o painel não contém `1/1 passaram`. Isso prova que a
asserção é de conteúdo, não de presença.

Agora desfaça e confirme o verde:

```bash
git checkout -- packages/ide/src/pages/api/submissions/validate.ts
make local-up
npm run test -w @ts-compilator-for-java/e2e -- specs/lms-flow.e2e.ts
```

Esperado: `3 passed`. O `make local-up` rebuilda a imagem, então cada metade
deste passo leva alguns minutos — é o custo de provar o gate uma vez.

- [ ] **Step 7: Commit e push da branch para exercitar o CI**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: gatear o deploy com testes unitarios e suite E2E"
git push -u origin test/playwright-e2e-gate
```

- [ ] **Step 8: Abrir o PR e conferir que `deploy` não roda**

```bash
gh pr create --fill --title "test: suite E2E Playwright como gate de regressao"
gh pr checks --watch
```

Esperado: `unit` e `e2e` executam; `deploy` aparece como skipped. Se `deploy`
executar num PR, o `if` está errado.

---

### Task 9: Hook local `pre-push` e documentação

**Goal:** Dar feedback rápido antes do push e documentar como rodar a suíte.

**Files:**
- Create: `.githooks/pre-push`
- Modify: `README.MD`

**Acceptance Criteria:**
- [ ] `.githooks/pre-push` é executável e versionado
- [ ] O hook reprova um push quando um unit test quebra
- [ ] O hook **não** sobe Docker nem roda Playwright
- [ ] O README documenta `make e2e` e a ativação do hook

**Verify:** `git config core.hooksPath .githooks && .githooks/pre-push` → sai com código 0 com a árvore limpa

**Steps:**

- [ ] **Step 1: Criar o hook**

Crie `.githooks/pre-push`:

```sh
#!/bin/sh
# Gate local leve: lint e testes unitários antes do push.
#
# A suíte E2E NÃO roda aqui — ela precisa da stack Docker e levaria minutos a
# cada push. Ela é o gate do CI (.github/workflows/deploy.yml) e roda local
# sob demanda com `make e2e`.
#
# Ativar: git config core.hooksPath .githooks
# Pular uma vez: git push --no-verify
set -e

echo "▶ pre-push: testes do compilador"
npm run test -w @ts-compilator-for-java/compiler

echo "▶ pre-push: testes do IDE"
npm run test -w @ts-compilator-for-java/ide

echo "▶ pre-push: lint do IDE"
npm run lint -w @ts-compilator-for-java/ide

echo "✅ pre-push: tudo verde. Lembre que o E2E roda no CI (ou com make e2e)."
```

- [ ] **Step 2: Torná-lo executável e ativar**

```bash
chmod +x .githooks/pre-push
git config core.hooksPath .githooks
```

- [ ] **Step 3: Provar que o hook reprova de verdade**

Quebre um teste de propósito, rode o hook, e desfaça. O arquivo abaixo existe
e é o único spec de `tests/tokens/`:

```bash
echo 'it("falha de proposito para validar o hook", () => { expect(1).toBe(2); });' \
  >> packages/compiler/src/tests/tokens/index.spec.ts
.githooks/pre-push; echo "exit code: $?"
```

Esperado: código de saída diferente de 0, com o Vitest reportando
`expected 1 to be 2`.

Agora **desfaça a quebra** e confirme que volta ao verde:

```bash
git checkout -- packages/compiler/src/tests/tokens/index.spec.ts
.githooks/pre-push; echo "exit code: $?"
```

Esperado: `exit code: 0`.

- [ ] **Step 4: Documentar no README**

Em `README.MD`, logo depois da seção `### Backend (FastAPI)` e antes de
`## Database`, insira:

````markdown
### End-to-end tests (Playwright)

The `packages/e2e` workspace holds the regression gate: four specs covering
auth, the in-browser compiler (lexer → IR → interpreter), the full LMS cycle
(class → exercise → submission), and importing a community language.

They run against the real Docker stack, so start it first:

```bash
npm install
npm run install-browsers -w @ts-compilator-for-java/e2e   # once
make e2e                                                  # up + run the suite
```

Useful variants:

```bash
npm run test -w @ts-compilator-for-java/e2e -- specs/lms-flow.e2e.ts  # one spec
make e2e-ui                                                            # Playwright UI mode
npm run report -w @ts-compilator-for-java/e2e                          # last HTML report
```

Test data is created per run through the backend API with an `E2E-<runId>`
prefix, so consecutive runs never collide. The seed is only read from (the
`professor@gmail.com` account and the five official languages).

### Pre-push hook

A lightweight local gate runs lint and unit tests before every push. Enable it
once per clone:

```bash
git config core.hooksPath .githooks
```

The E2E suite is deliberately **not** in the hook — booting Docker on every
push would be too slow. It gates `main` from CI instead
(`.github/workflows/deploy.yml`), where the `deploy` job depends on both
`unit` and `e2e`.
````

- [ ] **Step 5: Verificar que o README não quebrou**

```bash
grep -n "End-to-end tests (Playwright)" README.MD
grep -c '```' README.MD
```

O segundo comando deve devolver um número **par** — cercas de código
desbalanceadas quebram a renderização no GitHub.

- [ ] **Step 6: Commit**

```bash
git add .githooks/pre-push README.MD
git commit -m "chore: hook pre-push leve e documentacao da suite E2E"
git push
```

- [ ] **Step 7: Verificação final da entrega**

```bash
make local-reset
make local-up
npm run test -w @ts-compilator-for-java/e2e
npm run test -w @ts-compilator-for-java/e2e
npx vitest run --reporter=verbose 2>&1 | grep -c "packages/e2e"
gh pr checks
```

Esperado: a suíte passa nas duas rodadas em banco limpo, o Vitest da raiz
coleta `0` arquivos de `packages/e2e`, e o PR mostra `unit` e `e2e` verdes com
`deploy` skipped.

---

## Fora de escopo (deliberadamente)

- **Testids no wizard `keyword-customizer`.** Nenhum dos quatro specs usa o
  wizard; a linguagem customizada entra por importação do catálogo.
- **Corrigir o `CLAUDE.md`.** Ele descreve rotas que não existem mais
  (`/api/lexer`, `/api/intermediator`, `/api/auth/*`) e cita Prisma. É um
  problema real, mas é outro trabalho — não misture com este PR.
- **Cobrir o fluxo do professor pela UI** (criar turma e exercício clicando).
  As fixtures fazem isso pela API. Vale um spec futuro, mas o risco de
  regressão maior está no caminho do aluno, que é o que a Task 6 cobre.
- **Testes de acessibilidade, visuais e de performance.** Escopo de outro
  plano.
