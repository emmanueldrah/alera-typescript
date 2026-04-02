"""
Vercel serverless API entry point for ALERA Healthcare
Timestamp: 2026-04-02 21:42 - Clean rebuild
"""

import sys
from pathlib import Path

# Setup path to find backend modules
_root = Path(__file__).parent.parent
_backend = _root / "backend"
sys.path.insert(0, str(_backend))
sys.path.insert(0, str(_root))

# Import FastAPI app from backend
from main import app

# Ensure app is available for Vercel
assert app is not None, "FastAPI app is None"

# Database initialization (optional - happens on first request)
try:
    from database import init_db
    init_db()
except Exception:
    # Database init failures should not crash the API
    pass

__all__ = ["app"]

