/**
 * Small helpers every scene uses: registered animations that are killed when
 * the chapter ends, promise-returning timelines, and a helper to fade layers in.
 */
import { gsap } from '../lib/motion';
import type { SceneContext } from '../story/types';

export interface Stage {
  /** Register an endless/idle animation; it is killed on destroy. */
  loop<T extends gsap.core.Animation>(anim: T): T;
  /** A timeline that is killed on destroy. `play(tl)` awaits it. */
  timeline(vars?: gsap.TimelineVars): gsap.core.Timeline;
  /** Resolve when the animation completes (or immediately when aborted). */
  play(anim: gsap.core.Animation): Promise<void>;
  /** Tween helper that is also cleaned up. */
  to(target: gsap.TweenTarget, vars: gsap.TweenVars): gsap.core.Tween;
  /** Wait (scene time), resolving early if the chapter is left. */
  wait(seconds: number): Promise<void>;
  /** Kill everything. Call from the scene's destroy(). */
  destroy(): void;
}

export function stage(ctx: SceneContext): Stage {
  const anims = new Set<gsap.core.Animation>();
  const track = <T extends gsap.core.Animation>(a: T): T => {
    anims.add(a);
    return a;
  };
  const scale = (d: number) => (ctx.reduced ? Math.min(d, 0.15) : d);
  return {
    loop: (a) => {
      if (ctx.reduced) a.progress(0.5).pause();
      return track(a);
    },
    timeline: (vars) => track(gsap.timeline(vars)),
    play: (anim) =>
      new Promise((resolve) => {
        if (ctx.signal.aborted) return resolve();
        if (ctx.reduced) anim.progress(1);
        if (anim.progress() === 1) return resolve();
        anim.eventCallback('onComplete', () => resolve());
        ctx.signal.addEventListener('abort', () => resolve());
      }),
    to: (target, vars) => track(gsap.to(target, { ...vars, duration: scale((vars.duration as number | undefined) ?? 0.5) })),
    wait: (seconds) =>
      new Promise((resolve) => {
        const call = gsap.delayedCall(scale(seconds), resolve);
        track(call);
        ctx.signal.addEventListener('abort', () => resolve());
      }),
    destroy: () => {
      anims.forEach((a) => a.kill());
      anims.clear();
    },
  };
}
