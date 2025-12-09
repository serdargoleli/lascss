import type { Plugin, ResolvedConfig, HmrContext } from "vite";
import { LasEngine, LasEngineOptions } from "@las/lasgine";
import * as path from "path";

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
export default function lascss(options: LasEngineOptions): Plugin {
  const virtualModuleId = "virtual:las.css";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  const engine = new LasEngine(options);
  let config: ResolvedConfig;

  function scanProject(root: string) {
    const dirsToScan = options.scanDirs || ["src"];
    const scanDirs = dirsToScan.map((dir) => path.resolve(root, dir));
    engine.init(scanDirs);
  }

  return {
    name: "las-vite",
    enforce: "pre",

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    // Build sırasında projeyi tara ki CSS üretilsin
    buildStart() {
      if (config?.command === "build") {
        scanProject(config.root);
      }
    },

    // 1. Sanal modülü tanıt
    resolveId(id) {
      if (id === virtualModuleId) {
        // Build'te rollup'ın link eklemesini engellemek için side-effect'i kapat
        const moduleSideEffects = config?.command !== "build";
        return {
          id: resolvedVirtualModuleId,
          moduleSideEffects
        };
      }
    },

    // 2. Sanal modülün içeriğini yükle (CSS)
    load(id) {
      if (id === resolvedVirtualModuleId) {
        // Build'te inline edeceğimiz için burada boş dönüp asset üretimini önlüyoruz
        if (config?.command === "build") {
          return "";
        }

        return engine.getCSS();
      }
    },

    // 3. Server başaldığında
    configureServer(server) {
      scanProject(server.config.root);
    },

    handleHotUpdate(ctx: HmrContext) {
      const { file, server } = ctx;
      const hasChanges = engine.updateFile(file);
      if (!hasChanges) return;

      const mod = server.moduleGraph.getModuleById(resolvedVirtualModuleId);
      if (!mod) return;

      server.moduleGraph.invalidateModule(mod);

      return [...ctx.modules, mod];
    },

    // Build çıktısında head içine LASCSS'i inline et (Güvenli Yöntem + Minifikasyon)
    transformIndexHtml(html) {
      if (config?.command !== "build") return html;

      // Basit CSS Minifikasyonu: Gereksiz boşlukları ve yeni satırları sil
      const css = engine
        .getCSS()
        .replace(/\s+/g, " ")
        .replace(/\s*([{}:;,])\s*/g, "$1")
        .trim();

      const kb = (css.length / 1024).toFixed(2);
      console.log(`\n✨ LasCSS Generated: ${kb} kB (inlined)`);

      return [
        {
          tag: "style",
          attrs: { "data-lascss": "" },
          children: css,
          injectTo: "head"
        }
      ];
    }
  };
}
