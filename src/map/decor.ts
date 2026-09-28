/**
 * Hand-placed cartography: region and sea names, mountain glyphs, a volcano,
 * a wind rose with the four Anemoi, dolphins and a sea monster — the
 * furniture of an old atlas, drawn in the manner of the vase painters.
 */
import { s, r1 } from '../lib/dom';
import { rng, range } from '../lib/random';
import { ribbon, type Vec } from '../lib/geometry';
import { greekText } from '../art/letters';
import { project, type LonLat } from './projection';
import { bind, lang, type Loc } from '../i18n';

export interface MapLabel {
  at: LonLat;
  /** The ancient name, transliterated (with Turkish dotted capitals; plain I in English). */
  text: string;
  /** Today's name in the reading language. */
  sub?: Loc;
  kind: 'land' | 'sea' | 'minor';
  size?: number;
  rotate?: number;
  /** Hidden until this chapter's region has been revealed. */
  west?: boolean;
}

export const LABELS: MapLabel[] = [
  { at: [21.85, 39.35], text: 'HELLAS', sub: { tr: 'Yunanistan', en: 'Greece' }, kind: 'land', size: 30 },
  { at: [22.15, 37.5], text: 'PELOPONNESOS', sub: { tr: 'Mora', en: 'Peloponnese' }, kind: 'land', size: 15, rotate: -8 },
  { at: [24.35, 41.3], text: 'THRAKE', sub: { tr: 'Trakya', en: 'Thrace' }, kind: 'land', size: 22 },
  { at: [28.35, 38.55], text: 'ASİA', sub: { tr: 'Anadolu', en: 'Anatolia' }, kind: 'land', size: 28 },
  { at: [24.75, 35.24], text: 'KRETE', sub: { tr: 'Girit', en: 'Crete' }, kind: 'land', size: 14, rotate: -6 },
  { at: [14.25, 37.6], text: 'SİKELİA', sub: { tr: 'Sicilya', en: 'Sicily' }, kind: 'land', size: 20, rotate: -4, west: true },
  { at: [16.05, 40.65], text: 'İTALİA', sub: { tr: 'İtalya', en: 'Italy' }, kind: 'land', size: 22, rotate: -42, west: true },
  { at: [9.05, 40.05], text: 'SARDO', sub: { tr: 'Sardinya', en: 'Sardinia' }, kind: 'land', size: 15, rotate: -80, west: true },
  { at: [9.1, 42.25], text: 'KYRNOS', sub: { tr: 'Korsika', en: 'Corsica' }, kind: 'land', size: 12, rotate: -80, west: true },
  { at: [12.2, 32.4], text: 'LİBYE', sub: { tr: 'Kuzey Afrika', en: 'North Africa' }, kind: 'land', size: 30, west: true },
  { at: [20.1, 41.6], text: 'İLLYRİA', kind: 'land', size: 13, rotate: -60 },
  { at: [25.35, 37.65], text: 'AİGAİON PELAGOS', sub: { tr: 'Ege Denizi', en: 'Aegean Sea' }, kind: 'sea', size: 15 },
  { at: [18.4, 37.2], text: 'İONİON PELAGOS', sub: { tr: 'İyon Denizi', en: 'Ionian Sea' }, kind: 'sea', size: 17 },
  { at: [12.45, 39.75], text: 'TYRSENİKON PELAGOS', sub: { tr: 'Tiren Denizi', en: 'Tyrrhenian Sea' }, kind: 'sea', size: 15, west: true },
  { at: [17.2, 42.3], text: 'ADRİAS', sub: { tr: 'Adriyatik', en: 'Adriatic' }, kind: 'sea', size: 13, rotate: -36 },
  { at: [21.8, 34.2], text: 'LİBYKON PELAGOS', sub: { tr: 'Libya Denizi', en: 'Libyan Sea' }, kind: 'sea', size: 15 },
  { at: [22.45, 40.24], text: 'Olympos', kind: 'minor', size: 9 },
  { at: [26.9, 39.54], text: 'İda', kind: 'minor', size: 9 },
  { at: [15.0, 37.58], text: 'Aitna', kind: 'minor', size: 9, west: true },
  { at: [26.05, 39.72], text: 'Hellespontos', kind: 'minor', size: 8, rotate: -40 },
  { at: [22.95, 36.12], text: 'Kythera', kind: 'minor', size: 8 },
];

/** Mountain glyph positions, grouped loosely by range. */
const MOUNTAINS: LonLat[] = [
  // Pindos, Olympos, Parnassos, Taygetos
  [21.25, 40.25], [21.35, 39.75], [21.55, 39.3], [21.75, 38.9], [22.35, 40.08], [22.0, 40.3], [22.55, 38.55],
  [22.35, 37.05], [22.25, 37.55], [21.95, 37.85],
  // Thrace & Rhodope
  [24.3, 41.55], [24.9, 41.7], [25.6, 41.55], [23.6, 41.4],
  // Anatolia
  [26.85, 39.7], [27.5, 39.1], [28.2, 39.35], [29.0, 39.6], [27.8, 37.75], [28.6, 37.4], [29.3, 38.2], [29.4, 37.1],
  // Illyria
  [20.1, 41.2], [20.4, 40.5], [19.6, 42.1],
  // Apennines
  [13.2, 42.4], [13.9, 41.95], [14.6, 41.5], [15.3, 40.95], [15.9, 40.35], [16.15, 39.45], [16.25, 38.75],
  // Sicily
  [14.4, 37.92], [13.6, 37.78], [14.0, 37.4],
  // Sardinia & Corsica
  [9.25, 40.2], [9.3, 39.7], [9.05, 42.05],
  // Libya / Tunisia highlands
  [8.7, 35.6], [9.3, 35.1], [8.4, 36.4], [12.3, 31.85], [11.2, 32.0],
  // Crete
  [24.0, 35.33], [24.8, 35.2],
];

const VOLCANO: LonLat = [14.99, 37.75];

export function labelNode(l: MapLabel): SVGGElement {
  const [x, y] = project(l.at[0], l.at[1]);
  const g = s('g', {
    class: `map-label map-label--${l.kind}${l.west ? ' is-west' : ''}`,
    transform: `translate(${r1(x)} ${r1(y)})${l.rotate ? ` rotate(${l.rotate})` : ''}`,
  });
  const size = l.size ?? 16;
  const main = s('text', { class: 'map-label__main', 'font-size': size, 'text-anchor': 'middle', y: 0 });
  bind(main, () => (lang() === 'en' ? l.text.replace(/İ/g, 'I') : l.text));
  g.appendChild(main);
  if (l.sub) {
    const sub = s('text', { class: 'map-label__sub', 'font-size': Math.max(7, size * 0.52), 'text-anchor': 'middle', y: size * 0.72 });
    bind(sub, l.sub);
    g.appendChild(sub);
  }
  return g;
}

/** A small painted mountain: a humped triangle with hatching on one flank. */
function mountain(x: number, y: number, k: number, rand: () => number): string {
  const w = 16 * k, hgt = (11 + rand() * 5) * k;
  const peak = x + (rand() - 0.5) * 3 * k;
  let d = `M${r1(x - w / 2)} ${r1(y)}Q${r1(peak - w * 0.18)} ${r1(y - hgt * 0.7)} ${r1(peak)} ${r1(y - hgt)}Q${r1(peak + w * 0.2)} ${r1(y - hgt * 0.62)} ${r1(x + w / 2)} ${r1(y)}Z`;
  // A second, smaller peak behind.
  if (rand() > 0.4) {
    const px = x + w * 0.42, ph = hgt * 0.62;
    d += `M${r1(px - w * 0.3)} ${r1(y)}Q${r1(px - 1)} ${r1(y - ph * 0.8)} ${r1(px + 1)} ${r1(y - ph)}Q${r1(px + w * 0.16)} ${r1(y - ph * 0.5)} ${r1(px + w * 0.34)} ${r1(y)}Z`;
  }
  return d;
}

function hatch(x: number, y: number, k: number): string {
  let d = '';
  for (let i = 0; i < 3; i++) {
    const xx = x + (1.5 + i * 2.2) * k;
    d += `M${r1(xx)} ${r1(y - (7 - i * 2) * k)}l${r1(1.6 * k)} ${r1((5 - i) * k)}`;
  }
  return d;
}

export function reliefLayer(): SVGGElement {
  const g = s('g', { class: 'relief' });
  const rand = rng(1184);
  let body = '';
  let lines = '';
  for (const [lon, lat] of MOUNTAINS) {
    const [x, y] = project(lon, lat);
    const k = range(rand, 0.7, 1.0);
    body += mountain(x, y, k, rand);
    lines += hatch(x, y, k);
  }
  g.appendChild(s('path', { class: 'relief__body', d: body }));
  g.appendChild(s('path', { class: 'relief__hatch', d: lines }));
  // Aitna, smoking.
  const [vx, vy] = project(VOLCANO[0], VOLCANO[1]);
  g.appendChild(
    s('path', {
      class: 'relief__body',
      d: `M${r1(vx - 13)} ${r1(vy + 4)}L${r1(vx - 3)} ${r1(vy - 12)}H${r1(vx + 3)}L${r1(vx + 13)} ${r1(vy + 4)}Z`,
    }),
  );
  const smoke = s('path', {
    class: 'relief__smoke',
    d: ribbon([[vx, vy - 13], [vx + 3, vy - 22], [vx - 2, vy - 31], [vx + 5, vy - 40], [vx + 12, vy - 44]], [[0, 1.8], [0.5, 4.2], [1, 1.2]], 30),
  });
  g.appendChild(smoke);
  return g;
}

/** Four-wind rose with the Anemoi's names written as on a vase. */
export function windRose(at: LonLat, r = 58): SVGGElement {
  const [x, y] = project(at[0], at[1]);
  const g = s('g', { class: 'wind-rose', transform: `translate(${r1(x)} ${r1(y)})` });
  g.appendChild(s('circle', { r: r * 0.62, class: 'wind-rose__ring' }));
  g.appendChild(s('circle', { r: r * 0.52, class: 'wind-rose__ring wind-rose__ring--thin' }));
  let star = '';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const long = i % 2 === 0;
    const L = long ? r : r * 0.55;
    const w = long ? r * 0.11 : r * 0.07;
    const tip: Vec = [Math.cos(a) * L, Math.sin(a) * L];
    const l: Vec = [Math.cos(a - Math.PI / 2) * w, Math.sin(a - Math.PI / 2) * w];
    star += `M${r1(l[0])} ${r1(l[1])}L${r1(tip[0])} ${r1(tip[1])}L${r1(-l[0])} ${r1(-l[1])}Z`;
  }
  g.appendChild(s('path', { d: star, class: 'wind-rose__star' }));
  g.appendChild(s('circle', { r: r * 0.08, class: 'wind-rose__hub' }));
  const names: Array<[string, number]> = [['ΒΟΡΕΑΣ', -90], ['ΕΥΡΟΣ', 0], ['ΝΟΤΟΣ', 90], ['ΖΕΦΥΡΟΣ', 180]];
  for (const [name, deg] of names) {
    const a = (deg * Math.PI) / 180;
    const t = greekText(name, { size: r * 0.14, weight: 1.3, align: 'middle', tracking: 2.4 });
    const dist = r * 1.22;
    t.g.setAttribute('transform', `translate(${r1(Math.cos(a) * dist)} ${r1(Math.sin(a) * dist)})`);
    t.g.classList.add('wind-rose__name');
    g.appendChild(t.g);
  }
  return g;
}

/** A leaping dolphin in the red-figure manner. */
export function dolphin(at: LonLat, k = 1, flip = false, rot = 0): SVGGElement {
  const [x, y] = project(at[0], at[1]);
  const g = s('g', {
    class: 'sea-creature',
    transform: `translate(${r1(x)} ${r1(y)}) rotate(${rot}) scale(${flip ? -k : k} ${k})`,
  });
  const body = ribbon(
    [[-26, 8], [-16, -2], [-2, -8], [12, -7], [22, -2], [28, 2]],
    [[0, 1.5], [0.18, 4], [0.5, 9], [0.8, 6], [0.95, 2.6], [1, 1.4]],
    40,
  );
  g.appendChild(s('path', { d: body, class: 'sea-creature__body' }));
  g.appendChild(s('path', { d: 'M-24 7L-33 3L-29 10L-33 16Z M2 -10L-4 -19L8 -12Z M8 0L4 7L13 2Z', class: 'sea-creature__body' }));
  g.appendChild(s('circle', { cx: 19, cy: -3.5, r: 1.2, class: 'sea-creature__eye' }));
  g.appendChild(s('path', { d: 'M-18 3Q0 -2 20 1', class: 'sea-creature__line' }));
  return g;
}

/** Ketos — the serpentine sea monster of Greek art. */
export function ketos(at: LonLat, k = 1): SVGGElement {
  const [x, y] = project(at[0], at[1]);
  const g = s('g', { class: 'sea-creature sea-creature--ketos', transform: `translate(${r1(x)} ${r1(y)}) scale(${k})` });
  const body = ribbon(
    [[-58, 4], [-46, -8], [-30, 6], [-14, -6], [2, 4], [16, -4], [26, -14], [34, -20]],
    [[0, 1.4], [0.12, 6], [0.4, 10], [0.7, 9], [0.88, 7], [1, 4]],
    60,
  );
  g.appendChild(s('path', { d: body, class: 'sea-creature__body' }));
  // Head with open jaws and a crest.
  g.appendChild(
    s('path', {
      d: 'M30 -24C36 -30 46 -30 52 -25L60 -23L50 -20L58 -16L48 -15C42 -12 34 -13 30 -16Z M32 -26L28 -36L36 -29L37 -38L41 -29Z',
      class: 'sea-creature__body',
    }),
  );
  g.appendChild(s('circle', { cx: 43, cy: -23.5, r: 1.4, class: 'sea-creature__eye' }));
  g.appendChild(s('path', { d: 'M-60 4L-70 -6L-66 6L-72 14Z', class: 'sea-creature__body' }));
  let fins = '';
  for (const fx of [-38, -8, 20]) fins += `M${fx} -6l6 -10l3 9z`;
  g.appendChild(s('path', { d: fins, class: 'sea-creature__body' }));
  g.appendChild(s('path', { d: 'M-44 -2Q-30 10 -16 -1Q0 10 14 -1', class: 'sea-creature__line' }));
  return g;
}

/** Sparse wave glyphs used as the sea texture pattern. */
export function seaPattern(id: string): SVGPatternElement {
  const p = s('pattern', { id, patternUnits: 'userSpaceOnUse', width: 150, height: 96 });
  const rand = rng(7);
  let d = '';
  for (let i = 0; i < 4; i++) {
    const x = range(rand, 6, 130), y = range(rand, 10, 88);
    const w = range(rand, 9, 14);
    d += `M${r1(x)} ${r1(y)}q${r1(w / 4)} ${r1(-w / 5)} ${r1(w / 2)} 0t${r1(w / 2)} 0`;
  }
  p.appendChild(s('path', { d, class: 'sea-glyphs' }));
  return p;
}
