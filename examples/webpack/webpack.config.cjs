const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// Development'ta build edilmiş dist kullanıyoruz (turbo watch ile otomatik build)
const LasCss = require("@las/webpack").default;
//const LasCssModule = require("../../packages/plugins/webpack/dist/cjs/index.cjs");
//const LasCss = LasCssModule.default || LasCssModule;

module.exports = {
  entry: "./src/main.tsx",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true
  },
  resolve: { extensions: [".tsx", ".ts", ".js"] },
  module: {
    rules: [
      { test: /\.tsx?$/, use: "ts-loader", exclude: /node_modules/ },
      { test: /\.css$/, use: ["style-loader", "css-loader"] }
    ]
  },
  infrastructureLogging: { level: "error" },
  stats: "errors-warnings",
  plugins: [
    new HtmlWebpackPlugin({ template: "public/index.html" }),
    new LasCss({
      output: "style/las.css" // -> bu şekilde path varsa prodcution ortamında dist/style/las.css oluşur ve external olarak ekler yoksa inline olarak ekler
    })
  ],
  devServer: {
    static: "./public",
    port: 5173,
    hot: true,
    historyApiFallback: false
  }
};
