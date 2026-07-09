import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';
import { useTheme } from '../../context/ThemeContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import PerformanceMonitor from '../PerformanceMonitor';
import { shouldDisableHeavyVisuals } from '../../utils/runtimeGuards';
import { useIsMobileCanvas } from '../../hooks/useCanvasLifecycle';

const WarpStars = ({ isMobile }) => {
  const ref = useRef();
  const { theme } = useTheme();

  // Create points in a long box/cylinder shape along the Z axis
  const [positions] = useState(() => {
    const count = isMobile ? 1000 : 2500;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // X and Y spread out, Z from -50 (far) to 10 (behind camera)
      pos[i * 3] = (Math.random() - 0.5) * 40;     // X
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40; // Y
      pos[i * 3 + 2] = (Math.random() - 1.0) * 60; // Z
    }
    return pos;
  });

  useFrame((_, delta) => {
    if (!ref.current) return;
    const positions = ref.current.geometry.attributes.position.array;
    
    // Move all stars forward on the Z axis
    for (let i = 0; i < positions.length / 3; i++) {
      // z index is i * 3 + 2
      positions[i * 3 + 2] += delta * 20; // Speed of warp

      // If a star passes behind the camera (z > 5), reset it far away
      if (positions[i * 3 + 2] > 5) {
        positions[i * 3 + 2] = -50 - (Math.random() * 10);
        positions[i * 3] = (Math.random() - 0.5) * 40;     // randomize X
        positions[i * 3 + 1] = (Math.random() - 0.5) * 40; // randomize Y
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color={theme === 'dark' ? '#38bdf8' : '#0284c7'}
          size={0.06}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={theme === 'dark' ? 0.9 : 0.6}
        />
      </Points>
    </group>
  );
};

const WarpBackground = () => {
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

  if (!enabled || reduceMotion) return (
    <div className="fixed inset-0 -z-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_40%),linear-gradient(180deg,rgba(2,6,23,1),rgba(15,23,42,1))] pointer-events-none" />
  );

  return (
    <div className="fixed inset-0 -z-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_40%),linear-gradient(180deg,rgba(2,6,23,1),rgba(15,23,42,1))]">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
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
        <WarpStars isMobile={isMobile} />
      </Canvas>
    </div>
  );
};

export default WarpBackground;
