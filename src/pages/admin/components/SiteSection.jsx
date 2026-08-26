import React from 'react';

const SiteSection = ({ title, description, children }) => (
  <section className="space-y-5 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 sm:p-7 shadow-xl shadow-black/10 backdrop-blur-md">
    <header className="border-b border-slate-800/70 pb-4">
      <h3 className="text-lg font-bold tracking-tight text-slate-100">{title}</h3>
      {description && <p className="mt-1 max-w-3xl text-xs sm:text-sm leading-relaxed text-slate-400">{description}</p>}
    </header>
    <div className="space-y-5">{children}</div>
  </section>
);

export default SiteSection;

