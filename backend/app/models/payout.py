from decimal import Decimal

from sqlalchemy import Enum, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.enums.payout_status import PayoutStatus
from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Payout(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "payouts"

    transaction_id: Mapped[PGUUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("escrow_transactions.id", ondelete="CASCADE"),
        nullable=False,
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="KES")
    status: Mapped[PayoutStatus] = mapped_column(
        Enum(PayoutStatus, name="payout_status"), nullable=False, default=PayoutStatus.PENDING
    )
    provider_reference: Mapped[str | None] = mapped_column(String(128), unique=True, nullable=True)

    transaction = relationship("EscrowTransaction", back_populates="payouts")
