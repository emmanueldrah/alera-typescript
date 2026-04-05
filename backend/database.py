from sqlalchemy import create_engine, event, inspect, text, Enum as SQLEnum
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from sqlalchemy.pool import NullPool, StaticPool
from config import settings
from app.utils.time import utcnow
from app.utils.db_types import enum_value_renames
from datetime import datetime
from typing import Generator
import sys
import os

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


def _patch_referrals_referral_type_column():
    """SQLite: add referral_type if missing (create_all does not ALTER existing tables)."""
    if not str(engine.url).startswith("sqlite"):
        return

    try:
        with engine.begin() as conn:
            conn.execute(
                text(
                    "ALTER TABLE referrals ADD COLUMN referral_type VARCHAR(32) NOT NULL DEFAULT 'hospital'"
                )
            )
    except Exception:
        pass


def _patch_users_session_version_column():
    """Add session_version to users when upgrading an existing database."""
    try:
        columns = {column["name"] for column in inspect(engine).get_columns("users")}
    except Exception:
        return

    if "session_version" in columns:
        return

    try:
        with engine.begin() as conn:
            conn.execute(
                text("ALTER TABLE users ADD COLUMN session_version INTEGER NOT NULL DEFAULT 0")
            )
    except Exception as e:
        print(f"WARNING: Could not patch users.session_version column: {e}")


def _patch_users_account_recovery_columns():
    """Add email verification and password reset columns when upgrading an existing database."""
    try:
        columns = {column["name"] for column in inspect(engine).get_columns("users")}
    except Exception:
        return

    patches = {
        "email_verified": "BOOLEAN NOT NULL DEFAULT FALSE",
        "email_verified_at": "TIMESTAMP",
        "email_verification_token_hash": "VARCHAR(255)",
        "email_verification_expires_at": "TIMESTAMP",
        "password_reset_token_hash": "VARCHAR(255)",
        "password_reset_expires_at": "TIMESTAMP",
    }

    for column_name, ddl in patches.items():
        if column_name in columns:
            continue
        try:
            with engine.begin() as conn:
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {column_name} {ddl}"))
        except Exception as e:
            print(f"WARNING: Could not patch users.{column_name} column: {e}")


def _patch_users_notification_preferences_columns():
    """Add notification preference and privacy fields when upgrading an existing database."""
    try:
        columns = {column["name"] for column in inspect(engine).get_columns("users")}
    except Exception:
        return

    patches = {
        "notification_email": "BOOLEAN NOT NULL DEFAULT TRUE",
        "notification_sms": "BOOLEAN NOT NULL DEFAULT FALSE",
        "privacy_public_profile": "BOOLEAN NOT NULL DEFAULT FALSE",
    }

    for column_name, ddl in patches.items():
        if column_name in columns:
            continue
        try:
            with engine.begin() as conn:
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {column_name} {ddl}"))
        except Exception as e:
            print(f"WARNING: Could not patch users.{column_name} column: {e}")


def _patch_admin_accounts_email_verified():
    """Backfill seeded/admin accounts so they never get stuck behind email verification."""
    try:
        columns = {column["name"] for column in inspect(engine).get_columns("users")}
    except Exception:
        return

    required = {
        "role",
        "email_verified",
        "email_verified_at",
        "is_verified",
        "email_verification_token_hash",
        "email_verification_expires_at",
    }
    if not required.issubset(columns):
        return

    try:
        with engine.begin() as conn:
            result = conn.execute(
                text(
                    """
                    UPDATE users
                    SET email_verified = TRUE,
                        email_verified_at = COALESCE(email_verified_at, :now),
                        is_verified = TRUE,
                        email_verification_token_hash = NULL,
                        email_verification_expires_at = NULL
                    WHERE role IN ('admin', 'super_admin')
                    """
                ),
                {"now": utcnow()},
            )
            if result.rowcount:
                print(f"✓ Normalized {result.rowcount} admin account(s) as verified")
    except Exception as e:
        print(f"WARNING: Could not patch admin verification state: {e}")


def _collect_sqlalchemy_enum_specs() -> dict[str, list[str]]:
    """Collect the desired persisted labels for every SQLAlchemy enum in metadata."""

    specs: dict[str, list[str]] = {}
    for table in Base.metadata.tables.values():
        for column in table.columns:
            column_type = getattr(column, "type", None)
            if not isinstance(column_type, SQLEnum):
                continue
            if not getattr(column_type, "native_enum", True):
                continue

            type_name = getattr(column_type, "name", None)
            labels = getattr(column_type, "enums", None)
            if not type_name or not labels:
                continue

            specs[type_name] = list(labels)

    return specs


def _patch_postgres_enum_values():
    """Normalize legacy PostgreSQL enum labels to the current lowercase values."""

    if not str(database_url).startswith("postgresql"):
        return

    try:
        enum_specs = inspect(engine).get_enums(schema="public")
    except Exception as e:
        print(f"WARNING: Could not inspect PostgreSQL enums: {e}")
        return

    existing_enums = {enum["name"]: list(enum.get("labels") or []) for enum in enum_specs}
    desired_enums = _collect_sqlalchemy_enum_specs()

    rename_count = 0
    try:
        with engine.begin() as conn:
            for type_name, desired_labels in desired_enums.items():
                current_labels = existing_enums.get(type_name)
                if not current_labels:
                    continue

                for old_label, new_label in enum_value_renames(current_labels, desired_labels):
                    conn.exec_driver_sql(
                        f'ALTER TYPE "{type_name}" RENAME VALUE {old_label!r} TO {new_label!r}'
                    )
                    rename_count += 1
    except Exception as e:
        print(f"WARNING: Could not normalize PostgreSQL enum values: {e}")
        return

    if rename_count:
        print(f"✓ Normalized {rename_count} PostgreSQL enum label(s)")


def _patch_userrole_enum_values():
    """Add missing user role enum values and rename uppercase to lowercase for PostgreSQL userrole type."""
    if not str(database_url).startswith("postgresql"):
        # SQLite uses VARCHAR, so no enum alteration needed
        return

def _patch_userrole_enum_values():
    """Add missing user role enum values and rename uppercase to lowercase for PostgreSQL userrole type."""
    if not str(database_url).startswith("postgresql"):
        # SQLite uses VARCHAR, so no enum alteration needed
        return

    try:
        with engine.begin() as conn:
            # Get enum info using raw SQL
            result = conn.execute(text("""
                SELECT n.nspname AS schema_name, t.typname AS type_name, 
                       array_agg(e.enumlabel ORDER BY e.enumsortorder) AS labels
                FROM pg_type t
                JOIN pg_enum e ON t.oid = e.enumtypid
                JOIN pg_namespace n ON t.typnamespace = n.oid
                WHERE t.typname = 'userrole'
                GROUP BY n.nspname, t.typname
            """))
            enum_info = result.fetchone()
            
            if enum_info:
                schema_name, type_name, labels = enum_info
                print(f"DEBUG: Found userrole enum in schema {schema_name} with labels: {labels}")
                
                # Convert labels to list if it's an array
                if hasattr(labels, '__iter__') and not isinstance(labels, str):
                    labels = list(labels)
                else:
                    labels = [labels] if labels else []
                
                # First, update any existing data to use lowercase
                renames = {
                    "PATIENT": "patient",
                    "PROVIDER": "provider", 
                    "PHARMACIST": "pharmacist",
                    "ADMIN": "admin",
                    "SUPER_ADMIN": "super_admin",
                    "HOSPITAL": "hospital",
                    "LABORATORY": "laboratory",
                    "IMAGING": "imaging",
                    "AMBULANCE": "ambulance"
                }
                
                # Update data to lowercase
                for old_value, new_value in renames.items():
                    try:
                        result = conn.execute(text(f"UPDATE users SET role = '{new_value}' WHERE role = '{old_value}'"))
                        updated = result.rowcount
                        if updated > 0:
                            print(f"DEBUG: Updated {updated} users from {old_value} to {new_value}")
                    except Exception as e:
                        print(f"WARNING: Could not update role {old_value} to {new_value}: {e}")
                
                # Rename enum labels
                rename_count = 0
                for old_label, new_label in renames.items():
                    if old_label in labels:
                        try:
                            conn.execute(text(f"ALTER TYPE {schema_name}.userrole RENAME VALUE '{old_label}' TO '{new_label}'"))
                            rename_count += 1
                            print(f"DEBUG: Renamed enum value {old_label} to {new_label}")
                        except Exception as e:
                            print(f"WARNING: Could not rename {old_label} to {new_label}: {e}")
                
                if rename_count > 0:
                    print(f"✓ Renamed {rename_count} PostgreSQL userrole enum label(s) to lowercase")
                
                # Add missing values
                all_desired = set(renames.values())
                missing_values = [value for value in ("admin", "super_admin") if value not in labels and value not in all_desired]
                if missing_values:
                    for value in missing_values:
                        try:
                            conn.execute(text(f"ALTER TYPE {schema_name}.userrole ADD VALUE IF NOT EXISTS '{value}'"))
                            print(f"DEBUG: Added {value} to userrole enum")
                        except Exception as e:
                            print(f"WARNING: Could not add {value} to userrole enum: {e}")
                    print(f"✓ Added {', '.join(missing_values)} to PostgreSQL userrole enum")
            else:
                print("WARNING: userrole enum not found in database via raw SQL")
                
    except Exception as e:
        print(f"WARNING: Could not patch userrole enum values: {e}")
        import traceback
        print(f"DEBUG: Exception traceback: {traceback.format_exc()}")


def init_db():
    """Initialize database - create all tables and seed default admin"""
    try:
        import app.models  # noqa: F401

        Base.metadata.create_all(bind=engine)
        _patch_referrals_referral_type_column()
        _patch_users_session_version_column()
        _patch_users_account_recovery_columns()
        _patch_users_notification_preferences_columns()
        _patch_userrole_enum_values()
        _patch_postgres_enum_values()
        _patch_admin_accounts_email_verified()
        print("✓ Database tables initialized successfully")
    except Exception as e:
        print(f"ERROR: Failed to initialize database tables: {e}")
        raise

    # Seed default admin account on every startup (idempotent)
    try:
        _seed_admin()
    except Exception as e:
        print(f"WARNING: Failed to seed admin user: {e}")


def _seed_admin():
    """Create the default admin and super_admin users if they don't exist yet."""
    from app.models.user import User, UserRole
    from app.utils.auth import hash_password

    db = SessionLocal()
    try:
        # ── regular admin ──────────────────────────────────────────────────
        admin_email = os.environ.get("ADMIN_EMAIL", "admin@alera.health")
        admin_password = os.environ.get("ADMIN_PASSWORD", "admin_alera_2026!")

        if not db.query(User).filter(User.email == admin_email).first():
            admin = User(
                email=admin_email,
                username="admin",
                hashed_password=hash_password(admin_password),
                first_name="Alera",
                last_name="Admin",
                role=UserRole.ADMIN,
                is_active=True,
                is_verified=True,
                email_verified=True,
                email_verified_at=utcnow(),
                session_version=0,
                notification_email=True,
                notification_sms=False,
                privacy_public_profile=False,
            )
            db.add(admin)
            db.flush()
            print(f"✓ Default admin seeded: {admin_email}")

        # ── super admin ────────────────────────────────────────────────────
        super_email = os.environ.get("SUPER_ADMIN_EMAIL", "superadmin@alera.health")
        super_password = os.environ.get("SUPER_ADMIN_PASSWORD", "superadmin_alera_2026!")

        if not db.query(User).filter(User.email == super_email).first():
            super_admin = User(
                email=super_email,
                username="superadmin",
                hashed_password=hash_password(super_password),
                first_name="Alera",
                last_name="SuperAdmin",
                role=UserRole.SUPER_ADMIN,
                is_active=True,
                is_verified=True,
                email_verified=True,
                email_verified_at=utcnow(),
                session_version=0,
                notification_email=True,
                notification_sms=False,
                privacy_public_profile=False,
            )
            db.add(super_admin)
            db.flush()
            print(f"✓ Default super admin seeded: {super_email}")

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"WARNING: Could not seed admin: {e}")
    finally:
        db.close()


# Keep both import styles pointing at the same module.
sys.modules.setdefault("database", sys.modules[__name__])
sys.modules.setdefault("backend.database", sys.modules[__name__])
