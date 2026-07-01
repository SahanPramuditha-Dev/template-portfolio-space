import React, { useEffect, useRef, useState } from 'react';
import { Github, Linkedin, Facebook, Mail, FileText } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { trackSocialClick, trackDownload } from '../utils/analytics';
import { shouldDisableHeavyVisuals } from '../utils/runtimeGuards';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import { HeroCmsSkeleton } from './CmsShapeSkeleton';
import Earth3D from './Earth3D';


const DEFAULT_RESUME_URL = '/resume.pdf';

const TypewriterText = ({ words }) => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [blink, setBlink] = useState(true);
  const prefersReducedMotion = useReducedMotion();
  const hasWords = Array.isArray(words) && words.length > 0;
  const longestWord = hasWords
    ? words.reduce((longest, word) => (String(word).length > String(longest).length ? String(word) : longest), '')
    : '';

  // Blinking cursor
  useEffect(() => {
    if (prefersReducedMotion) return undefined;
    const timeout2 = setTimeout(() => {
      setBlink((prev) => !prev);
    }, 500);
    return () => clearTimeout(timeout2);
  }, [blink, prefersReducedMotion]);

  // Typing logic
  useEffect(() => {
    if (prefersReducedMotion) return undefined;
    if (!hasWords) return undefined;
    if (subIndex === words[index].length + 1 && !reverse) {
      const timeout = setTimeout(() => setReverse(true), 0);
      return () => clearTimeout(timeout);
    }

    if (subIndex === 0 && reverse) {
      const timeout = setTimeout(() => {
        setReverse(false);
        setIndex((prev) => (prev + 1) % words.length);
      }, 0);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, Math.max(reverse ? 75 : subIndex === words[index].length ? 1000 : 150, parseInt(Math.random() * 350)));

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, words, prefersReducedMotion, hasWords]);

  if (!hasWords) {
    return null;
  }

  return (
    <span
      className="relative inline-grid min-h-[1.2em] whitespace-nowrap align-baseline"
      style={{ minWidth: `${Math.max(longestWord.length, 1)}ch` }}
    >
      <span className="invisible select-none col-start-1 row-start-1" aria-hidden="true">
        {longestWord}
      </span>
      <span className="col-start-1 row-start-1">
        {prefersReducedMotion ? words[0] : words[index].substring(0, subIndex)}
        <span className={`${blink ? 'opacity-100' : 'opacity-0'} ml-1 text-accent`}>|</span>
      </span>
    </span>
  );
};

const isVideoAsset = (src) => /\.(mp4|webm)(\?|#|$)/i.test(src || '');

const Hero = () => {
  const compRef = useRef(null);
  const { data: siteDoc, loading: siteLoading } = useCmsDoc(CMS_DOCS.site, null);
  const { data: projectsDoc, loading: projectsLoading } = useCmsDoc(CMS_DOCS.projects, { items: [] });
  const resumeUrl = siteDoc?.resumeUrl || (import.meta.env.VITE_RESUME_URL || '').trim() || DEFAULT_RESUME_URL;
  const resumeAvailable = Boolean(resumeUrl);
  const [downloading, setDownloading] = useState(false);
  const [heavyVisualsEnabled, setHeavyVisualsEnabled] = useState(() => !shouldDisableHeavyVisuals());
  const heroWords = Array.isArray(siteDoc?.heroWordsJson) ? siteDoc.heroWordsJson : [];
  const socialLinks = Array.isArray(siteDoc?.socialLinksJson) ? siteDoc.socialLinksJson : [];
  const heroArtworkUrl = siteDoc?.heroArtworkUrl || '';
  const projectCount = Array.isArray(projectsDoc?.items) ? projectsDoc.items.length : 0;
  const featuredProjects = Array.isArray(projectsDoc?.items) ? projectsDoc.items.filter((project) => project.featured).slice(0, 3) : [];

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setHeavyVisualsEnabled(!shouldDisableHeavyVisuals());
    };

    const frame = requestAnimationFrame(update);
    reduceMotionQuery.addEventListener('change', update);
    window.addEventListener('visual-mode-change', update);
    window.addEventListener('storage', update);
    return () => {
      cancelAnimationFrame(frame);
      reduceMotionQuery.removeEventListener('change', update);
      window.removeEventListener('visual-mode-change', update);
      window.removeEventListener('storage', update);
    };
  }, []);

  const cmsPending =
    siteLoading ||
    projectsLoading ||
    siteDoc === undefined ||
    projectsDoc === undefined;

  const handleResumeDownload = async (e) => {
    e.preventDefault();
    if (!resumeUrl || downloading) return;
    try {
      setDownloading(true);
      const res = await fetch(resumeUrl);
      if (!res.ok) {
        setDownloading(false);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (resumeUrl.split('/').pop()) || 'Sahan_Pramuditha_CV';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setDownloading(false);
    } catch {
      setDownloading(false);
    }
  };

  if (cmsPending) {
    return <HeroCmsSkeleton />;
  }

  return (
    <section
      ref={compRef}
      id="home"
      className="min-h-[100dvh] min-h-screen flex items-start justify-center relative z-10 overflow-hidden pt-24 sm:pt-28 md:pt-32 lg:pt-36 px-4 sm:px-0"
      style={{ position: 'relative' }}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Two columns only: copy + hero visual (stats sit below) */}
        <div className="grid h-full gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)] lg:items-start lg:gap-14">
        
        {/* Text Content */}
        <motion.div 
          className="z-20 w-full max-w-2xl lg:max-w-[44rem] lg:pt-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
              }
            }
          }}
        >
          <motion.div 
            className="overflow-hidden mb-4"
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
          >
            <h2 className="text-accent font-mono text-lg">Hi, my name is</h2>
          </motion.div>
          <motion.div 
            className="mb-4"
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-text mb-2 font-display tracking-tight leading-tight">
              {siteDoc?.heroTitle ? (
                <span className="text-accent inline-block hover:scale-105 transition-transform duration-300 cursor-default text-shadow-glow">
                  {siteDoc.heroTitle}
                </span>
              ) : (
                <span className="text-accent">Configure hero title in admin</span>
              )}
            </h1>
          </motion.div>
          <motion.div 
            className="overflow-hidden mb-6"
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
          >
            <h2 className="flex flex-col gap-2 text-2xl font-bold leading-[0.95] text-text-muted font-display sm:text-3xl lg:text-5xl">
              <span className="max-w-[14ch] whitespace-normal">
                {siteDoc?.heroSubtitle || 'Configure hero subtitle in admin'}
              </span>
              {heroWords.length > 0 && (
                <span className="text-text">
                  <TypewriterText words={heroWords} />
                </span>
              )}
            </h2>
          </motion.div>
          <motion.div 
            className="overflow-hidden mb-8"
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
          >
            <p className="text-text-muted text-lg max-w-xl leading-relaxed">
              {siteDoc?.heroIntro || 'Configure the hero intro in the admin panel.'}
            </p>
          </motion.div>
          
          <motion.div 
            className="flex flex-wrap gap-4 mb-8 justify-start"
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
          >
            {socialLinks.length > 0 ? (
              socialLinks.map((link) => {
                const Icon = link.label === 'GitHub'
                  ? Github
                  : link.label === 'LinkedIn'
                    ? Linkedin
                    : link.label === 'Facebook'
                      ? Facebook
                      : Mail;
                return (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    target={link.label === 'Email' ? '_self' : '_blank'}
                    rel={link.label === 'Email' ? undefined : 'noreferrer'}
                    onClick={() => trackSocialClick(link.label.toLowerCase())}
                    className="flex flex-col items-center gap-1.5 group"
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`${link.label} profile`}
                  >
                    <span className="p-3 bg-secondary rounded-full text-text-muted group-hover:text-primary group-hover:bg-accent transition-all duration-300 shadow-md group-hover:shadow-lg">
                      <Icon size={22} />
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted group-hover:text-accent transition-colors duration-300">{link.label}</span>
                  </motion.a>
                );
              })
            ) : (
              <p className="text-sm text-text-muted">Add social links in the admin panel.</p>
            )}
          </motion.div>

          <motion.div 
            className="flex flex-wrap gap-4 justify-start"
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
          >
            <motion.a
              href="#projects"
              className="px-8 py-4 border border-accent text-accent rounded-lg hover:bg-accent/10 transition-colors inline-block font-mono"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Case Studies
            </motion.a>
            <motion.a
              href="#contact"
              className="px-8 py-4 border border-secondary/50 bg-secondary/30 text-text rounded-lg hover:border-accent/50 hover:text-accent transition-colors inline-flex items-center gap-2 font-mono"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mail size={20} />
              Start a Project
            </motion.a>
            {resumeAvailable && (
              <motion.a
                href="/resume"
                className="px-8 py-4 bg-accent text-primary font-bold rounded-lg hover:bg-accent/90 transition-colors inline-flex items-center gap-2 font-mono"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FileText size={20} />
                Resume
              </motion.a>
            )}
          </motion.div>

        </motion.div>

        {/* 3D Element */}
        <motion.div 
          className="hero-3d-container h-[280px] sm:h-[360px] md:h-[500px] w-full relative flex items-center justify-center order-first md:order-last mb-6 md:mb-0 min-h-0 overflow-hidden bg-transparent md:pt-6 lg:pt-10 lg:justify-self-end"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          {heroArtworkUrl ? (
            <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-secondary/10">
              {isVideoAsset(heroArtworkUrl) ? (
                <video
                  src={heroArtworkUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={heroArtworkUrl}
                  alt="Hero artwork"
                  className="h-full w-full object-cover"
                  loading="eager"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent" />
            </div>
          ) : heavyVisualsEnabled ? (
            <Earth3D className="h-full w-full" />
          ) : (
            <div
              className="w-full h-full rounded-2xl bg-gradient-to-br from-accent/20 via-secondary/20 to-primary/20"
              aria-hidden="true"
            />
          )}
        </motion.div>

        </div>

        {/* Full-width stats — matches site glass + accent tokens */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <div className="relative mt-6 w-full overflow-hidden rounded-3xl border border-white/10 bg-secondary/20 p-4 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset] backdrop-blur-md sm:mt-8 sm:p-5">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_80%_at_50%_-20%,rgb(var(--color-accent-rgb)/0.08),transparent_55%)]"
            />
            <div className="relative grid w-full grid-cols-1 gap-3 sm:grid-cols-3 sm:items-stretch sm:gap-4">
              <div className="group flex min-w-0 flex-col rounded-2xl border border-white/10 bg-primary/40 px-4 py-4 transition-colors hover:border-accent/25 hover:bg-primary/55">
                <p className="shrink-0 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-text-muted">Projects</p>
                <p className="mt-2 font-display text-3xl font-bold tabular-nums leading-none text-accent sm:text-4xl">
                  {projectCount.toString().padStart(2, '0')}
                </p>
              </div>
              <div className="group flex min-w-0 flex-col rounded-2xl border border-white/10 bg-primary/40 px-4 py-4 transition-colors hover:border-accent/25 hover:bg-primary/55">
                <p className="shrink-0 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-text-muted">Contact</p>
                <p className="mt-2 break-words text-pretty text-sm leading-relaxed text-text">
                  {siteDoc?.preferredContact || 'Email'}
                </p>
              </div>
              <div className="group flex min-w-0 flex-col rounded-2xl border border-white/10 bg-primary/40 px-4 py-4 transition-colors hover:border-accent/25 hover:bg-primary/55">
                <p className="shrink-0 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-text-muted">Availability</p>
                <p className="mt-2 break-words text-pretty text-sm leading-relaxed text-text">
                  {siteDoc?.availability || 'Update in admin'}
                </p>
              </div>
            </div>

            {featuredProjects.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {featuredProjects.map((project) => (
                  <a
                    key={project.id || project.title}
                    href="#projects"
                    className="inline-flex max-w-full items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-mono uppercase tracking-[0.12em] text-accent"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span className="max-w-[18rem] truncate">{project.title}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>


    </section>
  );
};

export default Hero;
