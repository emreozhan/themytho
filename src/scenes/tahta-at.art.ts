/**
 * Small pieces for the Wooden Horse tondo: the Achaean huts, a ladder, and
 * warriors who can climb, crawl and slide over the black horse (each with an
 * incised clay contour so the figure stays legible against the glaze).
 */
import { s, r1 } from '../lib/dom';
import { gsap } from '../lib/motion';
import type { Vec } from '../lib/geometry';
import { Figure, INK, CLAY, WHITE, type FigureStyle, type Pose } from '../art/figure';
import { Halo, aspis, mixPose, clonePose, type Device } from './troya.art';

/** An Achaean hut (klisia): a low house with a pitched thatched roof and a reserved doorway. */
export function hut(x: number, y: number, k = 1): SVGGElement {
  const g = s('g', { class: 'hut', transform: `translate(${x} ${y}) scale(${k})` });
  g.appendChild(s('path', { d: 'M-10 0V-10L0 -17L10 -10V0Z', fill: INK }));
  g.appendChild(s('path', { d: 'M-12 -9.4L0 -18.4L12 -9.4', fill: 'none', stroke: INK, 'stroke-width': 2, 'stroke-linejoin': 'round' }));
  g.appendChild(s('path', { d: 'M-2.4 0V-5.6Q0 -7.6 2.4 -5.6V0Z', fill: CLAY }));
  g.appendChild(s('path', { d: 'M-8 -11.6L0 -17.2L8 -11.6M-5 -13.6L0 -17M-6.6 -8.4H6.6', fill: 'none', stroke: CLAY, 'stroke-width': 0.5, opacity: 0.7 }));
  return g;
}

/** A ladder from foot `a` to top `b`, with an incised clay contour. */
export function ladder(a: Vec, b: Vec, width = 9, rungs = 9): SVGGElement {
  const g = s('g', { class: 'ladder' });
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const L = Math.hypot(dx, dy) || 1;
  const n: Vec = [-dy / L, dx / L];
  const off = (p: Vec, k: number): Vec => [p[0] + n[0] * k, p[1] + n[1] * k];
  const a1 = off(a, -width / 2), b1 = off(b, -width / 2), a2 = off(a, width / 2), b2 = off(b, width / 2);
  let d = `M${r1(a1[0])} ${r1(a1[1])}L${r1(b1[0])} ${r1(b1[1])}M${r1(a2[0])} ${r1(a2[1])}L${r1(b2[0])} ${r1(b2[1])}`;
  for (let i = 1; i <= rungs; i++) {
    const t = i / (rungs + 1);
    const p1: Vec = [a1[0] + (b1[0] - a1[0]) * t, a1[1] + (b1[1] - a1[1]) * t];
    const p2: Vec = [a2[0] + (b2[0] - a2[0]) * t, a2[1] + (b2[1] - a2[1]) * t];
    d += `M${r1(p1[0])} ${r1(p1[1])}L${r1(p2[0])} ${r1(p2[1])}`;
  }
  g.appendChild(s('path', { d, stroke: CLAY, 'stroke-width': 3.6, 'stroke-linecap': 'round' }));
  g.appendChild(s('path', { d, stroke: INK, 'stroke-width': 1.6, 'stroke-linecap': 'round' }));
  return g;
}

export interface WarriorOptions {
  /** Shield slung on the back (none for Odysseus the scout). */
  device?: Device | null;
  haloWidth?: number;
}

/**
 * A warrior placed by a wrapper group (`g`: translate + scale), posed with
 * ground at 0. A clay halo and a back-slung shield follow the pose.
 */
export class Warrior {
  readonly g: SVGGElement;
  readonly body: SVGGElement;
  readonly fig: Figure;
  readonly halo: Halo;
  private shield: SVGGElement | null = null;
  private shieldHalo: SVGCircleElement | null = null;
  x = 0;
  y = 0;
  k = 1;
  constructor(style: FigureStyle, p: Pose, k: number, opts: WarriorOptions = {}) {
    this.k = k;
    this.g = s('g', { class: 'warrior' });
    this.body = s('g');
    this.g.appendChild(this.body);
    this.halo = new Halo(style, p, opts.haloWidth ?? 2.6);
    this.fig = new Figure(style, p);
    if (opts.device !== null) {
      this.shieldHalo = s('circle', { r: 12.6, fill: CLAY });
      this.shield = s('g');
      this.shield.appendChild(aspis(11, opts.device ?? 'star'));
      this.body.append(this.halo.g, this.shieldHalo, this.shield, this.fig.g);
    } else {
      this.body.append(this.halo.g, this.fig.g);
    }
    this.sync();
    this.place(0, 0);
  }

  place(x: number, y: number, k = this.k): void {
    this.x = x;
    this.y = y;
    this.k = k;
    this.g.setAttribute('transform', `translate(${r1(x)} ${r1(y)}) scale(${k.toFixed(3)})`);
  }

  sync(): void {
    this.halo.follow(this.fig.pose);
    if (this.shield && this.shieldHalo) {
      const j = this.fig.joints();
      const f = this.fig.style.facing ?? 1;
      // On the back, between the shoulder blades, in the figure's own frame.
      const c: Vec = [j.P[0] + j.u[0] * 18 - j.fwd[0] * 7, j.P[1] + j.u[1] * 18 - j.fwd[1] * 7];
      const wx = j.P[0] + (c[0] - j.P[0]) * f;
      const tf = `translate(${r1(wx)} ${r1(c[1])})`;
      this.shield.setAttribute('transform', tf);
      this.shieldHalo.setAttribute('transform', tf);
    }
  }

  set(p: Partial<Pose>): void {
    this.fig.set(p);
    this.sync();
  }

  /** Tween to a pose; the start pose is read when the tween starts. */
  to(target: Partial<Pose>, vars: gsap.TweenVars = {}): gsap.core.Tween {
    let from = clonePose(this.fig.pose);
    let to: Pose = { ...from, ...target };
    const proxy = { t: 0 };
    return gsap.to(proxy, {
      t: 1,
      duration: 0.5,
      ease: 'power2.inOut',
      ...vars,
      onStart: () => {
        from = clonePose(this.fig.pose);
        to = { ...from, ...target };
      },
      onUpdate: () => {
        this.set(mixPose(from, to, proxy.t));
      },
    });
  }
}

/** Two alternating climbing poses (feet on a rung at ground 0). */
export function climbPose(phase: number, lean = 22): Pose {
  const a: Pose = { x: 0, y: -44, lean, head: -10, armF: [168, 6], armB: [128, 24], legF: [74, 96], legB: [-6, 14], footF: 0, footB: 10, grip: 1 };
  const b: Pose = { x: 0, y: -44, lean, head: -10, armF: [128, 24], armB: [168, 6], legF: [-4, 14], legB: [72, 94], footF: 10, footB: 0, grip: 1 };
  return mixPose(a, b, (1 + Math.sin(phase * Math.PI * 2)) / 2);
}

/** A helmeted head peeking from a hatch (for the hollow of the horse). */
export function peekingHead(x: number, y: number, k = 1, facing: 1 | -1 = 1): SVGGElement {
  const g = s('g', { class: 'peeker', transform: `translate(${x} ${y}) scale(${k * facing} ${k})` });
  g.appendChild(s('path', { d: 'M-6 6C-8 -2 -6 -9 0 -9.6C5 -10 8 -6 7.6 -2L6.6 -1.6L6.4 1L8 2.6V6.4C6 7 4 6.6 3 5.4L3.2 2.4L1.6 -0.2L2.2 -3.4L6 -3.2C4.6 -5 2 -5.2 0 -4.4V7C-3 8 -5 7.6 -6 6Z', fill: INK }));
  g.appendChild(s('path', { d: 'M7 -11C3 -15 -6 -15 -11 -10C-13 -7.6 -13.6 -3.4 -12.6 0.6C-10.8 -3 -9.8 -6 -8 -8C-4 -11.4 2 -11.8 7 -11Z', fill: INK }));
  g.appendChild(s('path', { d: 'M-10 -8.6C-5 -12.6 1 -12.8 5 -11.8M-5.6 3C-6.4 -2 -5 -6.4 0 -7', fill: 'none', stroke: CLAY, 'stroke-width': 0.5 }));
  g.appendChild(s('path', { d: 'M3.6 -2.2h0.01', stroke: WHITE, 'stroke-width': 1.2, 'stroke-linecap': 'round' }));
  return g;
}
