/** Story data model: a story is a list of chapters; a chapter is a list of beats. */
import type { LonLat } from '../map/projection';
import type { Loc, Text } from '../i18n';

export type Mood = 'day' | 'night' | 'storm' | 'underworld' | 'dawn';
export type VesselKind = 'fleet' | 'ship' | 'raft' | 'wreck' | 'phaeacian';
export type LegStyle = 'sail' | 'storm' | 'blown' | 'drift' | 'feint' | 'night';

export interface Leg {
  id: string;
  /** Defaults to where the previous chapter ended. */
  from?: LonLat;
  via?: LonLat[];
  /** Defaults to the chapter's location. */
  to?: LonLat;
  style?: LegStyle;
  vessel?: VesselKind;
  /** Voyage duration in seconds (auto from length when omitted). */
  duration?: number;
  /** Caption shown over the map while sailing this leg (Greek stays untranslated). */
  caption?: { text: Loc; greek?: string };
}

export interface Quote {
  greek: string;
  /** The line rendered in each reading language. */
  text: Loc;
  ref: Loc;
}

export interface Aside {
  title: Loc;
  text: Loc;
}

export type Gate =
  | { kind: 'tap'; prompt: Loc }
  | { kind: 'hold'; prompt: Loc }
  | { kind: 'drag'; prompt: Loc }
  | { kind: 'choice'; prompt: Loc };

export interface Beat {
  /** A short note. May contain <em> and <strong>. */
  text: Loc;
  /** The beat waits for this interaction before the story may continue. */
  gate?: Gate;
  quote?: Quote;
  aside?: Aside;
}

export type PartId = 'cagri' | 'savas' | 'donus' | 'ithaka';

export interface Part {
  id: PartId;
  title: Loc;
  greek: string;
}

export interface Chapter {
  id: string;
  part: PartId;
  title: Loc;
  /** Greek name in capitals (drawn with the inscription letters). */
  greek: string;
  /** Where tradition places it today. */
  place: Loc;
  at: LonLat;
  /** Where the ships moor, if not at the marker itself. */
  harbor?: LonLat;
  labelSide?: 'right' | 'left' | 'top' | 'bottom';
  /** Short label for the map marker (defaults to title). */
  label?: Loc;
  /** Reuse another chapter's map marker instead of adding one (same place, later visit). */
  marker?: string;
  year: number;
  ships: number;
  mood?: Mood;
  /** Poseidon's wrath is upon Odysseus when this chapter begins. */
  wrath?: boolean;
  arrival?: Leg;
  /** Additional legs a scene sails during its beats. */
  legs?: Leg[];
  /** Radius (map units) of the unknown world revealed on arrival. */
  reveal?: number;
  /** Camera zoom at this stop, as a multiple of the whole-map scale. */
  zoom?: number;
  beats: Beat[];
  /** The tondo for this chapter, either bundled… */
  scene?: SceneFactory;
  /** …or loaded on demand (code-split), e.g. `() => import('../../scenes/kyklop')`. */
  load?: () => Promise<{ scene: SceneFactory }>;
  /** State once the chapter is over (defaults: same year/ships, ends at `at`). */
  end?: { year?: number; ships?: number; at?: LonLat; mood?: Mood };
}

/** A small painted sign beside a map stop (24-unit box centred on the origin). */
export interface Pictogram {
  stroke?: string;
  fill?: string;
  /** Offset from the marker in screen px (defaults to the side opposite the label). */
  at?: [number, number];
}

export interface Story {
  id: string;
  title: Loc;
  greekTitle: string;
  subtitle: Loc;
  parts: Part[];
  chapters: Chapter[];
  startYear: number;
  totalYears: number;
  initialShips: number;
  /** Map points (lon/lat) and radii that are "known" before the voyage begins. */
  known: Array<{ at: LonLat; r: number }>;
  /** Pictograms painted beside visited stops, by chapter id. */
  pictograms?: Record<string, Pictogram>;
}

/* ------------------------------------------------------------------ */
/* Scenes                                                              */
/* ------------------------------------------------------------------ */

export interface AtlasApi {
  sail(legId: string): Promise<void>;
  flash(color?: string): void;
  shake(strength?: number): void;
  setMood(m: Mood): void;
  sinkShips(count: number): Promise<void>;
  setWeather(w: 'none' | 'storm' | 'rain' | 'night' | 'mist'): void;
  /** Temporarily focus the camera somewhere (lon/lat) at a zoom level. */
  look(at: LonLat, zoom?: number): Promise<void>;
  /** Return to the chapter's own framing. */
  settle(): Promise<void>;
}

export interface HudApi {
  setYear(year: number, seconds?: number): void;
  setShips(n: number): void;
  wrath(on: boolean): void;
}

export interface AudioApi {
  sfx(name: string): void;
}

export interface TapOptions {
  /** What the tap does, for screen readers (e.g. L('Halatı kes', 'Cut the rope')). */
  label: Text;
  /** Show a pulsing ring on the target. */
  pulse?: boolean;
}

export interface HoldOptions {
  /** Shown on the hold button. */
  label: Text;
  seconds: number;
  target?: SVGGraphicsElement;
  onProgress?(p: number): void;
}

export interface DragOptions {
  label: Text;
  /** Called with a 0..1 progress; resolve when it reaches 1. */
  axis: 'x' | 'y' | 'xy';
  /** Distance (scene units) of a complete drag along the axis; negative drags left/up. */
  distance: number;
  onProgress(p: number): void;
  /** Snap back when released before completion. */
  springBack?: boolean;
}

export interface ChoiceOption {
  id: string;
  label: Text;
}

export interface SceneContext {
  chapter: Chapter;
  /** Drawing root inside the tondo; centre (0,0), usable radius `radius`. */
  root: SVGGElement;
  defs: SVGDefsElement;
  radius: number;
  atlas: AtlasApi;
  hud: HudApi;
  audio: AudioApi;
  signal: AbortSignal;
  reduced: boolean;
  tap(target: SVGGraphicsElement, opts: TapOptions): Promise<void>;
  hold(opts: HoldOptions): Promise<void>;
  drag(target: SVGGraphicsElement, opts: DragOptions): Promise<void>;
  choose(options: ChoiceOption[]): Promise<string>;
  /** Replace the panel's gate prompt text (e.g. after a wrong choice). */
  say(text: Text): void;
}

export interface Scene {
  /** Entrance animation after the tondo appears. */
  enter?(): Promise<void> | void;
  /** Play beat `i`. Resolve when its animation (and interaction, if gated) is complete. */
  beat(i: number): Promise<void> | void;
  destroy?(): void;
}

export type SceneFactory = (ctx: SceneContext) => Scene;
