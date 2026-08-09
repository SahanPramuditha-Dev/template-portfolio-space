import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Icosahedron, Octahedron, Torus, MeshDistortMaterial } from '@react-three/drei';
import SafeEnvironment from './SafeEnvironment';
import DisposeOnUnmount from './DisposeOnUnmount';
import { useTheme } from '../context/ThemeContext';
import { useCanvasLifecycle } from '../hooks/useCanvasLifecycle';

const FloatingShape = ({ position, color, speed, rotationIntensity, floatIntensity, Component }) => {
  const ref = useRef();
  const ShapeComponent = Component;
  
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.x = Math.sin(t * speed) * 0.2;
    ref.current.rotation.y = Math.cos(t * speed) * 0.2;
  });

  return (
    <Float speed={speed} rotationIntensity={rotationIntensity} floatIntensity={floatIntensity} position={position}>
      <ShapeComponent args={[1, 0]} ref={ref} scale={0.8}>
        <MeshDistortMaterial
            color={color}
            speed={2}
            distort={0.4}
            roughness={0.2}
            metalness={0.8}
        />
      </ShapeComponent>
    </Float>
  );
};

const About3DScene = () => {
  const { theme } = useTheme();
  const primaryColor = theme === 'dark' ? '#38bdf8' : '#0284c7';
  const secondaryColor = theme === 'dark' ? '#818cf8' : '#6366f1';
  
  return (
    <group>
      <FloatingShape 
        Component={Icosahedron} 
        position={[-1.5, 1, 0]} 
        color={primaryColor} 
        speed={2} 
        rotationIntensity={1} 
        floatIntensity={1} 
      />
      
      <FloatingShape 
        Component={Octahedron} 
        position={[1.5, -1, 0]} 
        color={secondaryColor} 
        speed={1.5} 
        rotationIntensity={1.5} 
        floatIntensity={1} 
      />
      
      <FloatingShape 
        Component={Torus} 
        position={[0, 0, 0]} 
        color={theme === 'dark' ? '#ffffff' : '#1e293b'} 
        speed={1} 
        rotationIntensity={0.5} 
        floatIntensity={0.5} 
      />
    </group>
  );
};

const About3D = () => {
  const containerRef = useRef(null);
  const { enabled, shouldAnimate } = useCanvasLifecycle(containerRef);

  if (!enabled) {
    return <div className="w-full h-full bg-gradient-to-br from-accent/20 via-secondary to-primary" />;
  }

  return (
    <div ref={containerRef} className="w-full h-[400px] cursor-pointer">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: 'low-power' }}
        frameloop={shouldAnimate ? 'always' : 'never'}
      >
        <ambientLight intensity={0.5} />
        <DisposeOnUnmount />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <About3DScene />
        <SafeEnvironment background={false} blur={0} />
      </Canvas>
    </div>
  );
};

export default About3D;
