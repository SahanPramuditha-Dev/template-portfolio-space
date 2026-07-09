/* eslint-disable react-refresh/only-export-components */
import React, { useMemo } from 'react';

export const COLLECTION_FIELD_GROUPS = {
  summary: {
    label: 'Summary & classification',
    hint: 'What appears on cards, filters, and list views.',
  },
  story: {
    label: 'Case study & narrative',
    hint: 'Long-form content shown in the project modal.',
  },
  metrics: { label: 'Impact metrics', hint: 'Optional headline numbers.' },
  links: { label: 'Outbound links', hint: 'Demo and source URLs.' },
  media: { label: 'Media', hint: 'Thumbnails, GIFs, and screenshots.' },
  meta: {
    label: 'Metadata & publishing',
    hint: 'Slug, dates, categories, and flags.',
  },
  content: { label: 'Article body', hint: 'Main text and optional code block.' },
  identity: { label: 'Basics', hint: 'Names, titles, and verification.' },
  stats: { label: 'Repository stats', hint: 'Stars, forks, and watchers.' },
  skills: { label: 'Skill entries', hint: 'Cards inside this group.' },
  resourceMeta: { label: 'Listing', hint: 'How this resource appears in lists.' },
  resourceLink: { label: 'URL & description', hint: 'Link target and optional blurb.' },
  author: { label: 'Author', hint: 'Who the testimonial is from.' },
  testimonialBody: { label: 'Quote & details', hint: 'Quote text, rating, and references.' },
  serviceOffer:    { label: 'Offer headline',     hint: 'Title, category, icon, pitch, and availability.' },
  serviceDelivery: { label: 'Scope & delivery',   hint: 'Pricing (LKR), timeline, features, CTA, and tech tags.' },
  serviceProcess:  { label: 'Process steps',      hint: 'Numbered workflow shown on the service card.' },
  role: { label: 'Role & place', hint: 'Title, organization, location, and timeframe.' },
  detail: { label: 'Story & skills', hint: 'Description and skill tags.' },
  general: { label: 'Fields', hint: '' },
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
            className="rounded-2xl border border-white/10 bg-primary/20 open:border-accent/30 open:bg-primary/35"
          >
            <summary className="cursor-pointer list-none rounded-2xl px-4 py-3.5 transition-colors hover:bg-white/[0.04] [&::-webkit-details-marker]:hidden">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-sm font-semibold text-text">{meta.label}</p>
                  {meta.hint ? <p className="mt-1 text-xs text-text-muted">{meta.hint}</p> : null}
                </div>
                <span className="shrink-0 rounded-full border border-white/10 bg-primary/40 px-2.5 py-0.5 text-[11px] font-mono text-text-muted">
                  {groupFields.length}
                </span>
              </div>
            </summary>
            <div className="grid gap-5 border-t border-white/10 px-4 pb-5 pt-4">
              {groupFields.map((field) => renderField(field))}
            </div>
          </details>
        );
      })}
    </div>
  );
};

export default FieldGroups;
