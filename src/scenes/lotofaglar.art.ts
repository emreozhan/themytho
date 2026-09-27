/**
 * Art for Ζʹ Lotofaglar — the shore of the Lotus-eaters.
 *
 * The lotus is drawn the way Greek painters borrowed it from Egypt: a bell of
 * sepals in profile with a tall central petal (inner petals in added purple),
 * closed buds, and round fruit in added purple. The date palm has an incised,
 * scaled trunk, a fan of feathered fronds and hanging clusters of dates.
 */
import { s } from '../lib/dom';
import { ribbon, smoothPath, type Vec } from '../lib/geometry';
import { rng, range } from '../lib/random';
import { INK, CLAY, WHITE, PURPLE } from '../art/figure';

const f1 = (v: number) => (Math.round(v * 10) / 10).toString();

/** A lotus flower in profile, base at the origin, opening upwards. */
function lotusFlower(k = 1): SVGGElement {
  const g = s('g', { class: 'lot-flower', transform: `scale(${k})` });
  // Outer sepals curling outwards.
  g.appendChild(s('path', { d: 'M-1.8 -5.6C-7 -6.6 -10.6 -11.6 -9.6 -19.4C-8.6 -15.4 -6.2 -11.4 -0.8 -9.4Z M1.8 -5.6C7 -6.6 10.6 -11.6 9.6 -19.4C8.6 -15.4 6.2 -11.4 0.8 -9.4Z', fill: INK }));
  // Inner petals in added purple.
  g.appendChild(s('path', { d: 'M-1.2 -8C-4.4 -11 -5.2 -16 -4 -20.6C-2.4 -16.4 -1.2 -12.6 0 -9.4Z M1.2 -8C4.4 -11 5.2 -16 4 -20.6C2.4 -16.4 1.2 -12.6 0 -9.4Z', fill: PURPLE, stroke: INK, 'stroke-width': 0.5 }));
  // Central petal and calyx.
  g.appendChild(s('path', { d: 'M-1.7 -8C-2.4 -14 -1.2 -20.4 0 -25C1.2 -20.4 2.4 -14 1.7 -8Z', fill: INK }));
  g.appendChild(s('path', { d: 'M-3.4 0C-4.6 -3 -3.6 -5.8 -1.8 -7.2H1.8C3.6 -5.8 4.6 -3 3.4 0Z', fill: INK }));
  g.appendChild(s('path', { d: 'M-2.8 -3.4H2.8', stroke: CLAY, 'stroke-width': 0.6 }));
  return g;
}

function lotusBud(k = 1): SVGGElement {
  const g = s('g', { class: 'lot-bud', transform: `scale(${k})` });
  g.appendChild(s('path', { d: 'M-2.6 0C-4.2 -6 -1.2 -12 0 -15.5C1.2 -12 4.2 -6 2.6 0Z', fill: INK }));
  g.appendChild(s('path', { d: 'M0 -14V-7', stroke: PURPLE, 'stroke-width': 1 }));
  return g;
}

export interface LotusParts {
  g: SVGGElement;
  /** Flower and bud heads, each pivoting at its stem tip (for nodding). */
  heads: SVGGElement[];
}

/**
 * A clump of lotus: tall stems with flowers and buds, lanceolate leaves at the
 * foot and clusters of round purple fruit along the stems.
 */
export function lotusPlant(x: number, groundY: number, h = 80, seed = 3, flip = 1): LotusParts {
  const rand = rng(seed);
  const g = s('g', { class: 'lot-plant', transform: `translate(${f1(x)} ${f1(groundY)}) scale(${flip} 1)` });
  const heads: SVGGElement[] = [];
  // Leaves at the foot.
  let leaves = '';
  for (const [a, L] of [[-62, 18], [-30, 24], [34, 22], [66, 16], [-8, 14]] as Array<[number, number]>) {
    const r = (a * Math.PI) / 180;
    const tip: Vec = [Math.sin(r) * L, -Math.cos(r) * L];
    const mid: Vec = [tip[0] * 0.5, tip[1] * 0.5];
    const n: Vec = [-tip[1] / L * 3.4, tip[0] / L * 3.4];
    leaves += `M0 0Q${f1(mid[0] + n[0])} ${f1(mid[1] + n[1])} ${f1(tip[0])} ${f1(tip[1])}Q${f1(mid[0] - n[0])} ${f1(mid[1] - n[1])} 0 0Z`;
  }
  g.appendChild(s('path', { d: leaves, fill: INK }));
  // Stems: the tallest in the middle, the others leaning out.
  const stems: Array<[number, number, 'flower' | 'bud']> = [
    [0, h, 'flower'],
    [-h * 0.2, h * 0.72, 'bud'],
    [h * 0.22, h * 0.84, 'flower'],
    [-h * 0.3, h * 0.5, 'flower'],
  ];
  let stemD = '';
  let fruitD = '';
  let stalkD = '';
  for (const [dx, sh, kind] of stems) {
    const top: Vec = [dx, -sh];
    const c1: Vec = [dx * 0.2 + range(rand, -3, 3), -sh * 0.45];
    const pts: Vec[] = [[0, 0], c1, [dx * 0.8, -sh * 0.8], top];
    stemD += smoothPath(pts);
    const head = s('g', { class: 'lot-head', transform: `translate(${f1(top[0])} ${f1(top[1])})` });
    const inner = kind === 'flower' ? lotusFlower(range(rand, 1.05, 1.35)) : lotusBud(range(rand, 1, 1.2));
    const tilt = s('g', { transform: `rotate(${f1(dx * 0.35)})` });
    tilt.appendChild(inner);
    head.appendChild(tilt);
    heads.push(tilt);
    g.appendChild(head);
    // Round fruit hanging from short stalks halfway up.
    const n = kind === 'bud' ? 2 : 3;
    for (let i = 0; i < n; i++) {
      const t = range(rand, 0.34, 0.66);
      const sx = dx * t * 0.9, sy = -sh * t;
      const side = i % 2 ? 1 : -1;
      const fx = sx + side * range(rand, 4, 7), fy = sy + range(rand, 2, 5);
      stalkD += `M${f1(sx)} ${f1(sy)}Q${f1((sx + fx) / 2)} ${f1(sy - 2)} ${f1(fx)} ${f1(fy - 2)}`;
      const r = range(rand, 2.2, 2.9);
      fruitD += `M${f1(fx - r)} ${f1(fy)}a${f1(r)} ${f1(r)} 0 1 0 ${f1(r * 2)} 0a${f1(r)} ${f1(r)} 0 1 0 ${f1(-r * 2)} 0Z`;
    }
  }
  g.insertBefore(s('path', { d: stemD, fill: 'none', stroke: INK, 'stroke-width': 1.5, 'stroke-linecap': 'round' }), g.firstChild);
  g.appendChild(s('path', { d: stalkD, fill: 'none', stroke: INK, 'stroke-width': 0.8 }));
  g.appendChild(s('path', { d: fruitD, fill: PURPLE, stroke: INK, 'stroke-width': 0.7 }));
  return { g, heads };
}

export interface PalmParts {
  g: SVGGElement;
  /** The crown (fronds and dates), pivoting at the top of the trunk. */
  crown: SVGGElement;
  top: Vec;
}

/** A date palm: scaled trunk, feathered fronds, hanging clusters of dates. */
export function datePalm(x: number, groundY: number, h = 180, seed = 8): PalmParts {
  const rand = rng(seed);
  const g = s('g', { class: 'lot-palm', transform: `translate(${f1(x)} ${f1(groundY)})` });
  const spine: Vec[] = [[0, 0], [-3, -h * 0.3], [3, -h * 0.62], [8, -h]];
  g.appendChild(s('path', { d: ribbon(spine, [[0, 13], [0.15, 10], [1, 7]], 40), fill: INK }));
  // The scaled bark, incised as stacked chevrons.
  let bark = '';
  for (let i = 1; i < 17; i++) {
    const t = i / 17.5;
    const y = -h * t;
    const cx = t < 0.3 ? -3 * (t / 0.3) : t < 0.62 ? -3 + 6 * ((t - 0.3) / 0.32) : 3 + 5 * ((t - 0.62) / 0.38);
    const w = 5.5 - t * 2;
    bark += `M${f1(cx - w)} ${f1(y + 2.2)}L${f1(cx)} ${f1(y - 0.8)}L${f1(cx + w)} ${f1(y + 2.2)}`;
  }
  g.appendChild(s('path', { d: bark, fill: 'none', stroke: CLAY, 'stroke-width': 0.7, opacity: 0.85 }));
  const top: Vec = [8, -h];
  const crown = s('g', { class: 'lot-palm__crown', transform: `translate(${f1(top[0])} ${f1(top[1])})` });
  const sway = s('g', { class: 'lot-palm__sway' });
  crown.appendChild(sway);
  // Hanging dates under the crown.
  let dates = '';
  for (const [cx, cy, n] of [[-9, 8, 9], [10, 6, 8]] as Array<[number, number, number]>) {
    for (let i = 0; i < n; i++) {
      const dx = cx + range(rand, -4.5, 4.5), dy = cy + range(rand, 0, 12) + Math.abs(dx - cx) * 0.3;
      dates += `M${f1(dx - 2)} ${f1(dy)}a2 2.4 0 1 0 4 0a2 2.4 0 1 0 -4 0Z`;
    }
  }
  sway.appendChild(s('path', { d: `M-9 0Q-10 6 -9 10M10 0Q11 5 10 8`, stroke: INK, 'stroke-width': 1.4, fill: 'none' }));
  sway.appendChild(s('path', { d: dates, fill: PURPLE, stroke: INK, 'stroke-width': 0.6 }));
  // Feathered fronds fanning out and drooping at the tips.
  const fronds = s('g');
  const angles = [-172, -150, -128, -108, -88, -68, -48, -28, -8, 14, 196];
  for (const a0 of angles) {
    const a = ((a0 + range(rand, -5, 5)) * Math.PI) / 180;
    const L = range(rand, 46, 60) * (Math.abs(Math.sin(a)) > 0.8 ? 0.82 : 1);
    const droop = 0.5 + Math.abs(Math.cos(a)) * 0.9;
    const p0: Vec = [0, 0];
    const p1: Vec = [Math.cos(a) * L * 0.5, Math.sin(a) * L * 0.5 - 4];
    const p2: Vec = [Math.cos(a) * L, Math.sin(a) * L + L * 0.36 * droop];
    const pts: Vec[] = [p0, p1, p2];
    fronds.appendChild(s('path', { d: ribbon(pts, [[0, 3.2], [0.6, 2], [1, 0.4]], 20), fill: INK }));
    // Leaflets along both sides of the rib.
    let lf = '';
    for (let i = 2; i < 12; i++) {
      const t = i / 12;
      const u = 1 - t;
      const px = u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0];
      const py = u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1];
      const tx = 2 * u * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]);
      const ty = 2 * u * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]);
      const tl = Math.hypot(tx, ty) || 1;
      const nx = -ty / tl, ny = tx / tl;
      const len = 9 * Math.sin(t * Math.PI) + 3;
      for (const sgn of [1, -1]) {
        const ex = px + (nx * sgn * 0.8 + (tx / tl) * 0.55) * len;
        const ey = py + (ny * sgn * 0.8 + (ty / tl) * 0.55) * len + len * 0.25;
        lf += `M${f1(px)} ${f1(py)}Q${f1((px + ex) / 2 + nx * sgn)} ${f1((py + ey) / 2 + ny * sgn)} ${f1(ex)} ${f1(ey)}`;
      }
    }
    fronds.appendChild(s('path', { d: lf, fill: 'none', stroke: INK, 'stroke-width': 1.3, 'stroke-linecap': 'round' }));
  }
  sway.insertBefore(fronds, sway.firstChild);
  g.appendChild(crown);
  return { g, crown: sway, top: [x + top[0], groundY + top[1]] };
}

/** A shallow basket (kanoun) heaped with purple lotus fruit. */
export function fruitBasket(k = 1): SVGGElement {
  const g = s('g', { class: 'lot-basket', transform: `scale(${k})` });
  let fruit = '';
  for (const [x, y] of [[-7, -4], [-2.5, -5.6], [2.5, -5.4], [7, -4], [-4.5, -8.4], [0.5, -9.2], [5, -8]] as Vec[]) fruit += `M${x - 2.6} ${y}a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0Z`;
  g.appendChild(s('path', { d: fruit, fill: PURPLE, stroke: INK, 'stroke-width': 0.6 }));
  g.appendChild(s('path', { d: 'M-12 -3.2H12L9 2.6H-9Z', fill: INK }));
  g.appendChild(s('path', { d: 'M-9.5 -0.6H9.5', stroke: CLAY, 'stroke-width': 0.6 }));
  return g;
}

/** A sprig of lotus fruit, held at the origin. */
export function fruitSprig(k = 1): SVGGElement {
  const g = s('g', { class: 'lot-sprig', transform: `scale(${k})` });
  g.appendChild(s('path', { d: 'M0 0Q4 -6 10 -9M5 -5Q9 -3 12 -3M7 -7Q8 -12 11 -14', fill: 'none', stroke: INK, 'stroke-width': 1 }));
  g.appendChild(s('path', { d: 'M3 -9Q6 -12 9 -10Q6 -8 3 -9Z', fill: INK }));
  let fruit = '';
  for (const [x, y] of [[10.5, -9.5], [12.5, -2.6], [11.5, -14.5], [14.5, -8]] as Vec[]) fruit += `M${x - 2.2} ${y}a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0Z`;
  g.appendChild(s('path', { d: fruit, fill: PURPLE, stroke: INK, 'stroke-width': 0.6 }));
  return g;
}

/** A single round lotus fruit (held to the lips). */
export function fruit(r = 2.6): SVGCircleElement {
  return s('circle', { r, fill: PURPLE, stroke: INK, 'stroke-width': 0.6, class: 'lot-fruit' });
}

/** The herald's staff (kerykeion), grip at the origin, pointing up. */
export function kerykeion(len = 46): SVGGElement {
  const g = s('g', { class: 'lot-kerykeion' });
  g.appendChild(s('path', { d: `M0 ${len * 0.4}V${-len * 0.6}`, stroke: INK, 'stroke-width': 1.6, 'stroke-linecap': 'round' }));
  g.appendChild(s('path', { d: `M0 ${-len * 0.6}C-5 ${-len * 0.6 - 2} -5 ${-len * 0.6 - 8} 0 ${-len * 0.6 - 7}C5 ${-len * 0.6 - 8} 5 ${-len * 0.6 - 14} 0 ${-len * 0.6 - 14}`, fill: 'none', stroke: INK, 'stroke-width': 1.4 }));
  return g;
}

/** White tears for the weeping men. */
export function tear(): SVGPathElement {
  return s('path', { d: 'M0 -1.6C0.9 -0.4 1.2 0.4 1.2 1C1.2 1.8 0.6 2.4 0 2.4S-1.2 1.8 -1.2 1C-1.2 0.4 -0.9 -0.4 0 -1.6Z', fill: WHITE, class: 'lot-tear' });
}
