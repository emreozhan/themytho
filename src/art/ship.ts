/**
 * The Homeric galley: a long black hull, a ram at the waterline, a painted eye
 * on the bow, a stern that curls over the deck like a scorpion's tail, one mast
 * with a square sail and a comb of oars. Odysseus's ships are the
 * "red-cheeked" ones of the Iliad (νέες μιλτοπάρῃοι), so the bow carries a
 * vermilion cheek.
 *
 * Local frame: bow faces +x, waterline at y = 0, overall length ≈ 100.
 */
import { s } from '../lib/dom';
import { ribbon, type Vec } from '../lib/geometry';

export interface ShipPalette {
  hull: string;
  detail: string;
  sail: string;
  sailLine: string;
  cheek: string;
  eye: string;
}

export const BLACK_FIGURE: ShipPalette = {
  hull: '#16100b',
  detail: '#c4662f',
  sail: '#efe2c6',
  sailLine: '#16100b',
  cheek: '#7e2e26',
  eye: '#efe2c6',
};

export const RED_FIGURE: ShipPalette = {
  hull: '#d27438',
  detail: '#1a110b',
  sail: '#f0e1c2',
  sailLine: '#3a2414',
  cheek: '#8e2f22',
  eye: '#1a110b',
};

export interface ShipOptions {
  palette?: ShipPalette;
  sail?: 'full' | 'furled' | 'torn' | 'none';
  oars?: number;
  /** Draw rowers' heads along the gunwale. */
  crew?: number;
  /** Simplify for tiny map icons. */
  icon?: boolean;
}

export interface ShipParts {
  g: SVGGElement;
  oars: SVGGElement;
  sail: SVGGElement;
  hull: SVGGElement;
  crew: SVGGElement;
}

const HULL_CENTER: Vec[] = [
  [-37.5, -21.5], [-41.5, -26], [-46.5, -22.5], [-47.5, -15], [-44, -7.5], [-36, -2.4],
  [-20, -1.6], [0, -1.5], [20, -1.6], [33, -2.6], [39.5, -6.5], [43, -12.5], [45.5, -17],
];
const HULL_W: Array<[number, number]> = [
  [0, 1.6], [0.09, 3], [0.2, 5.2], [0.3, 6.6], [0.55, 6.8], [0.8, 6.4], [0.9, 4.4], [1, 2.2],
];

export function ship(opts: ShipOptions = {}): ShipParts {
  const pal = opts.palette ?? BLACK_FIGURE;
  const g = s('g', { class: 'ship' });

  // Oars sit behind the hull.
  const oars = s('g', { class: 'ship__oars', stroke: pal.hull, 'stroke-linecap': 'round' });
  const n = opts.oars ?? (opts.icon ? 6 : 11);
  for (let i = 0; i < n; i++) {
    const x = -27 + (i * 56) / Math.max(1, n - 1);
    const pivot = s('g', { transform: `translate(${x.toFixed(1)} -2)` });
    const oar = s('g', { class: 'oar', transform: 'rotate(0)' });
    oar.appendChild(s('line', { x1: 0, y1: 0, x2: -7, y2: 12, 'stroke-width': opts.icon ? 1.6 : 1.1 }));
    if (!opts.icon) oar.appendChild(s('path', { d: 'M-6.2 10.6L-9.4 15.4L-7.6 16.2L-5.2 11.6Z', fill: pal.hull, stroke: 'none' }));
    pivot.appendChild(oar);
    oars.appendChild(pivot);
  }
  // Steering oar.
  oars.appendChild(s('path', { d: 'M-36 -5L-47 9.5', 'stroke-width': 1.8 }));
  oars.appendChild(s('path', { d: 'M-45 7L-49.5 13.5L-47.2 14.6L-43.4 8.4Z', fill: pal.hull, stroke: 'none' }));

  // Mast, yard, rigging and sail.
  const sail = s('g', { class: 'ship__sail' });
  const rig = s('g', { stroke: pal.hull, 'stroke-linecap': 'round', fill: 'none' });
  const state = opts.sail ?? 'full';
  if (state !== 'none') {
    rig.appendChild(s('line', { x1: 2, y1: -2, x2: 2, y2: -50, 'stroke-width': 2 }));
    rig.appendChild(s('path', { d: 'M2 -49L44.5 -17M2 -49L-43 -24', 'stroke-width': 0.6 }));
  }
  if (state === 'full' || state === 'torn') {
    rig.appendChild(s('path', { d: 'M-22 -45.5Q2 -49.5 26 -45.5', 'stroke-width': 1.8 }));
    const sailD =
      state === 'full'
        ? 'M-21.5 -45C-19 -35 -19.5 -22 -21 -13.5Q2 -9 25 -13.5C27 -22 27.5 -35 25.5 -45Q2 -48.6 -21.5 -45Z'
        : 'M-21.5 -45C-19.5 -37 -20 -30 -18 -25L-12 -28L-8 -19L-2 -23L4 -14L10 -20L16 -16L25 -21C26.5 -30 27 -38 25.5 -45Q2 -48.6 -21.5 -45Z';
    sail.appendChild(s('path', { d: sailD, fill: pal.sail, stroke: pal.hull, 'stroke-width': 1.1 }));
    if (!opts.icon) {
      const grid = s('g', { stroke: pal.sailLine, 'stroke-width': 0.45, opacity: 0.55, fill: 'none' });
      for (let i = 1; i < 6; i++) {
        const x = -21 + i * 7.6;
        grid.appendChild(s('path', { d: `M${x.toFixed(1)} -46.4Q${(x + 1.8).toFixed(1)} -30 ${x.toFixed(1)} -12` }));
      }
      for (const y of [-38, -30, -22]) grid.appendChild(s('path', { d: `M-20 ${y}Q2 ${y + 2.5} 26 ${y}` }));
      sail.appendChild(grid);
    }
  } else if (state === 'furled') {
    rig.appendChild(s('path', { d: 'M-22 -45.5Q2 -49.5 26 -45.5', 'stroke-width': 3.2 }));
  }
  g.append(oars, rig, sail);

  // Hull: the curled stern and hull body as one tapering ribbon, plus the ram.
  const hull = s('g', { class: 'ship__hull' });
  hull.appendChild(s('path', { d: ribbon(HULL_CENTER, HULL_W, opts.icon ? 28 : 64), fill: pal.hull }));
  hull.appendChild(s('path', { d: 'M28 -4.4L41 -4.8L53 0.4L51.5 2.2L38 3.8Q30 4 26 2Z', fill: pal.hull }));
  hull.appendChild(s('path', { d: 'M-40.5 -3.2Q-34 3.2 -22 3.6L28 3.6L30 -1Z', fill: pal.hull }));
  if (!opts.icon) {
    // Wale line, red cheek and the apotropaic eye.
    hull.appendChild(s('path', { d: 'M-38 -2.4Q-20 -0.2 32 -0.6', stroke: pal.detail, 'stroke-width': 0.55, fill: 'none', opacity: 0.8 }));
    hull.appendChild(s('path', { d: 'M31 -3.6L41.5 -4.2L47 -0.6L33 1.2Z', fill: pal.cheek }));
    hull.appendChild(s('path', { d: 'M35.2 -2.4Q38 -4.4 40.6 -2.2Q38 -0.4 35.2 -2.4Z', fill: pal.eye }));
    hull.appendChild(s('circle', { cx: 38.1, cy: -2.35, r: 0.8, fill: pal.hull }));
  } else {
    hull.appendChild(s('path', { d: 'M32 -3.2L42 -3.8L46 -0.8L34 0.8Z', fill: pal.cheek }));
  }
  g.appendChild(hull);

  const crew = s('g', { class: 'ship__crew', fill: pal.hull });
  const c = opts.crew ?? 0;
  for (let i = 0; i < c; i++) {
    const x = -26 + (i * 52) / Math.max(1, c - 1);
    crew.appendChild(s('circle', { cx: x.toFixed(1), cy: -8.4, r: 2.3 }));
    crew.appendChild(s('path', { d: `M${(x - 2.2).toFixed(1)} -6.6L${(x + 2.2).toFixed(1)} -6.6L${(x + 1.4).toFixed(1)} -3L${(x - 1.4).toFixed(1)} -3Z` }));
  }
  g.appendChild(crew);

  return { g, oars, sail, hull, crew };
}

/** Rowing loop: every oar sweeps about its pivot on the gunwale. */
export function rowing(oars: SVGGElement, gsapRef: typeof import('gsap').gsap, speed = 1): gsap.core.Timeline {
  const blades = oars.querySelectorAll<SVGGElement>('.oar');
  const tl = gsapRef.timeline({ repeat: -1 });
  // Each blade rotates about its own origin (the thole pin), so tween the attribute directly.
  tl.to(blades, { attr: { transform: 'rotate(16)' }, duration: 0.55 / speed, ease: 'sine.inOut', stagger: 0.012 })
    .to(blades, { attr: { transform: 'rotate(-8)' }, duration: 0.75 / speed, ease: 'sine.inOut', stagger: 0.012 });
  return tl;
}

/** Odysseus's raft from Ogygia: lashed logs, a stubby mast and a small sail. */
export function raft(pal: ShipPalette = RED_FIGURE, withSail = true): SVGGElement {
  const g = s('g', { class: 'raft' });
  let logs = '';
  for (let i = 0; i < 5; i++) {
    const x = -24 + i * 1.2;
    logs += `M${x} ${-3 + i * 1.6}h${48 - i * 2.4}a1.6 1.6 0 0 1 0 3.2h-${48 - i * 2.4}a1.6 1.6 0 0 1 0 -3.2z`;
  }
  g.appendChild(s('path', { d: logs, fill: pal.hull, stroke: pal.detail, 'stroke-width': 0.5, 'paint-order': 'stroke' }));
  if (withSail) {
    g.appendChild(s('line', { x1: 0, y1: -3, x2: 0, y2: -34, stroke: pal.hull, 'stroke-width': 2 }));
    g.appendChild(s('path', { d: 'M-13 -31Q0 -34 13 -31C14 -24 14 -16 13 -9Q0 -6 -13 -9C-14 -16 -14 -24 -13 -31Z', fill: pal.sail, stroke: pal.hull, 'stroke-width': 1 }));
  }
  // Odysseus at the steering oar.
  g.appendChild(s('circle', { cx: -16, cy: -11, r: 3, fill: pal.hull }));
  g.appendChild(s('path', { d: 'M-19 -8h6l-1 6h-4z', fill: pal.hull }));
  g.appendChild(s('path', { d: 'M-17 -6L-28 8', stroke: pal.hull, 'stroke-width': 1.5 }));
  return g;
}

/** A castaway clinging to a broken mast and keel. */
export function wreck(pal: ShipPalette = RED_FIGURE): SVGGElement {
  const g = s('g', { class: 'wreck' });
  g.appendChild(s('path', { d: 'M-30 -1L28 -4L29 0L-29 3Z', fill: pal.hull }));
  g.appendChild(s('path', { d: 'M-22 2L20 -1L20 2L-22 5Z', fill: pal.hull, opacity: 0.8 }));
  g.appendChild(s('circle', { cx: 4, cy: -7.5, r: 3.4, fill: pal.hull }));
  g.appendChild(s('path', { d: 'M1 -5L-8 -2M7 -5L14 -2', stroke: pal.hull, 'stroke-width': 1.8, 'stroke-linecap': 'round' }));
  return g;
}
