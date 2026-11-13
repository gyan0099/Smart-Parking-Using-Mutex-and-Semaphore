import React from 'react';
import { 
  Car, 
  ParkingSquare, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Percent, 
  PlusCircle, 
  Map, 
  ListOrdered, 
  RotateCcw, 
  ShieldAlert, 
  Zap,
  Activity
} from 'lucide-react';

export default function DashboardPage({ state, setActivePage, onReset }) {
  const kpis = state?.kpis || {
    total_slots: 20,
    available_slots: 20,
    occupied_slots: 0,
    maintenance_slots: 0,
    waiting_vehicles: 0,
    total_entered: 0,
    total_exited: 0,
    occupancy_percentage: 0,
  };

  const slots = state?.slots || [];
  const waitingQueue = state?.waiting_queue || [];
  const recentLogs = state?.recent_logs || [];
  const sync = state?.sync_monitor || {};

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              REAL-TIME OS SYNCHRONIZATION
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-emerald-400 font-mono">
              Counting Semaphore: {sync.available_permits ?? kpis.available_slots} / {sync.total_permits ?? kpis.total_slots} Permits Available
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Smart Parking Management Console
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Automatic parking slot allocation and release engine backed by genuine Operating System primitives: 
            Counting Semaphore for finite capacity restriction and Mutex Locks for race-free critical section transactions.
          </p>
        </div>

        {/* Live Mutex Indicator */}
        <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-3 rounded-xl border border-slate-800">
          <div className="text-right">
            <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Mutex Lock Status</p>
            <p className={`text-xs font-bold font-mono ${sync.mutex_locked ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`}>
              {sync.mutex_locked ? 'LOCKED (CRITICAL SECTION)' : 'UNLOCKED (IDLE)'}
            </p>
          </div>
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
            sync.mutex_locked ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
          }`}>
            <Zap className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* 7 KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total Slots */}
        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wide">Total Slots</span>
            <ParkingSquare className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">{kpis.total_slots}</p>
          <p className="text-[10px] text-slate-500 mt-1">Configured Capacity</p>
        </div>

        {/* Available Slots */}
        <div className="bg-slate-900/70 p-4 rounded-xl border border-emerald-950/60 hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Available</span>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 font-mono">{kpis.available_slots}</p>
          <p className="text-[10px] text-emerald-500/70 mt-1">Semaphore Permits</p>
        </div>

        {/* Occupied Slots */}
        <div className="bg-slate-900/70 p-4 rounded-xl border border-rose-950/60 hover:border-rose-500/40 transition">
          <div className="flex items-center justify-between text-rose-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Occupied</span>
            <Car className="h-4 w-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-400 font-mono">{kpis.occupied_slots}</p>
          <p className="text-[10px] text-rose-500/70 mt-1">Active Vehicles</p>
        </div>

        {/* Waiting Vehicles */}
        <div className="bg-slate-900/70 p-4 rounded-xl border border-amber-950/60 hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Waiting Queue</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 font-mono">{kpis.waiting_vehicles}</p>
          <p className="text-[10px] text-amber-500/70 mt-1">FIFO Queue Depth</p>
        </div>

        {/* Total Entered */}
        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wide">Total Entered</span>
            <ArrowUpRight className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">{kpis.total_entered}</p>
          <p className="text-[10px] text-slate-500 mt-1">Cumulative Entries</p>
        </div>

        {/* Total Exited */}
        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wide">Total Exited</span>
            <ArrowDownLeft className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">{kpis.total_exited}</p>
          <p className="text-[10px] text-slate-500 mt-1">Released Sessions</p>
        </div>

        {/* Occupancy Percentage */}
        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wide">Occupancy</span>
            <Percent className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-400 font-mono">{kpis.occupancy_percentage}%</p>
          <p className="text-[10px] text-purple-500/70 mt-1">Current Utilization</p>
        </div>
      </div>

      {/* OCCUPANCY PROGRESS BAR */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Live Occupancy Ratio
            </span>
            <span className="text-xs font-mono font-bold text-blue-400">
              {kpis.occupancy_percentage}%
            </span>
          </div>
          <div className="text-xs text-slate-400 flex items-center space-x-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              Available: <strong className="text-white font-mono">{kpis.available_slots}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
              Occupied: <strong className="text-white font-mono">{kpis.occupied_slots}</strong>
            </span>
            {kpis.maintenance_slots > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-500"></span>
                Maintenance: <strong className="text-white font-mono">{kpis.maintenance_slots}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Progress bar container */}
        <div className="w-full bg-slate-800/80 h-3 rounded-full overflow-hidden flex shadow-inner">
          <div
            className="bg-rose-500 h-full transition-all duration-500"
            style={{ width: `${kpis.occupancy_percentage}%` }}
          />
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{ width: `${Math.max(0, 100 - kpis.occupancy_percentage)}%` }}
          />
        </div>
      </div>

      {/* QUICK ACTIONS BUTTON BAR */}
      <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Quick Operations Console
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => setActivePage('entry')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition active:scale-95"
          >
            <Car className="h-4 w-4" />
            <span>Vehicle Entry</span>
          </button>

          <button
            onClick={() => setActivePage('exit')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition active:scale-95"
          >
            <ArrowDownLeft className="h-4 w-4" />
            <span>Vehicle Exit</span>
          </button>

          <button
            onClick={() => setActivePage('parking_map')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition active:scale-95"
          >
            <Map className="h-4 w-4 text-emerald-400" />
            <span>View Parking Map</span>
          </button>

          <button
            onClick={() => setActivePage('queue')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition active:scale-95"
          >
            <ListOrdered className="h-4 w-4 text-amber-400" />
            <span>Waiting Queue ({waitingQueue.length})</span>
          </button>

          <button
            onClick={() => setActivePage('settings')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition active:scale-95"
          >
            <PlusCircle className="h-4 w-4 text-blue-400" />
            <span>Capacity / Settings</span>
          </button>

          <button
            onClick={onReset}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold border border-rose-800/40 transition active:scale-95"
          >
            <RotateCcw className="h-4 w-4 text-rose-400" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* 2-COLUMN SECTION: MINI PARKING GRID & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Mini Parking Grid */}
        <div className="lg:col-span-2 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">Live Slot Grid Preview</h2>
              <p className="text-xs text-slate-400">Click any slot to inspect vehicle details</p>
            </div>
            <button
              onClick={() => setActivePage('parking_map')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
            >
              Full Interactive Map <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-2">
            {slots.map((slot) => {
              const isOccupied = slot.status === 'OCCUPIED';
              const isMaint = slot.status === 'MAINTENANCE';

              let border = 'border-emerald-500/30 bg-emerald-950/30 text-emerald-400 hover:border-emerald-400';
              if (isOccupied) {
                border = 'border-rose-500/40 bg-rose-950/30 text-rose-400 hover:border-rose-400';
              } else if (isMaint) {
                border = 'border-slate-700 bg-slate-800/40 text-slate-500';
              }

              return (
                <button
                  key={slot.id}
                  onClick={() => setActivePage('parking_map')}
                  className={`p-2 rounded-lg border text-center transition flex flex-col items-center justify-center aspect-square ${border}`}
                  title={`${slot.slot_number}: ${slot.status}${slot.current_vehicle ? ` (${slot.current_vehicle.registration_number})` : ''}`}
                >
                  <span className="text-[11px] font-mono font-bold">{slot.slot_number}</span>
                  <span className="text-[9px] uppercase font-semibold mt-0.5 truncate w-full">
                    {isOccupied ? 'OCC' : isMaint ? 'MNT' : 'FREE'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Grid Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              Available (Free)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-400"></span>
              Occupied (Parked)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-500"></span>
              Maintenance (Offline)
            </span>
          </div>
        </div>

        {/* Right: Live Activity Stream */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-400" />
                <span>Live Activity Stream</span>
              </h2>
              <span className="text-[10px] font-mono text-slate-500">Auto-Refreshed</span>
            </div>

            <div className="space-y-2.5 max-h-[310px] overflow-y-auto pr-1">
              {recentLogs.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center italic">No operations recorded yet.</p>
              ) : (
                recentLogs.slice(0, 7).map((log) => {
                  const isEntry = log.operation === 'ENTRY';
                  const isExit = log.operation === 'EXIT';
                  const isQueue = log.operation.includes('QUEUE');
                  const isAuto = log.operation === 'AUTO_ALLOCATE';

                  let badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                  if (isEntry) badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                  if (isExit) badgeColor = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
                  if (isQueue) badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                  if (isAuto) badgeColor = 'bg-purple-500/10 text-purple-400 border-purple-500/20';

                  const timeDisplay = log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '';

                  return (
                    <div key={log.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${badgeColor}`}>
                            {log.operation}
                          </span>
                          {log.slot_number && (
                            <span className="font-mono font-semibold text-slate-200">
                              {log.slot_number}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-[11px] leading-tight">
                          {log.details || `${log.vehicle_number || ''}`}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                        {timeDisplay}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={() => setActivePage('history')}
            className="mt-3 w-full py-2 text-center text-xs text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800/80 rounded-lg transition"
          >
            View Complete Transaction History →
          </button>
        </div>
      </div>
    </div>
  );
}
