/**
 * Scene kit — the shared scenery of the tondos, drawn in the black-figure
 * manner: glaze-black silhouettes (INK) on orange clay (CLAY), incised
 * details in the clay colour, "added white" (WHITE) and "added purple"
 * (PURPLE) for accents. Everything is built around the tondo's frame:
 * centre (0,0), usable radius ≈ 166.
 *
 * Every helper returns plain SVG nodes; animate them with GSAP in scenes.
 */
import { s, r1, nextId, frag } from '../lib/dom';
import { rng, range } from '../lib/random';
import { ribbon, smoothPath, type Vec } from '../lib/geometry';
import { waveStripPath } from './ornaments';
import { greekText } from './letters';
import { INK, CLAY, WHITE, PURPLE } from './figure';

export { INK, CLAY, WHITE, PURPLE };

/* ------------------------------------------------------------------ */
/* Ground and sea                                                      */
/* ------------------------------------------------------------------ */

/**
 * The exergue: a black ground segment closing the bottom of the tondo, with
 * an optional incised ornament band. Returns the group; the ground line is at `y`.
 */
export function exergue(y = 104, opts: { band?: 'meander' | 'tongues' | 'none' } = {}): SVGGElement {
  const g = s('g', { class: 'kit-exergue' });
  g.appendChild(s('rect', { x: -200, y, width: 400, height: 120, fill: INK }));
  g.appendChild(s('line', { x1: -200, y1: y + 0.5, x2: 200, y2: y + 0.5, stroke: CLAY, 'stroke-width': 0.8, opacity: 0.6 }));
  if (opts.band === 'tongues') {
    let d = '';
    for (let x = -196; x < 200; x += 12) d += `M${x} ${y + 8}q6 16 12 0`;
    g.appendChild(s('path', { d, fill: 'none', stroke: CLAY, 'stroke-width': 1 }));
  } else if (opts.band === 'meander' || opts.band === undefined) {
    // A thin incised line pair: the painter's groundline.
    g.appendChild(s('line', { x1: -200, y1: y + 5, x2: 200, y2: y + 5, stroke: CLAY, 'stroke-width': 0.6, opacity: 0.5 }));
  }
  return g;
}

/** A plain groundline (a painted line figures stand on). */
export function groundLine(y = 100, from = -170, to = 170): SVGLineElement {
  return s('line', { x1: from, y1: y, x2: to, y2: y, stroke: INK, 'stroke-width': 2.2, 'stroke-linecap': 'round' });
}

export interface SeaParts {
  g: SVGGElement;
  /** The wave-crest band; animate `x` for a running sea (it tiles every 36 units). */
  crests: SVGGElement;
  body: SVGRectElement;
}

/**
 * The sea as vase painters drew it: a band of curling wave-crests over black
 * water. `y` is the top of the crests. Tint the crests with `crest` (e.g. CLAY
 * for red-figure dolphins/foam on black water).
 */
export function sea(y = 60, opts: { crestHeight?: number; crest?: string; foam?: boolean } = {}): SeaParts {
  const hgt = opts.crestHeight ?? 22;
  const g = s('g', { class: 'kit-sea' });
  const crests = s('g', { class: 'kit-sea__crests' });
  crests.appendChild(s('path', { d: waveStripPath(576, hgt), transform: `translate(-288 ${y})`, fill: opts.crest ?? INK }));
  const body = s('rect', { x: -200, y: y + hgt - 0.5, width: 400, height: 240, fill: INK });
  g.append(crests, body);
  if (opts.foam !== false) {
    // Incised ripple lines in the black water.
    const rand = rng(Math.round(y * 7));
    let d = '';
    for (let i = 0; i < 16; i++) {
      const x = range(rand, -170, 150), yy = y + hgt + range(rand, 10, 110);
      const w = range(rand, 12, 26);
      d += `M${r1(x)} ${r1(yy)}q${r1(w / 4)} -3 ${r1(w / 2)} 0t${r1(w / 2)} 0`;
    }
    g.appendChild(s('path', { d, fill: 'none', stroke: CLAY, 'stroke-width': 0.9, opacity: 0.45, 'stroke-linecap': 'round' }));
  }
  return { g, crests, body };
}

/** Loop the crests sideways forever (returns the tween-able target and distance). */
export const SEA_TILE = 36;

/* ------------------------------------------------------------------ */
/* Rocks, cliffs, caves                                                */
/* ------------------------------------------------------------------ */

/** A craggy rock mass from a list of outline points (closed), with incised strata. */
export function rock(points: Vec[], opts: { fill?: string; lines?: number; seed?: number } = {}): SVGGElement {
  const g = s('g', { class: 'kit-rock' });
  g.appendChild(s('path', { d: smoothPath(points, true, 0.18), fill: opts.fill ?? INK }));
  const n = opts.lines ?? 4;
  if (n > 0) {
    const xs = points.map((p) => p[0]), ys = points.map((p) => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const rand = rng(opts.seed ?? 3);
    let d = '';
    for (let i = 0; i < n; i++) {
      const yy = y0 + ((i + 1) / (n + 1)) * (y1 - y0);
      const xa = x0 + (x1 - x0) * range(rand, 0.15, 0.35);
      const xb = x0 + (x1 - x0) * range(rand, 0.55, 0.85);
      d += `M${r1(xa)} ${r1(yy)}q${r1((xb - xa) / 2)} ${r1(range(rand, -5, 5))} ${r1(xb - xa)} ${r1(range(rand, -3, 3))}`;
    }
    g.appendChild(s('path', { d, fill: 'none', stroke: CLAY, 'stroke-width': 0.8, opacity: 0.7, 'stroke-linecap': 'round' }));
  }
  return g;
}

/** A tall cliff rising from the sea on the left or right side of the tondo. */
export function cliff(side: 'left' | 'right', topY = -150, baseY = 80, width = 110): SVGGElement {
  const sx = side === 'left' ? -1 : 1;
  const edge = sx * 175;
  const inner = sx * (175 - width);
  const pts: Vec[] = [
    [edge, baseY + 40],
    [inner + sx * 6, baseY + 40],
    [inner, baseY],
    [inner + sx * 12, baseY - 40],
    [inner - sx * 8, baseY - 90],
    [inner + sx * 10, (baseY + topY) / 2],
    [inner + sx * 2, topY + 50],
    [inner + sx * 22, topY + 20],
    [inner + sx * 30, topY],
    [edge, topY - 20],
  ];
  return rock(pts, { lines: 7, seed: side === 'left' ? 11 : 17 });
}

/** A cave mouth: black rock arch framing a darker hollow (`hollow` is returned for layering). */
export function cave(cx = 0, cy = 40, w = 220, h = 190): { g: SVGGElement; hollow: SVGPathElement; arch: SVGGElement } {
  const g = s('g', { class: 'kit-cave' });
  const hollow = s('path', {
    d: `M${cx - w / 2} ${cy + h / 2}C${cx - w / 2} ${cy - h * 0.2} ${cx - w * 0.3} ${cy - h / 2} ${cx} ${cy - h / 2}C${cx + w * 0.3} ${cy - h / 2} ${cx + w / 2} ${cy - h * 0.2} ${cx + w / 2} ${cy + h / 2}Z`,
    fill: '#a9542a',
  });
  const arch = rock(
    [
      [-200, cy + h / 2 + 60], [-200, -200], [200, -200], [200, cy + h / 2 + 60], [cx + w / 2 + 14, cy + h / 2 + 60],
      [cx + w / 2 + 6, cy + h * 0.1], [cx + w * 0.34, cy - h / 2 - 12], [cx, cy - h / 2 - 22], [cx - w * 0.34, cy - h / 2 - 12],
      [cx - w / 2 - 6, cy + h * 0.1], [cx - w / 2 - 14, cy + h / 2 + 60],
    ],
    { lines: 0 },
  );
  g.append(hollow, arch);
  return { g, hollow, arch };
}

/* ------------------------------------------------------------------ */
/* Plants                                                              */
/* ------------------------------------------------------------------ */

/** An olive tree: twisted trunk, a crown of small leaves in clusters. */
export function oliveTree(x: number, groundY: number, k = 1, seed = 5): SVGGElement {
  const g = s('g', { class: 'kit-olive', transform: `translate(${r1(x)} ${r1(groundY)}) scale(${k})` });
  g.appendChild(s('path', { d: ribbon([[0, 0], [-4, -18], [3, -34], [-2, -52], [4, -66]], [[0, 11], [0.4, 7], [1, 3]], 30), fill: INK }));
  g.appendChild(s('path', { d: ribbon([[1, -36], [14, -48], [26, -54]], [[0, 4], [1, 1.4]], 16), fill: INK }));
  g.appendChild(s('path', { d: ribbon([[-1, -44], [-16, -56], [-26, -60]], [[0, 3.6], [1, 1.2]], 16), fill: INK }));
  const rand = rng(seed);
  let d = '';
  for (let i = 0; i < 110; i++) {
    const a = range(rand, 0, Math.PI * 2);
    const rr = Math.sqrt(rand()) * 32;
    const cx = Math.cos(a) * rr * 1.35, cy = -68 + Math.sin(a) * rr * 0.72;
    const ang = a + range(rand, -0.9, 0.9);
    const L = range(rand, 7, 11), w = 2.2;
    const ex = cx + Math.cos(ang) * L, ey = cy + Math.sin(ang) * L;
    d += `M${r1(cx)} ${r1(cy)}Q${r1((cx + ex) / 2 - Math.sin(ang) * w)} ${r1((cy + ey) / 2 + Math.cos(ang) * w)} ${r1(ex)} ${r1(ey)}Q${r1((cx + ex) / 2 + Math.sin(ang) * w)} ${r1((cy + ey) / 2 - Math.cos(ang) * w)} ${r1(cx)} ${r1(cy)}Z`;
  }
  g.appendChild(s('path', { d, fill: INK }));
  // A few olives in added purple.
  for (let i = 0; i < 6; i++) g.appendChild(s('circle', { cx: r1(range(rand, -28, 28)), cy: r1(range(rand, -84, -52)), r: 1.6, fill: PURPLE }));
  return g;
}

/** A cypress: a tall flame of dark foliage. */
export function cypress(x: number, groundY: number, h = 120): SVGGElement {
  const g = s('g', { class: 'kit-cypress', transform: `translate(${r1(x)} ${r1(groundY)})` });
  g.appendChild(s('path', { d: `M-2 0V-12H2V0Z`, fill: INK }));
  const w = h * 0.13;
  g.appendChild(s('path', { d: `M0 ${-h}C${r1(w * 0.9)} ${r1(-h * 0.78)} ${r1(w * 1.25)} ${r1(-h * 0.42)} ${r1(w)} -10Q0 -5 ${r1(-w)} -10C${r1(-w * 1.25)} ${r1(-h * 0.42)} ${r1(-w * 0.9)} ${r1(-h * 0.78)} 0 ${-h}Z`, fill: INK }));
  let d = '';
  for (let i = 1; i < 9; i++) {
    const yy = -h * (i / 9.5);
    const ww = w * (0.35 + 0.5 * Math.sin((i / 9) * Math.PI));
    d += `M${r1(-ww)} ${r1(yy + 3)}q${r1(ww)} -6 ${r1(ww * 2)} 0`;
  }
  g.appendChild(s('path', { d, fill: 'none', stroke: CLAY, 'stroke-width': 0.7, opacity: 0.8 }));
  return g;
}

/** A grapevine tendril with leaves and bunches, from a to b (for caves and arbours). */
export function vine(points: Vec[], seed = 9): SVGGElement {
  const g = s('g', { class: 'kit-vine' });
  g.appendChild(s('path', { d: smoothPath(points), fill: 'none', stroke: INK, 'stroke-width': 1.6, 'stroke-linecap': 'round' }));
  const rand = rng(seed);
  for (let i = 1; i < points.length; i++) {
    const [x, y] = points[i];
    const leaf = s('path', { d: 'M0 0C-6 -3 -9 -9 -6 -13C-3 -12 -1 -15 0 -18C1 -15 3 -12 6 -13C9 -9 6 -3 0 0Z', fill: INK, transform: `translate(${r1(x)} ${r1(y)}) rotate(${r1(range(rand, -60, 60))}) scale(${r1(range(rand, 0.7, 1.1))})` });
    g.appendChild(leaf);
    if (i % 2 === 0) {
      let d = '';
      for (let k = 0; k < 6; k++) d += `M${r1(x + 4 + (k % 3) * 2.6 - (k > 2 ? 1.3 : 0))} ${r1(y + 6 + Math.floor(k / 3) * 2.4 + (k === 5 ? 2.4 : 0))}a1.3 1.3 0 1 0 0.1 0`;
      g.appendChild(s('path', { d, fill: PURPLE, stroke: INK, 'stroke-width': 0.4 }));
    }
  }
  return g;
}

/** A tuft of reeds/grass along the ground. */
export function reeds(x: number, groundY: number, n = 5, h = 22): SVGGElement {
  const g = s('g', { class: 'kit-reeds' });
  let d = '';
  for (let i = 0; i < n; i++) {
    const xx = x + (i - n / 2) * 3.2;
    const lean = (i - n / 2) * 2.2;
    d += `M${r1(xx)} ${groundY}q${r1(lean * 0.3)} ${r1(-h * 0.5)} ${r1(lean)} ${r1(-h - (i % 2) * 5)}`;
  }
  g.appendChild(s('path', { d, fill: 'none', stroke: INK, 'stroke-width': 1.3, 'stroke-linecap': 'round' }));
  return g;
}

/* ------------------------------------------------------------------ */
/* Sky and weather                                                     */
/* ------------------------------------------------------------------ */

/** The sun as a disc with rays, or the moon as a crescent (both glaze-black by default). */
export function sun(x: number, y: number, r = 16, color = INK): SVGGElement {
  const g = s('g', { class: 'kit-sun', transform: `translate(${r1(x)} ${r1(y)})` });
  let d = '';
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const r0 = r + 3, r2 = r + (i % 2 ? 6 : 10);
    d += `M${r1(Math.cos(a) * r0)} ${r1(Math.sin(a) * r0)}L${r1(Math.cos(a) * r2)} ${r1(Math.sin(a) * r2)}`;
  }
  g.appendChild(s('path', { d, stroke: color, 'stroke-width': 1.6, 'stroke-linecap': 'round' }));
  g.appendChild(s('circle', { r, fill: color }));
  return g;
}

export function moon(x: number, y: number, r = 12, color = WHITE): SVGGElement {
  const g = s('g', { class: 'kit-moon', transform: `translate(${r1(x)} ${r1(y)})` });
  g.appendChild(s('path', { d: `M0 ${-r}A${r} ${r} 0 1 0 0 ${r}A${r * 1.25} ${r * 1.25} 0 0 1 0 ${-r}Z`, fill: color }));
  return g;
}

/** Scattered star rosettes for night skies. */
export function stars(n: number, box: { x: number; y: number; w: number; h: number }, seed = 21, color = WHITE): SVGGElement {
  const g = s('g', { class: 'kit-stars' });
  const rand = rng(seed);
  let d = '';
  for (let i = 0; i < n; i++) {
    const x = box.x + rand() * box.w, y = box.y + rand() * box.h, r = range(rand, 1.2, 2.6);
    d += `M${r1(x - r)} ${r1(y)}L${r1(x)} ${r1(y - r * 0.3)}L${r1(x + r)} ${r1(y)}L${r1(x)} ${r1(y + r * 0.3)}ZM${r1(x)} ${r1(y - r)}L${r1(x + r * 0.3)} ${r1(y)}L${r1(x)} ${r1(y + r)}L${r1(x - r * 0.3)} ${r1(y)}Z`;
  }
  g.appendChild(s('path', { d, fill: color }));
  return g;
}

/** A stylised Greek cloud: a row of scallops with a flat base. */
export function cloud(x: number, y: number, w = 90, color = INK): SVGPathElement {
  const n = Math.max(3, Math.round(w / 22));
  const step = w / n;
  let d = `M${r1(x - w / 2)} ${r1(y)}`;
  for (let i = 0; i < n; i++) {
    const x0 = x - w / 2 + i * step;
    const hgt = 10 + ((i * 7) % 5) * 2.2;
    d += `C${r1(x0)} ${r1(y - hgt * 1.4)} ${r1(x0 + step)} ${r1(y - hgt * 1.4)} ${r1(x0 + step)} ${r1(y)}`;
  }
  d += 'Z';
  return s('path', { d, fill: color, class: 'kit-cloud' });
}

/** Zeus's thunderbolt (keraunos): a double-ended bolt with flame tips. */
export function thunderbolt(len = 90, color = WHITE): SVGGElement {
  const g = s('g', { class: 'kit-bolt' });
  const hl = len / 2;
  g.appendChild(
    s('path', {
      d: `M0 ${-hl}L7 ${-hl * 0.42}L2 ${-hl * 0.36}L9 ${-hl * 0.05}L-3 ${hl * 0.1}L4 ${hl * 0.14}L-6 ${hl}L-2 ${hl * 0.22}L-9 ${hl * 0.18}L1 ${-hl * 0.12}L-6 ${-hl * 0.16}Z`,
      fill: color,
      stroke: INK,
      'stroke-width': 1,
      'stroke-linejoin': 'round',
    }),
  );
  return g;
}

/** Jagged lightning streak from a to b (use with a flash). */
export function lightning(a: Vec, b: Vec, seed = 4, color = WHITE): SVGPathElement {
  const rand = rng(seed);
  const pts: Vec[] = [a];
  const n = 7;
  for (let i = 1; i < n; i++) {
    const t = i / n;
    pts.push([a[0] + (b[0] - a[0]) * t + range(rand, -14, 14), a[1] + (b[1] - a[1]) * t + range(rand, -4, 4)]);
  }
  pts.push(b);
  return s('path', { d: pts.map((p, i) => `${i ? 'L' : 'M'}${r1(p[0])} ${r1(p[1])}`).join(''), fill: 'none', stroke: color, 'stroke-width': 3, 'stroke-linejoin': 'bevel', class: 'kit-lightning' });
}

/** Slanting rain strokes over the tondo. */
export function rain(n = 40, seed = 8, color = WHITE): SVGGElement {
  const g = s('g', { class: 'kit-rain', opacity: 0.55 });
  const rand = rng(seed);
  let d = '';
  for (let i = 0; i < n; i++) {
    const x = range(rand, -190, 190), y = range(rand, -190, 170), L = range(rand, 10, 22);
    d += `M${r1(x)} ${r1(y)}l${r1(-L * 0.35)} ${r1(L)}`;
  }
  g.appendChild(s('path', { d, stroke: color, 'stroke-width': 1, 'stroke-linecap': 'round' }));
  return g;
}

/* ------------------------------------------------------------------ */
/* Fire                                                                */
/* ------------------------------------------------------------------ */

/** Flames (three licking tongues) in added purple with a white core. Animate `.kit-flame__tongue` scaleY. */
export function flames(x: number, y: number, k = 1): SVGGElement {
  const g = s('g', { class: 'kit-flame', transform: `translate(${r1(x)} ${r1(y)}) scale(${k})` });
  const outer = 'M-12 0C-16 -10 -8 -16 -9 -26C-4 -20 -2 -18 -1 -30C3 -22 8 -18 6 -34C14 -24 16 -12 12 0Z';
  const inner = 'M-6 0C-8 -6 -3 -10 -3 -16C0 -12 2 -10 3 -18C7 -12 8 -6 6 0Z';
  const t1 = s('path', { d: outer, fill: PURPLE, class: 'kit-flame__tongue' });
  const t2 = s('path', { d: inner, fill: WHITE, class: 'kit-flame__tongue', opacity: 0.9 });
  g.append(t1, t2);
  return g;
}

/** A torch: a staff with a burning head. Returns the group and the flame for animation. */
export function torch(x: number, y: number, angle = -10): { g: SVGGElement; flame: SVGGElement } {
  const g = s('g', { class: 'kit-torch', transform: `translate(${r1(x)} ${r1(y)}) rotate(${angle})` });
  g.appendChild(s('path', { d: 'M-1.4 0L-1 -34L1 -34L1.4 0Z', fill: INK }));
  g.appendChild(s('path', { d: 'M-3 -34L3 -34L2.2 -40L-2.2 -40Z', fill: INK }));
  const fl = flames(0, -40, 0.42);
  g.appendChild(fl);
  return { g, flame: fl };
}

/* ------------------------------------------------------------------ */
/* Vessels and objects                                                 */
/* ------------------------------------------------------------------ */

/** An amphora (storage jar), standing on its toe at (x, y). */
export function amphora(x: number, y: number, k = 1, color = INK): SVGGElement {
  const g = s('g', { class: 'kit-amphora', transform: `translate(${r1(x)} ${r1(y)}) scale(${k})` });
  g.appendChild(
    s('path', {
      d: 'M-2 0L-3 -4C-12 -12 -15 -26 -13 -36C-11 -44 -6 -48 -5 -52L-5 -58L-7 -60L7 -60L5 -58L5 -52C6 -48 11 -44 13 -36C15 -26 12 -12 3 -4L2 0Z',
      fill: color,
    }),
  );
  g.appendChild(s('path', { d: 'M-5 -55C-12 -56 -13 -48 -10 -44M5 -55C12 -56 13 -48 10 -44', fill: 'none', stroke: color, 'stroke-width': 2 }));
  g.appendChild(s('path', { d: 'M-12 -30H12M-11.4 -26H11.4', fill: 'none', stroke: CLAY, 'stroke-width': 0.7 }));
  return g;
}

/** A shallow drinking cup (kylix) held or set down at (x, y). */
export function kylix(x: number, y: number, k = 1, color = INK): SVGGElement {
  const g = s('g', { class: 'kit-kylix', transform: `translate(${r1(x)} ${r1(y)}) scale(${k})` });
  g.appendChild(s('path', { d: 'M-12 -8Q0 2 12 -8ZM-2 -3H2L3 3H-3Z M-6 3H6V4.4H-6Z M-12 -8Q-17 -9 -16 -12M12 -8Q17 -9 16 -12', fill: color, stroke: color, 'stroke-width': 0.8 }));
  return g;
}

/** A coil of rope / a straight rope between points. */
export function rope(points: Vec[], color = INK, width = 1.6): SVGPathElement {
  return s('path', { d: smoothPath(points), fill: 'none', stroke: color, 'stroke-width': width, 'stroke-linecap': 'round', class: 'kit-rope' });
}

/** A splash of water (for things falling into the sea). */
export function splash(x: number, y: number, k = 1, color = WHITE): SVGGElement {
  const g = s('g', { class: 'kit-splash', transform: `translate(${r1(x)} ${r1(y)}) scale(${k})` });
  let d = '';
  for (const [dx, h] of [[-12, 14], [-6, 22], [0, 28], [6, 20], [12, 13]]) d += `M${dx} 0Q${dx * 1.4} ${-h * 0.6} ${dx * 1.9} ${-h}`;
  g.appendChild(s('path', { d, fill: 'none', stroke: color, 'stroke-width': 2, 'stroke-linecap': 'round' }));
  g.appendChild(s('circle', { cx: -22, cy: -18, r: 1.8, fill: color }));
  g.appendChild(s('circle', { cx: 20, cy: -22, r: 1.6, fill: color }));
  return g;
}

/* ------------------------------------------------------------------ */
/* Architecture                                                        */
/* ------------------------------------------------------------------ */

/** A Doric column from ground y upward. */
export function column(x: number, groundY: number, h = 120, w = 14): SVGGElement {
  const g = s('g', { class: 'kit-column', transform: `translate(${r1(x)} ${r1(groundY)})` });
  g.appendChild(s('path', { d: `M${-w / 2} 0L${-w * 0.42} ${-h + 10}H${w * 0.42}L${w / 2} 0Z`, fill: INK }));
  g.appendChild(s('path', { d: `M${-w * 0.8} ${-h + 10}Q0 ${-h + 16} ${w * 0.8} ${-h + 10}V${-h + 6}H${-w * 0.8}Z M${-w * 0.9} ${-h + 6}H${w * 0.9}V${-h}H${-w * 0.9}Z`, fill: INK }));
  let d = '';
  for (const fx of [-0.2, 0.05, 0.3]) d += `M${r1(fx * w)} -4L${r1(fx * w * 0.85)} ${-h + 14}`;
  g.appendChild(s('path', { d, stroke: CLAY, 'stroke-width': 0.6, opacity: 0.7 }));
  return g;
}

/**
 * A city wall with square towers and (optionally) a gate. `gate` gives the gate
 * centre x; returns the wall group and the gate leaves for opening.
 */
export function cityWall(y: number, opts: { from?: number; to?: number; height?: number; gate?: number; towers?: number[] } = {}): {
  g: SVGGElement;
  gateL: SVGPathElement | null;
  gateR: SVGPathElement | null;
  gateOpening: SVGPathElement | null;
} {
  const from = opts.from ?? -200, to = opts.to ?? 200, H = opts.height ?? 70;
  const g = s('g', { class: 'kit-wall' });
  // Masonry body.
  g.appendChild(s('rect', { x: from, y: y - H, width: to - from, height: H + 200, fill: INK }));
  // Crenellations.
  let cren = '';
  for (let x = from; x < to; x += 12) cren += `M${x} ${y - H}v-6h7v6z`;
  g.appendChild(s('path', { d: cren, fill: INK }));
  // Towers.
  for (const tx of opts.towers ?? []) {
    g.appendChild(s('path', { d: `M${tx - 16} ${y - H - 26}H${tx + 16}V${y}H${tx - 16}Z`, fill: INK }));
    let tc = '';
    for (let k = -16; k < 16; k += 8) tc += `M${tx + k} ${y - H - 26}v-6h5v6z`;
    g.appendChild(s('path', { d: tc, fill: INK }));
    g.appendChild(s('path', { d: `M${tx - 3} ${y - H - 10}v-9h6v9z`, fill: CLAY, opacity: 0.8 }));
  }
  // Ashlar courses (incised).
  let lines = '';
  for (let row = 1; row < 6; row++) {
    const yy = y - H + row * (H / 6);
    lines += `M${from} ${r1(yy)}H${to}`;
    for (let x = from + (row % 2) * 10; x < to; x += 22) lines += `M${x} ${r1(yy)}v${r1(H / 6)}`;
  }
  g.appendChild(s('path', { d: lines, stroke: CLAY, 'stroke-width': 0.5, opacity: 0.45 }));
  let gateL: SVGPathElement | null = null, gateR: SVGPathElement | null = null, gateOpening: SVGPathElement | null = null;
  if (opts.gate !== undefined) {
    const gx = opts.gate, gw = 44, gh = H * 0.78;
    gateOpening = s('path', { d: `M${gx - gw / 2} ${y}V${y - gh + 10}Q${gx} ${y - gh - 6} ${gx + gw / 2} ${y - gh + 10}V${y}Z`, fill: '#2b1a10' });
    g.appendChild(gateOpening);
    gateL = s('path', { d: `M${gx - gw / 2} ${y}V${y - gh + 10}Q${gx - gw / 4} ${y - gh - 2} ${gx} ${y - gh - 3}V${y}Z`, fill: CLAY, stroke: INK, 'stroke-width': 1, class: 'kit-gate kit-gate--l' });
    gateR = s('path', { d: `M${gx} ${y}V${y - gh - 3}Q${gx + gw / 4} ${y - gh - 2} ${gx + gw / 2} ${y - gh + 10}V${y}Z`, fill: CLAY, stroke: INK, 'stroke-width': 1, class: 'kit-gate kit-gate--r' });
    g.append(gateL, gateR);
    const studs = frag(
      [0.25, 0.5, 0.75]
        .map((t) => `<path d="M${gx - gw / 2 + 3} ${r1(y - gh * t)}H${gx + gw / 2 - 3}" stroke="${INK}" stroke-width="0.8" opacity=".7"/>`)
        .join(''),
    );
    studs.setAttribute('pointer-events', 'none');
    g.appendChild(studs);
  }
  return { g, gateL, gateR, gateOpening };
}

/* ------------------------------------------------------------------ */
/* Lettering & fillers                                                 */
/* ------------------------------------------------------------------ */

/**
 * A painted name beside a figure, as vase painters labelled their heroes
 * (e.g. ΟΔΥΣΣΕΥΣ). `angle` lets it run vertically along a figure.
 */
export function inscription(text: string, x: number, y: number, opts: { size?: number; angle?: number; color?: string; align?: 'start' | 'middle' | 'end' } = {}): SVGGElement {
  const t = greekText(text, { size: opts.size ?? 8, weight: 1.25, tracking: 1.8, align: opts.align ?? 'start' });
  const g = s('g', { class: 'kit-inscription', transform: `translate(${r1(x)} ${r1(y)}) rotate(${opts.angle ?? 0})` });
  g.style.color = opts.color ?? INK;
  g.appendChild(t.g);
  return g;
}

/** Filler rosettes/dots that archaic painters sprinkled in empty fields. */
export function fillers(points: Vec[], r = 4, color = INK): SVGGElement {
  const g = s('g', { class: 'kit-fillers' });
  let d = '';
  for (const [x, y] of points) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      d += `M${r1(x)} ${r1(y)}L${r1(x + Math.cos(a - 0.3) * r * 0.35)} ${r1(y + Math.sin(a - 0.3) * r * 0.35)}L${r1(x + Math.cos(a) * r)} ${r1(y + Math.sin(a) * r)}L${r1(x + Math.cos(a + 0.3) * r * 0.35)} ${r1(y + Math.sin(a + 0.3) * r * 0.35)}Z`;
    }
  }
  g.appendChild(s('path', { d, fill: color }));
  return g;
}

/** Soft radial glow (for magic, fire light, ghosts). Adds a gradient to `defs`. */
export function glow(defs: SVGDefsElement, x: number, y: number, r: number, color = WHITE, opacity = 0.6): SVGCircleElement {
  const id = nextId('glow');
  const grad = s('radialGradient', { id, 'data-scene': '' });
  grad.append(s('stop', { offset: '0%', 'stop-color': color, 'stop-opacity': opacity }), s('stop', { offset: '100%', 'stop-color': color, 'stop-opacity': 0 }));
  defs.appendChild(grad);
  return s('circle', { cx: x, cy: y, r, fill: `url(#${id})`, class: 'kit-glow', 'pointer-events': 'none' });
}

/** Dark overlay for night (paint it over the scene, under figures you want lit). */
export function nightVeil(opacity = 0.55): SVGRectElement {
  return s('rect', { x: -200, y: -200, width: 400, height: 400, fill: '#0b0a14', opacity, class: 'kit-night', 'pointer-events': 'none' });
}
