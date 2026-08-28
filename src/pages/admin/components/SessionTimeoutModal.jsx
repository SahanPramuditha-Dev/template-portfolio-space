import React from 'react';
import { ShieldAlert, RefreshCw, LogOut } from 'lucide-react';

const SessionTimeoutModal = ({ isOpen, remainingSeconds, onStaySignedIn, onSignOut }) => {
  if (!isOpen) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl border border-amber-500/30 bg-slate-900/95 p-6 sm:p-8 shadow-2xl shadow-amber-500/10 text-center">
        <div className="mx-auto mb-4 inline-flex rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-amber-400">
          <ShieldAlert size={28} />
        </div>
        
        <h3 className="text-xl font-bold text-slate-100">Session Expiring Soon</h3>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
          For your security, your admin session will automatically close due to inactivity in:
        </p>

        <div className="my-5 inline-block rounded-2xl border border-amber-500/20 bg-amber-500/10 px-6 py-2.5 font-mono text-2xl font-black text-amber-400">
          {formattedTime}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <button
            type="button"
            onClick={onStaySignedIn}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-sky-500/25 hover:bg-sky-400 active:scale-[0.99] transition-all"
          >
            <RefreshCw size={15} />
            Stay Signed In
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
          >
            <LogOut size={15} />
            Sign Out Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutModal;
