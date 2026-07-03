import os

from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    VITE_SUPABASE_URL: str = ""
    VITE_SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    JWT_SECRET: str = os.getenv("JWT_SECRET", "supersecretkey_please_change_in_production")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @computed_field
    @property
    def supabase_url(self) -> str:
        return self.VITE_SUPABASE_URL.rstrip("/").removesuffix("/rest/v1")

    @computed_field
    @property
    def supabase_service_role_key(self) -> str:
        return self.SUPABASE_SERVICE_ROLE_KEY or self.VITE_SUPABASE_ANON_KEY

settings = Settings()
