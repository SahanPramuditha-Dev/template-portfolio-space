import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, Icosahedron } from '@react-three/drei';
import { useTheme } from '../../context/ThemeContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import PerformanceMonitor from '../PerformanceMonitor';
import { shouldDisableHeavyVisuals } from '../../utils/runtimeGuards';
import { useIsMobileCanvas } from '../../hooks/useCanvasLifecycle';

const FloatingShapes = ({ isMobile }) => {
  const { theme } = useTheme();
  const color = theme === 'dark' ? '#38bdf8' : '#0284c7';
  
  // More shapes than ThreeBackground, spread over a larger area
  const shapes = useMemo(() => {
    const seed = (i, offset = 0) => {
      const x = Math.sin(i * 12.9898 + offset * 78.233) * 43758.5453;
      return x - Math.floor(x);
    };
    const count = isMobile ? 6 : 15;
    return Array.from({ length: count }, (_, i) => ({
      position: [
        (seed(i, 1) - 0.5) * 20, // Wider X
        (seed(i, 2) - 0.5) * 20, // Wider Y
        (seed(i, 3) - 0.5) * 10 - 5, // Deeper Z
      ],
      scale: seed(i, 4) * 0.15 + 0.05, // Larger scales
      speed: seed(i, 5) * 0.5 + 0.2, // Slow, peaceful float
      rotationIntensity: seed(i, 6) * 1.5 + 0.5,
    }));
  }, [isMobile]);

  return (
    <group>
      {shapes.map((shape, i) => (
        <Float
          key={i}
          speed={shape.speed}
          rotationIntensity={shape.rotationIntensity}
          floatIntensity={1.5}
          position={shape.position}
        >
          <Icosahedron args={[1, 0]} scale={shape.scale}>
            <meshBasicMaterial color={color} transparent opacity={0.25} wireframe />
          </Icosahedron>
        </Float>
      ))}
    </group>
  );
};

const WireframeBackground = () => {
  const [enabled, setEnabled] = useState(() => !shouldDisableHeavyVisuals());
  const { reduceMotion } = useAccessibility();
  const [heavyEffects, setHeavyEffects] = useState(true);
  const isMobile = useIsMobileCanvas();

  const dpr = useMemo(() => {
    if (typeof window === 'undefined') return 1;
    return isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.5);
  }, [isMobile]);

  const handleLowPerformance = useCallback(() => {
    setHeavyEffects(false);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setEnabled(!shouldDisableHeavyVisuals());

    const frame = requestAnimationFrame(update);
    reduceMotionQuery.addEventListener('change', update);
    window.addEventListener('visual-mode-change', update);
    return () => {
      cancelAnimationFrame(frame);
      reduceMotionQuery.removeEventListener('change', update);
      window.removeEventListener('visual-mode-change', update);
    };
  }, []);

  if (!enabled || reduceMotion || !heavyEffects) return (
    <div className="fixed inset-0 -z-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_40%),linear-gradient(180deg,rgba(2,6,23,1),rgba(15,23,42,1))] pointer-events-none" />
  );

  return (
    <div className="fixed inset-0 -z-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_40%),linear-gradient(180deg,rgba(2,6,23,1),rgba(15,23,42,1))]">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        dpr={dpr}
        gl={{
          antialias: !isMobile,
          powerPreference: isMobile ? 'low-power' : 'high-performance',
          alpha: true,
          stencil: false,
          depth: false,
        }}
        frameloop={reduceMotion ? 'never' : 'always'}
      >
        <PerformanceMonitor onLowPerformance={handleLowPerformance} />
        <FloatingShapes isMobile={isMobile} />
      </Canvas>
    </div>
  );
};

export default WireframeBackground;
