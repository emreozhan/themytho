/**
 * Ornament vocabulary of Greek pottery: the running meander (Greek key),
 * the wave scroll, dotted bands, rosettes and palmettes. Bands can be laid
 * out straight or bent around a circle (for kylix tondos and map cartouches).
 */
import { s, r1 } from '../lib/dom';
import type { Vec } from '../lib/geometry';

/** One period of a running key on a 10 × 12 cell (continuous polyline). */
const KEY_UNIT: Vec[] = [
  [0, 10], [0, 2], [8, 2], [8, 8], [4, 8], [4, 6], [6, 6], [6, 4], [2, 4], [2, 10], [10, 10],
];
const KEY_W = 10;
const KEY_H = 12;

function keyStrip(units: number): Vec[] {
  const pts: Vec[] = [];
  for (let u = 0; u < units; u++) {
    KEY_UNIT.forEach((p, i) => {
      if (u > 0 && i === 0) return; // shared joint with the previous unit
      pts.push([p[0] + u * KEY_W, p[1]]);
    });
  }
  return pts;
}

/** Subdivide a polyline so it bends smoothly when mapped to polar coordinates. */
function densify(pts: Vec[], step: number): Vec[] {
  const out: Vec[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / step));
    for (let k = 1; k <= n; k++) out.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n]);
  }
  return out;
}

function toPolar(p: Vec, totalW: number, rOuter: number, rInner: number, bandH: number, start = -90): Vec {
  const ang = ((start + (p[0] / totalW) * 360) * Math.PI) / 180;
  const r = rOuter - (p[1] / bandH) * (rOuter - rInner);
  return [Math.cos(ang) * r, Math.sin(ang) * r];
}

function pathOf(pts: Vec[], closed = false): string {
  return pts.map((p, i) => `${i ? 'L' : 'M'}${r1(p[0])} ${r1(p[1])}`).join('') + (closed ? 'Z' : '');
}

export interface RingOptions {
  rOuter: number;
  rInner: number;
  /** Number of pattern repeats around the circle. */
  units?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
}

/** A meander band bent into a ring (centred on 0,0). */
export function meanderRing(o: RingOptions): SVGGElement {
  const circumference = Math.PI * (o.rOuter + o.rInner);
  const bandH = o.rOuter - o.rInner;
  const units = o.units ?? Math.max(12, Math.round(circumference / (bandH * (KEY_W / KEY_H))));
  const total = units * KEY_W;
  const strip = densify(keyStrip(units), 1.2);
  const d = pathOf(strip.map((p) => toPolar(p, total, o.rOuter, o.rInner, KEY_H)));
  const g = s('g', { class: o.className ?? 'meander-ring', fill: 'none', stroke: o.color ?? 'currentColor' });
  const sw = o.strokeWidth ?? bandH * 0.12;
  g.appendChild(s('path', { d, 'stroke-width': r1(sw), 'stroke-linejoin': 'miter', 'stroke-linecap': 'square' }));
  g.appendChild(s('circle', { r: r1(o.rOuter), 'stroke-width': r1(sw * 0.9) }));
  g.appendChild(s('circle', { r: r1(o.rInner), 'stroke-width': r1(sw * 0.9) }));
  return g;
}

/** Straight meander strip path (for friezes), `height` sets the band height. */
export function meanderStripPath(width: number, height: number, x = 0, y = 0): string {
  const k = height / KEY_H;
  const units = Math.max(1, Math.round(width / (KEY_W * k)));
  const kx = width / (units * KEY_W);
  const pts = keyStrip(units).map(([px, py]) => [x + px * kx, y + py * k] as Vec);
  return pathOf(pts);
}

/**
 * Tileable meander as an SVG data URI for CSS backgrounds (one unit wide).
 * `height` is the tile height in CSS px.
 */
export function meanderTileURI(color: string, height = 14, weight = 1.6): string {
  const w = (KEY_W / KEY_H) * height;
  const k = height / KEY_H;
  const d = pathOf(KEY_UNIT.map(([x, y]) => [x * k, y * k] as Vec));
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${r1(w)}" height="${height}" viewBox="0 0 ${r1(w)} ${height}">` +
    `<path d="${d}" fill="none" stroke="${color}" stroke-width="${weight}" stroke-linecap="square"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** One crest of the running wave scroll, on a 16 × 10 cell, filled. */
function waveCrest(x: number, k: number): string {
  const p = (px: number, py: number) => `${r1(x + px * k)} ${r1(py * k)}`;
  return (
    `M${p(0, 10)}C${p(4, 10)} ${p(6, 8)} ${p(7, 5)}C${p(8, 2)} ${p(11, 0.6)} ${p(13.4, 1.8)}` +
    `C${p(15.6, 3)} ${p(15.4, 6.2)} ${p(13, 6.6)}C${p(11.2, 6.9)} ${p(10.4, 5)} ${p(11.8, 4.2)}` +
    `C${p(10, 4.6)} ${p(9.4, 7.4)} ${p(11, 8.8)}C${p(12.4, 10)} ${p(14.6, 10)} ${p(16, 10)}Z`
  );
}

/** Straight wave-scroll band path (filled), `height` = band height. */
export function waveStripPath(width: number, height: number): string {
  const k = height / 10;
  const unit = 16 * k;
  const n = Math.max(1, Math.round(width / unit));
  const kk = width / (n * 16);
  let d = '';
  for (let i = 0; i < n; i++) d += waveCrest(i * 16 * kk, kk);
  return d;
}

/** Tileable wave scroll data URI for CSS backgrounds. */
export function waveTileURI(color: string, height = 14): string {
  const k = height / 10;
  const w = 16 * k;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${r1(w)}" height="${height}" viewBox="0 0 ${r1(w)} ${height}">` +
    `<path d="${waveCrest(0, k)}" fill="${color}"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** Wave scroll bent into a ring. */
export function waveRing(o: RingOptions): SVGGElement {
  const bandH = o.rOuter - o.rInner;
  const circumference = Math.PI * (o.rOuter + o.rInner);
  const units = o.units ?? Math.max(10, Math.round(circumference / (bandH * 1.6)));
  const total = units * 16;
  // Sample each crest's outline by parsing a dense polyline approximation.
  const crest: Vec[] = [];
  const bez = (a: Vec, b: Vec, c: Vec, d: Vec, n = 8) => {
    for (let i = 1; i <= n; i++) {
      const t = i / n, u = 1 - t;
      crest.push([
        u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
        u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
      ]);
    }
  };
  let cur: Vec = [0, 10];
  crest.push(cur);
  const segs: Array<[Vec, Vec, Vec]> = [
    [[4, 10], [6, 8], [7, 5]],
    [[8, 2], [11, 0.6], [13.4, 1.8]],
    [[15.6, 3], [15.4, 6.2], [13, 6.6]],
    [[11.2, 6.9], [10.4, 5], [11.8, 4.2]],
    [[10, 4.6], [9.4, 7.4], [11, 8.8]],
    [[12.4, 10], [14.6, 10], [16, 10]],
  ];
  for (const [b, c, d] of segs) {
    bez(cur, b, c, d);
    cur = d;
  }
  let d = '';
  for (let u = 0; u < units; u++) {
    const pts = crest.map(([x, y]) => toPolar([x + u * 16, y * 1.2], total, o.rOuter, o.rInner, 12));
    d += pathOf(pts, true);
  }
  const g = s('g', { class: o.className ?? 'wave-ring' });
  g.appendChild(s('path', { d, fill: o.color ?? 'currentColor' }));
  return g;
}

/** Ring of dots (a common secondary border). */
export function dotRing(r: number, count: number, dotR: number, color = 'currentColor'): SVGPathElement {
  let d = '';
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    d += `M${r1(x - dotR)} ${r1(y)}a${dotR} ${dotR} 0 1 0 ${r1(dotR * 2)} 0a${dotR} ${dotR} 0 1 0 ${r1(-dotR * 2)} 0`;
  }
  return s('path', { d, fill: color });
}

/** A four- or eight-petal rosette, the filler ornament of black-figure fields. */
export function rosette(cx: number, cy: number, r: number, petals = 8, color = 'currentColor'): SVGGElement {
  const g = s('g', { transform: `translate(${r1(cx)} ${r1(cy)})`, fill: color });
  let d = '';
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2;
    const tip: Vec = [Math.cos(a) * r, Math.sin(a) * r];
    const side = r * 0.32;
    const l: Vec = [Math.cos(a - 0.5) * side, Math.sin(a - 0.5) * side];
    const rr: Vec = [Math.cos(a + 0.5) * side, Math.sin(a + 0.5) * side];
    d += `M0 0Q${r1(l[0])} ${r1(l[1])} ${r1(tip[0])} ${r1(tip[1])}Q${r1(rr[0])} ${r1(rr[1])} 0 0Z`;
  }
  g.appendChild(s('path', { d }));
  g.appendChild(s('circle', { r: r1(r * 0.22) }));
  return g;
}

/** A palmette fan (upright), base at 0,0, height h. */
export function palmettePath(h: number, leaves = 7): string {
  let d = '';
  const spread = 110;
  for (let i = 0; i < leaves; i++) {
    const a = -90 - spread / 2 + (spread * i) / (leaves - 1);
    const rad = (a * Math.PI) / 180;
    const L = h * (0.72 + 0.28 * Math.cos(((i - (leaves - 1) / 2) / leaves) * Math.PI));
    const tip: Vec = [Math.cos(rad) * L, Math.sin(rad) * L];
    const w = h * 0.075;
    const nx = -Math.sin(rad) * w, ny = Math.cos(rad) * w;
    d +=
      `M${r1(nx * 0.4)} ${r1(ny * 0.4 - h * 0.06)}` +
      `Q${r1(tip[0] * 0.6 + nx)} ${r1(tip[1] * 0.6 + ny)} ${r1(tip[0])} ${r1(tip[1])}` +
      `Q${r1(tip[0] * 0.6 - nx)} ${r1(tip[1] * 0.6 - ny)} ${r1(-nx * 0.4)} ${r1(-ny * 0.4 - h * 0.06)}Z`;
  }
  d += `M${r1(-h * 0.16)} 0A${r1(h * 0.16)} ${r1(h * 0.12)} 0 0 1 ${r1(h * 0.16)} 0Z`;
  return d;
}
