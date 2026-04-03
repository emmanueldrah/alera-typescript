from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum


class UserRole(str, Enum):
    PATIENT = "patient"
    PROVIDER = "provider"
    PHARMACIST = "pharmacist"
    ADMIN = "admin"
    HOSPITAL = "hospital"
    LABORATORY = "laboratory"
    IMAGING = "imaging"
    AMBULANCE = "ambulance"


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    role: UserRole = UserRole.PATIENT


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    bio: Optional[str] = None
    profile_image_url: Optional[str] = None
    specialization: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    first_name: str
    last_name: str
    role: str
    is_active: bool
    is_verified: bool
    phone: Optional[str]
    date_of_birth: Optional[datetime]
    city: Optional[str]
    state: Optional[str]
    zip_code: Optional[str]
    bio: Optional[str]
    profile_image_url: Optional[str]
    address: Optional[str]
    created_at: datetime
    last_login: Optional[datetime]
    
    class Config:
        from_attributes = True


# Authentication Schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str]
    token_type: str = "bearer"
    expires_in: int


class AuthResponse(TokenResponse):
    user: "UserResponse"


class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8)
    confirm_password: str


# Appointment Schemas
class AppointmentBase(BaseModel):
    title: str
    description: Optional[str] = None
    appointment_type: str  # in_person, telehealth, phone
    scheduled_time: datetime
    duration_minutes: int = 30
    location: Optional[str] = None
    notes: Optional[str] = None


class AppointmentCreate(AppointmentBase):
    provider_id: int


class AppointmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    scheduled_time: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class AppointmentResponse(AppointmentBase):
    id: int
    patient_id: int
    provider_id: int
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Prescription Schemas
class PrescriptionBase(BaseModel):
    medication_name: str
    dosage: str
    dosage_unit: str
    frequency: str
    route: str
    instructions: Optional[str] = None
    quantity: Optional[int] = None
    refills: int = 0
    start_date: datetime
    end_date: Optional[datetime] = None


class PrescriptionCreate(PrescriptionBase):
    provider_id: int


class PrescriptionUpdate(BaseModel):
    medication_name: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    instructions: Optional[str] = None
    status: Optional[str] = None
    refills_remaining: Optional[int] = None


class PrescriptionResponse(PrescriptionBase):
    id: int
    patient_id: int
    provider_id: int
    status: str
    prescribed_date: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True


# Allergy Schemas
class AllergyBase(BaseModel):
    allergen: str
    allergen_type: str
    reaction_description: str
    severity: str  # mild, moderate, severe
    onset_date: Optional[datetime] = None
    treatment: Optional[str] = None


class AllergyCreate(AllergyBase):
    pass


class AllergyUpdate(BaseModel):
    allergen: Optional[str] = None
    reaction_description: Optional[str] = None
    severity: Optional[str] = None
    treatment: Optional[str] = None


class AllergyResponse(AllergyBase):
    id: int
    patient_id: int
    confirmed: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# Notification Schemas
class NotificationBase(BaseModel):
    title: str
    message: str
    notification_type: str


class NotificationCreate(NotificationBase):
    related_id: Optional[int] = None
    related_type: Optional[str] = None
    action_url: Optional[str] = None


class NotificationResponse(NotificationBase):
    id: int
    is_read: bool
    is_archived: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Lab Test Schemas
class LabTestBase(BaseModel):
    test_name: str
    test_code: Optional[str] = None
    description: Optional[str] = None


class LabTestCreate(LabTestBase):
    patient_id: int
    ordered_by: int


class LabTestUpdate(BaseModel):
    status: Optional[str] = None
    result_value: Optional[str] = None
    result_unit: Optional[str] = None
    reference_range: Optional[str] = None
    result_notes: Optional[str] = None
    result_file_url: Optional[str] = None
    collected_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class LabTestResponse(LabTestBase):
    id: int
    patient_id: int
    ordered_by: int
    processed_by: Optional[int] = None
    status: str
    result_value: Optional[str] = None
    result_unit: Optional[str] = None
    reference_range: Optional[str] = None
    result_notes: Optional[str] = None
    result_file_url: Optional[str] = None
    ordered_at: datetime
    collected_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Imaging Scan Schemas
class ImagingScanBase(BaseModel):
    scan_type: str
    body_part: Optional[str] = None
    clinical_indication: Optional[str] = None


class ImagingScanCreate(ImagingScanBase):
    patient_id: int
    ordered_by: int


class ImagingScanUpdate(BaseModel):
    status: Optional[str] = None
    findings: Optional[str] = None
    impression: Optional[str] = None
    report_url: Optional[str] = None
    image_url: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class ImagingScanResponse(ImagingScanBase):
    id: int
    patient_id: int
    ordered_by: int
    processed_by: Optional[int] = None
    status: str
    findings: Optional[str] = None
    impression: Optional[str] = None
    report_url: Optional[str] = None
    image_url: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    ordered_at: datetime
    completed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Ambulance Request Schemas
class AmbulanceRequestBase(BaseModel):
    location_name: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: Optional[str] = None
    priority: Optional[str] = "medium"


class AmbulanceRequestCreate(AmbulanceRequestBase):
    patient_id: Optional[int] = None


class AmbulanceRequestUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    dispatched_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class AmbulanceRequestResponse(AmbulanceRequestBase):
    id: int
    patient_id: Optional[int] = None
    status: str
    requested_at: datetime
    dispatched_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

