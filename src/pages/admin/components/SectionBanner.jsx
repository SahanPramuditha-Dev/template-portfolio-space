import React from 'react';
import { Upload, RotateCcw, Plus, Save } from 'lucide-react';

const SectionBanner = ({ icon: SectionIcon, title, help, onAdd, onSave, onReset, onUpload, hidePrimarySave = false }) => {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-4">
        {SectionIcon && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-500/20 bg-sky-500/10 text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.12)]">
            <SectionIcon size={22} strokeWidth={2} />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">{title}</h3>
          {help && <p className="mt-1 max-w-3xl text-xs sm:text-sm leading-relaxed text-slate-400">{help}</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2.5 lg:justify-end shrink-0">
        {onUpload && (
          <button
            type="button"
            onClick={onUpload}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/60 px-3.5 py-2 text-xs font-semibold text-slate-200 transition-all hover:border-slate-600 hover:bg-slate-800 hover:text-white"
          >
            <Upload size={14} />
            Upload
          </button>
        )}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/60 px-3.5 py-2 text-xs font-semibold text-slate-300 transition-all hover:border-slate-600 hover:bg-slate-800 hover:text-white"
          >
            <RotateCcw size={14} />
            Reset draft
          </button>
        )}
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-xs font-bold text-sky-400 transition-all hover:bg-sky-500/20 hover:border-sky-500/50"
          >
            <Plus size={14} strokeWidth={2.5} />
            Add new
          </button>
        )}
        {!hidePrimarySave && onSave && (
          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2 text-xs font-bold text-slate-950 shadow-[0_4px_16px_rgba(56,189,248,0.25)] transition-all hover:bg-sky-400 hover:shadow-[0_4px_24px_rgba(56,189,248,0.35)] active:scale-[0.98]"
          >
            <Save size={14} />
            Save changes
          </button>
        )}
      </div>
    </div>
  );
};

export default SectionBanner;

