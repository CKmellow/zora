from collections.abc import AsyncGenerator

import httpx

from app.core.config import get_settings


class LoopHTTPClient:
    """Reusable async client for LOOP APIs."""

    def __init__(self) -> None:
        settings = get_settings()
        self.base_url = str(settings.loop_base_url)
        self.timeout = 30.0

    async def get_client(self) -> AsyncGenerator[httpx.AsyncClient, None]:
        async with httpx.AsyncClient(base_url=self.base_url, timeout=self.timeout) as client:
            yield client
