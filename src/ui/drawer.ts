/** Chapter index: a list of all stops, reachable any time. */
import { h } from '../lib/dom';
import { gsap } from '../lib/motion';
import { greekSvg, greekNumeral } from '../art/letters';
import { ICONS } from './icons';
import type { Story } from '../story/types';

export class Drawer {
  readonly el: HTMLElement;
  private items: HTMLButtonElement[] = [];
  private isOpen = false;
  private lastFocus: HTMLElement | null = null;
  onJump: (i: number) => void = () => {};

  constructor(host: HTMLElement, story: Story) {
    const close = h('button', { class: 'icon-btn drawer__close', type: 'button', 'aria-label': 'Kapat' });
    close.innerHTML = ICONS.close;
    close.addEventListener('click', () => this.close());
    const list = h('ol', { class: 'drawer__list' });
    let lastPart = '';
    story.chapters.forEach((c, i) => {
      if (c.part !== lastPart) {
        lastPart = c.part;
        const part = story.parts.find((p) => p.id === c.part)!;
        list.appendChild(h('li', { class: 'drawer__part', 'aria-hidden': 'true' }, [part.title]));
      }
      const btn = h('button', { class: 'drawer__item', type: 'button' }, [
        h('span', { class: 'drawer__num' }, [greekSvg(greekNumeral(i + 1), { size: 11, weight: 1.4, tracking: 1.4 })]),
        h('span', { class: 'drawer__title' }, [c.title]),
        h('span', { class: 'drawer__year' }, [`Yıl ${c.year}`]),
      ]);
      btn.addEventListener('click', () => {
        this.close();
        this.onJump(i);
      });
      this.items.push(btn);
      list.appendChild(h('li', {}, [btn]));
    });
    this.el = h('div', { class: 'drawer', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Bölümler', hidden: true }, [
      h('div', { class: 'drawer__scrim' }),
      h('div', { class: 'drawer__sheet' }, [
        h('div', { class: 'drawer__head' }, [h('h2', {}, ['Bölümler']), close]),
        h('p', { class: 'drawer__lede' }, [story.subtitle]),
        list,
      ]),
    ]);
    this.el.querySelector('.drawer__scrim')!.addEventListener('click', () => this.close());
    this.el.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
    host.appendChild(this.el);
  }

  get opened(): boolean {
    return this.isOpen;
  }

  setCurrent(i: number): void {
    this.items.forEach((b, k) => b.classList.toggle('is-current', k === i));
  }

  open(): void {
    if (this.isOpen) return;
    this.isOpen = true;
    this.lastFocus = document.activeElement as HTMLElement | null;
    this.el.hidden = false;
    gsap.fromTo(this.el.querySelector('.drawer__sheet'), { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.55, ease: 'expo.out' });
    gsap.fromTo(this.el.querySelector('.drawer__scrim'), { opacity: 0 }, { opacity: 1, duration: 0.4 });
    gsap.from(this.items, { opacity: 0, x: 16, duration: 0.4, stagger: 0.02, delay: 0.1 });
    (this.items.find((b) => b.classList.contains('is-current')) ?? this.items[0])?.focus();
  }

  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    gsap.to(this.el.querySelector('.drawer__sheet'), { x: 60, opacity: 0, duration: 0.3, ease: 'power2.in' });
    gsap.to(this.el.querySelector('.drawer__scrim'), {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        this.el.hidden = true;
      },
    });
    this.lastFocus?.focus();
  }
}
