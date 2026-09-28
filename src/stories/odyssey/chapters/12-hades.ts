import type { Chapter } from '../../../story/types';

export const hades: Chapter = {
  id: 'hades',
  part: 'donus',
  title: { tr: 'Ölüler Diyarı', en: 'The Land of the Dead' },
  label: { tr: 'Hades', en: 'Hades' },
  greek: 'ΝΕΚΥΙΑ',
  place: { tr: 'Romalılara göre giriş: Avernus Gölü, Napoli yakınları', en: 'Its entrance, for the Romans: Lake Avernus, near Naples' },
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
    caption: { text: { tr: 'Kirke’nin gönderdiği rüzgârla, güneşin hiç doğmadığı Kimmerlerin ülkesine, Okeanos’un kıyısına…', en: 'On a wind sent by Circe, to the land of the Cimmerians, where the sun never rises, on the shore of Oceanus…' } },
  },
  end: { mood: 'day' },
  beats: [
    {
      text: {
        tr: 'Dünyanın kıyısına, güneşin hiç doğmadığı yere varırlar. Odysseus bir çukur kazar; bal, süt, şarap ve su döker, arpa unu serper; bir koç ile kara bir koyunu kurban eder.',
        en: 'They reach the edge of the world, where the sun never rises. Odysseus digs a pit, pours out honey, milk, wine and water, sprinkles barley meal, and sacrifices a ram and a black ewe.',
      },
      aside: {
        title: { tr: 'Haritada', en: 'On the map' },
        text: {
          tr: 'Homeros ölüler ülkesini dünyanın kıyısına, Okeanos’un ötesine yerleştirir. Romalılar ise girişini Napoli yakınlarındaki Avernus Gölü’nde arardı; haritadaki işaret bu geleneği izler.',
          en: 'Homer sets the land of the dead at the edge of the world, beyond Oceanus. The Romans looked for its entrance at Lake Avernus, near Naples; the marker on the map follows that tradition.',
        },
      },
    },
    {
      text: {
        tr: 'Kan kokusuna ölülerin gölgeleri üşüşür. Odysseus kılıcını çekip onları çukurdan uzak tutar: önce kör kâhin <strong>Teiresias</strong> içmelidir.',
        en: 'Drawn by the smell of blood, the shades of the dead swarm up. Odysseus draws his sword and keeps them away from the pit: the blind seer <strong>Tiresias</strong> must drink first.',
      },
      gate: { kind: 'tap', prompt: { tr: 'Teiresias’ın gölgesini çağır: çukura dokun.', en: 'Summon the shade of Tiresias: touch the pit.' } },
      quote: { greek: 'νόστον δίζηαι μελιηδέα, φαίδιμ᾽ Ὀδυσσεῦ', text: { tr: 'Bal tatlı bir dönüş arıyorsun, parlak Odysseus.', en: 'You seek a homecoming sweet as honey, shining Odysseus.' }, ref: { tr: 'Odysseia 11.100', en: 'Odyssey 11.100' } },
    },
    {
      text: {
        tr: 'Teiresias uyarır: “Güneş tanrısı Helios’un sığırlarına dokunmayın. Dokunursanız geç dönersin, yoldaşlarını yitirmiş olarak, yabancı bir gemide; evinde de belalar bulursun.”',
        en: 'Tiresias warns him: “Do not touch the cattle of Helios, the sun god. If you do, you will come home late, having lost your companions, on a stranger’s ship — and you will find trouble in your house.”',
      },
    },
    {
      text: {
        tr: 'Gölgelerin arasında annesi <strong>Antikleia</strong>’yı görür. Oğlunu beklerken özlemden ölmüştür. Odysseus ona sarılmak ister…',
        en: 'Among the shades he sees his mother, <strong>Anticlea</strong>. She died of longing while waiting for her son. Odysseus wants to embrace her…',
      },
      gate: { kind: 'tap', prompt: { tr: 'Annene sarıl.', en: 'Embrace your mother.' } },
      quote: {
        greek: 'τρὶς μὲν ἐφωρμήθην, ἑλέειν τέ με θυμὸς ἀνώγει, / τρὶς δέ μοι ἐκ χειρῶν σκιῇ εἴκελον ἢ καὶ ὀνείρῳ / ἔπτατ᾽',
        text: {
          tr: 'Üç kez atıldım ona, yüreğim sarıl diyordu; üç kez de bir gölge gibi, bir düş gibi uçtu gitti ellerimden.',
          en: 'Three times I sprang toward her, and my heart urged me to hold her; three times she flew from my hands like a shadow or a dream.',
        },
        ref: { tr: 'Odysseia 11.206–208', en: 'Odyssey 11.206–208' },
      },
    },
    {
      text: {
        tr: 'Akhilleus’un gölgesi de oradadır. Ölümdeki ünü onu avutmaz. Sonunda gölgeler binlercesiyle üşüşünce Odysseus korkuyla gemisine koşar.',
        en: 'The shade of Achilles is there too; his fame in death is no comfort to him. At last, when the shades crowd in by the thousands, Odysseus runs in terror to his ship.',
      },
      quote: {
        greek: 'βουλοίμην κ᾽ ἐπάρουρος ἐὼν θητευέμεν ἄλλῳ, / ἀνδρὶ παρ᾽ ἀκλήρῳ, ᾧ μὴ βίοτος πολὺς εἴη, / ἢ πᾶσιν νεκύεσσι καταφθιμένοισιν ἀνάσσειν.',
        text: {
          tr: 'Toprağı olmayan, geçimi kıt bir adamın yanında ırgat olmayı yeğlerdim, göçüp gitmiş bütün ölülere kral olmaktansa.',
          en: 'I would rather be a hired hand on earth, labouring for some landless man with little to live on, than be king over all the perished dead.',
        },
        ref: { tr: 'Odysseia 11.489–491 · Akhilleus', en: 'Odyssey 11.489–491 · Achilles' },
      },
    },
  ],
  load: () => import('../../../scenes/hades'),
};
