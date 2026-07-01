import React from 'react';
import { motion } from 'framer-motion';
import {
  Globe, Code2, Layers, Server, BarChart2, Cpu, Cloud,
  Briefcase, CheckCircle2, Clock, ArrowRight, Zap, Star,
  Users, FolderGit2, CircleDot,
} from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import { CmsSectionSkeleton } from './CmsShapeSkeleton';

/* ── Icon resolver ────────────────────────────────────────── */
const ICON_MAP = {
  Globe, Code2, Layers, Server, BarChart2, Cpu, Cloud, Briefcase,
  Monitor: Layers, Database: Server, Layout: Layers, Api: Server,
};
const resolveIcon = (name) => ICON_MAP[name] || Briefcase;

/* ── Category colours ─────────────────────────────────────── */
const CATEGORY_COLORS = {
  'Web Development':    { accent: 'text-sky-400',    bg: 'bg-sky-400/10',    border: 'border-sky-400/20'  },
  'Mobile Development': { accent: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20'},
  'UI/UX Design':       { accent: 'text-pink-400',   bg: 'bg-pink-400/10',   border: 'border-pink-400/20' },
  'API & Backend':      { accent: 'text-amber-400',  bg: 'bg-amber-400/10',  border: 'border-amber-400/20'},
  'Consulting':         { accent: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/20'},
  'Data & Analytics':   { accent: 'text-teal-400',   bg: 'bg-teal-400/10',   border: 'border-teal-400/20' },
  'DevOps':             { accent: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20'},
};
const getColors = (cat) =>
  CATEGORY_COLORS[cat] || { accent: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20' };

/* ── Availability badge ───────────────────────────────────── */
const AvailBadge = ({ status }) => {
  if (!status) return null;
  const map = {
    'Available now':       { dot: 'bg-emerald-400', text: 'text-emerald-300', border: 'border-emerald-400/25', bg: 'bg-emerald-500/10' },
    'Limited availability':{ dot: 'bg-yellow-400',  text: 'text-yellow-300',  border: 'border-yellow-400/25',  bg: 'bg-yellow-500/10' },
    'Booking soon':        { dot: 'bg-blue-400',    text: 'text-blue-300',    border: 'border-blue-400/25',    bg: 'bg-blue-500/10' },
    'Waitlist only':       { dot: 'bg-orange-400',  text: 'text-orange-300',  border: 'border-orange-400/25',  bg: 'bg-orange-500/10' },
    'Unavailable':         { dot: 'bg-red-400',     text: 'text-red-300',     border: 'border-red-400/25',     bg: 'bg-red-500/10' },
  };
  const c = map[status] || map['Available now'];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${c.border} ${c.bg} px-2.5 py-0.5 text-[10px] font-mono ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot} animate-pulse`} />
      {status}
    </span>
  );
};

/* ── Service Card ─────────────────────────────────────────── */
const ServiceCard = ({ service, index, bookingUrl }) => {
  const colors       = getColors(service.category);
  const IconComp     = resolveIcon(service.icon);
  const features     = Array.isArray(service.features)     ? service.features     : [];
  const tags         = Array.isArray(service.tags)         ? service.tags         : [];
  const processSteps = Array.isArray(service.processSteps) ? service.processSteps : [];
  const ctaHref      = service.link || bookingUrl || '/#contact';
  const ctaLabel     = service.cta  || 'Start a project';

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      whileHover={{ y: -5 }}
      className={`group relative flex flex-col rounded-3xl border ${colors.border} bg-secondary/20 backdrop-blur-md hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-all duration-300 overflow-hidden`}
    >
      {/* Glow blob */}
      <div className={`pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full ${colors.bg} blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-500`} />

      {/* ── Card Header ── */}
      <div className="relative p-5 pb-0">
        {/* Top row: icon + featured/availability */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className={`shrink-0 rounded-2xl border ${colors.border} ${colors.bg} p-3`}>
            {React.createElement(IconComp, { size: 22, className: colors.accent })}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {service.featured && (
              <span className="inline-flex items-center gap-1 rounded-full border border-yellow-400/25 bg-yellow-400/10 px-2.5 py-0.5 text-[10px] font-mono text-yellow-300">
                <Star size={9} fill="currentColor" /> Featured
              </span>
            )}
            <AvailBadge status={service.availability} />
          </div>
        </div>

        {/* Title + category */}
        <h3 className="text-lg font-bold text-text leading-snug mb-0.5">{service.title}</h3>
        {service.category && (
          <span className={`text-[10px] font-mono ${colors.accent}`}>{service.category}</span>
        )}
      </div>

      {/* ── Card Body ── */}
      <div className="flex flex-col flex-1 p-5 pt-4 gap-4">

        {/* Summary */}
        <p className="text-sm leading-relaxed text-text-muted">{service.summary}</p>

        {/* Price + Timeline strip */}
        {(service.startingPrice || service.timeline || service.turnaround) && (
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/6 bg-primary/40 p-3 text-xs">
            {service.startingPrice && (
              <div className="col-span-2 flex items-center gap-2">
                <span className={`text-[10px] font-mono uppercase tracking-wider ${colors.accent}`}>Price</span>
                <span className="font-bold text-text">{service.startingPrice}</span>
              </div>
            )}
            {service.timeline && (
              <div className="flex items-center gap-1.5 text-text-muted">
                <Clock size={11} className={colors.accent} />
                <span>{service.timeline}</span>
              </div>
            )}
            {service.turnaround && (
              <div className="flex items-center gap-1.5 text-text-muted">
                <Zap size={11} className={colors.accent} />
                <span>{service.turnaround}</span>
              </div>
            )}
          </div>
        )}

        {/* What's included */}
        {features.length > 0 && (
          <div>
            <p className={`text-[10px] font-mono font-semibold uppercase tracking-wider ${colors.accent} mb-2`}>
              What&apos;s included
            </p>
            <ul className="space-y-1.5">
              {features.slice(0, 6).map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-text-muted">
                  <CheckCircle2 size={12} className={`${colors.accent} mt-0.5 shrink-0`} />
                  <span>{f}</span>
                </li>
              ))}
              {features.length > 6 && (
                <li className={`text-[10px] font-mono ${colors.accent} pl-5`}>+ {features.length - 6} more</li>
              )}
            </ul>
          </div>
        )}

        {/* Process steps */}
        {processSteps.length > 0 && (
          <div>
            <p className={`text-[10px] font-mono font-semibold uppercase tracking-wider ${colors.accent} mb-2`}>
              How it works
            </p>
            <ol className="space-y-2">
              {processSteps.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-text-muted">
                  <span className={`shrink-0 w-4 h-4 rounded-full border ${colors.border} ${colors.bg} flex items-center justify-center text-[9px] font-bold font-mono ${colors.accent}`}>
                    {i + 1}
                  </span>
                  <div>
                    {s.step && <span className="font-semibold text-text">{s.step}</span>}
                    {s.step && s.description && <span className="text-text-muted"> — </span>}
                    {s.description && <span>{s.description}</span>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Tech tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 6).map((tag) => (
              <span key={tag} className={`rounded-full border px-2 py-0.5 text-[10px] font-mono ${colors.border} ${colors.bg} ${colors.accent}`}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Ideal for */}
        {service.idealFor && (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Users size={11} className={colors.accent} />
            <span><span className="font-semibold text-text">Ideal for:</span> {service.idealFor}</span>
          </div>
        )}

        {/* Related project */}
        {service.relatedProject && (
          <a href="/projects" className={`inline-flex items-center gap-1.5 text-[11px] font-mono ${colors.accent} hover:underline`}>
            <FolderGit2 size={12} />
            See example: {service.relatedProject}
          </a>
        )}

        {/* Templates (Optional) */}
        {Array.isArray(service.templates) && service.templates.length > 0 && (
          <div className="mt-2 border-t border-white/6 pt-3">
            <p className={`text-[10px] font-mono font-semibold uppercase tracking-wider ${colors.accent} mb-2`}>
              Available Templates ({service.templates.length})
            </p>
            <div className="space-y-2">
              {service.templates.map((tpl, ti) => {
                const contactLink = `/#contact?projectType=${encodeURIComponent(service.category || 'Website')}&message=${encodeURIComponent(`I would like to start a project based on the template: ${tpl.name}`)}`;
                return (
                  <div key={ti} className="rounded-xl border border-white/6 bg-primary/45 p-2.5 flex flex-col gap-2 hover:border-white/12 transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="text-xs font-semibold text-text">{tpl.name}</p>
                        {tpl.vibe && <p className="text-[10px] text-accent/80 font-mono mt-0.5">{tpl.vibe}</p>}
                      </div>
                    </div>
                    {tpl.description && <p className="text-[11px] text-text-muted leading-relaxed">{tpl.description}</p>}
                    <div className="flex gap-2">
                      {tpl.demoUrl && (
                        <a
                          href={tpl.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center py-1 rounded bg-white/5 border border-white/8 text-[10px] font-mono text-text-muted hover:text-text hover:bg-white/10 transition-colors"
                        >
                          Live Demo
                        </a>
                      )}
                      <a
                        href={contactLink}
                        className={`flex-1 text-center py-1 rounded border ${colors.border} ${colors.bg} text-[10px] font-mono ${colors.accent} hover:opacity-90 transition-opacity`}
                      >
                        Select
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <a
          href={ctaHref}
          target={ctaHref.startsWith('http') ? '_blank' : '_self'}
          rel={ctaHref.startsWith('http') ? 'noopener noreferrer' : undefined}
          className={`mt-auto inline-flex items-center justify-center gap-2 rounded-xl border ${colors.border} ${colors.bg} px-4 py-3 text-sm font-bold ${colors.accent} hover:opacity-80 transition-opacity group/cta`}
        >
          {ctaLabel}
          <ArrowRight size={14} className="group-hover/cta:translate-x-1 transition-transform" />
        </a>
      </div>
    </motion.article>
  );
};

/* ── Section ──────────────────────────────────────────────── */
const Services = () => {
  const { data, loading } = useCmsDoc(CMS_DOCS.services, { items: [] });
  const { data: siteDoc } = useCmsDoc(CMS_DOCS.site, null);

  const allServices = Array.isArray(data?.items) ? data.items : [];
  const published   = allServices.filter(s => s.status !== 'Draft');

  if (loading) return <CmsSectionSkeleton id="services" />;
  if (published.length === 0) return null;

  const bookingUrl = siteDoc?.bookingUrl || import.meta.env.VITE_BOOKING_URL || '';

  return (
    <SectionWrapper id="services">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">

        {/* Header */}
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xl font-bold text-text font-display gradient-text sm:text-2xl md:text-3xl">
          <span className="mr-0 font-mono text-lg text-accent sm:mr-2 sm:text-xl">07.</span>
          <span className="min-w-0 flex-grow">Services</span>
          <span className="order-3 ml-0 h-px w-full min-w-[60px] flex-grow bg-secondary opacity-50 sm:order-none sm:ml-4 sm:w-auto" />
        </div>

        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <p className="text-text-muted text-sm max-w-xl">
            What I build and how I can help. Every service comes with a clear scope, timeline, and LKR pricing.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {published.slice(0, 3).map((service, i) => (
            <ServiceCard key={service.title || i} service={service} index={i} bookingUrl={bookingUrl} />
          ))}
        </div>

        {/* Prominent View All Services Button */}
        {published.length > 3 && (
          <div className="mt-8 flex justify-center">
            <a
              href="/services"
              className="inline-flex items-center gap-2 rounded-xl border border-accent/20 bg-accent/5 px-6 py-3.5 text-sm font-mono text-accent hover:bg-accent/10 transition-colors"
            >
              View all services ({published.length}) <ArrowRight size={15} />
            </a>
          </div>
        )}

        {/* Bottom CTA bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-white/8 bg-secondary/20 px-6 py-5 backdrop-blur-md"
        >
          <div>
            <p className="font-semibold text-text mb-0.5">Need a custom scope or budget?</p>
            <p className="text-sm text-text-muted">All prices are in LKR. Let&apos;s talk and find the right fit for your project.</p>
          </div>
          <a
            href={bookingUrl || '/#contact'}
            target={bookingUrl ? '_blank' : '_self'}
            rel={bookingUrl ? 'noopener noreferrer' : undefined}
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-primary hover:opacity-90 transition-opacity shadow-[0_4px_20px_rgba(56,189,248,0.2)]"
          >
            <CircleDot size={15} /> Start a conversation
          </a>
        </motion.div>

      </div>
    </SectionWrapper>
  );
};

export default Services;
