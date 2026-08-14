from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


def _signup_payload(email: str) -> dict:
    return {
        "email": email,
        "password": "StrongPass123",
        "full_name": "Jane Doe",
        "phone_number": "254700111222",
        "wants_to_buy": True,
        "wants_to_sell": False,
    }


def _unique_email(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex[:8]}@example.com"


def test_signup_login_and_profile_upgrade_to_seller() -> None:
    client = TestClient(app)
    email = _unique_email("flow1")

    signup = client.post("/api/v1/auth/signup", json=_signup_payload(email))
    assert signup.status_code == 200
    signup_body = signup.json()
    assert signup_body["is_buyer"] is True
    assert signup_body["is_seller"] is False
    token = signup_body["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    me = client.get("/api/v1/auth/me", headers=headers)
    assert me.status_code == 200
    me_user = me.json()["user"]
    assert me_user["email"] == email
    assert me_user["is_buyer"] is True
    assert me_user["is_seller"] is False

    patch = client.patch(
        "/api/v1/auth/me",
        headers=headers,
        json={"is_seller": True},
    )
    assert patch.status_code == 200
    assert patch.json()["user"]["is_seller"] is True

    create_store = client.post(
        "/api/v1/merchants",
        headers=headers,
        json={
            "name": "Flow One Store",
            "email": "flow1@example.com",
            "phone_number": "254700111222",
            "till_number": "123456",
        },
    )
    assert create_store.status_code == 201

    list_stores = client.get("/api/v1/merchants/me", headers=headers)
    assert list_stores.status_code == 200
    stores = list_stores.json()
    assert len(stores) == 1
    assert stores[0]["name"] == "Flow One Store"


def test_signup_as_seller_creates_store_when_provided() -> None:
    client = TestClient(app)
    email = _unique_email("flow2")

    response = client.post(
        "/api/v1/auth/signup",
        json={
            "email": email,
            "password": "StrongPass123",
            "full_name": "Seller First",
            "phone_number": "254700999222",
            "wants_to_buy": True,
            "wants_to_sell": True,
            "store_name": "Seller First Store",
            "till_number": "765432",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["is_seller"] is True

    token = body["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    stores = client.get("/api/v1/merchants/me", headers=headers)
    assert stores.status_code == 200
    stores_body = stores.json()
    assert len(stores_body) == 1
    assert stores_body[0]["name"] == "Seller First Store"
    assert stores_body[0]["till_number"] == "765432"


def test_login_and_change_password() -> None:
    client = TestClient(app)
    email = _unique_email("flow3")

    signup = client.post("/api/v1/auth/signup", json=_signup_payload(email))
    assert signup.status_code == 200

    login = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "StrongPass123"},
    )
    assert login.status_code == 200

    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    change = client.post(
        "/api/v1/auth/change-password",
        headers=headers,
        json={
            "current_password": "StrongPass123",
            "new_password": "EvenStronger456",
        },
    )
    assert change.status_code == 204

    old_login = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "StrongPass123"},
    )
    assert old_login.status_code == 401

    new_login = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "EvenStronger456"},
    )
    assert new_login.status_code == 200
