/** Development-only art lab: renders art pieces in isolation for visual review. */
import '@fontsource/eb-garamond/400.css';
import '@fontsource/eb-garamond/400-italic.css';
import '@fontsource/cinzel/600.css';
import '@fontsource/cinzel/700.css';
import './styles/tokens.css';
import './styles/atlas.css';
import { Atlas } from './map/atlas';
import { s, h } from './lib/dom';
import { gsap } from './lib/motion';
import { greekText, greekNumeral } from './art/letters';
import { meanderRing, waveRing, dotRing, rosette, palmettePath, meanderStripPath, waveStripPath } from './art/ornaments';
import { ship, rowing, BLACK_FIGURE, RED_FIGURE } from './art/ship';

const lab = document.getElementById('lab')!;
const piece = new URLSearchParams(location.search).get('piece') ?? 'all';

function cell(title: string, w: number, hgt: number, vb: string, bg = '#1b1510'): SVGSVGElement {
  const svg = s('svg', { width: w, height: hgt, viewBox: vb });
  const wrap = h('div', { class: 'cell', style: `background:${bg}` }, [h('h4', {}, [title]), svg]);
  lab.appendChild(wrap);
  return svg;
}

const pieces: Record<string, () => void> = {
  letters() {
    const svg = cell('letters', 900, 260, '0 0 900 260');
    const rows = ['ΑΒΓΔΕΖΗΘΙΚΛΜ', 'ΝΞΟΠΡΣΤΥΦΧΨΩ', 'ΟΔΥΣΣΕΙΑ ⁝ ΙΘΑΚΗ', [1, 6, 9, 12, 16, 18].map(greekNumeral).join(' ')];
    rows.forEach((r, i) => {
      const t = greekText(r, { size: 36, weight: 1.1 });
      t.g.setAttribute('transform', `translate(20 ${40 + i * 62})`);
      t.g.style.color = '#efe2c6';
      svg.appendChild(t.g);
    });
  },
  ornaments() {
    const svg = cell('ornaments', 900, 420, '-210 -210 900 420');
    const g = s('g', { color: '#16100b' });
    g.appendChild(s('circle', { r: 200, fill: '#16100b' }));
    g.appendChild(s('circle', { r: 194, fill: '#c4662f' }));
    const m = meanderRing({ rOuter: 192, rInner: 170 });
    g.appendChild(m);
    g.appendChild(s('circle', { r: 166, fill: '#c4662f', stroke: '#16100b', 'stroke-width': 2 }));
    const w = waveRing({ rOuter: 160, rInner: 140 });
    g.appendChild(w);
    g.appendChild(dotRing(128, 60, 2.2, '#16100b'));
    g.appendChild(rosette(0, 0, 40, 8, '#16100b'));
    svg.appendChild(g);
    const g2 = s('g', { transform: 'translate(230 -180)' });
    g2.appendChild(s('rect', { width: 440, height: 360, fill: '#c4662f' }));
    g2.appendChild(s('path', { d: meanderStripPath(420, 26), transform: 'translate(10 10)', fill: 'none', stroke: '#16100b', 'stroke-width': 2.4 }));
    g2.appendChild(s('path', { d: waveStripPath(420, 24), transform: 'translate(10 60)', fill: '#16100b' }));
    g2.appendChild(s('path', { d: palmettePath(80), transform: 'translate(80 200)', fill: '#16100b' }));
    g2.appendChild(s('path', { d: palmettePath(80, 9), transform: 'translate(220 200)', fill: '#16100b' }));
    svg.appendChild(g2);
  },
  ship() {
    const a = cell('ship black-figure', 440, 240, '-60 -60 120 80', '#c4662f');
    const p = ship({ palette: BLACK_FIGURE, crew: 7 });
    a.appendChild(p.g);
    rowing(p.oars, gsap);
    const b = cell('ship red-figure', 440, 240, '-60 -60 120 80', '#14100c');
    b.appendChild(ship({ palette: RED_FIGURE }).g);
    const c = cell('ship icon', 220, 140, '-60 -60 120 80', '#14100c');
    c.appendChild(ship({ palette: RED_FIGURE, icon: true }).g);
    const d = cell('ship torn/furled', 440, 240, '-60 -60 240 80', '#c4662f');
    d.appendChild(ship({ palette: BLACK_FIGURE, sail: 'torn' }).g);
    const f = ship({ palette: BLACK_FIGURE, sail: 'furled' }).g;
    f.setAttribute('transform', 'translate(115 0)');
    d.appendChild(f);
  },
};


import { Figure, POSES, pose, shield, spear } from './art/figure';

pieces.figures = () => {
  const svg = cell('figures', 2600, 660, '-20 -125 1300 150', '#c4662f');
  svg.appendChild(s('line', { x1: -20, y1: 0, x2: 1280, y2: 0, stroke: '#16100b', 'stroke-width': 1 }));
  const specs: Array<[string, ConstructorParameters<typeof Figure>[0], ReturnType<typeof pose>]> = [
    ['stand', { hat: 'pilos' }, POSES.stand(30)],
    ['walk', { head: 'youth', garment: 'short' }, POSES.walk(110)],
    ['run', { garment: 'none', hat: 'helmet' }, POSES.run(200)],
    ['knielauf', { head: 'youth', garment: 'short', wingedFeet: true, hat: 'petasos' }, POSES.knielauf(290)],
    ['lunge', { hat: 'helmet', garment: 'short' }, POSES.lunge(390)],
    ['woman', { head: 'woman', garment: 'peplos', hat: 'diadem' }, POSES.stand(490)],
    ['woman walk', { head: 'woman', garment: 'peplos', hat: 'veil' }, POSES.walk(570)],
    ['sit', { head: 'old', garment: 'long', hat: 'wreath' }, POSES.sit(660)],
    ['row', { garment: 'short', hat: 'pilos' }, POSES.row(760)],
    ['lament', { head: 'woman', garment: 'long' }, POSES.lament(850)],
    ['plead', { head: 'bearded', garment: 'rags', hat: 'pilos' }, POSES.plead(940)],
    ['cyclops', { head: 'cyclops', garment: 'none', scale: 1.1 }, POSES.stand(1050)],
    ['fallen', { garment: 'short' }, POSES.fallen(1170)],
  ];
  for (const [label, style, p] of specs) {
    const f = new Figure(style, p);
    svg.appendChild(f.g);
    const t = s('text', { x: p.x, y: 18, 'font-size': 8, fill: '#16100b', 'text-anchor': 'middle' });
    t.textContent = label;
    svg.appendChild(t);
  }
  svg.appendChild(shield([404, -62], 13, 'star'));
  svg.appendChild(spear([370, -40], [450, -90]));
};

pieces.bigfig = () => {
  const svg = cell('big', 600, 600, '-60 -110 120 120', '#c4662f');
  const f = new Figure({ hat: 'pilos', garment: 'short' }, POSES.walk(0));
  svg.appendChild(f.g);
  const svg2 = cell('big woman', 600, 600, '-60 -110 120 120', '#c4662f');
  svg2.appendChild(new Figure({ head: 'woman', garment: 'peplos', hat: 'diadem' }, POSES.walk(0)).g);
};

pieces.atlas = () => {
  document.body.style.overflow = 'hidden';
  const a = new Atlas(document.body);
  (window as any).atlas = a;
  a.reveal('known', [23.6, 38.9], 380, false);
  a.reveal('ithaca', [20.68, 38.42], 170, false);
  a.addMarker({ id: 'ithaka', at: [20.68, 38.42], name: 'İthaka', greek: 'ΙΘΑΚΗ', numeral: 'Αʹ' });
  a.addMarker({ id: 'troya', at: [26.24, 39.96], name: 'Troya', greek: 'ΤΡΟΙΗ', numeral: 'Γʹ' });
  a.setMarker('ithaka', 'visited');
  a.setMarker('troya', 'active');
  const leg = a.addLeg('l1', [[20.68, 38.42], [20.9, 37.6], [22.0, 36.6], [23.3, 36.3], [24.2, 37.3], [24.6, 38.4], [25.4, 39.3], [26.1, 39.9]]);
  leg.set(1);
  a.fleet.anchor(a.markerPoint('troya')!, -30);
};

pieces.perf = () => {
  document.body.style.overflow = 'hidden';
  const a = new Atlas(document.body);
  (window as any).atlas = a;
  a.reveal('known', [23.6, 38.9], 380, false);
  a.addLeg('l1', [[20.68, 38.42], [20.9, 37.6], [22.0, 36.6], [23.3, 36.3], [24.2, 37.3]]).set(1);
  (window as any).perfRun = async (hide: string[]) => {
    for (const sel of ['.land', '.coast', '.relief']) (a.svg.querySelector(sel) as SVGElement).style.display = hide.includes(sel) ? 'none' : '';
    const coast = a.svg.querySelector('.coast') as SVGPathElement;
    if (hide.includes('nse')) coast.style.vectorEffect = 'none';
    if (hide.includes('bevel')) coast.style.strokeLinejoin = 'bevel';
    if (hide.includes('miter')) coast.style.strokeLinejoin = 'miter';
    if (hide.includes('speed')) coast.style.shapeRendering = 'optimizeSpeed';

    for (const sel of ['.layer--sea', '.layer--ripples', '.layer--land', '.layer--labels', '.layer--decor', '.layer--fog', '.layer--routes', '.layer--markers', '.layer--fleet'])
      (a.svg.querySelector(sel) as SVGElement).style.display = hide.includes(sel) ? 'none' : '';
    const frames: number[] = [];
    let last = performance.now();
    let on = true;
    const loop = (tt: number) => { frames.push(tt - last); last = tt; if (on) requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    const cam = a.camera;
    await cam.fly(cam.anchor([1100, 560], cam.zoom(4), [700, 450]), { duration: 1.5 });
    await cam.fly(cam.anchor([400, 600], cam.zoom(2), [700, 450]), { duration: 1.5 });
    on = false;
    const f = frames.slice(3);
    return (f.reduce((x, y) => x + y, 0) / f.length).toFixed(1);
  };
};

queueMicrotask(() => {
  if (piece === 'all') Object.values(pieces).forEach((f) => f());
  else piece.split(',').forEach((p) => pieces[p]?.());
});

import { Beast, bird } from './art/animals';
import * as kit from './art/kit';

pieces.animals = () => {
  const svg = cell('animals', 1300, 300, '-10 -70 650 150', '#c4662f');
  const kinds = ['ox', 'ram', 'sheep', 'pig', 'dog', 'donkey'] as const;
  kinds.forEach((k, i) => {
    const b = new Beast(k, { x: 50 + i * 100, y: 40 });
    svg.appendChild(b.g);
    b.walk(0.6);
  });
  svg.appendChild(bird(620, 30));
};

pieces.kit = () => {
  const mk = (title: string) => {
    const svg = cell(title, 420, 420, '-200 -200 400 400', '#c4662f');
    svg.appendChild(s('circle', { r: 199, fill: 'none', stroke: '#16100b', 'stroke-width': 2 }));
    return svg;
  };
  const a = mk('sea, sun, cloud, ship');
  a.appendChild(kit.sun(90, -110, 16));
  a.appendChild(kit.cloud(-60, -100, 110));
  a.appendChild(kit.sea(60).g);
  a.appendChild(kit.oliveTree(-120, 60, 0.9));
  const b = mk('cave, amphora, flames');
  const c = kit.cave(0, 30, 230, 200);
  b.appendChild(c.g);
  b.appendChild(kit.amphora(-50, 110, 1.2));
  b.appendChild(kit.amphora(-20, 110, 1));
  b.appendChild(kit.flames(40, 110, 1.4));
  b.appendChild(kit.exergue(110));
  const d = mk('walls, column, torch, stars');
  d.appendChild(kit.nightVeil(0.4));
  d.appendChild(kit.stars(30, { x: -170, y: -170, w: 340, h: 90 }));
  d.appendChild(kit.moon(100, -120));
  const w = kit.cityWall(60, { gate: 0, towers: [-110, 110], height: 80 });
  d.appendChild(w.g);
  d.appendChild(kit.torch(-60, 100).g);
  d.appendChild(kit.cypress(150, 60, 110));
  const e = mk('cliff, rock, bolt, splash, vine, inscription');
  e.appendChild(kit.cliff('left'));
  e.appendChild(kit.sea(80).g);
  e.appendChild(kit.thunderbolt(90));
  e.appendChild(kit.lightning([60, -170], [100, 60]));
  e.appendChild(kit.splash(40, 90, 1.2));
  e.appendChild(kit.vine([[20, -150], [60, -130], [100, -140], [140, -120]]));
  e.appendChild(kit.inscription('ΟΔΥΣΣΕΥΣ', 60, -60, { size: 9, angle: 90 }));
  e.appendChild(kit.fillers([[120, -40], [150, 0]], 6));
  e.appendChild(kit.column(-20, 60, 100));
};
