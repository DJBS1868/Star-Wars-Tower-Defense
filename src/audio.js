/* Tiny procedural sound engine — no audio assets required. */

const clampGain = v => Math.max(0, Math.min(1, v));

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicBus = null;
    this.effectsBus = null;
    this.muted = localStorage.getItem('to-muted') === '1';
    this.musicVolume = this.loadVolume('to-music-volume', 0.7);
    this.effectsVolume = this.loadVolume('to-sfx-volume', 1);
    this.last = {};
    this.ambience = null;
    this.noiseBuffer = null;
  }

  loadVolume(key, fallback) {
    const stored = Number(localStorage.getItem(key));
    return Number.isFinite(stored) && localStorage.getItem(key) !== null
      ? clampGain(stored)
      : fallback;
  }

  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      return this.ctx;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.72;
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = this.musicVolume;
      this.effectsBus = this.ctx.createGain();
      this.effectsBus.gain.value = this.effectsVolume;
      this.musicBus.connect(this.master);
      this.effectsBus.connect(this.master);
      this.master.connect(this.ctx.destination);
      this.noiseBuffer = this.makeNoise();
      this.startAmbience();
    } catch { this.ctx = null; }
    return this.ctx;
  }

  makeNoise() {
    const len = this.ctx.sampleRate * 1.2;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = 0.96 * last + 0.04 * white;
      data[i] = white * 0.7 + last * 0.6;
    }
    return buf;
  }

  startAmbience() {
    if (!this.ctx || this.ambience) return;
    try {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      src.loop = true;
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 340;
      lp.Q.value = 0.4;
      const g = this.ctx.createGain();
      g.gain.value = 0.011;
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 0.07;
      lfoGain.gain.value = 0.005;
      lfo.connect(lfoGain).connect(g.gain);
      src.connect(lp).connect(g).connect(this.musicBus);
      src.start();
      lfo.start();
      this.ambience = { src, g, lfo };
    } catch {}
  }

  setMuted(muted) {
    this.muted = muted;
    localStorage.setItem('to-muted', muted ? '1' : '0');
    if (this.master && this.ctx) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.linearRampToValueAtTime(muted ? 0 : 0.72, this.ctx.currentTime + 0.08);
    }
  }

  setVolume(category, value) {
    const volume = clampGain(Number(value));
    const isMusic = category === 'music';
    const key = isMusic ? 'to-music-volume' : 'to-sfx-volume';
    const bus = isMusic ? this.musicBus : this.effectsBus;
    if (isMusic) this.musicVolume = volume;
    else this.effectsVolume = volume;
    localStorage.setItem(key, String(volume));
    if (bus && this.ctx) {
      bus.gain.cancelScheduledValues(this.ctx.currentTime);
      bus.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.06);
    }
  }

  throttle(key, ms = 40) {
    const now = performance.now();
    if (this.last[key] && now - this.last[key] < ms) return false;
    this.last[key] = now;
    return true;
  }

  tone(opts) {
    if (!this.ctx || this.muted) return;
    const {
      freq = 440, endFreq = null, type = 'sine', dur = 0.12,
      gain = 0.06, delay = 0, attack = 0.006, filter = null, detune = 0,
    } = opts;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), t0 + dur);
    osc.detune.value = detune;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(clampGain(gain), t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    let node = osc;
    if (filter) {
      const f = this.ctx.createBiquadFilter();
      f.type = filter.type || 'lowpass';
      f.frequency.value = filter.freq || 1200;
      f.Q.value = filter.q || 0.8;
      node.connect(f);
      node = f;
    }
    node.connect(g).connect(this.effectsBus);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  noise(opts = {}) {
    if (!this.ctx || this.muted || !this.noiseBuffer) return;
    const { dur = 0.2, gain = 0.08, freq = 900, q = 0.8, type = 'lowpass', delay = 0 } = opts;
    const t0 = this.ctx.currentTime + delay;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t0);
    f.frequency.exponentialRampToValueAtTime(Math.max(80, freq * 0.32), t0 + dur);
    f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(this.effectsBus);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
  }

  ui() {
    if (!this.ensure() || !this.throttle('ui', 30)) return;
    this.tone({ freq: 660, endFreq: 880, type: 'triangle', dur: 0.055, gain: 0.028 });
  }

  shot(kind) {
    if (!this.ensure() || !this.throttle('shot' + kind, 34)) return;
    if (kind === 'scout') {
      this.tone({ freq: 1130, endFreq: 280, type: 'square', dur: 0.085, gain: 0.038 });
      this.tone({ freq: 190, endFreq: 90, type: 'sine', dur: 0.06, gain: 0.02 });
    } else if (kind === 'ion') {
      this.tone({ freq: 260, endFreq: 940, type: 'sine', dur: 0.24, gain: 0.05 });
      this.tone({ freq: 520, endFreq: 1500, type: 'triangle', dur: 0.18, gain: 0.025, delay: 0.02 });
    } else if (kind === 'rocket') {
      this.noise({ dur: 0.36, gain: 0.075, freq: 800, q: 0.7 });
      this.tone({ freq: 120, endFreq: 45, type: 'sawtooth', dur: 0.26, gain: 0.035 });
    } else if (kind === 'laser') {
      this.tone({ freq: 1450, endFreq: 220, type: 'sawtooth', dur: 0.13, gain: 0.038, filter: { type: 'lowpass', freq: 2600 } });
    } else if (kind === 'sniper') {
      this.noise({ dur: 0.16, gain: 0.1, freq: 2400, q: 1.6, type: 'bandpass' });
      this.tone({ freq: 150, endFreq: 42, type: 'sine', dur: 0.28, gain: 0.09 });
    } else if (kind === 'jedi') {
      this.tone({ freq: 160, endFreq: 120, type: 'sawtooth', dur: 0.28, gain: 0.028, filter: { type: 'lowpass', freq: 600 } });
      this.tone({ freq: 740, endFreq: 480, type: 'sine', dur: 0.16, gain: 0.026 });
    }
  }

  explosion(big = false) {
    if (!this.ensure() || !this.throttle('boom', big ? 60 : 24)) return;
    this.noise({ dur: big ? 0.6 : 0.26, gain: big ? 0.12 : 0.06, freq: big ? 700 : 1100, q: 0.5 });
    this.tone({ freq: big ? 95 : 140, endFreq: 32, type: 'sine', dur: big ? 0.55 : 0.24, gain: big ? 0.09 : 0.04 });
  }

  place() {
    if (!this.ensure()) return;
    [330, 495, 660].forEach((f, i) => this.tone({ freq: f, endFreq: f * 1.02, type: 'triangle', dur: 0.11, gain: 0.035, delay: i * 0.055 }));
    this.noise({ dur: 0.14, gain: 0.03, freq: 600 });
  }

  error() {
    if (!this.ensure()) return;
    this.tone({ freq: 150, endFreq: 110, type: 'square', dur: 0.13, gain: 0.045 });
    this.tone({ freq: 120, endFreq: 85, type: 'square', dur: 0.13, gain: 0.03, delay: 0.09 });
  }

  upgrade() {
    if (!this.ensure()) return;
    [392, 523, 659, 784].forEach((f, i) => this.tone({ freq: f, type: 'triangle', dur: 0.18, gain: 0.035, delay: i * 0.06 }));
  }

  sell() {
    if (!this.ensure()) return;
    [740, 620, 460].forEach((f, i) => this.tone({ freq: f, endFreq: f * 0.7, type: 'triangle', dur: 0.12, gain: 0.03, delay: i * 0.05 }));
  }

  waveStart() {
    if (!this.ensure()) return;
    this.tone({ freq: 98, endFreq: 196, type: 'sawtooth', dur: 0.7, gain: 0.05, filter: { type: 'lowpass', freq: 900 } });
    this.tone({ freq: 392, endFreq: 587, type: 'triangle', dur: 0.5, gain: 0.04, delay: 0.12 });
    this.noise({ dur: 0.7, gain: 0.025, freq: 400 });
  }

  waveClear() {
    if (!this.ensure()) return;
    [523, 659, 784, 1046].forEach((f, i) => this.tone({ freq: f, type: 'triangle', dur: 0.3, gain: 0.035, delay: i * 0.08 }));
  }

  leak() {
    if (!this.ensure()) return;
    this.tone({ freq: 220, endFreq: 55, type: 'sawtooth', dur: 0.5, gain: 0.08, filter: { type: 'lowpass', freq: 800 } });
    this.noise({ dur: 0.3, gain: 0.07, freq: 300 });
  }

  bossWarn() {
    if (!this.ensure()) return;
    this.tone({ freq: 64, endFreq: 64, type: 'sawtooth', dur: 1.2, gain: 0.06, filter: { type: 'lowpass', freq: 240 } });
    this.tone({ freq: 68, endFreq: 68, type: 'sawtooth', dur: 1.2, gain: 0.05, delay: 0.18, detune: -14 });
    this.noise({ dur: 1.1, gain: 0.035, freq: 180, delay: 0.1 });
  }

  kill(big = false) {
    if (!this.ensure() || !this.throttle('kill', 55)) return;
    this.noise({ dur: big ? 0.32 : 0.13, gain: big ? 0.08 : 0.032, freq: big ? 900 : 1600, type: 'bandpass', q: 1.1 });
    if (big) this.explosion(true);
  }

  victory() {
    if (!this.ensure()) return;
    const notes = [523, 659, 784, 1046, 1318, 1568];
    notes.forEach((f, i) => this.tone({ freq: f, type: 'triangle', dur: 0.5, gain: 0.04, delay: i * 0.12 }));
    [261, 392, 523].forEach((f, i) => this.tone({ freq: f, type: 'sine', dur: 1.4, gain: 0.05, delay: i * 0.05 }));
  }

  defeat() {
    if (!this.ensure()) return;
    [392, 349, 311, 262, 196].forEach((f, i) => this.tone({ freq: f, endFreq: f * 0.94, type: 'triangle', dur: 0.5, gain: 0.045, delay: i * 0.16 }));
    this.noise({ dur: 1.4, gain: 0.05, freq: 300 });
  }
}
