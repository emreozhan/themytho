/**
 * Γʹ Troya — the ten-year siege.
 * Beat 0: the walls of Ilion across the upper field, the Achaean ships drawn up
 *         on the shore below, and before the Scaean gate the duel of Achilles
 *         and Hector.
 * Beat 1: (hold) the years pass: sun and moon wheel over the battlements, the
 *         duel lunges to and fro, the year counter runs to nine.
 * Beat 2: Hector falls; from the wall Paris looses the arrow that finds
 *         Achilles's heel; Achilles sinks and Odysseus lifts his great shield.
 */
import { s } from '../lib/dom';
import { gsap } from '../lib/motion';
import { smoothstep, type Vec } from '../lib/geometry';
import { Figure, POSES, pose, INK, CLAY, PURPLE, bowPath, type Pose } from '../art/figure';
import { groundLine, sea, SEA_TILE, sun, moon, stars, nightVeil, inscription, fillers } from '../art/kit';
import { ship, BLACK_FIGURE } from '../art/ship';
import { stage } from './tools';
import { troyWalls } from './troya.walls';
import { Hoplite, aspis, spearShape, arrowShape, mixPose, poseTo, down } from './troya.art';
import type { SceneFactory } from '../story/types';

/** The plain where the heroes fight (feet on this line). */
const GROUND = 100;
/** The duel is laid out in figure units and enlarged about the groundline. */
const K = 1.2;
const WALL_BASE = -46;

/** Tableau point → scene point. */
const fillPt = ([x, y]: Vec): Vec => [x * K, GROUND + (y - GROUND) * K];

export const scene: SceneFactory = (ctx) => {
  const st = stage(ctx);
  const root = ctx.root;

  /* ---------------- Sky (the sun sets behind the walls) ---------------- */
  const walls = troyWalls({
    from: -200,
    to: 200,
    base: WALL_BASE,
    height: 56,
    towers: [{ x: -104, w: 32 }, { x: 104, w: 32 }],
    gate: { x: 40, w: 36, h: 40 },
    seed: 31,
  });
  const skyClip = s('clipPath', { id: 'troya-sky', 'data-scene': '' });
  skyClip.appendChild(s('path', { d: walls.skyClip(), 'clip-rule': 'evenodd' }));
  ctx.defs.appendChild(skyClip);

  const sky = s('g', { class: 'troya-sky', 'clip-path': 'url(#troya-sky)' });
  const theSun = sun(0, 0, 10);
  sky.appendChild(theSun);
  root.appendChild(sky);
  root.appendChild(fillers([[-150, 20], [150, 30], [-140, 78], [142, 80]], 4.2));

  /* ---------------- On the walls: Trojans watching, Paris ---------------- */
  const onWall = s('g', { class: 'troya-onwall' });
  /** A figure standing on the walkway behind the breastwork; returns the animatable inner group. */
  const perch = (x: number, k: number, fig: Figure) => {
    const g = s('g', { transform: `translate(${x} ${walls.walk + 15}) scale(${k})` });
    const inner = s('g');
    inner.appendChild(fig.g);
    g.appendChild(inner);
    onWall.appendChild(g);
    return inner;
  };
  const andromache = new Figure({ head: 'woman', garment: 'peplos', hat: 'veil', garmentColor: INK }, pose({ ...POSES.stand(0, 0), armF: [60, 60], armB: [30, 80] }));
  const priam = new Figure({ head: 'old', garment: 'long', cloak: true, facing: -1 }, pose({ ...POSES.stand(0, 0), armF: [40, 40] }));
  perch(4, 0.36, andromache);
  perch(22, 0.38, priam);
  // Paris waits below the battlements; he rises to shoot in beat 2.
  const PARIS_X = 68;
  const PARIS_K = 0.42;
  const paris = new Figure({ head: 'youth', garment: 'short', garmentColor: INK, facing: -1 }, pose({ ...POSES.stand(0, 0), lean: 4, armF: [40, 30], armB: [20, 40] }));
  const parisG = perch(PARIS_X, PARIS_K, paris);
  const bow = s('g', { class: 'bow' });
  const bowString = s('path', { fill: 'none', stroke: INK, 'stroke-width': 0.6 });
  const bowLimb = s('path', { fill: INK });
  const nocked = arrowShape(24);
  bow.append(bowString, bowLimb, nocked);
  paris.g.appendChild(bow);
  const parisLab = inscription('ΠΑΡΙΣ', PARIS_X - 18, walls.walk - 36, { size: 4.6, angle: 90 });
  onWall.appendChild(parisLab);
  parisG.style.opacity = '0';
  parisLab.style.opacity = '0';
  /** Bow state: draw (0 = string at rest, 1 = drawn to the back hand), arrow on the string. */
  const archery = { draw: 0, arrow: 1 };
  const bowDir = (): Vec => {
    const j = paris.joints();
    const grip = j.armF.W;
    const rest = down(j.armF.a);
    const pull: Vec = [grip[0] - j.armB.W[0], grip[1] - j.armB.W[1]];
    const L = Math.hypot(pull[0], pull[1]) || 1;
    const d: Vec = [rest[0] + (pull[0] / L - rest[0]) * archery.draw, rest[1] + (pull[1] / L - rest[1]) * archery.draw];
    const n = Math.hypot(d[0], d[1]) || 1;
    return [d[0] / n, d[1] / n];
  };
  const renderBow = () => {
    const j = paris.joints();
    const grip = j.armF.W;
    const dir = bowDir();
    const n: Vec = [-dir[1], dir[0]];
    const tipA: Vec = [grip[0] + n[0] * 15, grip[1] + n[1] * 15];
    const tipB: Vec = [grip[0] - n[0] * 15, grip[1] - n[1] * 15];
    const mid: Vec = [grip[0] - dir[0] * 4, grip[1] - dir[1] * 4];
    const hand = j.armB.W;
    const drawPt: Vec = [mid[0] + (hand[0] - mid[0]) * archery.draw, mid[1] + (hand[1] - mid[1]) * archery.draw];
    const bp = bowPath(tipB, tipA, 5.5, drawPt);
    bowLimb.setAttribute('d', bp.limb);
    bowString.setAttribute('d', bp.string);
    const ang = (Math.atan2(dir[1], dir[0]) * 180) / Math.PI;
    nocked.setAttribute('transform', `translate(${(drawPt[0] + dir[0] * 24).toFixed(1)} ${(drawPt[1] + dir[1] * 24).toFixed(1)}) rotate(${ang.toFixed(1)})`);
    nocked.style.opacity = String(archery.arrow * Math.min(1, archery.draw * 3));
  };
  renderBow();
  root.appendChild(onWall);
  root.appendChild(walls.g);

  /* ---------------- The shore: ships drawn up, the sea ---------------- */
  const shore = s('g', { class: 'troya-shore' });
  const theSea = sea(141, { crestHeight: 9, foam: true });
  shore.appendChild(theSea.g);
  for (const [x, k] of [[-72, 0.46], [0, 0.5], [72, 0.46]] as const) {
    const wrap = s('g', { transform: `translate(${x} 138) scale(${k})` });
    wrap.appendChild(ship({ palette: BLACK_FIGURE, sail: 'furled', oars: 0, crew: 0 }).g);
    shore.appendChild(wrap);
  }
  root.appendChild(shore);
  root.appendChild(groundLine(GROUND + 0.6, -170, 170));

  /* ---------------- The duel (tableau units, enlarged by K) ---------------- */
  const plain = s('g', { class: 'troya-plain', transform: `translate(0 ${GROUND}) scale(${K}) translate(0 ${-GROUND})` });
  root.appendChild(plain);

  const A0 = -40, H0 = 40;
  const guard = (x: number): Pose => pose({ x, y: GROUND - 45.5, lean: 6, head: 0, armF: [184, -12], armB: [30, 78], legF: [34, 26], legB: [-22, 8], footB: 8 });
  const thrust = (x: number): Pose => pose({ x, y: GROUND - 42.5, lean: 16, head: 4, armF: [142, -22], armB: [50, 70], legF: [50, 48], legB: [-30, 4], footB: 16 });
  const parry = (x: number): Pose => pose({ x, y: GROUND - 45, lean: -6, head: -6, armF: [200, -20], armB: [66, 60], legF: [26, 18], legB: [-18, 14], footB: 4 });
  const achilles = new Hoplite({ hat: 'helmet', garment: 'short', garmentColor: PURPLE }, guard(A0), { device: 'gorgon', shieldR: 21, aim: 14 });
  const hector = new Hoplite({ hat: 'helmet', garment: 'short', garmentColor: INK, facing: -1 }, guard(H0), { device: 'triskeles', shieldR: 20, aim: 14 });
  // Achilles turns about his own pelvis (a quick squash of this wrapper).
  const achWrap = s('g', { class: 'achilles' });
  achWrap.appendChild(achilles.g);
  // Untransformed wrappers for the entrance (figures own their transform attributes).
  const inA = s('g');
  const inH = s('g');
  inA.appendChild(achWrap);
  inH.appendChild(hector.g);
  plain.append(inH, inA);
  gsap.set(inA, { x: -40, opacity: 0 });
  gsap.set(inH, { x: 40, opacity: 0 });
  const labA = inscription('ΑΧΙΛΛΕΥΣ', -92, -14, { size: 6.5, angle: 90 });
  const labH = inscription('ΕΚΤΩΡ', 88, -2, { size: 6.5, angle: 90 });
  labA.style.opacity = '0';
  labH.style.opacity = '0';
  plain.append(labA, labH);

  /** Duel state: `phase` counts exchanges (driven by the hold), `sway` is idle breathing. */
  const duel = { phase: 0, sway: 0 };
  const renderDuel = () => {
    const f = Math.sin(duel.phase * Math.PI * 2);
    const sw = duel.sway;
    const shift = 7 * f;
    const pa = f >= 0 ? mixPose(guard(A0 + shift), thrust(A0 + shift + 4), f) : mixPose(guard(A0 + shift), parry(A0 + shift), -f);
    const ph = f <= 0 ? mixPose(guard(H0 + shift), thrust(H0 + shift - 4), -f) : mixPose(guard(H0 + shift), parry(H0 + shift), f);
    pa.lean += sw * 1.6;
    pa.armF[0] += sw * 3;
    ph.lean -= sw * 1.4;
    ph.armF[0] -= sw * 3;
    achilles.set(pa, 14 + (f > 0 ? 10 * f : -8 * f) + sw * 2);
    hector.set(ph, 14 + (f < 0 ? -10 * f : 8 * f) - sw * 2);
  };
  renderDuel();

  // Loose gear for beat 2 (hidden until dropped).
  const hShield = s('g', { class: 'loose-shield' });
  hShield.appendChild(aspis(20, 'triskeles'));
  const hSpear = spearShape(116, 0.5);
  const aShield = s('g', { class: 'loose-shield loose-shield--achilles' });
  aShield.appendChild(aspis(21, 'gorgon'));
  const aSpear = spearShape(116, 0.5);
  for (const el of [hShield, hSpear, aShield, aSpear]) el.style.display = 'none';
  plain.append(hSpear, hShield, aSpear);

  /* ---------------- Odysseus (enters in beat 2) ---------------- */
  const ODY_X = -100;
  const odysseus = new Figure({ hat: 'pilos', garment: 'short', cloak: true }, POSES.walk(ODY_X - 56, GROUND));
  odysseus.g.style.opacity = '0';
  const labO = inscription('ΟΔΥΣΣΕΥΣ', -78, 14, { size: 6, angle: 90 });
  const labA2 = inscription('ΑΧΙΛΛΕΥΣ', -52, -2, { size: 6 });
  labA2.style.opacity = '0';
  labO.style.opacity = '0';
  plain.append(odysseus.g, aShield, labO, labA2);

  /* ---------------- The arrow in flight (scene space) ---------------- */
  const flight = s('g', { class: 'arrow-flight' });
  const halo = arrowShape(24, CLAY);
  halo.setAttribute('stroke', CLAY);
  halo.setAttribute('stroke-width', '1.6');
  halo.querySelectorAll('path').forEach((el) => el.setAttribute('stroke', CLAY));
  flight.append(halo, arrowShape(24));
  flight.style.display = 'none';
  root.appendChild(flight);

  /* ---------------- Night: veil, then moon and stars above it ---------------- */
  const veil = nightVeil(0);
  root.appendChild(veil);
  const night = s('g', { class: 'troya-night', 'clip-path': 'url(#troya-sky)' });
  const theStars = stars(26, { x: -150, y: -166, w: 300, h: 70 }, 33);
  theStars.style.opacity = '0';
  const theMoon = moon(0, 0, 9);
  night.append(theStars, theMoon);
  root.appendChild(night);

  // The heavens wheel on an arc over the walls: θ = 0 at sunrise (left), π at sunset.
  const C: Vec = [0, -50];
  const R = 92;
  const THETA0 = Math.PI * 0.3;
  const heavens = { theta: THETA0 };
  const placeSky = () => {
    const t = heavens.theta;
    const sx = C[0] - Math.cos(t) * R, sy = C[1] - Math.sin(t) * R;
    theSun.setAttribute('transform', `translate(${sx.toFixed(1)} ${sy.toFixed(1)})`);
    const mx = C[0] + Math.cos(t) * R, my = C[1] + Math.sin(t) * R;
    theMoon.setAttribute('transform', `translate(${mx.toFixed(1)} ${my.toFixed(1)}) rotate(-20)`);
    const n = smoothstep(0.2, -0.3, Math.sin(t));
    veil.setAttribute('opacity', (n * 0.5).toFixed(3));
    theStars.style.opacity = n.toFixed(3);
  };
  placeSky();

  /* ---------------- Idle life ---------------- */
  duel.sway = -1;
  const idle = st.loop(gsap.to(duel, { sway: 1, duration: 1.9, ease: 'sine.inOut', yoyo: true, repeat: -1, onUpdate: renderDuel }));
  st.loop(gsap.to(theSea.crests, { x: -SEA_TILE, duration: 5, ease: 'none', repeat: -1 }));
  // The watchers on the wall talk and point.
  const watch = [
    st.loop(poseTo(andromache, { armF: [84, 40], head: -6 }, { duration: 1.7, yoyo: true, repeat: -1, ease: 'sine.inOut' })),
    st.loop(poseTo(priam, { armF: [70, 20], head: 8 }, { duration: 2.3, delay: 0.6, yoyo: true, repeat: -1, ease: 'sine.inOut' })),
  ];

  /** Paint a label's letters stroke by stroke. */
  const write = (lab: SVGGElement, at: number, tl: gsap.core.Timeline) => {
    tl.set(lab, { opacity: 1 }, at);
    tl.fromTo(lab.querySelectorAll('path'), { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5, stagger: 0.07, ease: 'power1.inOut' }, at);
  };

  /** Where a hero's rear heel is, in scene space. */
  const heelOf = (h: Hoplite): Vec => {
    const j = h.fig.joints();
    const l = j.legB;
    const dir = down(l.fa);
    const heel: Vec = [l.A[0] - dir[0] * 2.4, l.A[1] - dir[1] * 2.4 + 0.8];
    return fillPt(h.fig.toWorld(heel));
  };

  /** Squash-turn Achilles about his pelvis and flip his facing half way. */
  const turnAchilles = (tl: gsap.core.Timeline, at: number) => {
    const turn = { k: 1 };
    const apply = () => {
      const px = achilles.pose.x;
      achWrap.setAttribute('transform', `translate(${px.toFixed(1)} 0) scale(${turn.k.toFixed(3)} 1) translate(${(-px).toFixed(1)} 0)`);
    };
    tl.to(turn, { k: 0.06, duration: 0.14, ease: 'power1.in', onUpdate: apply }, at)
      .call(() => {
        achilles.fig.style.facing = -1;
        achilles.sync();
        achilles.fig.render();
      }, [], at + 0.14)
      .to(turn, { k: 1, duration: 0.16, ease: 'power1.out', onUpdate: apply }, at + 0.14);
  };

  return {
    enter() {
      // The city and the ships are painted already; the heroes step into the field.
      const tl = st.timeline();
      tl.from(onWall, { opacity: 0, duration: 0.8, ease: 'power2.out' }, 0.2)
        .to(inA, { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, 0)
        .to(inH, { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, 0);
      write(labA, 0.6, tl);
      write(labH, 0.7, tl);
      return st.play(tl);
    },

    async beat(i) {
      if (i === 0) return;
      if (i === 1) {
        // The years pass while the reader holds: four days and nights wheel by
        // (standing in for nine years), the duel swings to and fro.
        let year = 1;
        await ctx.hold({
          label: 'Yılları geçir',
          seconds: 4,
          onProgress: (p) => {
            heavens.theta = THETA0 + p * Math.PI * 2 * 4;
            placeSky();
            duel.phase = p * 7;
            renderDuel();
            const y = Math.round(1 + p * 8);
            if (y !== year) {
              year = y;
              ctx.hud.setYear(y, 0.2);
            }
          },
        });
        if (ctx.signal.aborted) return;
        ctx.hud.setYear(9, 0.2);
        ctx.audio.sfx('success');
        return;
      }
      if (i === 2) {
        idle.kill();
        watch.forEach((a) => a.kill());
        ctx.hud.setYear(10, 1);
        duel.phase = 0;
        duel.sway = 0;
        renderDuel();
        const tl = st.timeline();

        // 1 — Achilles drives his spear home; Hector reels and falls.
        tl.add(achilles.to({ ...guard(-40), lean: -2, armF: [196, -30] }, { duration: 0.3, ease: 'power2.out', aim: 4 }), 0)
          .add(achilles.to(thrust(-30), { duration: 0.28, ease: 'power3.in', aim: 30 }), 0.3)
          .add(hector.to({ ...parry(42), lean: -18, head: -24, armF: [150, 40], armB: [80, 40] }, { duration: 0.3, ease: 'power2.out', aim: -40 }), 0.52)
          .call(() => {
            ctx.audio.sfx('thud');
            // His shield and spear fall from him.
            const j = hector.fig.joints();
            const sc = hector.fig.toWorld([(j.armB.E[0] + j.armB.W[0]) / 2 - 2.6, (j.armB.E[1] + j.armB.W[1]) / 2]);
            hector.showShield(false);
            hector.showSpear(false);
            hShield.style.display = '';
            hSpear.style.display = '';
            gsap.set(hShield, { x: sc[0], y: sc[1], rotation: 0, svgOrigin: '0 0' });
            gsap.set(hSpear, { x: sc[0] + 6, y: sc[1] - 24, rotation: -150, svgOrigin: '0 0' });
          }, [], 0.6)
          .to(hShield, { x: 114, y: GROUND - 20, rotation: 40, duration: 0.7, ease: 'bounce.out' }, 0.6)
          .to(hSpear, { x: 96, y: GROUND - 1.5, rotation: 176, duration: 0.6, ease: 'power2.in' }, 0.65)
          .add(hector.to(POSES.fallen(64, GROUND), { duration: 0.75, ease: 'power2.in' }), 0.62)
          .add(poseTo(andromache, { armF: [150, 150], armB: [140, 160], head: 14 }, { duration: 0.5 }), 0.8)
          .add(poseTo(priam, { head: 24, lean: 8, armF: [120, 60] }, { duration: 0.6 }), 0.9);

        // 2 — Achilles straightens in triumph and turns back towards the ships.
        tl.add(achilles.to(pose({ x: -24, y: GROUND - 49.6, lean: -4, head: -6, armF: [178, -8], armB: [36, 70], legF: [18, 8], legB: [-14, 6], footB: 6 }), { duration: 0.5, ease: 'power2.out', aim: -30 }), 1.1);
        turnAchilles(tl, 1.62);
        tl.add(achilles.to(pose({ x: -30, y: GROUND - 47.4, lean: 6, head: 0, armF: [150, 20], armB: [34, 70], legF: [30, 14], legB: [-24, 10], footB: 26 }), { duration: 0.4, ease: 'power1.inOut', aim: -46 }), 1.92);

        // 3 — Paris rises on the wall, draws and looses.
        tl.to(parisG, { opacity: 1, duration: 0.3 }, 1.3)
          .fromTo(parisG, { y: 14 }, { y: 0, duration: 0.45, ease: 'power2.out' }, 1.3)
          .to(parisLab, { opacity: 1, duration: 0.4 }, 1.5)
          .add(poseTo(paris, { lean: 16, head: 10, armF: [42, 0], armB: [96, -64] }, { duration: 0.45, onUpdate: renderBow }), 1.45)
          .to(archery, { draw: 1, duration: 0.5, ease: 'power2.inOut', onUpdate: renderBow }, 1.6);
        let from: Vec = [0, 0];
        let to: Vec = [0, 0];
        const shot = { t: 0 };
        const placeArrow = () => {
          const t = shot.t;
          const ctrl: Vec = [(from[0] + to[0]) / 2 - 24, (from[1] + to[1]) / 2 - 10];
          const x = (1 - t) * (1 - t) * from[0] + 2 * (1 - t) * t * ctrl[0] + t * t * to[0];
          const y = (1 - t) * (1 - t) * from[1] + 2 * (1 - t) * t * ctrl[1] + t * t * to[1];
          const dx = 2 * (1 - t) * (ctrl[0] - from[0]) + 2 * t * (to[0] - ctrl[0]);
          const dy = 2 * (1 - t) * (ctrl[1] - from[1]) + 2 * t * (to[1] - ctrl[1]);
          flight.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${((Math.atan2(dy, dx) * 180) / Math.PI).toFixed(1)})`);
        };
        tl.call(() => {
          ctx.audio.sfx('twang');
          // The arrow leaves the string (Paris's frame → scene space).
          const j = paris.joints();
          const dir = bowDir();
          const tipLocal: Vec = [j.armF.W[0] + dir[0] * 12, j.armF.W[1] + dir[1] * 12];
          const w = paris.toWorld(tipLocal);
          from = [PARIS_X + w[0] * PARIS_K, walls.walk + 15 + w[1] * PARIS_K];
          to = heelOf(achilles);
          archery.arrow = 0;
          archery.draw = 0;
          renderBow();
          flight.style.display = '';
          placeArrow();
        }, [], 2.36)
          .to(shot, { t: 1, duration: 0.42, ease: 'power1.in', onUpdate: placeArrow }, 2.36)
          .call(() => {
            // The arrow stands in his heel; he staggers.
            flight.style.display = 'none';
            ctx.audio.sfx('thud');
            const stuck = arrowShape(19);
            achilles.fig.g.appendChild(stuck);
            // Direction of flight in the hero's (mirrored) frame, kept relative to his foot.
            const flightAng = Math.atan2(to[1] - from[1], -(to[0] - from[0])) * (180 / Math.PI);
            const footAng = () => 90 - achilles.fig.joints().legB.fa;
            const rel = flightAng - footAng();
            achilles.onSync = () => {
              const l = achilles.fig.joints().legB;
              const dir = down(l.fa);
              const heel: Vec = [l.A[0] - dir[0] * 1.6, l.A[1] - dir[1] * 1.6 + 0.6];
              stuck.setAttribute('transform', `translate(${heel[0].toFixed(1)} ${heel[1].toFixed(1)}) rotate(${(footAng() + rel).toFixed(1)})`);
            };
            achilles.sync();
          }, [], 2.78)
          .add(poseTo(paris, { lean: 6, armF: [60, 20], armB: [30, 40], head: 0 }, { duration: 0.5, onUpdate: renderBow }), 2.9);

        // 4 — Achilles sinks to his knee; the great shield slips from his arm.
        tl.add(achilles.to({ ...guard(-30), lean: -14, head: -16, armF: [200, -40] }, { duration: 0.18, ease: 'power2.out', aim: -70 }), 2.78)
          .add(achilles.to(pose({ ...POSES.plead(-26, GROUND), lean: 2, head: 26, armF: [36, 20], armB: [30, 40], footB: 70 }), { duration: 0.75, ease: 'power2.in', aim: -90 }), 2.98)
          .call(() => {
            const j = achilles.fig.joints();
            const c = achilles.fig.toWorld([(j.armB.E[0] + j.armB.W[0]) / 2 + 2.6, (j.armB.E[1] + j.armB.W[1]) / 2]);
            achilles.showShield(false);
            achilles.showSpear(false);
            aShield.style.display = '';
            aSpear.style.display = '';
            gsap.set(aShield, { x: c[0], y: c[1], rotation: 0, svgOrigin: '0 0' });
            gsap.set(aSpear, { x: c[0], y: c[1] - 20, rotation: -120, svgOrigin: '0 0' });
          }, [], 3.3)
          .to(aShield, { x: -64, y: GROUND - 21.5, rotation: -25, duration: 0.55, ease: 'bounce.out' }, 3.3)
          .to(aSpear, { x: -8, y: GROUND - 1.5, rotation: -4, duration: 0.5, ease: 'power2.in' }, 3.3);

        // 5 — Odysseus comes from the ships and lifts the great shield.
        const walk = { p: 0 };
        tl.set(odysseus.g, { opacity: 1 }, 3.1)
          .add(poseTo(odysseus, POSES.walk(ODY_X, GROUND), { duration: 0.8, ease: 'power1.out' }), 3.1)
          .to(walk, {
            p: 1,
            duration: 0.8,
            ease: 'none',
            onUpdate: () => {
              const sw = Math.sin(walk.p * Math.PI * 3);
              odysseus.set({ legF: [22 * sw, 8], legB: [-18 * sw, 10] });
            },
          }, 3.1)
          .add(poseTo(odysseus, pose({ x: ODY_X, y: GROUND - 44, lean: 34, head: 10, armF: [70, 4], armB: [60, 10], legF: [36, 30], legB: [-16, 8] }), { duration: 0.45, ease: 'power2.inOut' }), 3.9);
        const lift = { t: 0 };
        let shieldFrom: Vec = [0, 0];
        const holdShield = () => {
          const a = odysseus.hand('F');
          const b = odysseus.hand('B');
          const target: Vec = [(a[0] + b[0]) / 2 + 5 * lift.t, (a[1] + b[1]) / 2 - 15 * lift.t];
          const x = shieldFrom[0] + (target[0] - shieldFrom[0]) * Math.min(1, lift.t * 3);
          const y = shieldFrom[1] + (target[1] - shieldFrom[1]) * Math.min(1, lift.t * 3);
          gsap.set(aShield, { x, y, rotation: -25 + 25 * lift.t });
        };
        tl.call(() => {
          shieldFrom = [Number(gsap.getProperty(aShield, 'x')), Number(gsap.getProperty(aShield, 'y'))];
        }, [], 4.3)
          .add(poseTo(odysseus, pose({ x: ODY_X + 2, y: GROUND - 50, lean: -4, head: -16, armF: [156, 12], armB: [148, 18], legF: [14, 6], legB: [-12, 6] }), { duration: 0.75, ease: 'power2.out', onUpdate: holdShield }), 4.35)
          .to(lift, { t: 1, duration: 0.75, ease: 'power2.out', onUpdate: holdShield }, 4.35)
          .to(labA, { opacity: 0, duration: 0.4 }, 3.4);
        write(labO, 4.4, tl);
        write(labA2, 3.9, tl);
        await st.play(tl);
        if (ctx.signal.aborted) return;
        // Idle: the shield held high sways a little.
        st.loop(
          gsap.to(lift, {
            t: 0.9,
            duration: 1.6,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
            onUpdate: () => {
              odysseus.set({ armF: [156 - (1 - lift.t) * 20, 12], armB: [148 - (1 - lift.t) * 20, 18] });
              holdShield();
            },
          }),
        );
        return;
      }
    },

    destroy() {
      st.destroy();
    },
  };
};
