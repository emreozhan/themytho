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
  /**
   * Resolve when the animation completes. Once the reader has left the
   * chapter it never resolves, so a stale scene simply stops where it was.
   */
  play(anim: gsap.core.Animation): Promise<void>;
  /** Tween helper that is also cleaned up. */
  to(target: gsap.TweenTarget, vars: gsap.TweenVars): gsap.core.Tween;
  /** Wait (scene time); like `play`, it never resolves after the chapter is left. */
  wait(seconds: number): Promise<void>;
  /** Kill everything. Call from the scene's destroy(). */
  destroy(): void;
}

export function stage(ctx: SceneContext): Stage {
  const anims = new Set<gsap.core.Animation>();
  let dead = false;
  const gone = () => dead || ctx.signal.aborted;
  // Anything started after the chapter was left is stopped on the spot, so a
  // late callback can never leave an endless tween running on a dead picture.
  const track = <T extends gsap.core.Animation>(a: T): T => {
    if (gone()) a.kill();
    else anims.add(a);
    return a;
  };
  const halt = () => new Promise<void>(() => undefined);
  const scale = (d: number) => (ctx.reduced ? Math.min(d, 0.15) : d);
  return {
    loop: (a) => {
      if (ctx.reduced) a.progress(0.5).pause();
      return track(a);
    },
    timeline: (vars) => track(gsap.timeline(vars)),
    play: (anim) => {
      if (gone()) return halt();
      track(anim);
      if (ctx.reduced) anim.progress(1);
      if (anim.progress() === 1) return Promise.resolve();
      return new Promise((resolve) => {
        // Chain onto the scene's own onComplete instead of replacing it.
        const own = anim.eventCallback('onComplete');
        anim.eventCallback('onComplete', (...args: unknown[]) => {
          own?.apply(anim, args);
          resolve();
        });
      });
    },
    to: (target, vars) => track(gsap.to(target, { ...vars, duration: scale((vars.duration as number | undefined) ?? 0.5) })),
    wait: (seconds) => {
      if (gone()) return halt();
      return new Promise((resolve) => track(gsap.delayedCall(scale(seconds), resolve)));
    },
    destroy: () => {
      dead = true;
      anims.forEach((a) => a.kill());
      anims.clear();
    },
  };
}
