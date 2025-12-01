import type { Compiler } from "webpack";

export default class LasCss {
  apply(compiler: Compiler) {
    //beforeRun, run, watchRun örnekler consola farklı renkte yazar
    compiler.hooks.beforeRun.tap("LasCss", () => {
      console.clear();
      console.log("\x1b[31m%s\x1b[0m", "beforeRun");
    });
    compiler.hooks.run.tap("LasCss", () => {
      console.clear();
      console.log("\x1b[32m%s\x1b[0m", "run");
    });
    compiler.hooks.watchRun.tap("LasCss", () => {
      console.clear();
      console.log("\x1b[33m%s\x1b[0m", "watchRun");
    });
  }
}
