from sqlalchemy.orm import Session

from app.models.webhook_event import WebhookEvent


class WebhookRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_payload_hash(self, source: str, payload_hash: str) -> WebhookEvent | None:
        return (
            self.db.query(WebhookEvent)
            .filter(WebhookEvent.source == source, WebhookEvent.payload_hash == payload_hash)
            .first()
        )

    def create_event(
        self,
        source: str,
        payload_hash: str,
        payload: dict,
        headers: dict | None,
    ) -> WebhookEvent:
        event = WebhookEvent(
            source=source, payload_hash=payload_hash, payload=payload, headers=headers
        )
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def mark_processed(self, event: WebhookEvent) -> WebhookEvent:
        event.processed = True
        event.processing_error = None
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def mark_failed(self, event: WebhookEvent, error: str) -> WebhookEvent:
        event.processed = False
        event.processing_error = error
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event
