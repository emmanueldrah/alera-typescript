from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from app.models import LabTest, User, UserRole, LabTestStatus
from app.schemas import LabTestResponse, LabTestCreate, LabTestUpdate
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/lab-tests", tags=["lab-tests"])


@router.post("/", response_model=LabTestResponse, status_code=status.HTTP_201_CREATED)
async def create_lab_test(
    lab_test: LabTestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Order a new lab test (provider only)"""
    
    if current_user.role not in [UserRole.PROVIDER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only providers can order lab tests"
        )
    
    # Verify patient exists
    patient = db.query(User).filter(User.id == lab_test.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    db_lab_test = LabTest(
        patient_id=lab_test.patient_id,
        ordered_by=current_user.id,
        test_name=lab_test.test_name,
        test_code=lab_test.test_code,
        description=lab_test.description,
        status=LabTestStatus.ORDERED
    )
    
    db.add(db_lab_test)
    db.commit()
    db.refresh(db_lab_test)
    
    return db_lab_test


@router.get("/", response_model=list[LabTestResponse])
async def list_lab_tests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """List lab tests for current user"""
    
    if current_user.role == UserRole.PATIENT:
        query = db.query(LabTest).filter(LabTest.patient_id == current_user.id)
    elif current_user.role == UserRole.LABORATORY:
        # Labs see everything assigned to them or unassigned completed? 
        # For now, labs see all orders.
        query = db.query(LabTest)
    elif current_user.role in [UserRole.PROVIDER, UserRole.ADMIN]:
        # Providers see tests they ordered or for their patients?
        # For now, admins see everything, providers see everything.
        query = db.query(LabTest)
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    return query.offset(skip).limit(limit).all()


@router.get("/{test_id}", response_model=LabTestResponse)
async def get_lab_test(
    test_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get lab test details"""
    
    db_lab_test = db.query(LabTest).filter(LabTest.id == test_id).first()
    
    if not db_lab_test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lab test not found"
        )
    
    # Verify access
    if current_user.role == UserRole.PATIENT and db_lab_test.patient_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    return db_lab_test


@router.put("/{test_id}", response_model=LabTestResponse)
async def update_lab_test(
    test_id: int,
    lab_test_update: LabTestUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update lab test status/results (lab/provider/admin only)"""
    
    db_lab_test = db.query(LabTest).filter(LabTest.id == test_id).first()
    
    if not db_lab_test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lab test not found"
        )
    
    # Verify authorization
    if current_user.role not in [UserRole.LABORATORY, UserRole.PROVIDER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update lab tests"
        )
    
    update_data = lab_test_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_lab_test, field, value)
    
    if current_user.role == UserRole.LABORATORY:
        db_lab_test.processed_by = current_user.id
        
    db.commit()
    db.refresh(db_lab_test)
    
    return db_lab_test
