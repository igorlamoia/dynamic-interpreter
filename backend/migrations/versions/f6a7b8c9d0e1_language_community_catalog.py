"""add language community catalog

Revision ID: f6a7b8c9d0e1
Revises: e5f6a7b8c9d0
Create Date: 2026-08-12 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f6a7b8c9d0e1"
down_revision: Union[str, Sequence[str], None] = "e5f6a7b8c9d0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "languages",
        sa.Column(
            "is_public", sa.Boolean(), nullable=False, server_default=sa.false()
        ),
    )
    op.add_column(
        "languages",
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(
        "ix_languages_public_published_at",
        "languages",
        ["is_public", "published_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_languages_public_published_at", table_name="languages")
    op.drop_column("languages", "published_at")
    op.drop_column("languages", "is_public")
