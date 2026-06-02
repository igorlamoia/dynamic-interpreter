"""extend userrole enum with SYSTEM

Revision ID: a1b2c3d4e5f6
Revises: f77e31d3931b
Create Date: 2026-05-19 00:00:00.000000

NOTE: PostgreSQL requires `ALTER TYPE ... ADD VALUE` to run outside of a
transaction, and the newly added value cannot be used in the same transaction
either. So this migration only extends the enum; the follow-up migration
b2c3d4e5f6a7 creates the new tables/columns and seeds the SYSTEM user.

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "f77e31d3931b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Run outside of a transaction so ALTER TYPE ... ADD VALUE works.
transactional_ddl = False


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'SYSTEM'")


def downgrade() -> None:
    # PostgreSQL does not support removing values from an enum type without
    # recreating it. Leaving 'SYSTEM' in place is safe — no rows reference it
    # after b2c3d4e5f6a7's downgrade removes the system user.
    pass
