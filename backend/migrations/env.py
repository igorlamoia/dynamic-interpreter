import asyncio
from logging.config import fileConfig

import sqlalchemy as sa
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# Importar settings e todos os modelos para autogenerate funcionar
from app.core.config import settings
import app.models  # noqa: F401 — registra todos os modelos no metadata
from app.db.base import Base

# Configuração do Alembic
config = context.config

# Configura logging via alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata alvo para autogenerate
target_metadata = Base.metadata

# Injeta DATABASE_URL das settings (substitui o valor do alembic.ini)
config.set_main_option("sqlalchemy.url", settings.database_url)
config.set_main_option("schema_name", settings.database_schema)


def run_migrations_offline() -> None:
    """Roda migrations em modo 'offline' (gera SQL sem conectar ao banco)."""
    url = config.get_main_option("sqlalchemy.url")
    schema = settings.database_schema.strip() or "public"
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        version_table_schema=schema,
        include_schemas=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    schema = settings.database_schema.strip() or "public"
    if schema != "public":
        schema_escaped = schema.replace('"', '""')
        connection.execute(sa.text(f'CREATE SCHEMA IF NOT EXISTS "{schema_escaped}"'))
        connection.execute(sa.text(f'SET search_path TO "{schema_escaped}"'))
        connection.commit()

    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        version_table_schema=schema,
        include_schemas=True,
        # One transaction per migration: lets a migration like
        # `ALTER TYPE ... ADD VALUE` commit before the next migration tries
        # to use that new value (Postgres forbids using it in the same tx).
        transaction_per_migration=True,
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Roda migrations em modo 'online' com engine async."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
