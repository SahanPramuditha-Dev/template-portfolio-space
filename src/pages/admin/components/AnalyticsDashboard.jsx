import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { 
  Users, Eye, MousePointerClick, Activity, Globe, 
  Clock, Calendar, Search, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { 
  TrafficChart, DeviceDonutChart, LocationBarChart, TrafficSourcesChart, PerformanceGauge 
} from './analytics/AnalyticsCharts';

const GeoChartLoader = ({ activeCountries = [] }) => {
  useEffect(() => {
    let active = true;

    const drawChart = () => {
      if (!active || !window.google || !window.google.visualization) return;

      const container = document.getElementById('geochart_canvas');
      if (!container) return;

      const dataArray = [['Country', 'Active Sessions']];
      activeCountries.forEach((c) => {
        if (c.name !== 'Unknown') {
          dataArray.push([c.name, c.count]);
        }
      });

      if (dataArray.length === 1) {
        dataArray.push(['US', 0]);
      }

      const data = window.google.visualization.arrayToDataTable(dataArray);

      const options = {
        colorAxis: { colors: ['#0ea5e9', '#6366f1'] }, 
        backgroundColor: 'transparent',
        datalessRegionColor: '#334155', 
        defaultColor: '#334155',
        legend: 'none',
        keepAspectRatio: true,
        tooltip: { textStyle: { color: '#0f172a', fontName: 'monospace', fontSize: 12 }, trigger: 'focus' },
      };

      const chart = new window.google.visualization.GeoChart(container);
      chart.draw(data, options);
    };

    const loadGoogleCharts = () => {
      if (window.google && window.google.charts) {
        window.google.charts.load('current', {
          packages: ['geochart'],
          mapsApiKey: '',
        });
        window.google.charts.setOnLoadCallback(drawChart);
      }
    };

    if (!document.getElementById('google-charts-script')) {
      const script = document.createElement('script');
      script.id = 'google-charts-script';
      script.src = 'https://www.gstatic.com/charts/loader.js';
      script.onload = loadGoogleCharts;
      document.body.appendChild(script);
    } else {
      loadGoogleCharts();
    }

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

  return <div id="geochart_canvas" className="w-full h-full min-h-[400px]"></div>;
};

// Helper to parse User Agent
const parseUserAgent = (ua) => {
  if (!ua) return { browser: 'Unknown', os: 'Unknown', device: 'Desktop' };
  const str = ua.toLowerCase();
  
  let browser = 'Other';
  if (str.includes('chrome') && !str.includes('edg') && !str.includes('opr')) browser = 'Chrome';
  else if (str.includes('safari') && !str.includes('chrome')) browser = 'Safari';
  else if (str.includes('firefox')) browser = 'Firefox';
  else if (str.includes('edg')) browser = 'Edge';
  
  let os = 'Other';
  if (str.includes('win')) os = 'Windows';
  else if (str.includes('mac')) os = 'macOS';
  else if (str.includes('android')) os = 'Android';
  else if (str.includes('iphone') || str.includes('ipad')) os = 'iOS';
  else if (str.includes('linux')) os = 'Linux';
  
  let device = 'Desktop';
  if (str.includes('mobi') || str.includes('android') || str.includes('iphone')) device = 'Mobile';
  else if (str.includes('ipad') || str.includes('tablet')) device = 'Tablet';
  
  return { browser, os, device };
};

// eslint-disable-next-line no-unused-vars
const KpiCard = ({ title, value, previousValue, icon: Icon, unit = '' }) => {
  const percentChange = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;
  const isPositive = percentChange >= 0;
  
  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 hover:bg-slate-800/40 transition-colors relative overflow-hidden group">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
        <div className="p-2 rounded-xl bg-white/5 text-slate-400 group-hover:text-accent group-hover:bg-accent/10 transition-colors">
          <Icon size={18} />
        </div>
      </div>
      
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
        <span className="text-sm text-slate-400 font-medium">{unit}</span>
      </div>
      
      <div className="mt-4 flex items-center gap-2">
        <div className={`flex items-center gap-1 text-xs font-bold px-1.5 py-0.5 rounded ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(percentChange).toFixed(1)}%
        </div>
        <span className="text-xs text-slate-500">vs last period</span>
      </div>
    </div>
  );
};

const AnalyticsDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    // For a real production app, limit(1000) is okay for a basic 30-day view of a low-traffic site.
    // For enterprise, this would be replaced with a Google Analytics Data API call via Cloud Functions.
    const q = query(
      collection(db, 'analyticsEvents'),
      orderBy('timestamp', 'desc'),
      limit(2000)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        time: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate() : new Date(doc.data().timestamp)
      }));
      setEvents(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Compute Aggregations based on selected date range
  const aggregations = useMemo(() => {
    if (!events.length) return null;

    const now = new Date();
    const rangeDays = dateRange === '24h' ? 1 : dateRange === '7d' ? 7 : 30;
    const cutoffTime = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000);
    const prevCutoffTime = new Date(cutoffTime.getTime() - rangeDays * 24 * 60 * 60 * 1000);

    const currentPeriodEvents = [];
    const prevPeriodEvents = [];

    events.forEach(e => {
      if (e.time > cutoffTime) currentPeriodEvents.push(e);
      else if (e.time > prevCutoffTime) prevPeriodEvents.push(e);
    });

    // KPI: Visitors (Unique Session IDs)
    const currentVisitors = new Set(currentPeriodEvents.map(e => e.sessionId)).size;
    const prevVisitors = new Set(prevPeriodEvents.map(e => e.sessionId)).size;

    // KPI: Page Views
    const currentViews = currentPeriodEvents.filter(e => e.eventName === 'page_view').length;
    const prevViews = prevPeriodEvents.filter(e => e.eventName === 'page_view').length;

    // Advanced KPIs: Bounce Rate and Engagement Time
    const calculateSessionMetrics = (periodEvents) => {
      const sessionsMap = {};
      periodEvents.forEach(e => {
        if (e.sessionId) {
          if (!sessionsMap[e.sessionId]) {
            sessionsMap[e.sessionId] = { events: 0, minTime: e.time, maxTime: e.time };
          }
          sessionsMap[e.sessionId].events++;
          if (e.time < sessionsMap[e.sessionId].minTime) sessionsMap[e.sessionId].minTime = e.time;
          if (e.time > sessionsMap[e.sessionId].maxTime) sessionsMap[e.sessionId].maxTime = e.time;
        }
      });
      
      let totalSessions = 0;
      let bouncedSessions = 0;
      let totalEngagementTime = 0;
      let engagedCount = 0;
      
      Object.values(sessionsMap).forEach(session => {
        totalSessions++;
        // If they only fired 1 event (or 0 time elapsed), it's a bounce
        if (session.events <= 1 || session.maxTime.getTime() === session.minTime.getTime()) {
          bouncedSessions++;
        } else {
          const durationMs = session.maxTime.getTime() - session.minTime.getTime();
          // Cap at 30 minutes to avoid skewed averages from left-open tabs
          const validDuration = Math.min(durationMs, 30 * 60 * 1000);
          totalEngagementTime += validDuration;
          engagedCount++;
        }
      });
      
      const bounceRate = totalSessions > 0 ? parseFloat(((bouncedSessions / totalSessions) * 100).toFixed(1)) : 0;
      const avgEngagement = engagedCount > 0 ? parseFloat((totalEngagementTime / engagedCount / 1000 / 60).toFixed(1)) : 0;
      
      return { bounceRate, avgEngagement };
    };

    const currentMetrics = calculateSessionMetrics(currentPeriodEvents);
    const prevMetrics = calculateSessionMetrics(prevPeriodEvents);

    // Traffic Chart (Daily or Hourly)
    const trafficMap = {};
    currentPeriodEvents.forEach(e => {
      const isPageView = e.eventName === 'page_view';
      let dateLabel = '';
      if (rangeDays === 1) {
        dateLabel = e.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        dateLabel = e.time.toISOString().split('T')[0].slice(5); // MM-DD
      }

      if (!trafficMap[dateLabel]) trafficMap[dateLabel] = { date: dateLabel, pageViews: 0, sessions: new Set() };
      
      if (isPageView) trafficMap[dateLabel].pageViews++;
      if (e.sessionId) trafficMap[dateLabel].sessions.add(e.sessionId);
    });

    const trafficData = Object.values(trafficMap).map(d => ({
      ...d,
      sessions: d.sessions.size
    })).sort((a, b) => a.date.localeCompare(b.date)); // Very basic sort, works for MM-DD

    // Devices & Browsers
    const deviceMap = { Desktop: 0, Mobile: 0, Tablet: 0 };
    const browserMap = {};
    const seenSessionsDevice = new Set();
    
    currentPeriodEvents.forEach(e => {
      if (!seenSessionsDevice.has(e.sessionId)) {
        seenSessionsDevice.add(e.sessionId);
        const { device, browser } = parseUserAgent(e.userAgent);
        deviceMap[device] = (deviceMap[device] || 0) + 1;
        browserMap[browser] = (browserMap[browser] || 0) + 1;
      }
    });
    
    const deviceData = Object.entries(deviceMap).filter((entry) => entry[1] > 0).map(([name, value]) => ({ name, value }));

    // Top Pages
    const pagesMap = {};
    currentPeriodEvents.filter(e => e.eventName === 'page_view').forEach(e => {
      const path = e.eventData?.path || '/';
      pagesMap[path] = (pagesMap[path] || 0) + 1;
    });
    const topPages = Object.entries(pagesMap).sort((a, b) => b[1] - a[1]).map(([path, views]) => ({ path, views })).slice(0, 10);

    // Locations
    const geoMap = {};
    const seenSessionsGeo = new Set();
    currentPeriodEvents.forEach(e => {
      if (!seenSessionsGeo.has(e.sessionId)) {
        seenSessionsGeo.add(e.sessionId);
        const country = e.eventData?.country || 'Unknown';
        if (country !== 'Unknown') {
          geoMap[country] = (geoMap[country] || 0) + 1;
        }
      }
    });
    const locationData = Object.entries(geoMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));

    // Sources (Referrers)
    const sourceMap = {};
    const seenSessionsSource = new Set();
    currentPeriodEvents.forEach(e => {
      if (!seenSessionsSource.has(e.sessionId)) {
        seenSessionsSource.add(e.sessionId);
        let ref = e.referrer || 'Direct';
        if (ref.includes('google.com')) ref = 'Google Search';
        else if (ref.includes('github.com')) ref = 'GitHub';
        else if (ref.includes('linkedin.com')) ref = 'LinkedIn';
        else if (ref.includes('twitter.com') || ref.includes('t.co')) ref = 'Twitter/X';
        
        sourceMap[ref] = (sourceMap[ref] || 0) + 1;
      }
    });
    const sourceData = Object.entries(sourceMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value }));

    // Performance (Web Vitals)
    const vitals = { LCP: [], CLS: [], INP: [], FCP: [], TTFB: [] };
    currentPeriodEvents.filter(e => e.eventName === 'web_vitals').forEach(e => {
      const name = e.eventData?.metric_name;
      const val = e.eventData?.metric_value;
      if (name && val !== undefined && vitals[name]) {
        vitals[name].push(val);
      }
    });
    const avgVital = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
    const perfData = {
      LCP: avgVital(vitals.LCP),
      CLS: avgVital(vitals.CLS),
      INP: avgVital(vitals.INP),
      FCP: avgVital(vitals.FCP),
      TTFB: avgVital(vitals.TTFB)
    };

    // Portfolio Insights
    const projectViewsMap = {};
    const downloadMap = {};
    const customEventsList = [];
    currentPeriodEvents.forEach(e => {
      if (e.eventName === 'project_view' && e.eventData?.project_title) {
        projectViewsMap[e.eventData.project_title] = (projectViewsMap[e.eventData.project_title] || 0) + 1;
      }
      if (e.eventName === 'download' && e.eventData?.file_type) {
        downloadMap[e.eventData.file_type] = (downloadMap[e.eventData.file_type] || 0) + 1;
      }
      if (['contact_submit', 'download', 'social_click', 'project_view'].includes(e.eventName)) {
        customEventsList.push(e);
      }
    });

    const topProjects = Object.entries(projectViewsMap).sort((a, b) => b[1] - a[1]).map(([title, views]) => ({ title, views })).slice(0, 10);
    const topDownloads = Object.entries(downloadMap).sort((a, b) => b[1] - a[1]).map(([type, count]) => ({ type, count }));
    const recentEvents = customEventsList.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 50);

    // Live Active Users (Last 5 mins)
    const fiveMinsAgo = now.getTime() - 5 * 60 * 1000;
    const activeUsers = new Set(events.filter(e => e.time.getTime() > fiveMinsAgo).map(e => e.sessionId)).size;

    return {
      currentVisitors, prevVisitors,
      currentViews, prevViews,
      currentBounceRate: currentMetrics.bounceRate, prevBounceRate: prevMetrics.bounceRate,
      currentAvgEngagement: currentMetrics.avgEngagement, prevAvgEngagement: prevMetrics.avgEngagement,
      trafficData,
      deviceData,
      topPages,
      locationData,
      sourceData,
      perfData,
      topProjects,
      topDownloads,
      recentEvents,
      activeUsers
    };
  }, [events, dateRange]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-accent">
        <Activity size={32} className="animate-pulse mb-4" />
        <div className="text-sm font-mono tracking-widest uppercase">Loading Analytics...</div>
      </div>
    );
  }

  const ag = aggregations;

  return (
    <div className="space-y-6 rounded-3xl border border-slate-800/80 bg-slate-900/40 p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2.5">
            <Activity className="text-sky-400" size={22} /> 
            Analytics & Live Telemetry
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Real-time visitor performance, session tracking, and interaction analytics.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-bold text-xs font-mono tracking-tight">{ag?.activeUsers || 0} active now</span>
          </div>

          <div className="relative group">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl px-3.5 py-2 pr-9 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/20 hover:border-slate-700 transition-colors"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-1.5 bg-slate-950/70 p-1.5 rounded-2xl border border-slate-800 w-max max-w-full shadow-inner">
        {['overview', 'portfolio', 'events', 'pages', 'geo', 'performance'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab 
                ? 'border border-sky-500/40 bg-sky-500/15 font-bold text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.15)]' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>


      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard 
              title="Unique Visitors" 
              value={ag?.currentVisitors} 
              previousValue={ag?.prevVisitors} 
              icon={Users} 
            />
            <KpiCard 
              title="Total Page Views" 
              value={ag?.currentViews} 
              previousValue={ag?.prevViews} 
              icon={Eye} 
            />
            <KpiCard 
              title="Avg. Engagement Time" 
              value={ag?.currentAvgEngagement || 0} 
              previousValue={ag?.prevAvgEngagement || 0} 
              icon={Clock} 
              unit="m"
            />
            <KpiCard 
              title="Bounce Rate" 
              value={ag?.currentBounceRate || 0} 
              previousValue={ag?.prevBounceRate || 0} 
              icon={MousePointerClick} 
              unit="%"
            />
          </div>

          {/* MAIN CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/30 border border-white/5 rounded-2xl p-6">
              <h3 className="text-white font-bold text-lg mb-6">Traffic Overview</h3>
              <TrafficChart data={ag?.trafficData || []} />
            </div>
            
            <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-6 flex flex-col">
              <h3 className="text-white font-bold text-lg mb-6">Device Breakdown</h3>
              <div className="flex-1 flex flex-col justify-center">
                <DeviceDonutChart data={ag?.deviceData || []} />
                <div className="flex justify-center gap-4 mt-6">
                  {ag?.deviceData?.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ['#38bdf8', '#818cf8', '#34d399'][i % 3] }} />
                      <span className="text-xs text-slate-300 font-medium">{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECONDARY CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Globe className="text-accent" size={20} />
                <h3 className="text-white font-bold text-lg">Top Countries</h3>
              </div>
              <LocationBarChart data={ag?.locationData || []} />
            </div>
            
            <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Search className="text-accent" size={20} />
                <h3 className="text-white font-bold text-lg">Traffic Sources</h3>
              </div>
              <TrafficSourcesChart data={ag?.sourceData || []} />
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PAGES */}
      {activeTab === 'pages' && (
        <div className="bg-slate-900/30 border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-white font-bold text-lg">Top Pages by Views</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Path</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-32 text-right">Views</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-48">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ag?.topPages.length > 0 ? ag.topPages.map((page, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-white">{page.path}</td>
                    <td className="px-6 py-4 text-sm font-bold text-white text-right">{page.views}</td>
                    <td className="px-6 py-4">
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-accent h-full rounded-full" 
                          style={{ width: `${(page.views / ag.topPages[0].views) * 100}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-slate-500">No page view data available for this date range.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PORTFOLIO */}
      {activeTab === 'portfolio' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/30 border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h3 className="text-white font-bold text-lg">Top Viewed Projects</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Project Title</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-32 text-right">Views</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ag?.topProjects.length > 0 ? ag.topProjects.map((project, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-white">{project.title}</td>
                      <td className="px-6 py-4 text-sm font-bold text-white text-right">{project.views}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="2" className="px-6 py-12 text-center text-slate-500">No project view data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-900/30 border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h3 className="text-white font-bold text-lg">Resume Downloads</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">File Format</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-32 text-right">Downloads</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ag?.topDownloads.length > 0 ? ag.topDownloads.map((dl, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-white">{dl.type.toUpperCase()}</td>
                      <td className="px-6 py-4 text-sm font-bold text-white text-right">{dl.count}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="2" className="px-6 py-12 text-center text-slate-500">No download data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: EVENTS */}
      {activeTab === 'events' && (
        <div className="bg-slate-900/30 border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-white font-bold text-lg">Recent Event Stream</h3>
            <p className="text-slate-400 text-sm mt-1">Showing latest 50 custom interactions.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-40">Time</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-48">Event Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Event Data</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-32">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ag?.recentEvents.length > 0 ? ag.recentEvents.map((ev, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">{ev.time.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-accent">{ev.eventName}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-300">
                      {JSON.stringify(Object.fromEntries(
                        Object.entries(ev.eventData || {}).filter(([k]) => k !== 'country' && k !== 'city' && k !== 'countryCode' && !k.startsWith('metric_'))
                      ))}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">{ev.eventData?.country || 'Unknown'}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">No recent custom events found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PERFORMANCE */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-2">Core Web Vitals</h3>
            <p className="text-slate-400 text-sm mb-6">Real-user performance metrics collected directly from visitors' browsers.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <PerformanceGauge label="LCP" value={ag?.perfData?.LCP} type="ms" />
              <PerformanceGauge label="CLS" value={ag?.perfData?.CLS} type="score" />
              <PerformanceGauge label="INP" value={ag?.perfData?.INP} type="ms" />
              <PerformanceGauge label="FCP" value={ag?.perfData?.FCP} type="ms" />
            </div>
          </div>
        </div>
      )}
      
      {/* TAB CONTENT: GEO */}
      {activeTab === 'geo' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/30 border border-white/5 rounded-2xl p-6 h-[500px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold text-lg">Interactive World Map</h3>
              <p className="text-slate-400 text-sm">Real-time session geography</p>
            </div>
            <div className="flex-1 w-full relative">
              <GeoChartLoader activeCountries={ag?.locationData || []} />
            </div>
          </div>
          
          <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-6 h-[500px] flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Globe className="text-accent" size={20} />
              <h3 className="text-white font-bold text-lg">Top Regions</h3>
            </div>
            <div className="flex-1 overflow-hidden">
              <LocationBarChart data={ag?.locationData || []} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AnalyticsDashboard;
