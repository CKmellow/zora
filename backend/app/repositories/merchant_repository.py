from sqlalchemy.orm import Session

from app.models.merchant import Merchant


class MerchantRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_all(self) -> list[Merchant]:
        return self.db.query(Merchant).all()

    def list_by_owner(self, owner_user_id: str) -> list[Merchant]:
        return (
            self.db.query(Merchant)
            .filter(Merchant.owner_user_id == owner_user_id)
            .order_by(Merchant.created_at.desc())
            .all()
        )

    def create(self, merchant: Merchant) -> Merchant:
        self.db.add(merchant)
        self.db.commit()
        self.db.refresh(merchant)
        return merchant

    def get_by_id(self, merchant_id: str) -> Merchant | None:
        return self.db.query(Merchant).filter(Merchant.id == merchant_id).first()

    def save(self, merchant: Merchant) -> Merchant:
        self.db.add(merchant)
        self.db.commit()
        self.db.refresh(merchant)
        return merchant
