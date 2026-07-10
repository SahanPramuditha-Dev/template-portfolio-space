import React from 'react';
import { motion } from 'framer-motion';

const PageLoader = ({ text = "Loading data...", subtext = "Establishing secure connection..." }) => {
  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center relative overflow-hidden text-text z-50">
      
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/10 via-primary to-primary opacity-50" />

      {/* Main Animated Loader */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Glowing Tech Spinner */}
        <div className="relative w-24 h-24 mb-10 flex items-center justify-center">
          {/* Outer Ring */}
          <motion.div
            className="absolute inset-0 rounded-full border border-accent/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          {/* Inner Glowing Ring */}
          <motion.div
            className="absolute inset-2 rounded-full border-t-2 border-r-2 border-accent drop-shadow-[0_0_12px_rgba(45,212,191,0.8)]"
            animate={{ rotate: -360 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />
          {/* Center Pulse */}
          <motion.div
            className="w-4 h-4 rounded-full bg-accent/80 drop-shadow-[0_0_8px_rgba(45,212,191,1)]"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Animated Text */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-2"
        >
          <h3 className="text-2xl md:text-3xl font-display font-bold text-white tracking-wide">
            {text}
          </h3>
          <p className="text-sm font-mono text-text-muted tracking-widest uppercase">
            {subtext}
          </p>
        </motion.div>

        {/* Progress Bar Line */}
        <div className="w-48 h-[1px] bg-white/10 mt-8 relative overflow-hidden rounded-full">
          <motion.div 
            className="absolute top-0 left-0 bottom-0 w-1/3 bg-accent shadow-[0_0_10px_rgba(45,212,191,0.5)]"
            animate={{ x: ["-100%", "300%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

      </div>
    </div>
  );
};

export default PageLoader;
