"""
System Settings and Administrative Control Routes.
Product 9: Smart Parking Slot Allocation System
School of CS & AI, SR University.
"""

from fastapi import APIRouter, HTTPException
from schemas import CapacityUpdateRequest, SlotMaintenanceRequest
from parking_manager import parking_manager

router = APIRouter(prefix="/api/settings", tags=["System Settings"])


@router.post("/capacity")
def update_capacity(payload: CapacityUpdateRequest):
    result = parking_manager.update_parking_capacity(payload.total_slots)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message"))
    return result


@router.post("/maintenance")
def toggle_maintenance(payload: SlotMaintenanceRequest):
    result = parking_manager.toggle_slot_maintenance(payload.slot_number, payload.maintenance)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message"))
    return result


@router.post("/reset")
def reset_system(demo_data: bool = True):
    return parking_manager.reset_system(demo_data=demo_data)
