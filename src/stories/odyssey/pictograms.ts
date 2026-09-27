/**
 * Tiny pictograms that an ancient cartographer might have painted beside each
 * stop. Drawn in a 24-unit box centred on (0,0); `stroke` parts are outlined,
 * `fill` parts are solid.
 */
import type { Pictogram } from '../../story/types';

export const PICTOGRAMS: Record<string, Pictogram> = {
  // A small palace: pediment and two columns.
  ithaka: { stroke: 'M-9 9V-1M9 9V-1M-4 9V1M4 9V1M-11 -1H11M-12 -2L0 -10L12 -2', fill: 'M-11 9H11V10.6H-11Z' },
  // Three hulls with masts: the gathered fleet.
  avlis: { stroke: 'M-12 5Q-8 9 -3 5M-1 5Q3 9 8 5M5 1Q9 4 12 1M-8 4V-7M3 4V-6M9 1V-8M-11 -6H-5M0 -5H6', fill: '' },
  // Walls and towers with a gate.
  troya: { at: [0, -32], fill: 'M-11 10V-1H-8V-5H-4V-1H-2V-4H2V-1H4V-5H8V-1H11V10H3V4Q0 1 -3 4V10Z', stroke: '' },
  // The wooden horse on its wheels.
  'tahta-at': { at: [0, 32], fill: 'M-9 5V-1L3 -1L6 -8L9 -10L11 -6L8 -5L7 1V5Z M-11 -1L-9 -4L-8 -1Z', stroke: 'M-8 8a1.6 1.6 0 1 0 .1 0M5 8a1.6 1.6 0 1 0 .1 0M-11 6H10' },
  // A wine amphora (Maron's gift).
  kikonlar: { fill: 'M-2 -11H2V-8C7 -5 7 3 2 8L1 10H-1L-2 8C-7 3 -7 -5 -2 -8Z', stroke: 'M-2 -9C-6 -10 -7 -6 -5 -4M2 -9C6 -10 7 -6 5 -4' },
  // A storm cloud with lightning.
  malea: { fill: 'M-11 -1C-12 -6 -6 -8 -4 -5C-3 -10 5 -10 5 -5C8 -8 12 -5 10 -1Z', stroke: 'M1 1L-2 5L2 5L-1 10' },
  // A lotus blossom.
  lotofaglar: { fill: 'M0 6C-3 1 -3 -6 0 -10C3 -6 3 1 0 6ZM0 6C-6 4 -9 -2 -9 -6C-4 -4 -1 0 0 6ZM0 6C6 4 9 -2 9 -6C4 -4 1 0 0 6Z', stroke: 'M0 6V11' },
  // The Cyclops's single eye.
  kyklop: { stroke: 'M-11 0Q0 -9 11 0Q0 9 -11 0Z', fill: 'M-3.2 0a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0Z' },
  // The bag of winds, tied, with a gust escaping.
  aiolos: { fill: 'M-6 -4C-11 2 -8 10 0 10C8 10 11 2 6 -4Z', stroke: 'M-6 -5H6M-2 -7L0 -5L2 -7M8 -9Q11 -7 9 -4M-9 -9Q-12 -7 -10 -4' },
  // A boulder hurled from the cliffs.
  laistrygonlar: { fill: 'M-4 -2C-5 -7 1 -9 4 -6C8 -5 8 1 5 3C3 6 -3 6 -4 3Z', stroke: 'M-8 6L-11 10M-3 7L-4 11M3 7L4 11' },
  // A pig's head (Circe's spell).
  kirke: { at: [-30, 4], fill: 'M-8 -2C-8 -8 8 -8 8 -2C8 5 4 8 0 8C-4 8 -8 5 -8 -2Z', stroke: 'M-7 -5L-10 -10L-4 -7M7 -5L10 -10L4 -7M-2.5 3a1.3 1.3 0 1 0 .1 0M2.5 3a1.3 1.3 0 1 0 .1 0' },
  // A winged shade (eidolon).
  hades: { at: [0, -30], fill: 'M0 -11a2.6 2.6 0 1 0 .1 0Z', stroke: 'M0 -6V4M0 -3L-8 -7L-6 -1M0 -3L8 -7L6 -1M-3 10L0 4L3 10' },
  // A Siren: bird body, woman's head.
  sirenler: { at: [0, 30], fill: 'M-8 2C-6 -3 2 -4 6 0L10 -2L8 3C5 7 -3 7 -8 2Z M4 -6a3 3 0 1 0 .1 0Z', stroke: 'M-2 7L-3 11M2 7L3 11' },
  // Scylla's serpent necks and the whirlpool.
  skylla: { at: [0, 32], stroke: 'M-10 10C-10 2 -4 2 -6 -6M-6 10C-5 4 1 3 0 -8M-2 10C0 5 6 5 5 -4M2 3a4 4 0 1 1 8 0a2.5 2.5 0 1 1 -5 0', fill: 'M-8 -8l4 2l-3 1ZM-2 -10l4 2l-3 1ZM3 -6l4 2l-3 1Z' },
  // A bucranium: the Sun's cattle.
  thrinakia: { fill: 'M-5 -3H5L3 9H-3Z', stroke: 'M-5 -2C-11 -3 -12 -9 -8 -11M5 -2C11 -3 12 -9 8 -11M-2 1.5H-1.2M1.2 1.5H2' },
  // Calypso's vine-hung cave.
  kalypso: { stroke: 'M-11 10C-11 -4 -6 -9 0 -9C6 -9 11 -4 11 10M-5 10C-5 0 -3 -3 0 -3C3 -3 5 0 5 10', fill: 'M-9 -7C-12 -8 -12 -4 -9 -4ZM8 -8C11 -9 12 -5 9 -5Z' },
  // Nausicaa's ball.
  skheria: { stroke: 'M-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0M-7 -4Q0 1 7 -4M-7 4Q0 -1 7 4', fill: '' },
};
