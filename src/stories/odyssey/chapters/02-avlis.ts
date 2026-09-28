import type { Chapter } from '../../../story/types';

export const avlis: Chapter = {
  id: 'avlis',
  part: 'cagri',
  title: { tr: 'Avlis', en: 'Aulis' },
  greek: 'ΑΥΛΙΣ',
  place: { tr: 'Beotya kıyısı, Eğriboz (Euboia) Boğazı', en: 'The coast of Boeotia, on the strait of Euboea' },
  at: [23.6, 38.43],
  harbor: [23.7, 38.39],
  labelSide: 'left',
  year: 1,
  ships: 12,
  zoom: 4,
  reveal: 150,
  arrival: {
    id: 'sail',
    via: [
      [20.86, 38.14], [21.08, 37.88], [21.12, 37.55], [21.4, 36.9], [21.95, 36.45], [22.6, 36.05],
      [23.2, 36.02], [23.55, 36.4], [23.85, 36.95], [24.17, 37.45], [24.17, 37.64], [24.15, 37.82],
      [24.13, 37.97], [24.1, 38.09], [24.12, 38.17], [24.05, 38.25], [23.96, 38.31], [23.83, 38.37],
    ],
    caption: {
      text: {
        tr: 'Onunla birlikte on iki kırmızı yanaklı gemi geliyordu.',
        en: 'And with him followed twelve ships with crimson cheeks.',
      },
      greek: 'τῷ δ᾽ ἅμα νῆες ἕποντο δυώδεκα μιλτοπάρῃοι. — Il. 2.637',
    },
  },
  beats: [
    {
      text: {
        tr: 'Akha krallıkları gemilerini Avlis limanında toplar. Homeros’un <em>Gemiler Kataloğu</em>’na göre tam <strong>1186 gemi</strong>. Başkomutan Mykene kralı Agamemnon’dur.',
        en: 'The Achaean kingdoms gather their ships in the harbour of Aulis: <strong>1,186 ships</strong> in all, by the count of Homer’s <em>Catalogue of Ships</em>. Their commander is Agamemnon, king of Mycenae.',
      },
    },
    {
      text: {
        tr: 'Odysseus genç Akhilleus’u da savaşa kazandırmıştır: annesinin onu kızların arasına sakladığı sarayda tüccar kılığına girip hediyelerin arasına silahlar koyar. Bir borazan çalınca Akhilleus kalkana sarılır ve kimliği ortaya çıkar.',
        en: 'Odysseus has already won the young Achilles for the war. In the palace where his mother had hidden him among the girls, Odysseus came disguised as a merchant and slipped weapons among his gifts. When a trumpet sounded, Achilles seized a shield and gave himself away.',
      },
    },
    {
      text: {
        tr: 'Ama rüzgâr esmez; tanrıça Artemis öfkelidir. Kâhin Kalkhas’a göre tanrıça ancak ağır bir kurbanla, Agamemnon’un kızı İphigeneia’yla yatışacaktır. Filo günlerce kıpırdamadan bekler.',
        en: 'But no wind blows: the goddess Artemis is angry. The seer Calchas says only a terrible sacrifice will appease her — Agamemnon’s daughter Iphigenia. For days the fleet waits without moving.',
      },
      gate: { kind: 'hold', prompt: { tr: 'Rüzgârı bekle: basılı tut.', en: 'Wait for the wind: press and hold.' } },
    },
    {
      text: {
        tr: 'Sonunda rüzgâr döner, yelkenler şişer. Bin gemi Ege’nin karşı kıyısına, Troya’ya doğru yola çıkar.',
        en: 'At last the wind turns and the sails fill. A thousand ships set out across the Aegean, bound for Troy.',
      },
    },
  ],
  load: () => import('../../../scenes/avlis'),
};
