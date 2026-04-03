from sqlalchemy import Column, Integer, String, Enum, DateTime, Boolean, Text, Index
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base


class UserRole(str, enum.Enum):
    PATIENT = "patient"
    PROVIDER = "provider"  # Doctor
    PHARMACIST = "pharmacist"
    ADMIN = "admin"
    HOSPITAL = "hospital"
    LABORATORY = "laboratory"
    IMAGING = "imaging"
    AMBULANCE = "ambulance"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # Profile Information
    first_name = Column(String(255), nullable=False)
    last_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    date_of_birth = Column(DateTime, nullable=True)
    address = Column(String(500), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    zip_code = Column(String(20), nullable=True)
    
    # Account Information
    role = Column(Enum(UserRole), default=UserRole.PATIENT, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    profile_image_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    
    # License Information (for providers)
    license_number = Column(String(255), nullable=True)
    specialty = Column(String(255), nullable=True)
    license_state = Column(String(100), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_login = Column(DateTime, nullable=True)
    
    # Relationships
    appointments_as_patient = relationship("Appointment", foreign_keys="Appointment.patient_id", back_populates="patient")
    appointments_as_provider = relationship("Appointment", foreign_keys="Appointment.provider_id", back_populates="provider")
    prescriptions_as_patient = relationship("Prescription", foreign_keys="Prescription.patient_id", back_populates="patient")
    prescriptions_as_provider = relationship("Prescription", foreign_keys="Prescription.provider_id", back_populates="provider")
    allergies = relationship("Allergy", back_populates="patient")
    medical_histories = relationship("MedicalHistory", back_populates="patient")
    notifications = relationship("Notification", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")
    
    # Indexes
    __table_args__ = (
        Index('idx_user_email', 'email'),
        Index('idx_user_username', 'username'),
        Index('idx_user_role', 'role'),
        Index('idx_user_created_at', 'created_at'),
    )

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"
