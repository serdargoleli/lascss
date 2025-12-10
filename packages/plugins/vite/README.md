# @las/vite

LAS CSS + LAS Engine için Vite plugin'i. Projeyi tarar, sadece kullandığın utility class'ların CSS'ini üretir ve dev modunda sanal modül üzerinden, build'de HTML'e inline yazar.

## Kurulum

```bash
npm install -D lascss @las/vite
pnpm add -D lascss @las/vite
yarn add -D lascss @las/vite
```

## Kullanım

`vite.config.ts`:

```ts
import { defineConfig } from "vite";
import lascss from "@las/vite";

export default defineConfig({
  plugins: [
    lascss({
      scanDirs: ["src"], // varsayılan: ["src"]
      extensions: [".tsx", ".jsx"], // varsayılanlarla birleşir
      ignoreDirs: ["dist"], // varsayılanlarla birleşir
    }),
  ],
});
```

Uygulama girişi:

```ts
import "virtual:las.css"; // dev'de sanal modül, build'de inline stil
```

## Nasıl Çalışır?

- LAS Engine, `scanDirs` altındaki dosyaları ve CSS/SCSS'leri tarar.
- Kullanılan class'lara göre JIT CSS üretir.
- Dev'de: `virtual:las.css` modülüyle CSS'i Vite dev server'a verir.
- Build'de: CSS minify edilir ve `index.html` head içine inline yazılır (ayrı dosya oluşturmaz).

## Opsiyonlar (LasEngineOptions)

- `scanDirs`: Tarama dizinleri. Varsayılan: `["src"]`.
- `extensions`: İçerik uzantıları (html, js, ts, vue, svelte vb. ile birleşir).
- `cssExtensions`: CSS/SCSS uzantıları (varsayılanlarla birleşir).
- `ignoreDirs`: Yoksayılacak klasörler (varsayılanlarla birleşir).
