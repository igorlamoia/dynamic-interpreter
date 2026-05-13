# Diagrama do Banco de Dados — Dynamic Interpreter

```mermaid
erDiagram
    organizations ||--o{ users : "possui"
    organizations ||--o{ classes : "possui"

    users ||--o{ exercises : "cria (teacher)"
    users ||--o{ exercise_lists : "cria (teacher)"
    users ||--o{ classes : "leciona (teacher)"
    users ||--o{ class_members : "participa (student)"
    users ||--o{ submissions : "envia (student)"

    exercises ||--o{ test_cases : "contém"
    exercises ||--o{ exercise_list_items : "compõe"
    exercises ||--o{ submissions : "recebe"

    exercise_lists ||--o{ exercise_list_items : "agrupa"
    exercise_lists ||--o{ class_exercise_lists : "publicada em"
    exercise_lists ||--o{ submissions : "referenciada"

    classes ||--o{ class_members : "tem membros"
    classes ||--o{ class_exercise_lists : "recebe listas"
    classes ||--o{ submissions : "contexto"

    organizations {
        serial id PK
        varchar name
        timestamp created_at
    }

    users {
        serial id PK
        integer organization_id FK
        userrole role
        varchar email UK
        varchar password
        varchar name
        varchar avatar_url
        varchar bio
    }

    exercises {
        serial id PK
        integer teacher_id FK
        varchar title
        varchar description
        varchar attachments
        timestamp created_at
        timestamp updated_at
    }

    test_cases {
        serial id PK
        integer exercise_id FK
        varchar label
        varchar input
        varchar expected_output
        integer order_index
    }

    exercise_lists {
        serial id PK
        integer teacher_id FK
        varchar title
        varchar description
        timestamp created_at
        timestamp updated_at
    }

    exercise_list_items {
        integer exercise_list_id PK,FK
        integer exercise_id PK,FK
        double grade_weight
        integer order_index
    }

    classes {
        serial id PK
        integer organization_id FK
        integer teacher_id FK
        varchar name
        varchar description
        varchar access_code UK
        timestamp created_at
        classstatus status
    }

    class_members {
        integer class_id PK,FK
        integer student_id PK,FK
        timestamp joined_at
    }

    class_exercise_lists {
        integer exercise_list_id PK,FK
        integer class_id PK,FK
        timestamp deadline
        double total_grade
        integer min_required
        timestamp published_at
        timestamp updated_at
    }

    submissions {
        serial id PK
        integer exercise_id FK
        integer exercise_list_id FK
        integer class_id FK
        integer student_id FK
        varchar code_snapshot
        submissionstatus status
        double score
        varchar teacher_feedback
        timestamp submitted_at
    }
```

## Legenda dos Relacionamentos

| Origem | Destino | Cardinalidade | Significado |
|--------|---------|---------------|-------------|
| organizations | users | 1:N | Uma organização possui vários usuários |
| organizations | classes | 1:N | Uma organização possui várias turmas |
| users (teacher) | exercises | 1:N | Um professor cria vários exercícios |
| users (teacher) | exercise_lists | 1:N | Um professor cria várias listas |
| users (teacher) | classes | 1:N | Um professor leciona várias turmas |
| users (student) | class_members | 1:N | Um aluno pode estar em várias turmas |
| users (student) | submissions | 1:N | Um aluno envia várias submissões |
| exercises | test_cases | 1:N | Um exercício possui vários casos de teste |
| exercises | exercise_list_items | 1:N | Um exercício pode estar em várias listas |
| exercise_lists | exercise_list_items | 1:N | Uma lista agrupa vários exercícios |
| exercise_lists | class_exercise_lists | 1:N | Uma lista é publicada em várias turmas |
| classes | class_members | 1:N | Uma turma tem vários alunos |
| classes | class_exercise_lists | 1:N | Uma turma recebe várias listas |

## Tabelas de Associação (N:N)

- **`exercise_list_items`**: relaciona `exercise_lists` ↔ `exercises` (com peso da nota e ordem)
- **`class_members`**: relaciona `classes` ↔ `users` (alunos matriculados)
- **`class_exercise_lists`**: relaciona `classes` ↔ `exercise_lists` (com prazo e nota total)

## Enums

- **`userrole`**: papel do usuário (student, teacher, admin)
- **`submissionstatus`**: status da submissão (pending, correct, incorrect, partial)
- **`classstatus`**: status da turma (active, archived)
