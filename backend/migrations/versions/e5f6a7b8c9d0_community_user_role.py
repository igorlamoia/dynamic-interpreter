"""add community user role and optional organization

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-08-12 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e5f6a7b8c9d0"
down_revision: Union[str, Sequence[str], None] = "d4e5f6a7b8c9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

transactional_ddl = False


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'COMMUNITY'")
    op.alter_column(
        "users", "organization_id", existing_type=sa.Integer(), nullable=True
    )


def downgrade() -> None:
    # PostgreSQL enum values cannot be removed without recreating the type.
    op.alter_column(
        "users", "organization_id", existing_type=sa.Integer(), nullable=False
    )
