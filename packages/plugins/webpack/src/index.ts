import { LasEngine } from "@las/lasgine";
import type { LasEngineOptions } from "@las/lasgine";
import path from "path";
import type { Compiler } from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";

const PLUGIN_NAME = "LasCss";
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
    // projeyi bi rkere tara var olan classları bul ve yaz
    compiler.hooks.beforeRun.tap(PLUGIN_NAME, (compiler) => {
      this.scanProject(compiler.context);
    });

    // 2. Watch modunda (serve mode)
    // dev ortamında ilkkez ayağa kalktığında bir kere tara var olan classları bul ve yaz
    // sonra dosya değişiklikleri olursa sadece o dosyayı tara ve yaz
    compiler.hooks.watchRun.tap(PLUGIN_NAME, (compiler) => {
      // İlk çalıştırmada projeyi tara
      if (!this.isInitialized) {
        this.scanProject(compiler.context);
      }

      const changedFiles = compiler.modifiedFiles; // değişiklik yapılan dosya yollarını döndürür
      if (changedFiles) {
        for (const file of changedFiles) {
          this.engine.updateFile(file);
        }
      }
    });

    // 3. HTML'e CSS Inject et (derleme aşamasında)
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      // Build modu: HtmlWebpackPlugin ile inject et
      if (compiler.options.mode === "production") {
        const hooks = HtmlWebpackPlugin.getHooks(compilation);
        // html oluşturuldı ancak daha dosyay yazmadık @sg
        hooks.beforeEmit.tapAsync(PLUGIN_NAME, (data, cb) => {
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
      compiler.hooks.emit.tapAsync(PLUGIN_NAME, (compilation, callback) => {
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
      compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
        HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
          PLUGIN_NAME,
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
