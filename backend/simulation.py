"""
Concurrent Vehicle Arrival Simulator with Real OS Threading Execution.
Product 9: Smart Parking Slot Allocation System
School of CS & AI, SR University.

Simulates N concurrent threads arriving at parking facility with M spaces,
validating Counting Semaphore + Mutex synchronization in real time.
"""

import threading
import time
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from concurrent.futures import ThreadPoolExecutor
from parking_manager import parking_manager
from synchronization import sync_manager
from websocket_manager import ws_manager


class ConcurrentSimulator:
    def __init__(self):
        self._is_running = False
        self._is_paused = False
        self._stop_requested = False
        self._lock = threading.Lock()
        self._simulation_thread: Optional[threading.Thread] = None

        # Live results tracking
        self.simulation_id: Optional[str] = None
        self.total_slots = 5
        self.incoming_count = 10
        self.concurrent_threads = 10
        self.arrival_interval_ms = 100
        self.simulation_speed = 1.0

        self.vehicles_log: List[Dict[str, Any]] = []
        self.timeline_events: List[Dict[str, Any]] = []
        self.summary_stats: Dict[str, Any] = {}

    def get_status(self) -> Dict[str, Any]:
        with self._lock:
            return {
                "is_running": self._is_running,
                "is_paused": self._is_paused,
                "simulation_id": self.simulation_id,
                "total_slots": self.total_slots,
                "incoming_count": self.incoming_count,
                "vehicles_log": list(self.vehicles_log),
                "timeline_events": list(self.timeline_events[-30:]),
                "summary_stats": self.summary_stats,
            }

    def start_simulation(
        self,
        total_slots: int = 5,
        incoming_vehicles: int = 10,
        arrival_interval_ms: int = 150,
        concurrent_threads: int = 10,
        simulation_speed: float = 1.0
    ) -> Dict[str, Any]:
        with self._lock:
            if self._is_running:
                return {"success": False, "message": "Simulation is already running."}

            self._is_running = True
            self._is_paused = False
            self._stop_requested = False
            self.simulation_id = str(uuid.uuid4())[:8]

            self.total_slots = total_slots
            self.incoming_count = incoming_vehicles
            self.concurrent_threads = concurrent_threads
            self.arrival_interval_ms = arrival_interval_ms
            self.simulation_speed = max(0.2, simulation_speed)

            self.vehicles_log = []
            self.timeline_events = []
            self.summary_stats = {}

        # Reset parking capacity to simulation configuration
        parking_manager.reset_system(demo_data=False)
        parking_manager.update_parking_capacity(total_slots)

        self._simulation_thread = threading.Thread(
            target=self._run_concurrent_simulation,
            daemon=True,
            name="ConcurrentSimulatorRunner"
        )
        self._simulation_thread.start()

        return {"success": True, "message": f"Concurrent simulation started with {incoming_vehicles} vehicles and {total_slots} slots."}

    def pause_simulation(self) -> Dict[str, Any]:
        with self._lock:
            if not self._is_running:
                return {"success": False, "message": "Simulation is not running."}
            self._is_paused = True
        return {"success": True, "message": "Simulation paused."}

    def resume_simulation(self) -> Dict[str, Any]:
        with self._lock:
            if not self._is_running:
                return {"success": False, "message": "Simulation is not running."}
            self._is_paused = False
        return {"success": True, "message": "Simulation resumed."}

    def stop_simulation(self) -> Dict[str, Any]:
        with self._lock:
            if not self._is_running:
                return {"success": False, "message": "Simulation is not running."}
            self._stop_requested = True
            self._is_running = False
            self._is_paused = False
        return {"success": True, "message": "Simulation stopped."}

    def reset_simulation(self) -> Dict[str, Any]:
        with self._lock:
            self._stop_requested = True
            self._is_running = False
            self._is_paused = False
            self.vehicles_log.clear()
            self.timeline_events.clear()
            self.summary_stats.clear()
        parking_manager.reset_system(demo_data=True)
        return {"success": True, "message": "Simulation reset."}

    def _broadcast_simulation_step(self):
        """Broadcast live simulation progress."""
        status = self.get_status()
        ws_manager.trigger_broadcast({
            "type": "SIMULATION_STEP",
            "data": status
        })

    def _run_concurrent_simulation(self):
        """
        Spawns worker threads concurrently using ThreadPoolExecutor to simulate
        real burst traffic hitting the counting semaphore and mutex critical section.
        """
        start_wall_time = time.time()
        vehicle_types = ["Car", "SUV", "Electric Vehicle", "Bike"]

        # Track allocated slots to verify 0 duplicate allocations
        allocated_slots_set = set()
        duplicate_allocations = 0
        successful_parks = 0
        waiting_count = 0
        failed_count = 0

        def vehicle_worker(index: int):
            # Check pause / stop
            while self._is_paused and not self._stop_requested:
                time.sleep(0.1)
            if self._stop_requested:
                return

            v_reg = f"SIM-{index:03d}"
            v_name = f"Driver #{index}"
            v_type = vehicle_types[(index - 1) % len(vehicle_types)]
            thread_name = threading.current_thread().name

            req_time = datetime.utcnow().strftime("%H:%M:%S.%f")[:-3]

            # Execute real allocation through parking manager
            result = parking_manager.allocate_vehicle(
                registration_number=v_reg,
                owner_name=v_name,
                vehicle_type=v_type
            )

            status = result.get("status")
            slot = result.get("slot_number")
            queue_pos = result.get("queue_position")

            with self._lock:
                nonlocal successful_parks, waiting_count, failed_count, duplicate_allocations

                if status == "PARKED":
                    successful_parks += 1
                    if slot in allocated_slots_set:
                        duplicate_allocations += 1
                        sync_manager.record_duplicate_allocation()
                    else:
                        allocated_slots_set.add(slot)
                elif status == "WAITING":
                    waiting_count += 1
                else:
                    failed_count += 1

                vehicle_record = {
                    "index": index,
                    "registration_number": v_reg,
                    "vehicle_type": v_type,
                    "status": status,
                    "slot_number": slot,
                    "queue_position": queue_pos,
                    "thread_name": thread_name,
                    "timestamp": req_time,
                }
                self.vehicles_log.append(vehicle_record)

                timeline_msg = (
                    f"Vehicle {v_reg} [{v_type}] -> ALLOCATED {slot}"
                    if status == "PARKED"
                    else f"Vehicle {v_reg} [{v_type}] -> QUEUED at #{queue_pos} (Capacity Full)"
                )
                self.timeline_events.append({
                    "time": req_time,
                    "thread": thread_name,
                    "event": timeline_msg,
                    "type": "success" if status == "PARKED" else "warning",
                })

            self._broadcast_simulation_step()

        # Execute concurrent batch with configured interval
        with ThreadPoolExecutor(max_workers=self.concurrent_threads, thread_name_prefix="SimWorker") as executor:
            futures = []
            for i in range(1, self.incoming_count + 1):
                if self._stop_requested:
                    break
                f = executor.submit(vehicle_worker, i)
                futures.append(f)

                # Optional arrival interval
                if self.arrival_interval_ms > 0:
                    delay = (self.arrival_interval_ms / 1000.0) / self.simulation_speed
                    time.sleep(delay)

            # Wait for all thread completions
            for f in futures:
                try:
                    f.result()
                except Exception as ex:
                    print(f"Simulation worker exception: {ex}")

        # Finish simulation and compute summary
        end_wall_time = time.time()
        total_time_sec = round(end_wall_time - start_wall_time, 2)

        sync_state = sync_manager.get_sync_state()

        with self._lock:
            self._is_running = False
            self._is_paused = False
            self.summary_stats = {
                "total_requests": len(self.vehicles_log),
                "successful_allocations": successful_parks,
                "waiting_vehicles": waiting_count,
                "failed_requests": failed_count,
                "duplicate_allocations": duplicate_allocations,
                "race_conditions_detected": sync_state["race_conditions_detected"],
                "maximum_occupancy": min(successful_parks, self.total_slots),
                "total_slots": self.total_slots,
                "duration_seconds": total_time_sec,
                "is_concurrency_safe": (duplicate_allocations == 0 and sync_state["race_conditions_detected"] == 0),
            }

        self._broadcast_simulation_step()


simulator = ConcurrentSimulator()
