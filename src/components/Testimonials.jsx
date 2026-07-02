import React, { useRef, useEffect, useState } from 'react';
import { Quote, Star } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import { CmsSectionSkeleton } from './CmsShapeSkeleton';

const Testimonials = () => {
  const { data, loading } = useCmsDoc(CMS_DOCS.testimonials, { items: [] });
  const testimonials = Array.isArray(data?.items) ? data.items : [];
  
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (testimonials.length === 0) return;
    
    const container = scrollRef.current;
    if (!container) return;

    let animationFrameId;
    const speed = 0.8; // pixels per frame

    const tick = () => {
      // Only auto-scroll if the user is not actively dragging or hovering
      if (!isDragging.current && !isHovered) {
        container.scrollLeft += speed;
        
        // Loop back seamlessly when scrolling past one set of testimonials
        const maxScroll = container.scrollWidth / 3;
        if (container.scrollLeft >= maxScroll) {
          container.scrollLeft -= maxScroll;
        }
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [testimonials, isHovered]);

  const handleMouseDown = (e) => {
    const container = scrollRef.current;
    if (!container) return;
    isDragging.current = true;
    startX.current = e.pageX - container.offsetLeft;
    scrollLeftStart.current = container.scrollLeft;
  };

  const handleMouseLeaveOrUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const container = scrollRef.current;
    if (!container) return;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX.current) * 1.5; // Drag sensitivity multiplier
    container.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleTouchStart = (e) => {
    const container = scrollRef.current;
    if (!container) return;
    isDragging.current = true;
    startX.current = e.touches[0].pageX - container.offsetLeft;
    scrollLeftStart.current = container.scrollLeft;
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    const container = scrollRef.current;
    if (!container) return;
    const x = e.touches[0].pageX - container.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    container.scrollLeft = scrollLeftStart.current - walk;
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

            {/* Scrollable Container wrapper */}
            <div
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseLeaveOrUp}
              onMouseLeave={handleMouseLeaveOrUp}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleMouseLeaveOrUp}
              onTouchMove={handleTouchMove}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="flex gap-6 overflow-x-auto overflow-y-hidden select-none cursor-grab active:cursor-grabbing scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
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
