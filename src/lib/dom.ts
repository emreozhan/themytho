/** Tiny DOM/SVG construction helpers. */

export const SVG_NS = 'http://www.w3.org/2000/svg';

export type Attrs = Record<string, string | number | boolean | null | undefined>;
type Child = Node | string | null | undefined | false;

function applyAttrs(node: Element, attrs?: Attrs): void {
  if (!attrs) return;
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    node.setAttribute(k, v === true ? '' : String(v));
  }
}

function append(node: Node, children?: Child[]): void {
  if (!children) return;
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
}

/** Create an SVG element. */
export function s<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs?: Attrs,
  children?: Child[],
): SVGElementTagNameMap[K] {
  const node = document.createElementNS(SVG_NS, tag);
  applyAttrs(node, attrs);
  append(node, children);
  return node;
}

/** Create an HTML element. */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Attrs,
  children?: Child[],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  applyAttrs(node, attrs);
  append(node, children);
  return node;
}

/** Parse an SVG fragment (markup without the outer <svg>) into a <g>. */
export function frag(markup: string, attrs?: Attrs): SVGGElement {
  const g = s('g', attrs);
  g.innerHTML = markup;
  return g;
}

/** Set several attributes at once. */
export function attr(node: Element, attrs: Attrs): void {
  applyAttrs(node, attrs);
}

export function clear(node: Element): void {
  while (node.firstChild) node.removeChild(node.firstChild);
}

let uid = 0;
/** Unique id for defs (gradients, masks, clip paths). */
export function nextId(prefix = 'u'): string {
  uid += 1;
  return `${prefix}-${uid.toString(36)}`;
}

/** Round to one decimal for compact path strings. */
export function r1(v: number): number {
  return Math.round(v * 10) / 10;
}

/** Round to two decimals. */
export function r2(v: number): number {
  return Math.round(v * 100) / 100;
}
