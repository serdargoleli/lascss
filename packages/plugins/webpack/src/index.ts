import type { Compiler } from "webpack";
import path from "path";
import VirtualModulesPlugin from "webpack-virtual-modules";
import webpack from "webpack";
import { LasEngine, LasEngineOptions } from "@las/lasgine";

const PLUGIN_NAME = "LasCss";
const VIRTUAL_ID_PATH = "node_modules/.virtual/las.css";

export default class LasCss {
  private vm!: VirtualModulesPlugin;
  private vmPath!: string;
  private engine: LasEngine;
  private options: LasEngineOptions;
  private initialized = false;

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
    const css = this.engine.getCSS(); // Motorun ürettiği son CSS'i al
    this.vm.writeModule(this.vmPath, css); // Sanal dosyaya yaz
  }

  apply(compiler: Compiler) {
    //#region  Sanal modül oluşturma ve çözümleme
    const context =
      compiler.options.context || compiler.context || process.cwd();

    this.vmPath = path.resolve(context, VIRTUAL_ID_PATH);

    this.vm = new VirtualModulesPlugin({
      [this.vmPath]: ""
    });

    this.vm.apply(compiler);

    // las.css isteğini yakalayıp virtual module pathi ile  değiştir
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
      const changedFiles = watcher.modifiedFiles;
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
  }
}
