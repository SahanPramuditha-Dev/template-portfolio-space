import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Float, Icosahedron } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';
import { useTheme } from '../context/ThemeContext';
import { useAccessibility } from '../context/AccessibilityContext';
import PerformanceMonitor from './PerformanceMonitor';
import { shouldDisableHeavyVisuals } from '../utils/runtimeGuards';
import { useIsMobileCanvas } from '../hooks/useCanvasLifecycle';

/* ─── Floating wireframe shapes ─────────────────────────────────────────── */
const FloatingShapes = () => {
  const { theme } = useTheme();
  const color = theme === 'dark' ? '#38bdf8' : '#0284c7';

  const shapes = useMemo(() => {
    const seed = (i, offset = 0) => {
      const x = Math.sin(i * 12.9898 + offset * 78.233) * 43758.5453;
      return x - Math.floor(x);
    };
    return Array.from({ length: 8 }, (_, i) => ({
      position: [
        (seed(i, 1) - 0.5) * 12,
        (seed(i, 2) - 0.5) * 12,
        (seed(i, 3) - 0.5) * 2,
      ],
      scale:  seed(i, 4) * 0.035 + 0.015,
      // Slower, calmer float speeds for smoothness
      speed:  seed(i, 5) * 0.8 + 0.4,
    }));
  }, []);

  return (
    <group>
      {shapes.map((shape, i) => (
        <Float
          key={i}
          speed={shape.speed}
          rotationIntensity={0.6}   // was 2 — much calmer
          floatIntensity={0.8}      // was 2 — subtle drift
          position={shape.position}
        >
          <Icosahedron args={[1, 0]} scale={shape.scale}>
            <meshBasicMaterial color={color} transparent opacity={0.18} wireframe />
          </Icosahedron>
        </Float>
      ))}
    </group>
  );
};

/* ─── Star field ─────────────────────────────────────────────────────────── */
const Stars = ({ isMobile }) => {
  const pointsRef   = useRef();
  const { theme }   = useTheme();
  const { mouse }   = useThree();

  const targetRotX  = useRef(0);
  const targetRotY  = useRef(0);
  const lastScrollY = useRef(typeof window !== 'undefined' ? window.scrollY : 0);
  const scrollVelX  = useRef(0);
  const idleWeight  = useRef(1);

  // Generate stars uniformly across a wide 3D volume covering 100% of viewport
  const [positions] = useState(() => {
    const count = isMobile ? 1500 : 3500;
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      array[i * 3]     = (Math.random() - 0.5) * 7.0; // Wide X coverage [-3.5, 3.5]
      array[i * 3 + 1] = (Math.random() - 0.5) * 5.0; // High Y coverage [-2.5, 2.5]
      array[i * 3 + 2] = (Math.random() - 0.5) * 2.0 - 0.5; // Z depth [-2.5, -0.5]
    }
    return array;
  });

  useFrame((_, delta) => {
    if (!pointsRef.current) return;

    // 1. Real-time scroll delta calculation
    const currentScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    const rawScrollDelta = currentScrollY - lastScrollY.current;
    lastScrollY.current  = currentScrollY;

    // 2. Interpolate scroll velocity along X axis (scroll down -> stars move left to right)
    const targetScrollVel = rawScrollDelta * 0.0018;
    scrollVelX.current   += (targetScrollVel - scrollVelX.current) * 0.15;

    // 3. Smoothly fade out idle drift during active scrolling to prevent directional conflict
    const isScrolling      = Math.abs(rawScrollDelta) > 0.5 || Math.abs(scrollVelX.current) > 0.0001;
    const targetIdleWeight = isScrolling ? 0 : 1;
    idleWeight.current    += (targetIdleWeight - idleWeight.current) * 0.08;

    // 4. Calculate net linear X drift (idle right-to-left = -X)
    const idleVelX = -(delta * 0.12) * idleWeight.current;

    // Apply linear translation to group position
    pointsRef.current.position.x += idleVelX + scrollVelX.current;

    // Seamless infinite wrap bounds
    if (pointsRef.current.position.x > 3.0) {
      pointsRef.current.position.x -= 6.0;
    } else if (pointsRef.current.position.x < -3.0) {
      pointsRef.current.position.x += 6.0;
    }

    // 5. Mouse parallax (subtle lerp)
    targetRotX.current += (mouse.y * 0.08 - targetRotX.current) * 0.04;
    targetRotY.current += (mouse.x * 0.08 - targetRotY.current) * 0.04;

    pointsRef.current.rotation.x = targetRotX.current;
    pointsRef.current.rotation.y = targetRotY.current;
  });

  return (
    <group>
      <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color={theme === 'dark' ? '#38bdf8' : '#0284c7'}
          size={0.0035}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={theme === 'dark' ? 0.85 : 0.6}
        />
      </Points>
    </group>
  );
};

/* ─── Canvas wrapper ─────────────────────────────────────────────────────── */
const ThreeBackground = () => {
  const [enabled, setEnabled]           = useState(() => !shouldDisableHeavyVisuals());
  const { reduceMotion }                = useAccessibility();
  const [heavyEffects, setHeavyEffects] = useState(true);
  const isMobile                        = useIsMobileCanvas();

  // Lower DPR cap on mobile — 1.0 is plenty for a background
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

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 1] }}
        dpr={dpr}
        gl={{
          antialias: !isMobile,               // skip on mobile
          powerPreference: isMobile ? 'low-power' : 'high-performance',
          alpha: true,
          stencil: false,
          depth: false,
        }}
        frameloop={reduceMotion ? 'never' : 'always'}
      >
        <PerformanceMonitor onLowPerformance={handleLowPerformance} />
        <Stars isMobile={isMobile} />
        {/* Skip floating 3D shapes on mobile — saves ~30% GPU time */}
        {heavyEffects && !isMobile && <FloatingShapes />}
      </Canvas>
    </div>
  );
};

export default ThreeBackground;
