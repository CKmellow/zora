from pydantic import BaseModel


class WebhookReceiveResponse(BaseModel):
    status: str
    duplicate: bool
    event_id: str
