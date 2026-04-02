from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool, StaticPool
from config import settings
from typing import Generator
import sys

database_url = settings.DATABASE_URL

# Handle production database settings
if settings.ENVIRONMENT == "production":
    # For SQLite in production, use /tmp
    if database_url.startswith("sqlite"):
        try:
            # Ensure we use an absolute path in /tmp
            db_name = database_url.split("///")[-1] if "///" in database_url else "alera.db"
            database_url = f"sqlite:////tmp/{db_name}"
            print(f"ℹ Using production SQLite database at: {database_url}")
            
            # Ensure /tmp exists (it should on Vercel)
            if not os.path.exists("/tmp"):
                print("WARNING: /tmp directory not found, SQLite might fail")
        except Exception as e:
            print(f"WARNING: Failed to reconfigure SQLite path: {e}")

# Database engine configuration
engine_kwargs = {
    "echo": settings.DATABASE_ECHO,
    "pool_pre_ping": True,
}

# Use appropriate pool settings based on database type
if database_url.startswith("sqlite"):
    # SQLite: No connection pooling for serverless
    engine_kwargs["poolclass"] = StaticPool
    engine_kwargs["connect_args"] = {"check_same_thread": False}
elif database_url.startswith("postgresql"):
    # PostgreSQL: Use NullPool for serverless (no connection pooling)
    # Vercel uses ephemeral connections
    engine_kwargs["poolclass"] = NullPool
else:
    # Default: No pooling for other database types
    if settings.ENVIRONMENT == "production":
        engine_kwargs["poolclass"] = NullPool

try:
    # Create engine
    engine = create_engine(
        database_url,
        **engine_kwargs,
    )
except Exception as e:
    print(f"ERROR: Failed to create database engine with URL: {database_url[:50]}...")
    print(f"ERROR: {str(e)}")
    # If we are in production and it's a critical failure, we should probably know
    raise

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base model
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Database session generator for dependency injection in FastAPI routes.
    Ensures proper connection cleanup after each request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Event listeners for database connection pooling
@event.listens_for(engine, "connect")
def receive_connect(dbapi_connection, connection_record):
    """Enable foreign key constraints for SQLite"""
    if "sqlite" in str(engine.url):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


def init_db():
    """Initialize database - create all tables"""
    try:
        Base.metadata.create_all(bind=engine)
        print("✓ Database tables initialized successfully")
    except Exception as e:
        print(f"ERROR: Failed to initialize database tables: {e}")
        raise


# Keep both import styles pointing at the same module.
sys.modules.setdefault("database", sys.modules[__name__])
sys.modules.setdefault("backend.database", sys.modules[__name__])
