from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from app.models.structured_record import StructuredRecord
from app.models.user import User, UserRole
from app.schemas.records import (
    StructuredRecordCreate,
    StructuredRecordListResponse,
    StructuredRecordResponse,
    StructuredRecordUpdate,
)
from app.utils.access import provider_panel_patient_ids, require_verified_workforce_member
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/records", tags=["records"])

PATIENT_OWNED_TYPES = {
    "vital_sign",
    "health_metric",
    "medical_history",
    "patient_consent",
    "patient_problem",
    "medication_adherence",
}

PROVIDER_PANEL_TYPES = PATIENT_OWNED_TYPES | {
    "clinical_note",
    "appointment_reminder",
    "prescription_refill_request",
    "invoice",
    "billing_record",
    "service_charge",
}

PHARMACY_TYPES = {"inventory_item", "prescription_refill_request"}
AMBULANCE_TYPES = {"ambulance_vehicle"}

ALL_TYPES = PROVIDER_PANEL_TYPES | PHARMACY_TYPES | AMBULANCE_TYPES | {"provider_pricing"}


def _serialize(record: StructuredRecord) -> StructuredRecordResponse:
    return StructuredRecordResponse(**record.to_dict())


def _require_allowed_type(record_type: str) -> None:
    if record_type not in ALL_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported record type")


def _panel_scope(db: Session, current_user: User) -> set[int]:
    if current_user.role == UserRole.PROVIDER:
        return provider_panel_patient_ids(db, current_user.id)
    return set()


def _apply_role_scope(query, db: Session, current_user: User, record_type: str):
    if current_user.role == UserRole.ADMIN:
        return query

    if current_user.role in (
        UserRole.PROVIDER,
        UserRole.PHARMACIST,
        UserRole.HOSPITAL,
        UserRole.LABORATORY,
        UserRole.IMAGING,
        UserRole.AMBULANCE,
    ):
        require_verified_workforce_member(current_user, f"view {record_type.replace('_', ' ')} records")

    if current_user.role == UserRole.PATIENT:
        if record_type in PATIENT_OWNED_TYPES | PROVIDER_PANEL_TYPES:
            return query.filter(StructuredRecord.patient_id == current_user.id)
        if record_type == "provider_pricing":
            return query.filter(StructuredRecord.provider_id == current_user.id)
        return query.filter(False)

    if current_user.role == UserRole.PROVIDER:
        panel_ids = _panel_scope(db, current_user)
        if record_type == "provider_pricing":
            return query.filter(StructuredRecord.provider_id == current_user.id)
        if panel_ids and record_type in PROVIDER_PANEL_TYPES:
            return query.filter(
                (StructuredRecord.patient_id.in_(panel_ids)) | (StructuredRecord.provider_id == current_user.id)
            )
        if record_type == "provider_pricing":
            return query.filter(StructuredRecord.provider_id == current_user.id)
        return query.filter(StructuredRecord.provider_id == current_user.id)

    if current_user.role == UserRole.PHARMACIST:
        if record_type in PHARMACY_TYPES:
            return query
        return query.filter(False)

    if current_user.role in (UserRole.HOSPITAL, UserRole.AMBULANCE):
        if record_type in AMBULANCE_TYPES | {"invoice", "billing_record"}:
            return query
        return query.filter(False)

    return query.filter(False)


def _authorizes_patient_scope(current_user: User, patient_id: int | None, db: Session, record_type: str) -> bool:
    if current_user.role == UserRole.ADMIN:
        return True
    if current_user.role == UserRole.PATIENT:
        return patient_id == current_user.id
    if current_user.role == UserRole.PROVIDER:
        if patient_id is None:
            return False
        return patient_id in provider_panel_patient_ids(db, current_user.id)
    return False


@router.get("/", response_model=StructuredRecordListResponse)
async def list_records(
    record_type: str = Query(..., min_length=1),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_allowed_type(record_type)
    skip = max(skip, 0)
    limit = max(1, min(limit, 500))

    query = db.query(StructuredRecord).filter(StructuredRecord.record_type == record_type)
    query = _apply_role_scope(query, db, current_user, record_type)
    total = query.count()
    items = query.order_by(StructuredRecord.created_at.desc()).offset(skip).limit(limit).all()
    return StructuredRecordListResponse(total=total, items=[_serialize(item) for item in items])


@router.post("/", response_model=StructuredRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_record(
    body: StructuredRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_allowed_type(body.record_type)

    if current_user.role in (
        UserRole.PROVIDER,
        UserRole.PHARMACIST,
        UserRole.HOSPITAL,
        UserRole.LABORATORY,
        UserRole.IMAGING,
        UserRole.AMBULANCE,
    ):
        require_verified_workforce_member(current_user, f"create {body.record_type.replace('_', ' ')} records")

    if body.record_type in PATIENT_OWNED_TYPES | PROVIDER_PANEL_TYPES:
        if current_user.role == UserRole.PATIENT:
            body.patient_id = current_user.id
        elif current_user.role == UserRole.PROVIDER:
            if body.patient_id is None or body.patient_id not in provider_panel_patient_ids(db, current_user.id):
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this patient")
            body.provider_id = current_user.id
        elif current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    elif body.record_type == "provider_pricing":
        if current_user.role == UserRole.PROVIDER:
            body.provider_id = current_user.id
        elif current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    elif body.record_type in PHARMACY_TYPES:
        if current_user.role not in (UserRole.PHARMACIST, UserRole.ADMIN):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    elif body.record_type in AMBULANCE_TYPES:
        if current_user.role not in (UserRole.AMBULANCE, UserRole.HOSPITAL, UserRole.ADMIN):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported record type")

    record = StructuredRecord(
        id=body.id or str(uuid.uuid4()),
        record_type=body.record_type,
        patient_id=body.patient_id,
        provider_id=body.provider_id,
        created_by=body.created_by or current_user.id,
        appointment_id=body.appointment_id,
        status=body.status,
        payload=body.payload,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return _serialize(record)


@router.get("/{record_id}", response_model=StructuredRecordResponse)
async def get_record(
    record_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = db.query(StructuredRecord).filter(StructuredRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")

    _require_allowed_type(record.record_type)
    query = db.query(StructuredRecord).filter(StructuredRecord.id == record_id)
    scoped = _apply_role_scope(query, db, current_user, record.record_type).first()
    if not scoped:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    return _serialize(record)


@router.put("/{record_id}", response_model=StructuredRecordResponse)
async def update_record(
    record_id: str,
    body: StructuredRecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = db.query(StructuredRecord).filter(StructuredRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")

    _require_allowed_type(record.record_type)
    if current_user.role == UserRole.ADMIN:
        pass
    elif current_user.role == UserRole.PATIENT:
        if record.patient_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    elif current_user.role == UserRole.PROVIDER:
        require_verified_workforce_member(current_user, f"update {record.record_type.replace('_', ' ')} records")
        panel_ids = provider_panel_patient_ids(db, current_user.id)
        if record.record_type == "provider_pricing":
            if record.provider_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        elif record.patient_id not in panel_ids and record.provider_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    elif current_user.role == UserRole.PHARMACIST:
        require_verified_workforce_member(current_user, f"update {record.record_type.replace('_', ' ')} records")
        if record.record_type not in PHARMACY_TYPES:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    elif current_user.role in (UserRole.HOSPITAL, UserRole.AMBULANCE):
        require_verified_workforce_member(current_user, f"update {record.record_type.replace('_', ' ')} records")
        if record.record_type not in AMBULANCE_TYPES:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(record, field, value)

    db.commit()
    db.refresh(record)
    return _serialize(record)


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_record(
    record_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = db.query(StructuredRecord).filter(StructuredRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")

    _require_allowed_type(record.record_type)
    if current_user.role == UserRole.ADMIN:
        pass
    elif current_user.role == UserRole.PATIENT:
        if record.patient_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    elif current_user.role == UserRole.PROVIDER:
        require_verified_workforce_member(current_user, f"delete {record.record_type.replace('_', ' ')} records")
        panel_ids = provider_panel_patient_ids(db, current_user.id)
        if record.record_type == "provider_pricing":
            if record.provider_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        elif record.patient_id not in panel_ids and record.provider_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    elif current_user.role == UserRole.PHARMACIST:
        require_verified_workforce_member(current_user, f"delete {record.record_type.replace('_', ' ')} records")
        if record.record_type not in PHARMACY_TYPES:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    elif current_user.role in (UserRole.HOSPITAL, UserRole.AMBULANCE):
        require_verified_workforce_member(current_user, f"delete {record.record_type.replace('_', ' ')} records")
        if record.record_type not in AMBULANCE_TYPES:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    db.delete(record)
    db.commit()
    return None


import sys

sys.modules.setdefault("app.routes.records", sys.modules[__name__])
sys.modules.setdefault("backend.app.routes.records", sys.modules[__name__])
