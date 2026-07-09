import React from 'react';
import { Upload, ArrowLeft, Plus, Save } from 'lucide-react';

const SectionBanner = ({ icon, title, help, onAdd, onSave, onReset, onUpload, hidePrimarySave = false }) => {
  const SectionIcon = icon;
  return (
    <div className="flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl border border-accent/25 bg-accent/10 p-3.5 text-accent shadow-[0_0_24px_rgb(var(--color-accent-rgb)/0.12)]">
          <SectionIcon size={22} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-2xl font-bold tracking-tight text-text">{title}</h3>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-text-muted">{help}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        {onUpload && (
          <button
            type="button"
            onClick={onUpload}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-primary/40 px-4 py-2.5 text-sm font-medium text-text transition-colors hover:border-accent/35 hover:bg-primary/60"
          >
            <Upload size={16} />
            Upload
          </button>
        )}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-primary/40 px-4 py-2.5 text-sm font-medium text-text transition-colors hover:border-accent/35"
          >
            <ArrowLeft size={16} />
            Reset draft
          </button>
        )}
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/15 px-4 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/25"
          >
            <Plus size={16} />
            Add new
          </button>
        )}
        {!hidePrimarySave && (
          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-primary shadow-[0_4px_20px_rgb(var(--color-accent-rgb)/0.25)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Save size={16} />
            Save
          </button>
        )}
      </div>
    </div>
  );
};

export default SectionBanner;
