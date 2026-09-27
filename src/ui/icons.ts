/** Small inline SVG icons drawn for the interface. */

const wrap = (body: string, vb = '0 0 24 24') =>
  `<svg viewBox="${vb}" aria-hidden="true" focusable="false">${body}</svg>`;

export const ICONS = {
  /** A lyre (sound on). */
  lyre: wrap(
    '<path d="M6 3c-1.6 2.6-1.4 6 .6 8.2L8 21h8l1.4-9.8C19.4 9 19.6 5.6 18 3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
      '<path d="M7 7h10M8 21h8M10 8v12M12 8v12M14 8v12" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>',
  ),
  /** Lyre with a stroke through it (sound off). */
  lyreOff: wrap(
    '<path d="M6 3c-1.6 2.6-1.4 6 .6 8.2L8 21h8l1.4-9.8C19.4 9 19.6 5.6 18 3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>' +
      '<path d="M7 7h10M8 21h8M10 8v12M12 8v12M14 8v12" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" opacity=".55"/>' +
      '<path d="M4 20L20 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  ),
  /** A square meander (index). */
  index: wrap('<path d="M4 20V4h16v16H8V8h8v8h-4v-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square"/>'),
  /** Poseidon's trident. */
  trident: wrap(
    '<path d="M12 22V6M6 3v4.5C6 10 8.5 11 12 11s6-1 6-3.5V3M12 2l-1.6 3.6h3.2zM6 3l-1.2 2.6M6 3l1.2 2.6M18 3l-1.2 2.6M18 3l1.2 2.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
  ),
  close: wrap('<path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'),
  next: wrap('<path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'),
  prev: wrap('<path d="M19 12H6M11 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'),
  tap: wrap(
    '<circle cx="12" cy="9" r="3.2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="9" r="6.6" fill="none" stroke="currentColor" stroke-width="1" opacity=".5"/><path d="M12 12.5V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  ),
  hold: wrap('<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 2.2"/><circle cx="12" cy="12" r="3.4" fill="currentColor"/>'),
  drag: wrap('<path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'),
  choice: wrap('<path d="M12 21v-7M12 14L6 6M12 14l6-8M4 4h4M16 4h4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'),
  restart: wrap('<path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>'),
  /** A tiny galley for the ship counter. */
  ship: wrap(
    '<path d="M2 13.4h17.2l2.8-1.2-2.6 2.8H4.8C3.4 15 2.4 14.4 2 13.4z" fill="currentColor"/><path d="M3.2 13.2C2.2 11 2.6 8.8 4.4 8.2" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M11 13V3" stroke="currentColor" stroke-width="1"/><path d="M6.6 4h8.8c.4 2.4.3 4.9-.2 7.4H7c-.6-2.4-.7-4.9-.4-7.4z" fill="currentColor" opacity=".85"/><path d="M5.6 15.2l-1 3.2M8.6 15.2l-1 3.2M11.6 15.2l-1 3.2M14.6 15.2l-1 3.2" stroke="currentColor" stroke-width=".9" stroke-linecap="round"/>',
    '0 0 24 20',
  ),
};
