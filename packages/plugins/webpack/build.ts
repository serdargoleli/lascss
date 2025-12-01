import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function renameJsToCjs(dir: string) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const full = path.join(dir, file);

    if (file.endsWith(".js")) {
      const newFile = full.replace(/\.js$/, ".cjs");
      fs.renameSync(full, newFile);
      console.log("Renamed:", file, "→", path.basename(newFile));
    }
  }
}

console.log("Building ESM...");
execSync("tsc -p tsconfig.esm.json", { stdio: "inherit" });

console.log("Building CJS...");
execSync("tsc -p tsconfig.cjs.json", { stdio: "inherit" });

console.log("Renaming .js → .cjs for CJS build...");
renameJsToCjs("dist/cjs");

console.log("Done!");
