"""
Appointment reminders and email/SMS template management
"""

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from app.models.additional_features import AppointmentReminder, EmailTemplate, SMSTemplate
from app.models.user import User
from app.schemas.additional_features import (
    AppointmentReminderCreate,
    AppointmentReminderResponse,
    AppointmentReminderUpdate,
    ReminderListResponse,
    EmailTemplateCreate,
    EmailTemplateResponse,
    EmailTemplateUpdate,
    SMSTemplateCreate,
    SMSTemplateResponse,
    SMSTemplateUpdate,
    TemplateListResponse,
)
from app.utils.dependencies import get_current_user

router = APIRouter(tags=["reminders", "templates"])

# ============================================================================
# APPOINTMENT REMINDER ENDPOINTS
# ============================================================================

@router.post("/api/reminders", response_model=AppointmentReminderResponse)
async def create_reminder(
    reminder_data: AppointmentReminderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create an appointment reminder"""
    
    if current_user.role.value not in ["provider", "admin"]:
        raise HTTPException(status_code=403, detail="Only providers and admins can create reminders")

    try:
        reminder = AppointmentReminder(
            id=str(uuid.uuid4()),
            appointment_id=reminder_data.appointment_id,
            reminder_type=reminder_data.reminder_type,
            scheduled_time=reminder_data.scheduled_time,
            recipient=reminder_data.recipient,
            recipient_id=reminder_data.recipient_id,
            delivery_status="pending",
        )

        db.add(reminder)
        db.commit()
        db.refresh(reminder)

        return AppointmentReminderResponse(**reminder.to_dict())

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create reminder: {str(e)}")


@router.get("/api/reminders", response_model=ReminderListResponse)
async def list_reminders(
    skip: int = 0,
    limit: int = 20,
    appointment_id: int | None = None,
    status_filter: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List appointment reminders"""
    
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view all reminders")

    query = db.query(AppointmentReminder)

    if appointment_id:
        query = query.filter(AppointmentReminder.appointment_id == appointment_id)

    if status_filter:
        query = query.filter(AppointmentReminder.delivery_status == status_filter)

    total = query.count()
    items = query.offset(skip).limit(limit).all()

    return ReminderListResponse(
        total=total,
        items=[AppointmentReminderResponse(**reminder.to_dict()) for reminder in items]
    )


@router.get("/api/reminders/{reminder_id}", response_model=AppointmentReminderResponse)
async def get_reminder(
    reminder_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific reminder"""
    
    reminder = db.query(AppointmentReminder).filter(
        AppointmentReminder.id == reminder_id
    ).first()

    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")

    return AppointmentReminderResponse(**reminder.to_dict())


@router.put("/api/reminders/{reminder_id}", response_model=AppointmentReminderResponse)
async def update_reminder(
    reminder_id: str,
    update_data: AppointmentReminderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update reminder status (admin only)"""
    
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update reminders")

    reminder = db.query(AppointmentReminder).filter(
        AppointmentReminder.id == reminder_id
    ).first()

    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")

    try:
        if update_data.is_sent is not None:
            reminder.is_sent = update_data.is_sent
            if update_data.is_sent:
                reminder.sent_at = datetime.utcnow()

        if update_data.delivery_status is not None:
            reminder.delivery_status = update_data.delivery_status

        if update_data.error_message is not None:
            reminder.error_message = update_data.error_message

        db.commit()
        db.refresh(reminder)

        return AppointmentReminderResponse(**reminder.to_dict())

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update reminder: {str(e)}")


# ============================================================================
# EMAIL TEMPLATE ENDPOINTS
# ============================================================================

@router.post("/api/email-templates", response_model=EmailTemplateResponse)
async def create_email_template(
    template_data: EmailTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create an email template (admin only)"""
    
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create templates")

    # Check if template name already exists
    existing = db.query(EmailTemplate).filter(
        EmailTemplate.name == template_data.name
    ).first()

    if existing:
        raise HTTPException(status_code=409, detail="Template name already exists")

    try:
        template = EmailTemplate(
            id=str(uuid.uuid4()),
            name=template_data.name,
            subject=template_data.subject,
            body_html=template_data.body_html,
            body_text=template_data.body_text,
            variables=template_data.variables,
            is_active=template_data.is_active,
        )

        db.add(template)
        db.commit()
        db.refresh(template)

        return EmailTemplateResponse(**template.to_dict())

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create template: {str(e)}")


@router.get("/api/email-templates", response_model=TemplateListResponse)
async def list_email_templates(
    skip: int = 0,
    limit: int = 20,
    active_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List email templates"""
    
    query = db.query(EmailTemplate)

    if active_only:
        query = query.filter(EmailTemplate.is_active == True)

    total = query.count()
    items = query.offset(skip).limit(limit).all()

    return TemplateListResponse(
        total=total,
        items=[EmailTemplateResponse(**template.to_dict()) for template in items]
    )


@router.get("/api/email-templates/{template_id}", response_model=EmailTemplateResponse)
async def get_email_template(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific email template"""
    
    template = db.query(EmailTemplate).filter(
        EmailTemplate.id == template_id
    ).first()

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    return EmailTemplateResponse(**template.to_dict())


@router.put("/api/email-templates/{template_id}", response_model=EmailTemplateResponse)
async def update_email_template(
    template_id: str,
    update_data: EmailTemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update email template (admin only)"""
    
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update templates")

    template = db.query(EmailTemplate).filter(
        EmailTemplate.id == template_id
    ).first()

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    if template.is_system:
        raise HTTPException(status_code=403, detail="Cannot modify system templates")

    try:
        if update_data.subject is not None:
            template.subject = update_data.subject

        if update_data.body_html is not None:
            template.body_html = update_data.body_html

        if update_data.body_text is not None:
            template.body_text = update_data.body_text

        if update_data.variables is not None:
            template.variables = update_data.variables

        if update_data.is_active is not None:
            template.is_active = update_data.is_active

        template.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(template)

        return EmailTemplateResponse(**template.to_dict())

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update template: {str(e)}")


# ============================================================================
# SMS TEMPLATE ENDPOINTS
# ============================================================================

@router.post("/api/sms-templates", response_model=SMSTemplateResponse)
async def create_sms_template(
    template_data: SMSTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create an SMS template (admin only)"""
    
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create templates")

    # Check if template name already exists
    existing = db.query(SMSTemplate).filter(
        SMSTemplate.name == template_data.name
    ).first()

    if existing:
        raise HTTPException(status_code=409, detail="Template name already exists")

    try:
        template = SMSTemplate(
            id=str(uuid.uuid4()),
            name=template_data.name,
            content=template_data.content,
            variables=template_data.variables,
            is_active=template_data.is_active,
        )

        db.add(template)
        db.commit()
        db.refresh(template)

        return SMSTemplateResponse(**template.to_dict())

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create template: {str(e)}")


@router.get("/api/sms-templates", response_model=TemplateListResponse)
async def list_sms_templates(
    skip: int = 0,
    limit: int = 20,
    active_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List SMS templates"""
    
    query = db.query(SMSTemplate)

    if active_only:
        query = query.filter(SMSTemplate.is_active == True)

    total = query.count()
    items = query.offset(skip).limit(limit).all()

    return TemplateListResponse(
        total=total,
        items=[SMSTemplateResponse(**template.to_dict()) for template in items]
    )


@router.get("/api/sms-templates/{template_id}", response_model=SMSTemplateResponse)
async def get_sms_template(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific SMS template"""
    
    template = db.query(SMSTemplate).filter(
        SMSTemplate.id == template_id
    ).first()

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    return SMSTemplateResponse(**template.to_dict())


@router.put("/api/sms-templates/{template_id}", response_model=SMSTemplateResponse)
async def update_sms_template(
    template_id: str,
    update_data: SMSTemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update SMS template (admin only)"""
    
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update templates")

    template = db.query(SMSTemplate).filter(
        SMSTemplate.id == template_id
    ).first()

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    if template.is_system:
        raise HTTPException(status_code=403, detail="Cannot modify system templates")

    try:
        if update_data.content is not None:
            template.content = update_data.content

        if update_data.variables is not None:
            template.variables = update_data.variables

        if update_data.is_active is not None:
            template.is_active = update_data.is_active

        template.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(template)

        return SMSTemplateResponse(**template.to_dict())

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update template: {str(e)}")
