from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool
from config import settings
from typing import Generator
import sys

database_url = settings.DATABASE_URL
if settings.ENVIRONMENT == "production" and database_url == "sqlite:///alera.db":
    database_url = "sqlite:////tmp/alera.db"

engine_kwargs = {
    "echo": settings.DATABASE_ECHO,
    "pool_pre_ping": True,
    "poolclass": NullPool if settings.ENVIRONMENT == "production" else None,
}

if database_url.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

# Create engine
engine = create_engine(
    database_url,
    **engine_kwargs,
)

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
    Base.metadata.create_all(bind=engine)


# Keep both import styles pointing at the same module.
sys.modules.setdefault("database", sys.modules[__name__])
sys.modules.setdefault("backend.database", sys.modules[__name__])
