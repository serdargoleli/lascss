import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
//import lascss from "las-vite"; // live
import lascss from "../../packages/plugins/vite/src/index"; // localde test etmek için

export default defineConfig({
  plugins: [
    react(),
    lascss({
      scanDirs: ["src"],
    }) as PluginOption,
  ],
});
