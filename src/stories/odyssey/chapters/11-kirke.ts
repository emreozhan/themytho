import type { Chapter } from '../../../story/types';
import { scene } from '../../../scenes/kirke';

export const kirke: Chapter = {
  id: 'kirke',
  part: 'donus',
  title: 'Kirke’nin Adası',
  label: 'Aiaia',
  greek: 'ΚΙΡΚΗ',
  place: 'Geleneğe göre Circeo Burnu, İtalya',
  at: [13.05, 41.24],
  harbor: [13.02, 41.19],
  labelSide: 'top',
  year: 10,
  ships: 1,
  wrath: true,
  zoom: 4.2,
  reveal: 200,
  arrival: {
    id: 'sail',
    via: [[10.2, 41.3], [11.6, 41.1]],
    vessel: 'ship',
    caption: {
      tr: 'Oradan, yüreğimiz yaslı, daha öteye yelken açtık.',
      greek: 'ἔνθεν δὲ προτέρω πλέομεν ἀκαχήμενοι ἦτορ — Od. 10.133',
    },
  },
  end: { year: 11 },
  beats: [
    {
      text: 'Aiaia adasında, ormanın ortasında cilalı taştan bir saray yükselir: büyücü tanrıça <strong>Kirke</strong>’nin yurdu. Çevresinde büyüyle evcilleşmiş kurtlar ve aslanlar dolaşır.',
    },
    {
      text: 'Eurylokhos’un öncü birliği saraya girer. Kirke onlara peynir, arpa unu ve balla karışık bir şarap sunar; içine bir de büyülü ot katmıştır. Sonra değneğiyle dokunur…',
      gate: { kind: 'tap', prompt: 'Kirke’nin değneğine dokun.' },
      quote: {
        greek: 'οἱ δὲ συῶν μὲν ἔχον κεφαλὰς φωνήν τε τρίχας τε / καὶ δέμας, αὐτὰρ νοῦς ἦν ἔμπεδος ὡς τὸ πάρος περ.',
        tr: 'Domuz başları, domuz sesleri, kılları ve bedenleri vardı artık; ama akılları eskisi gibi yerindeydi.',
        ref: 'Odysseia 10.239–240',
      },
    },
    {
      text: 'Yardıma koşan Odysseus’un önüne, altın asalı haberci tanrı <strong>Hermes</strong> çıkar ve ona büyüye karşı koruyan bir ot verir.',
      gate: { kind: 'tap', prompt: 'Moly otunu topraktan çek.' },
      quote: {
        greek: 'ῥίζῃ μὲν μέλαν ἔσκε, γάλακτι δὲ εἴκελον ἄνθος· / μῶλυ δέ μιν καλέουσι θεοί',
        tr: 'Kökü karaydı, çiçeği süt gibi ak; tanrılar ona moly der.',
        ref: 'Odysseia 10.304–305',
      },
      aside: {
        title: 'Mitin izi · Moly',
        text: 'Bazı araştırmacılar moly’nin kardelen olabileceğini öne sürer: kardelende bulunan galantamin, bugün Alzheimer tedavisinde kullanılır ve kimi zehirlerin etkisini tersine çevirebilir.',
      },
    },
    {
      text: 'İksir Odysseus’a işlemez. Kılıcını çeken kahramana boyun eğen Kirke, domuzları yeniden insana çevirir: eskisinden daha genç, daha uzun ve daha yakışıklı.',
    },
    {
      text: 'Bir yıl boyunca Kirke’nin sarayında şölenler içinde kalırlar. Sonunda Kirke yolu gösterir: eve dönüşü öğrenmek için Odysseus ölüler diyarına inip kâhin Teiresias’a danışmalıdır.',
    },
  ],
  scene,
};
