from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator, Field
from typing import List
import sys
import secrets
import os

# Set default environment
os.environ.setdefault('ENVIRONMENT', 'production')


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
        "https://alera-typescript.vercel.app",
        "https://alera-gamma.vercel.app"
    ]
    CORS_ORIGIN_REGEX: str = r"https://.*\.vercel\.app"

    # Email
    SENDGRID_API_KEY: str = ""
    SENDGRID_FROM_EMAIL: str = "noreply@alera.health"
    FRONTEND_URL: str = Field(default="http://localhost:5173", description="Frontend application base URL")

    # SMS
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""

    # Environment
    ENVIRONMENT: str = Field(default="production", description="Environment: development, staging, or production")
    DEBUG: bool = Field(default=False, description="Debug mode flag")

    # WebRTC
    AGORA_APP_ID: str = ""
    AGORA_APP_CERTIFICATE: str = ""

    # HIPAA
    ENCRYPTION_KEY: str = Field(
        default_factory=lambda: secrets.token_hex(16),
        description="Encryption key for sensitive data"
    )
    AUDIT_LOG_RETENTION_DAYS: int = 2555

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="allow",  # Allow extra fields from environment variables
    )

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


try:
    settings = Settings()
    print(f"✓ Config loaded: ENV={settings.ENVIRONMENT} DB={settings.DATABASE_URL[:30]}...")
except Exception as e:
    print(f"ERROR: Failed to load config: {e}")
    import traceback
    traceback.print_exc()
    raise

# Keep both import styles pointing at the same module.
sys.modules.setdefault("config", sys.modules[__name__])
sys.modules.setdefault("backend.config", sys.modules[__name__])
