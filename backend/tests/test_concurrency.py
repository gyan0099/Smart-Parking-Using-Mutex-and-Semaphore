"""
Automated OS Concurrency & Synchronization Test Suite.
Product 9: Smart Parking Slot Allocation System
School of CS & AI, SR University.

Tests all 8 required test cases:
1. One vehicle enters empty parking
2. All slots occupied -> queued
3. One vehicle exits -> slot becomes available
4. Waiting vehicle receives released slot
5. Simultaneous requests -> no collision
6. 10 simultaneous requests for 5 slots -> 5 parked, 5 waiting, 0 duplicates
7. Duplicate vehicle registration rejected
8. Maintenance slot not allocated
"""

import threading
import time
import pytest
from parking_manager import parking_manager
from synchronization import sync_manager


@pytest.fixture(autouse=True)
def setup_teardown():
    parking_manager.reset_system(demo_data=False)
    yield
    parking_manager.reset_system(demo_data=False)


def test_1_single_vehicle_entry():
    """Test 1: One vehicle enters an empty parking area. Expected: One slot allocated."""
    res = parking_manager.allocate_vehicle("TS09AB0001", "Test Driver 1", "Car")
    assert res["success"] is True
    assert res["status"] == "PARKED"
    assert res["slot_number"] == "P01"
    sync_state = sync_manager.get_sync_state()
    assert sync_state["available_permits"] == 19
    assert sync_state["acquired_permits"] == 1


def test_2_parking_full_enters_queue():
    """Test 2: All slots occupied. Expected: New vehicle enters waiting queue."""
    parking_manager.update_parking_capacity(2)
    # Park 2 vehicles
    parking_manager.allocate_vehicle("TS01A1", "Driver 1", "Car")
    parking_manager.allocate_vehicle("TS01A2", "Driver 2", "Car")

    # 3rd vehicle arrives
    res = parking_manager.allocate_vehicle("TS01A3", "Driver 3", "Car")
    assert res["success"] is True
    assert res["status"] == "WAITING"
    assert res["queue_position"] == 1
    assert res["semaphore_permits_left"] == 0


def test_3_vehicle_exit_slot_available():
    """Test 3: One vehicle exits. Expected: Slot becomes available."""
    parking_manager.update_parking_capacity(3)
    parking_manager.allocate_vehicle("TS02A1", "Driver 1", "Car")
    res_exit = parking_manager.release_vehicle(registration_number="TS02A1")
    assert res_exit["success"] is True
    assert res_exit["released_slot"] == "P01"
    assert res_exit["next_waiting_vehicle"] is None
    sync_state = sync_manager.get_sync_state()
    assert sync_state["available_permits"] == 3


def test_4_waiting_vehicle_receives_released_slot():
    """Test 4: Waiting vehicle receives released slot. Expected: First eligible waiting vehicle gets slot."""
    parking_manager.update_parking_capacity(1)
    parking_manager.allocate_vehicle("TS03A1", "Driver 1", "Car")
    # Vehicle 2 enters waiting queue
    parking_manager.allocate_vehicle("TS03A2", "Driver 2", "Car")

    # Vehicle 1 exits
    res_exit = parking_manager.release_vehicle(registration_number="TS03A1")
    assert res_exit["success"] is True
    assert res_exit["released_slot"] == "P01"
    assert res_exit["next_waiting_vehicle"] == "TS03A2"
    assert res_exit["next_allocated_slot"] == "P01"


def test_5_simultaneous_two_requests_no_collision():
    """Test 5: Two vehicles request simultaneously. Expected: Both get distinct slots, no conflict."""
    parking_manager.update_parking_capacity(2)
    results = []

    def req(reg):
        res = parking_manager.allocate_vehicle(reg, f"Driver {reg}", "Car")
        results.append(res)

    t1 = threading.Thread(target=req, args=("TS05A1",))
    t2 = threading.Thread(target=req, args=("TS05A2",))
    t1.start()
    t2.start()
    t1.join()
    t2.join()

    slots = [r["slot_number"] for r in results if r["status"] == "PARKED"]
    assert len(slots) == 2
    assert len(set(slots)) == 2  # Disjoint slots guaranteed by Mutex


def test_6_concurrency_ten_requests_five_slots():
    """
    Test 6: Ten simultaneous requests with five parking slots.
    Expected: 5 parked, 5 waiting, 0 duplicate allocations, 0 race conditions.
    """
    parking_manager.update_parking_capacity(5)
    threads = []
    results = []
    results_lock = threading.Lock()

    def worker(i):
        res = parking_manager.allocate_vehicle(f"BURST-{i:02d}", f"Driver {i}", "Car")
        with results_lock:
            results.append(res)

    for i in range(1, 11):
        t = threading.Thread(target=worker, args=(i,))
        threads.append(t)

    for t in threads:
        t.start()
    for t in threads:
        t.join()

    parked = [r for r in results if r["status"] == "PARKED"]
    waiting = [r for r in results if r["status"] == "WAITING"]
    allocated_slots = [r["slot_number"] for r in parked]

    assert len(parked) == 5
    assert len(waiting) == 5
    assert len(set(allocated_slots)) == 5  # Exactly 5 unique slots allocated
    sync_state = sync_manager.get_sync_state()
    assert sync_state["duplicate_allocations_detected"] == 0
    assert sync_state["race_conditions_detected"] == 0


def test_7_duplicate_vehicle_registration():
    """Test 7: Duplicate vehicle registration. Expected: Reject duplicate active entry."""
    res1 = parking_manager.allocate_vehicle("TS07DUP1", "Driver One", "Car")
    assert res1["status"] == "PARKED"

    res2 = parking_manager.allocate_vehicle("TS07DUP1", "Driver One Again", "Car")
    assert res2["success"] is False
    assert res2["status"] == "DUPLICATE_ENTRY"


def test_8_disabled_parking_slot_not_allocated():
    """Test 8: Disabled parking slot. Expected: Slot must not be allocated."""
    # Put slot P01 under maintenance
    maint_res = parking_manager.toggle_slot_maintenance("P01", True)
    assert maint_res["success"] is True

    # Next vehicle should be allocated P02, skipping P01
    res = parking_manager.allocate_vehicle("TS08MNT", "Driver Mnt", "Car")
    assert res["status"] == "PARKED"
    assert res["slot_number"] == "P02"
