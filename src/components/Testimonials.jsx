import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import { CmsSectionSkeleton } from './CmsShapeSkeleton';

const Testimonials = () => {
  const { data, loading } = useCmsDoc(CMS_DOCS.testimonials, { items: [] });
  const testimonials = Array.isArray(data?.items) ? data.items : [];

  if (loading || data === undefined) {
    return <CmsSectionSkeleton id="testimonials" />;
  }

  return (
    <SectionWrapper id="testimonials" className="relative overflow-hidden py-24">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="flex items-center justify-center text-2xl md:text-3xl font-bold text-text mb-4 font-display gradient-text">
            <span className="text-accent font-mono text-xl mr-2">07.</span> Social Proof
          </h2>
          <p className="text-text-muted max-w-lg mx-auto">
            Feedback from clients, peers, and collaborators can live here once added in the admin panel.
          </p>
        </div>

        {testimonials.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-secondary/20 px-6 py-16 text-center text-text-muted">
            <p className="mx-auto max-w-2xl">
              No testimonials have been added yet. Open the admin panel and publish your first recommendation card.
            </p>
            <a
              href="/admin"
              className="mt-6 inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent"
            >
              Manage testimonials
            </a>
          </div>
        ) : (
          <div className="relative h-[500px] overflow-hidden flex flex-col md:flex-row gap-6 p-4">
            {/* Top and Bottom gradient mask for smooth fade out */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-primary to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-primary to-transparent z-10 pointer-events-none" />

            {(() => {
              const col1 = testimonials.filter((_, idx) => idx % 2 === 0);
              const col2 = testimonials.filter((_, idx) => idx % 2 !== 0);
              
              const items1 = [...col1, ...col1, ...col1];
              const items2 = col2.length > 0 ? [...col2, ...col2, ...col2] : items1;

              const renderCard = (item, idx) => (
                <article
                  key={`${item.name}-${idx}`}
                  className="rounded-3xl border border-white/5 hover:border-accent/30 bg-secondary/15 hover:bg-secondary/30 p-6 backdrop-blur-md transition-all duration-300 transform hover:scale-[1.01] flex flex-col justify-between min-h-[200px]"
                >
                  <div>
                    <Quote className="mb-3 text-accent/80" size={24} />
                    <p className="text-sm leading-relaxed text-slate-300">"{item.content}"</p>
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/5 pt-4">
                    <div>
                      <h3 className="text-sm font-bold text-white">{item.name}</h3>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        {item.role}{item.company ? `, ${item.company}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 text-yellow-400 shrink-0">
                      {[...Array(Number(item.rating || 5))].map((_, starIndex) => (
                        <Star key={starIndex} size={10} className="fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                </article>
              );

              return (
                <>
                  {/* Column 1 (Left / Upwards Track) */}
                  <div className="flex-1 overflow-hidden h-full relative">
                    <div className="space-y-6 animate-[scrollVertical_35s_linear_infinite] hover:[animation-play-state:paused] flex flex-col">
                      {items1.map((item, idx) => renderCard(item, idx))}
                    </div>
                  </div>

                  {/* Column 2 (Right / Slower Upwards Track) */}
                  <div className="flex-1 overflow-hidden h-full relative hidden md:block">
                    <div className="space-y-6 animate-[scrollVertical_45s_linear_infinite] hover:[animation-play-state:paused] flex flex-col">
                      {items2.map((item, idx) => renderCard(item, idx))}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      <style>{`
        @keyframes scrollVertical {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
      `}</style>
    </SectionWrapper>
  );
};

export default Testimonials;
