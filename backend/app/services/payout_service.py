import secrets
from datetime import UTC, datetime

from app.core.config import get_settings
from app.integrations.loop.payouts import LoopPayoutsAPI, LoopPayToRequest, LoopSendMoneyRequest
from app.schemas.loop_payouts import LoopPayToRequestBody, LoopSendMoneyRequestBody


class PayoutService:
    def __init__(self, loop_payouts_api: LoopPayoutsAPI):
        self.loop_payouts_api = loop_payouts_api
        self.settings = get_settings()

    async def send_money(self, payload: LoopSendMoneyRequestBody) -> dict:
        if self.settings.loop_simulate_feature5:
            return self._simulate_send_money(payload)

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

    def _simulate_send_money(self, payload: LoopSendMoneyRequestBody) -> dict:
        now = datetime.now(UTC)
        request_ref = str(now.strftime("%H%M%S"))
        transfer_ref = f"SIM-{secrets.token_hex(8).upper()}"
        transfer_order_id = f"SIM{now.strftime('%Y%m%d')}{secrets.token_hex(6).upper()}"

        return {
            "status_code": 200,
            "message": "simulated send-money accepted (feature5)",
            "data": {
                "serviceTransactionStatus": "COMPLETED",
                "requestReference": request_ref,
                "txnReference": payload.txn_reference,
                "response": {
                    "transactionRef": transfer_ref,
                    "rspMessage": "SUCCESS",
                    "transferStatus": "S",
                    "transferOrderId": transfer_order_id,
                    "transferRefNo": secrets.token_hex(16),
                    "rspCode": "SIM00000",
                    "responseId": secrets.token_hex(16),
                    "simulated": True,
                    "channel": payload.channel.upper(),
                    "recipientMobileNo": payload.recipient_mobile_no,
                    "amount": f"{payload.amount:.2f}",
                    "purposeOfPayment": payload.purpose_of_payment,
                },
            },
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
