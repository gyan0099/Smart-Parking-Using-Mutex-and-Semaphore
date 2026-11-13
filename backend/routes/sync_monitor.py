"""
OS Synchronization Monitor Routes.
Product 9: Smart Parking Slot Allocation System
School of CS & AI, SR University.

Provides live state of Counting Semaphore, Mutex, and Critical Section execution.
"""

from fastapi import APIRouter
from synchronization import sync_manager

router = APIRouter(prefix="/api/sync", tags=["OS Synchronization Monitor"])


@router.get("/state")
def get_synchronization_state():
    """Retrieve instantaneous OS synchronization parameters."""
    return sync_manager.get_sync_state()


@router.get("/history")
def get_critical_section_history():
    """Retrieve execution log of critical sections."""
    state = sync_manager.get_sync_state()
    return state.get("critical_section_history", [])
