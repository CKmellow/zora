from app.integrations.loop.client import LoopHTTPClient


class LoopInquiriesAPI:
    def __init__(self, client: LoopHTTPClient):
        self.client = client

    async def transaction_status(self) -> dict[str, str]:
        # TODO: Implement LOOP transaction status inquiry.
        return {"message": "LOOP transaction inquiry not implemented"}
