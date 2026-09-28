/**
 * The atlas reads in Turkish and English: every piece of story text must exist
 * in both, with the same markup, and the Greek must be left as it is.
 */
import { describe, expect, it } from 'vitest';
import { odyssey } from '../src/stories/odyssey';

interface Pair {
  path: string;
  tr: string;
  en: string;
}

function pairs(v: unknown, path: string, out: Pair[] = []): Pair[] {
  if (!v || typeof v !== 'object') return out;
  const o = v as Record<string, unknown>;
  const keys = Object.keys(o);
  if (keys.length === 2 && typeof o.tr === 'string' && typeof o.en === 'string') {
    out.push({ path, tr: o.tr, en: o.en });
    return out;
  }
  for (const k of keys) pairs(o[k], `${path}.${k}`, out);
  return out;
}

const tags = (s: string) => (s.match(/<\/?[a-z]+>/g) ?? []).sort().join(' ');

describe('the English edition', () => {
  const all = pairs(odyssey, 'odyssey');

  it('translates every piece of story text', () => {
    expect(all.length).toBeGreaterThan(200);
    for (const p of all) {
      expect(p.tr.trim(), p.path).not.toBe('');
      expect(p.en.trim(), p.path).not.toBe('');
    }
  });

  it('keeps the same emphasis and markup', () => {
    for (const p of all) expect(tags(p.en), p.path).toBe(tags(p.tr));
  });

  it('leaves no Turkish behind', () => {
    for (const p of all) {
      // Turkish place names are fine where the English names the modern site.
      const en = p.en.replace(/Hisarlık|Çanakkale/g, '');
      expect(en, p.path).not.toMatch(/[çğıİöşüÇĞÖŞÜ]/);
      if (p.tr.length > 14) expect(p.en, p.path).not.toBe(p.tr);
    }
  });

  it('never translates the Greek', () => {
    for (const c of odyssey.chapters) {
      expect(c.greek, c.id).toMatch(/^[Α-Ω ·]+$/);
      for (const b of c.beats) if (b.quote) expect(b.quote.greek, c.id).toMatch(/[Ͱ-Ͽἀ-῿]/);
    }
  });
});
