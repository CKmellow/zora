from sqlalchemy.orm import Session

from app.models.payment_link import PaymentLink


class PaymentLinkRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_all(self) -> list[PaymentLink]:
        return self.db.query(PaymentLink).all()
