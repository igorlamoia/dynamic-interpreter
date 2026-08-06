# Linguagem por Lista de Exercícios — Design

**Data:** 2026-08-06
**Spec anterior:** [`2026-05-19-linguagens-personalizadas-por-usuario-design.md`](2026-05-19-linguagens-personalizadas-por-usuario-design.md)

## Objetivo

Permitir que o professor vincule uma linguagem sua a uma **lista de
exercícios** inteira, e não apenas a exercícios isolados, mantendo o caminho
"livre" em que o aluno resolve com a própria linguagem.

## O que já existe

O nível do exercício está entregue ponta a ponta e **não muda** neste design:

| Peça | Onde |
|---|---|
| `language_policy` (`OPEN`/`LOCKED`) + `locked_language_id` + check constraint | `backend/app/models/exercise.py:16-41` |
| Validação de dono da linguagem | `backend/app/modules/exercises/service.py:14-42` |
| Snapshot da linguagem travada na submissão | `backend/app/modules/submissions/service.py:26-30` |
| Read-gate: aluno lê a linguagem do professor travada num exercício da turma dele | `backend/app/modules/languages/service.py:15-42` |
| Guard 409 no delete de linguagem em uso | `backend/app/modules/languages/service.py:108-117` |
| Seletor de política no form de exercício | `packages/ide/src/views/exercises/components/create-exercise-modal.tsx:177-240` |
| Aplicação da customização travada + banner no workspace | `packages/ide/src/pages/exercises/workspace.tsx:140-150, 315-325` |

`OPEN` já significa exatamente "livre, o aluno usa a linguagem ativa dele".

## O que falta

`exercise_lists` e `class_exercise_lists` não têm nenhuma coluna de
linguagem. Não há como o professor dizer "esta lista inteira é em
Portugolzinho" sem editar exercício por exercício — e, se o exercício for
reaproveitado em outra lista, editar quebra a outra.

## Decisões

| Tema | Decisão | Alternativa recusada |
|---|---|---|
| Nível | Política na **lista** (`exercise_lists`), valendo para toda turma que receber a lista | Política na publicação (`class_exercise_lists`), que permitiria linguagem diferente por turma — complexidade sem demanda |
| Precedência | **Exercício vence.** A lista trava só os itens `OPEN` | Lista sobrescrever o exercício (quebraria silenciosamente exercício que depende da sintaxe da linguagem dele); proibir o conflito com 409 (obrigaria destravar exercício reusado em outras listas) |
| Resolução | **Backend resolve** e devolve pronto | Front resolver — duplicaria a regra, já que o snapshot da submissão não pode confiar no cliente |
| UI | Campo na criação da lista **e** painel de edição na tela de detalhe | Só na criação (lista nasce vazia; o professor escolhe antes de saber os itens e não corrige depois) |
| Lista publicada | Pode ter a linguagem alterada **sempre** | Travar após publicar ou após a primeira submissão — `language_snapshot` já protege o que foi entregue |

### Matriz de precedência

| Lista | Exercício | Linguagem efetiva | `effectiveLanguageSource` |
|---|---|---|---|
| `LOCKED(X)` | `LOCKED(Y)` | Y | `"exercise"` |
| `LOCKED(X)` | `OPEN` | X | `"list"` |
| `OPEN` | `LOCKED(Y)` | Y | `"exercise"` |
| `OPEN` | `OPEN` | nenhuma — o aluno usa a dele | `null` |

## Arquitetura

### 1. Modelo de dados

```
exercise_lists
  + language_policy      Enum(OPEN|LOCKED) NOT NULL DEFAULT 'OPEN' SERVER_DEFAULT 'OPEN'
  + locked_language_id   FK languages(id) ON DELETE RESTRICT, NULL
  + CHECK ck_exercise_lists_locked_language_consistency:
        (language_policy = 'LOCKED') = (locked_language_id IS NOT NULL)
```

Espelha `exercises` de propósito: mesma constraint, mesmo `ON DELETE
RESTRICT`, mesmo default. Listas pré-existentes ficam `OPEN` pelo
`server_default`.

`LanguagePolicy` sai de `models/exercise.py` para `models/language.py` e é
re-exportado de `models/exercise.py` para não quebrar os imports atuais.
Assim `exercise_list.py` não precisa importar `exercise.py` em runtime.
O nome do tipo enum no Postgres é derivado do nome da classe
(`languagepolicy`) e **não muda** com a mudança de módulo — por isso a
migration reusa o tipo existente com `postgresql.ENUM(..., create_type=False)`
em vez de tentar criá-lo de novo. Os testes rodam em SQLite, onde o enum vira
`VARCHAR` e a questão não aparece: isso precisa ser verificado contra o
Postgres de dev com `alembic upgrade head`.

### 2. `backend/app/modules/languages/policy.py` (novo)

Um módulo com as duas funções que todo mundo passa a chamar, para a regra
não existir em cópias.

```python
async def validate_language_policy(
    teacher_id: int,
    policy: LanguagePolicy,
    locked_language_id: int | None,
    session: AsyncSession,
) -> None
```

Extraída de `exercises/service.py:_validate_language_policy` **sem mudança de
comportamento**: 400 se `LOCKED` sem id, 400 se `OPEN` com id, 400 se a
linguagem não existe, 403 se ela não é do professor nem do usuário `SYSTEM`.
`exercises/service.py` passa a importar daqui.

```python
def resolve_effective_language(
    exercise: Exercise,
    exercise_list: ExerciseList | None,
) -> tuple[Language | None, Literal["exercise", "list"] | None]
```

Função pura, síncrona, sem I/O — as duas entidades chegam com
`locked_language` já carregada por `selectinload`. Implementa a matriz acima.

Consumidores: o endpoint do exercício, o snapshot da submissão e o
read-gate.

### 3. API

**`PATCH /exercise-lists/{list_id}`** — endpoint novo; hoje o router só tem
create, get, add/remove exercício e publish.

- Body `ExerciseListUpdate`: `title?`, `description?`, `languagePolicy?`,
  `lockedLanguageId?`.
- Só o professor dono; 404 caso contrário (mesma semântica do resto do
  módulo, que não distingue "não existe" de "não é seu").
- Merge parcial no padrão de `update_exercise`: o valor ausente cai no atual
  antes de validar, então `PATCH {title}` não zera a política.
- Sem trava por publicação ou por submissão existente.

**`ExerciseListResponse`** ganha `languagePolicy`, `lockedLanguageId` e
`lockedLanguage: LanguageResponse | None`.

**`GET /exercises/{id}?list_id=N`** ganha `effectiveLanguage:
LanguageResponse | None` e `effectiveLanguageSource: "exercise" | "list" |
null`.

- Sem `list_id`, resolve só pelo exercício.
- Com `list_id` de lista inexistente, ou de lista que não contém o exercício
  → **400**. Resolver em silêncio com o contexto errado entregaria ao aluno
  uma linguagem que ninguém pediu; o front sempre tem o par correto vindo da
  rota, então o 400 só aparece com dado inconsistente.

`lockedLanguage` e `effectiveLanguage` continuam sujeitos ao read-gate para
serem *lidos* isoladamente via `GET /languages/{id}`; embutidos na resposta
do exercício/lista eles já vêm com o contexto que autoriza.

### 4. Read-gate

`_user_can_read_language` hoje concede leitura por um único caminho:

```
Exercise.locked_language_id → ExerciseListItem → ClassExerciseList → ClassMember
```

Ganha o caminho paralelo, em `UNION`:

```
ExerciseList.locked_language_id → ClassExerciseList → ClassMember
```

Sem isso, uma lista travada cujos exercícios são todos `OPEN` faria o aluno
levar 403 ao abrir o workspace — o caso mais comum do recurso.

### 5. Delete guard

`delete_language` passa a checar também `ExerciseList.locked_language_id`. A
mensagem do 409 cita lista ou exercício conforme o caso, para o professor
saber onde ir destravar.

### 6. Snapshot da submissão

`create_submission` já recebe `exercise_list_id` em `SubmissionCreate`. Passa
a carregar a lista com `selectinload(ExerciseList.locked_language)` e a
substituir o `if exercise.language_policy == LOCKED` de hoje por
`resolve_effective_language`. Submissões antigas não mudam: o
`language_snapshot` gravado é imutável.

### 7. Front

**`components/language-policy-field.tsx` (novo).** O par rádio `OPEN`/`LOCKED`
+ `<select>` de linguagem hoje vive inline em `create-exercise-modal.tsx`
(9,3 KB). Sai para um componente controlado (`value`, `onChange`,
`languages`) antes de ser usado em mais dois lugares — senão viram três
cópias divergentes. O modal de exercício passa a consumi-lo sem mudança de
comportamento.

**Tipos e queries.** `types/api.ts`: `ExerciseList` ganha `languagePolicy`,
`lockedLanguageId`, `lockedLanguage`; `Exercise` ganha `effectiveLanguage` e
`effectiveLanguageSource`. `use-api-queries.ts`: `useExerciseQuery` aceita
`listId` e o repassa como `list_id`; `useUpdateExerciseListMutation` nova,
invalidando o cache da lista.

**Professor.** `CreateListModal` ganha o campo. `teacher-detail-view.tsx`
ganha um `ListLanguagePanel` com:

- a linguagem atual (ou o estado "aluno usa a própria linguagem");
- botão de alterar, que dispara o `PATCH`;
- a contagem de itens com trava própria, com o aviso de que eles **não**
  herdam — é a consequência da precedência escolhida, e o professor precisa
  vê-la onde toma a decisão;
- o aviso de que a lista está publicada em N turmas, já que a alteração passa
  a valer para quem ainda não entregou.

**Aluno.** `workspace.tsx` troca `exercise.lockedLanguage` por
`exercise.effectiveLanguage` nos dois pontos: o `useEffect` que sobrepõe a
customização no `KeywordContext` e a renderização do `LockedLanguageBanner`.
O banner distingue "travada por este exercício" de "travada pela lista *X*" e
mantém o "Clonar para meu acervo" que já existe. Sem trava nenhuma, nada
muda — o aluno segue na linguagem ativa dele.

## Fluxo de dados

```
professor: PATCH /exercise-lists/7 { languagePolicy: LOCKED, lockedLanguageId: 3 }
             └→ validate_language_policy  (dono? existe? consistente?)

aluno abre:  GET /exercises/12?list_id=7
             └→ resolve_effective_language(ex12, list7)
                  → (Language(3), "list")   # ex12 é OPEN
             └→ workspace aplica customization no KeywordContext + banner

aluno envia: POST /api/submissions/validate  (rota Next)
             └→ POST {BACKEND}/submissions { exerciseId: 12, exerciseListId: 7, ... }
                  └→ resolve_effective_language(ex12, list7)   # mesma função
                       → language_snapshot = Language(3).customization
```

O `languageSnapshot` que a rota Next monta a partir do `keywordMap` do cliente
continua sendo **sobrescrito** no servidor quando há linguagem efetiva — é o
que impede o aluno de burlar a trava, e vale agora também para a trava vinda
da lista.

## Erros

| Situação | Resposta |
|---|---|
| `PATCH` com `LOCKED` sem `lockedLanguageId` | 400 |
| `PATCH` com `OPEN` e `lockedLanguageId` preenchido | 400 |
| `PATCH` com linguagem de outro usuário (não-`SYSTEM`) | 403 |
| `PATCH` por quem não é o professor dono | 404 |
| `GET /exercises/{id}?list_id=N` com lista inexistente ou sem esse item | 400 |
| `DELETE /languages/{id}` travada por lista | 409, mensagem citando a lista |
| Aluno lendo linguagem travada em lista de turma que não é dele | 403 |

## Testes

**Backend — `tests/test_exercise_list_policy.py` (novo):**

- as 4 combinações da matriz de precedência;
- `PATCH`: dono, não-dono, `LOCKED` sem id, `OPEN` com id, linguagem alheia,
  merge parcial preservando a política;
- `PATCH` em lista publicada e com submissão existente → 200;
- read-gate concedido pela lista com exercício `OPEN`; negado para aluno sem
  vínculo com a turma;
- `DELETE` de linguagem travada por lista → 409;
- snapshot vindo da lista (exercício `OPEN`) e do exercício (`LOCKED` em
  ambos);
- `list_id` inconsistente → 400.

`tests/test_exercise_policy_and_snapshot.py` e `tests/test_languages.py`
precisam seguir verdes sem edição — se algum quebrar, a extração para
`policy.py` mudou comportamento e é bug, não ajuste de teste.

**Front:** specs de `ListLanguagePanel` e do `LockedLanguageBanner` com as
duas origens. Padrão do repo: docblock `// @vitest-environment jsdom`,
`createRoot` + `act`, query por `container.querySelector`, mock de
`lucide-react` enumerando **todos** os ícones importados. Os arquivos ficam
sob `src/views/**` porque o `include` de `vitest.integration.config.ts` é
explícito e cobre `views/**` e `hooks/**`, mas não `components/**`.

## Fora de escopo

- Política por publicação (`class_exercise_lists`), isto é, linguagem
  diferente da mesma lista por turma.
- Despublicar lista.
- Professor travar numa linguagem de outro professor (segue barrado por 403,
  como já é no exercício; o caminho é clonar para o próprio acervo).
- Migrar exercícios travados em massa quando a lista é travada.
