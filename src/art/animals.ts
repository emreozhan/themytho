/**
 * Beasts for the tondos, in the manner of archaic animal friezes: long lean
 * bodies, thin legs, incised details. A Beast can walk (`step(phase)`) and
 * lower or raise its head.
 *
 * Frame: facing +x, hooves on y = 0, roughly 40–100 units long.
 */
import { s, attr, r1 } from '../lib/dom';
import { limb, ribbon, smoothPath, type Vec } from '../lib/geometry';
import { gsap } from '../lib/motion';
import { INK, CLAY, WHITE } from './figure';

export type BeastKind = 'ox' | 'ram' | 'sheep' | 'pig' | 'dog' | 'donkey';

interface Spec {
  body: Vec[];
  head: Vec[];
  /** Pivot of the head (for nodding). */
  neck: Vec;
  tail: { pts: Vec[]; w: Array<[number, number]> };
  /** [hip/shoulder anchor, leg length, top width] for front and hind legs. */
  front: [Vec, number, number];
  hind: [Vec, number, number];
  hoof: number;
  details(g: SVGGElement, inc: string, color: string): void;
  headExtras?(g: SVGGElement, inc: string, color: string): void;
}

const SPECS: Record<BeastKind, Spec> = {
  ox: {
    body: [[-38, -30], [-30, -42], [-8, -44], [16, -46], [28, -42], [34, -30], [32, -18], [24, -14], [0, -12], [-24, -13], [-35, -18]],
    head: [[27, -44], [38, -46], [45, -40], [53, -28], [51, -22], [45, -23], [37, -30], [29, -32]],
    neck: [30, -40],
    tail: { pts: [[-37, -38], [-42, -28], [-42, -14], [-40, -6]], w: [[0, 2.6], [0.8, 1.6], [1, 3.6]] },
    front: [[22, -18], 18, 6.4],
    hind: [[-27, -18], 18, 7.2],
    hoof: 3,
    details(g, inc) {
      g.appendChild(s('path', { d: 'M20 -40Q16 -28 22 -16M-24 -38Q-18 -30 -26 -16M-8 -40Q-4 -30 -10 -20', fill: 'none', stroke: inc, 'stroke-width': 0.7, opacity: 0.8 }));
    },
    headExtras(g, inc, color) {
      g.appendChild(s('path', { d: ribbon([[37, -45], [33, -55], [39, -62], [46, -60]], [[0, 3.4], [1, 1]], 20), fill: color }));
      g.appendChild(s('path', { d: ribbon([[33, -44], [27, -52], [30, -58]], [[0, 3], [1, 0.8]], 16), fill: color, opacity: 0.85 }));
      g.appendChild(s('path', { d: 'M34 -42L28 -46L33 -38Z', fill: color }));
      g.appendChild(s('circle', { cx: 42.5, cy: -38, r: 1.3, fill: inc }));
      g.appendChild(s('path', { d: 'M50 -25Q48 -23 50 -22', fill: 'none', stroke: inc, 'stroke-width': 0.6 }));
    },
  },
  ram: {
    body: [[-26, -24], [-20, -32], [0, -34], [14, -33], [22, -28], [25, -18], [18, -12], [0, -11], [-18, -12], [-26, -16]],
    head: [[18, -32], [26, -38], [34, -34], [38, -26], [34, -24], [26, -26], [20, -24]],
    neck: [21, -30],
    tail: { pts: [[-25, -24], [-29, -18], [-28, -12]], w: [[0, 4], [1, 2.4]] },
    front: [[15, -14], 13, 4.4],
    hind: [[-18, -14], 13, 5],
    hoof: 2.2,
    details(g, inc) {
      let d = '';
      for (let row = 0; row < 3; row++) for (let x = -22; x < 18; x += 6) d += `M${x + (row % 2) * 3} ${-28 + row * 6}q3 -3 6 0`;
      g.appendChild(s('path', { d, fill: 'none', stroke: inc, 'stroke-width': 0.7, opacity: 0.85 }));
    },
    headExtras(g, inc, color) {
      // The great curled horn.
      g.appendChild(s('path', { d: 'M24 -36C18 -44 8 -40 10 -32C12 -26 20 -27 20 -32C20 -35 16 -36 15 -33', fill: 'none', stroke: color, 'stroke-width': 4.2, 'stroke-linecap': 'round' }));
      g.appendChild(s('path', { d: 'M24 -36C18 -44 8 -40 10 -32C12 -26 20 -27 20 -32', fill: 'none', stroke: inc, 'stroke-width': 0.6, 'stroke-dasharray': '1.5 2' }));
      g.appendChild(s('circle', { cx: 31, cy: -32, r: 1.1, fill: inc }));
    },
  },
  sheep: {
    body: [[-24, -22], [-18, -30], [0, -32], [13, -31], [20, -26], [23, -17], [16, -11], [0, -10], [-17, -11], [-24, -15]],
    head: [[16, -30], [24, -35], [31, -31], [34, -24], [30, -22], [23, -24], [18, -22]],
    neck: [19, -28],
    tail: { pts: [[-23, -22], [-27, -16], [-26, -11]], w: [[0, 3.6], [1, 2.2]] },
    front: [[14, -13], 12, 4],
    hind: [[-17, -13], 12, 4.6],
    hoof: 2,
    details(g, inc) {
      let d = '';
      for (let row = 0; row < 3; row++) for (let x = -20; x < 16; x += 6) d += `M${x + (row % 2) * 3} ${-26 + row * 6}q3 -3 6 0`;
      g.appendChild(s('path', { d, fill: 'none', stroke: inc, 'stroke-width': 0.7, opacity: 0.85 }));
    },
    headExtras(g, inc, color) {
      g.appendChild(s('path', { d: 'M22 -33L17 -38L20 -31Z', fill: color }));
      g.appendChild(s('circle', { cx: 27.5, cy: -30, r: 1, fill: inc }));
    },
  },
  pig: {
    body: [[-22, -18], [-14, -25], [2, -27], [14, -25], [21, -19], [22, -11], [14, -6], [0, -5], [-14, -6], [-22, -11]],
    head: [[16, -24], [26, -21], [33, -15], [34, -9], [29, -8], [22, -10], [16, -12]],
    neck: [18, -18],
    tail: { pts: [[-21, -19], [-26, -21], [-27, -17], [-24, -16]], w: [[0, 1.8], [1, 1]] },
    front: [[13, -8], 8, 4],
    hind: [[-15, -8], 8, 4.6],
    hoof: 1.8,
    details(g, inc) {
      // Bristling crest along the spine and an incised shoulder.
      let d = 'M-14 -25';
      for (let x = -12; x < 14; x += 4) d += `L${x} -29L${x + 2} -25.6`;
      g.appendChild(s('path', { d: d + 'L14 -25Z', fill: INK }));
      g.appendChild(s('path', { d: 'M10 -22Q6 -14 12 -8M-12 -20Q-8 -13 -14 -8', fill: 'none', stroke: inc, 'stroke-width': 0.7, opacity: 0.8 }));
    },
    headExtras(g, inc, color) {
      g.appendChild(s('path', { d: 'M20 -23L22 -31L26 -22Z', fill: color }));
      g.appendChild(s('circle', { cx: 25, cy: -17, r: 1, fill: inc }));
      g.appendChild(s('path', { d: 'M33 -14V-9', stroke: inc, 'stroke-width': 0.7 }));
    },
  },
  dog: {
    body: [[-24, -26], [-10, -28], [8, -29], [18, -30], [24, -25], [22, -18], [10, -16], [-4, -19], [-16, -19], [-24, -21]],
    head: [[19, -32], [23, -42], [30, -44], [40, -40], [42, -37], [34, -35], [28, -32], [24, -28]],
    neck: [22, -30],
    tail: { pts: [[-23, -25], [-32, -34], [-38, -44]], w: [[0, 3], [1, 1]] },
    front: [[16, -19], 19, 4],
    hind: [[-19, -20], 19, 5],
    hoof: 2,
    details(g, inc) {
      g.appendChild(s('path', { d: 'M-6 -25Q-2 -21 -6 -18M0 -26Q4 -22 0 -18M6 -27Q10 -23 6 -18', fill: 'none', stroke: inc, 'stroke-width': 0.6, opacity: 0.8 }));
    },
    headExtras(g, inc, color) {
      g.appendChild(s('path', { d: 'M24 -40L23 -51L29 -42Z', fill: color }));
      g.appendChild(s('circle', { cx: 31, cy: -40, r: 1, fill: inc }));
    },
  },
  donkey: {
    body: [[-28, -30], [-20, -36], [0, -37], [16, -38], [24, -33], [26, -22], [18, -16], [0, -15], [-20, -16], [-28, -21]],
    head: [[18, -38], [26, -48], [32, -48], [42, -32], [40, -28], [34, -30], [24, -34]],
    neck: [22, -36],
    tail: { pts: [[-27, -30], [-32, -22], [-33, -10]], w: [[0, 2], [0.85, 1.4], [1, 3.2]] },
    front: [[17, -17], 17, 4.8],
    hind: [[-20, -17], 17, 5.4],
    hoof: 2.2,
    details(g, inc) {
      g.appendChild(s('path', { d: 'M14 -34Q10 -24 16 -17', fill: 'none', stroke: inc, 'stroke-width': 0.7, opacity: 0.8 }));
    },
    headExtras(g, inc, color) {
      g.appendChild(s('path', { d: ribbon([[26, -47], [24, -58], [25, -64]], [[0, 3.6], [0.6, 3.2], [1, 0.8]], 14), fill: color }));
      g.appendChild(s('path', { d: ribbon([[29, -47], [30, -57], [33, -62]], [[0, 3.2], [0.6, 3], [1, 0.8]], 14), fill: color }));
      let m = 'M20 -37';
      for (let i = 0; i < 5; i++) m += `L${22 + i * 1.6} ${-42 - i * 1.2}L${23 + i * 1.6} ${-38 - i * 1.4}`;
      g.appendChild(s('path', { d: m + 'Z', fill: color }));
      g.appendChild(s('circle', { cx: 32, cy: -41, r: 1, fill: inc }));
    },
  },
};

export interface BeastOptions {
  x?: number;
  y?: number;
  scale?: number;
  facing?: 1 | -1;
  color?: string;
  /** Incision colour (the ground the beast is painted on). */
  ground?: string;
}

export class Beast {
  readonly g: SVGGElement;
  readonly kind: BeastKind;
  private legs: SVGPathElement;
  private legsFar: SVGPathElement;
  private head: SVGGElement;
  private spec: Spec;
  x: number;
  y: number;
  scale: number;
  facing: 1 | -1;
  phase = 0;
  headAngle = 0;

  constructor(kind: BeastKind, o: BeastOptions = {}) {
    this.kind = kind;
    this.spec = SPECS[kind];
    this.x = o.x ?? 0;
    this.y = o.y ?? 0;
    this.scale = o.scale ?? 1;
    this.facing = o.facing ?? 1;
    const color = o.color ?? INK;
    const inc = o.ground ?? CLAY;
    this.g = s('g', { class: `beast beast--${kind}` });
    const inner = s('g');
    this.legsFar = s('path', { fill: color, stroke: inc, 'stroke-width': 0.9, 'paint-order': 'stroke', opacity: 0.92 });
    const tail = s('path', { d: ribbon(this.spec.tail.pts, this.spec.tail.w, 20), fill: color });
    // The body carries an incised outline so overlapping beasts stay legible.
    const body = s('path', { d: smoothPath(this.spec.body, true, 0.36), fill: color, stroke: inc, 'stroke-width': 1.2, 'paint-order': 'stroke' });
    this.head = s('g', { class: 'beast__head' });
    this.head.appendChild(s('path', { d: smoothPath(this.spec.head, true, 0.3), fill: color }));
    this.spec.headExtras?.(this.head, inc, color);
    this.legs = s('path', { fill: color, stroke: inc, 'stroke-width': 1.2, 'paint-order': 'stroke' });
    inner.append(this.legsFar, tail, body);
    this.spec.details(inner, inc, color);
    inner.append(this.head, this.legs);
    this.g.appendChild(inner);
    this.render();
  }

  /** Walking cycle position (0..1 repeats). */
  step(phase: number): void {
    this.phase = phase;
    this.render();
  }

  nod(angle: number): void {
    this.headAngle = angle;
    this.render();
  }

  moveTo(x: number, y = this.y): void {
    this.x = x;
    this.y = y;
    this.render();
  }

  /** Start an endless walk cycle; returns the tween (kill it to stop). */
  walk(speed = 1): gsap.core.Tween {
    const p = { v: this.phase };
    return gsap.to(p, { v: '+=1', duration: 1 / speed, ease: 'none', repeat: -1, onUpdate: () => this.step(p.v % 1) });
  }

  private leg(anchor: Vec, len: number, w: number, phase: number, hind: boolean): string {
    const a = Math.sin(phase * Math.PI * 2);
    const lift = Math.max(0, Math.cos(phase * Math.PI * 2)) * len * 0.12;
    const foot: Vec = [anchor[0] + a * len * 0.28, -lift];
    const knee: Vec = hind
      ? [anchor[0] - len * 0.18 + a * len * 0.1, anchor[1] + len * 0.55]
      : [anchor[0] + len * 0.04 + a * len * 0.16, anchor[1] + len * 0.5];
    const hoof = this.spec.hoof;
    return (
      limb(anchor, knee, [[0, w * 0.5, w * 0.5], [1, w * 0.26, w * 0.26]]) +
      limb(knee, foot, [[0, w * 0.26, w * 0.26], [0.85, w * 0.18, w * 0.18], [1, w * 0.22, w * 0.22]]) +
      `M${r1(foot[0] - hoof * 0.4)} ${r1(foot[1] - hoof)}h${r1(hoof * 1.3)}l${r1(hoof * 0.3)} ${r1(hoof)}h${r1(-hoof * 1.7)}Z`
    );
  }

  private render(): void {
    const sp = this.spec;
    const p = this.phase;
    const [fa, fl, fw] = sp.front;
    const [ha, hl, hw] = sp.hind;
    attr(this.legs, { d: this.leg(fa, fl, fw, p, false) + this.leg(ha, hl, hw, p + 0.5, true) });
    attr(this.legsFar, { d: this.leg([fa[0] - 3, fa[1]], fl, fw * 0.9, p + 0.5, false) + this.leg([ha[0] - 3, ha[1]], hl, hw * 0.9, p, true) });
    this.head.setAttribute('transform', `rotate(${r1(this.headAngle)} ${sp.neck[0]} ${sp.neck[1]})`);
    const bob = Math.abs(Math.sin(p * Math.PI * 2)) * 0.8;
    this.g.setAttribute(
      'transform',
      `translate(${r1(this.x)} ${r1(this.y - bob * this.scale)}) scale(${r1(this.scale * this.facing * 100) / 100} ${r1(this.scale * 100) / 100})`,
    );
  }
}

/** A simple standing bird (for fillers and omens). */
export function bird(x: number, y: number, k = 1, color = INK): SVGGElement {
  const g = s('g', { class: 'kit-bird', transform: `translate(${r1(x)} ${r1(y)}) scale(${k})` });
  g.appendChild(s('path', { d: 'M-10 -8C-6 -14 4 -14 8 -10L14 -11L9 -7C8 -2 2 1 -4 0L-12 2L-8 -3Z M-2 0L-3 7M2 0L2 7', fill: color, stroke: color, 'stroke-width': 1 }));
  g.appendChild(s('circle', { cx: 6, cy: -10, r: 0.9, fill: CLAY }));
  g.appendChild(s('path', { d: 'M-6 -7Q0 -3 5 -6', fill: 'none', stroke: WHITE, 'stroke-width': 0.6, opacity: 0.8 }));
  return g;
}
