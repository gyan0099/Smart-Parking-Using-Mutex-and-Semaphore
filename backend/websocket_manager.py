"""
WebSocket Connection & Event Dispatch Manager.
Delivers real-time synchronization states, parking map changes, and toast notifications.
"""

import asyncio
import json
import logging
from typing import Set, Dict, Any
from fastapi import WebSocket

logger = logging.getLogger("websocket_manager")


class WebSocketManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.loop: asyncio.AbstractEventLoop = None

    def set_loop(self, loop: asyncio.AbstractEventLoop):
        self.loop = loop

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"WebSocket client connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        logger.info(f"WebSocket client disconnected. Total clients: {len(self.active_connections)}")

    async def broadcast_json(self, message: Dict[str, Any]):
        """Async broadcast to all connected WebSocket clients."""
        if not self.active_connections:
            return

        dead_connections = set()
        text_data = json.dumps(message)
        for connection in self.active_connections:
            try:
                await connection.send_text(text_data)
            except Exception as e:
                logger.warning(f"Error broadcasting to client: {e}")
                dead_connections.add(connection)

        for dead in dead_connections:
            self.active_connections.discard(dead)

    def trigger_broadcast(self, message: Dict[str, Any]):
        """
        Thread-safe broadcast invocation callable from synchronous background threads
        (such as simulation threads or DB mutex execution).
        """
        if not self.active_connections:
            return

        if self.loop and self.loop.is_running():
            asyncio.run_coroutine_threadsafe(self.broadcast_json(message), self.loop)


ws_manager = WebSocketManager()
