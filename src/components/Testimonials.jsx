import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import { CmsSectionSkeleton } from './CmsShapeSkeleton';

const Testimonials = () => {
  const { data, loading } = useCmsDoc(CMS_DOCS.testimonials, { items: [] });
  const testimonials = Array.isArray(data?.items) ? data.items : [];
  
  const scrollContainerRef = useRef(null);
  const isInteractingRef = useRef(false);

  // Mouse Drag to Scroll states
  const dragStartRef = useRef({ x: 0, scrollLeft: 0 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (testimonials.length === 0) return undefined;

    const container = scrollContainerRef.current;
    if (!container) return undefined;

    let frameId;
    const speed = 0.6; // Scroll speed in pixels per frame

    const step = () => {
      if (!isInteractingRef.current && container) {
        container.scrollLeft += speed;
        
        // Loop back seamlessly when scrolling past one complete set of cards
        const maxScroll = container.scrollWidth / 3;
        if (container.scrollLeft >= maxScroll) {
          container.scrollLeft = 0;
        }
      }
      frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frameId);
  }, [testimonials]);

  // Mouse Drag Events Handler
  const handleMouseDown = (e) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    isInteractingRef.current = true;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.pageX - container.offsetLeft,
      scrollLeft: container.scrollLeft,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const container = scrollContainerRef.current;
    if (!container) return;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - dragStartRef.current.x) * 1.5; // Drag sensitivity multiplier
    container.scrollLeft = dragStartRef.current.scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
    isInteractingRef.current = false;
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
          <div className="relative w-full p-4">
            {/* Left and Right gradient mask for smooth side fade out */}
            <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-primary to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-primary to-transparent z-10 pointer-events-none" />

            {/* Scrollable Container with Grab cursor */}
            <div
              ref={scrollContainerRef}
              className={`flex gap-6 overflow-x-auto scrollbar-none select-none ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              onTouchStart={() => { isInteractingRef.current = true; }}
              onTouchEnd={() => { isInteractingRef.current = false; }}
              style={{
                scrollBehavior: isDragging ? 'auto' : 'smooth'
              }}
            >
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
