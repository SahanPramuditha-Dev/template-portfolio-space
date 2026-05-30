import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import PageShell from '../components/PageShell';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import { PageBodyCmsSkeleton } from '../components/CmsShapeSkeleton';

const ServicesPage = () => {
  const { data, loading } = useCmsDoc(CMS_DOCS.services, { items: [] });
  const { data: siteDoc, loading: siteLoading } = useCmsDoc(CMS_DOCS.site, null);
  const services = Array.isArray(data?.items) ? data.items : [];

  if (loading || siteLoading || data === undefined || siteDoc === undefined) {
    return (
      <>
        <SEO
          title="Services | Sahan Pramuditha"
          description="Freelance web, API, and product services with clear scope and delivery timelines."
          canonicalPath="/services"
        />
        <PageShell eyebrow="Freelance Offering" title="Services" description="Loading…">
          <PageBodyCmsSkeleton />
        </PageShell>
      </>
    );
  }

  const bookingUrl = siteDoc?.bookingUrl || import.meta.env.VITE_BOOKING_URL || '';

  return (
    <>
      <SEO
        title="Services | Sahan Pramuditha"
        description="Freelance web, API, and product services with clear scope and delivery timelines."
        canonicalPath="/services"
      />
      <PageShell
        eyebrow="Freelance Offering"
        title="Services designed to ship."
        description="If you need a website, API, or product build, these cards can describe the scope, timeline, and deliverables."
      >
        {services.length === 0 ? (
          <div className="rounded-2xl border border-secondary/50 bg-secondary/20 px-6 py-16 text-center text-text-muted">
            No services are configured yet. Add them in the admin panel.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {services.map((service, index) => (
              <motion.article
                key={service.title || index}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="rounded-3xl border border-white/10 bg-secondary/20 p-6 backdrop-blur-md"
              >
                {service.featured && (
                  <span className="mb-4 inline-flex rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[0.68rem] font-mono uppercase tracking-[0.12em] text-accent">
                    Featured
                  </span>
                )}
                <div className="mb-4 flex items-center gap-3">
                  <Briefcase className="text-accent" size={24} />
                  <h2 className="text-2xl font-bold text-text">{service.title}</h2>
                </div>
                <p className="text-sm leading-relaxed text-text-muted">{service.summary}</p>
                <p className="mt-4 text-sm text-text-muted whitespace-pre-line">{service.scope}</p>
                <div className="mt-4 grid gap-3 rounded-2xl border border-secondary/40 bg-primary/50 p-4 text-sm text-text-muted sm:grid-cols-2">
                  <div>
                    <p className="font-mono uppercase tracking-[0.16em] text-accent">Timeline</p>
                    <p>{service.timeline || 'Flexible'}</p>
                  </div>
                  <div>
                    <p className="font-mono uppercase tracking-[0.16em] text-accent">CTA</p>
                    <p>{service.cta || 'Reach out to discuss.'}</p>
                  </div>
                </div>
                {service.deliverables ? (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-mono uppercase tracking-[0.16em] text-text-muted">Deliverables</p>
                    <p className="text-sm text-text-muted whitespace-pre-line">{service.deliverables}</p>
                  </div>
                ) : null}
                <div className="mt-5">
                <a href={bookingUrl || '/#contact'} target={bookingUrl ? '_blank' : '_self'} rel={bookingUrl ? 'noreferrer' : undefined} className="inline-flex items-center gap-2 text-accent">
                  Start an inquiry
                  <ArrowRight size={14} />
                </a>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </PageShell>
    </>
  );
};

export default ServicesPage;
