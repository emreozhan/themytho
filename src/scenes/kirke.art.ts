/**
 * Kirke's things, drawn in the black-figure manner: a reclining lion with an
 * incised mane, a reclining wolf, the boar's head that replaces a man's, the
 * moly (black root, milk-white flower), her palace front, cup, wand and the
 * mixing bowl of the feast.
 */
import { s } from '../lib/dom';
import { ribbon, smoothPath, type Vec } from '../lib/geometry';
import { INK, CLAY, WHITE, PURPLE } from '../art/figure';
import { column } from '../art/kit';

const inc = (d: string, w = 0.7, color = CLAY, op = 1) =>
  s('path', { d, fill: 'none', stroke: color, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: op });

/* ------------------------------------------------------------------ */
/* Beasts                                                              */
/* ------------------------------------------------------------------ */

export interface Recliner {
  g: SVGGElement;
  head: SVGGElement;
  tail: SVGGElement;
}

/**
 * A reclining lion, facing +x, resting on y = 0, about 100 units long
 * (tail tip to paws). The head and tail are groups so they can move.
 */
export function lion(): Recliner {
  const g = s('g', { class: 'kirke-lion' });
  const tail = s('g', { class: 'kirke-lion__tail' });
  tail.appendChild(s('path', { d: ribbon([[-33, -9], [-44, -2], [-56, -3], [-64, -10], [-66, -18]], [[0, 3.2], [0.6, 1.8], [1, 1.4]], 30), fill: INK }));
  tail.appendChild(s('path', { d: 'M-66 -17C-71 -20 -71 -27 -67 -30C-64 -26 -61 -22 -64.6 -17.4Z', fill: INK }));
  g.appendChild(tail);
  // Far forepaw, set back a little.
  g.appendChild(s('path', { d: smoothPath([[4, -10], [16, -9], [30, -8], [37, -8], [38.5, -5.4], [36, -3.6], [22, -3.6], [8, -4]], true, 0.3), fill: INK, stroke: CLAY, 'stroke-width': 1, 'paint-order': 'stroke' }));
  // Body.
  g.appendChild(
    s('path', {
      d: smoothPath([[-37, -12], [-33, -20], [-20, -23], [-4, -24], [8, -26], [16, -20], [17, -10], [12, -3], [-2, -2], [-18, -2], [-30, -3], [-37, -6]], true, 0.34),
      fill: INK,
    }),
  );
  // Folded hind leg (haunch) with the paw tucked forward.
  g.appendChild(
    s('path', {
      d: smoothPath([[-32, -14], [-20, -21], [-9, -14], [-6, -5], [2, -4.4], [5, -2], [3, 0], [-12, 0], [-26, -0.6], [-34, -5]], true, 0.3),
      fill: INK,
      stroke: CLAY,
      'stroke-width': 1,
      'paint-order': 'stroke',
    }),
  );
  // Near forepaw stretched out on the ground.
  g.appendChild(s('path', { d: smoothPath([[6, -12], [15, -8], [30, -5], [40, -5], [42.4, -2.6], [40, 0], [22, 0], [8, -0.6], [3, -5]], true, 0.3), fill: INK, stroke: CLAY, 'stroke-width': 1, 'paint-order': 'stroke' }));
  // Incisions: ribs, belly, haunch, claws.
  g.appendChild(inc('M-12 -20Q-9 -13 -12 -6M-6 -21Q-3 -14 -6 -6M0 -22Q3 -15 0 -7M-30 -6Q-18 -1 -4 -3', 0.7));
  g.appendChild(inc('M36 -2.6l2 -1.6M33 -2.4l2 -1.8M38.8 -2.8l1.4 -1.2', 0.6));
  // Mane: a great ruff around neck and shoulders, locks incised as tongues,
  // the outer edge in added purple.
  const head = s('g', { class: 'kirke-lion__head' });
  const mane = smoothPath([[-2, -22], [4, -32], [12, -41], [22, -46], [30, -44], [34, -34], [32, -22], [26, -12], [16, -9], [6, -12]], true, 0.36);
  head.appendChild(s('path', { d: mane, fill: PURPLE, stroke: INK, 'stroke-width': 1.2 }));
  head.appendChild(s('path', { d: smoothPath([[2, -22], [7, -31], [14, -38], [22, -42], [29, -40], [31, -31], [29, -21], [23, -13], [14, -11], [7, -14]], true, 0.36), fill: INK }));
  let locks = '';
  const rows: Array<[Vec, Vec, number]> = [
    [[9, -33], [26, -40], 4],
    [[6, -26], [28, -32], 5],
    [[7, -19], [28, -22], 5],
    [[13, -13], [24, -14], 3],
  ];
  for (const [a, b, n] of rows) {
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
      locks += `M${(x - 2.2).toFixed(1)} ${(y - 1).toFixed(1)}q2.2 5 4.4 0`;
    }
  }
  head.appendChild(inc(locks, 0.65));
  // Head in profile, heavy muzzle, small round ear.
  head.appendChild(s('path', { d: 'M22 -44C24 -49 28 -50 30.4 -47.6C31.6 -45.8 30.6 -44 29 -43.4Z', fill: INK, stroke: CLAY, 'stroke-width': 0.7, 'paint-order': 'stroke' }));
  head.appendChild(
    s('path', {
      d: smoothPath([[24, -44], [31, -46.5], [37.5, -43.5], [42.5, -38], [45.6, -35.4], [46, -31.6], [44, -28.6], [39, -27.6], [33, -27.8], [27, -30], [23, -36]], true, 0.3),
      fill: INK,
    }),
  );
  head.appendChild(s('path', { d: 'M34.6 -40.2Q36.8 -42 39 -40Q36.8 -38.8 34.6 -40.2Z', fill: CLAY }));
  head.appendChild(inc('M33.4 -42.4Q36.6 -44.4 40 -41.6M45.6 -31.2Q42 -31 39 -31.8M40.6 -36.2Q43 -35 45.4 -35.2M29 -38Q27 -34 29 -30.6', 0.6));
  head.appendChild(s('path', { d: 'M40 -30.2h0.1M42 -30.4h0.1M41 -29.2h0.1', stroke: CLAY, 'stroke-width': 0.9, 'stroke-linecap': 'round' }));
  g.appendChild(head);
  return { g, head, tail };
}

/** A reclining wolf, facing +x on y = 0, about 90 units long. */
export function wolf(): Recliner {
  const g = s('g', { class: 'kirke-wolf' });
  const tail = s('g', { class: 'kirke-wolf__tail' });
  tail.appendChild(s('path', { d: ribbon([[-28, -8], [-38, -5], [-48, -3], [-58, -5]], [[0, 3.4], [0.45, 6.4], [0.85, 4], [1, 1.2]], 30), fill: INK }));
  tail.appendChild(inc('M-36 -6.4l3 1.6M-42 -4.6l3 1.6M-48 -3.6l3 1.4', 0.6));
  g.appendChild(tail);
  g.appendChild(s('path', { d: smoothPath([[4, -9], [16, -7], [28, -6], [33, -6], [34.4, -4], [32, -2.6], [18, -3], [6, -4]], true, 0.3), fill: INK, stroke: CLAY, 'stroke-width': 1, 'paint-order': 'stroke' }));
  g.appendChild(s('path', { d: smoothPath([[-30, -9], [-24, -16], [-8, -17], [6, -18], [13, -16], [15, -8], [10, -3], [-6, -2], [-22, -2], [-30, -4]], true, 0.34), fill: INK }));
  g.appendChild(
    s('path', {
      d: smoothPath([[-27, -12], [-17, -16], [-9, -10], [-7, -4], [1, -3.6], [3.6, -1.6], [2, 0], [-10, 0], [-22, -0.4], [-28, -4]], true, 0.3),
      fill: INK,
      stroke: CLAY,
      'stroke-width': 1,
      'paint-order': 'stroke',
    }),
  );
  g.appendChild(s('path', { d: smoothPath([[6, -10], [14, -6], [26, -3.6], [34, -3.6], [36, -1.8], [34, 0], [18, 0], [6, -0.6], [2, -4]], true, 0.3), fill: INK, stroke: CLAY, 'stroke-width': 1, 'paint-order': 'stroke' }));
  g.appendChild(inc('M-10 -15Q-7 -10 -10 -5M-4 -15.6Q-1 -10 -4 -5M-26 -5Q-16 -1 -4 -3', 0.65));
  const head = s('g', { class: 'kirke-wolf__head' });
  // Neck ruff and head with a long muzzle and pointed ears.
  head.appendChild(s('path', { d: smoothPath([[4, -16], [8, -24], [14, -31], [20, -33], [25, -30], [24, -22], [18, -12], [10, -10]], true, 0.34), fill: INK }));
  head.appendChild(inc('M9 -22l3 2.4M12 -26l3 2.4M11 -17l3 2.4M15 -21l3 2.2M16 -28l3 2', 0.6));
  head.appendChild(s('path', { d: 'M18.6 -32.6L19.8 -40L24.6 -33.6Z', fill: INK, stroke: CLAY, 'stroke-width': 0.6, 'paint-order': 'stroke' }));
  head.appendChild(s('path', { d: 'M22 -33.6L24.6 -40.6L27 -33Z', fill: INK }));
  head.appendChild(s('path', { d: smoothPath([[16, -30], [21, -34.6], [28, -33.8], [34, -31.4], [39.6, -29.8], [41.8, -28.2], [41.4, -25.8], [38, -24.2], [31, -23.4], [24, -22.4], [17, -24]], true, 0.3), fill: INK }));
  head.appendChild(s('path', { d: 'M26.2 -30.4Q28 -31.8 30 -30.4Q28 -29.4 26.2 -30.4Z', fill: CLAY }));
  head.appendChild(s('path', { d: 'M41 -28.4l0.9 0.4', stroke: CLAY, 'stroke-width': 0.8, 'stroke-linecap': 'round' }));
  head.appendChild(inc('M41.2 -26Q36 -26.2 31.6 -26.8M22 -29Q20.4 -26.6 22.4 -24.2M34.6 -24.4l1.2 1.6', 0.6));
  g.appendChild(head);
  return { g, head, tail };
}

/* ------------------------------------------------------------------ */
/* Heads: a man's profile and the boar's head it becomes               */
/* ------------------------------------------------------------------ */

/** The rig's bearded profile, in head-local coordinates (see figure.ts). */
export const MAN_HEAD =
  'M-6.4 4.2C-8.6 0 -7.8 -6.4 -3.4 -8.3C0.6 -10 5.6 -8.4 6.8 -4.2L7.1 -2.6L9.4 1.4L7.4 2.1L7.7 3.3L6.9 3.8L7.4 4.6C7.5 5.6 7 6.6 6 7C3 7.8 -0.5 7 -2.8 6.4C-4.4 6 -5.8 5.4 -6.4 4.2Z';
/** The rig's youthful profile (no beard). */
export const YOUTH_HEAD =
  'M-6.4 4.2C-8.6 0 -7.8 -6.4 -3.4 -8.3C0.6 -10 5.6 -8.4 6.8 -4.2L7.1 -2.6L9.4 1.4L7.4 2.1L7.7 3.3L6.9 3.8L7.4 4.6C7.4 6.2 6.2 7.4 4.2 7.3C1.2 7.2 -0.8 6.6 -2.6 6.2C-4.2 5.8 -5.6 5.4 -6.4 4.2Z';
/** A boar's head on a man's neck: long snout, bristly crown. */
export const PIG_HEAD =
  'M-6.6 5.4C-9 0 -8 -7 -3.4 -8.8C0 -10 3.6 -8.8 5.8 -6.4C8.4 -3.8 11.6 -1.6 15.2 -0.4L16.2 0.6L16 4.6C13.4 5 10.8 5.6 8.6 6.8C5.4 9 0.4 9.4 -2.8 8.4C-4.6 7.8 -5.8 6.8 -6.6 5.4Z';

/** Pig ear, eye, tusk and bristles (head-local; appear once the head has turned). */
export function pigFeatures(): SVGGElement {
  const g = s('g', { class: 'pig-features' });
  g.appendChild(s('path', { d: 'M-2 -8C-0.6 -13.4 2.6 -15.6 6.6 -15C4.8 -12.6 3.8 -10 3.6 -7.2Z', fill: INK, stroke: CLAY, 'stroke-width': 0.6, 'paint-order': 'stroke' }));
  let br = 'M-8.2 -1';
  for (let i = 0; i < 5; i++) br += `L${(-8.6 + i * 1.6).toFixed(1)} ${(-5 - i * 1.3).toFixed(1)}L${(-7.2 + i * 1.6).toFixed(1)} ${(-3.4 - i * 1.3).toFixed(1)}`;
  g.appendChild(s('path', { d: br + 'L-2 -8Z', fill: INK }));
  g.appendChild(s('circle', { cx: 4, cy: -3.4, r: 1, fill: CLAY }));
  g.appendChild(s('path', { d: 'M3 -5.4Q5 -6.6 7 -5', fill: 'none', stroke: CLAY, 'stroke-width': 0.55 }));
  g.appendChild(s('path', { d: 'M15.6 1.4v2.2M11 5.2Q12 3.4 14.4 3', fill: 'none', stroke: CLAY, 'stroke-width': 0.55, 'stroke-linecap': 'round' }));
  g.appendChild(s('path', { d: 'M9.6 5.6Q11.8 4.8 11.6 2.2Q10.8 4 9 4.6Z', fill: WHITE }));
  return g;
}

/* ------------------------------------------------------------------ */
/* Moly                                                                */
/* ------------------------------------------------------------------ */

export interface Moly {
  g: SVGGElement;
  stem: SVGPathElement;
  leaves: SVGPathElement;
  flower: SVGGElement;
  root: SVGGElement;
}

/**
 * Moly: a snowdrop-like herb. Ground at y = 0; the black bulb and roots lie
 * below (y > 0) until it is pulled.
 */
export function moly(): Moly {
  const g = s('g', { class: 'kirke-moly' });
  const root = s('g', { class: 'kirke-moly__root' });
  root.appendChild(s('path', { d: smoothPath([[0, -1], [4.6, 3], [5, 8.6], [1.4, 12.4], [-1.4, 12.4], [-5, 8.6], [-4.6, 3]], true, 0.4), fill: INK }));
  let rd = '';
  const tips: Vec[] = [[-10, 24], [-5, 27], [0, 29], [5, 26], [10, 22], [-13, 17], [12, 16]];
  for (const [x, y] of tips) rd += ribbon([[0, 11], [x * 0.45, 11 + (y - 11) * 0.55], [x, y]], [[0, 1.6], [1, 0.3]], 12);
  root.appendChild(s('path', { d: rd, fill: INK }));
  root.appendChild(s('path', { d: 'M-2.6 3Q0 1.6 2.6 3M-3.4 6Q0 4.6 3.4 6', fill: 'none', stroke: CLAY, 'stroke-width': 0.5 }));
  g.appendChild(root);
  const leaves = s('path', {
    d:
      ribbon([[0, 0], [-4, -12], [-9, -24], [-13, -31]], [[0, 3], [0.5, 3.4], [1, 0.4]], 24) +
      ribbon([[0.6, 0], [4, -10], [9, -19], [14, -24]], [[0, 2.6], [0.5, 3], [1, 0.4]], 24),
    fill: INK,
  });
  g.appendChild(leaves);
  const stem = s('path', { d: 'M0 0C0.4 -14 1 -30 2.6 -38C3.6 -42.6 6.6 -44 9 -41.4', fill: 'none', stroke: INK, 'stroke-width': 1.6, 'stroke-linecap': 'round' });
  g.appendChild(stem);
  // The milk-white drooping flower: three outer petals, a green-less inner bell with its V mark.
  const flower = s('g', { class: 'kirke-moly__flower', transform: 'translate(9.4 -40.6)' });
  flower.appendChild(s('path', { d: 'M-1.4 -1C-1 -2.6 1 -2.6 1.4 -1L0.8 0.8H-0.8Z', fill: INK }));
  flower.appendChild(s('path', { d: 'M0 0C-3.8 1.6 -6 6 -4.8 10.6C-2.6 9 -0.8 5 0 0Z', fill: WHITE, stroke: INK, 'stroke-width': 0.5 }));
  flower.appendChild(s('path', { d: 'M0 0C3.8 1.6 6 6 4.8 10.6C2.6 9 0.8 5 0 0Z', fill: WHITE, stroke: INK, 'stroke-width': 0.5 }));
  flower.appendChild(s('path', { d: 'M0 0C-2 2 -2.2 7 0 11.4C2.2 7 2 2 0 0Z', fill: WHITE, stroke: INK, 'stroke-width': 0.5 }));
  flower.appendChild(s('path', { d: 'M-1 8.4L0 9.8L1 8.4', fill: 'none', stroke: INK, 'stroke-width': 0.5 }));
  g.appendChild(flower);
  return { g, stem, leaves, flower, root };
}

/* ------------------------------------------------------------------ */
/* The palace front                                                    */
/* ------------------------------------------------------------------ */

/**
 * Two Doric columns carrying an entablature with triglyphs and a low
 * pediment; Kirke is Helios's daughter, so a sun disc sits in the gable.
 */
export function palace(ground: number, archY: number, colX: number): { g: SVGGElement; sunDisc: SVGGElement } {
  const g = s('g', { class: 'kirke-palace' });
  const h = ground - archY;
  g.appendChild(column(-colX, ground, h, 17));
  g.appendChild(column(colX, ground, h, 17));
  // Architrave, frieze of triglyphs and metopes, cornice.
  const W = 200;
  g.appendChild(s('rect', { x: -W, y: archY - 11, width: W * 2, height: 11, fill: INK }));
  g.appendChild(s('line', { x1: -W, y1: archY - 2.6, x2: W, y2: archY - 2.6, stroke: CLAY, 'stroke-width': 0.6, opacity: 0.7 }));
  const fy = archY - 11;
  g.appendChild(s('rect', { x: -W, y: fy - 14, width: W * 2, height: 14, fill: CLAY }));
  let tri = '';
  let triLines = '';
  for (let x = -W + 4; x < W; x += 21) {
    tri += `M${x} ${fy}v-14h10v14z`;
    triLines += `M${x + 3.3} ${fy - 1}v-12M${x + 6.7} ${fy - 1}v-12`;
  }
  g.appendChild(s('path', { d: tri, fill: INK }));
  g.appendChild(s('path', { d: triLines, stroke: CLAY, 'stroke-width': 0.7 }));
  // Rosettes in the metopes.
  let ros = '';
  for (let x = -W + 4 + 15.5; x < W; x += 21) ros += `M${x - 2.4} ${fy - 7}a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0`;
  g.appendChild(s('path', { d: ros, fill: PURPLE, stroke: INK, 'stroke-width': 0.6 }));
  g.appendChild(s('rect', { x: -W, y: fy - 19, width: W * 2, height: 5, fill: INK }));
  // Pediment: a black raking cornice with the clay gable field.
  const py = fy - 19;
  g.appendChild(s('path', { d: `M-190 ${py}L0 ${py - 58}L190 ${py}Z`, fill: INK }));
  g.appendChild(s('path', { d: `M-160 ${py - 3}L0 ${py - 51.6}L160 ${py - 3}Z`, fill: CLAY }));
  const sunDisc = s('g', { class: 'kirke-palace__sun', transform: `translate(0 ${py - 20})` });
  let rays = '';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    rays += `M${(Math.cos(a) * 9.4).toFixed(1)} ${(Math.sin(a) * 9.4).toFixed(1)}L${(Math.cos(a) * 14).toFixed(1)} ${(Math.sin(a) * 14).toFixed(1)}`;
  }
  sunDisc.appendChild(s('path', { d: rays, stroke: INK, 'stroke-width': 1.6, 'stroke-linecap': 'round' }));
  sunDisc.appendChild(s('circle', { r: 7.4, fill: INK }));
  sunDisc.appendChild(s('circle', { r: 4.6, fill: 'none', stroke: CLAY, 'stroke-width': 0.6 }));
  g.appendChild(sunDisc);
  // Volute tendrils flanking the disc.
  g.appendChild(inc(`M-22 ${py - 12}c-12 -2 -24 2 -40 8M22 ${py - 12}c12 -2 24 2 40 8`, 1.2, INK));
  g.appendChild(s('path', { d: `M-64 ${py - 3}a3.2 3.2 0 1 1 3 -4M64 ${py - 3}a3.2 3.2 0 1 0 -3 -4`, fill: 'none', stroke: INK, 'stroke-width': 1.2 }));
  return { g, sunDisc };
}

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */

/** Kirke's deep cup (skyphos), resting on the hand at its origin. */
export function skyphos(): SVGGElement {
  const g = s('g', { class: 'kirke-cup' });
  g.appendChild(s('path', { d: 'M-6.4 -10.6H6.4C6.6 -4.6 4.8 -1.4 2.4 -0.4H-2.4C-4.8 -1.4 -6.6 -4.6 -6.4 -10.6Z', fill: INK }));
  g.appendChild(s('path', { d: 'M-2.2 -0.6H2.2L3 0.8H-3Z', fill: INK }));
  g.appendChild(s('path', { d: 'M-6.2 -8.6Q-10.6 -9.6 -10 -6.8M6.2 -8.6Q10.6 -9.6 10 -6.8', fill: 'none', stroke: INK, 'stroke-width': 1.2 }));
  g.appendChild(s('path', { d: 'M-6 -7.4H6', stroke: PURPLE, 'stroke-width': 1.3 }));
  g.appendChild(s('path', { d: 'M-5.6 -5.8H5.6', stroke: CLAY, 'stroke-width': 0.45 }));
  return g;
}

/** A drinking cup (kylix) for the companions, held at its foot. */
export function cup(): SVGGElement {
  const g = s('g', { class: 'kirke-kylix' });
  g.appendChild(s('path', { d: 'M-8.6 -7.4Q0 0 8.6 -7.4Z', fill: INK }));
  g.appendChild(s('path', { d: 'M-1.2 -3.8H1.2L1.8 0.6H-1.8Z M-4 0.2H4V1.4H-4Z', fill: INK }));
  g.appendChild(s('path', { d: 'M-8.4 -7.2Q-11.6 -7.8 -11 -10.4M8.4 -7.2Q11.6 -7.8 11 -10.4', fill: 'none', stroke: INK, 'stroke-width': 1 }));
  return g;
}

/** Kirke's wand (rhabdos): a slender rod with a knobbed tip; grip at the origin, rod along +x. */
export function wand(): { g: SVGGElement; tip: SVGGElement } {
  const g = s('g', { class: 'kirke-wand' });
  // An invisible, generous hit area makes the thin rod easy to tap.
  g.appendChild(s('path', { d: 'M-4 0L44 0', stroke: 'transparent', 'stroke-width': 12, 'pointer-events': 'stroke' }));
  g.appendChild(s('path', { d: 'M-4 0.5L40 -0.1L40 0.9Z', fill: INK }));
  g.appendChild(s('path', { d: 'M-4 0L40 0.3', stroke: INK, 'stroke-width': 1.3, 'stroke-linecap': 'round' }));
  const tip = s('g', { class: 'kirke-wand__tip', transform: 'translate(41.4 0.3)' });
  tip.appendChild(s('circle', { r: 1.9, fill: INK }));
  g.appendChild(tip);
  return { g, tip };
}

/** A short Greek sword (xiphos), grip at origin, blade along +x. */
export function sword(color = INK, detail = CLAY): SVGGElement {
  const g = s('g', { class: 'xiphos' });
  g.appendChild(s('path', { d: 'M-5 -1.2H0V1.2H-5Z', fill: color }));
  g.appendChild(s('path', { d: 'M-6.4 -1.8a1.6 1.6 0 0 0 0 3.6Z', fill: color }));
  g.appendChild(s('path', { d: 'M0 -3.6H2V3.6H0Z', fill: color }));
  g.appendChild(s('path', { d: 'M2 -1.5C10 -2.2 18 -2.6 26 -1.4L30 0L26 1.4C18 2.6 10 2.2 2 1.5Z', fill: color, stroke: detail === CLAY ? 'none' : detail, 'stroke-width': 0.4 }));
  g.appendChild(s('path', { d: 'M3 0H26.6', stroke: detail, 'stroke-width': 0.45 }));
  return g;
}

/** A column-krater (mixing bowl) standing on y = 0, ~30 tall. */
export function krater(k = 1): SVGGElement {
  const g = s('g', { class: 'kirke-krater', transform: `scale(${k})` });
  g.appendChild(s('path', { d: 'M-16 -30H16V-27.6H13C13.4 -17 10 -10 5 -7.4L3 -3.2H6.4V0H-6.4V-3.2H-3L-5 -7.4C-10 -10 -13.4 -17 -13 -27.6H-16Z', fill: INK }));
  g.appendChild(s('path', { d: 'M-13 -27.4V-33H-9.6V-27.4M13 -27.4V-33H9.6V-27.4', fill: 'none', stroke: INK, 'stroke-width': 1.4 }));
  g.appendChild(s('path', { d: 'M-12.4 -22.6H12.4', stroke: PURPLE, 'stroke-width': 1.6 }));
  g.appendChild(s('path', { d: 'M-12 -24.4H12M-11 -16.6H11', stroke: CLAY, 'stroke-width': 0.5 }));
  let tongues = '';
  for (let x = -9; x <= 9; x += 3) tongues += `M${x} -15.4q1.5 4.6 3 0`;
  g.appendChild(s('path', { d: tongues, fill: 'none', stroke: CLAY, 'stroke-width': 0.5 }));
  return g;
}

/** A festive garland swag (fillet with leaves) between two points. */
export function garland(a: Vec, b: Vec, sag = 14, seed = 1): SVGGElement {
  const g = s('g', { class: 'kirke-garland' });
  const mid: Vec = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + sag];
  g.appendChild(s('path', { d: `M${a[0]} ${a[1]}Q${mid[0]} ${mid[1] + sag} ${b[0]} ${b[1]}`, fill: 'none', stroke: INK, 'stroke-width': 1.1 }));
  let leaves = '';
  let berries = '';
  for (let i = 1; i < 10; i++) {
    const t = i / 10;
    const u = 1 - t;
    const x = u * u * a[0] + 2 * u * t * mid[0] + t * t * b[0];
    const y = u * u * a[1] + 2 * u * t * (mid[1] + sag) + t * t * b[1];
    const side = (i + seed) % 2 ? 1 : -1;
    leaves += `M${x.toFixed(1)} ${y.toFixed(1)}q${side * 2} -4 ${side * 5} -3.4q${-side * 1.4} 3 ${-side * 5} 3.4z`;
    if (i % 3 === 0) berries += `M${(x - 1.3).toFixed(1)} ${(y + 2).toFixed(1)}a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0`;
  }
  g.appendChild(s('path', { d: leaves, fill: INK }));
  g.appendChild(s('path', { d: berries, fill: PURPLE }));
  // Ribbon ends.
  g.appendChild(s('path', { d: `M${a[0]} ${a[1]}q-2 8 1 14M${b[0]} ${b[1]}q2 8 -1 14`, fill: 'none', stroke: PURPLE, 'stroke-width': 1.3 }));
  return g;
}
