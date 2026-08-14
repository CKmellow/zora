"""add orders and checkout link

Revision ID: 20260814_0002
Revises: 20260813_0001
Create Date: 2026-08-14 09:00:00
"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "20260814_0002"
down_revision: str | None = "20260813_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    transaction_status_col = postgresql.ENUM(name="transaction_status", create_type=False)

    op.create_table(
        "orders",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("merchant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("order_code", sa.String(length=32), nullable=False),
        sa.Column("item_name", sa.String(length=255), nullable=False),
        sa.Column("item_description", sa.Text(), nullable=True),
        sa.Column("item_image_url", sa.Text(), nullable=True),
        sa.Column("amount", sa.Numeric(precision=18, scale=2), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="KES"),
        sa.Column("buyer_name", sa.String(length=255), nullable=True),
        sa.Column("buyer_phone", sa.String(length=32), nullable=True),
        sa.Column("status", transaction_status_col, nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.ForeignKeyConstraint(["merchant_id"], ["merchants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("order_code"),
    )
    op.create_index(op.f("ix_orders_order_code"), "orders", ["order_code"], unique=True)

    op.add_column(
        "escrow_transactions",
        sa.Column("order_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.create_unique_constraint(
        "uq_escrow_transactions_order_id", "escrow_transactions", ["order_id"]
    )
    op.create_foreign_key(
        "fk_escrow_transactions_order_id_orders",
        "escrow_transactions",
        "orders",
        ["order_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_escrow_transactions_order_id_orders", "escrow_transactions", type_="foreignkey"
    )
    op.drop_constraint("uq_escrow_transactions_order_id", "escrow_transactions", type_="unique")
    op.drop_column("escrow_transactions", "order_id")

    op.drop_index(op.f("ix_orders_order_code"), table_name="orders")
    op.drop_table("orders")