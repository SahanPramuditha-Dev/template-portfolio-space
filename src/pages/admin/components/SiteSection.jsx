import React from 'react';

const SiteSection = ({ title, description, children }) => (
  <section className="space-y-4 rounded-2xl border border-white/10 bg-primary/25 p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
    <header className="border-b border-white/10 pb-4">
      <h3 className="font-display text-lg font-semibold tracking-tight text-text">{title}</h3>
      {description && <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-text-muted">{description}</p>}
    </header>
    <div className="space-y-4">{children}</div>
  </section>
);

export default SiteSection;
