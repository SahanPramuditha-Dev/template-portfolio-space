import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sparkles } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionWrapper from './SectionWrapper';
import TiltCard from './TiltCard';
import { shouldDisableHeavyVisuals } from '../utils/runtimeGuards';
import { useCanvasLifecycle, useIsMobileCanvas } from '../hooks/useCanvasLifecycle';
import PerformanceMonitor from './PerformanceMonitor';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import { CmsSectionSkeleton } from './CmsShapeSkeleton';

gsap.registerPlugin(ScrollTrigger);
const ISS3D = lazy(() => import('./ISS3D'));
import NasaApod from './NasaApod';

/*
const SKILL_CATEGORIES = [
  {
    title: "Languages",
    skills: [
      { name: "JavaScript (ES6+)", level: 95, proficiency: "Advanced", rationale: "Core of modern web dev" },
      { name: "Python", level: 80, proficiency: "Proficient", rationale: "Data analysis & scripting" },
      { name: "HTML5", level: 95, proficiency: "Advanced", rationale: "Semantic markup" },
      { name: "CSS3", level: 95, proficiency: "Advanced", rationale: "Responsive design" }
    ]
  },
  {
    title: "Frameworks",
    skills: [
      { name: "React", level: 90, proficiency: "Advanced", rationale: "Component architecture" },
      { name: "Next.js", level: 85, proficiency: "Proficient", rationale: "SSR & Performance" },
      { name: "Tailwind", level: 95, proficiency: "Advanced", rationale: "Rapid styling" },
      { name: "Three.js", level: 75, proficiency: "Intermediate", rationale: "3D Visualizations" }
    ]
  },
  {
    title: "Tools & Backend",
    skills: [
      { name: "Node.js", level: 85, proficiency: "Proficient", rationale: "Scalable backend" },
      { name: "Git", level: 85, proficiency: "Proficient", rationale: "Version control" },
      { name: "MongoDB", level: 80, proficiency: "Proficient", rationale: "NoSQL Database" },
      { name: "Figma", level: 75, proficiency: "Intermediate", rationale: "Design to Code" }
    ]
  },
  {
    title: "E-commerce & Ops",
    skills: [
      { name: "E-commerce Operations", level: 90, proficiency: "Advanced", rationale: "Catalog, inventory & fulfillment" },
      { name: "Platform Scaling", level: 85, proficiency: "Proficient", rationale: "Performance & reliability for peak traffic" },
      { name: "Inventory Management", level: 80, proficiency: "Proficient", rationale: "Sync & omnichannel workflows" },
      { name: "Payments & Integrations", level: 80, proficiency: "Proficient", rationale: "Gateways, webhooks & partner integrations" }
    ]
  }
];
*/

const normalizeSkill = (skill) => {
  if (typeof skill === 'string') {
    return {
      name: skill,
      level: null,
      proficiency: '',
      rationale: '',
      iconUrl: '',
    };
  }

  return {
    name: skill?.name || skill?.title || '',
    level: Number.isFinite(Number(skill?.level)) ? Number(skill.level) : null,
    proficiency: skill?.proficiency || '',
    rationale: skill?.rationale || '',
    iconUrl: skill?.iconUrl || skill?.imageUrl || skill?.icon || '',
  };
};

const Skills = () => {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const controlsRef = useRef(null);
  const isMobile = useIsMobileCanvas();
  const { enabled: threeEnabled, shouldAnimate } = useCanvasLifecycle(containerRef);
  const [isHovered, setIsHovered] = useState(false);
  const [highlightCategory, setHighlightCategory] = useState(null);
  const [issInfo, setIssInfo] = useState(null);
  const [issError, setIssError] = useState(false);
  const { data: skillsDoc, loading: skillsLoading } = useCmsDoc(CMS_DOCS.skills, { items: [] });
  const { data: siteDoc, loading: siteLoading } = useCmsDoc(CMS_DOCS.site, null);

  // Performance Downscaling
  const [dpr, setDpr] = useState(() => (isMobile ? 1.0 : [1, 1.25]));
  const [antialias, setAntialias] = useState(() => !isMobile);
  const [sparkCount, setSparkCount] = useState(50);

  const handleLowPerformance = useCallback(() => {
    setDpr(1.0);
    setAntialias(false);
    setSparkCount(15);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (!threeEnabled) return;
      e.preventDefault();
      e.stopPropagation();
    };

    // Add passive: false to allow preventDefault
    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [threeEnabled]);

  // Live ISS location (for realism)
  useEffect(() => {
    let cancelled = false;

    const fetchISS = () => {
      fetch('https://api.wheretheiss.at/v1/satellites/25544')
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => {
          if (cancelled) return Promise.reject('cancelled');
          return fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${data.latitude}&longitude=${data.longitude}&localityLanguage=en`)
            .then((geoRes) => (geoRes.ok ? geoRes.json() : {}))
            .then((geoData) => {
              if (cancelled) return;
              const country = geoData.countryName || geoData.locality || geoData.description || 'International Waters';
              setIssInfo({
                latitude: data.latitude,
                longitude: data.longitude,
                altitude: data.altitude, // km
                velocity: data.velocity, // km/h
                country: country,
              });
              setIssError(false);
            });
        })
        .catch((err) => {
          if (cancelled || err === 'cancelled') return;
          setIssError(true);
        });
    };

    fetchISS();
    const id = setInterval(fetchISS, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const skillGroups = Array.isArray(skillsDoc?.items) ? skillsDoc.items : [];
  const hasSkills = skillGroups.length > 0;
  const currentLearning = Array.isArray(siteDoc?.currentLearningJson) ? siteDoc.currentLearningJson : [];
  const devEnvironment = Array.isArray(siteDoc?.devEnvironmentJson) ? siteDoc.devEnvironmentJson : [];

  const cmsPending =
    skillsLoading ||
    siteLoading ||
    skillsDoc === undefined ||
    siteDoc === undefined;

  useEffect(() => {
    if (cmsPending) return undefined;
    const ctx = gsap.context(() => {
      gsap.from(".skill-category", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        scrollTrigger: {
          trigger: ".skills-wrapper",
          start: "top 80%",
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [cmsPending]);

  if (cmsPending) {
    return <CmsSectionSkeleton id="skills" />;
  }

  return (
    <SectionWrapper id="skills" className="bg-secondary/30 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl" ref={sectionRef}>
        <h2 className="flex flex-wrap items-center gap-2 text-xl sm:text-2xl md:text-3xl font-bold text-text mb-8 sm:mb-12 md:mb-16 gradient-text">
          <span className="text-accent font-mono text-lg sm:text-xl mr-0 sm:mr-2">03.</span>
          <span className="flex-grow min-w-0">Skills & Technologies</span>
          <span className="h-px bg-secondary flex-grow min-w-[60px] ml-0 sm:ml-4 opacity-50 w-full sm:w-auto order-3 sm:order-none"></span>
        </h2>
        <p className="text-text-muted text-sm md:text-base mb-8 sm:mb-10 max-w-2xl">
          This section maps my core skills onto a mission-style visualization. Each module in the interface
          represents a capability — from frontend systems to backend services — all working together like an
          orbiting station.
        </p>

        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-secondary/20 p-5">
            <h3 className="mb-2 text-lg font-bold text-text">Currently Learning</h3>
            {currentLearning.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {currentLearning.map((item) => (
                  <span key={item} className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-mono text-accent">
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">Add currently learning topics in the admin panel.</p>
            )}
          </div>
          <div className="rounded-2xl border border-white/10 bg-secondary/20 p-5">
            <h3 className="mb-2 text-lg font-bold text-text">Dev Environment</h3>
            {devEnvironment.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {devEnvironment.map((item) => (
                  <span key={item} className="rounded-full border border-secondary/40 bg-primary/50 px-3 py-1 text-xs text-text-muted">
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">Add your development environment details in the admin panel.</p>
            )}
          </div>
        </div>

        <div className="mb-8 flex flex-wrap items-center gap-3">
          <a
            href="#certifications"
            className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-xs font-mono uppercase tracking-[0.14em] text-accent"
          >
            Certifications quick-links
          </a>
          <a
            href="/resume"
            className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-primary/40 px-4 py-2 text-xs font-mono uppercase tracking-[0.14em] text-text-muted"
          >
            Dev environment + CV
          </a>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 sm:gap-16 items-start skills-wrapper">
          {/* Left Column: Categorized Skills */}
          <div className="w-full lg:w-3/5">
            {!hasSkills ? (
              <div className="rounded-2xl border border-secondary/50 bg-secondary/20 px-6 py-16 text-center text-text-muted">
                No skills have been added yet. Use the admin panel to publish skill groups.
              </div>
            ) : (
              <div className="space-y-12">
                {skillGroups.map((category, idx) => (
                  (() => {
                    const groupSkills = Array.isArray(category.skills)
                      ? category.skills
                      : Array.isArray(category.skillsJson)
                        ? category.skillsJson
                        : [];

                    return (
                  <div
                    key={category.title || idx}
                    className="skill-category"
                    onMouseEnter={() => setHighlightCategory(category.title)}
                    onMouseLeave={() => setHighlightCategory(null)}
                  >
                    <h3 className="text-xl font-bold text-accent mb-6 flex items-center gap-2">
                      <span className="w-2 h-2 bg-accent rounded-full"></span>
                      {category.title}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      {groupSkills.map((skill) => (
                        <TiltCard key={typeof skill === 'string' ? skill : skill.name || skill.title || JSON.stringify(skill)}>
                          <div className="group bg-primary/50 p-4 rounded-lg border border-secondary hover:border-accent/50 transition-colors h-full">
                      <div className="flex items-start gap-3 mb-2">
                              {(() => {
                                const normalized = normalizeSkill(skill);
                                return (
                                  <>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-secondary bg-background/40">
                          {normalized.iconUrl ? (
                            <img
                              src={normalized.iconUrl}
                              alt=""
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent">
                              {normalized.name ? normalized.name.slice(0, 2) : 'Sk'}
                            </span>
                          )}
                        </div>
                        <span className="min-w-0 truncate font-bold text-text">{normalized.name || 'Skill'}</span>
                                    {normalized.proficiency ? (
                                      <span className="text-xs font-mono px-2 py-1 bg-secondary rounded text-accent">
                                        {normalized.proficiency}
                                      </span>
                                    ) : null}
                                  </>
                                );
                              })()}
                            </div>
                            {(() => {
                              const normalized = normalizeSkill(skill);
                              return normalized.level !== null ? (
                                <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-2">
                                  <div
                                    className="h-full bg-accent rounded-full transform origin-left transition-transform duration-1000"
                                    style={{ width: `${normalized.level}%` }}
                                  />
                                </div>
                              ) : (
                                <div className="mb-2 inline-flex rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-mono text-accent">
                                  Added in admin
                                </div>
                              );
                            })()}
                            {(() => {
                              const normalized = normalizeSkill(skill);
                              return normalized.rationale ? (
                                <p className="text-xs text-text-muted">{normalized.rationale}</p>
                              ) : null;
                            })()}
                          </div>
                        </TiltCard>
                      ))}
                    </div>
                  </div>
                    );
                  })()
                ))}
              </div>
            )}
          </div>          {/* Right Column: ISS (Local GLB) + NASA APOD */}
          <div className="w-full lg:w-2/5 flex flex-col gap-4 sticky top-20 lg:top-24">
             <div 
                ref={containerRef}
                className="relative w-full h-[260px] sm:h-[300px] lg:h-[380px] cursor-move bg-secondary/20 rounded-2xl border border-secondary/50 backdrop-blur-sm overflow-hidden flex-shrink-0"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
             >
               {/* Decorative background gradient */}
               <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none z-0" />

               {/* Canvas layer - behind overlays */}
               {threeEnabled ? (
                 <div className="absolute inset-0 z-0">
                   <Canvas
                     shadows
                     camera={{ position: [0, 0, 8], fov: 45 }}
                     dpr={dpr}
                     gl={{ antialias: antialias, powerPreference: 'low-power' }}
                     frameloop={shouldAnimate ? "always" : "never"}
                   >
                     <PerformanceMonitor onLowPerformance={handleLowPerformance} />
                     <ambientLight intensity={0.8} />
                     <directionalLight
                       position={[6, 8, 5]}
                       intensity={1.8}
                       castShadow
                       shadow-mapSize-width={1024}
                       shadow-mapSize-height={1024}
                       shadow-bias={-0.0001}
                     />
                     <pointLight position={[-6, 2, -4]} intensity={0.6} color="#93c5fd" />
                     <pointLight position={[6, 3, 4]} intensity={0.8} />

                     <Suspense fallback={null}>
                       <ISS3D highlightCategory={highlightCategory} />
                     </Suspense>
                     <Sparkles
                       count={sparkCount}
                       scale={10}
                       size={2}
                       speed={0.3}
                       opacity={0.4}
                       color="#60a5fa"
                     />

                     <OrbitControls
                       ref={controlsRef}
                       enableZoom={false}
                       autoRotate={!isHovered}
                       autoRotateSpeed={0.5}
                       minPolarAngle={Math.PI / 6}
                       maxPolarAngle={Math.PI - Math.PI / 6}
                       minDistance={1.5}
                       maxDistance={30}
                       zoomSpeed={1.8}
                     />
                   </Canvas>
                 </div>
               ) : (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted text-sm font-mono gap-3 px-6 text-center z-0">
                   <div>Interactive preview disabled for performance</div>
                 </div>
               )}

               {/* Overlay layer - above Canvas */}
               <div className="absolute inset-0 z-10 pointer-events-none">
                 {/* Live ISS telemetry HUD */}
                 {issInfo && (
                    <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-slate-950/90 border border-accent/30 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-slate-200/90 font-mono backdrop-blur-md shadow-lg max-w-[calc(100%-1rem)] sm:max-w-none">
                      <div className="flex items-center justify-between gap-2 sm:gap-4 mb-0.5 sm:mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${issError ? 'bg-red-400' : 'bg-green-400'}`}></span>
                            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${issError ? 'bg-red-500' : 'bg-green-500'}`}></span>
                          </span>
                          <span className="tracking-[0.15em] sm:tracking-[0.18em] uppercase text-slate-400 text-[0.5rem] sm:text-[0.55rem] md:text-[0.6rem] leading-tight">
                            Live ISS Telemetry
                          </span>
                        </div>
                        {issError && (
                          <span className="text-red-400 text-[0.5rem] sm:text-[0.55rem] uppercase whitespace-nowrap">
                            Offline
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5 text-[0.6rem] sm:text-[0.65rem] md:text-[0.75rem] leading-tight">
                        <span className="text-accent font-semibold whitespace-nowrap">
                          Over: {issInfo.country || 'Establishing Uplink...'}
                        </span>
                        <span className="whitespace-nowrap text-slate-400">
                          Lat {issInfo.latitude.toFixed(4)}° · Lon {issInfo.longitude.toFixed(4)}°
                        </span>
                        <span className="whitespace-nowrap text-slate-400">
                          Alt {issInfo.altitude.toFixed(1)} km · Vel {Math.round(issInfo.velocity)} km/h
                        </span>
                      </div>
                    </div>
                 )}

                 {/* Bottom labels - stacked on mobile, side-by-side on larger screens */}
                 <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-0">
                   {threeEnabled && (
                     <div className="text-[0.55rem] sm:text-[0.65rem] md:text-xs text-text-muted/80 font-mono bg-secondary/90 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded backdrop-blur-sm border border-white/10 whitespace-nowrap self-start sm:self-auto">
                       Rotate: drag
                     </div>
                   )}
                   <div className="text-[0.55rem] sm:text-xs text-text-muted font-mono bg-secondary/90 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded backdrop-blur-sm border border-white/5 whitespace-nowrap self-end sm:self-auto">
                     ISS (Local)
                   </div>
                 </div>
               </div>
             </div>

             {/* NASA APOD Widget */}
             <NasaApod />
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default Skills;
