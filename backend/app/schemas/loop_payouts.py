from decimal import Decimal

from pydantic import BaseModel, Field


class LoopSendMoneyRequestBody(BaseModel):
    txn_reference: str = Field(min_length=6, max_length=128)
    recipient_mobile_no: str = Field(min_length=8, max_length=16)
    amount: Decimal = Field(gt=0)
    purpose_of_payment: str = Field(min_length=2, max_length=255)
    channel: str = Field(description="LOOP, MPESA, or PESALINK")
    merchant_till: str | None = Field(default=None, max_length=64)


class LoopPayToRequestBody(BaseModel):
    txn_reference: str = Field(min_length=6, max_length=128)
    merchant_rcv_till: str = Field(min_length=2, max_length=64)
    account_number: str = Field(min_length=1, max_length=64)
    amount: Decimal = Field(gt=0)
    channel: str = Field(description="LOOP, MPESATILL, or MPESAPAYBILL")
    merchant_till: str | None = Field(default=None, max_length=64)


class LoopPayoutResponse(BaseModel):
    status_code: int
    message: str
    data: dict
