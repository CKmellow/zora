from app.integrations.loop.payments import LoopPaymentsAPI


class PaymentService:
    def __init__(self, loop_payments_api: LoopPaymentsAPI):
        self.loop_payments_api = loop_payments_api

    async def initiate_payment(self) -> dict[str, str]:
        return {"message": "Payment initiation not implemented yet"}
