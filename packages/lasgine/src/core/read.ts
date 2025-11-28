import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const red = "\x1b[31m";
const reset = "\x1b[0m";

function resolveLascssFile(relative: string) {
  try {
    const pkgPath = require.resolve("lascss/package.json");
    const pkgDir = path.dirname(pkgPath);
    return path.join(pkgDir, relative);
  } catch {
    console.error(`${red}
❌ lascss paketi bulunamadı!
Lütfen 'npm i lascss' çalıştırdığınızdan emin olun.
${reset}`);
    process.exit(1);
  }
}

export function readUtilityCSS() {
  const cssPath = resolveLascssFile("dist/utility.min.css");
  return fs.readFileSync(cssPath, "utf-8");
}

export function readMetaCSS() {
  const metaPath = resolveLascssFile("dist/meta.min.css");
  return fs.readFileSync(metaPath, "utf-8");
}

export function readBaseCSS() {
  const cssPath = resolveLascssFile("dist/base.min.css");
  return fs.readFileSync(cssPath, "utf-8");
}
