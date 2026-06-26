import { useEffect, useState } from 'react';
import { shouldDisableHeavyVisuals } from '../utils/runtimeGuards';
import { useAccessibility } from '../context/AccessibilityContext';

/**
 * Shared lifecycle for section 3D canvases: respects lite mode, reduced motion,
 * tab hidden state, and freezes rendering when not in the viewport.
 */
export function useCanvasLifecycle(ref = null) {
  const [enabled, setEnabled] = useState(() => !shouldDisableHeavyVisuals());
  const { reduceMotion } = useAccessibility();
  const [tabActive, setTabActive] = useState(
    () => typeof document === 'undefined' || !document.hidden,
  );
  const [inView, setInView] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateEnabled = () => setEnabled(!shouldDisableHeavyVisuals());
    const updateTabActive = () => setTabActive(!document.hidden);

    updateEnabled();
    reduceMotionQuery.addEventListener('change', updateEnabled);
    window.addEventListener('visual-mode-change', updateEnabled);
    window.addEventListener('storage', updateEnabled);
    document.addEventListener('visibilitychange', updateTabActive);

    return () => {
      reduceMotionQuery.removeEventListener('change', updateEnabled);
      window.removeEventListener('visual-mode-change', updateEnabled);
      window.removeEventListener('storage', updateEnabled);
      document.removeEventListener('visibilitychange', updateTabActive);
    };
  }, []);

  useEffect(() => {
    if (!ref || !ref.current || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return {
    enabled,
    tabActive,
    inView,
    shouldAnimate: enabled && tabActive && inView && !reduceMotion,
  };
}

export function useIsMobileCanvas() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const query = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return isMobile;
}
