import type { Chapter } from '../../../story/types';

const AIOLIA: [number, number] = [14.78, 38.44];

export const aiolos: Chapter = {
  id: 'aiolos',
  part: 'donus',
  title: 'Rüzgârların Efendisi',
  label: 'Aiolia',
  greek: 'ΑΙΟΛΟΣ',
  place: 'Geleneğe göre Lipari (Aiolos) Adaları',
  at: [14.95, 38.48],
  harbor: AIOLIA,
  labelSide: 'top',
  year: 10,
  ships: 12,
  wrath: true,
  zoom: 3.6,
  reveal: 200,
  arrival: {
    id: 'sail',
    via: [[12.9, 38.35], [13.9, 38.45]],
    caption: { tr: 'Yüzen bir adaya, tunç duvarlarla çevrili Aiolia’ya, rüzgârların efendisinin yurduna varırlar.' },
  },
  legs: [
    {
      id: 'eve-dogru',
      via: [
        [14.92, 38.33], [15.25, 38.33], [15.55, 38.34], [15.67, 38.3], [15.66, 38.26], [15.62, 38.225],
        [15.605, 38.19], [15.6, 38.155], [15.58, 38.12], [15.56, 38.08], [15.545, 38.03], [15.56, 37.93],
        [15.85, 37.82], [16.4, 37.78], [18.0, 38.1], [19.6, 38.3],
      ],
      to: [20.2, 38.3],
      duration: 5,
    },
    {
      id: 'geri',
      from: [20.2, 38.3],
      via: [
        [19.1, 38.75], [17.8, 37.7], [16.7, 38.05], [16.1, 37.72], [15.7, 37.86], [15.56, 37.95],
        [15.545, 38.03], [15.56, 38.08], [15.58, 38.12], [15.6, 38.155], [15.605, 38.19], [15.62, 38.225],
        [15.66, 38.26], [15.67, 38.3], [15.5, 38.36], [15.15, 38.33], [14.9, 38.34],
      ],
      to: AIOLIA,
      style: 'blown',
      duration: 4.5,
    },
  ],
  end: { at: AIOLIA },
  beats: [
    {
      text: 'Rüzgârların efendisi <strong>Aiolos</strong>’un yüzen, tunç duvarlı adasında bir ay konuk kalırlar. Odysseus ona Troya’yı, Akhaların dönüşünü anlatır.',
    },
    {
      text: 'Ayrılırken Aiolos dokuz yaşında bir öküzün derisinden bir tulum diker ve bütün azgın rüzgârları içine bağlar. Yalnızca batı rüzgârı Zephyros serbesttir: onları eve götürsün diye.',
      quote: {
        greek: 'δῶκε δέ μ᾽ ἐκδείρας ἀσκὸν βοὸς ἐννεώροιο, / ἔνθα δὲ βυκτάων ἀνέμων κατέδησε κέλευθα',
        tr: 'Dokuz yaşında bir öküzün derisini yüzüp bir tulum verdi bana; uğuldayan rüzgârların yollarını onun içine bağladı.',
        ref: 'Odysseia 10.19–20',
      },
    },
    {
      text: 'Dokuz gün, dokuz gece yol alırlar. Onuncu gün İthaka görünür: kıyıda ateş yakanları seçecek kadar yakındırlar. Dümeni hiç bırakmayan Odysseus’u tatlı bir uyku alır.',
    },
    {
      text: 'Yoldaşlar tulumda altın ve gümüş olduğunu sanır: “Neden hep o armağan alıyor da biz eli boş dönüyoruz?”',
      gate: { kind: 'tap', prompt: 'Tulumun ipini çöz.' },
    },
    {
      text: 'Kurtulan rüzgârlar gemileri yeniden Aiolos’un adasına savurur. Aiolos bu kez kapıyı yüzlerine kapatır: “Tanrıların nefret ettiği adama yardım edemem!”',
      aside: {
        title: 'Mitin izi · Eolyen',
        text: 'Rüzgârla ilgili pek çok terim Aiolos’un adını taşır: jeolojide rüzgârın taşıyıp biriktirdiği çökeltilere “eolyen” denir; rüzgârla kendi kendine çalan <em>Aiolos arpı</em> da adını ondan alır.',
      },
    },
  ],
  load: () => import('../../../scenes/aiolos'),
};
