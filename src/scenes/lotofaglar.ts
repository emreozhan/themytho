import { s } from '../lib/dom';
import { pose, POSES, INK } from '../art/figure';
import { exergue } from '../art/kit';
import type { SceneFactory } from '../story/types';
import { lotusPlant, datePalm, fruitBasket, fruitSprig, kerykeion } from './lotofaglar.art';
import { Actor } from './kyklop.rig';

// Temporary art sheet.
export const scene: SceneFactory = (ctx) => {
  const root = ctx.root;
  root.appendChild(exergue(200));
  root.appendChild(datePalm(-110, 40, 150).g);
  root.appendChild(lotusPlant(-50, 40, 86, 3).g);
  root.appendChild(lotusPlant(10, 40, 64, 5, -1).g);
  const b = fruitBasket(1.2);
  b.setAttribute('transform', 'translate(60 -40) scale(1.2)');
  root.appendChild(b);
  const sp = fruitSprig(1.4);
  sp.setAttribute('transform', 'translate(90 -40) scale(1.4)');
  root.appendChild(sp);
  const k = kerykeion(46);
  k.setAttribute('transform', 'translate(120 -40)');
  root.appendChild(k);
  const poses: Array<[string, ConstructorParameters<typeof Actor>[0], ReturnType<typeof pose>]> = [
    ['recline', { garment: 'short' }, pose({ x: 0, y: -12, lean: -64, head: -24, armF: [120, 100], armB: [-128, 88], legF: [84, 12], legB: [74, 30], footF: 10 })],
    ['resist', { garment: 'short' }, pose({ x: 0, y: -22, lean: -34, head: -16, armF: [96, -6], armB: [-150, 30], legF: [66, 26], legB: [56, 50], footF: 20, footB: 10, grip: 0 })],
    ['drag', { garment: 'short', head: 'youth' }, pose({ ...POSES.walk(0, 0), lean: 20, armB: [-70, 10], armF: [30, 20] })],
    ['woman', { head: 'woman', garment: 'peplos', hat: 'veil' }, pose({ ...POSES.stand(0, 0), armF: [80, 30], armB: [70, 40] })],
    ['elder', { head: 'old', garment: 'long', garmentColor: PURPLE_, hat: 'wreath' }, pose({ ...POSES.stand(0, 0), lean: 6, armF: [84, 12], armB: [10, 30] })],
    ['bound', { garment: 'short' }, pose({ ...POSES.sit(0, 0), lean: 14, head: 30, armF: [-40, 60], armB: [-50, 60] })],
  ];
  poses.forEach(([name, style, p], i) => {
    const a = new Actor(style, p, -100 + i * 40, 128, 0.62);
    root.appendChild(a.g);
    const t = s('text', { x: -100 + i * 40, y: 138, 'font-size': 7, 'text-anchor': 'middle', fill: INK });
    t.textContent = name;
    root.appendChild(t);
  });
  return { beat() {} };
};
const PURPLE_ = '#7e2e26';
