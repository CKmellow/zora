from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel

from app.enums.payout_status import PayoutStatus


class PayoutRead(BaseModel):
    id: UUID
    transaction_id: UUID
    amount: Decimal
    currency: str
    status: PayoutStatus
    provider_reference: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
