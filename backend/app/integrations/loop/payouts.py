from dataclasses import dataclass
from decimal import Decimal
from typing import Any

from app.core.config import get_settings
from app.integrations.loop.auth import LoopAuthClient
from app.integrations.loop.client import LoopHTTPClient
from app.integrations.loop.exceptions import LoopRequestError
from app.integrations.loop.signatures import generate_nonce, generate_timestamp, sign


@dataclass
class LoopSendMoneyRequest:
    txn_reference: str
    recipient_mobile_no: str
    amount: Decimal
    purpose_of_payment: str
    channel: str
    merchant_till: str | None = None


@dataclass
class LoopPayToRequest:
    txn_reference: str
    merchant_rcv_till: str
    account_number: str
    amount: Decimal
    channel: str
    merchant_till: str | None = None


class LoopPayoutsAPI:
    def __init__(self, client: LoopHTTPClient):
        self.client = client
        self.settings = get_settings()
        self.auth_client = LoopAuthClient(self.settings)

    async def send_money(self, payload: LoopSendMoneyRequest) -> dict[str, Any]:
        till = payload.merchant_till or self.settings.loop_till
        if not till:
            raise LoopRequestError("merchant till is required for send-money")

        request_body = self._build_signed_send_money_body(payload=payload, merchant_till=till)
        endpoint = self._send_money_endpoint(payload.channel)
        return await self._post_with_auth(endpoint=endpoint, request_body=request_body)

    async def pay_to(self, payload: LoopPayToRequest) -> dict[str, Any]:
        till = payload.merchant_till or self.settings.loop_till
        if not till:
            raise LoopRequestError("merchant till is required for pay-to")

        request_body = self._build_signed_pay_to_body(payload=payload, merchant_till=till)
        endpoint = self._pay_to_endpoint(payload.channel)
        return await self._post_with_auth(endpoint=endpoint, request_body=request_body)

    async def _post_with_auth(self, endpoint: str, request_body: dict[str, Any]) -> dict[str, Any]:
        if not self.settings.loop_signing_secret:
            raise LoopRequestError("LOOP signing secret is not configured")

        async for http_client in self.client.get_client():
            access_token = await self.auth_client.get_access_token(http_client)
            response = await http_client.post(
                endpoint,
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json",
                    "X-Loop-Version": "2024-01",
                },
                json=request_body,
            )
            parsed = self._parse_response(response)
            self._ensure_success(parsed, endpoint)
            return parsed

        raise LoopRequestError("LOOP payout client unavailable")

    def _build_signed_send_money_body(
        self,
        payload: LoopSendMoneyRequest,
        merchant_till: str,
    ) -> dict[str, Any]:
        timestamp = generate_timestamp()
        nonce = generate_nonce()
        signature = sign(merchant_till, timestamp, nonce, self.settings.loop_signing_secret)
        return {
            "serviceCode": "MRCHNT_SENDMONEY",
            "txnReference": payload.txn_reference,
            "requestParameters": {
                "channel": payload.channel.upper(),
                "merchantTill": merchant_till,
                "recipientMobileNo": payload.recipient_mobile_no,
                "amount": f"{payload.amount:.2f}",
                "purposeOfPayment": payload.purpose_of_payment,
                "timestamp": timestamp,
                "nonce": nonce,
                "signature": signature,
            },
        }

    def _build_signed_pay_to_body(
        self,
        payload: LoopPayToRequest,
        merchant_till: str,
    ) -> dict[str, Any]:
        timestamp = generate_timestamp()
        nonce = generate_nonce()
        signature = sign(merchant_till, timestamp, nonce, self.settings.loop_signing_secret)
        return {
            "serviceCode": "MRCHNT_PAYMENTS",
            "txnReference": payload.txn_reference,
            "requestParameters": {
                "merchantTill": merchant_till,
                "merchantRcvTill": payload.merchant_rcv_till,
                "accountNumber": payload.account_number,
                "amount": f"{payload.amount:.2f}",
                "channel": payload.channel.upper(),
                "timestamp": timestamp,
                "nonce": nonce,
                "signature": signature,
            },
        }

    def _send_money_endpoint(self, channel: str) -> str:
        normalized = channel.upper()
        mapping = {
            "LOOP": "/gateway/send-money-loop/1.0/services/process-service-request2",
            "MPESA": "/gateway/send-money-mpesa/1.0/services/process-request",
            "PESALINK": "/gateway/send-money-pesalink/1.0/services/process-request",
        }
        endpoint = mapping.get(normalized)
        if endpoint is None:
            raise LoopRequestError(f"Unsupported send-money channel: {channel}")
        return endpoint

    def _pay_to_endpoint(self, channel: str) -> str:
        normalized = channel.upper()
        mapping = {
            "LOOP": "/gateway/pay-to-looptill/1.0/services/process-request",
            "MPESATILL": "/gateway/pay-to-mpesa-till/1.0/services/process-request",
            "MPESAPAYBILL": "/gateway/pay-to-paybill/1.0/services/process-request",
        }
        endpoint = mapping.get(normalized)
        if endpoint is None:
            raise LoopRequestError(f"Unsupported pay-to channel: {channel}")
        return endpoint

    def _parse_response(self, response: Any) -> dict[str, Any]:
        try:
            body = response.json()
        except ValueError as exc:
            raise LoopRequestError(f"LOOP payout returned non-JSON response: {exc}") from exc
        if not isinstance(body, dict):
            raise LoopRequestError("LOOP payout response must be a JSON object")
        return body

    def _ensure_success(self, payload: dict[str, Any], endpoint: str) -> None:
        status_code = payload.get("statusCode")
        if status_code != 200:
            message = payload.get("message", "Unknown LOOP payout error")
            raise LoopRequestError(
                f"LOOP endpoint {endpoint} failed with statusCode={status_code}: {message}"
            )
