import { describe, expect, it } from 'vitest';
import { smoothZoom } from '../src/map/camera';

describe('smoothZoom', () => {
  it('starts and ends at the given views', () => {
    const f = smoothZoom([0, 0, 100], [500, 200, 40]);
    const a = f(0);
    const b = f(1);
    expect(a[0]).toBeCloseTo(0, 6);
    expect(a[2]).toBeCloseTo(100, 6);
    expect(b[0]).toBeCloseTo(500, 4);
    expect(b[1]).toBeCloseTo(200, 4);
    expect(b[2]).toBeCloseTo(40, 4);
  });

  it('zooms out mid-flight on long moves', () => {
    const f = smoothZoom([0, 0, 50], [2000, 0, 50]);
    expect(f(0.5)[2]).toBeGreaterThan(50);
    expect(f.duration).toBeGreaterThan(0);
  });

  it('handles pure zooms', () => {
    const f = smoothZoom([10, 10, 100], [10, 10, 25]);
    expect(f(1)[2]).toBeCloseTo(25, 6);
    expect(f(0.5)[0]).toBeCloseTo(10, 6);
  });
});
