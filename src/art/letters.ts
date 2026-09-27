/**
 * An inscriptional Greek capital alphabet drawn as single strokes — the kind of
 * monoline letters painters wrote beside their figures on Attic vases. Glyphs
 * live on a 10-unit cap height; every path can be "written" on screen by
 * animating its dash offset (pathLength is normalised to 1).
 */
import { s } from '../lib/dom';

interface Glyph {
  w: number;
  d: string;
}

const GLYPHS: Record<string, Glyph> = {
  Α: { w: 9, d: 'M0.6 10L4.5 0L8.4 10M2.1 6.2H6.9' },
  Β: { w: 7.6, d: 'M1 10V0H4.5C6.3 0 7 1.1 7 2.5S6.2 5 4.5 5H1M4.5 5C6.6 5 7.4 6.2 7.4 7.5S6.6 10 4.5 10H1' },
  Γ: { w: 6.6, d: 'M6.4 0H1V10' },
  Δ: { w: 9, d: 'M4.5 0L0.6 10H8.4Z' },
  Ε: { w: 6.6, d: 'M6.4 0H1V10H6.4M1 5H5.2' },
  Ζ: { w: 7.6, d: 'M1 0H7L1 10H7' },
  Η: { w: 8, d: 'M1 0V10M7 0V10M1 5H7' },
  Θ: { w: 9.4, d: 'M4.7 0A4.1 5 0 1 0 4.7 10A4.1 5 0 1 0 4.7 0M2.9 5H6.5' },
  Ι: { w: 2, d: 'M1 0V10' },
  Κ: { w: 7.6, d: 'M1 0V10M7 0L1.2 5.9M3.3 3.9L7.2 10' },
  Λ: { w: 9, d: 'M0.6 10L4.5 0L8.4 10' },
  Μ: { w: 10, d: 'M1 10V0L5 7L9 0V10' },
  Ν: { w: 8, d: 'M1 10V0L7 10V0' },
  Ξ: { w: 7.2, d: 'M1 0H6.6M1.8 5H5.8M1 10H6.6' },
  Ο: { w: 9.4, d: 'M4.7 0A4.1 5 0 1 0 4.7 10A4.1 5 0 1 0 4.7 0' },
  Π: { w: 8, d: 'M1 10V0H7V10' },
  Ρ: { w: 7.2, d: 'M1 10V0H4.3C6.2 0 7 1.3 7 2.8S6.2 5.6 4.3 5.6H1' },
  Σ: { w: 7.6, d: 'M7 0H1L4.7 5L1 10H7' },
  Τ: { w: 8, d: 'M0.5 0H7.5M4 0V10' },
  Υ: { w: 8.6, d: 'M0.6 0L4.3 5L8 0M4.3 5V10' },
  Φ: { w: 10, d: 'M5 0V10M5 2.3C1.4 2.3 0.7 3.8 0.7 5S1.4 7.7 5 7.7S9.3 6.2 9.3 5S8.6 2.3 5 2.3' },
  Χ: { w: 8, d: 'M1 0L7 10M7 0L1 10' },
  Ψ: { w: 9, d: 'M4.5 0V10M0.6 0.4V2.9C0.6 5.4 2 6.4 4.5 6.4S8.4 5.4 8.4 2.9V0.4' },
  Ω: { w: 10, d: 'M0.8 10H3.3C1.4 8.8 0.6 7 0.6 5C0.6 2 2.5 0 5 0S9.4 2 9.4 5C9.4 7 8.6 8.8 6.7 10H9.2' },
  Ϛ: { w: 7.4, d: 'M6.8 1.1C5.6 0.1 3.3 -0.1 2.1 0.7C0.6 1.7 0.9 3.7 2.6 4.4L5 5.4C6.9 6.2 7 8.8 5 9.7C3.8 10.3 2.3 10.1 1.3 9.4' },
  ʹ: { w: 2.6, d: 'M1.9 -0.6L1.1 2.2' },
  '·': { w: 3, d: 'M1.5 5V5.05' },
  '⁝': { w: 3, d: 'M1.5 1.6V1.65M1.5 5V5.05M1.5 8.4V8.45' },
  ' ': { w: 4.2, d: '' },
};

/** Map lower-case and accented forms onto the capitals we draw. */
const FOLD: Record<string, string> = {
  Ά: 'Α', Έ: 'Ε', Ή: 'Η', Ί: 'Ι', Ό: 'Ο', Ύ: 'Υ', Ώ: 'Ω', ς: 'Σ',
};

function glyphFor(ch: string): Glyph | undefined {
  const up = FOLD[ch] ?? ch.toLocaleUpperCase('el');
  return GLYPHS[FOLD[up] ?? up];
}

export interface GreekTextOptions {
  /** Cap height in user units. */
  size?: number;
  /** Extra space between letters, in glyph units (cap height = 10). */
  tracking?: number;
  /** Stroke width in glyph units. */
  weight?: number;
  align?: 'start' | 'middle' | 'end';
  /** Class added to every glyph path. */
  className?: string;
}

export interface GreekText {
  g: SVGGElement;
  width: number;
  height: number;
  paths: SVGPathElement[];
}

/** Lay out `text` as stroked glyph paths inside a <g>. Colour comes from `currentColor`. */
export function greekText(text: string, opts: GreekTextOptions = {}): GreekText {
  const size = opts.size ?? 10;
  const tracking = opts.tracking ?? 2.2;
  const weight = opts.weight ?? 1;
  const scale = size / 10;
  const inner = s('g', {
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': weight,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  });
  const paths: SVGPathElement[] = [];
  let x = 0;
  const chars = [...text];
  chars.forEach((ch, i) => {
    const gl = glyphFor(ch);
    if (!gl) return;
    if (gl.d) {
      const p = s('path', { d: gl.d, transform: `translate(${x.toFixed(2)} 0)`, pathLength: 1, class: opts.className });
      inner.appendChild(p);
      paths.push(p);
    }
    x += gl.w + (i < chars.length - 1 ? tracking : 0);
  });
  const width = x * scale;
  const dx = opts.align === 'middle' ? -width / 2 : opts.align === 'end' ? -width : 0;
  const g = s('g', { transform: `translate(${dx.toFixed(2)} ${(-size / 2).toFixed(2)}) scale(${scale})` });
  g.appendChild(inner);
  const outer = s('g', { class: 'greek-text', 'aria-hidden': 'true' });
  outer.appendChild(g);
  return { g: outer, width, height: size, paths };
}

/** A standalone inline <svg> holding Greek text — convenient inside HTML. */
export function greekSvg(text: string, opts: GreekTextOptions & { pad?: number } = {}): SVGSVGElement {
  const size = opts.size ?? 16;
  const pad = opts.pad ?? size * 0.25;
  const t = greekText(text, { ...opts, size, align: 'start' });
  const w = t.width + pad * 2;
  const hgt = size + pad * 2;
  const svg = s('svg', {
    class: 'greek',
    viewBox: `${-pad} ${-size / 2 - pad} ${w.toFixed(2)} ${hgt.toFixed(2)}`,
    width: w.toFixed(1),
    height: hgt.toFixed(1),
    role: 'img',
    'aria-label': text,
  });
  svg.appendChild(t.g);
  return svg;
}

const NUMERALS: Array<[number, string]> = [
  [100, 'Ρ'], [90, 'Ϙ'], [80, 'Π'], [70, 'Ο'], [60, 'Ξ'], [50, 'Ν'], [40, 'Μ'], [30, 'Λ'], [20, 'Κ'], [10, 'Ι'],
  [9, 'Θ'], [8, 'Η'], [7, 'Ζ'], [6, 'Ϛ'], [5, 'Ε'], [4, 'Δ'], [3, 'Γ'], [2, 'Β'], [1, 'Α'],
];

/** Greek alphabetic numeral with keraia, e.g. 16 → "ΙϚʹ". */
export function greekNumeral(n: number): string {
  let out = '';
  let rest = n;
  for (const [v, sym] of NUMERALS) {
    while (rest >= v) {
      out += sym;
      rest -= v;
    }
  }
  return out + 'ʹ';
}
