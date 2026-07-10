import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const CircularProgress = ({ value, label, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  // Parse value to number, default to 0 if invalid
  const numericValue = parseInt(value, 10);
  const validValue = isNaN(numericValue) ? 0 : Math.min(100, Math.max(0, numericValue));
  
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (validValue / 100) * circumference;

  // Determine color based on score
  const getColor = (score) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-red-400';
  };
  
  const colorClass = getColor(validValue);

  return (
    <div className="flex flex-col items-center gap-4 group" ref={ref}>
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Background Circle */}
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            className="text-white/10"
          />
          {/* Animated Foreground Circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className={`${colorClass} drop-shadow-[0_0_8px_currentColor]`}
            initial={{ strokeDashoffset: circumference }}
            animate={isInView ? { strokeDashoffset } : { strokeDashoffset: circumference }}
            transition={{ duration: 1.5, delay, ease: "easeOut" }}
            style={{ strokeDasharray: circumference }}
          />
        </svg>
        {/* Number Counter */}
        <div className="absolute inset-0 flex items-center justify-center">
           <span className="text-2xl font-bold font-mono text-text">
             {validValue}
           </span>
        </div>
      </div>
      <span className="text-sm font-bold uppercase tracking-wider text-text-muted group-hover:text-text transition-colors text-center">
        {label}
      </span>
    </div>
  );
};

const PerformanceDashboard = ({ project }) => {
  const scores = [
    { label: 'Performance', value: project.perfScore },
    { label: 'Accessibility', value: project.accessScore },
    { label: 'Best Practices', value: project.bestScore },
    { label: 'SEO', value: project.seoScore },
  ].filter(s => s.value);

  if (scores.length === 0) return null;

  return (
    <div className="rounded-3xl border border-white/10 bg-secondary/30 p-8 md:p-12 backdrop-blur-md relative overflow-hidden">
      {/* Decorative blurred blob */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-wrap justify-center gap-12 md:gap-16">
        {scores.map((score, idx) => (
          <CircularProgress key={idx} label={score.label} value={score.value} delay={idx * 0.2} />
        ))}
      </div>
    </div>
  );
};

export default PerformanceDashboard;
