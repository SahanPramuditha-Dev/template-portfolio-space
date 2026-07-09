import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const GlowCard = ({ children, className, glowColor = 'rgba(56,189,248,0.2)', index = 0, style }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <motion.article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ 
        duration: 0.45, 
        delay: index * 0.05,
        scale: { type: 'spring', stiffness: 400, damping: 25 },
        y: { type: 'spring', stiffness: 400, damping: 25 }
      }}
      className={`relative rounded-3xl border border-white/10 bg-secondary/30 backdrop-blur-xl overflow-hidden group ${className}`}
      style={style}
    >
      {/* Magnetic Glow Effect */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 rounded-3xl"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${glowColor}, transparent 40%)`,
        }}
      />
      {/* Content wrapper */}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </motion.article>
  );
};

export default GlowCard;
