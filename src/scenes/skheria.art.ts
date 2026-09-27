/**
 * Props for the Phaeacian chapter: Poseidon's trident, a raft of loose logs
 * that can break apart, Ino-Leukothea's veil, a ball, washed clothes on
 * stones, a leafy olive branch, the bard's concert lyre (kithara), a chair,
 * a stool, a feast table, a krater and a falcon.
 */
import { s } from '../lib/dom';
import { ribbon, type Vec } from '../lib/geometry';
import { INK, CLAY, WHITE, PURPLE } from '../art/figure';

const f1 = (v: number) => Math.round(v * 10) / 10;

/** Poseidon's trident from a (butt) to b (the prongs), prongs facing away from a. */
export function trident(a: Vec, b: Vec, w = 1.6): SVGGElement {
  const g = s('g', { class: 'trident' });
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const L = Math.hypot(dx, dy) || 1;
  const ux = dx / L, uy = dy / L;
  const nx = -uy, ny = ux;
  g.appendChild(s('line', { x1: f1(a[0]), y1: f1(a[1]), x2: f1(b[0] - ux * 10), y2: f1(b[1] - uy * 10), stroke: INK, 'stroke-width': w, 'stroke-linecap': 'round' }));
  const at = (t: number, n: number): Vec => [b[0] - ux * t + nx * n, b[1] - uy * t + ny * n];
  const P = (v: Vec) => `${f1(v[0])} ${f1(v[1])}`;
  // Cross-bar curving up into the two outer prongs, a straight middle prong; barbed tips.
  const d =
    `M${P(at(12, 0))}Q${P(at(12, 6.5))} ${P(at(4, 6.5))}L${P(at(-1, 6.2))}` +
    `M${P(at(12, 0))}Q${P(at(12, -6.5))} ${P(at(4, -6.5))}L${P(at(-1, -6.2))}` +
    `M${P(at(12, 0))}L${P(at(-3, 0))}`;
  g.appendChild(s('path', { d, fill: 'none', stroke: INK, 'stroke-width': w * 0.9, 'stroke-linecap': 'round' }));
  const barb = (t: Vec, side: number) => `M${P(t)}l${f1(-ux * 3.6 + nx * 1.8 * side)} ${f1(-uy * 3.6 + ny * 1.8 * side)}`;
  g.appendChild(s('path', { d: barb(at(-1, 6.2), 1) + barb(at(-1, -6.2), -1) + barb(at(-3, 0), 1), fill: 'none', stroke: INK, 'stroke-width': w * 0.7, 'stroke-linecap': 'round' }));
  return g;
}

export interface Raft {
  g: SVGGElement;
  logs: SVGGElement[];
  mast: SVGGElement;
}

/** A raft of five lashed logs with a stubby mast and sail; each log is its own group. Deck at y = 0. */
export function breakableRaft(): Raft {
  const g = s('g', { class: 'raft' });
  const mast = s('g', { class: 'raft__mast' });
  mast.appendChild(s('line', { x1: 0, y1: 0, x2: 0, y2: -40, stroke: INK, 'stroke-width': 2.2, 'stroke-linecap': 'round' }));
  mast.appendChild(s('path', { d: 'M-16 -36Q0 -39.5 16 -36C17.4 -28 17.4 -18 16 -10Q0 -7 -16 -10C-17.4 -18 -17.4 -28 -16 -36Z', fill: WHITE, stroke: INK, 'stroke-width': 1 }));
  mast.appendChild(s('path', { d: 'M-8 -37.4Q-6.6 -24 -8 -9M0 -38.4V-8.4M8 -37.4Q9.4 -24 8 -9', fill: 'none', stroke: INK, 'stroke-width': 0.45, opacity: 0.6 }));
  g.appendChild(mast);
  const logs: SVGGElement[] = [];
  for (let i = 0; i < 5; i++) {
    const lg = s('g', { class: 'raft__log' });
    const x0 = -30 + (i % 2) * 2.6, len = 58 - (i % 3) * 3;
    const y = 1.3 + i * 0.1;
    lg.appendChild(s('rect', { x: x0, y: y - 2.1, width: len, height: 4.2, rx: 2.1, fill: INK, stroke: CLAY, 'stroke-width': 0.5, 'paint-order': 'stroke' }));
    lg.appendChild(s('path', { d: `M${x0 + len - 3} ${y - 1.4}a1.2 1.4 0 1 0 0.1 0`, fill: 'none', stroke: CLAY, 'stroke-width': 0.4 }));
    logs.push(lg);
  }
  // Logs are seen end-on in a stack: draw them as parallel bands one above another.
  logs.forEach((lg, i) => lg.setAttribute('transform', `translate(0 ${f1(i * 3.4 - 3)})`));
  logs.forEach((lg) => g.appendChild(lg));
  // Lashings.
  const lash = s('path', { d: 'M-20 -5V12M0 -5V12M20 -5V12', stroke: CLAY, 'stroke-width': 0.8, 'stroke-dasharray': '1.2 1' });
  g.appendChild(lash);
  return { g, logs, mast };
}

/** A ball of stitched leather: white with purple segments. */
export function ball(r = 4.4): SVGGElement {
  const g = s('g', { class: 'ball' });
  g.appendChild(s('circle', { r, fill: WHITE, stroke: INK, 'stroke-width': 0.6 }));
  g.appendChild(s('path', { d: `M${-r} 0Q0 ${-r * 0.7} ${r} 0M0 ${-r}Q${r * 0.6} 0 0 ${r}`, fill: 'none', stroke: PURPLE, 'stroke-width': 1.1 }));
  return g;
}

/** A washed garment spread over a stone to dry. */
export function clothOnStone(x: number, y: number, w: number, color: string, seed = 1): SVGGElement {
  const g = s('g', { class: 'cloth', transform: `translate(${f1(x)} ${f1(y)})` });
  const h = w * 0.34;
  g.appendChild(s('path', { d: `M${-w * 0.6} 0C${-w * 0.56} ${-h * 1.3} ${w * 0.5} ${-h * 1.4} ${w * 0.62} 0Z`, fill: INK }));
  const hang = 2 + (seed % 3);
  g.appendChild(s('path', {
    d: `M${-w * 0.5} ${-h * 0.2}C${-w * 0.46} ${-h * 1.3} ${w * 0.44} ${-h * 1.35} ${w * 0.5} ${-h * 0.2}L${w * 0.54} ${hang}L${w * 0.3} ${hang - 1.2}L${w * 0.1} ${hang + 0.6}L${-w * 0.14} ${hang - 1}L${-w * 0.34} ${hang + 0.4}L${-w * 0.54} ${hang - 0.6}Z`,
    fill: color, stroke: INK, 'stroke-width': 0.5,
  }));
  let folds = '';
  for (let i = -2; i <= 2; i++) folds += `M${f1(i * w * 0.16)} ${f1(-h * 0.9)}L${f1(i * w * 0.18)} ${hang - 1}`;
  g.appendChild(s('path', { d: folds, stroke: color === WHITE ? INK : CLAY, 'stroke-width': 0.4, opacity: 0.7 }));
  if (color === WHITE) g.appendChild(s('path', { d: `M${-w * 0.48} ${hang - 2.2}H${w * 0.5}`, stroke: PURPLE, 'stroke-width': 1 }));
  return g;
}

/** A leafy olive branch held upright; stem from 0,0 to 0,-L. */
export function oliveBranch(L = 34): SVGGElement {
  const g = s('g', { class: 'olive-branch' });
  g.appendChild(s('path', { d: ribbon([[0, 0], [1.2, -L * 0.5], [-0.6, -L]], [[0, 1.8], [1, 0.7]], 16), fill: INK }));
  let d = '';
  for (let i = 0; i < 11; i++) {
    const t = 0.18 + (i / 11) * 0.8;
    const y = -L * t;
    const side = i % 2 ? 1 : -1;
    const len = 7.5 - t * 2.4;
    const ang = side * (40 + (i % 3) * 12);
    const a = (ang * Math.PI) / 180;
    const ex = Math.sin(a) * len, ey = -Math.cos(a) * len;
    const w = 1.6;
    d += `M0 ${f1(y)}Q${f1(ex / 2 - Math.cos(a) * w)} ${f1(y + ey / 2 - Math.sin(a) * w)} ${f1(ex)} ${f1(y + ey)}Q${f1(ex / 2 + Math.cos(a) * w)} ${f1(y + ey / 2 + Math.sin(a) * w)} 0 ${f1(y)}Z`;
  }
  g.appendChild(s('path', { d, fill: INK, stroke: CLAY, 'stroke-width': 0.35, 'paint-order': 'stroke' }));
  return g;
}

/** A concert lyre (kithara): a big square-based sound box, broad arms, a crossbar and seven strings. Base at 0,0, height ≈ 36. */
export function kithara(): SVGGElement {
  const g = s('g', { class: 'kithara' });
  g.appendChild(s('path', {
    d: 'M-10 0L10 0L11.6 -8C12.6 -14 14.6 -20 13 -27C12.2 -31 13.6 -34.4 15.6 -35.4L13 -37.2C10.6 -35.6 9.4 -32.4 9.8 -28.6C10.2 -23 8.6 -17 7.2 -12.6L-7.2 -12.6C-8.6 -17 -10.2 -23 -9.8 -28.6C-9.4 -32.4 -10.6 -35.6 -13 -37.2L-15.6 -35.4C-13.6 -34.4 -12.2 -31 -13 -27C-14.6 -20 -12.6 -14 -11.6 -8Z',
    fill: INK, stroke: CLAY, 'stroke-width': 0.6, 'paint-order': 'stroke',
  }));
  g.appendChild(s('path', { d: 'M-12.4 -30.6H12.4', stroke: INK, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
  g.appendChild(s('path', { d: 'M-12.4 -30.6h.1M12.4 -30.6h.1', stroke: WHITE, 'stroke-width': 1.6, 'stroke-linecap': 'round' }));
  // Box decoration: incised arcs and a purple band.
  g.appendChild(s('path', { d: 'M-9 -2.6H9M-8.2 -5.6Q0 -9 8.2 -5.6', fill: 'none', stroke: CLAY, 'stroke-width': 0.5 }));
  g.appendChild(s('rect', { x: -9.4, y: -11.8, width: 18.8, height: 2, fill: PURPLE }));
  let st = '';
  for (let i = 0; i < 7; i++) {
    const x0 = -4.8 + i * 1.6, x1 = -6 + i * 2;
    st += `M${f1(x0)} -3L${f1(x1)} -30`;
  }
  g.appendChild(s('path', { d: st, stroke: CLAY, 'stroke-width': 0.35 }));
  // A ribbon hanging from the arm.
  g.appendChild(s('path', { d: 'M-12 -24C-17 -20 -17 -12 -14 -6M-11.6 -23.4C-14.6 -19 -14.4 -14 -12 -10', fill: 'none', stroke: PURPLE, 'stroke-width': 1.1, 'stroke-linecap': 'round' }));
  return g;
}

/** A high-backed chair (thronos) facing +x; seat top at y = -26 over a ground at 0. */
export function throne(x: number, ground: number, k = 1): SVGGElement {
  const g = s('g', { class: 'throne', transform: `translate(${f1(x)} ${f1(ground)}) scale(${k})` });
  g.appendChild(s('path', {
    d: 'M-12 0V-26H16V-23H-9V-60Q-10 -63 -12.6 -62L-13.6 -26L-12 0ZM14 -23L14 0',
    fill: 'none', stroke: INK, 'stroke-width': 2.2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round',
  }));
  // Lion-paw feet and a cushion in added purple.
  g.appendChild(s('path', { d: 'M-15 0h6l-1 -3h-4ZM11 0h6l-1 -3h-4Z', fill: INK }));
  g.appendChild(s('path', { d: 'M-12 -26Q2 -30 16 -26L16 -24.4Q2 -26.6 -12 -24.4Z', fill: PURPLE, stroke: INK, 'stroke-width': 0.4 }));
  return g;
}

/** A folding stool (diphros okladias); seat top at y = -22 above ground 0. */
export function stool(x: number, ground: number, k = 1): SVGGElement {
  const g = s('g', { class: 'stool', transform: `translate(${f1(x)} ${f1(ground)}) scale(${k})` });
  g.appendChild(s('path', { d: 'M-11 0L11 -21M11 0L-11 -21', stroke: INK, 'stroke-width': 2, 'stroke-linecap': 'round' }));
  g.appendChild(s('path', { d: 'M-13 -21H13V-23H-13Z', fill: INK }));
  g.appendChild(s('path', { d: 'M-12 -23Q0 -26 12 -23', fill: 'none', stroke: PURPLE, 'stroke-width': 1.6 }));
  return g;
}

/** A small three-legged table laden with bread and meat; top at y = -24 above ground 0. */
export function feastTable(x: number, ground: number, k = 1): SVGGElement {
  const g = s('g', { class: 'table', transform: `translate(${f1(x)} ${f1(ground)}) scale(${k})` });
  g.appendChild(s('path', { d: 'M-20 -24H20V-21H-20Z', fill: INK }));
  g.appendChild(s('path', { d: 'M-16 -21L-18 0M16 -21L18 0M0 -21V0', stroke: INK, 'stroke-width': 2, 'stroke-linecap': 'round' }));
  g.appendChild(s('path', { d: 'M-18 0h5M14 0h6', stroke: INK, 'stroke-width': 1.6 }));
  // Loaves (white), a joint of meat (purple), a cup.
  g.appendChild(s('path', { d: 'M-17 -24Q-13 -31 -8 -24ZM-8 -24Q-4 -30 0 -24Z', fill: WHITE, stroke: INK, 'stroke-width': 0.5 }));
  g.appendChild(s('path', { d: 'M2 -24C2 -30 10 -32 14 -27L17 -28L17 -25L14 -24Z', fill: PURPLE, stroke: INK, 'stroke-width': 0.5 }));
  g.appendChild(s('path', { d: 'M8 -30L12 -33', stroke: WHITE, 'stroke-width': 1, 'stroke-linecap': 'round' }));
  // Cloth hanging over the edge.
  g.appendChild(s('path', { d: 'M-20 -21L-19 -15L-16 -17L-13 -14L-10 -17L-7 -15L-6 -21Z', fill: WHITE, stroke: INK, 'stroke-width': 0.4 }));
  return g;
}

/** A column krater (wine-mixing bowl) standing at x on the ground. */
export function krater(x: number, ground: number, k = 1): SVGGElement {
  const g = s('g', { class: 'krater', transform: `translate(${f1(x)} ${f1(ground)}) scale(${k})` });
  g.appendChild(s('path', {
    d: 'M-6 0L-5 -3C-4 -5 -3 -6 -3 -8C-12 -12 -15 -22 -14 -30L-17 -32V-35H17V-32L14 -30C15 -22 12 -12 3 -8C3 -6 4 -5 5 -3L6 0Z',
    fill: INK,
  }));
  g.appendChild(s('path', { d: 'M-15 -31V-38M15 -31V-38M-18 -38H-12M12 -38H18', stroke: INK, 'stroke-width': 2, 'stroke-linecap': 'round' }));
  g.appendChild(s('path', { d: 'M-13 -27H13M-12.6 -24H12.6', stroke: CLAY, 'stroke-width': 0.6 }));
  g.appendChild(s('path', { d: 'M-12 -18Q0 -13 12 -18', stroke: PURPLE, 'stroke-width': 1.6, fill: 'none' }));
  return g;
}

/** A falcon in flight (facing +x), wings up (phase 0) or down (phase 1). */
export function falcon(): { g: SVGGElement; set(phase: number): void } {
  const g = s('g', { class: 'falcon' });
  const far = s('path', { fill: INK, opacity: 0.9 });
  const near = s('path', { fill: INK, stroke: CLAY, 'stroke-width': 0.5, 'paint-order': 'stroke' });
  const body = s('path', {
    d: 'M-12 0C-8 -3 2 -4 8 -2.6C10 -3.8 12.4 -3.6 13.4 -2.2L16 -1.4L13 -0.4C12 1.6 8 2.6 2 2.4C-4 2.2 -8 1.4 -12 0ZM-11 -0.4L-19 -4L-17.6 0.2L-19 4.4Z',
    fill: INK, stroke: CLAY, 'stroke-width': 0.5, 'paint-order': 'stroke',
  });
  const feathers = s('path', { fill: 'none', stroke: CLAY, 'stroke-width': 0.4 });
  g.append(far, body, near, feathers);
  g.appendChild(s('circle', { cx: 11.6, cy: -2, r: 0.7, fill: CLAY }));
  const wing = (sweep: number, k: number): string => {
    // Root on the back, tip swept up (sweep>0) or down (sweep<0).
    const tipX = -6 * k, tipY = -20 * sweep * k;
    return `M4 -2C2 ${f1(-6 * sweep * k - 2)} ${f1(tipX + 6)} ${f1(tipY)} ${f1(tipX)} ${f1(tipY - 2 * sweep)}C${f1(tipX - 2)} ${f1(tipY * 0.6)} -4 ${f1(-4 * sweep - 1)} -4 -1Z`;
  };
  const set = (ph: number) => {
    const sweep = 1 - ph * 2;
    near.setAttribute('d', wing(sweep, 1));
    far.setAttribute('d', wing(sweep * 0.8, 0.8));
    const tipX = -6, tipY = -20 * sweep;
    let d = '';
    for (let i = 1; i <= 3; i++) {
      const u = i / 4;
      d += `M${f1(4 - 8 * u)} ${f1(-2 + (tipY + 2) * u * 0.3)}L${f1(tipX + 2 - u * 2)} ${f1(tipY * (0.55 + u * 0.3))}`;
    }
    feathers.setAttribute('d', d);
  };
  set(0);
  return { g, set };
}
