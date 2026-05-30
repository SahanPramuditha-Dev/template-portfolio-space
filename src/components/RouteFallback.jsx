import React from 'react';

const RouteFallback = () => (
  <div className="min-h-screen bg-primary px-4 py-20 text-text">
    <div className="mx-auto max-w-3xl animate-pulse space-y-5 rounded-3xl border border-white/10 bg-secondary/20 p-8">
      <div className="h-4 w-32 rounded bg-accent/25" />
      <div className="h-10 w-2/3 rounded bg-secondary/60" />
      <div className="h-4 w-full max-w-xl rounded bg-secondary/40" />
      <div className="h-64 rounded-2xl bg-secondary/30" />
    </div>
  </div>
);

export default RouteFallback;
