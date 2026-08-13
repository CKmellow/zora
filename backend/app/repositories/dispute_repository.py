from sqlalchemy.orm import Session

from app.models.dispute import Dispute


class DisputeRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_all(self) -> list[Dispute]:
        return self.db.query(Dispute).all()
