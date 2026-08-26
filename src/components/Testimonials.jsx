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
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-10 md:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs font-mono uppercase tracking-widest mb-3"
          >
            <Quote size={14} /> Endorsements & Reviews
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text font-display mb-4"
          >
            Client & Peer <span className="text-accent">Testimonials</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl text-text-muted text-sm sm:text-base"
          >
            Feedback and recommendations from team members, clients, and mentors I've collaborated with.
          </motion.p>
        </div>

        {testimonials.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-secondary/20 px-6 py-16 text-center text-text-muted">
            <p className="mx-auto max-w-2xl">
              No testimonials published yet. Open the admin panel → Testimonials → Add New, fill in the details and set Status to <strong className="text-accent">Published</strong>.
            </p>
            <a
              href="/admin"
              className="mt-6 inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent"
            >
              Manage testimonials
            </a>
          </div>
        ) : (
          <div className="relative overflow-hidden w-full p-4 select-none">
            {/* Left and Right gradient mask for smooth side fade out */}
            <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-primary to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-primary to-transparent z-10 pointer-events-none" />

            {/* Infinite Horizontal Scrolling container */}
            <div className="flex w-max gap-6 animate-[scrollHorizontal_40s_linear_infinite] hover:[animation-play-state:paused]">
              {/* Render testimonials duplicated three times to ensure seamless infinite loop */}
              {[...testimonials, ...testimonials, ...testimonials].map((item, idx) => (
                <article
                  key={`${item.name}-${idx}`}
                  className="rounded-3xl border border-white/5 hover:border-accent/30 bg-secondary/15 hover:bg-secondary/30 p-6 backdrop-blur-md transition-all duration-300 transform hover:scale-[1.01] flex flex-col justify-between w-[320px] md:w-[380px] shrink-0 min-h-[220px]"
                >
                  <div>
                    <Quote className="mb-3 text-accent/80" size={24} />
                    <p className="text-sm leading-relaxed text-slate-300">"{item.content}"</p>
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/5 pt-4">
                    <div className="flex items-center gap-3">
                      {item.avatar ? (
                        <img
                          src={item.avatar}
                          alt={item.name}
                          className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
                          <span className="text-accent text-xs font-bold">{(item.name || '?')[0]}</span>
                        </div>
                      )}
                      <div>
                        {item.link ? (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-bold text-white hover:text-accent transition-colors"
                          >
                            {item.name}
                          </a>
                        ) : (
                          <h3 className="text-sm font-bold text-white">{item.name}</h3>
                        )}
                        <p className="text-[11px] text-text-muted mt-0.5">
                          {item.role}{item.company ? `, ${item.company}` : ''}
                        </p>
                        {item.context && (
                          <p className="text-[10px] text-accent/70 mt-0.5 italic">{item.context}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 text-yellow-400 shrink-0">
                      {[...Array(Number(item.rating || 5))].map((_, starIndex) => (
                        <Star key={starIndex} size={10} className="fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scrollHorizontal {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </SectionWrapper>
  );
};

export default Testimonials;
