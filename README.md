# las-css

**las-css**, TailwindCSS tarzında çalışan, tamamen SCSS altyapısıyla dinamik olarak utility sınıfları üreten hafif, esnek ve genişletilebilir bir CSS utility framework’tür.

Kendi tasarım sistemini oluşturmak isteyenler için minimal, hızlı ve özelleştirilebilir bir yapı sunar.

---

## 🚀 Özellikler

- ⚡ **Hafif ve hızlı:** Sadece ihtiyaç duyulan utility sınıfları üretilir.
- 🎨 **SCSS ile tam kontrol:** Tüm utility’ler map ve fonksiyonlarla yönetilir.
- 🧩 **Modüler yapı:** Border, spacing, color scale, typography vb. modüller halinde gelir.
- 🛠️ **Extend edilebilir:** Kendi utility’lerini veya scale’lerini kolayca ekleyebilirsin.
- 🎯 **Utility-first tasarım:** HTML üzerinde hızlı prototip ve final ürün geliştirme.
- 🚀 **JIT Engine:** Development sırasında sadece kullandığınız sınıfları içeren optimize CSS üretir.
- 📱 **Responsive:** `md:flex`, `lg:grid-cols-4` gibi breakpoint varyantları.
- 🎨 **State Variants:** `hover:bg-blue`, `focus:outline` gibi pseudo-class desteği.
- 📦 **Minimal Bundle:** Production'da sadece kullanılan sınıflar (%96-99 tasarruf).

---

## 📥 Kurulum

```bash
npm install las-css
```

Veya pnpm için:

```bash
pnpm add las-css
```

---

## 🔧 Kullanım

### 1. React / Vite / Webpack (Önerilen)

Projenizin ana giriş dosyasına (örneğin `main.jsx`, `App.tsx` veya `index.js`) import edin:

```javascript
import "las-css";
```

> **Not:** Paket otomatik olarak minified CSS dosyasını (`style.min.css`) yükler.

### 2. CDN (Tarayıcı)

Paketi indirmeden doğrudan HTML içinde kullanmak için:

```html
<link href="https://cdn.jsdelivr.net/npm/las-css@latest/dist/style.min.css" rel="stylesheet">
```

---

## 💡 İpucu: IntelliSense (Otomatik Tamamlama)

VS Code kullanıyorsanız, sınıfları otomatik tamamlamak için **"IntelliSense for CSS class names in HTML"** eklentisini kurmanızı öneririz.

Kurulumdan sonra `.vscode/settings.json` dosyanıza şunu ekleyin:

```json
{
  "html-css-class-completion.includeGlobPattern": "**/*.{css,html,jsx,tsx}",
  "html-css-class-completion.enableEmmetSupport": true
}
```

---

## 🏗️ Örnek Utility’ler

### Grid
```html
<div class="grid grid-cols-3 gap-4">...</div>
```

### Border
```html
<div class="border border-solid border-primary-500">...</div>
```

### Scale (Transform)
```html
<div class="scale-105 hover:scale-110">...</div>
```

### Color scale (500 → base value)
```html
<div class="text-primary-500 bg-gray-100">...</div>
```

---

## ⚙️ Geliştirme

Repo’yu klonladıktan sonra:

```bash
npm install
npm run build
```

SCSS kaynakları `src/` klasöründe, çıkış dosyaları `dist/` altındadır.

---

---

## 🚀 JIT Engine (Development)

LAS CSS artık **Just-In-Time (JIT) Engine** ile geliyor! Development sırasında sadece kullandığınız sınıfları içeren optimize edilmiş CSS üretir.

### Kullanım

```bash
# JIT watcher'ı başlat
npm run jit

# Artık HTML dosyalarınızda class kullanmaya başlayın
# public/las.css otomatik olarak güncellenecek
```

### Avantajlar

- ⚡ **Hızlı Development:** Sadece kullandığınız sınıflar üretilir
- 📦 **Küçük Bundle:** 265 KB → 2-10 KB (96-99% tasarruf)
- 🔄 **Hot Reload:** Dosya değişikliklerini anında algılar
- 🎯 **Akıllı Tarama:** HTML, JS, JSX, TS, TSX dosyalarını tarar

Detaylı bilgi için: [`INFO.md`](./INFO.md) ve [`ENGINE-ARCHITECTURE.md`](./ENGINE-ARCHITECTURE.md)

---

## 📚 Dokümantasyon

- **[INFO.md](./INFO.md)** - Proje genel bakış, kullanım kılavuzu, özelleştirme
- **[ENGINE-ARCHITECTURE.md](./ENGINE-ARCHITECTURE.md)** - JIT Engine teknik mimari, veri akışı
- **[CHANGELOG.md](./CHANGELOG.md)** - Sürüm geçmişi

---

## 🧪 Yol Haritası

- [x] Responsive prefix sistemi (sm:, md:, lg:)  
- [x] Variant sistemleri (hover:, focus:, disabled:)  
- [x] JIT Engine
- [ ] Plugin architecture  
- [ ] Production build optimizer
- [ ] VS Code extension
- [ ] Auto-completion support

---

## 📝 Lisans
MIT
