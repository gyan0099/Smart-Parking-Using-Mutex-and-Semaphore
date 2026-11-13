# Comprehensive Laboratory Project Report
## Product 9: Smart Parking Slot Allocation System
**Course:** 25CAI402PC203 Operating Systems and Computer Networks  
**Department of CSE, School of CS & AI, SR University, Warangal**

---

## Executive Summary

The **Smart Parking Slot Allocation System** is an enterprise-grade web application developed to demonstrate practical Operating Systems synchronization principles. Implemented as **Product 9** under the *Semaphore-Based Software Products* cycle, it directly addresses the classical problem of resource contention when demand exceeds capacity in a shared physical facility.

The solution integrates **Counting Semaphores** (`threading.Semaphore`) for finite resource budgeting, **Mutex Locks** (`threading.Lock`) for mutual exclusion over the allocation critical section, **FIFO Waiting Queue management** for graceful load-shedding, and **WebSockets** for sub-millisecond full-duplex dashboard synchronization.

---

## 1. Faculty Checkpoints & Deliverables Compliance

| Deliverable / Checkpoint | Laboratory Implementation Status | Verification Location |
| :--- | :--- | :--- |
| **Product Problem Statement** | Answered: "What should happen when all spaces are occupied and another vehicle arrives?" | `docs/architecture.md`, Project Documentation View |
| **Shared Resource Identification** | Identified: Parking bays pool, semaphore counter, FIFO queue, database session store | `backend/synchronization.py`, `backend/parking_manager.py` |
| **Race Condition Mitigation** | Implemented: Critical section protected by Mutex lock; 0 race conditions in 10-thread burst tests | `backend/tests/test_concurrency.py`, Simulator View |
| **Counting Semaphore** | Implemented: `threading.Semaphore(N)` representing $N$ parking bays | `backend/synchronization.py` |
| **Mutex Lock** | Implemented: `threading.Lock()` enclosing slot check, selection, and DB commits | `backend/synchronization.py` |
| **System Block Diagram** | Implemented: Multi-tier diagram with frontend, backend, OS layer, DB | `docs/architecture.md`, Lab Docs View |
| **Program Flowcharts** | Implemented: Complete admission and exit algorithms documented | `docs/flowchart.md` |
| **Week-Wise Development Plan** | Documented: Weeks 1 through 6 milestones fulfilled | Project Documentation View |

---

## 2. Test Suite & Concurrency Validation

The system includes an automated test harness covering all 8 required verification scenarios:

1. **Test 1: Vehicle Entry into Empty Parking:** Confirms semaphore permits decrement from $N$ to $N-1$ and slot $P_1$ is allocated.
2. **Test 2: Capacity Exhaustion & FIFO Waiting Queue:** Confirms that when capacity is full ($S=0$), additional vehicles are queued in FIFO order without acquiring permits.
3. **Test 3: Vehicle Exit & Signal:** Confirms slot becomes `AVAILABLE` and counting semaphore increments.
4. **Test 4: Automatic Slot Handover:** Confirms that a released slot is immediately inherited by queue position #1 without race window.
5. **Test 5: Simultaneous Same-Bay Request:** Confirms Mutex serializes competing requests; no collision occurs.
6. **Test 6: High Concurrency Burst (10 Threads for 5 Slots):** Dispatches 10 simultaneous threads against 5 slots $\to$ exactly 5 parked, 5 queued, **0 duplicate allocations**, **0 race conditions**.
7. **Test 7: Duplicate Vehicle Registration:** Rejects vehicles that already hold an active bay.
8. **Test 8: Maintenance Mode:** Excludes maintenance slots from admission pool and decrements available permits.

---

## 3. Technology Stack Summary

- **Frontend:** React 19, Vite, Tailwind CSS, Lucide React Icons, Recharts, Framer Motion.
- **Backend:** Python 3.14, FastAPI, `threading.Semaphore`, `threading.Lock`, `concurrent.futures.ThreadPoolExecutor`.
- **Database:** SQLite 3 with WAL Mode and foreign keys, SQLAlchemy 2.0 ORM.
- **Communication:** RESTful JSON APIs + Real-time WebSockets.
