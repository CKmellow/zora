from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel


class PaymentLinkRead(BaseModel):
    id: UUID
    merchant_id: UUID
    title: str
    description: str | None
    amount: Decimal
    currency: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
