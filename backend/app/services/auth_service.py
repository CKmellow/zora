class AuthService:
    async def describe_auth_state(self) -> dict[str, str]:
        return {"message": "Supabase JWT verification is configured via JWKS"}
