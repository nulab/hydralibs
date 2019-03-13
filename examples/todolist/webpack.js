const path = require("path")
const webpack = require("webpack")
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin")
const FixDefaultImportPlugin = require("webpack-fix-default-import-plugin")
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

function absPath(filePath) {
  return path.join(__dirname, filePath)
}

module.exports = {
  mode: "development",
  entry: {
    bundle: [
      "react-hot-loader/patch",
      absPath("src/index.tsx")
    ]
  },
  resolve: {
    modules: [path.resolve("./src"), path.resolve("."), "node_modules"],
    extensions: [".js", ".ts", ".jsx", ".tsx"],
    symlinks: false,
    alias: {
      'react-dom': '@hot-loader/react-dom' 
    }
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
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "url-loader?limit=10000&mimetype=application/font-woff"
      },
      {
        test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "file-loader"
      },
      {
        test: /\.(gif|jpe?g|png)$/,
        loader: "url-loader"
      },
      {
        test: /\.svg$/,
        loader: "svg-inline-loader"
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader"
        ]
      },
      {
        test: /\.(js|jsx|tsx|ts)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
            babelrc: false,
            presets: [
              "@babel/preset-react",
              "@babel/preset-typescript",
              "@babel/preset-env"
            ],
            plugins: [
              // plugin-proposal-decorators is only needed if you're using experimental decorators in TypeScript
              ["@babel/plugin-proposal-decorators", { legacy: true }],
              ["@babel/plugin-proposal-class-properties", { loose: true }],
              "react-hot-loader/babel"
            ]
          }
        }
      }
    ]
  }
}
