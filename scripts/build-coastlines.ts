/**
 * Builds the coastline paths used by the atlas from Natural Earth data
 * (via the `world-atlas` package). Run with `npm run map:build`
 * (Node ≥ 22.18, which executes TypeScript natively).
 *
 * Pipeline: TopoJSON → rings → project → clip to DATA_BOUNDS →
 * Visvalingam–Whyatt simplification → SVG path strings.
 * The generated module is committed so the site itself has no runtime
 * dependency on geographic tooling.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';
import { DATA_BOUNDS, project } from '../src/map/projection.ts';

type P = [number, number];

const topo = JSON.parse(
  readFileSync(new URL('../node_modules/world-atlas/land-10m.json', import.meta.url), 'utf8'),
);
const geo: any = feature(topo, topo.objects.land);
const geometries: any[] = geo.type === 'FeatureCollection' ? geo.features.map((f: any) => f.geometry) : [geo.geometry];

const rings: P[][] = [];
for (const g of geometries) {
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
  for (const poly of polys) for (const ring of poly) rings.push(ring as P[]);
}

const [cx0, cy0] = project(DATA_BOUNDS.lonMin, DATA_BOUNDS.latMax);
const [cx1, cy1] = project(DATA_BOUNDS.lonMax, DATA_BOUNDS.latMin);

function intersectsData(ring: P[]): boolean {
  let lo0 = Infinity, lo1 = -Infinity, la0 = Infinity, la1 = -Infinity;
  for (const [lo, la] of ring) {
    if (lo < lo0) lo0 = lo;
    if (lo > lo1) lo1 = lo;
    if (la < la0) la0 = la;
    if (la > la1) la1 = la;
  }
  return !(lo1 < DATA_BOUNDS.lonMin || lo0 > DATA_BOUNDS.lonMax || la1 < DATA_BOUNDS.latMin || la0 > DATA_BOUNDS.latMax);
}

/** Sutherland–Hodgman clipping against the axis-aligned data rectangle. */
function clip(ring: P[]): P[] {
  const edges: Array<[(p: P) => boolean, (a: P, b: P) => P]> = [
    [(p) => p[0] >= cx0, (a, b) => [cx0, a[1] + ((b[1] - a[1]) * (cx0 - a[0])) / (b[0] - a[0])]],
    [(p) => p[0] <= cx1, (a, b) => [cx1, a[1] + ((b[1] - a[1]) * (cx1 - a[0])) / (b[0] - a[0])]],
    [(p) => p[1] >= cy0, (a, b) => [a[0] + ((b[0] - a[0]) * (cy0 - a[1])) / (b[1] - a[1]), cy0]],
    [(p) => p[1] <= cy1, (a, b) => [a[0] + ((b[0] - a[0]) * (cy1 - a[1])) / (b[1] - a[1]), cy1]],
  ];
  let out = ring;
  for (const [inside, cross] of edges) {
    const input = out;
    out = [];
    if (!input.length) break;
    let prev = input[input.length - 1];
    for (const cur of input) {
      if (inside(cur)) {
        if (!inside(prev)) out.push(cross(prev, cur));
        out.push(cur);
      } else if (inside(prev)) {
        out.push(cross(prev, cur));
      }
      prev = cur;
    }
  }
  return out;
}

function triArea(a: P, b: P, c: P): number {
  return Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1])) / 2;
}

function ringArea(r: P[]): number {
  let s = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) s += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]);
  return Math.abs(s / 2);
}

/** Visvalingam–Whyatt simplification of a closed ring (no repeated end point). */
function simplify(ring: P[], minArea: number): P[] {
  const n = ring.length;
  if (n <= 4) return ring;
  const prev = new Int32Array(n), next = new Int32Array(n), area = new Float64Array(n);
  const alive = new Uint8Array(n).fill(1);
  for (let i = 0; i < n; i++) {
    prev[i] = (i - 1 + n) % n;
    next[i] = (i + 1) % n;
  }
  // Binary min-heap of [area, index] with lazy deletion.
  const heap: Array<[number, number]> = [];
  const push = (item: [number, number]) => {
    heap.push(item);
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[p][0] <= heap[i][0]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const pop = (): [number, number] => {
    const top = heap[0];
    const last = heap.pop()!;
    if (heap.length) {
      heap[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === i) break;
        [heap[m], heap[i]] = [heap[i], heap[m]];
        i = m;
      }
    }
    return top;
  };
  for (let i = 0; i < n; i++) {
    area[i] = triArea(ring[prev[i]], ring[i], ring[next[i]]);
    push([area[i], i]);
  }
  let count = n;
  let maxRemoved = 0;
  while (heap.length && count > 3) {
    const [a, i] = pop();
    if (!alive[i] || a !== area[i]) continue;
    // Enforce monotonic effective area so a point is never removed "before" its neighbours.
    const eff = Math.max(a, maxRemoved);
    if (eff >= minArea) break;
    maxRemoved = eff;
    alive[i] = 0;
    count--;
    const p = prev[i], q = next[i];
    next[p] = q;
    prev[q] = p;
    area[p] = triArea(ring[prev[p]], ring[p], ring[q]);
    area[q] = triArea(ring[p], ring[q], ring[next[q]]);
    push([area[p], p]);
    push([area[q], q]);
  }
  const out: P[] = [];
  for (let i = 0; i < n; i++) if (alive[i]) out.push(ring[i]);
  return out;
}

function toPath(rs: P[][]): string {
  const r1 = (v: number) => Math.round(v * 10) / 10;
  const fmt = (v: number) => {
    const s = (Math.round(v * 10) / 10).toString();
    return s.startsWith('0.') ? s.slice(1) : s.startsWith('-0.') ? '-' + s.slice(2) : s;
  };
  let d = '';
  for (const ring of rs) {
    let [px, py] = [r1(ring[0][0]), r1(ring[0][1])];
    d += `M${fmt(px)} ${fmt(py)}l`;
    const parts: string[] = [];
    for (let i = 1; i < ring.length; i++) {
      const x = r1(ring[i][0]), y = r1(ring[i][1]);
      const dx = x - px, dy = y - py;
      if (Math.abs(dx) < 1e-9 && Math.abs(dy) < 1e-9) continue;
      const sdy = fmt(dy);
      parts.push(fmt(dx) + (sdy.startsWith('-') ? sdy : ' ' + sdy));
      px = x;
      py = y;
    }
    d += parts.join(' ').replace(/ -/g, '-') + 'z';
  }
  return d;
}

function build(minVertexArea: number, minRingArea: number) {
  const out: P[][] = [];
  let points = 0;
  for (const ring of rings) {
    if (!intersectsData(ring)) continue;
    const projected = ring.slice(0, -1).map(([lo, la]) => project(lo, la) as P);
    const clipped = clip(projected);
    if (clipped.length < 3) continue;
    if (ringArea(clipped) < minRingArea) continue;
    const s = simplify(clipped, minVertexArea);
    if (s.length < 3 || ringArea(s) < minRingArea * 0.5) continue;
    points += s.length;
    out.push(s);
  }
  // Largest first: keeps the path deterministic and draws continents before islets.
  out.sort((a, b) => ringArea(b) - ringArea(a));
  return { d: toPath(out), rings: out.length, points, rings_: out };
}

/**
 * Split closed rings into open polylines per grid tile, so the browser can skip
 * painting coast strokes that are off screen. Each run keeps one extra vertex on
 * either side of a tile edge, so thick strokes join without notches.
 */
function tileLines(rs: P[][], cols: number, rows: number): string[] {
  const x0 = cx0, y0 = cy0, tw = (cx1 - cx0) / cols, th = (cy1 - cy0) / rows;
  const out: string[][] = Array.from({ length: cols * rows }, () => []);
  const tileOf = (p: P) => {
    const c = Math.min(cols - 1, Math.max(0, Math.floor((p[0] - x0) / tw)));
    const r = Math.min(rows - 1, Math.max(0, Math.floor((p[1] - y0) / th)));
    return r * cols + c;
  };
  const flush0 = (run: P[], tile: number) => {
    if (run.length < 2) return;
    // Same compact relative encoding as the fill paths (drop the closing 'z').
    out[tile].push(toPath([run]).replace(/z$/, ''));
  };
  for (const ring of rs) {
    const pts = [...ring, ring[0]];
    let run: P[] = [];
    let tile = tileOf(pts[0]);
    const flush = () => flush0(run, tile);
    for (let i = 0; i < pts.length; i++) {
      const t = tileOf(pts[i]);
      if (t !== tile) {
        run.push(pts[i]);
        flush();
        run = [pts[i - 1], pts[i]];
        tile = t;
      } else run.push(pts[i]);
    }
    flush();
  }
  return out.map((parts) => parts.join(''));
}

const detail = build(0.35, 1.2);
const coarse = build(6, 25);
const COLS = 8, ROWS = 5;
const coastTiles = tileLines(detail.rings_, COLS, ROWS);
const rippleTiles = tileLines(coarse.rings_, COLS, ROWS);

const banner = `/* Generated by scripts/build-coastlines.ts from Natural Earth 1:10m land (public domain). Do not edit. */\n`;
writeFileSync(
  new URL('../src/map/data/land.ts', import.meta.url),
  banner +
    `/** Detailed coastline (${detail.rings} rings, ${detail.points} vertices). */\n` +
    `export const LAND_PATH = ${JSON.stringify(detail.d)};\n\n` +
    `/** Generalised coastline for distant views and water lines (${coarse.rings} rings, ${coarse.points} vertices). */\n` +
    `export const LAND_COARSE_PATH = ${JSON.stringify(coarse.d)};\n\n` +
    `/** Detailed coast as open polylines split into a ${COLS}×${ROWS} grid (for culling). */\n` +
    `export const COAST_TILES: string[] = ${JSON.stringify(coastTiles)};\n\n` +
    `/** Generalised coast split into the same grid (for the water-line strokes). */\n` +
    `export const RIPPLE_TILES: string[] = ${JSON.stringify(rippleTiles)};\n`,
);
console.log(
  `detail: ${detail.rings} rings, ${detail.points} pts, ${(detail.d.length / 1024).toFixed(1)} KB\n` +
    `coarse: ${coarse.rings} rings, ${coarse.points} pts, ${(coarse.d.length / 1024).toFixed(1)} KB\n` +
    `tiles: coast ${(coastTiles.join('').length / 1024).toFixed(1)} KB, ripples ${(rippleTiles.join('').length / 1024).toFixed(1)} KB`,
);
