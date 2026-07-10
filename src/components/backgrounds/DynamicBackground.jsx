import React from 'react';
import { useLocation } from 'react-router-dom';
import WireframeBackground from './WireframeBackground';
import NebulaBackground from './NebulaBackground';
import WarpBackground from './WarpBackground';
import NetworkBackground from './NetworkBackground';
import ThreeBackground from '../ThreeBackground';
import StarryConstellationsBackground from './StarryConstellationsBackground';

const DynamicBackground = () => {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  // Route-based background mapping
  if (path.includes('/services')) {
    return <WireframeBackground />;
  }
  
  if (path.includes('/blog')) {
    return <NebulaBackground />;
  }
  
  if (path.includes('/testimonials')) {
    return <WarpBackground />;
  }
  
  if (path.includes('/resources')) {
    return <NetworkBackground />;
  }
  
  if (path.includes('/opensource')) {
    // Standard static starry night for Open Source
    return (
      <div className="fixed inset-0 -z-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_40%),linear-gradient(180deg,rgba(2,6,23,1),rgba(15,23,42,1))]">
        <ThreeBackground />
      </div>
    );
  }

  // Use the beautiful animated interactive constellations for projects and the rest of the site!
  return <StarryConstellationsBackground />;
};

export default DynamicBackground;
