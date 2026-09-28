import type { Chapter } from '../../../story/types';

const AIOLIA: [number, number] = [14.78, 38.44];

export const aiolos: Chapter = {
  id: 'aiolos',
  part: 'donus',
  title: { tr: 'Rüzgârların Efendisi', en: 'Master of the Winds' },
  label: { tr: 'Aiolia', en: 'Aeolia' },
  greek: 'ΑΙΟΛΟΣ',
  place: { tr: 'Geleneğe göre Lipari (Aiolos) Adaları', en: 'Traditionally the Lipari (Aeolian) Islands' },
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
    caption: { text: { tr: 'Yüzen bir adaya, tunç duvarlarla çevrili Aiolia’ya, rüzgârların efendisinin yurduna varırlar.', en: 'They reach a floating island, Aeolia, ringed with walls of bronze, home of the master of the winds.' } },
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
      text: {
        tr: 'Rüzgârların efendisi <strong>Aiolos</strong>’un yüzen, tunç duvarlı adasında bir ay konuk kalırlar. Odysseus ona Troya’yı, Akhaların dönüşünü anlatır.',
        en: 'For a month they are guests on the floating, bronze-walled island of <strong>Aeolus</strong>, master of the winds. Odysseus tells him about Troy and the Achaeans’ return.',
      },
    },
    {
      text: {
        tr: 'Ayrılırken Aiolos dokuz yaşında bir öküzün derisinden bir tulum diker ve bütün azgın rüzgârları içine bağlar. Yalnızca batı rüzgârı Zephyros serbesttir: onları eve götürsün diye.',
        en: 'At parting, Aeolus sews a bag from the hide of a nine-year-old ox and binds all the raging winds inside. Only Zephyrus, the west wind, is left free, to carry them home.',
      },
      quote: {
        greek: 'δῶκε δέ μ᾽ ἐκδείρας ἀσκὸν βοὸς ἐννεώροιο, / ἔνθα δὲ βυκτάων ἀνέμων κατέδησε κέλευθα',
        text: {
          tr: 'Dokuz yaşında bir öküzün derisini yüzüp bir tulum verdi bana; uğuldayan rüzgârların yollarını onun içine bağladı.',
          en: 'He flayed a nine-year-old ox and gave me a bag of its hide, and in it he bound the paths of the howling winds.',
        },
        ref: { tr: 'Odysseia 10.19–20', en: 'Odyssey 10.19–20' },
      },
    },
    {
      text: {
        tr: 'Dokuz gün, dokuz gece yol alırlar. Onuncu gün İthaka görünür: kıyıda ateş yakanları seçecek kadar yakındırlar. Dümeni hiç bırakmayan Odysseus’u tatlı bir uyku alır.',
        en: 'They sail for nine days and nine nights. On the tenth day Ithaca comes into view: they are close enough to make out men tending fires on the shore. Odysseus, who has never let go of the helm, falls into a sweet sleep.',
      },
    },
    {
      text: {
        tr: 'Yoldaşlar tulumda altın ve gümüş olduğunu sanır: “Neden hep o armağan alıyor da biz eli boş dönüyoruz?”',
        en: 'His companions think the bag is full of gold and silver: “Why does he always get the gifts, while we go home empty-handed?”',
      },
      gate: { kind: 'tap', prompt: { tr: 'Tulumun ipini çöz.', en: 'Untie the cord of the bag.' } },
    },
    {
      text: {
        tr: 'Kurtulan rüzgârlar gemileri yeniden Aiolos’un adasına savurur. Aiolos bu kez kapıyı yüzlerine kapatır: “Tanrıların nefret ettiği adama yardım edemem!”',
        en: 'The winds burst free and hurl the ships back to Aeolus’s island. This time Aeolus shuts the gate in their faces: “I cannot help a man the gods hate!”',
      },
      aside: {
        title: { tr: 'Mitin izi · Eolyen', en: 'Echo of the myth · Aeolian' },
        text: {
          tr: 'Rüzgârla ilgili pek çok terim Aiolos’un adını taşır: jeolojide rüzgârın taşıyıp biriktirdiği çökeltilere “eolyen” denir; rüzgârla kendi kendine çalan <em>Aiolos arpı</em> da adını ondan alır.',
          en: 'Many words to do with wind carry Aeolus’s name: in geology, sediment carried and laid down by the wind is called “aeolian”, and the <em>Aeolian harp</em>, which plays by itself in the wind, is named after him.',
        },
      },
    },
  ],
  load: () => import('../../../scenes/aiolos'),
};
