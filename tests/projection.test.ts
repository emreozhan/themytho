import { describe, expect, it } from 'vitest';
import { haversineKm, MAP_HEIGHT, MAP_WIDTH, project, unproject, VIEW_BOUNDS } from '../src/map/projection';

describe('projection', () => {
  it('maps the view bounds onto the map rectangle', () => {
    expect(project(VIEW_BOUNDS.lonMin, VIEW_BOUNDS.latMax)).toEqual([0, 0]);
    const [x, y] = project(VIEW_BOUNDS.lonMax, VIEW_BOUNDS.latMin);
    expect(x).toBeCloseTo(MAP_WIDTH, 6);
    expect(y).toBeCloseTo(MAP_HEIGHT, 6);
  });

  it('round-trips through unproject', () => {
    for (const [lon, lat] of [[20.67, 38.4], [26.24, 39.96], [10.86, 33.8]] as const) {
      const [x, y] = project(lon, lat);
      const [lo, la] = unproject(x, y);
      expect(lo).toBeCloseTo(lon, 9);
      expect(la).toBeCloseTo(lat, 9);
    }
  });

  it('measures great-circle distances', () => {
    // Ithaca to Troy is roughly 500 km as the crow flies.
    const d = haversineKm([20.67, 38.4], [26.24, 39.96]);
    expect(d).toBeGreaterThan(480);
    expect(d).toBeLessThan(540);
  });
});
