from sqlalchemy.orm import Session

from app.models.merchant import Merchant


class MerchantRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_all(self) -> list[Merchant]:
        return self.db.query(Merchant).all()
