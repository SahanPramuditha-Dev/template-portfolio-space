import React from 'react';
import SEO from '../components/SEO';
import PageShell from '../components/PageShell';

const PrivacyPage = () => (
  <>
    <SEO title="Privacy Policy | Sahan Pramuditha" description="Privacy policy and data collection disclosures for the portfolio website." canonicalPath="/privacy" />
    <PageShell eyebrow="Legal" title="Privacy Policy" description="Disclosing how data is processed, logged, and secured during your orbital visit.">
      <div className="prose prose-invert max-w-4xl mx-auto rounded-3xl border border-white/10 bg-secondary/20 p-8 text-text-muted space-y-6 font-mono text-sm leading-relaxed">
        <div>
          <h3 className="text-text font-bold uppercase tracking-wider text-base mb-2">1. DATA ACQUISITION & TELEMETRY</h3>
          <p>
            When you browse this portfolio, our secure custom telemetry logging subsystem captures basic interaction parameters (including pages loaded, project modals opened, contact forms dispatched, and scroll depths reached). These logs are stored securely in Firestore database nodes and are pruned regularly by the administrator.
          </p>
        </div>

        <div>
          <h3 className="text-text font-bold uppercase tracking-wider text-base mb-2">2. GEOLOCATION PARSING</h3>
          <p>
            To evaluate global reach, we process your IP address on session launch through a privacy-compliant geolocation API. This resolves your approximate country and city location coordinates. We do not store raw IP addresses in our database logs; only the parsed region attributes (e.g., "Sri Lanka" or "Colombo") are recorded.
          </p>
        </div>

        <div>
          <h3 className="text-text font-bold uppercase tracking-wider text-base mb-2">3. STORAGE TECHNOLOGIES</h3>
          <p>
            We leverage local browser Storage (specifically sessionStorage) to temporarily cache your resolved region attributes and unique session identifiers. These elements do not track you across other websites and expire automatically when you close your browser tab.
          </p>
        </div>

        <div>
          <h3 className="text-text font-bold uppercase tracking-wider text-base mb-2">4. CONTACT FORM DATA</h3>
          <p>
            Information provided voluntarily through our message inquiries form (including name, email, project scopes, and timelines) is used solely to evaluate project collaboration and correspond directly with you. 
          </p>
        </div>
      </div>
    </PageShell>
  </>
);

export default PrivacyPage;
