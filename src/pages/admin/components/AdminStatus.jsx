import React from 'react';
import clsx from 'clsx';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

const AdminStatus = ({ message }) => {
  if (!message) return null;
  const lower = message.toLowerCase();
  const isError =
    lower.includes('failed') ||
    lower.includes('denied') ||
    lower.includes('incorrect') ||
    lower.includes('invalid') ||
    lower.includes('error') ||
    lower.includes('blocked');
  const isSuccess =
    lower.includes('saved') || lower.includes('uploaded') || lower.includes('deleted') || lower.includes('ready') || lower.includes('restored') || lower.includes('synced');

  return (
    <div
      role="status"
      className={clsx(
        'flex items-center gap-3 rounded-xl border px-4 py-3 text-xs sm:text-sm font-medium transition-all shadow-lg',
        isError && 'border-red-500/30 bg-red-500/10 text-red-200 shadow-red-500/5',
        isSuccess && !isError && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200 shadow-emerald-500/5',
        !isError && !isSuccess && 'border-sky-500/30 bg-sky-500/10 text-sky-200 shadow-sky-500/5'
      )}
    >
      {isError ? (
        <AlertCircle className="h-4 w-4 shrink-0 text-red-400" aria-hidden />
      ) : isSuccess ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
      ) : (
        <Info className="h-4 w-4 shrink-0 text-sky-400" aria-hidden />
      )}
      <span className="leading-snug">{message}</span>
    </div>
  );
};

export default AdminStatus;

