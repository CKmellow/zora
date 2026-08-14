from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


def _signup_payload(email: str) -> dict:
    return {
        "email": email,
        "password": "StrongPass123",
        "full_name": "Otp User",
        "phone_number": "254700111222",
        "wants_to_buy": True,
        "wants_to_sell": False,
    }


def _unique_email(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex[:8]}@example.com"


def test_issue_and_verify_otp() -> None:
    client = TestClient(app)

    email = _unique_email("otp")
    signup = client.post("/api/v1/auth/signup", json=_signup_payload(email))
    assert signup.status_code == 200

    token = signup.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    issue = client.post(
        "/api/v1/auth/otp/issue",
        headers=headers,
        json={
            "subject": "+254700111222",
            "purpose": "login",
            "channel": "sms",
        },
    )
    assert issue.status_code == 200
    body = issue.json()
    assert "challenge_id" in body
    assert body["attempts_remaining"] == 3
    assert "Dev code:" in body["message"]

    code = body["message"].split("Dev code:")[-1].strip()
    verify = client.post(
        "/api/v1/auth/otp/verify",
        json={
            "challenge_id": body["challenge_id"],
            "code": code,
        },
    )
    assert verify.status_code == 200
    verify_body = verify.json()
    assert verify_body["verified"] is True
