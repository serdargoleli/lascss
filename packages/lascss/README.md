# LAS CSS

Utility-first, SCSS-powered design system. Ships base, meta, and utility layers and pairs with LAS Engine for JIT CSS generation.

## Quick Start

- Install:

```bash
npm install lascss
pnpm add lascss
yarn add lascss
```

- Files: `dist/base.min.css`, `dist/meta.min.css`, `dist/utility.min.css`

- Layered import:

```css
@import "lascss/dist/base.min.css";
@import "lascss/dist/meta.min.css";
@import "lascss/dist/utility.min.css";
```

## How It Works

- Base: Reset plus core typography and grid.
- Meta: CSS custom properties for breakpoints, variants, colors, and opacities.
- Utility: Prebuilt utility classes. LAS Engine reads this package and emits only the classes your project uses.

## Use with the JIT Engine

- LAS Engine consumes base/meta/utility from this package.
- With `las-vite` or `las-webpack`, only the CSS for actually used classes is injected—lean output for better performance and SEO.
