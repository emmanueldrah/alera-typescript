from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import String, cast, func

from app.models.appointment import Appointment
from app.models.user import User, UserRole


WORKFORCE_ROLES = {
    UserRole.PROVIDER,
    UserRole.PHARMACIST,
    UserRole.HOSPITAL,
    UserRole.LABORATORY,
    UserRole.IMAGING,
    UserRole.AMBULANCE,
}


def is_workforce_role(role: UserRole | str | None) -> bool:
    if role is None:
        return False
    value = role.value if hasattr(role, "value") else str(role)
    return value in {member.value for member in WORKFORCE_ROLES}


def normalized_enum_text(column):
    """Return a lowercase text expression for Enum-backed columns.

    PostgreSQL enum labels can drift between legacy uppercase values and the
    lowercase values the application now uses. Casting to text and lowering
    the expression avoids binding failures and keeps queries tolerant of either
    representation.
    """

    return func.lower(cast(column, String))


def require_verified_workforce_member(user: User, action: str) -> None:
    """
    Block non-patient workforce accounts until an admin verifies them.

    Admin accounts are intentionally exempt because they are seeded and managed
    out-of-band from the public registration flow.
    """

    if user.role in WORKFORCE_ROLES and not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Your account is pending verification and cannot {action}.",
        )


def provider_panel_patient_ids(db: Session, provider_id: int) -> set[int]:
    rows = (
        db.query(Appointment.patient_id)
        .filter(Appointment.provider_id == provider_id)
        .distinct()
        .all()
    )
    return {row[0] for row in rows}


def provider_can_access_patient(db: Session, provider_id: int, patient_id: int) -> bool:
    return patient_id in provider_panel_patient_ids(db, provider_id)


def require_provider_panel_access(db: Session, provider_id: int, patient_id: int, action: str) -> None:
    if not provider_can_access_patient(db, provider_id, patient_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You are not authorized to {action} for this patient.",
        )
