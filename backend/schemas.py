"""
Pydantic schemas for request validation and response formatting.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class VehicleEntryRequest(BaseModel):
    registration_number: str = Field(..., min_length=3, max_length=20, description="Vehicle Registration Number, e.g., TS09AB1234")
    owner_name: str = Field(..., min_length=2, max_length=100, description="Owner Full Name")
    vehicle_type: str = Field("Car", description="Car, Bike, SUV, Electric Vehicle, Other")
    mobile_number: Optional[str] = Field(None, max_length=20, description="Optional contact number")


class VehicleExitRequest(BaseModel):
    registration_number: Optional[str] = None
    slot_number: Optional[str] = None


class SlotMaintenanceRequest(BaseModel):
    slot_number: str
    maintenance: bool  # True to disable for maintenance, False to re-enable


class CapacityUpdateRequest(BaseModel):
    total_slots: int = Field(..., ge=1, le=100, description="New parking capacity")


class SimulationConfigRequest(BaseModel):
    total_slots: int = Field(5, ge=1, le=50)
    incoming_vehicles: int = Field(10, ge=1, le=100)
    arrival_interval_ms: int = Field(200, ge=0, le=2000)
    concurrent_threads: int = Field(10, ge=1, le=50)
    simulation_speed: float = Field(1.0, ge=0.1, le=5.0)


class AllocationResponse(BaseModel):
    success: bool
    status: str  # "PARKED", "WAITING", "ERROR"
    message: str
    vehicle_number: str
    slot_number: Optional[str] = None
    queue_position: Optional[int] = None
    semaphore_permits_left: int
    mutex_acquired_by: Optional[str] = None
    timestamp: str


class ExitResponse(BaseModel):
    success: bool
    message: str
    vehicle_number: str
    released_slot: str
    duration_formatted: str
    duration_seconds: float
    next_waiting_vehicle: Optional[str] = None
    next_allocated_slot: Optional[str] = None
    semaphore_permits_available: int
    timestamp: str


class SyncMonitorState(BaseModel):
    total_permits: int
    available_permits: int
    acquired_permits: int
    semaphore_waiting_requests: int
    mutex_locked: bool
    current_critical_section: Optional[str]
    active_thread_name: Optional[str]
    waiting_threads_count: int
    race_conditions_detected: int
    duplicate_allocations_detected: int
    critical_section_history: List[Dict[str, Any]]
