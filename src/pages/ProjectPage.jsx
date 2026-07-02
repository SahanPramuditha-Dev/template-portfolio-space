import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, useScroll, useSpring, useTransform, AnimatePresence, useMotionValueEvent } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink, Github, Calendar, Layers, Target, Zap, ArrowLeft, ArrowRight, Clock, Code2, Database, Layout, Server, Globe, Boxes, FileText, Download, Lock } from 'lucide-react';
import SEO from '../components/SEO';
import PageShell from '../components/PageShell';
import AnimatedCounter from '../components/AnimatedCounter';
import { PageBodyCmsSkeleton } from '../components/CmsShapeSkeleton';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import { isUsableHttpUrl } from '../utils/projectUrls';
import { getImpactMetrics, getMediaSlides } from '../utils/projectNormalize';
import { slugify } from '../utils/slugify';
import { renderSimpleMarkdown } from '../utils/markdown';

const getTechIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes('react') || n.includes('vue') || n.includes('next')) return <Boxes size={18} />;
  if (n.includes('node') || n.includes('express') || n.includes('backend') || n.includes('server')) return <Server size={18} />;
  if (n.includes('firebase') || n.includes('sql') || n.includes('mongo') || n.includes('db')) return <Database size={18} />;
  if (n.includes('css') || n.includes('tailwind') || n.includes('ui') || n.includes('design')) return <Layout size={18} />;
  if (n.includes('api') || n.includes('cloud') || n.includes('web')) return <Globe size={18} />;
  return <Code2 size={18} />;
};

const ProjectPage = () => {
  const { slug } = useParams();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('story'); // story, technical, impact
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const { data, loading } = useCmsDoc(CMS_DOCS.projects, { items: [] });
  const projects = useMemo(() => (Array.isArray(data?.items) ? data.items : []), [data]);

  // UNCONDITIONAL HOOKS (Must be above early returns)
  const { scrollYProgress, scrollY } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const heroY = useTransform(scrollY, [0, 800], [0, 200]);
  
  const [showActionBar, setShowActionBar] = useState(false);
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 500 && !showActionBar) setShowActionBar(true);
    else if (latest <= 500 && showActionBar) setShowActionBar(false);
  });

  const project = projects.find((item) => {
    const candidates = [item.id, item.slug, item.title, item.missionCode].map(slugify).filter(Boolean);
    return candidates.includes(slug);
  });

  if (loading || data === undefined) {
    return (
      <>
        <SEO title="Project | Sahan Pramuditha" description="Loading project details." canonicalPath={`/projects/${slug || ''}`} />
        <PageShell eyebrow="Case Study" title="Loading project" description="Fetching project details.">
          <PageBodyCmsSkeleton />
        </PageShell>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <SEO title="Project not found | Sahan Pramuditha" description="The requested project could not be found." canonicalPath={`/projects/${slug || ''}`} noindex />
        <PageShell
          eyebrow="Portfolio"
          title="Project not found"
          description="That case study is not published yet or the URL is wrong."
          backHref="/#projects"
        >
          <div className="rounded-3xl border border-white/10 bg-secondary/20 p-10 text-center text-text-muted">
            Try another project from the homepage.
          </div>
        </PageShell>
      </>
    );
  }

  const pageSlug = slugify(project.slug || project.id || project.title || project.missionCode);
  const description = project.shortDescription || project.description || 'Project case study and build details.';
  const slides = getMediaSlides(project);
  const heroSlide = slides[activeSlideIndex] || slides[0];
  const impactMetrics = getImpactMetrics(project);
  const tech = Array.isArray(project.tech) ? project.tech : [];
  const features = Array.isArray(project.features) ? project.features : [];
  const documents = Array.isArray(project.documents) ? project.documents : [];
  const hasLive = isUsableHttpUrl(project.external);
  const hasGithub = isUsableHttpUrl(project.github);

  const currentIndex = projects.findIndex(p => (p.id === project.id || p.title === project.title));
  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const nextProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

  const nextSlide = () => setActiveSlideIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setActiveSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);

  // Feature 1: Read Time
  const allText = [project.description, description, project.problem, project.solution, project.architecture, project.learned, project.lessonsLearned].filter(Boolean).join(' ');
  const wordCount = allText.split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <>
      <SEO
        title={`${project.title || 'Project'} | Sahan Pramuditha`}
        description={description}
        canonicalPath={`/projects/${pageSlug}`}
        ogImage={heroSlide?.kind === 'image' ? heroSlide.url : undefined}
      />
      
      {/* Top Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-accent origin-left z-50 shadow-[0_0_15px_rgb(var(--color-accent-rgb))]" 
        style={{ scaleX }} 
      />

      <PageShell
        backHref="/#projects"
      >
        <article className="mx-auto w-full max-w-5xl space-y-12 lg:space-y-16 pb-20">
          {/* Hero Section */}
          <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-2xl h-[40vh] min-h-[300px] md:h-[60vh] md:min-h-[500px]">
            <motion.div style={{ y: heroY }} className="absolute inset-0 w-full h-full">
              {heroSlide?.kind === 'video' ? (
                <div className="relative h-full w-full flex items-center justify-center bg-black">
                  <img src={heroSlide.poster || ''} alt="" className="absolute inset-0 h-[120%] w-[120%] -left-[10%] -top-[10%] object-cover opacity-30 blur-3xl saturate-200" aria-hidden="true" />
                  <video src={heroSlide.url} controls playsInline preload="metadata" className="relative z-10 h-full w-full object-contain p-4 md:p-8 drop-shadow-2xl" />
                </div>
              ) : heroSlide ? (
                <div className="relative h-full w-full flex items-center justify-center bg-black">
                  <img src={heroSlide.url} alt="" className="absolute inset-0 h-[120%] w-[120%] -left-[10%] -top-[10%] object-cover opacity-30 blur-3xl saturate-200" aria-hidden="true" />
                  <img src={heroSlide.url} alt={heroSlide.alt || project.title} className="relative z-10 h-full w-full object-contain p-4 md:p-8 drop-shadow-2xl" loading="lazy" decoding="async" />
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top_left,rgb(var(--color-accent-rgb)/0.22),transparent_45%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.82))]">
                  <Layers size={54} className="text-accent/80" />
                </div>
              )}
            </motion.div>
            {/* Dark gradients for readability */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />

            {/* Gallery Navigation */}
            {slides.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur-md transition-all hover:bg-accent hover:text-primary z-20"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur-md transition-all hover:bg-accent hover:text-primary z-20"
                >
                  <ChevronRight size={24} />
                </button>
                <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2 z-20">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSlideIndex(i)}
                      className={`h-2.5 rounded-full transition-all ${
                        i === activeSlideIndex ? 'w-8 bg-accent' : 'w-2.5 bg-white/50 hover:bg-white/80'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Header & Quick Facts */}
          <div className="mx-auto max-w-5xl space-y-10 px-4 sm:px-6">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight text-text md:text-5xl lg:text-6xl">
                {project.title}
              </h1>
              <p className="text-xl font-medium text-accent">{project.role}</p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {project.year && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/40 bg-primary/40 px-4 py-2 text-xs text-text-muted font-medium font-mono">
                  <Calendar size={13} />
                  {project.year}
                </span>
              )}
              <span className={`rounded-full px-4 py-2 text-xs font-mono border ${
                project.projectType === 'client'
                  ? 'border-blue-400/25 bg-blue-500/10 text-blue-300'
                  : 'border-cyan-400/25 bg-cyan-500/10 text-cyan-300'
              }`}>
                {project.projectType === 'client' ? 'Client Project' : 'Personal Project'}
              </span>
              {project.category && (
                <span className="rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-xs font-mono text-accent">
                  {project.category}
                </span>
              )}
              <span className={`rounded-full px-4 py-2 text-xs font-mono border ${
                project.completed === true || project.completed === 'true'
                  ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-300'
                  : 'border-amber-400/25 bg-amber-500/10 text-amber-300'
              }`}>
                {project.completed === true || project.completed === 'true' ? 'Completed' : 'In Progress'}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-text-muted font-medium font-mono">
                <Clock size={13} />
                {readTime} min read
              </span>
            </div>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {hasLive && (
                <a href={project.external} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-8 py-4 font-bold text-primary transition-transform hover:scale-[1.02]">
                  <ExternalLink size={18} />
                  Live Demo
                </a>
              )}
              {project.isPrivate === true || project.isPrivate === 'true' ? (
                <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-8 py-4 font-bold text-text-muted select-none">
                  <Lock size={16} className="text-text-muted/65" />
                  Private Codebase
                </span>
              ) : (
                hasGithub && (
                  <a href={project.github} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/5 px-8 py-4 font-bold text-accent transition-colors hover:bg-accent/10">
                    <Github size={18} />
                    Source Code
                  </a>
                )
              )}
            </div>

            {(() => {
              const metaItems = [
                ['Client', project.client || project.company, <Target size={16} />],
                ['Industry', project.industry, <Layers size={16} />],
                ['Timeline', project.projectTimeline, <Calendar size={16} />],
                ['Team', project.teamSize, <Zap size={16} />],
              ].filter(([, value]) => value);

              if (metaItems.length === 0) return null;

              let gridCols = 'grid-cols-2 lg:grid-cols-4';
              if (metaItems.length === 1) gridCols = 'grid-cols-1';
              if (metaItems.length === 2) gridCols = 'grid-cols-1 sm:grid-cols-2';
              if (metaItems.length === 3) gridCols = 'grid-cols-1 sm:grid-cols-3';

              return (
                <dl className={`grid ${gridCols} gap-4 p-4 rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl`}>
                  {metaItems.map(([label, value, icon]) => (
                    <div key={label} className="group flex flex-col justify-center rounded-2xl border border-white/5 bg-white/5 p-6 transition-colors hover:bg-accent/10 hover:border-accent/30">
                      <dt className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted transition-colors group-hover:text-accent">
                        {icon}
                        {label}
                      </dt>
                      <dd className="text-lg font-black tracking-tight text-white">{value}</dd>
                    </div>
                  ))}
                </dl>
              );
            })()}
          </div>

          {/* Snappy Case Study Tab Selector */}
          <div className="mx-auto max-w-5xl px-4 sm:px-6 mb-12">
            <div className="relative flex rounded-full border border-white/10 bg-secondary/15 p-1 backdrop-blur-md">
              {['story', 'technical', 'impact'].map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative flex-1 py-3 text-center text-xs font-mono font-bold uppercase tracking-wider transition-colors duration-300 z-10 ${
                      isActive ? 'text-primary' : 'text-text-muted hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute inset-0 rounded-full bg-accent shadow-[0_0_15px_rgb(var(--color-accent-rgb))]"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-20">{tab}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Wrapper */}
          <div className="mx-auto max-w-5xl px-4 sm:px-6 min-h-[380px]">
            <AnimatePresence mode="wait">
              {activeTab === 'story' && (
                <motion.div
                  key="story-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-12"
                >
                  {/* Overview Paragraph */}
                  {(project.description || description) && (
                    <section id="overview" className="max-w-none font-sans leading-relaxed text-text-muted text-base">
                      {renderSimpleMarkdown(project.description || description)}
                    </section>
                  )}

                  {/* Problem & Solution Cards */}
                  {(project.problem || project.solution) && (
                    <div className="grid gap-6 md:grid-cols-2">
                      {project.problem && (
                        <section id="problem" className="rounded-3xl border border-white/10 bg-secondary/20 p-6 md:p-8 backdrop-blur-md">
                          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-text">
                            <Target size={20} className="text-red-400" />
                            Problem
                          </h2>
                          <div className="font-sans text-sm text-text-muted leading-relaxed">
                            {renderSimpleMarkdown(project.problem)}
                          </div>
                        </section>
                      )}
                      {project.solution && (
                        <section id="solution" className="rounded-3xl border border-white/10 bg-secondary/20 p-6 md:p-8 backdrop-blur-md">
                          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-text">
                            <Zap size={20} className="text-yellow-400" />
                            Solution
                          </h2>
                          <div className="font-sans text-sm text-text-muted leading-relaxed">
                            {renderSimpleMarkdown(project.solution)}
                          </div>
                        </section>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'technical' && (
                <motion.div
                  key="technical-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-10"
                >
                  {/* Build Notes / Architecture */}
                  {(project.architecture || project.learned || project.lessonsLearned) && (
                    <section id="build-notes" className="rounded-3xl border border-white/10 bg-secondary/20 p-6 md:p-10 backdrop-blur-md">
                      <h2 className="mb-6 text-2xl font-bold text-text border-b border-white/10 pb-4">Build Notes & Architecture</h2>
                      <div className="space-y-8">
                        {project.architecture && (
                          <div className="font-sans text-sm text-text-muted leading-relaxed">
                            {renderSimpleMarkdown(project.architecture)}
                          </div>
                        )}
                        {(project.learned || project.lessonsLearned) && (
                          <div className="font-sans border-t border-white/10 pt-6">
                            <h3 className="mb-4 text-xl font-bold text-white tracking-tight">What I learned</h3>
                            <div className="text-sm text-text-muted leading-relaxed">
                              {renderSimpleMarkdown(project.learned || project.lessonsLearned)}
                            </div>
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  {/* Features and Tech Stack Row Grid */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {features.length > 0 && (
                      <section id="features" className="rounded-3xl border border-white/10 bg-secondary/20 p-6 backdrop-blur-md flex flex-col justify-between">
                        <div>
                          <h2 className="mb-4 text-lg font-bold text-text uppercase tracking-wider text-accent">Key Features</h2>
                          <ul className="grid gap-3 sm:grid-cols-2">
                            {(showAllFeatures ? features : features.slice(0, 6)).map((feature) => (
                              <li key={feature} className="rounded-xl border border-secondary/40 bg-primary/40 px-4 py-3 text-xs text-text-muted font-sans leading-relaxed flex items-start">
                                <span className="mr-2 text-accent text-sm leading-none">•</span>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        {features.length > 6 && (
                          <div className="mt-5 border-t border-white/5 pt-4 text-center">
                            <button
                              onClick={() => setShowAllFeatures(!showAllFeatures)}
                              className="px-4 py-2 rounded-xl border border-accent/20 bg-accent/5 hover:bg-accent/15 text-xs font-mono text-accent transition-all duration-300"
                            >
                              {showAllFeatures ? 'Show Less' : `Show More (+${features.length - 6})`}
                            </button>
                          </div>
                        )}
                      </section>
                    )}

                    {tech.length > 0 && (
                      <section id="tech" className="rounded-3xl border border-white/10 bg-secondary/20 p-6 backdrop-blur-md">
                        <h2 className="mb-4 text-lg font-bold text-text uppercase tracking-wider text-accent">Tech Stack</h2>
                        <div className="flex flex-wrap gap-2.5">
                          {tech.map((item) => (
                            <div key={item} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 hover:border-accent/30 hover:bg-accent/5 transition-all">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-accent">
                                {getTechIcon(item)}
                              </div>
                              <span className="font-mono text-xs font-semibold text-white/90">
                                {item}
                              </span>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'impact' && (
                <motion.div
                  key="impact-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-10"
                >
                  {/* Impact Metrics */}
                  {impactMetrics.length > 0 && (
                    <section id="impact" className="rounded-3xl border border-white/10 bg-secondary/20 p-6 md:p-8 backdrop-blur-md">
                      <h2 className="mb-6 text-xl font-bold text-text border-b border-white/10 pb-4">Impact Metrics</h2>
                      <div className="grid gap-4 sm:grid-cols-3">
                        {impactMetrics.map((metric) => (
                          <div key={`${metric.label}-${metric.value}`} className="rounded-2xl border border-accent/20 bg-accent/5 p-6 text-center hover:border-accent/40 transition-colors">
                            <AnimatedCounter value={metric.value} suffix={metric.suffix} />
                            <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">{metric.label}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Documents & Presentations */}
                  {documents.length > 0 && (
                    <section id="documents" className="rounded-3xl border border-white/10 bg-secondary/20 p-6 md:p-8 backdrop-blur-md">
                      <h2 className="mb-4 text-xl font-bold text-text">Documents & Presentations</h2>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {documents.map((doc, idx) => (
                          <a key={idx} href={doc.url} target="_blank" rel="noreferrer" className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-accent/10 hover:border-accent/30">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/40 text-accent transition-transform group-hover:scale-105">
                                <FileText size={18} />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-sm text-white group-hover:text-accent transition-colors">{doc.name || 'Document'}</span>
                                <span className="text-[10px] text-text-muted">PDF / Resource</span>
                              </div>
                            </div>
                            <div className="mr-1 text-text-muted transition-colors group-hover:text-accent">
                              <Download size={16} />
                            </div>
                          </a>
                        ))}
                      </div>
                    </section>
                  )}

                  {impactMetrics.length === 0 && documents.length === 0 && (
                    <div className="rounded-2xl border border-white/5 bg-secondary/10 p-8 text-center text-text-muted">
                      No metrics or slide documents are published for this project yet.
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </article>

        {/* Next / Previous Project Navigation */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 mt-20 border-t border-white/10 pt-16">
          <div className="grid sm:grid-cols-2 gap-6">
            {prevProject ? (
              <Link to={`/projects/${slugify(prevProject.slug || prevProject.id || prevProject.title || prevProject.missionCode)}`} className="group flex flex-col justify-center rounded-3xl border border-white/10 bg-secondary/20 p-8 transition-all hover:bg-secondary/40 hover:border-accent/40">
                <span className="mb-2 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-text-muted transition-colors group-hover:text-accent">
                  <ArrowLeft size={14} />
                  Previous Project
                </span>
                <span className="text-2xl font-bold text-text">{prevProject.title}</span>
              </Link>
            ) : <div />}
            {nextProject ? (
              <Link to={`/projects/${slugify(nextProject.slug || nextProject.id || nextProject.title || nextProject.missionCode)}`} className="group flex flex-col justify-center items-end text-right rounded-3xl border border-white/10 bg-secondary/20 p-8 transition-all hover:bg-secondary/40 hover:border-accent/40">
                <span className="mb-2 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-text-muted transition-colors group-hover:text-accent">
                  Next Project
                  <ArrowRight size={14} />
                </span>
                <span className="text-2xl font-bold text-text">{nextProject.title}</span>
              </Link>
            ) : <div />}
          </div>
        </div>
      </PageShell>

      {/* Floating Action Bar */}
      <AnimatePresence>
        {showActionBar && (hasLive || hasGithub) && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 rounded-full border border-white/10 bg-black/60 p-2 backdrop-blur-xl shadow-2xl"
          >
            {hasLive && (
              <a href={project.external} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-primary transition-transform hover:scale-105">
                <ExternalLink size={16} /> Live Demo
              </a>
            )}
            {hasGithub && (
              <a href={project.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/20">
                <Github size={16} /> Source Code
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProjectPage;
