import React, { useState, useEffect, useMemo } from 'react';
import { Save, Search } from 'lucide-react';
import { useCmsDoc, saveCmsDoc, uploadCmsAsset } from '../../../lib/cms';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import AdminStatus from './AdminStatus';
import SectionBanner from './SectionBanner';
import FieldGroups from './FieldGroups';
import DraftPreview from './DraftPreview';
import FieldEditor from './fields/FieldEditor';
import SortableCollectionItem from './SortableCollectionItem';
import { requestImageCrop } from './CropModalRoot';
import { collectMediaValidationErrors, getCmsErrorMessage } from '../utils/adminConstants';

const toFormValue = (field, value) => {
  if (field.type === 'list') {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      const raw = value.trim();
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return raw
          .split('\n')
          .map((entry) => entry.trim())
          .filter(Boolean);
      }
    }
    return [];
  }
  if (field.type === 'object-list') {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      const raw = value.trim();
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return [];
      }
    }
    return [];
  }
  if (field.type === 'csv') {
    return Array.isArray(value) ? value.join(', ') : (value || '');
  }
  if (field.type === 'json') {
    if (typeof value === 'string') return value;
    return JSON.stringify(value ?? [], null, 2);
  }
  if (field.type === 'checkbox') return Boolean(value);
  if (field.type === 'number') return value ?? 0;
  return value ?? '';
};

const fromFormValue = (field, value) => {
  if (field.type === 'list') {
    if (Array.isArray(value)) {
      return value.map((entry) => String(entry ?? '').trim()).filter(Boolean);
    }
    return String(value || '')
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  if (field.type === 'object-list') {
    const arr = Array.isArray(value) ? value : [];
    if (field.key === 'screenshots') {
      return arr
        .map((row) => ({
          url: String(row?.url ?? '').trim(),
          caption: String(row?.caption ?? '').trim(),
          alt: String(row?.alt ?? '').trim(),
          group: String(row?.group ?? '').trim(),
        }))
        .filter((row) => row.url);
    }
    return arr;
  }
  if (field.type === 'csv') {
    return String(value || '')
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  if (field.type === 'json') {
    const raw = String(value || '').trim();
    if (!raw) return [];
    return JSON.parse(raw);
  }
  if (field.type === 'checkbox') return Boolean(value);
  if (field.type === 'number') return Number(value || 0);
  return value;
};

const formFromItem = (item, fields, initialItem = {}) => {
  const next = {};
  fields.forEach((field) => {
    const raw = item?.[field.key] ?? initialItem[field.key];
    next[field.key] = toFormValue(field, raw);
  });
  return next;
};

const itemFromForm = (draft, fields) => {
  const next = {};
  fields.forEach((field) => {
    next[field.key] = fromFormValue(field, draft[field.key]);
  });
  return next;
};

const CollectionEditor = ({ docId, section, fields, collectionKey = 'items' }) => {
  const { data, loading } = useCmsDoc(docId, { [collectionKey]: [] });
  const [items, setItems] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [draft, setDraft] = useState(null);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [listQuery, setListQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedIndices, setSelectedIndices] = useState(new Set());

  useEffect(() => {
    if (data === undefined) return;
    const nextItems = Array.isArray(data?.[collectionKey]) ? data[collectionKey] : [];
    setItems(nextItems);
    if (selectedIndex === -1) {
      setDraft(formFromItem(section.initialItem, fields, section.initialItem));
    } else if (selectedIndex === null && nextItems.length > 0) {
      setSelectedIndex(0);
      setDraft(formFromItem(nextItems[0], fields, section.initialItem));
    } else if (selectedIndex !== null && nextItems[selectedIndex]) {
      setDraft(formFromItem(nextItems[selectedIndex], fields, section.initialItem));
    } else if (nextItems.length === 0) {
      setSelectedIndex(-1);
      setDraft(formFromItem(section.initialItem, fields, section.initialItem));
    }
  }, [data, collectionKey, fields, section.initialItem, selectedIndex]);

  const createNew = () => {
    setSelectedIndex(-1);
    setDraft(formFromItem(section.initialItem, fields, section.initialItem));
    setStatus('New draft ready.');
  };

  const editItem = (index) => {
    setSelectedIndex(index);
    setDraft(formFromItem(items[index], fields, section.initialItem));
  };

  const removeItem = async (index) => {
    const nextItems = items.filter((_, i) => i !== index);
    setItems(nextItems);
    setSelectedIndex(nextItems.length === 0 ? -1 : Math.min(index, nextItems.length - 1));
    setDraft(
      nextItems.length === 0
        ? formFromItem(section.initialItem, fields, section.initialItem)
        : formFromItem(nextItems[Math.min(index, nextItems.length - 1)], fields, section.initialItem)
    );
    await saveCmsDoc(docId, { [collectionKey]: nextItems });
    setStatus('Item deleted.');
  };

  const updateField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const uploadAsset = async (key, accept) => {
    const resolvedAccept = accept || (key === 'pdfUrl' ? 'application/pdf,.pdf' : 'image/*,.gif,.mp4,.webm');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = resolvedAccept;
    input.onchange = async () => {
      let file = input.files?.[0];
      if (!file) return;
      if (file.type.startsWith('image/') && file.type !== 'image/gif') {
        try {
          const field = fields.find((f) => f.key === key);
          const isCertificateImage = section.uploadFolder === 'certificates' && key === 'image';
          const aspect = 'aspect' in (field || {})
            ? field.aspect
            : isCertificateImage
              ? null
              : (key === 'thumbnail' || key === 'image' ? 16/9 : null);
          file = await requestImageCrop(file, aspect);

          // Disable forced resize for certificate image uploads to preserve the full certificate aspect ratio.
          const shouldResize = !isCertificateImage && (['thumbnail', 'architectureImage', 'image'].includes(key) || key.startsWith('screenshot') || key === 'heroArtworkUrl');
          if (shouldResize && file instanceof Blob && file.type.startsWith('image/')) {
            try {
              file = await resizeImageTo(file, 1920, 1080);
            } catch (err) {
              // ignore resize errors and continue with original blob
              console.warn('Image resize failed, uploading original', err);
            }
          }
        } catch {
          return;
        }
      }
      setBusy(true);
      try {
        const url = await uploadCmsAsset(file, `${section.uploadFolder || 'uploads'}/${docId}`);
        updateField(key, url);
        setStatus(file.type === 'application/pdf' ? 'PDF uploaded.' : 'Media uploaded.');
      } finally {
        setBusy(false);
      }
    };
    input.click();
  };

  // Helper: resize an image Blob to target width x height (JPEG output)
  const resizeImageTo = (blob, targetW, targetH) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          // Fill with transparent or dark background for non-JPEG
          ctx.fillStyle = 'rgba(0,0,0,0)';
          ctx.fillRect(0, 0, targetW, targetH);
          // Compute cover fit
          const iw = img.naturalWidth;
          const ih = img.naturalHeight;
          const srcRatio = iw / ih;
          const tgtRatio = targetW / targetH;
          let sx = 0, sy = 0, sw = iw, sh = ih;
          if (srcRatio > tgtRatio) {
            // source is wider — crop sides
            sw = ih * tgtRatio;
            sx = (iw - sw) / 2;
          } else {
            // source is taller — crop top/bottom
            sh = iw / tgtRatio;
            sy = (ih - sh) / 2;
          }
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
          canvas.toBlob((outBlob) => {
            if (!outBlob) return reject(new Error('Canvas toBlob failed'));
            const file = new File([outBlob], `resized-${Date.now()}.jpg`, { type: 'image/jpeg' });
            resolve(file);
          }, 'image/jpeg', 0.9);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = URL.createObjectURL(blob);
    });
  };

  const saveItem = async () => {
    if (!draft) return;
    setBusy(true);
    try {
      const normalized = itemFromForm(draft, fields);
      const validationErrors = collectMediaValidationErrors(normalized, fields);
      if (validationErrors.length > 0) {
        setStatus(`Please fix media before publishing: ${validationErrors.slice(0, 3).join(' ')}`);
        return;
      }
      const nextItems =
        selectedIndex === -1
          ? [normalized, ...items]
          : items.map((item, index) => (index === selectedIndex ? normalized : item));
      setItems(nextItems);
      await saveCmsDoc(docId, { [collectionKey]: nextItems });
      setSelectedIndex(selectedIndex === -1 ? 0 : selectedIndex);
      setStatus('Changes saved.');
    } catch (error) {
      setStatus(getCmsErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const uploadButtons = useMemo(() => {
    return fields
      .filter((field) => field.type === 'image' || field.type === 'pdf')
      .map((field) => ({
        key: field.key,
        accept: field.type === 'pdf' ? 'application/pdf,.pdf' : 'image/*,.gif,.mp4,.webm',
      }));
  }, [fields]);

  const listEntries = useMemo(() => {
    const q = listQuery.trim().toLowerCase();
    return items
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => {
        if (!q) return true;
        const primary = String(item.title || item.name || item.url || item.slug || '').toLowerCase();
        const secondary = String(item.category || item.issuer || item.type || item.organization || '').toLowerCase();
        return primary.includes(q) || secondary.includes(q);
      });
  }, [items, listQuery]);

  const totalPages = Math.ceil(listEntries.length / itemsPerPage);
  const paginatedEntries = useMemo(() => {
    return listEntries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [listEntries, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [listQuery]);

  const toggleSelection = (index) => {
    const newSet = new Set(selectedIndices);
    if (newSet.has(index)) newSet.delete(index);
    else newSet.add(index);
    setSelectedIndices(newSet);
  };

  const removeMultipleItems = async () => {
    if (selectedIndices.size === 0) return;
    if (!window.confirm(`Delete ${selectedIndices.size} selected items?`)) return;
    setBusy(true);
    try {
      const indicesToRemove = Array.from(selectedIndices);
      const nextItems = items.filter((_, i) => !indicesToRemove.includes(i));
      setItems(nextItems);
      setSelectedIndices(new Set());
      setSelectedIndex(-1);
      setDraft(formFromItem(section.initialItem, fields, section.initialItem));
      await saveCmsDoc(docId, { [collectionKey]: nextItems });
      setStatus(`${indicesToRemove.length} items deleted.`);
    } catch (error) {
      setStatus(getCmsErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id, 10);
      const newIndex = parseInt(over.id, 10);
      
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      
      // Keep selection logically attached to the same item if possible
      if (selectedIndex === oldIndex) {
        setSelectedIndex(newIndex);
      } else if (selectedIndex === newIndex) {
        setSelectedIndex(oldIndex);
      }
      
      setBusy(true);
      try {
        await saveCmsDoc(docId, { [collectionKey]: newItems });
        setStatus('Order saved.');
      } catch {
        setStatus('Failed to save order.');
      } finally {
        setBusy(false);
      }
    }
  };

  if (loading || !draft) {
    return (
      <div className="rounded-3xl border border-white/10 bg-secondary/20 p-6 text-text-muted">
        Loading {section.title.toLowerCase()}...
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-secondary/25 p-4 sm:p-6 lg:p-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-md">
      <SectionBanner
        icon={section.icon}
        title={section.title}
        help={section.help}
        onAdd={createNew}
        onSave={saveItem}
        onReset={() => setDraft(formFromItem(section.initialItem, fields, section.initialItem))}
        onUpload={
          uploadButtons.length
            ? () => uploadAsset(uploadButtons[0].key, uploadButtons[0].accept)
            : null
        }
      />
      <AdminStatus message={status} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)] items-start">
        <div className="flex flex-col xl:sticky xl:top-24 xl:h-[calc(100vh-8rem)] rounded-3xl border border-white/5 bg-primary/10 p-4 shadow-inner">
          <div className="rounded-2xl border border-white/10 bg-primary/30 p-2 shrink-0 mb-4">
            <label className="sr-only" htmlFor={`list-search-${docId}`}>
              Filter {section.title} list
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-primary/50 px-3 py-2">
              <Search size={16} className="shrink-0 text-text-muted" aria-hidden />
              <input
                id={`list-search-${docId}`}
                type="search"
                value={listQuery}
                onChange={(e) => setListQuery(e.target.value)}
                placeholder="Filter list…"
                className="min-w-0 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 pb-4">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-primary/25 p-6 text-center text-sm text-text-muted">
              No items yet. Use <span className="text-accent">Add new</span> above to create the first entry.
            </div>
          ) : listEntries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-primary/25 p-6 text-center text-sm text-text-muted">
              No items match your filter. Clear the search box to see all entries.
            </div>
          ) : (
            <>
              {selectedIndices.size > 0 && (
                <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-red-400/10 border border-red-400/20">
                  <span className="text-sm font-medium text-red-300">{selectedIndices.size} selected</span>
                  <button
                    onClick={removeMultipleItems}
                    disabled={busy}
                    className="px-3 py-1.5 text-xs font-bold bg-red-500/20 text-red-200 hover:bg-red-500/30 rounded-lg transition-colors"
                  >
                    Delete Selected
                  </button>
                </div>
              )}
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={paginatedEntries.map(e => e.index.toString())}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="space-y-2">
                    {paginatedEntries.map(({ item, index }) => (
                      <SortableCollectionItem
                        key={index.toString()}
                        id={index.toString()}
                        index={index}
                        item={item}
                        selectedIndex={selectedIndex}
                        editItem={editItem}
                        removeItem={removeItem}
                        sectionTitle={section.title}
                        isSelected={selectedIndices.has(index)}
                        toggleSelection={toggleSelection}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
              
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 border-t border-white/10 pt-4">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-text disabled:opacity-50 hover:bg-white/5 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-text-muted">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-text disabled:opacity-50 hover:bg-white/5 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-white/10 bg-primary/30 p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
            <p className="mb-4 text-xs font-mono uppercase tracking-[0.14em] text-text-muted">Edit selected item</p>
            <p className="mb-5 text-xs text-text-muted">
              Expand a group to edit fields. Nested image uploads use your Storage folder for this section.
            </p>
            <FieldGroups
              fields={fields}
              renderField={(field) => (
                <FieldEditor
                  key={field.key}
                  field={field}
                  value={draft[field.key]}
                  onChange={(value) => updateField(field.key, value)}
                  draft={draft}
                  onChangeDraft={updateField}
                  section={section}
                  docId={docId}
                  onUpload={
                    field.type === 'image' || field.type === 'file' || field.type === 'pdf'
                      ? () => uploadAsset(field.key, field.accept)
                      : undefined
                  }
                />
              )}
            />
          </div>

          <DraftPreview draft={draft} fields={fields} title={section.title} />

          <div className="sticky bottom-2 z-10 rounded-2xl border border-white/10 bg-primary/90 px-4 py-3 backdrop-blur-md sm:bottom-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] text-text-muted">Save applies the full item, including collapsed groups.</p>
              <button
                type="button"
                onClick={saveItem}
                disabled={busy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-primary shadow-[0_4px_20px_rgb(var(--color-accent-rgb)/0.2)] transition-transform hover:scale-[1.01] disabled:opacity-60 sm:w-auto"
              >
                <Save size={16} />
                {busy ? 'Saving…' : 'Save item'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionEditor;
