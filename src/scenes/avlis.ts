/**
 * Βʹ Avlis — the Achaean fleet gathers.
 * Tableau A: the harbour of Aulis crowded with black ships, sails brailed up;
 *   Agamemnon with helmet and sceptre on the shore by the altar.
 * Tableau B: Skyros — Odysseus the pedlar opens his chest of gifts among the
 *   maidens; at the blast of his trumpet one "maiden" throws off the veil and
 *   seizes shield and spear: Achilles.
 * Back at Aulis the sails hang slack on a flat sea. Hold, and the wind rises:
 *   sails fill, waves run, oars bite — and the fleet sails for Troy.
 */
import { s } from '../lib/dom';
import { gsap } from '../lib/motion';
import { Figure, POSES, pose, INK, CLAY, WHITE, PURPLE, shield } from '../art/figure';
import { exergue, inscription, fillers, flames, column, sun } from '../art/kit';
import { clamp, lerp, type Vec } from '../lib/geometry';
import { stage } from './tools';
import { Galley, RollingSea, windPath, dolphin, armTo, headFrame, puppet, type GalleyOptions } from './avlis.fleet';
import type { SceneFactory } from '../story/types';

const f1 = (v: number) => (Math.round(v * 10) / 10).toString();

/** Harbour: the ships' waterline. */
const WL = 72;
/** Shore ground (Agamemnon's feet). */
const SHORE = 70;
/** Where the altar fire burns on the shore. */
const ALTAR_X = -154;
/** Skyros: groundline. */
const GB = 92;

/** Enlarge a tableau about its groundline. */
const fillAbout = (k: number, g: number, x = 0) => `translate(${x} ${g}) scale(${k}) translate(${-x} ${-g})`;

/** A gull in flight: body and two beating wings (animate `.wing` scaleY). */
function flyingBird(x: number, y: number, k = 1): { g: SVGGElement; wings: SVGPathElement } {
  const g = s('g', { class: 'aam-bird', transform: `translate(${x} ${y}) scale(${k})` });
  g.appendChild(s('path', { d: 'M-7 0.6C-4 -1.6 3 -1.8 6 -0.6L9.4 -1.2L7 0.8C4 2 -3 2.2 -7 0.6Z', fill: INK }));
  const wings = s('path', { d: 'M-2 -0.4C-5 -6 -9 -8 -14 -8C-10 -5 -7 -2 -4 0.8ZM1 -0.6C3 -6 7 -9 12 -10C9 -6 6 -2 3.4 0.6Z', fill: INK, class: 'wing' });
  g.appendChild(wings);
  return { g, wings };
}

/** The stepped altar of the sacrifice at Aulis, with a fire on it. */
function altar(x: number, g: number): { g: SVGGElement; fire: SVGGElement } {
  const grp = s('g', { class: 'avlis-altar' });
  grp.appendChild(s('path', { d: `M${x - 17} ${g}V${g - 5}H${x + 17}V${g}Z M${x - 13} ${g - 5}V${g - 24}H${x + 13}V${g - 5}Z M${x - 16} ${g - 24}V${g - 29}H${x + 16}V${g - 24}Z`, fill: INK }));
  // Volutes and an incised meander-ish band.
  grp.appendChild(s('path', { d: `M${x - 16} ${g - 29}q-4 -1 -3 -5q3 0 3 5ZM${x + 16} ${g - 29}q4 -1 3 -5q-3 0 -3 5Z`, fill: INK }));
  grp.appendChild(s('path', { d: `M${x - 10} ${g - 18}h6v-3h4v3h6v-3h4v3M${x - 13} ${g - 8}H${x + 13}`, fill: 'none', stroke: CLAY, 'stroke-width': 0.7 }));
  const fire = flames(x, g - 29, 0.62);
  grp.appendChild(fire);
  return { g: grp, fire };
}

/** A spear drawn from `butt` to `tip` (updatable). */
class Spear {
  readonly g = s('g', { class: 'aam-spear' });
  private shaft = s('path', { stroke: INK, 'stroke-width': 1.4, 'stroke-linecap': 'round' });
  private head = s('path', { fill: INK });
  constructor() {
    this.g.append(this.shaft, this.head);
  }
  set(butt: Vec, tip: Vec): void {
    const dx = tip[0] - butt[0], dy = tip[1] - butt[1];
    const L = Math.hypot(dx, dy) || 1;
    const ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
    const b: Vec = [tip[0] - ux * 9, tip[1] - uy * 9];
    this.shaft.setAttribute('d', `M${f1(butt[0])} ${f1(butt[1])}L${f1(b[0])} ${f1(b[1])}`);
    this.head.setAttribute(
      'd',
      `M${f1(b[0] - ux * 1)} ${f1(b[1] - uy * 1)}L${f1(b[0] + ux * 3 + nx * 2.1)} ${f1(b[1] + uy * 3 + ny * 2.1)}L${f1(tip[0])} ${f1(tip[1])}L${f1(b[0] + ux * 3 - nx * 2.1)} ${f1(b[1] + uy * 3 - ny * 2.1)}Z`,
    );
  }
}

/** The pedlar's chest: box on feet, the lid thrown back, gifts spilling out. */
function giftChest(x: number, g: number): SVGGElement {
  const grp = s('g', { class: 'avlis-chest' });
  const top = g - 26;
  // Lid, thrown back.
  grp.appendChild(s('path', { d: `M${x - 21} ${top}L${x - 12} ${top - 19}H${x + 30}L${x + 23} ${top}Z`, fill: INK }));
  grp.appendChild(s('path', { d: `M${x - 16} ${top - 3}L${x - 9} ${top - 16}H${x + 26}L${x + 20} ${top - 3}Z`, fill: 'none', stroke: CLAY, 'stroke-width': 0.7 }));
  // Gifts showing over the rim: a mirror, a sash in added purple, a necklace in added white.
  grp.appendChild(s('path', { d: `M${x + 8} ${top + 1}L${x + 11} ${top - 12}`, stroke: INK, 'stroke-width': 1.6 }));
  grp.appendChild(s('circle', { cx: x + 12, cy: top - 16.5, r: 5.2, fill: INK, stroke: CLAY, 'stroke-width': 0.6 }));
  grp.appendChild(s('path', { d: `M${x - 17} ${top + 1}C${x - 12} ${top - 7} ${x - 4} ${top - 8} ${x + 2} ${top + 1}Z`, fill: PURPLE, stroke: INK, 'stroke-width': 0.6 }));
  // Box with feet, incised panels.
  grp.appendChild(s('path', { d: `M${x - 22} ${top}H${x + 23}V${g - 4}H${x + 20}V${g}H${x + 15}V${g - 4}H${x - 14}V${g}H${x - 19}V${g - 4}H${x - 22}Z`, fill: INK }));
  grp.appendChild(s('path', { d: `M${x - 18} ${top + 4}H${x + 19}V${g - 8}H${x - 18}Z`, fill: 'none', stroke: CLAY, 'stroke-width': 0.7 }));
  grp.appendChild(s('path', { d: `M${x - 12} ${top + 8}H${x + 13}V${g - 12}H${x - 12}Z`, fill: PURPLE }));
  // Purple cloth draped over the front, a white necklace hanging below it.
  grp.appendChild(s('path', { d: `M${x - 20} ${top - 1}C${x - 17} ${top + 7} ${x - 15} ${top + 13} ${x - 13} ${top + 15}L${x - 9} ${top + 11}L${x - 5} ${top + 14}C${x - 6} ${top + 7} ${x - 5} ${top + 2} ${x - 2} ${top - 1}Z`, fill: PURPLE, stroke: INK, 'stroke-width': 0.6 }));
  let beads = '';
  for (let i = 0; i <= 8; i++) {
    const u = i / 8;
    const bx = x + 2 + u * 15, by = top + 1 + Math.sin(u * Math.PI) * 7;
    beads += `M${f1(bx - 1)} ${f1(by)}a1 1 0 1 0 2 0a1 1 0 1 0 -2 0`;
  }
  grp.appendChild(s('path', { d: beads, fill: WHITE, stroke: INK, 'stroke-width': 0.3 }));
  return grp;
}

/** The long straight war trumpet (salpinx), mouthpiece at (0,0), pointing +x. */
function salpinx(): SVGGElement {
  const g = s('g', { class: 'avlis-salpinx' });
  g.appendChild(s('path', { d: 'M0 -1.1H34L41 -4.6V4.6L34 1.1H0Z', fill: INK }));
  g.appendChild(s('path', { d: 'M8 -1.6V1.6M20 -1.6V1.6M31 -1.6V1.6', stroke: CLAY, 'stroke-width': 0.6 }));
  return g;
}

export const scene: SceneFactory = (ctx) => {
  const st = stage(ctx);
  const world = s('g', { class: 'avlis' });
  ctx.root.appendChild(world);

  /* =================== Tableau A: the harbour =================== */
  const A = s('g', { class: 'avlis-harbour' });
  world.appendChild(A);
  A.appendChild(fillers([[-24, -132], [78, -138], [132, -84], [-70, -140], [-150, -40]], 4.4));
  const sunG = sun(108, -112, 11);
  A.appendChild(sunG);
  const title = inscription('ΑΥΛΙΣ', 20, -124, { size: 10, align: 'middle' });
  A.appendChild(title);
  const birdsA = [flyingBird(52, -92, 0.9), flyingBird(84, -76, 0.7), flyingBird(-30, -104, 0.75)];
  birdsA.forEach((b) => A.appendChild(b.g));

  // The wind (drawn in beat 2), behind the rigging.
  const windLayer = s('g', { class: 'avlis-wind', opacity: 0 });
  const gusts: SVGPathElement[] = [];
  const gustSpec: Array<[number, number, number, number, number]> = [
    [-150, -40, 110, 5, 7], [-120, -2, 130, 4, 6], [-60, -76, 120, 5, 7], [-10, -30, 140, 4, 6], [40, -110, 90, 4, 6], [60, -58, 100, 3, 5], [-110, -104, 70, 4, 6],
  ];
  gustSpec.forEach(([x, y, L, a, r], i) => {
    const p = s('path', { d: windPath(x, y, L, a, r, 1, i % 2 === 0), fill: 'none', stroke: INK, 'stroke-width': 1.6, 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': '0.7 0.3' });
    gusts.push(p);
    windLayer.appendChild(p);
  });
  A.appendChild(windLayer);

  // The fleet: three ranks of black ships, sails brailed up to the yards.
  const fleetG = s('g', { class: 'avlis-fleet' });
  A.appendChild(fleetG);
  const mk = (o: GalleyOptions) => new Galley({ y: WL, halo: true, rig: { furl: 1, fill: 0, breathe: 0.5, flag: 0.15 }, pennant: true, ...o });
  // Archaic "team" composition: equal ships overlapping along one waterline,
  // each bow standing out beyond the next; a lower rank behind for more masts.
  const farMasts = [70, 66, 72, 67, 71, 68, 70];
  const nearMasts = [76, 72, 78, 73, 75, 77];
  // Ranks are listed back to front; the first two of each wait behind the shore
  // (hidden) and join the procession when the fleet sails.
  const far = [170, 126, 82, 38, -6, -50, -94].map((x, k) =>
    mk({ x, scale: 0.9, mast: farMasts[k], sailH: 38, oars: 0, phase: 0.13 + k * 0.21 }),
  );
  const near = [102, 58, 14, -30, -74, -118].map((x, k) =>
    mk({ x, scale: 1.35, mast: nearMasts[k], sailH: 44, crew: 6, oars: 11, phase: 0.61 + k * 0.29 }),
  );
  const reserves = [...far.slice(5), ...near.slice(4)];
  // The back rank is still arriving when the cup rises: it rows in during beat 0.
  const LATE = 200;
  const latecomers = far.slice(0, 5).reverse();
  latecomers.forEach((gl) => (gl.x += LATE));
  reserves.forEach((gl) => gsap.set(gl.g, { opacity: 0 }));
  const ranks = [far, near];
  const ships = [...far, ...near];
  ranks.forEach((rank) => {
    const rg = s('g');
    rank.forEach((gl) => rg.appendChild(gl.g));
    fleetG.appendChild(rg);
  });

  // The sea runs in front of the hulls.
  const sea = new RollingSea(WL - 3, { h: 10, ripples: 18, seed: 5 });
  A.appendChild(sea.g);

  // Dolphins scratched into the dark water, swimming slowly.
  const swimmers = [
    [-20, 118, 0.9],
    [70, 136, 0.75],
  ].map(([x, y, k]) => {
    const w = s('g');
    w.appendChild(dolphin(true));
    A.appendChild(w);
    return puppet(w, { x, y, s: k, r: 4, o: 0.75 });
  });
  // Leaping dolphins for the departure (hidden until beat 3).
  const dolphins = [0, 1].map(() => {
    const w = s('g');
    w.appendChild(dolphin());
    A.appendChild(w);
    return puppet(w, { o: 0, s: 0.95 });
  });

  // The shore: Agamemnon by the altar.
  const shore = s('g', { class: 'avlis-shore' });
  A.appendChild(shore);
  shore.appendChild(
    s('path', {
      d: `M-200 ${SHORE}H-92C-86 ${SHORE} -82 ${SHORE + 3} -78 ${SHORE + 8}C-74 ${SHORE + 14} -72 ${SHORE + 24} -68 ${SHORE + 34}L-64 220H-200Z`,
      fill: INK,
    }),
  );
  shore.appendChild(s('path', { d: `M-160 ${SHORE + 10}q20 -3 40 0M-150 ${SHORE + 22}q26 -4 54 1M-170 ${SHORE + 36}q30 -4 70 2`, fill: 'none', stroke: CLAY, 'stroke-width': 0.8, opacity: 0.6 }));
  const alt = altar(ALTAR_X, SHORE);
  shore.appendChild(alt.g);
  const AX = -120;
  const agaWrap = s('g', { transform: fillAbout(1.42, SHORE, AX) });
  shore.appendChild(agaWrap);
  const agaPose = pose({ ...POSES.stand(AX, SHORE), armF: [100, -14], armB: [40, 40] });
  const aga = new Figure({ head: 'bearded', hat: 'helmet', garment: 'long', garmentColor: PURPLE, cloak: true, cloakColor: INK }, agaPose);
  // The sceptre, planted ahead of him, held in the far hand (drawn under the figure).
  const sceptreX = AX + 16;
  aga.set({ armB: armTo(aga, 'B', [sceptreX - 1.5, SHORE - 60], 1) });
  const sceptre = s('g');
  sceptre.appendChild(s('path', { d: `M${sceptreX} ${SHORE}L${sceptreX} ${SHORE - 122}`, stroke: INK, 'stroke-width': 1.6, 'stroke-linecap': 'round' }));
  sceptre.appendChild(s('path', { d: `M${sceptreX} ${SHORE - 121}c-4 -2 -5 -7 -2 -10c1 3 2 3 2 3c0 0 1 0 2 -3c3 3 2 8 -2 10Z`, fill: INK }));
  agaWrap.append(sceptre, aga.g);
  const agaLabel = inscription('ΑΓΑΜΕΜΝΩΝ', -68, -126, { size: 5.8, angle: 90 });
  shore.appendChild(agaLabel);

  /* =================== Tableau B: Skyros =================== */
  const B = s('g', { class: 'avlis-skyros', opacity: 0, visibility: 'hidden' });
  world.appendChild(B);
  B.appendChild(exergue(GB, { band: 'tongues' }));
  B.appendChild(fillers([[-40, -120], [30, -138], [128, -92], [-128, -70]], 4.4));
  const Bf = s('g', { transform: fillAbout(1.27, GB) });
  B.appendChild(Bf);
  Bf.appendChild(column(-128, GB, 124, 13));
  // A mirror and a sash hang on the palace wall.
  Bf.appendChild(s('path', { d: 'M-90 -74v8M-90 -66a5 5 0 1 0 0.1 0Z', stroke: INK, 'stroke-width': 1.2, fill: INK }));
  Bf.appendChild(s('path', { d: 'M-82 -74C-80 -70 -78 -62 -80 -52M-78 -74C-76 -68 -74 -62 -75 -54', stroke: PURPLE, 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }));
  const chestX = 34;
  Bf.appendChild(giftChest(chestX, GB));
  // Shield leaning on the chest, spear beside it.
  const shieldG = s('g');
  shieldG.appendChild(shield([0, 0], 13.5, 'star'));
  const shieldHome: Vec = [chestX - 30, GB - 14];
  shieldG.setAttribute('transform', `translate(${shieldHome[0]} ${shieldHome[1]})`);
  const spearB = new Spear();
  const spearHome: [Vec, Vec] = [[chestX - 44, GB], [chestX - 18, GB - 92]];
  spearB.set(spearHome[0], spearHome[1]);
  Bf.append(spearB.g, shieldG);

  const maid1 = new Figure({ head: 'woman', garment: 'peplos', garmentColor: PURPLE, hat: 'diadem' }, pose({ ...POSES.stand(-104, GB), armF: [58, 64], armB: [20, 70], head: 6 }));
  const maid2 = new Figure({ head: 'woman', garment: 'peplos', garmentColor: INK }, pose({ ...POSES.stand(-66, GB), lean: 6, head: 12, armF: [70, 30], armB: [30, 60] }));
  const achX = -26;
  const achilles = new Figure({ head: 'youth', hat: 'veil', garment: 'long', garmentColor: PURPLE }, pose({ ...POSES.stand(achX, GB), head: 10, armF: [40, 40], armB: [10, 30] }));
  const odyX = 92;
  const ody = new Figure({ hat: 'pilos', garment: 'short', garmentColor: INK, cloak: true, cloakColor: PURPLE, facing: -1 }, pose({ ...POSES.stand(odyX, GB), armF: [60, 50], armB: [-10, 20] }));
  const trumpet = salpinx();
  const trumpetG = s('g', { opacity: 0 });
  trumpetG.appendChild(trumpet);
  const blast = s('g', { class: 'avlis-blast', opacity: 0 });
  for (let i = 0; i < 3; i++) blast.appendChild(s('path', { d: `M0 ${-6 - i * 5}Q${5 + i * 4} 0 0 ${6 + i * 5}`, fill: 'none', stroke: WHITE, 'stroke-width': 1.6, 'stroke-linecap': 'round' }));
  Bf.append(maid1.g, maid2.g, achilles.g, ody.g, trumpetG, blast);
  const achLabel = inscription('ΑΧΙΛΛΕΥΣ', -30, -64, { size: 7, align: 'middle' });
  achLabel.style.opacity = '0';
  const odyLabel = inscription('ΟΔΥΣΣΕΥΣ', 113, -30, { size: 5.8, angle: 90 });
  Bf.appendChild(odyLabel);
  B.appendChild(achLabel);
  // The disguise: a veil that flies off.
  const veilEl = s('path', { d: 'M-3 -9.4C4 -11 8.4 -7.6 6.8 -4.4C2 -7 -3 -7.4 -6.6 -2C-8.4 4 -9.6 12 -12 20C-14.6 13 -12.6 0 -10 -5C-8 -8.6 -5.6 -9.6 -3 -9.4Z', fill: INK });
  const veilG = s('g');
  veilG.appendChild(veilEl);
  Bf.appendChild(veilG);
  const veil = puppet(veilG, { o: 0 });

  /** The trumpet leaves the lips a little above the line of the face. */
  const TRUMPET_TILT = -14;
  /** Place the trumpet at Odysseus's lips (figure-local → tableau coordinates). */
  const placeTrumpet = () => {
    const hf = headFrame(ody);
    const m = hf.at(8.4, 3.2);
    const wx = 2 * ody.pose.x - m[0];
    const ang = 180 - (hf.a + TRUMPET_TILT);
    trumpetG.setAttribute('transform', `translate(${f1(wx)} ${f1(m[1])}) rotate(${f1(ang)})`);
    const bell: Vec = [wx + Math.cos((ang * Math.PI) / 180) * 44, m[1] + Math.sin((ang * Math.PI) / 180) * 44];
    blast.setAttribute('transform', `translate(${f1(bell[0])} ${f1(bell[1])}) rotate(${f1(ang)})`);
  };
  /** Odysseus's pose with the trumpet at his lips, the near hand on it. */
  const blowPose = (() => {
    const p = pose({ ...ody.pose, head: -18, armB: [30, 60] });
    const hf = headFrame(ody, p);
    const a = ((hf.a + TRUMPET_TILT) * Math.PI) / 180;
    const m = hf.at(8.4, 3.2);
    p.armF = armTo(ody, 'F', [m[0] + Math.cos(a) * 14, m[1] + Math.sin(a) * 14 + 1.5], -1, p);
    return p;
  })();

  /** Keep shield and spear in Achilles' hands while he moves. */
  const armed = { on: 0 };
  const placeArms = () => {
    if (!armed.on) return;
    const hB = achilles.hand('B');
    const hF = achilles.hand('F');
    const k = armed.on;
    const sx = lerp(shieldHome[0], hB[0] + 3, k), sy = lerp(shieldHome[1], hB[1] - 2, k);
    shieldG.setAttribute('transform', `translate(${f1(sx)} ${f1(sy)})`);
    // Spear held overhand, pointing forward and a little down.
    const dir: Vec = [Math.cos(0.2), Math.sin(0.2)];
    const butt: Vec = [hF[0] - dir[0] * 34, hF[1] - dir[1] * 34];
    const tip: Vec = [hF[0] + dir[0] * 58, hF[1] + dir[1] * 58];
    spearB.set(
      [lerp(spearHome[0][0], butt[0], k), lerp(spearHome[0][1], butt[1], k)],
      [lerp(spearHome[1][0], tip[0], k), lerp(spearHome[1][1], tip[1], k)],
    );
  };

  /* =================== Animation state =================== */
  const S = {
    furl: 1,
    fill: 0,
    amp: 0.85,
    speed: 7,
    wind: 0,
    heel: 0,
    flag: 0.15,
    flame: 0,
    rowing: 0,
  };
  let lastT = 0;
  const frame = (t: number) => {
    const dt = clamp(t - lastT, 0, 0.1);
    lastT = t;
    // Nothing to animate while the harbour is hidden behind the Skyros tableau.
    if (A.style.visibility === 'hidden') return;
    sea.offset -= dt * S.speed;
    sea.amp = S.amp;
    sea.place();
    for (const gl of ships) {
      gl.rig.furl = S.furl;
      gl.rig.fill = S.fill;
      gl.rig.flag = S.flag;
      const ph = gl.phase * 6.283;
      gl.bob = Math.sin(t * 1.25 + ph) * 1.1 * (0.4 + S.amp * 0.8);
      gl.roll = Math.sin(t * 0.9 + ph) * 1.4 * (0.3 + S.amp * 0.7) + S.heel;
      gl.place();
      gl.draw(t);
    }
    windLayer.setAttribute('opacity', f1(clamp(S.wind * 1.4, 0, 1)));
    gusts.forEach((p, i) => {
      const off = (((-t * (0.35 + S.wind * 0.55) + i * 0.17) % 1) + 1) % 1;
      p.setAttribute('stroke-dashoffset', String(Math.round(off * 1000) / 1000));
    });
    // Flames lean with the wind.
    alt.fire.setAttribute('transform', `translate(${ALTAR_X} ${SHORE - 29}) scale(0.62) skewX(${f1(S.flame * 28 + Math.sin(t * 9) * 3)})`);
    birdsA.forEach((b, i) => b.wings.setAttribute('transform', `scale(1 ${f1(Math.sin(t * 7 + i * 2) * 0.9)})`));
  };
  const clock = { t: 0 };
  st.loop(gsap.to(clock, { t: 3600, duration: 3600, ease: 'none', repeat: -1, onUpdate: () => frame(clock.t) }));
  frame(0);
  const redraw = () => frame(clock.t);
  // Drifting birds.
  birdsA.forEach((b, i) => st.loop(gsap.to(b.g, { x: i % 2 ? '-=14' : '+=16', y: i % 2 ? '+=6' : '-=5', duration: 4 + i, ease: 'sine.inOut', yoyo: true, repeat: -1 })));
  swimmers.forEach((sw, k) =>
    st.loop(gsap.to(sw.p, { y: '+=4', r: -3, x: '+=8', duration: 2.6 + k * 0.7, ease: 'sine.inOut', yoyo: true, repeat: -1, onUpdate: sw.apply })),
  );
  st.loop(gsap.to(alt.fire.querySelectorAll('.kit-flame__tongue'), { scaleY: 0.82, transformOrigin: '50% 100%', duration: 0.35, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.12 }));

  const swap = (from: SVGGElement, to: SVGGElement) => {
    const tl = st.timeline();
    tl.to(from, { opacity: 0, duration: 0.7, ease: 'power2.in' })
      .set(from, { visibility: 'hidden' })
      .set(to, { visibility: 'visible' })
      .fromTo(to, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.out' });
    return tl;
  };

  return {
    enter() {
      const tl = st.timeline();
      tl.from(fleetG, { x: 60, opacity: 0, duration: 1.2, ease: 'power3.out' })
        .from(shore, { x: -40, opacity: 0, duration: 1, ease: 'power3.out' }, 0.15)
        .from([title, agaLabel], { opacity: 0, duration: 0.8 }, 0.7);
      return st.play(tl);
    },

    async beat(i) {
      if (i === 0) {
        // More ships row in to join the muster; Agamemnon lifts his hand over the fleet.
        aga.to({ armF: [112, -30], head: -4 }, { duration: 1 });
        const tl = st.timeline();
        latecomers.forEach((gl, k) => tl.to(gl, { x: gl.x - LATE, duration: 1.7, ease: 'power2.out' }, k * 0.14));
        tl.to(S, { flag: 0.45, duration: 1.2 }, 0.4);
        return st.play(tl);
      }
      if (i === 1) {
        // Skyros: the pedlar's trumpet and the maiden who seizes the arms.
        await st.play(swap(A, B));
        const tl = st.timeline();
        tl.call(() => {
          placeTrumpet();
          ody.to(blowPose, { duration: 0.45, onUpdate: placeTrumpet });
        })
          .to(trumpetG, { opacity: 1, duration: 0.3 }, 0.05)
          .call(() => ctx.audio.sfx('arrive'), [], 0.5)
          .to(blast, { opacity: 1, duration: 0.1 }, 0.5)
          .fromTo(blast.children, { scale: 0.4, transformOrigin: '0% 50%' }, { scale: 1.5, duration: 0.8, stagger: 0.12, ease: 'power2.out' }, 0.5)
          .to(blast, { opacity: 0, duration: 0.5 }, 1.3)
          .call(() => {
            maid1.to({ lean: -12, head: -8, armF: [150, 30], armB: [135, 40] }, { duration: 0.5 });
            maid2.to({ lean: -14, head: -14, armF: [160, 20], armB: [120, 50], legF: [16, 4] }, { duration: 0.5 });
            // Off with the veil — it is a youth.
            const hf = headFrame(achilles);
            Object.assign(veil.p, { x: hf.c[0], y: hf.c[1], r: hf.a, o: 1 });
            veil.apply();
            achilles.style.hat = 'none';
            achilles.render();
            st.to(veil.p, { x: hf.c[0] - 26, y: hf.c[1] - 30, r: hf.a - 70, o: 0, duration: 0.9, ease: 'power2.out', onUpdate: veil.apply });
            armed.on = 0.0001;
            gsap.to(armed, { on: 1, duration: 0.6, ease: 'power2.inOut', onUpdate: placeArms });
            achilles.to({ ...POSES.lunge(achX + 8, GB), lean: 8, head: -4, armF: [168, 14], armB: [78, 58] }, { duration: 0.6, onUpdate: placeArms });
          }, [], 0.75)
          .to(achLabel, { opacity: 1, duration: 0.6 }, 1.4);
        return st.play(tl);
      }
      if (i === 2) {
        // Back at Aulis: the sails are let down, but they hang slack on a flat sea.
        const tl = swap(B, A);
        tl.to(S, { furl: 0, duration: 1.1, ease: 'power2.inOut', onUpdate: redraw }, 0.9)
          .to(S, { amp: 0.28, speed: 2, flag: 0, duration: 1.2, onUpdate: redraw }, 0.6);
        // He lifts his hand to the sky in prayer to Artemis.
        aga.to({ armF: [148, -24], head: -18, grip: 0 }, { duration: 0.9, delay: 1.2 });
        await st.play(tl);
        let calm = true;
        await ctx.hold({
          label: 'Rüzgârı bekle',
          seconds: 3.2,
          onProgress: (p) => {
            S.fill = p;
            S.amp = 0.28 + p * 0.9;
            S.speed = 2 + p * 22;
            S.wind = p;
            S.heel = p * 2.4;
            S.flag = p;
            S.flame = p;
            if (calm && p > 0.25) {
              calm = false;
              ctx.audio.sfx('wind');
            }
            if (ctx.reduced) redraw();
          },
        });
        ctx.audio.sfx('depart');
        ships.forEach((gl) => st.loop(gl.row(1)));
        aga.to({ armF: [112, -30], head: -4, grip: 1 }, { duration: 0.6 });
        const done = st.timeline();
        done.to(S, { fill: 1, amp: 1.15, speed: 26, wind: 1, heel: 2.4, flag: 1, flame: 1, duration: 0.5, onUpdate: redraw });
        return st.play(done);
      }
      if (i === 3) {
        // The fleet sails for Troy: the shore falls behind, dolphins leap alongside.
        const tl = st.timeline();
        tl.to(shore, { x: -170, duration: 2.6, ease: 'power2.in' }, 0)
          .to(shore, { opacity: 0, duration: 0.9 }, 1.6)
          .to(reserves.map((gl) => gl.g), { opacity: 1, duration: 0.9 }, 0.2)
          .to(far, { x: '+=52', duration: 2.6, ease: 'power1.inOut', onUpdate: redraw }, 0)
          .to(near, { x: '+=74', duration: 2.6, ease: 'power1.inOut' }, 0)
          .to(S, { speed: 40, duration: 1.2 }, 0)
          .to(title, { opacity: 0.25, duration: 1 }, 0.4);
        dolphins.forEach((d, k) => {
          const x0 = -60 + k * 84;
          const t0 = 0.6 + k * 0.55;
          tl.set(d.p, { x: x0, y: WL + 24, r: -40, o: 1 }, t0)
            .to(d.p, { x: x0 + 34, y: WL - 34, r: -6, duration: 0.55, ease: 'power1.out', onUpdate: d.apply }, t0)
            .to(d.p, { x: x0 + 70, y: WL + 26, r: 44, duration: 0.55, ease: 'power1.in', onUpdate: d.apply }, t0 + 0.55)
            .set(d.p, { o: 0, onComplete: d.apply }, t0 + 1.12);
        });
        ctx.audio.sfx('depart');
        return st.play(tl);
      }
    },

    destroy() {
      st.destroy();
    },
  };
};
