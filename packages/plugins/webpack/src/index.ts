import path from "path";
import webpack, { sources } from "webpack";
import VirtualModulesPlugin from "webpack-virtual-modules";
import type { Compiler } from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { LasEngine, LasEngineOptions } from "@las/lasgine";

const PLUGIN_NAME = "LasCss";
const VIRTUAL_ID_PATH = "node_modules/.virtual/las.css";

export default class LasCss {
  private vm!: VirtualModulesPlugin;
  private vmPath!: string;
  private engine: LasEngine;
  private options: LasEngineOptions;
  private initialized = false;
  private isProduction = false;

  constructor(options: LasEngineOptions = {}) {
    this.options = options;
    this.engine = new LasEngine(options);
  }

  /**
   * @description
   * Proje ilk defa ayağa kalktığında tüm dosyalar taranır sonrasında sadece değişen dosyalar taranır
   * */

  private scanProject(root: string) {
    const dirsToScan = this.options.scanDirs || ["src"];
    const scanDirs = dirsToScan.map((dir) => path.resolve(root, dir));
    this.engine.init(scanDirs);
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
      this.scanProject(context);
    });
    //#endregion

    //#region Watch sırasında projeyi tarayıp CSS üretilsin
    compiler.hooks.watchRun.tap(PLUGIN_NAME, (watcher) => {
      if (!this.initialized) {
        this.scanProject(context);
      }

      let hasChanged = false;
      const changedFiles = watcher.modifiedFiles as Set<string> | undefined;
      if (changedFiles) {
        hasChanged = true;

        for (const file of changedFiles) {
          this.engine.updateFile(file);
        }
      }

      if (hasChanged) {
        this.updateVirtualModule();
      }
    });
    //#endregion

    //#region Dosya yazma biçimi
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      //sadece build aşamasında outputPath'e göre inline veya external olarka eklmesini sağlar

      const css = this.engine.getCSS();
      // tip koruması
      const hasHtmlPlugin =
        "getHooks" in HtmlWebpackPlugin &&
        (HtmlWebpackPlugin as any).getHooks(compilation);

      // Output belirtilmişse ve production ise external CSS dosyası oluştur
      if (this.isProduction && this.options.output) {
        const fileName = this.options.output.startsWith("/")
          ? path.basename(this.options.output)
          : this.options.output;

        compilation.emitAsset(fileName, new sources.RawSource(css));

        if (hasHtmlPlugin) {
          const hook = HtmlWebpackPlugin.getHooks(compilation);
          hook.alterAssetTags.tap(PLUGIN_NAME, (data) => {
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
}
