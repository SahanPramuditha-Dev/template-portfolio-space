import React from 'react';
import { motion } from 'framer-motion';
import {
  Globe, Code2, Layers, Server, BarChart2, Cpu, Cloud,
  Briefcase, CheckCircle2, Clock, ArrowRight, Zap, Star,
  Users, FolderGit2, CircleDot, MessageSquare,
} from 'lucide-react';
import SEO from '../components/SEO';
import PageShell from '../components/PageShell';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import { PageBodyCmsSkeleton } from '../components/CmsShapeSkeleton';

/* ── Icon resolver ────────────────────────────────────────── */
const ICON_MAP = {
  Globe, Code2, Layers, Server, BarChart2, Cpu, Cloud, Briefcase,
  Monitor: Layers, Database: Server, Layout: Layers, Api: Server,
};
const resolveIcon = (name) => ICON_MAP[name] || Briefcase;

/* ── Category colours ─────────────────────────────────────── */
const CATEGORY_COLORS = {
  'Web Development':    { accent: 'text-sky-400',    bg: 'bg-sky-400/10',    border: 'border-sky-400/20'   },
  'Mobile Development': { accent: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  'UI/UX Design':       { accent: 'text-pink-400',   bg: 'bg-pink-400/10',   border: 'border-pink-400/20'  },
  'API & Backend':      { accent: 'text-amber-400',  bg: 'bg-amber-400/10',  border: 'border-amber-400/20' },
  'Consulting':         { accent: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/20' },
  'Data & Analytics':   { accent: 'text-teal-400',   bg: 'bg-teal-400/10',   border: 'border-teal-400/20'  },
  'DevOps':             { accent: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
};
const getColors = (cat) =>
  CATEGORY_COLORS[cat] || { accent: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20' };

/* ── Availability badge ───────────────────────────────────── */
const AvailBadge = ({ status }) => {
  if (!status) return null;
  const map = {
    'Available now':        { dot: 'bg-emerald-400', text: 'text-emerald-300', border: 'border-emerald-400/25', bg: 'bg-emerald-500/10' },
    'Limited availability': { dot: 'bg-yellow-400',  text: 'text-yellow-300',  border: 'border-yellow-400/25',  bg: 'bg-yellow-500/10'  },
    'Booking soon':         { dot: 'bg-blue-400',    text: 'text-blue-300',    border: 'border-blue-400/25',    bg: 'bg-blue-500/10'    },
    'Waitlist only':        { dot: 'bg-orange-400',  text: 'text-orange-300',  border: 'border-orange-400/25',  bg: 'bg-orange-500/10'  },
    'Unavailable':          { dot: 'bg-red-400',     text: 'text-red-300',     border: 'border-red-400/25',     bg: 'bg-red-500/10'     },
  };
  const c = map[status] || map['Available now'];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${c.border} ${c.bg} px-2.5 py-0.5 text-[10px] font-mono ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot} animate-pulse`} />
      {status}
    </span>
  );
};

/* ── Full Service Card (page version — wider, more detail) ── */
const ServiceFullCard = ({ service, index, bookingUrl }) => {
  const colors       = getColors(service.category);
  const IconComp     = resolveIcon(service.icon);
  const features     = Array.isArray(service.features)     ? service.features     : [];
  const tags         = Array.isArray(service.tags)         ? service.tags         : [];
  const processSteps = Array.isArray(service.processSteps) ? service.processSteps : [];
  const ctaHref      = service.link || bookingUrl || '/#contact';
  const ctaLabel     = service.cta  || "Let's build this";

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className={`group relative rounded-3xl border ${colors.border} bg-secondary/20 backdrop-blur-md overflow-hidden`}
    >
      {/* Accent top bar */}
      <div className={`h-1 w-full ${colors.bg} ${colors.border} border-0 border-b`} />

      {/* Glow blob */}
      <div className={`pointer-events-none absolute -top-16 -right-16 h-52 w-52 rounded-full ${colors.bg} blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-700`} />

      <div className="p-6 md:p-8">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
          <div className="flex items-start gap-4">
            <div className={`shrink-0 rounded-2xl border ${colors.border} ${colors.bg} p-3.5`}>
              {React.createElement(IconComp, { size: 26, className: colors.accent })}
            </div>
            <div>
              <h2 className="text-xl font-bold text-text leading-snug mb-1">{service.title}</h2>
              {service.category && (
                <span className={`text-[11px] font-mono ${colors.accent}`}>{service.category}</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
            {service.featured && (
              <span className="inline-flex items-center gap-1 rounded-full border border-yellow-400/25 bg-yellow-400/10 px-2.5 py-0.5 text-[10px] font-mono text-yellow-300">
                <Star size={9} fill="currentColor" /> Featured
              </span>
            )}
            <AvailBadge status={service.availability} />
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm leading-relaxed text-text-muted mb-6">{service.summary}</p>

        {/* Main 2-col grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left col */}
          <div className="space-y-5">
            {/* Price / timing strip */}
            {(service.startingPrice || service.timeline || service.turnaround) && (
              <div className="rounded-2xl border border-white/8 bg-primary/40 p-4 space-y-3">
                {service.startingPrice && (
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono uppercase tracking-widest ${colors.accent}`}>Starting Price</span>
                    <span className="font-bold text-text text-sm">{service.startingPrice}</span>
                  </div>
                )}
                {service.timeline && (
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <Clock size={12} className={colors.accent} />
                    <span><span className="text-text font-medium">Timeline:</span> {service.timeline}</span>
                  </div>
                )}
                {service.turnaround && (
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <Zap size={12} className={colors.accent} />
                    <span><span className="text-text font-medium">Turnaround:</span> {service.turnaround}</span>
                  </div>
                )}
                {service.idealFor && (
                  <div className="flex items-start gap-2 text-xs text-text-muted">
                    <Users size={12} className={`${colors.accent} mt-0.5 shrink-0`} />
                    <span><span className="text-text font-medium">Ideal for:</span> {service.idealFor}</span>
                  </div>
                )}
              </div>
            )}

            {/* What's included */}
            {features.length > 0 && (
              <div>
                <p className={`text-[10px] font-mono font-semibold uppercase tracking-widest ${colors.accent} mb-3`}>
                  What&apos;s included
                </p>
                <ul className="space-y-2">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-text-muted">
                      <CheckCircle2 size={13} className={`${colors.accent} mt-0.5 shrink-0`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tech tags */}
            {tags.length > 0 && (
              <div>
                <p className={`text-[10px] font-mono font-semibold uppercase tracking-widest ${colors.accent} mb-2`}>
                  Tech stack
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span key={tag} className={`rounded-full border px-2.5 py-0.5 text-[10px] font-mono ${colors.border} ${colors.bg} ${colors.accent}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right col */}
          <div className="space-y-5">
            {/* Process steps */}
            {processSteps.length > 0 && (
              <div>
                <p className={`text-[10px] font-mono font-semibold uppercase tracking-widest ${colors.accent} mb-3`}>
                  How it works
                </p>
                <ol className="space-y-3 relative pl-5">
                  <div className="absolute left-2 top-1 bottom-1 w-px bg-white/8" />
                  {processSteps.map((s, i) => (
                    <li key={i} className="relative flex items-start gap-3 text-sm text-text-muted">
                      <span className={`absolute -left-5 top-0 w-4 h-4 rounded-full border ${colors.border} ${colors.bg} flex items-center justify-center text-[9px] font-bold font-mono ${colors.accent}`}>
                        {i + 1}
                      </span>
                      <div>
                        {s.step && <p className="font-semibold text-text text-xs mb-0.5">{s.step}</p>}
                        {s.description && <p className="text-xs text-text-muted">{s.description}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Scope */}
            {service.scope && (
              <div>
                <p className={`text-[10px] font-mono font-semibold uppercase tracking-widest ${colors.accent} mb-2`}>
                  Scope
                </p>
                <p className="text-sm leading-relaxed text-text-muted whitespace-pre-line">{service.scope}</p>
              </div>
            )}

            {/* Deliverables */}
            {service.deliverables && (
              <div>
                <p className={`text-[10px] font-mono font-semibold uppercase tracking-widest ${colors.accent} mb-2`}>
                  Deliverables
                </p>
                <p className="text-sm leading-relaxed text-text-muted whitespace-pre-line">{service.deliverables}</p>
              </div>
            )}

            {/* Related project */}
            {service.relatedProject && (
              <a href="/projects" className={`inline-flex items-center gap-2 text-xs font-mono ${colors.accent} hover:underline`}>
                <FolderGit2 size={13} />
                See example: {service.relatedProject}
              </a>
            )}

            {/* Templates (Optional) */}
            {Array.isArray(service.templates) && service.templates.length > 0 && (
              <div className="border-t border-white/6 pt-4 mt-3">
                <p className={`text-[10px] font-mono font-semibold uppercase tracking-widest ${colors.accent} mb-3`}>
                  Available Base Templates
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {service.templates.map((tpl, ti) => {
                    const contactLink = `/#contact?projectType=${encodeURIComponent(service.category || 'Website')}&message=${encodeURIComponent(`I would like to start a project based on the template: ${tpl.name}`)}`;
                    return (
                      <div key={ti} className="rounded-2xl border border-white/8 bg-primary/30 p-4 flex flex-col gap-3 hover:border-white/15 transition-all">
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <h4 className="text-sm font-bold text-text">{tpl.name}</h4>
                            {tpl.vibe && (
                              <span className={`rounded px-1.5 py-0.5 text-[9px] font-mono ${colors.border} ${colors.bg} ${colors.accent}`}>
                                {tpl.vibe}
                              </span>
                            )}
                          </div>
                          {tpl.description && <p className="text-xs text-text-muted leading-relaxed">{tpl.description}</p>}
                        </div>
                        <div className="flex gap-2.5 mt-auto">
                          {tpl.demoUrl && (
                            <a
                              href={tpl.demoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 text-center py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-text-muted hover:text-text hover:bg-white/10 transition-colors"
                            >
                              Live Demo
                            </a>
                          )}
                          <a
                            href={contactLink}
                            className={`flex-1 text-center py-2 rounded-xl border ${colors.border} ${colors.bg} text-xs font-bold ${colors.accent} hover:opacity-80 transition-opacity`}
                          >
                            Select Base
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 pt-5 border-t border-white/6">
          <a
            href={ctaHref}
            target={ctaHref.startsWith('http') ? '_blank' : '_self'}
            rel={ctaHref.startsWith('http') ? 'noopener noreferrer' : undefined}
            className={`inline-flex items-center gap-2 rounded-xl border ${colors.border} ${colors.bg} px-6 py-3 text-sm font-bold ${colors.accent} hover:opacity-80 transition-opacity group/cta`}
          >
            {ctaLabel}
            <ArrowRight size={14} className="group-hover/cta:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </motion.article>
  );
};

/* ── Page ─────────────────────────────────────────────────── */
const ServicesPage = () => {
  const { data, loading }          = useCmsDoc(CMS_DOCS.services, { items: [] });
  const { data: siteDoc, loading: siteLoading } = useCmsDoc(CMS_DOCS.site, null);

  if (loading || siteLoading || data === undefined || siteDoc === undefined) {
    return (
      <>
        <SEO
          title="Services | Sahan Pramuditha"
          description="Web development, design, and consulting services with clear LKR pricing and delivery timelines."
          canonicalPath="/services"
        />
        <PageShell eyebrow="Freelance Offering" title="Services" description="Loading…">
          <PageBodyCmsSkeleton />
        </PageShell>
      </>
    );
  }

  const services   = (Array.isArray(data?.items) ? data.items : []).filter(s => s.status !== 'Draft');
  const bookingUrl = siteDoc?.bookingUrl || import.meta.env.VITE_BOOKING_URL || '';
  const email      = siteDoc?.contactEmail || siteDoc?.footerEmail || '';

  return (
    <>
      <SEO
        title="Services | Sahan Pramuditha"
        description="Web development, design, and consulting services with clear LKR pricing and delivery timelines."
        canonicalPath="/services"
      />
      <PageShell
        eyebrow="Freelance Offering"
        title="Services designed to ship."
        description="Every service is clearly scoped with LKR pricing, timeline, and a defined delivery process — no surprises."
        actions={(
          <a
            href={bookingUrl || `mailto:${email}` || '/#contact'}
            target={bookingUrl ? '_blank' : '_self'}
            rel={bookingUrl ? 'noopener noreferrer' : undefined}
            className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-5 py-2.5 text-sm font-semibold text-accent hover:bg-accent/20 transition-colors"
          >
            <MessageSquare size={15} /> Book a call
          </a>
        )}
      >
        {services.length === 0 ? (
          <div className="rounded-2xl border border-secondary/50 bg-secondary/20 px-6 py-16 text-center text-text-muted">
            No services are configured yet. Add them in the admin panel under <span className="font-mono text-accent">Services</span>.
          </div>
        ) : (
          <div className="space-y-6">
            {services.map((service, index) => (
              <ServiceFullCard
                key={service.title || index}
                service={service}
                index={index}
                bookingUrl={bookingUrl}
              />
            ))}
          </div>
        )}

        {/* CTA banner */}
        {services.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="mt-10 relative overflow-hidden rounded-3xl border border-accent/20 bg-accent/5 p-8 text-center"
          >
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-48 w-48 rounded-full bg-accent/15 blur-3xl" />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-mono text-accent mb-2 tracking-widest uppercase">Don&apos;t see what you need?</p>
              <h2 className="text-2xl font-bold text-text mb-2">Let&apos;s scope a custom project.</h2>
              <p className="text-text-muted text-sm mb-6 max-w-md mx-auto">
                All pricing is in LKR. I&apos;ll reply within 1–2 business days with a custom quote.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {bookingUrl && (
                  <a href={bookingUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-6 py-3 text-sm font-semibold text-accent hover:bg-accent/20 transition-colors">
                    <CircleDot size={15} /> Book a call
                  </a>
                )}
                {email && (
                  <a href={`mailto:${email}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-primary hover:opacity-90 transition-opacity shadow-[0_4px_20px_rgba(56,189,248,0.25)]">
                    <MessageSquare size={15} /> Email me
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </PageShell>
    </>
  );
};

export default ServicesPage;
