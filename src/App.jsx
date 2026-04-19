import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Certifications from './components/Certifications';
import Testimonials from './components/Testimonials';
import Blog from './components/Blog';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Preloader from './components/Preloader';
import SEO from './components/SEO';
import StructuredData from './components/StructuredData';
import SkipToContent from './components/SkipToContent';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import ScrollProgress from './components/ScrollProgress';
import ScrollToTop from './components/ScrollToTop';
import SmoothScroll from './components/SmoothScroll';
import { Analytics } from '@vercel/analytics/react';
import { isBotUserAgent, shouldDisableHeavyVisuals } from './utils/runtimeGuards';
import { waitForHomepageCms } from './lib/cms';

const ThreeBackground = lazy(() => import('./components/ThreeBackground'));
const CustomCursor = lazy(() => import('./components/CustomCursor'));

function App() {
  const isBot = isBotUserAgent();
  const cmsBootstrapTask = useMemo(() => waitForHomepageCms(), []);

  const [visualIntroDone, setVisualIntroDone] = useState(isBot);
  const [appReady, setAppReady] = useState(false);
  const [heavyVisualsEnabled, setHeavyVisualsEnabled] = useState(() => !shouldDisableHeavyVisuals());

  useEffect(() => {
    if (!visualIntroDone) return undefined;
    let cancelled = false;
    cmsBootstrapTask.finally(() => {
      if (!cancelled) setAppReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [visualIntroDone, cmsBootstrapTask]);

  useEffect(() => {
    let animationFrameId;

    const handleMouseMove = (e) => {
      if (animationFrameId) return;

      animationFrameId = requestAnimationFrame(() => {
        const cards = document.getElementsByClassName('glass-card');
        for (const card of cards) {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);
        }
        animationFrameId = null;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setHeavyVisualsEnabled(!shouldDisableHeavyVisuals());
    };

    update();
    reduceMotionQuery.addEventListener('change', update);
    return () => {
      reduceMotionQuery.removeEventListener('change', update);
    };
  }, []);

  return (
    <>
      <SEO />
      {appReady ? <StructuredData /> : null}
      <SkipToContent />
      <KeyboardShortcuts />
      <ScrollProgress />
      <ScrollToTop />
      <SmoothScroll />
      <AnimatePresence mode="wait">
        {!isBot && !visualIntroDone && (
          <Preloader
            brand="Sahan - Space Portfolio"
            tasks={[cmsBootstrapTask]}
            onComplete={() => setVisualIntroDone(true)}
          />
        )}
      </AnimatePresence>

      {!appReady && (isBot || visualIntroDone) && (
        <div
          className="fixed inset-0 z-[95] flex flex-col items-center justify-center gap-4 bg-primary text-text-muted"
          aria-busy="true"
          aria-live="polite"
        >
          <div
            className="h-10 w-10 rounded-full border-2 border-accent/35 border-t-accent animate-spin"
            role="status"
          />
          <span className="text-xs font-mono uppercase tracking-[0.2em]">Syncing content</span>
        </div>
      )}

      {appReady && (
        <motion.div
          className="bg-primary min-h-screen text-text-muted selection:bg-accent selection:text-primary transition-colors duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {heavyVisualsEnabled && (
            <Suspense fallback={null}>
              <CustomCursor />
            </Suspense>
          )}
          {heavyVisualsEnabled && (
            <Suspense fallback={null}>
              <ThreeBackground />
            </Suspense>
          )}

          <div className="relative z-10">
            <Navbar />
            <main id="main-content">
              <Hero />
              <About />
              <Skills />
              <Experience />
              <Projects />
              <Certifications />
              <Testimonials />
              <Blog />
              <Contact />
            </main>
            <Footer />
          </div>
          <Analytics />
        </motion.div>
      )}
    </>
  );
}

export default App;
