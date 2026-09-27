# Sahne Rehberi — Scene Guide

How to paint and animate a chapter's tondo (the round picture inside a kylix
cup) for **Mitos Atlası**. Read this fully before writing a scene. The reference
implementation is `src/scenes/ithaka.ts` — copy its structure.

## 1. The look

* **Black-figure vase painting.** Glaze-black silhouettes (`INK #16100b`) on
  orange clay (`CLAY #c4662f`). Details are *incised*: thin strokes in the clay
  colour. Accents only in **added white** (`WHITE #efe2c6`: women's skin,
  sails, foam, salt, stars, lightning) and **added purple** (`PURPLE #7e2e26`:
  garments, flames, fruit, blood-free wounds). No gradients on figures, no
  filters, no other colours.
* Archaic conventions: profile heads with a big frontal eye, beards, the V-chest.
  Women have white skin. Label key figures with painted Greek names
  (`inscription('ΚΙΡΚΗ', x, y, { size: 7, angle: 90 })`), as vase painters did.
* **Fill the tondo.** Figures are ~100 units tall; lay a tableau out in figure
  units, then enlarge it about the groundline so the picture fills the circle
  (see `fill()` in ithaka.ts). Frames may crop things at the edge — that is
  authentic — but keep faces and gate targets inside radius ~150.
* A groundline or an `exergue()` (black ground segment) usually closes the
  bottom (y ≈ 90–110). Sea scenes use `sea(y)`.
* A few filler rosettes (`fillers([...])`) in empty sky, sparingly.
* Every beat must **visibly change** the picture (someone moves, something
  appears, light changes). Idle life (waves, flames, breathing, oars) makes the
  cup feel alive.

## 2. Coordinates and lifecycle

The tondo is an SVG group: centre `(0,0)`, clipped to radius **166**, y grows
downward. A scene is a factory:

```ts
import type { SceneFactory } from '../story/types';
import { stage } from './tools';

export const scene: SceneFactory = (ctx) => {
  const st = stage(ctx);          // lifecycle helper: every animation is killed on destroy
  // build static layers & actors into ctx.root …
  return {
    enter() { /* entrance animation after the cup rises */ return st.play(tl); },
    async beat(i) { /* play beat i; resolve when done (after gates) */ },
    destroy() { st.destroy(); },
  };
};
```

* `beat(i)` is called once per beat, in order (0..n-1). Resolve the promise when
  the beat's animation is finished — for gated beats, after the reader has
  completed the interaction **and** the reaction animation has played. The
  “Devam” button stays disabled until then.
* Keep ungated beats short (≤ 2.5 s of animation).
* `ctx.signal` aborts when the reader leaves the chapter. From then on the
  scene is frozen: `st.play`/`st.wait` and the gates never resolve (code after
  them simply stops), animations started through `st` are killed at once, and
  `ctx.atlas`/`ctx.hud`/`ctx.audio`/`ctx.say` do nothing, so a stale scene can
  never touch the next chapter. Never leave `requestAnimationFrame`/intervals
  running — use `st.loop(gsap.to(...))` for endless idle motion, and remove any
  `gsap.ticker` callback on abort.
* GSAP `x`/`y` tweens on an element that already has an SVG `transform`
  attribute replace that transform. Put positioned art in a plain wrapper `<g>`
  and animate the wrapper.
* `ctx.reduced` is true for `prefers-reduced-motion`; `stage()` shortens durations.
* Per-scene defs (gradients, clip paths) go into `ctx.defs` with attribute
  `data-scene` so they are removed with the scene.

## 3. Interaction gates

The chapter data (`src/stories/odyssey/chapters/NN-id.ts`) declares which beats
wait for the reader (`gate: { kind, prompt }`); the panel shows the prompt. The
scene decides *what* to touch:

| kind   | call                                                                          | notes |
|--------|-------------------------------------------------------------------------------|-------|
| tap    | `await ctx.tap(el, { label })`                                                | adds a pulsing ring, keyboard (Enter) accessible. Several taps in a row are fine (e.g. each rower). |
| hold   | `await ctx.hold({ label, seconds, onProgress: p => … })`                      | a “Basılı tut” button appears in the panel; progress decays when released. Drive the picture from `p`. |
| drag   | `await ctx.drag(el, { label, axis: 'x' \| 'y' \| 'xy', distance, onProgress })` | `distance` in scene units (negative = leftwards/upwards). Move things yourself in `onProgress(p)`. Springs back if released early. |
| choice | `const id = await ctx.choose([{ id, label }, …])`                              | buttons appear as ostraka in the panel. For a wrong answer call `ctx.say('…')` and ask again (loop). |

Use `ctx.say(text)` to change the prompt line (e.g. hints after a wrong choice).

## 4. Talking to the map and HUD

`ctx.atlas`:
* `sail(legId)` — sail one of the chapter's extra legs (declared in the chapter
  data `legs: [...]`), with the fleet and route line. Await it.
* `flash(color?)`, `shake(strength?)` — lightning flash / screen shake.
* `setMood('day' | 'night' | 'storm' | 'underworld' | 'dawn')` — recolours the
  whole atlas. `setWeather('none' | 'storm' | 'rain' | 'night' | 'mist')`.
* `sinkShips(n)` — sink n ships on the map (HUD updates too).
* `look([lon, lat], zoom?)` / `settle()` — move the camera, then return.

`ctx.hud.setYear(n, seconds)`, `ctx.hud.setShips(n)`, `ctx.hud.wrath(on)`.

`ctx.audio.sfx(name)` — synthesised sounds (silent until the reader enables sound):
`arrive, depart, storm, wind, thunder, splash, boulder, thud, fire, magic,
sirens, bow, twang, ghost, whirl, bleat, moo, bark, success, fail`.

## 5. The art kit (import, do not edit)

* `src/art/figure.ts` — `new Figure(style, pose)`; `.to(partialPose, gsapVars)`
  tweens joints; `.set(partialPose)`; `.hand('F'|'B')` returns a hand position.
  Styles: `head: 'bearded'|'youth'|'woman'|'old'|'cyclops'|'giant'`,
  `hat: 'pilos'(Odysseus)|'helmet'|'petasos'(Hermes)|'diadem'|'wreath'|'veil'`,
  `garment: 'none'|'short'|'long'|'peplos'|'rags'`, `garmentColor`, `cloak`,
  `cloakColor`, `scale`, `facing: 1|-1`, `wingedFeet`. `fig.blind = true` for
  the blinded Cyclops. `POSES.stand|walk|run|knielauf|lunge|sit|row|lament|plead|fallen(x, groundY)`,
  or `pose({...})`. Joint angles: 0° = hanging down, 90° = pointing forward,
  180° = up. Props: `shield(c, r, device)`, `spear(a, b)`, `bowPath(a, b, bulge, drawPoint)`.
* `src/art/animals.ts` — `new Beast('ox'|'ram'|'sheep'|'pig'|'dog'|'donkey', { x, y, scale, facing })`,
  `.walk(speed)` (returns a tween — register it with `st.loop`), `.nod(deg)`,
  `.moveTo(x, y)`; `bird(x, y, k)`.
* `src/art/kit.ts` — `exergue, groundLine, sea (+ SEA_TILE), rock, cliff, cave,
  oliveTree, cypress, vine, reeds, sun, moon, stars, cloud, thunderbolt,
  lightning, rain, flames, torch, amphora, kylix, rope, splash, column,
  cityWall, inscription, fillers, glow, nightVeil`.
* `src/art/ship.ts` — `ship({ palette: BLACK_FIGURE, sail, oars, crew })`,
  `rowing(parts.oars, gsap)`, `raft()`, `wreck()`.
* `src/art/ornaments.ts`, `src/art/letters.ts` (`greekText`), `src/lib/geometry.ts`
  (`ribbon`, `limb`, `smoothPath`, `sampleSpline` — great for tails, necks,
  tentacles, rope), `src/lib/dom.ts` (`s()` creates SVG elements, `frag()` parses markup).
* GSAP with MorphSVG, DrawSVG, SplitText, CustomEase is registered:
  `import { gsap } from '../lib/motion'`.

Need something new (a Siren, Skylla, the wooden horse, a whirlpool, a loom)? Draw
it inside your scene file, or in a new file `src/scenes/<chapter-id>.art.ts`.
Build it from `ribbon`/`limb`/`smoothPath`, keep the black-figure rules, and
make parts you want to animate separate groups.

## 6. Testing your scene

* The dev server is already running at `http://localhost:5173` — do not start
  or stop it.
* Scene lab (one chapter, real map + panel):
  `http://localhost:5173/scene.html?ch=<chapter-id>`; add `&beat=3` to
  fast-forward (gates auto-complete). In the page, `window.__lab` offers
  `next()`, `complete()` (finish a tap/drag gate), `hold(ms)`, `choose(label)`,
  `goto(n)`, `state()`.
* Screenshots (Playwright + Chromium are installed):

  ```bash
  node /tmp/claude-0/-home-user-themytho/ab52e1ed-5eb7-5fd0-9d08-9f1dfa8b0721/scratchpad/shot.mjs \
    "http://localhost:5173/scene.html?ch=kyklop&beat=2" out.png 1440 900 9000 0 "210,150,580,580"
  # args: url out width height waitMs fullPage clip(x,y,w,h) [actions-json]
  # actions: '[{"eval":"__lab.complete()"},{"wait":1500},{"shot":"after.png"}]'
  ```

  The clip `210,150,580,580` frames the tondo at 1440×900. Look at every beat
  (and mid-animation frames for motion) and iterate until it looks like a real
  painted cup. Console errors are printed by the script — there must be none.
* Typecheck only your files:
  `npx tsc --noEmit -p . 2>&1 | grep -E "src/scenes/(kyklop)"` → must print nothing.

## 7. Ownership rules (several people paint at once)

* Only edit: `src/scenes/<your-chapter-id>.ts`, new files
  `src/scenes/<your-chapter-id>.*.ts`, and — only if needed for your
  interactions — the `gate`, `prompt`, `legs` fields of your own chapter data
  file. Keep its Turkish text (fix typos only).
* Do not edit shared files (`src/art/*`, `src/lib/*`, `src/story/*`, `src/ui/*`,
  `src/map/*`, styles, `package.json`). If the kit lacks something, draw it
  locally. Report anything you believe the shared kit should gain.
* No new dependencies, no external images or fonts: everything is SVG built in code.
