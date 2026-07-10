import React, { Suspense, lazy } from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import { CmsSectionSkeleton } from '../components/CmsShapeSkeleton';

const Skills = lazy(() => import('../components/Skills'));
const Experience = lazy(() => import('../components/Experience'));
const Projects = lazy(() => import('../components/Projects'));
const Certifications = lazy(() => import('../components/Certifications'));
const Contact = lazy(() => import('../components/Contact'));

export const BlockRegistry = {
  'Hero': {
    id: 'Hero',
    label: 'Hero',
    category: 'Homepage',
    schema: [],
    Component: Hero
  },
  'About': {
    id: 'About',
    label: 'About',
    category: 'Homepage',
    schema: [],
    Component: About
  },
  'Skills': {
    id: 'Skills',
    label: 'Skills',
    category: 'Homepage',
    schema: [],
    Component: ({ block }) => (
      <Suspense fallback={<CmsSectionSkeleton id="skills" />}>
        <Skills />
      </Suspense>
    )
  },
  'Experience': {
    id: 'Experience',
    label: 'Experience',
    category: 'Homepage',
    schema: [],
    Component: ({ block }) => (
      <Suspense fallback={<CmsSectionSkeleton id="experience" />}>
        <Experience />
      </Suspense>
    )
  },
  'Projects': {
    id: 'Projects',
    label: 'Projects',
    category: 'Homepage',
    schema: [],
    Component: ({ block }) => (
      <Suspense fallback={<CmsSectionSkeleton id="projects" />}>
        <Projects isHomepage={true} />
      </Suspense>
    )
  },
  'Certifications': {
    id: 'Certifications',
    label: 'Certifications',
    category: 'Homepage',
    schema: [],
    Component: ({ block }) => (
      <Suspense fallback={<CmsSectionSkeleton id="certifications" />}>
        <Certifications />
      </Suspense>
    )
  },
  'Contact': {
    id: 'Contact',
    label: 'Contact',
    category: 'Homepage',
    schema: [],
    Component: ({ block }) => (
      <Suspense fallback={<CmsSectionSkeleton id="contact" />}>
        <Contact />
      </Suspense>
    )
  },
};

export const getBlockDefinition = (type) => {
  return BlockRegistry[type] || { 
    Component: ({ block }) => (
      <div className="p-8 border border-dashed border-red-500/50 text-center text-red-400 bg-red-500/10 rounded-xl my-4">
        Unregistered Block Type: {block.type}
      </div>
    )
  };
};
