/**
 * The atlas camera. State is a centre point in map units plus a scale in
 * screen pixels per map unit; it is written to the SVG as a viewBox.
 *
 * Long moves use the van Wijk & Nuij "smooth and efficient zooming and
 * panning" path: the camera rises (zooms out) while it travels and descends
 * on arrival, which reads like a flight over the sea rather than a slide.
 */
import { gsap } from '../lib/motion';
import { MAP_HEIGHT, MAP_WIDTH } from './projection';
import type { Vec } from '../lib/geometry';

export interface CamState {
  x: number;
  y: number;
  s: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

type Listener = (c: CamState) => void;

export class Camera {
  state: CamState = { x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2, s: 1 };
  vw = 1;
  vh = 1;
  private listeners = new Set<Listener>();
  private tween: gsap.core.Tween | null = null;

  constructor(private svg: SVGSVGElement) {}

  onChange(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  resize(vw: number, vh: number): void {
    this.vw = Math.max(1, vw);
    this.vh = Math.max(1, vh);
    this.apply();
  }

  /** Smallest useful scale: the whole view area contained in the viewport. */
  get minScale(): number {
    return Math.min(this.vw / MAP_WIDTH, this.vh / MAP_HEIGHT);
  }

  get maxScale(): number {
    return this.minScale * 9;
  }

  apply(): void {
    const { x, y, s } = this.state;
    const w = this.vw / s;
    const h = this.vh / s;
    this.svg.setAttribute('viewBox', `${(x - w / 2).toFixed(2)} ${(y - h / 2).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}`);
    this.svg.style.setProperty('--zoom', (s / this.minScale).toFixed(3));
    this.listeners.forEach((fn) => fn(this.state));
  }

  /** Map point → screen point. */
  toScreen(p: Vec, st: CamState = this.state): Vec {
    return [(p[0] - st.x) * st.s + this.vw / 2, (p[1] - st.y) * st.s + this.vh / 2];
  }

  /** Screen point → map point. */
  toMap(p: Vec, st: CamState = this.state): Vec {
    return [(p[0] - this.vw / 2) / st.s + st.x, (p[1] - this.vh / 2) / st.s + st.y];
  }

  /** Camera that shows map point `p` at screen point `screen`, at scale `s`. */
  anchor(p: Vec, s: number, screen: Vec): CamState {
    const sc = Math.min(this.maxScale, Math.max(this.minScale, s));
    return { x: p[0] + (this.vw / 2 - screen[0]) / sc, y: p[1] + (this.vh / 2 - screen[1]) / sc, s: sc };
  }

  /** Camera that fits a map-space box into a screen rectangle. */
  fit(box: Rect, into: Rect, maxZoom = 5): CamState {
    const s = Math.min(into.w / Math.max(1, box.w), into.h / Math.max(1, box.h));
    const sc = Math.min(this.minScale * maxZoom, Math.max(this.minScale, s));
    return this.anchor([box.x + box.w / 2, box.y + box.h / 2], sc, [into.x + into.w / 2, into.y + into.h / 2]);
  }

  /** Scale expressed as a multiple of the minimum (1 = whole map). */
  zoom(level: number): number {
    return this.minScale * level;
  }

  jump(target: CamState): void {
    this.tween?.kill();
    this.state = { ...target };
    this.apply();
  }

  /** Fly along the smooth-zoom path. Resolves on arrival. */
  fly(target: CamState, opts: { duration?: number; ease?: string; speed?: number } = {}): Promise<void> {
    this.tween?.kill();
    const from = { ...this.state };
    const interp = smoothZoom([from.x, from.y, this.vw / from.s], [target.x, target.y, this.vw / target.s]);
    const duration = opts.duration ?? Math.min(3.2, Math.max(0.9, interp.duration / 1000 / (opts.speed ?? 1)));
    const proxy = { t: 0 };
    return new Promise((resolve) => {
      this.tween = gsap.to(proxy, {
        t: 1,
        duration,
        ease: opts.ease ?? 'power2.inOut',
        onUpdate: () => {
          const [x, y, w] = interp(proxy.t);
          this.state = { x, y, s: this.vw / w };
          this.apply();
        },
        onComplete: () => resolve(),
        onInterrupt: () => resolve(),
      });
    });
  }

  /** Straight (linear-in-scale) glide, useful while following a ship. */
  glide(target: CamState, duration: number, ease = 'sine.inOut'): gsap.core.Tween {
    this.tween?.kill();
    const st = this.state;
    this.tween = gsap.to(st, { x: target.x, y: target.y, s: target.s, duration, ease, onUpdate: () => this.apply() });
    return this.tween;
  }

  /** Zoom by `factor` keeping the map point under screen point `at` fixed. */
  zoomAt(at: Vec, factor: number): void {
    this.tween?.kill();
    const p = this.toMap(at);
    const s = Math.min(this.maxScale, Math.max(this.minScale * 0.9, this.state.s * factor));
    this.state = { x: p[0] - (at[0] - this.vw / 2) / s, y: p[1] - (at[1] - this.vh / 2) / s, s };
    this.clampToMap();
    this.apply();
  }

  /** Pan by a screen-space delta. */
  panBy(dx: number, dy: number): void {
    this.tween?.kill();
    this.state = { ...this.state, x: this.state.x - dx / this.state.s, y: this.state.y - dy / this.state.s };
    this.clampToMap();
    this.apply();
  }

  /** Keep the view centre over the map. */
  private clampToMap(): void {
    this.state.x = Math.min(MAP_WIDTH, Math.max(0, this.state.x));
    this.state.y = Math.min(MAP_HEIGHT, Math.max(0, this.state.y));
  }

  stop(): void {
    this.tween?.kill();
    this.tween = null;
  }
}

/**
 * Smooth zoom interpolation between two views (centre x, centre y, visible width),
 * after van Wijk & Nuij (2003), with ρ = √2.
 */
export function smoothZoom(
  a: [number, number, number],
  b: [number, number, number],
): ((t: number) => [number, number, number]) & { duration: number } {
  const rho = Math.SQRT2, rho2 = 2, rho4 = 4;
  const [ux0, uy0, w0] = a;
  const [ux1, uy1, w1] = b;
  const dx = ux1 - ux0, dy = uy1 - uy0;
  const d2 = dx * dx + dy * dy;
  let S: number;
  let fn: (t: number) => [number, number, number];
  if (d2 < 1e-12) {
    S = Math.log(w1 / w0) / rho;
    fn = (t) => [ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(rho * t * S)];
  } else {
    const d1 = Math.sqrt(d2);
    const b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1);
    const b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1);
    const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0);
    const r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
    S = (r1 - r0) / rho;
    fn = (t) => {
      const s = t * S;
      const coshr0 = Math.cosh(r0);
      const u = (w0 / (rho2 * d1)) * (coshr0 * Math.tanh(rho * s + r0) - Math.sinh(r0));
      return [ux0 + u * dx, uy0 + u * dy, (w0 * coshr0) / Math.cosh(rho * s + r0)];
    };
  }
  return Object.assign(fn, { duration: Math.abs(S) * 1000 });
}
