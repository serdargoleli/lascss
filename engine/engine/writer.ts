import { generateCss } from "./generator";
import path from "path";
import fs from "fs";
// ilk açıldığında var olan classları yazar
export function writeCSS(usedClasses: Set<string>, cssMap: Map<string, string>, config: any, outputPath: string) {
    let css = '/* LAS JIT - Auto-generated CSS */\n\n';
    usedClasses.forEach(cls => {
        const generated = generateCss(cls, cssMap, config);
        if (generated) {
            css += generated + '\n';
        }
    });
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, css);

}