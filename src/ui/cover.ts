/**
 * The cover: an emblem painted like a cup tondo, the title written stroke by
 * stroke, Homer's first line, and the other volumes of the atlas to come.
 */
import { h, s } from '../lib/dom';
import { gsap, SplitText, prefersReducedMotion } from '../lib/motion';
import { greekText } from '../art/letters';
import { meanderRing, waveRing, dotRing, rosette, waveStripPath } from '../art/ornaments';
import { ship, rowing, BLACK_FIGURE } from '../art/ship';
import { CLAY, INK } from '../art/figure';
import { ICONS } from './icons';
import type { Story } from '../story/types';

export interface Volume {
  numeral: string;
  title: string;
  note: string;
  ready: boolean;
}

export const VOLUMES: Volume[] = [
  { numeral: 'I', title: 'Odysseia', note: 'Odysseus’un yolculuğu', ready: true },
  { numeral: 'II', title: 'Argonautika', note: 'İason ve Altın Post', ready: false },
  { numeral: 'III', title: 'Herakles', note: 'On iki görev', ready: false },
  { numeral: 'IV', title: 'Theseus', note: 'Labirent ve Minotauros', ready: false },
  { numeral: 'V', title: 'Perseus', note: 'Medusa’nın başı', ready: false },
];

function emblem(): { svg: SVGSVGElement; rings: SVGGElement[]; ship: SVGGElement; oars: SVGGElement; waves: SVGGElement; dolphins: SVGGElement[] } {
  const svg = s('svg', { class: 'cover__emblem-svg', viewBox: '-210 -210 420 420', 'aria-hidden': 'true' });
  const outer = s('g', { class: 'cover__ring-outer' });
  outer.appendChild(s('circle', { r: 206, fill: INK }));
  outer.appendChild(s('circle', { r: 200, fill: CLAY }));
  outer.appendChild(meanderRing({ rOuter: 198, rInner: 178, color: INK, units: 44 }));
  const mid = s('g', { class: 'cover__ring-mid' });
  mid.appendChild(s('circle', { r: 175, fill: INK }));
  mid.appendChild(waveRing({ rOuter: 173, rInner: 156, color: CLAY, units: 22 }));
  const inner = s('g');
  inner.appendChild(s('circle', { r: 152, fill: CLAY }));
  inner.appendChild(dotRing(146, 72, 1.6, INK));
  // The picture: a ship running before the wind over a band of waves.
  const clipId = 'cover-clip';
  const clip = s('clipPath', { id: clipId });
  clip.appendChild(s('circle', { r: 140 }));
  const defs = s('defs');
  defs.appendChild(clip);
  svg.appendChild(defs);
  const pic = s('g', { 'clip-path': `url(#${clipId})` });
  const waves = s('g', { class: 'cover__waves' });
  waves.appendChild(s('path', { d: waveStripPath(560, 26), transform: 'translate(-280 52)', fill: INK }));
  waves.appendChild(s('rect', { x: -280, y: 77, width: 560, height: 80, fill: INK }));
  const ghostWaves = s('path', { d: waveStripPath(560, 18), transform: 'translate(-300 94)', fill: CLAY, opacity: 0.35 });
  waves.appendChild(ghostWaves);
  const sh = ship({ palette: BLACK_FIGURE, crew: 7 });
  const shipG = s('g', { class: 'cover__ship', transform: 'translate(0 58) scale(1.55)' });
  shipG.appendChild(sh.g);
  const dolphins: SVGGElement[] = [];
  for (const [x, y, k, f] of [[-78, 112, 0.5, 1], [84, 124, 0.44, -1]] as const) {
    const d = s('g', { class: 'cover__dolphin', transform: `translate(${x} ${y}) scale(${k * f} ${k})` });
    d.appendChild(s('path', { d: 'M-30 8C-20 -6 0 -14 14 -10C22 -8 28 -2 32 2L22 2C14 6 -10 12 -24 16Z M-28 10L-40 2L-34 12L-40 22Z M0 -12L-6 -24L8 -14Z', fill: CLAY }));
    d.appendChild(s('circle', { cx: 20, cy: -4, r: 1.6, fill: INK }));
    dolphins.push(d);
  }
  pic.append(shipG, waves, ...dolphins);
  pic.appendChild(rosette(-104, -62, 9, 8, INK));
  pic.appendChild(rosette(108, -40, 7, 8, INK));
  pic.appendChild(rosette(-40, -108, 6, 8, INK));
  const sun = s('g', { class: 'cover__sun' });
  sun.appendChild(s('circle', { cx: 86, cy: -92, r: 13, fill: INK }));
  inner.appendChild(pic);
  inner.appendChild(sun);
  svg.append(outer, mid, inner);
  return { svg, rings: [outer, mid], ship: shipG, oars: sh.oars, waves, dolphins };
}

export class Cover {
  readonly el: HTMLElement;
  private startBtn: HTMLButtonElement;
  private title: ReturnType<typeof greekText>;
  private em: ReturnType<typeof emblem>;
  private loops: gsap.core.Animation[] = [];
  onStart: () => void = () => {};

  constructor(host: HTMLElement, story: Story) {
    this.em = emblem();
    this.title = greekText(story.greekTitle, { size: 60, weight: 0.9, tracking: 3.2, align: 'middle' });
    const titleSvg = s('svg', { class: 'cover__title-svg', viewBox: '-260 -44 520 88', role: 'img', 'aria-label': story.greekTitle });
    titleSvg.appendChild(this.title.g);
    this.startBtn = h('button', { class: 'btn btn--primary cover__start', type: 'button' }, [h('span', {}, ['Yolculuğa başla'])]);
    this.startBtn.insertAdjacentHTML('beforeend', ICONS.next);
    this.startBtn.addEventListener('click', () => this.onStart());
    const volumes = h('ul', { class: 'cover__volumes', 'aria-label': 'Atlasın ciltleri' });
    VOLUMES.forEach((v) =>
      volumes.appendChild(
        h('li', { class: `cover__volume${v.ready ? ' is-ready' : ''}` }, [
          h('span', { class: 'cover__vol-num' }, [`Cilt ${v.numeral}`]),
          h('span', { class: 'cover__vol-title' }, [v.title]),
          h('span', { class: 'cover__vol-note' }, [v.ready ? v.note : 'yakında']),
        ]),
      ),
    );
    this.el = h('section', { class: 'cover', 'aria-labelledby': 'cover-heading' }, [
      h('div', { class: 'cover__inner' }, [
        h('div', { class: 'cover__emblem' }, [this.em.svg]),
        h('div', { class: 'cover__text' }, [
          h('p', { class: 'cover__kicker' }, ['Mitos Atlası · Cilt I']),
          h('h1', { class: 'cover__heading', id: 'cover-heading' }, [titleSvg, h('span', { class: 'sr-only' }, ['Odysseia'])]),
          h('p', { class: 'cover__subtitle' }, ['Odysseus’un yirmi yıllık yolculuğu']),
          h('p', { class: 'cover__lede' }, [
            'İthaka’dan Troya’ya, oradan yeniden eve. Haritada gemileri izle; her durakta kupanın içine çizilmiş sahneyi aç, ',
            'hikâyeye dokun, sürükle, karar ver.',
          ]),
          h('blockquote', { class: 'cover__quote' }, [
            h('p', { class: 'cover__quote-gr', lang: 'grc' }, ['Ἄνδρα μοι ἔννεπε, Μοῦσα, πολύτροπον, ὃς μάλα πολλὰ / πλάγχθη, ἐπεὶ Τροίης ἱερὸν πτολίεθρον ἔπερσεν·']),
            h('p', { class: 'cover__quote-tr' }, ['Anlat bana, ey Musa, o çok yönlü adamı; Troya’nın kutsal kalesini yıktıktan sonra nice diyarlarda savrulan adamı.']),
            h('footer', {}, ['Odysseia 1.1–2']),
          ]),
          h('div', { class: 'cover__actions' }, [
            this.startBtn,
            h('p', { class: 'cover__hint' }, ['İlerlemek için → tuşu, kaydırma ya da “Devam”. Ses için lir simgesi.']),
          ]),
        ]),
      ]),
      volumes,
    ]);
    host.appendChild(this.el);
  }

  /** Play the entrance: rings, picture, then the title writing itself. */
  play(): void {
    const em = this.em;
    this.loops.push(
      gsap.to(em.rings[0], { rotation: 360, svgOrigin: '0 0', duration: 160, ease: 'none', repeat: -1 }),
      gsap.to(em.rings[1], { rotation: -360, svgOrigin: '0 0', duration: 120, ease: 'none', repeat: -1 }),
      gsap.to(em.ship, { y: '+=4', rotation: 1.5, svgOrigin: '0 58', duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1 }),
      gsap.to(em.waves, { x: -40, duration: 6, ease: 'none', repeat: -1 }),
      rowing(em.oars, gsap, 0.8),
    );
    em.dolphins.forEach((d, i) => {
      this.loops.push(gsap.to(d, { y: '-=16', rotation: i ? 12 : -12, duration: 1.6, delay: i * 0.8, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 50%' }));
    });
    if (prefersReducedMotion()) return;
    const tl = gsap.timeline({ delay: 0.2 });
    tl.from(this.el.querySelector('.cover__emblem'), { scale: 0.6, rotation: -30, opacity: 0, duration: 1.6, ease: 'expo.out' })
      .from(this.el.querySelector('.cover__kicker'), { opacity: 0, y: 10, duration: 0.8 }, 0.5)
      .fromTo(this.title.paths, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.4, stagger: 0.12, ease: 'brush' }, 0.6)
      .from(this.el.querySelector('.cover__subtitle'), { opacity: 0, y: 12, duration: 0.9 }, 1.3)
      .from(this.el.querySelector('.cover__lede'), { opacity: 0, y: 12, duration: 0.9 }, 1.5);
    const gr = new SplitText(this.el.querySelector('.cover__quote-gr') as HTMLElement, { type: 'words' });
    tl.from(gr.words, { opacity: 0, filter: 'blur(6px)', duration: 0.8, stagger: 0.05 }, 1.7)
      .from(this.el.querySelectorAll('.cover__quote-tr, .cover__quote footer'), { opacity: 0, duration: 1 }, 2.3)
      .from(this.el.querySelector('.cover__actions'), { opacity: 0, y: 16, duration: 0.9, ease: 'back.out(1.6)' }, 2.5)
      .from(this.el.querySelectorAll('.cover__volume'), { opacity: 0, y: 10, duration: 0.6, stagger: 0.08 }, 2.8);
    requestAnimationFrame(() => this.startBtn.focus({ preventScroll: true }));
  }

  hide(): Promise<void> {
    return new Promise((resolve) => {
      gsap.to(this.el, {
        opacity: 0,
        scale: 1.04,
        duration: 1,
        ease: 'power2.inOut',
        onComplete: () => {
          this.el.hidden = true;
          this.loops.forEach((l) => l.kill());
          this.loops = [];
          resolve();
        },
      });
    });
  }

  show(): void {
    this.el.hidden = false;
    gsap.set(this.el, { opacity: 1, scale: 1 });
    this.play();
  }

  get visible(): boolean {
    return !this.el.hidden;
  }
}
