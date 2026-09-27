/**
 * ΙΖʹ Skheria — the land of the Phaeacians.
 *
 * Four pictures in one cup:
 *  A. Storm (enter + beat 0): Poseidon rises from the waves with his trident;
 *     a great wave breaks the raft; Ino-Leukothea hands Odysseus her immortal
 *     veil and he swims for land.
 *  B. The river mouth: at night he sleeps in a bed of leaves under the olive
 *     thicket; at dawn Nausicaa and her maidens come to wash and play ball.
 *     Tap the ball — it flies into the river; the girls scream and run;
 *     Odysseus rises holding a leafy branch; Nausicaa alone stands firm.
 *  C. King Alkinoos's hall: blind Demodokos sings of the wooden horse and
 *     Odysseus weeps, his purple cloak drawn over his head.
 *  D. Night: the Phaeacian ship, white-sailed, glowing, with no helmsman and
 *     oars that pull by themselves, carries the sleeping Odysseus toward
 *     Ithaca; not even a falcon can keep up.
 */
import { s } from '../lib/dom';
import { gsap } from '../lib/motion';
import { lerp, ribbon, sampleSpline, type Vec } from '../lib/geometry';
import { Figure, POSES, pose, INK, CLAY, WHITE, PURPLE } from '../art/figure';
import { sea, exergue, cloud, rain, lightning, oliveTree, reeds, splash, column, inscription, fillers, stars, moon, glow, nightVeil, rock, sun } from '../art/kit';
import { ship, rowing, BLACK_FIGURE } from '../art/ship';
import { greekText } from '../art/letters';
import { trident, breakableRaft, ball, clothOnStone, oliveBranch, kithara, throne, stool, feastTable, krater, falcon } from './skheria.art';
import { stage } from './tools';
import type { SceneFactory } from '../story/types';

const SEA_A = 42; // storm sea crest top
const GROUND = 94; // shore and hall ground line
/** Horizontal period of the kit's wave-crest band for a crest height. */
const tileFor = (h: number) => 576 / Math.round(576 / ((16 * h) / 10));
const TILE_A = tileFor(22);
const TILE_D = tileFor(16);
/** Enlarge a tableau about the ground line so it fills the tondo. */
const fill = (k: number) => `translate(0 ${GROUND}) scale(${k}) translate(0 ${-GROUND})`;

export const scene: SceneFactory = (ctx) => {
  const st = stage(ctx);
  const root = ctx.root;
  let now = 0;

  /* ================================================================ */
  /* A. The storm                                                      */
  /* ================================================================ */
  const tA = s('g', { class: 'skh-storm' });
  const clouds = s('g');
  clouds.append(cloud(-70, -112, 130), cloud(58, -128, 120), cloud(10, -92, 80), cloud(118, -86, 70));
  tA.appendChild(clouds);
  const bolt = lightning([78, -96], [112, 18], 11);
  bolt.style.opacity = '0';
  tA.appendChild(bolt);
  // Poseidon rising from the waves, trident high.
  const PS = 1.62;
  const poseidon = new Figure(
    { head: 'bearded', garment: 'long', garmentColor: PURPLE, cloak: true, scale: PS },
    pose({ x: -96, y: 60 / PS, lean: -6, head: -6, armF: [172, 4], armB: [96, 6] }),
  );
  // The trident is drawn once around the hand and carried by it.
  const tri = s('g');
  tri.appendChild(trident([3, 46], [-2, -64], 2.2));
  const poseidonG = s('g', { class: 'skh-poseidon' });
  poseidonG.append(poseidon.g, tri);
  poseidonG.appendChild(inscription('ΠΟΣΕΙΔΩΝ', -142, -40, { size: 7, angle: 90 }));
  tA.appendChild(poseidonG);
  const drawTrident = () => {
    const [hx, hy] = poseidon.hand('F');
    const a = poseidon.pose.armF[0] + poseidon.pose.armF[1] - 172;
    tri.setAttribute('transform', `translate(${hx.toFixed(1)} ${hy.toFixed(1)}) rotate(${a.toFixed(1)})`);
  };
  drawTrident();
  // Ino-Leukothea, hidden under the waves until beat 0.
  const INO_S = 1.25;
  const ino = new Figure(
    { head: 'woman', hat: 'veil', garment: 'peplos', garmentColor: INK, facing: -1, scale: INO_S },
    pose({ x: 116, y: 60 / INO_S, lean: 8, head: -4, armF: [104, 8], armB: [40, 40] }),
  );
  const inoG = s('g', { class: 'skh-ino', opacity: 0 });
  inoG.appendChild(ino.g);
  const inoLabel = inscription('ΛΕΥΚΟΘΕΑ', 142, -30, { size: 6.5, angle: 90 });
  inoG.appendChild(inoLabel);
  tA.appendChild(inoG);
  // The raft with Odysseus clinging to the mast.
  const RAFT_X = -14;
  const raft = breakableRaft();
  const raftG = s('g', { class: 'skh-raft' });
  const RS = 1.75;
  const raftWrap = s('g', { transform: `scale(${RS})` });
  raftWrap.appendChild(raft.g);
  raftG.appendChild(raftWrap);
  const OR = 0.9 / RS;
  const odyRaft = new Figure({ hat: 'pilos', garment: 'short', scale: OR }, pose({ x: 9, y: -1.5 / OR - 36, lean: -14, head: -12, armF: [150, 40], armB: [170, 10], legF: [70, 100], legB: [-10, 104], footB: 50 }));
  raft.g.appendChild(odyRaft.g);
  tA.appendChild(raftG);
  // The great wave that breaks the raft.
  const bigWave = s('g', { class: 'skh-bigwave', opacity: 0 });
  bigWave.appendChild(s('path', {
    d: 'M-58 0C-44 0 -34 -10 -28 -32C-22 -56 0 -72 24 -64C42 -58 46 -38 32 -32C20 -28 14 -40 22 -44C10 -46 4 -32 10 -20C16 -8 30 -4 58 0Z',
    fill: INK, stroke: CLAY, 'stroke-width': 1.2, 'paint-order': 'stroke', 'stroke-linejoin': 'round',
  }));
  bigWave.appendChild(s('path', { d: 'M-24 -48h.1M-14 -60h.1M-2 -67h.1M12 -69h.1M28 -66h.1M38 -58h.1M40 -46h.1', stroke: WHITE, 'stroke-width': 2.2, 'stroke-linecap': 'round' }));
  bigWave.appendChild(s('path', { d: 'M-40 -6Q-30 -14 -26 -30M-30 -4Q-20 -12 -16 -28', fill: 'none', stroke: CLAY, 'stroke-width': 0.7 }));
  tA.appendChild(bigWave);
  // The swimmer (after the wreck).
  const SW = 0.92;
  const swimmer = new Figure({ hat: 'none', garment: 'none', scale: SW }, pose({ x: RAFT_X, y: 55 / SW, lean: 70, head: -78, armF: [150, 10], armB: [40, 40], legF: [-70, 10], legB: [-76, 6] }));
  const sash = s('path', { fill: PURPLE, stroke: INK, 'stroke-width': 0.4 });
  const swimG = s('g', { class: 'skh-swimmer', opacity: 0 });
  swimG.append(swimmer.g, sash);
  tA.appendChild(swimG);
  const veil = s('path', { class: 'skh-veil', fill: PURPLE, stroke: INK, 'stroke-width': 0.5 });
  tA.appendChild(veil);
  // His name rides in a plain wrapper so it can follow him into the water.
  const odyLabelA = s('g');
  odyLabelA.appendChild(inscription('ΟΔΥΣΣΕΥΣ', RAFT_X - 36, -64, { size: 6 }));
  tA.appendChild(odyLabelA);
  // The sea in front of everyone.
  const seaA = sea(SEA_A, { crestHeight: 22 });
  const seaAPath = seaA.crests.querySelector('path');
  seaAPath?.setAttribute('stroke', CLAY);
  seaAPath?.setAttribute('stroke-width', '0.9');
  seaAPath?.setAttribute('paint-order', 'stroke');
  tA.appendChild(seaA.g);
  const rainA = rain(46, 5);
  tA.appendChild(rainA);
  root.appendChild(tA);

  /* ================================================================ */
  /* B. The river mouth                                                */
  /* ================================================================ */
  const tB = s('g', { class: 'skh-shore', opacity: 0 });
  // Laid out in figure units, then enlarged about the ground line to fill the cup.
  const tBin = s('g', { transform: fill(1.28) });
  tB.appendChild(tBin);
  const dayFill = fillers([[-20, -96], [40, -84], [-78, -60], [96, -40]], 3.4);
  dayFill.setAttribute('opacity', '0');
  tBin.appendChild(dayFill);
  // The sun of the next morning rises over the shore in beat 1.
  const dawnSun = sun(40, -40, 10);
  const dawnSunG = s('g', { opacity: 0 });
  dawnSunG.appendChild(dawnSun);
  tBin.appendChild(dawnSunG);
  tBin.appendChild(exergue(GROUND, { band: 'tongues' }));
  // The river mouth at the right: black water with incised current lines.
  const river = s('g', { class: 'skh-river' });
  river.appendChild(s('path', { d: `M78 ${GROUND + 1}C90 ${GROUND - 6} 118 ${GROUND - 7} 200 ${GROUND - 6}V240H78Z`, fill: INK, stroke: CLAY, 'stroke-width': 0.8 }));
  let cur = '';
  for (let i = 0; i < 6; i++) {
    const x = 86 + (i % 3) * 16 + (i > 2 ? 7 : 0), y = GROUND + 3 + i * 5;
    cur += `M${x} ${y}q4 -2.4 8 0t8 0t8 0`;
  }
  const current = s('path', { d: cur, fill: 'none', stroke: CLAY, 'stroke-width': 0.8, 'stroke-linecap': 'round', opacity: 0.85 });
  river.appendChild(current);
  river.appendChild(reeds(82, GROUND, 6, 20));
  river.appendChild(reeds(128, GROUND - 6, 5, 16));
  tBin.appendChild(river);
  // The olive thicket (a wild and a tame olive grown together).
  tBin.appendChild(oliveTree(-128, GROUND, 1.05, 4));
  tBin.appendChild(oliveTree(-104, GROUND, 0.95, 9));
  // Washing spread on the stones.
  const washing = s('g', { class: 'skh-washing', opacity: 0 });
  washing.append(clothOnStone(-54, GROUND, 20, WHITE, 1), clothOnStone(-2, GROUND, 22, PURPLE, 2), clothOnStone(44, GROUND, 20, WHITE, 3));
  tBin.appendChild(washing);
  // Odysseus asleep in his bed of leaves, only his head and shoulder showing.
  const sleeper = new Figure(
    { hat: 'none', garment: 'none', facing: -1 },
    pose({ x: -112, y: GROUND - 6.5, lean: -84, head: -10, armF: [96, 30], armB: [100, 10], legF: [92, 8], legB: [88, 14], footF: -80, footB: -80 }),
  );
  const sleeperG = s('g', { class: 'skh-sleeper' });
  sleeperG.appendChild(sleeper.g);
  const leafBed = s('g', { class: 'skh-leaves' });
  {
    let d = '';
    let r = 17;
    const rand = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 95; i++) {
      const u = rand() * 2 - 1;
      const x = -128 + u * 36;
      const top = Math.sqrt(Math.max(0, 1 - u * u)) * 16;
      const y = GROUND - 1 - rand() * top;
      const a = (rand() - 0.5) * 2.8, L = 6 + rand() * 3;
      const ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L;
      d += `M${x.toFixed(1)} ${y.toFixed(1)}Q${((x + ex) / 2 - Math.sin(a) * 1.9).toFixed(1)} ${((y + ey) / 2 + Math.cos(a) * 1.9).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}Q${((x + ex) / 2 + Math.sin(a) * 1.9).toFixed(1)} ${((y + ey) / 2 - Math.cos(a) * 1.9).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}Z`;
    }
    leafBed.appendChild(s('path', { d, fill: INK, stroke: CLAY, 'stroke-width': 0.4, 'paint-order': 'stroke' }));
  }
  const odyLabelB = inscription('ΟΔΥΣΣΕΥΣ', -94, 74, { size: 5 });
  tBin.append(sleeperG, leafBed, odyLabelB);
  // Odysseus risen, a leafy branch held before him (beat 2).
  const riser = new Figure({ hat: 'none', garment: 'none' }, pose({ ...POSES.stand(-98, GROUND), y: GROUND - 34, lean: 30, head: -20, armF: [60, 50], armB: [30, 40], legF: [70, 110], legB: [-10, 120], footB: 60 }));
  const branch = oliveBranch(40);
  const riserG = s('g', { class: 'skh-riser', opacity: 0 });
  riserG.append(riser.g, branch);
  tBin.appendChild(riserG);
  // Nausicaa with the ball, two maidens beyond her.
  const nausicaa = new Figure({ head: 'woman', hat: 'diadem', garment: 'peplos', garmentColor: PURPLE }, pose({ ...POSES.stand(-30, GROUND), armF: [150, 30], armB: [40, 30], head: -8 }));
  const maidA = new Figure({ head: 'woman', garment: 'peplos', garmentColor: INK, facing: -1 }, pose({ ...POSES.stand(24, GROUND), armF: [140, 20], armB: [120, 30], head: -10 }));
  const maidB = new Figure({ head: 'woman', garment: 'peplos', garmentColor: PURPLE, facing: -1, scale: 0.96 }, pose({ ...POSES.walk(62, GROUND / 0.96), armF: [110, 30], armB: [60, 30], head: -6 }));
  const girls = s('g', { class: 'skh-girls', opacity: 0 });
  // Plain wrappers carry the running maidens (the figures own their transform attribute).
  const runA = s('g');
  const runB = s('g');
  runA.appendChild(maidA.g);
  runB.appendChild(maidB.g);
  girls.append(runB, runA, nausicaa.g);
  tBin.appendChild(girls);
  const nauLabel = inscription('ΝΑΥΣΙΚΑΑ', -54, -46, { size: 6, angle: 90 });
  girls.appendChild(nauLabel);
  const theBall = ball(4.2);
  const ballG = s('g', { class: 'skh-ball', opacity: 0 });
  ballG.appendChild(theBall);
  tBin.appendChild(ballG);
  const ballHit = s('circle', { r: 15, fill: 'transparent' });
  ballG.appendChild(ballHit);
  const ballPos = { x: 0, y: 0, held: true };
  // He sleeps through the night: a veil of night with stars and moon over the shore.
  const nightB = s('g', { class: 'skh-shore-night' });
  nightB.appendChild(nightVeil(0.5));
  nightB.appendChild(stars(26, { x: -150, y: -150, w: 300, h: 120 }, 5));
  nightB.appendChild(moon(70, -104, 11));
  tB.appendChild(nightB);
  root.appendChild(tB);

  /* ================================================================ */
  /* C. The feast in Alkinoos's hall                                   */
  /* ================================================================ */
  const tC = s('g', { class: 'skh-hall', opacity: 0 });
  const tCin = s('g', { transform: fill(1.3) });
  tC.appendChild(tCin);
  tCin.appendChild(exergue(GROUND, { band: 'tongues' }));
  tCin.append(column(-122, GROUND, 150, 16), column(122, GROUND, 150, 16));
  tCin.appendChild(s('path', { d: `M-170 ${GROUND - 150}H170V${GROUND - 144}H-170Z`, fill: INK }));
  tCin.appendChild(fillers([[-40, -10], [36, -18], [4, 16]], 3.2));
  // Demodokos on his chair, the lyre on his knees.
  tCin.appendChild(throne(-80, GROUND, 1));
  const bard = new Figure({ head: 'old', hat: 'wreath', garment: 'long', garmentColor: PURPLE, cloak: true, cloakColor: INK }, pose({ ...POSES.sit(-74, GROUND), lean: -4, head: -10, armF: [62, 70], armB: [70, 50] }));
  tCin.appendChild(bard.g);
  const lyre = kithara();
  tCin.appendChild(lyre);
  // Closed eyes of the blind singer (drawn over the incised eye).
  const bardEye = s('path', { fill: 'none', stroke: CLAY, 'stroke-width': 0.7, 'stroke-linecap': 'round' });
  tCin.appendChild(bardEye);
  tCin.appendChild(inscription('ΔΗΜΟΔΟΚΟΣ', -104, 16, { size: 5.5, angle: 90 }));
  // The feast between them.
  tCin.appendChild(krater(-20, GROUND, 0.84));
  tCin.appendChild(feastTable(-30, GROUND, 0.84));
  // King Alkinoos on his throne, sceptre in hand, listening.
  const kingThrone = s('g', { transform: 'translate(22 0) scale(-1 1) translate(-22 0)' });
  kingThrone.appendChild(throne(22, GROUND, 1));
  tCin.appendChild(kingThrone);
  const alkinoos = new Figure(
    { head: 'bearded', garment: 'long', garmentColor: PURPLE, cloak: true, cloakColor: INK, facing: -1 },
    pose({ ...POSES.sit(18, GROUND), lean: -2, head: -4, armF: [70, 40], armB: [10, 60] }),
  );
  tCin.appendChild(alkinoos.g);
  // His sceptre, drawn once around the hand and carried by it.
  const sceptre = s('g');
  sceptre.append(
    s('line', { x1: 0, y1: 26, x2: 0.5, y2: -36, stroke: INK, 'stroke-width': 1.4, 'stroke-linecap': 'round' }),
    s('path', { d: 'M0.5 -41l2.6 3.2l-2.6 3.2l-2.6 -3.2Z', fill: INK }),
  );
  tCin.appendChild(sceptre);
  tCin.appendChild(inscription('ΑΛΚΙΝΟΟΣ', 42, 34, { size: 5, angle: 90 }));
  // Odysseus on a stool, weeping, his purple cloak drawn over his head.
  tCin.appendChild(stool(82, GROUND, 1));
  const weeper = new Figure(
    { hat: 'none', garment: 'long', garmentColor: INK, facing: -1 },
    pose({ ...POSES.sit(82, GROUND + 4), lean: 14, head: 26, armF: [128, 112], armB: [60, 60] }),
  );
  tCin.appendChild(weeper.g);
  const hood = s('path', { fill: PURPLE, stroke: INK, 'stroke-width': 0.55, 'stroke-linejoin': 'round' });
  const hoodLines = s('path', { fill: 'none', stroke: INK, 'stroke-width': 0.4, opacity: 0.75 });
  tCin.append(hood, hoodLines);
  // Tears (added white) fall from under the hood.
  const tears = s('g', { class: 'skh-tears' });
  tCin.appendChild(tears);
  tCin.appendChild(inscription('ΟΔΥΣΣΕΥΣ', 104, 12, { size: 5.5, angle: 90 }));
  // The song: painted words drifting from the bard's lips.
  const songC = s('g', { class: 'skh-song' });
  const SONG = 'ΙΠΠΟΥ ΚΟΣΜΟΝ ΑΕΙΣΟΝ ΔΟΥΡΑΤΕΟΥ';
  const songLetters = [...SONG].map((ch) => {
    const t = greekText(ch === ' ' ? '·' : ch, { size: 4.6, weight: 1.25, align: 'middle' });
    t.g.style.color = INK;
    const g = s('g', { opacity: 0 });
    g.appendChild(t.g);
    songC.appendChild(g);
    return g;
  });
  tCin.appendChild(songC);
  root.appendChild(tC);

  /* ================================================================ */
  /* D. Night: the Phaeacian ship                                      */
  /* ================================================================ */
  const tD = s('g', { class: 'skh-night', opacity: 0 });
  const seaD = sea(88, { crestHeight: 16 });
  const seaDPath = seaD.crests.querySelector('path');
  seaDPath?.setAttribute('stroke', CLAY);
  seaDPath?.setAttribute('stroke-width', '0.8');
  seaDPath?.setAttribute('paint-order', 'stroke');
  tD.appendChild(nightVeil(0.62));
  tD.appendChild(stars(38, { x: -160, y: -160, w: 320, h: 170 }, 17));
  const theMoon = moon(96, -104, 14);
  tD.appendChild(theMoon);
  // Ithaca on the horizon.
  const ithaca = rock([[118, 82], [124, 64], [136, 56], [150, 58], [164, 50], [190, 60], [190, 82]], { lines: 0 });
  tD.appendChild(ithaca);
  tD.appendChild(inscription('ΙΘΑΚΗ', 120, 44, { size: 6, color: WHITE }));
  const shipGlow = glow(ctx.defs, 0, 40, 96, WHITE, 0.36);
  tD.appendChild(shipGlow);
  const pship = ship({ palette: BLACK_FIGURE, sail: 'full', oars: 9 });
  // No helmsman: the steering oar is gone; the oars pull by themselves.
  [...pship.oars.children].slice(-2).forEach((n) => n.remove());
  pship.hull.querySelectorAll('path').forEach((p, i) => {
    if (i < 3) {
      p.setAttribute('stroke', CLAY);
      p.setAttribute('stroke-width', '0.45');
      p.setAttribute('paint-order', 'stroke');
    }
  });
  const pshipG = s('g', { class: 'skh-phaeacian' });
  const pshipInner = s('g', { transform: 'scale(2.05)' });
  pshipInner.appendChild(pship.g);
  pshipG.appendChild(pshipInner);
  // Sleeping Odysseus on a linen sheet at the stern.
  const SL = 0.44;
  const deckY = -4.4 * 2.05;
  const rug = s('path', { d: `M-78 ${deckY - 1}H-26V${deckY + 2.6}H-78Z`, fill: WHITE, stroke: INK, 'stroke-width': 0.5 });
  const sleeper2 = new Figure({ hat: 'none', garment: 'long', garmentColor: PURPLE, scale: SL }, pose({ x: -52, y: (deckY - 5.5) / SL, lean: -90, head: -6, armF: [40, 90], armB: [-160, -50], legF: [92, 4], legB: [88, 8] }));
  pshipG.append(rug, sleeper2.g);
  pshipG.appendChild(inscription('ΟΔΥΣΣΕΥΣ', -90, deckY - 18, { size: 5, color: WHITE }));
  // Sparks of added white trailing from the magic ship.
  const sparks = s('path', { fill: 'none', stroke: WHITE, 'stroke-width': 1.3, 'stroke-linecap': 'round', opacity: 0.8 });
  pshipG.appendChild(sparks);
  tD.appendChild(pshipG);
  tD.appendChild(seaD.g);
  const hawk = falcon();
  const hawkG = s('g', { class: 'skh-falcon' });
  hawkG.appendChild(hawk.g);
  tD.appendChild(hawkG);
  root.appendChild(tD);

  /* ================================================================ */
  /* Driver                                                            */
  /* ================================================================ */
  const S = {
    stormWave: 0,
    waveFall: 0,
    raftRock: 1,
    raftX: -14,
    raftBreak: 0,
    swimX: -14,
    inoRise: 0,
    posRise: 0,
    veil: 0,
    tie: 0,
    ship: -70,
    fly: 0,
    songOn: 0,
    lyreHand: 0,
  };
  const LOGS_OUT: Array<[number, number, number]> = [[-34, -18, -40], [22, -26, 30], [-14, 10, 70], [30, 6, -60], [8, -34, 120]];

  const renderStorm = (t: number) => {
    seaA.crests.setAttribute('transform', `translate(${((-t * 34) % TILE_A).toFixed(1)} ${(Math.sin(t * 2.2) * 2).toFixed(1)})`);
    rainA.setAttribute('transform', `translate(${((t * 18) % 30).toFixed(1)} ${((t * 70) % 60).toFixed(1)})`);
    // Poseidon: rises, brandishes.
    const pr = S.posRise;
    poseidonG.setAttribute('transform', `translate(0 ${((1 - pr) * 90).toFixed(1)})`);
    poseidon.set({ armF: [168 + Math.sin(t * 2.4) * 6, 4], lean: -6 + Math.sin(t * 1.2) * 2, head: -6 + Math.sin(t * 1.7) * 2 });
    drawTrident();
    // Raft pitching; then flying apart.
    const rk = Math.sin(t * 2.1) * 9 * S.raftRock;
    raftG.setAttribute('transform', `translate(${S.raftX.toFixed(1)} ${(SEA_A + 2 + Math.sin(t * 2.1 + 1) * 3 + S.raftBreak * 10).toFixed(1)}) rotate(${rk.toFixed(1)})`);
    const wf = S.waveFall;
    bigWave.setAttribute('transform', `translate(${(RAFT_X + 30 - S.stormWave * 26 + wf * 26).toFixed(1)} ${(SEA_A + 12 + wf * 24).toFixed(1)}) scale(${(0.3 + S.stormWave * 1.1).toFixed(2)} ${(S.stormWave * 1.3 * (1 - wf * 0.6)).toFixed(2)})`);
    const b = S.raftBreak;
    raft.logs.forEach((lg, i) => {
      const [dx, dy, rot] = LOGS_OUT[i];
      lg.setAttribute('transform', `translate(${(dx * b).toFixed(1)} ${(i * 3.4 - 3 + dy * b + b * b * 30).toFixed(1)}) rotate(${(rot * b).toFixed(1)} 0 0)`);
    });
    raft.mast.setAttribute('transform', `rotate(${(-70 * b).toFixed(1)} 0 0) translate(${(-10 * b).toFixed(1)} ${(40 * b * b).toFixed(1)})`);
    // Ino rises with her veil.
    const ir = S.inoRise;
    inoG.setAttribute('transform', `translate(0 ${((1 - ir) * 80).toFixed(1)})`);
    inoG.setAttribute('opacity', Math.min(1, ir * 2).toFixed(2));
    // Swimmer.
    const sx = S.swimX;
    // Crawl: the arms wheel alternately, legs flutter, head turns to breathe.
    const ph = t * 4.2;
    const reach = (p: number) => 100 + 70 * Math.sin(p);
    swimmer.set({
      x: sx,
      armF: [reach(ph), 20 - 20 * Math.cos(ph)],
      armB: [reach(ph + Math.PI), 20 - 20 * Math.cos(ph + Math.PI)],
      legF: [-70 + Math.sin(ph * 2) * 14, 12],
      legB: [-76 - Math.sin(ph * 2) * 14, 8],
      head: -78 + Math.sin(ph) * 6,
    });
    swimG.setAttribute('transform', `translate(0 ${(Math.sin(t * 2.1) * 2).toFixed(1)})`);
    // The veil flows from Ino's hand to the swimmer's chest, then is tied on.
    if (S.veil > 0.01 && S.tie < 1) {
      const [ix, iy] = ino.hand('F');
      const j = swimmer.joints();
      const chest = swimmer.toWorld([j.P[0] + j.u[0] * 18, j.P[1] + j.u[1] * 18]);
      const from: Vec = [ix, iy + (1 - S.inoRise) * 80];
      const to: Vec = [lerp(from[0], chest[0], S.veil), lerp(from[1], chest[1], S.veil)];
      const mid: Vec = [(from[0] + to[0]) / 2, Math.min(from[1], to[1]) - 18 + Math.sin(t * 3) * 4];
      const q: Vec = [lerp(mid[0], to[0], 0.5), lerp(mid[1], to[1], 0.5) + Math.sin(t * 3 + 1) * 4];
      veil.setAttribute('d', ribbon([from, mid, q, to], [[0, 2.2], [0.5, 3.2], [1, 2.6]], 36));
      veil.setAttribute('opacity', (1 - S.tie).toFixed(2));
    } else if (veil.getAttribute('d')) veil.removeAttribute('d');
    // The sash round his chest once tied.
    if (S.tie > 0) {
      const j = swimmer.joints();
      const a = swimmer.toWorld([j.P[0] + j.u[0] * 21 - j.fwd[0] * 7, j.P[1] + j.u[1] * 21 - j.fwd[1] * 7]);
      const c = swimmer.toWorld([j.P[0] + j.u[0] * 15 + j.fwd[0] * 7, j.P[1] + j.u[1] * 15 + j.fwd[1] * 7]);
      const n = [-(c[1] - a[1]), c[0] - a[0]];
      const L = Math.hypot(n[0], n[1]) || 1;
      const w = 1.8;
      sash.setAttribute('d', `M${(a[0] + (n[0] / L) * w).toFixed(1)} ${(a[1] + (n[1] / L) * w).toFixed(1)}L${(c[0] + (n[0] / L) * w).toFixed(1)} ${(c[1] + (n[1] / L) * w).toFixed(1)}L${(c[0] - (n[0] / L) * w).toFixed(1)} ${(c[1] - (n[1] / L) * w).toFixed(1)}L${(a[0] - (n[0] / L) * w).toFixed(1)} ${(a[1] - (n[1] / L) * w).toFixed(1)}Z`);
      sash.setAttribute('opacity', S.tie.toFixed(2));
    }
  };

  const renderShore = (t: number) => {
    current.setAttribute('transform', `translate(${((t * 6) % 20).toFixed(1)} 0)`);
    sleeper.set({ head: -8 + Math.sin(t * 0.9) * 1.5, lean: -86 + Math.sin(t * 0.9) * 0.8 });
    if (ballPos.held) {
      const [hx, hy] = nausicaa.hand('F');
      ballPos.x = hx + 1.5;
      ballPos.y = hy - 5 + Math.sin(t * 3.2) * 1.2;
    }
    ballG.setAttribute('transform', `translate(${ballPos.x.toFixed(1)} ${ballPos.y.toFixed(1)})`);
    const [bx, by] = riser.hand('F');
    branch.setAttribute('transform', `translate(${(bx + 2).toFixed(1)} ${(by + 14).toFixed(1)}) rotate(8)`);
  };

  /** A point given in a figure's head frame (x forward, y down), in world space. */
  const headPt = (fig: Figure, x: number, y: number): Vec => {
    const j = fig.joints();
    const a = (j.headAngle * Math.PI) / 180;
    return fig.toWorld([j.HC[0] + x * Math.cos(a) - y * Math.sin(a), j.HC[1] + x * Math.sin(a) + y * Math.cos(a)]);
  };

  const renderHall = (t: number) => {
    // The bard plucks; lyre on his knee.
    const pluck = Math.sin(t * 7) * 8 * S.lyreHand;
    bard.set({ armF: [58 + pluck, 72 - pluck * 0.5], head: -10 + Math.sin(t * 0.8) * 2 });
    const j = bard.joints();
    const knee = bard.toWorld(j.legF.K);
    lyre.setAttribute('transform', `translate(${(knee[0] - 3).toFixed(1)} ${(knee[1] - 1).toFixed(1)}) rotate(-10) scale(1.12)`);
    // The closed eye of the blind singer.
    const e0 = headPt(bard, 2.2, -2.2), e1 = headPt(bard, 4.3, -1.3), e2 = headPt(bard, 6.2, -2.3);
    bardEye.setAttribute('d', `M${e0[0].toFixed(1)} ${e0[1].toFixed(1)}Q${e1[0].toFixed(1)} ${e1[1].toFixed(1)} ${e2[0].toFixed(1)} ${e2[1].toFixed(1)}`);
    // Weeping Odysseus: shoulders heave under the cloak drawn over his head.
    const sob = Math.max(0, Math.sin(t * 2.6)) ** 2;
    weeper.set({ lean: 14 + sob * 4, head: 26 + sob * 5, armF: [128 + sob * 4, 112] });
    const w = weeper.joints();
    const B = (along: number, back: number): Vec => weeper.toWorld([w.P[0] + w.u[0] * along - w.fwd[0] * back, w.P[1] + w.u[1] * along - w.fwd[1] * back]);
    const hoodPts: Vec[] = [
      headPt(weeper, 8, -4.6),
      headPt(weeper, 7, -11.6),
      headPt(weeper, -1, -14.6),
      headPt(weeper, -8.8, -11.4),
      headPt(weeper, -12.8, -2),
      B(24, 10),
      B(12, 11.5),
      B(0, 11),
      B(-5, 6),
      B(-2, 0.5),
      B(12, 4),
      B(24, 2),
      headPt(weeper, -2, 12),
      headPt(weeper, -0.8, 4),
      headPt(weeper, -0.2, -2),
      headPt(weeper, 2.8, -6.2),
    ];
    hood.setAttribute('d', smoothClosed(hoodPts));
    hoodLines.setAttribute('d', smoothOpen([headPt(weeper, 4, -9.5), headPt(weeper, -6, -8.5), headPt(weeper, -10, 3), B(14, 9), B(2, 8.5)]) + smoothOpen([headPt(weeper, 0.5, -12), headPt(weeper, -7, -5), headPt(weeper, -7.4, 8), B(14, 6), B(1, 5)]) + smoothOpen([headPt(weeper, -2.6, -2), B(26, 3.4), B(12, 2.6)]));
    // The king breathes, sceptre upright.
    alkinoos.set({ head: -4 + Math.sin(t * 0.7) * 1.5, lean: -2 + Math.sin(t * 0.9) * 0.8 });
    const [kx, ky] = alkinoos.hand('F');
    sceptre.setAttribute('transform', `translate(${kx.toFixed(1)} ${ky.toFixed(1)})`);
    // The song drifts across the hall toward him.
    if (S.songOn > 0) {
      const mouth = headPt(bard, 11, 1);
      const ear = headPt(weeper, -2, -16);
      const curve = sampleSpline([mouth, [lerp(mouth[0], ear[0], 0.35), mouth[1] - 26], [lerp(mouth[0], ear[0], 0.7), ear[1] - 26], ear], 40);
      const acc = [0];
      for (let i = 1; i < curve.length; i++) acc.push(acc[i - 1] + Math.hypot(curve[i][0] - curve[i - 1][0], curve[i][1] - curve[i - 1][1]));
      const total = acc[acc.length - 1];
      const n = songLetters.length;
      const spacing = 5.2;
      const span = n * spacing + 30;
      songLetters.forEach((g, i) => {
        const d = ((t * 12 - (n - 1 - i) * spacing) % span + span) % span;
        if (d > total * 0.86) {
          g.setAttribute('opacity', '0');
          return;
        }
        let k = 1;
        while (k < acc.length - 1 && acc[k] < d) k++;
        const f = (d - acc[k - 1]) / (acc[k] - acc[k - 1] || 1);
        const x = lerp(curve[k - 1][0], curve[k][0], f), y = lerp(curve[k - 1][1], curve[k][1], f);
        const ang = (Math.atan2(curve[k][1] - curve[k - 1][1], curve[k][0] - curve[k - 1][0]) * 180) / Math.PI;
        const fade = Math.min(1, d / 10) * Math.min(1, (total * 0.86 - d) / 16);
        g.setAttribute('opacity', (fade * S.songOn).toFixed(2));
        g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)})`);
      });
    }
  };

  const tearDrops: Array<{ el: SVGPathElement; t0: number }> = [];
  const renderTears = (t: number) => {
    if (tearDrops.length < 3 && Math.random() < 0.03) {
      const [x, y] = headPt(weeper, 4.6, 1.2);
      const el = s('path', { d: 'M0 -2.2C1.4 0 1.6 1.4 0 1.8C-1.6 1.4 -1.4 0 0 -2.2Z', fill: WHITE, stroke: INK, 'stroke-width': 0.3, transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})` });
      el.dataset.x = String(x);
      el.dataset.y = String(y);
      tears.appendChild(el);
      tearDrops.push({ el, t0: t });
    }
    for (let i = tearDrops.length - 1; i >= 0; i--) {
      const d = tearDrops[i];
      const age = t - d.t0;
      const y = +(d.el.dataset.y ?? 0) + age * age * 40;
      d.el.setAttribute('transform', `translate(${d.el.dataset.x} ${y.toFixed(1)})`);
      d.el.setAttribute('opacity', Math.max(0, 1 - age / 1.1).toFixed(2));
      if (age > 1.1) {
        d.el.remove();
        tearDrops.splice(i, 1);
      }
    }
  };

  const renderNight = (t: number) => {
    seaD.crests.setAttribute('transform', `translate(${((-t * 26) % TILE_D).toFixed(1)} ${(Math.sin(t * 1.3) * 0.8).toFixed(1)})`);
    pshipG.setAttribute('transform', `translate(${S.ship.toFixed(1)} ${(84 + Math.sin(t * 1.4) * 1.2).toFixed(1)}) rotate(${(Math.sin(t * 1.1) * 0.8).toFixed(2)})`);
    shipGlow.setAttribute('cx', (S.ship + 4).toFixed(1));
    shipGlow.setAttribute('opacity', (0.8 + Math.sin(t * 2) * 0.2).toFixed(2));
    let sp = '';
    for (let i = 0; i < 9; i++) {
      const age = (t * 0.9 + i / 9) % 1;
      const x = -100 - age * 70 + Math.sin(i * 7.3) * 6, y = -26 - i * 6 + Math.sin(t * 2 + i) * 3 + age * 10;
      sp += `M${x.toFixed(1)} ${y.toFixed(1)}h.1`;
    }
    sparks.setAttribute('d', sp);
    // The falcon cannot keep up.
    const fx = S.ship + 70 - S.fly * 190, fy = -54 + Math.sin(t * 1.8) * 5 + S.fly * 10;
    hawkG.setAttribute('transform', `translate(${fx.toFixed(1)} ${fy.toFixed(1)}) scale(1.1)`);
    hawk.set((Math.sin(t * 9) + 1) / 2);
  };

  let scene: 'A' | 'B' | 'C' | 'D' = 'A';
  // Tableaux not on show are taken out of rendering, so they can never catch a tap.
  for (const g of [tB, tC, tD]) g.style.display = 'none';
  const tick = (t: number) => {
    now = t;
    if (scene === 'A') renderStorm(t);
    else if (scene === 'B') renderShore(t);
    else if (scene === 'C') {
      renderHall(t);
      renderTears(t);
    } else renderNight(t);
  };
  // Render every frame; the idle clock is frozen under reduced motion (st.loop pauses it).
  const clock = { t: 0 };
  st.loop(gsap.to(clock, { t: 100000, duration: 100000, ease: 'none' }));
  const onFrame = () => tick(clock.t);
  gsap.ticker.add(onFrame);
  ctx.signal.addEventListener('abort', () => gsap.ticker.remove(onFrame));
  tick(0);
  let rowingTl: gsap.core.Timeline | null = null;

  /** Cross-fade from one tableau to the next. */
  const cut = (from: SVGGElement, to: SVGGElement, next: typeof scene, dur = 0.9) => {
    const tl = st.timeline();
    tl.to(from, { opacity: 0, x: 30, duration: dur * 0.7, ease: 'power2.in' })
      .call(() => {
        from.style.display = 'none';
        to.style.display = '';
        scene = next;
        tick(now);
      })
      .fromTo(to, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: dur, ease: 'power3.out' });
    return tl;
  };

  return {
    enter() {
      // Poseidon rises; lightning; the great wave breaks the raft.
      ctx.atlas.setMood('storm');
      ctx.atlas.setWeather('storm');
      ctx.audio.sfx('storm');
      const tl = st.timeline();
      tl.to(S, { posRise: 1, duration: 1.3, ease: 'power2.out' }, 0.1)
        .call(() => {
          ctx.atlas.flash();
          ctx.audio.sfx('thunder');
        }, [], 1.0)
        .to(bolt, { opacity: 1, duration: 0.05 }, 1.0)
        .to(bolt, { opacity: 0, duration: 0.4 }, 1.2)
        // The great wave rears up behind the raft and falls on it.
        .to(bigWave, { opacity: 1, duration: 0.2 }, 1.2)
        .to(S, { stormWave: 1, duration: 0.55, ease: 'power2.out' }, 1.2)
        .call(() => ctx.audio.sfx('splash'), [], 1.7)
        .to(S, { raftBreak: 1, raftRock: 0.3, duration: 0.7, ease: 'power2.out' }, 1.7)
        .to(S, { waveFall: 1, duration: 0.45, ease: 'power2.in' }, 1.72)
        .to(bigWave, { opacity: 0, duration: 0.45, ease: 'power2.in' }, 1.72)
        .to(odyRaft.g, { opacity: 0, duration: 0.15 }, 1.75)
        .set(swimG, { opacity: 1 }, 1.9)
        .fromTo(S, { swimX: RAFT_X - 10 }, { swimX: RAFT_X, duration: 0.6 }, 1.9)
        .to(odyLabelA, { x: -8, y: 88, duration: 0.6, ease: 'power2.inOut' }, 1.9)
        .to(raftG, { opacity: 0, duration: 0.5 }, 2.2);
      return st.play(tl);
    },

    async beat(i) {
      if (i === 0) {
        // Ino-Leukothea gives her veil; she dives back; he swims; then sleep under the olives.
        const tl = st.timeline();
        tl.to(S, { inoRise: 1, duration: 0.6, ease: 'power2.out' }, 0)
          .call(() => ctx.audio.sfx('magic'), [], 0.3)
          .to(S, { veil: 1, duration: 0.6, ease: 'power1.inOut' }, 0.35)
          .to(S, { tie: 1, duration: 0.3 }, 0.95)
          .to(S, { inoRise: 0, duration: 0.5, ease: 'power2.in' }, 1.0)
          .to(S, { posRise: 0, duration: 0.8, ease: 'power2.in' }, 0.8)
          .to(S, { swimX: 150, duration: 1.0, ease: 'power1.in' }, 1.1)
          .to(odyLabelA, { opacity: 0, duration: 0.3 }, 1.1)
          .call(() => {
            ctx.atlas.setMood('night');
            ctx.atlas.setWeather('none');
          }, [], 1.6)
          .add(cut(tA, tB, 'B', 0.65), 1.55);
        return st.play(tl);
      }

      if (i === 1) {
        // Nausicaa and her maidens come down to the river mouth; the washing is spread to dry.
        ctx.atlas.setMood('dawn');
        const intro = st.timeline();
        intro.to(nightB, { opacity: 0, duration: 0.8 }, 0)
          .fromTo(dawnSunG, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, 0)
          .to(dayFill, { opacity: 1, duration: 0.6 }, 0.4)
          .to(washing, { opacity: 1, duration: 0.5 }, 0.3)
          .fromTo(girls, { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 1, ease: 'power2.out' }, 0.4)
          .to(ballG, { opacity: 1, duration: 0.3 }, 1.1)
          .call(() => ctx.atlas.setMood('day'), [], 1.2);
        await st.play(intro);
        // The ball game. Tap the ball: Nausicaa throws, the maiden misses, it drops in the river.
        await ctx.tap(ballHit, { label: 'Topa dokun: at' });
        const tl = st.timeline();
        tl.add(nausicaa.to({ armF: [60, 10], lean: 12, head: 0 }, { duration: 0.25, ease: 'power2.in' }), 0);
        tl.call(() => void (ballPos.held = false), [], 0.18);
        const from = { x: 0, y: 0 };
        const arc = { u: 0 };
        tl.call(() => {
          from.x = ballPos.x;
          from.y = ballPos.y;
        }, [], 0.18);
        tl.to(arc, {
          u: 1,
          duration: 1.05,
          ease: 'none',
          onUpdate: () => {
            const u = arc.u;
            const to: Vec = [104, GROUND + 2];
            ballPos.x = lerp(from.x, to[0], u);
            ballPos.y = lerp(from.y, to[1], u) - Math.sin(u * Math.PI) * 44 * (1 - u * 0.25);
            theBall.setAttribute('transform', `rotate(${(u * 720).toFixed(0)})`);
          },
        }, 0.18);
        tl.add(maidA.to({ armF: [170, 10], armB: [160, 20], lean: -10, head: -24 }, { duration: 0.4 }), 0.35);
        tl.call(() => {
          ctx.audio.sfx('splash');
          const sp = s('g');
          sp.appendChild(splash(104, GROUND, 0.7));
          river.appendChild(sp);
          st.timeline().fromTo(sp, { scale: 0.2, transformOrigin: '50% 100%' }, { scale: 1, duration: 0.3, ease: 'power2.out' }).to(sp, { opacity: 0, duration: 0.7 }, 0.5);
        }, [], 1.23);
        tl.to(theBall, { opacity: 0, duration: 0.2 }, 1.23);
        return st.play(tl);
      }

      if (i === 2) {
        // A scream: the maidens flee; Odysseus rises from the thicket; Nausicaa stands firm.
        const tl = st.timeline();
        // They scream, turn away from the naked stranger and run for it.
        tl.call(() => {
          maidA.style.facing = 1;
          maidB.style.facing = 1;
          maidA.render();
          maidB.render();
        }, [], 0);
        tl.add(maidA.to({ ...POSES.run(24, GROUND), armF: [160, 30], armB: [140, 40], head: -10 }, { duration: 0.3 }), 0);
        tl.add(maidB.to({ ...POSES.run(62, GROUND / 0.96), armF: [170, 20], armB: [150, 30], head: -10 }, { duration: 0.3 }), 0.1);
        tl.to(runA, { x: 130, duration: 1.3, ease: 'power2.in' }, 0.3).to(runA, { opacity: 0, duration: 0.4 }, 1.2);
        tl.to(runB, { x: 100, duration: 1.1, ease: 'power2.in' }, 0.35).to(runB, { opacity: 0, duration: 0.4 }, 1.05);
        // Nausicaa turns to face him.
        tl.add(nausicaa.to({ armF: [40, 30], armB: [20, 20], lean: -4, head: 2 }, { duration: 0.4 }), 0.6);
        tl.call(() => {
          nausicaa.style.facing = -1;
          nausicaa.render();
        }, [], 0.8);
        // He rises from the leaves, branch before him.
        tl.to(sleeperG, { opacity: 0, duration: 0.3 }, 0.5);
        tl.to(riserG, { opacity: 1, duration: 0.3 }, 0.5);
        tl.add(riser.to({ ...POSES.walk(-92, GROUND), lean: 6, head: -2, armF: [52, 60], armB: [-20, 30] }, { duration: 1.1, ease: 'power2.out' }), 0.55);
        return st.play(tl);
      }

      if (i === 3) {
        // Alkinoos's hall.
        S.lyreHand = 1;
        const tl = cut(tB, tC, 'C');
        tl.to(S, { songOn: 1, duration: 0.8 }, 1.2);
        return st.play(tl);
      }

      if (i === 4) {
        // Night: the Phaeacian ship carries him home asleep.
        ctx.atlas.setMood('night');
        ctx.atlas.setWeather('night');
        const tl = cut(tC, tD, 'D', 0.8);
        rowingTl = st.loop(rowing(pship.oars, gsap, 1.4));
        tl.to(S, { ship: 10, duration: 1.9, ease: 'power1.out' }, 0.5).call(() => ctx.audio.sfx('depart'), [], 0.5);
        // The falcon, swiftest of birds, falls behind (keeps going after the beat).
        st.timeline().to(S, { fly: 1, duration: 6, ease: 'power1.in' }, 0.8);
        return st.play(tl);
      }
    },

    destroy() {
      gsap.ticker.remove(onFrame);
      rowingTl?.kill();
      st.destroy();
    },
  };
};

/** Smooth open path through points. */
function smoothOpen(pts: Vec[]): string {
  const c = sampleSpline(pts, pts.length * 5);
  return c.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('');
}

/** Smooth closed path through points (Catmull–Rom). */
function smoothClosed(pts: Vec[]): string {
  const n = pts.length;
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const k = 0.18;
    d += `C${(p1[0] + (p2[0] - p0[0]) * k).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) * k).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) * k).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) * k).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d + 'Z';
}
