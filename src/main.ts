import './styles/fonts';
import './styles/tokens.css';
import './styles/base.css';
import './styles/atlas.css';
import './styles/ui.css';
import './styles/screens.css';
import './styles/scenes.css';

import { meanderTileURI } from './art/ornaments';
import { App } from './app';
import { odyssey } from './stories/odyssey';

// Ornament tiles used as CSS backgrounds, generated from the same SVG vocabulary.
const rootStyle = document.documentElement.style;
rootStyle.setProperty('--meander-gold', meanderTileURI('#e0ad55', 30, 2.2));
rootStyle.setProperty('--meander-clay', meanderTileURI('#c4662f', 12, 1.3));
const grain =
  `url("data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .95 0 0 0 0 .88 0 0 0 0 .75 0 0 0 .07 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>',
  )}")`;
rootStyle.setProperty('--grain', grain);

const root = document.getElementById('app')!;
document.fonts.ready.finally(() => {
  const app = new App(root, odyssey);
  (window as unknown as { __atlas: App }).__atlas = app;
});
