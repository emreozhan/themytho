/** Bottom band: one node per chapter, grouped by part, with the voyage's progress. */
import { h } from '../lib/dom';
import { gsap } from '../lib/motion';
import { greekSvg, greekNumeral } from '../art/letters';
import { L, bind, tx } from '../i18n';
import type { Story } from '../story/types';

export class Timeline {
  readonly el: HTMLElement;
  private nodes: HTMLButtonElement[] = [];
  private fill: HTMLElement;
  private label: HTMLElement;
  onJump: (i: number) => void = () => {};

  constructor(host: HTMLElement, story: Story) {
    this.fill = h('span', { class: 'timeline__fill' });
    const track = h('div', { class: 'timeline__track' }, [h('span', { class: 'timeline__rail' }), this.fill]);
    const parts = h('div', { class: 'timeline__parts', 'aria-hidden': 'true' });
    const nodes = h('ol', { class: 'timeline__nodes' });
    const n = story.chapters.length;
    const pos = (i: number) => (n > 1 ? i / (n - 1) : 0.5);
    story.parts.forEach((p) => {
      const idx = story.chapters.map((c, i) => (c.part === p.id ? i : -1)).filter((i) => i >= 0);
      if (!idx.length) return;
      const a = pos(idx[0]), b = pos(idx[idx.length - 1]);
      const part = h('span', { class: 'timeline__part', style: `left:${(a * 100).toFixed(2)}%;width:${((b - a) * 100).toFixed(2)}%` });
      bind(part, p.title);
      parts.appendChild(part);
    });
    story.chapters.forEach((c, i) => {
      const btn = h('button', {
        class: 'timeline__node',
        type: 'button',
        style: `left:${(pos(i) * 100).toFixed(2)}%`,
      });
      bind(btn, () => `${i + 1}. ${tx(c.title)}`, 'aria-label');
      btn.appendChild(h('span', { class: 'timeline__dot' }));
      const tipTitle = h('span', { class: 'timeline__tip-title' });
      const tipYear = h('span', { class: 'timeline__tip-year' });
      bind(tipTitle, c.title);
      bind(tipYear, () => `${tx(L('Yıl', 'Year'))} ${c.year}`);
      const tip = h('span', { class: 'timeline__tip' }, [tipTitle, tipYear]);
      tip.prepend(greekSvg(greekNumeral(i + 1), { size: 9, weight: 1.4, tracking: 1.2 }));
      btn.appendChild(tip);
      btn.addEventListener('click', () => this.onJump(i));
      this.nodes.push(btn);
      nodes.appendChild(h('li', {}, [btn]));
    });
    this.label = h('div', { class: 'timeline__now', 'aria-live': 'polite' });
    this.el = h('nav', { class: 'timeline' }, [parts, h('div', { class: 'timeline__inner' }, [track, nodes]), this.label]);
    bind(this.el, L('Yolculuk zaman çizelgesi', 'Voyage timeline'), 'aria-label');
    host.appendChild(this.el);
  }

  setCurrent(i: number, visitedMax: number): void {
    const n = this.nodes.length;
    this.nodes.forEach((b, k) => {
      b.classList.toggle('is-current', k === i);
      b.classList.toggle('is-visited', k <= visitedMax && k !== i);
      b.setAttribute('aria-current', k === i ? 'step' : 'false');
    });
    gsap.to(this.fill, { scaleX: n > 1 ? Math.max(0, i) / (n - 1) : 0, duration: 1.2, ease: 'power2.inOut' });
  }

  show(on: boolean): void {
    gsap.to(this.el, { autoAlpha: on ? 1 : 0, y: on ? 0 : 20, duration: 0.6, ease: 'power3.out' });
  }
}
