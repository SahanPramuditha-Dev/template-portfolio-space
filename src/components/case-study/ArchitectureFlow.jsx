import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

const ArchitectureFlow = ({ nodes = [] }) => {
  if (!nodes || nodes.length === 0) return null;

  return (
    <div className="flex flex-col items-center py-8">
      {nodes.map((node, index) => (
        <React.Fragment key={index}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            className="w-full max-w-md bg-secondary/30 border border-white/10 p-6 rounded-2xl backdrop-blur-sm text-center shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
            <h3 className="text-xl font-bold text-text mb-2 relative z-10">{node.name || node}</h3>
            {node.description && (
              <p className="text-text-muted text-sm relative z-10">{node.description}</p>
            )}
          </motion.div>
          
          {index < nodes.length - 1 && (
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              whileInView={{ opacity: 1, scaleY: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: (index * 0.15) + 0.1 }}
              className="h-12 w-px bg-gradient-to-b from-accent/50 to-transparent relative my-2 origin-top"
            >
              <ArrowDown size={14} className="absolute -bottom-2 -left-[6.5px] text-accent/50" />
            </motion.div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ArchitectureFlow;
