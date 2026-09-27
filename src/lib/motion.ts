/**
 * Motion system: GSAP registration plus the shared vocabulary of eases and
 * durations, so every transition on the site speaks the same rhythm.
 */
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(CustomEase, DrawSVGPlugin, MorphSVGPlugin, SplitText);

/** A slow, sail-like ease: gentle departure, long glide, soft landing. */
CustomEase.create('sail', 'M0,0 C0.3,0 0.22,0.35 0.5,0.62 0.72,0.84 0.82,1 1,1');
/** A drawn-brush ease for strokes. */
CustomEase.create('brush', 'M0,0 C0.18,0.02 0.28,0.62 0.52,0.84 0.7,0.98 0.86,1 1,1');

export const EASE = {
  out: 'power3.out',
  in: 'power2.in',
  inOut: 'power2.inOut',
  expo: 'expo.inOut',
  back: 'back.out(1.7)',
  sail: 'sail',
  brush: 'brush',
  sine: 'sine.inOut',
} as const;

export const DUR = {
  xs: 0.18,
  s: 0.38,
  m: 0.7,
  l: 1.2,
  xl: 2.0,
} as const;

const media = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;

/** True when the visitor asked the OS for reduced motion. */
export function prefersReducedMotion(): boolean {
  return !!media?.matches;
}

/** Scale a duration down when motion should be reduced. */
export function t(seconds: number): number {
  return prefersReducedMotion() ? Math.min(seconds, 0.12) : seconds;
}

/** Promise that resolves after `seconds` (respecting reduced motion). */
export function wait(seconds: number): Promise<void> {
  return new Promise((resolve) => gsap.delayedCall(t(seconds), resolve));
}

/** Resolve when a tween or timeline completes. */
export function done(anim: gsap.core.Animation): Promise<void> {
  return new Promise((resolve) => {
    if (anim.progress() === 1 && !anim.reversed()) return resolve();
    anim.eventCallback('onComplete', () => resolve());
  });
}

export { gsap, SplitText };
