"""
Core Operating Systems Synchronization Layer.
Product 9: Smart Parking Slot Allocation System
School of CS & AI, SR University.

Implements:
1. Counting Semaphore: threading.Semaphore(N)
2. Mutex Lock: threading.Lock()
3. Critical Section Protection
4. OS Synchronization Telemetry & Metrics for Real-Time Monitoring
"""

import threading
import time
from datetime import datetime
from typing import Optional, List, Dict, Any, Callable


class OSSynchronizationManager:
    """
    Manages genuine OS-level synchronization primitives:
    - Counting Semaphore for finite resource allocation (parking slots)
    - Mutex Lock for protecting the critical section against race conditions
    """

    def __init__(self, initial_capacity: int = 20):
        self._initial_capacity = initial_capacity
        self._capacity = initial_capacity
        
        # OS Primitives
        self._semaphore = threading.Semaphore(initial_capacity)
        self._mutex = threading.Lock()

        # Telemetry & State Tracking (real OS metrics)
        self._available_permits = initial_capacity
        self._acquired_permits = 0
        self._waiting_requests = 0
        self._mutex_is_locked = False
        self._current_critical_section: Optional[str] = None
        self._active_thread_name: Optional[str] = None
        self._waiting_threads_count = 0

        # Verification & Audit Counters
        self._race_conditions_detected = 0
        self._duplicate_allocations_detected = 0
        self._total_critical_sections_entered = 0
        self._history_lock = threading.Lock()
        self._critical_section_history: List[Dict[str, Any]] = []

        # Optional listener for real-time WebSocket state dispatch
        self._on_state_change: Optional[Callable[[], None]] = None

    def set_state_change_callback(self, callback: Callable[[], None]):
        """Register a callback (e.g. WebSocket broadcast) called on state transitions."""
        self._on_state_change = callback

    def _notify(self):
        """Invoke callback if registered."""
        if self._on_state_change:
            try:
                self._on_state_change()
            except Exception:
                pass

    # -------------------------------------------------------------------------
    # COUNTING SEMAPHORE OPERATIONS
    # -------------------------------------------------------------------------

    def try_acquire_permit(self, timeout: float = 0.0) -> bool:
        """
        Attempts to acquire 1 permit from the counting semaphore.
        Non-blocking by default to prevent HTTP request starvation.
        Returns True if permit was successfully acquired, False if capacity is exhausted.
        """
        if timeout > 0:
            acquired = self._semaphore.acquire(blocking=True, timeout=timeout)
        else:
            acquired = self._semaphore.acquire(blocking=False)

        if acquired:
            with self._history_lock:
                self._available_permits = max(0, self._available_permits - 1)
                self._acquired_permits += 1
            self._notify()
            return True
        return False

    def release_permit(self):
        """
        Releases 1 permit back to the counting semaphore (signal operation).
        """
        self._semaphore.release()
        with self._history_lock:
            self._available_permits = min(self._capacity, self._available_permits + 1)
            self._acquired_permits = max(0, self._acquired_permits - 1)
        self._notify()

    def update_capacity(self, new_capacity: int, current_occupied_count: int):
        """
        Reconfigures total capacity, adjusting counting semaphore permits accordingly.
        Capacity cannot be less than currently occupied slots.
        """
        if new_capacity < current_occupied_count:
            raise ValueError(f"Cannot set capacity to {new_capacity}: {current_occupied_count} slots are currently occupied.")

        with self._history_lock:
            self._capacity = new_capacity
            needed_permits = new_capacity - current_occupied_count
            # Recreate semaphore with exact available permits
            self._semaphore = threading.Semaphore(needed_permits)
            self._available_permits = needed_permits
            self._acquired_permits = current_occupied_count
        self._notify()

    # -------------------------------------------------------------------------
    # MUTEX & CRITICAL SECTION PROTECTION
    # -------------------------------------------------------------------------

    class _CriticalSectionContext:
        """Context manager to ensure guaranteed Mutex acquisition and release."""
        def __init__(self, manager: "OSSynchronizationManager", operation_name: str):
            self.manager = manager
            self.operation_name = operation_name
            self.start_time = None
            self.thread_name = threading.current_thread().name

        def __enter__(self):
            with self.manager._history_lock:
                self.manager._waiting_threads_count += 1
            
            # Acquire OS Mutex
            self.manager._mutex.acquire()
            self.start_time = time.time()

            with self.manager._history_lock:
                self.manager._waiting_threads_count = max(0, self.manager._waiting_threads_count - 1)
                self.manager._mutex_is_locked = True
                self.manager._current_critical_section = self.operation_name
                self.manager._active_thread_name = self.thread_name
                self.manager._total_critical_sections_entered += 1

            self.manager._notify()
            return self

        def __exit__(self, exc_type, exc_val, exc_tb):
            end_time = time.time()
            duration_ms = round((end_time - self.start_time) * 1000, 2)
            status = "COMPLETED" if exc_type is None else f"ERROR: {exc_val}"

            history_entry = {
                "id": self.manager._total_critical_sections_entered,
                "operation": self.operation_name,
                "thread_name": self.thread_name,
                "start_time": datetime.fromtimestamp(self.start_time).strftime("%H:%M:%S.%f")[:-3],
                "end_time": datetime.fromtimestamp(end_time).strftime("%H:%M:%S.%f")[:-3],
                "duration_ms": duration_ms,
                "status": status,
            }

            with self.manager._history_lock:
                self.manager._critical_section_history.insert(0, history_entry)
                # Keep last 50 entries
                if len(self.manager._critical_section_history) > 50:
                    self.manager._critical_section_history.pop()

                self.manager._mutex_is_locked = False
                self.manager._current_critical_section = None
                self.manager._active_thread_name = None

            # Guaranteed Mutex Release
            self.manager._mutex.release()
            self.manager._notify()
            return False  # Do not suppress exceptions

    def critical_section(self, operation_name: str):
        """Returns a context manager guarding the critical section with the Mutex."""
        return self._CriticalSectionContext(self, operation_name)

    # -------------------------------------------------------------------------
    # TELEMETRY & AUDITING
    # -------------------------------------------------------------------------

    def record_race_condition(self):
        """Record a race condition violation if detected."""
        with self._history_lock:
            self._race_conditions_detected += 1
        self._notify()

    def record_duplicate_allocation(self):
        """Record duplicate slot allocation if detected."""
        with self._history_lock:
            self._duplicate_allocations_detected += 1
        self._notify()

    def set_waiting_requests_count(self, count: int):
        """Update count of vehicles currently in waiting queue."""
        with self._history_lock:
            self._waiting_requests = count
        self._notify()

    def get_sync_state(self) -> Dict[str, Any]:
        """Returns snapshot of live OS synchronization parameters."""
        with self._history_lock:
            return {
                "total_permits": self._capacity,
                "available_permits": self._available_permits,
                "acquired_permits": self._acquired_permits,
                "semaphore_waiting_requests": self._waiting_requests,
                "mutex_locked": self._mutex_is_locked,
                "current_critical_section": self._current_critical_section,
                "active_thread_name": self._active_thread_name,
                "waiting_threads_count": self._waiting_threads_count,
                "race_conditions_detected": self._race_conditions_detected,
                "duplicate_allocations_detected": self._duplicate_allocations_detected,
                "total_critical_sections_entered": self._total_critical_sections_entered,
                "critical_section_history": list(self._critical_section_history[:15]),
            }

    def reset_metrics(self, capacity: int = 20):
        """Resets synchronization metrics and primitives."""
        self._capacity = capacity
        self._semaphore = threading.Semaphore(capacity)
        self._available_permits = capacity
        self._acquired_permits = 0
        self._waiting_requests = 0
        self._mutex_is_locked = False
        self._current_critical_section = None
        self._active_thread_name = None
        self._waiting_threads_count = 0
        self._race_conditions_detected = 0
        self._duplicate_allocations_detected = 0
        with self._history_lock:
            self._critical_section_history.clear()
        self._notify()


# Singleton OS synchronization manager instance across the application
sync_manager = OSSynchronizationManager(initial_capacity=20)
