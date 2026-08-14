import secrets
from decimal import Decimal
from uuid import UUID

from sqlalchemy.orm import Session

from app.enums.transaction_status import TransactionStatus
from app.models.order import Order
from app.repositories.order_repository import OrderRepository
from app.repositories.transaction_repository import TransactionRepository
from app.schemas.order import CheckoutPayResponse, OrderCreate


class OrderService:
    def __init__(self, db: Session):
        self.order_repository = OrderRepository(db)
        self.transaction_repository = TransactionRepository(db)

    def create_order(self, payload: OrderCreate) -> Order:
        order = Order(
            merchant_id=payload.merchant_id,
            order_code=self._generate_order_code(),
            item_name=payload.item_name,
            item_description=payload.item_description,
            item_image_url=payload.item_image_url,
            amount=payload.amount,
            currency=payload.currency,
            buyer_name=payload.buyer_name,
            buyer_phone=payload.buyer_phone,
            status=TransactionStatus.PENDING,
        )
        return self.order_repository.create(order)

    def list_merchant_orders(self, merchant_id: UUID) -> list[Order]:
        return self.order_repository.list_by_merchant(merchant_id)

    def get_public_order(self, order_code: str) -> Order | None:
        return self.order_repository.get_by_order_code(order_code)

    def initiate_checkout(self, order_code: str, phone_number: str) -> CheckoutPayResponse | None:
        order = self.order_repository.get_by_order_code(order_code)
        if order is None:
            return None

        if order.status in {
            TransactionStatus.SETTLED,
            TransactionStatus.REFUNDED,
        }:
            return CheckoutPayResponse(
                order_code=order.order_code,
                transaction_id=str(order.transaction.id) if order.transaction else "",
                transaction_status=order.status,
                message="Order is already finalized",
            )

        transaction = self.transaction_repository.get_by_order_id(order.id)
        if transaction is None:
            transaction = self.transaction_repository.create_for_order(
                order_id=order.id,
                merchant_id=order.merchant_id,
                amount=Decimal(order.amount),
                currency=order.currency,
                external_reference=f"order:{order.order_code}",
            )

        if not order.buyer_phone:
            order.buyer_phone = phone_number
            self.order_repository.save(order)

        return CheckoutPayResponse(
            order_code=order.order_code,
            transaction_id=str(transaction.id),
            transaction_status=transaction.status,
            message="Checkout initiated. LOOP prompt integration will be executed in payment flow.",
        )

    def _generate_order_code(self) -> str:
        while True:
            candidate = f"ORD-{secrets.token_hex(5).upper()}"
            if self.order_repository.get_by_order_code(candidate) is None:
                return candidate
