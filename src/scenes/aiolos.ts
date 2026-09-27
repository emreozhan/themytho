/**
 * Θʹ Aiolos — the floating island of the winds.
 * Beat 0: white-haired Aiolos welcomes Odysseus before the bronze rampart of
 *   his floating island.
 * Beat 1: he hands over the ox-hide bag with the winds bound inside; it
 *   swells and kicks with them.
 * Beat 2: nine days under a gentle Zephyros; Odysseus nods off at the helm
 *   while the fires of Ithaca come into sight.
 * Beat 3: tap the silver cord — the bag bursts, the winds spiral out and blow
 *   the ship all the way back.
 * Beat 4: Aiolos shuts the bronze gate on them: “Begone!”
 */
import { s } from '../lib/dom';
import { gsap } from '../lib/motion';
import { Figure, POSES, pose, INK, WHITE, PURPLE } from '../art/figure';
import { inscription, fillers, sun } from '../art/kit';
import { clamp, lerp, type Vec } from '../lib/geometry';
import { stage } from './tools';
import { Galley, RollingSea, windPath, armTo, headFrame, puppet, tondoFlash, shakeGroup, renderLoop, poser } from './avlis.fleet';
import { windGod, type WindName } from './malea.boreas';
import { askos, rampart, floatingIsland, ithacaShore } from './aiolos.art';
import type { SceneFactory } from '../story/types';

const f1 = (v: number) => (Math.round(v * 10) / 10).toString();

/** Island ground (top of the floating rock). */
const GI = 44;
/** At sea: the ship's waterline. */
const WL = 84;

const fillAbout = (k: number, g: number, x = 0) => `translate(${x} ${g}) scale(${k}) translate(${-x} ${-g})`;

/** A small spiral of wind (for the island's sky and the burst). */
function curl(x: number, y: number, r: number, dir: 1 | -1 = 1): SVGPathElement {
  return s('path', { d: windPath(x - dir * r * 3, y, r * 3, r * 0.4, r, dir, true), fill: 'none', stroke: INK, 'stroke-width': 1.2, 'stroke-linecap': 'round' });
}

export const scene: SceneFactory = (ctx) => {
  const st = stage(ctx);
  const world = s('g', { class: 'aiolos' });
  ctx.root.appendChild(world);

  /* ===================== Tableau 1: the floating island ===================== */
  const T1 = s('g', { class: 'aiolos-isle' });
  world.appendChild(T1);
  T1.appendChild(fillers([[-40, -140], [60, -134], [130, -96], [-122, -96]], 4.2));
  // Little winds playing round the island.
  const skyCurls = s('g', { class: 'aiolos-curls' });
  skyCurls.append(curl(-70, -118, 6, 1), curl(100, -124, 5, -1), curl(20, -150, 4, 1), curl(-150, -40, 5, 1));
  T1.appendChild(skyCurls);
  const sea1 = new RollingSea(118, { h: 12, ripples: 8, seed: 4 });
  T1.appendChild(sea1.g);
  // `isleIn` carries the entrance, `isle` the idle bob on the winds.
  const isleIn = s('g');
  const isle = s('g', { class: 'aiolos-isle__float' });
  isleIn.appendChild(isle);
  T1.appendChild(isleIn);
  // Winds curling under the floating rock.
  const under = s('g');
  const underCurls = [curl(-70, 104, 6, 1), curl(58, 110, 5, -1), curl(120, 92, 5, -1), curl(-120, 84, 4, 1)];
  under.append(...underCurls);
  isle.appendChild(under);
  isle.appendChild(floatingIsland(GI));
  const wall = rampart(GI, { from: -134, to: 134, height: 76, gate: -92, towers: [-124, 124] });
  wall.setGate(1);
  isle.appendChild(wall.g);

  const figs1 = s('g', { transform: fillAbout(1.26, GI) });
  isle.appendChild(figs1);
  const AEX = -34;
  const aiolos = new Figure(
    { head: 'old', hair: WHITE, hat: 'diadem', garment: 'long', garmentColor: PURPLE, cloak: true, cloakColor: INK },
    pose({ ...POSES.stand(AEX, GI), armF: [70, 22], armB: [30, 40], grip: 0 }),
  );
  // His sceptre, held in the far hand and planted before him.
  const scX = AEX + 15;
  aiolos.set({ armB: armTo(aiolos, 'B', [scX - 1.4, GI - 58], 1) });
  const sceptre = s('g');
  sceptre.appendChild(s('path', { d: `M${scX} ${GI}V${GI - 118}`, stroke: INK, 'stroke-width': 1.6, 'stroke-linecap': 'round' }));
  sceptre.appendChild(s('path', { d: `M${scX - 4} ${GI - 118}q4 -6 8 0q-4 -2 -8 0Zm4 -5a2.4 2.4 0 1 0 0.1 0Z`, fill: INK }));
  const ODX = 46;
  const ody = new Figure({ hat: 'pilos', garment: 'short', cloak: true, cloakColor: PURPLE, facing: -1 }, pose({ ...POSES.stand(ODX, GI), armF: [52, 30], armB: [-8, 20] }));
  // Companions for the last beat (hidden until then).
  const comp1 = new Figure({ head: 'bearded', garment: 'short', garmentColor: INK, facing: -1 }, POSES.lament(80, GI));
  const comp2 = new Figure({ head: 'youth', garment: 'short', garmentColor: PURPLE, facing: -1 }, POSES.lament(103, GI));
  const crew = s('g', { opacity: 0 });
  crew.append(comp1.g, comp2.g);
  // Odysseus steps in on a plain wrapper (the figure's own transform carries its facing).
  const odyIn = s('g');
  odyIn.appendChild(ody.g);
  figs1.append(sceptre, aiolos.g, crew, odyIn);
  // The bag of winds (appears in beat 1).
  // Mirrored, so the tied neck points up toward Aiolos, who holds it by the cord.
  const bag1 = askos();
  const bag1G = s('g');
  const bag1Flip = s('g', { transform: 'scale(-1 1)' });
  bag1Flip.appendChild(bag1.g);
  bag1G.appendChild(bag1Flip);
  figs1.appendChild(bag1G);
  const bag1P = puppet(bag1G, { x: AEX + 34, y: GI - 50, s: 0.1, o: 0 });
  const bagLeak = s('g', { opacity: 0 });
  bagLeak.append(curl(0, 0, 3, 1), curl(6, -6, 2.4, 1));
  figs1.appendChild(bagLeak);
  // Speech painted from his mouth, as on the vases: ΕΡΡΕ, “Begone!”
  const speech = inscription('ΕΡΡΕ', 0, 0, { size: 5.6 });
  const speechG = s('g', { opacity: 0 });
  speechG.appendChild(speech);
  figs1.appendChild(speechG);
  const aeLabel = inscription('ΑΙΟΛΟΣ', AEX - 22, GI - 118, { size: 6, angle: 90 });
  const odLabel = inscription('ΟΔΥΣΣΕΥΣ', ODX + 20, GI - 112, { size: 5.6, angle: 90 });
  figs1.append(aeLabel, odLabel);

  /* ===================== Tableau 2: at sea ===================== */
  const T2 = s('g', { class: 'aiolos-voyage', opacity: 0, visibility: 'hidden' });
  world.appendChild(T2);
  T2.appendChild(fillers([[30, -146], [100, -120], [-20, -112]], 4));
  const sunG = sun(118, -96, 10);
  T2.appendChild(sunG);
  const ithaca = ithacaShore(WL - 6);
  const ithG = s('g');
  ithG.appendChild(ithaca.g);
  const ithLabel = inscription('ΙΘΑΚΗ', 128, -8, { size: 6.4 });
  ithG.appendChild(ithLabel);
  T2.appendChild(ithG);
  const ith = puppet(ithG, { x: 120, o: 0 });

  // Zephyros, the one wind left free, blowing gently from the west.
  const zeph = windGod('zephyros', { phase: 0.6, wingScale: 0.9, wingSweep: -24 });
  const zephG = s('g');
  zephG.appendChild(zeph.g);
  T2.appendChild(zephG);
  const zp = puppet(zephG, { x: -134, y: -30, s: 0.62, r: 4 });
  const zephLabel = inscription('ΖΕΦΥΡΟΣ', -148, 2, { size: 5.4 });
  T2.appendChild(zephLabel);

  const voyage = new Galley({ x: -14, y: WL, scale: 1.95, crew: 4, oars: 11, mast: 60, sailH: 36, rig: { fill: 0.85, wind: 1, breathe: 0.7 }, phase: 0.3, halo: true });
  // Odysseus at the helm, the steering oar in his hands.
  const HK = 0.3;
  const helm = s('g');
  helm.appendChild(s('path', { d: 'M-49 16L-28 -20', stroke: INK, 'stroke-width': 1.6, 'stroke-linecap': 'round' }));
  helm.appendChild(s('path', { d: 'M-47.6 11.6L-53 20.6L-50.2 22L-45.4 13.2Z', fill: INK }));
  const helmFig = s('g', { transform: `translate(-33 1) scale(${HK})` });
  const helmsman = new Figure({ hat: 'pilos', garment: 'short', garmentColor: PURPLE }, POSES.stand(0, 0));
  helmFig.appendChild(helmsman.g);
  helm.appendChild(helmFig);
  const gripAt = (u: number): Vec => [(lerp(-49, -28, u) + 33) / HK, (lerp(16, -20, u) - 1) / HK];
  const helmPose = (sleep: number, alarm = 0) => {
    const p = pose({ ...POSES.stand(0, 0), lean: lerp(-4, 14, sleep) - alarm * 10, head: lerp(0, 34, sleep) - alarm * 30 });
    if (alarm > 0.5) {
      p.armF = [150, 20];
      p.armB = [120, 40];
      p.grip = 0;
    } else {
      p.armF = armTo(helmsman, 'F', gripAt(0.86 - sleep * 0.3), -1, p);
      p.armB = armTo(helmsman, 'B', gripAt(0.72 - sleep * 0.3), -1, p);
    }
    return p;
  };
  helmsman.set(helmPose(0));
  voyage.deck.appendChild(helm);
  // The bag, lashed on deck before the mast; two companions forward of it.
  const bag2 = askos();
  const bag2G = s('g', { transform: 'translate(15 -10) scale(0.62)' });
  bag2G.appendChild(bag2.g);
  voyage.deck.appendChild(bag2G);
  const CK = 0.28;
  const mate = (x: number, style: ConstructorParameters<typeof Figure>[0]) => {
    const g = s('g', { transform: `translate(${x} 1) scale(${CK})` });
    const f = new Figure(style, pose({ ...POSES.stand(0, 0), lean: 6, armF: [40, 30], armB: [20, 30] }));
    g.appendChild(f.g);
    voyage.deck.appendChild(g);
    return { g, f, x };
  };
  const mateA = mate(32, { head: 'bearded', garment: 'short', garmentColor: INK });
  const mateB = mate(42, { head: 'youth', garment: 'short', garmentColor: PURPLE });
  T2.appendChild(voyage.g);
  // His name painted beside him at the helm (it follows the ship, not its rolling).
  const odyAtSea = s('g');
  odyAtSea.appendChild(inscription('ΟΔΥΣΣΕΥΣ', 0, 0, { size: 5.4, angle: 90 }));
  T2.appendChild(odyAtSea);
  const sea2 = new RollingSea(WL - 4, { h: 13, ripples: 16, seed: 12, foam: true });
  T2.appendChild(sea2.g);

  // The four winds, waiting in the bag.
  const WINDS: Array<{ name: WindName; label: string; to: Vec; facing: 1 | -1; k: number }> = [
    { name: 'boreas', label: 'ΒΟΡΕΑΣ', to: [70, -112], facing: -1, k: 0.56 },
    { name: 'notos', label: 'ΝΟΤΟΣ', to: [136, -52], facing: -1, k: 0.5 },
    { name: 'euros', label: 'ΕΥΡΟΣ', to: [-72, -118], facing: 1, k: 0.52 },
  ];
  const winds = WINDS.map((w, i) => {
    const god = windGod(w.name, { phase: i * 0.37, wingScale: 0.9, wingSweep: -22 });
    const mirror = s('g', { transform: `scale(${w.facing} 1)` });
    mirror.appendChild(god.g);
    const outer = s('g');
    outer.appendChild(mirror);
    const lab = inscription(w.label, -10, 18, { size: 10.5, align: 'middle' });
    lab.setAttribute('opacity', '0');
    outer.appendChild(lab);
    T2.appendChild(outer);
    return { ...w, god, pp: puppet(outer, { o: 0, s: 0.05 }), lab };
  });
  const swirl = s('g', { class: 'aiolos-swirl', opacity: 0 });
  for (let i = 0; i < 8; i++) {
    const p = s('path', { d: windPath(6, 0, 16 + (i % 3) * 5, 3, 5 + (i % 3), 1, i % 2 === 0), fill: 'none', stroke: i % 2 ? WHITE : INK, 'stroke-width': 1.4, 'stroke-linecap': 'round', transform: `rotate(${i * 45})` });
    swirl.appendChild(p);
  }
  T2.appendChild(swirl);
  const swirlP = puppet(swirl, { o: 0, s: 0.2 });
  const fx = s('g');
  world.appendChild(fx);

  /* ===================== State & frame loop ===================== */
  const S = {
    bag: 0, // bag1 pulse strength
    bag2: 0.5,
    storm: 0.15,
    shipX: -14,
    wind: 1,
    sleep: 0,
    alarm: 0,
    zephBlow: 0.7,
    windsOut: 0,
  };
  let lastT = 0;
  const frame = (t: number) => {
    const dt = clamp(t - lastT, 0, 0.1);
    lastT = t;
    // The bag of winds kicks and swells.
    const kick = (ph: number) => Math.sin(t * 3.3 + ph) * 0.6 + Math.sin(t * 7.1 + ph * 2) * 0.3 + Math.max(0, Math.sin(t * 1.7 + ph)) ** 8 * 1.4;
    if (T1.style.visibility !== 'hidden') {
      // Island bobs on its winds.
      isle.setAttribute('transform', `translate(0 ${f1(Math.sin(t * 0.9) * 1.6)})`);
      sea1.offset += dt * 5;
      sea1.place();
      underCurls.forEach((p, i) => p.setAttribute('opacity', f1(0.55 + 0.45 * Math.sin(t * 2 + i))));
      bag1.pose(1 + S.bag * 0.06 * kick(0), 1 - S.bag * 0.03 * kick(1.3), S.bag * 4 * Math.sin(t * 2.3));
    }
    if (T2.style.visibility !== 'visible') return;
    if (S.bag2 > 0) bag2.pose(1 + S.bag2 * 0.06 * kick(2), 1 - S.bag2 * 0.03 * kick(0.4), S.bag2 * 3 * Math.sin(t * 2.1));
    // At sea.
    const k = S.storm;
    sea2.offset += dt * (8 + k * 40) * (S.wind >= 0 ? -1 : 1);
    sea2.amp = 0.55 + k * 1.1;
    sea2.heave = Math.sin(t * 1.3) * k * 4;
    sea2.place();
    voyage.x = S.shipX;
    voyage.rig.wind = S.wind;
    voyage.roll = Math.sin(t * 1.5) * (1.4 + k * 13) + (S.wind < 0 ? k * 6 : 0);
    voyage.bob = Math.sin(t * 1.2 + 0.5) * (1.2 + k * 5);
    voyage.place();
    voyage.draw(t);
    odyAtSea.setAttribute('transform', `translate(${f1(S.shipX - 72)} -34)`);
    zeph.update(t, S.zephBlow);
    winds.forEach((w, i) => {
      w.god.update(t, S.windsOut);
      if (S.windsOut >= 1) {
        // Hover round their stations, blowing.
        w.pp.p.x = w.to[0] + Math.sin(t * 0.8 + i * 2) * 6;
        w.pp.p.y = w.to[1] + Math.cos(t * 1.1 + i) * 5;
        w.pp.p.r = Math.sin(t * 0.9 + i) * 5;
        w.pp.apply();
      }
    });
    if (swirlP.p.o > 0) {
      swirlP.p.r = (t * 90) % 360;
      swirlP.apply();
    }
  };
  const redraw = renderLoop(st, ctx.reduced, frame);
  const move = poser(st, ctx.reduced);
  st.loop(gsap.to(skyCurls.children, { x: 10, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.7 }));
  st.loop(gsap.to(ithaca.fires.flatMap((f) => [...f.querySelectorAll('.kit-flame__tongue')]), { scaleY: 0.7, transformOrigin: '50% 100%', duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.1 }));

  let leakLoop: gsap.core.Tween | null = null;
  const swap = (from: SVGGElement, to: SVGGElement) => {
    const tl = st.timeline();
    tl.to(from, { opacity: 0, duration: 0.7, ease: 'power2.in' })
      .set(from, { visibility: 'hidden' })
      .set(to, { visibility: 'visible' })
      .fromTo(to, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.out' });
    return tl;
  };

  return {
    enter() {
      const tl = st.timeline();
      tl.from(isleIn, { y: 30, opacity: 0, duration: 1.3, ease: 'power3.out' })
        .from(odyIn, { x: 30, opacity: 0, duration: 0.9, ease: 'power3.out' }, 0.5)
        .from([aeLabel, odLabel], { opacity: 0, duration: 0.8 }, 0.9);
      return st.play(tl);
    },

    async beat(i) {
      if (i === 0) {
        // The bronze gate swings open; Aiolos opens his hand and Odysseus answers the greeting.
        const gate = { v: 1 };
        const tl = st.timeline();
        tl.to(gate, { v: 0, duration: 1, ease: 'power2.inOut', onUpdate: () => wall.setGate(gate.v) }, 0);
        move(aiolos, { armF: [96, -10], head: 4 }, { duration: 0.9, delay: 0.5 });
        move(ody, { ...POSES.walk(ODX - 6, GI), armF: [74, 18], armB: [-14, 20], head: -4 }, { duration: 1.1, delay: 0.7 });
        tl.to({}, { duration: 1.9 }, 0);
        return st.play(tl);
      }
      if (i === 1) {
        // The bag of winds, bound with a silver cord: Aiolos holds it by the neck.
        ctx.audio.sfx('magic');
        const BX = AEX + 34, BY = GI - 50;
        const neck: Vec = [BX - 14, BY - 23];
        const gift = pose({ ...aiolos.pose, lean: 4, head: 8 });
        gift.armF = armTo(aiolos, 'F', [neck[0] + 1, neck[1] + 1], -1, gift);
        move(aiolos, gift, { duration: 0.7 });
        const tl = st.timeline();
        tl.set(bag1P.p, { x: BX, y: BY, s: 0.1 }, 0)
          .to(bag1P.p, { s: 1, o: 1, duration: 0.9, ease: 'back.out(1.6)', onUpdate: bag1P.apply }, 0.3)
          .to(S, { bag: 1, duration: 0.6 }, 0.9)
          .call(() => ctx.audio.sfx('wind'), [], 1.1)
          // Odysseus steps up and takes it in both hands.
          .call(() => {
            const ox = ODX - 16;
            const take = pose({ ...POSES.stand(ox, GI), lean: 14, head: 8 });
            take.armF = armTo(ody, 'F', [2 * ox - (BX + 14), BY - 2], 1, take);
            take.armB = armTo(ody, 'B', [2 * ox - (BX + 9), BY + 9], 1, take);
            move(ody, take, { duration: 0.8 });
          }, [], 1.0)
          .to(bagLeak, { opacity: 1, duration: 0.4 }, 1.8);
        await st.play(tl);
        // Wisps escape at the neck.
        bagLeak.setAttribute('transform', `translate(${f1(neck[0] - 6)} ${f1(neck[1] - 4)}) scale(-1 1)`);
        leakLoop = st.loop(gsap.to(bagLeak, { opacity: 0.2, duration: 0.8, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
        return;
      }
      if (i === 2) {
        // Nine days of fair wind; the fires of Ithaca; sleep.
        const tl = swap(T1, T2);
        tl.to(ith.p, { x: 0, o: 1, duration: 4.2, ease: 'power1.out', onUpdate: ith.apply }, 1.6)
          .to(S, { sleep: 0.55, duration: 1.2, ease: 'sine.inOut', onUpdate: () => helmsman.set(helmPose(S.sleep)) }, 2.6)
          .to(S, { sleep: 0.2, duration: 0.3, ease: 'power2.out', onUpdate: () => helmsman.set(helmPose(S.sleep)) }, 3.9)
          .to(S, { sleep: 1, duration: 1.6, ease: 'sine.inOut', onUpdate: () => helmsman.set(helmPose(S.sleep)) }, 4.4);
        const sail = ctx.atlas.sail('eve-dogru');
        await Promise.all([sail, st.play(tl)]);
        return;
      }
      if (i === 3) {
        // The companions creep to the bag.
        const creep = st.timeline();
        // (Figure units: the mates are drawn at scale CK inside the ship.)
        move(mateA.f, { x: -8 / CK, lean: 30, armF: [100, 20], armB: [70, 30], legF: [40, 50], legB: [-10, 30] }, { duration: 1.2 });
        move(mateB.f, { x: -10 / CK, lean: 20, head: -6, armF: [80, 30] }, { duration: 1.2, delay: 0.15 });
        creep.to({}, { duration: 1.35 });
        await st.play(creep);
        await ctx.tap(bag2.knot, { label: 'Tulumun ipini çöz' });
        // Out they come.
        ctx.audio.sfx('wind');
        ctx.audio.sfx('storm');
        ctx.atlas.flash('#f3e6c8');
        ctx.atlas.shake(8);
        const burst = st.timeline();
        if (!ctx.reduced) burst.add(tondoFlash(fx, WHITE, 0.6), 0).add(shakeGroup(world, 5), 0);
        // The cord flies off, the mouth gapes, the hide collapses.
        bag2.cordEnds.forEach((c, k) => burst.to(c, { x: k ? 18 : 22, y: k ? -24 : -8, rotation: k ? -120 : 90, opacity: 0, duration: 0.7, ease: 'power2.out' }, 0));
        burst.to(bag2.knot, { opacity: 0, duration: 0.3 }, 0.1).set(bag2.mouth, { opacity: 1 }, 0.05).to(S, { bag2: 0, duration: 0.2 }, 0);
        burst.call(() => bag2.pose(1.05, 0.62, -8), [], 0.4);
        // Swirling lines and the winds spiralling out of the bag.
        const origin = voyage.toParent([15 + 14 * 0.62, -10 - 23 * 0.62]);
        Object.assign(swirlP.p, { x: origin[0], y: origin[1] });
        burst.to(swirlP.p, { o: 1, s: 1.5, duration: 0.8, ease: 'power2.out', onUpdate: swirlP.apply }, 0.1).to(swirlP.p, { o: 0, s: 2.3, duration: 0.9, ease: 'power1.in', onUpdate: swirlP.apply }, 0.9);
        winds.forEach((w, k) => {
          // Each wind corkscrews up out of the bag, tumbling, to its station in the sky.
          const t0 = 0.15 + k * 0.18;
          const proxy = { u: 0 };
          const dx = w.to[0] - origin[0], dy = w.to[1] - origin[1];
          const L = Math.hypot(dx, dy) || 1;
          const nx = -dy / L, ny = dx / L;
          const side = k % 2 ? 1 : -1;
          burst.to(
            proxy,
            {
              u: 1,
              duration: 1.6,
              ease: 'power2.out',
              onUpdate: () => {
                const u = proxy.u;
                const wob = Math.sin(u * Math.PI * 2.4) * (1 - u) * 34 * side;
                w.pp.p.x = origin[0] + dx * u + nx * wob;
                w.pp.p.y = origin[1] + dy * u + ny * wob;
                w.pp.p.s = 0.05 + (w.k - 0.05) * Math.min(1, u * 1.3);
                w.pp.p.r = (1 - u) * 300 * side;
                w.pp.p.o = Math.min(1, u * 4);
                w.pp.apply();
                // The painted name appears once the wind has come to rest.
                w.lab.setAttribute('opacity', f1(clamp((u - 0.8) * 5, 0, 1)));
              },
            },
            t0,
          );
        });
        burst.to(S, { windsOut: 1, duration: 0.01 }, 1.95);
        // Zephyros is caught up in the whirl: one loop, and back to his post.
        const z0 = { x: zp.p.x, y: zp.p.y, r: zp.p.r };
        const loop = { a: 0 };
        burst.to(
          loop,
          {
            a: 1,
            duration: 1.5,
            ease: 'power1.inOut',
            onUpdate: () => {
              const th = loop.a * Math.PI * 2;
              zp.p.x = z0.x + Math.sin(th) * 34;
              zp.p.y = z0.y - (1 - Math.cos(th)) * 30;
              zp.p.r = z0.r - loop.a * 360;
              zp.apply();
            },
          },
          0.25,
        );
        // Odysseus starts awake; the ship is thrown back.
        burst.to(S, { alarm: 1, sleep: 0, duration: 0.4, onUpdate: () => helmsman.set(helmPose(S.sleep, S.alarm)) }, 0.2);
        move(mateA.f, { lean: -20, head: -10, armF: [150, 20], armB: [130, 30], legF: [10, 4], legB: [-10, 4] }, { duration: 0.5, delay: 0.1 });
        move(mateB.f, { lean: -24, head: -14, armF: [160, 10], armB: [120, 40] }, { duration: 0.5, delay: 0.15 });
        burst.to(S, { storm: 1, wind: -1, duration: 1.4, ease: 'power2.inOut' }, 0.3)
          .to(S, { zephBlow: 1, duration: 0.5 }, 0.3)
          .to(sunG, { opacity: 0, duration: 1 }, 0.3);
        await st.play(burst);
        const back = st.timeline();
        back.to(S, { shipX: -48, duration: 5, ease: 'sine.inOut', onUpdate: redraw }, 0)
          .to(odyAtSea, { opacity: 0, duration: 0.8 }, 0).to(ith.p, { x: 120, o: 0, duration: 3.6, ease: 'power2.in', onUpdate: ith.apply }, 0.2);
        await Promise.all([ctx.atlas.sail('geri'), st.play(back)]);
        return;
      }
      if (i === 4) {
        // Back at the island: the bronze gate shuts in their faces.
        const gate = { v: 0 };
        winds.forEach((w) => gsap.set(w.pp.p, { o: 0 }));
        S.bag = 0;
        gsap.set(bag1P.p, { o: 0 });
        bag1P.apply();
        leakLoop?.kill();
        gsap.set(bagLeak, { opacity: 0 });
        aiolos.set({ ...POSES.stand(AEX, GI), armB: aiolos.pose.armB, armF: [40, 20], head: 0, lean: 0 });
        ody.set(pose({ ...POSES.plead(ODX - 4, GI) }));
        gsap.set(crew, { opacity: 1 });
        // His name moves into the sky above him (the crew now stands where it was).
        odLabel.setAttribute('transform', `translate(${ODX - 26} ${GI - 120}) rotate(0)`);
        void ctx.atlas.settle();
        const tl = swap(T2, T1);
        tl.call(() => {
          move(aiolos, { armF: [92, -4], head: -6, lean: -6, grip: 0 }, { duration: 0.45 });
          ctx.audio.sfx('fail');
        }, [], 1.6)
          .to(speechG, { opacity: 1, duration: 0.4 }, 1.9)
          .to(gate, { v: 1, duration: 0.45, ease: 'power3.in', onUpdate: () => wall.setGate(gate.v) }, 2.1)
          .call(() => {
            ctx.audio.sfx('thud');
            ctx.atlas.shake(4);
          }, [], 2.55);
        // Idle: the companions sway in their grief.
        const sway = { v: 0 };
        const c1 = { ...comp1.pose }, c2 = { ...comp2.pose };
        st.loop(
          gsap.to(sway, {
            v: 1,
            duration: 1.8,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: 2.6,
            onUpdate: () => {
              comp1.set({ lean: c1.lean + sway.v * 4, head: c1.head + sway.v * 6 });
              comp2.set({ lean: c2.lean - 2 + sway.v * 3, head: c2.head + 4 - sway.v * 5 });
            },
          }),
        );
        // Speech from his lips toward Odysseus.
        // (It starts just past his sceptre, so the staff does not strike through the letters.)
        const lips = headFrame(aiolos, pose({ ...aiolos.pose, head: -6, lean: -6 })).at(12, 1);
        speechG.setAttribute('transform', `translate(${f1(scX + 3)} ${f1(lips[1] - 5)}) rotate(-12)`);
        return st.play(tl);
      }
    },

    destroy() {
      st.destroy();
    },
  };
};
