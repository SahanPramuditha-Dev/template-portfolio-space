import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Compass, 
  ChevronRight,
  ExternalLink,
  Download,
  Terminal,
  MessageSquare
} from 'lucide-react';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import { 
  QUICK_SUGGESTIONS, 
  buildPortfolioContext, 
  queryLocalOrbitalBrain, 
  queryGeminiApi 
} from '../utils/orbitalAiEngine';

const OrbitalAiModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const { data: siteDoc } = useCmsDoc(CMS_DOCS.site, null);
  const { data: projectsDoc } = useCmsDoc(CMS_DOCS.projects, { items: [] });
  const { data: skillsDoc } = useCmsDoc(CMS_DOCS.skills, { items: [] });
  const { data: experienceDoc } = useCmsDoc(CMS_DOCS.experience, { items: [] });
  const { data: certsDoc } = useCmsDoc(CMS_DOCS.certifications, { items: [] });
  const { data: badgesDoc } = useCmsDoc(CMS_DOCS.badges, { items: [] });

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Greetings! I am **Nova**, Sahan's autonomous portfolio co-pilot 🛰️\n\nI can answer questions about his **technical stack, real-world projects, university background, or availability for hire**. How can I assist you today?`,
      actions: [
        { label: '⚡ Top Skills', href: '#skills', type: 'scroll' },
        { label: '🚀 Featured Projects', href: '#projects', type: 'scroll' },
        { label: '✉️ Contact Sahan', href: '#contact', type: 'scroll' }
      ]
    }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleActionClick = (action) => {
    if (action.type === 'scroll' && action.href.startsWith('#')) {
      const el = document.querySelector(action.href);
      if (el) {
        if (window.__lenis) {
          window.__lenis.scrollTo(el, { offset: -80, duration: 1.2 });
        } else {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        window.location.assign(`/${action.href}`);
      }
    } else if (action.type === 'link') {
      window.location.assign(action.href);
    } else if (action.type === 'download') {
      window.open(action.href, '_blank');
    }
  };

  const handleSend = async (userPromptText) => {
    const textToSend = userPromptText || input;
    if (!textToSend.trim()) return;

    const userMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: textToSend.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const context = buildPortfolioContext({
      siteDoc,
      projects: Array.isArray(projectsDoc?.items) ? projectsDoc.items : [],
      skills: Array.isArray(skillsDoc?.items) ? skillsDoc.items : [],
      experience: Array.isArray(experienceDoc?.items) ? experienceDoc.items : [],
      certs: Array.isArray(certsDoc?.items) ? certsDoc.items : [],
      badges: Array.isArray(badgesDoc?.items) ? badgesDoc.items : []
    });

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || siteDoc?.geminiApiKey;

    let response = null;
    if (apiKey) {
      response = await queryGeminiApi(textToSend, context, apiKey);
    }

    if (!response) {
      await new Promise(r => setTimeout(r, 600));
      response = queryLocalOrbitalBrain(textToSend, context);
    }

    setIsTyping(false);
    setMessages(prev => [
      ...prev,
      {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: response.text,
        actions: response.actions || []
      }
    ]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: `Chat reset. I am ready to answer any questions about Sahan's engineering experience or projects!`,
        actions: [
          { label: '⚡ Top Skills', href: '#skills', type: 'scroll' },
          { label: '🚀 Featured Projects', href: '#projects', type: 'scroll' },
          { label: '✉️ Contact Sahan', href: '#contact', type: 'scroll' }
        ]
      }
    ]);
  };

  return (
    <>
      {/* Futuristic Space-Themed Orbital AI Floating Trigger */}
      <motion.div
        className="fixed bottom-6 right-6 z-40"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-slate-950/90 text-accent transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none"
          aria-label="Open Orbital AI Assistant"
          title="Chat with Orbital AI"
        >
          {/* 1. Ambient Cosmic Glow Aura */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-accent/40 via-cyan-400/30 to-blue-600/40 opacity-70 blur-md group-hover:opacity-100 transition-opacity animate-pulse pointer-events-none" />

          {/* 2. Sleek Orbital Ring with Satellite Particle */}
          <div className="absolute -inset-1.5 rounded-full border border-cyan-400/25 animate-[spin_12s_linear_infinite] group-hover:border-cyan-400/60 pointer-events-none">
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8]" />
          </div>

          {/* 3. Core Glass Sphere Container */}
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-slate-950/90 border border-white/15 group-hover:border-accent/60 shadow-[inset_0_0_15px_rgba(56,189,248,0.15)] backdrop-blur-xl transition-colors">
            {isOpen ? (
              <X size={22} className="text-white transition-transform group-hover:rotate-90 duration-200" />
            ) : (
              <div className="relative flex items-center justify-center">
                {/* Professional Astronaut Visor Icon */}
                <motion.div
                  animate={{ y: [0, -1.5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="flex items-center justify-center text-accent"
                >
                  <svg className="w-7 h-7" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Outer Helmet Silhouette */}
                    <path
                      d="M14 3.5C8.75 3.5 4.5 7.75 4.5 13C4.5 16.5 6.4 19.5 9.2 21.2V23C9.2 23.8 9.9 24.5 10.7 24.5H17.3C18.1 24.5 18.8 23.8 18.8 23V21.2C21.6 19.5 23.5 16.5 23.5 13C23.5 7.75 19.25 3.5 14 3.5Z"
                      className="stroke-accent"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    {/* Reflective Panoramic Visor */}
                    <path
                      d="M8 12C8 9.2 10.2 7 13 7H15C17.8 7 20 9.2 20 12V14C20 16.8 17.8 19 15 19H13C10.2 19 8 16.8 8 14V12Z"
                      fill="rgba(56, 189, 248, 0.2)"
                      className="stroke-cyan-400"
                      strokeWidth="1.5"
                    />
                    {/* Visor Glint Reflection */}
                    <path
                      d="M10.5 10C11.2 9.2 12.2 8.8 13.5 8.8"
                      stroke="#FFFFFF"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      opacity="0.9"
                    />
                    {/* Side Comms Knobs */}
                    <circle cx="3.8" cy="13" r="1.2" fill="#38BDF8" />
                    <circle cx="24.2" cy="13" r="1.2" fill="#38BDF8" />
                  </svg>
                </motion.div>
              </div>
            )}
          </div>

          {/* 4. Telemetry Online Radar Dot */}
          <span className="absolute bottom-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 border-2 border-slate-950 shadow-[0_0_8px_#34d399]" />
          </span>

          {/* 5. Space Telemetry Monospace Tooltip */}
          <span className="pointer-events-none absolute -left-36 top-1/2 -translate-y-1/2 rounded-full border border-cyan-400/30 bg-slate-950/95 px-3 py-1 text-[10px] font-mono tracking-widest text-cyan-300 opacity-0 shadow-[0_0_15px_rgba(56,189,248,0.25)] backdrop-blur-md transition-all duration-200 group-hover:-translate-x-2 group-hover:opacity-100 hidden sm:block">
            NOVA CO-PILOT
          </span>
        </button>
      </motion.div>

      {/* Main AI Chat Interface Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`fixed z-50 rounded-3xl border border-white/15 bg-slate-950/95 shadow-[0_16px_50px_rgba(0,0,0,0.8),0_0_40px_rgb(var(--color-accent-rgb)/0.15)] backdrop-blur-2xl flex flex-col overflow-hidden transition-all duration-300 ${
              isExpanded
                ? 'inset-4 md:inset-10'
                : 'bottom-24 right-4 md:right-6 w-[calc(100vw-2rem)] md:w-[420px] h-[580px] max-h-[calc(100vh-8rem)]'
            }`}
            style={{
              background: 'radial-gradient(ellipse at top right, rgba(var(--color-accent-rgb), 0.12), rgba(6, 10, 26, 0.98) 70%)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-500/10 text-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.25)]">
                  <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M14 3.5C8.75 3.5 4.5 7.75 4.5 13C4.5 16.5 6.4 19.5 9.2 21.2V23C9.2 23.8 9.9 24.5 10.7 24.5H17.3C18.1 24.5 18.8 23.8 18.8 23V21.2C21.6 19.5 23.5 16.5 23.5 13C23.5 7.75 19.25 3.5 14 3.5Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 12C8 9.2 10.2 7 13 7H15C17.8 7 20 9.2 20 12V14C20 16.8 17.8 19 15 19H13C10.2 19 8 16.8 8 14V12Z"
                      fill="rgba(56, 189, 248, 0.25)"
                      stroke="#38BDF8"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M10.5 10C11.2 9.2 12.2 8.8 13.5 8.8"
                      stroke="#FFFFFF"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold font-display text-white tracking-wide">NOVA AI</h3>
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-mono text-emerald-400">
                      UPLINK ACTIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted font-mono">Autonomous Portfolio Co-Pilot</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-text-muted">
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Reset conversation"
                  className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(prev => !prev)}
                  title={isExpanded ? 'Collapse' : 'Expand'}
                  className="hidden md:block p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                >
                  {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close"
                  className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-3 leading-relaxed ${
                        isUser
                          ? 'bg-accent text-primary font-medium rounded-tr-none shadow-[0_0_15px_rgb(var(--color-accent-rgb)/0.3)]'
                          : 'bg-secondary/40 border border-white/10 text-slate-200 rounded-tl-none backdrop-blur-md'
                      }`}
                    >
                      <div className="whitespace-pre-line space-y-2">
                        {msg.text.split('\n').map((line, i) => {
                          // Simple bold markdown parsing
                          const parsedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
                          return (
                            <p
                              key={i}
                              dangerouslySetInnerHTML={{ __html: parsedLine }}
                              className={line.startsWith('•') ? 'pl-2' : ''}
                            />
                          );
                        })}
                      </div>

                      {/* Attached Navigation / Action triggers */}
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap gap-1.5">
                          {msg.actions.map((act, aIdx) => (
                            <button
                              key={aIdx}
                              type="button"
                              onClick={() => handleActionClick(act)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-accent/30 bg-accent/10 text-accent hover:bg-accent hover:text-primary font-mono text-[10px] transition-colors"
                            >
                              <span>{act.label}</span>
                              <ChevronRight size={11} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-2 text-accent text-xs font-mono pl-2 py-1">
                  <span className="flex gap-1 items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                  <span className="text-[11px] text-text-muted">Orbital Uplink computing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-4 py-2 border-t border-white/5 bg-black/20 overflow-x-auto no-scrollbar flex gap-2">
              {QUICK_SUGGESTIONS.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(sug.replace(/^[^\w]+/, '').trim())}
                  className="whitespace-nowrap rounded-full border border-white/10 bg-secondary/30 px-3 py-1 text-[10px] font-mono text-text-muted hover:border-accent/40 hover:text-white transition-colors shrink-0"
                >
                  {sug}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="border-t border-white/10 p-3 bg-slate-950/80">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-secondary/30 px-3 py-1.5 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/30 transition-all"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about skills, projects, background, hiring…"
                  className="w-full bg-transparent text-xs text-white placeholder:text-text-muted/60 outline-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-primary transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 shrink-0"
                  aria-label="Send query"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default OrbitalAiModal;
