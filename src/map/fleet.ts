/**
 * Ships on the atlas. Vessels keep a comfortable on-screen size whatever the
 * zoom, ride a gentle swell, and sail in loose formation along route legs.
 */
import { s } from '../lib/dom';
import { gsap } from '../lib/motion';
import { clamp, type Vec } from '../lib/geometry';
import { RED_FIGURE, raft, ship, wreck, type ShipPalette } from '../art/ship';
import type { VesselKind } from '../story/types';

const PHAEACIAN: ShipPalette = { ...RED_FIGURE, hull: '#efe2c6', sail: '#fff8e6', detail: '#2a2230', cheek: '#b8c7d6', eye: '#2a2230' };

interface Vessel {
  g: SVGGElement;
  body: SVGGElement;
  x: number;
  y: number;
  heading: number;
  alive: boolean;
  phase: number;
}

export class Fleet {
  readonly layer: SVGGElement;
  private vessels: Vessel[] = [];
  private kind: VesselKind = 'fleet';
  private scale = 1;
  private minScale = 1;
  private time = 0;
  private formation: Vec[] = [];
  private voyage: gsap.core.Tween | null = null;

  constructor(parent: SVGGElement, count: number) {
    this.layer = s('g', { class: 'fleet' });
    parent.appendChild(this.layer);
    for (let i = 0; i < count; i++) this.vessels.push(this.makeVessel(i));
    this.setKind('fleet');
  }

  private makeVessel(i: number): Vessel {
    const g = s('g', { class: 'vessel' });
    const body = s('g', { class: 'vessel__body' });
    g.appendChild(body);
    this.layer.appendChild(g);
    return { g, body, x: 0, y: 0, heading: 0, alive: true, phase: i * 1.7 };
  }

  get alive(): number {
    return this.vessels.filter((v) => v.alive).length;
  }

  /** How the survivors look: galleys, a raft, a wreck, the Phaeacian ship. */
  setKind(kind: VesselKind): void {
    this.kind = kind;
    this.vessels.forEach((v, i) => {
      while (v.body.firstChild) v.body.removeChild(v.body.firstChild);
      if (kind === 'raft') v.body.appendChild(raft());
      else if (kind === 'wreck') v.body.appendChild(wreck());
      else if (kind === 'phaeacian') v.body.appendChild(ship({ palette: PHAEACIAN, icon: true }).g);
      else v.body.appendChild(ship({ palette: RED_FIGURE, icon: true, oars: 6 }).g);
      v.g.classList.toggle('is-lead', i === 0);
    });
    this.vessels.forEach((v, i) => (v.g.style.display = this.visible(v, i) ? '' : 'none'));
  }

  /** Vessel 0 is Odysseus himself: on a raft, a wreck or a borrowed ship he sails on alone. */
  private visible(v: Vessel, i: number): boolean {
    if (this.kind === 'fleet') return v.alive;
    if (i !== 0) return false;
    return this.kind === 'ship' ? v.alive : true;
  }

  /** Show exactly `n` ships (instantly). */
  setCount(n: number): void {
    this.vessels.forEach((v, i) => {
      v.alive = i < n;
      gsap.set(v.g, { opacity: 1 });
      v.g.style.display = this.visible(v, i) ? '' : 'none';
    });
  }

  onCamera(scale: number, minScale: number): void {
    this.scale = scale;
    this.minScale = minScale;
  }

  /** Screen length of a ship icon, in px. */
  private iconPx(): number {
    const zl = this.scale / this.minScale;
    return clamp(24 + 11 * Math.log2(Math.max(1, zl)), 24, 54);
  }

  private ensureFormation(): void {
    const px = this.iconPx();
    this.formation = this.vessels.map((_, i) => {
      if (i === 0) return [0, 0];
      const row = Math.floor((i - 1) / 3) + 1;
      const col = ((i - 1) % 3) - 1;
      return [-row * px * 0.62, col * px * 0.42 + (row % 2) * px * 0.12];
    });
  }

  /** Place the living ships in formation around `at`, facing `heading` degrees. */
  anchor(at: Vec, heading?: number): void {
    this.ensureFormation();
    const h = heading ?? this.vessels[0].heading;
    const rad = (h * Math.PI) / 180;
    this.vessels.forEach((v, i) => {
      const [fx, fy] = this.formation[i];
      const k = 1 / this.scale;
      v.x = at[0] + (fx * Math.cos(rad) - fy * Math.sin(rad)) * k;
      v.y = at[1] + (fx * Math.sin(rad) + fy * Math.cos(rad)) * k;
      v.heading = h;
    });
    this.update(0);
  }

  get lead(): Vec {
    return [this.vessels[0].x, this.vessels[0].y];
  }

  /**
   * Sail along `path`. `onProgress(p)` receives the lead's progress 0..1 so the
   * route line can be drawn in step.
   */
  sail(path: SVGPathElement, duration: number, onProgress: (p: number) => void, ease = 'sail'): Promise<void> {
    const L = path.getTotalLength();
    this.ensureFormation();
    const lagUnit = (this.iconPx() * 0.7) / this.scale;
    const lateral = this.formation.map(([, fy]) => fy / this.scale);
    const lags = this.formation.map(([fx]) => (-fx / this.iconPx() / 0.62) * lagUnit);
    const maxLag = Math.max(0, ...lags.filter((_, i) => this.visible(this.vessels[i], i)));
    const state = { d: 0 };
    const total = L + maxLag * 0.6;
    const at = (d: number): Vec => {
      const p = path.getPointAtLength(clamp(d, 0, L));
      return [p.x, p.y];
    };
    this.voyage?.kill();
    return new Promise((resolve) => {
      this.voyage = gsap.to(state, {
        d: total,
        duration,
        ease,
        onUpdate: () => {
          onProgress(clamp(state.d / L, 0, 1));
          this.vessels.forEach((v, i) => {
            if (!this.visible(v, i)) return;
            const di = Math.min(state.d - lags[i], L - lags[i] * 0.4);
            const dd = clamp(di, 0, L);
            const p = at(dd);
            const q = at(dd + 2);
            const pb = at(dd - 2);
            const hx = q[0] - pb[0], hy = q[1] - pb[1];
            if (Math.hypot(hx, hy) > 0.01 && di > -0.5) v.heading = (Math.atan2(hy, hx) * 180) / Math.PI;
            const rad = (v.heading * Math.PI) / 180;
            // Lateral offset fades in after departure and out on arrival.
            const w = clamp(Math.min(dd / (lagUnit * 3), (L - dd) / (lagUnit * 2) + 0.35), 0, 1);
            v.x = p[0] - Math.sin(rad) * lateral[i] * w;
            v.y = p[1] + Math.cos(rad) * lateral[i] * w;
          });
          this.update(0);
        },
        onComplete: () => {
          onProgress(1);
          this.voyage = null;
          resolve();
        },
        onInterrupt: () => resolve(),
      });
    });
  }

  /** Abandon a voyage in progress (the reader jumped elsewhere). */
  stop(): void {
    this.voyage?.kill();
    this.voyage = null;
  }

  /** Sink the last `count` living ships, one after another. */
  sink(count: number): Promise<void> {
    const victims = this.vessels.filter((v) => v.alive).slice(-count);
    return new Promise((resolve) => {
      const tl = gsap.timeline({ onComplete: resolve });
      victims.forEach((v, i) => {
        v.alive = false;
        tl.to(v.body, { rotation: 28, y: 18, opacity: 0, duration: 1.1, ease: 'power2.in', transformOrigin: '50% 50%' }, i * 0.22);
        tl.set(v.g, { display: 'none' }, i * 0.22 + 1.15);
        tl.set(v.body, { rotation: 0, y: 0, opacity: 1 }, i * 0.22 + 1.2);
      });
    });
  }

  /** Per-frame transform update (bobbing and counter-scaling). */
  update(dt: number): void {
    this.time += dt;
    const k = this.iconPx() / 100 / this.scale;
    // From afar a dozen hulls read as a smudge: show a small squadron instead.
    const far = this.scale / this.minScale < 1.8;
    this.vessels.forEach((v, i) => {
      if (v.g.style.display === 'none') return;
      const vis = far && i >= 4 ? '0' : '1';
      if (v.g.style.opacity !== vis && !gsap.isTweening(v.g)) v.g.style.opacity = vis;
      const bob = Math.sin(this.time * 1.6 + v.phase) * 2.2;
      const heave = Math.sin(this.time * 2.1 + v.phase) * 0.9;
      const left = Math.cos((v.heading * Math.PI) / 180) < 0;
      v.g.setAttribute(
        'transform',
        `translate(${v.x.toFixed(2)} ${(v.y + heave / this.scale).toFixed(2)}) rotate(${(v.heading + bob).toFixed(2)}) scale(${k.toFixed(4)} ${(left ? -k : k).toFixed(4)})`,
      );
    });
  }
}
