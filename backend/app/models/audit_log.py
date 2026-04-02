from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    
    # Relationship
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    # Action Details
    action = Column(String(255), nullable=False)
    resource_type = Column(String(100), nullable=False)  # User, Appointment, Prescription, etc.
    resource_id = Column(Integer, nullable=True)
    
    # Change Details
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    
    # Request Info
    ip_address = Column(String(45), nullable=True)  # supports IPv6
    user_agent = Column(Text, nullable=True)
    
    # Compliance
    reason = Column(String(500), nullable=True)  # Why was this action taken
    severity = Column(String(50), default="info", nullable=False)  # info, warning, critical
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Relationship
    user = relationship("User", back_populates="audit_logs")
    
    # Indexes
    __table_args__ = (
        Index('idx_audit_log_user_id', 'user_id'),
        Index('idx_audit_log_resource', 'resource_type', 'resource_id'),
        Index('idx_audit_log_action', 'action'),
        Index('idx_audit_log_created_at', 'created_at'),
        Index('idx_audit_log_severity', 'severity'),
    )

    def __repr__(self):
        return f"<AuditLog(id={self.id}, action={self.action}, resource={self.resource_type})>"

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "action": self.action,
            "resource_type": self.resource_type,
            "resource_id": self.resource_id,
            "old_value": self.old_value,
            "new_value": self.new_value,
            "changes": self.old_value,
            "description": self.new_value,
            "ip_address": self.ip_address,
            "user_agent": self.user_agent,
            "reason": self.reason,
            "severity": self.severity,
            "status": self.severity,
            "error_message": self.reason,
            "timestamp": self.created_at.isoformat() if self.created_at else None,
        }
