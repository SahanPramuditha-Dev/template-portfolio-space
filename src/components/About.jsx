import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Code2, Server, Users } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import GithubStats from './GithubStats';
import ImageWithFallback from './ImageWithFallback';
import profilePhoto from '../assets/profilephoto.jpeg';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import { CmsSectionSkeleton } from './CmsShapeSkeleton';

const profilePhotoVariants = import.meta.glob('../assets/profilephoto.{avif,webp,jpg,jpeg,png}', {
  eager: true,
  import: 'default',
});

const profilePhotoSources = [
  profilePhotoVariants['../assets/profilephoto.avif']
    ? { srcSet: profilePhotoVariants['../assets/profilephoto.avif'], type: 'image/avif' }
    : null,
  profilePhotoVariants['../assets/profilephoto.webp']
    ? { srcSet: profilePhotoVariants['../assets/profilephoto.webp'], type: 'image/webp' }
    : null,
].filter(Boolean);

const Counter = ({ value, suffix }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      const frame = requestAnimationFrame(() => setCount(value));
      return () => cancelAnimationFrame(frame);
    }

    if (isInView) {
      let start = 0;
      const end = value;
      const duration = 2000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }

    return undefined;
  }, [isInView, value, prefersReducedMotion]);

  return (
    <span ref={ref} className="font-display font-bold text-4xl text-accent">
      {count}
      {suffix}
    </span>
  );
};

const About = () => {
  const { data: siteDoc, exists, loading } = useCmsDoc(CMS_DOCS.site, null);
  const { data: projectsDoc } = useCmsDoc(CMS_DOCS.projects, { items: [] });
  
  const [githubData, setGithubData] = useState({ loc: 0 });
  const GITHUB_USERNAME = siteDoc?.githubUsername || 'SahanPramuditha-Dev';

  useEffect(() => {
    let cancelled = false;
    const fetchGit = async () => {
      try {
        const token = import.meta.env.VITE_GITHUB_TOKEN || '';
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const r = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`, { headers });
        if (!r.ok) return;
        const repos = await r.json();
        
        let estimatedLOC = 0;
        repos.forEach(repo => {
          // Github repo.size is in KB. Roughly ~25-30 lines per KB
          estimatedLOC += (repo.size * 25); 
        });
        
        if (!cancelled) {
          setGithubData({ loc: estimatedLOC });
        }
      } catch {
        // ignore
      }
    };
    fetchGit();
    return () => { cancelled = true; };
  }, [GITHUB_USERNAME]);

  if (loading || siteDoc === undefined) {
    return <CmsSectionSkeleton id="about" />;
  }

  const profilePhotoUrl = siteDoc?.profilePhotoUrl || profilePhoto;

  const aboutParagraphs = exists && siteDoc?.aboutParagraphs
    ? String(siteDoc.aboutParagraphs)
        .split('\n')
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
    : [];

  const projectCount = Array.isArray(projectsDoc?.items) ? projectsDoc.items.length : 0;
  
  const aboutStats = Array.isArray(siteDoc?.aboutStatsJson) ? siteDoc.aboutStatsJson.map(stat => {
    const labelLower = stat.label?.toLowerCase() || '';
    if (labelLower.includes('projects completed')) {
      return { ...stat, value: projectCount > 0 ? projectCount : stat.value };
    }
    if (labelLower.includes('lines of code') && githubData.loc > 0) {
      const kLines = Math.floor(githubData.loc / 1000);
      return { ...stat, value: kLines > 0 ? kLines : githubData.loc, suffix: kLines > 0 ? 'k+' : '+' };
    }
    return stat;
  }) : [];
  const engineeringApproach = Array.isArray(siteDoc?.engineeringApproachJson) ? siteDoc.engineeringApproachJson : [];
  const careerGoals = Array.isArray(siteDoc?.careerGoalsJson) ? siteDoc.careerGoalsJson : [];
  const hobbies = Array.isArray(siteDoc?.hobbiesJson) ? siteDoc.hobbiesJson : [];
  const educationTimeline = Array.isArray(siteDoc?.educationJson) ? siteDoc.educationJson : [];

  return (
    <SectionWrapper id="about">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative">
        <div className="flex flex-col md:flex-row gap-10 sm:gap-12 items-center mb-12 md:mb-20">
          <div className="md:w-1/3 flex justify-center w-full">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 group mx-auto">
              <div className="absolute inset-0 border-2 border-accent rounded-lg translate-x-4 translate-y-4 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-300" />
              <div className="absolute inset-0 bg-accent/20 rounded-lg group-hover:bg-transparent transition-colors duration-300 z-10 pointer-events-none" />
              <div className="w-full h-full bg-secondary rounded-lg overflow-hidden relative z-0">
                <ImageWithFallback
                  src={profilePhotoUrl}
                  alt="Sahan Pramuditha"
                  className="w-full h-full object-cover"
                  loading="eager"
                  sources={profilePhotoUrl === profilePhoto ? profilePhotoSources : []}
                />
              </div>
            </div>
          </div>

          <div className="md:w-2/3">
            <h2 className="flex flex-wrap items-center gap-2 text-xl sm:text-2xl md:text-3xl font-bold text-text mb-6 sm:mb-8 font-display gradient-text">
              <span className="text-accent font-mono text-lg sm:text-xl mr-0 sm:mr-2">01.</span>
              <span className="flex-grow min-w-0">About Me</span>
              <span className="h-px bg-secondary flex-grow min-w-[60px] ml-0 sm:ml-4 opacity-50 w-full sm:w-auto order-3 sm:order-none" />
            </h2>

            {aboutParagraphs.length > 0 ? (
              <div className="text-text-muted space-y-4 text-lg">
                {aboutParagraphs.map((paragraph) => (
                  <p key={paragraph} dangerouslySetInnerHTML={{ __html: paragraph }} />
                ))}
                <div className="pt-2">
                  <a
                    href="/resume"
                    className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-mono text-accent transition-colors hover:bg-accent hover:text-primary"
                  >
                    Download CV
                  </a>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-secondary/50 bg-secondary/20 px-6 py-12 text-center text-text-muted">
                Add about copy in the admin panel to show this section.
              </div>
            )}
          </div>
        </div>

        {aboutStats.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            {aboutStats.map((stat, index) => (
              <motion.div
                key={stat.label || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 bg-secondary/30 rounded-xl border border-secondary/40 hover:bg-secondary/50 transition-colors"
              >
                <Counter value={Number(stat.value || 0)} suffix={stat.suffix || ''} />
                <p className="text-text-muted text-sm mt-2 font-mono">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="mb-20 rounded-2xl border border-secondary/50 bg-secondary/20 px-6 py-12 text-center text-text-muted">
            Add about stats in the admin panel to show this section.
          </div>
        )}

        <div className="mb-20">
          <h3 className="text-2xl font-bold text-text mb-8 flex items-center gap-2">
            <span className="text-accent font-mono text-xl">01.1.</span> Engineering Approach
          </h3>
          {engineeringApproach.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {engineeringApproach.map((item, index) => {
                const Icon = index === 0 ? Server : index === 1 ? Code2 : Users;
                return (
                  <div key={item.title || index} className="p-6 bg-secondary/20 rounded-xl border border-secondary/50 hover:border-accent/50 transition-colors group">
                    <Icon className="text-accent mb-4 group-hover:scale-110 transition-transform" size={32} />
                    <h4 className="text-xl font-bold text-text mb-2">{item.title}</h4>
                    <p className="text-text-muted text-sm leading-relaxed">{item.description}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-secondary/50 bg-secondary/20 px-6 py-12 text-center text-text-muted">
              Add engineering approach cards in the admin panel to show this section.
            </div>
          )}
        </div>

        <div className="mb-20 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-secondary/20 p-6">
            <h3 className="mb-4 text-2xl font-bold text-text">Career Goals</h3>
            {careerGoals.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {careerGoals.map((goal) => (
                  <span key={goal} className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-mono text-accent">
                    {goal}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">Add career goals in the admin panel.</p>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-secondary/20 p-6">
            <h3 className="mb-4 text-2xl font-bold text-text">Hobbies</h3>
            {hobbies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {hobbies.map((hobby) => (
                  <span key={hobby} className="rounded-full border border-secondary/40 bg-primary/40 px-3 py-1 text-xs text-text-muted">
                    {hobby}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">Add hobbies in the admin panel.</p>
            )}
          </div>
        </div>

        <div className="mb-20">
          <h3 className="text-2xl font-bold text-text mb-8 flex items-center gap-2">
            <span className="text-accent font-mono text-xl">01.3.</span> Education Timeline
          </h3>
          {educationTimeline.length > 0 ? (
            <div className="space-y-4">
              {educationTimeline.map((item, index) => (
                <div key={item.institution || item.program || index} className="rounded-2xl border border-secondary/50 bg-secondary/20 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-lg font-semibold text-text">{item.program}</h4>
                      <p className="text-sm text-accent">{item.institution}</p>
                    </div>
                    <span className="rounded-full border border-secondary/40 bg-primary/40 px-3 py-1 text-xs font-mono text-text-muted">
                      {item.period}
                    </span>
                  </div>
                  {item.note ? <p className="mt-3 text-sm leading-relaxed text-text-muted">{item.note}</p> : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-secondary/50 bg-secondary/20 px-6 py-12 text-center text-text-muted">
              Add education entries in the admin panel.
            </div>
          )}
        </div>

        <div>
          <h3 className="text-2xl font-bold text-text mb-8 flex items-center gap-2">
            <span className="text-accent font-mono text-xl">01.2.</span> Open Source Presence
          </h3>
          <div className="w-full">
            <GithubStats username={GITHUB_USERNAME} />
          </div>
          <p className="text-center text-text-muted mt-6 text-xs font-mono opacity-50">
            * Data fetched dynamically from GitHub API
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default About;
