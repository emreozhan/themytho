import type { Chapter } from '../../../story/types';
import { scene } from '../../../scenes/laistrygonlar';

export const laistrygonlar: Chapter = {
  id: 'laistrygonlar',
  part: 'donus',
  title: 'Laistrygonlar',
  greek: 'ΛΑΙΣΤΡΥΓΟΝΕΣ',
  place: 'Geleneklerden birine göre Bonifacio, Korsika',
  at: [9.16, 41.39],
  harbor: [9.2, 41.34],
  labelSide: 'right',
  year: 10,
  ships: 12,
  wrath: true,
  zoom: 4.2,
  reveal: 200,
  arrival: {
    id: 'sail',
    via: [[14.0, 39.2], [12.0, 40.4], [10.3, 41.15]],
    caption: {
      tr: 'Altı gün, altı gece yol aldık; yedinci gün Lamos’un yüksek kalesine, Laistrygonların Telepylos’una vardık.',
      greek: 'ἑβδομάτῃ δ᾽ ἱκόμεσθα Λάμου αἰπὺ πτολίεθρον — Od. 10.81',
    },
  },
  end: { ships: 1 },
  beats: [
    {
      text: 'İki yanı sarp kayalıklarla çevrili, ağzı dar bir limana varırlar. On bir gemi limanın içine demir atar; Odysseus ise kendi gemisini dışarıda, bir kayaya bağlar.',
    },
    {
      text: 'Burası insan eti yiyen dev <strong>Laistrygonlar</strong>’ın ülkesidir. Kralları Antiphates keşifçilerden birini hemen yakalar; bağrışlara devler dört bir yandan koşup gelir.',
    },
    {
      text: 'Devler kayalıklardan gemilere, bir insanın ancak kaldırabileceği taşlar fırlatır.',
      gate: { kind: 'tap', prompt: 'Halatı kes: Odysseus’un gemisini kurtar!' },
      quote: {
        greek: 'οἵ ῥ᾽ ἀπὸ πετράων ἀνδραχθέσι χερμαδίοισι / βάλλον',
        tr: 'Kayalıklardan, bir adamın ancak kaldırabileceği taşlar fırlattılar.',
        ref: 'Odysseia 10.121–122',
      },
    },
    {
      text: 'Limandaki on bir gemi tayfalarıyla birlikte yok olur. Yalnızca Odysseus’un gemisi, var gücüyle kürek çeken adamlarıyla açık denize kaçar.',
    },
  ],
  scene,
};
