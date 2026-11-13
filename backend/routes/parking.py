"""
Parking Operations Routes.
Product 9: Smart Parking Slot Allocation System
School of CS & AI, SR University.
"""

from fastapi import APIRouter, HTTPException, Depends
from schemas import VehicleEntryRequest, VehicleExitRequest
from parking_manager import parking_manager

router = APIRouter(prefix="/api/parking", tags=["Parking Operations"])


@router.get("/state")
def get_parking_state():
    """Retrieve complete aggregate dashboard state."""
    return parking_manager.get_full_dashboard_state()


@router.post("/entry")
def vehicle_entry(payload: VehicleEntryRequest):
    """
    Handle vehicle entry:
    - Counting Semaphore permit request
    - Mutex critical section acquisition
    - Slot allocation or FIFO queue placement
    """
    result = parking_manager.allocate_vehicle(
        registration_number=payload.registration_number,
        owner_name=payload.owner_name,
        vehicle_type=payload.vehicle_type,
        mobile_number=payload.mobile_number
    )
    return result


@router.post("/exit")
def vehicle_exit(payload: VehicleExitRequest):
    """
    Handle vehicle exit:
    - Mutex critical section
    - Release slot & session completion
    - Auto-allocate to waiting queue or release Counting Semaphore permit
    """
    result = parking_manager.release_vehicle(
        registration_number=payload.registration_number,
        slot_number=payload.slot_number
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message"))
    return result


@router.delete("/queue/{queue_id}")
def cancel_waiting_request(queue_id: int):
    """Cancel pending waiting queue position."""
    result = parking_manager.cancel_waiting_request(queue_id)
    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("message"))
    return result
