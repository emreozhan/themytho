import type { Chapter } from '../../../story/types';
import { scene } from '../../../scenes/thrinakia';

const CHARYBDIS: [number, number] = [15.62, 38.23];

export const thrinakia: Chapter = {
  id: 'thrinakia',
  part: 'donus',
  title: 'Güneşin Sığırları',
  label: 'Thrinakia',
  greek: 'ΘΡΙΝΑΚΙΗ',
  place: 'Geleneğe göre Sicilya (Trinakria, “üç burunlu ada”)',
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
    via: [[15.5, 37.75]],
    vessel: 'ship',
    caption: { tr: 'Güneş tanrısı Helios’un kusursuz adasına… Teiresias’ın uyarısı kulaklarındadır.' },
  },
  legs: [
    { id: 'kalkis', via: [[15.7, 36.85]], to: [15.95, 36.72], duration: 2.4 },
    { id: 'surukleniş', from: [15.95, 36.72], via: [[16.05, 37.3], [15.8, 37.85]], to: CHARYBDIS, style: 'drift', vessel: 'wreck', duration: 3.6 },
  ],
  end: { at: CHARYBDIS, ships: 0, year: 12 },
  beats: [
    {
      text: 'Helios’un adasında yedi sığır, yedi koyun sürüsü otlar; her birinde elli hayvan. Bu hayvanlar ne doğurur ne ölür.',
      aside: {
        title: 'Bir yorum',
        text: 'Yedi sürü çarpı elli: 350 sığır. Antik çağdan beri kimi yorumcular bu sayıyı yılın günleriyle, sürüleri de ay yılının haftalarıyla ilişkilendirir.',
      },
    },
    {
      text: 'Güney rüzgârı bir ay boyunca hiç dinmez. Erzak biter; adamlar balık ve kuş avlamaya başlar. Odysseus dua etmek için uzaklaşır ve uyuyakalır.',
    },
    {
      text: 'Eurylokhos yoldaşlarını kandırır: en güzel sığırlar kesilir. Ama korkunç işaretler belirir: postlar sürünür, şişlerdeki etler böğürür.',
      quote: {
        greek: 'εἷρπον μὲν ῥινοί, κρέα δ᾽ ἀμφ᾽ ὀβελοῖσι μεμύκει, / ὀπταλέα τε καὶ ὠμά· βοῶν δ᾽ ὣς γίγνετο φωνή.',
        tr: 'Postlar sürünüyor, şişlerdeki etler böğürüyordu, pişmişi de çiği de; sığır sesine benzer bir ses yükseliyordu.',
        ref: 'Odysseia 12.395–396',
      },
    },
    {
      text: 'Helios, Zeus’a yakınır. Rüzgâr dinip gemi açılır açılmaz gök kararır.',
      gate: { kind: 'tap', prompt: 'Yelkeni aç ve denize çık.' },
    },
    {
      text: 'Zeus’un yıldırımı gemiyi paramparça eder; bütün yoldaşlar dalgalara gömülür. Yalnızca Odysseus, direğe ve omurgaya tutunarak kurtulur. Rüzgâr onu gece boyu yeniden Kharybdis’e sürükler.',
      quote: {
        greek: 'Ζεὺς δ᾽ ἄμυδις βρόντησε καὶ ἔμβαλε νηῒ κεραυνόν· / ἡ δ᾽ ἐλελίχθη πᾶσα Διὸς πληγεῖσα κεραυνῷ',
        tr: 'Zeus aynı anda gürledi ve gemiye yıldırımını fırlattı; Zeus’un yıldırımıyla vurulan gemi baştan başa sarsıldı.',
        ref: 'Odysseia 12.415–416',
      },
    },
  ],
  scene,
};
