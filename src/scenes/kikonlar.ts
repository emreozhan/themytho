/**
 * Ε′ Kikonlar — Ismaros in Thrace (Od. 9.39–66).
 *
 * Tableau A (beat 0): the Achaeans storm the little walled town of the
 *   Kikonians in the archaic "Knielauf"; the gate bursts, the roofs burn.
 * Tableau B (beat 1): Maron, priest of Apollo, gives Odysseus twelve jars of
 *   dark sweet wine. Tap a jar: a sailor shoulders it and the jars go aboard.
 * Tableau C (beat 2): the crew feasts on the shore at dusk; at dawn the
 *   Kikonian host pours down the hill. Tap the ship: the feasters run for it.
 * Tableau D (beat 3): the ships row away; six shields and six spears stand on
 *   the shore where the comrades fell.
 */
import { s } from '../lib/dom';
import { gsap } from '../lib/motion';
import type { Vec } from '../lib/geometry';
import { Figure, POSES, pose, INK, CLAY, PURPLE, STAND_HEIGHT, shield, spear, bowPath, type Pose } from '../art/figure';
import { exergue, sea, flames, inscription, fillers, amphora, kylix, oliveTree, column, stars, moon, rock, reeds } from '../art/kit';
import { ship, rowing, BLACK_FIGURE } from '../art/ship';
import { bird } from '../art/animals';
import { waveStripPath } from '../art/ornaments';
import { stage } from './tools';
import { Dressed, alopekis, laurel, himation, pelta, krater, roast, fortress, tripod, Horse } from './kikonlar.art';
import type { SceneFactory } from '../story/types';

const GROUND = 96;

/** Width of one wave crest in `waveStripPath(576, h)` (the strip loops seamlessly by this much). */
const crestTile = (h: number) => 576 / Math.max(1, Math.round(576 / (1.6 * h)));

/** Enlarge a tableau laid out in figure units about the groundline. */
const fill = (k: number) => `translate(0 ${GROUND}) scale(${k}) translate(0 ${-GROUND})`;

/**
 * Turn a figure round. (Figure.render passes `transform: null` for an unmirrored,
 * unscaled figure, which `attr()` skips, so a stale mirror would survive: clear it here.)
 */
function face(fig: Figure, facing: 1 | -1): void {
  fig.style.facing = facing;
  fig.render();
  if (facing === 1 && (fig.style.scale ?? 1) === 1) fig.g.removeAttribute('transform');
}

/** An endless running/walking leg cycle on a figure (arms optional). */
function stride(fig: Figure, o: { run?: boolean; speed?: number; arms?: boolean; baseY?: number; phase?: number } = {}): gsap.core.Tween {
  const p = { v: o.phase ?? 0 };
  const baseY = o.baseY ?? fig.pose.y;
  return gsap.to(p, {
    v: `+=1`,
    duration: 1 / (o.speed ?? 1),
    ease: 'none',
    repeat: -1,
    onUpdate: () => {
      const a = p.v * Math.PI * 2;
      const sn = Math.sin(a), cs = Math.cos(a);
      const patch: Partial<Pose> = o.run
        ? {
            legF: [24 + 44 * sn, 34 + 52 * Math.max(0, cs)],
            legB: [24 - 44 * sn, 34 + 52 * Math.max(0, -cs)],
            footF: 10 * Math.max(0, cs),
            footB: 10 * Math.max(0, -cs),
            y: baseY - 2.4 * Math.abs(Math.sin(a)),
          }
        : {
            legF: [4 + 20 * sn, 6 + 16 * Math.max(0, cs)],
            legB: [4 - 20 * sn, 6 + 16 * Math.max(0, -cs)],
            y: baseY - 0.9 * Math.abs(Math.sin(a)),
          };
      if (o.arms) {
        patch.armF = [18 - 40 * sn, 50];
        patch.armB = [18 + 40 * sn, 50];
      }
      fig.set(patch);
    },
  });
}

/** Run a stride loop between two times of a timeline (started and stopped by calls, so the timeline stays finite). */
function gaitWindow(tl: gsap.core.Timeline, st: { loop<T extends gsap.core.Animation>(a: T): T }, make: () => gsap.core.Tween, t0: number, t1: number): void {
  let g: gsap.core.Tween | null = null;
  tl.call(() => void (g = st.loop(make())), [], t0);
  tl.call(() => g?.kill(), [], t1);
}

/** Round shield carried on the forearm: centre between elbow and wrist, in world space. */
function shieldAt(fig: Figure, dx = 2): Vec {
  const j = fig.joints();
  const c: Vec = [(j.armF.E[0] + j.armF.W[0]) / 2 + dx, (j.armF.E[1] + j.armF.W[1]) / 2];
  return fig.toWorld(c);
}

export const scene: SceneFactory = (ctx) => {
  const st = stage(ctx);
  const root = ctx.root;
  const defs = ctx.defs;

  // Back to front: sky tint (for dusk), ground, tableaux.
  const skyTint = s('rect', { x: -200, y: -200, width: 400, height: 400, fill: INK, opacity: 0, 'pointer-events': 'none' });
  root.appendChild(skyTint);
  const ground = exergue(GROUND, { band: 'tongues' });
  root.appendChild(ground);

  /* ================================================================ */
  /* Tableau A — the raid on Ismaros                                  */
  /* ================================================================ */
  const KA = 1.42;
  const tA = s('g', { class: 'kik-raid', transform: fill(KA) });
  root.insertBefore(tA, ground);

  // Kikonian defenders on the wall walk (drawn before the wall, which hides their legs):
  // a spearman behind his crescent shield and a man about to hurl a stone.
  const defenders: Dressed[] = [];
  const defGear: SVGGElement[] = [];
  const spearman = new Dressed({ garment: 'short', garmentColor: PURPLE, facing: -1, scale: 0.84 }, pose({ ...POSES.stand(48, 70 / 0.84), lean: 4, armF: [96, 50], armB: [150, -20] })).wear(alopekis());
  const slinger = new Dressed({ garment: 'short', garmentColor: INK, cloak: true, cloakColor: PURPLE, facing: -1, scale: 0.84 }, pose({ ...POSES.stand(74, 70 / 0.84), lean: -8, armF: [60, 30], armB: [170, 30] })).wear(alopekis());
  defenders.push(spearman, slinger);
  const defSpear = spear([22, 16], [-24, -22]);
  const defShield = pelta(9.5);
  const stone = s('path', { d: 'M-3.6 0.4C-4 -2.6 -1.2 -4.2 1.4 -3.6C3.8 -3 4.4 -0.6 3.2 1.6C2 3.6 -2.8 3.4 -3.6 0.4Z', fill: INK, stroke: CLAY, 'stroke-width': 0.6, 'paint-order': 'stroke' });
  const g1 = s('g');
  g1.append(defSpear, spearman.g, defShield);
  const g2 = s('g');
  g2.append(slinger.g, stone);
  defGear.push(g1, g2);
  tA.append(g1, g2);
  const armDefenders = () => {
    const c = shieldAt(spearman, 0);
    defShield.setAttribute('transform', `translate(${c[0].toFixed(1)} ${(c[1] + 1).toFixed(1)}) rotate(-10)`);
    const w = spearman.hand('B');
    defSpear.setAttribute('transform', `translate(${w[0].toFixed(1)} ${w[1].toFixed(1)})`);
    const h = slinger.hand('B');
    if (stone.dataset.thrown !== '1') stone.setAttribute('transform', `translate(${(h[0] - 2).toFixed(1)} ${(h[1] - 3).toFixed(1)})`);
  };
  armDefenders();

  const fort = fortress(GROUND, { from: 44, to: 210, height: 72, gate: 60, gateW: 24, tower: 90 });
  tA.appendChild(fort.g);

  // Fire on the tower, temple and parapet (hidden until the sack). Each flame sits in its own
  // wrapper so GSAP can scale it without touching the kit's transform.
  const fires: SVGGElement[] = [];
  for (const [x, y, k] of [[86, -19, 0.7], [97, -18, 0.46], [77, -19, 0.46], [61, 21, 0.62], [48, 21, 0.5], [110, -2, 0.55]] as Array<[number, number, number]>) {
    const w = s('g', { opacity: 0 });
    w.appendChild(flames(x, y, k));
    fires.push(w);
    tA.appendChild(w);
  }

  // Odysseus the archer, with a fire arrow on the string.
  const archer = new Figure({ hat: 'pilos', garment: 'short', garmentColor: PURPLE, cloak: true }, pose({ ...POSES.stand(-74, GROUND), legF: [22, 4], legB: [-14, 4], armF: [90, -4], armB: [40, 30] }));
  const bow = s('path', { fill: INK });
  const bowString = s('path', { fill: 'none', stroke: INK, 'stroke-width': 0.6 });
  const arrow = s('g', { class: 'kik-arrow' });
  arrow.appendChild(s('path', { d: 'M-30 0H14', stroke: INK, 'stroke-width': 1 }));
  arrow.appendChild(s('path', { d: 'M-30 0l-3 -2.4M-30 0l-3 2.4M-26 0l-3 -2.4M-26 0l-3 2.4', stroke: INK, 'stroke-width': 0.7 }));
  arrow.appendChild(s('path', { d: 'M13 -1.8L18 0L13 1.8Z', fill: INK }));
  const arrowFire = s('g', { transform: 'translate(15 2.6) rotate(90) scale(0.3)' });
  arrowFire.appendChild(flames(0, 0, 1));
  arrow.appendChild(arrowFire);
  tA.append(archer.g, bow, bowString, arrow);
  const drawState = { k: 0.35 };
  /** Draw the bow: k = 0 relaxed (string straight), 1 fully drawn to the chest. */
  const drawBow = () => {
    const j = archer.joints();
    const grip = archer.toWorld(j.armF.W);
    const a: Vec = [grip[0] + 2, grip[1] - 24];
    const b: Vec = [grip[0] + 2, grip[1] + 24];
    const hand = archer.toWorld(j.armB.W);
    const k = drawState.k;
    const rest: Vec = [grip[0] - 3, grip[1]];
    const dp: Vec = [rest[0] + (hand[0] - rest[0]) * k, rest[1] + (hand[1] - rest[1]) * k];
    const bp = bowPath(a, b, -7 - 3 * k, dp);
    bow.setAttribute('d', bp.limb);
    bowString.setAttribute('d', bp.string);
    if (arrow.dataset.flying !== '1') arrow.setAttribute('transform', `translate(${(dp[0] + 30).toFixed(1)} ${dp[1].toFixed(1)})`);
  };
  drawBow();

  // The Achaeans: two hoplites crouched behind their shields, ready to storm the gate.
  interface Hoplite { fig: Figure; wrap: SVGGElement; sh: SVGGElement; sp: SVGGElement; x: number }
  const hoplites: Hoplite[] = [];
  const hopDefs: Array<[number, 'star' | 'tripod' | 'lion', string]> = [[-32, 'tripod', INK], [12, 'star', PURPLE]];
  for (const [x, dev, cloth] of hopDefs) {
    const fig = new Figure({ hat: 'helmet', garment: 'short', garmentColor: cloth }, pose({ ...POSES.knielauf(x, GROUND), armF: [72, 58], armB: [150, -40] }));
    const wrap = s('g', { class: 'hoplite' });
    const sh = shield([0, 0], 13.5, dev);
    const sp = spear([-33, 7.5], [33, -7.5]);
    wrap.append(sp, fig.g, sh);
    tA.appendChild(wrap);
    hoplites.push({ fig, wrap, sh, sp, x });
  }
  /** Keep each hoplite's shield on his forearm and the spear in his raised hand. */
  const arm = () => {
    for (const h of hoplites) {
      const c = shieldAt(h.fig);
      h.sh.setAttribute('transform', `translate(${c[0].toFixed(1)} ${c[1].toFixed(1)})`);
      const w = h.fig.hand('B');
      h.sp.setAttribute('transform', `translate(${w[0].toFixed(1)} ${w[1].toFixed(1)})`);
    }
  };
  arm();

  tA.appendChild(inscription('ΟΔΥΣΣΕΥΣ', -104, -14, { size: 6.4 }));
  tA.appendChild(inscription('ΙΣΜΑΡΟΣ', -6, -44, { size: 6.4 }));
  tA.appendChild(fillers([[-58, -52], [-24, -68], [34, -62], [18, -22], [-104, 18]], 4.6));

  /* ================================================================ */
  /* Shore (beats 1–2): surf at the left, the beached ship            */
  /* ================================================================ */
  const shore = s('g', { class: 'kik-shore', opacity: 0 });
  shore.style.display = 'none';
  root.insertBefore(shore, ground);
  const surfClip = s('clipPath', { id: 'kik-surf', 'data-scene': '' });
  surfClip.appendChild(s('rect', { x: -200, y: 40, width: 150, height: 80 }));
  defs.appendChild(surfClip);
  const surfWrap = s('g', { 'clip-path': 'url(#kik-surf)' });
  const surf = s('path', { d: waveStripPath(576, 11), transform: `translate(-288 ${GROUND - 9})`, fill: INK });
  const surfMove = s('g');
  surfMove.appendChild(surf);
  surfWrap.appendChild(surfMove);
  shore.appendChild(surfWrap);

  // The ship, beached stern-first with its bow to the sea (built facing +x, mirrored).
  const SHIP = { x: -98, y: 89.5, k: 1.75 };
  const shipWrap = s('g', { class: 'kik-ship' });
  const shipMover = s('g');
  shipMover.setAttribute('transform', `translate(${SHIP.x} ${SHIP.y}) scale(${-SHIP.k} ${SHIP.k})`);
  const hull = ship({ palette: BLACK_FIGURE, sail: 'furled', oars: 11, crew: 0 });
  hull.oars.style.opacity = '0';
  const cargo = s('g', { class: 'kik-cargo' });
  hull.g.insertBefore(cargo, hull.hull);
  const crew = s('g', { class: 'kik-crew', opacity: 0 });
  for (let c = 0; c < 8; c++) {
    const x = -24 + c * 6.4;
    crew.appendChild(s('circle', { cx: x, cy: -8.6, r: 2.3, fill: INK }));
    crew.appendChild(s('path', { d: `M${x - 2.2} -6.8L${x + 2.2} -6.8L${x + 1.4} -3L${x - 1.4} -3Z`, fill: INK }));
  }
  hull.g.insertBefore(crew, hull.hull);
  shipMover.appendChild(hull.g);
  shipWrap.appendChild(shipMover);
  // Tap target: the visible part of the ship (the bow runs off the picture).
  const shipHit = s('rect', { x: -128, y: 24, width: 110, height: 74, fill: 'transparent' });
  shipWrap.appendChild(shipHit);
  shore.appendChild(shipWrap);
  /** Twelve jars stowed amidships (necks above the gunwale), revealed as they come aboard. */
  const HOLD_K = 0.28;
  const holdX = (i: number) => -25 + i * 4.3;
  const stowed: SVGGElement[] = [];
  for (let i = 0; i < 12; i++) {
    const jar = s('g', { opacity: 0 });
    const a = amphora(holdX(i), 1.5, HOLD_K);
    a.setAttribute('stroke', CLAY);
    a.setAttribute('stroke-width', '2.6');
    a.setAttribute('paint-order', 'stroke');
    jar.appendChild(a);
    stowed.push(jar);
    cargo.appendChild(jar);
  }
  /** World position of hold slot i (the jar's toe). */
  const holdWorld = (i: number): Vec => [SHIP.x - SHIP.k * holdX(i), SHIP.y + SHIP.k * 1.5];

  /* ================================================================ */
  /* Tableau B — Maron's gift                                         */
  /* ================================================================ */
  const KB = 1.15;
  const toB = (p: Vec): Vec => [p[0] / KB, GROUND + (p[1] - GROUND) / KB];
  const tB = s('g', { class: 'kik-gift', transform: fill(KB), opacity: 0 });
  tB.style.display = 'none';
  root.insertBefore(tB, ground);
  // Apollo's grove behind the priest, a raven of Apollo in the branches.
  tB.appendChild(oliveTree(126, GROUND, 1.2, 23));
  // Apollo's sanctuary: a column crowned with his tripod.
  const COL_X = 30;
  tB.appendChild(column(COL_X, GROUND, 122, 11));
  const tri = tripod(0.92);
  tri.setAttribute('transform', `translate(${COL_X} ${GROUND - 122}) scale(0.92)`);
  tB.appendChild(tri);
  tB.appendChild(bird(128, -20, 0.66));
  // Twelve jars in two staggered rows; clay outlines keep overlapping jars legible.
  const JAR_K = 0.4;
  interface Jar { g: SVGGElement; x: number; y: number }
  const jars: Jar[] = [];
  const jarLayer = s('g', { class: 'kik-jars' });
  const mkJar = (x: number, y: number) => {
    const g = s('g', { transform: `translate(${x} ${y})` });
    const a = amphora(0, 0, JAR_K);
    a.setAttribute('stroke', CLAY);
    a.setAttribute('stroke-width', '2.4');
    a.setAttribute('paint-order', 'stroke');
    g.appendChild(a);
    return { g, x, y };
  };
  const back: Jar[] = [], front: Jar[] = [];
  for (let k = 0; k < 6; k++) back.push(mkJar(10 + k * 7.6, GROUND - 3.4));
  for (let k = 0; k < 6; k++) front.push(mkJar(6 + k * 7.6, GROUND));
  back.forEach((j) => jarLayer.appendChild(j.g));
  front.forEach((j) => jarLayer.appendChild(j.g));
  // Loading order: the front row from the ship end, then the back row.
  jars.push(...front, ...back);
  tB.appendChild(jarLayer);

  // The sailor who shoulders the jars (a wrapper lets him turn round).
  const sailorWrap = s('g');
  const sailor = new Figure({ head: 'youth', garment: 'short', garmentColor: INK }, pose({ ...POSES.stand(-8, GROUND), armF: [20, 30], armB: [-10, 20] }));
  sailorWrap.appendChild(sailor.g);
  tB.appendChild(sailorWrap);
  // Jars in the sailor's hands are drawn in front of him.
  const carryLayer = s('g', { class: 'kik-carry' });
  tB.appendChild(carryLayer);
  const odyB = new Figure({ hat: 'pilos', garment: 'short', garmentColor: PURPLE }, pose({ ...POSES.stand(64, GROUND), armF: [60, 40], armB: [-6, 16] }));
  const maron = new Dressed({ head: 'old', garment: 'long', garmentColor: INK, cloak: true, cloakColor: PURPLE, facing: -1 }, pose({ ...POSES.stand(102, GROUND), lean: 4, armF: [78, 14], armB: [40, 60] })).wear(laurel());
  const cup = kylix(0, 0, 0.62);
  const maronWrap = s('g');
  maronWrap.appendChild(maron.g);
  tB.append(odyB.g, maronWrap, cup);
  let maronCup = true;
  const placeCup = () => {
    if (!maronCup) return;
    const [hx, hy] = maron.hand('F');
    cup.setAttribute('transform', `translate(${(hx - 4).toFixed(1)} ${(hy + 1).toFixed(1)}) scale(0.62)`);
  };
  const placeCupOdy = () => {
    const [hx, hy] = odyB.hand('F');
    cup.setAttribute('transform', `translate(${(hx + 3).toFixed(1)} ${(hy + 1).toFixed(1)}) rotate(-20) scale(0.62)`);
  };
  placeCup();
  tB.appendChild(inscription('ΟΔΥΣΣΕΥΣ', 48, -18, { size: 6, angle: 90 }));
  tB.appendChild(inscription('ΜΑΡΩΝ', 86, -26, { size: 6 }));
  tB.appendChild(fillers([[-40, -70], [-10, -38], [-6, 8], [66, -60], [-78, -40]], 4.4));

  /* ================================================================ */
  /* Tableau C — the feast on the shore, the host on the hill          */
  /* ================================================================ */
  const tC = s('g', { class: 'kik-feast', opacity: 0 });
  tC.style.display = 'none';
  root.insertBefore(tC, ground);
  // Night sky: stars and a crescent moon in added white (faded in at dusk).
  const night = s('g', { opacity: 0 });
  night.appendChild(stars(26, { x: -150, y: -150, w: 300, h: 120 }, 41));
  night.appendChild(moon(-54, -104, 11));
  tC.appendChild(night);
  // The hill the Kikonians come down (the host is drawn first, so the hill hides it until it crests).
  const SLOPE_A: Vec = [98, GROUND];
  const SLOPE_B: Vec = [176, 30];
  const slopeY = (x: number) => (x <= SLOPE_A[0] ? GROUND : SLOPE_A[1] + ((x - SLOPE_A[0]) * (SLOPE_B[1] - SLOPE_A[1])) / (SLOPE_B[0] - SLOPE_A[0]));
  const hostLayer = s('g', { class: 'kik-host' });
  tC.appendChild(hostLayer);
  const hostLabel = inscription('ΚΙΚΟΝΕΣ', 0, 0, { size: 6 });
  hostLayer.appendChild(hostLabel);
  tC.appendChild(rock([[SLOPE_A[0] - 6, GROUND + 4], [SLOPE_A[0] + 8, GROUND - 8], [128, 66], [150, 48], [SLOPE_B[0], SLOPE_B[1]], [200, 20], [200, 140], [90, 140]], { lines: 4, seed: 7 }));
  tC.appendChild(reeds(110, 86, 5, 14));

  // The host: Thracian spearmen in fox caps with crescent shields, a forest of spears.
  interface Warrior { fig: Dressed; wrap: SVGGElement; sp: SVGGElement; pl: SVGGElement; off: number }
  const host: Warrior[] = [];
  const HOST_K = 0.9;
  for (let k = 0; k < 6; k++) {
    const fig = new Dressed({ garment: 'short', garmentColor: k % 2 ? INK : PURPLE, cloak: k % 3 === 0, cloakColor: PURPLE, facing: -1, scale: HOST_K }, pose({ ...POSES.walk(0, 0), lean: 6, armF: [74, 44], armB: [118, -24] })).wear(alopekis());
    const wrap = s('g');
    const sp = spear([26, 10], [-40, -18]);
    const pl = pelta(10.5);
    wrap.append(sp, fig.g, pl);
    hostLayer.appendChild(wrap);
    host.push({ fig, wrap, sp, pl, off: k * 17 });
  }
  // A horseman leads them: the Kikonians knew how to fight from horses (Od. 9.49).
  const riderWrap = s('g', { class: 'kik-rider' });
  const horse = new Horse();
  const rider = new Dressed({ garment: 'short', garmentColor: PURPLE, cloak: true, cloakColor: INK }, pose({ x: 2, y: -64, lean: 6, legF: [64, 64], legB: [56, 60], armF: [70, 40], armB: [150, -30] })).wear(alopekis());
  riderWrap.append(horse.g, rider.g, spear([-20, -50], [60, -96]));
  hostLayer.appendChild(riderWrap);
  const RIDER_K = 0.8;
  // The horseman rides ahead of the spearmen, plunging down the slope, level on the beach.
  const riderPos = { x: 250 };
  const placeRider = () => {
    const rx = riderPos.x;
    const onSlope = Math.min(1, Math.max(0, (rx - SLOPE_A[0] + 6) / 16));
    riderWrap.setAttribute('transform', `translate(${rx.toFixed(1)} ${slopeY(rx).toFixed(1)}) rotate(${(-20 * onSlope).toFixed(1)}) scale(${-RIDER_K} ${RIDER_K})`);
  };
  placeRider();
  /** Place each warrior on the slope; his gear follows his hands. */
  const hostPos = { x: 214 };
  const placeHost = () => {
    const lx = Math.max(hostPos.x + 24, 60);
    hostLabel.setAttribute('transform', `translate(${lx.toFixed(1)} ${(slopeY(hostPos.x + 50) - 128).toFixed(1)})`);
    for (const w of host) {
      const x = hostPos.x + w.off;
      const y = slopeY(x);
      w.wrap.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      const c = shieldAt(w.fig, 0);
      w.pl.setAttribute('transform', `translate(${c[0].toFixed(1)} ${(c[1] + 2).toFixed(1)}) rotate(-6)`);
      const h = w.fig.hand('B');
      w.sp.setAttribute('transform', `translate(${h[0].toFixed(1)} ${h[1].toFixed(1)})`);
    }
  };
  // Pose y so that feet rest on the wrapper's origin (the slope point).
  host.forEach((w) => w.fig.set({ y: (-STAND_HEIGHT + 1.6) }));
  placeHost();

  // The feast: a fire with a spit, two reclining companions, the krater.
  const fire = roast(0.9);
  fire.g.setAttribute('transform', 'translate(6 96) scale(0.9)');
  const fireFlame = s('g');
  fireFlame.appendChild(flames(6, 95, 0.46));
  tC.append(fire.g, fireFlame);
  const feasters: Dressed[] = [];
  const feasterWraps: SVGGElement[] = [];
  const cups: SVGGElement[] = [];
  const feastDefs: Array<[number, Partial<Pose>, string]> = [
    [30, { lean: -28, head: 8, legF: [86, 6], legB: [122, 92], armB: [-30, 70], armF: [95, -25] }, PURPLE],
    [62, { lean: -32, head: 16, legF: [100, 110], legB: [118, 96], armB: [-24, 64], armF: [40, 120] }, INK],
  ];
  for (const [x, p, cloth] of feastDefs) {
    const f = new Dressed({ garment: 'none', head: x > 50 ? 'youth' : 'bearded' }, pose({ x, y: GROUND - 9, ...p })).wear(himation(cloth === INK ? PURPLE : INK));
    feasters.push(f);
    const fw = s('g');
    fw.appendChild(f.g);
    feasterWraps.push(fw);
    const c = kylix(0, 0, 0.58);
    cups.push(c);
    tC.append(fw, c);
  }
  const placeCups = () =>
    feasters.forEach((f, k) => {
      const [hx, hy] = f.hand('F');
      const fc = f.style.facing ?? 1;
      cups[k].setAttribute('transform', `translate(${(hx + 2 * fc).toFixed(1)} ${(hy + 1.5).toFixed(1)}) scale(0.58)`);
    });
  placeCups();
  const bowl = krater(0.86);
  bowl.setAttribute('transform', `translate(88 ${GROUND}) scale(0.86)`);
  tC.appendChild(bowl);

  // Odysseus on the stern, calling his men to the ship (in ship space: mirrored, so facing -1 looks right).
  const odyC = new Figure({ hat: 'pilos', garment: 'short', garmentColor: PURPLE, cloak: true, facing: -1, scale: 0.64 }, pose({ ...POSES.stand(-31, -2 / 0.64), armF: [150, 40], armB: [30, 30] }));
  odyC.g.style.opacity = '0';
  hull.g.insertBefore(odyC.g, cargo);
  const odyLabelC = inscription('ΟΔΥΣΣΕΥΣ', -24, -24, { size: 6, angle: 90 });
  odyLabelC.style.opacity = '0';
  shore.appendChild(odyLabelC);

  /* ================================================================ */
  /* Tableau D — the ships row away; six shields on the shore         */
  /* ================================================================ */
  const tD = s('g', { class: 'kik-grief', opacity: 0 });
  tD.style.display = 'none';
  root.appendChild(tD);
  const SEA_Y = 70;
  const water = sea(SEA_Y, { crestHeight: 16 });
  tD.appendChild(water.g);
  // The shore where they fell: the beach rising to the right, six shields and six spears.
  const beach = (x: number) => 74 - (x - 58) * 0.62;
  tD.appendChild(rock([[48, 96], [58, 74], [100, 48], [140, 23], [176, 2], [200, 0], [200, 200], [40, 200]], { lines: 5, seed: 19 }));
  const memorial = s('g', { class: 'kik-fallen' });
  const devicesD: Array<'star' | 'tripod' | 'lion' | 'dolphin' | 'none'> = ['star', 'dolphin', 'tripod', 'lion', 'none', 'star'];
  const shieldsD: SVGGElement[] = [];
  for (let k = 0; k < 6; k++) {
    const x = 72 + k * 15.5;
    const y = beach(x);
    const g = s('g', { opacity: 0 });
    g.appendChild(spear([x + 6, y + 2], [x + 12 - k * 1.5, y - 70 + (k % 2) * 6], INK, 1.2));
    const sh = shield([0, 0], 10.5, devicesD[k]);
    sh.setAttribute('transform', `translate(${x.toFixed(1)} ${(y - 8).toFixed(1)}) rotate(${-14 + k * 5})`);
    g.appendChild(sh);
    memorial.appendChild(g);
    shieldsD.push(g);
  }
  tD.appendChild(memorial);

  // Two birds wheel over the shore.
  const birdsD: SVGGElement[] = [];
  for (const [x, y, k] of [[34, -92, 1], [70, -64, 0.8]] as Array<[number, number, number]>) {
    const b = s('g');
    const place = s('g', { transform: `translate(${x} ${y}) scale(${k})` });
    const wings = s('path', { d: 'M-12 0Q-6 -7 0 -1Q6 -7 12 0Q6 -3.4 0 1.6Q-6 -3.4 -12 0Z', fill: INK });
    place.appendChild(wings);
    b.appendChild(place);
    tD.appendChild(b);
    birdsD.push(b);
  }

  // The fleet rows away: a ship ahead leaving the picture, and Odysseus's ship.
  const leadShip = ship({ palette: BLACK_FIGURE, sail: 'furled', oars: 9, crew: 6 });
  const leadWrap = s('g');
  const leadPlace = s('g', { transform: `translate(-176 ${SEA_Y + 4}) scale(-1.25 1.25)` });
  leadPlace.appendChild(leadShip.g);
  leadWrap.appendChild(leadPlace);
  const odyShip = ship({ palette: BLACK_FIGURE, sail: 'furled', oars: 11, crew: 7 });
  const odyShipWrap = s('g', { transform: `translate(-22 ${SEA_Y + 6}) scale(-1.45 1.45)` });
  const odyShipBob = s('g');
  const odyShipMove = s('g');
  const odyD = new Figure({ hat: 'pilos', garment: 'short', garmentColor: PURPLE, cloak: true, facing: -1, scale: 0.62 }, pose({ ...POSES.stand(-33, -3 / 0.62), armF: [130, 30], armB: [10, 20] }));
  odyShip.g.insertBefore(odyD.g, odyShip.hull);
  odyShipWrap.appendChild(odyShip.g);
  odyShipBob.appendChild(odyShipWrap);
  odyShipMove.appendChild(odyShipBob);
  const fleet = s('g');
  fleet.append(leadWrap, odyShipMove);
  tD.insertBefore(fleet, water.g.nextSibling);
  tD.appendChild(inscription('ΟΔΥΣΣΕΥΣ', -20, -46, { size: 6 }));
  tD.appendChild(fillers([[-116, -40], [-60, -100], [-6, -120], [110, -94]], 4.4));

  /* ================================================================ */
  /* Scene API                                                        */
  /* ================================================================ */
  const idle: gsap.core.Animation[] = [];
  const mood = (m: 'night' | 'dawn' | 'day') => ctx.atlas.setMood(m);
  const flicker = (els: Element[]) =>
    els.forEach((fl, i) => {
      const tongues = fl.querySelectorAll('.kit-flame__tongue');
      st.loop(gsap.to(tongues, { scaleY: 0.72, transformOrigin: '50% 100%', duration: 0.22 + i * 0.03, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.07 }));
    });

  /** Beat 1 reaction: the sailor shoulders the first jar to the ship, then swings the rest aboard. */
  const loadJars = async () => {
    ctx.audio.sfx('thud');
    const SX = -8;
    const carried = jars[0];
    // The jar lies across his back shoulder, behind the head (tableau units), mouth to the rear.
    const shoulderJar = () => {
      const j = sailor.joints();
      const sh = sailor.toWorld(j.armB.S);
      const f = sailor.style.facing ?? 1;
      return { x: sh[0] - f * 12, y: sh[1] - 4, rot: -f * 75 };
    };
    const carry = { on: false };
    const placeCarried = () => {
      if (!carry.on) return;
      const p = shoulderJar();
      carried.g.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.rot}) translate(0 ${(30 * JAR_K).toFixed(1)})`);
    };
    const tl = st.timeline();
    // Step up, bend, lift the jar onto the shoulder.
    tl.add(sailor.to({ x: SX + 8, lean: 36, armF: [40, 10], armB: [30, 10], legF: [30, 30], legB: [-10, 10] }, { duration: 0.4 }), 0);
    tl.call(() => {
      carry.on = true;
      carryLayer.appendChild(carried.g);
    }, [], 0.45);
    tl.add(sailor.to({ lean: 8, armF: [165, 50], armB: [120, 70], legF: [6, 4], legB: [-6, 4] }, { duration: 0.4, onUpdate: placeCarried }), 0.45);
    // Turn and walk to the ship with it.
    tl.call(() => {
      face(sailor, -1);
      placeCarried();
    }, [], 0.9);
    gaitWindow(tl, st, () => stride(sailor, { speed: 1.6, baseY: GROUND - STAND_HEIGHT + 0.4 }), 0.95, 1.75);
    tl.add(sailor.to({ x: SX - 8 }, { duration: 0.8, ease: 'power1.inOut', onUpdate: placeCarried }), 0.95);
    tl.add(sailor.to({ legF: [6, 4], legB: [-6, 4], armF: [150, 30], armB: [140, 40], lean: -4 }, { duration: 0.3, onUpdate: placeCarried }), 1.75);
    // Heave it over the gunwale.
    const slot0 = toB(holdWorld(0));
    const heave = { t: 0 };
    let heaveFrom = { x: 0, y: 0, rot: 0 };
    tl.call(() => {
      carry.on = false;
      heaveFrom = shoulderJar();
    }, [], 2.05);
    tl.to(heave, {
      t: 1,
      duration: 0.32,
      ease: 'power1.in',
      onUpdate: () => {
        const t = heave.t;
        const x = heaveFrom.x + (slot0[0] - heaveFrom.x) * t;
        const y = heaveFrom.y + (slot0[1] - heaveFrom.y) * t - Math.sin(t * Math.PI) * 14;
        const rot = heaveFrom.rot * (1 - t);
        const sc = 1 + ((HOLD_K * SHIP.k) / KB / JAR_K - 1) * t;
        carried.g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) translate(0 ${(30 * JAR_K * (1 - t)).toFixed(1)}) scale(${sc.toFixed(3)})`);
      },
    }, 2.05);
    tl.set(carried.g, { opacity: 0 }, 2.37);
    tl.fromTo(stowed[0], { opacity: 1, y: -3 }, { y: 0, duration: 0.2, ease: 'bounce.out', immediateRender: false }, 2.35);
    tl.call(() => ctx.audio.sfx('thud'), [], 2.35);
    // Face the jars and swing the rest aboard over the shoulder, one after another.
    tl.call(() => face(sailor, 1), [], 2.4);
    tl.add(sailor.to({ armF: [60, 30], armB: [50, 30], lean: 14 }, { duration: 0.2 }), 2.4);
    const T0 = 2.6, STEP = 0.24;
    for (let k = 1; k < jars.length; k++) {
      const jar = jars[k];
      const t = T0 + (k - 1) * STEP;
      const catchAt: Vec = [SX + 12, GROUND - 40];
      const slot = toB(holdWorld(k));
      const hop = { p: 0 };
      tl.call(() => void carryLayer.appendChild(jar.g), [], t);
      tl.to(hop, {
        p: 1,
        duration: STEP * 1.6,
        ease: 'none',
        onUpdate: () => {
          const q = hop.p;
          let x: number, y: number, sc: number;
          if (q < 0.5) {
            const u = q / 0.5;
            x = jar.x + (catchAt[0] - jar.x) * u;
            y = jar.y + (catchAt[1] + 24 - jar.y) * u - Math.sin(u * Math.PI) * 10;
            sc = 1;
          } else {
            const u = (q - 0.5) / 0.5;
            x = catchAt[0] + (slot[0] - catchAt[0]) * u;
            y = catchAt[1] + 24 + (slot[1] - catchAt[1] - 24) * u - Math.sin(u * Math.PI) * 30;
            sc = 1 + ((HOLD_K * SHIP.k) / KB / JAR_K - 1) * u;
          }
          jar.g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${sc.toFixed(3)})`);
        },
      }, t);
      tl.set(jar.g, { opacity: 0 }, t + STEP * 1.6);
      tl.set(stowed[k], { opacity: 1 }, t + STEP * 1.6);
      tl.add(sailor.to({ armF: [196, 20], armB: [186, 24], lean: -10 }, { duration: STEP * 0.5, ease: 'power2.out' }), t + STEP * 0.8);
      tl.add(sailor.to({ armF: [60, 30], armB: [50, 30], lean: 14 }, { duration: STEP * 0.5, ease: 'power2.in' }), t + STEP * 1.3);
      if (k % 3 === 0) tl.call(() => ctx.audio.sfx('thud'), [], t + STEP * 1.6);
    }
    const tEnd = T0 + (jars.length - 1) * STEP + STEP * 1.6;
    tl.add(sailor.to({ ...POSES.stand(SX, GROUND), lean: 0, armF: [20, 30], armB: [-10, 20] }, { duration: 0.4 }), tEnd);
    // Meanwhile Maron hands over the cup and Odysseus tastes the wine.
    tl.add(maron.to({ armF: [70, 30], lean: 10 }, { duration: 0.6, onUpdate: placeCup }), 0.3);
    tl.add(odyB.to({ armF: [80, 10] }, { duration: 0.6 }), 0.3);
    tl.call(() => {
      maronCup = false;
    }, [], 0.95);
    tl.add(odyB.to({ armF: [120, 100], head: -6, lean: -4 }, { duration: 0.8, onUpdate: () => placeCupOdy() }), 1.2);
    tl.add(maron.to({ armF: [150, 10], armB: [30, 40], lean: 2 }, { duration: 0.7 }), 1.3);
    await st.play(tl);
    st.loop(maron.to({ armF: [138, 24], head: 6 }, { duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    st.loop(odyB.to({ armF: [112, 96], head: -2 }, { duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1, onUpdate: placeCupOdy }));
  };

  /** Beat 2: dusk feast; dawn brings the Kikonians; tap the ship to call the men aboard. */
  const feastAndFlight = async () => {
    const tl = st.timeline();
    tl.to(tB, { opacity: 0, duration: 0.7, ease: 'power2.in' })
      .set(tB, { display: 'none' })
      .call(() => mood('night'), [], 0.2)
      .to(skyTint, { opacity: 0.4, duration: 1.3, ease: 'sine.inOut' }, 0.3)
      .set(tC, { display: '' }, 0.7)
      .to(tC, { opacity: 1, duration: 0.9 }, 0.7)
      .to(night, { opacity: 1, duration: 1.2 }, 1)
      .to([odyC.g, odyLabelC], { opacity: 1, duration: 0.8 }, 0.9)
      .call(() => ctx.audio.sfx('fire'), [], 0.9);
    await st.play(tl);
    flicker([fireFlame]);
    const feastLife = [
      st.loop(feasters[0].to({ armF: [120, -10], head: 2 }, { duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: -1, onUpdate: placeCups })),
      st.loop(feasters[1].to({ armF: [70, 90], head: 8 }, { duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1, onUpdate: placeCups })),
      st.loop(odyC.to({ armF: [170, 20] }, { duration: 0.8, ease: 'sine.inOut', yoyo: true, repeat: -1 })),
    ];
    // Dawn: the stars go out and the Kikonians crest the hill, many as the leaves of spring.
    const dawn = st.timeline({ delay: 2 });
    dawn.call(() => mood('dawn'))
      .to(skyTint, { opacity: 0.08, duration: 1.4, ease: 'sine.inOut' }, 0)
      .to(night, { opacity: 0, duration: 1.2 }, 0)
      .call(() => ctx.audio.sfx('thud'), [], 0.5)
      .to(hostPos, { x: 150, duration: 2.2, ease: 'power1.out', onUpdate: placeHost }, 0.4)
      .to(riderPos, { x: 124, duration: 2.2, ease: 'power1.out', onUpdate: placeRider }, 0.2);
    const march = host.map((w, k) => st.loop(stride(w.fig, { speed: 1.3, phase: k * 0.37 })));
    const hoof = { p: 0 };
    horse.set({ gallop: 0.6 });
    march.push(st.loop(gsap.to(hoof, { p: '+=1', duration: 0.7, ease: 'none', repeat: -1, onUpdate: () => horse.set({ phase: hoof.p % 1 }) })));
    // The host keeps coming until the reader calls the men to the ship. (The ship can be
    // tapped at once; an early call simply hurries the dawn along.)
    let called = false;
    const late: gsap.core.Animation[] = [];
    const arrived = st.play(dawn).then(() => {
      if (called) return;
      feastLife[1].kill();
      // One of the feasters sees them and points.
      late.push(
        st.timeline().add(feasters[1].to({ head: -14, armF: [150, 10], lean: -20 }, { duration: 0.5, onUpdate: placeCups })),
        st.to(hostPos, { x: 118, duration: 16, ease: 'power1.out', onUpdate: placeHost }),
        st.to(riderPos, { x: 104, duration: 16, ease: 'power1.out', onUpdate: placeRider }),
      );
    });
    await ctx.tap(shipHit, { label: 'Yoldaşları gemilere çağır' });
    called = true;
    if (dawn.progress() < 1) {
      dawn.timeScale(5);
      await st.play(dawn);
    }
    await arrived;
    late.forEach((a) => a.kill());
    feastLife.forEach((a) => a.kill());
    ctx.audio.sfx('depart');

    // The flight: the companions leap up and run for the ship; it slides off the beach.
    const run = st.timeline();
    run.add(odyC.to({ armF: [178, 10], armB: [120, 40] }, { duration: 0.3 }), 0);
    feasters.forEach((f, k) => {
      const t0 = 0.08 + k * 0.12;
      run.add(f.to({ lean: 10, legF: [60, 90], legB: [-10, 100], armF: [40, 60], armB: [-20, 40], y: GROUND - 30 }, { duration: 0.22, onUpdate: placeCups }), t0);
      run.call(() => face(f, -1), [], t0 + 0.22);
      gaitWindow(run, st, () => stride(f, { run: true, speed: 2.4, baseY: GROUND - STAND_HEIGHT + 6, arms: true, phase: k * 0.4 }), t0 + 0.22, t0 + 1.2 + k * 0.2);
      run.add(f.to({ x: -26 + k * 8, lean: 16 }, { duration: 1 + k * 0.2, ease: 'power1.in' }), t0 + 0.22);
      run.to(feasterWraps[k], { y: -18, opacity: 0, duration: 0.25, ease: 'power2.out' }, t0 + 1.2 + k * 0.2);
      // The cups are left behind in the sand.
      run.to(cups[k], { y: `+=${16 - k * 3}`, rotation: `+=${60 + k * 40}`, transformOrigin: '50% 50%', duration: 0.5, ease: 'bounce.out' }, t0 + 0.1);
    });
    run.to(crew, { opacity: 1, duration: 0.4 }, 1.3);
    run.set(hull.oars, { opacity: 1 }, 1.5);
    run.call(() => {
      rowLoop = st.loop(rowing(hull.oars, gsap, 1.5));
    }, [], 1.5);
    run.to(shipWrap, { x: -40, duration: 1.9, ease: 'power2.inOut' }, 1.5);
    run.to(shipWrap, { rotation: -2, transformOrigin: '50% 100%', duration: 0.5, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 1.5);
    run.to(odyLabelC, { x: '-=40', duration: 1.9, ease: 'power2.inOut' }, 1.5);
    // The host reaches the beach where the feast was.
    march.forEach((m) => m.timeScale(1.8));
    run.to(hostPos, { x: 74, duration: 3.2, ease: 'power1.inOut', onUpdate: placeHost }, 0.2);
    run.to(riderPos, { x: 44, duration: 3, ease: 'power1.inOut', onUpdate: placeRider }, 0.1);
    run.call(() => march.forEach((m) => m.kill()), [], 3.4);
    // The horseman reins in at the water's edge.
    const halt = { a: 0 };
    run.to(halt, { a: 1, duration: 0.6, ease: 'power2.out', onUpdate: () => horse.set({ gallop: 0.6 * (1 - halt.a), neck: 14 * halt.a, phase: 0.1 }) }, 3.2);
    host.forEach((w, k) => run.add(w.fig.to({ ...POSES.walk(0, 0), y: -STAND_HEIGHT + 1.6, armB: [150, -40], lean: 2 }, { duration: 0.4, onUpdate: placeHost }), 3.4 + k * 0.05));
    await st.play(run);
    host.forEach((w, k) => st.loop(w.fig.to({ armB: [166, -56] }, { duration: 0.5 + (k % 3) * 0.12, delay: k * 0.09, ease: 'sine.inOut', yoyo: true, repeat: -1, onUpdate: placeHost })));
  };
  let rowLoop: gsap.core.Timeline | null = null;

  /** Beat 3: the ships row away in grief; the shields of the fallen appear on the shore, one by one. */
  const grief = async () => {
    const tl = st.timeline();
    tl.to([tC, shore, ground], { opacity: 0, duration: 0.6, ease: 'power2.in' })
      .set([tC, shore], { display: 'none' })
      .call(() => {
        rowLoop?.kill();
        mood('day');
      })
      .to(skyTint, { opacity: 0, duration: 0.5 }, 0.3)
      .set(tD, { display: '' }, 0.6)
      .to(tD, { opacity: 1, duration: 0.8, ease: 'power2.out' }, 0.6)
      .from(odyShipMove, { x: 24, duration: 1.9, ease: 'power1.out' }, 0.6);
    // Odysseus calls each of the dead three times; their shields stand on the beach.
    for (let k = 0; k < 3; k++) {
      tl.add(odyD.to({ armF: [168, 10], head: -8 }, { duration: 0.22, ease: 'power2.out' }), 0.8 + k * 0.46);
      tl.add(odyD.to({ armF: [130, 30], head: 0 }, { duration: 0.22, ease: 'power2.in' }), 1.03 + k * 0.46);
    }
    tl.to(shieldsD, { opacity: 1, duration: 0.4, stagger: 0.2, ease: 'power1.inOut' }, 0.9);
    tl.add(odyD.to(POSES.lament(-33, -3 / 0.62), { duration: 0.45 }), 2.0);
    tl.call(() => ctx.audio.sfx('depart'), [], 0.8);
    st.loop(rowing(leadShip.oars, gsap, 0.8));
    st.loop(rowing(odyShip.oars, gsap, 0.8));
    st.loop(gsap.to(water.crests, { x: crestTile(16) * 2, duration: 5, ease: 'none', repeat: -1 }));
    st.loop(gsap.to(odyShipBob, { y: 1.6, rotation: 0.8, svgOrigin: `-22 ${SEA_Y + 6}`, duration: 1.7, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    st.loop(gsap.to(leadWrap, { y: 1.4, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    birdsD.forEach((b, k) => {
      st.loop(gsap.to(b.querySelector('path'), { scaleY: 0.4, transformOrigin: '50% 50%', duration: 0.5 + k * 0.1, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
      st.loop(gsap.to(b, { x: k ? -24 : 30, y: k ? 10 : -8, duration: 6 + k * 2, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    });
    await st.play(tl);
  };

  return {
    enter() {
      const tl = st.timeline();
      tl.from(tA, { opacity: 0, duration: 0.8, ease: 'power2.out' })
        .from(hoplites.map((h) => h.wrap), { x: -30, duration: 1.1, ease: 'power3.out', stagger: 0.14 }, 0)
        .from(archer.g, { x: -20, duration: 1, ease: 'power3.out' }, 0.1)
        .from(tA.querySelectorAll('.kit-inscription'), { opacity: 0, duration: 0.8 }, 0.5);
      // Life on the wall walk while they wait; the fire arrow's flame flickers.
      idle.push(st.loop(spearman.to({ armB: [165, -34], lean: 8 }, { duration: 1.3, ease: 'sine.inOut', yoyo: true, repeat: -1, onUpdate: armDefenders })));
      idle.push(st.loop(slinger.to({ armB: [178, 50], lean: -12 }, { duration: 0.9, ease: 'sine.inOut', yoyo: true, repeat: -1, onUpdate: armDefenders })));
      flicker([arrowFire]);
      return st.play(tl);
    },

    async beat(i) {
      if (i === 0) {
        // Odysseus looses a fire arrow; the hoplites storm the gate; the town burns.
        idle.forEach((a) => a.kill());
        const tl = st.timeline();
        tl.add(archer.to({ armB: [60, 110] }, { duration: 0.5, ease: 'power2.out', onUpdate: drawBow }), 0);
        tl.to(drawState, { k: 1, duration: 0.5, ease: 'power2.out', onUpdate: drawBow }, 0);
        const flight = { t: 0 };
        let from: Vec = [0, 0];
        const to: Vec = [90, -14];
        tl.call(() => {
          arrow.dataset.flying = '1';
          const m = /translate\(([-\d.]+) ([-\d.]+)\)/.exec(arrow.getAttribute('transform') ?? '');
          from = m ? [Number(m[1]), Number(m[2])] : [-20, 40];
          ctx.audio.sfx('twang');
        }, [], 0.62);
        tl.to(drawState, { k: 0, duration: 0.12, ease: 'power3.out', onUpdate: drawBow }, 0.62);
        tl.to(flight, {
          t: 1,
          duration: 0.6,
          ease: 'none',
          onUpdate: () => {
            const t = flight.t;
            const x = from[0] + (to[0] - from[0]) * t;
            const y = from[1] + (to[1] - from[1]) * t - Math.sin(t * Math.PI) * 26;
            const dy = to[1] - from[1] - Math.cos(t * Math.PI) * Math.PI * 26;
            const ang = (Math.atan2(dy, to[0] - from[0]) * 180) / Math.PI;
            arrow.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)})`);
          },
        }, 0.62);
        tl.to(arrow, { opacity: 0, duration: 0.1 }, 1.2);
        tl.add(archer.to({ armB: [30, 40], armF: [80, 0] }, { duration: 0.5 }), 0.8);
        // The storm: up from the crouch, forward through the gate.
        hoplites.forEach((h, k) => {
          gaitWindow(tl, st, () => stride(h.fig, { run: true, speed: 2.2, phase: k * 0.35, baseY: GROUND - 36 }), 0.25 + k * 0.08, 1.35 + k * 0.08);
          tl.to(h.wrap, { x: 16 - k * 2, duration: 1.1, ease: 'power2.inOut', onUpdate: arm }, 0.25 + k * 0.08);
          tl.add(h.fig.to({ ...POSES.lunge(h.x, GROUND), armF: [80, 36], armB: [168, -64], lean: 12 }, { duration: 0.45, onUpdate: arm }), 1.36 + k * 0.08);
        });
        tl.call(() => {
          ctx.audio.sfx('thud');
          ctx.atlas.shake(4);
        }, [], 1.25);
        tl.to(fort.studs, { opacity: 0, duration: 0.15 }, 1.25);
        tl.to(fort.gateL, { scaleX: 0.12, transformOrigin: '0% 50%', duration: 0.35, ease: 'power3.out' }, 1.25).to(fort.gateR, { scaleX: 0.12, transformOrigin: '100% 50%', duration: 0.35, ease: 'power3.out' }, 1.25);
        tl.call(() => ctx.audio.sfx('fire'), [], 1.2);
        tl.fromTo(fires, { opacity: 0, scale: 0.2, transformOrigin: '50% 100%' }, { opacity: 1, scale: 1, duration: 0.55, ease: 'back.out(2)', stagger: 0.12 }, 1.2);
        // The stone falls short; the defenders duck behind the burning parapet.
        tl.add(slinger.to({ armB: [60, 20], lean: 12 }, { duration: 0.3, ease: 'power3.in', onUpdate: armDefenders }), 0.9);
        tl.call(() => void (stone.dataset.thrown = '1'), [], 1.2);
        tl.to(stone, { x: '-=36', y: '+=52', rotation: '+=200', transformOrigin: '50% 50%', duration: 0.6, ease: 'power1.in' }, 1.2).to(stone, { opacity: 0, duration: 0.1 }, 1.75);
        tl.to(defGear[1], { y: 30, duration: 0.6, ease: 'power2.in' }, 1.5);
        tl.add(spearman.to({ lean: -12, armF: [118, 36], armB: [110, 10] }, { duration: 0.5, onUpdate: armDefenders }), 1.45);
        tl.to(defGear[0], { y: 30, duration: 0.6, ease: 'power2.in' }, 1.6);
        await st.play(tl);
        flicker(fires);
        hoplites.forEach((h, k) => st.loop(h.fig.to({ armB: [160, -50], lean: 9 }, { duration: 0.9 + k * 0.2, ease: 'sine.inOut', yoyo: true, repeat: -1, onUpdate: arm })));
        return;
      }
      if (i === 1) {
        // Cut from the burning town to the shore: Maron offers his wine.
        const cut = st.timeline();
        cut.to(tA, { opacity: 0, duration: 0.6, ease: 'power2.in' })
          .set(tA, { display: 'none' })
          .set([shore, tB], { display: '' })
          .to([shore, tB], { opacity: 1, duration: 0.9, ease: 'power2.out' })
          .from([maronWrap, cup], { x: 26, duration: 1, ease: 'power3.out' }, '<')
          .from(odyB.g, { x: -18, duration: 1, ease: 'power3.out' }, '<');
        cut.add(maron.to({ armF: [86, 6], lean: 8 }, { duration: 0.8, onUpdate: placeCup }), '-=0.4');
        await st.play(cut);
        st.loop(gsap.to(surfMove, { x: -crestTile(11) * 2, duration: 2.6, ease: 'none', repeat: -1 }));
        idle.push(st.loop(odyB.to({ armF: [70, 30], head: 6 }, { duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1 })));
        await ctx.tap(front[0].g, { label: 'Şarap testisini gemiye yükle' });
        idle.forEach((a) => a.kill());
        return loadJars();
      }
      if (i === 2) return feastAndFlight();
      if (i === 3) return grief();
    },

    destroy() {
      st.destroy();
    },
  };
};
