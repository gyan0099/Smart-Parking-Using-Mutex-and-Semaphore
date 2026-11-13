import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Square, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Layers, 
  Sliders, 
  Zap, 
  ShieldCheck, 
  Activity,
  Car
} from 'lucide-react';
import { 
  startSimulation, 
  pauseSimulation, 
  resumeSimulation, 
  stopSimulation, 
  resetSimulation,
  fetchSimulationStatus
} from '../services/api';

export default function SimulationPage() {
  const [config, setConfig] = useState({
    total_slots: 5,
    incoming_vehicles: 10,
    arrival_interval_ms: 100,
    concurrent_threads: 10,
    simulation_speed: 1.0,
  });

  const [simStatus, setSimStatus] = useState({
    is_running: false,
    is_paused: false,
    vehicles_log: [],
    timeline_events: [],
    summary_stats: {},
  });

  const [loading, setLoading] = useState(false);

  // Poll status while simulation is running (or updated via websocket)
  useEffect(() => {
    let interval = null;
    const check = async () => {
      try {
        const res = await fetchSimulationStatus();
        setSimStatus(res);
      } catch (err) {
        console.error(err);
      }
    };
    check();
    interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = async () => {
    setLoading(true);
    try {
      await startSimulation(config);
      const res = await fetchSimulationStatus();
      setSimStatus(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    try {
      await pauseSimulation();
      setSimStatus((prev) => ({ ...prev, is_paused: true }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleResume = async () => {
    try {
      await resumeSimulation();
      setSimStatus((prev) => ({ ...prev, is_paused: false }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleStop = async () => {
    try {
      await stopSimulation();
      const res = await fetchSimulationStatus();
      setSimStatus(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = async () => {
    try {
      await resetSimulation();
      const res = await fetchSimulationStatus();
      setSimStatus(res);
    } catch (err) {
      console.error(err);
    }
  };

  const summary = simStatus.summary_stats || {};
  const isFinished = !simStatus.is_running && simStatus.vehicles_log.length > 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              PYTHON CONCURRENT THREADING
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">
              ThreadPoolExecutor Concurrency Stress Test
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Concurrent Vehicle Arrival Simulator
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Execute burst traffic of 10 or more vehicle threads arriving simultaneously at a facility with limited capacity (e.g. 5 spaces). 
            Observe real-time Counting Semaphore throttling and Mutex critical section protection.
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {simStatus.is_running ? (
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono animate-pulse flex items-center gap-1.5">
              <Zap className="h-4 w-4" /> SIMULATION RUNNING
            </span>
          ) : isFinished ? (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> COMPLETED (AUDITED)
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-slate-950 text-slate-400 border border-slate-800 text-xs font-mono">
              READY TO LAUNCH
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls and Configuration Column */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="h-4 w-4 text-blue-400" />
            <span>Simulation Parameters</span>
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Parking Capacity (Slots):</span>
                <span className="font-mono font-bold text-blue-400">{config.total_slots} slots</span>
              </div>
              <input
                type="range"
                min={2}
                max={20}
                value={config.total_slots}
                disabled={simStatus.is_running}
                onChange={(e) => setConfig({ ...config, total_slots: Number(e.target.value) })}
                className="w-full accent-blue-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Incoming Vehicles:</span>
                <span className="font-mono font-bold text-amber-400">{config.incoming_vehicles} vehicles</span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                value={config.incoming_vehicles}
                disabled={simStatus.is_running}
                onChange={(e) => setConfig({ ...config, incoming_vehicles: Number(e.target.value) })}
                className="w-full accent-amber-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Concurrent Threads:</span>
                <span className="font-mono font-bold text-purple-400">{config.concurrent_threads} workers</span>
              </div>
              <input
                type="range"
                min={2}
                max={20}
                value={config.concurrent_threads}
                disabled={simStatus.is_running}
                onChange={(e) => setConfig({ ...config, concurrent_threads: Number(e.target.value) })}
                className="w-full accent-purple-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Burst Interval (ms):</span>
                <span className="font-mono text-slate-300">{config.arrival_interval_ms} ms</span>
              </div>
              <input
                type="range"
                min={0}
                max={500}
                step={25}
                value={config.arrival_interval_ms}
                disabled={simStatus.is_running}
                onChange={(e) => setConfig({ ...config, arrival_interval_ms: Number(e.target.value) })}
                className="w-full accent-slate-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block mt-0.5">0 ms = Simultaneous instantaneous burst</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            {!simStatus.is_running ? (
              <button
                onClick={handleStart}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition active:scale-95 disabled:opacity-50"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>START CONCURRENT SIMULATION</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {simStatus.is_paused ? (
                  <button
                    onClick={handleResume}
                    className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Play className="h-4 w-4" />
                    <span>Resume</span>
                  </button>
                ) : (
                  <button
                    onClick={handlePause}
                    className="py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Pause className="h-4 w-4" />
                    <span>Pause</span>
                  </button>
                )}
                <button
                  onClick={handleStop}
                  className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Square className="h-4 w-4" />
                  <span>Stop</span>
                </button>
              </div>
            )}

            <button
              onClick={handleReset}
              className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Simulator & Parking State</span>
            </button>
          </div>

          {/* Lab Test Scenario Note */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-bold text-slate-300 block">Faculty Test Baseline:</span>
            <p>
              Capacity = 5, Vehicles = 10.<br />
              Expected: 5 Parked (P01..P05), 5 Waiting, 0 Duplicates, 0 Race Conditions.
            </p>
          </div>
        </div>

        {/* Vehicle Outcome Stream & Live Audit Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post-Run Audit Summary Box */}
          {summary.total_requests && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/30 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">OS Concurrency Verification Audit</h3>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  {summary.is_concurrency_safe ? '✔ 100% CONCURRENCY SAFE' : '⚠ CONTENTION DETECTED'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-sans">Total Requests</span>
                  <span className="text-lg font-bold text-white">{summary.total_requests}</span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400 block uppercase font-sans">Allocated Slots</span>
                  <span className="text-lg font-bold text-emerald-400">{summary.successful_allocations}</span>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30">
                  <span className="text-[10px] text-amber-400 block uppercase font-sans">Waiting Queue</span>
                  <span className="text-lg font-bold text-amber-400">{summary.waiting_vehicles}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-sans">Duplicate Slots</span>
                  <span className="text-lg font-bold text-emerald-400">{summary.duplicate_allocations} (0 expected)</span>
                </div>
              </div>
            </div>
          )}

          {/* Vehicle Cards Animated Stream */}
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-400" />
                <span>Simulated Vehicle Arrival Stream ({simStatus.vehicles_log.length})</span>
              </h3>
              <span className="text-xs font-mono text-slate-500">Live Backend Allocation</span>
            </div>

            {simStatus.vehicles_log.length === 0 ? (
              <div className="py-14 text-center text-slate-500 space-y-2">
                <Car className="h-8 w-8 mx-auto text-slate-600" />
                <p className="text-xs">No simulation active.</p>
                <p className="text-[11px] text-slate-600">Click START CONCURRENT SIMULATION to dispatch threads.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                {simStatus.vehicles_log.map((veh) => {
                  const isParked = veh.status === 'PARKED';
                  return (
                    <div
                      key={veh.index}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition animate-slot-pop ${
                        isParked
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                          : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-xs">
                            {veh.registration_number}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            [{veh.vehicle_type}]
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono">
                          Thread: {veh.thread_name}
                        </p>
                      </div>

                      <div className="text-right font-mono">
                        {isParked ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[11px]">
                            PARKED → {veh.slot_number}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-[11px]">
                            WAITING #{veh.queue_position}
                          </span>
                        )}
                        <span className="block text-[9px] text-slate-500 mt-0.5">
                          {veh.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
