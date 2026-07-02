import React from 'react';
import SEO from '../components/SEO';
import PageShell from '../components/PageShell';

const CookiePolicyPage = () => (
  <>
    <SEO title="Cookie Policy | Sahan Pramuditha" description="Cookie policy and storage declarations for the portfolio website." canonicalPath="/cookies" />
    <PageShell eyebrow="Legal" title="Cookie Policy" description="Disclosing browser storage technologies, state caches, and telemetry tags.">
      <div className="prose prose-invert max-w-4xl mx-auto rounded-3xl border border-white/10 bg-secondary/20 p-8 text-text-muted space-y-6 font-mono text-sm leading-relaxed">
        <div>
          <h3 className="text-text font-bold uppercase tracking-wider text-base mb-2">1. COOKIES & LOCAL STORAGE</h3>
          <p>
            Unlike typical marketing sites, we do not deploy trackers to follow you across the internet. Instead, we use standard browser storage mechanisms to save basic states so the site works correctly:
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-primary/45 border border-white/5 rounded-2xl p-5 space-y-3">
            <h4 className="text-accent font-bold uppercase text-xs tracking-wider">A. SESSION IDENTIFICATION</h4>
            <p className="text-xs">
              A temporary unique key is saved in <code className="bg-secondary px-1.5 py-0.5 rounded text-text-muted text-[10px]">sessionStorage</code> (under the key <code className="bg-secondary px-1.5 py-0.5 rounded text-text-muted text-[10px]">analytics_session_id</code>) to group click and page-view events into single browsing sessions. This expires when you close your tab.
            </p>
          </div>

          <div className="bg-primary/45 border border-white/5 rounded-2xl p-5 space-y-3">
            <h4 className="text-accent font-bold uppercase text-xs tracking-wider">B. GEOLOCATION INDICATOR CACHE</h4>
            <p className="text-xs">
              Your parsed country and city locations are saved in <code className="bg-secondary px-1.5 py-0.5 rounded text-text-muted text-[10px]">sessionStorage</code> (under the key <code className="bg-secondary px-1.5 py-0.5 rounded text-text-muted text-[10px]">analytics_geo</code>) to prevent redundant location API requests on page refreshes, reducing load latencies.
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-text font-bold uppercase tracking-wider text-base mb-2">2. THIRD-PARTY TELEMETRY</h3>
          <p>
            This portfolio site integrates Google Analytics (GA4) property attributes (`G-EQFV12BE5K`) and performance monitors. These modules track loading speeds (First Contentful Paint) and request latencies.
          </p>
        </div>
      </div>
    </PageShell>
  </>
);

export default CookiePolicyPage;
