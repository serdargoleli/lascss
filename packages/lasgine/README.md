# LAS Engine (@las/lasgine)

LAS CSS için JIT motoru. Projedeki dosyaları tarar, kullandığın utility class'ları tespit eder ve sadece ihtiyaç duyulan CSS'i üretir.

## Hızlı Başlangıç

```bash
npm install -D @las/lasgine lascss
pnpm add -D @las/lasgine lascss
yarn add -D @las/lasgine lascss
```

```ts
import fs from "fs";
import { LasEngine } from "@las/lasgine";

const engine = new LasEngine({
  scanDirs: ["src"],
  // extensions, cssExtensions, ignoreDirs varsayılanlarla birleşir
});

engine.init(["./src"]); // ilk tarama
const css = engine.getCSS(); // base + JIT + kullanıcı CSS (purge sonrası)
fs.writeFileSync("public/las.css", css);
```

## Nasıl Çalışır?

- `lascss` paketinden base/meta/utility CSS'ini okur.
- Meta katmanındaki custom property'lerden breakpoint, variant, renk, opacity bilgilerini çıkarır.
- Kodunu tarar (`scanDirs`) ve kullandığın class isimlerine göre CSS üretir.
- `updateFile(path)` ile değişen dosyaları hızlıca işler; `getCSS()` her çağrıda güncel çıktıyı döner.

## API ve Opsiyonlar

- `scanDirs`: Tarama dizinleri. Varsayılan: `["src"]`.
- `extensions`: İçerik taraması için uzantılar. Varsayılan: `.html,.js,.jsx,.ts,.tsx,.vue,.svelte` (+ verdiklerin).
- `cssExtensions`: `@apply` ve purge için CSS/SCSS uzantıları. Varsayılan: `.css,.scss,.sass,.less,.pcss,.styl,.stylus`.
- `ignoreDirs`: Yoksayılacak klasörler. Varsayılan: `node_modules, dist, .git, build, .next, .nuxt, coverage`.
- `getCSS()`: Base + JIT + kullanıcı CSS (unused purge sonrası) birleşik string.
- `getCssFileInfo(css)`: Boyut bilgisi (kB/MB).
- `getWatchedCSSFiles()`: İzlenen CSS dosyalarının listesi (watch entegrasyonu için).
- `reset()`: Dahili state'i temizler (tarama ve cache).

## Notlar

- `lascss` paketi mutlaka kurulu olmalı; base/meta/utility dosyaları oradan okunur.
- İstersen `writeFileSync` ile çıktıyı diske sen yazabilir veya bundler plugin'leri (`@las/vite`, `@las/webpack`) ile otomatik enjekte edebilirsin.
