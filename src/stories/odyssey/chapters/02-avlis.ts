import type { Chapter } from '../../../story/types';
import { scene } from '../../../scenes/avlis';

export const avlis: Chapter = {
  id: 'avlis',
  part: 'cagri',
  title: 'Avlis',
  greek: 'ΑΥΛΙΣ',
  place: 'Beotya kıyısı, Eğriboz (Euboia) Boğazı',
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
