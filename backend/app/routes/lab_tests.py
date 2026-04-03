from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from database import get_db
from app.models import LabTest, User, UserRole, LabTestStatus
from app.schemas import LabTestResponse, LabTestCreate, LabTestUpdate
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/lab-tests", tags=["lab-tests"])


def _display_name(user: User | None) -> str | None:
    if not user:
        return None
    name = f"{user.first_name or ''} {user.last_name or ''}".strip()
    return name or None


def lab_test_to_response(lt: LabTest) -> LabTestResponse:
    return LabTestResponse(
        id=lt.id,
        patient_id=lt.patient_id,
        ordered_by=lt.ordered_by,
        processed_by=lt.processed_by,
        test_name=lt.test_name,
        test_code=lt.test_code,
        description=lt.description,
        status=lt.status.value if lt.status else LabTestStatus.ORDERED.value,
        result_value=lt.result_value,
        result_unit=lt.result_unit,
        reference_range=lt.reference_range,
        result_notes=lt.result_notes,
        result_file_url=lt.result_file_url,
        ordered_at=lt.ordered_at,
        collected_at=lt.collected_at,
        completed_at=lt.completed_at,
        created_at=lt.created_at,
        patient_name=_display_name(lt.patient),
        ordered_by_name=_display_name(lt.doctor),
    )


def _load_lab_with_users(db: Session, test_id: int) -> LabTest | None:
    return (
        db.query(LabTest)
        .options(joinedload(LabTest.patient), joinedload(LabTest.doctor))
        .filter(LabTest.id == test_id)
        .first()
    )


@router.post("/", response_model=LabTestResponse, status_code=status.HTTP_201_CREATED)
async def create_lab_test(
    lab_test: LabTestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Order a new lab test (provider or admin)."""

    if current_user.role not in (UserRole.PROVIDER, UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only providers can order lab tests",
        )

    patient = db.query(User).filter(User.id == lab_test.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    db_lab_test = LabTest(
        patient_id=lab_test.patient_id,
        ordered_by=current_user.id,
        test_name=lab_test.test_name,
        test_code=lab_test.test_code,
        description=lab_test.description,
        status=LabTestStatus.ORDERED,
    )

    db.add(db_lab_test)
    db.commit()

    loaded = _load_lab_with_users(db, db_lab_test.id)
    if not loaded:
        raise HTTPException(status_code=500, detail="Failed to load created lab test")
    return lab_test_to_response(loaded)


@router.get("/", response_model=list[LabTestResponse])
async def list_lab_tests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    """List lab tests visible to the current user."""

    if current_user.role == UserRole.PATIENT:
        query = db.query(LabTest).filter(LabTest.patient_id == current_user.id)
    elif current_user.role == UserRole.LABORATORY:
        query = db.query(LabTest)
    elif current_user.role == UserRole.PROVIDER:
        query = db.query(LabTest).filter(LabTest.ordered_by == current_user.id)
    elif current_user.role == UserRole.ADMIN:
        query = db.query(LabTest)
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized",
        )

    rows = (
        query.options(joinedload(LabTest.patient), joinedload(LabTest.doctor))
        .order_by(LabTest.ordered_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [lab_test_to_response(lt) for lt in rows]


@router.get("/{test_id}", response_model=LabTestResponse)
async def get_lab_test(
    test_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get lab test details."""

    db_lab_test = _load_lab_with_users(db, test_id)
    if not db_lab_test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lab test not found",
        )

    if current_user.role == UserRole.PATIENT and db_lab_test.patient_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized",
        )
    if current_user.role == UserRole.PROVIDER and db_lab_test.ordered_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized",
        )

    return lab_test_to_response(db_lab_test)


@router.put("/{test_id}", response_model=LabTestResponse)
async def update_lab_test(
    test_id: int,
    lab_test_update: LabTestUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update lab test status/results (lab, ordering provider for own orders, or admin)."""

    db_lab_test = db.query(LabTest).filter(LabTest.id == test_id).first()
    if not db_lab_test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lab test not found",
        )

    if current_user.role not in (UserRole.LABORATORY, UserRole.PROVIDER, UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update lab tests",
        )
    if current_user.role == UserRole.PROVIDER and db_lab_test.ordered_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this lab test",
        )

    update_data = lab_test_update.model_dump(exclude_unset=True)
    if "status" in update_data and update_data["status"] is not None:
        try:
            db_lab_test.status = LabTestStatus(str(update_data["status"]))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid lab test status",
            ) from None
        del update_data["status"]

    for field, value in update_data.items():
        setattr(db_lab_test, field, value)

    if current_user.role == UserRole.LABORATORY:
        db_lab_test.processed_by = current_user.id

    db.commit()

    loaded = _load_lab_with_users(db, test_id)
    if not loaded:
        raise HTTPException(status_code=500, detail="Failed to load lab test")
    return lab_test_to_response(loaded)
