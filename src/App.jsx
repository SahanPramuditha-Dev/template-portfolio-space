import React, { Suspense, lazy, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import NowAvailability from './components/NowAvailability';
import Preloader from './components/Preloader';
import SEO from './components/SEO';
import StructuredData from './components/StructuredData';
import SkipToContent from './components/SkipToContent';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import ScrollProgress from './components/ScrollProgress';
import ScrollToTop from './components/ScrollToTop';
import SmoothScroll from './components/SmoothScroll';
import MobileQuickActions from './components/MobileQuickActions';
import { Analytics } from '@vercel/analytics/react';
import { isBotUserAgent, shouldDisableHeavyVisuals } from './utils/runtimeGuards';
import { CmsSectionSkeleton, FooterCmsSkeleton } from './components/CmsShapeSkeleton';

const ThreeBackground = lazy(() => import('./components/ThreeBackground'));
const CustomCursor = lazy(() => import('./components/CustomCursor'));
const Skills = lazy(() => import('./components/Skills'));
const Experience = lazy(() => import('./components/Experience'));
const Projects = lazy(() => import('./components/Projects'));
const Certifications = lazy(() => import('./components/Certifications'));
const Testimonials = lazy(() => import('./components/Testimonials'));
const Blog = lazy(() => import('./components/Blog'));
const Contact = lazy(() => import('./components/Contact'));
const Footer = lazy(() => import('./components/Footer'));

function App() {
  const isBot = isBotUserAgent();

  const [visualIntroDone, setVisualIntroDone] = useState(isBot);
  const [heavyVisualsEnabled, setHeavyVisualsEnabled] = useState(() => !shouldDisableHeavyVisuals());

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
    const update = () => {
      setHeavyVisualsEnabled(!shouldDisableHeavyVisuals());
    };
    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    update();
    reduceMotionQuery.addEventListener('change', update);
    window.addEventListener('visual-mode-change', update);
    window.addEventListener('storage', update);
    return () => {
      reduceMotionQuery.removeEventListener('change', update);
      window.removeEventListener('visual-mode-change', update);
      window.removeEventListener('storage', update);
    };
  }, []);

  return (
    <>
      <SEO />
      <StructuredData />
      <SkipToContent />
      <KeyboardShortcuts />
      <ScrollProgress />
      <ScrollToTop />
      <SmoothScroll />
      <AnimatePresence mode="wait">
        {!isBot && !visualIntroDone && (
          <Preloader
            brand="Sahan - Space Portfolio"
            onComplete={() => setVisualIntroDone(true)}
          />
        )}
      </AnimatePresence>

      {(isBot || visualIntroDone) && (
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
              <NowAvailability />
              <Suspense fallback={<CmsSectionSkeleton id="skills" />}>
                <Skills />
              </Suspense>
              <Suspense fallback={<CmsSectionSkeleton id="experience" />}>
                <Experience />
              </Suspense>
              <Suspense fallback={<CmsSectionSkeleton id="projects" />}>
                <Projects />
              </Suspense>
              <Suspense fallback={<CmsSectionSkeleton id="certifications" />}>
                <Certifications />
              </Suspense>
              <Suspense fallback={<CmsSectionSkeleton id="testimonials" />}>
                <Testimonials />
              </Suspense>
              <Suspense fallback={<CmsSectionSkeleton id="blog" />}>
                <Blog />
              </Suspense>
              <Suspense fallback={<CmsSectionSkeleton id="contact" />}>
                <Contact />
              </Suspense>
            </main>
            <Suspense fallback={<FooterCmsSkeleton />}>
              <Footer />
            </Suspense>
          </div>
          <MobileQuickActions />
          <Analytics />
        </motion.div>
      )}
    </>
  );
}

export default App;
