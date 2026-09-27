import { describe, expect, it } from 'vitest';
import { greekNumeral } from '../src/art/letters';

describe('greekNumeral', () => {
  it('writes alphabetic numerals with a keraia', () => {
    expect(greekNumeral(1)).toBe('Αʹ');
    expect(greekNumeral(6)).toBe('Ϛʹ');
    expect(greekNumeral(10)).toBe('Ιʹ');
    expect(greekNumeral(16)).toBe('ΙϚʹ');
    expect(greekNumeral(18)).toBe('ΙΗʹ');
  });
});
