import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Zap, Award, ChevronDown } from 'lucide-react';
import { renderSimpleMarkdown } from '../../utils/markdown';

const ExpandingChallengeCard = ({ challenge, solution, result }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className="rounded-3xl border border-white/10 bg-secondary/20 overflow-hidden relative group hover:border-accent/30 transition-colors shadow-lg cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="p-6 md:p-8 space-y-4 relative z-10">
        
        {/* Challenge Header (Always visible) */}
        {challenge && (
          <div className="flex items-start justify-between gap-4">
             <div className="space-y-3 flex-1">
               <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-red-400">
                 <Target size={16} /> Challenge
               </h4>
               <div className="text-text-muted leading-relaxed font-sans line-clamp-3">
                 {renderSimpleMarkdown(challenge)}
               </div>
             </div>
             <div className={`p-2 rounded-full bg-white/5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                <ChevronDown size={20} className="text-text-muted group-hover:text-accent" />
             </div>
          </div>
        )}

        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-6 pt-4 border-t border-white/5"
            >
              {/* Full Challenge Text (if it was clamped) */}
              <div className="text-text-muted leading-relaxed font-sans border-l-2 border-red-500/30 pl-4">
                 {renderSimpleMarkdown(challenge)}
              </div>

              {/* Solution */}
              {solution && (
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-yellow-400">
                    <Zap size={16} /> Solution
                  </h4>
                  <div className="text-text-muted leading-relaxed font-sans border-l-2 border-yellow-500/30 pl-4">
                    {renderSimpleMarkdown(solution)}
                  </div>
                </div>
              )}

              {/* Result */}
              {result && (
                <div className="space-y-3 pt-2">
                   <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 flex items-start gap-3">
                     <Award size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                     <div>
                       <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">Result</h4>
                       <div className="text-emerald-100 font-medium">
                         {renderSimpleMarkdown(result)}
                       </div>
                     </div>
                   </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default ExpandingChallengeCard;
