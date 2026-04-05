"""
Audit log and compliance endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
import sys

from database import get_db
from app.models import AuditLog
from app.models.user import User
from app.schemas.additional_features import (
    AuditLogResponse,
    AuditLogFilter,
    AuditLogListResponse,
)
from app.utils.dependencies import get_current_user
from app.utils.time import utcnow

router = APIRouter(prefix="/api/audit", tags=["audit"])


def _normalize_audit_severity(value: str) -> str:
    normalized = value.strip().lower()
    if normalized in {"success", "info", "created", "updated"}:
        return "info"
    if normalized in {"warning", "warn"}:
        return "warning"
    if normalized in {"error", "failed", "failure", "critical"}:
        return "critical"
    return "info"


async def log_action(
    db: Session,
    user_id: Optional[int],
    action: str,
    resource_type: Optional[str] = None,
    resource_id: Optional[int] = None,
    changes: Optional[str] = None,
    description: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    status: str = "success",
    error_message: Optional[str] = None,
):
    """
    Helper function to log an action for audit trail
    This should be called from other endpoints to record actions
    """
    try:
        audit_log = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            old_value=changes,
            new_value=description,
            ip_address=ip_address,
            user_agent=user_agent,
            reason=error_message,
            severity=_normalize_audit_severity(status),
        )
        db.add(audit_log)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Failed to log audit action: {str(e)}")


@router.get("", response_model=AuditLogListResponse)
async def get_audit_logs(
    skip: int = 0,
    limit: int = 50,
    user_id: Optional[int] = None,
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get audit logs (admin only)
    
    Filters:
    - user_id: Filter by user
    - action: Filter by action (view, create, update, delete, etc.)
    - resource_type: Filter by resource type
    - days: Number of days to look back (default: 30, max: 2555 for 7 years)
    """
    
    if current_user.role.value not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Only admins can view audit logs")

    # Clamp request parameters to safe ranges.
    days = max(1, min(days, 2555))
    skip = max(skip, 0)
    limit = max(1, min(limit, 100))

    start_date = utcnow() - timedelta(days=days)
    
    query = db.query(AuditLog).filter(AuditLog.created_at >= start_date)

    if user_id is not None:
        query = query.filter(AuditLog.user_id == user_id)

    if action:
        query = query.filter(AuditLog.action == action)

    if resource_type:
        query = query.filter(AuditLog.resource_type == resource_type)

    # Order by most recent first
    query = query.order_by(AuditLog.created_at.desc())

    total = query.count()
    items = query.offset(skip).limit(limit).all()

    return AuditLogListResponse(
        total=total,
        items=[AuditLogResponse(**log.to_dict()) for log in items]
    )


@router.post("/export", status_code=status.HTTP_200_OK)
async def export_audit_logs(
    filter_data: AuditLogFilter,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Export audit logs as CSV
    For compliance and auditing purposes
    (Admin only)
    """
    
    if current_user.role.value not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Only admins can export logs")

    from fastapi.responses import StreamingResponse
    import csv
    import io

    query = db.query(AuditLog)

    if filter_data.user_id is not None:
        query = query.filter(AuditLog.user_id == filter_data.user_id)

    if filter_data.action:
        query = query.filter(AuditLog.action == filter_data.action)

    if filter_data.resource_type:
        query = query.filter(AuditLog.resource_type == filter_data.resource_type)

    if filter_data.start_date:
        query = query.filter(AuditLog.created_at >= filter_data.start_date)

    if filter_data.end_date:
        query = query.filter(AuditLog.created_at <= filter_data.end_date)

    logs = query.order_by(AuditLog.created_at.desc()).all()

    # Create CSV
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=[
        'id', 'user_id', 'action', 'resource_type', 'resource_id',
        'description', 'status', 'timestamp', 'ip_address'
    ])
    writer.writeheader()

    for log in logs:
        log_data = log.to_dict()
        writer.writerow({
            'id': log_data["id"],
            'user_id': log_data["user_id"],
            'action': log_data["action"],
            'resource_type': log_data["resource_type"],
            'resource_id': log_data["resource_id"],
            'description': log_data["description"],
            'status': log_data["status"],
            'timestamp': log_data["timestamp"],
            'ip_address': log_data["ip_address"],
        })

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment;filename=audit_logs.csv"}
    )


@router.get("/compliance/data-retention", status_code=status.HTTP_200_OK)
async def get_data_retention_policy(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get data retention policy information
    Shows HIPAA compliance details
    """
    
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view compliance info")

    # Get oldest log
    oldest_log = db.query(AuditLog).order_by(AuditLog.created_at.asc()).first()

    return {
        "policy": "7-year retention for HIPAA compliance",
        "retention_days": 2555,
        "oldest_record": oldest_log.created_at.isoformat() if oldest_log is not None else None,
        "oldest_record_days_old": (utcnow() - oldest_log.created_at).days if oldest_log is not None else 0,
        "description": "All audit logs are retained for 7 years as required by HIPAA regulations",
        "gdpr_compliance": "Personal data is deleted upon patient request unless legal hold applies",
    }


@router.get("/user/{user_id}/history", response_model=AuditLogListResponse)
async def get_user_audit_history(
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get audit history for a specific user"""
    
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view audit history")

    days = max(1, min(days, 2555))
    skip = max(skip, 0)
    limit = max(1, min(limit, 100))

    start_date = utcnow() - timedelta(days=days)

    query = db.query(AuditLog).filter(
        AuditLog.user_id == user_id,
        AuditLog.created_at >= start_date
    ).order_by(AuditLog.created_at.desc())

    total = query.count()
    items = query.offset(skip).limit(limit).all()

    return AuditLogListResponse(
        total=total,
        items=[AuditLogResponse(**log.to_dict()) for log in items]
    )


@router.get("/resource/{resource_type}/{resource_id}/changes", response_model=AuditLogListResponse)
async def get_resource_changes(
    resource_type: str,
    resource_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get audit trail for a specific resource
    Shows all changes to a patient, appointment, prescription, etc.
    """
    
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view resource changes")

    skip = max(skip, 0)
    limit = max(1, min(limit, 100))

    query = db.query(AuditLog).filter(
        AuditLog.resource_type == resource_type,
        AuditLog.resource_id == resource_id
    ).order_by(AuditLog.created_at.desc())

    total = query.count()
    items = query.offset(skip).limit(limit).all()

    return AuditLogListResponse(
        total=total,
        items=[AuditLogResponse(**log.to_dict()) for log in items]
    )


@router.get("/{log_id}", response_model=AuditLogResponse)
async def get_audit_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific audit log entry (admin only)"""
    
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view audit logs")

    audit_log = db.query(AuditLog).filter(
        AuditLog.id == log_id
    ).first()

    if not audit_log:
        raise HTTPException(status_code=404, detail="Audit log not found")

    return AuditLogResponse(**audit_log.to_dict())


sys.modules.setdefault("app.routes.audit", sys.modules[__name__])
sys.modules.setdefault("backend.app.routes.audit", sys.modules[__name__])
