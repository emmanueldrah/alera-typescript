from pathlib import Path
import sys
import traceback

ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backend"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

try:
    # Import the FastAPI app first so all models are registered on Base.metadata
    from main import app
    print("✓ FastAPI app imported successfully")
except Exception as e:
    print(f"ERROR: Failed to import FastAPI app: {e}")
    traceback.print_exc()
    raise

try:
    # Initialize database after model imports so create_all() can see every table
    from database import init_db
    init_db()
    print("✓ Database initialized successfully")
except Exception as e:
    print(f"ERROR: Failed to initialize database: {e}")
    traceback.print_exc()
    # Don't crash - database might be already initialized
    # or we might be in a read-only state

# Export app for Vercel
__all__ = ['app']
