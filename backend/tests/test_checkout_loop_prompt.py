from uuid import uuid4

from fastapi.testclient import TestClient

from app.integrations.loop.payments import LoopPaymentsAPI
from app.main import app


def _signup_payload(email: str) -> dict:
    return {
        "email": email,
        "password": "StrongPass123",
        "full_name": "Checkout User",
        "phone_number": "254700111222",
        "wants_to_buy": True,
        "wants_to_sell": True,
        "store_name": "Checkout Store",
        "till_number": "133239",
    }


def _unique_email(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex[:8]}@example.com"


def test_checkout_pay_calls_loop_prompt(monkeypatch) -> None:
    client = TestClient(app)

    captured = {}

    async def _fake_prompt_payment(self, payload):
        captured["payload"] = payload
        return {
            "statusCode": 200,
            "message": "service process accepted",
            "data": {
                "response": {
                    "transactionRef": "TXN-LOOP-456",
                }
            },
        }

    monkeypatch.setattr(LoopPaymentsAPI, "prompt_payment", _fake_prompt_payment)

    email = _unique_email("checkout")
    signup = client.post("/api/v1/auth/signup", json=_signup_payload(email))
    assert signup.status_code == 200

    token = signup.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    stores = client.get("/api/v1/merchants/me", headers=headers)
    assert stores.status_code == 200
    merchant_id = stores.json()[0]["id"]

    order = client.post(
        "/api/v1/orders",
        json={
            "merchant_id": merchant_id,
            "item_name": "Phone",
            "item_description": "Nice phone",
            "item_image_url": "https://example.com/phone.png",
            "amount": 100,
            "currency": "KES",
            "buyer_name": "Buyer",
            "buyer_phone": "254700000000",
        },
    )
    assert order.status_code == 200
    order_code = order.json()["order_code"]

    pay = client.post(
        f"/api/v1/checkout/orders/{order_code}/pay",
        json={"phone_number": "254700000000"},
    )
    assert pay.status_code == 200

    body = pay.json()
    assert body["loop_status_code"] == 200
    assert body["loop_reference"] == "TXN-LOOP-456"
    assert "payload" in captured
    assert captured["payload"].mobile_no == "254700000000"
