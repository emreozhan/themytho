import type { Chapter } from '../../../story/types';
import { scene } from '../../../scenes/kalypso';

export const kalypso: Chapter = {
  id: 'kalypso',
  part: 'donus',
  title: 'Kalypso’nun Adası',
  label: 'Ogygia',
  greek: 'ΚΑΛΥΨΩ',
  place: 'Geleneğe göre Gozo, Malta',
  at: [14.25, 36.05],
  harbor: [14.28, 36.1],
  labelSide: 'left',
  year: 12,
  ships: 0,
  wrath: true,
  zoom: 4.4,
  reveal: 180,
  arrival: {
    id: 'surukleniş',
    via: [[15.35, 37.55], [15.05, 36.85], [14.55, 36.3]],
    style: 'drift',
    vessel: 'wreck',
    duration: 5,
    caption: {
      tr: 'Dokuz gün dalgaların üstünde sürüklendim; onuncu gece tanrılar beni Ogygia adasına ulaştırdı.',
      greek: 'ἐννῆμαρ φερόμην, δεκάτῃ δέ με νυκτὶ θεοὶ / νῆσον ἐς Ὠγυγίην πέλασαν — Od. 12.447–448',
    },
  },
  end: { year: 19 },
  beats: [
    {
      text: 'Ogygia ormanlarla örtülü, denizin göbeğinde bir adadır. Mağaranın çevresinde asmalar, serviler, kavaklar, menekşeli çayırlar… Burada güzel saçlı peri <strong>Kalypso</strong> yaşar.',
      aside: {
        title: 'Mitin izi · Kalypso',
        text: 'Kalypso “gizleyen, örten” demektir (<em>kalyptō</em>: örtmek). Kıyamet anlamında kullanılan “apokalips” de aynı kökten gelir: <em>apokalypsis</em>, örtünün kalkması, açığa çıkma.',
      },
    },
    {
      text: 'Kalypso ona ölümsüzlük ve sonsuz gençlik sunar. Ama Odysseus her gün kıyıda oturup ağlar; gözlerini ürün vermeyen denize diker. Yıllar böyle geçer.',
      gate: { kind: 'hold', prompt: 'Yılları geçir: basılı tut.' },
      quote: {
        greek: 'ἀλλ᾽ ὅ γ᾽ ἐπ᾽ ἀκτῆς κλαῖε καθήμενος, ἔνθα πάρος περ, / δάκρυσι καὶ στοναχῇσι καὶ ἄλγεσι θυμὸν ἐρέχθων',
        tr: 'Kıyıda oturmuş ağlıyordu, her zamanki gibi; yüreğini gözyaşıyla, inlemelerle, acılarla hırpalayarak.',
        ref: 'Odysseia 5.82–83',
      },
    },
    {
      text: 'Yedinci yılın sonunda Athena, Zeus’a yalvarır. Haberci Hermes gelip Kalypso’ya tanrıların buyruğunu iletir. Kalypso gönülsüzce Odysseus’a bir balta, bir keser verir.',
      gate: { kind: 'tap', prompt: 'Salı kur: kütüklere dokun.' },
    },
    {
      text: 'Dört günde salını bitirir. Beşinci gün Kalypso’nun verdiği ekmek, şarap ve tatlı bir rüzgârla yola çıkar; geceleri Ülker’e ve Büyükayı’ya bakarak yön bulur.',
    },
  ],
  scene,
};
