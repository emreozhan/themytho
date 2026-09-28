/**
 * Development page: runs ONE chapter in the real app (map, tondo, panel),
 * so a scene can be built and tested in isolation from the others.
 *
 *   /scene.html?ch=kyklop            → open the chapter
 *   /scene.html?ch=kyklop&beat=3     → fast-forward to beat 3 (gates auto-complete)
 *
 * window.__lab exposes helpers for automated screenshots:
 *   __lab.next()            continue (like the Devam button)
 *   __lab.complete()        resolve the waiting tap/drag gate (Enter fallback)
 *   __lab.hold(ms)          press-and-hold the hold gate for ms
 *   __lab.choose(label)     click the choice whose text contains label
 *   __lab.state()           { index, beat, busy, nextEnabled }
 */
import '../styles/fonts';
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/atlas.css';
import '../styles/ui.css';
import '../styles/screens.css';
import '../styles/scenes.css';

import { meanderTileURI } from '../art/ornaments';
import { App } from '../app';
import type { Chapter, Story } from '../story/types';
import { odyssey } from '../stories/odyssey';

const params = new URLSearchParams(location.search);
const id = params.get('ch') ?? 'ithaka';
const targetBeat = Number(params.get('beat') ?? '0');

document.documentElement.style.setProperty('--meander-gold', meanderTileURI('#e0ad55', 30, 2.2));
document.documentElement.style.setProperty('--meander-clay', meanderTileURI('#c4662f', 12, 1.3));

const modules = import.meta.glob('../stories/odyssey/chapters/*.ts');
const entry = Object.entries(modules).find(([p]) => p.endsWith(`-${id}.ts`));
if (!entry) throw new Error(`No chapter file for "${id}"`);

const mod = (await entry[1]()) as Record<string, Chapter>;
const chapter = Object.values(mod)[0];
const story: Story = {
  id: 'lab',
  title: { tr: 'Sahne Laboratuvarı', en: 'Scene Lab' },
  greekTitle: 'ΜΥΘΟΙ',
  subtitle: chapter.title,
  parts: odyssey.parts,
  chapters: [{ ...chapter, marker: undefined, arrival: undefined }],
  startYear: chapter.year,
  totalYears: 20,
  initialShips: chapter.ships || 1,
  known: [{ at: chapter.at, r: 400 }],
};
location.hash = `#/lab/${chapter.id}`;
await document.fonts.ready;
const app = new App(document.getElementById('app')!, story);
const engine = app.engine;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const lab = {
  next: () => engine.next(),
  complete: () => engine.inter?.activate() ?? false,
  async hold(ms = 2500) {
    engine.inter?.holdKey(true);
    await sleep(ms);
    engine.inter?.holdKey(false);
  },
  choose(label: string) {
    const b = [...document.querySelectorAll<HTMLButtonElement>('.ostrakon')].find((x) => x.textContent?.includes(label));
    b?.click();
    return !!b;
  },
  state: () => ({ index: engine.index, beat: engine.beat, busy: engine.isBusy, nextEnabled: !(document.querySelector('.panel__next') as HTMLButtonElement).disabled }),
  /** Advance to beat n, auto-completing gates on the way. */
  async goto(n: number) {
    const tried = new Set<string>();
    for (let guard = 0; guard < 400 && (engine.beat < n || engine.isBusy); guard++) {
      await sleep(120);
      const st = lab.state();
      if (st.busy) continue;
      if (st.nextEnabled && engine.beat < n) {
        lab.next();
        await sleep(300);
        continue;
      }
      if (!st.nextEnabled) {
        if (lab.complete()) continue;
        if (document.querySelector('.panel__hold:not([hidden])')) {
          await lab.hold(4000);
          continue;
        }
        const options = [...document.querySelectorAll<HTMLButtonElement>('.ostrakon')];
        if (options.length) {
          // Try each answer once; a wrong answer re-renders the options.
          const next = options.find((b) => !tried.has(b.textContent ?? '')) ?? options[0];
          tried.add(next.textContent ?? '');
          next.click();
          await sleep(900);
        }
      }
    }
  },
};
(window as unknown as { __lab: typeof lab; __atlas: App }).__lab = lab;
(window as unknown as { __atlas: App }).__atlas = app;
if (targetBeat > 0) void lab.goto(targetBeat);
