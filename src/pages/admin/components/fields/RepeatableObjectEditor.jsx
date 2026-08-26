import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, ImageIcon, UploadCloud } from 'lucide-react';
import { makeEditorRow } from '../../utils/editorUtils';

const RepeatableObjectEditor = ({ label, helper, value, onChange, createItem, fields, onUpload }) => {
  const normalizeItem = useCallback(
    (item) => {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        return item;
      }

      const base = createItem();
      if (typeof item === 'string') {
        if (Object.prototype.hasOwnProperty.call(base, 'name')) {
          return { ...base, name: item };
        }
        if (Object.prototype.hasOwnProperty.call(base, 'label')) {
          return { ...base, label: item };
        }
        if (Object.prototype.hasOwnProperty.call(base, 'url')) {
          return { ...base, url: item };
        }
        return { ...base, value: item };
      }

      return base;
    },
    [createItem]
  );

  const items = Array.isArray(value) ? value : [];
  const [rows, setRows] = useState(() => items.map((item) => makeEditorRow(normalizeItem(item))));

  useEffect(() => {
    const nextItems = Array.isArray(value) ? value : [];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRows((currentRows) => {
      const normalizedNextItems = nextItems.map((item) => normalizeItem(item));

      if (
        currentRows.length === normalizedNextItems.length &&
        currentRows.every((row, index) => JSON.stringify(row.value) === JSON.stringify(normalizedNextItems[index] ?? {}))
      ) {
        return currentRows;
      }

      if (currentRows.length === normalizedNextItems.length) {
        return currentRows.map((row, index) => ({
          ...row,
          value: normalizedNextItems[index] ?? {},
        }));
      }

      return normalizedNextItems.map((item, index) => ({
        id: currentRows[index]?.id ?? makeEditorRow().id,
        value: item ?? createItem(),
      }));
    });
  }, [value, normalizeItem, createItem]);

  const commitRows = (nextRows) => {
    setRows(nextRows);
    onChange(nextRows.map((row) => row.value));
  };

  const updateItem = (id, key, nextValue) => {
    commitRows(rows.map((item) => (item.id === id ? { ...item, value: { ...item.value, [key]: nextValue } } : item)));
  };

  const addItem = () => commitRows([...rows, makeEditorRow(createItem())]);
  const removeItem = (id) => commitRows(rows.filter((item) => item.id !== id));

  const inputClass =
    'w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20';

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
          Add card
        </button>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/30 px-4 py-6 text-center text-xs text-slate-500">
            No entries yet. Click &quot;Add card&quot; above to create one.
          </div>
        ) : (
          rows.map((item, index) => (
            <div key={item.id} className="rounded-xl border border-slate-800/90 bg-slate-900/50 p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-800/60 pb-2.5">
                <span className="text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-sky-400">
                  {label} #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="rounded-lg border border-red-500/20 bg-red-500/10 p-1.5 text-red-300 hover:bg-red-500/20 transition-colors"
                  aria-label={`Remove ${label} ${index + 1}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="grid gap-3.5 md:grid-cols-2">
                {fields.map((field) => (
                  <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={item.value?.[field.key] ?? ''}
                        onChange={(e) => updateItem(item.id, field.key, e.target.value)}
                        rows={3}
                        className={inputClass}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        value={item.value?.[field.key] ?? ''}
                        onChange={(e) => updateItem(item.id, field.key, e.target.value)}
                        className={inputClass}
                      >
                        <option value="" disabled className="bg-slate-900 text-slate-400">
                          Select {field.label.toLowerCase()}
                        </option>
                        {(field.options || []).map((option) => (
                          <option key={option} value={option} className="bg-slate-900 text-slate-100">
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'number' ? (
                      <input
                        type="number"
                        value={item.value?.[field.key] ?? ''}
                        onChange={(e) => updateItem(item.id, field.key, e.target.value)}
                        className={inputClass}
                      />
                    ) : field.type === 'image' || field.type === 'file' ? (
                      <div className="flex flex-col gap-2 min-w-0">
                        <div className="flex gap-2 min-w-0">
                          <input
                            type="text"
                            value={item.value?.[field.key] ?? ''}
                            onChange={(e) => updateItem(item.id, field.key, e.target.value)}
                            placeholder={field.type === 'image' ? "Enter image URL or upload" : "Enter file URL or upload"}
                            className={`${inputClass} flex-1`}
                          />
                          {onUpload && (
                            <button
                              type="button"
                              onClick={async () => {
                                const url = await onUpload(field.key, field.accept);
                                if (url) {
                                  updateItem(item.id, field.key, url);
                                }
                              }}
                              className="shrink-0 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-sky-400 hover:bg-sky-500/20 transition-colors"
                              aria-label={`Upload ${field.label}`}
                            >
                              {field.type === 'image' ? <ImageIcon size={15} /> : <UploadCloud size={15} />}
                            </button>
                          )}
                        </div>
                        {field.type === 'image' && item.value?.[field.key] && (
                          <div className="mt-1 w-full max-w-sm rounded-lg overflow-hidden border border-slate-800 bg-slate-950 p-1.5">
                            <img src={item.value[field.key]} alt="Preview" className="w-full h-auto max-h-36 object-contain rounded" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={item.value?.[field.key] ?? ''}
                        onChange={(e) => updateItem(item.id, field.key, e.target.value)}
                        className={inputClass}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RepeatableObjectEditor;

