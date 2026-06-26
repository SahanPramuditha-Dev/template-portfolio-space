import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Rocket, RefreshCw, TriangleAlert, Heart, Shield as ShieldIcon } from 'lucide-react';
import { useAchievements } from '../context/AchievementsContext';

const GAME_WIDTH = 500;
const GAME_HEIGHT = 700; // Increased height slightly for more vertical space

// Game Engine Constants
const WEAPON_TYPES = {
  SINGLE: 'single',
  TRIPLE: 'triple',
  PLASMA: 'plasma',
  HOMING: 'homing'
};

const POWERUP_TYPES = ['health', 'shield', 'firerate', 'triple', 'plasma', 'homing', 'life'];

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
    this.powerups = [];
    this.blackHoles = [];
    
    // Spawners & Timers
    this.enemyTimer = 0;
    this.asteroidTimer = 0;
    this.blackHoleTimer = 20000;
    this.bossTimer = 60000; // Boss every 60 seconds
    this.difficultyMultiplier = 1;
    this.timeSurvived = 0;
    this.bossActive = false;

    this.loop = this.loop.bind(this);
    this.initStars();
  }

  initStars() {
    for (let i = 0; i < 150; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2 + 0.5,
        speed: (Math.random() * 0.5) + 0.1,
        color: Math.random() > 0.8 ? (Math.random() > 0.5 ? '#bfdbfe' : '#fef08a') : '#ffffff'
      });
    }
  }

  start() {
    this.score = 0;
    this.timeSurvived = 0;
    this.difficultyMultiplier = 1;
    this.isPlaying = true;
    this.isGameOver = false;
    this.bossActive = false;
    this.bossTimer = 60000;
    this.projectiles = [];
    this.enemies = [];
    this.asteroids = [];
    this.particles = [];
    this.powerups = [];
    this.blackHoles = [];
    
    this.player = {
      x: this.width / 2,
      y: this.height - 80,
      width: 30,
      height: 40,
      vx: 0,
      vy: 0,
      speed: 350, // px per second
      health: 100,
      maxHealth: 100,
      shield: 0,
      maxShield: 100,
      lives: 3,
      shootTimer: 0,
      baseCooldown: 200,
      fireRateMultiplier: 1,
      weapon: WEAPON_TYPES.SINGLE,
      weaponTimer: 0, // How long weapon powerup lasts
      invulnTimer: 0
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
  }

  spawnEnemy() {
    if (this.bossActive) return; // Don't spawn normal enemies during boss

    const isSmall = Math.random() > 0.6;
    
    if (isSmall) {
      // Small fast interceptor
      this.enemies.push({
        type: 'small',
        x: Math.random() * (this.width - 20),
        y: -30,
        width: 20,
        height: 20,
        vx: (Math.random() - 0.5) * 200,
        vy: 200 * this.difficultyMultiplier,
        health: 10 * this.difficultyMultiplier,
        maxHealth: 10 * this.difficultyMultiplier,
        shootTimer: 99999, // rarely shoots
        scoreVal: 15
      });
    } else {
      // Medium fighter
      this.enemies.push({
        type: 'medium',
        x: Math.random() * (this.width - 30),
        y: -40,
        width: 30,
        height: 35,
        vx: 0,
        vy: 100 * this.difficultyMultiplier,
        health: 25 * this.difficultyMultiplier,
        maxHealth: 25 * this.difficultyMultiplier,
        shootTimer: Math.random() * 2000,
        scoreVal: 25
      });
    }
  }

  spawnBoss() {
    this.bossActive = true;
    this.enemies.push({
      type: 'boss',
      x: this.width / 2 - 60,
      y: -150,
      width: 120,
      height: 80,
      vx: 50, // Moves side to side
      vy: 30, // Moves down slowly until a point
      health: 1000 * this.difficultyMultiplier,
      maxHealth: 1000 * this.difficultyMultiplier,
      shootTimer: 1000,
      attackPattern: 0,
      scoreVal: 500
    });
  }

  spawnAsteroid() {
    if (this.bossActive) return;

    this.asteroids.push({
      x: Math.random() * (this.width - 40),
      y: -50,
      width: 40 + Math.random() * 20,
      height: 40 + Math.random() * 20,
      vx: (Math.random() - 0.5) * 50,
      vy: (100 + Math.random() * 100) * this.difficultyMultiplier,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 3
    });
  }

  spawnBlackHole() {
    if (this.bossActive) return;

    this.blackHoles.push({
      x: Math.random() * (this.width - 100) + 50,
      y: -100,
      radius: 40,
      vy: 30,
      rotation: 0
    });
  }

  spawnPowerup(x, y) {
    if (Math.random() > 0.15 && !this.bossActive) return; // 15% drop rate, 100% for boss

    const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
    this.powerups.push({
      x, y,
      width: 20,
      height: 20,
      type,
      vy: 50
    });
  }

  createExplosion(x, y, color, size = 15) {
    for (let i = 0; i < size; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * (size * 10),
        vy: (Math.random() - 0.5) * (size * 10),
        life: 1,
        color
      });
    }
  }

  playerShoot() {
    const pX = this.player.x + this.player.width / 2;
    const pY = this.player.y;

    if (this.player.weapon === WEAPON_TYPES.SINGLE) {
      this.projectiles.push({ x: pX - 2, y: pY, width: 4, height: 15, vx: 0, vy: -600, isPlayer: true, type: 'normal' });
    } 
    else if (this.player.weapon === WEAPON_TYPES.TRIPLE) {
      this.projectiles.push({ x: pX - 2, y: pY, width: 4, height: 15, vx: 0, vy: -600, isPlayer: true, type: 'normal' });
      this.projectiles.push({ x: pX - 2, y: pY, width: 4, height: 15, vx: -150, vy: -550, isPlayer: true, type: 'normal' });
      this.projectiles.push({ x: pX - 2, y: pY, width: 4, height: 15, vx: 150, vy: -550, isPlayer: true, type: 'normal' });
    }
    else if (this.player.weapon === WEAPON_TYPES.PLASMA) {
      this.projectiles.push({ x: pX - 10, y: pY - 20, width: 20, height: 20, vx: 0, vy: -400, isPlayer: true, type: 'plasma', pierceCount: 3 });
    }
    else if (this.player.weapon === WEAPON_TYPES.HOMING) {
      this.projectiles.push({ x: pX - 15, y: pY, width: 6, height: 12, vx: -200, vy: -300, isPlayer: true, type: 'homing', target: null });
      this.projectiles.push({ x: pX + 9, y: pY, width: 6, height: 12, vx: 200, vy: -300, isPlayer: true, type: 'homing', target: null });
    }
  }

  damagePlayer(amount) {
    if (this.player.invulnTimer > 0) return;

    if (this.player.shield > 0) {
      this.player.shield -= amount;
      if (this.player.shield < 0) {
        this.player.health += this.player.shield; // remaining damage to health
        this.player.shield = 0;
      }
    } else {
      this.player.health -= amount;
    }

    if (this.player.health <= 0) {
      this.createExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2, '#ef4444', 40);
      this.player.lives--;
      if (this.player.lives > 0) {
        // Respawn
        this.player.health = this.player.maxHealth;
        this.player.shield = 0;
        this.player.x = this.width / 2;
        this.player.y = this.height - 80;
        this.player.weapon = WEAPON_TYPES.SINGLE;
        this.player.fireRateMultiplier = 1;
        this.player.invulnTimer = 3000; // 3 sec invuln
      } else {
        this.stop();
      }
    } else {
      this.createExplosion(this.player.x + this.player.width/2, this.player.y, '#38bdf8', 10);
    }
  }

  update(dt) {
    if (!this.isPlaying) return;

    const dtS = dt / 1000; // dt in seconds
    this.timeSurvived += dt;
    this.difficultyMultiplier = 1 + (this.timeSurvived / 45000); // gets harder slower now

    // Timers
    if (this.player.invulnTimer > 0) this.player.invulnTimer -= dt;
    if (this.player.weaponTimer > 0) {
      this.player.weaponTimer -= dt;
      if (this.player.weaponTimer <= 0) {
        this.player.weapon = WEAPON_TYPES.SINGLE;
        this.player.fireRateMultiplier = 1;
      }
    }

    // Boss spawning logic
    this.bossTimer -= dt;
    if (this.bossTimer <= 0 && !this.bossActive && this.blackHoles.length === 0) {
      this.spawnBoss();
      this.bossTimer = 90000; // Next boss in 90s
    }

    // Player Input & Physics
    this.player.vx = 0;
    this.player.vy = 0;
    if (this.keys['ArrowLeft'] || this.keys['a']) this.player.vx = -this.player.speed;
    if (this.keys['ArrowRight'] || this.keys['d']) this.player.vx = this.player.speed;
    if (this.keys['ArrowUp'] || this.keys['w']) this.player.vy = -this.player.speed;
    if (this.keys['ArrowDown'] || this.keys['s']) this.player.vy = this.player.speed;

    // Black Hole Gravity
    let inBlackHole = false;
    this.blackHoles.forEach(bh => {
      const bhCx = bh.x;
      const bhCy = bh.y;
      const pCx = this.player.x + this.player.width / 2;
      const pCy = this.player.y + this.player.height / 2;
      const dx = bhCx - pCx;
      const dy = bhCy - pCy;
      const distSq = dx*dx + dy*dy;
      const dist = Math.sqrt(distSq);

      if (dist < 250) { // Gravity range
        const force = 100000 / (distSq + 100); // F = G*m/r^2 approximation
        this.player.vx += (dx / dist) * force;
        this.player.vy += (dy / dist) * force;
      }

      if (dist < bh.radius) {
        inBlackHole = true;
      }
    });

    if (inBlackHole) {
      this.damagePlayer(200 * dtS); // Massive DPS inside black hole
    }

    this.player.x += this.player.vx * dtS;
    this.player.y += this.player.vy * dtS;

    // Bounds
    this.player.x = Math.max(0, Math.min(this.player.x, this.width - this.player.width));
    this.player.y = Math.max(0, Math.min(this.player.y, this.height - this.player.height));

    // Player Shooting (Auto-fire if space held)
    this.player.shootTimer -= dt;
    if (this.keys[' '] && this.player.shootTimer <= 0) {
      this.playerShoot();
      this.player.shootTimer = this.player.baseCooldown / this.player.fireRateMultiplier;
    }

    // Spawners
    this.enemyTimer -= dt;
    if (this.enemyTimer <= 0 && !this.bossActive) {
      this.spawnEnemy();
      this.enemyTimer = Math.max(400, 2000 - (this.difficultyMultiplier * 200));
    }

    this.asteroidTimer -= dt;
    if (this.asteroidTimer <= 0 && !this.bossActive) {
      this.spawnAsteroid();
      this.asteroidTimer = Math.max(800, 3000 - (this.difficultyMultiplier * 300));
    }

    this.blackHoleTimer -= dt;
    if (this.blackHoleTimer <= 0 && !this.bossActive) {
      this.spawnBlackHole();
      this.blackHoleTimer = 35000 + Math.random() * 20000;
    }

    // Update Stars
    this.stars.forEach(s => {
      s.y += s.speed * (dt / 16) * this.difficultyMultiplier;
      if (s.y > this.height) {
        s.y = 0;
        s.x = Math.random() * this.width;
      }
    });

    // Update Black Holes
    this.blackHoles.forEach(bh => {
      bh.y += bh.vy * dtS;
      bh.rotation += 2 * dtS;
    });
    this.blackHoles = this.blackHoles.filter(bh => bh.y - bh.radius < this.height);

    // Update Powerups
    this.powerups.forEach(p => {
      p.y += p.vy * dtS;
      
      // Collision with player
      if (this.player.x < p.x + p.width && this.player.x + this.player.width > p.x && 
          this.player.y < p.y + p.height && this.player.y + this.player.height > p.y) {
        
        this.score += 50;
        this.createExplosion(p.x, p.y, '#facc15', 20);
        
        switch (p.type) {
          case 'health':
            this.player.health = Math.min(this.player.maxHealth, this.player.health + 50);
            break;
          case 'shield':
            this.player.shield = this.player.maxShield;
            break;
          case 'firerate':
            this.player.fireRateMultiplier = 2;
            this.player.weaponTimer = 15000;
            break;
          case 'triple':
            this.player.weapon = WEAPON_TYPES.TRIPLE;
            this.player.weaponTimer = 15000;
            break;
          case 'plasma':
            this.player.weapon = WEAPON_TYPES.PLASMA;
            this.player.weaponTimer = 15000;
            break;
          case 'homing':
            this.player.weapon = WEAPON_TYPES.HOMING;
            this.player.weaponTimer = 15000;
            break;
          case 'life':
            this.player.lives++;
            break;
        }
        p.collected = true;
      }
    });
    this.powerups = this.powerups.filter(p => !p.collected && p.y < this.height);

    // Update Projectiles
    this.projectiles.forEach(p => {
      if (p.type === 'homing') {
        // Find nearest enemy
        let nearestDist = Infinity;
        let target = null;
        this.enemies.forEach(e => {
          const dx = (e.x + e.width/2) - p.x;
          const dy = (e.y + e.height/2) - p.y;
          const dist = dx*dx + dy*dy;
          if (dist < nearestDist) {
            nearestDist = dist;
            target = e;
          }
        });
        if (target) {
          const dx = (target.x + target.width/2) - p.x;
          const dy = (target.y + target.height/2) - p.y;
          const angle = Math.atan2(dy, dx);
          // Gently steer
          p.vx += Math.cos(angle) * 800 * dtS;
          p.vy += Math.sin(angle) * 800 * dtS;
          
          // Cap speed
          const speed = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
          if (speed > 500) {
            p.vx = (p.vx / speed) * 500;
            p.vy = (p.vy / speed) * 500;
          }
        }
      }

      p.x += p.vx * dtS;
      p.y += p.vy * dtS;
    });
    this.projectiles = this.projectiles.filter(p => p.y > -50 && p.y < this.height + 50 && p.x > -50 && p.x < this.width + 50);

    // Update Enemies
    this.enemies.forEach(e => {
      if (e.type === 'small') {
        // Zig zag
        if (e.x <= 0 || e.x + e.width >= this.width) e.vx *= -1;
      } else if (e.type === 'boss') {
        // Boss movement
        if (e.y < 50) e.y += e.vy * dtS; // Move down into screen
        else {
          e.x += e.vx * dtS;
          if (e.x <= 50 || e.x + e.width >= this.width - 50) e.vx *= -1; // Bounce sides
        }

        // Boss attacks
        e.shootTimer -= dt;
        if (e.shootTimer <= 0) {
          if (e.attackPattern === 0) {
            // Circular spread
            for (let i = 0; i < 12; i++) {
              const angle = (i * Math.PI * 2) / 12;
              this.projectiles.push({
                x: e.x + e.width / 2,
                y: e.y + e.height,
                width: 6, height: 6,
                vx: Math.cos(angle) * 200,
                vy: Math.sin(angle) * 200 + 100, // Bias downwards
                isPlayer: false, type: 'normal'
              });
            }
            e.shootTimer = 2500;
            e.attackPattern = 1;
          } else {
            // Targeted spread
            const dx = (this.player.x + this.player.width/2) - (e.x + e.width/2);
            const dy = (this.player.y) - (e.y + e.height);
            const angle = Math.atan2(dy, dx);
            
            for (let i = -2; i <= 2; i++) {
              this.projectiles.push({
                x: e.x + e.width / 2,
                y: e.y + e.height,
                width: 6, height: 15,
                vx: Math.cos(angle + i*0.2) * 300,
                vy: Math.sin(angle + i*0.2) * 300,
                isPlayer: false, type: 'normal'
              });
            }
            e.shootTimer = 1500;
            e.attackPattern = 0;
          }
        }
      } else {
        // Medium
        e.shootTimer -= dt;
        if (e.shootTimer <= 0) {
          this.projectiles.push({
            x: e.x + e.width / 2 - 2,
            y: e.y + e.height,
            width: 4, height: 15,
            vx: 0, vy: 300,
            isPlayer: false, type: 'normal'
          });
          e.shootTimer = 1500 + Math.random() * 1000;
        }
      }

      e.x += e.vx * dtS;
      e.y += e.vy * dtS;
    });

    // Update Asteroids
    this.asteroids.forEach(a => {
      a.x += a.vx * dtS;
      a.y += a.vy * dtS;
      a.rotation += a.rotSpeed * dtS;
    });

    // Update Particles
    this.particles.forEach(p => {
      p.x += p.vx * dtS;
      p.y += p.vy * dtS;
      p.life -= dtS * 2;
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
          
          const dmg = p.type === 'plasma' ? 30 : 10;
          e.health -= dmg;
          
          this.createExplosion(p.x, p.y, p.type === 'plasma' ? '#a855f7' : '#38bdf8');
          
          if (e.health <= 0) {
            this.createExplosion(e.x + e.width/2, e.y + e.height/2, '#f97316', e.type === 'boss' ? 100 : 20);
            this.score += e.scoreVal;
            this.spawnPowerup(e.x + e.width/2, e.y + e.height/2);
            
            if (e.type === 'boss') this.bossActive = false;
            
            this.enemies.splice(j, 1);
          }
          
          hit = true;
          if (p.type === 'plasma') {
            p.pierceCount--;
            if (p.pierceCount <= 0) this.projectiles.splice(i, 1);
            hit = false; // Don't break loop if piercing
          }
          break; // Projectile hits one enemy per frame
        }
      }
      
      if (hit) {
        if (p.type !== 'plasma') this.projectiles.splice(i, 1);
        continue;
      }

      // vs Asteroids
      for (let j = this.asteroids.length - 1; j >= 0; j--) {
        let a = this.asteroids[j];
        if (p.x < a.x + a.width && p.x + p.width > a.x && p.y < a.y + a.height && p.y + p.height > a.y) {
          
          this.createExplosion(p.x, p.y, '#94a3b8');
          this.score += 10;
          this.asteroids.splice(j, 1);
          
          if (p.type !== 'plasma') this.projectiles.splice(i, 1);
          break;
        }
      }
    }

    // Enemy Projectiles vs Player
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      let p = this.projectiles[i];
      if (p.isPlayer) continue;
      
      if (p.x < this.player.x + this.player.width && p.x + p.width > this.player.x && 
          p.y < this.player.y + this.player.height && p.y + p.height > this.player.y) {
        
        this.damagePlayer(15);
        this.projectiles.splice(i, 1);
      }
    }

    // Player vs Enemies/Asteroids
    if (this.player.invulnTimer <= 0) {
      this.enemies.forEach((e, j) => {
        if (this.player.x < e.x + e.width && this.player.x + this.player.width > e.x && 
            this.player.y < e.y + e.height && this.player.y + this.player.height > e.y) {
          
          this.damagePlayer(e.type === 'boss' ? 50 : 20);
          if (e.type !== 'boss') {
            this.createExplosion(e.x + e.width/2, e.y + e.height/2, '#f97316');
            this.enemies.splice(j, 1);
          }
        }
      });

      this.asteroids.forEach((a, j) => {
        if (this.player.x < a.x + a.width && this.player.x + this.player.width > a.x && 
            this.player.y < a.y + a.height && this.player.y + this.player.height > a.y) {
          
          this.damagePlayer(30);
          this.createExplosion(a.x + a.width/2, a.y + a.height/2, '#94a3b8');
          this.asteroids.splice(j, 1);
        }
      });
    }

    // Cleanup offscreen
    this.enemies = this.enemies.filter(e => e.y < this.height + 100);
    this.asteroids = this.asteroids.filter(a => a.y < this.height + 100);
  }

  draw() {
    this.ctx.fillStyle = '#020617';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Stars
    this.stars.forEach(s => {
      this.ctx.fillStyle = s.color;
      this.ctx.globalAlpha = Math.random() * 0.5 + 0.5;
      this.ctx.fillRect(s.x, s.y, s.size, s.size);
    });
    this.ctx.globalAlpha = 1;

    if (!this.isPlaying && !this.isGameOver) return;

    // Black Holes
    this.blackHoles.forEach(bh => {
      this.ctx.save();
      this.ctx.translate(bh.x, bh.y);
      
      // Accretion disk
      const gradient = this.ctx.createRadialGradient(0, 0, bh.radius/2, 0, 0, bh.radius*1.5);
      gradient.addColorStop(0, 'rgba(0,0,0,1)');
      gradient.addColorStop(0.5, 'rgba(147,51,234,0.8)');
      gradient.addColorStop(1, 'rgba(147,51,234,0)');
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, bh.radius*1.5, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Event horizon
      this.ctx.fillStyle = '#000000';
      this.ctx.beginPath();
      this.ctx.arc(0, 0, bh.radius/2, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Swirls
      this.ctx.rotate(bh.rotation);
      this.ctx.strokeStyle = 'rgba(216,180,254,0.5)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, bh.radius, 0, Math.PI);
      this.ctx.stroke();
      
      this.ctx.restore();
    });

    // Particles
    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, Math.random() * 3 + 1, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1;

    // Powerups
    this.powerups.forEach(p => {
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.shadowBlur = 15;
      
      switch(p.type) {
        case 'health':
          this.ctx.fillStyle = '#22c55e';
          this.ctx.shadowColor = '#4ade80';
          this.ctx.fillRect(p.width/2 - 2, 0, 4, p.height);
          this.ctx.fillRect(0, p.height/2 - 2, p.width, 4);
          break;
        case 'shield':
          this.ctx.fillStyle = '#3b82f6';
          this.ctx.shadowColor = '#60a5fa';
          this.ctx.beginPath();
          this.ctx.arc(p.width/2, p.height/2, p.width/2, 0, Math.PI*2);
          this.ctx.fill();
          break;
        case 'firerate':
          this.ctx.fillStyle = '#eab308';
          this.ctx.shadowColor = '#fde047';
          this.ctx.beginPath();
          this.ctx.moveTo(p.width/2 + 5, 0);
          this.ctx.lineTo(0, p.height/2 + 2);
          this.ctx.lineTo(p.width/2 - 2, p.height/2 + 2);
          this.ctx.lineTo(p.width/2 - 5, p.height);
          this.ctx.lineTo(p.width, p.height/2 - 2);
          this.ctx.lineTo(p.width/2 + 2, p.height/2 - 2);
          this.ctx.closePath();
          this.ctx.fill();
          break;
        case 'triple':
        case 'plasma':
        case 'homing':
          this.ctx.fillStyle = '#a855f7';
          this.ctx.shadowColor = '#c084fc';
          this.ctx.font = '16px monospace';
          this.ctx.fillText('W', p.width/4, p.height*0.8);
          break;
        case 'life':
          this.ctx.fillStyle = '#ec4899';
          this.ctx.shadowColor = '#f472b6';
          this.ctx.beginPath();
          this.ctx.moveTo(p.width/2, p.height/2);
          this.ctx.lineTo(0, p.height);
          this.ctx.lineTo(p.width, p.height);
          this.ctx.fill();
          break;
      }
      this.ctx.restore();
    });

    // Projectiles
    this.projectiles.forEach(p => {
      if (p.type === 'plasma') {
        this.ctx.fillStyle = '#a855f7';
        this.ctx.shadowColor = '#c084fc';
        this.ctx.shadowBlur = 20;
        this.ctx.beginPath();
        this.ctx.arc(p.x + p.width/2, p.y + p.height/2, p.width/2, 0, Math.PI*2);
        this.ctx.fill();
      } else {
        this.ctx.fillStyle = p.isPlayer ? (p.type === 'homing' ? '#fbbf24' : '#38bdf8') : '#ef4444';
        this.ctx.shadowBlur = 12;
        this.ctx.shadowColor = p.isPlayer ? (p.type === 'homing' ? '#fde047' : '#0ea5e9') : '#dc2626';
        this.ctx.beginPath();
        this.ctx.roundRect ? this.ctx.roundRect(p.x, p.y, p.width, p.height, p.width/2) : this.ctx.fillRect(p.x, p.y, p.width, p.height);
        this.ctx.fill();
      }
      this.ctx.shadowBlur = 0;
    });

    // Enemies
    this.enemies.forEach(e => {
      this.ctx.save();
      this.ctx.translate(e.x + e.width / 2, e.y + e.height / 2);
      
      this.ctx.fillStyle = '#f43f5e';
      this.ctx.shadowBlur = 5;
      this.ctx.shadowColor = '#be123c';
      
      if (e.type === 'small') {
        // Dart shape
        this.ctx.beginPath();
        this.ctx.moveTo(0, e.height/2);
        this.ctx.lineTo(-e.width/2, -e.height/2);
        this.ctx.lineTo(0, -e.height/4);
        this.ctx.lineTo(e.width/2, -e.height/2);
        this.ctx.closePath();
        this.ctx.fill();
      } else if (e.type === 'boss') {
        // Big Boss Ship
        this.ctx.fillStyle = '#881337';
        this.ctx.fillRect(-e.width/2, -e.height/2, e.width, e.height/2);
        this.ctx.fillStyle = '#f43f5e';
        this.ctx.beginPath();
        this.ctx.moveTo(-e.width/2, 0);
        this.ctx.lineTo(-e.width/4, e.height/2);
        this.ctx.lineTo(e.width/4, e.height/2);
        this.ctx.lineTo(e.width/2, 0);
        this.ctx.fill();
        
        // Boss Eyes/Cores
        this.ctx.fillStyle = '#fde047';
        this.ctx.shadowBlur = 20;
        this.ctx.beginPath();
        this.ctx.arc(-e.width/4, 0, 10, 0, Math.PI*2);
        this.ctx.arc(e.width/4, 0, 10, 0, Math.PI*2);
        this.ctx.fill();
        
        // Health bar
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = '#ef4444';
        this.ctx.fillRect(-e.width/2, -e.height/2 - 10, e.width, 6);
        this.ctx.fillStyle = '#22c55e';
        this.ctx.fillRect(-e.width/2, -e.height/2 - 10, e.width * (e.health/e.maxHealth), 6);
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.strokeRect(-e.width/2, -e.height/2 - 10, e.width, 6);
      } else {
        // Swept forward wings (Medium)
        this.ctx.beginPath();
        this.ctx.moveTo(0, e.height / 2);
        this.ctx.lineTo(-e.width / 2, -e.height / 2);
        this.ctx.lineTo(-e.width / 4, -e.height / 4);
        this.ctx.lineTo(e.width / 4, -e.height / 4);
        this.ctx.lineTo(e.width / 2, -e.height / 2);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.fillStyle = '#fde047';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, Math.min(e.width, e.height)/6, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      this.ctx.restore();
    });

    // Asteroids
    this.ctx.fillStyle = '#64748b';
    this.ctx.strokeStyle = '#94a3b8';
    this.ctx.lineWidth = 1.5;
    this.asteroids.forEach(a => {
      this.ctx.save();
      this.ctx.translate(a.x + a.width/2, a.y + a.height/2);
      this.ctx.rotate(a.rotation);
      
      this.ctx.beginPath();
      const r = a.width / 2;
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const radiusOffset = (a.width + i) % 3 === 0 ? r * 0.8 : r;
        const x = Math.cos(angle) * radiusOffset;
        const y = Math.sin(angle) * radiusOffset;
        if (i === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      this.ctx.closePath();
      
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.restore();
    });

    // Player
    if (!this.isGameOver) {
      this.ctx.save();
      this.ctx.translate(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);

      if (this.player.invulnTimer <= 0 || Math.floor(this.player.invulnTimer / 100) % 2 === 0) {
        // Shield Bubble
        if (this.player.shield > 0) {
          this.ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
          this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.arc(0, 0, this.player.width, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.stroke();
        }

        // Engine trail
        this.ctx.fillStyle = '#f59e0b';
        this.ctx.globalAlpha = Math.random() * 0.5 + 0.5;
        this.ctx.beginPath();
        this.ctx.moveTo(-this.player.width / 4, this.player.height / 2);
        this.ctx.lineTo(this.player.width / 4, this.player.height / 2);
        this.ctx.lineTo(0, this.player.height / 2 + 15 + Math.random() * 15);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Thruster glow
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.beginPath();
        this.ctx.arc(0, this.player.height / 2 + 2, 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1;

        // Ship body
        this.ctx.fillStyle = '#0ea5e9';
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = '#38bdf8';
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, -this.player.height / 2); // Nose
        this.ctx.lineTo(-this.player.width / 2, this.player.height / 2); // Left wing
        this.ctx.lineTo(-this.player.width / 4, this.player.height / 4); // Left indent
        this.ctx.lineTo(this.player.width / 4, this.player.height / 4); // Right indent
        this.ctx.lineTo(this.player.width / 2, this.player.height / 2); // Right wing
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;

        // Cockpit
        this.ctx.fillStyle = '#e0f2fe';
        this.ctx.beginPath();
        this.ctx.ellipse(0, -this.player.height / 6, 4, 8, 0, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();

      // Health Bar
      this.ctx.fillStyle = '#ef4444';
      this.ctx.fillRect(this.player.x, this.player.y - 12, this.player.width, 4);
      this.ctx.fillStyle = '#22c55e';
      this.ctx.fillRect(this.player.x, this.player.y - 12, this.player.width * (this.player.health / this.player.maxHealth), 4);
      this.ctx.strokeStyle = '#ffffff20';
      this.ctx.strokeRect(this.player.x, this.player.y - 12, this.player.width, 4);
      
      // Shield Bar
      if (this.player.shield > 0) {
        this.ctx.fillStyle = '#38bdf8';
        this.ctx.fillRect(this.player.x, this.player.y - 18, this.player.width * (this.player.shield / this.player.maxShield), 4);
      }
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
        lives: this.player ? this.player.lives : 0,
        shield: this.player ? this.player.shield : 0,
        weapon: this.player ? this.player.weapon : 'single',
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
    lives: 3,
    shield: 0,
    weapon: 'single',
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
          if (prev.score !== state.score || prev.isGameOver !== state.isGameOver || prev.isPlaying !== state.isPlaying || prev.lives !== state.lives || prev.shield !== state.shield || prev.weapon !== state.weapon) {
            return state;
          }
          return prev;
        });
      };
      engineRef.current.draw();
    }

    const handleKeyDown = (e) => {
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
            className="relative bg-secondary/90 border border-accent/20 p-4 sm:p-6 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col items-center max-w-[100vw] h-[95vh] sm:h-auto"
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

            {/* HUD */}
            <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 w-full justify-center font-mono text-xs sm:text-sm">
              <div className="flex items-center gap-2 bg-primary/40 px-3 py-1.5 rounded border border-white/5">
                <span className="text-text-muted">Score:</span>
                <span className="text-accent font-bold">{gameState.score}</span>
              </div>
              <div className="flex items-center gap-2 bg-primary/40 px-3 py-1.5 rounded border border-white/5">
                <Trophy size={14} className="text-text-muted" />
                <span className="text-text font-bold">{highScore}</span>
              </div>
              {gameState.isPlaying && (
                <>
                  <div className="flex items-center gap-2 bg-primary/40 px-3 py-1.5 rounded border border-white/5">
                    <Heart size={14} className="text-red-400" />
                    <span className="text-white font-bold">x {gameState.lives}</span>
                  </div>
                  {gameState.shield > 0 && (
                    <div className="flex items-center gap-2 bg-primary/40 px-3 py-1.5 rounded border border-white/5">
                      <ShieldIcon size={14} className="text-blue-400" />
                      <span className="text-white font-bold">{Math.ceil(gameState.shield)}%</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-primary/40 px-3 py-1.5 rounded border border-white/5">
                    <span className="text-text-muted">WPN:</span>
                    <span className="text-purple-400 font-bold uppercase">{gameState.weapon}</span>
                  </div>
                </>
              )}
            </div>

            <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-inner bg-primary">
              <canvas 
                ref={canvasRef}
                width={GAME_WIDTH}
                height={GAME_HEIGHT}
                className="max-w-full h-auto max-h-[65vh] object-contain block"
              />

              {!gameState.isPlaying && !gameState.isGameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20">
                  <Rocket className="text-accent mb-4 animate-bounce" size={48} />
                  <button
                    onClick={startGame}
                    className="px-8 py-3 bg-accent text-primary font-bold rounded-full hover:bg-accent/90 transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(56,189,248,0.4)] mb-4"
                  >
                    Launch Mission
                  </button>
                  <div className="text-text-muted text-xs font-mono text-center space-y-1">
                    <p>WASD / Arrows to Move</p>
                    <p>Hold SPACE to Auto-Fire</p>
                    <p className="mt-2 text-accent/80">Collect powerups & survive bosses!</p>
                  </div>
                </div>
              )}

              {gameState.isGameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-20">
                  <div className="bg-red-500/20 p-4 rounded-full mb-4">
                    <TriangleAlert className="text-red-400" size={40} />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2 font-mono">Mission Failed</h4>
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
            
            <p className="text-text-muted text-[10px] mt-4 font-mono opacity-60 text-center max-w-[300px]">
              Keyboard required. Mobile controls disabled.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GalacticDefender;
