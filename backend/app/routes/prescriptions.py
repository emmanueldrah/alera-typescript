from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from app.models.prescription import Prescription
from app.models.user import User
from app.schemas import PrescriptionResponse, PrescriptionCreate, PrescriptionUpdate
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/prescriptions", tags=["prescriptions"])


@router.post("/", response_model=PrescriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_prescription(
    prescription: PrescriptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new prescription (provider only)"""
    
    if current_user.role.value not in ["provider", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only providers can create prescriptions"
        )
    
    # Verify patient exists
    patient = db.query(User).filter(User.id == prescription.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
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
        status="active"
    )
    
    db.add(db_prescription)
    db.commit()
    db.refresh(db_prescription)
    
    return db_prescription


@router.get("/", response_model=list[PrescriptionResponse])
async def list_prescriptions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """List prescriptions for current user"""
    
    if current_user.role.value == "patient":
        prescriptions = db.query(Prescription).filter(
            Prescription.patient_id == current_user.id
        ).offset(skip).limit(limit).all()
    elif current_user.role.value in ["provider", "pharmacist", "admin"]:
        prescriptions = db.query(Prescription).filter(
            Prescription.provider_id == current_user.id
        ).offset(skip).limit(limit).all()
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    return prescriptions


@router.get("/{prescription_id}", response_model=PrescriptionResponse)
async def get_prescription(
    prescription_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get prescription details"""
    
    prescription = db.query(Prescription).filter(
        Prescription.id == prescription_id
    ).first()
    
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found"
        )
    
    # Verify access
    if prescription.patient_id != current_user.id and prescription.provider_id != current_user.id:
        if current_user.role.value not in ["pharmacist", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized"
            )
    
    return prescription


@router.put("/{prescription_id}", response_model=PrescriptionResponse)
async def update_prescription(
    prescription_id: int,
    prescription_update: PrescriptionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update prescription (provider/pharmacist only)"""
    
    prescription = db.query(Prescription).filter(
        Prescription.id == prescription_id
    ).first()
    
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found"
        )
    
    # Verify access
    if prescription.provider_id != current_user.id:
        if current_user.role.value != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this prescription"
            )
    
    update_data = prescription_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(prescription, field, value)
    
    db.commit()
    db.refresh(prescription)
    
    return prescription
