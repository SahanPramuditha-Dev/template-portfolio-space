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
    <div className="space-y-3 rounded-2xl border border-secondary/40 bg-primary/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-text">{label}</h4>
          <p className="text-xs text-text-muted">{helper}</p>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/10 px-3 py-2 text-xs font-semibold text-accent"
        >
          <Plus size={14} />
          Add
        </button>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-secondary/50 bg-secondary/10 px-4 py-6 text-sm text-text-muted">
            No items yet. Add the first entry.
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
                  // small timeout to allow click on suggestion
                  setTimeout(() => setActiveSuggestId(null), 150);
                }}
                placeholder={placeholder}
                className="w-full rounded-xl border border-secondary/50 bg-secondary/20 px-4 py-3 text-text outline-none transition-colors focus:border-accent"
              />
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 text-red-300"
                aria-label={`Remove ${label} item ${index + 1}`}
              >
                <Trash2 size={16} />
              </button>

              {activeSuggestId === item.id && (
                <div className="absolute left-0 top-full z-30 mt-2 w-full max-h-44 overflow-auto rounded-lg border border-white/10 bg-primary/95 shadow-lg">
                  {Array.isArray(suggestions) && suggestions.length > 0 && (
                    <div>
                          {suggestions
                            .filter((s) => s.toLowerCase().includes((filterText || '').toLowerCase()))
                            .slice(0, 50)
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
                                  className={`w-full flex items-center justify-between text-left px-3 py-2 text-sm transition-colors ${
                                    alreadyUsed
                                      ? 'text-text-muted opacity-60 cursor-not-allowed'
                                      : 'text-text-muted hover:bg-accent/10'
                                  }`}
                                >
                                  <span className={`${isCurrent ? 'font-semibold text-text' : ''}`}>{s}</span>
                                  {isCurrent && <CheckCircle2 size={14} className="text-accent" />}
                                </button>
                              );
                            })}
                    </div>
                  )}

                  {onAddSuggestion && (filterText || '').trim() !== '' && !(Array.isArray(suggestions) && suggestions.some((s) => s.toLowerCase() === (filterText || '').toLowerCase())) && (
                    <div className="border-t border-white/5">
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
                        className="w-full text-left px-3 py-2 text-sm font-medium text-accent hover:bg-accent/5"
                      >
                        Add “{filterText}” to dropdown
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
