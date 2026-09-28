/**
 * Αʹ İthaka — Odysseus feigns madness.
 * Tableau 1: Odysseus and Penelope with the infant Telemachus under the olive.
 * Tableau 2: an ox and a donkey under one yoke, salt sown in the furrows,
 * Palamedes lays the baby before the plough — and Odysseus stops.
 */
import { s } from '../lib/dom';
import { gsap } from '../lib/motion';
import { Figure, POSES, pose, INK, CLAY, WHITE, PURPLE } from '../art/figure';
import { Beast } from '../art/animals';
import { exergue, oliveTree, inscription, fillers, cypress } from '../art/kit';
import { stage } from './tools';
import type { SceneFactory } from '../story/types';
import { L } from '../i18n';

const GROUND = 92;

/** A swaddled infant: a white bundle with a black face. */
function baby(): SVGGElement {
  const g = s('g', { class: 'baby' });
  g.appendChild(s('path', { d: 'M-11 0C-12 -6 -6 -9 2 -8C8 -8 12 -5 12 -1C12 3 6 4 -2 4C-7 4 -10 3 -11 0Z', fill: WHITE, stroke: INK, 'stroke-width': 0.8 }));
  g.appendChild(s('path', { d: 'M-6 -6.5Q0 -3 5 -7M-7 -1Q0 2 8 -2', fill: 'none', stroke: INK, 'stroke-width': 0.6 }));
  g.appendChild(s('circle', { cx: 9.5, cy: -4.5, r: 3.6, fill: INK }));
  return g;
}

export const scene: SceneFactory = (ctx) => {
  const st = stage(ctx);
  const root = ctx.root;

  // Shared ground.
  root.appendChild(exergue(GROUND, { band: 'tongues' }));
  root.appendChild(fillers([[-120, -70], [-70, -118], [118, -96], [60, -130]], 5));

  /* ---------------- Tableau 1: the family ---------------- */
  // Tableaux are laid out in figure units and enlarged about the groundline to fill the tondo.
  const fill = (k: number) => `translate(0 ${GROUND}) scale(${k}) translate(0 ${-GROUND})`;
  const t1 = s('g', { class: 'tableau-1', transform: fill(1.32) });
  t1.appendChild(oliveTree(108, GROUND, 1.25, 12));
  const penelope = new Figure({ head: 'woman', garment: 'peplos', hat: 'veil', garmentColor: INK }, pose({ ...POSES.stand(-38, GROUND), armF: [70, 70], armB: [40, 90] }));
  const odysseus1 = new Figure({ hat: 'pilos', garment: 'short', cloak: true, facing: -1 }, pose({ ...POSES.stand(36, GROUND), armF: [48, 30], armB: [-10, 20] }));
  const infant = baby();
  infant.setAttribute('transform', 'translate(-22 34) rotate(-14)');
  t1.append(penelope.g, odysseus1.g, infant);
  t1.appendChild(inscription('ΠΗΝΕΛΟΠΕΙΑ', -62, -34, { size: 6, angle: 90 }));
  t1.appendChild(inscription('ΟΔΥΣΣΕΥΣ', 38, -30, { size: 6, align: 'middle' }));
  // A herald's staff will appear with Palamedes in beat 1.
  const palamedes1 = new Figure({ head: 'bearded', hat: 'petasos', garment: 'short', garmentColor: INK, cloak: true, cloakColor: PURPLE }, POSES.walk(-104, GROUND));
  palamedes1.g.style.opacity = '0';
  const staff = s('line', { x1: -88, y1: -30, x2: -80, y2: GROUND, stroke: INK, 'stroke-width': 1.6 });
  staff.style.opacity = '0';
  t1.append(palamedes1.g, staff);
  root.appendChild(t1);

  /* ---------------- Tableau 2: the plough ---------------- */
  const t2wrap = s('g', { transform: fill(1.14) });
  const t2 = s('g', { class: 'tableau-2', opacity: 0 });
  t2wrap.appendChild(t2);
  // Furrows appear behind the plough (revealed by a clip that grows).
  const furrowClip = s('clipPath', { id: 'ith-furrow', 'data-scene': '' });
  const furrowRect = s('rect', { x: 140, y: GROUND - 14, width: 0, height: 16 });
  furrowClip.appendChild(furrowRect);
  ctx.defs.appendChild(furrowClip);
  let furrowD = '';
  for (let i = 0; i < 4; i++) furrowD += `M-150 ${GROUND - 2 - i * 3.2}H150`;
  const furrows = s('path', { d: furrowD, stroke: INK, 'stroke-width': 1.4, 'stroke-dasharray': '10 4', 'clip-path': 'url(#ith-furrow)' });
  t2.appendChild(furrows);
  t2.appendChild(cypress(-132, GROUND, 96));

  // The team faces left: build it facing right inside a mirrored wrapper.
  const wrapper = s('g', { transform: 'scale(-0.86 0.86)' });
  const team = s('g');
  const donkey = new Beast('donkey', { x: 30, y: GROUND / 0.86 - 3, scale: 0.92 });
  const ox = new Beast('ox', { x: 6, y: GROUND / 0.86, scale: 0.92 });
  const yokeY = GROUND / 0.86 - 38;
  const plough = s('g', { class: 'plough' });
  // Pole from the yoke back to the share; stilt rising to the ploughman's hand.
  plough.appendChild(s('path', { d: `M28 ${yokeY + 2}L-64 ${GROUND / 0.86 - 6}`, stroke: INK, 'stroke-width': 3.2, 'stroke-linecap': 'round' }));
  plough.appendChild(s('path', { d: `M-68 ${GROUND / 0.86 - 1}L-48 ${GROUND / 0.86 + 1}L-66 ${GROUND / 0.86 - 7}Z`, fill: INK }));
  plough.appendChild(s('path', { d: `M-66 ${GROUND / 0.86 - 4}L-84 ${GROUND / 0.86 - 44}`, stroke: INK, 'stroke-width': 2.6, 'stroke-linecap': 'round' }));
  plough.appendChild(s('path', { d: `M18 ${yokeY - 1}Q30 ${yokeY - 6} 42 ${yokeY - 2}`, stroke: INK, 'stroke-width': 3.4, fill: 'none', 'stroke-linecap': 'round' }));
  const odysseus = new Figure({ hat: 'pilos', garment: 'short', ground: CLAY }, pose({ ...POSES.walk(-104, GROUND / 0.86), lean: 10, armF: [62, 10], armB: [-40, 20] }));
  team.append(donkey.g, ox.g, plough, odysseus.g);
  wrapper.appendChild(team);
  t2.appendChild(wrapper);
  // Salt grains live in scene space so they can fall freely.
  const salt = s('g', { class: 'salt' });
  t2.appendChild(salt);
  const odyLabel = inscription('ΟΔΥΣΣΕΥΣ', 44, -58, { size: 7 });
  t2.appendChild(odyLabel);
  // Palamedes carrying the baby, entering from the left in beat 3.
  const palamedes = new Figure({ head: 'bearded', hat: 'petasos', garment: 'short', garmentColor: INK, cloak: true, cloakColor: PURPLE }, pose({ ...POSES.walk(-230, GROUND), armF: [70, 60], armB: [60, 70] }));
  const carried = baby();
  carried.setAttribute('transform', 'translate(-214 -40)');
  const telemachus = baby();
  telemachus.setAttribute('transform', `translate(-96 ${GROUND - 4})`);
  telemachus.style.opacity = '0';
  const palLabel = inscription('ΠΑΛΑΜΗΔΗΣ', -128, -40, { size: 6.5 });
  palLabel.style.opacity = '0';
  t2.append(palamedes.g, carried, telemachus, palLabel);
  root.appendChild(t2wrap);

  /** Team x in wrapper space; positive moves left on screen. */
  const teamPos = { x: -40 };
  const placeTeam = () => team.setAttribute('transform', `translate(${teamPos.x.toFixed(2)} 0)`);
  placeTeam();

  const sow = () => {
    // A handful of salt thrown from Odysseus's back hand, falling into the furrow.
    const hand = odysseus.hand('B');
    const sx = -(hand[0] + teamPos.x) * 0.86;
    const sy = hand[1] * 0.86;
    for (let i = 0; i < 7; i++) {
      const grain = s('circle', { cx: sx, cy: sy, r: 1.3, fill: WHITE });
      salt.appendChild(grain);
      const dx = gsap.utils.random(-6, 36);
      st.timeline()
        .to(grain, { attr: { cx: sx + dx * 0.6 }, duration: 0.35, ease: 'power1.out' })
        .to(grain, { attr: { cx: sx + dx, cy: GROUND - gsap.utils.random(1, 6) }, duration: 0.5, ease: 'power2.in' })
        .to(grain, { opacity: 0.35, duration: 1.2 });
    }
  };

  let walkOx: gsap.core.Tween | null = null;
  let walkDonkey: gsap.core.Tween | null = null;
  let creep: gsap.core.Tween | null = null;

  return {
    enter() {
      const tl = st.timeline();
      tl.from([penelope.g, infant], { x: -30, opacity: 0, duration: 0.9, ease: 'power3.out' })
        .from(odysseus1.g, { x: 30, opacity: 0, duration: 0.9, ease: 'power3.out' }, 0.1)
        .from(t1.querySelectorAll('.kit-inscription'), { opacity: 0, duration: 0.8 }, 0.6);
      st.loop(gsap.to(infant, { rotation: -6, transformOrigin: '50% 50%', duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
      return st.play(tl);
    },

    async beat(i) {
      if (i === 0) return;
      if (i === 1) {
        // Palamedes arrives as the envoy of the Achaeans.
        const tl = st.timeline();
        tl.to([palamedes1.g, staff], { opacity: 1, duration: 0.6 })
          .from([palamedes1.g, staff], { x: -60, duration: 1.2, ease: 'power2.out' }, 0);
        palamedes1.to({ ...POSES.stand(-104, GROUND), armF: [40, 20] }, { duration: 1.2, delay: 0.1 });
        odysseus1.to({ head: -8, armF: [80, 40] }, { duration: 0.8, delay: 0.6 });
        penelope.to({ head: 10, armB: [20, 110] }, { duration: 0.8, delay: 0.8 });
        return st.play(tl);
      }
      if (i === 2) {
        // Cut to the field. Tap the ox to set the team ploughing.
        const cut = st.timeline();
        cut.to(t1, { opacity: 0, x: 40, duration: 0.7, ease: 'power2.in' }).set(t1, { display: 'none' }).fromTo(t2, { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' });
        await st.play(cut);
        await ctx.tap(ox.g, { label: L('Öküze dokun: sabanı sür', 'Touch the ox: drive the plough') });
        ctx.audio.sfx('thud');
        walkOx = st.loop(ox.walk(0.9));
        walkDonkey = st.loop(donkey.walk(0.9));
        const legs = st.loop(gsap.to({ p: 0 }, { p: 1, duration: 1.1, repeat: -1, ease: 'none', onUpdate: function () {
          const p = (this.targets()[0] as { p: number }).p;
          odysseus.set({ legF: [18 * Math.sin(p * 6.283), 10], legB: [-18 * Math.sin(p * 6.283), 10] });
        } }));
        const drive = st.timeline();
        drive.to(teamPos, { x: 14, duration: 3.6, ease: 'none', onUpdate: placeTeam })
          .to(furrowRect, { attr: { x: -60, width: 200 }, duration: 3.6, ease: 'none' }, 0);
        for (let k = 0; k < 5; k++) {
          drive.call(() => {
            odysseus.to({ armB: [-150, 20] }, { duration: 0.25 });
            gsap.delayedCall(0.25, () => {
              odysseus.to({ armB: [-40, 20] }, { duration: 0.35 });
              sow();
            });
          }, [], 0.2 + k * 0.7);
        }
        await st.play(drive);
        legs.kill();
        walkOx?.pause();
        walkDonkey?.pause();
        return;
      }
      if (i === 3) {
        // Palamedes lays the infant in the path, then withdraws; the team creeps on.
        const tl = st.timeline();
        tl.to(palamedes.g, { x: 112, duration: 1.4, ease: 'power2.out' }, 0)
          .to(carried, { x: 112, duration: 1.4, ease: 'power2.out' }, 0)
          .to(palLabel, { opacity: 1, duration: 0.6 }, 0.8)
          .to(carried, { x: 124, y: 128, rotation: 10, duration: 0.8, ease: 'power2.inOut' }, 1.5)
          .set(carried, { opacity: 0 })
          .set(telemachus, { opacity: 1 });
        palamedes.to({ lean: 30, armF: [100, 20], armB: [90, 20] }, { duration: 0.7, delay: 1.4 });
        await st.play(tl);
        palamedes.to({ ...POSES.walk(-230, GROUND), lean: -2, armF: [110, 20], armB: [-30, 20] }, { duration: 0.6 });
        st.timeline().to(palamedes.g, { x: 20, opacity: 0, duration: 1.4, delay: 0.5, ease: 'power2.in' }).to(palLabel, { opacity: 0, duration: 0.6 }, 0.9);
        walkOx?.play();
        walkDonkey?.play();
        creep = st.to(teamPos, { x: 30, duration: 7, ease: 'none', onUpdate: placeTeam });
        await ctx.tap(odysseus.g, { label: L('Odysseus’a dokun: sabanı durdur', 'Touch Odysseus: stop the plough') });
        creep.kill();
        walkOx?.pause();
        walkDonkey?.pause();
        ctx.audio.sfx('success');
        const stop = st.timeline();
        stop.to(teamPos, { x: teamPos.x - 6, duration: 0.5, ease: 'back.out(2)', onUpdate: placeTeam });
        ox.nod(-18);
        odysseus.to({ lean: -14, armF: [100, -10], armB: [60, 30] }, { duration: 0.5 });
        return st.play(stop);
      }
      if (i === 4) {
        // He lifts his son: the madness was feigned.
        const tl = st.timeline();
        tl.to(telemachus, { opacity: 0, duration: 0.3 }).to([odysseus.g, odyLabel], { opacity: 0, duration: 0.5 }, 0).to([ox.g, donkey.g, plough], { opacity: 0.4, duration: 0.8 }, 0);
        const hero = new Figure({ hat: 'pilos', garment: 'short', cloak: true, facing: -1 }, pose({ ...POSES.stand(-86, GROUND), armF: [160, 20], armB: [150, 30] }));
        t2.appendChild(inscription('ΟΔΥΣΣΕΥΣ', -58, -40, { size: 7, angle: 90 }));
        const lifted = baby();
        const [hx, hy] = hero.hand('F');
        lifted.setAttribute('transform', `translate(${hx - 4} ${hy - 6}) rotate(-8)`);
        t2.append(hero.g, lifted);
        tl.from([hero.g, lifted], { opacity: 0, y: 12, duration: 0.8, ease: 'power3.out' }, 0.2);
        return st.play(tl);
      }
    },

    destroy() {
      st.destroy();
    },
  };
};
