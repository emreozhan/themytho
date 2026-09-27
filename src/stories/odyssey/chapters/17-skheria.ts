import type { Chapter } from '../../../story/types';

export const skheria: Chapter = {
  id: 'skheria',
  part: 'donus',
  title: 'Faiakların Ülkesi',
  label: 'Skheria',
  greek: 'ΣΧΕΡΙΗ',
  place: 'Geleneğe göre Korfu (Kerkyra)',
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
      tr: 'On yedi gün yol aldı. On sekizinci gün Poseidon onu gördü; bulutları topladı, üç dişli mızrağını alıp denizi altüst etti.',
      greek: 'ὣς εἰπὼν σύναγεν νεφέλας, ἐτάραξε δὲ πόντον / χερσὶ τρίαιναν ἑλών — Od. 5.291–292',
    },
  },
  beats: [
    {
      text: 'Poseidon’un fırtınası salı parçalar. Deniz tanrıçası İno-Leukothea ona acır ve ölümsüz peçesini verir. Odysseus iki gün iki gece yüzer; Skheria kıyısında, bir zeytin çalılığının altında bitkin uyuyakalır.',
    },
    {
      text: 'Athena’nın düşünde yol gösterdiği prenses <strong>Nausikaa</strong>, nedimeleriyle ırmak ağzında çamaşır yıkar. Sonra başörtülerini atıp top oynarlar.',
      gate: { kind: 'tap', prompt: 'Topu at.' },
    },
    {
      text: 'Top ırmağa düşer, kızların çığlığı Odysseus’u uyandırır. Bir zeytin dalıyla örtünüp çalılıktan çıkar. Nedimeler kaçışır; yalnızca Nausikaa yerinden kıpırdamaz.',
    },
    {
      text: 'Kral Alkinoos’un sarayındaki şölende kör ozan <em>Demodokos</em>, Troya’yı ve tahta atı söyler. Odysseus başını pelerinine gömüp ağlar.',
      quote: {
        greek: 'ταῦτ᾽ ἄρ᾽ ἀοιδὸς ἄειδε περικλυτός· αὐτὰρ Ὀδυσσεὺς / τήκετο, δάκρυ δ᾽ ἔδευεν ὑπὸ βλεφάροισι παρειάς.',
        tr: 'Ünlü ozan bunları söylüyordu; Odysseus ise eriyor, gözkapaklarının altından süzülen yaşlar yanaklarını ıslatıyordu.',
        ref: 'Odysseia 8.521–522',
      },
    },
    {
      text: 'Sonunda adını açıklar ve serüvenlerini anlatır. Faiakların dümensiz, kılavuzsuz gemileri onu bir gecede İthaka’ya götürür; Odysseus bütün yol boyunca derin bir uykudadır.',
      aside: {
        title: 'Hikâye içinde hikâye',
        text: 'Kikonlardan Kalypso’ya kadar bu haritada izlediğin maceraların çoğunu Homeros, Odysseus’un ağzından, bu şölende anlattırır (9–12. kitaplar). Edebiyattaki çerçeve anlatının en eski örneklerindendir.',
      },
    },
  ],
  load: () => import('../../../scenes/skheria'),
};
