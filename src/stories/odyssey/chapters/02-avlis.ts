import type { Chapter } from '../../../story/types';
import { scene } from '../../../scenes/avlis';

export const avlis: Chapter = {
  id: 'avlis',
  part: 'cagri',
  title: 'Avlis',
  greek: 'ΑΥΛΙΣ',
  place: 'Beotya kıyısı, Eğriboz (Euboia) Boğazı',
  at: [23.6, 38.43],
  harbor: [23.66, 38.39],
  labelSide: 'left',
  year: 1,
  ships: 12,
  zoom: 4,
  reveal: 150,
  arrival: {
    id: 'sail',
    via: [
      [20.86, 38.12], [20.98, 37.62], [21.4, 36.9], [21.95, 36.55], [22.55, 36.27], [23.28, 36.3],
      [23.75, 36.8], [24.2, 37.45], [24.18, 37.8], [23.9, 38.15],
    ],
    caption: {
      tr: 'Onunla birlikte on iki kırmızı yanaklı gemi geliyordu.',
      greek: 'τῷ δ᾽ ἅμα νῆες ἕποντο δυώδεκα μιλτοπάρῃοι. — İlyada 2.637',
    },
  },
  beats: [
    {
      text: 'Akha krallıkları gemilerini Avlis limanında toplar. Homeros’un <em>Gemiler Kataloğu</em>’na göre tam <strong>1186 gemi</strong>. Başkomutan Mykene kralı Agamemnon’dur.',
    },
    {
      text: 'Odysseus genç Akhilleus’u da savaşa kazandırmıştır: annesinin onu kızların arasına sakladığı sarayda tüccar kılığına girip hediyelerin arasına silahlar koyar. Bir borazan çalınca Akhilleus kalkana sarılır ve kimliği ortaya çıkar.',
    },
    {
      text: 'Ama rüzgâr esmez; tanrıça Artemis öfkelidir. Kâhin Kalkhas’a göre tanrıça ancak ağır bir kurbanla, Agamemnon’un kızı İphigeneia’yla yatışacaktır. Filo günlerce kıpırdamadan bekler.',
      gate: { kind: 'hold', prompt: 'Rüzgârı bekle: basılı tut.' },
    },
    {
      text: 'Sonunda rüzgâr döner, yelkenler şişer. Bin gemi Ege’nin karşı kıyısına, Troya’ya doğru yola çıkar.',
    },
  ],
  scene,
};
