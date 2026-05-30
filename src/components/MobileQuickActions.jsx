import React from 'react';
import { FileText, Mail } from 'lucide-react';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';

const MobileQuickActions = () => {
  const { data: siteDoc, loading } = useCmsDoc(CMS_DOCS.site, null);

  if (loading || siteDoc === undefined) return null;

  const resumeUrl = siteDoc?.resumeUrl || '/resume.pdf';
  const email = siteDoc?.contactEmail || siteDoc?.footerEmail || 'contact@sahanpramuditha.com';

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-primary/90 p-2 shadow-2xl backdrop-blur-md md:hidden">
      <a
        href="#contact"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-3 py-3 text-sm font-semibold text-primary"
      >
        <Mail size={16} />
        Contact
      </a>
      <a
        href={resumeUrl}
        download
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-3 py-3 text-sm font-semibold text-accent"
      >
        <FileText size={16} />
        Resume
      </a>
      <a href={`mailto:${email}`} className="sr-only">
        Email {email}
      </a>
    </div>
  );
};

export default MobileQuickActions;
