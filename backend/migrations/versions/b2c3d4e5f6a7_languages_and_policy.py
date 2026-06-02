"""languages table and exercise language policy

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-05-19 00:00:01.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, Sequence[str], None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


language_policy_enum = postgresql.ENUM("OPEN", "LOCKED", name="languagepolicy")


def upgrade() -> None:
    """Upgrade schema."""
    schema_name = op.get_context().config.get_main_option("schema_name") or "public"
    if schema_name != "public":
        schema_escaped = schema_name.replace('"', '""')
        op.execute(sa.text(f'SET search_path TO "{schema_escaped}"'))

    bind = op.get_bind()

    # 1) Create languages table.
    op.create_table(
        "languages",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column(
            "customization",
            postgresql.JSONB(astext_type=sa.Text())
            if bind.dialect.name == "postgresql"
            else sa.JSON(),
            nullable=False,
        ),
        sa.Column("cloned_from_id", sa.Integer(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()
        ),
        sa.Column(
            "updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()
        ),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["cloned_from_id"], ["languages.id"], ondelete="SET NULL"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("owner_id", "name", name="uq_languages_owner_name"),
    )
    op.create_index("ix_languages_owner_id", "languages", ["owner_id"], unique=False)

    # 2) users.active_language_id (alterable FK to break circular dependency).
    op.add_column("users", sa.Column("active_language_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_users_active_language_id",
        "users",
        "languages",
        ["active_language_id"],
        ["id"],
        ondelete="SET NULL",
    )

    # 3) exercises: language_policy + locked_language_id + CHECK.
    if bind.dialect.name == "postgresql":
        language_policy_enum.create(bind, checkfirst=True)
        op.add_column(
            "exercises",
            sa.Column(
                "language_policy",
                language_policy_enum,
                nullable=False,
                server_default="OPEN",
            ),
        )
    else:
        op.add_column(
            "exercises",
            sa.Column(
                "language_policy",
                sa.Enum("OPEN", "LOCKED", name="languagepolicy"),
                nullable=False,
                server_default="OPEN",
            ),
        )
    op.add_column(
        "exercises", sa.Column("locked_language_id", sa.Integer(), nullable=True)
    )
    op.create_foreign_key(
        "fk_exercises_locked_language_id",
        "exercises",
        "languages",
        ["locked_language_id"],
        ["id"],
        ondelete="RESTRICT",
    )
    op.create_check_constraint(
        "ck_exercises_locked_language_consistency",
        "exercises",
        "(language_policy = 'LOCKED') = (locked_language_id IS NOT NULL)",
    )

    # 4) submissions.language_snapshot (NOT NULL with default '{}' so existing rows pass).
    if bind.dialect.name == "postgresql":
        op.add_column(
            "submissions",
            sa.Column(
                "language_snapshot",
                postgresql.JSONB(astext_type=sa.Text()),
                nullable=False,
                server_default=sa.text("'{}'::jsonb"),
            ),
        )
    else:
        op.add_column(
            "submissions",
            sa.Column(
                "language_snapshot",
                sa.JSON(),
                nullable=False,
                server_default=sa.text("'{}'"),
            ),
        )

    # 5) Seed System organization + user. Idempotent. Uses raw SQL with a CAST
    #    so the enum value 'SYSTEM' (added in the previous migration) is bound
    #    correctly via asyncpg/psycopg.
    bind.execute(
        sa.text(
            """
            INSERT INTO organizations (name, created_at)
            SELECT 'System', now()
            WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'System')
            """
        )
    )
    bind.execute(
        sa.text(
            """
            INSERT INTO users (organization_id, role, email, password, name)
            SELECT (SELECT id FROM organizations WHERE name = 'System'),
                   CAST(:role AS userrole),
                   CAST(:email AS varchar),
                   CAST(:password AS varchar),
                   CAST(:name AS varchar)
            WHERE NOT EXISTS (
                SELECT 1 FROM users WHERE email = CAST(:email_lookup AS varchar)
            )
            """
        ),
        {
            "role": "SYSTEM",
            "email": "system@internal",
            "email_lookup": "system@internal",
            "password": "!disabled",
            "name": "System",
        },
    )


def downgrade() -> None:
    """Downgrade schema."""
    schema_name = op.get_context().config.get_main_option("schema_name") or "public"
    if schema_name != "public":
        schema_escaped = schema_name.replace('"', '""')
        op.execute(sa.text(f'SET search_path TO "{schema_escaped}"'))

    bind = op.get_bind()

    # Remove system user/org (idempotent).
    op.execute(sa.text("DELETE FROM users WHERE email = 'system@internal'"))
    op.execute(sa.text("DELETE FROM organizations WHERE name = 'System'"))

    op.drop_column("submissions", "language_snapshot")

    op.drop_constraint(
        "ck_exercises_locked_language_consistency", "exercises", type_="check"
    )
    op.drop_constraint(
        "fk_exercises_locked_language_id", "exercises", type_="foreignkey"
    )
    op.drop_column("exercises", "locked_language_id")
    op.drop_column("exercises", "language_policy")
    if bind.dialect.name == "postgresql":
        language_policy_enum.drop(bind, checkfirst=True)

    op.drop_constraint("fk_users_active_language_id", "users", type_="foreignkey")
    op.drop_column("users", "active_language_id")

    op.drop_index("ix_languages_owner_id", table_name="languages")
    op.drop_table("languages")
