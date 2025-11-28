# Değişiklik Günlüğü

Projedeki tüm önemli değişiklikler bu dosyada belgelenecektir.

Format [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) standardına dayanır ve proje [Semantic Versioning](https://semver.org/spec/v2.0.0.html) kurallarını takip eder.

## [1.0.5] - 2025-11-20

### 🚀 Önemli Değişiklikler

#### Paket Yapısı Sadeleştirildi

- **CSS Odaklı Kullanım**: Paket artık tamamen CSS dağıtımı üzerine odaklanmıştır. Karmaşıklığı önlemek için SCSS export'ları kaldırıldı.
- **Direkt Import**: React, Vite, Webpack projelerinde `import "las-css"` diyerek doğrudan kullanım sağlandı.
- **Minified Import**: Sıkıştırılmış versiyon için `import "las-css/style.min.css"` desteği eklendi.

#### Temizlik ve Optimizasyon

- **Kök Dizin Temizliği**: `index.scss` ve diğer ara dosyalar kaldırılarak paket yapısı sadeleştirildi.
- **CDN Linkleri**: jsDelivr linkleri güncellendi ve standartlaştırıldı.

### 📦 Nasıl Güncellenir?

- `npm install las-css@latest` komutu ile son sürüme geçebilirsiniz.
- Eğer `@use "las-css"` kullanıyorsanız, lütfen `import "las-css"` (JS import) yöntemine geçin.

---

## [1.0.4] - 2025-11-20

### ✨ Yeni Özellikler

#### Renk Sistemi Geliştirmeleri

- **RGB Tabanlı CSS Değişkenleri**: Tüm renk değişkenleri artık RGB kanalları kullanıyor (örn: `--las-red-500: 239 68 68`)
- **Opacity Modifier Desteği**: Tailwind CSS tarzında opacity modifier'ları eklendi
  - Kullanım: `bg-red-500/90`, `text-blue-600/50`, `border-green-500/25`
  - Desteklenen özellikler: `bg-*`, `text-*`, `border-*`, `outline-*`, `decoration-*`, `caret-*`, `fill-*`, `stroke-*`
  - Mevcut opacity değerleri: 0, 5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100

#### Gölge (Shadow) Utilities

- **Box Shadow**: Yeni box-shadow utility class'ları eklendi
  - `shadow-sm`, `shadow`, `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl`
  - `shadow-inner` (iç gölge), `shadow-none` (gölge yok)
  - `--las-shadow-color` CSS değişkeni ile özelleştirilebilir gölge rengi
  - Renk utility'leri ile gölge rengi kontrolü (örn: `shadow-red-500`)

#### Text Shadow Utilities

- **Text Shadow**: Yeni text-shadow utility class'ları eklendi
  - `text-shadow-sm`, `text-shadow`, `text-shadow-md`, `text-shadow-lg`, `text-shadow-none`
  - `--las-text-shadow-color` CSS değişkeni ile özelleştirilebilir metin gölgesi rengi
  - Renk utility'leri ile metin gölgesi rengi kontrolü (örn: `text-shadow-blue-500`)

#### Temel Renkler

- **Yeni Renkler**: `white`, `black` ve `transparent` renkleri eklendi
- Temiz class isimleri: `.bg-white`, `.text-black`, `.border-transparent` (sayısal suffix yok)

### 🏗️ Mimari İyileştirmeler

#### CSS Değişkenlerinin Konsolidasyonu

- Tüm CSS değişkenleri artık tek bir dosyada tanımlanıyor: `variables/_root.scss`
- Utility dosyalarındaki dağınık `:root` blokları kaldırıldı
- Daha iyi organizasyon ve bakım kolaylığı

#### Optimize Edilmiş Kod Üretimi

- Opacity modifier'lar için `@extend` kullanılarak CSS çıktı boyutu azaltıldı
- Opacity ölçeği 23'ten 15 değere düşürüldü (~%35 daha küçük CSS)
- SCSS modül import'larındaki döngüsel bağımlılıklar giderildi

### 🐛 Hata Düzeltmeleri

- Sass bölme işlemi deprecation uyarıları düzeltildi
- SCSS import'larındaki modül döngüsü hataları çözüldü
- Eksik CSS değişken tanımlamaları eklendi
- `--las-shadow-color` ve `--las-text-shadow-color` tanımlanmamış değişken hataları giderildi

### 🔧 Teknik Detaylar

#### Yeni Fonksiyonlar

- `to-rgb($color)`: Renkleri RGB kanallarına dönüştüren yardımcı fonksiyon eklendi

#### Güncellenmiş Mixin'ler

- `generate-color-vars`: RGB kanalları kullanacak şekilde güncellendi
- `generate-color-utilities`: Opacity desteği için `rgb()` syntax'ı kullanıyor
- Opacity modifier class'ları otomatik olarak üretiliyor

#### Dosya Yapısı

- **Yeni**: `variables/_root.scss` - Merkezi CSS değişken tanımlamaları
- **Yeni**: `variables/_shadow.scss` - Box shadow değişkenleri
- **Yeni**: `variables/_text-shadow.scss` - Text shadow değişkenleri
- **Yeni**: `utilities/_shadow.scss` - Box shadow utility'leri
- **Yeni**: `utilities/_text-shadow.scss` - Text shadow utility'leri
- **Güncellendi**: `core/_functions.scss` - `to-rgb()` fonksiyonu eklendi
- **Güncellendi**: `mixins/_color.scss` - RGB ve opacity desteği
- **Güncellendi**: `variables/_opacity.scss` - Optimize edilmiş opacity ölçeği

### 📊 Performans İyileştirmeleri

- CSS dosya boyutu ~%35 azaltıldı (opacity değerlerinin optimizasyonu sayesinde)
- Daha az tekrarlanan CSS kuralları (`@extend` kullanımı ile)
- Daha hızlı build süresi

### 📝 Kullanım Örnekleri

```html
<!-- Opacity Modifiers -->
<div class="bg-red-500/90">%90 opacity ile kırmızı arka plan</div>
<div class="text-blue-600/50">%50 opacity ile mavi metin</div>

<!-- Box Shadows -->
<div class="shadow-lg">Büyük gölge</div>
<div class="shadow-red-500">Kırmızı gölge</div>

<!-- Text Shadows -->
<h1 class="text-shadow-lg">Büyük metin gölgesi</h1>
<h2 class="text-shadow-blue-500">Mavi metin gölgesi</h2>

<!-- Temel Renkler -->
<div class="bg-white text-black border-transparent">
  Beyaz arka plan, siyah metin
</div>
```

### ⚠️ Önemli Notlar

1. **CSS Değişken Formatı**: CSS değişkenleri artık RGB kanalları kullanıyor

   ```css
   /* Eski format */
   --las-red-500: #ef4444;

   /* Yeni format */
   --las-red-500: 239 68 68;
   ```

2. **Direkt CSS Değişken Kullanımı**: Eğer CSS değişkenlerini özel CSS'inizde kullanıyorsanız:

   ```css
   /* Eski kullanım */
   .custom {
     color: var(--las-red-500);
   }

   /* Yeni kullanım */
   .custom {
     color: rgb(var(--las-red-500) / 1);
   }
   ```

3. **Utility Class'ları**: Tüm utility class isimleri aynı kaldı, geriye dönük uyumlu

### 📊 Karşılaştırma Tablosu

| Özellik               | v1.0.3   | v1.0.4                         |
| --------------------- | -------- | ------------------------------ |
| Opacity Modifiers     | ❌       | ✅ (15 değer)                  |
| Box Shadow            | ❌       | ✅ (8 varyant)                 |
| Text Shadow           | ❌       | ✅ (5 varyant)                 |
| Temel Renkler         | ❌       | ✅ (white, black, transparent) |
| CSS Değişken Formatı  | Hex      | RGB Kanalları                  |
| Opacity Değer Sayısı  | 23       | 15 (optimize)                  |
| CSS Dosya Boyutu      | Standart | ~%35 daha küçük                |
| Deprecation Uyarıları | ✅ Var   | ❌ Yok                         |

### 🔄 Migrasyon Rehberi

#### Mevcut Projeler İçin

Eğer sadece utility class'ları kullanıyorsanız, **hiçbir değişiklik gerekmez**. Tüm class'lar geriye dönük uyumlu.

#### Özel CSS Kullananlar İçin

Eğer CSS değişkenlerini direkt kullanıyorsanız:

**Seçenek 1: Utility Class Kullan (Önerilen)**

```html
<!-- Eski -->
<div style="color: var(--las-red-500)">Metin</div>

<!-- Yeni -->
<div class="text-red-500">Metin</div>
```

**Seçenek 2: RGB Formatına Geç**

```css
/* Eski */
.custom {
  background: var(--las-blue-500);
}

/* Yeni */
.custom {
  background: rgb(var(--las-blue-500) / 1);
}
```

### 🎯 Gelecek Planlar

- [ ] JIT (Just-In-Time) mode desteği
- [ ] Daha fazla renk paleti seçeneği
- [ ] Dark mode utilities
- [ ] Container queries desteği
- [ ] Gradient utilities

---

### 👥 Katkıda Bulunanlar

Bu sürüm için katkıda bulunanlara teşekkürler! 🙏
