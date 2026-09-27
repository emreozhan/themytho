import { describe, expect, it } from 'vitest';
import { bounds, sampleSpline, smoothstep, stopAt } from '../src/lib/geometry';

describe('geometry helpers', () => {
  it('samples a spline through its control points', () => {
    const pts = sampleSpline([[0, 0], [10, 0], [20, 10]], 20);
    expect(pts[0]).toEqual([0, 0]);
    expect(pts[pts.length - 1][0]).toBeCloseTo(20, 6);
    expect(pts[pts.length - 1][1]).toBeCloseTo(10, 6);
  });

  it('interpolates width stops', () => {
    const s = [[0, 2], [0.5, 6], [1, 2]] as Array<[number, number]>;
    expect(stopAt(s, 0)).toBe(2);
    expect(stopAt(s, 0.25)).toBeCloseTo(4, 6);
    expect(stopAt(s, 1)).toBe(2);
  });

  it('computes bounds and smoothstep', () => {
    expect(bounds([[1, 2], [5, -3], [0, 4]])).toEqual({ x: 0, y: -3, w: 5, h: 7 });
    expect(smoothstep(0, 1, 0.5)).toBeCloseTo(0.5, 6);
    expect(smoothstep(0, 1, -1)).toBe(0);
  });
});
