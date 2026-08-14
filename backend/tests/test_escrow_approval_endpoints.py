from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


def _signup_payload(email: str) -> dict:
    return {
        "email": email,
        "password": "StrongPass123",
        "full_name": "Escrow User",
        "phone_number": "254700111222",
        "wants_to_buy": True,
        "wants_to_sell": True,
        "store_name": "Escrow Store",
        "till_number": "123456",
    }


def _unique_email(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex[:8]}@example.com"


def test_escrow_approval_flow_summary() -> None:
    client = TestClient(app)

    email1 = _unique_email("approval1")
    email2 = _unique_email("approval2")

    signup1 = client.post("/api/v1/auth/signup", json=_signup_payload(email1))
    signup2 = client.post("/api/v1/auth/signup", json=_signup_payload(email2))
    assert signup1.status_code == 200
    assert signup2.status_code == 200

    token1 = signup1.json()["access_token"]
    token2 = signup2.json()["access_token"]
    headers1 = {"Authorization": f"Bearer {token1}"}
    headers2 = {"Authorization": f"Bearer {token2}"}

    me1 = client.get("/api/v1/auth/me", headers=headers1)
    assert me1.status_code == 200

    stores = client.get("/api/v1/merchants/me", headers=headers1)
    assert stores.status_code == 200
    merchant_id = stores.json()[0]["id"]

    order = client.post(
        "/api/v1/orders",
        json={
            "merchant_id": merchant_id,
            "item_name": "Approval Item",
            "item_description": "Approval Item",
            "item_image_url": "https://example.com/item.png",
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
    transaction_id = pay.json()["transaction_id"]

    approval1 = client.post(
        f"/api/v1/escrow/transactions/{transaction_id}/approvals",
        headers=headers1,
        json={"decision": "approve", "note": "Looks good"},
    )
    assert approval1.status_code == 201

    approval2 = client.post(
        f"/api/v1/escrow/transactions/{transaction_id}/approvals",
        headers=headers2,
        json={"decision": "approve", "note": "Approved"},
    )
    assert approval2.status_code == 201

    summary = client.get(f"/api/v1/escrow/transactions/{transaction_id}/approvals/summary")
    assert summary.status_code == 200
    summary_body = summary.json()
    assert summary_body["approved_count"] == 2
    assert summary_body["settled_by_approval"] is True

    order_status = client.get(f"/api/v1/checkout/orders/{order_code}")
    assert order_status.status_code == 200
    assert order_status.json()["status"] == "SETTLED"
