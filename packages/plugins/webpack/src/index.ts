import { LasEngine } from "@las/lasgine";
import type { LasEngineOptions } from "@las/lasgine";
import path from "path";
import { sources, type Compiler, Compilation } from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";

const PLUGIN_NAME = "LasCss";

export default class LasCss {
  private engine: LasEngine;
  private isInitialized = false;

  constructor(private options: LasEngineOptions = {}) {
    this.engine = new LasEngine(options);
  }

  apply(compiler: Compiler) {
    this.setupProductionBuild(compiler);
    this.setupWatchMode(compiler);
    this.setupCSSInjection(compiler);
  }

  // Production Build: Projeyi bir kere tara
  private setupProductionBuild(compiler: Compiler) {
    compiler.hooks.beforeRun.tap(PLUGIN_NAME, () => {
      this.scanProject(compiler.context);
    });
  }

  // Watch Mode: İlk tarama + değişen dosyaları güncelle
  private setupWatchMode(compiler: Compiler) {
    compiler.hooks.watchRun.tap(PLUGIN_NAME, () => {
      if (!this.isInitialized) {
        this.scanProject(compiler.context);
      }

      this.handleFileChanges(compiler);
    });
  }

  // CSS Injection: Production ve Development için farklı stratejiler
  private setupCSSInjection(compiler: Compiler) {
    const isProduction = compiler.options.mode === "production";

    if (isProduction) {
      this.setupProductionCSSInjection(compiler);
    } else {
      this.setupDevelopmentCSSInjection(compiler);
    }
  }

  // Production: HTML'e direkt style tag ekle
  private setupProductionCSSInjection(compiler: Compiler) {
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      const hooks = HtmlWebpackPlugin.getHooks(compilation);

      hooks.beforeEmit.tapAsync(PLUGIN_NAME, (data, cb) => {
        const css = this.engine.getCSS();
        const styleTag = `<style data-lascss>${css}</style>`;

        data.html = this.injectStyleTag(data.html, styleTag);
        cb(null, data);
      });
    });
  }

  // Development: HMR desteği ile dinamik CSS güncelleme
  private setupDevelopmentCSSInjection(compiler: Compiler) {
    // CSS update script'ini asset olarak ekle
    compiler.hooks.emit.tapAsync(PLUGIN_NAME, (compilation, callback) => {
      const css = this.engine.getCSS();
      const scriptContent = this.generateUpdateScript(css);

      compilation.assets["las-update.js"] = new sources.RawSource(
        scriptContent
      );
      callback();
    });

    // Script'i HTML'e ekle
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      const hooks = HtmlWebpackPlugin.getHooks(compilation);

      hooks.beforeEmit.tapAsync(PLUGIN_NAME, (data, cb) => {
        data.html = data.html.replace(
          "</body>",
          '<script src="las-update.js"></script></body>'
        );
        cb(null, data);
      });
    });
  }

  // Helper Methods
  private scanProject(contextPath: string) {
    if (this.isInitialized) return;

    const dirsToScan = this.options.scanDirs || ["src"];
    const scanDirs = dirsToScan.map((dir) => path.join(contextPath, dir));

    this.engine.init(scanDirs);
    this.isInitialized = true;
  }

  private handleFileChanges(compiler: Compiler) {
    const changedFiles = compiler.modifiedFiles;

    if (changedFiles) {
      for (const file of changedFiles) {
        this.engine.updateFile(file);
      }
    }
  }

  private injectStyleTag(html: string, styleTag: string): string {
    if (html.includes("</head>")) {
      return html.replace("</head>", `${styleTag}</head>`);
    }
    return html + styleTag;
  }

  //development için anlık css güncelleme scripti
  private generateUpdateScript(css: string): string {
    return `
(function() {
  var style = document.querySelector('style[data-lascss]');
  if (!style) {
    style = document.createElement('style');
    style.setAttribute('data-lascss', '');
    document.head.appendChild(style);
  }
  style.textContent = ${JSON.stringify(css)};
  console.log('[LasCSS] Updated');
})();
    `.trim();
  }
}
