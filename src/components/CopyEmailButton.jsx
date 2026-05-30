import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

const CopyEmailButton = ({ email, compact = false, className = '' }) => {
  const [copied, setCopied] = useState(false);
  const cleanEmail = String(email || '').trim();

  if (!cleanEmail) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cleanEmail);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.location.href = `mailto:${cleanEmail}`;
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={copied ? 'Email copied' : 'Copy email address'}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-primary ${className}`}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {compact ? (copied ? 'Copied' : 'Copy') : (copied ? 'Email copied' : cleanEmail)}
    </button>
  );
};

export default CopyEmailButton;
