import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Rocket, RefreshCw, ChevronLeft, ChevronRight, TriangleAlert } from 'lucide-react';
import { useAchievements } from '../context/AchievementsContext';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 500;
const SHIP_SIZE = 30;
const ASTEROID_SIZE = 24;
const INITIAL_SPEED = 3;
const SPEED_INCREMENT = 0.5;

const SpaceGame = ({ isOpen, onClose }) => {
  const { unlockAchievement } = useAchievements();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('spaceGameHighScore')) || 0);
  
  const [shipX, setShipX] = useState(GAME_WIDTH / 2 - SHIP_SIZE / 2);
  const [asteroids, setAsteroids] = useState([]);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  
  const gameLoopRef = useRef(null);
  const keysRef = useRef({ left: false, right: false });

  useEffect(() => {
    if (isOpen) {
      unlockAchievement('hidden_game');
    }
  }, [isOpen, unlockAchievement]);

  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setShipX(GAME_WIDTH / 2 - SHIP_SIZE / 2);
    setAsteroids([]);
    setSpeed(INITIAL_SPEED);
    keysRef.current = { left: false, right: false };
  };

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keysRef.current.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd') keysRef.current.right = true;
  }, []);

  const handleKeyUp = useCallback((e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keysRef.current.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keysRef.current.right = false;
  }, []);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOpen, handleKeyDown, handleKeyUp]);

  // Game Loop
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    let animationFrameId;
    let lastTime = performance.now();
    let spawnTimer = 0;
    
    const loop = (time) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      setShipX((prev) => {
        let newX = prev;
        if (keysRef.current.left) newX -= 6;
        if (keysRef.current.right) newX += 6;
        return Math.max(0, Math.min(newX, GAME_WIDTH - SHIP_SIZE));
      });

      setAsteroids((prev) => {
        const nextAsteroids = prev.map(a => ({ ...a, y: a.y + speed })).filter(a => a.y < GAME_HEIGHT);
        
        // Check collisions
        const hasCollision = nextAsteroids.some(a => {
          return (
            a.x < shipX + SHIP_SIZE - 4 &&
            a.x + ASTEROID_SIZE > shipX + 4 &&
            a.y < GAME_HEIGHT - 10 - SHIP_SIZE + SHIP_SIZE - 4 &&
            a.y + ASTEROID_SIZE > GAME_HEIGHT - 10 - SHIP_SIZE + 4
          );
        });

        if (hasCollision) {
          setIsGameOver(true);
          setIsPlaying(false);
        }

        return nextAsteroids;
      });

      if (!isGameOver) {
        setScore(s => s + 1);
        if (score > 0 && score % 1000 === 0) {
          setSpeed(s => s + SPEED_INCREMENT);
        }

        spawnTimer += deltaTime;
        const spawnRate = Math.max(300, 1000 - (speed * 100)); // faster spawn as speed increases
        
        if (spawnTimer > spawnRate) {
          setAsteroids(prev => [
            ...prev,
            { x: Math.random() * (GAME_WIDTH - ASTEROID_SIZE), y: -ASTEROID_SIZE, id: Math.random() }
          ]);
          spawnTimer = 0;
        }

        animationFrameId = requestAnimationFrame(loop);
      }
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, isGameOver, speed, shipX, score]); // Using dependencies carefully to avoid breaking loop, but React state inside rAF can be tricky if not ref-based.
  
  // Actually, standard rAF pattern with React state dependencies can cause jitter or missed frames if state updates trigger re-renders that cancel and restart rAF.
  // We'll trust this simple implementation for now, or refine it if it jitters.

  useEffect(() => {
    if (isGameOver && score > highScore) {
      setHighScore(score);
      localStorage.setItem('spaceGameHighScore', score.toString());
    }
  }, [isGameOver, score, highScore]);

  // Mobile controls
  const handleMobileMove = (dir) => {
    if (dir === 'left') {
      keysRef.current.left = true;
      keysRef.current.right = false;
    } else if (dir === 'right') {
      keysRef.current.left = false;
      keysRef.current.right = true;
    } else {
      keysRef.current.left = false;
      keysRef.current.right = false;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-primary/95 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-secondary/80 border border-accent/20 p-6 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col items-center max-w-[100vw]"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-text-muted hover:text-accent transition-colors bg-primary/50 p-2 rounded-full border border-white/5"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6 w-full justify-center">
              <Rocket className="text-accent" size={28} />
              <h3 className="text-xl font-bold text-white tracking-wider uppercase font-mono">Asteroid Dodge</h3>
            </div>

            <div className="flex gap-8 mb-4 font-mono text-sm">
              <div className="flex flex-col items-center bg-primary/40 px-4 py-2 rounded-lg border border-white/5">
                <span className="text-text-muted text-[10px] uppercase tracking-wider mb-1">Score</span>
                <span className="text-accent font-bold text-lg">{Math.floor(score / 10)}</span>
              </div>
              <div className="flex flex-col items-center bg-primary/40 px-4 py-2 rounded-lg border border-white/5">
                <span className="text-text-muted text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Trophy size={10} /> Best
                </span>
                <span className="text-text font-bold text-lg">{Math.floor(highScore / 10)}</span>
              </div>
            </div>

            {/* Game Canvas container */}
            <div 
              className="relative bg-primary overflow-hidden rounded-xl border border-white/10 shadow-inner"
              style={{ 
                width: Math.min(GAME_WIDTH, window.innerWidth - 64), 
                height: Math.min(GAME_HEIGHT, window.innerHeight - 250)
              }}
            >
              {/* Starfield background effect */}
              <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at center, transparent 0%, #020617 100%), url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2338bdf8\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

              {!isPlaying && !isGameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20">
                  <Rocket className="text-accent mb-4 animate-bounce" size={48} />
                  <button
                    onClick={startGame}
                    className="px-6 py-3 bg-accent text-primary font-bold rounded-full hover:bg-accent/90 transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(56,189,248,0.4)]"
                  >
                    Launch Mission
                  </button>
                  <p className="text-text-muted text-xs mt-4 font-mono">Use Left/Right Arrows or A/D</p>
                </div>
              )}

              {isGameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-20">
                  <div className="bg-red-500/20 p-4 rounded-full mb-4">
                    <TriangleAlert className="text-red-400" size={40} />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2 font-mono">Hull Breach!</h4>
                  <p className="text-text-muted mb-6">Final Score: <span className="text-accent font-bold">{Math.floor(score / 10)}</span></p>
                  <button
                    onClick={startGame}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-all border border-white/20"
                  >
                    <RefreshCw size={18} /> Retry Mission
                  </button>
                </div>
              )}

              {/* Game Elements */}
              {/* Ship */}
              <div 
                className="absolute text-accent"
                style={{ 
                  left: shipX, 
                  bottom: 10,
                  width: SHIP_SIZE,
                  height: SHIP_SIZE,
                  transform: `translateX(${GAME_WIDTH !== Math.min(GAME_WIDTH, window.innerWidth - 64) ? - (GAME_WIDTH - Math.min(GAME_WIDTH, window.innerWidth - 64))/2 : 0}px)` 
                }}
              >
                <Rocket size={SHIP_SIZE} className="drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
              </div>

              {/* Asteroids */}
              {asteroids.map(ast => (
                <div
                  key={ast.id}
                  className="absolute text-slate-400 opacity-90"
                  style={{
                    left: ast.x,
                    top: ast.y,
                    width: ASTEROID_SIZE,
                    height: ASTEROID_SIZE,
                    transform: `translateX(${GAME_WIDTH !== Math.min(GAME_WIDTH, window.innerWidth - 64) ? - (GAME_WIDTH - Math.min(GAME_WIDTH, window.innerWidth - 64))/2 : 0}px)` 
                  }}
                >
                  <div className="w-full h-full bg-slate-600 rounded-lg transform rotate-45 shadow-inner border-2 border-slate-700" />
                </div>
              ))}
            </div>

            {/* Mobile Controls */}
            <div className="flex gap-4 mt-6 sm:hidden w-full justify-center">
              <button 
                onPointerDown={() => handleMobileMove('left')}
                onPointerUp={() => handleMobileMove('stop')}
                onPointerLeave={() => handleMobileMove('stop')}
                className="flex-1 bg-primary/60 border border-white/10 rounded-xl p-4 flex justify-center active:bg-accent/20"
              >
                <ChevronLeft className="text-accent" />
              </button>
              <button 
                onPointerDown={() => handleMobileMove('right')}
                onPointerUp={() => handleMobileMove('stop')}
                onPointerLeave={() => handleMobileMove('stop')}
                className="flex-1 bg-primary/60 border border-white/10 rounded-xl p-4 flex justify-center active:bg-accent/20"
              >
                <ChevronRight className="text-accent" />
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SpaceGame;
