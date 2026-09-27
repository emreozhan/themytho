/**
 * The end of the voyage: the whole route on the map, a few numbers, and
 * Cavafy's "Ithaka" — the poem every reader of the Odyssey carries home.
 */
import { h, s } from '../lib/dom';
import { gsap, prefersReducedMotion } from '../lib/motion';
import { greekText } from '../art/letters';
import { ICONS } from './icons';
import { VOLUMES } from './cover';

export interface FinaleStats {
  years: number;
  km: number;
  stops: number;
  ships: number;
}

export class Finale {
  readonly el: HTMLElement;
  private title = greekText('ΝΟΣΤΟΣ', { size: 54, weight: 0.9, tracking: 3.4, align: 'middle' });
  private statsEl: HTMLElement;
  onExplore: () => void = () => {};
  onRestart: () => void = () => {};

  constructor(host: HTMLElement) {
    const titleSvg = s('svg', { class: 'finale__title-svg', viewBox: '-200 -40 400 80', role: 'img', 'aria-label': 'Nostos' });
    titleSvg.appendChild(this.title.g);
    this.statsEl = h('dl', { class: 'finale__stats' });
    const explore = h('button', { class: 'btn btn--primary', type: 'button' }, ['Haritada gez']);
    explore.insertAdjacentHTML('beforeend', ICONS.index);
    explore.addEventListener('click', () => this.onExplore());
    const restart = h('button', { class: 'btn btn--ghost finale__restart', type: 'button' }, ['Baştan başla']);
    restart.insertAdjacentHTML('afterbegin', ICONS.restart);
    restart.addEventListener('click', () => this.onRestart());
    const next = VOLUMES.filter((v) => !v.ready)
      .map((v) => `${v.title}`)
      .join(' · ');
    this.el = h('section', { class: 'finale', 'aria-labelledby': 'finale-heading', hidden: true }, [
      h('div', { class: 'finale__card' }, [
        h('p', { class: 'finale__kicker' }, ['Yolculuğun sonu']),
        h('h2', { class: 'finale__heading', id: 'finale-heading' }, [titleSvg, h('span', { class: 'sr-only' }, ['Nostos'])]),
        h('p', { class: 'finale__lede' }, ['Odysseus eve döndü. Haritada altın noktalarla işaretli yol, yirmi yılın izidir.']),
        this.statsEl,
        h('blockquote', { class: 'finale__poem' }, [
          h('p', { class: 'finale__poem-gr', lang: 'el' }, ['Σὰ βγεῖς στὸν πηγαιμὸ γιὰ τὴν Ἰθάκη, / νὰ εὔχεσαι νἆναι μακρὺς ὁ δρόμος, / γεμάτος περιπέτειες, γεμάτος γνώσεις.']),
          h('p', { class: 'finale__poem-tr' }, ['İthaka’ya doğru yola çıktığında, / dile ki uzun olsun yolun, / serüven dolu, bilgi dolu.']),
          h('footer', {}, ['K. P. Kavafis, “İthaka” (1911)']),
        ]),
        h('div', { class: 'finale__actions' }, [explore, restart]),
        h('p', { class: 'finale__next' }, [`Atlasın gelecek ciltleri: ${next}.`]),
        h('p', { class: 'finale__credits' }, [
          'Kaynak: Homeros, İlyada ve Odysseia. Yunanca dizeler özgün metinden, Türkçeleri bu atlas için çevrildi. ',
          'Kıyı çizgileri: Natural Earth (kamu malı). Bütün çizimler tarayıcıda SVG ile üretilir.',
        ]),
      ]),
    ]);
    host.appendChild(this.el);
  }

  show(stats: FinaleStats): void {
    this.statsEl.replaceChildren();
    const items: Array<[string, string]> = [
      [String(stats.years), 'yıl'],
      [`~${stats.km.toLocaleString('tr-TR')}`, 'kilometre'],
      [String(stats.stops), 'durak'],
      [`${stats.ships} → 0`, 'gemi'],
    ];
    for (const [v, k] of items) this.statsEl.append(h('div', { class: 'finale__stat' }, [h('dt', {}, [k]), h('dd', {}, [v])]));
    this.el.hidden = false;
    gsap.set(this.el, { autoAlpha: 1 });
    if (prefersReducedMotion()) return;
    const tl = gsap.timeline();
    tl.from(this.el.querySelector('.finale__card'), { y: 40, opacity: 0, duration: 1.2, ease: 'expo.out' })
      .fromTo(this.title.paths, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.3, stagger: 0.14, ease: 'brush' }, 0.3)
      .from(this.statsEl.children, { opacity: 0, y: 14, duration: 0.7, stagger: 0.1 }, 0.9)
      .from(this.el.querySelectorAll('.finale__poem p, .finale__poem footer'), { opacity: 0, duration: 1.2, stagger: 0.3 }, 1.3);
  }

  hide(): Promise<void> {
    return new Promise((resolve) =>
      gsap.to(this.el, {
        autoAlpha: 0,
        duration: 0.6,
        onComplete: () => {
          this.el.hidden = true;
          resolve();
        },
      }),
    );
  }
}
