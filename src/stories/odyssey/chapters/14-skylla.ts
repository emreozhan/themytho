import type { Chapter } from '../../../story/types';
import { scene } from '../../../scenes/skylla';

export const skylla: Chapter = {
  id: 'skylla',
  part: 'donus',
  title: 'Skylla ile Kharybdis',
  label: 'Skylla · Kharybdis',
  greek: 'ΣΚΥΛΛΑ ΧΑΡΥΒΔΙΣ',
  place: 'Geleneğe göre Messina Boğazı',
  at: [15.64, 38.26],
  harbor: [15.605, 38.2],
  labelSide: 'right',
  year: 11,
  ships: 1,
  wrath: true,
  zoom: 4.8,
  reveal: 150,
  arrival: {
    id: 'sail',
    via: [[14.85, 40.15], [15.45, 39.4], [15.62, 38.75], [15.72, 38.42], [15.68, 38.31], [15.66, 38.26], [15.625, 38.23]],
    vessel: 'ship',
    caption: { tr: 'Önlerinde, iki kayalığın arasında daracık bir geçit vardır.' },
  },
  beats: [
    {
      text: 'Bir yanda, tepesi bulutlara değen kayalığın mağarasında <strong>Skylla</strong> yaşar: on iki ayaklı, altı başlı, her ağzında üç sıra diş olan bir canavar.',
    },
    {
      text: 'Öbür yanda, bir ok atımı ötede, <strong>Kharybdis</strong> günde üç kez kara suyu yutup geri kusar. Kirke’nin öğüdü açıktır: Skylla’ya yakın geç; altı adam yitirmek, bütün gemiyi yitirmekten iyidir.',
      quote: {
        greek: 'τῷ δ᾽ ὑπὸ δῖα Χάρυβδις ἀναρροιβδεῖ μέλαν ὕδωρ. / τρὶς μὲν γάρ τ᾽ ἀνίησιν ἐπ᾽ ἤματι, τρὶς δ᾽ ἀναροιβδεῖ',
        tr: 'Onun altında tanrısal Kharybdis kara suyu içine çeker; günde üç kez salıverir, üç kez de yutar.',
        ref: 'Odysseia 12.104–105',
      },
    },
    {
      text: 'Dümen artık sende.',
      gate: { kind: 'drag', prompt: 'Gemiyi Skylla’nın kayalığına yakın tutarak boğazdan geçir.' },
    },
    {
      text: 'Herkes korkuyla Kharybdis’in girdabına bakarken Skylla’nın altı başı birden iner ve altı yoldaşı kapar. Odysseus’un denizlerde gördüğü en acıklı manzaradır bu.',
      aside: {
        title: 'Mitin izi · İki ateş arasında',
        text: '“Skylla ile Kharybdis arasında” deyimi, iki tehlike arasında sıkışıp kalmayı anlatır; Türkçedeki “iki ateş arasında kalmak” gibi. Messina Boğazı’nın akıntıları ve girdapları bugün de ünlüdür.',
      },
    },
  ],
  scene,
};
