"""language presentation fields

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-08-04 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c3d4e5f6a7b8"
down_revision: Union[str, Sequence[str], None] = "b2c3d4e5f6a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _apply_search_path() -> None:
    schema_name = op.get_context().config.get_main_option("schema_name") or "public"
    if schema_name != "public":
        schema_escaped = schema_name.replace('"', '""')
        op.execute(sa.text(f'SET search_path TO "{schema_escaped}"'))


def upgrade() -> None:
    """Upgrade schema."""
    _apply_search_path()

    # Nullable de propósito: linguagens criadas antes desta migration não têm
    # identidade visual e continuam válidas.
    op.add_column("languages", sa.Column("image_url", sa.String(), nullable=True))
    op.add_column("languages", sa.Column("image_query", sa.String(), nullable=True))
    op.add_column("languages", sa.Column("preset_id", sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    _apply_search_path()

    op.drop_column("languages", "preset_id")
    op.drop_column("languages", "image_query")
    op.drop_column("languages", "image_url")
