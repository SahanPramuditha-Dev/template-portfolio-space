import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import DisposeOnUnmount from './DisposeOnUnmount';
import { useCanvasLifecycle } from '../hooks/useCanvasLifecycle';
import * as THREE from 'three';
import { WORLD_MAP_PATHS } from './WorldMapPaths';

// Latitudes and Longitudes of visitor countries
const COUNTRY_COORDS = {
  lk: { name: 'Sri Lanka', lat: 7.8731, lon: 80.7718 },
  us: { name: 'United States', lat: 37.0902, lon: -95.7129 },
  in: { name: 'India', lat: 20.5937, lon: 78.9629 },
  gb: { name: 'United Kingdom', lat: 55.3781, lon: -3.4360 },
  de: { name: 'Germany', lat: 51.1657, lon: 10.4515 },
  ca: { name: 'Canada', lat: 56.1304, lon: -106.3468 },
  au: { name: 'Australia', lat: -25.2744, lon: 133.7751 },
  br: { name: 'Brazil', lat: -14.2350, lon: -51.9253 }
};

// Spherical coordinates calculation helper
const getSphericalCoords = (lat, lon, radius = 2) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.cos(theta)
  );
};

// Custom Fresnel Shader for soft atmospheric outer glow
const FresnelShader = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      float intensity = pow(0.65 - dot(normal, viewDir), 2.5);
      gl_FragColor = vec4(0.06, 0.71, 0.83, 1.0) * intensity;
    }
  `
};

// Earth Shader blending day/night textures based on light vector
const EarthShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;
    uniform vec3 lightDirection;
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vec3 normal = normalize(vNormal);
      float intensity = dot(normal, lightDirection);
      
      vec4 dayColor = texture2D(dayTexture, vUv);
      vec4 nightColor = texture2D(nightTexture, vUv);
      
      // Smooth transitions between day and night side
      float mixAmount = smoothstep(-0.15, 0.15, intensity);
      gl_FragColor = mix(nightColor, dayColor, mixAmount);
    }
  `
};

let cachedEarthTextures = null;

const createEarthTextures = () => {
  if (typeof document === 'undefined') return { day: null, night: null };
  if (cachedEarthTextures) return cachedEarthTextures;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Day Side: Dark cyberpunk navy oceans
  ctx.fillStyle = '#060b13';
  ctx.fillRect(0, 0, 1024, 512);

  // Day Side: Deep slate landmasses with cyan borders
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#08b6d4';
  ctx.lineWidth = 1;

  WORLD_MAP_PATHS.forEach(country => {
    try {
      const path = new Path2D(country.d);
      ctx.save();
      ctx.translate(-30.767, -241.591);
      ctx.scale(1024 / 784.077, 512 / 458.627);
      ctx.fill(path);
      ctx.stroke(path);
      ctx.restore();
    } catch (e) { /* ignore */ }
  });

  // Night Side Canvas
  const nightCanvas = document.createElement('canvas');
  nightCanvas.width = 1024;
  nightCanvas.height = 512;
  const nCtx = nightCanvas.getContext('2d');

  nCtx.fillStyle = '#020306';
  nCtx.fillRect(0, 0, 1024, 512);

  nCtx.fillStyle = '#070a13';
  nCtx.strokeStyle = '#1e293b';
  nCtx.lineWidth = 0.5;

  WORLD_MAP_PATHS.forEach(country => {
    try {
      const path = new Path2D(country.d);
      nCtx.save();
      nCtx.translate(-30.767, -241.591);
      nCtx.scale(1024 / 784.077, 512 / 458.627);
      nCtx.fill(path);
      nCtx.stroke(path);
      nCtx.restore();
    } catch (e) { /* ignore */ }
  });

  const drawCityLights = (x, y, radius, count) => {
    for (let i = 0; i < count; i++) {
      const lx = x + (Math.random() - 0.5) * radius;
      const ly = y + (Math.random() - 0.5) * radius;
      nCtx.fillStyle = Math.random() > 0.35 ? '#22d3ee' : '#eab308';
      nCtx.beginPath();
      nCtx.arc(lx, ly, Math.random() * 1.2 + 0.3, 0, Math.PI * 2);
      nCtx.fill();
    }
  };

  drawCityLights(190, 190, 25, 40);
  drawCityLights(250, 200, 30, 80);
  drawCityLights(300, 310, 40, 50);
  drawCityLights(520, 160, 25, 90);
  drawCityLights(670, 230, 20, 70);
  drawCityLights(760, 190, 25, 85);
  drawCityLights(890, 360, 20, 30);

  const dayTex = new THREE.CanvasTexture(canvas);
  const nightTex = new THREE.CanvasTexture(nightCanvas);

  cachedEarthTextures = { day: dayTex, night: nightTex };
  return cachedEarthTextures;
};

let cachedCloudTexture = null;

const createCloudTexture = () => {
  if (typeof document === 'undefined') return null;
  if (cachedCloudTexture) return cachedCloudTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, 512, 256);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  for (let i = 0; i < 25; i++) {
    const cx = Math.random() * 512;
    const cy = 50 + Math.random() * 156;
    const radius = 25 + Math.random() * 50;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.04)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  cachedCloudTexture = new THREE.CanvasTexture(canvas);
  return cachedCloudTexture;
};

// Animated country beacon marker with glow beam & ripples
const CountryBeacon = ({ position, active, count, isSelected, onClick, onPointerOver, onPointerOut }) => {
  const ringRef = useRef();
  const beamRef = useRef();

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (ringRef.current) {
      const scale = 1 + (elapsed * 2) % 2;
      const opacity = 1 - ((elapsed * 2) % 2) / 2;
      ringRef.current.scale.set(scale, scale, scale);
      ringRef.current.material.opacity = opacity * 0.6;
    }
  });

  // Calculate size scale based on visitor count
  const sizeMultiplier = useMemo(() => {
    if (count >= 100) return 2.2;
    if (count >= 10) return 1.5;
    return 1.0;
  }, [count]);

  return (
    <group 
      position={position}
      onClick={(e) => {
        if (active && onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
      onPointerOver={(e) => {
        if (active && onPointerOver) {
          e.stopPropagation();
          onPointerOver(e);
        }
      }}
      onPointerOut={(e) => {
        if (active && onPointerOut) {
          e.stopPropagation();
          onPointerOut();
        }
      }}
    >
      {/* 1. Core Beacon Center */}
      <mesh>
        <sphereGeometry args={[0.04 * sizeMultiplier, 16, 16]} />
        <meshBasicMaterial color={isSelected ? '#f59e0b' : '#22d3ee'} />
      </mesh>

      {/* 2. Expanding Ripple Ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.05 * sizeMultiplier, 0.08 * sizeMultiplier, 16]} />
        <meshBasicMaterial color="#22d3ee" side={THREE.DoubleSide} transparent opacity={0.5} />
      </mesh>

      {/* 3. Vertical Space Beam (Pointed outward from surface center) */}
      <mesh 
        ref={beamRef}
        rotation={[Math.PI / 2, 0, 0]} 
        position={[0, 0.25 * sizeMultiplier, 0]}
      >
        <cylinderGeometry args={[0.01, 0.04 * sizeMultiplier, 0.5 * sizeMultiplier, 8, 1, true]} />
        <meshBasicMaterial 
          color="#22d3ee" 
          transparent 
          opacity={active ? 0.35 : 0.1} 
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// Traveling Satellite Pulse mesh along Bezier curve
const SatellitePulse = ({ curve, color = '#22d3ee' }) => {
  const pulseRef = useRef();

  useFrame(({ clock }) => {
    if (pulseRef.current && curve) {
      const t = (clock.getElapsedTime() * 0.45) % 1;
      const pos = curve.getPointAt(t);
      pulseRef.current.position.copy(pos);
    }
  });

  return (
    <mesh ref={pulseRef}>
      <sphereGeometry args={[0.035, 16, 16]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

// Quadratic Bezier Arc between satellite and country
const ConnectionArc = ({ startPos, endPos, color = '#22d3ee', key }) => {
  const curve = useMemo(() => {
    const midPoint = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
    const distance = startPos.distanceTo(endPos);
    const arcHeight = 2.05 + distance * 0.22;
    midPoint.normalize().multiplyScalar(arcHeight);
    return new THREE.QuadraticBezierCurve3(startPos, endPos, midPoint);
  }, [startPos, endPos]);

  const pathPoints = useMemo(() => curve.getPoints(30), [curve]);

  return (
    <group>
      <Line
        points={pathPoints}
        color={color}
        lineWidth={0.8}
        opacity={0.2}
        transparent
      />
      <SatellitePulse curve={curve} color={color} />
    </group>
  );
};

// Orbital Satellite mesh
const OrbitingSatellite = ({ index, activeCountries, countryPositions, signalColor = '#22d3ee' }) => {
  const satRef = useRef();
  const orbitSpeed = 0.05 + index * 0.02;
  const orbitRadius = 2.6 + index * 0.15;

  useFrame(({ clock }) => {
    if (satRef.current) {
      const elapsed = clock.getElapsedTime() * orbitSpeed;
      // Orbit paths tilted at different angles
      const angleY = elapsed;
      const angleZ = (index * Math.PI) / 3;
      
      satRef.current.position.set(
        orbitRadius * Math.cos(angleY) * Math.cos(angleZ),
        orbitRadius * Math.sin(angleY),
        orbitRadius * Math.cos(angleY) * Math.sin(angleZ)
      );
    }
  });

  // Calculate connection arcs from this satellite to all active countries
  const connectionArcs = useMemo(() => {
    if (!satRef.current || activeCountries.length === 0) return [];
    
    const satPos = satRef.current.position.clone();
    return countryPositions
      .filter(c => c.isActive)
      .map(c => ({
        key: `sat-${index}-arc-${c.code}`,
        startPos: satPos,
        endPos: c.pos
      }));
  }, [activeCountries, countryPositions]);

  return (
    <group>
      {/* Satellite body mesh */}
      <mesh ref={satRef}>
        <boxGeometry args={[0.08, 0.08, 0.08]} />
        <meshBasicMaterial color="#ffffff" />
        
        {/* Pulsing blinking signal light */}
        <pointLight color="#22d3ee" intensity={1.5} distance={1} />
        <mesh position={[0, 0.06, 0]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      </mesh>

      {/* Render active connection arcs */}
      {satRef.current && connectionArcs.map(arc => (
        <ConnectionArc 
          key={arc.key} 
          startPos={arc.startPos} 
          endPos={arc.endPos} 
          color={signalColor} 
        />
      ))}
    </group>
  );
};

// Internal rotating globe model
const GlobeGroup = ({ activeCountries, selectedCountry, onSelectCountry, onHoverCountry, targetFocus }) => {
  const groupRef = useRef();
  const cloudsRef = useRef();

  const textures = useMemo(() => createEarthTextures(), []);
  const cloudTexture = useMemo(() => createCloudTexture(), []);

  useFrame(() => {
    if (groupRef.current && !targetFocus) {
      // Slow Y axis idle rotation
      groupRef.current.rotation.y += 0.0018;
    }
    if (cloudsRef.current) {
      // Clouds rotate slightly faster in opposite direction
      cloudsRef.current.rotation.y -= 0.0022;
    }
  });

  // Parse locations
  const countryPositions = useMemo(() => {
    return Object.entries(COUNTRY_COORDS).map(([code, data]) => {
      const pos = getSphericalCoords(data.lat, data.lon, 2);
      const isActive = activeCountries.some(
        c => c.toLowerCase() === code
      );
      // Fallback views/count
      const count = code === 'lk' ? 98 : code === 'us' ? 28 : code === 'in' ? 10 : 6;
      return { code, name: data.name, pos, isActive, count };
    });
  }, [activeCountries]);

  return (
    <group ref={groupRef}>
      {/* 1. Earth Day/Night Shaded Sphere */}
      {textures.day && textures.night && (
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[2, 48, 48]} />
          <shaderMaterial
            vertexShader={EarthShader.vertexShader}
            fragmentShader={EarthShader.fragmentShader}
            uniforms={{
              dayTexture: { value: textures.day },
              nightTexture: { value: textures.night },
              lightDirection: { value: new THREE.Vector3(2, 1, 2).normalize() }
            }}
          />
        </mesh>
      )}

      {/* 2. Rotating Clouds Layer */}
      {cloudTexture && (
        <mesh ref={cloudsRef} scale={1.025}>
          <sphereGeometry args={[2, 36, 36]} />
          <meshBasicMaterial 
            map={cloudTexture} 
            transparent 
            opacity={0.3} 
            depthWrite={false}
          />
        </mesh>
      )}

      {/* 3. Soft Atmospheric Fresnel Rim Glow */}
      <mesh scale={1.05}>
        <sphereGeometry args={[2, 36, 36]} />
        <shaderMaterial
          vertexShader={FresnelShader.vertexShader}
          fragmentShader={FresnelShader.fragmentShader}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          transparent
        />
      </mesh>

      {/* 4. Active Country Beacons */}
      {countryPositions.map((c) => (
        <CountryBeacon
          key={c.code}
          position={c.pos}
          active={c.isActive}
          count={c.count}
          isSelected={selectedCountry?.toLowerCase() === c.code}
          onClick={() => onSelectCountry && onSelectCountry(c.code)}
          onPointerOver={(e) => onHoverCountry && onHoverCountry(e, c.code)}
          onPointerOut={() => onHoverCountry && onHoverCountry(null, null)}
        />
      ))}

      {/* 5. Satellites System */}
      <OrbitingSatellite index={0} activeCountries={activeCountries} countryPositions={countryPositions} signalColor="#06b6d4" />
      <OrbitingSatellite index={1} activeCountries={activeCountries} countryPositions={countryPositions} signalColor="#10b981" />
      <OrbitingSatellite index={2} activeCountries={activeCountries} countryPositions={countryPositions} signalColor="#8b5cf6" />
    </group>
  );
};

// Space Dust Particles
const SpaceParticles = () => {
  const particlesCount = 200;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      const radius = 3.5 + Math.random() * 3;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial 
        color="#22d3ee" 
        size={0.025} 
        sizeAttenuation 
        transparent 
        opacity={0.4} 
      />
    </points>
  );
};

// Camera interpolation manager
const CameraFocusManager = ({ targetFocus, onResetFocusComplete }) => {
  const { camera } = useThree();

  useFrame(() => {
    if (targetFocus) {
      // Lerp camera position to focus coordinate
      const targetPos = getSphericalCoords(targetFocus.lat, targetFocus.lon, 4.0);
      camera.position.lerp(targetPos, 0.08);
    } else {
      // Return to baseline camera pos
      const baselinePos = new THREE.Vector3(0, 0, 4.5);
      if (camera.position.distanceTo(baselinePos) > 0.05) {
        camera.position.lerp(baselinePos, 0.05);
      }
    }
  });

  return null;
};

// Canvas wrapper component
const Globe3D = ({ activeCountries = [], selectedCountry, onSelectCountry, onHoverCountry }) => {
  const [targetFocus, setTargetFocus] = useState(null);

  // Focus camera on selected country
  useEffect(() => {
    if (selectedCountry) {
      const coords = COUNTRY_COORDS[selectedCountry.toLowerCase()];
      if (coords) {
        setTargetFocus(coords);
      }
    } else {
      setTargetFocus(null);
    }
  }, [selectedCountry]);

  const containerRef = useRef(null);
  const { enabled, shouldAnimate } = useCanvasLifecycle(containerRef);

  if (!enabled) {
    return <div className="w-full h-[480px] bg-black/55 rounded-lg border border-white/5" />;
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-[480px] bg-black/55 rounded-lg border border-white/5 relative overflow-hidden select-none cursor-grab active:cursor-grabbing"
      onDoubleClick={() => setTargetFocus(null)}
      title="Double click background to reset camera view"
    >
      {/* Floating HUD status indicator overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none font-mono text-[9px] text-cyan-400 select-none uppercase tracking-widest flex flex-col gap-1">
        <span>📡 SATCOM FEED: LIVE</span>
        <span className="text-text-muted opacity-50 text-[8px]">Double-click canvas to center view</span>
      </div>

      <Canvas 
        camera={{ position: [0, 0, 4.5], fov: 60 }}
        gl={{ antialias: true }}
        frameloop={shouldAnimate ? 'always' : 'never'}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        
        {/* Ambient Space Particles */}
        <SpaceParticles />

        {/* The rotating globe model */}
        <GlobeGroup 
          activeCountries={activeCountries} 
          selectedCountry={selectedCountry}
          onSelectCountry={onSelectCountry}
          onHoverCountry={onHoverCountry}
          targetFocus={targetFocus}
        />

        {/* Camera interpolation helper */}
        <CameraFocusManager targetFocus={targetFocus} />

        {/* Orbit controls for complete user zoom & pan */}
        <OrbitControls 
          enableZoom={true} 
          enablePan={false}
          minDistance={3.2}
          maxDistance={5.8}
          rotateSpeed={0.7}
        >
          <DisposeOnUnmount />
        </OrbitControls>
      </Canvas>
    </div>
  );
};

export default Globe3D;
