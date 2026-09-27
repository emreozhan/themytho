# Mitos Atlası · Cilt I: Odysseia

Yunan mitolojisini harita üzerinde anlatan, etkileşimli bir **atlas-hikâye** sitesi.
İlk cilt, Odysseus’un yirmi yıllık yolculuğunu izler: İthaka’dan Avlis’e, Troya
kuşatmasından Tahta At’a, ve eve dönüşün (nostos) on üç durağına.

Harita kırmızı figürlü bir vazo gibi boyanmıştır (kara sır deniz, pişmiş toprak
karalar); her durakta haritadaki işaretten bir **kylix kupasının iç resmi (tondo)**
yükselir ve sahne siyah figürlü vazo ressamlarının diliyle canlanır. Hikâye kendi
kendine akmaz: okuyucu dokunur, basılı tutar, sürükler ve karar verir.

> English: an interactive, frontend-only “atlas story” of Greek myth. Volume I
> follows Odysseus across a Mediterranean painted like a red-figure vase; every
> stop opens a black-figure cup painting you interact with. Everything you see is
> SVG generated in code; everything you hear is synthesised with Web Audio.

## Öne çıkanlar

- **18 durak, 4 bölüm** — Çağrı, Troya Savaşı, Dönüş, İthaka. Her durakta kısa
  notlar, Homeros’tan özgün Yunanca bir dize ve Türkçe çevirisi, “Mitin izi”
  kutucukları (mentor, nostalji, siren, Truva atı…).
- **Etkileşim kapıları** — her bölüm okuyucuyu bekler: dokun, basılı tut,
  sürükle, seç (ör. Kyklop’a adını söyle: “Kimse”; Sirenlere karşı dayan;
  yayı ger ve oku on iki baltadan geçir).
- **Canlı atlas** — Natural Earth verisinden üretilmiş kıyı çizgileri; filo rota
  boyunca yelken açar, yol çizilerek belirir, batının “bilinmeyen diyarları”
  sisin ardından keşfedildikçe açılır; gemiler batar, yıllar sayılır,
  Poseidon’un gazabı başlar.
- **Hepsi SVG** — figürler (siyah figürlü insan iskeleti), hayvanlar, gemiler,
  menderes bordürleri ve vazo yazıtı tarzı Yunan harfleri kodla çizilir.
- **Ses** — deniz, lir (Dor modu), rüzgâr, gök gürültüsü, Sirenler… Web Audio
  ile sentezlenir, varsayılan olarak kapalıdır.
- **Erişilebilirlik** — klavyeyle tam kullanım, `prefers-reduced-motion` desteği,
  ekran okuyucu duyuruları, mobil yerleşim.

## Kullanım

| Eylem | Kısayol |
| --- | --- |
| Devam / sonraki ritim | `→`, `Boşluk`, `Enter`, fare tekerleği, kaydırma |
| Önceki bölüm | `←` |
| Basılı tutma kapıları | `Boşluk`’u basılı tut |
| Ses aç/kapa | `M` veya lir simgesi |
| Bölümler listesi | `B` veya menderes simgesi |

Her bölümün kalıcı bir adresi vardır, ör. `#/odysseia/kyklop`.

## Geliştirme

Gereksinim: Node 22+.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/ (statik, her yerde barındırılabilir)
npm test           # birim testleri (Vitest)
npm run typecheck
```

Geliştirme sayfaları:

- `scene.html?ch=<bölüm-id>&beat=<n>` — tek bir bölümü gerçek harita ve panelle
  yalıtılmış olarak çalıştırır (sahne geliştirirken).
- `routes.html` — bütün rota ayaklarını çizer ve karadan geçen bir yer varsa raporlar.
- `lab.html?piece=figures|animals|ship|kit|letters|ornaments` — çizim kitini tek tek gösterir.

Kıyı çizgilerini yeniden üretmek için: `npm run map:build`.

## Yapı

```
src/
  map/        projeksiyon, kamera (yumuşak yakınlaşma), atlas katmanları, filo, süslemeler
  art/        figür iskeleti, hayvanlar, gemi, bordürler, Yunan harfleri, sahne kiti
  story/      veri modeli, hikâye motoru, etkileşim kapıları
  scenes/     her bölümün tondo sahnesi (+ ortak araçlar)
  stories/    ciltler; odyssey/ altında 18 bölüm verisi
  ui/         kapak, üst bar, panel, zaman çizelgesi, bölüm listesi, final
  audio/      Web Audio sentezi
docs/SCENE_GUIDE.md   yeni sahne çizme rehberi
scripts/              kıyı çizgisi üreticisi
```

## Yeni bir cilt eklemek

1. `src/stories/<cilt>/` altında bölümleri tanımla: konum (boylam/enlem),
   liman, varış rotası (`arrival.via`), yıl, gemi sayısı, ritimler ve kapılar.
2. Her bölüm için `src/scenes/<id>.ts` sahnesini `docs/SCENE_GUIDE.md`’ye göre çiz.
3. `routes.html` ile rotaların denizde kaldığını doğrula.
4. Kapaktaki cilt listesini (`src/ui/cover.ts`) güncelle.

## Yayınlama

`dist/` klasörü tamamen statiktir (göreli yollar). Depodaki
`.github/workflows/deploy.yml`, `main` dalına her gönderimde siteyi
GitHub Pages’e yayınlar (Settings → Pages → Source: GitHub Actions).

## Kaynaklar ve lisanslar

- Homeros, *İlyada* ve *Odysseia* (MÖ 8. yy); K. P. Kavafis, *İthaka* (1911).
  Yunanca metinler kamu malıdır; Türkçe çeviriler bu proje için yapılmıştır.
- Savaş öncesi bazı sahneler (Palamedes, Skyros’taki Akhilleus, İphigeneia)
  Homeros sonrası Epik Döngü’den gelir.
- Haritadaki konumlar antik ve modern yorum geleneklerini izler; Odysseus’un
  yolculuğunun kesin coğrafyası bilinmez.
- Kıyı verisi: [Natural Earth](https://www.naturalearthdata.com/) (kamu malı),
  `world-atlas` paketi aracılığıyla.
- Yazı tipleri: Cinzel ve EB Garamond (SIL Open Font License), `@fontsource` ile.
- Animasyon: [GSAP](https://gsap.com/) (Standard “No Charge” License).
