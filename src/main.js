/* ============================================================
   UI wiring, drag & drop, input, loop
   ============================================================ */

import { TOWERS, TOWER_ORDER, TARGET_MODES, TOTAL_WAVES, waveReward, towerLevel, sellValue, makeWave, ENEMY_TYPES } from './data.js';
import { Game } from './game.js';
import { AudioEngine } from './audio.js';

const $ = (sel) => document.querySelector(sel);
const canvas = $('#game');
const stage = $('#stage');
const shop = $('#shop');
const towerList = $('#towerList');
const buildPanel = $('#buildPanel');
const inspectPanel = $('#inspectPanel');
const placeHint = $('#placeHint');
const dragGhost = $('#dragGhost');
const startScreen = $('#startScreen');
const homeScreen = $('#homeScreen');
const mapScreen = $('#mapScreen');
const hangarScreen = $('#hangarScreen');
const endScreen = $('#endScreen');
const pauseModal = $('#pauseModal');

const MAPS = {
  rebel: { id: 'rebel', planet: 'REBEL', site: 'OUTPOST RELAY' },
};
const menuScreens = { start: startScreen, home: homeScreen, map: mapScreen, hangar: hangarScreen };

const audio = new AudioEngine();
let game;
let selectedType = null;
let ghostVisible = false;
let activeCard = null;
let bestWave = Number(localStorage.getItem('to-best') || 0);
let selectedMap = MAPS.rebel;

const callbacks = {
  toast: (message, type) => toast(message, type),
  onWaveStart: () => syncUI(true),
  onWaveClear: () => syncUI(true),
  onBoss: () => syncUI(true),
  onEnd: (win) => finishRun(win),
};

game = new Game(canvas, audio, callbacks);
window.__game = game;

/* ---------------- helpers ---------------- */

const COIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l8.5 5v10L12 22l-8.5-5V7z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 7v10M9 9h6M9 15h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

function fmt(n) {
  return Math.round(n).toLocaleString('en-US');
}

function showMenuScreen(name) {
  for (const [key, screen] of Object.entries(menuScreens)) {
    screen.classList.toggle('hidden', key !== name);
  }
  endScreen.classList.add('hidden');
  pauseModal.classList.add('hidden');
  if (name === 'home') syncMenuLabels();
}

function hideMenuScreens() {
  for (const screen of Object.values(menuScreens)) screen.classList.add('hidden');
}

function syncMenuLabels() {
  const bestText = bestWave > 0 ? `WAVE ${bestWave}` : 'NO RUNS YET';
  const bestValue = bestWave > 0 ? String(bestWave) : '0';
  if ($('#hubBest')) $('#hubBest').textContent = bestValue;
  if ($('#hubMapLabel')) $('#hubMapLabel').textContent = `${selectedMap.planet} · ${selectedMap.site}`;
  document.querySelectorAll('.best-wave').forEach((el) => { el.textContent = bestValue; });
  const rank = Math.max(1, Math.min(12, 1 + Math.floor(bestWave / 3)));
  document.querySelectorAll('.rank-label').forEach((el) => { el.textContent = `LV ${rank} FIELD COMMANDER`; });
  document.querySelectorAll('.rank-fill').forEach((el) => { el.style.width = `${Math.min(100, 10 + bestWave * 3.4)}%`; });
  document.querySelectorAll('.best-run').forEach((el) => { el.textContent = bestText; });
}

function renderMenuRoster() {
  const preview = TOWER_ORDER.map(type => `<span class="hub-mini-icon">${TOWERS[type].icon}</span>`).join('');
  if ($('#hubTowerPreview')) $('#hubTowerPreview').innerHTML = preview;

  const stats = TOWER_ORDER.map((type) => {
    const def = TOWERS[type];
    return {
      type, def,
      power: def.damage[3],
      range: def.range[3],
      rate: 1 / def.cooldown[3],
    };
  });
  const max = {
    power: Math.max(...stats.map(s => s.power)),
    range: Math.max(...stats.map(s => s.range)),
    rate: Math.max(...stats.map(s => s.rate)),
  };
  const pct = (v, m) => Math.round(18 + (v / m) * 82);

  $('#hangarRoster').innerHTML = stats.map(({ def, power, range, rate }) => {
    const bar = (label, v, m) => `<span><em>${label}</em><i><b style="width:${pct(v, m)}%"></b></i></span>`;
    return `<article class="hangar-card" style="--accent:${def.color}">
      <span class="hangar-card-glow" aria-hidden="true"></span>
      <span class="hangar-watermark" aria-hidden="true">${def.icon}</span>
      <div class="hangar-card-top">
        <span class="hangar-card-icon">${def.icon}</span>
        <div class="hangar-card-id">
          <span class="hangar-role">${def.role}</span>
          <b>${def.name}</b>
          <small>${def.cost} CR TO DEPLOY · KEY ${def.hotkey}</small>
        </div>
        <span class="hangar-tier">TIER 1–4</span>
      </div>
      <p>${def.desc}</p>
      <div class="hangar-meters">
        ${bar('DMG', power, max.power)}
        ${bar('RNG', range, max.range)}
        ${bar('RATE', rate, max.rate)}
      </div>
      <div class="hangar-pips">
        <i class="on"></i><i></i><i></i><i></i>
        <span>FIELD UPGRADES</span>
      </div>
    </article>`;
  }).join('');
}

function setSelectedMap(map) {
  selectedMap = map || MAPS.rebel;
  $('.map-name').innerHTML = `<span class="dot"></span>${selectedMap.planet} · ${selectedMap.site}`;
  syncMenuLabels();
}

function pointToMap(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  const px = clientX - r.left;
  const py = clientY - r.top;
  return {
    px, py,
    nx: px / Math.max(1, r.width),
    ny: py / Math.max(1, r.height),
    inside: px >= 0 && py >= 0 && px <= r.width && py <= r.height,
  };
}

let toastTimer = 0;
function toast(message, type = '') {
  const wrap = $('#toasts');
  const key = message + type;
  const now = performance.now();
  const existing = [...wrap.children].find(el => el.dataset.key === key);
  if (existing && now - toastTimer < 500) return;
  toastTimer = now;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.dataset.key = key;
  el.textContent = message;
  wrap.appendChild(el);
  while (wrap.children.length > 3) wrap.removeChild(wrap.firstChild);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 320);
  }, 2600);
}

function buildCards() {
  for (const type of TOWER_ORDER) {
    const def = TOWERS[type];
    const card = document.createElement('button');
    card.className = 'tower-card';
    card.dataset.type = type;
    card.setAttribute('role', 'listitem');
    card.setAttribute('aria-label', `${def.name}, ${def.cost} credits`);
    card.title = `${def.name} — ${def.cost} credits\n${def.desc}\nDrag onto the map or tap, then tap the sand.`;
    card.innerHTML = `
      <span class="hotkey">${def.hotkey}</span>
      <span class="tower-icon">${def.icon}</span>
      <span class="tower-name">${def.short}</span>
      <span class="cost">${COIN}${def.cost}</span>
    `;
    card.addEventListener('pointerdown', (e) => onCardDown(e, type, card));
    towerList.appendChild(card);
  }
}

function setArmed(type) {
  for (const el of towerList.children) el.classList.toggle('armed', el.dataset.type === type);
  activeCard = type ? [...towerList.children].find(el => el.dataset.type === type) : null;
  placeHint.classList.toggle('hidden', !type);
}

function cancelPlacement(silent = false) {
  if (!game.pendingType && !selectedType) return;
  game.setPending(null);
  game.setPreview(null);
  selectedType = null;
  setArmed(null);
  dragGhost.classList.add('hidden');
  ghostVisible = false;
  if (!silent) audio.ui();
}

/* ---------------- drag & drop ---------------- */

let drag = null;

function onCardDown(e, type, card) {
  if (e.button !== undefined && e.button !== 0) return;
  if (!game.started) return;
  if (game.phase === 'victory' || game.phase === 'defeat') return;
  e.preventDefault();
  audio.ensure();
  const def = TOWERS[type];
  if (game.credits < def.cost) {
    audio.error();
    toast(`Need ${def.cost - game.credits} more credits for ${def.short}`, 'bad');
    return;
  }
  drag = {
    type,
    card,
    startX: e.clientX,
    startY: e.clientY,
    moved: false,
    pointerId: e.pointerId,
    captured: false,
  };
  try {
    card.setPointerCapture(e.pointerId);
    drag.captured = true;
  } catch {}
}

window.addEventListener('pointermove', (e) => {
  if (!drag) return;
  if (!drag.moved) {
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (Math.hypot(dx, dy) < 7) return;
    drag.moved = true;
    audio.ensure();
    // close inspector + arm the tower
    closeInspector(true);
    if (selectedType) cancelPlacement(true);
    selectedType = drag.type;
    game.setPending(drag.type);
    setArmed(drag.type);
    drag.card.classList.add('dragging');
    dragGhost.innerHTML = `
      <span class="tower-icon">${TOWERS[drag.type].icon}</span>
      <span class="ghost-name">${TOWERS[drag.type].short}</span>
      <span class="ghost-cost">${COIN}${TOWERS[drag.type].cost}</span>`;
    dragGhost.classList.remove('hidden');
    dragGhost.classList.remove('bad');
    ghostVisible = true;
    audio.ui();
  }
  if (!drag.moved) return;
  dragGhost.style.left = `${e.clientX}px`;
  dragGhost.style.top = `${e.clientY}px`;
  const pos = pointToMap(e.clientX, e.clientY);
  if (pos.inside) {
    game.setPreview(pos.nx, pos.ny);
    const valid = game.preview?.valid ?? false;
    dragGhost.classList.toggle('bad', !valid);
    placeHint.classList.add('hidden');
  } else {
    game.setPreview(null);
    dragGhost.classList.remove('bad');
  }
});

window.addEventListener('pointerup', (e) => {
  if (!drag) return;
  const d = drag;
  drag = null;
  try { if (d.captured && d.card.hasPointerCapture(d.pointerId)) d.card.releasePointerCapture(d.pointerId); } catch {}
  d.card.classList.remove('dragging');
  dragGhost.classList.add('hidden');
  ghostVisible = false;

  if (!d.moved) {
    // tap on the card → arm placement for the next map tap
    if (selectedType === d.type) {
      cancelPlacement();
    } else {
      closeInspector(true);
      game.setPending(d.type);
      selectedType = d.type;
      setArmed(d.type);
      audio.ui();
      toast(`Tap the sand to deploy ${TOWERS[d.type].short}`);
    }
    return;
  }

  const pos = pointToMap(e.clientX, e.clientY);
  let placed = false;
  let reason = '';
  if (pos.inside) {
    const res = game.placeTower(d.type, pos.nx, pos.ny);
    placed = res.ok;
    reason = res.reason;
  }
  game.setPending(null);
  game.setPreview(null);
  selectedType = null;
  setArmed(null);
  if (placed) {
    toast(`${TOWERS[d.type].name} deployed`, 'good');
  } else if (pos.inside && reason) {
    audio.error();
    toast(reason, 'bad');
  }
  syncUI(true);
});

window.addEventListener('pointercancel', () => {
  if (!drag) return;
  const card = drag.card;
  drag = null;
  card.classList.remove('dragging');
  dragGhost.classList.add('hidden');
  game.setPending(null);
  game.setPreview(null);
  selectedType = null;
  setArmed(null);
});

/* ---------------- map input ---------------- */

canvas.addEventListener('contextmenu', (e) => e.preventDefault());

canvas.addEventListener('pointerdown', (e) => {
  if (!game.started) return;
  if (game.phase === 'victory' || game.phase === 'defeat') return;
  if (e.button !== undefined && e.button !== 0) return;
  audio.ensure();
  const pos = pointToMap(e.clientX, e.clientY);
  if (!pos.inside) return;

  if (game.pendingType) {
    e.preventDefault();
    const type = game.pendingType;
    const res = game.placeTower(type, pos.nx, pos.ny);
    if (res.ok) {
      game.setPending(null);
      game.setPreview(null);
      selectedType = null;
      setArmed(null);
      toast(`${TOWERS[type].name} deployed`, 'good');
    } else {
      audio.error();
      toast(res.reason || 'Cannot build there', 'bad');
    }
    syncUI(true);
    return;
  }

  const tower = game.towerAt(pos.px, pos.py);
  if (tower) {
    selectTower(tower);
    audio.ui();
  } else {
    closeInspector();
    game.selectTower(null);
  }
});

canvas.addEventListener('pointermove', (e) => {
  if (!game.pendingType) return;
  const pos = pointToMap(e.clientX, e.clientY);
  if (pos.inside) game.setPreview(pos.nx, pos.ny);
  else game.setPreview(null);
});

canvas.addEventListener('pointerleave', () => {
  if (game.pendingType) game.setPreview(null);
});

/* ---------------- inspector ---------------- */

function selectTower(tower, quiet = false) {
  if (!tower) return;
  game.selectTower(tower);
  selectedType = null;
  setArmed(null);
  game.setPreview(null);
  buildPanel.classList.add('hidden');
  inspectPanel.classList.remove('hidden');
  refreshInspector();
  if (!quiet) audio.ui();
}

function closeInspector(quiet = false) {
  if (inspectPanel.classList.contains('hidden') && !game.selected) return;
  inspectPanel.classList.add('hidden');
  buildPanel.classList.remove('hidden');
  game.selectTower(null);
  if (!quiet) audio.ui();
}

function refreshInspector() {
  const t = game.selected;
  if (!t) { closeInspector(true); return; }
  const def = TOWERS[t.type];
  const lv = towerLevel(t.type, t.level);
  $('#inspectIcon').innerHTML = def.icon;
  $('#inspectName').textContent = def.name;
  $('#inspectLevel').textContent = `LEVEL ${t.level} / 4  ·  ${def.role}`;
  $('#inspectDesc').textContent = def.desc;
  $('#statDamage').textContent = lv.damage % 1 === 0 ? lv.damage : lv.damage.toFixed(1);
  $('#statRange').textContent = Math.round(lv.range);
  $('#statRate').textContent = `${(1 / lv.cooldown).toFixed(1)}/s`;
  const mode = TARGET_MODES.find(m => m.id === t.mode) || TARGET_MODES[0];
  $('#targetMode').textContent = mode.label;
  $('#targetBtn').title = `Priority: ${mode.desc}. Tap to change.`;
  const up = $('#upgradeBtn');
  if (lv.nextLevel) {
    up.classList.remove('maxed');
    up.classList.toggle('disabled', game.credits < lv.upgrade);
    up.querySelector('.up-label').textContent = `UPGRADE TO LEVEL ${lv.nextLevel}`;
    up.querySelector('.up-cost').innerHTML = `${COIN}<b id="upgradeCost">${fmt(lv.upgrade)}</b>`;
    $('#upgradeDelta').textContent = lv.note;
    up.title = `Upgrade for ${lv.upgrade} credits: ${lv.note}`;
  } else {
    up.classList.add('maxed');
    up.classList.remove('disabled');
    up.querySelector('.up-label').textContent = 'ELITE TIER REACHED';
    up.querySelector('.up-cost').innerHTML = '<b>MAX</b>';
    $('#upgradeDelta').textContent = 'This tower is fully upgraded';
    up.title = 'Fully upgraded';
  }
  $('#sellValue').textContent = fmt(sellValue(t));
}

function syncInspectorAffordability() {
  const t = game.selected;
  if (!t) return;
  const lv = towerLevel(t.type, t.level);
  if (lv.nextLevel) {
    $('#upgradeBtn').classList.toggle('disabled', game.credits < lv.upgrade);
  }
}

$('#inspectClose').addEventListener('click', () => closeInspector());
$('#targetBtn').addEventListener('click', () => {
  game.cycleTarget();
  refreshInspector();
});
$('#upgradeBtn').addEventListener('click', () => {
  if (game.phase === 'victory' || game.phase === 'defeat') return;
  const res = game.upgradeSelected();
  if (res.ok) {
    toast(`Upgraded to level ${game.selected.level}`, 'good');
    refreshInspector();
    syncUI(true);
  } else {
    audio.error();
    toast(res.reason || 'Cannot upgrade', 'bad');
  }
});
$('#sellBtn').addEventListener('click', () => {
  if (game.phase === 'victory' || game.phase === 'defeat') return;
  const t = game.selected;
  if (!t) return;
  const name = TOWERS[t.type].name;
  const res = game.sellSelected();
  if (res.ok) {
    toast(`${name} sold for ${res.value} credits`, 'good');
    closeInspector(true);
    syncUI(true);
  }
});

/* ---------------- HUD / wave ---------------- */

let lastHud = { credits: -1, lives: -1, wave: -1, started: false };
let lastIntelKey = '';

function syncIntel(h) {
  const key = `${game.started}:${h.wave}:${h.phase}`;
  if (key === lastIntelKey) return;
  lastIntelKey = key;
  const body = $('#intelBody');
  const threat = $('#intelThreat');
  const title = $('#intelTitle');
  if (!body) return;
  if (!game.started) {
    body.innerHTML = '<span class="intel-tip">Deploy the outpost to see droid movements.</span>';
    threat.textContent = 'STANDBY';
    threat.className = 'threat';
    return;
  }
  if (h.phase === 'victory' || h.phase === 'defeat') {
    body.innerHTML = '<span class="intel-tip">Mission concluded. Redeploy for another run.</span>';
    threat.textContent = h.phase === 'victory' ? 'SECURED' : 'OFFLINE';
    threat.className = 'threat';
    return;
  }
  title.textContent = h.phase === 'wave' ? 'WAVE INTEL' : 'NEXT WAVE INTEL';
  const specs = makeWave(h.wave);
  const counts = {};
  for (const s of specs) counts[s.type] = (counts[s.type] || 0) + 1;
  const order = ['droid', 'scout', 'tank', 'boss'];
  const labels = { droid: 'B1', scout: 'STAP', tank: 'B2', boss: 'CMD' };
  body.innerHTML = order
    .filter(t => counts[t])
    .map(t => `<span class="intel-chip"><i class="enemy-dot ${t === 'boss' ? 'boss' : ''}" style="--dotc:${ENEMY_TYPES[t].color}"></i><b>${counts[t]}</b>${labels[t]}</span>`)
    .join('');
  let level = 'LOW';
  if (h.wave > 18 || h.wave % 10 === 0) level = 'EXTREME';
  else if (h.wave > 11) level = 'HIGH';
  else if (h.wave > 4) level = 'MODERATE';
  threat.textContent = `${level} THREAT`;
  threat.className = `threat ${level === 'MODERATE' ? 'moderate' : level === 'HIGH' ? 'high' : level === 'EXTREME' ? 'extreme' : ''}`;
}

function syncUI(force = false) {
  if (!game) return;
  const h = game.hud();

  const creditsEl = $('#credits');
  const livesEl = $('#lives');
  if (force || h.credits !== lastHud.credits) {
    creditsEl.textContent = fmt(h.credits);
    lastHud.credits = h.credits;
  }
  if (force || h.lives !== lastHud.lives) {
    livesEl.textContent = h.lives;
    livesEl.parentElement.classList.toggle('low', h.lives <= 5);
    if (h.lives < lastHud.lives && game.started) {
      livesEl.parentElement.classList.remove('bump');
      void livesEl.parentElement.offsetWidth;
      livesEl.parentElement.classList.add('bump');
    }
    lastHud.lives = h.lives;
  }

  const waveEl = $('#waveTag');
  const cap = h.endless ? '&infin;' : TOTAL_WAVES;
  waveEl.innerHTML = `WAVE ${h.wave} <i>/ ${cap}</i>`;
  $('#waveSub').textContent = h.phase === 'wave' ? `${h.alive + h.queue} hostile${h.alive + h.queue === 1 ? '' : 's'}` : h.phase === 'build' ? (h.wave > 1 ? 'Build phase' : 'Prepare defenses') : h.phase === 'victory' ? 'Relay held' : 'Relay lost';
  $('#waveProgress').style.width = `${(h.phase === 'wave' ? h.progress : 0) * 100}%`;

  const statusEl = $('#waveStatus');
  const remaining = h.alive + h.queue;
  statusEl.classList.toggle('active', h.phase === 'wave');
  statusEl.classList.toggle('danger', h.phase === 'defeat' || (h.lives <= 5 && h.phase === 'wave'));
  if (!game.started) {
    statusEl.innerHTML = '<span class="status-dot"></span>Deploy to begin';
  } else if (h.phase === 'wave') {
    statusEl.innerHTML = `<span class="status-dot"></span>Wave ${h.wave} — ${remaining} hostile${remaining === 1 ? '' : 's'} left`;
  } else if (h.phase === 'victory') {
    statusEl.innerHTML = '<span class="status-dot"></span>Outpost secured';
  } else if (h.phase === 'defeat') {
    statusEl.innerHTML = '<span class="status-dot"></span>Relay destroyed';
  } else if (h.lives <= 5) {
    statusEl.innerHTML = `<span class="status-dot"></span>Relay critical — ${h.lives} integrity`;
  } else {
    statusEl.innerHTML = `<span class="status-dot"></span>Wave ${h.wave} ready — ${game.towers.length ? 'send when ready' : 'place your towers'}`;
  }

  const send = $('#nextWaveBtn');
  const canSend = game.started && h.phase === 'build';
  send.disabled = !canSend;
  send.classList.toggle('in-wave', game.started && (h.phase === 'wave' || h.phase === 'victory' || h.phase === 'defeat'));
  if (!game.started) {
    $('#sendLabel').textContent = 'Deploy Outpost';
    $('#sendSub').textContent = 'Place towers, hold the relay';
  } else if (h.phase === 'build') {
    $('#sendLabel').textContent = `Send Wave ${h.wave}`;
    $('#sendSub').textContent = `Clear bonus +${waveReward(h.wave)} credits`;
  } else if (h.phase === 'wave') {
    $('#sendLabel').textContent = `Wave ${h.wave} in progress`;
    $('#sendSub').textContent = `${remaining} hostile${remaining === 1 ? '' : 's'} remaining`;
  } else if (h.phase === 'victory') {
    $('#sendLabel').textContent = 'Outpost secured';
    $('#sendSub').textContent = 'The relay is safe';
  } else {
    $('#sendLabel').textContent = 'Relay destroyed';
    $('#sendSub').textContent = 'Redeploy to try again';
  }

  // affordability
  for (const el of towerList.children) {
    const def = TOWERS[el.dataset.type];
    el.classList.toggle('poor', game.started && (h.phase === 'build' || h.phase === 'wave') && h.credits < def.cost);
    el.disabled = !game.started || h.phase === 'victory' || h.phase === 'defeat';
  }
  syncInspectorAffordability();

  syncIntel(h);

  // boss bar
  const bossBar = $('#bossBar');
  if (h.boss) {
    bossBar.classList.remove('hidden');
    $('#bossName').textContent = h.boss.name;
    $('#bossHp').textContent = `${Math.round(h.boss.pct * 100)}%`;
    $('#bossFill').style.width = `${h.boss.pct * 100}%`;
  } else {
    bossBar.classList.add('hidden');
  }

  // toggles
  $('#btnSpeed').textContent = `${game.speed}×`;
  $('#btnSpeed').classList.toggle('on', game.speed > 1);
  $('#btnPause').classList.toggle('paused', game.paused);
  document.body.classList.toggle('muted', audio.muted);
  document.querySelectorAll('.sound-toggle').forEach((el) => {
    const label = el.querySelector('.sound-state');
    if (label) label.textContent = audio.muted ? 'OFF' : 'ON';
    else el.textContent = `SOUND: ${audio.muted ? 'OFF' : 'ON'}`;
  });
  $('#btnMute').setAttribute('aria-label', audio.muted ? 'Unmute sound' : 'Mute sound');

  placeHint.classList.toggle('hidden', !game.pendingType || game.paused || !game.started);

  if (game.selected) {
    if (!inspectPanel.classList.contains('hidden')) {
      // avoid stomping the upgrade button while the user might be tapping it
      $('#sellValue').textContent = fmt(sellValue(game.selected));
    }
  } else if (!inspectPanel.classList.contains('hidden')) {
    closeInspector(true);
  }
  lastHud.started = game.started;
}

$('#btnSpeed').addEventListener('click', () => {
  if (!game.started) return;
  const speeds = [1, 2, 3];
  const i = speeds.indexOf(game.speed);
  game.setSpeed(speeds[(i + 1) % speeds.length]);
  audio.ui();
  syncUI(true);
});

$('#btnMute').addEventListener('click', () => {
  audio.ensure();
  audio.setMuted(!audio.muted);
  if (!audio.muted) audio.ui();
  syncUI(true);
});

function toggleSound() {
  audio.ensure();
  audio.setMuted(!audio.muted);
  if (!audio.muted) audio.ui();
  syncUI(true);
}
document.querySelectorAll('.sound-toggle').forEach((btn) => btn.addEventListener('click', toggleSound));

$('#btnPause').addEventListener('click', () => setPaused(!game.paused));
$('#resumeBtn').addEventListener('click', () => setPaused(false));
$('#restartBtn').addEventListener('click', () => restartRun());
function setPaused(paused) {
  if (!game.started) return;
  if (game.phase === 'victory' || game.phase === 'defeat') return;
  game.paused = paused;
  pauseModal.classList.toggle('hidden', !paused);
  if (paused) {
    cancelPlacement(true);
    closeInspector(true);
    audio.ui();
  } else {
    audio.ui();
  }
  syncUI(true);
}

function restartRun() {
  runFinished = false;
  pauseModal.classList.add('hidden');
  endScreen.classList.add('hidden');
  hideMenuScreens();
  game.reset();
  game.started = true;
  game.paused = false;
  game.speed = 1;
  selectedType = null;
  drag = null;
  closeInspector(true);
  setArmed(null);
  dragGhost.classList.add('hidden');
  placeHint.classList.add('hidden');
  syncUI(true);
  audio.ensure();
  toast('Wave 1 ready — drag a tower from the hangar', 'good');
}

function quitToMap() {
  runFinished = false;
  pauseModal.classList.add('hidden');
  endScreen.classList.add('hidden');
  cancelPlacement(true);
  closeInspector(true);
  game.reset();
  game.started = false;
  game.paused = false;
  selectedType = null;
  drag = null;
  setArmed(null);
  dragGhost.classList.add('hidden');
  placeHint.classList.add('hidden');
  showMenuScreen('map');
  syncUI(true);
}

$('#nextWaveBtn').addEventListener('click', () => {
  if (!game.started) return;
  if (game.phase !== 'build' || game.waveActive) return;
  cancelPlacement(true);
  const started = game.startWave();
  if (started) {
    audio.ui();
    toast(`Wave ${game.waveNumber} incoming`, 'bad');
    syncUI(true);
  }
});

$('#cancelPlace').addEventListener('click', () => cancelPlacement());

/* ---------------- start / end screens ---------------- */

let runFinished = false;

function startGame(auto = false) {
  audio.ensure();
  hideMenuScreens();
  endScreen.classList.add('hidden');
  pauseModal.classList.add('hidden');
  runFinished = false;
  lastIntelKey = '';
  game.reset();
  game.started = false;
  game.begin();
  game.paused = false;
  selectedType = null;
  drag = null;
  closeInspector(true);
  setArmed(null);
  dragGhost.classList.add('hidden');
  placeHint.classList.add('hidden');
  setSelectedMap(selectedMap);
  syncUI(true);
  if (!auto) {
    audio.ui();
    toast(`Wave 1 ready — defend ${selectedMap.site.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}`, 'good');
  }
  towerList.classList.add('intro-pulse');
  setTimeout(() => towerList.classList.remove('intro-pulse'), 2400);
}

function launchSelectedMap(map) {
  if (map) setSelectedMap(map);
  startGame(false);
}

$('#playBtn').addEventListener('click', () => {
  audio.ensure();
  audio.ui();
  showMenuScreen('home');
});
$('#hubBackBtn').addEventListener('click', () => { audio.ui(); showMenuScreen('start'); });
$('#chooseMapBtn').addEventListener('click', () => { audio.ui(); showMenuScreen('map'); });
$('#mapBackBtn').addEventListener('click', () => { audio.ui(); showMenuScreen('home'); });
$('#upgradesBtn').addEventListener('click', () => { audio.ui(); showMenuScreen('hangar'); });
$('#hangarBackBtn').addEventListener('click', () => { audio.ui(); showMenuScreen('home'); });
$('#hangarMapBtn').addEventListener('click', () => { audio.ui(); showMenuScreen('map'); });

/* extra command-deck navigation */
$('#startMapBtn')?.addEventListener('click', () => { audio.ensure(); audio.ui(); showMenuScreen('map'); });
$('#startHangarBtn')?.addEventListener('click', () => { audio.ensure(); audio.ui(); showMenuScreen('hangar'); });
$('#dockMapBtn')?.addEventListener('click', () => { audio.ui(); showMenuScreen('map'); });
$('#dockHangarBtn')?.addEventListener('click', () => { audio.ui(); showMenuScreen('hangar'); });
$('#mapDockPlayBtn')?.addEventListener('click', () => { audio.ensure(); audio.ui(); launchSelectedMap(selectedMap); });
$('#mapDockHomeBtn')?.addEventListener('click', () => { audio.ui(); showMenuScreen('home'); });
$('#mapDockHangarBtn')?.addEventListener('click', () => { audio.ui(); showMenuScreen('hangar'); });
$('#hangarDockMapBtn')?.addEventListener('click', () => { audio.ui(); showMenuScreen('map'); });
$('#hangarDockHomeBtn')?.addEventListener('click', () => { audio.ui(); showMenuScreen('home'); });

for (const tile of document.querySelectorAll('.map-tile-available[data-map]')) {
  tile.addEventListener('click', () => {
    const map = MAPS[tile.dataset.map];
    if (!map) return;
    audio.ensure();
    audio.ui();
    launchSelectedMap(map);
  });
}

$('#quitMapBtn').addEventListener('click', () => {
  audio.ui();
  quitToMap();
});
$('#endMapBtn').addEventListener('click', () => {
  audio.ui();
  quitToMap();
});

function updateBest(held) {
  if (held > bestWave) {
    bestWave = held;
    localStorage.setItem('to-best', String(held));
  }
  const label = bestWave > 0 ? `BEST RUN · WAVE ${bestWave}` : 'NO RUNS YET';
  $('#bestRun').textContent = label;
  $('#endBest').textContent = bestWave > 0 ? `PERSONAL BEST · WAVE ${bestWave}` : '';
  syncMenuLabels();
}

function finishRun(win) {
  if (runFinished) return;
  runFinished = true;
  const held = win ? (game.endless ? game.waveNumber - 1 : TOTAL_WAVES) : Math.max(0, game.waveNumber - 1);
  updateBest(held);
  game.paused = false;
  pauseModal.classList.add('hidden');
  cancelPlacement(true);
  closeInspector(true);

  const title = win ? 'RELAY HELD' : 'RELAY LOST';
  const wrap = endScreen.querySelector('.end-wrap');
  wrap.classList.toggle('defeat', !win);
  $('#endTitle').textContent = title;
  $('#endEyebrow').innerHTML = `<span></span>${win ? 'MISSION COMPLETE' : 'MISSION REPORT'}<span></span>`;
  $('#endText').textContent = win
    ? 'The droid column is scrap. The relay is still broadcasting — and the Rebellion is still listening.'
    : 'The droid army broke through the perimeter. The relay has gone dark.';
  $('#endWaves').textContent = fmt(held);
  $('#endKills').textContent = fmt(game.kills);
  $('#endCredits').textContent = fmt(game.creditsEarned);
  $('#endlessBtn').classList.toggle('hidden', !win);
  $('#againBtn').querySelector('span').textContent = win ? 'PLAY AGAIN' : 'REDEPLOY';
  setTimeout(() => {
    if (game.phase === 'victory' || game.phase === 'defeat') {
      endScreen.classList.remove('hidden');
      if (win) audio.victory();
    }
  }, 550);
}

$('#againBtn').addEventListener('click', () => restartRun());
$('#endlessBtn').addEventListener('click', () => {
  runFinished = false;
  audio.ensure();
  endScreen.classList.add('hidden');
  game.continueEndless();
  game.paused = false;
  pauseModal.classList.add('hidden');
  syncUI(true);
  toast('Endless mode — good luck', 'good');
});

/* ---------------- keyboard ---------------- */

window.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  if (!game.started && e.key === 'Escape') {
    if (!mapScreen.classList.contains('hidden') || !hangarScreen.classList.contains('hidden')) { showMenuScreen('home'); return; }
    if (!homeScreen.classList.contains('hidden')) { showMenuScreen('start'); return; }
    return;
  }
  if (e.key === 'Escape') {
    if (game.paused) { setPaused(false); return; }
    if (game.pendingType) { cancelPlacement(); return; }
    if (game.selected) { closeInspector(); return; }
    return;
  }
  if (!game.started) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!startScreen.classList.contains('hidden')) {
        audio.ensure(); audio.ui(); showMenuScreen('home');
      } else if (!homeScreen.classList.contains('hidden')) {
        audio.ui(); showMenuScreen('map');
      } else if (!mapScreen.classList.contains('hidden')) {
        audio.ensure(); audio.ui(); launchSelectedMap(selectedMap);
      } else if (!hangarScreen.classList.contains('hidden')) {
        audio.ui(); showMenuScreen('home');
      }
    }
    return;
  }
  if (e.key === 'p' || e.key === 'P') { setPaused(!game.paused); return; }
  if (e.key === 'm' || e.key === 'M') {
    audio.ensure(); audio.setMuted(!audio.muted); syncUI(true); return;
  }
  const idx = Number(e.key);
  if (idx >= 1 && idx <= TOWER_ORDER.length) {
    const type = TOWER_ORDER[idx - 1];
    if (game.credits < TOWERS[type].cost) {
      audio.error();
      toast(`Need ${TOWERS[type].cost - game.credits} more credits for ${TOWERS[type].short}`, 'bad');
      return;
    }
    cancelPlacement(true);
    closeInspector(true);
    game.setPending(type);
    selectedType = type;
    setArmed(type);
    audio.ui();
    toast(`Tap the sand to deploy ${TOWERS[type].short}`);
    return;
  }
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    if (game.phase === 'build') {
      cancelPlacement(true);
      game.startWave();
      syncUI(true);
    }
  }
});

/* ---------------- lifecycle ---------------- */

const ro = new ResizeObserver(() => {
  const r = stage.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (r.width > 0 && r.height > 0) {
    game.resize(Math.round(r.width), Math.round(r.height), dpr);
  }
});
ro.observe(stage);

window.addEventListener('resize', () => {
  const r = stage.getBoundingClientRect();
  game.resize(Math.round(r.width), Math.round(r.height), Math.min(window.devicePixelRatio || 1, 2));
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && game.started && !game.paused && game.phase !== 'victory' && game.phase !== 'defeat') {
    setPaused(true);
  }
});

let last = performance.now();
function loop(now) {
  const dt = (now - last) / 1000;
  last = now;
  game.update(dt);
  game.render();
  requestAnimationFrame(loop);
}

buildCards();
renderMenuRoster();
updateBest(0);
applyMuteClass();
syncUI(true);

function applyMuteClass() {
  document.body.classList.toggle('muted', audio.muted);
}

setInterval(() => syncUI(), 120);

if (new URLSearchParams(location.search).get('play') === '1') {
  setTimeout(() => startGame(true), 200);
}

requestAnimationFrame(loop);


// Prevent pinch zoom / double-tap zoom on iOS Safari.
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('dblclick', (e) => e.preventDefault());
