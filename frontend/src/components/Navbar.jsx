import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Wifi, 
  WifiOff, 
  Clock, 
  Bell, 
  RefreshCw, 
  GraduationCap, 
  ShieldCheck, 
  Cpu
} from 'lucide-react';

export default function Navbar({ isConnected, onReset, activePage, setActivePage }) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-[#0a0f1d]/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & Subtitle */}
      <div className="flex items-center space-x-4">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 ring-1 ring-blue-400/30">
          <Car className="h-6 w-6 stroke-[2.2]" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              Smart Parking Slot Allocation System
            </h1>
            <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Product 9
            </span>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5 text-purple-400" />
            <span>OS & CN Lab — School of CS & AI, SR University</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
              <Cpu className="h-3 w-3" /> Semaphore + Mutex Engine
            </span>
          </p>
        </div>
      </div>

      {/* Status Indicators & Quick Controls */}
      <div className="flex items-center space-x-4">
        {/* Live Clock */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-300">
          <Clock className="h-3.5 w-3.5 text-blue-400" />
          <span>{timeStr}</span>
        </div>

        {/* Live Socket Status */}
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
          isConnected 
            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30' 
            : 'bg-rose-950/40 text-rose-300 border-rose-500/30'
        }`}>
          <span className="relative flex h-2 w-2">
            {isConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-400' : 'bg-rose-500'}`}></span>
          </span>
          {isConnected ? (
            <span className="flex items-center gap-1"><Wifi className="h-3 w-3" /> Live Backend Synced</span>
          ) : (
            <span className="flex items-center gap-1"><WifiOff className="h-3 w-3" /> Reconnecting...</span>
          )}
        </div>

        {/* Quick Reset Demo Button */}
        <button
          onClick={onReset}
          title="Restore Demo Initial State"
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition"
        >
          <RefreshCw className="h-4 w-4" />
        </button>

        {/* Documentation shortcut button */}
        <button
          onClick={() => setActivePage('documentation')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
            activePage === 'documentation'
              ? 'bg-blue-600 text-white border-blue-500'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
          <span>Lab Docs</span>
        </button>
      </div>
    </header>
  );
}
