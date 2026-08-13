from app.integrations.loop.client import LoopHTTPClient


class LoopPayoutsAPI:
    def __init__(self, client: LoopHTTPClient):
        self.client = client

    async def create_payout(self) -> dict[str, str]:
        # TODO: Implement LOOP payout call.
        return {"message": "LOOP payout not implemented"}
