"""add otp challenges and escrow approvals

Revision ID: 20260814_0005
Revises: 20260814_0004
Create Date: 2026-08-14 16:20:00
"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "20260814_0005"
down_revision: str | None = "20260814_0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "otp_challenges",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("purpose", sa.String(length=64), nullable=False),
        sa.Column("subject", sa.String(length=255), nullable=False),
        sa.Column("channel", sa.String(length=32), nullable=False, server_default="sms"),
        sa.Column("code_hash", sa.String(length=255), nullable=False),
        sa.Column("attempts_remaining", sa.Integer(), nullable=False, server_default="3"),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_error", sa.Text(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "escrow_approvals",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("transaction_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("approver_user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("approver_role", sa.String(length=32), nullable=False),
        sa.Column("decision", sa.String(length=16), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.ForeignKeyConstraint(["approver_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["transaction_id"], ["escrow_transactions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("transaction_id", "approver_user_id", name="uq_escrow_approval_actor"),
    )


def downgrade() -> None:
    op.drop_table("escrow_approvals")
    op.drop_table("otp_challenges")
