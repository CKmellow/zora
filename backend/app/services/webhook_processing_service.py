from __future__ import annotations

import re
from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.enums.transaction_status import TransactionStatus
from app.models.escrow_transaction import EscrowTransaction
from app.repositories.transaction_repository import TransactionRepository


@dataclass
class WebhookProcessResult:
    applied: bool
    reason: str
    transaction_id: str | None = None
    status: TransactionStatus | None = None


class WebhookProcessingService:
    def __init__(self, db: Session):
        self.transaction_repository = TransactionRepository(db)

    def process_loop_payload(self, payload: dict) -> WebhookProcessResult:
        transaction = self._find_transaction(payload)
        if transaction is None:
            return WebhookProcessResult(applied=False, reason="transaction_not_found")

        mapped_status = self._map_status(payload)
        if mapped_status is None:
            return WebhookProcessResult(applied=False, reason="status_not_mapped")

        if not self._can_transition(transaction.status, mapped_status):
            return WebhookProcessResult(
                applied=False,
                reason=f"invalid_transition:{transaction.status}->{mapped_status}",
                transaction_id=str(transaction.id),
                status=transaction.status,
            )

        if transaction.status == mapped_status:
            return WebhookProcessResult(
                applied=True,
                reason="noop_same_status",
                transaction_id=str(transaction.id),
                status=transaction.status,
            )

        updated = self.transaction_repository.update_status(transaction, mapped_status)
        return WebhookProcessResult(
            applied=True,
            reason="status_updated",
            transaction_id=str(updated.id),
            status=updated.status,
        )

    def _find_transaction(self, payload: dict) -> EscrowTransaction | None:
        event = payload.get("event")
        raw_data = payload.get("data")
        data = raw_data if isinstance(raw_data, dict) else {}

        order_code = data.get("order_code") or payload.get("order_code")
        if isinstance(order_code, str) and order_code:
            transaction = self.transaction_repository.get_by_external_reference(
                f"order:{order_code}"
            )
            if transaction is not None:
                return transaction

        external_reference = data.get("external_reference") or payload.get("external_reference")
        if isinstance(external_reference, str) and external_reference:
            transaction = self.transaction_repository.get_by_external_reference(external_reference)
            if transaction is not None:
                return transaction

        provider_reference = data.get("provider_reference") or payload.get("provider_reference")
        if isinstance(provider_reference, str) and provider_reference:
            transaction = self.transaction_repository.get_by_external_reference(provider_reference)
            if transaction is not None:
                return transaction

        # LOOP callback may include a flat "reason" field like
        # "Payment for order ORD-52CF2308C1" instead of nested order_code.
        reason = payload.get("reason")
        if isinstance(reason, str):
            match = re.search(r"ORD-[A-Z0-9]+", reason.upper())
            if match:
                transaction = self.transaction_repository.get_by_external_reference(
                    f"order:{match.group(0)}"
                )
                if transaction is not None:
                    return transaction

        if isinstance(event, str) and event.startswith("payment."):
            transaction_code = data.get("transaction_code") or payload.get("transaction_code")
            if isinstance(transaction_code, str) and transaction_code:
                return self.transaction_repository.get_by_external_reference(transaction_code)

        return None

    def _map_status(self, payload: dict) -> TransactionStatus | None:
        event = payload.get("event")
        if isinstance(event, str):
            event_map = {
                "payment.initiated": TransactionStatus.PENDING,
                "payment.pending": TransactionStatus.PENDING,
                "payment.completed": TransactionStatus.FUNDED,
                "payment.success": TransactionStatus.FUNDED,
                "payment.failed": TransactionStatus.DISPUTED,
                "payment.cancelled": TransactionStatus.REFUNDED,
                "payment.refunded": TransactionStatus.REFUNDED,
                "delivery.in_transit": TransactionStatus.IN_TRANSIT,
                "delivery.delivered": TransactionStatus.DELIVERED,
                "settlement.completed": TransactionStatus.SETTLED,
                "dispute.opened": TransactionStatus.DISPUTED,
                "dispute.resolved_refund": TransactionStatus.REFUNDED,
                "dispute.resolved_settlement": TransactionStatus.SETTLED,
            }
            mapped = event_map.get(event.lower())
            if mapped is not None:
                return mapped

        raw_data = payload.get("data")
        data = raw_data if isinstance(raw_data, dict) else {}
        status = data.get("status") or payload.get("status")
        if isinstance(status, str):
            normalized = status.upper()
            provider_status_map = {
                "COMPLETED": TransactionStatus.FUNDED,
                "SUCCESS": TransactionStatus.FUNDED,
                "PENDING": TransactionStatus.PENDING,
                "FAILED": TransactionStatus.DISPUTED,
                "CANCELLED": TransactionStatus.REFUNDED,
                "CANCELED": TransactionStatus.REFUNDED,
                "REFUNDED": TransactionStatus.REFUNDED,
            }
            mapped = provider_status_map.get(normalized)
            if mapped is not None:
                return mapped

            if normalized in TransactionStatus.__members__:
                return TransactionStatus[normalized]

        return None

    def _can_transition(self, current: TransactionStatus, target: TransactionStatus) -> bool:
        transitions = {
            TransactionStatus.PENDING: {
                TransactionStatus.PENDING,
                TransactionStatus.FUNDED,
                TransactionStatus.DISPUTED,
                TransactionStatus.REFUNDED,
            },
            TransactionStatus.FUNDED: {
                TransactionStatus.FUNDED,
                TransactionStatus.IN_TRANSIT,
                TransactionStatus.DELIVERED,
                TransactionStatus.DISPUTED,
                TransactionStatus.REFUNDED,
                TransactionStatus.SETTLED,
            },
            TransactionStatus.IN_TRANSIT: {
                TransactionStatus.IN_TRANSIT,
                TransactionStatus.DELIVERED,
                TransactionStatus.DISPUTED,
                TransactionStatus.REFUNDED,
            },
            TransactionStatus.DELIVERED: {
                TransactionStatus.DELIVERED,
                TransactionStatus.SETTLED,
                TransactionStatus.DISPUTED,
            },
            TransactionStatus.SETTLED: {TransactionStatus.SETTLED},
            TransactionStatus.DISPUTED: {
                TransactionStatus.DISPUTED,
                TransactionStatus.REFUNDED,
                TransactionStatus.SETTLED,
            },
            TransactionStatus.REFUNDED: {TransactionStatus.REFUNDED},
        }
        return target in transitions[current]
