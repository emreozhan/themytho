import type { Chapter } from '../../../story/types';
import { scene } from '../../../scenes/ithaka';

export const ithaka: Chapter = {
  id: 'ithaka',
  part: 'cagri',
  title: { tr: 'İthaka', en: 'Ithaca' },
  greek: 'ΙΘΑΚΗ',
  place: { tr: 'İyon Denizi’nde küçük, kayalık bir ada', en: 'A small, rocky island in the Ionian Sea' },
  at: [20.67, 38.4],
  harbor: [20.79, 38.33],
  labelSide: 'right',
  year: 1,
  ships: 12,
  zoom: 4.6,
  reveal: 150,
  beats: [
    {
      text: {
        tr: 'Batı denizinin kayalık adası İthaka’nın kralı <strong>Odysseus</strong>, Laertes’in oğludur. Karısı Penelopeia’yla yeni doğmuş oğulları <em>Telemakhos</em>’u büyütür. Akhaların en kurnazı, sözü en tatlı olanıdır.',
        en: '<strong>Odysseus</strong>, son of Laertes, is king of Ithaca, a rocky island in the western sea. With his wife Penelope he is raising their newborn son, <em>Telemachus</em>. Of all the Achaeans he is the most cunning, and the sweetest of speech.',
      },
      quote: {
        greek: 'τρηχεῖ᾽, ἀλλ᾽ ἀγαθὴ κουροτρόφος· οὔ τοι ἐγώ γε / ἧς γαίης δύναμαι γλυκερώτερον ἄλλο ἰδέσθαι.',
        text: {
          tr: 'Engebelidir ama iyi yiğitler yetiştirir; insanın kendi toprağından daha tatlı bir şey göremem ben.',
          en: 'Rugged it is, but a good nurse of young men; I can see nothing sweeter than a man’s own land.',
        },
        ref: { tr: 'Odysseia 9.27–28', en: 'Odyssey 9.27–28' },
      },
    },
    {
      text: {
        tr: 'Troyalı Paris, Sparta kraliçesi <em>Helene</em>’yi kaçırır. Helene’nin eski talipleri, kim onunla evlenirse onu koruyacaklarına yemin etmiştir — o yemini öneren de Odysseus’tur. Şimdi yemin hepsini savaşa çağırır.',
        en: 'Paris of Troy carries off <em>Helen</em>, queen of Sparta. Helen’s former suitors had sworn to defend whoever married her — and it was Odysseus who proposed the oath. Now the oath calls them all to war.',
      },
    },
    {
      text: {
        tr: 'Odysseus sevdiklerini bırakıp gitmek istemez; <em>delirmiş gibi</em> yapar. Bir öküzle bir eşeği aynı boyunduruğa koşar, tarlasını sürüp toprağa tuz eker.',
        en: 'Odysseus does not want to leave the people he loves, so he <em>feigns madness</em>. He yokes an ox and an ass together, ploughs his field and sows it with salt.',
      },
      gate: { kind: 'tap', prompt: { tr: 'Sabanı sür: öküze dokun.', en: 'Drive the plough: touch the ox.' } },
    },
    {
      text: {
        tr: 'Ama elçi Palamedes oyunu sezer: bebek Telemakhos’u sabanın önüne bırakır. Saban çocuğa doğru ilerlemektedir…',
        en: 'But the envoy Palamedes sees through the act: he lays the baby Telemachus in the path of the plough. The plough moves toward the child…',
      },
      gate: { kind: 'tap', prompt: { tr: 'Sabanı durdur: Odysseus’a dokun.', en: 'Stop the plough: touch Odysseus.' } },
    },
    {
      text: {
        tr: 'Odysseus sabanı çevirir; delilik oyunu bozulmuştur. Artık savaşa gitmek zorundadır. On iki gemisini donatır ve Penelopeia’ya veda eder.',
        en: 'Odysseus turns the plough aside, and his pretence is over. Now he must go to war. He fits out his twelve ships and says farewell to Penelope.',
      },
      aside: {
        title: { tr: 'Mitin izi · Mentor', en: 'Echo of the myth · Mentor' },
        text: {
          tr: 'Odysseus giderken evini dostu <em>Mentor</em>’a emanet eder. Yıllar sonra tanrıça Athena, Mentor kılığına girip Telemakhos’a yol gösterir. Bugünkü “mentor” (akıl hocası) sözcüğü buradan gelir.',
          en: 'As he leaves, Odysseus entrusts his household to his friend <em>Mentor</em>. Years later the goddess Athena takes Mentor’s shape to guide Telemachus. Our word “mentor” comes from here.',
        },
      },
    },
  ],
  scene,
};
