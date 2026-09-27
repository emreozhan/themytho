/**
 * Marine art shared by three sea tondos (Avlis, Malea, Aiolos):
 *
 *  - Galley: the kit's hull and oars with a rig of our own, whose square sail
 *    can be brailed up to the yard, let down slack, filled by a following
 *    wind, taken aback, torn to rags — and breathe while it does so.
 *  - RollingSea: the wave-scroll sea whose crests can flatten, rise, heave
 *    and run.
 *  - windPath(): a streaming gust ending in a curl (animate its dashes).
 *  - dolphin(), armTo() (two-bone reach for hands), tondo flash & shake.
 *
 * All in the black-figure manner: glaze silhouettes, clay incisions, added
 * white sails and foam, added purple accents.
 */
import { s } from '../lib/dom';
import { gsap } from '../lib/motion';
import { ship, type ShipParts } from '../art/ship';
import { INK, CLAY, WHITE, PURPLE, type Figure, type Pose } from '../art/figure';
import type { Stage } from './tools';
import { waveStripPath } from '../art/ornaments';
import { ribbon, smoothPath, clamp, lerp, type Vec } from '../lib/geometry';

const f1 = (v: number) => (Math.round(v * 10) / 10).toString();
const r3 = (v: number) => Math.round(v * 1000) / 1000;
const pt = (p: Vec) => `${f1(p[0])} ${f1(p[1])}`;

/* ------------------------------------------------------------------ */
/* Galley                                                              */
/* ------------------------------------------------------------------ */

export interface RigState {
  /** 1 = sail brailed up on the yard, 0 = let down. */
  furl: number;
  /** 0 = hanging slack, 1 = full belly. */
  fill: number;
  /** Where the wind drives the belly: +1 toward the bow (following wind), -1 taken aback. */
  wind: number;
  /** 0 = whole, 1 = torn to rags. */
  tear: number;
  /** Idle breathing amplitude (0..1). */
  breathe: number;
  /** Pennant lift (0 = hanging, 1 = streaming). */
  flag: number;
}

export interface GalleyOptions {
  x?: number;
  y?: number;
  scale?: number;
  facing?: 1 | -1;
  oars?: number;
  crew?: number;
  /** Mast height in ship units (the kit's is 50). */
  mast?: number;
  /** Sail height when let down (defaults to mast - 18). */
  sailH?: number;
  rig?: Partial<RigState>;
  /** Incised outline round the hull so overlapping ships stay legible. */
  halo?: boolean;
  /** Phase for the idle bob (so a fleet does not bob in unison). */
  phase?: number;
  pennant?: boolean;
}

export class Galley {
  readonly g: SVGGElement;
  readonly parts: ShipParts;
  readonly rig: RigState;
  /** Layer between sail and hull: people standing in the ship (the hull hides their feet). */
  readonly deck: SVGGElement;
  /** Layer above the hull. */
  readonly top: SVGGElement;
  x: number;
  y: number;
  scale: number;
  facing: 1 | -1;
  /** Degrees, clockwise on screen. */
  roll = 0;
  /** Vertical displacement (scene units). */
  bob = 0;
  /** Turning about the vertical axis (degrees): the hull narrows and flips as it spins round. */
  yaw = 0;
  readonly phase: number;
  readonly mastH: number;
  readonly sailH: number;
  private sailEl: SVGPathElement;
  private gridEl: SVGPathElement;
  private sheetsEl: SVGPathElement;
  private bundleEl: SVGPathElement;
  private tiesEl: SVGPathElement;
  private tatterEl: SVGPathElement;
  private pennantEl: SVGPathElement | null = null;
  private oarAnim: gsap.core.Timeline | null = null;

  constructor(o: GalleyOptions = {}) {
    this.x = o.x ?? 0;
    this.y = o.y ?? 0;
    this.scale = o.scale ?? 1;
    this.facing = o.facing ?? 1;
    this.phase = o.phase ?? 0;
    this.mastH = o.mast ?? 50;
    this.sailH = o.sailH ?? this.mastH - 18;
    this.rig = { furl: 0, fill: 1, wind: 1, tear: 0, breathe: 0.6, flag: 0.5, ...o.rig };
    this.parts = ship({ sail: 'none', oars: o.oars ?? 11, crew: o.crew ?? 0 });
    this.g = this.parts.g;
    this.g.classList.add('galley');
    const M = this.mastH;
    const rigG = s('g', { class: 'galley__rig' });
    // Mast with its masthead block, forestay and backstay.
    rigG.appendChild(s('path', { d: `M2 -1V${-M}`, stroke: INK, 'stroke-width': 2, 'stroke-linecap': 'round' }));
    rigG.appendChild(s('path', { d: `M0.2 ${-M - 2.4}h3.6v4.6h-3.6z`, fill: INK }));
    rigG.appendChild(s('path', { d: `M2 ${-M + 1}L44.5 -17M2 ${-M + 1}L-43 -24`, stroke: INK, 'stroke-width': 0.6, fill: 'none' }));
    this.sheetsEl = s('path', { stroke: INK, 'stroke-width': 0.5, fill: 'none' });
    this.sailEl = s('path', { fill: WHITE, stroke: INK, 'stroke-width': 1.1, 'stroke-linejoin': 'round' });
    this.gridEl = s('path', { fill: 'none', stroke: INK, 'stroke-width': 0.45, opacity: 0.6 });
    this.tatterEl = s('path', { fill: WHITE, stroke: INK, 'stroke-width': 0.7 });
    // The yard (and the bundle of brailed-up sail on it).
    this.bundleEl = s('path', { fill: 'none', stroke: INK, 'stroke-linecap': 'round' });
    this.tiesEl = s('path', { fill: 'none', stroke: CLAY, 'stroke-width': 0.7, 'stroke-linecap': 'round' });
    rigG.append(this.sheetsEl, this.sailEl, this.gridEl, this.tatterEl, this.bundleEl, this.tiesEl);
    if (o.pennant) {
      this.pennantEl = s('path', { fill: PURPLE, stroke: INK, 'stroke-width': 0.4 });
      rigG.appendChild(this.pennantEl);
    }
    this.deck = s('g', { class: 'galley__deck' });
    this.top = s('g', { class: 'galley__top' });
    this.g.insertBefore(rigG, this.parts.hull);
    this.g.insertBefore(this.deck, this.parts.hull);
    this.g.appendChild(this.top);
    if (o.halo) {
      // Incise the oars too, so they stay legible where they cross black water.
      this.parts.oars.querySelectorAll<SVGGElement>('.oar').forEach((oar) => {
        const line = oar.querySelector('line');
        const blade = oar.querySelector('path');
        if (line) {
          const l2 = line.cloneNode() as SVGLineElement;
          l2.setAttribute('stroke', CLAY);
          l2.setAttribute('stroke-width', '2.4');
          oar.insertBefore(l2, oar.firstChild);
        }
        if (blade) {
          const b2 = blade.cloneNode() as SVGPathElement;
          b2.setAttribute('stroke', CLAY);
          b2.setAttribute('stroke-width', '1.3');
          b2.setAttribute('stroke-linejoin', 'round');
          oar.insertBefore(b2, oar.firstChild);
        }
      });
      const halo = this.parts.hull.cloneNode(true) as SVGGElement;
      halo.setAttribute('class', 'galley__halo');
      [...halo.children].forEach((c, i) => {
        if (i > 2) c.remove();
      });
      halo.setAttribute('stroke', CLAY);
      halo.setAttribute('stroke-width', '2.6');
      halo.setAttribute('stroke-linejoin', 'round');
      this.g.insertBefore(halo, this.g.firstChild);
    }
    this.place();
    this.draw(0);
  }

  place(): void {
    const k = this.scale;
    const turn = this.yaw ? Math.cos((this.yaw * Math.PI) / 180) : 1;
    const sx = k * this.facing * (Math.abs(turn) < 0.04 ? Math.sign(turn || 1) * 0.04 : turn);
    this.g.setAttribute('transform', `translate(${f1(this.x)} ${f1(this.y + this.bob)}) rotate(${f1(this.roll)}) scale(${r3(sx)} ${r3(k)})`);
  }

  /** Map a point in ship-local units to the parent's coordinates. */
  toParent(p: Vec): Vec {
    const k = this.scale;
    const a = (this.roll * Math.PI) / 180;
    const lx = p[0] * k * this.facing, ly = p[1] * k;
    return [this.x + lx * Math.cos(a) - ly * Math.sin(a), this.y + this.bob + lx * Math.sin(a) + ly * Math.cos(a)];
  }

  /** Start (or resume) rowing; returns the endless timeline (register it with st.loop). */
  row(speed = 1): gsap.core.Timeline {
    if (!this.oarAnim) {
      const blades = this.parts.oars.querySelectorAll<SVGGElement>('.oar');
      // A ship drawn without oars gets an idle, empty timeline (never an endless empty one).
      if (!blades.length) return (this.oarAnim = gsap.timeline({ paused: true }));
      const tl = gsap.timeline({ repeat: -1, delay: (this.phase % 1) * 0.4 });
      tl.to(blades, { attr: { transform: 'rotate(16)' }, duration: 0.55 / speed, ease: 'sine.inOut', stagger: 0.012 }).to(blades, {
        attr: { transform: 'rotate(-8)' },
        duration: 0.75 / speed,
        ease: 'sine.inOut',
        stagger: 0.012,
      });
      this.oarAnim = tl;
    } else this.oarAnim.play();
    return this.oarAnim;
  }

  /** Hold the oars still (level) — or ship them. */
  restOars(): void {
    this.oarAnim?.pause();
  }

  /** Re-draw the rig for time `t` (seconds; drives breathing and flapping). */
  draw(t: number): void {
    const R = this.rig;
    const M = this.mastH;
    const yY = -M + 4;
    const yT = yY + 0.6;
    const H = this.sailH;
    const xl = -21.5, xr = 25.5;
    const furl = clamp(R.furl, 0, 1);
    const w = clamp(R.wind, -1, 1);
    const osc = Math.sin(t * 2.3 + this.phase * 6.28) * 0.6 + Math.sin(t * 3.7 + this.phase * 3) * 0.4;
    const b = clamp(R.fill + R.breathe * 0.12 * osc * (0.3 + R.fill), 0, 1.15);
    const slack = clamp(1 - R.fill, 0, 1);
    const h = H * (1 - furl);
    const tear = clamp(R.tear, 0, 1);

    // Yard: a plain spar, or a thick bundle when the sail is brailed up.
    const bw = 1.8 + 2.6 * furl;
    this.bundleEl.setAttribute('d', `M-22 ${f1(yY + 0.5)}Q2 ${f1(yY - 3.5 + furl * 1.2)} 26 ${f1(yY + 0.5)}`);
    this.bundleEl.setAttribute('stroke-width', f1(bw));
    let ties = '';
    if (furl > 0.55) for (let x = -16; x <= 22; x += 7.6) ties += `M${f1(x)} ${f1(yY - 2.6 + furl * 0.6)}l0.8 ${f1(bw * 0.9)}`;
    this.tiesEl.setAttribute('d', ties);
    this.tiesEl.setAttribute('opacity', f1(clamp((furl - 0.55) * 3, 0, 1)));

    if (h < 1.2) {
      this.sailEl.setAttribute('d', '');
      this.gridEl.setAttribute('d', '');
      this.sheetsEl.setAttribute('d', '');
      this.tatterEl.setAttribute('d', '');
    } else {
      const yB = yT + h;
      const sx = w * b * 4.2;
      const lift = b * 1.6;
      const BL: Vec = [xl + sx + slack * 2.6, yB - lift];
      const BR: Vec = [xr + sx - slack * 2.6, yB - lift];
      const sag = b * 5 * (h / H);
      const bow = b * 3.2 - slack * 1.6;
      const midY = (yT + yB) / 2;
      const LC: Vec = [xl + sx * 0.45 - bow, midY];
      const RC: Vec = [xr + sx * 0.45 + bow, midY];
      // The foot: a sagging curve (belly) or a scalloped hem of folds (slack), or rags (torn).
      const n = 8;
      const foot: Vec[] = [];
      const tearY = (u: number) => yT + h * (0.42 + 0.14 * Math.sin(u * 17.3 + 1.2) + 0.08 * Math.sin(u * 41 + 0.4));
      for (let i = 0; i <= n; i++) {
        const u = i / n;
        const x = lerp(BR[0], BL[0], u);
        let y = lerp(BR[1], BL[1], u) + sag * Math.sin(Math.PI * u) + (i % 2 ? slack * 2.4 : -slack * 0.4) * (i > 0 && i < n ? 1 : 0);
        if (tear > 0) {
          const ty = tearY(u) + (i % 2 ? 3.5 : -2.5) * tear;
          y = lerp(y, Math.min(y, ty), tear);
        }
        foot.push([x + (i % 2 ? w * b * 0.6 : 0), y]);
      }
      const TL: Vec = [xl, yT], TR: Vec = [xr, yT];
      const bottomL = foot[n], bottomR = foot[0];
      const d =
        `M${pt(TL)}Q${pt(LC)} ${pt(bottomL)}` +
        // Along the foot from left to right (the reverse of the sampled order).
        smoothPath([...foot].reverse(), false, slack > 0.1 ? 0.35 : 0.45).replace(/^M[^C]+/, '') +
        `Q${pt(RC)} ${pt(TR)}Q2 ${f1(yT - 3.4)} ${pt(TL)}Z`;
      this.sailEl.setAttribute('d', d);

      // Brail lines and seams, following the belly; wavy folds when slack.
      let grid = '';
      for (let k = 1; k < 6; k++) {
        const u = k / 6;
        const top: Vec = [lerp(xl, xr, u), yT - Math.sin(Math.PI * u) * 1.6];
        const fi = foot[Math.round((1 - u) * n)];
        let bot: Vec = [lerp(bottomL[0], bottomR[0], u), fi[1] - 0.6];
        if (tear > 0.5) bot = [bot[0], Math.min(bot[1], fi[1] - 1)];
        const mid: Vec = [lerp(top[0], bot[0], 0.5) + sx * 0.4 + (k % 2 ? slack * 1.8 : -slack * 1.8), (top[1] + bot[1]) / 2];
        grid += `M${pt(top)}Q${pt(mid)} ${pt(bot)}`;
      }
      if (slack < 0.85) {
        for (const fr of [0.3, 0.58, 0.84]) {
          const yy = yT + h * fr;
          if (tear > 0.5 && fr > 0.36) continue;
          const l: Vec = [lerp(xl, bottomL[0], fr) - (fr < 1 ? bow * Math.sin(Math.PI * fr) * 0.8 : 0) + 0.8, yy + (bottomL[1] - yB) * fr];
          const r: Vec = [lerp(xr, bottomR[0], fr) + bow * Math.sin(Math.PI * fr) * 0.8 - 0.8, yy + (bottomR[1] - yB) * fr];
          grid += `M${pt(l)}Q${f1((l[0] + r[0]) / 2 + sx * 0.3)} ${f1(yy + sag * fr * 1.9)} ${pt(r)}`;
        }
      }
      this.gridEl.setAttribute('d', grid);

      // Sheets from the clews to the gunwale: taut when full, sagging when slack.
      const sL: Vec = [-31, -5], sR: Vec = [31, -5];
      if (tear < 0.5) {
        const cL: Vec = [(bottomL[0] + sL[0]) / 2, (bottomL[1] + sL[1]) / 2 + slack * 6];
        const cR: Vec = [(bottomR[0] + sR[0]) / 2, (bottomR[1] + sR[1]) / 2 + slack * 6];
        this.sheetsEl.setAttribute('d', `M${pt(bottomL)}Q${pt(cL)} ${pt(sL)}M${pt(bottomR)}Q${pt(cR)} ${pt(sR)}`);
      } else this.sheetsEl.setAttribute('d', '');

      // Rags streaming downwind from the torn edge.
      if (tear > 0.02) {
        let rags = '';
        const dir = w >= 0 ? 1 : -1;
        [0.22, 0.5, 0.78].forEach((u, i) => {
          const root: Vec = [lerp(xr, xl, u), tearY(u) + 1];
          const L = (10 + i * 4) * tear;
          const fl = Math.sin(t * 9 + i * 2.1 + this.phase * 5);
          const fl2 = Math.sin(t * 13 + i * 1.3);
          const pts: Vec[] = [
            root,
            [root[0] + dir * L * 0.35, root[1] + 3 + fl * 2.4],
            [root[0] + dir * L * 0.7, root[1] + 4 + fl2 * 3.2],
            [root[0] + dir * L, root[1] + 3 + fl * 4],
          ];
          rags += ribbon(pts, [[0, 4.4], [0.6, 2.6], [1, 0.6]], 14);
        });
        this.tatterEl.setAttribute('d', rags);
      } else this.tatterEl.setAttribute('d', '');
    }

    if (this.pennantEl) {
      const top: Vec = [2, -M - 2];
      const lift = clamp(R.flag, 0, 1);
      // The pennant streams downwind: toward the bow in a following wind.
      const dir = w >= 0 ? 1 : -1;
      const fl = Math.sin(t * 6 + this.phase * 4) * (0.4 + lift);
      const L = 14;
      const ang = lerp(80, 8, lift); // degrees below horizontal
      const ax = Math.cos((ang * Math.PI) / 180) * dir, ay = Math.sin((ang * Math.PI) / 180);
      const p1: Vec = [top[0] + ax * L * 0.5 - ay * fl * 1.2, top[1] + ay * L * 0.5 + fl * 1.2 * Math.abs(ax)];
      const p2: Vec = [top[0] + ax * L, top[1] + ay * L + fl * 1.6];
      this.pennantEl.setAttribute('d', ribbon([top, p1, p2], [[0, 3.6], [1, 0.4]], 12));
    }
  }
}

/* ------------------------------------------------------------------ */
/* Sea                                                                 */
/* ------------------------------------------------------------------ */

export interface SeaOptions {
  /** Crest height at amp 1. */
  h?: number;
  /** Incised ripples in the water. */
  ripples?: number;
  seed?: number;
  /** Add white foam flecks on the crests. */
  foam?: boolean;
  /** Mirror the crests so they break the other way. */
  flip?: boolean;
  /** Outline the crests with an incised line (for a sea in front of black water). */
  incised?: boolean;
}

export class RollingSea {
  readonly g: SVGGElement;
  /**
   * Crests (+ foam) as one group: re-parent it in front of ships while the body
   * stays behind them, so waves wash over the hulls and oars show in the water.
   */
  readonly front: SVGGElement;
  readonly crests: SVGPathElement;
  readonly body: SVGGElement;
  readonly foam: SVGPathElement | null;
  /** Top of the crests (at amp 1). */
  readonly y: number;
  readonly h: number;
  readonly tile: number;
  offset = 0;
  amp = 1;
  heave = 0;
  private W: number;
  private flip: boolean;
  private cover: SVGRectElement | null = null;

  constructor(y: number, o: SeaOptions = {}) {
    this.y = y;
    this.h = o.h ?? 18;
    this.flip = !!o.flip;
    const n = Math.max(1, Math.round(576 / (1.6 * this.h)));
    this.tile = 576 / n;
    this.W = 576 + this.tile * 2;
    const W = this.W;
    this.g = s('g', { class: 'aam-sea' });
    this.crests = s('path', { d: waveStripPath(W, this.h), fill: INK });
    if (o.incised) {
      this.crests.setAttribute('stroke', CLAY);
      this.crests.setAttribute('stroke-width', '1.6');
      this.crests.setAttribute('paint-order', 'stroke');
      this.crests.setAttribute('stroke-linejoin', 'round');
    }
    this.body = s('g');
    this.body.appendChild(s('rect', { x: -220, y: y + this.h - 0.6, width: 440, height: 260, fill: INK }));
    let d = '';
    let seed = o.seed ?? 7;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < (o.ripples ?? 14); i++) {
      const x = -170 + rnd() * 320, yy = y + this.h + 8 + rnd() * 110, wd = 12 + rnd() * 14;
      d += `M${f1(x)} ${f1(yy)}q${f1(wd / 4)} -3 ${f1(wd / 2)} 0t${f1(wd / 2)} 0`;
    }
    this.body.appendChild(s('path', { d, fill: 'none', stroke: CLAY, 'stroke-width': 0.9, opacity: 0.42, 'stroke-linecap': 'round' }));
    this.front = s('g', { class: 'aam-sea__front' });
    this.front.appendChild(this.crests);
    if (o.incised) {
      // Hide the incised line along the crests' flat base.
      this.cover = s('rect', { x: -220, y: 0, width: 440, height: 2.6, fill: INK });
      this.front.appendChild(this.cover);
    }
    this.g.append(this.front, this.body);
    if (o.foam) {
      // Flecks of added white riding the crest tips (one per crest, a tile apart).
      let fd = '';
      const k = this.h / 10;
      const unit = this.tile;
      for (let x = 0; x < W; x += unit) {
        const cx = x + (13.4 / 16) * unit, cy = 1.8 * k;
        fd += `M${f1(cx - 1.6 * k)} ${f1(cy - 0.2 * k)}q${f1(1.4 * k)} ${f1(-1.6 * k)} ${f1(3 * k)} ${f1(0.2 * k)}`;
      }
      this.foam = s('path', { d: fd, fill: 'none', stroke: WHITE, 'stroke-width': Math.max(0.8, this.h / 18), 'stroke-linecap': 'round' });
      this.front.insertBefore(this.foam, this.cover);
    } else this.foam = null;
    this.place();
  }

  place(): void {
    const base = this.y + this.h + this.heave;
    const off = ((this.offset % this.tile) + this.tile) % this.tile;
    const sx = this.flip ? -1 : 1;
    const tr = `translate(${f1(sx * (-this.W / 2 + off))} ${f1(base)}) scale(${sx} ${r3(Math.max(0.02, this.amp))}) translate(0 ${f1(-this.h)})`;
    this.crests.setAttribute('transform', tr);
    this.foam?.setAttribute('transform', tr);
    this.cover?.setAttribute('y', f1(base - 1.6));
    this.body.setAttribute('transform', `translate(0 ${f1(this.heave)})`);
  }

  /** Height of the sea surface (crest base) at the current heave. */
  get base(): number {
    return this.y + this.h + this.heave;
  }
}

/* ------------------------------------------------------------------ */
/* Wind, dolphins, reach                                               */
/* ------------------------------------------------------------------ */

/**
 * A streaming gust from (x, y): a gentle wave `len` long in direction `dir`
 * (+1 right, -1 left) ending in a spiral curl of radius `r`. Use pathLength=1
 * and animate `stroke-dashoffset` for a flowing wind.
 */
export function windPath(x: number, y: number, len: number, amp = 4, r = 6, dir: 1 | -1 = 1, curlUp = true): string {
  const pts: Vec[] = [];
  const N = 10;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    pts.push([x + dir * len * u, y + amp * Math.sin(u * Math.PI * 1.6) * (1 - u * 0.4)]);
  }
  // The curl: a shrinking spiral that leaves the end point in the direction of travel.
  const [ex, ey] = pts[N];
  const cy = ey + (curlUp ? -r : r);
  const phi0 = curlUp ? 90 : -90;
  const sgn = curlUp ? -dir : dir;
  const turn = 330;
  for (let a = 30; a <= turn; a += 30) {
    const rr = r * (1 - (0.7 * a) / turn);
    const ph = ((phi0 + sgn * a) * Math.PI) / 180;
    pts.push([ex + Math.cos(ph) * rr, cy + Math.sin(ph) * rr]);
  }
  return smoothPath(pts, false, 0.5);
}

/**
 * A leaping dolphin, facing +x, about 46 long, centred near (0, 0). With
 * `incised` it is drawn only as scratched lines (for dolphins inside black water).
 */
export function dolphin(incised = false): SVGGElement {
  // An incised outline keeps the silhouette legible over hulls and black water.
  const g = s('g', { class: 'aam-dolphin', stroke: CLAY, 'stroke-width': incised ? 0.8 : 1.4, 'paint-order': 'stroke', 'stroke-linejoin': 'round' });
  if (incised) g.setAttribute('fill-opacity', '0');
  const body: Vec[] = [
    [24, 1.2], [19, -1.2], [15, -4.6], [8, -7.6], [-2, -8.4], [-11, -6.4], [-18, -3.4], [-23, -1.4],
    [-18, 1.6], [-10, 3.6], [0, 4.8], [10, 4.4], [17, 3.2],
  ];
  g.appendChild(s('path', { d: smoothPath(body, true, 0.4), fill: INK }));
  // Dorsal fin, flukes and flipper.
  g.appendChild(s('path', { d: 'M-1 -7.6C-3 -12 -6 -15 -10 -16C-8 -12 -8 -9 -9 -6.6Z', fill: INK }));
  g.appendChild(s('path', { d: 'M-21 -1.6C-25 -5 -29 -7 -33 -7C-31 -4 -29 -1.6 -27 0C-29 1.6 -31 4 -33 7C-29 6.6 -25 4.6 -21 1Z', fill: INK }));
  g.appendChild(s('path', { d: 'M6 3.6C5 6.6 2.6 9 -0.6 10C0.4 7.6 0.6 5.4 0 3.8Z', fill: INK }));
  // Incised eye, mouth line and the belly line.
  g.appendChild(s('circle', { cx: 15.4, cy: -1.8, r: 0.95, fill: CLAY, stroke: 'none' }));
  g.appendChild(s('path', { d: 'M24 1.4L18 1.2M16 1.6Q2 4.2 -14 0.6', fill: 'none', stroke: CLAY, 'stroke-width': 0.6, 'stroke-linecap': 'round' }));
  return g;
}

const UPPER = 16, FORE = 14.5;

/**
 * Two-bone reach: arm angles [shoulder, elbow] that put the wrist of `fig`'s
 * front/back arm at `target` (figure-local coordinates, before facing/scale).
 * `bend` picks the elbow side (1: elbow down/back, -1: elbow up/forward).
 */
export function armTo(fig: Figure, which: 'F' | 'B', target: Vec, bend: 1 | -1 = 1, p?: Pose): [number, number] {
  const j = fig.joints(p ?? fig.pose);
  const S = which === 'F' ? j.armF.S : j.armB.S;
  const dx = target[0] - S[0], dy = target[1] - S[1];
  const d = clamp(Math.hypot(dx, dy), Math.abs(UPPER - FORE) + 0.05, UPPER + FORE - 0.05);
  const theta = (Math.atan2(dx, dy) * 180) / Math.PI;
  const alpha = (Math.acos(clamp((UPPER * UPPER + d * d - FORE * FORE) / (2 * UPPER * d), -1, 1)) * 180) / Math.PI;
  const beta = (Math.acos(clamp((UPPER * UPPER + FORE * FORE - d * d) / (2 * UPPER * FORE), -1, 1)) * 180) / Math.PI;
  return [theta + bend * alpha, -bend * (180 - beta)];
}

/** Head centre and angle of a figure in its local frame (for masks, cheeks, trumpets). */
export function headFrame(fig: Figure, p?: Pose): { c: Vec; a: number; at(x: number, y: number): Vec } {
  const j = fig.joints(p ?? fig.pose);
  const a = (j.headAngle * Math.PI) / 180;
  const c = j.HC;
  return {
    c,
    a: j.headAngle,
    at: (x, y) => [c[0] + x * Math.cos(a) - y * Math.sin(a), c[1] + x * Math.sin(a) + y * Math.cos(a)],
  };
}

/* ------------------------------------------------------------------ */
/* Scene plumbing                                                      */
/* ------------------------------------------------------------------ */

/**
 * Drive a frame-by-frame picture: `frame(t)` runs on every tick, with `t` in
 * seconds. Under reduced motion time stands still (no idle motion) but the
 * picture still follows state changes. Killed with the stage. Returns a
 * `redraw()` for immediate updates.
 */
export function renderLoop(st: Stage, reduced: boolean, frame: (t: number) => void): () => void {
  const clock = { t: 0 };
  const now = () => (reduced ? 0 : clock.t);
  st.timeline().to(clock, { t: 3600, duration: 3600, ease: 'none', repeat: -1, onUpdate: () => frame(now()) });
  frame(0);
  return () => frame(now());
}

/**
 * Tween a Figure's pose as a stage-tracked animation (killed on destroy,
 * shortened under reduced motion).
 */
export function poser(st: Stage, reduced: boolean) {
  return (fig: Figure, target: Partial<Pose>, vars: gsap.TweenVars = {}): gsap.core.Tween => {
    const d = (vars.duration as number | undefined) ?? 0.6;
    const tw = fig.to(target, { ...vars, duration: reduced ? Math.min(d, 0.15) : d, delay: reduced ? 0 : vars.delay });
    st.timeline().add(tw, 0);
    return tw;
  };
}

/** A transform puppet: tween `p` (x, y, r, s) and it re-writes the element's transform. */
export function puppet(el: SVGElement, init: Partial<{ x: number; y: number; r: number; s: number; o: number }> = {}) {
  const p = { x: 0, y: 0, r: 0, s: 1, o: 1, ...init };
  const apply = () => {
    el.setAttribute('transform', `translate(${f1(p.x)} ${f1(p.y)}) rotate(${f1(p.r)}) scale(${Math.round(p.s * 1000) / 1000})`);
    el.setAttribute('opacity', String(Math.round(p.o * 1000) / 1000));
  };
  apply();
  return { p, apply };
}

/* ------------------------------------------------------------------ */
/* Tondo effects                                                       */
/* ------------------------------------------------------------------ */

/** A full-tondo flash (added white) — lightning seen inside the cup. Add the result to a stage timeline. */
export function tondoFlash(layer: SVGGElement, color = WHITE, peak = 0.85): gsap.core.Timeline {
  const r = s('rect', { x: -200, y: -200, width: 400, height: 400, fill: color, opacity: 0, 'pointer-events': 'none' });
  layer.appendChild(r);
  return gsap
    .timeline({ onComplete: () => r.remove(), onInterrupt: () => r.remove() })
    .to(r, { opacity: peak, duration: 0.06 })
    .to(r, { opacity: 0.1, duration: 0.12 })
    .to(r, { opacity: peak * 0.6, duration: 0.05 })
    .to(r, { opacity: 0, duration: 0.7, ease: 'power2.out' });
}

/** Shake a group (the whole picture) briefly. */
export function shakeGroup(el: SVGGElement, k = 5): gsap.core.Timeline {
  return gsap.timeline().to(el, {
    keyframes: [
      { x: -k, y: k * 0.5, duration: 0.05 },
      { x: k * 0.9, y: -k * 0.6, duration: 0.05 },
      { x: -k * 0.6, y: k * 0.3, duration: 0.06 },
      { x: k * 0.35, y: -k * 0.2, duration: 0.07 },
      { x: 0, y: 0, duration: 0.08 },
    ],
  });
}
