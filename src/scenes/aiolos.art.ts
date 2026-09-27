/**
 * Art for the Aiolos tondo: the ox-hide bag of the winds (askos), the bronze
 * rampart of the floating island, the island itself, and the shore of Ithaca
 * with its watch-fires.
 */
import { s } from '../lib/dom';
import { INK, CLAY, WHITE, PURPLE } from '../art/figure';
import { flames } from '../art/kit';
import { ribbon, smoothPath, type Vec } from '../lib/geometry';

const f1 = (v: number) => (Math.round(v * 10) / 10).toString();

export interface Askos {
  g: SVGGElement;
  /** The swelling hide (scale it about `centre` for the pulse). */
  body: SVGGElement;
  /** Cord and knot (the tap target lives here). */
  knot: SVGGElement;
  /** Loose cord ends that fly off when it is untied. */
  cordEnds: SVGPathElement[];
  /** The open mouth, hidden until the bag bursts. */
  mouth: SVGPathElement;
  /** Where the winds come out (local). */
  neck: Vec;
  centre: Vec;
  /** Swell factor (1 = at rest); `twist` in degrees. */
  pose(swell: number, squash?: number, twist?: number): void;
}

/**
 * The bag Aiolos stitched from the hide of a nine-year ox: a bulging sack with
 * the stumps of the legs, the neck bound with a silver cord (added white).
 * About 32 wide; the neck points up and to the right.
 */
export function askos(): Askos {
  const g = s('g', { class: 'askos' });
  const body = s('g', { class: 'askos__body' });
  const centre: Vec = [0, 0];
  // Hide, with an incised outline so it reads against black figures.
  const hide: Vec[] = [
    [-15, 3], [-13, -6], [-6, -11.5], [3, -11.5], [9, -8.5], [13.5, -2], [14, 5], [9.5, 10.5], [0, 12.5], [-9, 11], [-14, 8],
  ];
  const outline = { stroke: CLAY, 'stroke-width': 1.3, 'paint-order': 'stroke', 'stroke-linejoin': 'round' };
  // Leg stumps of the hide, tied off.
  body.appendChild(s('path', { d: ribbon([[-10, 9], [-13, 13], [-15, 16.5]], [[0, 5], [1, 3]], 10), fill: INK, ...outline }));
  body.appendChild(s('path', { d: ribbon([[6, 10], [8, 14], [9, 17.5]], [[0, 5], [1, 3]], 10), fill: INK, ...outline }));
  body.appendChild(s('path', { d: ribbon([[-12, -4], [-16.5, -6], [-20, -5]], [[0, 5], [1, 3]], 10), fill: INK, ...outline }));
  // Neck, rising to the tied mouth.
  body.appendChild(s('path', { d: ribbon([[6, -8], [9.5, -13], [12, -18.5]], [[0, 9], [0.6, 5.4], [1, 5]], 14), fill: INK, ...outline }));
  body.appendChild(s('path', { d: smoothPath(hide, true, 0.42), fill: INK, ...outline }));
  // Incised seam, hair of the hide and a band of added purple.
  body.appendChild(s('path', { d: 'M-12 -2C-6 -6 4 -6 11 -1', fill: 'none', stroke: PURPLE, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
  body.appendChild(s('path', { d: 'M-10 4C-4 7 4 7 10 3', fill: 'none', stroke: CLAY, 'stroke-width': 0.6, 'stroke-dasharray': '1.4 1.2' }));
  let hair = '';
  for (const [x, y] of [[-8, -8], [-3, -9.5], [2, -9], [-10, 7], [-4, 9.5], [3, 9.6], [8, 7]] as Vec[]) hair += `M${x} ${y}l1 1.4`;
  body.appendChild(s('path', { d: hair, stroke: CLAY, 'stroke-width': 0.55, 'stroke-linecap': 'round' }));
  // Gathered leather above the cord (the frill), and the mouth that opens.
  body.appendChild(s('path', { d: 'M10 -20.5C10.6 -23 12.6 -24.4 14.2 -23.2C15.6 -24.6 17.6 -23.4 17 -21C16 -19.6 13 -19 10 -20.5Z', fill: INK, ...outline }));
  const mouth = s('path', { d: 'M9.6 -21.4C11 -26 17 -27 19.4 -23C17 -21.4 13 -20.6 9.6 -21.4Z', fill: '#2b1a10', stroke: INK, 'stroke-width': 0.8, opacity: 0 });
  body.appendChild(mouth);
  g.appendChild(body);
  // Silver cord: turns round the neck, a knot and trailing ends.
  const knot = s('g', { class: 'askos__knot' });
  knot.appendChild(s('circle', { cx: 12.4, cy: -17.8, r: 8, fill: '#000', opacity: 0 }));
  knot.appendChild(s('path', { d: 'M8.6 -15.2L14.8 -17.4M9.2 -17L15.2 -19.2M9.8 -18.8L15.4 -20.8', stroke: WHITE, 'stroke-width': 1.3, 'stroke-linecap': 'round' }));
  knot.appendChild(s('path', { d: 'M15.4 -19C18.4 -21.6 20.6 -19.4 18.4 -17.6C17 -16.6 15.8 -17.8 15.4 -19ZM15.2 -18.6C17.4 -15.6 15.4 -13.2 14 -14.8C13.2 -15.8 14.2 -17.4 15.2 -18.6Z', fill: 'none', stroke: WHITE, 'stroke-width': 1.1 }));
  const endA = s('path', { d: 'M15.6 -18.4C18 -15 21 -13.8 23.6 -14.6', fill: 'none', stroke: WHITE, 'stroke-width': 1.1, 'stroke-linecap': 'round' });
  const endB = s('path', { d: 'M15.6 -18.6C19 -18.6 21.4 -21 22.4 -24', fill: 'none', stroke: WHITE, 'stroke-width': 1.1, 'stroke-linecap': 'round' });
  knot.append(endA, endB);
  g.appendChild(knot);
  const neck: Vec = [14, -23];
  const poseFn = (swell: number, squash = 1, twist = 0) => {
    const sx = swell, sy = swell * squash;
    body.setAttribute('transform', `rotate(${f1(twist)}) scale(${Math.round(sx * 1000) / 1000} ${Math.round(sy * 1000) / 1000})`);
    knot.setAttribute('transform', `rotate(${f1(twist)}) translate(${f1(12.4 * (sx - 1))} ${f1(-17.8 * (sy - 1))})`);
  };
  return { g, body, knot, cordEnds: [endA, endB], mouth, neck, centre, pose: poseFn };
}

export interface Rampart {
  g: SVGGElement;
  gateL: SVGGElement;
  gateR: SVGGElement;
  /** 0 = open (leaves folded back), 1 = shut. */
  setGate(shut: number): void;
}

/**
 * The bronze rampart of Aiolia: plates of bronze (reserved clay, outlined in
 * glaze) riveted in added white, a coping of added purple, glaze crenellations
 * and towers; a gate whose leaves can swing shut.
 */
export function rampart(y: number, o: { from: number; to: number; height: number; gate: number; towers: number[] }): Rampart {
  const g = s('g', { class: 'aiolos-rampart' });
  const top = y - o.height;
  const W = o.to - o.from;
  const gw = 38, gh = o.height * 0.74;
  const gx = o.gate;
  // Face of the wall, with the gateway cut out.
  g.appendChild(
    s('path', {
      d: `M${o.from} ${y}V${top}H${o.to}V${y}H${gx + gw / 2}V${y - gh + 10}Q${gx} ${y - gh - 8} ${gx - gw / 2} ${y - gh + 10}V${y}Z`,
      fill: CLAY,
      stroke: INK,
      'stroke-width': 1.6,
      'stroke-linejoin': 'round',
    }),
  );
  // Courses of bronze plates and their rivets.
  let lines = '';
  let rivets = '';
  const rows = 4;
  for (let r = 1; r < rows; r++) {
    const yy = top + (r * o.height) / rows;
    lines += `M${o.from} ${f1(yy)}H${o.to}`;
  }
  for (let r = 0; r < rows; r++) {
    const y0 = top + (r * o.height) / rows;
    for (let x = o.from + (r % 2 ? 14 : 0); x < o.to; x += 28) {
      if (Math.abs(x - gx) < gw / 2 + 2 && y0 > y - gh - 6) continue;
      lines += `M${x} ${f1(y0)}v${f1(o.height / rows)}`;
      rivets += `M${x - 2.6} ${f1(y0 + 3)}h0.1M${x + 2.6} ${f1(y0 + 3)}h0.1M${x - 2.6} ${f1(y0 + o.height / rows - 3)}h0.1M${x + 2.6} ${f1(y0 + o.height / rows - 3)}h0.1`;
    }
  }
  g.appendChild(s('path', { d: lines, stroke: INK, 'stroke-width': 0.8, fill: 'none', opacity: 0.85 }));
  g.appendChild(s('path', { d: rivets, stroke: WHITE, 'stroke-width': 1.6, 'stroke-linecap': 'round' }));
  // Coping in added purple and glaze crenellations.
  g.appendChild(s('rect', { x: o.from, y: top - 4, width: W, height: 4, fill: PURPLE, stroke: INK, 'stroke-width': 0.8 }));
  let cren = '';
  for (let x = o.from; x < o.to; x += 12) cren += `M${x} ${top - 4}v-6h7v6z`;
  g.appendChild(s('path', { d: cren, fill: INK }));
  // Towers.
  for (const tx of o.towers) {
    g.appendChild(s('path', { d: `M${tx - 17} ${y}V${top - 26}H${tx + 17}V${y}Z`, fill: INK }));
    let tc = '';
    for (let k = -17; k < 17; k += 8.5) tc += `M${tx + k} ${top - 26}v-6h5v6z`;
    g.appendChild(s('path', { d: tc, fill: INK }));
    g.appendChild(s('path', { d: `M${tx - 3} ${top - 12}v-8h6v8z`, fill: CLAY }));
    g.appendChild(s('path', { d: `M${tx - 14} ${top - 2}H${tx + 14}M${tx - 14} ${top + 16}H${tx + 14}`, stroke: CLAY, 'stroke-width': 0.6, opacity: 0.6 }));
  }
  // The gateway's dark depth and the two leaves.
  g.insertBefore(s('path', { d: `M${gx - gw / 2} ${y}V${y - gh + 10}Q${gx} ${y - gh - 8} ${gx + gw / 2} ${y - gh + 10}V${y}Z`, fill: '#2b1a10' }), g.firstChild);
  const leaf = (side: -1 | 1) => {
    const lg = s('g', { class: `aiolos-gate aiolos-gate--${side < 0 ? 'l' : 'r'}` });
    const w = gw / 2;
    lg.appendChild(s('path', { d: `M0 0V${-gh + 10}Q${f1(side * w * 0.5)} ${f1(-gh - 4)} ${f1(side * w)} ${f1(-gh - 7.6)}V0Z`, fill: INK, stroke: INK, 'stroke-width': 0.8 }));
    let studs = '';
    for (const yy of [-8, -18, -28, -38]) for (const xx of [0.3, 0.7]) studs += `M${f1(side * w * xx)} ${yy}h0.1`;
    lg.appendChild(s('path', { d: studs, stroke: WHITE, 'stroke-width': 1.8, 'stroke-linecap': 'round' }));
    lg.appendChild(s('path', { d: `M${f1(side * 2)} -4V${-gh + 12}`, stroke: CLAY, 'stroke-width': 0.6 }));
    return lg;
  };
  const gateL = leaf(1);
  const gateR = leaf(-1);
  g.append(gateL, gateR);
  const setGate = (shut: number) => {
    // Leaves hinge at the jambs; open = folded flat against the jambs (scaleX → 0.18).
    const k = 0.16 + 0.84 * shut;
    const kk = Math.round(k * 1000) / 1000;
    gateL.setAttribute('transform', `translate(${gx - gw / 2} ${y}) scale(${kk} 1)`);
    gateR.setAttribute('transform', `translate(${gx + gw / 2} ${y}) scale(${kk} 1)`);
  };
  setGate(0);
  return { g, gateL, gateR, setGate };
}

/** The floating island: a rock mass whose underside hangs in the air above the sea. */
export function floatingIsland(y: number): SVGGElement {
  const g = s('g', { class: 'aiolos-island' });
  const pts: Vec[] = [
    [-150, y - 1], [150, y - 1], [148, y + 6], [138, y + 14], [124, y + 22], [108, y + 30], [90, y + 36], [72, y + 46], [52, y + 52], [32, y + 62], [14, y + 72],
    [2, y + 76], [-8, y + 66], [-26, y + 60], [-48, y + 52], [-70, y + 42], [-92, y + 34], [-112, y + 26], [-130, y + 18], [-142, y + 10], [-149, y + 4],
  ];
  g.appendChild(s('path', { d: smoothPath(pts, true, 0.25), fill: INK }));
  // Sheer rock (λισσὴ πέτρη): long incised strata.
  g.appendChild(
    s('path', {
      d: `M-130 ${y + 9}q40 6 80 2M-90 ${y + 24}q50 8 110 0M30 ${y + 12}q50 -4 100 4M-40 ${y + 40}q30 6 70 2M20 ${y + 48}q18 4 34 0M-110 ${y + 17}q14 2 26 0`,
      fill: 'none',
      stroke: CLAY,
      'stroke-width': 0.8,
      opacity: 0.6,
      'stroke-linecap': 'round',
    }),
  );
  return g;
}

/** Ithaca's shore: dark hills on the right with tiny watch-fires. */
export function ithacaShore(y: number): { g: SVGGElement; fires: SVGGElement[] } {
  const g = s('g', { class: 'aiolos-ithaca' });
  const pts: Vec[] = [[92, y + 30], [104, y + 4], [118, y - 10], [132, y - 26], [146, y - 36], [158, y - 30], [170, y - 42], [190, y - 50], [210, y - 40], [210, y + 30]];
  g.appendChild(s('path', { d: smoothPath(pts, true, 0.3), fill: INK }));
  g.appendChild(s('path', { d: `M120 ${y - 4}q14 -6 30 -2M140 ${y - 20}q12 -4 24 0`, fill: 'none', stroke: CLAY, 'stroke-width': 0.7, opacity: 0.6 }));
  const fires: SVGGElement[] = [];
  for (const [x, yy, k] of [[112, y - 2, 0.26], [136, y - 22, 0.22], [160, y - 26, 0.24]] as Array<[number, number, number]>) {
    const f = flames(x, yy, k);
    const glowDot = s('circle', { cx: x, cy: yy - 4, r: 5.5, fill: WHITE, opacity: 0.18 });
    g.append(glowDot, f);
    fires.push(f);
  }
  return { g, fires };
}
