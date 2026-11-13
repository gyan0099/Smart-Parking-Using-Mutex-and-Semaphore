"""
Parking Management Service with Integrated OS Synchronization.
Product 9: Smart Parking Slot Allocation System
School of CS & AI, SR University.

Handles:
- Counting Semaphore checks
- Mutex-guarded Critical Section execution
- Automatic slot allocation and FIFO waiting queue dispatch
- Real-time event notifications via WebSockets
"""

from datetime import datetime, timedelta
import random
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from database import SessionLocal, Base, engine
from models import ParkingSlot, Vehicle, ParkingSession, WaitingQueue, ActivityLog
from synchronization import sync_manager
from websocket_manager import ws_manager


class ParkingManager:
    def __init__(self):
        Base.metadata.create_all(bind=engine)
        self.initialize_default_slots_if_needed()

    def get_db_session(self) -> Session:
        return SessionLocal()

    def initialize_default_slots_if_needed(self, total_slots: int = 20):
        """Seed initial parking slots if table is empty."""
        db = self.get_db_session()
        try:
            count = db.query(ParkingSlot).count()
            if count == 0:
                for i in range(1, total_slots + 1):
                    slot = ParkingSlot(
                        slot_number=f"P{i:02d}",
                        status="AVAILABLE",
                        vehicle_id=None
                    )
                    db.add(slot)
                db.commit()
            
            # Sync semaphore with current capacity and occupied slots
            occupied = db.query(ParkingSlot).filter(ParkingSlot.status == "OCCUPIED").count()
            total = db.query(ParkingSlot).count()
            sync_manager.update_capacity(total, occupied)
            
            waiting_count = db.query(WaitingQueue).filter(WaitingQueue.status == "WAITING").count()
            sync_manager.set_waiting_requests_count(waiting_count)
        finally:
            db.close()

    def notify_change(self, notification: Optional[Dict[str, Any]] = None):
        """Broadcast state update and optional toast notification via WebSocket."""
        state = self.get_full_dashboard_state()
        payload = {
            "type": "STATE_UPDATE",
            "data": state,
        }
        if notification:
            payload["notification"] = notification
        ws_manager.trigger_broadcast(payload)

    # -------------------------------------------------------------------------
    # VEHICLE ENTRY & ALLOCATION
    # -------------------------------------------------------------------------

    def allocate_vehicle(
        self,
        registration_number: str,
        owner_name: str,
        vehicle_type: str,
        mobile_number: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes vehicle entry with OS synchronization:
        1. Validates duplicate registration.
        2. Tries to acquire Counting Semaphore permit.
        3. If permit acquired -> Enters Mutex Critical Section -> Allocates slot.
        4. If permit not acquired -> Enters Mutex Critical Section -> Enqueues in FIFO Waiting Queue.
        """
        reg = registration_number.strip().upper()
        owner = owner_name.strip()

        db = self.get_db_session()
        try:
            # Check duplicate active entry
            active_session = (
                db.query(ParkingSession)
                .join(Vehicle)
                .filter(Vehicle.registration_number == reg, ParkingSession.status == "ACTIVE")
                .first()
            )
            if active_session:
                return {
                    "success": False,
                    "status": "DUPLICATE_ENTRY",
                    "message": f"Vehicle {reg} is already parked in slot {active_session.slot.slot_number}!",
                    "vehicle_number": reg,
                    "slot_number": active_session.slot.slot_number,
                    "semaphore_permits_left": sync_manager.get_sync_state()["available_permits"],
                    "timestamp": datetime.utcnow().isoformat(),
                }

            active_waiting = (
                db.query(WaitingQueue)
                .join(Vehicle)
                .filter(Vehicle.registration_number == reg, WaitingQueue.status == "WAITING")
                .first()
            )
            if active_waiting:
                return {
                    "success": False,
                    "status": "ALREADY_WAITING",
                    "message": f"Vehicle {reg} is already in waiting queue at position #{active_waiting.queue_position}!",
                    "vehicle_number": reg,
                    "queue_position": active_waiting.queue_position,
                    "semaphore_permits_left": sync_manager.get_sync_state()["available_permits"],
                    "timestamp": datetime.utcnow().isoformat(),
                }

            # Attempt to acquire counting semaphore permit (Non-blocking check)
            permit_acquired = sync_manager.try_acquire_permit()

            if permit_acquired:
                # Slot is available! Enter protected critical section
                with sync_manager.critical_section(f"Allocate Slot to {reg}"):
                    # Fetch first available slot
                    slot = (
                        db.query(ParkingSlot)
                        .filter(ParkingSlot.status == "AVAILABLE")
                        .order_by(ParkingSlot.id.asc())
                        .first()
                    )

                    if not slot:
                        # Safety fallback: If DB and Semaphore were out of sync, record race condition
                        sync_manager.record_race_condition()
                        sync_manager.release_permit()
                        return {
                            "success": False,
                            "status": "ERROR",
                            "message": "Resource contention error: No available slot found despite permit.",
                            "vehicle_number": reg,
                            "semaphore_permits_left": sync_manager.get_sync_state()["available_permits"],
                            "timestamp": datetime.utcnow().isoformat(),
                        }

                    # Fetch or create vehicle record
                    vehicle = db.query(Vehicle).filter(Vehicle.registration_number == reg).first()
                    if not vehicle:
                        vehicle = Vehicle(
                            registration_number=reg,
                            owner_name=owner,
                            vehicle_type=vehicle_type,
                            mobile_number=mobile_number
                        )
                        db.add(vehicle)
                        db.flush()
                    else:
                        vehicle.owner_name = owner
                        vehicle.vehicle_type = vehicle_type
                        if mobile_number:
                            vehicle.mobile_number = mobile_number

                    # Update slot
                    slot.status = "OCCUPIED"
                    slot.vehicle_id = vehicle.id
                    slot.updated_at = datetime.utcnow()

                    # Create parking session
                    session = ParkingSession(
                        vehicle_id=vehicle.id,
                        slot_id=slot.id,
                        entry_time=datetime.utcnow(),
                        status="ACTIVE"
                    )
                    db.add(session)

                    # Activity log
                    log = ActivityLog(
                        operation="ENTRY",
                        vehicle_number=reg,
                        slot_number=slot.slot_number,
                        result="SUCCESS",
                        details=f"Allocated {slot.slot_number} to {reg} ({vehicle_type}) under Mutex protection."
                    )
                    db.add(log)
                    db.commit()

                    notification = {
                        "type": "success",
                        "title": "Vehicle Entry Confirmed",
                        "message": f"Slot {slot.slot_number} allocated to {reg}",
                    }
                    self.notify_change(notification)

                    return {
                        "success": True,
                        "status": "PARKED",
                        "message": f"Successfully parked in slot {slot.slot_number}",
                        "vehicle_number": reg,
                        "slot_number": slot.slot_number,
                        "semaphore_permits_left": sync_manager.get_sync_state()["available_permits"],
                        "timestamp": datetime.utcnow().isoformat(),
                    }

            else:
                # Parking is full -> Enqueue into FIFO Waiting Queue under Mutex
                with sync_manager.critical_section(f"Enqueue Waiting Vehicle {reg}"):
                    vehicle = db.query(Vehicle).filter(Vehicle.registration_number == reg).first()
                    if not vehicle:
                        vehicle = Vehicle(
                            registration_number=reg,
                            owner_name=owner,
                            vehicle_type=vehicle_type,
                            mobile_number=mobile_number
                        )
                        db.add(vehicle)
                        db.flush()

                    current_waiting = db.query(WaitingQueue).filter(WaitingQueue.status == "WAITING").count()
                    queue_pos = current_waiting + 1

                    waiting_entry = WaitingQueue(
                        vehicle_id=vehicle.id,
                        arrival_time=datetime.utcnow(),
                        queue_position=queue_pos,
                        status="WAITING"
                    )
                    db.add(waiting_entry)

                    log = ActivityLog(
                        operation="QUEUE_JOIN",
                        vehicle_number=reg,
                        slot_number=None,
                        result="QUEUED",
                        details=f"All slots occupied. {reg} placed in Waiting Queue at position #{queue_pos}."
                    )
                    db.add(log)
                    db.commit()

                    sync_manager.set_waiting_requests_count(queue_pos)

                    notification = {
                        "type": "warning",
                        "title": "Parking Full - Vehicle Queued",
                        "message": f"{reg} added to waiting queue at position #{queue_pos}",
                    }
                    self.notify_change(notification)

                    return {
                        "success": True,
                        "status": "WAITING",
                        "message": f"Parking is full. Added to waiting queue at position #{queue_pos}",
                        "vehicle_number": reg,
                        "queue_position": queue_pos,
                        "semaphore_permits_left": 0,
                        "timestamp": datetime.utcnow().isoformat(),
                    }

        finally:
            db.close()

    # -------------------------------------------------------------------------
    # VEHICLE EXIT & AUTOMATIC WAITING QUEUE ALLOCATION
    # -------------------------------------------------------------------------

    def release_vehicle(
        self,
        registration_number: Optional[str] = None,
        slot_number: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Releases parked vehicle and automatically dispatches slot to waiting vehicle.
        OS Synchronization Guarantee:
        - Critical section protected by Mutex.
        - If waiting vehicle exists: directly transfers resource (semaphore permit remains acquired).
        - If no waiting vehicle: releases counting semaphore permit (signal operation).
        """
        db = self.get_db_session()
        try:
            with sync_manager.critical_section("Release Vehicle & Auto-Allocate"):
                query = db.query(ParkingSession).join(Vehicle).join(ParkingSlot).filter(ParkingSession.status == "ACTIVE")
                if registration_number:
                    reg = registration_number.strip().upper()
                    query = query.filter(Vehicle.registration_number == reg)
                elif slot_number:
                    s_num = slot_number.strip().upper()
                    query = query.filter(ParkingSlot.slot_number == s_num)
                else:
                    return {
                        "success": False,
                        "message": "Please specify registration number or slot number to exit.",
                    }

                session = query.first()
                if not session:
                    return {
                        "success": False,
                        "message": "No active parking session found for given criteria.",
                    }

                vehicle_reg = session.vehicle.registration_number
                slot = session.slot
                slot_code = slot.slot_number

                # Calculate duration
                now = datetime.utcnow()
                duration_sec = (now - session.entry_time).total_seconds()
                session.exit_time = now
                session.duration = duration_sec
                session.status = "COMPLETED"

                mins, secs = divmod(int(duration_sec), 60)
                hours, mins = divmod(mins, 60)
                duration_fmt = f"{hours}h {mins}m {secs}s" if hours > 0 else f"{mins}m {secs}s"

                # Log exit
                exit_log = ActivityLog(
                    operation="EXIT",
                    vehicle_number=vehicle_reg,
                    slot_number=slot_code,
                    result="SUCCESS",
                    details=f"Vehicle {vehicle_reg} exited slot {slot_code}. Duration: {duration_fmt}."
                )
                db.add(exit_log)

                # Check FIFO Waiting Queue
                waiting_entry = (
                    db.query(WaitingQueue)
                    .filter(WaitingQueue.status == "WAITING")
                    .order_by(WaitingQueue.queue_position.asc(), WaitingQueue.arrival_time.asc())
                    .first()
                )

                next_waiting_reg = None
                if waiting_entry:
                    # Auto-allocate released slot to waiting vehicle
                    waiting_vehicle = waiting_entry.vehicle
                    next_waiting_reg = waiting_vehicle.registration_number

                    # Transfer slot ownership
                    slot.vehicle_id = waiting_vehicle.id
                    slot.status = "OCCUPIED"
                    slot.updated_at = now

                    # Mark waiting entry allocated
                    waiting_entry.status = "ALLOCATED"

                    # Create new active session for waiting vehicle
                    new_session = ParkingSession(
                        vehicle_id=waiting_vehicle.id,
                        slot_id=slot.id,
                        entry_time=now,
                        status="ACTIVE"
                    )
                    db.add(new_session)

                    # Re-sequence remaining waiting queue
                    remaining_queue = (
                        db.query(WaitingQueue)
                        .filter(WaitingQueue.status == "WAITING")
                        .order_by(WaitingQueue.queue_position.asc())
                        .all()
                    )
                    for idx, q_item in enumerate(remaining_queue, start=1):
                        q_item.queue_position = idx

                    auto_log = ActivityLog(
                        operation="AUTO_ALLOCATE",
                        vehicle_number=next_waiting_reg,
                        slot_number=slot_code,
                        result="SUCCESS",
                        details=f"Released slot {slot_code} automatically allocated to waiting vehicle {next_waiting_reg}."
                    )
                    db.add(auto_log)
                    db.commit()

                    sync_manager.set_waiting_requests_count(len(remaining_queue))
                    # Notice: Semaphore permit is preserved because resource was immediately taken!

                    notification = {
                        "type": "info",
                        "title": "Slot Re-allocated to Waiting Vehicle",
                        "message": f"Slot {slot_code} auto-allocated to {next_waiting_reg} from queue",
                    }
                    self.notify_change(notification)

                    return {
                        "success": True,
                        "message": f"Vehicle {vehicle_reg} exited. Released slot {slot_code} immediately allocated to waiting vehicle {next_waiting_reg}.",
                        "vehicle_number": vehicle_reg,
                        "released_slot": slot_code,
                        "duration_formatted": duration_fmt,
                        "duration_seconds": duration_sec,
                        "next_waiting_vehicle": next_waiting_reg,
                        "next_allocated_slot": slot_code,
                        "semaphore_permits_available": sync_manager.get_sync_state()["available_permits"],
                        "timestamp": now.isoformat(),
                    }

                else:
                    # No waiting vehicle: slot becomes available & semaphore permit released
                    slot.vehicle_id = None
                    slot.status = "AVAILABLE"
                    slot.updated_at = now
                    db.commit()

                    # Release counting semaphore permit (signal)
                    sync_manager.release_permit()

                    notification = {
                        "type": "success",
                        "title": "Vehicle Exited",
                        "message": f"Vehicle {vehicle_reg} exited. Slot {slot_code} is now available.",
                    }
                    self.notify_change(notification)

                    return {
                        "success": True,
                        "message": f"Vehicle {vehicle_reg} exited. Slot {slot_code} is now AVAILABLE.",
                        "vehicle_number": vehicle_reg,
                        "released_slot": slot_code,
                        "duration_formatted": duration_fmt,
                        "duration_seconds": duration_sec,
                        "next_waiting_vehicle": None,
                        "semaphore_permits_available": sync_manager.get_sync_state()["available_permits"],
                        "timestamp": now.isoformat(),
                    }

        finally:
            db.close()

    # -------------------------------------------------------------------------
    # WAITING QUEUE CANCEL
    # -------------------------------------------------------------------------

    def cancel_waiting_request(self, queue_id: int) -> Dict[str, Any]:
        """Cancel a pending waiting queue entry."""
        db = self.get_db_session()
        try:
            with sync_manager.critical_section(f"Cancel Waiting Request #{queue_id}"):
                entry = db.query(WaitingQueue).filter(WaitingQueue.id == queue_id, WaitingQueue.status == "WAITING").first()
                if not entry:
                    return {"success": False, "message": "Waiting queue entry not found or already processed."}

                reg = entry.vehicle.registration_number
                entry.status = "CANCELLED"

                # Re-index remaining queue
                remaining_queue = (
                    db.query(WaitingQueue)
                    .filter(WaitingQueue.status == "WAITING")
                    .order_by(WaitingQueue.queue_position.asc())
                    .all()
                )
                for idx, q_item in enumerate(remaining_queue, start=1):
                    q_item.queue_position = idx

                log = ActivityLog(
                    operation="QUEUE_CANCEL",
                    vehicle_number=reg,
                    result="CANCELLED",
                    details=f"Waiting request for {reg} cancelled."
                )
                db.add(log)
                db.commit()

                sync_manager.set_waiting_requests_count(len(remaining_queue))

                notification = {
                    "type": "info",
                    "title": "Queue Request Cancelled",
                    "message": f"Waiting vehicle {reg} cancelled their request.",
                }
                self.notify_change(notification)

                return {"success": True, "message": f"Waiting request for {reg} cancelled."}
        finally:
            db.close()

    # -------------------------------------------------------------------------
    # MAINTENANCE & SETTINGS
    # -------------------------------------------------------------------------

    def toggle_slot_maintenance(self, slot_number: str, maintenance: bool) -> Dict[str, Any]:
        """Put slot under maintenance or return it to service."""
        db = self.get_db_session()
        try:
            with sync_manager.critical_section(f"Maintenance Toggle {slot_number}"):
                slot = db.query(ParkingSlot).filter(ParkingSlot.slot_number == slot_number.upper()).first()
                if not slot:
                    return {"success": False, "message": f"Slot {slot_number} not found."}

                if maintenance:
                    if slot.status == "OCCUPIED":
                        return {"success": False, "message": f"Cannot put slot {slot_number} under maintenance while occupied."}
                    if slot.status == "MAINTENANCE":
                        return {"success": False, "message": f"Slot {slot_number} is already in maintenance."}

                    # Acquire permit to reduce available capacity
                    sync_manager.try_acquire_permit()
                    slot.status = "MAINTENANCE"
                    db.commit()
                else:
                    if slot.status != "MAINTENANCE":
                        return {"success": False, "message": f"Slot {slot_number} is not in maintenance."}

                    slot.status = "AVAILABLE"
                    db.commit()
                    # Release permit to restore capacity
                    sync_manager.release_permit()

                self.notify_change({
                    "type": "info",
                    "title": "Slot Maintenance Updated",
                    "message": f"Slot {slot_number} status set to {slot.status}",
                })
                return {"success": True, "message": f"Slot {slot_number} set to {slot.status}", "status": slot.status}
        finally:
            db.close()

    def update_parking_capacity(self, new_capacity: int) -> Dict[str, Any]:
        """Adjust total slots in the parking system."""
        db = self.get_db_session()
        try:
            occupied_count = db.query(ParkingSlot).filter(ParkingSlot.status == "OCCUPIED").count()
            if new_capacity < occupied_count:
                return {
                    "success": False,
                    "message": f"Cannot reduce capacity to {new_capacity}: {occupied_count} slots are currently occupied."
                }

            with sync_manager.critical_section(f"Reconfigure Capacity to {new_capacity}"):
                current_slots = db.query(ParkingSlot).order_by(ParkingSlot.id.asc()).all()
                current_count = len(current_slots)

                if new_capacity > current_count:
                    # Add new slots
                    for i in range(current_count + 1, new_capacity + 1):
                        slot = ParkingSlot(slot_number=f"P{i:02d}", status="AVAILABLE")
                        db.add(slot)
                    db.commit()
                elif new_capacity < current_count:
                    # Remove unoccupied slots starting from highest slot number
                    slots_to_remove = (
                        db.query(ParkingSlot)
                        .filter(ParkingSlot.status != "OCCUPIED")
                        .order_by(ParkingSlot.id.desc())
                        .limit(current_count - new_capacity)
                        .all()
                    )
                    for s in slots_to_remove:
                        db.delete(s)
                    db.commit()

                # Recompute and update semaphore
                total_count = db.query(ParkingSlot).count()
                occupied_count = db.query(ParkingSlot).filter(ParkingSlot.status == "OCCUPIED").count()
                sync_manager.update_capacity(total_count, occupied_count)

                self.notify_change({
                    "type": "info",
                    "title": "Capacity Updated",
                    "message": f"Total parking capacity adjusted to {total_count} slots",
                })

                return {"success": True, "message": f"Capacity updated to {total_count} slots", "total_slots": total_count}
        finally:
            db.close()

    # -------------------------------------------------------------------------
    # STATE & ANALYTICS QUERIES
    # -------------------------------------------------------------------------

    def get_full_dashboard_state(self) -> Dict[str, Any]:
        """Returns complete aggregate state for UI dashboard and synchronization monitor."""
        db = self.get_db_session()
        try:
            slots = db.query(ParkingSlot).order_by(ParkingSlot.id.asc()).all()
            total_slots = len(slots)
            occupied_slots = sum(1 for s in slots if s.status == "OCCUPIED")
            available_slots = sum(1 for s in slots if s.status == "AVAILABLE")
            maintenance_slots = sum(1 for s in slots if s.status == "MAINTENANCE")

            waiting_items = (
                db.query(WaitingQueue)
                .filter(WaitingQueue.status == "WAITING")
                .order_by(WaitingQueue.queue_position.asc())
                .all()
            )

            total_entered = db.query(ParkingSession).count()
            total_exited = db.query(ParkingSession).filter(ParkingSession.status == "COMPLETED").count()

            occupancy_pct = round((occupied_slots / total_slots * 100), 1) if total_slots > 0 else 0.0

            recent_logs = (
                db.query(ActivityLog)
                .order_by(ActivityLog.id.desc())
                .limit(20)
                .all()
            )

            sync_state = sync_manager.get_sync_state()

            return {
                "kpis": {
                    "total_slots": total_slots,
                    "available_slots": available_slots,
                    "occupied_slots": occupied_slots,
                    "maintenance_slots": maintenance_slots,
                    "waiting_vehicles": len(waiting_items),
                    "total_entered": total_entered,
                    "total_exited": total_exited,
                    "occupancy_percentage": occupancy_pct,
                },
                "slots": [s.to_dict() for s in slots],
                "waiting_queue": [w.to_dict() for w in waiting_items],
                "recent_logs": [log.to_dict() for log in recent_logs],
                "sync_monitor": sync_state,
                "timestamp": datetime.utcnow().isoformat(),
            }
        finally:
            db.close()

    def reset_system(self, demo_data: bool = True) -> Dict[str, Any]:
        """Resets the system and loads optional realistic demonstration data."""
        db = self.get_db_session()
        try:
            with sync_manager.critical_section("Reset Entire System"):
                db.query(ParkingSession).delete()
                db.query(WaitingQueue).delete()
                db.query(ActivityLog).delete()
                db.query(ParkingSlot).delete()
                db.query(Vehicle).delete()
                db.commit()

                # Recreate 20 slots
                for i in range(1, 21):
                    slot = ParkingSlot(slot_number=f"P{i:02d}", status="AVAILABLE")
                    db.add(slot)
                db.commit()

                sync_manager.reset_metrics(capacity=20)

                if demo_data:
                    # Seed 6 diverse vehicles across types
                    sample_vehicles = [
                        ("TS09FA1001", "Dr. A. Sharma", "SUV"),
                        ("TS07EK2045", "K. Bharat", "Electric Vehicle"),
                        ("TS08BC3312", "R. Santhappa", "Car"),
                        ("TS10MN4590", "P. Soni Reddy", "Bike"),
                        ("TS12ZX8877", "V. Kumar", "Car"),
                        ("TS05GH6712", "S. Samanta", "Electric Vehicle"),
                    ]

                    now = datetime.utcnow()
                    for idx, (reg, owner, vtype) in enumerate(sample_vehicles, start=1):
                        veh = Vehicle(
                            registration_number=reg,
                            owner_name=owner,
                            vehicle_type=vtype,
                            mobile_number=f"+91 98480 {random.randint(10000, 99999)}"
                        )
                        db.add(veh)
                        db.flush()

                        slot = db.query(ParkingSlot).filter(ParkingSlot.slot_number == f"P{idx:02d}").first()
                        slot.status = "OCCUPIED"
                        slot.vehicle_id = veh.id

                        # Randomize entry time in last 2 hours
                        entry_delta = timedelta(minutes=random.randint(15, 110))
                        sess = ParkingSession(
                            vehicle_id=veh.id,
                            slot_id=slot.id,
                            entry_time=now - entry_delta,
                            status="ACTIVE"
                        )
                        db.add(sess)

                        log = ActivityLog(
                            operation="ENTRY",
                            vehicle_number=reg,
                            slot_number=slot.slot_number,
                            result="SUCCESS",
                            details=f"Demo vehicle {reg} seated in {slot.slot_number}"
                        )
                        db.add(log)

                    db.commit()

                    # Update semaphore
                    sync_manager.update_capacity(20, len(sample_vehicles))

                notification = {
                    "type": "info",
                    "title": "System Reset",
                    "message": "System restored to default initial state with demo data.",
                }
                self.notify_change(notification)

                return {"success": True, "message": "System reset successfully."}
        finally:
            db.close()


# Singleton parking manager
parking_manager = ParkingManager()
# Link sync_manager state change callback to parking_manager's websocket notifier
sync_manager.set_state_change_callback(lambda: parking_manager.notify_change())
