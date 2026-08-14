from uuid import uuid4

from app.enums.transaction_status import TransactionStatus
from app.models.escrow_transaction import EscrowTransaction
from app.services.webhook_processing_service import WebhookProcessingService


class _FakeTransactionRepository:
    def __init__(self, transaction: EscrowTransaction | None):
        self.transaction = transaction
        self.updated_to: TransactionStatus | None = None

    def get_by_external_reference(self, external_reference: str) -> EscrowTransaction | None:
        expected_refs = {
            "order:ORD-ABCDE12345",
            "provider-ref-1",
            "tx-code-1",
        }
        if external_reference in expected_refs:
            return self.transaction
        return None

    def update_status(
        self,
        transaction: EscrowTransaction,
        status: TransactionStatus,
    ) -> EscrowTransaction:
        self.updated_to = status
        transaction.status = status
        return transaction


def _build_transaction(status: TransactionStatus) -> EscrowTransaction:
    transaction = EscrowTransaction(
        merchant_id=uuid4(),
        amount=1,
        currency="KES",
        status=status,
        external_reference="order:ORD-ABCDE12345",
    )
    transaction.id = uuid4()
    return transaction


def test_maps_payment_completed_to_funded() -> None:
    transaction = _build_transaction(TransactionStatus.PENDING)
    repo = _FakeTransactionRepository(transaction)

    service = WebhookProcessingService(db=None)  # type: ignore[arg-type]
    service.transaction_repository = repo

    payload = {
        "event": "payment.completed",
        "data": {
            "order_code": "ORD-ABCDE12345",
        },
    }

    result = service.process_loop_payload(payload)

    assert result.applied is True
    assert result.reason == "status_updated"
    assert result.status == TransactionStatus.FUNDED
    assert repo.updated_to == TransactionStatus.FUNDED


def test_rejects_invalid_transition_after_settled() -> None:
    transaction = _build_transaction(TransactionStatus.SETTLED)
    repo = _FakeTransactionRepository(transaction)

    service = WebhookProcessingService(db=None)  # type: ignore[arg-type]
    service.transaction_repository = repo

    payload = {
        "event": "payment.completed",
        "data": {
            "order_code": "ORD-ABCDE12345",
        },
    }

    result = service.process_loop_payload(payload)

    assert result.applied is False
    assert result.reason == "invalid_transition:SETTLED->FUNDED"
    assert repo.updated_to is None


def test_reports_not_found_when_transaction_missing() -> None:
    repo = _FakeTransactionRepository(None)

    service = WebhookProcessingService(db=None)  # type: ignore[arg-type]
    service.transaction_repository = repo

    payload = {
        "event": "payment.completed",
        "data": {
            "order_code": "ORD-ABCDE12345",
        },
    }

    result = service.process_loop_payload(payload)

    assert result.applied is False
    assert result.reason == "transaction_not_found"
