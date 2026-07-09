import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { RefreshCw, AlertTriangle, BarChart2, LineChart, Globe, Folder, Terminal, Search, X, Laptop, Clock, Trash, Activity } from 'lucide-react';

const GeoChartLoader = ({ activeCountries = [] }) => {
  useEffect(() => {
    let active = true;

    const drawChart = () => {
      if (!active || !window.google || !window.google.visualization) return;

      const container = document.getElementById('geochart_canvas');
      if (!container) return;

      const dataArray = [['Country', 'Active Sessions']];
      activeCountries.forEach((c) => {
        // Exclude Unknown markers from coloring
        if (c.name !== 'Unknown') {
          dataArray.push([c.name, c.count]);
        }
      });

      // Default to empty marker if no sessions
      if (dataArray.length === 1) {
        dataArray.push(['US', 0]);
      }

      const data = window.google.visualization.arrayToDataTable(dataArray);

      const options = {
        colorAxis: { colors: ['#0f172a', '#10b981', '#34d399'] }, // Dark bg transition to emerald theme accent color
        backgroundColor: 'transparent',
        datalessRegionColor: '#1e293b', // Matches dark secondary background
        defaultColor: '#1e293b',
        keepAspectRatio: true,
        tooltip: { textStyle: { color: '#f8fafc', fontName: 'monospace', fontSize: 11 }, trigger: 'focus' },
      };

      const chart = new window.google.visualization.GeoChart(container);
      chart.draw(data, options);
    };

    const loadGoogleCharts = () => {
      if (window.google && window.google.charts) {
        window.google.charts.load('current', {
          packages: ['geochart'],
          mapsApiKey: '', // GA Geocharts do not require an active API key for basic loads
        });
        window.google.charts.setOnLoadCallback(drawChart);
      }
    };

    // Load Google Charts JS Loader if not already in document
    if (!document.getElementById('google-charts-script')) {
      const script = document.createElement('script');
      script.id = 'google-charts-script';
      script.src = 'https://www.gstatic.com/charts/loader.js';
      script.onload = loadGoogleCharts;
      document.body.appendChild(script);
    } else {
      loadGoogleCharts();
    }

    // Handle window resize dynamically to adjust vector map scale
    const handleResize = () => {
      if (window.google && window.google.visualization) {
        drawChart();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      active = false;
      window.removeEventListener('resize', handleResize);
    };
  }, [activeCountries]);

  return null;
};

const AnalyticsDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Interactive search & filter states
  const [actionFilter, setActionFilter] = useState('all'); // all, page_view, project_view, click, scroll
  const [searchSession, setSearchSession] = useState('');
  
  // Interactive chart metric range filters
  const [chartMetricFilter, setChartMetricFilter] = useState('page_view'); // page_view, contact_submit, download
  
  // Session trace modal states
  const [selectedTraceSession, setSelectedTraceSession] = useState(null);
  const [pruning, setPruning] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'analyticsEvents'),
      orderBy('timestamp', 'desc'),
      limit(300)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(docs);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('Failed to stream telemetry logs:', err);
        setError(`Uplink stream failed: ${err.message}`);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Pruning handler to wipe out/reset telemetry collection
  const handlePruneLogs = async () => {
    if (!window.confirm('WARNING: Are you sure you want to prune and clear all telemetry data logs? This action is irreversible.')) return;
    setPruning(true);
    try {
      const { writeBatch, doc } = await import('firebase/firestore');
      const batch = writeBatch(db);
      events.forEach((ev) => {
        batch.delete(doc(db, 'analyticsEvents', ev.id));
      });
      await batch.commit();
      alert('Logs successfully pruned.');
    } catch (err) {
      console.error('Pruning failed:', err);
      alert('Failed to clear logs: ' + err.message);
    } finally {
      setPruning(false);
    }
  };

  // Filtered log events computed property
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      // 1. Action type filter
      if (actionFilter !== 'all') {
        if (actionFilter === 'click' && e.eventName !== 'social_click' && e.eventName !== 'download') return false;
        if (actionFilter === 'scroll' && e.eventName !== 'scroll_depth') return false;
        if (actionFilter === 'page_view' && e.eventName !== 'page_view') return false;
        if (actionFilter === 'project_view' && e.eventName !== 'project_view') return false;
      }
      // 2. Session search filter
      if (searchSession.trim()) {
        const sid = String(e.sessionId || '').toLowerCase();
        const ref = String(e.eventData?.referrer || '').toLowerCase();
        const search = searchSession.toLowerCase();
        if (!sid.includes(search) && !ref.includes(search)) return false;
      }
      return true;
    });
  }, [events, actionFilter, searchSession]);

  // Compiled trace timeline steps for the modal
  const sessionTraceTimeline = useMemo(() => {
    if (!selectedTraceSession) return [];
    return events
      .filter((e) => e.sessionId === selectedTraceSession)
      .sort((a, b) => {
        const tA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
        const tB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
        return tA - tB; // oldest first
      });
  }, [events, selectedTraceSession]);

  // Aggregations
  const stats = useMemo(() => {
    if (events.length === 0) return null;

    const formatDate = (ts) => {
      if (!ts) return '';
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      return date.toISOString().split('T')[0];
    };

    const totalViews = events.filter((e) => e.eventName === 'page_view').length;
    const totalSessions = new Set(events.map((e) => e.sessionId).filter(Boolean)).size;

    // Estimate live sessions (active within last 5 minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const liveSessions = new Set(
      events
        .filter((e) => {
          const t = e.timestamp?.toDate ? e.timestamp.toDate().getTime() : new Date(e.timestamp).getTime();
          return t > fiveMinutesAgo;
        })
        .map((e) => e.sessionId)
        .filter(Boolean)
    ).size;

    // 1. Page views over time (last 7 active days) - filtered by metric choice
    const dailyViews = {};
    events.forEach((e) => {
      if (e.eventName === chartMetricFilter) {
        const dateStr = formatDate(e.timestamp);
        if (dateStr) dailyViews[dateStr] = (dailyViews[dateStr] || 0) + 1;
      }
    });

    // Sort dates
    const sortedDates = Object.keys(dailyViews).sort().slice(-7);
    const dateLabels = sortedDates.map((d) => d.slice(5)); // MM-DD
    const dateData = sortedDates.map((d) => dailyViews[d]);
    const maxDailyView = Math.max(...dateData, 1);

    // 2. Top pages
    const pageCounts = {};
    events.forEach((e) => {
      if (e.eventName === 'page_view' && e.eventData?.path) {
        const p = e.eventData.path;
        pageCounts[p] = (pageCounts[p] || 0) + 1;
      }
    });
    const topPages = Object.entries(pageCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 3. Scroll depth (funnel)
    const scrollCounts = { '25%': 0, '50%': 0, '75%': 0, '100%': 0 };
    events.forEach((e) => {
      if (e.eventName === 'scroll_depth' && e.eventData?.depth) {
        const depthKey = `${e.eventData.depth}%`;
        if (scrollCounts[depthKey] !== undefined) {
          scrollCounts[depthKey]++;
        }
      }
    });
    const maxScrollCount = Math.max(...Object.values(scrollCounts), 1);

    // 4. Click events (clicks on social networks + resume)
    const clickCounts = {};
    events.forEach((e) => {
      if (e.eventName === 'social_click' && e.eventData?.platform) {
        const p = e.eventData.platform;
        clickCounts[p] = (clickCounts[p] || 0) + 1;
      }
      if (e.eventName === 'download' && e.eventData?.file_type) {
        const d = `resume_${e.eventData.file_type}`;
        clickCounts[d] = (clickCounts[d] || 0) + 1;
      }
    });
    const topClicks = Object.entries(clickCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // 5. Top Projects Viewed
    const projectCounts = {};
    events.forEach((e) => {
      if (e.eventName === 'project_view' && e.eventData?.project_title) {
        const title = e.eventData.project_title;
        projectCounts[title] = (projectCounts[title] || 0) + 1;
      }
    });
    const topProjects = Object.entries(projectCounts)
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 6. Top geographic country locations (by unique sessions)
    const countryCounts = {};
    const sessionCountryMapped = new Set();
    events.forEach((e) => {
      const country = e.eventData?.country || 'Unknown';
      const key = `${e.sessionId}_${country}`;
      if (e.sessionId && !sessionCountryMapped.has(key)) {
        sessionCountryMapped.add(key);
        countryCounts[country] = (countryCounts[country] || 0) + 1;
      }
    });
    const topCountries = Object.entries(countryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalViews,
      totalSessions,
      liveSessions,
      dateLabels,
      dateData,
      maxDailyView,
      topPages,
      scrollCounts,
      maxScrollCount,
      topClicks,
      topProjects,
      topCountries,
    };
  }, [events, chartMetricFilter]);

  // Helper formatting method for Referrer badges
  const getReferrerPill = (referrerUrl) => {
    if (!referrerUrl) return { text: 'Direct / Bookmark', style: 'bg-zinc-500/10 border-zinc-500/25 text-zinc-400' };
    const lowercase = referrerUrl.toLowerCase();
    
    if (lowercase.includes('google.com')) return { text: 'Google SEO', style: 'bg-blue-500/10 border-blue-500/20 text-blue-400' };
    if (lowercase.includes('github.com')) return { text: 'GitHub Link', style: 'bg-purple-500/10 border-purple-500/20 text-purple-400' };
    if (lowercase.includes('linkedin.com')) return { text: 'LinkedIn Referral', style: 'bg-sky-500/10 border-sky-500/20 text-sky-400' };
    if (lowercase.includes('twitter.com') || lowercase.includes('x.com')) return { text: 'X (Twitter)', style: 'bg-zinc-200/10 border-zinc-200/20 text-zinc-300' };
    if (lowercase.includes('localhost') || lowercase.includes('127.0.0.1')) return { text: 'Dev Env Sandbox', style: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' };
    
    try {
      const url = new URL(referrerUrl);
      return { text: url.hostname, style: 'bg-accent/10 border-accent/25 text-accent' };
    } catch {
      return { text: referrerUrl.substring(0, 20), style: 'bg-accent/10 border-accent/25 text-accent' };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 font-mono text-text-muted gap-3">
        <RefreshCw className="animate-spin text-accent" size={32} />
        <span className="text-xs uppercase tracking-widest">Downlinking telemetry logs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center font-mono">
        <AlertTriangle className="mx-auto mb-4 text-red-400" size={32} />
        <h3 className="text-lg font-bold text-red-200 uppercase tracking-widest">{error}</h3>
        <p className="text-xs text-text-muted mt-2">Check your internet connection or Firestore logs.</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-secondary/20 p-10 text-center font-mono text-text-muted">
        <BarChart2 className="mx-auto mb-4 opacity-50" size={36} />
        <p className="text-sm">No telemetry records exist yet. Navigate around your portfolio to generate logs!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top HUD Cards */}
      <div className="grid gap-4 sm:grid-cols-4 font-mono">
        <div className="rounded-2xl border border-white/5 bg-secondary/20 p-5 shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
          <span className="text-[9px] uppercase tracking-wider text-text-muted">Total Page Views</span>
          <h3 className="text-2xl font-bold text-accent mt-1">{stats.totalViews}</h3>
        </div>
        <div className="rounded-2xl border border-white/5 bg-secondary/20 p-5 shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
          <span className="text-[9px] uppercase tracking-wider text-text-muted">Unique Sessions</span>
          <h3 className="text-2xl font-bold text-accent mt-1">{stats.totalSessions}</h3>
        </div>
        <div className="rounded-2xl border border-white/5 bg-secondary/20 p-5 shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
          <span className="text-[9px] uppercase tracking-wider text-text-muted font-bold text-emerald-400">Live Active Users</span>
          <h3 className="text-2xl font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            {stats.liveSessions} active
          </h3>
        </div>
        <div className="rounded-2xl border border-white/5 bg-secondary/20 p-5 shadow-[0_4px_16px_rgba(0,0,0,0.25)] flex flex-col justify-between">
          <span className="text-[9px] uppercase tracking-wider text-text-muted">Database Maintenance</span>
          <button
            onClick={handlePruneLogs}
            disabled={pruning}
            className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-red-500/20 hover:border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-[10px] font-bold text-red-400 transition-colors"
          >
            {pruning ? <RefreshCw size={11} className="animate-spin" /> : <Trash size={11} />}
            Prune Database Logs
          </button>
        </div>
      </div>

      {/* Daily Traffic Chart */}
      <div className="rounded-2xl border border-white/10 bg-secondary/20 p-6 relative overflow-hidden">
        {/* Cyberpunk grid background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.4))] pointer-events-none" />
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{
            backgroundImage: `radial-gradient(var(--color-accent) 1px, transparent 0)`,
            backgroundSize: '16px 16px',
          }}
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 mb-4 gap-3 relative z-10">
          <h3 className="font-display font-bold text-text text-xs tracking-wider flex items-center gap-2 text-text-muted">
            <LineChart size={14} className="text-accent animate-pulse" />
            TRAFFIC PROFILE & DATA THROTTLES (7 ACTIVE DAYS)
          </h3>
          
          {/* Chart Metric Selectors */}
          <div className="flex gap-1.5">
            {[
              { id: 'page_view', label: 'Views' },
              { id: 'contact_submit', label: 'Inquiries' },
              { id: 'download', label: 'Downloads' },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setChartMetricFilter(btn.id)}
                className={`px-3 py-1 rounded-lg text-[9px] font-mono font-bold transition-all border ${
                  chartMetricFilter === btn.id
                    ? 'bg-accent/15 border-accent/35 text-accent'
                    : 'bg-primary/45 border-white/5 text-text-muted hover:border-white/10 hover:text-text'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* SVG Chart */}
        <div className="h-44 w-full flex items-end gap-4 mt-6 border-b border-white/10 pb-2 relative z-10">
          {stats.dateData.map((val, idx) => {
            const pct = (val / stats.maxDailyView) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                {/* Tooltip */}
                <span className="absolute -top-7 bg-accent text-primary text-[10px] font-bold font-mono px-2 py-0.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                  {val} {chartMetricFilter === 'page_view' ? 'views' : chartMetricFilter === 'contact_submit' ? 'inquiries' : 'downloads'}
                </span>
                {/* Bar with cyberpunk double accent glow */}
                <div className="w-full relative flex flex-col justify-end h-full">
                  <div 
                    style={{ height: `${pct || 4}%` }} 
                    className="w-full bg-gradient-to-t from-accent/5 to-accent/30 border border-accent/40 rounded-t-lg group-hover:border-accent group-hover:from-accent/10 group-hover:to-accent/50 shadow-[0_0_15px_rgba(var(--color-accent-rgb),0.15)] group-hover:shadow-[0_0_25px_rgba(var(--color-accent-rgb),0.3)] transition-all duration-300 relative overflow-hidden"
                  >
                    {/* Top scanning pulse line */}
                    <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-accent animate-pulse" />
                  </div>
                </div>
                <span className="text-[10px] text-text-muted font-mono mt-2 block whitespace-nowrap">
                  {stats.dateLabels[idx]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Pages */}
        <div className="rounded-2xl border border-white/10 bg-secondary/20 p-5">
          <h3 className="font-display font-bold text-text mb-4 text-sm uppercase tracking-wider text-text-muted flex items-center gap-2">
            <Globe size={14} className="text-accent" />
            Top Orbital Pages
          </h3>
          <div className="space-y-3 font-mono text-xs">
            {stats.topPages.map((page, idx) => (
              <div key={idx} className="flex justify-between items-center bg-primary/45 border border-white/5 rounded-xl px-4 py-2.5">
                <span className="text-text truncate">{page.path}</span>
                <span className="text-accent font-bold">{page.count} hits</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Funnel */}
        <div className="rounded-2xl border border-white/10 bg-secondary/20 p-5">
          <h3 className="font-display font-bold text-text mb-4 text-sm uppercase tracking-wider text-text-muted flex items-center gap-2">
            <LineChart size={14} className="text-accent" />
            Scroll Retention Funnel
          </h3>
          <div className="space-y-3 font-mono text-xs">
            {Object.entries(stats.scrollCounts).map(([depth, count]) => {
              const pct = (count / stats.maxScrollCount) * 100;
              return (
                <div key={depth} className="flex items-center gap-4">
                  <span className="w-10 text-right text-text-muted text-[10px] font-bold">{depth}</span>
                  <div className="flex-1 h-3 bg-secondary/50 rounded overflow-hidden border border-white/5 relative p-[1px]">
                    <div 
                      style={{ width: `${pct || 0}%` }}
                      className="h-full bg-gradient-to-r from-accent/60 to-accent rounded"
                    />
                  </div>
                  <span className="w-24 text-accent text-right font-bold text-[10px]">
                    {count} logs ({Math.round(pct)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Click events */}
        <div className="rounded-2xl border border-white/10 bg-secondary/20 p-5">
          <h3 className="font-display font-bold text-text mb-4 text-sm uppercase tracking-wider text-text-muted">OUTBOUND ACTIONS (CLICKS & DOWNLOADS)</h3>
          <div className="space-y-3 font-mono text-xs">
            {stats.topClicks.map((click, idx) => (
              <div key={idx} className="flex justify-between items-center bg-primary/45 border border-white/5 rounded-xl px-4 py-2.5">
                <span className="text-text-muted capitalize">{click.name.replace('_', ' ')}</span>
                <span className="text-accent font-bold">{click.count} clicks</span>
              </div>
            ))}
            {stats.topClicks.length === 0 && (
              <p className="text-center text-text-muted text-xs py-4">No outbound logs yet.</p>
            )}
          </div>
        </div>

        {/* Top Projects */}
        <div className="rounded-2xl border border-white/10 bg-secondary/20 p-5">
          <h3 className="font-display font-bold text-text mb-4 text-sm uppercase tracking-wider text-text-muted flex items-center gap-2">
            <Folder size={14} className="text-accent" />
            POPULAR MISSIONS (PROJECT VIEWS)
          </h3>
          <div className="space-y-3 font-mono text-xs">
            {stats.topProjects.map((proj, idx) => (
              <div key={idx} className="flex justify-between items-center bg-primary/45 border border-white/5 rounded-xl px-4 py-2.5">
                <span className="text-text truncate">{proj.title}</span>
                <span className="text-accent font-bold">{proj.count} views</span>
              </div>
            ))}
            {stats.topProjects.length === 0 && (
              <p className="text-center text-text-muted text-xs py-4">No project view logs yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Geographic Activity World Map Card */}
        <div className="rounded-2xl border border-white/10 bg-secondary/20 p-6 relative overflow-hidden flex flex-col justify-between min-h-[360px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-text text-sm uppercase tracking-wider text-text-muted flex items-center gap-2">
                <Globe size={14} className="text-emerald-400 animate-pulse" />
                Geographic Activity Radar
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                Live Resolution
              </span>
            </div>

            {/* High-fidelity Google GeoChart Canvas Wrapper */}
            <div className="w-full h-44 bg-primary/25 border border-white/5 rounded-2xl relative overflow-hidden flex items-center justify-center p-2">
              <div id="geochart_canvas" className="w-full h-full select-none" />
              
              {/* Load geochart library scripts dynamically */}
              <GeoChartLoader activeCountries={stats.topCountries} />
            </div>
          </div>

          {/* Simple Legend */}
          <div className="flex gap-4 mt-3 text-[10px] font-mono text-text-muted justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-emerald-500" />
              Active Uplink Sector
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-zinc-800 border border-white/5" />
              No Telemetry Reported
            </span>
          </div>
        </div>

        {/* Geographic Breakdown Lists */}
        <div className="rounded-2xl border border-white/10 bg-secondary/20 p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-text mb-4 text-sm uppercase tracking-wider text-text-muted flex items-center gap-2">
              <Globe size={14} className="text-accent" />
              Top Active Sectors
            </h3>
            <div className="space-y-3 font-mono text-xs">
              {stats.topCountries.map((c, idx) => {
                const maxVal = Math.max(...stats.topCountries.map(o => o.count), 1);
                const pct = (c.count / maxVal) * 100;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-text font-bold">{c.name}</span>
                      <span className="text-accent font-bold">{c.count} sessions</span>
                    </div>
                    <div className="h-2 bg-secondary/50 rounded overflow-hidden border border-white/5 relative p-[1px]">
                      <div 
                        style={{ width: `${pct || 0}%` }}
                        className="h-full bg-gradient-to-r from-accent/60 to-accent rounded"
                      />
                    </div>
                  </div>
                );
              })}
              {stats.topCountries.length === 0 && (
                <p className="text-center text-text-muted text-xs py-4">Resolving geo metrics...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Live Stream Recent Activity Log Feed Terminal */}
      <div className="rounded-2xl border border-white/10 bg-secondary/20 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-3 gap-3">
          <h3 className="font-display font-bold text-text text-xs tracking-wider flex items-center gap-2 text-text-muted">
            <Terminal size={14} className="text-accent" />
            REALTIME TELEMETRY LOGS (RECENT ACTIVITY)
          </h3>
          
          {/* Action Filter Controls */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All' },
              { id: 'page_view', label: 'Views' },
              { id: 'project_view', label: 'Projects' },
              { id: 'click', label: 'Outbound' },
              { id: 'scroll', label: 'Scroll' },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setActionFilter(btn.id)}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold transition-all border ${
                  actionFilter === btn.id
                    ? 'bg-accent/15 border-accent/35 text-accent'
                    : 'bg-primary/45 border-white/5 text-text-muted hover:border-white/10 hover:text-text'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Filter Search Input */}
        <div className="flex items-center gap-2 bg-primary/30 border border-white/5 rounded-xl px-3 py-2">
          <Search size={12} className="text-text-muted" />
          <input
            type="text"
            placeholder="Search logs by Session ID or Referrer domain..."
            value={searchSession}
            onChange={(e) => setSearchSession(e.target.value)}
            className="w-full bg-transparent text-xs text-text outline-none placeholder-text-muted/65"
          />
          {searchSession && (
            <button onClick={() => setSearchSession('')} className="text-text-muted hover:text-text">
              <X size={12} />
            </button>
          )}
        </div>

        {/* Interactive Log Feed list */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 [scrollbar-width:thin] font-mono text-[11px] text-text-muted">
          {filteredEvents.slice(0, 60).map((log) => {
            const time = log.timestamp?.toDate ? log.timestamp.toDate().toLocaleTimeString() : 'Recent';
            let eventText = '';
            
            if (log.eventName === 'page_view') {
              eventText = `Page View: "${log.eventData?.path || '/'}"`;
            } else if (log.eventName === 'project_view') {
              eventText = `Viewed Project: "${log.eventData?.project_title || 'N/A'}"`;
            } else if (log.eventName === 'social_click') {
              eventText = `Clicked Social Link: "${log.eventData?.platform || 'N/A'}"`;
            } else if (log.eventName === 'download') {
              eventText = `Downloaded Resume: [${log.eventData?.file_type?.toUpperCase() || 'PDF'}]`;
            } else if (log.eventName === 'scroll_depth') {
              eventText = `Scrolled through ${log.eventData?.depth || '0'}% of Homepage`;
            } else if (log.eventName === 'contact_submit') {
              eventText = `Submitted Inquiry Form`;
            } else {
              eventText = `Triggered Event: ${log.eventName}`;
            }

            const referrerPill = getReferrerPill(log.eventData?.referrer);

            return (
              <div 
                key={log.id} 
                onClick={() => setSelectedTraceSession(log.sessionId)}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-primary/35 border border-white/5 rounded-xl px-4 py-3 hover:bg-primary/50 hover:border-accent/25 transition-all cursor-pointer group"
              >
                <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                  <span className="text-[10px] text-accent font-bold shrink-0">[{time}]</span>
                  <span className="text-text truncate font-semibold group-hover:text-accent transition-colors">{eventText}</span>
                </div>
                
                <div className="flex items-center flex-wrap gap-2.5 text-[10px] text-text-muted/65 self-end sm:self-center">
                  {/* Referrer source badge */}
                  <span className={`px-2 py-0.5 rounded border text-[9px] ${referrerPill.style}`}>
                    {referrerPill.text}
                  </span>
                  <span>•</span>
                  {/* Device Indicator */}
                  <span className="flex items-center gap-1">
                    <Laptop size={10} />
                    {log.eventData?.device || 'Desktop'}
                  </span>
                  <span>•</span>
                  {/* Short Session footprint */}
                  <span className="bg-white/5 px-1.5 py-0.5 rounded group-hover:bg-accent/15 group-hover:text-accent transition-colors font-bold">
                    Trace: {log.sessionId?.substring(0, 6) || 'Guest'}
                  </span>
                </div>
              </div>
            );
          })}
          {filteredEvents.length === 0 && (
            <p className="text-center text-text-muted py-8 text-xs font-mono">No telemetry events match your active filters.</p>
          )}
        </div>
      </div>

      {/* SESSION TRACE WORKSPACE TIMELINE MODAL */}
      {selectedTraceSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-secondary p-6 shadow-[0_24px_80px_rgba(0,0,0,0.6)] flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <div>
                <h4 className="text-sm font-display font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={14} className="text-accent animate-pulse" />
                  User Session Trace
                </h4>
                <p className="text-[10px] font-mono text-text-muted mt-1 break-all select-all">
                  Session ID: {selectedTraceSession}
                </p>
              </div>
              <button 
                onClick={() => setSelectedTraceSession(null)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Trace Steps Scroll Timeline */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 [scrollbar-width:thin] py-2">
              {sessionTraceTimeline.map((step) => {
                const stepTime = step.timestamp?.toDate ? step.timestamp.toDate().toLocaleTimeString() : 'Recent';
                let stepAction = '';
                let details = null;

                if (step.eventName === 'page_view') {
                  stepAction = `Opened Page "${step.eventData?.path || '/'}"`;
                  details = step.eventData?.referrer ? `Referrer: ${step.eventData.referrer}` : null;
                } else if (step.eventName === 'project_view') {
                  stepAction = `Opened Project Modal`;
                  details = `Project: ${step.eventData?.project_title || 'Unknown'}`;
                } else if (step.eventName === 'social_click') {
                  stepAction = `Clicked Social Link`;
                  details = `Platform: ${step.eventData?.platform || 'Unknown'}`;
                } else if (step.eventName === 'download') {
                  stepAction = `Downloaded Resume`;
                  details = `File Type: ${step.eventData?.file_type?.toUpperCase() || 'N/A'}`;
                } else if (step.eventName === 'scroll_depth') {
                  stepAction = `Scrolled Page`;
                  details = `Depth reached: ${step.eventData?.depth || '0'}%`;
                } else if (step.eventName === 'contact_submit') {
                  stepAction = `Sent Contact Inquiry Form`;
                } else {
                  stepAction = `Triggered: ${step.eventName}`;
                }

                return (
                  <div key={step.id} className="relative pl-6 border-l border-white/10 last:border-transparent pb-1">
                    {/* Circle Node Indicator */}
                    <div className="absolute -left-[6px] top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-accent shadow-[0_0_8px_rgba(var(--color-accent-rgb),0.5)]" />
                    
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-accent font-bold">[{stepTime}]</span>
                        <span className="text-xs text-text font-semibold">{stepAction}</span>
                      </div>
                      {details && (
                        <p className="text-[10px] font-mono text-text-muted mt-0.5 leading-relaxed bg-primary/25 border border-white/5 rounded px-2 py-1 select-all">
                          {details}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-white/5 pt-4 mt-4 flex justify-between items-center text-[10px] font-mono text-text-muted">
              <span className="flex items-center gap-1">
                <Clock size={11} /> Total Actions: {sessionTraceTimeline.length}
              </span>
              <button
                onClick={() => setSelectedTraceSession(null)}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/80 border border-white/10 text-xs font-bold text-text transition-colors"
              >
                Close Trace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
