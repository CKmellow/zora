"""LOOP HMAC-SHA256 signing utilities."""

import hmac
import secrets
from datetime import UTC, datetime
from hashlib import sha256


def generate_timestamp() -> str:
    return datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def generate_nonce() -> str:
    return secrets.token_hex(16)


def sign(till_value: str, timestamp: str, nonce: str, secret: str) -> str:
    """Return lowercase hex HMAC-SHA256 for '{till_value}|{timestamp}|{nonce}'."""
    message = f"{till_value}|{timestamp}|{nonce}"
    return hmac.new(secret.encode("utf-8"), message.encode("utf-8"), sha256).hexdigest()
