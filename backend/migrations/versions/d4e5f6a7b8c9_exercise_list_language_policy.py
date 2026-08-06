"""exercise list language policy

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-08-06 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "d4e5f6a7b8c9"
down_revision: Union[str, Sequence[str], None] = "c3d4e5f6a7b8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# create_type=False: o tipo `languagepolicy` já foi criado em b2c3d4e5f6a7.
language_policy_enum = postgresql.ENUM(
    "OPEN", "LOCKED", name="languagepolicy", create_type=False
)


def _apply_search_path() -> None:
    schema_name = op.get_context().config.get_main_option("schema_name") or "public"
    if schema_name != "public":
        schema_escaped = schema_name.replace('"', '""')
        op.execute(sa.text(f'SET search_path TO "{schema_escaped}"'))


def upgrade() -> None:
    """Upgrade schema."""
    _apply_search_path()

    bind = op.get_bind()
    policy_type = (
        language_policy_enum
        if bind.dialect.name == "postgresql"
        else sa.Enum("OPEN", "LOCKED", name="languagepolicy")
    )

    # server_default 'OPEN': listas criadas antes desta migration continuam
    # válidas e passam a significar "aluno usa a própria linguagem".
    op.add_column(
        "exercise_lists",
        sa.Column("language_policy", policy_type, nullable=False, server_default="OPEN"),
    )
    op.add_column(
        "exercise_lists", sa.Column("locked_language_id", sa.Integer(), nullable=True)
    )
    op.create_foreign_key(
        "fk_exercise_lists_locked_language_id",
        "exercise_lists",
        "languages",
        ["locked_language_id"],
        ["id"],
        ondelete="RESTRICT",
    )
    op.create_check_constraint(
        "ck_exercise_lists_locked_language_consistency",
        "exercise_lists",
        "(language_policy = 'LOCKED') = (locked_language_id IS NOT NULL)",
    )


def downgrade() -> None:
    """Downgrade schema."""
    _apply_search_path()

    op.drop_constraint(
        "ck_exercise_lists_locked_language_consistency", "exercise_lists", type_="check"
    )
    op.drop_constraint(
        "fk_exercise_lists_locked_language_id", "exercise_lists", type_="foreignkey"
    )
    op.drop_column("exercise_lists", "locked_language_id")
    op.drop_column("exercise_lists", "language_policy")
    # O tipo `languagepolicy` NÃO é dropado: `exercises` ainda o usa.
