import type { Chapter } from '../../../story/types';

const TROY_BEACH: [number, number] = [26.13, 39.99];

export const tahtaAt: Chapter = {
  id: 'tahta-at',
  part: 'savas',
  title: { tr: 'Tahta At', en: 'The Wooden Horse' },
  label: { tr: 'Tenedos', en: 'Tenedos' },
  greek: 'ΔΟΥΡΕΙΟΣ ΙΠΠΟΣ',
  place: { tr: 'Tenedos (Bozcaada) ve Troya kapıları', en: 'Tenedos (Bozcaada) and the gates of Troy' },
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
    caption: { text: { tr: 'Akhalar ordugâhlarını yakar ve denize açılır… Troyalılar savaşın bittiğini sanır.', en: 'The Achaeans burn their camp and put out to sea… The Trojans believe the war is over.' } },
  },
  legs: [{ id: 'return', via: [[26.06, 39.9]], to: TROY_BEACH, style: 'night', duration: 3 }],
  end: { at: TROY_BEACH },
  beats: [
    {
      text: {
        tr: 'On yıllık kuşatmanın sonunda zafer güçle değil, hileyle gelir. Odysseus’un aklıyla usta <em>Epeios</em>, tanrıça Athena’nın yardımıyla kocaman, içi boş bir tahta at yapar.',
        en: 'After ten years of siege, victory comes by cunning, not by force. From Odysseus’s plan the master builder <em>Epeius</em>, helped by the goddess Athena, makes a huge, hollow wooden horse.',
      },
      quote: {
        greek: 'ἀλλ᾽ ἄγε δὴ μετάβηθι καὶ ἵππου κόσμον ἄεισον / δουρατέου, τὸν Ἐπειὸς ἐποίησεν σὺν Ἀθήνῃ',
        text: {
          tr: 'Haydi, konunu değiştir de tahta atın yapılışını söyle; Epeios’un Athena’nın yardımıyla yaptığı atı.',
          en: 'But come now, change your theme and sing of the building of the wooden horse, which Epeius made with Athena’s help.',
        },
        ref: { tr: 'Odysseia 8.492–493', en: 'Odyssey 8.492–493' },
      },
    },
    {
      text: {
        tr: 'Atın karnına Odysseus’la birlikte en seçkin savaşçılar gizlenir. Ötekiler ordugâhı yakar ve Tenedos (bugünkü Bozcaada) adasının arkasına saklanır. Troyalılar kıyıda yalnızca devasa bir at bulur.',
        en: 'The finest warriors hide in the horse’s belly with Odysseus. The rest burn their camp and hide behind the island of Tenedos (today’s Bozcaada). On the shore the Trojans find only a gigantic horse.',
      },
    },
    {
      text: {
        tr: 'Troyalılar atı tanrılara sunulmuş bir adak sanır ve surlarının içine çeker.',
        en: 'The Trojans take the horse for an offering to the gods and haul it inside their walls.',
      },
      gate: { kind: 'drag', prompt: { tr: 'Atı Troya kapısından içeri sürükle.', en: 'Drag the horse through the gate of Troy.' } },
    },
    {
      text: {
        tr: 'Gece çöker. Atın karnındaki kapak açılır, savaşçılar iple aşağı süzülür ve kentin kapılarını açar. Tenedos’ta bekleyen gemilere bir işaret ateşi gerekir.',
        en: 'Night falls. The hatch in the horse’s belly opens, the warriors slide down a rope and open the city gates. The ships waiting at Tenedos need a signal fire.',
      },
      gate: { kind: 'tap', prompt: { tr: 'İşaret ateşini yak: meşaleye dokun.', en: 'Light the signal fire: touch the torch.' } },
    },
    {
      text: {
        tr: 'Troya o gece düşer; on yıllık savaş biter. Akhalar ganimetle gemilerine döner. Şimdi sırada <em>nostos</em>, yani eve dönüş vardır.',
        en: 'Troy falls that night, and ten years of war are over. The Achaeans return to their ships with their plunder. Now comes the <em>nostos</em>: the journey home.',
      },
      aside: {
        title: { tr: 'Mitin izi · Truva atı', en: 'Echo of the myth · Trojan horse' },
        text: {
          tr: '“Truva atı” bugün masum görünüp içeri sızan tehlike demektir; bilgisayar dünyasında da kendini zararsız bir program gibi gösteren kötü amaçlı yazılımların adıdır.',
          en: 'Today a “Trojan horse” is a danger that slips inside looking harmless; in computing, it is the name for malicious software disguised as a harmless program.',
        },
      },
    },
  ],
  load: () => import('../../../scenes/tahta-at'),
};
