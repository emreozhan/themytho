/**
 * Integrity checks for the Odyssey data: ids, beats, gates, chronology,
 * coordinates, and that every voyage leg can be resolved.
 */
import { describe, expect, it } from 'vitest';
import { odyssey } from '../src/stories/odyssey';
import { DATA_BOUNDS } from '../src/map/projection';

const inBounds = ([lon, lat]: readonly [number, number]) =>
  lon > DATA_BOUNDS.lonMin && lon < DATA_BOUNDS.lonMax && lat > DATA_BOUNDS.latMin && lat < DATA_BOUNDS.latMax;

describe('the Odyssey', () => {
  const chs = odyssey.chapters;

  it('has eighteen chapters with unique ids', () => {
    expect(chs).toHaveLength(18);
    expect(new Set(chs.map((c) => c.id)).size).toBe(chs.length);
  });

  it('gives every chapter beats, a scene and a known part', () => {
    const parts = new Set(odyssey.parts.map((p) => p.id));
    for (const c of chs) {
      expect(c.beats.length, c.id).toBeGreaterThan(0);
      expect(typeof c.scene, c.id).toBe('function');
      expect(parts.has(c.part), c.id).toBe(true);
      for (const b of c.beats) {
        expect(b.text.length, c.id).toBeGreaterThan(10);
        if (b.gate) expect(['tap', 'hold', 'drag', 'choice']).toContain(b.gate.kind);
        if (b.quote) expect(b.quote.greek && b.quote.tr && b.quote.ref, c.id).toBeTruthy();
      }
    }
  });

  it('never runs time backwards and ends in the twentieth year', () => {
    let year = odyssey.startYear;
    for (const c of chs) {
      expect(c.year, c.id).toBeGreaterThanOrEqual(year);
      year = c.end?.year ?? c.year;
    }
    expect(chs[chs.length - 1].year).toBe(odyssey.totalYears);
  });

  it('only loses ships', () => {
    let ships = odyssey.initialShips;
    for (const c of chs) {
      expect(c.ships, c.id).toBeLessThanOrEqual(ships);
      ships = c.end?.ships ?? c.ships;
    }
  });

  it('keeps every place and waypoint on the map', () => {
    for (const c of chs) {
      expect(inBounds(c.at), c.id).toBe(true);
      if (c.harbor) expect(inBounds(c.harbor), c.id).toBe(true);
      for (const leg of [c.arrival, ...(c.legs ?? [])]) {
        for (const p of leg?.via ?? []) expect(inBounds(p), `${c.id} ${leg?.id}`).toBe(true);
      }
    }
  });

  it('sails into every chapter after the first', () => {
    chs.slice(1).forEach((c) => expect(c.arrival, c.id).toBeTruthy());
  });

  it('points shared markers at an earlier chapter', () => {
    chs.forEach((c, i) => {
      if (!c.marker) return;
      const j = chs.findIndex((d) => d.id === c.marker);
      expect(j, c.id).toBeGreaterThanOrEqual(0);
      expect(j, c.id).toBeLessThan(i);
    });
  });
});
