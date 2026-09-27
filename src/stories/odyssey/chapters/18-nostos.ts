import type { Chapter } from '../../../story/types';
import { scene } from '../../../scenes/nostos';

export const nostos: Chapter = {
  id: 'nostos',
  part: 'ithaka',
  title: 'Eve Dönüş',
  label: 'İthaka',
  marker: 'ithaka',
  greek: 'ΝΟΣΤΟΣ',
  place: 'İthaka, Phorkys Limanı ve Odysseus’un sarayı',
  at: [20.67, 38.4],
  harbor: [20.79, 38.33],
  year: 20,
  ships: 0,
  mood: 'dawn',
  zoom: 4.6,
  reveal: 150,
  arrival: {
    id: 'gece',
    via: [[20.1, 39.3], [20.45, 38.9], [20.78, 38.6]],
    style: 'night',
    vessel: 'phaeacian',
    duration: 4.5,
    caption: { tr: 'Faiak gemisi, uyuyan Odysseus’u gece boyunca taşır. Şafak sökerken İthaka’dadır.' },
  },
  beats: [
    {
      text: 'Yirmi yıl sonra İthaka. Athena onu tanınmasın diye yaşlı, pejmürde bir dilenciye çevirir. Sadık domuzçobanı <em>Eumaios</em> onu tanımadan konuk eder; oğlu Telemakhos’la da orada kavuşur.',
    },
    {
      text: 'Sarayın kapısında, gübre yığınının üstünde yatan yaşlı köpek <strong>Argos</strong> onu hemen tanır: kulaklarını diker, kuyruğunu sallar…',
      quote: {
        greek: 'Ἄργον δ᾽ αὖ κατὰ μοῖρ᾽ ἔλαβεν μέλανος θανάτοιο, / αὐτίκ᾽ ἰδόντ᾽ Ὀδυσῆα ἐεικοστῷ ἐνιαυτῷ.',
        tr: 'Argos’u ise kara ölümün yazgısı aldı, yirminci yılında Odysseus’u görür görmez.',
        ref: 'Odysseia 17.326–327',
      },
    },
    {
      text: 'Sarayda <strong>108 talip</strong>, Penelopeia’yla evlenmek için Odysseus’un malını yiyip içmektedir. Penelopeia onları yıllarca oyalamıştır: kayınbabası Laertes’e kefen dokuyor, gündüz dokuduğunu gece söküyordu.',
      aside: {
        title: 'Mitin izi · Penelope’nin dokuması',
        text: 'Batı dillerinde bitmek bilmeyen, sürekli ertelenen işlere “Penelope’nin dokuması” denir. Penelopeia, sadakatin ve sabrın simgesidir.',
      },
    },
    {
      text: 'Penelopeia bir yarışma açar: Odysseus’un büyük yayını kurup okunu on iki baltanın deliğinden geçiren onunla evlenecektir. Taliplerin hiçbiri yayı kuramaz bile. Dilenci yayı ister…',
      gate: { kind: 'drag', prompt: 'Yayı ger ve oku bırak.' },
      quote: {
        greek: 'δεξιτερῇ δ᾽ ἄρα χειρὶ λαβὼν πειρήσατο νευρῆς· / ἡ δ᾽ ὑπὸ καλὸν ἄεισε, χελιδόνι εἰκέλη αὐδήν.',
        tr: 'Sağ eliyle kirişi aldı, denedi; kiriş güzelce öttü, sesi bir kırlangıcınki gibiydi.',
        ref: 'Odysseia 21.410–411',
      },
    },
    {
      text: 'Ok on iki baltanın hepsinden geçer. Dilenci doğrulur: bu, Odysseus’tur. Talipler cezalarını bulur; saray temizlenir.',
    },
    {
      text: 'Penelopeia yine de temkinlidir ve son bir sınav yapar: “Yatağını odadan çıkarın” der. Odysseus öfkelenir, çünkü yatağı taşımak imkânsızdır…',
      gate: { kind: 'choice', prompt: 'Yatak neden taşınamaz?' },
    },
    {
      text: 'Yatağın sırrını yalnızca ikisi bilir: ayaklarından biri, Odysseus’un kendi elleriyle etrafına oda kurduğu, kök salmış bir zeytin ağacının gövdesidir. Penelopeia koşup ona sarılır. Yirmi yıllık yolculuk, <em>nostos</em>’la biter.',
      quote: {
        greek: 'ὣς ἄρα τῇ ἀσπαστὸς ἔην πόσις εἰσοροώσῃ, / δειρῆς δ᾽ οὔ πω πάμπαν ἀφίετο πήχεε λευκώ.',
        tr: 'Kocası öylesine sevgiliydi ki gözüne; ak kollarını onun boynundan bir türlü çözemiyordu.',
        ref: 'Odysseia 23.239–240',
      },
      aside: {
        title: 'Mitin izi · Nostalji',
        text: '<em>Nostos</em> (eve dönüş) ile <em>algos</em> (acı) sözcüklerinden türeyen “nostalji”, 1688’de İsviçreli hekim Johannes Hofer tarafından, yurdundan uzakta hastalanan askerlerin sıla hastalığını adlandırmak için üretildi.',
      },
    },
  ],
  scene,
};
