import type { Chapter } from '../../../story/types';
import { scene } from '../../../scenes/sirenler';

export const sirenler: Chapter = {
  id: 'sirenler',
  part: 'donus',
  title: 'Sirenler',
  greek: 'ΣΕΙΡΗΝΕΣ',
  place: 'Geleneğe göre Li Galli (Sirenuse) adacıkları, Amalfi kıyısı',
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
    caption: { tr: 'Önce Kirke’nin adasına dönüp ölen yoldaşları Elpenor’u gömerler. Kirke önlerindeki tehlikeleri tek tek anlatır.' },
  },
  beats: [
    {
      text: 'Kirke uyarmıştır: Sirenlerin sesini duyan hiçbir denizci eve dönmez; çayırlarında çürüyen insan kemikleri yığılıdır. Yunan vazolarında Sirenler denizkızı değil, <em>kadın başlı kuşlar</em> olarak çizilir.',
    },
    {
      text: 'Odysseus bir balmumu kalıbını kılıcıyla keser, güneşte yumuşatır ve yoldaşlarının kulaklarını tek tek tıkar.',
      gate: { kind: 'tap', prompt: 'Her kürekçinin kulağını balmumuyla tıka.' },
    },
    {
      text: 'Kendisi ise şarkıyı duymak ister. Yoldaşları onu direğin dibine, ayakta, sıkıca bağlar.',
      gate: { kind: 'tap', prompt: 'Odysseus’u direğe bağla.' },
    },
    {
      text: 'Sirenler şarkıya başlar: Troya’da olan her şeyi, yeryüzünde olacak her şeyi bildiklerini söylerler.',
      gate: { kind: 'hold', prompt: 'Şarkıya dayan: basılı tut.' },
      quote: {
        greek: 'δεῦρ᾽ ἄγ᾽ ἰών, πολύαιν᾽ Ὀδυσεῦ, μέγα κῦδος Ἀχαιῶν, / νῆα κατάστησον, ἵνα νωϊτέρην ὄπ᾽ ἀκούσῃς.',
        tr: 'Gel buraya, çok övülen Odysseus, Akhaların büyük onuru; durdur gemini de dinle sesimizi.',
        ref: 'Odysseia 12.184–185',
      },
    },
    {
      text: 'Odysseus çözülmek için yalvarır, kaşlarıyla işaret eder; ama yoldaşları ipleri daha da sıkar ve küreğe asılır. Şarkı uzakta söner.',
      aside: {
        title: 'Mitin izi · Siren',
        text: 'Uzaklara ulaşan uyarı sesi çıkaran aygıta 1819’da mucidi Cagniard de la Tour “siren” adını verdi: aygıt su altında da ses çıkarabiliyordu, tıpkı denizin efsanevi şarkıcıları gibi.',
      },
    },
  ],
  scene,
};
