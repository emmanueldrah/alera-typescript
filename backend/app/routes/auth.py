from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from pydantic import BaseModel
from database import get_db
from app.schemas import (
    LoginRequest,
    TokenResponse,
    AuthResponse,
    UserCreate,
    UserResponse,
    PasswordChangeRequest,
    PasswordResetRequest,
    PasswordResetConfirmRequest,
    EmailVerificationConfirmRequest,
)
from app.models.user import User, UserRole
from app.utils.auth import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    get_user_id_from_payload,
    generate_secure_token,
    hash_token,
)
from app.utils.cookies import set_auth_cookies, clear_auth_cookies, set_csrf_token, clear_csrf_token
from app.utils.csrf import generate_csrf_token
from app.utils.dependencies import get_current_user
from app.services.email_service import EmailService
from app.utils.time import utcnow
from config import settings
import sys

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class DeleteAccountRequest(BaseModel):
    password: str


def _frontend_link(path: str, token: str) -> str:
    return f"{settings.FRONTEND_URL.rstrip('/')}{path}?token={token}"


def _issue_email_verification_token(user: User, db: Session) -> str:
    token = generate_secure_token()
    user.email_verification_token_hash = hash_token(token)
    user.email_verification_expires_at = utcnow() + timedelta(hours=24)
    return token


def _issue_password_reset_token(user: User, db: Session) -> str:
    token = generate_secure_token()
    user.password_reset_token_hash = hash_token(token)
    user.password_reset_expires_at = utcnow() + timedelta(hours=24)
    return token


def _build_token_pair(user: User) -> tuple[str, str]:
    session_version = int(user.session_version or 0)
    payload = {"sub": str(user.id), "sv": session_version}
    access_token = create_access_token(
        data=payload,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    refresh_token = create_refresh_token(data=payload)
    return access_token, refresh_token


def _serialize_user(user: User) -> UserResponse:
    return UserResponse.model_validate(user)


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    response: Response = None,
):
    """Register a new user"""

    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )

    if user_data.role in (UserRole.ADMIN, UserRole.SUPER_ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin accounts cannot be created through public registration",
        )

    # Create new user
    hashed_password = hash_password(user_data.password)
    is_verified = user_data.role == UserRole.PATIENT
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone=user_data.phone,
        date_of_birth=user_data.date_of_birth,
        address=user_data.address,
        city=user_data.city,
        state=user_data.state,
        zip_code=user_data.zip_code,
        role=UserRole(user_data.role.value),
        license_number=user_data.license_number,
        specialty=user_data.specialty,
        license_state=user_data.license_state,
        is_verified=is_verified,
        email_verified=False,
        email_verified_at=None,
        is_active=True,
        session_version=0,
        notification_email=True,
        notification_sms=False,
        privacy_public_profile=False,
    )

    db.add(db_user)
    db.flush()

    if not db_user.email_verified:
        verification_token = _issue_email_verification_token(db_user, db)
        try:
            from app.utils.notification_utils import NotificationManager
            await NotificationManager.send_verification_email(
                user=db_user,
                verification_link=_frontend_link("/verify-email", verification_token),
            )
        except HTTPException:
            db.rollback()
            raise

    try:
        db.commit()
        db.refresh(db_user)
    except Exception:
        db.rollback()
        raise

    access_token, refresh_token = _build_token_pair(db_user)

    csrf_token = generate_csrf_token()
    if response is not None:
        # Set secure cookies
        set_auth_cookies(response, access_token, refresh_token)
        # Set CSRF token
        set_csrf_token(response, csrf_token)

    from app.routes.audit import log_action

    await log_action(
        db=db,
        user_id=db_user.id,
        action="auth.register",
        resource_type="user",
        resource_id=db_user.id,
        description=f"Registered account with role {db_user.role.value}",
        status="created",
    )

    return {
        "message": "Account created successfully",
        "user": _serialize_user(db_user),
        "access_token": access_token,
        "refresh_token": refresh_token,
        "csrf_token": csrf_token,
    }


@router.post("/login")
async def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db),
    response: Response = None,
):
    """Authenticate user and return access token"""

    # Find user by email
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled"
        )
    user.last_login = utcnow()
    db.commit()
    db.refresh(user)

    # Create tokens
    access_token, refresh_token = _build_token_pair(user)

    csrf_token = generate_csrf_token()
    if response is not None:
        # Set secure cookies
        set_auth_cookies(response, access_token, refresh_token)
        # Set CSRF token
        set_csrf_token(response, csrf_token)

    from app.routes.audit import log_action

    await log_action(
        db=db,
        user_id=user.id,
        action="auth.login",
        resource_type="user",
        resource_id=user.id,
        description="Successful login",
        status="success",
    )
    
    return {
        "message": "Login successful",
        "user": _serialize_user(user),
        "access_token": access_token,
        "refresh_token": refresh_token,
        "csrf_token": csrf_token,
    }


@router.post("/request-password-reset")
async def request_password_reset(
    request: PasswordResetRequest,
    db: Session = Depends(get_db),
):
    """Send a password reset email if the account exists."""

    user = db.query(User).filter(User.email == request.email).first()
    if not user or not user.is_active:
        return {"message": "If an account with that email exists, a reset link has been sent."}

    reset_token = _issue_password_reset_token(user, db)
    try:
        from app.utils.notification_utils import NotificationManager
        await NotificationManager.send_password_reset_email(
            user=user,
            reset_link=_frontend_link("/reset-password", reset_token),
        )
    except HTTPException:
        db.rollback()
        raise

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise
    return {"message": "If an account with that email exists, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(
    request: PasswordResetConfirmRequest,
    db: Session = Depends(get_db),
):
    """Reset a password using a recovery token."""

    if request.new_password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New passwords do not match",
        )

    token_hash = hash_token(request.token)
    user = db.query(User).filter(User.password_reset_token_hash == token_hash).first()
    if (
        not user
        or not user.is_active
        or not user.password_reset_expires_at
        or user.password_reset_expires_at < utcnow()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token",
        )

    user.hashed_password = hash_password(request.new_password)
    user.password_reset_token_hash = None
    user.password_reset_expires_at = None
    user.session_version = int(user.session_version or 0) + 1
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    from app.routes.audit import log_action

    await log_action(
        db=db,
        user_id=user.id,
        action="auth.reset_password",
        resource_type="user",
        resource_id=user.id,
        description="Password reset completed and sessions revoked",
        status="success",
    )

    return {"message": "Password reset successfully"}


@router.post("/verify-email")
async def verify_email(
    request: EmailVerificationConfirmRequest,
    db: Session = Depends(get_db),
):
    """Verify a user's email address using a link token."""

    token_hash = hash_token(request.token)
    user = db.query(User).filter(User.email_verification_token_hash == token_hash).first()
    if (
        not user
        or not user.is_active
        or not user.email_verification_expires_at
        or user.email_verification_expires_at < utcnow()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token",
        )

    user.email_verified = True
    user.email_verified_at = utcnow()
    user.email_verification_token_hash = None
    user.email_verification_expires_at = None
    db.commit()

    from app.routes.audit import log_action

    await log_action(
        db=db,
        user_id=user.id,
        action="auth.verify_email",
        resource_type="user",
        resource_id=user.id,
        description="Email address verified",
        status="success",
    )

    return {"message": "Email verified successfully"}


@router.post("/resend-verification")
async def resend_email_verification(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Resend the current user's verification email."""

    if current_user.role in (UserRole.ADMIN, UserRole.SUPER_ADMIN) or current_user.email_verified:
        return {"message": "Email is already verified"}

    verification_token = _issue_email_verification_token(current_user, db)
    try:
        from app.utils.notification_utils import NotificationManager
        await NotificationManager.send_verification_email(
            user=current_user,
            verification_link=_frontend_link("/verify-email", verification_token),
        )
    except HTTPException:
        db.rollback()
        raise

    db.commit()

    from app.routes.audit import log_action

    await log_action(
        db=db,
        user_id=current_user.id,
        action="auth.resend_verification",
        resource_type="user",
        resource_id=current_user.id,
        description="Resent email verification link",
        status="success",
    )

    return {"message": "Verification email sent"}


@router.post("/refresh")
async def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    """Refresh access token using refresh token from cookie"""

    from app.utils.auth import decode_token

    # Get refresh token from cookie
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found"
        )

    token_payload = decode_token(refresh_token)

    if token_payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    user_id = get_user_id_from_payload(token_payload)
    user = db.query(User).filter(User.id == user_id).first()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    token_session_version = token_payload.get("sv")
    try:
        token_session_version_int = int(token_session_version)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    if token_session_version_int != user.session_version:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired",
        )

    # Create new access token
    access_token = create_access_token(
        data={"sub": str(user.id), "sv": int(user.session_version or 0)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    # Set new access token cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )

    # Set new CSRF token
    csrf_token = generate_csrf_token()
    set_csrf_token(response, csrf_token)
    
    return {
        "message": "Token refreshed successfully",
        "csrf_token": csrf_token,
    }


@router.post("/change-password")
async def change_password(
    request: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password"""

    if not verify_password(request.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect current password"
        )
    
    if request.new_password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New passwords do not match"
        )

    # Hash and update password
    current_user.hashed_password = hash_password(request.new_password)
    current_user.session_version = int(current_user.session_version or 0) + 1
    db.commit()
    db.refresh(current_user)

    from app.routes.audit import log_action

    await log_action(
        db=db,
        user_id=current_user.id,
        action="auth.change_password",
        resource_type="user",
        resource_id=current_user.id,
        description="Password changed and sessions revoked",
        status="success",
    )

    return {"message": "Password changed successfully"}


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    response: Response = None,
):
    """Logout user by revoking the current session version and clearing cookies."""

    current_user.session_version = int(current_user.session_version or 0) + 1
    db.commit()

    if response is not None:
        clear_auth_cookies(response)
        clear_csrf_token(response)

    from app.routes.audit import log_action

    await log_action(
        db=db,
        user_id=current_user.id,
        action="auth.logout",
        resource_type="user",
        resource_id=current_user.id,
        description="Session revoked on logout",
        status="success",
    )

    return {"message": "Logged out successfully"}


@router.post("/delete-account")
async def delete_account(
    payload: DeleteAccountRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Soft deactivate the current account and revoke sessions."""

    if not verify_password(payload.password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
        )

    current_user.is_active = False
    current_user.session_version = int(current_user.session_version or 0) + 1
    db.commit()

    from app.routes.audit import log_action

    await log_action(
        db=db,
        user_id=current_user.id,
        action="auth.delete_account",
        resource_type="user",
        resource_id=current_user.id,
        description="Account soft-deactivated and sessions revoked",
        status="success",
    )

    return {"message": "Account deactivated successfully"}


sys.modules.setdefault("app.routes.auth", sys.modules[__name__])
sys.modules.setdefault("backend.app.routes.auth", sys.modules[__name__])
