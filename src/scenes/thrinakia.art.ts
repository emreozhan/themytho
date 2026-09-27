/**
 * Art for ΙΕʹ Thrinakia — the cattle of the Sun.
 *
 * Helios's radiant disc (added white with glaze rays), a moon whose phase can
 * be set continuously, spits of lowing meat, storm clouds,
 * fishing tackle for the starving crew, wind streaks, the rocky shore and
 * the wreck Odysseus rides after the thunderbolt.
 */
import { s } from '../lib/dom';
import { ribbon, smoothPath, type Vec } from '../lib/geometry';
import { rng, range } from '../lib/random';
import { INK, CLAY, WHITE, PURPLE } from '../art/figure';

const f1 = (v: number) => (Math.round(v * 10) / 10).toString();

/** Helios's radiant nimbus: a white disc with a crown of alternating glaze rays. */
export function nimbus(r = 22): { g: SVGGElement; rays: SVGGElement } {
  const g = s('g', { class: 'thr-nimbus' });
  const rays = s('g', { class: 'thr-nimbus__rays' });
  let long = '';
  let short = '';
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const w = i % 2 ? 0.07 : 0.1;
    const r0 = r + 2, r1 = r + (i % 2 ? 9 : 17);
    const d = `M${f1(Math.cos(a - w) * r0)} ${f1(Math.sin(a - w) * r0)}L${f1(Math.cos(a) * r1)} ${f1(Math.sin(a) * r1)}L${f1(Math.cos(a + w) * r0)} ${f1(Math.sin(a + w) * r0)}Z`;
    if (i % 2) short += d;
    else long += d;
  }
  rays.appendChild(s('path', { d: long, fill: INK }));
  rays.appendChild(s('path', { d: short, fill: PURPLE }));
  g.appendChild(rays);
  g.appendChild(s('circle', { r, fill: WHITE, stroke: INK, 'stroke-width': 1.4 }));
  g.appendChild(s('circle', { r: r - 3.2, fill: 'none', stroke: INK, 'stroke-width': 0.6, 'stroke-dasharray': '1.5 2.2' }));
  return { g, rays };
}

/**
 * The lit part of the moon at phase p (0 new → 0.5 full → 1 new), radius r.
 * Waxing light sits on the right; the terminator is a half-ellipse.
 */
export function moonPath(r: number, p: number): string {
  const ph = ((p % 1) + 1) % 1;
  const k = Math.cos(ph * Math.PI * 2); // 1 new, -1 full
  const rx = Math.max(0.01, Math.abs(k) * r);
  const waxing = ph < 0.5;
  // Limb: right half when waxing, left half when waning.
  const limb = waxing ? `M0 ${-r}A${r} ${r} 0 0 1 0 ${r}` : `M0 ${-r}A${r} ${r} 0 0 0 0 ${r}`;
  // Terminator from bottom back to top; bulges towards the limb for a crescent.
  const crescent = k > 0;
  const sweep = waxing ? (crescent ? 0 : 1) : crescent ? 1 : 0;
  return `${limb}A${f1(rx)} ${r} 0 0 ${sweep} 0 ${-r}Z`;
}

/** A spit (obelos) with chunks of meat, grip at the origin, running along +x. */
export function spit(len = 70, seed = 2): { g: SVGGElement; meat: SVGGElement } {
  const rand = rng(seed);
  const g = s('g', { class: 'thr-spit' });
  g.appendChild(s('path', { d: `M0 0H${len}`, stroke: INK, 'stroke-width': 1.2, 'stroke-linecap': 'round' }));
  g.appendChild(s('path', { d: `M${len} -1.2L${len + 5} 0L${len} 1.2Z`, fill: INK }));
  g.appendChild(s('path', { d: 'M-3 -2.4H0V2.4H-3Z', fill: INK }));
  const meat = s('g', { class: 'thr-meat' });
  for (let i = 0; i < 4; i++) {
    const x = len * (0.36 + i * 0.16);
    const w = range(rand, 4.4, 6), h = range(rand, 4.2, 5.6);
    const chunk = s('g', { transform: `translate(${f1(x)} 0)` });
    chunk.appendChild(s('path', { d: `M${f1(-w)} 0C${f1(-w)} ${f1(-h * 1.2)} ${f1(w)} ${f1(-h * 1.3)} ${f1(w)} 0C${f1(w)} ${f1(h * 1.2)} ${f1(-w)} ${f1(h * 1.1)} ${f1(-w)} 0Z`, fill: i % 2 ? PURPLE : INK, stroke: INK, 'stroke-width': 0.6 }));
    chunk.appendChild(s('path', { d: `M${f1(-w * 0.5)} ${f1(-h * 0.5)}Q0 ${f1(-h * 0.1)} ${f1(w * 0.5)} ${f1(-h * 0.5)}`, fill: 'none', stroke: i % 2 ? INK : CLAY, 'stroke-width': 0.5 }));
    meat.appendChild(chunk);
  }
  g.appendChild(meat);
  return { g, meat };
}

/** A forked stick that holds a spit over the fire. */
export function fork(h = 30): SVGPathElement {
  return s('path', { d: `M0 0L0 ${-h + 6}M0 ${-h + 6}L-4 ${-h}M0 ${-h + 6}L4 ${-h}`, stroke: INK, 'stroke-width': 2, 'stroke-linecap': 'round', fill: 'none' });
}

/** A small fish (≈16 long) facing +x. */
export function fish(color = INK): SVGGElement {
  const g = s('g', { class: 'thr-fish' });
  g.appendChild(s('path', { d: 'M-8 0C-4 -4.6 4 -4.6 8 0C4 4.6 -4 4.6 -8 0ZM-8 0L-12 -4L-11 0L-12 4Z', fill: color }));
  g.appendChild(s('circle', { cx: 4.8, cy: -0.8, r: 0.7, fill: color === INK ? CLAY : INK }));
  return g;
}

/** Streaks of the south wind (Notos), blowing towards +x. */
export function windStreaks(seed = 4): SVGGElement {
  const rand = rng(seed);
  const g = s('g', { class: 'thr-wind' });
  let d = '';
  for (let i = 0; i < 9; i++) {
    const x = range(rand, -170, 60), y = range(rand, -120, 30), L = range(rand, 40, 80);
    d += `M${f1(x)} ${f1(y)}q${f1(L * 0.4)} ${f1(-range(rand, 3, 7))} ${f1(L)} ${f1(-range(rand, -2, 3))}`;
    d += `m0 0q${f1(6)} ${f1(-3)} ${f1(3)} ${f1(-7)}`;
  }
  g.appendChild(s('path', { d, fill: 'none', stroke: WHITE, 'stroke-width': 1.1, 'stroke-linecap': 'round', opacity: 0.8 }));
  return g;
}

/** A storm cloud: glaze scallops over a flat base, each with an incised inner curl. */
export function stormCloud(x: number, y: number, w = 120, seed = 1): SVGGElement {
  const rand = rng(seed);
  const g = s('g', { class: 'thr-cloud', transform: `translate(${f1(x)} ${f1(y)})` });
  const n = Math.max(3, Math.round(w / 26));
  const step = w / n;
  let d = `M${f1(-w / 2)} 0`;
  let inc = '';
  for (let i = 0; i < n; i++) {
    const x0 = -w / 2 + i * step;
    const h = range(rand, 11, 19) + (i === Math.floor(n / 2) ? 5 : 0);
    d += `C${f1(x0 - 1)} ${f1(-h * 1.45)} ${f1(x0 + step + 1)} ${f1(-h * 1.45)} ${f1(x0 + step)} 0`;
    inc += `M${f1(x0 + step * 0.26)} ${f1(-h * 0.3)}C${f1(x0 + step * 0.26)} ${f1(-h * 0.95)} ${f1(x0 + step * 0.78)} ${f1(-h * 0.95)} ${f1(x0 + step * 0.74)} ${f1(-h * 0.42)}`;
  }
  d += `Q${f1(w / 4)} ${f1(4)} 0 1Q${f1(-w / 4)} ${f1(4)} ${f1(-w / 2)} 0Z`;
  g.appendChild(s('path', { d, fill: INK }));
  g.appendChild(s('path', { d: inc, fill: 'none', stroke: CLAY, 'stroke-width': 0.8, opacity: 0.6, 'stroke-linecap': 'round' }));
  return g;
}

/** A craggy shore rock with incised strata, from a list of outline points. */
export function crag(points: Vec[], seed = 5): SVGGElement {
  const g = s('g', { class: 'thr-crag' });
  g.appendChild(s('path', { d: smoothPath(points, true, 0.2), fill: INK, stroke: CLAY, 'stroke-width': 1, 'paint-order': 'stroke' }));
  const xs = points.map((p) => p[0]), ys = points.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const rand = rng(seed);
  let d = '';
  for (let i = 1; i <= 4; i++) {
    const y = y0 + ((y1 - y0) * i) / 5;
    const xa = x0 + (x1 - x0) * range(rand, 0.1, 0.3), xb = x0 + (x1 - x0) * range(rand, 0.6, 0.9);
    d += `M${f1(xa)} ${f1(y)}q${f1((xb - xa) / 2)} ${f1(range(rand, -4, 4))} ${f1(xb - xa)} ${f1(range(rand, -2, 2))}`;
  }
  g.appendChild(s('path', { d, fill: 'none', stroke: CLAY, 'stroke-width': 0.8, opacity: 0.7, 'stroke-linecap': 'round' }));
  return g;
}

/** The keel and the mast lashed together (≈90 long): what Odysseus rides. */
export function wreckage(): SVGGElement {
  const g = s('g', { class: 'thr-wreckage' });
  g.appendChild(s('path', { d: ribbon([[-46, 2], [-10, 0.4], [30, 1], [46, 3]], [[0, 5], [0.5, 6.4], [1, 4]], 30), fill: INK }));
  g.appendChild(s('path', { d: ribbon([[-40, -3], [0, -4.6], [42, -3.4]], [[0, 3], [1, 2.4]], 20), fill: INK, stroke: CLAY, 'stroke-width': 0.8, 'paint-order': 'stroke' }));
  // The backstay lashing, in added white.
  g.appendChild(s('path', { d: 'M-30 -7L-26 4M-27 -7L-23 4M18 -7L22 4M21 -7L25 4', stroke: WHITE, 'stroke-width': 0.9, 'stroke-linecap': 'round' }));
  return g;
}

/** Floating splinters of the broken ship. */
export function planks(seed = 9): SVGGElement {
  const rand = rng(seed);
  const g = s('g', { class: 'thr-planks' });
  let d = '';
  for (let i = 0; i < 5; i++) {
    const x = range(rand, -40, 40), y = range(rand, -4, 6), L = range(rand, 8, 16), a = range(rand, -0.4, 0.4);
    const dx = Math.cos(a) * L, dy = Math.sin(a) * L;
    d += `M${f1(x)} ${f1(y)}l${f1(dx)} ${f1(dy)}`;
  }
  g.appendChild(s('path', { d, stroke: INK, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
  return g;
}
