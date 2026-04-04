"""Referrals — clinically distinct queues: specialist/hospital, laboratory, imaging, pharmacy."""

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.utils.time import utcnow

from database import Base

# Values must match API / frontend ReferralType
REFERRAL_TYPE_HOSPITAL = "hospital"
REFERRAL_TYPE_LABORATORY = "laboratory"
REFERRAL_TYPE_IMAGING = "imaging"
REFERRAL_TYPE_PHARMACY = "pharmacy"


class Referral(Base):
    __tablename__ = "referrals"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    from_doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    referral_type = Column(String(32), nullable=False, default=REFERRAL_TYPE_HOSPITAL, index=True)
    to_department = Column(String(255), nullable=False)
    to_department_id = Column(String(120), nullable=True)
    reason = Column(Text, nullable=False)
    notes = Column(Text, nullable=True)
    status = Column(String(32), nullable=False, default="pending")

    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    patient = relationship("User", foreign_keys=[patient_id])
    from_doctor = relationship("User", foreign_keys=[from_doctor_id])

    __table_args__ = (
        Index("idx_referral_patient", "patient_id"),
        Index("idx_referral_doctor", "from_doctor_id"),
        Index("idx_referral_status", "status"),
        Index("idx_referral_type", "referral_type"),
    )
