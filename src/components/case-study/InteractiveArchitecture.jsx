import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { User, Monitor, Server, Database, ArrowRight, ArrowLeft } from 'lucide-react';
import { renderSimpleMarkdown } from '../../utils/markdown';

const InteractiveArchitecture = ({ content }) => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 }
    }
  };

  const lineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { duration: 0.8, ease: "easeInOut" }
    }
  };

  const nodes = [
    { id: 'user', icon: User, label: 'User', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
    { id: 'frontend', icon: Monitor, label: 'Frontend', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30' },
    { id: 'backend', icon: Server, label: 'Backend', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
    { id: 'database', icon: Database, label: 'Database', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
  ];

  return (
    <div className="space-y-8" ref={containerRef}>
      {/* Animated Diagram */}
      <div className="relative rounded-3xl border border-white/10 bg-secondary/30 p-8 md:p-12 overflow-hidden backdrop-blur-md">
        
        {/* Subtle background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 max-w-4xl mx-auto"
        >
          {nodes.map((node, i) => (
            <React.Fragment key={node.id}>
              {/* Node */}
              <motion.div 
                variants={itemVariants}
                className="relative flex flex-col items-center gap-3 group"
              >
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border ${node.bg} ${node.border} backdrop-blur-sm group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(var(--color-accent-rgb),0.2)] transition-all duration-300`}>
                  <node.icon size={32} className={node.color} />
                </div>
                <span className="font-mono text-sm font-bold text-text-muted group-hover:text-text transition-colors">
                  {node.label}
                </span>
              </motion.div>

              {/* Connecting Line (hidden on mobile, SVG on desktop) */}
              {i < nodes.length - 1 && (
                <div className="hidden md:block flex-1 relative h-20 px-4">
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                    <motion.path
                      d="M 0 40 L 1000 40"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      fill="none"
                      vectorEffect="non-scaling-stroke"
                    />
                    <motion.path
                      variants={lineVariants}
                      d="M 0 40 L 1000 40"
                      stroke="rgb(var(--color-accent-rgb))"
                      strokeWidth="2"
                      fill="none"
                      vectorEffect="non-scaling-stroke"
                      className="drop-shadow-[0_0_8px_rgba(var(--color-accent-rgb),0.5)]"
                    />
                  </svg>
                  {/* Moving dot */}
                  <motion.div 
                    className="absolute top-[36px] left-0 w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_rgb(var(--color-accent-rgb))]"
                    initial={{ left: "0%", opacity: 0 }}
                    animate={isInView ? { 
                      left: ["0%", "100%", "0%"], 
                      opacity: [0, 1, 1, 0] 
                    } : {}}
                    transition={{ 
                      duration: 3, 
                      ease: "linear", 
                      repeat: Infinity,
                      delay: i * 0.5 + 1.5
                    }}
                  />
                </div>
              )}
              
              {/* Mobile down arrow */}
              {i < nodes.length - 1 && (
                <div className="md:hidden text-white/20">
                  <ArrowRight size={24} className="rotate-90" />
                </div>
              )}
            </React.Fragment>
          ))}
        </motion.div>
      </div>

      {/* Markdown Description */}
      {content && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-sans text-text-muted leading-relaxed max-w-4xl prose prose-invert prose-p:text-text-muted prose-headings:text-text prose-a:text-accent prose-code:bg-white/10 prose-code:text-accent prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded"
        >
          {renderSimpleMarkdown(content)}
        </motion.div>
      )}
    </div>
  );
};

export default InteractiveArchitecture;
