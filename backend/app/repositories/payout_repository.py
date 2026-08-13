from sqlalchemy.orm import Session

from app.models.payout import Payout


class PayoutRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_all(self) -> list[Payout]:
        return self.db.query(Payout).all()
