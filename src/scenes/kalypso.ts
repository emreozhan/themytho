/**
 * ΙϚʹ Ogygia — Kalypso.
 * A cave in a wooded hill, vines at its mouth, black poplars and cypresses;
 * Kalypso sings at her loom while Odysseus sits weeping on a rock by the sea.
 * Holding the gate runs days and nights over the island (the years pass);
 * Hermes brings the gods' command; the reader lashes four logs into a raft;
 * at night Odysseus sails off steering by the Pleiades and the Bear.
 */
import { s, nextId } from '../lib/dom';
import { gsap } from '../lib/motion';
import { smoothPath, clamp } from '../lib/geometry';
import { POSES, pose, INK, CLAY, WHITE, PURPLE, type Pose } from '../art/figure';
import { bird } from '../art/animals';
import { exergue, sea, SEA_TILE, sun, moon, stars, cypress, vine, inscription, fillers, reeds } from '../art/kit';
import { stage } from './tools';
import type { SceneFactory } from '../story/types';
import { Actor, shimmer } from './kirke.rig';
import { makeHermes, swoop, soar, flyingPose } from './kirke.hermes';
import { hill, loom, blackPoplar, log, doubleAxe, shoreRock, flyingBird, starPath, HILL, PLEIADES, BEAR } from './kalypso.art';
import { L } from '../i18n';

const GROUND = 84;
const K = 1.24;
const fill = (k: number) => `translate(0 ${GROUND}) scale(${k}) translate(0 ${-GROUND})`;
/** Sea level (top of the wave crests), tondo space. */
const SEA_Y = GROUND - 16;
/** Sun and moon ride this arc (tondo space). */
const ARC = { x: 10, y: 70, r: 158 };
const START = 0.24;

export const scene: SceneFactory = (ctx) => {
  const st = stage(ctx);
  const root = ctx.root;

  /* ---------------- Sky (behind everything) ---------------- */
  const skyBack = s('g', { class: 'kalypso-sky-back' });
  const theSun = sun(0, 0, 14, INK);
  skyBack.appendChild(theSun);
  root.appendChild(skyBack);
  const gulls = [flyingBird(), flyingBird()];
  const gullG = s('g', { class: 'kalypso-gulls' });
  gulls.forEach((b) => gullG.appendChild(b.g));
  root.appendChild(gullG);
  root.appendChild(fillers([[40, -128], [118, -60], [-18, -112]], 4));

  /* ---------------- The island ---------------- */
  /** Trees on the hill: [x, base y, height] — shared with the sky mask. */
  const TREES: Array<[number, number, number, 'poplar' | 'cypress']> = [
    [-118, -93, 46, 'cypress'], [-88, -86, 62, 'poplar'], [-54, -60, 100, 'poplar'],
  ];
  TREES.forEach(([x, y, h, kind], k) => root.appendChild(kind === 'poplar' ? blackPoplar(x, y, h, 4 + k * 5) : cypress(x, y, h)));
  const island = hill();
  root.appendChild(island.g);
  // Vines hang over the mouth of the cave, heavy with purple grapes.
  root.appendChild(vine([[-146, 30], [-141, 2], [-128, -28], [-106, -46], [-84, -40], [-68, -16], [-60, 18]], 13));
  root.appendChild(vine([[-44, -34], [-37, -8], [-30, 16], [-25, 40]], 17));
  const perch1 = bird(-144, -96, 0.9);
  const perch2 = bird(-70, -86, 0.8);
  perch2.setAttribute('transform', 'translate(-70 -86) scale(-0.8 0.8)');
  root.append(perch1, perch2);

  // The sea on the right, the beach, the ground.
  const seaClip = s('clipPath', { id: nextId('kal-sea'), 'data-scene': '' });
  seaClip.appendChild(s('path', { d: `M30 ${SEA_Y - 30}H220V220H14Z` }));
  ctx.defs.appendChild(seaClip);
  const ocean = sea(SEA_Y, { crestHeight: 13 });
  const oceanSway = s('g');
  oceanSway.appendChild(ocean.g);
  const oceanWrap = s('g', { 'clip-path': `url(#${seaClip.id})` });
  oceanWrap.appendChild(oceanSway);
  const ground = exergue(GROUND, { band: 'none' });
  ground.appendChild(s('path', { d: `M-200 ${GROUND + 8}H40`, stroke: CLAY, 'stroke-width': 0.7, opacity: 0.6 }));
  root.append(ground, oceanWrap);
  root.appendChild(reeds(-8, GROUND, 5, 14));
  root.appendChild(reeds(16, GROUND, 4, 11));
  // Soft meadows of violets (Od. 5.72) at the foot of the hill.
  const violets = s('g', { class: 'kalypso-violets' });
  let stems = '';
  let petals = '';
  [[-34, 3], [-22, 2], [2, 3], [24, 2]].forEach(([vx, n]) => {
    for (let k = 0; k < n; k++) {
      const x = vx + k * 4.6, h = 7 + ((k * 3) % 4);
      stems += `M${x} ${GROUND}q${(k % 2 ? 1.6 : -1.6)} ${-h / 2} ${(k % 2 ? 0.6 : -0.6)} ${-h}`;
      const fx = x + (k % 2 ? 0.6 : -0.6), fy = GROUND - h;
      for (let a = 0; a < 5; a++) {
        const ang = (a / 5) * Math.PI * 2;
        petals += `M${fx.toFixed(1)} ${fy.toFixed(1)}l${(Math.cos(ang) * 1.8).toFixed(2)} ${(Math.sin(ang) * 1.8).toFixed(2)}`;
      }
    }
  });
  violets.appendChild(s('path', { d: stems, fill: 'none', stroke: INK, 'stroke-width': 0.9 }));
  violets.appendChild(s('path', { d: petals, fill: 'none', stroke: PURPLE, 'stroke-width': 1.6, 'stroke-linecap': 'round' }));
  root.appendChild(violets);

  /* ---------------- Figures (enlarged about the ground) ---------------- */
  const T = s('g', { class: 'kalypso-tableau', transform: fill(K) });
  root.appendChild(T);
  const lm = loom();
  lm.g.setAttribute('transform', `translate(-58 ${GROUND})`);
  T.appendChild(lm.g);
  const kaly = new Actor({ head: 'woman', hat: 'veil', garment: 'peplos', garmentColor: PURPLE }, pose({ ...POSES.stand(-94, GROUND), armF: [84, 24], armB: [70, 40], head: -6 }), 'kalypso');
  const shuttle = s('path', { d: 'M-4 0L4 -1.2L6 0L4 1.2Z', fill: WHITE, stroke: INK, 'stroke-width': 0.4 });
  const shuttleG = s('g');
  shuttleG.appendChild(shuttle);
  kaly.hold(shuttleG, 'F', { mode: 'grip', angle: 90, along: 3 });
  const kalyLabel = inscription('ΚΑΛΥΨΩ', -111, -6, { size: 5.6, angle: 90 });
  T.append(kaly.g, kalyLabel);

  // Odysseus on his rock at the water's edge, head bowed, weeping.
  const rock = shoreRock(30, 20);
  rock.setAttribute('transform', `translate(42 ${GROUND})`);
  T.appendChild(rock);
  const weep = (x: number): Pose => pose({ ...POSES.sit(x, GROUND - 2), lean: 24, head: 34, armF: [36, 124], armB: [30, 60], legF: [80, 94], legB: [74, 96] });
  const ody = new Actor({ hat: 'pilos', garment: 'short', garmentColor: PURPLE, cloak: true, cloakColor: INK }, weep(40), 'odysseus');
  const odyLabel = inscription('ΟΔΥΣΣΕΥΣ', 74, -30, { size: 5.4, angle: 90 });
  const tears = s('g', { class: 'kalypso-tears' });
  T.append(ody.g, odyLabel, tears);

  // Hermes (beat 2).
  const hermes = makeHermes({ x: 6, ground: GROUND, facing: -1 });
  hermes.g.style.opacity = '0';
  T.appendChild(hermes.g);

  // Logs on the beach and the raft they become.
  const RAFT_X = 86;
  /** The raft floats on the crests (tableau space). */
  const RAFT_Y = GROUND - 15;
  const RAFT_K = 1.3;
  const raft = s('g', { class: 'kalypso-raft', transform: `translate(${RAFT_X} ${RAFT_Y})` });
  const raftBob = s('g');
  const raftScale = s('g', { transform: `scale(${RAFT_K})` });
  raft.appendChild(raftBob);
  raftBob.appendChild(raftScale);
  const mast = s('g', { class: 'kalypso-raft__mast' });
  mast.appendChild(s('path', { d: 'M2 -8V-52', stroke: INK, 'stroke-width': 2.2, 'stroke-linecap': 'round' }));
  mast.appendChild(s('path', { d: 'M2 -50L-16 -10M2 -50L20 -10', stroke: INK, 'stroke-width': 0.6 }));
  const sail = s('g', { class: 'kalypso-raft__sail' });
  sail.appendChild(s('path', { d: 'M-12 -48Q2 -52 16 -48', fill: 'none', stroke: INK, 'stroke-width': 1.8, 'stroke-linecap': 'round' }));
  sail.appendChild(s('path', { d: 'M-11.4 -47.6C-9 -39 -9 -30 -11 -23Q2 -19.6 15 -23C13 -30 13 -39 15.4 -47.6Q2 -50.6 -11.4 -47.6Z', fill: WHITE, stroke: INK, 'stroke-width': 1 }));
  sail.appendChild(s('path', { d: 'M-5 -48.4Q-3.4 -36 -5 -22M2 -49Q3.6 -36 2 -21M9 -48.4Q10.6 -36 9 -22M-10 -40Q2 -37 14 -40M-10 -31Q2 -28 14 -31', fill: 'none', stroke: INK, 'stroke-width': 0.45, opacity: 0.6 }));
  const oar = s('path', { d: 'M-22 -8L-34 10M-35 8L-38 15L-36 16L-33 9.4Z', stroke: INK, 'stroke-width': 1.4, fill: INK });
  mast.style.opacity = '0';
  sail.style.opacity = '0';
  oar.style.opacity = '0';
  raftScale.append(oar, mast, sail);
  const LOG_LEN = 44;
  /** Where log k lies in the raft (raft-local, before the raft's own scale). */
  const slot = (k: number): [number, number] => [-23 + k * 1.3, 1 - k * 3.1];
  const pile: Array<[number, number]> = [[-16, GROUND - 3.4], [-12, GROUND - 10.2], [-8, GROUND - 17], [-4, GROUND - 23.8]];
  const logSlides: SVGGElement[] = [];
  const logs = pile.map(([x, y]) => {
    const l = log(LOG_LEN, 3.4);
    l.setAttribute('transform', `translate(${x} ${y})`);
    // A plain wrapper takes the slide-in, so the log keeps its own transform.
    const slide = s('g', { class: 'kalypso-log-slide', opacity: 0 });
    slide.appendChild(l);
    logSlides.push(slide);
    return l;
  });
  const lashings = s('g', { class: 'kalypso-lashings' });
  // Odysseus the shipwright (standing, with the axe) and at sea (seated, steering).
  const smith = new Actor({ hat: 'pilos', garment: 'short', garmentColor: PURPLE, cloak: false }, pose({ ...POSES.stand(44, GROUND), armF: [40, 40], armB: [-10, 20] }), 'odysseus');
  const axe = doubleAxe();
  smith.hold(axe, 'F', { mode: 'grip', angle: -86, along: 1.6 });
  smith.g.style.opacity = '0';
  const sailor = new Actor({ hat: 'pilos', garment: 'short', garmentColor: PURPLE, cloak: true, cloakColor: INK, facing: 1 }, pose({ ...POSES.sit(-8, -6), head: -18, lean: -8, armF: [40, 30], armB: [-40, 60] }), 'odysseus');
  sailor.g.style.opacity = '0';
  const sailorWrap = s('g', { transform: `translate(-20 0) scale(${(0.82).toFixed(2)})` });
  sailorWrap.appendChild(sailor.g);
  raftBob.appendChild(sailorWrap);
  T.append(raft, ...logSlides, lashings, smith.g);
  // Logs are drawn under the raft group's figures: raise the raft above them once built.

  /* ---------------- Night ---------------- */
  const veil = s('rect', { x: -200, y: -200, width: 400, height: 400, fill: '#0b0a14', opacity: 0, 'pointer-events': 'none' });
  root.appendChild(veil);
  // Moon and stars shine above the veil, but only in the sky: mask out hill, trees and sea.
  const maskId = nextId('kal-sky');
  const mask = s('mask', { id: maskId, 'data-scene': '', maskUnits: 'userSpaceOnUse', x: -200, y: -200, width: 400, height: 400 });
  mask.appendChild(s('rect', { x: -200, y: -200, width: 400, height: 400, fill: 'white' }));
  mask.appendChild(s('path', { d: smoothPath(HILL, true, 0.3), fill: 'black' }));
  mask.appendChild(s('rect', { x: -200, y: SEA_Y + 6, width: 400, height: 200, fill: 'black' }));
  mask.appendChild(s('path', { d: TREES.map(([x, y, h]) => `M${x - h * 0.16} ${y}L${x} ${y - h - 4}L${x + h * 0.16} ${y}Z`).join(''), fill: 'black' }));
  ctx.defs.appendChild(mask);
  const skyFront = s('g', { class: 'kalypso-sky-front', mask: `url(#${maskId})` });
  const theMoon = moon(0, 0, 11, WHITE);
  const starField = stars(26, { x: -150, y: -160, w: 300, h: 180 }, 44, WHITE);
  starField.style.opacity = '0';
  skyFront.append(starField, theMoon);
  // The Pleiades and the Bear, labelled as a painter would.
  const pleiades = s('g', { class: 'kalypso-pleiades', transform: 'translate(92 -92)', opacity: 0 });
  pleiades.appendChild(s('path', { d: PLEIADES.map(([x, y, r]) => starPath(x, y, r)).join(''), fill: WHITE }));
  pleiades.appendChild(inscription('ΠΛΕΙΑΔΕΣ', 6, 17, { size: 4.6, color: WHITE, align: 'middle' }));
  const bear = s('g', { class: 'kalypso-bear', transform: 'translate(-12 -132)', opacity: 0 });
  bear.appendChild(s('path', { d: BEAR.map(([x, y]) => `M${x} ${y}`).join('L').replace(/^M/, 'M').replace(/LM/g, 'L'), fill: 'none', stroke: WHITE, 'stroke-width': 0.5, 'stroke-dasharray': '1.4 2.2', opacity: 0.55 }));
  bear.appendChild(s('path', { d: BEAR.map(([x, y, r]) => starPath(x, y, r)).join(''), fill: WHITE }));
  bear.appendChild(inscription('ΑΡΚΤΟΣ', 30, 28, { size: 4.6, color: WHITE, align: 'middle' }));
  skyFront.append(pleiades, bear);
  root.appendChild(skyFront);

  /* ---------------- Time of day ---------------- */
  const setTime = (f: number) => {
    const th = f * Math.PI * 2;
    const sx = ARC.x - ARC.r * Math.cos(th), sy = ARC.y - ARC.r * Math.sin(th);
    theSun.setAttribute('transform', `translate(${sx.toFixed(1)} ${sy.toFixed(1)})`);
    const mx = ARC.x + ARC.r * Math.cos(th), my = ARC.y + ARC.r * Math.sin(th);
    theMoon.setAttribute('transform', `translate(${mx.toFixed(1)} ${my.toFixed(1)}) rotate(${(-20 + f * 40) % 360})`);
    const night = clamp(-Math.sin(th) * 1.4 + 0.2, 0, 1);
    veil.setAttribute('opacity', (night * 0.6).toFixed(3));
    starField.style.opacity = (night * 0.9).toFixed(3);
    theMoon.style.opacity = clamp(-Math.sin(th) * 3, 0, 1).toFixed(3);
  };
  setTime(START);

  /* ---------------- Idle life ---------------- */
  const tearDrop = () => {
    const [hx, hy] = ody.headPoint();
    const d = s('path', { d: 'M0 -1.6Q1.2 0.4 0 1.4Q-1.2 0.4 0 -1.6Z', fill: WHITE, transform: `translate(${(hx + 5).toFixed(1)} ${(hy + 5).toFixed(1)})` });
    tears.appendChild(d);
    const tl = st.timeline();
    tl.fromTo(d, { opacity: 0 }, { opacity: 1, duration: 0.2 }).to(d, { y: '+=22', opacity: 0, duration: 1.1, ease: 'power1.in' }).call(() => d.remove());
  };
  let weeping: gsap.core.Animation | null = null;
  let weaving: gsap.core.Animation | null = null;
  const startIdle = () => {
    st.loop(gsap.to(ocean.crests, { x: -SEA_TILE, duration: 3.4, repeat: -1, ease: 'none' }));
    weeping = st.loop(gsap.timeline({ repeat: -1 }).call(tearDrop, [], 0.6).call(tearDrop, [], 1.9).to({}, { duration: 0.7 }, 2.5));
    const sob = { v: 0 };
    st.loop(gsap.to(sob, { v: 1, duration: 1.3, yoyo: true, repeat: -1, ease: 'sine.inOut', onUpdate: () => { if (ody.g.style.opacity !== '0') ody.set({ head: 32 + sob.v * 6, lean: 23 + sob.v * 3 }); } }));
    // Kalypso at her loom: the shuttle passes to and fro.
    const shuttleRun = { v: 0 };
    weaving = st.loop(gsap.to(shuttleRun, { v: 1, duration: 1.6, yoyo: true, repeat: -1, ease: 'sine.inOut', onUpdate: () => kaly.set({ armF: [78 + shuttleRun.v * 14, 24 - shuttleRun.v * 10] }) }));
    // Sea-crows wheel over the island.
    gulls.forEach((b, k) => {
      st.loop(gsap.to(b.wings, { scaleY: -0.5, transformOrigin: '50% 60%', duration: 0.28 + k * 0.05, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
      const p = { a: k * 2.4 };
      st.loop(gsap.to(p, {
        a: `+=${Math.PI * 2}`,
        duration: 16 + k * 5,
        repeat: -1,
        ease: 'none',
        onUpdate: () => {
          const x = 40 + Math.cos(p.a) * (70 - k * 14), y = -86 + Math.sin(p.a) * (22 + k * 8);
          const dir = -Math.sin(p.a) >= 0 ? 1 : -1;
          b.g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(dir * (0.8 - k * 0.15)).toFixed(2)} ${(0.8 - k * 0.15).toFixed(2)})`);
        },
      }));
    });
    // The rays turn slowly (the disc's own transform belongs to setTime).
    st.loop(gsap.to(theSun.firstElementChild, { rotation: 22, svgOrigin: '0 0', duration: 8, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
  };

  // Entrance, built paused so the cup rises in its before-state (no flash).
  const intro = st.timeline({ paused: true });
  intro.from(kaly.g, { opacity: 0, x: -14, duration: 0.9, ease: 'power3.out' }, 0.3)
    .from(lm.g, { opacity: 0, duration: 0.8 }, 0.1)
    .from([ody.g, rock], { opacity: 0, x: '+=16', duration: 0.9, ease: 'power3.out' }, 0.5)
    .from([kalyLabel, odyLabel], { opacity: 0, duration: 0.6 }, 1.0)
    .from(theSun, { opacity: 0, duration: 1 }, 0);

  return {
    enter() {
      startIdle();
      intro.play();
      return st.play(intro);
    },

    async beat(i) {
      if (i === 0) return;

      if (i === 1) {
        // Hold: days and nights go round; the web grows; he weeps on.
        let last = -1;
        gsap.set(lm.web, { scaleY: 0.35, transformOrigin: '50% 0%' });
        await ctx.hold({
          label: L('Yılları geçir', 'Let the years pass'),
          seconds: 6,
          onProgress: (p) => {
            setTime(START + p * 7);
            gsap.set(lm.web, { scaleY: 0.35 + 0.65 * p });
            oceanSway.setAttribute('transform', `translate(${(-((p * 40) % 1) * SEA_TILE).toFixed(1)} 0)`);
            const y = Math.round(12 + p * 7);
            if (y !== last) {
              last = y;
              ctx.hud.setYear(y, 0.2);
            }
          },
        });
        // Let the last day settle.
        const tl = st.timeline();
        const t = { f: START };
        tl.to(t, { f: START, duration: 0.3, onUpdate: () => setTime(t.f) });
        return st.play(tl);
      }

      if (i === 2) {
        // Hermes brings the command of the gods; Kalypso stops weaving to listen.
        const tl = st.timeline();
        tl.call(() => weaving?.kill(), [], 1.7);
        hermes.set(flyingPose(6, GROUND));
        tl.set(hermes.g, { opacity: 1 }, 0);
        tl.add(swoop(hermes, [120, -150], { ...POSES.stand(6, GROUND), armF: [120, 20], armB: [30, 70] }, 1.7), 0);
        tl.call(() => ctx.audio.sfx('wind'), [], 0.1);
        tl.add(kaly.to({ armF: [130, 30], armB: [120, 40], head: -10 }, { duration: 0.5, ease: 'power2.out' }), 1.8);
        tl.add(kaly.to({ armF: [40, 60], armB: [20, 60], head: 18, lean: 6 }, { duration: 0.8, ease: 'sine.inOut' }), 2.5);
        tl.add(soar(hermes, [140, -170], 1.1), 2.9);
        // Odysseus leaves his rock, takes up the axe; the felled logs lie on the beach.
        tl.to([ody.g, odyLabel], { opacity: 0, duration: 0.4 }, 2.7);
        tl.set(odyLabel, { x: 28, y: -28 }, 3.1).to(odyLabel, { opacity: 1, duration: 0.5 }, 3.2);
        tl.fromTo(smith.g, { x: -14, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6 }, 2.9);
        tl.call(() => weeping?.pause(), [], 2.7);
        logSlides.forEach((sl, k) => {
          tl.fromTo(sl, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, 3.1 + k * 0.15);
        });
        tl.call(() => ctx.audio.sfx('thud'), [], 3.3);
        await st.play(tl);

        // Gate: four logs, each lashed into the raft with a tap.
        for (let k = 0; k < 4; k++) {
          const l = logs[3 - k];
          if (k > 0) ctx.say(L(`Salı kur: kütüklere dokun (${k}/4).`, `Build the raft: touch the logs (${k}/4).`));
          await ctx.tap(l, { label: L('Salı kur: kütüklere dokun', 'Build the raft: touch the logs') });
          const [x0, y0] = pile[3 - k];
          const [sx, sy] = slot(k);
          const tx = RAFT_X + sx * RAFT_K, ty = RAFT_Y + sy * RAFT_K;
          const p = { t: 0 };
          const bt = st.timeline();
          bt.add(smith.to({ armF: [170, 10], lean: -6 }, { duration: 0.25, ease: 'power2.out' }), 0);
          bt.to(p, {
            t: 1,
            duration: 0.75,
            ease: 'power2.inOut',
            onUpdate: () => {
              const u = p.t;
              const x = x0 + (tx - x0) * u;
              const y = y0 + (ty - y0) * u - Math.sin(u * Math.PI) * 26;
              const k2 = 1 + (RAFT_K - 1) * u;
              l.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${(Math.sin(u * Math.PI) * -8).toFixed(1)}) scale(${k2.toFixed(3)})`);
            },
          }, 0.05);
          bt.add(smith.to({ armF: [70, 10], lean: 12 }, { duration: 0.2, ease: 'power3.in' }), 0.62);
          bt.call(() => {
            ctx.audio.sfx('thud');
            // Lash it: two rope bindings.
            for (const bx of [8 * RAFT_K, 34 * RAFT_K]) {
              const b = s('path', { d: `M${(tx + bx).toFixed(1)} ${(ty - 4.4).toFixed(1)}l1.6 8.8M${(tx + bx + 2.4).toFixed(1)} ${(ty - 4.4).toFixed(1)}l1.6 8.8`, stroke: WHITE, 'stroke-width': 0.9, opacity: 0 });
              lashings.appendChild(b);
              st.to(b, { opacity: 1, duration: 0.3 });
            }
          }, [], 0.8);
          bt.add(shimmer(T, tx + 22, ty - 2, 16, 4, { n: 5, duration: 0.5, size: 2, rise: 4, seed: 30 + k }), 0.8);
          bt.add(smith.to({ armF: [40, 40], lean: 0 }, { duration: 0.35 }), 0.9);
          await st.play(bt);
        }
        // Mast and sail go up.
        T.appendChild(raft);
        T.appendChild(lashings);
        const up = st.timeline();
        up.set(mast, { opacity: 1 }).fromTo(mast, { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.6, ease: 'back.out(1.6)' });
        up.set(sail, { opacity: 1 }, 0.5).fromTo(sail, { scaleY: 0.05, transformOrigin: '50% 0%' }, { scaleY: 1, duration: 0.6, ease: 'power2.out' }, 0.5);
        up.to(oar, { opacity: 1, duration: 0.4 }, 0.7);
        up.call(() => ctx.audio.sfx('success'), [], 0.6);
        await st.play(up);
        return;
      }

      if (i === 3) {
        // Night: Odysseus sails away, steering by the stars; Kalypso waves from the shore.
        const tl = st.timeline();
        const t = { f: START };
        tl.to(t, { f: 0.72, duration: 1.4, ease: 'power1.inOut', onUpdate: () => setTime(t.f) }, 0);
        // He boards the raft: logs and lashings travel with it from now on.
        logs.forEach((l, k) => {
          raftScale.insertBefore(l, oar);
          const [sx, sy] = slot(3 - k);
          l.setAttribute('transform', `translate(${sx} ${sy})`);
        });
        raftBob.appendChild(lashings);
        lashings.setAttribute('transform', `translate(${-RAFT_X} ${-RAFT_Y})`);
        raftBob.appendChild(sailorWrap);
        tl.to(smith.g, { opacity: 0, duration: 0.4 }, 0.2).to(sailor.g, { opacity: 1, duration: 0.5 }, 0.3);
        tl.to([pleiades, bear], { opacity: 1, duration: 0.9, stagger: 0.3 }, 1.0);
        tl.to(raft, { x: '+=14', duration: 2.0, ease: 'power1.inOut' }, 0.6);
        tl.to(odyLabel, { opacity: 0, duration: 0.4 }, 0.2);
        tl.add(sailor.to({ head: -34, lean: -12, armF: [150, 20] }, { duration: 0.8 }), 1.4);
        // Kalypso comes out to the shore and waves.
        const walk = st.loop(kaly.walk(0.7, 9));
        tl.fromTo(kaly.g, { x: 0 }, { x: 78, duration: 1.4, ease: 'power1.inOut' }, 0.2);
        tl.to(kalyLabel, { x: '+=78', duration: 1.4, ease: 'power1.inOut' }, 0.2);
        tl.call(() => walk.kill(), [], 1.6);
        tl.add(kaly.to({ ...POSES.stand(-94, GROUND), armF: [160, 20], armB: [10, 20], head: 0 }, { duration: 0.4 }), 1.6);
        await st.play(tl);
        st.loop(gsap.to({ v: 0 }, { v: 1, duration: 0.5, yoyo: true, repeat: -1, ease: 'sine.inOut', onUpdate: function () { const v = (this.targets()[0] as { v: number }).v; kaly.set({ armF: [150 + v * 20, 10 + v * 30] }); } }));
        st.loop(gsap.to(raftBob, { y: -1.6, rotation: 1.5, transformOrigin: '50% 100%', duration: 1.1, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
        st.loop(gsap.to(raft, { x: '+=6', duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
        return;
      }
    },

    destroy() {
      st.destroy();
    },
  };
};
