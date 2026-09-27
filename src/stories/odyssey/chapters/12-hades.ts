import type { Chapter } from '../../../story/types';
import { scene } from '../../../scenes/hades';

export const hades: Chapter = {
  id: 'hades',
  part: 'donus',
  title: 'Ölüler Diyarı',
  label: 'Hades',
  greek: 'ΝΕΚΥΙΑ',
  place: 'Romalılara göre giriş: Avernus Gölü, Napoli yakınları',
  at: [14.08, 40.84],
  harbor: [14.13, 40.78],
  labelSide: 'right',
  year: 11,
  ships: 1,
  wrath: true,
  mood: 'underworld',
  zoom: 4.4,
  reveal: 160,
  arrival: {
    id: 'sail',
    via: [[13.45, 41.0]],
    vessel: 'ship',
    caption: { tr: 'Kirke’nin gönderdiği rüzgârla, güneşin hiç doğmadığı Kimmerlerin ülkesine, Okeanos’un kıyısına…' },
  },
  end: { mood: 'day' },
  beats: [
    {
      text: 'Dünyanın kıyısına, güneşin hiç doğmadığı yere varırlar. Odysseus bir çukur kazar; bal, süt, şarap ve su döker, arpa unu serper; bir koç ile kara bir koyunu kurban eder.',
      aside: {
        title: 'Haritada',
        text: 'Homeros ölüler ülkesini dünyanın kıyısına, Okeanos’un ötesine yerleştirir. Romalılar ise girişini Napoli yakınlarındaki Avernus Gölü’nde arardı; haritadaki işaret bu geleneği izler.',
      },
    },
    {
      text: 'Kan kokusuna ölülerin gölgeleri üşüşür. Odysseus kılıcını çekip onları çukurdan uzak tutar: önce kör kâhin <strong>Teiresias</strong> içmelidir.',
      gate: { kind: 'tap', prompt: 'Teiresias’ın gölgesini çağır: çukura dokun.' },
      quote: { greek: 'νόστον δίζηαι μελιηδέα, φαίδιμ᾽ Ὀδυσσεῦ', tr: 'Bal tatlı bir dönüş arıyorsun, parlak Odysseus.', ref: 'Odysseia 11.100' },
    },
    {
      text: 'Teiresias uyarır: “Güneş tanrısı Helios’un sığırlarına dokunmayın. Dokunursanız geç dönersin, yoldaşlarını yitirmiş olarak, yabancı bir gemide; evinde de belalar bulursun.”',
    },
    {
      text: 'Gölgelerin arasında annesi <strong>Antikleia</strong>’yı görür. Oğlunu beklerken özlemden ölmüştür. Odysseus ona sarılmak ister…',
      gate: { kind: 'tap', prompt: 'Annene sarıl.' },
      quote: {
        greek: 'τρὶς μὲν ἐφωρμήθην, ἑλέειν τέ με θυμὸς ἀνώγει, / τρὶς δέ μοι ἐκ χειρῶν σκιῇ εἴκελον ἢ καὶ ὀνείρῳ / ἔπτατ᾽',
        tr: 'Üç kez atıldım ona, yüreğim sarıl diyordu; üç kez de bir gölge gibi, bir düş gibi uçtu gitti ellerimden.',
        ref: 'Odysseia 11.206–208',
      },
    },
    {
      text: 'Akhilleus’un gölgesi de oradadır. Ölümdeki ünü onu avutmaz. Sonunda gölgeler binlercesiyle üşüşünce Odysseus korkuyla gemisine koşar.',
      quote: {
        greek: 'βουλοίμην κ᾽ ἐπάρουρος ἐὼν θητευέμεν ἄλλῳ, / ἀνδρὶ παρ᾽ ἀκλήρῳ, ᾧ μὴ βίοτος πολὺς εἴη, / ἢ πᾶσιν νεκύεσσι καταφθιμένοισιν ἀνάσσειν.',
        tr: 'Toprağı olmayan, geçimi kıt bir adamın yanında ırgat olmayı yeğlerdim, göçüp gitmiş bütün ölülere kral olmaktansa.',
        ref: 'Odysseia 11.489–491 · Akhilleus',
      },
    },
  ],
  scene,
};
