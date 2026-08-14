from functools import lru_cache

from pydantic import AnyHttpUrl, Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Zora Backend"
    app_env: str = "development"
    debug: bool = True
    api_v1_prefix: str = "/api/v1"

    database_url: str = Field(default="", alias="DATABASE_URL")

    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    supabase_jwks_url: str = ""

    loop_base_url: AnyHttpUrl = "https://sandbox.loop.co.ke"
    loop_client_id: str = ""
    loop_client_secret: str = ""
    loop_till: str = ""
    loop_signing_secret: str = ""
    loop_simulate_feature5: bool = False

    jwt_audience: str = ""
    jwt_issuer: str = ""

    webhook_base_url: str = ""
    frontend_url: str = "http://localhost:8081"
    cors_origins: str = "http://localhost:8081,http://localhost:3000"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @model_validator(mode="after")
    def derive_supabase_jwks_url(self) -> "Settings":
        if not self.supabase_jwks_url and self.supabase_url:
            base = self.supabase_url.rstrip("/")
            self.supabase_jwks_url = f"{base}/auth/v1/.well-known/jwks.json"
        return self

    @property
    def cors_origins_list(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]

    @property
    def jwt_verification_enabled(self) -> bool:
        return bool(self.supabase_jwks_url and self.jwt_audience and self.jwt_issuer)


@lru_cache
def get_settings() -> Settings:
    return Settings()
