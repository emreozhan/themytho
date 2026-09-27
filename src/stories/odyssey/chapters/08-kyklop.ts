import type { Chapter } from '../../../story/types';
import { scene } from '../../../scenes/kyklop';

export const kyklop: Chapter = {
  id: 'kyklop',
  part: 'donus',
  title: 'Kyklop’un Mağarası',
  label: 'Kykloplar',
  greek: 'ΠΟΛΥΦΗΜΟΣ',
  place: 'Geleneğe göre Sicilya’nın batısı; önünde Keçi Adası (Favignana)',
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
      tr: 'Oradan daha öteye yelken açtık ve kibirli, yasa tanımaz Kykloplar ülkesine vardık.',
      greek: 'Κυκλώπων δ᾽ ἐς γαῖαν ὑπερφιάλων ἀθεμίστων / ἱκόμεθ᾽ — Od. 9.106–107',
    },
  },
  end: { mood: 'day' },
  beats: [
    {
      text: 'Tek gözlü devler, <strong>Kykloplar</strong>, ne tarla sürer ne yasa tanır. Odysseus on iki adamıyla ve Maron’un şarabıyla bir mağaraya girer: peynir sepetleri, kuzu ağılları… Mağaranın sahibi, Poseidon’un oğlu <strong>Polyphemos</strong>’tur.',
    },
    {
      text: 'Dev sürüsüyle döner; mağaranın ağzını yirmi iki arabanın yerinden oynatamayacağı bir kayayla kapatır. Yabancıları görünce ikisini yakalar ve yer. Kaçış yoktur.',
    },
    {
      text: 'Odysseus deve Maron’un koyu şarabını sunar. Polyphemos kâseyi üç kez dikip sarhoş olunca adını sorar: “Söyle bana adını, yabancı.”',
      gate: { kind: 'choice', prompt: 'Adın ne, yabancı?' },
    },
    {
      text: 'Dev uyuyakalınca Odysseus ile yoldaşları, ateşte kızdırdıkları zeytin kazığını onun tek gözüne saplar. Polyphemos’un çığlıklarına koşan komşu Kykloplar kim olduğunu sorar.',
      gate: { kind: 'drag', prompt: 'Kızgın kazığı Kyklop’un gözüne sapla.' },
      quote: {
        greek: 'ὦ φίλοι, Οὖτίς με κτείνει δόλῳ οὐδὲ βίηφιν.',
        tr: 'Dostlar, Kimse öldürüyor beni; güçle değil, hileyle!',
        ref: 'Odysseia 9.408',
      },
    },
    {
      text: 'Sabah dev sürüsünü otlağa çıkarırken her koçun sırtını yoklar. Ama adamlar koçların karnının altına bağlanmıştır; Odysseus da en büyük koçun yünlerine tutunur.',
      gate: { kind: 'tap', prompt: 'Koçun karnının altına saklan: koça dokun.' },
    },
    {
      text: 'Gemiye kaçan Odysseus kibirle gerçek adını haykırır. Polyphemos babası Poseidon’a yalvarır: “Eve dönecekse bile geç dönsün, yoldaşlarını yitirerek, yabancı bir gemide…” Deniz tanrısının öfkesi artık Odysseus’un peşindedir.',
      aside: {
        title: 'Mitin izi · Kyklops',
        text: 'Kyklops “yuvarlak göz” demektir (<em>kyklos</em>: çember, <em>ōps</em>: göz). Bazı araştırmacılar, Akdeniz adalarında bulunan cüce fil kafataslarının ortasındaki büyük burun boşluğunun tek gözlü dev efsanelerine ilham vermiş olabileceğini düşünür.',
      },
    },
  ],
  scene,
};
