import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, trackScrollDepth } from '../utils/analytics';

const RouteAnalytics = () => {
  const location = useLocation();
  const seenDepthsRef = useRef(new Set());

  useEffect(() => {
    const path = `${location.pathname}${location.search}${location.hash}`;
    trackPageView(path);
    seenDepthsRef.current = new Set();

    let ticking = false;

    const reportDepth = () => {
      const doc = document.documentElement;
      const maxScroll = Math.max(doc.scrollHeight - window.innerHeight, 0);
      const currentScroll = maxScroll > 0 ? window.scrollY : maxScroll;
      const depth = maxScroll > 0 ? Math.round((currentScroll / maxScroll) * 100) : 100;

      [25, 50, 75, 100].forEach((threshold) => {
        if (depth >= threshold && !seenDepthsRef.current.has(threshold)) {
          seenDepthsRef.current.add(threshold);
          trackScrollDepth(path, threshold);
        }
      });
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        reportDepth();
        ticking = false;
      });
    };

    reportDepth();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [location.pathname, location.search, location.hash]);

  return null;
};

export default RouteAnalytics;
