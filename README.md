# LAS CSS Monorepo

Monorepo for the LAS CSS ecosystem: utility-first SCSS framework, JIT engine, and Vite/Webpack plugins.

## Packages
- `lascss`: Utility-first SCSS framework with base/meta/utility layers.
- `@las/lasgine`: JIT engine that scans your project and emits only the CSS you use.
- `@las/vite`: Vite plugin; virtual module in dev, inlines CSS on build.
- `@las/webpack`: Webpack plugin; virtual module in dev, inline or external CSS in prod.

## Quick Install
```bash
npm install lascss @las/lasgine
pnpm add lascss @las/lasgine
yarn add lascss @las/lasgine
```

### Vite
```ts
import { defineConfig } from "vite";
import lascss from "@las/vite";

export default defineConfig({
  plugins: [lascss({ scanDirs: ["src"] })],
});
```
Add to your app: `import "virtual:las.css";`

### Webpack
```js
const LascssPlugin = require("@las/webpack").default;

module.exports = {
  plugins: [new LascssPlugin({ scanDirs: ["src"] })],
};
```
Add to your app: `import "las.css";`

## Development
```bash
pnpm install
pnpm dev          # turbo runs dev in parallel
pnpm build        # all packages
```

Per package:
- `packages/lascss`: `pnpm run build` (base/meta/utility CSS) + `postbuild` copies README/License.
- `packages/lasgine`: `pnpm run build` (tsup) + `postbuild`.
- `packages/plugins/vite`: `pnpm run build` (tsc) + `postbuild`.
- `packages/plugins/webpack`: `pnpm run build` (tsup) + `postbuild`.

## Examples
- `examples/webpack`: Webpack integration example. Add a Vite example and link it here if needed.

## License
MIT
