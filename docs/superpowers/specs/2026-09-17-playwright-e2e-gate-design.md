# Suíte E2E com Playwright como Gate de Regressão — Design

**Data:** 2026-09-17

## Objetivo

Impedir que uma quebra em funcionalidade core chegue à `main` e, por
consequência, à VPS. Hoje `.github/workflows/deploy.yml` dispara em todo push
na `main` e executa o deploy **sem rodar teste nenhum**. Não existe hook de
git, nem husky, nem job de CI que valide qualquer coisa.

A entrega é uma suíte Playwright que exercita quatro fluxos de ponta a ponta
contra a stack Docker real, mais o encanamento que faz o deploy depender dela.

## O que já existe

| Peça | Onde | Estado |
|---|---|---|
| Vitest do compilador | `packages/compiler/src/tests/` | Passa, não roda em CI |
| Vitest do IDE (~60 specs) | `packages/ide/vitest.integration.config.ts` | Passa, não roda em CI |
| Pytest do backend | `backend/tests/` | Passa, não roda em CI |
| Stack Docker local seedada | `docker-compose.local.yml`, `Makefile` | Funciona (`make local-up`) |
| Migrations + seed automáticos | `backend/entrypoint.sh` | `alembic upgrade head` + `seed.py` antes do uvicorn |
| Deploy na VPS | `.github/workflows/deploy.yml` | **Sem gate algum** |
| `data-testid` no IDE | `views/ide/index.tsx:209`, `views/languages/components/language-card.tsx:38`, `views/community/community-languages-view.tsx:309` | Só 3: `ide-shell`, `language-card`, `community-language-card` |
| `aria-label` nos cards de linguagem | `language-card.tsx:93-157`, `community-languages-view.tsx:336-341` | Já completo (`Importar X`, `Tornar X ativa`, `Ver DNA de X`) |

### Funcionalidades core mapeadas

1. **Auth** — `/login`, `/register`; JWT em cookie `lms_access_token`
   (`packages/ide/src/lib/auth-cookies.ts`); páginas com `requireAuth = true`.
2. **IDE / compilador** — embutido na landing **`/` (pública)** via `IDEView`
   (`packages/ide/src/pages/index.tsx:32`): Monaco, executar, terminal, análise
   de tokens, código intermediário, debugger com breakpoints, grammar graph.
   Também embutido em `/exercises/workspace` (autenticado) via `<IDE />`.
3. **Linguagens customizáveis** — `/language-creator` (wizard
   `keyword-customizer`: identidade → tipo → estrutura → regras → fluxo →
   revisão), `/languages` (minhas), `/community/languages` (catálogo com 5
   presets oficiais SYSTEM vindos do seed).
4. **LMS professor** — `/dashboard`: criar turma, criar exercício com test
   cases, listas (`/exercise-lists`), publicar lista em turma com prazo e peso.
5. **LMS aluno** — entrar na turma por código, resolver no workspace, submeter
   (`/api/submissions/validate` → roda os test cases), ver nota.
6. **Language policy** — precedência exercício > lista > livre, com
   `LockedLanguageBanner` quando a linguagem é imposta.

## Decisões

| Decisão | Escolha | Por quê |
|---|---|---|
| Ambiente | Stack Docker completa (`make local-up`) | Fiel ao real; idêntico local e CI; pega quebra de contrato front↔backend |
| Gate | GitHub Actions bloqueando o deploy + hook `pre-push` leve | Protege a `main` de verdade; push local continua rápido |
| Seletores | Híbrido: `getByRole`/`getByLabel` + `data-testid` pontual | Testes legíveis e resilientes a mudança de cópia pt-BR |
| Dados | Fixtures criadas por teste via API do backend | Independentes, paralelizáveis, sem ordem; seed só para leitura |

### Alternativas descartadas

- **API mockada no Playwright** — rápida e determinística, mas não pega
  divergência de contrato entre Next.js e FastAPI, que é o risco maior aqui.
- **Reset do banco entre specs** — determinismo máximo, porém serializa tudo;
  a suíte iria de ~2 min para ~10 min.
- **Usar apenas o seed como dado** — na segunda execução a turma já existe e o
  teste falha. É o tipo de flake que faz o time desativar o gate.
- **Seletores só por texto** — toda asserção fica refém da string em
  português; trocar "Submeter Resposta" quebraria a suíte inteira.

## Arquitetura

### Pacote isolado

```
packages/e2e/
├── package.json              # nome: @ts-compilator-for-java/e2e; dep única: @playwright/test
├── playwright.config.ts      # baseURL 3001, API 8000, trace on-first-retry
├── fixtures/
│   ├── api.ts                # cliente do backend (register/login/create*)
│   ├── auth.ts               # injeta cookie lms_access_token
│   └── index.ts              # `test` estendido com as fixtures
├── support/
│   ├── unique.ts             # sufixo E2E-<runId> por execução
│   └── monaco.ts             # digitar/ler código no Monaco
└── specs/
    ├── auth.e2e.ts
    ├── ide-compiler.e2e.ts
    ├── lms-flow.e2e.ts
    └── custom-language.e2e.ts
```

Pacote separado para que os browsers e deps do Playwright não entrem no
bundle do IDE, e para rodar isolado:
`npm run test:e2e -w @ts-compilator-for-java/e2e`.

**Sufixo `.e2e.ts`, não `.spec.ts`.** O `vitest.config.ts` da raiz não declara
`include`, então o glob padrão (`**/*.{test,spec}.?(c|m)[jt]s?(x)`) capturaria
arquivos Playwright novos e o Vitest tentaria executá-los. Além do sufixo
distinto, o design adiciona `exclude: ["packages/e2e/**"]` na config da raiz
como segunda barreira.

### Fronteiras dos módulos

| Unidade | Responsabilidade | Depende de |
|---|---|---|
| `fixtures/api.ts` | Criar entidades no backend via HTTP; devolve ids e tokens | `request` context do Playwright |
| `fixtures/auth.ts` | Transformar um token em contexto de browser autenticado | `api.ts` |
| `support/monaco.ts` | Escrever e ler código no editor com espera correta | `page` |
| `support/unique.ts` | Gerar identificadores únicos por execução | nada |
| `specs/*.e2e.ts` | Asserções de fluxo; nenhuma chamada HTTP crua | fixtures + support |

Nenhum spec monta payload de API na mão nem chama `page.keyboard` direto —
isso vive nas fixtures e no support, para que uma mudança de contrato ou de
versão do Monaco seja corrigida em um arquivo só.

### Fixtures e isolamento de dados

`apiFixture` fala com `http://localhost:8000` usando o `request` context do
Playwright. Todos os endpoints necessários já existem:

- `POST /auth/register`, `POST /auth/login` → `{ accessToken, user }`
- `POST /classes` → devolve `accessCode`; `POST /classes/join`
- `POST /exercises`, `POST /exercises/{id}/test-cases`
- `POST /exercise-lists`, `POST /exercise-lists/{id}/exercises`,
  `POST /exercise-lists/{id}/publish`
- `GET /languages/community`, `POST /languages/{id}/import`

`authedPage` injeta o cookie via `context.addCookies([{ name:
"lms_access_token", value: token, url: baseURL }])`. Os specs de IDE, LMS e
linguagem **não passam pela tela de login** — só `auth.e2e.ts` exercita o
formulário. Isso evita que um bug no login derrube a suíte inteira e corta
alguns segundos por teste.

Cada execução gera um `runId` (`GITHUB_RUN_ID` quando presente, senão um
`randomUUID().slice(0, 8)`). Toda entidade criada carrega `E2E-<runId>-...` e
os usuários viram `e2e-<runId>-teacher@test.local`. Duas execuções seguidas
nunca colidem. O seed permanece intocado e é usado somente para leitura: login
do `professor@gmail.com` / `professor` e os 5 presets oficiais do catálogo.

Não há teardown de dados: o banco é o volume descartável
`ts-compilator-local-postgres-data`, recriado no CI a cada execução e
resetável localmente com `make local-reset`.

## Os quatro specs

### `auth.e2e.ts`

- Registro de usuário novo leva ao `/dashboard`.
- Login com o professor do seed mostra o nome no header do dashboard.
- Senha errada exibe mensagem de erro e permanece em `/login`.
- `/languages` sem sessão redireciona para `/login`.

### `ide-compiler.e2e.ts` (contra `/`, público)

- Digita um programa Java-- no Monaco, executa, confere a saída no terminal.
- Abre o painel de tokens e valida a classificação dos lexemas.
- Abre o código intermediário e confere a geração de `__temp`/`__label`.
- Um caso de erro de sintaxe deve marcar a linha e reportar a issue.

Protege o compilador inteiro — lexer, parser, emitter e interpretador — pelo
caminho que o usuário realmente usa.

### `lms-flow.e2e.ts`

O spec de maior valor. Via API: professor cria turma, exercício com test
cases, lista, e publica com prazo. Via UI: aluno entra na turma pelo código,
navega lista → exercício, escreve código correto e clica **Submeter
Resposta**; a asserção é o painel de test cases passando mais o badge
"✓ Enviado". Em seguida submete código errado em outro exercício e confere que
os erros aparecem e o status **não** vira enviado.

### `custom-language.e2e.ts`

Abre `/community/languages`, confere os 5 presets oficiais, importa "Didática
em Português", valida que aparece em `/languages`, aplica no editor e roda um
snippet com a palavra-chave em português — provando que o remapeamento chega
até o lexer.

## Seletores a adicionar

O levantamento mostrou que a UI já é mais testável do que o esperado, então a
adição é menor do que se previa. Confirmado por inspeção:

- Formulários de login/registro usam `Form`/`FormLabel` do shadcn, que fazem o
  wiring `htmlFor` ↔ `id` (`components/ui/form.tsx:89-117`). `getByLabel` com
  "Endereço de E-mail", "Senha", "Nome Completo", "Instituição" e "Código de
  Acesso" funciona sem mudança.
- Botões do IDE têm `aria-label` vindo do i18n: "Executar Análise Léxica" e
  "Executar" (`views/ide/components/menu.tsx:44-58`).
- Cards de linguagem já expõem `aria-label` por nome ("Importar X", "Tornar X
  ativa") e `data-language-active` para o estado ativo.

Restam **7 `data-testid`**, só onde não há âncora acessível alguma:

| testid | Arquivo | Por quê |
|---|---|---|
| `monaco-editor` | `components/editor.tsx:32` | `<div>` nu; Monaco monta dentro |
| `terminal-panel` | `components/terminal/index.tsx:93` | `motion.div` sem role |
| `terminal-output` | `components/terminal/body.tsx:255` | Distinguir saída do input |
| `terminal-input` | `components/terminal/body.tsx:280` | `<input>` sem label |
| `token-list` | `views/tokens/show-tokens.tsx:80` | `<div>` de layout |
| `intermediate-code-list` | `views/tokens/list-intermediate-code.tsx` | idem |
| `submission-result-panel` | `pages/exercises/workspace.tsx:301` | idem |

**Removido do escopo:** testids nos passos do wizard `keyword-customizer`. A
versão anterior deste design os listava, mas nenhum dos quatro specs exercita
o wizard — a linguagem customizada entra por importação do catálogo. Adicioná-
los seria trabalho sem consumidor.

## O gate

### CI: `deploy.yml` passa a ser o pipeline completo

```yaml
on:
  push:
    branches: [main]
  pull_request:

jobs:
  unit:
    # next lint + vitest do compiler + vitest do ide + pytest do backend
  e2e:
    # docker compose local up → espera healthy → playwright → upload trace se falhar
  deploy:
    needs: [unit, e2e]
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    # o job de SSH atual, inalterado
```

Um único workflow, sem `workflow_run` — que é frágil e não bloqueia de fato.
Efeito prático: **se a suíte quebrar, o deploy na VPS não acontece.** Hoje ele
acontece sempre.

### Local: hook `pre-push` versionado

`.githooks/pre-push` no repositório, ativado com
`git config core.hooksPath .githooks` (sem husky, sem dependência nova). Roda
somente unit + lint, na casa de 40 segundos. O E2E fica no CI e sob demanda
via `make e2e`, porque subir Docker a cada push seria atrito demais.

O hook é contornável com `--no-verify`; ele é conveniência, não a barreira. A
barreira real é o `needs: [unit, e2e]` do CI.

## Tratamento de erro e diagnóstico

- `trace: "on-first-retry"`, `screenshot: "only-on-failure"`,
  `video: "retain-on-failure"`.
- `retries: 2` no CI, `0` local — um teste que só passa no retry aparece como
  "flaky" no relatório em vez de ser silenciosamente aprovado.
- Em falha, o job faz upload do `playwright-report/` e dos traces como
  artifact, e despeja `docker compose logs` do backend no log do job.
- O `webServer` do Playwright **não** é usado; a stack sobe pelo Compose, e a
  espera é um passo explícito que faz poll no `/health` do backend e na raiz do
  frontend até os healthchecks do Compose reportarem `healthy`.

## Riscos assumidos

- **Monaco em headless** é a fonte clássica de flake. O helper
  `support/monaco.ts` nunca usa `fill()`: clica na área do editor, espera o
  editor montar e usa `page.keyboard.type()`. Centralizado em um arquivo.
- **Build do Docker no CI** custa de 3 a 5 minutos na primeira execução;
  mitigado com cache de layer do GitHub Actions.
- **Cobertura**: isto é gate de regressão nos fluxos core, e não substitui os
  ~60 specs de Vitest nem o pytest — ambos continuam rodando no job `unit`.

## Critérios de aceitação

- [ ] `make local-up && npm run test:e2e -w @ts-compilator-for-java/e2e` passa
      em máquina limpa.
- [ ] Rodar a suíte duas vezes seguidas sem `make local-reset` passa nas duas.
- [ ] `vitest run` na raiz e `npm test -w @ts-compilator-for-java/ide` não
      coletam nenhum arquivo de `packages/e2e/`.
- [ ] Um PR com quebra deliberada em fluxo core reprova o job `e2e`.
- [ ] Push na `main` com a suíte reprovando **não** executa o job `deploy`.
- [ ] `.githooks/pre-push` reprova um push com unit test quebrado.
