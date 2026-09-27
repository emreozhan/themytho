/**
 * ΙΓʹ Sirenler — Odysseus sails past the Sirens.
 *
 * Modelled on the British Museum "Siren Vase": a black galley between two
 * rocky islets, a woman-headed bird on each. Beat 1: the reader plugs every
 * crewman's ears with wax (one tap each). Beat 2: tap the mast and the ropes
 * coil round Odysseus. Beat 3 (hold): the Sirens sing — the song streams
 * toward the ship as painted words — and the ship rows past while Odysseus
 * strains at the ropes. Beat 4: the galley slips away behind the far islet,
 * the song dies and the Sirens droop.
 */
import { s } from '../lib/dom';
import { gsap } from '../lib/motion';
import { clamp, lerp, sampleSpline, type Vec } from '../lib/geometry';
import { Figure, POSES, pose, INK, CLAY, WHITE } from '../art/figure';
import { sea, rock, sun, inscription, fillers, splash } from '../art/kit';
import { greekText } from '../art/letters';
import { Siren, bone, skull } from './sirenler.art';
import { Galley } from './sirenler.galley';
import { stage } from './tools';
import type { SceneFactory } from '../story/types';

const W = 86; // waterline of the galley
const SEA_Y = 80; // top of the wave crests (in front of the hull)
const K = 2.2; // galley scale
const OS = 0.74; // Odysseus's figure scale
const X_WAIT = -36; // galley x while the crew is prepared
const X_PAST = 30; // after the song
const X_AWAY = 250; // gone behind the far islet

const SONG_A = 'ΔΕΥΡ ΑΓ ΙΩΝ ΠΟΛΥΑΙΝ ΟΔΥΣΕΥ';
const SONG_B = 'ΝΗΑ ΚΑΤΑΣΤΗΣΟΝ ΙΝΑ ΝΩΙΤΕΡΗΝ ΟΠ ΑΚΟΥΣΗΙΣ';

/** A lumpy dab of wax (added white), centred at 0,0. */
const WAX = 'M-1.7 0.2C-1.9 -1.2 -0.5 -1.8 0.6 -1.4C1.8 -1 1.9 0.6 1 1.2C-0.1 1.9 -1.5 1.5 -1.7 0.2Z';

export const scene: SceneFactory = (ctx) => {
  const st = stage(ctx);
  const root = ctx.root;

  /* ---------------- Sky ---------------- */
  const sky = s('g', { class: 'sir-sky' });
  // The sun sits in a plain wrapper so it can swell without losing its own transform.
  const theSun = s('g');
  theSun.appendChild(sun(-16, -128, 10));
  sky.appendChild(theSun);
  sky.appendChild(fillers([[-70, -116], [34, -126], [-44, -66], [-2, -60]], 3.8));
  const title = inscription('ΣΕΙΡΗΝΕΣ', -16, -96, { size: 8.5, align: 'middle' });
  sky.appendChild(title);
  root.appendChild(sky);

  /* ---------------- The near islet (behind the galley) ---------------- */
  const isleA = s('g', { class: 'sir-isle sir-isle--a' });
  isleA.appendChild(
    rock(
      [[-184, 130], [-184, -16], [-166, -11], [-146, -8], [-124, -9], [-106, -7], [-99, 4], [-104, 17], [-92, 30], [-97, 48], [-86, 64], [-90, 96], [-82, 130]],
      { lines: 5, seed: 13 },
    ),
  );
  isleA.append(
    bone(-160, -12.6, -6, 9), bone(-110, -9.4, 14, 8), skull(-102, -10, 0.95, -1), bone(-122, 8, 64, 9),
    skull(-140, 18, 0.9), bone(-114, 30, -30, 8.5), bone(-150, 36, 12, 9), skull(-104, 44, 0.8, -1), bone(-130, 56, -12, 8),
  );
  const sirenA = new Siren({ x: -127, y: -8.4, scale: 1.14, facing: 1, instrument: 'lyre' });
  isleA.appendChild(sirenA.g);
  root.appendChild(isleA);

  /* ---------------- The third Siren, hovering over the strait ---------------- */
  const flyer = new Siren({ x: 0, y: 0, scale: 0.92, facing: -1, flying: true });
  const flyerG = s('g', { class: 'sir-flyer', opacity: 0 });
  flyerG.appendChild(flyer.g);
  root.appendChild(flyerG);
  const FLY: Vec = [48, -66];

  /* ---------------- The galley ---------------- */
  const galley = new Galley({
    k: K,
    seats: [-24.5, -14, 16, 26.5],
    rowerScale: 0.62,
    helmsman: true,
    sail: 'furled',
    oar: 44,
    styles: [{}, { head: 'youth' }, { head: 'bearded', garment: 'short' }, {}],
  });
  root.appendChild(galley.g);
  const G = galley.gunwale; // deck line in galley space

  // Odysseus at the mast, facing the bow.
  const ox = galley.mastX + 4.6;
  const ody = new Figure(
    { hat: 'pilos', garment: 'short', cloak: true, scale: OS },
    pose({ ...POSES.stand(ox, G / OS + 0.2), armF: [30, 30], armB: [-14, 16], head: -4 }),
  );
  galley.deck.appendChild(ody.g);
  const odyLabel = inscription('ΟΔΥΣΣΕΥΣ', galley.mastX - 9, -96, { size: 5.5, angle: 90 });
  galley.deck.appendChild(odyLabel);

  // Wax: a cake in Odysseus's hand, and a dab per ear.
  const cake = s('ellipse', { rx: 3.8, ry: 2.6, fill: WHITE, stroke: INK, 'stroke-width': 0.5, opacity: 0 });
  let cakeOn = false;
  galley.top.appendChild(cake);
  const crew = [
    ...(galley.helmsman ? [{ fig: galley.helmsman, rower: null as null | (typeof galley.rowers)[number] }] : []),
    ...galley.rowers.map((r) => ({ fig: r.fig, rower: r })),
  ];
  const dabs = crew.map(() => {
    const d = s('path', { d: WAX, fill: WHITE, stroke: INK, 'stroke-width': 0.3, opacity: 0 });
    galley.top.appendChild(d);
    return { el: d, on: false, sx: 1, sy: 1 };
  });

  // Ropes: wraps around Odysseus and the mast, each revealed 0..1.
  const ropeG = s('g', { class: 'sir-ropes' });
  galley.deck.appendChild(ropeG);
  const wraps = [0, 1, 2, 3, 4, 5].map(() => {
    const under = s('path', { fill: 'none', stroke: INK, 'stroke-width': 2.3, 'stroke-linecap': 'round' });
    const over = s('path', { fill: 'none', stroke: CLAY, 'stroke-width': 1.05, 'stroke-dasharray': '1.5 0.9', 'stroke-linecap': 'round' });
    ropeG.append(under, over);
    return { under, over, reveal: 0 };
  });
  const knotEnd = s('path', { fill: 'none', stroke: INK, 'stroke-width': 1.5, 'stroke-linecap': 'round', opacity: 0 });
  ropeG.appendChild(knotEnd);

  /* ---------------- The far islet (in front: the galley vanishes behind it) ---------------- */
  const isleB = s('g', { class: 'sir-isle sir-isle--b' });
  const rockB = rock(
    [[184, 130], [184, -6], [164, -1.5], [144, 0], [124, 0.4], [108, 3], [102, 14], [108, 26], [96, 40], [101, 56], [92, 72], [96, 130]],
    { lines: 5, seed: 29 },
  );
  const rockPath = rockB.querySelector('path');
  rockPath?.setAttribute('stroke', CLAY);
  rockPath?.setAttribute('stroke-width', '1.2');
  rockPath?.setAttribute('paint-order', 'stroke');
  isleB.appendChild(rockB);
  isleB.append(
    skull(104, -2, 0.95), bone(150, -3.5, 8, 9), bone(166, -4.6, -14, 7.5), bone(116, 16, -52, 9),
    skull(132, 26, 0.9, -1), bone(118, 38, 24, 8), bone(146, 46, -8, 8.5), skull(108, 58, 0.8), bone(136, 66, 30, 8),
  );
  const sirenB = new Siren({ x: 128, y: 0.4, scale: 1.14, facing: -1, instrument: 'aulos' });
  isleB.appendChild(sirenB.g);
  root.appendChild(isleB);

  /* ---------------- Sea (in front of the hulls and rocks) ---------------- */
  const water = sea(SEA_Y, { crestHeight: 14 });
  const crestPath = water.crests.querySelector('path');
  crestPath?.setAttribute('stroke', CLAY);
  crestPath?.setAttribute('stroke-width', '0.8');
  crestPath?.setAttribute('paint-order', 'stroke');
  root.appendChild(water.g);
  const tile = 576 / Math.round(576 / (16 * 1.4));
  // Dolphins incised through the black water (idle life).
  const dolphins = [[-66, 128, 1], [58, 142, -1]].map(([x, y, f]) => {
    const g = s('g', { class: 'sir-dolphin' });
    g.appendChild(s('path', {
      d: 'M-15 0C-10 -5 0 -7 8 -5C12 -4 14 -2 16 -1L20 -0.5L16 0.7C13 1.8 8 3 0 3C-6 3 -11 2 -15 0ZM-15 0L-20.5 -4.5L-18.4 0L-20.5 4.5ZM-2 -6L-6.5 -11L2 -6.3M4 2.2L0.5 7.4L7 2.6',
      fill: 'none', stroke: CLAY, 'stroke-width': 0.8, 'stroke-linejoin': 'round', opacity: 0.75,
    }));
    g.appendChild(s('circle', { cx: 12.4, cy: -2.4, r: 0.8, fill: CLAY, opacity: 0.75 }));
    water.g.appendChild(g);
    return { g, x, y, f };
  });

  /* ---------------- Song ---------------- */
  const songG = s('g', { class: 'sir-song', opacity: 0 });
  root.appendChild(songG);
  const mkLines = () =>
    [0, 1, 2].map(() => {
      const p = s('path', { fill: 'none', stroke: WHITE, 'stroke-width': 1.15, 'stroke-linecap': 'round', 'stroke-dasharray': '7 5' });
      songG.appendChild(p);
      return p;
    });
  const linesA = mkLines();
  const linesB = mkLines();
  const mkLetters = (text: string) =>
    [...text].map((ch) => {
      const t = greekText(ch === ' ' ? '·' : ch, { size: 6.5, weight: 1.3, align: 'middle' });
      const g = s('g', { opacity: 0 });
      t.g.style.color = INK;
      g.appendChild(t.g);
      songG.appendChild(g);
      return g;
    });
  const lettersA = mkLetters([...SONG_A].reverse().join(''));
  const lettersB = mkLetters(SONG_B);

  /* ---------------- State & the idle driver ---------------- */
  const S = {
    x: -260, // galley x (actual)
    tx: -260, // galley x target
    follow: 3.5, // how fast x follows the target
    effort: 1, // rowing effort
    rate: 0.8, // strokes per second
    phase: 0,
    breath: 1,
    song: 0, // song intensity 0..1
    agitation: 0, // Odysseus straining 0..1
    strain: 0, // 1 once bound (strain pose active)
    droop: 0, // Sirens drooping
    lift: 0, // Sirens rising to sing (wings spread)
    crest: 0,
    lastP: 0,
    lastSfx: -10,
    nod: 0, // extra head bow (begging with his brows)
    dive: 0, // the third Siren's plunge 0..1
  };
  galley.place(S.x, W);

  const odyBase = { lean: 0, head: -4 };
  const renderOdysseus = (t: number) => {
    if (S.strain <= 0) return;
    const a = S.agitation;
    const k = S.strain;
    const w = Math.sin(t * (6 + a * 5));
    const jerk = Math.sin(t * 13.7) * Math.sin(t * 2.3);
    ody.set({
      lean: lerp(odyBase.lean, 6 + a * 11 + w * (2 + a * 6) + jerk * a * 4, k),
      head: lerp(odyBase.head, -14 + Math.sin(t * 3.2) * 4 - a * 10 + jerk * a * 6, k) + S.nod,
      armF: [lerp(-26, -40, a) + w * 7 * a, 26 + a * 14],
      armB: [lerp(-34, -48, a) - w * 7 * a, 20 + a * 10],
      legF: [8 + a * 6 + jerk * a * 3, 6 + a * 4],
      legB: [-6 - a * 3, 4],
      footB: a * 18,
    });
  };

  const renderRopes = () => {
    const j = ody.joints();
    const mastBack = galley.mastX - 3;
    const pts: Array<[Vec, number]> = [
      [j.legF.A, 3.4],
      [[(j.legF.K[0] + j.legB.K[0]) / 2, (j.legF.K[1] + j.legB.K[1]) / 2], 5.6],
      [[j.P[0], j.P[1] + 4], 6.4],
      [[j.P[0] + j.u[0] * 12, j.P[1] + j.u[1] * 12], 4.8],
      [[j.P[0] + j.u[0] * 22, j.P[1] + j.u[1] * 22], 7.8],
      [[j.P[0] + j.u[0] * 17, j.P[1] + j.u[1] * 17], 6.6],
    ];
    wraps.forEach((w, i) => {
      if (w.reveal <= 0.001) {
        w.under.setAttribute('d', '');
        w.over.setAttribute('d', '');
        return;
      }
      const [c, half] = pts[i];
      const front = ody.toWorld([c[0] + half + 1.2, c[1] - 1.6]);
      const mid = ody.toWorld([c[0], c[1] + 1.2]);
      const back: Vec = [mastBack, ody.toWorld(c)[1] + 2.4];
      const curve = sampleSpline([back, mid, front], 12);
      const n = Math.max(2, Math.round(curve.length * w.reveal));
      const d = curve.slice(0, n).map((p, k) => `${k ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('');
      w.under.setAttribute('d', d);
      w.over.setAttribute('d', d);
    });
    if (wraps[2].reveal >= 1) {
      const kp = ody.toWorld([j.P[0] + 6, j.P[1] + 3]);
      knotEnd.setAttribute('d', `M${kp[0].toFixed(1)} ${kp[1].toFixed(1)}q2 5 0.6 10q-1 4 1.4 7`);
    }
  };

  const songPath = (from: Vec, to: Vec, t: number, lane: number, amp: number): Vec[] => {
    const dx = to[0] - from[0], dy = to[1] - from[1];
    const L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L, ny = dx / L;
    const pts: Vec[] = [];
    const n = 28;
    for (let i = 0; i <= n; i++) {
      const u = (i / n) * 0.9;
      const env = Math.sin(Math.PI * Math.min(1, u * 1.15)) ** 0.8;
      const bulge = Math.sin(Math.PI * u) * (lane * 9 - 10);
      const wv = Math.sin(u * 12 - t * 3.2 + lane * 2.1) * amp * env;
      pts.push([from[0] + dx * u + nx * (wv + bulge), from[1] + dy * u + ny * (wv + bulge)]);
    }
    return pts;
  };

  const placeLetters = (letters: SVGGElement[], pts: Vec[], t: number, speed: number) => {
    const acc = [0];
    for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const total = acc[acc.length - 1];
    const spacing = 7.2;
    const span = letters.length * spacing + 40;
    letters.forEach((g, i) => {
      const d = ((t * speed - i * spacing) % span + span) % span;
      if (d > total * 0.8 || S.song < 0.05) {
        g.setAttribute('opacity', '0');
        return;
      }
      let k = 1;
      while (k < acc.length - 1 && acc[k] < d) k++;
      const f = (d - acc[k - 1]) / (acc[k] - acc[k - 1] || 1);
      const x = lerp(pts[k - 1][0], pts[k][0], f), y = lerp(pts[k - 1][1], pts[k][1], f);
      let ang = (Math.atan2(pts[k][1] - pts[k - 1][1], pts[k][0] - pts[k - 1][0]) * 180) / Math.PI;
      if (ang > 90) ang -= 180;
      if (ang < -90) ang += 180;
      const fade = clamp(d / 14, 0, 1) * clamp((total * 0.8 - d) / 24, 0, 1);
      g.setAttribute('opacity', (fade * S.song).toFixed(2));
      g.setAttribute('transform', `translate(${x.toFixed(1)} ${(y - 4.5).toFixed(1)}) rotate(${ang.toFixed(1)})`);
    });
  };

  const renderSong = (t: number) => {
    songG.setAttribute('opacity', S.song.toFixed(2));
    if (S.song <= 0.01) return;
    const target = galley.toScene(galley.ear(ody));
    const amp = 3.5 + S.agitation * 3;
    const a = sirenA.mouthIn(root);
    const b = sirenB.mouthIn(root);
    const pa = [0, 1, 2].map((lane) => songPath(a, target, t, lane, amp));
    const pb = [0, 1, 2].map((lane) => songPath(b, target, t + 1.3, lane, amp));
    const toD = (pts: Vec[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('');
    linesA.forEach((l, i) => {
      l.setAttribute('d', toD(pa[i]));
      l.setAttribute('stroke-dashoffset', (-t * 26 - i * 4).toFixed(1));
    });
    linesB.forEach((l, i) => {
      l.setAttribute('d', toD(pb[i]));
      l.setAttribute('stroke-dashoffset', (-t * 26 - i * 4).toFixed(1));
    });
    placeLetters(lettersA, pa[1], t, 22);
    placeLetters(lettersB, pb[1], t + 3, 22);
  };

  const renderSirens = (t: number) => {
    const d = S.droop, l = S.lift * (1 - d);
    const sing = S.song * (1 - d);
    for (const [sr, off] of [[sirenA, 0], [sirenB, 1.7]] as Array<[Siren, number]>) {
      const tt = t + off;
      sr.setPose({
        bob: Math.sin(tt * 1.4) * 0.5 + d * 1.5,
        wing: l * 12 + Math.sin(tt * 0.9) * (3 + sing * 3) - d * 40,
        farWing: 14 + l * 10 + Math.sin(tt * 0.9 + 0.4) * 3 - d * 36,
        head: Math.sin(tt * 0.7) * 2.5 - sing * (7 + Math.sin(tt * 2.6) * 3) + d * 24,
        tail: Math.sin(tt * 0.8) * 2 - d * 12,
        hand: sing > 0.1 ? Math.sin(tt * (sr.instrument === 'lyre' ? 9 : 5)) * 12 * sing : Math.sin(tt * 0.8) * 3,
      });
      sr.shut(clamp(d * 1.6 - 0.4, 0, 1));
    }
    // The hovering Siren beats her wings; in the end she folds them and plunges, eyes shut.
    const dv = S.dive;
    const flap = Math.sin(t * 2.4);
    flyer.setPose({
      wing: lerp(24 + flap * 14, -30, dv),
      farWing: lerp(40 + flap * 12, -20, dv),
      head: lerp(-10 - sing * 8 + Math.sin(t * 1.3) * 3, 18, dv),
      tail: lerp(flap * 4, -6, dv),
      bob: 0,
      hand: 0,
    });
    flyer.shut(clamp(dv * 3, 0, 1));
    const fx = lerp(FLY[0], 30, dv * dv), fy = lerp(FLY[1] + Math.sin(t * 2.4 - 0.6) * 3, SEA_Y + 40, dv * dv);
    const rot = lerp(Math.sin(t * 1.2) * 3 - 8, -100, clamp(dv * 1.6, 0, 1));
    flyerG.setAttribute('transform', `translate(${fx.toFixed(1)} ${fy.toFixed(1)}) rotate(${rot.toFixed(1)} 0 -26)`);
  };

  let prevT = 0;
  const tick = (t: number) => {
    const dt = Math.min(0.1, Math.max(0, t - prevT));
    prevT = t;
    // Galley follows its target.
    const before = S.x;
    S.x += (S.tx - S.x) * (ctx.reduced ? 1 : Math.min(1, dt * S.follow));
    const v = dt > 0 ? (S.x - before) / dt : 0;
    const roll = Math.sin(t * 1.1) * 0.6 + S.agitation * Math.sin(t * 7) * 0.6;
    galley.place(S.x, W + Math.sin(t * 1.3) * 0.8, roll);
    S.phase += dt * S.rate * (0.25 + 0.75 * S.effort);
    galley.row(S.phase, S.effort, S.breath);
    // Crests drift with the ship's speed (and a slow swell).
    S.crest = (S.crest - dt * (5 + v * 0.8)) % tile;
    water.crests.setAttribute('transform', `translate(${S.crest.toFixed(2)} ${(Math.sin(t * 1.2) * 0.8).toFixed(2)})`);
    renderOdysseus(t);
    renderRopes();
    // Wax dabs ride on the ears.
    crew.forEach((c, i) => {
      const dab = dabs[i];
      if (!dab.on) return;
      const [x, y] = galley.ear(c.fig);
      dab.el.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${dab.sx.toFixed(2)} ${dab.sy.toFixed(2)})`);
    });
    if (cakeOn) {
      const [hx, hy] = ody.hand('F');
      cake.setAttribute('cx', (hx + 1.5).toFixed(1));
      cake.setAttribute('cy', (hy - 2.2).toFixed(1));
    }
    dolphins.forEach((d, i) => {
      const ph = t * 0.55 + i * 2.1;
      const dx = Math.sin(ph) * 12 * d.f, dy = -Math.abs(Math.sin(ph * 2)) * 3.5;
      d.g.setAttribute('transform', `translate(${(d.x + dx).toFixed(1)} ${(d.y + dy).toFixed(1)}) scale(${d.f} 1) rotate(${(Math.cos(ph * 2) * 7).toFixed(1)})`);
    });
    renderSirens(t);
    renderSong(t);
    if (S.song > 0.5 && t - S.lastSfx > 3.9 && S.droop < 0.2) {
      S.lastSfx = t;
      ctx.audio.sfx('sirens');
    }
  };
  // Render every frame; the idle clock is frozen under reduced motion (st.loop pauses it).
  const clock = { t: 0 };
  st.loop(gsap.to(clock, { t: 100000, duration: 100000, ease: 'none' }));
  const onFrame = () => tick(clock.t);
  gsap.ticker.add(onFrame);
  ctx.signal.addEventListener('abort', () => gsap.ticker.remove(onFrame));
  tick(0);

  const setX = (x: number) => {
    S.tx = x;
    if (ctx.reduced) {
      S.x = x;
      tick(prevT);
    }
  };

  /** A pellet of wax flies from the cake to crewman k's ear and squashes in. */
  const flyWax = (k: number): Promise<void> => {
    const c = crew[k];
    const dab = dabs[k];
    const pellet = s('circle', { r: 2.1, fill: WHITE, stroke: INK, 'stroke-width': 0.4 });
    galley.top.appendChild(pellet);
    const from: Vec = [+(cake.getAttribute('cx') ?? 0), +(cake.getAttribute('cy') ?? 0)];
    const pr = { u: 0 };
    const tl = st.timeline();
    tl.to(pr, {
      u: 1,
      duration: 0.55,
      ease: 'power1.inOut',
      onUpdate: () => {
        const to = galley.ear(c.fig);
        const mid: Vec = [(from[0] + to[0]) / 2, Math.min(from[1], to[1]) - 26];
        const u = pr.u, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), cc = u * u;
        pellet.setAttribute('cx', (a * from[0] + b * mid[0] + cc * to[0]).toFixed(1));
        pellet.setAttribute('cy', (a * from[1] + b * mid[1] + cc * to[1]).toFixed(1));
      },
    });
    tl.call(() => {
      pellet.remove();
      dab.on = true;
      dab.el.setAttribute('opacity', '1');
      if (c.rower) c.rower.extra = { head: -16 };
      else c.fig.to({ head: -12 }, { duration: 0.15 });
    });
    tl.fromTo(dab, { sx: 1.9, sy: 0.45 }, { sx: 1, sy: 1, duration: 0.5, ease: 'elastic.out(1.2, 0.4)' });
    tl.to(cake, { attr: { rx: '-=0.35', ry: '-=0.25' }, duration: 0.2 }, '<');
    tl.call(() => {
      if (c.rower) c.rower.extra = {};
      else c.fig.to({ head: 4 }, { duration: 0.3 });
    }, [], '-=0.2');
    return st.play(tl);
  };

  return {
    enter() {
      // The galley rows in from the west, past the first islet.
      S.effort = 1;
      S.follow = 1.1;
      setX(X_WAIT);
      const tl = st.timeline();
      tl.from([isleA, isleB], { opacity: 0, duration: 1, ease: 'power2.out' }, 0)
        .to(flyerG, { opacity: 1, duration: 1 }, 0.4)
        .from(sky, { opacity: 0, duration: 1.2 }, 0.2)
        .to({}, { duration: 2.2 }, 0);
      return st.play(tl);
    },

    async beat(i) {
      if (i === 0) {
        // The calm: the wind drops, the oars rest; the Sirens lift their wings.
        const tl = st.timeline();
        tl.to(S, { effort: 0, duration: 1.6, ease: 'power2.inOut' }, 0.2)
          .to(S, { lift: 1, duration: 1.4, ease: 'power2.out' }, 0.3)
          .fromTo(title.querySelectorAll('path'), { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.25, stagger: 0.12, ease: 'none' }, 0.4);
        S.follow = 3.5;
        setX(X_WAIT);
        return st.play(tl);
      }

      if (i === 1) {
        // Odysseus cuts a cake of wax and warms it in the sun…
        cakeOn = true;
        const tl = st.timeline();
        tl.to(cake, { opacity: 1, duration: 0.3 }, 0);
        tl.add(ody.to({ armF: [158, 12], head: -16 }, { duration: 0.7 }), 0);
        tl.to(theSun, { scale: 1.35, svgOrigin: '-16 -128', duration: 0.5, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 0.6);
        tl.to(cake, { attr: { rx: 3.2, ry: 3 }, duration: 0.6 }, 0.8);
        tl.add(ody.to({ armF: [74, 20], head: 2 }, { duration: 0.6 }), 1.5);
        await st.play(tl);
        // …then plugs each man's ears, one by one.
        for (let k = 0; k < crew.length; k++) {
          if (ctx.signal.aborted) return;
          const [ex, ey] = galley.ear(crew[k].fig);
          const hit = s('rect', { x: (ex - 11).toFixed(1), y: (ey - 13).toFixed(1), width: 22, height: 26, fill: 'transparent', class: 'sir-hit' });
          galley.top.appendChild(hit);
          await ctx.tap(hit, { label: `Kürekçinin kulağını balmumuyla tıka (${k + 1}/${crew.length})` });
          hit.remove();
          await flyWax(k);
        }
        ctx.audio.sfx('success');
        const done = st.timeline();
        done.to(cake, { opacity: 0, duration: 0.4, onComplete: () => void (cakeOn = false) }, 0.1);
        done.add(ody.to({ armF: [30, 30], head: -4 }, { duration: 0.6 }), 0);
        return st.play(done);
      }

      if (i === 2) {
        // Tap the mast; the companions bind him standing, hands behind the mast.
        const hit = s('rect', { x: galley.mastX - 9, y: galley.mastTop + 6, width: 18, height: -galley.mastTop - 58, fill: 'transparent' });
        galley.top.appendChild(hit);
        await ctx.tap(hit, { label: 'Direğe dokun: Odysseus’u bağla' });
        hit.remove();
        const near = [galley.rowers[1], galley.rowers[2]];
        const tl = st.timeline();
        tl.add(ody.to({ armF: [-26, 26], armB: [-34, 20], head: -8 }, { duration: 0.45 }), 0);
        tl.call(() => {
          near[0].extra = { lean: -18, head: 14, armF: [-118, -16], armB: [-104, -8] };
          near[1].extra = { lean: 14, head: -10, armF: [120, 20], armB: [110, 30] };
          near.forEach((r) => (r.free = true));
        }, [], 0.1);
        wraps.slice(0, 5).forEach((w, k) => {
          tl.to(w, { reveal: 1, duration: 0.32, ease: 'power1.inOut' }, 0.45 + k * 0.27);
        });
        tl.set(knotEnd, { opacity: 1 }, 0.45 + 2 * 0.27 + 0.32);
        tl.call(() => ctx.audio.sfx('twang'), [], 1.9);
        tl.call(() => {
          near[0].extra = {};
          near[1].extra = {};
          near.forEach((r) => (r.free = false));
        }, [], 2.0);
        tl.to(S, { strain: 1, duration: 0.5 }, 1.8);
        return st.play(tl);
      }

      if (i === 3) {
        // The song. Hold to row past; release and the song drags them back.
        ctx.audio.sfx('sirens');
        S.lastSfx = prevT;
        const intro = st.timeline();
        intro.to(S, { song: 1, duration: 0.8 }, 0).to(S, { effort: 1, duration: 0.8 }, 0).to(S, { agitation: 0.35, duration: 0.8 }, 0);
        S.follow = 2.2;
        S.lastP = 0;
        await ctx.hold({
          label: 'Basılı tut',
          seconds: 4.2,
          onProgress: (p) => {
            const released = p < S.lastP - 1e-4;
            S.lastP = p;
            S.agitation += ((released ? 1 : 0.35) - S.agitation) * (released ? 0.25 : 0.05);
            S.effort = released ? Math.max(0.35, S.effort - 0.04) : Math.min(1, S.effort + 0.04);
            setX(lerp(X_WAIT, X_PAST, p));
          },
        });
        const after = st.timeline();
        after.to(S, { agitation: 0.6, duration: 0.4 }, 0);
        return st.play(after);
      }

      if (i === 4) {
        // He begs with his brows; they bind him tighter and row away. The song dies.
        const tl = st.timeline();
        S.follow = 9;
        tl.to(wraps[5], { reveal: 1, duration: 0.35 }, 0.1)
          .to(S, { nod: 26, duration: 0.25, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 0)
          .to(S, { agitation: 0.1, duration: 1 }, 0.3)
          .to(S, { song: 0, duration: 1, ease: 'power1.in' }, 0.2)
          .to(S, { droop: 1, duration: 1.5, ease: 'power2.inOut' }, 0.6)
          .to(odyBase, { head: 12, duration: 0.7 }, 1.1)
          .to(S, { strain: 0.5, duration: 1 }, 1.1)
          .call(() => ctx.audio.sfx('depart'), [], 0.4)
          .to(S, { tx: X_AWAY, duration: 2.1, ease: 'power2.in' }, 0.4);
        // As on the Siren Vase, the third Siren shuts her eyes and plunges into the sea.
        tl.to(S, { dive: 1, duration: 0.8, ease: 'power2.in' }, 1.25);
        tl.call(() => {
          const sp = s('g');
          sp.appendChild(splash(30, SEA_Y + 2, 0.7));
          water.g.appendChild(sp);
          ctx.audio.sfx('splash');
          st.timeline().fromTo(sp, { scale: 0.3, svgOrigin: `30 ${SEA_Y + 2}`, opacity: 1 }, { scale: 1, duration: 0.35, ease: 'power2.out' }).to(sp, { opacity: 0, duration: 0.6 }, 0.3);
          gsap.set(flyerG, { opacity: 0 });
        }, [], 2.05);
        if (ctx.reduced) setX(X_AWAY);
        return st.play(tl);
      }
    },

    destroy() {
      gsap.ticker.remove(onFrame);
      st.destroy();
    },
  };
};
