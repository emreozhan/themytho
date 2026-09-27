/**
 * Art for the Sirens chapter, drawn the way archaic painters drew them:
 * a bird's body with a woman's head (added-white face, glaze hair falling in
 * long tresses), a raised sickle wing with rows of incised coverts, a purple
 * band and long primaries, bird legs whose talons clutch the rock. One plays
 * the lyre, one the aulos.
 *
 * Also: bleached bones and skulls for the Sirens' meadow.
 *
 * Siren frame: facing +x, talons on y = 0, about 62 units from talons to crown.
 */
import { s } from '../lib/dom';
import { ribbon, sampleSpline, smoothPath, limb, type Vec } from '../lib/geometry';
import { INK, CLAY, WHITE, PURPLE } from '../art/figure';

const f1 = (v: number) => Math.round(v * 10) / 10;
const P = (v: Vec) => `${f1(v[0])} ${f1(v[1])}`;

/**
 * A tapering band along a centreline with a coordinate system across it:
 * `at(t, u)` returns the point at arc fraction t, u ∈ [-1, 1] across the width
 * (-1 = left edge when walking the centreline, +1 = right edge).
 */
export function band(center: Vec[], widths: Array<[number, number]>, samples = 40) {
  const c = sampleSpline(center, samples);
  const acc = [0];
  for (let i = 1; i < c.length; i++) acc.push(acc[i - 1] + Math.hypot(c[i][0] - c[i - 1][0], c[i][1] - c[i - 1][1]));
  const total = acc[acc.length - 1] || 1;
  const widthAt = (t: number) => {
    if (t <= widths[0][0]) return widths[0][1];
    for (let i = 1; i < widths.length; i++) {
      if (t <= widths[i][0]) {
        const [t0, w0] = widths[i - 1];
        const [t1, w1] = widths[i];
        return w0 + ((w1 - w0) * (t - t0)) / (t1 - t0 || 1);
      }
    }
    return widths[widths.length - 1][1];
  };
  const at = (t: number, u: number): Vec => {
    const d = Math.max(0, Math.min(1, t)) * total;
    let i = 1;
    while (i < acc.length - 1 && acc[i] < d) i++;
    const k = (d - acc[i - 1]) / (acc[i] - acc[i - 1] || 1);
    const x = c[i - 1][0] + (c[i][0] - c[i - 1][0]) * k;
    const y = c[i - 1][1] + (c[i][1] - c[i - 1][1]) * k;
    let tx = c[i][0] - c[i - 1][0], ty = c[i][1] - c[i - 1][1];
    const l = Math.hypot(tx, ty) || 1;
    tx /= l;
    ty /= l;
    const w = (widthAt(t) / 2) * u;
    return [x + ty * w, y - tx * w];
  };
  /** A smooth line at constant u between t0 and t1. */
  const line = (u: number, t0 = 0, t1 = 1, n = 10) => {
    const pts: Vec[] = [];
    for (let i = 0; i <= n; i++) pts.push(at(t0 + ((t1 - t0) * i) / n, u));
    return smoothPath(pts);
  };
  return { outline: ribbon(center, widths, samples), at, line, total };
}

/* ------------------------------------------------------------------ */
/* The Siren                                                           */
/* ------------------------------------------------------------------ */

export interface SirenOptions {
  x: number;
  y: number;
  scale?: number;
  facing?: 1 | -1;
  instrument?: 'lyre' | 'aulos' | 'none';
}

export interface SirenPose {
  wing?: number;
  farWing?: number;
  head?: number;
  tail?: number;
  bob?: number;
  hand?: number;
  /** Whole body pitch about the talons (a dive or a slump). */
  pitch?: number;
}

/** Centre of the head in the Siren frame, and its neck pivot. */
const HEAD: Vec = [18.5, -47];
const MOUTH: Vec = [8.1, 3.4];

export class Siren {
  readonly g: SVGGElement;
  /** Everything above the talons (breathes/bobs). */
  readonly body: SVGGElement;
  readonly wing: SVGGElement;
  readonly farWing: SVGGElement;
  readonly tail: SVGGElement;
  /** Head group, pivots at the neck. */
  readonly head: SVGGElement;
  readonly eye: SVGPathElement;
  readonly lid: SVGPathElement;
  /** The playing hand (plucks the lyre / fingers the pipes). */
  readonly hand: SVGGElement;
  readonly mouth: SVGCircleElement;
  /** The lyre, when she plays one (it can be dropped). */
  readonly lyre: SVGGElement | null = null;
  readonly instrument: 'lyre' | 'aulos' | 'none';
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly facing: 1 | -1;
  private handBase = '';
  private pose: Required<SirenPose> = { wing: 0, farWing: 0, head: 0, tail: 0, bob: 0, hand: 0, pitch: 0 };

  /** Pivots in the Siren's own frame. */
  static readonly SHOULDER: Vec = [6, -33];
  static readonly NECK: Vec = [15, -37];
  static readonly TAIL: Vec = [-15, -21];

  constructor(o: SirenOptions) {
    this.x = o.x;
    this.y = o.y;
    this.scale = o.scale ?? 1;
    this.facing = o.facing ?? 1;
    this.instrument = o.instrument ?? 'none';
    this.g = s('g', { class: 'siren' });
    this.place();
    const inc = { stroke: CLAY, 'stroke-width': 0.9, 'paint-order': 'stroke', 'stroke-linejoin': 'round' };

    // Far wing, raised higher behind the near one.
    this.farWing = s('g', { class: 'siren__farwing' });
    this.farWing.appendChild(wingShape(0.9, false));

    // Legs: feathered thighs, thin shanks, talons gripping the rock edge.
    const legs = s('g', { class: 'siren__legs' });
    const leg = (hx: number, fx: number) => {
      const thigh = limb([hx, -17], [hx + 1.8, -8.5], [[0, 3.8, 3.8], [0.7, 2.4, 2.4], [1, 1.3, 1.3]]);
      const shank = limb([hx + 1.8, -8.5], [fx, -1.4], [[0, 1.1, 1.1], [1, 0.85, 0.85]]);
      const toes =
        `M${fx - 0.4} -1.6C${fx + 2} -2.2 ${fx + 5.4} -1.4 ${fx + 6.2} 0.8C${fx + 5} -0.4 ${fx + 2.4} -0.6 ${fx} -0.4Z` +
        `M${fx} -1.4C${fx + 1.6} -1 ${fx + 3.6} 0.4 ${fx + 3.8} 2.4C${fx + 2.6} 1 ${fx + 1.2} 0.4 ${fx - 0.4} -0.2Z` +
        `M${fx + 0.4} -1.4C${fx - 1.6} -1.4 ${fx - 3.6} -0.4 ${fx - 4} 1.6C${fx - 2.6} 0.6 ${fx - 1.4} 0 ${fx} -0.2Z`;
      legs.appendChild(s('path', { d: thigh + shank + toes, fill: INK, ...inc, 'stroke-width': 0.6 }));
    };
    leg(-4, -5);
    leg(3, 3);

    // Tail: a long fan of feathers.
    this.tail = s('g', { class: 'siren__tail' });
    const tb = band([[-11, -22], [-22, -19], [-34, -14.5], [-44, -9]], [[0, 10], [0.5, 11], [0.85, 12.5], [1, 9]]);
    this.tail.appendChild(s('path', { d: tb.outline, fill: INK, ...inc }));
    let td = '';
    for (const u of [-0.55, -0.1, 0.35, 0.75]) td += tb.line(u, 0.34, 0.97, 6);
    this.tail.appendChild(s('path', { d: td, fill: 'none', stroke: CLAY, 'stroke-width': 0.55, 'stroke-linecap': 'round' }));
    const bar = (t0: number, t1: number) =>
      `M${P(tb.at(t0, -0.95))}L${P(tb.at(t1, -0.95))}L${P(tb.at(t1, 0.95))}L${P(tb.at(t0, 0.95))}Z`;
    this.tail.appendChild(s('path', { d: bar(0.2, 0.3), fill: PURPLE }));

    // Body: plump dove-like body, breast forward.
    const bodyG = s('g', { class: 'siren__torso' });
    const bodyPts: Vec[] = [
      [13, -38], [19.5, -32.5], [21.5, -25], [18, -17.5], [9, -14], [-3, -14], [-12, -16.5], [-18, -21.5], [-15, -27.5], [-4, -34], [6, -38.5],
    ];
    bodyG.appendChild(s('path', { d: smoothPath(bodyPts, true, 0.42), fill: INK, ...inc, 'stroke-width': 1 }));
    // Breast feathers: scales in incised rows.
    let sc = '';
    for (let row = 0; row < 5; row++) {
      const y = -33 + row * 3.7;
      const count = [3, 4, 4, 4, 3][row];
      const x0 = [17.5, 19.5, 19.5, 17.5, 14][row];
      for (let i = 0; i < count; i++) {
        const x = x0 - i * 4 - (row % 2) * 2;
        sc += `M${f1(x - 1.8)} ${f1(y)}q1.8 2.8 3.6 0`;
      }
    }
    bodyG.appendChild(s('path', { d: sc, fill: 'none', stroke: CLAY, 'stroke-width': 0.55, 'stroke-linecap': 'round' }));
    bodyG.appendChild(s('path', { d: 'M-8 -16Q-2 -19.6 6 -18', fill: 'none', stroke: CLAY, 'stroke-width': 0.55 }));

    // Near wing (raised sickle wing) on its own pivot.
    this.wing = s('g', { class: 'siren__wing' });
    this.wing.appendChild(wingShape(1, true));

    // Neck and head.
    this.head = s('g', { class: 'siren__head' });
    const neck = s('path', {
      d: limb([14, -34], [17, -42], [[0, 4, 3.8], [1, 2.9, 2.9]], false, false),
      fill: WHITE, stroke: INK, 'stroke-width': 0.6, 'paint-order': 'stroke',
    });
    const necklace = s('path', { d: 'M10.6 -36.8Q14.6 -34.2 18.6 -37', fill: 'none', stroke: PURPLE, 'stroke-width': 1.5, 'stroke-linecap': 'round' });
    const dots = s('path', { d: 'M12.2 -35.5h.01M14.6 -34.9h.01M17 -35.6h.01', stroke: WHITE, 'stroke-width': 1, 'stroke-linecap': 'round' });
    const face = s('g', { transform: `translate(${HEAD[0]} ${HEAD[1]})` });
    // Face (added white) under a mass of glaze hair.
    face.appendChild(s('path', {
      d: 'M-4 6.2C-6.6 3 -7.2 -3 -3.8 -7.6C-0.4 -10.4 5.2 -9 6.6 -4.4L7 -2.6L9.4 1.4L7.4 2.1L7.7 3.3L6.9 3.8L7.4 4.6C7.4 6.2 6.2 7.4 4.2 7.3C1.6 7.2 -0.4 6.8 -4 6.2Z',
      fill: WHITE, stroke: INK, 'stroke-width': 0.6, 'paint-order': 'stroke', 'stroke-linejoin': 'round',
    }));
    face.appendChild(s('path', {
      d:
        'M6.2 -5.8C5.4 -9.4 1.6 -10.8 -2.4 -10.2C-7.6 -9.4 -10.6 -5 -10.4 0.4C-10.2 5.6 -10.8 10.4 -12.2 14.8' +
        'C-9.6 16.4 -6.4 16 -4.2 14.4C-4.8 11.2 -4.4 8.4 -2.8 5.6C-1.8 3.6 -1.6 1 -2.2 -1.4' +
        'C-1.6 -4.2 1.8 -6.2 6.2 -5.8Z',
      fill: INK,
    }));
    // Incised waves in the hair and a fillet across it.
    face.appendChild(s('path', {
      d: 'M-8.8 -3.4C-9.4 2 -9.4 7.4 -10.6 13.2M-6.6 -5.4C-6.6 0 -6.8 5.4 -7.8 13.8M-4.4 4.4C-5.4 8 -5.8 11 -5.6 14.2M-8.4 -7.2Q-2 -11 5.2 -7.6',
      fill: 'none', stroke: CLAY, 'stroke-width': 0.5, 'stroke-linecap': 'round',
    }));
    face.appendChild(s('path', { d: 'M-4.6 -9.6L-3.8 -13.2L-1.2 -11.6L1.2 -13.6L3.2 -11.4L5.2 -12.2L5.6 -8.4C1.6 -10.4 -1.6 -10.6 -4.6 -9.6Z', fill: PURPLE, stroke: INK, 'stroke-width': 0.4 }));
    face.appendChild(s('path', { d: 'M-2.2 -11.1h.01M1.2 -11.6h.01M3.9 -10.8h.01', stroke: WHITE, 'stroke-width': 0.8, 'stroke-linecap': 'round' }));
    this.eye = s('path', { d: 'M2.6 -2.2Q4.3 -3.8 6 -2.2Q4.3 -1.2 2.6 -2.2Z', fill: INK });
    this.lid = s('path', { d: 'M2.4 -2.2Q4.3 -0.8 6.1 -2.3', fill: 'none', stroke: INK, 'stroke-width': 0.65, 'stroke-linecap': 'round', opacity: 0 });
    face.append(this.eye, this.lid);
    face.appendChild(s('path', { d: 'M2.8 -4.6Q4.6 -5.8 6.4 -4.6', fill: 'none', stroke: INK, 'stroke-width': 0.5 }));
    face.appendChild(s('path', { d: 'M6.2 5.1Q5.4 5.7 4.6 5.3', fill: 'none', stroke: INK, 'stroke-width': 0.35 }));
    // Ear-ring.
    face.appendChild(s('circle', { cx: -2.4, cy: 5.8, r: 1, fill: PURPLE, stroke: INK, 'stroke-width': 0.3 }));
    this.mouth = s('circle', { cx: MOUTH[0], cy: MOUTH[1], r: 0.1, fill: 'none', class: 'siren__mouth' });
    face.appendChild(this.mouth);
    this.head.append(neck, necklace, dots, face);

    // Arms and instrument.
    this.hand = s('g', { class: 'siren__hand' });
    const front = s('g', { class: 'siren__front' });
    const arm = { fill: WHITE, stroke: INK, 'stroke-width': 0.55, 'paint-order': 'stroke' };
    const upper = (a: Vec, b: Vec) => limb(a, b, [[0, 1.9, 1.9], [1, 1.3, 1.3]]);
    const fore = (a: Vec, b: Vec) => limb(a, b, [[0, 1.3, 1.3], [0.75, 1.1, 1.1], [1, 0.9, 0.9]]);
    if (this.instrument === 'lyre') {
      // The lyre leans back against the breast, held by the far arm.
      const lyre = lyreShape();
      lyre.setAttribute('transform', 'translate(29.5 -15.5) rotate(-22) scale(1.25)');
      this.lyre = lyre;
      front.appendChild(s('path', { d: upper([15.5, -33], [22.5, -31]) + fore([22.5, -31], [26.8, -34.2]), ...arm }));
      front.appendChild(lyre);
      front.appendChild(s('path', { d: upper([17, -30.5], [21, -22.5]), ...arm }));
      this.handBase = 'translate(21 -22.5)';
      this.hand.appendChild(s('path', { d: fore([0, 0], [8.2, 0.6]), ...arm }));
      this.hand.appendChild(s('path', { d: 'M8.4 0.4L11.4 -2.4', stroke: INK, 'stroke-width': 0.8, 'stroke-linecap': 'round' }));
      front.appendChild(this.hand);
    } else if (this.instrument === 'aulos') {
      // Two pipes from the lips, one in each hand.
      const m: Vec = [HEAD[0] + MOUTH[0] - 0.4, HEAD[1] + MOUTH[1]];
      const a1: Vec = [m[0] + 19, m[1] + 14], a2: Vec = [m[0] + 21.5, m[1] + 6.5];
      const pipes = s('g', { class: 'siren__aulos' });
      pipes.appendChild(s('path', { d: `M${P(m)}L${P(a1)}M${P(m)}L${P(a2)}`, stroke: INK, 'stroke-width': 1.1, 'stroke-linecap': 'round' }));
      const bell = (e: Vec, dx: number, dy: number) => {
        const L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
        return `M${P([e[0] - ux * 2.4 - uy * 0.6, e[1] - uy * 2.4 + ux * 0.6])}L${P([e[0] - uy * 1.7, e[1] + ux * 1.7])}L${P([e[0] + uy * 1.7, e[1] - ux * 1.7])}L${P([e[0] - ux * 2.4 + uy * 0.6, e[1] - uy * 2.4 - ux * 0.6])}Z`;
      };
      pipes.appendChild(s('path', { d: bell(a1, 19, 14) + bell(a2, 21.5, 6.5), fill: INK }));
      this.head.appendChild(pipes);
      front.appendChild(s('path', { d: upper([15.5, -33], [23, -31.5]) + fore([23, -31.5], [38.2, -39.4]), ...arm }));
      front.appendChild(s('path', { d: upper([17, -30.5], [23, -25.5]), ...arm }));
      this.handBase = 'translate(23 -25.5)';
      this.hand.appendChild(s('path', { d: fore([0, 0], [10.6, -12.6]), ...arm }));
      front.appendChild(this.hand);
    }
    this.hand.setAttribute('transform', this.handBase);

    this.body = s('g', { class: 'siren__body' });
    this.body.append(this.farWing, this.tail, legs, bodyG, this.wing, this.head, front);
    this.g.append(this.body);
    this.setPose({ wing: 0, farWing: 14 });
  }

  private place(): void {
    const k = this.scale;
    this.g.setAttribute('transform', `translate(${f1(this.x)} ${f1(this.y)}) scale(${f1(k * this.facing * 100) / 100} ${f1(k * 100) / 100}) rotate(${f1(this.pose?.pitch ?? 0)})`);
  }

  /** Where the song leaves the lips, in the coordinates of `space`. */
  mouthIn(space: SVGGraphicsElement): Vec {
    const m = space.getCTM()?.inverse().multiply(this.mouth.getCTM() ?? new DOMMatrix());
    if (!m) return [this.x, this.y - 40 * this.scale];
    return [m.e + m.a * MOUTH[0] + m.c * MOUTH[1], m.f + m.b * MOUTH[0] + m.d * MOUTH[1]];
  }

  /** Set the animated angles (degrees) in one call. */
  setPose(p: SirenPose): void {
    Object.assign(this.pose, p);
    const q = this.pose;
    const [sx, sy] = Siren.SHOULDER;
    this.wing.setAttribute('transform', `translate(${sx} ${sy}) rotate(${f1(q.wing)})`);
    this.farWing.setAttribute('transform', `translate(${sx - 3} ${sy - 1}) rotate(${f1(q.farWing)})`);
    this.head.setAttribute('transform', `rotate(${f1(q.head)} ${Siren.NECK[0]} ${Siren.NECK[1]})`);
    this.tail.setAttribute('transform', `rotate(${f1(q.tail)} ${Siren.TAIL[0]} ${Siren.TAIL[1]})`);
    this.body.setAttribute('transform', `translate(0 ${f1(q.bob)})`);
    this.hand.setAttribute('transform', `${this.handBase} rotate(${f1(q.hand)})`);
    if (p.pitch !== undefined) this.place();
  }

  /** Close (1) or open (0) the eye. */
  shut(v: number): void {
    this.eye.setAttribute('opacity', String(1 - v));
    this.lid.setAttribute('opacity', String(v));
  }
}

/** The archaic sickle wing, pivot at 0,0, rising back and up with a curled tip. */
function wingShape(k: number, near: boolean): SVGGElement {
  const g = s('g');
  const w = band(
    [[3, 2], [-5, -8], [-13, -18], [-21, -28], [-27, -38], [-29, -47], [-25, -54]].map(([x, y]) => [x * k, y * k] as Vec),
    [[0, 15 * k], [0.25, 15 * k], [0.55, 12.5 * k], [0.82, 8 * k], [1, 3 * k]],
    48,
  );
  g.appendChild(s('path', { d: w.outline, fill: INK, stroke: CLAY, 'stroke-width': near ? 1 : 0.8, 'paint-order': 'stroke', 'stroke-linejoin': 'round' }));
  if (!near) {
    let d = w.line(0.05, 0.1, 0.94, 8);
    for (let i = 0; i < 7; i++) {
      const t = 0.2 + i * 0.1;
      d += `M${P(w.at(t, 0.1))}L${P(w.at(Math.min(0.99, t + 0.1), 0.96))}`;
    }
    g.appendChild(s('path', { d, fill: 'none', stroke: CLAY, 'stroke-width': 0.5 }));
    return g;
  }
  // Coverts: scale rows near the leading edge (u < 0).
  let d = '';
  for (let row = 0; row < 3; row++) {
    const u = -0.8 + row * 0.27;
    for (let t = 0.07 + (row % 2) * 0.035; t < 0.46; t += 0.07) {
      const a = w.at(t, u), b = w.at(t + 0.07, u), m = w.at(t + 0.035, u + 0.24);
      d += `M${P(a)}Q${P(m)} ${P(b)}`;
    }
  }
  g.appendChild(s('path', { d, fill: 'none', stroke: CLAY, 'stroke-width': 0.5, 'stroke-linecap': 'round' }));
  // Added-purple band between coverts and primaries.
  const bandPts: Vec[] = [];
  for (let i = 0; i <= 10; i++) bandPts.push(w.at(0.05 + i * 0.052, 0.0));
  for (let i = 10; i >= 0; i--) bandPts.push(w.at(0.05 + i * 0.052, 0.26));
  g.appendChild(s('path', { d: smoothPath(bandPts, true, 0.2), fill: PURPLE }));
  // Primaries: long feathers sweeping to the trailing edge and the tip.
  let pr = w.line(0.3, 0.52, 0.96, 8);
  for (let i = 0; i < 10; i++) {
    const t = 0.08 + i * 0.088;
    const a = w.at(Math.min(0.95, t), 0.3), b = w.at(Math.min(0.99, t + 0.13), 0.98);
    pr += `M${P(a)}L${P(b)}`;
  }
  g.appendChild(s('path', { d: pr, fill: 'none', stroke: CLAY, 'stroke-width': 0.55, 'stroke-linecap': 'round' }));
  return g;
}

/** A chelys lyre: tortoise-shell box, two curving arms, yoke and strings. Box centre at 0,0; arms rise to y ≈ -17. */
function lyreShape(): SVGGElement {
  const g = s('g', { class: 'lyre' });
  // Ribbon hanging from the arm (added purple).
  g.appendChild(s('path', { d: 'M-5.6 -11C-8 -8 -8.6 -4 -7.4 0M-5.2 -10.6C-6.4 -7 -6 -3.6 -4.8 -1.4', fill: 'none', stroke: PURPLE, 'stroke-width': 1, 'stroke-linecap': 'round' }));
  g.appendChild(s('path', { d: 'M-4.6 -2C-7.2 -9 -6.4 -14 -3 -17.4L-1.6 -16.6C-4.4 -13 -4.8 -9 -2.8 -3ZM4.6 -2C7.2 -9 6.4 -14 3 -17.4L1.6 -16.6C4.4 -13 4.8 -9 2.8 -3Z', fill: INK }));
  g.appendChild(s('path', { d: 'M-4.8 -15.4L4.8 -15.4', stroke: INK, 'stroke-width': 1.3, 'stroke-linecap': 'round' }));
  g.appendChild(s('ellipse', { cx: 0, cy: 0, rx: 5.6, ry: 4.4, fill: INK, stroke: CLAY, 'stroke-width': 0.6, 'paint-order': 'stroke' }));
  g.appendChild(s('path', { d: 'M-3.6 -1.6Q0 -3.4 3.6 -1.6M-4 1.2Q0 3 4 1.2M-1.4 -3.8V3.8M1.4 -3.8V3.8', fill: 'none', stroke: CLAY, 'stroke-width': 0.45 }));
  let st = '';
  for (let i = 0; i < 5; i++) {
    const x = -2 + i;
    st += `M${x} -1L${f1(x * 1.5)} -15.2`;
  }
  g.appendChild(s('path', { d: st, stroke: INK, 'stroke-width': 0.3 }));
  return g;
}

/* ------------------------------------------------------------------ */
/* Bones of the drowned                                                */
/* ------------------------------------------------------------------ */

/** A long bone (added white) centred at x,y. */
export function bone(x: number, y: number, angle = 0, len = 9): SVGPathElement {
  const h = len / 2;
  const d =
    `M${-h + 1} -0.8L${h - 1} -0.8A1.3 1.3 0 1 1 ${h} 0A1.3 1.3 0 1 1 ${h - 1} 0.8L${-h + 1} 0.8` +
    `A1.3 1.3 0 1 1 ${-h} 0A1.3 1.3 0 1 1 ${-h + 1} -0.8Z`;
  return s('path', { d, fill: WHITE, stroke: INK, 'stroke-width': 0.4, transform: `translate(${f1(x)} ${f1(y)}) rotate(${f1(angle)})` });
}

/** A skull in profile (added white), facing +x unless `facing` is -1. */
export function skull(x: number, y: number, k = 1, facing: 1 | -1 = 1): SVGGElement {
  const g = s('g', { transform: `translate(${f1(x)} ${f1(y)}) scale(${f1(k * facing * 100) / 100} ${f1(k * 100) / 100})` });
  g.appendChild(s('path', { d: 'M-5 1C-6.4 -3.6 -3.4 -7 0.6 -6.8C4.4 -6.6 6.4 -3.6 5.6 -0.6L6 1.4L4.4 2.2L4.4 3.6L1.2 3.8L0.6 2.4L-2.6 2.6C-4 2.6 -4.8 2 -5 1Z', fill: WHITE, stroke: INK, 'stroke-width': 0.4 }));
  g.appendChild(s('circle', { cx: 2.6, cy: -1.6, r: 1.3, fill: INK }));
  g.appendChild(s('path', { d: 'M4.8 1L4.9 1.1M1.8 3L1.8 3.8M3 3L3 3.8', stroke: INK, 'stroke-width': 0.45 }));
  return g;
}
