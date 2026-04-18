import React from 'react';
import SEO from '../components/SEO';
import PageShell from '../components/PageShell';

const CookiePolicyPage = () => (
  <>
    <SEO title="Cookie Policy | Sahan Pramuditha" description="Cookie policy for the portfolio website." canonicalPath="/cookies" />
    <PageShell eyebrow="Legal" title="Cookie Policy" description="This website uses only the cookies required by the tools you enable.">
      <div className="rounded-3xl border border-white/10 bg-secondary/20 p-6 text-text-muted">
        <p>
          Some third-party embeds, analytics tools, or form providers may set cookies or similar
          local storage entries. If you enable them, disclose them here.
        </p>
      </div>
    </PageShell>
  </>
);

export default CookiePolicyPage;
