/**
 * Δʹ Tahta At — the Wooden Horse.
 * Beat 0: Epeios hammers the horse together while Athena stands by.
 * Beat 1: the chosen warriors climb into its belly; the hatch shuts; behind,
 *         the Achaean camp burns and the ships row away to Tenedos.
 * Beat 2: (drag) the Trojans haul the horse through the Scaean gate.
 * Beat 3: (tap) night inside Troy: the hatch opens, the warriors slide down a
 *         rope, and Sinon's beacon calls the fleet back from Tenedos.
 * Beat 4: Troy burns.
 */
import { s } from '../lib/dom';
import { gsap } from '../lib/motion';
import { smoothPath, type Vec } from '../lib/geometry';
import { Figure, POSES, pose, STAND_HEIGHT, INK, CLAY, WHITE, PURPLE } from '../art/figure';
import { exergue, inscription, fillers, flames, torch, nightVeil, stars, moon, glow, sea, SEA_TILE } from '../art/kit';
import { waveStripPath } from '../art/ornaments';
import { ship, rowing, BLACK_FIGURE } from '../art/ship';
import { stage } from './tools';
import { troyWalls } from './troya.walls';
import { woodenHorse } from './tahta-at.horse';
import { hut, ladder, Warrior, climbPose, peekingHead, flyingBird } from './tahta-at.art';
import { spearShape, poseTo, Halo, smokePath } from './troya.art';
import type { SceneFactory } from '../story/types';

const GROUND = 96;

/**
 * Athena's aegis: a short scaly cape over the shoulders with a fringe of
 * snakes and the Gorgon's head on the breast. Drawn inside the figure, under
 * her front arm.
 */
function aegisOf(fig: Figure): { update(): void } {
  const body = fig.g.firstChild as SVGGElement;
  const g = s('g', { class: 'aegis' });
  const cape = s('path', { fill: INK });
  const scales = s('path', { fill: 'none', stroke: CLAY, 'stroke-width': 0.45, opacity: 0.8 });
  const snakes = s('path', { fill: 'none', stroke: INK, 'stroke-width': 1.1, 'stroke-linecap': 'round' });
  const gorgon = s('g');
  gorgon.appendChild(s('circle', { r: 2.2, fill: WHITE }));
  gorgon.appendChild(s('path', { d: 'M-1 -0.6h0.01M1 -0.6h0.01M-1.1 0.9Q0 1.8 1.1 0.9', fill: 'none', stroke: INK, 'stroke-width': 0.5, 'stroke-linecap': 'round' }));
  g.append(cape, scales, snakes, gorgon);
  // Under the front arm and hand (the last two parts of the figure).
  body.insertBefore(g, body.children[body.children.length - 2]);
  const update = () => {
    const j = fig.joints();
    const at = (t: number, side: number): Vec => [j.P[0] + j.u[0] * 30 * t + j.fwd[0] * side, j.P[1] + j.u[1] * 30 * t + j.fwd[1] * side];
    const e = j.armB.E;
    const pts: Vec[] = [at(1.03, 2.2), at(0.95, 6.6), at(0.76, 7.4), at(0.6, 5.6), at(0.54, 2), at(0.58, -1.6), at(0.54, -5.2), [e[0] - 3.6, e[1] - 2], [e[0] - 5.4, e[1] - 8], at(0.95, -7.6), at(1.04, -3)];
    cape.setAttribute('d', smoothPath(pts, true, 0.3));
    let sc = '';
    for (const [t, n] of [[0.9, 5], [0.8, 5], [0.7, 4]] as const) {
      for (let k = 0; k < n; k++) {
        const p = at(t, -5 + k * 2.6);
        sc += `M${(p[0] - 1).toFixed(1)} ${p[1].toFixed(1)}q1 1.1 2 0`;
      }
    }
    scales.setAttribute('d', sc);
    let sn = '';
    for (const p of [at(0.6, 5.6), at(0.54, 2), at(0.58, -1.6), at(0.54, -5.2), [e[0] - 3.6, e[1] - 2] as Vec]) {
      sn += `M${p[0].toFixed(1)} ${p[1].toFixed(1)}q-1.2 1.6 0 3q1.2 1.4 -0.4 2.8`;
    }
    snakes.setAttribute('d', sn);
    const c = at(0.8, 3.4);
    gorgon.setAttribute('transform', `translate(${c[0].toFixed(1)} ${c[1].toFixed(1)})`);
  };
  update();
  return { update };
}

/** Flicker the tongues of a kit flame forever (registered as an idle loop by the caller). */
function flicker(fl: SVGGElement, speed = 1): gsap.core.Timeline {
  const tongues = fl.querySelectorAll<SVGPathElement>('.kit-flame__tongue');
  const tl = gsap.timeline({ repeat: -1, yoyo: true });
  tl.to(tongues, { scaleY: () => gsap.utils.random(0.72, 1.18), scaleX: () => gsap.utils.random(0.9, 1.08), transformOrigin: '50% 100%', duration: 0.22 / speed, ease: 'sine.inOut', stagger: 0.05 });
  return tl;
}

export const scene: SceneFactory = (ctx) => {
  const st = stage(ctx);
  const root = ctx.root;

  /* ================= Tableau A: the workshop by the ships ================= */
  const tA = s('g', { class: 'tableau-a' });
  root.appendChild(tA);
  tA.appendChild(fillers([[-122, -58], [-150, 24], [142, 30], [-62, -148]], 4.2));

  // Far behind: the sea with the Achaean ships, the shore with the huts.
  const camp = s('g', { class: 'camp' });
  const SEA_Y = -128;
  camp.appendChild(s('path', { d: waveStripPath(300, 6.4), transform: `translate(-190 ${SEA_Y})`, fill: INK }));
  camp.appendChild(s('rect', { x: -190, y: SEA_Y + 6, width: 280, height: 5.4, fill: INK }));
  const fleet: Array<{ wrap: SVGGElement; oars: SVGGElement }> = [];
  for (const [x, k] of [[-92, 0.36], [-34, 0.34]] as const) {
    const sp = ship({ palette: BLACK_FIGURE, sail: 'furled', oars: 7, crew: 5 });
    const wrap = s('g', { transform: `translate(${x} ${SEA_Y + 1}) scale(${-k} ${k})` });
    const mover = s('g');
    wrap.appendChild(sp.g);
    mover.appendChild(wrap);
    camp.appendChild(mover);
    fleet.push({ wrap: mover, oars: sp.oars });
  }
  const SHORE_Y = -88;
  camp.appendChild(s('path', { d: `M-160 ${SHORE_Y}H40`, stroke: INK, 'stroke-width': 1.3 }));
  const huts = [-116, -82, -48, -14].map((x) => {
    const h = hut(x, SHORE_Y, 1.05);
    camp.appendChild(h);
    return x;
  });
  // Fire and smoke for the burning camp (hidden until beat 1).
  const smoke = s('g', { class: 'smoke', opacity: 0 });
  const smokes = huts.map(() => s('path', { fill: INK, opacity: 0.32 }));
  smoke.append(...smokes);
  const fires = huts.map((x) => {
    const f = flames(0, 0, 0.5);
    const holder = s('g', { transform: `translate(${x} ${SHORE_Y - 6})` });
    const grow = s('g', { transform: 'scale(0)' });
    grow.appendChild(f);
    holder.appendChild(grow);
    return { holder, grow, f };
  });
  camp.append(smoke, ...fires.map((f) => f.holder));
  tA.appendChild(camp);

  tA.appendChild(exergue(GROUND, { band: 'tongues' }));

  const horseA = woodenHorse(ctx.defs, 'ta-horse-a');
  const HX = 14, HK = 1.06;
  horseA.g.setAttribute('transform', `translate(${HX} ${GROUND}) scale(${HK})`);
  const horseAw = s('g');
  horseAw.appendChild(horseA.g);
  tA.appendChild(horseAw);
  const DECK_Y = GROUND - 32 * HK;
  const toA = ([x, y]: Vec): Vec => [HX + x * HK, GROUND + y * HK];

  // Athena: helmeted, a long peplos, the aegis, her spear upright.
  const athena = new Figure({ head: 'woman', hat: 'helmet', garment: 'peplos', garmentColor: PURPLE }, pose({ ...POSES.stand(0, 0), armF: [24, 112], armB: [10, 20], head: 4 }));
  const athSpear = spearShape(128, 0.5);
  const aegis = aegisOf(athena);
  const athG = s('g', { transform: `translate(-118 ${GROUND}) scale(1.08)` });
  athG.append(athena.g, athSpear);
  const athW = s('g');
  athW.appendChild(athG);
  const placeSpear = () => {
    const w = athena.joints().armF.W;
    athSpear.setAttribute('transform', `translate(${(w[0] + 1).toFixed(1)} ${(w[1] - 1).toFixed(1)}) rotate(-88)`);
    aegis.update();
  };
  placeSpear();
  tA.appendChild(athW);

  // Epeios stands on the platform and hammers the horse's chest.
  const epStyle = { head: 'bearded' as const, garment: 'short' as const, garmentColor: PURPLE, facing: -1 as const };
  const epPose = pose({ ...POSES.stand(0, 0), lean: 6, legF: [16, 6], legB: [-14, 6], armF: [150, 20], armB: [60, 50] });
  const epHalo = new Halo(epStyle, epPose, 2.6);
  const epeios = new Figure(epStyle, epPose);
  const hammer = s('g', { class: 'mallet' });
  hammer.appendChild(s('path', { d: 'M-2 -1H15V1H-2Z', fill: INK }));
  hammer.appendChild(s('path', { d: 'M13 -5.6Q12.4 0 13 5.6H21Q21.8 0 21 -5.6Z', fill: INK, stroke: CLAY, 'stroke-width': 0.6 }));
  epeios.g.appendChild(hammer);
  const hammerHalo = s('g');
  hammerHalo.appendChild(s('path', { d: 'M-2 -1H15V1H-2ZM13 -5.6Q12.4 0 13 5.6H21Q21.8 0 21 -5.6Z', fill: CLAY, stroke: CLAY, 'stroke-width': 2.6, 'stroke-linejoin': 'round' }));
  epHalo.g.appendChild(hammerHalo);
  const placeHammer = () => {
    const j = epeios.joints();
    const w = j.armF.W;
    const tf = `translate(${w[0].toFixed(1)} ${w[1].toFixed(1)}) rotate(${(90 - j.armF.a).toFixed(1)})`;
    hammer.setAttribute('transform', tf);
    hammerHalo.setAttribute('transform', tf);
    epHalo.follow(epeios.pose);
  };
  placeHammer();
  const EP_X = 94;
  const epG = s('g', { transform: `translate(${EP_X} ${DECK_Y.toFixed(1)}) scale(0.86)` });
  epG.append(epHalo.g, epeios.g);
  const epW = s('g');
  epW.appendChild(epG);
  tA.appendChild(epW);

  const labAth = inscription('ΑΘΗΝΑ', -150, -52, { size: 6.5, angle: 90 });
  const labEp = inscription('ΕΠΕΙΟΣ', 128, -40, { size: 5.6, angle: 90 });
  const labHorse = inscription('ΙΠΠΟΣ', -40, -70, { size: 7.5 });
  tA.append(labAth, labEp, labHorse);
  gsap.set(athW, { x: -30, opacity: 0 });
  gsap.set(epW, { x: 30, opacity: 0 });
  gsap.set([labAth, labEp], { opacity: 0 });

  // Idle: the mallet rises and falls; chips fly.
  const chips = s('g', { class: 'chips' });
  tA.appendChild(chips);
  let strikes = 0;
  const strike = () => {
    const j = epeios.joints();
    const w = j.armF.W;
    const a = (j.armF.a * Math.PI) / 180;
    const hx = EP_X - (w[0] + Math.sin(a) * 18) * 0.86;
    const hy = DECK_Y + (w[1] + Math.cos(a) * 18) * 0.86;
    if (strikes++ < 4) ctx.audio.sfx('thud');
    for (let k = 0; k < 5; k++) {
      const c = s('path', { d: 'M0 0l2.4 -0.9l-0.7 1.8Z', fill: k % 2 ? WHITE : CLAY });
      const hold = s('g', { transform: `translate(${hx.toFixed(1)} ${hy.toFixed(1)})` });
      hold.appendChild(c);
      chips.appendChild(hold);
      st.timeline()
        .to(c, { x: gsap.utils.random(4, 18), y: gsap.utils.random(-14, -2), rotation: gsap.utils.random(-180, 180), duration: 0.32, ease: 'power2.out' })
        .to(c, { y: '+=22', opacity: 0, duration: 0.45, ease: 'power2.in', onComplete: () => hold.remove() });
    }
  };
  const hammering = st.timeline({ repeat: -1, repeatDelay: 0.3 });
  const epUp = pose({ ...epPose, lean: -4, armF: [196, 30] });
  const epDown = pose({ ...epPose, lean: 12, armF: [118, -8] });
  hammering
    .add(poseTo(epeios, epUp, { duration: 0.5, ease: 'power2.out', onUpdate: placeHammer }))
    .add(poseTo(epeios, epDown, { duration: 0.15, ease: 'power3.in', onUpdate: placeHammer }))
    .call(strike)
    .add(poseTo(epeios, { ...epDown, lean: 9, armF: [124, -4] }, { duration: 0.18, ease: 'power1.out', onUpdate: placeHammer }));
  st.loop(hammering);
  /** Idle loops that belong to tableaux A, B and C (stopped when the picture changes). */
  const loopsA: gsap.core.Animation[] = [];
  const loopsB: gsap.core.Animation[] = [];
  const loopsC: gsap.core.Animation[] = [];

  /* ---- Beat 1: the ladder and the chosen warriors ---- */
  const LADDER_FOOT: Vec = [-76, GROUND];
  const hatchSill = toA([horseA.hatch.x0 + 5, horseA.hatch.y0 + horseA.hatch.h]);
  const LADDER_TOP: Vec = [hatchSill[0], hatchSill[1] + 1];
  const ladderG = ladder(LADDER_FOOT, [LADDER_TOP[0] - 2, LADDER_TOP[1] - 4], 10, 10);
  const ladderW = s('g', { opacity: 0 });
  ladderW.appendChild(ladderG);
  tA.appendChild(ladderW);
  const climbers: Warrior[] = [
    new Warrior({ hat: 'pilos', garment: 'short', garmentColor: PURPLE }, POSES.walk(0, 0), 0.72, { device: null }),
    new Warrior({ hat: 'helmet', garment: 'short', garmentColor: INK }, POSES.walk(0, 0), 0.72, { device: 'star' }),
    new Warrior({ hat: 'helmet', garment: 'short', garmentColor: PURPLE }, POSES.walk(0, 0), 0.72, { device: 'dolphin' }),
    new Warrior({ hat: 'helmet', garment: 'short', garmentColor: INK }, POSES.walk(0, 0), 0.72, { device: 'tripod' }),
  ];
  const climbLayer = s('g', { class: 'climbers' });
  for (const w of climbers) {
    w.place(-190, GROUND);
    w.g.style.opacity = '0';
    climbLayer.appendChild(w.g);
  }
  tA.appendChild(climbLayer);
  const peeker = peekingHead(horseA.hatch.x0 + 13, horseA.hatch.y0 + 15, 1.05);
  peeker.style.opacity = '0';
  horseA.hatch.inside.appendChild(peeker);

  /* ================= Tableau B: the Scaean gate ================= */
  const GB = 94;
  const tB = s('g', { class: 'tableau-b' });
  tB.style.display = 'none';
  root.appendChild(tB);
  tB.appendChild(fillers([[-120, -70], [20, -148]], 4.2));
  const birds = [[-104, -112, 0.9], [-66, -128, 0.75], [-40, -98, 0.8]].map(([x, y, k]) => {
    const b = flyingBird(x, y, k);
    const drift = s('g');
    drift.appendChild(b.g);
    tB.appendChild(drift);
    return { ...b, drift };
  });
  const wallsB = troyWalls({ from: 42, to: 200, base: GB, height: 150, towers: [{ x: 90, w: 92, rise: 30 }], gate: { x: 90, w: 76, h: 126 }, seed: 12 });
  // Trojans on the gate tower, arms raised as the gift comes in.
  const towerB = wallsB.towers[0];
  const cheer = s('g', { class: 'cheer' });
  const cheerers = [[64, 1, 'bearded'], [82, -1, 'woman'], [102, 1, 'youth']] as const;
  const cheerFigs = cheerers.map(([x, f, head]) => {
    const fig = new Figure({ head, garment: head === 'woman' ? 'peplos' : 'short', garmentColor: head === 'woman' ? INK : PURPLE, hat: head === 'woman' ? 'veil' : 'none', facing: f }, pose({ ...POSES.stand(0, 0), armF: [150, 20], armB: [140, 30] }));
    const g = s('g', { transform: `translate(${x} ${towerB.top + 16}) scale(0.34)` });
    g.appendChild(fig.g);
    cheer.appendChild(g);
    return fig;
  });
  tB.append(cheer, wallsB.g);
  tB.appendChild(inscription('ΙΛΙΟΣ', 90, -52, { size: 8, color: CLAY, align: 'middle' }));
  tB.appendChild(exergue(GB, { band: 'tongues' }));
  const gateB = wallsB.gate!;
  // Whatever passes the gateway vanishes into its dark.
  const gateClip = s('clipPath', { id: 'ta-gate', 'data-scene': '' });
  gateClip.appendChild(s('rect', { x: -220, y: -220, width: 220 + gateB.x0, height: 440 }));
  ctx.defs.appendChild(gateClip);
  const passing = s('g', { class: 'passing', 'clip-path': 'url(#ta-gate)' });
  tB.appendChild(passing);
  const horseB = woodenHorse(ctx.defs, 'ta-horse-b');
  const KB = 0.9;
  const DRAG = 210;
  const XB0 = -78;
  const placeHorseB = (x: number) => horseB.g.setAttribute('transform', `translate(${x.toFixed(1)} ${GB}) scale(${KB})`);
  placeHorseB(XB0);
  // Trojans hauling on ropes made fast to the platform's ring.
  const haulPose = (ph: number) => {
    const sw = Math.sin(ph * Math.PI * 2);
    return pose({ x: 0, y: -STAND_HEIGHT + 6, lean: 30, head: -6, armF: [36, 128], armB: [14, 140], legF: [30 + 16 * sw, 24 - 10 * sw], legB: [-30 + 16 * sw, 8], footB: 22 });
  };
  const haulers = [
    new Figure({ head: 'bearded', garment: 'short', garmentColor: INK, cloak: true, cloakColor: PURPLE }, haulPose(0)),
    new Figure({ head: 'youth', garment: 'short', garmentColor: PURPLE }, haulPose(0.5)),
  ];
  const HAUL_X = [4, 26];
  const haulG = haulers.map((h, k) => {
    const g = s('g', { transform: `translate(${HAUL_X[k]} ${GB}) scale(0.84)` });
    g.appendChild(h.g);
    return g;
  });
  const ropeHaloB = s('path', { fill: 'none', stroke: CLAY, 'stroke-width': 3.2, 'stroke-linecap': 'round' });
  const ropeB = s('path', { fill: 'none', stroke: INK, 'stroke-width': 1.3, 'stroke-linecap': 'round' });
  passing.append(horseB.g, ...haulG, ropeHaloB, ropeB);
  const haul = { p: 0 };
  const renderHaul = () => {
    const dx = DRAG * haul.p;
    placeHorseB(XB0 + dx);
    horseB.roll(((dx / (12.5 * KB)) * 180) / Math.PI);
    const ring: Vec = [XB0 + dx + horseB.at.ring[0] * KB, GB + horseB.at.ring[1] * KB];
    const pts: Vec[] = [ring];
    haulers.forEach((h, k) => {
      h.set(haulPose(dx / 26 + k * 0.5));
      const x = HAUL_X[k] + dx;
      haulG[k].setAttribute('transform', `translate(${x.toFixed(1)} ${GB}) scale(0.84)`);
      const sh = h.joints().armF.S;
      pts.push([x + sh[0] * 0.84, GB + (sh[1] - 1) * 0.84]);
    });
    const d = smoothPath([ring, [(ring[0] + pts[1][0]) / 2, (ring[1] + pts[1][1]) / 2 + 4], pts[1], [(pts[1][0] + pts[2][0]) / 2, (pts[1][1] + pts[2][1]) / 2 + 3], pts[2]], false, 0.4);
    ropeB.setAttribute('d', d);
    ropeHaloB.setAttribute('d', d);
  };
  renderHaul();

  /* ================= Tableau C: night inside the walls ================= */
  const GC = 94;
  const tC = s('g', { class: 'tableau-c' });
  tC.style.display = 'none';
  root.appendChild(tC);
  tC.appendChild(fillers([[140, -60], [-10, -150]], 4.2));
  const wallsC = troyWalls({ from: -200, to: -48, base: GC, height: 124, towers: [{ x: -88, w: 44, rise: 30 }], gate: { x: -88, w: 40, h: 92 }, seed: 44 });
  const towerC = wallsC.towers[0];
  const gateC = wallsC.gate!;
  // Sinon on the gate tower, behind the breastwork, torch in hand.
  const sinon = new Figure({ head: 'bearded', garment: 'short', garmentColor: INK, cloak: true, cloakColor: PURPLE, facing: -1 }, pose({ ...POSES.stand(0, 0), lean: -4, armF: [168, 14], armB: [30, 40] }));
  const SIN_X = -80, SIN_K = 0.42, SIN_Y = towerC.top + 16;
  const sinonG = s('g', { transform: `translate(${SIN_X} ${SIN_Y}) scale(${SIN_K})` });
  sinonG.appendChild(sinon.g);
  tC.append(sinonG, wallsC.g);
  tC.appendChild(exergue(GC, { band: 'tongues' }));
  const horseC = woodenHorse(ctx.defs, 'ta-horse-c');
  const XC = 46, KC = 0.86;
  horseC.g.setAttribute('transform', `translate(${XC} ${GC}) scale(${KC})`);
  tC.appendChild(horseC.g);
  const toC = ([x, y]: Vec): Vec => [XC + x * KC, GC + y * KC];
  // A rope let down from the hatch (incised contour where it crosses the glaze).
  const sillC = toC([horseC.hatch.x0 + horseC.hatch.w * 0.62, horseC.hatch.y0 + horseC.hatch.h - 1]);
  const ropeD = `M${sillC[0].toFixed(1)} ${sillC[1].toFixed(1)}Q${(sillC[0] - 5).toFixed(1)} ${((sillC[1] + GC) / 2).toFixed(1)} ${(sillC[0] - 2).toFixed(1)} ${GC - 1}`;
  const ropeC = s('g', { class: 'rope' });
  const ropeHalo = s('path', { d: ropeD, fill: 'none', stroke: CLAY, 'stroke-width': 3.4, 'stroke-linecap': 'round' });
  const ropeInk = s('path', { d: ropeD, fill: 'none', stroke: INK, 'stroke-width': 1.4, 'stroke-linecap': 'round' });
  ropeC.append(ropeHalo, ropeInk);
  tC.appendChild(ropeC);
  const sliders = [
    new Warrior({ hat: 'pilos', garment: 'short', garmentColor: PURPLE }, POSES.stand(0, 0), 0.68, { device: null }),
    new Warrior({ hat: 'helmet', garment: 'short', garmentColor: INK }, POSES.stand(0, 0), 0.68, { device: 'star' }),
  ];
  for (const w of sliders) {
    w.g.style.opacity = '0';
    tC.appendChild(w.g);
  }
  const peekC = peekingHead(horseC.hatch.x0 + 14, horseC.hatch.y0 + 15, 1.05);
  peekC.style.opacity = '0';
  horseC.hatch.inside.appendChild(peekC);
  const labSinon = inscription('ΣΙΝΩΝ', -112, towerC.top - 40, { size: 5.4, angle: 90 });
  tC.appendChild(labSinon);
  // Night over the city: the veil, then the moon and stars and the torch above it.
  tC.appendChild(nightVeil(0.47));
  const nightC = s('g', { class: 'night' });
  const starsC = stars(34, { x: -60, y: -160, w: 210, h: 110 }, 57);
  nightC.append(starsC, moon(70, -118, 10));
  tC.appendChild(nightC);
  // Sinon's torch (drawn above the veil so it burns bright).
  const torchG = s('g', { class: 'beacon' });
  const tt = torch(0, 0, -12);
  const light = glow(ctx.defs, 0, -18, 26, '#e9a25a', 0.55);
  const torchInner = s('g', { transform: `scale(${(SIN_K * 1.25).toFixed(3)})` });
  torchInner.append(light, tt.g);
  torchG.appendChild(torchInner);
  const placeTorch = () => {
    const [hx, hy] = sinon.hand('F');
    torchG.setAttribute('transform', `translate(${(SIN_X + hx * SIN_K).toFixed(1)} ${(SIN_Y + hy * SIN_K + 4).toFixed(1)})`);
  };
  placeTorch();
  tC.appendChild(torchG);
  const blaze = s('g', { class: 'blaze' });
  blaze.style.opacity = '0';
  tC.appendChild(blaze);

  /* ================= Tableau D: Troy burns ================= */
  const tD = s('g', { class: 'tableau-d' });
  tD.style.display = 'none';
  root.appendChild(tD);
  const WD = 46;
  // Inside the city the horse's head still rises over the battlements.
  const horseD = woodenHorse(ctx.defs, 'ta-horse-d');
  horseD.g.setAttribute('transform', 'translate(-92 98) scale(0.78)');
  const behindClip = s('clipPath', { id: 'ta-behind', 'data-scene': '' });
  behindClip.appendChild(s('rect', { x: -220, y: -220, width: 440, height: 220 + WD }));
  ctx.defs.appendChild(behindClip);
  const horseDw = s('g', { 'clip-path': 'url(#ta-behind)' });
  horseDw.appendChild(horseD.g);
  tD.appendChild(horseDw);
  const wallsD = troyWalls({ from: -200, to: 200, base: WD, height: 62, towers: [{ x: -110, w: 34, rise: 26 }, { x: 104, w: 34, rise: 26 }], gate: { x: 54, w: 30, h: 36 }, seed: 71 });
  wallsD.gate!.set(1);
  tD.appendChild(wallsD.g);
  tD.appendChild(inscription('ΙΛΙΟΣ', -46, WD - 26, { size: 7, color: CLAY, align: 'middle' }));
  // The tower that will crack: built apart so its top can break away.
  const CT_X = 8, CT_W = 30, CT_RISE = 28;
  const crackY = WD - 62 - 4;
  const ct = troyWalls({ from: CT_X - CT_W / 2, to: CT_X + CT_W / 2, base: WD, height: 62 + CT_RISE, seed: 5 });
  const clipLow = s('clipPath', { id: 'ta-ct-low', 'data-scene': '' });
  clipLow.appendChild(s('rect', { x: -60, y: crackY, width: 140, height: 200 }));
  const clipTop = s('clipPath', { id: 'ta-ct-top', 'data-scene': '' });
  clipTop.appendChild(s('path', { d: `M-60 -220H80V${crackY + 3}L${CT_X + 9} ${crackY - 1}L${CT_X + 2} ${crackY + 4}L${CT_X - 6} ${crackY}L-60 ${crackY + 2}Z` }));
  ctx.defs.append(clipLow, clipTop);
  const towerLow = s('g', { 'clip-path': 'url(#ta-ct-low)' });
  towerLow.appendChild(ct.g);
  const towerTopRot = s('g', { class: 'tower-top' });
  const towerTop = s('g', { 'clip-path': 'url(#ta-ct-top)' });
  towerTop.appendChild(ct.g.cloneNode(true));
  towerTopRot.appendChild(towerTop);
  const crack = s('path', { d: `M${CT_X + 3} ${crackY - CT_RISE + 2}L${CT_X - 3} ${crackY - 16}L${CT_X + 4} ${crackY - 8}L${CT_X - 1} ${crackY + 1}L${CT_X + 6} ${crackY + 14}L${CT_X + 1} ${crackY + 26}`, fill: 'none', stroke: WHITE, 'stroke-width': 1.2, 'stroke-linejoin': 'bevel', opacity: 0 });
  tD.append(towerLow, towerTopRot, crack);
  const rubble = s('g', { class: 'rubble' });
  tD.appendChild(rubble);
  // The sea below, and Odysseus's ship already turning for home.
  const seaD = sea(116, { crestHeight: 10 });
  tD.appendChild(seaD.g);
  tD.appendChild(nightVeil(0.46));
  const nightD = s('g', { class: 'night' });
  nightD.append(stars(18, { x: -100, y: -160, w: 200, h: 50 }, 91), moon(-92, -122, 9));
  tD.appendChild(nightD);
  tD.appendChild(glow(ctx.defs, 0, -24, 170, '#e0783a', 0.3));
  // Smoke, then fire along the battlements (above the veil: they light the night).
  const smokeD = s('g', { class: 'smoke', opacity: 0 });
  const plumes: Array<[number, number, number]> = [[-150, -26, 40], [-110, -52, 52], [26, -26, 44], [104, -52, 56], [148, -26, 38]];
  const plumePaths = plumes.map(() => s('path', { fill: INK, opacity: 0.55 }));
  smokeD.append(...plumePaths);
  tD.appendChild(smokeD);
  const fireSpots: Array<[number, number, number]> = [
    [-166, -22, 0.6], [-144, -22, 0.8], [-110, -48, 0.95], [-96, -48, 0.6], [-12, -22, 0.55], [26, -22, 0.85],
    [54, 10, 0.7], [84, -22, 0.6], [104, -48, 0.95], [120, -48, 0.6], [146, -22, 0.75], [CT_X, crackY - CT_RISE - 4, 0.8],
  ];
  const firesD = fireSpots.map(([x, y, k]) => {
    const f = flames(0, 0, k);
    const holder = s('g', { transform: `translate(${x} ${y})` });
    const grow = s('g', { transform: 'scale(0)' });
    grow.appendChild(f);
    holder.appendChild(grow);
    tD.appendChild(holder);
    return { holder, grow, f };
  });
  // The ship rides above the veil so its sail catches the firelight.
  const shipD = ship({ palette: BLACK_FIGURE, sail: 'full', oars: 9, crew: 6 });
  const shipWrap = s('g', { transform: 'translate(-10 118) scale(-0.92 0.92)' });
  shipWrap.appendChild(shipD.g);
  const shipMove = s('g');
  shipMove.appendChild(shipWrap);
  tD.appendChild(shipMove);

  return {
    enter() {
      // The horse stands finished but for the last pegs; Athena and Epeios come to it.
      const tl = st.timeline();
      tl.to(athW, { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, 0)
        .to(epW, { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, 0.15)
        .to([labAth, labEp], { opacity: 1, duration: 0.6 }, 0.6);
      return st.play(tl);
    },
    async beat(i) {
      if (i === 0) return;
      if (i === 1) {
        hammering.kill();
        const tl = st.timeline();
        // Athena and Epeios withdraw; the hatch opens and a ladder is set up.
        tl.to(epW, { opacity: 0, x: 16, duration: 0.6, ease: 'power2.in' }, 0)
          .to(labEp, { opacity: 0, duration: 0.4 }, 0)
          .to(athW, { opacity: 0, duration: 0.9, ease: 'power1.in' }, 0.1)
          .to(labAth, { opacity: 0, duration: 0.6 }, 0.1);
        const hatch = { p: 0 };
        tl.to(hatch, { p: 1, duration: 0.45, ease: 'power2.inOut', onUpdate: () => horseA.hatch.open(hatch.p) }, 0.2)
          .fromTo(ladderW, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.3);

        // One by one they come from the ships and climb into the belly.
        const WALK = 0.55, CLIMB = 0.95, GAP = 0.55, START = 0.55;
        climbers.forEach((w, k) => {
          const t0 = START + k * GAP;
          const walk = { x: -190, ph: 0 };
          tl.set(w.g, { opacity: 1 }, t0)
            .to(walk, {
              x: LADDER_FOOT[0] - 6,
              ph: 1.6,
              duration: WALK,
              ease: 'none',
              onUpdate: () => {
                const sw = Math.sin(walk.ph * Math.PI * 2);
                w.set({ ...POSES.walk(0, 0), legF: [24 * sw, 10], legB: [-22 * sw, 10], armF: [20 * -sw + 10, 16], armB: [18 * sw - 10, 12] });
                w.place(walk.x, GROUND);
              },
            }, t0);
          const up = { s: 0 };
          tl.to(up, {
            s: 1,
            duration: CLIMB,
            ease: 'none',
            onUpdate: () => {
              const x = LADDER_FOOT[0] - 6 + (LADDER_TOP[0] - LADDER_FOOT[0]) * up.s;
              const y = LADDER_FOOT[1] + (LADDER_TOP[1] - LADDER_FOOT[1]) * up.s;
              w.set(climbPose(up.s * 2.5));
              w.place(x - 4, y);
            },
          }, t0 + WALK);
          // Into the hatch: he stoops forward and dwindles into the hollow belly.
          const inn = { t: 0 };
          const hc = toA(horseA.at.hatch);
          tl.add(w.to({ lean: 64, head: 10, armF: [96, 10], armB: [84, 16], legF: [60, 70], legB: [-20, 30] }, { duration: 0.34, ease: 'power1.in' }), t0 + WALK + CLIMB)
            .to(inn, {
              t: 1,
              duration: 0.34,
              ease: 'power2.in',
              onUpdate: () => {
                const x = LADDER_TOP[0] - 4 + (hc[0] + 4 - LADDER_TOP[0]) * inn.t;
                const y = LADDER_TOP[1] + (hc[1] + 14 - LADDER_TOP[1]) * inn.t;
                w.place(x, y, 0.72 * (1 - 0.55 * inn.t));
                w.g.style.opacity = String(Math.min(1, 1.6 * (1 - inn.t)));
              },
            }, t0 + WALK + CLIMB);
        });
        const tIn = START + 3 * GAP + WALK + CLIMB + 0.3;
        // A last helmet peers out; the ladder is pulled away; the hatch shuts.
        tl.to(peeker, { opacity: 1, duration: 0.2 }, tIn - 0.2)
          .to(ladderW, { opacity: 0, y: 10, duration: 0.45, ease: 'power2.in' }, tIn)
          .to(peeker, { opacity: 0, duration: 0.2 }, tIn + 0.3)
          .to(hatch, { p: 0, duration: 0.35, ease: 'power2.in', onUpdate: () => horseA.hatch.open(hatch.p) }, tIn + 0.35)
          .call(() => ctx.audio.sfx('thud'), [], tIn + 0.7);

        // Behind, the camp is fired and the ships row away.
        tl.call(() => ctx.audio.sfx('fire'), [], 0.8);
        fires.forEach((f, k) => {
          tl.to(f.grow, { attr: { transform: 'scale(1)' }, duration: 0.8, ease: 'back.out(1.6)' }, 0.8 + k * 0.35);
          loopsA.push(st.loop(flicker(f.f, 0.8 + k * 0.1)));
        });
        tl.to(smoke, { opacity: 1, duration: 1.2 }, 1.2);
        const drift = { ph: 0 };
        loopsA.push(st.loop(
          gsap.to(drift, {
            ph: Math.PI * 2,
            duration: 5,
            repeat: -1,
            ease: 'none',
            onUpdate: () => huts.forEach((x, k) => smokes[k].setAttribute('d', smokePath(x, SHORE_Y - 14, 34 + k * 3, 6, drift.ph + k * 1.7, -0.5))),
          }),
        ));
        fleet.forEach((f, k) => {
          loopsA.push(st.loop(rowing(f.oars, gsap, 1.2)));
          tl.to(f.wrap, { x: -120, opacity: 0, duration: 3.2, ease: 'power1.in' }, 0.9 + k * 0.4);
        });
        return st.play(tl);
      }
      if (i === 2) {
        // Cut to the plain before Troy: the Trojans take the horse for an offering.
        loopsA.forEach((a) => a.kill());
        const cut = st.timeline();
        cut.to(tA, { opacity: 0, duration: 0.6, ease: 'power2.in' })
          .set(tA, { display: 'none' })
          .set(tB, { display: '' })
          .fromTo(tB, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.out' });
        const open = { v: 0 };
        cut.to(open, { v: 1, duration: 0.9, ease: 'power2.inOut', onUpdate: () => gateB.set(open.v) }, '-=0.2')
          .call(() => ctx.audio.sfx('boulder'), [], '<');
        await st.play(cut);
        if (ctx.signal.aborted) return;
        birds.forEach((b, k) => {
          loopsB.push(st.loop(gsap.to(b.wings, { scaleY: -0.5, transformOrigin: '50% 100%', duration: 0.28 + k * 0.05, yoyo: true, repeat: -1, ease: 'sine.inOut' })));
          loopsB.push(st.loop(gsap.to(b.drift, { x: 30 + k * 6, y: -6 + k * 4, duration: 7 + k, yoyo: true, repeat: -1, ease: 'sine.inOut' })));
        });
        cheerFigs.forEach((fig, k) => loopsB.push(st.loop(poseTo(fig, { armF: [112, 60], armB: [172, 8], head: -8 }, { duration: 0.55 + k * 0.08, delay: k * 0.18, yoyo: true, repeat: -1, ease: 'sine.inOut' }))));
        await ctx.drag(horseB.g, {
          label: 'Atı Troya kapısından içeri sürükle',
          axis: 'x',
          distance: DRAG,
          onProgress: (p) => {
            haul.p = p;
            renderHaul();
          },
        });
        if (ctx.signal.aborted) return;
        // The gates swing shut behind it.
        const shut = st.timeline();
        shut.to(open, { v: 0, duration: 0.8, ease: 'power2.in', onUpdate: () => gateB.set(open.v) }, 0.2).call(() => ctx.audio.sfx('thud'), [], 1.0);
        return st.play(shut);
      }
      if (i === 3) {
        // Night falls; inside the walls the hatch opens and the warriors slip down.
        ctx.atlas.setMood('night');
        ctx.audio.sfx('wind');
        loopsB.forEach((a) => a.kill());
        const cut = st.timeline();
        cut.to(tB, { opacity: 0, duration: 0.7, ease: 'power2.in' })
          .set(tB, { display: 'none' })
          .set(tC, { display: '' })
          .fromTo(tC, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power1.out' });
        await st.play(cut);
        if (ctx.signal.aborted) return;
        const tl = st.timeline();
        const hatch = { p: 0 };
        tl.to(hatch, { p: 1, duration: 0.5, ease: 'power2.inOut', onUpdate: () => horseC.hatch.open(hatch.p) }, 1.3)
          .fromTo(ropeC, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 1.6)
          .fromTo([ropeHalo, ropeInk], { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.5, ease: 'power2.out' }, 1.6)
          .to(peekC, { opacity: 1, duration: 0.2 }, 1.5);
        sliders.forEach((w, k) => {
          const t0 = 2.1 + k * 0.9;
          const slide = { t: 0 };
          const top: Vec = [sillC[0] - 5, sillC[1] + 32 * 0.68];
          w.set({ ...POSES.stand(0, 0), lean: 2, head: -12, armF: [176, 4], armB: [168, 10], legF: [14, 26], legB: [6, 30] });
          tl.set(w.g, { opacity: 1 }, t0)
            .to(slide, {
              t: 1,
              duration: 0.85,
              ease: 'power2.in',
              onUpdate: () => w.place(top[0] + slide.t * 3, top[1] + (GC - top[1]) * slide.t),
            }, t0)
            .add(w.to({ ...POSES.stand(0, 0), lean: 6, head: 0, armF: [30, 20], armB: [-10, 20] }, { duration: 0.3 }), t0 + 0.85);
          if (k === 0) {
            // He runs to the gate and draws the bars.
            const run = { x: top[0] + 3, ph: 0 };
            tl.to(run, {
              x: gateC.x1 + 14,
              ph: 2.2,
              duration: 1.1,
              ease: 'power1.inOut',
              onUpdate: () => {
                const sw = Math.sin(run.ph * Math.PI * 2);
                w.face(-1);
                w.set({ ...POSES.walk(0, 0), lean: 8, legF: [26 * sw, 12], legB: [-24 * sw, 12], armF: [30 * -sw, 20], armB: [26 * sw, 16] });
                w.place(run.x, GC);
              },
            }, t0 + 1.15)
              .add(w.to({ ...POSES.stand(0, 0), lean: 20, armF: [96, 10], armB: [84, 16], legF: [30, 16], legB: [-24, 8] }, { duration: 0.3 }), t0 + 2.25);
          }
        });
        const gate = { v: 0 };
        tl.to(gate, { v: 1, duration: 0.9, ease: 'power2.inOut', onUpdate: () => gateC.set(gate.v) }, 4.3).call(() => ctx.audio.sfx('boulder'), [], 4.3);
        loopsC.push(st.loop(gsap.to(starsC, { opacity: 0.55, duration: 1.6, yoyo: true, repeat: -1, ease: 'sine.inOut' })));
        // The cut already took its time: start the action at 1.3 s.
        if (ctx.reduced) tl.progress(1);
        else tl.time(1.3);
        loopsC.push(st.loop(gsap.to(tt.flame.querySelectorAll('.kit-flame__tongue'), { scaleY: 1.25, transformOrigin: '50% 100%', duration: 0.25, yoyo: true, repeat: -1, ease: 'sine.inOut', stagger: 0.08 })));
        // The signal: Sinon's beacon (the warriors go on with their work meanwhile).
        await ctx.tap(torchG, { label: 'İşaret ateşini yak' });
        if (ctx.signal.aborted) return;
        ctx.audio.sfx('fire');
        const fire = flames(0, 0, 1.3);
        const big = glow(ctx.defs, 0, -18, 70, '#f0b060', 0.6);
        const [hx, hy] = sinon.hand('F');
        blaze.setAttribute('transform', `translate(${(SIN_X + hx * SIN_K + 3).toFixed(1)} ${(SIN_Y + hy * SIN_K - 12).toFixed(1)})`);
        blaze.append(big, fire);
        loopsC.push(st.loop(flicker(fire, 1.4)));
        const up = st.timeline();
        up.to(blaze, { opacity: 1, duration: 0.3 })
          .fromTo(fire, { scale: 0.3, transformOrigin: '50% 100%' }, { scale: 1, duration: 0.6, ease: 'back.out(2)' }, 0)
          .add(poseTo(sinon, { armF: [180, 0], lean: -8 }, { duration: 0.4, onUpdate: placeTorch }), 0);
        // Sparks fly up into the night.
        for (let k = 0; k < 14; k++) {
          const sp = s('circle', { r: 0.9, fill: WHITE });
          blaze.appendChild(sp);
          loopsC.push(st.loop(gsap.fromTo(sp, { x: gsap.utils.random(-6, 6), y: -10, opacity: 1 }, { x: `+=${gsap.utils.random(-18, 18)}`, y: gsap.utils.random(-70, -40), opacity: 0, duration: gsap.utils.random(0.9, 1.6), repeat: -1, delay: k * 0.12, ease: 'power1.out' })));
        }
        await st.play(up);
        if (ctx.signal.aborted) return;
        // The fleet comes back from Tenedos by night.
        await ctx.atlas.sail('return');
        return;
      }
      if (i === 4) {
        // Troy burns. Nothing moves but the fire, the smoke and one ship.
        loopsC.forEach((a) => a.kill());
        const tl = st.timeline();
        tl.to(tC, { opacity: 0, duration: 0.8, ease: 'power2.in' })
          .set(tC, { display: 'none' })
          .set(tD, { display: '' })
          .fromTo(tD, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power1.out' })
          .call(() => {
            ctx.audio.sfx('fire');
            ctx.atlas.flash('#e0783a');
          }, [], 1.2);
        firesD.forEach((f, k) => {
          tl.to(f.grow, { attr: { transform: 'scale(1)' }, duration: 0.7, ease: 'back.out(1.5)' }, 1.0 + (k % 6) * 0.12 + Math.floor(k / 6) * 0.2);
          st.loop(flicker(f.f, 0.8 + (k % 4) * 0.12));
        });
        tl.to(smokeD, { opacity: 1, duration: 1.2 }, 1.2);
        const drift = { ph: 0 };
        const renderSmoke = () => plumes.forEach(([x, y, h], k) => plumePaths[k].setAttribute('d', smokePath(x, y - 8, h, 7, drift.ph + k * 1.3, 0.35)));
        renderSmoke();
        st.loop(gsap.to(drift, { ph: Math.PI * 2, duration: 6, repeat: -1, ease: 'none', onUpdate: renderSmoke }));
        // A tower cracks and its crown leans away.
        tl.to(crack, { opacity: 1, duration: 0.1 }, 1.7)
          .fromTo(crack, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.45, ease: 'power1.in' }, 1.7)
          .call(() => {
            ctx.audio.sfx('boulder');
            ctx.atlas.shake(0.35);
            for (let k = 0; k < 4; k++) {
              const b = s('rect', { x: CT_X - 10 + k * 6, y: crackY - 14 + (k % 2) * 6, width: 5, height: 4, fill: INK });
              rubble.appendChild(b);
              st.timeline().to(b, { y: `+=${40 + k * 8}`, x: `+=${(k - 1.5) * 6}`, rotation: (k - 1.5) * 40, duration: 0.7 + k * 0.08, ease: 'power2.in' }).to(b, { opacity: 0, duration: 0.3 }, '-=0.1');
            }
          }, [], 2.1)
          .to(towerTopRot, { rotation: 7, svgOrigin: `${CT_X + CT_W / 2} ${crackY + 2}`, y: 2, duration: 0.7, ease: 'power2.in' }, 2.1);
        st.loop(rowing(shipD.oars, gsap, 0.8));
        st.loop(gsap.to(seaD.crests, { x: SEA_TILE, duration: 6, ease: 'none', repeat: -1 }));
        st.loop(gsap.to(shipMove, { x: -36, duration: 14, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
        return st.play(tl);
      }
      return st.wait(0.4);
    },
    destroy() {
      st.destroy();
    },
  };
};
