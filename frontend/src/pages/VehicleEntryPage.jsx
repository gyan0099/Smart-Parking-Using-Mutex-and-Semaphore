import React, { useState } from 'react';
import { 
  Car, 
  User, 
  Phone, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  Cpu, 
  ArrowRight,
  Zap
} from 'lucide-react';

const VEHICLE_TYPES = [
  { id: 'Car', label: 'Car', icon: '🚗' },
  { id: 'SUV', label: 'SUV', icon: '🚙' },
  { id: 'Electric Vehicle', label: 'Electric Vehicle (EV)', icon: '⚡' },
  { id: 'Bike', label: 'Motorcycle / Bike', icon: '🏍️' },
  { id: 'Other', label: 'Commercial / Other', icon: '🚐' },
];

export default function VehicleEntryPage({ onVehicleEntry, state, setActivePage }) {
  const [formData, setFormData] = useState({
    registration_number: '',
    owner_name: '',
    vehicle_type: 'Car',
    mobile_number: '',
  });

  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const kpis = state?.kpis || {};
  const sync = state?.sync_monitor || {};

  const handleRandomFill = () => {
    const states = ['TS09', 'TS08', 'TS07', 'TS10', 'AP29', 'KA04'];
    const letters = ['AB', 'CD', 'EF', 'GH', 'KL', 'XY'];
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const names = [
      'Vikram Reddy', 'Ananya Sharma', 'Rahul Varma', 'Pooja Iyer', 
      'Karthik Raju', 'Deepa Nair', 'Siddharth Rao', 'Sneha Patel'
    ];
    const randState = states[Math.floor(Math.random() * states.length)];
    const randLetter = letters[Math.floor(Math.random() * letters.length)];
    const randName = names[Math.floor(Math.random() * names.length)];
    const randType = VEHICLE_TYPES[Math.floor(Math.random() * VEHICLE_TYPES.length)].id;

    setFormData({
      registration_number: `${randState}${randLetter}${randomNum}`,
      owner_name: randName,
      vehicle_type: randType,
      mobile_number: `+91 98480 ${Math.floor(10000 + Math.random() * 90000)}`,
    });
    setErrorMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.registration_number.trim() || !formData.owner_name.trim()) {
      setErrorMessage('Please provide registration number and owner name.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setLastResult(null);

    try {
      const res = await onVehicleEntry(formData);
      if (res.success) {
        setLastResult(res);
        // Clear form for next entry
        setFormData({
          registration_number: '',
          owner_name: '',
          vehicle_type: 'Car',
          mobile_number: '',
        });
      } else {
        setErrorMessage(res.message || 'Vehicle entry failed.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'System error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top OS Concept Card */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>OS Vehicle Admission Engine</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                wait(S) + Mutex.acquire()
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Permits Left: <strong className="text-emerald-400 font-mono">{kpis.available_slots ?? 0}</strong> | 
              Waiting Queue: <strong className="text-amber-400 font-mono">{kpis.waiting_vehicles ?? 0}</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRandomFill}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition"
        >
          <Sparkles className="h-3.5 w-3.5 text-blue-400" />
          <span>Generate Demo Vehicle</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Entry Form */}
        <div className="md:col-span-2 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <h2 className="text-base font-bold text-white mb-1">Vehicle Admission Form</h2>
          <p className="text-xs text-slate-400 mb-6">Enter registration data to allocate a parking bay.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Registration Number */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Vehicle Registration Number *
              </label>
              <div className="relative">
                <Car className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. TS09AB1234"
                  value={formData.registration_number}
                  onChange={(e) => setFormData({ ...formData, registration_number: e.target.value.toUpperCase() })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono font-semibold text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Owner Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Owner / Driver Name *
              </label>
              <div className="relative">
                <User className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Reddy"
                  value={formData.owner_name}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Vehicle Type Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Vehicle Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {VEHICLE_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, vehicle_type: t.id })}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium flex items-center gap-2 transition ${
                      formData.vehicle_type === t.id
                        ? 'bg-blue-600/20 text-blue-300 border-blue-500/50 ring-1 ring-blue-500/50 font-bold'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-base">{t.icon}</span>
                    <span className="truncate">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Contact Mobile (Optional)
              </label>
              <div className="relative">
                <Phone className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="+91 98480 12345"
                  value={formData.mobile_number}
                  onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span>Executing OS Critical Section...</span>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>Enter Parking Barrier</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Real-time Admission Result Card */}
        <div className="space-y-4">
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-xl">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Gate Transaction Outcome
            </h3>

            {lastResult ? (
              <div className={`p-4 rounded-xl border space-y-3 ${
                lastResult.status === 'PARKED'
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
              }`}>
                <div className="flex items-center gap-2">
                  {lastResult.status === 'PARKED' ? (
                    <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                  ) : (
                    <Clock className="h-5 w-5 text-amber-400 shrink-0" />
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {lastResult.status === 'PARKED' ? 'VEHICLE PARKED' : 'PARKING FULL (QUEUED)'}
                    </h4>
                    <p className="text-[11px] opacity-80">{lastResult.message}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vehicle:</span>
                    <span className="font-bold text-white">{lastResult.vehicle_number}</span>
                  </div>
                  {lastResult.slot_number && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Allocated Bay:</span>
                      <span className="font-bold text-emerald-400 text-sm">{lastResult.slot_number}</span>
                    </div>
                  )}
                  {lastResult.queue_position && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Queue Position:</span>
                      <span className="font-bold text-amber-400 text-sm">#{lastResult.queue_position}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Permits Left:</span>
                    <span className="text-slate-300">{lastResult.semaphore_permits_left}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActivePage(lastResult.status === 'PARKED' ? 'parking_map' : 'queue')}
                    className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-200 border border-slate-700 transition flex items-center justify-center gap-1"
                  >
                    <span>{lastResult.status === 'PARKED' ? 'View in Parking Map' : 'Inspect Waiting Queue'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <Car className="h-8 w-8 mx-auto text-slate-600" />
                <p className="text-xs">No recent entry operation.</p>
                <p className="text-[11px] text-slate-600 max-w-[200px] mx-auto">
                  Submit the form or click "Generate Demo Vehicle" to admit a vehicle.
                </p>
              </div>
            )}
          </div>

          {/* OS Protocol Step Guide */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-2">
            <span className="font-bold uppercase tracking-wider text-slate-300 block">
              Admission OS Pipeline
            </span>
            <ol className="list-decimal list-inside space-y-1 text-slate-400 font-mono text-[10px]">
              <li>Check duplicate registration</li>
              <li>Semaphore.try_acquire() check</li>
              <li>Enter Mutex Critical Section</li>
              <li>Assign first available slot</li>
              <li>Commit DB session</li>
              <li>Release Mutex</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
