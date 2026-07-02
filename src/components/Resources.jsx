import React from 'react';
import { motion } from 'framer-motion';
import {
  Link as LinkIcon, FileText, Image as ImageIcon, Video,
  Wrench, BookOpen, Layout, File, ExternalLink, Download, ArrowRight,
} from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import { CmsSectionSkeleton } from './CmsShapeSkeleton';

/* ── Type icon map ────────────────────────────────────────── */
const TYPE_CONFIG = {
  Link:          { icon: LinkIcon,    color: 'text-sky-400',    bg: 'bg-sky-400/10',    border: 'border-sky-400/20' },
  PDF:           { icon: FileText,    color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/20' },
  Document:      { icon: File,        color: 'text-amber-400',  bg: 'bg-amber-400/10',  border: 'border-amber-400/20' },
  Image:         { icon: ImageIcon,   color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  Video:         { icon: Video,       color: 'text-pink-400',   bg: 'bg-pink-400/10',   border: 'border-pink-400/20' },
  Tool:          { icon: Wrench,      color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/20' },
  'Cheat Sheet': { icon: BookOpen,    color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
  Template:      { icon: Layout,      color: 'text-teal-400',   bg: 'bg-teal-400/10',   border: 'border-teal-400/20' },
  Other:         { icon: File,        color: 'text-text-muted', bg: 'bg-white/5',        border: 'border-white/10' },
};
const getCfg = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.Other;

/* ── Mini Resource Card ───────────────────────────────────── */
const MiniCard = ({ item, index }) => {
  const cfg = getCfg(item.type);
  const Icon = cfg.icon;
  const actionUrl = item.fileUrl || item.url;

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="group flex flex-col rounded-2xl border border-white/8 bg-secondary/20 overflow-hidden backdrop-blur-md hover:border-white/20 hover:shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-all duration-300"
    >
      {/* Thumbnail */}
      {item.thumbnail && (
        <div className="w-full h-32 overflow-hidden border-b border-white/5 bg-black/45 shrink-0 flex items-center justify-center p-3">
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      <div className="flex flex-col flex-1 p-4">
        {/* Icon + Type */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`p-1.5 rounded-lg border ${cfg.border} ${cfg.bg}`}>
            <Icon size={13} className={cfg.color} />
          </span>
          <span className={`text-[10px] font-mono ${cfg.color}`}>{item.type}</span>
          {item.category && (
            <span className="text-[10px] font-mono text-text-muted/60 ml-auto">{item.category}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-text leading-snug mb-1">{item.title}</h3>

        {/* Author */}
        {item.author && (
          <p className="text-[10px] text-text-muted/60 font-mono mb-2">by {item.author}</p>
        )}

        {/* Description */}
        {item.description && (
          <p className="text-xs text-text-muted leading-relaxed flex-1 line-clamp-2 mb-3">
            {item.description}
          </p>
        )}

        {/* Action */}
        {actionUrl && (
          <a
            href={actionUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={item.fileUrl ? true : undefined}
            className={`mt-auto inline-flex items-center gap-1.5 text-xs font-mono ${cfg.color} hover:underline`}
          >
            {item.fileUrl ? <><Download size={11} /> Download</> : <><ExternalLink size={11} /> Open</>}
          </a>
        )}
      </div>
    </motion.article>
  );
};

/* ── Section ──────────────────────────────────────────────── */
const Resources = () => {
  const { data, loading } = useCmsDoc(CMS_DOCS.resources, { items: [] });
  const allItems = Array.isArray(data?.items) ? data.items : [];

  // Show featured first, then fallback to first 6
  const featured = allItems.filter((i) => i.featured);
  const displayed = (featured.length > 0 ? featured : allItems).slice(0, 6);

  if (loading || data === undefined) {
    return <CmsSectionSkeleton id="resources" titleBlockClass="max-w-xs" />;
  }

  // Hide section entirely if no resources at all
  if (allItems.length === 0) return null;

  return (
    <SectionWrapper id="resources">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center gap-2 text-xl font-bold text-text font-display gradient-text sm:text-2xl md:text-3xl">
          <span className="mr-0 font-mono text-lg text-accent sm:mr-2 sm:text-xl">09.</span>
          <span className="min-w-0 flex-grow">Resources</span>
          <span className="order-3 ml-0 h-px w-full min-w-[60px] flex-grow bg-secondary opacity-50 sm:order-none sm:ml-4 sm:w-auto" />
        </div>

        <p className="text-text-muted text-sm mb-8 max-w-xl">
          Curated tools, books, PDFs, and links I find useful — all in one place.
        </p>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {displayed.map((item, i) => (
            <MiniCard key={item.title || i} item={item} index={i} />
          ))}
        </div>

        {/* View All link */}
        {allItems.length > 6 && (
          <div className="mt-8 flex justify-center">
            <motion.a
              href="/resources"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-6 py-3 text-sm font-semibold text-accent hover:bg-accent/20 transition-colors"
            >
              View all {allItems.length} resources
              <ArrowRight size={15} />
            </motion.a>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
};

export default Resources;
