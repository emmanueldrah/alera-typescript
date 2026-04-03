from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from database import get_db
from app.models.appointment import Appointment, AppointmentStatus, AppointmentType
from app.models.user import User
from app.schemas import AppointmentResponse, AppointmentCreate, AppointmentUpdate
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/appointments", tags=["appointments"])


def _display_name(user: User | None) -> str | None:
    if not user:
        return None
    return f"{user.first_name} {user.last_name}".strip() or user.email


def serialize_appointment(apt: Appointment) -> AppointmentResponse:
    atype = apt.appointment_type.value if hasattr(apt.appointment_type, "value") else str(apt.appointment_type)
    st = apt.status.value if hasattr(apt.status, "value") else str(apt.status)
    return AppointmentResponse(
        id=apt.id,
        patient_id=apt.patient_id,
        provider_id=apt.provider_id,
        title=apt.title,
        description=apt.description,
        appointment_type=atype,
        scheduled_time=apt.scheduled_time,
        duration_minutes=apt.duration_minutes,
        location=apt.location,
        notes=apt.notes,
        status=st,
        created_at=apt.created_at,
        updated_at=apt.updated_at,
        patient_name=_display_name(apt.patient),
        provider_name=_display_name(apt.provider),
    )


def _load_appointment(db: Session, appointment_id: int) -> Appointment | None:
    return (
        db.query(Appointment)
        .options(joinedload(Appointment.patient), joinedload(Appointment.provider))
        .filter(Appointment.id == appointment_id)
        .first()
    )


@router.post("/", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    appointment: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new appointment"""

    provider = db.query(User).filter(User.id == appointment.provider_id).first()
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider not found",
        )

    try:
        atype = AppointmentType(appointment.appointment_type)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid appointment_type: {appointment.appointment_type}",
        )

    db_appointment = Appointment(
        patient_id=current_user.id,
        provider_id=appointment.provider_id,
        title=appointment.title,
        description=appointment.description,
        appointment_type=atype,
        scheduled_time=appointment.scheduled_time,
        duration_minutes=appointment.duration_minutes,
        location=appointment.location,
        notes=appointment.notes,
    )

    db.add(db_appointment)
    db.commit()

    apt = _load_appointment(db, db_appointment.id)
    if not apt:
        raise HTTPException(status_code=500, detail="Failed to load created appointment")
    return serialize_appointment(apt)


@router.get("/", response_model=list[AppointmentResponse])
async def list_appointments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    """List user's appointments"""

    q = db.query(Appointment).options(joinedload(Appointment.patient), joinedload(Appointment.provider))

    if current_user.role.value == "patient":
        q = q.filter(Appointment.patient_id == current_user.id)
    elif current_user.role.value in ("provider", "admin"):
        q = q.filter(Appointment.provider_id == current_user.id)
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized",
        )

    appointments = q.order_by(Appointment.scheduled_time.desc()).offset(skip).limit(limit).all()
    return [serialize_appointment(a) for a in appointments]


@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get appointment details"""

    appointment = _load_appointment(db, appointment_id)

    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        )

    if appointment.patient_id != current_user.id and appointment.provider_id != current_user.id:
        if current_user.role.value != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this appointment",
            )

    return serialize_appointment(appointment)


@router.put("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: int,
    appointment_update: AppointmentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update appointment"""

    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()

    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        )

    if appointment.patient_id != current_user.id and appointment.provider_id != current_user.id:
        if current_user.role.value != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this appointment",
            )

    update_data = appointment_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == "status" and value is not None:
            try:
                value = AppointmentStatus(value)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status: {value}",
                )
        setattr(appointment, field, value)

    db.commit()

    apt = _load_appointment(db, appointment_id)
    if not apt:
        raise HTTPException(status_code=500, detail="Failed to load appointment")
    return serialize_appointment(apt)


@router.delete("/{appointment_id}")
async def delete_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cancel appointment (soft — status set to cancelled)"""

    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()

    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        )

    if appointment.patient_id != current_user.id and appointment.provider_id != current_user.id:
        if current_user.role.value != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this appointment",
            )

    appointment.status = AppointmentStatus.CANCELLED
    db.commit()

    return {"message": "Appointment cancelled"}
