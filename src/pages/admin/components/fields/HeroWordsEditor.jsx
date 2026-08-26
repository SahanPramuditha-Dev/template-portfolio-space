import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { makeEditorRow } from '../../utils/editorUtils';

const HeroWordsEditor = ({ label, helper, placeholder, value, onChange }) => {
  const items = Array.isArray(value) ? value : [];
  const [rows, setRows] = useState(() => items.map((item) => makeEditorRow(item)));

  useEffect(() => {
    const nextItems = Array.isArray(value) ? value : [];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRows((currentRows) => {
      if (
        currentRows.length === nextItems.length &&
        currentRows.every((row, index) => row.value === (nextItems[index] ?? ''))
      ) {
        return currentRows;
      }

      if (currentRows.length === nextItems.length) {
        return currentRows.map((row, index) => ({
          ...row,
          value: nextItems[index] ?? '',
        }));
      }

      return nextItems.map((item, index) => ({
        id: currentRows[index]?.id ?? makeEditorRow().id,
        value: item ?? '',
      }));
    });
  }, [value]);

  const commitRows = (nextRows) => {
    setRows(nextRows);
    onChange(nextRows.map((row) => row.value));
  };

  const updateItem = (id, nextValue) => {
    commitRows(rows.map((item) => (item.id === id ? { ...item, value: nextValue } : item)));
  };

  const addItem = () => commitRows([...rows, makeEditorRow('')]);
  const removeItem = (id) => commitRows(rows.filter((item) => item.id !== id));

  return (
    <div className="rounded-2xl border border-sky-500/20 bg-slate-950/70 p-5 shadow-inner">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold uppercase tracking-[0.08em] text-slate-200">{label}</h4>
            <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-sky-400">
              {items.length} phrases
            </span>
          </div>
          {helper && <p className="mt-1 text-xs text-slate-400 leading-relaxed">{helper}</p>}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/15 px-3.5 py-1.5 text-xs font-bold text-sky-400 hover:bg-sky-500/25 transition-all shadow-sm"
        >
          <Plus size={13} strokeWidth={2.5} />
          Add phrase
        </button>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/30 px-4 py-5 text-center text-xs text-slate-500">
            Start with 3-5 short phrases. Keep them punchy and readable.
          </div>
        ) : (
          rows.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/60 p-2 sm:p-2.5"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-sky-500/20 bg-sky-500/10 font-mono text-[10px] font-bold text-sky-400">
                {String(index + 1).padStart(2, '0')}
              </span>
              <input
                type="text"
                value={item.value}
                onChange={(e) => updateItem(item.id, e.target.value)}
                placeholder={placeholder}
                className="min-w-0 flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
              />
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-300 hover:bg-red-500/20 transition-colors"
                aria-label={`Remove ${label} item ${index + 1}`}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HeroWordsEditor;

