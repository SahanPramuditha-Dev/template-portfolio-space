import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, ExternalLink, Calendar, FileText, X, Download, Search, Star, ChevronDown } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import { CmsSectionSkeleton } from './CmsShapeSkeleton';
import AnimatedCounter from './AnimatedCounter';

/* ─── CONSTANTS ────────────────────────────────────────────── */
const CATEGORIES = ['All', 'Cloud', 'Data', 'Programming', 'Networking', 'Microsoft', 'AWS', 'Security', 'DevOps', 'AI/ML', 'Other'];

/* ─── PDF Lightbox Modal ────────────────────────────────────── */
const PdfModal = ({ url, title, onClose }) => (
  <AnimatePresence>
    {url && (
      <motion.div
        key="pdf-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          key="pdf-panel"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-4xl flex flex-col rounded-2xl overflow-hidden border border-accent/30 shadow-2xl"
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
                <ExternalLink size={13} /> Open
              </a>
              <button onClick={onClose}
                className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-text-muted hover:text-text hover:border-white/25 transition-colors"
                aria-label="Close PDF preview">
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden bg-black/60">
            <iframe src={url} title={`${title} — Certificate PDF`} className="w-full h-full" style={{ height: '78vh', border: 'none' }} />
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
        style={{ backgroundColor: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)' }}
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
                    className="flex flex-col gap-3 rounded-xl border border-white/10 bg-secondary/20 p-4 hover:border-accent/30 transition-colors"
                  >
                    {cert.image && (
                      <div className="w-full h-28 rounded-lg overflow-hidden bg-black/45 flex items-center justify-center p-2">
                        <img src={cert.image} alt={cert.title} className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-accent mb-0.5">{cert.issuer}</p>
                      <h4 className="font-semibold text-text text-sm leading-snug line-clamp-2">{cert.title}</h4>
                      <p className="text-xs text-text-muted mt-1">{cert.date}</p>
                    </div>
                    <div className="flex gap-2">
                      {cert.link && (
                        <a href={cert.link} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-accent hover:underline font-mono">
                          Verify <ExternalLink size={11} />
                        </a>
                      )}
                      {cert.pdfUrl && (
                        <button onClick={() => onViewPdf(cert.pdfUrl, cert.title)}
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
    // Fallback to estimation multiplier if no certificates have hours entered
    return hasDurations ? sum : Math.max(certs.length * 8, 1);
  }, [certs]);

  const stats = [
    { value: certs.length, suffix: '+', label: 'Certificates Earned' },
    { value: totalHours, suffix: '+', label: 'Learning Hours' },
    { value: platforms, suffix: '', label: 'Learning Platforms' },
    { value: allSkills, suffix: '+', label: 'Skills Acquired' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
      {stats.map(({ value, suffix, label }) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center rounded-2xl border border-accent/20 bg-accent/5 py-5 px-4 text-center"
        >
          <span className="text-3xl font-bold text-accent font-display">
            <AnimatedCounter value={String(value)} suffix={suffix} />
          </span>
          <span className="text-xs text-text-muted font-mono mt-1">{label}</span>
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

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {available.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all duration-200 ${
            active === cat
              ? 'bg-accent text-primary font-semibold shadow-[0_0_16px_rgb(var(--color-accent-rgb)/0.4)]'
              : 'border border-white/10 text-text-muted hover:border-accent/40 hover:text-accent'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

/* ─── Certificate Card ──────────────────────────────────────── */
const CertificationCard = ({ cert, index, onViewPdf }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.08 }}
    className="glass-card flex flex-col rounded-xl border border-secondary/50 hover:border-accent/50 transition-all duration-300 group bg-secondary/20 hover:bg-secondary/30 overflow-hidden"
  >
    {cert.image && (
      <div className="w-full h-48 overflow-hidden bg-black/45 border-b border-white/5 shrink-0 flex items-center justify-center p-4">
        <img src={cert.image} alt={`${cert.title} badge`} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
      </div>
    )}

    <div className="flex flex-col flex-1 p-5">
      {/* Category + featured badge */}
      <div className="flex items-center gap-2 mb-3">
        {cert.category && cert.category !== 'Other' && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono border border-accent/25 text-accent bg-accent/10">{cert.category}</span>
        )}
        {cert.featured && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border border-yellow-400/30 text-yellow-300 bg-yellow-400/10">
            <Star size={9} fill="currentColor" /> Featured
          </span>
        )}
      </div>

      <div className="flex items-start gap-3 mb-3">
        <div className="p-2.5 bg-accent/20 rounded-lg group-hover:bg-accent/30 transition-colors shrink-0">
          <Award className="text-accent" size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-text mb-0.5 leading-snug">{cert.title}</h3>
          <p className="text-text-muted text-xs font-mono">{cert.issuer}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3 text-xs text-text-muted">
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>{cert.date}</span>
        </div>
        {cert.credential && (
          <span className="font-mono bg-primary/50 px-2 py-0.5 rounded truncate max-w-[140px]">{cert.credential}</span>
        )}
      </div>

      {Array.isArray(cert.skills) && cert.skills.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {cert.skills.slice(0, 4).map((skill) => (
              <span key={skill} className="px-2 py-0.5 bg-primary/50 text-accent rounded text-[10px] font-mono border border-accent/20">{skill}</span>
            ))}
            {cert.skills.length > 4 && (
              <span className="px-2 py-0.5 text-text-muted text-[10px] font-mono">+{cert.skills.length - 4} more</span>
            )}
          </div>
        </div>
      )}

      {/* Action row */}
      <div className="flex flex-wrap items-center gap-3 mt-auto pt-3 border-t border-white/5">
        {cert.link && (
          <a href={cert.link} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-accent hover:text-text transition-colors text-xs font-mono group/link">
            Verify <ExternalLink size={12} className="group-hover/link:translate-x-0.5 transition-transform" />
          </a>
        )}
        {cert.pdfUrl && (
          <button type="button" onClick={() => onViewPdf(cert.pdfUrl, cert.title)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-accent/25 bg-accent/10 px-2.5 py-1 text-xs font-mono text-accent hover:bg-accent/20 transition-colors group/pdf">
            <FileText size={12} className="group-hover/pdf:scale-110 transition-transform" />
            View PDF
          </button>
        )}
      </div>
    </div>
  </motion.div>
);

/* ─── Main Section ──────────────────────────────────────────── */
const Certifications = () => {
  const { data, loading } = useCmsDoc(CMS_DOCS.certifications, { items: [] });
  const certificationsList = Array.isArray(data?.items) ? data.items : [];

  const [activeFilter, setActiveFilter] = useState('All');
  const [showAll, setShowAll] = useState(false);
  const [pdfModal, setPdfModal] = useState({ url: '', title: '' });
  const scrollRef = React.useRef(null);

  // Mouse drag-to-scroll handler for desktop users
  const [isDown, setIsDown] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);

  const handleMouseDown = (e) => {
    // Avoid triggering drag if clicking on buttons or links directly
    if (e.target.closest('a') || e.target.closest('button')) return;
    setIsDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const openPdf  = (url, title) => setPdfModal({ url, title });
  const closePdf = () => setPdfModal({ url: '', title: '' });

  const filteredCerts = useMemo(() => {
    const base = activeFilter === 'All' ? certificationsList : certificationsList.filter((c) => c.category === activeFilter);
    // Always show featured first in the main grid
    return [...base].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }, [certificationsList, activeFilter]);

  // Show max 6 in main grid unless "show all" is toggled
  const GRID_LIMIT = 6;

  if (loading || data === undefined) {
    return <CmsSectionSkeleton id="certifications" />;
  }

  return (
    <SectionWrapper id="certifications">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative">
        <h2 className="flex flex-wrap items-center gap-2 text-xl sm:text-2xl md:text-3xl font-bold text-text mb-8 sm:mb-10 font-display gradient-text">
          <span className="text-accent font-mono text-lg sm:text-xl mr-0 sm:mr-2">06.</span>
          <span className="flex-grow min-w-0">Certifications &amp; Achievements</span>
          <span className="h-px bg-secondary flex-grow min-w-[60px] ml-0 sm:ml-4 opacity-50 w-full sm:w-auto order-3 sm:order-none"></span>
        </h2>

        {/* Stats Bar */}
        {certificationsList.length > 0 && <StatsBar certs={certificationsList} />}

        {/* Filter Tabs */}
        {certificationsList.length > 0 && (
          <FilterTabs certs={certificationsList} active={activeFilter} onChange={setActiveFilter} />
        )}

        {/* Main Horizontal Ticker */}
        {certificationsList.length === 0 ? (
          <div className="rounded-2xl border border-secondary/50 bg-secondary/20 px-6 py-16 text-center text-text-muted">
            No certificates have been added yet. Open the admin panel to publish your first certificate.
          </div>
        ) : (
          <>
            <div className="relative w-full select-none">
              {/* Fade masks */}
              <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-primary to-transparent z-10 pointer-events-none" />
              <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-primary to-transparent z-10 pointer-events-none" />

              {/* Horizontal scroll wrap */}
              <div 
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                className={`flex gap-6 overflow-x-auto snap-x snap-mandatory py-4 px-8 no-scrollbar scroll-smooth ${
                  isDown ? 'cursor-grabbing' : 'cursor-grab'
                }`}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {filteredCerts.map((cert, index) => (
                  <div key={`${cert.title}-${index}`} className="w-[320px] md:w-[350px] shrink-0 snap-center select-none">
                    <CertificationCard cert={cert} index={0} onViewPdf={openPdf} />
                  </div>
                ))}
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
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
          onViewPdf={(url, title) => { setShowAll(false); openPdf(url, title); }}
        />
      )}
      <PdfModal url={pdfModal.url} title={pdfModal.title} onClose={closePdf} />
    </SectionWrapper>
  );
};

export default Certifications;
