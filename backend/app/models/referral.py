"""Referrals from providers to hospital departments."""

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, Index
from sqlalchemy.orm import relationship
from datetime import datetime

from database import Base


class Referral(Base):
    __tablename__ = "referrals"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    from_doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    to_department = Column(String(255), nullable=False)
    to_department_id = Column(String(120), nullable=True)
    reason = Column(Text, nullable=False)
    notes = Column(Text, nullable=True)
    status = Column(String(32), nullable=False, default="pending")

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    patient = relationship("User", foreign_keys=[patient_id])
    from_doctor = relationship("User", foreign_keys=[from_doctor_id])

    __table_args__ = (
        Index("idx_referral_patient", "patient_id"),
        Index("idx_referral_doctor", "from_doctor_id"),
        Index("idx_referral_status", "status"),
    )
