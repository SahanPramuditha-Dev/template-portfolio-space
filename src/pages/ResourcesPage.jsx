import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link as LinkIcon, Tag, ExternalLink, FileText, Image as ImageIcon,
  Video, Wrench, BookOpen, Layout, File, Star, Search, Download, X,
  User, Calendar,
} from 'lucide-react';
import SEO from '../components/SEO';
import PageShell from '../components/PageShell';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import PageLoader from '../components/PageLoader';
import GlowCard from '../components/GlowCard';

/* ── Type config ──────────────────────────────────────────── */
const TYPE_CONFIG = {
  Link:        { icon: LinkIcon,    color: 'text-sky-400',    bg: 'bg-sky-400/10',    border: 'border-sky-400/25' },
  PDF:         { icon: FileText,    color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/25' },
  Document:    { icon: File,        color: 'text-amber-400',  bg: 'bg-amber-400/10',  border: 'border-amber-400/25' },
  Image:       { icon: ImageIcon,   color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/25' },
  Video:       { icon: Video,       color: 'text-pink-400',   bg: 'bg-pink-400/10',   border: 'border-pink-400/25' },
  Tool:        { icon: Wrench,      color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/25' },
  'Cheat Sheet': { icon: BookOpen,  color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/25' },
  Template:    { icon: Layout,      color: 'text-teal-400',   bg: 'bg-teal-400/10',   border: 'border-teal-400/25' },
  Other:       { icon: File,        color: 'text-text-muted', bg: 'bg-white/5',        border: 'border-white/10' },
};
const getTypeConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.Other;

/* ── Image Lightbox ───────────────────────────────────────── */
const ImageLightbox = ({ url, title, onClose }) => (
  <AnimatePresence>
    {url && (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="relative max-w-4xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-white truncate">{title}</p>
            <div className="flex gap-2">
              <a href={url} download target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-mono text-accent border border-accent/30 bg-accent/10 px-3 py-1.5 rounded-lg hover:bg-accent/20 transition-colors">
                <Download size={12} /> Download
              </a>
              <button onClick={onClose} className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>
          <img src={url} alt={title} className="w-full max-h-[80vh] object-contain rounded-2xl border border-white/10" />
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ── PDF / Doc Viewer ─────────────────────────────────────── */
const FileViewer = ({ url, title, onClose }) => (
  <AnimatePresence>
    {url && (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 16 }}
          className="relative w-full max-w-4xl flex flex-col rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
          style={{ maxHeight: '92vh', background: 'rgba(8,12,30,0.98)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-white/8 bg-white/4 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <FileText size={15} className="text-accent shrink-0" />
              <span className="text-sm font-semibold text-white truncate">{title}</span>
            </div>
            <div className="flex gap-2 shrink-0">
              <a href={url} download target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-accent border border-accent/30 bg-accent/10 px-3 py-1.5 rounded-lg hover:bg-accent/20 transition-colors">
                <Download size={12} /> Download
              </a>
              <a href={url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-white/50 border border-white/10 bg-white/5 px-3 py-1.5 rounded-lg hover:text-white transition-colors">
                <ExternalLink size={12} /> Open
              </a>
              <button onClick={onClose} className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-white/50 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>
          <iframe src={url} title={title} className="flex-1 w-full" style={{ height: '80vh', border: 'none' }} />
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ── Resource Card ────────────────────────────────────────── */
const ResourceCard = ({ item, index, onPreview }) => {
  const cfg = getTypeConfig(item.type);
  const Icon = cfg.icon;
  const effectiveUrl = item.fileUrl || item.url;
  const isPreviewable = ['PDF', 'Document', 'Image'].includes(item.type) && item.fileUrl;
  const isVideo = item.type === 'Video' && item.fileUrl;

  return (
    <GlowCard
      index={index}
      className="group flex flex-col h-full border-white/8"
      style={{ borderRadius: '1rem' }}
    >
      <div className="flex flex-col h-full">
      {/* Thumbnail / Video Preview */}
      {item.thumbnail && (
        <div className="w-full h-40 overflow-hidden border-b border-white/5 bg-black/45 shrink-0 flex items-center justify-center p-4">
          <img src={item.thumbnail} alt={item.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
        </div>
      )}
      {isVideo && !item.thumbnail && (
        <div className="w-full overflow-hidden border-b border-white/5 shrink-0">
          <video src={item.fileUrl} controls className="w-full max-h-48 bg-black" />
        </div>
      )}

      <div className="flex flex-col flex-1 p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`p-2.5 rounded-xl border ${cfg.border} ${cfg.bg} shrink-0`}>
            <Icon size={18} className={cfg.color} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-text leading-tight">{item.title}</h2>
              {item.featured && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border border-yellow-400/30 text-yellow-300 bg-yellow-400/10">
                  <Star size={9} fill="currentColor" /> Featured
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${cfg.border} ${cfg.bg} ${cfg.color}`}>
                {item.type}
              </span>
              {item.category && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/10 text-text-muted">
                  <Tag size={9} /> {item.category}
                </span>
              )}
            </div>
            {/* Author */}
            {item.author && (
              <p className="flex items-center gap-1 text-[10px] font-mono text-text-muted mt-1.5">
                <User size={9} className="shrink-0" /> {item.author}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-sm leading-relaxed text-text-muted flex-1 mb-4">{item.description}</p>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 mt-auto pt-3 border-t border-white/5">
          {isPreviewable && (
            <button
              onClick={() => onPreview(item)}
              className={`inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg border ${cfg.border} ${cfg.bg} ${cfg.color} hover:opacity-80 transition-opacity`}
            >
              {item.type === 'Image' ? <ImageIcon size={12} /> : <FileText size={12} />}
              {item.type === 'Image' ? 'View Image' : 'Preview'}
            </button>
          )}
          {item.fileUrl && (
            <a href={item.fileUrl} download target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-text-muted hover:text-text hover:border-white/20 transition-colors">
              <Download size={12} /> Download
            </a>
          )}
          {item.url && (
            <a href={item.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-accent hover:underline">
              Open link <ExternalLink size={11} />
            </a>
          )}
          {!effectiveUrl && (
            <span className="text-xs text-text-muted/50 font-mono italic">No file attached</span>
          )}
          {/* Date */}
          {item.date && (
            <span className="ml-auto flex items-center gap-1 text-[10px] font-mono text-text-muted/50">
              <Calendar size={9} /> {item.date}
            </span>
          )}
        </div>
      </div>
      </div>
    </GlowCard>
  );
};

/* ── Main Page ────────────────────────────────────────────── */
const ResourcesPage = () => {
  const { data, loading } = useCmsDoc(CMS_DOCS.resources, { items: [] });
  // Normalize: handle null doc (not yet created), missing items array, or array with objects
  const items = Array.isArray(data?.items) ? data.items : [];

  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState(null); // { item }

  const types = useMemo(() => {
    const t = new Set(items.map((i) => i.type).filter(Boolean));
    return ['All', ...Object.keys(TYPE_CONFIG).filter((k) => t.has(k))];
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((i) => activeFilter === 'All' || i.type === activeFilter)
      .filter((i) => !q || i.title?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q) || i.category?.toLowerCase().includes(q))
      .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }, [items, activeFilter, search]);

  const handlePreview = (item) => setPreview(item);
  const closePreview = () => setPreview(null);

  if (loading) {
    return (
      <>
        <SEO title="Resources | Sahan Pramuditha" description="Curated tools, PDFs, templates, and links." canonicalPath="/resources" />
        <PageLoader text="Loading resources" subtext="Fetching templates & files..." />
      </>
    );
  }

  return (
    <>
      <SEO
        title="Resources | Sahan Pramuditha"
        description="Curated tools, PDFs, templates, cheat sheets, and links worth keeping nearby."
        canonicalPath="/resources"
      />
      <PageShell
        eyebrow="Curated Resources"
        title="Resources worth keeping nearby."
        description="Tools, PDFs, cheat sheets, templates, and links — everything useful in one place."
      >
        {/* Search + Filter */}
        {items.length > 0 && (
          <div className="mb-8 space-y-4">
            {/* Search */}
            <div className="relative max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search resources…"
                className="w-full rounded-xl border border-white/10 bg-secondary/30 py-2.5 pl-9 pr-4 text-sm text-text outline-none placeholder:text-text-muted/50 focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
              />
            </div>
            {/* Type Filters */}
            <div className="flex flex-wrap gap-2">
              {types.map((t) => {
                const cfg = t === 'All' ? null : getTypeConfig(t);
                const Icon = cfg?.icon;
                return (
                  <button
                    key={t}
                    onClick={() => setActiveFilter(t)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                      activeFilter === t
                        ? 'bg-accent text-primary font-semibold shadow-[0_0_12px_rgb(var(--color-accent-rgb)/0.3)]'
                        : 'border border-white/10 text-text-muted hover:border-white/20 hover:text-text'
                    }`}
                  >
                    {Icon && <Icon size={11} />}
                    {t} {t !== 'All' && `(${items.filter((i) => i.type === t).length})`}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Grid */}
        {items.length === 0 ? (
          <div className="rounded-2xl border border-secondary/50 bg-secondary/20 px-6 py-20 text-center text-text-muted">
            <FileText size={32} className="mx-auto mb-4 opacity-30" />
            <p className="text-sm">No resources added yet.</p>
            <p className="text-xs mt-1 opacity-60">Add links, PDFs, images, and documents in the admin panel.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-secondary/50 bg-secondary/20 px-6 py-16 text-center text-text-muted text-sm">
            No resources match your search.
          </div>
        ) : (
          <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filtered.map((item, index) => (
                <ResourceCard key={item.title || index} item={item} index={index} onPreview={handlePreview} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </PageShell>

      {/* Modals */}
      {preview?.type === 'Image' && (
        <ImageLightbox url={preview.fileUrl} title={preview.title} onClose={closePreview} />
      )}
      {(preview?.type === 'PDF' || preview?.type === 'Document') && (
        <FileViewer url={preview.fileUrl} title={preview.title} onClose={closePreview} />
      )}
    </>
  );
};

export default ResourcesPage;
