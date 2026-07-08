import { useEffect } from 'react';
import Lenis from 'lenis';

const SmoothScroll = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

    const lenis = new Lenis({
      duration: isTouchDevice ? 0.8 : 1.2,
      easing: (t) => 1 - Math.pow(1 - t, 4), // quartic ease-out — smoother than cubic
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 0.9,
      smoothTouch: isTouchDevice,
      touchMultiplier: isTouchDevice ? 1.8 : 1.5,
      lerp: isTouchDevice ? 0.12 : 0.1,
      wheelMultiplier: 1.0,
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    const handleModalToggle = (e) => {
      if (e.detail?.isOpen) {
        lenis.stop();
      } else {
        lenis.start();
      }
    };
    window.addEventListener('modal-toggle', handleModalToggle);

    // Expose lenis globally so other components can use scrollTo
    window.__lenis = lenis;

    return () => {
      window.removeEventListener('modal-toggle', handleModalToggle);
      if (rafId) cancelAnimationFrame(rafId);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return null;
};

export default SmoothScroll;
