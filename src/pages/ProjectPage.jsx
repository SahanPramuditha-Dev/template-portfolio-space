import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, useScroll, useSpring, useTransform, AnimatePresence, useMotionValueEvent } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink, Github, Calendar, Layers, Target, Zap, ArrowLeft, ArrowRight, Clock, Code2, Database, Layout, Server, Globe, Boxes, FileText, Download, Lock, Users, Check, ClipboardCopy, Sparkles, Rocket, Lightbulb, Award } from 'lucide-react';
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
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
  
  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  const { data, loading } = useCmsDoc(CMS_DOCS.projects, { items: [] });
  const projects = useMemo(() => (Array.isArray(data?.items) ? data.items : []), [data]);

  // UNCONDITIONAL HOOKS (Must be above early returns)
  const { scrollYProgress, scrollY } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const heroY = useTransform(scrollY, [0, 800], [0, 200]);

  React.useEffect(() => {
    if (loading || !projects || projects.length === 0) return;
    const activeProj = projects.find((item) => {
      const candidates = [item.id, item.slug, item.title, item.missionCode].map(slugify).filter(Boolean);
      return candidates.includes(slug);
    });
    if (!activeProj) return;

    const slidesList = getMediaSlides(activeProj);
    if (slidesList.length <= 1 || isAutoplayPaused) return;

    const interval = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % slidesList.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [projects, loading, slug, isAutoplayPaused]);
  
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

  const getSnippet = (value, max = 78) => {
    if (!value) return '';
    const plain = String(value)
      .replace(/[#>*`_~[\]()]/g, '')
      .replace(/\n+/g, ' ')
      .trim();
    return plain.length > max ? `${plain.slice(0, max)}…` : plain;
  };

  const snapshotItems = [
    {
      label: 'Role',
      value: project.role || 'Product design + front-end engineering',
      icon: <Target size={16} className="text-accent" />,
    },
    {
      label: 'Challenge',
      value: getSnippet(project.problem, 72) || 'Making a learning platform feel calm, focused, and motivating.',
      icon: <Lightbulb size={16} className="text-amber-400" />,
    },
    {
      label: 'Outcome',
      value: getSnippet(project.solution, 72) || 'A polished experience with strong visual hierarchy and a clear action path.',
      icon: <Award size={16} className="text-emerald-400" />,
    },
  ];

  const highlightPoints = features.length > 0 ? features.slice(0, 3) : ['Focused UX flow', 'Fast, polished interactions', 'Clear product storytelling'];

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
      
      {/* Dynamic Starfield Particle Background */}
      <CanvasStarfield />

      {/* Top Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-accent origin-left z-50 shadow-[0_0_15px_rgb(var(--color-accent-rgb))]" 
        style={{ scaleX }} 
      />

      <PageShell
        backHref="/#projects"
      >
        <article className="relative z-10 mx-auto w-full max-w-5xl space-y-6 pb-12">
          {/* Hero Section - Floating Browser Canvas */}
          <div 
            className="relative w-full"
            onMouseEnter={() => setIsAutoplayPaused(true)}
            onMouseLeave={() => setIsAutoplayPaused(false)}
          >
            <motion.div style={{ y: heroY }} className="relative mx-auto w-[94%] max-w-4xl h-[30vh] min-h-[260px] md:h-[45vh] md:min-h-[400px] flex items-center justify-center">
              {heroSlide?.kind === 'video' ? (
                <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
                  {/* Glowing Ambient Blurred Shadow */}
                  {heroSlide.poster && (
                    <img src={heroSlide.poster} alt="" className="absolute inset-0 h-full w-full object-cover scale-110 blur-3xl opacity-35 saturate-150 smooth-img" aria-hidden="true" onLoad={(e) => e.currentTarget.classList.add('loaded')} />
                  )}
                  {/* MacBook / Browser Frame mockup */}
                  <div className="relative z-10 w-full h-full rounded-2xl border border-white/10 bg-secondary/90 shadow-[0_24px_80px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col">
                    {/* Browser header bar */}
                    <div className="h-7 shrink-0 border-b border-white/5 bg-white/[0.03] px-4 flex items-center justify-between">
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                      </div>
                      <div className="w-1/3 max-w-[200px] h-4 rounded bg-black/30 border border-white/5 flex items-center justify-center text-[9px] text-text-muted font-mono tracking-tight select-none">
                        {project.title.toLowerCase()}.dev/app
                      </div>
                      <div className="w-6" /> {/* spacer balance */}
                    </div>
                    <div className="flex-1 w-full h-full overflow-hidden bg-black/60 flex items-center justify-center p-1">
                      <video src={heroSlide.url} controls playsInline preload="metadata" className="w-full h-full object-contain object-top rounded-lg" />
                    </div>
                  </div>
                </div>
              ) : heroSlide ? (
                <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
                  {/* Glowing Ambient Blurred Shadow */}
                  <img src={heroSlide.url} alt="" className="absolute inset-0 h-full w-full object-cover scale-115 blur-3xl opacity-40 saturate-150 smooth-img" aria-hidden="true" onLoad={(e) => e.currentTarget.classList.add('loaded')} />
                  {/* MacBook / Browser Frame mockup */}
                  <div className="relative z-10 w-full h-full rounded-2xl border border-white/10 bg-secondary/90 shadow-[0_24px_80px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col">
                    {/* Browser header bar */}
                    <div className="h-7 shrink-0 border-b border-white/5 bg-white/[0.03] px-4 flex items-center justify-between">
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                      </div>
                      <div className="w-1/3 max-w-[200px] h-4 rounded bg-black/30 border border-white/5 flex items-center justify-center text-[9px] text-text-muted font-mono tracking-tight select-none">
                        {project.title.toLowerCase()}.dev/app
                      </div>
                      <div className="w-6" /> {/* spacer balance */}
                    </div>
                    <div className="flex-1 w-full h-full overflow-hidden bg-black/60 flex items-center justify-center p-1">
                      <img src={heroSlide.url} alt={heroSlide.alt || project.title} className="w-full h-full object-contain object-top rounded-lg" loading="lazy" decoding="async" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top_left,rgb(var(--color-accent-rgb)/0.22),transparent_45%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.82))]">
                  <Layers size={54} className="text-accent/80" />
                </div>
              )}
            </motion.div>

            {/* Gallery Navigation Arrows - floating next to the browser mockup */}
            {slides.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-black/40 hover:bg-black/75 border border-white/5 p-2 md:p-3 text-white backdrop-blur-md transition-all hover:text-accent z-20"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-black/40 hover:bg-black/75 border border-white/5 p-2 md:p-3 text-white backdrop-blur-md transition-all hover:text-accent z-20"
                  aria-label="Next Slide"
                >
                  <ChevronRight size={20} />
                </button>
                {/* Dots Navigation below browser */}
                <div className="absolute -bottom-6 left-1/2 flex -translate-x-1/2 gap-1.5 z-20">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSlideIndex(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === activeSlideIndex ? 'w-5 bg-accent shadow-[0_0_10px_rgb(var(--color-accent-rgb))]' : 'w-1.5 bg-white/40 hover:bg-white/70'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Header & Quick Facts */}
          <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6">
            <div className="text-center space-y-3">
              <h1 className="text-4xl font-extrabold tracking-tight text-text md:text-5xl lg:text-6xl">
                {project.title}
              </h1>
              <p className="text-xl font-medium text-accent">{project.role}</p>
              {project.shortDescription && (
                <p className="mx-auto max-w-2xl text-center text-sm md:text-base text-text-muted leading-relaxed font-sans mt-2">
                  {project.shortDescription}
                </p>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {project.year && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/40 bg-primary/40 px-4 py-2 text-xs text-text-muted font-medium font-mono">
                  <Calendar size={13} />
                  {project.year}
                </span>
              )}
              {project.projectTimeline && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/40 bg-primary/40 px-4 py-2 text-xs text-text-muted font-medium font-mono">
                  <Clock size={13} />
                  {project.projectTimeline}
                </span>
              )}
              {project.teamSize && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/40 bg-primary/40 px-4 py-2 text-xs text-text-muted font-medium font-mono">
                  <Users size={13} className="text-accent" />
                  Team: {project.teamSize}
                </span>
              )}
              {project.client && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/40 bg-primary/40 px-4 py-2 text-xs text-text-muted font-medium font-mono">
                  <Target size={13} className="text-accent" />
                  Client: {project.client}
                </span>
              )}
              <span className={`rounded-full px-4 py-2 text-xs font-mono border ${
                project.projectType === 'client'
                  ? 'border-blue-400/25 bg-blue-500/10 text-blue-300'
                  : 'border-cyan-400/25 bg-cyan-500/10 text-cyan-300'
              }`}>
                {project.projectType === 'client' ? 'Client' : 'Personal'}
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
                <FileText size={13} />
                {readTime} min read
              </span>
            </div>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
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

            {/* Instant access Demo Credentials Card */}
            {(project.demoEmail || project.demoPassword) && (
              <div className="mx-auto max-w-md rounded-2xl border border-white/5 bg-secondary/10 p-4 shadow-lg backdrop-blur-md">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted text-center flex items-center justify-center gap-1.5">
                  <Lock size={12} className="text-accent" />
                  Demo Platform Credentials
                </p>
                <div className="grid gap-2 sm:grid-cols-2 text-xs font-mono">
                  {project.demoEmail && (
                    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/30 px-3 py-2">
                      <span className="text-text-muted truncate select-all mr-2" title={project.demoEmail}>{project.demoEmail}</span>
                      <button
                        onClick={() => copyToClipboard(project.demoEmail, 'email')}
                        className="text-accent hover:text-white transition-colors shrink-0 p-1 rounded hover:bg-white/5"
                        title="Copy Email"
                      >
                        {copiedEmail ? <Check size={14} className="text-emerald-400" /> : <ClipboardCopy size={14} />}
                      </button>
                    </div>
                  )}
                  {project.demoPassword && (
                    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/30 px-3 py-2">
                      <span className="text-text-muted truncate select-all mr-2" title={project.demoPassword}>{project.demoPassword}</span>
                      <button
                        onClick={() => copyToClipboard(project.demoPassword, 'password')}
                        className="text-accent hover:text-white transition-colors shrink-0 p-1 rounded hover:bg-white/5"
                        title="Copy Password"
                      >
                        {copiedPassword ? <Check size={14} className="text-emerald-400" /> : <ClipboardCopy size={14} />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dynamic metadata cards are removed as they are displayed inline above */}
          </div>

          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.08 }}
                className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-accent/10 via-secondary/20 to-primary/70 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl md:p-7"
              >
                <div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-accent">
                  <Sparkles size={14} />
                  Mission snapshot
                </div>
                <h2 className="text-2xl font-bold text-text">A sharper story for {project.title}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-muted">
                  This section gives visitors confidence quickly by showing the role, the challenge, and the outcome in a much more visual way.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {snapshotItems.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="mb-3 inline-flex rounded-xl border border-white/10 bg-white/5 p-2">{item.icon}</div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted">{item.label}</p>
                      <p className="mt-2 text-sm font-medium leading-relaxed text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </motion.section>

              <motion.aside
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.14 }}
                className="rounded-[1.75rem] border border-white/10 bg-secondary/20 p-6 shadow-[0_14px_50px_rgba(0,0,0,0.18)] backdrop-blur-md"
              >
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-accent">
                  <Rocket size={14} />
                  Why it stands out
                </div>
                <div className="mt-4 rounded-2xl border border-accent/20 bg-accent/10 p-4">
                  <p className="text-sm leading-relaxed text-text-muted">
                    The strongest case studies combine product clarity with proof. This layout helps visitors see the thinking behind the experience before they dive into the details.
                  </p>
                </div>
                <ul className="mt-5 space-y-2">
                  {highlightPoints.map((point) => (
                    <li key={point} className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-text-muted">
                      <span className="mt-1 text-accent">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.aside>
            </div>
          </div>

          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.18 }}
              className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(var(--color-accent-rgb),0.16),transparent_45%),linear-gradient(135deg,rgba(15,23,42,0.92),rgba(10,16,30,0.86))] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.24)] md:p-8"
            >
              <div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-accent/20 blur-3xl" />
              <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
              <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-accent">Interactive experience</p>
                  <h3 className="mt-2 text-2xl font-bold text-text">Built to feel more than a static portfolio page</h3>
                  <p className="mt-3 text-sm leading-relaxed text-text-muted">
                    This case study now leans into motion, contrast, and clearer storytelling so the experience feels immersive from the first scroll.
                  </p>
                </div>
                <div className="rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-mono text-accent">
                  Scroll to explore
                </div>
              </div>
              <div className="relative z-10 mt-7 grid gap-4 md:grid-cols-3">
                {[
                  {
                    title: 'Clear narrative',
                    body: 'The project story opens with purpose, challenge, and outcome in a way visitors can absorb instantly.',
                    icon: <Lightbulb size={18} className="text-amber-400" />,
                  },
                  {
                    title: 'Momentum and polish',
                    body: 'Subtle motion and hover states give the page a more premium, alive feel.',
                    icon: <Zap size={18} className="text-yellow-400" />,
                  },
                  {
                    title: 'Proof-first presentation',
                    body: 'Technical and impact sections are easier to digest, helping the work feel more credible.',
                    icon: <Award size={18} className="text-emerald-400" />,
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.22 + index * 0.08 }}
                    whileHover={{ y: -6, scale: 1.01 }}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_10px_35px_rgba(0,0,0,0.18)] backdrop-blur"
                  >
                    <div className="mb-3 inline-flex rounded-xl border border-white/10 bg-black/20 p-2">{item.icon}</div>
                    <h4 className="text-base font-semibold text-text">{item.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-text-muted">{item.body}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Snappy Case Study Tab Selector */}
          <div className="mx-auto max-w-5xl px-4 sm:px-6 mb-8">
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
          <div className="mx-auto max-w-5xl px-4 sm:px-6 min-h-[320px]">
            <AnimatePresence mode="wait">
              {activeTab === 'story' && (
                <motion.div
                  key="story-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-8"
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
                  className="space-y-6"
                >
                  {/* Build Notes / Architecture */}
                  {(project.architecture || project.architectureImage || project.learned || project.lessonsLearned) && (
                    <section id="build-notes" className="rounded-3xl border border-white/10 bg-secondary/20 p-6 md:p-10 backdrop-blur-md">
                      <h2 className="mb-6 text-2xl font-bold text-text border-b border-white/10 pb-4">Build Notes & Architecture</h2>
                      <div className="space-y-8">
                        {project.architectureImage && (
                          <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-4 flex justify-center shadow-inner group">
                            <a href={project.architectureImage} target="_blank" rel="noreferrer" title="Click to view full architecture diagram" className="relative block w-full max-w-4xl cursor-zoom-in">
                              <img
                                src={project.architectureImage}
                                alt="System Architecture Diagram"
                                className="w-full h-auto max-h-[420px] object-contain rounded-xl transition-transform duration-500 group-hover:scale-[1.01]"
                                loading="lazy"
                              />
                            </a>
                          </div>
                        )}
                        {project.architecture && !project.architectureImage && (
                          <div className="font-sans text-sm text-text-muted leading-relaxed">
                            {renderSimpleMarkdown(project.architecture)}
                          </div>
                        )}
                        {(project.learned || project.lessonsLearned) && (
                          <div className="border-t border-white/10 pt-6">
                            <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5 shadow-inner">
                              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                                Commander's Log // Mission Reflection
                              </div>
                              <div className="font-sans text-sm text-text-muted leading-relaxed italic">
                                {renderSimpleMarkdown(project.learned || project.lessonsLearned)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  {/* Development Process Timeline */}
                  <section id="dev-process" className="rounded-3xl border border-white/10 bg-secondary/20 p-6 md:p-8 backdrop-blur-md">
                    <h2 className="mb-6 text-xl font-bold text-text border-b border-white/10 pb-4">Development Process</h2>
                    <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                      {/* Connection bar behind nodes on desktop */}
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-white/5 hidden md:block z-0" />
                      
                      {[
                        { step: '01', title: 'Research', desc: 'Requirements analysis & user stories mapping.' },
                        { step: '02', title: 'Wireframes', desc: 'UX layouts & responsive component design.' },
                        { step: '03', title: 'Arch', desc: 'Database model schemas & api architecture.' },
                        { step: '04', title: 'Build', desc: 'Vite React frontend & serverless backends.' },
                        { step: '05', title: 'QA Test', desc: 'Lighthouse audits & cross-device debug tests.' },
                        { step: '06', title: 'Launch', desc: 'Firebase production hosting pipelines.' }
                      ].map((item) => (
                        <div key={item.step} className="relative z-10 flex flex-row items-center gap-4 md:flex-col md:items-center md:text-center md:flex-1 group">
                          {/* Circle Node */}
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white/10 bg-black/60 font-mono text-xs font-bold text-text-muted group-hover:border-accent group-hover:text-accent group-hover:shadow-[0_0_15px_rgba(var(--color-accent-rgb),0.3)] transition-all duration-300">
                            {item.step}
                          </div>
                          {/* Text Details */}
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-white group-hover:text-accent transition-colors">{item.title}</h4>
                            <p className="text-[11px] text-text-muted leading-relaxed max-w-[140px] md:mx-auto">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

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
                        <div className="grid gap-3 sm:grid-cols-2">
                          {tech.map((item) => {
                            const details = {
                              'React': ['Component-driven architecture', 'Context API state hooks'],
                              'Firebase': ['Firestore real-time sync', 'Cloud auth & hosting'],
                              'Tailwind CSS': ['Utility-first responsive layouts', 'Cyan theme tokens'],
                              'Vite': ['Fast HMR dev server build', 'Optimized client asset bundles'],
                              'JavaScript': ['Asynchronous dynamic loops', 'Telemetry scripting modules'],
                              'TypeScript': ['Strict type safety guards', 'Robust interface schemas'],
                              'OpenAI': ['AI flashcard prompts', 'Automatic doc summaries'],
                              'GitHub API': ['Octokit repositories status', 'Real-time commit updates'],
                              'SMTP Email': ['Automated alerts ingestion', 'Contact mailer backend'],
                              'Next.js': ['App Router navigation', 'React Server Components']
                            }[item] || ['Platform deployment stack', 'Interactive system UI'];

                            return (
                              <div key={item} className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-3 hover:border-accent/30 hover:bg-accent/5 transition-all">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/40 text-accent">
                                    {getTechIcon(item)}
                                  </div>
                                  <span className="font-mono text-xs font-semibold text-white/90">
                                    {item}
                                  </span>
                                </div>
                                <ul className="text-[10px] text-text-muted space-y-0.5 border-t border-white/5 pt-2 pl-1.5 list-disc leading-relaxed">
                                  {details.map((detail, idx) => (
                                    <li key={idx}>{detail}</li>
                                  ))}
                                </ul>
                              </div>
                            );
                          })}
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
                  className="space-y-6"
                >
                  {/* Impact Metrics */}
                  {impactMetrics.length > 0 && (
                    <section id="impact" className="rounded-3xl border border-white/10 bg-secondary/20 p-6 md:p-8 backdrop-blur-md">
                      <h2 className="mb-6 text-xl font-bold text-text border-b border-white/10 pb-4">Impact Metrics</h2>
                      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 auto-rows-fr">
                        {(() => {
                          const orderKeys = [/pages?/i, /interactive/i, /3d|three|experience/i, /seo/i];
                          const ordered = impactMetrics.slice().sort((a, b) => {
                            const ai = orderKeys.findIndex((r) => r.test(a.label));
                            const bi = orderKeys.findIndex((r) => r.test(b.label));
                            const aiIdx = ai === -1 ? Number.POSITIVE_INFINITY : ai;
                            const biIdx = bi === -1 ? Number.POSITIVE_INFINITY : bi;
                            if (aiIdx !== biIdx) return aiIdx - biIdx;
                            return 0;
                          });
                          return ordered.map((metric) => (
                            <div key={`${metric.label}-${metric.value}`} className="rounded-2xl border border-accent/20 bg-accent/5 p-6 text-center hover:border-accent/40 transition-colors flex flex-col items-center justify-center h-full">
                              <AnimatedCounter value={metric.value} suffix={metric.suffix} />
                              <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">{metric.label}</p>
                            </div>
                          ));
                        })()}
                      </div>
                    </section>
                  )}

                  {/* Lighthouse Scores Grid */}
                  {(project.perfScore || project.accessScore || project.bestScore || project.seoScore) && (
                    <section id="lighthouse" className="rounded-3xl border border-white/10 bg-secondary/20 p-6 md:p-8 backdrop-blur-md">
                      <h2 className="mb-6 text-xl font-bold text-text border-b border-white/10 pb-4">Lighthouse Audit Reports</h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                          { label: 'Performance', score: Number(project.perfScore || 98) },
                          { label: 'Accessibility', score: Number(project.accessScore || 100) },
                          { label: 'Best Practices', score: Number(project.bestScore || 100) },
                          { label: 'SEO', score: Number(project.seoScore || 100) }
                        ].map(({ label, score }) => {
                          const strokeDashoffset = 251.2 - (251.2 * score) / 100;
                          const colorClass = score >= 90 ? 'text-emerald-500 stroke-emerald-500' : score >= 50 ? 'text-amber-500 stroke-amber-500' : 'text-red-500 stroke-red-500';
                          return (
                            <div key={label} className="flex flex-col items-center p-4 rounded-2xl border border-white/5 bg-black/25">
                              <div className="relative h-24 w-24 flex items-center justify-center">
                                {/* SVG Circular Dial */}
                                <svg className="w-full h-full -rotate-90">
                                  <circle cx="48" cy="48" r="40" className="stroke-white/5 fill-none" strokeWidth="8" />
                                  <motion.circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    className={`${colorClass} fill-none`}
                                    strokeWidth="8"
                                    strokeDasharray="251.2"
                                    initial={{ strokeDashoffset: 251.2 }}
                                    animate={{ strokeDashoffset }}
                                    transition={{ duration: 1.2, ease: 'easeOut' }}
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <span className="absolute text-xl font-black text-white">{score}</span>
                              </div>
                              <span className="mt-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">{label}</span>
                            </div>
                          );
                        })}
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

        {/* Start a Project Quick-Bridge */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 mt-16">
          <div className="relative overflow-hidden rounded-[2rem] border border-accent/20 bg-gradient-to-r from-accent/5 via-secondary/15 to-primary p-8 md:p-10 text-center shadow-[0_0_40px_rgba(var(--color-accent-rgb),0.05)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--color-accent-rgb),0.05),transparent_60%)]" />
            <div className="relative z-10 space-y-4 max-w-xl mx-auto">
              <h3 className="font-display text-2xl font-bold text-white tracking-tight md:text-3xl">
                Inspired by this mission?
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Let's collaborate to build something outstanding for your business or project using a similar tech stack.
              </p>
              <div className="pt-2">
                <a
                  href={`/#contact?projectType=${encodeURIComponent(project.projectType === 'client' ? 'Client Project' : 'Web App')}&message=${encodeURIComponent(`Hi Sahan, I saw your work on "${project.title}" and would love to collaborate on a similar project!`)}`}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-accent px-6 text-xs font-mono font-bold uppercase tracking-wider text-primary transition-transform hover:scale-105"
                >
                  Start a project like this
                </a>
              </div>
            </div>
          </div>
        </div>

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

const CanvasStarfield = () => {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let particles = [];
    const particleCount = 45;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.8 + 0.6, // Slightly larger particles
        vx: (Math.random() - 0.5) * 0.22,  // Drifts slightly faster
        vy: (Math.random() - 0.5) * 0.22,
        alpha: Math.random() * 0.65 + 0.25, // Higher opacity range for visibility
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`; // Glowing cyan stardust
        ctx.fill();

        // Slow drift
        p.x += p.vx;
        p.y += p.vy;

        // Wrap boundaries
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 bg-transparent"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
