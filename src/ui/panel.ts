/**
 * The story panel — small notes beside the tondo: chapter heading, the note
 * for the current beat, a line of Homer, a "trace of the myth" aside, and the
 * controls that wait for the reader.
 */
import { h, clear } from '../lib/dom';
import { gsap, SplitText, prefersReducedMotion } from '../lib/motion';
import { greekSvg } from '../art/letters';
import { ICONS } from './icons';
import type { Beat, Chapter, ChoiceOption, Gate } from '../story/types';

export class Panel {
  readonly el: HTMLElement;
  private kickerNum: HTMLElement;
  private kickerPart: HTMLElement;
  private kickerYear: HTMLElement;
  private title: HTMLElement;
  private greek: HTMLElement;
  private place: HTMLElement;
  private body: HTMLElement;
  private scroll: HTMLElement;
  private gate: HTMLElement;
  private gateIcon: HTMLElement;
  private gateText: HTMLElement;
  private choices: HTMLElement;
  private holdWrap: HTMLElement;
  readonly holdBtn: HTMLButtonElement;
  private holdRing: SVGCircleElement;
  private dots: HTMLElement;
  readonly nextBtn: HTMLButtonElement;
  readonly prevBtn: HTMLButtonElement;
  private nextLabel: HTMLElement;
  private splits: SplitText[] = [];
  onNext: () => void = () => {};
  onPrev: () => void = () => {};

  constructor(host: HTMLElement) {
    this.kickerNum = h('span', { class: 'panel__numeral' });
    this.kickerPart = h('span', { class: 'panel__part' });
    this.kickerYear = h('span', { class: 'panel__year' });
    this.title = h('h2', { class: 'panel__title', id: 'panel-title' });
    this.greek = h('div', { class: 'panel__greek' });
    this.place = h('p', { class: 'panel__place' });
    this.body = h('div', { class: 'panel__body', 'aria-live': 'polite' });
    this.scroll = h('div', { class: 'panel__scroll' }, [
      h('header', { class: 'panel__head' }, [
        h('div', { class: 'panel__kicker' }, [this.kickerNum, this.kickerPart, h('span', { class: 'panel__sep', 'aria-hidden': 'true' }, ['·']), this.kickerYear]),
        this.title,
        this.greek,
        this.place,
      ]),
      this.body,
    ]);
    this.gateIcon = h('span', { class: 'panel__gate-icon', 'aria-hidden': 'true' });
    this.gateText = h('span', { class: 'panel__gate-text' });
    this.gate = h('div', { class: 'panel__gate', role: 'status' }, [this.gateIcon, this.gateText]);
    this.choices = h('div', { class: 'panel__choices', role: 'group', 'aria-label': 'Seçenekler' });
    const ring = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    ring.setAttribute('viewBox', '0 0 64 64');
    ring.setAttribute('aria-hidden', 'true');
    ring.innerHTML = '<circle cx="32" cy="32" r="28" class="hold__track"/><circle cx="32" cy="32" r="28" class="hold__fill" pathLength="1"/>';
    this.holdRing = ring.querySelector('.hold__fill') as SVGCircleElement;
    this.holdBtn = h('button', { class: 'hold', type: 'button' }, [h('span', { class: 'hold__label' }, ['Basılı tut'])]);
    this.holdBtn.prepend(ring);
    this.holdWrap = h('div', { class: 'panel__hold' }, [this.holdBtn]);
    this.dots = h('div', { class: 'panel__dots', 'aria-hidden': 'true' });
    this.prevBtn = h('button', { class: 'btn btn--ghost panel__prev', type: 'button', 'aria-label': 'Önceki bölüm' });
    this.prevBtn.innerHTML = ICONS.prev;
    this.nextLabel = h('span', { class: 'btn__label' }, ['Devam']);
    this.nextBtn = h('button', { class: 'btn btn--primary panel__next', type: 'button' }, [this.nextLabel]);
    this.nextBtn.insertAdjacentHTML('beforeend', ICONS.next);
    this.prevBtn.addEventListener('click', () => this.onPrev());
    this.nextBtn.addEventListener('click', () => this.onNext());

    this.el = h('aside', { class: 'panel', 'aria-labelledby': 'panel-title' }, [
      h('div', { class: 'panel__band', 'aria-hidden': 'true' }),
      this.scroll,
      h('footer', { class: 'panel__foot' }, [
        this.gate,
        this.choices,
        this.holdWrap,
        h('div', { class: 'panel__nav' }, [this.prevBtn, this.dots, this.nextBtn]),
      ]),
    ]);
    host.appendChild(this.el);
    this.setGate(undefined);
    this.holdWrap.hidden = true;
    this.choices.hidden = true;
    gsap.set(this.el, { autoAlpha: 0, x: 40 });
  }

  show(): Promise<void> {
    return new Promise((resolve) =>
      gsap.to(this.el, { autoAlpha: 1, x: 0, duration: 0.8, ease: 'expo.out', onComplete: resolve }),
    );
  }

  hide(): Promise<void> {
    return new Promise((resolve) =>
      gsap.to(this.el, { autoAlpha: 0, x: 40, duration: 0.45, ease: 'power2.in', onComplete: resolve }),
    );
  }

  private revert(): void {
    this.splits.forEach((s) => s.revert());
    this.splits = [];
  }

  setChapter(ch: Chapter, numeral: string, partTitle: string, beats: number): void {
    this.revert();
    clear(this.kickerNum);
    const num = greekSvg(numeral, { size: 13, weight: 1.4, tracking: 1.4 });
    this.kickerNum.appendChild(num);
    this.kickerPart.textContent = partTitle;
    this.kickerYear.textContent = `Yıl ${ch.year}`;
    this.title.textContent = ch.title;
    clear(this.greek);
    const gk = greekSvg(ch.greek, { size: 15, weight: 1.05, tracking: 3 });
    this.greek.appendChild(gk);
    this.place.textContent = ch.place;
    clear(this.body);
    clear(this.dots);
    for (let i = 0; i < beats; i++) this.dots.appendChild(h('span', { class: 'panel__dot' }));
    this.scroll.scrollTop = 0;

    if (prefersReducedMotion()) return;
    const split = new SplitText(this.title, { type: 'chars,words', charsClass: 'char' });
    this.splits.push(split);
    const tl = gsap.timeline();
    tl.from(this.kickerNum.querySelectorAll('path'), { strokeDashoffset: 1, strokeDasharray: 1, duration: 0.6, stagger: 0.05, ease: 'power2.out' })
      .from([this.kickerPart, this.kickerYear], { opacity: 0, y: 6, duration: 0.5, stagger: 0.08 }, 0.1)
      .from(split.chars, { yPercent: 70, opacity: 0, rotate: 6, duration: 0.7, stagger: 0.025, ease: 'power3.out' }, 0.15)
      .fromTo(gk.querySelectorAll('path'), { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, stagger: 0.06, ease: 'brush' }, 0.35)
      .from(this.place, { opacity: 0, y: 8, duration: 0.6 }, 0.6);
  }

  setYear(year: number): void {
    this.kickerYear.textContent = `Yıl ${year}`;
  }

  setBeat(beat: Beat, index: number): Promise<void> {
    [...this.dots.children].forEach((d, i) => {
      d.classList.toggle('is-done', i < index);
      d.classList.toggle('is-current', i === index);
    });
    const old = [...this.body.children];
    const build = () => {
      this.revert();
      clear(this.body);
      const p = h('p', { class: 'panel__text' });
      p.innerHTML = beat.text;
      this.body.appendChild(p);
      const extra: HTMLElement[] = [];
      if (beat.quote) {
        const q = h('figure', { class: 'panel__quote' }, [
          h('blockquote', { lang: 'grc', class: 'panel__quote-gr' }, [beat.quote.greek]),
          h('p', { class: 'panel__quote-tr' }, [beat.quote.tr]),
          h('figcaption', {}, [beat.quote.ref]),
        ]);
        this.body.appendChild(q);
        extra.push(q);
      }
      if (beat.aside) {
        const a = h('aside', { class: 'panel__aside' }, [h('h3', {}, [beat.aside.title]), h('p', {}, [])]);
        (a.lastChild as HTMLElement).innerHTML = beat.aside.text;
        this.body.appendChild(a);
        extra.push(a);
      }
      this.scroll.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      if (prefersReducedMotion()) return Promise.resolve();
      const split = new SplitText(p, { type: 'lines', mask: 'lines', linesClass: 'line' });
      this.splits.push(split);
      return new Promise<void>((resolve) => {
        const tl = gsap.timeline({ onComplete: resolve });
        tl.from(split.lines, { yPercent: 105, duration: 0.75, stagger: 0.07, ease: 'power3.out' });
        if (extra.length) tl.from(extra, { opacity: 0, y: 14, duration: 0.7, stagger: 0.12, ease: 'power2.out' }, '-=0.35');
      });
    };
    if (!old.length || prefersReducedMotion()) return build();
    return new Promise((resolve) => {
      gsap.to(old, { opacity: 0, y: -10, duration: 0.25, ease: 'power2.in', onComplete: () => build().then(resolve) });
    });
  }

  setGate(gate: Gate | undefined, prompt?: string): void {
    const on = !!gate;
    this.gate.hidden = !on;
    if (!gate) return;
    this.gateIcon.innerHTML = ICONS[gate.kind === 'choice' ? 'choice' : gate.kind];
    this.gateText.textContent = prompt ?? gate.prompt;
    this.gate.classList.remove('is-done');
    gsap.fromTo(this.gate, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
  }

  say(text: string): void {
    this.gate.hidden = false;
    this.gateText.textContent = text;
    gsap.fromTo(this.gateText, { opacity: 0.2 }, { opacity: 1, duration: 0.4 });
  }

  gateDone(text = 'Tamam.'): void {
    this.gate.classList.add('is-done');
    this.gateText.textContent = text;
  }

  setNext(label: string, enabled: boolean, emphasis = false): void {
    this.nextLabel.textContent = label;
    this.nextBtn.disabled = !enabled;
    this.nextBtn.classList.toggle('is-ready', enabled && emphasis);
  }

  setPrev(enabled: boolean): void {
    this.prevBtn.disabled = !enabled;
  }

  /** Render choices (ostraka) and resolve with the chosen id. */
  choose(options: ChoiceOption[], signal: AbortSignal): Promise<string> {
    clear(this.choices);
    this.choices.hidden = false;
    return new Promise((resolve) => {
      const buttons = options.map((o, i) => {
        const b = h('button', { class: `ostrakon ostrakon--${i % 3}`, type: 'button' }, [o.label]);
        b.addEventListener('click', () => {
          resolve(o.id);
        });
        this.choices.appendChild(b);
        return b;
      });
      gsap.from(buttons, { opacity: 0, y: 12, rotate: (i) => (i % 2 ? 3 : -3), duration: 0.5, stagger: 0.08, ease: 'back.out(1.8)' });
      signal.addEventListener('abort', () => this.hideChoices());
    });
  }

  hideChoices(): void {
    this.choices.hidden = true;
    clear(this.choices);
  }

  /** Mark a chosen/rejected ostrakon. */
  markChoice(id: string, ok: boolean, options: ChoiceOption[]): void {
    const idx = options.findIndex((o) => o.id === id);
    const b = this.choices.children[idx] as HTMLElement | undefined;
    if (!b) return;
    b.classList.add(ok ? 'is-right' : 'is-wrong');
    if (!ok) gsap.fromTo(b, { x: -6 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
  }

  showHold(on: boolean, label = 'Basılı tut'): void {
    this.holdWrap.hidden = !on;
    (this.holdBtn.querySelector('.hold__label') as HTMLElement).textContent = label;
    this.setHoldProgress(0);
    if (on) gsap.fromTo(this.holdBtn, { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' });
  }

  setHoldProgress(p: number): void {
    this.holdRing.style.strokeDashoffset = String(1 - p);
    this.holdBtn.style.setProperty('--p', p.toFixed(3));
  }
}
