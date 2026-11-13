import React from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  LogIn, 
  LogOut, 
  Clock, 
  Cpu, 
  PlayCircle, 
  BarChart3, 
  History, 
  Settings, 
  BookOpen, 
  CheckCircle2
} from 'lucide-react';

const MENU_GROUPS = [
  {
    title: 'PARKING OPERATIONS',
    items: [
      { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard },
      { id: 'parking_map', label: 'Interactive Map', icon: MapPin },
      { id: 'entry', label: 'Vehicle Entry', icon: LogIn, badge: 'Semaphore' },
      { id: 'exit', label: 'Vehicle Exit', icon: LogOut },
      { id: 'queue', label: 'Waiting Queue', icon: Clock, badgeCount: 'queue' },
    ],
  },
  {
    title: 'OS CONCURRENCY ENGINE',
    items: [
      { id: 'sync_monitor', label: 'OS Sync Monitor', icon: Cpu, highlight: true },
      { id: 'simulation', label: 'Concurrent Simulator', icon: PlayCircle },
      { id: 'tests', label: 'Automated Tests', icon: CheckCircle2, badge: '8 Cases' },
    ],
  },
  {
    title: 'ANALYTICS & MANAGEMENT',
    items: [
      { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
      { id: 'history', label: 'Vehicle History', icon: History },
      { id: 'settings', label: 'System Settings', icon: Settings },
      { id: 'documentation', label: 'Project Lab Docs', icon: BookOpen },
    ],
  },
];

export default function Sidebar({ activePage, setActivePage, queueCount = 0 }) {
  return (
    <aside className="w-64 bg-[#0a0f1d] border-r border-slate-800/80 flex flex-col justify-between select-none">
      <div className="py-5 px-3 space-y-6 overflow-y-auto">
        {MENU_GROUPS.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <h2 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {group.title}
            </h2>
            <div className="space-y-1 pt-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-4 w-4 ${isActive ? 'text-blue-400' : item.highlight ? 'text-purple-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {item.badge}
                      </span>
                    )}

                    {item.badgeCount === 'queue' && queueCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                        {queueCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Lab Info Card at bottom */}
      <div className="p-3 m-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
        <div className="font-semibold text-slate-300 flex items-center justify-between">
          <span>OS & CN Lab Product</span>
          <span className="text-emerald-400 font-mono">v2.0</span>
        </div>
        <p className="text-slate-500 leading-relaxed">
          Product 9: Smart Parking Slot Allocation System using Counting Semaphore & Mutex.
        </p>
      </div>
    </aside>
  );
}
