/**
 * Θʹ Kyklop — Polyphemos's cave.
 *
 * 0  Odysseus and his men enter the empty cave: cheeses, pails, lambs in a pen.
 * 1  The giant drives his flock in, sets the door stone, kindles the fire and
 *    seizes two men (lifted into the dark — no gore).
 * 2  The great cup of Maron's wine; the reader answers “Adın ne?” — ΟΥΤΙΣ —
 *    and the drunk giant drains the cup and falls asleep.
 * 3  The fire-hardened stake is dragged into the eye; the blinded giant rears up.
 * 4  Morning: the flock files out past the blind giant, who feels the rams'
 *    backs; the reader sends Odysseus under the belly of the great ram.
 * 5  At sea Odysseus shouts his real name; Polyphemos hurls a crag from the
 *    cliff and Poseidon's trident looms: the god's wrath begins.
 */
import { s } from '../lib/dom';
import { gsap } from '../lib/motion';
import { clamp, type Vec } from '../lib/geometry';
import { POSES, pose, INK, WHITE, type Pose } from '../art/figure';
import { Beast } from '../art/animals';
import { exergue, inscription, flames, glow, kylix, amphora, sea, SEA_TILE, splash, cloud, rock, fillers } from '../art/kit';
import { ship, rowing, BLACK_FIGURE } from '../art/ship';
import { stage } from './tools';
import type { SceneFactory } from '../story/types';
import {
  GROUND, Actor, poseTo, gait, writeIn, cave, boulder, cheeseBasket, milkPail, fence, hearthStones, stake, trident,
} from './kyklop.art';

const MAN = 1.15;
const GIANT = 2.1;
const HEARTH_X = -58;
const DOOR: Vec = [156, 14];

export const scene: SceneFactory = (ctx) => {
  const st = stage(ctx);
  const world = s('g', { class: 'kyk' });
  ctx.root.appendChild(world);

  /* ================================================================ */
  /* The cave                                                          */
  /* ================================================================ */
  const cavePic = s('g', { class: 'kyk-cave' });
  world.appendChild(cavePic);
  const veil = s('rect', { x: -200, y: -200, width: 400, height: 400, fill: INK, opacity: 0.05 });
  const cv = cave();
  cavePic.append(veil, cv.outside, cv.rock);

  // The fire light sits under the floor band so it only warms the cave.
  const fireGlow = glow(ctx.defs, HEARTH_X, GROUND - 22, 70, WHITE, 0.26);
  fireGlow.style.opacity = '0';
  cavePic.appendChild(fireGlow);
  cavePic.appendChild(exergue(GROUND));

  // Cheese baskets on the shelf, lambs penned below, milk pails by the hearth.
  const props = s('g', { class: 'kyk-props' });
  props.append(cheeseBasket(-150, -21, 0.92), cheeseBasket(-131, -21.5, 1.04), cheeseBasket(-113, -22.5, 0.88));
  const lambs = [
    new Beast('sheep', { x: -132, y: GROUND - 2, scale: 0.56 }),
    new Beast('sheep', { x: -110, y: GROUND - 1, scale: 0.5, facing: -1 }),
  ];
  lambs.forEach((l) => props.appendChild(l.g));
  props.appendChild(fence(-150, -96, GROUND, 17));
  props.append(milkPail(-86, GROUND, 0.95), milkPail(-24, GROUND, 0.8));
  cavePic.appendChild(props);

  // The hearth: stones and flames (kindled in beat 1).
  cavePic.appendChild(hearthStones(HEARTH_X, GROUND));
  const fire = s('g', { class: 'kyk-fire' });
  const fireInner = flames(0, 0, 0.95);
  fire.appendChild(fireInner);
  const fireScale = { v: 0 };
  const placeFire = () => fire.setAttribute('transform', `translate(${HEARTH_X} ${GROUND - 4}) scale(1 ${fireScale.v.toFixed(3)})`);
  placeFire();
  cavePic.appendChild(fire);

  // The door stone waits outside until the giant sets it.
  const door = boulder(86);
  const doorPos = { x: 320, rot: 170 };
  const placeDoor = () => door.setAttribute('transform', `translate(${doorPos.x.toFixed(1)} ${DOOR[1]}) rotate(${doorPos.rot.toFixed(1)})`);
  placeDoor();
  cavePic.appendChild(door);

  // Layers for the moving cast.
  const flockLayer = s('g', { class: 'kyk-flock' });
  const stakeLayer = s('g', { class: 'kyk-stake-layer' });
  const menLayer = s('g', { class: 'kyk-men' });
  const giantLayer = s('g', { class: 'kyk-giant' });
  const frontLayer = s('g', { class: 'kyk-front' });
  const labelLayer = s('g', { class: 'kyk-labels' });
  cavePic.append(flockLayer, stakeLayer, menLayer, giantLayer, frontLayer, labelLayer);

  /* ---------------- The men ---------------- */
  const walkPose = (): Pose => POSES.walk(0, 0);
  const odysseus = new Actor({ hat: 'pilos', garment: 'short', cloak: true, facing: -1 }, walkPose(), 240, GROUND, MAN, 'odysseus');
  const c1 = new Actor({ head: 'youth', garment: 'short', garmentColor: INK, facing: -1 }, pose({ ...walkPose(), armF: [150, 40], armB: [30, 20] }), 274, GROUND, MAN);
  const c2 = new Actor({ head: 'bearded', garment: 'short', facing: -1 }, walkPose(), 306, GROUND, MAN);
  const c3 = new Actor({ head: 'bearded', garment: 'short', garmentColor: INK, facing: -1 }, walkPose(), 338, GROUND, MAN);
  const c4 = new Actor({ head: 'youth', garment: 'short', facing: -1 }, walkPose(), 370, GROUND, MAN);
  menLayer.append(c4.g, c3.g, c2.g, c1.g, odysseus.g);
  const odyLabel = inscription('ΟΔΥΣΣΕΥΣ', 0, -112, { size: 5.6, align: 'middle' });
  odysseus.g.appendChild(odyLabel);
  // The wine amphora on c1's shoulder.
  const amphWrap = s('g');
  amphWrap.appendChild(amphora(0, 0, 0.6));
  c1.g.appendChild(amphWrap);
  const placeAmphora = () => {
    const j = c1.fig.joints();
    const [hx, hy] = j.armF.W;
    amphWrap.setAttribute('transform', `translate(${(hx + 3).toFixed(1)} ${(hy + 21).toFixed(1)}) rotate(-26)`);
  };
  placeAmphora();

  /* ---------------- The giant ---------------- */
  const giant = new Actor({ head: 'cyclops', garment: 'none', facing: -1 }, walkPose(), 320, GROUND, GIANT, 'polyphemos');
  giantLayer.appendChild(giant.g);
  const giantLabel = inscription('ΠΟΛΥΦΑΜΟΣ', 13, -97, { size: 3.3, angle: 90 });
  giantLabel.style.opacity = '0';
  giant.g.appendChild(giantLabel);

  /* ---------------- Helpers ---------------- */
  /** Walk an actor to x, legs in step with the distance covered. */
  const walkTo = (a: Actor, toX: number, dur: number, o: { stride?: number; ease?: string; arms?: boolean; onUpdate?: () => void } = {}) => {
    const proxy = { t: 0 };
    let x0 = 0;
    const stride = (o.stride ?? 34) * a.k;
    return gsap.to(proxy, {
      t: 1,
      duration: dur,
      ease: o.ease ?? 'power1.inOut',
      onStart: () => {
        x0 = a.x;
      },
      onUpdate: function (this: gsap.core.Tween) {
        a.x = x0 + (toX - x0) * proxy.t;
        a.place();
        const lin = this.progress();
        const amp = Math.min(1, lin * 6 + 0.25, (1 - lin) * 5);
        gait(a.fig, Math.abs(a.x - x0) / stride, amp, o.arms ?? true);
        o.onUpdate?.();
      },
    });
  };
  /** Walk a beast to x, stepping with the distance covered. */
  const beastTo = (b: Beast, toX: number, dur: number, ease = 'none', onUpdate?: () => void) => {
    const proxy = { t: 0 };
    let x0 = 0;
    return gsap.to(proxy, {
      t: 1,
      duration: dur,
      ease,
      onStart: () => {
        x0 = b.x;
      },
      onUpdate: () => {
        const x = x0 + (toX - x0) * proxy.t;
        b.moveTo(x);
        b.step((Math.abs(x - x0) / (30 * b.scale)) % 1);
        onUpdate?.();
      },
    });
  };
  /** Background motion that may outlive a beat (killed on destroy; finished at once for reduced motion). */
  const later = <T extends gsap.core.Animation>(a: T, delay = 0): T => {
    const tl = st.timeline({ delay });
    tl.add(a);
    if (ctx.reduced) tl.progress(1);
    return a;
  };
  let giantIdle: gsap.core.Animation | null = null;
  let feelLoop: gsap.core.Animation | null = null;
  let flameTweens: gsap.core.Animation[] = [];
  const flameLoop = () => {
    flameTweens = [
      st.loop(gsap.to(fireInner.querySelectorAll('.kit-flame__tongue'), { scaleY: 0.8, scaleX: 1.07, transformOrigin: '50% 100%', duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.1 })),
      st.loop(gsap.to(fireGlow, { attr: { r: 62 }, duration: 0.45, ease: 'sine.inOut', yoyo: true, repeat: -1 })),
    ];
  };
  const localShake = (k = 4) =>
    st.to(world, { keyframes: [{ x: -k, y: k * 0.5, duration: 0.05 }, { x: k * 0.8, y: -k * 0.4, duration: 0.05 }, { x: -k * 0.4, y: k * 0.3, duration: 0.06 }, { x: 0, y: 0, duration: 0.08 }], duration: 0.24 });

  // Idle life: lambs nod in the pen.
  lambs.forEach((l, i) => {
    const p = { a: 0 };
    st.loop(gsap.to(p, { a: 1, duration: 1.7 + i * 0.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.5, onUpdate: () => l.nod(-8 + p.a * 24) }));
  });

  /* ---------------- The flock ---------------- */
  const flock = [
    new Beast('ram', { x: 250, y: GROUND, scale: 1.6, facing: -1 }),
    new Beast('sheep', { x: 300, y: GROUND, scale: 1.45, facing: -1 }),
    new Beast('ram', { x: 350, y: GROUND, scale: 1.55, facing: -1 }),
  ];
  flock.forEach((b) => flockLayer.appendChild(b.g));

  /* ---------------- The great cup ---------------- */
  const cup = s('g', { class: 'kyk-cup' });
  cup.appendChild(kylix(0, 0, 1.7));
  cup.style.opacity = '0';
  frontLayer.appendChild(cup);
  const placeCup = (at: Vec, rot = 0) => cup.setAttribute('transform', `translate(${at[0].toFixed(1)} ${at[1].toFixed(1)}) rotate(${rot.toFixed(1)})`);
  const outis = inscription('ΟΥΤΙΣ', -96, -58, { size: 12 });
  outis.style.opacity = '0';
  labelLayer.appendChild(outis);

  /* ---------------- The stake ---------------- */
  const stk = stake(156);
  const stakeGrip = s('g', { class: 'kyk-stake-grip' });
  stakeGrip.appendChild(s('rect', { x: -160, y: -16, width: 172, height: 32, fill: 'transparent' }));
  stakeGrip.appendChild(stk.g);
  const tipFlame = s('g');
  const tipFlameInner = flames(0, 3, 0.36);
  tipFlame.appendChild(tipFlameInner);
  stakeGrip.appendChild(tipFlame);
  stakeGrip.style.opacity = '0';
  stakeLayer.appendChild(stakeGrip);
  const stakeAt = { x: HEARTH_X + 6, y: GROUND - 7, rot: -2 };
  const placeStake = () => {
    stakeGrip.setAttribute('transform', `translate(${stakeAt.x.toFixed(1)} ${stakeAt.y.toFixed(1)}) rotate(${stakeAt.rot.toFixed(2)})`);
    // The flames at the point always lick upwards.
    tipFlame.setAttribute('transform', `rotate(${(-stakeAt.rot).toFixed(2)})`);
  };
  placeStake();
  /** A point `d` units back along the stake from its point. */
  const alongStake = (d: number): Vec => {
    const a = (stakeAt.rot * Math.PI) / 180;
    return [stakeAt.x - Math.cos(a) * d, stakeAt.y - Math.sin(a) * d];
  };
  const flashDisc = s('circle', { r: 170, fill: WHITE, opacity: 0, 'pointer-events': 'none' });
  cavePic.appendChild(flashDisc);

  /* ---------------- Beat 4: the great ram ---------------- */
  const exitLayer = s('g', { class: 'kyk-exit' });
  frontLayer.appendChild(exitLayer);
  const bigRam = new Beast('ram', { x: -250, y: GROUND, scale: 2.05 });
  const ramHit = s('g', { class: 'kyk-great-ram' });
  const ramHitRect = s('rect', { x: -60, y: -80, width: 128, height: 82, fill: 'transparent' });
  ramHit.append(bigRam.g);
  exitLayer.appendChild(ramHit);

  /* ================================================================ */
  /* The sea (beat 5)                                                  */
  /* ================================================================ */
  const seaPic = s('g', { class: 'kyk-sea' });
  seaPic.style.display = 'none';
  world.appendChild(seaPic);
  const looming = s('g', { class: 'kyk-looming' });
  looming.style.opacity = '0';
  const triWrap = s('g', { transform: 'translate(170 -196) rotate(204)' });
  triWrap.appendChild(trident(178));
  looming.append(triWrap, cloud(128, -112, 120, INK));
  seaPic.appendChild(looming);
  seaPic.appendChild(fillers([[-30, -122], [26, -140], [-4, -96]], 4.4));
  const waves = sea(66, { crestHeight: 18 });
  seaPic.appendChild(waves.g);
  const vessel = ship({ palette: BLACK_FIGURE, sail: 'full', oars: 11, crew: 6 });
  const shipWrap = s('g');
  const shipPos = { x: 70, y: 84, rot: 0, lurch: 0 };
  const placeShip = () => shipWrap.setAttribute('transform', `translate(${shipPos.x.toFixed(1)} ${shipPos.y.toFixed(1)}) rotate(${(shipPos.rot + shipPos.lurch).toFixed(2)}) scale(1.8)`);
  placeShip();
  shipWrap.appendChild(vessel.g);
  const hero = new Actor({ hat: 'pilos', garment: 'short', cloak: true, facing: -1 }, pose({ ...POSES.stand(0, 0), armF: [40, 30], armB: [-20, 20] }), -31, -4, 0.42);
  shipWrap.appendChild(hero.g);
  seaPic.appendChild(shipWrap);
  seaPic.appendChild(rock([[-200, 200], [-200, 16], [-168, 16], [-132, 17], [-108, 20], [-94, 34], [-86, 56], [-76, 72], [-70, 110], [-68, 200]], { lines: 5, seed: 23 }));
  const thrower = new Actor({ head: 'cyclops', garment: 'none', facing: 1 }, pose({ ...POSES.stand(0, 0), armF: [150, 40], armB: [150, 30] }), -138, 18, 0.98);
  thrower.fig.blind = true;
  thrower.fig.render();
  thrower.g.appendChild(inscription('ΠΟΛΥΦΑΜΟΣ', -24, -96, { size: 6.2, angle: 90 }));
  seaPic.appendChild(thrower.g);
  const crag = boulder(13, 4);
  const cragPos = { x: 0, y: 0, rot: 0 };
  const placeCrag = () => crag.setAttribute('transform', `translate(${cragPos.x.toFixed(1)} ${cragPos.y.toFixed(1)}) rotate(${cragPos.rot.toFixed(1)})`);
  seaPic.appendChild(crag);
  const splashG = s('g');
  const splashInner = s('g');
  splashInner.appendChild(splash(0, 0, 1.7));
  splashG.appendChild(splashInner);
  splashG.style.opacity = '0';
  seaPic.appendChild(splashG);
  const shout = inscription('ΟΔΥΣΣΕΥΣ', -74, -44, { size: 10.5, angle: -7 });
  shout.style.opacity = '0';
  seaPic.appendChild(shout);

  /* ================================================================ */
  /* Beats                                                             */
  /* ================================================================ */
  const survivors = [odysseus, c1, c2];

  return {
    enter() {
      const tl = st.timeline();
      const spots: Array<[Actor, number]> = [[odysseus, -64], [c1, -30], [c2, 4], [c3, 38], [c4, 72]];
      spots.forEach(([a, x], i) => {
        tl.add(walkTo(a, x, 2.1 - i * 0.1, { ease: 'power1.out', arms: a !== c1 }), i * 0.1);
      });
      tl.from(odyLabel, { opacity: 0, duration: 0.6 }, 1.6);
      return st.play(tl);
    },

    async beat(i) {
      if (i === 0) {
        // Odysseus points out the cheeses; the lambs bleat in their pen.
        ctx.audio.sfx('bleat');
        const tl = st.timeline();
        tl.add(poseTo(odysseus.fig, { armF: [152, 14], head: -12 }, { duration: 0.7 }), 0.1)
          .add(poseTo(c2.fig, { armF: [112, 26], head: -6 }, { duration: 0.6 }), 0.3)
          .add(poseTo(c3.fig, { head: 8, armB: [30, 60] }, { duration: 0.6 }), 0.4)
          .add(poseTo(c4.fig, { armF: [60, 90], head: -4 }, { duration: 0.6 }), 0.5);
        return st.play(tl);
      }

      if (i === 1) {
        const tl = st.timeline();
        // The flock streams in and on into the depths of the cave.
        flock.forEach((b, k) => later(beastTo(b, -260, 4.6), 0.2 + k * 0.55));
        tl.call(() => ctx.audio.sfx('bleat'), [], 0.4);
        // The men scatter to the back and cower.
        const hide: Array<[Actor, number]> = [[odysseus, -128], [c1, -100], [c2, -72], [c3, -40], [c4, -12]];
        hide.forEach(([a, x], k) => {
          tl.add(walkTo(a, x, 0.7, { stride: 40, ease: 'power2.out', arms: a !== c1 }), 0.05 + k * 0.05);
          tl.call(() => a.face(1), [], 0.78 + k * 0.04);
          tl.add(poseTo(a.fig, { ...POSES.plead(0, 0), head: -14, armF: [122, 30], armB: [98, 40] }, { duration: 0.35 }), 0.8 + k * 0.04);
        });
        tl.to(amphWrap, { opacity: 0, duration: 0.3 }, 0.7);
        // Polyphemos strides in.
        tl.add(walkTo(giant, 56, 1.4, { stride: 32, ease: 'power1.out' }), 0.3);
        tl.to(giantLabel, { opacity: 1, duration: 0.6 }, 1.2);
        // He turns and sets the door stone: the light dies.
        tl.call(() => giant.face(1), [], 1.72);
        tl.add(poseTo(giant.fig, { lean: 18, head: 6, armF: [98, 4], armB: [86, 10], legF: [22, 10], legB: [-16, 4] }, { duration: 0.3 }), 1.72);
        tl.to(doorPos, { x: DOOR[0], rot: 0, duration: 0.7, ease: 'power2.out', onUpdate: placeDoor }, 1.8);
        tl.call(() => {
          ctx.audio.sfx('boulder');
          localShake(3);
          ctx.atlas.shake(4);
        }, [], 2.42);
        tl.to(veil, { opacity: 0.3, duration: 0.8, ease: 'power1.in' }, 2.3);
        // He kindles the fire.
        tl.call(() => ctx.audio.sfx('fire'), [], 2.6);
        tl.to(fireScale, { v: 1, duration: 0.5, ease: 'back.out(2)', onUpdate: placeFire }, 2.6);
        tl.to(fireGlow, { opacity: 1, duration: 0.6 }, 2.6);
        tl.call(flameLoop, [], 3.1);
        // …and seizes two of the men.
        tl.call(() => giant.face(-1), [], 2.6);
        tl.add(walkTo(giant, 34, 0.45, { stride: 30 }), 2.6);
        const victims = [c3, c4];
        let held = false;
        const follow = () => {
          if (!held) return;
          const hands: Vec[] = [giant.hand('F'), giant.hand('B')];
          victims.forEach((v, k) => {
            v.x = hands[k][0] - 2;
            v.y = hands[k][1] - v.fig.pose.y * v.k + 3;
            v.place();
          });
        };
        tl.add(poseTo(giant.fig, { lean: 36, head: 12, armF: [70, 10], armB: [62, 16], legF: [46, 32], legB: [-26, 6] }, { duration: 0.4 }), 3.05);
        const grab = { t: 0 };
        tl.to(grab, {
          t: 1,
          duration: 0.4,
          onUpdate: () => {
            giant.reach('F', [c3.x - 2, GROUND - 40]);
            giant.reach('B', [c4.x - 2, GROUND - 42]);
          },
        }, 3.05);
        tl.call(() => {
          held = true;
          victims.forEach((v, k) => v.fig.set(pose({ x: 0, y: -50, head: 22, armF: [164 - k * 24, 20], armB: [-150 + k * 30, 30], legF: [30 + k * 20, 50], legB: [-20, 70] })));
          follow();
          ctx.audio.sfx('thud');
        }, [], 3.46);
        tl.add(poseTo(giant.fig, { lean: -6, head: -18, armF: [170, 8], armB: [160, 14], legF: [8, 4], legB: [-8, 4] }, { duration: 0.8, ease: 'power2.inOut', onUpdate: follow }), 3.5);
        tl.to(victims.map((v) => v.g), { opacity: 0, duration: 0.4 }, 4.05);
        tl.add(poseTo(giant.fig, { lean: 2, head: 0, armF: [22, 20], armB: [-14, 20] }, { duration: 0.6 }), 4.45);
        await st.play(tl);
        victims.forEach((v) => (v.g.style.display = 'none'));
        return;
      }

      if (i === 2) {
        // He sits down against the door stone; Odysseus offers the great cup.
        const seated: Partial<Pose> = { x: 0, y: -13, lean: -8, head: 0, armF: [66, 64], armB: [-12, 30], legF: [112, 100], legB: [100, 96], footF: 6, footB: 10 };
        const tl = st.timeline();
        tl.add(walkTo(giant, 40, 0.4, { stride: 30 }), 0);
        tl.add(poseTo(giant.fig, seated, { duration: 0.7 }), 0.35);
        tl.add(walkTo(odysseus, -44, 1.0, { stride: 32 }), 0.1);
        tl.add(poseTo(odysseus.fig, { lean: 4, head: -16, armF: [148, 8], armB: [138, 12] }, { duration: 0.45 }), 1.05);
        const cupOnOdy = () => {
          const [hx, hy] = odysseus.hand('F');
          placeCup([hx + 3, hy - 3]);
        };
        tl.set(cup, { opacity: 1 }, 1.05);
        tl.to({}, { duration: 0.5, onUpdate: cupOnOdy }, 1.05);
        // The giant takes the cup and drinks.
        const take = { t: 0 };
        let from: Vec = [0, 0];
        tl.call(() => {
          const [hx, hy] = odysseus.hand('F');
          from = [hx + 3, hy - 3];
        }, [], 1.56);
        tl.add(poseTo(giant.fig, { armF: [76, 40] }, { duration: 0.45 }), 1.5);
        const cupOnGiant = (rot = 0) => () => {
          const [gx, gy] = giant.hand('F');
          placeCup([gx - 3, gy - 7], rot);
        };
        tl.to(take, {
          t: 1,
          duration: 0.5,
          onUpdate: () => {
            const [gx, gy] = giant.hand('F');
            placeCup([from[0] + (gx - 3 - from[0]) * take.t, from[1] + (gy - 7 - from[1]) * take.t]);
          },
        }, 1.58);
        tl.add(poseTo(odysseus.fig, { armF: [70, 40], armB: [36, 30], head: -18 }, { duration: 0.5 }), 1.95);
        tl.add(poseTo(giant.fig, { armF: [118, 70], head: -26 }, { duration: 0.45, onUpdate: cupOnGiant(-40) }), 2.1);
        tl.add(poseTo(giant.fig, { armF: [76, 40], head: 0 }, { duration: 0.45, onUpdate: cupOnGiant(0) }), 2.6);
        await st.play(tl);

        // “Adın ne?” — the cunning man will not give his true name.
        let options = [
          { id: 'odysseus', label: 'Odysseus' },
          { id: 'kimse', label: 'Kimse (Outis)' },
        ];
        for (;;) {
          const id = await ctx.choose(options);
          if (ctx.signal.aborted) return;
          if (id === 'kimse') break;
          ctx.say('Kurnaz Odysseus gerçek adını söylemez. Başka bir ad dene…');
          ctx.audio.sfx('fail');
          // The giant leans in, suspicious.
          st.timeline()
            .add(poseTo(giant.fig, { lean: 8, head: 10 }, { duration: 0.35, onUpdate: cupOnGiant(0) }))
            .add(poseTo(giant.fig, { lean: -8, head: 0 }, { duration: 0.5, onUpdate: cupOnGiant(0) }), 0.6);
          // Deal the ostraka again in a new order.
          options = [...options].reverse();
        }
        ctx.audio.sfx('success');
        const tl2 = st.timeline();
        tl2.add(writeIn(outis, 1.0), 0);
        tl2.add(poseTo(odysseus.fig, { armB: [118, 20], head: -10 }, { duration: 0.5 }), 0);
        // He drains the cup…
        tl2.add(poseTo(giant.fig, { armF: [134, 76], head: -40, lean: -14 }, { duration: 0.6, onUpdate: cupOnGiant(-64) }), 0.9);
        tl2.to({}, { duration: 0.5, onUpdate: cupOnGiant(-74) }, 1.5);
        // …the cup slips from his fingers and he sinks back asleep.
        const fall = { t: 0 };
        let c0: Vec = [0, 0];
        tl2.call(() => {
          const [gx, gy] = giant.hand('F');
          c0 = [gx - 3, gy - 7];
        }, [], 2.0);
        tl2.to(fall, {
          t: 1,
          duration: 0.55,
          ease: 'power2.in',
          onUpdate: () => placeCup([c0[0] - 26 * fall.t, c0[1] + (GROUND - 5 - c0[1]) * fall.t], -74 + 164 * fall.t),
        }, 2.0);
        tl2.call(() => ctx.audio.sfx('thud'), [], 2.55);
        tl2.add(poseTo(giant.fig, { y: -10, lean: -36, head: 26, armF: [26, 30], armB: [-44, 66], legF: [84, 16], legB: [76, 6], footF: 6, footB: 4 }, { duration: 1.0 }), 2.0);
        tl2.add(poseTo(odysseus.fig, { armF: [30, 20], armB: [-10, 20], head: 0 }, { duration: 0.4 }), 2.6);
        tl2.call(() => odysseus.face(-1), [], 2.6);
        tl2.add(walkTo(odysseus, -96, 0.8, { stride: 32 }), 2.6);
        tl2.call(() => odysseus.face(1), [], 3.4);
        tl2.to(outis, { opacity: 0, duration: 0.8 }, 3.2);
        await st.play(tl2);
        // Snoring: a slow, heavy breath.
        giantIdle = st.loop(poseTo(giant.fig, { lean: -32, head: 22 }, { duration: 1.7, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
        return;
      }

      if (i === 3) {
        // The stake glows in the fire; three men take it up.
        const crew: Array<[Actor, number, number]> = [[odysseus, 30, 48], [c1, 72, 90], [c2, 114, 132]];
        const eye = giant.eye();
        const ready: Vec = [eye[0] - 72, eye[1] + 8];
        const rot = (Math.atan2(eye[1] - ready[1], eye[0] - ready[0]) * 180) / Math.PI;
        const grabX = crew.map((_, k) => -150 + k * 34);
        const slotX = (d1: number, d2: number) => (alongStake(d1)[0] + alongStake(d2)[0]) / 2 - 22;
        /** Put the stake's point at `tip`; `blend` moves the men from where they stand to their grip. */
        const aimAt = (tip: Vec, blend = 1) => {
          stakeAt.x = tip[0];
          stakeAt.y = tip[1];
          placeStake();
          crew.forEach(([a, d1, d2], k) => {
            a.x = grabX[k] + (slotX(d1, d2) - grabX[k]) * blend;
            a.place();
            a.reach('F', alongStake(d1));
            a.reach('B', alongStake(d2));
          });
        };
        const tl = st.timeline();
        tl.to(stakeGrip, { opacity: 1, duration: 0.4 }, 0);
        tl.to(stk.hot, { opacity: 1, duration: 0.6 }, 0.2);
        tl.call(() => ctx.audio.sfx('fire'), [], 0);
        crew.forEach(([a], k) => {
          tl.call(() => a.face(1), [], 0.1);
          tl.add(walkTo(a, grabX[k], 0.6, { stride: 34 }), 0.1);
          tl.add(poseTo(a.fig, { ...POSES.lunge(0, 0), head: -6 }, { duration: 0.4 }), 0.7);
        });
        // Lift the stake from the fire to the ready position.
        const lift = { t: 0 };
        const start = { x: stakeAt.x, y: stakeAt.y, rot: stakeAt.rot };
        tl.to(lift, {
          t: 1,
          duration: 0.9,
          ease: 'power2.inOut',
          onUpdate: () => {
            stakeAt.rot = start.rot + (rot - start.rot) * lift.t;
            aimAt([start.x + (ready[0] - start.x) * lift.t, start.y + (ready[1] - start.y) * lift.t], lift.t);
          },
        }, 1.1);
        await st.play(tl);
        if (ctx.signal.aborted) return;
        await ctx.drag(stakeGrip, {
          label: 'Kızgın kazığı Kyklop’un gözüne sapla',
          axis: 'x',
          distance: eye[0] - ready[0],
          onProgress: (p) => aimAt([ready[0] + (eye[0] - ready[0]) * p, ready[1] + (eye[1] - ready[1]) * p]),
        });
        if (ctx.signal.aborted) return;
        // The eye is put out.
        ctx.audio.sfx('thud');
        ctx.atlas.flash();
        ctx.atlas.shake(10);
        localShake(6);
        giantIdle?.kill();
        giant.fig.blind = true;
        flameTweens.forEach((t) => t.kill());
        const tl2 = st.timeline();
        tl2.fromTo(flashDisc, { opacity: 0.9 }, { opacity: 0, duration: 0.7, ease: 'power2.out' }, 0);
        tl2.set(tipFlame, { opacity: 0 }, 0);
        tl2.add(poseTo(giant.fig, { x: 0, y: -30, lean: -22, head: -32, armF: [150, 112], armB: [140, 124], legF: [80, 70], legB: [20, 112], footB: 60 }, { duration: 0.45, ease: 'back.out(1.6)' }), 0.05);
        tl2.to(fireScale, { v: 0.5, duration: 0.4, onUpdate: placeFire }, 0.1);
        // The men leap back; the stake falls.
        crew.forEach(([a], k) => {
          tl2.call(() => a.face(-1), [], 0.1 + k * 0.05);
          tl2.add(poseTo(a.fig, { lean: 14, head: -4, armF: [150, 30], armB: [-120, 30] }, { duration: 0.3 }), 0.1 + k * 0.05);
          tl2.add(walkTo(a, -150 + k * 32, 0.7, { stride: 44, ease: 'power2.out', arms: false }), 0.1 + k * 0.05);
        });
        const drop = { t: 0 };
        const s0 = { x: 0, y: 0, rot: 0 };
        tl2.call(() => Object.assign(s0, stakeAt), [], 0.2);
        tl2.to(drop, {
          t: 1,
          duration: 0.6,
          ease: 'bounce.out',
          onUpdate: () => {
            stakeAt.x = s0.x - 14 * drop.t;
            stakeAt.y = s0.y + (GROUND - 6 - s0.y) * drop.t;
            stakeAt.rot = s0.rot + (4 - s0.rot) * drop.t;
            placeStake();
          },
        }, 0.2);
        tl2.to(stk.hot, { opacity: 0.4, duration: 0.8 }, 0.4);
        crew.forEach(([a], k) => {
          tl2.call(() => a.face(1), [], 0.95 + k * 0.05);
          tl2.add(poseTo(a.fig, { ...POSES.stand(0, 0), lean: -4, head: -8, armF: [40, 60], armB: [20, 40] }, { duration: 0.4 }), 0.95 + k * 0.05);
        });
        await st.play(tl2);
        // He rocks in pain.
        giantIdle = st.loop(poseTo(giant.fig, { lean: -10, head: -22 }, { duration: 0.9, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
        return;
      }

      if (i === 4) {
        // Dawn: the stone is rolled away; the blind giant sits in the doorway.
        giantIdle?.kill();
        const tl = st.timeline();
        tl.to(giant.g, { opacity: 0, duration: 0.35 }, 0);
        tl.to(doorPos, { x: 330, rot: -150, duration: 1.0, ease: 'power2.in', onUpdate: placeDoor }, 0.2);
        tl.to(veil, { opacity: 0.1, duration: 1.0 }, 0.4);
        tl.to(fireScale, { v: 0, duration: 0.6, onUpdate: placeFire }, 0);
        tl.to(fireGlow, { opacity: 0, duration: 0.6 }, 0);
        tl.to([stakeGrip, cup], { opacity: 0, duration: 0.5 }, 0);
        tl.to(survivors.map((a) => a.g), { opacity: 0, duration: 0.4 }, 0);
        tl.call(() => {
          giant.x = 104;
          giant.fig.set(pose({ ...POSES.sit(0, 0), lean: 14, head: 10, armF: [58, 20], armB: [40, 40] }));
          giant.place();
          giantLabel.setAttribute('transform', 'translate(-14 -104) rotate(90)');
        }, [], 0.4);
        tl.to(giant.g, { opacity: 1, duration: 0.5 }, 0.5);
        // The rams, each with a man bound beneath.
        const rams = [new Beast('ram', { x: -250, y: GROUND, scale: 1.75 }), new Beast('ram', { x: -250, y: GROUND, scale: 1.7 })];
        const riders = [c1, c2];
        const clinging = (): Pose => pose({ x: 0, y: -20, lean: -90, head: 0, armF: [180, 0], armB: [172, 8], legF: [150, 90], legB: [140, 108] });
        const underRam = (man: Actor, r: Beast) => {
          man.x = r.x - 6 * r.scale;
          man.y = GROUND - 1;
          man.place();
        };
        rams.forEach((r, k) => {
          exitLayer.insertBefore(r.g, ramHit);
          const man = riders[k];
          man.fig.set(clinging());
          man.face(-1);
          man.k = 0.72;
          underRam(man, r);
          man.g.style.opacity = '1';
          exitLayer.insertBefore(man.g, r.g);
          later(beastTo(r, 250, 6.4, 'none', () => underRam(man, r)), 0.8 + k * 1.9);
        });
        tl.call(() => ctx.audio.sfx('bleat'), [], 1.2);
        // The blind giant feels the backs of the rams as they pass.
        const rest: Vec = [58, 58];
        let handAt: Vec = [...rest];
        const feel = () => {
          let target: Vec = rest;
          for (const r of [...rams, bigRam]) {
            const back: Vec = [r.x - 2 * r.scale, GROUND - 35 * r.scale];
            const dx = back[0] - rest[0];
            if (dx > -60 && dx < 70) {
              const w = Math.min(1, 2 * (1 - Math.abs(dx - 5) / 65));
              target = [rest[0] + (back[0] - rest[0]) * w, rest[1] + (back[1] - rest[1]) * w];
            }
          }
          handAt = [handAt[0] + (target[0] - handAt[0]) * 0.25, handAt[1] + (target[1] - handAt[1]) * 0.25];
          giant.reach('F', handAt);
        };
        tl.call(() => {
          feelLoop = st.loop(gsap.to({}, { duration: 1, repeat: -1, onUpdate: feel }));
        }, [], 0.45);
        // Odysseus waits by the great ram.
        tl.call(() => {
          odysseus.x = -120;
          odysseus.k = MAN;
          odysseus.face(1);
          odysseus.fig.set(pose({ ...POSES.plead(0, 0), lean: 30, head: -4, armF: [96, 20], armB: [70, 30] }));
          odysseus.place();
        }, [], 0.5);
        tl.add(beastTo(bigRam, -46, 1.8, 'power1.out'), 2.4);
        tl.to(odysseus.g, { opacity: 1, duration: 0.5 }, 3.0);
        await st.play(tl);
        if (ctx.signal.aborted) return;
        ramHitRect.setAttribute('transform', `translate(${bigRam.x} ${GROUND})`);
        ramHit.appendChild(ramHitRect);
        const nod = { a: 0 };
        const wait = st.loop(gsap.to(nod, { a: 1, duration: 1.2, yoyo: true, repeat: -1, ease: 'sine.inOut', onUpdate: () => bigRam.nod(-6 + 14 * nod.a) }));
        await ctx.tap(ramHit, { label: 'Koçun karnının altına saklan: koça dokun' });
        wait.kill();
        bigRam.nod(0);
        ramHitRect.remove();
        if (ctx.signal.aborted) return;
        // Odysseus slips under the belly and holds on to the fleece.
        const tl2 = st.timeline();
        tl2.to(odysseus.g, { opacity: 0, duration: 0.25 }, 0);
        tl2.call(() => {
          exitLayer.insertBefore(odysseus.g, ramHit);
          odysseus.fig.set(clinging());
          odysseus.face(-1);
          odysseus.k = 0.8;
          odysseus.x = bigRam.x - 8;
          odysseus.y = GROUND - 1;
          odysseus.place();
          odyLabel.style.opacity = '0';
        }, [], 0.25);
        tl2.to(odysseus.g, { opacity: 1, duration: 0.3 }, 0.3);
        tl2.call(() => ctx.audio.sfx('bleat'), [], 0.5);
        tl2.add(beastTo(bigRam, 250, 5.2, 'power1.in', () => {
          odysseus.x = bigRam.x - 8;
          odysseus.place();
        }), 0.6);
        await st.wait(3.6);
        return;
      }

      if (i === 5) {
        feelLoop?.kill();
        // Cut to the open sea.
        const cut = st.timeline();
        cut.to(cavePic, { opacity: 0, duration: 0.5 }, 0)
          .set(cavePic, { display: 'none' })
          .set(seaPic, { display: 'inline' })
          .fromTo(seaPic, { opacity: 0 }, { opacity: 1, duration: 0.6 });
        await st.play(cut);
        st.loop(gsap.to(waves.crests, { x: -SEA_TILE, duration: 1.6, ease: 'none', repeat: -1 }));
        st.loop(rowing(vessel.oars, gsap, 0.9));
        st.loop(gsap.to(shipPos, { rot: 1.4, y: 85.5, duration: 1.3, ease: 'sine.inOut', yoyo: true, repeat: -1, onUpdate: placeShip }));
        st.loop(gsap.to(shipPos, { x: 92, duration: 12, ease: 'none', onUpdate: placeShip }));

        const tl = st.timeline();
        // Odysseus cries out his true name from the stern.
        tl.add(poseTo(hero.fig, { armF: [168, 10], armB: [-40, 30], head: -14, lean: -6 }, { duration: 0.4 }), 0);
        tl.add(writeIn(shout, 1.0), 0.2);
        // Polyphemos wrenches up a crag and hurls it.
        tl.call(() => {
          const [hx, hy] = thrower.hand('F');
          cragPos.x = hx;
          cragPos.y = hy - 12;
          placeCrag();
        }, [], 0);
        tl.add(poseTo(thrower.fig, { lean: -18, head: -10, armF: [196, 30], armB: [190, 36], legF: [22, 4], legB: [-22, 4] }, {
          duration: 0.5,
          onUpdate: () => {
            const [hx, hy] = thrower.hand('F');
            cragPos.x = hx + 2;
            cragPos.y = hy - 12;
            placeCrag();
          },
        }), 0.7);
        tl.add(poseTo(thrower.fig, { lean: 26, head: 8, armF: [96, 10], armB: [80, 20], legF: [40, 30], legB: [-30, 4] }, { duration: 0.22, ease: 'power3.in' }), 1.3);
        const fly = { t: 0 };
        let a0: Vec = [0, 0];
        const land: Vec = [-8, 70];
        tl.call(() => {
          a0 = [cragPos.x, cragPos.y];
          ctx.audio.sfx('boulder');
        }, [], 1.45);
        tl.to(fly, {
          t: 1,
          duration: 0.85,
          ease: 'none',
          onUpdate: () => {
            const t = fly.t;
            cragPos.x = a0[0] + (land[0] - a0[0]) * t;
            cragPos.y = a0[1] + (land[1] - a0[1]) * t - Math.sin(t * Math.PI) * 60;
            cragPos.rot = 400 * t;
            placeCrag();
          },
        }, 1.45);
        tl.set(crag, { opacity: 0 }, 2.3);
        tl.call(() => {
          ctx.audio.sfx('splash');
          ctx.atlas.shake(9);
          localShake(5);
          splashG.setAttribute('transform', `translate(${land[0]} ${land[1] - 2})`);
        }, [], 2.3);
        tl.set(splashG, { opacity: 1 }, 2.3);
        tl.fromTo(splashInner, { scale: 0.3, transformOrigin: '50% 100%' }, { scale: 1, duration: 0.35, ease: 'back.out(2)' }, 2.3);
        tl.to(splashG, { opacity: 0, duration: 0.6 }, 2.9);
        tl.to(shipPos, { lurch: -5, duration: 0.25, ease: 'power2.out', onUpdate: placeShip }, 2.32);
        tl.to(shipPos, { lurch: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)', onUpdate: placeShip }, 2.6);
        // The giant prays to his father; Poseidon's trident looms.
        tl.add(poseTo(thrower.fig, { lean: -14, head: -26, armF: [168, 14], armB: [156, 20], legF: [10, 4], legB: [-10, 4] }, { duration: 0.6 }), 2.5);
        tl.call(() => {
          ctx.hud.wrath(true);
          ctx.audio.sfx('storm');
        }, [], 2.7);
        tl.fromTo(looming, { opacity: 0, y: -26 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' }, 2.7);
        tl.add(poseTo(hero.fig, { armF: [120, 30], head: -24 }, { duration: 0.5 }), 3.0);
        await st.play(tl);
        return;
      }
    },

    destroy() {
      st.destroy();
    },
  };
};

void clamp;
