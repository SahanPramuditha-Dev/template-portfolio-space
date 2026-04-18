import React from 'react';
import { Download, FileText, Calendar, Briefcase, Printer } from 'lucide-react';
import SEO from '../components/SEO';
import PageShell from '../components/PageShell';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';

const DEFAULT_RESUME_URL = '/resume.pdf';

const ResumePage = () => {
  const resumeUrl = siteDoc?.resumeUrl || (import.meta.env.VITE_RESUME_URL || '').trim() || DEFAULT_RESUME_URL;
  const { data: siteDoc } = useCmsDoc(CMS_DOCS.site, null);
  const { data: experienceDoc } = useCmsDoc(CMS_DOCS.experience, { items: [] });
  const { data: projectsDoc } = useCmsDoc(CMS_DOCS.projects, { items: [] });
  const educationItems = Array.isArray(siteDoc?.educationJson) ? siteDoc.educationJson : [];

  const updatedAt = siteDoc?.cvUpdatedAt || 'Update in admin';
  const version = siteDoc?.cvVersion || 'v1.0';
  const experienceItems = Array.isArray(experienceDoc?.items) ? experienceDoc.items : [];
  const projectItems = Array.isArray(projectsDoc?.items) ? projectsDoc.items : [];

  return (
    <>
      <SEO
        title="Resume | Sahan Pramuditha"
        description="Resume preview, summary, and download."
        canonicalPath="/resume"
      />
      <PageShell
        eyebrow="Conversion Layer"
        title="Resume preview, download, and summary."
        description="Keep the latest version here with a PDF preview, one-click download, and a concise overview of work history."
        actions={(
          <>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-white/5 px-4 py-2 text-sm font-medium text-text-muted"
            >
              <Printer size={16} />
              Print
            </button>
            <a
              href={resumeUrl}
              download
              className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent"
            >
              <Download size={16} />
              Download PDF
            </a>
          </>
        )}
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-secondary/20 p-4 backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between gap-4 rounded-2xl border border-secondary/40 bg-primary/50 p-4 text-sm text-text-muted">
              <span className="inline-flex items-center gap-2">
                <FileText size={16} className="text-accent" />
                Resume {version}
              </span>
              <span className="inline-flex items-center gap-2">
                <Calendar size={16} className="text-accent" />
                {updatedAt}
              </span>
            </div>
            <iframe
              title="Resume preview"
              src={resumeUrl}
              className="min-h-[70vh] w-full rounded-2xl border border-secondary/40 bg-primary"
            />
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-secondary/20 p-6 backdrop-blur-md">
              <div className="mb-4 flex items-center gap-3">
                <Briefcase className="text-accent" size={24} />
                <h2 className="text-2xl font-bold text-text">Experience summary</h2>
              </div>
              {siteDoc?.availability ? <p className="text-sm text-text-muted">{siteDoc.availability}</p> : null}
              <div className="mt-4 space-y-3 text-sm text-text-muted">
                {experienceItems.slice(0, 3).map((item, index) => (
                  <div key={item.title || index} className="rounded-2xl border border-secondary/40 bg-primary/40 p-4">
                    <p className="font-semibold text-text">{item.title}</p>
                    <p>{item.organization} • {item.period}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-secondary/20 p-6 backdrop-blur-md">
              <h2 className="mb-4 text-2xl font-bold text-text">Project highlights</h2>
              <div className="space-y-3 text-sm text-text-muted">
                {projectItems.slice(0, 3).map((item, index) => (
                  <div key={item.title || index} className="rounded-2xl border border-secondary/40 bg-primary/40 p-4">
                    <p className="font-semibold text-text">{item.title}</p>
                    <p>{item.shortDescription}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-secondary/20 p-6 backdrop-blur-md">
              <h2 className="mb-4 text-2xl font-bold text-text">Education summary</h2>
              <div className="space-y-3 text-sm text-text-muted">
                {educationItems.length > 0 ? educationItems.map((item, index) => (
                  <div key={item.institution || item.program || index} className="rounded-2xl border border-secondary/40 bg-primary/40 p-4">
                    <p className="font-semibold text-text">{item.program}</p>
                    <p>{item.institution} • {item.period}</p>
                  </div>
                )) : (
                  <p>Add education entries in the admin panel.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </PageShell>
    </>
  );
};

export default ResumePage;
