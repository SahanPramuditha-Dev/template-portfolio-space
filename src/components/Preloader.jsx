import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

/* ─── Config ─────────────────────────────────────────────────────────────── */
const MIN_VISIBLE_MS    = 3500;   // minimum time the screen is shown
const MAX_WAIT_MS       = 5500;   // hard cap before force-finishing
const PROGRESS_TICK_MS  = 60;     // slower tick = smoother feeling progress
const INTRO_SESSION_KEY = 'portfolioIntroSeen';

const BOOT_LINES = [
  'Initialising orbital systems',
  'Calibrating star field',
  'Loading mission data',
  'Establishing connection',
  'All systems nominal',
];

const seededRandom = (seed) => {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

/* ─── CSS-only starfield ─────────────────────────────────────────────────── */
const StarField = ({ reduced }) => {
  const stars = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left:    `${seededRandom(i + 1) * 100}%`,
      top:     `${seededRandom(i + 2) * 100}%`,
      size:    seededRandom(i + 3) > 0.85 ? 2 : 1,
      opacity: 0.15 + seededRandom(i + 4) * 0.5,
      delay:   seededRandom(i + 5) * 5,
      accent:  seededRandom(i + 6) > 0.88,
      dur:     3 + seededRandom(i + 7) * 4,
    })), []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {stars.map(s => (
        <span
          key={s.id}
          className="absolute rounded-full"
          style={{
            left:             s.left,
            top:              s.top,
            width:            s.size,
            height:           s.size,
            opacity:          s.opacity,
            backgroundColor:  s.accent ? 'var(--color-accent)' : '#ffffff',
            animation:        reduced ? 'none' : `pl-twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
};

/* ─── Animated orbit rings ───────────────────────────────────────────────── */
const OrbitRings = ({ progress, reduced }) => (
  <div className="relative mx-auto" style={{ width: 220, height: 220 }} aria-hidden="true">
    {/* Outer glow */}
    <div
      className="absolute inset-0 rounded-full"
      style={{
        background: 'radial-gradient(circle, rgb(var(--color-accent-rgb)/0.12) 0%, transparent 70%)',
        filter: 'blur(20px)',
      }}
    />

    {/* Ring 3 — slow drift */}
    <motion.div
      className="absolute rounded-full border border-dashed"
      style={{
        inset: 4,
        borderColor: 'rgb(var(--color-accent-rgb)/0.12)',
      }}
      animate={reduced ? {} : { rotate: 360 }}
      transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
    />

    {/* Ring 2 */}
    <motion.div
      className="absolute rounded-full border"
      style={{
        inset: 22,
        borderColor: 'rgb(var(--color-accent-rgb)/0.18)',
      }}
      animate={reduced ? {} : { rotate: -360 }}
      transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
    >
      {/* Orbiting dot */}
      {!reduced && (
        <span
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full"
          style={{
            background: 'var(--color-accent)',
            boxShadow: '0 0 8px var(--color-accent)',
          }}
        />
      )}
    </motion.div>

    {/* Progress arc SVG */}
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 220 220"
      style={{ transform: 'rotate(-90deg)' }}
    >
      <defs>
        <linearGradient id="pl-arc-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="var(--color-accent)" />
          <stop offset="60%"  stopColor="var(--color-accent-glow)" />
          <stop offset="100%" stopColor="var(--color-accent)" />
        </linearGradient>
        <filter id="pl-glow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Track */}
      <circle cx="110" cy="110" r="82" fill="none"
        stroke="rgb(var(--color-accent-rgb)/0.08)" strokeWidth="1.5" />
      {/* Progress */}
      <motion.circle
        cx="110" cy="110" r="82" fill="none"
        stroke="url(#pl-arc-grad)" strokeWidth="2" strokeLinecap="round"
        filter="url(#pl-glow)"
        strokeDasharray={2 * Math.PI * 82}
        initial={{ strokeDashoffset: 2 * Math.PI * 82 }}
        animate={{ strokeDashoffset: (2 * Math.PI * 82) * (1 - progress / 100) }}
        transition={{ duration: reduced ? 0.1 : 0.5, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>

    {/* Centre emblem */}
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        className="flex items-center justify-center rounded-full border"
        style={{
          width: 100, height: 100,
          background: 'linear-gradient(135deg, rgb(var(--color-secondary-rgb,30,41,59)/0.8), rgb(var(--color-primary-rgb,15,23,42)/0.9))',
          borderColor: 'rgb(var(--color-accent-rgb)/0.25)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 0 0 1px rgb(255 255 255/0.06) inset, 0 0 30px rgb(var(--color-accent-rgb)/0.15)',
        }}
        animate={reduced ? {} : { boxShadow: [
          '0 0 0 1px rgb(255 255 255/0.06) inset, 0 0 20px rgb(var(--color-accent-rgb)/0.1)',
          '0 0 0 1px rgb(255 255 255/0.06) inset, 0 0 40px rgb(var(--color-accent-rgb)/0.25)',
          '0 0 0 1px rgb(255 255 255/0.06) inset, 0 0 20px rgb(var(--color-accent-rgb)/0.1)',
        ]}}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Percent counter */}
        <div className="flex items-baseline gap-0.5 select-none translate-x-[2px]">
          <motion.span
            className="font-mono tabular-nums leading-none"
            style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-text)' }}
            key={Math.floor(progress / 5) * 5}
          >
            {String(Math.round(progress)).padStart(2, '0')}
          </motion.span>
          <span
            className="font-mono text-sm font-semibold leading-none"
            style={{ color: 'var(--color-accent)' }}
          >
            %
          </span>
        </div>
      </motion.div>
    </div>
  </div>
);

/* ─── Boot terminal lines ─────────────────────────────────────────────────── */
const BootLog = ({ progress, reduced }) => {
  const visibleCount = Math.ceil((progress / 100) * BOOT_LINES.length);
  return (
    <div className="w-full max-w-xs font-mono text-[11px] space-y-1" aria-hidden="true">
      {BOOT_LINES.slice(0, visibleCount).map((line, i) => (
        <motion.div
          key={line}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: reduced ? 0.05 : 0.3, delay: reduced ? 0 : i * 0.06 }}
          className="flex items-center gap-2"
        >
          <span style={{ color: 'var(--color-accent)' }}>›</span>
          <span style={{ color: 'var(--color-text-muted)' }}>{line}</span>
          {i === visibleCount - 1 && progress < 100 && !reduced && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              style={{ color: 'var(--color-accent)' }}
            >▌</motion.span>
          )}
          {(i < visibleCount - 1 || progress >= 100) && (
            <span style={{ color: '#22c55e', marginLeft: 'auto' }}>✓</span>
          )}
        </motion.div>
      ))}
    </div>
  );
};

/* ─── Skip button ─────────────────────────────────────────────────────────── */
const SkipButton = ({ onClick }) => (
  <motion.button
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 1.2, duration: 0.4 }}
    onClick={onClick}
    className="absolute bottom-8 right-8 font-mono text-[11px] uppercase tracking-[0.2em] flex items-center gap-1.5 transition-colors"
    style={{ color: 'var(--color-text-muted)' }}
    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
    onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
    aria-label="Skip loading screen"
  >
    Skip
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  </motion.button>
);

/* ─── Main Preloader ─────────────────────────────────────────────────────── */
const Preloader = ({ brand = 'Portfolio', onComplete }) => {
  const prefersReducedMotion = useReducedMotion();
  const [progress,  setProgress]  = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const startedAtRef  = useRef(Date.now());
  const finishedRef   = useRef(false);

  const brandParts    = brand.split(/\s*[-–—]\s*/);
  const primaryBrand  = brandParts[0]?.trim() || brand;

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setProgress(100);
    // Hold at 100% so user sees the completed state, then exit
    setTimeout(() => setIsExiting(true), prefersReducedMotion ? 80 : 900);
  }, [prefersReducedMotion]);

  // Lock scroll during preloader
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Progress ticker
  useEffect(() => {
    const hasSeenIntro = window.sessionStorage.getItem(INTRO_SESSION_KEY) === 'true';
    const isDeepLink   = window.location.pathname !== '/' || window.location.hash.length > 0;
    const shouldFast   = prefersReducedMotion || hasSeenIntro || isDeepLink;

    if (shouldFast) {
      const t = setTimeout(finish, prefersReducedMotion ? 80 : 150);
      return () => clearTimeout(t);
    }

    let interval, raf, maxTimer;

    const tick = () => {
      const elapsed   = Date.now() - startedAtRef.current;
      const loadRatio = document.readyState === 'complete' ? 1 : 0.65;
      const timeRatio = Math.min(elapsed / MIN_VISIBLE_MS, 1);
      const next      = Math.min(99, Math.round((timeRatio * 0.6 + loadRatio * 0.4) * 100));
      setProgress(cur => (next > cur ? next : cur));
      if (elapsed >= MIN_VISIBLE_MS && document.readyState === 'complete') finish();
    };

    interval = setInterval(tick, PROGRESS_TICK_MS);
    raf      = requestAnimationFrame(tick);

    if (document.readyState !== 'complete') {
      window.addEventListener('load', tick, { once: true });
    }

    maxTimer = setTimeout(finish, MAX_WAIT_MS);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(raf);
      clearTimeout(maxTimer);
      window.removeEventListener('load', tick);
    };
  }, [prefersReducedMotion, finish]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="preloader"
          role="status"
          aria-live="polite"
          aria-busy={!isExiting}
          aria-label={`Loading ${brand}`}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: 'var(--color-primary)' }}
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.04,
            filter: 'blur(12px)',
          }}
          transition={{ duration: prefersReducedMotion ? 0.15 : 0.7, ease: [0.22, 1, 0.36, 1] }}
          onAnimationComplete={(def) => {
            if (def?.opacity === 0 || isExiting) {
              window.sessionStorage.setItem(INTRO_SESSION_KEY, 'true');
              onComplete?.();
            }
          }}
        >
          {/* Background mesh */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 70% 50% at 50% -10%, rgb(var(--color-accent-rgb)/0.14) 0%, transparent 60%),
                radial-gradient(circle at 10% 90%, rgb(var(--color-accent-glow-rgb)/0.08) 0%, transparent 45%),
                radial-gradient(circle at 90% 20%, rgb(var(--color-accent-rgb)/0.06) 0%, transparent 40%)
              `,
            }}
          />

          {/* Film grain */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: 0.03,
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
              mixBlendMode: 'overlay',
            }}
          />

          <StarField reduced={prefersReducedMotion} />

          {/* Main card */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-8 px-6"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Eyebrow label */}
            <motion.p
              className="font-mono text-[10px] uppercase tracking-[0.35em]"
              style={{ color: 'var(--color-accent)' }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              Portfolio Experience
            </motion.p>

            {/* Name */}
            <motion.div
              className="text-center -mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.55 }}
            >
              <h1
                className="font-display text-5xl font-bold leading-none sm:text-6xl"
                style={{
                  background: 'linear-gradient(135deg, var(--color-text) 30%, var(--color-accent) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {primaryBrand}
              </h1>
            </motion.div>

            {/* Orbit progress ring */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.32, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <OrbitRings progress={progress} reduced={prefersReducedMotion} />
            </motion.div>

            {/* Boot log */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-col items-start"
            >
              <BootLog progress={progress} reduced={prefersReducedMotion} />
            </motion.div>

            {/* Bottom tagline */}
            <motion.p
              className="font-mono text-[10px] uppercase tracking-[0.28em]"
              style={{ color: 'rgba(var(--color-text-muted-rgb, 148,163,184), 0.55)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65, duration: 0.5 }}
            >
              Design · Craft · Presence
            </motion.p>
          </motion.div>

          {/* Skip button */}
          {!prefersReducedMotion && <SkipButton onClick={finish} />}

          {/* Horizontal scan line */}
          {!prefersReducedMotion && (
            <motion.div
              className="pointer-events-none absolute left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgb(var(--color-accent-rgb)/0.3), transparent)' }}
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
