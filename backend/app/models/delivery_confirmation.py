from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class DeliveryConfirmation(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "delivery_confirmations"

    transaction_id: Mapped[PGUUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("escrow_transactions.id", ondelete="CASCADE"),
        nullable=False,
    )
    confirmation_method: Mapped[str] = mapped_column(String(64), nullable=False)
    confirmed_by: Mapped[str | None] = mapped_column(String(255), nullable=True)

    transaction = relationship("EscrowTransaction", back_populates="delivery_confirmations")
