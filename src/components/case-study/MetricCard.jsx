import React from 'react';
import { motion } from 'framer-motion';

const MetricCard = ({ label, value, suffix = '', delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center justify-center p-8 rounded-2xl bg-secondary/30 border border-white/5 backdrop-blur-sm relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex items-baseline gap-1 text-5xl md:text-7xl font-bold text-text mb-2 relative z-10">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-text to-text-muted">
          {value}
        </span>
        {suffix && <span className="text-3xl text-accent font-light">{suffix}</span>}
      </div>
      
      <h3 className="text-sm md:text-base font-mono text-accent uppercase tracking-wider text-center relative z-10">
        {label}
      </h3>
      
      {/* Decorative line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
};

export default MetricCard;
