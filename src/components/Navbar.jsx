
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Menu, X, Gamepad2 } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import SnakeGame from './SnakeGame';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  // Konami Code Logic
  useEffect(() => {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    const handleKeyDown = (e) => {
      if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          setIsGameOpen(true);
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Set initial state on load
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Active section highlighting on scroll
  useEffect(() => {
    const sections = ['home', 'about', 'now', 'skills', 'experience', 'projects', 'certifications', 'testimonials', 'blog', 'contact'];
    const sectionElements = sections.map(id => document.getElementById(id)).filter(Boolean);
    let activeRatios = new Map();

    const observer = new IntersectionObserver(
      (entries) => {
        const ratios = new Map();
        entries.forEach(entry => {
          ratios.set(entry.target.id, entry.intersectionRatio);
        });
        activeRatios = ratios;
        // Find section with highest visibility (>25%)
        let maxRatio = 0;
        let mostVisible = 'home';
        for (const [id, ratio] of activeRatios) {
          if (ratio > 0.25 && ratio > maxRatio) {
            maxRatio = ratio;
            mostVisible = id;
          }
        }
        setActiveSection(mostVisible);
      },
      {
        rootMargin: '-20% 0px -40% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1]
      }
    );

    sectionElements.forEach(el => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home', id: 'home' },
    { name: 'About', href: '#about', id: 'about' },
    { name: 'Projects', href: '#projects', id: 'projects' },
    { name: 'Contact', href: '#contact', id: 'contact' },
  ];

  const moreLinks = [
    { name: 'Now', href: '#now', id: 'now' },
    { name: 'Skills', href: '#skills', id: 'skills' },
    { name: 'Experience', href: '#experience', id: 'experience' },
    { name: 'Certifications', href: '#certifications', id: 'certifications' },
    { name: 'Testimonials', href: '#testimonials', id: 'testimonials' },
    { name: 'Blog', href: '#blog', id: 'blog' },
    { name: 'Services', href: '/services', id: 'services' },
    { name: 'Resources', href: '/resources', id: 'resources' },
    { name: 'Resume', href: '/resume', id: 'resume' },
  ];

  const handleClick = (e, href) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      setIsOpen(false);
      setMoreOpen(false);
    } else if (href.startsWith('/')) {
      window.location.href = href;
    }
  };

  const moreActive = moreLinks.some((link) => link.id === activeSection);

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-primary/80 backdrop-blur-md py-4 shadow-lg' : 'bg-transparent py-6'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center max-w-7xl">
          <a href="#home" onClick={(e) => handleClick(e, '#home')} className="text-2xl font-bold text-accent">
            S<span className="text-text">ahan.</span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8">
            {navLinks.map((link) => (
              <motion.a
                key={link.name}
                href={link.href}
                onClick={(e) => handleClick(e, link.href)}
                className={`inline-flex items-center transition-colors duration-300 relative group font-medium nav-link ${
                  activeSection === link.id ? 'text-accent' : 'text-text-muted hover:text-accent'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {link.name}
                <span 
                  className={`absolute -bottom-1 left-0 h-0.5 bg-accent transition-all duration-300 ${
                    activeSection === link.id ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                ></span>
              </motion.a>
            ))}

            <div className="relative">
              <motion.button
                type="button"
                onClick={() => setMoreOpen((open) => !open)}
                onBlur={() => window.setTimeout(() => setMoreOpen(false), 120)}
                className={`inline-flex items-center gap-1 transition-colors duration-300 font-medium nav-link ${
                  moreActive || moreOpen ? 'text-accent' : 'text-text-muted hover:text-accent'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-expanded={moreOpen}
                aria-haspopup="menu"
              >
                More
                <ChevronDown size={16} className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
              </motion.button>
              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    className="absolute right-0 top-9 w-56 rounded-2xl border border-white/10 bg-primary/95 p-2 shadow-2xl backdrop-blur-md"
                    role="menu"
                  >
                    {moreLinks.map((link) => (
                      <a
                        key={link.name}
                        href={link.href}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => handleClick(e, link.href)}
                        className={`block rounded-xl px-4 py-2.5 text-sm transition-colors ${
                          activeSection === link.id
                            ? 'bg-accent/10 text-accent'
                            : 'text-text-muted hover:bg-secondary/50 hover:text-text'
                        }`}
                        role="menuitem"
                      >
                        {link.name}
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsGameOpen(true)}
              className="p-2 rounded-full bg-secondary text-accent border border-accent/20 hover:border-accent hover:shadow-[0_0_15px_rgb(var(--color-accent-rgb)_/_0.3)] transition-all duration-300"
              aria-label="Play Game"
              title="Play mini game"
            >
              <Gamepad2 size={20} />
            </motion.button>
            
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button & Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsGameOpen(true)}
              className="p-2 rounded-full bg-secondary text-accent border border-accent/20"
              aria-label="Play Game"
              title="Play mini game"
            >
              <Gamepad2 size={20} />
            </motion.button>
            
            <ThemeToggle />
            <button
              className="text-text"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto', transition: { duration: 0.3, ease: "easeInOut" } }}
                exit={{ opacity: 0, height: 0, transition: { duration: 0.2, ease: "easeInOut" } }}
                className="md:hidden bg-primary/95 backdrop-blur-lg border-b border-secondary overflow-hidden absolute top-full left-0 w-full shadow-2xl"
              >
                <div className="flex flex-col items-center py-8 space-y-6">
                  {navLinks.map((link, i) => (
                    <motion.a
                      key={link.name}
                      href={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0, transition: { delay: i * 0.1 } }}
                      className={`text-lg transition-colors font-medium ${
                        activeSection === link.id ? 'text-accent' : 'text-text-muted hover:text-accent'
                      }`}
                      onClick={(e) => handleClick(e, link.href)}
                    >
                      {link.name}
                    </motion.a>
                  ))}
                  {moreLinks.map((link, i) => (
                    <motion.a
                      key={link.name}
                      href={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0, transition: { delay: (i + navLinks.length) * 0.06 } }}
                      className={`text-lg transition-colors font-medium ${
                        activeSection === link.id ? 'text-accent' : 'text-text-muted hover:text-accent'
                      }`}
                      onClick={(e) => handleClick(e, link.href)}
                    >
                      {link.name}
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
      </nav>

      {/* Game Modal */}
      <SnakeGame isOpen={isGameOpen} onClose={() => setIsGameOpen(false)} />
    </>
  );
};

export default Navbar;
