/**
 * The Nekyia's things. The cup is inverted here: a black-glaze field with
 * figures in reserved clay (as on red-figure vases) and the dead in pale
 * added white — little winged eidola as on white-ground lekythoi.
 */
import { s } from '../lib/dom';
import { ribbon, smoothPath, type Vec } from '../lib/geometry';
import { INK, CLAY, WHITE, PURPLE } from '../art/figure';

const line = (d: string, color: string, w = 0.7, op = 1) =>
  s('path', { d, fill: 'none', stroke: color, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: op });

/**
 * A small winged shade (eidolon), ~22 units tall, facing +x, centred on its
 * middle. The wings are a separate group so they can beat.
 */
export function eidolon(color = WHITE): { g: SVGGElement; wings: SVGGElement } {
  const g = s('g', { class: 'eidolon' });
  const wings = s('g', { class: 'eidolon__wings' });
  wings.appendChild(s('path', { d: 'M0.4 -6.4C-3.6 -14.6 -11.6 -17 -17.4 -14C-13.6 -12.8 -10.6 -10.8 -8.6 -8.2C-11.8 -9.2 -15 -8.6 -17 -6.4C-12 -5.4 -6.6 -4.6 -1.4 -3.6Z', fill: color, opacity: 0.9 }));
  wings.appendChild(line('M-3.4 -8.6L-13.4 -13.4M-4.6 -6L-14.4 -7.4', INK, 0.4, 0.55));
  g.appendChild(wings);
  // A little draped soul: round head, arms reaching out, the shroud trailing off in a wisp.
  g.appendChild(s('path', { d: 'M1.2 -8.2C6 -8.6 7.8 -5.2 7.2 -1.2C6.6 2.8 4.2 6.4 -0.2 9.4C-2.8 11 -6.2 11.8 -9.4 11.2C-6 9.6 -3.4 7.4 -2.2 4.2C-1 0.8 -1.4 -4.6 1.2 -8.2Z', fill: color }));
  g.appendChild(s('circle', { cx: 4.4, cy: -11.6, r: 3, fill: color }));
  g.appendChild(s('path', { d: 'M7 -12.6L8.8 -11L7 -10.4Z', fill: color }));
  g.appendChild(s('path', { d: 'M5.4 -6.2Q8.4 -6.6 11 -4.4', fill: 'none', stroke: color, 'stroke-width': 1.5, 'stroke-linecap': 'round' }));
  g.appendChild(line('M3.8 -5.4C4.8 -2.2 4 1.6 1.6 4.6M1.2 -6.2C1.8 -2.2 0.8 1.8 -1.2 5.4', INK, 0.45, 0.5));
  g.appendChild(s('path', { d: 'M5.4 -12.2h0.9', stroke: INK, 'stroke-width': 0.7, 'stroke-linecap': 'round' }));
  return { g, wings };
}

/**
 * The pit (bothros) cut into the ground at (0,0), with the libation pooled in
 * it; `pool` is returned for shimmering, `mound` is the dug earth beside it.
 */
export function bothros(): { g: SVGGElement; pool: SVGPathElement; mound: SVGGElement; mouth: SVGPathElement } {
  const g = s('g', { class: 'bothros' });
  const mound = s('g', { class: 'bothros__mound' });
  mound.appendChild(s('path', { d: 'M18 0.4C20 -6 27 -9.4 33 -8.6C39 -8 43 -4 44 0.4Z', fill: CLAY }));
  let dots = '';
  const pts: Vec[] = [[24, -4], [29, -6], [34, -3], [38, -5], [31, -1.6], [26, -1.4], [40, -1.8], [35, -6.6]];
  for (const [x, y] of pts) dots += `M${x - 0.6} ${y}a0.6 0.6 0 1 0 1.2 0a0.6 0.6 0 1 0 -1.2 0`;
  mound.appendChild(s('path', { d: dots, fill: INK }));
  g.appendChild(mound);
  // The hollow: a black bowl beneath the ground line, outlined in reserved clay.
  const mouth = s('path', { d: 'M-17 0C-17 8 -9 13 0 13C9 13 17 8 17 0Z', fill: INK, stroke: CLAY, 'stroke-width': 1.1 });
  g.appendChild(mouth);
  g.appendChild(s('path', { d: 'M-17 0C-12 -2.6 12 -2.6 17 0C12 2.4 -12 2.4 -17 0Z', fill: INK, stroke: CLAY, 'stroke-width': 0.9 }));
  const pool = s('path', { d: 'M-12 2.6C-7 1 7 1 12 2.6C7 4.4 -7 4.4 -12 2.6Z', fill: WHITE, opacity: 0.55 });
  g.appendChild(pool);
  // Barley meal scattered on the rim.
  g.appendChild(s('path', { d: 'M-22 -0.8h0.1M-20 -1.6h0.1M-24.6 -1.2h0.1M20.4 -1.4h0.1M15.6 -2.4h0.1M-14 -2.6h0.1', stroke: WHITE, 'stroke-width': 1.1, 'stroke-linecap': 'round' }));
  return { g, pool, mound, mouth };
}

/** A wine jug (oinochoe) with a trefoil mouth; handle at the origin, spout towards +x. */
export function oinochoe(): { g: SVGGElement; spout: Vec } {
  const g = s('g', { class: 'oinochoe' });
  g.appendChild(s('path', { d: 'M2 -2C-2 -6 -2 -12 2 -13', fill: 'none', stroke: CLAY, 'stroke-width': 1.4, 'stroke-linecap': 'round' }));
  g.appendChild(s('path', { d: 'M4 -12.6L3 -15.4C5 -16.4 8 -16.6 10.6 -15.8L12.4 -17L11.6 -14.4L9 -12.4C12.6 -10.6 14 -7 13.6 -3.4C13.2 0.6 10.6 3.2 7.4 3.6L7.6 5H3.6L4 3.4C1 2.6 -0.4 -0.6 0.2 -4.4C0.8 -8.4 2.4 -11 4 -12.6Z', fill: CLAY, stroke: INK, 'stroke-width': 0.5 }));
  g.appendChild(line('M1 -4.6C5 -3.6 10 -3.6 13.2 -4.8M1.6 -2.6C5 -1.8 9.6 -1.8 12.8 -2.8', INK, 0.5));
  g.appendChild(s('path', { d: 'M4 -9.4q2.2 -2 4.4 0q-2.2 2 -4.4 0z', fill: INK }));
  return { g, spout: [12, -16.6] };
}

/** The sacrificed ram, lying with its legs folded and head sunk, eyes closed (facing +x, resting on y = 0). */
export function fallenRam(): SVGGElement {
  const g = s('g', { class: 'fallen-ram' });
  g.appendChild(s('path', { d: smoothPath([[-26, -8], [-20, -17], [-4, -20], [12, -18], [22, -12], [26, -4], [18, 0], [0, 0.4], [-18, 0.2], [-26, -2]], true, 0.34), fill: CLAY, stroke: INK, 'stroke-width': 0.8 }));
  // Folded forelegs and hind leg.
  g.appendChild(s('path', { d: 'M12 -3C18 -2 24 -1 30 -1.4L30.6 0.4L12 0.6Z', fill: CLAY, stroke: INK, 'stroke-width': 0.7 }));
  g.appendChild(s('path', { d: 'M-22 -6C-16 -9 -10 -8 -8 -3L-2 -1.6L-2 0.4L-20 0.4C-23 -1 -23.4 -3.6 -22 -6Z', fill: CLAY, stroke: INK, 'stroke-width': 0.7 }));
  // Fleece.
  let d = '';
  for (let row = 0; row < 3; row++) for (let x = -20; x < 16; x += 5.4) d += `M${(x + (row % 2) * 2.7).toFixed(1)} ${-15 + row * 4.6}q2.7 -2.6 5.4 0`;
  g.appendChild(line(d, INK, 0.55, 0.9));
  // Head laid on the ground, the great horn curled.
  g.appendChild(s('path', { d: smoothPath([[20, -12], [27, -13], [33, -9], [38, -3], [37, 0], [30, 0.2], [24, -2], [19, -6]], true, 0.3), fill: CLAY, stroke: INK, 'stroke-width': 0.8 }));
  g.appendChild(s('path', { d: 'M26 -12C21 -18 13 -15 15 -9.4C17 -5 23 -6.4 22.4 -10', fill: 'none', stroke: INK, 'stroke-width': 1.3 }));
  g.appendChild(line('M28.4 -7.4Q30.4 -6.4 32.2 -7.6', INK, 0.7));
  // A purple fillet: the victim was garlanded.
  g.appendChild(s('path', { d: 'M19 -13.6C18 -9 18.6 -5 20.6 -2.4', fill: 'none', stroke: PURPLE, 'stroke-width': 1.6 }));
  return g;
}

/** An asphodel stalk with star flowers in added white. */
export function asphodel(x: number, ground: number, h = 30, seed = 1): SVGGElement {
  const g = s('g', { class: 'asphodel', transform: `translate(${x} ${ground})` });
  g.appendChild(s('path', { d: ribbon([[0, 0], [1 + seed * 0.3, -h * 0.5], [0.4, -h]], [[0, 1.3], [1, 0.5]], 16), fill: CLAY }));
  g.appendChild(s('path', { d: ribbon([[0, 0], [-6, -6], [-10, -9]], [[0, 1.6], [1, 0.2]], 10) + ribbon([[0, 0], [5, -7], [9, -11]], [[0, 1.6], [1, 0.2]], 10), fill: CLAY }));
  let fl = '';
  for (let i = 0; i < 6; i++) {
    const yy = -h * (0.62 + i * 0.07);
    const xx = (i % 2 ? 1 : -1) * 2.2 + 0.6;
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      fl += `M${xx.toFixed(1)} ${yy.toFixed(1)}l${(Math.cos(a) * 1.9).toFixed(2)} ${(Math.sin(a) * 1.9).toFixed(2)}`;
    }
  }
  g.appendChild(line(fl, WHITE, 0.8));
  return g;
}

/** A tall black poplar of Persephone's grove, drawn in reserved clay outline. */
export function poplar(x: number, ground: number, h = 140): SVGGElement {
  const g = s('g', { class: 'poplar', transform: `translate(${x} ${ground})` });
  g.appendChild(s('path', { d: `M-1.6 0L-1 ${-h * 0.2}L1 ${-h * 0.2}L1.6 0Z`, fill: CLAY }));
  const w = h * 0.1;
  g.appendChild(s('path', { d: `M0 ${-h}C${w} ${-h * 0.8} ${w * 1.3} ${-h * 0.45} ${w * 0.9} ${-h * 0.2}Q0 ${-h * 0.14} ${-w * 0.9} ${-h * 0.2}C${-w * 1.3} ${-h * 0.45} ${-w} ${-h * 0.8} 0 ${-h}Z`, fill: 'none', stroke: CLAY, 'stroke-width': 1.1 }));
  let d = '';
  for (let i = 1; i < 12; i++) {
    const yy = -h * (0.22 + i * 0.062);
    const ww = w * (0.3 + 0.55 * Math.sin((i / 12) * Math.PI));
    d += `M${(-ww).toFixed(1)} ${(yy + 2).toFixed(1)}l${ww.toFixed(1)} -3.4l${ww.toFixed(1)} 3.4`;
  }
  g.appendChild(line(d, CLAY, 0.7, 0.75));
  return g;
}

/** A pale round shield seen from the side-front (for Achilles's shade). */
export function paleShield(r = 11): SVGGElement {
  const g = s('g', { class: 'pale-shield' });
  g.appendChild(s('ellipse', { rx: r * 0.42, ry: r, fill: WHITE, stroke: INK, 'stroke-width': 0.7 }));
  g.appendChild(s('ellipse', { rx: r * 0.3, ry: r * 0.82, fill: 'none', stroke: INK, 'stroke-width': 0.5 }));
  return g;
}

/** A thin mist wisp (a horizontal ribbon) for the land of the Cimmerians. */
export function wisp(x: number, y: number, w: number): SVGPathElement {
  return s('path', {
    d: ribbon([[x - w / 2, y], [x - w / 4, y - 2], [x, y + 1], [x + w / 4, y - 1.4], [x + w / 2, y]], [[0, 0.4], [0.5, 3], [1, 0.4]], 30),
    fill: WHITE,
    opacity: 0.07,
  });
}
