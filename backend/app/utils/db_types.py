"""Shared SQLAlchemy type helpers."""

from __future__ import annotations

def enum_values(enum_cls: type) -> list[str]:
    """Return the persisted values for a Python Enum class."""
    return [member.value for member in enum_cls]
