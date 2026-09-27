/**
 * The stage for every chapter: the tondo of a kylix — a round picture
 * painted inside a drinking cup, framed by a meander band. Scenes draw into
 * `root` (centre 0,0, radius RADIUS). The medallion rises out of the map
 * marker on arrival and sinks back into it on departure.
 */
import { s, h, nextId } from '../lib/dom';
import { gsap } from '../lib/motion';
import { meanderRing } from '../art/ornaments';
import { CLAY, INK } from '../art/figure';

export const RADIUS = 166;

export class Medallion {
  readonly el: HTMLDivElement;
  readonly svg: SVGSVGElement;
  readonly defs: SVGDefsElement;
  readonly root: SVGGElement;
  private ring: SVGGElement;
  private spin: gsap.core.Tween;

  constructor(host: HTMLElement) {
    this.el = h('div', { class: 'medallion', 'aria-hidden': 'true' });
    this.svg = s('svg', { class: 'medallion__svg', viewBox: '-200 -200 400 400', role: 'img' });
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

    // Cup: black glaze rim, meander band on reserved clay, the tondo itself.
    this.svg.appendChild(s('circle', { r: 199, fill: INK, class: 'medallion__rim' }));
    this.ring = s('g', { class: 'medallion__ring' });
    this.ring.appendChild(s('circle', { r: 191, fill: CLAY }));
    const m = meanderRing({ rOuter: 189, rInner: 171.5, color: INK, units: 40 });
    this.ring.appendChild(m);
    this.svg.appendChild(this.ring);
    this.svg.appendChild(s('circle', { r: RADIUS + 1.5, fill: INK }));
    const tondo = s('g', { 'clip-path': `url(#${clipId})` });
    tondo.appendChild(s('circle', { r: RADIUS, fill: `url(#${shade})` }));
    this.root = s('g', { class: 'medallion__scene' });
    tondo.appendChild(this.root);
    this.svg.appendChild(tondo);
    this.svg.appendChild(s('circle', { r: 199, fill: `url(#${gloss})`, 'pointer-events': 'none' }));
    this.el.appendChild(this.svg);
    host.appendChild(this.el);

    this.spin = gsap.to(this.ring, { rotation: 360, svgOrigin: '0 0', duration: 240, ease: 'none', repeat: -1, paused: true });
    gsap.set(this.el, { autoAlpha: 0 });
  }

  clear(): void {
    while (this.root.firstChild) this.root.removeChild(this.root.firstChild);
    // Keep the shared gradients/clip; drop per-scene defs.
    [...this.defs.querySelectorAll('[data-scene]')].forEach((n) => n.remove());
  }

  /** Current centre of the medallion on screen. */
  center(): [number, number] {
    const r = this.el.getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  }

  diameter(): number {
    return this.el.getBoundingClientRect().width;
  }

  /** Rise from a screen point (the map marker) into place. */
  emerge(from?: [number, number]): Promise<void> {
    this.spin.play();
    const [cx, cy] = this.center();
    const dx = from ? from[0] - cx : 0;
    const dy = from ? from[1] - cy : 40;
    gsap.killTweensOf(this.el);
    return new Promise((resolve) => {
      gsap.fromTo(
        this.el,
        { autoAlpha: 0, x: dx, y: dy, scale: 0.06, rotation: -40 },
        { autoAlpha: 1, x: 0, y: 0, scale: 1, rotation: 0, duration: 1.15, ease: 'expo.out', onComplete: resolve },
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
        duration: 0.75,
        ease: 'power3.in',
        onComplete: () => {
          this.spin.pause();
          gsap.set(this.el, { x: 0, y: 0, rotation: 0 });
          resolve();
        },
      });
    });
  }

  hideNow(): void {
    gsap.killTweensOf(this.el);
    gsap.set(this.el, { autoAlpha: 0 });
    this.spin.pause();
  }
}
