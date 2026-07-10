import React from 'react';
import { Target, Zap, Award } from 'lucide-react';
import { renderSimpleMarkdown } from '../../utils/markdown';

const EngineeringChallengeCard = ({ challenge, solution, result }) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-secondary/20 overflow-hidden relative group hover:border-accent/30 transition-colors shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="p-6 md:p-8 space-y-6 relative z-10">
        
        {/* Challenge */}
        {challenge && (
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-red-400">
              <Target size={16} /> Challenge
            </h4>
            <div className="text-text-muted leading-relaxed font-sans border-l-2 border-red-500/30 pl-4">
              {renderSimpleMarkdown(challenge)}
            </div>
          </div>
        )}

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

      </div>
    </div>
  );
};

export default EngineeringChallengeCard;
