from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class EscrowApprovalRequest(BaseModel):
    decision: str = Field(pattern="^(approve|reject)$")
    note: str | None = Field(default=None, max_length=500)


class EscrowApprovalRead(BaseModel):
    id: UUID
    transaction_id: UUID
    approver_user_id: UUID
    approver_role: str
    decision: str
    note: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class EscrowApprovalSummary(BaseModel):
    transaction_id: UUID
    approvals_required: int
    approved_count: int
    rejected_count: int
    settled_by_approval: bool
    status_message: str
