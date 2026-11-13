"""
FastAPI Application Entry Point.
Product 9: Smart Parking Slot Allocation System
School of CS & AI, SR University.
"""

import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from websocket_manager import ws_manager
from parking_manager import parking_manager
from routes.parking import router as parking_router
from routes.analytics import router as analytics_router
from routes.sync_monitor import router as sync_router
from routes.simulation_routes import router as simulation_router
from routes.settings_routes import router as settings_router
from routes.tests_routes import router as tests_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Set running event loop for background WebSocket broadcast
    loop = asyncio.get_running_loop()
    ws_manager.set_loop(loop)
    # Ensure database initialized with default slots
    parking_manager.initialize_default_slots_if_needed()
    yield
    # Shutdown logic if any


app = FastAPI(
    title="Smart Parking Slot Allocation System API",
    description="OS & Computer Networks Product-Based Lab (Product 9) - SR University. Demonstrates Counting Semaphore & Mutex.",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS for local Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(parking_router)
app.include_router(analytics_router)
app.include_router(sync_router)
app.include_router(simulation_router)
app.include_router(settings_router)
app.include_router(tests_router)


@app.get("/")
def root():
    return {
        "project": "Smart Parking Slot Allocation System",
        "product_id": "Product 9",
        "course": "25CAI402PC203 Operating Systems and Computer Networks",
        "institution": "Department of CSE, School of CS & AI, SR University, Warangal",
        "status": "Online",
        "documentation": "/docs",
    }


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "smart-parking-backend"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        # Send initial full dashboard state upon connection
        initial_state = parking_manager.get_full_dashboard_state()
        await websocket.send_json({
            "type": "INITIAL_STATE",
            "data": initial_state
        })

        # Keep connection open and receive any ping / messages
        while True:
            data = await websocket.receive_text()
            # Handle client ping if received
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        ws_manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
