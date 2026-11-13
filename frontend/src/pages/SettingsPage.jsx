import React, { useState } from 'react';
import { 
  Settings, 
  Layers, 
  Wrench, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Save, 
  ShieldAlert, 
  Sliders,
  Cpu
} from 'lucide-react';
import { updateCapacity, toggleSlotMaintenance } from '../services/api';

export default function SettingsPage({ state, onReset }) {
  const kpis = state?.kpis || {};
  const slots = state?.slots || [];
  const sync = state?.sync_monitor || {};

  const [capacityInput, setCapacityInput] = useState(kpis.total_slots || 20);
  const [capacityLoading, setCapacityLoading] = useState(false);
  const [capacityMsg, setCapacityMsg] = useState(null);

  const [maintLoading, setMaintLoading] = useState(false);
  const [maintMsg, setMaintMsg] = useState(null);

  const [confirmReset, setConfirmReset] = useState(false);

  const handleCapacitySubmit = async (e) => {
    e.preventDefault();
    setCapacityLoading(true);
    setCapacityMsg(null);
    try {
      const res = await updateCapacity(Number(capacityInput));
      setCapacityMsg({ type: 'success', text: res.message });
    } catch (err) {
      setCapacityMsg({ type: 'error', text: err.message });
    } finally {
      setCapacityLoading(false);
    }
  };

  const handleToggleMaint = async (slotNumber, currentStatus) => {
    setMaintLoading(true);
    setMaintMsg(null);
    try {
      const res = await toggleSlotMaintenance(slotNumber, currentStatus !== 'MAINTENANCE');
      setMaintMsg({ type: 'success', text: res.message });
    } catch (err) {
      setMaintMsg({ type: 'error', text: err.message });
    } finally {
      setMaintLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-400" />
            <span>Facility Configuration & OS Kernel Tuning</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic capacity management and maintenance controls synchronized with Counting Semaphore and Mutex.
          </p>
        </div>

        <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-500/30">
          Current Capacity: {kpis.total_slots} Slots
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Capacity Reconfiguration Card */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Adjust Parking Capacity</h2>
              <p className="text-xs text-slate-400">Reconfigures Counting Semaphore S = N</p>
            </div>
          </div>

          <form onSubmit={handleCapacitySubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Total Parking Bays (1 - 50)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={Math.max(1, kpis.occupied_slots || 1)}
                  max={50}
                  value={capacityInput}
                  onChange={(e) => setCapacityInput(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono font-bold text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={capacityLoading}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 shrink-0"
                >
                  <Save className="h-4 w-4" />
                  <span>Update</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Rule: Capacity cannot be set lower than currently occupied bays ({kpis.occupied_slots ?? 0}).
              </p>
            </div>

            {capacityMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                capacityMsg.type === 'success'
                  ? 'bg-emerald-950/40 border border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/40 border border-rose-800 text-rose-300'
              }`}>
                {capacityMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
                <span>{capacityMsg.text}</span>
              </div>
            )}
          </form>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-bold text-slate-300 block">Kernel Impact:</span>
            <p>
              When capacity changes, the backend atomically reconstructs <code>threading.Semaphore(new_capacity - occupied)</code> inside a Mutex critical section to ensure no permits are leaked.
            </p>
          </div>
        </div>

        {/* Demo Reset Card */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800 mb-4">
              <div className="h-9 w-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Reset Database & State</h2>
                <p className="text-xs text-slate-400">Restore default demo dataset</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              This resets all active sessions, clears the FIFO waiting queue, purges activity logs, and repopulates initial realistic demo vehicles across slots P01 to P06.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-3">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
              >
                Reset Demo Data...
              </button>
            ) : (
              <div className="space-y-2 p-3 rounded-xl bg-rose-950/30 border border-rose-800/60">
                <p className="text-[11px] text-rose-300 font-medium">
                  Confirm reset? All current sessions and queue entries will be cleared.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onReset();
                      setConfirmReset(false);
                    }}
                    className="py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition"
                  >
                    Confirm Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Maintenance Controls per Slot */}
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Individual Slot Maintenance Override</h2>
              <p className="text-xs text-slate-400">
                Mark bay for maintenance to withhold its semaphore permit and prevent allocation.
              </p>
            </div>
          </div>
        </div>

        {maintMsg && (
          <div className="p-3 rounded-xl text-xs bg-emerald-950/40 border border-emerald-800 text-emerald-300">
            {maintMsg.text}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-2 pt-2">
          {slots.map((slot) => {
            const isMaint = slot.status === 'MAINTENANCE';
            const isOccupied = slot.status === 'OCCUPIED';

            return (
              <div
                key={slot.id}
                className={`p-2.5 rounded-xl border text-center flex flex-col justify-between ${
                  isMaint
                    ? 'bg-slate-950 border-amber-500/40 text-amber-400'
                    : isOccupied
                    ? 'bg-rose-950/20 border-rose-500/30 text-rose-400 opacity-60'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300'
                }`}
              >
                <span className="font-mono font-bold text-xs">{slot.slot_number}</span>
                <span className="text-[9px] uppercase font-semibold my-1">
                  {slot.status}
                </span>

                <button
                  disabled={isOccupied || maintLoading}
                  onClick={() => handleToggleMaint(slot.slot_number, slot.status)}
                  className={`mt-1 py-1 rounded text-[10px] font-semibold transition disabled:opacity-30 ${
                    isMaint
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                  title={isOccupied ? 'Cannot put occupied slot in maintenance' : ''}
                >
                  {isMaint ? 'Enable' : 'Disable'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
