const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// @las/webpack CJS çıkışı default export olarak geliyor; .default yoksa direkt modülü kullan.
const LasCssModule = require("../../packages/plugins/webpack/src/index.ts"); // development anlık build almadan çalışır
//const LasCssModule = require("@las/webpack"); live içinde 
const LasCss = LasCssModule.default || LasCssModule;

module.exports = {
    mode: "development",
    entry: "./src/main.tsx",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
        clean: true,
    },
    resolve: { extensions: [".tsx", ".ts", ".js"] },
    module: {
        rules: [
            { test: /\.tsx?$/, use: "ts-loader", exclude: /node_modules/ },
            { test: /\.css$/, use: ["style-loader", "css-loader"] },
        ],
    },
    infrastructureLogging: { level: "error" },
    stats: "errors-warnings",
    plugins: [
        new HtmlWebpackPlugin({ template: "public/index.html" }),
        new LasCss(),
    ],
    devServer: {
        static: "./public",
        port: 5173,
        hot: true,
        historyApiFallback: true,
    },
};
