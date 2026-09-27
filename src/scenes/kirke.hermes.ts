/**
 * Hermes, the messenger of the gods, for the Kirke and Kalypso tondos:
 * travelling hat (petasos), winged boots, a short chlamys and the herald's
 * staff (kerykeion) with its snake-headed figure-eight crown.
 */
import { s } from '../lib/dom';
import { gsap } from '../lib/motion';
import { POSES, pose, INK, CLAY, PURPLE, WHITE, type Pose } from '../art/figure';
import { inscription } from '../art/kit';
import { Actor } from './kirke.rig';

/**
 * The herald's staff, standing on its origin and rising `len` upwards
 * (grip point at the origin, a quarter of the shaft below the hand).
 */
export function kerykeion(len = 50, color = INK): SVGGElement {
  const g = s('g', { class: 'kerykeion' });
  const top = -len * 0.74;
  const bot = len * 0.26;
  g.appendChild(s('line', { x1: 0, y1: bot, x2: 0, y2: top, stroke: color, 'stroke-width': 1.5, 'stroke-linecap': 'round' }));
  // Lower ring and the two snake heads curling towards each other.
  g.appendChild(s('circle', { cx: 0, cy: top - 3.4, r: 3.4, fill: 'none', stroke: color, 'stroke-width': 1.4 }));
  g.appendChild(
    s('path', {
      d: `M-0.6 ${top - 6.6}C-5.6 ${top - 8.2} -6.6 ${top - 13.6} -2.6 ${top - 14.4}M0.6 ${top - 6.6}C5.6 ${top - 8.2} 6.6 ${top - 13.6} 2.6 ${top - 14.4}`,
      fill: 'none',
      stroke: color,
      'stroke-width': 1.4,
      'stroke-linecap': 'round',
    }),
  );
  g.appendChild(s('path', { d: `M-2.6 ${top - 14.4}l1.9 -0.6l-0.4 1.8zM2.6 ${top - 14.4}l-1.9 -0.6l0.4 1.8z`, fill: color, stroke: color, 'stroke-width': 0.8 }));
  // Ribbon ties below the ring.
  g.appendChild(s('path', { d: `M0 ${top + 1}l-4 3.4M0 ${top + 1}l4 3.4`, stroke: color, 'stroke-width': 0.9, 'stroke-linecap': 'round' }));
  return g;
}

export interface HermesOptions {
  x: number;
  ground: number;
  facing?: 1 | -1;
  /** Ground colour for the incisions (CLAY on a black-figure cup). */
  ground_color?: string;
  label?: boolean;
}

export interface HermesActor extends Actor {
  staff: SVGGElement;
  label: SVGGElement | null;
}

/** Build Hermes standing at x on the groundline, kerykeion in his back hand. */
export function makeHermes(o: HermesOptions): HermesActor {
  const facing = o.facing ?? 1;
  const a = new Actor(
    { head: 'bearded', hat: 'petasos', garment: 'short', garmentColor: PURPLE, cloak: true, cloakColor: INK, wingedFeet: true, facing, ground: o.ground_color ?? CLAY },
    pose({ ...POSES.stand(o.x, o.ground), armF: [40, 40], armB: [30, 70] }),
    'hermes',
  ) as HermesActor;
  const staff = kerykeion(52);
  a.hold(staff, 'B', { mode: 'upright', angle: 8, along: 2.4 });
  a.staff = staff;
  a.label = null;
  if (o.label !== false) {
    const [hx, hy] = a.headPoint();
    const lab = inscription('ΗΕΡΜΕΣ', hx - facing * 17, hy - 6, { size: 5.6, angle: 90 });
    a.front.appendChild(lab);
    a.label = lab;
  }
  return a;
}

/** Pose of the flying god: the archaic "Knielauf" with the staff held high. */
export function flyingPose(x: number, ground: number): Partial<Pose> {
  return { ...POSES.knielauf(x, ground), armF: [70, 40], armB: [110, 50], lean: 18 };
}

/**
 * Swoop in: Hermes glides along a curve from (dx, dy) (relative offset of the
 * actor wrapper) down to rest, then lands. Returns the timeline.
 */
export function swoop(h: Actor, from: [number, number], land: Partial<Pose>, dur = 1.8): gsap.core.Timeline {
  const tl = gsap.timeline();
  const p = { t: 0 };
  const [fx, fy] = from;
  // Control point: overshoot below the path for a diving arc.
  const cx = fx * 0.25, cy = fy * 0.05 + 18;
  const place = () => {
    const t = p.t, u = 1 - t;
    const x = u * u * fx + 2 * u * t * cx;
    const y = u * u * fy + 2 * u * t * cy;
    // Tilt into the dive and level out when landing.
    const tilt = (1 - t) * 14 * Math.sign(fx || 1) * -1;
    h.g.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${tilt.toFixed(2)} ${h.pose.x.toFixed(1)} ${(h.pose.y + 20).toFixed(1)})`);
  };
  place();
  tl.to(p, { t: 1, duration: dur, ease: 'power2.out', onUpdate: place });
  tl.add(h.to(land, { duration: 0.55, ease: 'power2.out' }), dur - 0.35);
  return tl;
}

/** Leave: a spring upwards and away (dx, dy) while fading out. */
export function soar(h: Actor, to: [number, number], dur = 1.2): gsap.core.Timeline {
  const tl = gsap.timeline();
  const p = { t: 0 };
  const [tx, ty] = to;
  const place = () => {
    const t = p.t;
    const x = tx * t * t;
    const y = ty * (1 - (1 - t) * (1 - t));
    h.g.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${(t * 12 * Math.sign(tx || 1)).toFixed(2)} ${h.pose.x.toFixed(1)} ${(h.pose.y + 20).toFixed(1)})`);
  };
  tl.add(h.to({ ...flyingPose(h.pose.x, h.pose.y + 50.2) }, { duration: 0.4 }), 0);
  tl.to(p, { t: 1, duration: dur, ease: 'power1.in', onUpdate: place }, 0.15);
  tl.to(h.g, { opacity: 0, duration: 0.4 }, dur - 0.25);
  return tl;
}

/** Little flutter of the boot wings and the chlamys while flying (idle loop). */
export function flutter(h: Actor): gsap.core.Tween {
  const wings = h.part('wings');
  return gsap.to(wings, { attr: { 'stroke-width': 1.4 }, fill: WHITE, duration: 0.18, yoyo: true, repeat: -1, ease: 'sine.inOut' });
}
