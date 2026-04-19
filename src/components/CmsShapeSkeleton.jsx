import React from 'react';
import SectionWrapper from './SectionWrapper';

export function HeroCmsSkeleton() {
  return (
    <section
      id="home"
      className="min-h-[100dvh] min-h-screen flex items-start justify-center relative z-10 overflow-hidden pt-24 sm:pt-28 md:pt-32 lg:pt-36 px-4 sm:px-0"
      aria-busy="true"
      aria-label="Loading hero"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 w-full">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)] lg:gap-14 animate-pulse">
          <div className="space-y-6 lg:pt-6">
            <div className="h-5 w-36 rounded bg-secondary/45" />
            <div className="h-12 sm:h-16 w-full max-w-xl rounded-lg bg-secondary/40" />
            <div className="h-20 w-full max-w-2xl rounded-lg bg-secondary/35" />
            <div className="h-24 w-full max-w-xl rounded-lg bg-secondary/30" />
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="h-12 w-12 rounded-full bg-secondary/40" />
              <div className="h-12 w-12 rounded-full bg-secondary/40" />
              <div className="h-12 w-12 rounded-full bg-secondary/40" />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="h-12 w-40 rounded border border-white/10 bg-secondary/35" />
              <div className="h-12 w-36 rounded bg-accent/20" />
            </div>
          </div>
          <div className="order-first md:order-last h-[280px] sm:h-[360px] md:h-[500px] rounded-2xl border border-white/10 bg-secondary/25" />
        </div>
        <div className="mt-8 h-32 w-full rounded-3xl border border-white/10 bg-secondary/20" />
      </div>
    </section>
  );
}

export function CmsSectionSkeleton({ id, titleBlockClass = 'max-w-md' }) {
  return (
    <SectionWrapper id={id}>
      <div
        className="container mx-auto px-4 sm:px-6 max-w-7xl relative animate-pulse"
        aria-busy="true"
        aria-label="Loading section"
      >
        <div className="mb-10 flex flex-wrap items-center gap-2">
          <div className="h-7 w-16 rounded bg-secondary/40" />
          <div className={`h-8 flex-1 rounded-lg bg-secondary/35 ${titleBlockClass}`} />
          <div className="h-px flex-grow bg-secondary/30 min-w-[48px] opacity-60" />
        </div>
        <div className="min-h-[240px] rounded-3xl border border-white/10 bg-secondary/25" />
      </div>
    </SectionWrapper>
  );
}

/** Full-width placeholder for routed pages that use `PageShell`. */
export function PageBodyCmsSkeleton() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 sm:px-6 animate-pulse space-y-8 py-4"
      aria-busy="true"
      aria-label="Loading page"
    >
      <div className="h-8 w-2/3 max-w-lg rounded-lg bg-secondary/40" />
      <div className="h-4 w-full max-w-2xl rounded bg-secondary/30" />
      <div className="min-h-[320px] rounded-3xl border border-white/10 bg-secondary/25" />
    </div>
  );
}

export function FooterCmsSkeleton() {
  return (
    <footer className="relative z-10 border-t border-secondary bg-primary/90 pt-12 pb-8 backdrop-blur-md">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 animate-pulse" aria-busy="true" aria-label="Loading footer">
        <div className="mb-8 flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="h-8 w-40 rounded bg-secondary/40" />
          <div className="flex gap-4">
            <div className="h-10 w-10 rounded-full bg-secondary/35" />
            <div className="h-10 w-10 rounded-full bg-secondary/35" />
            <div className="h-10 w-10 rounded-full bg-secondary/35" />
          </div>
        </div>
        <div className="mx-auto h-4 max-w-lg rounded bg-secondary/30" />
      </div>
    </footer>
  );
}
