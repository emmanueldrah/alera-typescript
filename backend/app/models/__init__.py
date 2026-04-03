from .user import User, UserRole
from .appointment import Appointment, AppointmentStatus
from .prescription import Prescription
from .allergy import Allergy
from .medical_history import MedicalHistory
from .notification import Notification
from .audit_log import AuditLog
from .telemedicine import VideoCall, Message
from .lab_imaging import LabTest, ImagingScan, LabTestStatus, ImagingScanStatus
from .ambulance import AmbulanceRequest, AmbulanceRequestStatus, EmergencyPriority
from .additional_features import (
    PatientDocument,
    PatientConsent,
    AppointmentReminder,
    EmailTemplate,
    SMSTemplate,
    DocumentType,
)

__all__ = [
    "User",
    "UserRole",
    "Appointment",
    "AppointmentStatus",
    "Prescription",
    "Allergy",
    "MedicalHistory",
    "Notification",
    "AuditLog",
    "VideoCall",
    "Message",
    "LabTest",
    "ImagingScan",
    "LabTestStatus",
    "ImagingScanStatus",
    "AmbulanceRequest",
    "AmbulanceRequestStatus",
    "EmergencyPriority",
    "PatientDocument",
    "PatientConsent",
    "AppointmentReminder",
    "EmailTemplate",
    "SMSTemplate",
    "DocumentType",
]

import sys

# Keep package-level imports consistent regardless of path style.
sys.modules.setdefault("app.models", sys.modules[__name__])
sys.modules.setdefault("backend.app.models", sys.modules[__name__])
