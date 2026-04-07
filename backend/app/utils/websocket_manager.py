from typing import Dict, List, Any
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Room based storage: {room_id: [websocket1, websocket2]}
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def send_personal_message(self, message: Any, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast_to_room(self, message: Any, room_id: str, sender_websocket: WebSocket = None):
        """Broadcasts a message to all participants in a room except the sender (optional)"""
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                if sender_websocket and connection == sender_websocket:
                    continue
                await connection.send_json(message)

# Global manager instance
manager = ConnectionManager()
