import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-0 overflow-hidden bg-primary pointer-events-none">
      {/* Base gradient layer matching original PageShell */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_40%),linear-gradient(180deg,rgba(2,6,23,1),rgba(15,23,42,1))]" />
      
      {/* Animated Orbs */}
      <motion.div
        animate={{
          x: ['0%', '10%', '-5%', '0%'],
          y: ['0%', '15%', '-10%', '0%'],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -top-[10%] -left-[10%] w-[45vw] h-[45vw] rounded-full bg-accent/20 blur-[100px] opacity-80"
      />
      
      <motion.div
        animate={{
          x: ['0%', '-15%', '10%', '0%'],
          y: ['0%', '-10%', '15%', '0%'],
          scale: [1, 0.8, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-[30%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-purple-500/15 blur-[100px] opacity-70"
      />
      
      <motion.div
        animate={{
          x: ['0%', '20%', '-20%', '0%'],
          y: ['0%', '-20%', '20%', '0%'],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-emerald-500/10 blur-[120px] opacity-60"
      />
    </div>
  );
};

export default AnimatedBackground;
