# LAS Engine (lasgine)

JIT engine for LAS CSS. Scans your project, detects used utility classes, and outputs only the CSS you need.

## Quick Start
```bash
npm install -D lasgine lascss
pnpm add -D lasgine lascss
yarn add -D lasgine lascss
```
```ts
import fs from "fs";
import { LasEngine } from "lasgine";

const engine = new LasEngine({
  scanDirs: ["src"], // extensions/cssExtensions/ignoreDirs merge with defaults
});

engine.init(["./src"]); // initial scan
const css = engine.getCSS(); // base + JIT + user CSS (purged)
fs.writeFileSync("public/las.css", css);
```

## How It Works
- Reads base/meta/utility CSS from the `lascss` package.
- Extracts breakpoints, variants, colors, and opacities from meta custom properties.
- Scans `scanDirs`, generates CSS for the classes you actually use.
- `updateFile(path)` incrementally processes changed files; `getCSS()` always returns up-to-date output.

## API & Options
- `scanDirs`: Directories to scan. Default: `["src"]`.
- `extensions`: Content extensions. Default: `.html,.js,.jsx,.ts,.tsx,.vue,.svelte` (+ yours).
- `cssExtensions`: CSS/SCSS extensions for `@apply` and purge. Default: `.css,.scss,.sass,.less,.pcss,.styl,.stylus`.
- `ignoreDirs`: Directories to ignore. Default: `node_modules, dist, .git, build, .next, .nuxt, coverage`.
- `getCSS()`: Combined base + JIT + user CSS (after unused purge).
- `getCssFileInfo(css)`: Size label (kB/MB).
- `getWatchedCSSFiles()`: CSS files watched for apply/purge.
- `reset()`: Clears internal state and caches.

## Notes
- The `lascss` package must be installed; base/meta/utility assets are read from it.
- You can write the output yourself or let the bundler plugins (`las-vite`, `las-webpack`) inject it automatically.
