/** Props for the homecoming tondo: Argos, the loom, the twelve axes, the olive-tree bed. */
import { s, r1 } from '../lib/dom';
import { ribbon, smoothPath, type Vec } from '../lib/geometry';
import { rng, range } from '../lib/random';
import { INK, CLAY, WHITE, PURPLE } from '../art/figure';

/** Old Argos lying on the dung heap. Head and tail are separate groups for animation. */
export function argos(x: number, y: number, k = 1): { g: SVGGElement; head: SVGGElement; tail: SVGGElement; ears: SVGPathElement; eye: SVGCircleElement } {
  const g = s('g', { class: 'argos', transform: `translate(${r1(x)} ${r1(y)}) scale(${k})` });
  // Body lying down, legs folded forward.
  g.appendChild(s('path', { d: smoothPath([[-32, 0], [-30, -10], [-14, -14], [4, -14], [16, -12], [22, -4], [14, 0]], true, 0.35), fill: INK, stroke: CLAY, 'stroke-width': 1, 'paint-order': 'stroke' }));
  g.appendChild(s('path', { d: ribbon([[14, -2], [26, -1], [36, 0]], [[0, 4], [1, 2.4]], 12) + ribbon([[8, -1], [20, 1], [30, 2]], [[0, 3.6], [1, 2.2]], 12), fill: INK, stroke: CLAY, 'stroke-width': 0.8, 'paint-order': 'stroke' }));
  // Ribs of an old, neglected dog.
  g.appendChild(s('path', { d: 'M-6 -12Q-4 -8 -6 -4M0 -12Q2 -8 0 -4M-22 -10Q-18 -6 -22 -2', fill: 'none', stroke: CLAY, 'stroke-width': 0.55, opacity: 0.7 }));
  const tail = s('g', { class: 'argos__tail' });
  tail.appendChild(s('path', { d: ribbon([[-29, -6], [-38, -8], [-46, -4]], [[0, 2.8], [1, 0.9]], 14), fill: INK }));
  const head = s('g', { class: 'argos__head' });
  head.appendChild(s('path', { d: smoothPath([[12, -12], [17, -21], [26, -24], [34, -22], [46, -17], [48, -13], [44, -11], [30, -10], [20, -6]], true, 0.3), fill: INK, stroke: CLAY, 'stroke-width': 0.8, 'paint-order': 'stroke' }));
  const ears = s('path', { d: 'M22 -22C18 -26 15 -22 15 -15C17 -14 19 -16 21 -19Z', fill: INK, stroke: CLAY, 'stroke-width': 0.6, 'paint-order': 'stroke' });
  head.appendChild(ears);
  head.appendChild(s('path', { d: 'M40 -12.5Q44 -12 47 -13', fill: 'none', stroke: CLAY, 'stroke-width': 0.5 }));
  const eye = s('circle', { cx: 30, cy: -19, r: 1.1, fill: CLAY });
  head.appendChild(eye);
  g.append(tail, head);
  return { g, head, tail, ears, eye };
}

/** A low mound (the dung heap before the gate). */
export function mound(x: number, y: number, w = 90, h = 16): SVGPathElement {
  return s('path', { d: `M${x - w / 2} ${y}C${x - w * 0.3} ${y - h} ${x + w * 0.25} ${y - h * 1.1} ${x + w / 2} ${y}Z`, fill: INK, opacity: 0.9 });
}

/** A palace doorway with two columns and a lintel. */
export function doorway(x: number, y: number, h = 110, w = 56): SVGGElement {
  const g = s('g', { class: 'doorway' });
  g.appendChild(s('rect', { x: x - w / 2, y: y - h, width: w, height: h, fill: '#a9542a' }));
  for (const cx of [x - w / 2 - 6, x + w / 2 + 6]) {
    g.appendChild(s('path', { d: `M${cx - 6} ${y}L${cx - 5} ${y - h + 8}H${cx + 5}L${cx + 6} ${y}Z`, fill: INK }));
    g.appendChild(s('path', { d: `M${cx - 9} ${y - h + 8}H${cx + 9}V${y - h + 3}H${cx - 9}Z`, fill: INK }));
  }
  g.appendChild(s('path', { d: `M${x - w / 2 - 16} ${y - h + 3}H${x + w / 2 + 16}V${y - h - 7}H${x - w / 2 - 16}Z`, fill: INK }));
  let d = '';
  for (let xx = x - w / 2 - 14; xx < x + w / 2 + 14; xx += 7) d += `M${xx} ${y - h - 7}v-4h4v4z`;
  g.appendChild(s('path', { d, fill: INK }));
  return g;
}

export interface Loom {
  g: SVGGElement;
  cloth: SVGRectElement;
  /** Height of the woven band (0..1). */
  setWoven(p: number): void;
}

/** A warp-weighted loom: uprights, a beam, warp threads, clay loom weights, and the growing web. */
export function loom(x: number, y: number, w = 70, h = 120): Loom {
  const g = s('g', { class: 'loom' });
  const top = y - h;
  g.appendChild(s('path', { d: `M${x - w / 2 - 4} ${y}L${x - w / 2 + 2} ${top - 8}M${x + w / 2 + 4} ${y}L${x + w / 2 - 2} ${top - 8}`, stroke: INK, 'stroke-width': 3.2, 'stroke-linecap': 'round' }));
  g.appendChild(s('path', { d: `M${x - w / 2 - 6} ${top}H${x + w / 2 + 6}`, stroke: INK, 'stroke-width': 4, 'stroke-linecap': 'round' }));
  let warp = '';
  const n = 14;
  for (let i = 0; i <= n; i++) {
    const xx = x - w / 2 + 3 + ((w - 6) * i) / n;
    warp += `M${r1(xx)} ${top}L${r1(xx + (i % 2 ? 1 : -1))} ${y - 22}`;
  }
  g.appendChild(s('path', { d: warp, stroke: INK, 'stroke-width': 0.6, opacity: 0.8 }));
  // Loom weights hanging at the bottom of the warp.
  let wts = '';
  for (let i = 0; i < 7; i++) {
    const xx = x - w / 2 + 6 + ((w - 12) * i) / 6;
    wts += `M${r1(xx - 3)} ${y - 12}L${r1(xx)} ${y - 22}L${r1(xx + 3)} ${y - 12}Z`;
  }
  g.appendChild(s('path', { d: wts, fill: INK }));
  const clipId = `loom-${Math.round(x)}-${Math.round(y)}`;
  const clip = s('clipPath', { id: clipId, 'data-scene': '' });
  const clipRect = s('rect', { x: x - w / 2, y: top + 2, width: w, height: 0 });
  clip.appendChild(clipRect);
  const web = s('g', { 'clip-path': `url(#${clipId})` });
  const cloth = s('rect', { x: x - w / 2 + 2, y: top + 2, width: w - 4, height: h - 30, fill: PURPLE });
  web.appendChild(cloth);
  // Woven patterns: a meander-ish band and chevrons in added white.
  let pat = '';
  for (let row = 0; row < 6; row++) {
    const yy = top + 10 + row * 14;
    for (let xx = x - w / 2 + 6; xx < x + w / 2 - 8; xx += 10) pat += row % 2 ? `M${xx} ${yy}l5 -4l5 4` : `M${xx} ${yy}h6v-4h-4`;
  }
  web.appendChild(s('path', { d: pat, fill: 'none', stroke: WHITE, 'stroke-width': 0.9, opacity: 0.85 }));
  g.appendChild(web);
  g.appendChild(clip);
  const full = h - 30;
  return {
    g,
    cloth,
    setWoven: (p) => clipRect.setAttribute('height', r1(Math.max(0, Math.min(1, p)) * full).toString()),
  };
}

/** Twelve axe heads set upright in a row; the arrow passes through their rings at `holeY`. */
export function axes(x0: number, x1: number, ground: number, holeY: number): { g: SVGGElement; heads: SVGGElement[] } {
  const g = s('g', { class: 'axes' });
  const heads: SVGGElement[] = [];
  for (let i = 0; i < 12; i++) {
    const x = x0 + ((x1 - x0) * i) / 11;
    const a = s('g', { class: 'axe' });
    a.appendChild(s('line', { x1: x, y1: ground, x2: x, y2: holeY + 6, stroke: INK, 'stroke-width': 1.8 }));
    // A double axe head with a ring (the "hole" of the Odyssey's contest), the ring left in clay.
    a.appendChild(s('path', { d: `M${x - 1.4} ${holeY - 7}L${x - 5.6} ${holeY - 10}Q${x - 7.4} ${holeY} ${x - 5.6} ${holeY + 10}L${x - 1.4} ${holeY + 7}Z M${x + 1.4} ${holeY - 7}L${x + 5.6} ${holeY - 10}Q${x + 7.4} ${holeY} ${x + 5.6} ${holeY + 10}L${x + 1.4} ${holeY + 7}Z`, fill: INK }));
    a.appendChild(s('circle', { cx: x, cy: holeY, r: 3.1, fill: INK }));
    a.appendChild(s('circle', { cx: x, cy: holeY, r: 1.7, fill: CLAY }));
    g.appendChild(a);
    heads.push(a);
  }
  return { g, heads };
}

/** The marriage bed: a couch frame; one post is the living olive trunk (drawn separately). */
export function bed(x: number, y: number, w = 150): SVGGElement {
  const g = s('g', { class: 'bed' });
  const top = y - 28;
  const L = x - w / 2, R = x + w / 2 - 22;
  // Turned legs, the frame rail and a scrolled headboard.
  g.appendChild(s('path', { d: `M${L + 4} ${y}V${top}M${R} ${y}V${top}`, stroke: INK, 'stroke-width': 5, 'stroke-linecap': 'round' }));
  g.appendChild(s('path', { d: `M${L + 1} ${y - 12}h6M${R - 3} ${y - 12}h6`, stroke: CLAY, 'stroke-width': 1 }));
  g.appendChild(s('path', { d: `M${L} ${top}H${R + 4}`, stroke: INK, 'stroke-width': 4.5, 'stroke-linecap': 'round' }));
  g.appendChild(s('path', { d: `M${L + 2} ${top}C${L - 6} ${top - 10} ${L - 2} ${top - 24} ${L + 8} ${top - 22}`, fill: 'none', stroke: INK, 'stroke-width': 4, 'stroke-linecap': 'round' }));
  // Mattress and coverlet in added purple with woven bands.
  g.appendChild(s('path', { d: `M${L + 4} ${top - 2}H${R + 2}Q${R + 6} ${top - 9} ${R - 2} ${top - 10}H${L + 10}Q${L + 2} ${top - 9} ${L + 4} ${top - 2}Z`, fill: PURPLE, stroke: INK, 'stroke-width': 0.8 }));
  let band = '';
  for (let xx = L + 12; xx < R - 4; xx += 9) band += `M${xx} ${top - 3}l3 -5l3 5`;
  g.appendChild(s('path', { d: band, fill: 'none', stroke: WHITE, 'stroke-width': 0.8 }));
  g.appendChild(s('path', { d: `M${L + 8} ${top - 10}q8 -10 20 -3q-9 6 -20 3z`, fill: WHITE, stroke: INK, 'stroke-width': 0.7 }));
  return g;
}

/** The olive trunk that is the bed's post, with branches spreading overhead (draw-on friendly). */
export function oliveBedTree(x: number, y: number, seed = 4): { trunk: SVGPathElement; branches: SVGPathElement; leaves: SVGGElement } {
  const trunk = s('path', { d: ribbon([[x, y + 2], [x - 4, y - 30], [x + 3, y - 62], [x - 2, y - 96], [x + 6, y - 126]], [[0, 16], [0.4, 11], [1, 5]], 40), fill: INK });
  const branches = s('path', {
    d: `M${x} ${y - 90}C${x - 30} ${y - 110} ${x - 70} ${y - 112} ${x - 118} ${y - 140}M${x + 2} ${y - 100}C${x + 30} ${y - 118} ${x + 64} ${y - 124} ${x + 104} ${y - 150}M${x - 2} ${y - 70}C${x - 40} ${y - 80} ${x - 80} ${y - 70} ${x - 128} ${y - 86}M${x + 4} ${y - 116}C${x + 10} ${y - 140} ${x - 6} ${y - 160} ${x + 4} ${y - 176}`,
    fill: 'none',
    stroke: INK,
    'stroke-width': 3,
    'stroke-linecap': 'round',
  });
  const leaves = s('g', { class: 'bed-leaves' });
  const rand = rng(seed);
  const along: Array<[Vec, Vec]> = [
    [[x, y - 90], [x - 118, y - 140]],
    [[x + 2, y - 100], [x + 104, y - 150]],
    [[x - 2, y - 70], [x - 128, y - 86]],
    [[x + 4, y - 116], [x + 4, y - 176]],
  ];
  for (const [a, b] of along) {
    for (let i = 1; i < 17; i++) {
      const t = i / 17;
      const px = a[0] + (b[0] - a[0]) * t + range(rand, -3, 3), py = a[1] + (b[1] - a[1]) * t + range(rand, -3, 3);
      const ang = range(rand, 0, 360);
      const leaf = s('path', { d: 'M0 0Q4 -3 10 0Q4 3 0 0Z', fill: INK, transform: `translate(${r1(px)} ${r1(py)}) rotate(${r1(ang)})` });
      leaves.appendChild(leaf);
      if (rand() > 0.72) leaves.appendChild(s('circle', { cx: r1(px + range(rand, -4, 4)), cy: r1(py + range(rand, 2, 6)), r: 1.8, fill: PURPLE }));
    }
  }
  return { trunk, branches, leaves };
}

/** A banqueting couch with a reclining suitor holding up a cup. */
export function suitorCouch(x: number, y: number, flip = false): SVGGElement {
  const g = s('g', { class: 'suitor', transform: `translate(${r1(x)} ${r1(y)}) scale(${flip ? -1 : 1} 1)` });
  g.appendChild(s('path', { d: 'M-34 -14H26L30 -24M-30 -14V0M22 -14V0', fill: 'none', stroke: INK, 'stroke-width': 3, 'stroke-linecap': 'round' }));
  g.appendChild(s('path', { d: 'M-30 -16C-24 -26 -4 -24 8 -20L22 -18L20 -15H-30Z', fill: PURPLE }));
  // Reclining man: torso, head, raised arm with a kylix.
  g.appendChild(s('path', { d: 'M8 -20C6 -30 10 -38 14 -40L20 -38C22 -32 20 -26 18 -20Z', fill: INK }));
  g.appendChild(s('circle', { cx: 17, cy: -45, r: 5.2, fill: INK }));
  g.appendChild(s('path', { d: 'M19 -41L23 -36L18 -37Z', fill: INK }));
  g.appendChild(s('path', { d: 'M12 -34L2 -44L-2 -52', fill: 'none', stroke: INK, 'stroke-width': 3, 'stroke-linecap': 'round' }));
  g.appendChild(s('path', { d: 'M-10 -54Q-2 -48 6 -54ZM-3 -52H0L0 -50H-3Z', fill: INK, stroke: INK, 'stroke-width': 0.8 }));
  g.appendChild(s('circle', { cx: 18.5, cy: -46, r: 0.9, fill: CLAY }));
  return g;
}
