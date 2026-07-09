import React from 'react';
import { useCmsDoc, CMS_DOCS, saveCmsDoc, uploadCmsAsset } from '../../../../lib/cms';
import RepeatableTextEditor from './RepeatableTextEditor';
import RepeatableObjectEditor from './RepeatableObjectEditor';
import { requestImageCrop } from '../CropModalRoot';
import SimpleMdeReact from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import { FileText, ImageIcon, ExternalLink } from 'lucide-react';

const FieldEditor = ({ field, value, onChange, onUpload, section, docId }) => {
  const fieldId = `admin-field-${field.key}`;

  // Local suggestions for tech list fields (avoid referencing AdminPage scope)
  const { data: _projectsDoc } = useCmsDoc(CMS_DOCS.projects, { items: [] });
  const { data: _siteDoc } = useCmsDoc(CMS_DOCS.site, {});
  const _techSuggestions = React.useMemo(() => {
    const fromProjects = Array.isArray(_projectsDoc?.items)
      ? _projectsDoc.items.flatMap((p) => (Array.isArray(p.tech) ? p.tech : []))
      : [];
    const fromSite = Array.isArray(_siteDoc?.techTags) ? _siteDoc.techTags : [];
    return [...new Set([...fromSite.filter(Boolean), ...fromProjects.filter(Boolean)])].sort((a, b) =>
      String(a).localeCompare(String(b))
    );
  }, [_projectsDoc, _siteDoc]);

  const addGlobalTechTagLocal = async (tag) => {
    if (!tag || !tag.trim()) return;
    const normalized = String(tag).trim();
    const existing = Array.isArray(_siteDoc?.techTags) ? _siteDoc.techTags : [];
    if (existing.includes(normalized)) return;
    try {
      await saveCmsDoc(CMS_DOCS.site, { techTags: [...existing, normalized] });
    } catch (err) {
      console.error('Failed to save global tech tag', err);
    }
  };

  if (field.type === 'checkbox') {
    return (
      <label
        htmlFor={fieldId}
        className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-primary/30 px-4 py-3.5 transition-colors hover:border-accent/25"
      >
        <input
          id={fieldId}
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-secondary/50 text-accent focus:ring-accent"
        />
        <span className="text-sm font-medium text-text">{field.label}</span>
      </label>
    );
  }

  if (field.type === 'list') {
    return (
      <RepeatableTextEditor
        label={field.label}
        helper={field.helper || 'Add one item per row.'}
        placeholder={field.placeholder || 'Enter an item'}
        value={Array.isArray(value) ? value : []}
        onChange={onChange}
        suggestions={field.key === 'tech' ? _techSuggestions : undefined}
        onAddSuggestion={field.key === 'tech' ? addGlobalTechTagLocal : undefined}
      />
    );
  }

  if (field.type === 'object-list') {
    const needsNestedUpload = field.fields?.some((f) => f.type === 'image' || f.type === 'file');
    const uploadForObjectList =
      needsNestedUpload && section && docId
        ? async (_nestedKey, accept = 'image/*,.gif,.mp4,.webm,.pdf,.doc,.docx,.ppt,.pptx') =>
            new Promise((resolve) => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = accept;
              input.onchange = async () => {
                let file = input.files?.[0];
                if (!file) {
                  resolve(null);
                  return;
                }
                if (file.type.startsWith('image/') && file.type !== 'image/gif') {
                  try {
                    file = await requestImageCrop(file, null); // Free aspect ratio for general objects
                  } catch {
                    resolve(null);
                    return;
                  }
                }
                try {
                  const url = await uploadCmsAsset(file, `${section.uploadFolder || 'uploads'}/${docId}`);
                  resolve(url);
                } catch (error) {
                  console.error('Upload failed:', error);
                  resolve(null);
                }
              };
              input.click();
            })
        : null;

    return (
      <RepeatableObjectEditor
        label={field.label}
        helper={field.helper || 'Add one card per entry.'}
        value={Array.isArray(value) ? value : []}
        onChange={onChange}
        createItem={field.createItem || (() => ({}))}
        fields={field.fields || []}
        onUpload={uploadForObjectList}
      />
    );
  }

  const commonClass =
    'w-full rounded-xl border border-white/10 bg-primary/40 px-4 py-3 text-sm text-text outline-none transition-colors placeholder:text-text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent/40';

  return (
    <div className="space-y-2">
      <label htmlFor={fieldId} className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
        {field.label}
      </label>
      {field.type === 'select' ? (
        <select
          id={fieldId}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={commonClass}
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
      ) : field.type === 'markdown' ? (
        <div className="prose-editor-wrapper bg-primary/40 rounded-xl overflow-hidden border border-white/10 [&_.editor-toolbar]:border-none [&_.editor-toolbar]:bg-secondary/50 [&_.editor-toolbar>button]:text-text [&_.editor-toolbar>button.active]:bg-accent/20 [&_.CodeMirror]:border-none [&_.CodeMirror]:bg-transparent [&_.CodeMirror]:text-text">
          <SimpleMdeReact
            id={fieldId}
            value={value || ''}
            onChange={(val) => onChange(val)}
            options={{
              spellChecker: false,
              status: false,
              minHeight: '200px',
            }}
          />
        </div>
      ) : field.type === 'textarea' || field.type === 'json' ? (
        <textarea
          id={fieldId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={field.type === 'json' ? 8 : 4}
          className={`${commonClass} font-mono text-sm`}
        />
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              id={fieldId}
              type={field.type === 'number' ? 'number' : 'text'}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={commonClass}
            />
            {(field.type === 'image' || field.type === 'file' || field.type === 'pdf') && onUpload && (
              <button
                type="button"
                onClick={onUpload}
                className="shrink-0 rounded-xl border border-accent/30 bg-accent/10 px-3 py-3 text-accent"
                aria-label={`Upload ${field.label}`}
              >
                {field.type === 'pdf' ? <FileText size={16} /> : field.type === 'file' ? <FileText size={16} /> : <ImageIcon size={16} />}
              </button>
            )}
          </div>
          {field.type === 'image' && value && (
            <div className="mt-1 w-full max-w-sm rounded-lg overflow-hidden border border-white/10 bg-black/20">
              <img src={value} alt="Preview" className="w-full h-auto max-h-48 object-contain" />
            </div>
          )}
          {field.type === 'pdf' && value && (
            <div className="mt-2 w-full rounded-xl overflow-hidden border border-accent/20 bg-black/30">
              <div className="flex items-center justify-between px-4 py-2 bg-accent/10 border-b border-accent/15">
                <span className="text-xs font-mono text-accent uppercase tracking-widest">PDF Preview</span>
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline flex items-center gap-1"
                >
                  <ExternalLink size={12} /> Open in new tab
                </a>
              </div>
              <iframe
                src={value}
                title="Certificate PDF Preview"
                className="w-full"
                style={{ height: '480px', border: 'none' }}
              />
            </div>
          )}
        </div>
      )}
      {field.type === 'csv' && <p className="text-xs text-text-muted">Separate values with commas.</p>}
      {field.type === 'json' && <p className="text-xs text-text-muted">Must be valid JSON.</p>}
    </div>
  );
};

export default FieldEditor;
