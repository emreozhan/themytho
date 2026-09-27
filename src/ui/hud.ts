/** Top bar: title, the year of the journey, the surviving ships, Poseidon's wrath. */
import { h } from '../lib/dom';
import { gsap } from '../lib/motion';
import { ICONS } from './icons';
import type { HudApi } from '../story/types';

export class Hud implements HudApi {
  readonly el: HTMLElement;
  private yearEl: HTMLElement;
  private shipsEl: HTMLElement;
  private shipIcons: HTMLElement[] = [];
  private wrathEl: HTMLElement;
  private soundBtn: HTMLButtonElement;
  private year = { v: 0 };
  private ships = 12;
  onSound: () => void = () => {};
  onIndex: () => void = () => {};
  onHome: () => void = () => {};

  constructor(host: HTMLElement, title: string, volume: string, totalShips: number) {
    this.yearEl = h('span', { class: 'hud__year-num', 'aria-live': 'polite' }, ['0']);
    this.shipsEl = h('span', { class: 'hud__ships', role: 'img', 'aria-label': `${totalShips} gemi` });
    for (let i = 0; i < totalShips; i++) {
      const icon = h('span', { class: 'hud__ship' });
      icon.innerHTML = ICONS.ship;
      this.shipsEl.appendChild(icon);
      this.shipIcons.push(icon);
    }
    this.ships = totalShips;
    this.wrathEl = h('span', { class: 'hud__wrath', title: 'Poseidon’un gazabı', 'aria-hidden': 'true' });
    this.wrathEl.innerHTML = ICONS.trident;
    this.soundBtn = h('button', { class: 'icon-btn hud__sound', type: 'button', 'aria-pressed': 'false', 'aria-label': 'Sesi aç' });
    this.soundBtn.innerHTML = ICONS.lyreOff;
    this.soundBtn.addEventListener('click', () => this.onSound());
    const indexBtn = h('button', { class: 'icon-btn hud__index', type: 'button', 'aria-label': 'Bölümler' });
    indexBtn.innerHTML = ICONS.index;
    indexBtn.addEventListener('click', () => this.onIndex());
    const home = h('button', { class: 'hud__brand', type: 'button', 'aria-label': 'Kapağa dön' }, [
      h('span', { class: 'hud__mark', 'aria-hidden': 'true' }),
      h('span', { class: 'hud__brand-text' }, [h('span', { class: 'hud__title' }, [title]), h('span', { class: 'hud__volume' }, [volume])]),
    ]);
    home.addEventListener('click', () => this.onHome());

    this.el = h('header', { class: 'hud' }, [
      home,
      h('div', { class: 'hud__stats' }, [
        h('div', { class: 'hud__stat hud__stat--year' }, [h('span', { class: 'hud__label' }, ['Yıl']), this.yearEl]),
        h('div', { class: 'hud__stat hud__stat--ships' }, [h('span', { class: 'hud__label' }, ['Gemi']), this.shipsEl]),
        this.wrathEl,
        this.soundBtn,
        indexBtn,
      ]),
    ]);
    host.appendChild(this.el);
  }

  setYear(year: number, seconds = 1.2): void {
    gsap.to(this.year, {
      v: year,
      duration: Math.abs(year - this.year.v) < 0.5 ? 0 : seconds,
      ease: 'power2.inOut',
      onUpdate: () => {
        const n = Math.round(this.year.v);
        if (this.yearEl.textContent !== String(n)) {
          this.yearEl.textContent = String(n);
          gsap.fromTo(this.yearEl, { yPercent: -35, opacity: 0.2 }, { yPercent: 0, opacity: 1, duration: 0.25, ease: 'power2.out' });
        }
      },
    });
  }

  setShips(n: number, animate = true): void {
    const prev = this.ships;
    this.ships = n;
    this.shipsEl.setAttribute('aria-label', `${n} gemi`);
    this.shipIcons.forEach((icon, i) => {
      const alive = i < n;
      const was = i < prev;
      icon.classList.toggle('is-lost', !alive);
      if (animate && was && !alive) {
        gsap.fromTo(icon, { y: 0, rotation: 0, opacity: 1 }, { y: 5, rotation: 24, opacity: 0.18, duration: 0.8, delay: (prev - 1 - i) * 0.12, ease: 'power2.in' });
      } else if (alive) gsap.set(icon, { y: 0, rotation: 0, opacity: 1 });
      else gsap.set(icon, { y: 5, rotation: 24, opacity: 0.18 });
    });
  }

  wrath(on: boolean): void {
    this.wrathEl.classList.toggle('is-on', on);
    this.wrathEl.setAttribute('aria-hidden', on ? 'false' : 'true');
    if (on) gsap.fromTo(this.wrathEl, { scale: 2.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, ease: 'back.out(2)' });
  }

  setSound(on: boolean): void {
    this.soundBtn.innerHTML = on ? ICONS.lyre : ICONS.lyreOff;
    this.soundBtn.setAttribute('aria-pressed', String(on));
    this.soundBtn.setAttribute('aria-label', on ? 'Sesi kapat' : 'Sesi aç');
  }

  show(on: boolean): void {
    gsap.to(this.el, { autoAlpha: on ? 1 : 0, y: on ? 0 : -16, duration: 0.6, ease: 'power3.out' });
  }
}
