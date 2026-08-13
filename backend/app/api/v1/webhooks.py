import hashlib
import json

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.logging import get_logger
from app.repositories.webhook_repository import WebhookRepository
from app.schemas.webhook import WebhookReceiveResponse

router = APIRouter()
logger = get_logger(__name__)


def _hash_payload(payload: dict) -> str:
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


@router.post("/loop", response_model=WebhookReceiveResponse)
async def loop_webhook(request: Request, db: Session = Depends(get_db)) -> WebhookReceiveResponse:
    try:
        payload = await request.json()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid JSON payload"
        ) from exc

    if not isinstance(payload, dict):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Webhook payload must be JSON object"
        )

    payload_hash = _hash_payload(payload)
    repository = WebhookRepository(db)

    existing = repository.get_by_payload_hash(source="loop", payload_hash=payload_hash)
    if existing:
        return WebhookReceiveResponse(status="accepted", duplicate=True, event_id=str(existing.id))

    event = repository.create_event(
        source="loop",
        payload_hash=payload_hash,
        payload=payload,
        headers={
            "content-type": request.headers.get("content-type", ""),
            "user-agent": request.headers.get("user-agent", ""),
        },
    )

    logger.info(
        "Webhook event received",
        extra={"source": "loop", "event_id": str(event.id), "payload_keys": sorted(payload.keys())},
    )

    # TODO: Verify LOOP callback authenticity/signature.
    # TODO: Confirm LOOP callback schema and map payment outcomes.
    # TODO: Strengthen idempotency strategy with provider event IDs.
    # TODO: Add transaction reconciliation flow.

    return WebhookReceiveResponse(status="accepted", duplicate=False, event_id=str(event.id))
