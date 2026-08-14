from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_local_user_claims
from app.repositories.escrow_approval_repository import EscrowApprovalRepository
from app.repositories.transaction_repository import TransactionRepository
from app.schemas.escrow_approval import (
    EscrowApprovalRead,
    EscrowApprovalRequest,
    EscrowApprovalSummary,
)
from app.services.escrow_approval_service import EscrowApprovalService

router = APIRouter()


@router.post(
    "/transactions/{transaction_id}/approvals",
    response_model=EscrowApprovalRead,
    status_code=status.HTTP_201_CREATED,
)
async def submit_approval(
    transaction_id: UUID,
    payload: EscrowApprovalRequest,
    claims: dict = Depends(get_current_local_user_claims),
    db: Session = Depends(get_db),
) -> EscrowApprovalRead:
    service = EscrowApprovalService(
        approval_repository=EscrowApprovalRepository(db),
        transaction_repository=TransactionRepository(db),
    )
    try:
        approval = service.submit_approval(
            transaction_id=transaction_id,
            approver_user_id=UUID(claims["sub"]),
            approver_role="user",
            payload=payload,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return EscrowApprovalRead.model_validate(approval)


@router.get(
    "/transactions/{transaction_id}/approvals/summary",
    response_model=EscrowApprovalSummary,
)
async def approval_summary(
    transaction_id: UUID,
    db: Session = Depends(get_db),
) -> EscrowApprovalSummary:
    service = EscrowApprovalService(
        approval_repository=EscrowApprovalRepository(db),
        transaction_repository=TransactionRepository(db),
    )
    try:
        return service.get_summary(transaction_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
