from pydantic_settings import BaseSettings
from pydantic import field_validator, Field
from typing import List
import sys
import secrets


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = Field(default="sqlite:///alera.db", description="Database connection URL")
    DATABASE_ECHO: bool = False

    # Redis
    REDIS_URL: str = Field(default="redis://localhost:6379/0", description="Redis connection URL")

    # Security - Generate a strong default if not provided
    SECRET_KEY: str = Field(
        default_factory=lambda: secrets.token_urlsafe(32),
        description="Secret key for JWT tokens - MUST be set in production"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 24

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://alera-typescript.vercel.app"
    ]
    CORS_ORIGIN_REGEX: str = r"https://.*\.vercel\.app"

    # Email
    SENDGRID_API_KEY: str = ""
    SENDGRID_FROM_EMAIL: str = "noreply@alera.health"

    # SMS
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""

    # Environment
    ENVIRONMENT: str = Field(default="development", description="Environment: development, staging, or production")
    DEBUG: bool = Field(default=True, description="Debug mode flag")

    # WebRTC
    AGORA_APP_ID: str = ""
    AGORA_APP_CERTIFICATE: str = ""

    # HIPAA
    ENCRYPTION_KEY: str = ""
    AUDIT_LOG_RETENTION_DAYS: int = 2555

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"  # Allow extra fields from environment variables

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug_flag(cls, value):
        if isinstance(value, bool):
            return value

        if value is None:
            return False

        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"1", "true", "yes", "on", "debug", "development", "dev"}:
                return True
            if normalized in {"0", "false", "no", "off", "release", "production", "prod"}:
                return False

        return bool(value)


settings = Settings()

# Keep both import styles pointing at the same module.
sys.modules.setdefault("config", sys.modules[__name__])
sys.modules.setdefault("backend.config", sys.modules[__name__])
