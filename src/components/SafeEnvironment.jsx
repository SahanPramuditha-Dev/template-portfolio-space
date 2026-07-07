import React, { Suspense } from 'react';
import { Environment } from '@react-three/drei';

// SafeEnvironment tries to load an HDRI from VITE_HDRI_URL (prefer local copy).
// If not provided, it renders a lightweight hemisphere + directional lights
// and sets a simple background color so the scene still looks good without
// fetching remote assets that may be rate-limited (429).
const SafeEnvironment = ({ background = false, blur = 0 }) => {
  const hdrUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_HDRI_URL) || null;

  if (hdrUrl) {
    return (
      <Suspense fallback={null}>
        <Environment files={hdrUrl} background={background} blur={blur} />
      </Suspense>
    );
  }

  // Fallback: gentle ambient lighting and a simple background color
  return (
    <>
      {background && <color attach="background" args={["#020617"]} />}
      <hemisphereLight intensity={0.6} skyColor="#bfe9ff" groundColor="#202036" />
      <directionalLight position={[10, 10, 5]} intensity={0.7} />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} />
    </>
  );
};

export default SafeEnvironment;
