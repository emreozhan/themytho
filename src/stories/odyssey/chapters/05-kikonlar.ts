import type { Chapter } from '../../../story/types';
import { scene } from '../../../scenes/kikonlar';

export const kikonlar: Chapter = {
  id: 'kikonlar',
  part: 'donus',
  title: 'Kikonlar',
  label: 'İsmaros',
  greek: 'ΚΙΚΟΝΕΣ',
  place: 'Trakya kıyısı, İsmaros (Maroneia yakınları)',
  at: [25.52, 40.93],
  harbor: [25.53, 40.83],
  labelSide: 'top',
  year: 10,
  ships: 12,
  zoom: 4,
  reveal: 150,
  arrival: {
    id: 'sail',
    via: [[25.95, 40.25], [25.75, 40.6]],
    caption: {
      tr: 'İlion’dan beni taşıyan rüzgâr Kikonlara, İsmaros’a yanaştırdı.',
      greek: 'Ἰλιόθεν με φέρων ἄνεμος Κικόνεσσι πέλασσεν, Ἰσμάρῳ — Od. 9.39–40',
    },
  },
  beats: [
    {
      text: 'Troya’dan ayrılan filoyu rüzgâr Trakya kıyısına, Troya’nın müttefiki <strong>Kikonlar</strong>’ın kenti İsmaros’a getirir. Akhalar kenti yağmalar.',
    },
    {
      text: 'Apollon rahibi <em>Maron</em>, canını bağışladıkları için Odysseus’a on iki testi koyu, tatlı şarap verir: bir ölçüsüne yirmi ölçü su katılsa bile kokusu insanı büyüler. Bu şarap ileride hayat kurtaracaktır.',
      gate: { kind: 'tap', prompt: 'Şarap testisini gemiye yükle.' },
    },
    {
      text: 'Odysseus hemen kaçmalarını ister, ama yoldaşlar kıyıda şölen yapar. Şafakla birlikte içerideki Kikonlar, “ilkbaharın yaprakları kadar” kalabalık, dağdan iner.',
      gate: { kind: 'tap', prompt: 'Yoldaşları gemilere çağır: gemiye dokun.' },
    },
    {
      text: 'Her gemiden altı yoldaş, toplam yetmiş iki kişi, o kıyıda kalır. Kalanlar yeniden denize açılır.',
      quote: {
        greek: 'ἔνθεν δὲ προτέρω πλέομεν ἀκαχήμενοι ἦτορ, / ἄσμενοι ἐκ θανάτοιο, φίλους ὀλέσαντες ἑταίρους.',
        tr: 'Oradan, yüreğimiz yaslı, daha öteye yelken açtık; ölümden kurtulduğumuza sevinerek, sevgili yoldaşlarımızı yitirmiş olarak.',
        ref: 'Odysseia 9.62–63',
      },
    },
  ],
  scene,
};
