/**
 * The atlas projection.
 *
 * A simple equirectangular projection scaled for the latitude of the central
 * Mediterranean (37.5°N). Over the small area the Odyssey covers it keeps
 * coastlines recognisable while staying trivially invertible, and — because it
 * is plain arithmetic — it is shared by the browser and by the offline
 * coastline builder in `scripts/build-coastlines.mjs`.
 *
 * Units: 100 map units per degree of latitude (≈ 1.11 km per unit).
 */

export type LonLat = readonly [lon: number, lat: number];
export type Point = readonly [x: number, y: number];

const REF_LAT = 37.5;
const UNITS_PER_DEG = 100;
const K = Math.cos((REF_LAT * Math.PI) / 180);

/** The part of the world the camera may show. */
export const VIEW_BOUNDS = { lonMin: 7, lonMax: 30, latMin: 31.5, latMax: 43.5 } as const;

/** Coastline data extends past the view so no clipped edge is ever visible. */
export const DATA_BOUNDS = { lonMin: 3, lonMax: 34, latMin: 28.5, latMax: 46.5 } as const;

export const MAP_WIDTH = (VIEW_BOUNDS.lonMax - VIEW_BOUNDS.lonMin) * K * UNITS_PER_DEG;
export const MAP_HEIGHT = (VIEW_BOUNDS.latMax - VIEW_BOUNDS.latMin) * UNITS_PER_DEG;

/** Kilometres represented by one map unit (along a meridian). */
export const KM_PER_UNIT = 111.195 / UNITS_PER_DEG;

export function project(lon: number, lat: number): [number, number] {
  return [(lon - VIEW_BOUNDS.lonMin) * K * UNITS_PER_DEG, (VIEW_BOUNDS.latMax - lat) * UNITS_PER_DEG];
}

export function unproject(x: number, y: number): [number, number] {
  return [x / (K * UNITS_PER_DEG) + VIEW_BOUNDS.lonMin, VIEW_BOUNDS.latMax - y / UNITS_PER_DEG];
}

/** Great-circle distance in kilometres. */
export function haversineKm(a: LonLat, b: LonLat): number {
  const R = 6371.0088;
  const toRad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * toRad;
  const dLon = (b[0] - a[0]) * toRad;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * toRad) * Math.cos(b[1] * toRad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
