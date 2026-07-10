import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ExternalLink, Loader2, BookOpen, 
  Info, Users, Code, Calendar, Star, 
  GitFork, Eye, GitPullRequest, ShieldAlert, Sparkles
} from 'lucide-react';
import { slugify } from '../utils/slugify';

const parseMarkdown = (markdown) => {
  if (!markdown) return '';
  
  // Normalize line endings to prevent Windows \r\n issues
  let html = markdown
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  // Escape HTML to prevent XSS
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const codeBlocks = [];
  const inlineCodes = [];

  // 1. Extract Code blocks: ```js ... ```
  html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
    const placeholder = `__CODEBLOCK_PLACEHOLDER_${codeBlocks.length}__`;
    codeBlocks.push(`<pre class="bg-primary/50 border border-white/10 rounded-xl p-4 my-4 overflow-x-auto font-mono text-xs text-slate-300"><code>${code.trim()}</code></pre>`);
    return placeholder;
  });

  // 2. Extract Inline code: `code` (restricting to single line to prevent leakages)
  html = html.replace(/`([^`\n]+)`/g, (match, code) => {
    const placeholder = `__INLINECODE_PLACEHOLDER_${inlineCodes.length}__`;
    inlineCodes.push(`<code class="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-mono text-xs text-accent">${code}</code>`);
    return placeholder;
  });

  // 3. Headings
  html = html.replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-bold font-display text-white mt-8 mb-4 border-b border-white/10 pb-2">$1</h1>');
  html = html.replace(/^## (.*?)$/gm, '<h2 class="text-xl font-bold font-display text-white mt-6 mb-3 border-b border-white/5 pb-1">$1</h2>');
  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-lg font-bold text-white mt-5 mb-2">$1</h3>');
  html = html.replace(/^#### (.*?)$/gm, '<h4 class="text-base font-bold text-slate-300 mt-4 mb-2">$1</h4>');

  // 4. Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>');

  // 5. Images: ![alt](url) (MUST run before link parser)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-xl my-4 border border-white/5 shadow-md inline-block" />');

  // 6. Bullet Lists
  html = html.replace(/^\s*[-*]\s+(.*?)$/gm, '<li class="ml-6 list-disc text-sm text-slate-300 mb-1.5">$1</li>');

  // 7. Numbered Lists
  html = html.replace(/^\s*\d+\.\s+(.*?)$/gm, '<li class="ml-6 list-decimal text-sm text-slate-300 mb-1.5">$1</li>');

  // 8. Blockquotes: > quote
  html = html.replace(/^>\s+(.*?)$/gm, '<blockquote class="border-l-4 border-accent/60 bg-white/5 pl-4 pr-2 py-2 my-4 rounded-r-lg text-slate-400 italic font-mono text-xs">$1</blockquote>');

  // 9. Horizontal Rules
  html = html.replace(/^---$/gm, '<hr class="border-white/10 my-6" />');

  // 10. Links: [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline inline-flex items-center gap-1">$1</a>');

  // 11. Paragraphs
  html = html.split(/\n{2,}/).map(paragraph => {
    const trimmed = paragraph.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h') || trimmed.startsWith('<li') || trimmed.startsWith('<pre') || trimmed.startsWith('<blockquote') || trimmed.startsWith('<hr') || trimmed.startsWith('<img') || trimmed.startsWith('__CODEBLOCK_')) {
      return trimmed;
    }
    return `<p class="text-sm leading-relaxed text-slate-300 mb-4">${trimmed.replace(/\n/g, '<br />')}</p>`;
  }).join('\n');

  // 12. Restore Inline Code Placeholders
  inlineCodes.forEach((val, i) => {
    html = html.replaceAll(`__INLINECODE_PLACEHOLDER_${i}__`, val);
  });

  // 13. Restore Code Block Placeholders
  codeBlocks.forEach((val, i) => {
    html = html.replaceAll(`__CODEBLOCK_PLACEHOLDER_${i}__`, val);
  });

  return html;
};

const ReadmeDrawer = ({ isOpen, onClose, repoName, githubUsername, repoUrl, isManual, repoDetails, projectsList = [] }) => {
  const [readme, setReadme] = useState('');
  const [languages, setLanguages] = useState(null);
  const [contributors, setContributors] = useState(null);
  
  const [activeTab, setActiveTab] = useState('readme'); // readme, overview, languages, contributors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const matchingProject = useMemo(() => {
    if (!projectsList || !repoDetails || !repoDetails.name) return null;
    return projectsList.find(proj => {
      if (!proj.github || proj.status === 'Draft') return false;
      const projRepoName = proj.github.split('/').filter(Boolean).pop()?.toLowerCase();
      return projRepoName === repoDetails.name.toLowerCase();
    });
  }, [projectsList, repoDetails]);

  // Handle escape key and focus trap for accessibility
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Save active element to restore it on close
    const activeElement = document.activeElement;
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (activeElement && activeElement.focus) {
        activeElement.focus();
      }
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const drawerElement = document.getElementById('readme-drawer-container');
    if (!drawerElement) return;

    // Find all focusable elements inside the drawer
    const focusableElements = drawerElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length === 0) return;
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleFocusTrap = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else { // Tab
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    };

    drawerElement.addEventListener('keydown', handleFocusTrap);

    // Automatically focus the first element (the close button) when opened
    firstFocusable.focus();

    return () => {
      drawerElement.removeEventListener('keydown', handleFocusTrap);
    };
  }, [isOpen]);

  // Trigger data fetches on open
  useEffect(() => {
    if (!isOpen || !repoName) return;

    setActiveTab('readme');
    setReadme('');
    setLanguages(null);
    setContributors(null);
    setError(false);

    if (isManual) {
      setLoading(false);
      return;
    }

    const fetchReadme = async () => {
      setLoading(true);
      setError(false);
      let fetched = false;

      // Try main then master branches
      const branches = ['main', 'master'];
      for (const branch of branches) {
        try {
          const url = `https://raw.githubusercontent.com/${githubUsername}/${repoName}/${branch}/README.md`;
          const res = await fetch(url);
          if (res.ok) {
            const text = await res.text();
            setReadme(text);
            fetched = true;
            break;
          }
        } catch (err) {
          console.warn(err);
        }
      }

      setLoading(false);
      if (!fetched) setError(true);
    };

    const fetchExtraDetails = async () => {
      try {
        // Fetch languages
        const langRes = await fetch(`https://api.github.com/repos/${githubUsername}/${repoName}/languages`);
        if (langRes.ok) {
          const langData = await langRes.json();
          setLanguages(langData);
        }

        // Fetch contributors
        const contribRes = await fetch(`https://api.github.com/repos/${githubUsername}/${repoName}/contributors?per_page=12`);
        if (contribRes.ok) {
          const contribData = await contribRes.json();
          setContributors(contribData);
        }
      } catch (err) {
        console.warn('Failed to fetch auxiliary repo stats:', err);
      }
    };

    fetchReadme();
    fetchExtraDetails();
  }, [isOpen, repoName, githubUsername, isManual]);

  // Handle ESC close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Disable body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Compute language breakdown
  const languageBreakdown = useMemo(() => {
    if (!languages) return [];
    const total = Object.values(languages).reduce((sum, val) => sum + val, 0);
    return Object.entries(languages).map(([name, val]) => ({
      name,
      percentage: ((val / total) * 100).toFixed(1),
      value: val
    }));
  }, [languages]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-primary/75 backdrop-blur-md"
          />

          {/* Drawer container */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              id="readme-drawer-container"
              role="dialog"
              aria-modal="true"
              aria-labelledby="readme-drawer-title"
              className="w-screen max-w-2xl bg-[#070b13]/95 border-l border-white/10 backdrop-blur-xl flex flex-col shadow-[-10px_0_40px_rgba(0,0,0,0.5)] h-screen overflow-hidden text-left"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/25 flex items-center justify-center text-accent">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 id="readme-drawer-title" className="text-lg font-bold text-white leading-none mb-1">{repoName}</h3>
                    <p className="text-xs text-text-muted">
                      {isManual ? 'Custom Database Project' : 'Syncing GitHub Repository'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isManual && repoUrl && (
                    <a
                      href={repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl border border-white/10 hover:border-accent/40 text-text-muted hover:text-accent bg-white/5 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                    >
                      GitHub <ExternalLink size={13} />
                    </a>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl border border-white/10 hover:border-white/20 text-text-muted hover:text-white bg-white/5 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* TABS SELECTOR */}
              <div className="flex px-6 border-b border-white/5 bg-white/[0.005] overflow-x-auto scrollbar-none gap-2 py-2">
                {[
                  { id: 'readme', label: 'README.md', icon: BookOpen, disabled: isManual || error },
                  { id: 'overview', label: 'Overview', icon: Info },
                  { id: 'languages', label: 'Languages', icon: Code, disabled: isManual || !languages },
                  { id: 'contributors', label: 'Contributors', icon: Users, disabled: isManual || !contributors },
                ].map(tab => (
                  <button
                    key={tab.id}
                    disabled={tab.disabled}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      tab.disabled 
                        ? 'opacity-30 cursor-not-allowed border-transparent text-slate-600'
                        : activeTab === tab.id
                        ? 'bg-accent/10 border-accent/30 text-accent'
                        : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <tab.icon size={13} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6" data-lenis-prevent>
                
                {matchingProject && (
                  <div className="mb-6 p-4 rounded-2xl border border-accent/30 bg-accent/5 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-accent uppercase tracking-wider">
                        <Sparkles size={12} className="animate-pulse" />
                        Featured Portfolio Project
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        {matchingProject.title} — Case Study is available!
                      </h4>
                      <p className="text-xs text-text-muted">
                        Read the detailed system architecture, engineering dilemmas, and lessons learned.
                      </p>
                    </div>
                    <a
                      href={`/projects/${slugify(matchingProject.slug || matchingProject.id || matchingProject.title || matchingProject.missionCode)}`}
                      className="shrink-0 px-4 py-2 rounded-xl bg-accent text-primary font-bold text-xs hover:shadow-lg hover:shadow-accent/25 hover:scale-105 transition-all text-center"
                    >
                      Read Case Study
                    </a>
                  </div>
                )}
                
                {/* TAB 1: README */}
                {activeTab === 'readme' && (
                  <>
                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-20 text-text-muted gap-3">
                        <Loader2 size={32} className="animate-spin text-accent" />
                        <span className="text-sm font-mono tracking-wider">Fetching README.md…</span>
                      </div>
                    ) : error ? (
                      <div className="text-center py-16 border border-white/5 bg-white/[0.01] rounded-2xl p-6">
                        <h4 className="text-base font-bold text-white mb-2">No README found</h4>
                        <p className="text-sm text-text-muted mb-6 leading-relaxed max-w-sm mx-auto">
                          Could not fetch the README.md document from GitHub.
                        </p>
                        <button
                          onClick={() => setActiveTab('overview')}
                          className="px-5 py-2.5 rounded-xl bg-accent/10 border border-accent/25 text-accent font-bold text-sm hover:bg-accent/25 transition-colors inline-flex items-center gap-2"
                        >
                          View Repository Overview
                        </button>
                      </div>
                    ) : (
                      <div 
                        className="prose prose-invert max-w-none text-slate-300 pb-12"
                        dangerouslySetInnerHTML={{ __html: parseMarkdown(readme) }}
                      />
                    )}
                  </>
                )}

                {/* TAB 2: OVERVIEW */}
                {activeTab === 'overview' && repoDetails && (
                  <div className="space-y-6 pb-12">
                    {/* General Metadata */}
                    <div className="bg-secondary/10 border border-white/5 rounded-2xl p-5">
                      <h4 className="text-xs font-mono font-bold text-accent uppercase tracking-wider mb-4">Project Overview</h4>
                      <p className="text-sm text-slate-300 mb-6 leading-relaxed">{repoDetails.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <Star size={16} className="text-amber-300 shrink-0" />
                          <div>
                            <div className="text-[10px] text-text-muted uppercase tracking-wider font-mono">Stars</div>
                            <div className="text-sm font-bold text-text">{repoDetails.stars}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <GitFork size={16} className="text-accent shrink-0" />
                          <div>
                            <div className="text-[10px] text-text-muted uppercase tracking-wider font-mono">Forks</div>
                            <div className="text-sm font-bold text-text">{repoDetails.forks}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Eye size={16} className="text-slate-400 shrink-0" />
                          <div>
                            <div className="text-[10px] text-text-muted uppercase tracking-wider font-mono">Watchers</div>
                            <div className="text-sm font-bold text-text">{repoDetails.watchers}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar size={16} className="text-purple-400 shrink-0" />
                          <div>
                            <div className="text-[10px] text-text-muted uppercase tracking-wider font-mono">Last Pushed</div>
                            <div className="text-xs font-bold text-text">{new Date(repoDetails.updatedAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Classifications overrides */}
                    <div className="bg-secondary/10 border border-white/5 rounded-2xl p-5 grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] text-text-muted uppercase tracking-wider font-mono mb-1">Maturity / Difficulty</div>
                        <span className="inline-block text-xs font-mono text-purple-400 bg-purple-400/10 border border-purple-400/20 px-2 py-1 rounded-md">
                          {repoDetails.difficulty || 'Not Specifed'}
                        </span>
                      </div>
                      <div>
                        <div className="text-[10px] text-text-muted uppercase tracking-wider font-mono mb-1">Development Status</div>
                        <span className="inline-block text-xs font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded-md">
                          {repoDetails.status}
                        </span>
                      </div>
                      <div>
                        <div className="text-[10px] text-text-muted uppercase tracking-wider font-mono mb-1">Category Classification</div>
                        <span className="inline-block text-xs font-mono text-white/70 bg-white/5 border border-white/10 px-2 py-1 rounded-md">
                          {repoDetails.category}
                        </span>
                      </div>
                      <div>
                        <div className="text-[10px] text-text-muted uppercase tracking-wider font-mono mb-1">Source Model</div>
                        <span className="inline-block text-xs font-mono text-accent bg-accent/10 border border-accent/25 px-2 py-1 rounded-md">
                          {isManual ? 'Manual CMS Document' : 'Synchronized GitHub Sync'}
                        </span>
                      </div>
                    </div>

                    {/* Topics list */}
                    {repoDetails.topics && repoDetails.topics.length > 0 && (
                      <div className="bg-secondary/10 border border-white/5 rounded-2xl p-5">
                        <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">Associated Topics</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {repoDetails.topics.map(t => (
                            <span key={t} className="text-xs font-mono text-text-muted bg-white/[0.01] border border-white/5 px-2.5 py-1 rounded-lg">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: LANGUAGES */}
                {activeTab === 'languages' && languages && (
                  <div className="space-y-4 pb-12">
                    <h4 className="text-xs font-mono font-bold text-accent uppercase tracking-wider mb-4">Codebase Language Breakdown</h4>
                    {Object.keys(languages).length === 0 ? (
                      <p className="text-sm text-text-muted">No language data found.</p>
                    ) : (
                      <div className="space-y-4 bg-secondary/10 border border-white/5 rounded-2xl p-6">
                        {(() => {
                          const total = Object.values(languages).reduce((sum, v) => sum + v, 0);
                          return Object.entries(languages).map(([name, val]) => {
                            const pct = ((val / total) * 100).toFixed(1);
                            return (
                              <div key={name} className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs font-mono">
                                  <span className="text-white font-bold">{name}</span>
                                  <span className="text-text-muted">{pct}% ({Math.round(val / 1024)} KB)</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-accent rounded-full shadow-[0_0_10px_rgba(56,189,248,0.5)]" 
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: CONTRIBUTORS */}
                {activeTab === 'contributors' && contributors && (
                  <div className="space-y-4 pb-12">
                    <h4 className="text-xs font-mono font-bold text-accent uppercase tracking-wider mb-4">Code Contributors</h4>
                    {contributors.length === 0 ? (
                      <div className="text-center py-10 text-text-muted text-sm">No external contributors listed.</div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {contributors.map(c => (
                          <a
                            key={c.id}
                            href={c.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-2xl border border-white/5 bg-secondary/10 hover:border-white/10 hover:bg-secondary/20 transition-all group"
                          >
                            <img 
                              src={c.avatar_url} 
                              alt={c.login} 
                              className="w-8 h-8 rounded-full border border-white/10 group-hover:border-accent/40"
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white truncate group-hover:text-accent transition-colors">{c.login}</div>
                              <div className="text-[10px] text-text-muted font-mono">{c.contributions} commits</div>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};



export default ReadmeDrawer;
