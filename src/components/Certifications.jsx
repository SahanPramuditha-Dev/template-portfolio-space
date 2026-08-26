import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, ExternalLink, Calendar, FileText, X, Download, Search, Star, ChevronDown, Clock, Layers, Zap, Eye } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import { CmsSectionSkeleton } from './CmsShapeSkeleton';
import AnimatedCounter from './AnimatedCounter';

/* ─── CONSTANTS ────────────────────────────────────────────── */
const CATEGORIES = ['All', 'Cloud', 'Data', 'Programming', 'Networking', 'Microsoft', 'AWS', 'Security', 'DevOps', 'AI/ML', 'Other'];

/* ─── Image / PDF Lightbox Modal ────────────────────────────── */
const ImageOrPdfModal = ({ url, title, isPdf, onClose }) => (
  <AnimatePresence>
    {url && (
      <motion.div
        key="lightbox-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(5, 8, 22, 0.88)', backdropFilter: 'blur(12px)' }}
        onClick={onClose}
      >
        <motion.div
          key="lightbox-panel"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-4xl flex flex-col rounded-2xl overflow-hidden border border-accent/30 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
          style={{ maxHeight: '92vh', background: 'rgb(var(--color-primary-rgb, 10 10 20))' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-white/10 bg-secondary/40 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <FileText size={16} className="text-accent shrink-0" />
              <span className="text-sm font-semibold text-text truncate">{title}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a href={url} target="_blank" rel="noopener noreferrer" download
                className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-mono text-accent hover:bg-accent/20 transition-colors">
                <Download size={13} /> Download
              </a>
              <a href={url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-mono text-text-muted hover:text-text transition-colors">
                <ExternalLink size={13} /> Open Original
              </a>
              <button onClick={onClose}
                className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-text-muted hover:text-text hover:border-white/25 transition-colors"
                aria-label="Close preview">
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden bg-black/70 flex items-center justify-center p-4">
            {isPdf ? (
              <iframe src={url} title={`${title} — Certificate PDF`} className="w-full h-full" style={{ height: '78vh', border: 'none' }} />
            ) : (
              <img src={url} alt={title} className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-xl" />
            )}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ─── View-All Modal ────────────────────────────────────────── */
const AllCertsModal = ({ certs, onClose, onViewPdf }) => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return certs.filter((c) => {
      const matchCat = activeFilter === 'All' || c.category === activeFilter;
      const matchQ = !q || c.title?.toLowerCase().includes(q) || c.issuer?.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [certs, search, activeFilter]);

  const availableCategories = useMemo(() => {
    const cats = new Set(certs.map((c) => c.category).filter(Boolean));
    return ['All', ...CATEGORIES.filter((c) => c !== 'All' && cats.has(c))];
  }, [certs]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(5, 8, 22, 0.88)', backdropFilter: 'blur(12px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="relative w-full max-w-5xl flex flex-col rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
          style={{ maxHeight: '90vh', background: 'rgb(var(--color-primary-rgb, 10 10 20))' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-white/10 bg-secondary/30 shrink-0">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-accent">Full Archive</p>
              <h3 className="text-lg font-bold text-text">All Certifications — {certs.length} total</h3>
            </div>
            <button onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-text-muted hover:text-text hover:border-white/25 transition-colors"
              aria-label="Close archive">
              <X size={18} />
            </button>
          </div>

          {/* Search + Filter */}
          <div className="px-6 py-4 border-b border-white/5 bg-secondary/10 shrink-0 space-y-3">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search certifications…"
                className="w-full rounded-xl border border-white/10 bg-primary/60 py-2.5 pl-9 pr-4 text-sm text-text outline-none placeholder:text-text-muted/50 focus:border-accent focus:ring-1 focus:ring-accent/30"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                    activeFilter === cat
                      ? 'bg-accent text-primary font-semibold'
                      : 'border border-white/10 text-text-muted hover:border-accent/40 hover:text-accent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable cert grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-text-muted text-sm font-mono">No certifications match your search.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((cert, i) => (
                  <motion.div
                    key={cert.title || i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-white/10 bg-secondary/20 p-4 hover:border-accent/30 transition-colors"
                  >
                    <div>
                      {cert.image && (
                        <div className="w-full h-24 rounded-lg overflow-hidden bg-black/60 border border-white/5 flex items-center justify-center p-2 mb-3">
                          <img src={cert.image} alt={cert.title} className="max-w-full max-h-full object-contain" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-mono text-accent mb-0.5">{cert.issuer}</p>
                        <h4 className="font-semibold text-text text-sm leading-snug line-clamp-2">{cert.title}</h4>
                        <p className="text-xs text-text-muted mt-1">{cert.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-white/5">
                      {cert.link && (
                        <a href={cert.link} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-accent hover:underline font-mono">
                          Verify <ExternalLink size={11} />
                        </a>
                      )}
                      {cert.pdfUrl && (
                        <button onClick={() => onViewPdf(cert.pdfUrl, cert.title, true)}
                          className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-accent font-mono transition-colors">
                          <FileText size={11} /> PDF
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ─── Stats Bar ─────────────────────────────────────────────── */
const StatsBar = ({ certs }) => {
  const platforms = useMemo(() => new Set(certs.map((c) => c.issuer).filter(Boolean)).size, [certs]);
  const allSkills = useMemo(() => {
    const s = new Set();
    certs.forEach((c) => { if (Array.isArray(c.skills)) c.skills.forEach((sk) => s.add(sk)); });
    return s.size;
  }, [certs]);

  const totalHours = useMemo(() => {
    let sum = 0;
    let hasDurations = false;
    certs.forEach((c) => {
      const h = Number(c.durationHours);
      if (!isNaN(h) && h > 0) {
        sum += h;
        hasDurations = true;
      }
    });
    return hasDurations ? sum : Math.max(certs.length * 8, 1);
  }, [certs]);

  const stats = [
    { value: certs.length, suffix: '+', label: 'Certificates Earned', icon: Award, color: 'from-cyan-400 to-blue-500' },
    { value: totalHours, suffix: '+', label: 'Learning Hours', icon: Clock, color: 'from-purple-400 to-indigo-500' },
    { value: platforms, suffix: '', label: 'Learning Platforms', icon: Layers, color: 'from-emerald-400 to-teal-500' },
    { value: allSkills, suffix: '+', label: 'Skills Acquired', icon: Zap, color: 'from-amber-400 to-orange-500' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
      {stats.map(({ value, suffix, label, icon: Icon, color }) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="relative group flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-secondary/20 backdrop-blur-md py-5 px-4 text-center overflow-hidden hover:border-accent/40 hover:bg-secondary/30 transition-all duration-300 shadow-lg"
        >
          {/* Top accent glow gradient bar */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${color} opacity-70 group-hover:opacity-100 transition-opacity`} />
          
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 mb-2 group-hover:scale-110 transition-transform">
            <Icon size={18} className="text-accent" />
          </div>

          <span className={`text-3xl font-extrabold bg-gradient-to-r ${color} bg-clip-text text-transparent font-display`}>
            <AnimatedCounter value={String(value)} suffix={suffix} />
          </span>
          <span className="text-xs text-text-muted font-mono mt-1 font-medium">{label}</span>
        </motion.div>
      ))}
    </div>
  );
};

/* ─── Filter Tabs ───────────────────────────────────────────── */
const FilterTabs = ({ certs, active, onChange }) => {
  const available = useMemo(() => {
    const cats = new Set(certs.map((c) => c.category).filter(Boolean));
    return ['All', ...CATEGORIES.filter((c) => c !== 'All' && cats.has(c))];
  }, [certs]);

  // Map category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: certs.length };
    certs.forEach((c) => {
      if (c.category) counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return counts;
  }, [certs]);

  return (
    <div className="flex flex-wrap gap-2 mb-8 items-center">
      {available.map((cat) => {
        const isActive = active === cat;
        const count = categoryCounts[cat] || 0;
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`relative px-4 py-2 rounded-full text-xs font-mono transition-all duration-200 flex items-center gap-1.5 ${
              isActive
                ? 'text-primary font-semibold z-10'
                : 'border border-white/10 text-text-muted hover:border-accent/40 hover:text-accent bg-secondary/10'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeFilterTab"
                className="absolute inset-0 bg-accent rounded-full -z-10 shadow-[0_0_18px_rgb(var(--color-accent-rgb)/0.5)]"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span>{cat}</span>
            <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono ${
              isActive ? 'bg-primary/30 text-primary-content' : 'bg-white/10 text-text-muted'
            }`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

const handleMouseMoveSpotlight = (e) => {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  card.style.setProperty('--mouse-x', `${x}px`);
  card.style.setProperty('--mouse-y', `${y}px`);
};

/* ─── Certificate Card ──────────────────────────────────────── */
const CertificationCard = ({ cert, index, onViewPreview }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.06 }}
    onMouseMove={handleMouseMoveSpotlight}
    className="glass-card flex flex-col justify-between h-full rounded-2xl border border-white/10 hover:border-accent/40 transition-all duration-300 group bg-secondary/15 hover:bg-secondary/25 overflow-hidden shadow-lg hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
  >
    <div>
      {/* Dark Framing for Image Thumbnails */}
      {cert.image ? (
        <div
          onClick={() => onViewPreview(cert.image, cert.title, false)}
          className="relative w-full overflow-hidden bg-black/60 border-b border-white/10 flex items-center justify-center p-4 h-[145px] cursor-pointer group/img"
        >
          <img
            src={cert.image}
            alt={`${cert.title} badge`}
            className="max-w-full max-h-full object-contain group-hover/img:scale-105 transition-transform duration-500"
          />
          {/* Dark hover glass overlay with preview hint */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-mono text-xs font-medium">
            <Eye size={16} className="text-accent" />
            <span>Click to Preview</span>
          </div>
        </div>
      ) : (
        <div className="w-full h-12 bg-gradient-to-r from-accent/10 to-transparent border-b border-white/5" />
      )}

      <div className="p-5 flex flex-col flex-1">
        {/* Category + featured badge */}
        <div className="flex items-center gap-2 mb-3">
          {cert.category && cert.category !== 'Other' && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border border-accent/30 text-accent bg-accent/10">
              {cert.category}
            </span>
          )}
          {cert.featured && (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border border-amber-400/40 text-amber-300 bg-amber-400/10">
              <Star size={9} fill="currentColor" /> Featured
            </span>
          )}
        </div>

        <div className="flex items-start gap-3 mb-3">
          <div className="p-2.5 bg-accent/15 border border-accent/20 rounded-xl group-hover:bg-accent/25 transition-colors shrink-0">
            <Award className="text-accent" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-text mb-0.5 leading-snug group-hover:text-accent transition-colors">
              {cert.title}
            </h3>
            <p className="text-text-muted text-xs font-mono">{cert.issuer}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3 text-xs text-text-muted">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="text-accent/70" />
            <span>{cert.date}</span>
          </div>
          {cert.credential && (
            <span className="font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded truncate max-w-[140px] text-[11px]">
              {cert.credential}
            </span>
          )}
        </div>

        {Array.isArray(cert.skills) && cert.skills.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1.5">
              {cert.skills.slice(0, 3).map((skill) => (
                <span key={skill} className="px-2.5 py-0.5 bg-accent/10 text-accent rounded-md text-[11px] font-mono font-medium">
                  {skill}
                </span>
              ))}
              {cert.skills.length > 3 && (
                <span className="px-2 py-0.5 text-text-muted text-[10px] font-mono bg-white/5 rounded-md">
                  +{cert.skills.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Action row pinned at bottom */}
    <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-white/10 bg-white/[0.02]">
      {cert.link ? (
        <a href={cert.link} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-accent hover:text-text transition-colors text-xs font-mono group/link">
          Verify <ExternalLink size={12} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
        </a>
      ) : <div />}

      {cert.pdfUrl && (
        <button type="button" onClick={() => onViewPreview(cert.pdfUrl, cert.title, true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-mono text-accent hover:bg-accent/20 hover:border-accent/50 transition-all group/pdf shadow-sm">
          <FileText size={12} className="group-hover/pdf:scale-110 transition-transform" />
          View PDF
        </button>
      )}
    </div>
  </motion.div>
);

/* ─── Main Section ──────────────────────────────────────────── */
const Certifications = () => {
  const { data, loading } = useCmsDoc(CMS_DOCS.certifications, { items: [] });
  const certificationsList = Array.isArray(data?.items) ? data.items : [];

  const [activeFilter, setActiveFilter] = useState('All');
  const [showAll, setShowAll] = useState(false);
  const [modalState, setModalState] = useState({ url: '', title: '', isPdf: false });

  const openPreview  = (url, title, isPdf = false) => setModalState({ url, title, isPdf });
  const closePreview = () => setModalState({ url: '', title: '', isPdf: false });

  const filteredCerts = useMemo(() => {
    const base = activeFilter === 'All' ? certificationsList : certificationsList.filter((c) => c.category === activeFilter);
    return [...base].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }, [certificationsList, activeFilter]);

  const GRID_LIMIT = 6;
  const visibleCerts = filteredCerts.slice(0, GRID_LIMIT);
  const hasMore = filteredCerts.length > GRID_LIMIT;

  if (loading || data === undefined) {
    return <CmsSectionSkeleton id="certifications" />;
  }

  return (
    <SectionWrapper id="certifications">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-10 md:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs font-mono uppercase tracking-widest mb-3"
          >
            <Award size={14} /> Verified Credentials & Courses
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text font-display mb-4"
          >
            Certifications & <span className="text-accent">Qualifications</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl text-text-muted text-sm sm:text-base"
          >
            Formally accredited courses, diplomas, and technical specializations with verifiable certificates.
          </motion.p>
        </div>

        {/* Stats Bar */}
        {certificationsList.length > 0 && <StatsBar certs={certificationsList} />}

        {/* Filter Tabs */}
        {certificationsList.length > 0 && (
          <FilterTabs certs={certificationsList} active={activeFilter} onChange={setActiveFilter} />
        )}

        {/* Main Grid */}
        {certificationsList.length === 0 ? (
          <div className="rounded-2xl border border-secondary/50 bg-secondary/20 px-6 py-16 text-center text-text-muted">
            No certificates have been added yet. Open the admin panel to publish your first certificate.
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFilter}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
              >
                {visibleCerts.map((cert, index) => (
                  <CertificationCard key={cert.title || index} cert={cert} index={index} onViewPreview={openPreview} />
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Footer actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              {hasMore && (
                <p className="text-xs text-text-muted font-mono">
                  Showing {visibleCerts.length} of {filteredCerts.length} in this category
                </p>
              )}
              {certificationsList.length > GRID_LIMIT && (
                <button
                  onClick={() => setShowAll(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-6 py-2.5 text-sm font-semibold text-accent hover:bg-accent/20 transition-all hover:shadow-[0_0_20px_rgb(var(--color-accent-rgb)/0.2)]"
                >
                  <ChevronDown size={16} />
                  View All {certificationsList.length} Certifications
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {showAll && (
        <AllCertsModal
          certs={certificationsList}
          onClose={() => setShowAll(false)}
          onViewPdf={(url, title, isPdf) => { setShowAll(false); openPreview(url, title, isPdf); }}
        />
      )}
      <ImageOrPdfModal
        url={modalState.url}
        title={modalState.title}
        isPdf={modalState.isPdf}
        onClose={closePreview}
      />
    </SectionWrapper>
  );
};

export default Certifications;

