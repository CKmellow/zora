from dataclasses import dataclass
from decimal import Decimal
from typing import Any

from app.core.config import get_settings
from app.integrations.loop.auth import LoopAuthClient
from app.integrations.loop.client import LoopHTTPClient
from app.integrations.loop.exceptions import LoopRequestError
from app.integrations.loop.signatures import generate_nonce, generate_timestamp, sign


@dataclass
class LoopPromptRequest:
    txn_reference: str
    mobile_no: str
    amount: Decimal
    reason: str
    callback_url: str
    merchant_till: str | None = None


class LoopPaymentsAPI:
    def __init__(self, client: LoopHTTPClient):
        self.client = client
        self.settings = get_settings()
        self.auth_client = LoopAuthClient(self.settings)

    async def prompt_payment(self, payload: LoopPromptRequest) -> dict[str, Any]:
        till = payload.merchant_till or self.settings.loop_till
        if not till:
            raise LoopRequestError("merchant till is required for LOOP prompt")
        if not self.settings.loop_signing_secret:
            raise LoopRequestError("LOOP signing secret is not configured")

        timestamp = generate_timestamp()
        nonce = generate_nonce()
        signature = sign(till, timestamp, nonce, self.settings.loop_signing_secret)

        request_body = {
            "serviceCode": "NEO_MRCHNT_RTP",
            "txnReference": payload.txn_reference,
            "requestParameters": {
                "merchantTill": till,
                "mobileNo": payload.mobile_no,
                "amount": f"{payload.amount:.2f}",
                "reason": payload.reason,
                "callBackUrl": payload.callback_url,
                "timestamp": timestamp,
                "nonce": nonce,
                "signature": signature,
            },
        }

        async for http_client in self.client.get_client():
            access_token = await self.auth_client.get_access_token(http_client)
            response = await http_client.post(
                "/gateway/loop-prompt/2/services/process-request",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json",
                    "X-Loop-Version": "2024-01",
                },
                json=request_body,
            )

            parsed = self._parse_response(response)
            self._ensure_success(parsed)
            return parsed

        raise LoopRequestError("LOOP prompt client unavailable")

    def _parse_response(self, response: Any) -> dict[str, Any]:
        try:
            body = response.json()
        except ValueError as exc:
            raise LoopRequestError(f"LOOP prompt returned non-JSON response: {exc}") from exc
        if not isinstance(body, dict):
            raise LoopRequestError("LOOP prompt response must be a JSON object")
        return body

    def _ensure_success(self, payload: dict[str, Any]) -> None:
        status_code = payload.get("statusCode")
        if status_code != 200:
            message = payload.get("message", "Unknown LOOP prompt error")
            raise LoopRequestError(f"LOOP prompt failed with statusCode={status_code}: {message}")
