/**
 * Ζʹ Lotofaglar — the shore of the Lotus-eaters.
 *
 * 0  A gentle shore of lotus and a date palm; the Lotophagoi, robed, offer
 *    their honey-sweet fruit to the three scouts sent up from the ship.
 * 1  The scouts lie dreaming among the lotus, eating. The reader taps each in
 *    turn; a comrade (last of all Odysseus) hauls him back to the ship while
 *    he strains back towards the plants.
 * 2  The ship pulls away with the three bound and weeping aboard; the
 *    Lotus-eaters wave from the shore.
 */
import { s } from '../lib/dom';
import { gsap } from '../lib/motion';
import type { Vec } from '../lib/geometry';
import { POSES, pose, INK, WHITE, PURPLE, type Pose } from '../art/figure';
import { inscription, sea, SEA_TILE, fillers } from '../art/kit';
import { ship, rowing, BLACK_FIGURE } from '../art/ship';
import { stage } from './tools';
import type { SceneFactory } from '../story/types';
import { lotusPlant, lotusFlower, datePalm, fruitBasket, fruitSprig, fruit, kerykeion, tear, dolphin, type LotusParts } from './lotofaglar.art';
import { Actor, poseTo, walkTo } from './kyklop.rig';

const GROUND = 96;
const MAN = 1.3;

/* Poses. */
const RECLINE: Partial<Pose> = { x: 0, y: -8, lean: -56, head: 30, armF: [120, 100], armB: [-28, -62], legF: [84, 10], legB: [76, 22], footF: 10, footB: 4, grip: 1 };
const SQUAT: Partial<Pose> = { x: 0, y: -14, lean: -10, head: -14, armF: [130, 110], armB: [60, 60], legF: [118, 108], legB: [104, 100], footF: 8, footB: 12, grip: 1 };
const KNEEL: Partial<Pose> = { x: 0, y: -13, lean: -8, head: -24, armF: [138, 36], armB: [36, 50], legF: [80, 162], legB: [72, 158], footF: 60, footB: 60, grip: 1 };
const RESIST: Partial<Pose> = { x: 0, y: -20, lean: -36, head: -18, armF: [96, -8], armB: [-152, 28], legF: [68, 26], legB: [58, 48], footF: 22, footB: 12, grip: 0 };

export const scene: SceneFactory = (ctx) => {
  const st = stage(ctx);
  const world = s('g', { class: 'lot' });
  ctx.root.appendChild(world);

  /* ================================================================ */
  /* Tableau 1: the shore                                              */
  /* ================================================================ */
  const shore = s('g', { class: 'lot-shore' });
  world.appendChild(shore);
  shore.appendChild(fillers([[-40, -128], [30, -140], [86, -112], [112, -64]], 4.4));
  // The sea on the right, the land sloping into it.
  const waves = sea(100, { crestHeight: 16 });
  shore.appendChild(waves.g);
  shore.appendChild(s('path', { d: `M-200 ${GROUND}H58C70 ${GROUND} 78 ${GROUND + 5} 84 ${GROUND + 14}L96 ${GROUND + 40}H-200Z`, fill: INK }));
  shore.appendChild(s('path', { d: `M-200 ${GROUND + 5}H56`, stroke: '#c4662f', 'stroke-width': 0.6, opacity: 0.5 }));

  // The ship, moored stern to the shore, cropped by the rim.
  const moored = ship({ palette: BLACK_FIGURE, sail: 'furled', oars: 11, crew: 0 });
  const mooredWrap = s('g');
  const mooredPos = { y: 104, rot: 0 };
  const placeMoored = () => mooredWrap.setAttribute('transform', `translate(176 ${mooredPos.y.toFixed(2)}) rotate(${mooredPos.rot.toFixed(2)}) scale(2)`);
  placeMoored();
  mooredWrap.appendChild(moored.g);
  // Heads of the scouts once they are back aboard.
  const aboard: SVGGElement[] = [-33, -27, -21].map((x) => {
    const g = s('g', { transform: `translate(${x} -8)`, opacity: 0 });
    g.appendChild(s('circle', { cx: 0, cy: 0, r: 2.4, fill: INK }));
    g.appendChild(s('path', { d: 'M-2.3 1.8H2.3L1.6 5.4H-1.6Z', fill: INK }));
    mooredWrap.appendChild(g);
    return g;
  });
  shore.appendChild(mooredWrap);

  // The date palm and the lotus.
  const palm = datePalm(-118, GROUND, 204, 8, 1.25);
  shore.appendChild(palm.g);
  const clumps: LotusParts[] = [lotusPlant(-92, GROUND, 96, 3), lotusPlant(-34, GROUND, 76, 11, -1), lotusPlant(18, GROUND, 88, 5)];
  clumps.forEach((c) => shore.appendChild(c.g));

  const cast = s('g', { class: 'lot-cast' });
  shore.appendChild(cast);

  /* ---------------- The Lotophagoi ---------------- */
  const woman = new Actor({ head: 'woman', garment: 'peplos', hat: 'veil', garmentColor: INK }, pose({ ...POSES.stand(0, 0), armF: [78, 34], armB: [66, 44] }), -104, GROUND, MAN);
  const elder = new Actor({ head: 'old', garment: 'long', garmentColor: PURPLE, hat: 'wreath', cloak: true }, pose({ ...POSES.stand(0, 0), lean: 4, armF: [80, 14], armB: [8, 26] }), -64, GROUND, MAN);
  const basket = fruitBasket(1.1);
  const basketWrap = s('g');
  basketWrap.appendChild(basket);
  woman.g.appendChild(basketWrap);
  const placeBasket = () => {
    const w = woman.fig.hand('F');
    basketWrap.setAttribute('transform', `translate(${(w[0] + 4).toFixed(1)} ${(w[1] - 2).toFixed(1)})`);
  };
  placeBasket();
  const sprig = fruitSprig(1.2);
  const sprigWrap = s('g');
  sprigWrap.appendChild(sprig);
  elder.g.appendChild(sprigWrap);
  const placeSprig = () => {
    const w = elder.fig.hand('F');
    sprigWrap.setAttribute('transform', `translate(${(w[0] + 1).toFixed(1)} ${(w[1] + 1).toFixed(1)})`);
  };
  placeSprig();
  const lotoLabel = inscription('ΛΩΤΟΦΑΓΟΙ', -70, -52, { size: 6.4, align: 'middle' });
  shore.appendChild(lotoLabel);
  cast.append(woman.g, elder.g);

  /* ---------------- The scouts ---------------- */
  const walkPose = (): Pose => POSES.walk(0, 0);
  const herald = new Actor({ head: 'bearded', garment: 'short', facing: -1, cloak: true, cloakColor: PURPLE }, walkPose(), 150, GROUND, MAN);
  const scout2 = new Actor({ head: 'youth', garment: 'short', garmentColor: INK, facing: -1 }, walkPose(), 180, GROUND, MAN);
  const scout3 = new Actor({ head: 'bearded', garment: 'short', facing: -1 }, walkPose(), 210, GROUND, MAN);
  const scouts = [herald, scout2, scout3];
  const staff = kerykeion(48);
  const staffWrap = s('g');
  staffWrap.appendChild(staff);
  herald.g.appendChild(staffWrap);
  const placeStaff = () => {
    const w = herald.fig.hand('B');
    staffWrap.setAttribute('transform', `translate(${w[0].toFixed(1)} ${w[1].toFixed(1)}) rotate(${6 * herald.facing})`);
  };
  placeStaff();
  // Fruit held by each scout.
  const bites = scouts.map((a) => {
    const f = fruit(2.6);
    f.style.opacity = '0';
    cast.appendChild(f);
    return { f, a };
  });
  const placeBite = (k: number) => {
    const [x, y] = scouts[k].hand('F');
    bites[k].f.setAttribute('cx', (x + 2 * scouts[k].facing).toFixed(1));
    bites[k].f.setAttribute('cy', (y - 2).toFixed(1));
  };
  // The kneeling dreamer holds a lotus flower to his face.
  const held = s('g');
  held.appendChild(lotusFlower(1.1));
  held.style.opacity = '0';
  cast.appendChild(held);
  const placeHeld = () => {
    const [x, y] = scout3.hand('F');
    held.setAttribute('transform', `translate(${(x + 1).toFixed(1)} ${(y - 2).toFixed(1)}) rotate(-24)`);
  };
  // Hit areas for the taps (the reclining men are low and wide).
  const hits = scouts.map((a) => {
    const g = s('g', { class: 'lot-scout' });
    g.appendChild(a.g);
    cast.appendChild(g);
    return g;
  });

  /* ---------------- The comrades ---------------- */
  const youth = new Actor({ head: 'youth', garment: 'short', facing: -1 }, walkPose(), 110, GROUND, MAN);
  const bearded = new Actor({ head: 'bearded', garment: 'short', garmentColor: INK, facing: -1 }, walkPose(), 110, GROUND, MAN);
  const odysseus = new Actor({ hat: 'pilos', garment: 'short', cloak: true, facing: -1 }, walkPose(), 110, GROUND, MAN);
  const odyLabel = inscription('ΟΔΥΣΣΕΥΣ', 16, -92, { size: 5, angle: 90 });
  odysseus.g.appendChild(odyLabel);
  const helpers = [youth, bearded, odysseus];
  helpers.forEach((h) => {
    h.g.style.opacity = '0';
    cast.appendChild(h.g);
  });

  /* ================================================================ */
  /* Tableau 2: the ship pulls away                                    */
  /* ================================================================ */
  const away = s('g', { class: 'lot-away' });
  away.style.display = 'none';
  world.appendChild(away);
  away.appendChild(fillers([[-10, -136], [60, -120], [110, -80], [-60, -110]], 4.4));
  const waves2 = sea(66, { crestHeight: 18 });
  away.appendChild(waves2.g);
  // The shore with the waving Lotus-eaters.
  away.appendChild(s('path', { d: 'M-200 62H-92C-80 62 -72 68 -66 80L-58 110H-200Z', fill: INK }));
  const palm2 = datePalm(-140, 62, 176, 21, 1.15);
  away.appendChild(palm2.g);
  const clump2 = lotusPlant(-80, 62, 62, 7);
  away.appendChild(clump2.g);
  const wavers = [
    new Actor({ head: 'old', garment: 'long', garmentColor: PURPLE, hat: 'wreath', cloak: true }, pose({ ...POSES.stand(0, 0), armF: [150, 20], armB: [20, 20] }), -124, 62, 1.05),
    new Actor({ head: 'woman', garment: 'peplos', hat: 'veil', garmentColor: INK }, pose({ ...POSES.stand(0, 0), armF: [160, 10], armB: [120, 30] }), -98, 62, 1.05),
  ];
  wavers.forEach((w) => away.appendChild(w.g));
  away.appendChild(inscription('ΛΩΤΟΦΑΓΟΙ', -94, -64, { size: 6, align: 'middle' }));
  // The ship with the bound men.
  const vessel = ship({ palette: BLACK_FIGURE, sail: 'furled', oars: 11, crew: 2 });
  const vesselWrap = s('g');
  const vPos = { x: 40, y: 84, rot: 0 };
  const placeVessel = () => vesselWrap.setAttribute('transform', `translate(${vPos.x.toFixed(1)} ${vPos.y.toFixed(2)}) rotate(${vPos.rot.toFixed(2)}) scale(2.2)`);
  placeVessel();
  const deck = s('g');
  vesselWrap.appendChild(deck);
  vesselWrap.appendChild(vessel.g);
  const bound = [-12, 0, 12].map((x, k) => {
    const a = new Actor({ head: k === 1 ? 'youth' : 'bearded', garment: 'short', garmentColor: k === 1 ? INK : PURPLE }, pose({ ...POSES.sit(0, 0), lean: 18, head: 34, armF: [-36, 70], armB: [-48, 64], legF: [70, 80], legB: [64, 76] }), x, 7, 0.43);
    deck.appendChild(a.g);
    return a;
  });
  // Ropes in added white across the bound men's chests.
  const ropes = s('g');
  bound.forEach((a) => {
    const j = a.fig.joints();
    const p1 = a.toWorld([j.P[0] - 6, j.P[1] - 18]), p2 = a.toWorld([j.P[0] + 6, j.P[1] - 13]);
    const p3 = a.toWorld([j.P[0] - 6, j.P[1] - 10]), p4 = a.toWorld([j.P[0] + 6, j.P[1] - 6]);
    ropes.appendChild(s('path', { d: `M${p1[0].toFixed(1)} ${p1[1].toFixed(1)}L${p2[0].toFixed(1)} ${p2[1].toFixed(1)}M${p3[0].toFixed(1)} ${p3[1].toFixed(1)}L${p4[0].toFixed(1)} ${p4[1].toFixed(1)}`, stroke: WHITE, 'stroke-width': 0.7, 'stroke-linecap': 'round' }));
  });
  vesselWrap.appendChild(ropes);
  const tears = s('g');
  vesselWrap.appendChild(tears);
  const helm = new Actor({ hat: 'pilos', garment: 'short', cloak: true }, pose({ ...POSES.stand(0, 0), lean: 6, armF: [40, 20], armB: [-50, 30] }), -33, -3, 0.4);
  vesselWrap.appendChild(helm.g);
  helm.g.appendChild(inscription('ΟΔΥΣΣΕΥΣ', -30, -92, { size: 7, angle: 90 }));
  away.appendChild(vesselWrap);
  // Dolphins in reserved clay swim in the black water below.
  const pod = [dolphin(), dolphin()];
  pod.forEach((d) => away.appendChild(d));

  /* ================================================================ */
  /* Idle life                                                         */
  /* ================================================================ */
  const idle = () => {
    st.loop(gsap.to(waves.crests, { x: -SEA_TILE, duration: 3.2, ease: 'none', repeat: -1 }));
    st.loop(gsap.to(palm.crown, { rotation: 2.4, svgOrigin: '0 0', duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    clumps.forEach((c, i) =>
      c.heads.forEach((h, k) => st.loop(gsap.to(h, { rotation: k % 2 ? 5 : -4, svgOrigin: '0 0', duration: 1.8 + ((i + k) % 3) * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: k * 0.3 }))),
    );
    st.loop(gsap.to(mooredPos, { rot: 1, y: 105, duration: 1.9, ease: 'sine.inOut', yoyo: true, repeat: -1, onUpdate: placeMoored }));
  };
  idle();

  /** Keep a scout's fruit at his lips, bringing it up and down (eating). */
  const eating: gsap.core.Animation[] = [];
  const eat = (k: number, period: number, delay: number) => {
    const a = scouts[k];
    const proxy = { t: 0 };
    let rest: Vec | null = null;
    return st.loop(
      gsap.to(proxy, {
        t: 1,
        duration: period,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay,
        onUpdate: () => {
          rest ??= a.hand('F');
          const m = a.mouth();
          const to: Vec = [m[0] + 3 * a.facing, m[1] + 2];
          a.reach('F', [rest[0] + (to[0] - rest[0]) * proxy.t, rest[1] + (to[1] - rest[1]) * proxy.t]);
          placeBite(k);
        },
      }),
    );
  };

  return {
    enter() {
      // The scouts come up from the ship.
      const tl = st.timeline();
      const spots = [-22, 22, 58];
      scouts.forEach((a, k) => tl.add(walkTo(a, spots[k], 2 - k * 0.2, { ease: 'power1.out', arms: a !== herald, onUpdate: a === herald ? placeStaff : undefined }), k * 0.18));
      tl.from([woman.g, elder.g, lotoLabel], { opacity: 0, duration: 0.8 }, 0.2);
      return st.play(tl);
    },

    async beat(i) {
      if (i === 0) {
        // The elder holds out a sprig of lotus; the herald takes a fruit and tastes it.
        const tl = st.timeline();
        tl.add(poseTo(elder.fig, { armF: [96, 10], lean: 8, head: 6 }, { duration: 0.6, onUpdate: placeSprig }), 0);
        tl.add(poseTo(woman.fig, { armF: [96, 30], armB: [84, 40], head: 6 }, { duration: 0.6, onUpdate: placeBasket }), 0.1);
        tl.add(poseTo(herald.fig, { armF: [92, 10], lean: 6, head: 4 }, { duration: 0.6, onUpdate: placeStaff }), 0.2);
        tl.add(poseTo(scout2.fig, { armF: [60, 60], head: -8 }, { duration: 0.6 }), 0.3);
        tl.call(() => {
          bites[0].f.style.opacity = '1';
          placeBite(0);
        }, [], 0.8);
        const lift = { t: 0 };
        let from: Vec = [0, 0];
        tl.call(() => {
          from = herald.hand('F');
        }, [], 0.85);
        tl.to(lift, {
          t: 1,
          duration: 0.7,
          ease: 'power2.inOut',
          onUpdate: () => {
            const m = herald.mouth();
            herald.reach('F', [from[0] + (m[0] - 3 - from[0]) * lift.t, from[1] + (m[1] + 2 - from[1]) * lift.t]);
            placeBite(0);
          },
        }, 0.85);
        tl.add(poseTo(herald.fig, { head: -10 }, { duration: 0.5 }), 1.3);
        return st.play(tl);
      }

      if (i === 1) {
        // The Lotus-eaters withdraw; the scouts sink down among the lotus, dreaming.
        const tl = st.timeline();
        tl.call(() => {
          woman.face(-1);
          elder.face(-1);
        }, [], 0);
        tl.add(walkTo(woman, -170, 1.6, { arms: false, onUpdate: placeBasket }), 0);
        tl.add(walkTo(elder, -150, 1.6, { arms: false, onUpdate: placeSprig }), 0.1);
        tl.to([woman.g, elder.g, lotoLabel], { opacity: 0, duration: 0.8 }, 0.8);
        // The herald's staff drops.
        const dropStaff = { t: 0 };
        let s0: Vec = [0, 0];
        const placeFallen = () => {
          const t = dropStaff.t;
          const x = s0[0] + (-20 - s0[0]) * t, y = s0[1] + (GROUND - 3 - s0[1]) * t;
          staffWrap.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(6 + 84 * t).toFixed(1)}) scale(${MAN})`);
        };
        tl.call(() => {
          s0 = herald.hand('B');
          staffWrap.remove();
          cast.insertBefore(staffWrap, cast.firstChild);
          placeFallen();
        }, [], 0.2);
        tl.to(dropStaff, { t: 1, duration: 0.7, ease: 'bounce.out', onUpdate: placeFallen }, 0.2);
        const lie: Array<[Actor, Partial<Pose>, number]> = [[herald, RECLINE, -80], [scout2, SQUAT, -16], [scout3, KNEEL, 40]];
        lie.forEach(([a, p, x], k) => {
          tl.call(() => a.face(1), [], 0.3 + k * 0.15);
          tl.to(a, { x, duration: 0.9, ease: 'power2.inOut', onUpdate: () => a.place() }, 0.3 + k * 0.15);
          tl.add(poseTo(a.fig, p, { duration: 0.9 }), 0.3 + k * 0.15);
        });
        tl.call(() => {
          bites[1].f.style.opacity = '1';
          bites.forEach((_, k) => placeBite(k));
          placeHeld();
        }, [], 1.3);
        tl.to(held, { opacity: 1, duration: 0.4 }, 1.3);
        await st.play(tl);
        if (ctx.signal.aborted) return;
        eating.push(eat(0, 1.4, 0), eat(1, 1.1, 0.4));
        // The kneeling one sways, breathing in the flower.
        eating.push(st.loop(poseTo(scout3.fig, { lean: -16, head: -32 }, { duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1, onUpdate: placeHeld })));
        // Tap each dreamer in turn: a comrade hauls him back to the ship.
        const order = [2, 1, 0];
        const labels = ['Keşifçiye dokun (1/3)', 'Keşifçiye dokun (2/3)', 'Keşifçiye dokun (3/3)'];
        for (let n = 0; n < 3; n++) {
          const k = order[n];
          const scout = scouts[k];
          const hit = hits[k];
          const j = scout.fig.joints();
          const a = scout.toWorld([j.P[0] - 34, j.P[1] - 26]);
          const b = scout.toWorld([j.P[0] + 50, j.P[1] + 12]);
          const pad = s('rect', { x: Math.min(a[0], b[0]).toFixed(1), y: Math.min(a[1], b[1]).toFixed(1), width: Math.abs(b[0] - a[0]).toFixed(1), height: Math.abs(b[1] - a[1]).toFixed(1), fill: 'transparent' });
          hit.insertBefore(pad, hit.firstChild);
          await ctx.tap(hit, { label: labels[n] });
          pad.remove();
          if (ctx.signal.aborted) return;
          await rescue(k, helpers[n], n);
          if (ctx.signal.aborted) return;
        }
        return;
      }

      if (i === 2) {
        // Cut to the open sea: the ship pulls away with the three bound aboard.
        const cut = st.timeline();
        cut.to(shore, { opacity: 0, x: -40, duration: 0.6, ease: 'power2.in' })
          .set(shore, { display: 'none' })
          .set(away, { display: 'inline' })
          .fromTo(away, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' });
        ctx.audio.sfx('depart');
        st.loop(gsap.to(waves2.crests, { x: -SEA_TILE, duration: 1.5, ease: 'none', repeat: -1 }));
        st.loop(rowing(vessel.oars, gsap, 1));
        st.loop(gsap.to(vPos, { rot: 1.2, y: 85.5, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: -1, onUpdate: placeVessel }));
        st.loop(gsap.to(palm2.crown, { rotation: 2.4, svgOrigin: '0 0', duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
        // The Lotus-eaters wave.
        wavers.forEach((w, k) => st.loop(poseTo(w.fig, { armF: [124 + k * 8, 34] }, { duration: 0.55 + k * 0.1, ease: 'sine.inOut', yoyo: true, repeat: -1 })));
        // Tears fall from the bound men.
        bound.forEach((a, k) => {
          const e = a.headPoint(4.4, -1);
          const drop = tear();
          const at = s('g', { transform: `translate(${e[0].toFixed(1)} ${e[1].toFixed(1)}) scale(0.9)` });
          const fall = s('g');
          fall.appendChild(drop);
          at.appendChild(fall);
          tears.appendChild(at);
          st.loop(gsap.fromTo(fall, { y: 0, opacity: 1 }, { y: 7, opacity: 0, duration: 1.1, ease: 'power1.in', repeat: -1, delay: k * 0.35, repeatDelay: 0.3 }));
          st.loop(poseTo(a.fig, { head: 40, lean: 22 }, { duration: 0.9 + k * 0.15, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
        });
        // They swim right across and wrap round outside the rim, so the loop never shows.
        pod.forEach((d, k) => {
          const p = { t: k * 0.45 };
          const place = () => {
            const u = p.t % 1;
            const x = -150 + u * 300, a = u * Math.PI * 10;
            d.setAttribute('transform', `translate(${x.toFixed(1)} ${(128 + k * 12 + Math.sin(a) * 3).toFixed(1)}) rotate(${(Math.cos(a) * 7).toFixed(1)}) scale(${0.8 - k * 0.1})`);
          };
          place();
          st.loop(gsap.to(p, { t: `+=1`, duration: 11 - k * 1.5, ease: 'none', repeat: -1, onUpdate: place }));
        });
        const tl = st.timeline();
        tl.to(vPos, { x: 58, duration: 2.2, ease: 'power1.inOut', onUpdate: placeVessel }, 0.6);
        await Promise.all([st.play(cut), st.play(tl)]);
        return;
      }
    },

    destroy() {
      st.destroy();
    },
  };

  /** A comrade walks in from the ship and drags scout k back to it. */
  async function rescue(k: number, helper: Actor, n: number): Promise<void> {
    const scout = scouts[k];
    eating[k]?.kill();
    if (k === 2) st.to(held, { opacity: 0, duration: 0.3 });
    ctx.audio.sfx('thud');
    const feet = scout.x + (k === 0 ? 50 : 26);
    const tl = st.timeline();
    helper.face(-1);
    helper.x = 100;
    helper.place();
    tl.to(helper.g, { opacity: 1, duration: 0.25 }, 0);
    tl.add(walkTo(helper, Math.min(92, feet + 6), 0.4 + Math.max(0, 100 - feet) / 150, { stride: 36 }), 0);
    const t1 = 0.45 + Math.max(0, 100 - feet) / 150;
    tl.call(() => helper.face(1), [], t1);
    tl.add(poseTo(helper.fig, { lean: 24, head: 4, armF: [50, 30], armB: [-66, 4] }, { duration: 0.25 }), t1);
    // The dreamer is pulled up, straining back towards the lotus.
    tl.to(bites[k].f, { opacity: 0, duration: 0.2 }, t1);
    tl.add(poseTo(scout.fig, RESIST, { duration: 0.35 }), t1 + 0.05);
    // Hands meet (eased in over the pull), then the two move as one.
    const grip = { w: 0 };
    const hold = () => {
      const hb = helper.hand('B');
      const sf = scout.hand('F');
      scout.x += (hb[0] - sf[0] - 1.5) * grip.w;
      scout.place();
      if (grip.w > 0.5) helper.reach('B', scout.hand('F'));
    };
    tl.to(grip, { w: 1, duration: 0.35, ease: 'power1.in', onUpdate: hold }, t1 + 0.05);
    tl.add(walkTo(helper, 88, Math.max(0.9, (88 - (feet + 6)) / 85), { stride: 24, arms: false, onUpdate: hold }), t1 + 0.4);
    tl.add(poseTo(scout.fig, { armB: [-120, 40] }, { duration: 0.4, yoyo: true, repeat: 3, ease: 'sine.inOut' }), t1 + 0.4);
    const t2 = t1 + 0.4 + Math.max(0.9, (88 - (feet + 6)) / 85);
    tl.to([helper.g, hits[k]], { opacity: 0, duration: 0.3 }, t2 - 0.15);
    tl.to(aboard[n], { opacity: 1, duration: 0.3 }, t2);
    await st.play(tl);
  }
};
