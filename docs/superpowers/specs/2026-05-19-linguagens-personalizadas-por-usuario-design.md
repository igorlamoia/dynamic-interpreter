# Linguagens Personalizadas por Usuário — Design

**Data:** 2026-05-19
**Branch sugerida:** `feat/user-languages`

## Contexto

Hoje a personalização da linguagem Java-- vive inteiramente no front-end:
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

Padrão: rotas Next.js em `packages/ide/src/pages/api/` chamam o backend
FastAPI/SQLAlchemy em `backend/app/modules/`.

### `/api/languages`

| Método | Rota | Autorização | Descrição |
|---|---|---|---|
| GET | `/api/languages` | logado | Lista linguagens do `owner_id = me` |
| GET | `/api/languages/:id` | dono **ou** read-gate¹ | Detalhe + `customization` |
| POST | `/api/languages` | logado | `{ name, description?, customization }` |
| PATCH | `/api/languages/:id` | dono | Atualiza name/description/customization |
| DELETE | `/api/languages/:id` | dono | 409 se em uso por `exercises.locked_language_id` |
| POST | `/api/languages/:id/clone` | read-gate¹ | Cria cópia com `owner_id = me`, `cloned_from_id = :id` |

¹ **Read-gate**: pode ler/clonar uma linguagem `X` se for o dono, **ou**
existe um exercício acessível para o usuário com `locked_language_id = X`
(turma da qual é membro, ou exercício oficial), **ou** o dono de `X` é o
usuário-sistema.

### Linguagem ativa

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/users/me/active-language` | Linguagem ativa do usuário ou `null` |
| PUT | `/api/users/me/active-language` | `{ language_id }` — deve pertencer ao usuário |

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
- **Logado:** ao montar, chama `GET /api/users/me/active-language`:
  - Se há linguagem ativa → hidrata `customization` e guarda
    `activeLanguageId` no estado.
  - Se não → defaults.
- Edições continuam no `localStorage` como rascunho (mesma chave atual)
  para não perder mudanças entre páginas. Persistência no backend só
  acontece via ação explícita ("Salvar linguagem") — sem PUT por keystroke.

### Modal "Minhas Linguagens"

- Acessível pelo menu do usuário e pelo customizador de keywords.
- Lista (`GET /api/languages`), ações: criar, renomear, editar (abre o
  customizador existente), duplicar, deletar, marcar como ativa.
- Indicador visual da linguagem ativa.
- Decidido: **modal**, não página dedicada.

### Customizador de keywords (existente)

- Header com nome da linguagem em edição.
- Botões "Salvar alterações" / "Salvar como nova".

### Workspace de exercício

- `policy = LOCKED`:
  - IDE pré-carrega `exercise.locked_language.customization`.
  - Banner: "Você está usando a linguagem **X** definida pelo professor."
  - Seletor de linguagem desabilitado.
  - Botão **"Clonar para meu acervo"** → `POST /api/languages/:id/clone`.
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

### A — Aluno cria sua linguagem
Modal "Minhas Linguagens" → Nova → customiza no editor → "Salvar" →
`POST /api/languages` → opcional "Tornar ativa" → `PUT /me/active-language`.

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

### Backend
- `backend/migrations/versions/<nova>_languages_and_policy.py` (criar)
- `backend/app/models/language.py` (criar)
- `backend/app/models/user.py` (`active_language_id`, enum `SYSTEM`)
- `backend/app/models/exercise.py` (`language_policy`, `locked_language_id`)
- `backend/app/models/submission.py` (`language_snapshot`)
- `backend/app/models/__init__.py`
- `backend/app/modules/languages/` (router + service + schemas — criar)
- `backend/app/modules/exercises/` (policy/expand)
- `backend/app/modules/submissions/` (snapshot + override em validate)
- `backend/app/modules/users/` (active-language endpoints)
- `backend/app/main.py` (registrar router)

### Front-end
- `packages/ide/src/contexts/keyword/KeywordContext.tsx`
- `packages/ide/src/lib/keyword-language-storage.ts` (adapter
  backend/localStorage)
- `packages/ide/src/components/language-library/` (modal — criar)
- `packages/ide/src/views/exercise-workspace/` (banner LOCKED + lock UI)
- Form de criação/edição de exercício (campos de policy)
- `packages/ide/src/pages/api/languages/*` (proxies — criar)
- `packages/ide/src/pages/api/exercises/*` (body novo)
- `packages/ide/src/pages/api/submissions/*` (body novo)

## Fora de escopo

- Marketplace público de linguagens / busca por linguagens de outros usuários.
- Versionamento de linguagens (histórico de versões nomeadas).
- Whitelist de múltiplas linguagens por exercício.
- Sugestão de "linguagem default" em exercício aberto.
- Login do usuário-sistema (apenas dono lógico de conteúdo oficial).

## Testes

- Backend: testes de integração para CRUD de `/api/languages`, clone com
  read-gate, validação de policy em `/api/exercises`, snapshot e override
  em `/api/submissions`.
- Front: testes para hidratação do `KeywordContext` logado vs deslogado,
  modal de gerenciamento, comportamento do workspace em `LOCKED`/`OPEN`.
