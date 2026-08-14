from decimal import Decimal

from sqlalchemy import Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.enums.transaction_status import TransactionStatus
from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Order(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "orders"

    merchant_id: Mapped[PGUUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False
    )
    order_code: Mapped[str] = mapped_column(String(32), nullable=False, unique=True, index=True)
    item_name: Mapped[str] = mapped_column(String(255), nullable=False)
    item_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    item_image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="KES")
    buyer_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    buyer_phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    status: Mapped[TransactionStatus] = mapped_column(
        Enum(TransactionStatus, name="transaction_status"),
        nullable=False,
        default=TransactionStatus.PENDING,
    )

    merchant = relationship("Merchant", back_populates="orders")
    transaction = relationship("EscrowTransaction", back_populates="order", uselist=False)
