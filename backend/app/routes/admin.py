from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from app.models.user import User, UserRole
from app.models.appointment import Appointment, AppointmentStatus
from app.models.prescription import Prescription
from app.utils.dependencies import get_current_admin
from app.schemas import UserResponse
from app.schemas.additional_features import AuditLogResponse
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/dashboard/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get admin dashboard statistics"""
    
    # Count users by role
    user_counts = {}
    for role in UserRole:
        count = db.query(User).filter(User.role == role).count()
        user_counts[role.value] = count
    
    # Count appointments
    total_appointments = db.query(Appointment).count()
    today_appointments = db.query(Appointment).filter(
        func.date(Appointment.scheduled_time) == datetime.utcnow().date()
    ).count()
    
    # Count prescriptions
    active_prescriptions = db.query(Prescription).filter(
        Prescription.status == "active"
    ).count()
    
    return {
        "timestamp": datetime.utcnow(),
        "users": user_counts,
        "appointments": {
            "total": total_appointments,
            "today": today_appointments
        },
        "prescriptions": {
            "active": active_prescriptions
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
        query = query.filter(User.role == role)
    
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
    db.commit()
    
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
    db.commit()
    
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
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
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
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
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
        "timestamp": datetime.utcnow(),
        "database": "connected",
        "cache": "operational",
        "version": "1.0.0"
    }
