import type { Chapter } from '../../../story/types';
import { scene } from '../../../scenes/troya';

export const troya: Chapter = {
  id: 'troya',
  part: 'savas',
  title: 'Troya',
  greek: 'ΤΡΟΙΗ',
  place: 'Çanakkale, Hisarlık Tepesi',
  at: [26.24, 39.96],
  harbor: [26.13, 39.99],
  labelSide: 'right',
  year: 1,
  ships: 12,
  zoom: 4,
  reveal: 170,
  arrival: {
    id: 'sail',
    via: [[23.82, 38.2], [24.3, 37.93], [24.85, 38.1], [25.55, 38.85], [25.85, 39.55]],
    caption: { tr: 'Bin gemi Ege’yi geçip Troya kıyısına çıkar.' },
  },
  end: { year: 10 },
  beats: [
    {
      text: 'Troya (İlion), Çanakkale Boğazı’nın ağzında, bugünkü Hisarlık Tepesi’nde yükselir. Akhalar gemilerini kumsala çeker; ama tanrıların ördüğü söylenen surlar aşılamaz.',
      aside: {
        title: 'Bugün',
        text: 'Troya kalıntıları Çanakkale’deki Troya Ören Yeri’ndedir ve 1998’den beri UNESCO Dünya Mirası listesindedir. Burada üst üste kurulmuş on ayrı yerleşim katmanı bulunur.',
      },
    },
    {
      text: 'Kuşatma yıllarca sürer. Akhilleus ile Hektor gibi kahramanlar surların önünde çarpışır; Odysseus ise sözüyle ve aklıyla savaşır: elçilik yapar, gece keşiflerine çıkar.',
      gate: { kind: 'hold', prompt: 'Yılları geçir: basılı tut.' },
      quote: {
        greek: 'ἔσσεται ἦμαρ ὅτ᾽ ἄν ποτ᾽ ὀλώλῃ Ἴλιος ἱρὴ',
        tr: 'Bir gün gelecek, kutsal İlion yok olacak.',
        ref: 'İlyada 6.448 · Hektor',
      },
    },
    {
      text: 'Onuncu yılda Hektor, Akhilleus’un elinde can verir. Çok geçmeden Akhilleus da Paris’in okuyla vurulur. Kahramanın ünlü zırhı, Aias’la yarışan Odysseus’a verilir.',
      aside: {
        title: 'Mitin izi · Aşil topuğu',
        text: 'Sonraki anlatılara göre annesi Thetis, bebek Akhilleus’u ölümsüz kılmak için Styks ırmağına daldırırken onu topuğundan tutmuştu. “Aşil topuğu” bu yüzden birinin tek zayıf noktası demektir.',
      },
    },
  ],
  scene,
};
