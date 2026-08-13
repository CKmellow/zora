from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.enums.dispute_status import DisputeStatus


class DisputeRead(BaseModel):
    id: UUID
    transaction_id: UUID
    reason: str
    details: str | None
    status: DisputeStatus
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
