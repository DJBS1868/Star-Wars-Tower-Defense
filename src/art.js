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
  const speckleCount = theme.extra === 'desert' ? 560 : 380;
  for (let i = 0; i < speckleCount; i++) {
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

  // Twin-sun key light and low desert haze.
  if (theme.extra === 'desert') {
    ctx.save();
    const light = ctx.createRadialGradient(w * 0.14, -h * 0.08, 0, w * 0.14, -h * 0.08, Math.max(w, h) * 0.9);
    light.addColorStop(0, 'rgba(255, 238, 186, 0.26)');
    light.addColorStop(0.45, 'rgba(255, 220, 158, 0.08)');
    light.addColorStop(1, 'rgba(255, 220, 158, 0)');
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, w, h);
    const haze = ctx.createLinearGradient(0, h * 0.38, 0, h * 0.86);
    haze.addColorStop(0, 'rgba(255, 220, 168, 0)');
    haze.addColorStop(0.6, 'rgba(255, 216, 160, 0.055)');
    haze.addColorStop(1, 'rgba(178, 118, 66, 0.07)');
    ctx.fillStyle = haze;
    ctx.fillRect(0, h * 0.38, w, h * 0.48);
    ctx.restore();
  }

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
  if (theme.extra === 'desert') {
    // Wind-carved dune crests: a soft shadow under each ridge and a sunlit lip.
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 0; i < 13; i++) {
      const x = rng() * w;
      const y = rng() * h;
      if (distanceToPath(x, y, pathPts) < 66 * S) continue;
      const len = (100 + rng() * 220) * S;
      const rot = -0.24 + (rng() - 0.5) * 0.4;
      const bend = (10 + rng() * 22) * S;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      for (const [off, col, lw] of [
        [4.4 * S, 'rgba(116, 77, 38, 0.11)', 9 * S],
        [-2.6 * S, 'rgba(255, 238, 194, 0.16)', 4.4 * S],
        [-4.4 * S, 'rgba(255, 246, 213, 0.10)', 1.6 * S],
      ]) {
        ctx.beginPath();
        ctx.moveTo(-len / 2, off);
        ctx.quadraticCurveTo(0, -bend + off, len / 2, off);
        ctx.strokeStyle = col;
        ctx.lineWidth = lw;
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();

    // Cracked salt pans and dry mud flats.
    for (let i = 0; i < 5; i++) {
      const x = rng() * w;
      const y = rng() * h;
      if (distanceToPath(x, y, pathPts) < 72 * S) continue;
      const rx = (26 + rng() * 58) * S;
      const ry = rx * (0.4 + rng() * 0.25);
      const rot = rng() * TAU;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rx);
      g.addColorStop(0, 'rgba(241, 218, 172, 0.22)');
      g.addColorStop(0.72, 'rgba(214, 181, 132, 0.11)');
      g.addColorStop(1, 'rgba(214, 181, 132, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, rot, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(112, 76, 40, 0.14)';
      ctx.lineWidth = 0.8 * S;
      for (let c = 0; c < 6; c++) {
        const a = rng() * TAU;
        const cr = rx * (0.2 + rng() * 0.7);
        const cx = x + Math.cos(a) * cr;
        const cy = y + Math.sin(a) * cr * 0.55;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + (rng() - 0.5) * 16 * S, cy + (rng() - 0.5) * 10 * S);
        ctx.stroke();
      }
    }

    // Tough desert scrub, drawn small so it reads as ground cover.
    for (let i = 0; i < 34; i++) {
      const x = rng() * w;
      const y = rng() * h;
      if (distanceToPath(x, y, pathPts) < 38 * S) continue;
      ctx.strokeStyle = `rgba(${rng() > 0.5 ? '116, 112, 62' : '136, 120, 70'}, ${0.16 + rng() * 0.16})`;
      ctx.lineWidth = 0.85 * S;
      for (let b = -1; b <= 1; b++) {
        ctx.beginPath();
        ctx.moveTo(x, y + 1.5 * S);
        ctx.quadraticCurveTo(x + b * 2.6 * S, y - 2.4 * S, x + b * (3.6 + rng() * 2.4) * S, y - (4.8 + rng() * 2.2) * S);
        ctx.stroke();
      }
    }
  } else if (theme.extra === 'ice') {
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
      const moss = ctx.createRadialGradient(x, y, 0, x, y, rx);
      moss.addColorStop(0, `rgba(139, 165, 77, ${0.12 + rng() * 0.08})`);
      moss.addColorStop(0.62, 'rgba(86, 119, 53, 0.08)');
      moss.addColorStop(1, 'rgba(62, 91, 43, 0)');
      ctx.fillStyle = moss;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, rx * (0.38 + rng() * 0.2), rng() * TAU, 0, TAU);
      ctx.fill();
    }
    // Fallen leaves and root-like traces add scale without muddying the route.
    for (let i = 0; i < 72; i++) {
      const x = rng() * w;
      const y = rng() * h;
      if (distanceToPath(x, y, pathPts) < 34 * S) continue;
      const a = rng() * TAU;
      const len = (2.2 + rng() * 5.2) * S;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a);
      ctx.fillStyle = rng() > 0.5 ? 'rgba(190, 151, 78, 0.25)' : 'rgba(92, 119, 49, 0.30)';
      ctx.beginPath();
      ctx.ellipse(0, 0, len, (0.7 + rng() * 0.55) * S, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 0; i < 24; i++) {
      const x = rng() * w;
      const y = rng() * h;
      if (distanceToPath(x, y, pathPts) < 58 * S) continue;
      const len = (12 + rng() * 28) * S;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + len * 0.35, y + (rng() - 0.5) * 9 * S, x + len, y + (rng() - 0.5) * 15 * S);
      ctx.strokeStyle = `rgba(35, 54, 29, ${0.12 + rng() * 0.12})`;
      ctx.lineWidth = (1 + rng() * 1.8) * S;
      ctx.stroke();
    }
    ctx.restore();
  }
}

/* Extra edges and glow applied directly around the route. */
function drawPathEdges(ctx, w, h, S, rng, pathPts, pw, theme) {
  if (theme.extra === 'desert') {
    // Fine blown-sand lip along the trail.
    ctx.save();
    ctx.lineCap = 'round';
    for (const side of [-1, 1]) {
      tracePoints(ctx, offsetPath(pathPts, side * (pw * 0.5 + 2.2 * S)));
      ctx.strokeStyle = 'rgba(255, 238, 197, 0.20)';
      ctx.lineWidth = 3.4 * S;
      ctx.stroke();
      tracePoints(ctx, offsetPath(pathPts, side * (pw * 0.5 + 6.2 * S)));
      ctx.strokeStyle = 'rgba(122, 82, 42, 0.09)';
      ctx.lineWidth = 2.2 * S;
      ctx.stroke();
    }
    ctx.restore();

    // Small three-toed animal tracks crossing the open sand.
    for (let i = 8; i < pathPts.length - 8; i += 13) {
      const p = pathPts[i];
      const prev = pathPts[i - 1];
      const next = pathPts[i + 1];
      let dx = next[0] - prev[0];
      let dy = next[1] - prev[1];
      const len = Math.hypot(dx, dy) || 1;
      dx /= len; dy /= len;
      const side = i % 26 === 8 ? 1 : -1;
      const off = side * (pw * 0.5 + (6 + rng() * 15) * S);
      const tx = p[0] - dy * off + (rng() - 0.5) * 12 * S;
      const ty = p[1] + dx * off + (rng() - 0.5) * 12 * S;
      const a = Math.atan2(dy, dx) + 0.55;
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(a);
      ctx.fillStyle = 'rgba(104, 68, 34, 0.18)';
      for (let step = -1; step <= 1; step++) {
        const px = step * 4.4 * S;
        for (let toe = -1; toe <= 1; toe++) {
          ctx.beginPath();
          ctx.ellipse(px + toe * 1.2 * S, toe * 1.35 * S, 1.1 * S, 0.52 * S, toe * 0.4, 0, TAU);
          ctx.fill();
        }
      }
      ctx.restore();
    }
  } else if (theme.extra === 'lava') {
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

/* Layered sandstone butte. Drawn with a sunlit cap and deep strata
   so the desert map reads as a real Tatooine landmark, not a pebble. */
function drawMesa(ctx, x, y, r, S, rng) {
  ctx.save();
  ctx.translate(x, y);

  // long cast shadow
  ctx.fillStyle = 'rgba(66, 38, 13, 0.28)';
  ctx.beginPath();
  ctx.ellipse(r * 0.72, r * 0.6, r * 1.55, r * 0.5, -0.08, 0, TAU);
  ctx.fill();

  // talus apron
  ctx.fillStyle = '#a77748';
  ctx.beginPath();
  ctx.ellipse(0, r * 0.42, r * 1.3, r * 0.45, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 226, 173, 0.22)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.2, r * 0.3, r * 1.0, r * 0.25, 0, 0, TAU);
  ctx.fill();

  const cliff = () => {
    ctx.beginPath();
    ctx.moveTo(-r * 1.12, r * 0.36);
    ctx.lineTo(-r * 1.04, -r * 0.32);
    ctx.quadraticCurveTo(-r * 0.98, -r * 0.86, -r * 0.56, -r * 0.93);
    ctx.lineTo(r * 0.58, -r * 0.93);
    ctx.quadraticCurveTo(r * 0.98, -r * 0.82, r * 1.04, -r * 0.32);
    ctx.lineTo(r * 1.12, r * 0.36);
    ctx.quadraticCurveTo(0, r * 0.67, -r * 1.12, r * 0.36);
    ctx.closePath();
  };

  const g = ctx.createLinearGradient(-r, -r, r, r * 0.6);
  g.addColorStop(0, '#d9ab70');
  g.addColorStop(0.34, '#b98350');
  g.addColorStop(0.72, '#8d5d34');
  g.addColorStop(1, '#6d4526');
  cliff();
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(71, 43, 20, 0.6)';
  ctx.lineWidth = Math.max(0.7 * S, r * 0.025);
  ctx.stroke();

  // stratified bands clipped to the cliff face
  ctx.save();
  cliff();
  ctx.clip();
  for (let i = 0; i < 5; i++) {
    const yy = -r * 0.62 + i * r * 0.22;
    ctx.beginPath();
    ctx.moveTo(-r * 1.2, yy);
    ctx.quadraticCurveTo(-r * 0.1, yy + r * 0.06, r * 1.2, yy - r * 0.02);
    ctx.strokeStyle = i % 2 ? 'rgba(255, 222, 166, 0.22)' : 'rgba(79, 47, 21, 0.28)';
    ctx.lineWidth = Math.max(0.5 * S, r * 0.02);
    ctx.stroke();
  }
  // vertical erosion channels
  for (let i = 0; i < 7; i++) {
    const vx = -r * 0.85 + i * r * 0.28 + (rng() - 0.5) * r * 0.08;
    ctx.beginPath();
    ctx.moveTo(vx, -r * 0.8);
    ctx.quadraticCurveTo(vx + r * 0.05, -r * 0.2, vx - r * 0.04, r * 0.42);
    ctx.strokeStyle = 'rgba(75, 44, 20, 0.18)';
    ctx.lineWidth = Math.max(0.4 * S, r * 0.018);
    ctx.stroke();
  }
  // rubble shading at the foot
  const foot = ctx.createLinearGradient(0, r * 0.1, 0, r * 0.58);
  foot.addColorStop(0, 'rgba(68, 39, 16, 0)');
  foot.addColorStop(1, 'rgba(68, 39, 16, 0.42)');
  ctx.fillStyle = foot;
  ctx.fillRect(-r * 1.3, r * 0.05, r * 2.6, r * 0.6);
  ctx.restore();

  // flat sunlit cap
  const cap = ctx.createLinearGradient(0, -r * 1.08, 0, -r * 0.78);
  cap.addColorStop(0, '#efcd94');
  cap.addColorStop(1, '#c3925c');
  ctx.fillStyle = cap;
  ctx.beginPath();
  ctx.ellipse(0, -r * 0.93, r * 0.62, r * 0.24, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(94, 59, 29, 0.55)';
  ctx.lineWidth = Math.max(0.6 * S, r * 0.02);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 241, 200, 0.45)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.16, -r * 0.97, r * 0.34, r * 0.11, 0, 0, TAU);
  ctx.fill();

  // cracks on the cap
  ctx.strokeStyle = 'rgba(100, 64, 32, 0.35)';
  ctx.lineWidth = Math.max(0.35 * S, r * 0.012);
  for (let i = 0; i < 3; i++) {
    const cx = (rng() - 0.5) * r * 0.8;
    const cy = -r * 0.95 + (rng() - 0.5) * r * 0.12;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + (rng() - 0.5) * r * 0.3, cy + r * 0.13);
    ctx.stroke();
  }

  // scree at the base
  for (let i = 0; i < 9; i++) {
    const ang = rng() * TAU;
    const dist = r * (0.8 + rng() * 0.6);
    drawPebble(ctx, Math.cos(ang) * dist, r * 0.42 + Math.sin(ang) * r * 0.22, (0.8 + rng() * 1.5) * S, rng, rng() * TAU, THEMES.desert);
  }
  ctx.restore();
}

/* Half-buried krayt skeleton — a landmark that hints at the final boss. */
function drawKraytSkull(ctx, x, y, r, S, rng) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.14 + rng() * 0.1);

  // shadow beneath the bones
  ctx.fillStyle = 'rgba(63, 36, 14, 0.24)';
  ctx.beginPath();
  ctx.ellipse(r * 0.1, r * 0.56, r * 1.7, r * 0.55, 0, 0, TAU);
  ctx.fill();

  // spine
  ctx.strokeStyle = '#cdb58d';
  ctx.lineWidth = Math.max(1.1 * S, r * 0.09);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-r * 1.6, r * 0.2);
  ctx.quadraticCurveTo(-r * 0.2, r * 0.42, r * 1.12, -r * 0.06);
  ctx.stroke();
  ctx.lineWidth = Math.max(0.6 * S, r * 0.03);
  ctx.strokeStyle = 'rgba(245, 229, 197, 0.55)';
  ctx.beginPath();
  ctx.moveTo(-r * 1.55, r * 0.14);
  ctx.quadraticCurveTo(-r * 0.2, r * 0.34, r * 1.1, -r * 0.13);
  ctx.stroke();
  // vertebrae
  ctx.fillStyle = '#d8c29a';
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const vx = -r * 1.55 + t * r * 2.45;
    const vy = r * 0.2 - Math.sin(t * Math.PI) * r * 0.18 + t * r * 0.15;
    ctx.beginPath();
    ctx.ellipse(vx, vy, r * 0.075, r * 0.12, 0.2, 0, TAU);
    ctx.fill();
  }

  // ribcage
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const rx = -r * 1.34 + t * r * 1.55;
    const ry = r * 0.22 - Math.sin(t * Math.PI) * r * 0.1;
    const span = r * (0.92 - t * 0.28);
    for (const side of [-1, 1]) {
      ctx.strokeStyle = side < 0 ? '#c6ae85' : '#b69c73';
      ctx.lineWidth = Math.max(0.9 * S, r * 0.06);
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.bezierCurveTo(rx - r * 0.18, ry + side * span * 0.55, rx + r * 0.22, ry + side * span, rx + r * 0.42, ry + side * span * 0.92);
      ctx.stroke();
      // rib highlight
      ctx.strokeStyle = 'rgba(247, 232, 201, 0.42)';
      ctx.lineWidth = Math.max(0.35 * S, r * 0.02);
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.bezierCurveTo(rx - r * 0.15, ry + side * span * 0.5, rx + r * 0.24, ry + side * span * 0.88, rx + r * 0.4, ry + side * span * 0.84);
      ctx.stroke();
    }
  }

  // skull: heavy wedge with horns and hollow sockets
  ctx.save();
  ctx.translate(r * 1.24, -r * 0.12);
  ctx.rotate(0.08);
  const sg = ctx.createLinearGradient(-r * 0.45, -r * 0.4, r * 0.55, r * 0.4);
  sg.addColorStop(0, '#e6d1a8');
  sg.addColorStop(0.55, '#c9b189');
  sg.addColorStop(1, '#a38a65');
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.moveTo(-r * 0.46, -r * 0.35);
  ctx.quadraticCurveTo(-r * 0.08, -r * 0.58, r * 0.34, -r * 0.38);
  ctx.lineTo(r * 0.7, -r * 0.2);
  ctx.quadraticCurveTo(r * 0.86, 0, r * 0.7, r * 0.16);
  ctx.lineTo(r * 0.32, r * 0.36);
  ctx.quadraticCurveTo(-r * 0.08, r * 0.5, -r * 0.46, r * 0.3);
  ctx.quadraticCurveTo(-r * 0.58, 0, -r * 0.46, -r * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#7e6545';
  ctx.lineWidth = Math.max(0.55 * S, r * 0.025);
  ctx.stroke();
  // eye sockets
  ctx.fillStyle = '#3a2a19';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(r * 0.03, side * r * 0.2, r * 0.14, r * 0.1, side * 0.2, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#2a1c10';
    ctx.beginPath();
    ctx.ellipse(r * 0.05, side * r * 0.21, r * 0.065, r * 0.05, side * 0.2, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#3a2a19';
  }
  // nasal cavity and jaw seam
  ctx.fillStyle = '#4c371f';
  ctx.beginPath();
  ctx.ellipse(r * 0.38, 0, r * 0.07, r * 0.11, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(97, 74, 46, 0.8)';
  ctx.lineWidth = Math.max(0.45 * S, r * 0.02);
  ctx.beginPath();
  ctx.moveTo(-r * 0.4, r * 0.16);
  ctx.quadraticCurveTo(r * 0.1, r * 0.26, r * 0.66, r * 0.1);
  ctx.stroke();
  // teeth
  ctx.fillStyle = '#f3e8cf';
  for (let i = 0; i < 4; i++) {
    const tx = r * (0.32 + i * 0.1);
    ctx.beginPath();
    ctx.moveTo(tx, r * 0.1);
    ctx.lineTo(tx + r * 0.04, r * 0.18);
    ctx.lineTo(tx + r * 0.07, r * 0.08);
    ctx.closePath();
    ctx.fill();
  }
  // horns sweeping back
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.scale(1, side);
    ctx.fillStyle = '#c7ad83';
    ctx.beginPath();
    ctx.moveTo(-r * 0.28, -r * 0.26);
    ctx.bezierCurveTo(-r * 0.5, -r * 0.62, -r * 0.92, -r * 0.72, -r * 1.18, -r * 0.58);
    ctx.bezierCurveTo(-r * 0.82, -r * 0.5, -r * 0.56, -r * 0.34, -r * 0.4, -r * 0.18);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(112, 88, 56, 0.65)';
    ctx.lineWidth = Math.max(0.35 * S, r * 0.015);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // wind-blown sand drift burying the lower half
  const drift = ctx.createLinearGradient(0, r * 0.1, 0, r * 0.62);
  drift.addColorStop(0, 'rgba(224, 190, 133, 0)');
  drift.addColorStop(0.55, 'rgba(224, 190, 133, 0.55)');
  drift.addColorStop(1, 'rgba(214, 176, 116, 0.9)');
  ctx.fillStyle = drift;
  ctx.beginPath();
  ctx.moveTo(-r * 1.85, r * 0.46);
  ctx.quadraticCurveTo(-r * 0.5, r * 0.08, r * 0.6, r * 0.35);
  ctx.quadraticCurveTo(r * 1.25, r * 0.52, r * 1.8, r * 0.34);
  ctx.lineTo(r * 1.8, r * 0.8);
  ctx.lineTo(-r * 1.85, r * 0.8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/* A distant Jawa sandcrawler parked on the flats. */
function drawSandcrawler(ctx, x, y, r, S, rng) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.03);

  // shadow
  ctx.fillStyle = 'rgba(61, 34, 12, 0.3)';
  ctx.beginPath();
  ctx.ellipse(r * 0.18, r * 0.58, r * 1.9, r * 0.45, 0, 0, TAU);
  ctx.fill();

  // treads
  for (const side of [-1, 1]) {
    const ty = side * r * 0.62;
    ctx.fillStyle = '#2f2923';
    roundRect(ctx, -r * 1.62, ty - r * 0.22, r * 3.28, r * 0.44, r * 0.19);
    ctx.fill();
    ctx.strokeStyle = '#17130f';
    ctx.lineWidth = Math.max(0.4 * S, r * 0.02);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(137, 119, 92, 0.4)';
    ctx.lineWidth = Math.max(0.3 * S, r * 0.012);
    for (let i = -1.5; i <= 1.5; i += 0.32) {
      ctx.beginPath();
      ctx.moveTo(r * i, ty - r * 0.16);
      ctx.lineTo(r * i, ty + r * 0.16);
      ctx.stroke();
    }
  }

  // rusted hull
  const hull = ctx.createLinearGradient(-r * 1.4, -r * 0.6, r * 1.4, r * 0.6);
  hull.addColorStop(0, '#b57a49');
  hull.addColorStop(0.4, '#8a5835');
  hull.addColorStop(0.8, '#6c432a');
  hull.addColorStop(1, '#4e2f1e');
  ctx.fillStyle = hull;
  roundRect(ctx, -r * 1.5, -r * 0.56, r * 2.9, r * 1.12, r * 0.12);
  ctx.fill();
  ctx.strokeStyle = '#3b2414';
  ctx.lineWidth = Math.max(0.6 * S, r * 0.028);
  ctx.stroke();

  // angled command nose
  ctx.fillStyle = '#96613b';
  ctx.beginPath();
  ctx.moveTo(r * 1.36, -r * 0.42);
  ctx.lineTo(r * 1.86, -r * 0.24);
  ctx.lineTo(r * 1.9, r * 0.2);
  ctx.lineTo(r * 1.36, r * 0.42);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#3b2414';
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 205, 120, 0.9)';
  ctx.shadowColor = 'rgba(255, 185, 90, 0.8)';
  ctx.shadowBlur = 5 * S;
  roundRect(ctx, r * 1.63, -r * 0.12, r * 0.15, r * 0.24, r * 0.04);
  ctx.fill();
  ctx.shadowBlur = 0;

  // panel seams and rivets
  ctx.strokeStyle = 'rgba(54, 32, 17, 0.6)';
  ctx.lineWidth = Math.max(0.35 * S, r * 0.014);
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(r * i * 0.72, -r * 0.5);
    ctx.lineTo(r * i * 0.72, r * 0.5);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(-r * 1.4, -r * 0.06);
  ctx.lineTo(r * 1.3, -r * 0.1);
  ctx.stroke();
  ctx.fillStyle = 'rgba(220, 186, 135, 0.45)';
  for (let i = -1.35; i < 1.35; i += 0.45) {
    for (const sy of [-0.4, 0.36]) {
      ctx.beginPath();
      ctx.arc(r * i, r * sy, Math.max(0.3 * S, r * 0.012), 0, TAU);
      ctx.fill();
    }
  }

  // rust streaks and weathering
  for (let i = 0; i < 12; i++) {
    const sx = -r * 1.35 + rng() * r * 2.6;
    const sy = -r * 0.46 + rng() * r * 0.3;
    ctx.strokeStyle = `rgba(63, 34, 17, ${0.12 + rng() * 0.2})`;
    ctx.lineWidth = Math.max(0.5 * S, r * 0.014);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + (rng() - 0.5) * r * 0.1, sy + r * (0.12 + rng() * 0.3));
    ctx.stroke();
  }

  // roof hatch and antenna
  ctx.fillStyle = '#5a3822';
  roundRect(ctx, -r * 0.85, -r * 0.38, r * 0.5, r * 0.32, r * 0.05);
  ctx.fill();
  ctx.strokeStyle = '#bca987';
  ctx.lineWidth = Math.max(0.4 * S, r * 0.014);
  ctx.beginPath();
  ctx.moveTo(r * 0.2, -r * 0.48);
  ctx.lineTo(r * 0.26, -r * 0.88);
  ctx.stroke();
  ctx.fillStyle = '#ffb35a';
  ctx.beginPath();
  ctx.arc(r * 0.26, -r * 0.9, Math.max(0.5 * S, r * 0.026), 0, TAU);
  ctx.fill();

  // dust skirt
  ctx.fillStyle = 'rgba(226, 190, 133, 0.32)';
  ctx.beginPath();
  ctx.ellipse(0, r * 0.55, r * 1.75, r * 0.18, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawDecor(ctx, d, x, y, r, S, rng, theme = THEMES.desert) {
  switch (d.type) {
    case 'rock': drawRock(ctx, x, y, r, rng, theme); break;
    case 'mesa': drawMesa(ctx, x, y, r, S, rng); break;
    case 'kraytskull': drawKraytSkull(ctx, x, y, r, S, rng); break;
    case 'sandcrawler': drawSandcrawler(ctx, x, y, r, S, rng); break;
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
  const flying = body === 'stap' || body === 'probe' || body === 'droidboss' || body === 'bikerscout';
  const bob = flying ? Math.sin(time * 8 + e.phase) * 1.4 * V : 0;
  ctx.fillStyle = 'rgba(20, 16, 12, 0.28)';
  ctx.beginPath();
  ctx.ellipse(2 * V, (def.radius * 0.62 + 3) * V, def.radius * 0.95 * V, def.radius * 0.4 * V, 0, 0, TAU);
  ctx.fill();

  ctx.translate(0, bob);
  ctx.rotate(e.angle || 0);
  ctx.scale(V, V);

  if (body === 'womprat') drawWompratBody(ctx, e, time);
  else if (body === 'bantha') drawBanthaBody(ctx, e, time);
  else if (body === 'krayt') drawKraytBody(ctx, e, time);
  else if (body === 'droid') drawDroidBody(ctx, e, time, slow);
  else if (body === 'stap') drawStapBody(ctx, e, time);
  else if (body === 'b2') drawB2Body(ctx, e, time);
  else if (body === 'droidboss') drawDroidGunshipBody(ctx, e, time);
  else if (body === 'snowtrooper') drawSnowtrooperBody(ctx, e, time);
  else if (body === 'probe') drawProbeBody(ctx, e, time);
  else if (body === 'atst') drawAtstBody(ctx, e, time);
  else if (body === 'atat') drawAtAtBody(ctx, e, time);
  else if (body === 'magmatrooper') drawMagmaTrooperBody(ctx, e, time);
  else if (body === 'skitter') drawSkitterBody(ctx, e, time);
  else if (body === 'miningdroid') drawMiningDroidBody(ctx, e, time);
  else if (body === 'sith') drawSithBody(ctx, e, time);
  else if (body === 'ewok') drawEwokBody(ctx, e, time);
  else if (body === 'boarwolf') drawBoarWolfBody(ctx, e, time);
  else if (body === 'gorax') drawGoraxBody(ctx, e, time);
  else if (body === 'stormtrooper') drawStormtrooperBody(ctx, e, time);
  else if (body === 'bikerscout') drawBikerScoutBody(ctx, e, time);
  else if (body === 'commando') drawCommandoBody(ctx, e, time);
  else if (body === 'commandwalker') drawCommandWalkerBody(ctx, e, time);

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

/* —— Tatooine · womp rat ——————————————————————————————
   A low, hunched desert rodent seen from above: scruffy grey-brown
   fur, oversized hind paws, and a long bare tail that whips behind it. */
function drawWompratBody(ctx, e, time) {
  const p = e.phase || 0;
  const stride = Math.sin(time * 17 + p);
  const strideB = Math.sin(time * 15.5 + p + 1.9);
  const tailWave = Math.sin(time * 7.4 + p);
  const tailWave2 = Math.sin(time * 7.4 + p - 0.9);

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Long bare tail: thick at the root, tapering to a whip. Ring marks
  // and a pale underside keep it from reading as a fifth leg.
  const tailPts = [
    [-9.6, 0.2],
    [-14.4, tailWave * 0.5],
    [-19.6, 0.6 + tailWave * 1.4],
    [-24.4, 1.0 + tailWave2 * 2.4],
    [-28.4, 1.2 + tailWave2 * 3.2],
  ];
  const tailW = [2.6, 2.0, 1.4, 0.9, 0.45];
  for (let i = 0; i < tailPts.length - 1; i++) {
    ctx.strokeStyle = i < 2 ? '#8d6a55' : '#9c7863';
    ctx.lineWidth = tailW[i];
    ctx.beginPath();
    ctx.moveTo(tailPts[i][0], tailPts[i][1]);
    ctx.quadraticCurveTo(
      (tailPts[i][0] + tailPts[i + 1][0]) / 2,
      (tailPts[i][1] + tailPts[i + 1][1]) / 2,
      tailPts[i + 1][0], tailPts[i + 1][1],
    );
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(224, 192, 166, 0.42)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(-10.2, 0.1);
  ctx.quadraticCurveTo(-19.0, 0.3, -27.4, 1.0 + tailWave2 * 3.2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(84, 58, 44, 0.5)';
  ctx.lineWidth = 0.45;
  for (let i = 1; i < 4; i++) {
    const [tx, ty] = tailPts[i];
    ctx.beginPath();
    ctx.moveTo(tx - 0.3, ty - tailW[i] * 0.8);
    ctx.lineTo(tx + 0.5, ty + tailW[i] * 0.8);
    ctx.stroke();
  }

  // Four short, bent legs tucked close to the body. Paws are broad and
  // toed, which reads as a scurrying rodent rather than an insect.
  const legs = [
    { hx: 4.6, hy: -3.9, kx: 5.7, ky: -5.7, px: 7.7, py: -6.5, s: stride },
    { hx: 4.6, hy: 3.9, kx: 5.7, ky: 5.7, px: 7.7, py: 6.5, s: -stride },
    { hx: -5.4, hy: -4.0, kx: -6.6, ky: -5.9, px: -8.8, py: -6.7, s: -strideB },
    { hx: -5.4, hy: 4.0, kx: -6.6, ky: 5.9, px: -8.8, py: 6.7, s: strideB },
  ];
  for (const leg of legs) {
    const swing = leg.s * 0.95;
    ctx.strokeStyle = '#5f4a3a';
    ctx.lineWidth = 3.1;
    ctx.beginPath();
    ctx.moveTo(leg.hx, leg.hy);
    ctx.lineTo(leg.kx + swing * 0.35, leg.ky);
    ctx.stroke();
    ctx.strokeStyle = '#705947';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(leg.kx + swing * 0.35, leg.ky);
    ctx.lineTo(leg.px + swing, leg.py);
    ctx.stroke();
    // broad paw with three toe marks
    ctx.fillStyle = '#4f3d31';
    ctx.beginPath();
    ctx.ellipse(leg.px + swing, leg.py, 2.15, 1.3, Math.atan2(leg.py, leg.px), 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(194, 166, 136, 0.5)';
    ctx.lineWidth = 0.35;
    for (let toe = -1; toe <= 1; toe++) {
      ctx.beginPath();
      ctx.moveTo(leg.px + swing, leg.py);
      ctx.lineTo(leg.px + swing + Math.cos(leg.py * 0.14 + toe * 0.28) * 2.3,
        leg.py + toe * 0.95 + Math.sign(leg.py) * 0.6);
      ctx.stroke();
    }
  }

  // Pear-shaped torso: narrow at the shoulders, heavy at the rump.
  const body = ctx.createLinearGradient(-8, -6, 8, 6);
  body.addColorStop(0, '#ab9074');
  body.addColorStop(0.38, '#947b62');
  body.addColorStop(0.78, '#7b6451');
  body.addColorStop(1, '#665143');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(-11.2, 0);
  ctx.bezierCurveTo(-11.4, -3.6, -7.8, -5.4, -2.0, -5.6);
  ctx.bezierCurveTo(2.8, -5.8, 6.2, -4.6, 7.8, -2.4);
  ctx.lineTo(7.8, 2.4);
  ctx.bezierCurveTo(6.2, 4.6, 2.8, 5.8, -2.0, 5.6);
  ctx.bezierCurveTo(-7.8, 5.4, -11.4, 3.6, -11.2, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(67, 48, 35, 0.55)';
  ctx.lineWidth = 0.7;
  ctx.stroke();

  // Scruffy fur fringe, mostly along the sides and rump rather than a
  // perfect radial ring.
  const furCols = ['rgba(88, 68, 52, 0.8)', 'rgba(186, 160, 130, 0.55)', 'rgba(111, 89, 69, 0.75)'];
  for (let i = 0; i < 18; i++) {
    const a = 0.52 + (i / 17) * (TAU - 1.04);
    const bx = Math.cos(a) * 8.5;
    const by = Math.sin(a) * 4.7;
    const len = 0.75 + ((i * 5) % 4) * 0.28;
    const sweep = 0.32 + Math.abs(Math.cos(a)) * 0.25;
    ctx.strokeStyle = furCols[i % furCols.length];
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(bx * 0.93, by * 0.93);
    ctx.lineTo(bx + Math.cos(a + sweep) * len, by + Math.sin(a + sweep) * len);
    ctx.stroke();
  }
  // soft fur strokes following the spine
  ctx.strokeStyle = 'rgba(214, 190, 160, 0.32)';
  ctx.lineWidth = 0.55;
  ctx.beginPath();
  ctx.moveTo(-8.8, 0.4);
  ctx.quadraticCurveTo(-1.4, -1.0, 6.0, -0.2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(77, 57, 42, 0.22)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 5; i++) {
    const sx = -7.8 + i * 2.6;
    const sy = -3.4 + (i % 2) * 1.2;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + 1.4, sy - 0.7);
    ctx.moveTo(sx + 0.2, sy + 1.1);
    ctx.lineTo(sx + 1.6, sy + 0.4);
    ctx.stroke();
  }

  // High shoulder hump, blended into the coat instead of a pasted circle.
  const hump = ctx.createRadialGradient(2.4, -0.9, 0.4, 2.4, -0.5, 5.4);
  hump.addColorStop(0, 'rgba(193, 169, 139, 0.55)');
  hump.addColorStop(0.55, 'rgba(134, 108, 84, 0.32)');
  hump.addColorStop(1, 'rgba(112, 88, 68, 0)');
  ctx.fillStyle = hump;
  ctx.beginPath();
  ctx.ellipse(2.4, -0.3, 5.2, 5.0, 0, 0, TAU);
  ctx.fill();

  // Head: blunt wedge with round ears, dark eyes, whiskers, incisors.
  const hg = ctx.createLinearGradient(6.0, -4, 15.8, 4);
  hg.addColorStop(0, '#a68b6f');
  hg.addColorStop(0.52, '#8d735a');
  hg.addColorStop(1, '#6d5745');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.moveTo(6.2, -3.5);
  ctx.quadraticCurveTo(9.0, -4.6, 11.5, -3.7);
  ctx.quadraticCurveTo(14.3, -2.8, 15.5, 0);
  ctx.quadraticCurveTo(14.3, 2.8, 11.5, 3.7);
  ctx.quadraticCurveTo(9.0, 4.6, 6.2, 3.5);
  ctx.quadraticCurveTo(5.5, 0, 6.2, -3.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#57432f';
  ctx.lineWidth = 0.7;
  ctx.stroke();

  // ears, set wide and angled back
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#745c48';
    ctx.beginPath();
    ctx.ellipse(7.7, side * 4.0, 2.15, 1.45, side * 0.62, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(211, 162, 140, 0.85)';
    ctx.beginPath();
    ctx.ellipse(7.85, side * 4.0, 1.15, 0.72, side * 0.62, 0, TAU);
    ctx.fill();
  }

  // eyes
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#1d140f';
    ctx.beginPath();
    ctx.arc(11.2, side * 1.9, 0.82, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 202, 108, 0.95)';
    ctx.beginPath();
    ctx.arc(11.34, side * 1.86, 0.28, 0, TAU);
    ctx.fill();
  }

  // nose, nostrils, short whiskers
  ctx.fillStyle = '#c08674';
  ctx.beginPath();
  ctx.ellipse(15.2, 0, 0.68, 0.54, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#54382e';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(15.45, side * 0.28, 0.16, 0.12, 0, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(234, 211, 182, 0.6)';
  ctx.lineWidth = 0.3;
  for (const side of [-1, 1]) {
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(13.3, side * 0.82);
      ctx.quadraticCurveTo(14.8, side * (1.45 + i * 0.42), 16.6, side * (2.1 + i * 0.55));
      ctx.stroke();
    }
  }
  // two small incisors
  ctx.fillStyle = '#f0e3c8';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(14.4, side * 0.52);
    ctx.lineTo(15.5, side * 0.18);
    ctx.lineTo(14.4, side * -0.02);
    ctx.closePath();
    ctx.fill();
  }
  // cheek tufts
  ctx.strokeStyle = 'rgba(118, 94, 72, 0.85)';
  ctx.lineWidth = 0.5;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(9.6, side * 3.4);
    ctx.lineTo(8.3, side * 4.5);
    ctx.moveTo(10.8, side * 3.2);
    ctx.lineTo(9.9, side * 4.4);
    ctx.stroke();
  }

  // quick whisker twitch
  const twitch = Math.sin(time * 13 + p) * 0.2;
  ctx.strokeStyle = 'rgba(234, 214, 184, 0.4)';
  ctx.lineWidth = 0.24;
  ctx.beginPath();
  ctx.moveTo(13.5, -0.5);
  ctx.lineTo(16.2, -2.3 + twitch);
  ctx.moveTo(13.5, 0.5);
  ctx.lineTo(16.2, 2.3 - twitch);
  ctx.stroke();
}

/* —— Tatooine · bantha ————————————————————————————————
   A mountain of dark shaggy fur on four column legs. The huge
   ivory horns sweep forward from a low, bearded head. */
function drawBanthaBody(ctx, e, time) {
  const p = e.phase || 0;
  const gait = Math.sin(time * 4.6 + p);
  const gaitB = Math.sin(time * 4.6 + p + 2.1);
  const tailSway = Math.sin(time * 2.3 + p);

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Tufted tail.
  ctx.strokeStyle = '#3f2a1d';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-16.5, 0);
  ctx.quadraticCurveTo(-22.6, tailSway * 1.4, -26.4, tailSway * 2.2);
  ctx.stroke();
  ctx.fillStyle = '#3a2618';
  ctx.beginPath();
  ctx.ellipse(-27.4, tailSway * 2.3, 3.4, 2.1, tailSway * 0.35, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(154, 113, 77, 0.5)';
  ctx.lineWidth = 0.55;
  for (let i = 0; i < 5; i++) {
    const a = -0.8 + i * 0.4;
    ctx.beginPath();
    ctx.moveTo(-27.2, tailSway * 2.3);
    ctx.lineTo(-27.2 + Math.cos(a) * 4.6, tailSway * 2.3 + Math.sin(a) * 3.5);
    ctx.stroke();
  }

  // Four heavy column legs, set wide enough to carry the body.
  const legs = [
    { x: 8.0, y: -7.2, kx: 8.6, kx2: 8.9, ky: -13.4, fx: 9.8, fy: -18.0, s: gait },
    { x: 8.0, y: 7.2, kx: 8.6, kx2: 8.9, ky: 13.4, fx: 9.8, fy: 18.0, s: -gait },
    { x: -10.2, y: -6.8, kx: -10.8, kx2: -11.1, ky: -12.8, fx: -12.4, fy: -17.4, s: -gaitB },
    { x: -10.2, y: 6.8, kx: -10.8, kx2: -11.1, ky: 12.8, fx: -12.4, fy: 17.4, s: gaitB },
  ];
  for (const leg of legs) {
    const swing = leg.s * 1.2;
    const dir = Math.sign(leg.y);
    // upper leg, shaggy at the shoulder
    ctx.strokeStyle = '#573b26';
    ctx.lineWidth = 7.4;
    ctx.beginPath();
    ctx.moveTo(leg.x, leg.y);
    ctx.lineTo(leg.kx + swing * 0.3, leg.ky);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(122, 87, 58, 0.8)';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(leg.x + 1.6, leg.y - dir * 1.0);
    ctx.lineTo(leg.kx + swing * 0.3 + 1.4, leg.ky - dir * 0.8);
    ctx.stroke();
    // knee and lower leg
    ctx.fillStyle = '#3b2819';
    ctx.beginPath();
    ctx.ellipse(leg.kx + swing * 0.3, leg.ky, 3.6, 2.8, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#6b4a30';
    ctx.lineWidth = 5.0;
    ctx.beginPath();
    ctx.moveTo(leg.kx2 + swing * 0.55, leg.ky);
    ctx.lineTo(leg.fx + swing, leg.fy);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(142, 102, 68, 0.55)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(leg.kx2 + swing * 0.55 + 1.0, leg.ky + dir * 0.6);
    ctx.lineTo(leg.fx + swing + 0.8, leg.fy - dir * 0.5);
    ctx.stroke();
    // broad hoof
    ctx.fillStyle = '#2c1c12';
    ctx.beginPath();
    ctx.ellipse(leg.fx + swing, leg.fy, 3.9, 2.3, Math.atan2(leg.fy, leg.fx), 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(150, 113, 78, 0.6)';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(leg.fx + swing - 1.7, leg.fy);
    ctx.lineTo(leg.fx + swing + 1.7, leg.fy);
    ctx.stroke();
    // shaggy fringe over the knee
    ctx.strokeStyle = 'rgba(30, 18, 11, 0.8)';
    ctx.lineWidth = 0.9;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(leg.kx + swing * 0.3 + i * 1.7, leg.ky + dir * 1.2);
      ctx.lineTo(leg.kx + swing * 0.3 + i * 2.0, leg.ky + dir * 3.4);
      ctx.stroke();
    }
  }

  // Massive barrel body with a high shoulder hump and heavy rump.
  const body = ctx.createLinearGradient(-8, -11, 17, 11);
  body.addColorStop(0, '#684a31');
  body.addColorStop(0.34, '#533724');
  body.addColorStop(0.72, '#442d1c');
  body.addColorStop(1, '#322014');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(-18.0, 0);
  ctx.bezierCurveTo(-18.2, -5.0, -14.4, -7.4, -7.4, -7.8);
  ctx.bezierCurveTo(0.2, -8.2, 6.6, -8.8, 10.6, -6.8);
  ctx.bezierCurveTo(14.0, -5.0, 15.8, -2.4, 16.0, 0);
  ctx.bezierCurveTo(15.8, 2.4, 14.0, 5.0, 10.6, 6.8);
  ctx.bezierCurveTo(6.6, 8.8, 0.2, 8.2, -7.4, 7.8);
  ctx.bezierCurveTo(-14.4, 7.4, -18.2, 5.0, -18.0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#180e08';
  ctx.lineWidth = 1.15;
  ctx.stroke();

  // Shaggy silhouette: overlapping fur clumps break the smooth oval so
  // the body reads as a coat rather than a beetle shell.
  for (let i = 0; i < 26; i++) {
    const a = 1.42 + (i / 25) * (TAU - 2.84);
    const bx = Math.cos(a) * 15.6;
    const by = Math.sin(a) * 7.6;
    const len = 2.2 + ((i * 5) % 4) * 0.55;
    const tx = bx + Math.cos(a) * len;
    const ty = by + Math.sin(a) * len;
    const px = -Math.sin(a) * 2.1;
    const py = Math.cos(a) * 2.1;
    ctx.fillStyle = i % 3 === 0 ? '#5b3d27' : i % 3 === 1 ? '#382417' : '#482f1e';
    ctx.beginPath();
    ctx.moveTo(bx + px, by + py);
    ctx.quadraticCurveTo(bx + Math.cos(a) * len * 0.55 + px * 0.4, by + Math.sin(a) * len * 0.55 + py * 0.4, tx, ty);
    ctx.quadraticCurveTo(bx + Math.cos(a) * len * 0.55 - px * 0.4, by + Math.sin(a) * len * 0.55 - py * 0.4, bx - px, by - py);
    ctx.closePath();
    ctx.fill();
  }

  // Shaggy coat fringe: short, irregular clumps along the flanks and rump.
  const furCols = ['rgba(96, 64, 41, 0.8)', 'rgba(58, 38, 24, 0.85)', 'rgba(132, 94, 61, 0.42)'];
  for (let i = 0; i < 20; i++) {
    const a = 1.35 + (i / 19) * (TAU - 2.7);
    const bx = Math.cos(a) * 16.0;
    const by = Math.sin(a) * 7.7;
    const len = 1.0 + ((i * 5) % 4) * 0.4;
    const sweep = -0.4 + Math.sign(Math.cos(a)) * 0.22;
    ctx.strokeStyle = furCols[i % furCols.length];
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(bx * 0.95, by * 0.95);
    ctx.lineTo(bx + Math.cos(a + sweep) * len, by + Math.sin(a + sweep) * len);
    ctx.stroke();
  }
  // Matted fur texture: short, chaotic strands that follow the coat
  // instead of long parallel ribs.
  for (let i = 0; i < 42; i++) {
    const sx = -14.4 + ((i * 17) % 292) / 10;
    const sy = -8.4 + ((i * 29) % 168) / 10;
    if ((sx / 15.8) ** 2 + (sy / 8.4) ** 2 > 0.9) continue;
    const len = 1.1 + ((i * 7) % 5) * 0.38;
    const rise = (((i * 11) % 7) - 3) * 0.14;
    ctx.strokeStyle = i % 3 === 0 ? 'rgba(180, 137, 94, 0.28)' : 'rgba(26, 16, 10, 0.42)';
    ctx.lineWidth = 0.62;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(sx + len * 0.5, sy + rise * 1.6, sx + len, sy + rise);
    ctx.stroke();
  }
  // darker spine crease and a lighter shoulder sheen
  ctx.strokeStyle = 'rgba(24, 14, 8, 0.35)';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-14.6, 0.2);
  ctx.quadraticCurveTo(-2.0, -1.0, 11.0, -0.2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(190, 148, 104, 0.22)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-6.0, -5.4);
  ctx.quadraticCurveTo(3.0, -7.0, 10.2, -4.4);
  ctx.stroke();

  // Shoulder hump, built from matted fur.
  const hump = ctx.createRadialGradient(3.0, -1.0, 1.0, 3.4, 0, 8.4);
  hump.addColorStop(0, 'rgba(132, 92, 60, 0.7)');
  hump.addColorStop(0.6, 'rgba(60, 39, 24, 0.42)');
  hump.addColorStop(1, 'rgba(48, 30, 18, 0)');
  ctx.fillStyle = hump;
  ctx.beginPath();
  ctx.ellipse(3.4, 0, 8.0, 6.4, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(178, 136, 94, 0.24)';
  ctx.lineWidth = 0.7;
  for (let i = 0; i < 7; i++) {
    const sx = -2.6 + ((i * 13) % 80) / 10;
    const sy = -4.4 + ((i * 7) % 70) / 10;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + 1.6, sy - 0.7);
    ctx.stroke();
  }

  // Low-slung neck and heavy mane, trimmed back so the skull stays readable.
  ctx.fillStyle = '#352216';
  ctx.beginPath();
  ctx.ellipse(11.4, 0, 5.2, 6.6, 0, 0, TAU);
  ctx.fill();
  // jagged mane fringe
  for (let i = 0; i < 14; i++) {
    const a = 0.8 + (i / 13) * (TAU - 1.6);
    const bx = 11.4 + Math.cos(a) * 4.8;
    const by = Math.sin(a) * 6.0;
    const len = 1.4 + (i % 3) * 0.5;
    const px = -Math.sin(a) * 1.3;
    const py = Math.cos(a) * 1.3;
    ctx.fillStyle = i % 2 ? '#2c1b11' : '#402a1b';
    ctx.beginPath();
    ctx.moveTo(bx + px, by + py);
    ctx.quadraticCurveTo(bx - 0.7 + Math.cos(a) * 0.8, by + Math.sin(a) * 1.2, bx - 1.2 + Math.cos(a) * len, by + Math.sin(a) * len);
    ctx.quadraticCurveTo(bx - 0.7 - Math.cos(a) * 0.4, by + Math.sin(a) * 0.8, bx - px, by - py);
    ctx.closePath();
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(122, 85, 56, 0.8)';
  ctx.lineWidth = 0.95;
  for (let i = 0; i < 18; i++) {
    const a = 0.7 + (i / 17) * (TAU - 1.4);
    const bx = 11.4 + Math.cos(a) * 4.6;
    const by = Math.sin(a) * 5.8;
    const len = 1.0 + (i % 3) * 0.4;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx - 1.3 - Math.abs(Math.cos(a)) * 1.2, by + Math.sin(a) * len);
    ctx.stroke();
  }

  // Head: broad skull tapering to a blunt muzzle.
  const hg = ctx.createLinearGradient(14, -6, 29, 6);
  hg.addColorStop(0, '#7d5b3e');
  hg.addColorStop(0.5, '#63452b');
  hg.addColorStop(1, '#472e1c');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.moveTo(15.6, -5.4);
  ctx.quadraticCurveTo(21.0, -6.8, 25.4, -4.9);
  ctx.lineTo(28.2, -2.4);
  ctx.quadraticCurveTo(29.4, 0, 28.2, 2.4);
  ctx.lineTo(25.4, 4.9);
  ctx.quadraticCurveTo(21.0, 6.8, 15.6, 5.4);
  ctx.quadraticCurveTo(14.4, 0, 15.6, -5.4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#201309';
  ctx.lineWidth = 0.9;
  ctx.stroke();
  // muzzle pad and nostrils
  ctx.fillStyle = 'rgba(150, 110, 76, 0.32)';
  ctx.beginPath();
  ctx.ellipse(26.2, 0, 2.3, 3.2, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#150c07';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(27.8, side * 1.15, 0.66, 0.4, side * 0.3, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = '#24150c';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(27.3, 0);
  ctx.quadraticCurveTo(28.2, 0, 28.6, 0);
  ctx.stroke();
  // eyes, deep-set under a brow
  for (const side of [-1, 1]) {
    ctx.fillStyle = 'rgba(24, 14, 8, 0.85)';
    ctx.beginPath();
    ctx.ellipse(22.4, side * 4.2, 1.7, 1.15, side * 0.2, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#0e0906';
    ctx.beginPath();
    ctx.arc(22.5, side * 4.2, 1.0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 194, 102, 0.95)';
    ctx.beginPath();
    ctx.arc(22.65, side * 4.2, 0.34, 0, TAU);
    ctx.fill();
  }

  // Enormous ivory horns: broad crescents that sweep out and forward from
  // the skull, framing the head without crossing the muzzle.
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.scale(1, side);
    const horn = ctx.createLinearGradient(17, 4, 36, 17);
    horn.addColorStop(0, '#7f6544');
    horn.addColorStop(0.32, '#ab936b');
    horn.addColorStop(0.66, '#d6c199');
    horn.addColorStop(0.9, '#bfa67d');
    horn.addColorStop(1, '#8f734c');
    ctx.fillStyle = horn;
    ctx.beginPath();
    ctx.moveTo(17.8, 5.0);
    ctx.bezierCurveTo(22.8, 13.4, 28.4, 17.8, 34.6, 13.6);
    ctx.bezierCurveTo(29.6, 9.6, 23.6, 7.0, 20.2, 1.8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#6a5336';
    ctx.lineWidth = 0.65;
    ctx.stroke();
    // growth rings
    ctx.strokeStyle = 'rgba(104, 79, 47, 0.4)';
    ctx.lineWidth = 0.42;
    for (let i = 0; i < 3; i++) {
      const t = 0.2 + i * 0.26;
      const bx = 20.4 + t * 11.6;
      const by = 6.8 + t * 7.0;
      ctx.beginPath();
      ctx.moveTo(bx - 0.9, by - 1.7);
      ctx.lineTo(bx + 0.9, by + 1.9);
      ctx.stroke();
    }
    // polished outer edge
    ctx.strokeStyle = 'rgba(255, 246, 219, 0.5)';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(19.6, 7.0);
    ctx.quadraticCurveTo(27.0, 15.4, 33.8, 13.9);
    ctx.stroke();
    ctx.restore();
  }

  // Beard tufts hanging from the jaw, kept clear of the face.
  ctx.strokeStyle = 'rgba(26, 15, 9, 0.85)';
  ctx.lineWidth = 1.1;
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const bx = 24.8 - i * 0.9;
      const by = side * (4.4 + i * 0.5);
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(bx - 1.6, by + side * 0.9, bx - 2.6, by + side * 1.8);
      ctx.stroke();
    }
  }
  // small lower tusks
  ctx.fillStyle = '#d6c29c';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(25.4, side * 3.9);
    ctx.lineTo(27.9, side * 4.6);
    ctx.lineTo(26.2, side * 3.0);
    ctx.closePath();
    ctx.fill();
  }
}

/* —— Tatooine · krayt dragon ————————————————————————————
   The final-boss silhouette: a long tan armored reptile, wide
   shoulders, splayed claws, a horned skull, and a sweeping spiked tail. */
function drawKraytBody(ctx, e, time) {
  const p = e.phase || 0;
  const sway = Math.sin(time * 2.7 + p);
  const swayB = Math.sin(time * 2.7 + p - 0.8);
  const gait = Math.sin(time * 3.6 + p);
  const gaitB = Math.sin(time * 3.6 + p + Math.PI * 0.75);

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  /* --- tail ---------------------------------------------------------- */
  // Long, tapered and sinuous. Built from a sampled centerline so the
  // silhouette stays smooth while the tip whips behind the boss.
  const TAIL_N = 20;
  const tailUpper = [];
  const tailLower = [];
  for (let i = 0; i <= TAIL_N; i++) {
    const t = i / TAIL_N;
    const x = -11 - 51 * t;
    const cy = swayB * 9.2 * t * t + sway * 1.4 * t * (1 - t);
    const w = 6.8 * Math.pow(1 - t, 0.82) + 0.12;
    tailUpper.push([x, cy - w]);
    tailLower.push([x, cy + w]);
  }
  const tailGrad = ctx.createLinearGradient(-10, -4, -58, 6);
  tailGrad.addColorStop(0, '#b58b56');
  tailGrad.addColorStop(0.55, '#a07848');
  tailGrad.addColorStop(1, '#7f5b36');
  ctx.fillStyle = tailGrad;
  ctx.beginPath();
  ctx.moveTo(tailUpper[0][0], tailUpper[0][1]);
  for (let i = 1; i <= TAIL_N; i++) ctx.lineTo(tailUpper[i][0], tailUpper[i][1]);
  for (let i = TAIL_N; i >= 0; i--) ctx.lineTo(tailLower[i][0], tailLower[i][1]);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#5c3f27';
  ctx.lineWidth = 0.95;
  ctx.stroke();

  // dorsal stripe follows the same centerline
  ctx.strokeStyle = '#7a5732';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  for (let i = 0; i <= TAIL_N; i++) {
    const t = i / TAIL_N;
    const x = -11 - 51 * t;
    const cy = swayB * 9.2 * t * t + sway * 1.4 * t * (1 - t);
    if (i === 0) ctx.moveTo(x, cy);
    else ctx.lineTo(x, cy);
  }
  ctx.stroke();
  ctx.strokeStyle = 'rgba(241, 214, 172, 0.32)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  for (let i = 0; i <= TAIL_N; i++) {
    const t = i / TAIL_N;
    const x = -11 - 51 * t;
    const cy = swayB * 9.2 * t * t + sway * 1.4 * t * (1 - t) - 1.2 * (1 - t);
    if (i === 0) ctx.moveTo(x, cy);
    else ctx.lineTo(x, cy);
  }
  ctx.stroke();

  // transverse scale bands
  for (let i = 0; i < 6; i++) {
    const t = (i + 0.4) / 6;
    const x = -11 - 51 * t;
    const cy = swayB * 9.2 * t * t + sway * 1.4 * t * (1 - t);
    const w = (6.8 * Math.pow(1 - t, 0.82) + 0.12) * 0.92;
    ctx.strokeStyle = `rgba(84, 57, 32, ${0.3 + t * 0.2})`;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(x + 0.8, cy - w);
    ctx.quadraticCurveTo(x - 1.2, cy, x + 0.8, cy + w);
    ctx.stroke();
  }

  // dorsal spines along the tail
  for (let i = 0; i < 7; i++) {
    const t = (i + 0.3) / 7;
    const x = -11 - 51 * t;
    const cy = swayB * 9.2 * t * t + sway * 1.4 * t * (1 - t);
    const w = 6.8 * Math.pow(1 - t, 0.82) + 0.12;
    const len = 4.6 * (1 - t * 0.5);
    ctx.fillStyle = i % 2 ? '#6f4e2e' : '#7d5935';
    ctx.beginPath();
    ctx.moveTo(x + len * 0.5, cy - w);
    ctx.lineTo(x - len * 0.7, cy - w - len);
    ctx.lineTo(x - len * 0.25, cy - w + 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(239, 212, 169, 0.3)';
    ctx.lineWidth = 0.45;
    ctx.stroke();
  }

  /* --- legs ---------------------------------------------------------- */
  const legs = [
    { hx: 10.0, hy: -8.0, kx: 15.0, ky: -15.0, ax: 20.5, ay: -20.5, s: gait, front: true },
    { hx: 10.0, hy: 8.0, kx: 15.0, ky: 15.0, ax: 20.5, ay: 20.5, s: -gait, front: true },
    { hx: -9.0, hy: -8.2, kx: -14.0, ky: -14.6, ax: -19.5, ay: -19.8, s: -gaitB, front: false },
    { hx: -9.0, hy: 8.2, kx: -14.0, ky: 14.6, ax: -19.5, ay: 19.8, s: gaitB, front: false },
  ];
  for (const leg of legs) {
    const swing = leg.s * 0.9;
    const dir = Math.sign(leg.hy);
    // upper limb
    ctx.strokeStyle = leg.front ? '#8a6741' : '#7b5a39';
    ctx.lineWidth = leg.front ? 8.6 : 9.6;
    ctx.beginPath();
    ctx.moveTo(leg.hx, leg.hy);
    ctx.lineTo(leg.kx + swing * 0.3, leg.ky);
    ctx.stroke();
    // knee
    ctx.fillStyle = '#715234';
    ctx.beginPath();
    ctx.ellipse(leg.kx + swing * 0.3, leg.ky, 4.4, 3.8, 0, 0, TAU);
    ctx.fill();
    // lower limb
    ctx.strokeStyle = '#967247';
    ctx.lineWidth = 5.6;
    ctx.beginPath();
    ctx.moveTo(leg.kx + swing * 0.3, leg.ky);
    ctx.lineTo(leg.ax + swing * 0.65, leg.ay);
    ctx.stroke();
    // ankle pad
    ctx.fillStyle = '#7b5a39';
    ctx.beginPath();
    ctx.ellipse(leg.ax + swing * 0.65, leg.ay, 3.4, 2.9, 0, 0, TAU);
    ctx.fill();
    // three curved talons
    const baseX = leg.ax + swing * 0.65;
    const baseY = leg.ay;
    const ang = Math.atan2(baseY - leg.ky, baseX - leg.kx);
    for (let c = -1; c <= 1; c++) {
      const a = ang + c * 0.34 + (leg.front ? 0.05 : 0);
      const tipX = baseX + Math.cos(a) * 6.6;
      const tipY = baseY + Math.sin(a) * 6.6;
      ctx.fillStyle = c === 0 ? '#e2d0a8' : '#d3bd92';
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.quadraticCurveTo(baseX + Math.cos(a) * 3.8, baseY + Math.sin(a) * 3.8 - 0.8, tipX, tipY);
      ctx.quadraticCurveTo(baseX + Math.cos(a - 0.28) * 3.4, baseY + Math.sin(a - 0.28) * 3.4, baseX + Math.cos(a - 0.5) * 1.5, baseY + Math.sin(a - 0.5) * 1.5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(93, 67, 36, 0.55)';
      ctx.lineWidth = 0.35;
      ctx.stroke();
    }
    // scale plates on the shoulder
    ctx.fillStyle = 'rgba(122, 87, 50, 0.55)';
    ctx.beginPath();
    ctx.ellipse(leg.hx + 1.2, leg.hy - dir * 1.0, 3.4, 2.2, dir * 0.35, 0, TAU);
    ctx.fill();
  }

  /* --- body ---------------------------------------------------------- */
  const bodyGrad = ctx.createLinearGradient(-8, -13, 18, 13);
  bodyGrad.addColorStop(0, '#e0c493');
  bodyGrad.addColorStop(0.35, '#c9a36e');
  bodyGrad.addColorStop(0.72, '#a87f50');
  bodyGrad.addColorStop(1, '#8a653e');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(-16.0, 0);
  ctx.bezierCurveTo(-16.0, -6.0, -12.0, -10.6, -4.0, -11.5);
  ctx.bezierCurveTo(4.0, -12.3, 13.0, -10.6, 17.0, -6.8);
  ctx.bezierCurveTo(19.0, -4.2, 19.0, 4.2, 17.0, 6.8);
  ctx.bezierCurveTo(13.0, 10.6, 4.0, 12.3, -4.0, 11.5);
  ctx.bezierCurveTo(-12.0, 10.6, -16.0, 6.0, -16.0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#5b3f26';
  ctx.lineWidth = 1.15;
  ctx.stroke();

  // Dark dorsal armour, kept narrow so the tan flanks stay visible.
  const armor = ctx.createLinearGradient(-12, -8, 15, 8);
  armor.addColorStop(0, '#8d673d');
  armor.addColorStop(0.45, '#785530');
  armor.addColorStop(1, '#5c4025');
  ctx.fillStyle = armor;
  ctx.beginPath();
  ctx.moveTo(-13.0, 0);
  ctx.bezierCurveTo(-13.0, -4.8, -9.0, -7.6, -3.0, -8.0);
  ctx.bezierCurveTo(3.0, -8.4, 10.0, -6.8, 14.0, -3.8);
  ctx.bezierCurveTo(15.4, -1.3, 15.4, 1.3, 14.0, 3.8);
  ctx.bezierCurveTo(10.0, 6.8, 3.0, 8.4, -3.0, 8.0);
  ctx.bezierCurveTo(-9.0, 7.6, -13.0, 4.8, -13.0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(58, 38, 20, 0.7)';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // raised armor rim
  ctx.strokeStyle = 'rgba(226, 194, 146, 0.32)';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(-11.8, -4.2);
  ctx.bezierCurveTo(-8.0, -7.0, 1.0, -8.2, 9.0, -6.2);
  ctx.stroke();

  // overlapping flank scales
  for (const side of [-1, 1]) {
    for (let r = 0; r < 2; r++) {
      for (let i = 0; i < 4; i++) {
        const sx = -9.0 + i * 4.4 + r * 1.6;
        const sy = side * (10.0 - r * 1.6);
        ctx.fillStyle = r === 0 ? 'rgba(196, 157, 108, 0.5)' : 'rgba(150, 112, 72, 0.45)';
        ctx.beginPath();
        ctx.ellipse(sx, sy, 2.2, 1.5, side * 0.35, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = 'rgba(88, 60, 33, 0.35)';
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }
    }
  }

  // dorsal scutes (raised plates, not a beetle shell)
  for (let i = 0; i < 5; i++) {
    const sx = -9.4 + i * 4.7;
    const size = 3.8 - i * 0.3;
    const g = ctx.createLinearGradient(sx - size, 0, sx + size, 0);
    g.addColorStop(0, '#6b4a2c');
    g.addColorStop(0.55, '#a37b4d');
    g.addColorStop(1, '#d0ad78');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(sx + size, 0);
    ctx.quadraticCurveTo(sx + 0.4, -size * 1.05, sx - size * 1.4, -size * 0.15);
    ctx.quadraticCurveTo(sx + 0.4, size * 1.05, sx + size, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(58, 38, 20, 0.65)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 231, 185, 0.4)';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(sx + size * 0.7, -0.2);
    ctx.quadraticCurveTo(sx + 0.2, -size * 0.8, sx - size * 1.0, -size * 0.2);
    ctx.stroke();
  }

  // prominent shoulder spikes
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const bx = 6.0 - i * 5.2;
      const by = side * (10.6 + i * 0.3);
      const len = 5.4 - i * 0.7;
      ctx.fillStyle = i === 0 ? '#8f6a3e' : '#7a5732';
      ctx.beginPath();
      ctx.moveTo(bx - 2.4, by);
      ctx.lineTo(bx + 0.6, by + side * len);
      ctx.lineTo(bx + 2.6, by);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(64, 43, 24, 0.6)';
      ctx.lineWidth = 0.45;
      ctx.stroke();
      ctx.fillStyle = 'rgba(236, 207, 163, 0.35)';
      ctx.beginPath();
      ctx.moveTo(bx - 1.2, by);
      ctx.lineTo(bx + 0.5, by + side * (len - 1.2));
      ctx.lineTo(bx + 1.2, by);
      ctx.closePath();
      ctx.fill();
    }
  }

  /* --- neck ---------------------------------------------------------- */
  ctx.fillStyle = '#ad8658';
  ctx.beginPath();
  ctx.moveTo(14.0, -8.0);
  ctx.quadraticCurveTo(19.0, -7.2, 21.5, -4.6);
  ctx.lineTo(21.5, 4.6);
  ctx.quadraticCurveTo(19.0, 7.2, 14.0, 8.0);
  ctx.quadraticCurveTo(15.6, 0, 14.0, -8.0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#5b3f26';
  ctx.lineWidth = 0.85;
  ctx.stroke();
  // neck armour bands
  ctx.strokeStyle = 'rgba(77, 52, 28, 0.6)';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(15.2 + i * 2.1, -6.4 + i * 0.6);
    ctx.quadraticCurveTo(17.6 + i * 2.1, 0, 15.2 + i * 2.1, 6.4 - i * 0.6);
    ctx.stroke();
  }

  /* --- crown horns --------------------------------------------------- */
  // Drawn before the skull so the head overlaps their roots. They sweep
  // out past the cheeks and forward, leaving the face readable.
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.scale(1, side);
    const horn = ctx.createLinearGradient(19, 5, 43, 17);
    horn.addColorStop(0, '#8a6b46');
    horn.addColorStop(0.45, '#bfa67a');
    horn.addColorStop(0.8, '#e8d8b2');
    horn.addColorStop(1, '#cbb188');
    ctx.fillStyle = horn;
    ctx.beginPath();
    ctx.moveTo(20.2, 6.1);
    ctx.bezierCurveTo(24.4, 14.8, 33.0, 19.6, 43.0, 13.2);
    ctx.bezierCurveTo(34.6, 10.8, 27.4, 8.6, 22.8, 3.0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#6a5336';
    ctx.lineWidth = 0.7;
    ctx.stroke();
    // growth rings
    ctx.strokeStyle = 'rgba(104, 79, 47, 0.4)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 4; i++) {
      const t = 0.18 + i * 0.2;
      const bx = 23.0 + t * 17.0;
      const by = 6.8 + t * 7.0;
      ctx.beginPath();
      ctx.moveTo(bx - 1.2, by - 2.6);
      ctx.lineTo(bx + 1.0, by + 2.2);
      ctx.stroke();
    }
    // polished outer edge
    ctx.strokeStyle = 'rgba(255, 248, 223, 0.6)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(22.0, 9.0);
    ctx.quadraticCurveTo(32.0, 19.0, 42.4, 13.6);
    ctx.stroke();
    ctx.restore();
  }

  /* --- head ---------------------------------------------------------- */
  const headGrad = ctx.createLinearGradient(18, -10, 41, 10);
  headGrad.addColorStop(0, '#e2c692');
  headGrad.addColorStop(0.5, '#cba470');
  headGrad.addColorStop(1, '#9a7448');
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.moveTo(18.6, -8.6);
  ctx.bezierCurveTo(23.0, -10.8, 32.0, -9.2, 37.3, -4.4);
  ctx.bezierCurveTo(40.4, -1.4, 40.4, 1.4, 37.3, 4.4);
  ctx.bezierCurveTo(32.0, 9.2, 23.0, 10.8, 18.6, 8.6);
  ctx.bezierCurveTo(16.6, 3.2, 16.6, -3.2, 18.6, -8.6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#5b3e24';
  ctx.lineWidth = 1.0;
  ctx.stroke();

  // darker cranial plating
  ctx.fillStyle = 'rgba(139, 100, 58, 0.35)';
  ctx.beginPath();
  ctx.ellipse(23.6, 0, 5.2, 7.2, 0, 0, TAU);
  ctx.fill();

  // brow ridges and eyes
  for (const side of [-1, 1]) {
    ctx.fillStyle = 'rgba(105, 72, 40, 0.7)';
    ctx.beginPath();
    ctx.ellipse(28.0, side * 5.8, 5.0, 2.2, side * 0.18, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#1b1009';
    ctx.beginPath();
    ctx.ellipse(29.2, side * 5.6, 2.3, 1.8, side * 0.2, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#ffc45f';
    ctx.beginPath();
    ctx.ellipse(29.3, side * 5.6, 1.55, 1.2, side * 0.2, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#24140a';
    ctx.beginPath();
    ctx.ellipse(29.5, side * 5.6, 0.5, 1.0, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 244, 194, 0.9)';
    ctx.beginPath();
    ctx.arc(29.8, side * 5.3, 0.27, 0, TAU);
    ctx.fill();
  }

  // muzzle, nostrils, jaw line
  ctx.fillStyle = 'rgba(233, 207, 164, 0.45)';
  ctx.beginPath();
  ctx.ellipse(35.0, 0, 3.4, 4.6, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#3b2716';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(37.4, side * 1.5, 0.8, 0.5, side * 0.3, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = '#4b3019';
  ctx.lineWidth = 0.85;
  ctx.beginPath();
  ctx.moveTo(33.4, 0);
  ctx.quadraticCurveTo(36.0, 0, 37.6, 0);
  ctx.stroke();
  // jaw
  ctx.strokeStyle = 'rgba(70, 45, 24, 0.75)';
  ctx.lineWidth = 0.9;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(19.0, side * 8.2);
    ctx.quadraticCurveTo(28.0, side * 7.2, 36.0, side * 3.0);
    ctx.stroke();
  }
  // teeth along the jaw
  ctx.fillStyle = '#ecdbb8';
  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const tx = 24.0 + i * 2.4;
      const jaw = side * (8.0 - i * 1.05);
      const h = 1.0 - i * 0.1;
      ctx.beginPath();
      ctx.moveTo(tx, jaw);
      ctx.lineTo(tx + 0.9, jaw);
      ctx.lineTo(tx + 0.45, jaw - side * h);
      ctx.closePath();
      ctx.fill();
    }
  }

  // central nose horn
  ctx.fillStyle = '#e0cba4';
  ctx.beginPath();
  ctx.moveTo(43.0, 0);
  ctx.lineTo(37.6, -1.9);
  ctx.lineTo(37.6, 1.9);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#6f5636';
  ctx.lineWidth = 0.45;
  ctx.stroke();

  // small cheek spikes behind the jaw
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const bx = 20.6 + i * 1.9;
      const by = side * (8.4 + i * 0.3);
      ctx.fillStyle = i % 2 ? '#9b7649' : '#85623d';
      ctx.beginPath();
      ctx.moveTo(bx - 1.0, by);
      ctx.lineTo(bx - 2.6, by + side * 2.8);
      ctx.lineTo(bx + 0.8, by + side * 0.5);
      ctx.closePath();
      ctx.fill();
    }
  }
}

/* —— Tatooine · B1 battle droid —— */
function drawDroidBody(ctx, e, time) {
  const walk = Math.sin(time * 12 + (e.phase || 0)) * 1.2;
  const walk2 = Math.cos(time * 12 + (e.phase || 0)) * 0.7;

  // long thin legs, exposed pistons
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#5b4727';
  ctx.lineWidth = 2.1;
  ctx.beginPath();
  ctx.moveTo(-4, -3.6);
  ctx.lineTo(-10 + walk2, -8.2);
  ctx.lineTo(-6 + walk, -13);
  ctx.moveTo(-4, 3.6);
  ctx.lineTo(-10 - walk2, 8.2);
  ctx.lineTo(-6 - walk, 13);
  ctx.stroke();
  ctx.strokeStyle = '#8e7141';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-4, -3.6);
  ctx.lineTo(-10 + walk2, -8.2);
  ctx.moveTo(-4, 3.6);
  ctx.lineTo(-10 - walk2, 8.2);
  ctx.stroke();
  // feet
  ctx.fillStyle = '#4a3920';
  roundRect(ctx, -9 + walk, -14.2, 5.8, 2.2, 1);
  ctx.fill();
  roundRect(ctx, -9 - walk, 12, 5.8, 2.2, 1);
  ctx.fill();

  // backpack and antenna
  ctx.fillStyle = '#7f6538';
  roundRect(ctx, -11.4, -4.2, 4.2, 8.4, 1.5);
  ctx.fill();
  ctx.strokeStyle = '#3f321b';
  ctx.lineWidth = 0.7;
  ctx.stroke();
  ctx.strokeStyle = '#b99a5f';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(-9, -3.4);
  ctx.lineTo(-13, -8.5);
  ctx.stroke();
  ctx.fillStyle = '#ff6a4a';
  ctx.beginPath();
  ctx.arc(-13, -8.5, 0.9, 0, TAU);
  ctx.fill();

  // narrow ribbed torso
  const g = ctx.createLinearGradient(0, -6, 0, 6);
  g.addColorStop(0, '#ead49a');
  g.addColorStop(0.48, '#c6a365');
  g.addColorStop(1, '#8d6c3c');
  ctx.fillStyle = g;
  roundRect(ctx, -8, -5.2, 13, 10.4, 2.6);
  ctx.fill();
  ctx.strokeStyle = '#5e4928';
  ctx.lineWidth = 0.9;
  ctx.stroke();
  // chest ridges
  ctx.strokeStyle = 'rgba(91, 68, 33, 0.75)';
  ctx.lineWidth = 0.75;
  for (let i = -3; i <= 3; i += 1.5) {
    ctx.beginPath();
    ctx.moveTo(-6.8, i);
    ctx.lineTo(3.8, i);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255, 244, 204, 0.32)';
  roundRect(ctx, -6.8, -4.2, 4.5, 1.2, 0.6);
  ctx.fill();

  // long B1 head
  const hg = ctx.createLinearGradient(4, -4.2, 13, 4.2);
  hg.addColorStop(0, '#e5cb92');
  hg.addColorStop(0.55, '#c4a061');
  hg.addColorStop(1, '#8c6b39');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.moveTo(4, -4.1);
  ctx.lineTo(12.2, -3.2);
  ctx.quadraticCurveTo(15.2, 0, 12.2, 3.2);
  ctx.lineTo(4, 4.1);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#5e4928';
  ctx.lineWidth = 0.9;
  ctx.stroke();
  // face plate
  ctx.fillStyle = '#8f7242';
  roundRect(ctx, 8.6, -2.4, 4.4, 4.8, 1.2);
  ctx.fill();
  // photo-receptors
  ctx.fillStyle = '#ff6146';
  ctx.shadowColor = 'rgba(255, 86, 58, 0.95)';
  ctx.shadowBlur = 5;
  ctx.beginPath();
  ctx.arc(11.2, -1.85, 1.05, 0, TAU);
  ctx.arc(11.2, 1.85, 1.05, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffe8c0';
  ctx.beginPath();
  ctx.arc(11.5, -1.85, 0.35, 0, TAU);
  ctx.arc(11.5, 1.85, 0.35, 0, TAU);
  ctx.fill();
  // head antenna
  ctx.strokeStyle = '#9e8049';
  ctx.lineWidth = 0.65;
  ctx.beginPath();
  ctx.moveTo(6.2, -3.7);
  ctx.lineTo(3.6, -8.4);
  ctx.stroke();
  ctx.fillStyle = '#ffb15f';
  ctx.beginPath();
  ctx.arc(3.6, -8.4, 0.7, 0, TAU);
  ctx.fill();

  // E-5 blaster
  ctx.fillStyle = '#33291a';
  roundRect(ctx, 7.5, 2.2, 11.5, 1.35, 0.6);
  ctx.fill();
  ctx.fillStyle = '#7b6338';
  roundRect(ctx, 8, 1.4, 4.4, 2.6, 1);
  ctx.fill();
  ctx.strokeStyle = '#c6a66c';
  ctx.lineWidth = 0.55;
  ctx.beginPath();
  ctx.moveTo(9, 2.1);
  ctx.lineTo(18.7, 2.1);
  ctx.stroke();
}

/* —— Tatooine · STAP scout —— */
function drawStapBody(ctx, e, time) {
  const flap = Math.sin(time * 13 + (e.phase || 0)) * 0.8;
  const sway = Math.sin(time * 9 + (e.phase || 0)) * 0.8;

  // repulsor wash
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const wash = ctx.createRadialGradient(-3, 0, 1, -3, 0, 15);
  wash.addColorStop(0, 'rgba(173, 255, 120, 0.28)');
  wash.addColorStop(1, 'rgba(140, 255, 90, 0)');
  ctx.fillStyle = wash;
  ctx.beginPath();
  ctx.ellipse(-3, 0, 15, 8, 0, 0, TAU);
  ctx.fill();
  ctx.restore();

  // side outrigger struts and pods
  ctx.strokeStyle = '#6f8178';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-1, -2.2);
  ctx.lineTo(-3, -7);
  ctx.lineTo(-8, -7.4);
  ctx.moveTo(-1, 2.2);
  ctx.lineTo(-3, 7);
  ctx.lineTo(-8, 7.4);
  ctx.stroke();
  for (const side of [-1, 1]) {
    const py = side * 7.4;
    const g = ctx.createLinearGradient(-10, py - 2, 1, py + 2);
    g.addColorStop(0, '#455650');
    g.addColorStop(0.5, '#94a79a');
    g.addColorStop(1, '#405048');
    ctx.fillStyle = g;
    roundRect(ctx, -10.5, py - 2.4, 9.5, 4.8, 2.2);
    ctx.fill();
    ctx.strokeStyle = '#2c3833';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // repulsor vent
    ctx.fillStyle = 'rgba(177, 255, 118, 0.9)';
    ctx.shadowColor = 'rgba(160, 255, 100, 0.9)';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.ellipse(-10, py, 1.1, 1.8, 0, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // central STAP spine
  const g = ctx.createLinearGradient(-10, -2.2, 8, 2.2);
  g.addColorStop(0, '#3e4a45');
  g.addColorStop(0.45, '#8b9d91');
  g.addColorStop(1, '#53645c');
  ctx.fillStyle = g;
  roundRect(ctx, -11, -2.3, 18, 4.6, 2.2);
  ctx.fill();
  ctx.strokeStyle = '#2b3530';
  ctx.lineWidth = 0.9;
  ctx.stroke();
  // forward control vanes
  ctx.fillStyle = '#60736a';
  ctx.beginPath();
  ctx.moveTo(7, -2.2);
  ctx.lineTo(12.5, -4.8 + flap);
  ctx.lineTo(10.2, 0);
  ctx.lineTo(12.5, 4.8 - flap);
  ctx.lineTo(7, 2.2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#33403a';
  ctx.stroke();

  // rider battle droid
  ctx.fillStyle = '#7b6338';
  roundRect(ctx, -3.5, -3.2, 7.2, 6.4, 2.2);
  ctx.fill();
  ctx.strokeStyle = '#49391e';
  ctx.lineWidth = 0.7;
  ctx.stroke();
  // rider arms to handlebars
  ctx.strokeStyle = '#9d8048';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(1.8, -2.6);
  ctx.lineTo(6.2, -1.2);
  ctx.moveTo(1.8, 2.6);
  ctx.lineTo(6.2, 1.2);
  ctx.stroke();
  // rider head
  const hg = ctx.createLinearGradient(1, -3, 10, 3);
  hg.addColorStop(0, '#dfc58c');
  hg.addColorStop(1, '#a3834d');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.moveTo(2.4, -2.8);
  ctx.lineTo(8.8, -2.1);
  ctx.quadraticCurveTo(10.6, 0, 8.8, 2.1);
  ctx.lineTo(2.4, 2.8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#57441f';
  ctx.lineWidth = 0.7;
  ctx.stroke();
  ctx.fillStyle = '#ff5c42';
  ctx.shadowColor = 'rgba(255, 80, 50, 0.9)';
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.arc(8.1, -0.9, 0.75, 0, TAU);
  ctx.arc(8.1, 0.9, 0.75, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
  // rider blaster
  ctx.fillStyle = '#2f2718';
  roundRect(ctx, 6, 2.7, 9.6, 1.2, 0.5);
  ctx.fill();
  // handlebars
  ctx.strokeStyle = '#2f3a34';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(6.4, -1.2);
  ctx.lineTo(6.4, -3.4);
  ctx.moveTo(6.4, 1.2);
  ctx.lineTo(6.4, 3.4);
  ctx.stroke();

  // engine exhausts
  ctx.fillStyle = 'rgba(190, 255, 135, 0.9)';
  ctx.shadowColor = 'rgba(160, 255, 100, 0.95)';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.ellipse(-11.4, -1.4, 1.5, 0.9, 0, 0, TAU);
  ctx.ellipse(-11.4, 1.4, 1.5, 0.9, 0, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
}

/* —— Tatooine · B2 super battle droid —— */
function drawB2Body(ctx, e, time) {
  const walk = Math.sin(time * 9 + (e.phase || 0)) * 1.35;
  const walk2 = Math.cos(time * 9 + (e.phase || 0)) * 0.7;

  // heavy legs
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#4c2f21';
  ctx.lineWidth = 3.3;
  ctx.beginPath();
  ctx.moveTo(-4, -5.4);
  ctx.lineTo(-9 + walk2, -11);
  ctx.lineTo(-5 + walk, -16);
  ctx.moveTo(-4, 5.4);
  ctx.lineTo(-9 - walk2, 11);
  ctx.lineTo(-5 - walk, 16);
  ctx.stroke();
  ctx.strokeStyle = '#7c513a';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(-4, -5.4);
  ctx.lineTo(-9 + walk2, -11);
  ctx.moveTo(-4, 5.4);
  ctx.lineTo(-9 - walk2, 11);
  ctx.stroke();
  // wide feet
  ctx.fillStyle = '#33231a';
  roundRect(ctx, -8 + walk, -17.5, 7.6, 3, 1.2);
  ctx.fill();
  roundRect(ctx, -8 - walk, 14.5, 7.6, 3, 1.2);
  ctx.fill();

  // broad armored torso
  const g = ctx.createLinearGradient(0, -11, 0, 11);
  g.addColorStop(0, '#c1896d');
  g.addColorStop(0.42, '#92563f');
  g.addColorStop(1, '#5a3225');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-12, -8);
  ctx.quadraticCurveTo(-4, -11.5, 7, -9);
  ctx.quadraticCurveTo(11, -6, 10, 0);
  ctx.quadraticCurveTo(11, 6, 7, 9);
  ctx.quadraticCurveTo(-4, 11.5, -12, 8);
  ctx.quadraticCurveTo(-15, 0, -12, -8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#3f241a';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  // chest plate and reactor slot
  ctx.fillStyle = '#ae7357';
  roundRect(ctx, -5, -5.2, 10.5, 10.4, 2.5);
  ctx.fill();
  ctx.strokeStyle = 'rgba(60, 32, 23, 0.7)';
  ctx.lineWidth = 0.7;
  ctx.stroke();
  ctx.fillStyle = '#3c2118';
  roundRect(ctx, -1.5, -4.4, 4.6, 8.8, 1.8);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 116, 74, 0.9)';
  ctx.shadowColor = 'rgba(255, 104, 60, 0.95)';
  ctx.shadowBlur = 5;
  ctx.beginPath();
  ctx.arc(0.8, 0, 1.4, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
  // shoulder pauldrons
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#a36950';
    roundRect(ctx, -8, side * 9 - 2.4, 11, 4.8, 2);
    ctx.fill();
    ctx.strokeStyle = '#4b2b1f';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
  // arm cannons
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#714a38';
    roundRect(ctx, 2, side * 8.4 - 2.2, 11.5, 4.4, 1.8);
    ctx.fill();
    ctx.strokeStyle = '#3b2319';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.fillStyle = '#33251d';
    roundRect(ctx, 10.5, side * 8.4 - 1.2, 8.4, 2.4, 1);
    ctx.fill();
    ctx.fillStyle = '#ff6a4a';
    ctx.shadowColor = 'rgba(255, 90, 60, 0.9)';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(19.4, side * 8.4, 0.9, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  // small angular head
  ctx.fillStyle = '#a26549';
  ctx.beginPath();
  ctx.moveTo(7, -3.8);
  ctx.lineTo(13.4, -2.6);
  ctx.lineTo(14.6, 0);
  ctx.lineTo(13.4, 2.6);
  ctx.lineTo(7, 3.8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#48291d';
  ctx.lineWidth = 0.9;
  ctx.stroke();
  ctx.fillStyle = '#ff6247';
  ctx.shadowColor = 'rgba(255, 78, 52, 0.95)';
  ctx.shadowBlur = 4;
  roundRect(ctx, 11.3, -1.4, 2.2, 2.8, 0.7);
  ctx.fill();
  ctx.shadowBlur = 0;
}

/* —— Tatooine · droid command gunship —— */
function drawDroidGunshipBody(ctx, e, time) {
  const pulse = 0.75 + Math.sin(time * 5 + (e.phase || 0)) * 0.25;

  // engine trails
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const side of [-1, 1]) {
    const tg = ctx.createLinearGradient(-24, side * 7, -42, side * 7);
    tg.addColorStop(0, 'rgba(255, 152, 74, 0.6)');
    tg.addColorStop(1, 'rgba(255, 120, 50, 0)');
    ctx.fillStyle = tg;
    ctx.beginPath();
    ctx.moveTo(-23, side * 7 - 2.2);
    ctx.lineTo(-42, side * 7);
    ctx.lineTo(-23, side * 7 + 2.2);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // wing pylons and missile pods
  ctx.fillStyle = '#6e5744';
  ctx.fillRect(-15, -20, 9, 34);
  ctx.strokeStyle = '#38291f';
  ctx.lineWidth = 1;
  ctx.strokeRect(-15, -20, 9, 34);
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#816750';
    roundRect(ctx, -9, side * 16 - 3.4, 17, 6.8, 2.4);
    ctx.fill();
    ctx.strokeStyle = '#3c2c21';
    ctx.lineWidth = 0.9;
    ctx.stroke();
    // missile tubes
    ctx.fillStyle = '#2a1e17';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(2.5, side * 16 - 1.8 + i * 1.8, 0.75, 0, TAU);
      ctx.fill();
    }
  }

  // main crescent hull
  const g = ctx.createLinearGradient(0, -16, 0, 16);
  g.addColorStop(0, '#b49172');
  g.addColorStop(0.38, '#80634d');
  g.addColorStop(1, '#49362a');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-24, -12);
  ctx.quadraticCurveTo(-12, -17, 10, -13);
  ctx.lineTo(23, -5);
  ctx.quadraticCurveTo(27, 0, 23, 5);
  ctx.lineTo(10, 13);
  ctx.quadraticCurveTo(-12, 17, -24, 12);
  ctx.quadraticCurveTo(-30, 0, -24, -12);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#2f2219';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // armored dorsal plates
  ctx.fillStyle = 'rgba(211, 181, 145, 0.3)';
  roundRect(ctx, -19, -7, 15, 14, 4);
  ctx.fill();
  ctx.strokeStyle = 'rgba(44, 30, 20, 0.62)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-18, -9);
  ctx.lineTo(-14, 9);
  ctx.moveTo(-8, -10);
  ctx.lineTo(-5, 10);
  ctx.stroke();

  // forward sensor array
  const hg = ctx.createLinearGradient(8, -8, 25, 8);
  hg.addColorStop(0, '#9a7b60');
  hg.addColorStop(1, '#5d4636');
  ctx.fillStyle = hg;
  roundRect(ctx, 7, -8, 16, 16, 5);
  ctx.fill();
  ctx.strokeStyle = '#34251b';
  ctx.lineWidth = 1.1;
  ctx.stroke();
  // red command eye
  ctx.fillStyle = `rgba(255, 96, 58, ${pulse})`;
  ctx.shadowColor = 'rgba(255, 90, 45, 1)';
  ctx.shadowBlur = 12 * pulse;
  ctx.beginPath();
  ctx.ellipse(19, 0, 3.2, 4.8, 0, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffe4b2';
  ctx.beginPath();
  ctx.ellipse(19.8, 0, 1, 2.2, 0, 0, TAU);
  ctx.fill();

  // twin long-barrel cannons
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#33251c';
    roundRect(ctx, 21, side * 4.4 - 1.2, 16, 2.4, 1);
    ctx.fill();
    ctx.fillStyle = '#8d7056';
    roundRect(ctx, 20, side * 4.4 - 2, 5.8, 4, 1.4);
    ctx.fill();
  }

  // rear thrusters
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#3d2c21';
    roundRect(ctx, -26, side * 6 - 2.2, 5, 4.4, 1.6);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 158, 82, 0.95)';
    ctx.shadowColor = 'rgba(255, 130, 50, 1)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(-26.6, side * 6, 1.2, 1.9, 0, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // command antenna
  ctx.strokeStyle = '#c5a37b';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(-6, -12);
  ctx.lineTo(-11, -24);
  ctx.stroke();
  ctx.fillStyle = '#ffb35f';
  ctx.shadowColor = 'rgba(255, 179, 95, 0.9)';
  ctx.shadowBlur = 5;
  ctx.beginPath();
  ctx.arc(-11, -24, 1.6, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
}

/* —— Hoth · snowtrooper —— */
function drawSnowtrooperBody(ctx, e, time) {
  const walk = Math.sin(time * 10 + (e.phase || 0)) * 1.2;

  // legs
  ctx.strokeStyle = '#8fa7b3';
  ctx.lineWidth = 2.7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-3, -4.6);
  ctx.lineTo(-8 + walk, -9.5);
  ctx.lineTo(-4 + walk, -13);
  ctx.moveTo(-3, 4.6);
  ctx.lineTo(-8 - walk, 9.5);
  ctx.lineTo(-4 - walk, 13);
  ctx.stroke();
  // snow boots
  ctx.fillStyle = '#e7f1f4';
  roundRect(ctx, -7 + walk, -15, 6.4, 3, 1.2);
  ctx.fill();
  roundRect(ctx, -7 - walk, 12, 6.4, 3, 1.2);
  ctx.fill();

  // cold-weather kama / skirt flaps
  ctx.fillStyle = '#d3e2e7';
  ctx.beginPath();
  ctx.moveTo(-7, -5);
  ctx.lineTo(-14, -8.5);
  ctx.lineTo(-11.5, -1.5);
  ctx.lineTo(-14, 5.5);
  ctx.lineTo(-7, 4.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#7f98a5';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(104, 132, 146, 0.65)';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(-12.6, -6.5);
  ctx.lineTo(-10.5, -2);
  ctx.moveTo(-12.4, 3.8);
  ctx.lineTo(-10.2, 1.2);
  ctx.stroke();

  // torso
  const g = ctx.createLinearGradient(0, -8, 0, 8);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.48, '#d6e5ea');
  g.addColorStop(1, '#96b0bb');
  ctx.fillStyle = g;
  roundRect(ctx, -8, -6.8, 14, 13.6, 3.8);
  ctx.fill();
  ctx.strokeStyle = '#68828f';
  ctx.lineWidth = 1;
  ctx.stroke();
  // chest plate
  ctx.fillStyle = '#eef6f8';
  roundRect(ctx, -5, -4.8, 8.6, 9.6, 2.2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(83, 110, 122, 0.65)';
  ctx.lineWidth = 0.65;
  ctx.stroke();
  // belt
  ctx.fillStyle = '#607985';
  ctx.fillRect(-6.4, -1.4, 10.2, 2.8);
  ctx.fillStyle = '#d7e6eb';
  ctx.fillRect(-3.4, -1.4, 2.2, 2.8);

  // insulated backpack + antenna
  ctx.fillStyle = '#6e8996';
  roundRect(ctx, -12, -5.6, 5, 11.2, 1.8);
  ctx.fill();
  ctx.strokeStyle = '#415965';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.fillStyle = 'rgba(170, 226, 246, 0.8)';
  ctx.fillRect(-11.1, -4.2, 1.5, 8.4);
  ctx.strokeStyle = '#b7cdd6';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(-10.5, -5.5);
  ctx.lineTo(-14.5, -11);
  ctx.stroke();

  // hood and helmet
  ctx.fillStyle = '#c6d9e0';
  ctx.beginPath();
  ctx.ellipse(5.8, 0, 7.4, 6.8, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#6f8995';
  ctx.lineWidth = 0.9;
  ctx.stroke();
  const hg = ctx.createLinearGradient(4, -5, 14, 5);
  hg.addColorStop(0, '#ffffff');
  hg.addColorStop(0.55, '#dceaf0');
  hg.addColorStop(1, '#a5bcc6');
  ctx.fillStyle = hg;
  roundRect(ctx, 5, -4.6, 9.2, 9.2, 3.8);
  ctx.fill();
  ctx.strokeStyle = '#637f8c';
  ctx.lineWidth = 0.9;
  ctx.stroke();
  // frost goggles / face slit
  ctx.fillStyle = '#22343d';
  roundRect(ctx, 8.1, -3.5, 4.9, 7, 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(158, 226, 248, 0.8)';
  roundRect(ctx, 8.8, -2.6, 3.6, 1.1, 0.5);
  ctx.fill();
  // respirator
  ctx.fillStyle = '#7f98a4';
  roundRect(ctx, 9.5, -0.7, 3.2, 2.8, 1.2);
  ctx.fill();
  // helmet trim
  ctx.strokeStyle = '#9fb8c2';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(5.8, -1);
  ctx.lineTo(13.4, -1);
  ctx.stroke();

  // blaster rifle
  ctx.fillStyle = '#39474e';
  roundRect(ctx, 7, 2.8, 13.5, 1.5, 0.6);
  ctx.fill();
  ctx.fillStyle = '#d3e2e7';
  roundRect(ctx, 8, 1.8, 4.8, 3.4, 1.2);
  ctx.fill();
  ctx.strokeStyle = '#92adb8';
  ctx.lineWidth = 0.55;
  ctx.beginPath();
  ctx.moveTo(9, 2.7);
  ctx.lineTo(19.8, 2.7);
  ctx.stroke();
}

/* —— Hoth · probe droid —— */
function drawProbeBody(ctx, e, time) {
  const wobble = Math.sin(time * 6 + (e.phase || 0)) * 0.7;

  // dangling manipulators
  ctx.strokeStyle = '#3d4b52';
  ctx.lineWidth = 1;
  ctx.lineCap = 'round';
  for (let i = -1; i <= 1; i++) {
    const sway = Math.sin(time * 4.5 + i * 1.7 + (e.phase || 0)) * 1.8;
    ctx.beginPath();
    ctx.moveTo(-2 + i * 2, 3.5);
    ctx.quadraticCurveTo(-5 + i * 3 + sway, 9, -8 + i * 4 + sway, 13);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-2 + i * 2, -3.5);
    ctx.quadraticCurveTo(-5 + i * 3 - sway, -9, -8 + i * 4 - sway, -13);
    ctx.stroke();
  }
  // repulsor ring
  ctx.strokeStyle = 'rgba(147, 220, 241, 0.5)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.ellipse(-3, 0, 5.6, 3, 0, 0, TAU);
  ctx.stroke();
  ctx.fillStyle = 'rgba(150, 225, 245, 0.6)';
  ctx.beginPath();
  ctx.ellipse(-4, 0, 2.8, 1.4, 0, 0, TAU);
  ctx.fill();

  // main shell
  const g = ctx.createRadialGradient(-2, -3 + wobble, 1, 0, 0, 9);
  g.addColorStop(0, '#d3e3e8');
  g.addColorStop(0.42, '#7b96a2');
  g.addColorStop(1, '#25353d');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, wobble * 0.25, 8.6, 7.6, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#17252c';
  ctx.lineWidth = 0.95;
  ctx.stroke();
  // panel seams and dome
  ctx.strokeStyle = 'rgba(214, 240, 247, 0.28)';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.ellipse(0, 0, 5.8, 4.8, 0, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-1, 0, 8.1, -1.2, 1.2);
  ctx.stroke();
  // eye cluster
  ctx.fillStyle = '#0b1419';
  ctx.beginPath();
  ctx.ellipse(4.9, -0.5, 3.6, 3, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#ff5b3f';
  ctx.shadowColor = 'rgba(255, 80, 50, 1)';
  ctx.shadowBlur = 7;
  ctx.beginPath();
  ctx.arc(6, -0.5, 1.55, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffe2b0';
  ctx.beginPath();
  ctx.arc(6.4, -0.5, 0.55, 0, TAU);
  ctx.fill();
  // smaller sensor lens
  ctx.fillStyle = '#8be0ff';
  ctx.shadowColor = 'rgba(120, 220, 255, 0.85)';
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.arc(2.6, -3.4, 0.8, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
  // side vents
  ctx.fillStyle = 'rgba(28, 44, 52, 0.9)';
  roundRect(ctx, -4.8, 4.7, 4.6, 1.7, 0.8);
  ctx.fill();
  // antennae
  ctx.strokeStyle = '#91a9b3';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(-3, -6.5);
  ctx.lineTo(-6.5, -12);
  ctx.moveTo(-0.5, -7.4);
  ctx.lineTo(-0.5, -13.2);
  ctx.stroke();
  ctx.fillStyle = '#9fe6ff';
  ctx.shadowColor = 'rgba(140, 225, 255, 0.85)';
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.arc(-6.5, -12, 0.9, 0, TAU);
  ctx.arc(-0.5, -13.2, 0.9, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
}

/* —— Hoth · AT-ST —— */
function drawAtstBody(ctx, e, time) {
  const walk = Math.sin(time * 7 + (e.phase || 0)) * 2.6;

  // mechanical legs
  ctx.strokeStyle = '#39474c';
  ctx.lineWidth = 2.8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(-4, side * 3.6);
    ctx.lineTo(-11 + walk * 0.55, side * 10);
    ctx.lineTo(-4 + walk, side * 15.5);
    ctx.stroke();
    ctx.fillStyle = '#778b92';
    ctx.beginPath();
    ctx.arc(-11 + walk * 0.55, side * 10, 2.1, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#54666c';
    roundRect(ctx, -8 + walk, side * 15.5 - 1.7, 8, 3.4, 1.3);
    ctx.fill();
    ctx.strokeStyle = '#2f3b3f';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.strokeStyle = '#39474c';
    ctx.lineWidth = 2.8;
  }
  // hip block
  ctx.fillStyle = '#56686e';
  roundRect(ctx, -10, -5.2, 9, 10.4, 3);
  ctx.fill();

  // armored hull
  const g = ctx.createLinearGradient(0, -9.5, 0, 9.5);
  g.addColorStop(0, '#c3d1d5');
  g.addColorStop(0.5, '#8c9fa5');
  g.addColorStop(1, '#53656b');
  ctx.fillStyle = g;
  roundRect(ctx, -8.5, -8.5, 17.5, 17, 4.8);
  ctx.fill();
  ctx.strokeStyle = '#2f3c41';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // armor panels
  ctx.fillStyle = 'rgba(255, 255, 255, 0.17)';
  roundRect(ctx, -6.4, -6.9, 11.5, 4.2, 1.5);
  ctx.fill();
  roundRect(ctx, -6.4, 2.7, 11.5, 4.2, 1.5);
  ctx.fill();
  ctx.strokeStyle = 'rgba(55, 74, 80, 0.55)';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(-6, -2.4);
  ctx.lineTo(6, -2.4);
  ctx.stroke();
  // side rocket pod
  ctx.fillStyle = '#3d4b50';
  roundRect(ctx, 1, -11.8, 4.6, 4.8, 1.3);
  ctx.fill();
  ctx.fillStyle = '#ffb05e';
  ctx.beginPath();
  ctx.arc(3.3, -9.4, 0.8, 0, TAU);
  ctx.fill();

  // head
  const hg = ctx.createLinearGradient(0, -6, 13, 6);
  hg.addColorStop(0, '#c2d0d4');
  hg.addColorStop(1, '#667a80');
  ctx.fillStyle = hg;
  roundRect(ctx, 7, -6.2, 10.5, 12.4, 3.2);
  ctx.fill();
  ctx.strokeStyle = '#2e3b3f';
  ctx.lineWidth = 1.1;
  ctx.stroke();
  // twin visor slits
  ctx.fillStyle = '#ff8a4a';
  ctx.shadowColor = 'rgba(255, 124, 60, 0.95)';
  ctx.shadowBlur = 6;
  roundRect(ctx, 11.6, -4.1, 4.9, 2.4, 0.9);
  ctx.fill();
  roundRect(ctx, 11.6, 1.7, 4.9, 2.4, 0.9);
  ctx.fill();
  ctx.shadowBlur = 0;
  // chin blaster and side gun
  ctx.fillStyle = '#303c40';
  roundRect(ctx, 15, -1.3, 9, 1.8, 0.8);
  ctx.fill();
  ctx.fillStyle = '#4a5a5f';
  roundRect(ctx, 14.4, 3.2, 7.2, 2.2, 0.9);
  ctx.fill();
  // top hatch / snow cap
  ctx.fillStyle = '#6d8188';
  roundRect(ctx, -3.2, -10.2, 7.4, 2.6, 1.2);
  ctx.fill();
  ctx.fillStyle = 'rgba(245, 252, 255, 0.8)';
  roundRect(ctx, -5.8, -10.8, 6.4, 1.3, 0.6);
  ctx.fill();
  // snow weathering
  ctx.fillStyle = 'rgba(240, 250, 255, 0.5)';
  ctx.beginPath();
  ctx.ellipse(-3.6, 6.8, 4.2, 1.2, -0.16, 0, TAU);
  ctx.fill();
}

/* —— Hoth · AT-AT —— */
function drawAtAtBody(ctx, e, time) {
  const legPairs = [-15, -3, 8, 18];
  ctx.strokeStyle = '#38464b';
  ctx.lineWidth = 3.8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let i = 0; i < legPairs.length; i++) {
    const lx = legPairs[i];
    const side = i % 2 === 0 ? -1 : 1;
    const shift = Math.sin(time * 5 + i * 1.7 + (e.phase || 0)) * 2.5;
    ctx.beginPath();
    ctx.moveTo(lx, side * 4);
    ctx.lineTo(lx - 3 + shift, side * 11.5);
    ctx.lineTo(lx + shift, side * 17);
    ctx.stroke();
    ctx.fillStyle = '#61747b';
    ctx.beginPath();
    ctx.arc(lx - 3 + shift, side * 11.5, 2.8, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#2b3539';
    roundRect(ctx, lx + shift - 3.4, side * 17 - 2.2, 8, 4.4, 1.7);
    ctx.fill();
  }

  // hull
  const g = ctx.createLinearGradient(0, -14, 0, 14);
  g.addColorStop(0, '#c7d4d7');
  g.addColorStop(0.46, '#94a6ab');
  g.addColorStop(1, '#5d7077');
  ctx.fillStyle = g;
  roundRect(ctx, -23, -12, 40, 24, 6.5);
  ctx.fill();
  ctx.strokeStyle = '#344247';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // armor plating
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.21)';
  ctx.lineWidth = 0.9;
  for (let i = -19; i < 13; i += 6) {
    ctx.beginPath();
    ctx.moveTo(i, -10.4);
    ctx.lineTo(i + 2.4, 10.4);
    ctx.stroke();
  }
  // side pods
  ctx.fillStyle = '#7f9298';
  roundRect(ctx, -21, -14.8, 13, 3.6, 1.5);
  ctx.fill();
  roundRect(ctx, -21, 11.2, 13, 3.6, 1.5);
  ctx.fill();
  ctx.strokeStyle = '#3a484d';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // neck
  const ng = ctx.createLinearGradient(14, -7, 24, 7);
  ng.addColorStop(0, '#8fa1a6');
  ng.addColorStop(1, '#5d7077');
  ctx.fillStyle = ng;
  ctx.beginPath();
  ctx.moveTo(14, -7.4);
  ctx.lineTo(24, -6.2);
  ctx.lineTo(25, 5.2);
  ctx.lineTo(14, 7.4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#344247';
  ctx.stroke();
  // neck armor ridges
  ctx.strokeStyle = 'rgba(48, 62, 67, 0.7)';
  ctx.lineWidth = 0.7;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(16 + i * 2.6, -6.8);
    ctx.lineTo(17 + i * 2.6, 6.8);
    ctx.stroke();
  }
  // head
  const hg = ctx.createLinearGradient(21, -8, 34, 8);
  hg.addColorStop(0, '#cbd7da');
  hg.addColorStop(1, '#6e8187');
  ctx.fillStyle = hg;
  roundRect(ctx, 22, -6.8, 13, 13.6, 3.6);
  ctx.fill();
  ctx.strokeStyle = '#344247';
  ctx.lineWidth = 1.1;
  ctx.stroke();
  // viewports
  ctx.fillStyle = '#ff7d3d';
  ctx.shadowColor = 'rgba(255, 110, 50, 0.95)';
  ctx.shadowBlur = 7;
  roundRect(ctx, 28, -3.8, 5.4, 2.2, 0.8);
  ctx.fill();
  roundRect(ctx, 28, 1.6, 5.4, 2.2, 0.8);
  ctx.fill();
  ctx.shadowBlur = 0;
  // chin cannons
  ctx.fillStyle = '#303c40';
  roundRect(ctx, 33, -4.8, 9, 1.9, 0.8);
  ctx.fill();
  roundRect(ctx, 33, 2.9, 9, 1.9, 0.8);
  ctx.fill();
  // snow caps and blast scars
  ctx.fillStyle = 'rgba(241, 250, 253, 0.72)';
  roundRect(ctx, -20, -12.4, 8, 1.6, 0.8);
  ctx.fill();
  roundRect(ctx, 1, -12.6, 9, 1.3, 0.6);
  ctx.fill();
  ctx.fillStyle = 'rgba(39, 50, 54, 0.34)';
  ctx.beginPath();
  ctx.arc(-12, 6.6, 2.6, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-4.8, 7.4, 1.7, 0, TAU);
  ctx.fill();
  // command antenna
  ctx.strokeStyle = '#aab8bc';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(-19, -12);
  ctx.lineTo(-25, -19);
  ctx.stroke();
  ctx.fillStyle = '#ffb05e';
  ctx.shadowColor = 'rgba(255, 176, 94, 0.9)';
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.arc(-25, -19, 1.6, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
}

/* —— Mustafar · magma trooper —— */
function drawMagmaTrooperBody(ctx, e, time) {
  const walk = Math.sin(time * 10 + (e.phase || 0)) * 1.15;
  const heat = 0.7 + Math.sin(time * 4.2 + (e.phase || 0)) * 0.3;

  // legs in heat-resistant armor
  ctx.strokeStyle = '#201715';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-3, -4.6);
  ctx.lineTo(-8 + walk, -9.6);
  ctx.lineTo(-4 + walk, -13.2);
  ctx.moveTo(-3, 4.6);
  ctx.lineTo(-8 - walk, 9.6);
  ctx.lineTo(-4 - walk, 13.2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 116, 38, 0.7)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-5, -6.8);
  ctx.lineTo(-7.8 + walk, -9.4);
  ctx.moveTo(-5, 6.8);
  ctx.lineTo(-7.8 - walk, 9.4);
  ctx.stroke();
  ctx.fillStyle = '#161010';
  roundRect(ctx, -7.6 + walk, -14.8, 6.6, 3, 1.2);
  ctx.fill();
  roundRect(ctx, -7.6 - walk, 11.8, 6.6, 3, 1.2);
  ctx.fill();

  // armored torso
  const g = ctx.createLinearGradient(0, -8, 0, 8);
  g.addColorStop(0, '#59423a');
  g.addColorStop(0.45, '#332421');
  g.addColorStop(1, '#171010');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-9, -6.4);
  ctx.lineTo(3, -7.2);
  ctx.lineTo(6, -3.2);
  ctx.lineTo(6, 3.2);
  ctx.lineTo(3, 7.2);
  ctx.lineTo(-9, 6.4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#0d0807';
  ctx.lineWidth = 1;
  ctx.stroke();
  // glowing magma cracks
  ctx.strokeStyle = `rgba(255, 118, 32, ${heat})`;
  ctx.shadowColor = 'rgba(255, 92, 18, 0.95)';
  ctx.shadowBlur = 7 * heat;
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(-6.5, -5.4);
  ctx.lineTo(-3.2, -2.2);
  ctx.lineTo(-5.1, 1.4);
  ctx.lineTo(-1.4, 4.9);
  ctx.moveTo(1.8, -5.9);
  ctx.lineTo(0.4, -1.2);
  ctx.lineTo(3.2, 1.3);
  ctx.stroke();
  ctx.shadowBlur = 0;
  // chest vent
  ctx.fillStyle = `rgba(255, 132, 44, ${0.6 + heat * 0.35})`;
  ctx.shadowColor = 'rgba(255, 100, 26, 0.95)';
  ctx.shadowBlur = 8;
  roundRect(ctx, 0.2, -1.9, 3.4, 3.8, 1);
  ctx.fill();
  ctx.shadowBlur = 0;
  // shoulder pauldron
  ctx.fillStyle = '#4a332d';
  ctx.beginPath();
  ctx.moveTo(-2, -6.6);
  ctx.lineTo(5.4, -9.4);
  ctx.lineTo(6.6, -6.2);
  ctx.lineTo(1.2, -4.8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#120b09';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.fillStyle = '#ff7a28';
  ctx.beginPath();
  ctx.arc(3.6, -7.4, 0.8, 0, TAU);
  ctx.fill();

  // helmet with narrow furnace visor
  const hg = ctx.createLinearGradient(4, -5, 14, 5);
  hg.addColorStop(0, '#4d3830');
  hg.addColorStop(0.6, '#2a1d1a');
  hg.addColorStop(1, '#120c0b');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.moveTo(4.6, -4.9);
  ctx.lineTo(10.6, -4.1);
  ctx.lineTo(13.6, -1.4);
  ctx.lineTo(13.6, 1.4);
  ctx.lineTo(10.6, 4.1);
  ctx.lineTo(4.6, 4.9);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#0b0706';
  ctx.lineWidth = 0.9;
  ctx.stroke();
  // horizontal molten visor
  ctx.fillStyle = `rgba(255, 138, 44, ${0.85 + heat * 0.15})`;
  ctx.shadowColor = 'rgba(255, 100, 22, 1)';
  ctx.shadowBlur = 8;
  roundRect(ctx, 9, -1.3, 4.8, 2.6, 0.9);
  ctx.fill();
  ctx.shadowBlur = 0;
  // respirator hoses
  ctx.strokeStyle = '#6c4b3c';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(6.8, 3.3);
  ctx.quadraticCurveTo(4.8, 6.5, 1.4, 5.6);
  ctx.moveTo(6.8, -3.3);
  ctx.quadraticCurveTo(4.8, -6.5, 1.4, -5.6);
  ctx.stroke();
  // helmet crest
  ctx.strokeStyle = '#7c5b49';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(6.4, -4.4);
  ctx.lineTo(9.4, -5.9);
  ctx.stroke();

  // heat rifle
  ctx.fillStyle = '#171110';
  roundRect(ctx, 7, 2.7, 13.8, 1.7, 0.7);
  ctx.fill();
  ctx.fillStyle = '#4b352e';
  roundRect(ctx, 8, 1.6, 5.4, 3.8, 1.3);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 126, 38, ${heat})`;
  ctx.shadowColor = 'rgba(255, 100, 24, 0.95)';
  ctx.shadowBlur = 5;
  roundRect(ctx, 17, 2.5, 3.2, 2.1, 0.7);
  ctx.fill();
  ctx.shadowBlur = 0;
}

/* —— Mustafar · lava skitter —— */
function drawSkitterBody(ctx, e, time) {
  const glow = 'rgba(255, 126, 34, 0.95)';
  // eight legs
  ctx.strokeStyle = '#2b1510';
  ctx.lineWidth = 1.45;
  ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    for (const side of [-1, 1]) {
      const swing = Math.sin(time * 17 + i * 1.35 + side + (e.phase || 0)) * 1.8;
      const bx = -5 + i * 3.5;
      ctx.beginPath();
      ctx.moveTo(bx, side * 2.4);
      ctx.lineTo(bx - 3.4 + swing, side * 7.1);
      ctx.lineTo(bx + 0.6 + swing, side * 10.4);
      ctx.stroke();
    }
  }
  // ember wash under body
  ctx.fillStyle = 'rgba(255, 112, 24, 0.34)';
  ctx.shadowColor = 'rgba(255, 100, 20, 0.9)';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.ellipse(-1.4, 0, 9.2, 5.2, 0, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;

  // segmented carapace
  const g = ctx.createRadialGradient(-2.5, -2, 1, 0, 0, 9);
  g.addColorStop(0, '#74331f');
  g.addColorStop(0.52, '#3d1911');
  g.addColorStop(1, '#160907');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(-0.5, 0, 8.2, 5.3, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#0e0605';
  ctx.lineWidth = 0.9;
  ctx.stroke();
  // molten seams across shell
  ctx.strokeStyle = glow;
  ctx.shadowColor = glow;
  ctx.shadowBlur = 6;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-6.2, -2.6);
  ctx.lineTo(-2.4, 0);
  ctx.lineTo(3.2, -2.8);
  ctx.moveTo(-5.4, 2.5);
  ctx.lineTo(-0.7, 0.2);
  ctx.lineTo(4.1, 2.5);
  ctx.moveTo(-8, 0);
  ctx.lineTo(-5, -0.2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  // shell plates
  ctx.strokeStyle = 'rgba(15, 6, 4, 0.8)';
  ctx.lineWidth = 0.65;
  for (let i = -4; i <= 4; i += 2.7) {
    ctx.beginPath();
    ctx.moveTo(i, -4.5);
    ctx.quadraticCurveTo(i + 1.4, 0, i, 4.5);
    ctx.stroke();
  }
  // head
  ctx.fillStyle = '#4a1e14';
  ctx.beginPath();
  ctx.ellipse(6.8, 0, 3.7, 2.9, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#150806';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // four glowing eyes
  ctx.fillStyle = '#ffd36a';
  ctx.shadowColor = glow;
  ctx.shadowBlur = 6;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(7.6, side * 0.75, 0.85, 0, TAU);
    ctx.arc(6.5, side * 1.6, 0.6, 0, TAU);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
  // mandibles
  ctx.strokeStyle = '#3a1810';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(9.2, -1.5);
  ctx.quadraticCurveTo(12, -3.6, 12.8, -4.9);
  ctx.moveTo(9.2, 1.5);
  ctx.quadraticCurveTo(12, 3.6, 12.8, 4.9);
  ctx.stroke();
  // antennae
  ctx.strokeStyle = '#6c3220';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(6, -2.7);
  ctx.lineTo(9.4, -6.2);
  ctx.moveTo(6, 2.7);
  ctx.lineTo(9.4, 6.2);
  ctx.stroke();
  // embers trailing
  ctx.fillStyle = 'rgba(255, 172, 74, 0.8)';
  for (let i = 0; i < 3; i++) {
    const t = (time * 1.8 + i * 0.7) % 1;
    ctx.globalAlpha = 1 - t;
    ctx.beginPath();
    ctx.arc(-10 - t * 6, Math.sin(i * 2.7 + time * 3) * 2.4, 0.75, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/* —— Mustafar · mining droid —— */
function drawMiningDroidBody(ctx, e, time) {
  const drill = time * 13 + (e.phase || 0);
  const heat = 0.7 + Math.sin(time * 4.5) * 0.3;

  // four industrial legs
  ctx.strokeStyle = '#2e2622';
  ctx.lineWidth = 3.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const side of [-1, 1]) {
    for (let i = 0; i < 2; i++) {
      const swing = Math.sin(time * 7 + i * 2.5 + side + (e.phase || 0)) * 1.7;
      const bx = i === 0 ? -8 : 5;
      ctx.beginPath();
      ctx.moveTo(bx, side * 4.5);
      ctx.lineTo(bx - 5 + swing, side * 10.6);
      ctx.lineTo(bx - 1 + swing, side * 15);
      ctx.stroke();
      ctx.fillStyle = '#67544a';
      ctx.beginPath();
      ctx.arc(bx - 5 + swing, side * 10.6, 1.8, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#1d1815';
      roundRect(ctx, bx - 3 + swing, side * 15 - 1.4, 5.6, 2.8, 1.1);
      ctx.fill();
    }
  }

  // exhaust stacks
  ctx.fillStyle = '#51433b';
  roundRect(ctx, -13, -8.6, 3.2, 5, 0.8);
  ctx.fill();
  roundRect(ctx, -13, 3.6, 3.2, 5, 0.8);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 136, 52, 0.55)';
  ctx.beginPath();
  ctx.arc(-11.4, -9.4, 1.4, 0, TAU);
  ctx.arc(-11.4, 9.4, 1.4, 0, TAU);
  ctx.fill();

  // heavy industrial hull
  const g = ctx.createLinearGradient(0, -11, 0, 11);
  g.addColorStop(0, '#79675d');
  g.addColorStop(0.45, '#4d4039');
  g.addColorStop(1, '#231d1a');
  ctx.fillStyle = g;
  roundRect(ctx, -11, -9, 18, 18, 4.2);
  ctx.fill();
  ctx.strokeStyle = '#15100e';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  // cage ribs
  ctx.strokeStyle = 'rgba(176, 148, 125, 0.42)';
  ctx.lineWidth = 0.9;
  for (let i = -7; i <= 5; i += 4) {
    ctx.beginPath();
    ctx.moveTo(i, -8.2);
    ctx.lineTo(i, 8.2);
    ctx.stroke();
  }
  // central furnace chamber
  ctx.fillStyle = '#1a1311';
  roundRect(ctx, -4.8, -6.8, 9.6, 13.6, 2.8);
  ctx.fill();
  ctx.strokeStyle = '#0b0807';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.fillStyle = `rgba(255, 122, 30, ${0.55 + heat * 0.35})`;
  ctx.shadowColor = 'rgba(255, 100, 20, 1)';
  ctx.shadowBlur = 13 * heat;
  roundRect(ctx, -2.6, -4.6, 5.2, 9.2, 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // furnace grate
  ctx.strokeStyle = 'rgba(46, 31, 24, 0.9)';
  ctx.lineWidth = 1;
  for (let i = -2; i <= 2; i += 2) {
    ctx.beginPath();
    ctx.moveTo(-2.2, i);
    ctx.lineTo(2.2, i);
    ctx.stroke();
  }
  // hazard stripes
  ctx.fillStyle = '#b9903e';
  roundRect(ctx, -9.2, -8.2, 2.4, 6.4, 0.6);
  ctx.fill();
  ctx.fillStyle = '#1c1512';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-9.2, -7.2 + i * 2);
    ctx.lineTo(-6.8, -8 + i * 2);
    ctx.lineTo(-6.8, -7.4 + i * 2);
    ctx.lineTo(-9.2, -6.6 + i * 2);
    ctx.closePath();
    ctx.fill();
  }

  // drill arm and spinning bit
  ctx.fillStyle = '#3e342e';
  roundRect(ctx, 6, -3.2, 7.4, 6.4, 1.8);
  ctx.fill();
  ctx.strokeStyle = '#171210';
  ctx.lineWidth = 0.9;
  ctx.stroke();
  ctx.save();
  ctx.translate(13, 0);
  ctx.rotate(drill);
  ctx.fillStyle = '#8c7664';
  ctx.beginPath();
  ctx.moveTo(0, -4.3);
  ctx.lineTo(8.8, 0);
  ctx.lineTo(0, 4.3);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#2a211c';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.strokeStyle = '#c2a88d';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(0.8, -3.4);
  ctx.lineTo(7.4, 0);
  ctx.lineTo(0.8, 3.4);
  ctx.stroke();
  ctx.restore();
  // drill glow
  ctx.fillStyle = 'rgba(255, 150, 54, 0.9)';
  ctx.shadowColor = 'rgba(255, 120, 30, 0.95)';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(21.8, 0, 1.2, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;

  // sensor head
  ctx.fillStyle = '#5a4a41';
  roundRect(ctx, 2.5, -13, 6.4, 4.2, 1.4);
  ctx.fill();
  ctx.strokeStyle = '#15100e';
  ctx.lineWidth = 0.7;
  ctx.stroke();
  ctx.fillStyle = '#ffb24e';
  ctx.shadowColor = 'rgba(255, 160, 50, 0.95)';
  ctx.shadowBlur = 5;
  ctx.beginPath();
  ctx.arc(7.1, -10.9, 0.9, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
  // antenna
  ctx.strokeStyle = '#937b68';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(4, -13);
  ctx.lineTo(1.5, -17);
  ctx.stroke();
}

/* —— Mustafar · Sith enforcer —— */
function drawSithBody(ctx, e, time) {
  const walk = Math.sin(time * 6 + (e.phase || 0)) * 0.9;
  const capeSway = Math.sin(time * 3.4 + (e.phase || 0)) * 1.3;

  // cape
  const cape = ctx.createLinearGradient(-20, 0, 2, 0);
  cape.addColorStop(0, '#080607');
  cape.addColorStop(0.55, '#21161a');
  cape.addColorStop(1, '#43252c');
  ctx.fillStyle = cape;
  ctx.beginPath();
  ctx.moveTo(-2, -5.4);
  ctx.quadraticCurveTo(-16 - capeSway, -15, -23 - capeSway, -3);
  ctx.quadraticCurveTo(-26 - capeSway, 8, -17, 14);
  ctx.lineTo(-1, 7);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(145, 48, 54, 0.38)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // cape fold highlights
  ctx.strokeStyle = 'rgba(120, 48, 56, 0.36)';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(-6, -3);
  ctx.quadraticCurveTo(-13, 1, -17, 10);
  ctx.moveTo(-4, 1);
  ctx.quadraticCurveTo(-9, 5, -11, 11);
  ctx.stroke();

  // legs
  ctx.strokeStyle = '#0d0a0c';
  ctx.lineWidth = 2.7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-2, -3.2);
  ctx.lineTo(-6 + walk, -9.2);
  ctx.moveTo(-2, 3.2);
  ctx.lineTo(-6 - walk, 9.2);
  ctx.stroke();
  ctx.fillStyle = '#0a0709';
  roundRect(ctx, -9 + walk, -10.4, 5.6, 2.4, 1);
  ctx.fill();
  roundRect(ctx, -9 - walk, 8, 5.6, 2.4, 1);
  ctx.fill();

  // layered robe
  const body = ctx.createLinearGradient(0, -8, 0, 8);
  body.addColorStop(0, '#33242b');
  body.addColorStop(1, '#0e090c');
  ctx.fillStyle = body;
  roundRect(ctx, -8.5, -7.2, 14, 14.4, 3.8);
  ctx.fill();
  ctx.strokeStyle = 'rgba(145, 58, 64, 0.42)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // tabard
  ctx.fillStyle = '#1b1116';
  ctx.beginPath();
  ctx.moveTo(-5, -5);
  ctx.lineTo(1.8, -4.2);
  ctx.lineTo(1.4, 5.6);
  ctx.lineTo(-5.4, 6.4);
  ctx.closePath();
  ctx.fill();
  // shoulder armor
  ctx.fillStyle = '#3c2a31';
  roundRect(ctx, -4.5, -8.4, 7.4, 3.4, 1.3);
  ctx.fill();
  ctx.strokeStyle = '#120c0f';
  ctx.lineWidth = 0.7;
  ctx.stroke();

  // hood
  ctx.fillStyle = '#1a1216';
  ctx.beginPath();
  ctx.ellipse(5.2, 0, 6.6, 6.7, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#3d252b';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // mask
  ctx.fillStyle = '#080607';
  ctx.beginPath();
  ctx.ellipse(7.6, 0, 3.5, 4.2, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#503137';
  ctx.lineWidth = 0.6;
  ctx.stroke();
  // mask ridges
  ctx.strokeStyle = 'rgba(124, 67, 70, 0.55)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(8.6, -3);
  ctx.lineTo(9.2, 3);
  ctx.stroke();
  // burning eyes
  ctx.fillStyle = '#ff3a2c';
  ctx.shadowColor = 'rgba(255, 50, 40, 1)';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(9, -1.7, 0.85, 0, TAU);
  ctx.arc(9, 1.7, 0.85, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;

  // lightsaber
  const swing = Math.sin(time * 3.8 + (e.phase || 0)) * 0.65;
  ctx.save();
  ctx.translate(3.6, 4.2);
  ctx.rotate(-0.24 + swing);
  ctx.fillStyle = '#2a2a2e';
  roundRect(ctx, 0, -1, 6.4, 2, 0.8);
  ctx.fill();
  ctx.fillStyle = '#77777e';
  roundRect(ctx, 4.2, -1.3, 1.6, 2.6, 0.6);
  ctx.fill();
  // blade glow
  ctx.strokeStyle = 'rgba(255, 42, 34, 0.35)';
  ctx.lineWidth = 5.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(6.4, 0);
  ctx.lineTo(25, 0);
  ctx.stroke();
  ctx.strokeStyle = '#ff2f2a';
  ctx.shadowColor = 'rgba(255, 40, 36, 1)';
  ctx.shadowBlur = 11;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(6.4, 0);
  ctx.lineTo(25, 0);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 210, 200, 0.95)';
  ctx.shadowBlur = 0;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(6.4, 0);
  ctx.lineTo(25, 0);
  ctx.stroke();
  ctx.restore();
}

/* —— Endor · forest creatures —— */
function drawEwokBody(ctx, e, time) {
  const p = e.phase || 0;
  const step = Math.sin(time * 13 + p) * 1.15;
  // Little furred feet and round body.
  ctx.strokeStyle = '#59402f';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-2, -3.4); ctx.lineTo(-5 + step, -7.1); ctx.lineTo(-2 + step, -8.2);
  ctx.moveTo(-2, 3.4); ctx.lineTo(-5 - step, 7.1); ctx.lineTo(-2 - step, 8.2);
  ctx.stroke();
  ctx.fillStyle = '#65452f';
  ctx.beginPath();
  ctx.ellipse(-1.5, 0, 6.4, 5.3, 0, 0, TAU);
  ctx.fill();
  // A warm rim keeps the small silhouette legible against Endor's dark trail.
  ctx.strokeStyle = '#e0c58f';
  ctx.lineWidth = 1.25;
  ctx.stroke();
  // shaggy edge, kept soft and rounded rather than spiky.
  ctx.fillStyle = '#a87546';
  for (let i = 0; i < 7; i++) {
    const a = i * TAU / 7;
    ctx.beginPath();
    ctx.arc(-1.5 + Math.cos(a) * 4.7, Math.sin(a) * 4.1, 1.8, 0, TAU);
    ctx.fill();
  }
  // Bright hood and little face stay distinct when several Ewoks bunch together.
  ctx.fillStyle = '#e6c783';
  ctx.beginPath();
  ctx.ellipse(4.2, 0, 5.1, 5.4, 0, -Math.PI / 2, Math.PI / 2);
  ctx.quadraticCurveTo(8, 0, 4.2, -5.4);
  ctx.fill();
  ctx.strokeStyle = '#49372a';
  ctx.lineWidth = 1.05;
  ctx.stroke();
  ctx.fillStyle = '#704832';
  ctx.beginPath();
  ctx.ellipse(6.7, 0, 2.7, 3, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#f2d89a';
  ctx.beginPath();
  ctx.arc(7.5, -1.05, 0.62, 0, TAU);
  ctx.arc(7.5, 1.05, 0.62, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#241b16';
  ctx.beginPath();
  ctx.arc(7.75, -1.05, 0.28, 0, TAU);
  ctx.arc(7.75, 1.05, 0.28, 0, TAU);
  ctx.fill();
  // Wooden spear, carried forward with a pale edge for gameplay readability.
  ctx.strokeStyle = '#493425';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(1, 3.1); ctx.lineTo(19, 2.1);
  ctx.stroke();
  ctx.strokeStyle = '#d6bd89';
  ctx.lineWidth = 1.05;
  ctx.beginPath();
  ctx.moveTo(1, 3.1); ctx.lineTo(19, 2.1);
  ctx.stroke();
  ctx.strokeStyle = '#d4c8a7';
  ctx.lineWidth = 1.35;
  ctx.beginPath();
  ctx.moveTo(19, 2.1); ctx.lineTo(23, 1.25); ctx.lineTo(19, 3.1);
  ctx.stroke();
  ctx.strokeStyle = '#9b7147';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(1.7, 2.8); ctx.lineTo(4, 4.2);
  ctx.stroke();
}

function drawBoarWolfBody(ctx, e, time) {
  const p = e.phase || 0;
  const gait = Math.sin(time * 8 + p) * 1.5;
  // Four sturdy legs under a broad, muscular body.
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#424b4e';
  ctx.lineWidth = 4.1;
  ctx.beginPath();
  ctx.moveTo(-7, -5); ctx.lineTo(-10 + gait, -10); ctx.lineTo(-8 + gait, -13);
  ctx.moveTo(5, -5); ctx.lineTo(8 - gait, -10); ctx.lineTo(11 - gait, -12);
  ctx.moveTo(-7, 5); ctx.lineTo(-10 - gait, 10); ctx.lineTo(-8 - gait, 13);
  ctx.moveTo(5, 5); ctx.lineTo(8 + gait, 10); ctx.lineTo(11 + gait, 12);
  ctx.stroke();
  ctx.fillStyle = '#30383b';
  for (const [x, y] of [[-8 + gait, -13], [11 - gait, -12], [-8 - gait, 13], [11 + gait, 12]]) {
    ctx.beginPath(); ctx.ellipse(x, y, 3.2, 1.9, 0, 0, TAU); ctx.fill();
  }
  const fur = ctx.createLinearGradient(-7, -8, 8, 8);
  fur.addColorStop(0, '#697477'); fur.addColorStop(0.52, '#515b5f'); fur.addColorStop(1, '#394346');
  ctx.fillStyle = fur;
  ctx.beginPath();
  ctx.ellipse(-1, 0, 11.5, 8.3, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(207, 218, 202, 0.54)'; ctx.lineWidth = 1.15; ctx.stroke();
  ctx.strokeStyle = 'rgba(231, 226, 194, 0.42)'; ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.arc(-1, 0, 10.3, -2.55, -0.75); ctx.stroke();
  // Heavy shoulder blends into the thick neck and forward-set boar muzzle.
  ctx.fillStyle = '#4b5659';
  ctx.beginPath(); ctx.ellipse(5, 0, 6, 7.5, 0, 0, TAU); ctx.fill();
  // Thick neck, angular muzzle and small dark mane ridge.
  ctx.fillStyle = '#667276';
  ctx.beginPath();
  ctx.moveTo(3, -6.8); ctx.quadraticCurveTo(8, -8, 10, -4.5);
  ctx.lineTo(14.5, -3.2); ctx.lineTo(16.2, 0); ctx.lineTo(14.5, 3.2);
  ctx.lineTo(9, 5); ctx.lineTo(3, 6.8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#262c2f';
  ctx.beginPath();
  ctx.moveTo(2, -6); ctx.lineTo(5, -10); ctx.lineTo(7, -6.7);
  ctx.lineTo(10, -10); ctx.lineTo(11, -5.7); ctx.closePath(); ctx.fill();
  // Tusks curve up from the broad snout.
  ctx.fillStyle = '#d9d4c4';
  ctx.beginPath();
  ctx.moveTo(10, -2.2); ctx.quadraticCurveTo(13.2, -3.4, 13.5, -7.1);
  ctx.quadraticCurveTo(15.8, -3.5, 14.1, 0); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(10, 2.2); ctx.quadraticCurveTo(13.2, 3.4, 13.5, 7.1);
  ctx.quadraticCurveTo(15.8, 3.5, 14.1, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#171d20';
  ctx.beginPath(); ctx.ellipse(15.1, 0, 1.6, 2.2, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#f2c56b';
  ctx.beginPath(); ctx.arc(8.7, -3.2, 0.8, 0, TAU); ctx.fill();
  ctx.fillStyle = '#202528';
  ctx.beginPath(); ctx.arc(9, -3.2, 0.36, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(190, 199, 198, 0.22)'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.arc(-1, -0.5, 8.5, -2.6, -0.7); ctx.stroke();
}

function drawGoraxBody(ctx, e, time) {
  const p = e.phase || 0;
  const swing = Math.sin(time * 5 + p) * 2.2;
  // Massive legs and long knuckle-dragging arms establish the hulking scale.
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#33251f';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(-7, 8); ctx.lineTo(-10 + swing * 0.25, 18); ctx.lineTo(-8, 25);
  ctx.moveTo(4, 8); ctx.lineTo(8 - swing * 0.25, 18); ctx.lineTo(12, 24);
  ctx.stroke();
  ctx.fillStyle = '#241b17';
  ctx.beginPath(); ctx.ellipse(-5, 26, 6, 3.1, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(14, 25, 6, 3.1, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#644b37';
  ctx.lineWidth = 8.5;
  ctx.beginPath();
  ctx.moveTo(-8, -7); ctx.lineTo(-16 + swing, 1); ctx.lineTo(-19 + swing, 12); ctx.lineTo(-16 + swing, 23);
  ctx.moveTo(8, -7); ctx.lineTo(14 - swing, 0); ctx.lineTo(18 - swing, 11); ctx.lineTo(22 - swing, 20);
  ctx.stroke();
  ctx.fillStyle = '#38271f';
  ctx.beginPath(); ctx.ellipse(-16 + swing, 24, 5.6, 3, -0.2, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(23 - swing, 21, 5.6, 3, 0.25, 0, TAU); ctx.fill();
  // Broad chest and shoulders.
  const fur = ctx.createLinearGradient(-11, -12, 12, 12);
  fur.addColorStop(0, '#8a694b'); fur.addColorStop(0.48, '#6b4d36'); fur.addColorStop(1, '#493629');
  ctx.fillStyle = fur;
  ctx.beginPath();
  ctx.moveTo(-10, -8); ctx.quadraticCurveTo(-14, -17, -6, -20);
  ctx.lineTo(3, -18); ctx.quadraticCurveTo(13, -16, 13, -7);
  ctx.lineTo(10, 8); ctx.quadraticCurveTo(0, 16, -9, 8); ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(190, 157, 118, 0.88)'; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.strokeStyle = 'rgba(229, 199, 155, 0.55)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-8, -8); ctx.quadraticCurveTo(-10, -16, -4, -18); ctx.stroke();
  // Rounded head, heavy brow and glowing eyes.
  ctx.fillStyle = '#856246';
  ctx.beginPath(); ctx.ellipse(8, -12, 8.3, 7.6, 0.15, 0, TAU); ctx.fill();
  ctx.fillStyle = '#38271f';
  ctx.beginPath(); ctx.ellipse(12, -9.1, 4.8, 3.2, 0.1, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffe16a';
  ctx.shadowColor = 'rgba(255, 207, 63, 0.95)'; ctx.shadowBlur = 7;
  ctx.beginPath(); ctx.ellipse(10.3, -12, 1.25, 1.05, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(14.2, -11.7, 1.25, 1.05, 0, 0, TAU); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#251b17';
  ctx.beginPath(); ctx.arc(10.6, -12, 0.45, 0, TAU); ctx.arc(14.5, -11.7, 0.45, 0, TAU); ctx.fill();
  ctx.fillStyle = '#33231c';
  ctx.beginPath(); ctx.ellipse(16, -7, 3.6, 2.5, 0.1, 0, TAU); ctx.fill();
  ctx.fillStyle = '#171412';
  ctx.beginPath(); ctx.arc(17.2, -7, 0.7, 0, TAU); ctx.fill();
  // Fur grooves and knuckles.
  ctx.strokeStyle = 'rgba(190, 139, 91, 0.38)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-6, -7); ctx.quadraticCurveTo(-1, -2, 4, -5);
  ctx.moveTo(-5, 2); ctx.quadraticCurveTo(1, 7, 7, 3); ctx.stroke();
  ctx.strokeStyle = '#967253'; ctx.lineWidth = 0.75;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(19 - swing + i * 2, 20); ctx.lineTo(18 - swing + i * 2, 22.2); ctx.stroke();
  }
}

/* —— Endor · stormtrooper —— */
function drawStormtrooperBody(ctx, e, time) {
  const walk = Math.sin(time * 10.5 + (e.phase || 0)) * 1.15;

  // legs
  ctx.strokeStyle = '#7d888a';
  ctx.lineWidth = 2.7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-3, -4.4);
  ctx.lineTo(-8 + walk, -9.4);
  ctx.lineTo(-4 + walk, -13.2);
  ctx.moveTo(-3, 4.4);
  ctx.lineTo(-8 - walk, 9.4);
  ctx.lineTo(-4 - walk, 13.2);
  ctx.stroke();
  ctx.fillStyle = '#eff3f1';
  roundRect(ctx, -7 + walk, -14.8, 6, 2.8, 1.1);
  ctx.fill();
  roundRect(ctx, -7 - walk, 12, 6, 2.8, 1.1);
  ctx.fill();

  // torso
  const g = ctx.createLinearGradient(0, -8, 0, 8);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.5, '#d8dedb');
  g.addColorStop(1, '#929c98');
  ctx.fillStyle = g;
  roundRect(ctx, -8, -6.6, 14, 13.2, 3.6);
  ctx.fill();
  ctx.strokeStyle = '#5d6864';
  ctx.lineWidth = 1;
  ctx.stroke();
  // chest plate
  ctx.fillStyle = '#f2f5f2';
  roundRect(ctx, -5, -4.8, 8.4, 9.6, 2.2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(78, 91, 86, 0.65)';
  ctx.lineWidth = 0.65;
  ctx.stroke();
  // abdomen ridges
  ctx.strokeStyle = 'rgba(76, 89, 84, 0.55)';
  ctx.lineWidth = 0.7;
  for (let i = 0; i < 2; i++) {
    ctx.beginPath();
    ctx.moveTo(-4.6, 1.8 + i * 1.7);
    ctx.lineTo(2.6, 1.8 + i * 1.7);
    ctx.stroke();
  }
  // belt
  ctx.fillStyle = '#5b6662';
  ctx.fillRect(-6.2, -1.3, 9.8, 2.6);
  ctx.fillStyle = '#e6ebe8';
  ctx.fillRect(-3.2, -1.3, 2, 2.6);
  // shoulder pauldron detail
  ctx.fillStyle = '#cfd7d3';
  roundRect(ctx, -7.8, -7, 4.2, 3.2, 1.2);
  ctx.fill();

  // helmet
  const hg = ctx.createLinearGradient(4, -5, 14, 5);
  hg.addColorStop(0, '#ffffff');
  hg.addColorStop(0.55, '#e2e8e5');
  hg.addColorStop(1, '#a7b2ae');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.moveTo(5, -5);
  ctx.lineTo(10.4, -4.6);
  ctx.quadraticCurveTo(14.8, -2.8, 14.8, 0);
  ctx.quadraticCurveTo(14.8, 2.8, 10.4, 4.6);
  ctx.lineTo(5, 5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#5f6b66';
  ctx.lineWidth = 0.9;
  ctx.stroke();
  // black eye lenses
  ctx.fillStyle = '#20282a';
  ctx.beginPath();
  ctx.ellipse(10.1, -1.8, 2.1, 1.45, -0.2, 0, TAU);
  ctx.ellipse(10.1, 1.8, 2.1, 1.45, 0.2, 0, TAU);
  ctx.fill();
  // frown vents
  ctx.strokeStyle = '#4b5652';
  ctx.lineWidth = 0.65;
  ctx.beginPath();
  ctx.moveTo(11.1, 0.25);
  ctx.lineTo(12.7, 0.25);
  ctx.moveTo(11.1, -0.25);
  ctx.lineTo(12.7, -0.25);
  ctx.stroke();
  // helmet ridge
  ctx.strokeStyle = '#8d9994';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(6.2, -4.6);
  ctx.lineTo(8.2, -5.6);
  ctx.lineTo(9.2, -4.9);
  ctx.stroke();

  // E-11 blaster
  ctx.fillStyle = '#252d2f';
  roundRect(ctx, 7.2, 2.8, 13.6, 1.5, 0.6);
  ctx.fill();
  ctx.fillStyle = '#d9e0dd';
  roundRect(ctx, 8.2, 1.7, 5, 3.5, 1.2);
  ctx.fill();
  ctx.strokeStyle = '#8d9994';
  ctx.lineWidth = 0.55;
  ctx.beginPath();
  ctx.moveTo(9.1, 2.6);
  ctx.lineTo(20.1, 2.6);
  ctx.stroke();
}

/* —— Endor · scout trooper on speeder bike —— */
function drawBikerScoutBody(ctx, e, time) {
  const lean = Math.sin(time * 7 + (e.phase || 0)) * 0.6;

  // engine trail
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const tg = ctx.createLinearGradient(-12, 0, -34, 0);
  tg.addColorStop(0, 'rgba(138, 224, 255, 0.55)');
  tg.addColorStop(1, 'rgba(100, 200, 255, 0)');
  ctx.fillStyle = tg;
  ctx.beginPath();
  ctx.moveTo(-11, -2.4);
  ctx.lineTo(-34, 0);
  ctx.lineTo(-11, 2.4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // rear engine block
  ctx.fillStyle = '#4d5a5e';
  roundRect(ctx, -15, -4.8, 8, 9.6, 2.8);
  ctx.fill();
  ctx.strokeStyle = '#232c2e';
  ctx.lineWidth = 0.9;
  ctx.stroke();
  // engine nozzles
  ctx.fillStyle = 'rgba(156, 232, 255, 0.95)';
  ctx.shadowColor = 'rgba(130, 220, 255, 0.95)';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(-14.8, -2.1, 1.1, 0, TAU);
  ctx.arc(-14.8, 2.1, 1.1, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;

  // long speeder chassis
  const g = ctx.createLinearGradient(-12, -3.2, 20, 3.2);
  g.addColorStop(0, '#9aa9ad');
  g.addColorStop(0.45, '#e2e9e9');
  g.addColorStop(1, '#7d8d91');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-10, -5.4);
  ctx.lineTo(10, -3.2);
  ctx.lineTo(20, -1.1);
  ctx.lineTo(20, 1.1);
  ctx.lineTo(10, 3.2);
  ctx.lineTo(-10, 5.4);
  ctx.quadraticCurveTo(-13, 0, -10, -5.4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#465358';
  ctx.lineWidth = 1;
  ctx.stroke();
  // central stripe
  ctx.fillStyle = '#6f7f83';
  roundRect(ctx, -9, -1.1, 26, 2.2, 1);
  ctx.fill();
  // forward steering vanes
  ctx.fillStyle = '#c7d2d4';
  ctx.beginPath();
  ctx.moveTo(17, -1.2);
  ctx.lineTo(26, -5 + lean);
  ctx.lineTo(23.5, 0);
  ctx.lineTo(26, 5 - lean);
  ctx.lineTo(17, 1.2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#4d5b5f';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // handlebars
  ctx.strokeStyle = '#313b3e';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(7, -2.2);
  ctx.lineTo(9, -5.4);
  ctx.moveTo(7, 2.2);
  ctx.lineTo(9, 5.4);
  ctx.stroke();

  // rider in scout armor
  ctx.fillStyle = '#dbe4e4';
  roundRect(ctx, -5, -4.6, 9.6, 9.2, 3.2);
  ctx.fill();
  ctx.strokeStyle = '#69787c';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // back plate
  ctx.fillStyle = '#8b9a9d';
  roundRect(ctx, -6.6, -3.8, 3.6, 7.6, 1.4);
  ctx.fill();
  // arms to bars
  ctx.strokeStyle = '#d3dedf';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(1.5, -3.4);
  ctx.lineTo(7.6, -4.8);
  ctx.moveTo(1.5, 3.4);
  ctx.lineTo(7.6, 4.8);
  ctx.stroke();
  // scout helmet
  const hg = ctx.createLinearGradient(2, -4.5, 11, 4.5);
  hg.addColorStop(0, '#f2f6f5');
  hg.addColorStop(1, '#aebcbe');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.moveTo(2.6, -4.4);
  ctx.lineTo(8.4, -3.8);
  ctx.quadraticCurveTo(11, -1.8, 11, 0);
  ctx.quadraticCurveTo(11, 1.8, 8.4, 3.8);
  ctx.lineTo(2.6, 4.4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#5c6c70';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // visor band
  ctx.fillStyle = '#1c2528';
  roundRect(ctx, 6.2, -2.4, 3.8, 4.8, 1.5);
  ctx.fill();
  ctx.fillStyle = 'rgba(135, 225, 255, 0.55)';
  roundRect(ctx, 6.7, -1.8, 2.8, 1.1, 0.4);
  ctx.fill();
  // blaster held at side
  ctx.fillStyle = '#283033';
  roundRect(ctx, 0, 4.4, 11, 1.3, 0.5);
  ctx.fill();
}

/* —— Endor · storm commando —— */
function drawCommandoBody(ctx, e, time) {
  const walk = Math.sin(time * 9 + (e.phase || 0)) * 1.2;

  // legs
  ctx.strokeStyle = '#1d2225';
  ctx.lineWidth = 3.1;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-3, -4.6);
  ctx.lineTo(-8 + walk, -9.6);
  ctx.lineTo(-4 + walk, -13.4);
  ctx.moveTo(-3, 4.6);
  ctx.lineTo(-8 - walk, 9.6);
  ctx.lineTo(-4 - walk, 13.4);
  ctx.stroke();
  ctx.fillStyle = '#0f1214';
  roundRect(ctx, -7.4 + walk, -15.2, 6.6, 3, 1.1);
  ctx.fill();
  roundRect(ctx, -7.4 - walk, 12.2, 6.6, 3, 1.1);
  ctx.fill();

  // armored kama
  ctx.fillStyle = '#272d31';
  ctx.beginPath();
  ctx.moveTo(-6.4, -4.8);
  ctx.lineTo(-12.6, -8.4);
  ctx.lineTo(-10.2, -1);
  ctx.lineTo(-12.2, 5.2);
  ctx.lineTo(-6.2, 4.4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#0b0d0f';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // torso
  const g = ctx.createLinearGradient(0, -8, 0, 8);
  g.addColorStop(0, '#727a80');
  g.addColorStop(0.5, '#41474c');
  g.addColorStop(1, '#1c2023');
  ctx.fillStyle = g;
  roundRect(ctx, -8, -7, 14, 14, 3.8);
  ctx.fill();
  ctx.strokeStyle = '#0c0e10';
  ctx.lineWidth = 1;
  ctx.stroke();
  // chest armor
  ctx.fillStyle = '#4d545a';
  roundRect(ctx, -5, -5, 8.8, 10, 2.2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(10, 12, 14, 0.8)';
  ctx.lineWidth = 0.7;
  ctx.stroke();
  // red sigil
  ctx.fillStyle = '#b3342a';
  ctx.beginPath();
  ctx.arc(0.6, 0, 1.5, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#ff6a54';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.arc(0.6, 0, 2.4, 0, TAU);
  ctx.stroke();
  // heavy shoulder pauldron
  ctx.fillStyle = '#2a3034';
  roundRect(ctx, -6.8, -10.2, 9.4, 4.4, 1.6);
  ctx.fill();
  ctx.strokeStyle = '#0a0c0d';
  ctx.lineWidth = 0.7;
  ctx.stroke();
  ctx.fillStyle = '#a83a2c';
  ctx.fillRect(-1, -9.7, 2.4, 1);

  // backpack and antenna
  ctx.fillStyle = '#1c2124';
  roundRect(ctx, -12.2, -5.4, 5, 10.8, 1.7);
  ctx.fill();
  ctx.strokeStyle = '#080a0b';
  ctx.lineWidth = 0.7;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 86, 68, 0.8)';
  ctx.fillRect(-11.4, -4, 1.3, 8);
  ctx.strokeStyle = '#7c878c';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(-10.6, -5.2);
  ctx.lineTo(-14.6, -11.2);
  ctx.stroke();

  // angular commando helmet
  const hg = ctx.createLinearGradient(4, -5, 14, 5);
  hg.addColorStop(0, '#5b6369');
  hg.addColorStop(0.55, '#343a3f');
  hg.addColorStop(1, '#171b1e');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.moveTo(4.4, -5.1);
  ctx.lineTo(9.8, -4.9);
  ctx.lineTo(14.6, -2.6);
  ctx.lineTo(14.6, 2.6);
  ctx.lineTo(9.8, 4.9);
  ctx.lineTo(4.4, 5.1);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#090b0c';
  ctx.lineWidth = 0.9;
  ctx.stroke();
  // red visor strip
  ctx.fillStyle = '#ff5644';
  ctx.shadowColor = 'rgba(255, 76, 54, 0.95)';
  ctx.shadowBlur = 7;
  roundRect(ctx, 9, -1.3, 5.4, 2.6, 0.9);
  ctx.fill();
  ctx.shadowBlur = 0;
  // brow plate
  ctx.fillStyle = '#22282c';
  roundRect(ctx, 7, -4.4, 5.4, 1.4, 0.6);
  ctx.fill();
  // respirator
  ctx.strokeStyle = '#5c676d';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(6.4, 3.8);
  ctx.quadraticCurveTo(4.4, 6.6, 1.2, 5.8);
  ctx.stroke();

  // long heavy blaster
  ctx.fillStyle = '#101416';
  roundRect(ctx, 6.6, 2.8, 16.8, 1.7, 0.7);
  ctx.fill();
  ctx.fillStyle = '#3d454a';
  roundRect(ctx, 7.6, 1.6, 6.2, 4, 1.3);
  ctx.fill();
  ctx.fillStyle = '#ff7b62';
  ctx.shadowColor = 'rgba(255, 100, 76, 0.9)';
  ctx.shadowBlur = 4;
  roundRect(ctx, 21.4, 2.7, 2.4, 1.8, 0.6);
  ctx.fill();
  ctx.shadowBlur = 0;
}

/* —— Endor · AT-ST commander —— */
function drawCommandWalkerBody(ctx, e, time) {
  const walk = Math.sin(time * 6.4 + (e.phase || 0)) * 2.9;
  const pulse = 0.75 + Math.sin(time * 4 + (e.phase || 0)) * 0.25;
  ctx.save();
  ctx.scale(1.12, 1.12);

  // heavy armored legs
  ctx.strokeStyle = '#242d30';
  ctx.lineWidth = 3.6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(-4, side * 4);
    ctx.lineTo(-12 + walk * 0.5, side * 10.8);
    ctx.lineTo(-4 + walk, side * 16.5);
    ctx.stroke();
    ctx.fillStyle = '#59686c';
    ctx.beginPath();
    ctx.arc(-12 + walk * 0.5, side * 10.8, 2.5, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#354044';
    roundRect(ctx, -9 + walk, side * 16.5 - 2, 9, 4, 1.5);
    ctx.fill();
    // leg armor plate
    ctx.fillStyle = '#6d7c80';
    roundRect(ctx, -9 + walk * 0.5, side * 12.2 - 1.2, 6.4, 2.4, 0.8);
    ctx.fill();
  }
  // hip block
  ctx.fillStyle = '#3d4a4e';
  roundRect(ctx, -11, -6, 10, 12, 3.4);
  ctx.fill();

  // wide command hull
  const g = ctx.createLinearGradient(0, -11, 0, 11);
  g.addColorStop(0, '#9aa9ad');
  g.addColorStop(0.45, '#65757a');
  g.addColorStop(1, '#354145');
  ctx.fillStyle = g;
  roundRect(ctx, -9, -10, 19, 20, 5);
  ctx.fill();
  ctx.strokeStyle = '#1c2427';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  // extra command armor
  ctx.fillStyle = '#566569';
  roundRect(ctx, -7, -12.4, 12.6, 4.4, 1.6);
  ctx.fill();
  ctx.strokeStyle = '#1b2325';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 0.8;
  roundRect(ctx, -7.2, -7.8, 13.4, 4.4, 1.4);
  ctx.stroke();
  roundRect(ctx, -7.2, 3.4, 13.4, 4.4, 1.4);
  ctx.stroke();
  // side pods
  ctx.fillStyle = '#465458';
  roundRect(ctx, -2, -13.4, 6, 3.4, 1.2);
  ctx.fill();
  roundRect(ctx, -2, 10, 6, 3.4, 1.2);
  ctx.fill();
  // command dish
  ctx.strokeStyle = '#79898d';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(-5, -12);
  ctx.lineTo(-8, -19);
  ctx.stroke();
  ctx.fillStyle = '#a7b5b8';
  ctx.beginPath();
  ctx.ellipse(-9, -20, 4.2, 2, -0.5, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#4a575b';
  ctx.lineWidth = 0.7;
  ctx.stroke();
  ctx.fillStyle = `rgba(255, 92, 64, ${pulse})`;
  ctx.shadowColor = 'rgba(255, 80, 54, 0.95)';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(-8.4, -19.6, 1, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
  // tall antenna
  ctx.strokeStyle = '#b7c3c5';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-1, -12.4);
  ctx.lineTo(2.4, -21);
  ctx.stroke();
  ctx.fillStyle = '#ffb35f';
  ctx.beginPath();
  ctx.arc(2.4, -21, 1.2, 0, TAU);
  ctx.fill();

  // command head with twin long cannons
  const hg = ctx.createLinearGradient(6, -7, 20, 7);
  hg.addColorStop(0, '#a7b5b8');
  hg.addColorStop(1, '#4e5c60');
  ctx.fillStyle = hg;
  roundRect(ctx, 8, -7.4, 11.4, 14.8, 3.6);
  ctx.fill();
  ctx.strokeStyle = '#1d2528';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // red commander visor
  ctx.fillStyle = `rgba(255, 74, 60, ${pulse})`;
  ctx.shadowColor = 'rgba(255, 60, 48, 0.95)';
  ctx.shadowBlur = 8;
  roundRect(ctx, 12.8, -4.2, 5.2, 2.6, 0.9);
  ctx.fill();
  roundRect(ctx, 12.8, 1.6, 5.2, 2.6, 0.9);
  ctx.fill();
  ctx.shadowBlur = 0;
  // twin long-barrel chin guns
  ctx.fillStyle = '#222b2e';
  roundRect(ctx, 16, -4, 12, 1.9, 0.8);
  ctx.fill();
  roundRect(ctx, 16, 2.1, 12, 1.9, 0.8);
  ctx.fill();
  ctx.fillStyle = '#69797d';
  roundRect(ctx, 15, -4.8, 4.2, 3.2, 1);
  ctx.fill();
  roundRect(ctx, 15, 1.6, 4.2, 3.2, 1);
  ctx.fill();
  // chin armor
  ctx.fillStyle = '#57666a';
  roundRect(ctx, 10, 5.4, 7, 2.2, 0.8);
  ctx.fill();
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
