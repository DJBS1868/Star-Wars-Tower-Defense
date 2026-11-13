/* ============================================================
   Game simulation — path, towers, waves, combat, rendering
   ============================================================ */

import {
  TOWERS, TOWER_ORDER, TARGET_MODES, ENEMY_TYPES,
  START_CREDITS, START_LIVES, getMap, makeWave, waveReward,
  enemyReward, towerLevel, sellValue, clamp,
} from './data.js';
import {
  buildBackground, drawBaseShield, drawTower, drawTowerShadow, drawRange,
  drawEnemy, drawProjectile, drawParticles, drawEffects, drawAura, drawPreview,
  drawSpawnGlow, getTheme,
} from './art.js';

const TAU = Math.PI * 2;

function angleLerp(a, b, t) {
  let d = ((b - a + Math.PI) % TAU + TAU) % TAU - Math.PI;
  return a + d * Math.min(1, t);
}

function samplePath(points, w, h, per = 18) {
  const src = points.map(p => [p[0] * w, p[1] * h]);
  const out = [];
  for (let i = 0; i < src.length - 1; i++) {
    const p0 = src[Math.max(0, i - 1)];
    const p1 = src[i];
    const p2 = src[i + 1];
    const p3 = src[Math.min(src.length - 1, i + 2)];
    for (let s = 0; s < per; s++) {
      const t = s / per;
      const t2 = t * t;
      const t3 = t2 * t;
      const x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
      const y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
      out.push([x, y]);
    }
  }
  out.push(src[src.length - 1].slice());
  return out;
}

function pointDistanceToPath(x, y, pts) {
  let best = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    const ax = pts[i][0], ay = pts[i][1];
    const bx = pts[i + 1][0], by = pts[i + 1][1];
    const dx = bx - ax, dy = by - ay;
    const l2 = dx * dx + dy * dy || 1;
    let t = ((x - ax) * dx + (y - ay) * dy) / l2;
    t = clamp(t, 0, 1);
    const px = ax + dx * t, py = ay + dy * t;
    const d = (x - px) ** 2 + (y - py) ** 2;
    if (d < best) best = d;
  }
  return Math.sqrt(best);
}

export class Game {
  constructor(canvas, audio, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.audio = audio;
    this.callbacks = callbacks;
    this.dpr = 1;
    this.w = 1;
    this.h = 1;
    this.S = 1;
    this.pathPts = [];
    this.pathLen = 1;
    this.bg = null;
    this.time = 0;
    this.realTime = 0;
    this.started = false;
    this.paused = false;
    this.speed = 1;
    this.preview = null;
    this.pendingType = null;
    this.selected = null;
    this.shake = 0;
    this.baseFlash = 0;
    this.dustTimer = 0;
    this.uid = 1;
    this.map = getMap('tatooine');
    this.theme = getTheme(this.map.theme);
    this.reset();
    this.resize(
      canvas.clientWidth || 800,
      canvas.clientHeight || 600,
      Math.min(window.devicePixelRatio || 1, 2),
    );
  }

  setMap(id) {
    const next = getMap(id);
    if (this.map && this.map.id === next.id) return;
    this.map = next;
    this.theme = getTheme(next.theme);
    this.reset();
    if (this.w > 1) this.resize(this.w, this.h, this.dpr);
  }

  reset() {
    const map = this.map || getMap('tatooine');
    this.credits = map.startCredits ?? START_CREDITS;
    this.lives = map.startLives ?? START_LIVES;
    this.waveNumber = 1;
    this.waveActive = false;
    this.spawnQueue = null;
    this.spawnTimer = 0;
    this.waveTotal = 0;
    this.waveSpawned = 0;
    this.enemies = [];
    this.towers = [];
    this.projectiles = [];
    this.particles = [];
    this.effects = [];
    this.kills = 0;
    this.creditsEarned = 0;
    this.selected = null;
    this.pendingType = null;
    this.preview = null;
    this.phase = 'build';
    this.endless = false;
    this.bossRef = null;
    this.shake = 0;
    this.baseFlash = 0;
    this.dustTimer = 0;
    this.spawnPoint = [0, 0];
  }

  resize(w, h, dpr) {
    this.dpr = dpr;
    this.w = Math.max(1, w);
    this.h = Math.max(1, h);
    this.canvas.width = Math.floor(this.w * dpr);
    this.canvas.height = Math.floor(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.S = clamp(Math.min(this.w / 960, this.h / 640), 0.58, 1.55);
    this.pathPts = samplePath(this.map.path, this.w, this.h);
    let len = 0;
    for (let i = 1; i < this.pathPts.length; i++) {
      len += Math.hypot(this.pathPts[i][0] - this.pathPts[i - 1][0], this.pathPts[i][1] - this.pathPts[i - 1][1]);
    }
    this.pathLen = Math.max(1, len);
    this.spawnPoint = this.pathPts[0] || [0, 0];
    this.bg = buildBackground(this.w, this.h, this.pathPts, this.S, Math.min(dpr, 2), this.map);
    for (const t of this.towers) {
      t.x = t.nx * this.w;
      t.y = t.ny * this.h;
    }
    for (const e of this.enemies) {
      this.positionEnemy(e);
    }
  }

  begin() {
    if (this.started) return;
    this.started = true;
    this.phase = 'build';
    this.credits = this.map.startCredits ?? START_CREDITS;
    this.lives = this.map.startLives ?? START_LIVES;
  }

  setSpeed(s) {
    this.speed = s;
  }

  /* ---------------- path & placement ---------------- */

  pathWidth() {
    return clamp(34 * this.S, 28, 54);
  }

  distanceToPath(x, y) {
    return pointDistanceToPath(x, y, this.pathPts);
  }

  canPlace(type, nx, ny) {
    const def = TOWERS[type];
    if (!def) return { ok: false, reason: 'Unknown tower' };
    if (!this.started) return { ok: false, reason: 'Deploy the outpost first' };
    if (this.phase === 'defeat' || this.phase === 'victory') return { ok: false, reason: 'Run over' };
    if (this.credits < def.cost) return { ok: false, reason: `Need ${def.cost - this.credits} more credits` };
    const x = nx * this.w;
    const y = ny * this.h;
    const S = this.S;
    const marginX = 20 * S;
    const top = Math.max(48, 40 * S);
    const bottom = this.h - 14 * S;
    if (x < marginX || x > this.w - marginX || y < top || y > bottom) {
      return { ok: false, reason: 'Too close to the edge' };
    }
    if (this.distanceToPath(x, y) < this.pathWidth() / 2 + 26 * S) {
      return { ok: false, reason: "Can't build on the enemy route" };
    }
    const m = Math.min(this.w, this.h);
    for (const d of (this.map.decor || [])) {
      const dx = d.x * this.w;
      const dy = d.y * this.h;
      const dr = d.r * m;
      if (Math.hypot(x - dx, y - dy) < dr + 24 * S) {
        return { ok: false, reason: 'Obstructed — pick open ground' };
      }
    }
    const baseX = this.map.base.x * this.w;
    const baseY = this.map.base.y * this.h;
    if (Math.hypot(x - baseX, y - baseY) < clamp(m * 0.085, 44, 96) + 16 * S) {
      return { ok: false, reason: 'Too close to the relay' };
    }
    for (const t of this.towers) {
      if (Math.hypot(x - t.x, y - t.y) < 41 * S) {
        return { ok: false, reason: 'Another tower is in the way' };
      }
    }
    return { ok: true, reason: '' };
  }

  placeTower(type, nx, ny) {
    const check = this.canPlace(type, nx, ny);
    if (!check.ok) return check;
    const def = TOWERS[type];
    const lv = towerLevel(type, 1);
    const tower = {
      id: this.uid++,
      type,
      nx, ny,
      x: nx * this.w,
      y: ny * this.h,
      level: 1,
      range: lv.range,
      damage: lv.damage,
      cooldown: lv.cooldown,
      splash: lv.splash,
      slow: lv.slow,
      slowDuration: lv.slowDuration,
      chain: lv.chain,
      cooldownLeft: 0.15,
      angle: -Math.PI / 2,
      targetAngle: -Math.PI / 2,
      recoil: 0,
      mode: 'first',
      spent: def.cost,
      phase: Math.random() * TAU,
      flash: 0,
    };
    this.credits -= def.cost;
    this.towers.push(tower);
    this.effects.push({ kind: 'ring', x: tower.x, y: tower.y, r: 6 * this.S, maxR: 38 * this.S, color: '#ffe6a6', width: 2.4 * this.S, life: 0.4, max: 0.4, alpha: 0.9 });
    this.spark(tower.x, tower.y, 10, '#ffd98a', 2.4);
    this.audio.place();
    return { ok: true, tower, reason: '' };
  }

  selectTower(tower) {
    if (!tower) { this.selected = null; return; }
    this.selected = tower;
    this.pendingType = null;
    this.preview = null;
  }

  towerAt(px, py) {
    for (let i = this.towers.length - 1; i >= 0; i--) {
      const t = this.towers[i];
      if (Math.hypot(px - t.x, py - t.y) < 34 * this.S) return t;
    }
    return null;
  }

  setPending(type) {
    this.pendingType = type;
    this.preview = null;
    if (type) this.selected = null;
  }

  setPreview(nx, ny) {
    if (!this.pendingType) { this.preview = null; return; }
    if (nx == null || ny == null) { this.preview = null; return; }
    const check = this.canPlace(this.pendingType, nx, ny);
    this.preview = { type: this.pendingType, nx, ny, valid: check.ok };
  }

  tryPlaceDefault(type, nx, ny) {
    const result = this.placeTower(type, nx, ny);
    if (result.ok) {
      this.pendingType = null;
      this.preview = null;
    }
    return result;
  }

  upgradeSelected() {
    const t = this.selected;
    if (!t || t.level >= 4) return { ok: false, reason: 'Already max level' };
    const lv = towerLevel(t.type, t.level);
    if (this.credits < lv.upgrade) return { ok: false, reason: `Need ${lv.upgrade - this.credits} more credits` };
    this.credits -= lv.upgrade;
    t.spent += lv.upgrade;
    t.level++;
    const next = towerLevel(t.type, t.level);
    t.range = next.range;
    t.damage = next.damage;
    t.cooldown = next.cooldown;
    t.splash = next.splash;
    t.slow = next.slow;
    t.slowDuration = next.slowDuration;
    t.chain = next.chain;
    t.flash = 1;
    this.effects.push({ kind: 'ring', x: t.x, y: t.y, r: 8 * this.S, maxR: 46 * this.S, color: '#8ff0ff', width: 2.5 * this.S, life: 0.5, max: 0.5 });
    this.effects.push({ kind: 'flash', x: t.x, y: t.y, r: 46 * this.S, color: 'rgba(130, 225, 255, 0.35)', life: 0.35, max: 0.35 });
    this.spark(t.x, t.y, 16, '#b9f4ff', 3);
    this.audio.upgrade();
    return { ok: true };
  }

  sellSelected() {
    const t = this.selected;
    if (!t) return { ok: false };
    const value = sellValue(t);
    this.credits += value;
    this.towers = this.towers.filter(x => x !== t);
    this.selected = null;
    this.effects.push({ kind: 'ring', x: t.x, y: t.y, r: 12 * this.S, maxR: 40 * this.S, color: '#ffce7a', width: 2, life: 0.45, max: 0.45 });
    this.effects.push({ kind: 'text', x: t.x, y: t.y - 10, text: `+${value}`, color: '#ffe2a0', size: 13 * this.S, life: 0.8, max: 0.8 });
    this.spark(t.x, t.y, 8, '#ffce7a', 2);
    this.audio.sell();
    return { ok: true, value };
  }

  cycleTarget() {
    if (!this.selected) return;
    const i = TARGET_MODES.findIndex(m => m.id === this.selected.mode);
    this.selected.mode = TARGET_MODES[(i + 1) % TARGET_MODES.length].id;
    this.audio.ui();
  }

  /* ---------------- waves ---------------- */

  startWave() {
    if (!this.started || this.paused || this.waveActive) return false;
    if (this.phase !== 'build') return false;
    const specs = makeWave(this.waveNumber, this.map.id);
    let last = 0;
    this.spawnQueue = specs.map(s => {
      const gap = Math.max(0.08, s.delay - last);
      last = s.delay;
      return { ...s, gap };
    });
    this.spawnTimer = this.spawnQueue.length ? this.spawnQueue[0].gap : 0.5;
    this.waveTotal = this.spawnQueue.length;
    this.waveSpawned = 0;
    this.waveActive = true;
    this.phase = 'wave';
    this.bossRef = null;
    this.audio.waveStart();
    this.effects.push({ kind: 'ring', x: this.spawnPoint[0], y: this.spawnPoint[1], r: 8 * this.S, maxR: 64 * this.S, color: '#ff8a63', width: 2, life: 0.7, max: 0.7 });
    this.callbacks.onWaveStart?.(this.waveNumber);
    if (this.waveNumber === this.map.waves && !this.endless) {
      this.callbacks.toast?.(this.map.flavor?.final || 'Final wave — hold the relay!', 'bad');
    } else if ((this.map.bossEvery ?? 10) > 0 && this.waveNumber % (this.map.bossEvery ?? 10) === 0) {
      this.callbacks.toast?.(this.map.flavor?.boss || 'Enemy commander inbound', 'bad');
    }
    return true;
  }

  spawnEnemy(spec) {
    const def = ENEMY_TYPES[spec.type];
    const e = {
      id: this.uid++,
      type: spec.type,
      hp: spec.hp,
      maxHp: spec.hp,
      speed: spec.speed * (0.95 + Math.random() * 0.1),
      t: 0,
      x: this.pathPts[0][0],
      y: this.pathPts[0][1],
      angle: 0,
      radius: def.radius,
      slowT: 0,
      slowFactor: 0,
      hitFlash: 0,
      phase: Math.random() * TAU,
      dead: false,
      reward: enemyReward(spec.type, this.waveNumber),
      leak: def.leak,
      isBoss: !!def.boss,
    };
    this.positionEnemy(e);
    this.enemies.push(e);
    this.waveSpawned++;
    if (e.isBoss) {
      this.bossRef = e;
      this.audio.bossWarn();
      this.shake = Math.max(this.shake, 5);
      this.callbacks.onBoss?.();
      this.callbacks.toast?.(`${def.name} on the field`, 'bad');
      this.effects.push({ kind: 'ring', x: e.x, y: e.y, r: 10 * this.S, maxR: 90 * this.S, color: '#ff8a63', width: 3, life: 0.7, max: 0.7 });
    }
  }

  positionEnemy(e) {
    const n = this.pathPts.length;
    if (!n) return;
    const f = clamp(e.t, 0, 1) * (n - 1);
    const i0 = Math.min(n - 1, Math.floor(f));
    const i1 = Math.min(n - 1, i0 + 1);
    const frac = f - i0;
    const a = this.pathPts[i0];
    const b = this.pathPts[i1];
    e.x = a[0] + (b[0] - a[0]) * frac;
    e.y = a[1] + (b[1] - a[1]) * frac;
    e.angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
  }

  completeWave() {
    if (!this.waveActive) return;
    this.waveActive = false;
    this.spawnQueue = null;
    const bonus = waveReward(this.waveNumber);
    this.credits += bonus;
    this.creditsEarned += bonus;
    this.audio.waveClear();
    this.callbacks.toast?.(`Wave ${this.waveNumber} cleared  +${bonus} credits`, 'good');
    this.effects.push({ kind: 'ring', x: this.map.base.x * this.w, y: this.map.base.y * this.h, r: 12 * this.S, maxR: 90 * this.S, color: '#8ff0b0', width: 2, life: 0.8, max: 0.8 });

    if (!this.endless && this.waveNumber >= this.map.waves) {
      this.win();
      return;
    }
    this.waveNumber++;
    this.phase = 'build';
    this.selected = null;
    this.callbacks.onWaveClear?.(this.waveNumber, bonus);
  }

  win() {
    if (this.phase === 'victory') return;
    this.phase = 'victory';
    this.waveActive = false;
    this.audio.victory();
    this.callbacks.onEnd?.(true);
  }

  defeat() {
    if (this.phase === 'defeat') return;
    this.phase = 'defeat';
    this.waveActive = false;
    this.audio.defeat();
    this.shake = 16;
    this.callbacks.onEnd?.(false);
  }

  continueEndless() {
    this.endless = true;
    this.phase = 'build';
    if (this.waveNumber <= this.map.waves) this.waveNumber = this.map.waves + 1;
    this.lives = Math.max(this.lives, 10);
    this.selected = null;
    this.paused = false;
    this.callbacks.toast?.('Endless mode — the enemy army is endless too', 'bad');
  }

  /* ---------------- update ---------------- */

  update(rawDt) {
    const rdt = Math.min(rawDt, 0.15);
    this.realTime += rdt;
    if (!this.started || this.paused || this.phase === 'victory' || this.phase === 'defeat') {
      this.updateFx(rdt);
      return;
    }
    // Fixed substeps keep the simulation real-time even at low frame rates.
    const total = rdt * this.speed;
    const steps = Math.max(1, Math.ceil(total / 0.033));
    const dt = total / steps;
    for (let i = 0; i < steps; i++) {
      this.stepSim(dt);
      if (this.phase === 'victory' || this.phase === 'defeat') break;
    }
  }

  stepSim(dt) {
    this.time += dt;

    // ambient weather
    this.dustTimer -= dt;
    if (this.dustTimer <= 0) {
      const amb = this.theme.ambient || { mode: 'dust', color: 'rgba(255, 233, 185, 0.35)', density: 1 };
      this.dustTimer = (0.35 + Math.random() * 0.5) / (amb.density || 1);
      if (this.particles.length < 300) {
        const w = this.w;
        const h = this.h;
        const S = this.S;
        let p;
        if (amb.mode === 'snow') {
          p = {
            x: Math.random() * w * 1.1,
            y: -10,
            vx: (6 + Math.random() * 18) * S,
            vy: (26 + Math.random() * 42) * S,
            life: 5 + Math.random() * 4,
            max: 9,
            size: (0.8 + Math.random() * 1.9) * S,
            color: amb.color,
            glow: Math.random() > 0.6,
            gravity: 0,
            drag: 0.998,
          };
        } else if (amb.mode === 'ember') {
          p = {
            x: Math.random() * w,
            y: h * (0.4 + Math.random() * 0.7),
            vx: (6 + Math.random() * 22) * S,
            vy: -(14 + Math.random() * 34) * S,
            life: 2 + Math.random() * 3,
            max: 5,
            size: (0.7 + Math.random() * 1.6) * S,
            color: amb.color,
            glow: true,
            gravity: -6,
            drag: 0.995,
          };
        } else if (amb.mode === 'mote') {
          p = {
            x: Math.random() * w,
            y: h * (0.3 + Math.random() * 0.7),
            vx: (4 + Math.random() * 14) * S,
            vy: -(2 + Math.random() * 12) * S,
            life: 3 + Math.random() * 3,
            max: 6,
            size: (0.7 + Math.random() * 1.3) * S,
            color: amb.color,
            glow: true,
            gravity: 0,
            drag: 0.997,
          };
        } else {
          p = {
            x: Math.random() * w,
            y: h * (0.25 + Math.random() * 0.7),
            vx: (10 + Math.random() * 26) * S,
            vy: (2 + Math.random() * 8) * S,
            life: 3.5 + Math.random() * 4,
            max: 7,
            size: (0.7 + Math.random() * 1.2) * S,
            color: amb.color,
            glow: false,
            gravity: 0,
            drag: 0.99,
          };
        }
        this.particles.push(p);
      }
    }

    if (this.waveActive && this.spawnQueue) {
      this.spawnTimer -= dt;
      let guard = 0;
      while (this.spawnTimer <= 0 && this.spawnQueue.length && guard++ < 20) {
        const spec = this.spawnQueue.shift();
        this.spawnEnemy(spec);
        this.spawnTimer += this.spawnQueue.length ? this.spawnQueue[0].gap : 0.5;
      }
    }

    this.updateEnemies(dt);
    this.updateTowers(dt);
    this.updateProjectiles(dt);
    this.updateFx(dt);
    this.cleanup();

    if (this.waveActive && (!this.spawnQueue || this.spawnQueue.length === 0) && this.enemies.length === 0) {
      this.completeWave();
    }
    if (this.baseFlash > 0) this.baseFlash = Math.max(0, this.baseFlash - dt * 2);
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 34);
  }

  updateFx(dt) {
    for (const e of this.effects) e.life -= dt;
    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.gravity) p.vy += p.gravity * dt;
      if (p.drag) { p.vx *= p.drag; p.vy *= p.drag; }
    }
    this.effects = this.effects.filter(e => e.life > 0);
    this.particles = this.particles.filter(p => p.life > 0 && p.x > -80 && p.x < this.w + 80 && p.y > -80 && p.y < this.h + 80);
  }

  updateEnemies(dt) {
    for (const e of this.enemies) {
      if (e.dead) continue;
      if (e.hitFlash > 0) e.hitFlash = Math.max(0, e.hitFlash - dt);
      if (e.slowT > 0) {
        e.slowT -= dt;
        if (e.slowT <= 0) { e.slowT = 0; e.slowFactor = 0; }
      }
      const slowMul = e.slowT > 0 ? 1 - e.slowFactor : 1;
      const pxPerSec = e.speed * this.S * slowMul;
      e.t += (pxPerSec * dt) / this.pathLen;
      if (e.t >= 1) {
        e.dead = true;
        this.leakEnemy(e);
      } else {
        this.positionEnemy(e);
      }
    }
  }

  leakEnemy(e) {
    this.lives -= e.leak;
    this.baseFlash = 1;
    this.shake = Math.max(this.shake, 8);
    this.audio.leak();
    this.effects.push({ kind: 'ring', x: this.map.base.x * this.w, y: this.map.base.y * this.h, r: 20 * this.S, maxR: 105 * this.S, color: '#ff6e58', width: 3, life: 0.7, max: 0.7 });
    this.effects.push({ kind: 'flash', x: this.map.base.x * this.w, y: this.map.base.y * this.h, r: 100 * this.S, color: 'rgba(255, 90, 70, 0.5)', life: 0.5, max: 0.5 });
    this.callbacks.toast?.(`Relay hit!  −${e.leak} integrity`, 'bad');
    this.callbacks.onLeak?.(e.leak);
    if (this.bossRef === e) this.bossRef = null;
    if (this.lives <= 0) {
      this.lives = 0;
      this.defeat();
    }
    if (this.phase === 'defeat') {
      // let the current frame finish; game over overlay takes over
    }
  }

  updateTowers(dt) {
    for (const t of this.towers) {
      if (t.flash > 0) t.flash = Math.max(0, t.flash - dt * 3);
      t.cooldownLeft -= dt;
      t.recoil = Math.max(0, t.recoil - dt * 7);
      const target = this.pickTarget(t);
      if (target) {
        const desired = Math.atan2(target.y - t.y, target.x - t.x);
        t.targetAngle = desired;
        t.angle = angleLerp(t.angle, desired, dt * 16);
        if (t.cooldownLeft <= 0) {
          this.fire(t, target);
          t.cooldownLeft = t.cooldown;
        }
      } else {
        t.targetAngle = t.angle;
        t.angle += dt * 0.18;
      }
    }
  }

  pickTarget(t) {
    const R2 = (t.range * this.S) ** 2;
    let best = null;
    let bestScore = -Infinity;
    for (const e of this.enemies) {
      if (e.dead) continue;
      const d2 = (e.x - t.x) ** 2 + (e.y - t.y) ** 2;
      if (d2 > R2) continue;
      let score;
      if (t.mode === 'first') score = e.t;
      else if (t.mode === 'last') score = -e.t;
      else if (t.mode === 'strong') score = e.hp;
      else score = -d2;
      if (score > bestScore) { bestScore = score; best = e; }
    }
    return best;
  }

  muzzle(t, target) {
    const a = Math.atan2(target.y - t.y, target.x - t.x);
    const d = (t.type === 'bounty' ? 23 : 17) * this.S;
    return { x: t.x + Math.cos(a) * d, y: t.y + Math.sin(a) * d, angle: a };
  }

  fire(t, target) {
    const def = TOWERS[t.type];
    const muzzle = this.muzzle(t, target);
    t.recoil = 1;
    t.flash = 0.4;
    if (def.attack === 'bullet') {
      this.projectiles.push({
        kind: 'bullet', x: muzzle.x, y: muzzle.y, target,
        speed: def.projectileSpeed * this.S, damage: t.damage,
        towerType: t.type, life: 2.4, angle: muzzle.angle,
      });
      this.audio.shot('scout');
      this.effects.push({ kind: 'flash', x: muzzle.x, y: muzzle.y, r: 11 * this.S, color: 'rgba(255, 220, 130, 0.55)', life: 0.08, max: 0.08 });
      this.spark(muzzle.x, muzzle.y, 2, '#ffd77f', 1.6);
    } else if (def.attack === 'rocket') {
      this.projectiles.push({
        kind: 'rocket', x: muzzle.x, y: muzzle.y, target,
        speed: def.projectileSpeed * this.S, damage: t.damage,
        splash: t.splash * this.S, towerType: t.type, life: 3.4, angle: muzzle.angle, source: { x: t.x, y: t.y },
      });
      this.audio.shot('rocket');
      this.spark(muzzle.x, muzzle.y, 4, '#ffb066', 2.2);
    } else if (def.attack === 'ion') {
      this.projectiles.push({
        kind: 'ion', x: muzzle.x, y: muzzle.y, target,
        speed: def.projectileSpeed * this.S, damage: t.damage,
        slow: t.slow, slowDuration: t.slowDuration, splash: 36 * this.S,
        towerType: t.type, life: 3, angle: muzzle.angle, spin: 0,
        source: { x: t.x, y: t.y },
      });
      this.audio.shot('ion');
      this.effects.push({ kind: 'flash', x: muzzle.x, y: muzzle.y, r: 16 * this.S, color: 'rgba(130, 230, 255, 0.6)', life: 0.14, max: 0.14 });
    } else if (def.attack === 'laser') {
      const hits = [target];
      const extra = (t.chain || 1) - 1;
      if (extra > 0) {
        const near = this.enemies
          .filter(e => !e.dead && e !== target && Math.hypot(e.x - target.x, e.y - target.y) < 95 * this.S && Math.hypot(e.x - t.x, e.y - t.y) < t.range * this.S)
          .sort((a, b) => Math.hypot(a.x - target.x, a.y - target.y) - Math.hypot(b.x - target.x, b.y - target.y));
        for (let i = 0; i < extra && i < near.length; i++) hits.push(near[i]);
      }
      let fx = muzzle;
      for (const e of hits) {
        this.effects.push({ kind: 'beam', x1: fx.x, y1: fx.y, x2: e.x, y2: e.y, color: '#ff6252', width: 3.1 * this.S, life: 0.11, max: 0.11 });
        this.damageEnemy(e, t.damage, { tower: t });
        this.spark(e.x, e.y, 3, '#ffab7f', 2.4);
        fx = { x: e.x, y: e.y };
      }
      this.audio.shot('laser');
      this.effects.push({ kind: 'flash', x: muzzle.x, y: muzzle.y, r: 14 * this.S, color: 'rgba(255, 110, 90, 0.5)', life: 0.1, max: 0.1 });
    } else if (def.attack === 'sniper') {
      const bonus = ENEMY_TYPES[target.type].boss ? def.bossBonus : 1;
      const dmg = t.damage * bonus;
      this.effects.push({ kind: 'beam', x1: muzzle.x, y1: muzzle.y, x2: target.x, y2: target.y, color: '#ffce7c', width: 2.2 * this.S, life: 0.16, max: 0.16 });
      this.effects.push({ kind: 'flash', x: target.x, y: target.y, r: 22 * this.S, color: 'rgba(255, 220, 150, 0.55)', life: 0.18, max: 0.18 });
      this.damageEnemy(target, dmg, { tower: t });
      this.spark(target.x, target.y, 8, '#ffd98a', 2.8);
      this.audio.shot('sniper');
      this.shake = Math.max(this.shake, ENEMY_TYPES[target.type].boss ? 2.5 : 0.7);
    } else if (def.attack === 'aura') {
      const R2 = (t.range * this.S) ** 2;
      let hurt = 0;
      for (const e of this.enemies) {
        if (e.dead) continue;
        if ((e.x - t.x) ** 2 + (e.y - t.y) ** 2 < R2) {
          this.damageEnemy(e, t.damage, { tower: t });
          hurt++;
        }
      }
      const slashAngle = this.time * 3 + t.phase;
      this.effects.push({ kind: 'slash', x: t.x, y: t.y, r: t.range * this.S * 0.92, a0: slashAngle, a1: slashAngle + 1.9, color: '#8fd6ff', width: 3 * this.S, life: 0.16, max: 0.16 });
      if (hurt > 0) this.audio.shot('jedi');
    }
  }

  damageEnemy(e, amount, opts = {}) {
    if (e.dead) return;
    const def = ENEMY_TYPES[e.type];
    let dmg = amount;
    if (!opts.trueDamage) dmg = Math.max(1, dmg - (def.armor || 0));
    e.hp -= dmg;
    e.hitFlash = 0.1;
    if (e.hp <= 0) this.killEnemy(e, opts.tower);
  }

  killEnemy(e, tower) {
    if (e.dead) return;
    e.dead = true;
    this.kills++;
    this.credits += e.reward;
    this.creditsEarned += e.reward;
    const edef = ENEMY_TYPES[e.type];
    const big = !!edef.boss || !!edef.heavy;
    this.audio.kill(big);
    this.spark(e.x, e.y, big ? 14 : 7, edef.boss ? '#ff8a6a' : edef.heavy ? '#ffb36b' : edef.color || '#ffb36b', big ? 3 : 2);
    if (edef.boss) {
      this.explosion(e.x, e.y, 100 * this.S, true);
      this.shake = Math.max(this.shake, 12);
      this.effects.push({ kind: 'text', x: e.x, y: e.y - 20 * this.S, text: `+${e.reward}`, color: '#ffe6a1', size: 16 * this.S, life: 1.1, max: 1.1 });
      this.callbacks.toast?.(`${edef.name} destroyed  +${e.reward} credits`, 'good');
      this.bossRef = null;
    } else if (edef.heavy) {
      this.explosion(e.x, e.y, 26 * this.S, false);
    } else {
      this.effects.push({ kind: 'ring', x: e.x, y: e.y, r: 2, maxR: 14 * this.S, color: 'rgba(255, 190, 110, 0.7)', width: 1.2, life: 0.25, max: 0.25, alpha: 0.5 });
    }
    // gold flecks
    this.spark(e.x, e.y, 3, '#ffe08a', 1.5);
    void tower;
  }

  explosion(x, y, radius, big) {
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(radius) || radius <= 0) return;
    this.effects.push({
      kind: 'ring', x, y, r: radius * 0.12, maxR: radius,
      color: big ? '#ffd08a' : '#ffb56b', width: big ? 4 : 2.4,
      life: big ? 0.6 : 0.32, max: big ? 0.6 : 0.32, fill: 'rgba(255, 120, 50, 0.18)',
    });
    this.effects.push({ kind: 'flash', x, y, r: radius * 0.7, color: big ? 'rgba(255, 210, 140, 0.6)' : 'rgba(255, 170, 100, 0.45)', life: big ? 0.3 : 0.16, max: big ? 0.3 : 0.16 });
    const n = big ? 28 : 12;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU;
      const sp = (big ? 40 : 25) + Math.random() * (big ? 140 : 70);
      const size = (1 + Math.random() * (big ? 3.2 : 2.2)) * this.S;
      const life = 0.35 + Math.random() * (big ? 0.7 : 0.35);
      this.particles.push({
        x, y,
        vx: Math.cos(a) * sp * this.S, vy: Math.sin(a) * sp * this.S,
        life, max: life, size,
        color: i % 3 === 0 ? '#ffe8b0' : i % 3 === 1 ? '#ff9a55' : '#8b4e2f',
        glow: i % 3 !== 2, gravity: big ? 40 : 30, drag: 0.975,
      });
    }
    for (let i = 0; i < (big ? 8 : 4); i++) {
      const life = 0.6 + Math.random() * 0.6;
      this.particles.push({
        x: x + (Math.random() - 0.5) * radius * 0.5,
        y: y + (Math.random() - 0.5) * radius * 0.5,
        vx: (Math.random() - 0.5) * 18 * this.S,
        vy: -12 * this.S - Math.random() * 18 * this.S,
        life, max: life, size: (5 + Math.random() * 8) * this.S,
        color: 'rgba(73, 54, 38, 0.45)', glow: false, gravity: -4, drag: 0.985,
      });
    }
    this.audio.explosion(big);
  }

  spark(x, y, count, color, size) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * TAU;
      const sp = 20 + Math.random() * 100;
      const life = 0.2 + Math.random() * 0.35;
      this.particles.push({
        x, y,
        vx: Math.cos(a) * sp * this.S,
        vy: Math.sin(a) * sp * this.S,
        life, max: life,
        size: (size * (0.5 + Math.random() * 0.8)) * this.S,
        color, glow: true, gravity: 130, drag: 0.94,
      });
    }
  }

  ionBurst(x, y, radius, source) {
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(radius) || radius <= 0) return;
    const segments = 7;
    for (const other of this.enemies) {
      if (other.dead) continue;
      if (Math.hypot(other.x - x, other.y - y) < radius + other.radius * this.S) {
        this.slowEnemy(other, 0.55, 1.4);
        this.spark(other.x, other.y, 3, '#8cecff', 2);
      }
    }
    if (source) {
      const pts = [];
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const px = source.x + (x - source.x) * t;
        const py = source.y + (y - source.y) * t;
        const jitter = i === 0 || i === segments ? 0 : (Math.random() - 0.5) * 22 * this.S;
        pts.push([px + jitter, py + jitter * 0.6]);
      }
      this.effects.push({ kind: 'arc', points: pts, color: '#7fe6ff', width: 1.7 * this.S, life: 0.2, max: 0.2 });
    }
    this.effects.push({ kind: 'ring', x, y, r: 4, maxR: radius, color: '#8deaff', width: 2, life: 0.35, max: 0.35 });
    this.effects.push({ kind: 'flash', x, y, r: radius * 0.8, color: 'rgba(120, 230, 255, 0.4)', life: 0.2, max: 0.2 });
  }

  slowEnemy(e, factor, duration) {
    if (factor >= e.slowFactor || e.slowT <= 0) {
      e.slowFactor = Math.max(e.slowFactor, factor);
    }
    e.slowT = Math.max(e.slowT, duration);
  }

  updateProjectiles(dt) {
    for (const p of this.projectiles) {
      if (p.dead) continue;
      p.life -= dt;
      if (p.life <= 0) { p.dead = true; continue; }
      if (p.kind === 'ion') p.spin += dt * 9;
      const target = p.target;
      if (target && !target.dead) {
        const dx = target.x - p.x;
        const dy = target.y - p.y;
        const d = Math.hypot(dx, dy);
        p.angle = Math.atan2(dy, dx);
        const step = p.speed * dt;
        if (d <= step + target.radius * this.S * 0.8 + 4) {
          this.projectileHit(p, target);
          p.dead = true;
          continue;
        }
        p.x += (dx / d) * step;
        p.y += (dy / d) * step;
        if (p.kind === 'rocket') {
          const life = 0.3 + Math.random() * 0.25;
          this.particles.push({
            x: p.x - Math.cos(p.angle) * 7 * this.S,
            y: p.y - Math.sin(p.angle) * 7 * this.S,
            vx: (Math.random() - 0.5) * 12 * this.S,
            vy: (Math.random() - 0.5) * 12 * this.S - 4 * this.S,
            life, max: life, size: (2 + Math.random() * 2.2) * this.S,
            color: 'rgba(150, 142, 128, 0.4)', glow: false, gravity: -6, drag: 0.98,
          });
        }
      } else {
        const step = p.speed * dt;
        p.x += Math.cos(p.angle) * step;
        p.y += Math.sin(p.angle) * step;
        if (p.splash && target) {
          // payload falls short but still detonates
          this.projectileHit(p, null);
          p.dead = true;
        }
      }
    }
    this.projectiles = this.projectiles.filter(p => !p.dead);
  }

  projectileHit(p, target) {
    if (p.kind === 'bullet') {
      if (target) {
        this.damageEnemy(target, p.damage);
        this.spark(target.x, target.y, 3, '#ffd480', 2);
      }
    } else if (p.kind === 'rocket') {
      const R = p.splash;
      for (const e of this.enemies) {
        if (e.dead) continue;
        const d = Math.hypot(e.x - p.x, e.y - p.y);
        if (d < R + e.radius * this.S) {
          const falloff = 1 - clamp((d - e.radius * this.S) / R, 0, 1) * 0.45;
          this.damageEnemy(e, p.damage * falloff);
        }
      }
      this.explosion(p.x, p.y, R, false);
      this.shake = Math.max(this.shake, 1.8);
    } else if (p.kind === 'ion') {
      if (target) this.damageEnemy(target, p.damage);
      for (const e of this.enemies) {
        if (e.dead) continue;
        const d = Math.hypot(e.x - p.x, e.y - p.y);
        if (d < p.splash + e.radius * this.S) {
          this.slowEnemy(e, p.slow, p.slowDuration);
          if (e !== target) this.damageEnemy(e, p.damage * 0.35);
        }
      }
      this.ionBurst(p.x, p.y, p.splash, p.source);
      this.audio.shot('ion');
    }
  }

  cleanup() {
    this.enemies = this.enemies.filter(e => !e.dead);
    if (this.bossRef && this.bossRef.dead) this.bossRef = null;
    if (this.selected && !this.towers.includes(this.selected)) this.selected = null;
  }

  bossInfo() {
    let boss = null;
    for (const e of this.enemies) {
      if (ENEMY_TYPES[e.type].boss && !e.dead && (!boss || e.hp > boss.hp)) boss = e;
    }
    if (!boss) return null;
    const def = ENEMY_TYPES[boss.type];
    return {
      name: this.waveNumber >= this.map.waves && !this.endless ? `ELITE ${def.name.toUpperCase()}` : def.name.toUpperCase(),
      pct: clamp(boss.hp / boss.maxHp, 0, 1),
      hp: Math.max(0, Math.ceil(boss.hp)),
    };
  }

  hud() {
    let queue = this.spawnQueue ? this.spawnQueue.length : 0;
    let alive = this.enemies.length;
    let progress = 0;
    if (this.phase === 'wave' && this.waveTotal > 0) {
      progress = clamp(1 - (queue + alive) / this.waveTotal, 0, 1);
    } else if (this.phase === 'build' && this.waveNumber > 1) {
      progress = 1;
    }
    return {
      credits: this.credits,
      lives: this.lives,
      wave: this.waveNumber,
      waveActive: this.waveActive,
      phase: this.phase,
      queue,
      alive,
      progress,
      endless: this.endless,
      boss: this.bossInfo(),
    };
  }

  /* ---------------- render ---------------- */

  render() {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);

    let sx = 0, sy = 0;
    if (this.shake > 0.1) {
      sx = (Math.random() - 0.5) * this.shake;
      sy = (Math.random() - 0.5) * this.shake * 0.7;
    }
    ctx.save();
    ctx.translate(sx, sy);

    if (this.bg) ctx.drawImage(this.bg, 0, 0, this.w, this.h);
    else {
      ctx.fillStyle = '#c69a63';
      ctx.fillRect(0, 0, this.w, this.h);
    }

    drawSpawnGlow(ctx, this.pathPts, this.realTime);
    drawBaseShield(ctx, this.w, this.h, this.realTime, this.baseFlash, this.map.base);

    // range circles
    if (this.selected) {
      const t = this.selected;
      const color = t.type === 'ion' ? '#6fe1ff' : t.type === 'jedi' ? '#7cc7ff' : '#f1c76f';
      drawRange(ctx, t.x, t.y, t.range * this.S, color, 0.85);
    }
    for (const t of this.towers) {
      if (t.type === 'jedi') drawAura(ctx, t, this.S, this.realTime);
    }

    // enemies
    for (const e of this.enemies) {
      if (!e.dead) drawEnemy(ctx, e, this.realTime, this.S);
    }

    // tower shadows then towers
    for (const t of this.towers) drawTowerShadow(ctx, t, this.S);
    for (const t of this.towers) {
      drawTower(ctx, t, this.realTime, this.S, this.selected === t, 1);
    }

    // projectiles
    for (const p of this.projectiles) drawProjectile(ctx, p, this.S);

    // particles / effects
    drawParticles(ctx, this.particles);
    drawEffects(ctx, this.effects, this.realTime);

    // placement preview
    if (this.preview && this.pendingType) {
      drawPreview(ctx, this.preview.type, this.preview.nx * this.w, this.preview.ny * this.h, this.preview.valid, this.realTime, this.S);
    }

    // base flash wash
    if (this.baseFlash > 0.02) {
      ctx.save();
      ctx.globalAlpha = this.baseFlash * 0.18;
      ctx.fillStyle = '#ff5a3c';
      ctx.fillRect(0, 0, this.w, this.h);
      ctx.restore();
    }
    ctx.restore();
  }

  cardIcon(type) {
    return TOWERS[type]?.icon || '';
  }
}

export { TOWER_ORDER };
