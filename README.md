# Smart Parking Slot Allocation System
### Product 9 — Operating Systems and Computer Networks Product-Based Laboratory
**Department of CSE, School of CS & AI, SR University, Warangal**  
**Course Code:** 25CAI402PC203 (4-0-2-5)

---

## Overview

The **Smart Parking Slot Allocation System** is an enterprise-grade web application developed as Product 9 for the OS & CN Laboratory. It implements genuine Operating System concurrency primitives in Python:
- **Counting Semaphore (`threading.Semaphore`):** Regulates finite parking capacity and controls admission.
- **Mutex Lock (`threading.Lock`):** Protects the critical section where parking bays are inspected and assigned, eliminating race conditions.
- **FIFO Waiting Queue:** Queues excess incoming vehicles when parking capacity is exhausted and automatically dispatches released bays.
- **Real-Time WebSockets:** Pushes sub-millisecond slot transitions, mutex states, and telemetry to the React dashboard.

---

## Project Structure

```
smart-parking-system/
│
├── frontend/                     # React + Vite + Tailwind CSS Dashboard
│   ├── src/
│   │   ├── components/           # Navbar, Sidebar, ToastContainer
│   │   ├── pages/                # 11 Dedicated Application Views
│   │   ├── services/api.js       # REST & WebSocket Client
│   │   ├── App.jsx               # Main Root Application
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Python FastAPI Concurrency Engine
│   ├── main.py                   # FastAPI Application Entry & WebSockets
│   ├── database.py               # SQLite + SQLAlchemy Engine (WAL Mode)
│   ├── models.py                 # Relational Database Models
│   ├── schemas.py                # Pydantic Schemas & Payloads
│   ├── synchronization.py        # Core OS Primitives (Semaphore & Mutex)
│   ├── parking_manager.py        # Allocation Logic & Critical Section
│   ├── simulation.py             # Concurrent Thread Burst Simulator
│   ├── websocket_manager.py      # Real-Time Event Dispatcher
│   ├── routes/                   # Modular REST API Routers
│   ├── tests/test_concurrency.py # 8 Automated OS Verification Test Cases
│   └── requirements.txt
│
├── docs/                         # Academic Lab Documentation
│   ├── architecture.md           # System Architecture & Synchronization
│   ├── flowchart.md              # Algorithms & Program Flowcharts
│   └── project_report.md         # Complete Academic Lab Report
│
├── run_backend.sh                # macOS Startup Script for Backend
├── run_frontend.sh               # macOS Startup Script for Frontend
└── README.md
```

---

## Quick Start on macOS Apple Silicon

### 1. Terminal 1: Start the FastAPI Backend
```bash
cd "/Users/vedprakash/Desktop/OS Lab Product 2/smart-parking-system/backend"
source venv/bin/activate
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend API available at:* `http://localhost:8000`  
*Swagger API Docs:* `http://localhost:8000/docs`

### 2. Terminal 2: Start the React Frontend
```bash
cd "/Users/vedprakash/Desktop/OS Lab Product 2/smart-parking-system/frontend"
npm run dev
```
*Frontend Application opens at:* `http://localhost:5173`

---

## Running the Automated OS Concurrency Tests

The test suite validates all 8 academic requirements specified by the faculty:
```bash
cd "/Users/vedprakash/Desktop/OS Lab Product 2/smart-parking-system/backend"
PYTHONPATH=. ./venv/bin/pytest -v tests/test_concurrency.py
```
*(You can also execute and inspect the tests live from the **Automated Tests** page in the web dashboard!)*
