import React from 'react';
import { motion } from 'framer-motion';
import {
  Globe, Code2, Layers, Server, BarChart2, Cpu, Cloud,
  Briefcase, CheckCircle2, Clock, ArrowRight, Zap, Star,
} from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import { CmsSectionSkeleton } from './CmsShapeSkeleton';

/* ── Icon resolver (Lucide name → component) ──────────────── */
const ICON_MAP = {
  Globe, Code2, Layers, Server, BarChart2, Cpu, Cloud,
  Briefcase, Globe2: Globe, Monitor: Layers, Database: Server,
  Layout: Layers, Api: Server, Consulting: Briefcase,
};
const resolveIcon = (name) => ICON_MAP[name] || Briefcase;

/* ── Category colour map ──────────────────────────────────── */
const CATEGORY_COLORS = {
  'Web Development':    { accent: 'text-sky-400',    bg: 'bg-sky-400/10',    border: 'border-sky-400/20',    glow: 'shadow-sky-400/10' },
  'Mobile Development': { accent: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', glow: 'shadow-purple-400/10' },
  'UI/UX Design':       { accent: 'text-pink-400',   bg: 'bg-pink-400/10',   border: 'border-pink-400/20',   glow: 'shadow-pink-400/10' },
  'API & Backend':      { accent: 'text-amber-400',  bg: 'bg-amber-400/10',  border: 'border-amber-400/20',  glow: 'shadow-amber-400/10' },
  'Consulting':         { accent: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/20',  glow: 'shadow-green-400/10' },
  'Data & Analytics':   { accent: 'text-teal-400',   bg: 'bg-teal-400/10',   border: 'border-teal-400/20',   glow: 'shadow-teal-400/10' },
  'DevOps':             { accent: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20', glow: 'shadow-orange-400/10' },
};
const getColors = (cat) =>
  CATEGORY_COLORS[cat] || { accent: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20', glow: 'shadow-accent/10' };

/* ── Service Card ─────────────────────────────────────────── */
const ServiceCard = ({ service, index, bookingUrl }) => {
  const colors   = getColors(service.category);
  const IconComp = resolveIcon(service.icon);
  const features = Array.isArray(service.features) ? service.features : [];
  const tags     = Array.isArray(service.tags) ? service.tags : [];
  const ctaHref  = service.link || bookingUrl || '/#contact';
  const ctaLabel = service.cta || 'Start a project';

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      whileHover={{ y: -4 }}
      className={`group relative flex flex-col rounded-3xl border ${colors.border} bg-secondary/20 p-6 backdrop-blur-md hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 overflow-hidden`}
    >
      {/* Glow blob on hover */}
      <div className={`pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full ${colors.bg} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      {/* Featured badge */}
      {service.featured && (
        <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full border border-yellow-400/25 bg-yellow-400/10 px-2.5 py-0.5 text-[10px] font-mono text-yellow-300">
          <Star size={9} fill="currentColor" /> Featured
        </span>
      )}

      {/* Icon + Category */}
      <div className="mb-4 flex items-start gap-3">
        <div className={`shrink-0 rounded-2xl border ${colors.border} ${colors.bg} p-3`}>
          {React.createElement(IconComp, { size: 24, className: colors.accent })}
        </div>
        <div className="flex-1 pt-0.5">
          <h3 className="text-lg font-bold text-text leading-tight mb-0.5">{service.title}</h3>
          {service.category && (
            <span className={`text-[10px] font-mono ${colors.accent}`}>{service.category}</span>
          )}
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm leading-relaxed text-text-muted mb-4 flex-1">{service.summary}</p>

      {/* What's included */}
      {features.length > 0 && (
        <ul className="mb-4 space-y-1.5">
          {features.slice(0, 5).map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-text-muted">
              <CheckCircle2 size={12} className={`${colors.accent} mt-0.5 shrink-0`} />
              <span>{f}</span>
            </li>
          ))}
          {features.length > 5 && (
            <li className={`text-[10px] font-mono ${colors.accent} pl-5`}>+ {features.length - 5} more</li>
          )}
        </ul>
      )}

      {/* Timeline + Price meta row */}
      {(service.timeline || service.startingPrice || service.turnaround) && (
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/6 bg-primary/30 p-3 text-xs">
          {service.timeline && (
            <div className="flex items-center gap-1.5 text-text-muted">
              <Clock size={11} className={colors.accent} />
              <span>{service.timeline}</span>
            </div>
          )}
          {service.startingPrice && (
            <div className="flex items-center gap-1.5 text-text-muted">
              <Zap size={11} className={colors.accent} />
              <span>{service.startingPrice}</span>
            </div>
          )}
          {service.turnaround && (
            <div className="col-span-2 flex items-center gap-1.5 text-text-muted">
              <Cpu size={11} className={colors.accent} />
              <span>{service.turnaround}</span>
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {tags.slice(0, 5).map((tag) => (
            <span key={tag} className={`rounded-full border px-2 py-0.5 text-[10px] font-mono ${colors.border} ${colors.bg} ${colors.accent}`}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* CTA */}
      <a
        href={ctaHref}
        target={ctaHref.startsWith('http') ? '_blank' : '_self'}
        rel={ctaHref.startsWith('http') ? 'noopener noreferrer' : undefined}
        className={`mt-auto inline-flex items-center gap-2 rounded-xl border ${colors.border} ${colors.bg} px-4 py-2.5 text-sm font-semibold ${colors.accent} hover:opacity-80 transition-opacity`}
      >
        {ctaLabel}
        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </a>
    </motion.article>
  );
};

/* ── Section ──────────────────────────────────────────────── */
const Services = () => {
  const { data, loading }       = useCmsDoc(CMS_DOCS.services, { items: [] });
  const { data: siteDoc }       = useCmsDoc(CMS_DOCS.site, null);

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
            What I build and how I can help. Every service is scoped, timed, and delivered with clear communication.
          </p>
          {published.length > 3 && (
            <a href="/services" className="shrink-0 inline-flex items-center gap-1.5 text-sm font-mono text-accent hover:underline">
              View all services <ArrowRight size={13} />
            </a>
          )}
        </div>

        {/* Cards grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {published.slice(0, 6).map((service, i) => (
            <ServiceCard
              key={service.title || i}
              service={service}
              index={i}
              bookingUrl={bookingUrl}
            />
          ))}
        </div>

        {/* Bottom CTA bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-white/8 bg-secondary/20 px-6 py-5 backdrop-blur-md"
        >
          <div>
            <p className="font-semibold text-text mb-0.5">Looking for something specific?</p>
            <p className="text-sm text-text-muted">Let&apos;s talk about your project scope and timeline.</p>
          </div>
          <a
            href={bookingUrl || '/#contact'}
            target={bookingUrl ? '_blank' : '_self'}
            rel={bookingUrl ? 'noopener noreferrer' : undefined}
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-primary hover:opacity-90 transition-opacity shadow-[0_4px_20px_rgba(var(--color-accent-rgb,56,189,248)/0.25)]"
          >
            Start a conversation <ArrowRight size={15} />
          </a>
        </motion.div>

      </div>
    </SectionWrapper>
  );
};

export default Services;
