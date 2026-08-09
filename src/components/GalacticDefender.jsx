import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Rocket, RefreshCw, TriangleAlert, Heart, Shield as ShieldIcon, Coins, Zap, ShieldPlus, ChevronRight, Medal } from 'lucide-react';
import { useAchievements } from '../context/AchievementsContext';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';

const GAME_WIDTH = 500;
const GAME_HEIGHT = 700;

const WEAPON_TYPES = {
  SINGLE: 'single',
  TRIPLE: 'triple',
  PLASMA: 'plasma',
  HOMING: 'homing'
};

const POWERUP_TYPES = ['health', 'shield', 'firerate', 'triple', 'plasma', 'homing', 'life', 'nuke', 'emp', 'freeze'];

class GameEngine {
  constructor(canvas, saveData, onAchievement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = GAME_WIDTH;
    this.height = GAME_HEIGHT;
    this.lastTime = 0;
    this.score = 0;
    this.isPlaying = false;
    this.isGameOver = false;
    this.keys = {};
    this.saveData = saveData;
    this.onAchievement = onAchievement;
    
    // Entities
    this.player = null;
    this.projectiles = [];
    this.enemies = [];
    this.asteroids = [];
    this.particles = [];
    this.stars = [];
    this.powerups = [];
    this.blackHoles = [];
    
    // Level & Boss System
    this.level = 1;
    this.inventory = { nuke: 0, emp: 0, freeze: 0 };
    this.empTimer = 0;
    this.freezeTimer = 0;
    this.currentBoss = null;

    // Spawners & Timers
    this.enemyTimer = 0;
    this.asteroidTimer = 0;
    this.blackHoleTimer = 20000;
    this.difficultyMultiplier = 1;
    this.timeSurvived = 0;
    this.bossActive = false;
    this.bossState = 'normal'; // 'normal' | 'warning' | 'active'
    this.bossWarningTimer = 0;
    this.timeInLevel = 0;

    // Session stats for achievements
    this.sessionStats = {
      enemiesKilled: 0,
      asteroidsDestroyed: 0,
      bossesDefeated: 0,
      survivorUnlocked: false
    };

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
    this.level = 1;
    this.inventory = { nuke: 0, emp: 0, freeze: 0 };
    this.empTimer = 0;
    this.freezeTimer = 0;
    this.currentBoss = null;
    this.bossState = 'normal';
    this.bossWarningTimer = 0;
    this.timeInLevel = 0;

    this.projectiles = [];
    this.enemies = [];
    this.asteroids = [];
    this.particles = [];
    this.powerups = [];
    this.blackHoles = [];
    this.sessionStats = { enemiesKilled: 0, asteroidsDestroyed: 0, bossesDefeated: 0, survivorUnlocked: false };
    
    this.enemyTimer = 0;
    this.asteroidTimer = 0;
    this.blackHoleTimer = 20000;
    
    // Apply Upgrades
    const maxHealth = 100 + (this.saveData.upgrades.health * 50);
    const maxShield = (this.saveData.upgrades.shield * 50);
    const speed = 350 + (this.saveData.upgrades.speed * 30);
    
    this.player = {
      x: this.width / 2,
      y: this.height - 80,
      width: 30,
      height: 40,
      vx: 0,
      vy: 0,
      speed: speed,
      health: maxHealth,
      maxHealth: maxHealth,
      shield: maxShield,
      maxShield: maxShield,
      lives: 3,
      shootTimer: 0,
      baseCooldown: 200,
      fireRateMultiplier: 1,
      weapon: WEAPON_TYPES.SINGLE,
      weaponTimer: 0,
      invulnTimer: 0,
      damageMultiplier: 1 + (this.saveData.upgrades.weapon * 0.25) // +25% dmg per level
    };

    this.lastTime = null; // Let the loop initialize it precisely
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(this.loop);
    this.onStateUpdateInner();
  }

  stop() {
    this.isPlaying = false;
    this.isGameOver = true;
    this.onStateUpdateInner();
  }

  handleInput(e, isDown) {
    this.keys[e.key] = isDown;
    if (isDown && this.isPlaying && !this.isGameOver) {
      if (e.key === '1' && this.inventory.nuke > 0) this.triggerNuke();
      if (e.key === '2' && this.inventory.emp > 0) this.triggerEmp();
      if (e.key === '3' && this.inventory.freeze > 0) this.triggerFreeze();
    }
  }

  triggerNuke() {
    this.inventory.nuke--;
    this.createExplosion(this.width/2, this.height/2, '#ffffff', 200);
    
    this.enemies.forEach(e => {
       if (e.type !== 'boss') {
           this.createExplosion(e.x + e.width/2, e.y + e.height/2, '#f97316', 20);
           this.score += e.scoreVal || 10;
       }
    });
    this.enemies = this.enemies.filter(e => e.type === 'boss');
    
    this.asteroids.forEach(a => {
       this.createExplosion(a.x + a.width/2, a.y + a.height/2, '#94a3b8');
       this.score += 10;
    });
    this.asteroids = [];
    this.projectiles = this.projectiles.filter(p => p.isPlayer);
    
    if (this.currentBoss) {
      this.currentBoss.health -= (this.currentBoss.maxHealth * 0.5);
      if (this.currentBoss.health <= 0) {
        this.killBoss(this.currentBoss);
      } else {
        this.updateBossPhase(this.currentBoss);
      }
    }
    this.onStateUpdateInner();
  }

  triggerEmp() {
    this.inventory.emp--;
    this.empTimer = 8000;
    for(let i=0; i<30; i++) this.createExplosion(this.width*Math.random(), this.height*Math.random(), '#3b82f6', 5);
    this.onStateUpdateInner();
  }

  triggerFreeze() {
    this.inventory.freeze--;
    this.freezeTimer = 5000;
    for(let i=0; i<30; i++) this.createExplosion(this.width*Math.random(), this.height*Math.random(), '#a855f7', 5);
    this.onStateUpdateInner();
  }

  spawnEnemy() {
    const isSmall = Math.random() > 0.6;
    if (isSmall) {
      this.enemies.push({
        type: 'small', x: Math.random() * (this.width - 20), y: -30, width: 20, height: 20,
        vx: (Math.random() - 0.5) * 200, vy: 200 * this.difficultyMultiplier,
        health: 10 * this.difficultyMultiplier, maxHealth: 10 * this.difficultyMultiplier,
        shootTimer: 99999, scoreVal: 15
      });
    } else {
      this.enemies.push({
        type: 'medium', x: Math.random() * (this.width - 30), y: -40, width: 30, height: 35,
        vx: 0, vy: 100 * this.difficultyMultiplier,
        health: 25 * this.difficultyMultiplier, maxHealth: 25 * this.difficultyMultiplier,
        shootTimer: Math.random() * 2000, scoreVal: 25
      });
    }
  }

  spawnBossForLevel() {
    this.bossActive = true;
    const isFinal = this.level >= 4;
    const maxHealth = isFinal ? 3000 : 500 + (this.level * 400);
    
    this.currentBoss = {
      type: 'boss', x: this.width / 2 - 60, y: -150, width: 120, height: 80,
      vx: 60 + (this.level * 15), vy: 30,
      health: maxHealth, maxHealth: maxHealth,
      shootTimer: 1000, specialTimer: 3000, homingTimer: 10000, powerupTimer: 5000 + Math.random() * 7000, moveTimer: 0,
      attackPattern: 0, scoreVal: 500 * this.level,
      phase: 1,
      name: isFinal ? "THE VOID EMPEROR" : `LEVEL ${this.level} BOSS`
    };
    this.enemies.push(this.currentBoss);
    this.onStateUpdateInner();
  }

  updateBossPhase(boss) {
      const healthPct = boss.health / boss.maxHealth;
      let newPhase = 1;
      if (healthPct <= 0.4) newPhase = 3;
      else if (healthPct <= 0.7) newPhase = 2;
      
      if (newPhase > boss.phase) {
          boss.phase = newPhase;
          boss.vx = boss.vx > 0 ? boss.vx + 40 : boss.vx - 40;
      }
  }

  killBoss(boss) {
    this.bossActive = false;
    this.bossState = 'normal';
    this.timeInLevel = 0;
    this.sessionStats.bossesDefeated++;
    if (this.sessionStats.bossesDefeated === 1) this.onAchievement('galactic-boss-slayer');
    
    for(let i=0; i<30; i++) {
       this.createExplosion(boss.x + boss.width*Math.random(), boss.y + boss.height*Math.random(), '#f97316');
    }
    this.createExplosion(boss.x + boss.width/2, boss.y + boss.height/2, '#f97316', 150);
    
    for(let i=-1; i<=1; i++) {
        this.spawnPowerup(boss.x + boss.width/2 + (i*40), boss.y + boss.height/2, true);
    }
    
    this.score += boss.scoreVal;
    boss.dead = true;
    this.currentBoss = null;

    if (this.level >= 4) {
       this.onAchievement('galactic-champion');
       setTimeout(() => this.stop(), 2000);
    } else {
       this.level++;
       this.player.health = this.player.maxHealth;
       this.player.shield = this.player.maxShield;
    }
    this.onStateUpdateInner();
  }

  spawnAsteroid() {
    if (this.bossState !== 'normal') return;
    this.asteroids.push({
      x: Math.random() * (this.width - 40), y: -50, width: 40 + Math.random() * 20, height: 40 + Math.random() * 20,
      vx: (Math.random() - 0.5) * 50, vy: (100 + Math.random() * 100) * this.difficultyMultiplier,
      rotation: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 3
    });
  }

  spawnBlackHole() {
    if (this.bossActive) return;
    this.blackHoles.push({
      x: Math.random() * (this.width - 100) + 50, y: -100, radius: 40, vy: 30, rotation: 0
    });
  }

  spawnPowerup(x, y, forceSpecial = false) {
    if (!forceSpecial && Math.random() > 0.15 && !this.bossActive) return;
    let type;
    const rand = Math.random();
    if (rand < 0.02) type = 'freeze';
    else if (rand < 0.05) type = 'nuke';
    else if (rand < 0.08) type = 'emp';
    else {
      type = POWERUP_TYPES[Math.floor(Math.random() * 7)];
    }
    this.powerups.push({ x, y, width: 20, height: 20, type, vy: 50 });
  }

  createExplosion(x, y, color, size = 15) {
    for (let i = 0; i < size; i++) {
      this.particles.push({
        x, y, vx: (Math.random() - 0.5) * (size * 10), vy: (Math.random() - 0.5) * (size * 10), life: 1, color
      });
    }
  }

  playerShoot() {
    const pX = this.player.x + this.player.width / 2;
    const pY = this.player.y;
    const dmgMulti = this.player.damageMultiplier;

    if (this.player.weapon === WEAPON_TYPES.SINGLE) {
      this.projectiles.push({ x: pX - 2, y: pY, width: 4, height: 15, vx: 0, vy: -600, isPlayer: true, type: 'normal', dmg: 10 * dmgMulti });
    } 
    else if (this.player.weapon === WEAPON_TYPES.TRIPLE) {
      this.projectiles.push({ x: pX - 2, y: pY, width: 4, height: 15, vx: 0, vy: -600, isPlayer: true, type: 'normal', dmg: 10 * dmgMulti });
      this.projectiles.push({ x: pX - 2, y: pY, width: 4, height: 15, vx: -150, vy: -550, isPlayer: true, type: 'normal', dmg: 10 * dmgMulti });
      this.projectiles.push({ x: pX - 2, y: pY, width: 4, height: 15, vx: 150, vy: -550, isPlayer: true, type: 'normal', dmg: 10 * dmgMulti });
    }
    else if (this.player.weapon === WEAPON_TYPES.PLASMA) {
      this.projectiles.push({ x: pX - 10, y: pY - 20, width: 20, height: 20, vx: 0, vy: -400, isPlayer: true, type: 'plasma', pierceCount: 3, dmg: 30 * dmgMulti });
    }
    else if (this.player.weapon === WEAPON_TYPES.HOMING) {
      this.projectiles.push({ x: pX - 15, y: pY, width: 6, height: 12, vx: -200, vy: -300, isPlayer: true, type: 'homing', dmg: 15 * dmgMulti });
      this.projectiles.push({ x: pX + 9, y: pY, width: 6, height: 12, vx: 200, vy: -300, isPlayer: true, type: 'homing', dmg: 15 * dmgMulti });
    }
  }

  damagePlayer(amount) {
    if (this.player.invulnTimer > 0) return;

    if (this.player.shield > 0) {
      this.player.shield -= amount;
      if (this.player.shield < 0) {
        this.player.health += this.player.shield;
        this.player.shield = 0;
      }
    } else {
      this.player.health -= amount;
    }

    if (this.player.health <= 0) {
      this.createExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2, '#ef4444', 40);
      this.player.lives--;
      if (this.player.lives > 0) {
        this.player.health = this.player.maxHealth;
        this.player.shield = this.player.maxShield; // Reset shield on death if they have it
        this.player.x = this.width / 2;
        this.player.y = this.height - 80;
        this.player.weapon = WEAPON_TYPES.SINGLE;
        this.player.fireRateMultiplier = 1;
        this.player.invulnTimer = 3000;
        this.onStateUpdateInner();
      } else {
        this.stop();
      }
    } else {
      this.createExplosion(this.player.x + this.player.width/2, this.player.y, '#38bdf8', 10);
      this.onStateUpdateInner();
    }
  }

  update(dt) {
    if (!this.isPlaying || this.isGameOver) return;

    if (this.bossState === 'normal') {
       this.timeInLevel += dt;
       const threshold = 15000 + (this.level * 10000);
       if (this.timeInLevel >= threshold) {
          this.bossState = 'warning';
          this.bossWarningTimer = 3000;
       }
    } else if (this.bossState === 'warning') {
       this.bossWarningTimer -= dt;
       if (this.bossWarningTimer <= 0) {
          this.bossState = 'active';
          this.spawnBossForLevel();
       }
    }

    const dtS = dt / 1000;
    this.timeSurvived += dt;
    this.difficultyMultiplier = 1 + (this.timeSurvived / 45000);

    if (this.timeSurvived >= 60000 && !this.sessionStats.survivorUnlocked) {
      this.sessionStats.survivorUnlocked = true;
      this.onAchievement('galactic-survivor');
    }

    if (this.freezeTimer > 0) {
        this.freezeTimer -= dt;
        if (this.freezeTimer <= 0) this.onStateUpdateInner();
    }
    if (this.empTimer > 0) {
        this.empTimer -= dt;
        if (this.empTimer <= 0) this.onStateUpdateInner();
    }

    if (this.player.invulnTimer > 0) this.player.invulnTimer -= dt;
    if (this.player.weaponTimer > 0) {
      this.player.weaponTimer -= dt;
      if (this.player.weaponTimer <= 0) {
        this.player.weapon = WEAPON_TYPES.SINGLE;
        this.player.fireRateMultiplier = 1;
        this.onStateUpdateInner();
      }
    }

    this.player.vx = 0;
    this.player.vy = 0;
    if (this.keys['ArrowLeft'] || this.keys['a']) this.player.vx = -this.player.speed;
    if (this.keys['ArrowRight'] || this.keys['d']) this.player.vx = this.player.speed;
    if (this.keys['ArrowUp'] || this.keys['w']) this.player.vy = -this.player.speed;
    if (this.keys['ArrowDown'] || this.keys['s']) this.player.vy = this.player.speed;

    let inBlackHole = false;
    this.blackHoles.forEach(bh => {
      const pCx = this.player.x + this.player.width / 2;
      const pCy = this.player.y + this.player.height / 2;
      const dx = bh.x - pCx;
      const dy = bh.y - pCy;
      const distSq = dx*dx + dy*dy;
      const dist = Math.sqrt(distSq);

      if (dist < 250) {
        const force = 100000 / (distSq + 100);
        this.player.vx += (dx / dist) * force;
        this.player.vy += (dy / dist) * force;
      }
      if (dist < bh.radius) inBlackHole = true;
    });

    if (inBlackHole) this.damagePlayer(200 * dtS);

    this.player.x += this.player.vx * dtS;
    this.player.y += this.player.vy * dtS;
    this.player.x = Math.max(0, Math.min(this.player.x, this.width - this.player.width));
    this.player.y = Math.max(0, Math.min(this.player.y, this.height - this.player.height));

    this.player.shootTimer -= dt;
    if (this.keys[' '] && this.player.shootTimer <= 0) {
      this.playerShoot();
      this.player.shootTimer = this.player.baseCooldown / this.player.fireRateMultiplier;
    }



    this.stars.forEach(s => {
      s.y += s.speed * (dt / 16) * this.difficultyMultiplier;
      if (s.y > this.height) { s.y = 0; s.x = Math.random() * this.width; }
    });

    this.blackHoles.forEach(bh => {
      bh.y += bh.vy * dtS;
      bh.rotation += 2 * dtS;
    });
    this.blackHoles = this.blackHoles.filter(bh => bh.y - bh.radius < this.height);

    let inventoryChanged = false;

    this.powerups.forEach(p => {
      p.y += p.vy * dtS;
      if (this.player.x < p.x + p.width && this.player.x + this.player.width > p.x && 
          this.player.y < p.y + p.height && this.player.y + this.player.height > p.y) {
        
        this.score += 50;
        this.createExplosion(p.x, p.y, '#facc15', 20);
        
        switch (p.type) {
          case 'health': this.player.health = Math.min(this.player.maxHealth, this.player.health + 50); break;
          case 'shield': this.player.shield = this.player.maxShield || 50; break; // give at least 50 if 0 upgrades
          case 'firerate': this.player.fireRateMultiplier = 2; this.player.weaponTimer = 15000; break;
          case 'triple': this.player.weapon = WEAPON_TYPES.TRIPLE; this.player.weaponTimer = 15000; break;
          case 'plasma': this.player.weapon = WEAPON_TYPES.PLASMA; this.player.weaponTimer = 15000; break;
          case 'homing': this.player.weapon = WEAPON_TYPES.HOMING; this.player.weaponTimer = 15000; break;
          case 'life': this.player.lives++; break;
          case 'nuke': this.inventory.nuke++; inventoryChanged = true; break;
          case 'emp': this.inventory.emp++; inventoryChanged = true; break;
          case 'freeze': this.inventory.freeze++; inventoryChanged = true; break;
        }
        p.collected = true;
        this.onStateUpdateInner();
      }
    });
    this.powerups = this.powerups.filter(p => !p.collected && p.y < this.height);

    if (inventoryChanged) this.onStateUpdateInner();

    // Temporal Freeze logic - skip enemy/projectile updates
    if (this.freezeTimer > 0) {
       this.updateProjectiles(dtS, dt, true);
       return;
    }

    this.enemyTimer -= dt;
    if (this.enemyTimer <= 0 && this.bossState === 'normal') {
      this.spawnEnemy();
      this.enemyTimer = Math.max(400, 2000 - (this.difficultyMultiplier * 200));
    }

    this.asteroidTimer -= dt;
    if (this.asteroidTimer <= 0 && this.bossState === 'normal') {
      this.spawnAsteroid();
      this.asteroidTimer = Math.max(800, 3000 - (this.difficultyMultiplier * 300));
    }

    this.blackHoleTimer -= dt;
    if (this.blackHoleTimer <= 0 && !this.bossActive) {
      this.spawnBlackHole();
      this.blackHoleTimer = 35000 + Math.random() * 20000;
    }

    this.blackHoles.forEach(bh => {
      bh.y += bh.vy * dtS;
      bh.rotation += 2 * dtS;
    });
    this.blackHoles = this.blackHoles.filter(bh => bh.y - bh.radius < this.height);

    this.updateProjectiles(dtS, dt, false);
    this.updateEnemies(dtS, dt);

    this.asteroids.forEach(a => {
      a.x += a.vx * dtS;
      a.y += a.vy * dtS;
      a.rotation += a.rotSpeed * dtS;
    });
    
    if (this.player.invulnTimer <= 0) {
      this.enemies.forEach(e => {
        if (this.player.x < e.x + e.width && this.player.x + this.player.width > e.x && 
            this.player.y < e.y + e.height && this.player.y + this.player.height > e.y) {
          this.damagePlayer(e.type === 'boss' ? 50 : 20);
          if (e.type !== 'boss') {
            this.createExplosion(e.x + e.width/2, e.y + e.height/2, '#f97316');
            e.dead = true;
          }
        }
      });
      this.enemies = this.enemies.filter(e => !e.dead);

      this.asteroids.forEach(a => {
        if (this.player.x < a.x + a.width && this.player.x + this.player.width > a.x && 
            this.player.y < a.y + a.height && this.player.y + this.player.height > a.y) {
          this.damagePlayer(30);
          this.createExplosion(a.x + a.width/2, a.y + a.height/2, '#94a3b8');
          a.dead = true;
        }
      });
      this.asteroids = this.asteroids.filter(a => !a.dead);
    }

    this.enemies = this.enemies.filter(e => e.y < this.height + 100);
    this.asteroids = this.asteroids.filter(a => a.y < this.height + 100);

    this.particles.forEach(p => {
      p.x += p.vx * dtS;
      p.y += p.vy * dtS;
      p.life -= dtS * 1.5;
    });
    this.particles = this.particles.filter(p => p.life > 0);
  }

  updateProjectiles(dtS, dt, playerOnly) {
    this.projectiles.forEach(p => {
      if (playerOnly && !p.isPlayer) return;
      if (this.empTimer > 0 && !p.isPlayer) return;

      if (p.type === 'homing') {
        let nearestDist = Infinity;
        let target = null;
        
        const checkTarget = (t) => {
          const dx = (t.x + t.width/2) - p.x;
          const dy = (t.y + t.height/2) - p.y;
          const dist = dx*dx + dy*dy;
          if (dist < nearestDist && t.y > -50 && t.y < this.height) { 
            nearestDist = dist; target = t; 
          }
        };

        if (p.isPlayer) {
            this.enemies.forEach(checkTarget);
            this.asteroids.forEach(checkTarget);
        } else {
            checkTarget(this.player);
        }

        if (target) {
          const dx = (target.x + target.width/2) - p.x;
          const dy = (target.y + target.height/2) - p.y;
          const angle = Math.atan2(dy, dx);
          const speed = 600;
          const desiredVx = Math.cos(angle) * speed;
          const desiredVy = Math.sin(angle) * speed;
          p.vx += (desiredVx - p.vx) * 8 * dtS;
          p.vy += (desiredVy - p.vy) * 8 * dtS;
        }
      }
      p.x += p.vx * dtS;
      p.y += p.vy * dtS;
    });

    this.projectiles = this.projectiles.filter(p => p.y > -50 && p.y < this.height + 50 && p.x > -50 && p.x < this.width + 50);

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      let p = this.projectiles[i];
      if (!p.isPlayer) continue;
      let hit = false;
      
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        let e = this.enemies[j];
        if (e.dead) continue;
        if (p.x < e.x + e.width && p.x + p.width > e.x && p.y < e.y + e.height && p.y + p.height > e.y) {
          e.health -= p.dmg;
          this.createExplosion(p.x, p.y, p.type === 'plasma' ? '#a855f7' : '#38bdf8');
          
          if (e.type === 'boss') this.updateBossPhase(e);

          if (e.health <= 0) {
            if (e.type === 'boss') {
              this.killBoss(e);
            } else {
              this.createExplosion(e.x + e.width/2, e.y + e.height/2, '#f97316', 20);
              this.score += e.scoreVal;
              if (Math.random() < 0.1) this.spawnPowerup(e.x + e.width/2, e.y + e.height/2);
              
              this.sessionStats.enemiesKilled++;
              if (this.sessionStats.enemiesKilled === 1) this.onAchievement('galactic-first-blood');
              e.dead = true;
            }
          }
          hit = true;
          if (p.type === 'plasma') {
            p.pierceCount--;
            if (p.pierceCount <= 0) {
               this.projectiles[i] = this.projectiles[this.projectiles.length - 1];
               this.projectiles.pop();
            }
            hit = false;
          }
          break;
        }
      }
      
      if (hit) { 
        if (p.type !== 'plasma') {
           this.projectiles[i] = this.projectiles[this.projectiles.length - 1];
           this.projectiles.pop();
        }
        continue; 
      }

      for (let j = this.asteroids.length - 1; j >= 0; j--) {
        let a = this.asteroids[j];
        if (a.dead) continue;
        if (p.x < a.x + a.width && p.x + p.width > a.x && p.y < a.y + a.height && p.y + p.height > a.y) {
          this.createExplosion(p.x, p.y, '#94a3b8');
          this.score += 10;
          a.dead = true;
          
          this.sessionStats.asteroidsDestroyed++;
          if (this.sessionStats.asteroidsDestroyed === 1) this.onAchievement('galactic-asteroid-destroyer');

          if (p.type !== 'plasma') {
             this.projectiles[i] = this.projectiles[this.projectiles.length - 1];
             this.projectiles.pop();
          }
          break;
        }
      }
    }

    // Single cleanup pass using swap-and-pop
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      if (this.enemies[i].dead) {
        this.enemies[i] = this.enemies[this.enemies.length - 1];
        this.enemies.pop();
      }
    }
    for (let i = this.asteroids.length - 1; i >= 0; i--) {
      if (this.asteroids[i].dead) {
        this.asteroids[i] = this.asteroids[this.asteroids.length - 1];
        this.asteroids.pop();
      }
    }

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      let p = this.projectiles[i];
      if (p.isPlayer) continue;
      if (p.x < this.player.x + this.player.width && p.x + p.width > this.player.x && 
          p.y < this.player.y + this.player.height && p.y + p.height > this.player.y) {
        this.damagePlayer(15);
        this.projectiles[i] = this.projectiles[this.projectiles.length - 1];
        this.projectiles.pop();
      }
    }
  }

  updateEnemies(dtS, dt) {
    this.enemies.forEach(e => {
      if (this.empTimer > 0 && e.type === 'drone') return;

      if (e.type === 'small') {
        if (e.x <= 0 || e.x + e.width >= this.width) e.vx *= -1;
      } else if (e.type === 'boss') {
        if (e.y < 20 && e.targetX === undefined) {
             e.y += 100 * dtS; // Slide in smoothly
        } else {
             e.moveTimer -= dt;
             if (e.targetX === undefined || e.moveTimer <= 0) {
                e.targetX = 20 + Math.random() * (this.width - 40 - e.width);
                e.targetY = 20 + Math.random() * (this.height * 0.4);
                e.moveTimer = 3000 + Math.random() * 3000;
             }

             const dx = e.targetX - e.x;
             const dy = e.targetY - e.y;
             const dist = Math.sqrt(dx*dx + dy*dy) || 1;

             const speed = e.phase === 3 ? 150 : 80 + (this.level * 15);
             const desiredVx = (dx / dist) * speed;
             const desiredVy = (dy / dist) * speed;
             
             e.vx += (desiredVx - e.vx) * 3 * dtS;
             e.vy += (desiredVy - e.vy) * 3 * dtS;
             
             e.x += e.vx * dtS;
             e.y += e.vy * dtS;

             if (e.x < 0) { e.x = 0; e.vx *= -0.5; }
             if (e.x + e.width > this.width) { e.x = this.width - e.width; e.vx *= -0.5; }
             if (e.y < 0) { e.y = 0; e.vy *= -0.5; }
             if (e.y > this.height * 0.5) { e.y = this.height * 0.5; e.vy *= -0.5; }
        }
        
        e.powerupTimer -= dt;
        if (e.powerupTimer <= 0) {
           e.powerupTimer = 5000 + Math.random() * 7000;
           this.spawnPowerup(e.x + e.width/2, e.y + e.height/2, false);
        }
        
        if (this.empTimer > 0) return;

        e.shootTimer -= dt;
        if (e.shootTimer <= 0) {
          const shootDelay = e.phase === 3 ? 800 : (e.phase === 2 ? 1500 : 2500);
          
          if (e.attackPattern === 0) {
            const count = e.phase >= 2 ? 16 : 12;
            for (let i = 0; i < count; i++) {
              const angle = (i * Math.PI * 2) / count;
              this.projectiles.push({
                x: e.x + e.width / 2, y: e.y + e.height, width: 6, height: 6,
                vx: Math.cos(angle) * 200, vy: Math.sin(angle) * 200 + 100, isPlayer: false, type: 'normal'
              });
            }
            e.attackPattern = 1;
          } else {
            const dx = (this.player.x + this.player.width/2) - (e.x + e.width/2);
            const dy = (this.player.y) - (e.y + e.height);
            const angle = Math.atan2(dy, dx);
            const spread = e.phase === 3 ? 3 : 2;
            for (let i = -spread; i <= spread; i++) {
              this.projectiles.push({
                x: e.x + e.width / 2, y: e.y + e.height, width: 6, height: 15,
                vx: Math.cos(angle + i*0.15) * 300, vy: Math.sin(angle + i*0.15) * 300, isPlayer: false, type: 'normal'
              });
            }
            e.attackPattern = 0;
          }
          e.shootTimer = shootDelay;
        }

        e.specialTimer -= dt;
        if (e.specialTimer <= 0) {
           e.specialTimer = e.phase === 3 ? 3000 : 5000;
           
           if (this.level === 1 || this.level >= 4) {
              for(let i=0; i<3; i++) {
                 this.asteroids.push({
                    x: e.x + (i*40), y: e.y + e.height, width: 30, height: 30,
                    vx: (Math.random() - 0.5) * 100, vy: 200,
                    rotation: 0, rotSpeed: 1
                 });
              }
           }
           if (this.level === 2 || this.level >= 4) {
              this.enemies.push({
                  type: 'drone', x: e.x - 20, y: e.y + e.height, width: 15, height: 15,
                  vx: (Math.random() - 0.5) * 300, vy: 150,
                  health: 15, maxHealth: 15,
                  shootTimer: Math.random() * 1000, scoreVal: 20
              });
              this.enemies.push({
                  type: 'drone', x: e.x + e.width + 20, y: e.y + e.height, width: 15, height: 15,
                  vx: (Math.random() - 0.5) * 300, vy: 150,
                  health: 15, maxHealth: 15,
                  shootTimer: Math.random() * 1000, scoreVal: 20
              });
           }
           if (this.level === 3 || this.level >= 4) {
              this.createExplosion(e.x + e.width/2, e.y + e.height/2, '#a855f7', 40);
              e.x = 50 + Math.random() * (this.width - 150);
              e.y = 50 + Math.random() * 100;
              e.targetX = e.x;
              e.targetY = e.y;
              e.vx = 0;
              e.vy = 0;
              this.createExplosion(e.x + e.width/2, e.y + e.height/2, '#a855f7', 40);
           }
        }

        e.homingTimer -= dt;
        if (e.homingTimer <= 0) {
           e.homingTimer = e.phase === 3 ? 7000 : 12000;
           this.projectiles.push({
              x: e.x + e.width/2, y: e.y + e.height, width: 8, height: 16,
              vx: 0, vy: 100, isPlayer: false, type: 'homing', dmg: 20
           });
           if (this.level >= 4) {
               this.projectiles.push({ x: e.x, y: e.y + e.height, width: 8, height: 16, vx: -100, vy: 100, isPlayer: false, type: 'homing', dmg: 20 });
               this.projectiles.push({ x: e.x+e.width, y: e.y + e.height, width: 8, height: 16, vx: 100, vy: 100, isPlayer: false, type: 'homing', dmg: 20 });
           }
        }
      } else {
        if (this.empTimer > 0) return;
        e.shootTimer -= dt;
        if (e.shootTimer <= 0) {
          this.projectiles.push({
            x: e.x + e.width / 2 - 2, y: e.y + e.height, width: 4, height: 15,
            vx: 0, vy: 300, isPlayer: false, type: 'normal'
          });
          e.shootTimer = 1500 + Math.random() * 1000;
        }
      }
      e.x += e.vx * dtS;
      e.y += e.vy * dtS;
    });

  }

  draw() {
    this.ctx.fillStyle = '#020617';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.stars.forEach(s => {
      this.ctx.fillStyle = s.color;
      this.ctx.globalAlpha = Math.random() * 0.5 + 0.5;
      this.ctx.fillRect(s.x, s.y, s.size, s.size);
    });
    this.ctx.globalAlpha = 1;

    if (!this.isPlaying && !this.isGameOver) return;

    if (this.bossState === 'warning') {
      this.ctx.fillStyle = `rgba(255, 50, 50, ${Math.abs(Math.sin(this.bossWarningTimer / 150))})`;
      this.ctx.font = 'bold 36px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText("WARNING", this.width/2, this.height/3);
      this.ctx.font = 'bold 24px monospace';
      this.ctx.fillText("BOSS INCOMING", this.width/2, this.height/3 + 40);
      this.ctx.textAlign = 'left';
    }

    this.blackHoles.forEach(bh => {
      this.ctx.save();
      this.ctx.translate(bh.x, bh.y);
      const gradient = this.ctx.createRadialGradient(0, 0, bh.radius/2, 0, 0, bh.radius*1.5);
      gradient.addColorStop(0, 'rgba(0,0,0,1)');
      gradient.addColorStop(0.5, 'rgba(147,51,234,0.8)');
      gradient.addColorStop(1, 'rgba(147,51,234,0)');
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath(); this.ctx.arc(0, 0, bh.radius*1.5, 0, Math.PI * 2); this.ctx.fill();
      this.ctx.fillStyle = '#000000';
      this.ctx.beginPath(); this.ctx.arc(0, 0, bh.radius/2, 0, Math.PI * 2); this.ctx.fill();
      this.ctx.rotate(bh.rotation);
      this.ctx.strokeStyle = 'rgba(216,180,254,0.5)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath(); this.ctx.arc(0, 0, bh.radius, 0, Math.PI); this.ctx.stroke();
      this.ctx.restore();
    });

    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life;
      this.ctx.beginPath(); this.ctx.arc(p.x, p.y, Math.random() * 3 + 1, 0, Math.PI * 2); this.ctx.fill();
    });
    this.ctx.globalAlpha = 1;

    this.powerups.forEach(p => {
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.shadowBlur = 15;
      switch(p.type) {
        case 'health':
          this.ctx.fillStyle = '#22c55e'; this.ctx.shadowColor = '#4ade80';
          this.ctx.fillRect(p.width/2 - 2, 0, 4, p.height); this.ctx.fillRect(0, p.height/2 - 2, p.width, 4);
          break;
        case 'shield':
          this.ctx.fillStyle = '#3b82f6'; this.ctx.shadowColor = '#60a5fa';
          this.ctx.beginPath(); this.ctx.arc(p.width/2, p.height/2, p.width/2, 0, Math.PI*2); this.ctx.fill();
          break;
        case 'firerate':
          this.ctx.fillStyle = '#eab308'; this.ctx.shadowColor = '#fde047';
          this.ctx.beginPath(); this.ctx.moveTo(p.width/2 + 5, 0); this.ctx.lineTo(0, p.height/2 + 2);
          this.ctx.lineTo(p.width/2 - 2, p.height/2 + 2); this.ctx.lineTo(p.width/2 - 5, p.height);
          this.ctx.lineTo(p.width, p.height/2 - 2); this.ctx.lineTo(p.width/2 + 2, p.height/2 - 2);
          this.ctx.closePath(); this.ctx.fill();
          break;
        case 'triple': case 'plasma': case 'homing':
          this.ctx.fillStyle = '#a855f7'; this.ctx.shadowColor = '#c084fc';
          this.ctx.font = '16px monospace'; this.ctx.fillText('W', p.width/4, p.height*0.8);
          break;
        case 'life':
          this.ctx.fillStyle = '#ec4899'; this.ctx.shadowColor = '#f472b6';
          this.ctx.beginPath(); this.ctx.moveTo(p.width/2, p.height/2); this.ctx.lineTo(0, p.height); this.ctx.lineTo(p.width, p.height); this.ctx.fill();
          break;
      }
      this.ctx.restore();
    });

    this.projectiles.forEach(p => {
      if (p.type === 'plasma') {
        this.ctx.fillStyle = '#a855f7'; this.ctx.shadowColor = '#c084fc'; this.ctx.shadowBlur = 20;
        this.ctx.beginPath(); this.ctx.arc(p.x + p.width/2, p.y + p.height/2, p.width/2, 0, Math.PI*2); this.ctx.fill();
      } else {
        this.ctx.fillStyle = p.isPlayer ? (p.type === 'homing' ? '#fbbf24' : '#38bdf8') : '#ef4444';
        this.ctx.shadowBlur = 12; this.ctx.shadowColor = p.isPlayer ? (p.type === 'homing' ? '#fde047' : '#0ea5e9') : '#dc2626';
        this.ctx.beginPath();
        this.ctx.roundRect ? this.ctx.roundRect(p.x, p.y, p.width, p.height, p.width/2) : this.ctx.fillRect(p.x, p.y, p.width, p.height);
        this.ctx.fill();
      }
      this.ctx.shadowBlur = 0;
    });

    this.enemies.forEach(e => {
      this.ctx.save(); this.ctx.translate(e.x + e.width / 2, e.y + e.height / 2);
      this.ctx.fillStyle = '#f43f5e'; this.ctx.shadowBlur = 5; this.ctx.shadowColor = '#be123c';
      if (e.type === 'small') {
        this.ctx.beginPath(); this.ctx.moveTo(0, e.height/2); this.ctx.lineTo(-e.width/2, -e.height/2);
        this.ctx.lineTo(0, -e.height/4); this.ctx.lineTo(e.width/2, -e.height/2); this.ctx.closePath(); this.ctx.fill();
      } else if (e.type === 'boss') {
        this.ctx.fillStyle = '#881337'; this.ctx.fillRect(-e.width/2, -e.height/2, e.width, e.height/2);
        this.ctx.fillStyle = '#f43f5e'; this.ctx.beginPath(); this.ctx.moveTo(-e.width/2, 0);
        this.ctx.lineTo(-e.width/4, e.height/2); this.ctx.lineTo(e.width/4, e.height/2); this.ctx.lineTo(e.width/2, 0); this.ctx.fill();
        this.ctx.fillStyle = '#fde047'; this.ctx.shadowBlur = 20; this.ctx.beginPath();
        this.ctx.arc(-e.width/4, 0, 10, 0, Math.PI*2); this.ctx.arc(e.width/4, 0, 10, 0, Math.PI*2); this.ctx.fill();
        this.ctx.shadowBlur = 0; this.ctx.fillStyle = '#ef4444'; this.ctx.fillRect(-e.width/2, -e.height/2 - 10, e.width, 6);
        this.ctx.fillStyle = '#22c55e'; this.ctx.fillRect(-e.width/2, -e.height/2 - 10, e.width * (e.health/e.maxHealth), 6);
        this.ctx.strokeStyle = '#ffffff'; this.ctx.strokeRect(-e.width/2, -e.height/2 - 10, e.width, 6);
      } else {
        this.ctx.beginPath(); this.ctx.moveTo(0, e.height / 2); this.ctx.lineTo(-e.width / 2, -e.height / 2);
        this.ctx.lineTo(-e.width / 4, -e.height / 4); this.ctx.lineTo(e.width / 4, -e.height / 4);
        this.ctx.lineTo(e.width / 2, -e.height / 2); this.ctx.closePath(); this.ctx.fill();
        this.ctx.fillStyle = '#fde047'; this.ctx.beginPath(); this.ctx.arc(0, 0, Math.min(e.width, e.height)/6, 0, Math.PI * 2); this.ctx.fill();
      }
      this.ctx.restore();
    });

    this.ctx.fillStyle = '#64748b'; this.ctx.strokeStyle = '#94a3b8'; this.ctx.lineWidth = 1.5;
    this.asteroids.forEach(a => {
      this.ctx.save(); this.ctx.translate(a.x + a.width/2, a.y + a.height/2); this.ctx.rotate(a.rotation);
      this.ctx.beginPath(); const r = a.width / 2;
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const radiusOffset = (a.width + i) % 3 === 0 ? r * 0.8 : r;
        const x = Math.cos(angle) * radiusOffset; const y = Math.sin(angle) * radiusOffset;
        if (i === 0) this.ctx.moveTo(x, y); else this.ctx.lineTo(x, y);
      }
      this.ctx.closePath(); this.ctx.fill(); this.ctx.stroke(); this.ctx.restore();
    });

    if (!this.isGameOver) {
      this.ctx.save(); this.ctx.translate(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
      if (this.player.invulnTimer <= 0 || Math.floor(this.player.invulnTimer / 100) % 2 === 0) {
        if (this.player.shield > 0) {
          this.ctx.fillStyle = 'rgba(56, 189, 248, 0.2)'; this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
          this.ctx.lineWidth = 2; this.ctx.beginPath(); this.ctx.arc(0, 0, this.player.width, 0, Math.PI * 2); this.ctx.fill(); this.ctx.stroke();
        }
        this.ctx.fillStyle = '#f59e0b'; this.ctx.globalAlpha = Math.random() * 0.5 + 0.5;
        this.ctx.beginPath(); this.ctx.moveTo(-this.player.width / 4, this.player.height / 2); this.ctx.lineTo(this.player.width / 4, this.player.height / 2);
        this.ctx.lineTo(0, this.player.height / 2 + 15 + Math.random() * 15); this.ctx.closePath(); this.ctx.fill();
        this.ctx.fillStyle = '#fbbf24'; this.ctx.beginPath(); this.ctx.arc(0, this.player.height / 2 + 2, 4, 0, Math.PI * 2); this.ctx.fill();
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = '#0ea5e9'; this.ctx.shadowBlur = 8; this.ctx.shadowColor = '#38bdf8';
        this.ctx.beginPath(); this.ctx.moveTo(0, -this.player.height / 2); this.ctx.lineTo(-this.player.width / 2, this.player.height / 2);
        this.ctx.lineTo(-this.player.width / 4, this.player.height / 4); this.ctx.lineTo(this.player.width / 4, this.player.height / 4);
        this.ctx.lineTo(this.player.width / 2, this.player.height / 2); this.ctx.closePath(); this.ctx.fill();
        this.ctx.shadowBlur = 0; this.ctx.fillStyle = '#e0f2fe'; this.ctx.beginPath();
        this.ctx.ellipse(0, -this.player.height / 6, 4, 8, 0, 0, Math.PI * 2); this.ctx.fill();
      }
      this.ctx.restore();
      this.ctx.fillStyle = '#ef4444'; this.ctx.fillRect(this.player.x, this.player.y - 12, this.player.width, 4);
      this.ctx.fillStyle = '#22c55e'; this.ctx.fillRect(this.player.x, this.player.y - 12, this.player.width * (this.player.health / this.player.maxHealth), 4);
      this.ctx.strokeStyle = '#ffffff20'; this.ctx.strokeRect(this.player.x, this.player.y - 12, this.player.width, 4);
      if (this.player.shield > 0) {
        this.ctx.fillStyle = '#38bdf8'; this.ctx.fillRect(this.player.x, this.player.y - 18, this.player.width * (this.player.shield / this.player.maxShield), 4);
      }
    }
  }

  onStateUpdateInner() {
    if (this.onStateUpdate) {
      this.onStateUpdate({
        score: this.score,
        lives: this.player ? this.player.lives : 0,
        shield: this.player ? this.player.shield : 0,
        weapon: this.player ? this.player.weapon : 'single',
        isGameOver: this.isGameOver,
        isPlaying: this.isPlaying,
        earnedCredits: Math.floor(this.score / 10),
        timeSurvived: Math.floor(this.timeSurvived / 1000),
        level: this.level,
        inventory: this.inventory,
        boss: this.currentBoss ? { health: this.currentBoss.health, maxHealth: this.currentBoss.maxHealth, name: this.currentBoss.name, phase: this.currentBoss.phase } : null
      });
    }
  }

  loop(time) {
    if (!this.lastTime) this.lastTime = time;
    let dt = time - this.lastTime;
    if (dt > 100) dt = 16; // Cap delta time to prevent massive jumps when tab is inactive
    this.lastTime = time;
    
    this.update(dt);
    this.draw();

    if (this.isPlaying || this.isGameOver) {
      this.rafId = requestAnimationFrame(this.loop);
    }
  }
}

// React Component
const GalacticDefender = ({ isOpen, onClose }) => {
  const { unlockAchievement } = useAchievements();
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  
  const [tab, setTab] = useState('play'); // 'play', 'shop', 'leaderboard'
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(null);
  
  const [gameState, setGameState] = useState({
    score: 0, lives: 3, shield: 0, weapon: 'single', isPlaying: false, isGameOver: false, earnedCredits: 0, timeSurvived: 0,
    level: 1, inventory: { nuke: 0, emp: 0, freeze: 0 }, boss: null
  });

  const [saveData, setSaveData] = useState(() => {
    const stored = localStorage.getItem('galactic_save');
    return stored ? JSON.parse(stored) : {
      credits: 0, highestScore: 0, upgrades: { weapon: 0, health: 0, speed: 0, shield: 0 }
    };
  });
  
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('galactic_player_name') || '');
  const [submittingScore, setSubmittingScore] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  useEffect(() => {
    localStorage.setItem('galactic_save', JSON.stringify(saveData));
  }, [saveData]);

  useEffect(() => {
    if (isOpen) {
      unlockAchievement('secret-hacker');
      const prevBody = document.body.style.overflow;
      const prevHtml = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevBody;
        document.documentElement.style.overflow = prevHtml;
      };
    }
  }, [isOpen, unlockAchievement]);

  const handleAchievement = useCallback((id) => {
    unlockAchievement(id);
  }, [unlockAchievement]);

  useEffect(() => {
    if (isOpen && canvasRef.current && !engineRef.current) {
      engineRef.current = new GameEngine(canvasRef.current, saveData, handleAchievement);
      engineRef.current.onStateUpdate = (state) => {
        setGameState(prev => {
          if (state.isGameOver && !prev.isGameOver) {
            setSaveData(curr => ({
              ...curr,
              credits: curr.credits + (state.earnedCredits || 0),
              highestScore: Math.max(curr.highestScore, state.score)
            }));
            setScoreSubmitted(false);
          }
          // We always update state now to ensure Boss Health / Inventory updates are fluid
          return state;
        });
      };
      engineRef.current.draw();
    }

    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key) && gameState.isPlaying) {
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
  }, [isOpen, saveData, gameState.isPlaying, handleAchievement]);

  const startGame = () => {
    setTab('play');
    engineRef.current?.start();
  };

  const buyUpgrade = (type) => {
    const cost = 100 + (saveData.upgrades[type] * 150);
    if (saveData.credits >= cost && saveData.upgrades[type] < 5) {
      setSaveData(prev => ({
        ...prev,
        credits: prev.credits - cost,
        upgrades: { ...prev.upgrades, [type]: prev.upgrades[type] + 1 }
      }));
    }
  };

  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    setLeaderboardError(null);
    try {
      if (!db) throw new Error("Firebase not initialized");
      const q = query(collection(db, "galactic_leaderboard"), orderBy("score", "desc"), limit(10));
      const querySnapshot = await getDocs(q);
      const data = [];
      querySnapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
      setLeaderboardData(data);
    } catch (e) {
      if (e.code === 'permission-denied') {
        setLeaderboardError("Missing Firebase Permissions");
      } else {
        setLeaderboardError("Failed to load leaderboard");
        console.error("Error fetching leaderboard", e);
      }
    }
    setLoadingLeaderboard(false);
  };

  const submitScore = async () => {
    if (!playerName.trim() || !db) return;
    setSubmittingScore(true);
    localStorage.setItem('galactic_player_name', playerName);
    try {
      await addDoc(collection(db, "galactic_leaderboard"), {
        name: playerName,
        score: gameState.score,
        timeSurvived: gameState.timeSurvived,
        timestamp: serverTimestamp()
      });
      setScoreSubmitted(true);
      fetchLeaderboard();
      setTab('leaderboard');
    } catch (e) {
      if (e.code === 'permission-denied') {
        setLeaderboardError("Missing Firebase Permissions");
      } else {
        console.error("Error adding score", e);
      }
    }
    setSubmittingScore(false);
  };

  useEffect(() => {
    if (tab === 'leaderboard') fetchLeaderboard();
  }, [tab]);

  const renderUpgradeRow = (type, name, icon, desc) => {
    const level = saveData.upgrades[type];
    const cost = 100 + (level * 150);
    const isMax = level >= 5;
    const canAfford = saveData.credits >= cost;

    return (
      <div className="flex items-center justify-between bg-black/20 p-3 rounded-lg border border-white/5 mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg text-accent">{icon}</div>
          <div>
            <h5 className="font-bold text-white text-sm">{name} <span className="text-text-muted text-xs font-normal">Lvl {level}/5</span></h5>
            <p className="text-[10px] text-text-muted">{desc}</p>
          </div>
        </div>
        <button
          onClick={() => buyUpgrade(type)}
          disabled={isMax || !canAfford}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1
            ${isMax ? 'bg-secondary text-text-muted cursor-not-allowed' : 
              canAfford ? 'bg-accent text-primary hover:bg-accent/90' : 'bg-red-500/20 text-red-300 cursor-not-allowed'}`}
        >
          {isMax ? 'MAXED' : <>{cost} <Coins size={12} /></>}
        </button>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-primary/95 backdrop-blur-md" />
          
          <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-secondary/90 border border-accent/20 p-4 sm:p-6 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col items-center max-w-[100vw] max-h-[95vh] overflow-y-auto custom-scrollbar w-full sm:w-auto" data-lenis-prevent>
            <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-accent transition-colors bg-primary/50 p-2 rounded-full border border-white/5 z-30">
              <X size={20} />
            </button>

            {/* Header */}
            <div className="flex flex-col items-center mb-4 w-full justify-center">
              <div className="flex items-center gap-3">
                <Rocket className="text-accent" size={24} />
                <h3 className="text-xl font-bold text-white tracking-wider uppercase font-mono">Galactic Defender</h3>
              </div>
              <div className="flex gap-4 mt-2 text-xs font-mono">
                <span className="text-accent flex items-center gap-1"><Coins size={14}/> {saveData.credits} Credits</span>
                <span className="text-text-muted flex items-center gap-1"><Trophy size={14}/> Best: {saveData.highestScore}</span>
              </div>
            </div>

            {/* In-Game HUD */}
            {gameState.isPlaying && (
              <div className="flex flex-col items-center mb-4 w-full justify-center font-mono text-xs sm:text-sm relative">
                
                {gameState.boss && (
                  <div className="w-full max-w-sm mb-3">
                    <div className="flex justify-between text-[10px] mb-1 px-1">
                      <span className="text-white font-bold">{gameState.boss.name}</span>
                      <span className="text-text-muted">{Math.ceil((gameState.boss.health / gameState.boss.maxHealth) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/10">
                      <div 
                        className={`h-full transition-all duration-300 ${gameState.boss.phase === 1 ? 'bg-green-500' : gameState.boss.phase === 2 ? 'bg-yellow-400' : 'bg-red-500'}`}
                        style={{ width: `${Math.max(0, (gameState.boss.health / gameState.boss.maxHealth) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 justify-center w-full">
                  <div className="flex items-center gap-2 bg-primary/40 px-3 py-1.5 rounded border border-white/5">
                    <span className="text-text-muted">Score:</span><span className="text-accent font-bold">{gameState.score}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-primary/40 px-3 py-1.5 rounded border border-white/5">
                    <Heart size={14} className="text-red-400" /><span className="text-white font-bold">x {gameState.lives}</span>
                  </div>
                  {gameState.shield > 0 && (
                    <div className="flex items-center gap-2 bg-primary/40 px-3 py-1.5 rounded border border-white/5">
                      <ShieldIcon size={14} className="text-blue-400" /><span className="text-white font-bold">{Math.ceil(gameState.shield)}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 justify-center w-full mt-2 text-[10px]">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded border ${gameState.inventory?.nuke > 0 ? 'bg-red-500/20 border-red-500/50 text-red-200' : 'bg-black/40 border-white/5 text-text-muted opacity-50'}`}>
                    <span className="font-bold">1</span> ☢ Nuke: {gameState.inventory?.nuke || 0}
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded border ${gameState.inventory?.emp > 0 ? 'bg-blue-500/20 border-blue-500/50 text-blue-200' : 'bg-black/40 border-white/5 text-text-muted opacity-50'}`}>
                    <span className="font-bold">2</span> ⚡ EMP: {gameState.inventory?.emp || 0}
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded border ${gameState.inventory?.freeze > 0 ? 'bg-purple-500/20 border-purple-500/50 text-purple-200' : 'bg-black/40 border-white/5 text-text-muted opacity-50'}`}>
                    <span className="font-bold">3</span> ❄ Freeze: {gameState.inventory?.freeze || 0}
                  </div>
                </div>
              </div>
            )}

            <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-inner bg-primary flex flex-col" style={{ width: GAME_WIDTH, maxWidth: '100%' }}>
              
              {/* Canvas Container */}
              <div className="relative flex justify-center items-center" style={{ height: (!gameState.isPlaying && !gameState.isGameOver) ? 0 : 'auto' }}>
                <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} className={`max-w-full h-auto max-h-[65vh] object-contain block ${(!gameState.isPlaying && !gameState.isGameOver) ? 'hidden' : ''}`} />
                
                {/* Game Over Overlay */}
                {gameState.isGameOver && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-20 p-6 text-center">
                    <h4 className="text-2xl font-bold text-white mb-2 font-mono">Mission Failed</h4>
                    <p className="text-text-muted mb-2">Final Score: <span className="text-accent font-bold">{gameState.score}</span></p>
                    <p className="text-green-400 text-sm mb-6 flex items-center justify-center gap-1"><Coins size={14}/> +{gameState.earnedCredits} Credits</p>
                    
                    {!scoreSubmitted && gameState.score > 0 && (
                      <div className="bg-white/5 p-4 rounded-xl border border-white/10 w-full max-w-[300px] mb-6">
                        <p className="text-xs text-text-muted mb-2 font-mono">Submit to Global Leaderboard</p>
                        <div className="flex gap-2">
                          <input type="text" value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="Pilot Name" className="flex-1 bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent" />
                          <button onClick={submitScore} disabled={!playerName.trim() || submittingScore} className="bg-accent text-primary px-3 rounded font-bold hover:bg-accent/90 disabled:opacity-50">
                            {submittingScore ? '...' : <ChevronRight size={18}/>}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button onClick={startGame} className="flex items-center gap-2 px-6 py-3 bg-accent text-primary font-bold rounded-full hover:bg-accent/90 transition-all">
                        <RefreshCw size={18} /> Retry
                      </button>
                      <button onClick={() => { engineRef.current.isGameOver = false; setGameState(p => ({...p, isGameOver: false})); setTab('shop'); }} className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-all border border-white/20">
                        Menu
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Main Menu UI */}
              {!gameState.isPlaying && !gameState.isGameOver && (
                <div className="flex flex-col h-[500px] bg-secondary p-4">
                  {/* Tabs */}
                  <div className="flex border-b border-white/10 mb-4 font-mono text-sm">
                    <button onClick={() => setTab('play')} className={`flex-1 py-2 text-center transition-colors border-b-2 ${tab === 'play' ? 'border-accent text-accent bg-accent/5' : 'border-transparent text-text-muted hover:text-white'}`}>Play</button>
                    <button onClick={() => setTab('shop')} className={`flex-1 py-2 text-center transition-colors border-b-2 ${tab === 'shop' ? 'border-accent text-accent bg-accent/5' : 'border-transparent text-text-muted hover:text-white'}`}>Upgrades</button>
                    <button onClick={() => setTab('leaderboard')} className={`flex-1 py-2 text-center transition-colors border-b-2 ${tab === 'leaderboard' ? 'border-accent text-accent bg-accent/5' : 'border-transparent text-text-muted hover:text-white'}`}>Rankings</button>
                  </div>

                  {/* Tab Content */}
                  <div className="flex-1 overflow-y-auto overflow-x-hidden rounded-xl bg-primary/30 border border-white/5 p-4 custom-scrollbar" data-lenis-prevent>
                    
                    {tab === 'play' && (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <Rocket className="text-accent mb-6 animate-pulse" size={56} />
                        <h2 className="text-2xl font-bold text-white mb-2 font-mono">Earth Needs You</h2>
                        <p className="text-text-muted text-sm max-w-[280px] mb-8">Defend the sector. Earn credits. Upgrade your ship. Climb the ranks.</p>
                        <button onClick={startGame} className="px-10 py-4 bg-accent text-primary font-bold rounded-full hover:bg-accent/90 transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(56,189,248,0.4)] mb-4 text-lg">
                          Launch Mission
                        </button>
                        <p className="text-xs text-text-muted font-mono">WASD to move • Hold SPACE to fire</p>
                      </div>
                    )}

                    {tab === 'shop' && (
                      <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4 bg-accent/10 p-3 rounded-lg border border-accent/20">
                          <span className="text-white font-mono text-sm">Available Funds</span>
                          <span className="text-accent font-bold font-mono flex items-center gap-2"><Coins size={16}/> {saveData.credits}</span>
                        </div>
                        <div className="space-y-1">
                          {renderUpgradeRow('weapon', 'Blaster Tech', <Zap size={18}/>, '+25% base weapon damage per level')}
                          {renderUpgradeRow('health', 'Hull Integrity', <Heart size={18}/>, '+50 max health capacity per level')}
                          {renderUpgradeRow('shield', 'Deflector Shields', <ShieldPlus size={18}/>, '+50 starting shield capacity per level')}
                          {renderUpgradeRow('speed', 'Thruster Output', <Rocket size={18}/>, 'Increases ship movement speed')}
                        </div>
                      </div>
                    )}

                    {tab === 'leaderboard' && (
                      <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-white font-bold font-mono">Top Pilots</h4>
                          <button onClick={fetchLeaderboard} className="text-accent hover:text-white transition-colors" title="Refresh">
                            <RefreshCw size={16} className={loadingLeaderboard ? "animate-spin" : ""} />
                          </button>
                        </div>
                        
                        {loadingLeaderboard ? (
                          <div className="flex-1 flex items-center justify-center text-text-muted"><RefreshCw className="animate-spin" /></div>
                        ) : leaderboardError ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-red-400 text-sm text-center font-mono p-4">
                            <TriangleAlert className="mb-2 text-red-500" size={24} />
                            <span>{leaderboardError}</span>
                            {leaderboardError.includes('Permissions') && (
                              <span className="text-[10px] text-text-muted mt-2">Check Firestore Rules for 'galactic_leaderboard' collection.</span>
                            )}
                          </div>
                        ) : leaderboardData.length === 0 ? (
                          <div className="flex-1 flex items-center justify-center text-text-muted text-sm text-center">No scores yet.<br/>Be the first!</div>
                        ) : (
                          <div className="space-y-2">
                            {leaderboardData.map((entry, idx) => (
                              <div key={entry.id} className="flex items-center justify-between bg-black/30 p-3 rounded-lg border border-white/5">
                                <div className="flex items-center gap-3">
                                  <div className={`font-mono font-bold w-6 text-center ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-amber-600' : 'text-text-muted'}`}>
                                    {idx < 3 ? <Medal size={20} className="mx-auto"/> : `#${idx+1}`}
                                  </div>
                                  <div>
                                    <h5 className="font-bold text-white text-sm">{entry.name}</h5>
                                    <p className="text-[10px] text-text-muted font-mono">{entry.timeSurvived}s survived</p>
                                  </div>
                                </div>
                                <div className="text-accent font-bold font-mono">{entry.score}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                  </div>
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
