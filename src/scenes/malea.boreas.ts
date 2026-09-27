/**
 * The winds as archaic painters showed them: winged daimones in the flying
 * "Knielauf", with sickle wings of ribboned feathers — here with puffed
 * cheeks and pursed lips, blowing. Used by the Malea tondo (Boreas) and the
 * Aiolos tondo (the four winds bursting from the bag).
 *
 * Local frame: the figure faces +x, feet near y = 0, about 100 units tall.
 */
import { s } from '../lib/dom';
import { Figure, pose, INK, CLAY, WHITE, PURPLE, type HeadKind, type Pose } from '../art/figure';
import { ribbon, sampleSpline, add, mul, type Vec } from '../lib/geometry';
import { headFrame } from './avlis.fleet';

const f1 = (v: number) => (Math.round(v * 10) / 10).toString();

export type WindName = 'boreas' | 'notos' | 'euros' | 'zephyros';

export interface WindGod {
  /** Outer group: position it (e.g. with puppet()). */
  g: SVGGElement;
  fig: Figure;
  /** Streaming breath from the lips (animate its paths' dash offsets). */
  breath: SVGGElement;
  breathLines: SVGPathElement[];
  /** Where the lips are, in the god's local frame. */
  lips: Vec;
  /** Animate: wings beat, cheeks swell, breath flows. `blow` 0..1 scales the breath. */
  update(t: number, blow?: number): void;
}

const STYLE: Record<WindName, { head: HeadKind; garment: 'short' | 'none'; color: string; hair: number }> = {
  boreas: { head: 'bearded', garment: 'short', color: PURPLE, hair: 6 },
  notos: { head: 'bearded', garment: 'none', color: INK, hair: 4 },
  euros: { head: 'old', garment: 'short', color: INK, hair: 3 },
  zephyros: { head: 'youth', garment: 'none', color: INK, hair: 3 },
};

/** A flying pose, leaning into the blow (a fresh object each call). */
export const flyPose = (): Pose => pose({ x: 0, y: -36, lean: 30, head: -2, armF: [158, -8], armB: [58, 36], legF: [66, 78], legB: [-24, 88], footF: 10, footB: 44, grip: 0 });

/** One sickle wing of ribboned feathers, root at (0,0), rising up and back. */
function wing(scale = 1): { g: SVGGElement } {
  const g = s('g', { class: 'wind-wing' });
  const k = scale;
  // The "arm" of the wing: up and back, the tip curling forward.
  const bone: Vec[] = [[0, 0], [-7, -18], [-18, -38], [-27, -54], [-26, -66], [-17, -71]].map(([x, y]) => [x * k, y * k] as Vec);
  const spline = sampleSpline(bone, 40);
  // Long flight feathers: ribbons fanning back from the arm, longest near the tip.
  const feathers = s('g', { fill: INK, stroke: CLAY, 'stroke-width': 0.7, 'paint-order': 'stroke', 'stroke-linejoin': 'round' });
  const n = 7;
  for (let i = 0; i < n; i++) {
    const u = 0.12 + (i / (n - 1)) * 0.72;
    const idx = Math.round(u * (spline.length - 1));
    const p = spline[idx];
    const q = spline[Math.min(spline.length - 1, idx + 1)];
    const tx = q[0] - p[0], ty = q[1] - p[1];
    const L = Math.hypot(tx, ty) || 1;
    // Outward normal (to the back / down side of the arm).
    const nx = ty / L, ny = -tx / L;
    const len = (16 + i * 4.6) * k;
    const back: Vec = [-0.55, 0.35];
    const dir: Vec = [nx * 0.55 + back[0] * 0.8, ny * 0.55 + back[1] * 0.8];
    const dl = Math.hypot(dir[0], dir[1]);
    const d: Vec = [dir[0] / dl, dir[1] / dl];
    const tip = add(p, mul(d, len));
    const mid = add(add(p, mul(d, len * 0.55)), [0, 2.2 * k]);
    feathers.appendChild(s('path', { d: ribbon([p, mid, tip], [[0, 5.4 * k], [0.7, 4 * k], [1, 0.6]], 16) }));
  }
  g.appendChild(feathers);
  // Coverts: a solid band along the arm, with a stripe of added purple and incised scales.
  g.appendChild(s('path', { d: ribbon(bone, [[0, 13 * k], [0.55, 10 * k], [0.85, 6 * k], [1, 2 * k]], 40), fill: INK }));
  g.appendChild(s('path', { d: ribbon(bone.map(([x, y]) => [x - 2.6 * k, y + 1.2 * k] as Vec).slice(0, 5), [[0, 3.4 * k], [1, 1.4 * k]], 30), fill: PURPLE }));
  let scales = '';
  for (let i = 3; i < 30; i += 4) {
    const [x, y] = spline[i];
    scales += `M${f1(x + 1.8 * k)} ${f1(y - 0.6 * k)}q${f1(1.6 * k)} ${f1(1.6 * k)} ${f1(0.2 * k)} ${f1(3 * k)}`;
  }
  g.appendChild(s('path', { d: scales, fill: 'none', stroke: CLAY, 'stroke-width': 0.6, 'stroke-linecap': 'round' }));
  return { g };
}

export function windGod(name: WindName, opts: { breath?: string; phase?: number; wingScale?: number; wingSweep?: number } = {}): WindGod {
  /** Degrees the wings are swept back from upright (negative = backwards). */
  const wingSweep = opts.wingSweep ?? 0;
  const ws = opts.wingScale ?? 1;
  const st = STYLE[name];
  const g = s('g', { class: `wind-god wind-god--${name}` });
  const fig = new Figure({ head: st.head, garment: st.garment, garmentColor: st.color }, flyPose());
  const j = fig.joints();
  const root = j.armB.S;
  // Two wings behind the body: the far one a little higher and turned back.
  const wingsG = s('g');
  const far = wing(0.96 * ws);
  const near = wing(1.05 * ws);
  const farG = s('g');
  farG.appendChild(far.g);
  const nearG = s('g');
  nearG.appendChild(near.g);
  wingsG.append(farG, nearG);
  // Hair streaming back in the wind.
  const hf = headFrame(fig);
  const hairG = s('g', { fill: INK });
  for (let i = 0; i < st.hair; i++) {
    const a0 = hf.at(-6.6, -4 + i * 2.2);
    const a1 = hf.at(-14 - i * 1.4, -2 + i * 3.4);
    const a2 = hf.at(-22 - i * 2, 2 + i * 4.6);
    hairG.appendChild(s('path', { d: ribbon([a0, a1, a2], [[0, 2.6], [1, 0.4]], 12) }));
  }
  // Puffed cheek and pursed lips over the profile; an incised arc marks the swelling.
  const cheek = s('path', { fill: INK });
  const cheekLine = s('path', { fill: 'none', stroke: CLAY, 'stroke-width': 0.6, 'stroke-linecap': 'round' });
  const face = s('g');
  face.append(cheek, cheekLine);
  const lips = hf.at(10.2, 3.4);
  const breathColor = opts.breath ?? WHITE;
  const breath = s('g', { class: 'wind-breath', fill: 'none', stroke: breathColor, 'stroke-linecap': 'round' });
  const breathLines: SVGPathElement[] = [];
  const a = (hf.a * Math.PI) / 180;
  const dir: Vec = [Math.cos(a), Math.sin(a)];
  const nrm: Vec = [-dir[1], dir[0]];
  for (let i = 0; i < 5; i++) {
    const spread = (i - 2) * 0.16;
    const pts: Vec[] = [];
    for (let k = 0; k <= 8; k++) {
      const u = k / 8;
      const L = 8 + u * (58 + Math.abs(i - 2) * -6);
      const wob = Math.sin(u * 7 + i) * 2.2 * u;
      pts.push(add(add(lips, mul(dir, L)), mul(nrm, spread * L + wob)));
    }
    let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
    for (let k = 1; k < pts.length; k++) d += `L${f1(pts[k][0])} ${f1(pts[k][1])}`;
    const p = s('path', { d, 'stroke-width': i === 2 ? 1.8 : 1.2, pathLength: 1, 'stroke-dasharray': i % 2 ? '0.22 0.14' : '0.34 0.12' });
    breathLines.push(p);
    breath.appendChild(p);
  }
  g.append(wingsG, hairG, fig.g, face, breath);

  const phase = opts.phase ?? 0;
  const drawCheek = (puff: number) => {
    // A swelling in front of the mouth and small pursed lips; an incised ring marks the round cheek.
    const c = hf.at(4.4 + puff * 0.3, 4.2);
    const r = 3.3 + puff * 0.9;
    const lip = hf.at(8.4 + puff * 0.5, 3.4);
    cheek.setAttribute(
      'd',
      `M${f1(c[0] - r)} ${f1(c[1])}a${f1(r)} ${f1(r)} 0 1 0 ${f1(r * 2)} 0a${f1(r)} ${f1(r)} 0 1 0 ${f1(-r * 2)} 0Z` +
        `M${f1(lip[0] - 1.2)} ${f1(lip[1])}a1.2 1.05 0 1 0 2.4 0a1.2 1.05 0 1 0 -2.4 0Z`,
    );
    const cc = hf.at(3.8, 4.4);
    const rr = 1.9 + puff * 0.7;
    cheekLine.setAttribute('d', `M${f1(cc[0] - rr)} ${f1(cc[1])}a${f1(rr)} ${f1(rr)} 0 1 0 ${f1(rr * 2)} 0a${f1(rr)} ${f1(rr)} 0 1 0 ${f1(-rr * 2)} 0`);
  };

  const update = (t: number, blow = 1) => {
    const beat = Math.sin(t * 5.2 + phase * 6.28);
    farG.setAttribute('transform', `translate(${f1(root[0] - 1)} ${f1(root[1] - 3)}) rotate(${f1(wingSweep - 18 + beat * 7)})`);
    nearG.setAttribute('transform', `translate(${f1(root[0] + 1)} ${f1(root[1])}) rotate(${f1(wingSweep + beat * 9)})`);
    drawCheek(0.6 + 0.4 * Math.sin(t * 3.1 + phase * 3));
    breath.setAttribute('opacity', f1(Math.max(0, Math.min(1, blow))));
    breathLines.forEach((p, i) => {
      const off = (((-t * (0.9 + i * 0.13) + i * 0.3) % 1) + 1) % 1;
      p.setAttribute('stroke-dashoffset', String(Math.round(off * 1000) / 1000));
    });
  };
  update(0, 1);
  return { g, fig, breath, breathLines, lips, update };
}
