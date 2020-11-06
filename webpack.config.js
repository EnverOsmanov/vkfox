const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");


const isDev = process.env.NODE_ENV === "development";

module.exports = {
  context: __dirname + "/src/main/typescript",
  entry: {
    "app.install"   : "./vkfox/ui/install/app/app.install.tsx",
    "app.pu"        : "./vkfox/ui/popup/app/app.pu.tsx",
    "app.bg"        : "./vkfox/back/app/app.bg.ts",
    "photo"         : "./vkfox/ui/vkfox-io/photo.ts",
    "video"         : "./vkfox/ui/vkfox-io/video.ts",
    "doc"           : "./vkfox/ui/vkfox-io/doc.ts"
  },
  output: {
    path: __dirname + "/target/firefox/pages",
  },
    mode: process.env.NODE_ENV,
  watch  : isDev,
  devtool: isDev ? "inline-cheap-module-source-map" : false,
  plugins: [
      new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /ru|en|uk/),
      new HtmlWebpackPlugin({
          chunks: ["doc~photo~video", "photo"],
          filename: "photo.html",
          template: "!!html-webpack-plugin/lib/loader.js!./src/main/resources/pages/vkfox-io/photo.html"
      }),
      new HtmlWebpackPlugin({
          chunks: ["doc~photo~video", "video"],
          filename: "video.html",
          template: "!!html-webpack-plugin/lib/loader.js!./src/main/resources/pages/vkfox-io/video.html"
      }),
      new HtmlWebpackPlugin({
          chunks: ["doc~photo~video", "doc"],
          filename: "doc.html",
          template: "!!html-webpack-plugin/lib/loader.js!./src/main/resources/pages/vkfox-io/doc.html"
      }),
      new HtmlWebpackPlugin({
          chunks: ["vendors~app.bg~app.install", "vendors~app.install~app.pu", "app.install"],
          filename: "install.html",
          template: "!!html-webpack-plugin/lib/loader.js!./src/main/resources/pages/install.html"
      }),
      new HtmlWebpackPlugin({
          chunks: ["vendors~app.bg~app.install", "vendors~app.bg~app.pu", "app.pu"],
          filename: "popup.html",
          template: "!!html-webpack-plugin/lib/loader.js!./src/main/resources/pages/popup.html"
      }),
      new HtmlWebpackPlugin({
          chunks: ["vendors~app.bg~app.install~app.pu", "vendors~app.bg~app.pu", "app.bg"],
          filename: "background.html",
          template: "!!html-webpack-plugin/lib/loader.js!./src/main/resources/pages/background.html"
      })
  ],
  resolve: {
      alias: {
          path: "path-browserify",
          util: "util"
      },
      // Add ".ts" and ".tsx" as resolvable extensions.
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
        { test: /\.tsx?$/, loader: "ts-loader" },

        // All output ".js" files will have any sourcemaps re-processed by "source-map-loader".
        { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
        {
            test: /\.(css|scss|sass)$/,
            use: [
                // Creates `style` nodes from JS strings
                "style-loader",
                // Translates CSS into CommonJS
                {
                    loader: "css-loader",
                    options: {sourceMap: isDev}
                },
                // Compiles Sass to CSS
                {
                    loader: "sass-loader",
                    options: {sourceMap: isDev}
                },
            ],
        },
        {
            test: /.*(:?ru|en|uk)\.(json)$/,
            type: 'javascript/auto', // required by Webpack 4
            loader: require.resolve('messageformat-loader'),
            options: {
                biDiSupport: false,
                convert: false,
                disablePluralKeyChecks: false,
                formatters: null,
                intlSupport: false,
                locale: ["en", "ru", "uk"],
                strictNumberSign: false
            }
        },
        {
            test: /\.(ttf|eot|woff|woff2|svg|otf|gif|png)$/,
            loader: "file-loader"
        }
    ]
  },
    optimization: {
        emitOnErrors: false,
        splitChunks: {
            chunks: "all"
        }
    }
};
