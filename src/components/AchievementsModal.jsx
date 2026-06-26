import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Lock, Unlock, RotateCcw, Calendar } from 'lucide-react';
import { useAchievements } from '../context/AchievementsContext';

const AchievementsModal = ({ isOpen, onClose }) => {
  const { achievements, resetAchievements, unlockedCount } = useAchievements();

  React.useEffect(() => {
    if (!isOpen) return;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-primary/80 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-secondary/90 p-6 shadow-[0_0_50px_rgba(var(--color-accent-rgb)/0.15)] backdrop-blur-xl md:p-8"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full border border-white/5 bg-primary/45 p-2 text-text-muted hover:border-accent/40 hover:text-accent transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent border border-accent/25">
              <Trophy size={24} className="animate-pulse" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-text">Space Mission Badges</h2>
              <p className="font-mono text-[10px] text-text-muted">Unlocking cosmic achievements as you explore</p>
            </div>
          </div>

          {/* Progress Section */}
          <div className="mb-6 rounded-2xl border border-white/5 bg-primary/40 p-4 font-mono">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-text-muted">MISSION COMPLETED:</span>
              <span className="text-accent font-bold">
                {unlockedCount} / {achievements.length} BADGES ({Math.round((unlockedCount / achievements.length) * 100)}%)
              </span>
            </div>
            <div className="w-full h-2 bg-secondary/80 rounded-full overflow-hidden border border-white/5 p-[1px]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-accent rounded-full"
              />
            </div>
          </div>

          {/* List of Badges */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar" data-lenis-prevent>
            {achievements.map((achievement) => {
              const isUnlocked = achievement.unlocked;
              return (
                <div
                  key={achievement.id}
                  className={`flex items-start gap-4 rounded-2xl border p-4 transition-all duration-300 ${
                    isUnlocked
                      ? 'border-accent/25 bg-accent/5 shadow-[0_2px_12px_rgba(var(--color-accent-rgb)/0.05)]'
                      : 'border-white/5 bg-primary/20 opacity-70'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                      isUnlocked
                        ? 'bg-accent/20 border-accent/30 text-accent'
                        : 'bg-secondary/40 border-white/5 text-text-muted'
                    }`}
                  >
                    {isUnlocked ? <Unlock size={18} /> : <Lock size={18} />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-display text-sm font-bold ${isUnlocked ? 'text-text' : 'text-text-muted'}`}>
                        {achievement.title}
                      </h3>
                      {isUnlocked && achievement.unlockedAt && (
                        <span className="inline-flex items-center gap-0.5 font-mono text-[8px] text-accent/80 bg-accent/10 rounded px-1.5 py-0.5 ml-auto">
                          <Calendar size={9} />
                          {new Date(achievement.unlockedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-[10px] text-text-muted mt-1 leading-normal">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer controls */}
          <div className="mt-8 flex justify-between items-center border-t border-white/5 pt-4">
            <button
              type="button"
              onClick={resetAchievements}
              className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase text-text-muted hover:text-accent transition-colors"
              title="Reset Achievements"
            >
              <RotateCcw size={12} />
              Reset Progress
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-accent px-5 py-2.5 font-mono text-xs font-bold text-primary hover:bg-accent/90 transition-colors"
            >
              Continue Mission
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AchievementsModal;
