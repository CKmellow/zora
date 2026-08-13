from app.integrations.loop.payouts import LoopPayoutsAPI


class PayoutService:
    def __init__(self, loop_payouts_api: LoopPayoutsAPI):
        self.loop_payouts_api = loop_payouts_api

    async def trigger_payout(self) -> dict[str, str]:
        return {"message": "Payout flow not implemented yet"}
