import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles, useGLTF } from '@react-three/drei';
import SafeEnvironment from './SafeEnvironment';
import * as THREE from 'three';

/**
 * International Space Station 3D Model
 * Uses an external GLTF/GLB asset for visual accuracy.
 *
 * Your repo currently contains:
 *   `public/models/iss/ISS_stationary.glb`
 *
 * If you rename/move the model, update `DEFAULT_MODEL_PATH` or pass `modelPath`.
 */

const DEFAULT_MODEL_PATH = '/models/iss/ISS_stationary.glb';

const ISSModel = ({ modelPath }) => {
  const group = useRef();
  const { scene } = useGLTF(modelPath);

  const clonedScene = React.useMemo(() => {
    if (!scene) return null;
    const clone = scene.clone();
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.roughness ??= 0.6;
          child.material.metalness ??= 0.2;
        }
      }
    });
    return clone;
  }, [scene]);

  useFrame((state) => {
    if (group.current) {
      // Gentle orbital motion + slow roll so it feels alive
      const t = state.clock.getElapsedTime();
      group.current.rotation.y = -0.4 + Math.sin(t * 0.08) * 0.1;
      group.current.rotation.z = Math.sin(t * 0.04) * 0.05;
      group.current.position.y = Math.sin(t * 0.5) * 0.1;
    }
  });

  return (
    <group ref={group} scale={0.025} rotation={[0.1, -0.8, 0]}>
      {clonedScene && <primitive object={clonedScene} />}
    </group>
  );
};

// Main ISS3D Component (local model only)
const ISS3D = ({ modelPath = DEFAULT_MODEL_PATH, highlightCategory }) => {

  return (
    <group>
      <SafeEnvironment background={false} blur={0} />
      <Float rotationIntensity={0.1} floatIntensity={0.1} speed={0.4}>
        <ISSModel modelPath={modelPath} />
      </Float>



      {/* Orbital sparkles/debris */}
      <Sparkles
        count={60}
        scale={12}
        size={2}
        speed={0.35}
        opacity={0.45}
        color={
          highlightCategory === 'Languages'
            ? '#f97316'
            : highlightCategory === 'Frameworks'
            ? '#22c55e'
            : highlightCategory === 'Tools & Backend'
            ? '#38bdf8'
            : '#60a5fa'
        }
      />
    </group>
  );
};

// Preload helper (optional, if you want to preload the model somewhere central)
useGLTF.preload(DEFAULT_MODEL_PATH);

export default ISS3D;
