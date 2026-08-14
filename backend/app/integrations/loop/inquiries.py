from dataclasses import dataclass
from typing import Any

from app.core.config import get_settings
from app.integrations.loop.auth import LoopAuthClient
from app.integrations.loop.client import LoopHTTPClient
from app.integrations.loop.exceptions import LoopRequestError
from app.integrations.loop.signatures import generate_nonce, generate_timestamp, sign


@dataclass
class LoopTransactionInquiryRequest:
    envelope_txn_reference: str
    original_txn_reference: str
    merchant_till: str | None = None


class LoopInquiriesAPI:
    def __init__(self, client: LoopHTTPClient):
        self.client = client
        self.settings = get_settings()
        self.auth_client = LoopAuthClient(self.settings)

    async def transaction_status(self, payload: LoopTransactionInquiryRequest) -> dict[str, Any]:
        till = payload.merchant_till or self.settings.loop_till
        if not till:
            raise LoopRequestError("merchant till is required for transaction inquiry")
        if not self.settings.loop_signing_secret:
            raise LoopRequestError("LOOP signing secret is not configured")

        timestamp = generate_timestamp()
        nonce = generate_nonce()
        signature = sign(till, timestamp, nonce, self.settings.loop_signing_secret)

        request_body = {
            "serviceCode": "MRCHNT_TXN_INQUIRY",
            "txnReference": payload.envelope_txn_reference,
            "requestParameters": {
                "merchantTill": till,
                "txnReference": payload.original_txn_reference,
                "timestamp": timestamp,
                "nonce": nonce,
                "signature": signature,
            },
        }

        async for http_client in self.client.get_client():
            access_token = await self.auth_client.get_access_token(http_client)
            response = await http_client.post(
                "/gateway/transaction-inquiry/1.0.0/services/process-request",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json",
                },
                json=request_body,
            )

            parsed = self._parse_response(response)
            self._ensure_success(parsed)
            return parsed

        raise LoopRequestError("LOOP inquiry client unavailable")

    def _parse_response(self, response: Any) -> dict[str, Any]:
        try:
            body = response.json()
        except ValueError as exc:
            raise LoopRequestError(f"LOOP inquiry returned non-JSON response: {exc}") from exc
        if not isinstance(body, dict):
            raise LoopRequestError("LOOP inquiry response must be a JSON object")
        return body

    def _ensure_success(self, payload: dict[str, Any]) -> None:
        status_code = payload.get("statusCode")
        if status_code != 200:
            message = payload.get("message", "Unknown LOOP inquiry error")
            raise LoopRequestError(
                f"LOOP inquiry failed with statusCode={status_code}: {message}"
            )
