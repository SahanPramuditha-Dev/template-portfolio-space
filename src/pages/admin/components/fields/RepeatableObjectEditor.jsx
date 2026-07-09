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
    // Keep the local row IDs stable when the source array changes externally.
    // This is intentional state syncing for a controlled editor, not an effect side-effect.
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
            No entries yet. Add the first card.
          </div>
        ) : (
          rows.map((item, index) => (
            <div key={item.id} className="rounded-2xl border border-secondary/40 bg-secondary/10 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-mono uppercase tracking-[0.18em] text-text-muted">{label} {index + 1}</p>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="rounded-full border border-red-400/20 bg-red-400/10 p-2 text-red-300"
                  aria-label={`Remove ${label} ${index + 1}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {fields.map((field) => (
                  <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                    <label className="mb-2 block text-sm font-semibold text-text">{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={item.value?.[field.key] ?? ''}
                        onChange={(e) => updateItem(item.id, field.key, e.target.value)}
                        rows={4}
                        className="w-full rounded-xl border border-secondary/50 bg-primary/50 px-4 py-3 text-text outline-none transition-colors focus:border-accent"
                      />
                    ) : field.type === 'select' ? (
                      <select
                        value={item.value?.[field.key] ?? ''}
                        onChange={(e) => updateItem(item.id, field.key, e.target.value)}
                        className="w-full rounded-xl border border-secondary/50 bg-primary/50 px-4 py-3 text-text outline-none transition-colors focus:border-accent"
                      >
                        <option value="" disabled className="bg-secondary text-text">
                          Select {field.label.toLowerCase()}
                        </option>
                        {(field.options || []).map((option) => (
                          <option key={option} value={option} className="bg-secondary text-text">
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'number' ? (
                      <input
                        type="number"
                        value={item.value?.[field.key] ?? ''}
                        onChange={(e) => updateItem(item.id, field.key, e.target.value)}
                        className="w-full rounded-xl border border-secondary/50 bg-primary/50 px-4 py-3 text-text outline-none transition-colors focus:border-accent"
                      />
                    ) : field.type === 'image' || field.type === 'file' ? (
                      <div className="flex flex-col gap-2 min-w-0">
                        <div className="flex gap-2 min-w-0">
                          <input
                            type="text"
                            value={item.value?.[field.key] ?? ''}
                            onChange={(e) => updateItem(item.id, field.key, e.target.value)}
                            placeholder={field.type === 'image' ? "Enter image URL or upload file" : "Enter file URL or upload file"}
                            className="flex-1 min-w-0 rounded-xl border border-secondary/50 bg-primary/50 px-4 py-3 text-text outline-none transition-colors focus:border-accent"
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
                              className="shrink-0 relative z-10 rounded-xl border border-accent/30 bg-accent/10 px-3 py-3 text-accent"
                              aria-label={`Upload ${field.label}`}
                            >
                              {field.type === 'image' ? <ImageIcon size={16} /> : <UploadCloud size={16} />}
                            </button>
                          )}
                        </div>
                        {field.type === 'image' && item.value?.[field.key] && (
                          <div className="mt-1 w-full max-w-sm rounded-lg overflow-hidden border border-white/10 bg-black/20">
                            <img src={item.value[field.key]} alt="Preview" className="w-full h-auto max-h-48 object-contain" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={item.value?.[field.key] ?? ''}
                        onChange={(e) => updateItem(item.id, field.key, e.target.value)}
                        className="w-full rounded-xl border border-secondary/50 bg-primary/50 px-4 py-3 text-text outline-none transition-colors focus:border-accent"
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
