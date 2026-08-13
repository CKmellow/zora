from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel

from app.enums.payment_status import PaymentStatus


class PaymentRead(BaseModel):
    id: UUID
    transaction_id: UUID
    amount: Decimal
    currency: str
    status: PaymentStatus
    provider_reference: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
