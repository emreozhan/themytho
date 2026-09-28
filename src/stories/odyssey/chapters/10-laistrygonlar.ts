import type { Chapter } from '../../../story/types';

export const laistrygonlar: Chapter = {
  id: 'laistrygonlar',
  part: 'donus',
  title: { tr: 'Laistrygonlar', en: 'The Laestrygonians' },
  greek: 'ΛΑΙΣΤΡΥΓΟΝΕΣ',
  place: { tr: 'Geleneklerden birine göre Bonifacio, Korsika', en: 'By one tradition Bonifacio, Corsica' },
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
    via: [[14.5, 38.75], [14.0, 39.2], [12.0, 40.4], [10.3, 41.15]],
    caption: {
      text: {
        tr: 'Altı gün, altı gece yol aldık; yedinci gün Lamos’un yüksek kalesine, Laistrygonların Telepylos’una vardık.',
        en: 'Six days and six nights we sailed; on the seventh we came to the steep citadel of Lamus, Telepylus of the Laestrygonians.',
      },
      greek: 'ἑβδομάτῃ δ᾽ ἱκόμεσθα Λάμου αἰπὺ πτολίεθρον — Od. 10.81',
    },
  },
  end: { ships: 1 },
  beats: [
    {
      text: {
        tr: 'İki yanı sarp kayalıklarla çevrili, ağzı dar bir limana varırlar. On bir gemi limanın içine demir atar; Odysseus ise kendi gemisini dışarıda, bir kayaya bağlar.',
        en: 'They reach a harbour with a narrow mouth, walled in by sheer cliffs on both sides. Eleven ships anchor inside the harbour; Odysseus moors his own ship outside, tied to a rock.',
      },
    },
    {
      text: {
        tr: 'Burası insan eti yiyen dev <strong>Laistrygonlar</strong>’ın ülkesidir. Kralları Antiphates keşifçilerden birini hemen yakalar; bağrışlara devler dört bir yandan koşup gelir.',
        en: 'This is the land of the man-eating giants, the <strong>Laestrygonians</strong>. Their king Antiphates seizes one of the scouts at once; at the shouting, giants come running from every side.',
      },
    },
    {
      text: {
        tr: 'Devler kayalıklardan gemilere, bir insanın ancak kaldırabileceği taşlar fırlatır.',
        en: 'From the cliffs the giants hurl boulders at the ships, each as big as a man can lift.',
      },
      gate: { kind: 'tap', prompt: { tr: 'Halatı kes: Odysseus’un gemisini kurtar!', en: 'Cut the rope: save Odysseus’s ship!' } },
      quote: {
        greek: 'οἵ ῥ᾽ ἀπὸ πετράων ἀνδραχθέσι χερμαδίοισι / βάλλον',
        text: {
          tr: 'Kayalıklardan, bir adamın ancak kaldırabileceği taşlar fırlattılar.',
          en: 'From the cliffs they pelted us with boulders as heavy as a man could lift.',
        },
        ref: { tr: 'Odysseia 10.121–122', en: 'Odyssey 10.121–122' },
      },
    },
    {
      text: {
        tr: 'Limandaki on bir gemi tayfalarıyla birlikte yok olur. Yalnızca Odysseus’un gemisi, var gücüyle kürek çeken adamlarıyla açık denize kaçar.',
        en: 'The eleven ships in the harbour are destroyed with all their crews. Only Odysseus’s ship escapes to the open sea, its men rowing with all their strength.',
      },
    },
  ],
  load: () => import('../../../scenes/laistrygonlar'),
};
