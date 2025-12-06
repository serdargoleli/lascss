import { scanDirectory, scanFile, findCSSFiles } from "./core/scanner";
import { readBaseCSS, readUtilityCSS } from "./core/read";
import { parserCSS } from "./core/parser";
import { loadConfig } from "./core/config";
import { generateCSSContent } from "./core/writer";
import path from "path";
import fs from "fs";
import { extractApplyClasses } from "./core/apply";

export interface LasEngineOptions {
  scanDirs?: string[];
  extensions?: string[];
  output?: string;
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

  constructor(options: LasEngineOptions = {}) {
    this.usedClasses = new Set();
    this.cssExtensions = [".css", ".scss", ".sass", ".less", ".pcss"];
    this.extensions = options.extensions || [
      ".html",
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".vue",
      ...this.cssExtensions
    ];
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
        const foundClasses = scanDirectory(dir, this.extensions);
        foundClasses.forEach((cls) => this.usedClasses.add(cls));

        // CSS dosyalarını bul ve @apply işle
        const cssFiles = findCSSFiles(dir, this.cssExtensions);
        cssFiles.forEach((file) => {
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
}
