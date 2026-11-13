# System Architecture Documentation
## Product 9: Smart Parking Slot Allocation System
**Course:** 25CAI402PC203 Operating Systems and Computer Networks  
**Department of CSE, School of CS & AI, SR University, Warangal**

---

## 1. Architectural Overview

The **Smart Parking Slot Allocation System** is designed around a multi-tier client-server architecture utilizing real operating system synchronization primitives in Python to coordinate concurrent resource access.

```
+---------------------------------------------------------------+
|                    React.js Frontend (Vite)                   |
|  - SaaS Dashboard       - Interactive Parking Bay Floorplan    |
|  - Vehicle Entry/Exit   - OS Synchronization Live Monitor     |
|  - Concurrent Simulator - Analytics & Historical Ledger       |
+-------------------------------+-------------------------------+
                                | HTTP REST / WebSocket (/ws)
+-------------------------------v-------------------------------+
|                     FastAPI Backend Server                    |
|  - Route Handlers       - WebSocket Broadcast Dispatcher      |
|  - Request Validation   - Concurrency Audit Engine            |
+-------------------------------+-------------------------------+
                                |
+-------------------------------v-------------------------------+
|               Operating System Synchronization Layer          |
|  1. COUNTING SEMAPHORE: threading.Semaphore(N)                |
|     - Restricts total simultaneously parked vehicles to N     |
|     - wait() / acquire() controls physical entry admission    |
|     - signal() / release() returns permit on vehicle exit    |
|                                                               |
|  2. MUTEX LOCK: threading.Lock()                              |
|     - Enforces strict Mutual Exclusion over Critical Section  |
|     - Serializes database queries and slot assignments        |
|     - Eliminates race conditions & duplicate allocations      |
+-------------------------------+-------------------------------+
                                |
+-------------------------------v-------------------------------+
|                 SQLite Database (SQLAlchemy ORM)              |
|  - parking_slots   - vehicles   - parking_sessions            |
|  - waiting_queue   - activity_logs                            |
+---------------------------------------------------------------+
```

---

## 2. Shared Resources & Race Conditions

### Shared Resources
1. **Parking Bay Inventory (`parking_slots`):** A finite pool of indexed bays ($P_1, P_2, \dots, P_N$).
2. **Semaphore Counter ($S$):** Integer tracking unallocated physical capacity.
3. **FIFO Waiting Queue (`waiting_queue`):** Shared priority queue holding drivers awaiting bay openings.
4. **Database Session Store (`parking_sessions`):** Shared records of ingress and egress timestamps.

### The Race Condition Scenario
If two vehicles, $V_A$ and $V_B$, arrive simultaneously when only 1 bay remains:
1. $V_A$ checks slot $P_1$ status $\to$ `AVAILABLE`.
2. $V_B$ checks slot $P_1$ status $\to$ `AVAILABLE` (before $V_A$ has finished writing).
3. $V_A$ marks $P_1$ as `OCCUPIED` and takes the spot.
4. $V_B$ also marks $P_1$ as `OCCUPIED` and takes the spot.
**Result:** Fatal conflict — both vehicles are assigned the same physical parking space.

### Solution: Critical Section Protection
```
Vehicle Entry
     ↓
Counting Semaphore (Permit Check)
     ↓
[Enter Mutex Lock]  <--- Critical Section Begins
     ↓
1. Inspect Available Slots
2. Select First Free Bay
3. Mark Bay as OCCUPIED
4. Create Parking Session Record
5. Commit Transaction
     ↓
[Release Mutex Lock] <--- Critical Section Ends
     ↓
Parking Confirmed
```

---

## 3. Mutual Exclusion vs. Counting Semaphore

| Dimension | Mutex Lock (`threading.Lock`) | Counting Semaphore (`threading.Semaphore`) |
| :--- | :--- | :--- |
| **Primary Goal** | Protects code execution against data races | Regulates allocation of finite resource instances |
| **Permitted Concurrency** | Exactly 1 thread | $N$ threads (total configured parking bays) |
| **State Variable** | Binary state (Locked / Unlocked) | Non-negative integer counter $S \in [0, N]$ |
| **Operation Primitive** | `acquire()` / `release()` | `wait()` / `signal()` |
| **Lab Role** | Guards critical database writes and slot selection | Prevents admissions when parking is physically full |
