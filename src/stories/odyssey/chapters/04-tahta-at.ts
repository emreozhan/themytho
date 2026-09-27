import type { Chapter } from '../../../story/types';
import { scene } from '../../../scenes/tahta-at';

const TROY_BEACH: [number, number] = [26.13, 39.99];

export const tahtaAt: Chapter = {
  id: 'tahta-at',
  part: 'savas',
  title: 'Tahta At',
  label: 'Tenedos',
  greek: 'ΔΟΥΡΕΙΟΣ ΙΠΠΟΣ',
  place: 'Tenedos (Bozcaada) ve Troya kapıları',
  at: [26.03, 39.83],
  harbor: [25.95, 39.81],
  labelSide: 'left',
  year: 10,
  ships: 12,
  zoom: 4.2,
  reveal: 150,
  arrival: {
    id: 'feint',
    from: TROY_BEACH,
    via: [[26.02, 39.93]],
    style: 'feint',
    duration: 3,
    caption: { tr: 'Akhalar ordugâhlarını yakar ve denize açılır… Troyalılar savaşın bittiğini sanır.' },
  },
  legs: [{ id: 'return', via: [[26.06, 39.9]], to: TROY_BEACH, style: 'night', duration: 3 }],
  end: { at: TROY_BEACH },
  beats: [
    {
      text: 'On yıllık kuşatmanın sonunda zafer güçle değil, hileyle gelir. Odysseus’un aklıyla usta <em>Epeios</em>, tanrıça Athena’nın yardımıyla kocaman, içi boş bir tahta at yapar.',
      quote: {
        greek: 'ἀλλ᾽ ἄγε δὴ μετάβηθι καὶ ἵππου κόσμον ἄεισον / δουρατέου, τὸν Ἐπειὸς ἐποίησεν σὺν Ἀθήνῃ',
        tr: 'Haydi, konunu değiştir de tahta atın yapılışını söyle; Epeios’un Athena’nın yardımıyla yaptığı atı.',
        ref: 'Odysseia 8.492–493',
      },
    },
    {
      text: 'Atın karnına Odysseus’la birlikte en seçkin savaşçılar gizlenir. Ötekiler ordugâhı yakar ve Tenedos (bugünkü Bozcaada) adasının arkasına saklanır. Troyalılar kıyıda yalnızca devasa bir at bulur.',
    },
    {
      text: 'Troyalılar atı tanrılara sunulmuş bir adak sanır ve surlarının içine çeker.',
      gate: { kind: 'drag', prompt: 'Atı Troya kapısından içeri sürükle.' },
    },
    {
      text: 'Gece çöker. Atın karnındaki kapak açılır, savaşçılar iple aşağı süzülür ve kentin kapılarını açar. Tenedos’ta bekleyen gemilere bir işaret ateşi gerekir.',
      gate: { kind: 'tap', prompt: 'İşaret ateşini yak: meşaleye dokun.' },
    },
    {
      text: 'Troya o gece düşer; on yıllık savaş biter. Akhalar ganimetle gemilerine döner. Şimdi sırada <em>nostos</em>, yani eve dönüş vardır.',
      aside: {
        title: 'Mitin izi · Truva atı',
        text: '“Truva atı” bugün masum görünüp içeri sızan tehlike demektir; bilgisayar dünyasında da kendini zararsız bir program gibi gösteren kötü amaçlı yazılımların adıdır.',
      },
    },
  ],
  scene,
};
