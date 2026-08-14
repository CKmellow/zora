from uuid import UUID

from sqlalchemy.orm import Session

from app.models.escrow_approval import EscrowApproval


class EscrowApprovalRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, approval: EscrowApproval) -> EscrowApproval:
        self.db.add(approval)
        self.db.commit()
        self.db.refresh(approval)
        return approval

    def get_by_transaction_and_user(
        self,
        transaction_id: UUID,
        approver_user_id: UUID,
    ) -> EscrowApproval | None:
        return (
            self.db.query(EscrowApproval)
            .filter(
                EscrowApproval.transaction_id == transaction_id,
                EscrowApproval.approver_user_id == approver_user_id,
            )
            .first()
        )

    def list_by_transaction(self, transaction_id: UUID) -> list[EscrowApproval]:
        return (
            self.db.query(EscrowApproval)
            .filter(EscrowApproval.transaction_id == transaction_id)
            .order_by(EscrowApproval.created_at.asc())
            .all()
        )
