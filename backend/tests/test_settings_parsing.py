from backend.config import Settings


def test_settings_accept_comma_separated_cors_origins():
    settings = Settings(
        DATABASE_URL="sqlite:///test.db",
        SECRET_KEY="strong-secret-key",
        ENCRYPTION_KEY="strong-encryption-key",
        FRONTEND_URL="https://example.com/",
        CORS_ORIGINS="https://one.example.com, https://two.example.com",
        ENVIRONMENT="development",
    )

    assert settings.CORS_ORIGINS == [
        "https://one.example.com",
        "https://two.example.com",
    ]
    assert settings.FRONTEND_URL == "https://example.com"


def test_settings_infer_vercel_preview_environment(monkeypatch):
    monkeypatch.delenv("ENVIRONMENT", raising=False)
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.setenv("VERCEL_ENV", "preview")

    settings = Settings(
        SECRET_KEY="strong-secret-key",
        ENCRYPTION_KEY="strong-encryption-key",
        FRONTEND_URL="https://preview.example.com",
        CORS_ORIGINS="https://preview.example.com",
    )

    assert settings.ENVIRONMENT == "preview"
    assert settings.DATABASE_URL == "sqlite:////tmp/alera.db"


def test_settings_ignore_development_override_on_vercel(monkeypatch):
    monkeypatch.setenv("ENVIRONMENT", "development")
    monkeypatch.setenv("VERCEL_ENV", "production")

    settings = Settings(
        DATABASE_URL="postgresql://alera:secret@db.example.com:5432/alera",
        SECRET_KEY="strong-secret-key",
        ENCRYPTION_KEY="strong-encryption-key",
        FRONTEND_URL="https://prod.example.com",
        CORS_ORIGINS="https://prod.example.com",
    )

    assert settings.ENVIRONMENT == "production"


def test_settings_do_not_force_preview_deployments_into_production(monkeypatch):
    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.setenv("VERCEL_ENV", "preview")

    settings = Settings(
        SECRET_KEY="strong-secret-key",
        ENCRYPTION_KEY="strong-encryption-key",
        FRONTEND_URL="https://preview.example.com",
        CORS_ORIGINS="https://preview.example.com",
    )

    assert settings.ENVIRONMENT == "preview"
    assert settings.DATABASE_URL == "sqlite:////tmp/alera.db"
