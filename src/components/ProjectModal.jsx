import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Github,
  ExternalLink,
  Layers,
  Target,
  Zap,
  Award,
  Lightbulb,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Building2,
  Users,
  Clock,
  Briefcase,
  ArrowRight,
} from 'lucide-react';
import { isUsableHttpUrl } from '../utils/projectUrls';
import { getImpactMetrics, getMediaSlides } from '../utils/projectNormalize';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const ProjectModalInner = ({ project, isOpen, onClose }) => {
  const [activeMedia, setActiveMedia] = useState(0);
  const [activeTab, setActiveTab] = useState('details');
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);
  const touchStartY = useRef(null);
  const touchStartX = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('details');
    }
  }, [isOpen, project]);

  const slides = useMemo(() => (project ? getMediaSlides(project) : []), [project]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !project) return undefined;
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    previousFocusRef.current = document.activeElement;
    const nodes = Array.from(dialog.querySelectorAll(FOCUSABLE_SELECTOR));
    const list = nodes.filter((el) => {
      if (el.hasAttribute('disabled')) return false;
      const style = window.getComputedStyle(el);
      return style.visibility !== 'hidden' && style.display !== 'none';
    });
    const first = list[0];
    const last = list[list.length - 1];
    const t = window.setTimeout(() => first?.focus?.(), 0);

    const trap = (e) => {
      if (e.key !== 'Tab' || !list.length) return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    dialog.addEventListener('keydown', trap);
    return () => {
      window.clearTimeout(t);
      dialog.removeEventListener('keydown', trap);
      const prev = previousFocusRef.current;
      if (prev && typeof prev.focus === 'function') {
        try {
          prev.focus();
        } catch {
          /* ignore */
        }
      }
    };
  }, [isOpen, project]);

  if (!project) return null;

  const activeSlide = slides[activeMedia] || null;
  const techList = Array.isArray(project.tech) ? project.tech : [];
  const hasLive = isUsableHttpUrl(project.external);
  const hasGithub = isUsableHttpUrl(project.github);
  const impactMetrics = getImpactMetrics(project);

  const stepMedia = (direction) => {
    if (!slides.length) return;
    setActiveMedia((prev) => {
      const next = prev + direction;
      if (next < 0) return slides.length - 1;
      if (next >= slides.length) return 0;
      return next;
    });
  };

  // Swipe handlers for the whole modal (swipe down = close)
  const handleModalTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleModalTouchEnd = (e) => {
    if (touchStartY.current === null) return;
    const delta = e.changedTouches[0].clientY - touchStartY.current;
    if (delta > 80) onClose();
    touchStartY.current = null;
  };

  // Swipe handlers for the image gallery (swipe left/right = next/prev)
  const handleGalleryTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleGalleryTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) stepMedia(delta < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  const clientLine = [project.client, project.company].map((s) => String(s || '').trim()).filter(Boolean)[0];
  const industry = String(project.industry || '').trim();
  const timeline = String(project.projectTimeline || '').trim();
  const teamSize = String(project.teamSize || '').trim();
  const role = String(project.role || '').trim();
  const lessonsLearned = String(project.lessonsLearned || '').trim();
  const nextSteps = String(project.nextSteps || '').trim();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4">
            <motion.div
              ref={dialogRef}
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              onTouchStart={handleModalTouchStart}
              onTouchEnd={handleModalTouchEnd}
              className="relative flex max-h-[92dvh] w-full max-w-6xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-primary shadow-2xl sm:max-h-[90vh] sm:rounded-3xl md:flex-row"
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-modal-title"
              aria-describedby="project-modal-description"
            >
              {/* Drag handle — mobile only */}
              <div className="flex justify-center pt-2 pb-0 sm:hidden" aria-hidden="true">
                <span className="h-1 w-10 rounded-full bg-white/20" />
              </div>
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-black/40 p-2 text-white transition-colors hover:bg-accent hover:text-primary"
                aria-label="Close project details"
              >
                <X size={22} />
              </button>

              <div
                className="relative flex flex-col h-full max-h-full w-full border-b border-white/10 bg-secondary/20 md:w-[42%] md:border-b-0 md:border-r"
                onTouchStart={handleGalleryTouchStart}
                onTouchEnd={handleGalleryTouchEnd}
              >
                <div className="relative shrink-0 aspect-[4/3] w-full overflow-hidden bg-black/40">
                  {activeSlide ? (
                    activeSlide.kind === 'video' ? (
                      <video
                        key={activeSlide.url}
                        src={activeSlide.url}
                        className="h-full w-full object-cover"
                        controls
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={activeSlide.url}
                        alt={activeSlide.alt || project.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    )
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top_left,rgb(var(--color-accent-rgb)/0.18),transparent_50%),linear-gradient(135deg,rgba(15,23,42,1),rgba(30,41,59,1))]">
                      <div className="text-center">
                        <Layers size={56} className="mx-auto mb-3 text-accent/80" />
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted">
                          Visual preview not available
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent" />

                  <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-accent/25 bg-black/30 px-3 py-1 text-[0.7rem] font-mono uppercase tracking-[0.16em] text-accent">
                    <span>{project.missionCode}</span>
                    <span className="text-white/50">•</span>
                    <span>{project.year}</span>
                  </div>

                  {slides.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => stepMedia(-1)}
                        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/10 bg-black/40 p-2 text-white transition-colors hover:bg-accent hover:text-primary"
                        aria-label="Previous slide"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => stepMedia(1)}
                        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/10 bg-black/40 p-2 text-white transition-colors hover:bg-accent hover:text-primary"
                        aria-label="Next slide"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </>
                  )}
                </div>

                {activeSlide?.caption && (
                  <p className="border-b border-white/10 bg-black/25 px-4 py-2 text-center text-xs text-text-muted">
                    {activeSlide.caption}
                  </p>
                )}

                {slides.length > 1 && (
                  <div className="flex justify-center gap-1.5 border-b border-white/10 py-2">
                    {slides.map((s, index) => (
                      <button
                        key={`${s.url}-${index}`}
                        type="button"
                        onClick={() => setActiveMedia(index)}
                        className={`h-2 w-2 rounded-full transition-colors ${
                          index === activeMedia ? 'bg-accent' : 'bg-white/25 hover:bg-white/45'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}

                <div className="space-y-4 p-5 overflow-y-auto custom-scrollbar flex-grow">
                  <div>
                    <h2 id="project-modal-title" className="text-2xl font-bold text-text md:text-3xl">
                      {project.title}
                    </h2>
                    <p className="mt-2 text-sm text-text-muted">{project.role}</p>
                  </div>

                  {slides.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
                      {slides.map((s, index) => (
                        <button
                          key={`thumb-${s.url}-${index}`}
                          type="button"
                          onClick={() => setActiveMedia(index)}
                          className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition-all ${
                            index === activeMedia
                              ? 'border-accent ring-2 ring-accent/20'
                              : 'border-white/10 opacity-70 hover:opacity-100'
                          }`}
                        >
                          {s.kind === 'video' ? (
                            <div className="flex h-full w-full items-center justify-center bg-black/50 text-[10px] font-mono text-white/80">
                              VIDEO
                            </div>
                          ) : (
                            <img src={s.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {(clientLine || industry || timeline || teamSize || role) && (
                    <div className="rounded-2xl border border-accent/20 bg-primary/40 p-4">
                      <h3 className="mb-3 text-xs font-mono uppercase tracking-[0.16em] text-accent">Quick facts</h3>
                      <dl className="grid gap-3 text-sm">
                        {clientLine && (
                          <div className="flex gap-2">
                            <dt className="flex shrink-0 items-center gap-1 text-text-muted">
                              <Building2 size={14} className="text-accent" />
                              Client
                            </dt>
                            <dd className="text-text">{clientLine}</dd>
                          </div>
                        )}
                        {industry && (
                          <div className="flex gap-2">
                            <dt className="flex shrink-0 items-center gap-1 text-text-muted">
                              <Briefcase size={14} className="text-accent" />
                              Industry
                            </dt>
                            <dd className="text-text">{industry}</dd>
                          </div>
                        )}
                        {timeline && (
                          <div className="flex gap-2">
                            <dt className="flex shrink-0 items-center gap-1 text-text-muted">
                              <Clock size={14} className="text-accent" />
                              Timeline
                            </dt>
                            <dd className="text-text">{timeline}</dd>
                          </div>
                        )}
                        {teamSize && (
                          <div className="flex gap-2">
                            <dt className="flex shrink-0 items-center gap-1 text-text-muted">
                              <Users size={14} className="text-accent" />
                              Team
                            </dt>
                            <dd className="text-text">{teamSize}</dd>
                          </div>
                        )}
                        {role && (
                          <div className="flex gap-2">
                            <dt className="flex shrink-0 items-center gap-1 text-text-muted">
                              <Briefcase size={14} className="text-accent" />
                              Role
                            </dt>
                            <dd className="text-text">{role}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  )}

                  {project.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-mono text-accent"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="custom-scrollbar w-full overflow-y-auto bg-primary p-6 md:w-[58%] md:p-8 flex flex-col">
                {/* Tabs Header if sandboxUrl is available */}
                {project.sandboxUrl && (
                  <div className="flex border-b border-white/5 mb-6 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveTab('details')}
                      className={`px-4 py-2 border-b-2 font-bold uppercase transition-colors ${
                        activeTab === 'details'
                          ? 'border-accent text-accent animate-pulse'
                          : 'border-transparent text-text-muted hover:text-text'
                      }`}
                    >
                      Mission Details
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('sandbox')}
                      className={`px-4 py-2 border-b-2 font-bold uppercase transition-colors ${
                        activeTab === 'sandbox'
                          ? 'border-accent text-accent animate-pulse'
                          : 'border-transparent text-text-muted hover:text-text'
                      }`}
                    >
                      Live Sandbox Feed
                    </button>
                  </div>
                )}

                {activeTab === 'details' ? (
                  <>
                    <div id="project-modal-description" className="text-lg leading-relaxed text-text-muted whitespace-pre-wrap font-sans">
                      {project.description}
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-secondary/50 bg-secondary/10 p-5">
                        <div className="mb-3 flex items-center gap-2 text-text">
                          <Target size={18} className="text-red-400" />
                          <h3 className="font-bold">Problem</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-text-muted">
                          {project.problem || 'Information not available.'}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-secondary/50 bg-secondary/10 p-5">
                        <div className="mb-3 flex items-center gap-2 text-text">
                          <Zap size={18} className="text-yellow-400" />
                          <h3 className="font-bold">Solution</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-text-muted">
                          {project.solution || 'Information not available.'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-accent/20 bg-gradient-to-br from-secondary/20 to-primary p-5">
                      <div className="mb-4 flex items-center gap-2 text-text">
                        <Award size={18} className="text-green-400" />
                        <h3 className="font-bold">Architecture & Delivery</h3>
                      </div>
                      <p className="text-sm leading-relaxed text-text-muted">
                        {project.architecture || 'Architecture details not available.'}
                      </p>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-secondary/50 bg-secondary/10 p-5">
                        <div className="mb-3 flex items-center gap-2 text-text">
                          <ImageIcon size={18} className="text-accent" />
                          <h3 className="font-bold">Key Features</h3>
                        </div>
                        <ul className="space-y-2 text-sm text-text-muted">
                          {(project.features || []).map((feature) => (
                            <li key={feature} className="flex items-start gap-2">
                              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                              <span>{feature}</span>
                            </li>
                          ))}
                          {(!project.features || project.features.length === 0) && (
                            <li>Feature breakdown not available.</li>
                          )}
                        </ul>
                      </div>

                      <div className="rounded-2xl border border-secondary/50 bg-secondary/10 p-5">
                        <div className="mb-3 flex items-center gap-2 text-text">
                          <Lightbulb size={18} className="text-amber-400" />
                          <h3 className="font-bold">What I Learned</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-text-muted">
                          {project.learned || 'Learning notes not available.'}
                        </p>
                      </div>
                    </div>

                    {impactMetrics.length > 0 && (
                      <div className="mt-6 rounded-2xl border border-secondary/50 bg-secondary/10 p-5">
                        <h3 className="mb-4 font-bold text-text">Impact Metrics</h3>
                        <div className="grid gap-3 sm:grid-cols-3">
                          {impactMetrics.map((metric) => (
                            <div
                              key={`${metric.label}-${metric.value}`}
                              className="rounded-xl border border-secondary/40 bg-primary/50 p-4 text-center"
                            >
                              <div className="text-xl font-bold text-accent">
                                {metric.value}
                                {metric.suffix ? ` ${metric.suffix}` : ''}
                              </div>
                              <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-text-muted">
                                {metric.label}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(lessonsLearned || nextSteps) && (
                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        {lessonsLearned && (
                          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-5">
                            <h3 className="mb-2 flex items-center gap-2 font-bold text-text">
                              <Lightbulb size={18} className="text-emerald-400" />
                              Lessons learned
                            </h3>
                            <p className="text-sm leading-relaxed text-text-muted">{lessonsLearned}</p>
                          </div>
                        )}
                        {nextSteps && (
                          <div className="rounded-2xl border border-sky-400/20 bg-sky-500/5 p-5">
                            <h3 className="mb-2 flex items-center gap-2 font-bold text-text">
                              <ArrowRight size={18} className="text-sky-400" />
                              Next steps
                            </h3>
                            <p className="text-sm leading-relaxed text-text-muted">{nextSteps}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-6">
                      <h3 className="mb-3 font-bold text-text">Technologies Used</h3>
                      <div className="flex flex-wrap gap-2">
                        {techList.map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-accent/20 bg-secondary/50 px-3 py-1 text-xs font-mono text-accent"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full flex-grow flex flex-col min-h-[380px] h-full rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                    <iframe
                      src={project.sandboxUrl}
                      title={`${project.title} Sandbox`}
                      className="w-full flex-grow min-h-[350px] border-0 bg-transparent"
                      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                      loading="lazy"
                    />
                    <div className="p-3 bg-secondary/80 border-t border-white/5 font-mono text-[9px] text-text-muted flex justify-between items-center">
                      <span>SECURE SANDBOX ACTIVE</span>
                      <a 
                        href={project.sandboxUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-accent hover:underline flex items-center gap-0.5"
                      >
                        OPEN IN NEW TAB <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex flex-col gap-3 border-t border-secondary/40 pt-6 sm:flex-row">
                  {hasLive ? (
                    <a
                      href={project.external}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-6 py-4 font-bold text-primary transition-transform hover:scale-[1.01]"
                    >
                      <ExternalLink size={18} />
                      Live Demo
                    </a>
                  ) : (
                    <span className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-secondary/40 bg-secondary/20 px-6 py-4 font-bold text-text-muted">
                      <ExternalLink size={18} />
                      No live link
                    </span>
                  )}
                  {hasGithub ? (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-accent px-6 py-4 font-bold text-accent transition-colors hover:bg-accent hover:text-primary"
                    >
                      <Github size={18} />
                      Source Code
                    </a>
                  ) : (
                    <span className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-secondary/40 bg-secondary/20 px-6 py-4 font-bold text-text-muted">
                      <Github size={18} />
                      No public repo
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

const ProjectModal = (props) => {
  const key = props.project
    ? `p-${String(props.project.id ?? '')}-${String(props.project.title ?? '')}`
    : 'closed';
  return <ProjectModalInner key={key} {...props} />;
};

export default ProjectModal;
