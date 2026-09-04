import React from 'react';
import { Eye, FileText } from 'lucide-react';

const DraftPreview = ({ draft, fields, className = '' }) => {
  if (!draft) return null;

  const primary = draft.title || draft.name || draft.program || draft.url || 'Untitled Draft';
  const meta = [draft.category, draft.type, draft.issuer, draft.organization, draft.status]
    .filter(Boolean)
    .slice(0, 2)
    .join(' · ');
  const body = draft.shortDescription || draft.summary || draft.description || draft.excerpt || draft.content || '';
  const tags = ['tech', 'tags', 'skills']
    .flatMap((key) => (Array.isArray(draft[key]) ? draft[key] : []))
    .slice(0, 8);
  const imageUrl = draft.image || draft.thumbnail || (Array.isArray(draft.screenshots) && draft.screenshots[0]?.url) || draft.architectureImage || '';
  const hasImageFieldInSchema = fields.some((field) => field.type === 'image' || field.key === 'screenshots') || imageUrl;
  const pdfFieldWithValue = fields.find((field) => field.type === 'pdf' && draft[field.key]);
  const pdfUrl = pdfFieldWithValue ? draft[pdfFieldWithValue.key] : '';

  return (
    <aside className={`rounded-2xl border border-sky-500/20 bg-sky-500/[0.03] p-5 ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-sky-400">Live Card Preview</p>
          <h3 className="mt-0.5 text-base font-bold text-slate-100">Portfolio preview</h3>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
          <Eye size={16} aria-hidden />
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/80 shadow-inner">
        {hasImageFieldInSchema ? (
          imageUrl ? (
            <div className="w-full overflow-hidden border-b border-slate-800 bg-slate-900/60 h-36 flex items-center justify-center">
              <img src={imageUrl} alt="" className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div className="flex h-28 items-center justify-center bg-slate-900/40 text-[11px] font-mono uppercase tracking-[0.14em] text-slate-500">
              Add media to preview
            </div>
          )
        ) : null}
        {pdfUrl && (
          <div className="flex items-center gap-2 px-4 py-2 bg-sky-500/10 border-t border-sky-500/15">
            <FileText size={14} className="text-sky-400 shrink-0" />
            <span className="text-xs font-mono text-sky-300 truncate">PDF attached</span>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs text-sky-400 hover:underline">
              Preview
            </a>
          </div>
        )}
        <div className="p-4 sm:p-5">
          {meta ? <p className="mb-1.5 text-xs font-mono font-semibold uppercase tracking-[0.14em] text-sky-400">{meta}</p> : null}
          <h4 className="text-lg font-bold text-slate-100">{primary}</h4>
          {body ? <p className="mt-2 line-clamp-3 text-xs sm:text-sm leading-relaxed text-slate-400">{body}</p> : null}
          {tags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span key={tag} className="rounded-md border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-sky-300">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
};

export default DraftPreview;
