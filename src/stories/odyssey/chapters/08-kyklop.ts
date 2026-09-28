import type { Chapter } from '../../../story/types';

export const kyklop: Chapter = {
  id: 'kyklop',
  part: 'donus',
  title: { tr: 'Kyklop’un Mağarası', en: 'The Cyclops’s Cave' },
  label: { tr: 'Kykloplar', en: 'Cyclopes' },
  greek: 'ΠΟΛΥΦΗΜΟΣ',
  place: { tr: 'Geleneğe göre Sicilya’nın batısı; önünde Keçi Adası (Favignana)', en: 'Traditionally western Sicily, with Goat Island (Favignana) offshore' },
  at: [12.62, 38.06],
  harbor: [12.3, 38.0],
  labelSide: 'top',
  year: 10,
  ships: 12,
  zoom: 4,
  reveal: 230,
  arrival: {
    id: 'sail',
    via: [[11.6, 34.8], [12.35, 36.3], [12.4, 37.1], [12.15, 37.7]],
    caption: {
      text: {
        tr: 'Oradan daha öteye yelken açtık ve kibirli, yasa tanımaz Kykloplar ülkesine vardık.',
        en: 'From there we sailed on and came to the land of the Cyclopes, overbearing and lawless.',
      },
      greek: 'Κυκλώπων δ᾽ ἐς γαῖαν ὑπερφιάλων ἀθεμίστων / ἱκόμεθ᾽ — Od. 9.106–107',
    },
  },
  end: { mood: 'day' },
  beats: [
    {
      text: {
        tr: 'Tek gözlü devler, <strong>Kykloplar</strong>, ne tarla sürer ne yasa tanır. Odysseus on iki adamıyla ve Maron’un şarabıyla bir mağaraya girer: peynir sepetleri, kuzu ağılları… Mağaranın sahibi, Poseidon’un oğlu <strong>Polyphemos</strong>’tur.',
        en: 'The one-eyed giants, the <strong>Cyclopes</strong>, neither plough fields nor keep laws. Odysseus enters a cave with twelve of his men and Maron’s wine: baskets of cheese, pens full of lambs… The cave belongs to <strong>Polyphemus</strong>, son of Poseidon.',
      },
    },
    {
      text: {
        tr: 'Dev sürüsüyle döner; mağaranın ağzını yirmi iki arabanın yerinden oynatamayacağı bir kayayla kapatır. Yabancıları görünce ikisini yakalar ve yer. Kaçış yoktur.',
        en: 'The giant returns with his flock and blocks the mouth of the cave with a stone that twenty-two wagons could not shift. Seeing the strangers, he seizes two of them and eats them. There is no way out.',
      },
    },
    {
      text: {
        tr: 'Odysseus deve Maron’un koyu şarabını sunar. Polyphemos kâseyi üç kez dikip sarhoş olunca adını sorar: “Söyle bana adını, yabancı.”',
        en: 'Odysseus offers the giant Maron’s dark wine. Polyphemus drains the bowl three times and, drunk, asks his name: “Tell me your name, stranger.”',
      },
      gate: { kind: 'choice', prompt: { tr: 'Adın ne, yabancı?', en: 'What is your name, stranger?' } },
    },
    {
      text: {
        tr: 'Dev uyuyakalınca Odysseus ile yoldaşları, ateşte kızdırdıkları zeytin kazığını onun tek gözüne saplar. Polyphemos’un çığlıklarına koşan komşu Kykloplar kim olduğunu sorar.',
        en: 'When the giant falls asleep, Odysseus and his companions drive an olive stake, heated in the fire, into his single eye. The neighbouring Cyclopes come running at Polyphemus’s screams and ask who is hurting him.',
      },
      gate: { kind: 'drag', prompt: { tr: 'Kızgın kazığı Kyklop’un gözüne sapla.', en: 'Drive the glowing stake into the Cyclops’s eye.' } },
      quote: {
        greek: 'ὦ φίλοι, Οὖτίς με κτείνει δόλῳ οὐδὲ βίηφιν.',
        text: {
          tr: 'Dostlar, Kimse öldürüyor beni; güçle değil, hileyle!',
          en: 'Friends, Nobody is killing me — by cunning, not by force!',
        },
        ref: { tr: 'Odysseia 9.408', en: 'Odyssey 9.408' },
      },
    },
    {
      text: {
        tr: 'Sabah dev sürüsünü otlağa çıkarırken her koçun sırtını yoklar. Ama adamlar koçların karnının altına bağlanmıştır; Odysseus da en büyük koçun yünlerine tutunur.',
        en: 'In the morning, as the giant lets his flock out to pasture, he feels the back of every ram. But the men are tied beneath the rams’ bellies, and Odysseus clings to the fleece of the biggest ram.',
      },
      gate: { kind: 'tap', prompt: { tr: 'Koçun karnının altına saklan: koça dokun.', en: 'Hide under the ram’s belly: touch the ram.' } },
    },
    {
      text: {
        tr: 'Gemiye kaçan Odysseus kibirle gerçek adını haykırır. Polyphemos babası Poseidon’a yalvarır: “Eve dönecekse bile geç dönsün, yoldaşlarını yitirerek, yabancı bir gemide…” Deniz tanrısının öfkesi artık Odysseus’un peşindedir.',
        en: 'Safe on his ship, Odysseus proudly shouts his real name. Polyphemus prays to his father Poseidon: “If he must reach home, let him come late, having lost his companions, on a stranger’s ship…” From now on the sea god’s anger pursues Odysseus.',
      },
      aside: {
        title: { tr: 'Mitin izi · Kyklops', en: 'Echo of the myth · Cyclops' },
        text: {
          tr: 'Kyklops “yuvarlak göz” demektir (<em>kyklos</em>: çember, <em>ōps</em>: göz). Bazı araştırmacılar, Akdeniz adalarında bulunan cüce fil kafataslarının ortasındaki büyük burun boşluğunun tek gözlü dev efsanelerine ilham vermiş olabileceğini düşünür.',
          en: 'Cyclops means “round eye” (<em>kyklos</em>: circle, <em>ōps</em>: eye). Some researchers think that the large nasal opening in the middle of dwarf-elephant skulls found on Mediterranean islands may have inspired the legends of one-eyed giants.',
        },
      },
    },
  ],
  load: () => import('../../../scenes/kyklop'),
};
