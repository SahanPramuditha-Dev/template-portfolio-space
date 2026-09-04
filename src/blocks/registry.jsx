import React, { Suspense, lazy } from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import { CmsSectionSkeleton } from '../components/CmsShapeSkeleton';

const Skills = lazy(() => import('../components/Skills'));
const Experience = lazy(() => import('../components/Experience'));
const Projects = lazy(() => import('../components/Projects'));
const GrowthCommunity = lazy(() => import('../components/GrowthCommunity'));
const Testimonials = lazy(() => import('../components/Testimonials'));
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
  'GrowthCommunity': {
    id: 'GrowthCommunity',
    label: 'Growth & Community',
    category: 'Homepage',
    schema: [],
    Component: ({ block }) => (
      <Suspense fallback={<CmsSectionSkeleton id="growth-community" />}>
        <GrowthCommunity />
      </Suspense>
    )
  },
  // Existing published layouts may still contain these two blocks. Keep them
  // compatible while rendering only one combined homepage destination.
  'Certifications': {
    id: 'Certifications',
    label: 'Growth & Community',
    category: 'Homepage',
    schema: [],
    Component: () => (
      <Suspense fallback={<CmsSectionSkeleton id="growth-community" />}>
        <GrowthCommunity />
      </Suspense>
    )
  },
  'Badges': {
    id: 'Badges',
    label: 'Digital Badges (legacy)',
    category: 'Homepage',
    schema: [],
    Component: () => null
  },
  'Testimonials': {
    id: 'Testimonials',
    label: 'Testimonials',
    category: 'Homepage',
    schema: [],
    Component: ({ block }) => (
      <Suspense fallback={<CmsSectionSkeleton id="testimonials" />}>
        <Testimonials />
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
