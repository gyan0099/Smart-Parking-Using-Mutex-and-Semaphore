import React, { useState } from 'react';
import { 
  Clock, 
  Car, 
  User, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  ListOrdered, 
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function WaitingQueuePage({ state, onCancelQueue, setActivePage }) {
  const waitingQueue = state?.waiting_queue || [];
  const kpis = state?.kpis || {};
  const [cancellingId, setCancellingId] = useState(null);

  const handleCancel = async (queueId) => {
    setCancellingId(queueId);
    try {
      await onCancelQueue(queueId);
    } catch (err) {
      console.error(err);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              FIFO QUEUE DISCIPLINE
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">
              First In, First Out Scheduling
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Waiting Queue Management
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            When all counting semaphore permits are acquired (0 available), newly arrived vehicles are enqueued in FIFO order. 
            The moment any slot is released, the vehicle at position #1 atomically inherits the bay.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-right">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">Queue Length</span>
            <span className="text-lg font-bold font-mono text-amber-400">{waitingQueue.length} Vehicles</span>
          </div>
          <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-right">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">Free Bays</span>
            <span className="text-lg font-bold font-mono text-emerald-400">{kpis.available_slots ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ListOrdered className="h-4 w-4 text-amber-400" />
            <span>Active Waiting Line</span>
          </h2>
          <span className="text-xs text-slate-500">
            Auto-dispatched immediately when occupied vehicle exits
          </span>
        </div>

        {waitingQueue.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">Waiting Queue is Currently Empty</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are either available parking bays, or no surplus vehicle requests have arrived.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setActivePage('entry')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
              >
                Go to Vehicle Entry
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase text-[10px] text-slate-500 tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Priority Position</th>
                  <th className="py-3 px-4">Vehicle Number</th>
                  <th className="py-3 px-4">Owner Name</th>
                  <th className="py-3 px-4">Vehicle Type</th>
                  <th className="py-3 px-4">Arrival Timestamp</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {waitingQueue.map((item) => {
                  const arrivalTimeFormatted = item.arrival_time ? new Date(item.arrival_time).toLocaleTimeString() : 'N/A';
                  const isTopPriority = item.queue_position === 1;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-800/40 transition ${
                        isTopPriority ? 'bg-amber-950/15' : ''
                      }`}
                    >
                      {/* Position */}
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-mono font-bold ${
                          isTopPriority
                            ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25 ring-2 ring-amber-400/50'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {item.queue_position}
                        </span>
                        {isTopPriority && (
                          <span className="ml-2 text-[10px] font-semibold text-amber-400 uppercase tracking-wide">
                            Next to Park
                          </span>
                        )}
                      </td>

                      {/* Reg Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-white text-sm">
                        {item.registration_number}
                      </td>

                      {/* Owner */}
                      <td className="py-3.5 px-4 text-slate-300">
                        {item.owner_name}
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">
                          {item.vehicle_type}
                        </span>
                      </td>

                      {/* Arrival */}
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {arrivalTimeFormatted}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {item.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          disabled={cancellingId === item.id}
                          onClick={() => handleCancel(item.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 text-xs font-medium transition inline-flex items-center gap-1 active:scale-95 disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>{cancellingId === item.id ? 'Cancelling...' : 'Cancel'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Explanatory Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2">
          <span className="font-semibold text-white flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-blue-400" />
            Automatic Slot Inheritance
          </span>
          <p className="leading-relaxed">
            The moment any active vehicle calls the exit endpoint, the critical section locks the database, marks the session as finished, and directly transfers the bay to queue position #1 without releasing the semaphore permit back to the unallocated pool.
          </p>
        </div>

        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2">
          <span className="font-semibold text-white flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-purple-400" />
            Re-indexing Guarantee
          </span>
          <p className="leading-relaxed">
            Whenever a vehicle is allocated or cancels its request, remaining queue items are atomically re-indexed (position 2 becomes 1, 3 becomes 2, etc.) under Mutex lock to maintain strict mathematical ordering.
          </p>
        </div>
      </div>
    </div>
  );
}
