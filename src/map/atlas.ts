/**
 * The atlas: an SVG map of the Middle Sea painted like a red-figure vase —
 * clay lands on black glaze — with the unknown west veiled in mist until the
 * voyage reveals it. Owns the camera, markers, route legs, fleet and weather.
 */
import { s, h, r1 } from '../lib/dom';
import { gsap } from '../lib/motion';
import { clamp, smoothPath, sampleSpline, bounds, type Vec } from '../lib/geometry';
import { greekText } from '../art/letters';
import { Camera, type CamState, type Rect } from './camera';
import { Fleet } from './fleet';
import { COAST_TILES, LAND_COARSE_PATH, LAND_PATH, RIPPLE_TILES } from './data/land';
import { LABELS, dolphin, ketos, labelNode, reliefLayer, seaPattern, windRose } from './decor';
import { MAP_HEIGHT, MAP_WIDTH, project, type LonLat } from './projection';
import { L, bind, type Text } from '../i18n';
import type { LegStyle, Pictogram } from '../story/types';

export interface MarkerSpec {
  id: string;
  at: LonLat;
  name: Text;
  greek: string;
  numeral: string;
  side?: 'right' | 'left' | 'top' | 'bottom';
  pict?: Pictogram;
}

export interface LegHandle {
  id: string;
  path: SVGPathElement;
  mask: SVGPathElement;
  length: number;
  box: Rect;
  end: Vec;
  start: Vec;
  set(progress: number): void;
}

type MarkerState = 'hidden' | 'active' | 'visited';

export class Atlas {
  readonly el: HTMLDivElement;
  readonly svg: SVGSVGElement;
  readonly camera: Camera;
  readonly fleet: Fleet;
  private defs: SVGDefsElement;
  private layers: Record<string, SVGGElement> = {};
  private fogMask: SVGGElement;
  private markers = new Map<string, { g: SVGGElement; at: Vec; state: MarkerState }>();
  private legs = new Map<string, LegHandle>();
  private weather: SVGGElement;
  private reveals = new Map<string, SVGCircleElement>();
  private unknownLabel: SVGGElement;
  onMarkerClick: (id: string) => void = () => {};

  constructor(host: HTMLElement) {
    this.el = h('div', { class: 'atlas' });
    this.svg = s('svg', {
      class: 'atlas__svg',
      role: 'img',
      preserveAspectRatio: 'xMidYMid meet',
    });
    bind(this.svg, L('Odysseus’un yolculuğunu gösteren Akdeniz haritası', 'Map of the Mediterranean showing the voyage of Odysseus'), 'aria-label');
    this.el.appendChild(this.svg);
    host.appendChild(this.el);
    this.defs = s('defs');
    this.svg.appendChild(this.defs);

    // Definitions: sea texture, fog hatch, soft reveal disc.
    this.defs.appendChild(seaPattern('sea-glyphs'));
    const hatch = s('pattern', { id: 'fog-hatch', patternUnits: 'userSpaceOnUse', width: 9, height: 9, patternTransform: 'rotate(35)' });
    hatch.appendChild(s('line', { x1: 0, y1: 0, x2: 0, y2: 9, class: 'fog-hatch' }));
    this.defs.appendChild(hatch);
    const hole = s('radialGradient', { id: 'fog-hole' });
    hole.append(
      s('stop', { offset: '0%', 'stop-color': '#000', 'stop-opacity': 1 }),
      s('stop', { offset: '62%', 'stop-color': '#000', 'stop-opacity': 1 }),
      s('stop', { offset: '100%', 'stop-color': '#000', 'stop-opacity': 0 }),
    );
    this.defs.appendChild(hole);
    const PAD = 3000;
    const mask = s('mask', { id: 'fog-mask', maskUnits: 'userSpaceOnUse', x: -PAD, y: -PAD, width: MAP_WIDTH + PAD * 2, height: MAP_HEIGHT + PAD * 2 });
    mask.appendChild(s('rect', { x: -PAD, y: -PAD, width: MAP_WIDTH + PAD * 2, height: MAP_HEIGHT + PAD * 2, fill: '#fff' }));
    this.fogMask = s('g');
    mask.appendChild(this.fogMask);
    this.defs.appendChild(mask);

    const layer = (name: string, attrs: Record<string, string> = {}) => {
      const g = s('g', { class: `layer layer--${name}`, ...attrs });
      this.layers[name] = g;
      this.svg.appendChild(g);
      return g;
    };

    // Sea.
    const sea = layer('sea');
    sea.appendChild(s('rect', { class: 'sea', x: -PAD, y: -PAD, width: MAP_WIDTH + PAD * 2, height: MAP_HEIGHT + PAD * 2 }));
    sea.appendChild(s('rect', { class: 'sea-texture', x: -PAD, y: -PAD, width: MAP_WIDTH + PAD * 2, height: MAP_HEIGHT + PAD * 2, fill: 'url(#sea-glyphs)' }));

    // Water-lines: the coast echoed outward in fading dilute-glaze rings. The
    // strokes are split into grid tiles so off-screen parts are never painted.
    const ripples = layer('ripples');
    for (const [w, o] of [[30, 0.1], [19, 0.16], [9, 0.26]] as const) {
      const ring = s('g', { class: 'ripple', 'stroke-width': w, style: `opacity:${o}` });
      RIPPLE_TILES.forEach((d) => d && ring.appendChild(s('path', { d })));
      ripples.appendChild(ring);
    }

    // Land, in two levels of detail: generalised for distant views, full detail
    // (with a tiled coastline) once the camera comes close.
    const land = layer('land');
    land.appendChild(s('path', { d: LAND_COARSE_PATH, class: 'land lod-far' }));
    land.appendChild(s('path', { d: LAND_COARSE_PATH, class: 'coast lod-far' }));
    land.appendChild(s('path', { d: LAND_PATH, class: 'land lod-near' }));
    const coast = s('g', { class: 'coast lod-near' });
    COAST_TILES.forEach((d) => d && coast.appendChild(s('path', { d })));
    land.appendChild(coast);
    land.appendChild(reliefLayer());

    // Labels & ornaments.
    const labels = layer('labels');
    LABELS.forEach((l) => labels.appendChild(labelNode(l)));
    const decor = layer('decor');
    decor.appendChild(windRose([27.4, 33.25], 62));
    decor.appendChild(dolphin([19.55, 35.55], 1.05, false, -12));
    decor.appendChild(dolphin([20.2, 35.25], 0.9, false, 8));
    decor.appendChild(dolphin([27.9, 36.2], 0.8, true, 10));
    decor.appendChild(ketos([11.1, 38.55], 1.15));
    decor.appendChild(ketos([16.9, 33.05], 0.9));

    // The unknown west.
    const fog = layer('fog');
    fog.setAttribute('mask', 'url(#fog-mask)');
    fog.appendChild(s('rect', { class: 'fog', x: -PAD, y: -PAD, width: MAP_WIDTH + PAD * 2, height: MAP_HEIGHT + PAD * 2 }));
    fog.appendChild(s('rect', { class: 'fog fog--hatch', x: -PAD, y: -PAD, width: MAP_WIDTH + PAD * 2, height: MAP_HEIGHT + PAD * 2, fill: 'url(#fog-hatch)' }));
    this.unknownLabel = s('g', { class: 'unknown-label' });
    const [ux, uy] = project(13.2, 35.6);
    const gt = greekText('ΑΓΝΩΣΤΟΣ ΓΗ', { size: 26, weight: 1, align: 'middle', tracking: 4 });
    gt.g.setAttribute('transform', `translate(${ux} ${uy})`);
    const sub = s('text', { x: ux, y: uy + 34, 'text-anchor': 'middle', class: 'unknown-label__sub' });
    bind(sub, L('Bilinmeyen Diyarlar', 'Unknown Lands'));
    this.unknownLabel.append(gt.g, sub);
    layer('unknown').appendChild(this.unknownLabel);

    layer('routes');
    layer('markers');
    this.fleet = new Fleet(layer('fleet'), 12);
    this.weather = layer('weather');

    this.camera = new Camera(this.svg);
    this.camera.onChange((c) => this.onCamera(c));
    const ro = new ResizeObserver(() => this.resize());
    ro.observe(this.el);
    this.resize();
    this.camera.jump({ x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2, s: this.camera.minScale });

    gsap.ticker.add((_time, delta) => this.fleet.update(delta / 1000));
  }

  resize(): void {
    const r = this.el.getBoundingClientRect();
    this.camera.resize(r.width || innerWidth, r.height || innerHeight);
  }

  private far: boolean | null = null;

  private onCamera(c: CamState): void {
    this.fleet.onCamera(c.s, this.camera.minScale);
    const far = c.s / this.camera.minScale < 1.8;
    if (far !== this.far) {
      this.far = far;
      this.svg.classList.toggle('is-far', far);
    }
    const k = 1 / c.s;
    this.markers.forEach((m) => {
      m.g.setAttribute('transform', `translate(${r1(m.at[0])} ${r1(m.at[1])}) scale(${k.toFixed(4)})`);
    });
  }

  /* ---------------------------------------------------------------- */
  /* Markers                                                           */
  /* ---------------------------------------------------------------- */

  addMarker(m: MarkerSpec): void {
    const at = project(m.at[0], m.at[1]) as Vec;
    const g = s('g', { class: 'marker is-hidden', 'data-id': m.id, tabindex: -1, role: 'button' });
    bind(g, m.name, 'aria-label');
    g.appendChild(s('circle', { class: 'marker__hit', r: 22 }));
    g.appendChild(s('circle', { class: 'marker__pulse', r: 11 }));
    g.appendChild(s('circle', { class: 'marker__ring', r: 9 }));
    g.appendChild(s('circle', { class: 'marker__dot', r: 3.6 }));
    const label = s('g', { class: 'marker__label' });
    const side = m.side ?? 'right';
    const anchor = side === 'left' ? 'end' : side === 'right' ? 'start' : 'middle';
    const off: Vec = side === 'left' ? [-16, 0] : side === 'right' ? [16, 0] : side === 'top' ? [0, -30] : [0, 26];
    const name = s('text', { class: 'marker__name', x: off[0], y: off[1] + 1, 'text-anchor': anchor });
    bind(name, m.name);
    label.appendChild(name);
    const gk = greekText(m.greek, { size: 7.5, weight: 1.2, tracking: 2.6, align: anchor === 'start' ? 'start' : anchor === 'end' ? 'end' : 'middle' });
    gk.g.setAttribute('transform', `translate(${off[0]} ${off[1] + 14})`);
    gk.g.classList.add('marker__greek');
    label.appendChild(gk.g);
    const num = greekText(m.numeral, { size: 7, weight: 1.3, tracking: 1.2, align: 'middle' });
    num.g.setAttribute('transform', 'translate(0 -18)');
    num.g.classList.add('marker__num');
    g.appendChild(label);
    g.appendChild(num.g);
    if (m.pict) {
      // The pictogram sits opposite the label.
      const at: Vec = m.pict.at ?? (side === 'left' ? [30, 0] : side === 'right' ? [-30, 0] : side === 'top' ? [0, 32] : [0, -32]);
      const pict = s('g', { class: 'marker__pict', transform: `translate(${at[0]} ${at[1]})` });
      pict.appendChild(s('circle', { r: 17, class: 'marker__pict-bg' }));
      if (m.pict.fill) pict.appendChild(s('path', { d: m.pict.fill, class: 'marker__pict-fill' }));
      if (m.pict.stroke) pict.appendChild(s('path', { d: m.pict.stroke, class: 'marker__pict-stroke', pathLength: 1 }));
      g.appendChild(pict);
    }
    g.addEventListener('click', () => this.onMarkerClick(m.id));
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.onMarkerClick(m.id);
      }
    });
    this.layers.markers.appendChild(g);
    this.markers.set(m.id, { g, at, state: 'hidden' });
    this.onCamera(this.camera.state);
  }

  setMarker(id: string, state: MarkerState): void {
    const m = this.markers.get(id);
    if (!m || m.state === state) return;
    m.state = state;
    m.g.classList.remove('is-hidden', 'is-active', 'is-visited');
    m.g.classList.add(`is-${state}`);
    m.g.setAttribute('tabindex', state === 'hidden' ? '-1' : '0');
    if (state === 'active') {
      gsap.fromTo(m.g.querySelector('.marker__ring'), { scale: 0.2, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.8, ease: 'back.out(2.2)' });
      gsap.fromTo(m.g.querySelector('.marker__label'), { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: 0.7, delay: 0.2, ease: 'power3.out' });
      const pict = m.g.querySelector('.marker__pict');
      if (pict) {
        // The cartographer paints the sign: a disc, the solid parts, then the strokes.
        gsap.fromTo(pict, { scale: 0.4, opacity: 0, transformOrigin: '50% 50%' }, { scale: 1, opacity: 1, duration: 0.7, delay: 0.5, ease: 'back.out(2)' });
        const stroke = pict.querySelector('.marker__pict-stroke');
        if (stroke) gsap.fromTo(stroke, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, delay: 0.8, ease: 'power2.out' });
      }
    }
  }

  markerPoint(id: string): Vec | undefined {
    return this.markers.get(id)?.at;
  }

  /* ---------------------------------------------------------------- */
  /* Routes                                                            */
  /* ---------------------------------------------------------------- */

  addLeg(id: string, pts: LonLat[], style: LegStyle = 'sail'): LegHandle {
    const existing = this.legs.get(id);
    if (existing) return existing;
    const P = pts.map(([lo, la]) => project(lo, la) as Vec);
    let d: string;
    if (style === 'blown') {
      // A wind-tossed track: the smooth course, worried by gusts.
      const base = sampleSpline(P, 90);
      const acc = [0];
      for (let i = 1; i < base.length; i++) acc.push(acc[i - 1] + Math.hypot(base[i][0] - base[i - 1][0], base[i][1] - base[i - 1][1]));
      const total = acc[acc.length - 1] || 1;
      const wob = base.map((p, i) => {
        if (i === 0 || i === base.length - 1) return p;
        const a = base[Math.max(0, i - 1)], b = base[Math.min(base.length - 1, i + 1)];
        const tx = b[0] - a[0], ty = b[1] - a[1];
        const L = Math.hypot(tx, ty) || 1;
        // Gusts only over open water: the envelope fades out before the end of the leg.
        const u = acc[i] / total;
        const env = u < 0.7 ? Math.sin((u / 0.7) * Math.PI) : 0;
        const amp = env * (10 + 8 * Math.sin(i * 0.9));
        const w = Math.sin(i * 0.55) * amp;
        return [p[0] - (ty / L) * w, p[1] + (tx / L) * w] as Vec;
      });
      d = smoothPath(wob);
    } else d = smoothPath(P);
    const PAD = 3000;
    const maskId = `leg-mask-${id}`;
    const mask = s('mask', { id: maskId, maskUnits: 'userSpaceOnUse', x: -PAD, y: -PAD, width: MAP_WIDTH + PAD * 2, height: MAP_HEIGHT + PAD * 2 });
    const mpath = s('path', { d, class: 'leg-mask', pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 });
    mask.appendChild(mpath);
    this.defs.appendChild(mask);
    const path = s('path', { d, class: `leg leg--${style}`, mask: `url(#${maskId})`, 'data-leg': id });
    this.layers.routes.appendChild(path);
    const length = path.getTotalLength();
    const samples: Vec[] = [];
    for (let i = 0; i <= 24; i++) {
      const p = path.getPointAtLength((length * i) / 24);
      samples.push([p.x, p.y]);
    }
    const handle: LegHandle = {
      id,
      path,
      mask: mpath,
      length,
      box: bounds(samples),
      start: samples[0],
      end: samples[samples.length - 1],
      set: (p: number) => mpath.setAttribute('stroke-dashoffset', (1 - clamp(p, 0, 1)).toFixed(4)),
    };
    this.legs.set(id, handle);
    return handle;
  }

  leg(id: string): LegHandle | undefined {
    return this.legs.get(id);
  }

  /* ---------------------------------------------------------------- */
  /* The unknown world                                                 */
  /* ---------------------------------------------------------------- */

  reveal(id: string, at: LonLat, r: number, animate = true): Promise<void> {
    const [x, y] = project(at[0], at[1]);
    let c = this.reveals.get(id);
    if (!c) {
      c = s('circle', { cx: r1(x), cy: r1(y), r: 0, fill: 'url(#fog-hole)' });
      this.fogMask.appendChild(c);
      this.reveals.set(id, c);
    }
    if (!animate) {
      c.setAttribute('r', String(r));
      return Promise.resolve();
    }
    return new Promise((resolve) => gsap.to(c, { attr: { r }, duration: 2.2, ease: 'power2.out', onComplete: resolve }));
  }

  /** Fade the "unknown lands" inscription as the west becomes known. */
  setUnknownLabel(opacity: number): void {
    gsap.to(this.unknownLabel, { opacity, duration: 1.2 });
  }

  /* ---------------------------------------------------------------- */
  /* Weather & effects                                                 */
  /* ---------------------------------------------------------------- */

  setWeather(w: 'none' | 'storm' | 'rain' | 'night' | 'mist'): void {
    this.el.dataset.weather = w;
  }

  flash(color = '#fff6dd'): void {
    const f = h('div', { class: 'atlas__flash', style: `background:${color}` });
    this.el.appendChild(f);
    gsap.fromTo(f, { opacity: 0.9 }, { opacity: 0, duration: 0.9, ease: 'power2.out', onComplete: () => f.remove() });
  }

  shake(strength = 8): void {
    gsap.fromTo(
      this.svg,
      { x: 0, y: 0 },
      {
        keyframes: [
          { x: -strength, y: strength * 0.4, duration: 0.05 },
          { x: strength * 0.8, y: -strength * 0.5, duration: 0.05 },
          { x: -strength * 0.5, y: strength * 0.3, duration: 0.06 },
          { x: strength * 0.3, y: 0, duration: 0.07 },
          { x: 0, y: 0, duration: 0.08 },
        ],
      },
    );
  }

  get weatherLayer(): SVGGElement {
    return this.weather;
  }
}
