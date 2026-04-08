from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from database import get_db
from app.models import ImagingScan, User, UserRole, ImagingScanStatus
from app.schemas import ImagingScanResponse, ImagingScanCreate, ImagingScanUpdate
from app.utils.dependencies import get_current_user
from app.utils.access import require_verified_workforce_member

router = APIRouter(prefix="/api/imaging", tags=["imaging"])


def _display_name(user: User | None) -> str | None:
    if not user:
        return None
    name = f"{user.first_name or ''} {user.last_name or ''}".strip()
    return name or None


def imaging_to_response(scan: ImagingScan) -> ImagingScanResponse:
    return ImagingScanResponse(
        id=scan.id,
        patient_id=scan.patient_id,
        ordered_by=scan.ordered_by,
        destination_provider_id=scan.destination_provider_id,
        destination_provider_name=_display_name(scan.destination_provider),
        processed_by=scan.processed_by,
        scan_type=scan.scan_type,
        body_part=scan.body_part,
        clinical_indication=scan.clinical_indication,
        status=scan.status.value if scan.status else ImagingScanStatus.ORDERED.value,
        findings=scan.findings,
        impression=scan.impression,
        report_url=scan.report_url,
        image_url=scan.image_url,
        scheduled_at=scan.scheduled_at,
        ordered_at=scan.ordered_at,
        completed_at=scan.completed_at,
        created_at=scan.created_at,
        patient_name=_display_name(scan.patient),
        ordered_by_name=_display_name(scan.doctor),
    )


def _load_scan_with_users(db: Session, scan_id: int) -> ImagingScan | None:
    return (
        db.query(ImagingScan)
        .options(joinedload(ImagingScan.patient), joinedload(ImagingScan.doctor), joinedload(ImagingScan.destination_provider))
        .filter(ImagingScan.id == scan_id)
        .first()
    )


@router.post("/", response_model=ImagingScanResponse, status_code=status.HTTP_201_CREATED)
async def order_imaging_scan(
    imaging_scan: ImagingScanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Order a new imaging scan (provider or admin)."""

    if current_user.role not in (UserRole.PROVIDER, UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only providers can order imaging scans",
        )
    if current_user.role == UserRole.PROVIDER:
        require_verified_workforce_member(current_user, "order imaging scans")

    patient = db.query(User).filter(User.id == imaging_scan.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    destination_provider = db.query(User).filter(User.id == imaging_scan.destination_provider_id).first()
    if not destination_provider or destination_provider.role != UserRole.IMAGING:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Destination provider must be an imaging center")
    if not destination_provider.is_active or not destination_provider.is_verified:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Destination imaging center must be active and verified")

    db_imaging_scan = ImagingScan(
        patient_id=imaging_scan.patient_id,
        ordered_by=current_user.id,
        destination_provider_id=imaging_scan.destination_provider_id,
        scan_type=imaging_scan.scan_type,
        body_part=imaging_scan.body_part,
        clinical_indication=imaging_scan.clinical_indication,
        status=ImagingScanStatus.ORDERED,
    )

    db.add(db_imaging_scan)
    db.commit()

    loaded = _load_scan_with_users(db, db_imaging_scan.id)
    if not loaded:
        raise HTTPException(status_code=500, detail="Failed to load created imaging scan")

    from app.routes.audit import log_action

    await log_action(
        db=db,
        user_id=current_user.id,
        action="imaging_scan.create",
        resource_type="imaging_scan",
        resource_id=loaded.id,
        description=f"Ordered imaging scan {loaded.scan_type} for patient {loaded.patient_id}",
        status="created",
    )
    return imaging_to_response(loaded)


@router.get("/", response_model=list[ImagingScanResponse])
async def list_imaging_scans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    """List imaging scans visible to the current user."""

    if current_user.role == UserRole.PATIENT:
        query = db.query(ImagingScan).filter(ImagingScan.patient_id == current_user.id)
    elif current_user.role == UserRole.IMAGING:
        require_verified_workforce_member(current_user, "view imaging scans")
        query = db.query(ImagingScan).filter(ImagingScan.destination_provider_id == current_user.id)
    elif current_user.role == UserRole.PROVIDER:
        require_verified_workforce_member(current_user, "view imaging scans")
        query = db.query(ImagingScan).filter(ImagingScan.ordered_by == current_user.id)
    elif current_user.role == UserRole.ADMIN:
        query = db.query(ImagingScan)
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized",
        )

    rows = (
        query.options(joinedload(ImagingScan.patient), joinedload(ImagingScan.doctor), joinedload(ImagingScan.destination_provider))
        .order_by(ImagingScan.ordered_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [imaging_to_response(s) for s in rows]


@router.get("/{scan_id}", response_model=ImagingScanResponse)
async def get_imaging_scan(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get imaging scan details."""

    db_imaging_scan = _load_scan_with_users(db, scan_id)
    if not db_imaging_scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Imaging scan not found",
        )

    if current_user.role == UserRole.PATIENT and db_imaging_scan.patient_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized",
        )
    if current_user.role == UserRole.PROVIDER and db_imaging_scan.ordered_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized",
        )
    if current_user.role in (UserRole.PROVIDER, UserRole.IMAGING):
        require_verified_workforce_member(current_user, "view imaging scans")

    return imaging_to_response(db_imaging_scan)


@router.put("/{scan_id}", response_model=ImagingScanResponse)
async def update_imaging_scan(
    scan_id: int,
    imaging_scan_update: ImagingScanUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update imaging scan (imaging staff, ordering provider for own orders, or admin)."""

    db_imaging_scan = db.query(ImagingScan).filter(ImagingScan.id == scan_id).first()
    if not db_imaging_scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Imaging scan not found",
        )

    if current_user.role not in (UserRole.IMAGING, UserRole.PROVIDER, UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update imaging scans",
        )
    if current_user.role == UserRole.PROVIDER and db_imaging_scan.ordered_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this imaging scan",
        )
    if current_user.role in (UserRole.PROVIDER, UserRole.IMAGING):
        require_verified_workforce_member(current_user, "update imaging scans")

    update_data = imaging_scan_update.model_dump(exclude_unset=True)
    if "status" in update_data and update_data["status"] is not None:
        try:
            db_imaging_scan.status = ImagingScanStatus(str(update_data["status"]))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid imaging scan status",
            ) from None
        del update_data["status"]

    for field, value in update_data.items():
        setattr(db_imaging_scan, field, value)

    if current_user.role == UserRole.IMAGING:
        db_imaging_scan.processed_by = current_user.id

    db.commit()

    loaded = _load_scan_with_users(db, scan_id)
    if not loaded:
        raise HTTPException(status_code=500, detail="Failed to load imaging scan")

    from app.routes.audit import log_action

    await log_action(
        db=db,
        user_id=current_user.id,
        action="imaging_scan.update",
        resource_type="imaging_scan",
        resource_id=loaded.id,
        description=f"Updated imaging scan {loaded.id}",
        status="updated",
    )
    return imaging_to_response(loaded)


@router.delete("/{scan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_imaging_scan(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete an imaging scan order (ordering provider or admin)."""

    db_imaging_scan = db.query(ImagingScan).filter(ImagingScan.id == scan_id).first()
    if not db_imaging_scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Imaging scan not found",
        )

    if current_user.role == UserRole.PROVIDER:
        require_verified_workforce_member(current_user, "delete imaging scans")
        if db_imaging_scan.ordered_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this imaging scan",
            )
    elif current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete imaging scans",
        )

    db.delete(db_imaging_scan)
    db.commit()
    return None
    if current_user.role == UserRole.IMAGING and db_imaging_scan.destination_provider_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized",
        )
    if current_user.role == UserRole.IMAGING and db_imaging_scan.destination_provider_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this imaging scan",
        )
