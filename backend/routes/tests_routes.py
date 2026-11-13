"""
Automated OS Verification Test Runner Route.
Product 9: Smart Parking Slot Allocation System
School of CS & AI, SR University.
"""

import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter
from tests.test_concurrency import (
    test_1_single_vehicle_entry,
    test_2_parking_full_enters_queue,
    test_3_vehicle_exit_slot_available,
    test_4_waiting_vehicle_receives_released_slot,
    test_5_simultaneous_two_requests_no_collision,
    test_6_concurrency_ten_requests_five_slots,
    test_7_duplicate_vehicle_registration,
    test_8_disabled_parking_slot_not_allocated,
)
from parking_manager import parking_manager

router = APIRouter(prefix="/api/tests", tags=["Automated OS Concurrency Tests"])

TEST_DEFINITIONS = [
    {
        "id": "TEST_01",
        "title": "Test 1: Vehicle Entry into Empty Parking",
        "description": "Verifies that when a single vehicle enters an empty parking lot, Counting Semaphore decrements by 1 and slot P01 is allocated.",
        "fn": test_1_single_vehicle_entry,
    },
    {
        "id": "TEST_02",
        "title": "Test 2: Capacity Exhaustion & FIFO Waiting Queue",
        "description": "Verifies that when capacity is fully occupied, the next vehicle safely enters the Waiting Queue at position #1 without exceeding Semaphore capacity.",
        "fn": test_2_parking_full_enters_queue,
    },
    {
        "id": "TEST_03",
        "title": "Test 3: Vehicle Exit & Counting Semaphore Signal",
        "description": "Verifies that vehicle exit transitions slot to AVAILABLE and releases the counting semaphore permit back to the pool.",
        "fn": test_3_vehicle_exit_slot_available,
    },
    {
        "id": "TEST_04",
        "title": "Test 4: Automatic Slot Dispatch to Waiting Vehicle",
        "description": "Verifies that when a slot is released while vehicles are queued, the first waiting vehicle atomically inherits the slot without deadlock.",
        "fn": test_4_waiting_vehicle_receives_released_slot,
    },
    {
        "id": "TEST_05",
        "title": "Test 5: Simultaneous Requests Slot Collision Prevention",
        "description": "Verifies Mutex critical section prevents two concurrent threads from acquiring the exact same slot.",
        "fn": test_5_simultaneous_two_requests_no_collision,
    },
    {
        "id": "TEST_06",
        "title": "Test 6: High Concurrency Burst (10 Threads for 5 Slots)",
        "description": "Fires 10 concurrent threads simultaneously. Verifies exactly 5 slots allocated, 5 vehicles queued, 0 race conditions, and 0 duplicate allocations.",
        "fn": test_6_concurrency_ten_requests_five_slots,
    },
    {
        "id": "TEST_07",
        "title": "Test 7: Duplicate Vehicle Registration Prevention",
        "description": "Verifies that an already parked vehicle attempting secondary entry is rejected.",
        "fn": test_7_duplicate_vehicle_registration,
    },
    {
        "id": "TEST_08",
        "title": "Test 8: Disabled Maintenance Slot Exclusion",
        "description": "Verifies that slots marked for maintenance are excluded from allocation and cannot be assigned.",
        "fn": test_8_disabled_parking_slot_not_allocated,
    },
]


@router.post("/run")
def run_all_tests():
    results = []
    overall_start = time.time()

    for item in TEST_DEFINITIONS:
        # Reset system prior to each test
        parking_manager.reset_system(demo_data=False)
        start_t = time.time()
        passed = False
        error_msg = None

        try:
            item["fn"]()
            passed = True
        except AssertionError as ae:
            error_msg = f"Assertion failed: {str(ae)}"
        except Exception as e:
            error_msg = f"Runtime error: {str(e)}"

        duration_ms = round((time.time() - start_t) * 1000, 2)
        results.append({
            "id": item["id"],
            "title": item["title"],
            "description": item["description"],
            "status": "PASSED" if passed else "FAILED",
            "duration_ms": duration_ms,
            "error": error_msg,
        })

    # Restore realistic demo state after tests complete
    parking_manager.reset_system(demo_data=True)

    total_time_ms = round((time.time() - overall_start) * 1000, 2)
    passed_count = sum(1 for r in results if r["status"] == "PASSED")
    all_passed = (passed_count == len(results))

    return {
        "summary": {
            "total_tests": len(results),
            "passed": passed_count,
            "failed": len(results) - passed_count,
            "all_passed": all_passed,
            "total_duration_ms": total_time_ms,
        },
        "results": results,
    }
