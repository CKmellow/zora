from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field

from app.enums.transaction_status import TransactionStatus


class OrderCreate(BaseModel):
    merchant_id: UUID
    item_name: str = Field(min_length=2, max_length=255)
    item_description: str | None = None
    item_image_url: str | None = None
    amount: Decimal = Field(gt=0)
    currency: str = Field(default="KES", min_length=3, max_length=3)
    buyer_name: str | None = None
    buyer_phone: str | None = None


class OrderRead(BaseModel):
    id: UUID
    merchant_id: UUID
    order_code: str
    item_name: str
    item_description: str | None
    item_image_url: str | None
    amount: Decimal
    currency: str
    buyer_name: str | None
    buyer_phone: str | None
    status: TransactionStatus
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PublicOrderRead(BaseModel):
    order_code: str
    item_name: str
    item_description: str | None
    item_image_url: str | None
    amount: Decimal
    currency: str
    buyer_name: str | None
    status: TransactionStatus


class CheckoutPayRequest(BaseModel):
    phone_number: str = Field(min_length=8, max_length=16)


class CheckoutPayResponse(BaseModel):
    order_code: str
    transaction_id: str
    transaction_status: TransactionStatus
    message: str
