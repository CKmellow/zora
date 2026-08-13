from sqlalchemy.orm import Session

from app.models.payment import Payment


class PaymentRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_all(self) -> list[Payment]:
        return self.db.query(Payment).all()
