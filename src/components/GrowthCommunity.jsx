import React, { useState } from 'react';
import { Award, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import SectionWrapper from './SectionWrapper';
import Certifications from './Certifications';
import Badges from './Badges';

/** A single homepage destination for formal learning and community participation. */
const GrowthCommunity = () => {
  const [activeView, setActiveView] = useState('credentials');

  return (
    <SectionWrapper id="growth-community" className="scroll-mt-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto mb-9 max-w-2xl text-center md:mb-12">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-accent">
            <Users size={14} /> Learning beyond the work
          </div>
          <h2 className="mb-4 font-display text-3xl font-extrabold text-text sm:text-4xl md:text-5xl">
            Growth <span className="text-accent">&amp; Community</span>
          </h2>
          <p className="text-sm text-text-muted sm:text-base">
            Verified learning alongside the workshops, meetups, and communities that keep my practice growing.
          </p>
        </div>

        <div className="mx-auto mb-8 flex w-full max-w-xl rounded-2xl border border-white/10 bg-secondary/20 p-1.5" role="tablist" aria-label="Growth and community content">
          <button
            type="button"
            role="tab"
            aria-selected={activeView === 'credentials'}
            onClick={() => setActiveView('credentials')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${activeView === 'credentials' ? 'bg-accent text-primary shadow-[0_0_18px_rgb(var(--color-accent-rgb)/0.25)]' : 'text-text-muted hover:text-text'}`}
          >
            <Award size={16} /> Credentials
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeView === 'community'}
            onClick={() => setActiveView('community')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${activeView === 'community' ? 'bg-accent text-primary shadow-[0_0_18px_rgb(var(--color-accent-rgb)/0.25)]' : 'text-text-muted hover:text-text'}`}
          >
            <Users size={16} /> Community
          </button>
        </div>

        <motion.div key={activeView} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {activeView === 'credentials' ? <Certifications embedded /> : <Badges embedded />}
        </motion.div>
      </div>
    </SectionWrapper>
  );
};

export default GrowthCommunity;
