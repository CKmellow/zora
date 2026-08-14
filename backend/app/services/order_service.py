import secrets
from decimal import Decimal
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.enums.transaction_status import TransactionStatus
from app.integrations.loop.client import LoopHTTPClient
from app.integrations.loop.exceptions import LoopIntegrationError
from app.integrations.loop.payments import LoopPaymentsAPI, LoopPromptRequest
from app.models.order import Order
from app.repositories.merchant_repository import MerchantRepository
from app.repositories.order_repository import OrderRepository
from app.repositories.transaction_repository import TransactionRepository
from app.schemas.order import CheckoutPayResponse, OrderCreate


class OrderService:
    def __init__(self, db: Session):
        self.db = db
        self.order_repository = OrderRepository(db)
        self.merchant_repository = MerchantRepository(db)
        self.transaction_repository = TransactionRepository(db)
        self.loop_payments_api = LoopPaymentsAPI(LoopHTTPClient())
        self.settings = get_settings()

    def create_order(self, payload: OrderCreate, owner_user_id: UUID | None = None) -> Order:
        merchant = None
        if payload.merchant_id is not None:
            merchant = self.merchant_repository.get_by_id(str(payload.merchant_id))
        elif owner_user_id is not None:
            merchant = self.merchant_repository.get_latest_by_owner(str(owner_user_id))

        if merchant is None:
            raise ValueError("Merchant not found")

        order = Order(
            merchant_id=merchant.id,
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

    async def initiate_checkout(
        self,
        order_code: str,
        phone_number: str,
    ) -> CheckoutPayResponse | None:
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
                merchant_id=UUID(str(order.merchant_id)),
                amount=Decimal(order.amount),
                currency=order.currency,
                external_reference=f"order:{order.order_code}",
            )

        if not order.buyer_phone:
            order.buyer_phone = phone_number
            self.order_repository.save(order)

        callback_url = self.settings.webhook_base_url.rstrip("/") + "/api/v1/webhooks/loop"
        merchant = self.merchant_repository.get_by_id(str(order.merchant_id))
        merchant_till = merchant.till_number if merchant and merchant.till_number else None

        try:
            loop_response = await self.loop_payments_api.prompt_payment(
                LoopPromptRequest(
                    txn_reference=transaction.external_reference or f"order:{order.order_code}",
                    mobile_no=phone_number,
                    amount=Decimal(order.amount),
                    reason=f"Payment for order {order.order_code}",
                    callback_url=callback_url,
                    merchant_till=merchant_till,
                )
            )
        except LoopIntegrationError as exc:
            return CheckoutPayResponse(
                order_code=order.order_code,
                transaction_id=str(transaction.id),
                transaction_status=transaction.status,
                message=f"Checkout initiated but LOOP prompt failed: {exc}",
            )

        loop_data = loop_response.get("data", {})
        loop_status_code = int(loop_response.get("statusCode", 0))
        response_payload = loop_data.get("response", {}) if isinstance(loop_data, dict) else {}
        loop_reference = response_payload.get("transactionRef")

        return CheckoutPayResponse(
            order_code=order.order_code,
            transaction_id=str(transaction.id),
            transaction_status=transaction.status,
            message="Checkout initiated and LOOP prompt sent.",
            loop_status_code=loop_status_code,
            loop_reference=loop_reference,
        )

    def _generate_order_code(self) -> str:
        while True:
            candidate = f"ORD-{secrets.token_hex(5).upper()}"
            if self.order_repository.get_by_order_code(candidate) is None:
                return candidate
