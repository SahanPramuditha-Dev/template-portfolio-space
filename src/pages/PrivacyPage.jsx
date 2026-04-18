import React from 'react';
import SEO from '../components/SEO';
import PageShell from '../components/PageShell';

const PrivacyPage = () => (
  <>
    <SEO title="Privacy Policy | Sahan Pramuditha" description="Privacy policy for the portfolio website." canonicalPath="/privacy" />
    <PageShell eyebrow="Legal" title="Privacy Policy" description="This site only collects data you submit through forms or interact with through basic analytics hooks.">
      <div className="prose prose-invert max-w-none rounded-3xl border border-white/10 bg-secondary/20 p-6 text-text-muted">
        <p>
          Personal data submitted through the contact form is used only to respond to inquiries.
          Analytics and embedded services may collect basic usage data as configured in the site.
        </p>
        <p>
          If you want a stricter policy, add the exact tracking and storage services you use, then publish the final text from the admin panel or a CMS page.
        </p>
      </div>
    </PageShell>
  </>
);

export default PrivacyPage;
