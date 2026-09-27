/**
 * The Wooden Horse (δουρεῖος ἵππος), drawn as an archaic painter would: a
 * long-bodied horse with thin posts for legs, an arched planked neck with a
 * stiff purple mane, a small head with a ringed eye, a long tail — all glaze
 * black, the carpentry scratched in: plank seams, wood grain, pegs. It stands
 * on a wheeled platform and has a hatch in its flank.
 *
 * Local frame: facing +x, wheels touch y = 0, about 200 units long and tall.
 * Animatable parts are separate groups (wheels, hatch door, tail, head).
 */
import { s, r1 } from '../lib/dom';
import { rng, range } from '../lib/random';
import { ribbon, smoothPath, type Vec } from '../lib/geometry';
import { INK, CLAY, WHITE, PURPLE } from '../art/figure';

export interface Horse {
  g: SVGGElement;
  wheels: SVGGElement[];
  /** Rotate the wheels (degrees). */
  roll(deg: number): void;
  tail: SVGGElement;
  head: SVGGElement;
  hatch: {
    /** Group holding figures seen inside the open hatch (clipped to it). */
    inside: SVGGElement;
    door: SVGGElement;
    x0: number;
    y0: number;
    w: number;
    h: number;
    /** 0 = shut, 1 = swung open against the flank. */
    open(p: number): void;
  };
  /** Useful anchor points (local frame). */
  at: { ring: Vec; sill: Vec; hatch: Vec; chest: Vec; rump: Vec; back: Vec; muzzle: Vec };
}

const WHEEL_R = 12.5;
const DECK_TOP = -32;

const inc = (d: string, w = 0.75, op = 0.8): SVGPathElement =>
  s('path', { d, fill: 'none', stroke: CLAY, 'stroke-width': w, opacity: op, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });

function wheel(cx: number, cy: number): SVGGElement {
  const g = s('g', { class: 'horse__wheel' });
  const rot = s('g');
  rot.appendChild(s('circle', { cx: 0, cy: 0, r: WHEEL_R, fill: INK }));
  rot.appendChild(s('circle', { cx: 0, cy: 0, r: WHEEL_R - 2.6, fill: 'none', stroke: CLAY, 'stroke-width': 0.8 }));
  let spokes = '';
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    spokes += `M${r1(Math.cos(a) * 2.6)} ${r1(Math.sin(a) * 2.6)}L${r1(Math.cos(a) * (WHEEL_R - 2.6))} ${r1(Math.sin(a) * (WHEEL_R - 2.6))}`;
  }
  rot.appendChild(s('path', { d: spokes, stroke: CLAY, 'stroke-width': 1.3, 'stroke-linecap': 'round' }));
  rot.appendChild(s('circle', { cx: 0, cy: 0, r: 2.4, fill: CLAY }));
  rot.appendChild(s('circle', { cx: 0, cy: 0, r: 1, fill: INK }));
  g.setAttribute('transform', `translate(${cx} ${cy})`);
  g.appendChild(rot);
  return g;
}

/** A wooden leg: a tapering post with a hoof block, grain and a pegged joint. */
function legPath(pts: Vec[], widths: Array<[number, number]>): string {
  return ribbon(pts, widths, 40, false);
}

export function woodenHorse(defs: SVGDefsElement, id: string): Horse {
  const g = s('g', { class: 'wooden-horse' });
  const rand = rng(7);

  /* ---- Far legs (behind the body) ---- */
  const farHind = legPath([[-34, -100], [-38, -80], [-41, -62], [-38, -44], [-37, DECK_TOP]], [[0, 18], [0.3, 12], [0.45, 9], [0.8, 7.4], [1, 8]]);
  const farFore = legPath([[44, -98], [45, -76], [45, -60], [46, -44], [47, DECK_TOP]], [[0, 15], [0.3, 10], [0.45, 8.4], [0.8, 7], [1, 8]]);
  g.appendChild(s('path', { d: farHind + farFore, fill: INK, stroke: CLAY, 'stroke-width': 1.1, 'paint-order': 'stroke' }));
  // Hooves (far).
  g.appendChild(s('path', { d: `M${-43} ${DECK_TOP}l1.2 -7h9.4l1.2 7ZM${41} ${DECK_TOP}l1.2 -7h9.4l1.2 7Z`, fill: INK, stroke: CLAY, 'stroke-width': 0.8, 'paint-order': 'stroke' }));

  /* ---- Tail ---- */
  const tail = s('g', { class: 'horse__tail' });
  const tailPts: Vec[] = [[-68, -128], [-82, -122], [-90, -102], [-87, -80], [-91, -60], [-88, -48]];
  tail.appendChild(s('path', { d: ribbon(tailPts, [[0, 12], [0.25, 10], [0.6, 7.6], [0.9, 5.4], [1, 2.4]], 48), fill: INK }));
  let strands = '';
  for (const off of [-1.6, 0, 1.6]) {
    const pts = tailPts.slice(1).map(([x, y], i): Vec => [x + off * (1 - i * 0.12), y]);
    strands += smoothPath(pts);
  }
  tail.appendChild(inc(strands, 0.55, 0.75));
  tail.appendChild(s('path', { d: 'M-75 -131l3 9M-71 -132.5l3 9', stroke: PURPLE, 'stroke-width': 2.4 }));

  /* ---- Body (barrel) ---- */
  const bodyPts: Vec[] = [
    [-60, -136], [-40, -142], [-12, -136], [14, -140], [42, -132], [56, -114], [51, -96],
    [28, -88], [0, -86], [-28, -88], [-48, -94], [-64, -106], [-71, -122],
  ];
  const body = s('path', { d: smoothPath(bodyPts, true, 0.42), fill: INK });

  /* ---- Neck and head ---- */
  const neckG = s('g', { class: 'horse__neck' });
  const neckPts: Vec[] = [[6, -134], [20, -154], [36, -174], [54, -192], [66, -198], [82, -188], [76, -168], [66, -142], [58, -118], [50, -104], [30, -116]];
  const neck = s('path', { d: smoothPath(neckPts, true, 0.4), fill: INK });
  const head = s('g', { class: 'horse__head' });
  const headPts: Vec[] = [[58, -196], [70, -204], [82, -198], [96, -180], [110, -164], [111, -155], [103, -150], [92, -152], [82, -158], [74, -168], [64, -182]];
  head.appendChild(s('path', { d: smoothPath(headPts, true, 0.36), fill: INK }));
  // Ears and forelock.
  head.appendChild(s('path', { d: 'M61 -198L57 -216L68 -201ZM67 -200L67 -215L74 -200Z', fill: INK }));
  head.appendChild(s('path', { d: 'M69 -203Q78 -209 83 -200Q78 -203 73 -198Z', fill: PURPLE }));
  // Ringed eye, nostril, mouth.
  head.appendChild(s('circle', { cx: 80, cy: -186, r: 3.8, fill: 'none', stroke: CLAY, 'stroke-width': 1 }));
  head.appendChild(s('circle', { cx: 80, cy: -186, r: 1.4, fill: CLAY }));
  head.appendChild(inc('M105 -161q-2.8 -1.1 -2.6 2M111 -155.6L100 -154.2M74 -192.4q5.4 -3.4 10 1.1', 0.75, 0.9));
  // Bridle: purple straps with white studs.
  head.appendChild(s('path', { d: 'M94 -174L101 -155M70 -180Q82 -174 95 -173', fill: 'none', stroke: PURPLE, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
  let studs = '';
  for (const [x, y] of [[96.6, -168], [99, -161.5], [77, -177], [85, -174.5]]) studs += `M${x} ${y}h0.01`;
  head.appendChild(s('path', { d: studs, stroke: WHITE, 'stroke-width': 1.4, 'stroke-linecap': 'round' }));

  // The mane: a stiff crest of purple locks along the neck, incised in black.
  const crest: Vec[] = [[12, -137], [24, -156], [40, -176], [55, -192], [63, -199]];
  const out: Vec[] = crest.map(([x, y], i) => [x - 6.5 + i * 0.5, y - 6 + i * 0.3]);
  const maneD = smoothPath([...crest, ...[...out].reverse()], true, 0.3);
  let locks = '';
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const k = Math.min(crest.length - 2, Math.floor(t * (crest.length - 1)));
    const f = t * (crest.length - 1) - k;
    const a: Vec = [crest[k][0] + (crest[k + 1][0] - crest[k][0]) * f, crest[k][1] + (crest[k + 1][1] - crest[k][1]) * f];
    const b: Vec = [a[0] - 8.6, a[1] - 6.6];
    locks += `M${r1(a[0] + 0.6)} ${r1(a[1] + 0.6)}L${r1(b[0])} ${r1(b[1])}`;
  }
  const mane = s('g', { class: 'horse__mane' });
  mane.appendChild(s('path', { d: maneD, fill: PURPLE }));
  mane.appendChild(s('path', { d: locks, stroke: PURPLE, 'stroke-width': 2.6, 'stroke-linecap': 'round' }));
  mane.appendChild(s('path', { d: locks, stroke: INK, 'stroke-width': 0.5, opacity: 0.8 }));
  neckG.append(mane, neck, head);

  /* ---- Carpentry incised on body and neck ---- */
  let seams = '';
  // Plank seams following the barrel.
  for (const t of [0.22, 0.44, 0.66, 0.86]) {
    const y0 = -138 + t * 50;
    seams += `M${r1(-66 + t * 6)} ${r1(y0 + 2)}C-30 ${r1(y0 - 4)} 22 ${r1(y0 - 3)} ${r1(54 - Math.abs(t - 0.5) * 10)} ${r1(y0 + 1)}`;
  }
  // Staggered butt joints with pegs.
  let pegs = '';
  const joints: Array<[number, number, number]> = [
    [-48, -136, -128], [-4, -135, -128], [36, -132, -127],
    [-30, -126, -117], [16, -126, -117],
    [-56, -115, -106], [-12, -115, -106], [32, -115, -106],
    [-38, -104, -96], [6, -104, -96], [44, -104, -97],
    [-20, -94, -88], [24, -94, -89],
  ];
  for (const [x, y0, y1] of joints) {
    seams += `M${x} ${y0}L${x + 0.6} ${y1}`;
    pegs += `M${x - 2.4} ${y0 + 2.4}h0.01M${x + 2.8} ${y1 - 2.4}h0.01`;
  }
  // Wood grain: fine wavy strokes.
  let grain = '';
  for (let i = 0; i < 30; i++) {
    const x = range(rand, -60, 38), y = range(rand, -134, -92), L = range(rand, 8, 16);
    grain += `M${r1(x)} ${r1(y)}q${r1(L / 4)} -1.4 ${r1(L / 2)} 0t${r1(L / 2)} 0`;
  }
  // Neck planks and joints.
  seams += 'M20 -136C32 -156 46 -176 62 -192M34 -126C44 -148 58 -168 72 -184M46 -112C54 -132 62 -152 76 -170';
  seams += 'M28 -146l8 5M50 -168l8 5M40 -128l9 4M60 -154l8 4M48 -140l8 3';
  grain += 'M26 -140q4 -6 8 -10M52 -172q3 -5 7 -8M46 -140q3 -5 6 -9M62 -170q3 -4 6 -7';
  const carpentry = s('g', { class: 'horse__carpentry' });
  carpentry.appendChild(inc(seams, 0.8, 0.85));
  carpentry.appendChild(inc(grain, 0.5, 0.5));
  carpentry.appendChild(s('path', { d: pegs, stroke: CLAY, 'stroke-width': 1.3, 'stroke-linecap': 'round', opacity: 0.9 }));
  // Peytral: a purple breast band with white bosses — dressed as an offering to Athena.
  const peytral = s('g', { class: 'horse__peytral' });
  peytral.appendChild(s('path', { d: 'M40 -134C52 -124 57 -112 54 -98', fill: 'none', stroke: PURPLE, 'stroke-width': 3.8, 'stroke-linecap': 'round' }));
  let bosses = '';
  for (const [x, y] of [[44, -130], [49.5, -122.5], [53.6, -113], [54.6, -104]]) bosses += `M${x} ${y}h0.01`;
  peytral.appendChild(s('path', { d: bosses, stroke: WHITE, 'stroke-width': 1.6, 'stroke-linecap': 'round' }));
  let tassels = '';
  for (const [x, y] of [[47, -126.5], [52, -118], [54.4, -108.5]]) tassels += `M${x} ${y}l1.6 5.8`;
  peytral.appendChild(s('path', { d: tassels, stroke: PURPLE, 'stroke-width': 1.1, 'stroke-linecap': 'round' }));

  /* ---- Hatch in the flank ---- */
  const hx0 = -24, hy0 = -130, hw = 28, hh = 25;
  const clipId = `${id}-hatch`;
  const clip = s('clipPath', { id: clipId, 'data-scene': '' });
  clip.appendChild(s('rect', { x: hx0, y: hy0, width: hw, height: hh }));
  defs.appendChild(clip);
  const hole = s('rect', { x: hx0, y: hy0, width: hw, height: hh, fill: CLAY });
  const inside = s('g', { class: 'horse__inside', 'clip-path': `url(#${clipId})` });
  // A dark floor line inside, so the opening reads as a hollow.
  inside.appendChild(s('rect', { x: hx0, y: hy0 + hh - 3, width: hw, height: 3, fill: INK, opacity: 0.35 }));
  const door = s('g', { class: 'horse__door' });
  door.appendChild(s('rect', { x: hx0, y: hy0, width: hw, height: hh, fill: INK, stroke: CLAY, 'stroke-width': 0.9 }));
  door.appendChild(inc(`M${hx0 + hw / 3} ${hy0 + 1}V${hy0 + hh - 1}M${hx0 + (2 * hw) / 3} ${hy0 + 1}V${hy0 + hh - 1}`, 0.55, 0.7));
  door.appendChild(s('path', { d: `M${hx0} ${hy0 + 5}h${hw * 0.7}M${hx0} ${hy0 + hh - 5}h${hw * 0.7}`, stroke: PURPLE, 'stroke-width': 2 }));
  door.appendChild(s('circle', { cx: hx0 + hw - 4.4, cy: hy0 + hh / 2, r: 2, fill: 'none', stroke: WHITE, 'stroke-width': 0.9 }));
  const hatchFrame = inc(`M${hx0 - 1.6} ${hy0 - 1.6}h${hw + 3.2}v${hh + 3.2}h${-hw - 3.2}Z`, 0.7, 0.9);

  /* ---- Near legs ---- */
  const nearHind = legPath([[-46, -108], [-50, -84], [-53, -64], [-49, -44], [-48, DECK_TOP]], [[0, 24], [0.3, 15], [0.45, 10], [0.8, 8.2], [1, 9]]);
  const nearFore = legPath([[34, -106], [34, -80], [34, -62], [35, -44], [36, DECK_TOP]], [[0, 19], [0.3, 12], [0.45, 9.4], [0.8, 7.8], [1, 8.8]]);
  const legs = s('g', { class: 'horse__legs' });
  legs.appendChild(s('path', { d: nearHind + nearFore, fill: INK, stroke: CLAY, 'stroke-width': 1.1, 'paint-order': 'stroke' }));
  legs.appendChild(s('path', { d: `M${-54.5} ${DECK_TOP}l1.2 -7.6h11l1.2 7.6ZM${29.5} ${DECK_TOP}l1.2 -7.6h11l1.2 7.6Z`, fill: INK, stroke: CLAY, 'stroke-width': 0.9, 'paint-order': 'stroke' }));
  // Joints (pegged rings at hock and knee) and grain along the posts.
  legs.appendChild(inc('M-58.4 -66h10.6M-57.8 -62.6h10.4M28.6 -64h10.8M28.8 -60.6h10.6M-54.6 -39.6h12.4M29.8 -39.6h12.4', 0.7, 0.85));
  legs.appendChild(s('path', { d: 'M-53 -64.4h0.01M33.6 -62.4h0.01', stroke: CLAY, 'stroke-width': 1.6, 'stroke-linecap': 'round' }));
  legs.appendChild(inc('M-47 -98Q-49 -82 -50 -70M-52 -98Q-54 -82 -55 -71M-50.5 -58Q-49.5 -50 -48.5 -44M32 -96V-70M36.5 -96V-70M35 -56V-44', 0.5, 0.55));

  /* ---- Platform and wheels ---- */
  const deck = s('g', { class: 'horse__deck' });
  deck.appendChild(s('path', { d: `M-80 ${DECK_TOP}H76Q80 ${DECK_TOP} 80 ${DECK_TOP + 4}V${DECK_TOP + 6}Q80 ${DECK_TOP + 10} 76 ${DECK_TOP + 10}H-80Q-84 ${DECK_TOP + 10} -84 ${DECK_TOP + 6}V${DECK_TOP + 4}Q-84 ${DECK_TOP} -80 ${DECK_TOP}Z`, fill: INK }));
  let deckInc = `M-82 ${DECK_TOP + 5}H78`;
  for (const x of [-60, -28, 4, 36, 62]) deckInc += `M${x} ${DECK_TOP + 1}v8`;
  deck.appendChild(inc(deckInc, 0.7, 0.8));
  // A running band of white dots along the deck (a painted offering-cart).
  let dots = '';
  for (let x = -76; x <= 72; x += 8) dots += `M${x + 4} ${DECK_TOP + 2.5}h0.01`;
  deck.appendChild(s('path', { d: dots, stroke: WHITE, 'stroke-width': 1.2, 'stroke-linecap': 'round', opacity: 0.9 }));
  const ring: Vec = [83, DECK_TOP + 5];
  deck.appendChild(s('circle', { cx: ring[0], cy: ring[1], r: 2.8, fill: 'none', stroke: INK, 'stroke-width': 1.4 }));
  const wheels = [wheel(-56, -WHEEL_R), wheel(52, -WHEEL_R)];

  g.append(tail, body, neckG, carpentry, peytral, hole, inside, door, hatchFrame, legs, deck, ...wheels);

  const roll = (deg: number) => {
    for (const w of wheels) (w.firstChild as SVGGElement).setAttribute('transform', `rotate(${r1(deg)})`);
  };
  const open = (p: number) => {
    const k = 1 - 1.86 * p;
    door.setAttribute('transform', p <= 0 ? '' : `translate(${hx0} 0) scale(${k.toFixed(3)} 1) translate(${-hx0} 0)`);
  };

  return {
    g,
    wheels,
    roll,
    tail,
    head: neckG,
    hatch: { inside, door, x0: hx0, y0: hy0, w: hw, h: hh, open },
    at: {
      ring,
      sill: [hx0 + hw / 2, hy0 + hh],
      hatch: [hx0 + hw / 2, hy0 + hh / 2],
      chest: [54, -110],
      rump: [-70, -118],
      back: [-12, -137],
      muzzle: [111, -158],
    },
  };
}
