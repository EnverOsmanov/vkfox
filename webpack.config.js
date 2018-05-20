const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const extractLess = new ExtractTextPlugin({
    filename: "[name].css"
});



const isDev = process.env.NODE_ENV === "development";

module.exports = {
  context: __dirname + "/src/main/typescript",
  entry: {
    "app.install"   : "./vkfox/install/app/app.install.tsx",
    "app.pu"        : "./vkfox/popup/app/app.pu.tsx",
    "app.bg"        : "./vkfox/back/app/app.bg.ts",
    "photo"         : "./vkfox/vkfox-io/photo.ts",
    "video"         : "./vkfox/vkfox-io/video.ts",
    "doc"           : "./vkfox/vkfox-io/doc.ts"
  },
  output: {
    path: __dirname + "/target/firefox/pages",
  },
    mode: process.env.NODE_ENV,
  watch  : isDev,
  devtool: isDev ? "cheap-inline-module-source-map" : false,
  plugins: [
      extractLess,
      new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /ru|en|uk/),
      new HtmlWebpackPlugin({
          chunks: ["photo"],
          filename: "photo.html",
          template: "!!html-webpack-plugin/lib/loader.js!./src/main/resources/pages/vkfox-io/photo.html"
      }),
      new HtmlWebpackPlugin({
          chunks: ["video"],
          filename: "video.html",
          template: "!!html-webpack-plugin/lib/loader.js!./src/main/resources/pages/vkfox-io/video.html"
      }),
      new HtmlWebpackPlugin({
          chunks: ["doc"],
          filename: "doc.html",
          template: "!!html-webpack-plugin/lib/loader.js!./src/main/resources/pages/vkfox-io/doc.html"
      })
  ],
  resolve: {
    // Add ".ts" and ".tsx" as resolvable extensions.
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
        { test: /\.tsx?$/, loader: "awesome-typescript-loader" },

        // All output ".js" files will have any sourcemaps re-processed by "source-map-loader".
        { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
        {
            test: /\.(less|css)$/,
            use: extractLess.extract(
                {
                    use:[
                        { loader: "css-loader" },
                        { loader: "less-loader" },
                        { loader: "resolve-url-loader" }
                    ],
                    fallback: "style-loader"
                })
        },
    ]
  },
    optimization: {
        noEmitOnErrors: true,
        splitChunks: {
            chunks: "all"
        }
    }
};
