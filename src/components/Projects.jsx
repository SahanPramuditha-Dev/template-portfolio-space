import React, { Suspense, useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Github,
  ExternalLink,
  Folder,
  Search,
  Sparkles,
  X,
  ChevronRight,
  Calendar,
  Play,
  Layers,
  SlidersHorizontal,
} from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import { trackProjectView } from '../utils/analytics';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import { isUsableHttpUrl } from '../utils/projectUrls';
import { slugify } from '../utils/slugify';
import {
  getCardSubtitle,
  getImpactMetrics,
  getMediaUrlStrings,
  getOutcomeBadge,
  getProjectStatusLabel,
} from '../utils/projectNormalize';

const isAnimatedAsset = (src) => /\.(gif|mp4|webm)(\?|#|$)/i.test(src);

import { useNavigate } from 'react-router-dom';

const ProjectCard = ({ project, index, compact = false }) => {
  const navigate = useNavigate();
  const media = getMediaUrlStrings(project);
  const [mediaHover, setMediaHover] = useState(false);
  const coverIndex = media.length > 1 && mediaHover ? 1 : 0;
  const cover = media[coverIndex];
  const hasMedia = media.length > 0;
  const hasLive = isUsableHttpUrl(project.external);
  const hasGithub = isUsableHttpUrl(project.github);
  const impact = getImpactMetrics(project);
  const outcome = getOutcomeBadge(project);
  const subtitle = getCardSubtitle(project);
  const statusLabel = getProjectStatusLabel(project);
  const projectSlug = slugify(project.slug || project.id || project.title || project.missionCode);

  const navigateToProject = () => {
    trackProjectView(project.title);
    navigate(`/projects/${projectSlug}`);
  };

  const handleCardClick = (e) => {
    if (e.target.closest('a[href]')) return;
    navigateToProject();
  };

  const handleCardKeyDown = (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    if (e.target !== e.currentTarget) return;
    e.preventDefault();
    navigateToProject();
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      tabIndex={0}
      aria-label={`Project: ${project.title}. Press Enter to open details.`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      className={`group relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-secondary/20 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.18)] hover:shadow-[0_20px_50px_rgba(56,189,248,0.12)] outline-none transition-all duration-300 hover:border-accent/40 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-accent/50 ${
        compact ? 'h-full' : ''
      }`}
    >
      <div className="flex h-full flex-col">
        {hasMedia && (
          <div
            className="relative shrink-0 overflow-hidden"
            onMouseEnter={() => setMediaHover(true)}
            onMouseLeave={() => setMediaHover(false)}
          >
            <div className="relative aspect-[16/10] sm:aspect-[2/1] overflow-hidden border-b border-white/10">
              {cover.match(/\.(mp4|webm)(\?|#|$)/i) ? (
                <video
                  src={cover}
                  autoPlay={mediaHover}
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <img
                  src={cover}
                  alt={project.title}
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105 smooth-img"
                  loading="lazy"
                  decoding="async"
                  onLoad={(e) => e.currentTarget.classList.add('loaded')}
                />
              )}
              {media.length > 1 && (
                <div className="absolute bottom-3 right-3 flex gap-2">
                  {media.slice(0, 3).map((src, i) => (
                    <div
                      key={`${src}-${i}`}
                      className={`h-12 w-12 overflow-hidden rounded-lg border bg-black/30 shadow-lg backdrop-blur-sm ${
                        i === coverIndex ? 'border-accent/60' : 'border-white/20'
                      }`}
                    >
                      <img src={src} alt="" className="h-full w-full object-cover smooth-img" loading="lazy" onLoad={(e) => e.currentTarget.classList.add('loaded')} />
                    </div>
                  ))}
                </div>
              )}
              {media.some(isAnimatedAsset) && (
                <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-accent/30 bg-black/35 px-2.5 py-1 text-[0.68rem] font-mono uppercase tracking-[0.14em] text-accent">
                  <Play size={11} />
                  Motion preview
                </div>
              )}
              {media.length > 1 && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent py-2 text-center text-[0.65rem] font-mono uppercase tracking-[0.14em] text-white/80 opacity-0 transition-opacity group-hover:opacity-100">
                  Hover to preview another frame
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent" />

              <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[0.68rem] font-mono uppercase tracking-[0.16em] text-accent">
                  <Folder size={12} />
                  {project.missionCode}
                </span>
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[0.68rem] font-mono uppercase tracking-[0.12em] text-white/80">
                  {project.category}
                </span>
                {statusLabel && (
                  <span className="rounded-full border border-emerald-400/25 bg-emerald-500/15 px-3 py-1 text-[0.65rem] font-mono uppercase tracking-[0.12em] text-emerald-200/90">
                    {statusLabel}
                  </span>
                )}
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                <p className="text-[0.7rem] font-mono uppercase tracking-[0.2em] text-white/70">{project.year}</p>
                <p className="text-[0.7rem] font-mono uppercase tracking-[0.16em] text-white/70">
                  Preview ready
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {!hasMedia && (
              <>
                <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[0.68rem] font-mono uppercase tracking-[0.16em] text-accent">
                  <Folder size={12} />
                  {project.missionCode}
                </span>
                <span className="rounded-full border border-secondary/50 bg-secondary/30 px-3 py-1 text-[0.68rem] font-mono uppercase tracking-[0.12em] text-text-muted">
                  {project.category}
                </span>
                {statusLabel && (
                  <span className="rounded-full border border-emerald-400/25 bg-emerald-500/15 px-3 py-1 text-[0.65rem] font-mono uppercase tracking-[0.12em] text-emerald-200/90">
                    {statusLabel}
                  </span>
                )}
              </>
            )}
            {project.featured && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[0.68rem] font-mono uppercase tracking-[0.12em] text-amber-300">
                <Sparkles size={12} />
                Featured
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full border border-secondary/50 bg-primary/40 px-3 py-1 text-[0.68rem] font-mono uppercase tracking-[0.12em] text-text-muted">
              <Calendar size={11} />
              {project.year}
            </span>
          </div>

          <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-2xl font-bold text-text">{project.title}</h3>
          </div>
          {subtitle && (
            <p className="mb-2 text-xs font-mono uppercase tracking-[0.12em] text-accent/90">{subtitle}</p>
          )}
          {outcome && (
            <p className="mb-3 inline-flex max-w-full items-center rounded-full border border-green-400/25 bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-100/95">
              {outcome}
            </p>
          )}

          <p className="text-text-muted text-sm leading-relaxed line-clamp-3">{project.shortDescription}</p>

          {impact.length > 0 && (
            <ul className="mt-4 space-y-1.5 border-t border-white/10 pt-4">
              {impact.slice(0, 3).map((m) => (
                <li
                  key={`${m.label}-${m.value}`}
                  className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-text-muted"
                >
                  <span className="font-mono uppercase tracking-[0.15em] text-text-muted/90 line-clamp-1 flex-1">{m.label}</span>
                  <span className="font-semibold text-accent shrink-0">
                    {m.value}
                    {m.suffix ? ` ${m.suffix}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {(Array.isArray(project.tech) ? project.tech : []).slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-accent/20 bg-primary/70 px-3 py-1 text-xs font-mono text-accent"
              >
                {tech}
              </span>
            ))}
          </div>

          <div className={`mt-auto pt-5 grid gap-3 ${hasLive && hasGithub ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
            {hasLive ? (
              <a
                href={project.external}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-primary transition-transform duration-300 hover:scale-[1.01]"
              >
                <ExternalLink size={14} />
                Live Demo
              </a>
            ) : (
              <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-secondary/40 bg-secondary/25 px-4 py-3 text-sm font-semibold text-text-muted">
                <ExternalLink size={14} />
                No live link
              </span>
            )}
            {hasGithub ? (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 inline-flex items-center justify-center gap-2 rounded-xl border border-secondary/60 bg-secondary/30 px-4 py-3 text-sm font-semibold text-text transition-colors hover:border-accent/50 hover:text-accent"
              >
                <Github size={14} />
                Source
              </a>
            ) : (
              <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-secondary/40 bg-secondary/25 px-4 py-3 text-sm font-semibold text-text-muted">
                <Github size={14} />
                No public repo
              </span>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 text-sm">
            <span className="text-text-muted">Open case study</span>
            <a
              href={`/projects/${projectSlug}`}
              className="relative z-10 inline-flex items-center gap-1 font-mono text-accent hover:text-text"
            >
              Full page
              <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

const ChipToggle = ({ active, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-mono transition-colors ${
      active
        ? 'bg-accent/15 text-accent border border-accent/30'
        : 'bg-primary/50 text-text-muted border border-secondary/40 hover:border-accent/25 hover:text-text'
    }`}
  >
    {label}
  </button>
);

const ProjectsSkeleton = () => (
  <div className="space-y-8 animate-pulse" aria-hidden>
    <div className="grid gap-6 lg:grid-cols-2">
      {[0, 1].map((i) => (
        <div key={i} className="h-72 rounded-3xl border border-white/10 bg-secondary/30" />
      ))}
    </div>
    <div className="space-y-6 pl-8 md:pl-14">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-64 rounded-3xl border border-white/10 bg-secondary/25" />
      ))}
    </div>
  </div>
);

const Projects = ({ isHomepage = false }) => {
  const { data: projectsDoc, loading } = useCmsDoc(CMS_DOCS.projects, { items: [] });
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedTech, setSelectedTech] = useState([]);
  const [onlyLive, setOnlyLive] = useState(false);
  const [onlySource, setOnlySource] = useState(false);
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [query, setQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const projectsList = useMemo(
    () => (Array.isArray(projectsDoc?.items) ? projectsDoc.items : []),
    [projectsDoc]
  );

  const techScrollRef = useRef(null);
  const isPointerDown = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);

  const categories = useMemo(
    () => ['All', ...new Set(projectsList.map((p) => p.category).filter(Boolean))],
    [projectsList]
  );

  const techOptions = useMemo(
    () => [...new Set(projectsList.flatMap((p) => (Array.isArray(p.tech) ? p.tech : [])))].sort(),
    [projectsList]
  );

  const toggleTech = (tech) => {
    setSelectedTech((prev) => (prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]));
  };

  const filteredProjects = useMemo(() => {
    return projectsList.filter((project) => {
      const categoryMatch = activeCategory === 'All' || project.category === activeCategory;
      const tech = Array.isArray(project.tech) ? project.tech : [];
      const techMatch =
        selectedTech.length === 0 || selectedTech.some((t) => tech.includes(t));
      const search = query.trim().toLowerCase();
      const searchMatch =
        !search ||
        String(project.title || '').toLowerCase().includes(search) ||
        String(project.shortDescription || '').toLowerCase().includes(search) ||
        String(project.description || '').toLowerCase().includes(search) ||
        String(project.client || '').toLowerCase().includes(search) ||
        String(project.industry || '').toLowerCase().includes(search) ||
        String(project.role || '').toLowerCase().includes(search) ||
        tech.some((t) => t.toLowerCase().includes(search)) ||
        (Array.isArray(project.tags) && project.tags.some((t) => t.toLowerCase().includes(search)));

      const liveOk = !onlyLive || isUsableHttpUrl(project.external);
      const sourceOk = !onlySource || isUsableHttpUrl(project.github);
      const featuredOk = !onlyFeatured || project.featured;
      const statusOk = project.status !== 'Draft';

      return (
        categoryMatch &&
        techMatch &&
        searchMatch &&
        liveOk &&
        sourceOk &&
        featuredOk &&
        statusOk
      );
    });
  }, [
    projectsList,
    activeCategory,
    selectedTech,
    onlyLive,
    onlySource,
    onlyFeatured,
    query,
  ]);

  const displayProjects = useMemo(() => {
    const sorted = [...filteredProjects].sort((a, b) => {
      const featA = a.featured ? 1 : 0;
      const featB = b.featured ? 1 : 0;
      if (featA !== featB) {
        return featB - featA;
      }
      const ya = Number(a.year) || 0;
      const yb = Number(b.year) || 0;
      return sortOrder === 'desc' ? yb - ya : ya - yb;
    });

    if (isHomepage) {
      return sorted.slice(0, 3);
    }
    return sorted;
  }, [filteredProjects, isHomepage, sortOrder]);

  const filterCount = useMemo(() => {
    let n = 0;
    if (activeCategory !== 'All') n += 1;
    n += selectedTech.length;
    if (query.trim().length > 0) n += 1;
    if (sortOrder !== 'desc') n += 1;
    return n;
  }, [
    activeCategory,
    selectedTech.length,
    query,
    sortOrder,
  ]);

  const hasActiveFilters = filterCount > 0;
  const showClearPill = filterCount >= 2;
  const isEmpty = !loading && projectsList.length === 0;

  const clearAllFilters = () => {
    setActiveCategory('All');
    setSelectedTech([]);
    setOnlyLive(false);
    setOnlySource(false);
    setOnlyFeatured(false);
    setQuery('');
    setSortOrder('desc');
  };

  return (
    <SectionWrapper id="projects">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative">
        {/* Header title (spacing fixed, 05. prefix hidden on subpage) */}
        <div className={`mb-6 flex flex-wrap items-center gap-2 text-xl sm:text-2xl md:text-3xl font-bold text-text font-display gradient-text ${!isHomepage ? 'mt-8 md:mt-12' : ''}`}>
          {isHomepage && (
            <span className="text-accent font-mono text-lg sm:text-xl mr-0 sm:mr-2">05.</span>
          )}
          <span className="flex-grow min-w-0">
            {isHomepage ? 'Some Things I’ve Built' : 'All Projects'}
          </span>
          <span className="h-px bg-secondary flex-grow min-w-[60px] ml-0 sm:ml-4 opacity-50 w-full sm:w-auto order-3 sm:order-none"></span>
        </div>

        {/* 1. Conditionally render search and collapsible filters for subpage archive only */}
        {!isHomepage && (
          <>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 items-stretch">
              {/* Search Box */}
              <div className="rounded-2xl border border-white/10 bg-secondary/20 p-3 sm:p-4 backdrop-blur-md flex flex-col justify-center flex-grow">
                <label className="sr-only" htmlFor="project-search">
                  Search projects
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-secondary/50 bg-primary/50 px-4 py-2.5">
                  <Search size={18} className="text-accent shrink-0" />
                  <input
                    id="project-search"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search title, description, tech, tags, role, client, industry…"
                    className="w-full bg-transparent text-text placeholder:text-text-muted outline-none text-sm"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="text-text-muted hover:text-accent transition-colors"
                      aria-label="Clear search"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Filters Toggle Button */}
              <button
                type="button"
                onClick={() => setFiltersOpen(!filtersOpen)}
                className={`flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition-all duration-300 backdrop-blur-md ${
                  filtersOpen || filterCount > 0
                    ? 'border-accent/40 bg-accent/10 text-accent'
                    : 'border-white/10 bg-secondary/20 text-text-muted hover:border-accent/30 hover:text-text'
                }`}
              >
                <motion.div
                  animate={{ rotate: filtersOpen ? 90 : 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="flex items-center justify-center"
                >
                  <SlidersHorizontal size={16} />
                </motion.div>
                <span>Filters</span>
                {filterCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    key={filterCount}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-primary"
                  >
                    {filterCount}
                  </motion.span>
                )}
              </button>

              {/* Sort Controls */}
              <div className="rounded-2xl border border-white/10 bg-secondary/20 p-3 sm:p-4 backdrop-blur-md flex items-center gap-2 shrink-0 justify-center">
                <button
                  type="button"
                  onClick={() => setSortOrder('desc')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-mono transition-colors ${
                    sortOrder === 'desc'
                      ? 'bg-accent/15 text-accent border border-accent/30'
                      : 'bg-primary/50 text-text-muted border border-secondary/40 hover:border-accent/25 hover:text-text'
                  }`}
                >
                  Newest
                </button>
                <button
                  type="button"
                  onClick={() => setSortOrder('asc')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-mono transition-colors ${
                    sortOrder === 'asc'
                      ? 'bg-accent/15 text-accent border border-accent/30'
                      : 'bg-primary/50 text-text-muted border border-secondary/40 hover:border-accent/25 hover:text-text'
                  }`}
                >
                  Oldest
                </button>
              </div>
            </div>

            {/* Collapsible Filter Panel */}
            <AnimatePresence initial={false}>
              {filtersOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-secondary/10 p-5 sm:p-6 backdrop-blur-md mb-8 space-y-6"
                >
                  {/* Category Filter */}
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.14em] text-text-muted">
                      <Layers size={14} className="text-accent" />
                      Category
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <motion.button
                          key={category}
                          type="button"
                          onClick={() => setActiveCategory(category)}
                          className={`rounded-full px-3.5 py-1.5 text-xs font-mono transition-all duration-300 ${
                            activeCategory === category
                              ? 'bg-accent text-primary font-bold shadow-lg shadow-accent/25'
                              : 'border border-secondary/50 bg-secondary/30 text-text-muted hover:border-accent/40 hover:text-text'
                          }`}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          {category}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Tech Stack Multi-select */}
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.14em] text-text-muted">
                      <Layers size={14} className="text-accent" />
                      Tech stack (multi-select)
                    </div>
                    <div
                      ref={techScrollRef}
                      onPointerDown={(e) => {
                        if (!techScrollRef.current) return;
                        isPointerDown.current = true;
                        techScrollRef.current.setPointerCapture?.(e.pointerId);
                        startX.current = e.pageX - techScrollRef.current.offsetLeft;
                        startScroll.current = techScrollRef.current.scrollLeft;
                        techScrollRef.current.style.cursor = 'grabbing';
                      }}
                      onPointerMove={(e) => {
                        if (!isPointerDown.current || !techScrollRef.current) return;
                        e.preventDefault();
                        const x = e.pageX - techScrollRef.current.offsetLeft;
                        const walk = (x - startX.current) * 1.5;
                        techScrollRef.current.scrollLeft = startScroll.current - walk;
                      }}
                      onPointerUp={(e) => {
                        if (!isPointerDown.current || !techScrollRef.current) return;
                        isPointerDown.current = false;
                        techScrollRef.current.releasePointerCapture?.(e.pointerId);
                        techScrollRef.current.style.cursor = 'grab';
                      }}
                      onPointerCancel={(e) => {
                        if (!isPointerDown.current || !techScrollRef.current) return;
                        isPointerDown.current = false;
                        techScrollRef.current.releasePointerCapture?.(e.pointerId);
                        techScrollRef.current.style.cursor = 'grab';
                      }}
                      className="-mx-1 flex max-w-full gap-2 overflow-x-auto overflow-y-hidden px-1 pb-1 no-scrollbar cursor-grab select-none"
                    >
                      {techOptions.map((tech) => (
                        <button
                          key={tech}
                          type="button"
                          onClick={() => toggleTech(tech)}
                          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-mono transition-colors ${
                            selectedTech.includes(tech)
                              ? 'bg-accent/15 text-accent border border-accent/30'
                              : 'bg-primary/50 text-text-muted border border-secondary/40 hover:border-accent/25 hover:text-text'
                          }`}
                        >
                          {tech}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggle Chips */}
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.14em] text-text-muted">
                      <Layers size={14} className="text-accent" />
                      Status & Features
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <ChipToggle active={onlyLive} label="Has live demo" onClick={() => setOnlyLive((v) => !v)} />
                      <ChipToggle active={onlySource} label="Has source code" onClick={() => setOnlySource((v) => !v)} />
                      <ChipToggle active={onlyFeatured} label="Featured only" onClick={() => setOnlyFeatured((v) => !v)} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {hasActiveFilters && (
              <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-text-muted">
                <span>
                  Showing {filteredProjects.length} project{filteredProjects.length === 1 ? '' : 's'}
                </span>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className={
                    showClearPill
                      ? 'rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-mono text-accent hover:bg-accent/15'
                      : 'text-sm text-accent hover:underline'
                  }
                >
                  {showClearPill ? 'Clear all filters' : 'Clear filters'}
                </button>
              </div>
            )}
          </>
        )}

        {/* 2. Core content grid renderer */}
        {loading || projectsDoc === undefined ? (
          <ProjectsSkeleton />
        ) : isEmpty ? (
          <motion.div
            initial={{ opacity: 0.6 }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-2xl border border-secondary/50 bg-secondary/20 px-6 py-16 text-center text-text-muted"
          >
            No projects have been added yet. Open the admin panel and create your first project.
          </motion.div>
        ) : (
          <>
            {displayProjects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border border-dashed border-secondary/50 bg-secondary/15 px-6 py-16 text-center text-text-muted"
              >
                No projects match your current search and filters.
              </motion.div>
            ) : (
              <motion.div layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {displayProjects.map((project, index) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={{
                        opacity: { duration: 0.25 },
                        layout: { type: 'spring', stiffness: 320, damping: 30 },
                        scale: { duration: 0.25 }
                      }}
                      key={project.id || project.title}
                      className="relative h-full"
                    >
                      <ProjectCard
                        project={project}
                        index={index}
                        compact
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Homepage button navigation */}
            {isHomepage && displayProjects.length > 0 && (
              <div className="mt-12 flex justify-center">
                <a
                  href="/projects"
                  className="group inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-6 py-3 font-mono text-sm font-semibold text-accent shadow-lg shadow-accent/5 backdrop-blur-md transition-all duration-300 hover:border-accent/60 hover:bg-accent/15 hover:scale-[1.02] active:scale-[0.98]"
                >
                  View All Projects
                  <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </SectionWrapper>
  );
};

export default Projects;
