import type { Chapter } from '../../../story/types';

export const sirenler: Chapter = {
  id: 'sirenler',
  part: 'donus',
  title: { tr: 'Sirenler', en: 'The Sirens' },
  greek: 'ΣΕΙΡΗΝΕΣ',
  place: { tr: 'Geleneğe göre Li Galli (Sirenuse) adacıkları, Amalfi kıyısı', en: 'Traditionally the Li Galli islets (the Sirenuse), off the Amalfi coast' },
  at: [14.43, 40.58],
  harbor: [14.36, 40.5],
  labelSide: 'right',
  year: 11,
  ships: 1,
  wrath: true,
  zoom: 4.4,
  reveal: 170,
  arrival: {
    id: 'sail',
    via: [[14.07, 40.76], [13.86, 40.84], [13.6, 40.99], [13.15, 41.14], [13.55, 40.78], [14.1, 40.5]],
    vessel: 'ship',
    caption: { text: { tr: 'Önce Kirke’nin adasına dönüp ölen yoldaşları Elpenor’u gömerler. Kirke önlerindeki tehlikeleri tek tek anlatır.', en: 'First they return to Circe’s island to bury their dead companion Elpenor. Circe tells them, one by one, of the dangers ahead.' } },
  },
  beats: [
    {
      text: {
        tr: 'Kirke uyarmıştır: Sirenlerin sesini duyan hiçbir denizci eve dönmez; çayırlarında çürüyen insan kemikleri yığılıdır. Yunan vazolarında Sirenler denizkızı değil, <em>kadın başlı kuşlar</em> olarak çizilir.',
        en: 'Circe has warned them: no sailor who hears the voices of the Sirens ever returns home; their meadow is heaped with the bones of rotting men. On Greek vases the Sirens are painted not as mermaids but as <em>birds with women’s heads</em>.',
      },
    },
    {
      text: {
        tr: 'Odysseus bir balmumu kalıbını kılıcıyla keser, güneşte yumuşatır ve yoldaşlarının kulaklarını tek tek tıkar.',
        en: 'Odysseus cuts a cake of beeswax with his sword, softens it in the sun and stops his companions’ ears, one by one.',
      },
      gate: { kind: 'tap', prompt: { tr: 'Her kürekçinin kulağını balmumuyla tıka.', en: 'Stop each rower’s ears with wax.' } },
    },
    {
      text: {
        tr: 'Kendisi ise şarkıyı duymak ister. Yoldaşları onu direğin dibine, ayakta, sıkıca bağlar.',
        en: 'He himself wants to hear the song. His companions bind him tight, standing upright against the mast.',
      },
      gate: { kind: 'tap', prompt: { tr: 'Odysseus’u direğe bağla.', en: 'Bind Odysseus to the mast.' } },
    },
    {
      text: {
        tr: 'Sirenler şarkıya başlar: Troya’da olan her şeyi, yeryüzünde olacak her şeyi bildiklerini söylerler.',
        en: 'The Sirens begin to sing: they say they know everything that happened at Troy, and everything that will happen on the earth.',
      },
      gate: { kind: 'hold', prompt: { tr: 'Şarkıya dayan: basılı tut.', en: 'Resist the song: press and hold.' } },
      quote: {
        greek: 'δεῦρ᾽ ἄγ᾽ ἰών, πολύαιν᾽ Ὀδυσεῦ, μέγα κῦδος Ἀχαιῶν, / νῆα κατάστησον, ἵνα νωϊτέρην ὄπ᾽ ἀκούσῃς.',
        text: {
          tr: 'Gel buraya, çok övülen Odysseus, Akhaların büyük onuru; durdur gemini de dinle sesimizi.',
          en: 'Come here, far-famed Odysseus, great glory of the Achaeans; stop your ship and listen to our voice.',
        },
        ref: { tr: 'Odysseia 12.184–185', en: 'Odyssey 12.184–185' },
      },
    },
    {
      text: {
        tr: 'Odysseus çözülmek için yalvarır, kaşlarıyla işaret eder; ama yoldaşları ipleri daha da sıkar ve küreğe asılır. Şarkı uzakta söner.',
        en: 'Odysseus begs to be untied, signalling with his brows, but his companions pull the ropes tighter and bend to their oars. The song fades away behind them.',
      },
      aside: {
        title: { tr: 'Mitin izi · Siren', en: 'Echo of the myth · Siren' },
        text: {
          tr: 'Uzaklara ulaşan uyarı sesi çıkaran aygıta 1819’da mucidi Cagniard de la Tour “siren” adını verdi: aygıt su altında da ses çıkarabiliyordu, tıpkı denizin efsanevi şarkıcıları gibi.',
          en: 'In 1819 its inventor, Cagniard de la Tour, named his far-reaching warning device the “siren”: it could sound even under water, like the legendary singers of the sea.',
        },
      },
    },
  ],
  load: () => import('../../../scenes/sirenler'),
};
