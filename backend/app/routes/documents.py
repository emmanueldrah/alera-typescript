"""
File upload and document management endpoints
"""

import uuid
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from app.models.additional_features import PatientDocument
from app.models.user import User
from app.schemas.additional_features import (
    PatientDocumentResponse,
    PatientDocumentUpdate,
    DocumentListResponse,
)
from app.utils.dependencies import get_current_user, get_current_patient
from app.services.file_service import FileStorageService, DocumentService

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.post("/upload", response_model=PatientDocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    description: str = None,
    is_private: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a medical document
    
    Allowed file types: PDF, DOC, DOCX, JPG, JPEG, PNG, TXT, XLS, XLSX
    Max size: 25 MB
    """
    # Only patients can upload documents
    if current_user.role.value != "patient":
        raise HTTPException(status_code=403, detail="Only patients can upload documents")

    try:
        # Save file
        file_info = await FileStorageService.save_file(
            file,
            subfolder=f"documents/{current_user.id}",
            prefix="doc"
        )

        # Categorize document
        file_type = DocumentService.categorize_document(file.filename)

        # Create document record
        document = PatientDocument(
            id=str(uuid.uuid4()),
            patient_id=current_user.id,
            file_id=file_info["file_id"],
            filename=file_info["filename"],
            file_type=file_type,
            file_size=file_info["file_size"],
            mime_type=file_info["mime_type"],
            description=description,
            uploaded_by=current_user.id,
            is_private=is_private,
        )

        db.add(document)
        db.commit()
        db.refresh(document)

        return PatientDocumentResponse(**document.to_dict())

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload document: {str(e)}"
        )


@router.get("", response_model=DocumentListResponse)
async def list_documents(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all documents for the current user"""
    
    # Patients see only their documents
    if current_user.role.value == "patient":
        query = db.query(PatientDocument).filter(
            PatientDocument.patient_id == current_user.id
        )
    # Providers see their patients' documents (if shared)
    elif current_user.role.value == "provider":
        query = db.query(PatientDocument).filter(
            PatientDocument.is_private == False
        )
    # Admins see all documents
    else:
        query = db.query(PatientDocument)

    total = query.count()
    items = query.offset(skip).limit(limit).all()

    return DocumentListResponse(
        total=total,
        items=[PatientDocumentResponse(**doc.to_dict()) for doc in items]
    )


@router.get("/{document_id}", response_model=PatientDocumentResponse)
async def get_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific document"""
    
    document = db.query(PatientDocument).filter(
        PatientDocument.id == document_id
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Check permissions
    if current_user.role.value == "patient" and document.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    if current_user.role.value == "provider" and document.is_private:
        raise HTTPException(status_code=403, detail="Document is private")

    # Update access tracking
    document.accessed_count = (document.accessed_count or 0) + 1
    document.last_accessed = datetime.utcnow()
    db.commit()

    return PatientDocumentResponse(**document.to_dict())


@router.put("/{document_id}", response_model=PatientDocumentResponse)
async def update_document(
    document_id: str,
    update_data: PatientDocumentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update document metadata"""
    
    document = db.query(PatientDocument).filter(
        PatientDocument.id == document_id
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Only document owner can update
    if document.patient_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    # Update fields
    if update_data.description is not None:
        document.description = update_data.description
    if update_data.is_private is not None:
        document.is_private = update_data.is_private

    db.commit()
    db.refresh(document)

    return PatientDocumentResponse(**document.to_dict())


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a document"""
    
    document = db.query(PatientDocument).filter(
        PatientDocument.id == document_id
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Only document owner can delete
    if document.patient_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    # Delete file from storage
    FileStorageService.delete_file(document.file_id, f"documents/{document.patient_id}")

    # Delete database record
    db.delete(document)
    db.commit()

    return None


@router.post("/{document_id}/download")
async def download_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download a document"""
    from fastapi.responses import FileResponse
    
    document = db.query(PatientDocument).filter(
        PatientDocument.id == document_id
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Check permissions
    if current_user.role.value == "patient" and document.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    if current_user.role.value == "provider" and document.is_private:
        raise HTTPException(status_code=403, detail="Document is private")

    # Get file
    file_path = FileStorageService.get_file_path(
        document.file_id,
        f"documents/{document.patient_id}"
    )

    if not file_path or not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        path=file_path,
        filename=document.filename,
        media_type=document.mime_type
    )


@router.get("/patient/{patient_id}/documents", response_model=DocumentListResponse)
async def get_patient_documents(
    patient_id: int,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all documents for a patient (provider/admin only)"""
    
    if current_user.role.value not in ["provider", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied")

    query = db.query(PatientDocument).filter(
        PatientDocument.patient_id == patient_id,
        PatientDocument.is_private == False
    )

    if current_user.role.value == "admin":
        # Admins can see all documents
        query = db.query(PatientDocument).filter(
            PatientDocument.patient_id == patient_id
        )

    total = query.count()
    items = query.offset(skip).limit(limit).all()

    return DocumentListResponse(
        total=total,
        items=[PatientDocumentResponse(**doc.to_dict()) for doc in items]
    )
