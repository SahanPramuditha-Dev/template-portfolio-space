import React from 'react';
import { Eye, FileText } from 'lucide-react';

const DraftPreview = ({ draft, fields, title }) => {
  if (!draft) return null;

  const primary = draft.title || draft.name || draft.program || draft.url || 'Untitled draft';
  const meta = [draft.category, draft.type, draft.issuer, draft.organization, draft.status]
    .filter(Boolean)
    .slice(0, 2)
    .join(' / ');
  const body = draft.shortDescription || draft.summary || draft.description || draft.excerpt || draft.content || '';
  const tags = ['tech', 'tags', 'skills']
    .flatMap((key) => (Array.isArray(draft[key]) ? draft[key] : []))
    .slice(0, 8);
  const imageUrl = draft.image || draft.thumbnail || (Array.isArray(draft.screenshots) && draft.screenshots[0]?.url) || draft.architectureImage || '';
  const hasImageFieldInSchema = fields.some((field) => field.type === 'image' || field.key === 'screenshots') || imageUrl;
  const pdfFieldWithValue = fields.find((field) => field.type === 'pdf' && draft[field.key]);
  const pdfUrl = pdfFieldWithValue ? draft[pdfFieldWithValue.key] : '';

  return (
    <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.14em] text-accent">Live card preview</p>
          <h3 className="mt-1 text-lg font-bold text-text">{title}</h3>
        </div>
        <Eye size={18} className="text-accent" aria-hidden />
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-primary/40">
        {hasImageFieldInSchema ? (
          imageUrl ? (
            <div className="w-full overflow-hidden border-b border-white/5 bg-black/40 h-32 flex items-center justify-center">
              <img src={imageUrl} alt="" className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center bg-secondary/30 text-xs font-mono uppercase tracking-[0.14em] text-text-muted">
              No media selected
            </div>
          )
        ) : null}
        {pdfUrl && (
          <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 border-t border-accent/15">
            <FileText size={14} className="text-accent shrink-0" />
            <span className="text-xs font-mono text-accent truncate">PDF attached</span>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs text-accent hover:underline">
              Preview
            </a>
          </div>
        )}
        <div className="p-4">
          {meta ? <p className="mb-2 text-xs font-mono uppercase tracking-[0.14em] text-accent">{meta}</p> : null}
          <h4 className="text-xl font-bold text-text">{primary}</h4>
          {body ? <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-text-muted">{body}</p> : null}
          {tags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 text-[11px] font-mono text-accent">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default DraftPreview;
