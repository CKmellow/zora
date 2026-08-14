import hashlib
import hmac
import secrets
from datetime import UTC, datetime, timedelta

import jwt

from app.core.config import Settings, get_settings

LOCAL_AUTH_ISSUER = "zora-local-auth"
LOCAL_AUTH_AUDIENCE = "zora-local-clients"
LOCAL_AUTH_EXPIRES_SECONDS = 60 * 60 * 12


def _auth_secret(settings: Settings) -> str:
    # For local-first auth mode, reuse loop signing secret if set, then fallback to DB URL.
    # This keeps startup simple in current environment without adding new mandatory env vars.
    if settings.loop_signing_secret:
        return settings.loop_signing_secret
    return settings.database_url or "zora-dev-secret"


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.sha256(f"{salt}:{password}".encode()).hexdigest()
    return f"sha256${salt}${digest}"


def verify_password(password: str, stored_hash: str | None) -> bool:
    if not stored_hash:
        return False
    try:
        algorithm, salt, digest = stored_hash.split("$", 2)
    except ValueError:
        return False
    if algorithm != "sha256":
        return False
    computed = hashlib.sha256(f"{salt}:{password}".encode()).hexdigest()
    return hmac.compare_digest(computed, digest)


def create_access_token(user_id: str, email: str, settings: Settings | None = None) -> str:
    config = settings or get_settings()
    now = datetime.now(UTC)
    payload = {
        "sub": user_id,
        "email": email,
        "aud": LOCAL_AUTH_AUDIENCE,
        "iss": LOCAL_AUTH_ISSUER,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(seconds=LOCAL_AUTH_EXPIRES_SECONDS)).timestamp()),
    }
    return jwt.encode(payload, _auth_secret(config), algorithm="HS256")


def decode_access_token(token: str, settings: Settings | None = None) -> dict:
    config = settings or get_settings()
    return jwt.decode(
        token,
        _auth_secret(config),
        algorithms=["HS256"],
        audience=LOCAL_AUTH_AUDIENCE,
        issuer=LOCAL_AUTH_ISSUER,
    )
