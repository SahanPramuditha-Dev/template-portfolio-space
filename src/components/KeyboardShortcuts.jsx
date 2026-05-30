import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Keyboard, Search, X } from 'lucide-react';

const KeyboardShortcuts = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [query, setQuery] = useState('');

  const commands = [
    { key: 'home', label: 'Home', target: '#home' },
    { key: 'about', label: 'About', target: '#about' },
    { key: 'now', label: 'Now & Availability', target: '#now' },
    { key: 'skills', label: 'Skills', target: '#skills' },
    { key: 'experience', label: 'Experience', target: '#experience' },
    { key: 'projects', label: 'Projects', target: '#projects' },
    { key: 'testimonials', label: 'Testimonials', target: '#testimonials' },
    { key: 'blog', label: 'Blog', target: '#blog' },
    { key: 'contact', label: 'Contact', target: '#contact' },
    { key: 'resume', label: 'Resume Page', target: '/resume' },
    { key: 'services', label: 'Services Page', target: '/services' },
    { key: 'resources', label: 'Resources Page', target: '/resources' },
    { key: 'opensource', label: 'Open Source Page', target: '/opensource' },
  ];

  const shortcuts = [
    { key: 'CTRL K', description: 'Open command palette' },
    { key: '?', description: 'Show/hide keyboard shortcuts' },
    { key: 'G H', description: 'Go to Home' },
    { key: 'G A', description: 'Go to About' },
    { key: 'G N', description: 'Go to Now' },
    { key: 'G E', description: 'Go to Experience' },
    { key: 'G P', description: 'Go to Projects' },
    { key: 'G T', description: 'Go to Testimonials' },
    { key: 'G B', description: 'Go to Blog' },
    { key: 'G C', description: 'Go to Contact' },
    { key: 'ESC', description: 'Close modals/dialogs' },
  ];

  const visibleCommands = commands.filter((command) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return command.label.toLowerCase().includes(q) || command.key.includes(q);
  });

  const navigateTo = (target) => {
    if (target.startsWith('#')) {
      document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = target;
    }
    setCommandOpen(false);
    setQuery('');
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      const target = e.target;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((open) => !open);
        return;
      }

      if (e.key === 'Escape') {
        setCommandOpen(false);
        setShowHelp(false);
        setIsOpen(false);
      }

      // Press '?' to toggle help
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Don't trigger if typing in input/textarea
        if (!isTyping) {
          e.preventDefault();
          setShowHelp(!showHelp);
        }
      }

      // Press 'G' then another key for navigation (vim-style)
      if (e.key === 'g' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (!isTyping) {
          setIsOpen(true);
          setTimeout(() => setIsOpen(false), 2000);
        }
      }

      if (isOpen) {
        if (!isTyping) {
          switch (e.key.toLowerCase()) {
            case 'h':
              document.querySelector('#home')?.scrollIntoView({ behavior: 'smooth' });
              setIsOpen(false);
              break;
            case 'a':
              document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
              setIsOpen(false);
              break;
            case 'n':
              document.querySelector('#now')?.scrollIntoView({ behavior: 'smooth' });
              setIsOpen(false);
              break;
            case 'e':
              document.querySelector('#experience')?.scrollIntoView({ behavior: 'smooth' });
              setIsOpen(false);
              break;
            case 'p':
              document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' });
              setIsOpen(false);
              break;
            case 't':
              document.querySelector('#testimonials')?.scrollIntoView({ behavior: 'smooth' });
              setIsOpen(false);
              break;
            case 'b':
              document.querySelector('#blog')?.scrollIntoView({ behavior: 'smooth' });
              setIsOpen(false);
              break;
            case 'c':
              document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
              setIsOpen(false);
              break;
            default:
              setIsOpen(false);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, showHelp]);

  return (
    <>
      {/* Keyboard hint indicator */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-secondary/90 backdrop-blur-md border border-accent/20 rounded-lg px-4 py-2 z-50 shadow-xl"
          >
            <p className="text-text font-mono text-sm">
              Press <kbd className="px-2 py-1 bg-primary rounded border border-accent/30">H</kbd> for Home,{' '}
              <kbd className="px-2 py-1 bg-primary rounded border border-accent/30">A</kbd> for About,{' '}
              <kbd className="px-2 py-1 bg-primary rounded border border-accent/30">N</kbd> for Now,{' '}
              <kbd className="px-2 py-1 bg-primary rounded border border-accent/30">E</kbd> for Experience,{' '}
              <kbd className="px-2 py-1 bg-primary rounded border border-accent/30">P</kbd> for Projects,{' '}
              <kbd className="px-2 py-1 bg-primary rounded border border-accent/30">T</kbd> for Testimonials,{' '}
              <kbd className="px-2 py-1 bg-primary rounded border border-accent/30">B</kbd> for Blog,{' '}
              <kbd className="px-2 py-1 bg-primary rounded border border-accent/30">C</kbd> for Contact
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {commandOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCommandOpen(false)}
              className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              className="fixed left-1/2 top-24 z-[101] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 bg-primary shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
            >
              <div className="flex items-center gap-3 border-b border-secondary/50 px-4 py-3">
                <Search size={18} className="text-accent" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && visibleCommands[0]) {
                      navigateTo(visibleCommands[0].target);
                    }
                  }}
                  placeholder="Jump to a section or page"
                  className="min-w-0 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
                />
                <button
                  type="button"
                  onClick={() => setCommandOpen(false)}
                  className="rounded-lg p-2 text-text-muted transition-colors hover:bg-secondary/60 hover:text-text"
                  aria-label="Close command palette"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-2">
                {visibleCommands.map((command) => (
                  <button
                    key={command.key}
                    type="button"
                    onClick={() => navigateTo(command.target)}
                    className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm text-text-muted transition-colors hover:bg-secondary/50 hover:text-text"
                  >
                    <span>{command.label}</span>
                    <ArrowRight size={15} className="text-accent" />
                  </button>
                ))}
                {visibleCommands.length === 0 && (
                  <p className="px-4 py-8 text-center text-sm text-text-muted">No matching commands.</p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Keyboard shortcuts help modal */}
      <AnimatePresence>
        {showHelp && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelp(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary border border-secondary rounded-xl p-6 max-w-md w-full mx-4 z-[101] shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Keyboard size={24} className="text-accent" />
                  <h2 className="text-2xl font-bold text-text">Keyboard Shortcuts</h2>
                </div>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-secondary/50 last:border-0">
                    <span className="text-text-muted">{shortcut.description}</span>
                    <div className="flex gap-1">
                      {shortcut.key.split(' ').map((key, i) => (
                        <kbd
                          key={i}
                          className="px-2 py-1 bg-secondary rounded border border-accent/30 text-accent font-mono text-sm"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-text-muted mt-4 text-center font-mono">
                Press <kbd className="px-1 py-0.5 bg-secondary rounded border border-accent/30">?</kbd> to close
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default KeyboardShortcuts;
