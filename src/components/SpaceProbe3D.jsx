import React, { useMemo, useRef, Suspense, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useCanvasLifecycle, useIsMobileCanvas } from '../hooks/useCanvasLifecycle';
import { useAchievements } from '../context/AchievementsContext';
import PerformanceMonitor from './PerformanceMonitor';
import DisposeOnUnmount from './DisposeOnUnmount';

// Space Shuttle Model loaded from GLB
const SpaceShuttleModel = ({ paused }) => {
  const { scene } = useGLTF('/models/space-shuttle-atlantis/source/0.glb');
  const shuttleRef = useRef();

  // Compute the optimal scale and center to fit the model to a target size of 2.6 units
  const { scale, center } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const centerVec = new THREE.Vector3();
    box.getCenter(centerVec);
    const maxDim = Math.max(size.x, size.y, size.z);
    
    // Set target bounding box size in the Three.js viewport
    const targetSize = 3.2; 
    const computedScale = maxDim > 0 ? targetSize / maxDim : 0.05;
    
    // We multiply center by -1 because we want to translate the model's group back to origin
    return { scale: computedScale, center: centerVec.multiplyScalar(-1) };
  }, [scene]);

  // Clone the scene so we don't mutate the cached version
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          // Force materials to be opaque to resolve sorting and alpha-channel see-through issues
          child.material.transparent = false;
          child.material.depthWrite = true;
          
          // Adjust physical properties for realistic satin space shuttle tiles (subtle highlights)
          child.material.roughness = 0.45;
          child.material.metalness = 0.15;
        }
      }
    });
    return clone;
  }, [scene]);

  useFrame((state) => {
    if (!paused && shuttleRef.current) {
      // Gentle rocking animation to simulate drifting in space
      shuttleRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.08;
      shuttleRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <group ref={shuttleRef} scale={scale}>
      <primitive 
        object={clonedScene} 
        position={[center.x, center.y, center.z]} 
      />
    </group>
  );
};

const SpaceShuttleScene = ({ paused }) => {
  return (
    <group>
      {/* Gentle floating animation */}
      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.3}>
        <Suspense fallback={null}>
          <SpaceShuttleModel paused={paused} />
        </Suspense>
      </Float>
    </group>
  );
};

const SpaceProbe3D = ({ className = 'w-full h-full min-h-[400px]' }) => {
  const containerRef = useRef(null);
  const { enabled, shouldAnimate } = useCanvasLifecycle(containerRef);
  const isMobile = useIsMobileCanvas();
  const { unlockAchievement } = useAchievements();
  
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
        className={`${className} rounded-2xl bg-gradient-to-br from-accent/15 via-secondary to-primary`}
        aria-hidden="true"
      />
    );
  }

  return (
    <div ref={containerRef} className={className} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0.5, 4.8], fov: 40 }}
        dpr={dpr}
        gl={{ antialias: antialias, powerPreference: 'low-power', alpha: true }}
        frameloop={shouldAnimate ? "always" : "never"}
      >
        <DisposeOnUnmount />
        <PerformanceMonitor onLowPerformance={handleLowPerformance} />
        <ambientLight intensity={0.4} />
        <hemisphereLight args={['#ffffff', '#0b1329', 0.8]} />
        <directionalLight position={[5, 5, 5]} intensity={1.8} />
        <directionalLight position={[-5, -2, -3]} intensity={0.4} color="#0284c7" />
        
        <SpaceShuttleScene paused={!shouldAnimate} />
        
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate={shouldAnimate}
          autoRotateSpeed={0.6}
          onStart={() => unlockAchievement('space-pilot')}
        />
      </Canvas>
    </div>
  );
};

// Preload to prevent lag on load
useGLTF.preload('/models/space-shuttle-atlantis/source/0.glb');

export default SpaceProbe3D;
