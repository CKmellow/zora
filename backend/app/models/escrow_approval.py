from sqlalchemy import ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class EscrowApproval(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "escrow_approvals"
    __table_args__ = (
        UniqueConstraint("transaction_id", "approver_user_id", name="uq_escrow_approval_actor"),
    )

    transaction_id: Mapped[PGUUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("escrow_transactions.id", ondelete="CASCADE"),
        nullable=False,
    )
    approver_user_id: Mapped[PGUUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    approver_role: Mapped[str] = mapped_column(String(32), nullable=False)
    decision: Mapped[str] = mapped_column(String(16), nullable=False)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
