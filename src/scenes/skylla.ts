/**
 * ΙΔʹ Skylla ile Kharybdis — the strait.
 *
 * On the left, Skylla's cliff rises out of the tondo; six long necks writhe out
 * of her cave, each with a snarling dog's head. Below, in the black water,
 * Kharybdis turns: rings of running waves around a black gullet, with the fig
 * tree on its rock above. Beat 2: the reader drags the galley through the gap
 * while the whirlpool tugs at it (the ship lags and dips as it passes over).
 * Beat 3: as every eye watches the whirlpool, the six heads dart down and carry
 * off six rowers into the cave; the ship rows on.
 */
import { s } from '../lib/dom';
import { gsap } from '../lib/motion';
import { lerp, type Vec } from '../lib/geometry';
import { Figure, POSES, pose, spear, INK, CLAY } from '../art/figure';
import { sea, rock, inscription, fillers } from '../art/kit';
import { Galley, type Rower } from './sirenler.galley';
import { Neck, whirlpool, figTree } from './skylla.art';
import { stage } from './tools';
import type { SceneFactory } from '../story/types';
import { L } from '../i18n';
const SEA_Y = 58; // crest top
const W = 66; // galley waterline
const K = 1.75;
const X_ENTER = -280;
const X_START = -96;
const X_END = 36;
const X_OUT = 72;
const WHIRL: Vec = [-14, 122];
const WHIRL_R = 56;
const CAVE: Vec = [-90, -100];
/** Six necks: root in the cave, then the idle pose (last point = head). */
const NECKS: Vec[][] = [
  [[-96, -96], [-80, -80], [-66, -66], [-56, -52], [-50, -36]],
  [[-94, -92], [-74, -80], [-50, -70], [-30, -58], [-18, -44]],
  [[-92, -98], [-70, -96], [-46, -92], [-22, -84], [-2, -72]],
  [[-90, -102], [-66, -110], [-40, -112], [-16, -108], [6, -98]],
  [[-92, -106], [-72, -122], [-48, -130], [-24, -130], [-6, -122]],
  [[-94, -104], [-80, -118], [-66, -136], [-46, -148], [-24, -150]],
];
export const scene: SceneFactory = (ctx) => {
  const st = stage(ctx);
  const root = ctx.root;
  /* ---------------- Sky and the fig-tree rock (behind everything) ---------------- */
  root.appendChild(fillers([[62, -118], [84, -92], [40, -60], [66, -30]], 3.6));
  const figG = s('g', { class: 'sky-fig', opacity: 0 });
  const figRock = rock([[190, 80], [190, 14], [168, 18], [150, 22], [138, 30], [130, 44], [126, 60], [124, 80]], { lines: 3, seed: 41 });
  figG.appendChild(figRock);
  figG.appendChild(figTree([150, 22], [108, -34], 7));
  root.appendChild(figG);
  /* ---------------- Skylla's cliff and cave ---------------- */
  const cliffG = s('g', { class: 'sky-cliff' });
  cliffG.appendChild(
    rock(
      [[-200, -200], [-40, -200], [-44, -168], [-56, -150], [-50, -134], [-64, -118], [-62, -102], [-74, -88], [-70, -72], [-84, -58], [-82, -40], [-96, -24], [-92, -6], [-104, 10], [-108, 28], [-118, 46], [-122, 70], [-200, 70]],
      { lines: 8, seed: 5 },
    ),
  );
  const hollow = s('path', {
    d: `M${CAVE[0] - 18} ${CAVE[1] + 20}C${CAVE[0] - 20} ${CAVE[1] - 4} ${CAVE[0] - 10} ${CAVE[1] - 20} ${CAVE[0] + 2} ${CAVE[1] - 20}C${CAVE[0] + 14} ${CAVE[1] - 20} ${CAVE[0] + 20} ${CAVE[1] - 6} ${CAVE[0] + 18} ${CAVE[1] + 16}C${CAVE[0] + 8} ${CAVE[1] + 22} ${CAVE[0] - 8} ${CAVE[1] + 24} ${CAVE[0] - 18} ${CAVE[1] + 20}Z`,
    fill: '#8f4020',
    stroke: CLAY,
    'stroke-width': 0.8,
  });
  cliffG.appendChild(hollow);
  root.appendChild(cliffG);
  const skLabel = inscription('ΣΚΥΛΛΑ', -128, -78, { size: 8, angle: 90, color: CLAY });
  root.appendChild(skLabel);
  /* ---------------- Skylla's necks ---------------- */
  const neckG = s('g', { class: 'skylla' });
  const necks = NECKS.map((pts, i) => new Neck({ pts, width: 7.4, phase: i * 1.3 }, 1.05));
  // Draw the lowest necks last so their heads sit in front.
  [5, 4, 3, 2, 1, 0].forEach((i) => neckG.appendChild(necks[i].g));
  root.appendChild(neckG);
  const reach = necks.map(() => ({ v: 0 }));
  /* ---------------- The galley ---------------- */
  const galley = new Galley({
    k: K,
    seats: [-27, -21, -15, -9, 7, 13, 19, 25],
    rowerScale: 0.5,
    helmsman: true,
    sail: 'furled',
    oar: 34,
    styles: [{}, { head: 'youth' }, {}, { garment: 'short' }, { head: 'youth' }, {}, { garment: 'short' }, {}],
  });
  root.appendChild(galley.g);
  // Odysseus in arms on the foredeck, two spears, looking back at the gap.
  const OS = 0.62;
  const odx = 34 * K;
  const ody = new Figure({ hat: 'pilos', garment: 'short', cloak: true, facing: -1, scale: OS }, pose({ ...POSES.stand(odx, galley.gunwale / OS), armF: [70, 60], armB: [30, 40], head: 4 }));
  galley.deck.appendChild(ody.g);
  // Two spears in his hand (only his head moves in this scene, so they are drawn once).
  const [hx, hy] = ody.hand('F');
  galley.deck.append(spear([hx + 3, hy + 16], [hx - 3, hy - 30], INK, 1), spear([hx + 6, hy + 15], [hx + 1, hy - 27], INK, 1));
  const odyLabel = inscription('ΟΔΥΣΣΕΥΣ', odx + 14, -74, { size: 5, angle: 90 });
  galley.deck.appendChild(odyLabel);
  // Drag handle: the whole ship.
  const shipHit = s('rect', { x: -86, y: -70, width: 180, height: 76, fill: 'transparent' });
  galley.top.appendChild(shipHit);
  /* ---------------- Sea and Kharybdis ---------------- */
  const water = sea(SEA_Y, { crestHeight: 14 });
  const crestPath = water.crests.querySelector('path');
  crestPath?.setAttribute('stroke', CLAY);
  crestPath?.setAttribute('stroke-width', '0.8');
  crestPath?.setAttribute('paint-order', 'stroke');
  root.appendChild(water.g);
  const tile = 576 / Math.round(576 / (16 * 1.4));
  const whirl = whirlpool(WHIRL_R);
  const whirlWrap = s('g', { transform: `translate(${WHIRL[0]} ${WHIRL[1]}) scale(1 0.62)` });
  const whirlInner = s('g', { opacity: 0 });
  whirlInner.appendChild(whirl.g);
  whirlWrap.appendChild(whirlInner);
  water.g.appendChild(whirlWrap);
  /** Each ring opens out from the gullet when Kharybdis wakes (scale per ring). */
  const grow = whirl.rings.map(() => ({ v: 0.2 }));
  const khLabel = inscription('ΧΑΡΥΒΔΙΣ', 54, 110, { size: 7.5, color: CLAY });
  khLabel.style.opacity = '0';
  water.g.appendChild(khLabel);
  // Prey: rowers carried off by the heads live in scene space, above all.
  const preyG = s('g', { class: 'sky-prey' });
  root.appendChild(preyG);
  /* ---------------- State and the idle driver ---------------- */
  const S = {
    x: X_ENTER,
    tx: X_ENTER,
    follow: 1.2,
    effort: 1,
    phase: 0,
    crest: 0,
    spin: 0,
    spinRate: 0.35, // radians per second for the outer ring
    whirl: 0, // 0..1 whirlpool presence
    pull: 0, // tug toward the whirlpool (drag)
    look: 0, // eyes on the whirlpool
    dragging: false,
  };
  interface Prey {
    r: Rower;
    neck: Neck;
    grab: Vec;
    wrap: SVGGElement;
    swing: number;
    fade: number;
  }
  const prey: Prey[] = [];
  const renderNecks = (t: number) => {
    necks.forEach((n, i) => {
      const e = reach[i].v;
      n.wild = (0.35 + 0.65 * e) * (1 - n.mix * 0.8);
      n.render(t, 0.08 + 0.92 * e);
      // Snarl: jaws snap open and shut.
      const snap = Math.max(0, Math.sin(t * 2.3 + i * 1.7)) ** 3;
      n.head.setJaw(8 + snap * 22 + n.mix * 10);
      n.g.setAttribute('opacity', e < 0.02 ? '0' : '1');
    });
  };
  let prevT = 0;
  const tick = (t: number) => {
    const dt = Math.min(0.1, Math.max(0, t - prevT));
    prevT = t;
    if (!S.dragging) S.x += (S.tx - S.x) * (ctx.reduced ? 1 : Math.min(1, dt * S.follow));
    const bob = Math.sin(t * 1.4) * 0.9;
    const wob = S.pull * Math.sin(t * 5) * 1.2;
    galley.place(S.x, W + bob + S.pull * 10, Math.sin(t * 1.1) * 0.8 + S.pull * 5 + wob);
    S.phase += dt * 0.95 * (0.3 + 0.7 * S.effort);
    galley.row(S.phase, S.effort, 1);
    // Sea runs past; Kharybdis turns (faster as the ship is tugged).
    S.crest = (S.crest - dt * (6 + S.pull * 10)) % tile;
    water.crests.setAttribute('transform', `translate(${S.crest.toFixed(2)} ${(Math.sin(t * 1.2) * 0.8).toFixed(2)})`);
    S.spin += dt * S.spinRate * (1 + S.pull * 2.5) * S.whirl;
    whirl.rings.forEach((ring, i) => {
      const k = grow[i].v;
      ring.setAttribute('transform', `rotate(${((S.spin * whirl.speeds[i] * 180) / Math.PI).toFixed(2)}) scale(${k.toFixed(3)})`);
    });
    renderNecks(t);
    // Prey dangle from the jaws until they vanish into the cave.
    for (let i = prey.length - 1; i >= 0; i--) {
      const p = prey[i];
      if (p.fade <= 0.001) {
        p.wrap.remove();
        prey.splice(i, 1);
        continue;
      }
      const [jx, jy] = p.neck.jaws();
      const sw = Math.sin(t * 7 + p.swing) * 14;
      p.wrap.setAttribute('transform', `translate(${jx.toFixed(1)} ${jy.toFixed(1)}) rotate(${sw.toFixed(1)}) translate(${(-p.grab[0]).toFixed(1)} ${(-p.grab[1]).toFixed(1)})`);
      p.wrap.setAttribute('opacity', p.fade.toFixed(2));
      const k = Math.sin(t * 11 + p.swing);
      p.r.fig.set({ lean: -8 + k * 6, head: -20, armF: [150 + k * 20, 20], armB: [120 - k * 25, 40], legF: [20 + k * 25, 30], legB: [-10 - k * 20, 50] });
    }
    // Eyes on the whirlpool.
    if (S.look > 0) {
      for (const r of galley.rowers) if (!r.gone) r.extra = { head: 24 * S.look, lean: 6 * S.look };
    }
  };
  // Render every frame; the idle clock is frozen under reduced motion (st.loop pauses it).
  const clock = { t: 0 };
  st.loop(gsap.to(clock, { t: 100000, duration: 100000, ease: 'none' }));
  const onFrame = () => tick(clock.t);
  gsap.ticker.add(onFrame);
  ctx.signal.addEventListener('abort', () => gsap.ticker.remove(onFrame));
  tick(0);
  const snatch = (): gsap.core.Timeline => {
    const chosen = [0, 1, 2, 4, 5, 7].map((i) => galley.rowers[i]);
    // Match necks to rowers from left to right so they do not cross.
    const order = necks.map((n) => ({ n, x: n.idle[n.idle.length - 1][0] })).sort((a, b) => a.x - b.x);
    const tl = st.timeline();
    // Every eye turns to the whirlpool as it gulps.
    tl.call(() => ctx.audio.sfx('whirl'), [], 0);
    tl.to(S, { look: 1, duration: 0.45, ease: 'power2.out' }, 0);
    tl.to(S, { spinRate: 1.1, duration: 0.5, yoyo: true, repeat: 1 }, 0);
    tl.add(ody.to({ head: 26 }, { duration: 0.45 }), 0);
    order.forEach(({ n }, k) => {
      const r = chosen[k];
      const at = 0.5 + k * 0.07;
      const root0 = n.idle[0];
      let strike: Vec[] = [];
      // Coiled back at the cave mouth, prey in the jaws.
      const coiled = n.idle.map((p, q) => [root0[0] + (p[0] - root0[0]) * 0.34 + q * 2, root0[1] + (p[1] - root0[1]) * 0.34 - q * 3] as Vec);
      tl.call(() => {
        // Arc over and come down on the rower's shoulders from above.
        const j = r.fig.joints();
        const target = galley.toScene(r.fig.toWorld(j.N));
        const side = k % 2 ? 1 : -1;
        strike = [
          root0,
          [lerp(root0[0], target[0], 0.3) + side * 12, lerp(root0[1], target[1], 0.3) - 26],
          [target[0] - 18 + side * 8, target[1] - 74],
          [target[0] - 3, target[1] - 34],
          [target[0] + 1, target[1] - 8],
        ];
        n.alt = strike.map((p) => [...p] as Vec);
      }, [], at - 0.01);
      tl.to(n, { mix: 1, duration: 0.24, ease: 'power3.in' }, at);
      tl.call(() => {
        if (k % 2 === 0) ctx.audio.sfx('bark');
        const j = r.fig.joints();
        const grab = r.fig.toWorld(j.N);
        r.gone = true;
        r.extra = {};
        galley.drawOar(r);
        const wrap = s('g');
        wrap.appendChild(r.fig.g);
        preyG.appendChild(wrap);
        prey.push({ r, neck: n, grab: [grab[0], grab[1] + 1], wrap, swing: k * 1.9, fade: 1 });
      }, [], at + 0.24);
      // Lift the prey up into the cave.
      const lift = { u: 0 };
      tl.to(lift, {
        u: 1,
        duration: 0.9,
        ease: 'power2.out',
        onUpdate: () => {
          n.alt = strike.map((p, q) => [lerp(p[0], coiled[q][0], lift.u), lerp(p[1], coiled[q][1], lift.u)] as Vec);
        },
      }, at + 0.26);
      tl.call(() => {
        const pr = prey.find((p) => p.neck === n);
        if (pr) st.to(pr, { fade: 0, duration: 0.3 });
      }, [], at + 0.26 + 0.62);
      // …and out again, hungry.
      tl.to(n, { mix: 0, duration: 0.7, ease: 'power2.inOut' }, at + 1.0);
    });
    tl.to(S, { look: 0, duration: 0.6 }, 1.5);
    tl.add(ody.to({ head: 4 }, { duration: 0.6 }), 1.5);
    tl.call(() => {
      S.follow = 0.8;
      S.tx = X_OUT;
    }, [], 1.3);
    return tl;
  };
  return {
    enter() {
      S.tx = X_START;
      S.follow = 1.1;
      const tl = st.timeline();
      tl.from(cliffG, { opacity: 0, duration: 0.9 }, 0).to({}, { duration: 2 }, 0);
      return st.play(tl);
    },
    async beat(i) {
      if (i === 0) {
        // Skylla: the necks pour out of the cave, heads snapping.
        const tl = st.timeline();
        reach.forEach((r, k) => tl.to(r, { v: 1, duration: 1.1, ease: 'power2.out' }, 0.1 + k * 0.12));
        tl.call(() => ctx.audio.sfx('bark'), [], 0.5)
          .fromTo(skLabel.querySelectorAll('path'), { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.25, stagger: 0.12, ease: 'none' }, 0.6)
          .to(S, { effort: 0.35, duration: 1 }, 0);
        return st.play(tl);
      }
      if (i === 1) {
        // Kharybdis: the black water starts to turn; the fig tree above it.
        ctx.audio.sfx('whirl');
        const tl = st.timeline();
        tl.to(figG, { opacity: 1, duration: 0.9 }, 0)
          .from(figG, { y: 14, duration: 1, ease: 'power2.out' }, 0)
          .to(whirlInner, { opacity: 1, duration: 0.6 }, 0.2)
          .to(grow, { v: 1, duration: 1.4, stagger: { each: 0.1, from: 'end' }, ease: 'power2.out' }, 0.2)
          .to(S, { whirl: 1, duration: 1.2 }, 0.2)
          .to(S, { spinRate: 0.55, duration: 1.2 }, 0.2)
          .to(khLabel, { opacity: 1, duration: 0.8 }, 1.1);
        return st.play(tl);
      }
      if (i === 2) {
        // Steer through: drag the ship right while Kharybdis tugs it down.
        S.effort = 1;
        await ctx.drag(shipHit, {
          label: L('Gemiyi sürükle: Skylla’nın kayalığına yakın geç', 'Drag the ship: keep close to Scylla’s cliff'),
          axis: 'x',
          distance: X_END - X_START,
          onProgress: (p) => {
            S.dragging = true;
            const x = lerp(X_START, X_END, p);
            // The tug is strongest right above the whirlpool: the ship lags and dips toward it.
            const d = (x + 20 - WHIRL[0]) / 70;
            S.pull = Math.exp(-d * d) * (p < 1 ? 1 : 0);
            S.x = x - S.pull * 7;
            S.tx = S.x;
          },
        });
        S.dragging = false;
        ctx.audio.sfx('success');
        const tl = st.timeline();
        tl.to(S, { pull: 0, duration: 0.6, ease: 'power2.out' }, 0);
        return st.play(tl);
      }
      if (i === 3) {
        return st.play(snatch());
      }
    },
    destroy() {
      gsap.ticker.remove(onFrame);
      st.destroy();
    },
  };
};
