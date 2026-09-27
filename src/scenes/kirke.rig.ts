/**
 * Rig helpers shared by the Kirke, Hades and Kalypso tondos.
 *
 * An Actor wraps a Figure with a travelling wrapper group, props held in its
 * hands (they follow the forearm on every pose change), things attached to the
 * head (a pig's head, a wreath…), and pose tweens that start from wherever the
 * figure stands when the tween begins — so poses can be chained in timelines.
 */
import { s } from '../lib/dom';
import { gsap } from '../lib/motion';
import { Figure, type Pose, type FigureStyle, WHITE } from '../art/figure';
import type { Vec } from '../lib/geometry';

/** The painted parts of a Figure, in the order the rig creates them. */
export const PARTS = [
  'armB', 'handB', 'legB', 'footB', 'cloak', 'torso', 'neck', 'legF', 'footF', 'garment', 'garmentLines',
  'wings', 'knee', 'hairBack', 'head', 'beard', 'hat', 'hatDetail', 'faceLines', 'eye', 'pupil', 'armF', 'handF',
] as const;
export type PartName = (typeof PARTS)[number];

/** Head parts that are replaced when a man's head becomes a beast's. */
export const HEAD_PARTS: PartName[] = ['hairBack', 'head', 'beard', 'hat', 'hatDetail', 'faceLines', 'eye', 'pupil'];

const d2r = Math.PI / 180;
const flat = (p: Pose): number[] => [
  p.x, p.y, p.lean, p.head, p.armF[0], p.armF[1], p.armB[0], p.armB[1],
  p.legF[0], p.legF[1], p.legB[0], p.legB[1], p.footF, p.footB, p.grip,
];
const unflat = (v: number[]): Pose => ({
  x: v[0], y: v[1], lean: v[2], head: v[3], armF: [v[4], v[5]], armB: [v[6], v[7]],
  legF: [v[8], v[9]], legB: [v[10], v[11]], footF: v[12], footB: v[13], grip: v[14],
});

export interface HoldOptions {
  /** 'grip': turn with the hand; 'upright': keep `angle` whatever the arm does. */
  mode?: 'grip' | 'upright';
  /** Degrees (figure's own facing frame; 0 = the prop as drawn). */
  angle?: number;
  /** Distance from the wrist along the hand to the grip point. */
  along?: number;
  /** Put the prop behind the figure even when held in the front hand. */
  behind?: boolean;
}

interface Held extends Required<Omit<HoldOptions, 'behind'>> {
  el: SVGGraphicsElement;
  hand: 'F' | 'B';
}

export class Actor {
  /** Wrapper: translate it to carry the actor (and its props) around. */
  readonly g: SVGGElement;
  readonly back: SVGGElement;
  readonly front: SVGGElement;
  readonly fig: Figure;
  readonly facing: 1 | -1;
  private held: Held[] = [];
  private onHeadEls: Array<{ el: SVGGElement; dx: number; dy: number }> = [];
  private hooks: Array<() => void> = [];
  private parts = new Map<PartName, SVGPathElement>();
  private body: SVGGElement;

  constructor(style: FigureStyle, p: Pose, className = '') {
    this.fig = new Figure(style, p);
    this.facing = style.facing ?? 1;
    this.g = s('g', { class: `actor ${className}` });
    this.back = s('g', { class: 'actor__back' });
    this.front = s('g', { class: 'actor__front' });
    this.g.append(this.back, this.fig.g, this.front);
    this.body = this.fig.g.firstElementChild as SVGGElement;
    [...this.body.children].forEach((el, i) => this.parts.set(PARTS[i], el as SVGPathElement));
  }

  get pose(): Pose {
    return this.fig.pose;
  }

  part(name: PartName): SVGPathElement {
    return this.parts.get(name)!;
  }

  parts_(names: PartName[]): SVGPathElement[] {
    return names.map((n) => this.part(n));
  }

  /** Recolour painted parts (e.g. for red-figure or ghostly shades). */
  paint(fills: Partial<Record<PartName, string>>, strokes: Partial<Record<PartName, string>> = {}): this {
    for (const [k, v] of Object.entries(fills)) this.part(k as PartName).setAttribute('fill', v as string);
    for (const [k, v] of Object.entries(strokes)) this.part(k as PartName).setAttribute('stroke', v as string);
    return this;
  }

  /** Give the actor a prop to hold. The prop is drawn facing +x, grip point at its origin. */
  hold(el: SVGGraphicsElement, hand: 'F' | 'B', o: HoldOptions = {}): Held {
    const h: Held = { el, hand, mode: o.mode ?? 'grip', angle: o.angle ?? 0, along: o.along ?? 2.2 };
    this.held.push(h);
    (hand === 'B' || o.behind ? this.back : this.front).appendChild(el);
    this.update();
    return h;
  }

  release(el: SVGGraphicsElement): void {
    this.held = this.held.filter((h) => h.el !== el);
  }

  /** Attach a group to the head: it is placed at the head centre, turned with the head. */
  onHead(el: SVGGElement, dx = 0, dy = 0): void {
    this.body.insertBefore(el, this.part('armF'));
    this.onHeadEls.push({ el, dx, dy });
    this.update();
  }

  onUpdate(fn: () => void): void {
    this.hooks.push(fn);
  }

  /** Grip point and angle of a hand in the actor's space. */
  handFrame(which: 'F' | 'B', along = 2.2): { x: number; y: number; a: number } {
    const j = this.fig.joints();
    const arm = which === 'F' ? j.armF : j.armB;
    const a = arm.a;
    const dir: Vec = [Math.sin(a * d2r), Math.cos(a * d2r)];
    const local: Vec = [arm.W[0] + dir[0] * along, arm.W[1] + dir[1] * along];
    const [x, y] = this.fig.toWorld(local);
    return { x, y, a: 90 - a };
  }

  /** Head centre in the actor's space. */
  headPoint(): Vec {
    return this.fig.toWorld(this.fig.joints().HC);
  }

  update(): void {
    const sc = this.fig.style.scale ?? 1;
    const f = this.facing;
    for (const h of this.held) {
      const fr = this.handFrame(h.hand, h.along);
      const rot = h.mode === 'grip' ? fr.a + h.angle : h.angle;
      h.el.setAttribute('transform', `translate(${fr.x.toFixed(2)} ${fr.y.toFixed(2)}) scale(${f * sc} ${sc}) rotate(${rot.toFixed(2)})`);
    }
    if (this.onHeadEls.length) {
      const j = this.fig.joints();
      for (const o of this.onHeadEls) {
        o.el.setAttribute('transform', `translate(${(j.HC[0]).toFixed(2)} ${(j.HC[1]).toFixed(2)}) rotate(${j.headAngle.toFixed(2)}) translate(${o.dx} ${o.dy})`);
      }
    }
    this.hooks.forEach((fn) => fn());
  }

  set(p: Partial<Pose>): this {
    this.fig.set(p);
    this.update();
    return this;
  }

  /**
   * Tween to a pose. Unlike Figure.to, the starting pose is read when the tween
   * starts, so several `to` tweens can be chained in one timeline.
   */
  to(target: Partial<Pose>, vars: gsap.TweenVars = {}): gsap.core.Tween {
    let a: number[] | null = null;
    let b: number[] = [];
    const proxy = { t: 0 };
    const userStart = vars.onStart as (() => void) | undefined;
    const userUpdate = vars.onUpdate as (() => void) | undefined;
    const capture = () => {
      a = flat(this.fig.pose);
      b = flat({ ...this.fig.pose, ...target } as Pose);
    };
    return gsap.to(proxy, {
      duration: 0.6,
      ease: 'power2.inOut',
      ...vars,
      t: 1,
      onStart: () => {
        capture();
        userStart?.();
      },
      onUpdate: () => {
        if (!a) capture();
        const t = proxy.t;
        const v = a!.map((x, i) => x + (b[i] - x) * t);
        this.fig.set(unflat(v));
        this.update();
        userUpdate?.();
      },
    });
  }

  /** An endless walking-in-place cycle (register it with st.loop). */
  walk(period = 0.9, stride = 20): gsap.core.Tween {
    const ph = { v: 0 };
    const base = { ...this.fig.pose, armF: [...this.fig.pose.armF] as [number, number], armB: [...this.fig.pose.armB] as [number, number] };
    return gsap.to(ph, {
      v: 1,
      duration: period,
      ease: 'none',
      repeat: -1,
      onUpdate: () => {
        const sw = Math.sin(ph.v * Math.PI * 2);
        const lift = Math.max(0, Math.cos(ph.v * Math.PI * 2));
        this.set({
          legF: [4 + sw * stride, 6 + Math.max(0, -sw) * 22],
          legB: [-4 - sw * stride, 6 + Math.max(0, sw) * 22],
          y: base.y - lift * 1.2,
          armF: [base.armF[0] - sw * stride * 0.45, base.armF[1]],
          armB: [base.armB[0] + sw * stride * 0.45, base.armB[1]],
        });
      },
    });
  }
}

/** A four-pointed star of added white, centred on 0,0. */
export function sparkPath(r: number): string {
  const q = r * 0.22;
  return `M0 ${-r}Q${q} ${-q} ${r} 0Q${q} ${q} 0 ${r}Q${-q} ${q} ${-r} 0Q${-q} ${-q} 0 ${-r}Z`;
}

/**
 * A burst of glittering sparks over an elliptical area; the sparks remove
 * themselves when done. Returns the timeline (add it to a scene timeline).
 */
export function shimmer(
  parent: SVGGElement,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  opts: { n?: number; duration?: number; color?: string; size?: number; rise?: number; seed?: number } = {},
): gsap.core.Timeline {
  const n = opts.n ?? 14;
  const dur = opts.duration ?? 1.2;
  const size = opts.size ?? 3.4;
  let seed = opts.seed ?? 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed % 10000) / 10000;
  };
  const tl = gsap.timeline();
  const g = s('g', { class: 'shimmer', 'pointer-events': 'none' });
  parent.appendChild(g);
  for (let i = 0; i < n; i++) {
    const a = rnd() * Math.PI * 2;
    const rr = Math.sqrt(rnd());
    const x = cx + Math.cos(a) * rx * rr;
    const y = cy + Math.sin(a) * ry * rr;
    const k = size * (0.5 + rnd() * 0.8);
    const holder = s('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})` });
    const sp = s('path', { d: sparkPath(k), fill: opts.color ?? WHITE, opacity: 0 });
    holder.appendChild(sp);
    g.appendChild(holder);
    const t0 = rnd() * dur * 0.55;
    const life = dur * (0.35 + rnd() * 0.3);
    const p = { s: 0 };
    const rise = opts.rise ?? 6;
    tl.to(
      p,
      {
        s: 1,
        duration: life,
        ease: 'none',
        onUpdate: () => {
          const v = Math.sin(p.s * Math.PI);
          sp.setAttribute('opacity', v.toFixed(3));
          sp.setAttribute('transform', `translate(0 ${(-rise * p.s).toFixed(2)}) rotate(${(p.s * 90).toFixed(1)}) scale(${(0.2 + v).toFixed(3)})`);
        },
      },
      t0,
    );
  }
  tl.call(() => g.remove());
  return tl;
}

/** A radiant burst: rays of added white shooting out from a point, with a spark at the core. */
export function burst(parent: SVGGElement, x: number, y: number, r: number, color = WHITE, rays = 12): gsap.core.Timeline {
  const g = s('g', { class: 'burst', transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})`, 'pointer-events': 'none' });
  const lines: SVGPathElement[] = [];
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2 + 0.2;
    const long = i % 2 ? 0.6 : 1;
    const l = s('path', {
      d: `M${(Math.cos(a) * r * 0.25).toFixed(1)} ${(Math.sin(a) * r * 0.25).toFixed(1)}L${(Math.cos(a) * r * long).toFixed(1)} ${(Math.sin(a) * r * long).toFixed(1)}`,
      stroke: color,
      'stroke-width': 1.4,
      'stroke-linecap': 'round',
      fill: 'none',
    });
    lines.push(l);
    g.appendChild(l);
  }
  const core = s('path', { d: sparkPath(r * 0.42), fill: color });
  g.appendChild(core);
  parent.appendChild(g);
  const tl = gsap.timeline();
  tl.fromTo(lines, { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 0.22, ease: 'power2.out' }, 0)
    .to(lines, { drawSVG: '100% 100%', duration: 0.4, ease: 'power1.in' }, 0.22)
    .fromTo(core, { scale: 0.2, rotation: 0, transformOrigin: '50% 50%' }, { scale: 1.2, rotation: 45, duration: 0.25, ease: 'back.out(3)' }, 0)
    .to(core, { scale: 0, rotation: 90, duration: 0.4, ease: 'power2.in' }, 0.3)
    .call(() => g.remove());
  return tl;
}

/** A soft pulse of light (a circle in added white) that swells and fades. */
export function flare(parent: SVGGElement, x: number, y: number, r: number, color = WHITE, peak = 0.55): gsap.core.Timeline {
  const c = s('circle', { cx: x, cy: y, r: r * 0.2, fill: color, opacity: 0, 'pointer-events': 'none' });
  parent.appendChild(c);
  const tl = gsap.timeline();
  tl.to(c, { attr: { r }, opacity: peak, duration: 0.25, ease: 'power2.out' })
    .to(c, { opacity: 0, duration: 0.6, ease: 'power1.in' })
    .call(() => c.remove());
  return tl;
}
