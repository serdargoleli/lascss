# 🚀 LAS CSS - Utility-First CSS Framework

## 📖 Proje Nedir?

**LAS CSS**, modern web geliştirme için tasarlanmış, **utility-first** (yardımcı sınıf öncelikli) bir CSS framework'üdür. Tailwind CSS benzeri bir yaklaşım sunar ancak **tamamen özelleştirilebilir** ve **JIT (Just-In-Time) engine** ile donatılmıştır.

### 🎯 Temel Özellikler

✅ **Utility-First Yaklaşım** - `flex`, `text-center`, `bg-blue` gibi tek amaçlı CSS sınıfları  
✅ **SASS ile Özelleştirilebilir** - Tüm değişkenler (renkler, breakpoint'ler, spacing vb.) SASS ile düzenlenebilir  
✅ **JIT Engine** - Sadece kullandığınız sınıfları içeren optimize edilmiş CSS üretir  
✅ **Responsive Design** - `md:flex`, `lg:grid-cols-4` gibi breakpoint varyantları  
✅ **State Variants** - `hover:bg-blue`, `focus:outline` gibi pseudo-class varyantları  
✅ **Minimal Bundle Size** - Sadece kullanılan sınıflar production'a gider  

---

## 🏗️ Proje Yapısı

```
las-ui/
├── src/                          # SASS kaynak dosyaları
│   ├── variables/                # Özelleştirilebilir değişkenler
│   │   ├── _color.scss          # Renk paleti
│   │   ├── _breakpoint.scss     # Responsive breakpoint'ler
│   │   ├── _spacing.scss        # Margin, padding değerleri
│   │   ├── _typography.scss     # Font boyutları, ağırlıkları
│   │   └── ...                  # Diğer değişkenler
│   ├── utilities/                # Utility sınıfları
│   │   ├── _flex.scss           # Flexbox utilities
│   │   ├── _grid.scss           # Grid utilities
│   │   ├── _text.scss           # Typography utilities
│   │   └── ...                  # Diğer utilities
│   ├── core/                     # Temel stil dosyaları
│   ├── mixins/                   # SASS mixin'leri
│   ├── main.scss                 # Ana SASS dosyası
│   ├── utility.scss              # Utility sınıfları entry point
│   └── meta.scss                 # Breakpoint ve variant tanımları
│
├── engine/                       # LAS JIT Engine
│   ├── engine/                   # Engine core dosyaları
│   │   ├── scanner.ts           # HTML/JS dosyalarını tarar
│   │   ├── parser.ts            # CSS'i parse eder
│   │   ├── generator.ts         # Dinamik CSS üretir
│   │   ├── watcher.ts           # Dosya değişikliklerini izler
│   │   ├── writer.ts            # CSS dosyasını yazar
│   │   ├── config.ts            # Breakpoint/variant config
│   │   └── read.ts              # CSS dosyalarını okur
│   └── build/
│       └── lasgine.ts           # JIT watcher başlatıcı
│
├── dist/                         # Build çıktıları (npm paketi)
├── public/                       # JIT engine çıktısı
│   └── las.css                  # Dinamik üretilen CSS
└── package.json
```

---

## 🔄 Sistem Akışı

### 1️⃣ **SASS Build Süreci** (Geliştirme Öncesi)

```
SASS Variables (src/variables/)
        ↓
    Compile
        ↓
utility.min.css (4860+ utility class)
        ↓
meta.min.css (breakpoint & variant tanımları)
```

**Adımlar:**
1. `src/variables/` klasöründeki değişkenler düzenlenir (renkler, spacing vb.)
2. `npm run build` komutu çalıştırılır
3. SASS derleyici tüm utility sınıflarını üretir
4. `dist/utility.min.css` dosyası oluşturulur (tüm sınıflar)
5. `engine/utility.min.css` kopyalanır (JIT engine için kaynak)

### 2️⃣ **JIT Engine Süreci** (Development)

```
npm run jit
    ↓
1. utility.min.css yüklenir (4860 class)
2. meta.min.css'den breakpoint/variant okunur
3. HTML/JS dosyaları taranır
4. Kullanılan classlar bulunur
    ↓
Watcher Başlar
    ↓
Dosya Değişikliği Algılanır
    ↓
Değişen Dosya Taranır
    ↓
Yeni Classlar Bulunur
    ↓
CSS Dinamik Üretilir
    ↓
public/las.css güncellenir
```

**Detaylı Akış:**

#### **Başlangıç (Initialization)**
```typescript
// 1. Base CSS yükleme
readBaseCSS() → utility.min.css okunur
    ↓
// 2. CSS Parse
parserCSS() → Her class bir Map'e kaydedilir
    Map<"flex", "display:flex">
    Map<"text-center", "text-align:center">
    ↓
// 3. Config yükleme
loadConfig() → meta.min.css'den breakpoint ve variant okunur
    screens: { sm: "40rem", md: "48rem", ... }
    variants: { hover: ":hover", focus: ":focus", ... }
    ↓
// 4. İlk tarama
scanDirectory() → src/template/ klasöründeki tüm HTML/JS dosyaları taranır
    Regex ile class="..." içindeki sınıflar bulunur
    Set<"flex", "text-center", "md:grid-cols-2">
    ↓
// 5. CSS üretimi
writeCSS() → Bulunan sınıflar için CSS üretilir
    .flex { display:flex }
    .text-center { text-align:center }
    @media (min-width: 48rem) {
      .md\:grid-cols-2 { grid-template-columns: repeat(2, 1fr) }
    }
```

#### **Watcher Modu (File Changes)**
```typescript
// Dosya değişikliği algılandı
watcher.on('change', (filePath) => {
    ↓
    // Sadece değişen dosyayı tara
    scanFile(filePath)
    ↓
    // Yeni classları bul
    newClasses.forEach(cls => {
        if (!usedAllClasses.has(cls)) {
            usedAllClasses.add(cls)
        }
    })
    ↓
    // CSS'i yeniden üret
    writeCSS(usedAllClasses, cssMap, config, outputPath)
    ↓
    // public/las.css güncellendi ✅
})

// Yeni dosya eklendi
watcher.on('add', (filePath) => {
    // Aynı işlem
})
```

### 3️⃣ **CSS Üretim Detayları**

#### **Normal Class**
```typescript
Input: "flex"
    ↓
cssMap.get("flex") → "display:flex"
    ↓
Output: .flex { display:flex }
```

#### **Breakpoint Variant**
```typescript
Input: "md:text-center"
    ↓
Split → prefix: "md", class: "text-center"
    ↓
screens["md"] → "48rem"
cssMap.get("text-center") → "text-align:center"
    ↓
Output: 
@media (min-width: 48rem) {
  .md\:text-center { text-align:center }
}
```

#### **State Variant**
```typescript
Input: "hover:bg-blue"
    ↓
Split → prefix: "hover", class: "bg-blue"
    ↓
variants["hover"] → ":hover"
cssMap.get("bg-blue") → "background-color:#3b82f6"
    ↓
Output: .hover\:bg-blue:hover { background-color:#3b82f6 }
```

---

## 🛠️ Kullanım

### **1. Geliştirme Ortamı Kurulumu**

```bash
# Bağımlılıkları yükle
npm install

# SASS build (ilk kurulumda)
npm run build

# JIT watcher'ı başlat
npm run jit
```

### **2. HTML'de Kullanım**

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="./public/las.css">
</head>
<body>
    <!-- Utility sınıfları kullan -->
    <div class="flex justify-center items-center h-screen">
        <div class="text-center">
            <h1 class="text-4xl font-bold text-blue">Merhaba LAS CSS!</h1>
            <p class="mt-4 text-gray">Utility-first CSS framework</p>
            
            <!-- Responsive -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="p-4 bg-blue hover:bg-indigo">Kart 1</div>
                <div class="p-4 bg-blue hover:bg-indigo">Kart 2</div>
                <div class="p-4 bg-blue hover:bg-indigo">Kart 3</div>
                <div class="p-4 bg-blue hover:bg-indigo">Kart 4</div>
            </div>
        </div>
    </div>
</body>
</html>
```

### **3. Özelleştirme**

#### **Renkleri Değiştir**
```scss
// src/variables/_color.scss
$colors: (
    "primary": #FF6B6B,    // Kendi renginiz
    "secondary": #4ECDC4,
    "accent": #FFE66D,
    // ...
);
```

#### **Breakpoint'leri Değiştir**
```scss
// src/variables/_breakpoint.scss
$breakpoints: (
    'tablet': 768px,      // Kendi breakpoint'leriniz
    'desktop': 1024px,
    'wide': 1440px,
);
```

#### **Spacing Değerlerini Değiştir**
```scss
// src/variables/_spacing.scss
$spacing: (
    '1': 0.25rem,
    '2': 0.5rem,
    '4': 1rem,
    '8': 2rem,
    // ...
);
```

#### **Build Al**
```bash
# Değişiklikleri derle
npm run build

# JIT engine'i yeniden başlat
npm run jit
```

---

## 🎨 Özelleştirme Rehberi

### **Yeni Utility Sınıfı Eklemek**

1. **SASS dosyası oluştur:**
```scss
// src/utilities/_custom.scss
@use "../variables" as *;

@each $name, $value in $colors {
    .border-#{$name} {
        border: 2px solid #{$value};
    }
}
```

2. **Ana dosyaya ekle:**
```scss
// src/utility.scss
@use "./utilities/custom";
```

3. **Build al:**
```bash
npm run build
```

### **Yeni Variant Eklemek**

```scss
// src/variables/_variant.scss
$variants: (
    'hover': ':hover',
    'focus': ':focus',
    'active': ':active',
    'disabled': ':disabled',
    'first': ':first-child',  // Yeni variant
    'last': ':last-child',    // Yeni variant
);
```

---

## 📊 JIT Engine Avantajları

### **Geleneksel Yaklaşım**
```
❌ Tüm CSS dosyası yüklenir (500KB+)
❌ Kullanılmayan binlerce sınıf
❌ Yavaş sayfa yükleme
❌ Gereksiz bant genişliği kullanımı
```

### **LAS JIT Engine**
```
✅ Sadece kullanılan sınıflar (5-50KB)
✅ Dinamik üretim
✅ Hızlı geliştirme
✅ Optimize edilmiş production build
```

### **Örnek Karşılaştırma**

| Dosya | Geleneksel | LAS JIT |
|-------|-----------|---------|
| utility.min.css | 265 KB | - |
| public/las.css | - | 2-10 KB |
| **Tasarruf** | - | **%96-99** |

---

## 🔧 NPM Komutları

```bash
# SASS build (tüm utility sınıflarını üret)
npm run build

# Sadece utility sınıflarını derle
npm run build:utility

# Sadece meta dosyasını derle
npm run build:meta

# JIT watcher başlat (development)
npm run jit

# SASS watch modu
npm run watch

# Temizle ve yeniden build
npm run clean && npm run build
```

---

## 🚀 Production Build

Development sırasında `public/las.css` sürekli güncellenir ve **sadece ekleme** yapılır (silme yapılmaz, performans için).

Production için:
1. Tüm dosyalarınızı tamamlayın
2. `npm run jit` ile son kez çalıştırın
3. `public/las.css` dosyası production'a hazırdır
4. Sadece kullandığınız sınıfları içerir

---

## 📚 Teknik Detaylar

### **Scanner (scanner.ts)**
- HTML, JS, JSX, TS, TSX dosyalarını tarar
- Regex ile `class="..."` içindeki sınıfları bulur
- Whitespace ve satır sonlarını handle eder

### **Parser (parser.ts)**
- `utility.min.css` dosyasını parse eder
- Her sınıfı `Map<className, cssRule>` formatında saklar

### **Generator (generator.ts)**
- Breakpoint ve state varyantlarını üretir
- Media query ve pseudo-class'ları oluşturur

### **Writer (writer.ts)**
- Üretilen CSS'i dosyaya yazar
- Header comment ekler
- Dosya boyutunu optimize eder

### **Watcher (watcher.ts)**
- Chokidar ile dosya değişikliklerini izler
- `add` ve `change` eventlerini handle eder
- Incremental update yapar (sadece yeni sınıflar)

---

## 🎯 Kullanım Senaryoları

### **Senaryo 1: Yeni Proje**
```bash
npm install
npm run build
npm run jit
# HTML'de class kullanmaya başla
```

### **Senaryo 2: Renkleri Özelleştir**
```bash
# src/variables/_color.scss düzenle
npm run build
npm run jit
# Yeni renkler kullanıma hazır
```

### **Senaryo 3: Production Build**
```bash
npm run build
npm run jit
# Projeyi tamamla
# public/las.css → production'a deploy et
```

---

## 🤝 Katkıda Bulunma

Bu proje açık kaynaklıdır ve katkılara açıktır!

---

## 📄 Lisans

MIT License - Detaylar için `LICENSE` dosyasına bakın.

---

## 👨‍💻 Geliştirici

**Serdar GOLELI**

---

## 🌟 Özet

**LAS CSS**, modern web geliştirme için güçlü, esnek ve performanslı bir utility-first CSS framework'üdür. SASS ile tamamen özelleştirilebilir, JIT engine ile optimize edilmiş ve kullanımı kolaydır. Tailwind CSS'in avantajlarını kendi kontrolünüzde sunar!
