from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends, Cookie
from typing import Optional
from sqlalchemy.orm import Session
from database import get_db
from app.utils.websocket_manager import manager
from app.utils.auth import get_user_id_from_token
from app.models.ambulance import AmbulanceRequest
from app.models.user import User, UserRole
import json
import logging

router = APIRouter(prefix="/api/ws/location", tags=["websocket"])

logger = logging.getLogger(__name__)

@router.websocket("/{request_id}")
async def location_websocket(
    websocket: WebSocket,
    request_id: str,
    token: Optional[str] = Query(None),
    access_token: Optional[str] = Cookie(None),
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint for live location tracking.
    token: Optional JWT access token passed as a query parameter.
    access_token: Optional JWT access token passed as a cookie.
    request_id: The ID of the ambulance request being tracked.
    """
    try:
        # 1. Authenticate user
        actual_token = token or access_token
        if not actual_token:
            logger.warning("WebSocket connection attempt without token")
            await websocket.close(code=4001) # Missing token
            return

        user_id = get_user_id_from_token(actual_token)
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            await websocket.close(code=4003) # Forbidden
            return

        # 2. Authorize user for this request
        # In a real app, request_id would be an integer, but the frontend might send 'amb-...' (mock) or digits.
        # We'll try to parse it if it's numeric.
        try:
            db_request_id = int(request_id) if request_id.isdigit() else None
        except ValueError:
            db_request_id = None

        if db_request_id:
            db_request = db.query(AmbulanceRequest).filter(AmbulanceRequest.id == db_request_id).first()
            if not db_request:
                await websocket.close(code=4004) # Not Found
                return
            
            # Check if user is either the patient or an authorized worker (ambulance/admin)
            is_patient = db_request.patient_id == user.id
            is_authorized_worker = user.role in [UserRole.AMBULANCE, UserRole.ADMIN, UserRole.HOSPITAL]
            
            if not (is_patient or is_authorized_worker):
                await websocket.close(code=4003) # Forbidden
                return
        else:
            # If it's a mock ID (like 'amb-123'), we'll allow it for demo purposes if the user is logged in
            logger.info(f"Mock request ID detected: {request_id}. allowing for demo.")
            pass

        # 3. Connect to room
        await manager.connect(websocket, request_id)
        logger.info(f"User {user_id} connected to tracking room {request_id}")

        # 4. Handle messages
        try:
            while True:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Expected message format: {"type": "location_update", "lat": float, "lng": float, "heading": float, "speed": float}
                if message.get("type") == "location_update":
                    # Add sender info
                    message["user_id"] = user.id
                    message["role"] = user.role.value if hasattr(user.role, 'value') else str(user.role)
                    message["timestamp"] = json.dumps(str(json.dumps("now"))) # Placeholder for simple mock consistency if needed
                    
                    # Broadcast to everyone else in the room
                    await manager.broadcast_to_room(message, request_id, sender_websocket=websocket)
                
                elif message.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})

        except WebSocketDisconnect:
            manager.disconnect(websocket, request_id)
            logger.info(f"User {user_id} disconnected from tracking room {request_id}")
            
    except Exception as e:
        logger.error(f"Error in location websocket: {e}")
        await websocket.close(code=4000)
