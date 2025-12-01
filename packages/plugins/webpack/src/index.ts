import { LasEngine } from "@las/lasgine";
import type { LasEngineOptions } from "@las/lasgine";
import path from "path";
import type { Compiler } from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";

export default class LasCss {
  private options: LasEngineOptions;
  private engine: LasEngine;
  private isInitialized: boolean = false;

  constructor(options: LasEngineOptions = {}) {
    this.options = options;
    this.engine = new LasEngine(options);
  }

  private scanProject(contexPath: string) {
    if (this.isInitialized) return;

    const dirsToScan = this.options.scanDirs || ["src"];
    const scanDirs = dirsToScan.map((dir) => path.join(contexPath, dir));
    this.engine.init(scanDirs);
    this.isInitialized = true;
  }

  apply(compiler: Compiler) {
    // 1. Production Build için (run mode)
    compiler.hooks.beforeRun.tap("LasCss", (compiler) => {
      this.scanProject(compiler.context);
    });

    // 2. Watch modunda (serve mode)
    compiler.hooks.watchRun.tap("LasCss", (compiler) => {
      // İlk çalıştırmada projeyi tara
      if (!this.isInitialized) {
        this.scanProject(compiler.context);
      }

      const changedFiles = compiler.modifiedFiles;
      if (changedFiles) {
        let hasChanges = false;
        for (const file of changedFiles) {
          if (this.engine.updateFile(file)) {
            hasChanges = true;
          }
        }
      }
    });

    // 3. HTML'e CSS Inject et
    compiler.hooks.compilation.tap("LasCss", (compilation) => {
      // Build modu: HtmlWebpackPlugin ile inject et (Production için en iyisi)
      if (compiler.options.mode === "production") {
        const hooks = HtmlWebpackPlugin.getHooks(compilation);
        hooks.beforeEmit.tapAsync("LasCss", (data, cb) => {
          const minifiedCss = this.engine.getCSS();

          if (data.html.includes("</head>")) {
            data.html = data.html.replace(
              "</head>",
              `<style data-lascss>${minifiedCss}</style></head>`
            );
          } else {
            data.html += `<style data-lascss>${minifiedCss}</style>`;
          }
          cb(null, data);
        });
      }
    });

    // 4. Development Modu: CSS Injection (HMR desteği için)
    if (compiler.options.mode === "development") {
      compiler.hooks.emit.tapAsync("LasCss", (compilation, callback) => {
        const css = this.engine.getCSS();
        const scriptContent = `
          (function() {
            var style = document.querySelector('style[data-lascss]');
            if (!style) {
              style = document.createElement('style');
              style.setAttribute('data-lascss', '');
              document.head.appendChild(style);
            }
            style.textContent = ${JSON.stringify(css)};
            console.log("[LasCSS] Updated");
          })();
        `;

        // LasCSS update scriptini yeni bir asset olarak ekle
        compilation.assets["las-update.js"] = {
          source: () => scriptContent,
          size: () => scriptContent.length,
          map: () => null,
          sourceAndMap: () => ({ source: scriptContent, map: null }),
          buffer: () => Buffer.from(scriptContent)
        } as any;

        callback();
      });

      // Oluşturulan scripti HTML'e ekle
      compiler.hooks.compilation.tap("LasCss", (compilation) => {
        HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
          "LasCss",
          (data, cb) => {
            // Script'i body sonuna ekle
            data.html = data.html.replace(
              "</body>",
              `<script src="las-update.js"></script></body>`
            );
            cb(null, data);
          }
        );
      });
    }
  }
}
