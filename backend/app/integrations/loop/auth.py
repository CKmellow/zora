"""OAuth client credentials helper for LOOP."""

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

import httpx

from app.core.config import Settings, get_settings
from app.integrations.loop.exceptions import LoopAuthError


@dataclass
class LoopTokenCache:
    access_token: str = ""
    expires_at: datetime | None = None

    def is_valid(self) -> bool:
        if not self.access_token or self.expires_at is None:
            return False
        return datetime.now(UTC) < self.expires_at


class LoopAuthClient:
    def __init__(self, settings: Settings | None = None):
        self.settings = settings or get_settings()
        self._cache = LoopTokenCache()

    async def get_access_token(self, client: httpx.AsyncClient) -> str:
        if self._cache.is_valid():
            return self._cache.access_token

        if not self.settings.loop_client_id or not self.settings.loop_client_secret:
            raise LoopAuthError("LOOP client credentials are not configured")

        # TODO: Wire exact LOOP OAuth token endpoint/body as documented.
        raise LoopAuthError("LOOP OAuth endpoint integration not implemented yet")

    def cache_token(self, access_token: str, expires_in_seconds: int) -> None:
        self._cache.access_token = access_token
        self._cache.expires_at = datetime.now(UTC) + timedelta(
            seconds=max(0, expires_in_seconds - 30)
        )
