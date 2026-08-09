import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const AnimatedTimeline = ({ steps }) => {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  // The progress bar height scales from 0 to 100%
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  if (!steps || steps.length === 0) return null;

  return (
    <div ref={containerRef} className="relative max-w-4xl py-12" style={{ position: 'relative' }}>
      
      {/* Background Line */}
      <div className="absolute top-12 bottom-12 left-[27px] md:left-1/2 w-0.5 bg-white/10 -translate-x-1/2 rounded-full overflow-hidden">
        {/* Animated Fill Line */}
        <motion.div 
          className="absolute top-0 left-0 w-full bg-accent origin-top"
          style={{ scaleY, height: '100%' }}
        />
      </div>

      <div className="space-y-16">
        {steps.map((step, idx) => {
          const isEven = idx % 2 === 0;
          
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
              className={`relative flex items-center gap-8 ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'} flex-row`}
            >
              {/* Timeline Dot */}
              <div className="absolute left-[27px] md:left-1/2 w-4 h-4 rounded-full bg-secondary border-2 border-accent -translate-x-1/2 shadow-[0_0_15px_rgba(var(--color-accent-rgb),0.5)] z-10" />

              {/* Content Box */}
              <div className={`w-full md:w-[calc(50%-3rem)] pl-16 md:pl-0 ${isEven ? 'md:text-left' : 'md:text-right'}`}>
                <div className="rounded-2xl border border-white/10 bg-secondary/30 p-6 md:p-8 backdrop-blur-md hover:border-accent/30 transition-colors group">
                  <div className="text-accent font-mono text-xs uppercase tracking-widest mb-2 font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                    {step.duration}
                  </div>
                  <h3 className="text-xl font-bold text-text mb-3">{step.step}</h3>
                  <p className="text-text-muted leading-relaxed text-sm md:text-base">
                    {step.description}
                  </p>
                </div>
              </div>

            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AnimatedTimeline;
