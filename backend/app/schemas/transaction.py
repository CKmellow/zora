from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel

from app.enums.transaction_status import TransactionStatus


class TransactionRead(BaseModel):
    id: UUID
    payment_link_id: UUID | None
    merchant_id: UUID
    buyer_user_id: UUID | None
    external_reference: str | None
    amount: Decimal
    currency: str
    status: TransactionStatus
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
