# LAS CSS

Utility-first, SCSS tabanlı tasarım sistemi. Base, meta ve utility katmanlarını birleştirir; JIT üretim için LAS Engine ile çalışır.

## Hızlı Başlangıç

- Kurulum:

```bash
npm install lascss
pnpm add lascss
yarn add lascss
```

- Paketler: `dist/base.min.css`, `dist/meta.min.css`, `dist/utility.min.css`
- Kullanım (tam paket):

## Nasıl Çalışır?

- Base: Reset + temel tipografi ve grid ayarları.
- Meta: Breakpoint, variant, renk ve opacity değişkenlerini CSS custom properties olarak hazırlar.
- Utility: Hazır class setleri. LAS Engine, bu dosyayı okuyup kullandığın class'lara göre CSS üretir.

## JIT (LAS Engine) ile Kullanım

- LAS Engine varsayılan utility'leri ve meta değişkenlerini bu paketten okur.
- `@las/vite` veya `@las/webpack` plugin'leriyle birlikte kullanarak sadece kullandığın class'ların CSS'ini üretip projeye enjekte edebilirsin.
