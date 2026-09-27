/**
 * Art for Ι′ Laistrygonlar that the shared kit lacks: galleys that can break
 * in two, the giants' boulders, the lofty citadel of Lamos and the flotsam
 * left in the harbour. Black-figure: glaze silhouettes, clay incisions,
 * sparse added white and purple.
 */
import { s, r1 } from '../lib/dom';
import type { Vec } from '../lib/geometry';
import { INK, CLAY, WHITE } from '../art/figure';
import { ship, BLACK_FIGURE, type ShipOptions } from '../art/ship';

const f1 = (v: number) => r1(v).toString();

/* ------------------------------------------------------------------ */
/* A galley that can break in two                                      */
/* ------------------------------------------------------------------ */

/** x of the break (ship's local frame; the mast stands at x = 2). */
export const BREAK_X = -7;

/** Clip paths (ship's local frame) for the stern and bow halves; add once per scene. */
export function breakClips(defs: SVGDefsElement, prefix: string): { stern: string; bow: string } {
  // A jagged fracture from below the keel up through the deck and past the mast top.
  const jag: Vec[] = [[BREAK_X + 1, 40], [BREAK_X + 1, 12], [BREAK_X - 2, 5], [BREAK_X + 2, 1], [BREAK_X - 1.6, -3], [BREAK_X + 1.2, -6], [BREAK_X - 0.6, -12], [BREAK_X + 0.4, -90]];
  const line = jag.map((p) => `${f1(p[0])} ${f1(p[1])}`).join('L');
  const stern = s('clipPath', { id: `${prefix}-stern`, 'data-scene': '' });
  stern.appendChild(s('path', { d: `M-120 40L${line}L-120 -90Z` }));
  const bow = s('clipPath', { id: `${prefix}-bow`, 'data-scene': '' });
  bow.appendChild(s('path', { d: `M120 40L${line}L120 -90Z` }));
  defs.append(stern, bow);
  return { stern: `url(#${prefix}-stern)`, bow: `url(#${prefix}-bow)` };
}

export interface Breakable {
  /** Outer group: place it with a transform (translate/scale/mirror). */
  g: SVGGElement;
  stern: SVGGElement;
  bow: SVGGElement;
  /** Oars of the stern half (both halves carry a copy of the ship). */
  oars: SVGGElement[];
  /** Pose the two halves: `a` degrees apart at the break, sunk by `dy`. */
  split(a: number, dy: number): void;
}

/** A small galley drawn twice and clipped into two halves that can come apart. */
export function breakable(clips: { stern: string; bow: string }, opts: ShipOptions = {}): Breakable {
  const g = s('g', { class: 'lai-galley' });
  const mk = (clip: string) => {
    const half = s('g');
    const inner = s('g', { 'clip-path': clip });
    const p = ship({ palette: BLACK_FIGURE, sail: 'furled', oars: 7, crew: 3, ...opts });
    // An incised outline keeps packed hulls apart.
    p.hull.setAttribute('stroke', CLAY);
    p.hull.setAttribute('stroke-width', '1.6');
    p.hull.setAttribute('paint-order', 'stroke');
    inner.appendChild(p.g);
    half.appendChild(inner);
    return { half, oars: p.oars };
  };
  const a = mk(clips.stern);
  const b = mk(clips.bow);
  g.append(a.half, b.half);
  return {
    g,
    stern: a.half,
    bow: b.half,
    oars: [a.oars, b.oars],
    split(ang, dy) {
      a.half.setAttribute('transform', `translate(0 ${f1(dy)}) rotate(${f1(ang)} ${BREAK_X} 0)`);
      b.half.setAttribute('transform', `translate(0 ${f1(dy)}) rotate(${f1(-ang)} ${BREAK_X} 0)`);
    },
  };
}

/* ------------------------------------------------------------------ */
/* Boulders, citadel, flotsam                                          */
/* ------------------------------------------------------------------ */

/** A boulder "such as a man can barely lift", centred at 0,0. */
export function boulder(r = 7, seed = 0): SVGGElement {
  const g = s('g', { class: 'lai-boulder' });
  const n = 9;
  const pts: Vec[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (0.82 + 0.22 * Math.sin(i * 2.7 + seed * 1.9));
    pts.push([Math.cos(a) * rr * 1.15, Math.sin(a) * rr * 0.9]);
  }
  g.appendChild(s('path', { d: `M${pts.map((p) => `${f1(p[0])} ${f1(p[1])}`).join('L')}Z`, fill: INK, stroke: CLAY, 'stroke-width': 0.9, 'paint-order': 'stroke', 'stroke-linejoin': 'round' }));
  g.appendChild(s('path', { d: `M${f1(-r * 0.6)} ${f1(-r * 0.1)}q${f1(r * 0.5)} ${f1(-r * 0.3)} ${f1(r * 1.1)} ${f1(r * 0.1)}M${f1(-r * 0.2)} ${f1(r * 0.4)}l${f1(r * 0.6)} ${f1(-r * 0.1)}`, fill: 'none', stroke: CLAY, 'stroke-width': 0.6 }));
  return g;
}

/** The lofty citadel of Lamos: a walled hill-town with towers, standing on groundline y. */
export function citadel(y: number, w = 90): SVGGElement {
  const g = s('g', { class: 'lai-citadel' });
  const x0 = -w / 2, x1 = w / 2, top = y - 22;
  let d = `M${x0} ${y + 12}V${top}`;
  for (let x = x0; x < x1; x += 8) d += `H${x + 1}v-4h5v4`;
  d += `H${x1}V${y + 12}Z`;
  g.appendChild(s('path', { d, fill: INK }));
  for (const tx of [x0 + 10, x1 - 10, 0]) {
    const h = tx === 0 ? 34 : 28;
    let t = `M${tx - 8} ${y}V${y - h}`;
    for (let x = tx - 8; x < tx + 8; x += 6) t += `H${x + 1}v-4h4v4`;
    t += `H${tx + 8}V${y}Z`;
    g.appendChild(s('path', { d: t, fill: INK }));
    g.appendChild(s('path', { d: `M${tx - 1.8} ${y - h + 8}v-5h3.6v5z`, fill: CLAY, opacity: 0.85 }));
  }
  let lines = '';
  for (let r = 1; r < 4; r++) {
    const yy = top + r * 5.6;
    lines += `M${x0} ${f1(yy)}H${x1}`;
    for (let x = x0 + (r % 2) * 5; x < x1; x += 11) lines += `M${x} ${f1(yy)}v5.6`;
  }
  g.appendChild(s('path', { d: lines, stroke: CLAY, 'stroke-width': 0.45, opacity: 0.5, fill: 'none' }));
  // The gate the giants come from.
  g.appendChild(s('path', { d: `M-7 ${y + 1}V${y - 12}Q0 ${y - 19} 7 ${y - 12}V${y + 1}Z`, fill: '#2b1a10', stroke: CLAY, 'stroke-width': 0.6 }));
  return g;
}

/** Floating wreckage: planks, an oar, a curled stern-post, a round shield. */
export function flotsam(kind: 'plank' | 'oar' | 'stern' | 'shield' | 'mast', k = 1): SVGGElement {
  const g = s('g', { class: 'lai-flotsam', transform: `scale(${k})` });
  const inc = { stroke: CLAY, 'stroke-width': 0.8, 'paint-order': 'stroke' };
  if (kind === 'plank') {
    g.appendChild(s('path', { d: 'M-14 -1.6L13 -2.4L14 0.6L-13 1.6Z', fill: INK, ...inc }));
    g.appendChild(s('path', { d: 'M-8 -0.6H6', stroke: CLAY, 'stroke-width': 0.5 }));
  } else if (kind === 'oar') {
    g.appendChild(s('path', { d: 'M-16 -0.5L8 -1.2', stroke: INK, 'stroke-width': 1.2, 'stroke-linecap': 'round' }));
    g.appendChild(s('path', { d: 'M7 -3L16 -2.4L16 0.8L7 1Z', fill: INK }));
  } else if (kind === 'stern') {
    g.appendChild(s('path', { d: 'M-10 1C-12 -6 -10 -12 -4 -13C0 -13.4 1 -10 -2 -9C-6 -8 -6 -4 -3 -1L8 -1L8 1.6Z', fill: INK, ...inc }));
  } else if (kind === 'mast') {
    g.appendChild(s('path', { d: 'M-18 -0.6L18 -1.4L18 0.6L-18 1.2Z', fill: INK, ...inc }));
    g.appendChild(s('path', { d: 'M-4 -1L-10 -7L6 -8.4L8 -1.2Z', fill: WHITE, stroke: INK, 'stroke-width': 0.6 }));
  } else {
    g.appendChild(s('ellipse', { cx: 0, cy: -1, rx: 7, ry: 2.6, fill: INK, ...inc }));
    g.appendChild(s('ellipse', { cx: 0, cy: -1.2, rx: 4.4, ry: 1.3, fill: 'none', stroke: CLAY, 'stroke-width': 0.5 }));
  }
  return g;
}

/** A short sword (xiphos), hilt at 0,0, blade along +x. */
export function xiphos(len = 13): SVGGElement {
  const g = s('g', { class: 'lai-sword' });
  g.appendChild(s('path', { d: `M1.6 -1.1L${len - 2} -0.9L${len} 0L${len - 2} 0.9L1.6 1.1Z`, fill: INK, stroke: CLAY, 'stroke-width': 0.5, 'paint-order': 'stroke' }));
  g.appendChild(s('path', { d: 'M1.4 -2.6V2.6M-2.4 0H1.4', stroke: INK, 'stroke-width': 1.3, 'stroke-linecap': 'round' }));
  return g;
}
