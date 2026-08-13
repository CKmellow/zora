from app.core.config import Settings


def test_derives_jwks_from_supabase_url() -> None:
    settings = Settings(
        SUPABASE_URL="https://abcxyz.supabase.co",
        SUPABASE_JWKS_URL="",
        DATABASE_URL="postgresql+psycopg://test:test@localhost:5432/test",
    )
    assert settings.supabase_jwks_url == "https://abcxyz.supabase.co/auth/v1/.well-known/jwks.json"
