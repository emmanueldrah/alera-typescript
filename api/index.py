from pathlib import Path
import sys
import traceback
import os

# Force rebuild timestamp: 2026-04-02 21:35
# This ensures Vercel always uses fresh code, not cached bytecode

# Identify the root directory and ensure the backend is in the path
ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backend"

if str(BACKEND_DIR) not in sys.path:
    # Use insert(1) to avoid overriding built-in modules but ensure local ones take precedence
    sys.path.insert(0, str(BACKEND_DIR))
    sys.path.insert(0, str(ROOT_DIR))

# Import the FastAPI app
try:
    from main import app
    print("✓ FastAPI app imported successfully")
except Exception as e:
    print(f"ERROR: Failed to import FastAPI app: {e}")
    traceback.print_exc()
    
    # If we crash here, the function will fail with a 500.
    # In a production setting, we could create a dummy app to report the error properly.
    raise

# Conditional database initialization for Vercel
# This avoids doing it multiple times and handles cases where the DB is ready
try:
    from database import init_db
    # On Vercel, we only want to ensure tables exist
    # but we should handle the case where the environment is restricted
    init_db()
    print("✓ Database initialized successfully")
except Exception as e:
    print(f"ERROR: Failed to initialize database: {e}")
    # Don't crash the entire function if database init fails
    # (unless it's absolutely required for any response)
    if os.environ.get('ENVIRONMENT') != 'production':
        traceback.print_exc()

# Export app for Vercel
__all__ = ['app']
