import type { Chapter } from '../../../story/types';

const CHARYBDIS: [number, number] = [15.62, 38.23];

export const thrinakia: Chapter = {
  id: 'thrinakia',
  part: 'donus',
  title: { tr: 'Güneşin Sığırları', en: 'The Cattle of the Sun' },
  label: { tr: 'Thrinakia', en: 'Thrinacia' },
  greek: 'ΘΡΙΝΑΚΙΗ',
  place: { tr: 'Geleneğe göre Sicilya (Trinakria, “üç burunlu ada”)', en: 'Traditionally Sicily (Trinacria, “the island of three capes”)' },
  at: [15.08, 37.12],
  harbor: [15.38, 37.02],
  labelSide: 'left',
  year: 11,
  ships: 1,
  wrath: true,
  zoom: 3.8,
  reveal: 190,
  arrival: {
    id: 'sail',
    via: [[15.6, 38.16], [15.58, 38.12], [15.56, 38.08], [15.545, 38.02], [15.5, 37.8], [15.45, 37.35]],
    vessel: 'ship',
    caption: { text: { tr: 'Güneş tanrısı Helios’un kusursuz adasına… Teiresias’ın uyarısı kulaklarındadır.', en: 'To the flawless island of Helios, the sun god… Tiresias’s warning still rings in their ears.' } },
  },
  legs: [
    { id: 'kalkis', via: [[15.7, 36.85]], to: [15.95, 36.72], duration: 2.4 },
    { id: 'surukleniş', from: [15.95, 36.72], via: [[16.0, 37.3], [15.6, 37.88], [15.545, 38.02], [15.56, 38.08], [15.58, 38.12], [15.6, 38.16], [15.605, 38.2]], to: CHARYBDIS, style: 'drift', vessel: 'wreck', duration: 3.6 },
  ],
  end: { at: CHARYBDIS, ships: 0, year: 12 },
  beats: [
    {
      text: {
        tr: 'Helios’un adasında yedi sığır, yedi koyun sürüsü otlar; her birinde elli hayvan. Bu hayvanlar ne doğurur ne ölür.',
        en: 'On Helios’s island graze seven herds of cattle and seven flocks of sheep, fifty head in each. These beasts neither give birth nor die.',
      },
      aside: {
        title: { tr: 'Bir yorum', en: 'One reading' },
        text: {
          tr: 'Yedi sürü çarpı elli: 350 sığır. Antik çağdan beri kimi yorumcular bu sayıyı yılın günleriyle, sürüleri de ay yılının haftalarıyla ilişkilendirir.',
          en: 'Seven herds of fifty: 350 cattle. Since antiquity some readers have linked this number to the days of the year, and the herds to the weeks of the lunar year.',
        },
      },
    },
    {
      text: {
        tr: 'Güney rüzgârı bir ay boyunca hiç dinmez. Erzak biter; adamlar balık ve kuş avlamaya başlar. Odysseus dua etmek için uzaklaşır ve uyuyakalır.',
        en: 'For a whole month the south wind never drops. Their supplies run out, and the men turn to catching fish and birds. Odysseus goes off alone to pray and falls asleep.',
      },
    },
    {
      text: {
        tr: 'Eurylokhos yoldaşlarını kandırır: en güzel sığırlar kesilir. Ama korkunç işaretler belirir: postlar sürünür, şişlerdeki etler böğürür.',
        en: 'Eurylochus talks his companions round, and the finest cattle are slaughtered. But dreadful portents appear: the hides crawl, and the meat on the spits bellows.',
      },
      quote: {
        greek: 'εἷρπον μὲν ῥινοί, κρέα δ᾽ ἀμφ᾽ ὀβελοῖσι μεμύκει, / ὀπταλέα τε καὶ ὠμά· βοῶν δ᾽ ὣς γίγνετο φωνή.',
        text: {
          tr: 'Postlar sürünüyor, şişlerdeki etler böğürüyordu, pişmişi de çiği de; sığır sesine benzer bir ses yükseliyordu.',
          en: 'The hides crawled, and the meat lowed on the spits, both roast and raw; there was a sound like the voice of cattle.',
        },
        ref: { tr: 'Odysseia 12.395–396', en: 'Odyssey 12.395–396' },
      },
    },
    {
      text: {
        tr: 'Helios, Zeus’a yakınır. Rüzgâr dinip gemi açılır açılmaz gök kararır.',
        en: 'Helios complains to Zeus. As soon as the wind drops and the ship puts to sea, the sky turns black.',
      },
      gate: { kind: 'tap', prompt: { tr: 'Yelkeni aç ve denize çık.', en: 'Raise the sail and put to sea.' } },
    },
    {
      text: {
        tr: 'Zeus’un yıldırımı gemiyi paramparça eder; bütün yoldaşlar dalgalara gömülür. Yalnızca Odysseus, direğe ve omurgaya tutunarak kurtulur. Rüzgâr onu gece boyu yeniden Kharybdis’e sürükler.',
        en: 'Zeus’s thunderbolt shatters the ship, and all the companions are lost in the waves. Only Odysseus survives, clinging to the mast and keel. All night the wind drives him back toward Charybdis.',
      },
      quote: {
        greek: 'Ζεὺς δ᾽ ἄμυδις βρόντησε καὶ ἔμβαλε νηῒ κεραυνόν· / ἡ δ᾽ ἐλελίχθη πᾶσα Διὸς πληγεῖσα κεραυνῷ',
        text: {
          tr: 'Zeus aynı anda gürledi ve gemiye yıldırımını fırlattı; Zeus’un yıldırımıyla vurulan gemi baştan başa sarsıldı.',
          en: 'At once Zeus thundered and hurled his lightning at the ship; struck by the bolt of Zeus, she shook from end to end.',
        },
        ref: { tr: 'Odysseia 12.415–416', en: 'Odyssey 12.415–416' },
      },
    },
  ],
  load: () => import('../../../scenes/thrinakia'),
};
