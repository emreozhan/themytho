/**
 * The stage for every chapter: the tondo of a kylix — a round picture
 * painted inside a drinking cup, framed by a meander band. Scenes draw into
 * `root` (centre 0,0, radius RADIUS). The medallion rises out of the map
 * marker on arrival and sinks back into it on departure.
 */
import { s, h, nextId } from '../lib/dom';
import { gsap, t as dur, prefersReducedMotion } from '../lib/motion';
import { meanderRing } from '../art/ornaments';
import { CLAY, INK } from '../art/figure';

export const RADIUS = 166;

export class Medallion {
  readonly el: HTMLDivElement;
  readonly svg: SVGSVGElement;
  readonly defs: SVGDefsElement;
  readonly root: SVGGElement;
  /** The rim and meander band, in their own layer so turning them never repaints the scene. */
  private ring: SVGSVGElement;
  private spin: gsap.core.Tween;

  constructor(host: HTMLElement) {
    // A labelled group: the painting itself is decoration, but the things you can
    // touch inside it are real buttons/sliders for keyboards and screen readers.
    this.el = h('div', { class: 'medallion', role: 'group', 'aria-roledescription': 'sahne' });
    this.svg = s('svg', { class: 'medallion__svg', viewBox: '-200 -200 400 400', focusable: 'false' });
    this.defs = s('defs');
    const clipId = nextId('tondo');
    const clip = s('clipPath', { id: clipId });
    clip.appendChild(s('circle', { r: RADIUS }));
    const shade = nextId('tondo-shade');
    const grad = s('radialGradient', { id: shade, cx: '42%', cy: '36%', r: '70%' });
    grad.append(
      s('stop', { offset: '0%', 'stop-color': '#d9824a' }),
      s('stop', { offset: '70%', 'stop-color': CLAY }),
      s('stop', { offset: '100%', 'stop-color': '#a9542a' }),
    );
    const gloss = nextId('gloss');
    const glossGrad = s('radialGradient', { id: gloss, cx: '30%', cy: '22%', r: '60%' });
    glossGrad.append(
      s('stop', { offset: '0%', 'stop-color': '#fff', 'stop-opacity': 0.13 }),
      s('stop', { offset: '100%', 'stop-color': '#fff', 'stop-opacity': 0 }),
    );
    this.defs.append(clip, grad, glossGrad);
    this.svg.appendChild(this.defs);

    // Cup: black glaze rim and the meander band on reserved clay, drawn in a
    // separate layer behind the picture: the band turns slowly, and a turning
    // shape inside the scene's own SVG would repaint the whole tondo every frame.
    this.ring = s('svg', { class: 'medallion__ring', viewBox: '-200 -200 400 400', focusable: 'false', 'aria-hidden': 'true' });
    this.ring.appendChild(s('circle', { r: 199, fill: INK }));
    this.ring.appendChild(s('circle', { r: 191, fill: CLAY }));
    this.ring.appendChild(meanderRing({ rOuter: 189, rInner: 171.5, color: INK, units: 40 }));
    this.svg.appendChild(s('circle', { r: RADIUS + 1.5, fill: INK }));
    const tondo = s('g', { 'clip-path': `url(#${clipId})` });
    tondo.appendChild(s('circle', { r: RADIUS, fill: `url(#${shade})` }));
    this.root = s('g', { class: 'medallion__scene' });
    tondo.appendChild(this.root);
    this.svg.appendChild(tondo);
    this.svg.appendChild(s('circle', { r: 199, fill: `url(#${gloss})`, 'pointer-events': 'none' }));
    this.el.append(this.ring, this.svg);
    host.appendChild(this.el);

    this.spin = gsap.to(this.ring, { rotation: 360, duration: 240, ease: 'none', repeat: -1, paused: true });
    gsap.set(this.el, { autoAlpha: 0 });
  }

  clear(): void {
    while (this.root.firstChild) this.root.removeChild(this.root.firstChild);
    // Keep the shared gradients/clip; drop per-scene defs.
    [...this.defs.querySelectorAll('[data-scene]')].forEach((n) => n.remove());
  }

  /** Layout centre, ignoring transforms: emerge, retreat and dock offsets are relative to it. */
  center(): [number, number] {
    const el = this.el;
    return [el.offsetLeft + el.offsetWidth / 2, el.offsetTop + el.offsetHeight / 2];
  }

  diameter(): number {
    return this.el.getBoundingClientRect().width;
  }

  /** Rise from a screen point (the map marker) into place. */
  emerge(from?: [number, number]): Promise<void> {
    if (!prefersReducedMotion()) this.spin.play();
    const [cx, cy] = this.center();
    const dx = from ? from[0] - cx : 0;
    const dy = from ? from[1] - cy : 40;
    gsap.killTweensOf(this.el);
    return new Promise((resolve) => {
      gsap.fromTo(
        this.el,
        { autoAlpha: 0, x: dx, y: dy, scale: 0.06, rotation: -40 },
        { autoAlpha: 1, x: 0, y: 0, scale: 1, rotation: 0, duration: dur(1.15), ease: 'expo.out', onComplete: resolve },
      );
    });
  }

  /** Sink back into a screen point. */
  retreat(to?: [number, number]): Promise<void> {
    const [cx, cy] = this.center();
    const dx = to ? to[0] - cx : 0;
    const dy = to ? to[1] - cy : 40;
    gsap.killTweensOf(this.el);
    return new Promise((resolve) => {
      gsap.to(this.el, {
        autoAlpha: 0,
        x: dx,
        y: dy,
        scale: 0.06,
        rotation: 30,
        duration: dur(0.75),
        ease: 'power3.in',
        onComplete: () => {
          this.spin.pause();
          gsap.set(this.el, { x: 0, y: 0, rotation: 0 });
          resolve();
        },
      });
    });
  }

  /**
   * Shrink the cup into a screen point so the map can show a voyage beside
   * it (`at` = null returns it to its place). The scene keeps playing inside.
   */
  dock(at: [number, number] | null, scale = 0.5): Promise<void> {
    const [cx, cy] = this.center();
    gsap.killTweensOf(this.el, 'x,y,scale');
    return new Promise((resolve) => {
      gsap.to(this.el, {
        x: at ? at[0] - cx : 0,
        y: at ? at[1] - cy : 0,
        scale: at ? scale : 1,
        duration: dur(0.8),
        ease: 'power3.inOut',
        onComplete: resolve,
      });
    });
  }

  hideNow(): void {
    gsap.killTweensOf(this.el);
    gsap.set(this.el, { autoAlpha: 0 });
    this.spin.pause();
  }
}
