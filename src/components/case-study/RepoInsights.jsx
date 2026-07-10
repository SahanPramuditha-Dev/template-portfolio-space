import React from 'react';
import { GitBranch, Code2, FolderTree, ShieldCheck } from 'lucide-react';
import { renderSimpleMarkdown } from '../../utils/markdown';

const RepoInsights = ({ content }) => {
  if (!content) return null;

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-secondary/30 to-black/40 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      <div className="border-b border-white/5 bg-white/5 p-4 md:px-8 flex flex-wrap items-center gap-6 text-text-muted text-sm font-mono">
        <div className="flex items-center gap-2"><FolderTree size={16} className="text-accent"/> Folder Structure</div>
        <div className="flex items-center gap-2"><GitBranch size={16} className="text-accent"/> Branch Strategy</div>
        <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-accent"/> Code Quality</div>
        <div className="flex items-center gap-2"><Code2 size={16} className="text-accent"/> CI/CD</div>
      </div>
      <div className="p-6 md:p-8 font-sans text-text-muted leading-relaxed max-w-4xl prose prose-invert prose-p:text-text-muted prose-headings:text-text prose-a:text-accent prose-code:bg-white/10 prose-code:text-accent prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
         {renderSimpleMarkdown(content)}
      </div>
    </div>
  );
};

export default RepoInsights;
