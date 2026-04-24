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
