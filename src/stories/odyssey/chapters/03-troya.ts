import type { Chapter } from '../../../story/types';

export const troya: Chapter = {
  id: 'troya',
  part: 'savas',
  title: { tr: 'Troya', en: 'Troy' },
  greek: 'ΤΡΟΙΗ',
  place: { tr: 'Çanakkale, Hisarlık Tepesi', en: 'The mound of Hisarlık, near Çanakkale' },
  at: [26.24, 39.96],
  harbor: [26.13, 39.99],
  labelSide: 'right',
  year: 1,
  ships: 12,
  zoom: 4,
  reveal: 170,
  arrival: {
    id: 'sail',
    via: [[23.83, 38.37], [23.96, 38.31], [24.05, 38.25], [24.12, 38.17], [24.1, 38.08], [24.14, 37.96], [24.45, 37.93], [24.63, 38.0], [24.7, 38.12], [24.92, 38.32], [25.35, 38.9], [25.75, 39.5], [25.9, 39.75], [25.98, 39.93]],
    caption: { text: { tr: 'Bin gemi Ege’yi geçip Troya kıyısına çıkar.', en: 'A thousand ships cross the Aegean and land on the shore of Troy.' } },
  },
  end: { year: 10 },
  beats: [
    {
      text: {
        tr: 'Troya (İlion), Çanakkale Boğazı’nın ağzında, bugünkü Hisarlık Tepesi’nde yükselir. Akhalar gemilerini kumsala çeker; ama tanrıların ördüğü söylenen surlar aşılamaz.',
        en: 'Troy (Ilion) rises at the mouth of the Dardanelles, on today’s mound of Hisarlık. The Achaeans draw their ships up on the beach, but the walls, said to have been built by gods, cannot be breached.',
      },
      aside: {
        title: { tr: 'Bugün', en: 'Today' },
        text: {
          tr: 'Troya kalıntıları Çanakkale’deki Troya Ören Yeri’ndedir ve 1998’den beri UNESCO Dünya Mirası listesindedir. Burada üst üste kurulmuş on ayrı yerleşim katmanı bulunur.',
          en: 'The ruins of Troy lie at the archaeological site near Çanakkale, on UNESCO’s World Heritage List since 1998. Ten separate settlements were built there, one on top of another.',
        },
      },
    },
    {
      text: {
        tr: 'Kuşatma yıllarca sürer. Akhilleus ile Hektor gibi kahramanlar surların önünde çarpışır; Odysseus ise sözüyle ve aklıyla savaşır: elçilik yapar, gece keşiflerine çıkar.',
        en: 'The siege drags on for years. Heroes like Achilles and Hector clash before the walls, while Odysseus fights with words and wits: he goes as an envoy and scouts by night.',
      },
      gate: { kind: 'hold', prompt: { tr: 'Yılları geçir: basılı tut.', en: 'Let the years pass: press and hold.' } },
      quote: {
        greek: 'ἔσσεται ἦμαρ ὅτ᾽ ἄν ποτ᾽ ὀλώλῃ Ἴλιος ἱρὴ',
        text: {
          tr: 'Bir gün gelecek, kutsal İlion yok olacak.',
          en: 'A day will come when holy Ilion shall perish.',
        },
        ref: { tr: 'İlyada 6.448 · Hektor', en: 'Iliad 6.448 · Hector' },
      },
    },
    {
      text: {
        tr: 'Onuncu yılda Hektor, Akhilleus’un elinde can verir. Çok geçmeden Akhilleus da Paris’in okuyla vurulur. Kahramanın ünlü zırhı, Aias’la yarışan Odysseus’a verilir.',
        en: 'In the tenth year Hector dies at the hands of Achilles. Soon after, Achilles himself falls to an arrow from Paris. The hero’s famous armour is awarded to Odysseus over his rival Ajax.',
      },
      aside: {
        title: { tr: 'Mitin izi · Aşil topuğu', en: 'Echo of the myth · Achilles’ heel' },
        text: {
          tr: 'Sonraki anlatılara göre annesi Thetis, bebek Akhilleus’u ölümsüz kılmak için Styks ırmağına daldırırken onu topuğundan tutmuştu. “Aşil topuğu” bu yüzden birinin tek zayıf noktası demektir.',
          en: 'In later tellings his mother Thetis dipped the infant Achilles in the river Styx to make him immortal, holding him by the heel. That is why a person’s one weak spot is called an “Achilles’ heel”.',
        },
      },
    },
  ],
  load: () => import('../../../scenes/troya'),
};
