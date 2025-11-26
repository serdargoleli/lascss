# 🔧 LAS Engine - Teknik Mimari Dokümantasyonu

## 🏗️ Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────────┐
│                     LAS CSS ECOSYSTEM                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │  SASS Layer  │────────▶│  Build Layer │                 │
│  │  (Variables) │         │  (Compiler)  │                 │
│  └──────────────┘         └──────────────┘                 │
│         │                         │                         │
│         │                         ▼                         │
│         │                 ┌──────────────┐                 │
│         │                 │ utility.min  │                 │
│         │                 │    .css      │                 │
│         │                 └──────────────┘                 │
│         │                         │                         │
│         │                         ▼                         │
│         │                 ┌──────────────┐                 │
│         └────────────────▶│  JIT Engine  │                 │
│                           │  (Runtime)   │                 │
│                           └──────────────┘                 │
│                                   │                         │
│                                   ▼                         │
│                           ┌──────────────┐                 │
│                           │  public/     │                 │
│                           │  las.css     │                 │
│                           └──────────────┘                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Modül Detayları

### **1. SASS Layer (src/)**

#### **Dizin Yapısı**
```
src/
├── variables/           # Özelleştirilebilir değişkenler
│   ├── _color.scss     # Renk paleti
│   ├── _breakpoint.scss # Responsive breakpoint'ler
│   ├── _spacing.scss   # Margin/padding değerleri
│   ├── _typography.scss # Font ayarları
│   ├── _variant.scss   # Pseudo-class varyantları
│   └── ...
├── utilities/          # Utility sınıf tanımları
│   ├── _flex.scss     # Flexbox utilities
│   ├── _grid.scss     # Grid utilities
│   ├── _text.scss     # Typography utilities
│   └── ...
├── core/              # Reset ve base styles
├── mixins/            # Yeniden kullanılabilir mixin'ler
├── main.scss          # Ana entry point
├── utility.scss       # Utility entry point
└── meta.scss          # Breakpoint/variant meta data
```

#### **Variable Sistemi**

**Örnek: Color Variables**
```scss
// src/variables/_color.scss
$colors: (
    "blue": #3b82f6,
    "red": #ef4444,
    "green": #22c55e,
    // ...
);
```

**Utility Generation**
```scss
// src/utilities/_background.scss
@use "../variables" as *;

@each $name, $value in $colors {
    .bg-#{$name} {
        background-color: #{$value};
    }
}
```

**Output (utility.min.css)**
```css
.bg-blue{background-color:#3b82f6}
.bg-red{background-color:#ef4444}
.bg-green{background-color:#22c55e}
```

---

### **2. Build Layer**

#### **SASS Compilation Flow**

```
npm run build
    ↓
┌─────────────────────────────────────┐
│  1. Clean (rm -rf dist)             │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  2. Build Base                      │
│     src/base.scss → dist/base.min   │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  3. Build Utility                   │
│     src/utility.scss →              │
│     dist/utility.min.css            │
│     (4860+ utility classes)         │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  4. Build Meta                      │
│     src/meta.scss →                 │
│     engine/meta.min.css             │
│     (breakpoint & variant defs)     │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  5. Build Main                      │
│     src/main.scss →                 │
│     dist/style.min.css              │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  6. Copy Assets                     │
│     README, LICENSE → dist/         │
└─────────────────────────────────────┘
```

#### **Meta CSS Format**

```css
/* engine/meta.min.css */
:root {
    /* Breakpoints */
    --las-breakpoint-sm: 40rem;
    --las-breakpoint-md: 48rem;
    --las-breakpoint-lg: 64rem;
    --las-breakpoint-xl: 80rem;
    --las-breakpoint-2xl: 96rem;
    
    /* Variants */
    --las-variant-hover: :hover;
    --las-variant-focus: :focus;
    --las-variant-active: :active;
    --las-variant-disabled: :disabled;
    --las-variant-first-child: :first-child;
    --las-variant-last-child: :last-child;
    --las-variant-even: :nth-child(even);
}
```

---

### **3. JIT Engine Layer (engine/)**

#### **Modül Yapısı**

```
engine/
├── build/
│   └── lasgine.ts          # Entry point (npm run jit)
└── engine/
    ├── scanner.ts          # Dosya tarayıcı
    ├── parser.ts           # CSS parser
    ├── generator.ts        # CSS generator
    ├── watcher.ts          # File watcher
    ├── writer.ts           # CSS writer
    ├── config.ts           # Config loader
    └── read.ts             # File reader
```

---

## 🔄 JIT Engine Akış Detayları

### **Başlatma Süreci (Initialization)**

```typescript
// engine/build/lasgine.ts
startWatcher({
    scanDirs: ['src/template'],
    extensions: ['.html', '.js', '.jsx', '.ts', '.tsx'],
    outputPath: './public/las.css'
})
```

#### **1. Read Phase (read.ts)**

```typescript
// Base CSS'i oku
export function readBaseCSS(): string {
    const cssPath = path.join(__dirname, '../utility.min.css');
    return fs.readFileSync(cssPath, 'utf-8');
}

// Meta CSS'i oku
export function readMetaCSS(): string {
    const metaPath = path.join(__dirname, '../meta.min.css');
    return fs.readFileSync(metaPath, 'utf-8');
}
```

**Input:** `utility.min.css` (265 KB, 4860+ classes)  
**Output:** String content

---

#### **2. Parse Phase (parser.ts)**

```typescript
export function parserCSS(cssContent: string): Map<string, string> {
    const cssMap = new Map<string, string>();
    
    // Regex: .class-name { property: value }
    const regex = /\.([a-zA-Z0-9_-]+)\s*\{([^}]+)\}/g;
    
    let match;
    while ((match = regex.exec(cssContent)) !== null) {
        const className = match[1];
        const cssRule = match[2].trim();
        cssMap.set(className, cssRule);
    }
    
    return cssMap;
}
```

**Input:** CSS string  
**Output:** 
```typescript
Map {
    "flex" => "display:flex",
    "text-center" => "text-align:center",
    "bg-blue" => "background-color:#3b82f6",
    // ... 4860+ entries
}
```

---

#### **3. Config Phase (config.ts)**

```typescript
export function loadConfig(): IConfigProps {
    const cssContent = readMetaCSS();
    
    const screens: Record<string, string> = {};
    const variants: Record<string, string> = {};
    
    // Parse CSS variables
    const regex = /--las-(breakpoint|variant)-([a-z0-9-]+):\s*([^;]+);/g;
    
    let match;
    while ((match = regex.exec(cssContent)) !== null) {
        const type = match[1];
        const name = match[2];
        const value = match[3].trim();
        
        if (type === 'breakpoint') {
            screens[name] = value;
        } else if (type === 'variant') {
            variants[name] = value;
        }
    }
    
    return { screens, variants };
}
```

**Output:**
```typescript
{
    screens: {
        "sm": "40rem",
        "md": "48rem",
        "lg": "64rem",
        "xl": "80rem",
        "2xl": "96rem"
    },
    variants: {
        "hover": ":hover",
        "focus": ":focus",
        "active": ":active",
        "disabled": ":disabled",
        "first-child": ":first-child",
        "last-child": ":last-child",
        "even": ":nth-child(even)"
    }
}
```

---

#### **4. Scan Phase (scanner.ts)**

```typescript
export function scanDirectory(
    dirPath: string, 
    extensions: string[]
): Set<string> {
    const classes = new Set<string>();
    
    function scanRecursive(currentPath: string) {
        const items = fs.readdirSync(currentPath);
        
        items.forEach(item => {
            const fullPath = path.join(currentPath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                scanRecursive(fullPath);
            } else if (extensions.some(ext => item.endsWith(ext))) {
                const fileClasses = scanFile(fullPath);
                fileClasses.forEach(cls => classes.add(cls));
            }
        });
    }
    
    scanRecursive(dirPath);
    return classes;
}

export function scanFile(filePath: string): Set<string> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const classes = new Set<string>();
    
    // Regex: class="..." veya className="..."
    const regex = /class(?:Name)?=["']([^"']+)["']/g;
    
    let match;
    while ((match = regex.exec(content)) !== null) {
        const classString = match[1];
        const classList = classString.split(/\s+/);
        classList.forEach(cls => {
            if (cls.trim()) {
                classes.add(cls.trim());
            }
        });
    }
    
    return classes;
}
```

**Input:** HTML dosyası
```html
<div class="flex justify-center items-center">
    <p class="text-center md:text-left hover:text-blue">Hello</p>
</div>
```

**Output:**
```typescript
Set {
    "flex",
    "justify-center",
    "items-center",
    "text-center",
    "md:text-left",
    "hover:text-blue"
}
```

---

#### **5. Generate Phase (generator.ts)**

```typescript
export function generateCSS(
    className: string,
    cssMap: Map<string, string>,
    config: IConfigProps
): string {
    // Breakpoint variant kontrolü (md:flex)
    for (const [screen, minWidth] of Object.entries(config.screens)) {
        if (className.startsWith(`${screen}:`)) {
            const baseClass = className.substring(screen.length + 1);
            const cssRule = cssMap.get(baseClass);
            
            if (cssRule) {
                return `@media (min-width: ${minWidth}) {
  .${escapeClassName(className)} { ${cssRule} }
}`;
            }
        }
    }
    
    // State variant kontrolü (hover:bg-blue)
    for (const [variant, pseudo] of Object.entries(config.variants)) {
        if (className.startsWith(`${variant}:`)) {
            const baseClass = className.substring(variant.length + 1);
            const cssRule = cssMap.get(baseClass);
            
            if (cssRule) {
                return `.${escapeClassName(className)}${pseudo} { ${cssRule} }`;
            }
        }
    }
    
    // Normal class
    const cssRule = cssMap.get(className);
    if (cssRule) {
        return `.${escapeClassName(className)} { ${cssRule} }`;
    }
    
    return '';
}

function escapeClassName(className: string): string {
    return className.replace(/:/g, '\\:');
}
```

**Örnekler:**

**Normal Class:**
```typescript
Input: "flex"
Output: ".flex { display:flex }"
```

**Breakpoint Variant:**
```typescript
Input: "md:grid-cols-2"
Output: 
"@media (min-width: 48rem) {
  .md\\:grid-cols-2 { grid-template-columns: repeat(2, 1fr) }
}"
```

**State Variant:**
```typescript
Input: "hover:bg-blue"
Output: ".hover\\:bg-blue:hover { background-color:#3b82f6 }"
```

---

#### **6. Write Phase (writer.ts)**

```typescript
export function writeCSS(
    usedClasses: Set<string>,
    cssMap: Map<string, string>,
    config: IConfigProps,
    outputPath: string
): void {
    let cssContent = '/* LAS JIT - Auto-generated CSS */\n\n';
    
    usedClasses.forEach(className => {
        const css = generateCSS(className, cssMap, config);
        if (css) {
            cssContent += css + '\n';
        }
    });
    
    const fullPath = path.resolve(process.cwd(), outputPath);
    fs.writeFileSync(fullPath, cssContent, 'utf-8');
}
```

**Output (public/las.css):**
```css
/* LAS JIT - Auto-generated CSS */

.flex { display:flex }
.text-center { text-align:center }
@media (min-width: 48rem) {
  .md\:grid-cols-2 { grid-template-columns: repeat(2, 1fr) }
}
.hover\:bg-blue:hover { background-color:#3b82f6 }
```

---

#### **7. Watch Phase (watcher.ts)**

```typescript
export function startWatcher(options: IWatcherProps) {
    // ... initialization ...
    
    const watcher = chokidar.watch(watchPaths, {
        ignored: [
            /(^|[\/\\])\../,
            '**/node_modules/**',
            '**/dist/**',
            '**/public/**'
        ],
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
            stabilityThreshold: 100,
            pollInterval: 50
        }
    });
    
    // Yeni dosya eklendi
    watcher.on('add', (filePath) => {
        const newClasses = scanFile(filePath);
        newClasses.forEach(cls => usedAllClasses.add(cls));
        writeCSS(usedAllClasses, cssMap, config, options.outputPath);
    });
    
    // Dosya değişti
    watcher.on('change', (filePath) => {
        const newClasses = scanFile(filePath);
        newClasses.forEach(cls => usedAllClasses.add(cls));
        writeCSS(usedAllClasses, cssMap, config, options.outputPath);
    });
}
```

**Event Flow:**
```
Dosya değişikliği
    ↓
Chokidar event trigger
    ↓
scanFile(changedFile)
    ↓
Yeni classlar bulundu mu?
    ├─ Evet → usedAllClasses.add()
    │         writeCSS()
    │         public/las.css güncellendi ✅
    └─ Hayır → İşlem yok
```

---

## 🎯 Performans Optimizasyonları

### **1. Incremental Updates**
```typescript
// ❌ YAVAS: Her değişiklikte tüm dosyaları tara
watcher.on('change', () => {
    scanDirectory(allDirs);  // Tüm dosyalar
});

// ✅ HIZLI: Sadece değişen dosyayı tara
watcher.on('change', (filePath) => {
    scanFile(filePath);  // Tek dosya
});
```

### **2. Set Kullanımı**
```typescript
// O(1) lookup time
const usedClasses = new Set<string>();
usedClasses.has('flex');  // Çok hızlı
```

### **3. Map Kullanımı**
```typescript
// O(1) lookup time
const cssMap = new Map<string, string>();
cssMap.get('flex');  // Çok hızlı
```

### **4. File Write Debouncing**
```typescript
awaitWriteFinish: {
    stabilityThreshold: 100,  // 100ms bekle
    pollInterval: 50          // 50ms kontrol et
}
```

---

## 📊 Veri Akışı Özeti

```
┌──────────────────────────────────────────────────────────────┐
│                    COMPLETE DATA FLOW                         │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  SASS Variables                                               │
│       ↓                                                       │
│  SASS Compilation                                             │
│       ↓                                                       │
│  utility.min.css (265 KB, 4860+ classes)                     │
│       ↓                                                       │
│  Parser → Map<className, cssRule>                            │
│       ↓                                                       │
│  Scanner → Set<usedClasses>                                  │
│       ↓                                                       │
│  Generator → CSS strings                                      │
│       ↓                                                       │
│  Writer → public/las.css (2-10 KB)                           │
│       ↓                                                       │
│  Browser ← Optimized CSS                                      │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔍 Debugging & Monitoring

### **Console Output**
```
🚀 LAS JIT Watcher Başlatılıyor...

✅ 4860 utility class yüklendi
✅ 5 breakpoint, 7 variant tanımlı

✅ 12 class bulundu

👀 Dosya izleyici aktif...
📁 İzlenen dizinler: src/template
📝 İzlenen uzantılar: .html, .js, .jsx, .ts, .tsx
📦 Çıktı: ./public/las.css

🔍 İzlenen yollar: [ '/Users/.../src/template' ]
✨ Hazır! Dosyalarınızı düzenleyebilirsiniz.

📝 Değişiklik: src/template/index.html
   ✨ 3 yeni class eklendi
   ✅ CSS güncellendi (toplam 15 class)
```

---

## 🎓 Best Practices

### **1. Development Workflow**
```bash
# Terminal 1: JIT watcher
npm run jit

# Terminal 2: Dev server (opsiyonel)
npx live-server public/
```

### **2. Production Workflow**
```bash
# 1. Tüm geliştirmeyi tamamla
# 2. JIT watcher'ı çalıştır
npm run jit

# 3. public/las.css production'a hazır
# 4. Deploy et
```

### **3. Özelleştirme Workflow**
```bash
# 1. SASS variables düzenle
vim src/variables/_color.scss

# 2. Build al
npm run build

# 3. JIT'i yeniden başlat
npm run jit
```

---

## 🚀 Gelecek Geliştirmeler

- [ ] Production build komutu (`jit:build`)
- [ ] Purge unused classes
- [ ] Source map desteği
- [ ] VS Code extension
- [ ] Auto-completion
- [ ] Class name validation
- [ ] Performance metrics
- [ ] Cache layer

---

Bu dokümantasyon LAS Engine'in teknik detaylarını içerir. Daha fazla bilgi için `INFO.md` dosyasına bakın.
