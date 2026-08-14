from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.main import app
from app.services.payout_service import PayoutService


def test_loop_send_money_endpoint(monkeypatch) -> None:
    client = TestClient(app)

    async def _fake_send_money(self, payload):
        return {
            "status_code": 200,
            "message": "service process accepted",
            "data": {
                "serviceTransactionStatus": "COMPLETED",
                "txnReference": payload.txn_reference,
            },
        }

    monkeypatch.setattr(PayoutService, "send_money", _fake_send_money)

    response = client.post(
        "/api/v1/loop/send-money",
        json={
            "txn_reference": "txn-send-001",
            "recipient_mobile_no": "254700123456",
            "amount": "100.00",
            "purpose_of_payment": "Supplier settlement",
            "channel": "LOOP",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["status_code"] == 200
    assert body["data"]["serviceTransactionStatus"] == "COMPLETED"


def test_loop_send_money_simulation_mode(monkeypatch) -> None:
    client = TestClient(app)

    monkeypatch.setattr(get_settings(), "loop_simulate_feature5", True)

    response = client.post(
        "/api/v1/loop/send-money",
        json={
            "txn_reference": "txn-send-sim-001",
            "recipient_mobile_no": "254700123456",
            "amount": "100.00",
            "purpose_of_payment": "Supplier settlement",
            "channel": "LOOP",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["status_code"] == 200
    assert body["message"] == "simulated send-money accepted (feature5)"
    assert body["data"]["response"]["simulated"] is True


def test_loop_pay_to_endpoint(monkeypatch) -> None:
    client = TestClient(app)

    async def _fake_pay_to(self, payload):
        return {
            "status_code": 200,
            "message": "service process accepted",
            "data": {
                "serviceTransactionStatus": "COMPLETED",
                "txnReference": payload.txn_reference,
            },
        }

    monkeypatch.setattr(PayoutService, "pay_to", _fake_pay_to)

    response = client.post(
        "/api/v1/loop/pay-to",
        json={
            "txn_reference": "txn-payto-001",
            "merchant_rcv_till": "247247",
            "account_number": "INV-123",
            "amount": "350.00",
            "channel": "MPESAPAYBILL",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["status_code"] == 200
    assert body["data"]["serviceTransactionStatus"] == "COMPLETED"
