/**
 * Props and rig helpers for the Trojan War tondos (Troya, Tahta At):
 * hoplites that carry a big round shield with a painted device and a spear,
 * a "halo" that incises a clay contour around a figure standing over black
 * glaze, arrows, and pose blending for looping fights.
 */
import { s, r1 } from '../lib/dom';
import { add, mul, limb, ribbon, type Vec } from '../lib/geometry';
import { gsap } from '../lib/motion';
import { Figure, INK, CLAY, WHITE, PURPLE, shield, type FigureStyle, type Pose } from '../art/figure';

export type Device = 'gorgon' | 'triskeles' | 'star' | 'lion' | 'tripod' | 'dolphin' | 'none';

const d2r = Math.PI / 180;
const down = (a: number): Vec => [Math.sin(a * d2r), Math.cos(a * d2r)];

/** Linear blend of two poses. */
export function mixPose(a: Pose, b: Pose, t: number): Pose {
  const m = (x: number, y: number) => x + (y - x) * t;
  const m2 = (x: [number, number], y: [number, number]): [number, number] => [m(x[0], y[0]), m(x[1], y[1])];
  return {
    x: m(a.x, b.x),
    y: m(a.y, b.y),
    lean: m(a.lean, b.lean),
    head: m(a.head, b.head),
    armF: m2(a.armF, b.armF),
    armB: m2(a.armB, b.armB),
    legF: m2(a.legF, b.legF),
    legB: m2(a.legB, b.legB),
    footF: m(a.footF, b.footF),
    footB: m(a.footB, b.footB),
    grip: m(a.grip, b.grip),
  };
}

export function clonePose(p: Pose): Pose {
  return { ...p, armF: [...p.armF], armB: [...p.armB], legF: [...p.legF], legB: [...p.legB] };
}

/**
 * Tween a Figure to a pose, reading the start pose when the tween starts (so
 * several pose tweens can be queued in one timeline).
 */
export function poseTo(fig: Figure, target: Partial<Pose>, vars: gsap.TweenVars = {}): gsap.core.Tween {
  const { onUpdate, ...rest } = vars;
  let from: Pose = clonePose(fig.pose);
  let to: Pose = { ...from, ...target };
  const proxy = { t: 0 };
  return gsap.to(proxy, {
    t: 1,
    duration: 0.6,
    ease: 'power2.inOut',
    ...rest,
    onStart: () => {
      from = clonePose(fig.pose);
      to = { ...from, ...target };
    },
    onUpdate: () => {
      fig.set(mixPose(from, to, proxy.t));
      (onUpdate as (() => void) | undefined)?.();
    },
  });
}

/** A frontal Gorgon mask in added white: snaky locks, staring eyes, the grin and the lolling tongue. */
function gorgoneion(R: number): SVGGElement {
  const g = s('g', { class: 'device device--gorgon' });
  let locks = '';
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const p0: Vec = [Math.cos(a) * R * 0.7, Math.sin(a) * R * 0.7];
    const p1: Vec = [Math.cos(a + 0.18) * R * 0.98, Math.sin(a + 0.18) * R * 0.98];
    const c: Vec = [Math.cos(a - 0.12) * R * 0.9, Math.sin(a - 0.12) * R * 0.9];
    locks += `M${r1(p0[0])} ${r1(p0[1])}Q${r1(c[0])} ${r1(c[1])} ${r1(p1[0])} ${r1(p1[1])}`;
  }
  g.appendChild(s('path', { d: locks, fill: 'none', stroke: WHITE, 'stroke-width': R * 0.1, 'stroke-linecap': 'round' }));
  g.appendChild(s('circle', { r: r1(R * 0.7), fill: WHITE }));
  const k = R / 10;
  const eyes = `M${-5.2 * k} ${-2.2 * k}q2 -1.8 4 0q-2 1.4 -4 0ZM${1.2 * k} ${-2.2 * k}q2 -1.8 4 0q-2 1.4 -4 0Z`;
  g.appendChild(s('path', { d: eyes, fill: INK }));
  g.appendChild(s('path', { d: `M${-5.6 * k} ${-4.4 * k}q2.6 -1.6 4.8 0.2M${0.8 * k} ${-4.2 * k}q2.2 -1.8 4.8 -0.2M0 ${-2.4 * k}l${-1 * k} ${3 * k}h${2 * k}Z`, fill: 'none', stroke: INK, 'stroke-width': 0.6 * k, 'stroke-linejoin': 'round' }));
  g.appendChild(s('path', { d: `M${-5.4 * k} ${2.2 * k}Q0 ${8.4 * k} ${5.4 * k} ${2.2 * k}Q0 ${4.6 * k} ${-5.4 * k} ${2.2 * k}Z`, fill: INK }));
  g.appendChild(s('path', { d: `M${-1.6 * k} ${4 * k}Q0 ${9.6 * k} ${1.6 * k} ${4 * k}Z`, fill: PURPLE }));
  g.appendChild(s('path', { d: `M${-3.6 * k} ${3 * k}v${1.4 * k}M${3.6 * k} ${3 * k}v${1.4 * k}`, stroke: WHITE, 'stroke-width': 0.5 * k }));
  return g;
}

/** The triskeles: three running legs — a favourite archaic shield blazon. */
function triskeles(R: number): SVGGElement {
  const g = s('g', { class: 'device device--triskeles' });
  let d = '';
  for (let i = 0; i < 3; i++) {
    const rot = (i * 120 - 90) * d2r;
    const rotp = (p: Vec): Vec => [p[0] * Math.cos(rot) - p[1] * Math.sin(rot), p[0] * Math.sin(rot) + p[1] * Math.cos(rot)];
    const H: Vec = rotp([R * 0.12, 0]);
    const K: Vec = rotp([R * 0.62, R * 0.04]);
    const A: Vec = rotp([R * 0.78, R * 0.5]);
    const T: Vec = rotp([R * 1.02, R * 0.46]);
    d += limb(H, K, [[0, R * 0.16, R * 0.16], [1, R * 0.1, R * 0.1]]);
    d += limb(K, A, [[0, R * 0.1, R * 0.1], [0.4, R * 0.11, R * 0.08], [1, R * 0.06, R * 0.06]]);
    d += limb(A, T, [[0, R * 0.07, R * 0.05], [1, R * 0.04, R * 0.03]]);
  }
  g.appendChild(s('path', { d, fill: WHITE }));
  g.appendChild(s('circle', { r: r1(R * 0.18), fill: WHITE }));
  return g;
}

/** A hoplite shield (aspis) centred at 0,0 with a painted device and an incised rim. */
export function aspis(r: number, device: Device): SVGGElement {
  const kitDevice = device === 'gorgon' || device === 'triskeles' ? 'none' : device;
  const g = s('g', { class: 'aspis' });
  // A clay contour so the disc separates from the glaze body behind it.
  g.appendChild(s('circle', { r: r + 0.9, fill: CLAY }));
  g.appendChild(shield([0, 0], r, kitDevice));
  g.appendChild(s('circle', { r: r - 0.9, fill: 'none', stroke: CLAY, 'stroke-width': 0.45, opacity: 0.7 }));
  if (device === 'gorgon') g.appendChild(gorgoneion(r * 0.56));
  if (device === 'triskeles') g.appendChild(triskeles(r * 0.62));
  return g;
}

/** A spear lying along +x from -len*grip to len*(1-grip): shaft, leaf blade and butt-spike. */
export function spearShape(len: number, grip: number, color = INK): SVGGElement {
  const g = s('g', { class: 'spear' });
  const a = -len * grip, b = len * (1 - grip);
  g.appendChild(s('path', { d: `M${r1(a + 3)} -0.6L${r1(b - 7)} -0.55L${r1(b - 7)} 0.55L${r1(a + 3)} 0.6Z`, fill: color }));
  g.appendChild(s('path', { d: limb([b - 11, 0], [b + 1, 0], [[0, 0.5, 0.5], [0.45, 1.9, 1.9], [1, 0.1, 0.1]], false, false), fill: color }));
  g.appendChild(s('path', { d: `M${r1(a - 1)} 0L${r1(a + 4)} -0.9L${r1(a + 4)} 0.9Z`, fill: color }));
  return g;
}

/** An arrow along +x ending at x=0 (tip), `len` long, with fletching. */
export function arrowShape(len = 22, color = INK): SVGGElement {
  const g = s('g', { class: 'arrow' });
  g.appendChild(s('path', { d: `M${-len} 0H-3`, stroke: color, 'stroke-width': 0.7, 'stroke-linecap': 'round' }));
  g.appendChild(s('path', { d: 'M0.6 0L-3.6 -1.5L-2.8 0L-3.6 1.5Z', fill: color }));
  g.appendChild(s('path', { d: `M${-len + 5} 0L${-len + 0.5} -2.4L${-len - 1} -2.4L${-len + 2.5} 0L${-len - 1} 2.4L${-len + 0.5} 2.4Z`, fill: color }));
  return g;
}

export interface HopliteOptions {
  device?: Device;
  shieldR?: number;
  spearLen?: number;
  /** Where the hand grips the spear (fraction from the butt). */
  grip?: number;
  aim?: number;
  /** Incise greaves on the shins. */
  greaves?: boolean;
}

/**
 * A Figure armed as a hoplite. Props live inside the figure's group, drawn in
 * its pose frame, so they follow facing and scale. `aim` is the spear's angle
 * (0 = level and forward, positive = pointing down).
 */
export class Hoplite {
  readonly fig: Figure;
  readonly shield: SVGGElement;
  readonly spear: SVGGElement;
  private shieldPos: SVGGElement;
  private greaves: SVGPathElement | null = null;
  aim: number;
  /** Shield offset from the forearm (pose frame). */
  shieldShift: Vec = [2.6, 0];
  /** Extra props to re-place after every pose change. */
  onSync: (() => void) | null = null;
  constructor(style: FigureStyle, p: Pose, opts: HopliteOptions = {}) {
    this.fig = new Figure(style, p);
    this.aim = opts.aim ?? 0;
    const r = opts.shieldR ?? 19;
    if (opts.greaves !== false) {
      this.greaves = s('path', { fill: 'none', stroke: style.ground ?? CLAY, 'stroke-width': 0.55, 'stroke-linecap': 'round', class: 'greaves' });
      this.fig.g.appendChild(this.greaves);
    }
    this.spear = spearShape(opts.spearLen ?? 116, opts.grip ?? 0.42);
    this.shieldPos = s('g', { class: 'shield-pos' });
    this.shield = aspis(r, opts.device ?? 'star');
    this.shieldPos.appendChild(this.shield);
    this.fig.g.append(this.shieldPos, this.spear);
    this.sync();
  }

  get g(): SVGGElement {
    return this.fig.g;
  }

  get pose(): Pose {
    return this.fig.pose;
  }

  /** Re-place shield and spear for the current pose. */
  sync(): void {
    const j = this.fig.joints();
    const b = j.armB;
    const c = add(add(mul(add(b.E, b.W), 0.5), mul(j.fwd, this.shieldShift[0])), mul(j.u, this.shieldShift[1]));
    this.shieldPos.setAttribute('transform', `translate(${r1(c[0])} ${r1(c[1])})`);
    const f = j.armF;
    const G = add(f.W, mul(down(f.a), 2));
    this.spear.setAttribute('transform', `translate(${r1(G[0])} ${r1(G[1])}) rotate(${r1(this.aim)})`);
    if (this.greaves) {
      let d = '';
      for (const l of [j.legF, j.legB]) {
        const sh = down(l.sa);
        const n: Vec = [sh[1], -sh[0]];
        const k1 = add(add(l.K, mul(sh, 3.5)), mul(n, -1.6));
        const a1 = add(add(l.A, mul(sh, -3.2)), mul(n, -0.9));
        const k2 = add(add(l.K, mul(sh, 3.2)), mul(n, 1.8));
        d += `M${r1(k1[0])} ${r1(k1[1])}Q${r1(k2[0])} ${r1(k2[1])} ${r1(k2[0] + n[0] * 0.4 + sh[0] * 2)} ${r1(k2[1] + n[1] * 0.4 + sh[1] * 2)}`;
        d += `M${r1(k1[0])} ${r1(k1[1])}L${r1(a1[0])} ${r1(a1[1])}`;
      }
      this.greaves.setAttribute('d', d);
    }
    this.onSync?.();
  }

  set(p: Partial<Pose>, aim?: number): void {
    if (aim !== undefined) this.aim = aim;
    this.fig.set(p);
    this.sync();
  }

  /** Tween to a pose (and spear aim). The start pose is read when the tween starts. */
  to(target: Partial<Pose>, vars: gsap.TweenVars & { aim?: number } = {}): gsap.core.Tween {
    const { aim, onUpdate, ...rest } = vars;
    let a0 = this.aim;
    let from: Pose = { ...this.fig.pose };
    let to: Pose = { ...from, ...target };
    const proxy = { t: 0 };
    return gsap.to(proxy, {
      t: 1,
      duration: 0.6,
      ease: 'power2.inOut',
      ...rest,
      onStart: () => {
        a0 = this.aim;
        from = clonePose(this.fig.pose);
        to = { ...from, ...target };
      },
      onUpdate: () => {
        if (aim !== undefined) this.aim = a0 + (aim - a0) * proxy.t;
        this.fig.set(mixPose(from, to, proxy.t));
        this.sync();
        (onUpdate as (() => void) | undefined)?.();
      },
    });
  }

  showShield(on: boolean): void {
    this.shieldPos.style.display = on ? '' : 'none';
  }

  showSpear(on: boolean): void {
    this.spear.style.display = on ? '' : 'none';
  }
}

/**
 * An incised contour for a figure painted over black glaze (a horse, a wall):
 * a clay silhouette slightly fatter than the figure, kept in the same pose.
 * Insert `halo.g` just before the figure.
 */
export class Halo {
  readonly fig: Figure;
  constructor(style: FigureStyle, p: Pose, width = 2.6) {
    this.fig = new Figure({ ...style, className: 'halo' }, p);
    this.fig.g.setAttribute('pointer-events', 'none');
    this.fig.g.querySelectorAll('path').forEach((el) => {
      const fill = el.getAttribute('fill');
      if (!fill || fill === 'none') {
        el.setAttribute('stroke', 'none');
        return;
      }
      el.setAttribute('fill', CLAY);
      el.setAttribute('stroke', CLAY);
      el.setAttribute('stroke-width', String(width));
      el.setAttribute('stroke-linejoin', 'round');
      el.removeAttribute('paint-order');
    });
  }
  get g(): SVGGElement {
    return this.fig.g;
  }
  follow(p: Pose): void {
    this.fig.set({ ...p });
  }
}

/** A tapering smoke ribbon rising from (x, y); regenerate `d` with a phase to make it drift. */
export function smokePath(x: number, y: number, h: number, w: number, phase: number, lean = 0): string {
  const pts: Vec[] = [];
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    pts.push([x + Math.sin(phase + t * 5.2) * (3 + t * 9) + lean * t * h, y - t * h]);
  }
  return ribbon(pts, [[0, w * 0.35], [0.3, w], [0.75, w * 0.8], [1, w * 0.2]], 40);
}

export { down };
