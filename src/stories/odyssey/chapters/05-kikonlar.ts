import type { Chapter } from '../../../story/types';

export const kikonlar: Chapter = {
  id: 'kikonlar',
  part: 'donus',
  title: { tr: 'Kikonlar', en: 'The Cicones' },
  label: { tr: 'İsmaros', en: 'Ismarus' },
  greek: 'ΚΙΚΟΝΕΣ',
  place: { tr: 'Trakya kıyısı, İsmaros (Maroneia yakınları)', en: 'The coast of Thrace: Ismarus, near Maroneia' },
  at: [25.52, 40.93],
  harbor: [25.53, 40.83],
  labelSide: 'top',
  year: 10,
  ships: 12,
  zoom: 4,
  reveal: 150,
  arrival: {
    id: 'sail',
    via: [[26.1, 40.08], [26.06, 40.28], [25.85, 40.56], [25.62, 40.73]],
    caption: {
      text: {
        tr: 'İlion’dan beni taşıyan rüzgâr Kikonlara, İsmaros’a yanaştırdı.',
        en: 'The wind that bore me from Ilion brought me to the Cicones, to Ismarus.',
      },
      greek: 'Ἰλιόθεν με φέρων ἄνεμος Κικόνεσσι πέλασσεν, Ἰσμάρῳ — Od. 9.39–40',
    },
  },
  beats: [
    {
      text: {
        tr: 'Troya’dan ayrılan filoyu rüzgâr Trakya kıyısına, Troya’nın müttefiki <strong>Kikonlar</strong>’ın kenti İsmaros’a getirir. Akhalar kenti yağmalar.',
        en: 'Leaving Troy, the fleet is carried by the wind to the coast of Thrace, to Ismarus, city of the <strong>Cicones</strong>, allies of Troy. The Achaeans sack the city.',
      },
    },
    {
      text: {
        tr: 'Apollon rahibi <em>Maron</em>, canını bağışladıkları için Odysseus’a on iki testi koyu, tatlı şarap verir: bir ölçüsüne yirmi ölçü su katılsa bile kokusu insanı büyüler. Bu şarap ileride hayat kurtaracaktır.',
        en: '<em>Maron</em>, a priest of Apollo whose life they spared, gives Odysseus twelve jars of dark, sweet wine: even mixed with twenty measures of water, its scent is bewitching. One day this wine will save lives.',
      },
      gate: { kind: 'tap', prompt: { tr: 'Şarap testisini gemiye yükle.', en: 'Load the wine jar onto the ship.' } },
    },
    {
      text: {
        tr: 'Odysseus hemen kaçmalarını ister, ama yoldaşlar kıyıda şölen yapar. Şafakla birlikte içerideki Kikonlar, “ilkbaharın yaprakları kadar” kalabalık, dağdan iner.',
        en: 'Odysseus wants to flee at once, but his companions feast on the shore. At dawn the Cicones of the interior come down from the hills, “as many as the leaves in spring”.',
      },
      gate: { kind: 'tap', prompt: { tr: 'Yoldaşları gemilere çağır: gemiye dokun.', en: 'Call the companions to the ships: touch the ship.' } },
    },
    {
      text: {
        tr: 'Her gemiden altı yoldaş, toplam yetmiş iki kişi, o kıyıda kalır. Kalanlar yeniden denize açılır.',
        en: 'Six companions from each ship, seventy-two men in all, remain on that shore. The rest put to sea again.',
      },
      quote: {
        greek: 'ἔνθεν δὲ προτέρω πλέομεν ἀκαχήμενοι ἦτορ, / ἄσμενοι ἐκ θανάτοιο, φίλους ὀλέσαντες ἑταίρους.',
        text: {
          tr: 'Oradan, yüreğimiz yaslı, daha öteye yelken açtık; ölümden kurtulduğumuza sevinerek, sevgili yoldaşlarımızı yitirmiş olarak.',
          en: 'From there we sailed on, grieving at heart, glad to have escaped death, but having lost our dear companions.',
        },
        ref: { tr: 'Odysseia 9.62–63', en: 'Odyssey 9.62–63' },
      },
    },
  ],
  load: () => import('../../../scenes/kikonlar'),
};
