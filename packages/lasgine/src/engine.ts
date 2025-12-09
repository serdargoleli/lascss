import { scanDirectory, scanFile, findCSSFiles } from "./core/scanner";
import { readBaseCSS, readUtilityCSS } from "./core/read";
import { parserCSS } from "./core/parser";
import { loadConfig } from "./core/config";
import { generateCSSContent } from "./core/writer";
import path from "path";
import fs from "fs";
import { extractApplyClasses } from "./core/apply";
import {
  DEFAULT_CSS_EXTENSIONS,
  DEFAULT_EXTENSIONS,
  DEFAULT_IGNORE_DIRS
} from "./constants";

export interface LasEngineOptions {
  /**
   * Taranacak dizinlerin listesi.
   * Genellikle kaynak kodunuzun bulunduğu klasörlerdir (örn: ["./src", "./components"]).
   */
  scanDirs?: string[];
  /**
   * Taranacak dosya uzantıları (HTML, JS, JSX vb.).
   * Varsayılan uzantılarla (html, js, ts, vue, svelte vb.) birleştirilir.
   * @example [".php", ".blade.php"]
   */
  extensions?: string[];
  /**
   * Taranmayacak ve yok sayılacak klasör isimleri.
   * Varsayılan ignore listesiyle (node_modules, .git, dist vb.) birleştirilir.
   */
  ignoreDirs?: string[];
  /**
   * Üretilen CSS dosyasının yazılacağı dosya yolu.
   * Belirtilmezse CSS dosyaya yazılmaz, sadece bellekte tutulur veya getCSS() ile alınır.
   */
  output?: string;
  /**
   * CSS için ekstra uzantılar.
   * Varsayılan CSS uzantılarıyla (.css, .scss, .sass, .less, .pcss, .styl, .stylus) birleştirilir.
   */
  cssExtensions?: string[];
}

/**
 * @description
 * LasEngine, belirtilen dizinlerdeki dosyaları tarar ve kullanımdaki class'ları tespit eder.
    output belirtilmişse belirlenen dizine css dosyası üretir.
 */
export class LasEngine {
  private usedClasses: Set<string>;
  /** utility classlar */
  private cssMap: Map<string, string>;
  private config: any;
  private cssContent: string;
  private extensions: string[];
  private baseCSS: string;
  private cssExtensions: string[];
  private processedCSSFiles: Map<string, string> = new Map();
  private watchedCSSFiles: Set<string> = new Set();
  private ignoreDirs: string[];

  constructor(options: LasEngineOptions = {}) {
    this.usedClasses = new Set();
    this.cssExtensions = Array.from(
      new Set([...DEFAULT_CSS_EXTENSIONS, ...(options.cssExtensions || [])])
    );
    this.extensions = Array.from(
      new Set([
        ...DEFAULT_EXTENSIONS,
        ...this.cssExtensions,
        ...(options.extensions || [])
      ])
    );
    this.ignoreDirs = Array.from(
      new Set([...DEFAULT_IGNORE_DIRS, ...(options.ignoreDirs || [])])
    );
    this.baseCSS = readBaseCSS();
    // Başlangıç verilerini yükle
    this.cssContent = readUtilityCSS();
    this.cssMap = parserCSS(this.cssContent);
    this.config = loadConfig();
  }

  /**
   * Belirtilen dizinleri tarar ve başlangıç CSS'ini üretir.
   */
  public init(scanDirs: string[]) {
    scanDirs.forEach((dir) => {
      if (fs.existsSync(dir)) {
        // Class tarama
        const foundClasses = scanDirectory(
          dir,
          this.extensions,
          this.ignoreDirs
        );
        foundClasses.forEach((cls) => this.usedClasses.add(cls));

        // CSS dosyalarını bul ve @apply işle
        const cssFiles = findCSSFiles(dir, this.cssExtensions, this.ignoreDirs);
        cssFiles.forEach((file) => {
          this.watchedCSSFiles.add(file);
          const result = extractApplyClasses(file, this.cssMap, this.config);
          const processedCSS = result.toString();
          this.processedCSSFiles.set(file, processedCSS);
        });
      }
    });
    console.log(
      `✅ LasEngine Başlatıldı: ${this.usedClasses.size} class yüklendi.`
    );
  }

  /**
   * Tek bir dosyayı tarar ve yeni class varsa true döner.
   */
  public updateFile(filePath: string): boolean {
    // Sadece desteklenen uzantıları tara
    if (!this.extensions.some((ext) => filePath.endsWith(ext))) return false;

    // CSS dosyaları için özel işlem
    if (this.cssExtensions.some((ext) => filePath.endsWith(ext))) {
      this.watchedCSSFiles.add(filePath);
      const result = extractApplyClasses(filePath, this.cssMap, this.config);
      const processedCSS = result.toString();
      this.processedCSSFiles.set(filePath, processedCSS);
      // CSS dosyaları her zaman HMR tetiklemeli
      return true;
    }

    const newClasses = scanFile(filePath);
    let addedCount = 0;

    newClasses.forEach((cls) => {
      if (!this.usedClasses.has(cls)) {
        this.usedClasses.add(cls);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      console.log(
        `⚡ ${addedCount} yeni class eklendi: ${path.basename(filePath)}`
      );
      return true;
    }

    return false;
  }

  /**
   * Güncel CSS içeriğini döner.
   */
  public getCSS(): string {
    const generated = generateCSSContent(
      this.usedClasses,
      this.cssMap,
      this.config
    );
    let processedCSS = "";
    this.processedCSSFiles.forEach((css) => {
      processedCSS += css + "\n";
    });
    //minify et
    const combined = `${this.baseCSS}\n${generated}\n${processedCSS}`;
    return combined
      .replace(/\s*([{}:;,])\s*/g, "$1")
      .replace(/\s+/g, "")
      .trim();
  }

  /**
   * HMR için izlenen CSS dosyaları
   */
  public getWatchedCSSFiles(): string[] {
    return Array.from(this.watchedCSSFiles);
  }

  /**
   * İç durumu sıfırla (watch-list ve işlenmiş CSS'ler temizlenir).
   * Varsayılan config ve utility CSS korunur.
   */
  public reset() {
    this.usedClasses.clear();
    this.processedCSSFiles.clear();
    this.watchedCSSFiles.clear();
  }
}
