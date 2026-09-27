/**
 * The story engine: a small state machine that sails between chapters, raises
 * each chapter's tondo, plays its beats and waits for the reader.
 *
 *   voyage  → arrive → beat 0 … beat n (gated beats wait for interaction) → voyage …
 *
 * Any chapter can be entered directly (index, timeline, URL hash); the map
 * state for earlier chapters is then rebuilt instantly.
 */
import { gsap, prefersReducedMotion } from '../lib/motion';
import type { Vec } from '../lib/geometry';
import { greekNumeral } from '../art/letters';
import { project, type LonLat } from '../map/projection';
import type { Atlas, LegHandle } from '../map/atlas';
import type { Rect } from '../map/camera';
import type { Medallion } from '../ui/medallion';
import type { Panel } from '../ui/panel';
import type { Hud } from '../ui/hud';
import type { Timeline } from '../ui/timeline';
import type { Drawer } from '../ui/drawer';
import type { Caption } from '../ui/caption';
import { interactions, type Interactions } from './interactions';
import type { AtlasApi, AudioApi, Chapter, Leg, Mood, Scene, SceneContext, Story } from './types';
import { RADIUS } from '../ui/medallion';

export interface EngineUI {
  atlas: Atlas;
  medallion: Medallion;
  panel: Panel;
  hud: Hud;
  timeline: Timeline;
  drawer: Drawer;
  caption: Caption;
  /** Screen rectangle free for the map during voyages. */
  voyageRect(): Rect;
  /** Screen point where the tondo sits (chapter locations are anchored there). */
  stagePoint(): Vec;
}

interface LegRec {
  chapter: number;
  leg: Leg;
  handle: LegHandle;
  arrival: boolean;
}

export class Engine {
  index = -1;
  beat = 0;
  visitedMax = -1;
  private busy = false;
  private hurry = false;
  private ready = false;
  private scene: Scene | null = null;
  private ctrl: AbortController | null = null;
  inter: Interactions | null = null;
  private arrivals = new Map<number, LegRec>();
  private extras = new Map<string, LegRec>();
  private all: LegRec[] = [];
  onChapter: (i: number) => void = () => {};
  onFinish: () => void = () => {};

  constructor(
    private story: Story,
    private ui: EngineUI,
    private audio: AudioApi,
  ) {
    const { atlas } = ui;
    story.known.forEach((k, i) => atlas.reveal(`known-${i}`, k.at, k.r, false));
    story.chapters.forEach((c, i) => {
      if (c.marker) return;
      atlas.addMarker({ id: c.id, at: c.at, name: c.label ?? c.title, greek: c.greek, numeral: greekNumeral(i + 1), side: c.labelSide });
    });
    this.buildLegs();
    atlas.onMarkerClick = (id) => {
      // A shared marker opens the latest visited chapter that uses it.
      const users = story.chapters.map((c, i) => ((c.marker ?? c.id) === id ? i : -1)).filter((i) => i >= 0);
      const visited = users.filter((i) => i <= this.visitedMax);
      const i = visited.length ? visited[visited.length - 1] : users[0];
      if (i >= 0 && i !== this.index) this.goTo(i);
    };
    ui.hud.setShips(story.initialShips, false);
    ui.hud.setYear(story.startYear, 0);
  }

  get chapter(): Chapter | undefined {
    return this.story.chapters[this.index];
  }

  get isBusy(): boolean {
    return this.busy;
  }

  private harbor(c: Chapter): LonLat {
    return c.harbor ?? c.at;
  }

  /** Where chapter i leaves the fleet. */
  endOf(i: number): LonLat {
    const c = this.story.chapters[i];
    if (c.end?.at) return c.end.at;
    const last = c.legs?.[c.legs.length - 1];
    return last?.to ?? this.harbor(c);
  }

  private buildLegs(): void {
    const { atlas } = this.ui;
    this.story.chapters.forEach((c, i) => {
      if (c.arrival) {
        const from = c.arrival.from ?? (i > 0 ? this.endOf(i - 1) : this.harbor(c));
        const to = c.arrival.to ?? this.harbor(c);
        const handle = atlas.addLeg(`${c.id}--${c.arrival.id}`, [from, ...(c.arrival.via ?? []), to], c.arrival.style);
        const rec = { chapter: i, leg: c.arrival, handle, arrival: true };
        this.arrivals.set(i, rec);
        this.all.push(rec);
      }
      let cur = this.harbor(c);
      for (const leg of c.legs ?? []) {
        const from = leg.from ?? cur;
        const to = leg.to ?? this.harbor(c);
        const handle = atlas.addLeg(`${c.id}--${leg.id}`, [from, ...(leg.via ?? []), to], leg.style);
        const rec = { chapter: i, leg, handle, arrival: false };
        this.extras.set(`${i}:${leg.id}`, rec);
        this.all.push(rec);
        cur = to;
      }
    });
  }

  /** Rebuild the map as it stands when chapter i begins (before its arrival voyage). */
  private applyState(i: number): void {
    const { atlas, hud } = this.ui;
    const chs = this.story.chapters;
    this.all.forEach((l) => l.handle.set(l.chapter < i ? 1 : 0));
    chs.forEach((c, k) => {
      if (!c.marker) atlas.setMarker(c.id, chs.some((d, m) => m < i && (d.marker ?? d.id) === c.id) ? 'visited' : 'hidden');
      if (k < i) atlas.reveal(c.id, c.at, c.reveal ?? 170, false);
      else atlas.reveal(c.id, c.at, 0, false);
    });
    const prev = chs[i - 1];
    const ships = prev ? (prev.end?.ships ?? prev.ships) : this.story.initialShips;
    atlas.fleet.setCount(ships);
    atlas.fleet.setKind(this.arrivals.get(i)?.leg.vessel ?? (ships > 1 ? 'fleet' : 'ship'));
    const from = i > 0 ? this.endOf(i - 1) : this.harbor(chs[0]);
    atlas.fleet.anchor(project(from[0], from[1]));
    hud.setShips(ships, false);
    hud.setYear(prev ? (prev.end?.year ?? prev.year) : this.story.startYear, 0);
    hud.wrath(!!chs[i].wrath && !!prev?.wrath);
    this.setMood(prev ? (prev.end?.mood ?? prev.mood ?? 'day') : 'day');
    atlas.setUnknownLabel(i > 7 ? 0 : 1);
  }

  private setMood(m: Mood): void {
    document.documentElement.dataset.mood = m;
  }

  /** Begin (or restart) at chapter i. */
  async start(i = 0): Promise<void> {
    this.applyState(i);
    this.ready = true;
    await this.goTo(i, { sequential: true, force: true });
  }

  async goTo(i: number, opts: { sequential?: boolean; force?: boolean } = {}): Promise<void> {
    const n = this.story.chapters.length;
    if (!this.ready || i < 0 || i >= n) return;
    if (this.busy && !opts.force) return;
    this.busy = true;
    const sequential = opts.sequential ?? i === this.index + 1;
    await this.leave();
    if (!sequential) this.applyState(i);
    await this.voyage(i, sequential ? 1 : 0.5);
    await this.arrive(i);
    this.busy = false;
    this.setHurry(false);
    await this.playBeat(0);
  }

  private async leave(): Promise<void> {
    this.ctrl?.abort();
    this.scene?.destroy?.();
    this.scene = null;
    this.inter = null;
    const { panel, medallion, atlas } = this.ui;
    panel.hideChoices();
    const c = this.chapter;
    const to = c ? this.ui.atlas.camera.toScreen(project(c.at[0], c.at[1])) : undefined;
    if (c) atlas.setMarker(c.marker ?? c.id, 'visited');
    await Promise.all([panel.hide(), medallion.retreat(to as [number, number] | undefined)]);
    medallion.clear();
  }

  private async voyage(i: number, speed: number): Promise<void> {
    const rec = this.arrivals.get(i);
    const c = this.story.chapters[i];
    const { atlas, hud, caption } = this.ui;
    if (!rec) {
      const h = this.harbor(c);
      atlas.fleet.anchor(project(h[0], h[1]));
      return;
    }
    const leg = rec.leg;
    atlas.fleet.setKind(leg.vessel ?? (c.ships > 1 ? 'fleet' : 'ship'));
    const style = leg.style ?? 'sail';
    atlas.setWeather(style === 'storm' || style === 'blown' ? 'storm' : style === 'night' ? 'night' : 'none');
    if (style === 'night') this.setMood('night');
    if (style === 'storm') this.setMood('storm');
    caption.show(c.title, leg.caption?.tr, leg.caption?.greek);
    const box = rec.handle.box;
    const pad = 70;
    const target = atlas.camera.fit({ x: box.x - pad, y: box.y - pad, w: box.w + pad * 2, h: box.h + pad * 2 }, this.ui.voyageRect(), 4.2);
    await atlas.camera.fly(target, { duration: prefersReducedMotion() ? 0.01 : 1.5 / speed });
    const seconds = prefersReducedMotion() ? 0.3 : (leg.duration ?? gsap.utils.clamp(2.6, 6.5, rec.handle.length / 210)) * speed;
    hud.setYear(c.year, seconds);
    this.audio.sfx(style === 'storm' ? 'storm' : 'depart');
    await atlas.fleet.sail(rec.handle.path, seconds, (p) => rec.handle.set(p));
    caption.hide();
    atlas.setWeather('none');
  }

  private async arrive(i: number): Promise<void> {
    const c = this.story.chapters[i];
    const { atlas, hud, panel, medallion, timeline, drawer } = this.ui;
    this.index = i;
    this.beat = 0;
    this.visitedMax = Math.max(this.visitedMax, i);
    timeline.setCurrent(i, this.visitedMax);
    drawer.setCurrent(i);
    this.onChapter(i);
    this.setMood(c.mood ?? 'day');
    hud.wrath(!!c.wrath);
    hud.setShips(c.ships);
    hud.setYear(c.year, 0.6);
    atlas.setMarker(c.marker ?? c.id, 'active');
    atlas.reveal(c.id, c.at, c.reveal ?? 170);
    atlas.setUnknownLabel(i > 7 ? 0 : 1);
    this.audio.sfx('arrive');

    const p = project(c.at[0], c.at[1]);
    const stage = this.ui.stagePoint();
    await atlas.camera.fly(atlas.camera.anchor(p, atlas.camera.zoom(c.zoom ?? 3.4), stage), {
      duration: prefersReducedMotion() ? 0.01 : 1.5,
    });

    // Raise the tondo.
    this.ctrl = new AbortController();
    const signal = this.ctrl.signal;
    this.inter = interactions(medallion, panel, signal);
    medallion.clear();
    medallion.el.setAttribute('aria-label', `Sahne: ${c.title}`);
    const ctx = this.makeContext(i, signal, this.inter);
    this.scene = c.scene(ctx);
    const part = this.story.parts.find((pt) => pt.id === c.part);
    panel.setChapter(c, greekNumeral(i + 1), part?.title ?? '', c.beats.length);
    panel.setPrev(i > 0);
    panel.setNext('Devam', false);
    const from = atlas.camera.toScreen(p);
    await Promise.all([medallion.emerge([from[0], from[1]]), panel.show()]);
    if (signal.aborted) return;
    await this.scene.enter?.();
  }

  private makeContext(i: number, signal: AbortSignal, inter: Interactions): SceneContext {
    const c = this.story.chapters[i];
    const { atlas, hud, panel, medallion } = this.ui;
    const api: AtlasApi = {
      sail: async (legId) => {
        const rec = this.extras.get(`${i}:${legId}`);
        if (!rec || signal.aborted) return;
        atlas.fleet.setKind(rec.leg.vessel ?? (atlas.fleet.alive > 1 ? 'fleet' : 'ship'));
        const box = rec.handle.box;
        const pad = 60;
        const stage = this.ui.stagePoint();
        // Keep the tondo in view: frame the leg in the map area beside it.
        const rect = this.ui.voyageRect();
        const side: Rect = stage[0] > rect.x + rect.w * 0.5 ? { ...rect, w: rect.w * 0.45 } : rect;
        const target = atlas.camera.fit({ x: box.x - pad, y: box.y - pad, w: box.w + pad * 2, h: box.h + pad * 2 }, side, 4);
        await atlas.camera.fly(target, { duration: 1.1 });
        const seconds = prefersReducedMotion() ? 0.3 : (rec.leg.duration ?? gsap.utils.clamp(2.2, 5, rec.handle.length / 220));
        if (rec.leg.style === 'blown' || rec.leg.style === 'storm') atlas.setWeather('storm');
        await atlas.fleet.sail(rec.handle.path, seconds, (p) => rec.handle.set(p), rec.leg.style === 'blown' ? 'power1.inOut' : 'sail');
        atlas.setWeather('none');
      },
      flash: (color) => atlas.flash(color),
      shake: (k) => atlas.shake(k),
      setMood: (m) => this.setMood(m),
      sinkShips: async (count) => {
        const left = Math.max(0, atlas.fleet.alive - count);
        hud.setShips(left);
        await atlas.fleet.sink(count);
      },
      setWeather: (w) => atlas.setWeather(w),
      look: async (at, zoom) => {
        const p = project(at[0], at[1]);
        await atlas.camera.fly(atlas.camera.anchor(p, atlas.camera.zoom(zoom ?? c.zoom ?? 3.4), this.ui.stagePoint()), { duration: 1.2 });
      },
      settle: async () => {
        const p = project(c.at[0], c.at[1]);
        await atlas.camera.fly(atlas.camera.anchor(p, atlas.camera.zoom(c.zoom ?? 3.4), this.ui.stagePoint()), { duration: 1.2 });
      },
    };
    return {
      chapter: c,
      root: medallion.root,
      defs: medallion.defs,
      radius: RADIUS,
      atlas: api,
      hud,
      audio: this.audio,
      signal,
      reduced: prefersReducedMotion(),
      tap: (t, o) => inter.tap(t, o),
      hold: (o) => inter.hold(o),
      drag: (t, o) => inter.drag(t, o),
      choose: (o) => inter.choose(o),
      say: (text) => panel.say(text),
    };
  }

  private async playBeat(j: number): Promise<void> {
    const c = this.chapter;
    if (!c || !this.scene || !this.ctrl) return;
    const signal = this.ctrl.signal;
    this.beat = j;
    const beat = c.beats[j];
    const { panel } = this.ui;
    panel.setNext(this.nextLabel(), false);
    panel.setGate(beat.gate);
    const text = panel.setBeat(beat, j);
    let sceneDone: Promise<void>;
    try {
      sceneDone = Promise.resolve(this.scene.beat(j));
    } catch (e) {
      console.error(e);
      sceneDone = Promise.resolve();
    }
    await Promise.all([text, sceneDone.catch((e) => console.error(e))]);
    if (signal.aborted || this.beat !== j || this.chapter !== c) return;
    if (beat.gate) {
      panel.gateDone();
      panel.hideChoices();
    }
    panel.setNext(this.nextLabel(), true, true);
    if (beat.gate) panel.nextBtn.focus({ preventScroll: true });
  }

  private nextLabel(): string {
    const c = this.chapter;
    if (!c) return 'Devam';
    if (this.beat < c.beats.length - 1) return 'Devam';
    const next = this.story.chapters[this.index + 1];
    return next ? `Yola çık · ${next.label ?? next.title}` : 'Eve dönüş';
  }

  private setHurry(on: boolean): void {
    this.hurry = on;
    gsap.globalTimeline.timeScale(on ? 3.5 : 1);
  }

  /** Continue: next beat, next chapter, or the finale. */
  next(): void {
    if (this.busy) {
      if (!this.hurry && this.index >= 0) this.setHurry(true);
      return;
    }
    const c = this.chapter;
    if (!c || this.ui.panel.nextBtn.disabled) return;
    if (this.beat < c.beats.length - 1) {
      this.playBeat(this.beat + 1);
    } else if (this.index < this.story.chapters.length - 1) {
      this.goTo(this.index + 1, { sequential: true });
    } else {
      this.finish();
    }
  }

  prev(): void {
    if (this.busy || this.index <= 0) return;
    this.goTo(this.index - 1, { sequential: false });
  }

  private async finish(): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    await this.leave();
    this.busy = false;
    this.onFinish();
  }

  /** Put the reader back on the map without a chapter open (used by the finale). */
  async overview(): Promise<void> {
    const { atlas } = this.ui;
    this.all.forEach((l) => l.handle.set(1));
    this.story.chapters.forEach((c) => {
      if (!c.marker) atlas.setMarker(c.id, 'visited');
      atlas.reveal(c.id, c.at, c.reveal ?? 170, false);
    });
    atlas.setUnknownLabel(0);
    this.setMood('dawn');
    const r = this.ui.voyageRect();
    await atlas.camera.fly(atlas.camera.fit({ x: 120, y: 60, w: 1640, h: 1090 }, r, 1.2), { duration: 2.2 });
  }

  reset(): void {
    this.ctrl?.abort();
    this.scene?.destroy?.();
    this.scene = null;
    this.index = -1;
    this.beat = 0;
    this.ui.medallion.hideNow();
    this.ui.medallion.clear();
  }
}
