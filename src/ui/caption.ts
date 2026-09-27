/** Cinematic caption shown over the map while the ships are at sea. */
import { h } from '../lib/dom';
import { gsap, SplitText, prefersReducedMotion } from '../lib/motion';

export class Caption {
  readonly el: HTMLElement;
  private dest: HTMLElement;
  private line: HTMLElement;
  private greek: HTMLElement;

  constructor(host: HTMLElement) {
    this.dest = h('div', { class: 'caption__dest' });
    this.line = h('p', { class: 'caption__line' });
    this.greek = h('p', { class: 'caption__greek', lang: 'grc' });
    const hint = h('p', { class: 'caption__hint' }, ['Hızlandırmak için haritaya dokun ya da → tuşuna bas']);
    this.el = h('div', { class: 'caption', 'aria-live': 'polite' }, [this.dest, this.line, this.greek, hint]);
    host.appendChild(this.el);
    gsap.set(this.el, { autoAlpha: 0 });
  }

  show(dest: string, line?: string, greek?: string): void {
    this.dest.textContent = dest;
    this.line.textContent = line ?? '';
    this.greek.textContent = greek ?? '';
    this.line.hidden = !line;
    this.greek.hidden = !greek;
    gsap.killTweensOf(this.el);
    gsap.set(this.el, { autoAlpha: 1 });
    if (prefersReducedMotion()) return;
    const tl = gsap.timeline();
    tl.fromTo(this.dest, { opacity: 0, letterSpacing: '0.6em' }, { opacity: 1, letterSpacing: '0.34em', duration: 1.2, ease: 'power3.out' });
    if (line) {
      const split = new SplitText(this.line, { type: 'words' });
      tl.from(split.words, { opacity: 0, y: 10, filter: 'blur(4px)', duration: 0.7, stagger: 0.06, ease: 'power2.out' }, 0.3);
    }
    if (greek) tl.from(this.greek, { opacity: 0, duration: 1.2 }, 0.8);
  }

  hide(): void {
    gsap.to(this.el, { autoAlpha: 0, duration: 0.6, ease: 'power2.in' });
  }
}
