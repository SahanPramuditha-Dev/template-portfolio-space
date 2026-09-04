import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ExternalLink,
  Calendar,
  Search,
  Star,
  Award,
  Layers,
  Zap,
  Eye,
  X,
  Sparkles,
  CheckCircle2,
  Filter,
  Camera,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Users,
  BookOpen,
} from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import { CmsSectionSkeleton } from './CmsShapeSkeleton';
import AnimatedCounter from './AnimatedCounter';

/* ─── Platform Styling Palette ──────────────────────────────── */
const getPlatformColor = (issuer = '') => {
  const norm = (issuer || '').toLowerCase();
  if (norm.includes('mongo')) return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', glow: 'rgba(16, 185, 129, 0.25)', badgeBorder: 'border-emerald-500/40' };
  if (norm.includes('google') || norm.includes('gcp')) return { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'rgba(59, 130, 246, 0.25)', badgeBorder: 'border-blue-500/40' };
  if (norm.includes('aws') || norm.includes('amazon')) return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', glow: 'rgba(245, 158, 11, 0.25)', badgeBorder: 'border-amber-500/40' };
  if (norm.includes('microsoft') || norm.includes('azure')) return { bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-400', glow: 'rgba(14, 165, 233, 0.25)', badgeBorder: 'border-sky-500/40' };
  if (norm.includes('postman')) return { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', glow: 'rgba(249, 115, 22, 0.25)', badgeBorder: 'border-orange-500/40' };
  if (norm.includes('github') || norm.includes('git')) return { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'rgba(168, 85, 247, 0.25)', badgeBorder: 'border-purple-500/40' };
  return { bg: 'bg-accent/10', border: 'border-accent/30', text: 'text-accent', glow: 'rgba(56, 189, 248, 0.25)', badgeBorder: 'border-accent/40' };
};

/* ─── Badge Preview Modal ────────────────────────────────────── */
const BadgePreviewModal = ({ badge, onClose }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const closeButtonRef = useRef(null);
  const theme = getPlatformColor(badge?.issuer);

  // Normalize all photos into structured objects: { url, caption, isPrimary }
  const galleryItems = useMemo(() => {
    if (!badge) return [];
    const items = [];
    if (badge.image) {
      items.push({ url: badge.image, caption: 'Official Credential / Badge', isPrimary: true });
    }
    if (badge.eventPhoto && badge.eventPhoto !== badge.image) {
      items.push({ url: badge.eventPhoto, caption: 'Event Attendance', isPrimary: false });
    }
    if (Array.isArray(badge.eventGallery)) {
      badge.eventGallery.forEach((item) => {
        if (item?.url && !items.some((i) => i.url === item.url)) {
          items.push({ url: item.url, caption: item.caption || 'Event Moment', isPrimary: false });
        }
      });
    }
    return items;
  }, [badge]);

  const currentItem = galleryItems[selectedImage] || galleryItems[0] || null;

  // Handle modal lock and custom modal-toggle event for Lenis smooth scrolling
  useEffect(() => {
    if (!badge) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.dispatchEvent(new CustomEvent('modal-toggle', { detail: { isOpen: true } }));
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (lightboxOpen) setLightboxOpen(false);
        else onClose();
      } else if (event.key === 'ArrowRight' && galleryItems.length > 1) {
        setSelectedImage((prev) => (prev + 1) % galleryItems.length);
      } else if (event.key === 'ArrowLeft' && galleryItems.length > 1) {
        setSelectedImage((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      window.dispatchEvent(new CustomEvent('modal-toggle', { detail: { isOpen: false } }));
    };
  }, [badge, onClose, galleryItems.length, lightboxOpen]);

  useEffect(() => {
    setSelectedImage(0);
    setImgFailed(false);
    setLightboxOpen(false);
  }, [badge]);

  const modal = (
    <AnimatePresence>
      {badge && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] grid place-items-center overflow-y-auto p-3 sm:p-6"
          style={{ backgroundColor: 'rgba(5, 8, 22, 0.90)', backdropFilter: 'blur(16px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="badge-preview-title"
            className="relative my-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-accent/30 bg-[#080d1a] shadow-[0_0_60px_rgba(0,0,0,0.9)] ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-white/10 bg-secondary/30 backdrop-blur-md">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`p-1.5 rounded-lg border ${theme.bg} ${theme.border} ${theme.text}`}>
                  <ShieldCheck size={18} />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-mono font-bold uppercase tracking-wider text-text truncate">
                    {badge.issuer} {badge.type ? `• ${badge.type}` : 'Verified Credential'}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                ref={closeButtonRef}
                aria-label="Close badge details"
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-text-muted hover:text-text hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <X size={17} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="max-h-[calc(100vh-8rem)] overflow-y-auto p-5 sm:p-7 custom-scrollbar">
              <div className="grid gap-7 lg:grid-cols-[minmax(0,1.2fr)_17rem] items-start">
                {/* Left side: Information, Takeaways, Skills */}
                <section className="order-2 text-left lg:order-1 flex flex-col justify-between">
                  <div>
                    {/* Tags row */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border ${theme.bg} ${theme.border} ${theme.text}`}>
                        <CheckCircle2 size={13} /> {badge.issuer}
                      </span>
                      {badge.type && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-white/5 border border-white/10 text-text-muted">
                          {badge.type}
                        </span>
                      )}
                      {badge.category && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-mono text-accent/80 bg-accent/5 border border-accent/20">
                          {badge.category}
                        </span>
                      )}
                    </div>

                    <h3 id="badge-preview-title" className="text-xl sm:text-2xl font-extrabold text-text mb-3 leading-snug tracking-tight">
                      {badge.title}
                    </h3>

                    {badge.issueDate && (
                      <p className="text-xs text-text-muted font-mono mb-4 flex items-center gap-2">
                        <Calendar size={13} className="text-accent shrink-0" />
                        <span>Earned / Attended: <strong className="text-text font-normal">{badge.issueDate}</strong></span>
                      </p>
                    )}

                    {/* Description / Takeaways Note */}
                    {badge.description && (
                      <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent to-accent/20" />
                        <h4 className="text-[11px] font-mono uppercase tracking-wider text-accent font-semibold mb-1.5">
                          Highlights & Takeaways
                        </h4>
                        <p className="text-xs sm:text-sm text-text-muted leading-relaxed whitespace-pre-line">
                          {badge.description}
                        </p>
                      </div>
                    )}

                    {/* Skills Covered */}
                    {Array.isArray(badge.skills) && badge.skills.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2.5">
                          Skills & Competencies Verified
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {badge.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-mono text-slate-300 hover:border-accent/40 transition-colors"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
                    {badge.link ? (
                      <a
                        href={badge.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-mono font-bold text-primary shadow-[0_0_25px_rgb(var(--color-accent-rgb)/0.35)] transition-all hover:bg-accent/90 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Verify Credential <ExternalLink size={14} />
                      </a>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl">
                        <CheckCircle2 size={14} /> Verified Participation
                      </div>
                    )}

                    {currentItem && (
                      <button
                        type="button"
                        onClick={() => setLightboxOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-mono text-text hover:bg-white/10 hover:border-white/25 transition-all"
                      >
                        <Maximize2 size={13} className="text-accent" /> Full Image
                      </button>
                    )}
                  </div>
                </section>

                {/* Right side: Adaptive Image Display & Gallery */}
                <section className="order-1 flex flex-col items-center lg:order-2 w-full">
                  <div className="w-full flex items-center justify-between mb-2 px-1">
                    <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-text-muted">
                      {selectedImage === 0 && currentItem?.isPrimary ? 'Credential Badge' : `Photo ${selectedImage + 1} of ${galleryItems.length}`}
                    </span>
                    {galleryItems.length > 1 && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedImage((prev) => (prev - 1 + galleryItems.length) % galleryItems.length)}
                          className="p-1 rounded-md border border-white/10 bg-white/5 text-text-muted hover:text-text hover:bg-white/10 transition-colors"
                          aria-label="Previous image"
                        >
                          <ChevronLeft size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedImage((prev) => (prev + 1) % galleryItems.length)}
                          className="p-1 rounded-md border border-white/10 bg-white/5 text-text-muted hover:text-text hover:bg-white/10 transition-colors"
                          aria-label="Next image"
                        >
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Adaptive Showcase Container */}
                  <div
                    onClick={() => currentItem?.url && setLightboxOpen(true)}
                    className="group relative w-full h-[260px] sm:h-[300px] rounded-2xl bg-gradient-to-b from-white/[0.04] to-black/60 border border-white/10 flex items-center justify-center p-3 cursor-pointer overflow-hidden shadow-2xl transition-all hover:border-accent/50"
                  >
                    {currentItem?.url && !imgFailed ? (
                      <img
                        src={currentItem.url}
                        alt={badge.title}
                        onError={() => setImgFailed(true)}
                        className="max-w-full max-h-full object-contain rounded-lg drop-shadow-[0_12px_28px_rgba(0,0,0,0.7)] group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className={`w-24 h-24 rounded-2xl border ${theme.bg} ${theme.border} flex flex-col items-center justify-center ${theme.text} shadow-inner`}>
                        <ShieldCheck size={42} />
                        <span className="text-[10px] font-mono mt-1 opacity-80">{badge.issuer}</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-mono">
                      <Maximize2 size={14} className="text-accent" /> Click to enlarge
                    </div>
                  </div>

                  {currentItem?.caption && (
                    <p className="mt-2 text-center text-[11px] font-mono text-text-muted/80 truncate w-full px-2">
                      {currentItem.caption}
                    </p>
                  )}

                  {/* Gallery Thumbnails Strip */}
                  {galleryItems.length > 1 && (
                    <div className="mt-3.5 w-full flex items-center gap-2 overflow-x-auto pb-1 px-1 custom-scrollbar" aria-label="Badge and event images">
                      {galleryItems.map((item, index) => (
                        <button
                          key={item.url}
                          type="button"
                          onClick={() => {
                            setImgFailed(false);
                            setSelectedImage(index);
                          }}
                          className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                            selectedImage === index
                              ? 'border-accent shadow-[0_0_12px_rgb(var(--color-accent-rgb)/0.4)] scale-105 ring-2 ring-accent/30'
                              : 'border-white/15 opacity-70 hover:opacity-100 hover:border-white/30'
                          }`}
                          aria-label={item.caption || `Image ${index + 1}`}
                        >
                          <img src={item.url} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>
          </motion.div>

          {/* Fullscreen Lightbox Overlay */}
          <AnimatePresence>
            {lightboxOpen && currentItem?.url && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-black/95 p-4 backdrop-blur-md"
                onClick={() => setLightboxOpen(false)}
              >
                <div className="absolute top-4 right-4 flex items-center gap-3">
                  <a
                    href={currentItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-white/20 bg-white/10 p-2 text-white hover:bg-white/20"
                    onClick={(e) => e.stopPropagation()}
                    title="Open original"
                  >
                    <ExternalLink size={16} />
                  </a>
                  <button
                    onClick={() => setLightboxOpen(false)}
                    className="rounded-lg border border-white/20 bg-white/10 p-2 text-white hover:bg-white/20"
                    aria-label="Close lightbox"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="relative max-w-5xl max-h-[85vh] p-2 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                  <img
                    src={currentItem.url}
                    alt={badge.title}
                    className="max-w-full max-h-[82vh] object-contain rounded-xl shadow-2xl"
                  />
                </div>
                {currentItem.caption && (
                  <p className="mt-3 text-sm font-mono text-slate-300 text-center max-w-xl">
                    {currentItem.caption}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return modal;
  return createPortal(modal, document.body);
};

/* ─── Badge Card ────────────────────────────────────────────── */
const BadgeCard = ({ badge, index, onPreview }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const theme = getPlatformColor(badge.issuer);
  const galleryCount = Array.isArray(badge.eventGallery) ? badge.eventGallery.filter((item) => item?.url).length : 0;
  const cardImage = badge.image || badge.eventPhoto || (galleryCount > 0 ? badge.eventGallery[0]?.url : '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-secondary/15 p-5 hover:border-accent/40 hover:bg-secondary/25 transition-all duration-300 shadow-lg hover:shadow-[0_12px_35px_rgba(0,0,0,0.6)] overflow-hidden backdrop-blur-sm"
    >
      {/* Top glowing issuer border strip */}
      <div
        className="absolute top-0 left-0 right-0 h-1 opacity-70 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: theme.glow }}
      />

      <div>
        {/* Top meta row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${theme.bg} ${theme.border} ${theme.text}`}>
            {badge.issuer}
          </span>
          <div className="flex items-center gap-1.5">
            {badge.type && badge.type !== 'Learning Badge' && (
              <span className="px-2 py-0.5 rounded-md text-[9px] font-mono uppercase tracking-wider text-slate-300 bg-white/5 border border-white/10">
                {badge.type}
              </span>
            )}
            {badge.featured && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border border-amber-400/40 text-amber-300 bg-amber-400/10">
                <Star size={9} fill="currentColor" />
              </span>
            )}
          </div>
        </div>

        {/* Badge emblem thumbnail with hover preview hint */}
        <div
          onClick={() => onPreview(badge)}
          className="relative w-full h-36 rounded-xl bg-gradient-to-b from-black/20 via-black/40 to-black/60 border border-white/5 flex items-center justify-center p-3 mb-4 cursor-pointer group/thumb overflow-hidden shadow-inner"
        >
          {cardImage && !imgFailed ? (
            <img
              src={cardImage}
              alt={badge.title}
              onError={() => setImgFailed(true)}
              className="max-w-full max-h-full object-contain group-hover/thumb:scale-105 transition-transform duration-300 drop-shadow-[0_6px_16px_rgba(0,0,0,0.65)]"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-text-muted gap-1.5">
              <ShieldCheck size={38} className={theme.text} />
              <span className="text-[10px] font-mono text-text-muted">{badge.issuer || 'Digital Badge'}</span>
            </div>
          )}

          {/* Inspection hover overlay */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-mono text-xs font-semibold">
            <Eye size={14} className="text-accent" /> View Details
          </div>

          {/* Photo gallery counter badge */}
          {galleryCount > 0 && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-mono text-slate-200">
              <Camera size={11} className="text-accent" />
              <span>+{galleryCount}</span>
            </div>
          )}
        </div>

        {/* Title and Date */}
        <h4 className="font-bold text-text text-sm sm:text-base leading-snug mb-1.5 group-hover:text-accent transition-colors line-clamp-2">
          {badge.title}
        </h4>

        {badge.issueDate && (
          <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-mono mb-2.5">
            <Calendar size={11} className="text-accent/80 shrink-0" />
            <span>{badge.issueDate}</span>
          </div>
        )}

        {badge.description && (
          <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-text-muted/90">
            {badge.description}
          </p>
        )}

        {/* Skills Covered */}
        {Array.isArray(badge.skills) && badge.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {badge.skills.slice(0, 3).map((sk) => (
              <span key={sk} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-[10px] font-mono text-text-muted group-hover:border-white/15 transition-colors">
                {sk}
              </span>
            ))}
            {badge.skills.length > 3 && (
              <span className="px-1.5 py-0.5 text-text-muted/60 text-[9px] font-mono">
                +{badge.skills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer verification link */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onPreview(badge)}
          className="text-xs font-mono text-text-muted hover:text-text transition-colors flex items-center gap-1"
        >
          <Sparkles size={11} className="text-accent" /> Inspect Details
        </button>

        {badge.link ? (
          <a
            href={badge.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 text-xs font-mono font-semibold hover:underline transition-colors ${theme.text}`}
          >
            Verify <ExternalLink size={11} />
          </a>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400/80">
            <CheckCircle2 size={11} /> Verified
          </span>
        )}
      </div>
    </motion.div>
  );
};

const getBadgeGridClass = (count) => (
  count <= 2
    ? 'grid grid-cols-1 gap-5 sm:grid-cols-2'
    : 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'
);

/* ─── Main Badges Component ─────────────────────────────────── */
const Badges = ({ embedded = false }) => {
  const { data, loading } = useCmsDoc(CMS_DOCS.badges, { items: [] });
  const rawList = Array.isArray(data?.items) ? data.items : [];

  const [activeIssuer, setActiveIssuer] = useState('All');
  const [activeType, setActiveType] = useState('All'); // 'All' | 'Badge' | 'Event'
  const [searchQuery, setSearchQuery] = useState('');
  const [previewBadge, setPreviewBadge] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'grouped'

  // Extract unique issuers and counts
  const issuerCounts = useMemo(() => {
    const counts = { All: rawList.length };
    rawList.forEach((b) => {
      const iss = b.issuer || 'Other';
      counts[iss] = (counts[iss] || 0) + 1;
    });
    return counts;
  }, [rawList]);

  const uniqueIssuers = useMemo(() => {
    const list = Object.keys(issuerCounts).filter((k) => k !== 'All');
    return ['All', ...list];
  }, [issuerCounts]);

  // Unique skills count
  const allSkillsCount = useMemo(() => {
    const set = new Set();
    rawList.forEach((b) => {
      if (Array.isArray(b.skills)) b.skills.forEach((s) => set.add(s));
    });
    return set.size;
  }, [rawList]);

  // Type categorizer helper
  const isEventType = (type = '') => {
    const norm = type.toLowerCase();
    return norm.includes('event') || norm.includes('workshop') || norm.includes('meetup') || norm.includes('hackathon') || norm.includes('community');
  };

  // Filtered badges
  const filteredBadges = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rawList.filter((b) => {
      const matchIssuer = activeIssuer === 'All' || b.issuer === activeIssuer;
      
      let matchType = true;
      if (activeType === 'Badge') {
        matchType = !isEventType(b.type || '');
      } else if (activeType === 'Event') {
        matchType = isEventType(b.type || '');
      }

      const matchQuery =
        !q ||
        b.title?.toLowerCase().includes(q) ||
        b.issuer?.toLowerCase().includes(q) ||
        b.type?.toLowerCase().includes(q) ||
        (Array.isArray(b.skills) && b.skills.some((s) => s.toLowerCase().includes(q)));
      return matchIssuer && matchType && matchQuery;
    });
  }, [rawList, activeIssuer, activeType, searchQuery]);

  // Grouped by issuer mapping
  const groupedByIssuer = useMemo(() => {
    const groups = {};
    filteredBadges.forEach((b) => {
      const iss = b.issuer || 'Other';
      if (!groups[iss]) groups[iss] = [];
      groups[iss].push(b);
    });
    return groups;
  }, [filteredBadges]);

  if (loading && !data) {
    return <CmsSectionSkeleton id="badges" />;
  }

  const Wrapper = embedded ? React.Fragment : SectionWrapper;
  const wrapperProps = embedded ? {} : { id: 'badges', className: 'scroll-mt-20' };

  return (
    <Wrapper {...wrapperProps}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs font-mono uppercase tracking-widest mb-3"
          >
            <ShieldCheck size={14} /> Micro-Credentials & Milestones
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text font-display mb-4"
          >
            Digital <span className="text-accent">Badges</span> & Events
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl text-text-muted text-sm sm:text-base"
          >
            Hands-on technical skill badges, challenge completions, and micro-credentials earned across platforms like MongoDB, Microsoft, Google Cloud, and AWS.
          </motion.p>
        </div>

        {/* Badges Content */}
        {rawList.length === 0 ? (
          <div className="rounded-2xl border border-secondary/50 bg-secondary/20 px-6 py-16 text-center text-text-muted">
            No digital badges have been added yet. Open the admin panel to publish your first badge.
          </div>
        ) : (
          <>
            {/* Stats Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10 max-w-3xl mx-auto">
              <div className="rounded-2xl border border-white/10 bg-secondary/20 backdrop-blur-md p-4 text-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-accent font-display">
                  <AnimatedCounter value={String(rawList.length)} suffix="+" />
                </span>
                <p className="text-xs text-text-muted font-mono mt-1">Badges Earned</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-secondary/20 backdrop-blur-md p-4 text-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-display">
                  <AnimatedCounter value={String(Math.max(uniqueIssuers.length - 1, 1))} suffix="" />
                </span>
                <p className="text-xs text-text-muted font-mono mt-1">Platforms</p>
              </div>
              <div className="col-span-2 sm:col-span-1 rounded-2xl border border-white/10 bg-secondary/20 backdrop-blur-md p-4 text-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-display">
                  <AnimatedCounter value={String(allSkillsCount)} suffix="+" />
                </span>
                <p className="text-xs text-text-muted font-mono mt-1">Skills Verified</p>
              </div>
            </div>

            {/* Sub-Filters: Type Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              {[
                { id: 'All', label: 'All Credentials', icon: Layers },
                { id: 'Badge', label: 'Skill Badges', icon: Award },
                { id: 'Event', label: 'Events & Attendance', icon: Users },
              ].map((tab) => {
                const isSelected = activeType === tab.id;
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveType(tab.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all ${
                      isSelected
                        ? 'bg-accent/20 border border-accent/60 text-accent font-bold shadow-[0_0_15px_rgb(var(--color-accent-rgb)/0.25)]'
                        : 'bg-secondary/20 border border-white/10 text-text-muted hover:border-white/25 hover:text-text'
                    }`}
                  >
                    <IconComponent size={13} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search & Platform Filter Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
              {/* Platform Filter Pills */}
              <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start w-full md:w-auto">
                {uniqueIssuers.map((iss) => {
                  const isActive = activeIssuer === iss;
                  const count = issuerCounts[iss] || 0;
                  return (
                    <button
                      key={iss}
                      onClick={() => setActiveIssuer(iss)}
                      className={`relative px-3.5 py-1.5 rounded-full text-xs font-mono transition-all duration-200 flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-accent text-primary font-bold shadow-[0_0_15px_rgb(var(--color-accent-rgb)/0.4)]'
                          : 'border border-white/10 bg-secondary/20 text-text-muted hover:border-accent/40 hover:text-text'
                      }`}
                    >
                      <span>{iss}</span>
                      <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono ${
                        isActive ? 'bg-primary/30 text-primary' : 'bg-white/10 text-text-muted'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search + View Mode Controls */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <div className="relative flex-1 md:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search badges or skills…"
                    className="w-full rounded-xl border border-white/10 bg-secondary/30 py-1.5 pl-8 pr-3 text-xs text-text outline-none placeholder:text-text-muted/50 focus:border-accent focus:ring-1 focus:ring-accent/30"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Toggle Grouped vs Grid */}
                <div className="flex rounded-xl border border-white/10 bg-secondary/30 p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-accent text-primary font-bold' : 'text-text-muted hover:text-text'
                    }`}
                    title="Grid View"
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('grouped')}
                    className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-colors ${
                      viewMode === 'grouped' ? 'bg-accent text-primary font-bold' : 'text-text-muted hover:text-text'
                    }`}
                    title="Grouped by Platform"
                  >
                    Grouped
                  </button>
                </div>
              </div>
            </div>

            {/* Badges Display */}
            {filteredBadges.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border border-dashed border-white/10 bg-secondary/10">
                <ShieldCheck size={36} className="mx-auto text-text-muted mb-2" />
                <p className="text-sm text-text-muted font-mono">No badges found matching your search or filters.</p>
                <button
                  onClick={() => { setActiveIssuer('All'); setActiveType('All'); setSearchQuery(''); }}
                  className="mt-3 text-xs text-accent underline font-mono cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === 'grouped' && activeIssuer === 'All' ? (
              <div className="space-y-10">
                {Object.entries(groupedByIssuer).map(([issuer, badges]) => {
                  const theme = getPlatformColor(issuer);
                  return (
                    <div key={issuer} className="rounded-3xl border border-white/10 bg-secondary/10 p-6 md:p-8">
                      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl border ${theme.bg} ${theme.border} ${theme.text}`}>
                            <ShieldCheck size={20} />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-text">{issuer} Collection</h3>
                            <p className="text-xs text-text-muted font-mono">{badges.length} {badges.length === 1 ? 'Badge' : 'Badges'} Earned</p>
                          </div>
                        </div>
                      </div>

                      <div className={getBadgeGridClass(badges.length)}>
                        {badges.map((badge, i) => (
                          <BadgeCard
                            key={badge.id || badge.title || i}
                            badge={badge}
                            index={i}
                            onPreview={setPreviewBadge}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={getBadgeGridClass(filteredBadges.length)}>
                {filteredBadges.map((badge, i) => (
                  <BadgeCard
                    key={badge.id || badge.title || i}
                    badge={badge}
                    index={i}
                    onPreview={setPreviewBadge}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox / Modal */}
      <BadgePreviewModal
        badge={previewBadge}
        onClose={() => setPreviewBadge(null)}
      />
    </Wrapper>
  );
};

export default Badges;
