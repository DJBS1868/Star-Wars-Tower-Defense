/* ============================================================
   Game data — towers, enemies, waves, planets
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

/* Hoth — a frozen trench line curling through drifts and ice ridges. */
const HOTH_PATH = [
  [-0.05, 0.30],
  [0.10, 0.30],
  [0.175, 0.60],
  [0.32, 0.72],
  [0.42, 0.40],
  [0.55, 0.29],
  [0.63, 0.64],
  [0.50, 0.855],
  [0.70, 0.885],
  [0.795, 0.58],
  [0.875, 0.31],
  [0.945, 0.545],
  [1.07, 0.60],
];

/* Mustafar — a mining route forced around lava channels and basalt spires. */
const MUSTAFAR_PATH = [
  [-0.05, 0.70],
  [0.10, 0.70],
  [0.16, 0.40],
  [0.30, 0.235],
  [0.405, 0.52],
  [0.30, 0.775],
  [0.455, 0.90],
  [0.615, 0.755],
  [0.575, 0.42],
  [0.715, 0.215],
  [0.845, 0.405],
  [0.765, 0.68],
  [0.885, 0.835],
  [1.07, 0.60],
];

/* Endor — a narrow forest trail that doubles back on itself. */
const ENDOR_PATH = [
  [-0.05, 0.78],
  [0.08, 0.78],
  [0.14, 0.50],
  [0.26, 0.30],
  [0.38, 0.46],
  [0.34, 0.70],
  [0.48, 0.86],
  [0.60, 0.62],
  [0.555, 0.32],
  [0.70, 0.16],
  [0.82, 0.32],
  [0.775, 0.62],
  [0.90, 0.78],
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

const HOTH_DECOR = [
  { type: 'rock', x: 0.055, y: 0.135, r: 0.032, seed: 11 },
  { type: 'ice', x: 0.145, y: 0.105, r: 0.030, seed: 23 },
  { type: 'snowdrift', x: 0.295, y: 0.115, r: 0.040, seed: 31 },
  { type: 'ice', x: 0.475, y: 0.115, r: 0.026, seed: 41 },
  { type: 'rock', x: 0.735, y: 0.095, r: 0.024, seed: 53 },
  { type: 'antenna', x: 0.935, y: 0.145, r: 0.030, seed: 61 },
  { type: 'crate', x: 0.875, y: 0.245, r: 0.014, seed: 67 },
  { type: 'snowdrift', x: 0.955, y: 0.895, r: 0.044, seed: 71 },
  { type: 'ice', x: 0.855, y: 0.955, r: 0.028, seed: 79 },
  { type: 'rock', x: 0.105, y: 0.925, r: 0.030, seed: 83 },
  { type: 'snowdrift', x: 0.305, y: 0.945, r: 0.036, seed: 89 },
  { type: 'crate', x: 0.655, y: 0.115, r: 0.015, seed: 97 },
  { type: 'ice', x: 0.635, y: 0.955, r: 0.024, seed: 101 },
  { type: 'antenna', x: 0.045, y: 0.545, r: 0.026, seed: 103 },
  { type: 'snowdrift', x: 0.495, y: 0.495, r: 0.024, seed: 107 },
  { type: 'ice', x: 0.245, y: 0.465, r: 0.018, seed: 109 },
];

const MUSTAFAR_DECOR = [
  { type: 'rock', x: 0.045, y: 0.115, r: 0.034, seed: 11 },
  { type: 'basalt', x: 0.155, y: 0.105, r: 0.028, seed: 19 },
  { type: 'lavapool', x: 0.615, y: 0.105, r: 0.038, seed: 29 },
  { type: 'pipe', x: 0.775, y: 0.105, r: 0.034, seed: 37 },
  { type: 'basalt', x: 0.925, y: 0.125, r: 0.030, seed: 41 },
  { type: 'lavapool', x: 0.955, y: 0.905, r: 0.036, seed: 47 },
  { type: 'rock', x: 0.075, y: 0.925, r: 0.030, seed: 53 },
  { type: 'pipe', x: 0.265, y: 0.925, r: 0.028, seed: 59 },
  { type: 'basalt', x: 0.655, y: 0.945, r: 0.026, seed: 67 },
  { type: 'crate', x: 0.355, y: 0.105, r: 0.014, seed: 71 },
  { type: 'crate', x: 0.405, y: 0.125, r: 0.012, seed: 73 },
  { type: 'pipe', x: 0.505, y: 0.495, r: 0.020, seed: 79 },
  { type: 'basalt', x: 0.925, y: 0.495, r: 0.020, seed: 83 },
  { type: 'lavapool', x: 0.245, y: 0.545, r: 0.022, seed: 89 },
  { type: 'rock', x: 0.66, y: 0.555, r: 0.016, seed: 97 },
];

const ENDOR_DECOR = [
  { type: 'tree', x: 0.045, y: 0.095, r: 0.062, seed: 11 },
  { type: 'tree', x: 0.155, y: 0.105, r: 0.050, seed: 17 },
  { type: 'fern', x: 0.255, y: 0.115, r: 0.020, seed: 19 },
  { type: 'tree', x: 0.465, y: 0.105, r: 0.058, seed: 23 },
  { type: 'tree', x: 0.585, y: 0.105, r: 0.046, seed: 29 },
  { type: 'fern', x: 0.665, y: 0.115, r: 0.018, seed: 31 },
  { type: 'tree', x: 0.775, y: 0.105, r: 0.052, seed: 37 },
  { type: 'bunker', x: 0.915, y: 0.145, r: 0.040, seed: 41 },
  { type: 'tree', x: 0.965, y: 0.925, r: 0.058, seed: 43 },
  { type: 'fern', x: 0.875, y: 0.955, r: 0.022, seed: 47 },
  { type: 'log', x: 0.075, y: 0.945, r: 0.036, seed: 53 },
  { type: 'tree', x: 0.215, y: 0.945, r: 0.048, seed: 59 },
  { type: 'fern', x: 0.335, y: 0.925, r: 0.020, seed: 61 },
  { type: 'tree', x: 0.655, y: 0.945, r: 0.044, seed: 67 },
  { type: 'fern', x: 0.745, y: 0.935, r: 0.018, seed: 71 },
  { type: 'fern', x: 0.045, y: 0.565, r: 0.020, seed: 73 },
  { type: 'tree', x: 0.235, y: 0.475, r: 0.040, seed: 79 },
  { type: 'fern', x: 0.725, y: 0.475, r: 0.018, seed: 83 },
  { type: 'log', x: 0.925, y: 0.585, r: 0.030, seed: 89 },
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

/* Every planet fields its own army. `body` selects the canvas silhouette,
   `palette` recolors it, and short/boss/heavy drive the UI and combat rules. */
export const ENEMY_TYPES = {
  /* —— Tatooine: Separatist droid army —— */
  droid: {
    name: 'B1 Battle Droid', short: 'B1', body: 'droid',
    hp: 1, speed: 67, radius: 11, reward: 1, leak: 1, armor: 0, gap: 0.7,
    color: '#c8a46a',
  },
  scout: {
    name: 'STAP Scout', short: 'STAP', body: 'stap',
    hp: 0.5, speed: 124, radius: 8.5, reward: 1, leak: 1, armor: 0, gap: 0.46,
    color: '#8a9a8e',
  },
  tank: {
    name: 'Super Battle Droid', short: 'B2', body: 'b2',
    hp: 4.4, speed: 43, radius: 15, reward: 2.4, leak: 2, armor: 2, gap: 1.15,
    heavy: true, color: '#9b5a44',
  },
  boss: {
    name: 'Droid Commander', short: 'CMD', body: 'droidboss', boss: true,
    hp: 16, speed: 32, radius: 27, reward: 22, leak: 8, armor: 4, gap: 1.4,
    color: '#7c5e4d',
  },

  /* —— Hoth: Imperial cold-weather assault —— */
  snowtrooper: {
    name: 'Snowtrooper', short: 'SNOW', body: 'snowtrooper',
    hp: 1.15, speed: 62, radius: 11, reward: 1.1, leak: 1, armor: 0, gap: 0.68,
    color: '#dce8ee',
  },
  probe: {
    name: 'Probe Droid', short: 'PROBE', body: 'probe', palette: 'probe',
    hp: 0.55, speed: 138, radius: 8.5, reward: 1.1, leak: 1, armor: 0, gap: 0.42,
    color: '#93b6c2',
  },
  atst: {
    name: 'AT-ST Walker', short: 'AT-ST', body: 'atst',
    hp: 5.2, speed: 40, radius: 16, reward: 2.8, leak: 2, armor: 3, gap: 1.2,
    heavy: true, color: '#9aa9ad',
  },
  atat: {
    name: 'AT-AT Walker', short: 'AT-AT', body: 'atat', boss: true,
    hp: 20, speed: 30, radius: 28, reward: 26, leak: 9, armor: 5, gap: 1.6,
    color: '#aebcc0',
  },

  /* —— Mustafar: Black Sun mining force —— */
  magma: {
    name: 'Magma Trooper', short: 'MAGMA', body: 'magmatrooper',
    hp: 1.25, speed: 58, radius: 11.5, reward: 1.2, leak: 1, armor: 1, gap: 0.72,
    color: '#b8563d',
  },
  skitter: {
    name: 'Lava Skitter', short: 'SKIT', body: 'skitter', palette: 'lava',
    hp: 0.5, speed: 132, radius: 8, reward: 1, leak: 1, armor: 0, gap: 0.38,
    color: '#ff8a3d',
  },
  miner: {
    name: 'Mining Droid', short: 'MINER', body: 'miningdroid',
    hp: 5.6, speed: 38, radius: 17, reward: 3, leak: 2, armor: 4, gap: 1.25,
    heavy: true, color: '#8a5a3a',
  },
  sith: {
    name: 'Sith Enforcer', short: 'SITH', body: 'sith', boss: true,
    hp: 24, speed: 34, radius: 25, reward: 28, leak: 10, armor: 4, gap: 1.5,
    color: '#d6403a',
  },

  /* —— Endor: Imperial forest garrison —— */
  stormtrooper: {
    name: 'Stormtrooper', short: 'STORM', body: 'stormtrooper',
    hp: 1.1, speed: 64, radius: 11, reward: 1.05, leak: 1, armor: 1, gap: 0.65,
    color: '#eef1ef',
  },
  biker: {
    name: 'Scout Trooper', short: 'BIKE', body: 'bikerscout',
    hp: 0.55, speed: 142, radius: 9, reward: 1.05, leak: 1, armor: 0, gap: 0.36,
    color: '#d9dee0',
  },
  commando: {
    name: 'Storm Commando', short: 'CMDO', body: 'commando',
    hp: 5.2, speed: 44, radius: 14, reward: 2.7, leak: 2, armor: 3, gap: 1.1,
    heavy: true, color: '#4c5157',
  },
  walkerboss: {
    name: 'AT-ST Commander', short: 'AT-ST', body: 'commandwalker', boss: true,
    hp: 22, speed: 31, radius: 24, reward: 26, leak: 9, armor: 5, gap: 1.5,
    color: '#8b969b',
  },
};

const BASE_HP = 14;
const HP_GROWTH = 1.166;

/* ---------------- planets ---------------- */

/* Each battlefield defines its own route, set dressing, army roster and
   wave pacing, so every planet plays differently. */
export const MAPS = {
  tatooine: {
    id: 'tatooine',
    planet: 'TATOOINE',
    site: 'OUTPOST RELAY',
    region: 'TATOOINE',
    kicker: 'REBEL ALLIANCE · OUTER RIM',
    desc: 'A remote Rebel signal station under attack. Hold the line and keep the transmission alive.',
    tag: 'TATOOINE',
    difficulty: 'STANDARD',
    theme: 'desert',
    waves: 25,
    startCredits: 500,
    startLives: 20,
    hpBase: BASE_HP,
    hpGrowth: HP_GROWTH,
    base: { x: 0.952, y: 0.60 },
    path: PATH_POINTS,
    decor: DECOR,
    roster: { line: 'droid', fast: 'scout', heavy: 'tank', boss: 'boss' },
    mix: { lineRate: 0.9, fastRate: 0.58, heavyStart: 6, heavyRate: 0.45, fastStart: 3 },
    flavor: { boss: 'Droid commander on the field', final: 'Final wave — hold the relay!' },
    endWin: 'The droid column is scrap. The relay is still broadcasting — and the Rebellion is still listening.',
    endLose: 'The droid army broke through the perimeter. The relay has gone dark.',
    chips: ['25 WAVES', 'TATOOINE', 'STANDARD'],
    accent: '#f4c14d',
  },
  hoth: {
    id: 'hoth',
    planet: 'HOTH',
    site: 'ECHO BASE',
    region: 'HOTH',
    kicker: 'REBEL ALLIANCE · HOTH SYSTEM',
    desc: 'Frozen trenches, howling wind, and Imperial walkers. Hold the ice until the transports are away.',
    tag: 'HOTH',
    difficulty: 'VETERAN',
    theme: 'ice',
    waves: 25,
    startCredits: 520,
    startLives: 18,
    hpBase: 15,
    hpGrowth: 1.174,
    base: { x: 0.952, y: 0.60 },
    path: HOTH_PATH,
    decor: HOTH_DECOR,
    roster: { line: 'snowtrooper', fast: 'probe', heavy: 'atst', boss: 'atat' },
    mix: { lineRate: 0.8, fastRate: 0.7, heavyStart: 5, heavyRate: 0.5, fastStart: 2 },
    flavor: { boss: 'AT-AT walker inbound — focus fire!', final: 'Final wave — the walkers are coming!' },
    endWin: 'The last walker is down in the snow. Echo Base holds, and the transports are clear.',
    endLose: 'The shield generator is gone. Imperial walkers overrun the frozen trenches.',
    chips: ['25 WAVES', 'HOTH', 'VETERAN'],
    accent: '#9bd8ec',
  },
  mustafar: {
    id: 'mustafar',
    planet: 'MUSTAFAR',
    site: 'LAVA REFINERY',
    region: 'MUSTAFAR',
    kicker: 'BLACK SUN · MUSTAFAR',
    desc: 'A captured mining refinery above the lava flows. Heavy armour and Sith enforcers guard the line.',
    tag: 'MUSTAFAR',
    difficulty: 'ELITE',
    theme: 'lava',
    waves: 25,
    startCredits: 560,
    startLives: 16,
    hpBase: 16,
    hpGrowth: 1.18,
    base: { x: 0.952, y: 0.60 },
    path: MUSTAFAR_PATH,
    decor: MUSTAFAR_DECOR,
    roster: { line: 'magma', fast: 'skitter', heavy: 'miner', boss: 'sith' },
    mix: { lineRate: 0.72, fastRate: 0.62, heavyStart: 5, heavyRate: 0.58, fastStart: 3 },
    flavor: { boss: 'Sith enforcer has entered the refinery', final: 'Final wave — the Sith comes for the relay!' },
    endWin: 'The refinery is quiet. Lava still flows, but the Sith enforcer is ash on the catwalk.',
    endLose: 'The Sith cut through the refinery. The relay is slag in the lava channels.',
    chips: ['25 WAVES', 'MUSTAFAR', 'ELITE'],
    accent: '#ff8a45',
  },
  endor: {
    id: 'endor',
    planet: 'ENDOR',
    site: 'SHIELD BUNKER',
    region: 'ENDOR',
    kicker: 'REBEL ALLIANCE · ENDOR',
    desc: 'Dense forest, narrow sightlines, and an Imperial bunker. Stop the garrison before it reaches the shield.',
    tag: 'ENDOR',
    difficulty: 'ELITE',
    theme: 'forest',
    waves: 25,
    startCredits: 540,
    startLives: 20,
    hpBase: 15,
    hpGrowth: 1.176,
    base: { x: 0.952, y: 0.60 },
    path: ENDOR_PATH,
    decor: ENDOR_DECOR,
    roster: { line: 'stormtrooper', fast: 'biker', heavy: 'commando', boss: 'walkerboss' },
    mix: { lineRate: 1.05, fastRate: 0.6, heavyStart: 7, heavyRate: 0.42, fastStart: 4 },
    flavor: { boss: 'AT-ST commander is stomping through the trees', final: 'Final wave — the whole garrison is coming!' },
    endWin: 'The bunker is sealed and the forest is quiet. The shield generator is safe.',
    endLose: 'The Imperial garrison overran the bunker. The shield generator is lost.',
    chips: ['25 WAVES', 'ENDOR', 'ELITE'],
    accent: '#9fd86a',
  },
};

export const MAP_ORDER = ['tatooine', 'hoth', 'mustafar', 'endor'];

export function getMap(id) {
  return MAPS[id] || MAPS.tatooine;
}

/* ---------------- waves ---------------- */

export function makeWave(wave, mapId = 'tatooine') {
  const map = getMap(mapId);
  const growth = Math.pow(map.hpGrowth, wave - 1);
  const mix = map.mix;
  const specs = [];
  let delay = 0.6;
  const push = (type, count, hpMul = 1, gapOverride = 0) => {
    const def = ENEMY_TYPES[type];
    const gap = gapOverride || def.gap;
    for (let i = 0; i < count; i++) {
      delay += gap;
      specs.push({
        type,
        hp: Math.round(map.hpBase * growth * def.hp * hpMul),
        speed: def.speed,
        delay,
      });
    }
    delay += 0.35;
  };

  const bossWave = wave % 10 === 0 || wave === map.waves;
  const isFinal = wave === map.waves;

  let lineCount = Math.round((6 + wave * 0.9) * mix.lineRate);
  let fastCount = wave >= mix.fastStart ? Math.max(1, Math.round((wave - 1) * mix.fastRate)) : 0;
  let heavyCount = wave >= mix.heavyStart ? Math.max(1, Math.floor((wave - mix.heavyStart + 1) * mix.heavyRate)) : 0;
  if (bossWave) {
    lineCount = Math.round(lineCount * 0.55);
    fastCount = Math.round(fastCount * 0.5);
    heavyCount = Math.max(1, Math.round(heavyCount * 0.5));
  }

  const roster = map.roster;

  // Opening skirmishers.
  const openingFast = fastCount ? Math.min(fastCount, Math.ceil(fastCount * 0.45)) : 0;
  if (openingFast) push(roster.fast, openingFast, 1, Math.max(0.28, ENEMY_TYPES[roster.fast].gap * 0.82));

  // Main line squads with short pauses between them.
  const squads = Math.max(1, Math.ceil(lineCount / 9));
  const perSquad = Math.ceil(lineCount / squads);
  for (let s = 0; s < squads; s++) {
    const count = Math.min(perSquad, lineCount - s * perSquad);
    if (count > 0) push(roster.line, count, 1);
    if (s < squads - 1) delay += 0.55;
  }

  // Heavy armour.
  if (heavyCount) {
    delay += 0.2;
    push(roster.heavy, heavyCount, 1, Math.max(0.8, ENEMY_TYPES[roster.heavy].gap * 0.86));
  }

  // Remaining fast units harass the back line.
  const restFast = fastCount - openingFast;
  if (restFast > 0) push(roster.fast, restFast, 1, Math.max(0.28, ENEMY_TYPES[roster.fast].gap * 0.8));

  if (bossWave) {
    const bossMul = isFinal ? 1.45 : 1;
    push(roster.boss, isFinal ? 2 : 1, bossMul, 1.6);
    if (isFinal) push(roster.heavy, 3, 1.3, 1.0);
  }

  return specs;
}

export function waveTotal(wave, mapId = 'tatooine') {
  return makeWave(wave, mapId).length;
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
