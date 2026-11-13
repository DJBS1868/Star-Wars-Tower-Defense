/* ============================================================
   Canvas art — procedural Rebel outpost battlefield
   All game visuals are drawn with the 2D canvas (no assets).
   ============================================================ */

import { DECOR, ENEMY_TYPES, TOWERS, clamp } from './data.js';

const TAU = Math.PI * 2;
const TOWER_ART = 1.32;
const ENEMY_ART = 2.02;

/* ============================================================
   PLANET THEMES
   Every battlefield is generated from a palette so the same
   procedural pipeline can paint sand, snow, lava or forest floor.
   ============================================================ */

const THEMES = {
  desert: {
    extra: 'desert',
    ground: ['#d8ad72', '#cfa067', '#bf8e58'],
    dunes: [
      { x: -0.05, y: 0.02, w: 0.52, h: 0.28, c: 'rgba(246, 215, 163, 0.24)' },
      { x: 0.45, y: 0.02, w: 0.62, h: 0.22, c: 'rgba(246, 215, 163, 0.17)' },
      { x: 0.03, y: 0.78, w: 0.42, h: 0.30, c: 'rgba(160, 112, 64, 0.15)' },
      { x: 0.55, y: 0.73, w: 0.50, h: 0.34, c: 'rgba(247, 213, 157, 0.14)' },
      { x: 0.33, y: 0.35, w: 0.37, h: 0.23, c: 'rgba(246, 215, 163, 0.10)' },
    ],
    ripple: '126, 85, 45',
    speckleDark: '111, 74, 38',
    speckleLight: '250, 226, 174',
    pathShadow: 'rgba(79, 48, 23, 0.20)',
    pathBank: '#9c6a3b',
    pathFill: ['#e8c48c', '#edcc95', '#e3bb80'],
    pathHi: 'rgba(255, 233, 184, 0.22)',
    track: 'rgba(129, 84, 41, 0.17)',
    scrub: '105, 108, 54',
    caveRim: ['#9d7347', '#7b5534', '#5f4127'],
    caveDark: ['#120d08', '#24190f'],
    caveLip: 'rgba(226, 184, 122, 0.34)',
    caveEdge: 'rgba(58, 36, 17, 0.55)',
    caveStyle: 'rock',
    rock: ['#a67c51', '#7a5738', '#5e422b'],
    rockLit: 'rgba(232, 193, 137, 0.26)',
    rockShadow: 'rgba(53, 31, 13, 0.30)',
    pebbleShadow: 'rgba(86, 57, 32, 0.26)',
    pebble: ['#aa7a4b', '#8c613a'],
    pebbleLit: 'rgba(247, 216, 165, 0.32)',
    pad: '#9b9790',
    padEdge: '#6e6a63',
    dome: ['#c9c3b8', '#8f8b82', '#5d5a53'],
    vignette: 'rgba(46, 26, 9, 0.30)',
    ambient: { mode: 'dust', color: 'rgba(255, 233, 185, 0.35)', density: 1 },
  },
  ice: {
    extra: 'ice',
    ground: ['#d3e7ef', '#accaD7', '#83a7b8'],
    dunes: [
      { x: -0.04, y: 0.00, w: 0.56, h: 0.30, c: 'rgba(255, 255, 255, 0.42)' },
      { x: 0.40, y: 0.03, w: 0.68, h: 0.24, c: 'rgba(255, 255, 255, 0.28)' },
      { x: 0.00, y: 0.76, w: 0.48, h: 0.34, c: 'rgba(74, 120, 142, 0.18)' },
      { x: 0.52, y: 0.70, w: 0.54, h: 0.38, c: 'rgba(255, 255, 255, 0.22)' },
      { x: 0.30, y: 0.34, w: 0.40, h: 0.26, c: 'rgba(240, 252, 255, 0.20)' },
    ],
    ripple: '104, 146, 168',
    speckleDark: '78, 118, 138',
    speckleLight: '255, 255, 255',
    pathShadow: 'rgba(42, 78, 98, 0.24)',
    pathBank: '#7d9dae',
    pathFill: ['#e8f4f8', '#d8eaf1', '#c3dbe4'],
    pathHi: 'rgba(255, 255, 255, 0.50)',
    track: 'rgba(104, 142, 160, 0.20)',
    scrub: '118, 150, 128',
    caveRim: ['#dcecf2', '#a8c8d4', '#7ea3b2'],
    caveDark: ['#081923', '#16303e'],
    caveLip: 'rgba(224, 248, 255, 0.55)',
    caveEdge: 'rgba(58, 100, 122, 0.55)',
    caveStyle: 'ice',
    rock: ['#c7dde6', '#96b8c6', '#6d93a4'],
    rockLit: 'rgba(255, 255, 255, 0.50)',
    rockShadow: 'rgba(48, 88, 108, 0.28)',
    pebbleShadow: 'rgba(58, 98, 118, 0.22)',
    pebble: ['#a4c0cc', '#82a4b3'],
    pebbleLit: 'rgba(255, 255, 255, 0.42)',
    pad: '#a9bcc4',
    padEdge: '#6f8895',
    dome: ['#dbe8ec', '#9fb4bd', '#65808c'],
    vignette: 'rgba(12, 30, 44, 0.34)',
    ambient: { mode: 'snow', color: 'rgba(255, 255, 255, 0.85)', density: 1.7 },
  },
  lava: {
    extra: 'lava',
    ground: ['#3c2723', '#2b1b18', '#1b1110'],
    dunes: [
      { x: -0.05, y: 0.00, w: 0.56, h: 0.26, c: 'rgba(122, 66, 48, 0.30)' },
      { x: 0.42, y: 0.02, w: 0.64, h: 0.22, c: 'rgba(90, 48, 36, 0.28)' },
      { x: 0.02, y: 0.78, w: 0.46, h: 0.32, c: 'rgba(255, 96, 30, 0.10)' },
      { x: 0.52, y: 0.72, w: 0.54, h: 0.36, c: 'rgba(255, 120, 40, 0.08)' },
      { x: 0.32, y: 0.36, w: 0.38, h: 0.24, c: 'rgba(140, 72, 50, 0.16)' },
    ],
    ripple: '158, 78, 48',
    speckleDark: '10, 6, 5',
    speckleLight: '255, 130, 60',
    pathShadow: 'rgba(0, 0, 0, 0.45)',
    pathBank: '#1c110f',
    pathFill: ['#5c4139', '#4a332d', '#3a2723'],
    pathHi: 'rgba(255, 124, 54, 0.40)',
    track: 'rgba(0, 0, 0, 0.30)',
    scrub: '96, 62, 42',
    caveRim: ['#5a3325', '#3c2018', '#24120e'],
    caveDark: ['#ff6a1a', '#7a1f08'],
    caveLip: 'rgba(255, 146, 64, 0.55)',
    caveEdge: 'rgba(18, 8, 6, 0.75)',
    caveStyle: 'lava',
    rock: ['#4c3731', '#332420', '#211614'],
    rockLit: 'rgba(255, 120, 60, 0.24)',
    rockShadow: 'rgba(0, 0, 0, 0.50)',
    pebbleShadow: 'rgba(0, 0, 0, 0.35)',
    pebble: ['#4e3a32', '#33251f'],
    pebbleLit: 'rgba(255, 130, 70, 0.32)',
    pad: '#6c5b56',
    padEdge: '#3a2b27',
    dome: ['#ab978d', '#6d5a53', '#42332d'],
    vignette: 'rgba(14, 5, 3, 0.52)',
    ambient: { mode: 'ember', color: 'rgba(255, 150, 70, 0.9)', density: 1.25 },
  },
  forest: {
    extra: 'forest',
    ground: ['#405733', '#314827', '#24371d'],
    dunes: [
      { x: -0.05, y: 0.00, w: 0.58, h: 0.28, c: 'rgba(198, 220, 130, 0.16)' },
      { x: 0.42, y: 0.02, w: 0.66, h: 0.24, c: 'rgba(148, 190, 96, 0.11)' },
      { x: 0.00, y: 0.76, w: 0.48, h: 0.32, c: 'rgba(8, 22, 8, 0.30)' },
      { x: 0.52, y: 0.72, w: 0.54, h: 0.36, c: 'rgba(180, 215, 110, 0.10)' },
      { x: 0.30, y: 0.36, w: 0.40, h: 0.24, c: 'rgba(14, 32, 12, 0.22)' },
    ],
    ripple: '120, 152, 88',
    speckleDark: '20, 35, 15',
    speckleLight: '188, 216, 128',
    pathShadow: 'rgba(8, 18, 6, 0.38)',
    pathBank: '#4c3b25',
    pathFill: ['#8f7649', '#7b633c', '#66512f'],
    pathHi: 'rgba(226, 204, 144, 0.28)',
    track: 'rgba(50, 36, 18, 0.28)',
    scrub: '118, 160, 80',
    caveRim: ['#706b5d', '#4d4a3f', '#35332b'],
    caveDark: ['#060c07', '#12200f'],
    caveLip: 'rgba(184, 204, 144, 0.32)',
    caveEdge: 'rgba(18, 28, 14, 0.62)',
    caveStyle: 'bunker',
    rock: ['#5f6d54', '#45513e', '#2f3929'],
    rockLit: 'rgba(184, 214, 142, 0.22)',
    rockShadow: 'rgba(8, 16, 6, 0.42)',
    pebbleShadow: 'rgba(8, 16, 6, 0.30)',
    pebble: ['#5d6c4e', '#46543b'],
    pebbleLit: 'rgba(192, 216, 152, 0.26)',
    pad: '#7d8178',
    padEdge: '#4f544c',
    dome: ['#b4bcae', '#7d8778', '#525b4d'],
    vignette: 'rgba(5, 16, 6, 0.46)',
    ambient: { mode: 'mote', color: 'rgba(220, 255, 170, 0.40)', density: 1 },
  },
};

export function getTheme(name) {
  return THEMES[name] || THEMES.desert;
}

export function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function tracePoints(ctx, pts) {
  if (!pts.length) return;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
}

function offsetPath(pts, off) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const prev = pts[Math.max(0, i - 1)];
    const next = pts[Math.min(pts.length - 1, i + 1)];
    let dx = next[0] - prev[0];
    let dy = next[1] - prev[1];
    const l = Math.hypot(dx, dy) || 1;
    dx /= l; dy /= l;
    out.push([p[0] - dy * off, p[1] + dx * off]);
  }
  return out;
}

/* ============================================================
   STATIC MAP
   ============================================================ */

export function buildBackground(w, h, pathPts, S, dpr = 1, map = {}) {
  const theme = getTheme(map.theme);
  const decor = map.decor || DECOR;
  const basePos = map.base || { x: 0.952, y: 0.60 };
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.floor(w * dpr));
  c.height = Math.max(1, Math.floor(h * dpr));
  const ctx = c.getContext('2d');
  ctx.scale(dpr, dpr);
  const rng = mulberry32(0x5a7b21 + hashString(map.id || 'tatooine'));
  const m = Math.min(w, h);

  // --- base terrain ----------------------------------------------
  const bg = ctx.createLinearGradient(0, 0, w * 0.4, h);
  bg.addColorStop(0, theme.ground[0]);
  bg.addColorStop(0.44, theme.ground[1]);
  bg.addColorStop(1, theme.ground[2]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // huge soft terrain bands
  for (const d of theme.dunes) {
    ctx.save();
    ctx.translate(d.x * w, d.y * h);
    ctx.beginPath();
    ctx.ellipse(d.w * w * 0.5, d.h * h * 0.55, d.w * w * 0.5, d.h * h * 0.5, -0.16, 0, TAU);
    const g = ctx.createLinearGradient(0, 0, 0, d.h * h);
    g.addColorStop(0, d.c);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  }

  // ground character (before the path so the route stays readable)
  drawTerrainDetail(ctx, w, h, S, rng, pathPts, theme);

  // wind / terrain ripples
  ctx.save();
  ctx.lineCap = 'round';
  const rippleCount = theme.extra === 'forest' ? 60 : 44;
  for (let i = 0; i < rippleCount; i++) {
    const x = rng() * w;
    const y = rng() * h;
    if (distanceToPath(x, y, pathPts) < 44 * S) continue;
    const len = (12 + rng() * 46) * S;
    const bend = (rng() - 0.5) * 18 * S;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + len * 0.5, y + bend, x + len, y + bend * 0.2);
    ctx.strokeStyle = `rgba(${theme.ripple}, ${0.05 + rng() * 0.07})`;
    ctx.lineWidth = (0.8 + rng() * 1.4) * S;
    ctx.stroke();
  }
  ctx.restore();

  // speckles / pebbles
  for (let i = 0; i < 380; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const s = (0.4 + rng() * 1.7) * S;
    ctx.fillStyle = rng() > 0.5
      ? `rgba(${theme.speckleDark}, ${0.05 + rng() * 0.15})`
      : `rgba(${theme.speckleLight}, ${0.06 + rng() * 0.16})`;
    ctx.beginPath();
    ctx.arc(x, y, s, 0, TAU);
    ctx.fill();
  }

  // --- the route ------------------------------------------------
  const pw = clamp(34 * S, 28, 54);
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // ambient shadow
  tracePoints(ctx, offsetPath(pathPts, 5 * S));
  ctx.strokeStyle = theme.pathShadow;
  ctx.lineWidth = pw + 17 * S;
  ctx.stroke();

  // outer bank
  tracePoints(ctx, pathPts);
  ctx.strokeStyle = theme.pathBank;
  ctx.lineWidth = pw + 9 * S;
  ctx.stroke();

  // packed surface
  tracePoints(ctx, pathPts);
  const pathGrad = ctx.createLinearGradient(0, 0, w, h);
  pathGrad.addColorStop(0, theme.pathFill[0]);
  pathGrad.addColorStop(0.5, theme.pathFill[1]);
  pathGrad.addColorStop(1, theme.pathFill[2]);
  ctx.strokeStyle = pathGrad;
  ctx.lineWidth = pw;
  ctx.stroke();

  // inner highlight
  tracePoints(ctx, offsetPath(pathPts, -pw * 0.12));
  ctx.strokeStyle = theme.pathHi;
  ctx.lineWidth = pw * 0.5;
  ctx.stroke();

  // wheel / boot tracks
  ctx.setLineDash([12 * S, 20 * S]);
  ctx.lineCap = 'butt';
  for (const off of [-pw * 0.19, pw * 0.19]) {
    tracePoints(ctx, offsetPath(pathPts, off));
    ctx.strokeStyle = theme.track;
    ctx.lineWidth = 1.8 * S;
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();

  // terrain-specific route edges
  drawPathEdges(ctx, w, h, S, rng, pathPts, pw, theme);

  // stones lining the path
  for (let i = 0; i < pathPts.length; i += 3) {
    const p = pathPts[i];
    const prev = pathPts[Math.max(0, i - 1)];
    const next = pathPts[Math.min(pathPts.length - 1, i + 1)];
    let dx = next[0] - prev[0];
    let dy = next[1] - prev[1];
    const l = Math.hypot(dx, dy) || 1;
    dx /= l; dy /= l;
    for (const side of [-1, 1]) {
      if (rng() > 0.82) continue;
      const off = (pw / 2 + 3 + rng() * 7) * side;
      const sx = p[0] - dy * off;
      const sy = p[1] + dx * off;
      drawPebble(ctx, sx, sy, (1.5 + rng() * 3) * S, rng, rng() * TAU, theme);
    }
  }

  // path edge scrub
  for (let i = 0; i < 34; i++) {
    const p = pathPts[Math.floor(rng() * pathPts.length)];
    if (!p) continue;
    const ang = rng() * TAU;
    const off = pw * 0.5 + (4 + rng() * 14) * S;
    const x = p[0] + Math.cos(ang) * off;
    const y = p[1] + Math.sin(ang) * off;
    ctx.strokeStyle = `rgba(${theme.scrub}, ${0.14 + rng() * 0.12})`;
    ctx.lineWidth = 1.1 * S;
    ctx.beginPath();
    for (let b = -1; b <= 1; b++) {
      ctx.moveTo(x + b * 2 * S, y + 3 * S);
      ctx.quadraticCurveTo(x + b * 3 * S, y - 4 * S, x + b * 6 * S, y - 6 * S);
    }
    ctx.stroke();
  }

  // --- army entrance ---------------------------------------------
  drawSpawnCave(ctx, w, h, S, rng, theme, pathPts);

  // --- decorations ----------------------------------------------
  for (const d of decor) {
    const x = d.x * w;
    const y = d.y * h;
    const r = d.r * m;
    drawDecor(ctx, d, x, y, r, S, rng, theme);
  }

  // --- relay base -------------------------------------------------
  drawRelayBaseStatic(ctx, basePos.x * w, basePos.y * h, m, S, rng, theme);

  // foreground atmosphere (canopy shade, drifting ash glow, etc.)
  drawForeground(ctx, w, h, S, rng, theme, pathPts);

  // vignette
  const vg = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.28, w * 0.5, h * 0.5, Math.max(w, h) * 0.82);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, theme.vignette);
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);

  return c;
}

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/* Terrain-specific marks drawn under the route. */
function drawTerrainDetail(ctx, w, h, S, rng, pathPts, theme) {
  if (theme.extra === 'ice') {
    // wind-carved sastrugi
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 0; i < 26; i++) {
      const x = rng() * w;
      const y = rng() * h;
      if (distanceToPath(x, y, pathPts) < 52 * S) continue;
      const len = (30 + rng() * 110) * S;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + len * 0.5, y - 5 * S, x + len, y + 2 * S);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.10 + rng() * 0.16})`;
      ctx.lineWidth = (1.4 + rng() * 2.4) * S;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 3 * S, y + 3 * S);
      ctx.quadraticCurveTo(x + len * 0.5, y - 1 * S, x + len, y + 5 * S);
      ctx.strokeStyle = `rgba(76, 116, 138, ${0.06 + rng() * 0.08})`;
      ctx.lineWidth = 1.2 * S;
      ctx.stroke();
    }
    ctx.restore();
    // frozen melt pools
    for (let i = 0; i < 9; i++) {
      const x = rng() * w;
      const y = rng() * h;
      if (distanceToPath(x, y, pathPts) < 70 * S) continue;
      const rx = (18 + rng() * 46) * S;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rx);
      g.addColorStop(0, 'rgba(132, 188, 208, 0.32)');
      g.addColorStop(0.7, 'rgba(174, 214, 228, 0.16)');
      g.addColorStop(1, 'rgba(174, 214, 228, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, rx * 0.55, rng() * TAU, 0, TAU);
      ctx.fill();
    }
  } else if (theme.extra === 'lava') {
    // glowing fissures that never cross the route
    for (let i = 0; i < 16; i++) {
      let x = rng() * w;
      let y = rng() * h;
      if (distanceToPath(x, y, pathPts) < 76 * S) continue;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(255, 96, 30, 0.9)';
      ctx.shadowBlur = 12 * S;
      ctx.beginPath();
      ctx.moveTo(x, y);
      let px = x;
      let py = y;
      for (let s = 0; s < 5; s++) {
        px += (rng() - 0.3) * 26 * S;
        py += (rng() - 0.5) * 22 * S;
        ctx.lineTo(px, py);
      }
      ctx.strokeStyle = 'rgba(255, 118, 34, 0.55)';
      ctx.lineWidth = (1.4 + rng() * 1.8) * S;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 226, 150, 0.85)';
      ctx.lineWidth = 0.7 * S;
      ctx.stroke();
      ctx.restore();
    }
    // scorched basalt patches
    for (let i = 0; i < 40; i++) {
      const x = rng() * w;
      const y = rng() * h;
      if (distanceToPath(x, y, pathPts) < 40 * S) continue;
      ctx.fillStyle = `rgba(12, 7, 6, ${0.10 + rng() * 0.18})`;
      ctx.beginPath();
      ctx.ellipse(x, y, (8 + rng() * 30) * S, (5 + rng() * 16) * S, rng() * TAU, 0, TAU);
      ctx.fill();
    }
  } else if (theme.extra === 'forest') {
    // leaf litter and mossy patches
    for (let i = 0; i < 220; i++) {
      const x = rng() * w;
      const y = rng() * h;
      const c = rng() > 0.5 ? '110, 140, 60' : '60, 88, 38';
      ctx.fillStyle = `rgba(${c}, ${0.06 + rng() * 0.16})`;
      ctx.beginPath();
      ctx.ellipse(x, y, (1.2 + rng() * 3.4) * S, (0.8 + rng() * 1.6) * S, rng() * TAU, 0, TAU);
      ctx.fill();
    }
    for (let i = 0; i < 18; i++) {
      const x = rng() * w;
      const y = rng() * h;
      if (distanceToPath(x, y, pathPts) < 46 * S) continue;
      const rx = (16 + rng() * 42) * S;
      ctx.fillStyle = `rgba(120, 156, 70, ${0.05 + rng() * 0.09})`;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, rx * 0.5, rng() * TAU, 0, TAU);
      ctx.fill();
    }
  }
}

/* Extra edges and glow applied directly around the route. */
function drawPathEdges(ctx, w, h, S, rng, pathPts, pw, theme) {
  if (theme.extra === 'lava') {
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(255, 98, 26, 0.85)';
    ctx.shadowBlur = 10 * S;
    for (const side of [-1, 1]) {
      tracePoints(ctx, offsetPath(pathPts, side * (pw * 0.5 + 1.5 * S)));
      ctx.strokeStyle = 'rgba(255, 132, 42, 0.65)';
      ctx.lineWidth = 1.6 * S;
      ctx.stroke();
    }
    ctx.restore();
    // molten seams
    ctx.save();
    ctx.setLineDash([7 * S, 15 * S]);
    tracePoints(ctx, offsetPath(pathPts, pw * 0.27));
    ctx.strokeStyle = 'rgba(255, 170, 80, 0.4)';
    ctx.lineWidth = 1 * S;
    ctx.stroke();
    ctx.restore();
  } else if (theme.extra === 'ice') {
    ctx.save();
    for (const side of [-1, 1]) {
      tracePoints(ctx, offsetPath(pathPts, side * (pw * 0.5 + 2 * S)));
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
      ctx.lineWidth = 2.2 * S;
      ctx.stroke();
      tracePoints(ctx, offsetPath(pathPts, side * (pw * 0.5 + 5 * S)));
      ctx.strokeStyle = 'rgba(74, 118, 140, 0.18)';
      ctx.lineWidth = 1.2 * S;
      ctx.stroke();
    }
    ctx.restore();
    // glinting ice chips
    for (let i = 0; i < 26; i++) {
      const p = pathPts[Math.floor(rng() * pathPts.length)];
      if (!p) continue;
      const off = (pw * 0.5 + (3 + rng() * 12) * S) * (rng() > 0.5 ? 1 : -1);
      const x = p[0] + off;
      const y = p[1] + (rng() - 0.5) * 10 * S;
      ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + rng() * 0.5})`;
      ctx.beginPath();
      ctx.arc(x, y, (0.6 + rng() * 1.2) * S, 0, TAU);
      ctx.fill();
    }
  } else if (theme.extra === 'forest') {
    ctx.save();
    for (const side of [-1, 1]) {
      tracePoints(ctx, offsetPath(pathPts, side * (pw * 0.5 + 2 * S)));
      ctx.strokeStyle = 'rgba(48, 66, 30, 0.45)';
      ctx.lineWidth = 2 * S;
      ctx.stroke();
    }
    ctx.restore();
    for (let i = 0; i < 60; i++) {
      const p = pathPts[Math.floor(rng() * pathPts.length)];
      if (!p) continue;
      const off = (pw * 0.5 + (2 + rng() * 9) * S) * (rng() > 0.5 ? 1 : -1);
      ctx.fillStyle = `rgba(${rng() > 0.5 ? '120, 158, 72' : '88, 66, 38'}, ${0.18 + rng() * 0.22})`;
      ctx.beginPath();
      ctx.ellipse(p[0] + off, p[1] + (rng() - 0.5) * 8 * S, (1 + rng() * 2.4) * S, (0.6 + rng() * 1.1) * S, rng() * TAU, 0, TAU);
      ctx.fill();
    }
  }
}

/* Arcade foreground layers: canopy shade, snow haze, heat shimmer. */
function drawForeground(ctx, w, h, S, rng, theme, pathPts) {
  if (theme.extra === 'forest') {
    ctx.save();
    for (let i = 0; i < 7; i++) {
      const x = rng() * w;
      const y = rng() * h;
      if (distanceToPath(x, y, pathPts) < 70 * S) continue;
      const rx = (60 + rng() * 150) * S;
      ctx.fillStyle = `rgba(4, 16, 6, ${0.06 + rng() * 0.10})`;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, rx * 0.55, rng() * TAU, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  } else if (theme.extra === 'ice') {
    ctx.save();
    for (let i = 0; i < 5; i++) {
      const x = rng() * w;
      const y = rng() * h;
      const g = ctx.createRadialGradient(x, y, 0, x, y, (70 + rng() * 100) * S);
      g.addColorStop(0, 'rgba(255, 255, 255, 0.10)');
      g.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - 160 * S, y - 160 * S, 320 * S, 320 * S);
    }
    ctx.restore();
  } else if (theme.extra === 'lava') {
    ctx.save();
    for (let i = 0; i < 4; i++) {
      const x = rng() * w;
      const y = rng() * h;
      const g = ctx.createRadialGradient(x, y, 0, x, y, (90 + rng() * 120) * S);
      g.addColorStop(0, 'rgba(255, 96, 30, 0.10)');
      g.addColorStop(1, 'rgba(255, 96, 30, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - 200 * S, y - 200 * S, 400 * S, 400 * S);
    }
    ctx.restore();
  }
}

function drawSpawnCave(ctx, w, h, S, rng, theme, pathPts) {
  const start = (pathPts && pathPts[0]) || [0, h * 0.64];
  const cx = start[0] - 10 * S;
  const cy = start[1];
  const style = theme.caveStyle;

  ctx.save();
  if (style === 'bunker') {
    drawBunkerGate(ctx, cx, cy, S, rng, theme);
    ctx.restore();
    return;
  }

  const rx = (style === 'lava' ? 70 : 62) * S;
  const ry = (style === 'lava' ? 46 : 42) * S;

  // outer shadow and bank
  ctx.fillStyle = style === 'lava' ? 'rgba(0, 0, 0, 0.45)' : 'rgba(26, 42, 52, 0.28)';
  ctx.beginPath();
  ctx.ellipse(cx + 18 * S, cy + 8 * S, rx * 1.06, ry * 1.04, -0.06, 0, TAU);
  ctx.fill();

  const rim = ctx.createLinearGradient(0, cy - ry, 0, cy + ry);
  rim.addColorStop(0, theme.caveRim[0]);
  rim.addColorStop(0.5, theme.caveRim[1]);
  rim.addColorStop(1, theme.caveRim[2]);
  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU);
  ctx.fill();

  // inner darkness / glow
  const dark = ctx.createRadialGradient(cx + rx * 0.45, cy, 4, cx + rx * 0.3, cy, rx);
  dark.addColorStop(0, style === 'lava' ? '#3a0d00' : theme.caveDark[0]);
  dark.addColorStop(0.62, theme.caveDark[1]);
  dark.addColorStop(1, 'rgba(36, 25, 15, 0)');
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.ellipse(cx + 5 * S, cy, rx * 0.82, ry * 0.72, 0, 0, TAU);
  ctx.fill();

  if (style === 'ice') {
    // pale frozen rim
    ctx.strokeStyle = theme.caveLip;
    ctx.lineWidth = 2.4 * S;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx * 0.94, ry * 0.94, 0, -1.05, 1.05);
    ctx.stroke();
    // icicles
    ctx.fillStyle = 'rgba(226, 250, 255, 0.72)';
    for (let i = 0; i < 8; i++) {
      const a = -0.95 + i * 0.27;
      const ix = cx + Math.cos(a) * rx * 0.92;
      const iy = cy + Math.sin(a) * ry * 0.94;
      const len = (4 + rng() * 9) * S;
      ctx.beginPath();
      ctx.moveTo(ix - 1.6 * S, iy);
      ctx.lineTo(ix + 1.6 * S, iy);
      ctx.lineTo(ix, iy + len);
      ctx.closePath();
      ctx.fill();
    }
    // cold blue glow
    ctx.save();
    ctx.shadowColor = 'rgba(140, 220, 255, 0.8)';
    ctx.shadowBlur = 10 * S;
    ctx.fillStyle = 'rgba(170, 232, 255, 0.7)';
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(cx + rx * 0.76, cy + side * ry * 0.66, 2.2 * S, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  } else if (style === 'lava') {
    // molten lip and rising heat
    ctx.save();
    ctx.shadowColor = 'rgba(255, 96, 24, 0.95)';
    ctx.shadowBlur = 16 * S;
    ctx.strokeStyle = theme.caveLip;
    ctx.lineWidth = 3.4 * S;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx * 0.94, ry * 0.94, 0, -1.05, 1.05);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 154, 62, 0.85)';
    ctx.lineWidth = 1.4 * S;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx * 0.9, ry * 0.9, 0, 2.1, 4.15);
    ctx.stroke();
    ctx.restore();
    // fire jets
    ctx.fillStyle = 'rgba(255, 140, 40, 0.5)';
    for (let i = 0; i < 5; i++) {
      const a = -0.7 + i * 0.35;
      const fx = cx + Math.cos(a) * rx * 1.02;
      const fy = cy + Math.sin(a) * ry * 1.02;
      ctx.beginPath();
      ctx.ellipse(fx, fy, (5 + rng() * 6) * S, (2 + rng() * 3) * S, a, 0, TAU);
      ctx.fill();
    }
  } else {
    ctx.strokeStyle = theme.caveLip;
    ctx.lineWidth = 2.2 * S;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx * 0.94, ry * 0.94, 0, -1.05, 1.05);
    ctx.stroke();
    ctx.strokeStyle = theme.caveEdge;
    ctx.lineWidth = 3.2 * S;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx * 0.9, ry * 0.9, 0, 2.1, 4.15);
    ctx.stroke();
  }

  // jagged rocks on the rim
  for (let i = 0; i < 7; i++) {
    const a = -0.9 + i * 0.3 + rng() * 0.12;
    const rr = 0.98 + rng() * 0.1;
    const px = cx + Math.cos(a) * rx * rr;
    const py = cy + Math.sin(a) * ry * rr;
    drawPebble(ctx, px, py, (3 + rng() * 4) * S, rng, rng() * TAU, theme);
  }

  // warning chevrons
  ctx.save();
  ctx.translate(cx + rx * 0.78, cy);
  ctx.globalAlpha = 0.72;
  for (let i = -1; i <= 1; i++) {
    ctx.fillStyle = i === 0 ? '#dba64d' : 'rgba(20, 12, 8, 0.8)';
    ctx.save();
    ctx.translate(0, i * 10 * S);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-3.2 * S, -3.2 * S, 6.4 * S, 6.4 * S);
    ctx.restore();
  }
  ctx.restore();

  // alert lamps
  for (const side of [-1, 1]) {
    const lx = cx + rx * 0.76;
    const ly = cy + side * ry * 0.66;
    ctx.fillStyle = style === 'lava' ? 'rgba(255, 160, 60, 0.95)' : 'rgba(255, 92, 62, 0.9)';
    ctx.shadowColor = style === 'lava' ? 'rgba(255, 120, 40, 0.9)' : 'rgba(255, 80, 50, 0.9)';
    ctx.shadowBlur = 8 * S;
    ctx.beginPath();
    ctx.arc(lx, ly, 2.2 * S, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.restore();
}

/* Imperial style blast door used on Endor. */
function drawBunkerGate(ctx, cx, cy, S, rng, theme) {
  const wdt = 54 * S;
  const hgt = 66 * S;
  ctx.save();
  // shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(cx + 14 * S, cy + hgt * 0.34, wdt * 0.95, 14 * S, 0, 0, TAU);
  ctx.fill();
  // concrete shell
  ctx.fillStyle = theme.caveRim[1];
  ctx.beginPath();
  ctx.moveTo(cx - wdt * 0.72, cy + hgt * 0.6);
  ctx.lineTo(cx - wdt * 0.58, cy - hgt * 0.1);
  ctx.quadraticCurveTo(cx, cy - hgt * 0.72, cx + wdt * 0.55, cy - hgt * 0.1);
  ctx.lineTo(cx + wdt * 0.7, cy + hgt * 0.6);
  ctx.closePath();
  ctx.fill();
  // door slabs
  const g = ctx.createLinearGradient(cx - wdt * 0.5, 0, cx + wdt * 0.5, 0);
  g.addColorStop(0, '#3a3d36');
  g.addColorStop(0.5, '#565b4f');
  g.addColorStop(1, '#2c2f28');
  ctx.fillStyle = g;
  ctx.fillRect(cx - wdt * 0.42, cy - hgt * 0.26, wdt * 0.84, hgt * 0.78);
  ctx.strokeStyle = 'rgba(10, 14, 8, 0.8)';
  ctx.lineWidth = 2 * S;
  ctx.strokeRect(cx - wdt * 0.42, cy - hgt * 0.26, wdt * 0.84, hgt * 0.78);
  ctx.beginPath();
  ctx.moveTo(cx, cy - hgt * 0.26);
  ctx.lineTo(cx, cy + hgt * 0.52);
  ctx.stroke();
  // ridge lines
  ctx.strokeStyle = 'rgba(140, 150, 130, 0.25)';
  ctx.lineWidth = 1 * S;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(cx - wdt * 0.42, cy - hgt * 0.26 + i * hgt * 0.19);
    ctx.lineTo(cx + wdt * 0.42, cy - hgt * 0.26 + i * hgt * 0.19);
    ctx.stroke();
  }
  // red door lamps
  for (const side of [-1, 1]) {
    ctx.fillStyle = 'rgba(255, 74, 54, 0.95)';
    ctx.shadowColor = 'rgba(255, 70, 50, 0.9)';
    ctx.shadowBlur = 8 * S;
    ctx.beginPath();
    ctx.arc(cx + side * wdt * 0.44, cy - hgt * 0.34, 2.4 * S, 0, TAU);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
  // moss and vines
  ctx.strokeStyle = 'rgba(88, 122, 54, 0.55)';
  ctx.lineWidth = 1.6 * S;
  for (let i = 0; i < 4; i++) {
    const vx = cx - wdt * 0.5 + rng() * wdt;
    ctx.beginPath();
    ctx.moveTo(vx, cy - hgt * 0.42);
    ctx.quadraticCurveTo(vx + 4 * S, cy - hgt * 0.1, vx - 2 * S, cy + hgt * 0.16);
    ctx.stroke();
  }
  ctx.restore();
}

function distanceToPath(x, y, pts) {
  let best = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    const ax = pts[i][0], ay = pts[i][1], bx = pts[i + 1][0], by = pts[i + 1][1];
    const dx = bx - ax, dy = by - ay;
    const l2 = dx * dx + dy * dy || 1;
    let t = ((x - ax) * dx + (y - ay) * dy) / l2;
    t = clamp(t, 0, 1);
    const px = ax + dx * t, py = ay + dy * t;
    best = Math.min(best, Math.hypot(x - px, y - py));
  }
  return best;
}

function drawPebble(ctx, x, y, r, rng, rot, theme = THEMES.desert) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = theme.pebbleShadow;
  ctx.beginPath();
  ctx.ellipse(0, r * 0.3, r * 1.1, r * 0.7, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = rng() > 0.5 ? theme.pebble[0] : theme.pebble[1];
  ctx.beginPath();
  ctx.ellipse(0, 0, r, r * 0.72, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = theme.pebbleLit;
  ctx.beginPath();
  ctx.ellipse(-r * 0.22, -r * 0.22, r * 0.48, r * 0.28, -0.3, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawRock(ctx, x, y, r, rng, theme = THEMES.desert) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = theme.rockShadow;
  ctx.beginPath();
  ctx.ellipse(r * 0.3, r * 0.55, r * 1.15, r * 0.56, -0.15, 0, TAU);
  ctx.fill();

  const pts = [];
  const n = 7;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    const rr = r * (0.68 + rng() * 0.35);
    pts.push([Math.cos(a) * rr, Math.sin(a) * rr * 0.76 - r * 0.12]);
  }
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < n; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  const g = ctx.createLinearGradient(-r, -r, r, r);
  g.addColorStop(0, theme.rock[0]);
  g.addColorStop(0.55, theme.rock[1]);
  g.addColorStop(1, theme.rock[2]);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = theme.rockShadow;
  ctx.lineWidth = r * 0.09;
  ctx.stroke();

  // lit face
  ctx.beginPath();
  ctx.moveTo(-r * 0.7, -r * 0.15);
  ctx.lineTo(-r * 0.1, -r * 0.72);
  ctx.lineTo(r * 0.42, -r * 0.28);
  ctx.lineTo(-r * 0.05, -r * 0.02);
  ctx.closePath();
  ctx.fillStyle = theme.rockLit;
  ctx.fill();
  ctx.restore();
}

function drawVaporator(ctx, x, y, r, S) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(55, 33, 15, 0.3)';
  ctx.beginPath();
  ctx.ellipse(r * 0.6, r * 0.35, r * 2.1, r * 0.55, 0.1, 0, TAU);
  ctx.fill();

  const hgt = r * 6.1;
  const wdt = Math.max(2.2 * S, r * 0.6);
  const g = ctx.createLinearGradient(-wdt, 0, wdt, 0);
  g.addColorStop(0, '#6f6d64');
  g.addColorStop(0.45, '#c0bbab');
  g.addColorStop(0.7, '#9a968a');
  g.addColorStop(1, '#5a5851');
  ctx.fillStyle = g;
  ctx.fillRect(-wdt, -hgt, wdt * 2, hgt);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.fillRect(-wdt * 0.45, -hgt + 2, wdt * 0.4, hgt - 4);

  // rings
  for (let i = 1; i < 5; i++) {
    ctx.fillStyle = 'rgba(61, 58, 51, 0.4)';
    ctx.fillRect(-wdt * 1.15, -hgt * (i / 5), wdt * 2.3, Math.max(1, r * 0.18));
  }
  // head
  ctx.fillStyle = '#8f8c80';
  ctx.beginPath();
  ctx.ellipse(0, -hgt, r * 1.1, r * 0.55, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#5b594f';
  ctx.beginPath();
  ctx.ellipse(0, -hgt - r * 0.28, r * 0.7, r * 0.3, 0, 0, TAU);
  ctx.fill();
  // little solar panel
  ctx.save();
  ctx.translate(r * 1.35, -hgt * 0.74);
  ctx.rotate(-0.25);
  ctx.fillStyle = '#26333a';
  ctx.fillRect(-r * 0.9, -r * 0.45, r * 1.8, r * 0.9);
  ctx.strokeStyle = 'rgba(112, 172, 186, 0.45)';
  ctx.lineWidth = 0.6 * S;
  ctx.strokeRect(-r * 0.9, -r * 0.45, r * 1.8, r * 0.9);
  ctx.restore();
  ctx.restore();
}

function drawHut(ctx, x, y, r, S, rng) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(51, 30, 13, 0.32)';
  ctx.beginPath();
  ctx.ellipse(r * 0.55, r * 0.65, r * 1.5, r * 0.62, -0.1, 0, TAU);
  ctx.fill();

  // dome
  const g = ctx.createRadialGradient(-r * 0.4, -r * 0.5, r * 0.1, 0, 0, r * 1.25);
  g.addColorStop(0, '#e6cfa4');
  g.addColorStop(0.5, '#c8aa7b');
  g.addColorStop(1, '#9c7c52');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, Math.PI, TAU);
  ctx.quadraticCurveTo(r, r * 0.35, r * 0.8, r * 0.45);
  ctx.lineTo(-r * 0.8, r * 0.45);
  ctx.quadraticCurveTo(-r, r * 0.35, -r, 0);
  ctx.closePath();
  ctx.fill();

  // door
  ctx.fillStyle = '#3a2a1b';
  roundRect(ctx, -r * 0.26, -r * 0.42, r * 0.52, r * 0.85, r * 0.26);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 197, 100, 0.3)';
  ctx.fillRect(-r * 0.2, -r * 0.32, r * 0.4, r * 0.06);

  // antenna
  ctx.strokeStyle = '#6b5a44';
  ctx.lineWidth = Math.max(0.8 * S, r * 0.055);
  ctx.beginPath();
  ctx.moveTo(r * 0.46, -r * 0.62);
  ctx.lineTo(r * 0.72, -r * 1.4);
  ctx.stroke();
  ctx.fillStyle = '#d6b379';
  ctx.beginPath();
  ctx.arc(r * 0.72, -r * 1.4, r * 0.11, 0, TAU);
  ctx.fill();

  // seam
  ctx.strokeStyle = 'rgba(100, 72, 42, 0.4)';
  ctx.lineWidth = 0.7 * S;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.82, Math.PI * 1.06, Math.PI * 1.94);
  ctx.stroke();
  ctx.restore();
}

function drawBone(ctx, x, y, r, S, rng) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.35 + rng() * 0.7);
  ctx.fillStyle = 'rgba(54, 32, 14, 0.25)';
  ctx.beginPath();
  ctx.ellipse(r * 0.4, r * 0.32, r * 1.7, r * 0.38, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#d3bd98';
  ctx.lineWidth = Math.max(1.1 * S, r * 0.14);
  ctx.lineCap = 'round';
  // spine
  ctx.beginPath();
  ctx.moveTo(-r * 1.6, 0);
  ctx.quadraticCurveTo(0, r * 0.3, r * 1.7, -r * 0.05);
  ctx.stroke();
  // ribs
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    const rx = -r * 1.1 + t * r * 2;
    const ry = Math.sin(t * Math.PI) * r * 0.2;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.quadraticCurveTo(rx + r * 0.2, -r * 0.7, rx + r * 0.65, -r * 0.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.quadraticCurveTo(rx + r * 0.05, r * 0.4, rx + r * 0.35, r * 0.6);
    ctx.stroke();
  }
  // skull
  ctx.fillStyle = '#d8c39f';
  ctx.beginPath();
  ctx.ellipse(r * 1.48, -r * 0.15, r * 0.42, r * 0.3, 0.2, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#5a452d';
  ctx.beginPath();
  ctx.arc(r * 1.35, -r * 0.22, r * 0.08, 0, TAU);
  ctx.arc(r * 1.58, -r * 0.24, r * 0.08, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawCactus(ctx, x, y, r, S) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(53, 33, 15, 0.25)';
  ctx.beginPath();
  ctx.ellipse(r * 0.4, r * 0.15, r * 0.8, r * 0.28, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#7b7c46';
  ctx.lineWidth = Math.max(1.2 * S, r * 0.38);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, r * 0.1);
  ctx.lineTo(0, -r * 1.35);
  ctx.moveTo(0, -r * 0.4);
  ctx.quadraticCurveTo(-r * 0.65, -r * 0.55, -r * 0.65, -r * 0.95);
  ctx.moveTo(0, -r * 0.75);
  ctx.quadraticCurveTo(r * 0.55, -r * 0.9, r * 0.55, -r * 1.25);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(170, 180, 104, 0.5)';
  ctx.lineWidth = Math.max(0.5 * S, r * 0.1);
  ctx.beginPath();
  ctx.moveTo(-r * 0.12, r * 0.05);
  ctx.lineTo(-r * 0.12, -r * 1.3);
  ctx.stroke();
  ctx.restore();
}

function drawCrate(ctx, x, y, r, S, theme = THEMES.desert) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.1);
  ctx.fillStyle = theme.rockShadow;
  ctx.fillRect(-r * 0.8 + 2, -r * 0.6 + 3, r * 1.7, r * 1.3);
  ctx.fillStyle = theme.extra === 'desert' ? '#7e6441' : '#59605d';
  ctx.fillRect(-r * 0.85, -r * 0.65, r * 1.7, r * 1.3);
  ctx.strokeStyle = theme.extra === 'desert' ? '#57432b' : '#343a37';
  ctx.lineWidth = 1.2 * S;
  ctx.strokeRect(-r * 0.85, -r * 0.65, r * 1.7, r * 1.3);
  ctx.beginPath();
  ctx.moveTo(-r * 0.85, -r * 0.65);
  ctx.lineTo(r * 0.85, r * 0.65);
  ctx.moveTo(r * 0.85, -r * 0.65);
  ctx.lineTo(-r * 0.85, r * 0.65);
  ctx.strokeStyle = theme.pebbleLit;
  ctx.stroke();
  ctx.restore();
}

/* —— Hoth props —— */
function drawIceCrystal(ctx, x, y, r, S, rng) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(20, 50, 66, 0.22)';
  ctx.beginPath();
  ctx.ellipse(r * 0.2, r * 0.3, r * 1.1, r * 0.34, 0, 0, TAU);
  ctx.fill();
  const shards = 4;
  for (let i = 0; i < shards; i++) {
    const a = -0.9 + i * 0.55;
    const h = r * (1.2 + rng() * 1.8);
    const w = r * (0.22 + rng() * 0.18);
    const g = ctx.createLinearGradient(0, -h, 0, 0);
    g.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
    g.addColorStop(0.45, 'rgba(168, 220, 238, 0.85)');
    g.addColorStop(1, 'rgba(84, 140, 164, 0.55)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r * 0.2 - w, 0);
    ctx.lineTo(Math.cos(a) * h * 0.45, -h);
    ctx.lineTo(Math.cos(a) * r * 0.2 + w, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 0.6 * S;
    ctx.stroke();
  }
  ctx.restore();
}

function drawSnowdrift(ctx, x, y, r, S) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(40, 74, 92, 0.18)';
  ctx.beginPath();
  ctx.ellipse(r * 0.16, r * 0.34, r * 1.35, r * 0.4, 0, 0, TAU);
  ctx.fill();
  const g = ctx.createLinearGradient(0, -r * 0.75, 0, r * 0.3);
  g.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  g.addColorStop(0.6, 'rgba(214, 236, 244, 0.95)');
  g.addColorStop(1, 'rgba(158, 194, 210, 0.9)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.35, r * 0.72, 0, Math.PI, TAU);
  ctx.quadraticCurveTo(r * 1.35, r * 0.22, r * 0.9, r * 0.24);
  ctx.lineTo(-r * 0.9, r * 0.24);
  ctx.quadraticCurveTo(-r * 1.35, r * 0.22, -r * 1.35, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 1 * S;
  ctx.beginPath();
  ctx.ellipse(0, -r * 0.05, r * 0.85, r * 0.42, 0, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();
  ctx.restore();
}

function drawAntenna(ctx, x, y, r, S) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(40, 60, 70, 0.28)';
  ctx.beginPath();
  ctx.ellipse(r * 0.2, r * 0.25, r * 1.6, r * 0.4, 0, 0, TAU);
  ctx.fill();
  // base
  ctx.fillStyle = '#6f7f86';
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.05, r * 0.36, 0, 0, TAU);
  ctx.fill();
  // mast
  ctx.strokeStyle = '#9fb2ba';
  ctx.lineWidth = Math.max(1.2 * S, r * 0.16);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-r * 0.25, -r * 2.1);
  ctx.stroke();
  // dish
  ctx.save();
  ctx.translate(-r * 0.2, -r * 1.9);
  ctx.rotate(-0.6);
  const g = ctx.createLinearGradient(0, -r * 0.7, 0, r * 0.7);
  g.addColorStop(0, '#e5eef1');
  g.addColorStop(1, '#8799a1');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.9, r * 0.42, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#5c6c73';
  ctx.lineWidth = 0.8 * S;
  ctx.stroke();
  ctx.restore();
  // beacon
  ctx.fillStyle = 'rgba(255, 96, 70, 0.95)';
  ctx.shadowColor = 'rgba(255, 80, 60, 0.9)';
  ctx.shadowBlur = 7 * S;
  ctx.beginPath();
  ctx.arc(-r * 0.25, -r * 2.2, Math.max(1.2 * S, r * 0.14), 0, TAU);
  ctx.fill();
  ctx.restore();
}

/* —— Mustafar props —— */
function drawBasalt(ctx, x, y, r, S, rng) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(r * 0.2, r * 0.3, r * 1.15, r * 0.4, 0, 0, TAU);
  ctx.fill();
  const cols = 4;
  for (let i = 0; i < cols; i++) {
    const a = -0.8 + i * 0.5 + rng() * 0.1;
    const h = r * (1.5 + rng() * 1.6);
    const w = r * (0.3 + rng() * 0.22);
    const bx = Math.cos(a) * r * 0.5;
    const g = ctx.createLinearGradient(bx - w, 0, bx + w, 0);
    g.addColorStop(0, '#4c3731');
    g.addColorStop(0.45, '#33241f');
    g.addColorStop(1, '#1b1210');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(bx - w, 0);
    ctx.lineTo(bx - w * 0.6, -h);
    ctx.lineTo(bx + w * 0.62, -h * 0.94);
    ctx.lineTo(bx + w, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 110, 40, 0.22)';
    ctx.lineWidth = 0.7 * S;
    ctx.stroke();
  }
  ctx.restore();
}

function drawLavaPool(ctx, x, y, r, S, rng) {
  ctx.save();
  ctx.translate(x, y);
  // scorched rim
  ctx.fillStyle = 'rgba(10, 6, 5, 0.55)';
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.5, r * 0.78, 0, 0, TAU);
  ctx.fill();
  // molten glow
  ctx.shadowColor = 'rgba(255, 96, 24, 0.9)';
  ctx.shadowBlur = 18 * S;
  const g = ctx.createRadialGradient(0, -r * 0.1, r * 0.15, 0, 0, r * 1.2);
  g.addColorStop(0, 'rgba(255, 226, 150, 0.95)');
  g.addColorStop(0.35, 'rgba(255, 156, 52, 0.95)');
  g.addColorStop(0.7, 'rgba(214, 62, 16, 0.9)');
  g.addColorStop(1, 'rgba(80, 20, 6, 0.9)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.15, r * 0.55, 0, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
  // crust islands
  for (let i = 0; i < 5; i++) {
    const a = rng() * TAU;
    const d = rng() * r * 0.85;
    ctx.fillStyle = 'rgba(28, 14, 10, 0.8)';
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * d, Math.sin(a) * d * 0.5, (3 + rng() * 6) * S, (2 + rng() * 3) * S, rng() * TAU, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawPipe(ctx, x, y, r, S) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.18);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fillRect(-r * 1.8 + 2, r * 0.35, r * 3.6, r * 0.36);
  const g = ctx.createLinearGradient(0, -r * 0.7, 0, r * 0.4);
  g.addColorStop(0, '#8a7568');
  g.addColorStop(0.45, '#5c4a41');
  g.addColorStop(1, '#332621');
  ctx.fillStyle = g;
  ctx.fillRect(-r * 1.9, -r * 0.55, r * 3.8, r * 0.95);
  ctx.strokeStyle = '#241a16';
  ctx.lineWidth = 1.1 * S;
  ctx.strokeRect(-r * 1.9, -r * 0.55, r * 3.8, r * 0.95);
  // flanges
  for (const fx of [-r * 1.5, 0, r * 1.5]) {
    ctx.fillStyle = '#6f5b50';
    ctx.fillRect(fx - r * 0.16, -r * 0.68, r * 0.32, r * 1.2);
  }
  // warning stripe
  ctx.fillStyle = 'rgba(255, 176, 60, 0.65)';
  ctx.fillRect(-r * 0.55, -r * 0.28, r * 1.1, r * 0.12);
  ctx.restore();
}

/* —— Endor props —— */
function drawTree(ctx, x, y, r, S, rng, theme) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(4, 14, 5, 0.4)';
  ctx.beginPath();
  ctx.ellipse(r * 0.25, r * 0.3, r * 1.3, r * 0.4, 0, 0, TAU);
  ctx.fill();
  // trunk
  const g = ctx.createLinearGradient(-r * 0.4, 0, r * 0.4, 0);
  g.addColorStop(0, '#4a3a26');
  g.addColorStop(0.45, '#6a5537');
  g.addColorStop(1, '#2f2417');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-r * 0.38, 0);
  ctx.quadraticCurveTo(-r * 0.3, -r * 2.2, -r * 0.55, -r * 3.4);
  ctx.lineTo(r * 0.45, -r * 3.55);
  ctx.quadraticCurveTo(r * 0.28, -r * 2.1, r * 0.36, 0);
  ctx.closePath();
  ctx.fill();
  // roots
  ctx.strokeStyle = '#3c2e1d';
  ctx.lineWidth = Math.max(1.2 * S, r * 0.1);
  ctx.lineCap = 'round';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * r * 0.3, -r * 0.1);
    ctx.quadraticCurveTo(side * r * 0.9, r * 0.1, side * r * 1.2, r * 0.28);
    ctx.stroke();
  }
  // canopy
  const cy = -r * 3.3;
  for (let i = 0; i < 6; i++) {
    const a = rng() * TAU;
    const d = rng() * r * 1.15;
    const rx = r * (0.9 + rng() * 0.7);
    ctx.fillStyle = i % 2 ? 'rgba(56, 92, 42, 0.92)' : 'rgba(74, 116, 52, 0.9)';
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * d, cy + Math.sin(a) * d * 0.5, rx, rx * 0.62, rng() * TAU, 0, TAU);
    ctx.fill();
  }
  // sunlit crown
  ctx.fillStyle = 'rgba(146, 186, 92, 0.35)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.4, cy - r * 0.5, r * 0.9, r * 0.5, -0.3, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawFern(ctx, x, y, r, S, rng) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(6, 18, 6, 0.3)';
  ctx.beginPath();
  ctx.ellipse(r * 0.2, r * 0.2, r * 1.2, r * 0.32, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(104, 150, 66, 0.9)';
  ctx.lineWidth = Math.max(0.8 * S, r * 0.1);
  ctx.lineCap = 'round';
  const fronds = 7;
  for (let i = 0; i < fronds; i++) {
    const a = -Math.PI + (i / (fronds - 1)) * Math.PI;
    const len = r * (1.3 + rng() * 0.8);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(Math.cos(a) * len * 0.5, Math.sin(a) * len * 0.5 - len * 0.35, Math.cos(a) * len, Math.sin(a) * len * 0.45);
    ctx.strokeStyle = i % 2 ? 'rgba(104, 150, 66, 0.85)' : 'rgba(72, 116, 48, 0.9)';
    ctx.stroke();
  }
  ctx.restore();
}

function drawLog(ctx, x, y, r, S, rng) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.32 + rng() * 0.3);
  ctx.fillStyle = 'rgba(6, 16, 6, 0.35)';
  ctx.beginPath();
  ctx.ellipse(r * 0.15, r * 0.3, r * 1.8, r * 0.4, 0, 0, TAU);
  ctx.fill();
  const g = ctx.createLinearGradient(0, -r * 0.5, 0, r * 0.5);
  g.addColorStop(0, '#6c5637');
  g.addColorStop(0.5, '#4d3d27');
  g.addColorStop(1, '#2d2417');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(-r * 1.4, 0, r * 0.28, r * 0.5, 0, 0, TAU);
  ctx.lineTo(r * 1.3, -r * 0.5);
  ctx.ellipse(r * 1.4, 0, r * 0.28, r * 0.5, 0, 0, TAU);
  ctx.lineTo(-r * 1.4, r * 0.5);
  ctx.closePath();
  ctx.fill();
  // rings on the cut end
  ctx.strokeStyle = 'rgba(180, 152, 102, 0.5)';
  ctx.lineWidth = 0.6 * S;
  ctx.beginPath();
  ctx.ellipse(r * 1.4, 0, r * 0.16, r * 0.3, 0, 0, TAU);
  ctx.stroke();
  // moss
  ctx.strokeStyle = 'rgba(96, 140, 62, 0.6)';
  ctx.lineWidth = Math.max(0.8 * S, r * 0.08);
  ctx.beginPath();
  ctx.moveTo(-r * 1.2, -r * 0.4);
  ctx.quadraticCurveTo(0, -r * 0.7, r * 1.2, -r * 0.4);
  ctx.stroke();
  ctx.restore();
}

function drawBunker(ctx, x, y, r, S, rng) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(4, 12, 4, 0.4)';
  ctx.beginPath();
  ctx.ellipse(r * 0.2, r * 0.35, r * 1.35, r * 0.4, 0, 0, TAU);
  ctx.fill();
  // concrete block
  const g = ctx.createLinearGradient(0, -r * 0.8, 0, r * 0.3);
  g.addColorStop(0, '#8b9186');
  g.addColorStop(1, '#4a4f46');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-r * 1.1, r * 0.3);
  ctx.lineTo(-r * 0.95, -r * 0.55);
  ctx.lineTo(r * 0.85, -r * 0.55);
  ctx.lineTo(r * 1.1, r * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#333730';
  ctx.lineWidth = 1.1 * S;
  ctx.stroke();
  // slit
  ctx.fillStyle = '#111712';
  ctx.fillRect(-r * 0.62, -r * 0.3, r * 1.2, r * 0.2);
  // red lamp
  ctx.fillStyle = 'rgba(255, 84, 62, 0.95)';
  ctx.shadowColor = 'rgba(255, 70, 50, 0.9)';
  ctx.shadowBlur = 6 * S;
  ctx.beginPath();
  ctx.arc(r * 0.72, -r * 0.12, Math.max(1 * S, r * 0.09), 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
  // dish
  ctx.strokeStyle = '#6e756b';
  ctx.lineWidth = Math.max(1 * S, r * 0.08);
  ctx.beginPath();
  ctx.moveTo(-r * 0.45, -r * 0.55);
  ctx.lineTo(-r * 0.65, -r * 1.15);
  ctx.stroke();
  ctx.fillStyle = '#9aa297';
  ctx.beginPath();
  ctx.ellipse(-r * 0.68, -r * 1.2, r * 0.3, r * 0.16, -0.5, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawDecor(ctx, d, x, y, r, S, rng, theme = THEMES.desert) {
  switch (d.type) {
    case 'rock': drawRock(ctx, x, y, r, rng, theme); break;
    case 'basalt': drawBasalt(ctx, x, y, r, S, rng); break;
    case 'vaporator': drawVaporator(ctx, x, y, r, S); break;
    case 'hut': drawHut(ctx, x, y, r, S, rng); break;
    case 'bone': drawBone(ctx, x, y, r, S, rng); break;
    case 'cactus': drawCactus(ctx, x, y, r, S); break;
    case 'crate': drawCrate(ctx, x, y, r, S, theme); break;
    case 'ice': drawIceCrystal(ctx, x, y, r, S, rng); break;
    case 'snowdrift': drawSnowdrift(ctx, x, y, r, S); break;
    case 'antenna': drawAntenna(ctx, x, y, r, S); break;
    case 'lavapool': drawLavaPool(ctx, x, y, r, S, rng); break;
    case 'pipe': drawPipe(ctx, x, y, r, S); break;
    case 'tree': drawTree(ctx, x, y, r, S, rng, theme); break;
    case 'fern': drawFern(ctx, x, y, r, S, rng); break;
    case 'log': drawLog(ctx, x, y, r, S, rng); break;
    case 'bunker': drawBunker(ctx, x, y, r, S, rng); break;
    default: break;
  }
}

function drawRelayBaseStatic(ctx, x, y, m, S, rng, theme = THEMES.desert) {
  const R = clamp(m * 0.055, 22, 54);
  ctx.save();
  ctx.translate(x, y);

  // landing pad
  ctx.fillStyle = theme.rockShadow;
  ctx.beginPath();
  ctx.ellipse(0, R * 0.34, R * 1.4, R * 0.72, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = theme.pad;
  ctx.beginPath();
  ctx.ellipse(0, 0, R * 1.25, R * 0.75, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = theme.padEdge;
  ctx.lineWidth = Math.max(1.4 * S, R * 0.05);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(233, 205, 151, 0.35)';
  ctx.lineWidth = Math.max(1 * S, R * 0.035);
  ctx.beginPath();
  ctx.ellipse(0, 0, R * 0.88, R * 0.52, 0, 0, TAU);
  ctx.stroke();
  // pad stripes
  ctx.strokeStyle = 'rgba(45, 38, 28, 0.35)';
  ctx.lineWidth = Math.max(1 * S, R * 0.06);
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(-R * 0.5 + i * R * 0.35, R * 0.42);
    ctx.lineTo(-R * 0.4 + i * R * 0.35, R * 0.6);
    ctx.stroke();
  }

  // dome
  const dh = R * 0.98;
  const g = ctx.createLinearGradient(0, -dh, 0, 0);
  g.addColorStop(0, theme.dome[0]);
  g.addColorStop(0.48, theme.dome[1]);
  g.addColorStop(1, theme.dome[2]);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, -R * 0.12, dh, Math.PI, TAU);
  ctx.lineTo(dh, -R * 0.12);
  ctx.lineTo(-dh, -R * 0.12);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = theme.padEdge;
  ctx.lineWidth = Math.max(1.2 * S, R * 0.05);
  ctx.stroke();

  // reactor window (Rebel blue on every world)
  ctx.fillStyle = '#264a5c';
  roundRect(ctx, -R * 0.34, -R * 0.72, R * 0.68, R * 0.3, R * 0.15);
  ctx.fill();
  ctx.fillStyle = 'rgba(104, 225, 255, 0.85)';
  roundRect(ctx, -R * 0.27, -R * 0.67, R * 0.54, R * 0.19, R * 0.1);
  ctx.fill();

  // tower / antenna
  ctx.strokeStyle = theme.padEdge;
  ctx.lineWidth = Math.max(1.4 * S, R * 0.06);
  ctx.beginPath();
  ctx.moveTo(R * 0.52, -R * 0.35);
  ctx.lineTo(R * 0.72, -R * 1.3);
  ctx.stroke();
  ctx.fillStyle = '#e6b75f';
  ctx.beginPath();
  ctx.arc(R * 0.72, -R * 1.32, Math.max(1.4 * S, R * 0.1), 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 223, 146, 0.35)';
  ctx.lineWidth = 0.8 * S;
  ctx.beginPath();
  ctx.arc(R * 0.72, -R * 1.32, R * 0.2, 0, TAU);
  ctx.stroke();

  // side fins
  ctx.fillStyle = theme.dome[1];
  ctx.beginPath();
  ctx.moveTo(-dh * 0.9, -R * 0.14);
  ctx.lineTo(-dh * 1.25, R * 0.22);
  ctx.lineTo(-dh * 0.7, R * 0.15);
  ctx.closePath();
  ctx.fill();

  // beacon lights
  for (let i = 0; i < 3; i++) {
    const a = -0.6 + i * 0.6;
    ctx.fillStyle = i === 1 ? 'rgba(255, 208, 105, 0.9)' : 'rgba(255, 130, 95, 0.8)';
    ctx.beginPath();
    ctx.arc(Math.cos(a) * R * 1.02, Math.sin(a) * R * 0.56 + R * 0.1, Math.max(0.8 * S, R * 0.04), 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/* ============================================================
   DYNAMIC MAP PIECES
   ============================================================ */

export function drawBaseShield(ctx, w, h, time, flash, base = { x: 0.952, y: 0.60 }) {
  const m = Math.min(w, h);
  const R = clamp(m * 0.055, 22, 54);
  const x = w * base.x;
  const y = h * base.y - R * 0.12;
  const pulse = 0.06 + Math.sin(time * 1.7) * 0.015 + flash * 0.22;
  ctx.save();
  ctx.translate(x, y);
  const rad = R * 1.55;
  const g = ctx.createRadialGradient(0, -R * 0.2, rad * 0.25, 0, -R * 0.2, rad);
  g.addColorStop(0, `rgba(112, 225, 255, ${0.035 + flash * 0.1})`);
  g.addColorStop(0.7, `rgba(80, 190, 230, ${0.06 + pulse * 0.15})`);
  g.addColorStop(1, 'rgba(80, 190, 230, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, -R * 0.2, rad, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = `rgba(122, 226, 255, ${0.22 + pulse + flash * 0.4})`;
  ctx.lineWidth = 1.2;
  ctx.setLineDash([3, 5]);
  ctx.lineDashOffset = -time * 12;
  ctx.beginPath();
  ctx.arc(0, -R * 0.2, rad * 0.82, 0, TAU);
  ctx.stroke();
  ctx.setLineDash([]);
  // beacon blink
  const blink = (Math.sin(time * 3.2) + 1) * 0.5;
  ctx.fillStyle = `rgba(255, 205, 100, ${0.3 + blink * 0.7})`;
  ctx.shadowColor = 'rgba(255, 200, 90, 0.8)';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(R * 0.72, -R * 1.32, 1.6, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/* ============================================================
   TOWERS
   ============================================================ */

export function drawRange(ctx, x, y, r, color = '#f1c76f', alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const g = ctx.createRadialGradient(x, y, r * 0.15, x, y, r);
  g.addColorStop(0, 'rgba(255,255,255,0.015)');
  g.addColorStop(0.75, color + '12');
  g.addColorStop(1, color + '24');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = color + 'aa';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([5, 6]);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

export function drawTowerShadow(ctx, tower, S) {
  ctx.save();
  ctx.translate(tower.x, tower.y);
  ctx.fillStyle = 'rgba(47, 29, 12, 0.30)';
  ctx.beginPath();
  ctx.ellipse(3 * S, 6 * S, 22 * S * TOWER_ART, 11 * S * TOWER_ART, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function drawTower(ctx, tower, time, S, selected = false, alpha = 1) {
  const def = TOWERS[tower.type];
  if (!def) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(tower.x, tower.y);
  ctx.scale(S * TOWER_ART, S * TOWER_ART);
  const ang = tower.angle || 0;
  const lvl = tower.level || 1;
  const accent = def.color;

  // base pad
  ctx.fillStyle = 'rgba(42, 27, 13, 0.22)';
  ctx.beginPath();
  ctx.ellipse(2, 5, 19.5, 10.5, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#39362f';
  ctx.beginPath();
  ctx.arc(0, 0, 17, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#5f5a50';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  // pad rim
  const rim = ctx.createLinearGradient(0, -17, 0, 17);
  rim.addColorStop(0, '#8d8679');
  rim.addColorStop(0.5, '#6b655b');
  rim.addColorStop(1, '#45413a');
  ctx.strokeStyle = rim;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(0, 0, 15.4, 0, TAU);
  ctx.stroke();
  ctx.fillStyle = '#2c2a25';
  ctx.beginPath();
  ctx.arc(0, 0, 13.6, 0, TAU);
  ctx.fill();
  // faction ring
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.36 + Math.sin(time * 2.2 + (tower.phase || 0)) * 0.05;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.1;
  ctx.beginPath();
  ctx.arc(0, 0, 14.3, 0, TAU);
  ctx.stroke();
  ctx.restore();
  // level pips
  for (let i = 0; i < 4; i++) {
    const a = -Math.PI / 2 + (i - 1.5) * 0.38;
    ctx.fillStyle = i < lvl ? accent : 'rgba(255,255,255,0.10)';
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 16.5, Math.sin(a) * 16.5, 1.35, 0, TAU);
    ctx.fill();
  }

  if (tower.type === 'scout') {
    drawScout(ctx, ang, tower, lvl, accent, time);
  } else if (tower.type === 'ion') {
    drawIon(ctx, ang, tower, lvl, accent, time);
  } else if (tower.type === 'rocket') {
    drawRocketPod(ctx, ang, tower, lvl, accent);
  } else if (tower.type === 'laser') {
    drawLaser(ctx, ang, tower, lvl, accent, time);
  } else if (tower.type === 'jedi') {
    drawJedi(ctx, ang, tower, lvl, accent, time);
  } else if (tower.type === 'bounty') {
    drawBounty(ctx, ang, tower, lvl, accent, time);
  }

  if (selected) {
    ctx.strokeStyle = 'rgba(255, 225, 160, 0.95)';
    ctx.lineWidth = 1.4;
    ctx.setLineDash([4, 5]);
    ctx.lineDashOffset = -time * 22;
    ctx.beginPath();
    ctx.arc(0, 0, 21.5, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    // brackets
    ctx.strokeStyle = '#ffe9b0';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + time * 0.45;
      const r1 = 24.5;
      ctx.beginPath();
      ctx.arc(0, 0, r1, a - 0.1, a + 0.1);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawScout(ctx, ang, tower, lvl, accent, time) {
  const recoil = tower.recoil || 0;
  // body
  ctx.fillStyle = '#4a5058';
  ctx.beginPath();
  ctx.arc(0, -1, 9.3, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#7b838d';
  ctx.lineWidth = 1;
  ctx.stroke();
  // twin barrels
  ctx.save();
  ctx.rotate(ang);
  const back = -recoil * 2.4;
  for (const side of [-1.9, 1.9]) {
    ctx.fillStyle = '#9aa4af';
    roundRect(ctx, 5 + back, side - 1.15, 15, 2.3, 1.1);
    ctx.fill();
    ctx.fillStyle = '#3a3f46';
    ctx.fillRect(17.5 + back, side - 1.25, 2.2, 2.5);
  }
  // housing
  ctx.fillStyle = '#33383f';
  roundRect(ctx, 2 + back, -4.2, 8, 8.4, 2.4);
  ctx.fill();
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(4.5 + back, 0, 2.4, 0, TAU);
  ctx.fill();
  if (lvl >= 3) {
    ctx.fillStyle = '#c7d2de';
    roundRect(ctx, 9 + back, -5.6, 12, 1.7, 0.85);
    ctx.fill();
    roundRect(ctx, 9 + back, 3.9, 12, 1.7, 0.85);
    ctx.fill();
  }
  ctx.restore();
  // helmet on top
  ctx.fillStyle = '#e8e4d8';
  ctx.beginPath();
  ctx.arc(-2.5, -6.5, 3.5, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#25282c';
  ctx.beginPath();
  ctx.arc(-1.4, -6.8, 2.4, -0.5, 1.4);
  ctx.fill();
  // antenna
  ctx.strokeStyle = '#aeb6bf';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-4, -9.6);
  ctx.lineTo(-6, -13.2);
  ctx.stroke();
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(-6, -13.2, 1.1, 0, TAU);
  ctx.fill();
}

function drawIon(ctx, ang, tower, lvl, accent, time) {
  // struts
  ctx.strokeStyle = '#5c6d76';
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 3; i++) {
    const a = i * (TAU / 3) + 0.5;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 6, Math.sin(a) * 6);
    ctx.lineTo(Math.cos(a) * 11, Math.sin(a) * 11);
    ctx.stroke();
  }
  // glowing core
  const pulse = 0.75 + Math.sin(time * 3 + (tower.phase || 0)) * 0.18;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(0, -1, 0.5, 0, -1, 12 * pulse);
  g.addColorStop(0, 'rgba(210, 250, 255, 0.95)');
  g.addColorStop(0.3, 'rgba(103, 220, 245, 0.55)');
  g.addColorStop(1, 'rgba(40, 140, 180, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, -1, 12 * pulse, 0, TAU);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#24424f';
  ctx.beginPath();
  ctx.arc(0, -1, 6.2, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, -1, 6.2, 0, TAU);
  ctx.stroke();
  ctx.fillStyle = '#c8f8ff';
  ctx.beginPath();
  ctx.arc(0, -1, 2.7, 0, TAU);
  ctx.fill();

  // dish arms
  ctx.save();
  ctx.rotate(ang);
  ctx.strokeStyle = '#84b7c4';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-9, 0);
  ctx.lineTo(9, 0);
  ctx.stroke();
  ctx.fillStyle = '#4b6d78';
  roundRect(ctx, 7, -3.5, 5, 7, 1.5);
  ctx.fill();
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(10, 0, 1.8, 0, TAU);
  ctx.fill();
  if (lvl >= 2) {
    ctx.strokeStyle = 'rgba(130, 235, 255, 0.55)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(0, 0, 12, -0.7, 0.7);
    ctx.stroke();
  }
  ctx.restore();

  if (lvl >= 3) {
    // satellite ring
    ctx.strokeStyle = 'rgba(130, 235, 255, 0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, -1, 13, 4.8, time * 0.8, 0, TAU);
    ctx.stroke();
  }
}

function drawRocketPod(ctx, ang, tower, lvl, accent) {
  ctx.save();
  ctx.rotate(ang);
  const recoil = (tower.recoil || 0) * 2.5;
  // main pod
  ctx.fillStyle = '#4a443b';
  roundRect(ctx, -8 - recoil, -8.4, 19, 16.8, 3.4);
  ctx.fill();
  ctx.strokeStyle = '#7b7161';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // tubes
  const cols = lvl >= 2 ? 3 : 2;
  const rows = lvl >= 3 ? 3 : 2;
  for (let cx = 0; cx < cols; cx++) {
    for (let cy = 0; cy < rows; cy++) {
      const tx = 8 - cols * 2.1 + cx * 4.2;
      const ty = -rows * 2 + cy * 4 + (rows === 3 ? -0.4 : 0.4);
      ctx.fillStyle = '#241f19';
      ctx.beginPath();
      ctx.arc(tx - recoil, ty, 1.65, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 131, 71, 0.7)';
      ctx.beginPath();
      ctx.arc(tx - recoil, ty, 0.8, 0, TAU);
      ctx.fill();
    }
  }
  // targeting sensor
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(-1 - recoil, 0, 2, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 220, 170, 0.8)';
  ctx.beginPath();
  ctx.arc(-1 - recoil, 0, 0.7, 0, TAU);
  ctx.fill();
  // fins
  ctx.fillStyle = '#6f6555';
  ctx.beginPath();
  ctx.moveTo(-8, -8.4);
  ctx.lineTo(-13, -10.2);
  ctx.lineTo(-9.5, -5.2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-8, 8.4);
  ctx.lineTo(-13, 10.2);
  ctx.lineTo(-9.5, 5.2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawLaser(ctx, ang, tower, lvl, accent, time) {
  // tripod
  ctx.strokeStyle = '#686458';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const a = i * (TAU / 3) + 0.3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * 9, Math.sin(a) * 9);
    ctx.stroke();
  }
  ctx.save();
  ctx.rotate(ang);
  // emitter housing
  ctx.fillStyle = '#3b3633';
  roundRect(ctx, -5, -5, 7, 10, 2.2);
  ctx.fill();
  // crystal
  const pulse = 0.85 + Math.sin(time * 5 + (tower.phase || 0)) * 0.15;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(0, 0, 0.5, 0, 0, 10 * pulse);
  g.addColorStop(0, 'rgba(255, 240, 220, 0.9)');
  g.addColorStop(0.35, 'rgba(255, 110, 92, 0.5)');
  g.addColorStop(1, 'rgba(255, 80, 60, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, 10 * pulse, 0, TAU);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#ff8c78';
  ctx.beginPath();
  ctx.moveTo(2, 0);
  ctx.lineTo(-1.8, -4.2);
  ctx.lineTo(-4.2, 0);
  ctx.lineTo(-1.8, 4.2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffe7d8';
  ctx.beginPath();
  ctx.arc(0.3, -0.5, 1.2, 0, TAU);
  ctx.fill();
  // barrel
  ctx.fillStyle = '#8e877d';
  roundRect(ctx, 5, -1.9, 14, 3.8, 1.5);
  ctx.fill();
  ctx.fillStyle = '#c8c0b3';
  roundRect(ctx, 17.5, -2.3, 2.4, 4.6, 1);
  ctx.fill();
  if (lvl >= 2) {
    ctx.fillStyle = '#5f5950';
    roundRect(ctx, 7, -4.9, 9, 1.6, 0.8);
    ctx.fill();
    roundRect(ctx, 7, 3.3, 9, 1.6, 0.8);
    ctx.fill();
  }
  ctx.restore();

  // cooling ring
  ctx.strokeStyle = `rgba(255, 122, 100, ${0.2 + Math.sin(time * 2.4) * 0.08})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 12.5, 0, TAU);
  ctx.stroke();
}

function drawJedi(ctx, ang, tower, lvl, accent, time) {
  // robed figure
  ctx.fillStyle = '#2b3d4d';
  ctx.beginPath();
  ctx.arc(0, 0, 7.8, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#4c7b9e';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#1c2c3a';
  ctx.beginPath();
  ctx.ellipse(-0.8, -0.8, 5.4, 4.6, 0, 0, TAU);
  ctx.fill();
  // hood
  ctx.fillStyle = '#314b60';
  ctx.beginPath();
  ctx.arc(0, -2.4, 3.9, Math.PI * 0.86, Math.PI * 2.14);
  ctx.fill();
  // sabers
  const spin = time * (lvl >= 3 ? 4.2 : 3.2) + (tower.phase || 0);
  const blades = lvl >= 4 ? 2 : 1;
  for (let b = 0; b < blades; b++) {
    const a = spin + b * Math.PI;
    ctx.save();
    ctx.rotate(a);
    ctx.strokeStyle = 'rgba(110, 205, 255, 0.18)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.lineTo(24, 0);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(125, 212, 255, 0.9)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.lineTo(23, 0);
    ctx.stroke();
    ctx.strokeStyle = '#f0fbff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(7, 0);
    ctx.lineTo(23, 0);
    ctx.stroke();
    // hilt
    ctx.strokeStyle = '#aab6bf';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(2.5, 0);
    ctx.lineTo(6, 0);
    ctx.stroke();
    ctx.restore();
  }
  if (lvl >= 2) {
    ctx.strokeStyle = 'rgba(110, 200, 255, 0.22)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 13.5, time * 0.7, time * 0.7 + 2.2);
    ctx.stroke();
  }
}

function drawBounty(ctx, ang, tower, lvl, accent, time) {
  ctx.save();
  ctx.rotate(ang);
  const recoil = (tower.recoil || 0) * 3;
  // cloak
  ctx.fillStyle = '#3f3a31';
  ctx.beginPath();
  ctx.ellipse(-3 - recoil, 0, 8.5, 7.6, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#6f6552';
  ctx.lineWidth = 1;
  ctx.stroke();
  // rifle
  ctx.fillStyle = '#2c2924';
  roundRect(ctx, 2 - recoil, -1.6, 23, 3.2, 1.2);
  ctx.fill();
  ctx.fillStyle = '#8e806b';
  roundRect(ctx, 18 - recoil, -2.2, 7.5, 4.4, 1.2);
  ctx.fill();
  ctx.fillStyle = '#5b5244';
  roundRect(ctx, 4 - recoil, -4.2, 7, 2, 0.8);
  ctx.fill();
  // scope glint
  const glint = 0.55 + Math.sin(time * 2.2 + (tower.phase || 0)) * 0.4;
  ctx.fillStyle = `rgba(255, 214, 130, ${glint})`;
  ctx.beginPath();
  ctx.arc(9 - recoil, -3.2, 1.3, 0, TAU);
  ctx.fill();
  // helmet
  ctx.fillStyle = '#6b5b49';
  ctx.beginPath();
  ctx.arc(1.5 - recoil, -0.5, 4.2, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#221e19';
  ctx.beginPath();
  ctx.arc(2.8 - recoil, -1.1, 2.3, -0.6, 1.2);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(-0.3 - recoil, 0.3);
  ctx.lineTo(3.5 - recoil, -0.2);
  ctx.stroke();
  ctx.restore();

  if (lvl >= 4) {
    ctx.strokeStyle = `rgba(255, 195, 110, ${0.16 + Math.sin(time * 2) * 0.05})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, TAU);
    ctx.stroke();
  }
}

/* ============================================================
   ENEMIES
   ============================================================ */

export function drawEnemy(ctx, e, time, S) {
  const def = ENEMY_TYPES[e.type];
  if (!def) return;
  const slow = e.slowT > 0;
  const flash = e.hitFlash > 0;
  const V = S * ENEMY_ART;

  ctx.save();
  ctx.translate(e.x, e.y);
  // shadow
  const body = def.body || 'droid';
  const bob = body === 'speeder' || body === 'probe' ? Math.sin(time * 8 + e.phase) * 1.2 * V : 0;
  ctx.fillStyle = 'rgba(20, 16, 12, 0.28)';
  ctx.beginPath();
  ctx.ellipse(2 * V, (def.radius * 0.62 + 3) * V, def.radius * 0.95 * V, def.radius * 0.4 * V, 0, 0, TAU);
  ctx.fill();

  ctx.translate(0, bob);
  ctx.rotate(e.angle || 0);
  ctx.scale(V, V);

  if (body === 'droid') drawDroidBody(ctx, e, time, slow);
  else if (body === 'speeder') drawSpeederBody(ctx, e, time, def);
  else if (body === 'superdroid') drawSuperDroidBody(ctx, e, time, def);
  else if (body === 'droidboss') drawDroidBossBody(ctx, e, time);
  else if (body === 'trooper') drawTrooperBody(ctx, e, time, def);
  else if (body === 'probe') drawProbeBody(ctx, e, time, def);
  else if (body === 'walker') drawWalkerBody(ctx, e, time, def);
  else if (body === 'atat') drawAtAtBody(ctx, e, time, def);
  else if (body === 'skitter') drawSkitterBody(ctx, e, time, def);
  else if (body === 'sith') drawSithBody(ctx, e, time, def);

  if (flash) {
    ctx.globalAlpha = 0.55 * Math.min(1, flash / 0.09);
    ctx.fillStyle = '#fff5e0';
    ctx.beginPath();
    ctx.arc(0, 0, def.radius * 0.9, 0, TAU);
    ctx.fill();
  }
  if (slow) {
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = 'rgba(110, 225, 255, 0.9)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(0, 0, def.radius + 2.4, 0, TAU);
    ctx.stroke();
    for (let i = 0; i < 3; i++) {
      const a = time * 3 + i * 2.1 + (e.phase || 0);
      ctx.fillStyle = 'rgba(160, 240, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(Math.cos(a) * (def.radius + 2), Math.sin(a) * (def.radius + 2), 0.9, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();

  // health bar
  const showBar = e.hp < e.maxHp - 0.2 || def.boss;
  if (showBar) {
    const bw = (def.boss ? 46 : Math.max(18, def.radius * 1.9)) * V;
    const bh = (def.boss ? 4 : 2.6) * V;
    const bx = e.x - bw / 2;
    const by = e.y - (def.radius * V + 9 * S);
    ctx.fillStyle = 'rgba(25, 15, 8, 0.72)';
    roundRect(ctx, bx - 1, by - 1, bw + 2, bh + 2, 2);
    ctx.fill();
    const pct = clamp(e.hp / e.maxHp, 0, 1);
    const col = pct > 0.55 ? '#8fd45f' : pct > 0.25 ? '#e7b84c' : '#ef6a4f';
    ctx.fillStyle = col;
    roundRect(ctx, bx, by, Math.max(0.5, bw * pct), bh, 1.5);
    ctx.fill();
    if (def.boss) {
      ctx.fillStyle = 'rgba(255, 214, 150, 0.8)';
      ctx.fillRect(bx + bw * 0.5 - 0.5, by - 1, 1, bh + 2);
    }
  }
}

function drawDroidBody(ctx, e, time, slow) {
  const walk = Math.sin(time * 11 + (e.phase || 0)) * 0.8;
  // legs
  ctx.strokeStyle = '#7c6139';
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-3, -5);
  ctx.lineTo(-6 + walk, -9);
  ctx.moveTo(-3, 5);
  ctx.lineTo(-6 - walk, 9);
  ctx.moveTo(4, -5);
  ctx.lineTo(8 - walk * 0.5, -9);
  ctx.moveTo(4, 5);
  ctx.lineTo(8 + walk * 0.5, 9);
  ctx.stroke();
  // body
  const g = ctx.createLinearGradient(0, -8, 0, 8);
  g.addColorStop(0, '#eacb92');
  g.addColorStop(0.5, '#c29a5b');
  g.addColorStop(1, '#886638');
  ctx.fillStyle = g;
  roundRect(ctx, -9, -6.5, 16, 13, 4);
  ctx.fill();
  ctx.strokeStyle = '#5f4526';
  ctx.lineWidth = 1.1;
  ctx.stroke();
  // chest plate
  ctx.fillStyle = '#a88755';
  roundRect(ctx, -5, -4.5, 8, 9, 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 235, 190, 0.4)';
  ctx.fillRect(-4, -3.4, 5, 1);
  // head
  ctx.fillStyle = '#d2b27d';
  roundRect(ctx, 5, -4, 8.5, 8, 3);
  ctx.fill();
  ctx.strokeStyle = '#5f4526';
  ctx.stroke();
  // eyes
  ctx.fillStyle = '#ff5c48';
  ctx.shadowColor = 'rgba(255, 80, 60, 0.8)';
  ctx.shadowBlur = 3;
  ctx.beginPath();
  ctx.arc(10, -2.3, 1.25, 0, TAU);
  ctx.arc(10, 2.3, 1.25, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
  // antenna
  ctx.strokeStyle = '#9d7c4a';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(7.5, -1.5);
  ctx.lineTo(4, -7);
  ctx.stroke();
}

const SPEEDER_PALETTES = {
  stap: {
    thrust: '160, 255, 110', hull: '#4e5b56', edge: '#87978e', pod: '#6d7c74',
    rider: '#3a413d', head: '#23282a', visor: '#a8ff6c', glow: 'rgba(174, 255, 118, 0.85)',
    glowShadow: 'rgba(160, 255, 100, 0.85)',
  },
  biker: {
    thrust: '140, 220, 255', hull: '#c8d1d5', edge: '#77868e', pod: '#a2afb6',
    rider: '#eef3f5', head: '#2a3033', visor: '#9ff0ff', glow: 'rgba(150, 232, 255, 0.9)',
    glowShadow: 'rgba(140, 225, 255, 0.85)',
  },
};

function drawSpeederBody(ctx, e, time, def) {
  const p = SPEEDER_PALETTES[def.palette] || SPEEDER_PALETTES.stap;
  const flap = Math.sin(time * 12 + (e.phase || 0)) * 0.7;
  // thruster trail
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const tg = ctx.createLinearGradient(-8, 0, -27, 0);
  tg.addColorStop(0, `rgba(${p.thrust}, 0.5)`);
  tg.addColorStop(1, `rgba(${p.thrust}, 0)`);
  ctx.fillStyle = tg;
  ctx.beginPath();
  ctx.moveTo(-7, -3);
  ctx.lineTo(-27, 0);
  ctx.lineTo(-7, 3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // hover bike
  ctx.fillStyle = p.hull;
  roundRect(ctx, -10, -4.2, 19, 8.4, 3.5);
  ctx.fill();
  ctx.strokeStyle = p.edge;
  ctx.lineWidth = 0.9;
  ctx.stroke();
  // side pods
  ctx.fillStyle = p.pod;
  roundRect(ctx, -9, -8, 10, 3.2, 1.6);
  ctx.fill();
  roundRect(ctx, -9, 4.8, 10, 3.2, 1.6);
  ctx.fill();
  // rider
  ctx.fillStyle = p.rider;
  ctx.beginPath();
  ctx.ellipse(1, 0, 4.4, 3.6, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = p.head;
  ctx.beginPath();
  ctx.arc(4, 0, 2.7, 0, TAU);
  ctx.fill();
  ctx.fillStyle = p.visor;
  ctx.shadowColor = p.glowShadow;
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.arc(5.4, 0, 1.15, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
  // fins
  ctx.strokeStyle = p.edge;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-8, -5);
  ctx.lineTo(-12 - flap, -7.5);
  ctx.moveTo(-8, 5);
  ctx.lineTo(-12 + flap, 7.5);
  ctx.stroke();
  // engine glows
  ctx.fillStyle = p.glow;
  ctx.beginPath();
  ctx.arc(-9.5, -5, 1.3, 0, TAU);
  ctx.arc(-9.5, 5, 1.3, 0, TAU);
  ctx.fill();
}

const SUPER_PALETTES = {
  b2: {
    leg: '#5a3a2d', body: ['#b7765b', '#8d5341', '#63392d'], edge: '#3f2119',
    shoulder: '#a36950', core: '#40251d', coreGlow: 'rgba(255, 122, 80, 0.85)',
    head: '#a56a51', headEdge: '#5a3427', eye: '#ff5f47', cannon: '#54463c',
  },
  mining: {
    leg: '#3b332e', body: ['#7a6a5e', '#564840', '#332923'], edge: '#1c1613',
    shoulder: '#6d5d52', core: '#201713', coreGlow: 'rgba(255, 150, 55, 0.92)',
    head: '#695a50', headEdge: '#2a211c', eye: '#ffb14d', cannon: '#453a32',
  },
};

function drawSuperDroidBody(ctx, e, time, def) {
  const p = SUPER_PALETTES[def.palette] || SUPER_PALETTES.b2;
  const walk = Math.sin(time * 8 + (e.phase || 0)) * 1.1;
  // legs
  ctx.strokeStyle = p.leg;
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-4, -8);
  ctx.lineTo(-8 + walk, -13);
  ctx.moveTo(-4, 8);
  ctx.lineTo(-8 - walk, 13);
  ctx.moveTo(4, -8);
  ctx.lineTo(9, -13 + walk * 0.3);
  ctx.moveTo(4, 8);
  ctx.lineTo(9, 13 - walk * 0.3);
  ctx.stroke();
  // body
  const g = ctx.createLinearGradient(0, -11, 0, 11);
  g.addColorStop(0, p.body[0]);
  g.addColorStop(0.5, p.body[1]);
  g.addColorStop(1, p.body[2]);
  ctx.fillStyle = g;
  roundRect(ctx, -13, -9.5, 22, 19, 4.5);
  ctx.fill();
  ctx.strokeStyle = p.edge;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // shoulder plates
  ctx.fillStyle = p.shoulder;
  roundRect(ctx, -6, -13, 10, 5, 2);
  ctx.fill();
  roundRect(ctx, -6, 8, 10, 5, 2);
  ctx.fill();
  // chest core
  ctx.fillStyle = p.core;
  roundRect(ctx, -3, -5.5, 10, 11, 2.5);
  ctx.fill();
  ctx.fillStyle = p.coreGlow;
  ctx.shadowColor = p.coreGlow;
  ctx.shadowBlur = 5;
  ctx.beginPath();
  ctx.arc(2, 0, 2.1, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
  // head
  ctx.fillStyle = p.head;
  roundRect(ctx, 7.5, -5, 8, 10, 3);
  ctx.fill();
  ctx.strokeStyle = p.headEdge;
  ctx.stroke();
  ctx.fillStyle = p.eye;
  ctx.beginPath();
  ctx.arc(12, -2.3, 1.2, 0, TAU);
  ctx.arc(12, 2.3, 1.2, 0, TAU);
  ctx.fill();
  // cannon
  ctx.fillStyle = p.cannon;
  roundRect(ctx, 11, -1, 12, 2, 0.9);
  ctx.fill();
}

function drawDroidBossBody(ctx, e, time) {
  // treads
  ctx.fillStyle = '#332b26';
  roundRect(ctx, -27, -20, 44, 10, 4);
  ctx.fill();
  roundRect(ctx, -27, 10, 44, 10, 4);
  ctx.fill();
  // tread links
  ctx.strokeStyle = 'rgba(148, 122, 92, 0.5)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 6; i++) {
    const tx = -23 + ((i * 8 + time * 26) % 36);
    ctx.beginPath();
    ctx.moveTo(tx, -19);
    ctx.lineTo(tx, -11);
    ctx.moveTo(tx, 11);
    ctx.lineTo(tx, 19);
    ctx.stroke();
  }
  // hull
  const g = ctx.createLinearGradient(0, -18, 0, 18);
  g.addColorStop(0, '#a0846c');
  g.addColorStop(0.45, '#775d49');
  g.addColorStop(1, '#4c392c');
  ctx.fillStyle = g;
  roundRect(ctx, -24, -16, 44, 32, 7);
  ctx.fill();
  ctx.strokeStyle = '#3a2b20';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  // armor plates
  ctx.fillStyle = 'rgba(199, 169, 130, 0.35)';
  roundRect(ctx, -20, -12, 18, 7, 2);
  ctx.fill();
  roundRect(ctx, -20, 5, 18, 7, 2);
  ctx.fill();
  // turret
  ctx.fillStyle = '#6a5140';
  ctx.beginPath();
  ctx.arc(4, 0, 12.5, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#3f2f25';
  ctx.stroke();
  ctx.fillStyle = '#8d7159';
  ctx.beginPath();
  ctx.arc(4, 0, 8.5, 0, TAU);
  ctx.fill();
  // reactor core
  const pulse = 0.8 + Math.sin(time * 4 + (e.phase || 0)) * 0.2;
  ctx.fillStyle = 'rgba(255, 128, 59, 0.95)';
  ctx.shadowColor = 'rgba(255, 100, 40, 1)';
  ctx.shadowBlur = 12 * pulse;
  ctx.beginPath();
  ctx.arc(4, 0, 4.4, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffe2b0';
  ctx.beginPath();
  ctx.arc(4, 0, 1.8, 0, TAU);
  ctx.fill();
  // barrels
  ctx.fillStyle = '#4b3a2d';
  roundRect(ctx, 13, -9, 18, 3.4, 1.5);
  ctx.fill();
  roundRect(ctx, 13, 5.6, 18, 3.4, 1.5);
  ctx.fill();
  // command antenna
  ctx.strokeStyle = '#c7a77e';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-4, -16);
  ctx.lineTo(-10, -25);
  ctx.stroke();
  ctx.fillStyle = '#ffb05e';
  ctx.beginPath();
  ctx.arc(-10, -25, 1.8, 0, TAU);
  ctx.fill();
}

/* —— Imperial troopers (Hoth / Mustafar / Endor) —— */
const TROOPER_PALETTES = {
  snow: {
    armor: '#eef4f6', mid: '#c2d3da', dark: '#8ba2ad', edge: '#5f7a86',
    visor: '#16262e', trim: '#7fa2b3', pack: '#5d7783', glow: 'rgba(130, 210, 255, 0.75)',
  },
  storm: {
    armor: '#f4f6f3', mid: '#ccd2cf', dark: '#8f9793', edge: '#5f6864',
    visor: '#22282a', trim: '#6d7772', pack: '#4c5551', glow: 'rgba(120, 220, 255, 0.6)',
  },
  magma: {
    armor: '#4b332c', mid: '#31201b', dark: '#1c1210', edge: '#120a08',
    visor: '#ff8a34', trim: '#ff7a2a', pack: '#3a2620', glow: 'rgba(255, 130, 45, 0.95)',
  },
  commando: {
    armor: '#565c62', mid: '#393e43', dark: '#22262a', edge: '#141719',
    visor: '#ff5644', trim: '#8e2420', pack: '#262a2e', glow: 'rgba(255, 76, 54, 0.8)',
  },
};

function drawTrooperBody(ctx, e, time, def) {
  const p = TROOPER_PALETTES[def.palette] || TROOPER_PALETTES.storm;
  const walk = Math.sin(time * 10 + (e.phase || 0)) * 1.1;

  // legs
  ctx.strokeStyle = p.dark;
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-3, -5);
  ctx.lineTo(-7 + walk, -10);
  ctx.lineTo(-3 + walk, -13);
  ctx.moveTo(-3, 5);
  ctx.lineTo(-7 - walk, 10);
  ctx.lineTo(-3 - walk, 13);
  ctx.stroke();
  // boots
  ctx.strokeStyle = p.edge;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(-3 + walk, -13);
  ctx.lineTo(1 + walk, -13.5);
  ctx.moveTo(-3 - walk, 13);
  ctx.lineTo(1 - walk, 13.5);
  ctx.stroke();

  // torso
  const g = ctx.createLinearGradient(0, -8, 0, 8);
  g.addColorStop(0, p.armor);
  g.addColorStop(0.55, p.mid);
  g.addColorStop(1, p.dark);
  ctx.fillStyle = g;
  roundRect(ctx, -8, -6.5, 14, 13, 3.5);
  ctx.fill();
  ctx.strokeStyle = p.edge;
  ctx.lineWidth = 1;
  ctx.stroke();
  // chest plate
  ctx.fillStyle = p.mid;
  roundRect(ctx, -5, -4.5, 8, 9, 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.lineWidth = 0.6;
  ctx.stroke();
  // belt
  ctx.fillStyle = p.edge;
  ctx.fillRect(-6, -1.4, 10, 2.8);

  // backpack
  ctx.fillStyle = p.pack;
  roundRect(ctx, -11, -5, 4.5, 10, 1.8);
  ctx.fill();
  ctx.strokeStyle = p.edge;
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.fillStyle = p.glow;
  ctx.fillRect(-9.8, -3.4, 1.4, 6.8);

  // helmet
  ctx.fillStyle = p.armor;
  roundRect(ctx, 5, -4.6, 9, 9.2, 3.6);
  ctx.fill();
  ctx.strokeStyle = p.edge;
  ctx.lineWidth = 1;
  ctx.stroke();
  // visor / face
  ctx.fillStyle = p.visor;
  roundRect(ctx, 8.4, -3.4, 4.4, 6.8, 2);
  ctx.fill();
  if (def.palette === 'magma') {
    ctx.shadowColor = p.glow;
    ctx.shadowBlur = 6;
    ctx.fillStyle = p.glow;
    roundRect(ctx, 9.4, -2.2, 2.4, 4.4, 1);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  // helmet trim
  ctx.strokeStyle = p.trim;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(5.6, -1.6);
  ctx.lineTo(13.4, -1.6);
  ctx.stroke();

  // blaster
  ctx.fillStyle = p.edge;
  roundRect(ctx, 8, 2.4, 13, 2.2, 1);
  ctx.fill();
  ctx.fillStyle = p.mid;
  roundRect(ctx, 9, 1.2, 5, 3.6, 1.4);
  ctx.fill();
}

/* —— Probe droid —— */
function drawProbeBody(ctx, e, time, def) {
  const wobble = Math.sin(time * 6 + (e.phase || 0)) * 0.6;
  // dangling manipulators
  ctx.strokeStyle = '#3d4b52';
  ctx.lineWidth = 1.1;
  ctx.lineCap = 'round';
  for (let i = -1; i <= 1; i++) {
    const sway = Math.sin(time * 4 + i * 1.7 + (e.phase || 0)) * 1.6;
    ctx.beginPath();
    ctx.moveTo(-2 + i * 2, 3);
    ctx.quadraticCurveTo(-4 + i * 3 + sway, 9, -7 + i * 4 + sway, 12);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-2 + i * 2, -3);
    ctx.quadraticCurveTo(-4 + i * 3 - sway, -9, -7 + i * 4 - sway, -12);
    ctx.stroke();
  }
  // lower thrusters
  ctx.fillStyle = 'rgba(150, 215, 235, 0.75)';
  ctx.beginPath();
  ctx.ellipse(-4, 0, 3.4, 1.6, 0, 0, TAU);
  ctx.fill();

  // main shell
  const g = ctx.createRadialGradient(-2, -2.5 + wobble, 1, 0, 0, 8.5);
  g.addColorStop(0, '#c3d6dd');
  g.addColorStop(0.45, '#6f8894');
  g.addColorStop(1, '#26343c');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0 + wobble * 0.3, 8.2, 7.2, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#1a262d';
  ctx.lineWidth = 0.9;
  ctx.stroke();
  // panel seams
  ctx.strokeStyle = 'rgba(210, 235, 242, 0.25)';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.ellipse(0, 0, 5.6, 4.6, 0, 0, TAU);
  ctx.stroke();
  // eye cluster
  ctx.fillStyle = '#101a20';
  ctx.beginPath();
  ctx.ellipse(4.6, -0.6, 3.4, 2.8, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#ff4c3a';
  ctx.shadowColor = 'rgba(255, 70, 50, 0.95)';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(5.6, -0.6, 1.5, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
  // antennae
  ctx.strokeStyle = '#8ba2ad';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(-3, -6);
  ctx.lineTo(-6, -11);
  ctx.moveTo(-1, -7);
  ctx.lineTo(-1, -12);
  ctx.stroke();
  ctx.fillStyle = '#9fe6ff';
  ctx.beginPath();
  ctx.arc(-6, -11, 0.9, 0, TAU);
  ctx.arc(-1, -12, 0.9, 0, TAU);
  ctx.fill();
}

/* —— AT-ST style walker —— */
const WALKER_PALETTES = {
  hoth: { body: ['#b3c1c5', '#84959a', '#56676d'], edge: '#2f3d42', visor: '#ff8a4a', trim: '#6d7f85' },
  commander: { body: ['#8d989d', '#677236', '#3e4a4f'], edge: '#232c30', visor: '#ff4a3c', trim: '#57636a' },
};

function drawWalkerBody(ctx, e, time, def) {
  const p = WALKER_PALETTES[def.palette] || WALKER_PALETTES.hoth;
  const boss = !!def.boss;
  const walk = Math.sin(time * 7 + (e.phase || 0)) * 2.4;
  ctx.save();
  if (boss) ctx.scale(1.16, 1.16);

  // legs
  ctx.strokeStyle = p.edge;
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(-5, side * 4);
    ctx.lineTo(-11 + walk * 0.5, side * 10);
    ctx.lineTo(-3 + walk, side * 15);
    ctx.stroke();
    // joint
    ctx.fillStyle = p.body[1];
    ctx.beginPath();
    ctx.arc(-11 + walk * 0.5, side * 10, 2, 0, TAU);
    ctx.fill();
    // foot
    ctx.strokeStyle = p.body[2];
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(-3 + walk, side * 15);
    ctx.lineTo(3 + walk, side * 15.4);
    ctx.stroke();
    ctx.strokeStyle = p.edge;
    ctx.lineWidth = 2.6;
  }

  // hip block
  ctx.fillStyle = p.body[2];
  roundRect(ctx, -9, -6, 9, 12, 3);
  ctx.fill();

  // hull
  const g = ctx.createLinearGradient(0, -9, 0, 9);
  g.addColorStop(0, p.body[0]);
  g.addColorStop(0.5, p.body[1]);
  g.addColorStop(1, p.body[2]);
  ctx.fillStyle = g;
  roundRect(ctx, -8, -8, 17, 16, 4.5);
  ctx.fill();
  ctx.strokeStyle = p.edge;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // armor plates
  ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
  roundRect(ctx, -6, -6.6, 11, 4, 1.5);
  ctx.fill();
  roundRect(ctx, -6, 2.6, 11, 4, 1.5);
  ctx.fill();
  // side blaster
  ctx.fillStyle = p.edge;
  roundRect(ctx, 2, -10, 3, 4, 1);
  ctx.fill();

  // head
  const hg = ctx.createLinearGradient(0, -6, 0, 6);
  hg.addColorStop(0, p.body[0]);
  hg.addColorStop(1, p.body[2]);
  ctx.fillStyle = hg;
  roundRect(ctx, 7, -6, 10, 12, 3);
  ctx.fill();
  ctx.strokeStyle = p.edge;
  ctx.lineWidth = 1.1;
  ctx.stroke();
  // visor slit
  ctx.fillStyle = p.visor;
  ctx.shadowColor = p.visor;
  ctx.shadowBlur = 5;
  roundRect(ctx, 11.6, -3.8, 4.6, 2.4, 1);
  ctx.fill();
  roundRect(ctx, 11.6, 1.4, 4.6, 2.4, 1);
  ctx.fill();
  ctx.shadowBlur = 0;
  // chin guns
  ctx.fillStyle = p.edge;
  roundRect(ctx, 15, -1.2, 8, 1.8, 0.8);
  ctx.fill();
  // top hatch
  ctx.fillStyle = p.trim;
  roundRect(ctx, -3, -9.6, 7, 2.6, 1.2);
  ctx.fill();
  if (boss) {
    // command antenna and extra plating
    ctx.strokeStyle = p.trim;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(-2, -9);
    ctx.lineTo(-6, -15);
    ctx.stroke();
    ctx.fillStyle = '#ffb05e';
    ctx.beginPath();
    ctx.arc(-6, -15, 1.4, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 210, 140, 0.5)';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-7, -7.4, 15, 14.8);
  }
  ctx.restore();
}

/* —— AT-AT —— */
function drawAtAtBody(ctx, e, time, def) {
  const walk = Math.sin(time * 5 + (e.phase || 0)) * 2.2;
  const legPairs = [-14, -2, 8, 17];
  ctx.strokeStyle = '#3f4b50';
  ctx.lineWidth = 3.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let i = 0; i < legPairs.length; i++) {
    const lx = legPairs[i];
    const side = i % 2 === 0 ? -1 : 1;
    const shift = Math.sin(time * 5 + i * 1.6 + (e.phase || 0)) * 2.4;
    ctx.beginPath();
    ctx.moveTo(lx, side * 4);
    ctx.lineTo(lx - 3 + shift, side * 11);
    ctx.lineTo(lx + shift, side * 16);
    ctx.stroke();
    ctx.fillStyle = '#5b6a6f';
    ctx.beginPath();
    ctx.arc(lx - 3 + shift, side * 11, 2.6, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#2c363a';
    roundRect(ctx, lx + shift - 3, side * 16 - 2, 7, 4, 1.6);
    ctx.fill();
  }
  // main hull
  const g = ctx.createLinearGradient(0, -13, 0, 13);
  g.addColorStop(0, '#c2cfd2');
  g.addColorStop(0.5, '#93a4a9');
  g.addColorStop(1, '#61747b');
  ctx.fillStyle = g;
  roundRect(ctx, -22, -11, 38, 22, 6);
  ctx.fill();
  ctx.strokeStyle = '#39464b';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // armor plating
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 0.9;
  for (let i = -18; i < 12; i += 6) {
    ctx.beginPath();
    ctx.moveTo(i, -9.6);
    ctx.lineTo(i + 2.4, 9.6);
    ctx.stroke();
  }
  // side pods
  ctx.fillStyle = '#7c8d92';
  roundRect(ctx, -20, -13.4, 12, 3.2, 1.4);
  ctx.fill();
  roundRect(ctx, -20, 10.2, 12, 3.2, 1.4);
  ctx.fill();
  // neck
  ctx.fillStyle = '#84959a';
  ctx.beginPath();
  ctx.moveTo(14, -7);
  ctx.lineTo(23, -6);
  ctx.lineTo(24, 5);
  ctx.lineTo(14, 7);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#39464b';
  ctx.stroke();
  // head
  const hg = ctx.createLinearGradient(0, -8, 0, 8);
  hg.addColorStop(0, '#c5d2d5');
  hg.addColorStop(1, '#6d7f84');
  ctx.fillStyle = hg;
  roundRect(ctx, 21, -6.4, 12, 12, 3.4);
  ctx.fill();
  ctx.strokeStyle = '#39464b';
  ctx.stroke();
  // viewports
  ctx.fillStyle = '#ff7a3a';
  ctx.shadowColor = 'rgba(255, 110, 50, 0.9)';
  ctx.shadowBlur = 6;
  roundRect(ctx, 26, -3.6, 5, 2, 0.8);
  ctx.fill();
  roundRect(ctx, 26, 1.4, 5, 2, 0.8);
  ctx.fill();
  ctx.shadowBlur = 0;
  // chin cannons
  ctx.fillStyle = '#333e42';
  roundRect(ctx, 31, -4.6, 8, 1.8, 0.8);
  ctx.fill();
  roundRect(ctx, 31, 2.8, 8, 1.8, 0.8);
  ctx.fill();
  // command antenna
  ctx.strokeStyle = '#aab8bc';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(-18, -11);
  ctx.lineTo(-24, -18);
  ctx.stroke();
  ctx.fillStyle = '#ffb05e';
  ctx.beginPath();
  ctx.arc(-24, -18, 1.6, 0, TAU);
  ctx.fill();
}

/* —— Mustafarian lava skitter —— */
function drawSkitterBody(ctx, e, time, def) {
  const p = def.palette === 'lava'
    ? { shell: ['#5c2a1c', '#341711', '#1a0c09'], glow: 'rgba(255, 126, 34, 0.95)', eye: '#ffe08a' }
    : { shell: ['#5c4a3c', '#3a2c22', '#1e1611'], glow: 'rgba(255, 170, 80, 0.8)', eye: '#fff0b0' };
  // legs
  ctx.strokeStyle = '#2c1712';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    for (const side of [-1, 1]) {
      const swing = Math.sin(time * 16 + i * 1.4 + side + (e.phase || 0)) * 1.6;
      const bx = -4 + i * 4;
      ctx.beginPath();
      ctx.moveTo(bx, side * 3);
      ctx.lineTo(bx - 3 + swing, side * 8);
      ctx.lineTo(bx + 1 + swing, side * 11);
      ctx.stroke();
    }
  }
  // glowing underbody
  ctx.fillStyle = p.glow;
  ctx.shadowColor = p.glow;
  ctx.shadowBlur = 9;
  ctx.beginPath();
  ctx.ellipse(-1, 0, 7.6, 4.6, 0, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
  // carapace
  const g = ctx.createRadialGradient(-2, -1.5, 1, 0, 0, 8);
  g.addColorStop(0, p.shell[0]);
  g.addColorStop(0.6, p.shell[1]);
  g.addColorStop(1, p.shell[2]);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, 7.4, 4.8, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(20, 8, 5, 0.8)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // molten seams
  ctx.strokeStyle = p.glow;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(-5, -2);
  ctx.lineTo(-1, 0);
  ctx.lineTo(4, -2.4);
  ctx.moveTo(-4, 2);
  ctx.lineTo(1, 0);
  ctx.lineTo(4, 2.2);
  ctx.stroke();
  // head
  ctx.fillStyle = p.shell[1];
  ctx.beginPath();
  ctx.ellipse(6.4, 0, 3.2, 2.6, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = p.eye;
  ctx.shadowColor = p.glow;
  ctx.shadowBlur = 5;
  ctx.beginPath();
  ctx.arc(7.4, -1, 0.9, 0, TAU);
  ctx.arc(7.4, 1, 0.9, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
  // mandibles
  ctx.strokeStyle = p.shell[0];
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(8.6, -1.6);
  ctx.lineTo(11, -3);
  ctx.moveTo(8.6, 1.6);
  ctx.lineTo(11, 3);
  ctx.stroke();
}

/* —— Sith enforcer —— */
function drawSithBody(ctx, e, time, def) {
  const walk = Math.sin(time * 6 + (e.phase || 0)) * 0.8;
  // cape
  const cape = ctx.createLinearGradient(-16, 0, 4, 0);
  cape.addColorStop(0, '#0d0a0c');
  cape.addColorStop(0.7, '#241a1e');
  cape.addColorStop(1, '#3a2228');
  ctx.fillStyle = cape;
  ctx.beginPath();
  ctx.moveTo(-3, -6);
  ctx.quadraticCurveTo(-18 - walk, -14, -22 - walk, -2);
  ctx.quadraticCurveTo(-24 - walk, 8, -16, 13);
  ctx.lineTo(-2, 7);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(120, 40, 44, 0.4)';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // legs
  ctx.strokeStyle = '#120d10';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-2, -3);
  ctx.lineTo(-5 + walk, -9);
  ctx.moveTo(-2, 3);
  ctx.lineTo(-5 - walk, 9);
  ctx.stroke();

  // robe body
  const body = ctx.createLinearGradient(0, -8, 0, 8);
  body.addColorStop(0, '#2c2026');
  body.addColorStop(1, '#100b0e');
  ctx.fillStyle = body;
  roundRect(ctx, -8, -7, 14, 14, 4);
  ctx.fill();
  ctx.strokeStyle = 'rgba(140, 60, 60, 0.35)';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // hood
  ctx.fillStyle = '#1a1216';
  ctx.beginPath();
  ctx.ellipse(5, 0, 6.2, 6.4, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#3a2429';
  ctx.stroke();
  // mask
  ctx.fillStyle = '#080607';
  ctx.beginPath();
  ctx.ellipse(7.4, 0, 3.2, 4, 0, 0, TAU);
  ctx.fill();
  // eyes
  ctx.fillStyle = '#ff3a2c';
  ctx.shadowColor = 'rgba(255, 50, 40, 0.95)';
  ctx.shadowBlur = 5;
  ctx.beginPath();
  ctx.arc(9, -1.6, 0.8, 0, TAU);
  ctx.arc(9, 1.6, 0.8, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;

  // lightsaber
  const swing = Math.sin(time * 3.4 + (e.phase || 0)) * 0.7;
  ctx.save();
  ctx.translate(4, 4);
  ctx.rotate(-0.25 + swing);
  ctx.fillStyle = '#2a2a2e';
  roundRect(ctx, 0, -0.9, 6, 1.8, 0.8);
  ctx.fill();
  ctx.strokeStyle = '#ff2e2e';
  ctx.shadowColor = 'rgba(255, 40, 40, 1)';
  ctx.shadowBlur = 10;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(6, 0);
  ctx.lineTo(24, 0);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 190, 180, 0.9)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(6, 0);
  ctx.lineTo(24, 0);
  ctx.stroke();
  ctx.restore();
}

/* ============================================================
   PROJECTILES & PARTICLES & EFFECTS
   ============================================================ */

export function drawProjectile(ctx, p, S) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle || 0);
  if (p.kind === 'bullet') {
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(255, 205, 100, 0.9)';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-9, 0);
    ctx.lineTo(2, 0);
    ctx.stroke();
    ctx.fillStyle = '#fff2c0';
    ctx.beginPath();
    ctx.arc(2, 0, 1.7, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 180, 80, 0.25)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.lineTo(-2, 0);
    ctx.stroke();
  } else if (p.kind === 'rocket') {
    ctx.fillStyle = '#4e4a43';
    roundRect(ctx, -6, -2.2, 12, 4.4, 2);
    ctx.fill();
    ctx.fillStyle = '#d98d5a';
    ctx.beginPath();
    ctx.moveTo(5, -2.2);
    ctx.lineTo(9, 0);
    ctx.lineTo(5, 2.2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#6d675c';
    ctx.beginPath();
    ctx.moveTo(-4, -2);
    ctx.lineTo(-7, -4);
    ctx.lineTo(-5, 0);
    ctx.lineTo(-7, 4);
    ctx.lineTo(-4, 2);
    ctx.closePath();
    ctx.fill();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(-8, 0, 0, -8, 0, 8 * S);
    g.addColorStop(0, 'rgba(255, 230, 160, 1)');
    g.addColorStop(0.4, 'rgba(255, 140, 60, 0.8)');
    g.addColorStop(1, 'rgba(255, 80, 30, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(-8, 0, 8, 0, TAU);
    ctx.fill();
    ctx.restore();
  } else if (p.kind === 'ion') {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 13);
    g.addColorStop(0, 'rgba(230, 255, 255, 1)');
    g.addColorStop(0.28, 'rgba(120, 230, 255, 0.9)');
    g.addColorStop(1, 'rgba(50, 150, 210, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(190, 250, 255, 0.75)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const a = p.spin + i * 2.1;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 2, Math.sin(a) * 2);
      ctx.lineTo(Math.cos(a + 0.7) * 6, Math.sin(a + 0.7) * 6);
      ctx.lineTo(Math.cos(a + 1.1) * 4, Math.sin(a + 1.1) * 4);
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
}

export function drawParticles(ctx, particles) {
  ctx.save();
  for (const p of particles) {
    const life = p.life / p.max;
    if (life <= 0) continue;
    ctx.globalAlpha = Math.min(1, life * 1.4);
    if (p.glow) {
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
      g.addColorStop(0, p.color);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3, 0, TAU);
      ctx.fill();
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = p.color;
      ctx.beginPath();
      if (p.square) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot || 0);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      } else {
        ctx.arc(p.x, p.y, p.size * Math.max(0.25, life), 0, TAU);
        ctx.fill();
      }
    }
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function drawEffects(ctx, effects, time) {
  for (const fx of effects) {
    const life = clamp(fx.life / fx.max, 0, 1);
    ctx.save();
    if (fx.kind === 'ring') {
      const t = 1 - life;
      const r = fx.r + (fx.maxR - fx.r) * (1 - Math.pow(1 - t, 2));
      ctx.globalAlpha = life * (fx.alpha ?? 0.8);
      ctx.strokeStyle = fx.color;
      ctx.lineWidth = Math.max(1, fx.width * life);
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, r, 0, TAU);
      ctx.stroke();
      if (fx.fill) {
        const g = ctx.createRadialGradient(fx.x, fx.y, r * 0.2, fx.x, fx.y, r);
        g.addColorStop(0, 'rgba(255,255,255,0)');
        g.addColorStop(0.8, fx.fill);
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(fx.x, fx.y, r, 0, TAU);
        ctx.fill();
      }
    } else if (fx.kind === 'beam') {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = life;
      ctx.strokeStyle = fx.color;
      ctx.lineCap = 'round';
      ctx.shadowColor = fx.color;
      ctx.shadowBlur = 12;
      ctx.lineWidth = fx.width * (0.5 + life * 0.5);
      ctx.beginPath();
      ctx.moveTo(fx.x1, fx.y1);
      ctx.lineTo(fx.x2, fx.y2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = Math.max(1, fx.width * 0.25);
      ctx.beginPath();
      ctx.moveTo(fx.x1, fx.y1);
      ctx.lineTo(fx.x2, fx.y2);
      ctx.stroke();
    } else if (fx.kind === 'arc') {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = life;
      ctx.shadowColor = fx.color;
      ctx.shadowBlur = 10;
      ctx.strokeStyle = fx.color;
      ctx.lineWidth = fx.width || 2;
      ctx.beginPath();
      const pts = fx.points;
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    } else if (fx.kind === 'slash') {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = life * 0.8;
      ctx.strokeStyle = fx.color;
      ctx.lineWidth = fx.width || 3;
      ctx.shadowColor = fx.color;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, fx.r, fx.a0 + (1 - life) * 0.7, fx.a1 + (1 - life) * 0.7);
      ctx.stroke();
    } else if (fx.kind === 'flash') {
      ctx.globalAlpha = life * 0.55;
      const g = ctx.createRadialGradient(fx.x, fx.y, 0, fx.x, fx.y, fx.r);
      g.addColorStop(0, fx.color);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, fx.r, 0, TAU);
      ctx.fill();
    } else if (fx.kind === 'text') {
      ctx.globalAlpha = life;
      ctx.fillStyle = fx.color;
      ctx.font = `800 ${fx.size || 12}px "Trebuchet MS", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(fx.text, fx.x, fx.y - (1 - life) * 22);
    }
    ctx.restore();
  }
}

export function drawAura(ctx, tower, S, time) {
  const t = TOWERS[tower.type];
  if (!t) return;
  const r = tower.range || 86;
  ctx.save();
  ctx.globalAlpha = 0.5;
  const pulse = 1 + Math.sin(time * 2 + (tower.phase || 0)) * 0.02;
  const g = ctx.createRadialGradient(tower.x, tower.y, r * 0.2, tower.x, tower.y, r * pulse);
  g.addColorStop(0, 'rgba(110, 190, 255, 0.03)');
  g.addColorStop(0.8, 'rgba(90, 170, 255, 0.05)');
  g.addColorStop(1, 'rgba(90, 170, 255, 0.14)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(tower.x, tower.y, r * pulse, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120, 200, 255, 0.22)';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 6]);
  ctx.lineDashOffset = time * 14;
  ctx.beginPath();
  ctx.arc(tower.x, tower.y, r, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

export function drawPreview(ctx, type, x, y, valid, time, S) {
  const def = TOWERS[type];
  if (!def) return;
  ctx.save();
  ctx.globalAlpha = 0.55;
  drawRange(ctx, x, y, def.range[0] * S, valid ? '#9ee6a3' : '#ff7766', 0.85);
  ctx.globalAlpha = 1;
  const fake = {
    x, y, type, level: 1, angle: -Math.PI / 2 + Math.sin(time * 0.8) * 0.25,
    recoil: 0, phase: 0,
  };
  if (!valid) {
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.filter = 'sepia(0.5) saturate(1.4) hue-rotate(-30deg)';
    drawTower(ctx, fake, time, S, false, 0.85);
    ctx.filter = 'none';
    ctx.restore();
    // red slash mark
    ctx.strokeStyle = 'rgba(255, 90, 70, 0.9)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - 8, y - 8);
    ctx.lineTo(x + 8, y + 8);
    ctx.moveTo(x + 8, y - 8);
    ctx.lineTo(x - 8, y + 8);
    ctx.stroke();
  } else {
    drawTower(ctx, fake, time, S, false, 0.8);
    ctx.strokeStyle = 'rgba(160, 240, 160, 0.65)';
    ctx.lineWidth = 1.3;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(x, y, 21 * S, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawSpawnGlow(ctx, pathPts, time) {
  if (!pathPts.length) return;
  const [x, y] = pathPts[0];
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x + 18, y, 0, x + 18, y, 70);
  g.addColorStop(0, 'rgba(255, 90, 70, 0.20)');
  g.addColorStop(1, 'rgba(255, 50, 30, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x + 18, y, 70, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function drawBuildFlash(ctx, x, y, time, S) {
  // reserved for placement flourish
  void ctx; void x; void y; void time; void S;
}
