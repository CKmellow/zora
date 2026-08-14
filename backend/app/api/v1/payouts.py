from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.integrations.loop.client import LoopHTTPClient
from app.integrations.loop.exceptions import LoopRequestError
from app.integrations.loop.payouts import LoopPayoutsAPI

router = APIRouter()


def get_loop_http_client() -> LoopHTTPClient:
    return LoopHTTPClient()


# --- Pydantic Schemas ---

class PayToTillRequest(BaseModel):
    merchant_till: str = Field(default="133239", description="Source merchant till")
    merchant_rcv_till: str = Field(default="247247", description="Destination M-Pesa buy-goods till")
    amount: str = Field(default="350", description="Amount in KES")
    secret_key: str = Field(
        default="hyqd7bwMr9Kv-C5PW4n7uF4TiMnMp_hyvyhYYkYlcU8",
        description="Sandbox secret key",
    )
    account_number: str | None = None


class SendMoneyMpesaRequest(BaseModel):
    merchant_till: str = Field(default="133239", description="Source merchant till")
    recipient_mobile_no: str = Field(default="254705568254", description="Recipient M-Pesa phone number")
    amount: str = Field(default="1500.00", description="Amount in KES")
    purpose_of_payment: str = Field(default="Refund for order INV-2026-000123", description="Reason for payout")
    secret_key: str = Field(
        default="hyqd7bwMr9Kv-C5PW4n7uF4TiMnMp_hyvyhYYkYlcU8",
        description="Sandbox secret key",
    )


# --- API Routes ---

# 1st Route: Pay to M-Pesa Till
@router.post("/pay-to-till")
async def pay_to_till(
    payload: PayToTillRequest,
    client: LoopHTTPClient = Depends(get_loop_http_client),
) -> dict[str, Any]:
    """Pay directly from LOOP BIZ account to an M-Pesa buy-goods till."""
    payout_api = LoopPayoutsAPI(client=client)
    try:
        return await payout_api.pay_to_mpesa_till(
            merchant_till=payload.merchant_till,
            merchant_rcv_till=payload.merchant_rcv_till,
            amount=payload.amount,
            secret_key=payload.secret_key,
            account_number=payload.account_number,
        )
    except LoopRequestError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err),
        )


# 2nd Route: Send Money (M-Pesa)
@router.post("/send-money-mpesa")
async def send_money_mpesa(
    payload: SendMoneyMpesaRequest,
    client: LoopHTTPClient = Depends(get_loop_http_client),
) -> dict[str, Any]:
    """Send money directly from LOOP BIZ account to recipient's M-Pesa account."""
    payout_api = LoopPayoutsAPI(client=client)
    try:
        return await payout_api.send_money_mpesa(
            merchant_till=payload.merchant_till,
            recipient_mobile_no=payload.recipient_mobile_no,
            amount=payload.amount,
            purpose_of_payment=payload.purpose_of_payment,
            secret_key=payload.secret_key,
        )
    except LoopRequestError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err),
        )