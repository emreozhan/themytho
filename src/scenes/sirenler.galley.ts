/**
 * A black-figure galley with a real crew: the kit hull, mast and rigging with
 * rowers (Figures) seated behind the gunwale. Each rower's oar runs from his
 * hands over a thole pin on the gunwale down into the sea, so when he leans
 * into a stroke the blade sweeps the right way on its own.
 *
 * Galley frame: bow faces +x, waterline at y = 0, ship centre at x = 0.
 * Rowers face the stern (−x), as rowers do; the helmsman faces the bow.
 *
 * Used by the Sirens and the Skylla tondos.
 */
import { s } from '../lib/dom';
import { lerp, smoothstep, type Vec } from '../lib/geometry';
import { ship, BLACK_FIGURE, type ShipParts } from '../art/ship';
import { Figure, pose, INK, CLAY, WHITE, type Pose, type FigureStyle } from '../art/figure';

const f1 = (v: number) => Math.round(v * 10) / 10;

export interface GalleyOptions {
  /** Scale of the kit ship (≈100 units long at 1). */
  k: number;
  /** Rower seats as x in the kit ship's own frame (−36 … 33). */
  seats: number[];
  rowerScale: number;
  sail?: 'furled' | 'full' | 'none' | 'torn';
  helmsman?: boolean;
  /** Oar length from hands to blade tip, scene units. */
  oar?: number;
  /** Per-rower style overrides. */
  styles?: FigureStyle[];
}

export interface Rower {
  fig: Figure;
  x: number;
  thole: Vec;
  oar: SVGPathElement;
  /** Current phase offset in the stroke. */
  lag: number;
  /** Extra pose added on top of the stroke (head turns etc.). */
  extra: Partial<Pose>;
  /** Weight of the stroke (0 = resting, 1 = rowing). */
  effort: number;
  /** Rower is gone (snatched): skip his oar. */
  gone: boolean;
}

/** Catch (reaching toward the stern) and finish (leaning back toward the bow). */
const CATCH = { lean: 24, head: -4, armF: [88, 4] as [number, number], armB: [82, 10] as [number, number] };
const FINISH = { lean: -20, head: 8, armF: [36, 74] as [number, number], armB: [30, 80] as [number, number] };
const REST = { lean: 2, head: 4, armF: [62, 40] as [number, number], armB: [56, 46] as [number, number] };

export class Galley {
  readonly g: SVGGElement;
  readonly parts: ShipParts;
  readonly k: number;
  readonly gunwale: number;
  readonly rowers: Rower[] = [];
  readonly helmsman: Figure | null = null;
  /** Layers, back to front. */
  readonly behind: SVGGElement;
  readonly crew: SVGGElement;
  readonly hullLayer: SVGGElement;
  readonly oars: SVGGElement;
  readonly deck: SVGGElement;
  readonly top: SVGGElement;
  readonly mastX: number;
  readonly mastTop: number;
  x = 0;
  y = 0;
  rot = 0;
  private oarLen: number;

  constructor(o: GalleyOptions) {
    this.k = o.k;
    const K = o.k;
    this.gunwale = -4.6 * K;
    this.mastX = 2 * K;
    this.mastTop = -50 * K;
    this.oarLen = o.oar ?? 34 * K * 0.5;
    this.parts = ship({ palette: BLACK_FIGURE, sail: o.sail ?? 'furled', oars: 0, crew: 0 });
    this.g = s('g', { class: 'galley' });
    const scaled = () => s('g', { transform: `scale(${K})` });
    // Re-layer the kit ship so the crew can sit between rigging and hull.
    const [steer, rig, sail, hull] = [this.parts.oars, this.parts.g.children[1] as SVGGElement, this.parts.sail, this.parts.hull];
    this.behind = scaled();
    this.behind.append(steer, rig, sail);
    this.crew = s('g', { class: 'galley__crew' });
    this.hullLayer = scaled();
    this.hullLayer.appendChild(hull);
    // Hull gets an incised contour so it reads against black rocks and figures.
    hull.querySelectorAll('path').forEach((p, i) => {
      if (i < 3) {
        p.setAttribute('stroke', CLAY);
        p.setAttribute('stroke-width', String(0.9 / K));
        p.setAttribute('paint-order', 'stroke');
      }
    });
    this.oars = s('g', { class: 'galley__oars' });
    this.deck = s('g', { class: 'galley__deck' });
    this.top = s('g', { class: 'galley__top' });
    this.g.append(this.behind, this.crew, this.hullLayer, this.oars, this.deck, this.top);

    const rs = o.rowerScale;
    const seatY = this.gunwale + 3.5;
    o.seats.forEach((lx, i) => {
      const x = lx * K;
      const style: FigureStyle = { head: i % 3 === 1 ? 'youth' : 'bearded', garment: 'none', facing: -1, scale: rs, ...(o.styles?.[i] ?? {}) };
      const fig = new Figure(style, pose({ x, y: seatY / rs - 0.5, legF: [84, 70], legB: [80, 66], ...REST }));
      this.crew.appendChild(fig.g);
      const oar = s('path', { fill: INK, stroke: CLAY, 'stroke-width': 0.6, 'paint-order': 'stroke', 'stroke-linejoin': 'round' });
      this.oars.appendChild(oar);
      this.rowers.push({ fig, x, thole: [x - 13 * rs, this.gunwale + 0.6], oar, lag: i * 0.025, extra: {}, effort: 0, gone: false });
    });
    if (o.helmsman) {
      const hx = -35 * K;
      this.helmsman = new Figure({ head: 'bearded', garment: 'short', facing: 1, scale: rs }, pose({ x: hx, y: seatY / rs - 1, lean: -6, head: 4, legF: [84, 70], legB: [80, 66], armF: [30, 20], armB: [-60, 40] }));
      this.crew.insertBefore(this.helmsman.g, this.crew.firstChild);
    }
    this.row(0, 0);
  }

  place(x: number, y: number, rot = 0): void {
    this.x = x;
    this.y = y;
    this.rot = rot;
    this.g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)})`);
  }

  /** Scene-space position of a point given in galley space. */
  toScene(p: Vec): Vec {
    const a = (this.rot * Math.PI) / 180;
    return [this.x + p[0] * Math.cos(a) - p[1] * Math.sin(a), this.y + p[0] * Math.sin(a) + p[1] * Math.cos(a)];
  }

  /**
   * Pose every rower for a stroke phase (0..1 repeating). `effort` blends
   * between resting (0) and rowing (1); `breath` is a small idle sway.
   */
  row(phase: number, effort: number, breath = 0): void {
    for (const r of this.rowers) {
      if (r.gone) continue;
      const e = effort * (r.effort >= 0 ? 1 : 0);
      const ph = (((phase - r.lag) % 1) + 1) % 1;
      // Drive fast (0 → 0.42), recover slower.
      const u = ph < 0.42 ? smoothstep(0, 1, ph / 0.42) : 1 - smoothstep(0, 1, (ph - 0.42) / 0.58);
      const mix = (a: number, b: number) => lerp(a, b, u);
      const stroke = {
        lean: mix(CATCH.lean, FINISH.lean),
        head: mix(CATCH.head, FINISH.head),
        armF: [mix(CATCH.armF[0], FINISH.armF[0]), mix(CATCH.armF[1], FINISH.armF[1])] as [number, number],
        armB: [mix(CATCH.armB[0], FINISH.armB[0]), mix(CATCH.armB[1], FINISH.armB[1])] as [number, number],
      };
      const sway = Math.sin((phase + r.lag * 7) * Math.PI * 2) * breath;
      const bl = (a: number, b: number) => lerp(a, b, e);
      const p: Partial<Pose> = {
        lean: bl(REST.lean + sway * 3, stroke.lean),
        head: bl(REST.head + sway * 2, stroke.head),
        armF: [bl(REST.armF[0], stroke.armF[0]), bl(REST.armF[1], stroke.armF[1])],
        armB: [bl(REST.armB[0], stroke.armB[0]), bl(REST.armB[1], stroke.armB[1])],
      };
      const ex = r.extra;
      if (ex.lean !== undefined) p.lean = (p.lean ?? 0) + ex.lean;
      if (ex.head !== undefined) p.head = (p.head ?? 0) + ex.head;
      if (ex.armF) p.armF = ex.armF;
      if (ex.armB) p.armB = ex.armB;
      r.fig.set(p);
      this.drawOar(r);
    }
  }

  drawOar(r: Rower): void {
    if (r.gone) {
      // Unmanned oar: trailing in the water.
      const [tx, ty] = r.thole;
      const B: Vec = [tx - this.oarLen * 0.62, ty + this.oarLen * 0.62];
      r.oar.setAttribute('d', oarPath([tx + 8, ty - 5], B, this.k));
      return;
    }
    const H = r.fig.hand('F');
    r.oar.setAttribute('d', oarPath(H, r.thole, this.k, this.oarLen));
  }

  /** Ear of a rower (for the wax), galley space. */
  ear(r: Rower | Figure): Vec {
    const fig = r instanceof Figure ? r : r.fig;
    const j = fig.joints();
    const a = (j.headAngle * Math.PI) / 180;
    const ex = -2.4, ey = 0.3;
    return fig.toWorld([j.HC[0] + ex * Math.cos(a) - ey * Math.sin(a), j.HC[1] + ex * Math.sin(a) + ey * Math.cos(a)]);
  }

  /** Top of a rower's head (galley space). */
  crown(r: Rower): Vec {
    const j = r.fig.joints();
    return r.fig.toWorld([j.HC[0], j.HC[1] - 9]);
  }
}

/** Shaft from the hand through the thole, with a leaf blade at the end. */
function oarPath(H: Vec, T: Vec, k: number, len?: number): string {
  let dx = T[0] - H[0], dy = T[1] - H[1];
  const L = Math.hypot(dx, dy) || 1;
  dx /= L;
  dy /= L;
  const total = len ?? L;
  const a: Vec = [H[0] - dx * 2.5, H[1] - dy * 2.5];
  const b: Vec = [H[0] + dx * total, H[1] + dy * total];
  const nx = -dy, ny = dx;
  const w = 0.55 * Math.min(1.6, k / 1.4);
  const bw = 1.9 * Math.min(1.6, k / 1.4);
  const bl = 8.5 * Math.min(1.6, k / 1.4);
  const c: Vec = [b[0] - dx * bl, b[1] - dy * bl];
  const q = (x: number, y: number) => `${f1(x)} ${f1(y)}`;
  return (
    `M${q(a[0] + nx * w, a[1] + ny * w)}L${q(c[0] + nx * w, c[1] + ny * w)}` +
    `Q${q(c[0] + nx * bw * 1.1 + dx * bl * 0.3, c[1] + ny * bw * 1.1 + dy * bl * 0.3)} ${q(b[0] + nx * bw * 0.4, b[1] + ny * bw * 0.4)}` +
    `L${q(b[0] + dx * 1.2, b[1] + dy * 1.2)}L${q(b[0] - nx * bw * 0.4, b[1] - ny * bw * 0.4)}` +
    `Q${q(c[0] - nx * bw * 1.1 + dx * bl * 0.3, c[1] - ny * bw * 1.1 + dy * bl * 0.3)} ${q(c[0] - nx * w, c[1] - ny * w)}` +
    `L${q(a[0] - nx * w, a[1] - ny * w)}Z`
  );
}

export { WHITE };
