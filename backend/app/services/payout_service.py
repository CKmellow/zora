from app.integrations.loop.payouts import LoopPayoutsAPI, LoopPayToRequest, LoopSendMoneyRequest
from app.schemas.loop_payouts import LoopPayToRequestBody, LoopSendMoneyRequestBody


class PayoutService:
    def __init__(self, loop_payouts_api: LoopPayoutsAPI):
        self.loop_payouts_api = loop_payouts_api

    async def send_money(self, payload: LoopSendMoneyRequestBody) -> dict:
        response = await self.loop_payouts_api.send_money(
            LoopSendMoneyRequest(
                txn_reference=payload.txn_reference,
                recipient_mobile_no=payload.recipient_mobile_no,
                amount=payload.amount,
                purpose_of_payment=payload.purpose_of_payment,
                channel=payload.channel,
                merchant_till=payload.merchant_till,
            )
        )
        return {
            "status_code": int(response.get("statusCode", 0)),
            "message": str(response.get("message", "")),
            "data": response.get("data", {}),
        }

    async def pay_to(self, payload: LoopPayToRequestBody) -> dict:
        response = await self.loop_payouts_api.pay_to(
            LoopPayToRequest(
                txn_reference=payload.txn_reference,
                merchant_rcv_till=payload.merchant_rcv_till,
                account_number=payload.account_number,
                amount=payload.amount,
                channel=payload.channel,
                merchant_till=payload.merchant_till,
            )
        )
        return {
            "status_code": int(response.get("statusCode", 0)),
            "message": str(response.get("message", "")),
            "data": response.get("data", {}),
        }
