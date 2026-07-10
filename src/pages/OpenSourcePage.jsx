import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Github, Star, GitFork, Eye, Search, X,
  ChevronDown, BookOpen, Clock, Calendar, 
  Code2, Tag, Layers, Award, Terminal, 
  Sparkles, Wrench, ShieldAlert, Cpu, ArrowUpDown
} from 'lucide-react';
import SEO from '../components/SEO';
import PageShell from '../components/PageShell';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import ReadmeDrawer from '../components/ReadmeDrawer';
import GithubStats from '../components/GithubStats';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

const OpenSourcePage = () => {
  const { data: cmsDoc, loading: cmsLoading } = useCmsDoc(CMS_DOCS.openSource, { items: [] });
  const { data: siteDoc, loading: siteLoading } = useCmsDoc(CMS_DOCS.site, null);

  const [githubRepos, setGithubRepos] = useState([]);
  const [reposLoading, setReposLoading] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [sortBy, setSortBy] = useState('updated');

  const githubUsername = siteDoc?.githubUsername || 'SahanPramuditha-Dev';

  // 1. Fetch public repos from GitHub with localStorage caching
  useEffect(() => {
    if (siteLoading || !githubUsername) return;

    const fetchRepos = async () => {
      setReposLoading(true);
      const CACHE_KEY = `github_repos_${githubUsername}`;
      const CACHE_TIME_KEY = `github_repos_time_${githubUsername}`;
      const ONE_HOUR = 60 * 60 * 1000;

      try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
        const now = Date.now();

        if (cachedData && cachedTime && (now - parseInt(cachedTime, 10) < ONE_HOUR)) {
          setGithubRepos(JSON.parse(cachedData));
          setReposLoading(false);
          return;
        }

        const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?per_page=100&sort=updated`);
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        
        // Cache data
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(CACHE_TIME_KEY, now.toString());
        setGithubRepos(data);
      } catch (err) {
        console.warn('GitHub API fetch error, checking cache fallback:', err);
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          setGithubRepos(JSON.parse(cachedData));
        }
      } finally {
        setReposLoading(false);
      }
    };

    fetchRepos();
  }, [siteLoading, githubUsername]);

  // 2. Merge GitHub Repos with Firestore CMS Overrides & Manual Custom Repos
  const mergedRepos = useMemo(() => {
    const cmsItems = Array.isArray(cmsDoc?.items) ? cmsDoc.items : [];
    
    // Create a lookup map for CMS configuration
    const cmsLookup = {};
    const matchedCmsNames = new Set();
    cmsItems.forEach(item => {
      if (item.name) {
        cmsLookup[item.name.toLowerCase().trim()] = item;
      }
    });

    // Process repositories fetched from GitHub
    const githubProcessed = githubRepos.map(repo => {
      const nameKey = repo.name.toLowerCase().trim();
      const override = cmsLookup[nameKey];

      if (override) {
        matchedCmsNames.add(nameKey);
      }

      // Overrides
      const hidden = override?.hidden === true;
      const pinned = override?.pinned === true;
      const category = override?.category || (repo.archived ? 'Archived' : 'Other');
      
      let status = override?.status || 'Active';
      if (repo.archived) status = 'Archived';

      const difficulty = override?.difficulty && override.difficulty !== 'None' ? override.difficulty : null;
      const description = override?.customDescription || repo.description || 'No description provided.';

      return {
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description,
        url: repo.html_url,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        watchers: repo.watchers_count,
        language: repo.language || 'Markdown',
        topics: repo.topics || [],
        updatedAt: repo.pushed_at || repo.updated_at,
        createdAt: repo.created_at,
        archived: repo.archived,
        
        hidden,
        pinned,
        category,
        status,
        difficulty,
        isManual: false
      };
    });

    // Process CMS items NOT found on GitHub (Custom Manual Repos)
    const manualProcessed = cmsItems.filter(item => {
      if (!item.name) return false;
      return !matchedCmsNames.has(item.name.toLowerCase().trim());
    }).map(item => {
      return {
        id: `manual_${item.name}`,
        name: item.name,
        fullName: item.name,
        description: item.customDescription || item.description || 'No description provided.',
        url: item.repository || '',
        stars: item.stars || 0,
        forks: item.forks || 0,
        watchers: item.watchers || 0,
        language: item.language || 'Other',
        topics: item.topics || [],
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        archived: item.status === 'Archived',
        
        hidden: item.hidden === true,
        pinned: item.pinned === true,
        category: item.category || 'Other',
        status: item.status || 'Active',
        difficulty: item.difficulty !== 'None' ? item.difficulty : null,
        isManual: true
      };
    });

    // Merge both and filter out hidden repositories
    return [...githubProcessed, ...manualProcessed].filter(repo => !repo.hidden);
  }, [githubRepos, cmsDoc]);

  // 3. Extract Categories & Languages list dynamically
  const categoriesList = useMemo(() => {
    const cats = new Set(['All']);
    mergedRepos.forEach(r => {
      if (r.category) cats.add(r.category);
    });
    return Array.from(cats);
  }, [mergedRepos]);

  const languagesList = useMemo(() => {
    const langs = new Set(['All']);
    mergedRepos.forEach(r => {
      if (r.language) langs.add(r.language);
    });
    return Array.from(langs);
  }, [mergedRepos]);

  // 4. Filter and Sort Repositories
  const filteredAndSortedRepos = useMemo(() => {
    let result = [...mergedRepos];

    // Search query matching
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(r => 
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.language.toLowerCase().includes(q) ||
        r.topics.some(t => t.toLowerCase().includes(q))
      );
    }

    // Category filtering
    if (selectedCategory !== 'All') {
      result = result.filter(r => r.category === selectedCategory);
    }

    // Language filtering
    if (selectedLanguage !== 'All') {
      result = result.filter(r => r.language === selectedLanguage);
    }

    // Sorting logic
    result.sort((a, b) => {
      // Pinned repositories always float to the top
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      if (sortBy === 'stars') {
        return b.stars - a.stars;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      // Default: pushed/updated time
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

    return result;
  }, [mergedRepos, searchQuery, selectedCategory, selectedLanguage, sortBy]);

  // 5. Calculate repository stats
  const stats = useMemo(() => {
    let totalStars = 0;
    let totalForks = 0;
    const languages = new Set();
    let featuredCount = 0;

    mergedRepos.forEach(r => {
      totalStars += r.stars;
      totalForks += r.forks;
      if (r.language) languages.add(r.language);
      if (r.category === 'Featured') featuredCount++;
    });

    return {
      reposCount: mergedRepos.length,
      starsCount: totalStars,
      forksCount: totalForks,
      languagesCount: languages.size,
      featuredCount
    };
  }, [mergedRepos]);

  const getStatusBadgeStyles = (status) => {
    switch (status) {
      case 'Active':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Maintenance':
        return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'Learning':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'Archived':
        return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
      default:
        return 'text-red-400 bg-red-400/10 border-red-400/20';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Featured':
        return <Sparkles size={13} className="text-amber-300" />;
      case 'University':
        return <Award size={13} className="text-blue-400" />;
      case 'Learning':
        return <Layers size={13} className="text-teal-400" />;
      case 'Security':
        return <ShieldAlert size={13} className="text-red-400" />;
      case 'AI':
        return <Cpu size={13} className="text-purple-400" />;
      default:
        return <Terminal size={13} className="text-slate-400" />;
    }
  };

  return (
    <>
      <SEO
        title="Open Source Explorer | Sahan Pramuditha"
        description="Explore Sahan's open-source projects, labs, assignments, and contributions loaded directly from GitHub."
        canonicalPath="/opensource"
      />
      <PageShell
        eyebrow="Open Source Explorer"
        title="Developer Repositories & OSS Presence"
        description="A real-time snapshot of my public codebases, university coursework, security research, and tutorial learning logs synced via GitHub API."
      >
        {/* STATS HEADER */}
        {!reposLoading && (
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-5 gap-4"
          >
            <div className="bg-secondary/20 border border-white/5 p-5 rounded-2xl backdrop-blur-sm flex flex-col justify-center text-center">
              <span className="text-2xl sm:text-3xl font-bold font-display text-white">{stats.reposCount}</span>
              <span className="text-[10px] text-text-muted uppercase tracking-wider font-mono mt-1">Repositories</span>
            </div>
            <div className="bg-secondary/20 border border-white/5 p-5 rounded-2xl backdrop-blur-sm flex flex-col justify-center text-center">
              <span className="text-2xl sm:text-3xl font-bold font-display text-amber-300">{stats.starsCount}</span>
              <span className="text-[10px] text-text-muted uppercase tracking-wider font-mono mt-1">Total Stars</span>
            </div>
            <div className="bg-secondary/20 border border-white/5 p-5 rounded-2xl backdrop-blur-sm flex flex-col justify-center text-center">
              <span className="text-2xl sm:text-3xl font-bold font-display text-accent">{stats.forksCount}</span>
              <span className="text-[10px] text-text-muted uppercase tracking-wider font-mono mt-1">Total Forks</span>
            </div>
            <div className="bg-secondary/20 border border-white/5 p-5 rounded-2xl backdrop-blur-sm flex flex-col justify-center text-center">
              <span className="text-2xl sm:text-3xl font-bold font-display text-purple-400">{stats.featuredCount}</span>
              <span className="text-[10px] text-text-muted uppercase tracking-wider font-mono mt-1">Featured Projects</span>
            </div>
            <div className="bg-secondary/20 border border-white/5 p-5 rounded-2xl backdrop-blur-sm flex flex-col justify-center text-center col-span-2 md:col-span-1">
              <span className="text-2xl sm:text-3xl font-bold font-display text-teal-400">{stats.languagesCount}</span>
              <span className="text-[10px] text-text-muted uppercase tracking-wider font-mono mt-1">Languages</span>
            </div>
          </motion.div>
        )}

        {/* CONTRIBUTION GRAPH */}
        <GithubStats username={githubUsername} onlyHeatmap={true} />

        {/* TOOLBAR */}
        <div className="space-y-6">
          {/* Search & Sort Split Grid */}
          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr] items-stretch">
            {/* Search Input Box */}
            <div className="rounded-2xl border border-white/10 bg-secondary/20 p-3 sm:p-4 backdrop-blur-md h-full flex flex-col justify-center">
              <label className="sr-only" htmlFor="repo-search">
                Search repositories
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-secondary/50 bg-primary/50 px-4 py-3">
                <Search size={18} className="text-accent shrink-0" />
                <input
                  id="repo-search"
                  type="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search title, description, language, tags, stacks..."
                  className="w-full bg-transparent text-text placeholder:text-text-muted outline-none text-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-text-muted hover:text-accent transition-colors"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Sort Switcher Box */}
            <div className="rounded-2xl border border-white/10 bg-secondary/20 p-3 sm:p-4 backdrop-blur-md h-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-text shrink-0">
                <ArrowUpDown size={16} className="text-accent shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">Sort timeline</span>
                <span className="sm:hidden whitespace-nowrap">Sort</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'updated', label: 'Updated' },
                  { value: 'stars', label: 'Stars' },
                  { value: 'name', label: 'A-Z' },
                  { value: 'newest', label: 'Newest' }
                ].map(opt => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-mono transition-colors border ${
                      sortBy === opt.value
                        ? 'bg-accent/15 text-accent border-accent/30 font-semibold'
                        : 'bg-primary/50 text-text-muted border-secondary/40 hover:border-accent/25 hover:text-text'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Categories & Languages Row */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Category selection */}
            <div>
              <div className="mb-2.5 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.14em] text-text-muted select-none">
                <Layers size={14} className="text-accent" />
                Category
              </div>
              <div className="flex flex-wrap gap-2.5">
                {categoriesList.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full px-4 py-2 text-xs font-mono transition-all duration-300 border ${
                      selectedCategory === cat
                        ? 'bg-accent text-primary font-bold shadow-lg shadow-accent/25 border-accent'
                        : 'border-secondary/50 bg-secondary/30 text-text-muted hover:border-accent/40 hover:text-text'
                    }`}
                  >
                    {cat === 'All' ? 'All categories' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Language filter */}
            <div>
              <div className="mb-2.5 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.14em] text-text-muted select-none">
                <Code2 size={14} className="text-accent" />
                Language Filter
              </div>
              <div className="relative inline-block w-full max-w-[240px]">
                <select
                  value={selectedLanguage}
                  onChange={e => setSelectedLanguage(e.target.value)}
                  className="w-full bg-secondary/30 border border-secondary/50 px-4 py-2 rounded-full text-xs font-mono text-text focus:outline-none focus:border-accent cursor-pointer appearance-none pr-8"
                >
                  {languagesList.map(lang => (
                    <option key={lang} value={lang} className="bg-primary text-text">{lang === 'All' ? 'All Languages' : lang}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-text-muted">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* REPOSITORIES GRID CONTAINER WRAPPER */}
        <div className="w-full">
          {/* LOADING STATE */}
          {reposLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-text-muted gap-4">
              <Loader2 className="animate-spin text-accent" size={36} />
              <span className="text-sm font-mono tracking-wider">Syncing GitHub repositories...</span>
            </div>
          ) : filteredAndSortedRepos.length === 0 ? (
            <div className="rounded-3xl border border-white/5 bg-secondary/10 px-6 py-20 text-center text-text-muted font-medium">
              No repositories found matching current filter queries.
            </div>
          ) : (
          /* REPOSITORY GRID */
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid gap-6 md:grid-cols-2"
          >
            {filteredAndSortedRepos.map((repo, idx) => (
              <motion.div
                key={repo.id}
                variants={fadeUp}
                className="relative rounded-3xl border border-white/10 bg-secondary/20 p-6 backdrop-blur-sm hover:border-white/20 transition-all flex flex-col group shadow-lg"
              >
                {/* Pinned Badge */}
                {repo.pinned && (
                  <div className="absolute top-4 right-4 bg-accent/20 border border-accent/40 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold text-accent uppercase tracking-wider">
                    📌 Pinned
                  </div>
                )}

                {/* Category & Status Row */}
                <div className="flex flex-wrap gap-2 items-center mb-4 text-left">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-white/70 bg-white/5 border border-white/10 px-2 py-1 rounded-md">
                    {getCategoryIcon(repo.category)}
                    {repo.category}
                  </span>
                  <span className={`text-[10px] font-mono font-bold border px-2 py-0.5 rounded-md ${getStatusBadgeStyles(repo.status)}`}>
                    {repo.status === 'Active' ? '🟢' : repo.status === 'Maintenance' ? '🟡' : repo.status === 'Learning' ? '🔵' : '⚫'} {repo.status}
                  </span>
                  {repo.difficulty && (
                    <span className="text-[10px] font-mono text-purple-400 bg-purple-400/10 border border-purple-400/20 px-2 py-0.5 rounded-md">
                      🎓 {repo.difficulty}
                    </span>
                  )}
                  {repo.isManual && (
                    <span className="text-[9px] font-mono text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-1.5 py-0.5 rounded-md uppercase tracking-wider font-bold">
                      CMS Manual
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-2 leading-tight flex items-center gap-2 group-hover:text-accent transition-colors text-left">
                  <Github size={18} className="text-text-muted shrink-0" />
                  {repo.name}
                </h3>

                {/* Description */}
                <p className="text-sm leading-relaxed text-slate-300 mb-6 flex-grow text-left">
                  {repo.description}
                </p>

                {/* Topics / Tag Badges */}
                {repo.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {repo.topics.slice(0, 4).map(topic => (
                      <span key={topic} className="text-[9px] font-mono font-semibold text-text-muted bg-white/[0.02] border border-white/5 px-2 py-0.5 rounded">
                        #{topic}
                      </span>
                    ))}
                    {repo.topics.length > 4 && (
                      <span className="text-[9px] font-mono text-white/50 px-1 py-0.5">
                        +{repo.topics.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                {/* Stats & Actions Footer */}
                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1 text-[11px] font-medium text-slate-200">
                      <span className="w-2 h-2 rounded-full bg-accent inline-block" /> {repo.language}
                    </span>
                    <span className="flex items-center gap-1 hover:text-amber-300 transition-colors">
                      <Star size={13} className="text-amber-400" /> {repo.stars}
                    </span>
                    <span className="flex items-center gap-1 hover:text-accent transition-colors">
                      <GitFork size={13} className="text-accent" /> {repo.forks}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedRepo(repo)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline bg-accent/5 hover:bg-accent/15 px-3 py-1.5 rounded-xl border border-accent/25 transition-colors"
                    >
                      <BookOpen size={13} /> DETAILS
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
        </div>
      </PageShell>

      {/* Loader indicator for background task */}
      {reposLoading && (
        <div className="fixed bottom-4 right-4 z-40 bg-secondary/80 backdrop-blur border border-white/10 px-3 py-2 rounded-xl text-[10px] font-mono text-text flex items-center gap-2 shadow-lg animate-pulse">
          <Loader2 size={12} className="animate-spin text-accent" /> Syncing GitHub...
        </div>
      )}

      {/* Inline README drawer */}
      <ReadmeDrawer
        isOpen={selectedRepo !== null}
        onClose={() => setSelectedRepo(null)}
        repoName={selectedRepo?.name}
        githubUsername={githubUsername}
        repoUrl={selectedRepo?.url}
        isManual={selectedRepo?.isManual}
        repoDetails={selectedRepo}
      />
    </>
  );
};

// Loader spinner icon since it is not imported from lucide-react in page scope
const Loader2 = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`${className}`}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default OpenSourcePage;
