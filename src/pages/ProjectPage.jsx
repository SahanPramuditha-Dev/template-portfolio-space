import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, ExternalLink, Github, Calendar, Layers, Target, Zap, 
  ArrowLeft, ArrowRight, Clock, Code2, Database, Layout, Server, Globe, Boxes, 
  FileText, Download, Lock, Users, Check, ClipboardCopy, Sparkles, Rocket, 
  Lightbulb, Award, Monitor, Smartphone, Moon, Sun, CheckCircle, RefreshCw,
  Search, Terminal, Shield, Cpu, HelpCircle, HardDrive, Share2, Compass, Play, ZoomIn,
  AlertTriangle, Flame, ListChecks, Network, ArrowUpRight, FolderTree,
  Cloud, Activity, MessageSquare, GitBranch, Wifi, Key, Link2, X
} from 'lucide-react';
import SEO from '../components/SEO';
import PageShell from '../components/PageShell';
import PageLoader from '../components/PageLoader';
import ImageWithFallback from '../components/ImageWithFallback';
import ProjectThreeBackground from '../components/ProjectThreeBackground';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import { isUsableHttpUrl } from '../utils/projectUrls';
import { getImpactMetrics, getMediaSlides } from '../utils/projectNormalize';
import { slugify } from '../utils/slugify';
import { renderSimpleMarkdown } from '../utils/markdown';

// ================= SUB-COMPONENT: BEFORE/AFTER COMPARISON SLIDER =================
const ProblemSolutionSlider = ({ beforeCards, afterCards, fallbackProblem, fallbackSolution }) => {
  const [activeState, setActiveState] = useState('before'); // 'before' or 'after'

  const beforeNode = useMemo(() => {
    if (beforeCards && beforeCards.length > 0) return beforeCards[0];
    return { 
      label: 'Legacy Workflows', 
      description: fallbackProblem || 'Fragmented tools creating severe cognitive overload and latency.', 
      imageUrl: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=600&q=80' 
    };
  }, [beforeCards, fallbackProblem]);

  const afterNode = useMemo(() => {
    if (afterCards && afterCards.length > 0) return afterCards[0];
    return { 
      label: 'Optimized Architecture', 
      description: fallbackSolution || 'Streamlined real-time syncing pipelines with sub-second latency.', 
      imageUrl: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=600&q=80' 
    };
  }, [afterCards, fallbackSolution]);

  return (
    <div className="w-full space-y-6">
      {/* Segmented Switch Control */}
      <div className="flex justify-center">
        <div className="p-1 rounded-2xl bg-secondary/35 border border-white/5 flex gap-1 shadow-lg">
          <button
            onClick={() => setActiveState('before')}
            className={`px-6 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 ${
              activeState === 'before'
                ? 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)] font-semibold'
                : 'text-text-muted hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <AlertTriangle size={14} />
            BEFORE (LEGACY STATE)
          </button>
          <button
            onClick={() => setActiveState('after')}
            className={`px-6 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 ${
              activeState === 'after'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] font-semibold'
                : 'text-text-muted hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <CheckCircle size={14} />
            AFTER (OPTIMIZED ENGINE)
          </button>
        </div>
      </div>

      {/* Main Comparative Display Dashboard */}
      <div className="relative w-full min-h-[460px] rounded-3xl border border-white/10 overflow-hidden bg-slate-950/40 p-6 md:p-10 backdrop-blur-md flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {activeState === 'before' ? (
            <motion.div
              key="before-pane"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="grid md:grid-cols-12 gap-8 items-center h-full w-full"
            >
              {/* Text info (Left) */}
              <div className="md:col-span-6 space-y-4 text-left">
                <span className="text-xs font-mono text-red-400 border border-red-500/25 bg-red-500/10 px-3 py-1 rounded-full uppercase tracking-wider font-bold inline-block">
                  LEGACY SYSTEM CRITERIA
                </span>
                <h3 className="text-2xl md:text-3xl font-bold font-display text-white">{beforeNode.label}</h3>
                <p className="text-sm text-text-muted leading-relaxed font-sans">
                  {beforeNode.description}
                </p>
                <div className="pt-4 space-y-2.5 border-t border-white/5 font-mono text-[11px] text-text-muted">
                  <div className="flex items-center gap-2 text-red-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    <X size={14} className="shrink-0 text-red-400" /> Scattered data across disconnected platforms
                  </div>
                  <div className="flex items-center gap-2 text-red-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    <X size={14} className="shrink-0 text-red-400" /> Manual file copying and configuration overhead
                  </div>
                  <div className="flex items-center gap-2 text-red-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    <X size={14} className="shrink-0 text-red-400" /> Average task loads exceeding 3.5 seconds
                  </div>
                </div>
              </div>

              {/* Graphic visualizer (Right) */}
              <div className="md:col-span-6 relative aspect-video rounded-2xl border border-red-500/15 overflow-hidden bg-slate-900 shadow-2xl">
                <img src={beforeNode.imageUrl} alt="Problem State Graphic" className="w-full h-full object-cover opacity-60 filter grayscale sepia hue-rotate-[320deg]" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-red-500/20 border border-red-500/30 text-[9px] font-mono text-red-400 font-bold">
                  LATENCY CRITICAL
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="after-pane"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="grid md:grid-cols-12 gap-8 items-center h-full w-full"
            >
              {/* Text info (Left) */}
              <div className="md:col-span-6 space-y-4 text-left">
                <span className="text-xs font-mono text-emerald-400 border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-wider font-bold inline-block">
                  OPTIMIZED ARCHITECTURE
                </span>
                <h3 className="text-2xl md:text-3xl font-bold font-display text-white">{afterNode.label}</h3>
                <p className="text-sm text-text-muted leading-relaxed font-sans">
                  {afterNode.description}
                </p>
                <div className="pt-4 space-y-2.5 border-t border-white/5 font-mono text-[11px] text-text-muted">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <Check size={14} className="shrink-0 text-emerald-400" /> Single-pane unified control interface
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <Check size={14} className="shrink-0 text-emerald-400" /> Auto database sync and offline caching layers
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <Check size={14} className="shrink-0 text-emerald-400" /> Consistent 60 FPS visual transitions
                  </div>
                </div>
              </div>

              {/* Graphic visualizer (Right) */}
              <div className="md:col-span-6 relative aspect-video rounded-2xl border border-emerald-500/15 overflow-hidden bg-slate-900 shadow-2xl">
                <img src={afterNode.imageUrl} alt="Solution State Graphic" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-[9px] font-mono text-emerald-400 font-bold animate-pulse">
                  OPTIMIZED LIVE
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};


// ================= SUB-COMPONENT: INTERACTIVE ARCHITECTURE GRAPH =================
const SVGArchitectureGraph = ({ nodes, connections }) => {
  const [hoveredNode, setHoveredNode] = useState(null);

  const defaultNodes = [
    { id: 'user', label: 'User Client', desc: 'React browser clients rendering views', icon: 'Smartphone', x: 10, y: 50, color: '#38bdf8' },
    { id: 'cdn', label: 'Edge CDN', desc: 'Global edge cache delivering route chunks', icon: 'Globe', x: 35, y: 50, color: '#10b981' },
    { id: 'db', label: 'Cloud Storage', desc: 'Realtime data store synchronization layer', icon: 'Database', x: 75, y: 50, color: '#a855f7' }
  ];

  const defaultConnections = [
    { from: 'user', to: 'cdn', color: '#38bdf8' },
    { from: 'cdn', to: 'db', color: '#10b981' }
  ];

  const activeNodes = useMemo(() => {
    return Array.isArray(nodes) && nodes.length > 0 ? nodes : defaultNodes;
  }, [nodes]);

  const activeConnections = useMemo(() => {
    return Array.isArray(connections) && connections.length > 0 ? connections : defaultConnections;
  }, [connections]);

  const findNode = (id) => activeNodes.find(n => n.id === id);

  const getIconComponent = (iconName) => {
    const map = {
      Smartphone: Smartphone,
      Globe: Globe,
      Database: Database,
      Shield: Shield,
      Cpu: Cpu,
      Server: Server,
      HardDrive: HardDrive,
      Boxes: Boxes,
      Monitor: Monitor,
      Cloud: Cloud,
      Terminal: Terminal,
      Activity: Activity,
      Lock: Lock,
      MessageSquare: MessageSquare,
      GitBranch: GitBranch,
      Wifi: Wifi,
      Layers: Layers
    };
    return map[iconName] || Cpu;
  };

  return (
    <div className="relative w-full rounded-3xl border border-white/10 bg-secondary/20 p-6 md:p-10 overflow-hidden backdrop-blur-md">
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Connection lines */}
        {activeConnections.map((conn, idx) => {
          const fromNode = findNode(conn.from);
          const toNode = findNode(conn.to);
          if (!fromNode || !toNode) return null;
          
          // Draw curves
          const dx = toNode.x - fromNode.x;
          const dy = toNode.y - fromNode.y;
          const cx1 = fromNode.x + dx * 0.4;
          const cy1 = fromNode.y;
          const cx2 = fromNode.x + dx * 0.6;
          const cy2 = toNode.y;
          const pathD = `M ${fromNode.x} ${fromNode.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${toNode.x} ${toNode.y}`;

          return (
            <React.Fragment key={idx}>
              <motion.path 
                d={pathD} 
                stroke={conn.color || 'rgba(255,255,255,0.1)'} 
                strokeWidth="0.5" 
                fill="none" 
              />
              {/* Traveling signal pulse */}
              <motion.circle r="0.7" fill={conn.color || '#38bdf8'}>
                <animateMotion path={pathD} dur={`${Math.random() * 2 + 3}s`} repeatCount="indefinite" />
              </motion.circle>
            </React.Fragment>
          );
        })}
      </svg>

      <div className="relative w-full h-[350px] md:h-[420px]">
        {activeNodes.map((node) => {
          const NodeIcon = getIconComponent(node.icon);
          const isHovered = hoveredNode === node.id;
          return (
            <div 
              key={node.id} 
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <motion.div 
                className="w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center border transition-all duration-300 relative bg-slate-900"
                style={{ 
                  borderColor: isHovered ? node.color || '#38bdf8' : 'rgba(255,255,255,0.1)',
                  boxShadow: isHovered ? `0 0 20px ${node.color || '#38bdf8'}44` : 'none'
                }}
                whileHover={{ scale: 1.08 }}
              >
                <NodeIcon size={22} style={{ color: isHovered ? node.color || '#38bdf8' : 'rgba(255,255,255,0.6)' }} />
                {isHovered && (
                  <span className="absolute inset-0 rounded-2xl animate-ping border opacity-45" style={{ borderColor: node.color || '#38bdf8' }} />
                )}
              </motion.div>
              <span className="hidden md:block absolute top-[115%] left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] font-bold text-text-muted transition-colors">
                {node.label}
              </span>
            </div>
          );
        })}

        {/* Dynamic Node Detail Panel */}
        <div className="absolute bottom-2 left-2 right-2 md:bottom-4 md:left-4 md:right-auto max-w-sm p-5 rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-xl z-20">
          <AnimatePresence mode="wait">
            {hoveredNode ? (
              <motion.div 
                key={hoveredNode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-1"
              >
                <h5 className="text-sm font-bold flex items-center gap-2" style={{ color: findNode(hoveredNode)?.color || '#38bdf8' }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: findNode(hoveredNode)?.color || '#38bdf8' }} />
                  {findNode(hoveredNode)?.label}
                </h5>
                <p className="text-xs text-text-muted leading-relaxed">{findNode(hoveredNode)?.desc}</p>
              </motion.div>
            ) : (
              <motion.div 
                key="default"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-1 text-text-muted"
              >
                <h5 className="text-sm font-bold text-white flex items-center gap-2">
                  <Network size={14} className="text-accent" />
                  Interactive System Architecture
                </h5>
                <p className="text-xs leading-relaxed">Hover over any system node to inspect APIs, CDNs, and database endpoints.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// ================= SUB-COMPONENT: TIMELINE EXPLORER =================
const TimelineExplorer = ({ milestones }) => {
  const [activeStep, setActiveStep] = useState(0);

  const defaultMilestones = [
    { date: 'Phase 1', title: 'Product Conception', description: 'Architectural research, user journeys, and wireframe designs.', badge: 'Setup', status: 'completed' },
    { date: 'Phase 2', title: 'Database & Auth Layer', description: 'Setting up indexes, security rules, and auth gates.', badge: 'Coding', status: 'completed' }
  ];

  const activeMilestones = useMemo(() => {
    return Array.isArray(milestones) && milestones.length > 0 ? milestones : defaultMilestones;
  }, [milestones]);

  const currentMilestone = activeMilestones[activeStep] || activeMilestones[0];

  const getDeliverables = (title) => {
    const t = title.toLowerCase();
    if (t.includes('concept') || t.includes('plan') || t.includes('design') || t.includes('wireframe') || t.includes('planning')) {
      return [
        { name: 'Define Figma design systems & typography', done: true },
        { name: 'Develop user personas & research metrics', done: true },
        { name: 'Approve data pipeline architecture layout', done: true }
      ];
    }
    if (t.includes('auth') || t.includes('database') || t.includes('backend') || t.includes('firestore') || t.includes('schema') || t.includes('build')) {
      return [
        { name: 'Model document database collections & indices', done: true },
        { name: 'Define Firestore secure read/write rules', done: true },
        { name: 'Configure client JWT credentials & routes', done: true }
      ];
    }
    if (t.includes('api') || t.includes('route') || t.includes('frontend') || t.includes('ui') || t.includes('integrate') || t.includes('core')) {
      return [
        { name: 'Link API gateway handlers with client requests', done: true },
        { name: 'Build dashboard states & telemetry components', done: true },
        { name: 'Verify websocket connection reliability', done: true }
      ];
    }
    return [
      { name: 'Compile production-ready bundle assets', done: true },
      { name: 'Pass core web vitals performance budgets', done: true },
      { name: 'Complete client-side acceptance testing audit', done: currentMilestone.status === 'completed' }
    ];
  };

  const getPhaseTech = (title) => {
    const t = title.toLowerCase();
    if (t.includes('concept') || t.includes('plan') || t.includes('design') || t.includes('wireframe') || t.includes('planning')) {
      return ['Figma', 'Miro', 'Storyboards', 'Markdown'];
    }
    if (t.includes('auth') || t.includes('database') || t.includes('backend') || t.includes('firestore') || t.includes('schema') || t.includes('build')) {
      return ['Firestore', 'JWT Auth', 'TypeScript', 'Node.js'];
    }
    if (t.includes('api') || t.includes('route') || t.includes('frontend') || t.includes('ui') || t.includes('integrate') || t.includes('core')) {
      return ['React.js', 'TailwindCSS', 'Axios', 'WebSockets'];
    }
    return ['ViteJS', 'Jest Tests', 'GitHub CI', 'Vercel Hosting'];
  };

  const deliverables = getDeliverables(currentMilestone.title);
  const techStack = getPhaseTech(currentMilestone.title);

  return (
    <div className="w-full grid md:grid-cols-3 gap-8 rounded-3xl border border-white/10 bg-secondary/15 p-6 md:p-10 backdrop-blur-md relative overflow-hidden">
      
      {/* Background Decorative Glow */}
      <div 
        className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-[100px] pointer-events-none transition-all duration-500 opacity-20"
        style={{
          backgroundColor: currentMilestone.status === 'completed' ? '#10b981' : '#f59e0b'
        }}
      />

      {/* Left milestones steps (Vertical Track Layout with overflow scrolling) */}
      <div className="md:col-span-1 border-r border-white/5 pr-4 space-y-4">
        <span className="text-[10px] font-mono text-accent font-bold uppercase tracking-widest block">MILESTONE PHASES</span>
        
        <div className="relative max-h-[320px] overflow-y-auto pr-1.5 space-y-3 [scrollbar-width:thin] z-10">
          {/* Continuous track line (inside scrollable div to scroll with items) */}
          <div className="absolute left-[15px] top-4 bottom-4 w-[1px] bg-gradient-to-b from-emerald-500/60 via-amber-500/40 to-white/5 pointer-events-none z-0" />

          {activeMilestones.map((m, idx) => {
            const isActive = activeStep === idx;
            const isCompleted = m.status === 'completed';
            const isInProgress = m.status === 'in-progress';
            
            return (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`w-full flex items-center justify-between pl-9 pr-3 py-3.5 rounded-2xl border text-left transition-all relative ${
                  isActive
                    ? 'border-accent/40 bg-accent/10 text-accent font-bold shadow-[0_0_20px_rgba(56,189,248,0.06)]'
                    : 'border-white/5 bg-white/[0.01] text-text-muted hover:border-white/10 hover:bg-white/[0.02]'
                }`}
              >
                {/* Node indicator */}
                <div 
                  className={`absolute left-[10px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 bg-slate-950 flex items-center justify-center transition-all ${
                    isActive 
                      ? 'border-accent ring-4 ring-accent/20 scale-110' 
                      : isCompleted 
                        ? 'border-emerald-400' 
                        : isInProgress 
                          ? 'border-amber-400' 
                          : 'border-slate-500'
                  }`}
                >
                  {isInProgress && <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-75" />}
                </div>

                <div>
                  <p className="text-[9px] font-mono opacity-65 uppercase leading-none mb-1">{m.date}</p>
                  <h5 className="text-xs font-semibold tracking-tight text-white">{m.title}</h5>
                </div>
                
                <span className={`w-1.5 h-1.5 rounded-full ${
                  isCompleted ? 'bg-emerald-400' : isInProgress ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'
                }`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Right detail panel */}
      <div className="md:col-span-2 flex flex-col justify-between space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <div className="flex items-center gap-3">
              {currentMilestone.badge && (
                <span className="px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded bg-accent/25 text-accent border border-accent/20">
                  {currentMilestone.badge}
                </span>
              )}
              <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${
                currentMilestone.status === 'completed' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse'
              }`}>
                {currentMilestone.status}
              </span>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-xl md:text-2xl font-bold font-display text-white">{currentMilestone.title}</h4>
              <p className="text-xs text-text-muted leading-relaxed font-sans max-w-xl">
                {currentMilestone.description}
              </p>
            </div>

            {/* Checklist Deliverables (Resolves empty visual space) */}
            <div className="space-y-2 bg-slate-950/40 p-4 rounded-2xl border border-white/5">
              <span className="text-[9px] font-mono text-text-muted font-bold uppercase tracking-wider block">Key Deliverables Completed</span>
              <div className="grid gap-2">
                {deliverables.map((d, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-[10px] text-white/80">
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] font-bold ${
                      d.done 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-white/5 text-text-muted border border-white/10'
                    }`}>
                      {d.done ? '✓' : '○'}
                    </span>
                    <span className="truncate">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technology stack used during phase */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-text-muted font-bold uppercase tracking-wider block">Phase Technology Stack</span>
              <div className="flex flex-wrap gap-1.5">
                {techStack.map((tech, i) => (
                  <span 
                    key={i} 
                    className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/[0.03] border border-white/5 text-white/70"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        <div className="border-t border-white/5 pt-4 flex items-center justify-between text-xs font-mono text-text-muted">
          <span>STEP {activeStep + 1} OF {activeMilestones.length}</span>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
              disabled={activeStep === 0}
              className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-40"
              aria-label="Previous milestone"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setActiveStep(prev => Math.min(activeMilestones.length - 1, prev + 1))}
              disabled={activeStep === activeMilestones.length - 1}
              className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-40"
              aria-label="Next milestone"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ================= SUB-COMPONENT: REPO & DIRECTORY EXPLORER =================
const buildTreeString = (files) => {
  if (!Array.isArray(files) || files.length === 0) return 'project-root/';
  
  const root = { name: 'root', type: 'dir', children: {} };
  files.forEach(f => {
    const parts = (f.path || '').split('/').filter(Boolean);
    let current = root;
    parts.forEach((part, idx) => {
      const isLast = idx === parts.length - 1;
      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          type: isLast ? 'file' : 'dir',
          children: {}
        };
      }
      current = current.children[part];
    });
  });

  const formatNode = (node, prefix = '') => {
    let result = '';
    const keys = Object.keys(node.children);
    keys.forEach((key, idx) => {
      const child = node.children[key];
      const isLast = idx === keys.length - 1;
      const marker = isLast ? '└── ' : '├── ';
      result += `${prefix}${marker}${child.name}${child.type === 'dir' ? '/' : ''}\n`;
      if (child.type === 'dir') {
        const nextPrefix = prefix + (isLast ? '    ' : '│   ');
        result += formatNode(child, nextPrefix);
      }
    });
    return result;
  };

  return 'project-root/\n' + formatNode(root);
};

// ================= SUB-COMPONENT: REPO & DIRECTORY EXPLORER =================
const FolderExplorer = ({ folderStructureJson }) => {
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);

  const files = useMemo(() => {
    if (Array.isArray(folderStructureJson) && folderStructureJson.length > 0) {
      return folderStructureJson;
    }
    // Fallback default files
    return [
      { 
        path: 'src/App.jsx', 
        code: `import React from 'react';\nimport { MainWorkspace } from './components/MainWorkspace';\nimport { DataProvider } from './context/DataContext';\n\nexport default function App() {\n  return (\n    <DataProvider>\n      <MainWorkspace />\n    </DataProvider>\n  );\n}` 
      },
      { 
        path: 'src/components/MainWorkspace.jsx', 
        code: `import React from 'react';\nimport { useDataSync } from '../hooks/useDataSync';\n\nexport const MainWorkspace = () => {\n  const { data, loading } = useDataSync();\n  return (\n    <div className="p-8 bg-slate-900 border border-white/10">\n      <h3 className="text-xl font-bold">Workspace</h3>\n      <p>{loading ? 'Loading...' : 'Ready'}</p>\n    </div>\n  );\n}` 
      },
      { 
        path: 'src/hooks/useDataSync.js', 
        code: `import { useEffect, useState } from 'react';\n\nexport function useDataSync() {\n  const [data, setData] = useState([]);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    const socket = new WebSocket('wss://api.sync.local');\n    socket.onmessage = (e) => {\n      setData(JSON.parse(e.data));\n      setLoading(false);\n    };\n    return () => socket.close();\n  }, []);\n\n  return { data, loading };\n}` 
      }
    ];
  }, [folderStructureJson]);

  const fileTree = useMemo(() => {
    return buildTreeString(files);
  }, [files]);

  const activeFile = files[selectedFileIdx] || files[0] || { path: 'App.jsx', code: '// No code contents...' };
  const codeString = activeFile.code || '';

  return (
    <div className="w-full rounded-3xl border border-white/10 bg-secondary/15 backdrop-blur-md overflow-hidden grid md:grid-cols-3">
      {/* File Tree Panel */}
      <div className="border-r border-white/10 p-5 bg-slate-950/60 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <span className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">WORKSPACE TREE</span>
          <FolderTree size={14} className="text-accent" />
        </div>
        <div className="font-mono text-xs text-text-muted space-y-1 overflow-y-auto max-h-[300px] [scrollbar-width:thin]">
          <pre className="text-[10px] text-text-muted/80 leading-relaxed select-all">
            {fileTree}
          </pre>
          <div className="border-t border-white/5 pt-3 mt-3 space-y-1">
            <p className="text-[10px] text-accent font-bold font-mono tracking-widest uppercase">MOCK FILE PREVIEWS</p>
            {files.map((file, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedFileIdx(idx)}
                className={`w-full text-left p-1.5 rounded font-mono text-[11px] transition-colors flex items-center gap-2 ${
                  selectedFileIdx === idx ? 'bg-white/10 text-accent font-bold' : 'hover:bg-white/5 text-text-muted'
                }`}
              >
                📄 {file.path ? file.path.split('/').pop() : 'unnamed'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Syntax-Colored Editor View */}
      <div className="md:col-span-2 p-5 bg-slate-950/80 flex flex-col justify-between font-mono text-[11px] text-slate-300 min-h-[320px]">
        <div>
          <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4 text-[10px] text-text-muted">
            <span>SELECTED ATOM: {activeFile.path || 'App.jsx'}</span>
            <span className="text-accent uppercase font-bold tracking-widest">READ_READY</span>
          </div>
          <pre className="whitespace-pre overflow-x-auto text-emerald-300 leading-relaxed [scrollbar-width:thin]">{codeString}</pre>
        </div>
        <div className="border-t border-white/5 pt-3 mt-4 text-[9px] text-text-muted flex justify-between">
          <span>LINES: {codeString.split('\n').length}</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
};

// ================= SUB-COMPONENT: PERFORMANCE BENCHMARK COMPARISON =================
const BenchmarkComparison = ({ benchmarks }) => {
  if (!Array.isArray(benchmarks) || benchmarks.length === 0) return null;

  return (
    <div className="w-full rounded-3xl border border-white/10 bg-secondary/15 p-6 md:p-8 backdrop-blur-md space-y-6">
      <div className="grid md:grid-cols-2 gap-8">
        {benchmarks.map((bench, idx) => {
          const oldVal = Number(bench.oldValue || 0);
          const newVal = Number(bench.newValue || 0);
          const unit = bench.unit || '';
          
          let improvement = 0;
          if (oldVal > 0) {
            if (bench.betterDirection === 'lower') {
              improvement = ((oldVal - newVal) / oldVal) * 100;
            } else {
              improvement = ((newVal - oldVal) / oldVal) * 100;
            }
          }
          const formattedPct = Math.round(improvement);

          const maxVal = Math.max(oldVal, newVal);
          const oldPct = maxVal > 0 ? (oldVal / maxVal) * 100 : 0;
          const newPct = maxVal > 0 ? (newVal / maxVal) * 100 : 0;

          return (
            <div key={idx} className="p-5 rounded-2xl border border-white/5 bg-slate-950/40 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-white">{bench.metricName}</h4>
                  <span className="text-[9px] font-mono text-text-muted">BENCHMARK PERFORMANCE COMPARISON</span>
                </div>
                {formattedPct > 0 && (
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    bench.betterDirection === 'lower' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {formattedPct}% {bench.betterDirection === 'lower' ? 'Faster / Reduced' : 'Higher / Improved'}
                  </span>
                )}
              </div>

              <div className="space-y-3 font-mono text-[11px]">
                <div className="space-y-1">
                  <div className="flex justify-between text-red-400">
                    <span>Legacy State:</span>
                    <span>{oldVal}{unit}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${oldPct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-red-500/50 rounded-full" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-emerald-400">
                    <span>Optimized State:</span>
                    <span>{newVal}{unit}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${newPct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)]" 
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};



// ================= SUB-COMPONENT: TECHNICAL QUESTIONS & ANSWERS ACCORDION =================
const TechnicalFAQ = ({ faqItems }) => {
  const [openIdx, setOpenIdx] = useState(null);

  if (!Array.isArray(faqItems) || faqItems.length === 0) return null;

  return (
    <div className="w-full space-y-3">
      {faqItems.map((faq, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div key={idx} className="rounded-2xl border border-white/10 bg-secondary/15 backdrop-blur-md overflow-hidden transition-colors hover:border-white/15">
            <button
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-white font-display select-none"
            >
              <span>{faq.question}</span>
              <span className={`transform transition-transform duration-300 text-accent font-bold text-lg ${isOpen ? 'rotate-45' : ''}`}>
                +
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="px-5 pb-5 pt-1 border-t border-white/5 text-xs text-text-muted leading-relaxed font-sans">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};



const parseColumns = (columnsStr) => {
  if (!columnsStr) return [];
  return columnsStr.split('\n').filter(Boolean).map(line => {
    const parts = line.split(':');
    const name = parts[0]?.trim() || '';
    const rest = parts[1]?.trim() || '';
    
    let type = rest;
    let keyType = '';
    let fkTarget = '';
    
    const fkMatch = rest.match(/\(FK\s*->\s*([^)]+)\)/i);
    if (fkMatch) {
      keyType = 'FK';
      fkTarget = fkMatch[1].trim();
      type = rest.replace(/\(FK\s*->\s*[^)]+\)/i, '').trim();
    } else {
      const keyMatch = rest.match(/\(([^)]+)\)/);
      if (keyMatch) {
        keyType = keyMatch[1].trim();
        type = rest.replace(/\([^)]+\)/, '').trim();
        if (keyType.toUpperCase() === 'FK') {
          keyType = 'FK';
        }
      }
    }
    
    return { name, type, keyType, fkTarget };
  });
};

// ================= SUB-COMPONENT: VISUAL DB SCHEMA GRAPH =================
const VisualDBSchemaGraph = ({ schemas }) => {
  const [hoveredNode, setHoveredNode] = useState(null);

  // Auto-layout logic for nodes
  const nodes = useMemo(() => {
    const total = schemas.length;
    return schemas.map((schema, idx) => {
      const x = 15 + (70 / (total > 1 ? total - 1 : 1)) * idx;
      const y = 50 + (idx % 2 === 0 ? -15 : 15);
      return {
        id: schema.table,
        label: schema.table,
        desc: schema.description,
        x,
        y,
        color: ['#38bdf8', '#a855f7', '#10b981', '#f59e0b', '#ec4899'][idx % 5]
      };
    });
  }, [schemas]);

  const connections = useMemo(() => {
    const conns = [];
    schemas.forEach((schema) => {
      const cols = parseColumns(schema.columns);
      cols.forEach(c => {
        if (c.keyType === 'FK') {
          let targetTable = c.fkTarget ? c.fkTarget.split('.')[0] : '';
          
          if (!targetTable) {
            let possible = c.name.toLowerCase().replace(/_?id$/, '');
            const match = nodes.find(n => n.id.toLowerCase().startsWith(possible) || possible.startsWith(n.id.toLowerCase()));
            if (match) targetTable = match.id;
          }

          if (targetTable) {
            const toNode = nodes.find(n => n.id === targetTable);
            const fromNode = nodes.find(n => n.id === schema.table);
            if (fromNode && toNode) {
              conns.push({
                from: schema.table,
                to: targetTable,
                color: fromNode.color
              });
            }
          }
        }
      });
    });
    return conns;
  }, [schemas, nodes]);

  return (
    <div className="relative w-full h-[350px] overflow-hidden rounded-2xl border border-white/5 bg-slate-950/40">
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        {connections.map((conn, idx) => {
          const fromNode = nodes.find(n => n.id === conn.from);
          const toNode = nodes.find(n => n.id === conn.to);
          if (!fromNode || !toNode) return null;
          
          const dx = toNode.x - fromNode.x;
          const dy = toNode.y - fromNode.y;
          const cx1 = fromNode.x + dx * 0.4;
          const cy1 = fromNode.y;
          const cx2 = fromNode.x + dx * 0.6;
          const cy2 = toNode.y;
          const pathD = `M ${fromNode.x} ${fromNode.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${toNode.x} ${toNode.y}`;

          return (
            <React.Fragment key={idx}>
              <motion.path d={pathD} stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" fill="none" />
              <motion.circle r="0.8" fill={conn.color}>
                <animateMotion path={pathD} dur={`${Math.random() * 2 + 3}s`} repeatCount="indefinite" />
              </motion.circle>
            </React.Fragment>
          );
        })}
      </svg>
      {nodes.map((node) => {
        const isHovered = hoveredNode === node.id;
        return (
          <div 
            key={node.id} 
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <motion.div 
              className="w-12 h-12 rounded-xl flex flex-col items-center justify-center border transition-all duration-300 relative bg-slate-900 shadow-xl"
              style={{ 
                borderColor: isHovered ? node.color : 'rgba(255,255,255,0.1)',
                boxShadow: isHovered ? `0 0 20px ${node.color}44` : 'none'
              }}
              whileHover={{ scale: 1.1 }}
            >
              <Database size={18} style={{ color: isHovered ? node.color : 'rgba(255,255,255,0.6)' }} />
              {isHovered && <span className="absolute inset-0 rounded-xl animate-ping border opacity-30" style={{ borderColor: node.color }} />}
            </motion.div>
            <span className="absolute top-[120%] left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] font-bold text-white bg-slate-950/80 px-2 py-1 rounded-md border border-white/10">
              {node.label}
            </span>
          </div>
        );
      })}

      <div className="absolute bottom-4 left-4 max-w-sm p-4 rounded-xl border border-white/10 bg-slate-950/90 backdrop-blur-xl z-20 shadow-2xl pointer-events-none">
        <AnimatePresence mode="wait">
          {hoveredNode ? (
            <motion.div 
              key={hoveredNode}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-1.5"
            >
              <h5 className="text-sm font-bold flex items-center gap-2 font-mono" style={{ color: nodes.find(n => n.id === hoveredNode)?.color }}>
                <Database size={14} />
                {nodes.find(n => n.id === hoveredNode)?.label}
              </h5>
              <p className="text-[10px] text-text-muted leading-relaxed font-sans">{nodes.find(n => n.id === hoveredNode)?.desc}</p>
            </motion.div>
          ) : (
            <motion.div 
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-1 text-text-muted"
            >
              <h5 className="text-[11px] font-bold text-white flex items-center gap-2 uppercase tracking-widest font-mono">
                <Network size={12} className="text-accent" />
                Schema Topology
              </h5>
              <p className="text-[10px] leading-relaxed">Hover over a table node to view details. Animated connections represent foreign key relations.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ================= SUB-COMPONENT: DATABASE SCHEMA VIEWER =================
const DBSchemaViewer = ({ schemas }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState('graph');

  const defaultSchemas = [
    { table: 'users', description: 'Core credential entries', columns: 'uid: string (PK)\nemail: string\nrole: string' },
    { table: 'posts', description: 'Blog details logs', columns: 'id: string (PK)\nuid: string (FK -> users.uid)\nbody: text' }
  ];

  const activeSchemas = useMemo(() => {
    return Array.isArray(schemas) && schemas.length > 0 ? schemas : defaultSchemas;
  }, [schemas]);

  const currentSchema = activeSchemas[activeTab] || activeSchemas[0];

  const parsedCols = useMemo(() => {
    return parseColumns(currentSchema.columns);
  }, [currentSchema.columns]);

  const relations = useMemo(() => {
    const tableNames = activeSchemas.map(s => s.table);
    return parsedCols.filter(col => col.keyType === 'FK').map(col => {
      let target = col.fkTarget ? col.fkTarget.split('.')[0] : '';
      if (!target) {
        let possible = col.name.toLowerCase().replace(/_?id$/, '');
        const match = tableNames.find(t => t.toLowerCase().startsWith(possible) || possible.startsWith(t.toLowerCase()));
        if (match) target = match;
      }
      return { ...col, fkTarget: target || 'Unknown' };
    });
  }, [parsedCols, activeSchemas]);

  return (
    <div className="w-full rounded-3xl border border-white/10 bg-secondary/15 p-6 md:p-8 backdrop-blur-md space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
        {viewMode === 'table' ? (
          <div className="flex flex-wrap gap-2">
            {activeSchemas.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`px-4 py-1.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-1.5 ${
                  activeTab === idx
                    ? 'border-accent/40 bg-accent/10 text-accent font-bold shadow-[0_0_15px_rgba(56,189,248,0.05)]'
                    : 'border-white/5 bg-white/[0.02] text-text-muted hover:border-white/10 hover:bg-white/[0.04]'
                }`}
              >
                <Database size={14} className={activeTab === idx ? "text-accent" : "opacity-60"} /> {s.table}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-xs font-mono text-accent font-bold uppercase tracking-widest flex items-center gap-2">
            <Network size={14} /> Global Entity Graph
          </div>
        )}

        <div className="flex bg-slate-950/50 p-1 rounded-xl border border-white/5 shrink-0">
          <button 
            onClick={() => setViewMode('graph')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${viewMode === 'graph' ? 'bg-white/10 text-white shadow-sm' : 'text-text-muted hover:text-white/80'}`}
          >
            <Network size={12} /> Graph
          </button>
          <button 
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${viewMode === 'table' ? 'bg-white/10 text-white shadow-sm' : 'text-text-muted hover:text-white/80'}`}
          >
            <Database size={12} /> Columns
          </button>
        </div>
      </div>

      {viewMode === 'graph' ? (
        <VisualDBSchemaGraph schemas={activeSchemas} />
      ) : (
        <div className="space-y-6 font-mono animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] text-accent font-bold tracking-widest block uppercase">TABLE SUMMARY</span>
              <p className="text-xs text-text-muted leading-relaxed font-sans mt-1">{currentSchema.description}</p>
            </div>

            {relations.length > 0 && (
              <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 space-y-3 shadow-sm">
                <span className="text-[9px] text-text-muted font-bold tracking-wider block uppercase">Relations & Connections</span>
                <div className="space-y-2">
                  {relations.map((rel, idx) => (
                    <div key={idx} className="p-2 rounded bg-white/[0.01] border border-white/5 text-[9px] flex items-center justify-between gap-1 leading-normal">
                      <span className="text-white/80 font-bold">{rel.name}</span>
                      <span className="text-text-muted/40 font-sans">──►</span>
                      <span className="text-accent font-bold truncate" title={rel.fkTarget}>
                        {rel.fkTarget}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <span className="text-[10px] text-accent font-bold tracking-widest block uppercase mb-1">COLUMNS STRUCTURE</span>
            <div className="rounded-2xl border border-white/5 bg-slate-950/40 overflow-hidden">
              
              <div className="grid grid-cols-12 gap-2 border-b border-white/5 px-4 py-2.5 text-[9px] font-mono text-text-muted font-bold bg-slate-950/20 uppercase tracking-wider">
                <div className="col-span-1 flex items-center justify-center">Key</div>
                <div className="col-span-5">Column / Field Name</div>
                <div className="col-span-3">Data Type</div>
                <div className="col-span-3">Constraints</div>
              </div>
              
              <div 
                className="divide-y divide-white/[0.03] h-[200px] overflow-y-auto overscroll-contain outline-none [scrollbar-width:thin]"
                tabIndex={0}
                onMouseEnter={(e) => e.currentTarget.focus()}
              >
                {parsedCols.map((col, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 px-4 py-3 text-xs items-center hover:bg-white/[0.01] transition-all">
                    <div className="col-span-1 flex items-center justify-center">
                      {col.keyType === 'PK' ? (
                        <span title="Primary Key" className="text-amber-400"><Key size={14} /></span>
                      ) : col.keyType === 'FK' ? (
                        <span title="Foreign Key" className="text-sky-400"><Link2 size={14} /></span>
                      ) : (
                        <span className="text-white/5 select-none">-</span>
                      )}
                    </div>
                    <div className="col-span-5 font-mono text-white/95 font-semibold truncate pr-1">
                      {col.name}
                    </div>
                    <div className="col-span-3">
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${
                        ['string', 'text', 'varchar'].includes(col.type.toLowerCase())
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : ['number', 'int', 'float', 'double'].includes(col.type.toLowerCase())
                            ? 'bg-sky-500/10 border-sky-500/20 text-sky-400'
                            : ['boolean', 'bool'].includes(col.type.toLowerCase())
                              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                              : 'bg-white/5 border-white/10 text-text-muted'
                      }`}>
                        {col.type}
                      </span>
                    </div>
                    <div className="col-span-3 flex items-center">
                      {col.keyType ? (
                        <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border font-bold ${
                          col.keyType === 'PK'
                            ? 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                            : 'bg-sky-500/10 border-sky-500/25 text-sky-400'
                        }`}>
                          {col.keyType}
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-white/20">-</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ================= SUB-COMPONENT: MOCK API EXPLORER =================
const APIExplorer = ({ endpoints }) => {
  const [activeEndpointIdx, setActiveEndpointIdx] = useState(0);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const defaultEndpoints = [
    { name: 'Retrieve Profile', endpoint: '/api/v1/profile', method: 'GET', description: 'Returns dashboard configurations.', responseFormat: '{\n  "status": "success",\n  "uid": "123"\n}' }
  ];

  const activeEndpoints = useMemo(() => {
    return Array.isArray(endpoints) && endpoints.length > 0 ? endpoints : defaultEndpoints;
  }, [endpoints]);

  const currentEndpoint = activeEndpoints[activeEndpointIdx] || activeEndpoints[0];

  const runTest = () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      try {
        setTestResult(JSON.parse(currentEndpoint.responseFormat));
      } catch {
        setTestResult({ status: "success", data: currentEndpoint.responseFormat });
      }
    }, 1200);
  };

  useEffect(() => {
    setTestResult(null);
  }, [activeEndpointIdx]);

  return (
    <div className="w-full rounded-3xl border border-white/10 bg-secondary/15 backdrop-blur-md overflow-hidden grid md:grid-cols-5">
      {/* Left Endpoint List */}
      <div className="md:col-span-2 border-r border-white/10 p-5 bg-slate-950/60 space-y-4">
        <span className="text-[10px] font-mono text-accent font-bold uppercase tracking-widest block border-b border-white/5 pb-2">INTEGRATION ENDPOINTS</span>
        <div className="space-y-2 overflow-y-auto max-h-[300px] [scrollbar-width:thin]">
          {activeEndpoints.map((ep, idx) => (
            <button
              key={idx}
              onClick={() => setActiveEndpointIdx(idx)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${
                activeEndpointIdx === idx
                  ? 'border-accent/40 bg-accent/10 text-accent font-bold'
                  : 'border-white/5 bg-white/[0.01] text-text-muted hover:border-white/10 hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  ep.method === 'GET' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {ep.method}
                </span>
                <span className="text-xs font-mono font-semibold truncate">{ep.name}</span>
              </div>
              <p className="text-[10px] font-mono text-text-muted mt-1 truncate">{ep.endpoint}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Right Terminal Console */}
      <div className="md:col-span-3 p-6 bg-slate-950/80 flex flex-col justify-between min-h-[320px] font-mono text-xs">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-text-muted uppercase text-[10px] font-bold">API CONSOLE TESTER</span>
            <span className="text-emerald-400 font-bold uppercase tracking-widest">CONNECTED</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-white/5">
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                currentEndpoint.method === 'GET' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
              }`}>
                {currentEndpoint.method}
              </span>
              <span className="text-xs text-slate-300">{currentEndpoint.endpoint}</span>
            </div>
            <p className="text-[11px] text-text-muted leading-relaxed font-sans">{currentEndpoint.description}</p>
          </div>
          
          {testing && (
            <div className="flex items-center gap-2 text-accent text-xs">
              <RefreshCw size={14} className="animate-spin" /> Fetching pipeline stream response payload...
            </div>
          )}

          {testResult && (
            <div className="space-y-2">
              <span className="text-[10px] text-emerald-400 font-bold tracking-widest block uppercase">RESPONSE PAYLOAD (200 OK)</span>
              <pre className="p-3 bg-slate-900 border border-white/5 rounded-xl text-emerald-300 text-[11px] overflow-x-auto max-h-[160px] [scrollbar-width:thin]">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="border-t border-white/5 pt-4 mt-6 flex items-center justify-between">
          <span className="text-[9px] text-text-muted font-mono">SIMULATION PANEL</span>
          <button
            onClick={runTest}
            disabled={testing}
            className="px-4 py-2 bg-accent text-primary font-bold rounded-xl hover:scale-105 hover:bg-white hover:text-black transition-all text-xs font-mono shadow-[0_0_12px_rgba(56,189,248,0.3)]"
          >
            RUN TEST
          </button>
        </div>
      </div>
    </div>
  );
};

// ================= SUB-COMPONENT: PERFORMANCE PROGRESS RING =================
const ProgressRing = ({ score, label }) => {
  const normalizedScore = Number(score || 100);
  const stroke = 5;
  const radius = 34;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  // Lighthouse-style color logic
  const colorClass = normalizedScore >= 90 ? 'text-emerald-400' : normalizedScore >= 50 ? 'text-amber-400' : 'text-red-400';
  const glowClass = normalizedScore >= 90 ? 'drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : normalizedScore >= 50 ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]';
  const bgGlowClass = normalizedScore >= 90 ? 'group-hover:bg-emerald-500/10' : normalizedScore >= 50 ? 'group-hover:bg-amber-500/10' : 'group-hover:bg-red-500/10';
  const borderClass = normalizedScore >= 90 ? 'group-hover:border-emerald-500/30' : normalizedScore >= 50 ? 'group-hover:border-amber-500/30' : 'group-hover:border-red-500/30';

  // State for counting animation
  const [displayScore, setDisplayScore] = useState(0);
  const hasAnimated = useRef(false);

  return (
    <motion.div 
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      className={`p-6 rounded-3xl border border-white/10 bg-secondary/15 text-center relative overflow-hidden group transition-all duration-300 flex flex-col items-center justify-center space-y-4 ${bgGlowClass} ${borderClass} shadow-lg`}
    >
      <div className="relative w-24 h-24">
        <svg className={`w-full h-full transform -rotate-90 ${glowClass}`} viewBox="0 0 80 80">
          <circle
            className="text-slate-900"
            strokeWidth={stroke}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="40"
            cy="40"
          />
          <motion.circle
            className={colorClass}
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="40"
            cy="40"
            onViewportEnter={() => {
              if (hasAnimated.current) return;
              hasAnimated.current = true;
              let start = 0;
              const duration = 1500;
              const increment = (normalizedScore / duration) * 16;
              const timer = setInterval(() => {
                start += increment;
                if (start >= normalizedScore) {
                  setDisplayScore(normalizedScore);
                  clearInterval(timer);
                } else {
                  setDisplayScore(Math.floor(start));
                }
              }, 16);
            }}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center font-mono text-2xl font-bold ${colorClass}`}>
          {displayScore}
        </span>
      </div>
      <div className="z-10">
        <div className="text-sm font-mono font-bold text-white transition-colors">{label}</div>
        <div className="text-[10px] text-text-muted font-mono tracking-widest mt-1">LIGHTHOUSE AUDIT</div>
      </div>
    </motion.div>
  );
};

// ================= MAIN COMPONENT: INTERACTIVE CASE STUDY =================

export const SectionHero = ({ project, techList, hasLive, hasGithub, slides, heroSlide, scaleX, galleryGroups, galleryFilter, setGalleryFilter, galleryScreenshots, zoomedImage, setZoomedImage, deviceFrameWidth, setDeviceFrameWidth }) => {
  return (
    <>
      {/* ================= 1. CINEMATIC IMMERSIVE HERO ================= */}
        <div className="relative w-[100vw] left-1/2 -translate-x-1/2 mb-16 overflow-hidden min-h-[92vh] flex flex-col justify-center items-center px-4 md:px-8 border-b border-white/5 bg-transparent mt-[-4rem] pt-[4rem]">
          
          {/* Dynamic 3D constellation/particles background */}
          <ProjectThreeBackground effectMode={project.heroThreeJsBg || 'wireframeGlobe'} />

          <div className="max-w-6xl w-full mx-auto grid lg:grid-cols-12 gap-12 items-center relative z-20 pt-8 pb-16">
            
            {/* Title & Floating values */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              <div className="flex flex-wrap items-center gap-3">
                {project.featured && (
                  <span className="px-3.5 py-1 text-[9px] font-mono font-bold uppercase tracking-widest rounded-full bg-accent/20 text-accent border border-accent/30 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
                    FEATURED CASE STUDY
                  </span>
                )}
                {project.category && <span className="text-xs font-mono text-accent uppercase tracking-widest font-semibold">{project.category}</span>}
              </div>

              <h1 className="font-display text-5xl md:text-7xl font-bold text-white tracking-tight drop-shadow-2xl">
                {project.title}
              </h1>

              {project.heroSubtitle && (
                <p className="text-lg md:text-xl text-text-muted font-medium leading-relaxed font-sans">
                  {project.heroSubtitle}
                </p>
              )}

              {/* Stat panel metadata */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/5 font-mono text-xs">
                <div>
                  <div className="text-text-muted mb-1 uppercase tracking-widest text-[9px]">ROLE</div>
                  <div className="text-white font-bold">{project.role || 'Lead Engineer'}</div>
                </div>
                <div>
                  <div className="text-text-muted mb-1 uppercase tracking-widest text-[9px]">DURATION</div>
                  <div className="text-white font-bold">{project.projectTimeline || '3 Months'}</div>
                </div>
                <div>
                  <div className="text-text-muted mb-1 uppercase tracking-widest text-[9px]">TECH STACK</div>
                  <div className="text-accent font-bold truncate max-w-[125px]">{techList[0] || 'React'} + {techList[1] || 'GraphQL'}</div>
                </div>
                <div>
                  <div className="text-text-muted mb-1 uppercase tracking-widest text-[9px]">STATUS</div>
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {project.status || 'Live'}
                  </div>
                </div>
              </div>

              {/* Glowing buttons */}
              <div className="flex flex-wrap gap-4 pt-6">
                {hasLive && (
                  <a href={project.external} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center rounded-2xl bg-accent px-8 font-mono text-xs font-bold uppercase tracking-wider text-primary hover:bg-white hover:text-black transition-all hover:scale-105 shadow-[0_0_20px_rgba(56,189,248,0.3)]">
                    LAUNCH SITE <ExternalLink size={14} className="ml-2" />
                  </a>
                )}
                {hasGithub && (
                  <a href={project.github} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-8 font-mono text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-all hover:scale-105">
                    <Github size={14} className="mr-2" /> SOURCE CODE
                  </a>
                )}
              </div>
            </motion.div>

            {/* Immersive Glassmorphic Mock Browser Preview */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5 relative w-full aspect-video rounded-3xl border border-white/15 bg-slate-950/70 overflow-hidden shadow-2xl backdrop-blur-xl group hover:border-accent/40 transition-colors"
            >
              {heroSlide ? (
                <>
                  {heroSlide.kind === 'video' ? (
                    <video 
                      src={heroSlide.url} 
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                      className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700" 
                    />
                  ) : (
                    <img 
                      src={heroSlide.url} 
                      alt={project.title} 
                      className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700" 
                      loading="eager"
                    />
                  )}
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 to-transparent flex items-center justify-center font-mono text-xs text-text-muted">
                  Interactive Preview Loaded
                </div>
              )}
              {/* Heavy backdrop gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] font-mono text-text-muted bg-slate-950/80 p-3 rounded-xl border border-white/5 backdrop-blur-md">
                <span>SYSTEM VIEW PORTAL</span>
                <span className="text-accent font-bold">READY STREAM</span>
              </div>
            </motion.div>

          </div>

          {/* Mouse interactive scroll down */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 font-mono text-[9px] text-text-muted tracking-widest cursor-pointer select-none">
            <span>SCROLL TO CASE STUDY</span>
            <div className="w-5 h-8 border border-white/20 rounded-full flex justify-center p-1">
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 rounded-full bg-accent" />
            </div>
          </div>
        </div>
    </>
  );
};

export const SectionProductOverview = ({ project, techList, hasLive, hasGithub, slides, heroSlide, scaleX, galleryGroups, galleryFilter, setGalleryFilter, galleryScreenshots, zoomedImage, setZoomedImage, deviceFrameWidth, setDeviceFrameWidth }) => {
  return (
    <>
      {/* ================= 2. PROJECT OVERVIEW & OBJECTIVES (Split Layout) ================= */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start px-4">
            
            {/* Story Summary paragraphs */}
            <div className="space-y-6">
              <span className="text-xs font-mono text-accent uppercase tracking-widest block font-bold">01. Overview & Vision</span>
              <h2 className="text-3xl md:text-5xl font-bold font-display text-white">Narrative Overview</h2>
              <div className="text-text-muted text-sm leading-relaxed space-y-4 font-sans">
                {project.overviewParagraphs ? (
                  project.overviewParagraphs.split('\n\n').map((p, idx) => <p key={idx}>{p}</p>)
                ) : (
                  <p>{project.description || description}</p>
                )}
              </div>
              
              {/* Overview Highlights Cards */}
              {project.overviewCardsJson && project.overviewCardsJson.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-4 pt-6">
                  {project.overviewCardsJson.map((card, idx) => (
                    <div key={idx} className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-accent/20 transition-all space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                        <Sparkles size={16} />
                      </div>
                      <h4 className="text-sm font-bold text-white">{card.title}</h4>
                      <p className="text-xs text-text-muted font-sans leading-relaxed">{card.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Project Objectives */}
            <div className="rounded-3xl border border-white/10 bg-secondary/15 p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                <ListChecks size={20} className="text-accent" />
                <h3 className="font-display text-lg font-bold text-white">Project Objectives</h3>
              </div>
              <ul className="space-y-4">
                {project.objectivesJson && project.objectivesJson.length > 0 ? (
                  project.objectivesJson.map((obj, idx) => (
                    <li key={idx} className="flex gap-4 items-start">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 border border-accent/30 text-accent font-mono text-[9px] font-bold mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-white leading-none">{obj.title}</h4>
                        <p className="text-xs text-text-muted leading-relaxed font-sans">{obj.description}</p>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-text-muted text-xs font-sans">No objectives declared in CMS.</li>
                )}
              </ul>
            </div>

          </div>
        </section>
    </>
  );
};

export const SectionProblemStatement = ({ project, techList, hasLive, hasGithub, slides, heroSlide, scaleX, galleryGroups, galleryFilter, setGalleryFilter, galleryScreenshots, zoomedImage, setZoomedImage, deviceFrameWidth, setDeviceFrameWidth }) => {
  return (
    <>
      {/* ================= 3. PROBLEM & SOLUTION (Curtain slider comparison) ================= */}
        {(project.problem || project.solution) && (
          <section className="py-20">
            <div className="max-w-4xl mx-auto text-center space-y-3 mb-12 px-4">
              <span className="text-xs font-mono text-accent uppercase tracking-widest block font-bold">02. Design Challenge</span>
              <h2 className="text-3xl md:text-5xl font-bold font-display text-white">Problem & Solution Pivot</h2>
            </div>
            <div className="max-w-5xl mx-auto px-4">
              <ProblemSolutionSlider 
                beforeCards={project.beforeAfterJson?.filter(c => c.state === 'before')}
                afterCards={project.beforeAfterJson?.filter(c => c.state === 'after')}
                fallbackProblem={project.problem}
                fallbackSolution={project.solution}
              />
            </div>
          </section>
        )}
    </>
  );
};

export const SectionInteractiveDemo = ({ project, techList, hasLive, hasGithub, slides, heroSlide, scaleX, galleryGroups, galleryFilter, setGalleryFilter, galleryScreenshots, zoomedImage, setZoomedImage, deviceFrameWidth, setDeviceFrameWidth }) => {
  return (
    <>
      {/* ================= 4. LIVE PLAYGROUND / VIEWPORT SHOWCASE ================= */}
        {project.showLiveSandbox !== false && hasLive && (
          <section className="py-20">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8 items-center px-4">
              
              {/* Left controller notes */}
              <div className="lg:col-span-4 space-y-6">
                <span className="text-xs font-mono text-accent uppercase tracking-widest block font-bold">03. Live Showcase</span>
                <h2 className="text-3xl md:text-5xl font-bold font-display text-white">Interactive Sandbox</h2>
                <p className="text-sm text-text-muted font-sans leading-relaxed">
                  Test the actual live hosted application directly in the browser mock below. Toggle device sizes (desktop, tablet, mobile) to inspect responsive layout adaptation in real-time.
                </p>
                
                {/* Frame Width Buttons */}
                <div className="space-y-3">
                  <p className="text-[10px] font-mono text-accent font-bold tracking-widest uppercase">SIMULATED VIEWPORT FRAME</p>
                  <div className="flex gap-2">
                    {[
                      { width: '100%', label: 'Desktop', icon: Monitor },
                      { width: '75%', label: 'Tablet', icon: Smartphone },
                      { width: '42%', label: 'Mobile', icon: Smartphone }
                    ].map((device) => {
                      const DevIcon = device.icon;
                      return (
                        <button
                          key={device.label}
                          onClick={() => setDeviceFrameWidth(device.width)}
                          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-mono transition-all ${
                            deviceFrameWidth === device.width
                              ? 'border-accent bg-accent/10 text-accent font-bold'
                              : 'border-white/5 bg-white/[0.01] text-text-muted hover:border-white/10 hover:bg-white/[0.03]'
                          }`}
                        >
                          <DevIcon size={13} />
                          {device.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right frame renderer */}
              <div className="lg:col-span-8 flex justify-center items-center p-4 md:p-8 bg-slate-950/40 rounded-3xl border border-white/5 aspect-video overflow-hidden">
                <motion.div 
                  animate={{ width: deviceFrameWidth }}
                  transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                  className="h-full border border-white/15 bg-slate-900 rounded-2xl flex flex-col justify-between overflow-hidden shadow-2xl relative transition-all shadow-accent/5"
                >
                  {/* Browser Mock Top bar */}
                  <div className="px-4 py-2 border-b border-white/5 bg-slate-950/60 flex items-center justify-between shrink-0">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                    </div>
                    <span className="text-[9px] font-mono text-text-muted truncate max-w-[280px] bg-slate-900 px-3 py-0.5 rounded border border-white/5">
                      {project.external}
                    </span>
                    <div className="w-8" />
                  </div>
                  
                  {/* Live Web Iframe */}
                  <div className="flex-1 w-full bg-slate-950 overflow-hidden relative min-h-0">
                    <iframe
                      src={project.external}
                      title={`${project.title} Live Sandbox`}
                      className="w-full h-full border-0 bg-slate-900"
                      sandbox="allow-scripts allow-same-origin allow-forms"
                    />
                  </div>

                  {/* Footer status bar */}
                  <div className="px-4 py-1.5 border-t border-white/5 bg-slate-950/60 flex justify-between items-center text-[8px] font-mono text-text-muted shrink-0">
                    <span>STATUS: ACTIVE CONNECTION</span>
                    <span className="text-emerald-400">LIVE SESSION</span>
                  </div>
                </motion.div>
              </div>

            </div>
          </section>
        )}
    </>
  );
};

export const SectionArchitectureOverview = ({ project, techList, hasLive, hasGithub, slides, heroSlide, scaleX, galleryGroups, galleryFilter, setGalleryFilter, galleryScreenshots, zoomedImage, setZoomedImage, deviceFrameWidth, setDeviceFrameWidth }) => {
  return (
    <>
      {/* ================= 5. INTERACTIVE ARCHITECTURE DATA PIPELINE ================= */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto text-center space-y-3 mb-12 px-4">
            <span className="text-xs font-mono text-accent uppercase tracking-widest block font-bold">04. Engineering Architecture</span>
            <h2 className="text-3xl md:text-5xl font-bold font-display text-white">System Data Pipeline</h2>
            <p className="text-text-muted text-sm max-w-2xl mx-auto">
              Hover over node elements to analyze network traffic patterns, request flows, authentication gateways, and database pipelines.
            </p>
          </div>
          <div className="max-w-5xl mx-auto px-4 space-y-8">
            <SVGArchitectureGraph 
              nodes={project.architectureNodesJson} 
              connections={project.architectureConnectionsJson} 
            />
            {project.architectureMarkdown && (
              <div className="p-6 md:p-8 rounded-3xl border border-white/5 bg-white/[0.01] prose prose-invert font-sans text-xs text-text-muted leading-relaxed max-w-none">
                {renderSimpleMarkdown(project.architectureMarkdown)}
              </div>
            )}
          </div>
        </section>
    </>
  );
};

export const SectionDevelopmentTimeline = ({ project, techList, hasLive, hasGithub, slides, heroSlide, scaleX, galleryGroups, galleryFilter, setGalleryFilter, galleryScreenshots, zoomedImage, setZoomedImage, deviceFrameWidth, setDeviceFrameWidth }) => {
  return (
    <>
      {/* ================= 6. TIMELINE DEVELOPMENT JOURNEY ================= */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto text-center space-y-3 mb-12 px-4">
            <span className="text-xs font-mono text-accent uppercase tracking-widest block font-bold">05. Development Journey</span>
            <h2 className="text-3xl md:text-5xl font-bold font-display text-white">Engineering Timeline</h2>
          </div>
          <div className="max-w-5xl mx-auto px-4">
            <TimelineExplorer milestones={project.storyMilestonesJson} />
          </div>
        </section>
    </>
  );
};

export const SectionKeyFeatures = ({ project, techList, hasLive, hasGithub, slides, heroSlide, scaleX, galleryGroups, galleryFilter, setGalleryFilter, galleryScreenshots, zoomedImage, setZoomedImage, deviceFrameWidth, setDeviceFrameWidth }) => {
  return (
    <>
      {/* ================= 7. FEATURE SHOWCASE (ALTERNATING LAYOUTS) ================= */}
        {project.featuresJson && project.featuresJson.length > 0 && (
          <section className="py-20">
            <div className="max-w-4xl mx-auto text-center space-y-3 mb-16 px-4">
              <span className="text-xs font-mono text-accent uppercase tracking-widest block font-bold">06. Feature Showcase</span>
              <h2 className="text-3xl md:text-5xl font-bold font-display text-white">Core Capabilities</h2>
            </div>
            
            <div className="max-w-5xl mx-auto space-y-16 px-4">
              {project.featuresJson.map((feature, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <div 
                    key={idx} 
                    className={`grid md:grid-cols-12 gap-8 items-center border-b border-white/5 pb-12 last:border-0 ${
                      isEven ? '' : 'md:flex-row-reverse'
                    }`}
                  >
                    {/* Feature Description */}
                    <div className={`md:col-span-5 space-y-4 ${isEven ? 'md:order-1' : 'md:order-2'}`}>
                      <div className="flex items-center gap-2 text-xs font-mono text-accent font-bold uppercase tracking-wider">
                        <Sparkles size={14} /> Feature 0{idx + 1}
                      </div>
                      <h3 className="text-2xl font-bold font-display text-white">{feature.title}</h3>
                      <p className="text-sm text-text-muted leading-relaxed font-sans">{feature.explanation || feature.description}</p>
                    </div>

                    {/* Feature Media Visual */}
                    <div className={`md:col-span-7 ${isEven ? 'md:order-2' : 'md:order-1'}`}>
                      <div className="rounded-2xl border border-white/10 overflow-hidden bg-slate-950 aspect-video shadow-2xl relative group">
                        {feature.imageUrl ? (
                          <img src={feature.imageUrl} alt={feature.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 to-transparent flex items-center justify-center font-mono text-[10px] text-text-muted">
                            Dynamic Feature Visualizer Panel
                          </div>
                        )}
                        <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded bg-slate-950/80 border border-white/5 text-[9px] font-mono text-accent">
                          CORE SPEC
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
    </>
  );
};

export const SectionTechStack = ({ project, techList, hasLive, hasGithub, slides, heroSlide, scaleX, galleryGroups, galleryFilter, setGalleryFilter, galleryScreenshots, zoomedImage, setZoomedImage, deviceFrameWidth, setDeviceFrameWidth }) => {
  return (
    <>
      {/* ================= 8. TECH STACK INTERACTIVE CHIPS ================= */}
        {project.techStackJson && project.techStackJson.length > 0 && (
          <section className="py-20">
            <div className="max-w-4xl mx-auto text-center space-y-3 mb-12 px-4">
              <span className="text-xs font-mono text-accent uppercase tracking-widest block font-bold">07. Stack Architecture</span>
              <h2 className="text-3xl md:text-5xl font-bold font-display text-white">Core Technology Stack</h2>
            </div>

            <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
              {project.techStackJson.map((tech, idx) => (
                <div key={idx} className="p-6 rounded-3xl border border-white/10 bg-secondary/15 space-y-4 hover:border-accent/40 transition-all group relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      {tech.iconImage ? (
                        <img src={tech.iconImage} alt={tech.name} className="w-8 h-8 object-contain shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                          <Code2 size={13} className="text-text-muted group-hover:text-accent transition-colors" />
                        </div>
                      )}
                      <h4 className="text-sm font-bold text-white">{tech.name}</h4>
                    </div>
                    {tech.category && (
                      <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-mono text-text-muted group-hover:text-accent group-hover:bg-accent/10 transition-colors uppercase">
                        {tech.category}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-xs text-text-muted font-sans leading-relaxed">
                    {tech.purpose && <p><strong className="text-white">Role:</strong> {tech.purpose}</p>}
                    {tech.reason && <p><strong className="text-white">Reason:</strong> {tech.reason}</p>}
                  </div>

                  {tech.docUrl && (
                    <a 
                      href={tech.docUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="absolute bottom-3 right-3 text-text-muted hover:text-accent opacity-0 group-hover:opacity-100 transition-all"
                      aria-label={`View ${tech.name} documentation`}
                    >
                      <ArrowUpRight size={14} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
    </>
  );
};

export const SectionEngineeringDecisions = ({ project, techList, hasLive, hasGithub, slides, heroSlide, scaleX, galleryGroups, galleryFilter, setGalleryFilter, galleryScreenshots, zoomedImage, setZoomedImage, deviceFrameWidth, setDeviceFrameWidth }) => {
  return (
    <>
      {/* ================= 12. ENGINEERING DECISIONS ================= */}
        {project.engineeringDecisionsJson && project.engineeringDecisionsJson.length > 0 && (
          <section className="py-20">
            <div className="max-w-4xl mx-auto text-center space-y-3 mb-12 px-4">
              <span className="text-xs font-mono text-accent uppercase tracking-widest block font-bold">11. Decisions & Trade-offs</span>
              <h2 className="text-3xl md:text-5xl font-bold font-display text-white">Architectural Decisions</h2>
            </div>
            
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 px-4">
              {project.engineeringDecisionsJson.map((dec, idx) => (
                <div key={idx} className="p-6 md:p-8 rounded-3xl border border-white/10 bg-secondary/20 space-y-4 hover:border-accent/40 transition-colors group">
                  <div className="flex justify-between items-start border-b border-white/5 pb-2.5">
                    <span className="text-[9px] font-mono text-accent font-bold uppercase tracking-wider bg-accent/15 px-2.5 py-1 rounded">
                      DECISION 0{idx + 1}
                    </span>
                    <span className="text-[10px] font-mono text-text-muted">TRADE-OFFS REPORT</span>
                  </div>
                  <h4 className="text-xl font-bold font-display text-white">{dec.question}</h4>
                  <div className="space-y-3 text-xs text-text-muted font-sans leading-relaxed">
                    <p><strong className="text-white">Chosen Route:</strong> {dec.decision}</p>
                    <p><strong className="text-white">Rationale:</strong> {dec.reason}</p>
                    {dec.alternatives && <p><strong className="text-white">Alternatives:</strong> {dec.alternatives}</p>}
                    {dec.tradeOffs && <p><strong className="text-white">Trade-offs:</strong> {dec.tradeOffs}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
    </>
  );
};

export const SectionSecurityPerformance = ({ project, techList, hasLive, hasGithub, slides, heroSlide, scaleX, galleryGroups, galleryFilter, setGalleryFilter, galleryScreenshots, zoomedImage, setZoomedImage, deviceFrameWidth, setDeviceFrameWidth }) => {
  return (
    <>
      {/* ================= 13. PERFORMANCE LIGHTHOUSE DIALS ================= */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto text-center space-y-3 mb-12 px-4">
            <span className="text-xs font-mono text-accent uppercase tracking-widest block font-bold">12. Telemetry metrics</span>
            <h2 className="text-3xl md:text-5xl font-bold font-display text-white">Performance Scorecard</h2>
          </div>

          <div className="max-w-5xl mx-auto px-4 space-y-10">
            {/* Scores Dials */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <ProgressRing score={project.perfScore} label="Performance" />
              <ProgressRing score={project.accessScore} label="Accessibility" />
              <ProgressRing score={project.bestScore} label="Best Practices" />
              <ProgressRing score={project.seoScore} label="SEO Validation" />
            </div>

            {/* Structured Metric lists */}

          </div>
        </section>
    </>
  );
};

export const SectionMetricsStatistics = ({ project, techList, hasLive, hasGithub, slides, heroSlide, scaleX, galleryGroups, galleryFilter, setGalleryFilter, galleryScreenshots, zoomedImage, setZoomedImage, deviceFrameWidth, setDeviceFrameWidth }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* ================= 14. INTERACTIVE MEDIA GALLERY ================= */}
        {project.screenshots && project.screenshots.length > 0 && (
          <section className="py-20">
            <div className="max-w-4xl mx-auto text-center space-y-3 mb-8 px-4">
              <span className="text-xs font-mono text-accent uppercase tracking-widest block font-bold">13. Visual Capture</span>
              <h2 className="text-3xl md:text-5xl font-bold font-display text-white">Interactive Gallery</h2>
            </div>

            {/* Gallery group filters */}
            {galleryGroups.length > 1 && (
              <div className="flex justify-center gap-2 mb-8 px-4 overflow-x-auto [scrollbar-width:none]">
                {galleryGroups.map(group => (
                  <button
                    key={group}
                    onClick={() => setGalleryFilter(group)}
                    className={`px-3 py-1 rounded-lg border text-xs font-mono transition-colors shrink-0 ${
                      galleryFilter === group
                        ? 'border-accent bg-accent/15 text-accent'
                        : 'border-white/5 bg-white/[0.01] text-text-muted hover:border-white/10'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            )}

            {/* Screenshot Gallery Engine */}
            <motion.div 
              layout 
              className={`max-w-6xl mx-auto px-4 ${
                project?.galleryLayout === 'masonry'
                  ? 'columns-2 md:columns-3 gap-6 space-y-6 block'
                  : 'grid grid-cols-2 md:grid-cols-3 gap-6 items-start'
              }`}
            >
              <AnimatePresence mode="popLayout">
                {galleryScreenshots.slice(0, isExpanded ? undefined : 6).map((shot, idx) => {
                  const isMagazineHero = project?.galleryLayout === 'magazine' && idx === 0;
                  const isMasonry = project?.galleryLayout === 'masonry';
                  const isMobile = shot.group?.toLowerCase() === 'mobile';
                  
                  let aspectClass = 'aspect-video';
                  if (isMagazineHero) {
                    aspectClass = 'aspect-[21/9] md:aspect-[24/9]'; // Super wide cinematic hero
                  } else if (isMobile) {
                    aspectClass = 'aspect-[9/16]';
                  } else if (isMasonry) {
                    // For masonry, we let the image determine height, but default to video to prevent reflow jumps
                    aspectClass = shot.aspectRatio ? `aspect-[${shot.aspectRatio}]` : 'aspect-video'; 
                  }

                  let wrapperClass = `relative group rounded-3xl border border-white/10 bg-slate-900/50 overflow-hidden cursor-pointer shadow-lg hover:border-accent/50 hover:shadow-[0_0_20px_rgba(45,212,191,0.2)] ${aspectClass}`;
                  
                  if (isMagazineHero) {
                     wrapperClass += ' col-span-2 md:col-span-3';
                  }
                  if (isMasonry) {
                     wrapperClass += ' inline-block w-full mb-6 break-inside-avoid';
                  }

                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                      key={shot.url || idx} 
                      className={wrapperClass}
                      onClick={() => setZoomedImage(idx)}
                    >
                      <ImageWithFallback 
                        src={shot.url} 
                        alt={shot.alt || `Screenshot ${idx + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      {/* Hover Magnifying Glass Overlay */}
                      <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                        <div className="p-3 bg-secondary/80 backdrop-blur-md rounded-full text-accent drop-shadow-[0_0_10px_rgba(45,212,191,0.5)] transform scale-50 group-hover:scale-100 transition-transform duration-300 delay-100">
                          <ZoomIn size={24} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {/* Show More / Show Less Button */}
            {galleryScreenshots.length > 6 && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="px-6 py-2.5 rounded-full border border-white/10 bg-white/5 text-sm font-bold text-white hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2 backdrop-blur-md"
                >
                  {isExpanded ? (
                    <>Show Less <ChevronLeft size={16} className="rotate-90" /></>
                  ) : (
                    <>View all {galleryScreenshots.length} images <ChevronRight size={16} className="rotate-90" /></>
                  )}
                </button>
              </div>
            )}

            {/* Lightbox zoom overlay with navigation */}
            <AnimatePresence>
              {zoomedImage !== null && galleryScreenshots[zoomedImage] && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setZoomedImage(null)}
                  className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-zoom-out"
                >
                  <motion.img 
                    key={zoomedImage}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    src={galleryScreenshots[zoomedImage].url} 
                    alt="Zoomed View" 
                    className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
                  />
                  
                  {/* Prev Button */}
                  {galleryScreenshots.length > 1 && (
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setZoomedImage(prev => (prev > 0 ? prev - 1 : galleryScreenshots.length - 1));
                      }}
                      className="absolute left-4 md:left-12 p-3 md:p-4 rounded-full bg-slate-900/60 border border-white/10 text-white hover:bg-accent hover:border-accent hover:text-slate-950 transition-all backdrop-blur-md cursor-pointer"
                    >
                      <ChevronLeft size={24} />
                    </button>
                  )}
                  
                  {/* Next Button */}
                  {galleryScreenshots.length > 1 && (
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setZoomedImage(prev => (prev < galleryScreenshots.length - 1 ? prev + 1 : 0));
                      }}
                      className="absolute right-4 md:right-12 p-3 md:p-4 rounded-full bg-slate-900/60 border border-white/10 text-white hover:bg-accent hover:border-accent hover:text-slate-950 transition-all backdrop-blur-md cursor-pointer"
                    >
                      <ChevronRight size={24} />
                    </button>
                  )}
                  
                  {/* Close button indicator */}
                  <div className="absolute top-6 right-6 md:top-10 md:right-10 p-3 rounded-full bg-slate-900/60 border border-white/10 text-white hover:bg-white/10 transition-all backdrop-blur-md cursor-pointer">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}
    </>
  );
};

export const SectionFutureRoadmap = ({ project, techList, hasLive, hasGithub, slides, heroSlide, scaleX, galleryGroups, galleryFilter, setGalleryFilter, galleryScreenshots, zoomedImage, setZoomedImage, deviceFrameWidth, setDeviceFrameWidth }) => {
  return (
    <>
      {/* ================= 15. ROADMAP CHECKLIST ================= */}
        {project.roadmapJson && project.roadmapJson.length > 0 && (
          <section className="py-20">
            <div className="max-w-4xl mx-auto text-center space-y-3 mb-12 px-4">
              <span className="text-xs font-mono text-accent uppercase tracking-widest block font-bold">14. Project Roadmap</span>
              <h2 className="text-3xl md:text-5xl font-bold font-display text-white">Next Steps & Future Milestones</h2>
            </div>
            
            <div className="max-w-3xl mx-auto rounded-3xl border border-white/10 bg-secondary/10 p-6 md:p-8 backdrop-blur-md space-y-4 px-4">
              {project.roadmapJson.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.01] border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 border border-accent/30 text-accent font-mono text-[9px] font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-xs text-slate-200 truncate">{item.task}</span>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {item.priority && (
                      <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        item.priority === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {item.priority}
                      </span>
                    )}
                    {item.status && (
                      <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        item.status === 'Done' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {item.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
    </>
  );
};

export const SectionTechnicalQAndA = ({ project, techList, hasLive, hasGithub, slides, heroSlide, scaleX, galleryGroups, galleryFilter, setGalleryFilter, galleryScreenshots, zoomedImage, setZoomedImage, deviceFrameWidth, setDeviceFrameWidth }) => {
  return (
    <>
      {/* ================= 15. TECHNICAL QUESTIONS & ANSWERS ================= */}
        {project.technicalFaqJson && project.technicalFaqJson.length > 0 && (
          <section className="py-20">
            <div className="max-w-4xl mx-auto text-center space-y-3 mb-12 px-4">
              <span className="text-xs font-mono text-accent uppercase tracking-widest block font-bold">15. Deep Dive FAQ</span>
              <h2 className="text-3xl md:text-5xl font-bold font-display text-white">Technical Q&A</h2>
              <p className="text-text-muted text-sm max-w-2xl mx-auto">
                Detailed breakdowns of engineering trade-offs, architecture decisions, and operational details.
              </p>
            </div>
            <div className="max-w-3xl mx-auto px-4">
              <TechnicalFAQ faqItems={project.technicalFaqJson} />
            </div>
          </section>
        )}
    </>
  );
};

export const SectionCTA = ({ project, techList, hasLive, hasGithub, slides, heroSlide, scaleX, galleryGroups, galleryFilter, setGalleryFilter, galleryScreenshots, zoomedImage, setZoomedImage, deviceFrameWidth, setDeviceFrameWidth }) => {
  return (
    <>
      {/* ================= 16. CASE STUDY CALL-TO-ACTION (CTA) ================= */}
        {project.ctaJson && typeof project.ctaJson === 'object' && Object.keys(project.ctaJson).length > 0 && (
          <section className="py-20">
            <div className="max-w-5xl mx-auto px-4">
              <div className="relative rounded-3xl border border-white/10 overflow-hidden bg-slate-950 p-8 md:p-16 text-center space-y-6">
                {project.ctaJson.backgroundImage && (
                  <div className="absolute inset-0 z-0 opacity-20">
                    <img src={project.ctaJson.backgroundImage} alt="Background" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                  <h3 className="text-3xl md:text-5xl font-bold font-display text-white leading-tight">
                    {project.ctaJson.title || 'Want to learn more?'}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed font-sans">
                    {project.ctaJson.subtitle}
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 pt-4">
                    {project.ctaJson.buttonText && (
                      <a href={project.ctaJson.buttonUrl || '#'} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center rounded-xl bg-accent px-6 font-mono text-xs font-bold uppercase tracking-wider text-primary hover:bg-white hover:text-black transition-all hover:scale-105">
                        {project.ctaJson.buttonText}
                      </a>
                    )}
                    {project.ctaJson.secondaryButtonText && (
                      <a href={project.ctaJson.secondaryButtonUrl || '#'} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 font-mono text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-all">
                        {project.ctaJson.secondaryButtonText}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
    </>
  );
};



export const SectionUserJourney = ({ project }) => {
  const journey = project?.userJourneyJson || [];
  if (journey.length === 0) return null;
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-mono text-accent uppercase tracking-widest bg-accent/10 px-4 py-1.5 rounded-full border border-accent/20 shadow-[0_0_15px_rgba(56,189,248,0.15)] inline-block mb-6">User Journey</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">The User Path</h2>
          <p className="text-text-muted max-w-2xl mx-auto">Step-by-step walkthrough of the user experience.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {journey.map((step, idx) => (
            <div key={idx} className="relative p-6 rounded-3xl bg-secondary/30 border border-white/5 hover:border-accent/40 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-6 border border-accent/20">
                <span className="font-mono text-lg font-bold">{idx + 1}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{step.step}</h3>
              <p className="text-sm text-text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const SectionTechnicalChallenges = ({ project }) => {
  const challenges = project?.challengesJson || [];
  if (challenges.length === 0) return null;
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-mono text-red-400 uppercase tracking-widest bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20 inline-block mb-6">Technical Challenges</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">Overcoming Hurdles</h2>
        </div>
        <div className="space-y-6">
          {challenges.map((c, idx) => (
            <div key={idx} className="grid md:grid-cols-3 gap-6 p-8 rounded-3xl bg-secondary/20 border border-white/5">
              <div>
                <h4 className="text-red-400 font-mono text-sm font-bold mb-2">THE PROBLEM</h4>
                <p className="text-white font-medium">{c.challenge}</p>
              </div>
              <div>
                <h4 className="text-accent font-mono text-sm font-bold mb-2">THE SOLUTION</h4>
                <p className="text-text-muted">{c.solution}</p>
              </div>
              <div>
                <h4 className="text-emerald-400 font-mono text-sm font-bold mb-2">THE RESULT</h4>
                <p className="text-text-muted">{c.result}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const SectionScalabilityStrategy = ({ project }) => {
  const scalability = project?.scalabilityStrategyJson || [];
  if (scalability.length === 0) return null;
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-mono text-purple-400 uppercase tracking-widest bg-purple-500/10 px-4 py-1.5 rounded-full border border-purple-500/20 inline-block mb-6">Scalability Strategy</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">Built to Scale</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {scalability.map((s, idx) => (
            <div key={idx} className="p-8 rounded-3xl bg-secondary/30 border border-white/5 hover:border-purple-500/30 transition-all">
              <h3 className="text-xl font-bold text-white mb-4">{s.area}</h3>
              <p className="text-text-muted leading-relaxed">{s.strategy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const SectionLessonsLearned = ({ project }) => {
  if (!project?.learned) return null;
  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
        <span className="text-xs font-mono text-amber-400 uppercase tracking-widest bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20 inline-block mb-6">Lessons Learned</span>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-8">Reflections & Takeaways</h2>
        <div className="p-8 md:p-12 rounded-3xl bg-secondary/20 border border-white/10 text-left">
          <p className="text-lg text-text-muted leading-relaxed whitespace-pre-wrap">{project.learned}</p>
        </div>
      </div>
    </section>
  );
};

const TableOfContents = ({ layout }) => {
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    const sectionIds = layout.filter(s => s.enabled).map(s => `section-${s.id}`);
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -80% 0px' }
    );

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [layout]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formatLabel = (id) => id.replace(/([A-Z])/g, ' $1').trim();

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-[100] hidden xl:flex flex-col gap-2 py-4 px-2 bg-slate-950/40 backdrop-blur-md border border-white/5 rounded-full shadow-xl">
      {layout.filter(s => s.enabled).map((sectionConfig) => {
        const id = `section-${sectionConfig.id}`;
        const isActive = activeSection === id;
        return (
          <button
            key={id}
            onClick={() => scrollToSection(id)}
            className="group relative flex items-center justify-center w-5 h-5 rounded-full focus:outline-none"
            aria-label={`Scroll to ${formatLabel(sectionConfig.id)}`}
          >
            <div 
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                isActive 
                  ? 'bg-accent shadow-[0_0_8px_rgba(45,212,191,0.8)] scale-150' 
                  : 'bg-white/20 group-hover:bg-white/60 group-hover:scale-125'
              }`}
            />
            
            <div className="absolute right-8 px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-sm border border-white/10 opacity-0 -translate-x-2 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap shadow-lg">
              <span className={`text-[10px] font-mono tracking-wider ${isActive ? 'text-accent font-bold' : 'text-text-muted'}`}>
                {formatLabel(sectionConfig.id)}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export const DynamicProjectLayout = (props) => {
  const { project } = props;
  const defaultLayout = [
    { id: 'Hero', enabled: true },
    { id: 'ProductOverview', enabled: true },
    { id: 'ProblemStatement', enabled: true },
    { id: 'InteractiveDemo', enabled: true },
    { id: 'ArchitectureOverview', enabled: true },
    { id: 'DevelopmentTimeline', enabled: true },
    { id: 'KeyFeatures', enabled: true },
    { id: 'TechStack', enabled: true },
    { id: 'EngineeringDecisions', enabled: true },
    { id: 'SecurityPerformance', enabled: true },
    { id: 'MetricsStatistics', enabled: true },
    { id: 'FutureRoadmap', enabled: true },
    { id: 'TechnicalQAndA', enabled: true },
    { id: 'CTA', enabled: true },
    { id: 'UserJourney', enabled: true },
    { id: 'TechnicalChallenges', enabled: true },
    { id: 'ScalabilityStrategy', enabled: true },
    { id: 'LessonsLearned', enabled: true },
  ];
  
  // Use CMS layout if it exists and isn't empty, otherwise use fallback
  let layout = project?.layoutJson;
  if (typeof layout === 'string') {
    try { layout = JSON.parse(layout); } catch { layout = null; }
  }
  if (!layout || layout.length === 0) {
    layout = defaultLayout;
  }
  
  return (
    <div className="relative w-full z-10 flex flex-col min-h-screen">
      <TableOfContents layout={layout} />
      
      {layout.map((sectionConfig) => {
        if (!sectionConfig.enabled) return null;
        
        let SectionComponent = null;
        switch(sectionConfig.id) {
          case 'Hero': SectionComponent = <SectionHero key='Hero' {...props} />; break;
          case 'ProductOverview': SectionComponent = <SectionProductOverview key='ProductOverview' {...props} />; break;
          case 'ProblemStatement': SectionComponent = <SectionProblemStatement key='ProblemStatement' {...props} />; break;
          case 'InteractiveDemo': SectionComponent = <SectionInteractiveDemo key='InteractiveDemo' {...props} />; break;
          case 'ArchitectureOverview': SectionComponent = <SectionArchitectureOverview key='ArchitectureOverview' {...props} />; break;
          case 'DevelopmentTimeline': SectionComponent = <SectionDevelopmentTimeline key='DevelopmentTimeline' {...props} />; break;
          case 'KeyFeatures': SectionComponent = <SectionKeyFeatures key='KeyFeatures' {...props} />; break;
          case 'TechStack': SectionComponent = <SectionTechStack key='TechStack' {...props} />; break;
          case 'EngineeringDecisions': SectionComponent = <SectionEngineeringDecisions key='EngineeringDecisions' {...props} />; break;
          case 'SecurityPerformance': SectionComponent = <SectionSecurityPerformance key='SecurityPerformance' {...props} />; break;
          case 'MetricsStatistics': SectionComponent = <SectionMetricsStatistics key='MetricsStatistics' {...props} />; break;
          case 'FutureRoadmap': SectionComponent = <SectionFutureRoadmap key='FutureRoadmap' {...props} />; break;
          case 'TechnicalQAndA': SectionComponent = <SectionTechnicalQAndA key='TechnicalQAndA' {...props} />; break;
          case 'CTA': SectionComponent = <SectionCTA key='CTA' {...props} />; break;
          case 'UserJourney': SectionComponent = <SectionUserJourney key='UserJourney' {...props} />; break;
          case 'TechnicalChallenges': SectionComponent = <SectionTechnicalChallenges key='TechnicalChallenges' {...props} />; break;
          case 'ScalabilityStrategy': SectionComponent = <SectionScalabilityStrategy key='ScalabilityStrategy' {...props} />; break;
          case 'LessonsLearned': SectionComponent = <SectionLessonsLearned key='LessonsLearned' {...props} />; break;
          default: return null;
        }

        if (!SectionComponent) return null;

        return (
          <div key={sectionConfig.id} id={`section-${sectionConfig.id}`} className="w-full relative">
            {SectionComponent}
          </div>
        );
      })}
    </div>
  );
};


const ProjectPage = () => {
  const { slug } = useParams();
  const [zoomedImage, setZoomedImage] = useState(null);
  const [galleryFilter, setGalleryFilter] = useState('All');
  
  // Floating device frame width state
  const [deviceFrameWidth, setDeviceFrameWidth] = useState('100%'); // 100%, 75%, 42%

  const { data, loading } = useCmsDoc(CMS_DOCS.projects, { items: [] });
  const projects = useMemo(() => (Array.isArray(data?.items) ? data.items : []), [data]);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const project = useMemo(() => {
    return projects.find((item) => {
      const candidates = [item.id, item.slug, item.title, item.missionCode].map(slugify).filter(Boolean);
      return candidates.includes(slug);
    });
  }, [projects, slug]);

  const pageSlug = project ? slugify(project.slug || project.id || project.title || project.missionCode) : '';
  const description = project?.shortDescription || project?.description || 'Project case study and build details.';

  // Standard safe parsing properties
  const slides = useMemo(() => getMediaSlides(project), [project]);
  const heroSlide = slides[0] || null;
  const techList = Array.isArray(project?.tech) ? project.tech : [];
  const hasLive = isUsableHttpUrl(project?.external);
  const hasGithub = isUsableHttpUrl(project?.github);

  // Filter gallery screenshots with auto-injected beautiful placeholders for the demo!
  const galleryScreenshots = useMemo(() => {
    let shots = project?.screenshots || [];
    
    // Automatically inject gorgeous placeholder images if there are fewer than 6 images
    if (shots.length < 6) {
      const placeholders = [
        { url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200', group: 'Desktop' },
        { url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200', group: 'Desktop' },
        { url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200', group: 'Mobile' },
        { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200', group: 'Mobile' },
        { url: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&q=80&w=1200', group: 'Desktop' },
        { url: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=1200', group: 'Mobile' }
      ];
      shots = [...shots, ...placeholders].slice(0, 6);
    }
    
    if (galleryFilter === 'All') return shots;
    return shots.filter(s => s.group === galleryFilter);
  }, [project?.screenshots, galleryFilter]);

  const galleryGroups = useMemo(() => {
    // If using placeholders, make sure we have Desktop and Mobile groups available for testing
    let shots = project?.screenshots || [];
    if (shots.length < 6) {
      shots = [...shots, { group: 'Desktop' }, { group: 'Mobile' }];
    }
    const groups = new Set(shots.map(s => s.group).filter(Boolean));
    return ['All', ...Array.from(groups)];
  }, [project?.screenshots]);

  const currentIndex = projects.findIndex(p => (p.id === project?.id || p.title === project?.title));
  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const nextProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

  if (loading) {
    return (
      <>
        <SEO title="Project | Sahan Pramuditha" description="Loading project details." canonicalPath={`/projects/${slug || ''}`} />
        <PageLoader text="Loading project" subtext="Fetching project details..." />
      </>
    );
  }

  if (!project || data === undefined) {
    return (
      <>
        <SEO title="Project not found" description="The requested project could not be found." canonicalPath={`/projects/${slug || ''}`} noindex />
        <PageShell eyebrow="Portfolio" title="Project not found" description="That case study is not published yet or the URL is wrong." backHref="/#projects">
          <div className="rounded-3xl border border-white/10 bg-secondary/20 p-10 text-center text-text-muted">
            Try another project from the homepage.
          </div>
        </PageShell>
      </>
    );
  }

  return (
    <>
      <SEO
        title={`${project.title || 'Project'} | Sahan Pramuditha`}
        description={description}
        canonicalPath={`/projects/${pageSlug}`}
        ogImage={heroSlide?.kind === 'image' ? heroSlide.url : undefined}
      />
      
      {/* Top progress tracker */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-accent origin-left z-50 shadow-[0_0_15px_rgba(56,189,248,0.7)]" style={{ scaleX }} />

      <PageShell backHref="/#projects">
        
        
        <DynamicProjectLayout project={project} techList={techList} hasLive={hasLive} hasGithub={hasGithub} slides={slides} heroSlide={heroSlide} scaleX={scaleX} galleryGroups={galleryGroups} galleryFilter={galleryFilter} setGalleryFilter={setGalleryFilter} galleryScreenshots={galleryScreenshots} zoomedImage={zoomedImage} setZoomedImage={setZoomedImage} deviceFrameWidth={deviceFrameWidth} setDeviceFrameWidth={setDeviceFrameWidth} />

        {/* ================= NEXT PROJECT DIRECTION ================= */}
        <div className="mt-24 w-full border-t border-white/10 pt-12 pb-20 relative z-20">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-8">
            {prevProject ? (
              <Link to={`/projects/${slugify(prevProject.slug || prevProject.id || prevProject.title || prevProject.missionCode)}`} className="group flex items-center gap-5 text-left transition-all duration-300 hover:-translate-x-2 w-full sm:w-auto">
                <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center bg-white/[0.02] group-hover:bg-accent/15 group-hover:border-accent/30 group-hover:shadow-[0_0_20px_rgba(45,212,191,0.2)] transition-all duration-300 shrink-0">
                  <ArrowLeft size={20} className="text-text-muted group-hover:text-accent transition-colors" />
                </div>
                <div>
                  <span className="block text-xs font-mono uppercase tracking-widest text-text-muted mb-1.5 transition-colors group-hover:text-accent">Previous Project</span>
                  <span className="block text-xl md:text-2xl font-bold text-text group-hover:text-white transition-colors">{prevProject.title}</span>
                </div>
              </Link>
            ) : <div className="hidden sm:block" />}
            
            {nextProject ? (
              <Link to={`/projects/${slugify(nextProject.slug || nextProject.id || nextProject.title || nextProject.missionCode)}`} className="group flex items-center gap-5 text-right transition-all duration-300 hover:translate-x-2 w-full sm:w-auto justify-end">
                <div>
                  <span className="block text-xs font-mono uppercase tracking-widest text-text-muted mb-1.5 transition-colors group-hover:text-accent">Up Next</span>
                  <span className="block text-xl md:text-2xl font-bold text-text group-hover:text-white transition-colors">{nextProject.title}</span>
                </div>
                <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center bg-white/[0.02] group-hover:bg-accent/15 group-hover:border-accent/30 group-hover:shadow-[0_0_20px_rgba(45,212,191,0.2)] transition-all duration-300 shrink-0">
                  <ArrowRight size={20} className="text-text-muted group-hover:text-accent transition-colors" />
                </div>
              </Link>
            ) : <div className="hidden sm:block" />}
          </div>
        </div>

      </PageShell>
    </>
  );
};

export default ProjectPage;
