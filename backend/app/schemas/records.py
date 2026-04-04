from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field


class StructuredRecordCreate(BaseModel):
    id: Optional[str] = None
    record_type: str = Field(..., min_length=1)
    patient_id: Optional[int] = None
    provider_id: Optional[int] = None
    created_by: Optional[int] = None
    appointment_id: Optional[int] = None
    status: Optional[str] = None
    payload: dict[str, Any]


class StructuredRecordUpdate(BaseModel):
    patient_id: Optional[int] = None
    provider_id: Optional[int] = None
    created_by: Optional[int] = None
    appointment_id: Optional[int] = None
    status: Optional[str] = None
    payload: Optional[dict[str, Any]] = None


class StructuredRecordResponse(BaseModel):
    id: str
    record_type: str
    patient_id: Optional[int] = None
    provider_id: Optional[int] = None
    created_by: Optional[int] = None
    appointment_id: Optional[int] = None
    status: Optional[str] = None
    payload: dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StructuredRecordListResponse(BaseModel):
    total: int
    items: list[StructuredRecordResponse]


import sys

sys.modules.setdefault("app.schemas.records", sys.modules[__name__])
sys.modules.setdefault("backend.app.schemas.records", sys.modules[__name__])
