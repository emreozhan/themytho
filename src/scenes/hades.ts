/**
 * ΙΒʹ Nekyia — the land of the dead.
 * The cup is inverted: a black-glaze field, the living painted in reserved
 * clay as on red-figure vases, the dead in pale added white.
 * Odysseus pours libations into the pit; the shades swarm up; blind
 * Teiresias prophesies (the cattle of the Sun); three times Odysseus reaches
 * for his mother's shade and three times she slips away; Achilles broods;
 * the dead come by the thousand and Odysseus runs for his ship.
 */
import { s, nextId } from '../lib/dom';
import { gsap } from '../lib/motion';
import { POSES, pose, INK, CLAY, WHITE, PURPLE, type FigureStyle, type Pose } from '../art/figure';
import { Beast } from '../art/animals';
import { exergue, inscription, sea, SEA_TILE, sun } from '../art/kit';
import { ship, RED_FIGURE } from '../art/ship';
import { stage } from './tools';
import type { SceneFactory } from '../story/types';
import { Actor, shimmer } from './kirke.rig';
import { sword } from './kirke.art';
import { eidolon, bothros, oinochoe, fallenRam, asphodel, poplar, paleShield, wisp } from './hades.art';

const GROUND = 86;
const K = 1.26;
const fill = (k: number) => `translate(0 ${GROUND}) scale(${k}) translate(0 ${-GROUND})`;
const PIT_X = 16;

/** The living, painted in reserved clay with black relief lines. */
const LIVING: FigureStyle = { skin: CLAY, ground: INK, hair: PURPLE, garmentColor: CLAY, cloakColor: PURPLE };
/** The dead: pale added white, lines in black. */
const SHADE: FigureStyle = { skin: WHITE, ground: INK, hair: WHITE, garmentColor: WHITE, cloakColor: WHITE };

interface Ghost {
  holder: SVGGElement;
  wings: SVGGElement;
  x: number;
  y: number;
  k: number;
  dir: number;
}

export const scene: SceneFactory = (ctx) => {
  const st = stage(ctx);
  const root = ctx.root;

  // The inverted cup: a black-glaze field.
  root.appendChild(s('circle', { r: 172, fill: INK }));
  const mist = s('g', { class: 'hades-mist' });
  [[-40, -120, 160], [60, -86, 180], [-70, -40, 150], [80, -10, 120], [-20, 30, 200]].forEach(([x, y, w]) => mist.appendChild(wisp(x, y, w)));
  root.appendChild(mist);

  const T = s('g', { class: 'hades-tableau', transform: fill(K) });
  root.appendChild(T);

  // Okeanos on the left, with the black ship drawn up stern-first.
  const seaClip = s('clipPath', { id: nextId('hades-sea'), 'data-scene': '' });
  seaClip.appendChild(s('path', { d: `M-300 -300H-70L-78 ${GROUND + 2}L-60 ${GROUND + 40}H-300Z` }));
  ctx.defs.appendChild(seaClip);
  const ocean = sea(GROUND - 13, { crest: CLAY, crestHeight: 14 });
  const oceanWrap = s('g', { 'clip-path': `url(#${seaClip.id})` });
  oceanWrap.appendChild(ocean.g);
  const boat = ship({ palette: RED_FIGURE, sail: 'furled', oars: 9 });
  boat.g.setAttribute('transform', `translate(-128 ${GROUND - 6}) scale(-1.06 1.06)`);
  T.append(boat.g, oceanWrap);

  // The shore: a reserved groundline and tongue band.
  const ground = exergue(GROUND, { band: 'tongues' });
  ground.appendChild(s('path', { d: `M-78 ${GROUND + 3}L-68 ${GROUND}H220`, stroke: CLAY, 'stroke-width': 1.5, fill: 'none' }));
  T.appendChild(ground);
  // Persephone's grove and the asphodel meadow on the far side.
  T.appendChild(poplar(106, GROUND, 150));
  T.appendChild(poplar(90, GROUND, 118));
  [[56, 26, 1], [70, 34, 2], [84, 22, 3], [-44, 20, 2]].forEach(([x, h, sd]) => T.appendChild(asphodel(x, GROUND, h, sd)));

  // The pit, the libation, the sacrifice.
  const pit = bothros();
  pit.g.setAttribute('transform', `translate(${PIT_X} ${GROUND})`);
  const pitGlow = s('ellipse', { cx: PIT_X, cy: GROUND - 6, rx: 30, ry: 14, fill: WHITE, opacity: 0 });
  const ram = fallenRam();
  ram.setAttribute('transform', `translate(-58 ${GROUND}) scale(0.92)`);
  T.append(pitGlow, ram, pit.g);

  // Odysseus, kneeling at the pit and pouring from the jug.
  const kneel = (x: number): Pose => pose({ ...POSES.plead(x, GROUND), lean: 6, head: 6, armF: [58, 30], armB: [30, 40], legF: [84, 100], legB: [-4, 118] });
  const ody = new Actor({ ...LIVING, hat: 'pilos', garment: 'short', cloak: true, facing: 1 }, kneel(-16), 'odysseus');
  ody.paint({ hat: CLAY });
  const jug = oinochoe();
  const jugHold = s('g');
  const jugInner = s('g', { transform: 'rotate(38) translate(-3 6)' });
  jugInner.appendChild(jug.g);
  jugHold.appendChild(jugInner);
  ody.hold(jugHold, 'F', { mode: 'upright', along: 1 });
  const blade = sword(CLAY, INK);
  blade.style.opacity = '0';
  ody.hold(blade, 'F', { mode: 'grip', angle: -6, along: 1.2 });
  const odyLabel = inscription('ΟΔΥΣΣΕΥΣ', -42, -8, { size: 6.4, angle: 90, color: CLAY });
  const stream = s('path', { d: '', fill: 'none', stroke: WHITE, 'stroke-width': 1.3, 'stroke-linecap': 'round', 'stroke-dasharray': '3 2.2', opacity: 0.9 });
  T.append(ody.g, stream, odyLabel);
  // His mirrored twin, for running back to the ship.
  const odyRun = new Actor({ ...LIVING, hat: 'pilos', garment: 'short', cloak: true, facing: -1 }, pose({ ...POSES.stand(-16, GROUND) }), 'odysseus');
  odyRun.paint({ hat: CLAY });
  odyRun.g.style.opacity = '0';
  T.appendChild(odyRun.g);

  /* ---------------- The shades ---------------- */
  const glowId = nextId('hades-glow');
  const grad = s('radialGradient', { id: glowId, 'data-scene': '' });
  grad.append(s('stop', { offset: '0%', 'stop-color': WHITE, 'stop-opacity': 0.26 }), s('stop', { offset: '100%', 'stop-color': WHITE, 'stop-opacity': 0 }));
  ctx.defs.appendChild(grad);
  const aura = (cx: number, cy: number, rx: number, ry: number) => s('ellipse', { cx, cy, rx, ry, fill: `url(#${glowId})`, 'pointer-events': 'none' });

  const makeShade = (style: FigureStyle, p: Pose, cls: string) => {
    const a = new Actor({ ...SHADE, ...style }, p, cls);
    a.g.style.opacity = '0';
    return a;
  };
  // Teiresias, the blind seer, with his staff.
  const teir = makeShade({ head: 'old', garment: 'long', cloak: true, facing: -1 }, pose({ ...POSES.stand(50, GROUND), armF: [40, 50], armB: [-6, 20] }), 'teiresias');
  teir.paint({ eye: WHITE });
  const lid = s('g');
  lid.appendChild(s('path', { d: 'M2.4 -2.6Q4.3 -1.4 6.1 -2.5', fill: 'none', stroke: INK, 'stroke-width': 0.7, 'stroke-linecap': 'round' }));
  teir.onHead(lid);
  const staff = s('line', { x1: 0, y1: 36, x2: 0, y2: -44, stroke: WHITE, 'stroke-width': 1.5, 'stroke-linecap': 'round' });
  const staffG = s('g');
  staffG.appendChild(staff);
  teir.hold(staffG, 'F', { mode: 'upright', angle: -4, along: 1.8 });
  const teirAura = aura(50, GROUND - 50, 34, 62);
  teirAura.style.opacity = '0';
  const teirLabel = inscription('ΤΕΙΡΕΣΙΑΣ', 70, -16, { size: 6, angle: 90, color: WHITE });
  teirLabel.style.opacity = '0';

  // Antikleia, his mother, veiled.
  const anti = makeShade({ head: 'woman', hat: 'veil', garment: 'peplos', hair: PURPLE, facing: -1 }, pose({ ...POSES.stand(42, GROUND), head: 10, armF: [30, 60], armB: [10, 40] }), 'antikleia');
  anti.paint({ hat: WHITE });
  const antiAura = aura(42, GROUND - 50, 30, 60);
  antiAura.style.opacity = '0';
  const antiLabel = inscription('ΑΝΤΙΚΛΕΙΑ', 26, -30, { size: 5.6, angle: 90, color: WHITE });
  antiLabel.style.opacity = '0';
  const antiWrap = s('g', { class: 'antikleia-wrap' });
  antiWrap.append(antiAura, anti.g, antiLabel);

  // Achilles's gloomy shade: helmet, spear, shield.
  const achi = makeShade({ head: 'bearded', hat: 'helmet', garment: 'short', cloak: true, facing: -1 }, pose({ ...POSES.stand(58, GROUND), head: 14, lean: 3, armF: [36, 40], armB: [30, 60] }), 'achilles');
  achi.paint({ hat: WHITE, hatDetail: INK });
  achi.part('hatDetail').setAttribute('stroke', INK);
  const spearG = s('g');
  spearG.appendChild(s('line', { x1: 0, y1: 44, x2: 0, y2: -64, stroke: WHITE, 'stroke-width': 1.3, 'stroke-linecap': 'round' }));
  spearG.appendChild(s('path', { d: 'M0 -74L2.2 -64L0 -61L-2.2 -64Z', fill: WHITE }));
  achi.hold(spearG, 'F', { mode: 'upright', angle: 6, along: 1.6 });
  const shieldG = s('g');
  const sh = paleShield(15);
  sh.setAttribute('transform', 'translate(-4 4)');
  shieldG.appendChild(sh);
  achi.hold(shieldG, 'B', { mode: 'upright', angle: 0, along: 0 });
  const achiAura = aura(58, GROUND - 50, 34, 64);
  achiAura.style.opacity = '0';
  const achiLabel = inscription('ΑΧΙΛΛΕΥΣ', 80, -30, { size: 6, angle: 90, color: WHITE });
  achiLabel.style.opacity = '0';
  T.append(teirAura, teir.g, teirLabel, antiWrap, achiAura, achi.g, achiLabel);

  // The vision: the Sun and his cattle.
  const vision = s('g', { class: 'hades-vision', opacity: 0 });
  const visionAura = s('ellipse', { cx: 0, cy: -70, rx: 120, ry: 50, fill: `url(#${glowId})` });
  const helios = sun(-10, -96, 13, WHITE);
  const herd: Beast[] = [0, 1, 2].map((k) => new Beast('ox', { x: 70 + k * 40, y: -40, scale: 0.52, facing: -1, color: WHITE, ground: INK }));
  vision.append(visionAura, helios, ...herd.map((b) => b.g));
  T.appendChild(vision);

  // Swirling dead.
  const ghostLayer = s('g', { class: 'hades-ghosts' });
  T.appendChild(ghostLayer);
  const ghosts: Ghost[] = [];
  const makeGhost = (k: number, op: number): Ghost => {
    const e = eidolon();
    const holder = s('g', { opacity: op });
    holder.appendChild(e.g);
    ghostLayer.appendChild(holder);
    const gh = { holder, wings: e.wings, x: PIT_X, y: GROUND, k, dir: 1 };
    placeGhost(gh);
    return gh;
  };
  const placeGhost = (g: Ghost) => g.holder.setAttribute('transform', `translate(${g.x.toFixed(1)} ${g.y.toFixed(1)}) scale(${(g.k * g.dir).toFixed(3)} ${g.k.toFixed(3)})`);
  const flap = (g: Ghost, speed = 0.22) =>
    st.loop(gsap.to(g.wings, { scaleY: 0.35, transformOrigin: '0px -4px', duration: speed, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
  /** Rise out of the pit on a widening helix, then settle at (tx, ty) and hover. */
  const rise = (g: Ghost, tl: gsap.core.Timeline, at: number, tx: number, ty: number, turns = 1.2) => {
    const p = { t: 0 };
    const a0 = Math.random() * Math.PI * 2;
    let lx = g.x;
    tl.to(p, {
      t: 1,
      duration: 2,
      ease: 'power1.inOut',
      onStart: () => {
        g.holder.style.display = '';
        flap(g);
      },
      onUpdate: () => {
        const t = p.t;
        const ang = a0 + t * turns * Math.PI * 2;
        const r = 6 + 34 * Math.sin(t * Math.PI) ;
        const bx = PIT_X + (tx - PIT_X) * t * t, by = GROUND - 4 + (ty - GROUND + 4) * (1 - (1 - t) * (1 - t));
        g.x = bx + Math.cos(ang) * r;
        g.y = by + Math.sin(ang) * r * 0.35;
        if (Math.abs(g.x - lx) > 0.05) g.dir = g.x > lx ? 1 : -1;
        lx = g.x;
        placeGhost(g);
      },
    }, at);
    tl.fromTo(g.holder, { opacity: 0 }, { opacity: 0.55 + Math.random() * 0.35, duration: 0.5 }, at);
  };
  const hover = (g: Ghost) => {
    const base = { x: g.x, y: g.y };
    const p = { t: Math.random() };
    st.loop(gsap.to(p, {
      t: '+=1',
      duration: 3 + Math.random() * 2,
      ease: 'none',
      repeat: -1,
      onUpdate: () => {
        const a = p.t * Math.PI * 2;
        const nx = base.x + Math.sin(a) * 6;
        g.dir = Math.cos(a) >= 0 ? 1 : -1;
        g.x = nx;
        g.y = base.y + Math.sin(a * 2) * 3;
        placeGhost(g);
      },
    }));
  };
  const HOVER: Array<[number, number, number]> = [
    [-30, -40, 0.9], [2, -70, 1], [40, -86, 0.8], [74, -60, 0.9], [96, -20, 0.8], [-58, -84, 0.75],
    [30, -30, 0.7], [-8, -10, 0.8], [64, -110, 0.7], [-40, -112, 0.7], [104, -84, 0.7], [16, -112, 0.8],
  ];

  /** Mist-dissolve: pale motes fly off a figure while it fades. */
  const dissolve = (tl: gsap.core.Timeline, at: number, cx: number, cy: number, w: number, h: number, els: Element[], dur = 0.9) => {
    tl.add(shimmer(T, cx, cy, w, h, { n: 16, duration: dur + 0.4, size: 2.4, rise: 18, seed: Math.round(cx * 13 + cy) }), at);
    tl.to(els, { opacity: 0, duration: dur, ease: 'power1.in' }, at);
  };
  const condense = (tl: gsap.core.Timeline, at: number, cx: number, cy: number, w: number, h: number, els: Element[], op = 0.86, dur = 1) => {
    tl.add(shimmer(T, cx, cy, w, h, { n: 12, duration: dur, size: 2.2, rise: -10, seed: Math.round(cx * 7 + cy) }), at);
    tl.to(els, { opacity: op, duration: dur, ease: 'power1.out' }, at + 0.15);
  };

  // Idle life.
  const libation = st.loop(gsap.to(stream, { attr: { 'stroke-dashoffset': -10.4 }, duration: 0.6, repeat: -1, ease: 'none' }));
  const placeStream = () => {
    const h = ody.handFrame('F', 1);
    // The jug is tipped towards the pit; its spout sits ahead of the hand.
    const sx = h.x + 12, sy = h.y - 2;
    const ex = PIT_X - 2, ey = GROUND + 2;
    stream.setAttribute('d', `M${sx.toFixed(1)} ${sy.toFixed(1)}Q${(sx + 4).toFixed(1)} ${((sy + ey) / 2).toFixed(1)} ${ex} ${ey}`);
  };
  placeStream();
  ody.onUpdate(placeStream);

  return {
    enter() {
      st.loop(gsap.to(mist.children, { x: 18, duration: 7, yoyo: true, repeat: -1, ease: 'sine.inOut', stagger: 1.3 }));
      st.loop(gsap.to(ocean.crests, { x: -SEA_TILE, duration: 3.6, repeat: -1, ease: 'none' }));
      st.loop(gsap.to(pit.pool, { opacity: 0.25, duration: 1.4, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
      st.loop(gsap.to(boat.g, { y: '+=1.2', duration: 2.2, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
      const tl = st.timeline();
      tl.from(mist.children, { opacity: 0, duration: 1.2, stagger: 0.1 }, 0)
        .from([boat.g, oceanWrap], { opacity: 0, x: -20, duration: 1, ease: 'power2.out' }, 0.1)
        .from(pit.mound, { scaleY: 0, transformOrigin: '50% 100%', duration: 0.6, ease: 'back.out(2)' }, 0.3)
        .from(ram, { opacity: 0, duration: 0.8 }, 0.4)
        .from(ody.g, { opacity: 0, x: -24, duration: 0.9, ease: 'power3.out' }, 0.3)
        .from([stream, odyLabel], { opacity: 0, duration: 0.6 }, 1.0);
      return st.play(tl);
    },

    async beat(i) {
      if (i === 0) return;

      if (i === 1) {
        await ctx.tap(pit.g, { label: 'Teiresias’ın gölgesini çağır: çukura dokun' });
        ctx.audio.sfx('ghost');
        const tl = st.timeline();
        // The libation stops; he rises and draws his sword against the swarm.
        tl.to(stream, { opacity: 0, duration: 0.3 }, 0).call(() => libation.pause(), [], 0.3);
        tl.to(jugHold, { opacity: 0, duration: 0.3 }, 0.2).set(blade, { opacity: 1 }, 0.5);
        tl.add(ody.to({ ...POSES.lunge(-22, GROUND), lean: 4, armF: [86, 6], armB: [-30, 40] }, { duration: 0.6, ease: 'power3.out' }), 0.4);
        tl.to(pitGlow, { opacity: 0.18, duration: 0.6 }, 0);
        tl.to(pitGlow, { opacity: 0.08, duration: 1.2, yoyo: true, repeat: 1 }, 0.6);
        HOVER.forEach(([x, y, k], n) => {
          const g = makeGhost(k * 0.9, 0);
          g.holder.style.display = 'none';
          ghosts.push(g);
          rise(g, tl, 0.1 + n * 0.1, x, y, 1 + (n % 3) * 0.35);
        });
        tl.call(() => ghosts.forEach(hover), [], 2.1 + HOVER.length * 0.1);
        // Teiresias steps out of the gloom.
        tl.set(teir.g, { opacity: 0 }, 0);
        tl.fromTo(teir.g, { x: 22 }, { x: 0, duration: 1.4, ease: 'power2.out' }, 1.3);
        tl.to(teir.g, { opacity: 0.9, duration: 1.2 }, 1.3).to(teirAura, { opacity: 1, duration: 1.2 }, 1.3).to(teirLabel, { opacity: 0.9, duration: 0.8 }, 2.2);
        tl.call(() => ctx.audio.sfx('whirl'), [], 1.2);
        return st.play(tl);
      }

      if (i === 2) {
        // The prophecy: the Sun and his cattle appear, and fade.
        const tl = st.timeline();
        tl.add(teir.to({ armB: [150, 30], head: -6 }, { duration: 0.6 }), 0);
        tl.to(vision, { opacity: 1, duration: 0.7 }, 0.2);
        tl.fromTo(helios, { scale: 0.5, transformOrigin: '50% 50%', opacity: 0 }, { scale: 1, opacity: 0.85, duration: 0.8, ease: 'power2.out' }, 0.2);
        const walkers = herd.map((b) => st.loop(b.walk(0.9)));
        const drift = { x: 0 };
        tl.to(drift, { x: -60, duration: 2.3, ease: 'none', onUpdate: () => herd.forEach((b, k) => b.moveTo(70 + k * 40 + drift.x)) }, 0.2);
        tl.to(vision, { opacity: 0, duration: 0.7 }, 1.9);
        tl.add(teir.to({ armB: [-6, 20], head: 0 }, { duration: 0.6 }), 1.9);
        tl.call(() => walkers.forEach((w) => w.pause()), [], 2.6);
        return st.play(tl);
      }

      if (i === 3) {
        // Teiresias withdraws; the mother's shade gathers.
        const pre = st.timeline();
        dissolve(pre, 0, 50, GROUND - 50, 16, 40, [teir.g, teirAura, teirLabel], 0.9);
        pre.to(blade, { opacity: 0, duration: 0.3 }, 0.2);
        pre.add(ody.to({ ...POSES.stand(-16, GROUND), armF: [20, 30], armB: [-6, 20], head: 4 }, { duration: 0.7 }), 0.3);
        condense(pre, 0.8, 42, GROUND - 50, 14, 40, [anti.g], 0.86, 1.1);
        pre.to([antiAura, antiLabel], { opacity: 1, duration: 1 }, 1.0);
        await st.play(pre);

        const spots: Array<[number, number]> = [[42, 0], [66, -6], [88, -16]];
        const prompts = ['Annene sarıl.', 'Bir kez daha sarıl.', 'Son bir kez sarıl.'];
        for (let k = 0; k < 3; k++) {
          if (k > 0) ctx.say(prompts[k]);
          await ctx.tap(antiWrap, { label: prompts[k] });
          const [sx, sy] = spots[k];
          const tl = st.timeline();
          // He runs to embrace her…
          tl.add(ody.to({ ...POSES.walk(sx - 30, GROUND), lean: 10, armF: [92, 22], armB: [84, 30], head: -4 }, { duration: 0.6, ease: 'power2.out' }), 0);
          // …and she slips through his arms like a shadow or a dream.
          dissolve(tl, 0.35, sx, GROUND - 48 + sy, 14, 38, [anti.g, antiAura, antiLabel], 0.8);
          ctx.audio.sfx('ghost');
          if (k < 2) {
            const [nx, ny] = spots[k + 1];
            tl.call(() => {
              anti.set({ x: nx, y: POSES.stand(nx, GROUND).y + ny });
              antiAura.setAttribute('cx', String(nx));
              antiAura.setAttribute('cy', String(GROUND - 50 + ny));
              gsap.set(antiLabel, { x: nx - 16, y: -30 + ny });
            }, [], 1.2);
            condense(tl, 1.3, nx, GROUND - 48 + ny, 14, 38, [anti.g], 0.8 - k * 0.12, 1.1);
            tl.to([antiAura, antiLabel], { opacity: 0.9 - k * 0.15, duration: 1 }, 1.5);
            tl.add(ody.to({ ...POSES.stand(sx - 30, GROUND), armF: [30, 40], armB: [20, 40], head: 8 }, { duration: 0.9, ease: 'sine.inOut' }), 1.0);
          } else {
            tl.add(ody.to({ ...POSES.lament(sx - 30, GROUND) }, { duration: 1.2, ease: 'sine.inOut' }), 1.1);
          }
          await st.play(tl);
        }
        return;
      }

      if (i === 4) {
        // Achilles's shade; then the dead come by the thousand and he flees to the ship.
        const tl = st.timeline();
        condense(tl, 0, 58, GROUND - 50, 16, 42, [achi.g], 0.9, 0.9);
        tl.to([achiAura, achiLabel], { opacity: 1, duration: 0.8 }, 0.2);
        tl.add(ody.to({ ...POSES.stand(ody.pose.x, GROUND), armF: [60, 40], armB: [10, 20], head: -2 }, { duration: 0.6 }), 0);
        tl.call(() => ctx.audio.sfx('ghost'), [], 1.1);
        tl.call(() => ctx.audio.sfx('whirl'), [], 1.2);
        tl.to(pitGlow, { opacity: 0.3, duration: 0.6 }, 1.1);
        // The swarm.
        for (let n = 0; n < 34; n++) {
          const g = makeGhost(0.45 + Math.random() * 0.5, 0);
          g.holder.style.display = 'none';
          const fromRight = n % 3 === 0;
          const p = { t: 0 };
          const y0 = fromRight ? -100 + Math.random() * 170 : GROUND - 4;
          const x0 = fromRight ? 150 : PIT_X;
          const y1 = -130 + Math.random() * 190;
          const amp = 8 + Math.random() * 16;
          const at = 1.1 + n * 0.045;
          tl.to(p, {
            t: 1,
            duration: 1.6 + Math.random() * 0.8,
            ease: 'power1.in',
            onStart: () => {
              g.holder.style.display = '';
              flap(g, 0.16);
            },
            onUpdate: () => {
              const t = p.t;
              g.x = x0 + (-170 - x0) * t;
              g.y = y0 + (y1 - y0) * t + Math.sin(t * 9 + n) * amp;
              g.dir = -1;
              placeGhost(g);
            },
          }, at);
          tl.fromTo(g.holder, { opacity: 0 }, { opacity: 0.35 + Math.random() * 0.5, duration: 0.3 }, at);
        }
        // The first shades join the rush.
        tl.call(() => {
          ghosts.forEach((g, n) => {
            const p = { x: g.x };
            st.to(p, { x: -190, duration: 1.6 + n * 0.05, ease: 'power2.in', onUpdate: () => { g.x = p.x; g.dir = -1; placeGhost(g); } });
          });
        }, [], 1.3);
        tl.to([achi.g, achiAura, achiLabel], { opacity: 0.25, duration: 0.8 }, 1.8);
        // Odysseus turns and runs for the ship.
        tl.call(() => {
          odyRun.set({ ...POSES.run(ody.pose.x, GROUND) });
        }, [], 1.3);
        tl.set(ody.g, { opacity: 0 }, 1.35).set(odyRun.g, { opacity: 1 }, 1.35);
        const legs = { ph: 0 };
        tl.to(legs, {
          ph: 3,
          duration: 1.6,
          ease: 'none',
          onUpdate: () => {
            const sw = Math.sin(legs.ph * Math.PI * 2);
            odyRun.set({ legF: [30 + sw * 40, 60 + Math.max(0, -sw) * 40], legB: [-10 - sw * 40, 40 + Math.max(0, sw) * 40], armF: [60 - sw * 40, 50], armB: [-50 + sw * 40, 40] });
          },
        }, 1.35);
        tl.to(odyRun.g, { x: -62, duration: 1.6, ease: 'power1.in' }, 1.35);
        tl.to(odyLabel, { opacity: 0, duration: 0.4 }, 1.4);
        tl.to(odyRun.g, { opacity: 0, duration: 0.5 }, 2.6);
        return st.play(tl);
      }
    },

    destroy() {
      st.destroy();
    },
  };
};
