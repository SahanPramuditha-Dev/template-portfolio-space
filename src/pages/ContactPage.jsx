import React from 'react';
import { Mail, Github, Linkedin, Clock, Facebook } from 'lucide-react';
import SEO from '../components/SEO';
import PageShell from '../components/PageShell';
import Contact from '../components/Contact';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import { PageBodyCmsSkeleton } from '../components/CmsShapeSkeleton';

const ContactPage = () => {
  const { data: siteDoc, loading } = useCmsDoc(CMS_DOCS.site, null);

  if (loading || siteDoc === undefined) {
    return (
      <>
        <SEO
          title="Contact | Sahan Pramuditha"
          description="Get in touch for freelance work, product builds, or collaborations."
          canonicalPath="/contact"
        />
        <PageShell eyebrow="Lead Capture" title="Contact" description="Loading…">
          <PageBodyCmsSkeleton />
        </PageShell>
      </>
    );
  }

  const email = siteDoc?.contactEmail || siteDoc?.footerEmail || 'contact@sahanpramuditha.com';
  const socialLinks = Array.isArray(siteDoc?.socialLinksJson) ? siteDoc.socialLinksJson : [];

  return (
    <>
      <SEO
        title="Contact | Sahan Pramuditha"
        description="Get in touch for freelance work, product builds, or collaborations."
        canonicalPath="/contact"
      />
      <PageShell
        eyebrow="Lead Capture"
        title="Let’s build something useful."
        description="Use the form below, or reach out directly through the channels that work best for you."
        actions={(
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent"
          >
            <Mail size={16} />
            {email}
          </a>
        )}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {socialLinks.length > 0 ? (
            socialLinks.slice(0, 2).map((link) => {
              const Icon =
                link.label === 'GitHub' ? Github : link.label === 'LinkedIn' ? Linkedin : Facebook;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.label === 'Email' ? '_self' : '_blank'}
                  rel={link.label === 'Email' ? undefined : 'noreferrer'}
                  className="rounded-2xl border border-white/10 bg-secondary/20 p-5 text-text-muted"
                >
                  <Icon className="mb-2 text-accent" />
                  {link.label} profile
                </a>
              );
            })
          ) : (
            <>
              <a href="https://github.com/SahanPramuditha-Dev" target="_blank" rel="noreferrer" className="rounded-2xl border border-white/10 bg-secondary/20 p-5 text-text-muted">
                <Github className="mb-2 text-accent" />
                GitHub profile
              </a>
              <a href="https://www.linkedin.com/in/sahan-pramuditha-754761356" target="_blank" rel="noreferrer" className="rounded-2xl border border-white/10 bg-secondary/20 p-5 text-text-muted">
                <Linkedin className="mb-2 text-accent" />
                LinkedIn profile
              </a>
            </>
          )}
          <div className="rounded-2xl border border-white/10 bg-secondary/20 p-5 text-text-muted">
            <Clock className="mb-2 text-accent" />
            Usually replies within 1-2 business days
          </div>
        </div>

        <Contact />
      </PageShell>
    </>
  );
};

export default ContactPage;
