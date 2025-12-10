# @las/webpack

Webpack plugin for LAS CSS + LAS Engine. Scans your project, JIT-generates only the utility classes you use, serves a virtual module in dev, and outputs inline or external CSS in production.

## Install
```bash
npm install -D lascss @las/webpack
pnpm add -D lascss @las/webpack
yarn add -D lascss @las/webpack
```

## Usage
`webpack.config.js`:
```js
// CommonJS
const lascss = require("@las/webpack").default;
// ESM
import lascss from "@las/webpack";

module.exports = {
  plugins: [
    new lascss({
      scanDirs: ["src"],           // default: ["src"]
      extensions: [".tsx", ".jsx"],// merged with defaults
      ignoreDirs: ["dist"],        // merged with defaults
      // output: "assets/las.css", // write a file in prod and link via HtmlWebpackPlugin
    }),
  ],
};
```

App entry:
```js
import "las.css"; // plugin swaps the virtual module with generated CSS
```

## How It Works
- LAS Engine scans `scanDirs` and CSS/SCSS files, then builds CSS for used classes.
- Dev: CSS is written to the `las.css` virtual module with HMR updates.
- Prod:
  - Without `output`: CSS stays inline (virtual module can be empty if you don’t use style-loader).
  - With `output`: CSS is emitted as a file; if HtmlWebpackPlugin is present, a `link rel="stylesheet"` is injected automatically.

## Options (LasEngineOptions)
- `scanDirs`: Directories to scan. Default: `["src"]`.
- `extensions`: Content extensions (merged with html/js/ts/vue/svelte defaults).
- `cssExtensions`: CSS/SCSS extensions (merged with defaults).
- `ignoreDirs`: Directories to ignore (merged with defaults).
- `output`: CSS file path for production (e.g., `css/las.css`).
