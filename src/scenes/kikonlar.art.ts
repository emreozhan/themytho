/**
 * Art for Ε′ Kikonlar that the shared kit lacks: the Thracian fox-skin cap
 * (alopekis) and crescent shield (pelta), a laurel wreath in added purple,
 * a column-krater, a spit over a fire, a feaster's himation and an archaic
 * horse. All black-figure: glaze silhouettes, clay incisions, sparse white
 * and purple.
 */
import { s, attr, r1 } from '../lib/dom';
import { limb, ribbon, smoothPath, type Vec } from '../lib/geometry';
import { Figure, INK, CLAY, WHITE, PURPLE, type FigureStyle, type Pose } from '../art/figure';

const d2r = Math.PI / 180;
const f1 = (v: number) => r1(v).toString();
const pt = (p: Vec) => `${f1(p[0])} ${f1(p[1])}`;

/** A Figure that redraws extra gear (caps, wreaths, drapes) whenever it is posed. */
export class Dressed extends Figure {
  private gear: Array<(f: Dressed) => void> = [];
  constructor(style: FigureStyle, p: Pose) {
    super(style, p);
  }
  /** Add a redraw hook (called now and after every render). */
  wear(fn: (f: Dressed) => void): this {
    this.gear.push(fn);
    fn(this);
    return this;
  }
  override render(): void {
    super.render();
    // The base constructor renders before our fields exist.
    if (this.gear) for (const fn of this.gear) fn(this);
  }
}

/** Maps head-local coordinates (as in Figure.renderHead) to the figure's pose space. */
export function headFrame(f: Figure): (x: number, y: number) => Vec {
  const j = f.joints();
  const [cx, cy] = j.HC;
  const a = j.headAngle * d2r;
  const k = f.style.head === 'giant' || f.style.head === 'cyclops' ? 1.25 : 1;
  return (x, y) => [cx + x * k * Math.cos(a) - y * k * Math.sin(a), cy + x * k * Math.sin(a) + y * k * Math.cos(a)];
}

/** Thracian fox-skin cap with a lappet down the nape. */
export function alopekis(color = INK): (f: Dressed) => void {
  let cap: SVGPathElement | null = null;
  let fur: SVGPathElement | null = null;
  return (f) => {
    if (!cap) {
      cap = s('path', { fill: color, stroke: CLAY, 'stroke-width': 0.9, 'paint-order': 'stroke', 'stroke-linejoin': 'round' });
      fur = s('path', { fill: 'none', stroke: CLAY, 'stroke-width': 0.55, 'stroke-linecap': 'round' });
      f.g.append(cap, fur);
    }
    const T = headFrame(f);
    const P = (x: number, y: number) => pt(T(x, y));
    attr(cap, {
      d:
        `M${P(6.6, -4.4)}C${P(7.4, -9.4)} ${P(4.4, -14.6)} ${P(-1.6, -17.4)}` +
        `C${P(-4.4, -18.8)} ${P(-7.2, -17.6)} ${P(-6.2, -14.8)}` +
        `C${P(-9.6, -11)} ${P(-10.2, -5)} ${P(-9.6, 1)}L${P(-10.6, 11.6)}` +
        `C${P(-8.4, 13.2)} ${P(-5.6, 12.8)} ${P(-4.8, 11.4)}L${P(-4.4, 3.2)}` +
        `C${P(-5.4, -1)} ${P(-3.6, -4.6)} ${P(0.4, -5.8)}C${P(3, -6.4)} ${P(5.2, -5.6)} ${P(6.6, -4.4)}Z`,
    });
    let d = '';
    for (const [x, y] of [[-2, -12], [-5.6, -8], [1.6, -9.4], [-7.4, -2], [-7.6, 4.2]] as Vec[]) d += `M${P(x, y)}L${P(x + 1.4, y + 1.6)}`;
    attr(fur!, { d: d + `M${P(-6.4, -14.4)}C${P(-3.2, -14.6)} ${P(1, -12)} ${P(4.4, -8.2)}` });
  };
}

/** A laurel wreath in added purple around the brow. */
export function laurel(): (f: Dressed) => void {
  let g: SVGPathElement | null = null;
  return (f) => {
    if (!g) {
      g = s('path', { fill: PURPLE, stroke: INK, 'stroke-width': 0.35 });
      f.g.appendChild(g);
    }
    const T = headFrame(f);
    let d = '';
    // Leaves sprout forward and upward from a band running round the crown.
    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      const bx = -7.6 + t * 12.8;
      const by = -3.2 - Math.sin(t * Math.PI) * 4.6 - t * 1.2;
      const ang = -150 + t * 95; // leaf direction in head space (deg, 0 = +x)
      const L = 4.4 - Math.abs(t - 0.5) * 1.6;
      const ax = Math.cos(ang * d2r), ay = Math.sin(ang * d2r);
      const tip: Vec = [bx + ax * L, by + ay * L];
      const side = 1.25;
      const m1: Vec = [bx + ax * L * 0.5 - ay * side, by + ay * L * 0.5 + ax * side];
      const m2: Vec = [bx + ax * L * 0.5 + ay * side, by + ay * L * 0.5 - ax * side];
      d += `M${pt(T(bx, by))}Q${pt(T(...m1))} ${pt(T(...tip))}Q${pt(T(...m2))} ${pt(T(bx, by))}Z`;
    }
    // The band itself.
    const band: Vec[] = [];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      band.push(T(-7.6 + t * 12.8, -3.2 - Math.sin(t * Math.PI) * 4.6 - t * 1.2));
    }
    d += ribbon(band, [[0, 1.1], [1, 0.9]], 12);
    attr(g, { d });
  };
}

/** A feaster's himation wrapped round hips and thighs (added purple with incised folds). */
export function himation(color = PURPLE): (f: Dressed) => void {
  let cloth: SVGPathElement | null = null;
  let folds: SVGPathElement | null = null;
  return (f) => {
    if (!cloth) {
      cloth = s('path', { fill: color, stroke: CLAY, 'stroke-width': 0.9, 'paint-order': 'stroke', 'stroke-linejoin': 'round' });
      folds = s('path', { fill: 'none', stroke: INK, 'stroke-width': 0.6, 'stroke-linecap': 'round', opacity: 0.75 });
      // Under the front arm, over everything else.
      const armF = f.g.querySelector('g')!.lastElementChild!.previousElementSibling!;
      f.g.querySelector('g')!.insertBefore(cloth, armF);
      f.g.querySelector('g')!.insertBefore(folds, armF);
    }
    const j = f.joints();
    const { u, fwd } = j;
    const at = (t: number, side: number): Vec => [j.P[0] + u[0] * 30 * t + fwd[0] * side, j.P[1] + u[1] * 30 * t + fwd[1] * side];
    const kF = j.legF.K, kB = j.legB.K;
    const aF = j.legF.A;
    const knee: Vec = [(kF[0] + kB[0]) / 2, (kF[1] + kB[1]) / 2];
    const shin: Vec = [kF[0] + (aF[0] - kF[0]) * 0.55, kF[1] + (aF[1] - kF[1]) * 0.55];
    const pts: Vec[] = [
      at(0.42, -7.5), at(0.44, 6.2), at(0.12, 8.6),
      [kB[0] + 1, kB[1] - 4.6], [kB[0] + 4, kB[1] + 1.2],
      [shin[0] + 2, shin[1] - 3.2], [shin[0] + 1.6, shin[1] + 3.6],
      [knee[0] - 4, knee[1] + 5.6], at(-0.16, -2), at(0.08, -8.4),
    ];
    attr(cloth, { d: smoothPath(pts, true, 0.32) });
    let d = '';
    for (let i = 0; i < 4; i++) {
      const a = at(0.34 - i * 0.07, -5 + i * 2.2);
      const b: Vec = [knee[0] - 6 + i * 3.4, knee[1] + 2.4 - i * 0.4];
      d += `M${pt(a)}Q${pt([(a[0] + b[0]) / 2 + 1.5, (a[1] + b[1]) / 2 + 3])} ${pt(b)}`;
    }
    attr(folds!, { d });
  };
}

/** Thracian crescent shield (pelta), centred at c, horns up. */
export function pelta(r = 12, device = true): SVGGElement {
  const g = s('g', { class: 'pelta' });
  const hy = -r * 0.34;
  const d =
    `M${f1(-r)} ${f1(hy)}A${f1(r)} ${f1(r * 0.98)} 0 0 0 ${f1(r)} ${f1(hy)}` +
    `Q${f1(r * 0.52)} ${f1(r * 0.02)} ${f1(r * 0.16)} ${f1(-r * 0.06)}L0 ${f1(-r * 0.3)}L${f1(-r * 0.16)} ${f1(-r * 0.06)}` +
    `Q${f1(-r * 0.52)} ${f1(r * 0.02)} ${f1(-r)} ${f1(hy)}Z`;
  g.appendChild(s('path', { d, fill: INK, stroke: CLAY, 'stroke-width': 0.9, 'paint-order': 'stroke' }));
  const k = 0.8;
  g.appendChild(
    s('path', {
      d: `M${f1(-r * k)} ${f1(hy * 0.4)}A${f1(r * k)} ${f1(r * k * 0.98)} 0 0 0 ${f1(r * k)} ${f1(hy * 0.4)}`,
      fill: 'none',
      stroke: CLAY,
      'stroke-width': 0.6,
    }),
  );
  if (device) {
    let dots = '';
    for (let i = 0; i < 5; i++) {
      const a = (200 + i * 35) * d2r;
      const x = Math.cos(a) * r * 0.58, y = -Math.sin(a) * r * 0.58 + r * 0.02;
      dots += `M${f1(x - 0.9)} ${f1(y)}a0.9 0.9 0 1 0 1.8 0a0.9 0.9 0 1 0 -1.8 0`;
    }
    g.appendChild(s('path', { d: dots, fill: WHITE }));
  }
  return g;
}

/** A column-krater (mixing bowl) standing on its foot at (0,0); ~34 tall at k=1. */
export function krater(k = 1): SVGGElement {
  const g = s('g', { class: 'krater', transform: `scale(${k})` });
  g.appendChild(
    s('path', {
      d: 'M-6 0L-5 -3C-12 -6 -17 -14 -16 -22C-15.6 -25 -13 -27 -11.4 -28L-12 -31H-15.6V-34H15.6V-31H12L11.4 -28C13 -27 15.6 -25 16 -22C17 -14 12 -6 5 -3L6 0Z',
      fill: INK,
    }),
  );
  // Column handles rising from the shoulder to the rim plates.
  g.appendChild(s('path', { d: 'M-15 -24L-17.2 -24L-17.2 -34H-14.6M15 -24L17.2 -24L17.2 -34H14.6', fill: 'none', stroke: INK, 'stroke-width': 1.5 }));
  // Incised shoulder band with tongues, a purple ground stripe.
  g.appendChild(s('path', { d: 'M-15 -23H15M-16 -19.5H16', fill: 'none', stroke: CLAY, 'stroke-width': 0.6 }));
  let tongues = '';
  for (let x = -13; x <= 13; x += 3.25) tongues += `M${f1(x - 1.3)} -23Q${f1(x)} -19 ${f1(x + 1.3)} -23`;
  g.appendChild(s('path', { d: tongues, fill: 'none', stroke: CLAY, 'stroke-width': 0.45 }));
  g.appendChild(s('path', { d: 'M-15.2 -11.6Q0 -9.6 15.2 -11.6', fill: 'none', stroke: PURPLE, 'stroke-width': 2 }));
  g.appendChild(s('path', { d: 'M-8 -2.4Q0 -0.9 8 -2.4', fill: 'none', stroke: CLAY, 'stroke-width': 0.5 }));
  return g;
}

/** An oinochoe (wine jug), foot at (0,0), ~16 tall. */
export function oinochoe(k = 1): SVGGElement {
  const g = s('g', { class: 'oinochoe', transform: `scale(${k})` });
  g.appendChild(s('path', { d: 'M-3.4 0C-7 -3 -7.4 -8 -5 -11C-4 -12.2 -3 -12.8 -2.8 -14L-4.6 -16.2L-1 -15.4L3 -16.6L2.6 -14C3 -12.6 4.2 -12 5.2 -10.6C7.4 -7.6 6.6 -2.6 3.4 0Z', fill: INK }));
  g.appendChild(s('path', { d: 'M2.8 -15.4C7.6 -16 8.4 -11 5.4 -8.6', fill: 'none', stroke: INK, 'stroke-width': 1.2 }));
  g.appendChild(s('path', { d: 'M-5.6 -7.4Q0 -6.2 5.8 -7.4', fill: 'none', stroke: CLAY, 'stroke-width': 0.5 }));
  return g;
}

/** A cooking fire under a spit of meat on two forked sticks; `flame` is returned for flickering. */
export function roast(k = 1): { g: SVGGElement; spit: SVGGElement } {
  const g = s('g', { class: 'roast', transform: `scale(${k})` });
  // Forked uprights.
  g.appendChild(s('path', { d: 'M-17 0L-16 -19M-16 -19L-18.6 -23M-16 -19L-13.8 -23M17 0L16 -19M16 -19L18.6 -23M16 -19L13.8 -23', fill: 'none', stroke: INK, 'stroke-width': 1.5, 'stroke-linecap': 'round' }));
  // Logs.
  g.appendChild(s('path', { d: 'M-11 0L9 -3.6L10 -1.4L-10 2Z M-9 -3.4L11 0.6L10 2.6L-10 -1.4Z', fill: INK }));
  const spit = s('g', { class: 'spit' });
  spit.appendChild(s('path', { d: 'M-21 -20.6H21', stroke: INK, 'stroke-width': 1.1, 'stroke-linecap': 'round' }));
  let meat = '';
  for (const x of [-9, -3, 3, 9]) meat += `M${x - 2.4} -20.6C${x - 2.6} -24.2 ${x + 2.6} -24.6 ${x + 2.6} -20.6C${x + 2.8} -17 ${x - 2.4} -16.8 ${x - 2.4} -20.6Z`;
  spit.appendChild(s('path', { d: meat, fill: PURPLE, stroke: INK, 'stroke-width': 0.5 }));
  g.appendChild(spit);
  return { g, spit };
}

/* ------------------------------------------------------------------ */
/* The horse                                                           */
/* ------------------------------------------------------------------ */

export interface HorsePose {
  /** Gait phase 0..1. */
  phase: number;
  /** 0 = walk, 1 = gallop. */
  gallop: number;
  /** Neck raise in degrees. */
  neck: number;
}

/**
 * An archaic horse, facing +x, hooves on y = 0: long thin legs, arched neck,
 * incised mane, long tail. Roughly 80 long and 70 high (ears).
 */
export class Horse {
  readonly g: SVGGElement;
  readonly back: Vec = [2, -46];
  pose: HorsePose = { phase: 0, gallop: 0, neck: 0 };
  private far: SVGPathElement;
  private near: SVGPathElement;
  private head: SVGGElement;
  private tail: SVGPathElement;

  constructor(color = INK, inc = CLAY) {
    this.g = s('g', { class: 'horse' });
    this.far = s('path', { fill: color, stroke: inc, 'stroke-width': 0.9, 'paint-order': 'stroke' });
    this.tail = s('path', { fill: color });
    const body = s('path', {
      d: smoothPath([[-30, -36], [-24, -46], [-6, -47], [12, -46], [26, -46], [32, -38], [30, -28], [20, -24], [0, -25], [-18, -24], [-29, -28]], true, 0.36),
      fill: color,
      stroke: inc,
      'stroke-width': 1.1,
      'paint-order': 'stroke',
    });
    this.head = s('g', { class: 'horse__head' });
    // Neck and head in one silhouette, pivoting at the withers.
    this.head.appendChild(
      s('path', {
        d: smoothPath([[18, -44], [24, -56], [30, -66], [36, -72], [41, -71], [44, -64], [51, -51], [51, -47], [47, -46], [40, -54], [34, -50], [30, -36]], true, 0.3),
        fill: color,
      }),
    );
    // Ears, forelock, mane (incised strands), eye, bridle in added purple.
    this.head.appendChild(s('path', { d: 'M37.6 -71.2L36.4 -77.4L40 -72.2ZM40.6 -70.6L41 -76.6L42.6 -70.2Z', fill: color }));
    this.head.appendChild(
      s('path', {
        d: ribbon([[36, -72.4], [30.6, -68.6], [25.6, -60], [21, -51], [17.4, -44]], [[0, 3.2], [0.5, 5.4], [1, 4.4]], 24),
        fill: color,
        stroke: inc,
        'stroke-width': 0.8,
        'paint-order': 'stroke',
      }),
    );
    let mane = '';
    for (let i = 0; i < 7; i++) {
      const t = i / 7;
      const x = 33.6 - t * 15, y = -69 + t * 23;
      mane += `M${f1(x)} ${f1(y)}l${f1(-2.8)} ${f1(1.2)}`;
    }
    this.head.appendChild(s('path', { d: mane, fill: 'none', stroke: inc, 'stroke-width': 0.55, 'stroke-linecap': 'round' }));
    this.head.appendChild(s('path', { d: 'M40.6 -63.2Q42 -64.6 43.4 -63.2Q42 -62.2 40.6 -63.2Z', fill: inc }));
    this.head.appendChild(s('path', { d: 'M49.6 -50.4L42.4 -58.4L39.2 -62.8M42.4 -58.4L36 -53.6', fill: 'none', stroke: PURPLE, 'stroke-width': 0.9 }));
    this.near = s('path', { fill: color, stroke: inc, 'stroke-width': 1.1, 'paint-order': 'stroke' });
    const details = s('path', { d: 'M22 -44Q18 -34 23 -26M-20 -44Q-14 -36 -22 -26M-2 -46Q0 -36 -3 -26', fill: 'none', stroke: inc, 'stroke-width': 0.6, opacity: 0.8 });
    this.g.append(this.far, this.tail, body, details, this.head, this.near);
    this.render();
  }

  set(p: Partial<HorsePose>): void {
    Object.assign(this.pose, p);
    this.render();
  }

  private leg(hip: Vec, phase: number, front: boolean): string {
    const { gallop } = this.pose;
    const a = Math.sin(phase * Math.PI * 2);
    const lift = Math.max(0, Math.cos(phase * Math.PI * 2));
    const reach = 7 + gallop * 9;
    // Hoof target, knee/hock placement.
    const hoof: Vec = [hip[0] + a * reach + (front ? 3 : -2), -lift * (3 + gallop * 9)];
    const mid: Vec = front
      ? [hip[0] + 2 + a * (reach * 0.55) + lift * gallop * 6, hip[1] + 14 - lift * gallop * 4]
      : [hip[0] - 5 + a * (reach * 0.45) - lift * gallop * 3, hip[1] + 13];
    const fet: Vec = [hoof[0] + (front ? -1 : 1) * (1 + lift * 2), hoof[1] - 5];
    const w = front ? 5.2 : 7.4;
    return (
      limb(hip, mid, [[0, w * 0.55, w * 0.55], [1, 2.1, 2.1]]) +
      limb(mid, fet, [[0, 2.1, 2.1], [0.5, 1.4, 1.4], [1, 1.6, 1.6]]) +
      limb(fet, hoof, [[0, 1.6, 1.6], [1, 1.7, 1.7]]) +
      `M${f1(hoof[0] - 1.8)} ${f1(hoof[1] - 2.6)}h3.8l0.9 2.6h-5.6Z`
    );
  }

  private render(): void {
    const p = this.pose.phase;
    const g = this.pose.gallop;
    this.near.setAttribute('d', this.leg([22, -30], p, true) + this.leg([-22, -32], p + 0.5 - g * 0.3, false));
    this.far.setAttribute('d', this.leg([19, -30], p + 0.5, true) + this.leg([-25, -32], p + g * 0.2, false));
    const sw = Math.sin(p * Math.PI * 2);
    this.tail.setAttribute(
      'd',
      ribbon([[-29, -40], [-35 - g * 4, -36 + g * 6], [-38 - g * 8, -24 + g * 8 + sw * 2], [-37 - g * 12, -8 + g * 10 + sw * 3]], [[0, 5], [0.4, 4.2], [1, 2.2]], 22),
    );
    this.head.setAttribute('transform', `rotate(${f1(-this.pose.neck + sw * (1.4 + g * 2))} 22 -42)`);
  }
}

/* ------------------------------------------------------------------ */
/* The walled town                                                     */
/* ------------------------------------------------------------------ */

export interface Fortress {
  g: SVGGElement;
  gateL: SVGPathElement;
  gateR: SVGPathElement;
  /** Incised bars across the closed gate (hide them when it opens). */
  studs: SVGPathElement;
}

/**
 * A small archaic town wall on groundline y: ashlar courses, crenellations,
 * a square tower, an arched gate with two clay-coloured leaves, roofs and a
 * little temple front showing above the wall.
 */
export function fortress(y: number, o: { from: number; to: number; height: number; gate: number; gateW: number; tower: number }): Fortress {
  const g = s('g', { class: 'kik-fortress' });
  const { from, to, height: H, gate: gx, gateW: gw, tower: tx } = o;
  const top = y - H;
  // Houses and the temple behind the wall.
  const back = s('g');
  back.appendChild(s('path', { d: `M${tx + 18} ${top}V${top - 16}L${tx + 32} ${top - 27}L${tx + 46} ${top - 16}V${top}Z`, fill: INK }));
  back.appendChild(s('path', { d: `M${tx + 21} ${top - 16}H${tx + 43}M${tx + 22.5} ${top - 14}V${top - 1}M${tx + 27.5} ${top - 14}V${top - 1}M${tx + 32.5} ${top - 14}V${top - 1}M${tx + 37.5} ${top - 14}V${top - 1}M${tx + 42} ${top - 14}V${top - 1}`, fill: 'none', stroke: CLAY, 'stroke-width': 0.7 }));
  back.appendChild(s('path', { d: `M${tx + 26} ${top - 18.2}L${tx + 32} ${top - 23.4}L${tx + 38} ${top - 18.2}Z`, fill: 'none', stroke: CLAY, 'stroke-width': 0.5 }));
  g.appendChild(back);
  // Wall body with crenellations.
  let d = `M${from} ${y + 60}V${top}`;
  for (let x = from; x < to; x += 10) d += `H${x + 1}v-5h6v5`;
  d += `H${to}V${y + 60}Z`;
  g.appendChild(s('path', { d, fill: INK }));
  // Tower.
  let t = `M${tx - 12} ${y}V${top - 22}`;
  for (let x = tx - 12; x < tx + 12; x += 8) t += `H${x + 1}v-5h5v5`;
  t += `H${tx + 12}V${y}Z`;
  g.appendChild(s('path', { d: t, fill: INK }));
  g.appendChild(s('path', { d: `M${tx - 2.5} ${top - 8}v-7h5v7zM${tx - 2.5} ${top + 12}v-7h5v7z`, fill: CLAY, opacity: 0.85 }));
  // Ashlar courses (incised).
  let lines = '';
  const rows = 7;
  for (let r = 1; r < rows; r++) {
    const yy = top + (r * H) / rows;
    lines += `M${from} ${r1(yy)}H${to}`;
    for (let x = from + (r % 2) * 6; x < to; x += 13) lines += `M${x} ${r1(yy)}v${r1(H / rows)}`;
  }
  g.appendChild(s('path', { d: lines, stroke: CLAY, 'stroke-width': 0.5, opacity: 0.5, fill: 'none' }));
  g.appendChild(s('path', { d: `M${tx - 12} ${top - 22}V${y}M${tx + 12} ${top - 22}V${y}`, stroke: CLAY, 'stroke-width': 0.7, opacity: 0.7 }));
  // Gate: dark opening, two leaves that can swing.
  const gh = H * 0.66;
  const x0 = gx - gw / 2, x1 = gx + gw / 2;
  g.appendChild(s('path', { d: `M${x0 - 2} ${y}V${y - gh + 6}Q${gx} ${y - gh - 8} ${x1 + 2} ${y - gh + 6}V${y}Z`, fill: 'none', stroke: CLAY, 'stroke-width': 0.8 }));
  g.appendChild(s('path', { d: `M${x0} ${y}V${y - gh + 6}Q${gx} ${y - gh - 6} ${x1} ${y - gh + 6}V${y}Z`, fill: '#2b1a10' }));
  const gateL = s('path', { d: `M${x0} ${y}V${y - gh + 6}Q${x0 + gw / 4} ${y - gh - 2} ${gx} ${y - gh - 3}V${y}Z`, fill: CLAY, stroke: INK, 'stroke-width': 0.9 });
  const gateR = s('path', { d: `M${gx} ${y}V${y - gh - 3}Q${x1 - gw / 4} ${y - gh - 2} ${x1} ${y - gh + 6}V${y}Z`, fill: CLAY, stroke: INK, 'stroke-width': 0.9 });
  g.append(gateL, gateR);
  let studs = '';
  for (const k of [0.3, 0.55, 0.8]) studs += `M${x0 + 2} ${r1(y - gh * k)}H${x1 - 2}`;
  const studPath = s('path', { d: studs, stroke: INK, 'stroke-width': 0.7, opacity: 0.7, 'pointer-events': 'none' });
  g.appendChild(studPath);
  return { g, gateL, gateR, studs: studPath };
}

/** Apollo's bronze tripod: a cauldron with ring handles on three legs; feet at (0,0), ~34 tall. */
export function tripod(k = 1): SVGGElement {
  const g = s('g', { class: 'tripod', transform: `scale(${k})` });
  g.appendChild(s('path', { d: 'M-12 -26C-12 -18 -7 -14 0 -14C7 -14 12 -18 12 -26Z', fill: INK }));
  g.appendChild(s('path', { d: 'M-13 -26.6H13', stroke: INK, 'stroke-width': 1.6 }));
  // Legs with lion feet, and a strut.
  g.appendChild(s('path', { d: 'M-10 -22L-15 0M10 -22L15 0M0 -14V0M-12.6 -9H12.6', fill: 'none', stroke: INK, 'stroke-width': 1.5, 'stroke-linecap': 'round' }));
  g.appendChild(s('path', { d: 'M-17.6 0h5l-1 -1.6h-3zM12.6 0h5l-1.4 -1.6h-3zM-2.4 0h4.8l-0.8 -1.6h-3.2z', fill: INK }));
  // Ring handles standing on the rim.
  g.appendChild(s('path', { d: 'M-9 -26.6A4.2 4.2 0 1 1 -9 -34.6A4.2 4.2 0 1 1 -9 -26.6M9 -26.6A4.2 4.2 0 1 1 9 -34.6A4.2 4.2 0 1 1 9 -26.6', fill: 'none', stroke: INK, 'stroke-width': 1.3 }));
  g.appendChild(s('path', { d: 'M-10 -21.5Q0 -18.5 10 -21.5', fill: 'none', stroke: CLAY, 'stroke-width': 0.6 }));
  return g;
}
