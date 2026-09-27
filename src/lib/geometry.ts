/** Planar geometry helpers shared by the map and the art kit. */
import { r1 } from './dom';

export type Vec = [number, number];

export const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]];
export const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1]];
export const mul = (a: Vec, k: number): Vec => [a[0] * k, a[1] * k];
export const len = (a: Vec): number => Math.hypot(a[0], a[1]);
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const lerpV = (a: Vec, b: Vec, t: number): Vec => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
export const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));
export const deg = (r: number): number => (r * 180) / Math.PI;
export const rad = (d: number): number => (d * Math.PI) / 180;

/** Point at `dist` from origin in direction `angleDeg` (0° = +x, clockwise with y down). */
export function polar(origin: Vec, dist: number, angleDeg: number): Vec {
  const a = rad(angleDeg);
  return [origin[0] + Math.cos(a) * dist, origin[1] + Math.sin(a) * dist];
}

export function smoothstep(e0: number, e1: number, x: number): number {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Centripetal-ish Catmull–Rom spline through points, emitted as cubic Béziers.
 * `tension` 0.5 is the classic uniform Catmull–Rom; lower values are tighter.
 */
export function smoothPath(pts: Vec[], closed = false, tension = 0.5): string {
  if (pts.length < 2) return '';
  if (pts.length === 2) return `M${r1(pts[0][0])} ${r1(pts[0][1])}L${r1(pts[1][0])} ${r1(pts[1][1])}`;
  const n = pts.length;
  const get = (i: number): Vec => {
    if (closed) return pts[(i + n) % n];
    return pts[clamp(i, 0, n - 1)];
  };
  const k = tension / 3 * 2; // 0.5 → 1/3 (classic)
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    const c1: Vec = [p1[0] + (p2[0] - p0[0]) * k / 2, p1[1] + (p2[1] - p0[1]) * k / 2];
    const c2: Vec = [p2[0] - (p3[0] - p1[0]) * k / 2, p2[1] - (p3[1] - p1[1]) * k / 2];
    d += `C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return closed ? d + 'Z' : d;
}

/** Straight polyline path. */
export function polyPath(pts: Vec[], closed = false): string {
  return pts.map((p, i) => `${i ? 'L' : 'M'}${r1(p[0])} ${r1(p[1])}`).join('') + (closed ? 'Z' : '');
}

/**
 * Outline of a tapered "limb" running from a to b with a width profile.
 * `profile` is a list of [t, halfWidthLeft, halfWidthRight] samples along the bone
 * (left = counter-clockwise side when walking a→b with y down). Returns a closed smooth path.
 */
export function limb(a: Vec, b: Vec, profile: Array<[number, number, number]>, capA = true, capB = true): string {
  const dir = sub(b, a);
  const L = len(dir) || 1e-6;
  const u: Vec = [dir[0] / L, dir[1] / L];
  const nrm: Vec = [u[1], -u[0]]; // left normal (y-down coordinates)
  const left: Vec[] = [];
  const right: Vec[] = [];
  for (const [t, wl, wr] of profile) {
    const c = add(a, mul(dir, t));
    left.push(add(c, mul(nrm, wl)));
    right.push(sub(c, mul(nrm, wr)));
  }
  const first = profile[0], last = profile[profile.length - 1];
  const pts: Vec[] = [...left];
  if (capB) pts.push(add(add(a, mul(dir, last[0])), mul(u, (last[1] + last[2]) * 0.45)));
  pts.push(...right.reverse());
  if (capA) pts.push(sub(add(a, mul(dir, first[0])), mul(u, (first[1] + first[2]) * 0.45)));
  return smoothPath(pts, true, 0.42);
}

/** Axis-aligned bounds of points. */
export function bounds(pts: Vec[]): { x: number; y: number; w: number; h: number } {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of pts) {
    if (x < x0) x0 = x;
    if (y < y0) y0 = y;
    if (x > x1) x1 = x;
    if (y > y1) y1 = y;
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

/** Evaluate a uniform Catmull–Rom spline through `pts` at `samples` evenly spaced parameters. */
export function sampleSpline(pts: Vec[], samples: number): Vec[] {
  if (pts.length < 2) return pts.slice();
  const out: Vec[] = [];
  const n = pts.length - 1;
  for (let i = 0; i <= samples; i++) {
    const u = (i / samples) * n;
    const k = Math.min(n - 1, Math.floor(u));
    const t = u - k;
    const p0 = pts[Math.max(0, k - 1)], p1 = pts[k], p2 = pts[k + 1], p3 = pts[Math.min(n, k + 2)];
    const t2 = t * t, t3 = t2 * t;
    const f = (a: number, b: number, c: number, d: number) =>
      0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
    out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
  }
  return out;
}

export type WidthStops = Array<[t: number, w: number]>;

/** Piecewise-linear lookup in width stops (t ascending in [0,1]). */
export function stopAt(stops: WidthStops, t: number): number {
  if (t <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    const [t1, w1] = stops[i];
    if (t <= t1) {
      const [t0, w0] = stops[i - 1];
      return w0 + ((w1 - w0) * (t - t0)) / (t1 - t0 || 1);
    }
  }
  return stops[stops.length - 1][1];
}

/**
 * A filled "ribbon" of varying width along a smooth centreline — tapering
 * strokes for tails, horns, necks, locks of hair, the curl of a ship's stern.
 * `widths` are full widths at arc-length fractions.
 */
export function ribbon(center: Vec[], widths: WidthStops, samples = 48, roundEnds = true): string {
  const c = sampleSpline(center, samples);
  const acc = [0];
  for (let i = 1; i < c.length; i++) acc.push(acc[i - 1] + Math.hypot(c[i][0] - c[i - 1][0], c[i][1] - c[i - 1][1]));
  const total = acc[acc.length - 1] || 1;
  const left: Vec[] = [];
  const right: Vec[] = [];
  for (let i = 0; i < c.length; i++) {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(c.length - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const l = Math.hypot(tx, ty) || 1;
    tx /= l;
    ty /= l;
    const w = stopAt(widths, acc[i] / total) / 2;
    left.push([c[i][0] + ty * w, c[i][1] - tx * w]);
    right.push([c[i][0] - ty * w, c[i][1] + tx * w]);
  }
  const cap = (p: Vec, q: Vec, dirSign: number, center0: Vec, prev: Vec): Vec[] => {
    if (!roundEnds) return [];
    const w = Math.hypot(p[0] - q[0], p[1] - q[1]) / 2;
    if (w < 0.05) return [];
    let tx = center0[0] - prev[0], ty = center0[1] - prev[1];
    const l = Math.hypot(tx, ty) || 1;
    tx = (tx / l) * dirSign;
    ty = (ty / l) * dirSign;
    return [[center0[0] + tx * w * 0.9, center0[1] + ty * w * 0.9]];
  };
  const endCap = cap(left[left.length - 1], right[right.length - 1], 1, c[c.length - 1], c[c.length - 2]);
  const startCap = cap(left[0], right[0], 1, c[0], c[1]);
  const pts = [...left, ...endCap, ...right.reverse(), ...startCap];
  return pts.map((p, i) => `${i ? 'L' : 'M'}${r1(p[0])} ${r1(p[1])}`).join('') + 'Z';
}
