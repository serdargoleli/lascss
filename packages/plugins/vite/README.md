# las-vite

Vite plugin for LAS CSS + LAS Engine. Scans your project, generates only the CSS you use, serves it as a virtual module in dev, and inlines it into HTML on build.

## Install
```bash
npm install -D lascss las-vite
pnpm add -D lascss las-vite
yarn add -D lascss las-vite
```

## Usage
`vite.config.ts`:
```ts
import { defineConfig } from "vite";
import lascss from "las-vite";

export default defineConfig({
  plugins: [
    lascss({
      scanDirs: ["src"],            // default: ["src"]
      extensions: [".tsx", ".jsx"], // merged with defaults
      ignoreDirs: ["dist"],         // merged with defaults
    }),
  ],
});
```

App entry:
```ts
import "virtual:las.css"; // virtual module in dev, inlined style on build
```

## How It Works
- LAS Engine scans `scanDirs` and CSS/SCSS files, then JIT-generates CSS for used classes.
- Dev: `virtual:las.css` is served by Vite’s dev server.
- Build: CSS is minified and inlined into `index.html` head (no extra asset).

## Options (LasEngineOptions)
- `scanDirs`: Directories to scan. Default: `["src"]`.
- `extensions`: Content extensions (merged with html/js/ts/vue/svelte defaults).
- `cssExtensions`: CSS/SCSS extensions (merged with defaults).
- `ignoreDirs`: Directories to ignore (merged with defaults).
