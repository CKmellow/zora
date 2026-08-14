import hashlib
import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.logging import get_logger
from app.repositories.webhook_repository import WebhookRepository
from app.schemas.webhook import LoopWebhookRequest, WebhookReceiveResponse
from app.services.webhook_processing_service import WebhookProcessingService

router = APIRouter()
logger = get_logger(__name__)


def _hash_payload(payload: dict) -> str:
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


@router.post("/loop", response_model=WebhookReceiveResponse)
async def loop_webhook(
    payload: LoopWebhookRequest,
    db: Session = Depends(get_db),
) -> WebhookReceiveResponse:
    payload_dict = payload.model_dump(exclude_none=True)

    payload_hash = _hash_payload(payload_dict)
    repository = WebhookRepository(db)

    existing = repository.get_by_payload_hash(source="loop", payload_hash=payload_hash)
    if existing:
        return WebhookReceiveResponse(status="accepted", duplicate=True, event_id=str(existing.id))

    event = repository.create_event(
        source="loop",
        payload_hash=payload_hash,
        payload=payload_dict,
        headers=None,
    )

    logger.info(
        "Webhook event received",
        extra={
            "source": "loop",
            "event_id": str(event.id),
            "payload_keys": sorted(payload_dict.keys()),
        },
    )

    processor = WebhookProcessingService(db)
    result = processor.process_loop_payload(payload_dict)
    if result.applied:
        repository.mark_processed(event)
        logger.info(
            "Webhook processed",
            extra={
                "source": "loop",
                "event_id": str(event.id),
                "transaction_id": result.transaction_id,
                "status": result.status.value if result.status else None,
                "reason": result.reason,
            },
        )
    else:
        repository.mark_failed(event, result.reason)
        logger.warning(
            "Webhook processing skipped",
            extra={
                "source": "loop",
                "event_id": str(event.id),
                "reason": result.reason,
            },
        )

    # TODO: Verify LOOP callback authenticity/signature.
    # TODO: Strengthen idempotency strategy with provider event IDs.
    # TODO: Add transaction reconciliation flow.

    return WebhookReceiveResponse(status="accepted", duplicate=False, event_id=str(event.id))
