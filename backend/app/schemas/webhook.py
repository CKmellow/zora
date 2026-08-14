from pydantic import BaseModel, ConfigDict


class LoopWebhookData(BaseModel):
    order_code: str | None = None
    external_reference: str | None = None
    provider_reference: str | None = None
    transaction_code: str | None = None
    status: str | None = None


class LoopWebhookRequest(BaseModel):
    event: str
    data: LoopWebhookData | dict = {}
    status: str | None = None
    order_code: str | None = None
    external_reference: str | None = None
    provider_reference: str | None = None
    transaction_code: str | None = None

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "event": "payment.completed",
                "data": {
                    "order_code": "ORD-1A4C385446"
                },
            }
        }
    )


class WebhookReceiveResponse(BaseModel):
    status: str
    duplicate: bool
    event_id: str
