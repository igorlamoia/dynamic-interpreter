# Backend — TS Compilator API

Serviço FastAPI independente que substitui as API Routes do Next.js. Fornece autenticação, gerenciamento de turmas, exercícios e submissões para o IDE de Java--.

## Windows: backend no Docker, frontend no computador

No PowerShell, dentro de `backend`, com o Docker Desktop iniciado em modo Linux containers:

```powershell
docker compose -f ../docker-compose.local.yml up -d --build --wait backend
```

Esse comando inicia somente a API e sua dependência PostgreSQL. Não precisa instalar
Python, uv ou PostgreSQL no Windows, nem copiar/editar `backend/.env`: o Compose local
já define as variáveis. A API usa `database:5432` dentro da rede Docker. O Compose
aguarda o PostgreSQL ficar saudável; o entrypoint aplica migrations e executa o seed
antes de iniciar a API. As credenciais do Compose são apenas para desenvolvimento local.

- API: http://localhost:8000
- Swagger: http://localhost:8000/docs
- Frontend: http://localhost:3001
- PostgreSQL, para um cliente no Windows: `localhost:5434`, banco/usuário
  `tscompilator_local`, senha `local_only_password`.

Em outro PowerShell, na raiz do repositório (um nível acima de `backend`):

```powershell
npm.cmd install
$env:NEXT_PUBLIC_API_URL = "http://localhost:8000"
npm.cmd run dev --workspace=packages/ide
```

Defina essa variável em cada terminal antes de iniciar o frontend. Ela tem precedência
sobre a URL hospedada em `packages/ide/.env`. Para persistir a configuração, defina
`NEXT_PUBLIC_API_URL=http://localhost:8000` em `packages/ide/.env.local`.
Reinicie o frontend depois de alterar a URL. Use `localhost:3001` para corresponder ao CORS.

Contas de demonstração: `professor@gmail.com` / `professor` e
`aluno@gmail.com` / `aluno`. O seed é executado em cada inicialização e redefine
as contas de demonstração e as linguagens oficiais.

Comandos úteis, dentro de `backend`:

```powershell
# Estado e logs
docker compose -f ../docker-compose.local.yml ps
docker compose -f ../docker-compose.local.yml logs --tail=100 -f backend

# Verificar API
Invoke-RestMethod http://localhost:8000/health

# Reconstruir após alterações no código Python (não há hot reload)
docker compose -f ../docker-compose.local.yml up -d --build --wait backend

# Parar mantendo os dados
docker compose -f ../docker-compose.local.yml stop backend database

# Remover containers/rede mantendo o volume do banco
docker compose -f ../docker-compose.local.yml down
```

Os dados ficam no volume `ts-compilator-local-postgres-data`. Não use `down -v`
a menos que queira apagar o banco local. O primeiro build pode levar alguns minutos.
Se a porta 8000 estiver ocupada, execute `$env:LOCAL_BACKEND_PORT = "8001"` antes
do comando Compose e use `http://localhost:8001` no frontend e nas verificações.
Para conflito na porta do banco, use `$env:LOCAL_DB_PORT = "5435"`; a conexão
entre API e banco continua usando `database:5432`.

Os passos de instalação manual abaixo são uma alternativa ao Docker.


## Stack

| Tecnologia                     | Uso                         |
| ------------------------------ | --------------------------- |
| Python 3.12+                   | Linguagem                   |
| FastAPI                        | Framework web (async-first) |
| SQLAlchemy 2.0 async + asyncpg | ORM + driver PostgreSQL     |
| Pydantic V2                    | Validação de schemas        |
| Alembic                        | Migrações de banco          |
| PyJWT + Passlib/BCrypt         | Autenticação JWT e hashing  |
| pydantic-settings              | Configuração via `.env`     |
| uv                             | Gerenciador de pacotes      |
| pytest + pytest-asyncio        | Testes com SQLite in-memory |

## Pré-requisitos

- Python 3.12+
- [uv](https://docs.astral.sh/uv/getting-started/installation/)
- PostgreSQL rodando (para desenvolvimento/produção)

## Início Rápido

### 1. Instalar dependências

```bash
cd backend
uv sync
```

Para incluir dependências de desenvolvimento (testes):

```bash
uv sync --dev
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` e preencha obrigatoriamente:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/tscompilator
DATABASE_SCHEMA=dinamic_interpreter
SECRET_KEY=  # gere com: openssl rand -hex 32
```

### 3. Ativar ambiente virtual

```bash
source .venv/bin/activate
```

> **SECRET_KEY é obrigatória.** O servidor não sobe sem ela.

### 3. Criar o banco de dados

```bash
# Aplicar migrações (quando disponíveis)
task migrate
```

> Durante o desenvolvimento inicial, você pode usar `RUN_CREATE_ALL=true` no `.env` para criar as tabelas automaticamente sem Alembic. **Nunca use isso em produção.**

### 4. Iniciar o servidor

```bash
task dev
```

A API estará disponível em `http://localhost:8000`.

Documentação interativa (Swagger): `http://localhost:8000/docs`

## Testes

Os testes usam **SQLite in-memory** — não precisam de PostgreSQL rodando.

```bash
# Rodar todos os testes
task test

# Com cobertura
task cov

# Rodar um arquivo específico
uv run pytest tests/test_auth.py -v
```

**Suite atual: 34 testes, 0 falhas.**

## Estrutura de Pastas

```
backend/
├── app/
│   ├── main.py                  # Ponto de entrada, lifespan, CORS
│   ├── core/
│   │   ├── config.py            # Settings via pydantic-settings
│   │   ├── security.py          # JWT (PyJWT) e hashing (BCrypt)
│   │   └── dependencies.py      # SessionDep, CurrentUserIdDep
│   ├── db/
│   │   ├── session.py           # AsyncSession + engine
│   │   └── base.py              # DeclarativeBase
│   ├── models/                  # Modelos SQLAlchemy (tabelas)
│   ├── schemas/                 # Schemas Pydantic V2 (request/response)
│   └── modules/
│       ├── auth/                # POST /auth/register, /login, GET /me
│       ├── users/               # GET/PATCH /users
│       ├── classes/             # CRUD /classes + join
│       ├── exercises/           # CRUD /exercises + test cases
│       └── submissions/         # CRUD /submissions + grade
├── migrations/                  # Migrações Alembic
├── scripts/                     # ETL e utilitários
├── tests/
│   ├── conftest.py              # Fixtures async (SQLite in-memory)
│   ├── factories.py             # Helpers de criação de dados de teste
│   ├── test_auth.py
│   ├── test_users.py
│   ├── test_classes.py
│   ├── test_exercises.py
│   └── test_submissions.py
├── Dockerfile
├── pyproject.toml
└── .env.example
```

## Endpoints

| Método | Rota                                | Descrição                  | Auth          |
| ------ | ----------------------------------- | -------------------------- | ------------- |
| POST   | `/auth/register`                    | Registrar usuário          | —             |
| POST   | `/auth/login`                       | Login, retorna JWT         | —             |
| GET    | `/auth/me`                          | Usuário autenticado        | Bearer        |
| GET    | `/users`                            | Listar usuários da org     | ADMIN/TEACHER |
| GET    | `/users/{id}`                       | Perfil do usuário          | Bearer        |
| PATCH  | `/users/{id}`                       | Atualizar perfil           | Bearer        |
| POST   | `/classes`                          | Criar turma                | TEACHER       |
| GET    | `/classes`                          | Listar turmas              | Bearer        |
| GET    | `/classes/{id}`                     | Detalhe da turma           | Bearer        |
| POST   | `/classes/{id}/join`                | Entrar na turma via código | STUDENT       |
| POST   | `/exercises`                        | Criar exercício            | TEACHER       |
| GET    | `/exercises`                        | Listar exercícios          | Bearer        |
| GET    | `/exercises/{id}`                   | Detalhe + test cases       | Bearer        |
| PATCH  | `/exercises/{id}`                   | Atualizar exercício        | Owner         |
| DELETE | `/exercises/{id}`                   | Deletar exercício          | Owner         |
| POST   | `/exercises/{id}/test-cases`        | Adicionar test case        | Owner         |
| DELETE | `/exercises/{id}/test-cases/{tcId}` | Remover test case          | Owner         |
| POST   | `/submissions`                      | Enviar submissão           | STUDENT       |
| GET    | `/submissions`                      | Listar submissões          | Bearer        |
| GET    | `/submissions/{id}`                 | Detalhe                    | Bearer        |
| PATCH  | `/submissions/{id}/grade`           | Dar nota e feedback        | TEACHER       |
| GET    | `/health`                           | Health check               | —             |

## Docker

```bash
# Build
docker build -t ts-compilator-backend .

# Run
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql+asyncpg://... \
  -e SECRET_KEY=sua-chave-secreta \
  ts-compilator-backend
```

## Variáveis de Ambiente

| Variável                      | Obrigatória | Default                     | Descrição                                |
| ----------------------------- | ----------- | --------------------------- | ---------------------------------------- |
| `DATABASE_URL`                | Sim         | —                           | URL do PostgreSQL (asyncpg)              |
| `DATABASE_SCHEMA`             | Não         | `ts_compiler`               | Schema alvo para migrations e runtime    |
| `SECRET_KEY`                  | Sim         | —                           | Chave para assinar JWT                   |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Não         | `1440`                      | Expiração do token (minutos)             |
| `CORS_ORIGINS`                | Não         | `["http://localhost:3001"]` | Origens permitidas                       |
| `RUN_CREATE_ALL`              | Não         | `false`                     | Criar tabelas automaticamente (dev only) |

## Desenvolvimento

### Adicionar uma migration

```bash
uv run alembic revision --autogenerate -m "describe change"
uv run alembic upgrade head
```

### Gerar SECRET_KEY segura

```bash
openssl rand -hex 32
```
