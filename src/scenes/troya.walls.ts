/**
 * The walls of Troy, shared by the Troya and Tahta At tondos so that the city
 * looks the same in both: a glaze-black curtain on a footing of big ashlar
 * blocks (the sloping stone socle of Troy VI), smaller courses above,
 * crenellations, square towers with reserved window slits, and the Scaean
 * gate with two reserved wooden leaves strapped with bronze.
 *
 * Everything is drawn in scene units; the gate leaves can be swung open
 * (`gate.set(open)`), and `skyClip()` returns a clip path of everything that
 * is NOT wall (for suns and moons that must set behind the battlements).
 */
import { s, r1 } from '../lib/dom';
import { rng, range } from '../lib/random';
import { INK, CLAY, WHITE } from '../art/figure';

export interface TowerSpec {
  x: number;
  /** Width (default 30). */
  w?: number;
  /** How far the tower rises above the walkway (default 26). */
  rise?: number;
}

export interface GateSpec {
  /** Centre x of the gateway. */
  x: number;
  w: number;
  /** Height of the opening above the foot of the wall. */
  h: number;
}

export interface WallSpec {
  from: number;
  to: number;
  /** y of the foot of the wall. */
  base: number;
  /** Height of the curtain up to the walkway. */
  height: number;
  towers?: TowerSpec[];
  gate?: GateSpec;
  /** Height of the stone footing (default 30% of the height). */
  socle?: number;
  seed?: number;
}

export interface Tower {
  g: SVGGElement;
  x: number;
  w: number;
  /** y of the tower's walkway (under its merlons). */
  top: number;
}

export interface Gate {
  g: SVGGElement;
  hole: SVGPathElement;
  leafL: SVGGElement;
  leafR: SVGGElement;
  x0: number;
  x1: number;
  top: number;
  /** 0 = shut, 1 = wide open (leaves swung in against the jambs). */
  set(open: number): void;
}

export interface TroyWalls {
  g: SVGGElement;
  /** The curtain (without towers) — handy for flames along the battlements. */
  curtain: SVGGElement;
  towers: Tower[];
  gate: Gate | null;
  /** y of the curtain's walkway (top of the breastwork). */
  walk: number;
  spec: WallSpec;
  /** Outline of the whole wall mass (curtain + towers + merlons). */
  outline(): string;
  /** A path covering everything except the wall (use with clip-rule evenodd). */
  skyClip(): string;
}

const MERLON_H = 6.5;
const DARK = '#24160d';

const f = (v: number) => r1(v);

/** Incised ashlar courses inside a rectangle; `big` gives the socle's larger blocks. */
function ashlar(x0: number, x1: number, y0: number, y1: number, rows: number, blockW: number, rand: () => number): string {
  let d = '';
  const hRow = (y1 - y0) / rows;
  for (let r = 0; r < rows; r++) {
    const yy = y0 + r * hRow;
    if (r > 0) d += `M${f(x0)} ${f(yy)}H${f(x1)}`;
    let x = x0 + (r % 2 ? blockW * 0.5 : 0) + range(rand, -2, 2);
    while (x < x1 - 3) {
      if (x > x0 + 3) d += `M${f(x)} ${f(yy)}v${f(hRow)}`;
      x += blockW * range(rand, 0.8, 1.25);
    }
  }
  return d;
}

export function troyWalls(spec: WallSpec): TroyWalls {
  const { from, to, base, height } = spec;
  const walk = base - height;
  const socleH = spec.socle ?? height * 0.3;
  const rand = rng(spec.seed ?? 29);
  const g = s('g', { class: 'troy-walls' });
  const curtain = s('g', { class: 'troy-walls__curtain' });
  g.appendChild(curtain);

  // Curtain body, with a slight batter at the foot, and merlons along the top.
  curtain.appendChild(
    s('path', {
      d: `M${from} ${base + 3}V${walk}H${to}V${base + 3}Z`,
      fill: INK,
    }),
  );
  let merlons = '';
  for (let x = from + 2; x < to; x += 12) merlons += `M${f(x)} ${f(walk + 0.5)}v${-MERLON_H}h7.4v${MERLON_H}z`;
  curtain.appendChild(s('path', { d: merlons, fill: INK }));

  // Incisions: the parapet string course, the socle, ashlar courses.
  let inc = `M${from} ${f(walk + 3.2)}H${to}`;
  inc += `M${from} ${f(base - socleH)}H${to}M${from} ${f(base - socleH + 1.6)}H${to}`;
  inc += ashlar(from, to, base - socleH + 1.6, base, 2, 26, rand);
  inc += ashlar(from, to, walk + 3.2, base - socleH, Math.max(2, Math.round((height - socleH) / 9)), 16, rand);
  curtain.appendChild(s('path', { d: inc, fill: 'none', stroke: CLAY, 'stroke-width': 0.6, opacity: 0.55, 'stroke-linecap': 'round' }));
  // The socle's sloping blocks: short slanted strokes, the painter's shorthand for a battered footing.
  let slope = '';
  for (let x = from + 5; x < to; x += 9) slope += `M${f(x)} ${f(base - 1)}l2.6 ${f(-socleH * 0.32)}`;
  curtain.appendChild(s('path', { d: slope, fill: 'none', stroke: CLAY, 'stroke-width': 0.5, opacity: 0.4 }));

  // Towers.
  const towers: Tower[] = [];
  for (const t of spec.towers ?? []) {
    const w = t.w ?? 30;
    const rise = t.rise ?? 26;
    const top = walk - rise;
    const tg = s('g', { class: 'troy-walls__tower' });
    const x0 = t.x - w / 2, x1 = t.x + w / 2;
    tg.appendChild(s('path', { d: `M${f(x0)} ${base + 3}V${f(top + 3)}H${f(x0 - 1.8)}V${f(top)}H${f(x1 + 1.8)}V${f(top + 3)}H${f(x1)}V${base + 3}Z`, fill: INK }));
    let tm = '';
    const n = Math.max(2, Math.round((w + 3.6) / 9));
    const step = (w + 3.6 - 5.6) / (n - 1);
    for (let i = 0; i < n; i++) tm += `M${f(x0 - 1.8 + i * step)} ${f(top + 0.5)}v${-MERLON_H}h5.6v${MERLON_H}z`;
    tg.appendChild(s('path', { d: tm, fill: INK }));
    let ti = `M${f(x0 - 1.8)} ${f(top + 3)}H${f(x1 + 1.8)}M${f(x0)} ${f(top + 5)}H${f(x1)}`;
    ti += `M${f(x0)} ${f(base - socleH)}H${f(x1)}`;
    ti += ashlar(x0, x1, top + 5, base - socleH, Math.max(3, Math.round((base - socleH - top) / 10)), 11, rand);
    ti += `M${f(x0)} ${f(top + 5)}V${base}M${f(x1)} ${f(top + 5)}V${base}`;
    tg.appendChild(s('path', { d: ti, fill: 'none', stroke: CLAY, 'stroke-width': 0.6, opacity: 0.6, 'stroke-linecap': 'round' }));
    // Reserved window slits.
    const wy = top + 12;
    tg.appendChild(s('path', { d: `M${f(t.x - 2.4)} ${f(wy + 9)}V${f(wy + 2)}Q${f(t.x)} ${f(wy - 1)} ${f(t.x + 2.4)} ${f(wy + 2)}V${f(wy + 9)}Z`, fill: CLAY }));
    g.appendChild(tg);
    towers.push({ g: tg, x: t.x, w, top });
  }

  // The gate.
  let gate: Gate | null = null;
  if (spec.gate) {
    const { x, w, h } = spec.gate;
    const x0 = x - w / 2, x1 = x + w / 2, top = base - h;
    const gg = s('g', { class: 'troy-walls__gate' });
    // Jambs and lintel: a heavier frame of dressed stone.
    const frame = `M${f(x0 - 5)} ${base + 3}V${f(top - 6)}H${f(x1 + 5)}V${base + 3}Z`;
    gg.appendChild(s('path', { d: frame, fill: INK }));
    const hole = s('path', { d: `M${f(x0)} ${base + 3}V${f(top)}H${f(x1)}V${base + 3}Z`, fill: DARK });
    gg.appendChild(hole);
    // The leaves: reserved wood, planks and bronze straps with studs.
    const leaf = (lx0: number, lx1: number, hinge: number): SVGGElement => {
      const lg = s('g', { class: 'troy-walls__leaf' });
      lg.dataset.hinge = String(hinge);
      lg.appendChild(s('rect', { x: f(lx0), y: f(top), width: f(lx1 - lx0), height: f(base - top + 3), fill: CLAY, stroke: INK, 'stroke-width': 0.9 }));
      let planks = '';
      const n = 3;
      for (let i = 1; i < n; i++) planks += `M${f(lx0 + ((lx1 - lx0) * i) / n)} ${f(top)}V${base}`;
      lg.appendChild(s('path', { d: planks, stroke: INK, 'stroke-width': 0.5, opacity: 0.8 }));
      let straps = '';
      let studs = '';
      for (const t of [0.18, 0.5, 0.82]) {
        const yy = top + (base - top) * t;
        straps += `M${f(lx0)} ${f(yy - 1.4)}H${f(lx1)}v2.8H${f(lx0)}Z`;
        for (let k = 0; k < 4; k++) studs += `M${f(lx0 + ((lx1 - lx0) * (k + 0.5)) / 4)} ${f(yy)}h0.01`;
      }
      lg.appendChild(s('path', { d: straps, fill: INK }));
      lg.appendChild(s('path', { d: studs, stroke: WHITE, 'stroke-width': 1.1, 'stroke-linecap': 'round' }));
      // A ring handle near the meeting edge.
      const hx = hinge === lx0 ? lx1 - 3.2 : lx0 + 3.2;
      lg.appendChild(s('circle', { cx: f(hx), cy: f(top + (base - top) * 0.62), r: 1.8, fill: 'none', stroke: INK, 'stroke-width': 0.8 }));
      return lg;
    };
    const leafL = leaf(x0, x, x0);
    const leafR = leaf(x, x1, x1);
    gg.append(leafL, leafR);
    // Incised frame around the opening and the lintel block.
    gg.appendChild(
      s('path', {
        d: `M${f(x0 - 2.4)} ${base}V${f(top - 2.4)}H${f(x1 + 2.4)}V${base}M${f(x0 - 5)} ${f(top - 6)}H${f(x1 + 5)}M${f(x0 - 5)} ${f(top - 2.4)}H${f(x0 - 2.4)}M${f(x1 + 2.4)} ${f(top - 2.4)}H${f(x1 + 5)}`,
        fill: 'none',
        stroke: CLAY,
        'stroke-width': 0.7,
        opacity: 0.75,
      }),
    );
    g.appendChild(gg);
    const setLeaf = (lg: SVGGElement, open: number) => {
      const hx = Number(lg.dataset.hinge);
      const k = 1 - 0.84 * open;
      lg.setAttribute('transform', open <= 0 ? '' : `translate(${f(hx)} 0) scale(${k.toFixed(3)} 1) translate(${f(-hx)} 0)`);
    };
    gate = {
      g: gg,
      hole,
      leafL,
      leafR,
      x0,
      x1,
      top,
      set(open: number) {
        setLeaf(leafL, open);
        setLeaf(leafR, open);
      },
    };
  }

  const outline = (): string => {
    // Walk the skyline from left to right (merlon tops), then close far below.
    const pts: Array<[number, number]> = [[from, base + 200], [from, walk - MERLON_H]];
    const ts = [...towers].sort((a, b) => a.x - b.x);
    for (const t of ts) {
      const x0 = Math.max(from, t.x - t.w / 2 - 1.8), x1 = Math.min(to, t.x + t.w / 2 + 1.8);
      pts.push([x0, walk - MERLON_H], [x0, t.top - MERLON_H], [x1, t.top - MERLON_H], [x1, walk - MERLON_H]);
    }
    pts.push([to, walk - MERLON_H], [to, base + 200]);
    return pts.map((p, i) => `${i ? 'L' : 'M'}${f(p[0])} ${f(p[1])}`).join('') + 'Z';
  };

  return {
    g,
    curtain,
    towers,
    gate,
    walk,
    spec,
    outline,
    skyClip: () => `M-220 -220H220V220H-220Z${outline()}`,
  };
}
