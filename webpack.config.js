const path = require("path");

const isProd = process.env.NODE_ENV === "production";

module.exports = {
  mode: isProd ? "production" : "development",
  entry: path.join(__dirname, "/client/src/index.jsx"),
  output: {
    path: path.join(__dirname, "/client/dist"),
    filename: "bundle.js",
  },
  // Lighter maps in dev; disable in prod to speed and reduce memory
  devtool: isProd ? false : "eval-cheap-module-source-map",
  // Cache only in dev (prod is a one-off build)
  cache: isProd ? false : { type: "filesystem" },
  // Keep logs minimal
  stats: "errors-warnings",
  resolve: {
    extensions: [".js", ".jsx", ".mjs"],
  },
  // Watch tuning only applies in dev
  watchOptions: isProd
    ? undefined
    : {
        ignored: ["**/node_modules/**", "**/server/**", "**/client/dist/**"],
        aggregateTimeout: 300,
        // poll: 1000,
      },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: path.resolve(__dirname, "client/src"),
        exclude: /node_modules/,
        type: "javascript/esm",
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              ["@babel/preset-env", { targets: "defaults", modules: false }],
              ["@babel/preset-react", { runtime: "automatic" }],
            ],
            // Helpful in dev; harmless in prod but not required
            cacheDirectory: !isProd,
          },
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};