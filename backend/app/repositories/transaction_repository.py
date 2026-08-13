from sqlalchemy.orm import Session

from app.models.escrow_transaction import EscrowTransaction


class TransactionRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_all(self) -> list[EscrowTransaction]:
        return self.db.query(EscrowTransaction).all()
