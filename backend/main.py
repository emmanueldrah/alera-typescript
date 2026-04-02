from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from config import settings
from database import init_db
from app.routes import auth, users, appointments, prescriptions, allergies, notifications, telemedicine, admin, documents, consents, reminders_templates, audit

# Create FastAPI app
app = FastAPI(
    title="ALERA Healthcare API",
    description="Backend API for ALERA Healthcare Platform",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted Host Middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.vercel.app"]
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


@app.on_event("startup")
async def startup_event():
    """Initialize database tables when the application starts."""
    init_db()


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ALERA Healthcare API",
        "version": "1.0.0"
    }


@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "message": "Welcome to ALERA Healthcare API",
        "docs": "/api/docs",
        "health": "/health"
    }


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    return JSONResponse(
        status_code=500,
        content={
            "detail": str(exc),
            "status": "error"
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
