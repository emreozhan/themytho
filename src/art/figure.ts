/**
 * A tiny rig for black-figure people.
 *
 * Archaic painters built bodies from a small set of conventions: a head in
 * profile with a large frontal almond eye, a frontal V-shaped chest with broad
 * shoulders and a wasp waist, powerful thighs and calves in profile. Men are
 * glaze-black; women carry "added white" skin. Details are incised — scratched
 * through the glaze to the clay beneath — which we mimic with thin strokes in
 * the ground colour.
 *
 * A Figure is posed with a handful of joint angles and can be tweened with
 * GSAP (see `Figure.to`), so scenes can make people row, run, throw, draw a bow…
 *
 * Frame: the figure faces +x, y grows downwards, ~100 units from sole to crown.
 * Angles are in degrees: limbs use 0° = hanging straight down, 90° = pointing
 * forward, 180° = straight up. The torso leans forward with positive values.
 */
import { s, attr } from '../lib/dom';
import { add, mul, limb, ribbon, smoothPath, type Vec } from '../lib/geometry';
import { gsap } from '../lib/motion';

export const INK = '#16100b';
export const CLAY = '#c4662f';
export const WHITE = '#efe2c6';
export const PURPLE = '#7e2e26';

export type HeadKind = 'bearded' | 'youth' | 'woman' | 'old' | 'cyclops' | 'giant';
export type Hat = 'none' | 'pilos' | 'helmet' | 'petasos' | 'diadem' | 'wreath' | 'veil';
export type Garment = 'none' | 'short' | 'long' | 'peplos' | 'rags';

export interface FigureStyle {
  head?: HeadKind;
  hat?: Hat;
  garment?: Garment;
  garmentColor?: string;
  /** Skin colour; defaults to glaze for men and added white for women. */
  skin?: string;
  /** Colour of incisions (the ground the figure is painted on). */
  ground?: string;
  /** Cloak over the back shoulder. */
  cloak?: boolean;
  cloakColor?: string;
  scale?: number;
  facing?: 1 | -1;
  /** Hair colour (women's hair is still glaze). */
  hair?: string;
  /** Winged boots of Hermes. */
  wingedFeet?: boolean;
  className?: string;
}

export interface Pose {
  x: number;
  y: number;
  lean: number;
  head: number;
  /** [shoulder, elbow] */
  armF: [number, number];
  armB: [number, number];
  /** [hip, knee] */
  legF: [number, number];
  legB: [number, number];
  footF: number;
  footB: number;
  /** Open (0) or clenched (1) hands. */
  grip: number;
}

const SEG = { torso: 30, neck: 5, upper: 16, fore: 14.5, hand: 5.5, thigh: 24.5, shin: 23, foot: 10 };
/** Pelvis height above the soles for straight legs. */
export const STAND_HEIGHT = SEG.thigh + SEG.shin + 2.2;

const d2r = Math.PI / 180;
const down = (a: number): Vec => [Math.sin(a * d2r), Math.cos(a * d2r)];
const up = (a: number): Vec => [Math.sin(a * d2r), -Math.cos(a * d2r)];

export function pose(p: Partial<Pose> & { x?: number; y?: number }): Pose {
  return {
    x: 0,
    y: -STAND_HEIGHT,
    lean: 0,
    head: 0,
    armF: [8, 12],
    armB: [-8, 10],
    legF: [6, 4],
    legB: [-6, 4],
    footF: 0,
    footB: 0,
    grip: 1,
    ...p,
  };
}

/** Handy stock poses (pelvis at x, standing on groundY). */
export const POSES = {
  stand: (x = 0, g = 0) => pose({ x, y: g - STAND_HEIGHT + 0.4 }),
  walk: (x = 0, g = 0) =>
    pose({ x, y: g - STAND_HEIGHT + 1.6, lean: 4, armF: [24, 18], armB: [-22, 10], legF: [22, 8], legB: [-18, 10] }),
  run: (x = 0, g = 0) =>
    pose({ x, y: g - STAND_HEIGHT + 6, lean: 14, armF: [70, 50], armB: [-60, 40], legF: [58, 80], legB: [-30, 40], footB: 20 }),
  /** The archaic "Knielauf": flying run on bent knees. */
  knielauf: (x = 0, g = 0) =>
    pose({ x, y: g - 34, lean: 10, armF: [60, 70], armB: [-70, 30], legF: [72, 88], legB: [-10, 96], footB: 50 }),
  lunge: (x = 0, g = 0) =>
    pose({ x, y: g - STAND_HEIGHT + 7, lean: 12, armF: [80, 10], armB: [-40, 60], legF: [44, 40], legB: [-28, 6] }),
  sit: (x = 0, g = 0) =>
    pose({ x, y: g - 26, lean: -2, armF: [30, 50], armB: [-4, 50], legF: [88, 90], legB: [82, 86] }),
  row: (x = 0, g = 0) =>
    pose({ x, y: g - 24, lean: -18, armF: [70, 10], armB: [64, 12], legF: [84, 70], legB: [80, 66] }),
  lament: (x = 0, g = 0) =>
    pose({ x, y: g - STAND_HEIGHT + 0.6, lean: -2, head: 16, armF: [150, 150], armB: [140, 160], legF: [4, 2], legB: [-5, 2] }),
  plead: (x = 0, g = 0) =>
    pose({ x, y: g - 30, lean: 16, head: -10, armF: [110, 20], armB: [100, 30], legF: [80, 110], legB: [-6, 120], footB: 70 }),
  fallen: (x = 0, g = 0) =>
    pose({ x, y: g - 8, lean: -82, head: -10, armF: [-120, 20], armB: [-150, -10], legF: [96, 10], legB: [86, 20] }),
};

export class Figure {
  readonly g: SVGGElement;
  readonly style: Required<Pick<FigureStyle, 'head' | 'hat' | 'garment'>> & FigureStyle;
  pose: Pose;
  /** The Cyclops after the stake: the eye is put out. */
  blind = false;
  private parts: Record<string, SVGPathElement> = {};
  private body: SVGGElement;

  constructor(style: FigureStyle = {}, p: Pose = POSES.stand()) {
    this.style = { head: 'bearded', hat: 'none', garment: 'short', ...style };
    this.pose = { ...p };
    // Women are painted with open, gesturing hands unless a scene says otherwise.
    if (this.style.head === 'woman' && p.grip === 1) this.pose.grip = 0;
    this.g = s('g', { class: `figure ${style.className ?? ''}` });
    this.body = s('g');
    this.g.appendChild(this.body);
    const female = this.style.head === 'woman';
    const skin = this.style.skin ?? (female ? WHITE : INK);
    const inc = this.style.ground ?? CLAY;
    const garment = this.style.garmentColor ?? (female ? INK : PURPLE);
    const hair = this.style.hair ?? INK;
    const cloakCol = this.style.cloakColor ?? INK;
    const mk = (name: string, a: Record<string, string | number>) => {
      const p = s('path', a);
      this.parts[name] = p;
      return p;
    };
    // Incisions: limbs and garments are outlined in the ground colour but painted
    // stroke-first, so the outline only shows where it crosses other glaze
    // (exactly where a painter would scratch a separating line).
    const outline = (w: number) => ({ stroke: inc, 'stroke-width': w, 'paint-order': 'stroke', 'stroke-linejoin': 'round' });
    const femaleLine = (w: number) => ({ stroke: INK, 'stroke-width': w, 'paint-order': 'stroke', 'stroke-linejoin': 'round' });
    const skinLine = female ? femaleLine : outline;
    this.body.append(
      mk('armB', { fill: skin, ...skinLine(0.8) }),
      mk('handB', { fill: skin, ...skinLine(0.6) }),
      mk('legB', { fill: skin, ...skinLine(0.8) }),
      mk('footB', { fill: skin, ...skinLine(0.6) }),
      mk('cloak', { fill: cloakCol, ...outline(1.2) }),
      mk('torso', { fill: skin }),
      mk('neck', { fill: skin }),
      mk('legF', { fill: skin, ...skinLine(1.4) }),
      mk('footF', { fill: skin, ...skinLine(1.1) }),
      mk('garment', { fill: garment, ...outline(1.3) }),
      mk('garmentLines', { fill: 'none', stroke: inc, 'stroke-width': 0.55, 'stroke-linecap': 'round' }),
      mk('wings', { fill: WHITE, stroke: INK, 'stroke-width': 0.5 }),
      mk('knee', { fill: 'none', stroke: female ? INK : inc, 'stroke-width': 0.55, 'stroke-linecap': 'round' }),
      mk('hairBack', { fill: hair, ...outline(1) }),
      mk('head', { fill: skin, ...(female ? femaleLine(0.7) : {}) }),
      mk('beard', { fill: hair }),
      mk('hat', { fill: this.style.hat === 'diadem' ? PURPLE : INK, ...outline(1.1) }),
      mk('hatDetail', { fill: 'none', stroke: this.style.hat === 'diadem' ? WHITE : inc, 'stroke-width': 0.6 }),
      mk('faceLines', { fill: 'none', stroke: female ? INK : inc, 'stroke-width': 0.6, 'stroke-linecap': 'round' }),
      mk('eye', { fill: female ? INK : this.style.head === 'cyclops' ? WHITE : inc }),
      mk('pupil', { fill: INK }),
      mk('armF', { fill: skin, ...skinLine(1.4) }),
      mk('handF', { fill: skin, ...skinLine(1.1) }),
    );
    this.render();
  }

  /** World-space joint positions for the current pose (before facing/scale). */
  joints(p: Pose = this.pose) {
    const P: Vec = [p.x, p.y];
    const u = up(p.lean);
    const fwd: Vec = [-u[1], u[0]];
    const N = add(P, mul(u, SEG.torso));
    const shoulderT = add(P, mul(u, SEG.torso * 0.9));
    const SF = add(shoulderT, mul(fwd, 6.8));
    const SB = add(shoulderT, mul(fwd, -6.8));
    const arm = (S: Vec, [a1, a2]: [number, number]) => {
      const E = add(S, mul(down(a1), SEG.upper));
      const W = add(E, mul(down(a1 + a2), SEG.fore));
      const T = add(W, mul(down(a1 + a2 + 6), SEG.hand));
      return { S, E, W, T, a: a1 + a2 };
    };
    const leg = (H: Vec, [h1, k]: [number, number], f: number) => {
      const K = add(H, mul(down(h1), SEG.thigh));
      const A = add(K, mul(down(h1 - k), SEG.shin));
      const fa = h1 - k + 90 + f;
      return { H, K, A, fa, sa: h1 - k };
    };
    const hu = up(p.lean + p.head * 0.35);
    const HC = add(N, mul(hu, SEG.neck + 5.2));
    return {
      P, u, fwd, N, HC,
      headAngle: p.lean + p.head,
      armF: arm(SF, p.armF),
      armB: arm(SB, p.armB),
      legF: leg(add(P, mul(fwd, 1.6)), p.legF, p.footF),
      legB: leg(add(P, mul(fwd, -1.6)), p.legB, p.footB),
    };
  }

  /** Position of a hand (world space, including facing/scale transform). */
  hand(which: 'F' | 'B' = 'F'): Vec {
    const j = this.joints();
    const w = which === 'F' ? j.armF.W : j.armB.W;
    return this.toWorld(w);
  }

  toWorld(v: Vec): Vec {
    const sc = this.style.scale ?? 1;
    const f = this.style.facing ?? 1;
    const ox = this.pose.x;
    return [ox + (v[0] - ox) * sc * f, v[1] * sc + (1 - sc) * 0];
  }

  set(p: Partial<Pose>): this {
    Object.assign(this.pose, p);
    this.render();
    return this;
  }

  /** Tween to another pose. Returns the GSAP tween. */
  to(target: Partial<Pose>, vars: gsap.TweenVars = {}): gsap.core.Tween {
    const from = { ...this.pose, armF: [...this.pose.armF], armB: [...this.pose.armB], legF: [...this.pose.legF], legB: [...this.pose.legB] };
    const flat = (p: Pose) => [
      p.x, p.y, p.lean, p.head, p.armF[0], p.armF[1], p.armB[0], p.armB[1],
      p.legF[0], p.legF[1], p.legB[0], p.legB[1], p.footF, p.footB, p.grip,
    ];
    const merged: Pose = { ...(from as Pose), ...target } as Pose;
    const a = flat(from as Pose);
    const b = flat(merged);
    const proxy = { t: 0 };
    return gsap.to(proxy, {
      t: 1,
      duration: 0.6,
      ease: 'power2.inOut',
      ...vars,
      onUpdate: () => {
        const v = a.map((x, i) => x + (b[i] - x) * proxy.t);
        this.pose = {
          x: v[0], y: v[1], lean: v[2], head: v[3], armF: [v[4], v[5]], armB: [v[6], v[7]],
          legF: [v[8], v[9]], legB: [v[10], v[11]], footF: v[12], footB: v[13], grip: v[14],
        };
        this.render();
        (vars.onUpdate as (() => void) | undefined)?.();
      },
    });
  }

  render(): void {
    const p = this.pose;
    const j = this.joints(p);
    const st = this.style;
    const female = st.head === 'woman';
    const giant = st.head === 'cyclops' || st.head === 'giant';
    const bulk = giant ? 1.18 : female ? 0.86 : 1;
    const P = this.parts;

    // Arms.
    const armD = (a: ReturnType<typeof this.joints>['armF']) =>
      limb(a.S, a.E, [[0, 3.8 * bulk, 3.6 * bulk], [0.5, 3.1 * bulk, 2.9 * bulk], [1, 2.3 * bulk, 2.3 * bulk]]) +
      limb(a.E, a.W, [[0, 2.3 * bulk, 2.3 * bulk], [0.35, 2.6 * bulk, 2.4 * bulk], [1, 1.5 * bulk, 1.5 * bulk]]);
    const handD = (a: ReturnType<typeof this.joints>['armF']) =>
      p.grip > 0.5
        ? limb(add(a.W, mul(down(a.a), -0.6)), add(a.W, mul(down(a.a), 4.4)), [[0, 1.7 * bulk, 1.6 * bulk], [0.55, 2.3 * bulk, 2.1 * bulk], [1, 1.5 * bulk, 1.3 * bulk]])
        : limb(a.W, a.T, [[0, 1.6 * bulk, 1.4 * bulk], [0.6, 1.7 * bulk, 1.3 * bulk], [1, 0.8, 0.8]]);
    attr(P.armF, { d: armD(j.armF) });
    attr(P.armB, { d: armD(j.armB) });
    attr(P.handF, { d: handD(j.armF) });
    attr(P.handB, { d: handD(j.armB) });

    // Legs & feet.
    const legD = (l: ReturnType<typeof this.joints>['legF']) =>
      limb(l.H, l.K, [[0, 5.3 * bulk, 5.4 * bulk], [0.4, 5 * bulk, 4.5 * bulk], [1, 2.8 * bulk, 2.7 * bulk]]) +
      limb(l.K, l.A, [[0, 2.7 * bulk, 2.6 * bulk], [0.28, 2.4 * bulk, 4.1 * bulk], [0.62, 1.9 * bulk, 2.3 * bulk], [1, 1.5 * bulk, 1.4 * bulk]]);
    const footD = (l: ReturnType<typeof this.joints>['legF']) => {
      const dir = down(l.fa);
      const heel = add(add(l.A, mul(dir, -2.6)), mul(down(l.sa), 1.2));
      const toe = add(l.A, mul(dir, SEG.foot));
      return limb(heel, toe, [[0, 2.2, 1.5], [0.3, 2.3, 1.3], [0.75, 1.1, 1], [1, 0.5, 0.6]]);
    };
    attr(P.legF, { d: legD(j.legF) });
    attr(P.legB, { d: legD(j.legB) });
    attr(P.footF, { d: footD(j.legF) });
    attr(P.footB, { d: footD(j.legB) });
    const kn = j.legF.K;
    const kd = down(j.legF.sa + 90);
    attr(P.knee, {
      d: female || st.garment === 'long' || st.garment === 'peplos'
        ? ''
        : `M${f1(kn[0] + kd[0] * 1.6)} ${f1(kn[1] - 2.2)}q${f1(kd[0] * 1.2 + 0.8)} 2.2 0 4.2`,
    });

    // Torso and neck.
    const T = j.P;
    const shoulderW = female ? 7.2 : 9.2 * bulk;
    attr(P.torso, {
      d: limb(T, j.N, [
        [0, 6.4 * bulk, 6.4 * bulk],
        [0.3, 4.3 * bulk, 4.3 * bulk],
        [0.72, (female ? 6 : 8.2) * bulk, (female ? 6 : 8.2) * bulk],
        [0.92, shoulderW, shoulderW],
        [1, 3.6, 3.6],
      ]),
    });
    attr(P.neck, { d: limb(j.N, add(j.HC, mul(j.u, -2)), [[0, 3.3 * bulk, 3.3 * bulk], [1, 2.8 * bulk, 2.8 * bulk]], false, false) });

    // Garment.
    this.renderGarment(j, female);
    if (st.garment === 'none' && !female) {
      const { u, fwd } = j;
      const at = (t: number, side: number): Vec => add(add(j.P, mul(u, SEG.torso * t)), mul(fwd, side));
      const pl = at(0.74, -6), pm = at(0.62, 0), pr = at(0.74, 6);
      const a1 = at(0.5, 0), a2 = at(0.2, 0);
      const hipL = at(0.12, -5.6), hipR = at(0.12, 5.6), hipM = at(0.02, 0);
      attr(P.garmentLines, {
        d:
          `M${f1(pl[0])} ${f1(pl[1])}Q${f1(pm[0])} ${f1(pm[1] + 2)} ${f1(pr[0])} ${f1(pr[1])}` +
          `M${f1(a1[0])} ${f1(a1[1])}L${f1(a2[0])} ${f1(a2[1])}` +
          `M${f1(hipL[0])} ${f1(hipL[1])}Q${f1(hipM[0])} ${f1(hipM[1] + 1.5)} ${f1(hipR[0])} ${f1(hipR[1])}`,
      });
    }

    // Head.
    this.renderHead(j, giant);

    // Winged boots.
    if (st.wingedFeet) {
      const w = (l: ReturnType<typeof this.joints>['legF']) => {
        const b = add(l.A, mul(down(l.sa), -1));
        return `M${f1(b[0])} ${f1(b[1])}l-7 -5l1.6 3.4l-4 -1.6l2.6 3.4l-3.6 0.2z`;
      };
      attr(P.wings, { d: w(j.legF) + w(j.legB) });
    }

    // Facing and scale.
    const sc = st.scale ?? 1;
    const f = st.facing ?? 1;
    const ox = p.x;
    attr(this.g, {
      transform: sc === 1 && f === 1 ? null : `translate(${f1(ox)} 0) scale(${f1(sc * f)} ${f1(sc)}) translate(${f1(-ox)} 0)`,
    });
  }

  private renderGarment(j: ReturnType<Figure['joints']>, female: boolean): void {
    const st = this.style;
    const P = this.parts;
    const g = st.garment;
    if (g === 'none') {
      attr(P.garment, { d: '' });
      attr(P.garmentLines, { d: '' });
    } else {
      const { u, fwd } = j;
      const at = (t: number, side: number, extra = 0): Vec => add(add(j.P, mul(u, SEG.torso * t)), mul(fwd, side * extra));
      const long = g === 'long' || g === 'peplos';
      const rag = g === 'rags';
      const hemF = long
        ? add(j.legF.A, mul(fwd, 3.2))
        : add(add(j.legF.H, mul(down(this.pose.legF[0]), SEG.thigh * (rag ? 0.62 : 0.5))), mul(fwd, 4.6));
      const hemB = long
        ? add(j.legB.A, mul(fwd, -3.4))
        : add(add(j.legB.H, mul(down(this.pose.legB[0]), SEG.thigh * (rag ? 0.62 : 0.5))), mul(fwd, -4.8));
      const lowY = Math.max(hemF[1], hemB[1]);
      const mid: Vec = [(hemF[0] + hemB[0]) / 2, lowY + (long ? 0.8 : 2.2)];
      const seated = long && this.pose.legF[0] > 50;
      const lap: Vec[] = seated
        ? [add(j.legF.K, mul(down(this.pose.legF[0] - 90), 3.2)), add(j.legF.K, mul(fwd, 3.4))]
        : [];
      const pts: Vec[] = [
        at(0.93, -1, 7.6), at(0.99, -1, 2.6), at(0.99, 1, 2.6), at(0.93, 1, 7.6),
        at(0.72, 1, 7.4), at(0.36, 1, female ? 5.6 : 5.2), at(0.06, 1, 7.6),
        ...lap,
        add(hemF, mul(u, long ? 1.2 : 3.2)), hemF, mid, hemB, add(hemB, mul(u, long ? 1.2 : 3.2)),
        ...(seated ? [add(j.legB.K, mul(fwd, -1)), add(j.P, mul(u, -4))] : []),
        at(0.06, -1, 7.8), at(0.36, -1, 5.4), at(0.72, -1, 7.4),
      ];
      let d = smoothPath(pts, true, 0.3);
      if (rag) {
        // A ragged hem: saw-tooth between the two hem points.
        const teeth: Vec[] = [];
        for (let i = 0; i <= 8; i++) {
          const t = i / 8;
          const x = hemB[0] + (hemF[0] - hemB[0]) * t;
          const y = hemB[1] + (hemF[1] - hemB[1]) * t + (i % 2 ? 3.2 : 0) + Math.sin(t * Math.PI) * 2;
          teeth.push([x, y]);
        }
        d += smoothPath([...teeth, add(hemF, mul(u, 4)), add(hemB, mul(u, 4))], true, 0.1);
      }
      attr(P.garment, { d });
      // Incised folds, belt and hem.
      const belt = `M${f1(at(0.34, -1, 5.2)[0])} ${f1(at(0.34, -1, 5.2)[1])}L${f1(at(0.34, 1, 5.2)[0])} ${f1(at(0.34, 1, 5.2)[1])}`;
      let lines = belt;
      const folds = long ? 5 : 3;
      for (let i = 1; i <= folds; i++) {
        const t = i / (folds + 1);
        const top = add(at(0.3, -1, 4.8), mul(fwd, 9.6 * t));
        const bot: Vec = [hemB[0] + (hemF[0] - hemB[0]) * t, mid[1] - 1.8];
        lines += `M${f1(top[0])} ${f1(top[1] + 2)}L${f1(bot[0])} ${f1(bot[1] - (long ? 2 : 1))}`;
      }
      const hemInset = (p: Vec): Vec => add(p, mul(u, 1.6));
      const a = hemInset(hemB), b = hemInset(mid), c = hemInset(hemF);
      lines += `M${f1(a[0])} ${f1(a[1])}Q${f1(b[0])} ${f1(b[1] + 1)} ${f1(c[0])} ${f1(c[1])}`;
      if (g === 'peplos') {
        // Overfold at the waist and a decorated central band.
        const o1 = at(0.22, -1, 7), o2 = at(0.22, 1, 7.2);
        lines += `M${f1(o1[0])} ${f1(o1[1])}Q${f1((o1[0] + o2[0]) / 2)} ${f1(o1[1] + 3)} ${f1(o2[0])} ${f1(o2[1])}`;
        const bandTop = at(0.2, 1, 1);
        const bandBot: Vec = [(hemF[0] + hemB[0]) / 2 + 2, mid[1] - 1.4];
        for (let k = 0; k < 7; k++) {
          const t = k / 7;
          const x = bandTop[0] + (bandBot[0] - bandTop[0]) * t;
          const y = bandTop[1] + (bandBot[1] - bandTop[1]) * t;
          lines += `M${f1(x - 1.4)} ${f1(y)}h2.8v2.2h-2.8z`;
        }
      }
      attr(P.garmentLines, { d: lines });
    }

    if (st.cloak) {
      const top = add(j.armB.S, mul(j.u, 2));
      const top2 = add(j.N, mul(j.fwd, 2));
      const knee = add(j.legB.K, mul(j.fwd, -9));
      const hem = add(j.legB.K, mul(j.fwd, 2));
      attr(P.cloak, { d: smoothPath([top2, top, add(j.armB.E, mul(j.fwd, -6)), knee, hem, add(j.P, mul(j.fwd, -2))], true, 0.35) });
    } else attr(P.cloak, { d: '' });
  }

  private renderHead(j: ReturnType<Figure['joints']>, giant: boolean): void {
    const st = this.style;
    const P = this.parts;
    const [cx, cy] = j.HC;
    const a = j.headAngle * d2r;
    const k = giant ? 1.25 : 1;
    const tx = (x: number, y: number): string => {
      const X = x * k, Y = y * k;
      return `${f1(cx + X * Math.cos(a) - Y * Math.sin(a))} ${f1(cy + X * Math.sin(a) + Y * Math.cos(a))}`;
    };
    const path = (cmds: Array<[string, ...number[]]>): string =>
      cmds
        .map(([c, ...n]) => {
          let out = c;
          for (let i = 0; i < n.length; i += 2) out += (i ? ' ' : '') + tx(n[i], n[i + 1]);
          return out;
        })
        .join('') ;

    const kind = st.head;
    const female = kind === 'woman';
    const youth = kind === 'youth' || female;
    // Profile: nape → crown → brow → the long Greek nose → lips → chin.
    const face: Array<[string, ...number[]]> = [
      ['M', -6.4, 4.2],
      ['C', -8.6, 0, -7.8, -6.4, -3.4, -8.3],
      ['C', 0.6, -10, 5.6, -8.4, 6.8, -4.2],
      ['L', 7.1, -2.6],
      ['L', 9.4, 1.4],
      ['L', 7.4, 2.1],
      ['L', 7.7, 3.3],
      ['L', 6.9, 3.8],
      ['L', 7.4, 4.6],
    ];
    if (youth) face.push(['C', 7.4, 6.2, 6.2, 7.4, 4.2, 7.3], ['C', 1.2, 7.2, -0.8, 6.6, -2.6, 6.2], ['C', -4.2, 5.8, -5.6, 5.4, -6.4, 4.2]);
    else face.push(['C', 7.5, 5.6, 7, 6.6, 6, 7], ['C', 3, 7.8, -0.5, 7, -2.8, 6.4], ['C', -4.4, 6, -5.8, 5.4, -6.4, 4.2]);
    attr(P.head, { d: path(face) + 'Z' });

    // Beard.
    let beard = '';
    if (kind === 'bearded' || kind === 'cyclops' || kind === 'giant') {
      beard = path([['M', 7.3, 4.4], ['C', 8, 7.6, 7.2, 11, 5.4, 14.2], ['L', 3.8, 14.8], ['C', 2.4, 11.6, -0.4, 8.6, -3.2, 7.2], ['C', -1, 6.4, 3, 6.2, 7.3, 4.4]]) + 'Z';
    } else if (kind === 'old') {
      beard = path([['M', 7.3, 4.4], ['C', 8.2, 9, 7.6, 14, 5, 18.6], ['L', 3.4, 19], ['C', 2, 14, -0.8, 9.6, -3.2, 7.2], ['C', -1, 6.4, 3, 6.2, 7.3, 4.4]]) + 'Z';
    }
    attr(P.beard, { d: beard });

    // Hair behind the head: long archaic locks for men, a bun for women.
    let hair = '';
    if (female) {
      hair =
        path([['M', -3, -8.6], ['C', -8.6, -8, -10.6, -1, -8.4, 3.4], ['C', -7.2, 5.4, -5.4, 5, -5, 3], ['L', -5.6, -2], ['C', -5.2, -5.6, -1, -8.6, 4, -8.4], ['C', 1.6, -9.4, -1, -9.2, -3, -8.6]]) +
        'Z' +
        path([['M', -8.2, -5.6], ['C', -12.6, -6.8, -14.2, -2.2, -11.6, 0.4], ['C', -9.6, 2.4, -7, 0.4, -7.6, -2.4]]) + 'Z';
    } else if (kind === 'youth') {
      hair = path([['M', -2.6, -8.6], ['C', -8.6, -8, -9.6, -1.4, -8.4, 4.4], ['L', -5.6, 5], ['C', -6.4, 1, -5.6, -4.2, -0.6, -6.6], ['C', 2, -7.6, 4.4, -7.4, 5.8, -6.8], ['C', 3.6, -9.6, -0.2, -9.4, -2.6, -8.6]]) + 'Z';
    } else {
      hair = path([['M', -2.8, -8.6], ['C', -9.2, -7.8, -9.6, -1, -10.2, 5], ['L', -10.8, 13.4], ['C', -8.6, 14.6, -6.2, 14.2, -4.6, 12.6], ['L', -4.8, 5.6], ['C', -6, 1.4, -5.6, -4.2, -0.6, -6.6], ['C', 2, -7.8, 4.4, -7.4, 5.8, -6.8], ['C', 3.6, -9.6, -0.2, -9.4, -2.8, -8.6]]) + 'Z';
    }
    if (kind === 'old') hair = path([['M', -7.4, -3], ['C', -9.6, 1, -9.8, 6, -9.6, 10], ['L', -5, 9], ['C', -6, 4, -6.2, 1, -5.6, -2.4]]) + 'Z';
    attr(P.hairBack, { d: hair });

    // Eye (one huge frontal eye for the Cyclops), fillet and beard incisions.
    const eyeD =
      kind === 'cyclops'
        ? path([['M', 0.8, -4.6], ['Q', 4, -9, 7.2, -4.4], ['Q', 4, -1.6, 0.8, -4.6]]) + 'Z'
        : female
          ? path([['M', 3, -2.2], ['Q', 4.6, -3.6, 6.1, -2.1], ['Q', 4.6, -1.2, 3, -2.2]]) + 'Z'
          : path([['M', 2.4, -2.4], ['Q', 4.3, -4.2, 6.1, -2.3], ['Q', 4.3, -1.1, 2.4, -2.4]]) + 'Z';
    attr(P.eye, { d: eyeD });
    attr(P.pupil, {
      d: kind === 'cyclops' && !this.blind ? circleAt(tx(4, -4.8), 1.5 * k) : '',
    });
    let lines = '';
    if (!female) {
      // Pupil ring and brow.
      lines += kind === 'cyclops' ? path([['M', 3.2, -7.4], ['Q', 4.4, -8.6, 6.2, -7.2]]) : path([['M', 2, -4.1], ['Q', 4.2, -5.6, 6.6, -3.6]]);
      if (kind !== 'youth' && kind !== 'old') lines += path([['M', 5.6, 7], ['C', 5.2, 9.4, 4.6, 11.4, 3.8, 13.2]]) + path([['M', 3.4, 7.2], ['C', 2.8, 9.2, 2.2, 10.8, 1.2, 12]]);
      if (kind === 'old') lines += path([['M', 5.6, 7], ['C', 5.4, 11, 4.6, 14.6, 3.6, 17.4]]) + path([['M', 3.2, 7.4], ['C', 2.8, 11, 1.8, 13.8, 0.8, 15.6]]);
      // Hair fillet.
      if (st.hat === 'none') lines += path([['M', -7.6, -2.6], ['C', -4, -5.2, 1.4, -7.6, 5.8, -6.6]]);
      // Ear.
      lines += path([['M', -1.6, -1.6], ['C', -3.2, -2.4, -3.8, 1, -1.8, 1.8]]);
    } else {
      lines += path([['M', -7.4, -3.8], ['C', -4.2, -6, 1.2, -7.8, 5.8, -6.8]]);
    }
    attr(P.faceLines, { d: lines });

    // Headgear.
    let hat = '';
    let hatLines = '';
    switch (st.hat) {
      case 'pilos':
        hat = path([['M', -7.8, -3.4], ['C', -8.2, -8.6, -4.4, -14.2, 0.2, -17.6], ['C', 4.6, -14.2, 8.4, -8.8, 7.6, -3.8], ['C', 3, -5.4, -3, -5, -7.8, -3.4]]) + 'Z';
        hatLines = path([['M', -7.4, -5.4], ['C', -3, -7, 3, -7.4, 7.5, -5.8]]);
        break;
      case 'helmet':
        hat =
          path([['M', -7.8, 5.6], ['C', -9.8, -2, -7.4, -9.8, 0.4, -10.2], ['C', 6.6, -10.4, 9.4, -5.8, 9, -1.4], ['L', 7.6, -1.2], ['L', 7.2, 1.2], ['L', 9.2, 3], ['L', 9.2, 7.8], ['C', 6.8, 8.6, 4.4, 8, 3, 6.4], ['L', 3.4, 2.6], ['L', 1.6, -0.4], ['L', 2.4, -4], ['L', 7, -3.8], ['C', 5.4, -6, 2.2, -6.2, 0, -5.2], ['L', -0.6, 6.4], ['C', -3.4, 7.6, -6, 7.4, -7.8, 5.6]]) + 'Z' +
          // Crest: a sweeping horsehair plume on a stilt.
          path([['M', -1, -10], ['L', -0.4, -13.6], ['L', 1.4, -13.6], ['L', 1.4, -10]]) + 'Z' +
          path([['M', 8.6, -13.8], ['C', 4, -18.8, -8, -18.6, -14, -12.4], ['C', -16.6, -9.2, -17.4, -3.8, -16, 1.4], ['C', -13.6, -3.4, -12.4, -7.2, -10, -9.6], ['C', -5, -14, 3, -14.4, 8.6, -13.8]]) + 'Z';
        hatLines = path([['M', -12.6, -9.6], ['C', -6, -15.4, 3, -15.8, 7, -14.4]]) + path([['M', -7, 4], ['C', -8, -2, -6, -7.6, 0.4, -8.4]]);
        break;
      case 'petasos':
        hat = path([['M', -12, -3.8], ['C', -8, -6.8, 8, -7.6, 12.4, -4.6], ['C', 8, -3.2, -8, -2.6, -12, -3.8]]) + 'Z' + path([['M', -6.4, -5], ['C', -6, -10.8, 5.6, -11.4, 6.4, -5.6]]) + 'Z';
        hatLines = path([['M', -5.8, -6.4], ['C', -1, -7.6, 3.4, -7.4, 6, -6.6]]);
        break;
      case 'diadem':
        hat = path([['M', -5.4, -7.4], ['L', -4.2, -11.6], ['L', -1.2, -10.2], ['L', 1.4, -12.4], ['L', 3.6, -10.2], ['L', 5.8, -11.2], ['L', 5.9, -6.9], ['C', 1.8, -9, -2, -9, -5.4, -7.4]]) + 'Z';
        hatLines = path([['M', -3.6, -9.2], ['L', -3.5, -9.1]]) + path([['M', 1.2, -9.8], ['L', 1.3, -9.7]]) + path([['M', 4.4, -9.2], ['L', 4.5, -9.1]]);
        break;
      case 'wreath': {
        let w = '';
        for (let i = 0; i < 6; i++) {
          const x = -7 + i * 2.6, y = -6.4 - Math.sin((i / 5) * Math.PI) * 2.4;
          w += path([['M', x, y], ['q', 1.2, -2.8, 2.6, -1.6]]) + path([['M', x, y], ['q', 1.4, 1.8, 2.8, 0.6]]);
        }
        hatLines = w;
        break;
      }
      case 'veil':
        hat = path([['M', -3, -9.4], ['C', 4, -11, 8.4, -7.6, 6.8, -4.4], ['C', 2, -7, -3, -7.4, -6.6, -2], ['C', -8.4, 4, -9.6, 12, -12, 20], ['C', -14.6, 13, -12.6, 0, -10, -5], ['C', -8, -8.6, -5.6, -9.6, -3, -9.4]]) + 'Z';
        hatLines = path([['M', -9, -2], ['C', -10.4, 6, -11.4, 12, -12.4, 17]]);
        break;
      default:
    }
    attr(P.hat, { d: hat });
    attr(P.hatDetail, { d: hatLines });
  }
}

function f1(v: number): string {
  return (Math.round(v * 10) / 10).toString();
}

function circleAt(xy: string, r: number): string {
  const [x, y] = xy.split(' ').map(Number);
  return circle([x, y], r);
}

function circle(c: Vec, r: number): string {
  return `M${f1(c[0] - r)} ${f1(c[1])}a${f1(r)} ${f1(r)} 0 1 0 ${f1(r * 2)} 0a${f1(r)} ${f1(r)} 0 1 0 ${f1(-r * 2)} 0Z`;
}

/* ------------------------------------------------------------------ */
/* Props held or worn by figures.                                      */
/* ------------------------------------------------------------------ */

/** Round hoplite shield (aspis) with an emblem; centred at c. */
export function shield(c: Vec, r = 13, device: 'none' | 'star' | 'lion' | 'tripod' | 'dolphin' = 'star', ground = CLAY): SVGGElement {
  const g = s('g', { class: 'shield', transform: `translate(${f1(c[0])} ${f1(c[1])})` });
  g.appendChild(s('circle', { r, fill: INK }));
  g.appendChild(s('circle', { r: r - 2.2, fill: 'none', stroke: ground, 'stroke-width': 0.7 }));
  const dev = s('g', { fill: WHITE });
  if (device === 'star') {
    let d = '';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      d += `M0 0L${f1(Math.cos(a - 0.18) * r * 0.25)} ${f1(Math.sin(a - 0.18) * r * 0.25)}L${f1(Math.cos(a) * r * 0.62)} ${f1(Math.sin(a) * r * 0.62)}L${f1(Math.cos(a + 0.18) * r * 0.25)} ${f1(Math.sin(a + 0.18) * r * 0.25)}Z`;
    }
    dev.appendChild(s('path', { d }));
  } else if (device === 'tripod') {
    dev.appendChild(s('path', { d: `M${-r * 0.4} ${-r * 0.3}h${r * 0.8}l-${r * 0.12} ${r * 0.14}h-${r * 0.56}zM${-r * 0.3} ${-r * 0.16}l-${r * 0.12} ${r * 0.6}h${r * 0.06}l${r * 0.14} -${r * 0.56}zM${r * 0.3} ${-r * 0.16}l${r * 0.12} ${r * 0.6}h-${r * 0.06}l-${r * 0.14} -${r * 0.56}zM-1 ${-r * 0.16}h2v${r * 0.6}h-2z` }));
  } else if (device === 'dolphin') {
    dev.appendChild(s('path', { d: `M${-r * 0.6} ${r * 0.1}C${-r * 0.3} ${-r * 0.5} ${r * 0.3} ${-r * 0.5} ${r * 0.56} ${-r * 0.06}L${r * 0.7} ${-r * 0.2}L${r * 0.62} ${r * 0.08}C${r * 0.3} ${r * 0.2} ${-r * 0.2} ${r * 0.16} ${-r * 0.44} ${r * 0.3}L${-r * 0.64} ${r * 0.44}Z` }));
  } else if (device === 'lion') {
    dev.appendChild(s('circle', { r: r * 0.28 }));
    let d = '';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      d += `M${f1(Math.cos(a) * r * 0.26)} ${f1(Math.sin(a) * r * 0.26)}L${f1(Math.cos(a + 0.26) * r * 0.5)} ${f1(Math.sin(a + 0.26) * r * 0.5)}L${f1(Math.cos(a + 0.5) * r * 0.26)} ${f1(Math.sin(a + 0.5) * r * 0.26)}Z`;
    }
    dev.appendChild(s('path', { d }));
  }
  g.appendChild(dev);
  return g;
}

/** A spear from `a` to `b` with a leaf-shaped head at b. */
export function spear(a: Vec, b: Vec, color = INK, w = 1.1): SVGGElement {
  const g = s('g', { class: 'spear' });
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const L = Math.hypot(dx, dy) || 1;
  const ux = dx / L, uy = dy / L;
  g.appendChild(s('line', { x1: f1(a[0]), y1: f1(a[1]), x2: f1(b[0] - ux * 4), y2: f1(b[1] - uy * 4), stroke: color, 'stroke-width': w, 'stroke-linecap': 'round' }));
  g.appendChild(s('path', { d: limb([b[0] - ux * 7, b[1] - uy * 7], [b[0] + ux * 1.5, b[1] + uy * 1.5], [[0, 0.5, 0.5], [0.4, 1.7, 1.7], [1, 0.1, 0.1]], false, false), fill: color }));
  return g;
}

/** A curved composite bow from a to b (string side toward +normal); `draw` pulls the string back. */
export function bowPath(a: Vec, b: Vec, bulge: number, drawPoint?: Vec): { limb: string; string: string } {
  const mid: Vec = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const L = Math.hypot(dx, dy) || 1;
  const n: Vec = [-dy / L, dx / L];
  const tip1: Vec = [a[0] - n[0] * 1.5, a[1] - n[1] * 1.5];
  const tip2: Vec = [b[0] - n[0] * 1.5, b[1] - n[1] * 1.5];
  const c1: Vec = [mid[0] + n[0] * bulge - dx * 0.25, mid[1] + n[1] * bulge - dy * 0.25];
  const c2: Vec = [mid[0] + n[0] * bulge + dx * 0.25, mid[1] + n[1] * bulge + dy * 0.25];
  const limbD = ribbon([tip1, a, c1, [mid[0] + n[0] * bulge * 0.82, mid[1] + n[1] * bulge * 0.82], c2, b, tip2], [[0, 0.6], [0.5, 2.2], [1, 0.6]], 40);
  const sp = drawPoint ?? mid;
  const stringD = `M${f1(tip1[0])} ${f1(tip1[1])}L${f1(sp[0])} ${f1(sp[1])}L${f1(tip2[0])} ${f1(tip2[1])}`;
  return { limb: limbD, string: stringD };
}
