from uuid import UUID

from app.enums.transaction_status import TransactionStatus
from app.models.escrow_approval import EscrowApproval
from app.repositories.escrow_approval_repository import EscrowApprovalRepository
from app.repositories.transaction_repository import TransactionRepository
from app.schemas.escrow_approval import EscrowApprovalRequest, EscrowApprovalSummary


class EscrowApprovalService:
    def __init__(
        self,
        approval_repository: EscrowApprovalRepository,
        transaction_repository: TransactionRepository,
    ):
        self.approval_repository = approval_repository
        self.transaction_repository = transaction_repository

    def submit_approval(
        self,
        transaction_id: UUID,
        approver_user_id: UUID,
        approver_role: str,
        payload: EscrowApprovalRequest,
    ) -> EscrowApproval:
        transaction = self.transaction_repository.get_by_id(transaction_id)
        if transaction is None:
            raise ValueError("Transaction not found")

        existing = self.approval_repository.get_by_transaction_and_user(
            transaction_id=transaction_id,
            approver_user_id=approver_user_id,
        )
        if existing is not None:
            raise ValueError("Approval already submitted by this user")

        approval = EscrowApproval(
            transaction_id=transaction_id,
            approver_user_id=approver_user_id,
            approver_role=approver_role,
            decision=payload.decision,
            note=payload.note,
        )
        created = self.approval_repository.create(approval)

        summary = self.get_summary(transaction_id)
        if summary.approved_count >= summary.approvals_required:
            self.transaction_repository.update_status(transaction, TransactionStatus.SETTLED)

        return created

    def get_summary(self, transaction_id: UUID) -> EscrowApprovalSummary:
        transaction = self.transaction_repository.get_by_id(transaction_id)
        if transaction is None:
            raise ValueError("Transaction not found")

        approvals = self.approval_repository.list_by_transaction(transaction_id)
        approved_count = sum(1 for item in approvals if item.decision == "approve")
        rejected_count = sum(1 for item in approvals if item.decision == "reject")

        settled_by_approval = approved_count >= 2
        status_message = (
            "Settlement threshold reached"
            if settled_by_approval
            else "Awaiting more approvals"
        )

        return EscrowApprovalSummary(
            transaction_id=transaction_id,
            approvals_required=2,
            approved_count=approved_count,
            rejected_count=rejected_count,
            settled_by_approval=settled_by_approval,
            status_message=status_message,
        )
