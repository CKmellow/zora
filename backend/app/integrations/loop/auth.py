"""OAuth client credentials helper for LOOP."""

import base64
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
        # Buffer of 30s to prevent token expiration mid-request
        return datetime.now(UTC) < self.expires_at


class LoopAuthClient:
    def __init__(self, settings: Settings | None = None):
        self.settings = settings or get_settings()
        self._cache = LoopTokenCache()

    def _get_basic_auth_header(self) -> str:
        """Encodes consumer_key:consumer_secret into Base64 format."""
        key = self.settings.loop_client_id
        secret = self.settings.loop_client_secret
        raw_credentials = f"{key}:{secret}"
        encoded_credentials = base64.b64encode(raw_credentials.encode("utf-8")).decode("utf-8")
        return f"Basic {encoded_credentials}"

    async def get_access_token(self, client: httpx.AsyncClient) -> str:
        """Retrieves a cached token or requests a new one from Loop API Manager."""
        if self._cache.is_valid():
            return self._cache.access_token

        if not self.settings.loop_client_id or not self.settings.loop_client_secret:
            raise LoopAuthError("LOOP client credentials are not configured")

        token_url = f"{self.settings.loop_base_url.rstrip('/')}/gateway/auth/1.0/oauth2/token"
        
        headers = {
            "Authorization": self._get_basic_auth_header(),
            "Content-Type": "application/x-www-form-urlencoded",
        }
        
        data = {
            "grant_type": "client_credentials"
        }

        try:
            response = await client.post(token_url, headers=headers, data=data, timeout=10.0)
            
            # If the gateway requires JSON body instead of form-urlencoded
            if response.status_code == 400 and "invalid_request" in response.text:
                response = await client.post(
                    token_url,
                    headers={**headers, "Content-Type": "application/json"},
                    json=data,
                    timeout=10.0,
                )

            if response.status_code != 200:
                error_data = response.json() if response.headers.get("content-type") == "application/json" else {}
                error_desc = error_data.get("error_description") or response.text
                raise LoopAuthError(
                    f"Failed to obtain LOOP OAuth token (HTTP {response.status_code}): {error_desc}"
                )

            payload = response.json()
            access_token = payload.get("access_token")
            expires_in = payload.get("expires_in", 3600)

            if not access_token:
                raise LoopAuthError("LOOP OAuth response missing 'access_token'")

            # Store in cache
            self.cache_token(access_token, int(expires_in))
            return access_token

        except httpx.RequestError as exc:
            raise LoopAuthError(f"Network error while authenticating with LOOP: {exc}") from exc

    def cache_token(self, access_token: str, expires_in_seconds: int) -> None:
        self._cache.access_token = access_token
        # Deduct 30 seconds buffer time to ensure validity
        self._cache.expires_at = datetime.now(UTC) + timedelta(
            seconds=max(0, expires_in_seconds - 30)
        )