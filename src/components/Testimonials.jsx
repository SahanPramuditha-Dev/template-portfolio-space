import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import { CmsSectionSkeleton } from './CmsShapeSkeleton';

const Testimonials = () => {
  const { data, loading } = useCmsDoc(CMS_DOCS.testimonials, { items: [] });
  const testimonials = Array.isArray(data?.items) ? data.items : [];

  const scrollRef = React.useRef(null);
  const isDragging = React.useRef(false);
  const startX = React.useRef(0);
  const scrollLeftStart = React.useRef(0);
  const requestRef = React.useRef(null);
  const autoScrollActive = React.useRef(true);
  const resumeTimeout = React.useRef(null);

  // Triple the list to create a seamless scrolling loop in both directions
  const items = React.useMemo(() => {
    if (testimonials.length === 0) return [];
    return [...testimonials, ...testimonials, ...testimonials];
  }, [testimonials]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || items.length === 0) return;

    // Small delay to ensure browser finishes rendering cards layout
    const initTimeout = setTimeout(() => {
      if (el.scrollWidth) {
        el.scrollLeft = el.scrollWidth / 3;
      }
    }, 150);

    const animate = () => {
      if (autoScrollActive.current && !isDragging.current && el.scrollWidth) {
        el.scrollLeft += 0.35; // Seamless glide

        const oneThirdWidth = el.scrollWidth / 3;
        const limit = (el.scrollWidth * 2) / 3;
        if (el.scrollLeft >= limit) {
          el.scrollLeft -= oneThirdWidth;
        }
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      clearTimeout(initTimeout);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
    };
  }, [items]);

  // Dragging event handlers
  const handleMouseDown = (e) => {
    const el = scrollRef.current;
    if (!el) return;
    isDragging.current = true;
    autoScrollActive.current = false;
    if (resumeTimeout.current) clearTimeout(resumeTimeout.current);

    startX.current = e.pageX - el.offsetLeft;
    scrollLeftStart.current = el.scrollLeft;
  };

  const handleMouseMove = (e) => {
    const el = scrollRef.current;
    if (!el || !isDragging.current) return;
    e.preventDefault();

    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX.current) * 1.0; // Perfect 1:1 mouse movement mapping (smooth friction)
    el.scrollLeft = scrollLeftStart.current - walk;

    // Loop boundaries check during dragging
    const oneThirdWidth = el.scrollWidth / 3;
    const limitMax = (el.scrollWidth * 2) / 3;
    if (el.scrollLeft <= 50) {
      el.scrollLeft += oneThirdWidth;
      startX.current = x; // Reset start reference on boundary jumps
      scrollLeftStart.current = el.scrollLeft;
    } else if (el.scrollLeft >= limitMax - 50) {
      el.scrollLeft -= oneThirdWidth;
      startX.current = x;
      scrollLeftStart.current = el.scrollLeft;
    }
  };

  const handleMouseUpOrLeave = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    // Resume auto-scroll smoothly after a 2.5-second delay
    resumeTimeout.current = setTimeout(() => {
      autoScrollActive.current = true;
    }, 2500);
  };

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
          <div className="relative overflow-hidden w-full p-4">
            {/* Left and Right gradient mask for smooth side fade out */}
            <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-primary via-primary/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-primary via-primary/80 to-transparent z-10 pointer-events-none" />

            {/* Scrollable Track container */}
            <div
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              className="flex gap-6 overflow-x-hidden select-none cursor-grab active:cursor-grabbing py-2"
            >
              {items.map((item, idx) => (
                <article
                  key={`${item.name}-${idx}`}
                  className="rounded-3xl border border-white/5 hover:border-accent/30 bg-secondary/15 hover:bg-secondary/30 p-6 backdrop-blur-md transition-all duration-300 transform hover:scale-[1.01] flex flex-col justify-between w-[320px] md:w-[380px] shrink-0 min-h-[220px]"
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
              ))}
            </div>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
};

export default Testimonials;
