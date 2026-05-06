import json
import logging
import asyncio
from typing import Dict, List, Any
from fastapi import WebSocket
from app.utils.redis import redis_publish, get_redis_pubsub

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Room based storage: {room_id: [websocket1, websocket2]}
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.user_connections: Dict[int, List[WebSocket]] = {}
        self.redis_listener_task: asyncio.Task | None = None

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)

    async def connect_user(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.user_connections:
            self.user_connections[user_id] = []
        self.user_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            if websocket in self.active_connections[room_id]:
                self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    def disconnect_user(self, websocket: WebSocket, user_id: int):
        if user_id in self.user_connections:
            if websocket in self.user_connections[user_id]:
                self.user_connections[user_id].remove(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]

    async def send_personal_message(self, message: Any, websocket: WebSocket):
        await websocket.send_json(message)

    async def send_to_user(self, user_id: int, message: Any, local_only: bool = False):
        """Sends a message to all local connections for a user. If not local_only, also broadcasts via Redis."""
        # Local delivery
        if user_id in self.user_connections:
            stale_connections: List[WebSocket] = []
            for connection in self.user_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    stale_connections.append(connection)

            for connection in stale_connections:
                self.disconnect_user(connection, user_id)
        
        # Distributed delivery
        if not local_only:
            redis_publish(f"ws:user:{user_id}", json.dumps(message))

    async def broadcast_to_room(self, message: Any, room_id: str, sender_websocket: WebSocket = None, local_only: bool = False):
        """Broadcasts a message to all local participants in a room. If not local_only, also broadcasts via Redis."""
        # Local delivery
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                if sender_websocket and connection == sender_websocket:
                    continue
                try:
                    await connection.send_json(message)
                except Exception:
                    # Connection might be dead, but we'll let disconnect handle it or clean up next time
                    pass

        # Distributed delivery
        if not local_only:
            redis_publish(f"ws:room:{room_id}", json.dumps(message))

    async def start_redis_listener(self):
        """
        Starts a background task to listen for messages from Redis and broadcast them locally.
        This should be called during application startup (lifespan).
        """
        pubsub = get_redis_pubsub()
        if not pubsub:
            logger.warning("Redis Pub/Sub unavailable, WebSockets will operate in local-only mode.")
            return

        try:
            pubsub.psubscribe("ws:*")
            logger.info("✓ WebSocket Redis listener started")
            
            while True:
                message = pubsub.get_message(ignore_subscribe_messages=True)
                if message:
                    channel = message['channel']
                    data = json.loads(message['data'])
                    
                    if channel.startswith("ws:room:"):
                        room_id = channel.split(":")[-1]
                        await self.broadcast_to_room(data, room_id, local_only=True)
                    elif channel.startswith("ws:user:"):
                        user_id = int(channel.split(":")[-1])
                        await self.send_to_user(user_id, data, local_only=True)
                
                await asyncio.sleep(0.01) # Yield to other tasks
        except Exception as e:
            logger.error(f"Error in Redis WebSocket listener: {e}")
        finally:
            pubsub.close()

# Global manager instance
manager = ConnectionManager()
