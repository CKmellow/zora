from app.integrations.loop.client import LoopHTTPClient


class LoopPaymentsAPI:
    def __init__(self, client: LoopHTTPClient):
        self.client = client

    async def prompt_payment(self) -> dict[str, str]:
        # TODO: Implement LOOP payment prompt call.
        return {"message": "LOOP payment prompt not implemented"}
