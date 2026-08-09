import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const isVisibleRef = useRef(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    let ticking = false;

    const toggleVisibility = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const shouldShow = window.scrollY > 500;
        if (isVisibleRef.current !== shouldShow) {
          isVisibleRef.current = shouldShow;
          setIsVisible(shouldShow);
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { duration: 1.6 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-8 right-8 z-50"
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <button
            onClick={scrollToTop}
            className="relative flex items-center justify-center w-12 h-12 rounded-full bg-secondary shadow-lg hover:shadow-accent/20 transition-shadow group"
            aria-label="Scroll to top"
          >
            {/* Progress Circle Background */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-primary"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-accent"
                style={{ pathLength: scrollYProgress }}
              />
            </svg>
            
            <ArrowUp className="w-6 h-6 text-accent group-hover:-translate-y-1 transition-transform" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;
