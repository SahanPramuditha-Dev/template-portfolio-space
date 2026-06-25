import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Float, Icosahedron } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';
import { useTheme } from '../context/ThemeContext';
import { useAccessibility } from '../context/AccessibilityContext';
import PerformanceMonitor from './PerformanceMonitor';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { shouldDisableHeavyVisuals } from '../utils/runtimeGuards';

gsap.registerPlugin(ScrollTrigger);

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
const Stars = () => {
  const ref     = useRef();
  const { theme } = useTheme();
  const { mouse } = useThree();

  // Smooth lerp targets — avoid per-frame jumps
  const targetRotX = useRef(0);
  const targetRotY = useRef(0);

  const [sphere] = useState(() =>
    random.inSphere(new Float32Array(4000 * 3), { radius: 1.5 })
  );

  useFrame((_, delta) => {
    if (!ref.current) return;

    // Base rotation — constant, smooth
    ref.current.rotation.x -= delta / 14;
    ref.current.rotation.y -= delta / 20;

    // Lerp toward mouse position (factor 0.03 = very smooth, no snapping)
    targetRotX.current += (mouse.y * 0.12 - targetRotX.current) * 0.03;
    targetRotY.current += (mouse.x * 0.12 - targetRotY.current) * 0.03;

    ref.current.rotation.x += targetRotX.current * delta * 0.5;
    ref.current.rotation.y += targetRotY.current * delta * 0.5;
  });

  useEffect(() => {
    if (!ref.current) return undefined;
    const tween = gsap.to(ref.current.rotation, {
      y: Math.PI * 2,
      scrollTrigger: {
        trigger: 'body',
        start:   'top top',
        end:     'bottom bottom',
        scrub:   3,          // was 1 — higher = smoother, less laggy feeling
      },
      ease: 'none',
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color={theme === 'dark' ? '#38bdf8' : '#0284c7'}
          size={0.003}              // slightly larger — visible on all screens
          sizeAttenuation={true}
          depthWrite={false}
          opacity={theme === 'dark' ? 0.9 : 0.6}
        />
      </Points>
    </group>
  );
};

/* ─── Canvas wrapper ─────────────────────────────────────────────────────── */
const ThreeBackground = () => {
  const [enabled, setEnabled]         = useState(() => !shouldDisableHeavyVisuals());
  const { reduceMotion }              = useAccessibility();
  const [heavyEffects, setHeavyEffects] = useState(true);

  // Fixed DPR — no mid-render resizes
  const dpr = useMemo(() => {
    if (typeof window === 'undefined') return 1;
    return Math.min(window.devicePixelRatio, 1.5);
  }, []);

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
        dpr={dpr}                             // fixed — no resize jank
        gl={{
          antialias: true,                    // smooth edges on shapes
          powerPreference: 'high-performance',// full GPU power for 60 fps
          alpha: true,
          stencil: false,                     // disable unused buffer = faster
          depth: false,                       // disable depth buffer = faster for 2D bg
        }}
        frameloop={reduceMotion ? 'never' : 'always'}
      >
        <PerformanceMonitor onLowPerformance={handleLowPerformance} />
        <Stars />
        {heavyEffects && <FloatingShapes />}
      </Canvas>
    </div>
  );
};

export default ThreeBackground;
