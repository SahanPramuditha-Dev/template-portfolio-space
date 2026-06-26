import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink, Github, Calendar, Layers, Target, Zap, ArrowLeft, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import PageShell from '../components/PageShell';
import { PageBodyCmsSkeleton } from '../components/CmsShapeSkeleton';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import { isUsableHttpUrl } from '../utils/projectUrls';
import { getImpactMetrics, getMediaSlides } from '../utils/projectNormalize';
import { slugify } from '../utils/slugify';
import { renderSimpleMarkdown } from '../utils/markdown';

const ProjectPage = () => {
  const { slug } = useParams();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const { data, loading } = useCmsDoc(CMS_DOCS.projects, { items: [] });
  const projects = useMemo(() => (Array.isArray(data?.items) ? data.items : []), [data]);
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
          eyebrow="Case Study"
          title="Project not found"
          description="That case study is not published yet or the URL is wrong."
          actions={(
            <Link to="/#projects" className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
              <ChevronLeft size={16} />
              Back to projects
            </Link>
          )}
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
  const hasLive = isUsableHttpUrl(project.external);
  const hasGithub = isUsableHttpUrl(project.github);

  const currentIndex = projects.findIndex(p => (p.id === project.id || p.title === project.title));
  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const nextProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

  const nextSlide = () => setActiveSlideIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setActiveSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <>
      <SEO
        title={`${project.title || 'Project'} | Sahan Pramuditha`}
        description={description}
        canonicalPath={`/projects/${pageSlug}`}
        ogImage={heroSlide?.kind === 'image' ? heroSlide.url : undefined}
      />
      <PageShell
        actions={(
          <Link to="/#projects" className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
            <ChevronLeft size={16} />
            Back to projects
          </Link>
        )}
      >
        <article className="mx-auto w-full max-w-5xl space-y-12 lg:space-y-16 pb-20">
          {/* Hero Section */}
          <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-2xl h-[40vh] min-h-[300px] md:h-[60vh] md:min-h-[500px]">
            {heroSlide?.kind === 'video' ? (
              <div className="relative h-full w-full flex items-center justify-center bg-black">
                <img src={heroSlide.poster || ''} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30 blur-3xl saturate-200" aria-hidden="true" />
                <video src={heroSlide.url} controls playsInline preload="metadata" className="relative z-10 h-full w-full object-contain p-4 md:p-8 drop-shadow-2xl" />
              </div>
            ) : heroSlide ? (
              <div className="relative h-full w-full flex items-center justify-center bg-black">
                <img src={heroSlide.url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30 blur-3xl saturate-200" aria-hidden="true" />
                <img src={heroSlide.url} alt={heroSlide.alt || project.title} className="relative z-10 h-full w-full object-contain p-4 md:p-8 drop-shadow-2xl" loading="lazy" decoding="async" />
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top_left,rgb(var(--color-accent-rgb)/0.22),transparent_45%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.82))]">
                <Layers size={54} className="text-accent/80" />
              </div>
            )}
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
          <div className="mx-auto max-w-4xl space-y-10 px-4 sm:px-6">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight text-text md:text-5xl lg:text-6xl">
                {project.title}
              </h1>
              <p className="text-xl font-medium text-accent">{project.role}</p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {project.year && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/40 bg-primary/40 px-4 py-2 text-xs text-text-muted font-medium">
                  <Calendar size={14} />
                  {project.year}
                </span>
              )}
              {project.category && (
                <span className="rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-xs font-mono text-accent">
                  {project.category}
                </span>
              )}
              {project.status && (
                <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-4 py-2 text-xs font-mono text-emerald-300">
                  {project.status}
                </span>
              )}
            </div>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {hasLive && (
                <a href={project.external} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-8 py-4 font-bold text-primary transition-transform hover:scale-[1.02]">
                  <ExternalLink size={18} />
                  Live Demo
                </a>
              )}
              {hasGithub && (
                <a href={project.github} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/5 px-8 py-4 font-bold text-accent transition-colors hover:bg-accent/10">
                  <Github size={18} />
                  Source Code
                </a>
              )}
            </div>

            <dl className="grid gap-6 sm:grid-cols-2 md:grid-cols-4 rounded-3xl border border-white/5 bg-secondary/10 p-8 shadow-xl">
              {[
                ['Client', project.client || project.company],
                ['Industry', project.industry],
                ['Timeline', project.projectTimeline],
                ['Team', project.teamSize],
              ].filter(([, value]) => value).map(([label, value]) => (
                <div key={label}>
                  <dt className="mb-2 text-[10px] font-mono uppercase tracking-wider text-text-muted">{label}</dt>
                  <dd className="text-base font-semibold text-text">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Content Wrapper */}
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:flex lg:gap-16">
            
            {/* Sticky Table of Contents */}
            <div className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24 space-y-4">
                <h3 className="font-mono text-sm uppercase tracking-widest text-text">Contents</h3>
                <nav className="flex flex-col gap-3 border-l border-white/10 pl-4">
                  {(project.description || description) && (
                    <a href="#overview" className="text-sm font-medium text-text-muted hover:text-accent transition-colors">Overview</a>
                  )}
                  {project.problem && (
                    <a href="#problem" className="text-sm font-medium text-text-muted hover:text-accent transition-colors">Problem</a>
                  )}
                  {project.solution && (
                    <a href="#solution" className="text-sm font-medium text-text-muted hover:text-accent transition-colors">Solution</a>
                  )}
                  {(project.architecture || project.learned || project.lessonsLearned) && (
                    <a href="#build-notes" className="text-sm font-medium text-text-muted hover:text-accent transition-colors">Build Notes</a>
                  )}
                  {features.length > 0 && (
                    <a href="#features" className="text-sm font-medium text-text-muted hover:text-accent transition-colors">Key Features</a>
                  )}
                  {impactMetrics.length > 0 && (
                    <a href="#impact" className="text-sm font-medium text-text-muted hover:text-accent transition-colors">Impact</a>
                  )}
                  {tech.length > 0 && (
                    <a href="#tech" className="text-sm font-medium text-text-muted hover:text-accent transition-colors">Tech Stack</a>
                  )}
                </nav>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 space-y-16 min-w-0">
              
              {/* Case Study Narrative */}
              {(project.description || description) && (
                <motion.section id="overview" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }} className="scroll-mt-24 max-w-none font-sans leading-relaxed text-text-muted">
                  {renderSimpleMarkdown(project.description || description)}
                </motion.section>
              )}

            {(project.problem || project.solution) && (
              <div className="grid gap-6 lg:grid-cols-2">
                {project.problem && (
                  <motion.section id="problem" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }} className="scroll-mt-24 rounded-3xl border border-white/10 bg-secondary/20 p-8 backdrop-blur-md">
                    <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-text">
                      <Target size={22} className="text-red-400" />
                      Problem
                    </h2>
                    <div className="font-sans text-text-muted">
                      {renderSimpleMarkdown(project.problem)}
                    </div>
                  </motion.section>
                )}
                {project.solution && (
                  <motion.section id="solution" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }} className="scroll-mt-24 rounded-3xl border border-white/10 bg-secondary/20 p-8 backdrop-blur-md">
                    <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-text">
                      <Zap size={22} className="text-yellow-400" />
                      Solution
                    </h2>
                    <div className="font-sans text-text-muted">
                      {renderSimpleMarkdown(project.solution)}
                    </div>
                  </motion.section>
                )}
              </div>
            )}

            {(project.architecture || project.learned || project.lessonsLearned) && (
              <motion.section id="build-notes" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }} className="scroll-mt-24 rounded-3xl border border-white/10 bg-secondary/20 p-8 sm:p-12 backdrop-blur-md">
                <h2 className="mb-8 text-3xl font-bold text-text border-b border-white/10 pb-6">Build Notes</h2>
                <div className="flex flex-col gap-16">
                  {project.architecture && (
                    <div className="font-sans">
                      {renderSimpleMarkdown(project.architecture)}
                    </div>
                  )}
                  {(project.learned || project.lessonsLearned) && (
                    <div className="font-sans border-t border-white/10 pt-10">
                      <h3 className="mb-6 text-2xl font-bold text-white tracking-tight">What I learned</h3>
                      <div className="text-sm text-text-muted">
                        {renderSimpleMarkdown(project.learned || project.lessonsLearned)}
                      </div>
                    </div>
                  )}
                </div>
              </motion.section>
            )}

          {features.length > 0 && (
            <motion.section id="features" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }} className="scroll-mt-24 rounded-3xl border border-white/10 bg-secondary/20 p-6 backdrop-blur-md">
              <h2 className="mb-4 text-2xl font-bold text-text">Key Features</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {features.map((feature) => (
                  <li key={feature} className="rounded-2xl border border-secondary/40 bg-primary/40 p-4 text-text-muted">
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.section>
          )}

          {impactMetrics.length > 0 && (
            <motion.section id="impact" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }} className="scroll-mt-24 rounded-3xl border border-white/10 bg-secondary/20 p-8 backdrop-blur-md">
              <h2 className="mb-6 text-2xl font-bold text-text">Impact</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {impactMetrics.map((metric) => (
                  <div key={`${metric.label}-${metric.value}`} className="rounded-2xl border border-accent/20 bg-accent/10 p-6 text-center">
                    <p className="text-4xl font-black text-accent">
                      {metric.value}
                      {metric.suffix ? ` ${metric.suffix}` : ''}
                    </p>
                    <p className="mt-3 text-xs font-bold uppercase tracking-[0.15em] text-text-muted">{metric.label}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {tech.length > 0 && (
            <motion.section id="tech" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }} className="scroll-mt-24 rounded-3xl border border-white/10 bg-secondary/20 p-8 backdrop-blur-md">
              <h2 className="mb-6 text-2xl font-bold text-text">Tech Stack</h2>
              <div className="flex flex-wrap gap-3">
                {tech.map((item) => (
                  <span key={item} className="rounded-full border border-accent/20 bg-primary/50 px-4 py-2 text-sm font-mono text-accent">
                    {item}
                  </span>
                ))}
              </div>
            </motion.section>
          )}
          </div>
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
    </>
  );
};

export default ProjectPage;
