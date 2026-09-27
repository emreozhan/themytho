/**
 * Everything you hear is synthesised in the browser with the Web Audio API:
 * a breathing sea, a plucked lyre tuned to the Dorian mode, wind, thunder, the
 * Sirens. Silent until the reader turns it on (autoplay rules and courtesy).
 */
import type { AudioApi } from '../story/types';

type Ctx = AudioContext;

const DORIAN = [293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33, 659.25, 698.46];

export class Sound implements AudioApi {
  private ctx: Ctx | null = null;
  private master: GainNode | null = null;
  private sea: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private plucks = new Map<number, AudioBuffer>();
  enabled = false;

  get available(): boolean {
    return typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window);
  }

  private init(): Ctx | null {
    if (this.ctx) return this.ctx;
    if (!this.available) return null;
    const AC = (window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
    const ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 3;
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(comp).connect(ctx.destination);
    this.ctx = ctx;
    this.master = master;
    // Two seconds of brown noise, looped wherever noise is needed.
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.5;
    }
    this.noise = buf;
    this.startSea();
    return ctx;
  }

  private startSea(): void {
    const ctx = this.ctx!, noise = this.noise!;
    const out = ctx.createGain();
    out.gain.value = 0.32;
    out.connect(this.master!);
    this.sea = out;
    for (const [rate, freq, pan] of [[0.085, 420, -0.4], [0.061, 620, 0.45]] as const) {
      const src = ctx.createBufferSource();
      src.buffer = noise;
      src.loop = true;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = 0.35;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = rate;
      const depth = ctx.createGain();
      depth.gain.value = 0.3;
      lfo.connect(depth).connect(g.gain);
      const p = ctx.createStereoPanner();
      p.pan.value = pan;
      src.connect(lp).connect(g).connect(p).connect(out);
      src.start();
      lfo.start();
    }
  }

  toggle(): boolean {
    this.enabled = !this.enabled;
    const ctx = this.init();
    if (!ctx || !this.master) return (this.enabled = false);
    if (ctx.state === 'suspended') void ctx.resume();
    const now = ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(this.enabled ? 0.9 : 0, now, 0.4);
    if (this.enabled) this.chord([0, 2, 4, 7], 0.12);
    return this.enabled;
  }

  /** Raise or calm the sea bed (storms, the underworld's hush). */
  seaLevel(v: number): void {
    if (!this.ctx || !this.sea) return;
    this.sea.gain.setTargetAtTime(0.32 * v, this.ctx.currentTime, 0.8);
  }

  /** Karplus–Strong plucked string, cached per frequency. */
  private pluckBuffer(freq: number, seconds = 2.6): AudioBuffer {
    const key = Math.round(freq * 10);
    const hit = this.plucks.get(key);
    if (hit) return hit;
    const ctx = this.ctx!;
    const sr = ctx.sampleRate;
    const len = Math.floor(sr * seconds);
    const buf = ctx.createBuffer(1, len, sr);
    const out = buf.getChannelData(0);
    const period = Math.max(2, Math.round(sr / freq));
    const ring = new Float32Array(period);
    for (let i = 0; i < period; i++) ring[i] = Math.random() * 2 - 1;
    let idx = 0;
    for (let i = 0; i < len; i++) {
      const next = (idx + 1) % period;
      const v = 0.4985 * (ring[idx] + ring[next]);
      out[i] = ring[idx];
      ring[idx] = v;
      idx = next;
    }
    this.plucks.set(key, buf);
    return buf;
  }

  private pluck(freq: number, when: number, gain = 0.28, pan = 0): void {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.pluckBuffer(freq);
    const g = ctx.createGain();
    g.gain.value = gain;
    const p = ctx.createStereoPanner();
    p.pan.value = pan;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 3200;
    src.connect(lp).connect(g).connect(p).connect(this.master!);
    src.start(when);
  }

  /** Arpeggiate scale degrees of the Dorian lyre. */
  chord(degrees: number[], gap = 0.1, gain = 0.26): void {
    if (!this.ctx || !this.enabled) return;
    const t0 = this.ctx.currentTime + 0.02;
    degrees.forEach((d, i) => this.pluck(DORIAN[Math.max(0, Math.min(DORIAN.length - 1, d))], t0 + i * gap, gain, (i / degrees.length - 0.5) * 0.8));
  }

  private noiseBurst(opts: { type: BiquadFilterType; freq: number; to?: number; q?: number; gain: number; attack: number; hold?: number; release: number; pan?: number }): void {
    const ctx = this.ctx!;
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = opts.type;
    f.frequency.setValueAtTime(opts.freq, now);
    if (opts.to) f.frequency.exponentialRampToValueAtTime(opts.to, now + opts.attack + (opts.hold ?? 0) + opts.release);
    f.Q.value = opts.q ?? 1;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(opts.gain, now + opts.attack);
    g.gain.setValueAtTime(opts.gain, now + opts.attack + (opts.hold ?? 0));
    g.gain.exponentialRampToValueAtTime(0.0001, now + opts.attack + (opts.hold ?? 0) + opts.release);
    const p = ctx.createStereoPanner();
    p.pan.value = opts.pan ?? 0;
    src.connect(f).connect(g).connect(p).connect(this.master!);
    src.start(now, Math.random());
    src.stop(now + opts.attack + (opts.hold ?? 0) + opts.release + 0.1);
  }

  private tone(freq: number, opts: { type?: OscillatorType; gain: number; attack: number; release: number; to?: number; vibrato?: number; delay?: number; pan?: number }): void {
    const ctx = this.ctx!;
    const now = ctx.currentTime + (opts.delay ?? 0);
    const o = ctx.createOscillator();
    o.type = opts.type ?? 'sine';
    o.frequency.setValueAtTime(freq, now);
    if (opts.to) o.frequency.exponentialRampToValueAtTime(opts.to, now + opts.attack + opts.release);
    if (opts.vibrato) {
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 5.2;
      const d = ctx.createGain();
      d.gain.value = opts.vibrato;
      lfo.connect(d).connect(o.frequency);
      lfo.start(now);
      lfo.stop(now + opts.attack + opts.release + 0.1);
    }
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(opts.gain, now + opts.attack);
    g.gain.exponentialRampToValueAtTime(0.0001, now + opts.attack + opts.release);
    const p = ctx.createStereoPanner();
    p.pan.value = opts.pan ?? 0;
    o.connect(g).connect(p).connect(this.master!);
    o.start(now);
    o.stop(now + opts.attack + opts.release + 0.1);
  }

  sfx(name: string): void {
    if (!this.ctx || !this.enabled) return;
    switch (name) {
      case 'arrive':
        this.chord([0, 2, 4, 7], 0.11);
        break;
      case 'depart':
        this.chord([4, 2, 0], 0.16, 0.2);
        this.noiseBurst({ type: 'lowpass', freq: 600, gain: 0.2, attack: 0.8, hold: 0.6, release: 1.6 });
        break;
      case 'storm':
      case 'wind':
        this.noiseBurst({ type: 'bandpass', freq: 300, to: 1400, q: 2.5, gain: 0.55, attack: 0.9, hold: 0.8, release: 2.2, pan: -0.3 });
        this.noiseBurst({ type: 'bandpass', freq: 900, to: 260, q: 3, gain: 0.35, attack: 1.2, hold: 0.5, release: 2, pan: 0.4 });
        break;
      case 'thunder':
        this.noiseBurst({ type: 'highpass', freq: 1800, gain: 0.5, attack: 0.005, release: 0.25 });
        this.noiseBurst({ type: 'lowpass', freq: 220, to: 60, gain: 1, attack: 0.03, hold: 0.3, release: 3.2 });
        break;
      case 'splash':
        this.noiseBurst({ type: 'bandpass', freq: 1400, to: 400, q: 0.8, gain: 0.4, attack: 0.01, release: 0.9 });
        break;
      case 'boulder':
      case 'thud':
        this.tone(70, { gain: 0.8, attack: 0.005, release: 0.7, to: 38 });
        this.noiseBurst({ type: 'lowpass', freq: 500, gain: 0.4, attack: 0.005, release: 0.5 });
        break;
      case 'fire':
        for (let i = 0; i < 8; i++) this.noiseBurst({ type: 'highpass', freq: 2500 + Math.random() * 2000, gain: 0.08 + Math.random() * 0.1, attack: 0.003 + i * 0.09, release: 0.06 });
        this.noiseBurst({ type: 'lowpass', freq: 380, gain: 0.3, attack: 0.3, hold: 0.8, release: 1 });
        break;
      case 'magic':
        [0, 4, 7, 9].forEach((d, i) => this.tone(DORIAN[d] * 2, { type: 'triangle', gain: 0.12, attack: 0.01, release: 1.4, delay: i * 0.09, pan: i % 2 ? 0.4 : -0.4 }));
        break;
      case 'sirens':
        this.tone(DORIAN[4], { type: 'sine', gain: 0.16, attack: 1.2, release: 4, to: DORIAN[2], vibrato: 7, pan: -0.5 });
        this.tone(DORIAN[6], { type: 'triangle', gain: 0.08, attack: 1.6, release: 4.2, to: DORIAN[4], vibrato: 9, delay: 0.4, pan: 0.5 });
        this.tone(DORIAN[8], { type: 'sine', gain: 0.07, attack: 2, release: 3.4, to: DORIAN[7], vibrato: 6, delay: 1.1 });
        break;
      case 'bow':
        this.pluck(110, this.ctx.currentTime, 0.6);
        this.noiseBurst({ type: 'bandpass', freq: 4000, to: 900, q: 1.4, gain: 0.25, attack: 0.02, release: 0.5 });
        break;
      case 'twang':
        this.pluck(98, this.ctx.currentTime, 0.5);
        break;
      case 'ghost':
        this.tone(220, { type: 'sine', gain: 0.1, attack: 1.4, release: 2.4, to: 196, vibrato: 3 });
        this.noiseBurst({ type: 'bandpass', freq: 2200, to: 800, q: 6, gain: 0.08, attack: 1.2, release: 2 });
        break;
      case 'whirl':
        this.noiseBurst({ type: 'lowpass', freq: 140, to: 420, q: 4, gain: 0.7, attack: 1, hold: 1.5, release: 2 });
        break;
      case 'bleat':
        this.tone(430, { type: 'sawtooth', gain: 0.05, attack: 0.05, release: 0.6, vibrato: 30, to: 380 });
        break;
      case 'moo':
        this.tone(120, { type: 'sawtooth', gain: 0.07, attack: 0.2, release: 1.4, to: 95, vibrato: 3 });
        break;
      case 'bark':
        this.tone(320, { type: 'square', gain: 0.05, attack: 0.01, release: 0.18, to: 200 });
        break;
      case 'success':
        this.chord([4, 6, 7, 9], 0.08, 0.22);
        break;
      case 'fail':
        this.chord([3, 1], 0.14, 0.2);
        break;
      default:
        this.chord([0, 4], 0.1, 0.18);
    }
  }
}
