import React from 'react';
import { motion } from 'framer-motion';

const Timeline = ({ steps = [] }) => {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="relative border-l border-white/10 ml-4 md:ml-6 mt-8 space-y-12">
      {steps.map((step, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="relative pl-8 md:pl-12"
        >
          {/* Node */}
          <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_10px_rgba(var(--color-accent-rgb),0.8)]" />
          
          <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6 mb-2">
            <h3 className="text-xl md:text-2xl font-bold text-text">{step.step}</h3>
            {step.duration && (
              <span className="text-sm font-mono text-accent uppercase tracking-wider">
                {step.duration}
              </span>
            )}
          </div>
          
          {step.description && (
            <p className="text-text-muted leading-relaxed max-w-2xl">
              {step.description}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default Timeline;
