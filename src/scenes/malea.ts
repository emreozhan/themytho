/**
 * Ϛʹ Malea — the storm off the cape.
 * Beat 0: the ships round the rocky cape of Malea under a fair wind.
 * Beat 1: Boreas swoops from the north, blowing; rain, great rolling seas. Hold
 *   and the helmsman steadies the ship — but the storm only grows, and the
 *   sail tears with a thunderclap.
 * Beat 2: the ship is swept away, small, into the dark: the known world ends
 *   at the stream of Ocean that rings the earth.
 */
import { s } from '../lib/dom';
import { gsap } from '../lib/motion';
import { Figure, POSES, pose, INK, CLAY, WHITE, PURPLE } from '../art/figure';
import { inscription, fillers, cloud, lightning, stars, moon, sun } from '../art/kit';
import { waveRing } from '../art/ornaments';
import { rng, range } from '../lib/random';
import { clamp, lerp, smoothPath, type Vec } from '../lib/geometry';
import { stage } from './tools';
import { Galley, RollingSea, armTo, puppet, tondoFlash, shakeGroup, renderLoop, poser } from './avlis.fleet';
import { windGod } from './malea.boreas';
import type { SceneFactory } from '../story/types';
import { L } from '../i18n';

const f1 = (v: number) => (Math.round(v * 10) / 10).toString();
/** Fractional part in [0, 1). */
const frac = (v: number) => ((v % 1) + 1) % 1;

/** Waterline of Odysseus's ship. */
const WL = 58;

/** Long slanting rain streaks whose dashes fall (animate `stroke-dashoffset`). */
function rainSheet(n: number, seed: number, slant = 0.32, width = 1): { g: SVGGElement; lines: SVGPathElement[] } {
  const g = s('g', { class: 'malea-rain', fill: 'none', stroke: WHITE, 'stroke-linecap': 'round' });
  const rand = rng(seed);
  const lines: SVGPathElement[] = [];
  for (let i = 0; i < n; i++) {
    const x = range(rand, -260, 170);
    const L = 420;
    // The dash period divides the (normalised) path length, so the fall loops seamlessly.
    const period = 1 / Math.round(range(rand, 4, 6.49));
    const dash = range(rand, 0.03, 0.06);
    const p = s('path', {
      d: `M${f1(x)} -210l${f1(L * slant)} ${L}`,
      'stroke-width': width,
      pathLength: 1,
      'stroke-dasharray': `${dash.toFixed(3)} ${(period - dash).toFixed(3)}`,
      opacity: range(rand, 0.45, 0.9).toFixed(2),
    });
    lines.push(p);
    g.appendChild(p);
  }
  return { g, lines };
}

/** The cape of Malea: a steep headland with a little shrine of Apollo on top. */
function cape(): SVGGElement {
  const g = s('g', { class: 'malea-cape' });
  const pts: Vec[] = [
    [-210, 220], [-210, -6], [-176, -12], [-150, -6], [-132, -2], [-118, 8], [-110, 22], [-100, 30], [-96, 44],
    [-88, 58], [-80, 70], [-74, 90], [-70, 120], [-66, 220],
  ];
  g.appendChild(s('path', { d: smoothPath(pts, true, 0.2), fill: INK }));
  // Incised strata on the cliff face.
  g.appendChild(
    s('path', {
      d: 'M-150 8q14 -3 26 6M-160 24q24 -4 44 8M-130 40q12 0 22 10M-170 52q30 -6 60 10M-140 78q20 -2 38 10M-176 96q40 -8 82 8',
      fill: 'none',
      stroke: CLAY,
      'stroke-width': 0.8,
      opacity: 0.65,
      'stroke-linecap': 'round',
    }),
  );
  // The shrine: two columns and a pediment.
  const sx = -156, sy = -8;
  g.appendChild(s('path', { d: `M${sx - 13} ${sy}h26v-2.4h-26z M${sx - 10} ${sy - 2.4}h3.4v-15h-3.4z M${sx + 6.6} ${sy - 2.4}h3.4v-15h-3.4z M${sx - 13} ${sy - 17.4}h26v-3h-26z M${sx - 14} ${sy - 20.4}L${sx} ${sy - 28}L${sx + 14} ${sy - 20.4}z`, fill: INK }));
  g.appendChild(s('path', { d: `M${sx - 8} ${sy - 22}L${sx} ${sy - 26}L${sx + 8} ${sy - 22}`, fill: 'none', stroke: CLAY, 'stroke-width': 0.6 }));
  return g;
}

export const scene: SceneFactory = (ctx) => {
  const st = stage(ctx);
  const world = s('g', { class: 'malea' });
  ctx.root.appendChild(world);

  // Storm light: a veil over the clay (under everything painted).
  const veil = s('rect', { x: -200, y: -200, width: 400, height: 400, fill: '#1b120c', opacity: 0, 'pointer-events': 'none' });
  world.appendChild(veil);
  const sky = s('g', { class: 'malea-sky' });
  world.appendChild(sky);
  const fill0 = fillers([[30, -128], [-58, -112], [-20, -150], [52, -64]], 4.2);
  sky.appendChild(fill0);
  const starry = stars(34, { x: -150, y: -160, w: 300, h: 190 }, 31);
  const luna = moon(-70, -104, 9);
  const night = s('g', { opacity: 0 });
  night.append(starry, luna);
  sky.appendChild(night);
  const title = inscription('ΜΑΛΕΙΑ', -150, -52, { size: 8 });
  sky.appendChild(title);
  const sunG = sun(92, -98, 12);
  sky.appendChild(sunG);

  // Gulls round the cape.
  const gullsG = s('g');
  sky.appendChild(gullsG);
  const gulls = [
    [-120, -64, 0.8],
    [-86, -86, 0.6],
    [-40, -58, 0.7],
  ].map(([x, y, k]) => {
    const g = s('g');
    const wings = s('path', { d: 'M0 0C-3 -5 -8 -7 -12 -6C-8 -4 -4 -1 -1 1.4ZM0 0C3 -5 8 -7 12 -6C8 -4 4 -1 1 1.4Z', fill: INK });
    g.append(wings, s('path', { d: 'M-3 0.4C-1 -1 1 -1 3.4 0L5 -0.4L3.6 1C1 2 -1 2 -3 0.4Z', fill: INK }));
    gullsG.appendChild(g);
    return { pp: puppet(g, { x, y, s: k }), wings };
  });

  // Storm clouds rolling along the top of the cup.
  const clouds = s('g', { class: 'malea-clouds', opacity: 0 });
  clouds.append(cloud(-40, -140, 150), cloud(90, -128, 120), cloud(-130, -112, 90));
  let cl = '';
  for (const [x, y, w] of [[-40, -140, 150], [90, -128, 120], [-130, -112, 90]] as Array<[number, number, number]>) cl += `M${x - w / 2 + 8} ${y - 5}H${x + w / 2 - 8}`;
  clouds.appendChild(s('path', { d: cl, stroke: CLAY, 'stroke-width': 0.7, opacity: 0.6 }));
  world.appendChild(clouds);

  // Boreas.
  const boreas = windGod('boreas', { phase: 0.2, wingScale: 0.82, wingSweep: -38 });
  const borG = s('g');
  borG.appendChild(boreas.g);
  const borLabel = inscription('ΒΟΡΕΑΣ', 0, 0, { size: 6.6 });
  const borLabelG = s('g');
  borLabelG.appendChild(borLabel);
  world.append(borG, borLabelG);
  const bor = puppet(borG, { x: -230, y: -220, s: 0.7, r: 24, o: 0 });
  const borL = puppet(borLabelG, { x: -40, y: -150, o: 0 });

  // The far sea and the rest of the fleet.
  const seaBack = new RollingSea(40, { h: 18, ripples: 0, foam: true, seed: 3 });
  world.appendChild(seaBack.g);
  const others = [
    new Galley({ x: 126, y: 44, scale: 0.46, facing: -1, crew: 4, oars: 8, rig: { fill: 1, wind: 1 }, phase: 0.4 }),
    new Galley({ x: 172, y: 52, scale: 0.5, facing: -1, crew: 4, oars: 8, rig: { fill: 1, wind: 1 }, phase: 0.8 }),
  ];
  const othersG = s('g');
  others.forEach((o) => othersG.appendChild(o.g));
  world.appendChild(othersG);

  const capeG = cape();
  world.appendChild(capeG);
  const surf = s('g', { class: 'malea-surf' });
  for (const [x, y, k] of [[-86, 56, 1], [-74, 74, 0.8]] as Array<[number, number, number]>) {
    const p = s('path', { d: 'M-12 0Q-15 -9 -20 -13M-6 0Q-7 -12 -10 -19M0 0Q1 -14 3 -22M6 0Q9 -10 14 -15', fill: 'none', stroke: WHITE, 'stroke-width': 1.8, 'stroke-linecap': 'round', transform: `translate(${x} ${y}) scale(${k})` });
    surf.appendChild(p);
  }
  world.appendChild(surf);

  // Odysseus's ship: heading left to round the cape.
  const ship = new Galley({ x: 46, y: WL, scale: 1.62, facing: -1, crew: 5, oars: 11, mast: 56, sailH: 34, rig: { fill: 1, wind: 1, breathe: 0.8 }, phase: 0.1, halo: true });
  // The helmsman at the stern with the steering oar.
  const helm = s('g', { class: 'malea-helm' });
  helm.appendChild(s('path', { d: 'M-49 16L-27 -21', stroke: INK, 'stroke-width': 1.6, 'stroke-linecap': 'round' }));
  helm.appendChild(s('path', { d: 'M-47.6 11.6L-53 20.6L-50.2 22L-45.4 13.2Z', fill: INK }));
  const HK = 0.3;
  const helmFig = s('g', { transform: `translate(-31 1) scale(${HK})` });
  const helmsman = new Figure({ hat: 'pilos', garment: 'short', garmentColor: PURPLE }, pose({ ...POSES.stand(0, 0), lean: -6 }));
  helmFig.appendChild(helmsman.g);
  helm.appendChild(helmFig);
  ship.deck.appendChild(helm);
  // Grip points on the oar shaft (ship-local), converted into the helmsman's frame.
  const gripAt = (u: number): Vec => {
    const x = lerp(-49, -27, u), y = lerp(16, -21, u);
    return [(x + 31) / HK, (y - 1) / HK];
  };
  const helmPose = (strain: number) => {
    const p = pose({ ...POSES.stand(0, 0), lean: lerp(-4, -20, strain), head: lerp(0, -10, strain), legF: [lerp(8, 30, strain), lerp(4, 16, strain)], legB: [lerp(-8, -22, strain), 4], footB: lerp(0, 16, strain) });
    p.armF = armTo(helmsman, 'F', gripAt(0.86), -1, p);
    p.armB = armTo(helmsman, 'B', gripAt(0.74), -1, p);
    return p;
  };
  helmsman.set(helmPose(0));
  world.appendChild(ship.g);
  const odyLabelG = s('g');
  odyLabelG.appendChild(inscription('ΟΔΥΣΣΕΥΣ', 0, 0, { size: 5.4, angle: 90 }));
  world.appendChild(odyLabelG);

  const seaFront = new RollingSea(66, { h: 24, ripples: 20, foam: true, seed: 9, incised: true });
  world.appendChild(seaFront.g);

  // Rain (two sheets) and lightning.
  const rainA = rainSheet(26, 5, 0.34, 1.1);
  const rainB = rainSheet(18, 12, 0.4, 1.6);
  const rain = s('g', { opacity: 0 });
  rain.append(rainA.g, rainB.g);
  world.appendChild(rain);
  const bolt = lightning([118, -170], [66, -2], 6);
  bolt.setAttribute('opacity', '0');
  world.appendChild(bolt);

  // The stream of Ocean ringing the world, for the last beat.
  const ocean = s('g', { class: 'malea-ocean', opacity: 0 });
  ocean.appendChild(s('circle', { r: 158, fill: 'none', stroke: INK, 'stroke-width': 18 }));
  const ring = waveRing({ rOuter: 150, rInner: 136, units: 28, color: INK });
  ocean.appendChild(ring);
  const oceanLabel = inscription('ΩΚΕΑΝΟΣ', 0, -122, { size: 6.4, align: 'middle', color: WHITE });
  ocean.appendChild(oceanLabel);
  world.appendChild(ocean);
  const oc = puppet(ocean, { s: 1.12, o: 0 });

  const fx = s('g', { class: 'malea-fx' });
  world.appendChild(fx);

  /* ------------------------------ state ------------------------------ */
  const S = {
    storm: 0.12,
    hold: 0,
    wind: 1,
    heelKick: 0,
    shipX: 46,
    shipY: WL,
    shipK: 1.62,
    spin: 0,
    blow: 0,
    rain: 0,
  };
  let lastT = 0;
  const frame = (t: number) => {
    const dt = clamp(t - lastT, 0, 0.1);
    lastT = t;
    const k = S.storm;
    const steady = 1 - 0.78 * S.hold;
    // Seas: rise and run with the storm.
    for (const [sea, sp, ph] of [[seaBack, 16, 0], [seaFront, 26, 1.3]] as Array<[RollingSea, number, number]>) {
      sea.offset += dt * (6 + k * sp * 2.2);
      sea.amp = 0.45 + k * 1.05;
      sea.heave = Math.sin(t * 1.4 + ph) * k * 5;
      sea.place();
    }
    // The ship pitches and rolls; the helmsman's grip steadies it.
    const roll = Math.sin(t * 1.7) * (2 + k * 15 * steady) + k * 10 * steady * (S.wind < 0 ? 1 : 0.2) + S.heelKick;
    ship.yaw = S.spin;
    ship.x = S.shipX;
    ship.y = S.shipY;
    ship.scale = S.shipK;
    ship.roll = roll;
    ship.bob = Math.sin(t * 1.3 + 0.6) * (1.5 + k * 7) * (S.shipK / 1.62);
    ship.rig.wind = S.wind;
    ship.place();
    ship.draw(t);
    for (const o of others) {
      o.roll = Math.sin(t * 1.5 + o.phase * 6) * (2 + k * 14);
      o.bob = Math.sin(t * 1.2 + o.phase * 5) * (1 + k * 5);
      o.rig.wind = S.wind;
      o.place();
      o.draw(t);
    }
    // His name is painted beside the stern (it follows the ship, not its pitching).
    odyLabelG.setAttribute('transform', `translate(${f1(S.shipX + 98)} ${f1(WL - 112)})`);
    boreas.update(t, S.blow);
    rainA.lines.forEach((p, i) => p.setAttribute('stroke-dashoffset', frac(-t * (1.6 + (i % 5) * 0.12) + i * 0.37).toFixed(3)));
    rainB.lines.forEach((p, i) => p.setAttribute('stroke-dashoffset', frac(-t * (2.1 + (i % 4) * 0.15) + i * 0.53).toFixed(3)));
    rain.setAttribute('opacity', f1(S.rain));
    gulls.forEach((gl, i) => gl.wings.setAttribute('transform', `scale(1 ${f1(Math.sin(t * 6 + i * 2))})`));
    // Ocean's stream runs round the rim.
    if (oc.p.o > 0) ring.setAttribute('transform', `rotate(${f1((t * 3) % 360)})`);
  };
  const redraw = renderLoop(st, ctx.reduced, frame);
  const move = poser(st, ctx.reduced);
  gulls.forEach((gl, i) => st.loop(gsap.to(gl.pp.p, { x: `+=${i % 2 ? -18 : 20}`, y: `+=${i % 2 ? 8 : -6}`, duration: 3 + i, ease: 'sine.inOut', yoyo: true, repeat: -1, onUpdate: gl.pp.apply })));
  st.loop(gsap.to(surf.children, { opacity: 0.25, duration: 0.9, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.45 }));
  const rowing = st.loop(ship.row(1));
  others.forEach((o) => st.loop(o.row(0.9)));

  return {
    enter() {
      const tl = st.timeline();
      tl.from(S, { shipX: 150, duration: 1.6, ease: 'power2.out', onUpdate: redraw })
        .from(capeG, { x: -50, opacity: 0, duration: 1.1, ease: 'power3.out' }, 0)
        .from(othersG, { x: 60, opacity: 0, duration: 1.4, ease: 'power2.out' }, 0.2)
        .from(title, { opacity: 0, duration: 0.8 }, 0.8);
      return st.play(tl);
    },

    async beat(i) {
      if (i === 0) {
        // Making for the cape under oar and sail.
        const tl = st.timeline();
        tl.to(S, { shipX: 26, duration: 2.2, ease: 'sine.inOut', onUpdate: redraw }).to(othersG, { x: -26, duration: 2.2, ease: 'sine.inOut' }, 0);
        return st.play(tl);
      }
      if (i === 1) {
        // Zeus sends the north wind.
        ctx.atlas.setWeather('storm');
        ctx.audio.sfx('storm');
        const tl = st.timeline();
        tl.to(veil, { opacity: 0.42, duration: 1.6 }, 0)
          .to(clouds, { opacity: 1, duration: 1.2 }, 0)
          .fromTo(clouds, { x: -60 }, { x: 0, duration: 2, ease: 'power2.out' }, 0)
          .to(bor.p, { x: -100, y: -12, s: 1.5, r: 22, o: 1, duration: 1.6, ease: 'power3.out', onUpdate: bor.apply }, 0.2)
          .to(borL.p, { x: 2, y: -128, o: 1, duration: 0.6, onUpdate: borL.apply }, 1.2)
          .to(S, { blow: 1, duration: 0.8 }, 1.2)
          .to(S, { rain: 0.85, duration: 1.2 }, 0.6)
          .to(S, { storm: 0.7, duration: 2.2, ease: 'power1.in' }, 0.4)
          // The wind comes round ahead: the sail is taken aback.
          .to(S, { wind: -1, duration: 1.2, ease: 'power2.inOut' }, 1.4)
          .to(title, { opacity: 0, duration: 1 }, 0.4)
          .to(sunG, { opacity: 0, duration: 1.4 }, 0.2)
          .to(othersG, { opacity: 0, x: 40, duration: 2.2 }, 0.6)
          .to(gullsG, { opacity: 0, duration: 1 }, 0.4);
        rowing.pause();
        await st.play(tl);
        // The storm keeps growing whatever the helmsman does.
        const grow = st.to(S, { storm: 1.12, duration: 9, ease: 'none' });
        await ctx.hold({
          label: L('Dümeni tut', 'Hold the helm'),
          seconds: 3.4,
          onProgress: (p) => {
            S.hold = p;
            helmsman.set(helmPose(p));
            if (ctx.reduced) redraw();
          },
        });
        grow.kill();
        // The sail tears with a thunderclap.
        ctx.audio.sfx('thunder');
        ctx.atlas.flash();
        ctx.atlas.shake(10);
        const tear = st.timeline();
        if (!ctx.reduced) tear.add(tondoFlash(fx), 0).add(shakeGroup(world, 6), 0);
        tear.set(bolt, { opacity: 1 }, 0)
          .to(ship.rig, { tear: 1, duration: 0.35, ease: 'power2.out' }, 0)
          .to(S, { heelKick: 14, duration: 0.25, ease: 'power2.out', onUpdate: redraw }, 0)
          .to(S, { heelKick: 0, hold: 0.25, duration: 1.2, ease: 'elastic.out(1, 0.5)' }, 0.25)
          .to(bolt, { opacity: 0, duration: 0.6 }, 0.35)
          .call(() => ctx.audio.sfx('storm'), [], 0.3);
        move(helmsman, { ...helmPose(0.2), lean: 12, head: 10 }, { duration: 0.4, delay: 0.1 });
        return st.play(tear);
      }
      if (i === 2) {
        // Swept away beyond the edge of the known world.
        ctx.atlas.setWeather('mist');
        ctx.audio.sfx('wind');
        const tl = st.timeline();
        tl.to(veil, { opacity: 0.72, duration: 2.4 }, 0)
          .to(night, { opacity: 1, duration: 1.6 }, 0.9)
          .to(bor.p, { x: -210, y: -170, s: 0.8, o: 0, duration: 1.8, ease: 'power2.in', onUpdate: bor.apply }, 0)
          .to(borL.p, { o: 0, duration: 0.5, onUpdate: borL.apply }, 0)
          .to(clouds, { opacity: 0, duration: 1.4 }, 0.3)
          .to([capeG, surf], { x: -60, opacity: 0, duration: 1.8, ease: 'power2.in' }, 0)
          .to(othersG, { opacity: 0, duration: 0.8 }, 0)
          .to(S, { rain: 0.2, blow: 0, duration: 1.6 }, 0.4)
          .to(S, { shipK: 0.52, shipX: 44, shipY: 40, duration: 2.8, ease: 'power2.inOut', onUpdate: redraw }, 0)
          .to(S, { spin: 720, duration: 3, ease: 'power1.inOut' }, 0)
          .to(S, { storm: 0.55, duration: 2.4 }, 0.4)
          .to(odyLabelG, { opacity: 0, duration: 0.6 }, 0)
          .to(oc.p, { o: 1, duration: 1.6, onUpdate: oc.apply }, 1.1)
          .to(oc.p, { s: 1, duration: 2, ease: 'power2.out' }, 1.1);
        await st.play(tl);
        S.spin = 0;
        return;
      }
    },

    destroy() {
      st.destroy();
      // The storm and mist belong to this tondo; the next voyage sets its own weather.
      ctx.atlas.setWeather('none');
    },
  };
};
