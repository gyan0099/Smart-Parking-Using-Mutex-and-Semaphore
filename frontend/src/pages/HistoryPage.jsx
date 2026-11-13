import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Download, 
  Car, 
  Clock, 
  Calendar, 
  Filter, 
  CheckCircle, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';
import { fetchVehicleHistory } from '../services/api';

export default function HistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, COMPLETED
  const [typeFilter, setTypeFilter] = useState('ALL');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await fetchVehicleHistory();
      setSessions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    window.location.href = '/api/analytics/export/csv';
  };

  const filteredSessions = sessions.filter((s) => {
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && s.vehicle_type !== typeFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchReg = s.registration_number?.toLowerCase().includes(q);
      const matchOwner = s.owner_name?.toLowerCase().includes(q);
      const matchSlot = s.slot_number?.toLowerCase().includes(q);
      return matchReg || matchOwner || matchSlot;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-400" />
            <span>Vehicle Parking Session Ledger</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete persistent audit log of all admitted and departed vehicles stored in SQLite.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadHistory}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
            title="Refresh Ledger"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition active:scale-95"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search plate, owner, or slot..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {['ALL', 'ACTIVE', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Vehicle Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="py-1.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none"
          >
            <option value="ALL">All Vehicle Types</option>
            <option value="Car">Car</option>
            <option value="SUV">SUV</option>
            <option value="Electric Vehicle">Electric Vehicle</option>
            <option value="Bike">Bike</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase text-[10px] text-slate-500 tracking-wider font-semibold border-b border-slate-800 sticky top-0">
              <tr>
                <th className="py-3 px-4">Session ID</th>
                <th className="py-3 px-4">Registration</th>
                <th className="py-3 px-4">Owner Name</th>
                <th className="py-3 px-4">Vehicle Type</th>
                <th className="py-3 px-4">Assigned Slot</th>
                <th className="py-3 px-4">Entry Time</th>
                <th className="py-3 px-4">Exit Time</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 font-sans text-xs italic">
                    No matching vehicle sessions found.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((s) => {
                  const isActive = s.status === 'ACTIVE';
                  const entryTimeFmt = s.entry_time ? new Date(s.entry_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'N/A';
                  const exitTimeFmt = s.exit_time ? new Date(s.exit_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—';

                  return (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 text-slate-500 font-bold">
                        #{s.id}
                      </td>
                      <td className="py-3 px-4 font-bold text-white text-xs">
                        {s.registration_number}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-200">
                        {s.owner_name}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                          {s.vehicle_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-blue-400">
                        {s.slot_number}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {entryTimeFmt}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {exitTimeFmt}
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">
                        {s.duration_formatted || (isActive ? 'Active Parking...' : '—')}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isActive
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
