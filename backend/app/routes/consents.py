"""
Patient consent management endpoints
"""

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from app.models.additional_features import PatientConsent
from app.models.user import User
from app.schemas.additional_features import (
    PatientConsentCreate,
    PatientConsentUpdate,
    PatientConsentResponse,
    ConsentListResponse,
)
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/consents", tags=["consents"])


@router.post("", response_model=PatientConsentResponse)
async def create_consent(
    consent_data: PatientConsentCreate,
    patient_id: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a consent request for a patient"""
    
    if current_user.role.value not in ["provider", "admin"]:
        raise HTTPException(status_code=403, detail="Only providers and admins can request consents")

    if not patient_id:
        patient_id = current_user.id if current_user.role.value == "patient" else None

    if not patient_id:
        raise HTTPException(status_code=400, detail="patient_id is required")

    try:
        consent = PatientConsent(
            id=str(uuid.uuid4()),
            patient_id=patient_id,
            consent_type=consent_data.consent_type,
            title=consent_data.title,
            description=consent_data.description,
            expires_at=consent_data.expires_at,
            requested_by=current_user.id,
        )

        db.add(consent)
        db.commit()
        db.refresh(consent)

        return PatientConsentResponse(**consent.to_dict())

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create consent: {str(e)}")


@router.get("", response_model=ConsentListResponse)
async def list_consents(
    skip: int = 0,
    limit: int = 20,
    patient_id: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List consents"""
    
    query = db.query(PatientConsent)

    # Patients see only their consents
    if current_user.role.value == "patient":
        query = query.filter(PatientConsent.patient_id == current_user.id)
    # Providers see consents they requested
    elif current_user.role.value == "provider":
        query = query.filter(PatientConsent.requested_by == current_user.id)

    # Filter by patient if specified
    if patient_id:
        if current_user.role.value == "patient" and patient_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        query = query.filter(PatientConsent.patient_id == patient_id)

    total = query.count()
    items = query.offset(skip).limit(limit).all()

    return ConsentListResponse(
        total=total,
        items=[PatientConsentResponse(**consent.to_dict()) for consent in items]
    )


@router.get("/{consent_id}", response_model=PatientConsentResponse)
async def get_consent(
    consent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific consent"""
    
    consent = db.query(PatientConsent).filter(
        PatientConsent.id == consent_id
    ).first()

    if not consent:
        raise HTTPException(status_code=404, detail="Consent not found")

    # Check permissions
    if current_user.role.value == "patient" and consent.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return PatientConsentResponse(**consent.to_dict())


@router.put("/{consent_id}", response_model=PatientConsentResponse)
async def update_consent(
    consent_id: str,
    update_data: PatientConsentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update consent status (patient accepts/declines)"""
    
    consent = db.query(PatientConsent).filter(
        PatientConsent.id == consent_id
    ).first()

    if not consent:
        raise HTTPException(status_code=404, detail="Consent not found")

    # Only patient can accept/decline their consent
    if consent.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        if update_data.is_accepted is not None:
            consent.is_accepted = update_data.is_accepted
            if update_data.is_accepted:
                consent.accepted_at = datetime.utcnow()
            else:
                consent.accepted_at = None

        if update_data.title is not None:
            consent.title = update_data.title

        if update_data.description is not None:
            consent.description = update_data.description

        db.commit()
        db.refresh(consent)

        return PatientConsentResponse(**consent.to_dict())

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update consent: {str(e)}")


@router.post("/{consent_id}/accept", response_model=PatientConsentResponse)
async def accept_consent(
    consent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Patient accepts a consent request"""
    
    consent = db.query(PatientConsent).filter(
        PatientConsent.id == consent_id
    ).first()

    if not consent:
        raise HTTPException(status_code=404, detail="Consent not found")

    if consent.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Check expiration
    if consent.expires_at and consent.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Consent has expired")

    consent.is_accepted = True
    consent.accepted_at = datetime.utcnow()
    db.commit()
    db.refresh(consent)

    return PatientConsentResponse(**consent.to_dict())


@router.post("/{consent_id}/decline", response_model=PatientConsentResponse)
async def decline_consent(
    consent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Patient declines a consent request"""
    
    consent = db.query(PatientConsent).filter(
        PatientConsent.id == consent_id
    ).first()

    if not consent:
        raise HTTPException(status_code=404, detail="Consent not found")

    if consent.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    consent.is_accepted = False
    consent.accepted_at = None
    db.commit()
    db.refresh(consent)

    return PatientConsentResponse(**consent.to_dict())


@router.delete("/{consent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_consent(
    consent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a consent (requester only)"""
    
    consent = db.query(PatientConsent).filter(
        PatientConsent.id == consent_id
    ).first()

    if not consent:
        raise HTTPException(status_code=404, detail="Consent not found")

    # Only requester or admin can delete
    if consent.requested_by != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    db.delete(consent)
    db.commit()

    return None
