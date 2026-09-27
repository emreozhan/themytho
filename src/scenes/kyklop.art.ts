/**
 * Art for Θʹ Kyklop — Polyphemos's cave.
 *
 * The cave is painted as a cross-section: a black rock mass with incised
 * strata around a clay hollow, the doorway on the right where daylight comes
 * in. Props (cheese baskets, milk pails, a wattle pen), the hearth, the door
 * boulder, the olive-wood stake, the great cup and Poseidon's trident follow
 * the black-figure rules: glaze, incision, added white and purple only.
 */
import { s } from '../lib/dom';
import { ribbon, smoothPath, type Vec } from '../lib/geometry';
import { rng, range } from '../lib/random';
import { INK, CLAY, WHITE, PURPLE } from '../art/figure';

export const GROUND = 96;

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

/** A rough seat of rock, outlined so a black figure sitting on it stays legible. */
export function seatRock(pts: Vec[]): SVGGElement {
  const g = s('g', { class: 'kyk-seat' });
  g.appendChild(s('path', { d: smoothPath(pts, true, 0.3), fill: INK, stroke: CLAY, 'stroke-width': 1.4, 'paint-order': 'stroke' }));
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  let d = '';
  for (let i = 1; i <= 3; i++) {
    const y = y0 + ((y1 - y0) * i) / 4;
    d += `M${(x0 + (x1 - x0) * 0.2).toFixed(1)} ${y.toFixed(1)}q${((x1 - x0) * 0.3).toFixed(1)} ${i % 2 ? -3 : 3} ${((x1 - x0) * 0.6).toFixed(1)} 0`;
  }
  g.appendChild(s('path', { d, fill: 'none', stroke: CLAY, 'stroke-width': 0.8, opacity: 0.7 }));
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
