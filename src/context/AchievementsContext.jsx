/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Trophy } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const AchievementsContext = createContext();

const INITIAL_ACHIEVEMENTS = [
  {
    id: 'space-pilot',
    title: 'Space Pilot',
    description: 'Rotated and explored the 3D Space Shuttle model in detail.',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'curious-astronaut',
    title: 'Curious Astronaut',
    description: 'Opened the keyboard shortcuts panel or the command palette.',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'secret-hacker',
    title: 'Secret Hacker',
    description: 'Discovered and triggered the hidden Konami code Snake Game.',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'space-voyager',
    title: 'Deep Space Voyager',
    description: 'Travelled the cosmos and scrolled all the way to the bottom.',
    unlocked: false,
    unlockedAt: null,
  },
];

const playChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const t = ctx.currentTime;
    osc.type = 'sine';
    
    // Quick success chime: C5 -> E5 -> G5
    osc.frequency.setValueAtTime(523.25, t); // C5
    osc.frequency.setValueAtTime(659.25, t + 0.08); // E5
    osc.frequency.setValueAtTime(783.99, t + 0.16); // G5
    
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    
    osc.start(t);
    osc.stop(t + 0.4);
  } catch (e) {
    console.error('Audio chime failed:', e);
  }
};

const triggerConfetti = () => {
  try {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#38bdf8', '#818cf8', '#a855f7', '#fbbf24'],
      zIndex: 99999,
    });
  } catch (e) {
    console.error('Confetti trigger failed:', e);
  }
};

export const AchievementsProvider = ({ children }) => {
  const [achievements, setAchievements] = useState(() => {
    if (typeof window === 'undefined') return INITIAL_ACHIEVEMENTS;
    const stored = window.localStorage.getItem('space_achievements');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return INITIAL_ACHIEVEMENTS.map(initial => {
          const matched = parsed.find(p => p.id === initial.id);
          return matched ? { ...initial, ...matched } : initial;
        });
      } catch {
        return INITIAL_ACHIEVEMENTS;
      }
    }
    return INITIAL_ACHIEVEMENTS;
  });

  const [activeToast, setActiveToast] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('space_achievements', JSON.stringify(achievements));
  }, [achievements]);

  const unlockAchievement = useCallback((id) => {
    setAchievements((prev) => {
      const idx = prev.findIndex((a) => a.id === id);
      if (idx === -1 || prev[idx].unlocked) return prev;

      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        unlocked: true,
        unlockedAt: new Date().toISOString(),
      };

      // Trigger effects for unlock
      playChime();
      triggerConfetti();
      setActiveToast(updated[idx]);

      return updated;
    });
  }, []);

  // Dismiss toast after delay
  useEffect(() => {
    if (!activeToast) return undefined;
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [activeToast]);

  const resetAchievements = useCallback(() => {
    setAchievements(INITIAL_ACHIEVEMENTS);
  }, []);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <AchievementsContext.Provider value={{ achievements, unlockAchievement, resetAchievements, unlockedCount }}>
      {children}

      {/* Unlocked Toast overlay */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9, transition: { duration: 0.2 } }}
            className="fixed bottom-6 right-6 z-[99999] flex items-center gap-4 rounded-2xl border border-accent/35 bg-primary/95 p-4 shadow-[0_0_30px_rgba(var(--color-accent-rgb)/0.25)] backdrop-blur-md max-w-sm"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/25">
              <Trophy size={22} className="animate-pulse" />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-accent">Space Mission Success</p>
              <h4 className="font-display text-sm font-bold text-text truncate mt-0.5">{activeToast.title}</h4>
              <p className="font-mono text-[10px] text-text-muted mt-0.5 leading-normal">{activeToast.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AchievementsContext.Provider>
  );
};

export const useAchievements = () => useContext(AchievementsContext);
