/** TR · EN: the reading language, switchable at any moment (Greek never changes). */
import { h } from '../lib/dom';
import { L, LANGS, bind, lang, onLang, setLang } from '../i18n';

/** Each language is named in itself, as language pickers conventionally are. */
const NAMES = { tr: 'Türkçe', en: 'English' } as const;

export function langSwitch(className = ''): HTMLElement {
  const group = h('div', { class: `lang-switch ${className}`.trim(), role: 'group' });
  bind(group, L('Okuma dili', 'Reading language'), 'aria-label');
  const buttons = LANGS.map((l) => {
    const b = h('button', { class: 'lang-switch__btn', type: 'button', lang: l, title: NAMES[l], 'aria-label': NAMES[l] }, [l.toUpperCase()]);
    b.addEventListener('click', () => setLang(l));
    group.appendChild(b);
    return b;
  });
  const sync = () => buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(LANGS[i] === lang())));
  sync();
  onLang(sync);
  return group;
}
