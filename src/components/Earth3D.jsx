import React, { useMemo, useRef, Suspense, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useCanvasLifecycle, useIsMobileCanvas } from '../hooks/useCanvasLifecycle';
import PerformanceMonitor from './PerformanceMonitor';
import DisposeOnUnmount from './DisposeOnUnmount';

const EarthModel = ({ paused, isMobile }) => {
  const { scene } = useGLTF('/models/earth/earth.glb');
  const earthRef = useRef();

  const scale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetDiameter = 2.2;
    const computedScale = maxDim > 0 ? targetDiameter / maxDim : 0.011;
    return computedScale;
  }, [scene]);

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if (child.isMesh) {
        // Skip shadow maps on mobile — saves significant GPU fill rate
        child.castShadow = !isMobile;
        child.receiveShadow = !isMobile;
        if (child.material) {
          child.material.roughness = 0.45;
          child.material.metalness = 0.15;
        }
      }
    });
    return clone;
  }, [scene, isMobile]);

  useFrame((state, delta) => {
    if (!paused && earthRef.current) {
      earthRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <primitive
      ref={earthRef}
      object={clonedScene}
      scale={scale}
      position={[0, 0, 0]}
    />
  );
};

const EarthScene = ({ paused, isMobile }) => {
  return (
    <group>
      {/* Float animation: gentler on mobile to save CPU */}
      <Float
        speed={isMobile ? 0.6 : 1.1}
        rotationIntensity={isMobile ? 0.05 : 0.12}
        floatIntensity={isMobile ? 0.1 : 0.25}
      >
        <Suspense fallback={null}>
          <EarthModel paused={paused} isMobile={isMobile} />
        </Suspense>
      </Float>
    </group>
  );
};

const Earth3D = ({ className = '' }) => {
  const containerRef = useRef(null);
  const { enabled, shouldAnimate } = useCanvasLifecycle(containerRef);
  const isMobile = useIsMobileCanvas();

  // Performance Throttling — start already low on mobile
  const [dpr, setDpr] = useState(() => (isMobile ? 1.0 : [1, 1.35]));
  const [antialias, setAntialias] = useState(() => !isMobile);

  const handleLowPerformance = useCallback(() => {
    setDpr(1.0);
    setAntialias(false);
  }, []);

  if (!enabled) {
    return (
      <div
        className={`relative h-full w-full overflow-hidden rounded-2xl border border-accent/15 bg-[radial-gradient(ellipse_at_center,rgb(var(--color-accent-rgb)/0.12),transparent_64%)] ${className}`}
        aria-label="Decorative Earth model placeholder"
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden bg-transparent ${className}`}
      aria-label="Interactive 3D Earth"
    >
      <Canvas
        camera={{ position: [0, 0.15, 5.0], fov: 38 }}
        dpr={dpr}
        gl={{ antialias, alpha: true, powerPreference: 'low-power', precision: isMobile ? 'mediump' : 'highp' }}
        frameloop={shouldAnimate ? 'always' : 'never'}
        performance={{ min: 0.5 }}
      >
        <PerformanceMonitor onLowPerformance={handleLowPerformance} />
        <ambientLight intensity={isMobile ? 0.7 : 0.45} />
        <hemisphereLight args={['#e2f1ff', '#0b1329', isMobile ? 0.8 : 1.0]} />
        <directionalLight position={[4, 3.5, 4]} intensity={isMobile ? 1.4 : 2.0} />
        {/* Second fill light skipped on mobile — saves a draw call */}
        {!isMobile && <directionalLight position={[-4, -1, -3]} intensity={0.4} color="#1d4ed8" />}

        <EarthScene paused={!shouldAnimate} isMobile={isMobile} />

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate={shouldAnimate}
          autoRotateSpeed={isMobile ? 0.3 : 0.5}
          minPolarAngle={Math.PI / 3.4}
          maxPolarAngle={Math.PI / 1.7}
        />
        <DisposeOnUnmount />
      </Canvas>
    </div>
  );
};

// Preload the GLB model to avoid pop-in
useGLTF.preload('/models/earth/earth.glb');

export default Earth3D;
