import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import { CmsSectionSkeleton } from './CmsShapeSkeleton';
import AnimatedCounter from './AnimatedCounter';

/* ─── Platform Styling Palette ──────────────────────────────── */
const getPlatformColor = (issuer = '') => {
  const norm = (issuer || '').toLowerCase();
  if (norm.includes('mongo')) return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', glow: 'rgba(16, 185, 129, 0.15)' };
  if (norm.includes('google') || norm.includes('gcp')) return { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'rgba(59, 130, 246, 0.15)' };
  if (norm.includes('aws') || norm.includes('amazon')) return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', glow: 'rgba(245, 158, 11, 0.15)' };
  if (norm.includes('microsoft') || norm.includes('azure')) return { bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-400', glow: 'rgba(14, 165, 233, 0.15)' };
  if (norm.includes('postman')) return { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', glow: 'rgba(249, 115, 22, 0.15)' };
  if (norm.includes('github') || norm.includes('git')) return { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'rgba(168, 85, 247, 0.15)' };
  return { bg: 'bg-accent/10', border: 'border-accent/30', text: 'text-accent', glow: 'rgba(56, 189, 248, 0.15)' };
};

/* ─── Badge Preview Modal ────────────────────────────────────── */
const BadgePreviewModal = ({ badge, onClose }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const theme = getPlatformColor(badge?.issuer);

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(5, 8, 22, 0.88)', backdropFilter: 'blur(12px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-lg rounded-2xl overflow-hidden border border-accent/30 bg-primary shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-white/10 bg-secondary/40">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-accent" />
                <span className="text-sm font-semibold text-text truncate">{badge.issuer} Verified Badge</span>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-text-muted hover:text-text hover:border-white/25 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center text-center">
              {badge.image && !imgFailed ? (
                <div className="relative w-40 h-40 mb-5 p-3 rounded-2xl bg-secondary/30 border border-white/10 flex items-center justify-center shadow-inner">
                  <img
                    src={badge.image}
                    alt={badge.title}
                    onError={() => setImgFailed(true)}
                    className="max-w-full max-h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                  />
                </div>
              ) : (
                <div className={`w-28 h-28 mb-5 rounded-2xl border ${theme.bg} ${theme.border} flex flex-col items-center justify-center ${theme.text} shadow-inner`}>
                  <ShieldCheck size={48} />
                  <span className="text-[10px] font-mono mt-1 opacity-80">{badge.issuer}</span>
                </div>
              )}

              <span className={`px-3 py-0.5 rounded-full text-xs font-mono font-medium mb-2 border ${theme.bg} ${theme.border} ${theme.text}`}>
                {badge.issuer}
              </span>

              <h3 className="text-lg font-bold text-text mb-2 px-2 leading-snug">{badge.title}</h3>

              {badge.issueDate && (
                <p className="text-xs text-text-muted font-mono mb-4 flex items-center gap-1.5">
                  <Calendar size={13} className="text-accent" /> Earned: {badge.issueDate}
                </p>
              )}

              {Array.isArray(badge.skills) && badge.skills.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5 mb-6 max-w-sm">
                  {badge.skills.map((skill) => (
                    <span key={skill} className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-text-muted">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {badge.link && (
                <a
                  href={badge.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent text-primary px-5 py-2.5 text-xs font-mono font-bold hover:bg-accent/90 shadow-[0_0_20px_rgb(var(--color-accent-rgb)/0.3)] transition-all"
                >
                  Verify on {badge.issuer} / Credly <ExternalLink size={14} />
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ─── Badge Card ────────────────────────────────────────────── */
const BadgeCard = ({ badge, index, onPreview }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const theme = getPlatformColor(badge.issuer);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-secondary/15 p-5 hover:border-accent/40 hover:bg-secondary/25 transition-all duration-300 shadow-lg hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-sm"
    >
      {/* Subtle top glow bar matching issuer */}
      <div
        className="absolute top-0 left-0 right-0 h-1 opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: theme.text.replace('text-', '') }}
      />

      <div>
        {/* Top meta row */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border ${theme.bg} ${theme.border} ${theme.text}`}>
            {badge.issuer}
          </span>
          {badge.featured && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border border-amber-400/40 text-amber-300 bg-amber-400/10">
              <Star size={9} fill="currentColor" /> Featured
            </span>
          )}
        </div>

        {/* Badge emblem thumbnail with hover preview hint */}
        <div
          onClick={() => onPreview(badge)}
          className="relative w-full h-32 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center p-3 mb-4 cursor-pointer group/thumb overflow-hidden"
        >
          {badge.image && !imgFailed ? (
            <img
              src={badge.image}
              alt={badge.title}
              onError={() => setImgFailed(true)}
              className="max-w-full max-h-full object-contain group-hover/thumb:scale-110 transition-transform duration-300 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-text-muted gap-1">
              <ShieldCheck size={36} className={theme.text} />
              <span className="text-[10px] font-mono text-text-muted">{badge.issuer || 'Digital Badge'}</span>
            </div>
          )}

          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-mono text-[11px]">
            <Eye size={13} className="text-accent" /> Inspect Badge
          </div>
        </div>

        {/* Title and Date */}
        <h4 className="font-bold text-text text-sm leading-snug mb-1.5 group-hover:text-accent transition-colors line-clamp-2">
          {badge.title}
        </h4>

        {badge.issueDate && (
          <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-mono mb-3">
            <Calendar size={11} className="text-accent/70" />
            <span>{badge.issueDate}</span>
          </div>
        )}

        {/* Skills Covered */}
        {Array.isArray(badge.skills) && badge.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {badge.skills.slice(0, 3).map((sk) => (
              <span key={sk} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-[10px] font-mono text-text-muted">
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
          <Sparkles size={11} className="text-accent" /> Details
        </button>

        {badge.link && (
          <a
            href={badge.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 text-xs font-mono font-medium hover:underline transition-colors ${theme.text}`}
          >
            Verify <ExternalLink size={11} />
          </a>
        )}
      </div>
    </motion.div>
  );
};

/* ─── Main Badges Component ─────────────────────────────────── */
const Badges = () => {
  const { data, loading } = useCmsDoc(CMS_DOCS.badges, { items: [] });
  const rawList = Array.isArray(data?.items) ? data.items : [];

  const [activeIssuer, setActiveIssuer] = useState('All');
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

  // Filtered badges
  const filteredBadges = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rawList.filter((b) => {
      const matchIssuer = activeIssuer === 'All' || b.issuer === activeIssuer;
      const matchQuery =
        !q ||
        b.title?.toLowerCase().includes(q) ||
        b.issuer?.toLowerCase().includes(q) ||
        (Array.isArray(b.skills) && b.skills.some((s) => s.toLowerCase().includes(q)));
      return matchIssuer && matchQuery;
    });
  }, [rawList, activeIssuer, searchQuery]);

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

  return (
    <SectionWrapper id="badges" className="scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs font-mono uppercase tracking-widest mb-3"
          >
            <ShieldCheck size={14} /> Micro-Credentials & Emblems
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text font-display mb-4"
          >
            Digital <span className="text-accent">Badges</span> & Milestones
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl text-text-muted text-sm sm:text-base"
          >
            Hands-on technical skill badges, challenge completions, and micro-credentials earned across platforms like MongoDB, Google Cloud, AWS, and Postman.
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
                <p className="text-sm text-text-muted font-mono">No badges found matching your search.</p>
                <button
                  onClick={() => { setActiveIssuer('All'); setSearchQuery(''); }}
                  className="mt-3 text-xs text-accent underline font-mono"
                >
                  Reset Filters
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
    </SectionWrapper>
  );
};

export default Badges;
