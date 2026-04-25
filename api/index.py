"""Vercel serverless API entry point for ALERA Healthcare."""

import logging
import sys
import traceback
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


logger = logging.getLogger(__name__)

# Setup path to find backend modules
_root = Path(__file__).parent.parent
_backend = _root / "backend"
sys.path.insert(0, str(_backend))
sys.path.insert(0, str(_root))


def _build_fallback_app(startup_error: str) -> FastAPI:
    """Return a minimal app so misconfigured deploys report JSON instead of crashing."""
    fallback_app = FastAPI(title="ALERA Healthcare API", version="startup-error")

    async def respond_unavailable(request: Request) -> JSONResponse:
        payload = {
            "service": "ALERA Healthcare API",
            "status": "error",
            "message": "API startup failed",
            "startup_error": startup_error,
            "path": request.url.path,
        }
        status_code = 503 if request.url.path in {"/api/health", "/api/ready"} else 500
        return JSONResponse(status_code=status_code, content=payload)

    for method in ("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"):
        fallback_app.add_api_route("/{path:path}", respond_unavailable, methods=[method])

    return fallback_app


try:
    # Import FastAPI app from backend.
    from main import app as imported_app
    from database import init_db

    app = imported_app
    assert app is not None, "FastAPI app is None"

    try:
        init_db()
    except Exception as exc:
        logger.exception("Database initialization failed during Vercel bootstrap")
        if hasattr(app, "state"):
            app.state.startup_complete = False
            app.state.startup_error = str(exc)
except Exception as exc:
    startup_traceback = traceback.format_exc()
    logger.error("ALERA API bootstrap failed on Vercel\n%s", startup_traceback)
    app = _build_fallback_app(str(exc))

__all__ = ["app"]
