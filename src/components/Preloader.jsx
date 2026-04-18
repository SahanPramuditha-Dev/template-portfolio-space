import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
const DURATION = {
  FULL: 5000,
  REDUCED: 1800,
  REPEAT: 1300,
};

const STAGES = [
  { at: 0,    status: 'Cold open',       title: 'Entering the void',     detail: 'Stars are coming into focus.' },
  { at: 750,  status: 'Boot sequence',   title: 'Initializing system…',  detail: 'Loading modules and stabilizing the core.' },
  { at: 1700, status: 'Orbital motion',  title: 'Orbit lock engaged',    detail: 'Progress is being mapped through the ring.' },
  { at: 2900, status: 'Identity reveal', title: 'Signal acquired',       detail: 'The digital universe is aligning.' },
  { at: 4100, status: 'Transition',      title: 'Launch ready',          detail: 'Entering the world.' },
];

const BOOT_LINES = [
  'Initializing system…',
  'Loading modules…',
  'Establishing connection…',
  'Syncing UI theme tokens…',
  'Warming interaction layer…',
];

const TAGS = [
  { label: 'Exploration', threshold: 0.18 },
  { label: 'Engineering', threshold: 0.38 },
  { label: 'Signal',      threshold: 0.58 },
];

const EMPTY_TASKS = Object.freeze([]);

// Stable star data – generated once, frozen to prevent re-computation
const STARS = Object.freeze(
  Array.from({ length: 48 }, (_, i) => ({
    id: i,
    left:   `${(i * 13.7) % 100}%`,
    top:    `${(i * 17.3) % 100}%`,
    size:   1 + (i % 3) * 0.6,
    opacity: 0.2 + (i % 5) * 0.12,
    delay:  (i * 0.19) % 2.1,
    dur:    2.5 + (i % 4) * 0.7,
  }))
);

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function getStage(elapsed) {
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (elapsed >= STAGES[i].at) return STAGES[i];
  }
  return STAGES[0];
}

// ─────────────────────────────────────────────
// HOOK – central animation driver
// ─────────────────────────────────────────────
function rafNTimes(n = 2) {
  return new Promise((resolve) => {
    let i = 0;
    const tick = () => {
      i += 1;
      if (i >= n) return resolve();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

function usePreloadDriver({
  reducedMotion,
  repeatVisit,
  tasks,
  minDurationMs,
  maxDurationMs,
  graceWaitMs = 600,
  onDone,
}) {
  const rafRef = useRef(null);
  const doneRef = useRef(false);

  const [displayProgress, setDisplayProgress] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  const durationForStages = reducedMotion
    ? DURATION.REDUCED
    : (repeatVisit ? DURATION.REPEAT : DURATION.FULL);

  const allTasks = useMemo(() => {
    const list = [];

    // A couple frames so layout/paint settles
    list.push(rafNTimes(2));

    // User-supplied tasks (optional)
    if (Array.isArray(tasks) && tasks.length) {
      list.push(...tasks);
    }

    return list;
  }, [tasks]);

  useEffect(() => {
    let cancelled = false;
    const resetFrame = requestAnimationFrame(() => {
      if (!cancelled) setCompletedCount(0);
    });

    const total = allTasks.length || 1;
    allTasks.forEach((p) => {
      Promise.resolve(p)
        .catch(() => null)
        .finally(() => {
          if (cancelled) return;
          setCompletedCount((c) => Math.min(total, c + 1));
        });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(resetFrame);
    };
  }, [allTasks]);

  const readyFraction = useMemo(() => {
    const total = allTasks.length || 1;
    return clamp(completedCount / total, 0, 1);
  }, [completedCount, allTasks.length]);

  useEffect(() => {
    doneRef.current = false;
    const start = performance.now();

    const tick = (now) => {
      const nextElapsed = now - start;

      // Smooth, steady pacing: move up to ~90% over maxDurationMs.
      // Then “hold” near the end until real tasks are ready, and finish.
      const timeProgress = clamp(nextElapsed / maxDurationMs, 0, 1);
      const base = clamp(0.02 + timeProgress * 0.88, 0, 0.9);
      const readyBoost = clamp(readyFraction * 0.08, 0, 0.08);
      let cappedTarget = clamp(base + readyBoost, 0, 0.98);

      // “Feels instant” behavior:
      // - Don't block the app on real tasks for long.
      // - Give tasks a short grace window to finish, then proceed.
      const canFinish =
        nextElapsed >= minDurationMs &&
        (readyFraction >= 1 || nextElapsed >= minDurationMs + graceWaitMs);
      const timedOut = nextElapsed >= maxDurationMs;
      if (canFinish || timedOut) cappedTarget = 1;

      setDisplayProgress((p) => {
        const delta = cappedTarget - p;
        const step = reducedMotion ? 0.25 : 0.12;
        const next = clamp(p + delta * step, 0, 1);
        // Never move backwards (prevents “front/back” feel in dev re-renders)
        return Math.max(p, next);
      });

      if (!doneRef.current && (canFinish || timedOut)) {
        doneRef.current = true;
        setDisplayProgress(1);
        setTimeout(onDone, 70);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [durationForStages, graceWaitMs, maxDurationMs, minDurationMs, onDone, readyFraction, reducedMotion]);

  return {
    // Stage timeline derived from visible progress (always up-to-date)
    elapsed: durationForStages * displayProgress,
    progress: displayProgress,
    readyFraction,
  };
}

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

// Stars – uses CSS keyframes only, no JS per-frame work
const StarField = () => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0">
    {STARS.map(s => (
      <span
        key={s.id}
        className="absolute rounded-full bg-white"
        style={{
          left: s.left,
          top: s.top,
          width: `${s.size}px`,
          height: `${s.size}px`,
          opacity: s.opacity,
          ['--tw-base']: s.opacity,
          animation: `pl-twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
          willChange: 'opacity',
        }}
      />
    ))}
  </div>
);

// Persistent orbital rings – CSS-only, no JS
const OrbitalRings = ({ visible }) => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
    <div
      className="absolute rounded-full"
      style={{
        width: 360, height: 360,
        border: '0.5px solid transparent',
        borderTopColor:  'rgba(var(--color-accent-rgb, 99 179 237) / 0.34)',
        borderRightColor:'rgba(var(--color-accent-rgb, 99 179 237) / 0.12)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 1.2s ease',
        animation: 'pl-orbit1 14s linear infinite',
        willChange: 'transform',
      }}
    />
    <div
      className="absolute rounded-full"
      style={{
        width: 530, height: 530,
        border: '0.5px solid transparent',
        borderBottomColor:'rgba(var(--color-accent-glow-rgb, 159 122 234) / 0.28)',
        borderLeftColor:  'rgba(var(--color-accent-glow-rgb, 159 122 234) / 0.10)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 1.4s ease',
        animation: 'pl-orbit2 22s linear infinite',
        willChange: 'transform',
      }}
    />
  </div>
);

// Status dot + label row
const StatusRow = ({ label }) => (
  <div className="flex items-center gap-2">
    <span
      aria-hidden="true"
      className="h-1.5 w-1.5 rounded-full"
      style={{
        background: 'rgba(var(--color-accent-rgb, 99 179 237) / 1)',
        boxShadow: '0 0 10px rgba(var(--color-accent-rgb, 99 179 237) / 0.8)',
        animation: 'pl-pulse-dot 1.6s ease-in-out infinite',
      }}
    />
    <span
      className="text-[0.62rem] uppercase tracking-[0.4em]"
      style={{ color: 'rgba(var(--color-accent-rgb, 99 179 237) / 0.78)' }}
    >
      {label}
    </span>
  </div>
);

// Stage headline – slides in from direction based on index parity
const StageTitle = ({ stage }) => (
  <AnimatePresence mode="wait">
    <motion.h1
      key={stage.title}
      className="max-w-lg text-[2rem] font-bold leading-tight tracking-tight text-text font-display sm:text-[2.4rem]"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.38, ease: 'easeOut' }}
    >
      <span className="gradient-text">{stage.title}</span>
    </motion.h1>
  </AnimatePresence>
);

// Boot sequence panel
const BootPanel = ({ bootLineIndex, progress, visible }) => {
  const pct = Math.round(progress * 100);

  return (
    <motion.div
      className="rounded-xl border border-white/10 bg-secondary/20 px-4 py-3 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between font-mono text-[0.6rem] uppercase tracking-[0.34em] text-text-muted">
        <span>Boot sequence</span>
        <span>{pct}%</span>
      </div>

      {/* Lines */}
      <div className="mb-3 space-y-2">
        {BOOT_LINES.map((line, i) => {
          const active = i <= bootLineIndex;
          return (
            <div key={line} className="flex items-center gap-2 font-mono text-xs">
              <span
                className="h-1 w-1 rounded-full flex-shrink-0 transition-all duration-300"
                style={{
                  background: active
                    ? 'rgba(var(--color-accent-rgb, 56 189 248) / 1)'
                    : 'rgba(255,255,255,0.18)',
                  boxShadow: active
                    ? '0 0 10px rgba(var(--color-accent-rgb, 56 189 248) / 0.55)'
                    : 'none',
                }}
              />
              <span
                className="transition-colors duration-300"
                style={{
                  color: active ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.32)',
                }}
              >
                {line}
              </span>
            </div>
          );
        })}
      </div>

      {/* Scan line */}
      <div className="mb-3 h-px w-full overflow-hidden rounded-full bg-white/[0.05]">
        <motion.div
          className="h-full bg-gradient-to-r from-transparent to-transparent"
          style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(var(--color-accent-rgb, 56 189 248) / 0.7), transparent)' }}
          initial={{ x: '-100%' }}
          animate={visible ? { x: '100%' } : { x: '-100%' }}
          transition={{ duration: 0.9, ease: 'easeInOut', delay: visible ? 0.6 : 0 }}
        />
      </div>

      {/* Tags */}
      <div className="grid grid-cols-3 gap-1.5">
        {TAGS.map(({ label, threshold }) => {
          const active = progress >= threshold;
          return (
            <div
              key={label}
              className="rounded-lg px-2.5 py-1.5 text-center text-[0.58rem] uppercase tracking-[0.25em] transition-all duration-400"
              style={{
                border: active
                  ? '0.5px solid rgba(var(--color-accent-rgb, 56 189 248) / 0.32)'
                  : '0.5px solid rgba(255,255,255,0.08)',
                background: active
                  ? 'rgba(var(--color-accent-rgb, 56 189 248) / 0.08)'
                  : 'rgba(255,255,255,0.03)',
                color: active ? 'rgba(255,255,255,0.86)' : 'rgba(255,255,255,0.35)',
                boxShadow: active
                  ? '0 0 16px rgba(var(--color-accent-rgb, 56 189 248) / 0.10)'
                  : 'none',
              }}
            >
              {label}
            </div>
          );
        })}
      </div>

      <div className="mt-3 rounded-md border border-white/10 bg-primary/30 px-2.5 py-2 font-mono text-[0.62rem] text-text-muted">
        <span className="mr-1 text-accent">›</span>
        Boot integrity verified. Awaiting handoff.
      </div>
    </motion.div>
  );
};

const BootPanelPlaceholder = () => (
  <div className="rounded-xl border border-white/10 bg-secondary/15 px-4 py-3 backdrop-blur-md">
    <div className="mb-3 flex items-center justify-between font-mono text-[0.6rem] uppercase tracking-[0.34em] text-text-muted">
      <span>Boot sequence</span>
      <span className="opacity-70">…</span>
    </div>
    <div className="space-y-2">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="h-1 w-1 rounded-full"
            style={{
              background: 'rgba(var(--color-accent-rgb, 56 189 248) / 0.55)',
              boxShadow: '0 0 10px rgba(var(--color-accent-rgb, 56 189 248) / 0.22)',
              animation: 'pl-pulse-dot 1.6s ease-in-out infinite',
              animationDelay: `${i * 0.12}s`,
            }}
          />
          <span
            className="h-2 w-full rounded"
            style={{
              background:
                'linear-gradient(90deg, rgba(255,255,255,0.10), rgba(255,255,255,0.05), rgba(255,255,255,0.10))',
              backgroundSize: '200% 100%',
              animation: 'pl-shimmer 1.3s ease-in-out infinite',
              opacity: 0.7,
            }}
          />
        </div>
      ))}
    </div>
  </div>
);

// Progress bar
const ProgressBar = ({ progress, taglineVisible, showHeader = true }) => {
  const pct = Math.round(progress * 100);

  return (
    <div className="space-y-2">
      {showHeader && (
        <div className="flex justify-between font-mono text-[0.6rem] uppercase tracking-[0.34em] text-text-muted">
          <span>Launch telemetry</span>
          <span>{pct}%</span>
        </div>
      )}
      <div className="relative h-[4px] overflow-hidden rounded-full bg-white/[0.08]">
        <motion.div
          className="relative h-full rounded-full"
          initial={false}
          animate={{ width: `${Math.max(3, pct)}%` }}
          transition={{ duration: 0.2, ease: 'linear' }}
          style={{
            background: 'linear-gradient(90deg, rgb(var(--color-accent-rgb, 99 179 237)), rgba(var(--color-accent-glow-rgb, 159 122 234) / 0.95))',
            willChange: 'width',
            boxShadow: '0 0 18px rgba(var(--color-accent-rgb, 56 189 248) / 0.22)',
          }}
        >
          {/* Leading shimmer */}
          <span
            className="absolute inset-0 rounded-full"
            style={{ animation: 'pl-shimmer 1.4s ease-in-out infinite' }}
          />
        </motion.div>
      </div>
      <motion.p
        className="text-[0.72rem] leading-5 text-text-muted"
        animate={{ opacity: taglineVisible ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      >
        Narrative-driven loading turns waiting into a first impression.
      </motion.p>
    </div>
  );
};

// Completion panel – shown after card exits
const CompletionPanel = ({ visible }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        className="pointer-events-none absolute inset-0 flex items-center justify-center px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-secondary/25 p-6 text-center backdrop-blur-md sm:p-8"
          initial={{ y: 10, scale: 0.98, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          style={{ boxShadow: '0 34px 90px rgba(0,0,0,0.55)' }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(560px 280px at 50% 20%, rgba(var(--color-accent-rgb,56 189 248) / 0.22), transparent 60%), radial-gradient(520px 320px at 50% 95%, rgba(var(--color-accent-glow-rgb,14 165 233) / 0.14), transparent 62%)',
              opacity: 0.75,
            }}
          />

          <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  'conic-gradient(from 120deg, rgba(var(--color-accent-rgb,56 189 248) / 0.95), rgba(var(--color-accent-glow-rgb,14 165 233) / 0.9), rgba(var(--color-accent-rgb,56 189 248) / 0.95))',
                maskImage: 'radial-gradient(circle, transparent 62%, black 66%)',
                WebkitMaskImage: 'radial-gradient(circle, transparent 62%, black 66%)',
                animation: 'pl-sweep 1.9s linear infinite',
                opacity: 0.75,
              }}
            />
            <motion.div
              className="relative flex h-16 w-16 items-center justify-center rounded-full text-3xl"
              style={{
                color: 'rgba(var(--color-accent-rgb, 56 189 248) / 1)',
                border: '1px solid rgba(var(--color-accent-rgb, 56 189 248) / 0.45)',
                background: 'rgba(2,6,23,0.25)',
                boxShadow:
                  '0 0 0 1px rgba(0,0,0,0.22), 0 0 34px rgba(var(--color-accent-rgb, 56 189 248) / 0.18)',
              }}
              initial={{ scale: 0.85, rotate: -14, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            >
              ✓
            </motion.div>
          </div>

          <motion.h2
            className="relative text-2xl font-bold tracking-tight text-text font-display sm:text-3xl"
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <span className="gradient-text">Ready to launch</span>
          </motion.h2>
          <motion.p
            className="relative mt-2 text-sm leading-relaxed text-text-muted"
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.18 }}
          >
            Final checks complete. Preparing the first section…
          </motion.p>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Full-screen flash — the signature cinematic transition
const FlashOverlay = ({ triggered }) => (
  <motion.div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 bg-white"
    initial={{ opacity: 0 }}
    animate={triggered ? [
      { opacity: 0 },
      { opacity: 1, transition: { duration: 0.22, ease: 'easeIn' } },
      { opacity: 0, transition: { duration: 0.7, ease: 'easeOut', delay: 0.15 } },
    ] : { opacity: 0 }}
    style={{ zIndex: 50, willChange: 'opacity' }}
  />
);

// ─────────────────────────────────────────────
// CSS KEYFRAMES (injected once)
// ─────────────────────────────────────────────
const GLOBAL_STYLES = `
  @keyframes pl-twinkle {
    0%,100% { opacity: var(--tw-base, 0.25); }
    50%      { opacity: calc(var(--tw-base, 0.25) * 3.5); }
  }
  @keyframes pl-pulse-dot {
    0%,100% { opacity: 0.7; transform: scale(1); }
    50%      { opacity: 1;   transform: scale(1.35); }
  }
  @keyframes pl-orbit1 {
    to { transform: rotate(360deg); }
  }
  @keyframes pl-orbit2 {
    to { transform: rotate(-360deg); }
  }
  @keyframes pl-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes pl-aura {
    0%   { transform: translateZ(0) scale(1); opacity: 0.55; }
    50%  { transform: translateZ(0) scale(1.08); opacity: 0.85; }
    100% { transform: translateZ(0) scale(1); opacity: 0.55; }
  }
  @keyframes pl-sweep {
    to { transform: rotate(360deg); }
  }
  @keyframes pl-drift {
    0%   { transform: translate3d(-2%, -1%, 0) scale(1); opacity: 0.75; }
    50%  { transform: translate3d(2%, 1%, 0) scale(1.06); opacity: 1; }
    100% { transform: translate3d(-2%, -1%, 0) scale(1); opacity: 0.75; }
  }
  @keyframes pl-floaty {
    0%,100% { transform: translate3d(0, 0, 0); }
    50%     { transform: translate3d(0, -8px, 0); }
  }
`;

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
const Preloader = ({ onComplete, brand = 'Space Portfolio', tasks }) => {
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    } catch {
      return false;
    }
  });
  const [repeatVisit] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const seen = window.sessionStorage.getItem('preloaderSeen') === '1';
      if (!seen) window.sessionStorage.setItem('preloaderSeen', '1');
      return seen;
    } catch {
      return false;
    }
  });
  const [exitStarted, setExitStarted] = useState(false);

  // Respect system accessibility preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Lock run mode so it never flips mid-loader (prevents “front/back” effect)
  const [runMode] = useState(() => ({ reducedMotion, repeatVisit }));

  const stableOnComplete = useCallback(() => onComplete?.(), [onComplete]);
  const minDurationMs = reducedMotion ? 80 : (repeatVisit ? 120 : 260);
  const maxDurationMs = reducedMotion ? 360 : (repeatVisit ? 520 : 900);

  const stableTasks = tasks ?? EMPTY_TASKS;

  const { elapsed, progress } = usePreloadDriver({
    reducedMotion: runMode.reducedMotion,
    repeatVisit: runMode.repeatVisit,
    tasks: stableTasks,
    minDurationMs,
    maxDurationMs,
    graceWaitMs: reducedMotion ? 0 : 120,
    onDone: () => setExitStarted(true),
  });

  useEffect(() => {
    if (!exitStarted) return undefined;
    const t = setTimeout(stableOnComplete, 70);
    return () => clearTimeout(t);
  }, [exitStarted, stableOnComplete]);

  // Derived state – all memoised
  const stage = useMemo(() => getStage(elapsed), [elapsed]);

  const bootLineIndex = useMemo(
    () => Math.min(BOOT_LINES.length - 1, Math.max(-1, Math.floor((elapsed - 220) / 150))),
    [elapsed]
  );

  const bootVisible    = elapsed >= 140;
  const orbitalsVisible = elapsed >= 180;
  const taglineVisible = progress < 0.82;
  const cardExiting    = exitStarted;
  const completionVisible = exitStarted;
  const flashTriggered = exitStarted;
  const canSkip = reducedMotion || progress >= 0.28;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-primary text-text">
      <style>{GLOBAL_STYLES}</style>

      {/* Theme-matched base backdrop (matches PageShell + site sections) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_34%),linear-gradient(180deg,rgba(2,6,23,1),rgba(15,23,42,1))]"
      />

      {/* Nebula drift (adds depth, theme-aware) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(900px 520px at 20% 25%, rgba(var(--color-accent-rgb, 56 189 248) / 0.14), transparent 60%),
            radial-gradient(780px 520px at 80% 60%, rgba(var(--color-accent-glow-rgb, 14 165 233) / 0.12), transparent 62%),
            radial-gradient(540px 440px at 55% 38%, rgba(255,255,255,0.035), transparent 62%)
          `,
          animation: 'pl-drift 7.5s ease-in-out infinite',
          filter: 'saturate(1.05)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Grid overlay */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 100%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      />

      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
        style={{
          width: 480, height: 320,
          background: 'radial-gradient(ellipse at 50% 0%, rgba(var(--color-accent-rgb, 99 179 237) / 0.18) 0%, transparent 70%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 760,
          height: 520,
          background:
            'radial-gradient(ellipse at 55% 45%, rgba(var(--color-accent-glow-rgb, 159 122 234) / 0.14) 0%, transparent 65%)',
          filter: 'blur(0px)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.035) 0%, transparent 60%), linear-gradient(180deg, rgba(2,6,23,0.18) 0%, rgba(2,6,23,0.08) 45%, rgba(2,6,23,0.22) 100%)',
        }}
      />

      <StarField />
      <OrbitalRings visible={orbitalsVisible} />

      {/* Main frame (matches site container rhythm) */}
      <div className="fixed inset-0 flex items-center justify-center px-4 py-10">
        <AnimatePresence>
          {!cardExiting && (
            <motion.div
              className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-secondary/20 p-6 backdrop-blur-md sm:p-8"
              style={{
                boxShadow: '0 34px 96px rgba(0,0,0,0.62)',
              }}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {/* Premium border glow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[1.5rem]"
                style={{
                  border: '1px solid rgba(255,255,255,0.06)',
                  background:
                    'linear-gradient(120deg, rgba(var(--color-accent-rgb,56 189 248) / 0.12), transparent 40%, rgba(var(--color-accent-glow-rgb,14 165 233) / 0.10))',
                  maskImage: 'linear-gradient(#000, #000)',
                  opacity: 0.55,
                }}
              />
              {/* Soft spotlight inside card */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[1.5rem]"
                style={{
                  background:
                    'radial-gradient(700px 420px at 30% 25%, rgba(var(--color-accent-rgb,56 189 248) / 0.16), transparent 55%)',
                  opacity: 0.55,
                }}
              />

              {/* Top bar (mirrors Navbar brand + meta chips) */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <a
                    href="#home"
                    className="text-2xl font-bold text-accent"
                    onClick={(e) => e.preventDefault()}
                  >
                    <span className="text-text">{brand}</span>
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-mono uppercase tracking-[0.14em] text-accent">
                    {repeatVisit ? 'Fast lane' : 'Cinematic'}
                  </span>
                  <span className="rounded-full border border-white/10 bg-primary/40 px-3 py-1.5 text-xs font-mono uppercase tracking-[0.14em] text-text-muted">
                    {Math.round(progress * 100)}%
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:gap-10">
                {/* Left: copy + status */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <StatusRow label={stage.status} />
                    <StageTitle stage={stage} />
                    <p className="text-base leading-relaxed text-text-muted">{stage.detail}</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-primary/40 p-4 backdrop-blur-md">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-mono text-xs uppercase tracking-[0.18em] text-text-muted">Launch telemetry</p>
                      <p className="font-mono text-xs uppercase tracking-[0.18em] text-text-muted">
                        {canSkip ? 'Ready when you are' : 'Optimizing…'}
                      </p>
                    </div>
                    <div className="mt-3">
                      <ProgressBar progress={progress} taglineVisible={taglineVisible} showHeader={false} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-text-muted">
                      {canSkip ? 'You can skip anytime.' : 'This takes a moment on first load.'}
                    </p>
                    {canSkip && (
                      <button
                        type="button"
                        onClick={() => setExitStarted(true)}
                        className="rounded-full border border-accent/30 bg-secondary/25 px-5 py-2.5 text-xs font-mono uppercase tracking-[0.18em] text-accent transition-colors hover:bg-accent/10"
                        style={{
                          boxShadow:
                            '0 0 0 1px rgba(0,0,0,0.25), 0 0 18px rgba(var(--color-accent-rgb,56 189 248) / 0.16)',
                        }}
                      >
                        Enter site
                      </button>
                    )}
                  </div>
                </div>

                {/* Right: “hero-like” visual */}
                <div className="space-y-5">
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-primary/40 p-6 backdrop-blur-md">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          'radial-gradient(700px 420px at 70% 35%, rgba(var(--color-accent-rgb,56 189 248) / 0.18), transparent 60%), radial-gradient(520px 380px at 35% 70%, rgba(var(--color-accent-glow-rgb,14 165 233) / 0.14), transparent 62%)',
                      }}
                    />

                    <div className="relative flex items-center justify-between gap-4">
                      <p className="font-mono text-xs uppercase tracking-[0.18em] text-text-muted">
                        Systems check
                      </p>
                      <p className="text-xs text-text-muted">
                        {progress < 0.6 ? 'Calibrating visuals…' : progress < 0.9 ? 'Warming engines…' : 'Finalizing…'}
                      </p>
                    </div>

                    <div className="relative mt-6 flex items-center justify-center">
                      <div className="relative h-44 w-44 sm:h-52 sm:w-52" style={{ animation: 'pl-floaty 3.8s ease-in-out infinite' }}>
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 rounded-full"
                          style={{
                            background:
                              'radial-gradient(circle at 35% 30%, rgba(var(--color-accent-rgb,56 189 248) / 0.20), rgba(var(--color-accent-glow-rgb,14 165 233) / 0.10) 55%, transparent 72%)',
                            filter: 'blur(10px)',
                            animation: 'pl-aura 2.4s ease-in-out infinite',
                          }}
                        />
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 rounded-full"
                          style={{
                            background:
                              'conic-gradient(from 120deg, rgba(var(--color-accent-rgb,56 189 248) / 0.95), rgba(var(--color-accent-glow-rgb,14 165 233) / 0.92), rgba(var(--color-accent-rgb,56 189 248) / 0.95))',
                            maskImage: 'radial-gradient(circle, transparent 61%, black 64%)',
                            WebkitMaskImage: 'radial-gradient(circle, transparent 61%, black 64%)',
                            animation: 'pl-sweep 2.8s linear infinite',
                            opacity: 0.65,
                          }}
                        />
                        <div
                          aria-hidden="true"
                          className="absolute inset-[10px] rounded-full"
                          style={{
                            background:
                              'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.16), rgba(255,255,255,0.04) 46%, rgba(255,255,255,0.02) 100%)',
                            border: '1px solid rgba(255,255,255,0.10)',
                            boxShadow:
                              '0 0 0 1px rgba(0,0,0,0.22), 0 18px 70px rgba(0,0,0,0.45), 0 0 34px rgba(var(--color-accent-rgb,56 189 248) / 0.12)',
                          }}
                        />
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                          <div className="text-4xl font-display font-bold text-text">S</div>
                          <div className="mt-1 text-xs font-mono uppercase tracking-[0.22em] text-text-muted">Launch</div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <div className="mt-5">
                <AnimatePresence mode="wait">
                  {bootVisible ? (
                    <motion.div
                      key="boot-live"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                    >
                      <BootPanel bootLineIndex={bootLineIndex} progress={progress} visible={true} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="boot-skeleton"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                    >
                      <BootPanelPlaceholder />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <CompletionPanel visible={completionVisible} />
      </div>

      <FlashOverlay triggered={flashTriggered} />
    </div>
  );
};

export default Preloader;
