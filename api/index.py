from pathlib import Path
import sys


ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backend"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Import the FastAPI app first so all models are registered on Base.metadata
from main import app

# Initialize database after model imports so create_all() can see every table
from database import init_db

try:
    init_db()
except Exception as e:
    print(f"Warning: Could not initialize database: {e}")
