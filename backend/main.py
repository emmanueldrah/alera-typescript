import os
import traceback
from contextlib import asynccontextmanager
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.routes import auth, users, appointments, prescriptions, allergies, notifications, telemedicine, admin, documents, consents, reminders_templates, audit, lab_tests, imaging, ambulance, referrals, records, location_ws, live_locations, organizations, patient_permissions, medical_records, medical_documents, external_ingestion
from config import settings
from app.utils.csrf import validate_csrf_token
from database import engine, init_db

# Build allowed hosts list from env — add TRUSTED_HOSTS=your.domain.com to override
_DEFAULT_TRUSTED_HOSTS = ["localhost", "127.0.0.1", "testserver", "*.vercel.app", "*.railway.app", "*.render.com", "*.up.railway.app"]
_extra = os.environ.get("TRUSTED_HOSTS", "")
ALLOWED_HOSTS = _DEFAULT_TRUSTED_HOSTS + [h.strip() for h in _extra.split(",") if h.strip()]

# Create FastAPI app
async def _initialize_application_state() -> None:
    # On Vercel (serverless), we usually initialize in api/index.py
    # or let the first request handle it.
    if settings.ENVIRONMENT != "production" or not os.environ.get("VERCEL"):
        try:
            init_db()
            app.state.startup_complete = True
            app.state.startup_error = None
        except Exception as e:
            app.state.startup_complete = False
            app.state.startup_error = str(e)
            print(f"Error during startup database initialization: {e}")
    else:
        app.state.startup_complete = True
        app.state.startup_error = None


@asynccontextmanager
async def lifespan(_: FastAPI):
    await _initialize_application_state()
    yield


app = FastAPI(
    title="ALERA Healthcare API",
    description="Backend API for ALERA Healthcare Platform",
    version="1.0.0",
    docs_url="/api/docs" if settings.DEBUG or settings.EXPOSE_API_DOCS else None,
    openapi_url="/api/openapi.json" if settings.DEBUG or settings.EXPOSE_API_DOCS else None,
    lifespan=lifespan,
)

SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}
CSRF_EXEMPT_PATHS = {
    "/api",
    "/api/health",
    "/api/ready",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/refresh",
    "/api/auth/request-password-reset",
    "/api/auth/reset-password",
    "/api/auth/verify-email",
}

app.state.startup_complete = False
app.state.startup_error = None


def _database_ready() -> tuple[bool, str]:
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True, "ok"
    except Exception as exc:
        return False, str(exc)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=settings.CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def csrf_protection_middleware(request: Request, call_next):
    path = request.url.path
    if (
        request.method not in SAFE_METHODS
        and path.startswith("/api")
        and path not in CSRF_EXEMPT_PATHS
        and request.cookies.get("access_token")
    ):
        if not validate_csrf_token(request):
            return JSONResponse(
                status_code=403,
                content={"detail": "CSRF token validation failed"},
            )

    return await call_next(request)


@app.middleware("http")
async def add_runtime_headers(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID") or str(uuid4())
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)")
    if settings.ENVIRONMENT == "production":
        response.headers.setdefault(
            "Strict-Transport-Security",
            "max-age=31536000; includeSubDomains; preload",
        )
    return response

# Trusted Host Middleware — extend via TRUSTED_HOSTS env var in production
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=ALLOWED_HOSTS,
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(appointments.router)
app.include_router(prescriptions.router)
app.include_router(allergies.router)
app.include_router(notifications.router)
app.include_router(telemedicine.router)
app.include_router(admin.router)
app.include_router(documents.router)
app.include_router(consents.router)
app.include_router(reminders_templates.router)
app.include_router(audit.router)
app.include_router(lab_tests.router)
app.include_router(imaging.router)
app.include_router(ambulance.router)
app.include_router(referrals.router)
app.include_router(records.router)
app.include_router(organizations.router)
app.include_router(patient_permissions.router)
app.include_router(medical_records.router)
app.include_router(medical_documents.router)
app.include_router(external_ingestion.router)
app.include_router(location_ws.router)
app.include_router(live_locations.router)

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    database_ok, database_status = _database_ready()
    return {
        "status": "healthy" if database_ok else "degraded",
        "service": "ALERA Healthcare API",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "checks": {
            "database": database_status,
            "startup": "ok" if app.state.startup_complete else "pending",
        },
    }


@app.get("/api/ready")
async def readiness_check():
    """Readiness probe for deployments and load balancers."""
    database_ok, database_status = _database_ready()
    startup_complete = bool(app.state.startup_complete)
    is_ready = startup_complete and database_ok
    status_code = 200 if is_ready else 503
    payload = {
        "status": "ready" if is_ready else "not_ready",
        "environment": settings.ENVIRONMENT,
        "checks": {
            "startup": "ok" if startup_complete else "pending",
            "database": database_status,
        },
    }
    if app.state.startup_error:
        payload["startup_error"] = app.state.startup_error
    return JSONResponse(status_code=status_code, content=payload)

@app.get("/api")
async def root():
    """API root endpoint"""
    return {
        "message": "Welcome to ALERA Healthcare API",
        "docs": "/api/docs" if settings.DEBUG or settings.EXPOSE_API_DOCS else None,
        "health": "/api/health",
        "readiness": "/api/ready",
    }

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    request_id = getattr(request.state, "request_id", None) or request.headers.get("X-Request-ID")
    error_detail = str(exc)
    if settings.DEBUG or settings.ENVIRONMENT != "production":
        error_detail = {
            "message": str(exc),
            "traceback": traceback.format_exc()
        }

    return JSONResponse(
        status_code=500,
        content={
            "detail": error_detail,
            "status": "error",
            "request_id": request_id,
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
