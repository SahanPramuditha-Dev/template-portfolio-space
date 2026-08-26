import React, { Suspense, lazy } from 'react';
import { useLocation } from 'react-router-dom';
import StarryConstellationsBackground from './StarryConstellationsBackground';

// Lazy-load WebGL-based backgrounds
const WireframeBackground = lazy(() => import('./WireframeBackground'));
const NebulaBackground = lazy(() => import('./NebulaBackground'));
const WarpBackground = lazy(() => import('./WarpBackground'));
const NetworkBackground = lazy(() => import('./NetworkBackground'));
const ThreeBackground = lazy(() => import('../ThreeBackground'));

const DynamicBackground = () => {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  let bgContent;

  // Route-based background mapping
  if (path.includes('/services')) {
    bgContent = <WireframeBackground />;
  } else if (path.includes('/blog')) {
    bgContent = <NebulaBackground />;
  } else if (path.includes('/resources')) {
    bgContent = <NetworkBackground />;
  } else if (path.includes('/opensource')) {
    // Standard static starry night for Open Source
    bgContent = (
      <div className="fixed inset-0 -z-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_40%),linear-gradient(180deg,rgba(2,6,23,1),rgba(15,23,42,1))]">
        <ThreeBackground />
      </div>
    );
  } else {
    // Use the beautiful animated interactive constellations for projects and the rest of the site!
    return <StarryConstellationsBackground />;
  }

  return (
    <Suspense fallback={<StarryConstellationsBackground />}>
      {bgContent}
    </Suspense>
  );
};

export default DynamicBackground;
