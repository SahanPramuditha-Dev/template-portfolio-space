import React from 'react';
import clsx from 'clsx';
import { XCircle, CheckCircle2 } from 'lucide-react';

const AdminStatus = ({ message }) => {
  if (!message) return null;
  const lower = message.toLowerCase();
  const isError =
    lower.includes('failed') ||
    lower.includes('denied') ||
    lower.includes('incorrect') ||
    lower.includes('invalid') ||
    lower.includes('blocked');
  const isSuccess =
    lower.includes('saved') || lower.includes('uploaded') || lower.includes('deleted') || lower.includes('ready');

  return (
    <div
      role="status"
      className={clsx(
        'flex items-start gap-3 rounded-xl border px-4 py-3 text-sm',
        isError && 'border-red-400/35 bg-red-400/10 text-red-100',
        isSuccess && !isError && 'border-emerald-500/35 bg-emerald-500/10 text-emerald-100',
        !isError && !isSuccess && 'border-accent/25 bg-accent/5 text-text-muted'
      )}
    >
      {isError ? (
        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" aria-hidden />
      ) : isSuccess ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden />
      ) : null}
      <span>{message}</span>
    </div>
  );
};

export default AdminStatus;
