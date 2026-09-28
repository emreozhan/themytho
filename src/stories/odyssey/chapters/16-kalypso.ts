import type { Chapter } from '../../../story/types';

export const kalypso: Chapter = {
  id: 'kalypso',
  part: 'donus',
  title: { tr: 'Kalypso’nun Adası', en: 'Calypso’s Island' },
  label: { tr: 'Ogygia', en: 'Ogygia' },
  greek: 'ΚΑΛΥΨΩ',
  place: { tr: 'Geleneğe göre Gozo, Malta', en: 'Traditionally Gozo, Malta' },
  at: [14.25, 36.05],
  harbor: [14.29, 36.12],
  labelSide: 'left',
  year: 12,
  ships: 0,
  wrath: true,
  zoom: 4.4,
  reveal: 180,
  arrival: {
    id: 'surukleniş',
    via: [[15.6, 38.16], [15.58, 38.12], [15.56, 38.08], [15.545, 38.02], [15.46, 37.7], [15.42, 37.2], [15.33, 36.75], [15.0, 36.45], [14.55, 36.22]],
    style: 'drift',
    vessel: 'wreck',
    duration: 5,
    caption: {
      text: {
        tr: 'Dokuz gün dalgaların üstünde sürüklendim; onuncu gece tanrılar beni Ogygia adasına ulaştırdı.',
        en: 'For nine days I drifted on the waves; on the tenth night the gods brought me to the island of Ogygia.',
      },
      greek: 'ἐννῆμαρ φερόμην, δεκάτῃ δέ με νυκτὶ θεοὶ / νῆσον ἐς Ὠγυγίην πέλασαν — Od. 12.447–448',
    },
  },
  end: { year: 19 },
  beats: [
    {
      text: {
        tr: 'Ogygia ormanlarla örtülü, denizin göbeğinde bir adadır. Mağaranın çevresinde asmalar, serviler, kavaklar, menekşeli çayırlar… Burada güzel saçlı peri <strong>Kalypso</strong> yaşar.',
        en: 'Ogygia is a wooded island at the navel of the sea. Around the cave grow vines, cypresses and poplars, among meadows full of violets… Here lives the fair-haired nymph <strong>Calypso</strong>.',
      },
      aside: {
        title: { tr: 'Mitin izi · Kalypso', en: 'Echo of the myth · Calypso' },
        text: {
          tr: 'Kalypso “gizleyen, örten” demektir (<em>kalyptō</em>: örtmek). Kıyamet anlamında kullanılan “apokalips” de aynı kökten gelir: <em>apokalypsis</em>, örtünün kalkması, açığa çıkma.',
          en: 'Calypso means “she who hides, who covers” (<em>kalyptō</em>: to cover). “Apocalypse” comes from the same root: <em>apokalypsis</em>, the lifting of the veil, a revealing.',
        },
      },
    },
    {
      text: {
        tr: 'Kalypso ona ölümsüzlük ve sonsuz gençlik sunar. Ama Odysseus her gün kıyıda oturup ağlar; gözlerini ürün vermeyen denize diker. Yıllar böyle geçer.',
        en: 'Calypso offers him immortality and eternal youth. But every day Odysseus sits on the shore and weeps, gazing out over the barren sea. So the years go by.',
      },
      gate: { kind: 'hold', prompt: { tr: 'Yılları geçir: basılı tut.', en: 'Let the years pass: press and hold.' } },
      quote: {
        greek: 'ἀλλ᾽ ὅ γ᾽ ἐπ᾽ ἀκτῆς κλαῖε καθήμενος, ἔνθα πάρος περ, / δάκρυσι καὶ στοναχῇσι καὶ ἄλγεσι θυμὸν ἐρέχθων',
        text: {
          tr: 'Kıyıda oturmuş ağlıyordu, her zamanki gibi; yüreğini gözyaşıyla, inlemelerle, acılarla hırpalayarak.',
          en: 'He sat weeping on the shore, as always, racking his heart with tears and groans and griefs.',
        },
        ref: { tr: 'Odysseia 5.82–83', en: 'Odyssey 5.82–83' },
      },
    },
    {
      text: {
        tr: 'Yedinci yılın sonunda Athena, Zeus’a yalvarır. Haberci Hermes gelip Kalypso’ya tanrıların buyruğunu iletir. Kalypso gönülsüzce Odysseus’a bir balta, bir keser verir.',
        en: 'At the end of the seventh year Athena pleads with Zeus. Hermes the messenger comes and gives Calypso the gods’ command. Reluctantly, Calypso gives Odysseus an axe and an adze.',
      },
      gate: { kind: 'tap', prompt: { tr: 'Salı kur: kütüklere dokun.', en: 'Build the raft: touch the logs.' } },
    },
    {
      text: {
        tr: 'Dört günde salını bitirir. Beşinci gün Kalypso’nun verdiği ekmek, şarap ve tatlı bir rüzgârla yola çıkar; geceleri Ülker’e ve Büyükayı’ya bakarak yön bulur.',
        en: 'In four days his raft is finished. On the fifth he sets out with bread and wine from Calypso and a gentle wind; at night he steers by the Pleiades and the Great Bear.',
      },
    },
  ],
  load: () => import('../../../scenes/kalypso'),
};
