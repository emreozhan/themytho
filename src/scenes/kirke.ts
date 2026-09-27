/**
 * ΙΑʹ Aiaia — Kirke.
 * Tableau A: Kirke in her palace with tame lions and wolves; the companions
 * drink her brew and a touch of her wand turns them into swine (their heads
 * first, as the vase painters show them).
 * Tableau B: in the wood, Hermes swoops down and gives Odysseus the moly.
 * Tableau A again: the drug fails, the sword is drawn, Kirke kneels, the swine
 * become men; a year of feasting, then she points the way to the dead.
 */
import { s } from '../lib/dom';
import { gsap } from '../lib/motion';
import { POSES, pose, INK, CLAY, WHITE, PURPLE, type Pose } from '../art/figure';
import { Beast } from '../art/animals';
import { exergue, inscription, fillers, oliveTree, reeds } from '../art/kit';
import { meanderStripPath } from '../art/ornaments';
import { stage } from './tools';
import type { SceneFactory } from '../story/types';
import { Actor, shimmer, burst, sparkPath, type PartName } from './kirke.rig';
import { lion, wolf, moly, palace, door, skyphos, cup, wand, sword, krater, garland, MAN_HEAD, YOUTH_HEAD, PIG_HEAD, pigFeatures } from './kirke.art';
import { makeHermes, swoop, flyingPose } from './kirke.hermes';

const GROUND = 90;
const KA = 1.22;
const KB = 1.42;
const fill = (k: number) => `translate(0 ${GROUND}) scale(${k}) translate(0 ${-GROUND})`;

/** A companion on all fours, on the way to becoming a pig (facing -1 frame). */
const allFours = (x: number): Pose =>
  pose({ x, y: GROUND - 33, lean: 70, head: -56, armF: [4, 6], armB: [-6, 8], legF: [36, 86], legB: [14, 72], footF: 16, footB: 6, grip: 1 });

/** Pigs stand at slightly different depths so the herd does not merge into one mass. */
const PIG_LIFT = [0, 6, 1.5];

const FACE_PARTS: PartName[] = ['beard', 'hairBack', 'hat', 'hatDetail', 'faceLines', 'eye'];

interface Companion {
  a: Actor;
  human: string;
  headG: SVGGElement;
  skull: SVGPathElement;
  feats: SVGGElement;
  cup: SVGGElement;
  wreath: SVGGElement;
  pig: Beast;
  x: number;
}

/** Wreath of leaves in added white and purple, in head-local coordinates. */
function wreathMark(): SVGGElement {
  const g = s('g', { class: 'kirke-wreath', opacity: 0 });
  let d = '';
  let d2 = '';
  for (let i = 0; i < 6; i++) {
    const x = -7.4 + i * 2.6;
    const y = -7.2 - Math.sin((i / 5) * Math.PI) * 2.2;
    d += `M${x.toFixed(1)} ${y.toFixed(1)}q1.2 -3.2 3 -2z`;
    d2 += `M${x.toFixed(1)} ${y.toFixed(1)}q1.6 2 3.2 0.6z`;
  }
  g.appendChild(s('path', { d: 'M-8 -5.6C-4 -8.6 2 -10.6 7 -8.6', fill: 'none', stroke: PURPLE, 'stroke-width': 1.1 }));
  g.appendChild(s('path', { d, fill: WHITE }));
  g.appendChild(s('path', { d: d2, fill: PURPLE }));
  return g;
}

export const scene: SceneFactory = (ctx) => {
  const st = stage(ctx);
  const root = ctx.root;

  /* ---------------- Shared ground: a meander pavement ---------------- */
  const ground = exergue(GROUND, { band: 'none' });
  ground.appendChild(s('path', { d: meanderStripPath(360, 9, -180, GROUND + 6), fill: 'none', stroke: CLAY, 'stroke-width': 1, opacity: 0.8 }));
  ground.appendChild(s('line', { x1: -200, y1: GROUND + 18, x2: 200, y2: GROUND + 18, stroke: CLAY, 'stroke-width': 0.7, opacity: 0.6 }));
  root.appendChild(ground);

  /* ================= Tableau A: the palace ================= */
  const A = s('g', { class: 'kirke-a' });
  const pal = palace(GROUND, -84, 134);
  A.appendChild(pal.g);
  // The great door at the back of the hall, through which the scouts come.
  const DOOR_X = 64;
  const gate = door(DOOR_X * KA, GROUND, 50, 124);
  A.appendChild(gate.g);
  A.appendChild(fillers([[-92, -58], [-58, -72], [70, -66], [96, -46]], 4.2));
  const ta = s('g', { transform: fill(KA) });
  A.appendChild(ta);
  root.appendChild(A);

  // The tame beasts.
  const lionB = lion();
  lionB.g.setAttribute('transform', `translate(-92 ${GROUND}) scale(0.7)`);
  const wolfB = wolf();
  wolfB.g.setAttribute('transform', `translate(114 ${GROUND}) scale(-0.84 0.84)`);
  ta.append(lionB.g, wolfB.g);

  // Kirke, facing the door (right): her brew in one hand, the wand raised in the other.
  const kirke = new Actor({ head: 'woman', hat: 'diadem', garment: 'peplos', garmentColor: INK, cloak: false }, pose({ ...POSES.stand(-44, GROUND), armF: [74, 22], armB: [148, 8] }), 'kirke');
  const brew = skyphos();
  kirke.hold(brew, 'F', { mode: 'upright', angle: 0, along: 3.4 });
  const rod = wand();
  kirke.hold(rod.g, 'B', { mode: 'grip', angle: 34, along: 2 });
  const tipSpark = s('path', { d: sparkPath(4.2), fill: WHITE, opacity: 0.9 });
  rod.tip.appendChild(tipSpark);
  const kirkeLabel = inscription('ΚΙΡΚΗ', -62, -26, { size: 6.5, angle: 90 });
  ta.append(kirke.g, kirkeLabel);
  // Vapours of the brew.
  const vapour = s('g', { class: 'kirke-vapour' });
  brew.appendChild(vapour);

  // The companions, entering from the door on the right.
  const compSpecs = [
    { x: 6, head: 'bearded' as const, garment: 'short' as const, garmentColor: PURPLE, cloak: false },
    { x: 32, head: 'youth' as const, garment: 'short' as const, garmentColor: INK, cloak: true, cloakColor: PURPLE },
    { x: 58, head: 'bearded' as const, garment: 'none' as const, garmentColor: INK, cloak: true, cloakColor: INK },
  ];
  const comps: Companion[] = compSpecs.map((c, i) => {
    const a = new Actor({ head: c.head, garment: c.garment, garmentColor: c.garmentColor, cloak: c.cloak, cloakColor: c.cloakColor, facing: -1 }, pose({ ...POSES.stand(c.x, GROUND), armF: [40, 40], armB: [-10, 16] }), 'companion');
    const human = c.head === 'youth' ? YOUTH_HEAD : MAN_HEAD;
    const headG = s('g', { class: 'swine-head', opacity: 0 });
    const skull = s('path', { d: human, fill: INK });
    const feats = pigFeatures();
    feats.setAttribute('opacity', '0');
    headG.append(skull, feats);
    a.onHead(headG);
    const wr = wreathMark();
    a.onHead(wr);
    const kc = cup();
    a.hold(kc, 'F', { mode: 'upright', angle: 0, along: 2.6 });
    const pig = new Beast('pig', { x: c.x - 7, y: GROUND - PIG_LIFT[i], scale: 1.14, facing: -1 });
    pig.g.style.opacity = '0';
    a.g.style.opacity = '0';
    return { a, human, headG, skull, feats, cup: kc, wreath: wr, pig, x: c.x };
  });
  // Pigs behind, men in front (the first man nearest Kirke is painted last).
  for (let i = comps.length - 1; i >= 0; i--) ta.appendChild(comps[i].pig.g);
  for (let i = comps.length - 1; i >= 0; i--) ta.appendChild(comps[i].a.g);
  const pour = s('path', { d: '', fill: 'none', stroke: PURPLE, 'stroke-width': 1.8, 'stroke-linecap': 'round', opacity: 0 });
  ta.appendChild(pour);
  const fx = s('g', { class: 'kirke-fx' });
  ta.appendChild(fx);

  /* ---- Tableau A, second staging (beats 3–4): Odysseus left, Kirke centre, the swine right ---- */
  const a2 = s('g', { class: 'kirke-a2', opacity: 0 });
  ta.appendChild(a2);
  const kirke2 = new Actor({ head: 'woman', hat: 'diadem', garment: 'peplos', garmentColor: INK, facing: -1 }, pose({ ...POSES.stand(-2, GROUND), armF: [70, 26], armB: [60, 30] }), 'kirke');
  const brew2 = skyphos();
  kirke2.hold(brew2, 'F', { mode: 'upright', angle: 0, along: 3.4 });
  const rod2 = wand();
  kirke2.hold(rod2.g, 'B', { mode: 'grip', angle: 30, along: 2 });
  const kirke2Label = inscription('ΚΙΡΚΗ', 14, -24, { size: 6.5, angle: 90 });
  const ody = new Actor({ hat: 'pilos', garment: 'short', garmentColor: PURPLE, cloak: true, cloakColor: INK }, pose({ ...POSES.stand(-58, GROUND), armF: [60, 60], armB: [34, 46] }), 'odysseus');
  const odyCup = cup();
  ody.hold(odyCup, 'F', { mode: 'upright', along: 2.6 });
  const blade = sword();
  blade.style.opacity = '0';
  ody.hold(blade, 'F', { mode: 'grip', angle: -18, along: 1.2 });
  // Hermes's herb, held in his other hand: the milk-white flower shows beside him.
  const charm = moly();
  const charmHold = s('g', { class: 'kirke-charm' });
  const charmInner = s('g', { transform: 'translate(0 8) scale(0.42)' });
  charmInner.appendChild(charm.g);
  charmHold.appendChild(charmInner);
  ody.hold(charmHold, 'B', { mode: 'upright', angle: 0, along: 1 });
  const odyLabel = inscription('ΟΔΥΣΣΕΥΣ', -84, -30, { size: 6.5, angle: 90 });
  const odyLabel2 = inscription('ΟΔΥΣΣΕΥΣ', -36, 16, { size: 6, angle: 90 });
  odyLabel2.style.opacity = '0';
  // When she stands and points, her name runs above her head, clear of the raised cups.
  const kirke3Label = inscription('ΚΙΡΚΗ', -9, -22, { size: 6.2, align: 'middle' });
  kirke3Label.style.opacity = '0';
  a2.append(odyLabel, odyLabel2, kirke2Label, kirke3Label);
  // Odysseus faces left later (looking towards the dead): a mirrored twin.
  const odyL = new Actor({ hat: 'pilos', garment: 'short', garmentColor: PURPLE, cloak: true, cloakColor: INK, facing: -1 }, pose({ ...POSES.stand(-58, GROUND), armF: [50, 40], armB: [10, 20] }), 'odysseus');
  odyL.g.style.opacity = '0';
  const bowl = s('g', { transform: `translate(24 ${GROUND})`, opacity: 0 });
  bowl.appendChild(krater(0.9));
  // Kirke first, so that Odysseus and his sword are painted over her.
  a2.append(bowl, kirke2.g, ody.g, odyL.g);
  const fx2 = s('g', { class: 'kirke-fx2' });
  a2.appendChild(fx2);

  // The way to the dead: darkness gathering at the left edge, with fluttering shades.
  const dark = s('g', { class: 'kirke-dark', opacity: 0 });
  /** A bank of cloud whose right edge billows in scallops. */
  const bank = (edge: number, amp: number, phase: number): string => {
    let d = `M-200 -200L${edge} -200`;
    let y = -200;
    let k = phase;
    while (y < 200) {
      const h = 22 + ((k * 7) % 4) * 4;
      const bulge = edge + amp * (0.7 + 0.3 * Math.sin(k * 1.7));
      d += `C${bulge.toFixed(1)} ${(y + h * 0.1).toFixed(1)} ${bulge.toFixed(1)} ${(y + h * 0.9).toFixed(1)} ${edge} ${(y + h).toFixed(1)}`;
      y += h;
      k++;
    }
    return d + 'L-200 200Z';
  };
  dark.appendChild(s('path', { d: bank(-104, 16, 1), fill: INK, opacity: 0.55 }));
  dark.appendChild(s('path', { d: bank(-118, 14, 3), fill: INK }));
  dark.appendChild(s('path', { d: 'M-128 -120q10 8 2 18M-122 -40q9 8 1 18M-126 40q10 8 2 18', fill: 'none', stroke: CLAY, 'stroke-width': 0.7, opacity: 0.5 }));
  const shades = s('g', { class: 'kirke-shades' });
  const shadeD = 'M0 -6.4a2.2 2.4 0 1 1 0.2 0M-2 -3.6C-2.8 0 -2 4 0 7.4C2 4 2.8 0 2 -3.6ZM-1.6 -3L-7 -6.6L-4.4 -1.6ZM1.6 -3L6.6 -7.4L4.2 -1.8Z';
  const shadeSpots: Array<[number, number, number]> = [[-150, -70, 1.2], [-136, -20, 1], [-152, 30, 1.1], [-132, 62, 0.9]];
  for (const [x, y, k] of shadeSpots) shades.appendChild(s('path', { d: shadeD, fill: WHITE, opacity: 0.8, transform: `translate(${x} ${y}) scale(${k})` }));
  dark.appendChild(shades);
  root.appendChild(dark);

  /* ================= Tableau B: the wood, Hermes and the moly ================= */
  const B = s('g', { class: 'kirke-b', opacity: 0 });
  B.style.display = 'none';
  B.appendChild(fillers([[-24, -118], [44, -128], [-104, -84], [96, -104]], 4.4));
  const tb = s('g', { transform: fill(KB) });
  B.appendChild(tb);
  root.appendChild(B);
  const olive = oliveTree(112, GROUND, 1.0, 31);
  tb.appendChild(olive);
  tb.appendChild(reeds(-84, GROUND, 6, 18));
  tb.appendChild(reeds(70, GROUND, 4, 12));
  // Soil clip: whatever is below the ground stays hidden until pulled out.
  const soilId = `kirke-soil-${Math.random().toString(36).slice(2, 7)}`;
  const soil = s('clipPath', { id: soilId, 'data-scene': '' });
  const soilRect = s('rect', { x: -300, y: -400, width: 600, height: 400 + GROUND });
  soil.appendChild(soilRect);
  ctx.defs.appendChild(soil);
  const molyWrap = s('g', { 'clip-path': `url(#${soilId})` });
  const molyMove = s('g', { class: 'kirke-moly-move' });
  const herb = moly();
  molyMove.appendChild(herb.g);
  molyWrap.appendChild(molyMove);
  const MOLY_X = -6;
  const molyBase = { x: MOLY_X, y: GROUND, r: 0, k: 1.05 };
  const placeMoly = () => molyMove.setAttribute('transform', `translate(${molyBase.x.toFixed(2)} ${molyBase.y.toFixed(2)}) rotate(${molyBase.r.toFixed(2)}) scale(${molyBase.k})`);
  placeMoly();
  herb.g.style.opacity = '0';
  const molyLabel = inscription('ΜΩΛΥ', MOLY_X + 8, GROUND - 57, { size: 5, align: 'middle' });
  molyLabel.style.opacity = '0';
  const clods = s('g', { class: 'kirke-clods' });
  const odyB = new Actor({ hat: 'pilos', garment: 'short', garmentColor: PURPLE, cloak: true, cloakColor: INK, facing: -1 }, pose({ ...POSES.stand(42, GROUND), armF: [30, 20], armB: [-10, 20] }), 'odysseus');
  const bladeB = sword();
  odyB.hold(bladeB, 'B', { mode: 'grip', angle: -70, along: 1.2 });
  const odyBLabel = inscription('ΟΔΥΣΣΕΥΣ', 60, -24, { size: 5.6, angle: 90 });
  odyB.front.appendChild(odyBLabel);
  const hermes = makeHermes({ x: -50, ground: GROUND, facing: 1 });
  hermes.g.style.opacity = '0';
  tb.append(molyWrap, molyLabel, odyB.g, hermes.g, clods);

  /* ---------------- Helpers ---------------- */
  /** Part of a quadratic arc from (x1,y1) to (x2,y2) between parameters t0 and t1. */
  const arc = (x1: number, y1: number, x2: number, y2: number, lift: number, t0: number, t1: number): string => {
    const cx = (x1 + x2) / 2, cy = Math.min(y1, y2) - lift;
    let d = '';
    for (let k = 0; k <= 14; k++) {
      const t = t0 + ((t1 - t0) * k) / 14, u = 1 - t;
      d += `${k ? 'L' : 'M'}${(u * u * x1 + 2 * u * t * cx + t * t * x2).toFixed(1)} ${(u * u * y1 + 2 * u * t * cy + t * t * y2).toFixed(1)}`;
    }
    return d;
  };
  const fadeParts = (c: Companion) => c.a.parts_(FACE_PARTS);

  /** Drop a held prop to the floor (in tableau-A space). */
  const dropProp = (owner: Actor, el: SVGGElement, tl: gsap.core.Timeline, at: number, floorY = GROUND - 1) => {
    tl.call(() => {
      owner.release(el);
      const m = /translate\(([-\d.]+) ([-\d.]+)\)/.exec(el.getAttribute('transform') ?? '');
      const x0 = m ? +m[1] : 0, y0 = m ? +m[2] : 0;
      const p = { t: 0 };
      const f = owner.facing;
      tl.to(p, {
        t: 1,
        duration: 0.45,
        ease: 'power2.in',
        onUpdate: () => {
          const y = y0 + (floorY - y0) * p.t;
          el.setAttribute('transform', `translate(${(x0 + f * 6 * p.t).toFixed(2)} ${y.toFixed(2)}) scale(${f} 1) rotate(${(-100 * p.t).toFixed(1)})`);
        },
      }, tl.time());
    }, [], at);
  };

  /** A companion's head turns into a boar's; then he drops on all fours and is a pig. */
  const toSwine = (c: Companion, tl: gsap.core.Timeline, t0: number) => {
    tl.set(c.headG, { opacity: 1 }, t0)
      .set(c.a.part('head'), { opacity: 0 }, t0)
      .to(fadeParts(c), { opacity: 0, duration: 0.3 }, t0)
      .to(c.skull, { morphSVG: PIG_HEAD, duration: 0.9, ease: 'power2.inOut' }, t0)
      .to(c.feats, { opacity: 1, duration: 0.35 }, t0 + 0.55);
    tl.add(c.a.to({ armF: [150, 30], armB: [135, 45], lean: -8, head: -4 }, { duration: 0.4, ease: 'back.out(2)' }), t0 + 0.05);
    dropProp(c.a, c.cup, tl, t0 + 0.1);
    // A heartbeat as men with swine's heads, looking at their hands…
    tl.add(c.a.to({ armF: [100, 70], armB: [90, 80], head: 10, lean: 6 }, { duration: 0.5, ease: 'sine.inOut' }), t0 + 1.0);
    // …then down on all fours.
    tl.add(c.a.to(allFours(c.x), { duration: 0.55, ease: 'power2.in' }), t0 + 1.6);
    tl.add(shimmer(fx, c.x - 12, GROUND - 22, 20, 14, { n: 9, duration: 0.8, seed: 3 + c.x }), t0 + 1.95);
    tl.to(c.a.g, { opacity: 0, duration: 0.3 }, t0 + 2.17).to(c.pig.g, { opacity: 1, duration: 0.3 }, t0 + 2.1);
  };

  /** The reverse: a pig rises as a man again (taller and handsomer). */
  const toMan = (c: Companion, tl: gsap.core.Timeline, t0: number) => {
    tl.add(shimmer(fx2, c.x - 10, GROUND - 22, 22, 18, { n: 10, duration: 0.9, seed: 11 + c.x }), t0);
    tl.to(c.pig.g, { opacity: 0, duration: 0.3 }, t0 + 0.2).to(c.a.g, { opacity: 1, duration: 0.3 }, t0 + 0.15);
    tl.add(c.a.to({ ...POSES.stand(c.x, GROUND), armF: [36, 50], armB: [-8, 18] }, { duration: 0.75, ease: 'power2.out' }), t0 + 0.45);
    tl.to(c.skull, { morphSVG: c.human, duration: 0.75, ease: 'power2.inOut' }, t0 + 0.45)
      .to(c.feats, { opacity: 0, duration: 0.3 }, t0 + 0.45)
      .to(fadeParts(c), { opacity: 1, duration: 0.4 }, t0 + 0.85)
      .set(c.a.part('head'), { opacity: 1 }, t0 + 1.2)
      .set(c.headG, { opacity: 0 }, t0 + 1.2);
    const grow = { k: 1 };
    tl.to(grow, {
      k: 1.06,
      duration: 0.7,
      ease: 'power2.out',
      onUpdate: () => c.a.g.setAttribute('transform', `translate(${c.x} ${GROUND}) scale(${grow.k.toFixed(3)}) translate(${-c.x} ${-GROUND})`),
    }, t0 + 0.5);
  };

  // Idle life (tableau A).
  const idleA: gsap.core.Animation[] = [];
  const startIdleA = () => {
    idleA.push(st.loop(gsap.to(lionB.tail, { rotation: 7, svgOrigin: '-33 -9', duration: 1.3, yoyo: true, repeat: -1, ease: 'sine.inOut' })));
    idleA.push(st.loop(gsap.to(wolfB.head, { rotation: -5, svgOrigin: '10 -14', duration: 2.2, yoyo: true, repeat: -1, ease: 'sine.inOut' })));
    idleA.push(st.loop(gsap.to(lionB.head, { rotation: 3, svgOrigin: '10 -16', duration: 2.8, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 0.6 })));
    idleA.push(st.loop(gsap.fromTo(tipSpark, { scale: 0.5, rotation: 0, transformOrigin: '50% 50%' }, { scale: 1.15, rotation: 90, duration: 0.9, yoyo: true, repeat: -1, ease: 'sine.inOut' })));
    idleA.push(st.loop(gsap.to(pal.sunDisc, { rotation: 360, svgOrigin: `0 ${-84 - 11 - 19 - 20}`, duration: 60, repeat: -1, ease: 'none' })));
    // Vapours rising from the brew.
    const vtl = gsap.timeline({ repeat: -1 });
    for (let i = 0; i < 3; i++) {
      const p = s('path', { d: sparkPath(1.6), fill: WHITE, opacity: 0, transform: `translate(${-3 + i * 3} -11)` });
      vapour.appendChild(p);
      // GSAP's y is absolute here (it replaces the translate above): rise from the rim.
      vtl.fromTo(p, { opacity: 0, y: -11 }, { opacity: 0.9, y: -17, duration: 0.6, ease: 'sine.out' }, i * 0.5).to(p, { opacity: 0, y: -23, duration: 0.6, ease: 'sine.in' }, i * 0.5 + 0.6);
    }
    idleA.push(st.loop(vtl));
  };
  const pigIdle: gsap.core.Animation[] = [];
  const startPigIdle = () => {
    comps.forEach((c, i) => {
      const n = { v: 0 };
      const [lo, hi] = [[-2, 18], [-10, 4], [0, 14]][i];
      pigIdle.push(st.loop(gsap.to(n, { v: 1, duration: 1.3 + i * 0.35, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * 0.5, onUpdate: () => c.pig.nod(lo + n.v * (hi - lo)) })));
    });
  };

  // The entrance is built now (paused) so the cup rises already in its
  // before-state; enter() then plays it without a flash of the final picture.
  const intro = st.timeline({ paused: true });
  intro.from(pal.g, { y: -26, opacity: 0, duration: 1, ease: 'power3.out' })
    .from(gate.g, { opacity: 0, duration: 0.8 }, 0.2)
    .from(kirke.g, { x: -30, opacity: 0, duration: 0.9, ease: 'power3.out' }, 0.25)
    .from(kirkeLabel, { opacity: 0, duration: 0.6 }, 0.8)
    .from([lionB.g, wolfB.g], { opacity: 0, duration: 0.8, stagger: 0.2 }, 0.4)
    .from(A.querySelectorAll('.kit-fillers'), { opacity: 0, duration: 0.8 }, 0.6);

  return {
    enter() {
      startIdleA();
      intro.play();
      return st.play(intro);
    },

    async beat(i) {
      if (i === 0) return;

      if (i === 1) {
        // The scouts come in; Kirke pours her brew into their cups and they drink.
        const walkers = comps.map((c) => st.loop(c.a.walk(0.8, 18)));
        const tl = st.timeline();
        // The doors swing open; the men step out of the dark doorway.
        tl.to(gate.left, { scaleX: 0.16, transformOrigin: '0% 50%', duration: 0.7, ease: 'power2.inOut' }, 0)
          .to(gate.right, { scaleX: 0.16, transformOrigin: '100% 50%', duration: 0.7, ease: 'power2.inOut' }, 0);
        tl.call(() => ctx.audio.sfx('thud'), [], 0.1);
        comps.forEach((c, k) => {
          const from = DOOR_X + 4 - c.x;
          const at = 0.35 + k * 0.28;
          tl.fromTo(c.a.g, { x: from, opacity: 0 }, { x: 0, opacity: 1, duration: 1.4 - k * 0.3, ease: 'power1.out' }, at);
        });
        tl.call(() => walkers.forEach((w) => w.kill()), [], 1.75);
        comps.forEach((c) => tl.add(c.a.to({ ...POSES.stand(c.x, GROUND), armF: [74, 30], armB: [-10, 16] }, { duration: 0.4 }), 1.75));
        tl.to([gate.left, gate.right], { scaleX: 1, duration: 0.8, ease: 'power2.inOut' }, 1.9);
        // The lion and wolf fawn: tails and heads lift.
        tl.to(lionB.head, { rotation: -6, svgOrigin: '10 -16', duration: 0.5, yoyo: true, repeat: 1 }, 0.9);
        tl.add(kirke.to({ armF: [96, 4], lean: 4 }, { duration: 0.6 }), 1.6);
        // A stream of the brew arcs from her cup into the first man's cup.
        const flow = { p: 0 };
        tl.to(flow, {
          p: 2,
          duration: 0.85,
          ease: 'none',
          onStart: () => pour.setAttribute('opacity', '1'),
          onUpdate: () => {
            const a = kirke.handFrame('F', 3.4);
            const b = comps[0].a.handFrame('F', 2.6);
            pour.setAttribute('d', arc(a.x + 6, a.y - 10, b.x, b.y - 5, 12, Math.max(0, flow.p - 1), Math.min(1, flow.p)));
          },
          onComplete: () => pour.setAttribute('opacity', '0'),
        }, 2.25);
        tl.add(kirke.to({ armF: [74, 22], lean: 0 }, { duration: 0.5 }), 3.0);
        comps.forEach((c, k) => {
          tl.add(c.a.to({ armF: [26, 128], head: -16, lean: -6 }, { duration: 0.5, ease: 'power2.inOut' }), 3.1 + k * 0.18);
          tl.add(c.a.to({ head: -24 }, { duration: 0.6, ease: 'sine.inOut' }), 3.6 + k * 0.18);
        });
        await st.play(tl);

        // Gate: the wand.
        await ctx.tap(rod.g, { label: 'Kirke’nin değneğine dokun' });
        ctx.audio.sfx('magic');
        const hex = st.timeline();
        hex.add(kirke.to({ armB: [104, -6], lean: 8 }, { duration: 0.28, ease: 'power3.in' }), 0);
        hex.call(() => {
          const t = rod.tip.getCTM();
          const m = (ta as SVGGElement).getCTM();
          if (t && m) {
            const p = m.inverse().multiply(t);
            hex.add(burst(fx, p.e, p.f, 22), hex.time());
          }
        }, [], 0.28);
        hex.add(shimmer(fx, 24, GROUND - 60, 44, 30, { n: 26, duration: 1.4, seed: 5, size: 4 }), 0.3);
        comps.forEach((c, k) => toSwine(c, hex, 0.45 + k * 0.3));
        hex.add(kirke.to({ armB: [148, 8], lean: 0 }, { duration: 0.8, ease: 'power2.inOut' }), 2.2);
        // The new swine shuffle apart, grunting.
        const shuffle = (c: Companion, dx: number, at: number) => {
          const w = { x: c.pig.x };
          let walker: gsap.core.Tween | null = null;
          hex.to(w, {
            x: c.pig.x + dx,
            duration: 0.7,
            ease: 'sine.inOut',
            onStart: () => { walker = st.loop(c.pig.walk(1.6)); },
            onUpdate: () => c.pig.moveTo(w.x),
            onComplete: () => { walker?.kill(); c.pig.step(0); },
          }, at);
        };
        shuffle(comps[0], -8, 2.75);
        shuffle(comps[2], 9, 3.35);
        await st.play(hex);
        startPigIdle();
        return;
      }

      if (i === 2) {
        // Cut to the wood: Odysseus on his way; Hermes swoops down.
        idleA.forEach((a) => a.pause());
        const cut = st.timeline();
        cut.to(A, { opacity: 0, duration: 0.6, ease: 'power2.in' })
          .set(A, { display: 'none' })
          .set(B, { display: 'inline' })
          .fromTo(B, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: 'power2.out' });
        const walk = st.loop(odyB.walk(0.85, 18));
        cut.fromTo(odyB.g, { x: 90 }, { x: 0, duration: 1.6, ease: 'power1.out' }, 0.6);
        cut.call(() => walk.kill(), [], 2.2);
        cut.add(odyB.to({ ...POSES.stand(42, GROUND), armF: [30, 20], armB: [-10, 20] }, { duration: 0.3 }), 2.2);
        cut.set(hermes.g, { opacity: 1 }, 1.2);
        hermes.set(flyingPose(-50, GROUND));
        cut.add(swoop(hermes, [-110, -140], { ...POSES.stand(-50, GROUND), armF: [70, 20], armB: [30, 70] }, 1.8), 1.2);
        cut.call(() => ctx.audio.sfx('wind'), [], 1.25);
        // Hermes points at the ground: the herb grows.
        cut.add(hermes.to({ armF: [60, 10], lean: 6 }, { duration: 0.5 }), 3.0);
        cut.set(herb.g, { opacity: 1 }, 3.2)
          .fromTo(herb.stem, { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 1.0, ease: 'power2.out' }, 3.2)
          .fromTo(herb.leaves, { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.8, ease: 'back.out(1.6)' }, 3.3)
          .fromTo(herb.flower, { scale: 0, transformOrigin: '50% 0%' }, { scale: 1, duration: 0.6, ease: 'back.out(2)' }, 4.0)
          .to(molyLabel, { opacity: 1, duration: 0.6 }, 4.2);
        cut.add(shimmer(tb, MOLY_X + 10, GROUND - 40, 10, 8, { n: 6, duration: 0.8, seed: 21 }), 4.1);
        await st.play(cut);
        // Idle life in the wood: the olive stirs, the white bell nods.
        st.loop(gsap.to(olive, { rotation: 1.2, svgOrigin: `112 ${GROUND}`, duration: 3.2, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
        const nod = st.loop(gsap.to(herb.flower, { rotation: 7, svgOrigin: '9.4 -40.6', duration: 1.6, yoyo: true, repeat: -1, ease: 'sine.inOut' }));

        // Gate: pull the moly out of the ground.
        await ctx.tap(herb.g, { label: 'Moly otunu topraktan çek' });
        nod.pause();
        ctx.audio.sfx('thud');
        const pull = st.timeline();
        pull.add(hermes.to({ lean: 34, armF: [22, 10], legF: [20, 30], legB: [-12, 8], y: hermes.pose.y + 5 }, { duration: 0.45, ease: 'power2.inOut' }), 0);
        // Rise out of the soil: the black root appears, clods fly.
        pull.to(molyBase, { y: GROUND - 34, r: -6, duration: 0.8, ease: 'power2.out', onUpdate: placeMoly }, 0.45);
        pull.add(hermes.to({ lean: 4, armF: [70, 30], legF: [6, 4], legB: [-6, 4], y: hermes.pose.y }, { duration: 0.8, ease: 'power2.out' }), 0.45);
        pull.call(() => {
          for (let k = 0; k < 9; k++) {
            const c = s('circle', { cx: MOLY_X + gsap.utils.random(-5, 5), cy: GROUND - 2, r: gsap.utils.random(0.9, 1.8), fill: INK });
            clods.appendChild(c);
            const dx = gsap.utils.random(-22, 22);
            pull.to(c, { attr: { cx: `+=${dx}` }, duration: 0.7, ease: 'none' }, pull.time())
              .to(c, { attr: { cy: GROUND - gsap.utils.random(14, 30) }, duration: 0.32, ease: 'power2.out' }, pull.time())
              .to(c, { attr: { cy: GROUND - 1 }, duration: 0.38, ease: 'power2.in' }, pull.time() + 0.32)
              .to(c, { opacity: 0, duration: 0.8 }, pull.time() + 1.2);
          }
        }, [], 0.5);
        pull.set(soilRect, { attr: { y: -600, height: 1200 } }, 1.3);
        pull.to(molyLabel, { opacity: 0, duration: 0.3 }, 0.4);
        // Hand it over.
        const from = { x: 0, y: 0 };
        const give = { t: 0 };
        pull.call(() => {
          from.x = molyBase.x;
          from.y = molyBase.y;
        }, [], 1.3);
        pull.add(odyB.to({ armF: [84, 6], lean: 4 }, { duration: 0.6 }), 1.2);
        pull.to(give, {
          t: 1,
          duration: 0.8,
          ease: 'power2.inOut',
          onUpdate: () => {
            const h = odyB.handFrame('F', 1);
            molyBase.x = from.x + (h.x - from.x) * give.t;
            molyBase.y = from.y + (h.y + 4 - from.y) * give.t;
            molyBase.r = -6 + 14 * give.t;
            placeMoly();
          },
        }, 1.35);
        pull.add(odyB.to({ armF: [150, 20], lean: -4, head: -10 }, { duration: 0.6, ease: 'power2.out', onUpdate: () => {
          const h = odyB.handFrame('F', 1);
          molyBase.x = h.x;
          molyBase.y = h.y + 4;
          placeMoly();
        } }), 2.2);
        pull.add(hermes.to({ armF: [110, 30] }, { duration: 0.5 }), 2.2);
        pull.call(() => ctx.audio.sfx('success'), [], 2.3);
        pull.call(() => {
          const h = odyB.handFrame('F', 1);
          st.timeline().add(shimmer(tb, h.x - 2, h.y - 26, 10, 10, { n: 7, duration: 0.9, seed: 8 }));
        }, [], 2.6);
        await st.play(pull);
        return;
      }

      if (i === 3) {
        // Back in the hall: the drug fails, the sword is drawn, Kirke kneels, the swine are men again.
        pigIdle.forEach((a) => a.kill());
        // Re-stage: hide the first staging, show the second.
        [kirke.g, kirkeLabel, lionB.g, wolfB.g].forEach((el) => (el.style.opacity = '0'));
        const xs = [48, 70, 92];
        comps.forEach((c, k) => {
          c.x = xs[k];
          c.pig.moveTo(xs[k] - 7, GROUND - PIG_LIFT[k]);
          c.pig.nod(0);
          c.a.set(allFours(xs[k]));
          c.a.g.removeAttribute('transform');
          c.a.g.style.opacity = '0';
          c.cup.style.opacity = '0';
          c.a.hold(c.cup, 'F', { mode: 'upright', along: 2.6 });
        });
        a2.appendChild(fx2);
        a2.style.opacity = '1';
        const cut = st.timeline();
        cut.to(B, { opacity: 0, duration: 0.45, ease: 'power2.in' })
          .set(B, { display: 'none' })
          .set(A, { display: 'inline' })
          .fromTo(A, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' });
        idleA.forEach((a) => a.resume());
        // He drinks: nothing happens.
        cut.add(ody.to({ armF: [26, 128], head: -16, lean: -6 }, { duration: 0.45 }), 0.55);
        cut.add(kirke2.to({ armB: [124, 20], lean: -4 }, { duration: 0.35 }), 0.7);
        cut.add(kirke2.to({ armB: [72, 0], lean: 6 }, { duration: 0.2, ease: 'power3.in' }), 1.08);
        cut.call(() => ctx.audio.sfx('magic'), [], 1.1);
        cut.add(shimmer(fx2, -58, GROUND - 70, 14, 16, { n: 8, duration: 0.6, seed: 17 }), 1.22);
        cut.call(() => {
          // The herb flares: the spell glances off.
          const h = ody.handFrame('B', 1);
          cut.add(burst(fx2, h.x + 4, h.y - 14, 12), cut.time());
        }, [], 1.25);
        // Sword out and raised; Kirke runs in and clasps his knees.
        cut.to(odyCup, { opacity: 0, duration: 0.2 }, 1.45).set(blade, { opacity: 1 }, 1.5);
        cut.add(ody.to({ ...POSES.lunge(-54, GROUND), lean: 2, armF: [150, 30], armB: [30, 50] }, { duration: 0.4, ease: 'power3.out' }), 1.45);
        cut.call(() => ctx.audio.sfx('twang'), [], 1.5);
        cut.to([brew2, rod2.g], { opacity: 0, duration: 0.25 }, 1.6);
        cut.add(kirke2.to({ ...POSES.plead(-10, GROUND), armF: [58, 8], armB: [50, 16] }, { duration: 0.5, ease: 'power2.inOut' }), 1.6);
        cut.to(kirke2Label, { x: 8, y: 10, duration: 0.5 }, 1.6);
        cut.call(() => ctx.audio.sfx('magic'), [], 2.15);
        comps.forEach((c, k) => toMan(c, cut, 2.15 + k * 0.15));
        await st.play(cut);
        return;
      }

      if (i === 4) {
        // A year of feasting, then Kirke shows the way to the dead.
        ctx.hud.setYear(11, 1.4);
        const tl = st.timeline();
        const sw1 = garland([-122, -84], [-42, -84], 9, 0);
        const sw2 = garland([-42, -84], [42, -84], 9, 1);
        const sw3 = garland([42, -84], [122, -84], 9, 0);
        [sw1, sw2, sw3].forEach((g) => A.insertBefore(g, ta));
        tl.from([sw1, sw2, sw3], { y: -18, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'back.out(1.6)' }, 0);
        tl.to(bowl, { opacity: 1, duration: 0.5 }, 0.2);
        comps.forEach((c, k) => {
          tl.to(c.wreath, { opacity: 1, duration: 0.4 }, 0.3 + k * 0.1);
          tl.to(c.cup, { opacity: 1, duration: 0.3 }, 0.2);
          tl.add(c.a.to({ armF: [96, 44], head: -6, lean: -3 }, { duration: 0.45, ease: 'back.out(1.6)' }), 0.35 + k * 0.12);
        });
        tl.to(blade, { opacity: 0, duration: 0.3 }, 0);
        tl.add(ody.to({ ...POSES.stand(-58, GROUND), armF: [40, 30], armB: [34, 46] }, { duration: 0.5 }), 0);
        tl.call(() => ctx.audio.sfx('success'), [], 0.4);
        // Kirke rises and points west, into the dark.
        tl.add(kirke2.to({ ...POSES.stand(-4, GROUND), armF: [104, -8], armB: [10, 20], lean: -3, head: -4 }, { duration: 0.8, ease: 'power2.inOut' }), 1.1);
        tl.to(kirke2Label, { opacity: 0, duration: 0.4 }, 1.1).to(kirke3Label, { opacity: 1, duration: 0.6 }, 1.6);
        tl.to(dark, { opacity: 1, duration: 1.2, ease: 'power1.inOut' }, 1.4)
          .fromTo(dark, { x: -60 }, { x: 0, duration: 1.4, ease: 'power2.out' }, 1.4);
        tl.to(odyLabel, { opacity: 0, duration: 0.4 }, 1.5).to(odyLabel2, { opacity: 1, duration: 0.5 }, 2.0);
        tl.set(ody.g, { opacity: 0 }, 1.9).set(odyL.g, { opacity: 1 }, 1.9);
        tl.add(odyL.to({ head: -8, armF: [70, 30] }, { duration: 0.5 }), 1.95);
        tl.call(() => ctx.audio.sfx('ghost'), [], 1.6);
        await st.play(tl);
        // Relative: each shade already carries its own translate.
        st.loop(gsap.to(shades.children, { y: '-=6', duration: 1.2, stagger: 0.3, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
        return;
      }
    },

    destroy() {
      st.destroy();
    },
  };
};
