from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from app.models.allergy import Allergy
from app.models.user import User
from app.schemas import AllergyResponse, AllergyCreate, AllergyUpdate
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/allergies", tags=["allergies"])


@router.post("/", response_model=AllergyResponse, status_code=status.HTTP_201_CREATED)
async def create_allergy(
    allergy: AllergyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new allergy record"""
    
    db_allergy = Allergy(
        patient_id=current_user.id,
        allergen=allergy.allergen,
        allergen_type=allergy.allergen_type,
        reaction_description=allergy.reaction_description,
        severity=allergy.severity,
        onset_date=allergy.onset_date,
        treatment=allergy.treatment,
        confirmed="Y"
    )
    
    db.add(db_allergy)
    db.commit()
    db.refresh(db_allergy)
    
    return db_allergy


@router.get("/", response_model=list[AllergyResponse])
async def list_allergies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List allergies for current user"""
    
    # Patients see their own allergies, providers see patient's allergies
    if current_user.role.value == "patient":
        allergies = db.query(Allergy).filter(
            Allergy.patient_id == current_user.id
        ).all()
    else:
        # For now, providers need patient_id parameter
        allergies = []
    
    return allergies


@router.get("/{patient_id}", response_model=list[AllergyResponse])
async def list_patient_allergies(
    patient_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get allergies for a patient"""
    
    # Verify access
    if patient_id != current_user.id:
        if current_user.role.value not in ["provider", "pharmacist", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view these allergies"
            )
    
    allergies = db.query(Allergy).filter(
        Allergy.patient_id == patient_id
    ).all()
    
    return allergies


@router.put("/{allergy_id}", response_model=AllergyResponse)
async def update_allergy(
    allergy_id: int,
    allergy_update: AllergyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update allergy record"""
    
    allergy = db.query(Allergy).filter(
        Allergy.id == allergy_id
    ).first()
    
    if not allergy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Allergy not found"
        )
    
    # Verify access
    if allergy.patient_id != current_user.id:
        if current_user.role.value != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized"
            )
    
    update_data = allergy_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(allergy, field, value)
    
    db.commit()
    db.refresh(allergy)
    
    return allergy


@router.delete("/{allergy_id}")
async def delete_allergy(
    allergy_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete allergy record"""
    
    allergy = db.query(Allergy).filter(
        Allergy.id == allergy_id
    ).first()
    
    if not allergy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Allergy not found"
        )
    
    # Verify access
    if allergy.patient_id != current_user.id:
        if current_user.role.value != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized"
            )
    
    db.delete(allergy)
    db.commit()
    
    return {"message": "Allergy deleted"}
