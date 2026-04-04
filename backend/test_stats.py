import sys
import os
from pathlib import Path

# Setup path
_root = Path(__file__).parent
sys.path.insert(0, str(_root))

from database import SessionLocal, init_db
from app.models import (
    User, UserRole, Appointment, AppointmentStatus, Prescription,
    LabTest, LabTestStatus, ImagingScan, ImagingScanStatus,
    AmbulanceRequest, AmbulanceRequestStatus, EmergencyPriority
)
from datetime import datetime, time

def test_stats():
    # Initialize DB to create tables
    print("Initializing database...")
    init_db()
    
    db = SessionLocal()
    try:
        print("--- Starting Stats Test ---")
        
        # 1. User counts
        user_counts = {}
        for role in UserRole:
            print(f"Counting role: {role.value}")
            count = db.query(User).filter(User.role == role.value).count()
            user_counts[role.value] = count
        print(f"User counts: {user_counts}")

        # 2. Today's Activity
        today = datetime.utcnow().date()
        start_of_today = datetime.combine(today, time.min)
        end_of_today = datetime.combine(today, time.max)
        
        print(f"Appointment range: {start_of_today} to {end_of_today}")
        today_appointments = db.query(Appointment).filter(
            Appointment.scheduled_time >= start_of_today,
            Appointment.scheduled_time <= end_of_today
        ).count()
        print(f"Today's appointments: {today_appointments}")

        # 3. Lab/Imaging
        pending_labs = db.query(LabTest).filter(
            LabTest.status != LabTestStatus.COMPLETED.value
        ).count()
        print(f"Pending labs: {pending_labs}")

        # 4. Emergencies
        active_emergencies = db.query(AmbulanceRequest).filter(
            AmbulanceRequest.status != AmbulanceRequestStatus.COMPLETED.value,
            AmbulanceRequest.status != AmbulanceRequestStatus.CANCELLED.value,
            AmbulanceRequest.priority == EmergencyPriority.CRITICAL.value
        ).count()
        print(f"Active emergencies: {active_emergencies}")
        
    except Exception as e:
        import traceback
        print(f"ERROR: {e}")
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_stats()
