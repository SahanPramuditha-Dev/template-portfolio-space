import React from 'react';
import { Link } from 'react-router-dom';
import { Ghost, Home } from 'lucide-react';
import SEO from '../components/SEO';
import PageShell from '../components/PageShell';

const NotFoundPage = () => (
  <>
    <SEO title="404 | Sahan Pramuditha" description="Page not found." canonicalPath="/404" noindex />
    <PageShell
      eyebrow="System"
      title="404. That page drifted into deep space."
      description="Use the home link below to get back to the portfolio."
      actions={(
        <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
          <Home size={16} />
          Return home
        </Link>
      )}
    >
      <div className="rounded-3xl border border-white/10 bg-secondary/20 p-10 text-center">
        <Ghost className="mx-auto mb-4 text-accent" size={48} />
        <p className="text-text-muted">Try the navigation, or go back to the homepage.</p>
      </div>
    </PageShell>
  </>
);

export default NotFoundPage;
