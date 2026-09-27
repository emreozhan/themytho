/**
 * Development page: draws every voyage leg of the Odyssey on the atlas and
 * reports any stretch that runs over land (sampled with isPointInFill).
 */
import '@fontsource/cinzel/600.css';
import '@fontsource/eb-garamond/400.css';
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/atlas.css';
import { Atlas } from '../map/atlas';
import { project, type LonLat } from '../map/projection';
import { LAND_PATH } from '../map/data/land';
import { s } from '../lib/dom';
import { odyssey } from '../stories/odyssey';

const atlas = new Atlas(document.getElementById('app')!);
const land = s('path', { d: LAND_PATH });
atlas.svg.appendChild(land);
land.style.fill = 'transparent';

const chs = odyssey.chapters;
const harbor = (i: number): LonLat => chs[i].harbor ?? chs[i].at;
const endOf = (i: number): LonLat => {
  const c = chs[i];
  if (c.end?.at) return c.end.at;
  const last = c.legs?.[c.legs.length - 1];
  return last?.to ?? harbor(i);
};
const lines: string[] = [];
const bad: string[] = [];
chs.forEach((c, i) => {
  atlas.reveal(c.id, c.at, 400, false);
  atlas.addMarker({ id: c.id, at: c.at, name: c.label ?? c.title, greek: c.greek, numeral: String(i + 1), side: c.labelSide });
  if (!c.marker) atlas.setMarker(c.id, 'visited');
  const legs: Array<[string, LonLat[], string | undefined]> = [];
  if (c.arrival) legs.push([`${c.id}/${c.arrival.id}`, [c.arrival.from ?? (i ? endOf(i - 1) : harbor(i)), ...(c.arrival.via ?? []), c.arrival.to ?? harbor(i)], c.arrival.style]);
  let cur = harbor(i);
  for (const l of c.legs ?? []) {
    const pts: LonLat[] = [l.from ?? cur, ...(l.via ?? []), l.to ?? harbor(i)];
    legs.push([`${c.id}/${l.id}`, pts, l.style]);
    cur = l.to ?? harbor(i);
  }
  for (const [id, pts, style] of legs) {
    const h = atlas.addLeg(id, pts, (style ?? 'sail') as never);
    h.set(1);
    const L = h.length;
    let overLand = 0;
    const where: string[] = [];
    // Skip the first/last few units: harbours hug the coast.
    for (let d = 6; d < L - 6; d += 2) {
      const p = h.path.getPointAtLength(d);
      if (land.isPointInFill(new DOMPoint(p.x, p.y))) {
        overLand++;
        if (where.length < 4) where.push(`${p.x.toFixed(0)},${p.y.toFixed(0)}`);
      }
    }
    const km = Math.round(L * 1.112);
    lines.push(`${id.padEnd(28)} ${String(km).padStart(5)} km  land-samples: ${overLand}`);
    if (overLand) bad.push(`${id}: ${overLand} samples on land near ${where.join(' | ')}`);
  }
  for (const [lon, lat] of [harbor(i)]) void lon, lat;
  const hp = project(...harbor(i));
  if (land.isPointInFill(new DOMPoint(hp[0], hp[1]))) bad.push(`${c.id}: harbour is on land`);
});
// ?focus=lon,lat,zoom frames a detail for inspection.
const focus = new URLSearchParams(location.search).get('focus');
if (focus) {
  const [lo, la, z] = focus.split(',').map(Number);
  atlas.camera.jump(atlas.camera.anchor(project(lo, la), atlas.camera.zoom(z || 6), [innerWidth / 2, innerHeight / 2]));
}
const r = document.getElementById('report')!;
r.textContent = (bad.length ? 'PROBLEMS\n' + bad.join('\n') + '\n\n' : 'All legs at sea.\n\n') + lines.join('\n');
(window as unknown as { __report: unknown }).__report = { bad, lines };
