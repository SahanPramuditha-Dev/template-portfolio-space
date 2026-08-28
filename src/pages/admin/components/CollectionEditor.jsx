import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Save, Search, RefreshCw, Github } from 'lucide-react';
import { CMS_DOCS, useCmsDoc, useCmsCollection, saveCmsDoc, saveCmsItem, softRemoveCmsItem, softRemoveMultipleCmsItems, bulkUpdateCmsItems, getCmsRevisions, reorderCmsCollection, uploadCmsAsset } from '../../../lib/cms';
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
import { slugify } from '../../../utils/slugify';

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
  const { data, loading, error } = useCmsCollection(docId, []);
  const { data: siteDoc } = useCmsDoc(CMS_DOCS.site, null);
  const [items, setItems] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [draft, setDraft] = useState(() => formFromItem(section.initialItem, fields, section.initialItem));
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [syncBusy, setSyncBusy] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const autoSaveTimeoutRef = useRef(null);
  const isDirtyRef = useRef(false);
  const lastSavedDraftJsonRef = useRef('');
  const [revisions, setRevisions] = useState([]);
  const [loadingRevisions, setLoadingRevisions] = useState(false);
  const [listQuery, setListQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (error) {
      setStatus(getCmsErrorMessage(error));
    }
  }, [error]);

  const syncGithubCache = async () => {
    const githubUsername = siteDoc?.githubUsername || 'SahanPramuditha-Dev';
    if (!githubUsername) {
      setStatus('Error: Configure your GitHub username in Website Content first.');
      return;
    }
    setSyncBusy(true);
    setStatus('Syncing with GitHub API...');
    try {
      const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?per_page=100&sort=updated`);
      if (!response.ok) throw new Error(`GitHub API returned status ${response.status}`);
      const data = await response.json();
      
      // Store in firebase under openSource document
      await saveCmsDoc(CMS_DOCS.openSource, {
        githubReposCache: data,
        githubReposCacheTime: Date.now()
      });
      setStatus('GitHub repository cache synced successfully!');
    } catch (err) {
      console.error(err);
      setStatus(`Failed to sync GitHub cache: ${err.message}`);
    } finally {
      setSyncBusy(false);
    }
  };
  const [selectedIndices, setSelectedIndices] = useState(new Set());

  useEffect(() => {
    if (data === undefined) return;
    const nextItems = Array.isArray(data) ? data : [];
    setItems(nextItems);
    if (selectedIndex === -1) {
      const newDraft = formFromItem(section.initialItem, fields, section.initialItem);
      setDraft(newDraft);
      lastSavedDraftJsonRef.current = JSON.stringify(newDraft);
      isDirtyRef.current = false;
    } else if (selectedIndex === null && nextItems.length > 0) {
      setSelectedIndex(0);
      const newDraft = formFromItem(nextItems[0], fields, section.initialItem);
      setDraft(newDraft);
      lastSavedDraftJsonRef.current = JSON.stringify(newDraft);
      isDirtyRef.current = false;
    } else if (selectedIndex !== null && nextItems[selectedIndex]) {
      // If user is currently editing (isDirty), don't overwrite their local changes with background snapshot
      if (!isDirtyRef.current) {
        const newDraft = formFromItem(nextItems[selectedIndex], fields, section.initialItem);
        setDraft(newDraft);
        lastSavedDraftJsonRef.current = JSON.stringify(newDraft);
      }
    } else if (nextItems.length === 0) {
      setSelectedIndex(-1);
      const newDraft = formFromItem(section.initialItem, fields, section.initialItem);
      setDraft(newDraft);
      lastSavedDraftJsonRef.current = JSON.stringify(newDraft);
      isDirtyRef.current = false;
    }
  }, [data, collectionKey, fields, section.initialItem, selectedIndex]);


  const loadRevisions = async (index) => {
    if (index === -1 || !items[index]?.id) {
      setRevisions([]);
      return;
    }
    setLoadingRevisions(true);
    try {
      const revs = await getCmsRevisions(docId, items[index].id);
      setRevisions(revs);
    } catch (err) {
      console.error("Failed to load revisions", err);
    } finally {
      setLoadingRevisions(false);
    }
  };

  const createNew = () => {
    setSelectedIndex(-1);
    const newDraft = formFromItem(section.initialItem, fields, section.initialItem);
    setDraft(newDraft);
    lastSavedDraftJsonRef.current = JSON.stringify(newDraft);
    isDirtyRef.current = false;
    setAutoSaveStatus('');
    setRevisions([]);
    setStatus('New draft ready.');
  };

  const editItem = (index) => {
    setSelectedIndex(index);
    const newDraft = formFromItem(items[index], fields, section.initialItem);
    setDraft(newDraft);
    lastSavedDraftJsonRef.current = JSON.stringify(newDraft);
    isDirtyRef.current = false;
    setAutoSaveStatus('');
    loadRevisions(index);
  };

  const removeItem = async (index) => {
    const itemToRemove = items[index];
    const nextItems = items.filter((_, i) => i !== index);
    setItems(nextItems);
    const newIndex = nextItems.length === 0 ? -1 : Math.min(index, nextItems.length - 1);
    setSelectedIndex(newIndex);
    const newDraft = nextItems.length === 0
      ? formFromItem(section.initialItem, fields, section.initialItem)
      : formFromItem(nextItems[newIndex], fields, section.initialItem);
    setDraft(newDraft);
    lastSavedDraftJsonRef.current = JSON.stringify(newDraft);
    isDirtyRef.current = false;
    setAutoSaveStatus('');
    if (itemToRemove && itemToRemove.id) {
        await softRemoveCmsItem(docId, itemToRemove.id);
    }
    setStatus('Item deleted.');
  };

  const updateField = (key, value) => {
    isDirtyRef.current = true;
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (!isDirtyRef.current || !draft || selectedIndex === -1) return;
    if (JSON.stringify(draft) === lastSavedDraftJsonRef.current) return;
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    setAutoSaveStatus('Drafting...');
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveItem(true);
    }, 2500);
    
    return () => clearTimeout(autoSaveTimeoutRef.current);
  }, [draft]);


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
          const isBadgeImage = (section.uploadFolder === 'badges' || docId === CMS_DOCS.badges) && key === 'image';
          const aspect = 'aspect' in (field || {})
            ? field.aspect
            : (isCertificateImage || isBadgeImage)
              ? null
              : (key === 'thumbnail' || key === 'image' ? 16/9 : null);
          file = await requestImageCrop(file, aspect);

          // Only resize large landscape thumbnails, never badges or certificate sheets
          const shouldResize = !isCertificateImage && !isBadgeImage && (['thumbnail', 'architectureImage'].includes(key) || key.startsWith('screenshot') || key === 'heroArtworkUrl');
          if (shouldResize && file instanceof Blob && file.type.startsWith('image/')) {
            try {
              file = await resizeImageTo(file, 1920, 1080);
            } catch (err) {
              console.warn('Image resize failed, uploading original', err);
            }
          }
        } catch {
          return;
        }
      }
      setBusy(true);
      try {
        const targetFolder = section.uploadFolder || docId || 'uploads';
        const url = await uploadCmsAsset(file, targetFolder);
        updateField(key, url);
        setStatus(file.type === 'application/pdf' ? 'PDF uploaded successfully.' : 'Media uploaded successfully.');
      } catch (err) {
        console.error('Upload asset error:', err);
        setStatus(`Upload failed: ${err.message || 'Storage permission denied'}`);
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

  const saveItem = async (silent = false) => {
    if (!draft) return;
    if (!silent) setBusy(true);
    if (silent) setAutoSaveStatus('Saving...');
    try {
      const normalized = itemFromForm(draft, fields);
      if (docId === CMS_DOCS.projects) {
        normalized.slug = slugify(normalized.slug || normalized.title);
        const duplicate = items.some((item, index) => index !== selectedIndex && slugify(item.slug || item.title || item.id) === normalized.slug);
        if (duplicate) {
          if (!silent) setStatus('Please use a unique project URL slug.');
          if (silent) setAutoSaveStatus('Validation failed');
          return;
        }
      }
      const validationErrors = collectMediaValidationErrors(normalized, fields);
      if (validationErrors.length > 0) {
        if (!silent) setStatus(`Please fix media before publishing: ${validationErrors.slice(0, 3).join(' ')}`);
        if (silent) setAutoSaveStatus('Validation failed');
        return;
      }
      
      const itemId = (selectedIndex === -1 || !items[selectedIndex]?.id) 
        ? `${docId}-${Date.now()}` 
        : items[selectedIndex].id;
      
      const itemToSave = { ...normalized, id: itemId };
      itemToSave.order = selectedIndex === -1 ? 0 : (items[selectedIndex]?.order ?? 0);
      itemToSave.status = itemToSave.status || draft?.status || 'Published';
      
      const nextItems =
        selectedIndex === -1
          ? [itemToSave, ...items]
          : items.map((item, index) => (index === selectedIndex ? itemToSave : item));
      
      await saveCmsItem(docId, itemId, itemToSave);
      isDirtyRef.current = false;
      lastSavedDraftJsonRef.current = JSON.stringify(draft);
      setItems(nextItems);
      setSelectedIndex(selectedIndex === -1 ? 0 : selectedIndex);
      if (!silent) loadRevisions(selectedIndex === -1 ? 0 : selectedIndex);
      
      if (!silent) setStatus('Changes saved.');
      if (silent) {
        setAutoSaveStatus('Saved');
        setTimeout(() => setAutoSaveStatus(''), 3000);
      }

    } catch (error) {
      if (!silent) setStatus(getCmsErrorMessage(error));
      if (silent) setAutoSaveStatus('Save failed');
    } finally {
      if (!silent) setBusy(false);
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
      const idsToRemove = indicesToRemove.map(i => items[i].id).filter(id => id);
      const nextItems = items.filter((_, i) => !indicesToRemove.includes(i));
      setItems(nextItems);
      setSelectedIndices(new Set());
      setSelectedIndex(-1);
      setDraft(formFromItem(section.initialItem, fields, section.initialItem));
      if (idsToRemove.length > 0) {
        await softRemoveMultipleCmsItems(docId, idsToRemove);
      }
      setStatus(`${indicesToRemove.length} items deleted.`);
    } catch (error) {
      setStatus(getCmsErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const updateMultipleStatus = async (newStatus) => {
    if (selectedIndices.size === 0) return;
    setBusy(true);
    try {
      const indicesToUpdate = Array.from(selectedIndices);
      const idsToUpdate = indicesToUpdate.map(i => items[i].id).filter(id => id);
      
      const nextItems = [...items];
      indicesToUpdate.forEach(i => {
        if (nextItems[i]) {
          nextItems[i] = { ...nextItems[i], status: newStatus };
        }
      });
      setItems(nextItems);
      
      if (selectedIndex !== -1 && selectedIndices.has(selectedIndex)) {
        setDraft(prev => ({ ...prev, status: newStatus }));
      }
      
      if (idsToUpdate.length > 0) {
        await bulkUpdateCmsItems(docId, idsToUpdate, { status: newStatus });
      }
      
      setSelectedIndices(new Set());
      setStatus(`${idsToUpdate.length} items updated to ${newStatus}.`);
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
        await reorderCmsCollection(docId, newItems);
        setStatus('Order saved.');
      } catch {
        setStatus('Failed to save order.');
      } finally {
        setBusy(false);
      }
    }
  };

  if (loading && !draft) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
        Loading {section.title.toLowerCase()}…
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-3xl border border-slate-800/80 bg-slate-900/40 p-5 sm:p-7 shadow-2xl backdrop-blur-xl">

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

      {docId === CMS_DOCS.openSource && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border border-purple-500/20 bg-purple-500/10 backdrop-blur-sm gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-500/20 text-purple-300 rounded-xl mt-0.5 shrink-0 border border-purple-500/30">
              <Github size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">GitHub API Repository Cache</h4>
              <p className="text-xs text-slate-400 mt-0.5 max-w-xl leading-relaxed">
                Pre-fetch and store repositories in Firestore. This speeds up public page loading and ensures immunity from GitHub API rate limiting.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={syncBusy}
            onClick={syncGithubCache}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500 transition-all disabled:opacity-50 shadow-[0_4px_16px_rgba(168,85,247,0.25)] active:scale-[0.98]"
          >
            <RefreshCw size={14} className={syncBusy ? 'animate-spin' : ''} />
            {syncBusy ? 'Syncing...' : 'Sync GitHub Cache'}
          </button>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)] items-start">
        {/* Left Master List Sidebar */}
        <div className="flex flex-col xl:sticky xl:top-24 xl:h-[calc(100vh-8.5rem)] rounded-2xl border border-slate-800/90 bg-slate-950/70 p-4 shadow-inner">
          <div className="mb-3 shrink-0">
            <label className="sr-only" htmlFor={`list-search-${docId}`}>
              Filter {section.title} list
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 focus-within:border-sky-400 focus-within:ring-1 focus-within:ring-sky-400/20 transition-all">
              <Search size={14} className="shrink-0 text-slate-500" aria-hidden />
              <input
                id={`list-search-${docId}`}
                type="search"
                value={listQuery}
                onChange={(e) => setListQuery(e.target.value)}
                placeholder="Search collection…"
                className="min-w-0 flex-1 bg-transparent text-xs text-slate-100 outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2 pb-2">
            {items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/30 p-6 text-center text-xs text-slate-500">
                No items yet. Use <span className="text-sky-400 font-bold">Add new</span> above to create the first entry.
              </div>
            ) : listEntries.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/30 p-6 text-center text-xs text-slate-500">
                No items match your filter query.
              </div>
            ) : (
              <>
                {selectedIndices.size > 0 && (
                  <div className="flex items-center justify-between mb-3 p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 shadow-md">
                    <span className="text-xs font-semibold text-slate-300">{selectedIndices.size} selected</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateMultipleStatus('published')}
                        disabled={busy}
                        className="px-2.5 py-1 text-[11px] font-bold bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-colors"
                      >
                        Publish
                      </button>
                      <button
                        onClick={() => updateMultipleStatus('Draft')}
                        disabled={busy}
                        className="px-2.5 py-1 text-[11px] font-bold bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg transition-colors"
                      >
                        Draft
                      </button>
                      <button
                        onClick={removeMultipleItems}
                        disabled={busy}
                        className="px-2.5 py-1 text-[11px] font-bold bg-red-500/10 text-red-300 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors ml-1"
                      >
                        Delete
                      </button>
                    </div>
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
                    <ul className="space-y-1.5">
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
                  <div className="flex items-center justify-between mt-3 border-t border-slate-800/80 pt-3">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] font-semibold text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-[10px] font-mono text-slate-500">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] font-semibold text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Detail Form Area */}
        <div className="space-y-6 min-w-0 pb-28">
          <div className="rounded-2xl border border-slate-800/90 bg-slate-950/60 p-5 sm:p-6 shadow-inner">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800/70 pb-3">
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-sky-400">
                  {selectedIndex === -1 ? 'Creating New Entry' : 'Editing Selected Item'}
                </p>
                <h3 className="text-base sm:text-lg font-bold text-slate-100 mt-0.5">
                  {draft?.title || draft?.name || draft?.url || `${section.title} Item`}
                </h3>
              </div>
              {draft?.status && (
                <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                  draft.status === 'Draft' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {draft.status}
                </span>
              )}
            </div>

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

          {selectedIndex !== -1 && (
            <div className="rounded-2xl border border-slate-800/90 bg-slate-950/60 p-5 shadow-inner">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800/70 pb-3">
                <p className="text-xs font-mono font-bold uppercase tracking-[0.14em] text-slate-300">Revision History</p>
                <button 
                  onClick={() => loadRevisions(selectedIndex)}
                  disabled={loadingRevisions}
                  className="text-xs font-semibold text-sky-400 hover:underline disabled:opacity-50"
                >
                  {loadingRevisions ? 'Loading...' : 'Refresh'}
                </button>
              </div>
              
              {revisions.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No revisions found.</p>
              ) : (
                <div className="space-y-2 max-h-[260px] overflow-y-auto custom-scrollbar pr-2">
                  {revisions.map((rev) => {
                    const date = rev.savedAt?.toDate ? rev.savedAt.toDate() : new Date();
                    return (
                      <div key={rev.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 transition-colors">
                        <div>
                          <p className="text-xs font-semibold text-slate-200">{date.toLocaleString()}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{rev.id}</p>
                        </div>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to restore this version? Your current draft will be overwritten.')) {
                              setDraft(formFromItem(rev, fields, section.initialItem));
                              setStatus('Version restored to draft. Click Save to commit.');
                            }
                          }}
                          className="px-3 py-1.5 text-xs font-bold bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 rounded-lg transition-colors border border-sky-500/20"
                        >
                          Restore
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Fixed Save Bar with clear shadow and padding */}
          <div className="sticky bottom-4 z-20 rounded-2xl border border-slate-800 bg-slate-950/95 px-5 py-3.5 backdrop-blur-xl shadow-2xl shadow-black/80">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <p className="text-xs text-slate-400">Save commits changes for this item to Firestore.</p>
                {autoSaveStatus && (
                  <span className="text-[10px] font-mono font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                    {autoSaveStatus}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={saveItem}
                disabled={busy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-[0_4px_20px_rgba(56,189,248,0.25)] transition-all hover:bg-sky-400 hover:shadow-[0_4px_28px_rgba(56,189,248,0.35)] active:scale-[0.99] disabled:opacity-60 sm:w-auto"
              >
                <Save size={15} />
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

