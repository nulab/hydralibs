const path = require("path")
const webpack = require("webpack")
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin")
const FixDefaultImportPlugin = require("webpack-fix-default-import-plugin")

function absPath(filePath) {
  return path.join(__dirname, filePath)
}

module.exports = {
  mode: "development",
  entry: {
    bundle: [
      "babel-polyfill",
      "react-hot-loader/patch",
      absPath("src/index.ts")
    ]
  },
  resolve: {
    modules: [path.resolve("./src"), path.resolve("."), "node_modules"],
    extensions: [".js", ".ts", ".jsx", ".tsx"],
    symlinks: false
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: "development"
    }),
    new CaseSensitivePathsPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.NamedModulesPlugin(),
    new FixDefaultImportPlugin()
  ],
  devtool: "cheap-module-eval-source-map",
  devServer: {
    host: "0.0.0.0",
    contentBase: absPath("./public"),
    port: 8008,
    hotOnly: true,
    historyApiFallback: true,
    disableHostCheck: true
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        options: {
          transpileOnly: true
        }
      }
    ]
  }
}
