import type { Chapter } from '../../../story/types';
import { scene } from '../../../scenes/aiolos';

const AIOLIA: [number, number] = [14.86, 38.52];

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
    via: [[12.9, 38.35], [13.9, 38.55]],
    caption: { tr: 'Yüzen bir adaya, tunç duvarlarla çevrili Aiolia’ya, rüzgârların efendisinin yurduna varırlar.' },
  },
  legs: [
    {
      id: 'eve-dogru',
      via: [[15.35, 38.33], [15.63, 38.2], [16.2, 37.95], [18.0, 38.2], [19.8, 38.35]],
      to: [20.42, 38.33],
      duration: 5,
    },
    {
      id: 'geri',
      from: [20.42, 38.33],
      via: [[19.2, 38.9], [17.6, 38.1], [16.4, 38.9]],
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
  scene,
};
