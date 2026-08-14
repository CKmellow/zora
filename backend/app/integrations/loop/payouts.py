import hashlib
import hmac
import uuid
from datetime import UTC, datetime
from typing import Any

from app.integrations.loop.client import LoopHTTPClient
from app.integrations.loop.exceptions import LoopRequestError


class LoopPayoutsAPI:
    def __init__(self, client: LoopHTTPClient):
        self.client = client

    def _generate_signature(
        self, merchant_till: str, timestamp: str, nonce: str, secret_key: str
    ) -> str:
        """Computes lowercase-hex HMAC-SHA256 signature of 'merchantTill|timestamp|nonce'."""
        signing_string = f"{merchant_till}|{timestamp}|{nonce}"
        return hmac.new(
            secret_key.encode("utf-8"),
            signing_string.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest().lower()

    async def pay_to_mpesa_till(
        self,
        *,
        merchant_till: str,
        merchant_rcv_till: str,
        amount: str | float | int,
        secret_key: str,
        account_number: str | None = None,
        channel: str = "LOOP",
        txn_reference: str | None = None,
    ) -> dict[str, Any]:
        """Pay directly from a LOOP BIZ account to an M-Pesa buy-goods till."""
        txn_ref = txn_reference or str(uuid.uuid4()).lower()
        nonce = str(uuid.uuid4()).lower()
        timestamp = datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")
        rcv_account = account_number or merchant_rcv_till

        signature = self._generate_signature(
            merchant_till=merchant_till,
            timestamp=timestamp,
            nonce=nonce,
            secret_key=secret_key,
        )

        payload = {
            "serviceCode": "MRCHNT_PAYMENTS",
            "txnReference": txn_ref,
            "requestParameters": {
                "merchantTill": str(merchant_till),
                "merchantRcvTill": str(merchant_rcv_till),
                "accountNumber": str(rcv_account),
                "amount": str(amount),
                "channel": channel,
                "timestamp": timestamp,
                "nonce": nonce,
                "signature": signature,
            },
        }

        async for http_client in self.client.get_client():
            try:
                response = await http_client.post(
                    "/gateway/pay-to-mpesa-till/1.0/services/process-request",
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()

                # 1. Gateway status check
                status_code = data.get("statusCode")
                if status_code != 200:
                    error_msg = data.get("message", "Unknown gateway error")
                    raise LoopRequestError(
                        f"LOOP Pay to Till failed (statusCode {status_code}): {error_msg}"
                    )

                # 2. Transaction status check
                res_data = data.get("data", {})
                service_status = res_data.get("serviceTransactionStatus")
                rsp_code = (
                    res_data.get("response", {})
                    .get("responseDetails", {})
                    .get("rspCode")
                )

                if service_status != "COMPLETED" or rsp_code != "OGW00000":
                    raise LoopRequestError(
                        f"LOOP Pay to Till failed: status='{service_status}', rspCode='{rsp_code}'"
                    )

                return data

            except LoopRequestError:
                raise
            except Exception as exc:
                raise LoopRequestError("LOOP Pay to M-Pesa Till request failed") from exc

        raise LoopRequestError("LOOP HTTP client was not available")

    async def send_money_mpesa(
        self,
        *,
        merchant_till: str,
        recipient_mobile_no: str,
        amount: str | float | int,
        purpose_of_payment: str,
        secret_key: str,
        channel: str = "MPESA",
        txn_reference: str | None = None,
    ) -> dict[str, Any]:
        """Send money from a LOOP BIZ account directly to a recipient's M-Pesa mobile account."""
        txn_ref = txn_reference or str(uuid.uuid4()).lower()
        nonce = str(uuid.uuid4()).lower()
        timestamp = datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")

        signature = self._generate_signature(
            merchant_till=merchant_till,
            timestamp=timestamp,
            nonce=nonce,
            secret_key=secret_key,
        )

        payload = {
            "serviceCode": "MRCHNT_SENDMONEY",
            "txnReference": txn_ref,
            "requestParameters": {
                "channel": channel.upper(),
                "merchantTill": str(merchant_till),
                "recipientMobileNo": str(recipient_mobile_no),
                "amount": str(amount),
                "purposeOfPayment": purpose_of_payment,
                "timestamp": timestamp,
                "nonce": nonce,
                "signature": signature,
            },
        }

        async for http_client in self.client.get_client():
            try:
                response = await http_client.post(
                    "/gateway/send-money-mpesa/1.0/services/process-request",
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()

                # 1. Gateway status check
                status_code = data.get("statusCode")
                if status_code != 200:
                    error_msg = data.get("message", "Unknown error")
                    raise LoopRequestError(
                        f"LOOP Send Money failed (statusCode {status_code}): {error_msg}"
                    )

                # 2. Transaction status check
                res_data = data.get("data", {})
                service_status = res_data.get("serviceTransactionStatus")
                transfer_status = (
                    res_data.get("response", {}).get("transferStatus")
                )

                if service_status != "COMPLETED" or transfer_status != "S":
                    raise LoopRequestError(
                        f"LOOP Send Money execution unconfirmed: status='{service_status}', transferStatus='{transfer_status}'"
                    )

                return data

            except LoopRequestError:
                raise
            except Exception as exc:
                raise LoopRequestError("LOOP Send Money M-Pesa request failed") from exc

        raise LoopRequestError("LOOP HTTP client was not available")