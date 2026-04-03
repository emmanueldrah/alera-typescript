from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from database import get_db
from app.models.prescription import Prescription
from app.models.user import User
from app.schemas import PrescriptionResponse, PrescriptionCreate, PrescriptionUpdate
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/prescriptions", tags=["prescriptions"])


def _display_name(u: User | None) -> str | None:
    if not u:
        return None
    return f"{u.first_name} {u.last_name}".strip() or u.email


def serialize_prescription(rx: Prescription) -> PrescriptionResponse:
    return PrescriptionResponse(
        id=rx.id,
        patient_id=rx.patient_id,
        provider_id=rx.provider_id,
        medication_name=rx.medication_name,
        dosage=rx.dosage,
        dosage_unit=rx.dosage_unit,
        frequency=rx.frequency,
        route=rx.route,
        instructions=rx.instructions,
        quantity=rx.quantity,
        refills=rx.refills,
        start_date=rx.start_date,
        end_date=rx.end_date,
        status=rx.status,
        prescribed_date=rx.prescribed_date,
        created_at=rx.created_at,
        refills_remaining=rx.refills_remaining,
        patient_name=_display_name(rx.patient),
        provider_name=_display_name(rx.provider),
    )


def _load_prescription(db: Session, prescription_id: int) -> Prescription | None:
    return (
        db.query(Prescription)
        .options(joinedload(Prescription.patient), joinedload(Prescription.provider))
        .filter(Prescription.id == prescription_id)
        .first()
    )


@router.post("/", response_model=PrescriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_prescription(
    prescription: PrescriptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new prescription (provider only)"""

    if current_user.role.value not in ["provider", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only providers can create prescriptions",
        )

    patient = db.query(User).filter(User.id == prescription.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    db_prescription = Prescription(
        patient_id=prescription.patient_id,
        provider_id=current_user.id,
        medication_name=prescription.medication_name,
        dosage=prescription.dosage,
        dosage_unit=prescription.dosage_unit,
        frequency=prescription.frequency,
        route=prescription.route,
        instructions=prescription.instructions,
        quantity=prescription.quantity,
        refills=prescription.refills,
        refills_remaining=prescription.refills,
        start_date=prescription.start_date,
        end_date=prescription.end_date,
        status="active",
    )

    db.add(db_prescription)
    db.commit()

    loaded = _load_prescription(db, db_prescription.id)
    if not loaded:
        raise HTTPException(status_code=500, detail="Failed to load created prescription")
    return serialize_prescription(loaded)


@router.get("/", response_model=list[PrescriptionResponse])
async def list_prescriptions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    """List prescriptions for current user"""

    q = db.query(Prescription).options(joinedload(Prescription.patient), joinedload(Prescription.provider))

    if current_user.role.value == "patient":
        q = q.filter(Prescription.patient_id == current_user.id)
    elif current_user.role.value in ("pharmacist", "admin"):
        pass  # pharmacy / admin: workflow queue (all prescriptions)
    elif current_user.role.value in ("provider",):
        q = q.filter(Prescription.provider_id == current_user.id)
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized",
        )

    rows = q.order_by(Prescription.created_at.desc()).offset(skip).limit(limit).all()
    return [serialize_prescription(r) for r in rows]


@router.get("/{prescription_id}", response_model=PrescriptionResponse)
async def get_prescription(
    prescription_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get prescription details"""

    prescription = _load_prescription(db, prescription_id)

    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found",
        )

    if prescription.patient_id != current_user.id and prescription.provider_id != current_user.id:
        if current_user.role.value not in ("pharmacist", "admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized",
            )

    return serialize_prescription(prescription)


@router.put("/{prescription_id}", response_model=PrescriptionResponse)
async def update_prescription(
    prescription_id: int,
    prescription_update: PrescriptionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update prescription (prescriber, admin, or pharmacist for dispensing fields)"""

    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()

    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found",
        )

    is_owner = prescription.provider_id == current_user.id
    is_admin = current_user.role.value == "admin"
    is_pharmacist = current_user.role.value == "pharmacist"

    if not (is_owner or is_admin or is_pharmacist):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this prescription",
        )

    update_data = prescription_update.dict(exclude_unset=True)
    if is_pharmacist and not is_admin:
        allowed = {"status", "refills_remaining", "instructions"}
        update_data = {k: v for k, v in update_data.items() if k in allowed}

    for field, value in update_data.items():
        setattr(prescription, field, value)

    db.commit()

    loaded = _load_prescription(db, prescription_id)
    if not loaded:
        raise HTTPException(status_code=500, detail="Failed to load prescription")
    return serialize_prescription(loaded)
