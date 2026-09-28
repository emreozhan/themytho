/**
 * Cilt I — Odysseia.
 * The journey of Odysseus from Ithaca to Troy and home again, in eighteen stops.
 * Sources: Homer's Iliad and Odyssey (8th c. BC); a few pre-war episodes
 * (Palamedes, Achilles on Skyros, Iphigeneia) come from the later Epic Cycle.
 * Greek lines are Homer's; the Turkish and English renderings are our own.
 */
import type { Story } from '../../story/types';
import { ithaka } from './chapters/01-ithaka';
import { avlis } from './chapters/02-avlis';
import { troya } from './chapters/03-troya';
import { tahtaAt } from './chapters/04-tahta-at';
import { kikonlar } from './chapters/05-kikonlar';
import { malea } from './chapters/06-malea';
import { lotofaglar } from './chapters/07-lotofaglar';
import { kyklop } from './chapters/08-kyklop';
import { aiolos } from './chapters/09-aiolos';
import { laistrygonlar } from './chapters/10-laistrygonlar';
import { kirke } from './chapters/11-kirke';
import { hades } from './chapters/12-hades';
import { sirenler } from './chapters/13-sirenler';
import { skylla } from './chapters/14-skylla';
import { thrinakia } from './chapters/15-thrinakia';
import { kalypso } from './chapters/16-kalypso';
import { skheria } from './chapters/17-skheria';
import { nostos } from './chapters/18-nostos';
import { PICTOGRAMS } from './pictograms';

export const odyssey: Story = {
  id: 'odysseia',
  title: { tr: 'Odysseia', en: 'Odyssey' },
  greekTitle: 'ΟΔΥΣΣΕΙΑ',
  subtitle: {
    tr: 'İthaka’dan Troya’ya, Troya’dan yeniden İthaka’ya: yirmi yıllık bir yolculuk.',
    en: 'From Ithaca to Troy, and from Troy back to Ithaca: a voyage of twenty years.',
  },
  parts: [
    { id: 'cagri', title: { tr: 'Çağrı', en: 'The Call' }, greek: 'ΚΛΗΣΙΣ' },
    { id: 'savas', title: { tr: 'Troya Savaşı', en: 'The Trojan War' }, greek: 'ΠΟΛΕΜΟΣ' },
    { id: 'donus', title: { tr: 'Dönüş', en: 'The Return' }, greek: 'ΝΟΣΤΟΣ' },
    { id: 'ithaka', title: { tr: 'İthaka', en: 'Ithaca' }, greek: 'ΙΘΑΚΗ' },
  ],
  chapters: [
    ithaka, avlis, troya, tahtaAt, kikonlar, malea, lotofaglar, kyklop, aiolos,
    laistrygonlar, kirke, hades, sirenler, skylla, thrinakia, kalypso, skheria, nostos,
  ],
  startYear: 1,
  totalYears: 20,
  initialShips: 12,
  known: [
    { at: [22.1, 39.3], r: 190 },
    { at: [22.3, 37.5], r: 170 },
    { at: [20.6, 38.7], r: 150 },
    { at: [24.6, 38.4], r: 200 },
    { at: [25.4, 40.6], r: 170 },
    { at: [26.6, 39.6], r: 190 },
    { at: [27.3, 38.1], r: 170 },
    { at: [24.9, 35.6], r: 150 },
    { at: [25.6, 36.9], r: 150 },
  ],
  pictograms: PICTOGRAMS,
};
