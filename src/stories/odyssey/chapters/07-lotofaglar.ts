import type { Chapter } from '../../../story/types';

export const lotofaglar: Chapter = {
  id: 'lotofaglar',
  part: 'donus',
  title: { tr: 'Lotos Yiyenler', en: 'The Lotus-Eaters' },
  label: { tr: 'Lotofaglar', en: 'Lotus-Eaters' },
  greek: 'ΛΩΤΟΦΑΓΟΙ',
  place: { tr: 'Geleneğe göre Cerbe (Djerba) adası, Tunus', en: 'Traditionally the island of Djerba, Tunisia' },
  at: [10.86, 33.8],
  harbor: [11.08, 33.93],
  labelSide: 'right',
  year: 10,
  ships: 12,
  zoom: 3.8,
  reveal: 240,
  arrival: {
    id: 'storm',
    via: [[23.28, 36.12], [22.7, 35.92], [20.2, 35.25], [16.4, 34.35], [12.8, 34.05]],
    style: 'storm',
    duration: 6,
    caption: {
      text: {
        tr: 'Oradan dokuz gün boyunca uğursuz rüzgârlarla sürüklendim balık dolu denizde.',
        en: 'From there for nine days I was swept by baneful winds over the teeming sea.',
      },
      greek: 'ἔνθεν δ᾽ ἐννῆμαρ φερόμην ὀλοοῖσ᾽ ἀνέμοισιν / πόντον ἐπ᾽ ἰχθυόεντα — Od. 9.82–83',
    },
  },
  beats: [
    {
      text: {
        tr: 'Onuncu gün, lotos meyvesiyle beslenen barışçıl bir halkın kıyısına varırlar. Gelenek burayı bugünkü Tunus’taki Cerbe (Djerba) adası sayar.',
        en: 'On the tenth day they reach the shore of a peaceful people who live on the fruit of the lotus. Tradition places it on the island of Djerba, in today’s Tunisia.',
      },
    },
    {
      text: {
        tr: 'Odysseus’un gönderdiği keşifçiler lotosun bal tadındaki meyvesini tadar ve her şeyi unutur: yurtlarını, dönüşü, arkadaşlarını. Artık yalnızca orada kalıp lotos yemek isterler.',
        en: 'The scouts Odysseus sends taste the honey-sweet fruit of the lotus and forget everything: their homeland, the voyage home, their friends. Now they want only to stay there and eat lotus.',
      },
      gate: { kind: 'tap', prompt: { tr: 'Uyuşmuş keşifçileri gemiye geri çek: her birine dokun.', en: 'Pull the dazed scouts back to the ship: touch each one.' } },
      quote: {
        greek: 'τῶν δ᾽ ὅς τις λωτοῖο φάγοι μελιηδέα καρπόν, / οὐκέτ᾽ ἀπαγγεῖλαι πάλιν ἤθελεν οὐδὲ νέεσθαι',
        text: {
          tr: 'Lotosun bal tatlı meyvesinden kim yediyse, ne haber getirmek istedi artık ne de geri dönmek.',
          en: 'Whoever ate the honey-sweet fruit of the lotus no longer wished to bring back word, nor to return.',
        },
        ref: { tr: 'Odysseia 9.94–95', en: 'Odyssey 9.94–95' },
      },
    },
    {
      text: {
        tr: 'Odysseus ağlayan adamlarını zorla gemilere taşır, kürek sıralarının altına bağlar ve başka kimse lotos tatmasın diye hemen yola çıkar.',
        en: 'Odysseus drags his weeping men back to the ships by force, ties them beneath the rowing benches and sets sail at once, so that no one else will taste the lotus.',
      },
      aside: {
        title: { tr: 'Mitin izi · Unutuşun meyvesi', en: 'Echo of the myth · The fruit of forgetting' },
        text: {
          tr: '“Lotos yiyenler”, geçmişini ve sorumluluklarını unutup tatlı bir uyuşukluğa gömülenler için bir benzetmedir. Homeros’un lotosunun hangi bitki olduğu bilinmez; en sık öne sürülen aday bir tür hünnaptır (<em>Ziziphus lotus</em>).',
          en: '“Lotus-eaters” is a figure for people who forget their past and their duties and sink into a sweet torpor. No one knows which plant Homer’s lotus was; the most frequent candidate is a kind of jujube (<em>Ziziphus lotus</em>).',
        },
      },
    },
  ],
  load: () => import('../../../scenes/lotofaglar'),
};
