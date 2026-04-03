from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from app.models import Referral, User, UserRole
from app.models.appointment import Appointment
from app.schemas import ReferralCreate, ReferralUpdate, ReferralResponse
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/referrals", tags=["referrals"])


def _display_name(user: User | None) -> str | None:
    if not user:
        return None
    name = f"{user.first_name or ''} {user.last_name or ''}".strip()
    return name or None


def _provider_panel_patient_ids(db: Session, provider_id: int) -> set[int]:
    rows = (
        db.query(Appointment.patient_id)
        .filter(Appointment.provider_id == provider_id)
        .distinct()
        .all()
    )
    return {r[0] for r in rows}


def referral_to_response(ref: Referral, db: Session) -> ReferralResponse:
    patient = db.query(User).filter(User.id == ref.patient_id).first()
    doctor = db.query(User).filter(User.id == ref.from_doctor_id).first()
    return ReferralResponse(
        id=ref.id,
        patient_id=ref.patient_id,
        from_doctor_id=ref.from_doctor_id,
        to_department=ref.to_department,
        to_department_id=ref.to_department_id,
        reason=ref.reason,
        notes=ref.notes,
        status=ref.status,
        created_at=ref.created_at,
        updated_at=ref.updated_at,
        patient_name=_display_name(patient),
        from_doctor_name=_display_name(doctor),
    )


@router.post("/", response_model=ReferralResponse, status_code=status.HTTP_201_CREATED)
async def create_referral(
    body: ReferralCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in (UserRole.PROVIDER, UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only providers can create referrals",
        )

    patient = db.query(User).filter(User.id == body.patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    if current_user.role == UserRole.PROVIDER:
        if body.patient_id not in _provider_panel_patient_ids(db, current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only refer patients you have an appointment with",
            )

    ref = Referral(
        patient_id=body.patient_id,
        from_doctor_id=current_user.id,
        to_department=body.to_department,
        to_department_id=body.to_department_id,
        reason=body.reason,
        notes=body.notes,
        status="pending",
    )
    db.add(ref)
    db.commit()
    db.refresh(ref)
    return referral_to_response(ref, db)


@router.get("/", response_model=list[ReferralResponse])
async def list_referrals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 200,
):
    if current_user.role == UserRole.PATIENT:
        q = db.query(Referral).filter(Referral.patient_id == current_user.id)
    elif current_user.role == UserRole.PROVIDER:
        q = db.query(Referral).filter(Referral.from_doctor_id == current_user.id)
    elif current_user.role in (UserRole.HOSPITAL, UserRole.ADMIN):
        q = db.query(Referral)
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    rows = q.order_by(Referral.created_at.desc()).offset(skip).limit(limit).all()
    return [referral_to_response(r, db) for r in rows]


@router.get("/{referral_id}", response_model=ReferralResponse)
async def get_referral(
    referral_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ref = db.query(Referral).filter(Referral.id == referral_id).first()
    if not ref:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Referral not found")

    if current_user.role == UserRole.PATIENT and ref.patient_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    if current_user.role == UserRole.PROVIDER and ref.from_doctor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    if current_user.role not in (
        UserRole.PATIENT,
        UserRole.PROVIDER,
        UserRole.HOSPITAL,
        UserRole.ADMIN,
    ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    return referral_to_response(ref, db)


@router.put("/{referral_id}", response_model=ReferralResponse)
async def update_referral(
    referral_id: int,
    body: ReferralUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ref = db.query(Referral).filter(Referral.id == referral_id).first()
    if not ref:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Referral not found")

    data = body.model_dump(exclude_unset=True)

    if current_user.role == UserRole.PROVIDER:
        if ref.from_doctor_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        if data.get("status") is not None and data["status"] != "cancelled":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Providers may only cancel referrals",
            )
        if data.get("status") == "cancelled" and ref.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only pending referrals can be cancelled",
            )
    elif current_user.role in (UserRole.HOSPITAL, UserRole.ADMIN):
        pass
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    for field, value in data.items():
        setattr(ref, field, value)

    db.commit()
    db.refresh(ref)
    return referral_to_response(ref, db)
