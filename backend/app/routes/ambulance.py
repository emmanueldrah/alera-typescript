from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from app.models import AmbulanceRequest, User, UserRole, AmbulanceRequestStatus, EmergencyPriority
from app.schemas import AmbulanceRequestResponse, AmbulanceRequestCreate, AmbulanceRequestUpdate
from app.utils.dependencies import get_current_user
from datetime import datetime

router = APIRouter(prefix="/api/ambulance", tags=["ambulance"])


@router.post("/", response_model=AmbulanceRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_ambulance_request(
    request: AmbulanceRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new ambulance/emergency request"""
    
    db_request = AmbulanceRequest(
        patient_id=request.patient_id or current_user.id,
        location_name=request.location_name,
        address=request.address,
        latitude=request.latitude,
        longitude=request.longitude,
        description=request.description,
        priority=EmergencyPriority(request.priority) if request.priority else EmergencyPriority.MEDIUM,
        status=AmbulanceRequestStatus.PENDING
    )
    
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    
    return db_request


@router.get("/", response_model=list[AmbulanceRequestResponse])
async def list_ambulance_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """List ambulance requests (filtered by user role)"""
    
    if current_user.role == UserRole.PATIENT:
        query = db.query(AmbulanceRequest).filter(AmbulanceRequest.patient_id == current_user.id)
    elif current_user.role in [UserRole.AMBULANCE, UserRole.ADMIN, UserRole.HOSPITAL]:
        # Dispatchers, Admins, and Hospitals see all requests
        query = db.query(AmbulanceRequest)
    else:
        # Others see only their own if they were assigned (simplified)
        query = db.query(AmbulanceRequest).filter(AmbulanceRequest.patient_id == current_user.id)
        
    return query.order_by(AmbulanceRequest.requested_at.desc()).offset(skip).limit(limit).all()


@router.get("/{request_id}", response_model=AmbulanceRequestResponse)
async def get_ambulance_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific ambulance request details"""
    
    db_request = db.query(AmbulanceRequest).filter(AmbulanceRequest.id == request_id).first()
    
    if not db_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ambulance request not found"
        )
        
    # Check access
    if current_user.role == UserRole.PATIENT and db_request.patient_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
        
    return db_request


@router.put("/{request_id}", response_model=AmbulanceRequestResponse)
async def update_ambulance_request(
    request_id: int,
    request_update: AmbulanceRequestUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update ambulance request status (dispatchers/admins only)"""
    
    db_request = db.query(AmbulanceRequest).filter(AmbulanceRequest.id == request_id).first()
    
    if not db_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ambulance request not found"
        )
        
    if current_user.role not in [UserRole.AMBULANCE, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only dispatchers or admins can update ambulance requests"
        )
        
    update_data = request_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == "status" and value:
            db_request.status = AmbulanceRequestStatus(value)
            if value == AmbulanceRequestStatus.DISPATCHED:
                db_request.dispatched_at = datetime.utcnow()
            elif value == AmbulanceRequestStatus.COMPLETED:
                db_request.completed_at = datetime.utcnow()
        elif field == "priority" and value:
            db_request.priority = EmergencyPriority(value)
        else:
            setattr(db_request, field, value)
            
    db.commit()
    db.refresh(db_request)
    
    return db_request
