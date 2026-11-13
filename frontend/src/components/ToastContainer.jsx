import React from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export default function ToastContainer({ toasts, removeToast }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let borderClass = 'border-emerald-500/40 bg-[#0a1818]/95 text-emerald-200';
        let iconColor = 'text-emerald-400';

        if (toast.type === 'warning') {
          Icon = AlertTriangle;
          borderClass = 'border-amber-500/40 bg-[#1f190a]/95 text-amber-200';
          iconColor = 'text-amber-400';
        } else if (toast.type === 'error') {
          Icon = XCircle;
          borderClass = 'border-rose-500/40 bg-[#1f0a0e]/95 text-rose-200';
          iconColor = 'text-rose-400';
        } else if (toast.type === 'info') {
          Icon = Info;
          borderClass = 'border-blue-500/40 bg-[#0a1226]/95 text-blue-200';
          iconColor = 'text-blue-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-xl backdrop-blur-md flex items-start space-x-3 transition-all duration-300 transform translate-y-0 opacity-100 ${borderClass}`}
          >
            <Icon className={`h-5 w-5 ${iconColor} shrink-0 mt-0.5`} />
            <div className="flex-1 text-xs">
              {toast.title && <p className="font-bold text-white text-sm mb-0.5">{toast.title}</p>}
              <p className="leading-snug opacity-90">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition p-0.5 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
