/**
 * Ogygia in black-figure: Kalypso's cave in a wooded hill, her great loom,
 * black poplars, the logs and the raft, and the stars Odysseus steered by —
 * the Pleiades (Ülker) and the Bear (Büyükayı).
 */
import { s } from '../lib/dom';
import { ribbon, smoothPath, type Vec } from '../lib/geometry';
import { rng, range } from '../lib/random';
import { INK, CLAY, WHITE, PURPLE } from '../art/figure';

const inc = (d: string, w = 0.7, color = CLAY, op = 1) =>
  s('path', { d, fill: 'none', stroke: color, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: op });

/** Outline of the wooded hill (tondo space) with the cave mouth cut out (even-odd). */
export const HILL: Vec[] = [
  [-200, 90], [-200, -76], [-170, -84], [-140, -94], [-104, -92], [-74, -80], [-52, -58], [-40, -26], [-32, 10], [-24, 50], [-12, 90],
];
export const CAVE: Vec[] = [
  [-152, 90], [-152, 40], [-146, -4], [-130, -40], [-104, -58], [-78, -50], [-62, -22], [-52, 20], [-50, 90],
];

export function hill(): { g: SVGGElement; hollow: SVGPathElement; rock: SVGPathElement } {
  const g = s('g', { class: 'kalypso-hill' });
  const hollow = s('path', { d: smoothPath(CAVE, true, 0.35), fill: '#a9542a' });
  const rock = s('path', { d: smoothPath(HILL, true, 0.3) + smoothPath(CAVE, true, 0.35), fill: INK, 'fill-rule': 'evenodd' });
  g.append(hollow, rock);
  // Incised strata of the rock.
  g.appendChild(inc('M-198 -50q10 4 22 -2M-196 -20q8 5 20 -1M-198 20q10 4 24 -3M-46 -14q-6 10 -2 20M-36 26q-5 8 0 18M-130 -78q14 -4 30 2M-86 -74q12 3 20 12', 0.8, CLAY, 0.7));
  return { g, hollow, rock };
}

/**
 * A warp-weighted loom: two uprights, a cloth beam, warp threads weighted at
 * the bottom, and the woven web (purple, with a white meander border).
 * Standing on (0, 0), about 92 tall. `web` grows with scaleY from the top.
 */
export function loom(): { g: SVGGElement; web: SVGGElement; weights: SVGGElement } {
  const g = s('g', { class: 'kalypso-loom' });
  // Uprights leaning back against the cave wall.
  g.appendChild(s('path', { d: 'M-22 0L-17 -92M22 0L17 -92', stroke: INK, 'stroke-width': 2.6, 'stroke-linecap': 'round' }));
  g.appendChild(s('path', { d: 'M-21 -88H21', stroke: INK, 'stroke-width': 3.4, 'stroke-linecap': 'round' }));
  g.appendChild(s('circle', { cx: -19, cy: -88, r: 2.6, fill: INK }));
  g.appendChild(s('circle', { cx: 19, cy: -88, r: 2.6, fill: INK }));
  // Warp threads.
  let warp = '';
  for (let x = -15; x <= 15; x += 2.5) warp += `M${x} -86L${x * 0.94 + (x > 0 ? 0.6 : -0.6)} -20`;
  g.appendChild(s('path', { d: warp, stroke: INK, 'stroke-width': 0.5 }));
  // Shed rod and heddle bar.
  g.appendChild(s('path', { d: 'M-19 -48H19M-19 -40H19', stroke: INK, 'stroke-width': 1.4, 'stroke-linecap': 'round' }));
  const weights = s('g', { class: 'kalypso-loom__weights' });
  let wd = '';
  for (let x = -14; x <= 14; x += 4) wd += `M${x - 1.5} -21L${x + 1.5} -21L${x + 2.2} -14L${x - 2.2} -14Z`;
  weights.appendChild(s('path', { d: wd, fill: INK }));
  g.appendChild(weights);
  // The web: woven from the cloth beam down.
  const web = s('g', { class: 'kalypso-loom__web' });
  web.appendChild(s('rect', { x: -16, y: -86, width: 32, height: 30, fill: PURPLE, stroke: INK, 'stroke-width': 0.6 }));
  let key = '';
  for (let x = -14; x < 14; x += 6) key += `M${x} -80h4v-3h-2v1.4`;
  web.appendChild(s('path', { d: key, fill: 'none', stroke: WHITE, 'stroke-width': 0.6 }));
  let dots = '';
  for (let x = -12; x <= 12; x += 6) for (let y = -74; y <= -62; y += 6) dots += `M${x - 0.8} ${y}a0.8 0.8 0 1 0 1.6 0a0.8 0.8 0 1 0 -1.6 0`;
  web.appendChild(s('path', { d: dots, fill: WHITE }));
  web.appendChild(s('path', { d: 'M-16 -58H16', stroke: WHITE, 'stroke-width': 0.6 }));
  g.appendChild(web);
  return { g, web, weights };
}

/** A black poplar: a tall, narrow crown of fluttering leaves. */
export function blackPoplar(x: number, ground: number, h = 130, seed = 2): SVGGElement {
  const g = s('g', { class: 'kalypso-poplar', transform: `translate(${x} ${ground})` });
  const w = h * 0.12;
  g.appendChild(s('path', { d: ribbon([[0, 0], [1, -h * 0.35], [0, -h * 0.9]], [[0, 4], [0.4, 2.4], [1, 0.8]], 20), fill: INK }));
  // A dark core so the crown reads as one mass, then a fringe of leaves.
  g.appendChild(s('path', { d: `M0 ${-h}C${w} ${-h * 0.82} ${w * 1.2} ${-h * 0.48} ${w * 0.8} ${-h * 0.24}Q0 ${-h * 0.18} ${-w * 0.8} ${-h * 0.24}C${-w * 1.2} ${-h * 0.48} ${-w} ${-h * 0.82} 0 ${-h}Z`, fill: INK }));
  const rand = rng(seed);
  let d = '';
  for (let i = 0; i < 90; i++) {
    const t = rand();
    const yy = -h * (0.22 + 0.76 * t);
    const half = w * 1.1 * Math.sin(Math.min(1, (1 - t) * 1.25) * Math.PI * 0.9) + 1.5;
    const side = rand() < 0.5 ? -1 : 1;
    const xx = side * range(rand, half * 0.55, half * 1.1);
    const a = side * range(rand, 0.4, 1.2) - Math.PI / 2;
    const L = range(rand, 4.5, 7.5);
    const ex = xx + Math.cos(a) * L, ey = yy + Math.sin(a) * L;
    d += `M${xx.toFixed(1)} ${yy.toFixed(1)}Q${((xx + ex) / 2 - Math.sin(a) * 2.2).toFixed(1)} ${((yy + ey) / 2 + Math.cos(a) * 2.2).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}Q${((xx + ex) / 2 + Math.sin(a) * 2.2).toFixed(1)} ${((yy + ey) / 2 - Math.cos(a) * 2.2).toFixed(1)} ${xx.toFixed(1)} ${yy.toFixed(1)}Z`;
  }
  g.appendChild(s('path', { d, fill: INK }));
  let veins = '';
  for (let i = 1; i < 9; i++) {
    const yy = -h * (0.26 + i * 0.08);
    const ww = w * (0.3 + 0.5 * Math.sin((i / 9) * Math.PI));
    veins += `M${(-ww).toFixed(1)} ${(yy + 2.4).toFixed(1)}q${ww.toFixed(1)} -4 ${(ww * 2).toFixed(1)} 0`;
  }
  g.appendChild(inc(veins, 0.6, CLAY, 0.7));
  return g;
}

/** A felled log lying on its side: bark with incised lines, a clay end showing the rings. Centre-left end at the origin. */
export function log(len = 36, r = 3.4): SVGGElement {
  const g = s('g', { class: 'kalypso-log' });
  g.appendChild(s('path', { d: `M0 ${-r}H${len}A${r * 0.6} ${r} 0 0 1 ${len} ${r}H0Z`, fill: INK }));
  g.appendChild(s('ellipse', { cx: 0, cy: 0, rx: r * 0.6, ry: r, fill: CLAY, stroke: INK, 'stroke-width': 0.7 }));
  g.appendChild(s('ellipse', { cx: 0, cy: 0, rx: r * 0.3, ry: r * 0.55, fill: 'none', stroke: INK, 'stroke-width': 0.5 }));
  g.appendChild(inc(`M${len * 0.2} ${-r * 0.4}h${len * 0.2}M${len * 0.5} ${r * 0.3}h${len * 0.25}M${len * 0.7} ${-r * 0.5}h${len * 0.14}`, 0.55, CLAY, 0.8));
  // A stub of a lopped branch.
  g.appendChild(s('path', { d: `M${len * 0.62} ${-r}l2.4 -3.2l1.6 0.6l-1.4 2.6Z`, fill: INK }));
  return g;
}

/** A double-bladed bronze axe (grip at the origin, haft along +x, blades at the end). */
export function doubleAxe(): SVGGElement {
  const g = s('g', { class: 'labrys' });
  g.appendChild(s('path', { d: 'M-6 0H22', stroke: INK, 'stroke-width': 1.6, 'stroke-linecap': 'round' }));
  g.appendChild(s('path', { d: 'M20 -1C17 -5 17 -9 19 -11C22 -9 24 -8 24 -1ZM20 1C17 5 17 9 19 11C22 9 24 8 24 1Z', fill: INK }));
  g.appendChild(inc('M19.4 -9.6Q21 -6 22.6 -2M19.4 9.6Q21 6 22.6 2', 0.5));
  return g;
}

/** A shore rock to sit on, resting on y = 0. */
export function shoreRock(w = 34, h = 16): SVGGElement {
  const g = s('g', { class: 'kalypso-rock' });
  g.appendChild(s('path', { d: smoothPath([[-w / 2, 0], [-w / 2 + 3, -h * 0.7], [-w / 6, -h], [w / 5, -h * 0.94], [w / 2 - 2, -h * 0.6], [w / 2, 0]], true, 0.3), fill: INK }));
  g.appendChild(inc(`M${-w / 3} ${-h * 0.45}q${w / 4} -3 ${w / 2} 1M${-w / 5} ${-h * 0.18}q${w / 5} -2 ${w / 2.5} 0.6`, 0.7, CLAY, 0.7));
  return g;
}

/** A sea-crow in flight (wings as a gull's M), centred on the origin; `wings` flap by scaleY. */
export function flyingBird(): { g: SVGGElement; wings: SVGPathElement } {
  const g = s('g', { class: 'kalypso-bird' });
  const wings = s('path', { d: 'M-12 -2C-8 -8 -3 -7 0 -1C3 -7 8 -8 12 -2C8 -5 4 -3 1 1H-1C-4 -3 -8 -5 -12 -2Z', fill: INK });
  g.appendChild(wings);
  g.appendChild(s('path', { d: 'M-1.4 0C-1 -1.4 1 -1.6 2.4 -0.6L4.4 -0.2L2.4 0.8C1 1.8 -1 1.4 -1.4 0Z', fill: INK }));
  return { g, wings };
}

/** Star rosette path (four long, four short points), as painted in added white. */
export function starPath(x: number, y: number, r: number): string {
  let d = '';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const R = i % 2 ? r * 0.55 : r;
    const a1 = a - 0.32, a2 = a + 0.32;
    d += `M${x.toFixed(1)} ${y.toFixed(1)}L${(x + Math.cos(a1) * r * 0.26).toFixed(2)} ${(y + Math.sin(a1) * r * 0.26).toFixed(2)}L${(x + Math.cos(a) * R).toFixed(2)} ${(y + Math.sin(a) * R).toFixed(2)}L${(x + Math.cos(a2) * r * 0.26).toFixed(2)} ${(y + Math.sin(a2) * r * 0.26).toFixed(2)}Z`;
  }
  return d;
}

/** The Pleiades: a tight little cluster of seven stars around (0,0). */
export const PLEIADES: Array<[number, number, number]> = [
  [0, 0, 2.6], [5.4, -2.6, 2.2], [9.6, 1.4, 2.4], [4.2, 4.4, 2], [-4.2, 3.6, 1.8], [12.6, -3.2, 1.7], [7.4, 7.8, 1.6],
];
/** The Great Bear's seven stars (the Plough / Büyükayı): bowl then handle. */
export const BEAR: Array<[number, number, number]> = [
  [0, 0, 3], [2, 14, 3], [22, 16, 2.8], [26, 3, 3], [40, -4, 2.8], [52, -8, 2.8], [66, -4, 3],
];
