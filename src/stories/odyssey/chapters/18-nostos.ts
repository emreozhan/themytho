import type { Chapter } from '../../../story/types';

export const nostos: Chapter = {
  id: 'nostos',
  part: 'ithaka',
  title: { tr: 'Eve Dönüş', en: 'Homecoming' },
  label: { tr: 'İthaka', en: 'Ithaca' },
  marker: 'ithaka',
  greek: 'ΝΟΣΤΟΣ',
  place: { tr: 'İthaka, Phorkys Limanı ve Odysseus’un sarayı', en: 'Ithaca: the harbour of Phorcys and the palace of Odysseus' },
  at: [20.67, 38.4],
  harbor: [20.79, 38.33],
  year: 20,
  ships: 0,
  mood: 'dawn',
  zoom: 4.6,
  reveal: 150,
  arrival: {
    id: 'gece',
    via: [[19.75, 39.42], [19.98, 39.26], [20.07, 39.08], [20.3, 38.97], [20.45, 38.85], [20.5, 38.62], [20.63, 38.52], [20.78, 38.47], [20.81, 38.39]],
    style: 'night',
    vessel: 'phaeacian',
    duration: 4.5,
    caption: { text: { tr: 'Faiak gemisi, uyuyan Odysseus’u gece boyunca taşır. Şafak sökerken İthaka’dadır.', en: 'The Phaeacian ship carries the sleeping Odysseus through the night. At dawn he is on Ithaca.' } },
  },
  beats: [
    {
      text: {
        tr: 'Yirmi yıl sonra İthaka. Athena onu tanınmasın diye yaşlı, pejmürde bir dilenciye çevirir. Sadık domuzçobanı <em>Eumaios</em> onu tanımadan konuk eder; oğlu Telemakhos’la da orada kavuşur.',
        en: 'Ithaca, after twenty years. So that no one will know him, Athena turns him into an old, ragged beggar. The loyal swineherd <em>Eumaeus</em> takes him in without recognizing him, and there he is reunited with his son Telemachus.',
      },
    },
    {
      text: {
        tr: 'Sarayın kapısında, gübre yığınının üstünde yatan yaşlı köpek <strong>Argos</strong> onu hemen tanır: kulaklarını diker, kuyruğunu sallar…',
        en: 'At the palace gate, lying on a dung heap, the old dog <strong>Argos</strong> knows him at once: he pricks up his ears and wags his tail…',
      },
      quote: {
        greek: 'Ἄργον δ᾽ αὖ κατὰ μοῖρ᾽ ἔλαβεν μέλανος θανάτοιο, / αὐτίκ᾽ ἰδόντ᾽ Ὀδυσῆα ἐεικοστῷ ἐνιαυτῷ.',
        text: {
          tr: 'Argos’u ise kara ölümün yazgısı aldı, yirminci yılında Odysseus’u görür görmez.',
          en: 'And Argos was seized by the fate of black death, as soon as he had seen Odysseus in the twentieth year.',
        },
        ref: { tr: 'Odysseia 17.326–327', en: 'Odyssey 17.326–327' },
      },
    },
    {
      text: {
        tr: 'Sarayda <strong>108 talip</strong>, Penelopeia’yla evlenmek için Odysseus’un malını yiyip içmektedir. Penelopeia onları yıllarca oyalamıştır: kayınbabası Laertes’e kefen dokuyor, gündüz dokuduğunu gece söküyordu.',
        en: 'In the palace, <strong>108 suitors</strong> are eating and drinking their way through Odysseus’s wealth, each hoping to marry Penelope. For years she has put them off: she was weaving a shroud for her father-in-law Laertes, and every night she unpicked what she had woven by day.',
      },
      aside: {
        title: { tr: 'Mitin izi · Penelope’nin dokuması', en: 'Echo of the myth · Penelope’s web' },
        text: {
          tr: 'Batı dillerinde bitmek bilmeyen, sürekli ertelenen işlere “Penelope’nin dokuması” denir. Penelopeia, sadakatin ve sabrın simgesidir.',
          en: 'In Western languages, a task that never ends and is forever put off is called “Penelope’s web”. Penelope stands for faithfulness and patience.',
        },
      },
    },
    {
      text: {
        tr: 'Penelopeia bir yarışma açar: Odysseus’un büyük yayını kurup okunu on iki baltanın deliğinden geçiren onunla evlenecektir. Taliplerin hiçbiri yayı kuramaz bile. Dilenci yayı ister…',
        en: 'Penelope announces a contest: she will marry the man who can string Odysseus’s great bow and shoot an arrow through the holes of twelve axe heads. None of the suitors can even string the bow. The beggar asks for it…',
      },
      gate: { kind: 'drag', prompt: { tr: 'Yayı ger ve oku bırak.', en: 'Draw the bow and loose the arrow.' } },
      quote: {
        greek: 'δεξιτερῇ δ᾽ ἄρα χειρὶ λαβὼν πειρήσατο νευρῆς· / ἡ δ᾽ ὑπὸ καλὸν ἄεισε, χελιδόνι εἰκέλη αὐδήν.',
        text: {
          tr: 'Sağ eliyle kirişi aldı, denedi; kiriş güzelce öttü, sesi bir kırlangıcınki gibiydi.',
          en: 'He took the string in his right hand and tried it; it sang sweetly under his touch, like the voice of a swallow.',
        },
        ref: { tr: 'Odysseia 21.410–411', en: 'Odyssey 21.410–411' },
      },
    },
    {
      text: {
        tr: 'Ok on iki baltanın hepsinden geçer. Dilenci doğrulur: bu, Odysseus’tur. Talipler cezalarını bulur; saray temizlenir.',
        en: 'The arrow passes through all twelve axes. The beggar stands tall: it is Odysseus. The suitors meet their punishment, and the palace is cleansed.',
      },
    },
    {
      text: {
        tr: 'Penelopeia yine de temkinlidir ve son bir sınav yapar: “Yatağını odadan çıkarın” der. Odysseus öfkelenir, çünkü yatağı taşımak imkânsızdır…',
        en: 'Still Penelope is cautious and sets one last test: “Carry his bed out of the room,” she says. Odysseus is furious, because the bed cannot be moved…',
      },
      gate: { kind: 'choice', prompt: { tr: 'Yatak neden taşınamaz?', en: 'Why can’t the bed be moved?' } },
    },
    {
      text: {
        tr: 'Yatağın sırrını yalnızca ikisi bilir: ayaklarından biri, Odysseus’un kendi elleriyle etrafına oda kurduğu, kök salmış bir zeytin ağacının gövdesidir. Penelopeia koşup ona sarılır. Yirmi yıllık yolculuk, <em>nostos</em>’la biter.',
        en: 'Only the two of them know the bed’s secret: one of its posts is the trunk of a rooted olive tree, around which Odysseus built the room with his own hands. Penelope runs to embrace him. The twenty-year journey ends in <em>nostos</em>.',
      },
      quote: {
        greek: 'ὣς ἄρα τῇ ἀσπαστὸς ἔην πόσις εἰσοροώσῃ, / δειρῆς δ᾽ οὔ πω πάμπαν ἀφίετο πήχεε λευκώ.',
        text: {
          tr: 'Kocası öylesine sevgiliydi ki gözüne; ak kollarını onun boynundan bir türlü çözemiyordu.',
          en: 'So welcome was her husband to her eyes that she could not quite release her white arms from his neck.',
        },
        ref: { tr: 'Odysseia 23.239–240', en: 'Odyssey 23.239–240' },
      },
      aside: {
        title: { tr: 'Mitin izi · Nostalji', en: 'Echo of the myth · Nostalgia' },
        text: {
          tr: '<em>Nostos</em> (eve dönüş) ile <em>algos</em> (acı) sözcüklerinden türeyen “nostalji”, 1688’de İsviçreli hekim Johannes Hofer tarafından, yurdundan uzakta hastalanan askerlerin sıla hastalığını adlandırmak için üretildi.',
          en: '“Nostalgia”, from <em>nostos</em> (homecoming) and <em>algos</em> (pain), was coined in 1688 by the Swiss physician Johannes Hofer to name the homesickness of soldiers who fell ill far from home.',
        },
      },
    },
  ],
  load: () => import('../../../scenes/nostos'),
};
