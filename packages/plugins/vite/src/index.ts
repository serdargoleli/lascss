import type { Plugin, ResolvedConfig } from "vite";
import { LasEngine } from "@las/engine";
import * as path from "path";

interface LasViteOptions {
  scanDirs?: string[];
  extensions?: string[];
  output?: string;
}

export default function lascss(options: LasViteOptions): Plugin {
  const virtualModuleId = "virtual:las.css";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;
  const engine = new LasEngine();
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

    // 1. Sanal modülü tanıt
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },

    // 2. Sanal modülün içeriğini yükle (CSS)
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return engine.getCSS();
      }
    },

    // 3. Server başaldığında
    configureServer(server) {
      scanProject(server.config.root);
    },
    handleHotUpdate({ file, server }: any) {
      const hasChanges = engine.updateFile(file);
      if (hasChanges) {
        const mod = server.moduleGraph.getModuleById(resolvedVirtualModuleId);
        if (mod) {
          server.moduleGraph.invalidateModule(mod);
          server.ws.send({
            type: "update",
            updates: [
              {
                type: "js-update",
                path: virtualModuleId,
                acceptedPath: virtualModuleId,
                timestamp: Date.now()
              }
            ]
          });
        }
      }
    }
  };
}
