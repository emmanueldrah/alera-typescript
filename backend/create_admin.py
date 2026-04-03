import sys
import os
from pathlib import Path

# Setup paths
BACKEND_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BACKEND_DIR))

from database import SessionLocal, init_db
from app.models.user import User, UserRole
from app.utils.auth import hash_password

def create_admin():
    # Ensure tables exist
    init_db()
    
    db = SessionLocal()
    try:
        # Check if admin already exists
        admin_email = "admin@alera.health"
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        
        if existing_admin:
            print(f"Admin user already exists with email: {admin_email}")
            print("To reset the password, you can modify script or use the UI if available.")
            return

        # Create the admin user
        print("Creating default admin user...")
        admin = User(
            email=admin_email,
            username="admin",
            hashed_password=hash_password("admin_alera_2026!"),
            first_name="Alera",
            last_name="Admin",
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True
        )
        
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print("✅ Default admin user successfully created!")
        print("--------------------------------------------------")
        print(f"Email:    {admin.email}")
        print(f"Password: admin_alera_2026!")
        print("--------------------------------------------------")
        print("Please change this password after your first login.")

    except Exception as e:
        print(f"Error creating admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
