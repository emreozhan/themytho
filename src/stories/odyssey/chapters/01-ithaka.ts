import type { Chapter } from '../../../story/types';
import { scene } from '../../../scenes/ithaka';

export const ithaka: Chapter = {
  id: 'ithaka',
  part: 'cagri',
  title: 'İthaka',
  greek: 'ΙΘΑΚΗ',
  place: 'İyon Denizi’nde küçük, kayalık bir ada',
  at: [20.67, 38.4],
  harbor: [20.79, 38.33],
  labelSide: 'right',
  year: 1,
  ships: 12,
  zoom: 4.6,
  reveal: 150,
  beats: [
    {
      text: 'Batı denizinin kayalık adası İthaka’nın kralı <strong>Odysseus</strong>, Laertes’in oğludur. Karısı Penelopeia’yla yeni doğmuş oğulları <em>Telemakhos</em>’u büyütür. Akhaların en kurnazı, sözü en tatlı olanıdır.',
      quote: {
        greek: 'τρηχεῖ᾽, ἀλλ᾽ ἀγαθὴ κουροτρόφος· οὔ τοι ἐγώ γε / ἧς γαίης δύναμαι γλυκερώτερον ἄλλο ἰδέσθαι.',
        tr: 'Engebelidir ama iyi yiğitler yetiştirir; insanın kendi toprağından daha tatlı bir şey göremem ben.',
        ref: 'Odysseia 9.27–28',
      },
    },
    {
      text: 'Troyalı Paris, Sparta kraliçesi <em>Helene</em>’yi kaçırır. Helene’nin eski talipleri, kim onunla evlenirse onu koruyacaklarına yemin etmiştir — o yemini öneren de Odysseus’tur. Şimdi yemin hepsini savaşa çağırır.',
    },
    {
      text: 'Odysseus sevdiklerini bırakıp gitmek istemez; <em>delirmiş gibi</em> yapar. Bir öküzle bir eşeği aynı boyunduruğa koşar, tarlasını sürüp toprağa tuz eker.',
      gate: { kind: 'tap', prompt: 'Sabanı sür: öküze dokun.' },
    },
    {
      text: 'Ama elçi Palamedes oyunu sezer: bebek Telemakhos’u sabanın önüne bırakır. Saban çocuğa doğru ilerlemektedir…',
      gate: { kind: 'tap', prompt: 'Sabanı durdur: Odysseus’a dokun.' },
    },
    {
      text: 'Odysseus sabanı çevirir; delilik oyunu bozulmuştur. Artık savaşa gitmek zorundadır. On iki gemisini donatır ve Penelopeia’ya veda eder.',
      aside: {
        title: 'Mitin izi · Mentor',
        text: 'Odysseus giderken evini dostu <em>Mentor</em>’a emanet eder. Yıllar sonra tanrıça Athena, Mentor kılığına girip Telemakhos’a yol gösterir. Bugünkü “mentor” (akıl hocası) sözcüğü buradan gelir.',
      },
    },
  ],
  scene,
};
