from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
from app.models.telemedicine import VideoCall, Message
from app.models.user import User
from app.schemas.telemedicine import VideoCallResponse, VideoCallCreate, VideoCallUpdate, MessageResponse, MessageCreate, MessageUpdate
from app.utils.dependencies import get_current_user
from app.utils.access import require_verified_workforce_member
from app.utils.time import utcnow
import uuid

router = APIRouter(prefix="/api/telemedicine", tags=["telemedicine"])


# ============ VIDEO CALLS ============

@router.post("/video-calls/", response_model=VideoCallResponse, status_code=status.HTTP_201_CREATED)
async def initiate_video_call(
    call_data: VideoCallCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Initiate a video call with a provider"""
    if current_user.role.value != "patient":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can initiate video calls"
        )

    # Verify provider exists
    provider = db.query(User).filter(User.id == call_data.provider_id).first()
    if not provider or provider.role.value != "provider" or not provider.is_active or not provider.is_verified:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider not found"
        )
    
    # Generate unique call token and channel
    call_token = str(uuid.uuid4())
    channel_name = f"alera_{current_user.id}_{call_data.provider_id}_{utcnow().timestamp()}"
    
    db_call = VideoCall(
        patient_id=current_user.id,
        provider_id=call_data.provider_id,
        appointment_id=call_data.appointment_id,
        call_token=call_token,
        channel_name=channel_name,
        reason_for_call=call_data.reason_for_call,
        status="initiated"
    )
    
    db.add(db_call)
    db.commit()
    db.refresh(db_call)

    from app.routes.audit import log_action

    await log_action(
        db=db,
        user_id=current_user.id,
        action="telemedicine.video_call.initiate",
        resource_type="video_call",
        resource_id=db_call.id,
        description=f"Initiated video call with provider {provider.id}",
        status="created",
    )
    
    return db_call


@router.get("/video-calls/", response_model=list[VideoCallResponse])
async def list_video_calls(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50
):
    """List video calls for current user"""
    
    if current_user.role.value == "patient":
        calls = db.query(VideoCall).filter(
            VideoCall.patient_id == current_user.id
        ).order_by(VideoCall.initiated_at.desc()).offset(skip).limit(limit).all()
    elif current_user.role.value == "provider":
        require_verified_workforce_member(current_user, "view telemedicine calls")
        calls = db.query(VideoCall).filter(
            VideoCall.provider_id == current_user.id
        ).order_by(VideoCall.initiated_at.desc()).offset(skip).limit(limit).all()
    elif current_user.role.value == "admin":
        calls = db.query(VideoCall).order_by(VideoCall.initiated_at.desc()).offset(skip).limit(limit).all()
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    return calls


@router.get("/video-calls/{call_id}", response_model=VideoCallResponse)
async def get_video_call(
    call_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get video call details"""
    
    call = db.query(VideoCall).filter(VideoCall.id == call_id).first()
    
    if not call:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video call not found"
        )
    
    # Verify access
    if call.patient_id != current_user.id and call.provider_id != current_user.id:
        if current_user.role.value != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized"
            )

    if current_user.role.value == "provider":
        require_verified_workforce_member(current_user, "view telemedicine calls")
    
    return call


@router.put("/video-calls/{call_id}", response_model=VideoCallResponse)
async def update_video_call(
    call_id: int,
    call_update: VideoCallUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update video call status"""
    
    call = db.query(VideoCall).filter(VideoCall.id == call_id).first()
    
    if not call:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video call not found"
        )
    
    # Verify access
    if call.patient_id != current_user.id and call.provider_id != current_user.id:
        if current_user.role.value != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized"
            )

    if current_user.role.value == "provider":
        require_verified_workforce_member(current_user, "update telemedicine calls")
    
    # Update fields
    update_data = call_update.dict(exclude_unset=True)
    
    # Special handling for status change
    if "status" in update_data:
        if update_data["status"] == "connected" and call.started_at is None:
            call.started_at = utcnow()
        elif update_data["status"] == "ended" and call.ended_at is None:
            call.ended_at = utcnow()
            if call.started_at:
                call.duration_seconds = int((call.ended_at - call.started_at).total_seconds())
    
    for field, value in update_data.items():
        setattr(call, field, value)
    
    db.commit()
    db.refresh(call)

    from app.routes.audit import log_action

    await log_action(
        db=db,
        user_id=current_user.id,
        action="telemedicine.video_call.update",
        resource_type="video_call",
        resource_id=call.id,
        description=f"Updated call status to {call.status}",
        status="updated",
    )
    
    return call


# ============ MESSAGING ============

@router.post("/messages/", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send message to another user"""
    if current_user.role.value != "patient":
        require_verified_workforce_member(current_user, "send telemedicine messages")

    # Verify recipient exists
    recipient = db.query(User).filter(User.id == message_data.recipient_id).first()
    if not recipient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient not found"
        )
    
    db_message = Message(
        sender_id=current_user.id,
        recipient_id=message_data.recipient_id,
        content=message_data.content,
        subject=message_data.subject,
        attachment_url=message_data.attachment_url,
        attachment_type=message_data.attachment_type
    )
    
    db.add(db_message)
    db.commit()
    db.refresh(db_message)

    from app.routes.audit import log_action

    await log_action(
        db=db,
        user_id=current_user.id,
        action="telemedicine.message.send",
        resource_type="message",
        resource_id=db_message.id,
        description=f"Sent message to user {recipient.id}",
        status="created",
    )
    
    return db_message


@router.get("/messages/", response_model=list[MessageResponse])
async def list_messages(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    conversation_with_id: int = None,
    unread_only: bool = False,
    skip: int = 0,
    limit: int = 50
):
    """List messages for current user"""

    if current_user.role.value != "patient" and current_user.role.value != "admin":
        require_verified_workforce_member(current_user, "view telemedicine messages")
    
    query = db.query(Message).filter(
        (Message.recipient_id == current_user.id) | (Message.sender_id == current_user.id)
    )
    
    if conversation_with_id:
        query = query.filter(
            ((Message.sender_id == current_user.id) & (Message.recipient_id == conversation_with_id)) |
            ((Message.sender_id == conversation_with_id) & (Message.recipient_id == current_user.id))
        )
    
    if unread_only:
        query = query.filter(
            (Message.recipient_id == current_user.id) & (Message.is_read == "N")
        )
    
    messages = query.order_by(Message.created_at.desc()).offset(skip).limit(limit).all()
    
    return messages


@router.get("/messages/{message_id}", response_model=MessageResponse)
async def get_message(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get message details"""

    if current_user.role.value != "patient" and current_user.role.value != "admin":
        require_verified_workforce_member(current_user, "view telemedicine messages")
    
    message = db.query(Message).filter(Message.id == message_id).first()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Verify access
    if message.sender_id != current_user.id and message.recipient_id != current_user.id:
        if current_user.role.value != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized"
            )
    
    # Mark as read if recipient
    if message.recipient_id == current_user.id and message.is_read == "N":
        message.is_read = "Y"
        message.read_at = utcnow()
        db.commit()
    
    return message


@router.put("/messages/{message_id}", response_model=MessageResponse)
async def update_message(
    message_id: int,
    message_update: MessageUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update message (archive, etc.)"""

    if current_user.role.value != "patient" and current_user.role.value != "admin":
        require_verified_workforce_member(current_user, "update telemedicine messages")
    
    message = db.query(Message).filter(Message.id == message_id).first()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Verify access
    if message.sender_id != current_user.id and message.recipient_id != current_user.id:
        if current_user.role.value != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized"
            )
    
    update_data = message_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(message, field, value)
    
    db.commit()
    db.refresh(message)
    
    return message


@router.delete("/messages/{message_id}")
async def delete_message(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete message"""

    if current_user.role.value != "patient" and current_user.role.value != "admin":
        require_verified_workforce_member(current_user, "delete telemedicine messages")
    
    message = db.query(Message).filter(Message.id == message_id).first()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Verify access - only sender can delete
    if message.sender_id != current_user.id:
        if current_user.role.value != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized"
            )
    
    db.delete(message)
    db.commit()
    
    return {"message": "Message deleted"}
