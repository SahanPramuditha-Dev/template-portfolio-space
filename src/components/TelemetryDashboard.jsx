import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Users, Globe, Star, Clock, Flame, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WORLD_MAP_PATHS } from './WorldMapPaths';
import RealtimeTelemetry from './RealtimeTelemetry';

const MOCK_DATA = {
  onlineVisitors: 3,
  visitorsCount: 142,
  visitorsDiff: 12,
  countriesCount: 4,
  topCountriesList: [
    { name: 'Sri Lanka', flag: '🇱🇰', count: 98, percent: 69 },
    { name: 'United States', flag: '🇺🇸', count: 28, percent: 20 },
    { name: 'India', flag: '🇮🇳', count: 10, percent: 7 },
    { name: 'United Kingdom', flag: '🇬🇧', count: 6, percent: 4 }
  ],
  averageSessionText: '2m 14s',
  averageSessionDiff: -3,
  mostViewedProject: 'StudyOS',
  mostViewedProjectCount: 84,
  mostViewedProjectDiff: 16,
  mostViewedProjectLastActive: '2m ago',
  trendingProject: 'Space Portfolio',
  trendingProjectCount: 38,
  trendingProjectDiff: 67,
  devices: [
    { name: 'Desktop', percent: 84, icon: '🖥' },
    { name: 'Laptop', percent: 9, icon: '💻' },
    { name: 'Mobile', percent: 7, icon: '📱' }
  ],
  browsers: [
    { name: 'Chrome', percent: 71 },
    { name: 'Edge', percent: 14 },
    { name: 'Firefox', percent: 9 },
    { name: 'Safari', percent: 6 }
  ],
  sources: [
    { name: 'GitHub', percent: 41 },
    { name: 'Google', percent: 28 },
    { name: 'LinkedIn', percent: 19 },
    { name: 'Direct', percent: 12 }
  ],
  sections: [
    { name: 'Projects', percent: 100 },
    { name: 'Hero', percent: 72 },
    { name: 'Skills', percent: 48 },
    { name: 'Experience', percent: 34 }
  ],
  activityFeed: [
    { text: 'Visitor connected from Sri Lanka', time: '2s ago', type: 'connection' },
    { text: 'Viewed StudyOS project', time: '1m ago', type: 'explore' },
    { text: 'Resume downloaded', time: '3m ago', type: 'download' },
    { text: 'Contact form opened', time: '5m ago', type: 'contact' },
    { text: 'Visitor connected from United States', time: '8m ago', type: 'connection' },
    { text: 'Viewed Experience timeline', time: '12m ago', type: 'explore' },
    { text: 'Project source code downloaded', time: '15m ago', type: 'download' },
    { text: 'Visitor connected from India', time: '20m ago', type: 'connection' }
  ],
  sparklines: {
    visitors: [34, 42, 45, 30, 48, 60, 55, 78, 64, 90, 84, 110, 95, 142],
    countries: [1, 2, 2, 3, 3, 3, 4, 3, 4, 4, 4, 4, 4, 4],
    session: [80, 95, 110, 100, 115, 120, 118, 134, 128, 140, 130, 145, 138, 134],
    topProject: [10, 15, 22, 18, 25, 38, 30, 45, 40, 58, 50, 72, 65, 84],
    trending: [2, 5, 8, 12, 10, 16, 14, 22, 18, 28, 25, 34, 30, 38]
  }
};

// Map country names to two-letter ISO 3166-1 alpha-2 IDs matching the SVG world map
const COUNTRY_CODE_MAP = {
  'Sri Lanka': 'lk',
  'United States': 'us',
  'India': 'in',
  'United Kingdom': 'gb',
  'Germany': 'de',
  'Canada': 'ca',
  'Australia': 'au',
  'Bangladesh': 'bd',
  'Pakistan': 'pk',
  'Japan': 'jp',
  'China': 'cn',
  'France': 'fr',
  'Brazil': 'br'
};

// Center positions for the static flat map SVG (viewBox="30.767 241.591 784.077 458.627")
const getCountryCenter = (countryCode) => {
  const centers = {
    lk: { x: 605, y: 512 },
    us: { x: 200, y: 370 },
    in: { x: 590, y: 445 },
    gb: { x: 418, y: 320 },
    de: { x: 442, y: 326 },
    ca: { x: 210, y: 300 },
    au: { x: 720, y: 590 },
    br: { x: 310, y: 520 },
    bd: { x: 618, y: 448 },
    pk: { x: 574, y: 432 },
    jp: { x: 686, y: 364 },
    cn: { x: 620, y: 390 },
    fr: { x: 428, y: 338 }
  };
  return centers[countryCode] || null;
};

// Helper component to render country flag image reliably on all OS platforms (including Windows)
const CountryFlag = ({ countryName, className = "w-5 h-3.5" }) => {
  const code = COUNTRY_CODE_MAP[countryName]?.toLowerCase() || 'un';
  if (code === 'un') {
    return <span className="text-xs">🌐</span>;
  }
  return (
    <img 
      src={`https://flagcdn.com/w40/${code}.png`} 
      alt={`${countryName} Flag`}
      className={`${className} object-cover rounded shadow-sm border border-white/10 inline-block`}
      onError={(e) => {
        e.target.style.display = 'none';
      }}
    />
  );
};

// Rolling count animation component for numbers
const CountUpNumber = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10) || 0;
    if (end === 0) {
      setCount(value);
      return;
    }
    const duration = 1000; // 1s
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = end / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}</span>;
};

// Custom SVG Sparkline path generator
const generateSparklinePath = (data, width = 120, height = 30) => {
  if (!data || data.length < 2) return '';
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  return data
    .map((val, idx) => {
      const x = idx * step;
      const y = height - ((val - min) / range) * height;
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
};

const generateSparklineFillPath = (data, width = 120, height = 30) => {
  const linePath = generateSparklinePath(data, width, height);
  if (!linePath) return '';
  return `${linePath} L ${width} ${height} L 0 ${height} Z`;
};

const TelemetryDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSandbox, setIsSandbox] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [secondsSinceSync, setSecondsSinceSync] = useState(0);
  const [liveActivities, setLiveActivities] = useState([]);
  const [showMapModal, setShowMapModal] = useState(false);
  const [modalTab, setModalTab] = useState('🗺 World Map');
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [terminalFilter, setTerminalFilter] = useState('ALL');

  useEffect(() => {
    let active = true;

    const fetchTelemetry = async () => {
      try {
        // Allow overriding the telemetry endpoint via Vite env var `VITE_TELEMETRY_URL`.
        // Fallback to the relative `/api/telemetry` so local dev can proxy or use the emulator.
        const url = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_TELEMETRY_URL)
          ? import.meta.env.VITE_TELEMETRY_URL
          : '/api/telemetry';
        console.debug('Telemetry fetch URL:', url);
        const res = await fetch(url);
        if (!res.ok) throw new Error('Uplink query failed');
        const data = await res.json();
        
        if (active) {
          setMetrics(data);
          setIsSandbox(false);
          setLoading(false);
          setSecondsSinceSync(0);
          setLiveActivities(data.activityFeed || []);
        }
      } catch (err) {
        console.warn('Failed to resolve GA4 telemetry, falling back to sandbox mode:', err);
        if (active) {
          setMetrics(MOCK_DATA);
          setIsSandbox(true);
          setLoading(false);
          setSecondsSinceSync(0);
          setLiveActivities(MOCK_DATA.activityFeed || []);
        }
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 30000); // sync every 30 seconds

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Sync count-up timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsSinceSync((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Lock body scroll when map modal is open
  useEffect(() => {
    if (showMapModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showMapModal]);

  // Rotate activity timeline feed randomly to make the console feel active
  useEffect(() => {
    if (!metrics || liveActivities.length === 0) return;
    const ticker = setInterval(() => {
      setLiveActivities(prev => {
        const next = [...prev];
        const last = next.pop();
        if (last) {
          last.time = '2s ago';
          next.forEach(act => {
            if (act.time.includes('s ago')) act.time = `${parseInt(act.time) + 3}s ago`;
          });
          next.unshift(last);
        }
        return next;
      });
    }, 6000);
    return () => clearInterval(ticker);
  }, [metrics, liveActivities]);

  const handleCountryHover = (e, activeCountry) => {
    if (activeCountry) {
      setHoveredCountry({
        name: activeCountry.name,
        count: activeCountry.count,
        percent: activeCountry.percent,
        x: e.clientX,
        y: e.clientY
      });
    } else {
      setHoveredCountry(null);
    }
  };

  const handleCountryMouseMove = (e) => {
    if (hoveredCountry) {
      setHoveredCountry(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
    }
  };

  if (loading) {
    return (
      <div className="bg-secondary/20 p-6 rounded-xl border border-secondary/50 animate-pulse min-h-[220px]" />
    );
  }

  if (!metrics) {
    return null;
  }

  const handleCardClick = (id) => {
    setExpandedCard(prev => (prev === id ? null : id));
  };

  const filteredActivities = liveActivities.filter(act => {
    if (terminalFilter === 'ALL') return true;
    if (terminalFilter === 'SENSORS') return act.type === 'view' || act.type === 'explore';
    if (terminalFilter === 'TRANSFERS') return act.type === 'download';
    if (terminalFilter === 'UPLINKS') return act.type === 'connection';
    return true;
  });

  const sparklines = metrics.sparklines || MOCK_DATA.sparklines;

  return (
    <div className="bg-secondary/20 p-6 rounded-xl border border-secondary/50 hover:border-accent/15 hover:shadow-[0_0_32px_rgba(var(--color-accent-rgb),0.02)] transition-all duration-300 flex flex-col font-mono relative overflow-hidden select-none">
      
      {/* Micro-Animation Injected Styles */}
      <style>{`
        @keyframes slow-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.6; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 0.85; filter: brightness(1); }
          50% { opacity: 1; filter: brightness(1.25) drop-shadow(0 0 2px #ff8a05); }
        }
        @keyframes ticking {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes sweep {
          from { left: -10%; }
          to { left: 110%; }
        }
        .animate-slow-spin { animation: slow-spin 16s linear infinite; }
        .animate-twinkle { animation: twinkle 2.5s ease-in-out infinite; }
        .animate-flicker { animation: flicker 0.4s ease-in-out infinite; }
        .animate-ticking { animation: ticking 1s steps(1) infinite; }
        .animate-sweep { animation: sweep 3s linear infinite; }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34,211,238,0.2);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34,211,238,0.4);
        }
      `}</style>

      {/* Top Header / Live Uplink */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs text-green-400 font-semibold select-none">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-ping inline-block" />
            <span>🟢 {metrics.onlineVisitors} ONLINE</span>
          </div>
          <span className="text-text-muted text-[10px] opacity-70">
            Synced with Firebase {secondsSinceSync}s ago
          </span>
        </div>

        {/* Mode HUD */}
        <div className="flex items-center gap-3">
          {isSandbox ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[10px] text-yellow-400 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse inline-block" />
              <span>Sandbox Mode</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-accent select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping inline-block" />
              <span>Telemetry Uplink Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Primary Metrics Command Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5 text-sm mb-6">
        
        {/* Visitors */}
        <div 
          onClick={() => handleCardClick('visitors')}
          className={`p-4 rounded-lg border flex flex-col justify-between hover:bg-secondary/40 cursor-pointer transition-all duration-300 group md:col-span-2 ${
            expandedCard === 'visitors' 
              ? 'bg-secondary/50 border-accent/60 shadow-[0_0_24px_rgba(var(--color-accent-rgb),0.1)]' 
              : 'bg-secondary/30 border-secondary/40 hover:border-accent/40 hover:shadow-[0_0_16px_rgba(var(--color-accent-rgb),0.06)]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 text-text-muted opacity-70 mb-2 text-[11px]">
              <span className="uppercase tracking-wider">Unique Visitors</span>
              <Users size={15} className="text-accent animate-pulse" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-text">
                <CountUpNumber value={metrics.visitorsCount} />
              </span>
              <span className="text-[10px] text-green-400 font-semibold bg-green-400/10 px-1.5 py-0.5 rounded">
                ↑ +{metrics.visitorsDiff}%
              </span>
            </div>
          </div>
          
          <div className="flex items-end justify-between gap-4 mt-4">
            <span className="text-[10px] text-text-muted opacity-70">
              Active users (30d)
            </span>
            {/* Tiny Sparkline */}
            <svg className="w-24 h-6 text-accent overflow-visible opacity-80" viewBox="0 0 120 30">
              <path d={generateSparklinePath(sparklines.visitors)} fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d={generateSparklineFillPath(sparklines.visitors)} fill="url(#cyan-grad)" opacity="0.15" />
              <defs>
                <linearGradient id="cyan-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-accent)" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Countries */}
        <div 
          onClick={() => handleCardClick('countries')}
          className={`p-4 rounded-lg border flex flex-col justify-between hover:bg-secondary/40 cursor-pointer transition-all duration-300 group ${
            expandedCard === 'countries'
              ? 'bg-secondary/50 border-accent/60 shadow-[0_0_20px_rgba(var(--color-accent-rgb),0.08)]'
              : 'bg-secondary/30 border-secondary/40 hover:border-accent/40'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 text-text-muted opacity-70 mb-2 text-[11px]">
              <span className="uppercase tracking-wider">Countries</span>
              <Globe size={15} className="text-accent animate-slow-spin" />
            </div>
            <div className="text-2xl font-bold text-text">
              <CountUpNumber value={metrics.countriesCount} />
            </div>
          </div>
          
          <div className="flex items-end justify-between gap-2 mt-4">
            <span className="text-[10px] text-text-muted opacity-70 truncate max-w-[60px] flex items-center gap-1">
              <CountryFlag countryName={metrics.topCountriesList[0]?.name} className="w-4 h-2.5" />
              <span className="truncate">{metrics.topCountriesList[0]?.name}</span>
            </span>
            <svg className="w-16 h-6 text-accent/80 overflow-visible" viewBox="0 0 120 30">
              <path d={generateSparklinePath(sparklines.countries)} fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Session Time */}
        <div 
          onClick={() => handleCardClick('session')}
          className={`p-4 rounded-lg border flex flex-col justify-between hover:bg-secondary/40 cursor-pointer transition-all duration-300 group ${
            expandedCard === 'session'
              ? 'bg-secondary/50 border-accent/60 shadow-[0_0_20px_rgba(var(--color-accent-rgb),0.08)]'
              : 'bg-secondary/30 border-secondary/40 hover:border-accent/40'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 text-text-muted opacity-70 mb-2 text-[11px]">
              <span className="uppercase tracking-wider">Avg Session</span>
              <Clock size={15} className="text-accent animate-ticking" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-text">
                {metrics.averageSessionText}
              </span>
              <span className="text-[9px] text-amber-400 bg-amber-400/10 px-1 py-0.2 rounded">
                ↓ {metrics.averageSessionDiff}%
              </span>
            </div>
          </div>
          
          <div className="flex items-end justify-between gap-2 mt-4">
            <span className="text-[10px] text-text-muted opacity-70">
              Average duration
            </span>
            <svg className="w-16 h-6 text-accent/80 overflow-visible" viewBox="0 0 120 30">
              <path d={generateSparklinePath(sparklines.session)} fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Top Project */}
        <div 
          onClick={() => handleCardClick('project')}
          className={`p-4 rounded-lg border flex flex-col justify-between hover:bg-secondary/40 cursor-pointer transition-all duration-300 group ${
            expandedCard === 'project'
              ? 'bg-secondary/50 border-amber-500/70 shadow-[0_0_24px_rgba(245,158,11,0.15)]'
              : 'bg-secondary/30 border-secondary/40 hover:border-amber-500/40 hover:shadow-[0_0_16px_rgba(245,158,11,0.06)]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 text-amber-500/80 mb-2 text-[11px]">
              <span className="uppercase tracking-wider font-bold">Top Project</span>
              <Star size={15} className="text-amber-400 animate-twinkle fill-amber-400/20" />
            </div>
            <div className="text-[14px] font-bold text-text truncate max-w-full" title={metrics.mostViewedProject}>
              {metrics.mostViewedProject}
            </div>
          </div>
          
          <div className="flex items-end justify-between gap-2 mt-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-text font-semibold">{metrics.mostViewedProjectCount} views</span>
              <span className="text-[8px] text-green-400 font-mono">+{metrics.mostViewedProjectDiff}% today</span>
            </div>
            <svg className="w-12 h-6 text-amber-500/85 overflow-visible" viewBox="0 0 120 30">
              <path d={generateSparklinePath(sparklines.topProject)} fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

      </div>

      {/* Slide-Down Expandable Insights Console */}
      <AnimatePresence>
        {expandedCard && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden border-t border-white/5 pt-4 mb-6"
          >
            {expandedCard === 'visitors' && (
              <div className="grid gap-6 sm:grid-cols-3 text-xs">
                
                {/* Column 1: Browser Distribution */}
                <div className="p-4 bg-secondary/20 rounded-lg border border-secondary/40">
                  <div className="font-bold text-accent mb-3 uppercase tracking-wider text-[10px]">Browser Distribution</div>
                  <div className="space-y-3">
                    {metrics.browsers.map(b => (
                      <div key={b.name}>
                        <div className="flex justify-between mb-1 text-[10px] text-text-muted">
                          <span>🌐 {b.name}</span>
                          <span className="font-bold text-text">{b.percent}%</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full" style={{ width: `${b.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: Operating Systems */}
                <div className="p-4 bg-secondary/20 rounded-lg border border-secondary/40">
                  <div className="font-bold text-accent mb-3 uppercase tracking-wider text-[10px]">Operating Systems</div>
                  <div className="space-y-3">
                    {[
                      { name: 'Windows', percent: 62, icon: '🪟' },
                      { name: 'macOS', percent: 21, icon: '🍎' },
                      { name: 'Linux', percent: 10, icon: '🐧' },
                      { name: 'iOS/Android', percent: 7, icon: '📱' }
                    ].map(os => (
                      <div key={os.name}>
                        <div className="flex justify-between mb-1 text-[10px] text-text-muted">
                          <span>{os.icon} {os.name}</span>
                          <span className="font-bold text-text">{os.percent}%</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full" style={{ width: `${os.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 3: Visitor Devices */}
                <div className="p-4 bg-secondary/20 rounded-lg border border-secondary/40">
                  <div className="font-bold text-accent mb-3 uppercase tracking-wider text-[10px]">Visitor Devices</div>
                  <div className="space-y-3">
                    {metrics.devices.map(d => (
                      <div key={d.name}>
                        <div className="flex justify-between mb-1 text-[10px] text-text-muted">
                          <span>{d.icon} {d.name}</span>
                          <span className="font-bold text-text">{d.percent}%</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full" style={{ width: `${d.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {expandedCard === 'countries' && (
              <div className="space-y-6">
                <div className="p-4 bg-secondary/20 rounded-lg border border-secondary/40 text-xs">
                  <div className="font-bold text-accent mb-3 uppercase tracking-wider text-[10px]">Geographic Sectors</div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {metrics.topCountriesList.map(c => (
                      <div key={c.name} className="flex items-center justify-between p-2.5 bg-secondary/35 rounded border border-secondary/45">
                        <div className="flex items-center gap-2">
                          <CountryFlag countryName={c.name} className="w-5 h-3.5" />
                          <span className="font-bold text-text">{c.name}</span>
                        </div>
                        <div className="flex items-baseline gap-2 font-mono">
                          <span className="text-text font-bold">{c.count} hits</span>
                          <span className="text-accent text-[10px]">{c.percent}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Embedded Geographic World Map */}
                <div className="text-xs">
                  <div 
                    onDoubleClick={() => {
                      setShowMapModal(true);
                      setModalTab('🗺 World Map');
                    }}
                    className="p-6 bg-secondary/35 rounded-lg border border-secondary/40 overflow-hidden cursor-zoom-in group/map relative min-w-0"
                    title="Double click to enlarge"
                  >
                    <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                      <span className="font-bold text-accent uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        Geo Telemetry & User Distribution
                      </span>
                      <span className="text-[8px] text-text-muted opacity-50 select-none group-hover/map:opacity-80 transition-opacity">
                        ⤢ double click to enlarge
                      </span>
                    </div>

                    <div className="grid md:grid-cols-[2fr_1fr] gap-6 items-center">
                      {/* SVG Map Container */}
                      <div className="w-full flex items-center justify-center p-3 bg-black/35 rounded-lg border border-white/5 relative">
                        <svg 
                          className="w-full h-auto text-white/10 max-h-[300px]" 
                          viewBox="30.767 241.591 784.077 458.627" 
                          fill="currentColor"
                        >
                          {WORLD_MAP_PATHS.map((country, idx) => {
                            const countryCode = country.id;
                            const activeCountry = metrics.topCountriesList.find(
                              c => COUNTRY_CODE_MAP[c.name]?.toLowerCase() === countryCode
                            );
                            
                            return (
                              <path
                                key={`${countryCode}-${idx}`}
                                d={country.d}
                                className={`${
                                  activeCountry 
                                    ? 'fill-cyan-500/80 stroke-cyan-400/40' 
                                    : 'fill-white/5 stroke-white/10'
                                } transition-all duration-300`}
                              />
                            );
                          })}

                          {metrics.topCountriesList.map((c) => {
                            const code = COUNTRY_CODE_MAP[c.name]?.toLowerCase();
                            const center = getCountryCenter(code);
                            if (!center) return null;
                            return (
                              <g key={`beacon-small-${code}`}>
                                <circle
                                  cx={center.x}
                                  cy={center.y}
                                  r="6"
                                  className="fill-accent/15 stroke-accent/40 animate-ping"
                                />
                                <circle
                                  cx={center.x}
                                  cy={center.y}
                                  r="2.5"
                                  className="fill-cyan-400 stroke-black/50 stroke-[0.5]"
                                />
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                      
                      {/* Stats Breakdown Panel */}
                      <div className="flex flex-col justify-between h-full py-1">
                        <div>
                          <h4 className="text-[10px] text-accent uppercase tracking-wider mb-3 font-mono">Visitor Locations</h4>
                          <div className="space-y-3 font-mono text-[10px]">
                            {metrics.topCountriesList.map((c) => (
                              <div key={c.name} className="flex items-center justify-between border-b border-white/[0.03] pb-2">
                                <span className="text-text flex items-center gap-2">
                                  <CountryFlag countryName={c.name} className="w-4 h-3 rounded-[1px] border border-white/5" />
                                  <span>{c.name}</span>
                                </span>
                                <span className="font-bold text-accent">{c.count} sessions ({c.percent}%)</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mt-6 text-[9px] text-text-muted font-mono leading-relaxed bg-primary/20 border border-white/5 rounded p-3 select-none">
                          📍 Beacons represent live uplink sectors. Double click the map to view in full screen and hover over sectors for detailed metrics.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {expandedCard === 'session' && (
              <div className="grid gap-6 sm:grid-cols-2 text-xs">
                <div className="p-4 bg-secondary/20 rounded-lg border border-secondary/40">
                  <div className="font-bold text-accent mb-3 uppercase tracking-wider text-[10px]">Traffic Acquisition Channels</div>
                  <div className="space-y-3">
                    {metrics.sources.map(s => (
                      <div key={s.name}>
                        <div className="flex justify-between mb-1">
                          <span>🔗 {s.name}</span>
                          <span className="font-bold">{s.percent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full" style={{ width: `${s.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-secondary/20 rounded-lg border border-secondary/40 flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-accent mb-2 uppercase tracking-wider text-[10px]">Telemetry Insights</div>
                    <p className="text-[11px] leading-relaxed text-text-muted opacity-80">
                      Uplink calculations report active user focus mostly on direct link referrals and GitHub. The average visitor session duration remains stable compared to last week.
                    </p>
                  </div>
                  <span className="text-[9px] text-accent/60 mt-3 select-none">
                    * Data retrieved from Google Analytics Data Pipeline v1beta.
                  </span>
                </div>
              </div>
            )}

            {expandedCard === 'project' && (
              <div className="grid gap-6 sm:grid-cols-2 text-xs">
                <div className="p-4 bg-secondary/20 rounded-lg border border-secondary/40">
                  <div className="font-bold text-accent mb-3 uppercase tracking-wider text-[10px]">Most Viewed Sections</div>
                  <div className="space-y-3">
                    {metrics.sections && metrics.sections.map(s => (
                      <div key={s.name}>
                        <div className="flex justify-between mb-1">
                          <span>📂 {s.name}</span>
                          <span className="font-bold">{s.percent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${s.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-secondary/20 rounded-lg border border-secondary/40">
                  <div className="font-bold text-amber-500 mb-3 uppercase tracking-wider text-[10px]">Project Leaderboard</div>
                  <div className="space-y-2.5">
                    <div className="flex justify-between font-bold border-b border-white/5 pb-1 mb-1 text-[10px] text-text-muted">
                      <span>PROJECT</span>
                      <span>TOTAL VIEWS</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text">🥇 {metrics.mostViewedProject}</span>
                      <span className="font-bold">{metrics.mostViewedProjectCount} hits</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text">🥈 {metrics.trendingProject}</span>
                      <span className="font-bold">{metrics.trendingProjectCount} hits</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Zoom Modal Overlay via React Portal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showMapModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6"
              onDoubleClick={() => setShowMapModal(false)}
              onMouseMove={handleCountryMouseMove}
            >
              <motion.div
                initial={{ scale: 0.92, y: 30, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.92, y: 30, opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300, mass: 0.8 }}
                className="bg-primary/95 border border-secondary/60 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto font-mono flex flex-col relative shadow-[0_0_50px_rgba(var(--color-accent-rgb),0.15)]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header with tabs */}
                <div className="mb-4 border-b border-white/5 pb-3">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <span className="font-bold text-accent uppercase tracking-wider text-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      Geo Telemetry — Deep Analytics
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-[9px] text-text-muted select-none animate-pulse">
                        📍 Hover beacon • Click to focus country
                      </span>
                      <button
                        onClick={() => setShowMapModal(false)}
                        className="text-text-muted hover:text-text cursor-pointer transition-colors text-base leading-none"
                        aria-label="Close modal"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  {/* Tab Bar */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {['🗺 World Map', '📊 Country Stats', '🖥 Tech Stack', '🔗 Traffic Sources'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setModalTab(tab)}
                        className={`px-3 py-1 rounded text-[10px] font-mono tracking-wide transition-all ${
                          modalTab === tab
                            ? 'bg-cyan-500/20 border border-cyan-400/60 text-cyan-300'
                            : 'border border-white/10 text-text-muted hover:text-text hover:border-white/20'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TAB 1 — World Map */}
                {modalTab === '🗺 World Map' && (
                  <div className="space-y-5">
                    <div className="w-full flex items-center justify-center p-4 bg-black/45 rounded-lg border border-white/5 relative overflow-hidden group/modalmap">
                      <svg
                        className="w-full h-auto text-white/10 max-h-[55vh]"
                        viewBox="30.767 241.591 784.077 458.627"
                        fill="currentColor"
                      >
                        {WORLD_MAP_PATHS.map((country, idx) => {
                          const countryCode = country.id;
                          const activeCountry = metrics.topCountriesList.find(
                            c => COUNTRY_CODE_MAP[c.name]?.toLowerCase() === countryCode
                          );
                          const isSelected = selectedCountry?.name === activeCountry?.name;
                          return (
                            <path
                              key={`modal-${countryCode}-${idx}`}
                              d={country.d}
                              onClick={() => { if (activeCountry) setSelectedCountry(activeCountry); }}
                              onMouseEnter={(e) => { if (activeCountry) handleCountryHover(e, activeCountry); }}
                              onMouseLeave={() => handleCountryHover(null, null)}
                              className={`${
                                activeCountry
                                  ? isSelected
                                    ? 'fill-cyan-400 stroke-cyan-300 stroke-2 cursor-pointer'
                                    : 'fill-cyan-500/80 stroke-cyan-400/45 hover:fill-cyan-400 hover:stroke-cyan-300 cursor-pointer'
                                  : 'fill-white/5 stroke-white/10 hover:fill-white/10'
                              } transition-all duration-300`}
                            />
                          );
                        })}
                        {metrics.topCountriesList.map((c) => {
                          const code = COUNTRY_CODE_MAP[c.name]?.toLowerCase();
                          const center = getCountryCenter(code);
                          if (!center || code === 'lk') return null;
                          return (
                            <g key={`arcs-modal-${code}`} className="pointer-events-none">
                              <path
                                d={`M 605 512 Q ${(605 + center.x) / 2} ${Math.min(512, center.y) - 60} ${center.x} ${center.y}`}
                                fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="4,4" className="opacity-30"
                              />
                              <circle r="3" fill="#22d3ee">
                                <animateMotion dur="3s" repeatCount="indefinite"
                                  path={`M 605 512 Q ${(605 + center.x) / 2} ${Math.min(512, center.y) - 60} ${center.x} ${center.y}`}
                                />
                              </circle>
                            </g>
                          );
                        })}
                        {metrics.topCountriesList.map((c) => {
                          const code = COUNTRY_CODE_MAP[c.name]?.toLowerCase();
                          const center = getCountryCenter(code);
                          if (!center) return null;
                          const isSelected = selectedCountry?.name === c.name;
                          return (
                            <g key={`beacon-modal-${code}`} onClick={() => setSelectedCountry(c)} className="cursor-pointer">
                              <circle cx={center.x} cy={center.y} r={isSelected ? 16 : 12}
                                className={`${isSelected ? 'fill-cyan-400/30 stroke-cyan-300' : 'fill-accent/25 stroke-accent/40'} animate-ping`} />
                              <circle cx={center.x} cy={center.y} r={isSelected ? 6 : 4.5}
                                className="fill-cyan-400 stroke-white/90 stroke-1"
                                onMouseEnter={(e) => handleCountryHover(e, c)}
                                onMouseLeave={() => handleCountryHover(null, null)} />
                            </g>
                          );
                        })}
                      </svg>
                    </div>

                    {/* Selected Country spotlight under map */}
                    {selectedCountry ? (
                      <div className="p-4 bg-cyan-950/20 border border-cyan-400/30 rounded-lg flex flex-wrap items-center gap-6 text-[11px] animate-fadeIn">
                        <div className="flex items-center gap-2">
                          <CountryFlag countryName={selectedCountry.name} className="w-7 h-5 rounded border border-white/10" />
                          <span className="text-text font-bold text-sm">{selectedCountry.name}</span>
                        </div>
                        <div className="flex gap-6 flex-wrap">
                          <div><div className="text-[8px] uppercase tracking-widest text-text-muted">Sessions</div><div className="text-cyan-300 font-bold text-base">{selectedCountry.count}</div></div>
                          <div><div className="text-[8px] uppercase tracking-widest text-text-muted">Share</div><div className="text-cyan-300 font-bold text-base">{selectedCountry.percent}%</div></div>
                          <div><div className="text-[8px] uppercase tracking-widest text-text-muted">Avg Session</div><div className="text-text font-semibold">{metrics.averageSessionText}</div></div>
                          <div><div className="text-[8px] uppercase tracking-widest text-text-muted">Top Project</div><div className="text-amber-400 font-semibold">{metrics.mostViewedProject}</div></div>
                        </div>
                        <div className="ml-auto">
                          <div className="text-[8px] uppercase tracking-widest text-text-muted mb-1">Traffic Share</div>
                          <div className="w-40 h-2 bg-secondary/50 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${selectedCountry.percent}%` }} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-[10px] text-text-muted font-mono py-2">
                        Click a beacon or highlighted country to inspect its metrics
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2 — Country Stats */}
                {modalTab === '📊 Country Stats' && (
                  <div className="space-y-4">
                    {/* Summary bar */}
                    <div className="grid grid-cols-3 gap-3 text-[10px] font-mono">
                      <div className="bg-secondary/20 border border-white/5 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-accent">{metrics.countriesCount}</div>
                        <div className="text-text-muted text-[8px] uppercase tracking-wider mt-1">Active Countries</div>
                      </div>
                      <div className="bg-secondary/20 border border-white/5 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-text">{metrics.visitorsCount}</div>
                        <div className="text-text-muted text-[8px] uppercase tracking-wider mt-1">Total Sessions</div>
                      </div>
                      <div className="bg-secondary/20 border border-white/5 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-green-400">{metrics.onlineVisitors}</div>
                        <div className="text-text-muted text-[8px] uppercase tracking-wider mt-1">Live Right Now</div>
                      </div>
                    </div>

                    {/* Country breakdown table */}
                    <div className="rounded-lg border border-white/5 overflow-hidden">
                      <div className="grid grid-cols-[2fr_1fr_1fr_2fr] gap-2 px-4 py-2 bg-secondary/30 text-[8px] uppercase tracking-wider text-text-muted font-bold">
                        <span>Country</span><span className="text-right">Sessions</span><span className="text-right">Share</span><span className="text-right">Traffic Bar</span>
                      </div>
                      {metrics.topCountriesList.map((c, i) => (
                        <div
                          key={c.name}
                          onClick={() => { setSelectedCountry(c); setModalTab('🗺 World Map'); }}
                          className={`grid grid-cols-[2fr_1fr_1fr_2fr] gap-2 px-4 py-3 items-center text-[11px] border-t border-white/[0.04] cursor-pointer transition-colors hover:bg-cyan-950/20 ${i === 0 ? 'bg-secondary/10' : ''}`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <CountryFlag countryName={c.name} className="w-5 h-3.5 rounded-sm flex-shrink-0 border border-white/10" />
                            <span className="text-text font-medium truncate">{c.name}</span>
                            {i === 0 && <span className="text-[7px] bg-amber-400/20 border border-amber-400/30 text-amber-300 px-1 rounded">TOP</span>}
                          </div>
                          <div className="text-right font-bold text-text">{c.count}</div>
                          <div className="text-right font-bold text-accent">{c.percent}%</div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                              <div className="h-full bg-cyan-400/70 rounded-full transition-all" style={{ width: `${c.percent}%` }} />
                            </div>
                            <span className="text-[8px] text-text-muted">{c.percent}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-[9px] text-text-muted font-mono text-center opacity-60">
                      Click any row to locate on the world map
                    </div>
                  </div>
                )}

                {/* TAB 3 — Tech Stack (Devices & Browsers) */}
                {modalTab === '🖥 Tech Stack' && (
                  <div className="grid sm:grid-cols-2 gap-5 text-[11px]">
                    {/* Devices */}
                    <div className="bg-secondary/20 border border-white/5 rounded-lg p-4">
                      <div className="text-[10px] uppercase tracking-wider text-accent mb-4 font-bold">Device Types</div>
                      <div className="space-y-3">
                        {(metrics.devices || []).map((d) => (
                          <div key={d.name}>
                            <div className="flex justify-between mb-1">
                              <span className="text-text-muted">{d.icon || '🖥'} {d.name}</span>
                              <span className="font-bold text-text">{d.percent}%</span>
                            </div>
                            <div className="w-full h-2 bg-secondary/50 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${d.percent}%`, background: 'linear-gradient(90deg, #22d3ee, #38bdf8)' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Browsers */}
                    <div className="bg-secondary/20 border border-white/5 rounded-lg p-4">
                      <div className="text-[10px] uppercase tracking-wider text-accent mb-4 font-bold">Browser Distribution</div>
                      <div className="space-y-3">
                        {(metrics.browsers || []).map((b) => (
                          <div key={b.name}>
                            <div className="flex justify-between mb-1">
                              <span className="text-text-muted">{b.name}</span>
                              <span className="font-bold text-text">{b.percent}%</span>
                            </div>
                            <div className="w-full h-2 bg-secondary/50 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${b.percent}%`, background: 'linear-gradient(90deg, #a78bfa, #818cf8)' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Page section engagement */}
                    <div className="bg-secondary/20 border border-white/5 rounded-lg p-4 sm:col-span-2">
                      <div className="text-[10px] uppercase tracking-wider text-accent mb-4 font-bold">Page Section Engagement</div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {(metrics.sections || []).map((s) => (
                          <div key={s.name} className="text-center">
                            <div className="relative mx-auto mb-2 w-14 h-14">
                              <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                                <circle cx="18" cy="18" r="16" fill="none" stroke="#334155" strokeWidth="3" />
                                <circle cx="18" cy="18" r="16" fill="none" stroke="#22d3ee" strokeWidth="3"
                                  strokeDasharray={`${s.percent} 100`} strokeLinecap="round" />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-accent">{s.percent}%</div>
                            </div>
                            <div className="text-[9px] text-text-muted">{s.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4 — Traffic Sources */}
                {modalTab === '🔗 Traffic Sources' && (
                  <div className="space-y-4">
                    <div className="bg-secondary/20 border border-white/5 rounded-lg p-4">
                      <div className="text-[10px] uppercase tracking-wider text-accent mb-4 font-bold">Referral Traffic Breakdown</div>
                      <div className="space-y-4">
                        {(metrics.sources || []).map((s, i) => {
                          const colors = ['#22d3ee', '#a78bfa', '#34d399', '#f59e0b'];
                          return (
                            <div key={s.name} className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colors[i % colors.length] }} />
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between mb-1">
                                  <span className="text-text truncate text-[11px]">{s.name}</span>
                                  <span className="font-bold text-[11px]" style={{ color: colors[i % colors.length] }}>{s.percent}%</span>
                                </div>
                                <div className="w-full h-2 bg-secondary/50 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.percent}%`, background: colors[i % colors.length] }} />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Top 2 projects */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { label: '🥇 Most Viewed', name: metrics.mostViewedProject, count: metrics.mostViewedProjectCount, diff: metrics.mostViewedProjectDiff, last: metrics.mostViewedProjectLastActive, color: 'amber' },
                        { label: '📈 Trending', name: metrics.trendingProject, count: metrics.trendingProjectCount, diff: metrics.trendingProjectDiff, last: '5 min ago', color: 'green' }
                      ].map((p) => (
                        <div key={p.label} className={`bg-secondary/20 border border-white/5 rounded-lg p-4`}>
                          <div className="text-[9px] uppercase tracking-wider text-text-muted mb-2">{p.label}</div>
                          <div className={`text-base font-bold ${p.color === 'amber' ? 'text-amber-400' : 'text-green-400'}`}>{p.name}</div>
                          <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
                            <div><div className="text-text-muted text-[8px]">Views</div><div className="font-bold text-text">{p.count}</div></div>
                            <div><div className="text-text-muted text-[8px]">Growth</div><div className={`font-bold ${p.color === 'amber' ? 'text-amber-400' : 'text-green-400'}`}>+{p.diff}%</div></div>
                            <div><div className="text-text-muted text-[8px]">Last Active</div><div className="font-bold text-text">{p.last}</div></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-5 text-center text-[9px] text-text-muted opacity-50 font-mono">
                  Double-click anywhere outside to close • Data refreshes every 30s
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Floating Hover Tooltip Panel */}
      {showMapModal && hoveredCountry && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="fixed z-[10000] pointer-events-none bg-primary/95 border border-accent/50 p-4 rounded-lg shadow-2xl font-mono text-[9px] leading-relaxed max-w-[240px] shadow-[0_0_24px_rgba(34,211,238,0.15)]"
          style={{ left: `${hoveredCountry.x + 12}px`, top: `${hoveredCountry.y + 12}px` }}
        >
          <div className="font-bold text-accent mb-2 flex items-center gap-1.5 border-b border-white/5 pb-1.5 select-none">
            <CountryFlag countryName={hoveredCountry.name} className="w-4 h-2.5" />
            <span>{hoveredCountry.name.toUpperCase()} Telemetry</span>
          </div>
          <div className="space-y-1 text-text-muted">
            <div>👥 Visitors: <span className="text-text font-bold">{hoveredCountry.count}</span></div>
            <div>📊 Share: <span className="text-accent font-bold">{hoveredCountry.percent}%</span></div>
            <div>⚡ Active: <span className="text-green-400 font-bold">1 session</span></div>
            <div>⏱ Avg stay: <span className="text-text">{metrics.averageSessionText}</span></div>
            <div>📂 Focus: <span className="text-amber-400 font-bold">{metrics.mostViewedProject}</span></div>
            <div>🛡 Browser: <span className="text-text">Chrome / Desktop</span></div>
            <div>🛰 Signal: <span className="text-cyan-400">SAT-Uplink-01</span></div>
          </div>
        </motion.div>
      )}

    </div>
  );
};

export default TelemetryDashboard;
