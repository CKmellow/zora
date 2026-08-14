from uuid import uuid4

from app.enums.transaction_status import TransactionStatus
from app.models.escrow_transaction import EscrowTransaction
from app.services.webhook_processing_service import WebhookProcessingService


class _FakeTransactionRepository:
    def __init__(self, transaction: EscrowTransaction | None):
        self.transaction = transaction
        self.updated_to: TransactionStatus | None = None

    def get_by_external_reference(self, external_reference: str):
        if self.transaction and external_reference == self.transaction.external_reference:
            return self.transaction
        return None

    def update_status(self, transaction: EscrowTransaction, status: TransactionStatus):
        self.updated_to = status
        transaction.status = status
        return transaction


def _build_transaction(status: TransactionStatus, order_code: str) -> EscrowTransaction:
    transaction = EscrowTransaction(
        merchant_id=uuid4(),
        amount=1,
        currency="KES",
        status=status,
        external_reference=f"order:{order_code}",
    )
    transaction.id = uuid4()
    return transaction


def test_maps_flat_loop_callback_payload_to_funded() -> None:
    order_code = "ORD-52CF2308C1"
    transaction = _build_transaction(TransactionStatus.PENDING, order_code)
    repo = _FakeTransactionRepository(transaction)

    service = WebhookProcessingService(db=None)  # type: ignore[arg-type]
    service.transaction_repository = repo

    payload = {
        "resultTime": "20260814031257",
        "rspMessage": "Success",
        "reason": f"Payment for order {order_code}",
        "amount": "100.00",
        "merchantTill": "133239",
        "transactionRef": "35981",
        "status": "COMPLETED",
    }

    result = service.process_loop_payload(payload)

    assert result.applied is True
    assert result.reason == "status_updated"
    assert result.status == TransactionStatus.FUNDED
    assert repo.updated_to == TransactionStatus.FUNDED
