/**
 * Art and rigging helpers for Θʹ Kyklop — Polyphemos's cave.
 *
 * The cave is painted as a cross-section: a black rock mass with incised
 * strata around a clay hollow, the doorway on the right where daylight comes
 * in. Props (cheese baskets, milk pails, a wattle pen), the hearth, the door
 * boulder, the olive-wood stake, the great cup and Poseidon's trident follow
 * the black-figure rules: glaze, incision, added white and purple only.
 */
import { s } from '../lib/dom';
import { gsap } from '../lib/motion';
import { clamp, ribbon, smoothPath, type Vec } from '../lib/geometry';
import { rng, range } from '../lib/random';
import { Figure, INK, CLAY, WHITE, PURPLE, type FigureStyle, type Pose } from '../art/figure';

export const GROUND = 96;

/* ------------------------------------------------------------------ */
/* Rigging                                                              */
/* ------------------------------------------------------------------ */

type Pair = [number, number];

/**
 * Tween only the given joints of a figure. Unlike `Figure.to`, the start pose
 * is read when the tween starts, so several of these can be sequenced in one
 * timeline, and joints not named keep whatever other tweens do to them.
 */
export function poseTo(fig: Figure, target: Partial<Pose>, vars: gsap.TweenVars = {}): gsap.core.Tween {
  const keys = Object.keys(target) as Array<keyof Pose>;
  const from: Record<string, number | Pair> = {};
  const proxy = { t: 0 };
  const user = vars.onUpdate as (() => void) | undefined;
  return gsap.to(proxy, {
    duration: 0.6,
    ease: 'power2.inOut',
    ...vars,
    t: 1,
    onStart: () => {
      for (const k of keys) {
        const v = fig.pose[k];
        from[k] = Array.isArray(v) ? [v[0], v[1]] : (v as number);
      }
    },
    onUpdate: () => {
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
  constructor(style: FigureStyle, p: Pose, x: number, y = GROUND, k = 1, className = '') {
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
  /** World position of the Cyclops's eye (head 'cyclops'). */
  eye(): Vec {
    const j = this.fig.joints();
    const a = rad(j.headAngle);
    const ex = 4 * 1.25, ey = -4.8 * 1.25;
    return this.toWorld([j.HC[0] + ex * Math.cos(a) - ey * Math.sin(a), j.HC[1] + ex * Math.sin(a) + ey * Math.cos(a)]);
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

/* ------------------------------------------------------------------ */
/* The cave                                                             */
/* ------------------------------------------------------------------ */

/** Hollow of the cave (clockwise from the lower left); the doorway opens on the right. */
const HOLLOW: Vec[] = [
  [-150, GROUND + 30], [-153, 58], [-148, 14], [-137, -30], [-118, -68], [-93, -97], [-62, -117], [-26, -128],
  [12, -131], [46, -126], [70, -115], [82, -100], [87, -84], [94, -74], [112, -70], [140, -72], [200, -70],
  [200, GROUND + 30],
];

export interface CaveParts {
  /** Daylight seen through the doorway. */
  outside: SVGGElement;
  rock: SVGGElement;
  /** The doorway region (for light). */
  doorD: string;
}

export function cave(): CaveParts {
  const outside = s('g', { class: 'kyk-outside' });
  const doorD = `M88 ${GROUND + 4}L88 -40C88 -62 96 -71 112 -71L200 -71L200 ${GROUND + 4}Z`;
  outside.appendChild(s('path', { d: doorD, fill: WHITE, opacity: 0.2 }));
  // Distant hills and an olive tree outside, seen through the doorway.
  outside.appendChild(s('path', { d: `M88 ${GROUND}L88 78Q104 64 122 70T160 60T200 66V${GROUND}Z`, fill: INK }));
  const olive = s('g', { transform: 'translate(132 70) scale(0.34)' });
  olive.appendChild(s('path', { d: ribbon([[0, 0], [-3, -20], [2, -40], [-1, -58]], [[0, 9], [1, 3]], 20), fill: INK }));
  const rand = rng(12);
  let leaves = '';
  for (let i = 0; i < 60; i++) {
    const a = range(rand, 0, Math.PI * 2), r = Math.sqrt(rand()) * 30;
    const cx = Math.cos(a) * r * 1.3, cy = -66 + Math.sin(a) * r * 0.7;
    const ang = a + range(rand, -0.8, 0.8), L = range(rand, 7, 11);
    const ex = cx + Math.cos(ang) * L, ey = cy + Math.sin(ang) * L;
    leaves += `M${cx.toFixed(1)} ${cy.toFixed(1)}Q${((cx + ex) / 2 - Math.sin(ang) * 2.2).toFixed(1)} ${((cy + ey) / 2 + Math.cos(ang) * 2.2).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}Q${((cx + ex) / 2 + Math.sin(ang) * 2.2).toFixed(1)} ${((cy + ey) / 2 - Math.cos(ang) * 2.2).toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)}Z`;
  }
  olive.appendChild(s('path', { d: leaves, fill: INK }));
  outside.appendChild(olive);

  const rock = s('g', { class: 'kyk-rock' });
  rock.appendChild(s('path', { d: `M-200 -200H200V200H-200Z${smoothPath(HOLLOW, true, 0.26)}`, fill: INK, 'fill-rule': 'evenodd' }));
  // Stalactites along the vault.
  const ceil = (x: number): number => {
    for (let i = 1; i < 13; i++) {
      const [x0, y0] = HOLLOW[i], [x1, y1] = HOLLOW[i + 1];
      if ((x - x0) * (x - x1) <= 0 && x0 !== x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
    return -120;
  };
  let drips = '';
  const sr = rng(5);
  for (const x of [-104, -82, -58, -41, -12, 6, 30, 52, 68]) {
    const y = ceil(x) - 3;
    const L = range(sr, 7, 16), w = range(sr, 2.6, 4.4);
    drips += `M${x - w} ${y.toFixed(1)}Q${(x - w * 0.3).toFixed(1)} ${(y + L * 0.6).toFixed(1)} ${x.toFixed(1)} ${(y + L).toFixed(1)}Q${(x + w * 0.4).toFixed(1)} ${(y + L * 0.5).toFixed(1)} ${x + w} ${y.toFixed(1)}Z`;
  }
  rock.appendChild(s('path', { d: drips, fill: INK }));
  // Incised strata following the vault, and a few on the walls.
  const strata =
    'M-150 -44Q-128 -96 -84 -122Q-40 -146 12 -148Q56 -146 86 -128' +
    'M-160 -58Q-146 -108 -100 -134M-60 -148Q-8 -160 46 -154' +
    'M-40 -140Q0 -146 30 -142M98 -104Q118 -92 150 -92M104 -88Q130 -80 162 -84' +
    'M-162 0Q-158 30 -160 60M-166 -30Q-164 -10 -166 20';
  rock.appendChild(s('path', { d: strata, fill: 'none', stroke: CLAY, 'stroke-width': 0.9, opacity: 0.55, 'stroke-linecap': 'round', 'stroke-dasharray': '26 7 14 9' }));
  // A rock shelf on the left wall for the cheese baskets.
  rock.appendChild(s('path', { d: 'M-172 -20L-106 -23Q-97 -22 -100 -15L-106 -13L-172 -9Z', fill: INK }));
  rock.appendChild(s('path', { d: 'M-160 -15H-110', stroke: CLAY, 'stroke-width': 0.7, opacity: 0.6 }));
  return { outside, rock, doorD };
}

/** A great door stone with incised strata. */
export function boulder(r = 80, seed = 7): SVGGElement {
  const g = s('g', { class: 'kyk-boulder' });
  const rand = rng(seed);
  const pts: Vec[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const rr = r * range(rand, 0.88, 1.03);
    pts.push([Math.cos(a) * rr, Math.sin(a) * rr * 0.96]);
  }
  g.appendChild(s('path', { d: smoothPath(pts, true, 0.34), fill: INK, stroke: CLAY, 'stroke-width': 1.8, 'paint-order': 'stroke' }));
  let d = '';
  for (let k = 0; k < 6; k++) {
    const y = -r * 0.66 + k * r * 0.27;
    const w = Math.sqrt(Math.max(0, r * r - y * y)) * 0.78;
    d += `M${(-w).toFixed(1)} ${y.toFixed(1)}q${w.toFixed(1)} ${range(rand, -9, 9).toFixed(1)} ${(2 * w).toFixed(1)} ${range(rand, -5, 5).toFixed(1)}`;
  }
  g.appendChild(s('path', { d, fill: 'none', stroke: CLAY, 'stroke-width': 1, opacity: 0.7, 'stroke-dasharray': '30 6 12 5' }));
  return g;
}

/** A wicker cheese basket (talaros) with white cheeses. */
export function cheeseBasket(x: number, y: number, k = 1): SVGGElement {
  const g = s('g', { class: 'kyk-basket', transform: `translate(${x} ${y}) scale(${k})` });
  g.appendChild(s('path', { d: 'M-8 0L-11 -14H11L8 0Z', fill: INK }));
  g.appendChild(s('path', { d: 'M-12.5 -14.6H12.5', stroke: INK, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
  g.appendChild(s('path', { d: 'M-9.6 -4H9.6M-10.4 -8.6H10.4M-6 -1L-3 -13M-1 -1L1 -13M4 -1L5 -13M-9 -3L-8 -12M8.5 -3L9 -12', stroke: CLAY, 'stroke-width': 0.55, fill: 'none', opacity: 0.85 }));
  for (const [cx, cy, rx] of [[-5, -17.4, 5.6], [5, -17.6, 5.6], [0, -21.6, 5.2]] as Array<[number, number, number]>) {
    g.appendChild(s('ellipse', { cx, cy, rx, ry: rx * 0.55, fill: WHITE, stroke: INK, 'stroke-width': 0.7 }));
  }
  return g;
}

/** A milk pail brimming with added-white milk. */
export function milkPail(x: number, y: number, k = 1): SVGGElement {
  const g = s('g', { class: 'kyk-pail', transform: `translate(${x} ${y}) scale(${k})` });
  g.appendChild(s('path', { d: 'M-9 -14Q-10 -2 -4 0H4Q10 -2 9 -14Z', fill: INK }));
  g.appendChild(s('ellipse', { cx: 0, cy: -14, rx: 9.4, ry: 2.2, fill: WHITE, stroke: INK, 'stroke-width': 1 }));
  g.appendChild(s('path', { d: 'M-9 -14C-12 -24 12 -24 9 -14', fill: 'none', stroke: INK, 'stroke-width': 1 }));
  g.appendChild(s('path', { d: 'M-8 -8H8', stroke: CLAY, 'stroke-width': 0.6, opacity: 0.8 }));
  return g;
}

/** A wattle fence (the lamb pen) from x0 to x1 on the ground. */
export function fence(x0: number, x1: number, y: number, h = 30): SVGGElement {
  const g = s('g', { class: 'kyk-fence' });
  let posts = '';
  for (let x = x0; x <= x1 + 0.1; x += 10) posts += `M${x} ${y}V${y - h - (Math.round(x) % 3) * 1.2}`;
  g.appendChild(s('path', { d: posts, stroke: INK, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
  let weave = '';
  for (const yy of [y - h * 0.3, y - h * 0.62, y - h * 0.9]) {
    weave += `M${x0 - 2} ${yy.toFixed(1)}`;
    for (let x = x0; x < x1; x += 10) weave += `q5 ${(x / 10) % 2 ? 2.4 : -2.4} 10 0`;
  }
  g.appendChild(s('path', { d: weave, fill: 'none', stroke: INK, 'stroke-width': 1.5 }));
  return g;
}

/** The hearth: a ring of stones with ashes. Flames are added by the scene. */
export function hearthStones(x: number, y: number): SVGGElement {
  const g = s('g', { class: 'kyk-hearth', transform: `translate(${x} ${y})` });
  g.appendChild(s('path', { d: 'M-20 0Q-20 -5 -12 -5H12Q20 -5 20 0Z', fill: INK }));
  for (const [cx, rx] of [[-17, 5], [-7, 5.5], [4, 5], [14, 5.5]] as Array<[number, number]>) {
    g.appendChild(s('ellipse', { cx, cy: -3, rx, ry: 3.6, fill: INK, stroke: CLAY, 'stroke-width': 0.8, 'paint-order': 'stroke' }));
  }
  g.appendChild(s('path', { d: 'M-12 -6l3 -2M-2 -7l2 -2M7 -6l3 -1', stroke: WHITE, 'stroke-width': 0.8, opacity: 0.8, 'stroke-linecap': 'round' }));
  return g;
}

/** The olive-wood stake, lying along −x from its point at the origin. */
export function stake(len = 150): { g: SVGGElement; hot: SVGPathElement } {
  const g = s('g', { class: 'kyk-stake' });
  g.appendChild(
    s('path', {
      d: ribbon([[-len, 0.4], [-len * 0.55, -0.4], [-len * 0.2, 0.2], [-14, 0], [0, 0]], [[0, 6.4], [0.5, 5.8], [0.9, 4.4], [1, 0.4]], 44),
      fill: INK,
    }),
  );
  // Knots and bark, incised.
  let bark = '';
  for (const t of [0.86, 0.72, 0.6, 0.47, 0.34, 0.22]) bark += `M${(-len * t).toFixed(1)} ${t % 0.2 > 0.1 ? -1.6 : 1.2}l${(6 + t * 4).toFixed(1)} ${t % 0.2 > 0.1 ? 1 : -0.9}`;
  g.appendChild(s('path', { d: bark, stroke: CLAY, 'stroke-width': 0.6, fill: 'none', 'stroke-linecap': 'round' }));
  const hot = s('path', { d: ribbon([[-18, 0], [-8, 0], [0, 0]], [[0, 4.6], [0.6, 3], [1, 0.4]], 12), fill: PURPLE, opacity: 0 });
  g.appendChild(hot);
  return { g, hot };
}

/** Poseidon's trident, base at the origin, pointing up (−y). */
export function trident(len = 170, color = INK): SVGGElement {
  const g = s('g', { class: 'kyk-trident' });
  const top = -len;
  const head = top + 38;
  g.appendChild(s('path', { d: `M-1.8 0L-1.5 ${head}H1.5L1.8 0Z`, fill: color }));
  // Crossbar and prongs as tapering ribbons.
  g.appendChild(s('path', { d: ribbon([[0, head + 6], [-8, head + 1], [-15, head - 8], [-16, top + 10]], [[0, 4.4], [0.6, 3], [1, 2]], 24), fill: color }));
  g.appendChild(s('path', { d: ribbon([[0, head + 6], [8, head + 1], [15, head - 8], [16, top + 10]], [[0, 4.4], [0.6, 3], [1, 2]], 24), fill: color }));
  g.appendChild(s('path', { d: ribbon([[0, head + 4], [0, top + 6]], [[0, 4.2], [1, 2.4]], 12), fill: color }));
  // Barbed points.
  const barb = (x: number, y: number) => `M${x - 4.6} ${y + 5}L${x} ${y - 9}L${x + 4.6} ${y + 5}L${x + 1.2} ${y + 2}L${x - 1.2} ${y + 2}Z`;
  g.appendChild(s('path', { d: barb(-16, top + 8) + barb(16, top + 8) + barb(0, top + 2), fill: color }));
  g.appendChild(s('path', { d: `M-5 ${head + 12}H5M-4 ${head + 16}H4`, stroke: color === INK ? CLAY : INK, 'stroke-width': 0.8 }));
  return g;
}
