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
  getProjectSearchText,
  isProjectPublished,
} from '../utils/projectNormalize';

const isAnimatedAsset = (src) => /\.(gif|mp4|webm)(\?|#|$)/i.test(src);

import { useNavigate, useSearchParams } from 'react-router-dom';

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
    if (e.target.closest('a[href], button')) return;
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
      className={`group relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-secondary/15 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_50px_rgba(6,182,212,0.12)] outline-none transition-all duration-300 hover:border-accent/40 hover:-translate-y-1.5 focus-visible:ring-2 focus-visible:ring-accent/50 ${
        compact ? 'h-full flex flex-col justify-between' : ''
      }`}
    >
      <div className="flex h-full flex-col justify-between">
        {/* Banner Section */}
        {hasMedia ? (
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
                      className={`h-12 w-12 overflow-hidden rounded-lg border bg-black/40 shadow-lg backdrop-blur-sm ${
                        i === coverIndex ? 'border-accent' : 'border-white/20'
                      }`}
                    >
                      <img src={src} alt="" className="h-full w-full object-cover smooth-img" loading="lazy" onLoad={(e) => e.currentTarget.classList.add('loaded')} />
                    </div>
                  ))}
                </div>
              )}
              {media.some(isAnimatedAsset) && (
                <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-accent/30 bg-black/40 px-2.5 py-1 text-[0.68rem] font-mono uppercase tracking-[0.14em] text-accent backdrop-blur-md">
                  <Play size={11} />
                  Motion preview
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent opacity-80" />

              <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-black/50 px-3 py-1 text-[0.68rem] font-mono font-medium uppercase tracking-[0.14em] text-accent backdrop-blur-md">
                  <Folder size={12} />
                  {project.category || 'Project'}
                </span>
                {project.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/15 px-2.5 py-1 text-[0.68rem] font-mono text-amber-300 backdrop-blur-md">
                    <Sparkles size={11} /> Featured
                  </span>
                )}
              </div>

              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-3">
                <p className="text-[0.7rem] font-mono uppercase tracking-[0.2em] text-white/80 font-medium">{project.year}</p>
              </div>
            </div>
          </div>
        ) : (
          /* Abstract Header Banner for Text-only Projects */
          <div className="relative aspect-[21/9] w-full overflow-hidden border-b border-white/10 bg-gradient-to-br from-slate-900 via-secondary/30 to-slate-950 flex items-center justify-between p-5 group-hover:border-accent/30 transition-colors">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/15 via-transparent to-transparent opacity-70" />
            <div className="relative z-10 flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-accent/15 border border-accent/30 text-accent shadow-inner group-hover:scale-105 transition-transform">
                <Folder size={22} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent font-semibold block">{project.category || 'SYSTEM SECURITY'}</span>
                <span className="text-xs font-mono text-text-muted">{project.missionCode || project.year}</span>
              </div>
            </div>
            {project.featured && (
              <span className="relative z-10 inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/15 px-3 py-1 text-[11px] font-mono text-amber-300">
                <Sparkles size={11} /> Featured
              </span>
            )}
          </div>
        )}

        {/* Card Body */}
        <div className="flex flex-1 flex-col p-6 sm:p-7 justify-between">
          <div>
            {/* Metadata & Status */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              {!hasMedia && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[0.68rem] font-mono font-medium text-accent">
                    {project.category}
                  </span>
                  {statusLabel && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-0.5 text-[0.68rem] font-mono text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {statusLabel}
                    </span>
                  )}
                </div>
              )}
              {hasMedia && statusLabel && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-0.5 text-[0.68rem] font-mono text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {statusLabel}
                </span>
              )}
              <span className="text-xs font-mono text-text-muted ml-auto">{project.year}</span>
            </div>

            <h3 className="text-2xl font-bold text-text mb-1 group-hover:text-accent transition-colors leading-snug">
              {project.title}
            </h3>
            {subtitle && (
              <p className="mb-2 text-xs font-mono uppercase tracking-[0.12em] text-accent/80">{subtitle}</p>
            )}
            {outcome && (
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{outcome}</span>
              </div>
            )}

            <p className="text-text-muted text-sm leading-relaxed line-clamp-3 mb-4">{project.shortDescription}</p>

            {impact.length > 0 && (
              <ul className="my-3 space-y-1 border-t border-white/10 pt-3">
                {impact.slice(0, 3).map((m) => (
                  <li
                    key={`${m.label}-${m.value}`}
                    className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-text-muted"
                  >
                    <span className="font-mono uppercase tracking-[0.15em] text-text-muted/80 line-clamp-1 flex-1">{m.label}</span>
                    <span className="font-semibold text-accent shrink-0">
                      {m.value}
                      {m.suffix ? ` ${m.suffix}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {/* Soft tech stack pills */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {(Array.isArray(project.tech) ? project.tech : []).slice(0, 5).map((tech) => (
                <span
                  key={tech}
                  className="rounded-md bg-accent/10 px-2.5 py-1 text-xs font-mono font-medium text-accent border-none"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {hasLive ? (
                <a
                  href={project.external}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-xs font-mono font-semibold text-primary shadow-md hover:bg-accent/90 transition-colors"
                >
                  <ExternalLink size={13} />
                  Live Demo
                </a>
              ) : (
                <span className="text-xs font-mono text-text-muted/60">No Live Demo</span>
              )}

              {hasGithub && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl border border-white/10 bg-white/5 text-text-muted hover:text-accent hover:border-accent/40 transition-colors"
                  aria-label="View source code on GitHub"
                >
                  <Github size={15} />
                </a>
              )}
            </div>

            <a
              href={`/projects/${projectSlug}`}
              className="inline-flex items-center gap-1 font-mono text-xs text-accent hover:text-text transition-colors font-medium group/link"
            >
              Case Study
              <ChevronRight size={14} className="transition-transform group-hover/link:translate-x-1" />
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
  const { data: projectsDoc, loading, error } = useCmsDoc(CMS_DOCS.projects, { items: [] });
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(() => searchParams.get('category') || 'All');
  const [selectedTech, setSelectedTech] = useState(() => searchParams.get('tech')?.split(',').filter(Boolean) || []);
  const [onlyLive, setOnlyLive] = useState(() => searchParams.get('live') === '1');
  const [onlySource, setOnlySource] = useState(() => searchParams.get('source') === '1');
  const [onlyFeatured, setOnlyFeatured] = useState(() => searchParams.get('featured') === '1');
  const [query, setQuery] = useState(() => searchParams.get('q') || '');
  const [sortOrder, setSortOrder] = useState(() => searchParams.get('sort') === 'asc' ? 'asc' : 'desc');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 12;

  const projectsList = useMemo(
    () => (Array.isArray(projectsDoc?.items) ? projectsDoc.items : []),
    [projectsDoc]
  );

  const techScrollRef = useRef(null);
  const isPointerDown = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);

  const categories = useMemo(
    () => ['All', ...new Set(projectsList.map((p) => String(p.category || '').trim()).filter(Boolean))].sort((a, b) => a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b)),
    [projectsList]
  );

  const techOptions = useMemo(
    () => [...new Set(projectsList.flatMap((p) => (Array.isArray(p.tech) ? p.tech : []).map((tech) => String(tech).trim()).filter(Boolean)))].sort((a, b) => a.localeCompare(b)),
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
        [project.title, project.shortDescription, project.description, project.client, project.industry, project.role, ...(Array.isArray(project.tags) ? project.tags : []), ...tech]
          .some((value) => getProjectSearchText(value).includes(search));

      const liveOk = !onlyLive || isUsableHttpUrl(project.external);
      const sourceOk = !onlySource || isUsableHttpUrl(project.github);
      const featuredOk = !onlyFeatured || project.featured;
      const statusOk = isProjectPublished(project);

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
    if (onlyLive) n += 1;
    if (onlySource) n += 1;
    if (onlyFeatured) n += 1;
    return n;
  }, [
    activeCategory,
    selectedTech.length,
    query,
    sortOrder,
    onlyLive,
    onlySource,
    onlyFeatured,
  ]);

  const hasActiveFilters = filterCount > 0;
  const showClearPill = filterCount >= 2;
  const isEmpty = !loading && !error && projectsList.length === 0;

  const clearAllFilters = () => {
    setActiveCategory('All');
    setSelectedTech([]);
    setOnlyLive(false);
    setOnlySource(false);
    setOnlyFeatured(false);
    setQuery('');
    setSortOrder('desc');
  };

  useEffect(() => {
    const next = new URLSearchParams();
    if (activeCategory !== 'All') next.set('category', activeCategory);
    if (selectedTech.length) next.set('tech', selectedTech.join(','));
    if (onlyLive) next.set('live', '1');
    if (onlySource) next.set('source', '1');
    if (onlyFeatured) next.set('featured', '1');
    if (query.trim()) next.set('q', query.trim());
    if (sortOrder !== 'desc') next.set('sort', sortOrder);
    setSearchParams(next, { replace: true });
  }, [activeCategory, selectedTech, onlyLive, onlySource, onlyFeatured, query, sortOrder, setSearchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, selectedTech, onlyLive, onlySource, onlyFeatured, query, sortOrder]);

  const paginatedProjects = useMemo(
    () => displayProjects.slice((currentPage - 1) * projectsPerPage, currentPage * projectsPerPage),
    [displayProjects, currentPage]
  );
  const totalPages = Math.ceil(displayProjects.length / projectsPerPage);

  const ContainerWrapper = isHomepage ? SectionWrapper : 'section';
  const wrapperProps = isHomepage ? { id: 'projects' } : { id: 'projects', className: 'relative z-10' };

  return (
    <ContainerWrapper {...wrapperProps}>
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs font-mono uppercase tracking-widest mb-3"
          >
            <Folder size={14} /> Selected Works & Systems
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text font-display mb-4"
          >
            Featured <span className="text-accent">Projects</span> & Engineering
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl text-text-muted text-sm sm:text-base"
          >
            A curated collection of web applications, production systems, and creative software experiments.
          </motion.p>
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
        ) : error ? (
          <div role="alert" className="rounded-2xl border border-red-400/25 bg-red-500/10 px-6 py-16 text-center text-red-200">
            <p className="text-lg font-semibold">Projects could not be loaded.</p>
            <p className="mt-2 text-sm text-red-200/75">Check the connection or try refreshing the page.</p>
          </div>
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
                  {paginatedProjects.map((project, index) => (
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

            {!isHomepage && totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4" aria-label="Project pages">
                <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-text-muted disabled:opacity-40 hover:border-accent/40 hover:text-accent">Previous</button>
                <span className="font-mono text-xs text-text-muted">Page {currentPage} of {totalPages}</span>
                <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => page + 1)} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-text-muted disabled:opacity-40 hover:border-accent/40 hover:text-accent">Next</button>
              </div>
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
    </ContainerWrapper>
  );
};

export default Projects;
