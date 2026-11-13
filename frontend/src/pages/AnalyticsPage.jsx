import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Download, 
  BarChart3, 
  Clock, 
  TrendingUp, 
  Car, 
  Layers, 
  Calendar,
  Filter
} from 'lucide-react';
import { fetchAnalytics } from '../services/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function AnalyticsPage({ state }) {
  const [filter, setFilter] = useState('all');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData(filter);
  }, [filter]);

  const loadData = async (f) => {
    setLoading(true);
    try {
      const data = await fetchAnalytics(f);
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    window.location.href = '/api/analytics/export/csv';
  };

  const kpis = state?.kpis || {};

  return (
    <div className="space-y-6">
      {/* Top Banner & Filter Controls */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            <span>Parking Analytics & Utilization Telemetry</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time charts and aggregate intelligence queried directly from SQLite database records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time Filters */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
            {[
              { id: 'today', label: 'Today' },
              { id: '7days', label: 'Last 7 Days' },
              { id: '30days', label: 'Last 30 Days' },
              { id: 'all', label: 'All History' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filter === tab.id
                    ? 'bg-blue-600 text-white font-semibold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* CSV Export Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 hover:border-slate-700 transition active:scale-95"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block">Total Entries</span>
          <span className="text-2xl font-bold font-mono text-white mt-1 block">
            {analytics?.total_entries ?? kpis.total_entered ?? 0}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Admitted under Semaphore</span>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block">Total Exits</span>
          <span className="text-2xl font-bold font-mono text-indigo-400 mt-1 block">
            {analytics?.total_exits ?? kpis.total_exited ?? 0}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Permits Signaled/Transferred</span>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block">Avg Parking Duration</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
            {analytics?.avg_duration_minutes ?? 0} mins
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Computed from sessions</span>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block">Occupancy Ratio</span>
          <span className="text-2xl font-bold font-mono text-purple-400 mt-1 block">
            {kpis.occupancy_percentage ?? 0}%
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Current Capacity In Use</span>
        </div>
      </div>

      {/* CHARTS GRID ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Entry vs Exit Activity Bar Chart */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Daily Activity (Entries vs Exits)</span>
            <span className="text-xs text-slate-500 font-normal">Last 7 Days</span>
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.days_trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="entries" name="Vehicle Entries" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="exits" name="Vehicle Exits" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Distribution Activity Area Chart */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Peak Parking Hours (24H Distribution)</span>
            <span className="text-xs text-slate-500 font-normal">Hourly Traffic Density</span>
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={(analytics?.hourly_activity || []).filter((h, i) => i % 2 === 0)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }} />
                <Area type="monotone" dataKey="entries" name="Hourly Influx" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CHARTS GRID ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle Type Distribution Pie Chart */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
          <h2 className="text-sm font-bold text-white">Vehicle Type Distribution</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.vehicle_type_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(analytics?.vehicle_type_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Slot Utilization Bar Chart (Bay-by-Bay) */}
        <div className="lg:col-span-2 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Bay Utilization Frequency (Slot P01 - P20)</span>
            <span className="text-xs text-slate-500 font-normal">Cumulative Turnover per Bay</span>
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.slot_utilization || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="slot" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }} />
                <Bar dataKey="uses" name="Times Allocated" fill="#2563eb" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
