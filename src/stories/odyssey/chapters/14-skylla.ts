import type { Chapter } from '../../../story/types';

export const skylla: Chapter = {
  id: 'skylla',
  part: 'donus',
  title: { tr: 'Skylla ile Kharybdis', en: 'Scylla and Charybdis' },
  label: { tr: 'Skylla · Kharybdis', en: 'Scylla · Charybdis' },
  greek: 'ΣΚΥΛΛΑ ΧΑΡΥΒΔΙΣ',
  place: { tr: 'Geleneğe göre Messina Boğazı', en: 'Traditionally the Strait of Messina' },
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
    caption: { text: { tr: 'Önlerinde, iki kayalığın arasında daracık bir geçit vardır.', en: 'Ahead of them lies a narrow passage between two cliffs.' } },
  },
  beats: [
    {
      text: {
        tr: 'Bir yanda, tepesi bulutlara değen kayalığın mağarasında <strong>Skylla</strong> yaşar: on iki ayaklı, altı başlı, her ağzında üç sıra diş olan bir canavar.',
        en: 'On one side, in a cave in a cliff whose peak touches the clouds, lives <strong>Scylla</strong>: a monster with twelve feet and six heads, and three rows of teeth in every mouth.',
      },
    },
    {
      text: {
        tr: 'Öbür yanda, bir ok atımı ötede, <strong>Kharybdis</strong> günde üç kez kara suyu yutup geri kusar. Kirke’nin öğüdü açıktır: Skylla’ya yakın geç; altı adam yitirmek, bütün gemiyi yitirmekten iyidir.',
        en: 'On the other side, a bowshot away, <strong>Charybdis</strong> swallows the black water three times a day and spews it up again. Circe’s advice is plain: keep close to Scylla; better to lose six men than the whole ship.',
      },
      quote: {
        greek: 'τῷ δ᾽ ὑπὸ δῖα Χάρυβδις ἀναρροιβδεῖ μέλαν ὕδωρ. / τρὶς μὲν γάρ τ᾽ ἀνίησιν ἐπ᾽ ἤματι, τρὶς δ᾽ ἀναροιβδεῖ',
        text: {
          tr: 'Onun altında tanrısal Kharybdis kara suyu içine çeker; günde üç kez salıverir, üç kez de yutar.',
          en: 'Beneath it divine Charybdis sucks down the black water; three times a day she spews it up, and three times she swallows it.',
        },
        ref: { tr: 'Odysseia 12.104–105', en: 'Odyssey 12.104–105' },
      },
    },
    {
      text: {
        tr: 'Dümen artık sende.',
        en: 'The helm is yours now.',
      },
      gate: { kind: 'drag', prompt: { tr: 'Gemiyi Skylla’nın kayalığına yakın tutarak boğazdan geçir.', en: 'Steer the ship through the strait, keeping close to Scylla’s cliff.' } },
    },
    {
      text: {
        tr: 'Herkes korkuyla Kharybdis’in girdabına bakarken Skylla’nın altı başı birden iner ve altı yoldaşı kapar. Odysseus’un denizlerde gördüğü en acıklı manzaradır bu.',
        en: 'While everyone stares in terror at the whirlpool of Charybdis, Scylla’s six heads strike all at once and snatch six companions. It is the most pitiful sight Odysseus has seen on all the seas.',
      },
      aside: {
        title: { tr: 'Mitin izi · İki ateş arasında', en: 'Echo of the myth · A rock and a hard place' },
        text: {
          tr: '“Skylla ile Kharybdis arasında” deyimi, iki tehlike arasında sıkışıp kalmayı anlatır; Türkçedeki “iki ateş arasında kalmak” gibi. Messina Boğazı’nın akıntıları ve girdapları bugün de ünlüdür.',
          en: 'The phrase “between Scylla and Charybdis” means being caught between two dangers, much like “between a rock and a hard place”. The currents and whirlpools of the Strait of Messina are still famous today.',
        },
      },
    },
  ],
  load: () => import('../../../scenes/skylla'),
};
