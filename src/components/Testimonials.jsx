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
            <span className="text-accent font-mono text-xl mr-2">04.</span> Social Proof
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
          <div className="grid gap-6 md:grid-cols-2 min-h-[320px]">
            {testimonials.map((item, index) => (
              <motion.article
                key={item.name || index}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="rounded-3xl border border-white/10 bg-secondary/20 p-6 backdrop-blur-md"
              >
                <Quote className="mb-4 text-accent" size={28} />
                <p className="text-lg leading-relaxed text-text">"{item.content}"</p>
                <div className="mt-6 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-text">{item.name}</h3>
                    <p className="text-sm text-text-muted">
                      {item.role}{item.company ? `, ${item.company}` : ''}
                    </p>
                    {item.context ? <p className="mt-2 text-xs text-text-muted">{item.context}</p> : null}
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    {[...Array(Number(item.rating || 5))].map((_, starIndex) => (
                      <Star key={starIndex} size={14} className="fill-yellow-400" />
                    ))}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
};

export default Testimonials;
