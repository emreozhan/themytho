/**
 * Ι′ Laistrygonlar — the harbour of Telepylos (Od. 10.80–132).
 *
 * Two sheer headlands pinch a narrow mouth; eleven galleys lie packed inside
 * in three rows, while Odysseus moors his own ship outside, tied to a rock.
 * Beat 1: King Antiphates and his giants rise over the cliffs; the king seizes
 * a scout. Beat 2: boulders rain into the harbour — tap the mooring rope: it
 * parts, the eleven ships break and sink (the map loses them too) and
 * Odysseus's ship rows for its life. Beat 3: the lone ship reaches the open
 * sea; wreckage drifts in the harbour while the giants spear the water.
 */
import { s } from '../lib/dom';
import { gsap } from '../lib/motion';
import { smoothPath, type Vec } from '../lib/geometry';
import { Figure, POSES, pose, INK, CLAY, WHITE, PURPLE, STAND_HEIGHT, spear } from '../art/figure';
import { sea, rock, splash, inscription, fillers } from '../art/kit';
import { ship, rowing, BLACK_FIGURE } from '../art/ship';
import { stage } from './tools';
import { breakClips, breakable, boulder, citadel, flotsam, xiphos, type Breakable } from './laistrygonlar.art';
import type { SceneFactory } from '../story/types';
import { L } from '../i18n';

/** Width of one wave crest in the kit's sea strip of the given crest height. */
const crestTile = (h: number) => 576 / Math.max(1, Math.round(576 / (1.6 * h)));

/* Left and right headlands (world coordinates): skyline, inner edge down to the mouth, underside to the sea. */
const LEFT_CLIFF: Vec[] = [
  [-200, 230], [-200, -24], [-162, -30], [-128, -44], [-100, -62], [-84, -80], [-74, -100],
  [-82, -80], [-80, -50], [-72, -18], [-58, 14], [-40, 38], [-19, 56],
  [-34, 66], [-64, 72], [-100, 82], [-132, 96], [-152, 112], [-170, 230],
];
const RIGHT_CLIFF: Vec[] = [
  [200, 230], [200, -28], [166, -34], [132, -50], [106, -66], [90, -84], [76, -102],
  [84, -80], [82, -50], [74, -18], [60, 14], [42, 38], [19, 56],
  [34, 63], [60, 64], [90, 62], [120, 62], [146, 70], [160, 88], [168, 110], [180, 230],
];
/** The basin between the headlands (a little generous: the cliffs are drawn over its edges). */
const BASIN: Vec[] = [
  [-86, -112], [86, -112], [90, -80], [88, -50], [80, -18], [66, 14], [48, 40], [22, 60], [0, 72], [-22, 60], [-46, 40], [-64, 14], [-78, -18], [-86, -50], [-88, -80],
];
/** Height of the right headland's skyline at x (for the scouts). */
function rightSkyline(x: number): number {
  const sky = RIGHT_CLIFF.slice(1, 7);
  for (let i = 0; i < sky.length - 1; i++) {
    const [x0, y0] = sky[i], [x1, y1] = sky[i + 1];
    if (x <= x0 && x >= x1) return y0 + ((x - x0) * (y1 - y0)) / (x1 - x0);
  }
  return -30;
}

const SEA_Y = 110;
const GIANT_K = 1.62;

export const scene: SceneFactory = (ctx) => {
  const st = stage(ctx);
  const root = ctx.root;
  const clips = breakClips(ctx.defs, 'lai-cut');

  const skyTint = s('rect', { x: -200, y: -200, width: 400, height: 400, fill: INK, opacity: 0, 'pointer-events': 'none' });
  root.appendChild(skyTint);

  /* ---------------- Back: the lofty citadel of Lamos ---------------- */
  const back = s('g', { class: 'lai-back' });
  back.appendChild(citadel(-104, 96));
  back.appendChild(rock([[-76, -86], [-44, -100], [0, -106], [44, -100], [78, -88], [78, -78], [-76, -78]], { lines: 2, seed: 5 }));
  back.appendChild(inscription('ΤΗΛΕΠΥΛΟΣ', -34, -150, { size: 5.6 }));
  root.appendChild(back);

  /* ---------------- The giants (behind the cliffs) ---------------- */
  // The giants live behind the headlands: clip them to the sky above the skylines.
  const skyClip = s('clipPath', { id: 'lai-sky', 'data-scene': '' });
  const skyPts: Vec[] = [[-200, -200], [200, -200], [200, -24], [166, -30], [132, -46], [106, -62], [90, -80], [78, -96], [0, -98], [-76, -94], [-84, -76], [-100, -58], [-128, -40], [-162, -26], [-200, -20]];
  skyClip.appendChild(s('path', { d: `M${skyPts.map((p) => p.join(' ')).join('L')}Z` }));
  ctx.defs.appendChild(skyClip);
  const giantLayer = s('g', { class: 'lai-giants', 'clip-path': 'url(#lai-sky)' });
  root.appendChild(giantLayer);
  const HIDE = 40;
  const leftGiant = new Figure({ head: 'giant', garment: 'short', garmentColor: INK, scale: GIANT_K }, pose({ ...POSES.stand(-104, 0), y: HIDE / GIANT_K, lean: 10, armF: [60, 60], armB: [30, 40] }));
  const king = new Figure({ head: 'giant', hat: 'diadem', garment: 'short', garmentColor: PURPLE, cloak: true, cloakColor: INK, scale: GIANT_K, facing: -1 }, pose({ ...POSES.stand(106, 0), y: HIDE / GIANT_K, lean: 8, armF: [70, 50], armB: [30, 40] }));
  giantLayer.append(leftGiant.g, king.g);
  const giantPelvis = (worldY: number) => worldY / GIANT_K;

  /* ---------------- The harbour: three rows of moored galleys ---------------- */
  const harbour = s('g', { class: 'lai-harbour' });
  root.appendChild(harbour);
  interface Moored { b: Breakable; x: number; y: number; bob: SVGGElement }
  const fleet: Moored[] = [];
  const tiers: Array<{ y: number; k: number; xs: number[] }> = [
    { y: -58, k: 0.46, xs: [-50, -17, 16, 49] },
    { y: -14, k: 0.52, xs: [-48, -16, 16, 48] },
    { y: 28, k: 0.56, xs: [-33, 0, 33] },
  ];
  const basinClip = s('clipPath', { id: 'lai-basin', 'data-scene': '' });
  basinClip.appendChild(s('path', { d: `M${BASIN.map((p) => p.join(' ')).join('L')}Z` }));
  ctx.defs.appendChild(basinClip);
  harbour.setAttribute('clip-path', 'url(#lai-basin)');
  const tierGroups: SVGGElement[] = [];
  tiers.forEach((t, ti) => {
    // Ships sink below their row's waterline: clip each row there.
    const clip = s('clipPath', { id: `lai-row-${ti}`, 'data-scene': '' });
    clip.appendChild(s('rect', { x: -200, y: -200, width: 400, height: 200 + t.y + 1.2 }));
    ctx.defs.appendChild(clip);
    const row = s('g');
    const ships = s('g', { 'clip-path': `url(#lai-row-${ti})` });
    t.xs.forEach((x, i) => {
      const b = breakable(clips, { crew: 3 });
      const facing = (i + ti) % 2 ? 1 : -1;
      const place = s('g', { transform: `translate(${x} ${t.y - 1.4}) scale(${facing * t.k} ${t.k})` });
      const bob = s('g');
      bob.appendChild(b.g);
      place.appendChild(bob);
      ships.appendChild(place);
      fleet.push({ b, x, y: t.y, bob });
    });
    row.appendChild(ships);
    // The row's waterline: a strip of small crests in front of the hulls.
    const strip = sea(t.y - 2.6, { crestHeight: 5, foam: false });
    strip.body.remove();
    row.appendChild(strip.g);
    tierGroups.push(row);
    harbour.appendChild(row);
  });

  /* ---------------- Outer sea and the headlands ---------------- */
  const outer = sea(SEA_Y, { crestHeight: 12 });
  root.appendChild(outer.g);
  const cliffs = s('g', { class: 'lai-cliffs' });
  cliffs.appendChild(rock(LEFT_CLIFF, { lines: 8, seed: 11 }));
  cliffs.appendChild(rock(RIGHT_CLIFF, { lines: 8, seed: 17 }));
  root.appendChild(cliffs);

  // The scouts climbing the right headland towards the town.
  const scouts: Figure[] = [];
  const scoutWraps: SVGGElement[] = [];
  for (const x of [150, 168]) {
    const f = new Figure({ head: 'youth', hat: x === 150 ? 'petasos' : 'none', garment: 'short', garmentColor: PURPLE, facing: -1, scale: 0.42 }, POSES.walk(x, rightSkyline(x) / 0.42));
    const w = s('g');
    w.appendChild(f.g);
    root.appendChild(w);
    scouts.push(f);
    scoutWraps.push(w);
  }

  /* ---------------- Odysseus's ship, moored outside to a rock ---------------- */
  const OSHIP = { x: 22, y: SEA_Y + 2, k: 1 };
  const oShipMove = s('g');
  const oShipBob = s('g');
  const oShipPlace = s('g', { transform: `translate(${OSHIP.x} ${OSHIP.y}) scale(${-OSHIP.k} ${OSHIP.k})` });
  const oShip = ship({ palette: BLACK_FIGURE, sail: 'furled', oars: 11, crew: 6 });
  const hero = new Figure({ hat: 'pilos', garment: 'short', garmentColor: PURPLE, cloak: true, facing: -1, scale: 0.52 }, pose({ ...POSES.stand(-33, -3.4 / 0.52), armF: [40, 30], armB: [10, 20] }));
  const sword = xiphos(13);
  oShip.g.insertBefore(hero.g, oShip.hull);
  oShip.g.insertBefore(sword, oShip.hull);
  const placeSword = () => {
    const j = hero.joints();
    const w = hero.toWorld(j.armF.W);
    const ang = -(90 - j.armF.a) + 180;
    sword.setAttribute('transform', `translate(${w[0].toFixed(1)} ${w[1].toFixed(1)}) rotate(${ang.toFixed(1)}) scale(0.52)`);
  };
  placeSword();
  oShipPlace.appendChild(oShip.g);
  oShipBob.appendChild(oShipPlace);
  oShipMove.appendChild(oShipBob);
  root.appendChild(oShipMove);
  /** World position of a point in the ship's local frame (before the ship moves). */
  const shipPt = (x: number, y: number): Vec => [OSHIP.x - x * OSHIP.k, OSHIP.y + y * OSHIP.k];

  // A sea stack off the right headland, and the rope from the stern post.
  const moor = rock([[98, 118], [102, 100], [106, 88], [112, 80], [118, 88], [122, 102], [126, 118]], { lines: 2, seed: 3 });
  root.appendChild(moor);
  const ROCK_PT: Vec = [108, 88];
  const STERN_PT = shipPt(-44.5, -19);
  const ropeA = s('path', { fill: 'none', stroke: INK, 'stroke-width': 1.5, 'stroke-linecap': 'round' });
  const ropeB = s('path', { fill: 'none', stroke: INK, 'stroke-width': 1.5, 'stroke-linecap': 'round' });
  const ropeHit = s('path', { fill: 'none', stroke: 'transparent', 'stroke-width': 14, 'pointer-events': 'stroke' });
  const ropeGroup = s('g', { class: 'lai-rope' });
  ropeGroup.append(ropeA, ropeB, ropeHit);
  root.appendChild(ropeGroup);
  const rope = { sag: 5, cut: 0, dx: 0 };
  /** Draw the rope: taut with some sag; once cut, two ends hang from stern and rock. */
  const drawRope = () => {
    const a: Vec = [STERN_PT[0] + rope.dx, STERN_PT[1]];
    const b = ROCK_PT;
    if (rope.cut <= 0) {
      const mid: Vec = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + rope.sag];
      const d = smoothPath([a, mid, b]);
      ropeA.setAttribute('d', d);
      ropeB.setAttribute('d', '');
      ropeHit.setAttribute('d', d);
      return;
    }
    const c = rope.cut;
    const mid: Vec = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + rope.sag];
    const endA: Vec = [a[0] + (mid[0] - a[0]) * (1 - 0.5 * c) + 2 * c, mid[1] + 12 * c];
    const endB: Vec = [b[0] + (mid[0] - b[0]) * (1 - 0.6 * c), mid[1] + 14 * c];
    ropeA.setAttribute('d', smoothPath([a, [(a[0] + endA[0]) / 2, (a[1] + endA[1]) / 2 + 3 * c], endA]));
    ropeB.setAttribute('d', smoothPath([b, [(b[0] + endB[0]) / 2 + 1, (b[1] + endB[1]) / 2 + 2 * c], endB]));
  };
  drawRope();
  gsap.set(ropeA, { drawSVG: '0%' });

  /* ---------------- Labels and fillers ---------------- */
  const heroLabel = inscription('ΟΔΥΣΣΕΥΣ', -30, 142, { size: 6.2, color: CLAY });
  root.appendChild(heroLabel);
  const kingLabel = inscription('ΑΝΤΙΦΑΤΗΣ', 86, -46, { size: 5.8, color: CLAY });
  kingLabel.style.opacity = '0';
  root.appendChild(kingLabel);
  root.appendChild(fillers([[-96, -104], [96, -110], [-126, -64]], 4.2));

  // Top layer: boulders, splashes, spears.
  const fx = s('g', { class: 'lai-fx' });
  root.appendChild(fx);

  /* ---------------- Helpers ---------------- */
  const giantIdle: gsap.core.Animation[] = [];
  let rowLoop: gsap.core.Timeline | null = null;
  const startIdle = () => {
    fleet.forEach((m, i) => st.loop(gsap.to(m.bob, { y: 0.8, rotation: i % 2 ? 1.2 : -1.2, svgOrigin: '0 0', duration: 1.6 + (i % 4) * 0.25, ease: 'sine.inOut', yoyo: true, repeat: -1 })));
    st.loop(gsap.to(outer.crests, { x: -crestTile(12) * 2, duration: 3.2, ease: 'none', repeat: -1 }));
    st.loop(gsap.to(oShipBob, { y: 1.4, rotation: -0.8, svgOrigin: `${OSHIP.x} ${OSHIP.y}`, duration: 1.9, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    st.loop(gsap.to(rope, { sag: 7, duration: 1.9, ease: 'sine.inOut', yoyo: true, repeat: -1, onUpdate: drawRope }));
  };

  /* ---------------- Beat 1: the king seizes a scout ---------------- */
  let seized = false;
  const holdScout = () => {
    if (!seized) return;
    const [hx, hy] = king.hand('F');
    // The scout dangles from the king's fist (pose space of a 0.42 figure).
    scouts[0].set({ x: hx + 1, y: (hy + 11) / 0.42 });
  };
  const giantsRise = async () => {
    const tl = st.timeline();
    tl.call(() => ctx.audio.sfx('thud'), [], 0.1);
    tl.add(king.to({ y: giantPelvis(-44), lean: 16, head: -4, armF: [96, 30], armB: [40, 50] }, { duration: 1.1, ease: 'power2.out' }), 0);
    tl.to(kingLabel, { opacity: 1, duration: 0.6 }, 0.7);
    // Reach, grab, lift.
    tl.add(king.to({ armF: [62, 44], lean: 24 }, { duration: 0.35, ease: 'power2.in' }), 1.05);
    tl.call(() => {
      seized = true;
      scouts[0].set({ legF: [18, 30], legB: [-12, 40], armF: [150, 20], armB: [120, 30], lean: -6 });
      holdScout();
    }, [], 1.4);
    tl.add(king.to({ armF: [150, 10], lean: 6, head: -12 }, { duration: 0.6, ease: 'power2.out', onUpdate: holdScout }), 1.42);
    tl.add(scouts[0].to({ legF: [-10, 20], legB: [20, 50], armF: [170, 10] }, { duration: 0.28, yoyo: true, repeat: 2, ease: 'sine.inOut', onUpdate: holdScout }), 1.45);
    // The other scout runs for the ships and drops out of sight behind the headland.
    const other = scouts[1];
    const flee = { x: other.pose.x };
    tl.call(() => {
      // (Scaled figures always get a transform, so turning round is safe here.)
      other.style.facing = 1;
      other.render();
    }, [], 1.2);
    tl.to(flee, {
      x: flee.x + 40,
      duration: 1.1,
      ease: 'power1.in',
      onUpdate: () => {
        const ph = flee.x / 5;
        other.set({ x: flee.x, y: rightSkyline(flee.x) / 0.42 - STAND_HEIGHT + 6, lean: 12, legF: [30 + 34 * Math.sin(ph), 50], legB: [30 - 34 * Math.sin(ph), 50] });
      },
    }, 1.2);
    tl.to(scoutWraps[1], { opacity: 0, duration: 0.3 }, 2.1);
    // The left giant comes running at the shouts.
    tl.add(leftGiant.to({ y: giantPelvis(-42), lean: 12, head: -8, armF: [140, 30], armB: [120, 40] }, { duration: 1.2, ease: 'power2.out' }), 0.6);
    tl.call(() => ctx.audio.sfx('thud'), [], 0.8);
    await st.play(tl);
    // Idle: the giants breathe and glower; the captive struggles in the king's fist.
    giantIdle.push(st.loop(leftGiant.to({ lean: 16, armF: [120, 50] }, { duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1 })));
    giantIdle.push(st.loop(scouts[0].to({ legF: [-10, 20], legB: [20, 50], armF: [170, 10] }, { duration: 0.34, ease: 'sine.inOut', yoyo: true, repeat: -1, onUpdate: holdScout })));
    giantIdle.push(st.loop(king.to({ lean: 9, head: -6 }, { duration: 1.3, ease: 'sine.inOut', yoyo: true, repeat: -1, onUpdate: holdScout })));
  };

  /* ---------------- Beat 2: boulders; cut the rope ---------------- */
  interface Shot { g: SVGGElement; wrap: SVGGElement }
  /** A boulder (or spear) in the fx layer, positioned by a wrapper without its own transform. */
  const shot = (el: SVGGElement): Shot => {
    const wrap = s('g');
    wrap.appendChild(el);
    fx.appendChild(wrap);
    return { g: el, wrap };
  };
  const put = (sh: Shot, x: number, y: number, rot = 0) => sh.g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(0)})`);
  /** A white splash rising and falling at (x, y). */
  const splashAt = (x: number, y: number, k = 0.7) => {
    const w = s('g');
    const inner = splash(0, 0, 1, WHITE);
    w.appendChild(inner);
    w.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    fx.appendChild(w);
    const tl = st.timeline({ onComplete: () => w.remove() });
    tl.fromTo(inner, { scale: 0.2, opacity: 1, transformOrigin: '50% 100%' }, { scale: k, duration: 0.35, ease: 'power2.out' }).to(inner, { opacity: 0, y: 4, duration: 0.5, ease: 'power1.in' }, 0.3);
    return tl;
  };
  /** Both hands of a giant, above his head. */
  const grip = (g: Figure): Vec => {
    const a = g.hand('F'), b = g.hand('B');
    return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 6];
  };
  /** One throw: lift a boulder, hurl it along an arc to `target()`, splash. Returns a timeline. */
  const hurl = (g: Figure, target: () => Vec, onLand: (p: Vec) => void, quick = false) => {
    const sh = shot(boulder(8, Math.random() * 10));
    sh.wrap.style.opacity = '0';
    const dir = g === king ? -1 : 1;
    const tl = st.timeline();
    const up = quick ? 0.28 : 0.45;
    tl.set(sh.wrap, { opacity: 1 }, 0.05);
    tl.add(g.to({ armF: [172, 8], armB: [166, 16], lean: -4, head: -14 }, { duration: up, ease: 'power2.out', onUpdate: () => put(sh, ...grip(g)) }), 0);
    tl.add(g.to({ armF: [70, 0], armB: [62, 10], lean: 22, head: 6 }, { duration: 0.22, ease: 'power2.in' }), up + 0.05);
    const fly = { t: 0 };
    let from: Vec = [0, 0];
    let to: Vec = [0, 0];
    tl.call(() => {
      from = grip(g);
      to = target();
    }, [], up + 0.2);
    tl.to(fly, {
      t: 1,
      duration: quick ? 0.55 : 0.7,
      ease: 'none',
      onUpdate: () => {
        const t = fly.t;
        const x = from[0] + (to[0] - from[0]) * t;
        const y = from[1] + (to[1] - from[1]) * t * t - Math.sin(t * Math.PI) * 18;
        put(sh, x, y, dir * t * 300);
      },
    }, up + 0.2);
    tl.call(() => {
      sh.wrap.remove();
      onLand(to);
    }, [], up + 0.2 + (quick ? 0.55 : 0.7));
    // A quick throw is followed at once by the next one: no recovery pose in between.
    if (!quick) tl.add(g.to({ armF: [120, 40], armB: [100, 50], lean: 12, head: 0 }, { duration: 0.4 }), up + 0.3);
    return tl;
  };
  /** A water point in a row, between the moored ships (for the misses). */
  const missPoint = (): Vec => {
    const t = tiers[Math.floor(Math.random() * tiers.length)];
    const x = t.xs[0] + (t.xs[t.xs.length - 1] - t.xs[0]) * Math.random();
    return [x + (Math.random() - 0.5) * 8, t.y - 1];
  };
  const land = (p: Vec, loud = true, strength = 3) => {
    splashAt(p[0], p[1], 0.6);
    if (loud) {
      ctx.audio.sfx('boulder');
      ctx.atlas.shake(strength);
    }
    // Nearby ships rock.
    fleet.forEach((m) => {
      if (Math.abs(m.y - p[1]) < 20 && Math.abs(m.x - p[0]) < 30) st.to(m.bob, { rotation: `+=${(Math.random() - 0.5) * 10}`, svgOrigin: '0 0', duration: 0.2, yoyo: true, repeat: 1, ease: 'power1.inOut' });
    });
  };

  const barrage = async () => {
    giantIdle.forEach((a) => a.kill());
    // The king passes his catch back over the cliff (out of sight), then both giants take up stones.
    const pre = st.timeline();
    pre.add(king.to({ armF: [40, 60], lean: -6 }, { duration: 0.5, onUpdate: holdScout }), 0);
    pre.to(scoutWraps[0], { opacity: 0, duration: 0.4 }, 0.25);
    await st.play(pre);
    seized = false;
    // Keep hurling until the rope is cut.
    let raining = true;
    const inFlight = new Set<gsap.core.Timeline>();
    const volley = async (g: Figure, delay: number) => {
      await st.wait(delay);
      while (raining && !ctx.signal.aborted) {
        const h = hurl(g, missPoint, (p) => land(p));
        inFlight.add(h);
        await st.play(h);
        inFlight.delete(h);
        await st.wait(0.25);
      }
    };
    if (!ctx.reduced) {
      void volley(leftGiant, 0);
      void volley(king, 0.9);
    }
    await ctx.tap(ropeHit, { label: L('Halatı kes', 'Cut the rope') });
    raining = false;
    // Any stone still in the air lands at once, so the giants are free for the next volley.
    inFlight.forEach((h) => h.progress(1));

    // Odysseus draws his sword and cuts the cable.
    const tl = st.timeline();
    tl.add(hero.to({ armF: [170, -10], lean: -6 }, { duration: 0.18, ease: 'power2.out', onUpdate: placeSword }), 0);
    tl.add(hero.to({ armF: [70, 0], lean: 14 }, { duration: 0.14, ease: 'power3.in', onUpdate: placeSword }), 0.2);
    tl.call(() => ctx.audio.sfx('thud'), [], 0.32);
    tl.to(rope, { cut: 1, duration: 0.7, ease: 'power2.out', onUpdate: drawRope }, 0.32);
    tl.call(() => ropeHit.setAttribute('d', ''), [], 0.32);
    // Row for your lives: the ship strains away to the left.
    tl.call(() => {
      rowLoop = st.loop(rowing(oShip.oars, gsap, 2));
    }, [], 0.4);
    tl.add(hero.to({ armF: [120, 60], armB: [60, 40], lean: 4 }, { duration: 0.5, onUpdate: placeSword }), 0.6);
    tl.to(oShipMove, { x: -72, duration: 3.6, ease: 'power1.inOut', onUpdate: () => (rope.dx = Number(gsap.getProperty(oShipMove, 'x'))) }, 0.45);
    tl.to(rope, { cut: 1.3, duration: 3.6, onUpdate: drawRope }, 0.45);
    // The eleven ships are smashed where they lie.
    const order = [5, 1, 9, 3, 7, 0, 10, 4, 8, 2, 6];
    order.forEach((idx, n) => {
      const m = fleet[idx];
      const g = n % 2 ? leftGiant : king;
      const tHit = 1.0 + n * 0.3;
      const hitAt: Vec = [m.x + (Math.random() - 0.5) * 6, m.y - 4];
      tl.add(hurl(g, () => hitAt, (p) => {
        land(p, n % 2 === 0, 6);
        const br = { a: 0, dy: 0 };
        st.to(br, { a: 26 + Math.random() * 10, dy: 64, duration: 1.6, ease: 'power2.in', onUpdate: () => m.b.split(br.a, br.dy) });
        st.to(m.b.g, { opacity: 0, duration: 0.5, delay: 1.1 });
      }, true), Math.max(0, tHit - 0.9));
    });
    // The giants lower their arms after the last stone; the wrecks settle.
    const tLast = 1.0 + (order.length - 1) * 0.3;
    tl.add(king.to({ armF: [120, 40], armB: [100, 50], lean: 12, head: 0 }, { duration: 0.5 }), tLast);
    tl.add(leftGiant.to({ armF: [120, 40], armB: [100, 50], lean: 12, head: 0 }, { duration: 0.5 }), tLast - 0.3);
    tl.call(() => void 0, [], tLast + 1.6);
    const sunk = ctx.atlas.sinkShips(11);
    await Promise.all([st.play(tl), sunk]);
  };

  /* ---------------- Beat 3: the lone ship escapes ---------------- */
  const escape = async () => {
    const tl = st.timeline();
    tl.to(oShipMove, { x: -108, duration: 2.4, ease: 'power1.inOut' }, 0);
    tl.to(heroLabel, { x: -40, duration: 2.4, ease: 'power1.inOut' }, 0);
    tl.to([ropeA, ropeB], { opacity: 0, duration: 0.6 }, 0);
    // He sheathes the sword and looks back at the harbour, hands to his head.
    tl.to(sword, { opacity: 0, duration: 0.3 }, 0.6);
    tl.add(hero.to({ ...POSES.lament(-33, -3.4 / 0.52), head: 10 }, { duration: 0.9 }), 0.7);
    tl.to(skyTint, { opacity: 0.16, duration: 2, ease: 'sine.inOut' }, 0);
    // Wreckage drifts where the ships were.
    const pieces: Array<[number, number, 'plank' | 'oar' | 'stern' | 'shield' | 'mast', number]> = [
      [-40, -58, 'plank', 0.8], [8, -58, 'stern', 0.8], [44, -58, 'oar', 0.8],
      [-50, -14, 'mast', 0.85], [-10, -14, 'shield', 1], [22, -14, 'plank', 0.9], [52, -14, 'stern', 0.9],
      [-30, 28, 'oar', 1], [4, 28, 'plank', 1], [30, 28, 'shield', 1.1],
    ];
    pieces.forEach(([x, y, kind, k], n) => {
      const w = s('g', { opacity: 0 });
      const f = flotsam(kind, k);
      f.setAttribute('transform', `translate(${x} ${y - 1.5}) scale(${k})`);
      w.appendChild(f);
      tierGroups[y < -30 ? 0 : y < 10 ? 1 : 2].appendChild(w);
      tl.to(w, { opacity: 1, duration: 0.6 }, 0.2 + n * 0.08);
      st.loop(gsap.to(w, { y: 1.2, duration: 1.3 + (n % 3) * 0.3, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    });
    // The giants spear the water, like men spearing fish.
    const spearing = async (g: Figure, delay: number) => {
      await st.wait(delay);
      for (let n = 0; n < 60 && !ctx.signal.aborted; n++) {
        const sp = shot(spear([-26, 0], [26, 0], INK, 1.2));
        const target = missPoint();
        const t2 = st.timeline();
        const dir = g === king ? -1 : 1;
        t2.add(g.to({ armB: [176, 20], lean: -2 }, { duration: 0.3, onUpdate: () => put(sp, ...g.hand('B'), dir > 0 ? 20 : 160) }), 0);
        t2.add(g.to({ armB: [80, 10], lean: 20 }, { duration: 0.18, ease: 'power2.in' }), 0.32);
        const fly = { t: 0 };
        let from: Vec = [0, 0];
        t2.call(() => void (from = g.hand('B')), [], 0.4);
        t2.to(fly, {
          t: 1,
          duration: 0.45,
          ease: 'power1.in',
          onUpdate: () => {
            const t = fly.t;
            const x = from[0] + (target[0] - from[0]) * t;
            const y = from[1] + (target[1] - 10 - from[1]) * t;
            const ang = (Math.atan2(target[1] - 10 - from[1], target[0] - from[0]) * 180) / Math.PI;
            put(sp, x, y, ang);
          },
        }, 0.4);
        t2.call(() => void splashAt(target[0], target[1], 0.35), [], 0.85);
        t2.to(sp.wrap, { opacity: 0, duration: 1.2 }, 1.6);
        t2.call(() => sp.wrap.remove(), [], 2.9);
        t2.add(g.to({ armB: [110, 40], lean: 10 }, { duration: 0.4 }), 0.7);
        await st.play(t2);
        await st.wait(0.5 + Math.random() * 0.6);
      }
    };
    if (!ctx.reduced) {
      void spearing(leftGiant, 0.3);
      void spearing(king, 0.9);
    }
    await st.play(tl);
    rowLoop?.timeScale(0.6);
  };

  return {
    enter() {
      const tl = st.timeline();
      tl.from(harbour, { opacity: 0, duration: 0.9, ease: 'power2.out' })
        .from([cliffs, back], { opacity: 0, duration: 0.8 }, 0)
        .from(oShipMove, { x: -70, duration: 1.4, ease: 'power3.out' }, 0.1)
        .from(tierGroups, { y: 16, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power2.out' }, 0.2);
      startIdle();
      return st.play(tl);
    },

    async beat(i) {
      if (i === 0) {
        // The rope is made fast to the rock; the scouts climb towards the town.
        const tl = st.timeline();
        tl.fromTo(ropeA, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1, ease: 'power2.inOut', onComplete: () => void gsap.set(ropeA, { clearProps: 'strokeDasharray,strokeDashoffset' }) }, 0.2);
        tl.add(hero.to({ armF: [70, 20], lean: 16 }, { duration: 0.5, yoyo: true, repeat: 1, onUpdate: placeSword }), 0.2);
        scouts.forEach((f, k) => {
          const x0 = f.pose.x;
          const x1 = x0 - 48;
          const p = { x: x0 };
          tl.to(p, {
            x: x1,
            duration: 2.2,
            ease: 'none',
            onUpdate: () => {
              const ph = (x0 - p.x) / 9;
              f.set({ x: p.x, y: rightSkyline(p.x) / 0.42 - STAND_HEIGHT + 1.6, legF: [6 + 20 * Math.sin(ph), 8], legB: [6 - 20 * Math.sin(ph), 8] });
            },
          }, 0.1 + k * 0.2);
        });
        await st.play(tl);
        return;
      }
      if (i === 1) return giantsRise();
      if (i === 2) return barrage();
      if (i === 3) return escape();
    },

    destroy() {
      st.destroy();
    },
  };
};

