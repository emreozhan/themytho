/**
 * The atlas reads in Turkish (its own language) or English. Greek is never
 * translated: inscriptions, Greek titles and Homer's lines stay as they are,
 * and only the notes around them change.
 *
 * The language can change at any moment; components that print text subscribe
 * with `onLang` (or `bind`) and redraw their words in place.
 */
export type Lang = 'tr' | 'en';
export const LANGS: readonly Lang[] = ['tr', 'en'];

/** Reader-facing text in every language. */
export type Loc = Record<Lang, string>;
/** A plain string (a name, a number) or localized text. */
export type Text = string | Loc;

const KEY = 'mitos-atlasi.lang';
const isLang = (v: unknown): v is Lang => v === 'tr' || v === 'en';

function initial(): Lang {
  try {
    const q = new URLSearchParams(location.search).get('lang');
    if (isLang(q)) return q;
  } catch {
    /* no query string in this frame */
  }
  try {
    const saved = localStorage.getItem(KEY);
    if (isLang(saved)) return saved;
  } catch {
    /* storage may be blocked */
  }
  return 'tr';
}

let current: Lang = typeof location === 'undefined' ? 'tr' : initial();
const listeners = new Set<(l: Lang) => void>();
if (typeof document !== 'undefined') document.documentElement.lang = current;

export function lang(): Lang {
  return current;
}

export function setLang(l: Lang): void {
  if (l === current) return;
  current = l;
  try {
    localStorage.setItem(KEY, l);
  } catch {
    /* the choice just won't outlive the page */
  }
  document.documentElement.lang = l;
  listeners.forEach((f) => f(l));
}

/** Call `f` whenever the language changes; returns an unsubscribe function. */
export function onLang(f: (l: Lang) => void): () => void {
  listeners.add(f);
  return () => listeners.delete(f);
}

/** The text in the current language. */
export function tx(t: Text): string {
  return typeof t === 'string' ? t : t[current] || t.tr;
}

/** An inline pair for interface strings: `L('Devam', 'Continue')`. */
export function L(tr: string, en: string): Loc {
  return { tr, en };
}

/**
 * Keep an element's text (or one of its attributes) in the current language.
 * `text` may be a function for strings built from parts.
 */
export function bind(el: Element, text: Text | (() => string), attr?: string): () => void {
  const apply = () => {
    const v = typeof text === 'function' ? text() : tx(text);
    if (attr) el.setAttribute(attr, v);
    else el.textContent = v;
  };
  apply();
  return onLang(apply);
}

/** A number written the way the current language writes it. */
export function num(n: number): string {
  return n.toLocaleString(current === 'en' ? 'en-GB' : 'tr-TR');
}
