"""Security helpers for Supabase JWT verification and auth dependencies."""

from functools import lru_cache

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import InvalidTokenError, PyJWKClient

from app.core.config import Settings, get_settings
from app.core.local_auth import decode_access_token

http_bearer = HTTPBearer(auto_error=False)


def extract_bearer_token(
    credentials: HTTPAuthorizationCredentials | None = Depends(http_bearer),
) -> str:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")

    if credentials.scheme.lower() != "bearer" or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid auth header")
    return credentials.credentials


@lru_cache
def get_jwks_client(jwks_url: str) -> PyJWKClient:
    return PyJWKClient(jwks_url)


def verify_supabase_jwt(token: str, settings: Settings) -> dict:
    if not settings.jwt_verification_enabled:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="JWT verification is not configured",
        )

    try:
        jwks_client = get_jwks_client(settings.supabase_jwks_url)
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=settings.jwt_audience,
            issuer=settings.jwt_issuer,
        )
        return payload
    except InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        ) from exc


def get_current_user_claims(
    token: str = Depends(extract_bearer_token),
    settings: Settings = Depends(get_settings),
) -> dict:
    return verify_supabase_jwt(token, settings)


def get_current_local_user_claims(token: str = Depends(extract_bearer_token)) -> dict:
    try:
        return decode_access_token(token)
    except InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        ) from exc


def get_optional_local_user_claims(
    credentials: HTTPAuthorizationCredentials | None = Depends(http_bearer),
) -> dict | None:
    if credentials is None:
        return None
    if credentials.scheme.lower() != "bearer" or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid auth header")
    try:
        return decode_access_token(credentials.credentials)
    except InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        ) from exc
