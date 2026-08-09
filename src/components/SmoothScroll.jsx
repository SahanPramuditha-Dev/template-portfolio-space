import { useEffect } from 'react';
import Lenis from 'lenis';

const SmoothScroll = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

    const lenis = new Lenis({
      duration: isTouchDevice ? 0.6 : 0.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // responsive exponential ease-out
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1.0,
      smoothTouch: false, // Use native GPU momentum scrolling on touch devices
      touchMultiplier: 1.0,
      lerp: 0.12,
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
