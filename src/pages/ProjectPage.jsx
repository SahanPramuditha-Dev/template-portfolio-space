import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, ExternalLink, Github, Calendar, Layers, Target, Zap } from 'lucide-react';
import SEO from '../components/SEO';
import PageShell from '../components/PageShell';
import { PageBodyCmsSkeleton } from '../components/CmsShapeSkeleton';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import { isUsableHttpUrl } from '../utils/projectUrls';
import { getImpactMetrics, getMediaSlides } from '../utils/projectNormalize';
import { slugify } from '../utils/slugify';

const ProjectPage = () => {
  const { slug } = useParams();
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
  const heroSlide = slides[0];
  const impactMetrics = getImpactMetrics(project);
  const tech = Array.isArray(project.tech) ? project.tech : [];
  const features = Array.isArray(project.features) ? project.features : [];
  const hasLive = isUsableHttpUrl(project.external);
  const hasGithub = isUsableHttpUrl(project.github);

  return (
    <>
      <SEO
        title={`${project.title || 'Project'} | Sahan Pramuditha`}
        description={description}
        canonicalPath={`/projects/${pageSlug}`}
        ogImage={heroSlide?.kind === 'image' ? heroSlide.url : undefined}
      />
      <PageShell
        eyebrow={project.missionCode || 'Case Study'}
        title={project.title || 'Project case study'}
        description={description}
        actions={(
          <Link to="/#projects" className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
            <ChevronLeft size={16} />
            Back to projects
          </Link>
        )}
      >
        <article className="space-y-6">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-secondary/20 backdrop-blur-md">
            <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="relative min-h-[320px] bg-black/40">
                {heroSlide?.kind === 'video' ? (
                  <video src={heroSlide.url} controls playsInline preload="metadata" className="h-full min-h-[320px] w-full object-cover" />
                ) : heroSlide ? (
                  <img src={heroSlide.url} alt={heroSlide.alt || project.title} className="h-full min-h-[320px] w-full object-cover" />
                ) : (
                  <div className="flex h-full min-h-[320px] items-center justify-center bg-[radial-gradient(circle_at_top_left,rgb(var(--color-accent-rgb)/0.22),transparent_45%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.82))]">
                    <Layers size={54} className="text-accent/80" />
                  </div>
                )}
              </div>

              <div className="space-y-5 p-6 sm:p-8">
                <div className="flex flex-wrap gap-2">
                  {project.year && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-secondary/40 bg-primary/40 px-3 py-1 text-xs text-text-muted">
                      <Calendar size={13} />
                      {project.year}
                    </span>
                  )}
                  {project.category && (
                    <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-mono text-accent">
                      {project.category}
                    </span>
                  )}
                  {project.status && (
                    <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs font-mono text-emerald-300">
                      {project.status}
                    </span>
                  )}
                </div>

                <p className="text-base leading-relaxed text-text-muted">{project.description || description}</p>

                <dl className="grid gap-3 text-sm text-text-muted sm:grid-cols-2">
                  {[
                    ['Role', project.role],
                    ['Client', project.client || project.company],
                    ['Industry', project.industry],
                    ['Timeline', project.projectTimeline],
                    ['Team', project.teamSize],
                    ['Outcome', project.outcomeBadge],
                  ].filter(([, value]) => value).map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-secondary/40 bg-primary/40 p-4">
                      <dt className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-accent">{label}</dt>
                      <dd className="mt-1 text-text">{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="flex flex-col gap-3 sm:flex-row">
                  {hasLive && (
                    <a href={project.external} target="_blank" rel="noreferrer" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-primary">
                      <ExternalLink size={16} />
                      Live demo
                    </a>
                  )}
                  {hasGithub && (
                    <a href={project.github} target="_blank" rel="noreferrer" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-5 py-3 text-sm font-semibold text-accent">
                      <Github size={16} />
                      Source code
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-3xl border border-white/10 bg-secondary/20 p-6 backdrop-blur-md">
              <h2 className="mb-3 flex items-center gap-2 text-2xl font-bold text-text">
                <Target size={22} className="text-red-400" />
                Problem
              </h2>
              <p className="leading-relaxed text-text-muted">{project.problem || 'Problem details have not been added yet.'}</p>
            </section>
            <section className="rounded-3xl border border-white/10 bg-secondary/20 p-6 backdrop-blur-md">
              <h2 className="mb-3 flex items-center gap-2 text-2xl font-bold text-text">
                <Zap size={22} className="text-yellow-400" />
                Solution
              </h2>
              <p className="leading-relaxed text-text-muted">{project.solution || 'Solution details have not been added yet.'}</p>
            </section>
          </div>

          <section className="rounded-3xl border border-white/10 bg-secondary/20 p-6 backdrop-blur-md">
            <h2 className="mb-4 text-2xl font-bold text-text">Build Notes</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="mb-2 font-semibold text-text">Architecture</h3>
                <p className="leading-relaxed text-text-muted">{project.architecture || 'Architecture notes have not been added yet.'}</p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-text">What I learned</h3>
                <p className="leading-relaxed text-text-muted">{project.learned || project.lessonsLearned || 'Learning notes have not been added yet.'}</p>
              </div>
            </div>
          </section>

          {features.length > 0 && (
            <section className="rounded-3xl border border-white/10 bg-secondary/20 p-6 backdrop-blur-md">
              <h2 className="mb-4 text-2xl font-bold text-text">Key Features</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {features.map((feature) => (
                  <li key={feature} className="rounded-2xl border border-secondary/40 bg-primary/40 p-4 text-text-muted">
                    {feature}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {impactMetrics.length > 0 && (
            <section className="rounded-3xl border border-white/10 bg-secondary/20 p-6 backdrop-blur-md">
              <h2 className="mb-4 text-2xl font-bold text-text">Impact</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {impactMetrics.map((metric) => (
                  <div key={`${metric.label}-${metric.value}`} className="rounded-2xl border border-accent/20 bg-accent/10 p-5 text-center">
                    <p className="text-3xl font-bold text-accent">
                      {metric.value}
                      {metric.suffix ? ` ${metric.suffix}` : ''}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-text-muted">{metric.label}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {tech.length > 0 && (
            <section className="rounded-3xl border border-white/10 bg-secondary/20 p-6 backdrop-blur-md">
              <h2 className="mb-4 text-2xl font-bold text-text">Tech Stack</h2>
              <div className="flex flex-wrap gap-2">
                {tech.map((item) => (
                  <span key={item} className="rounded-full border border-accent/20 bg-primary/50 px-3 py-1 text-xs font-mono text-accent">
                    {item}
                  </span>
                ))}
              </div>
            </section>
          )}
        </article>
      </PageShell>
    </>
  );
};

export default ProjectPage;
