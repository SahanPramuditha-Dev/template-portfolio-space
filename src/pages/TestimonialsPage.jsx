import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import SEO from '../components/SEO';
import PageShell from '../components/PageShell';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';

const TestimonialsPage = () => {
  const { data } = useCmsDoc(CMS_DOCS.testimonials, { items: [] });
  const testimonials = Array.isArray(data?.items) ? data.items : [];

  return (
    <>
      <SEO
        title="Testimonials | Sahan Pramuditha"
        description="Client, peer, and mentor feedback from projects, collaborations, and professional work."
        canonicalPath="/testimonials"
      />
      <PageShell
        eyebrow="Social Proof"
        title="What people say about the work."
        description="Peer feedback, client notes, and recommendations can live here once added in the admin panel."
      >
        {testimonials.length === 0 ? (
          <div className="rounded-2xl border border-secondary/50 bg-secondary/20 px-6 py-16 text-center text-text-muted">
            No testimonials yet. Add some in the admin panel.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
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
                    <h2 className="text-xl font-bold text-text">{item.name}</h2>
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
      </PageShell>
    </>
  );
};

export default TestimonialsPage;
