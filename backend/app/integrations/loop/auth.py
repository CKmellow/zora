"""OAuth client credentials helper for LOOP."""

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Any

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

        # LOOP docs may expose either /oauth2/token or /gateway/auth/1.0/oauth2/token.
        candidate_paths = ["/oauth2/token", "/gateway/auth/1.0/oauth2/token"]
        last_error: LoopAuthError | None = None

        for path in candidate_paths:
            try:
                response = await client.post(
                    path,
                    auth=(self.settings.loop_client_id, self.settings.loop_client_secret),
                    headers={"Content-Type": "application/x-www-form-urlencoded"},
                    data={"grant_type": "client_credentials"},
                )
            except httpx.HTTPError as exc:
                last_error = LoopAuthError(f"LOOP auth network error on {path}: {exc}")
                continue

            if response.status_code >= 400:
                last_error = LoopAuthError(
                    f"LOOP auth failed on {path} with HTTP {response.status_code}: "
                    f"{response.text[:500]}"
                )
                continue

            payload = self._parse_json(response)
            access_token = str(payload.get("access_token", "")).strip()
            if not access_token:
                last_error = LoopAuthError(
                    f"LOOP auth response missing access_token on {path}: {payload}"
                )
                continue

            expires_in = self._parse_expires_in(payload)
            self.cache_token(access_token=access_token, expires_in_seconds=expires_in)
            return access_token

        if last_error is not None:
            raise last_error
        raise LoopAuthError("LOOP auth failed: no token endpoint candidate succeeded")

    def _parse_json(self, response: httpx.Response) -> dict[str, Any]:
        try:
            payload = response.json()
        except ValueError as exc:
            raise LoopAuthError(f"LOOP auth returned non-JSON response: {exc}") from exc
        if not isinstance(payload, dict):
            raise LoopAuthError("LOOP auth response must be a JSON object")
        return payload

    def _parse_expires_in(self, payload: dict[str, Any]) -> int:
        raw = payload.get("expires_in", 900)
        try:
            value = int(raw)
        except (TypeError, ValueError):
            return 900
        return value if value > 0 else 900

    def cache_token(self, access_token: str, expires_in_seconds: int) -> None:
        self._cache.access_token = access_token
        self._cache.expires_at = datetime.now(UTC) + timedelta(
            seconds=max(0, expires_in_seconds - 30)
        )
