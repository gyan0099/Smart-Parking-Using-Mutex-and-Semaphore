"""
Concurrent Simulation Routes.
Product 9: Smart Parking Slot Allocation System
School of CS & AI, SR University.
"""

from fastapi import APIRouter
from schemas import SimulationConfigRequest
from simulation import simulator

router = APIRouter(prefix="/api/simulation", tags=["Concurrent Arrival Simulator"])


@router.get("/status")
def get_simulation_status():
    return simulator.get_status()


@router.post("/start")
def start_simulation(payload: SimulationConfigRequest):
    return simulator.start_simulation(
        total_slots=payload.total_slots,
        incoming_vehicles=payload.incoming_vehicles,
        arrival_interval_ms=payload.arrival_interval_ms,
        concurrent_threads=payload.concurrent_threads,
        simulation_speed=payload.simulation_speed
    )


@router.post("/pause")
def pause_simulation():
    return simulator.pause_simulation()


@router.post("/resume")
def resume_simulation():
    return simulator.resume_simulation()


@router.post("/stop")
def stop_simulation():
    return simulator.stop_simulation()


@router.post("/reset")
def reset_simulation():
    return simulator.reset_simulation()
