/**
 * Rigging helpers shared by my three chapter scenes (Lotofaglar, Kyklop,
 * Thrinakia): partial pose tweens that read their start pose when they start,
 * two-bone arm IK, a positioning wrapper for figures (so giants can be scaled
 * about their own feet), a walk cycle driven by distance, and brush-written
 * inscriptions. Everything returns plain GSAP tweens for scene timelines.
 */
import { s } from '../lib/dom';
import { gsap } from '../lib/motion';
import { clamp, type Vec } from '../lib/geometry';
import { Figure, type FigureStyle, type Pose } from '../art/figure';
import type { Beast } from '../art/animals';

type Pair = [number, number];

/**
 * Tween only the given joints of a figure. Unlike `Figure.to`, the start pose
 * is read when the tween starts, so several of these can be sequenced in one
 * timeline, and joints not named keep whatever other tweens do to them.
 */
export function poseTo(fig: Figure, target: Partial<Pose>, vars: gsap.TweenVars = {}): gsap.core.Tween {
  const keys = Object.keys(target) as Array<keyof Pose>;
  const from: Record<string, number | Pair> = {};
  let started = false;
  const proxy = { t: 0 };
  const user = vars.onUpdate as (() => void) | undefined;
  // The start pose is captured on the first update (GSAP's lazy first render
  // can skip onStart when a timeline is hurried along).
  const capture = () => {
    if (started) return;
    started = true;
    for (const k of keys) {
      const v = fig.pose[k];
      from[k] = Array.isArray(v) ? [v[0], v[1]] : (v as number);
    }
  };
  return gsap.to(proxy, {
    duration: 0.6,
    ease: 'power2.inOut',
    ...vars,
    t: 1,
    onStart: capture,
    onUpdate: () => {
      capture();
      const t = proxy.t;
      const out: Record<string, number | Pair> = {};
      for (const k of keys) {
        const a = from[k];
        const b = target[k] as number | Pair;
        if (Array.isArray(a) && Array.isArray(b)) out[k] = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
        else out[k] = (a as number) + ((b as number) - (a as number)) * t;
      }
      fig.set(out as Partial<Pose>);
      user?.();
    },
  });
}

const UPPER = 16;
const FORE = 14.5;
const deg = (r: number) => (r * 180) / Math.PI;
const rad = (d: number) => (d * Math.PI) / 180;

/** Two-bone IK: arm angles that put the wrist on `target` (figure-local, before facing). */
export function armTo(fig: Figure, which: 'F' | 'B', target: Vec, elbowDown = true): Pair {
  const j = fig.joints();
  const S = which === 'F' ? j.armF.S : j.armB.S;
  const dx = target[0] - S[0], dy = target[1] - S[1];
  const d = clamp(Math.hypot(dx, dy), Math.abs(UPPER - FORE) + 0.5, UPPER + FORE - 0.05);
  const base = deg(Math.atan2(dx, dy));
  const A = deg(Math.acos(clamp((UPPER * UPPER + d * d - FORE * FORE) / (2 * UPPER * d), -1, 1)));
  const a1 = elbowDown ? base - A : base + A;
  const E: Vec = [S[0] + Math.sin(rad(a1)) * UPPER, S[1] + Math.cos(rad(a1)) * UPPER];
  let a2 = deg(Math.atan2(target[0] - E[0], target[1] - E[1])) - a1;
  while (a2 > 180) a2 -= 360;
  while (a2 < -180) a2 += 360;
  return [a1, a2];
}

/**
 * A figure inside a positioning wrapper: the figure stands on local y = 0 and
 * the wrapper places and scales it (Figure's own scale pivots on y = 0 of the
 * whole tondo, which is awkward for giants).
 */
export class Actor {
  readonly g: SVGGElement;
  readonly fig: Figure;
  x: number;
  y: number;
  k: number;
  constructor(style: FigureStyle, p: Pose, x: number, y: number, k = 1, className = '') {
    this.g = s('g', { class: `actor ${className}` });
    this.fig = new Figure(style, p);
    this.g.appendChild(this.fig.g);
    this.x = x;
    this.y = y;
    this.k = k;
    this.place();
  }
  place(): void {
    this.g.setAttribute('transform', `translate(${this.x.toFixed(2)} ${this.y.toFixed(2)}) scale(${this.k})`);
  }
  get facing(): 1 | -1 {
    return this.fig.style.facing ?? 1;
  }
  face(f: 1 | -1): void {
    this.fig.style.facing = f;
    this.fig.render();
    // Figure.render() hands `transform: null` to attr(), which ignores nulls,
    // so a figure turning back to facing 1 would keep its mirror: clear it.
    if (f === 1 && (this.fig.style.scale ?? 1) === 1) this.fig.g.removeAttribute('transform');
  }
  /** World → figure-local (before facing). */
  toLocal(w: Vec): Vec {
    const ox = this.fig.pose.x;
    const lx = (w[0] - this.x) / this.k, ly = (w[1] - this.y) / this.k;
    return [ox + (lx - ox) * this.facing, ly];
  }
  /** Figure-local (before facing) → world. */
  toWorld(l: Vec): Vec {
    const ox = this.fig.pose.x;
    return [this.x + (ox + (l[0] - ox) * this.facing) * this.k, this.y + l[1] * this.k];
  }
  hand(which: 'F' | 'B' = 'F'): Vec {
    const j = this.fig.joints();
    return this.toWorld(which === 'F' ? j.armF.W : j.armB.W);
  }
  /** Put a wrist on a world point (IK). */
  reach(which: 'F' | 'B', w: Vec, elbowDown = true): void {
    const a = armTo(this.fig, which, this.toLocal(w), elbowDown);
    this.fig.set(which === 'F' ? { armF: a } : { armB: a });
  }
  /** World position of a point given in head space (giant heads are drawn 1.25× larger). */
  headPoint(hx: number, hy: number): Vec {
    const j = this.fig.joints();
    const a = rad(j.headAngle);
    const hk = this.fig.style.head === 'cyclops' || this.fig.style.head === 'giant' ? 1.25 : 1;
    const ex = hx * hk, ey = hy * hk;
    return this.toWorld([j.HC[0] + ex * Math.cos(a) - ey * Math.sin(a), j.HC[1] + ex * Math.sin(a) + ey * Math.cos(a)]);
  }
  /** World position of the Cyclops's eye. */
  eye(): Vec {
    return this.headPoint(4, -4.8);
  }
  mouth(): Vec {
    return this.headPoint(8.2, 3.4);
  }
}

/** Walking legs and swinging arms at a phase (0..1 per stride). */
export function gait(fig: Figure, phase: number, amp = 1, arms = true): void {
  const a = Math.sin(phase * Math.PI * 2);
  const c = Math.cos(phase * Math.PI * 2);
  const p: Partial<Pose> = {
    legF: [3 + 24 * a * amp, 6 + 26 * Math.max(0, c) * amp],
    legB: [3 - 24 * a * amp, 6 + 26 * Math.max(0, -c) * amp],
  };
  if (arms) {
    p.armF = [-20 * a * amp, 16];
    p.armB = [20 * a * amp, 12];
  }
  fig.set(p);
}

/** Animate the painted letters of an inscription as if written with a brush. */
export function writeIn(label: SVGGElement, duration = 1): gsap.core.Timeline {
  const paths = [...label.querySelectorAll('path')];
  paths.forEach((p) => {
    p.style.strokeDasharray = '1 1';
    p.style.strokeDashoffset = '1';
  });
  label.style.opacity = '1';
  const tl = gsap.timeline();
  tl.to(paths, { strokeDashoffset: 0, duration: duration / Math.max(1, paths.length) * 1.6, ease: 'brush', stagger: duration / Math.max(1, paths.length) });
  return tl;
}

/** Walk an actor to x with its legs in step with the distance covered. */
export function walkTo(
  a: Actor,
  toX: number,
  dur: number,
  o: { stride?: number; ease?: string; arms?: boolean; onUpdate?: () => void } = {},
): gsap.core.Tween {
  const proxy = { t: 0 };
  let x0: number | null = null;
  const stride = (o.stride ?? 34) * a.k;
  return gsap.to(proxy, {
    t: 1,
    duration: dur,
    ease: o.ease ?? 'power1.inOut',
    onUpdate: function (this: gsap.core.Tween) {
      x0 ??= a.x;
      a.x = x0 + (toX - x0) * proxy.t;
      a.place();
      const lin = this.progress();
      const amp = Math.min(1, lin * 6 + 0.25, (1 - lin) * 5);
      gait(a.fig, Math.abs(a.x - x0) / stride, amp, o.arms ?? true);
      o.onUpdate?.();
    },
  });
}

/** Walk a beast to x, its legs stepping with the distance covered. */
export function beastTo(b: Beast, toX: number, dur: number, ease = 'none', onUpdate?: () => void): gsap.core.Tween {
  const proxy = { t: 0 };
  let x0: number | null = null;
  return gsap.to(proxy, {
    t: 1,
    duration: dur,
    ease,
    onUpdate: () => {
      x0 ??= b.x;
      const x = x0 + (toX - x0) * proxy.t;
      b.moveTo(x);
      b.step((Math.abs(x - x0) / (30 * b.scale)) % 1);
      onUpdate?.();
    },
  });
}
