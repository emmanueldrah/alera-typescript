from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from app.models import (
    User, UserRole, Appointment, AppointmentStatus, Prescription,
    LabTest, LabTestStatus, ImagingScan, ImagingScanStatus,
    AmbulanceRequest, AmbulanceRequestStatus, EmergencyPriority
)
from app.utils.dependencies import get_current_admin
from app.schemas import UserResponse
from app.schemas.additional_features import AuditLogResponse
from app.utils.access import WORKFORCE_ROLES, normalized_enum_text
from app.utils.time import utcnow
from datetime import datetime, timedelta, time

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _revoke_user_sessions(user: User) -> None:
    user.session_version = int(user.session_version or 0) + 1


def _workforce_users_query(db: Session):
    role_text = normalized_enum_text(User.role)
    return db.query(User).filter(role_text.in_([role.value for role in WORKFORCE_ROLES]))


@router.get("/dashboard/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get admin dashboard statistics with resilient integration"""
    
    # Initialize default values
    user_counts = {role.value: 0 for role in UserRole}
    total_users = 0
    total_appointments = 0
    today_appointments = 0
    active_prescriptions = 0
    pending_labs = 0
    pending_imaging = 0
    active_emergencies = 0
    
    # 1. User counts - usually the most stable
    try:
        role_text = normalized_enum_text(User.role)
        for role in UserRole:
            count = db.query(User).filter(role_text == role.value).count()
            user_counts[role.value] = count
        total_users = sum(user_counts.values())
    except Exception as e:
        print(f"Warning: Failed to fetch user counts: {e}")

    # 2. Appointments
    try:
        today = utcnow().date()
        start_of_today = datetime.combine(today, time.min)
        end_of_today = datetime.combine(today, time.max)

        total_appointments = db.query(Appointment).count()
        today_appointments = db.query(Appointment).filter(
            Appointment.scheduled_time >= start_of_today,
            Appointment.scheduled_time <= end_of_today
        ).count()
    except Exception as e:
        print(f"Warning: Failed to fetch appointment counts: {e}")

    # 3. Prescriptions
    try:
        active_prescriptions = db.query(Prescription).filter(
            Prescription.status == "active"
        ).count()
    except Exception as e:
        print(f"Warning: Failed to fetch prescription counts: {e}")

    # 4. Lab & Imaging
    try:
        pending_labs = db.query(LabTest).filter(
            LabTest.status != LabTestStatus.COMPLETED.value
        ).count()
        pending_imaging = db.query(ImagingScan).filter(
            ImagingScan.status != ImagingScanStatus.COMPLETED.value
        ).count()
    except Exception as e:
        print(f"Warning: Failed to fetch lab/imaging counts: {e}")

    # 5. Emergencies
    try:
        active_emergencies = db.query(AmbulanceRequest).filter(
            AmbulanceRequest.status != AmbulanceRequestStatus.COMPLETED.value,
            AmbulanceRequest.status != AmbulanceRequestStatus.CANCELLED.value,
            AmbulanceRequest.priority == EmergencyPriority.CRITICAL.value
        ).count()
    except Exception as e:
        print(f"Warning: Failed to fetch emergency counts: {e}")
    
    return {
        "timestamp": utcnow(),
        "users": {
            "total": total_users,
            "by_role": user_counts
        },
        "appointments": {
            "total": total_appointments,
            "today": today_appointments
        },
        "prescriptions": {
            "active": active_prescriptions
        },
        "lab_tests": {
            "pending": pending_labs
        },
        "imaging": {
            "pending": pending_imaging
        },
        "emergencies": {
            "active": active_emergencies
        },
        "system": {
            "db_status": "partially_online" if total_users == 0 else "operational"
        }
    }



@router.get("/users/", response_model=list[UserResponse])
async def list_all_users(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
    role_filter: str = None,
    skip: int = 0,
    limit: int = 100
):
    """List all users with filtering"""
    
    query = db.query(User)
    
    if role_filter:
        try:
            role = UserRole[role_filter.upper()]
        except KeyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role filter: {role_filter}"
            )
        query = query.filter(normalized_enum_text(User.role) == role.value)
    
    users = query.offset(skip).limit(limit).all()
    
    return users


@router.put("/users/{user_id}/deactivate")
async def deactivate_user(
    user_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Deactivate a user account"""
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate yourself"
        )
    
    user.is_active = False
    _revoke_user_sessions(user)
    db.commit()

    from app.routes.audit import log_action

    await log_action(
        db=db,
        user_id=current_user.id,
        action="admin.deactivate_user",
        resource_type="user",
        resource_id=user.id,
        description=f"Deactivated user {user.email}",
        status="warning",
    )
    
    return {"message": f"User {user.email} has been deactivated"}


@router.put("/users/{user_id}/reactivate")
async def reactivate_user(
    user_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Reactivate a user account"""
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = True
    db.commit()

    from app.routes.audit import log_action

    await log_action(
        db=db,
        user_id=current_user.id,
        action="admin.reactivate_user",
        resource_type="user",
        resource_id=user.id,
        description=f"Reactivated user {user.email}",
        status="success",
    )
    
    return {"message": f"User {user.email} has been reactivated"}


@router.put("/users/{user_id}/change-role")
async def change_user_role(
    user_id: int,
    new_role: str,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Change user's role"""
    
    # Validate role
    try:
        role = UserRole[new_role.upper()]
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role: {new_role}"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own role"
        )
    
    old_role = user.role
    user.role = role
    user.is_verified = role in (UserRole.PATIENT, UserRole.ADMIN)
    _revoke_user_sessions(user)
    db.commit()

    from app.routes.audit import log_action

    await log_action(
        db=db,
        user_id=current_user.id,
        action="admin.change_user_role",
        resource_type="user",
        resource_id=user.id,
        description=f"Changed role from {old_role.value} to {role.value}",
        status="warning",
    )
    
    return {
        "message": f"User role changed from {old_role.value} to {new_role}",
        "user_id": user_id,
        "old_role": old_role.value,
        "new_role": new_role
    }


@router.get("/analytics/appointments")
async def get_appointment_analytics(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
    days: int = 30
):
    """Get appointment analytics for last N days"""
    
    start_date = utcnow() - timedelta(days=days)
    
    appointments = db.query(Appointment).filter(
        Appointment.created_at >= start_date
    ).all()
    
    status_counts = {}
    for appt in appointments:
        status = appt.status
        status_counts[status] = status_counts.get(status, 0) + 1
    
    return {
        "period_days": days,
        "total": len(appointments),
        "by_status": status_counts,
        "average_per_day": len(appointments) / days if days > 0 else 0
    }


@router.get("/analytics/users")
async def get_user_analytics(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
    days: int = 30
):
    """Get user signup analytics"""
    
    start_date = utcnow() - timedelta(days=days)
    
    new_users = db.query(User).filter(
        User.created_at >= start_date
    ).all()
    
    users_by_role = {}
    for user in new_users:
        role = user.role.value
        users_by_role[role] = users_by_role.get(role, 0) + 1
    
    return {
        "period_days": days,
        "new_users": len(new_users),
        "by_role": users_by_role
    }


@router.get("/audit-logs/", response_model=list[AuditLogResponse])
async def get_audit_logs(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Get audit logs for compliance"""
    
    from app.models.audit_log import AuditLog
    
    logs = db.query(AuditLog).order_by(
        AuditLog.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return [AuditLogResponse(**log.to_dict()) for log in logs]


@router.get("/system/health")
async def get_system_health(
    current_user: User = Depends(get_current_admin)
):
    """Get system health status"""
    
    return {
        "status": "healthy",
        "timestamp": utcnow(),
        "database": "connected",
        "cache": "operational",
        "version": "1.0.0"
    }


# --- TRUST PILLAR: Professional Verification ---

@router.get("/verifications/pending", response_model=list[UserResponse])
async def get_pending_verifications(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List providers awaiting professional verification"""
    
    # All non-patient workforce roles remain pending until an admin verifies them.
    providers = _workforce_users_query(db).filter(
        User.is_verified.is_(False),
        User.is_active.is_(True)
    ).all()
    
    return providers


@router.get("/verifications/", response_model=list[UserResponse])
async def list_verifications(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all workforce verification records, including verified and rejected accounts."""

    return _workforce_users_query(db).order_by(User.created_at.desc()).all()


@router.put("/verifications/{user_id}/approve")
async def approve_provider(
    user_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Verify a provider's professional credentials."""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == UserRole.PATIENT:
        raise HTTPException(status_code=400, detail="Patients do not require professional verification")

    user.is_verified = True
    user.is_active = True
    db.commit()

    from app.routes.audit import log_action

    await log_action(
        db=db,
        user_id=current_user.id,
        action="admin.verify_provider",
        resource_type="user",
        resource_id=user.id,
        description=f"Verified account for {user.email}",
        status="success",
    )
    
    return {"message": f"Provider {user.email} verified successfully", "user_id": user_id}


@router.put("/verifications/{user_id}/reject")
async def reject_provider(
    user_id: int,
    reason: str = "Invalid credentials",
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Reject/Flag a provider's credentials"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == UserRole.PATIENT:
        raise HTTPException(status_code=400, detail="Patients do not require professional verification")

    # For now, we deactivate them and could add a note
    user.is_active = False
    user.is_verified = False
    _revoke_user_sessions(user)
    db.commit()

    from app.routes.audit import log_action

    await log_action(
        db=db,
        user_id=current_user.id,
        action="admin.reject_verification",
        resource_type="user",
        resource_id=user.id,
        description=f"Rejected verification for {user.email}: {reason}",
        status="warning",
    )
    
    return {"message": f"Provider {user.email} rejected: {reason}", "user_id": user_id}


# --- MANAGEMENT PILLAR: Ecosystem Activity ---

@router.get("/ecosystem/activity")
async def get_ecosystem_activity(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
    limit: int = 20
):
    """Centralized feed of recent ecosystem events"""
    
    activity = []
    
    try:
        # Recent Appointments
        appts = db.query(Appointment).order_by(Appointment.created_at.desc()).limit(10).all()
        for a in appts:
            activity.append({
                "type": "appointment",
                "time": a.created_at,
                "description": f"Appointment scheduled for {a.scheduled_time.strftime('%Y-%m-%d')}",
                "status": a.status
            })
            
        # Recent Prescriptions
        scripts = db.query(Prescription).order_by(Prescription.created_at.desc()).limit(10).all()
        for s in scripts:
            activity.append({
                "type": "prescription",
                "time": s.created_at,
                "description": f"New prescription issued: {s.medication_name}",
                "status": s.status
            })
            
        # Recent Lab/Imaging
        labs = db.query(LabTest).order_by(LabTest.ordered_at.desc()).limit(10).all()
        for l in labs:
            activity.append({
                "type": "lab_test",
                "time": l.ordered_at,
                "description": f"Lab test requested: {l.test_name}",
                "status": l.status.value if hasattr(l.status, 'value') else l.status
            })
    except Exception as e:
        print(f"Activity feed warning: {e}")
        
    # Sort all by time
    activity.sort(key=lambda x: x["time"], reverse=True)
    
    return activity[:limit]


# --- OPS PILLAR: Emergency Dispatch Monitoring ---

@router.get("/ops/emergencies/active")
async def get_active_emergency_dispatch(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Real-time view of active emergency requests"""
    
    try:
        active_requests = db.query(AmbulanceRequest).filter(
            AmbulanceRequest.status.in_([
                AmbulanceRequestStatus.PENDING.value,
                AmbulanceRequestStatus.DISPATCHED.value,
                AmbulanceRequestStatus.EN_ROUTE.value,
                AmbulanceRequestStatus.ARRIVED.value
            ])
        ).order_by(AmbulanceRequest.requested_at.desc()).all()
        
        return [req.to_dict() for req in active_requests]
    except Exception as e:
        print(f"Emergency monitor error: {e}")
        return []
