/* ============================================================
   Game data — towers, enemies, waves, map
   ============================================================ */

export const TOTAL_WAVES = 25;
export const START_CREDITS = 500;
export const START_LIVES = 20;

/* Map path control points in normalized map space (0..1). */
export const PATH_POINTS = [
  [-0.05, 0.64],
  [0.075, 0.64],
  [0.135, 0.35],
  [0.30, 0.265],
  [0.375, 0.585],
  [0.25, 0.80],
  [0.45, 0.885],
  [0.61, 0.725],
  [0.565, 0.36],
  [0.715, 0.19],
  [0.855, 0.335],
  [0.785, 0.645],
  [0.885, 0.775],
  [1.07, 0.60],
];

/* Static set dressing. Radii are normalized to the map's short edge. */
export const DECOR = [
  { type: 'rock', x: 0.045, y: 0.19, r: 0.030, seed: 11 },
  { type: 'rock', x: 0.205, y: 0.105, r: 0.020, seed: 23 },
  { type: 'rock', x: 0.425, y: 0.105, r: 0.026, seed: 31 },
  { type: 'rock', x: 0.665, y: 0.105, r: 0.018, seed: 47 },
  { type: 'rock', x: 0.935, y: 0.145, r: 0.027, seed: 53 },
  { type: 'rock', x: 0.955, y: 0.905, r: 0.033, seed: 67 },
  { type: 'rock', x: 0.055, y: 0.895, r: 0.026, seed: 73 },
  { type: 'rock', x: 0.33, y: 0.43, r: 0.012, seed: 89 },
  { type: 'rock', x: 0.69, y: 0.47, r: 0.015, seed: 97 },
  { type: 'rock', x: 0.52, y: 0.49, r: 0.011, seed: 101 },
  { type: 'rock', x: 0.755, y: 0.90, r: 0.020, seed: 113 },
  { type: 'bone', x: 0.705, y: 0.885, r: 0.030, seed: 131 },
  { type: 'bone', x: 0.325, y: 0.135, r: 0.024, seed: 137 },
  { type: 'vaporator', x: 0.155, y: 0.84, r: 0.020, seed: 149 },
  { type: 'vaporator', x: 0.515, y: 0.115, r: 0.020, seed: 151 },
  { type: 'vaporator', x: 0.945, y: 0.49, r: 0.018, seed: 157 },
  { type: 'hut', x: 0.06, y: 0.895, r: 0.040, seed: 163 },
  { type: 'hut', x: 0.475, y: 0.105, r: 0.034, seed: 167 },
  { type: 'hut', x: 0.905, y: 0.185, r: 0.036, seed: 173 },
  { type: 'hut', x: 0.585, y: 0.935, r: 0.033, seed: 179 },
  { type: 'crate', x: 0.855, y: 0.875, r: 0.016, seed: 181 },
  { type: 'crate', x: 0.915, y: 0.855, r: 0.014, seed: 191 },
  { type: 'cactus', x: 0.247, y: 0.105, r: 0.012, seed: 193 },
  { type: 'cactus', x: 0.795, y: 0.235, r: 0.011, seed: 197 },
  { type: 'cactus', x: 0.505, y: 0.64, r: 0.010, seed: 199 },
  { type: 'cactus', x: 0.375, y: 0.925, r: 0.010, seed: 211 },
];

/* ---------------- towers ---------------- */

const creditsCost = (base, mul) => Math.round((base * mul) / 5) * 5;

export const TOWERS = {
  scout: {
    cost: 90,
    name: 'Trooper Nest',
    short: 'Trooper',
    role: 'RAPID FIRE',
    desc: 'Two clone troopers and a repeating blaster. Cheap, quick, and dependable.',
    hotkey: '1',
    color: '#ffca68',
    icon: `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="30" r="12.5" fill="#2c3139" stroke="#66707c" stroke-width="1.8"/><circle cx="24" cy="29" r="8.6" fill="#3c434c"/><rect x="20.4" y="4" width="3.2" height="19" rx="1.6" fill="#aeb9c5"/><rect x="24.6" y="4" width="3.2" height="19" rx="1.6" fill="#848f9b"/><rect x="17.5" y="20" width="13" height="8" rx="3" fill="#4a525d"/><circle cx="24" cy="27" r="3.4" fill="#ffcf67"/><path d="M10 34h6M32 34h6" stroke="#8b949e" stroke-width="2" stroke-linecap="round"/></svg>`,
    range: [118, 126, 138, 152],
    damage: [3, 5, 7.5, 10.5],
    cooldown: [0.42, 0.37, 0.32, 0.27],
    projectileSpeed: 820,
    attack: 'bullet',
    upgradeCost: [80, 145, 250],
    upgradeNote: ['+2 damage · faster fire', '+2.5 damage · +range', '+3 damage · heavy blaster'],
  },
  ion: {
    cost: 170,
    name: 'Ion Cannon',
    short: 'Ion',
    role: 'SLOW FIELD',
    desc: 'Ion bursts scramble droid servos, slowing everything caught in the blast.',
    hotkey: '2',
    color: '#6fe1ff',
    icon: `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="30" r="11.5" fill="#223d4b" stroke="#4f8ea3" stroke-width="1.6"/><path d="M14 27a10 10 0 0 1 20 0" fill="none" stroke="#8fe8ff" stroke-width="2.2" stroke-linecap="round"/><path d="M18 25a6 6 0 0 1 12 0" fill="none" stroke="#55bfe0" stroke-width="1.8" stroke-linecap="round"/><rect x="22.6" y="9" width="2.8" height="12" rx="1.4" fill="#5c7b87"/><circle cx="24" cy="22.5" r="3.1" fill="#b6f4ff"/><path d="M24 27l-3.4 5.5M24 27l3.4 5.5" stroke="#68dcf7" stroke-width="1.5" stroke-linecap="round"/><circle cx="24" cy="33.5" r="2" fill="#d4fbff"/></svg>`,
    range: [132, 140, 150, 162],
    damage: [5, 8, 12, 18],
    cooldown: [1.3, 1.18, 1.06, 0.94],
    projectileSpeed: 600,
    attack: 'ion',
    slow: [0.45, 0.5, 0.55, 0.62],
    slowDuration: [1.7, 2.0, 2.4, 3.0],
    upgradeCost: [120, 195, 320],
    upgradeNote: ['stronger slow · +damage', 'longer slow field', 'heavy ion burst'],
  },
  rocket: {
    cost: 260,
    name: 'Rocket Pod',
    short: 'Rockets',
    role: 'SPLASH DAMAGE',
    desc: 'Dumb-fire concussion rockets. Excellent against tight droid columns.',
    hotkey: '3',
    color: '#ff9a58',
    icon: `<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="10" y="22" width="28" height="15" rx="4" fill="#2e2d31" stroke="#645d53" stroke-width="1.6"/><circle cx="17" cy="29.5" r="3.4" fill="#8f3d28"/><circle cx="24" cy="29.5" r="3.4" fill="#8f3d28"/><circle cx="31" cy="29.5" r="3.4" fill="#8f3d28"/><path d="M17 22V9.5l3.4-4 3.4 4V22M24 18V7" fill="none" stroke="#c0704e" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 22l-3-5M34 22l3-5" stroke="#8e877b" stroke-width="2" stroke-linecap="round"/><path d="M22 43c1-3 3-3 4 0" stroke="#ffb066" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
    range: [150, 158, 168, 180],
    damage: [16, 26, 40, 58],
    cooldown: [1.75, 1.6, 1.45, 1.3],
    projectileSpeed: 360,
    attack: 'rocket',
    splash: [44, 50, 57, 65],
    upgradeCost: [180, 295, 470],
    upgradeNote: ['+10 damage · bigger blast', 'faster reload · +range', 'heavy warheads'],
  },
  laser: {
    cost: 380,
    name: 'Laser Battery',
    short: 'Laser',
    role: 'PIERCING BEAM',
    desc: 'Focused tibanna laser. The beam punches through the front ranks.',
    hotkey: '4',
    color: '#ff7c6e',
    icon: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 6l7 11-7 22-7-22z" fill="#412b2a" stroke="#8d5650" stroke-width="1.4"/><path d="M24 11l3 7-3 13-3-13z" fill="#ff8174"/><circle cx="24" cy="18" r="2.4" fill="#ffe4d4"/><path d="M12 33h24M18 38h12" stroke="#6d6156" stroke-width="3" stroke-linecap="round"/><path d="M8 18h9M31 18h9" stroke="#ff6b5c" stroke-width="1.6" stroke-linecap="round" opacity=".6"/></svg>`,
    range: [172, 182, 194, 208],
    damage: [11, 17, 25, 36],
    cooldown: [0.7, 0.62, 0.54, 0.46],
    attack: 'laser',
    chain: [1, 1, 2, 2],
    upgradeCost: [260, 420, 650],
    upgradeNote: ['+6 beam damage', 'beam splits to 3 targets', 'overcharged crystal'],
  },
  jedi: {
    cost: 500,
    name: 'Jedi Sentinel',
    short: 'Jedi',
    role: 'AREA MELEE',
    desc: 'A Jedi guard spins a lightsaber through anything that gets too close.',
    hotkey: '5',
    color: '#63b8ff',
    icon: `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="26" r="12" fill="#1f2d3c" stroke="#426587" stroke-width="1.6"/><path d="M24 7c6 4 8 10 8 16 0 5-3 9-8 11-5-2-8-6-8-11 0-6 2-12 8-16z" fill="#273a4d" stroke="#5a8fbd" stroke-width="1.2"/><path d="M20 21h8" stroke="#9ddcff" stroke-width="2" stroke-linecap="round"/><path d="M11 16l8 8M37 16l-8 8" stroke="#7fd2ff" stroke-width="2.4" stroke-linecap="round"/><path d="M10 15l1.4-2.4M38 15l-1.4-2.4" stroke="#d7f3ff" stroke-width="2"/></svg>`,
    range: [86, 94, 102, 112],
    damage: [6, 9, 14, 21],
    cooldown: [0.38, 0.34, 0.30, 0.26],
    attack: 'aura',
    upgradeCost: [320, 510, 760],
    upgradeNote: ['faster saber sweep', '+damage · +radius', 'Jedi master reflexes'],
  },
  bounty: {
    cost: 700,
    name: 'Bounty Hunter',
    short: 'Bounty',
    role: 'LONG RANGE',
    desc: 'A hired marksman with a long rifle. Deals double damage to commanders.',
    hotkey: '6',
    color: '#d9a86b',
    icon: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 5c8 0 12 5 12 12v7c0 4-3 7-6 8l3 11H15l3-11c-3-1-6-4-6-8v-7C12 10 16 5 24 5z" fill="#6b5b49" stroke="#a8957c" stroke-width="1.5"/><path d="M14 18h20v5H14z" fill="#241f19"/><path d="M24 18v7" stroke="#d9b986" stroke-width="1.6"/><path d="M36 9l6 7M12 9L6 16" stroke="#8b7a63" stroke-width="1.6" stroke-linecap="round"/><circle cx="24" cy="11" r="2" fill="#d9b986"/><path d="M22 36h4v9h-4z" fill="#2f2820"/></svg>`,
    range: [260, 276, 294, 318],
    damage: [70, 115, 180, 280],
    cooldown: [2.4, 2.2, 2.0, 1.7],
    attack: 'sniper',
    bossBonus: 1.75,
    upgradeCost: [450, 690, 1020],
    upgradeNote: ['+45 damage · +range', 'faster shots · boss bonus', 'elite anti-armor rounds'],
  },
};

export const TOWER_ORDER = ['scout', 'ion', 'rocket', 'laser', 'jedi', 'bounty'];

export const TARGET_MODES = [
  { id: 'first', label: 'FIRST', desc: 'Closest to the relay' },
  { id: 'last', label: 'LAST', desc: 'Furthest back' },
  { id: 'strong', label: 'STRONG', desc: 'Most health' },
  { id: 'close', label: 'CLOSE', desc: 'Nearest to tower' },
];

export function towerLevel(type, level) {
  const t = TOWERS[type];
  const i = Math.max(0, Math.min(3, level - 1));
  return {
    ...t,
    level,
    maxLevel: 4,
    range: t.range[i],
    damage: t.damage[i],
    cooldown: t.cooldown[i],
    splash: t.splash ? t.splash[i] : 0,
    slow: t.slow ? t.slow[i] : 0,
    slowDuration: t.slowDuration ? t.slowDuration[i] : 0,
    chain: t.chain ? t.chain[i] : 1,
    upgrade: level < 4 ? t.upgradeCost[level - 1] : 0,
    nextLevel: level < 4 ? level + 1 : 0,
    note: level < 4 ? t.upgradeNote[level - 1] : '',
    dps: t.attack === 'aura'
      ? Math.round(t.damage[i] / t.cooldown[i])
      : t.attack === 'laser'
        ? Math.round((t.damage[i] * t.chain[i]) / t.cooldown[i])
        : Math.round(t.damage[i] / t.cooldown[i]),
  };
}

export function sellValue(tower) {
  const spent = tower.spent || TOWERS[tower.type].cost || 0;
  return Math.max(1, Math.floor(spent * 0.7));
}

/* ---------------- enemies ---------------- */

export const ENEMY_TYPES = {
  droid: {
    name: 'B1 Battle Droid',
    hp: 1,
    speed: 67,
    radius: 11,
    reward: 1,
    leak: 1,
    armor: 0,
    gap: 0.7,
    color: '#c8a46a',
  },
  scout: {
    name: 'STAP Scout',
    hp: 0.5,
    speed: 124,
    radius: 8.5,
    reward: 1,
    leak: 1,
    armor: 0,
    gap: 0.46,
    color: '#8a9a8e',
  },
  tank: {
    name: 'Super Battle Droid',
    hp: 4.4,
    speed: 43,
    radius: 15,
    reward: 2.4,
    leak: 2,
    armor: 2,
    gap: 1.15,
    color: '#9b5a44',
  },
  boss: {
    name: 'Droid Commander',
    hp: 16,
    speed: 32,
    radius: 27,
    reward: 22,
    leak: 8,
    armor: 4,
    gap: 1.4,
    color: '#7c5e4d',
  },
};

const BASE_HP = 14;
const HP_GROWTH = 1.166;

export function makeWave(wave) {
  const growth = Math.pow(HP_GROWTH, wave - 1);
  const specs = [];
  let delay = 0.6;
  const push = (type, count, hpMul = 1, gapOverride = 0) => {
    const def = ENEMY_TYPES[type];
    const gap = gapOverride || def.gap;
    for (let i = 0; i < count; i++) {
      delay += gap;
      specs.push({
        type,
        hp: Math.round(BASE_HP * growth * def.hp * hpMul),
        speed: def.speed,
        delay,
      });
    }
    delay += 0.35;
  };

  const bossWave = wave % 10 === 0 || wave === TOTAL_WAVES;
  const isFinal = wave === TOTAL_WAVES;

  let droidCount = Math.round(6 + wave * 0.9);
  let scoutCount = wave >= 3 ? Math.max(1, Math.round((wave - 1) * 0.58)) : 0;
  let tankCount = wave >= 6 ? Math.max(1, Math.floor((wave - 5) * 0.45)) : 0;
  if (bossWave) {
    droidCount = Math.round(droidCount * 0.55);
    scoutCount = Math.round(scoutCount * 0.5);
    tankCount = Math.max(1, Math.round(tankCount * 0.5));
  }

  // Opening skirmishers (scouts) on later waves.
  if (scoutCount) push('scout', Math.min(scoutCount, Math.ceil(scoutCount * 0.45)), 1, 0.38);

  // Battle droid blocks with small pauses between squads.
  const squads = Math.max(1, Math.ceil(droidCount / 9));
  const perSquad = Math.ceil(droidCount / squads);
  for (let s = 0; s < squads; s++) {
    const count = Math.min(perSquad, droidCount - s * perSquad);
    if (count > 0) push('droid', count, 1);
    if (s < squads - 1) delay += 0.55;
  }

  // Heavy units.
  if (tankCount) {
    const heavyDelay = delay;
    delay = heavyDelay + 0.2;
    push('tank', tankCount, 1, 0.9);
  }

  // Remaining fast scouts harass the back line.
  if (scoutCount) {
    const rest = scoutCount - Math.min(scoutCount, Math.ceil(scoutCount * 0.45));
    if (rest > 0) push('scout', rest, 1, 0.36);
  }

  if (bossWave) {
    const bossMul = isFinal ? 1.45 : 1;
    push('boss', isFinal ? 2 : 1, bossMul, 1.6);
    if (isFinal) push('tank', 4, 1.35, 1.0);
  }

  return specs;
}

export function waveTotal(wave) {
  return makeWave(wave).length;
}

export function waveReward(wave) {
  return 70 + wave * 10;
}

export function enemyReward(type, wave) {
  const def = ENEMY_TYPES[type];
  return Math.max(1, Math.round((1.6 + wave * 0.28) * def.reward));
}

export const TOWER_UNLOCK = { scout: 0, ion: 0, rocket: 0, laser: 0, jedi: 0, bounty: 0 };

/* small helpers */
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
export const dist2 = (ax, ay, bx, by) => (ax - bx) ** 2 + (ay - by) ** 2;

export { BASE_HP };
