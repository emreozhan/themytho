import type { Chapter } from '../../../story/types';

export const skheria: Chapter = {
  id: 'skheria',
  part: 'donus',
  title: { tr: 'Faiakların Ülkesi', en: 'Land of the Phaeacians' },
  label: { tr: 'Skheria', en: 'Scheria' },
  greek: 'ΣΧΕΡΙΗ',
  place: { tr: 'Geleneğe göre Korfu (Kerkyra)', en: 'Traditionally Corfu (Kerkyra)' },
  at: [19.88, 39.62],
  harbor: [19.66, 39.6],
  labelSide: 'left',
  year: 20,
  ships: 0,
  wrath: true,
  zoom: 4.2,
  reveal: 190,
  arrival: {
    id: 'sal',
    via: [[15.6, 36.85], [17.6, 38.0], [19.1, 39.15]],
    style: 'storm',
    vessel: 'raft',
    duration: 6,
    caption: {
      text: {
        tr: 'On yedi gün yol aldı. On sekizinci gün Poseidon onu gördü; bulutları topladı, üç dişli mızrağını alıp denizi altüst etti.',
        en: 'Seventeen days he sailed. On the eighteenth Poseidon saw him; he gathered the clouds, seized his trident and stirred up the sea.',
      },
      greek: 'ὣς εἰπὼν σύναγεν νεφέλας, ἐτάραξε δὲ πόντον / χερσὶ τρίαιναν ἑλών — Od. 5.291–292',
    },
  },
  beats: [
    {
      text: {
        tr: 'Poseidon’un fırtınası salı parçalar. Deniz tanrıçası İno-Leukothea ona acır ve ölümsüz peçesini verir. Odysseus iki gün iki gece yüzer; Skheria kıyısında, bir zeytin çalılığının altında bitkin uyuyakalır.',
        en: 'Poseidon’s storm smashes the raft. The sea goddess Ino-Leucothea takes pity on him and gives him her immortal veil. Odysseus swims for two days and two nights, then falls asleep, exhausted, under an olive thicket on the shore of Scheria.',
      },
    },
    {
      text: {
        tr: 'Athena’nın düşünde yol gösterdiği prenses <strong>Nausikaa</strong>, nedimeleriyle ırmak ağzında çamaşır yıkar. Sonra başörtülerini atıp top oynarlar.',
        en: 'Guided by Athena in a dream, the princess <strong>Nausicaa</strong> goes with her maids to wash clothes at the river mouth. Then they throw off their veils and play ball.',
      },
      gate: { kind: 'tap', prompt: { tr: 'Topu at.', en: 'Throw the ball.' } },
    },
    {
      text: {
        tr: 'Top ırmağa düşer, kızların çığlığı Odysseus’u uyandırır. Bir zeytin dalıyla örtünüp çalılıktan çıkar. Nedimeler kaçışır; yalnızca Nausikaa yerinden kıpırdamaz.',
        en: 'The ball falls into the river, and the girls’ cries wake Odysseus. Covering himself with an olive branch, he steps out of the thicket. The maids scatter; only Nausicaa stands her ground.',
      },
    },
    {
      text: {
        tr: 'Kral Alkinoos’un sarayındaki şölende kör ozan <em>Demodokos</em>, Troya’yı ve tahta atı söyler. Odysseus başını pelerinine gömüp ağlar.',
        en: 'At the feast in the palace of King Alcinous, the blind bard <em>Demodocus</em> sings of Troy and the wooden horse. Odysseus hides his face in his cloak and weeps.',
      },
      quote: {
        greek: 'ταῦτ᾽ ἄρ᾽ ἀοιδὸς ἄειδε περικλυτός· αὐτὰρ Ὀδυσσεὺς / τήκετο, δάκρυ δ᾽ ἔδευεν ὑπὸ βλεφάροισι παρειάς.',
        text: {
          tr: 'Ünlü ozan bunları söylüyordu; Odysseus ise eriyor, gözkapaklarının altından süzülen yaşlar yanaklarını ıslatıyordu.',
          en: 'So the famous bard sang; but Odysseus melted, and tears welling from beneath his eyelids wet his cheeks.',
        },
        ref: { tr: 'Odysseia 8.521–522', en: 'Odyssey 8.521–522' },
      },
    },
    {
      text: {
        tr: 'Sonunda adını açıklar ve serüvenlerini anlatır. Faiakların dümensiz, kılavuzsuz gemileri onu bir gecede İthaka’ya götürür; Odysseus bütün yol boyunca derin bir uykudadır.',
        en: 'At last he reveals his name and tells of his adventures. The Phaeacians’ ships, which need neither rudder nor pilot, carry him to Ithaca in a single night; Odysseus sleeps deeply the whole way.',
      },
      aside: {
        title: { tr: 'Hikâye içinde hikâye', en: 'A story within a story' },
        text: {
          tr: 'Kikonlardan Kalypso’ya kadar bu haritada izlediğin maceraların çoğunu Homeros, Odysseus’un ağzından, bu şölende anlattırır (9–12. kitaplar). Edebiyattaki çerçeve anlatının en eski örneklerindendir.',
          en: 'Most of the adventures you have followed on this map, from the Cicones to Calypso, Homer has Odysseus himself tell at this feast (Books 9–12). It is one of the oldest frame narratives in literature.',
        },
      },
    },
  ],
  load: () => import('../../../scenes/skheria'),
};
