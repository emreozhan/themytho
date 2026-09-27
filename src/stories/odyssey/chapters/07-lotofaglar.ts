import type { Chapter } from '../../../story/types';
import { scene } from '../../../scenes/lotofaglar';

export const lotofaglar: Chapter = {
  id: 'lotofaglar',
  part: 'donus',
  title: 'Lotos Yiyenler',
  label: 'Lotofaglar',
  greek: 'ΛΩΤΟΦΑΓΟΙ',
  place: 'Geleneğe göre Cerbe (Djerba) adası, Tunus',
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
      tr: 'Oradan dokuz gün boyunca uğursuz rüzgârlarla sürüklendim balık dolu denizde.',
      greek: 'ἔνθεν δ᾽ ἐννῆμαρ φερόμην ὀλοοῖσ᾽ ἀνέμοισιν / πόντον ἐπ᾽ ἰχθυόεντα — Od. 9.82–83',
    },
  },
  beats: [
    {
      text: 'Onuncu gün, lotos meyvesiyle beslenen barışçıl bir halkın kıyısına varırlar. Gelenek burayı bugünkü Tunus’taki Cerbe (Djerba) adası sayar.',
    },
    {
      text: 'Odysseus’un gönderdiği keşifçiler lotosun bal tadındaki meyvesini tadar ve her şeyi unutur: yurtlarını, dönüşü, arkadaşlarını. Artık yalnızca orada kalıp lotos yemek isterler.',
      gate: { kind: 'tap', prompt: 'Uyuşmuş keşifçileri gemiye geri çek: her birine dokun.' },
      quote: {
        greek: 'τῶν δ᾽ ὅς τις λωτοῖο φάγοι μελιηδέα καρπόν, / οὐκέτ᾽ ἀπαγγεῖλαι πάλιν ἤθελεν οὐδὲ νέεσθαι',
        tr: 'Lotosun bal tatlı meyvesinden kim yediyse, ne haber getirmek istedi artık ne de geri dönmek.',
        ref: 'Odysseia 9.94–95',
      },
    },
    {
      text: 'Odysseus ağlayan adamlarını zorla gemilere taşır, kürek sıralarının altına bağlar ve başka kimse lotos tatmasın diye hemen yola çıkar.',
      aside: {
        title: 'Mitin izi · Unutuşun meyvesi',
        text: '“Lotos yiyenler”, geçmişini ve sorumluluklarını unutup tatlı bir uyuşukluğa gömülenler için bir benzetmedir. Homeros’un lotosunun hangi bitki olduğu bilinmez; en sık öne sürülen aday bir tür hünnaptır (<em>Ziziphus lotus</em>).',
      },
    },
  ],
  scene,
};
