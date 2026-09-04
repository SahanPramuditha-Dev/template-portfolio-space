/* eslint-disable react-refresh/only-export-components */
import React, { useMemo } from 'react';
import { ChevronDown } from 'lucide-react';

export const COLLECTION_FIELD_GROUPS = {
  summary: {
    label: 'Summary & Classification',
    hint: 'What appears on cards, filters, and list views.',
  },
  hero: {
    label: 'Hero & CTA Details',
    hint: 'Cinematic hero details, 3D settings, custom metrics, and calls-to-action.',
  },
  story: {
    label: 'Case Study & Narrative',
    hint: 'Long-form content, objectives, story milestones, and roadmap.',
  },
  architecture: {
    label: 'Architecture & System Design',
    hint: 'Interactive flow diagrams, database schemas, mock endpoints, and authentication.',
  },
  engineering: {
    label: 'Engineering Integrity',
    hint: 'Technical dilemmas, challenges, lessons learned, and folder structures.',
  },
  metrics: { label: 'Impact Metrics', hint: 'Optional headline numbers.' },
  links: { label: 'Outbound Links', hint: 'Demo and source URLs.' },
  media: { label: 'Media & Visuals', hint: 'Images, documents, galleries, and visual assets.' },
  meta: {
    label: 'Metadata & Publishing',
    hint: 'Slug, dates, categories, and flags.',
  },
  content: { label: 'Article Body', hint: 'Main text and optional code block.' },
  identity: { label: 'Basics & Identity', hint: 'Names, titles, and verification.' },
  community: { label: 'Community Context', hint: 'What happened and what you took away.' },
  publishing: { label: 'Publishing & Placement', hint: 'Visibility, homepage highlighting, and display order.' },
  stats: { label: 'Repository Stats', hint: 'Stars, forks, and watchers.' },
  skills: { label: 'Skill Entries', hint: 'Cards inside this group.' },
  resourceMeta: { label: 'Listing Details', hint: 'How this resource appears in lists.' },
  resourceLink: { label: 'URL & Description', hint: 'Link target and optional blurb.' },
  author: { label: 'Author Information', hint: 'Who the testimonial is from.' },
  testimonialBody: { label: 'Quote & Details', hint: 'Quote text, rating, and references.' },
  serviceOffer:    { label: 'Offer Headline',     hint: 'Title, category, icon, pitch, and availability.' },
  serviceDelivery: { label: 'Scope & Delivery',   hint: 'Pricing, timeline, features, CTA, and tech tags.' },
  serviceProcess:  { label: 'Process Steps',      hint: 'Numbered workflow shown on the service card.' },
  role: { label: 'Role & Timeline', hint: 'Title, organization, location, and timeframe.' },
  detail: { label: 'Story & Skills', hint: 'Description and skill tags.' },
  general: { label: 'General Fields', hint: '' },
};

const FieldGroups = ({ fields, renderField }) => {
  const { order, map } = useMemo(() => {
    const ord = [];
    const m = new Map();
    fields.forEach((field) => {
      const id = field.group || 'general';
      if (!m.has(id)) {
        m.set(id, []);
        ord.push(id);
      }
      m.get(id).push(field);
    });
    return { order: ord, map: m };
  }, [fields]);

  return (
    <div className="space-y-3">
      {order.map((groupId, index) => {
        const groupFields = map.get(groupId);
        const meta = COLLECTION_FIELD_GROUPS[groupId] || COLLECTION_FIELD_GROUPS.general;
        return (
          <details
            key={groupId}
            open={index === 0}
            className="group rounded-2xl border border-slate-800/80 bg-slate-950/50 transition-all open:border-sky-500/30 open:bg-slate-900/40"
          >
            <summary className="cursor-pointer list-none rounded-2xl px-4 py-3.5 transition-colors hover:bg-slate-800/30 [&::-webkit-details-marker]:hidden select-none">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold tracking-tight text-slate-200 group-open:text-sky-400 transition-colors">
                      {meta.label}
                    </span>
                    <span className="rounded-full border border-slate-700/80 bg-slate-800/70 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-400">
                      {groupFields.length}
                    </span>
                  </div>
                  {meta.hint && <p className="mt-1 text-xs text-slate-400 leading-relaxed truncate">{meta.hint}</p>}
                </div>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-transform duration-200 group-open:rotate-180 group-open:text-sky-400">
                  <ChevronDown size={16} />
                </div>
              </div>
            </summary>
            <div className="grid gap-5 border-t border-slate-800/70 px-4 pb-5 pt-4 md:grid-cols-2">
              {groupFields.map((field) => {
                const needsFullWidth = ['textarea', 'json', 'markdown', 'list', 'object-list', 'github-import', 'seo-preview'].includes(field.type);
                return (
                  <div key={field.key} className={needsFullWidth ? 'md:col-span-2' : ''}>
                    {renderField(field)}
                  </div>
                );
              })}
            </div>
          </details>
        );
      })}
    </div>
  );
};

export default FieldGroups;
