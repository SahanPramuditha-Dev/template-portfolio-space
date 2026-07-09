import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { makeEditorRow } from '../../utils/editorUtils';

const HeroWordsEditor = ({ label, helper, placeholder, value, onChange }) => {
  const items = Array.isArray(value) ? value : [];
  const [rows, setRows] = useState(() => items.map((item) => makeEditorRow(item)));

  useEffect(() => {
    const nextItems = Array.isArray(value) ? value : [];
    // Keep the local row IDs stable when the source array changes externally.
    // This is intentional state syncing for a controlled editor, not an effect side-effect.
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
    <div className="rounded-3xl border border-accent/20 bg-[radial-gradient(circle_at_top_left,rgb(var(--color-accent-rgb)/0.12),transparent_42%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(15,23,42,0.78))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-text">{label}</h4>
            <span className="rounded-full border border-accent/20 bg-accent/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.16em] text-accent">
              {items.length} items
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-text-muted">{helper}</p>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-accent/90"
        >
          <Plus size={14} />
          Add phrase
        </button>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-secondary/50 bg-secondary/10 px-4 py-6 text-sm text-text-muted">
            Start with 3-5 short phrases. Keep them punchy and readable.
          </div>
        ) : (
          rows.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-secondary/15 px-3 py-3"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-accent/10 font-mono text-[11px] uppercase tracking-[0.12em] text-accent">
                {String(index + 1).padStart(2, '0')}
              </span>
              <input
                type="text"
                value={item.value}
                onChange={(e) => updateItem(item.id, e.target.value)}
                placeholder={placeholder}
                className="min-w-0 flex-1 rounded-xl border border-secondary/50 bg-primary/50 px-4 py-3 text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent"
              />
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="rounded-full border border-red-400/20 bg-red-400/10 p-2 text-red-300 transition-colors hover:bg-red-400/20"
                aria-label={`Remove ${label} item ${index + 1}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HeroWordsEditor;
