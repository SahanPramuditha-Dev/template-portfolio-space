import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Edges, Float } from '@react-three/drei';
import DisposeOnUnmount from './DisposeOnUnmount';
import { useTheme } from '../context/ThemeContext';
import { useCanvasLifecycle, useIsMobileCanvas } from '../hooks/useCanvasLifecycle';

const PortfolioCubeScene = ({ paused }) => {
  const { theme } = useTheme();
  const cubeRef = useRef();

  const colors = useMemo(() => {
    const accent = theme === 'dark' ? '#38bdf8' : '#0284c7';
    const panel = theme === 'dark' ? '#1e293b' : '#f1f5f9';
    const gold = theme === 'dark' ? '#fbbf24' : '#d97706';
    return { accent, panel, gold };
  }, [theme]);

  useFrame((state, delta) => {
    if (paused) return;
    if (!cubeRef.current) return;
    cubeRef.current.rotation.y += delta * 0.32;
    cubeRef.current.rotation.x = 0.28 + Math.sin(state.clock.elapsedTime * 0.5) * 0.06;
  });

  return (
    <Float speed={1.05} rotationIntensity={0.12} floatIntensity={0.25}>
      <mesh ref={cubeRef}>
        <boxGeometry args={[1.35, 1.35, 1.35]} />
        <meshStandardMaterial color={colors.panel} metalness={0.55} roughness={0.38} />
        <Edges threshold={15} color={colors.accent} linewidth={1} />
      </mesh>
      <mesh position={[0, 0, 0.69]}>
        <planeGeometry args={[0.55, 0.55]} />
        <meshBasicMaterial color={colors.gold} transparent opacity={0.35} />
      </mesh>
    </Float>
  );
};

const PortfolioCube3D = ({ className = 'h-44 w-full' }) => {
  const { enabled, shouldAnimate } = useCanvasLifecycle();
  const isMobile = useIsMobileCanvas();

  if (!enabled) {
    return (
      <div
        className={`${className} rounded-2xl bg-gradient-to-br from-accent/10 via-secondary/25 to-primary/30`}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className={className} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 3.8], fov: 45 }}
        dpr={isMobile ? [1, 1] : [1, 1.35]}
        gl={{ antialias: false, powerPreference: 'low-power', alpha: true }}
      >
        <DisposeOnUnmount />
        <ambientLight intensity={0.55} />
        <directionalLight position={[2, 3, 4]} intensity={0.95} />
        <PortfolioCubeScene paused={!shouldAnimate} />
      </Canvas>
    </div>
  );
};

export default PortfolioCube3D;
