import React, { useState } from 'react';
import { 
  Car, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Wrench, 
  Clock, 
  User, 
  Phone, 
  ArrowRight, 
  LogOut,
  ShieldCheck,
  RefreshCw,
  Search
} from 'lucide-react';

export default function ParkingMapPage({ state, onExitVehicle, onToggleMaintenance, setActivePage }) {
  const slots = state?.slots || [];
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [filter, setFilter] = useState('ALL'); // ALL, AVAILABLE, OCCUPIED, MAINTENANCE
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Active slot object refreshed from latest state
  const activeSlot = selectedSlot ? slots.find((s) => s.id === selectedSlot.id) || selectedSlot : null;

  const filteredSlots = slots.filter((slot) => {
    if (filter === 'AVAILABLE' && slot.status !== 'AVAILABLE') return false;
    if (filter === 'OCCUPIED' && slot.status !== 'OCCUPIED') return false;
    if (filter === 'MAINTENANCE' && slot.status !== 'MAINTENANCE') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSlot = slot.slot_number.toLowerCase().includes(q);
      const matchVeh = slot.current_vehicle?.registration_number?.toLowerCase().includes(q);
      const matchOwner = slot.current_vehicle?.owner_name?.toLowerCase().includes(q);
      return matchSlot || matchVeh || matchOwner;
    }
    return true;
  });

  const handleExitClick = async (slotNumber) => {
    setIsProcessing(true);
    try {
      await onExitVehicle({ slot_number: slotNumber });
      setSelectedSlot(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMaintClick = async (slotNumber, currentStatus) => {
    setIsProcessing(true);
    try {
      await onToggleMaintenance(slotNumber, currentStatus !== 'MAINTENANCE');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Interactive Parking Bay Floorplan</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {slots.length} Bays Total
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time visual map representing physical slots synchronized with OS Counting Semaphore & Mutex.
          </p>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search slot or vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-48"
            />
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
            {['ALL', 'AVAILABLE', 'OCCUPIED', 'MAINTENANCE'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 rounded-lg transition ${
                  filter === tab
                    ? 'bg-blue-600 text-white font-semibold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Floorplan Layout: Map Grid on Left, Slot Details Drawer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Floorplan Grid */}
        <div className="lg:col-span-2 bg-[#0d1424] p-6 rounded-2xl border border-slate-800/80 shadow-2xl relative overflow-hidden">
          {/* Driveway decoration */}
          <div className="mb-4 pb-2 border-b border-dashed border-slate-800 flex items-center justify-between text-[11px] text-slate-500 uppercase tracking-widest font-mono">
            <span>◄ ENTRY GATE / SEMAPHORE DISPATCH</span>
            <span>CENTRAL DRIVEWAY LANE</span>
            <span>EXIT GATE ►</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3.5">
            {filteredSlots.map((slot) => {
              const isAvailable = slot.status === 'AVAILABLE';
              const isOccupied = slot.status === 'OCCUPIED';
              const isMaint = slot.status === 'MAINTENANCE';
              const isSelected = activeSlot?.id === slot.id;

              let cardStyle = 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700';
              let badgeColor = 'bg-slate-800 text-slate-400';
              let statusLabel = 'Available';

              if (isAvailable) {
                cardStyle = 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300 hover:border-emerald-400 hover:bg-emerald-950/40';
                badgeColor = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
                statusLabel = 'Free';
              } else if (isOccupied) {
                cardStyle = 'bg-rose-950/20 border-rose-500/40 text-rose-300 hover:border-rose-400 hover:bg-rose-950/40';
                badgeColor = 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
                statusLabel = 'Parked';
              } else if (isMaint) {
                cardStyle = 'bg-slate-950 border-slate-800 text-slate-500 opacity-60';
                badgeColor = 'bg-slate-800 text-slate-400 border border-slate-700';
                statusLabel = 'Offline';
              }

              if (isSelected) {
                cardStyle += ' ring-2 ring-blue-500 shadow-lg shadow-blue-500/20';
              }

              return (
                <div
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 transform hover:-translate-y-0.5 flex flex-col justify-between h-28 relative group ${cardStyle}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-white">
                      {slot.slot_number}
                    </span>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${badgeColor}`}>
                      {statusLabel}
                    </span>
                  </div>

                  {isOccupied && slot.current_vehicle ? (
                    <div className="my-auto space-y-0.5">
                      <p className="font-mono text-xs font-bold text-white tracking-wider truncate">
                        {slot.current_vehicle.registration_number}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {slot.current_vehicle.vehicle_type}
                      </p>
                    </div>
                  ) : isAvailable ? (
                    <div className="my-auto text-center">
                      <span className="text-[11px] text-emerald-400/80 font-medium flex items-center justify-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Ready
                      </span>
                    </div>
                  ) : (
                    <div className="my-auto text-center">
                      <span className="text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1">
                        <Wrench className="h-3 w-3" /> Offline
                      </span>
                    </div>
                  )}

                  <div className="pt-1.5 border-t border-slate-800/40 flex items-center justify-between text-[9px] text-slate-500">
                    <span>Bay #{slot.id}</span>
                    <span className="group-hover:text-blue-400 transition">Details →</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Map Footer Guide */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-emerald-500/20 border border-emerald-500/40"></span>
                <span>Available</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-rose-500/20 border border-rose-500/40"></span>
                <span>Occupied</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-slate-800 border border-slate-700"></span>
                <span>Maintenance</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 italic">
              Click any bay to trigger instant exit or inspect vehicle telemetry
            </p>
          </div>
        </div>

        {/* Slot Detail Panel / Drawer */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
          {activeSlot ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Selected Parking Bay
                  </span>
                  <h2 className="text-2xl font-bold font-mono text-white flex items-center gap-2">
                    {activeSlot.slot_number}
                    <span className={`text-xs font-sans font-bold px-2 py-0.5 rounded-full ${
                      activeSlot.status === 'AVAILABLE'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : activeSlot.status === 'OCCUPIED'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {activeSlot.status}
                    </span>
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="text-xs text-slate-500 hover:text-white"
                >
                  Clear Selection
                </button>
              </div>

              {/* Occupied Vehicle Details */}
              {activeSlot.status === 'OCCUPIED' && activeSlot.current_vehicle ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Car className="h-4 w-4 text-blue-400" /> Registration Number
                      </span>
                      <span className="font-mono font-bold text-white text-sm">
                        {activeSlot.current_vehicle.registration_number}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <User className="h-4 w-4 text-purple-400" /> Owner Name
                      </span>
                      <span className="font-medium text-slate-200">
                        {activeSlot.current_vehicle.owner_name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Car className="h-4 w-4 text-emerald-400" /> Vehicle Type
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        {activeSlot.current_vehicle.vehicle_type}
                      </span>
                    </div>

                    {activeSlot.current_vehicle.mobile_number && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Phone className="h-4 w-4 text-slate-400" /> Contact
                        </span>
                        <span className="font-mono text-slate-300">
                          {activeSlot.current_vehicle.mobile_number}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions for Occupied Bay */}
                  <button
                    disabled={isProcessing}
                    onClick={() => handleExitClick(activeSlot.slot_number)}
                    className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 transition active:scale-95 disabled:opacity-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Process Vehicle Exit & Release Bay</span>
                  </button>
                </div>
              ) : activeSlot.status === 'AVAILABLE' ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
                    <p className="font-semibold flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400" /> Bay Available for Allocation
                    </p>
                    <p className="text-slate-400 leading-relaxed">
                      This bay holds 1 active Counting Semaphore permit. Vehicles arriving at the entry barrier will receive this slot automatically under Mutex protection.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setActivePage('entry')}
                      className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
                    >
                      Park Vehicle Here
                    </button>
                    <button
                      disabled={isProcessing}
                      onClick={() => handleMaintClick(activeSlot.slot_number, activeSlot.status)}
                      className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
                    >
                      Disable (Maintenance)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs space-y-2">
                    <p className="font-semibold text-slate-300 flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-amber-400" /> Bay In Maintenance
                    </p>
                    <p className="leading-relaxed">
                      This bay is temporarily excluded from allocation. Its Counting Semaphore permit has been withheld.
                    </p>
                  </div>

                  <button
                    disabled={isProcessing}
                    onClick={() => handleMaintClick(activeSlot.slot_number, activeSlot.status)}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition"
                  >
                    Re-enable Slot (Restore to Service)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-center mx-auto text-slate-400">
                <Car className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-300">No Bay Selected</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Click on any parking bay card from the floorplan to inspect vehicle duration, driver details, or execute instant release.
              </p>
            </div>
          )}

          <div className="p-3 mt-4 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0" />
            <span>Mutual Exclusion protects all state updates to this floorplan.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
