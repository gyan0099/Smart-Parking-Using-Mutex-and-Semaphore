import React, { useState } from 'react';
import { 
  LogOut, 
  Search, 
  Car, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  User, 
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function VehicleExitPage({ onVehicleExit, state, setActivePage }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [exitResult, setExitResult] = useState(null);

  const slots = state?.slots || [];
  const occupiedSlots = slots.filter((s) => s.status === 'OCCUPIED' && s.current_vehicle);

  const handleExitSubmit = async (regOrSlot) => {
    const val = regOrSlot || searchQuery;
    if (!val.trim()) {
      setErrorMessage('Please specify registration number or slot ID.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setExitResult(null);

    try {
      const isSlot = /^P\d+$/i.test(val.trim());
      const payload = isSlot ? { slot_number: val.trim().toUpperCase() } : { registration_number: val.trim().toUpperCase() };
      const res = await onVehicleExit(payload);
      setExitResult(res);
      setSearchQuery('');
    } catch (err) {
      setErrorMessage(err.message || 'Vehicle exit failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Vehicle Exit & Automated Slot Re-allocation</span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              signal(S) / Atomic Handover
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Releases the parking slot, calculates parking duration, and atomically hands over the space to the first waiting vehicle.
          </p>
        </div>

        <span className="text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          Currently Parked: <strong className="text-white font-mono">{occupiedSlots.length}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Search & Quick Selection of Parked Vehicles */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <h2 className="text-base font-bold text-white mb-1">Exit Gate Scanner</h2>
            <p className="text-xs text-slate-400 mb-5">
              Enter vehicle registration number (e.g. TS09FA1001) or slot code (e.g. P03).
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleExitSubmit();
              }}
              className="flex gap-2 mb-4"
            >
              <div className="relative flex-1">
                <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter Plate or Slot (e.g. TS09... or P01)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono font-semibold text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !searchQuery.trim()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Process Exit'}
              </button>
            </form>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 mb-4">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Quick Click Parked Vehicle Cards */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Quick Select Parked Vehicles ({occupiedSlots.length})
                </span>
                <span className="text-[11px] text-slate-500">1-Click Exit</span>
              </div>

              {occupiedSlots.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs italic">
                  No vehicles are currently parked.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {occupiedSlots.map((slot) => {
                    const veh = slot.current_vehicle;
                    return (
                      <div
                        key={slot.id}
                        className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/50 transition flex items-center justify-between group"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-white">
                              {veh.registration_number}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
                              {slot.slot_number}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                            {veh.owner_name} • {veh.vehicle_type}
                          </p>
                        </div>

                        <button
                          disabled={loading}
                          onClick={() => handleExitSubmit(veh.registration_number)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-[11px] font-semibold transition active:scale-95 disabled:opacity-50"
                        >
                          Exit Bay
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Exit Outcome & Next Waiting Vehicle Dispatch */}
        <div className="space-y-4">
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-xl">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Exit Confirmation Telemetry
            </h3>

            {exitResult ? (
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 text-emerald-300 space-y-3.5">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-white">VEHICLE EXIT SUCCESSFUL</h4>
                    <p className="text-[11px] text-emerald-300/80 leading-snug">{exitResult.message}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Exited Vehicle:</span>
                    <span className="font-bold text-white">{exitResult.vehicle_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Released Slot:</span>
                    <span className="font-bold text-emerald-400">{exitResult.released_slot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Parking Duration:</span>
                    <span className="font-bold text-indigo-300">{exitResult.duration_formatted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Permits Now:</span>
                    <span className="text-slate-200">{exitResult.semaphore_permits_available}</span>
                  </div>
                </div>

                {/* Next Waiting Vehicle Box */}
                {exitResult.next_waiting_vehicle ? (
                  <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                      Automatic Handover to Waiting Vehicle
                    </span>
                    <p className="text-[11px]">
                      Vehicle <strong className="font-mono text-white">{exitResult.next_waiting_vehicle}</strong> was automatically dispatched to slot <strong className="font-mono text-white">{exitResult.released_slot}</strong>!
                    </p>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                    No vehicles in waiting queue. Counting Semaphore permit incremented back to pool.
                  </div>
                )}

                <button
                  onClick={() => setActivePage('parking_map')}
                  className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-200 border border-slate-700 transition flex items-center justify-center gap-1"
                >
                  <span>Verify Bay on Parking Map</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <LogOut className="h-8 w-8 mx-auto text-slate-600" />
                <p className="text-xs">No recent exit operation.</p>
                <p className="text-[11px] text-slate-600 max-w-[200px] mx-auto">
                  Search a registration or select an occupied bay from the left list.
                </p>
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-bold text-slate-300 block">Atomic Handover Property:</span>
            <p className="leading-relaxed">
              When a waiting vehicle inherits a released slot, the semaphore permit count is preserved without temporary release, eliminating any race window between exit and queue dequeue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
