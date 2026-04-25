from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator, Field, model_validator
from typing import List
import sys
import os
import json


def infer_environment_default() -> str:
    explicit_environment = os.environ.get("ENVIRONMENT")
    vercel_environment = os.environ.get("VERCEL_ENV")
    if vercel_environment:
        return vercel_environment.strip().lower()

    if explicit_environment:
        return explicit_environment

    if os.environ.get("VERCEL") == "1":
        return "production"

    return "development"


def infer_database_url_default() -> str:
    if os.environ.get("VERCEL") == "1" or os.environ.get("VERCEL_ENV"):
        return "sqlite:////tmp/alera.db"
    return "sqlite:///alera.db"


def infer_frontend_url_default() -> str:
    vercel_environment = (os.environ.get("VERCEL_ENV") or "").strip().lower()

    candidate_hosts: list[str] = []
    if vercel_environment == "production":
        candidate_hosts.extend(
            [
                os.environ.get("VERCEL_PROJECT_PRODUCTION_URL"),
                os.environ.get("VERCEL_URL"),
            ]
        )
    elif vercel_environment:
        candidate_hosts.extend(
            [
                os.environ.get("VERCEL_BRANCH_URL"),
                os.environ.get("VERCEL_URL"),
                os.environ.get("VERCEL_PROJECT_PRODUCTION_URL"),
            ]
        )
    elif os.environ.get("VERCEL") == "1":
        candidate_hosts.extend(
            [
                os.environ.get("VERCEL_URL"),
                os.environ.get("VERCEL_PROJECT_PRODUCTION_URL"),
            ]
        )

    for host in candidate_hosts:
        normalized_host = (host or "").strip().strip("/")
        if not normalized_host:
            continue
        if normalized_host.startswith(("http://", "https://")):
            return normalized_host.rstrip("/")
        return f"https://{normalized_host}"

    return "http://localhost:5173"

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = Field(default_factory=infer_database_url_default, description="Database connection URL")
    DATABASE_ECHO: bool = False

    # Redis
    REDIS_URL: str = Field(default="redis://localhost:6379/0", description="Redis connection URL")

    # Security - Generate a strong default if not provided
    SECRET_KEY: str = Field(
        default="dev-secret-key-change-me",
        description="Secret key for JWT tokens - MUST be set in production"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    COOKIE_SECURE: bool = Field(default=True, description="Use secure cookies (HTTPS only) in production")

    @field_validator("COOKIE_SECURE", mode="before")
    @classmethod
    def set_cookie_secure(cls, value):
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"1", "true", "yes", "on"}:
                return True
            if normalized in {"0", "false", "no", "off"}:
                return False
        return infer_environment_default().strip().lower() in {"production", "staging"}

    @field_validator("ENVIRONMENT", mode="before")
    @classmethod
    def normalize_environment(cls, value):
        normalized = str(value).strip().lower() if value is not None else ""
        vercel_environment = os.environ.get("VERCEL_ENV")
        if vercel_environment:
            normalized_vercel_environment = vercel_environment.strip().lower()
            if normalized_vercel_environment in {"preview", "development"}:
                return normalized_vercel_environment
            if normalized in {"", "development", "preview"}:
                return normalized_vercel_environment
        return normalized or infer_environment_default()

    JWT_EXPIRE_HOURS: int = 24

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://alera-typescript.vercel.app",
        "https://alera-gamma.vercel.app"
    ]
    CORS_ORIGIN_REGEX: str = r"https://.*\.vercel\.app"
    EXPOSE_API_DOCS: bool = Field(default=False, description="Expose OpenAPI docs endpoints")

    # Email
    EMAIL_PROVIDER: str = "auto"
    EMAIL_FROM_NAME: str = "ALERA Healthcare"
    EMAIL_FROM_EMAIL: str = "noreply@alera.health"
    EMAIL_TIMEOUT_SECONDS: int = 10
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = "noreply@alera.health"
    SENDGRID_API_KEY: str = ""
    SENDGRID_FROM_EMAIL: str = "noreply@alera.health"
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_USE_TLS: bool = True
    SMTP_USE_SSL: bool = False
    FRONTEND_URL: str = Field(default_factory=infer_frontend_url_default, description="Frontend application base URL")

    # SMS
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""

    # Environment
    ENVIRONMENT: str = Field(default_factory=infer_environment_default, description="Environment: development, staging, or production")
    DEBUG: bool = Field(default=False, description="Debug mode flag")

    # WebRTC
    AGORA_APP_ID: str = ""
    AGORA_APP_CERTIFICATE: str = ""

    # HIPAA
    ENCRYPTION_KEY: str = Field(
        default="dev-encryption-key-change-me",
        description="Encryption key for sensitive data"
    )
    AUDIT_LOG_RETENTION_DAYS: int = 2555

    model_config = SettingsConfigDict(
        env_file=(".env", ".env.local", "backend/.env"),
        case_sensitive=True,
        extra="allow",  # Allow extra fields from environment variables
    )

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls,
        init_settings,
        env_settings,
        dotenv_settings,
        file_secret_settings,
    ):
        if os.environ.get("VERCEL") == "1" or os.environ.get("VERCEL_ENV"):
            return (
                init_settings,
                env_settings,
                file_secret_settings,
            )

        return (
            init_settings,
            env_settings,
            dotenv_settings,
            file_secret_settings,
        )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, value):
        if isinstance(value, list):
            return value
        if value is None:
            return []
        if isinstance(value, str):
            normalized = value.strip()
            if not normalized:
                return []
            if normalized.startswith("["):
                parsed = json.loads(normalized)
                if not isinstance(parsed, list):
                    raise ValueError("CORS_ORIGINS JSON must be an array of origins")
                return [str(origin).strip() for origin in parsed if str(origin).strip()]
            return [origin.strip() for origin in normalized.split(",") if origin.strip()]
        raise ValueError("CORS_ORIGINS must be a list or comma-separated string")

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

    @field_validator("EXPOSE_API_DOCS", mode="before")
    @classmethod
    def parse_docs_flag(cls, value):
        if isinstance(value, bool):
            return value

        if value is None:
            return False

        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"1", "true", "yes", "on"}:
                return True
            if normalized in {"0", "false", "no", "off"}:
                return False

        return bool(value)

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, value: str):
        if not value or len(value.strip()) < 12:
            raise ValueError("SECRET_KEY must be set to a strong value")
        return value

    @field_validator("ENCRYPTION_KEY")
    @classmethod
    def validate_encryption_key(cls, value: str):
        if not value or len(value.strip()) < 12:
            raise ValueError("ENCRYPTION_KEY must be set to a strong value")
        return value

    @field_validator("DATABASE_URL")
    @classmethod
    def validate_database_url(cls, value: str):
        if not value or not value.strip():
            fallback = infer_database_url_default()
            if fallback:
                return fallback
            raise ValueError("DATABASE_URL is required")
        return value

    @field_validator("FRONTEND_URL")
    @classmethod
    def validate_frontend_url(cls, value: str):
        if not value or not value.strip():
            fallback = infer_frontend_url_default()
            if fallback:
                return fallback.rstrip("/")
            raise ValueError("FRONTEND_URL is required")
        return value.rstrip("/")

    @classmethod
    def _is_placeholder_secret(cls, value: str) -> bool:
        return value in {"dev-secret-key-change-me", "dev-encryption-key-change-me"}

    @classmethod
    def _is_sqlite_url(cls, value: str) -> bool:
        return value.startswith("sqlite")

    @model_validator(mode="after")
    def validate_production_requirements(self):
        if self.ENVIRONMENT == "production":
            if self._is_placeholder_secret(self.SECRET_KEY):
                raise ValueError("SECRET_KEY must be explicitly configured in production")
            if self._is_placeholder_secret(self.ENCRYPTION_KEY):
                raise ValueError("ENCRYPTION_KEY must be explicitly configured in production")
            if self._is_sqlite_url(self.DATABASE_URL):
                raise ValueError("Production DATABASE_URL must use a persistent database, not SQLite")
            if self.FRONTEND_URL.startswith("http://localhost"):
                raise ValueError("FRONTEND_URL must be set to the production frontend origin")
        return self


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
