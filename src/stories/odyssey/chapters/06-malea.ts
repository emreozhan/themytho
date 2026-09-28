import type { Chapter } from '../../../story/types';

export const malea: Chapter = {
  id: 'malea',
  part: 'donus',
  title: { tr: 'Malea Burnu', en: 'Cape Malea' },
  label: { tr: 'Malea', en: 'Malea' },
  greek: 'ΜΑΛΕΙΑ',
  place: { tr: 'Mora Yarımadası’nın güneydoğu ucu', en: 'The south-eastern tip of the Peloponnese' },
  at: [23.2, 36.44],
  harbor: [23.34, 36.36],
  labelSide: 'right',
  year: 10,
  ships: 12,
  mood: 'storm',
  zoom: 3.8,
  reveal: 150,
  arrival: {
    id: 'sail',
    via: [[25.3, 40.62], [25.25, 40.3], [25.62, 40.06], [25.55, 39.6], [25.1, 38.9], [24.85, 38.3], [24.7, 38.12], [24.63, 38.0], [24.45, 37.92], [24.2, 37.76], [24.17, 37.6], [24.1, 37.3], [23.8, 36.8]],
    caption: { text: { tr: 'Kuzey rüzgârı gemileri Ege’nin güneyine, Mora’nın en uç burnuna taşır. İthaka artık birkaç gün uzaktadır.', en: 'The north wind carries the ships to the southern Aegean, to the farthest cape of the Peloponnese. Ithaca is now only a few days away.' } },
  },
  end: { mood: 'storm' },
  beats: [
    {
      text: {
        tr: 'Eve çok yakındırlar: Malea Burnu’nu dönüp kuzeybatıya kıvrılsalar İthaka birkaç günlük yoldur.',
        en: 'They are very close to home: once they round Cape Malea and turn north-west, Ithaca is only a few days’ sail.',
      },
    },
    {
      text: {
        tr: 'Tam burnu dönerken Zeus kuzeyden bir fırtına saldırtır. Dalgalar, akıntı ve kuzey rüzgârı Boreas gemileri Kythera açıklarından sürükler.',
        en: 'Just as they round the cape, Zeus unleashes a storm from the north. The waves, the current and Boreas, the north wind, drive the ships past Kythera.',
      },
      gate: { kind: 'hold', prompt: { tr: 'Dümeni tut: basılı tut.', en: 'Hold the helm: press and hold.' } },
      quote: {
        greek: 'ἀλλά με κῦμα ῥόος τε περιγνάμπτοντα Μάλειαν / καὶ Βορέης ἀπέωσε, παρέπλαγξεν δὲ Κυθήρων.',
        text: {
          tr: 'Ama Malea’yı dönerken dalga, akıntı ve Boreas geri itti beni; Kythera’nın açıklarından sürükledi.',
          en: 'But as I rounded Malea, the swell, the current and Boreas drove me back and swept me past Kythera.',
        },
        ref: { tr: 'Odysseia 9.80–81', en: 'Odyssey 9.80–81' },
      },
    },
    {
      text: {
        tr: 'Hiçbir dümenci bu fırtınaya karşı koyamaz. Dokuz gün boyunca sürüklenirler; bu rüzgâr onları bilinen dünyanın dışına, haritaların bitip mitlerin başladığı yere atar.',
        en: 'No helmsman can stand against this storm. For nine days they drift, and the wind flings them out of the known world, to where the maps end and the myths begin.',
      },
      aside: {
        title: { tr: 'Bilinen dünyanın kıyısı', en: 'The edge of the known world' },
        text: {
          tr: 'Odysseus’un bundan sonraki durakları hayal gücünün coğrafyasıdır. Antik çağdan beri yorumcular bu yerleri Sicilya’da, İtalya’da, Kuzey Afrika’da aramıştır; haritadaki konumlar bu geleneklere dayanır.',
          en: 'From here on, Odysseus’s stops belong to a geography of the imagination. Since antiquity, readers have looked for these places in Sicily, Italy and North Africa; the positions on this map follow those traditions.',
        },
      },
    },
  ],
  load: () => import('../../../scenes/malea'),
};
