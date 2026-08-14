from uuid import UUID

from sqlalchemy.orm import Session

from app.models.order import Order


class OrderRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, order: Order) -> Order:
        self.db.add(order)
        self.db.commit()
        self.db.refresh(order)
        return order

    def get_by_order_code(self, order_code: str) -> Order | None:
        return self.db.query(Order).filter(Order.order_code == order_code).first()

    def list_by_merchant(self, merchant_id: UUID) -> list[Order]:
        return (
            self.db.query(Order)
            .filter(Order.merchant_id == merchant_id)
            .order_by(Order.created_at.desc())
            .all()
        )

    def save(self, order: Order) -> Order:
        self.db.add(order)
        self.db.commit()
        self.db.refresh(order)
        return order
