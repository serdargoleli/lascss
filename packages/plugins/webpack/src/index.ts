import path from "path";
import fs from "fs";
import webpack, { sources } from "webpack";
import VirtualModulesPlugin from "webpack-virtual-modules";
import type { Compiler, Compilation } from "webpack";
import { LasEngine, LasEngineOptions } from "@las/lasgine";

const PLUGIN_NAME = "lascss";
const VIRTUAL_ID_PATH = "node_modules/.virtual/las.css";

/**
 * @name lascss
 *
 * @description
 * Projenizdeki dosyaları tarar, kullanılan stilleri tespit eder ve
 * sadece gerekli CSS'i üretir (Just-In-Time).
 * @param options.scanDirs @default ["src"] - Taranacak dizinlerin listesi.
 * @param options.extensions @default [".html", ".js", ".ts", ".jsx", ".tsx", ".vue", ".svelte"] - Taranacak dosya uzantıları (varsayılanla birleştirilir).
 * @param options.cssExtensions @default [".css", ".scss", ".sass", ".less", ".pcss", ".styl", ".stylus"] - Taranacak CSS dosya uzantıları (varsayılanla birleştirilir).
 * @param options.ignoreDirs @default ["node_modules", "dist", ".git", "build", ".next", ".nuxt", "coverage"] - Taranmayacak ve yok sayılacak klasör isimleri (varsayılanla birleştirilir).
 * @param options.output - Üretilen CSS dosyasının yazılacağı dosya yolu.
 *
 *
 * @example
 * new lascss({
 *   scanDirs: ["src"],
 *   output: "css/style.css", // Eğer path varsa Production'da dosyaya yazar yoksa inline olarak yazar, Development'ta her zaman inline yapar.
 *   extensions: [".html", ".js", ".ts", ".jsx", ".tsx", ".vue", ".svelte"], // varsayılanlarla birleşir
 *   cssExtensions: [".css", ".scss", ".sass", ".less", ".pcss", ".styl", ".stylus"], // varsayılanlarla birleşir
 *   ignoreDirs: ["node_modules", "dist", ".git"], // varsayılanlarla birleşir
 * })
 */
export default class lascss {
  private vm!: VirtualModulesPlugin;
  private vmPath!: string;
  private engine: LasEngine;
  private options: LasEngineOptions;
  private initialized = false;
  private isProduction = false;
  private scanDirs: string[] = [];

  constructor(options: LasEngineOptions = {}) {
    this.options = options;
    this.engine = new LasEngine(options);
  }

  /**
   * @description
   * Proje ilk defa ayağa kalktığında tüm dosyalar taranır sonrasında sadece değişen dosyalar taranır
   * */

  private scanProject(reset = false) {
    if (reset) {
      this.engine.reset();
    }
    this.engine.init(this.scanDirs);
    this.initialized = true;
    this.updateVirtualModule();
  }

  /**
   * @description Sanal modülü günceller
   * @returns void
   */
  private updateVirtualModule() {
    // Production'da ve output varsa boş (style-loader çalışmasın)
    if (this.isProduction && this.options.output) {
      this.vm.writeModule(this.vmPath, "");
      return;
    }
    const css = this.engine.getCSS(); // Motorun ürettiği son CSS'i al
    this.vm.writeModule(this.vmPath, css); // Sanal dosyaya yaz
  }

  apply(compiler: Compiler) {
    this.isProduction = compiler.options.mode === "production";

    const context =
      compiler.options.context || compiler.context || process.cwd();
    const dirsToScan = this.options.scanDirs || ["src"];
    this.scanDirs = dirsToScan.map((dir) => path.resolve(context, dir));

    this.vmPath = path.resolve(context, VIRTUAL_ID_PATH);

    //#region  Sanal modül oluşturma ve çözümleme
    // Virtual module her iki modda da oluştur (import "las.css" hatası olmasın)
    this.vm = new VirtualModulesPlugin({
      [this.vmPath]: ""
    });

    this.vm.apply(compiler);

    // las.css isteğini yakalayıp virtual module pathi ile değiştir
    new webpack.NormalModuleReplacementPlugin(/^las\.css$/, this.vmPath).apply(
      compiler
    );
    //#endregion

    //#region  Build sırasında projeyi tarayıp CSS üretilsin
    compiler.hooks.beforeRun.tap(PLUGIN_NAME, () => {
      this.scanProject();
    });
    //#endregion

    //#region Watch sırasında projeyi tarayıp CSS üretilsin
    compiler.hooks.watchRun.tap(PLUGIN_NAME, (comp) => {
      if (!this.initialized) {
        this.scanProject();
      }

      let hasChanged = false;
      const changedFiles = comp.modifiedFiles as Set<string> | undefined;
      const removedFiles = (comp as any).removedFiles as
        | Set<string>
        | undefined;

      // Silme varsa veya değişiklik listesi gelmediyse tam tarama yap
      if (
        (removedFiles && removedFiles.size > 0) ||
        !changedFiles ||
        changedFiles.size === 0
      ) {
        this.scanProject(true);
        return;
      }

      for (const file of changedFiles) {
        // Watcher bazen dosya yerine klasör bildirir; klasör değişiminde tam tarama yap
        // yeni dosya flan ekleendiğide klasör yolu verşyor
        if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
          this.scanProject(true);
          return;
        }
        const updated = this.engine.updateFile(file);
        if (updated) hasChanged = true;
      }

      if (hasChanged) {
        this.updateVirtualModule();
      }
    });
    //#endregion

    //#region Dosya yazma biçimi

    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      this.addWatchDependencies(compilation);
      //sadece build aşamasında outputPath'e göre inline veya external olarka eklmesini sağlar

      const css = this.engine.getCSS();
      const sizeLabel = this.engine.getCssFileInfo(css);

      if (this.isProduction) {
        console.log("\n================ LAS CSS ================");
        console.log(
          `\x1b[32m✨ Generated File Size :\x1b[33m ${sizeLabel}\x1b[0m`
        );
        console.log("=========================================\n");
      }

      // Output belirtilmişse ve production ise external CSS dosyası oluştur
      if (this.isProduction && this.options.output) {
        const fileName = this.options.output.startsWith("/")
          ? path.basename(this.options.output)
          : this.options.output;

        compilation.emitAsset(fileName, new sources.RawSource(css));

        // HtmlWebpackPlugin sınıfını, compiler.options.plugins içinden dinamik olarak bul
        // tsup buildde import dosyaını da alıp dosyay ekliyordu böylece porjede kullanılan ile bneim importladığım
        // ayrı dosyalar oluyordu bu yüzden prod aşamasında style link eklemiyordu
        // burada projenin içindeki pluginden bul ve onun üzeirnden yazalım dedik
        //özet: Kendi içindekini veya node_modules'dakini boşver, Webpack'in elinde halihazırda çalışan CANLI örneği bul ve onu kullan
        const htmlPluginInstance = compiler.options.plugins.find(
          (plugin) =>
            plugin &&
            plugin.constructor &&
            plugin.constructor.name === "HtmlWebpackPlugin"
        );

        const HtmlWebpackPluginClass = htmlPluginInstance
          ? htmlPluginInstance.constructor
          : null;

        const hasHtmlPlugin =
          HtmlWebpackPluginClass &&
          typeof (HtmlWebpackPluginClass as any).getHooks === "function";

        if (hasHtmlPlugin) {
          const hook = (HtmlWebpackPluginClass as any).getHooks(compilation);
          hook.alterAssetTags.tapPromise(PLUGIN_NAME, async (data: any) => {
            data.assetTags.styles.push({
              tagName: "link",
              voidTag: true,
              attributes: {
                rel: "stylesheet",
                href: fileName
              },
              meta: {
                plugin: PLUGIN_NAME
              }
            });
            return data;
          });
        }
        return;
      }
    });
    //#endregion
  }

  private addWatchDependencies(compilation: Compilation) {
    // Değişikliklerden haberdar olmak için dizinleri ve css dosyalarını watch listesine ekle
    this.scanDirs.forEach((dir) => {
      // import edilmezse bile izle
      compilation.contextDependencies.add(dir);
    });
    this.engine.getWatchedCSSFiles().forEach((file) => {
      compilation.fileDependencies.add(file);
    });
  }
}
