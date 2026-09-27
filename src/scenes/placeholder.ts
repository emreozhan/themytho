/** A stand-in scene used while a chapter's real tondo is being painted. */
import { s } from '../lib/dom';
import { wait } from '../lib/motion';
import { greekText } from '../art/letters';
import { Figure, POSES, INK } from '../art/figure';
import type { SceneFactory } from '../story/types';

export const placeholder: SceneFactory = (ctx) => {
    const ch = ctx.chapter;
    const t = greekText(ch.greek, { size: 22, weight: 1.2, align: 'middle', tracking: 3 });
    t.g.setAttribute('transform', 'translate(0 -110)');
    t.g.style.color = INK;
    ctx.root.appendChild(t.g);
    ctx.root.appendChild(s('line', { x1: -150, y1: 60, x2: 150, y2: 60, stroke: INK, 'stroke-width': 2 }));
    const f = new Figure({ hat: 'pilos' }, POSES.stand(0, 60));
    ctx.root.appendChild(f.g);
    return {
      async beat(i) {
        const b = ch.beats[i];
        if (!b.gate) return wait(0.4);
        if (b.gate.kind === 'tap') {
          const dot = s('circle', { cx: 60, cy: -10, r: 16, fill: INK });
          ctx.root.appendChild(dot);
          await ctx.tap(dot, { label: b.gate.prompt });
          dot.remove();
        } else if (b.gate.kind === 'hold') {
          await ctx.hold({ label: 'Basılı tut', seconds: 1.5 });
        } else if (b.gate.kind === 'drag') {
          const dot = s('circle', { cx: -80, cy: 20, r: 16, fill: INK });
          ctx.root.appendChild(dot);
          await ctx.drag(dot, { label: b.gate.prompt, axis: 'x', distance: 160, onProgress: (p) => dot.setAttribute('cx', String(-80 + p * 160)) });
        } else {
          await ctx.choose([{ id: 'a', label: 'Seçenek' }]);
        }
      },
    };
};
