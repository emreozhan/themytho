import type { Chapter } from '../../../story/types';

export const kirke: Chapter = {
  id: 'kirke',
  part: 'donus',
  title: { tr: 'Kirke’nin Adası', en: 'Circe’s Island' },
  label: { tr: 'Aiaia', en: 'Aeaea' },
  greek: 'ΚΙΡΚΗ',
  place: { tr: 'Geleneğe göre Circeo Burnu, İtalya', en: 'Traditionally Monte Circeo, Italy' },
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
      text: {
        tr: 'Oradan, yüreğimiz yaslı, daha öteye yelken açtık.',
        en: 'From there we sailed on, grieving at heart.',
      },
      greek: 'ἔνθεν δὲ προτέρω πλέομεν ἀκαχήμενοι ἦτορ — Od. 10.133',
    },
  },
  end: { year: 11 },
  beats: [
    {
      text: {
        tr: 'Aiaia adasında, ormanın ortasında cilalı taştan bir saray yükselir: büyücü tanrıça <strong>Kirke</strong>’nin yurdu. Çevresinde büyüyle evcilleşmiş kurtlar ve aslanlar dolaşır.',
        en: 'On the island of Aeaea, in the middle of the forest, rises a palace of polished stone: the home of the enchantress <strong>Circe</strong>. Wolves and lions, tamed by her spells, prowl around it.',
      },
    },
    {
      text: {
        tr: 'Eurylokhos’un öncü birliği saraya girer. Kirke onlara peynir, arpa unu ve balla karışık bir şarap sunar; içine bir de büyülü ot katmıştır. Sonra değneğiyle dokunur…',
        en: 'Eurylochus’s scouting party enters the palace. Circe offers them wine mixed with cheese, barley meal and honey — and a magic herb besides. Then she touches them with her wand…',
      },
      gate: { kind: 'tap', prompt: { tr: 'Kirke’nin değneğine dokun.', en: 'Touch Circe’s wand.' } },
      quote: {
        greek: 'οἱ δὲ συῶν μὲν ἔχον κεφαλὰς φωνήν τε τρίχας τε / καὶ δέμας, αὐτὰρ νοῦς ἦν ἔμπεδος ὡς τὸ πάρος περ.',
        text: {
          tr: 'Domuz başları, domuz sesleri, kılları ve bedenleri vardı artık; ama akılları eskisi gibi yerindeydi.',
          en: 'They had the heads of swine, and their voices, bristles and bodies; but their minds were as steady as before.',
        },
        ref: { tr: 'Odysseia 10.239–240', en: 'Odyssey 10.239–240' },
      },
    },
    {
      text: {
        tr: 'Yardıma koşan Odysseus’un önüne, altın asalı haberci tanrı <strong>Hermes</strong> çıkar ve ona büyüye karşı koruyan bir ot verir.',
        en: 'As Odysseus hurries to help them, <strong>Hermes</strong>, the messenger god with the golden staff, appears in his path and gives him a herb that protects against the spell.',
      },
      gate: { kind: 'tap', prompt: { tr: 'Moly otunu topraktan çek.', en: 'Pull the moly from the earth.' } },
      quote: {
        greek: 'ῥίζῃ μὲν μέλαν ἔσκε, γάλακτι δὲ εἴκελον ἄνθος· / μῶλυ δέ μιν καλέουσι θεοί',
        text: {
          tr: 'Kökü karaydı, çiçeği süt gibi ak; tanrılar ona moly der.',
          en: 'Its root was black, its flower white as milk; the gods call it moly.',
        },
        ref: { tr: 'Odysseia 10.304–305', en: 'Odyssey 10.304–305' },
      },
      aside: {
        title: { tr: 'Mitin izi · Moly', en: 'Echo of the myth · Moly' },
        text: {
          tr: 'Bazı araştırmacılar moly’nin kardelen olabileceğini öne sürer: kardelende bulunan galantamin, bugün Alzheimer tedavisinde kullanılır ve kimi zehirlerin etkisini tersine çevirebilir.',
          en: 'Some researchers suggest that moly may have been the snowdrop: galantamine, found in snowdrops, is used today to treat Alzheimer’s disease and can reverse the effects of certain poisons.',
        },
      },
    },
    {
      text: {
        tr: 'İksir Odysseus’a işlemez. Kılıcını çeken kahramana boyun eğen Kirke, domuzları yeniden insana çevirir: eskisinden daha genç, daha uzun ve daha yakışıklı.',
        en: 'The potion has no power over Odysseus. When he draws his sword, Circe yields and turns the swine back into men — younger, taller and more handsome than before.',
      },
    },
    {
      text: {
        tr: 'Bir yıl boyunca Kirke’nin sarayında şölenler içinde kalırlar. Sonunda Kirke yolu gösterir: eve dönüşü öğrenmek için Odysseus ölüler diyarına inip kâhin Teiresias’a danışmalıdır.',
        en: 'For a whole year they stay feasting in Circe’s palace. At last Circe shows the way: to learn how to get home, Odysseus must go down to the land of the dead and consult the seer Tiresias.',
      },
    },
  ],
  load: () => import('../../../scenes/kirke'),
};
