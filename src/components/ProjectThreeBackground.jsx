import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Torus, Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';
import { useCanvasLifecycle } from '../hooks/useCanvasLifecycle';

const OrbitBackground = () => {
  const groupRef = useRef();
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.12;
      groupRef.current.rotation.x += delta * 0.05;
    }
  });
  return (
    <group ref={groupRef}>
      {/* Central Planet */}
      <mesh>
        <sphereGeometry args={[1.1, 16, 16]} />
        <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.12} />
      </mesh>
      {/* Orbiting Satellite */}
      <group rotation={[Math.PI / 4, 0, 0]}>
        <mesh position={[2.2, 0, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color="#0ea5e9" transparent opacity={0.6} />
        </mesh>
      </group>
    </group>
  );
};

const WireframeGlobe = () => {
  const globeRef = useRef();
  useFrame((_, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.08;
      globeRef.current.rotation.x += delta * 0.03;
    }
  });
  return (
    <group ref={globeRef}>
      <mesh>
        <sphereGeometry args={[1.7, 24, 24]} />
        <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.15} />
      </mesh>
      <mesh scale={1.03}>
        <sphereGeometry args={[1.7, 12, 12]} />
        <meshBasicMaterial color="#0284c7" wireframe transparent opacity={0.08} />
      </mesh>
    </group>
  );
};

const HologramShape = () => {
  const shapeRef = useRef();
  useFrame((_, delta) => {
    if (shapeRef.current) {
      shapeRef.current.rotation.y += delta * 0.15;
      shapeRef.current.rotation.x += delta * 0.1;
    }
  });
  return (
    <group ref={shapeRef}>
      <Float speed={1.5} rotationIntensity={0.8} floatIntensity={0.8}>
        <Torus args={[1.1, 0.35, 8, 24]}>
          <meshBasicMaterial color="#ec4899" wireframe transparent opacity={0.2} />
        </Torus>
      </Float>
    </group>
  );
};

const ParticleField = () => {
  const ref = useRef();
  const [sphere] = React.useState(() =>
    random.inSphere(new Float32Array(1500 * 3), { radius: 2.2 })
  );
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 12;
      ref.current.rotation.y -= delta / 20;
    }
  });
  return (
    <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#38bdf8"
        size={0.005}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.8}
      />
    </Points>
  );
};

const ConstellationBackground = () => {
  const ref = useRef();
  const [points] = React.useState(() =>
    random.inSphere(new Float32Array(80 * 3), { radius: 2.6 })
  );
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.04;
    }
  });

  const lines = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 80; i++) {
      for (let j = i + 1; j < 80; j++) {
        const dx = points[i * 3] - points[j * 3];
        const dy = points[i * 3 + 1] - points[j * 3 + 1];
        const dz = points[i * 3 + 2] - points[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 1.0) {
          arr.push([
            points[i * 3], points[i * 3 + 1], points[i * 3 + 2],
            points[j * 3], points[j * 3 + 1], points[j * 3 + 2]
          ]);
        }
      }
    }
    return arr.slice(0, 100);
  }, [points]);

  return (
    <group ref={ref}>
      <Points positions={points} stride={3}>
        <PointMaterial color="#a855f7" size={0.02} transparent opacity={0.6} />
      </Points>
      {lines.map((line, idx) => (
        <line key={idx}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(line), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#a855f7" transparent opacity={0.15} />
        </line>
      ))}
    </group>
  );
};

const ProjectThreeBackground = ({ effectMode = 'wireframeGlobe' }) => {
  const containerRef = useRef(null);
  const { enabled, shouldAnimate } = useCanvasLifecycle(containerRef);

  const normalizedMode = ['wireframeGlobe', 'particleField', 'constellation', 'hologram', 'orbit'].includes(effectMode)
    ? effectMode
    : 'wireframeGlobe';

  if (!enabled) return null;

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none overflow-hidden h-full w-full bg-transparent">
      <Canvas
        camera={{ position: [0, 0, 4.0], fov: 60 }}
        gl={{ antialias: false, alpha: true, depth: false, stencil: false }}
        frameloop={shouldAnimate ? 'always' : 'never'}
      >
        {normalizedMode === 'wireframeGlobe' && <WireframeGlobe />}
        {normalizedMode === 'particleField' && <ParticleField />}
        {normalizedMode === 'constellation' && <ConstellationBackground />}
        {normalizedMode === 'hologram' && <HologramShape />}
        {normalizedMode === 'orbit' && <OrbitBackground />}
      </Canvas>
    </div>
  );
};

export default ProjectThreeBackground;
