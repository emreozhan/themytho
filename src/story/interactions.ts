/**
 * The ways a chapter waits for the reader: tap a thing in the picture, hold
 * steady, drag something across the tondo, or choose between ostraka.
 * Every helper cleans up after itself when the chapter is left (AbortSignal).
 */
import { s } from '../lib/dom';
import { gsap } from '../lib/motion';
import { clamp } from '../lib/geometry';
import { bind } from '../i18n';
import type { Panel } from '../ui/panel';
import type { Medallion } from '../ui/medallion';
import type { ChoiceOption, DragOptions, HoldOptions, TapOptions } from './types';

export interface Interactions {
  tap(target: SVGGraphicsElement, opts: TapOptions): Promise<void>;
  hold(opts: HoldOptions): Promise<void>;
  drag(target: SVGGraphicsElement, opts: DragOptions): Promise<void>;
  choose(options: ChoiceOption[]): Promise<string>;
  /** Keyboard fallback: activate whatever is currently waiting (Enter). */
  activate(): boolean;
  /** Keyboard hold (Space down/up). */
  holdKey(down: boolean): boolean;
}

export function interactions(medallion: Medallion, panel: Panel, signal: AbortSignal): Interactions {
  let pendingActivate: (() => void) | null = null;
  let pendingHold: ((down: boolean) => void) | null = null;

  const ring = (target: SVGGraphicsElement): SVGGElement | null => {
    try {
      const b = target.getBBox();
      const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
      const r = Math.max(14, Math.min(46, Math.max(b.width, b.height) * 0.62));
      const g = s('g', { class: 'hotspot-ring', 'pointer-events': 'none' });
      const ctm = target.getCTM();
      const rootCtm = medallion.root.getCTM();
      let x = cx, y = cy;
      if (ctm && rootCtm) {
        const m = rootCtm.inverse().multiply(ctm);
        x = m.a * cx + m.c * cy + m.e;
        y = m.b * cx + m.d * cy + m.f;
      }
      g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      g.appendChild(s('circle', { r: r.toFixed(1), class: 'hotspot-ring__a' }));
      g.appendChild(s('circle', { r: r.toFixed(1), class: 'hotspot-ring__b' }));
      medallion.root.appendChild(g);
      return g;
    } catch {
      return null;
    }
  };

  return {
    tap(target, opts) {
      return new Promise((resolve) => {
        if (signal.aborted) return;
        target.classList.add('hotspot');
        target.setAttribute('tabindex', '0');
        target.setAttribute('role', 'button');
        const unbind = bind(target, opts.label, 'aria-label');
        const halo = opts.pulse === false ? null : ring(target);
        const finish = () => {
          cleanup();
          resolve();
        };
        const onKey = (e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            finish();
          }
        };
        const cleanup = () => {
          unbind();
          target.classList.remove('hotspot');
          target.removeAttribute('tabindex');
          target.removeAttribute('role');
          target.removeAttribute('aria-label');
          target.removeEventListener('click', finish);
          target.removeEventListener('keydown', onKey);
          halo?.remove();
          if (pendingActivate === finish) pendingActivate = null;
        };
        target.addEventListener('click', finish);
        target.addEventListener('keydown', onKey);
        pendingActivate = finish;
        signal.addEventListener('abort', cleanup);
      });
    },

    hold(opts) {
      return new Promise((resolve) => {
        if (signal.aborted) return;
        let p = 0;
        let down = false;
        panel.showHold(true, opts.label);
        const tick = (_t: number, dt: number) => {
          const step = dt / 1000 / opts.seconds;
          p = clamp(down ? p + step : p - step * 1.6, 0, 1);
          panel.setHoldProgress(p);
          opts.onProgress?.(p);
          if (p >= 1) {
            cleanup();
            resolve();
          }
        };
        const on = (e?: Event) => {
          e?.preventDefault();
          down = true;
        };
        const off = () => {
          down = false;
        };
        const btn = panel.holdBtn;
        const targets: EventTarget[] = [btn];
        if (opts.target) {
          opts.target.classList.add('hotspot');
          targets.push(opts.target);
        }
        targets.forEach((t) => {
          t.addEventListener('pointerdown', on as EventListener);
          t.addEventListener('pointerup', off);
          t.addEventListener('pointerleave', off);
          t.addEventListener('pointercancel', off);
        });
        const key = (e: KeyboardEvent) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (e.type === 'keydown') on();
            else off();
          }
        };
        btn.addEventListener('keydown', key);
        btn.addEventListener('keyup', key);
        pendingHold = (d) => (d ? on() : off());
        gsap.ticker.add(tick);
        const cleanup = () => {
          gsap.ticker.remove(tick);
          targets.forEach((t) => {
            t.removeEventListener('pointerdown', on as EventListener);
            t.removeEventListener('pointerup', off);
            t.removeEventListener('pointerleave', off);
            t.removeEventListener('pointercancel', off);
          });
          btn.removeEventListener('keydown', key);
          btn.removeEventListener('keyup', key);
          opts.target?.classList.remove('hotspot');
          panel.showHold(false);
          pendingHold = null;
        };
        signal.addEventListener('abort', cleanup);
        requestAnimationFrame(() => btn.focus({ preventScroll: true }));
      });
    },

    drag(target, opts) {
      return new Promise((resolve) => {
        if (signal.aborted) return;
        let p = 0;
        let start: [number, number] | null = null;
        let base = 0;
        const unitsPerPx = () => 400 / Math.max(1, medallion.diameter());
        target.classList.add('hotspot', 'hotspot--drag');
        target.setAttribute('tabindex', '0');
        target.setAttribute('role', 'slider');
        const unbind = bind(target, opts.label, 'aria-label');
        target.setAttribute('aria-valuemin', '0');
        target.setAttribute('aria-valuemax', '100');
        const halo = ring(target);
        const set = (v: number) => {
          p = clamp(v, 0, 1);
          target.setAttribute('aria-valuenow', String(Math.round(p * 100)));
          opts.onProgress(p);
        };
        const complete = () => {
          cleanup();
          const proxy = { v: p };
          gsap.to(proxy, { v: 1, duration: 0.35 * (1 - p) + 0.05, ease: 'power2.out', onUpdate: () => set(proxy.v), onComplete: () => resolve() });
        };
        const down = (e: PointerEvent) => {
          e.preventDefault();
          target.setPointerCapture(e.pointerId);
          start = [e.clientX, e.clientY];
          base = p;
          halo?.remove();
          target.classList.add('is-dragging');
        };
        const move = (e: PointerEvent) => {
          if (!start) return;
          const k = unitsPerPx();
          const dx = (e.clientX - start[0]) * k, dy = (e.clientY - start[1]) * k;
          const d = opts.axis === 'x' ? dx : opts.axis === 'y' ? dy : Math.hypot(dx, dy) * Math.sign(dx + dy || 1);
          set(base + d / opts.distance);
          if (p >= 0.999) complete();
        };
        const up = () => {
          if (!start) return;
          start = null;
          target.classList.remove('is-dragging');
          if (p > 0.9) complete();
          else if (opts.springBack !== false) {
            const proxy = { v: p };
            gsap.to(proxy, { v: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)', onUpdate: () => set(proxy.v) });
          }
        };
        const key = (e: KeyboardEvent) => {
          const fwd = opts.distance > 0 ? ['ArrowRight', 'ArrowDown'] : ['ArrowLeft', 'ArrowUp'];
          if (fwd.includes(e.key) || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            set(p + (e.key === 'Enter' || e.key === ' ' ? 1 : 0.14));
            if (p >= 0.999) complete();
          }
        };
        target.addEventListener('pointerdown', down);
        target.addEventListener('pointermove', move);
        target.addEventListener('pointerup', up);
        target.addEventListener('pointercancel', up);
        target.addEventListener('keydown', key);
        pendingActivate = () => {
          set(1);
          complete();
        };
        const cleanup = () => {
          unbind();
          target.classList.remove('hotspot', 'hotspot--drag', 'is-dragging');
          ['tabindex', 'role', 'aria-label', 'aria-valuemin', 'aria-valuemax', 'aria-valuenow'].forEach((a) => target.removeAttribute(a));
          target.removeEventListener('pointerdown', down);
          target.removeEventListener('pointermove', move);
          target.removeEventListener('pointerup', up);
          target.removeEventListener('pointercancel', up);
          target.removeEventListener('keydown', key);
          halo?.remove();
          pendingActivate = null;
        };
        signal.addEventListener('abort', cleanup);
      });
    },

    choose(options) {
      return panel.choose(options, signal);
    },

    activate() {
      if (!pendingActivate) return false;
      pendingActivate();
      return true;
    },

    holdKey(down) {
      if (!pendingHold) return false;
      pendingHold(down);
      return true;
    },
  };
}
