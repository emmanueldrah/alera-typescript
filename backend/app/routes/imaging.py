from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from app.models import ImagingScan, User, UserRole, ImagingScanStatus
from app.schemas import ImagingScanResponse, ImagingScanCreate, ImagingScanUpdate
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/imaging", tags=["imaging"])


@router.post("/", response_model=ImagingScanResponse, status_code=status.HTTP_201_CREATED)
async def order_imaging_scan(
    imaging_scan: ImagingScanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Order a new imaging scan (provider only)"""
    
    if current_user.role not in [UserRole.PROVIDER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only providers can order imaging scans"
        )
    
    # Verify patient exists
    patient = db.query(User).filter(User.id == imaging_scan.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    db_imaging_scan = ImagingScan(
        patient_id=imaging_scan.patient_id,
        ordered_by=current_user.id,
        scan_type=imaging_scan.scan_type,
        body_part=imaging_scan.body_part,
        clinical_indication=imaging_scan.clinical_indication,
        status=ImagingScanStatus.ORDERED
    )
    
    db.add(db_imaging_scan)
    db.commit()
    db.refresh(db_imaging_scan)
    
    return db_imaging_scan


@router.get("/", response_model=list[ImagingScanResponse])
async def list_imaging_scans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """List imaging scans for current user"""
    
    if current_user.role == UserRole.PATIENT:
        query = db.query(ImagingScan).filter(ImagingScan.patient_id == current_user.id)
    elif current_user.role == UserRole.IMAGING:
        query = db.query(ImagingScan)
    elif current_user.role in [UserRole.PROVIDER, UserRole.ADMIN]:
        query = db.query(ImagingScan)
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    return query.offset(skip).limit(limit).all()


@router.get("/{scan_id}", response_model=ImagingScanResponse)
async def get_imaging_scan(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get imaging scan details"""
    
    db_imaging_scan = db.query(ImagingScan).filter(ImagingScan.id == scan_id).first()
    
    if not db_imaging_scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Imaging scan not found"
        )
    
    # Verify access
    if current_user.role == UserRole.PATIENT and db_imaging_scan.patient_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    return db_imaging_scan


@router.put("/{scan_id}", response_model=ImagingScanResponse)
async def update_imaging_scan(
    scan_id: int,
    imaging_scan_update: ImagingScanUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update imaging scan (imaging/provider/admin only)"""
    
    db_imaging_scan = db.query(ImagingScan).filter(ImagingScan.id == scan_id).first()
    
    if not db_imaging_scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Imaging scan not found"
        )
    
    # Verify authorization
    if current_user.role not in [UserRole.IMAGING, UserRole.PROVIDER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update imaging scans"
        )
    
    update_data = imaging_scan_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_imaging_scan, field, value)
    
    if current_user.role == UserRole.IMAGING:
        db_imaging_scan.processed_by = current_user.id
        
    db.commit()
    db.refresh(db_imaging_scan)
    
    return db_imaging_scan
