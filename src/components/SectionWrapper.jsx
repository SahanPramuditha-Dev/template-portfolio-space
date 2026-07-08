import React from 'react';
import { motion } from 'framer-motion';

const SectionWrapper = ({ children, id, className }) => {
  return (
    <motion.section
      id={id}
      className={`py-12 md:py-24 relative z-10 ${className || ''}`}
      style={{ position: 'relative', contentVisibility: 'auto', contain: 'layout paint' }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1], // custom cubic-bezier — Apple-style ease-out
      }}
    >
      {children}
    </motion.section>
  );
};

export default SectionWrapper;
