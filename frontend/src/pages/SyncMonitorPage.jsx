import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Activity, 
  Layers, 
  ArrowDown, 
  CheckCircle2, 
  Clock, 
  Terminal, 
  AlertTriangle,
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';
import { fetchSyncState } from '../services/api';

export default function SyncMonitorPage({ state }) {
  const sync = state?.sync_monitor || {};
  const [criticalHistory, setCriticalHistory] = useState(sync.critical_section_history || []);

  useEffect(() => {
    if (sync.critical_section_history) {
      setCriticalHistory(sync.critical_section_history);
    }
  }, [sync.critical_section_history]);

  const totalPermits = sync.total_permits ?? 20;
  const availablePermits = sync.available_permits ?? 20;
  const acquiredPermits = sync.acquired_permits ?? 0;
  const waitingRequests = sync.semaphore_waiting_requests ?? 0;

  const isMutexLocked = sync.mutex_locked ?? false;
  const activeThread = sync.active_thread_name || 'None (Idle)';
  const currentOp = sync.current_critical_section || 'IDLE';

  const raceConditions = sync.race_conditions_detected ?? 0;
  const duplicates = sync.duplicate_allocations_detected ?? 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-blue-950/40 p-6 rounded-2xl border border-purple-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              ACADEMIC OS TELEMETRY
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-emerald-400 font-mono">
              threading.Semaphore({totalPermits}) + threading.Lock()
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="h-6 w-6 text-purple-400" />
            <span>OS Synchronization Live Monitor</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Real-time verification of the operating system concurrency primitives protecting parking resources.
            All telemetry metrics originate directly from Python kernel primitives in the FastAPI backend.
          </p>
        </div>

        {/* Zero Race Condition Verification Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">Race Conditions</span>
            <span className="text-lg font-bold font-mono text-emerald-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> {raceConditions}
            </span>
          </div>

          <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">Duplicate Slots</span>
            <span className="text-lg font-bold font-mono text-emerald-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> {duplicates}
            </span>
          </div>
        </div>
      </div>

      {/* 2 MAIN PRIMITIVES: COUNTING SEMAPHORE & MUTEX */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* COUNTING SEMAPHORE BOX */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Counting Semaphore</h2>
                <p className="text-xs font-mono text-blue-400">threading.Semaphore({totalPermits})</p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Resource Controller
            </span>
          </div>

          {/* Semaphore Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Permits</span>
              <span className="text-xl font-bold font-mono text-white">{totalPermits}</span>
              <span className="text-[9px] text-slate-600 block mt-0.5">Capacity N</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
              <span className="text-[10px] text-emerald-400/80 uppercase font-semibold block">Available</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{availablePermits}</span>
              <span className="text-[9px] text-emerald-500/70 block mt-0.5">Permits Left</span>
            </div>

            <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30">
              <span className="text-[10px] text-rose-400/80 uppercase font-semibold block">Acquired</span>
              <span className="text-xl font-bold font-mono text-rose-400">{acquiredPermits}</span>
              <span className="text-[9px] text-rose-500/70 block mt-0.5">Parked Units</span>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30">
              <span className="text-[10px] text-amber-400/80 uppercase font-semibold block">Waiting</span>
              <span className="text-xl font-bold font-mono text-amber-400">{waitingRequests}</span>
              <span className="text-[9px] text-amber-500/70 block mt-0.5">Pending wait()</span>
            </div>
          </div>

          {/* Visual Permit Tokens Representation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Physical Resource Token Pool</span>
              <span className="font-mono text-slate-300">{availablePermits} of {totalPermits} Unacquired</span>
            </div>
            <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
              {Array.from({ length: totalPermits }).map((_, idx) => {
                const isAcquired = idx < acquiredPermits;
                return (
                  <span
                    key={idx}
                    className={`h-6 w-6 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold transition-all ${
                      isAcquired
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    }`}
                    title={isAcquired ? `Permit #${idx + 1}: Acquired (Parked)` : `Permit #${idx + 1}: Available`}
                  >
                    {idx + 1}
                  </span>
                );
              })}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
            <strong>OS Concept:</strong> The counting semaphore acts as the admission gate. Each arriving vehicle must successfully invoke <code>wait()</code> before accessing the physical slot. When capacity reaches 0, additional requests are non-blocking fallbacks to the FIFO waiting queue.
          </p>
        </div>

        {/* MUTEX LOCK BOX */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                {isMutexLocked ? <Lock className="h-5 w-5 text-amber-400" /> : <Unlock className="h-5 w-5 text-emerald-400" />}
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Mutex Lock</h2>
                <p className="text-xs font-mono text-purple-400">threading.Lock()</p>
              </div>
            </div>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
              isMutexLocked
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}>
              {isMutexLocked ? 'LOCKED' : 'UNLOCKED'}
            </span>
          </div>

          {/* Mutex Telemetry Details */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Lock State:</span>
                <span className={`font-mono font-bold ${isMutexLocked ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {isMutexLocked ? 'ACQUIRED (In Critical Section)' : 'AVAILABLE (Mutual Exclusion Free)'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Active Thread:</span>
                <span className="font-mono text-slate-200 truncate max-w-[200px]">
                  {activeThread}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Protected Operation:</span>
                <span className="font-mono text-purple-300 truncate max-w-[200px]">
                  {currentOp}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Threads Waiting for Mutex:</span>
                <span className="font-mono text-white font-bold">
                  {sync.waiting_threads_count ?? 0}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
            <strong>OS Concept:</strong> The Mutex enforces strictly serialized, mutual exclusion over shared memory: checking slot availability, assigning a bay number, and committing the transaction. No two threads can execute this critical section simultaneously.
          </p>
        </div>
      </div>

      {/* ANIMATED PIPELINE VISUALIZATION */}
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <Activity className="h-4 w-4 text-purple-400" />
            <span>OS Critical Section Execution Pipeline</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">End-to-End Admission Workflow</span>
        </div>

        {/* Horizontal Pipeline Steps */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 pt-2">
          {[
            { step: '1', name: 'VEHICLE REQUEST', desc: 'Driver arrives at entry barrier', color: 'border-blue-500/30 bg-blue-950/20 text-blue-300' },
            { step: '2', name: 'COUNTING SEMAPHORE', desc: 'Permit requested via wait(S)', color: 'border-blue-500/30 bg-blue-950/20 text-blue-300' },
            { step: '3', name: 'RESOURCE CHECK', desc: 'Capacity permits available?', color: 'border-indigo-500/30 bg-indigo-950/20 text-indigo-300' },
            { step: '4', name: 'ACQUIRE MUTEX', desc: 'Lock critical section', color: 'border-purple-500/40 bg-purple-950/30 text-purple-300' },
            { step: '5', name: 'CRITICAL SECTION', desc: 'Select & reserve slot', color: 'border-purple-500/50 bg-purple-950/40 text-purple-200 ring-1 ring-purple-500/40' },
            { step: '6', name: 'ALLOCATE SLOT', desc: 'Commit DB session', color: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300' },
            { step: '7', name: 'RELEASE MUTEX', desc: 'Signal lock release', color: 'border-indigo-500/30 bg-indigo-950/20 text-indigo-300' },
            { step: '8', name: 'PARKING CONFIRMED', desc: 'Barrier opens for driver', color: 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300' },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-center flex flex-col justify-between h-32 transition hover:-translate-y-0.5 ${item.color}`}
            >
              <span className="text-[10px] font-mono font-bold text-slate-500">
                Step 0{item.step}
              </span>
              <div className="my-auto space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-tight leading-tight">
                  {item.name}
                </p>
                <p className="text-[9px] text-slate-400 leading-tight">
                  {item.desc}
                </p>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {idx < 7 ? '→' : '✔'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CRITICAL SECTION EXECUTION HISTORY LOG TABLE */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="h-4 w-4 text-purple-400" />
              <span>Real-Time Critical Section Execution Log</span>
            </h2>
            <p className="text-xs text-slate-400">Audit trail of operations executed under Mutex protection</p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Total Entered: {sync.total_critical_sections_entered ?? 0}
          </span>
        </div>

        <div className="overflow-x-auto max-h-[350px]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase text-[10px] text-slate-500 tracking-wider font-semibold border-b border-slate-800 sticky top-0">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Protected Operation</th>
                <th className="py-3 px-4">Thread ID / Worker</th>
                <th className="py-3 px-4">Start Time</th>
                <th className="py-3 px-4">End Time</th>
                <th className="py-3 px-4">Lock Duration</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {criticalHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 italic font-sans text-xs">
                    No critical sections executed yet.
                  </td>
                </tr>
              ) : (
                criticalHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-4 text-slate-400 font-bold">
                      #{item.id}
                    </td>
                    <td className="py-2.5 px-4 text-white font-medium font-sans">
                      {item.operation}
                    </td>
                    <td className="py-2.5 px-4 text-purple-300 text-[11px]">
                      {item.thread_name}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 text-[11px]">
                      {item.start_time}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 text-[11px]">
                      {item.end_time}
                    </td>
                    <td className="py-2.5 px-4 text-emerald-400 font-bold">
                      {item.duration_ms} ms
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
