/**
 * Wires the atlas, the interface and the story engine together, and turns
 * keys, wheel and swipes into story steps.
 */
import { h } from './lib/dom';
import { gsap } from './lib/motion';
import { Atlas } from './map/atlas';
import { KM_PER_UNIT } from './map/projection';
import { Medallion } from './ui/medallion';
import { Panel } from './ui/panel';
import { Hud } from './ui/hud';
import { Timeline } from './ui/timeline';
import { Drawer } from './ui/drawer';
import { Caption } from './ui/caption';
import { Cover } from './ui/cover';
import { Finale } from './ui/finale';
import { Engine } from './story/engine';
import { Sound } from './audio/audio';
import type { Story } from './story/types';

export class App {
  readonly atlas: Atlas;
  readonly engine: Engine;
  private cover: Cover;
  private finale: Finale;
  private drawer: Drawer;
  private hud: Hud;
  private timeline: Timeline;
  private panel: Panel;
  private medallion: Medallion;
  private sound = new Sound();
  private started = false;
  private wheelAcc = 0;
  private wheelLock = 0;
  /** Free map exploration after the finale: drag to pan, wheel to zoom, markers open chapters. */
  private exploring = false;

  constructor(
    root: HTMLElement,
    private story: Story,
  ) {
    root.replaceChildren();
    this.atlas = new Atlas(root);
    root.appendChild(h('div', { class: 'sheen', 'aria-hidden': 'true' }));
    const ui = h('div', { class: 'ui' });
    root.appendChild(ui);
    this.hud = new Hud(ui, 'Mitos Atlası', `Cilt I · ${story.title}`, story.initialShips);
    this.medallion = new Medallion(ui);
    this.panel = new Panel(ui);
    this.timeline = new Timeline(ui, story);
    const caption = new Caption(ui);
    this.drawer = new Drawer(root, story);
    this.finale = new Finale(root);
    this.cover = new Cover(root, story);
    const live = h('div', { class: 'sr-only', 'aria-live': 'polite', id: 'announcer' });
    root.appendChild(live);

    this.engine = new Engine(
      story,
      {
        atlas: this.atlas,
        medallion: this.medallion,
        panel: this.panel,
        hud: this.hud,
        timeline: this.timeline,
        drawer: this.drawer,
        caption,
        voyageRect: () => {
          const hudH = this.hud.el.offsetHeight || 64;
          const tl = this.timeline.el.offsetParent ? this.timeline.el.offsetHeight : 0;
          const w = innerWidth, hh = innerHeight;
          return { x: 32, y: hudH + 20, w: w - 64, h: Math.max(200, hh - hudH - tl - 150) };
        },
        stagePoint: () => {
          const el = this.medallion.el;
          return [el.offsetLeft + el.offsetWidth / 2, el.offsetTop + el.offsetHeight / 2];
        },
      },
      this.sound,
    );

    this.engine.onChapter = (i) => {
      const c = story.chapters[i];
      history.replaceState(null, '', `#/${story.id}/${c.id}`);
      live.textContent = `${i + 1}. bölüm: ${c.title}`;
      document.title = `${c.title} · ${story.title} · Mitos Atlası`;
    };
    this.engine.onFinish = () => this.showFinale();
    const openFromMap = this.atlas.onMarkerClick;
    this.atlas.onMarkerClick = (id) => {
      this.setExploring(false);
      openFromMap(id);
    };

    this.panel.onNext = () => this.engine.next();
    this.panel.onPrev = () => this.engine.prev();
    this.timeline.onJump = (i) => this.jump(i);
    this.drawer.onJump = (i) => this.jump(i);
    this.hud.onIndex = () => (this.drawer.opened ? this.drawer.close() : this.drawer.open());
    this.hud.onSound = () => this.hud.setSound(this.sound.toggle());
    this.hud.onHome = () => this.home();
    this.cover.onStart = () => this.begin();
    this.finale.onExplore = () => this.explore();
    this.finale.onRestart = () => this.restart();

    this.bindInput();
    this.hud.show(false);
    this.timeline.show(false);

    const fromHash = this.chapterFromHash();
    if (fromHash >= 0) {
      this.cover.el.hidden = true;
      this.startAt(fromHash);
    } else {
      this.cover.play();
    }
    addEventListener('hashchange', () => {
      const i = this.chapterFromHash();
      if (i >= 0 && this.started && i !== this.engine.index) this.engine.goTo(i);
    });
  }

  private chapterFromHash(): number {
    const m = location.hash.match(/^#\/([\w-]+)\/([\w-]+)/);
    if (!m || m[1] !== this.story.id) return -1;
    return this.story.chapters.findIndex((c) => c.id === m[2]);
  }

  private async begin(): Promise<void> {
    await this.cover.hide();
    this.startAt(0);
  }

  private startAt(i: number): void {
    this.started = true;
    this.hud.show(true);
    this.timeline.show(true);
    this.engine.start(i);
  }

  private jump(i: number): void {
    if (!this.started) return;
    if (!this.finale.el.hidden) void this.finale.hide();
    this.setExploring(false);
    this.engine.goTo(i);
  }

  private setExploring(on: boolean): void {
    this.exploring = on;
    this.atlas.el.classList.toggle('is-exploring', on);
  }

  private async showFinale(): Promise<void> {
    await this.engine.overview();
    let units = 0;
    this.atlas.svg.querySelectorAll<SVGPathElement>('.leg:not(.leg--feint)').forEach((p) => (units += p.getTotalLength()));
    const km = Math.round((units * KM_PER_UNIT) / 100) * 100;
    this.finale.show({ years: this.story.totalYears, km, stops: this.story.chapters.length, ships: this.story.initialShips });
  }

  private async explore(): Promise<void> {
    await this.finale.hide();
    this.setExploring(true);
  }

  private async restart(): Promise<void> {
    await this.finale.hide();
    this.setExploring(false);
    this.engine.reset();
    this.engine.start(0);
  }

  private async home(): Promise<void> {
    if (!this.started || this.engine.isBusy) return;
    this.engine.reset();
    this.started = false;
    this.hud.show(false);
    this.timeline.show(false);
    await this.panel.hide();
    history.replaceState(null, '', location.pathname + location.search);
    document.title = 'Odysseia · Mitos Atlası';
    this.cover.show();
  }

  private bindInput(): void {
    addEventListener('keydown', (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (this.drawer.opened) return;
      if (this.cover.visible) {
        if (e.key === 'Enter' && document.activeElement === document.body) this.begin();
        return;
      }
      const inter = this.engine.inter;
      const onButton = (e.target as HTMLElement | null)?.closest?.('button');
      switch (e.key) {
        case ' ':
          if (inter?.holdKey(true)) {
            e.preventDefault();
            return;
          }
          if (onButton) return;
          e.preventDefault();
          this.engine.next();
          break;
        case 'Enter':
          if (onButton) return;
          if (inter?.activate()) {
            e.preventDefault();
            return;
          }
          this.engine.next();
          break;
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault();
          this.engine.next();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          this.engine.prev();
          break;
        case 'm':
        case 'M':
          this.hud.setSound(this.sound.toggle());
          break;
        case 'b':
        case 'B':
          this.drawer.open();
          break;
      }
    });
    addEventListener('keyup', (e) => {
      if (e.key === ' ') this.engine.inter?.holdKey(false);
    });
    addEventListener(
      'wheel',
      (e) => {
        if (this.exploring) {
          this.atlas.camera.zoomAt([e.clientX, e.clientY], Math.exp(-e.deltaY * 0.0015));
          return;
        }
        if (!this.started || this.drawer.opened || !this.finale.el.hidden) return;
        const inPanel = (e.target as HTMLElement).closest?.('.panel__scroll');
        if (inPanel) {
          const sc = inPanel as HTMLElement;
          if (sc.scrollHeight > sc.clientHeight + 4) return;
        }
        const now = performance.now();
        if (now < this.wheelLock) return;
        this.wheelAcc += e.deltaY;
        if (this.wheelAcc > 90) {
          this.wheelAcc = 0;
          this.wheelLock = now + 900;
          this.engine.next();
        } else if (this.wheelAcc < -140) this.wheelAcc = 0;
      },
      { passive: true },
    );
    // Drag to pan while exploring.
    let drag: [number, number] | null = null;
    this.atlas.el.addEventListener('pointerdown', (e) => {
      if (!this.exploring || (e.target as Element).closest('.marker')) return;
      drag = [e.clientX, e.clientY];
      this.atlas.el.setPointerCapture(e.pointerId);
    });
    this.atlas.el.addEventListener('pointermove', (e) => {
      if (!drag) return;
      this.atlas.camera.panBy(e.clientX - drag[0], e.clientY - drag[1]);
      drag = [e.clientX, e.clientY];
    });
    const endDrag = () => (drag = null);
    this.atlas.el.addEventListener('pointerup', endDrag);
    this.atlas.el.addEventListener('pointercancel', endDrag);
    let touch: [number, number, number] | null = null;
    this.atlas.el.addEventListener('touchstart', (e) => (touch = [e.touches[0].clientX, e.touches[0].clientY, performance.now()]), { passive: true });
    this.atlas.el.addEventListener('touchend', (e) => {
      if (!touch || !this.started || this.exploring) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touch[0], dy = t.clientY - touch[1];
      const fast = performance.now() - touch[2] < 600;
      touch = null;
      if (!fast || Math.max(Math.abs(dx), Math.abs(dy)) < 50) return;
      if (dx < -50 || dy < -50) this.engine.next();
      else if (dx > 50) this.engine.prev();
    });
    gsap.ticker.lagSmoothing(500, 33);
  }
}
