from decimal import Decimal
from uuid import UUID

from sqlalchemy.orm import Session

from app.enums.transaction_status import TransactionStatus
from app.models.escrow_transaction import EscrowTransaction


class TransactionRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_all(self) -> list[EscrowTransaction]:
        return self.db.query(EscrowTransaction).all()

    def get_by_order_id(self, order_id: UUID) -> EscrowTransaction | None:
        return (
            self.db.query(EscrowTransaction)
            .filter(EscrowTransaction.order_id == order_id)
            .first()
        )

    def get_by_external_reference(self, external_reference: str) -> EscrowTransaction | None:
        return (
            self.db.query(EscrowTransaction)
            .filter(EscrowTransaction.external_reference == external_reference)
            .first()
        )

    def create_for_order(
        self,
        order_id: UUID,
        merchant_id: UUID,
        amount: Decimal,
        currency: str,
        external_reference: str,
    ) -> EscrowTransaction:
        transaction = EscrowTransaction(
            order_id=order_id,
            merchant_id=merchant_id,
            amount=amount,
            currency=currency,
            external_reference=external_reference,
            status=TransactionStatus.PENDING,
        )
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction

    def update_status(
        self,
        transaction: EscrowTransaction,
        status: TransactionStatus,
    ) -> EscrowTransaction:
        transaction.status = status
        if transaction.order is not None:
            transaction.order.status = status
            self.db.add(transaction.order)
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction
