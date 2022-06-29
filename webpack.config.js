const CompressionPlugin = require("compression-webpack-plugin");
module.exports = {
    
  plugins: [new CompressionPlugin()],

  entry: "./src/index.ts",
  optimization: {
    minimize: true,
  },
  output: {
    filename: "bundle.js",
    path: __dirname + "/build/bundle",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
};
