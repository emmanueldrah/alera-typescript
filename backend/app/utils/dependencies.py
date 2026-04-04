from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from database import get_db
from app.models.user import User
from app.utils.auth import decode_token, get_user_id_from_payload
from app.utils.access import require_verified_workforce_member


async def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user from JWT token in cookie"""
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token not found"
        )

    payload = decode_token(token)
    user_id = get_user_id_from_payload(payload)

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    token_session_version = payload.get("sv")
    if token_session_version is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired",
        )

    try:
        token_session_version_int = int(token_session_version)
    except (TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session token",
        ) from exc

    if token_session_version_int != user.session_version:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired",
        )
    
    return user


async def get_current_patient(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current user and verify they are a patient"""
    if current_user.role.value != "patient":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can access this resource"
        )
    return current_user


async def get_current_provider(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current user and verify they are a provider"""
    if current_user.role.value not in ["provider", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only providers can access this resource"
        )
    if current_user.role.value == "provider":
        require_verified_workforce_member(current_user, "access provider resources")
    return current_user


async def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current user and verify they are an admin"""
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can access this resource"
        )
    return current_user


async def get_current_pharmacist(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current user and verify they are a pharmacist"""
    if current_user.role.value not in ["pharmacist", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only pharmacists can access this resource"
        )
    if current_user.role.value == "pharmacist":
        require_verified_workforce_member(current_user, "access pharmacist resources")
    return current_user
