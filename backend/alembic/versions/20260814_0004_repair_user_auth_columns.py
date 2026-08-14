"""repair user auth/profile columns

Revision ID: 20260814_0004
Revises: 20260814_0003
Create Date: 2026-08-14 14:30:00
"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "20260814_0004"
down_revision: str | None = "20260814_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Defensive repair migration in case 0003 was partially applied in an older run.
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(32)")
    op.execute(
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_buyer BOOLEAN NOT NULL DEFAULT TRUE"
    )
    op.execute(
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_seller BOOLEAN NOT NULL DEFAULT FALSE"
    )
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)")


def downgrade() -> None:
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS password_hash")
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS is_seller")
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS is_buyer")
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS phone_number")
