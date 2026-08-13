from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class PaymentLink(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "payment_links"

    merchant_id: Mapped[PGUUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="KES")
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)

    merchant = relationship("Merchant", back_populates="payment_links")
    transactions = relationship("EscrowTransaction", back_populates="payment_link")
