import React, { useState } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  Database, 
  GitBranch, 
  Calendar, 
  CheckCircle2, 
  ArrowRight,
  Terminal,
  Activity
} from 'lucide-react';

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const SECTIONS = [
    { id: 'overview', label: '1. Project Overview & Objectives' },
    { id: 'os_concepts', label: '2. OS Synchronization & Primitives' },
    { id: 'comparison', label: '3. Mutex vs. Counting Semaphore' },
    { id: 'architecture', label: '4. System Architecture & Flowchart' },
    { id: 'database', label: '5. Database Design & Relational Schema' },
    { id: 'weekly_plan', label: '6. Week-Wise Lab Deliverables' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Academic Header */}
      <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-purple-950/40 p-6 rounded-2xl border border-blue-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              ACADEMIC REFERENCE DOCUMENTATION
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">
              Course Code: 25CAI402PC203 (4-0-2-5)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-purple-400" />
            <span>Product 9: Smart Parking Slot Allocation System</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Department of CSE, School of CS & AI, SR University, Warangal.<br />
            Product Cycle: Semaphore-Based Software Products (Counting Semaphore + Mutex).
          </p>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-right">
          <span className="text-slate-500 block text-[10px]">Academic Lab Project</span>
          <span className="text-emerald-400 font-bold">100% Implemented</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 p-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-medium">
        {SECTIONS.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`px-3 py-2 rounded-lg transition whitespace-nowrap ${
              activeSection === sec.id
                ? 'bg-blue-600 text-white font-semibold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* CONTENT SECTIONS */}
      <div className="bg-slate-900/60 p-7 rounded-2xl border border-slate-800 shadow-xl space-y-6 text-xs text-slate-300 leading-relaxed">
        {/* Section 1: Overview */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-400" />
                <span>1. Problem Statement & Objectives</span>
              </h2>
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <p className="font-semibold text-white">The Core Operating Systems Question:</p>
                <blockquote className="italic border-l-2 border-blue-500 pl-3 text-slate-400">
                  "A parking area has a limited number of spaces. What should happen when all spaces are occupied and another vehicle arrives?"
                </blockquote>
                <p className="text-slate-400">
                  In uncoordinated multi-threaded or multi-user environments, race conditions occur when two vehicles arrive simultaneously and both observe the same parking slot as AVAILABLE. This leads to duplicate slot allocation, memory corruption, and broken resource accounting.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white mb-2">Key Objectives Delivered:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  '1. Automatic detection and allocation of available parking slots.',
                  '2. Prevention of race conditions using Mutex Lock on shared data.',
                  '3. Strict capacity control using a Counting Semaphore initialized to N spaces.',
                  '4. Automatic FIFO waiting queue placement when capacity reaches zero.',
                  '5. Atomic slot handover to the first eligible waiting vehicle upon vehicle exit.',
                  '6. Zero duplicate slot allocations and zero race condition guarantees.',
                  '7. Real-time visual dashboard and floorplan synchronised via WebSockets.',
                  '8. Persistent session storage and transaction history using SQLite + SQLAlchemy.',
                ].map((obj, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section 2: OS Concepts */}
        {activeSection === 'os_concepts' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-purple-400" />
              <span>2. Shared Resources, Critical Sections & Synchronization Primitives</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-white text-xs uppercase tracking-wide block text-blue-400">
                  Shared Resources Identified
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li><strong>Parking Bay Slots Pool:</strong> Finite slots P01 to PN.</li>
                  <li><strong>Available Permits Counter:</strong> Integer tracking remaining spots.</li>
                  <li><strong>FIFO Waiting Queue:</strong> Shared ordering of waiting vehicles.</li>
                  <li><strong>Active Session Records:</strong> Shared database tables.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-white text-xs uppercase tracking-wide block text-purple-400">
                  The Critical Section
                </span>
                <p className="text-slate-400">
                  The sequence of code where shared state is inspected and modified:
                </p>
                <div className="p-2.5 rounded-lg bg-slate-900 font-mono text-[11px] text-slate-300">
                  Check Slot Availability → Select Slot → Mark Occupied → Commit DB Transaction
                </div>
                <p className="text-[11px] text-slate-500">
                  Protected exclusively by <code>threading.Lock()</code> to ensure mutual exclusion.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h3 className="font-bold text-white">Counting Semaphore Mechanics (wait & signal):</h3>
              <p className="text-slate-400">
                In this system, <code>threading.Semaphore(N)</code> governs physical capacity.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-emerald-400 font-bold block mb-1">wait() Operation (Entry):</span>
                  <code>
                    if semaphore.acquire(blocking=False):<br />
                    &nbsp;&nbsp;# Permit granted: enter Mutex & park<br />
                    else:<br />
                    &nbsp;&nbsp;# Full: enter Mutex & queue
                  </code>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-indigo-400 font-bold block mb-1">signal() Operation (Exit):</span>
                  <code>
                    if waiting_queue.has_items():<br />
                    &nbsp;&nbsp;# Direct handover (permit preserved)<br />
                    else:<br />
                    &nbsp;&nbsp;semaphore.release() # S increments
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Comparison Table */}
        {activeSection === 'comparison' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              <span>3. Academic Comparison: Mutex Lock vs. Counting Semaphore</span>
            </h2>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Feature</th>
                    <th className="py-3 px-4 text-purple-400">Mutex Lock (threading.Lock)</th>
                    <th className="py-3 px-4 text-blue-400">Counting Semaphore (threading.Semaphore)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  <tr>
                    <td className="py-3 px-4 font-bold text-white">Primary Purpose</td>
                    <td className="py-3 px-4 text-slate-300">Mutual Exclusion for Critical Section</td>
                    <td className="py-3 px-4 text-slate-300">Signaling & Finite Resource Capacity Control</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-white">Concurrent Access</td>
                    <td className="py-3 px-4 text-slate-300">Exactly 1 thread at a time</td>
                    <td className="py-3 px-4 text-slate-300">N threads (configurable capacity)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-white">Underlying Variable</td>
                    <td className="py-3 px-4 text-slate-300">Boolean lock state (Locked / Unlocked)</td>
                    <td className="py-3 px-4 text-slate-300">Integer counter S (0, 1, 2, ..., N)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-white">Ownership</td>
                    <td className="py-3 px-4 text-slate-300">Owned by acquiring thread until release</td>
                    <td className="py-3 px-4 text-slate-300">No strict ownership (signalable across threads)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-white">Application Here</td>
                    <td className="py-3 px-4 text-slate-300">Protects slot selection and DB writes</td>
                    <td className="py-3 px-4 text-slate-300">Ensures total parked vehicles ≤ capacity N</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-purple-200">
              <span className="font-bold text-white block mb-1">Faculty Checkpoint Answer:</span>
              <p>
                "Why do we need both?" — The Counting Semaphore limits total simultaneous parked vehicles to capacity N, but multiple permitted threads arriving concurrently would still clash over which specific bay (e.g. P01 vs P02) to claim. The Mutex serializes the specific bay assignment, preventing race conditions.
              </p>
            </div>
          </div>
        )}

        {/* Section 4: Architecture */}
        {activeSection === 'architecture' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-blue-400" />
              <span>4. System Architecture & End-to-End Program Flowchart</span>
            </h2>

            {/* Architecture Pipeline */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-center">
              <span className="text-xs uppercase font-sans font-bold text-slate-400 block mb-2">
                Multi-Tier Enterprise OS Architecture
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="p-2 rounded-lg bg-blue-600 text-white font-bold">REACT FRONTEND</span>
                <span>↓ (REST / WS)</span>
                <span className="p-2 rounded-lg bg-indigo-600 text-white font-bold">FASTAPI BACKEND</span>
                <span>↓</span>
                <span className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 font-bold">COUNTING SEMAPHORE</span>
                <span>↓</span>
                <span className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold">MUTEX LOCK</span>
                <span>↓</span>
                <span className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold">ALLOCATION ENGINE</span>
                <span>↓</span>
                <span className="p-2 rounded-lg bg-slate-800 text-slate-200 font-bold">SQLITE DATABASE</span>
              </div>
            </div>

            {/* Program Flowchart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="font-bold text-emerald-400 text-xs uppercase tracking-wide">
                  Vehicle Admission Flowchart
                </h3>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 font-mono text-[11px]">
                  <li>Driver submits vehicle details.</li>
                  <li>Check if registration already parked (Reject if duplicate).</li>
                  <li>Call <code>semaphore.try_acquire()</code>.</li>
                  <li>If true (Permit granted):
                    <div className="pl-4 text-slate-300">
                      → Acquire Mutex Lock<br />
                      → Query first AVAILABLE slot<br />
                      → Update Slot to OCCUPIED<br />
                      → Insert Parking Session<br />
                      → Release Mutex Lock
                    </div>
                  </li>
                  <li>If false (Capacity 0):
                    <div className="pl-4 text-slate-300">
                      → Acquire Mutex Lock<br />
                      → Compute queue position (depth + 1)<br />
                      → Insert into Waiting Queue<br />
                      → Release Mutex Lock
                    </div>
                  </li>
                  <li>Broadcast WebSocket update to all clients.</li>
                </ol>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="font-bold text-indigo-400 text-xs uppercase tracking-wide">
                  Vehicle Exit & Handover Flowchart
                </h3>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 font-mono text-[11px]">
                  <li>Identify active parking session by plate or slot.</li>
                  <li>Acquire Mutex Lock.</li>
                  <li>Calculate duration = exit_time - entry_time.</li>
                  <li>Mark session COMPLETED.</li>
                  <li>Check Waiting Queue:
                    <div className="pl-4 text-slate-300">
                      → If waiting vehicle exists:<br />
                      &nbsp;&nbsp;Transfer slot immediately to waiting vehicle.<br />
                      &nbsp;&nbsp;Re-index remaining queue positions.<br />
                      &nbsp;&nbsp;(Permit preserved without decrement).<br />
                      → If waiting queue empty:<br />
                      &nbsp;&nbsp;Mark slot AVAILABLE.<br />
                      &nbsp;&nbsp;Call <code>semaphore.release()</code>.
                    </div>
                  </li>
                  <li>Release Mutex Lock.</li>
                  <li>Broadcast WebSocket state update.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Section 5: Database Schema */}
        {activeSection === 'database' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-400" />
              <span>5. Database Design & Relational Tables</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                {
                  table: 'parking_slots',
                  cols: ['id (PK, Integer)', 'slot_number (Unique, String)', 'status (AVAILABLE/OCCUPIED/MAINTENANCE)', 'vehicle_id (FK)', 'created_at, updated_at']
                },
                {
                  table: 'vehicles',
                  cols: ['id (PK, Integer)', 'registration_number (Unique, String)', 'owner_name (String)', 'vehicle_type (String)', 'mobile_number (String)', 'created_at']
                },
                {
                  table: 'parking_sessions',
                  cols: ['id (PK, Integer)', 'vehicle_id (FK)', 'slot_id (FK)', 'entry_time (DateTime)', 'exit_time (DateTime)', 'duration (Float)', 'status (ACTIVE/COMPLETED)']
                },
                {
                  table: 'waiting_queue',
                  cols: ['id (PK, Integer)', 'vehicle_id (FK)', 'arrival_time (DateTime)', 'queue_position (Integer)', 'status (WAITING/ALLOCATED/CANCELLED)']
                },
                {
                  table: 'activity_logs',
                  cols: ['id (PK, Integer)', 'operation (String)', 'vehicle_number (String)', 'slot_number (String)', 'timestamp (DateTime)', 'result, details']
                },
              ].map((t, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-mono font-bold text-blue-400 text-xs block">
                    {t.table}
                  </span>
                  <ul className="space-y-1 font-mono text-[10px] text-slate-400">
                    {t.cols.map((col, cIdx) => (
                      <li key={cIdx} className="truncate">• {col}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 6: Weekly Plan */}
        {activeSection === 'weekly_plan' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-400" />
              <span>6. Week-Wise Lab Implementation Timeline (Weeks 1 to 6)</span>
            </h2>

            <div className="space-y-3">
              {[
                { week: 'Week 1', title: 'Introduction and Product Planning', desc: 'Need for synchronization, shared resource identification, Mutex vs Semaphore selection, system block diagram, flowcharts, and week-wise plan.' },
                { week: 'Week 2', title: 'Build Day - I', desc: 'FastAPI backend scaffolding, SQLite ORM models, Counting Semaphore initialization, and basic parking allocation logic.' },
                { week: 'Week 3', title: 'Build Day - II', desc: 'Mutex critical section implementation, race condition prevention, FIFO waiting queue dispatch, and automated slot handover.' },
                { week: 'Week 4', title: 'Prototype Integration and Testing', desc: 'Vite React frontend integration, WebSocket real-time broadcast, automated concurrency test harness, and 10 simultaneous thread burst testing.' },
                { week: 'Week 5', title: 'Demonstration', desc: 'Full application demonstration with interactive map floorplan, live OS synchronization monitor, and simulated contention scenarios.' },
                { week: 'Week 6', title: 'Evaluation Day', desc: 'Faculty assessment, viva defense, verification of zero duplicate allocations, and code inspection of Semaphore + Mutex synchronization.' },
              ].map((w, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-4">
                  <span className="font-mono font-bold text-blue-400 text-xs shrink-0 w-16">
                    {w.week}
                  </span>
                  <div className="space-y-0.5">
                    <h4 className="text-white font-bold text-xs">{w.title}</h4>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{w.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
