import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { makeEditorRow } from '../../utils/editorUtils';

const RepeatableTextEditor = ({ label, helper, placeholder, value, onChange, suggestions = [], onAddSuggestion }) => {
  const items = Array.isArray(value) ? value : [];
  const [rows, setRows] = useState(() => items.map((item) => makeEditorRow(item)));
  const [activeSuggestId, setActiveSuggestId] = useState(null);
  const [filterText, setFilterText] = useState('');
  const currentValuesLower = useMemo(
    () => new Set(rows.map((r) => String(r.value || '').trim().toLowerCase()).filter(Boolean)),
    [rows]
  );

  useEffect(() => {
    const nextItems = Array.isArray(value) ? value : [];
    // Keep the local row IDs stable when the source array changes externally.
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
    <div className="space-y-3 rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 sm:p-5 shadow-inner">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.08em] text-slate-300">{label}</h4>
          {helper && <p className="text-[11px] text-slate-500 mt-0.5">{helper}</p>}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-400 hover:bg-sky-500/20 transition-all shrink-0"
        >
          <Plus size={13} strokeWidth={2.5} />
          Add item
        </button>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/30 px-4 py-5 text-center text-xs text-slate-500">
            No items yet. Click &quot;Add item&quot; above to create one.
          </div>
        ) : (
          rows.map((item, index) => (
            <div key={item.id} className="relative flex gap-2">
              <input
                type="text"
                value={item.value}
                onChange={(e) => {
                  updateItem(item.id, e.target.value);
                  setFilterText(e.target.value);
                  setActiveSuggestId(item.id);
                }}
                onFocus={() => {
                  setFilterText(item.value || '');
                  setActiveSuggestId(item.id);
                }}
                onBlur={() => {
                  setTimeout(() => setActiveSuggestId(null), 150);
                }}
                placeholder={placeholder}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
              />
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 text-red-300 hover:bg-red-500/20 transition-colors shrink-0"
                aria-label={`Remove ${label} item ${index + 1}`}
              >
                <Trash2 size={14} />
              </button>

              {activeSuggestId === item.id && (
                <div className="absolute left-0 top-full z-30 mt-1.5 w-full max-h-48 overflow-auto rounded-xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/50 [scrollbar-width:thin]">
                  {Array.isArray(suggestions) && suggestions.length > 0 && (
                    <div className="p-1">
                      {suggestions
                        .filter((s) => s.toLowerCase().includes((filterText || '').toLowerCase()))
                        .slice(0, 40)
                        .map((s) => {
                          const sLower = String(s).toLowerCase();
                          const alreadyUsed = currentValuesLower.has(sLower) && sLower !== String(item.value || '').toLowerCase();
                          const isCurrent = sLower === String(item.value || '').toLowerCase();
                          return (
                            <button
                              key={s}
                              type="button"
                              onMouseDown={(e) => {
                                if (alreadyUsed) return;
                                e.preventDefault();
                                updateItem(item.id, s);
                                setActiveSuggestId(null);
                              }}
                              disabled={alreadyUsed}
                              className={`w-full flex items-center justify-between text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                                alreadyUsed
                                  ? 'text-slate-600 opacity-50 cursor-not-allowed'
                                  : 'text-slate-300 hover:bg-sky-500/15 hover:text-sky-300'
                              }`}
                            >
                              <span className={isCurrent ? 'font-bold text-sky-400' : ''}>{s}</span>
                              {isCurrent && <CheckCircle2 size={13} className="text-sky-400" />}
                            </button>
                          );
                        })}
                    </div>
                  )}

                  {onAddSuggestion && (filterText || '').trim() !== '' && !(Array.isArray(suggestions) && suggestions.some((s) => s.toLowerCase() === (filterText || '').toLowerCase())) && (
                    <div className="border-t border-slate-800 p-1">
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const v = (filterText || '').trim();
                          if (!v) return;
                          updateItem(item.id, v);
                          onAddSuggestion(v);
                          setActiveSuggestId(null);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-sky-400 hover:bg-sky-500/10"
                      >
                        + Add &ldquo;{filterText}&rdquo; to suggestions
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RepeatableTextEditor;

