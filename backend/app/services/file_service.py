"""
File management utilities and services for ALERA healthcare platform
"""

import os
import uuid
from pathlib import Path
from typing import Optional
from datetime import datetime
from fastapi import UploadFile, HTTPException
import shutil
from config import settings


# Configuration constants
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".txt", ".xls", ".xlsx"}
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB

# Upload directory cache
_UPLOAD_DIR_CACHE = None


def get_upload_dir():
    """
    Get the upload directory path - lazily initialized.
    This is deferred from module import time to avoid filesystem access on startup.
    """
    global _UPLOAD_DIR_CACHE
    
    if _UPLOAD_DIR_CACHE is not None:
        return _UPLOAD_DIR_CACHE
    
    try:
        is_vercel = os.path.exists('/var/task') or os.path.exists('/var/runtime')
        is_production = settings.ENVIRONMENT == "production"
        
        if is_vercel or is_production:
            _UPLOAD_DIR_CACHE = Path("/tmp/alera_uploads")
        else:
            _UPLOAD_DIR_CACHE = Path("uploads")
    except Exception:
        # Fallback to /tmp if any error occurs
        _UPLOAD_DIR_CACHE = Path("/tmp/alera_uploads")
    
    return _UPLOAD_DIR_CACHE


class FileStorageService:
    """Handle file uploads and storage"""

    @staticmethod
    def ensure_upload_directory():
        """Create upload directory if needed - called only when actually saving files"""
        try:
            # Never fails on read-only filesystem - just silently continues
            get_upload_dir().mkdir(exist_ok=True, parents=True)
        except Exception:
            # Silently ignore all errors - we'll handle them when actually writing
            pass

    @staticmethod
    def validate_file(file: UploadFile) -> tuple[bool, str]:
        """
        Validate uploaded file
        Returns: (is_valid, message)
        """
        if not file.filename:
            return False, "No filename provided"

        # Check file extension
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            allowed = ", ".join(ALLOWED_EXTENSIONS)
            return False, f"File type not allowed. Allowed types: {allowed}"

        # Check file size (we'll verify actual size during upload)
        return True, "Valid"

    @staticmethod
    async def save_file(
        file: UploadFile,
        subfolder: str = "documents",
        prefix: str = "file"
    ) -> dict:
        """
        Save uploaded file and return file info
        
        Returns dict with:
            - file_id: Unique identifier
            - filename: Original filename
            - file_path: Storage path
            - file_size: Size in bytes
            - mime_type: MIME type
            - upload_time: ISO timestamp
        """
        # Validate file
        is_valid, message = FileStorageService.validate_file(file)
        if not is_valid:
            raise HTTPException(status_code=400, detail=message)

        # Ensure filename is not None
        if not file.filename or not isinstance(file.filename, str):
            raise HTTPException(status_code=400, detail="Invalid filename")

        # Ensure upload directory exists
        FileStorageService.ensure_upload_directory()

        # Create subfolder
        save_dir = get_upload_dir() / subfolder
        try:
            save_dir.mkdir(parents=True, exist_ok=True)
        except Exception:
            pass

        # Generate unique filename
        filename = file.filename if file.filename else "unknown"
        file_ext = Path(filename).suffix.lower()
        file_id = f"{prefix}_{uuid.uuid4().hex[:12]}"
        unique_filename = f"{file_id}{file_ext}"
        file_path = save_dir / unique_filename

        # Check file size while reading
        try:
            contents = await file.read()
            if len(contents) > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=413,
                    detail=f"File too large. Max size: 25 MB"
                )

            # Write file
            with open(file_path, "wb") as f:
                f.write(contents)

            return {
                "file_id": file_id,
                "filename": file.filename,
                "file_path": str(file_path),
                "file_size": len(contents),
                "mime_type": file.content_type or "application/octet-stream",
                "upload_time": datetime.utcnow().isoformat(),
            }
        except Exception as e:
            try:
                if file_path.exists():
                    file_path.unlink()
            except Exception:
                pass
            raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    @staticmethod
    def get_file_path(file_id: str, subfolder: str = "documents") -> Optional[Path]:
        """Get file path by file ID"""
        if not file_id or not isinstance(file_id, str):
            return None
        
        save_dir = get_upload_dir() / subfolder
        
        # Find file with this ID (could be any extension)
        try:
            for file_path in save_dir.glob(f"{file_id}.*"):
                if file_path.is_file():
                    return file_path
        except Exception:
            pass
        
        return None

    @staticmethod
    def delete_file(file_id: str, subfolder: str = "documents") -> bool:
        """Delete a file by file ID"""
        if not file_id:
            return False
        
        file_path = FileStorageService.get_file_path(file_id, subfolder)
        if file_path and file_path.exists():
            try:
                file_path.unlink()
                return True
            except Exception:
                return False
        return False

    @staticmethod
    def get_file_size(file_id: str, subfolder: str = "documents") -> int:
        """Get file size in bytes"""
        if not file_id:
            return 0
        
        file_path = FileStorageService.get_file_path(file_id, subfolder)
        if file_path and file_path.exists():
            try:
                return file_path.stat().st_size
            except Exception:
                return 0
        return 0


class DocumentService:
    """Handle document-related operations"""

    @staticmethod
    def generate_document_reference(document_type: str, user_id: str) -> str:
        """
        Generate a unique document reference
        Format: DOC_TYPE_USERID_TIMESTAMP
        """
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        doc_type_abbr = document_type[:4].upper()
        user_abbr = user_id[:6]
        return f"{doc_type_abbr}_{user_abbr}_{timestamp}"

    @staticmethod
    def categorize_document(filename: str) -> str:
        """Categorize document based on filename"""
        filename_lower = filename.lower()
        
        if any(x in filename_lower for x in ["prescription", "med", "rx"]):
            return "prescription"
        elif any(x in filename_lower for x in ["lab", "test", "result"]):
            return "lab_result"
        elif any(x in filename_lower for x in ["image", "scan", "x-ray", "ct", "mri"]):
            return "imaging"
        elif any(x in filename_lower for x in ["consent", "form", "agreement"]):
            return "consent"
        elif any(x in filename_lower for x in ["note", "clinical", "summary"]):
            return "clinical_note"
        else:
            return "other"

