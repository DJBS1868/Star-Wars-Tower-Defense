/* ============================================================
   Canvas art — procedural Rebel outpost battlefield
   All game visuals are drawn with the 2D canvas (no assets).
   ============================================================ */

import { DECOR, ENEMY_TYPES, TOWERS, clamp } from './data.js';

const TAU = Math.PI * 2;
const TOWER_ART = 1.32;
const ENEMY_ART = 2.02;

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

export function buildBackground(w, h, pathPts, S, dpr = 1) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.floor(w * dpr));
  c.height = Math.max(1, Math.floor(h * dpr));
  const ctx = c.getContext('2d');
  ctx.scale(dpr, dpr);
  const rng = mulberry32(0x5a7b21);
  const m = Math.min(w, h);

  // --- base sand -------------------------------------------------
  const bg = ctx.createLinearGradient(0, 0, w * 0.4, h);
  bg.addColorStop(0, '#d8ad72');
  bg.addColorStop(0.44, '#cfa067');
  bg.addColorStop(1, '#bf8e58');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // huge soft dune bands
  const dunes = [
    { x: -0.05, y: 0.02, w: 0.52, h: 0.28, c: 'rgba(246, 215, 163, 0.24)' },
    { x: 0.45, y: 0.02, w: 0.62, h: 0.22, c: 'rgba(246, 215, 163, 0.17)' },
    { x: 0.03, y: 0.78, w: 0.42, h: 0.30, c: 'rgba(160, 112, 64, 0.15)' },
    { x: 0.55, y: 0.73, w: 0.50, h: 0.34, c: 'rgba(247, 213, 157, 0.14)' },
    { x: 0.33, y: 0.35, w: 0.37, h: 0.23, c: 'rgba(246, 215, 163, 0.10)' },
  ];
  for (const d of dunes) {
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

  // wind ripples
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < 44; i++) {
    const x = rng() * w;
    const y = rng() * h;
    if (distanceToPath(x, y, pathPts) < 44 * S) continue;
    const len = (12 + rng() * 46) * S;
    const bend = (rng() - 0.5) * 18 * S;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + len * 0.5, y + bend, x + len, y + bend * 0.2);
    ctx.strokeStyle = `rgba(126, 85, 45, ${0.05 + rng() * 0.06})`;
    ctx.lineWidth = (0.8 + rng() * 1.4) * S;
    ctx.stroke();
  }
  ctx.restore();

  // speckles / pebbles
  for (let i = 0; i < 380; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const s = (0.4 + rng() * 1.7) * S;
    ctx.fillStyle = rng() > 0.5 ? `rgba(111, 74, 38, ${0.05 + rng() * 0.15})` : `rgba(250, 226, 174, ${0.06 + rng() * 0.16})`;
    ctx.beginPath();
    ctx.arc(x, y, s, 0, TAU);
    ctx.fill();
  }

  // --- race-track path -------------------------------------------
  const pw = clamp(34 * S, 28, 54);
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // path ambient shadow
  tracePoints(ctx, offsetPath(pathPts, 5 * S));
  ctx.strokeStyle = 'rgba(79, 48, 23, 0.20)';
  ctx.lineWidth = pw + 17 * S;
  ctx.stroke();

  // dark outer bank
  tracePoints(ctx, pathPts);
  ctx.strokeStyle = '#9c6a3b';
  ctx.lineWidth = pw + 9 * S;
  ctx.stroke();

  // packed sand
  tracePoints(ctx, pathPts);
  const pathGrad = ctx.createLinearGradient(0, 0, w, h);
  pathGrad.addColorStop(0, '#e8c48c');
  pathGrad.addColorStop(0.5, '#edcc95');
  pathGrad.addColorStop(1, '#e3bb80');
  ctx.strokeStyle = pathGrad;
  ctx.lineWidth = pw;
  ctx.stroke();

  // inner highlight
  tracePoints(ctx, offsetPath(pathPts, -pw * 0.12));
  ctx.strokeStyle = 'rgba(255, 233, 184, 0.22)';
  ctx.lineWidth = pw * 0.5;
  ctx.stroke();

  // wheel tracks
  ctx.setLineDash([12 * S, 20 * S]);
  ctx.lineCap = 'butt';
  for (const off of [-pw * 0.19, pw * 0.19]) {
    tracePoints(ctx, offsetPath(pathPts, off));
    ctx.strokeStyle = 'rgba(129, 84, 41, 0.17)';
    ctx.lineWidth = 1.8 * S;
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();

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
      drawPebble(ctx, sx, sy, (1.5 + rng() * 3) * S, rng, rng() * TAU);
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
    ctx.strokeStyle = `rgba(105, 108, 54, ${0.14 + rng() * 0.12})`;
    ctx.lineWidth = 1.1 * S;
    ctx.beginPath();
    for (let b = -1; b <= 1; b++) {
      ctx.moveTo(x + b * 2 * S, y + 3 * S);
      ctx.quadraticCurveTo(x + b * 3 * S, y - 4 * S, x + b * 6 * S, y - 6 * S);
    }
    ctx.stroke();
  }

  // --- droid cave entrance ---------------------------------------
  drawSpawnCave(ctx, w, h, S, rng);

  // --- spawn marker ----------------------------------------------
  const first = pathPts[0];
  ctx.save();
  ctx.translate(first[0] + 10 * S, first[1]);
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = '#2a1d11';
  for (let i = 0; i < 3; i++) {
    ctx.save();
    ctx.translate(0, (i - 1) * 11 * S);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-5 * S, -5 * S, 10 * S, 10 * S);
    ctx.fillStyle = '#d8a347';
    ctx.fillRect(-2 * S, -2 * S, 4 * S, 4 * S);
    ctx.fillStyle = '#2a1d11';
    ctx.restore();
  }
  ctx.restore();

  // --- decorations ----------------------------------------------
  for (const d of DECOR) {
    const x = d.x * w;
    const y = d.y * h;
    const r = d.r * m;
    drawDecor(ctx, d, x, y, r, S, rng);
  }

  // --- relay base -------------------------------------------------
  drawRelayBaseStatic(ctx, w * 0.952, h * 0.60, m, S, rng);

  // vignette
  const vg = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.28, w * 0.5, h * 0.5, Math.max(w, h) * 0.82);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(46, 26, 9, 0.30)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);

  return c;
}

function drawSpawnCave(ctx, w, h, S, rng) {
  const cx = -10 * S;
  const cy = h * 0.64;
  const rx = 62 * S;
  const ry = 42 * S;
  ctx.save();
  // sandy rim and shadow
  ctx.fillStyle = 'rgba(64, 39, 17, 0.28)';
  ctx.beginPath();
  ctx.ellipse(cx + 18 * S, cy + 8 * S, rx * 1.06, ry * 1.04, -0.06, 0, TAU);
  ctx.fill();
  const rim = ctx.createLinearGradient(0, cy - ry, 0, cy + ry);
  rim.addColorStop(0, '#9d7347');
  rim.addColorStop(0.5, '#7b5534');
  rim.addColorStop(1, '#5f4127');
  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU);
  ctx.fill();
  // inner darkness
  const dark = ctx.createRadialGradient(cx + rx * 0.45, cy, 4, cx + rx * 0.3, cy, rx);
  dark.addColorStop(0, '#120d08');
  dark.addColorStop(0.72, '#24190f');
  dark.addColorStop(1, 'rgba(36, 25, 15, 0)');
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.ellipse(cx + 5 * S, cy, rx * 0.82, ry * 0.72, 0, 0, TAU);
  ctx.fill();
  // rocky lip (top and bottom)
  ctx.strokeStyle = 'rgba(226, 184, 122, 0.34)';
  ctx.lineWidth = 2.2 * S;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx * 0.94, ry * 0.94, 0, -1.05, 1.05);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(58, 36, 17, 0.55)';
  ctx.lineWidth = 3.2 * S;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx * 0.9, ry * 0.9, 0, 2.1, 4.15);
  ctx.stroke();
  // jagged rocks on the rim
  for (let i = 0; i < 7; i++) {
    const a = -0.9 + i * 0.3 + rng() * 0.12;
    const rr = 0.98 + rng() * 0.1;
    const px = cx + Math.cos(a) * rx * rr;
    const py = cy + Math.sin(a) * ry * rr;
    drawPebble(ctx, px, py, (3 + rng() * 4) * S, rng, rng() * TAU);
  }
  // warning chevrons
  ctx.save();
  ctx.translate(cx + rx * 0.78, cy);
  ctx.globalAlpha = 0.72;
  for (let i = -1; i <= 1; i++) {
    ctx.fillStyle = i === 0 ? '#dba64d' : '#3a2a18';
    ctx.save();
    ctx.translate(0, i * 10 * S);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-3.2 * S, -3.2 * S, 6.4 * S, 6.4 * S);
    ctx.restore();
  }
  ctx.restore();
  // red alert lamps
  for (const side of [-1, 1]) {
    const lx = cx + rx * 0.76;
    const ly = cy + side * ry * 0.66;
    ctx.fillStyle = 'rgba(255, 92, 62, 0.9)';
    ctx.shadowColor = 'rgba(255, 80, 50, 0.9)';
    ctx.shadowBlur = 8 * S;
    ctx.beginPath();
    ctx.arc(lx, ly, 2.2 * S, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;
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

function drawPebble(ctx, x, y, r, rng, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = 'rgba(86, 57, 32, 0.26)';
  ctx.beginPath();
  ctx.ellipse(0, r * 0.3, r * 1.1, r * 0.7, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = rng() > 0.5 ? '#aa7a4b' : '#8c613a';
  ctx.beginPath();
  ctx.ellipse(0, 0, r, r * 0.72, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(247, 216, 165, 0.32)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.22, -r * 0.22, r * 0.48, r * 0.28, -0.3, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawRock(ctx, x, y, r, rng) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(53, 31, 13, 0.30)';
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
  g.addColorStop(0, '#a67c51');
  g.addColorStop(0.55, '#7a5738');
  g.addColorStop(1, '#5e422b');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(57, 38, 21, 0.42)';
  ctx.lineWidth = r * 0.09;
  ctx.stroke();

  // lit face
  ctx.beginPath();
  ctx.moveTo(-r * 0.7, -r * 0.15);
  ctx.lineTo(-r * 0.1, -r * 0.72);
  ctx.lineTo(r * 0.42, -r * 0.28);
  ctx.lineTo(-r * 0.05, -r * 0.02);
  ctx.closePath();
  ctx.fillStyle = 'rgba(232, 193, 137, 0.26)';
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

function drawCrate(ctx, x, y, r, S) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.1);
  ctx.fillStyle = 'rgba(50, 30, 12, 0.28)';
  ctx.fillRect(-r * 0.8 + 2, -r * 0.6 + 3, r * 1.7, r * 1.3);
  ctx.fillStyle = '#7e6441';
  ctx.fillRect(-r * 0.85, -r * 0.65, r * 1.7, r * 1.3);
  ctx.strokeStyle = '#57432b';
  ctx.lineWidth = 1.2 * S;
  ctx.strokeRect(-r * 0.85, -r * 0.65, r * 1.7, r * 1.3);
  ctx.beginPath();
  ctx.moveTo(-r * 0.85, -r * 0.65);
  ctx.lineTo(r * 0.85, r * 0.65);
  ctx.moveTo(r * 0.85, -r * 0.65);
  ctx.lineTo(-r * 0.85, r * 0.65);
  ctx.strokeStyle = 'rgba(208, 169, 102, 0.35)';
  ctx.stroke();
  ctx.restore();
}

function drawDecor(ctx, d, x, y, r, S, rng) {
  switch (d.type) {
    case 'rock': drawRock(ctx, x, y, r, rng); break;
    case 'vaporator': drawVaporator(ctx, x, y, r, S); break;
    case 'hut': drawHut(ctx, x, y, r, S, rng); break;
    case 'bone': drawBone(ctx, x, y, r, S, rng); break;
    case 'cactus': drawCactus(ctx, x, y, r, S); break;
    case 'crate': drawCrate(ctx, x, y, r, S); break;
    default: break;
  }
}

function drawRelayBaseStatic(ctx, x, y, m, S, rng) {
  const R = clamp(m * 0.055, 22, 54);
  ctx.save();
  ctx.translate(x, y);

  // landing pad
  ctx.fillStyle = 'rgba(49, 30, 13, 0.32)';
  ctx.beginPath();
  ctx.ellipse(0, R * 0.34, R * 1.4, R * 0.72, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#9b9790';
  ctx.beginPath();
  ctx.ellipse(0, 0, R * 1.25, R * 0.75, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#6e6a63';
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
  g.addColorStop(0, '#c9c3b8');
  g.addColorStop(0.48, '#8f8b82');
  g.addColorStop(1, '#5d5a53');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, -R * 0.12, dh, Math.PI, TAU);
  ctx.lineTo(dh, -R * 0.12);
  ctx.lineTo(-dh, -R * 0.12);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#4e4a42';
  ctx.lineWidth = Math.max(1.2 * S, R * 0.05);
  ctx.stroke();

  // blue reactor window
  ctx.fillStyle = '#264a5c';
  roundRect(ctx, -R * 0.34, -R * 0.72, R * 0.68, R * 0.3, R * 0.15);
  ctx.fill();
  ctx.fillStyle = 'rgba(104, 225, 255, 0.85)';
  roundRect(ctx, -R * 0.27, -R * 0.67, R * 0.54, R * 0.19, R * 0.1);
  ctx.fill();

  // tower / antenna
  ctx.strokeStyle = '#605c54';
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
  ctx.fillStyle = '#706b61';
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

export function drawBaseShield(ctx, w, h, time, flash) {
  const m = Math.min(w, h);
  const R = clamp(m * 0.055, 22, 54);
  const x = w * 0.952;
  const y = h * 0.60 - R * 0.12;
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
  const bob = e.type === 'scout' ? Math.sin(time * 8 + e.phase) * 1.2 * V : 0;
  ctx.fillStyle = 'rgba(48, 29, 11, 0.28)';
  ctx.beginPath();
  ctx.ellipse(2 * V, (def.radius * 0.62 + 3) * V, def.radius * 0.95 * V, def.radius * 0.4 * V, 0, 0, TAU);
  ctx.fill();

  ctx.translate(0, bob);
  ctx.rotate(e.angle || 0);
  ctx.scale(V, V);

  if (e.type === 'droid') drawDroidBody(ctx, e, time, slow);
  else if (e.type === 'scout') drawScoutBody(ctx, e, time, slow);
  else if (e.type === 'tank') drawTankBody(ctx, e, time, slow);
  else if (e.type === 'boss') drawBossBody(ctx, e, time, slow);

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
  const showBar = e.hp < e.maxHp - 0.2 || e.type === 'boss';
  if (showBar) {
    const bw = (e.type === 'boss' ? 46 : Math.max(18, def.radius * 1.9)) * V;
    const bh = (e.type === 'boss' ? 4 : 2.6) * V;
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
    if (e.type === 'boss') {
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

function drawScoutBody(ctx, e, time, slow) {
  const flap = Math.sin(time * 12 + (e.phase || 0)) * 0.7;
  // thruster trail
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const tg = ctx.createLinearGradient(-8, 0, -27, 0);
  tg.addColorStop(0, 'rgba(160, 255, 110, 0.5)');
  tg.addColorStop(1, 'rgba(160, 255, 110, 0)');
  ctx.fillStyle = tg;
  ctx.beginPath();
  ctx.moveTo(-7, -3);
  ctx.lineTo(-27, 0);
  ctx.lineTo(-7, 3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // hover bike
  ctx.fillStyle = '#4e5b56';
  roundRect(ctx, -10, -4.2, 19, 8.4, 3.5);
  ctx.fill();
  ctx.strokeStyle = '#87978e';
  ctx.lineWidth = 0.9;
  ctx.stroke();
  // side pods
  ctx.fillStyle = '#6d7c74';
  roundRect(ctx, -9, -8, 10, 3.2, 1.6);
  ctx.fill();
  roundRect(ctx, -9, 4.8, 10, 3.2, 1.6);
  ctx.fill();
  // rider
  ctx.fillStyle = '#3a413d';
  ctx.beginPath();
  ctx.ellipse(1, 0, 4.4, 3.6, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#23282a';
  ctx.beginPath();
  ctx.arc(4, 0, 2.7, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#a8ff6c';
  ctx.shadowColor = 'rgba(160, 255, 100, 0.85)';
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.arc(5.4, 0, 1.15, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
  // fins
  ctx.strokeStyle = '#7f9188';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-8, -5);
  ctx.lineTo(-12 - flap, -7.5);
  ctx.moveTo(-8, 5);
  ctx.lineTo(-12 + flap, 7.5);
  ctx.stroke();
  // engine glows
  ctx.fillStyle = 'rgba(174, 255, 118, 0.85)';
  ctx.beginPath();
  ctx.arc(-9.5, -5, 1.3, 0, TAU);
  ctx.arc(-9.5, 5, 1.3, 0, TAU);
  ctx.fill();
}

function drawTankBody(ctx, e, time, slow) {
  const walk = Math.sin(time * 8 + (e.phase || 0)) * 1.1;
  // legs
  ctx.strokeStyle = '#5a3a2d';
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
  g.addColorStop(0, '#b7765b');
  g.addColorStop(0.5, '#8d5341');
  g.addColorStop(1, '#63392d');
  ctx.fillStyle = g;
  roundRect(ctx, -13, -9.5, 22, 19, 4.5);
  ctx.fill();
  ctx.strokeStyle = '#3f2119';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // shoulder plates
  ctx.fillStyle = '#a36950';
  roundRect(ctx, -6, -13, 10, 5, 2);
  ctx.fill();
  roundRect(ctx, -6, 8, 10, 5, 2);
  ctx.fill();
  // chest core
  ctx.fillStyle = '#40251d';
  roundRect(ctx, -3, -5.5, 10, 11, 2.5);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 122, 80, 0.85)';
  ctx.shadowColor = 'rgba(255, 90, 55, 0.9)';
  ctx.shadowBlur = 5;
  ctx.beginPath();
  ctx.arc(2, 0, 2.1, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
  // head
  ctx.fillStyle = '#a56a51';
  roundRect(ctx, 7.5, -5, 8, 10, 3);
  ctx.fill();
  ctx.strokeStyle = '#5a3427';
  ctx.stroke();
  ctx.fillStyle = '#ff5f47';
  ctx.beginPath();
  ctx.arc(12, -2.3, 1.2, 0, TAU);
  ctx.arc(12, 2.3, 1.2, 0, TAU);
  ctx.fill();
  // cannon
  ctx.fillStyle = '#54463c';
  roundRect(ctx, 11, -1, 12, 2, 0.9);
  ctx.fill();
}

function drawBossBody(ctx, e, time, slow) {
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
