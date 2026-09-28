/**
 * ΙΗʹ Nostos — the homecoming.
 * Athena's disguise, old Argos, Penelope's loom, the bow and the twelve axes,
 * the secret of the olive-tree bed, and the embrace.
 */
import { s } from '../lib/dom';
import { gsap } from '../lib/motion';
import { Figure, POSES, pose, bowPath, spear, shield, INK, WHITE, PURPLE, type Pose } from '../art/figure';
import { Beast } from '../art/animals';
import { exergue, oliveTree, inscription, fillers, sun, moon, glow } from '../art/kit';
import { argos, mound, doorway, loom, axes, bed, oliveBedTree, suitorCouch } from './nostos.art';
import { stage } from './tools';
import type { SceneFactory } from '../story/types';
import { L } from '../i18n';

const GROUND = 92;
const fill = (k: number) => `translate(0 ${GROUND}) scale(${k}) translate(0 ${-GROUND})`;

function lerpPose(a: Pose, b: Pose, t: number): Partial<Pose> {
  const l = (x: number, y: number) => x + (y - x) * t;
  return {
    x: l(a.x, b.x), y: l(a.y, b.y), lean: l(a.lean, b.lean), head: l(a.head, b.head),
    armF: [l(a.armF[0], b.armF[0]), l(a.armF[1], b.armF[1])],
    armB: [l(a.armB[0], b.armB[0]), l(a.armB[1], b.armB[1])],
  };
}

export const scene: SceneFactory = (ctx) => {
  const st = stage(ctx);
  const root = ctx.root;
  root.appendChild(exergue(GROUND, { band: 'tongues' }));
  const sky = fillers([[-110, -96], [96, -118], [-40, -140], [128, -60]], 4.5);
  root.appendChild(sky);

  const tableau = (k = 1.12) => {
    const wrap = s('g', { transform: fill(k) });
    const g = s('g', { opacity: 0 });
    wrap.appendChild(g);
    root.appendChild(wrap);
    return g;
  };
  const show = (g: SVGGElement, from = 30) => st.timeline().fromTo(g, { opacity: 0, x: from }, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' });
  const hide = (g: SVGGElement) => st.timeline().to(g, { opacity: 0, x: -30, duration: 0.6, ease: 'power2.in' }).set(g, { display: 'none' });

  /* ---------------- A: Athena's disguise ---------------- */
  const A = tableau(1.18);
  A.appendChild(oliveTree(-122, GROUND, 1.1, 31));
  const pig = new Beast('pig', { x: 112, y: GROUND, scale: 0.8, facing: -1 });
  A.appendChild(pig.g);
  const athena = new Figure({ head: 'woman', hat: 'helmet', garment: 'peplos', garmentColor: INK }, pose({ ...POSES.stand(-52, GROUND), armF: [100, 10], armB: [-14, 30] }));
  A.appendChild(athena.g);
  A.appendChild(spear([-66, GROUND + 2], [-56, -40]));
  const heroA = new Figure({ hat: 'pilos', garment: 'short', cloak: true, facing: -1 }, pose({ ...POSES.stand(38, GROUND), armF: [30, 30], armB: [-10, 20] }));
  const beggarA = new Figure({ head: 'old', garment: 'rags', garmentColor: INK, facing: -1 }, pose({ ...POSES.stand(38, GROUND + 2), lean: 12, head: 10, armF: [44, 40], armB: [-6, 30] }));
  beggarA.g.style.opacity = '0';
  const staffA = s('line', { x1: 10, y1: 18, x2: 8, y2: GROUND, stroke: INK, 'stroke-width': 1.8, opacity: 0 });
  A.append(heroA.g, beggarA.g, staffA);
  A.appendChild(inscription('ΑΘΗΝΑ', -84, -40, { size: 6.5, angle: 90 }));
  A.appendChild(inscription('ΟΔΥΣΣΕΥΣ', 62, -34, { size: 6.5, angle: 90 }));
  const shimmer = glow(ctx.defs, 38, 30, 60, WHITE, 0.55);
  shimmer.style.opacity = '0';
  A.appendChild(shimmer);

  /* ---------------- B: Argos ---------------- */
  const B = tableau(1.16);
  B.appendChild(doorway(104, GROUND, 116, 50));
  B.appendChild(mound(-66, GROUND, 110, 18));
  const dog = argos(-78, GROUND - 12, 1.25);
  B.appendChild(dog.g);
  B.appendChild(inscription('ΑΡΓΟΣ', -112, 44, { size: 7 }));
  const beggarB = new Figure({ head: 'old', garment: 'rags', garmentColor: INK, facing: -1 }, pose({ ...POSES.walk(170, GROUND), lean: 12, head: 8, armF: [30, 30] }));
  const staffB = s('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: INK, 'stroke-width': 1.8 });
  B.append(beggarB.g, staffB);
  const syncStaff = (fig: Figure, line: SVGLineElement) => {
    const [hx, hy] = fig.hand('F');
    line.setAttribute('x1', hx.toFixed(1));
    line.setAttribute('y1', (hy - 16).toFixed(1));
    line.setAttribute('x2', (hx - 4).toFixed(1));
    line.setAttribute('y2', String(GROUND));
  };
  syncStaff(beggarB, staffB);
  const tear = s('circle', { r: 1.4, fill: WHITE, opacity: 0 });
  B.appendChild(tear);

  /* ---------------- C: the loom and the suitors ---------------- */
  const C = tableau(1.1);
  const lm = loom(-96, GROUND, 78, 132);
  C.appendChild(lm.g);
  lm.setWoven(0.45);
  const penelopeC = new Figure({ head: 'woman', hat: 'veil', garment: 'peplos', garmentColor: PURPLE, facing: -1 }, pose({ ...POSES.stand(-32, GROUND), armF: [96, 20], armB: [70, 40] }));
  C.appendChild(penelopeC.g);
  C.appendChild(suitorCouch(104, GROUND - 2, true));
  C.appendChild(suitorCouch(60, GROUND, true));
  C.appendChild(inscription('ΠΗΝΕΛΟΠΕΙΑ', -4, -50, { size: 6.5, angle: 90 }));
  const sunC = sun(76, -96, 12);
  const moonC = moon(76, -96, 12, WHITE);
  moonC.style.opacity = '0';
  C.append(sunC, moonC);

  /* ---------------- D: the bow and the axes ---------------- */
  const D = tableau(1.08);
  const HOLE = GROUND - 44;
  const ax = axes(-6, 128, GROUND, HOLE);
  D.appendChild(ax.g);
  const aimStart = pose({ x: -96, y: GROUND - 27, lean: 8, head: -2, legF: [72, 98], legB: [-8, 84], footF: 8, footB: -50, armF: [88, 2], armB: [92, 0] });
  const aimDrawn: Pose = { ...aimStart, lean: 2, armB: [62, 150] };
  const archer = new Figure({ head: 'old', garment: 'rags', garmentColor: INK }, aimStart);
  D.appendChild(archer.g);
  const bowLimb = s('path', { fill: INK });
  const bowString = s('path', { fill: 'none', stroke: INK, 'stroke-width': 0.7 });
  const arrow = s('g', { class: 'arrow' });
  arrow.appendChild(s('line', { x1: -46, y1: 0, x2: 0, y2: 0, stroke: INK, 'stroke-width': 1.3 }));
  arrow.appendChild(s('path', { d: 'M0 0L-7 -3L-5 0L-7 3Z', fill: INK }));
  arrow.appendChild(s('path', { d: 'M-46 0L-52 -4M-46 0L-52 4M-42 0L-48 -4M-42 0L-48 4', stroke: PURPLE, 'stroke-width': 1.2 }));
  D.append(bowLimb, bowString, arrow);
  // A generous invisible handle over the archer and his bow for dragging.
  const bowHandle = s('rect', { x: -132, y: GROUND - 104, width: 128, height: 104, fill: 'transparent' });
  D.appendChild(bowHandle);
  D.appendChild(inscription('ΟΔΥΣΣΕΥΣ', -124, -30, { size: 6.5, angle: 90 }));
  const drawBow = (p: number) => {
    archer.set(lerpPose(aimStart, aimDrawn, p));
    const grip = archer.hand('F');
    const pull = archer.hand('B');
    const top: [number, number] = [grip[0] + 2 + p * 3, grip[1] - 32];
    const bottom: [number, number] = [grip[0] + 2 + p * 3, grip[1] + 32];
    const bp = bowPath(top, bottom, -(9 + p * 9), [pull[0] + 2, pull[1]]);
    bowLimb.setAttribute('d', bp.limb);
    bowString.setAttribute('d', bp.string);
    arrow.setAttribute('transform', `translate(${(grip[0] + 10).toFixed(1)} ${grip[1].toFixed(1)})`);
    const lenBack = grip[0] + 10 - (pull[0] + 2);
    (arrow.firstChild as SVGLineElement).setAttribute('x1', String(-Math.max(30, lenBack)));
  };
  drawBow(0);

  /* ---------------- E: the stranger revealed ---------------- */
  const E = tableau(1.1);
  const heroE = new Figure({ hat: 'pilos', garment: 'short', cloak: true, cloakColor: PURPLE }, pose({ ...POSES.lunge(-70, GROUND), armF: [96, 4], armB: [60, 90] }));
  const beggarE = new Figure({ head: 'old', garment: 'rags', garmentColor: INK }, pose({ ...POSES.stand(-70, GROUND), lean: 10 }));
  const telemachus = new Figure({ head: 'youth', hat: 'helmet', garment: 'short' }, pose({ ...POSES.lunge(-12, GROUND), armF: [84, 10], armB: [-30, 60] }));
  E.append(beggarE.g, heroE.g, telemachus.g);
  {
    const [gx, gy] = heroE.hand('F');
    const bp = bowPath([gx + 6, gy - 30], [gx + 6, gy + 30], -12);
    const bowE = s('g');
    bowE.appendChild(s('path', { d: bp.limb, fill: INK }));
    bowE.appendChild(s('path', { d: bp.string, fill: 'none', stroke: INK, 'stroke-width': 0.7 }));
    heroE.g.appendChild(bowE);
  }
  E.appendChild(shield([14, 28], 15, 'dolphin'));
  E.appendChild(spear([-30, 40], [70, 18]));
  const fleeing = [
    new Figure({ head: 'bearded', garment: 'long', garmentColor: PURPLE }, pose({ ...POSES.run(90, GROUND), armB: [150, 20], armF: [140, 30] })),
    new Figure({ head: 'youth', garment: 'long', garmentColor: INK }, pose({ ...POSES.plead(126, GROUND), head: -20 })),
  ];
  fleeing.forEach((f) => E.appendChild(f.g));
  E.appendChild(inscription('ΤΗΛΕΜΑΧΟΣ', -2, -52, { size: 6, angle: 90 }));
  E.appendChild(inscription('ΟΔΥΣΣΕΥΣ', -104, -44, { size: 6.5, angle: 90 }));
  heroE.g.style.opacity = '0';

  /* ---------------- F: the bed and the embrace ---------------- */
  const F = tableau(1.04);
  const tree = oliveBedTree(58, GROUND);
  tree.trunk.style.opacity = '0';
  tree.branches.setAttribute('pathLength', '1');
  tree.branches.style.strokeDasharray = '1';
  tree.branches.style.strokeDashoffset = '1';
  tree.leaves.style.opacity = '0';
  F.append(tree.branches, tree.leaves);
  F.appendChild(bed(10, GROUND, 160));
  F.appendChild(tree.trunk);
  const penelope = new Figure({ head: 'woman', hat: 'veil', garment: 'peplos', garmentColor: PURPLE }, pose({ ...POSES.stand(-104, GROUND), armF: [40, 60], armB: [10, 90] }));
  const odysseusF = new Figure({ hat: 'pilos', garment: 'short', cloak: true, facing: -1 }, pose({ ...POSES.stand(112, GROUND), armF: [60, 20] }));
  F.append(penelope.g, odysseusF.g);
  F.appendChild(inscription('ΠΗΝΕΛΟΠΕΙΑ', -134, -40, { size: 6.5, angle: 90 }));
  const labelF = inscription('ΟΔΥΣΣΕΥΣ', 134, -36, { size: 6.5, angle: 90 });
  F.appendChild(labelF);

  let current: SVGGElement | null = null;
  const cut = async (next: SVGGElement) => {
    if (current === next) return;
    const tl = st.timeline();
    if (current) tl.add(hide(current));
    tl.add(show(next), current ? '-=0.2' : 0);
    current = next;
    await st.play(tl);
  };

  return {
    async enter() {
      await cut(A);
      st.loop(gsap.to(pig.g, { x: '+=4', duration: 1.6, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
    },

    async beat(i) {
      if (i === 0) {
        // Athena's touch: the king becomes an old beggar.
        await st.wait(0.4);
        athena.to({ armB: [80, 10] }, { duration: 0.8 });
        ctx.audio.sfx('magic');
        const tl = st.timeline();
        tl.to(shimmer, { opacity: 1, duration: 0.7 })
          .to(heroA.g, { opacity: 0, duration: 0.9 }, 0.4)
          .to([beggarA.g, staffA], { opacity: 1, duration: 0.9 }, 0.5)
          .to(shimmer, { opacity: 0, duration: 1 }, 1.2);
        return st.play(tl);
      }
      if (i === 1) {
        await cut(B);
        // The beggar approaches the gate.
        const walk = st.loop(gsap.to({ p: 0 }, { p: 1, duration: 1.2, repeat: -1, ease: 'none', onUpdate: function () {
          const p = (this.targets()[0] as { p: number }).p * Math.PI * 2;
          beggarB.set({ legF: [16 * Math.sin(p), 8], legB: [-16 * Math.sin(p), 8] });
          syncStaff(beggarB, staffB);
        } }));
        await st.play(st.timeline().to(beggarB.pose, { x: 40, duration: 2.6, ease: 'power1.out', onUpdate: () => { beggarB.render(); syncStaff(beggarB, staffB); } }));
        walk.kill();
        beggarB.to({ legF: [4, 2], legB: [-4, 2], head: 14 }, { duration: 0.6, onUpdate: () => syncStaff(beggarB, staffB) });
        // Argos knows him: head up, ears pricked, a few wags… then stillness.
        // (Pivots are in the dog's own coordinates: head and tail sit inside its group.)
        ctx.audio.sfx('bark');
        const tl = st.timeline();
        tl.to(dog.head, { rotation: -16, svgOrigin: '18 -12', duration: 0.8, ease: 'power2.out' })
          .to(dog.ears, { scaleY: 1.3, transformOrigin: '50% 100%', duration: 0.3 }, 0.4)
          .to(dog.tail, { rotation: 18, svgOrigin: '-33 -7', duration: 0.18, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 0.7)
          .call(() => beggarB.to({ armB: [150, 150], head: 20 }, { duration: 0.7 }), [], 1.4)
          .call(() => {
            const [hx, hy] = beggarB.hand('B');
            tear.setAttribute('cx', (hx - 6).toFixed(1));
            tear.setAttribute('cy', (hy + 4).toFixed(1));
          }, [], 2.1)
          .to(tear, { opacity: 1, duration: 0.3 }, 2.1)
          .to(tear, { attr: { cy: '+=26' }, opacity: 0, duration: 1.2, ease: 'power1.in' }, 2.4)
          .to(dog.head, { rotation: 6, duration: 2.2, ease: 'power2.inOut' }, 2.2)
          .to(dog.ears, { scaleY: 0.8, duration: 1 }, 2.6)
          .to(dog.eye, { opacity: 0, duration: 1.2 }, 3.4);
        return st.play(tl);
      }
      if (i === 2) {
        await cut(C);
        // Weaving by day, unweaving by night.
        const w = { p: 0.45 };
        const tl = st.timeline();
        for (let k = 0; k < 2; k++) {
          tl.to(w, { p: 0.85, duration: 1.2, ease: 'sine.inOut', onUpdate: () => lm.setWoven(w.p) })
            .to(sunC, { opacity: 0, duration: 0.4 }, '>-0.1')
            .to(moonC, { opacity: 1, duration: 0.4 }, '<')
            .to(w, { p: 0.45, duration: 1.1, ease: 'sine.inOut', onUpdate: () => lm.setWoven(w.p) })
            .to(moonC, { opacity: 0, duration: 0.4 }, '>-0.1')
            .to(sunC, { opacity: 1, duration: 0.4 }, '<');
        }
        st.loop(gsap.to(penelopeC.pose.armF, { 0: 110, duration: 0.8, yoyo: true, repeat: -1, ease: 'sine.inOut', onUpdate: () => penelopeC.render() }));
        return st.play(tl);
      }
      if (i === 3) {
        await cut(D);
        // Draw the great bow, then loose the arrow through the twelve axes.
        await ctx.drag(bowHandle, {
          label: L('Yayı ger', 'Draw the bow'),
          axis: 'x',
          distance: -46,
          onProgress: drawBow,
        });
        ctx.audio.sfx('bow');
        const grip = archer.hand('F');
        const start = grip[0] + 10;
        const tl = st.timeline();
        tl.call(() => drawBow(0))
          .fromTo(arrow, { x: start }, { x: 186, duration: 0.95, ease: 'power1.in', immediateRender: false }, 0);
        ax.heads.forEach((h, k) => {
          const x = -6 + (134 * k) / 11;
          const t = Math.max(0, ((x - start) / (186 - start)) ** 1.05 * 0.95);
          tl.to(h, { rotation: 5, svgOrigin: `${x} ${GROUND}`, duration: 0.08, yoyo: true, repeat: 1, ease: 'sine.inOut' }, t);
        });
        tl.call(() => ctx.audio.sfx('twang'), [], 0.95);
        return st.play(tl);
      }
      if (i === 4) {
        await cut(E);
        ctx.atlas.flash('#fff3d6');
        ctx.audio.sfx('thud');
        const tl = st.timeline();
        tl.to(beggarE.g, { opacity: 0, duration: 0.5 })
          .to(heroE.g, { opacity: 1, duration: 0.5 }, 0.1)
          .from(telemachus.g, { x: -20, opacity: 0, duration: 0.8, ease: 'power3.out' }, 0.3);
        fleeing.forEach((f, k) => tl.to(f.g, { x: 24 + k * 10, duration: 1.4, ease: 'power2.out' }, 0.5));
        return st.play(tl);
      }
      if (i === 5) {
        await cut(F);
        const options = [
          { id: 'agir', label: L('Yatak çok ağır, taşınamaz', 'The bed is too heavy to carry') },
          { id: 'zeytin', label: L('Bir ayağı kök salmış bir zeytin ağacıdır', 'One of its posts is a rooted olive tree') },
          { id: 'tanri', label: L('Yatak tanrıların armağanıdır', 'The bed is a gift of the gods') },
        ];
        for (;;) {
          const id = await ctx.choose(options);
          if (ctx.signal.aborted) return;
          if (id === 'zeytin') break;
          ctx.audio.sfx('fail');
          ctx.say(L('Penelopeia başını sallar. Yalnızca ikisinin bildiği sırrı söyle…', 'Penelope shakes her head. Tell the secret only the two of them know…'));
        }
        ctx.audio.sfx('success');
        // The secret: the living olive rises through the bed.
        const tl = st.timeline();
        tl.fromTo(tree.trunk, { opacity: 0, scaleY: 0.1, transformOrigin: '50% 100%' }, { opacity: 1, scaleY: 1, duration: 1.2, ease: 'power3.out' })
          .to(tree.branches, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.out' }, 0.8)
          .to(tree.leaves, { opacity: 1, duration: 1.2 }, 1.4)
          .from(tree.leaves.children, { scale: 0, transformOrigin: '50% 50%', duration: 0.6, stagger: 0.012, ease: 'back.out(2)' }, 1.4);
        return st.play(tl);
      }
      if (i === 6) {
        // The embrace beneath the olive.
        const tl = st.timeline();
        penelope.to({ ...POSES.walk(8, GROUND), armF: [120, 60], armB: [110, 70] }, { duration: 1.4, ease: 'power2.inOut' });
        odysseusF.to({ ...POSES.walk(40, GROUND), armF: [80, 60], armB: [70, 80] }, { duration: 1.4, ease: 'power2.inOut' });
        tl.to(labelF, { x: -70, duration: 1.4, ease: 'power2.inOut' }, 0)
          .call(() => {
            penelope.to({ ...POSES.stand(18, GROUND), lean: 6, armF: [128, 70], armB: [118, 80], head: -4 }, { duration: 0.8 });
            odysseusF.to({ ...POSES.stand(33, GROUND), lean: 6, armF: [84, 64], armB: [74, 76], head: 10 }, { duration: 0.8 });
          }, [], 1.4)
          .fromTo(sky, { opacity: 1 }, { opacity: 0.4, duration: 0.6 }, 1.6);
        const ring = fillers(
          Array.from({ length: 16 }, (_, k) => {
            const a = (k / 16) * Math.PI * 2;
            return [Math.cos(a) * 150, Math.sin(a) * 150 - 6] as [number, number];
          }).filter(([, y]) => y < 70),
          5,
          INK,
        );
        root.appendChild(ring);
        tl.from(ring, { opacity: 0, scale: 0.9, transformOrigin: '50% 50%', duration: 1.4, ease: 'power2.out' }, 2.2);
        ctx.audio.sfx('arrive');
        return st.play(tl);
      }
    },

    destroy() {
      st.destroy();
    },
  };
};

