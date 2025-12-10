# @las/webpack

LAS CSS + LAS Engine için Webpack plugin'i. Projeyi tarar, kullandığın utility class'ları JIT üretir ve dev modunda sanal modül üzerinden, prod'da ise inline veya harici CSS olarak sunar.

## Kurulum

```bash
npm install -D lascss @las/webpack
pnpm add -D lascss @las/webpack
yarn add -D lascss @las/webpack
```

## Kullanım

`webpack.config.js`:

```js
//commonjs
const lascss = require("@las/webpack").default;
// ESM
import lascss from "@las/webpack";

module.exports = {
  // ...
  plugins: [
    new lascss({
      scanDirs: ["src"], // varsayılan: ["src"]
      extensions: [".tsx", ".jsx"], // varsayılanlarla birleşir
      ignoreDirs: ["dist"], // varsayılanlarla birleşir
      // output: "assets/las.css",  // prod'da ayrı dosya olarak yaz ve HtmlWebpackPlugin'e ekle
    }),
  ],
};
```

Uygulama girişi:

```js
import "las.css"; // plugin sanal modülü gerçek CSS ile değiştirir
```

## Nasıl Çalışır?

- LAS Engine, `scanDirs` altındaki dosyaları ve CSS/SCSS'leri tarar; kullanılan class'lara göre CSS üretir.
- Dev: CSS `las.css` sanal modülüne yazılır, HMR ile güncellenir.
- Prod:
  - `output` verilmezse CSS inline tutulur (style-loader senaryosu yoksa sanal modül boş geçilebilir).
  - `output` verilirse derleme çıktısına dosya olarak ekler; HtmlWebpackPlugin varsa `link rel="stylesheet"` otomatik eklenir.

## Opsiyonlar (LasEngineOptions)

- `scanDirs`: Tarama dizinleri. Varsayılan: `["src"]`.
- `extensions`: İçerik uzantıları (html, js, ts, vue, svelte vb. ile birleşir).
- `cssExtensions`: CSS/SCSS uzantıları (varsayılanlarla birleşir).
- `ignoreDirs`: Yoksayılacak klasörler (varsayılanlarla birleşir).
- `output`: Prod'da oluşturulacak CSS dosyasının yolu (örn. `css/las.css`).
