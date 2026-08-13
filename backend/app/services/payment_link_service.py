from sqlalchemy.orm import Session

from app.repositories.payment_link_repository import PaymentLinkRepository


class PaymentLinkService:
    def __init__(self, db: Session):
        self.repository = PaymentLinkRepository(db)

    def list_links(self) -> list:
        return self.repository.list_all()
