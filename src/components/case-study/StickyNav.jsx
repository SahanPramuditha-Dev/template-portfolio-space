import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'problem', label: 'Problem' },
  { id: 'solution', label: 'Solution' },
  { id: 'demo', label: 'Demo Showcase' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'tech-stack', label: 'Tech Stack' },
  { id: 'features', label: 'Key Features' },
  { id: 'timeline', label: 'Development Process' },
  { id: 'challenges', label: 'Engineering Decisions' },
  { id: 'performance', label: 'Performance & Results' },
  { id: 'lessons-learned', label: 'Lessons Learned' },
  { id: 'repo-insights', label: 'Repository Insights' },
];

const StickyNav = () => {
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="hidden xl:block fixed left-8 top-1/2 -translate-y-1/2 z-40 w-48">
      <nav className="flex flex-col gap-3">
        <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2 ml-4">
          Case Study
        </h3>
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`group flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 ${
              activeSection === section.id
                ? 'bg-accent/10 text-accent font-medium translate-x-2'
                : 'text-text-muted hover:text-text hover:bg-secondary/50'
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                activeSection === section.id
                  ? 'bg-accent scale-150 shadow-[0_0_8px_rgba(var(--color-accent-rgb),0.8)]'
                  : 'bg-text-muted group-hover:bg-text'
              }`}
            />
            <span className="text-sm">{section.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
};

export default StickyNav;
