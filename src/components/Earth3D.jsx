import React, { useMemo, useRef, Suspense, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useCanvasLifecycle, useIsMobileCanvas } from '../hooks/useCanvasLifecycle';
import PerformanceMonitor from './PerformanceMonitor';

// High-quality Earth model loaded from GLB
const EarthModel = ({ paused }) => {
  const { scene } = useGLTF('/models/earth/earth.glb');
  const earthRef = useRef();

  // Compute the optimal scale to fit the sphere to a target diameter of 3.0 units
  const scale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    
    // We want the sphere to have a diameter of ~2.2 in the scene to fit the container without clipping
    const targetDiameter = 2.2; 
    const computedScale = maxDim > 0 ? targetDiameter / maxDim : 0.011;
    return computedScale;
  }, [scene]);

  // Clone the scene so we don't mutate the cached version
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          // Adjust physical properties for visual depth
          child.material.roughness = 0.45;
          child.material.metalness = 0.15;
        }
      }
    });
    return clone;
  }, [scene]);

  useFrame((state, delta) => {
    if (!paused && earthRef.current) {
      // Gentle self-rotation of the Earth
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

const EarthScene = ({ paused }) => {
  return (
    <group>
      {/* Floating wrapper for the Earth */}
      <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.25}>
        <Suspense fallback={null}>
          <EarthModel paused={paused} />
        </Suspense>
      </Float>
    </group>
  );
};

const Earth3D = ({ className = '' }) => {
  const containerRef = useRef(null);
  const { enabled, shouldAnimate } = useCanvasLifecycle(containerRef);
  const isMobile = useIsMobileCanvas();
  
  // Performance Throttling
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
        gl={{ antialias: antialias, alpha: true, powerPreference: 'low-power' }}
        frameloop={shouldAnimate ? "always" : "never"}
      >
        <PerformanceMonitor onLowPerformance={handleLowPerformance} />
        <ambientLight intensity={0.45} />
        <hemisphereLight args={['#e2f1ff', '#0b1329', 1.0]} />
        <directionalLight position={[4, 3.5, 4]} intensity={2.0} />
        <directionalLight position={[-4, -1, -3]} intensity={0.4} color="#1d4ed8" />
        
        <EarthScene paused={!shouldAnimate} />

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate={shouldAnimate}
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 3.4}
          maxPolarAngle={Math.PI / 1.7}
        />
      </Canvas>
    </div>
  );
};

// Preload the GLB model to avoid pop-in
useGLTF.preload('/models/earth/earth.glb');

export default Earth3D;
