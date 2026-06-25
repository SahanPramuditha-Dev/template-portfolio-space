import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { useCanvasLifecycle, useIsMobileCanvas } from '../hooks/useCanvasLifecycle';

/** Fixed palette: cyan, deep blue, subtle violet — personal portfolio hub */
const PALETTE = {
  cyan: '#22d3ee',
  cyanSoft: '#38bdf8',
  deepBlue: '#0c4a6e',
  navy: '#0f172a',
  violet: '#a78bfa',
};

const OUTER_RADIUS = 1.55;
const INNER_RADIUS = 1.08;
const nodesConfig = [
  { ring: OUTER_RADIUS, offset: 0, speed: 0.2 },
  { ring: OUTER_RADIUS, offset: (Math.PI * 2) / 3, speed: 0.2 },
  { ring: OUTER_RADIUS, offset: (Math.PI * 4) / 3, speed: 0.2 },
  { ring: INNER_RADIUS, offset: Math.PI * 0.25, speed: -0.26 },
  { ring: INNER_RADIUS, offset: Math.PI * 1.35, speed: -0.26 },
];

const ThinOrbitRing = ({ radius, rotation, spin, color, paused }) => {
  const groupRef = useRef();

  useFrame((_, delta) => {
    if (paused || !groupRef.current) return;
    groupRef.current.rotation.y += delta * spin;
  });

  return (
    <group ref={groupRef} rotation={rotation}>
      <mesh>
        <torusGeometry args={[radius, 0.009, 8, 96]} />
        <meshBasicMaterial color={color} transparent opacity={0.55} toneMapped={false} />
      </mesh>
    </group>
  );
};

const PortfolioCore = ({ paused }) => {
  const coreRef = useRef();
  const nodeRefs = useRef([]);

  useFrame((state) => {
    if (paused) return;
    const t = state.clock.elapsedTime;
    const pulse = 1 + Math.sin(t * 0.9) * 0.012;

    if (coreRef.current) {
      coreRef.current.scale.setScalar(pulse);
    }

    nodesConfig.forEach((meta, i) => {
      const node = nodeRefs.current[i];
      if (!node) return;
      const angle = meta.offset + t * meta.speed;
      node.position.x = Math.cos(angle) * meta.ring;
      node.position.z = Math.sin(angle) * meta.ring;
      node.position.y = Math.sin(angle * 2) * 0.04;
    });
  });

  return (
    <group rotation={[0.18, 0.32, 0]}>
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.26, 32, 32]} />
        <meshStandardMaterial
          color={PALETTE.cyan}
          emissive={PALETTE.cyanSoft}
          emissiveIntensity={0.9}
          metalness={0.35}
          roughness={0.35}
          toneMapped={false}
        />
      </mesh>

      <mesh scale={1.22}>
        <sphereGeometry args={[0.26, 16, 16]} />
        <meshBasicMaterial
          color={PALETTE.cyanSoft}
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <ThinOrbitRing
        radius={OUTER_RADIUS}
        rotation={[0.52, 0.12, 0.1]}
        spin={0.12}
        color={PALETTE.cyanSoft}
        paused={paused}
      />
      <ThinOrbitRing
        radius={INNER_RADIUS}
        rotation={[0.38, 0.48, -0.08]}
        spin={-0.16}
        color={PALETTE.violet}
        paused={paused}
      />

      {nodesConfig.map((meta, i) => (
        <mesh
          key={i}
          ref={(el) => {
            nodeRefs.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshStandardMaterial
            color={meta.ring === OUTER_RADIUS ? PALETTE.cyan : PALETTE.violet}
            emissive={meta.ring === OUTER_RADIUS ? PALETTE.cyanSoft : PALETTE.violet}
            emissiveIntensity={0.75}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
};

const PortfolioCoreScene = ({ paused }) => (
  <>
    <ambientLight intensity={0.35} color={PALETTE.navy} />
    <directionalLight position={[4, 3, 5]} intensity={0.85} color={PALETTE.cyanSoft} />
    <directionalLight position={[-3, 1, -2]} intensity={0.35} color={PALETTE.violet} />
    <pointLight position={[0, 0, 2]} intensity={0.5} color={PALETTE.cyan} distance={6} />

    <Float speed={0.85} rotationIntensity={0.04} floatIntensity={0.2}>
      <PortfolioCore paused={paused} />
    </Float>
  </>
);

const OrbitalCore3D = ({ className = 'w-full h-full' }) => {
  const { enabled, shouldAnimate } = useCanvasLifecycle();
  const isMobile = useIsMobileCanvas();

  if (!enabled) {
    return (
      <div
        className={`${className} rounded-2xl bg-gradient-to-br from-sky-950/30 via-primary to-primary`}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className={`${className} relative overflow-hidden rounded-2xl border border-white/10`}
      aria-hidden="true"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 45%, rgb(34 211 238 / 0.1), transparent 65%), linear-gradient(165deg, ${PALETTE.navy} 0%, ${PALETTE.deepBlue} 45%, transparent 100%)`,
          opacity: 0.85,
        }}
      />

      <Canvas
        className="relative z-[1]"
        camera={{ position: [0, 0.05, 5.25], fov: 40 }}
        dpr={isMobile ? [1, 1.25] : [1, 1.5]}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: isMobile ? 'low-power' : 'high-performance',
        }}
      >
        <PortfolioCoreScene paused={!shouldAnimate} />
      </Canvas>

      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-cyan-500/10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-primary to-transparent" />
    </div>
  );
};

export default OrbitalCore3D;
