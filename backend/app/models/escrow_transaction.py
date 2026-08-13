from decimal import Decimal

from sqlalchemy import Enum, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.enums.transaction_status import TransactionStatus
from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class EscrowTransaction(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "escrow_transactions"

    payment_link_id: Mapped[PGUUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("payment_links.id", ondelete="SET NULL"), nullable=True
    )
    merchant_id: Mapped[PGUUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False
    )
    buyer_user_id: Mapped[PGUUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    external_reference: Mapped[str | None] = mapped_column(String(128), unique=True, nullable=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="KES")
    status: Mapped[TransactionStatus] = mapped_column(
        Enum(TransactionStatus, name="transaction_status"),
        nullable=False,
        default=TransactionStatus.PENDING,
    )

    payment_link = relationship("PaymentLink", back_populates="transactions")
    payments = relationship("Payment", back_populates="transaction")
    payouts = relationship("Payout", back_populates="transaction")
    disputes = relationship("Dispute", back_populates="transaction")
    delivery_confirmations = relationship("DeliveryConfirmation", back_populates="transaction")
    ledger_entries = relationship("LedgerEntry", back_populates="transaction")
