/**
 * Art for Skylla and Kharybdis.
 *
 * Skylla: six long serpentine necks (ribbons) out of a cave, each ending in a
 * snarling dog's head with rows of added-white teeth. Necks are posed by a few
 * control points so they can writhe, strike and lift.
 *
 * Kharybdis: concentric running-wave rings (the vase painter's wave scroll bent
 * round), alternating clay-on-black and black-on-clay, each turning at its own
 * speed around a black gullet. Above it, the fig tree on its rock.
 */
import { s } from '../lib/dom';
import { ribbon, sampleSpline, smoothPath, type Vec } from '../lib/geometry';
import { waveRing } from '../art/ornaments';
import { INK, CLAY, WHITE, PURPLE } from '../art/figure';
import { band } from './sirenler.art';

const f1 = (v: number) => Math.round(v * 10) / 10;

/* ------------------------------------------------------------------ */
/* A dog's head for Skylla                                             */
/* ------------------------------------------------------------------ */

export class DogHead {
  readonly g: SVGGElement;
  readonly jaw: SVGGElement;
  readonly inner: SVGGElement;
  /** Jaw opening in degrees. */
  open = 10;

  constructor(k = 1) {
    this.g = s('g', { class: 'skylla-head' });
    this.inner = s('g', { transform: `scale(${k})` });
    const inc = { stroke: CLAY, 'stroke-width': 0.8, 'paint-order': 'stroke', 'stroke-linejoin': 'round' };
    // Pointed ear (far one first).
    this.inner.appendChild(s('path', { d: 'M1 -6L1.4 -15.5L6.4 -8Z', fill: INK, ...inc }));
    // Lower jaw with teeth and a lolling purple tongue; hinges near the mouth corner.
    this.jaw = s('g', { class: 'skylla-head__jaw' });
    this.jaw.appendChild(s('path', { d: 'M12 3.4C15 6.6 16.4 9 15.4 10.6C14 11.6 12.6 10.6 11.8 9C11 7.4 10.4 5.6 10 4.2Z', fill: PURPLE }));
    this.jaw.appendChild(s('path', { d: 'M5.4 1.4L19.4 4.4C21 4.8 21.2 6.4 19.8 7.2L9.6 7.8C6.8 7.8 4.6 6.2 3.8 3.8Z', fill: INK, ...inc }));
    this.jaw.appendChild(s('path', { d: 'M7.6 2.2L8.8 0.2L10 2.6L11.3 0.6L12.5 3L13.8 1.1L15 3.4L16.3 1.6L17.4 3.9L18.6 2.4L19.4 4.4Z', fill: WHITE, stroke: INK, 'stroke-width': 0.3 }));
    this.inner.appendChild(this.jaw);
    // Skull and long upper jaw.
    this.inner.appendChild(s('path', {
      d: 'M-3 -3.6C-1 -8 4 -10.2 9.6 -9.2C12.6 -8.6 15 -7.2 18 -6.2L23 -4.6C24.8 -4 25 -2.2 23.8 -1.4L21.2 -0.4L8 1.6C5 2.2 3 3.4 1.8 5.4C0 6.2 -2.4 5.4 -3.4 3.4Z',
      fill: INK, ...inc,
    }));
    // Upper teeth.
    this.inner.appendChild(s('path', { d: 'M8.4 1.5L9.4 3.5L10.6 1.3L11.8 3.2L13 1L14.2 2.9L15.4 0.8L16.6 2.6L17.8 0.5L19 2.2L20.2 0.1L21.2 1.4L21.2 -0.4Z', fill: WHITE, stroke: INK, 'stroke-width': 0.3 }));
    // Near ear, eye, brow, nostril, wrinkles of the snarl.
    this.inner.appendChild(s('path', { d: 'M3.6 -7.2L5.8 -16.6L9.6 -8.2Z', fill: INK, ...inc }));
    this.inner.appendChild(s('path', { d: 'M5.4 -9.4L6.2 -13.6', stroke: CLAY, 'stroke-width': 0.5 }));
    this.inner.appendChild(s('path', { d: 'M10 -5.6Q12.2 -7.6 14.4 -5.4Q12.2 -4.2 10 -5.6Z', fill: WHITE, stroke: INK, 'stroke-width': 0.3 }));
    this.inner.appendChild(s('circle', { cx: 12.5, cy: -5.4, r: 0.9, fill: INK }));
    this.inner.appendChild(s('path', {
      d: 'M9.4 -7.6Q12 -9.4 15.2 -7M16 -4.4Q17.4 -2.6 16.4 -1.2M18 -4.6Q19.4 -3 18.6 -1.6M22.6 -3.4h.1M-1.6 -1.2Q0.6 1.6 -0.4 4',
      fill: 'none', stroke: CLAY, 'stroke-width': 0.5, 'stroke-linecap': 'round',
    }));
    this.g.appendChild(this.inner);
    this.setJaw(this.open);
  }

  setJaw(deg: number): void {
    this.open = deg;
    this.jaw.setAttribute('transform', `rotate(${f1(deg)} 5.2 1.8)`);
  }

  /** Place the head at p, pointing along angle a (degrees); flips so the jaw stays below. */
  place(p: Vec, a: number): void {
    const flip = Math.cos((a * Math.PI) / 180) < 0;
    this.g.setAttribute('transform', `translate(${f1(p[0])} ${f1(p[1])}) rotate(${f1(a)}) scale(1 ${flip ? -1 : 1})`);
  }
}

/* ------------------------------------------------------------------ */
/* A neck: control points → a writhing ribbon with an incised spine    */
/* ------------------------------------------------------------------ */

export interface NeckSpec {
  /** Root in the cave, then control points of the idle pose (last = head). */
  pts: Vec[];
  width?: number;
  phase?: number;
}

export class Neck {
  readonly g: SVGGElement;
  readonly body: SVGPathElement;
  readonly spine: SVGPathElement;
  readonly head: DogHead;
  readonly idle: Vec[];
  readonly width: number;
  readonly phase: number;
  /** Blend toward `alt` (0..1) — used for strikes and lifts. */
  mix = 0;
  alt: Vec[];
  /** Writhing amplitude multiplier. */
  wild = 1;
  /** Current head position/angle (after render). */
  tip: Vec = [0, 0];
  angle = 0;

  constructor(spec: NeckSpec, headScale = 1) {
    this.idle = spec.pts.map((p) => [...p] as Vec);
    this.alt = spec.pts.map((p) => [...p] as Vec);
    this.width = spec.width ?? 8;
    this.phase = spec.phase ?? 0;
    this.g = s('g', { class: 'skylla-neck' });
    this.body = s('path', { fill: INK, stroke: CLAY, 'stroke-width': 0.9, 'paint-order': 'stroke', 'stroke-linejoin': 'round' });
    this.spine = s('path', { fill: 'none', stroke: CLAY, 'stroke-width': 0.5, 'stroke-linecap': 'round' });
    this.head = new DogHead(headScale);
    this.g.append(this.body, this.spine, this.head.g);
  }

  /** Recompute the ribbon for time t; `reach` < 1 draws it only partly out of its root. */
  render(t: number, reach = 1): void {
    const n = this.idle.length;
    const pts: Vec[] = [];
    const r0 = this.idle[0];
    for (let i = 0; i < n; i++) {
      const a = this.idle[i], b = this.alt[i];
      const x = r0[0] + (a[0] + (b[0] - a[0]) * this.mix - r0[0]) * reach;
      const y = r0[1] + (a[1] + (b[1] - a[1]) * this.mix - r0[1]) * reach;
      // Writhe: a travelling wave that grows toward the head, calmer at the root.
      const w = (i / (n - 1)) ** 1.2 * this.wild;
      const ph = t * 1.7 + this.phase - i * 0.9;
      pts.push([x + Math.sin(ph) * 7 * w, y + Math.cos(ph * 0.8) * 5 * w]);
    }
    const spline = sampleSpline(pts, 24);
    const W = this.width;
    const widths: Array<[number, number]> = [[0, W * 1.25], [0.5, W], [0.9, W * 0.8], [1, W * 0.75]];
    this.body.setAttribute('d', ribbon(pts, widths, 40));
    // Incised belly band with a ladder of cross-lines, the painters' serpent convention.
    const b = band(pts, widths, 30);
    const up = b.at(0.5, 0)[1] < b.at(0.5, 1)[1] ? 1 : -1;
    let d = b.line(0.2 * up, 0.08, 0.93, 16) + b.line(0.72 * up, 0.08, 0.93, 16);
    const rungs = Math.round(b.total / 3.6);
    for (let i = 1; i < rungs; i++) {
      const u = 0.08 + (0.85 * i) / rungs;
      const p = b.at(u, 0.2 * up), q = b.at(u, 0.72 * up);
      d += `M${f1(p[0])} ${f1(p[1])}L${f1(q[0])} ${f1(q[1])}`;
    }
    this.spine.setAttribute('d', d);
    const tip = spline[spline.length - 1];
    const pre = spline[spline.length - 3];
    this.tip = tip;
    this.angle = (Math.atan2(tip[1] - pre[1], tip[0] - pre[0]) * 180) / Math.PI;
    this.head.place(tip, this.angle);
  }

  /** Where the jaws are (a little in front of the neck tip), for carrying prey. */
  jaws(): Vec {
    const a = (this.angle * Math.PI) / 180;
    const k = 12;
    return [this.tip[0] + Math.cos(a) * k, this.tip[1] + Math.sin(a) * k];
  }
}

/* ------------------------------------------------------------------ */
/* Kharybdis                                                           */
/* ------------------------------------------------------------------ */

export interface Whirl {
  g: SVGGElement;
  rings: SVGGElement[];
  /** Relative spin speed per ring (inner rings faster). */
  speeds: number[];
}

/** Concentric wave rings around a black gullet, centred at 0,0 (radius r). */
export function whirlpool(r: number): Whirl {
  const g = s('g', { class: 'kharybdis' });
  const rings: SVGGElement[] = [];
  const speeds: number[] = [];
  const bands = 5;
  const inner = r * 0.16;
  const step = (r - inner) / bands;
  for (let i = 0; i < bands; i++) {
    const ro = r - i * step, ri = ro - step;
    const clayGround = i % 2 === 1;
    const ringG = s('g', { class: 'kharybdis__ring' });
    // Annulus ground (clay rings are reserved; black rings are the sea).
    const annulus = `M${-ro} 0A${ro} ${ro} 0 1 0 ${ro} 0A${ro} ${ro} 0 1 0 ${-ro} 0ZM${-ri} 0A${ri} ${ri} 0 1 1 ${ri} 0A${ri} ${ri} 0 1 1 ${-ri} 0Z`;
    ringG.appendChild(s('path', { d: annulus, fill: clayGround ? CLAY : INK, 'fill-rule': 'evenodd' }));
    const waves = waveRing({ rOuter: ro - step * 0.12, rInner: ri + step * 0.12, units: Math.max(7, Math.round(((ro + ri) * Math.PI) / (step * 2.1))), color: clayGround ? INK : CLAY });
    ringG.appendChild(waves);
    g.appendChild(ringG);
    rings.push(ringG);
    speeds.push(1 + i * 0.55);
  }
  // Gullet with a white churn of foam.
  g.appendChild(s('circle', { r: inner + 0.5, fill: INK }));
  let sp = '';
  for (let a = 0; a < 540; a += 20) {
    const rr = (inner * 0.85 * a) / 540;
    const x = Math.cos((a * Math.PI) / 180) * rr, y = Math.sin((a * Math.PI) / 180) * rr;
    sp += `${a ? 'L' : 'M'}${f1(x)} ${f1(y)}`;
  }
  const spiral = s('path', { d: sp, fill: 'none', stroke: CLAY, 'stroke-width': 0.9, 'stroke-linecap': 'round', class: 'kharybdis__gullet' });
  const gulletG = s('g');
  gulletG.appendChild(spiral);
  g.appendChild(gulletG);
  rings.push(gulletG);
  speeds.push(4);
  // A rim of foam dots (added white).
  let foam = '';
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    const rr = r + 2 + (i % 3) * 1.2;
    foam += `M${f1(Math.cos(a) * rr)} ${f1(Math.sin(a) * rr)}h.1`;
  }
  const foamRing = s('path', { d: foam, stroke: WHITE, 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: 0.8 });
  const foamG = s('g');
  foamG.appendChild(foamRing);
  g.insertBefore(foamG, g.firstChild);
  rings.push(foamG);
  speeds.push(0.6);
  return { g, rings, speeds };
}

/* ------------------------------------------------------------------ */
/* The fig tree on Kharybdis's rock                                    */
/* ------------------------------------------------------------------ */

const LEAF = 'M0 0C-2.6 -1.4 -5.6 -0.6 -7.2 -3.2C-5.4 -4.4 -4.6 -6.4 -5.6 -9.2C-2.8 -8.6 -1.4 -11.2 0 -13.6C1.4 -11.2 2.8 -8.6 5.6 -9.2C4.6 -6.4 5.4 -4.4 7.2 -3.2C5.6 -0.6 2.6 -1.4 0 0Z';

/** A fig tree whose trunk leans from `base` toward `crown`; leaves big and lobed, figs in purple. */
export function figTree(base: Vec, crown: Vec, seed = 3): SVGGElement {
  const g = s('g', { class: 'fig-tree' });
  const mid: Vec = [(base[0] + crown[0]) / 2 + 10, (base[1] + crown[1]) / 2 + 4];
  g.appendChild(s('path', { d: ribbon([base, mid, crown], [[0, 8], [0.6, 5], [1, 2.6]], 30), fill: INK }));
  // Boughs.
  const boughs: Vec[][] = [
    [mid, [mid[0] - 14, mid[1] - 20], [crown[0] - 26, crown[1] - 10]],
    [[crown[0] + 4, crown[1] + 8], [crown[0] + 18, crown[1] - 6], [crown[0] + 22, crown[1] - 22]],
    [crown, [crown[0] - 6, crown[1] - 16], [crown[0] - 2, crown[1] - 30]],
  ];
  for (const b of boughs) g.appendChild(s('path', { d: ribbon(b, [[0, 3.4], [1, 1.2]], 18), fill: INK }));
  // Leaves along the boughs and around the crown.
  let r = seed;
  const rand = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  const leaves = s('g');
  const spots: Vec[] = [];
  for (const b of boughs) for (const p of sampleSpline(b, 5).slice(1)) spots.push(p);
  for (let i = 0; i < 22; i++) {
    const a = rand() * Math.PI * 2, rr = Math.sqrt(rand());
    spots.push([crown[0] + Math.cos(a) * rr * 34, crown[1] - 14 + Math.sin(a) * rr * 22]);
  }
  let veins = '';
  for (const [x, y] of spots) {
    const ang = (rand() - 0.5) * 120;
    const k = 0.95 + rand() * 0.45;
    leaves.appendChild(s('path', { d: LEAF, fill: INK, stroke: CLAY, 'stroke-width': 0.6, 'paint-order': 'stroke', transform: `translate(${f1(x)} ${f1(y)}) rotate(${f1(ang)}) scale(${f1(k * 100) / 100})` }));
    const a = ((ang - 90) * Math.PI) / 180;
    veins += `M${f1(x)} ${f1(y)}L${f1(x + Math.cos(a) * 10 * k)} ${f1(y + Math.sin(a) * 10 * k)}`;
  }
  g.appendChild(leaves);
  g.appendChild(s('path', { d: veins, stroke: CLAY, 'stroke-width': 0.45, opacity: 0.9 }));
  // Figs.
  let figs = '';
  for (let i = 0; i < 7; i++) {
    const x = crown[0] + (rand() - 0.5) * 40, y = crown[1] - 4 - rand() * 22;
    figs += `M${f1(x)} ${f1(y - 2.6)}C${f1(x + 2.4)} ${f1(y - 1)} ${f1(x + 2)} ${f1(y + 2.2)} ${f1(x)} ${f1(y + 2.2)}C${f1(x - 2)} ${f1(y + 2.2)} ${f1(x - 2.4)} ${f1(y - 1)} ${f1(x)} ${f1(y - 2.6)}Z`;
  }
  g.appendChild(s('path', { d: figs, fill: PURPLE, stroke: INK, 'stroke-width': 0.4 }));
  return g;
}

/** Smooth closed outline helper (re-exported for the scene's rocks). */
export const outline = (pts: Vec[]) => smoothPath(pts, true, 0.2);
