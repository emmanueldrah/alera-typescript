from __future__ import annotations

from starlette.requests import Request

import pytest

from app.utils.rate_limit import enforce_rate_limit, reset_rate_limit_state


def _request_for(host: str) -> Request:
    return Request(
        {
            "type": "http",
            "method": "POST",
            "path": "/api/auth/login",
            "headers": [],
            "client": (host, 12345),
        }
    )


@pytest.fixture(autouse=True)
def clear_rate_limit_state():
    reset_rate_limit_state()
    yield
    reset_rate_limit_state()


def test_rate_limiter_blocks_after_limit_is_reached():
    request = _request_for("10.0.0.1")

    enforce_rate_limit(request=request, scope="auth:login", limit=2, window_seconds=60)
    enforce_rate_limit(request=request, scope="auth:login", limit=2, window_seconds=60)

    with pytest.raises(Exception) as exc_info:
        enforce_rate_limit(request=request, scope="auth:login", limit=2, window_seconds=60)

    assert getattr(exc_info.value, "status_code", None) == 429


def test_rate_limiter_is_scoped_per_client():
    first = _request_for("10.0.0.1")
    second = _request_for("10.0.0.2")

    enforce_rate_limit(request=first, scope="auth:login", limit=1, window_seconds=60)
    enforce_rate_limit(request=second, scope="auth:login", limit=1, window_seconds=60)
