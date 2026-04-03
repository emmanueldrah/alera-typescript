"""
Ambulance and Emergency Request models
"""

from sqlalchemy import Column, String, DateTime, Integer, Text, ForeignKey, Enum as SQLEnum, Float
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
import sys
from database import Base


class AmbulanceRequestStatus(str, enum.Enum):
    PENDING = "pending"
    DISPATCHED = "dispatched"
    EN_ROUTE = "en_route"
    ARRIVED = "arrived"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class EmergencyPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AmbulanceRequest(Base):
    __tablename__ = "ambulance_requests"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    # Location info
    location_name = Column(String, nullable=False)
    address = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Request details
    description = Column(Text, nullable=True)
    status = Column(SQLEnum(AmbulanceRequestStatus), default=AmbulanceRequestStatus.PENDING)
    priority = Column(SQLEnum(EmergencyPriority), default=EmergencyPriority.MEDIUM)
    
    # Tracking
    requested_at = Column(DateTime, default=datetime.utcnow)
    dispatched_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    patient = relationship("User", foreign_keys=[patient_id])

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "location_name": self.location_name,
            "address": self.address,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "description": self.description,
            "status": self.status.value if self.status else None,
            "priority": self.priority.value if self.priority else None,
            "requested_at": self.requested_at.isoformat() if self.requested_at else None,
            "dispatched_at": self.dispatched_at.isoformat() if self.dispatched_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }


sys.modules.setdefault("app.models.ambulance", sys.modules[__name__])
sys.modules.setdefault("backend.app.models.ambulance", sys.modules[__name__])
