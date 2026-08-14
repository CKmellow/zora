from fastapi import APIRouter, HTTPException, status

from app.integrations.loop.client import LoopHTTPClient
from app.integrations.loop.exceptions import LoopIntegrationError
from app.integrations.loop.payouts import LoopPayoutsAPI
from app.schemas.loop_payouts import (
    LoopPayoutResponse,
    LoopPayToRequestBody,
    LoopSendMoneyRequestBody,
)
from app.services.payout_service import PayoutService

router = APIRouter()


def _service() -> PayoutService:
    return PayoutService(LoopPayoutsAPI(LoopHTTPClient()))


@router.post("/send-money", response_model=LoopPayoutResponse)
async def send_money(payload: LoopSendMoneyRequestBody) -> LoopPayoutResponse:
    service = _service()
    try:
        response = await service.send_money(payload)
    except LoopIntegrationError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    return LoopPayoutResponse.model_validate(response)


@router.post("/pay-to", response_model=LoopPayoutResponse)
async def pay_to(payload: LoopPayToRequestBody) -> LoopPayoutResponse:
    service = _service()
    try:
        response = await service.pay_to(payload)
    except LoopIntegrationError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    return LoopPayoutResponse.model_validate(response)
