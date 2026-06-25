import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, FolderOpen, Mail, FileText, ChevronUp, User } from 'lucide-react';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';

const NAV_ITEMS = [
  { id: 'home',     label: 'Home',     icon: Home,       href: '#home' },
  { id: 'about',    label: 'About',    icon: User,       href: '#about' },
  { id: 'projects', label: 'Work',     icon: FolderOpen, href: '#projects' },
  { id: 'contact',  label: 'Contact',  icon: Mail,       href: '#contact' },
];

const MobileQuickActions = () => {
  const { data: siteDoc, loading } = useCmsDoc(CMS_DOCS.site, null);
  const [active, setActive]       = useState('home');
  const [visible, setVisible]     = useState(true);
  const [lastY, setLastY]         = useState(0);
  const [cvOpen, setCvOpen]       = useState(false);

  // Hide bar when scrolling down, show when scrolling up
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setVisible(y < lastY || y < 60);
      setLastY(y);

      // Active section detection
      const ids = NAV_ITEMS.map(n => n.id);
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i]);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActive(ids[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastY]);

  if (loading || siteDoc === undefined) return null;

  const resumeUrl = siteDoc?.resumeUrl || '/resume.pdf';

  const handleNav = (href) => {
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActive(id);
    }
    setCvOpen(false);
  };

  return (
    <>
      {/* CV quick-sheet overlay */}
      <AnimatePresence>
        {cvOpen && (
          <motion.div
            key="cv-overlay"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            className="fixed inset-x-3 bottom-[76px] z-50 rounded-2xl border border-white/10 bg-primary/95 p-4 shadow-2xl backdrop-blur-md md:hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-mono uppercase tracking-widest text-accent">Quick actions</p>
              <button onClick={() => setCvOpen(false)} className="text-text-muted p-1">
                <ChevronUp size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={resumeUrl}
                download
                onClick={() => setCvOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-primary"
              >
                <FileText size={16} />
                Download CV
              </a>
              <a
                href={`mailto:${siteDoc?.contactEmail || siteDoc?.footerEmail || ''}`}
                onClick={() => setCvOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm font-semibold text-accent"
              >
                <Mail size={16} />
                Email me
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom navigation bar */}
      <AnimatePresence>
        {visible && (
          <motion.nav
            key="bottom-nav"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="fixed inset-x-3 bottom-3 z-40 flex items-center rounded-2xl border border-white/10 bg-primary/90 px-2 py-1.5 shadow-2xl backdrop-blur-md md:hidden"
            role="navigation"
            aria-label="Mobile navigation"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.href)}
                  className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 rounded-xl transition-colors"
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-xl bg-accent/15"
                      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    />
                  )}
                  <motion.span
                    animate={{ scale: isActive ? 1.15 : 1, y: isActive ? -1 : 0 }}
                    transition={{ type: 'spring', damping: 18, stiffness: 320 }}
                    className={`relative z-10 ${isActive ? 'text-accent' : 'text-text-muted'}`}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                  </motion.span>
                  <span
                    className={`relative z-10 text-[9px] font-mono uppercase tracking-widest transition-colors ${
                      isActive ? 'text-accent' : 'text-text-muted'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}

            {/* CV button */}
            <button
              onClick={() => setCvOpen((o) => !o)}
              className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 rounded-xl transition-colors ${
                cvOpen ? 'text-accent' : 'text-text-muted'
              }`}
              aria-label="Download CV"
              aria-expanded={cvOpen}
            >
              {cvOpen && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-xl bg-accent/15"
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                />
              )}
              <motion.span
                animate={{ scale: cvOpen ? 1.15 : 1, rotate: cvOpen ? 180 : 0 }}
                transition={{ type: 'spring', damping: 18, stiffness: 320 }}
                className="relative z-10"
              >
                <FileText size={20} strokeWidth={cvOpen ? 2.2 : 1.8} />
              </motion.span>
              <span className="relative z-10 text-[9px] font-mono uppercase tracking-widest">
                CV
              </span>
            </button>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileQuickActions;
