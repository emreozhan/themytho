/**
 * ΙΕʹ Thrinakia — the cattle of the Sun.
 *
 * 0  Helios rises in his radiant disc over the island; his cattle graze.
 * 1  A month of south wind: the sun goes down, a frieze of moons marks the
 *    month, and the thin, hungry crew fish from the rocks.
 * 2  The forbidden feast, implied: spits over the fire, the hides crawl, the
 *    meat lows on the spits — while Odysseus sleeps apart.
 * 3  The reader looses the sail; the ship puts to sea under gathering clouds.
 * 4  Zeus's thunderbolt: the ship breaks apart, the crew are lost, and
 *    Odysseus alone rides the lashed mast and keel back towards Charybdis.
 */
import { s, nextId } from '../lib/dom';
import { gsap } from '../lib/motion';
import type { Vec } from '../lib/geometry';
import { POSES, pose, INK, CLAY, WHITE, PURPLE } from '../art/figure';
import { Beast } from '../art/animals';
import { inscription, sea, SEA_TILE, fillers, flames, glow, thunderbolt, lightning, reeds, splash, rain, stars } from '../art/kit';
import { ship, rowing, BLACK_FIGURE } from '../art/ship';
import { stage } from './tools';
import type { SceneFactory } from '../story/types';
import { nimbus, moonPath, spit, fork, fish, windStreaks, crag, wreckage, planks, stormCloud } from './thrinakia.art';
import { Actor, poseTo } from './kyklop.rig';
import { L } from '../i18n';

const GROUND = 96;
const SHIP_K = 2.1;

export const scene: SceneFactory = (ctx) => {
  const st = stage(ctx);
  const world = s('g', { class: 'thr' });
  ctx.root.appendChild(world);
  const localShake = (k = 4) =>
    st.to(world, { keyframes: [{ x: -k, y: k * 0.5, duration: 0.05 }, { x: k * 0.8, y: -k * 0.4, duration: 0.05 }, { x: -k * 0.4, y: k * 0.3, duration: 0.06 }, { x: 0, y: 0, duration: 0.08 }], duration: 0.24 });

  /* ================================================================ */
  /* Tableau A: the island                                             */
  /* ================================================================ */
  const island = s('g', { class: 'thr-island' });
  world.appendChild(island);
  const night = s('rect', { x: -200, y: -200, width: 400, height: 400, fill: INK, opacity: 0 });
  island.appendChild(night);
  island.appendChild(fillers([[-132, -30], [-104, -92], [106, -96], [136, -34]], 4.4));

  // Helios rises from behind a bank of cloud, his head in a radiant disc.
  const sunClipId = nextId('thr-sun');
  const sunClip = s('clipPath', { id: sunClipId, 'data-scene': '' });
  sunClip.appendChild(s('rect', { x: -200, y: -240, width: 400, height: 206 }));
  ctx.defs.appendChild(sunClip);
  const sky = s('g', { 'clip-path': `url(#${sunClipId})` });
  const helios = s('g', { class: 'thr-helios' });
  const halo = nimbus(31);
  const heliosFig = new Actor({ head: 'youth', hat: 'diadem', garment: 'short', garmentColor: PURPLE, cloak: true, cloakColor: INK }, pose({ ...POSES.stand(0, 0), lean: 2, head: -4, armF: [128, 20], armB: [100, 36], grip: 0 }), -2, 38, 1.5);
  const headAt = heliosFig.headPoint(0.5, 0);
  halo.g.setAttribute('transform', `translate(${headAt[0].toFixed(1)} ${headAt[1].toFixed(1)})`);
  helios.append(halo.g, heliosFig.g);
  helios.appendChild(inscription('ΗΕΛΙΟΣ', headAt[0] + 58, headAt[1] - 24, { size: 7.2, angle: 90 }));
  sky.appendChild(helios);
  island.appendChild(sky);
  const sunPos = { y: 110 };
  const placeSun = () => helios.setAttribute('transform', `translate(0 ${sunPos.y.toFixed(1)})`);
  placeSun();
  const bank = stormCloud(-4, -30, 190, 3);
  island.appendChild(bank);

  // A month of moons (beat 1), in added white along an arc across the sky.
  const moons = [0, 1, 2, 3, 4, 5, 6].map((k) => {
    const a = ((204 + k * 22) * Math.PI) / 180;
    const at: Vec = [Math.cos(a) * 146, 36 + Math.sin(a) * 146];
    const g = s('g', { transform: `translate(${at[0].toFixed(1)} ${at[1].toFixed(1)})` });
    g.appendChild(s('circle', { r: 10, fill: 'none', stroke: WHITE, 'stroke-width': 0.6, 'stroke-dasharray': '1.2 2' }));
    g.appendChild(s('path', { d: moonPath(10, (k + 1) / 8), fill: WHITE, stroke: INK, 'stroke-width': 0.5 }));
    g.style.opacity = '0';
    island.appendChild(g);
    return g;
  });
  const starry = stars(26, { x: -150, y: -150, w: 300, h: 150 }, 21);
  starry.style.opacity = '0';
  island.appendChild(starry);
  const wind = windStreaks(4);
  wind.style.opacity = '0';
  island.appendChild(wind);

  // The sea all round; the island rises on the right.
  const waves = sea(102, { crestHeight: 16 });
  island.appendChild(waves.g);
  // The fire light of beat 2 sits under the ground so it only warms the air.
  const FIRE_X = 44;
  const fireGlow = glow(ctx.defs, FIRE_X * 1.22, GROUND - 32, 92, WHITE, 0.3);
  fireGlow.style.opacity = '0';
  island.appendChild(fireGlow);
  island.appendChild(s('path', { d: `M-96 140L-90 112C-86 101 -80 ${GROUND} -66 ${GROUND}H200V200H-96Z`, fill: INK }));
  island.appendChild(s('path', { d: `M-64 ${GROUND + 5}H200`, stroke: CLAY, 'stroke-width': 0.6, opacity: 0.5 }));
  [-34, 40, 112].forEach((x, i) => island.appendChild(reeds(x, GROUND, 4 + (i % 2), 13 + (i % 2) * 4)));
  // The rocks at the island's tip, where the starving men fish.
  const ROCK_TOP = 76;
  island.appendChild(crag([[-116, 124], [-112, 102], [-107, 95], [-103, 86], [-96, 84], [-92, ROCK_TOP + 1], [-84, ROCK_TOP], [-78, 80], [-72, 79], [-67, 88], [-63, 96], [-60, 124]], 4));

  // The cattle of the Sun.
  const herd = [
    new Beast('ox', { x: 106, y: GROUND, scale: 1.58, facing: -1 }),
    new Beast('ox', { x: 34, y: GROUND, scale: 1.68, facing: -1 }),
  ];
  const herdLayer = s('g');
  herd.forEach((b) => herdLayer.appendChild(b.g));
  island.appendChild(herdLayer);

  // The fishermen (beat 1): thin and hungry, casting into the sea on the left.
  const anglers = s('g', { class: 'thr-anglers' });
  anglers.style.opacity = '0';
  /** Hunger made visible: the figure is drawn narrower than its fellows. */
  const thin = (a: Actor) => {
    const wrap = s('g', { transform: `translate(${a.x} 0) scale(0.84 1) translate(${-a.x} 0)` });
    wrap.appendChild(a.g);
    return wrap;
  };
  const fisher1 = new Actor({ head: 'bearded', garment: 'rags', garmentColor: INK, facing: -1 }, pose({ ...POSES.stand(0, 0), lean: 16, head: 10, armF: [96, 20], armB: [70, 30], legF: [16, 10], legB: [-12, 6] }), -86, ROCK_TOP + 1, 1.08);
  const fisher2 = new Actor({ head: 'youth', garment: 'rags', facing: -1 }, pose({ ...POSES.sit(0, 0), lean: 26, head: 20, armF: [100, 30], armB: [80, 40], legF: [96, 96], legB: [88, 90] }), -34, GROUND, 1.08);
  const rodTips: Vec[] = [[-146, -18], [-118, 22]];
  const lines = s('g');
  const rods = s('path', { fill: 'none', stroke: INK, 'stroke-width': 1.4, 'stroke-linecap': 'round' });
  const strings = s('path', { fill: 'none', stroke: INK, 'stroke-width': 0.6 });
  lines.append(rods, strings);
  const catchFish = fish();
  const fishWrap = s('g');
  fishWrap.appendChild(catchFish);
  anglers.append(thin(fisher2), thin(fisher1), lines, fishWrap);
  island.appendChild(anglers);
  const toThin = (a: Actor, p: Vec): Vec => [a.x + (p[0] - a.x) * 0.84, p[1]];
  const drawLines = (bob = 0, pull = 0) => {
    const h1 = toThin(fisher1, fisher1.hand('F')), h2 = toThin(fisher2, fisher2.hand('F'));
    const t1: Vec = [rodTips[0][0], rodTips[0][1] + pull * 8];
    const w1: Vec = [t1[0] + pull * 6, 110 + bob - pull * 58];
    rods.setAttribute('d', `M${h1[0].toFixed(1)} ${h1[1].toFixed(1)}Q${((h1[0] + t1[0]) / 2).toFixed(1)} ${(t1[1] - 6).toFixed(1)} ${t1[0]} ${t1[1].toFixed(1)}M${h2[0].toFixed(1)} ${h2[1].toFixed(1)}Q${((h2[0] + rodTips[1][0]) / 2).toFixed(1)} ${(rodTips[1][1] - 5).toFixed(1)} ${rodTips[1][0]} ${rodTips[1][1]}`);
    strings.setAttribute('d', `M${t1[0]} ${t1[1].toFixed(1)}L${w1[0].toFixed(1)} ${w1[1].toFixed(1)}M${rodTips[1][0]} ${rodTips[1][1]}L${rodTips[1][0]} ${(112 - bob).toFixed(1)}`);
    fishWrap.setAttribute('transform', `translate(${w1[0].toFixed(1)} ${(w1[1] + 7).toFixed(1)}) rotate(${(90 + Math.sin(pull * 18) * 28).toFixed(1)})`);
    fishWrap.style.opacity = pull > 0.25 ? '1' : '0';
  };
  drawLines();

  // The feast (beat 2): Odysseus asleep apart, the fire, the spits, the hides.
  const feast = s('g', { class: 'thr-feast' });
  feast.style.opacity = '0';
  const feastBody = s('g', { transform: `translate(0 ${GROUND}) scale(1.22) translate(0 ${-GROUND})` });
  feast.appendChild(feastBody);
  const fire = flames(FIRE_X, GROUND - 2, 1.15);
  const fork1 = fork(38), fork2 = fork(38);
  fork1.setAttribute('transform', `translate(${FIRE_X - 32} ${GROUND})`);
  fork2.setAttribute('transform', `translate(${FIRE_X + 32} ${GROUND})`);
  const spit1 = spit(76, 2);
  spit1.g.setAttribute('transform', `translate(${FIRE_X - 40} ${GROUND - 37})`);
  const spit2 = spit(66, 7);
  spit2.g.setAttribute('transform', `translate(${FIRE_X - 44} ${GROUND - 24}) rotate(-5)`);
  // The flayed hides: empty ox-skins, flat on the ground, creeping on limp legs.
  const skins = [new Beast('ox', { scale: 0.95 }), new Beast('ox', { scale: 0.9, facing: -1 })];
  const hides = skins.map((b) => {
    const g = s('g', { class: 'thr-hide' });
    g.appendChild(b.g);
    return g;
  });
  const hidePos = [
    { x: 20, y: GROUND - 1 },
    { x: 104, y: GROUND - 1 },
  ];
  const placeHides = (t = 0) =>
    hides.forEach((h, k) => {
      const p = hidePos[k];
      const crawl = Math.sin(t * Math.PI * 2 + k * 1.7);
      skins[k].step((t * 2 + k * 0.3) % 1);
      skins[k].nod(28 + crawl * 10);
      h.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y}) scale(1 ${(0.34 + crawl * 0.04).toFixed(3)}) skewX(${(crawl * 10).toFixed(1)})`);
    });
  placeHides();
  const eurylochos = new Actor({ head: 'bearded', garment: 'short', garmentColor: INK }, pose({ ...POSES.sit(0, 0), y: -20, lean: 14, head: 2, armF: [92, 20], armB: [64, 50], legF: [112, 114], legB: [98, 106] }), 0, GROUND, 1.05);
  eurylochos.reach('F', [FIRE_X - 42, GROUND - 37]);
  // Odysseus sleeps apart, turned away from the feast, head sunk on his knees.
  const sleeper = new Actor({ hat: 'pilos', garment: 'short', cloak: true, facing: -1 }, pose({ x: 0, y: -15, lean: 32, head: 42, armF: [84, 66], armB: [74, 78], legF: [114, 112], legB: [106, 106], footF: 8, footB: 8 }), -38, GROUND, 1.0);
  feastBody.append(sleeper.g, fork1, fork2, fire, spit2.g, eurylochos.g, spit1.g, ...hides);
  feastBody.appendChild(inscription('ΕΥΡΥΛΟΧΟΣ', -14, 22, { size: 5.2, angle: 90 }));
  feastBody.appendChild(inscription('ΟΔΥΣΣΕΥΣ', -40, 34, { size: 5.2, align: 'middle' }));
  island.insertBefore(feast, herdLayer);

  /* ================================================================ */
  /* Tableau B: the ship at sea                                        */
  /* ================================================================ */
  const voyage = s('g', { class: 'thr-voyage' });
  voyage.style.display = 'none';
  world.appendChild(voyage);
  const gloom = s('rect', { x: -200, y: -200, width: 400, height: 400, fill: INK, opacity: 0 });
  voyage.appendChild(gloom);
  voyage.appendChild(fillers([[-50, -128], [24, -142], [96, -110], [-110, -80]], 4.4));
  const clouds = [stormCloud(-104, -66, 130, 2), stormCloud(-36, -108, 150, 5), stormCloud(54, -116, 130, 8), stormCloud(120, -70, 110, 11), stormCloud(8, -146, 130, 14)];
  // Wrapped, so GSAP can slide them without overriding their own placement.
  const cloudWraps = clouds.map((c) => {
    const w = s('g');
    w.appendChild(c);
    w.style.opacity = '0';
    voyage.appendChild(w);
    return w;
  });
  const rainG = s('g', { class: 'thr-rain' });
  rainG.appendChild(rain(52, 8));
  rainG.style.opacity = '0';
  voyage.appendChild(rainG);
  const bolt = s('g');
  bolt.appendChild(thunderbolt(84));
  bolt.style.opacity = '0';
  voyage.appendChild(bolt);
  const strike = lightning([-6, -104], [30, 18], 6);
  strike.style.opacity = '0';
  voyage.appendChild(strike);
  const waves2 = sea(62, { crestHeight: 18 });
  voyage.appendChild(waves2.g);
  // Thrinakia behind them on the left.
  voyage.appendChild(crag([[-200, 110], [-200, 10], [-172, 6], [-152, 14], [-138, 30], [-126, 56], [-120, 110]], 12));
  // The ship: one intact hull with a furled sail, one with the sail set,
  // and two clipped halves for the breaking.
  const shipPos = { x: -14, y: 80, rot: 0 };
  const shipWrap = s('g');
  const placeShip = () => shipWrap.setAttribute('transform', `translate(${shipPos.x.toFixed(1)} ${shipPos.y.toFixed(2)}) rotate(${shipPos.rot.toFixed(2)}) scale(${SHIP_K})`);
  placeShip();
  const furled = ship({ palette: BLACK_FIGURE, sail: 'furled', oars: 11, crew: 6 });
  const full = ship({ palette: BLACK_FIGURE, sail: 'full', oars: 11, crew: 6 });
  full.g.style.opacity = '0';
  const helm = new Actor({ hat: 'pilos', garment: 'short', cloak: true }, pose({ ...POSES.stand(0, 0), lean: 6, armF: [40, 24], armB: [-50, 30] }), -33, -3, 0.36);
  shipWrap.append(furled.g, full.g, helm.g);
  const shipHit = s('g', { class: 'thr-ship' });
  const shipPad = s('rect', { x: -60, y: -56, width: 120, height: 70, fill: 'transparent', transform: `translate(${shipPos.x} ${shipPos.y}) scale(${SHIP_K})` });
  shipHit.append(shipPad, shipWrap);
  voyage.appendChild(shipHit);
  const PIVOT = 8;
  const halves = [0, 1].map((k) => {
    const id = nextId('thr-half');
    const cp = s('clipPath', { id, 'data-scene': '' });
    cp.appendChild(s('rect', k === 0 ? { x: -70, y: -70, width: 70 + PIVOT, height: 110 } : { x: PIVOT, y: -70, width: 70, height: 110 }));
    ctx.defs.appendChild(cp);
    const wrap = s('g');
    const clipped = s('g', { 'clip-path': `url(#${id})` });
    clipped.appendChild(ship({ palette: BLACK_FIGURE, sail: k === 0 ? 'full' : 'torn', oars: 11, crew: 6 }).g);
    wrap.appendChild(clipped);
    wrap.style.display = 'none';
    // Behind the waves, so the broken hull sinks into the sea.
    voyage.insertBefore(wrap, waves2.g);
    return { wrap, pos: { rot: 0, dy: 0, dx: 0 } };
  });
  const placeHalves = () =>
    halves.forEach((h) => {
      h.wrap.setAttribute(
        'transform',
        `translate(${shipPos.x.toFixed(1)} ${shipPos.y.toFixed(2)}) scale(${SHIP_K}) translate(${(PIVOT + h.pos.dx).toFixed(1)} ${h.pos.dy.toFixed(1)}) rotate(${h.pos.rot.toFixed(1)}) translate(${-PIVOT} 0)`,
      );
    });
  const debris = planks(9);
  const debrisPos = { x: 0, y: 0 };
  const placeDebris = () => debris.setAttribute('transform', `translate(${debrisPos.x.toFixed(1)} ${debrisPos.y.toFixed(1)}) scale(1.4)`);
  debris.style.opacity = '0';
  voyage.appendChild(debris);
  // The castaway on the lashed mast and keel, half in the waves.
  const raftG = s('g', { class: 'thr-castaway' });
  raftG.style.opacity = '0';
  const raftPos = { x: 0, y: 74, rot: 0, rise: 18 };
  const placeRaft = () => raftG.setAttribute('transform', `translate(${raftPos.x.toFixed(1)} ${(raftPos.y + raftPos.rise).toFixed(1)}) rotate(${raftPos.rot.toFixed(2)})`);
  placeRaft();
  const raftBody = s('g', { transform: 'scale(1.35)' });
  raftBody.appendChild(wreckage());
  raftG.appendChild(raftBody);
  const castaway = new Actor({ hat: 'pilos', garment: 'short', cloak: true }, pose({ x: 0, y: -12, lean: 62, head: -36, armF: [28, 40], armB: [14, 56], legF: [-58, 24], legB: [-72, 30], footF: 30, footB: 30 }), -2, 4, 0.95);
  raftG.appendChild(castaway.g);
  raftG.appendChild(inscription('ΟΔΥΣΣΕΥΣ', -48, -96, { size: 7 }));
  voyage.appendChild(raftG);
  const frontWaves = sea(84, { crestHeight: 14, foam: false });
  frontWaves.g.style.opacity = '0';
  voyage.appendChild(frontWaves.g);
  const splashG = s('g');
  splashG.appendChild(splash(0, 0, 2.2));
  splashG.style.opacity = '0';
  voyage.appendChild(splashG);
  const flashRect = s('rect', { x: -200, y: -200, width: 400, height: 400, fill: WHITE, opacity: 0, 'pointer-events': 'none' });
  voyage.appendChild(flashRect);

  /* ================================================================ */
  /* Idle life                                                         */
  /* ================================================================ */
  st.loop(gsap.to(waves.crests, { x: -SEA_TILE, duration: 3, ease: 'none', repeat: -1 }));
  st.loop(gsap.to(halo.rays, { rotation: 360, svgOrigin: '0 0', duration: 50, ease: 'none', repeat: -1 }));
  // Grazing: each ox ambles a few steps, then lowers its head to the grass.
  const grazing: gsap.core.Animation[] = [];
  herd.forEach((b, k) => {
    const home = b.x;
    const p = { t: 0 };
    grazing.push(
      st.loop(
        gsap.to(p, {
          t: 1,
          duration: 6.5 + k * 1.5,
          ease: 'none',
          repeat: -1,
          delay: k * 1.1,
          onUpdate: () => {
            const u = p.t;
            const walking = u < 0.3;
            const w = Math.min(u, 0.3) / 0.3;
            b.moveTo(home + Math.sin(w * Math.PI) * 9 * b.facing);
            if (walking) b.step((w * 2) % 1);
            const graze = walking ? Math.sin(w * Math.PI) * -6 : 26 + Math.sin(u * 34) * 5;
            b.nod(graze);
          },
        }),
      ),
    );
  });

  return {
    enter() {
      const tl = st.timeline();
      tl.to(sunPos, { y: 0, duration: 2.2, ease: 'power2.out', onUpdate: placeSun }, 0.1);
      tl.from(herd.map((b) => b.g), { opacity: 0, duration: 1, stagger: 0.25 }, 0);
      return st.play(tl);
    },

    async beat(i) {
      if (i === 0) {
        // The Sun's cattle low; the god's rays flare.
        ctx.audio.sfx('moo');
        const tl = st.timeline();
        tl.to(halo.g, { scale: 1.1, transformOrigin: '50% 50%', duration: 0.6, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 0);
        tl.add(poseTo(heliosFig.fig, { armF: [150, 10], head: -8 }, { duration: 0.8, yoyo: true, repeat: 1, ease: 'sine.inOut' }), 0);
        return st.play(tl);
      }

      if (i === 1) {
        // A month of the south wind: sun down, moon after moon, hunger.
        ctx.audio.sfx('wind');
        const tl = st.timeline();
        tl.to(sunPos, { y: 120, duration: 1.0, ease: 'power2.in', onUpdate: placeSun }, 0);
        tl.to(night, { opacity: 0.22, duration: 1.0 }, 0.3);
        tl.to(wind, { opacity: 1, duration: 0.4 }, 0.1);
        tl.fromTo(wind, { x: -40 }, { x: 40, duration: 2.6, ease: 'none' }, 0.1);
        tl.to(wind, { opacity: 0.3, duration: 0.6 }, 2.1);
        moons.forEach((m, k) => {
          tl.fromTo(m, { opacity: 0, scale: 0.3, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' }, 0.7 + k * 0.24);
          if (k < 6) tl.to(m, { opacity: 0.45, duration: 0.4 }, 1.0 + k * 0.24);
        });
        tl.to(anglers, { opacity: 1, duration: 0.8 }, 0.5);
        tl.to(herd.map((b) => b.g), { opacity: 0.85, duration: 0.8 }, 0.5);
        await st.play(tl);
        // Idle: the lines twitch; now and then a fish is landed.
        const tug = { p: 0, b: 0 };
        st.loop(gsap.to(tug, { b: 3, duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: -1, onUpdate: () => drawLines(tug.b, tug.p) }));
        st.loop(gsap.to(tug, { p: 1, duration: 0.8, ease: 'power2.out', yoyo: true, repeat: -1, repeatDelay: 2.4, delay: 0.6 }));
        st.loop(poseTo(fisher2.fig, { lean: 32, head: 26 }, { duration: 1.9, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
        return;
      }

      if (i === 2) {
        // Night: the cattle are gone; hides crawl and the meat lows on the spits.
        grazing.forEach((g) => g.kill());
        const tl = st.timeline();
        tl.to(herd.map((b) => b.g), { opacity: 0, duration: 0.7, stagger: 0.12 }, 0);
        tl.to([anglers, wind], { opacity: 0, duration: 0.5 }, 0);
        tl.to(night, { opacity: 0.32, duration: 0.8 }, 0);
        tl.to(moons.slice(0, 6), { opacity: 0, duration: 0.6 }, 0);
        tl.to(bank, { opacity: 0, duration: 0.8 }, 0);
        tl.to(starry, { opacity: 0.9, duration: 1.2 }, 0.3);
        tl.to([feast, fireGlow], { opacity: 1, duration: 0.8 }, 0.4);
        tl.call(() => ctx.audio.sfx('fire'), [], 0.4);
        tl.call(() => ctx.audio.sfx('moo'), [], 1.3);
        const crawl = { t: 0 };
        tl.to(hidePos[0], { x: 34, duration: 2, ease: 'sine.inOut' }, 0.6);
        tl.to(hidePos[1], { x: 92, duration: 2, ease: 'sine.inOut' }, 0.6);
        tl.to(crawl, { t: 2, duration: 2, ease: 'none', onUpdate: () => placeHides(crawl.t) }, 0.6);
        // The meat trembles and lows.
        tl.to([spit1.meat, spit2.meat], { y: -1.8, duration: 0.07, yoyo: true, repeat: 11, ease: 'none' }, 1.3);
        await st.play(tl);
        st.loop(gsap.to(fire.querySelectorAll('.kit-flame__tongue'), { scaleY: 0.82, transformOrigin: '50% 100%', duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.1 }));
        st.loop(gsap.to(fireGlow, { attr: { r: 72 }, duration: 0.5, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
        const c2 = { t: 0 };
        st.loop(gsap.to(c2, { t: 1, duration: 2.4, ease: 'none', repeat: -1, onUpdate: () => placeHides(c2.t) }));
        const low = st.timeline({ repeat: -1, repeatDelay: 2.6 });
        low.to([spit1.meat, spit2.meat], { y: -1.6, duration: 0.07, yoyo: true, repeat: 7, ease: 'none' });
        st.loop(low);
        st.loop(poseTo(sleeper.fig, { lean: 29, head: 46 }, { duration: 1.9, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
        return;
      }

      if (i === 3) {
        // Cut to the shore: the ship, sail furled, waits for the reader.
        const cut = st.timeline();
        cut.to(island, { opacity: 0, duration: 0.6 })
          .set(island, { display: 'none' })
          .set(voyage, { display: 'inline' })
          .fromTo(voyage, { opacity: 0 }, { opacity: 1, duration: 0.7 });
        await st.play(cut);
        st.loop(gsap.to(waves2.crests, { x: -SEA_TILE, duration: 2.2, ease: 'none', repeat: -1 }));
        st.loop(gsap.to(shipPos, { rot: 0.8, y: 81, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1, onUpdate: placeShip }));
        if (ctx.signal.aborted) return;
        await ctx.tap(shipHit, { label: L('Yelkeni aç ve denize çık', 'Raise the sail and put to sea') });
        if (ctx.signal.aborted) return;
        shipPad.remove();
        ctx.audio.sfx('depart');
        const tl = st.timeline();
        tl.to(full.g, { opacity: 1, duration: 0.4 }, 0).to(furled.g, { opacity: 0, duration: 0.4 }, 0);
        tl.call(() => void st.loop(rowing(full.oars, gsap, 1.1)), [], 0.1);
        tl.to(shipPos, { x: 22, duration: 2.4, ease: 'power1.inOut', onUpdate: placeShip }, 0.2);
        tl.call(() => {
          ctx.atlas.setMood('storm');
          ctx.audio.sfx('storm');
        }, [], 0.8);
        cloudWraps.forEach((c, k) => tl.fromTo(c, { opacity: 0, y: -60 }, { opacity: 1, y: 0, duration: 1.4, ease: 'power2.out' }, 0.8 + k * 0.14));
        tl.to(gloom, { opacity: 0.32, duration: 1.6 }, 0.8);
        tl.to(rainG, { opacity: 1, duration: 1.2 }, 1.4);
        tl.call(() => void st.loop(gsap.fromTo(rainG, { y: -20, x: 7 }, { y: 20, x: -7, duration: 0.5, ease: 'none', repeat: -1 })), [], 1.4);
        await st.play(tl);
        if (ctx.signal.aborted) return;
        await ctx.atlas.sail('kalkis');
        return;
      }

      if (i === 4) {
        // Zeus hurls the thunderbolt.
        const from: Vec = [-30, -150];
        const target: Vec = [shipPos.x + 4 * SHIP_K, shipPos.y - 50 * SHIP_K];
        const tl = st.timeline();
        tl.set(bolt, { opacity: 1 }, 0);
        const fly = { t: 0 };
        tl.to(fly, {
          t: 1,
          duration: 0.45,
          ease: 'power2.in',
          onUpdate: () => {
            const x = from[0] + (target[0] - from[0]) * fly.t, y = from[1] + (target[1] - from[1]) * fly.t;
            bolt.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(-24 + 12 * fly.t).toFixed(1)})`);
          },
        }, 0);
        tl.call(() => {
          strike.setAttribute('d', lightning(from, [target[0], target[1] + 40], 6).getAttribute('d') ?? '');
          ctx.audio.sfx('thunder');
          ctx.atlas.flash();
          ctx.atlas.shake(12);
          localShake(7);
        }, [], 0.45);
        tl.set(strike, { opacity: 1 }, 0.45).to(strike, { opacity: 0, duration: 0.5, ease: 'power2.in' }, 0.6);
        tl.fromTo(flashRect, { opacity: 0.85 }, { opacity: 0, duration: 0.8, ease: 'power2.out', immediateRender: false }, 0.45);
        tl.to(bolt, { opacity: 0, duration: 0.35 }, 0.85);
        // The ship breaks apart and goes down with her crew.
        tl.call(() => {
          shipWrap.style.display = 'none';
          halves.forEach((h) => (h.wrap.style.display = 'inline'));
          placeHalves();
        }, [], 0.46);
        tl.to(halves[0].pos, { rot: -26, dx: -8, dy: 30, duration: 1.8, ease: 'power2.in', onUpdate: placeHalves }, 0.5);
        tl.to(halves[1].pos, { rot: 32, dx: 10, dy: 34, duration: 1.8, ease: 'power2.in', onUpdate: placeHalves }, 0.55);
        tl.call(() => {
          splashG.setAttribute('transform', `translate(${shipPos.x.toFixed(1)} ${shipPos.y - 16})`);
          ctx.audio.sfx('splash');
        }, [], 1.3);
        tl.fromTo(splashG, { opacity: 1 }, { opacity: 0, duration: 0.9, immediateRender: false }, 1.3);
        tl.call(() => {
          debrisPos.x = shipPos.x + 30;
          debrisPos.y = shipPos.y - 20;
          placeDebris();
        }, [], 1.4);
        tl.to(debris, { opacity: 1, duration: 0.5 }, 1.4);
        // Odysseus alone, on the lashed mast and keel.
        tl.set(frontWaves.g, { opacity: 1 }, 1.8);
        tl.to(raftG, { opacity: 1, duration: 0.9 }, 2.0);
        tl.to(raftPos, { rise: 0, duration: 0.9, ease: 'power2.out', onUpdate: placeRaft }, 2.0);
        await st.play(tl);
        halves.forEach((h) => (h.wrap.style.display = 'none'));
        st.loop(gsap.to(raftPos, { rot: 3, y: 76, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1, onUpdate: placeRaft }));
        st.loop(gsap.to(frontWaves.crests, { x: -SEA_TILE, duration: 1.6, ease: 'none', repeat: -1 }));
        st.loop(poseTo(castaway.fig, { lean: 58, head: -30, legF: [-50, 30] }, { duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
        st.to(debrisPos, { x: debrisPos.x + 40, duration: 8, ease: 'none', onUpdate: placeDebris });
        st.to(debris, { opacity: 0.6, duration: 8, ease: 'none' });
        await ctx.atlas.sinkShips(1);
        ctx.hud.setShips(0);
        if (ctx.signal.aborted) return;
        st.to(raftPos, { x: 34, duration: 5, ease: 'none', onUpdate: placeRaft });
        await ctx.atlas.sail('surukleniş');
        ctx.hud.setYear(12);
        return;
      }
    },

    destroy() {
      st.destroy();
    },
  };
};
