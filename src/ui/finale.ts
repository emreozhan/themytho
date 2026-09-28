/**
 * The end of the voyage: the whole route on the map, a few numbers, and
 * Cavafy's "Ithaka" — the poem every reader of the Odyssey carries home.
 */
import { h, s } from '../lib/dom';
import { gsap, prefersReducedMotion } from '../lib/motion';
import { greekText } from '../art/letters';
import { ICONS } from './icons';
import { VOLUMES } from './cover';
import { L, bind, num, onLang, tx, type Loc } from '../i18n';

function t(tag: 'p' | 'span' | 'footer', cls: string, text: Loc | (() => string)): HTMLElement {
  const el = h(tag, { class: cls });
  bind(el, text);
  return el;
}

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
  private stats: FinaleStats | null = null;
  onExplore: () => void = () => {};
  onRestart: () => void = () => {};

  constructor(host: HTMLElement) {
    const titleSvg = s('svg', { class: 'finale__title-svg', viewBox: '-200 -40 400 80', role: 'img', 'aria-label': 'Nostos' });
    titleSvg.appendChild(this.title.g);
    this.statsEl = h('dl', { class: 'finale__stats' });
    const explore = h('button', { class: 'btn btn--primary', type: 'button' }, [t('span', '', L('Haritada gez', 'Explore the map'))]);
    explore.insertAdjacentHTML('beforeend', ICONS.index);
    explore.addEventListener('click', () => this.onExplore());
    const restart = h('button', { class: 'btn btn--ghost finale__restart', type: 'button' }, [t('span', '', L('Baştan başla', 'Start again'))]);
    restart.insertAdjacentHTML('afterbegin', ICONS.restart);
    restart.addEventListener('click', () => this.onRestart());
    const next = () =>
      VOLUMES.filter((v) => !v.ready)
        .map((v) => tx(v.title))
        .join(' · ');
    this.el = h('section', { class: 'finale', 'aria-labelledby': 'finale-heading', hidden: true }, [
      h('div', { class: 'finale__card' }, [
        t('p', 'finale__kicker', L('Yolculuğun sonu', 'The end of the voyage')),
        h('h2', { class: 'finale__heading', id: 'finale-heading' }, [titleSvg, h('span', { class: 'sr-only' }, ['Nostos'])]),
        t('p', 'finale__lede', L('Odysseus eve döndü. Haritada altın noktalarla işaretli yol, yirmi yılın izidir.', 'Odysseus is home. The route dotted in gold across the map is the trace of twenty years.')),
        this.statsEl,
        h('blockquote', { class: 'finale__poem' }, [
          h('p', { class: 'finale__poem-gr', lang: 'el' }, ['Σὰ βγεῖς στὸν πηγαιμὸ γιὰ τὴν Ἰθάκη, / νὰ εὔχεσαι νἆναι μακρὺς ὁ δρόμος, / γεμάτος περιπέτειες, γεμάτος γνώσεις.']),
          t('p', 'finale__poem-tr', L('İthaka’ya doğru yola çıktığında, / dile ki uzun olsun yolun, / serüven dolu, bilgi dolu.', 'As you set out on the journey to Ithaca, / pray that the road be long, / full of adventures, full of knowledge.')),
          t('footer', '', L('K. P. Kavafis, “İthaka” (1911)', 'C. P. Cavafy, “Ithaca” (1911)')),
        ]),
        h('div', { class: 'finale__actions' }, [explore, restart]),
        t('p', 'finale__next', () => `${tx(L('Atlasın gelecek ciltleri', 'Volumes still to come'))}: ${next()}.`),
        t(
          'p',
          'finale__credits',
          L(
            'Kaynak: Homeros, İlyada ve Odysseia. Yunanca dizeler özgün metinden; Türkçe ve İngilizce çevirileri bu atlas için yapıldı. Kıyı çizgileri: Natural Earth (kamu malı). Bütün çizimler tarayıcıda SVG ile üretilir.',
            'Sources: Homer, the Iliad and the Odyssey. The Greek lines are from the original text; the Turkish and English renderings were made for this atlas. Coastlines: Natural Earth (public domain). Every drawing is made in the browser as SVG.',
          ),
        ),
      ]),
    ]);
    host.appendChild(this.el);
    onLang(() => {
      if (this.stats) this.renderStats(this.stats);
    });
  }

  private renderStats(stats: FinaleStats): void {
    this.statsEl.replaceChildren();
    const items: Array<[string, Loc]> = [
      [String(stats.years), L('yıl', 'years')],
      [`~${num(stats.km)}`, L('kilometre', 'kilometres')],
      [String(stats.stops), L('durak', 'stops')],
      [`${stats.ships} → 0`, L('gemi', 'ships')],
    ];
    for (const [v, k] of items) this.statsEl.append(h('div', { class: 'finale__stat' }, [h('dt', {}, [tx(k)]), h('dd', {}, [v])]));
  }

  show(stats: FinaleStats): void {
    this.stats = stats;
    this.renderStats(stats);
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
