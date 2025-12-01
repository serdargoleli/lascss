import type { Plugin, ResolvedConfig, HmrContext } from "vite";
import { LasEngine } from "@las/lasgine";
import * as path from "path";

interface LasViteOptions {
  scanDirs?: string[];
  extensions?: string[];
  output?: string;
}

export default function lascss(options: LasViteOptions): Plugin {
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
