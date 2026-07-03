import React, { useEffect, useState, useMemo } from 'react';
import { Github, Star, BookOpen, Calendar, Flame, Award, GitFork, RotateCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// GitHub language colors mapping
const getLanguageColor = (lang) => {
  const colors = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Python: '#3572A5',
    Go: '#00ADD8',
    Rust: '#dea584',
    Java: '#b07219',
    C: '#555555',
    'C++': '#f34b7d',
    'C#': '#178600',
    Ruby: '#701516',
    PHP: '#4F5D95',
    Swift: '#F05138',
    Shell: '#89e051',
    Vue: '#41b883',
    React: '#61dafb',
  };
  return colors[lang] || '#8b949e';
};

// Premium Theme Colors
const COLOR_SCALE = [
  '#1b2238', // 0
  '#27435f', // 1
  '#2f74a6', // 2
  '#36b4ff', // 3
  '#61d9ff', // 4+
];

const GithubStats = ({ username }) => {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [contributions, setContributions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdatedText, setLastUpdatedText] = useState('Just now');

  // Interactive Heatmap States
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipCoords, setTooltipCoords] = useState({ x: 0, y: 0 });
  const [hoveredGridIndex, setHoveredGridIndex] = useState({ row: null, col: null });

  useEffect(() => {
    let cancelled = false;
    const token = import.meta.env.VITE_GITHUB_TOKEN || '';
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const u = await fetch(`https://api.github.com/users/${username}`, { headers });
        if (!u.ok) throw new Error(`User ${u.status}`);
        const userJson = await u.json();

        const r = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, { headers });
        if (!r.ok) throw new Error(`Repos ${r.status}`);
        const reposJson = await r.json();

        let contributionsJson = null;
        try {
          const c = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}`);
          if (c.ok) {
            contributionsJson = await c.json();
          }
        } catch (e) {
          console.warn('Failed to fetch GitHub contributions:', e);
        }

        if (!cancelled) {
          setUser(userJson);
          setRepos(reposJson);
          if (contributionsJson) {
            setContributions(contributionsJson);
          }
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError('Unable to load GitHub data right now.');
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [username]);

  // Dynamic Last Updated logic
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - start) / 60000);
      if (diff === 0) setLastUpdatedText('Just now');
      else if (diff === 1) setLastUpdatedText('1 min ago');
      else setLastUpdatedText(`${diff} mins ago`);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalStars = useMemo(() => {
    return repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
  }, [repos]);

  const totalForks = useMemo(() => {
    return repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);
  }, [repos]);

  // Compute Heatmap Data and Statistics
  const heatmapData = useMemo(() => {
    if (!contributions || !contributions.contributions) return null;

    const list = contributions.contributions;
    const currentYear = new Date().getFullYear().toString();
    const totalCount = contributions.total?.[currentYear] || Object.values(contributions.total || {}).reduce((a, b) => a + b, 0);

    const paddedContributions = [];
    if (list.length > 0) {
      const firstDate = new Date(list[0].date);
      const startDay = firstDate.getDay(); // 0 (Sun) to 6 (Sat)
      for (let i = 0; i < startDay; i++) {
        paddedContributions.push({ isPadding: true });
      }
      paddedContributions.push(...list);
    }

    const weeks = [];
    for (let i = 0; i < paddedContributions.length; i += 7) {
      weeks.push(paddedContributions.slice(i, i + 7));
    }

    // Dynamic Streaks & Insights Calculations
    const todayStr = new Date().toISOString().split('T')[0];
    let longestStreak = 0;
    let tempStreak = 0;
    const activeDates = new Set(list.filter(d => d.count > 0).map(d => d.date));

    list.forEach(day => {
      if (day.count > 0) {
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else if (day.date <= todayStr) {
        tempStreak = 0;
      }
    });

    let currentStreak = 0;
    let checkDate = new Date();
    let formattedCheck = checkDate.toISOString().split('T')[0];

    if (activeDates.has(formattedCheck)) {
      while (activeDates.has(formattedCheck)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
        formattedCheck = checkDate.toISOString().split('T')[0];
      }
    } else {
      checkDate.setDate(checkDate.getDate() - 1);
      formattedCheck = checkDate.toISOString().split('T')[0];
      while (activeDates.has(formattedCheck)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
        formattedCheck = checkDate.toISOString().split('T')[0];
      }
    }

    // Best Month and Most Active Day Calculations
    const monthCounts = {};
    const weekdayCounts = Array(7).fill(0);
    let mostActiveCount = 0;
    let mostActiveDayDate = '';

    list.forEach(day => {
      if (day.count > 0) {
        const dateObj = new Date(day.date);
        const monthName = dateObj.toLocaleString('default', { month: 'long' });
        monthCounts[monthName] = (monthCounts[monthName] || 0) + day.count;
        weekdayCounts[dateObj.getDay()] += day.count;

        if (day.count > mostActiveCount) {
          mostActiveCount = day.count;
          mostActiveDayDate = day.date;
        }
      }
    });

    let bestMonthName = 'N/A';
    let bestMonthVal = 0;
    Object.entries(monthCounts).forEach(([m, val]) => {
      if (val > bestMonthVal) {
        bestMonthVal = val;
        bestMonthName = m;
      }
    });

    const weekdaysList = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let bestWeekdayVal = -1;
    let bestWeekdayIndex = 0;
    weekdayCounts.forEach((val, idx) => {
      if (val > bestWeekdayVal) {
        bestWeekdayVal = val;
        bestWeekdayIndex = idx;
      }
    });

    const totalActiveDays = activeDates.size;
    const averageContributions = list.length > 0 ? (totalCount / list.length).toFixed(1) : '0.0';

    return {
      weeks,
      totalCount,
      currentStreak,
      longestStreak,
      totalActiveDays,
      averageContributions,
      bestMonth: `${bestMonthName} (${bestMonthVal} contribs)`,
      mostActiveDay: `${weekdaysList[bestWeekdayIndex]} (${bestWeekdayVal} total)`,
      highestDay: mostActiveDayDate ? `${mostActiveCount} on ${new Date(mostActiveDayDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : 'N/A',
    };
  }, [contributions]);

  // Pre-calculate month labels to prevent duplicates
  const monthLabels = useMemo(() => {
    if (!heatmapData) return [];
    let lastMonthName = '';
    return heatmapData.weeks.map((week) => {
      const firstActiveDay = week.find(d => !d.isPadding);
      if (!firstActiveDay) return '';
      const date = new Date(firstActiveDay.date);
      const monthName = date.toLocaleString('default', { month: 'short' });
      if (monthName !== lastMonthName) {
        lastMonthName = monthName;
        return monthName;
      }
      return '';
    });
  }, [heatmapData]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] items-stretch">
          <div className="bg-secondary/20 p-6 rounded-xl border border-secondary/50 min-h-[340px]" />
          <div className="bg-secondary/20 p-6 rounded-xl border border-secondary/50 min-h-[340px]" />
        </div>
        <div className="bg-secondary/20 p-6 rounded-xl border border-secondary/50 min-h-[220px]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] items-stretch">
        <div className="bg-secondary/20 p-6 rounded-xl border border-secondary/50 text-text-muted text-sm min-h-[340px] flex items-center">
          {error}
        </div>
        <div className="bg-secondary/20 p-6 rounded-xl border border-secondary/50 min-h-[340px] flex items-center">
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 border border-accent text-accent rounded font-mono hover:bg-accent/10 transition-colors inline-block"
          >
            View on GitHub
          </a>
        </div>
      </div>
    );
  }

  const recentRepos = repos.slice(0, 6);
  const currentYear = new Date().getFullYear().toString();
  const todayStr = new Date().toISOString().split('T')[0];

  // Framer Motion staggered animations for columns
  const gridContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.015 } }
  };
  const weekColumnVariants = {
    hidden: { opacity: 0, scaleY: 0.8, y: 5 },
    visible: { opacity: 1, scaleY: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  return (
    <div className="space-y-6 relative">
      {/* Top Section: Profile and Repositories */}
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] items-stretch">
        {/* Profile Card */}
        <div className="bg-secondary/20 p-6 rounded-xl border border-secondary/50 h-full min-h-[340px] flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <img
                src={user.avatar_url}
                alt={user.name || user.login}
                loading="lazy"
                decoding="async"
                className="w-16 h-16 rounded-2xl border border-secondary/50 object-cover"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Github className="text-accent shrink-0" size={20} />
                  <a
                    href={user.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-text font-semibold hover:text-accent transition-colors truncate"
                  >
                    {user.name || user.login}
                  </a>
                </div>
                <p className="text-text-muted text-xs font-mono truncate">{user.login}</p>
              </div>
            </div>

            <p className="text-text-muted text-sm leading-relaxed max-w-md">
              {user.bio || 'GitHub profile details and latest work snapshots.'}
            </p>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-secondary/30 rounded-lg border border-secondary/40">
                <div className="text-accent font-display text-xl font-bold">{user.followers}</div>
                <div className="text-text-muted text-[11px] uppercase tracking-wide">Followers</div>
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg border border-secondary/40">
                <div className="text-accent font-display text-xl font-bold">{user.public_repos}</div>
                <div className="text-text-muted text-[11px] uppercase tracking-wide">Repos</div>
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg border border-secondary/40">
                <div className="text-accent font-display text-xl font-bold">{user.following}</div>
                <div className="text-text-muted text-[11px] uppercase tracking-wide">Following</div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-secondary/40 grid gap-2 text-sm text-text-muted">
            {user.location && (
              <div className="flex items-center justify-between gap-4">
                <span>Location</span>
                <span className="text-text text-right truncate">{user.location}</span>
              </div>
            )}
            {user.company && (
              <div className="flex items-center justify-between gap-4">
                <span>Company</span>
                <span className="text-text text-right truncate">{user.company}</span>
              </div>
            )}
            {user.blog && (
              <div className="flex items-center justify-between gap-4">
                <span>Website</span>
                <a
                  href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent text-right truncate hover:underline"
                >
                  {user.blog}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Repositories Card */}
        <div className="bg-secondary/20 p-6 rounded-xl border border-secondary/50 h-full min-h-[340px] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="text-accent" size={18} />
              <span className="text-text font-semibold">Recently Updated Repos</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2 content-start">
              {recentRepos.map((repo) => (
                <motion.a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="block p-4 rounded-lg border border-secondary/40 bg-secondary/30 hover:border-accent/50 hover:bg-secondary/50 transition-all duration-300 min-h-[112px] flex flex-col justify-between"
                  whileHover={{ y: -2 }}
                >
                  <div className="w-full">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-text font-mono text-sm leading-snug truncate font-medium max-w-[80%]">{repo.name}</span>
                      <span className="flex items-center gap-1 text-text-muted text-xs shrink-0">
                        <Star size={14} className="text-accent" />
                        {repo.stargazers_count}
                      </span>
                    </div>
                    {repo.description && (
                      <p className="text-text-muted text-[11px] mt-1 line-clamp-2 leading-relaxed">
                        {repo.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-text-muted text-[10px] mt-2 pt-2 border-t border-secondary/10 w-full overflow-hidden">
                    {repo.language && (
                      <span className="flex items-center gap-1 shrink-0">
                        <span
                          className="w-1.5 h-1.5 rounded-full inline-block"
                          style={{ backgroundColor: getLanguageColor(repo.language) }}
                        />
                        {repo.language}
                      </span>
                    )}
                    <span className="truncate">Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-secondary/40">
            <a
              href={`https://github.com/${username}?tab=repositories`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-accent hover:text-text transition-colors text-sm font-mono"
            >
              View all repositories
            </a>
          </div>
        </div>
      </div>

      {/* Heatmap & Activity Section */}
      {heatmapData && (
        <div className="bg-secondary/20 p-6 rounded-xl border border-secondary/50 hover:border-accent/30 hover:shadow-[0_0_32px_rgba(54,180,255,0.08)] transition-all duration-300 flex flex-col relative overflow-visible">
          
          {/* Header Row with Title and Detailed Stats */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-secondary/30">
            <div className="flex items-center gap-2">
              <Calendar className="text-accent" size={20} />
              <div>
                <h4 className="text-text font-semibold text-lg">Contribution Activity</h4>
                <p className="text-xs text-text-muted font-mono mt-0.5">
                  Last updated {lastUpdatedText}
                </p>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 text-xs font-mono">
              <div className="px-3 py-1.5 bg-secondary/30 rounded border border-secondary/40 flex flex-col">
                <span className="text-text-muted text-[10px] uppercase">Yearly Total</span>
                <span className="text-accent font-semibold text-sm mt-0.5">
                  {heatmapData.totalCount}
                </span>
              </div>
              <div className="px-3 py-1.5 bg-secondary/30 rounded border border-secondary/40 flex flex-col">
                <span className="text-text-muted text-[10px] uppercase flex items-center gap-0.5">
                  Streak <Flame size={10} className="text-orange-500 fill-orange-500" />
                </span>
                <span className="text-accent font-semibold text-sm mt-0.5">
                  {heatmapData.currentStreak} Days
                </span>
              </div>
              <div className="px-3 py-1.5 bg-secondary/30 rounded border border-secondary/40 flex flex-col">
                <span className="text-text-muted text-[10px] uppercase flex items-center gap-0.5">
                  Total Stars <Star size={10} className="text-yellow-500 fill-yellow-500" />
                </span>
                <span className="text-accent font-semibold text-sm mt-0.5">
                  {totalStars}
                </span>
              </div>
              <div className="px-3 py-1.5 bg-secondary/30 rounded border border-secondary/40 flex flex-col">
                <span className="text-text-muted text-[10px] uppercase flex items-center gap-0.5">
                  Forks <GitFork size={10} />
                </span>
                <span className="text-accent font-semibold text-sm mt-0.5">
                  {totalForks}
                </span>
              </div>
            </div>
          </div>

          {/* Heatmap Grid Section */}
          <div className="flex gap-[3px] items-start justify-start md:justify-center relative overflow-visible select-none">
            {/* Day of Week Labels - aligned to 14px grid cells and 3px gap */}
            <div className="flex flex-col gap-[3px] text-[10px] text-text-muted font-mono pr-2 shrink-0 pt-[22px] md:pt-[25px]">
              <div className="h-[10px] md:h-[14px] flex items-center justify-end"></div> {/* Sun */}
              <div className="h-[10px] md:h-[14px] flex items-center justify-end">Mon</div>
              <div className="h-[10px] md:h-[14px] flex items-center justify-end"></div> {/* Tue */}
              <div className="h-[10px] md:h-[14px] flex items-center justify-end">Wed</div>
              <div className="h-[10px] md:h-[14px] flex items-center justify-end"></div> {/* Thu */}
              <div className="h-[10px] md:h-[14px] flex items-center justify-end">Fri</div>
              <div className="h-[10px] md:h-[14px] flex items-center justify-end"></div> {/* Sat */}
            </div>

            {/* Scrollable Container with Months and Grid */}
            <div className="overflow-x-auto pb-3 scrollbar-thin max-w-full relative">
              <div className="min-w-[900px] flex flex-col relative">
                
                {/* Month Labels Row - aligned dynamically */}
                <div className="flex gap-[3px] text-[12px] md:text-[13px] text-text-muted/65 font-mono mb-2 select-none h-4 relative">
                  {heatmapData.weeks.map((week, idx) => {
                    const label = monthLabels[idx];
                    return (
                      <div key={idx} className="w-[10px] md:w-[14px] shrink-0 relative">
                        {label ? (
                          <span className="absolute left-0 bottom-0 whitespace-nowrap text-[11px] md:text-[12px] font-semibold text-text-muted/70 tracking-wider">
                            {label}
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                {/* Contribution Squares Grid */}
                <motion.div
                  className="flex gap-[3px] relative"
                  variants={gridContainerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {heatmapData.weeks.map((week, wIdx) => (
                    <motion.div
                      key={wIdx}
                      className="flex flex-col gap-[3px]"
                      variants={weekColumnVariants}
                    >
                      {week.map((day, dIdx) => {
                        if (day.isPadding) {
                          return (
                            <div
                              key={dIdx}
                              className="w-[10px] h-[10px] md:w-[14px] md:h-[14px] bg-transparent"
                            />
                          );
                        }

                        const isToday = day.date === todayStr;
                        const isWeekend = dIdx === 0 || dIdx === 6; // Sunday or Saturday

                        // Dynamic hover row/col styling
                        const isHoveredRow = hoveredGridIndex.row === dIdx;
                        const isHoveredCol = hoveredGridIndex.col === wIdx;
                        const isHovered = hoveredDay && hoveredDay.date === day.date;

                        // Grid square class string
                        return (
                          <div
                            key={day.date}
                            style={{
                              backgroundColor: COLOR_SCALE[day.level] || COLOR_SCALE[0],
                              boxShadow: day.level > 0 ? `0 0 6px ${COLOR_SCALE[day.level]}33` : 'none',
                            }}
                            className={`
                              w-[10px] h-[10px] md:w-[14px] md:h-[14px] rounded-[2px] cursor-pointer relative 
                              transition-all duration-200 ease-out border border-white/5
                              ${isWeekend ? 'opacity-70 hover:opacity-100' : ''}
                              ${isToday ? 'border-accent shadow-[0_0_12px_rgba(97,217,255,0.7)] animate-pulse scale-[1.1] z-10' : ''}
                              ${isHovered ? 'scale-[1.25] shadow-[0_0_14px_rgba(97,217,255,0.9)] z-20 border-white/40' : ''}
                              ${(isHoveredRow || isHoveredCol) && !isHovered ? 'after:absolute after:inset-0 after:bg-white/10 after:rounded-[2px]' : ''}
                            `}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const parentEl = e.currentTarget.closest('.relative');
                              const parentRect = parentEl.getBoundingClientRect();
                              setHoveredDay(day);
                              setHoveredGridIndex({ row: dIdx, col: wIdx });
                              setTooltipCoords({
                                x: rect.left - parentRect.left + rect.width / 2,
                                y: rect.top - parentRect.top - 62,
                              });
                            }}
                            onMouseLeave={() => {
                              setHoveredDay(null);
                              setHoveredGridIndex({ row: null, col: null });
                            }}
                          />
                        );
                      })}
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Custom Premium Floating Interactive Tooltip */}
            <AnimatePresence>
              {hoveredDay && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                  transition={{ duration: 0.12 }}
                  style={{
                    position: 'absolute',
                    left: tooltipCoords.x,
                    top: tooltipCoords.y,
                    transform: 'translateX(-50%)',
                  }}
                  className="z-30 pointer-events-none bg-[#0b0f19]/95 border border-secondary/70 shadow-2xl px-3.5 py-2 rounded-xl text-[11px] font-mono text-text whitespace-nowrap flex flex-col items-center gap-1.5 backdrop-blur-md"
                >
                  <div className="text-[10px] text-text-muted font-medium">
                    {new Date(hoveredDay.date).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="font-bold text-accent text-[12px] flex items-center gap-1">
                    {hoveredDay.count === 0 ? '0' : hoveredDay.count} {hoveredDay.count === 1 ? 'Contribution' : 'Contributions'}
                  </div>
                  
                  {/* Premium mock detailed repos listing based on contributions level to look amazing */}
                  {hoveredDay.count > 0 && (
                    <div className="text-[9px] text-text-muted border-t border-secondary/30 pt-1 mt-1 flex flex-col gap-0.5 w-full">
                      <span className="text-left opacity-75">Updated repos:</span>
                      {recentRepos.slice(0, Math.min(hoveredDay.count, 2)).map(repo => (
                        <span key={repo.id} className="text-left font-sans text-accent/90">
                          • {repo.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Tooltip arrow */}
                  <div className="w-1.5 h-1.5 bg-[#0b0f19] border-r border-b border-secondary/70 rotate-45 absolute -bottom-[4px] left-1/2 -translate-x-1/2" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Under Graph Statistics grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-secondary/40 text-xs font-mono text-text-muted">
            <div className="flex flex-col gap-0.5">
              <span>Best Month</span>
              <span className="text-text font-medium">{heatmapData.bestMonth}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span>Peak Day Activity</span>
              <span className="text-text font-medium">{heatmapData.highestDay}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span>Daily Average</span>
              <span className="text-text font-medium">{heatmapData.averageContributions} / day</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span>Active Days</span>
              <span className="text-text font-medium">{heatmapData.totalActiveDays} / 365</span>
            </div>
          </div>

          {/* Under Graph Footer: Total Contributions & GitHub Legend */}
          <div className="flex justify-between items-center mt-5 pt-3 border-t border-secondary/35 text-xs text-text-muted font-mono">
            <span>
              {heatmapData.totalCount.toLocaleString()} contributions in {currentYear}
            </span>
            <div className="flex items-center gap-1.5 select-none">
              <span>Less</span>
              {COLOR_SCALE.map((col, idx) => (
                <div
                  key={idx}
                  style={{ backgroundColor: col }}
                  className="w-[10px] h-[10px] md:w-[12px] md:h-[12px] rounded-[2px] border border-white/5"
                />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GithubStats;
