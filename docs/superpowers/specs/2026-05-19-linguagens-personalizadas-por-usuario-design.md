# Linguagens Personalizadas por Usuário — Design

**Data:** 2026-05-19
**Revisado:** 2026-08-04 — ver [Revisão 2026-08-04](#revisão-2026-08-04)
**Branch:** `feat/user-languages` (mergeada) → `feat/languages-dashboard-entry`

## Revisão 2026-08-04

A primeira rodada foi implementada quase por inteiro. Auditoria do spec
contra a `main`:

**Entregue:** modelo `languages`, colunas em `users`/`exercises`/`submissions`,
usuário-sistema, módulo `/languages` completo (CRUD + clone + read-gate),
`lib/languages-api.ts`, `hooks/useLanguages.ts`, hidratação do
`KeywordContext` pela linguagem ativa, `LockedLanguageBanner` com "Clonar
para meu acervo", policy `OPEN`/`LOCKED` no form de exercício, snapshot na
submissão.

**Não entregue, e é o que esta revisão cobre:**

1. Não existe ponto de entrada fora do IDE. O único acesso ao acervo é o
   botão em `keyword-customizer-header.tsx`, que só existe dentro de
   `/language-creator`. Quem faz login e cai no `/dashboard` não tem
   caminho nenhum até a criação de linguagem.
2. O wizard nunca persiste no backend. `keyword-customizer-context.tsx`
   chama apenas `saveSavedKeywordLanguage()` (localStorage); não sabe qual
   linguagem está editando e nunca chama `useCreateLanguage` /
   `useUpdateLanguage`.
3. Por consequência, o Fluxo A ("customiza no editor → Salvar → POST")
   nunca funcionou ponta a ponta.

**Decisões desta revisão:**

| Tema | Decisão |
|---|---|
| Superfície do acervo | Página dedicada `/languages` — **revoga** a decisão anterior de "modal, não página" |
| Entrada | Item "Minhas Linguagens" no `Sidebar`, idêntico para aluno e professor |
| Wizard | Vira criador **e** editor: `?id=N` carrega, salva via backend quando logado |
| Identidade da linguagem | `image_url`, `image_query`, `preset_id` viram colunas de `languages` |
| Seletor do IDE | Passa a ler do backend quando logado (hoje lê só localStorage) |
| `LanguageLibraryModal` | Aposentado; a página assume seu papel |

## Contexto

> Esta seção, "Objetivo" e "Decisões" descrevem o estado **antes** da
> primeira rodada, preservados como registro. Para o que já existe hoje,
> ver [Revisão 2026-08-04](#revisão-2026-08-04).

Em 2026-05-19 a personalização da linguagem Java-- vivia inteiramente no front-end:
`KeywordContext` (`packages/ide/src/contexts/keyword/KeywordContext.tsx`) mantém
um `StoredKeywordCustomization` persistido em `localStorage` (chaves
`keyword-customization` e legacy `keyword-mappings`). Não há vínculo com o
usuário no backend, e portanto não é possível:

- preservar a linguagem do aluno entre dispositivos/navegadores;
- o professor anexar uma linguagem específica a um exercício;
- garantir que a correção de uma submissão use a mesma customização do
  momento em que foi feita.

## Objetivo

Permitir que usuários criem e mantenham um acervo de linguagens
personalizadas no backend, vinculadas ao próprio usuário, e que exercícios
possam opcionalmente fixar uma linguagem obrigatória. Submissões guardam um
snapshot completo da customização usada, garantindo reprodutibilidade.

## Decisões

| Tema | Decisão |
|---|---|
| Cardinalidade | Várias linguagens nomeadas por usuário; uma é a "ativa" |
| Política do exercício | `OPEN` (aluno usa qualquer uma sua) **ou** `LOCKED` em uma linguagem específica |
| Compartilhamento | Aluno pode **clonar** a linguagem travada de um exercício para o próprio acervo |
| Exercícios do site | Usuário-sistema (`role = SYSTEM`) é o dono de conteúdo oficial; sem flags extras |
| Snapshot na submissão | JSON completo da customização gravado em `submissions.language_snapshot` (sem FK) |
| Modelagem | Tabela `languages` única com `customization` em JSONB (estrutura idêntica ao front) |

## Modelo de dados

### Nova tabela `languages`

```
languages
  id              SERIAL PK
  owner_id        INT NOT NULL FK → users(id) ON DELETE CASCADE
  name            VARCHAR NOT NULL
  description     VARCHAR NULL
  customization   JSONB NOT NULL        -- StoredKeywordCustomization inteiro
  image_url       VARCHAR NULL          -- (2026-08-04) identidade visual
  image_query     VARCHAR NULL          -- (2026-08-04) termo usado na busca
  preset_id       VARCHAR NULL          -- (2026-08-04) WizardPresetId
  cloned_from_id  INT NULL FK → languages(id) ON DELETE SET NULL
  created_at      TIMESTAMP NOT NULL
  updated_at      TIMESTAMP NOT NULL
  UNIQUE (owner_id, name)
  INDEX (owner_id)
```

`customization` espelha o tipo TypeScript `StoredKeywordCustomization`
(`packages/ide/src/contexts/keyword/types.ts`): `mappings`,
`operatorWordMap`, `booleanLiteralMap`, `statementTerminatorLexeme`,
`blockDelimiters`, `modes`, `languageDocumentation`.

### Campos de identidade (2026-08-04)

O wizard produz cinco campos de identidade — `name`, `description`,
`imageUrl`, `imageQuery`, `presetId` — mas a tabela só tinha os dois
primeiros. Sem os outros três, salvar no backend perderia a imagem e o
preset no round-trip, e eles são usados de verdade na UI
(`wizard-stepper.tsx`, `language-selector.tsx`, `language-panel.tsx`).

Ficam como **colunas**, não dentro de `customization`: `customization`
também vira `submissions.language_snapshot` e vai no payload do
`/api/lexer`, onde campos de apresentação não têm o que fazer.

`LanguageSummary` expõe **apenas `imageUrl`** dos três — o suficiente para
a grid de `/languages` renderizar sem buscar o detalhe de cada linguagem.
`LanguageCreate`, `LanguageUpdate` e `LanguageResponse` expõem os três.
`clone_language` copia os três junto.

### Alterações em tabelas existentes

`users`:
```
+ active_language_id  INT NULL FK → languages(id) ON DELETE SET NULL
```

`exercises`:
```
+ language_policy      ENUM('OPEN','LOCKED') NOT NULL DEFAULT 'OPEN'
+ locked_language_id   INT NULL FK → languages(id) ON DELETE RESTRICT
CHECK: (language_policy = 'LOCKED') = (locked_language_id IS NOT NULL)
```

`submissions`:
```
+ language_snapshot   JSONB NOT NULL
```

### Usuário-sistema

- Estender enum `userrole`: `ADMIN | TEACHER | STUDENT | SYSTEM`.
- Migration cria a organização `"System"` e um usuário com
  `role = SYSTEM, email = system@internal` (senha placeholder; login
  desabilitado a nível de API).
- Exercícios e linguagens oficiais usam esse usuário como dono. A
  "oficialidade" é derivada de `users.role = SYSTEM`.

### Integridade

- Deletar usuário cascateia suas linguagens. `exercises.locked_language_id`
  é `RESTRICT`, então a deleção falha se alguma linguagem estiver em uso —
  a API valida e retorna 409 com mensagem clara antes de tentar.
- Deletar linguagem original: descendentes em `cloned_from_id` viram `NULL`.
- `submissions.language_snapshot` é independente de qualquer FK — sobrevive a
  qualquer deleção.

## API

> **Correção 2026-08-04.** O spec original previa proxies Next.js em
> `packages/ide/src/pages/api/languages/*`. A implementação não os criou:
> o front chama a FastAPI diretamente pelo cliente `lib/api`
> (`lib/languages-api.ts`). O diretório `pages/api/languages/` não existe e
> não deve ser criado. As rotas abaixo são as da FastAPI.

### `/languages`

| Método | Rota | Autorização | Descrição |
|---|---|---|---|
| GET | `/languages` | logado | Lista linguagens do `owner_id = me` (`LanguageSummary` + `imageUrl`) |
| GET | `/languages/:id` | dono **ou** read-gate¹ | Detalhe + `customization` + identidade |
| POST | `/languages` | logado | `{ name, description?, customization, imageUrl?, imageQuery?, presetId? }` |
| PATCH | `/languages/:id` | dono | Atualiza qualquer subconjunto dos campos acima |
| DELETE | `/languages/:id` | dono | 409 se em uso por `exercises.locked_language_id` |
| POST | `/languages/:id/clone` | read-gate¹ | Cria cópia com `owner_id = me`, `cloned_from_id = :id`, identidade copiada |

**409 em `POST` / `PATCH`:** `UNIQUE (owner_id, name)` faz "Salvar como
nova" com nome repetido devolver 409. O wizard precisa traduzir isso em
"Você já tem uma linguagem com esse nome", não num erro genérico.

¹ **Read-gate**: pode ler/clonar uma linguagem `X` se for o dono, **ou**
existe um exercício acessível para o usuário com `locked_language_id = X`
(turma da qual é membro, ou exercício oficial), **ou** o dono de `X` é o
usuário-sistema.

### Linguagem ativa

| Método | Rota | Descrição |
|---|---|---|
| GET | `/users/me/active-language` | Linguagem ativa do usuário ou `null` |
| PUT | `/users/me/active-language` | `{ languageId }` — deve pertencer ao usuário |

### Exercícios (extensão)

- `POST /api/exercises` e `PATCH /api/exercises/:id` aceitam
  `language_policy` e `locked_language_id`.
- Validações:
  - Se `LOCKED`, `locked_language_id` é obrigatório.
  - `teacher_id` precisa ser dono da linguagem **ou** a linguagem ser do
    usuário-sistema.
- `GET /api/exercises/:id` retorna `locked_language` expandida inline
  (incluindo `customization`) quando `policy = LOCKED`.

### Submissões (extensão)

- `POST /api/submissions` aceita `language_snapshot` no body (obrigatório).
- `POST /api/submissions/validate`:
  - Se o exercício é `LOCKED`, o servidor **sobrescreve** o snapshot do
    client com `locked_language.customization` antes de executar e gravar.
  - Se `OPEN`, usa o snapshot enviado pelo client.
- A regra acima vale para o gravamento da submissão também — o aluno não
  consegue burlar a linguagem travada.

### Endpoints inalterados

`/api/lexer` e `/api/intermediator` seguem recebendo `customization` inline.
Eles continuam stateless no Next.js e não conhecem o backend principal.

## Front-end

### `KeywordContext`

- **Sem login:** comportamento atual preservado (`localStorage`).
- **Logado:** ao montar, chama `GET /users/me/active-language`:
  - Se há linguagem ativa → hidrata `customization` e guarda
    `activeLanguageId` no estado.
  - Se não → defaults.
- Edições continuam no `localStorage` como rascunho (mesma chave atual)
  para não perder mudanças entre páginas. Persistência no backend só
  acontece via ação explícita ("Salvar linguagem") — sem PUT por keystroke.

### Entrada no `Sidebar` (2026-08-04)

`packages/ide/src/components/sidebar.tsx` ganha o **mesmo** item nos dois
menus — `studentMenu` e `teacherMenu`:

```ts
{ id: "linguagens",
  label: "Minhas Linguagens",
  icon: <Languages className="w-5 h-5" />,
  href: "/languages",
  activeMatchers: ["/languages", "/language-creator"] }
```

`activeMatchers` inclui `/language-creator` para o item seguir destacado
durante a edição, já que o wizard é uma rota irmã e não filha.

### Página `/languages` (2026-08-04)

Substitui o `LanguageLibraryModal`, que é removido. `pages/languages/index.tsx`
com `requireAuth = true`, no mesmo shell do dashboard (`SpaceBackground` +
`Navbar` + `Sidebar`); componentes em `views/languages/`.

- Grid de cards: imagem (`imageUrl`, com fallback
  `/images/language-default.png`), nome, descrição, ★ quando é a ativa,
  badge `(clone)` quando `clonedFromId !== null`.
- Ações por card: **✎ Editar** → `/language-creator?id=N` · **★ Tornar
  ativa** · **⧉ Duplicar** · **🗑 Excluir**.
- Header: `[+ Nova Linguagem]` → `/language-creator` sem id.
- Estado vazio com CTA para criar a primeira.

Não introduz hook novo: `useLanguagesList`, `useSetActiveLanguage`,
`useCloneLanguage` e `useDeleteLanguage` já existem e já invalidam
`queryKeys.languages.all` / `.active`.

### Wizard como criador **e** editor (2026-08-04)

`pages/language-creator.tsx` lê `router.query.id`. Havendo id e sessão,
carrega por `useLanguageDetail(id)` e semeia o wizard com os cinco campos
de identidade mais a `customization`. A página continua **sem**
`requireAuth` — deslogado ainda pode usar o wizard.

O save de `keyword-customizer-context.tsx` (hoje uma chamada fixa a
`saveSavedKeywordLanguage`) passa a ramificar:

| Situação | Ação | Rótulo do botão |
|---|---|---|
| logado, com `?id=N` | `useUpdateLanguage(N, …)` | "Salvar alterações" |
| logado, sem id | `useCreateLanguage(…)` | "Salvar como nova" |
| deslogado | `saveSavedKeywordLanguage()` | inalterado |

Nos dois casos logados o save também chama `setCustomization()` (aplica no
IDE) e segue gravando o rascunho local; ao concluir, redireciona para
`/languages`. O header do wizard passa a mostrar o nome da linguagem em
edição.

**Onde mora esse código:** `keyword-customizer-context.tsx` já tem ~22 KB.
A ramificação acima vai para um hook próprio, `useLanguagePersistence`, em
vez de engordar o arquivo. O contexto só o consome.

### Seletor de linguagem do IDE (2026-08-04)

`views/ide/components/language-selector.tsx` e
`views/ide/components/side-explorer/language-panel.tsx` hoje listam
exclusivamente do localStorage (`listSavedKeywordLanguages`), enquanto o
`KeywordContext` hidrata do backend. Enquanto o wizard só gravava local a
divergência era invisível; assim que ele gravar no backend, as duas listas
se contradizem na cara do usuário.

Ambos passam a usar `useLanguagesList()` / `useSetActiveLanguage()` quando
`isAuthenticated`, caindo para o caminho localStorage atual quando não há
sessão — a mesma regra que o `KeywordContext` já segue. A imagem sai de
`imageUrl`.

### Workspace de exercício

- `policy = LOCKED`:
  - IDE pré-carrega `exercise.locked_language.customization`.
  - Banner: "Você está usando a linguagem **X** definida pelo professor."
  - Seletor de linguagem desabilitado.
  - Botão **"Clonar para meu acervo"** → `POST /languages/:id/clone`.
- `policy = OPEN`:
  - Usa `active_language` do aluno (ou defaults).
  - Seletor de linguagem visível.

### Form de criação/edição de exercício (professor)

- Toggle `Aberto / Travado em uma linguagem`.
- Se travado: select com linguagens do professor + linguagens do
  usuário-sistema.

### Submissão

O hook de submit envia `customization` atual em `language_snapshot`. Para
exercícios `LOCKED`, o backend ignora e usa o snapshot da linguagem travada.

## Fluxos chave

### A — Aluno ou professor cria sua linguagem (revisto 2026-08-04)

`/dashboard` → `Sidebar` → **Minhas Linguagens** → `/languages` →
`[+ Nova Linguagem]` → `/language-creator` → customiza no wizard →
"Salvar como nova" → `POST /languages` → volta para `/languages` →
opcional **★ Tornar ativa** → `PUT /users/me/active-language`.

Idêntico para aluno e professor: mesmo item de menu, mesma página, mesmo
wizard. O papel só muda o resto do `Sidebar`.

### A' — Editar uma linguagem existente (2026-08-04)

`/languages` → **✎** no card → `/language-creator?id=N` → wizard carrega
por `useLanguageDetail(N)` → "Salvar alterações" → `PATCH /languages/N` →
volta para `/languages`.

### A'' — Deslogado (2026-08-04)

`/language-creator` sem sessão continua exatamente como hoje: salva em
localStorage via `saveSavedKeywordLanguage()`, sem chamada de rede. Não há
migração automática do localStorage para o backend ao logar — está fora de
escopo.

### B — Professor cria exercício travado
Form → marca "Travar linguagem" → seleciona uma das suas (ou oficial) →
`POST /api/exercises` com `policy = LOCKED, locked_language_id`. Backend
valida posse.

### C — Aluno abre exercício travado
`GET /api/exercises/:id` retorna `locked_language` expandida → IDE hidrata
`KeywordContext` com ela, ignora `active_language` do aluno → banner +
botão "Clonar para meu acervo".

### D — Aluno abre exercício aberto
`GET /api/exercises/:id` sem `locked_language` → IDE usa `active_language`
do aluno → seletor de linguagem visível.

### E — Submissão
Front envia `language_snapshot = customization atual`. Backend, ao gravar
e ao validar, sobrescreve com `locked_language.customization` se
`policy = LOCKED`. Snapshot é imutável.

### F — Validação automática de testes
`POST /api/submissions/validate` aplica a mesma regra: server-side decide
qual customization usar. Nota = o que o aluno vê no IDE.

### G — Deleção e integridade
- Deletar linguagem em uso por algum exercício de qualquer usuário → 409.
- Deletar usuário com linguagens em uso → 409 com lista das linguagens em
  conflito.
- Submissões antigas permanecem reproduzíveis mesmo se a linguagem
  original for editada ou deletada.

## Arquivos afetados (visão geral)

Marcados com ✅ os itens já entregues na primeira rodada; sem marca, os que
esta revisão adiciona.

### Backend
- ✅ `backend/migrations/versions/b2c3d4e5f6a7_languages_and_policy.py`
- ✅ `backend/migrations/versions/a1b2c3d4e5f6_extend_userrole_with_system.py`
- `backend/migrations/versions/<nova>_language_presentation_fields.py` (criar)
- ✅ `backend/app/models/language.py` — + `image_url`, `image_query`, `preset_id`
- `backend/app/schemas/languages.py` — os três campos nos schemas
- `backend/app/modules/languages/service.py` — propagar em create/update/clone
- ✅ `backend/app/models/user.py` (`active_language_id`, enum `SYSTEM`)
- ✅ `backend/app/models/exercise.py` (`language_policy`, `locked_language_id`)
- ✅ `backend/app/models/submission.py` (`language_snapshot`)
- ✅ `backend/app/models/__init__.py`
- ✅ `backend/app/modules/languages/` (router + service)
- ✅ `backend/app/modules/exercises/` (policy/expand)
- ✅ `backend/app/modules/submissions/` (snapshot + override em validate)
- ✅ `backend/app/modules/users/` (active-language endpoints)
- ✅ `backend/app/main.py` (registrar router)

### Front-end
- ✅ `packages/ide/src/lib/languages-api.ts` + `hooks/useLanguages.ts`
- ✅ `packages/ide/src/components/exercise-workspace/LockedLanguageBanner.tsx`
- ✅ `packages/ide/src/pages/exercises/workspace.tsx` (aplica linguagem travada)
- ✅ `packages/ide/src/views/exercises/components/create-exercise-modal.tsx` (policy)
- `packages/ide/src/components/sidebar.tsx` — item "Minhas Linguagens" nos dois menus
- `packages/ide/src/pages/languages/index.tsx` (criar)
- `packages/ide/src/views/languages/` (grid + card + estado vazio — criar)
- `packages/ide/src/pages/language-creator.tsx` — ler `?id=N`, semear o wizard
- `packages/ide/src/hooks/useLanguagePersistence.ts` (criar) — a ramificação do save
- `packages/ide/src/components/keyword-customizer/keyword-customizer-context.tsx`
  — consumir o hook no lugar da chamada fixa a `saveSavedKeywordLanguage`
- `packages/ide/src/components/keyword-customizer/keyword-customizer-header.tsx`
  — nome da linguagem em edição; remover o botão do modal
- `packages/ide/src/components/keyword-customizer/keyword-customizer-footer.tsx`
  — rótulo do botão conforme o modo
- `packages/ide/src/views/ide/components/language-selector.tsx` — backend quando logado
- `packages/ide/src/views/ide/components/side-explorer/language-panel.tsx` — idem
- `packages/ide/src/components/language-library/LanguageLibraryModal.tsx` (remover)
- `packages/ide/src/lib/languages-api.ts` + `types` — os três campos de identidade

**Não criar:** `packages/ide/src/pages/api/languages/*`. Ver a correção na
seção de API.

## Fora de escopo

- Marketplace público de linguagens / busca por linguagens de outros usuários.
- Versionamento de linguagens (histórico de versões nomeadas).
- Whitelist de múltiplas linguagens por exercício.
- Sugestão de "linguagem default" em exercício aberto.
- Login do usuário-sistema (apenas dono lógico de conteúdo oficial).
- **(2026-08-04)** Migração das linguagens já salvas no localStorage para o
  backend no primeiro login. Quem já criou linguagens deslogado continua a
  vê-las apenas no caminho localStorage.
- **(2026-08-04)** Upload de imagem própria para a linguagem — `image_url`
  continua vindo da seleção que o wizard já oferece.

## Testes

### Primeira rodada (existentes)

- Backend: testes de integração para CRUD de `/languages`, clone com
  read-gate, validação de policy em `/exercises`, snapshot e override
  em `/submissions`.
- Front: hidratação do `KeywordContext` logado vs deslogado, comportamento
  do workspace em `LOCKED`/`OPEN`.

### Revisão 2026-08-04

- Backend: `create`, `update` e `clone` preservam `image_url`,
  `image_query` e `preset_id`; `LanguageSummary` traz `imageUrl` e **não**
  traz os outros dois.
- `/languages`: renderiza a grid, o estado vazio, e cada ação dispara a
  mutação certa e invalida o cache.
- `Sidebar`: o item aparece para aluno **e** professor, e fica ativo tanto
  em `/languages` quanto em `/language-creator`.
- Wizard com `?id=N`: carrega a linguagem e o save emite `PATCH`.
- Wizard sem id e logado: o save emite `POST`.
- Wizard deslogado: o save continua indo para localStorage, sem rede.
- Nome duplicado devolve 409 e o wizard mostra a mensagem específica.
- Seletor do IDE: lista do backend quando logado, do localStorage quando não.
- Regressão: `side-menu.spec.tsx` e `keyword-customizer.spec.tsx`, que hoje
  cobrem o caminho localStorage do wizard, precisam seguir verdes.
