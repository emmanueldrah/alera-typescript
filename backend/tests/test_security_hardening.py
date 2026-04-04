from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone
from urllib.parse import parse_qs, urlparse

import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import ValidationError

from app.models import PatientDocument
from app.models.additional_features import DocumentType
from app.models.ambulance import AmbulanceRequest, AmbulanceRequestStatus, EmergencyPriority
from app.models.appointment import Appointment, AppointmentStatus, AppointmentType
from app.models.lab_imaging import ImagingScan, ImagingScanStatus, LabTest, LabTestStatus
from app.models.user import User, UserRole
from app.routes.admin import approve_provider, deactivate_user
from app.routes.appointments import create_appointment
from app.routes.auth import (
    change_password,
    login,
    logout,
    register,
    request_password_reset,
    resend_email_verification,
    reset_password,
    verify_email,
)
from app.services.email_service import EmailService
from app.routes.consents import create_consent
from app.routes.documents import get_document, list_documents
from app.routes.reminders_templates import create_reminder, list_reminders
from app.routes.users import list_doctors
from app.schemas import (
    AppointmentCreate,
    EmailVerificationConfirmRequest,
    LoginRequest,
    PasswordChangeRequest,
    PasswordResetConfirmRequest,
    PasswordResetRequest,
    UserCreate,
)
from app.schemas.additional_features import AppointmentReminderCreate, PatientConsentCreate
from app.utils.dependencies import get_current_user
from app.utils.db_types import enum_value_renames
from app.utils.time import utcnow
from database import SessionLocal


ADMIN_EMAIL = "admin@alera.health"
ADMIN_PASSWORD = "admin_alera_2026!"


def auth_credentials(token: str) -> HTTPAuthorizationCredentials:
    return HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)


def run(coro):
    return asyncio.run(coro)


def extract_token(link: str) -> str:
    query = parse_qs(urlparse(link).query)
    token = query.get("token", [None])[0]
    assert token
    return token


def load_user(db_session, email: str) -> User:
    user = db_session.query(User).filter(User.email == email).first()
    assert user is not None
    return user


def load_user_by_id(db_session, user_id: int) -> User:
    user = db_session.query(User).filter(User.id == user_id).first()
    assert user is not None
    return user


def seed_document(db_session, *, patient_id: int, uploaded_by: int, is_private: bool = False) -> PatientDocument:
    document = PatientDocument(
        id=f"doc-{patient_id}-{uploaded_by}",
        patient_id=patient_id,
        file_id=f"file-{patient_id}-{uploaded_by}",
        filename="summary.pdf",
        file_type=DocumentType.CLINICAL_NOTE,
        file_size=1024,
        mime_type="application/pdf",
        description="Clinical summary",
        uploaded_by=uploaded_by,
        is_private=is_private,
    )
    db_session.add(document)
    db_session.commit()
    db_session.refresh(document)
    return document


def _make_email_capture():
    captured: dict[str, list[str]] = {"verification": [], "reset": []}

    async def send_verification_email(recipient_email: str, recipient_name: str, verification_link: str):
        captured["verification"].append(verification_link)

    async def send_password_reset(recipient_email: str, recipient_name: str, reset_link: str):
        captured["reset"].append(reset_link)

    return captured, send_verification_email, send_password_reset


def test_public_registration_rejects_admin_and_verifies_patients_by_default(db_session):
    admin_request = UserCreate.model_construct(
        email="selfadmin@example.com",
        username="selfadmin",
        first_name="Self",
        last_name="Admin",
        password="password123",
        role="admin",
    )

    with pytest.raises(HTTPException) as exc_info:
        run(register(admin_request, db_session))

    assert exc_info.value.status_code == 403

    result = run(register(
        UserCreate(
            email="patient@example.com",
            username="patient",
            first_name="Pat",
            last_name="Ient",
            password="password123",
            role="patient",
        ),
        db_session,
    ))

    user = result["user"]
    assert user.role == "patient"
    assert user.is_verified is True
    assert user.is_active is True


def test_enum_value_renames_detect_legacy_uppercase_labels():
    renames = enum_value_renames(
        ["PATIENT", "PROVIDER", "ADMIN"],
        ["patient", "provider", "admin"],
    )

    assert renames == [
        ("PATIENT", "patient"),
        ("PROVIDER", "provider"),
        ("ADMIN", "admin"),
    ]


def test_verification_email_hits_sendgrid_api_when_configured(monkeypatch):
    captured: dict[str, object] = {}

    class FakeResponse:
        def raise_for_status(self) -> None:
            return None

    async def fake_post(self, url, headers=None, json=None):
        captured["url"] = url
        captured["headers"] = headers
        captured["json"] = json
        return FakeResponse()

    monkeypatch.setattr("app.services.email_service.settings.EMAIL_PROVIDER", "sendgrid")
    monkeypatch.setattr("app.services.email_service.settings.SENDGRID_API_KEY", "sg-test-key")
    monkeypatch.setattr("app.services.email_service.settings.SENDGRID_FROM_EMAIL", "noreply@alera.health")
    monkeypatch.setattr("app.services.email_service.httpx.AsyncClient.post", fake_post)

    run(
        EmailService.send_verification_email(
            recipient_email="provider@example.com",
            recipient_name="Dr Example",
            verification_link="https://alera.example/verify-email?token=test-token",
        )
    )

    assert captured["url"] == "https://api.sendgrid.com/v3/mail/send"
    assert captured["headers"]["Authorization"] == "Bearer sg-test-key"
    assert captured["json"]["personalizations"][0]["to"][0]["email"] == "provider@example.com"
    assert captured["json"]["subject"] == "ALERA - Verify Your Email"


def test_sqlalchemy_enums_persist_lowercase_values():
    cases = [
        (User.__table__.c.role.type, [member.value for member in UserRole]),
        (Appointment.__table__.c.appointment_type.type, [member.value for member in AppointmentType]),
        (Appointment.__table__.c.status.type, [member.value for member in AppointmentStatus]),
        (LabTest.__table__.c.status.type, [member.value for member in LabTestStatus]),
        (ImagingScan.__table__.c.status.type, [member.value for member in ImagingScanStatus]),
        (AmbulanceRequest.__table__.c.status.type, [member.value for member in AmbulanceRequestStatus]),
        (AmbulanceRequest.__table__.c.priority.type, [member.value for member in EmergencyPriority]),
        (PatientDocument.__table__.c.file_type.type, [member.value for member in DocumentType]),
    ]

    for column_type, expected in cases:
        assert list(column_type.enums) == expected


def test_professional_registration_requires_license_and_starts_pending(db_session):
    with pytest.raises(ValidationError):
        UserCreate(
            email="doctor-no-license@example.com",
            username="doctor-no-license",
            first_name="No",
            last_name="License",
            password="password123",
            role="provider",
        )

    result = run(register(
        UserCreate(
            email="doctor@example.com",
            username="doctor",
            first_name="Dr",
            last_name="Who",
            password="password123",
            role="provider",
            license_number="MD-12345",
            license_state="GA",
            specialty="Family Medicine",
        ),
        db_session,
    ))

    user = result["user"]
    assert user.role == "provider"
    assert user.is_verified is False
    assert user.license_number == "MD-12345"
    assert user.license_state == "GA"


def test_logout_revokes_previous_token(db_session):
    run(register(
        UserCreate(
            email="logout@example.com",
            username="logout-user",
            first_name="Log",
            last_name="Out",
            password="password123",
            role="patient",
        ),
        db_session,
    ))

    login_result = run(login(LoginRequest(email="logout@example.com", password="password123"), db_session))
    token = login_result["access_token"]

    current_user = run(get_current_user(auth_credentials(token), db_session))
    assert current_user.email == "logout@example.com"

    run(logout(current_user=current_user, db=db_session))

    with pytest.raises(HTTPException) as exc_info:
        run(get_current_user(auth_credentials(token), db_session))

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Session expired"


def test_password_change_revokes_previous_token(db_session):
    run(register(
        UserCreate(
            email="change@example.com",
            username="change-user",
            first_name="Change",
            last_name="Me",
            password="password123",
            role="patient",
        ),
        db_session,
    ))

    login_result = run(login(LoginRequest(email="change@example.com", password="password123"), db_session))
    token = login_result["access_token"]
    current_user = run(get_current_user(auth_credentials(token), db_session))

    run(change_password(
        PasswordChangeRequest(
            old_password="password123",
            new_password="newpassword123",
            confirm_password="newpassword123",
        ),
        current_user=current_user,
        db=db_session,
    ))

    with pytest.raises(HTTPException) as exc_info:
        run(get_current_user(auth_credentials(token), db_session))

    assert exc_info.value.status_code == 401

    with pytest.raises(HTTPException):
        run(login(LoginRequest(email="change@example.com", password="password123"), db_session))

    new_login = run(login(LoginRequest(email="change@example.com", password="newpassword123"), db_session))
    assert new_login["access_token"]


def test_admin_deactivation_revokes_current_tokens(db_session):
    run(register(
        UserCreate(
            email="deactivate@example.com",
            username="deactivate-user",
            first_name="De",
            last_name="Activate",
            password="password123",
            role="patient",
        ),
        db_session,
    ))

    patient_login = run(login(LoginRequest(email="deactivate@example.com", password="password123"), db_session))
    patient_token = patient_login["access_token"]
    patient_user = run(get_current_user(auth_credentials(patient_token), db_session))

    admin_login = run(login(LoginRequest(email=ADMIN_EMAIL, password=ADMIN_PASSWORD), db_session))
    admin_user = run(get_current_user(auth_credentials(admin_login["access_token"]), db_session))

    run(deactivate_user(user_id=patient_user.id, current_user=admin_user, db=db_session))

    with pytest.raises(HTTPException) as exc_info:
        run(get_current_user(auth_credentials(patient_token), db_session))

    assert exc_info.value.status_code == 403
    assert exc_info.value.detail == "User account is inactive"


def test_verified_provider_filtering_and_scoped_patient_data(db_session):
    patient_result = run(register(
        UserCreate(
            email="panel-patient@example.com",
            username="panel-patient",
            first_name="Panel",
            last_name="Patient",
            password="password123",
            role="patient",
        ),
        db_session,
    ))
    provider_result = run(register(
        UserCreate(
            email="panel-doctor@example.com",
            username="panel-doctor",
            first_name="Panel",
            last_name="Doctor",
            password="password123",
            role="provider",
            license_number="MD-67890",
            license_state="GA",
            specialty="Internal Medicine",
        ),
        db_session,
    ))

    patient_user = load_user_by_id(db_session, patient_result["user"].id)
    provider_user = load_user_by_id(db_session, provider_result["user"].id)
    admin_user = load_user(db_session, ADMIN_EMAIL)

    pending_doctors = run(list_doctors(current_user=patient_user, db=db_session))
    assert pending_doctors == []

    with pytest.raises(HTTPException) as exc_info:
        run(create_reminder(
            AppointmentReminderCreate(
                appointment_id=999,
                reminder_type="email",
                scheduled_time=datetime.now(timezone.utc),
                recipient="panel-patient@example.com",
                recipient_id=patient_user.id,
            ),
            db=db_session,
            current_user=provider_user,
        ))

    assert exc_info.value.status_code == 403
    assert "pending verification" in exc_info.value.detail

    run(approve_provider(user_id=provider_user.id, current_user=admin_user, db=db_session))
    db_session.refresh(provider_user)

    document = seed_document(db_session, patient_id=patient_user.id, uploaded_by=patient_user.id, is_private=False)

    documents_before = run(list_documents(skip=0, limit=20, db=db_session, current_user=provider_user))
    assert documents_before.total == 0

    with pytest.raises(HTTPException) as exc_info:
        run(get_document(document_id=document.id, db=db_session, current_user=provider_user))

    assert exc_info.value.status_code == 403

    with pytest.raises(HTTPException) as exc_info:
        run(create_consent(
            PatientConsentCreate(
                consent_type="data_sharing",
                title="Share records",
                description="Allow access to records",
            ),
            patient_id=patient_user.id,
            db=db_session,
            current_user=provider_user,
        ))

    assert exc_info.value.status_code == 403

    appointment = run(create_appointment(
        AppointmentCreate(
            provider_id=provider_user.id,
            title="Consultation",
            description="Initial review",
            appointment_type="telehealth",
            scheduled_time=utcnow() + timedelta(days=1),
            duration_minutes=30,
        ),
        current_user=patient_user,
        db=db_session,
    ))

    verified_doctors = run(list_doctors(current_user=patient_user, db=db_session))
    assert any(doctor.id == provider_user.id for doctor in verified_doctors)

    verified_reminder = run(create_reminder(
        AppointmentReminderCreate(
            appointment_id=appointment.id,
            reminder_type="email",
            scheduled_time=datetime.now(timezone.utc),
            recipient="panel-patient@example.com",
            recipient_id=patient_user.id,
        ),
        db=db_session,
        current_user=provider_user,
    ))
    assert verified_reminder.appointment_id == appointment.id

    with pytest.raises(HTTPException) as exc_info:
        run(list_reminders(current_user=provider_user, db=db_session))

    assert exc_info.value.status_code == 403

    documents_after = run(list_documents(skip=0, limit=20, db=db_session, current_user=provider_user))
    assert documents_after.total == 1

    accessible_document = run(get_document(document_id=document.id, db=db_session, current_user=provider_user))
    assert accessible_document.id == document.id

    consent = run(create_consent(
        PatientConsentCreate(
            consent_type="data_sharing",
            title="Share records",
            description="Allow access to records",
        ),
        patient_id=patient_user.id,
        db=db_session,
        current_user=provider_user,
    ))
    assert consent.patient_id == patient_user.id


def test_email_verification_flow_and_resend(db_session, monkeypatch):
    captured, send_verification_email, _ = _make_email_capture()
    monkeypatch.setattr("app.routes.auth.EmailService.send_verification_email", send_verification_email)

    registration = run(register(
        UserCreate(
            email="verifyme@example.com",
            username="verifyme",
            first_name="Verify",
            last_name="Me",
            password="password123",
            role="patient",
        ),
        db_session,
    ))

    user = load_user_by_id(db_session, registration["user"].id)
    assert user.email_verified is False
    assert user.email_verification_token_hash is not None
    assert captured["verification"]

    first_token = extract_token(captured["verification"][-1])

    run(resend_email_verification(current_user=user, db=db_session))
    assert len(captured["verification"]) == 2
    second_token = extract_token(captured["verification"][-1])
    assert second_token != first_token

    with pytest.raises(HTTPException):
        run(verify_email(EmailVerificationConfirmRequest(token=first_token), db_session))

    verification_result = run(verify_email(EmailVerificationConfirmRequest(token=second_token), db_session))
    assert verification_result["message"] == "Email verified successfully"

    db_session.refresh(user)
    assert user.email_verified is True
    assert user.email_verified_at is not None
    assert user.email_verification_token_hash is None
    assert user.email_verification_expires_at is None


def test_password_reset_flow_revokes_sessions_and_allows_new_login(db_session, monkeypatch):
    captured, _, send_password_reset = _make_email_capture()
    monkeypatch.setattr("app.routes.auth.EmailService.send_password_reset", send_password_reset)

    async def noop_send_verification_email(*args, **kwargs):
        return None

    monkeypatch.setattr("app.routes.auth.EmailService.send_verification_email", noop_send_verification_email)

    run(register(
        UserCreate(
            email="resetme@example.com",
            username="resetme",
            first_name="Reset",
            last_name="Me",
            password="password123",
            role="patient",
        ),
        db_session,
    ))

    login_result = run(login(LoginRequest(email="resetme@example.com", password="password123"), db_session))
    token = login_result["access_token"]

    request_result = run(request_password_reset(PasswordResetRequest(email="resetme@example.com"), db_session))
    assert "reset link has been sent" in request_result["message"].lower()
    assert captured["reset"]
    reset_token = extract_token(captured["reset"][-1])

    reset_result = run(
        reset_password(
            PasswordResetConfirmRequest(
                token=reset_token,
                new_password="newpassword123",
                confirm_password="newpassword123",
            ),
            db_session,
        )
    )
    assert reset_result["message"] == "Password reset successfully"

    with pytest.raises(HTTPException) as exc_info:
        run(get_current_user(auth_credentials(token), db_session))

    assert exc_info.value.status_code == 401

    with pytest.raises(HTTPException):
        run(login(LoginRequest(email="resetme@example.com", password="password123"), db_session))

    new_login = run(login(LoginRequest(email="resetme@example.com", password="newpassword123"), db_session))
    assert new_login["access_token"]
