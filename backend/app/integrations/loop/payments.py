import hashlib
import hmac
import uuid
from datetime import UTC, datetime
from typing import Any

from app.integrations.loop.client import LoopHTTPClient
from app.integrations.loop.exceptions import LoopRequestError


class LoopPaymentsAPI:
    def __init__(self, client: LoopHTTPClient):
        self.client = client

    def _generate_signature(self, till_no: str, timestamp: str, nonce: str, secret_key: str) -> str:
        """Computes the lowercase-hex HMAC-SHA256 signature of 'tillNo|timestamp|nonce'."""
        signing_string = f"{till_no}|{timestamp}|{nonce}"
        return hmac.new(
            secret_key.encode("utf-8"),
            signing_string.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest().lower()

    async def prompt_payment(
        self,
        *,
        till_no: str,
        phone_number: str,
        amount: str | float | int,
        ext_ref_no: str,
        callback_url: str,
        secret_key: str,
        txn_reference: str | None = None,
    ) -> dict[str, Any]:
        """Sends an M-Pesa prompt request to the customer's phone via LOOP API Manager.

        :param till_no: Merchant LOOP BIZ till number
        :param phone_number: Customer phone number (e.g. '0704540384' or '254704540384')
        :param amount: Amount to collect in KES
        :param ext_ref_no: External transaction reference for reconciliation
        :param callback_url: Webhook URL to receive final payment outcome
        :param secret_key: LOOP signing secret key for HMAC computation
        :param txn_reference: Unique UUID v4 for the request (auto-generated if omitted)
        :return: Standardized JSON dict from LOOP API
        """
        txn_ref = txn_reference or str(uuid.uuid4()).lower()
        nonce = str(uuid.uuid4()).lower()
        timestamp = datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")
        
        signature = self._generate_signature(
            till_no=till_no,
            timestamp=timestamp,
            nonce=nonce,
            secret_key=secret_key,
        )

        payload = {
            "serviceCode": "NEO_MRCHNT_STK",
            "txnReference": txn_ref,
            "requestParameters": {
                "tillNo": till_no,
                "payMblNo": str(phone_number),
                "amount": str(amount),
                "extRefNo": ext_ref_no,
                "callBackUrl": callback_url,
                "timestamp": timestamp,
                "nonce": nonce,
                "signature": signature,
            },
        }

        async for http_client in self.client.get_client():
            try:
                response = await http_client.post(
                    "/gateway/mpesa-prompt/2.0/services/process-request",
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()

                # LOOP returns HTTP 200 for logical failures — check the payload statusCode
                status_code = data.get("statusCode")
                if status_code != 200:
                    error_msg = data.get("message", "Unknown error")
                    raise LoopRequestError(
                        f"LOOP M-Pesa prompt failed (statusCode {status_code}): {error_msg}"
                    )

                return data

            except LoopRequestError:
                raise
            except Exception as exc:
                raise LoopRequestError("LOOP payment prompt request failed") from exc

        raise LoopRequestError("LOOP HTTP client was not available")

    def _generate_pay_till_signature(self, merchant_till: str, timestamp: str, nonce: str, secret_key: str) -> str:
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
        account_number: str | None = None,
        secret_key: str,
        channel: str = "LOOP",
        txn_reference: str | None = None,
    ) -> dict[str, Any]:
        """Pay directly from a LOOP BIZ account to an M-Pesa buy-goods till.

        This call is fully synchronous with no webhook callbacks.

        :param merchant_till: Your merchant till number sending the funds
        :param merchant_rcv_till: Destination M-Pesa buy-goods till number
        :param amount: Amount to pay in KES
        :param account_number: Reference associated with receiving till (defaults to merchant_rcv_till if omitted)
        :param secret_key: LOOP signing secret key for HMAC computation
        :param channel: Channel identifier required by gateway (defaults to 'LOOP')
        :param txn_reference: Unique UUID v4 for request (auto-generated if omitted)
        :return: Standardized JSON dict response from LOOP gateway
        """
        txn_ref = txn_reference or str(uuid.uuid4()).lower()
        nonce = str(uuid.uuid4()).lower()
        timestamp = datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")
        rcv_account = account_number or merchant_rcv_till

        signature = self._generate_pay_till_signature(
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

                # 1. Gateway Status Code Validation
                status_code = data.get("statusCode")
                if status_code != 200:
                    error_msg = data.get("message", "Unknown gateway error")
                    raise LoopRequestError(
                        f"LOOP Pay to Till failed (statusCode {status_code}): {error_msg}"
                    )

                # 2. Transaction Outcome Verification (Synchronous check)
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