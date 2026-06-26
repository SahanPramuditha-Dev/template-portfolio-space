import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Rocket, RefreshCw, TriangleAlert } from 'lucide-react';
import { useAchievements } from '../context/AchievementsContext';

const GAME_WIDTH = 500;
const GAME_HEIGHT = 600;

// Game Engine State
class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = GAME_WIDTH;
    this.height = GAME_HEIGHT;
    this.lastTime = 0;
    this.score = 0;
    this.isPlaying = false;
    this.isGameOver = false;
    this.keys = {};
    
    // Entities
    this.player = null;
    this.projectiles = [];
    this.enemies = [];
    this.asteroids = [];
    this.particles = [];
    this.stars = [];
    
    // Spawners
    this.enemyTimer = 0;
    this.asteroidTimer = 0;
    this.difficultyMultiplier = 1;
    this.timeSurvived = 0;

    // Binds
    this.loop = this.loop.bind(this);
    
    this.initStars();
  }

  initStars() {
    for (let i = 0; i < 100; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2,
        speed: (Math.random() * 0.5) + 0.1
      });
    }
  }

  start() {
    this.score = 0;
    this.timeSurvived = 0;
    this.difficultyMultiplier = 1;
    this.isPlaying = true;
    this.isGameOver = false;
    this.projectiles = [];
    this.enemies = [];
    this.asteroids = [];
    this.particles = [];
    
    this.player = {
      x: this.width / 2,
      y: this.height - 60,
      width: 30,
      height: 40,
      speed: 300, // px per second
      health: 100,
      maxHealth: 100,
      shootTimer: 0,
      shootCooldown: 200 // ms
    };

    this.lastTime = performance.now();
    requestAnimationFrame(this.loop);
  }

  stop() {
    this.isPlaying = false;
    this.isGameOver = true;
  }

  handleInput(e, isDown) {
    this.keys[e.key] = isDown;
    if (e.key === ' ' && isDown && this.isGameOver) {
       // Ignore spacebar if game over, let React handle retry button
    }
  }

  spawnEnemy() {
    this.enemies.push({
      x: Math.random() * (this.width - 30),
      y: -40,
      width: 30,
      height: 30,
      speed: 100 * this.difficultyMultiplier,
      health: 20 * this.difficultyMultiplier,
      shootTimer: Math.random() * 2000
    });
  }

  spawnAsteroid() {
    this.asteroids.push({
      x: Math.random() * (this.width - 40),
      y: -50,
      width: 40,
      height: 40,
      speed: 150 * this.difficultyMultiplier,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 5
    });
  }

  createExplosion(x, y, color) {
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 200,
        vy: (Math.random() - 0.5) * 200,
        life: 1,
        color
      });
    }
  }

  update(dt) {
    if (!this.isPlaying) return;

    this.timeSurvived += dt;
    this.difficultyMultiplier = 1 + (this.timeSurvived / 30000); // gets 2x harder every 30s

    // Player movement
    if (this.keys['ArrowLeft'] || this.keys['a']) this.player.x -= this.player.speed * (dt / 1000);
    if (this.keys['ArrowRight'] || this.keys['d']) this.player.x += this.player.speed * (dt / 1000);
    if (this.keys['ArrowUp'] || this.keys['w']) this.player.y -= this.player.speed * (dt / 1000);
    if (this.keys['ArrowDown'] || this.keys['s']) this.player.y += this.player.speed * (dt / 1000);

    // Bounds
    this.player.x = Math.max(0, Math.min(this.player.x, this.width - this.player.width));
    this.player.y = Math.max(0, Math.min(this.player.y, this.height - this.player.height));

    // Player Shooting
    this.player.shootTimer -= dt;
    if (this.keys[' '] && this.player.shootTimer <= 0) {
      this.projectiles.push({
        x: this.player.x + this.player.width / 2 - 2,
        y: this.player.y,
        width: 4,
        height: 15,
        speed: -500,
        isPlayer: true
      });
      this.player.shootTimer = this.player.shootCooldown;
    }

    // Spawners
    this.enemyTimer -= dt;
    if (this.enemyTimer <= 0) {
      this.spawnEnemy();
      this.enemyTimer = Math.max(500, 2000 - (this.difficultyMultiplier * 200));
    }

    this.asteroidTimer -= dt;
    if (this.asteroidTimer <= 0) {
      this.spawnAsteroid();
      this.asteroidTimer = Math.max(1000, 3000 - (this.difficultyMultiplier * 300));
    }

    // Update Entities
    this.stars.forEach(s => {
      s.y += s.speed * (dt / 16) * this.difficultyMultiplier;
      if (s.y > this.height) {
        s.y = 0;
        s.x = Math.random() * this.width;
      }
    });

    this.projectiles.forEach(p => {
      p.y += p.speed * (dt / 1000);
    });
    this.projectiles = this.projectiles.filter(p => p.y > -50 && p.y < this.height + 50);

    this.enemies.forEach(e => {
      e.y += e.speed * (dt / 1000);
      e.shootTimer -= dt;
      if (e.shootTimer <= 0) {
        this.projectiles.push({
          x: e.x + e.width / 2 - 2,
          y: e.y + e.height,
          width: 4,
          height: 15,
          speed: 300,
          isPlayer: false
        });
        e.shootTimer = 1500 + Math.random() * 1000;
      }
    });

    this.asteroids.forEach(a => {
      a.y += a.speed * (dt / 1000);
      a.rotation += a.rotSpeed * (dt / 1000);
    });

    this.particles.forEach(p => {
      p.x += p.vx * (dt / 1000);
      p.y += p.vy * (dt / 1000);
      p.life -= dt / 500;
    });
    this.particles = this.particles.filter(p => p.life > 0);

    // Collisions
    // Player Projectiles vs Enemies/Asteroids
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      let p = this.projectiles[i];
      if (!p.isPlayer) continue;

      let hit = false;
      // vs Enemies
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        let e = this.enemies[j];
        if (p.x < e.x + e.width && p.x + p.width > e.x && p.y < e.y + e.height && p.y + p.height > e.y) {
          e.health -= 10;
          hit = true;
          this.createExplosion(p.x, p.y, '#38bdf8');
          if (e.health <= 0) {
            this.createExplosion(e.x + e.width/2, e.y + e.height/2, '#f97316');
            this.score += 25;
            this.enemies.splice(j, 1);
          }
          break;
        }
      }
      
      // vs Asteroids
      if (!hit) {
        for (let j = this.asteroids.length - 1; j >= 0; j--) {
          let a = this.asteroids[j];
          if (p.x < a.x + a.width && p.x + p.width > a.x && p.y < a.y + a.height && p.y + p.height > a.y) {
            hit = true;
            this.createExplosion(p.x, p.y, '#94a3b8');
            this.score += 10;
            this.asteroids.splice(j, 1);
            break;
          }
        }
      }

      if (hit) this.projectiles.splice(i, 1);
    }

    // Enemy Projectiles vs Player
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      let p = this.projectiles[i];
      if (p.isPlayer) continue;
      
      if (p.x < this.player.x + this.player.width && p.x + p.width > this.player.x && 
          p.y < this.player.y + this.player.height && p.y + p.height > this.player.y) {
        this.player.health -= 10;
        this.createExplosion(p.x, p.y, '#ef4444');
        this.projectiles.splice(i, 1);
      }
    }

    // Player vs Enemies/Asteroids
    this.enemies.forEach((e, j) => {
      if (this.player.x < e.x + e.width && this.player.x + this.player.width > e.x && 
          this.player.y < e.y + e.height && this.player.y + this.player.height > e.y) {
        this.player.health -= 20;
        this.createExplosion(e.x + e.width/2, e.y + e.height/2, '#f97316');
        this.enemies.splice(j, 1);
      }
    });

    this.asteroids.forEach((a, j) => {
      if (this.player.x < a.x + a.width && this.player.x + this.player.width > a.x && 
          this.player.y < a.y + a.height && this.player.y + this.player.height > a.y) {
        this.player.health -= 30;
        this.createExplosion(a.x + a.width/2, a.y + a.height/2, '#94a3b8');
        this.asteroids.splice(j, 1);
      }
    });

    // Cleanup offscreen
    this.enemies = this.enemies.filter(e => e.y < this.height + 50);
    this.asteroids = this.asteroids.filter(a => a.y < this.height + 50);

    // Death
    if (this.player.health <= 0) {
      this.createExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2, '#ef4444');
      this.stop();
    }
  }

  draw() {
    this.ctx.fillStyle = '#020617';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Stars
    this.ctx.fillStyle = '#ffffff';
    this.stars.forEach(s => {
      this.ctx.globalAlpha = Math.random() * 0.5 + 0.5;
      this.ctx.fillRect(s.x, s.y, s.size, s.size);
    });
    this.ctx.globalAlpha = 1;

    if (!this.isPlaying && !this.isGameOver) {
      return; // Handled by React UI
    }

    // Particles
    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1;

    // Projectiles
    this.projectiles.forEach(p => {
      this.ctx.fillStyle = p.isPlayer ? '#38bdf8' : '#ef4444';
      this.ctx.fillRect(p.x, p.y, p.width, p.height);
      // Glow
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = p.isPlayer ? '#38bdf8' : '#ef4444';
      this.ctx.fillRect(p.x, p.y, p.width, p.height);
      this.ctx.shadowBlur = 0;
    });

    // Enemies (Red Ships)
    this.enemies.forEach(e => {
      this.ctx.fillStyle = '#f43f5e';
      this.ctx.beginPath();
      this.ctx.moveTo(e.x + e.width / 2, e.y + e.height);
      this.ctx.lineTo(e.x, e.y);
      this.ctx.lineTo(e.x + e.width, e.y);
      this.ctx.closePath();
      this.ctx.fill();
    });

    // Asteroids (Grey rocks)
    this.ctx.fillStyle = '#64748b';
    this.ctx.strokeStyle = '#475569';
    this.ctx.lineWidth = 2;
    this.asteroids.forEach(a => {
      this.ctx.save();
      this.ctx.translate(a.x + a.width/2, a.y + a.height/2);
      this.ctx.rotate(a.rotation);
      this.ctx.fillRect(-a.width/2, -a.height/2, a.width, a.height);
      this.ctx.strokeRect(-a.width/2, -a.height/2, a.width, a.height);
      this.ctx.restore();
    });

    // Player (Blue Ship)
    if (!this.isGameOver) {
      this.ctx.fillStyle = '#38bdf8';
      this.ctx.beginPath();
      this.ctx.moveTo(this.player.x + this.player.width / 2, this.player.y);
      this.ctx.lineTo(this.player.x, this.player.y + this.player.height);
      this.ctx.lineTo(this.player.x + this.player.width, this.player.y + this.player.height);
      this.ctx.closePath();
      this.ctx.fill();
      
      // Engine trail
      this.ctx.fillStyle = '#f59e0b';
      this.ctx.globalAlpha = Math.random() * 0.5 + 0.5;
      this.ctx.beginPath();
      this.ctx.moveTo(this.player.x + 5, this.player.y + this.player.height);
      this.ctx.lineTo(this.player.x + this.player.width - 5, this.player.y + this.player.height);
      this.ctx.lineTo(this.player.x + this.player.width / 2, this.player.y + this.player.height + 15 + Math.random()*10);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.globalAlpha = 1;

      // Health Bar
      this.ctx.fillStyle = '#ef4444';
      this.ctx.fillRect(this.player.x, this.player.y + this.player.height + 5, this.player.width, 3);
      this.ctx.fillStyle = '#22c55e';
      this.ctx.fillRect(this.player.x, this.player.y + this.player.height + 5, this.player.width * (this.player.health / this.player.maxHealth), 3);
    }
  }

  loop(time) {
    const dt = time - this.lastTime;
    this.lastTime = time;

    this.update(dt);
    this.draw();

    if (this.onStateUpdate) {
      this.onStateUpdate({
        score: this.score,
        isGameOver: this.isGameOver,
        isPlaying: this.isPlaying
      });
    }

    if (this.isPlaying || this.isGameOver) {
      requestAnimationFrame(this.loop);
    }
  }
}

const GalacticDefender = ({ isOpen, onClose }) => {
  const { unlockAchievement } = useAchievements();
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  
  const [gameState, setGameState] = useState({
    score: 0,
    isPlaying: false,
    isGameOver: false
  });
  
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('galacticHighScore')) || 0);

  useEffect(() => {
    if (isOpen) {
      unlockAchievement('hidden_game');
    }
  }, [isOpen, unlockAchievement]);

  useEffect(() => {
    if (isOpen && canvasRef.current && !engineRef.current) {
      engineRef.current = new GameEngine(canvasRef.current);
      engineRef.current.onStateUpdate = (state) => {
        setGameState(prev => {
          // Avoid unnecessary re-renders
          if (prev.score !== state.score || prev.isGameOver !== state.isGameOver || prev.isPlaying !== state.isPlaying) {
            return state;
          }
          return prev;
        });
      };
      // Draw initial state (stars)
      engineRef.current.draw();
    }

    const handleKeyDown = (e) => {
      // Prevent scrolling with arrows/space when game is open
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      engineRef.current?.handleInput(e, true);
    };
    
    const handleKeyUp = (e) => engineRef.current?.handleInput(e, false);

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown, { passive: false });
      window.addEventListener('keyup', handleKeyUp);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (!isOpen && engineRef.current) {
        engineRef.current.stop();
        engineRef.current = null;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (gameState.isGameOver && gameState.score > highScore) {
      setHighScore(gameState.score);
      localStorage.setItem('galacticHighScore', gameState.score.toString());
    }
  }, [gameState.isGameOver, gameState.score, highScore]);

  const startGame = () => {
    engineRef.current?.start();
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
            className="relative bg-secondary/90 border border-accent/20 p-6 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col items-center max-w-[100vw]"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-text-muted hover:text-accent transition-colors bg-primary/50 p-2 rounded-full border border-white/5 z-30"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4 w-full justify-center">
              <Rocket className="text-accent" size={24} />
              <h3 className="text-xl font-bold text-white tracking-wider uppercase font-mono">Galactic Defender</h3>
            </div>

            <div className="flex gap-8 mb-4 font-mono text-sm">
              <div className="flex flex-col items-center bg-primary/40 px-4 py-2 rounded-lg border border-white/5 min-w-[100px]">
                <span className="text-text-muted text-[10px] uppercase tracking-wider mb-1">Score</span>
                <span className="text-accent font-bold text-lg">{gameState.score}</span>
              </div>
              <div className="flex flex-col items-center bg-primary/40 px-4 py-2 rounded-lg border border-white/5 min-w-[100px]">
                <span className="text-text-muted text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Trophy size={10} /> Best
                </span>
                <span className="text-text font-bold text-lg">{highScore}</span>
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-inner bg-primary">
              <canvas 
                ref={canvasRef}
                width={GAME_WIDTH}
                height={GAME_HEIGHT}
                className="max-w-full h-auto max-h-[60vh] object-contain block"
              />

              {!gameState.isPlaying && !gameState.isGameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20">
                  <Rocket className="text-accent mb-4 animate-bounce" size={48} />
                  <button
                    onClick={startGame}
                    className="px-8 py-3 bg-accent text-primary font-bold rounded-full hover:bg-accent/90 transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(56,189,248,0.4)]"
                  >
                    Launch Mission
                  </button>
                  <p className="text-text-muted text-xs mt-4 font-mono">Use WASD or Arrows to Move</p>
                  <p className="text-text-muted text-xs mt-1 font-mono">Spacebar to Shoot</p>
                </div>
              )}

              {gameState.isGameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-20">
                  <div className="bg-red-500/20 p-4 rounded-full mb-4">
                    <TriangleAlert className="text-red-400" size={40} />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2 font-mono">Hull Breach!</h4>
                  <p className="text-text-muted mb-6">Final Score: <span className="text-accent font-bold">{gameState.score}</span></p>
                  <button
                    onClick={startGame}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-all border border-white/20"
                  >
                    <RefreshCw size={18} /> Retry Mission
                  </button>
                </div>
              )}
            </div>
            
            {/* Mobile Controls note */}
            <p className="text-text-muted text-[10px] mt-4 font-mono opacity-60 text-center max-w-[300px]">
              Keyboard required for optimal experience. Mobile touch controls are disabled for this advanced simulation.
            </p>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GalacticDefender;
