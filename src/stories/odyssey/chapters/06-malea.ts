import type { Chapter } from '../../../story/types';
import { scene } from '../../../scenes/malea';

export const malea: Chapter = {
  id: 'malea',
  part: 'donus',
  title: 'Malea Burnu',
  label: 'Malea',
  greek: 'ΜΑΛΕΙΑ',
  place: 'Mora Yarımadası’nın güneydoğu ucu',
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
    via: [[25.3, 40.35], [25.05, 39.45], [24.55, 38.4], [24.2, 37.5], [23.75, 36.75]],
    caption: { tr: 'Kuzey rüzgârı gemileri Ege’nin güneyine, Mora’nın en uç burnuna taşır. İthaka artık birkaç gün uzaktadır.' },
  },
  end: { mood: 'storm' },
  beats: [
    {
      text: 'Eve çok yakındırlar: Malea Burnu’nu dönüp kuzeybatıya kıvrılsalar İthaka birkaç günlük yoldur.',
    },
    {
      text: 'Tam burnu dönerken Zeus kuzeyden bir fırtına saldırtır. Dalgalar, akıntı ve kuzey rüzgârı Boreas gemileri Kythera açıklarından sürükler.',
      gate: { kind: 'hold', prompt: 'Dümeni tut: basılı tut.' },
      quote: {
        greek: 'ἀλλά με κῦμα ῥόος τε περιγνάμπτοντα Μάλειαν / καὶ Βορέης ἀπέωσε, παρέπλαγξεν δὲ Κυθήρων.',
        tr: 'Ama Malea’yı dönerken dalga, akıntı ve Boreas geri itti beni; Kythera’nın açıklarından sürükledi.',
        ref: 'Odysseia 9.80–81',
      },
    },
    {
      text: 'Hiçbir dümenci bu fırtınaya karşı koyamaz. Dokuz gün boyunca sürüklenirler; bu rüzgâr onları bilinen dünyanın dışına, haritaların bitip mitlerin başladığı yere atar.',
      aside: {
        title: 'Bilinen dünyanın kıyısı',
        text: 'Odysseus’un bundan sonraki durakları hayal gücünün coğrafyasıdır. Antik çağdan beri yorumcular bu yerleri Sicilya’da, İtalya’da, Kuzey Afrika’da aramıştır; haritadaki konumlar bu geleneklere dayanır.',
      },
    },
  ],
  scene,
};
