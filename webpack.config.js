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
    "app.install"   : "./vkfox/ui/install/app/app.install.tsx",
    "app.pu"        : "./vkfox/ui/popup/app/app.pu.tsx",
    "app.sidebar"   : "./vkfox/ui/sidebar/app/app.sidebar.tsx",
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
  devtool: isDev ? "cheap-inline-module-source-map" : false,
  plugins: [
      extractLess,
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
          chunks: ["vendors~app.bg~app.install~app.pu~app.sidebar", "vendors~app.install~app.pu~app.sidebar", "app.install"],
          filename: "install.html",
          template: "!!html-webpack-plugin/lib/loader.js!./src/main/resources/pages/install.html"
      }),
      new HtmlWebpackPlugin({
          chunks: ["vendors~app.bg~app.install~app.pu~app.sidebar", "vendors~app.bg~app.pu~app.sidebar", "app.pu"],
          filename: "popup.html",
          template: "!!html-webpack-plugin/lib/loader.js!./src/main/resources/pages/popup.html"
      }),
      new HtmlWebpackPlugin({
          chunks: ["vendors~app.bg~app.install~app.pu~app.sidebar", "vendors~app.bg~app.pu~app.sidebar", "app.sidebar"],
          filename: "sidebar.html",
          template: "!!html-webpack-plugin/lib/loader.js!./src/main/resources/pages/popup.html"
      }),
      new HtmlWebpackPlugin({
          chunks: ["vendors~app.bg~app.install~app.pu~app.sidebar", "vendors~app.bg~app.pu~app.sidebar", "app.bg"],
          filename: "background.html",
          template: "!!html-webpack-plugin/lib/loader.js!./src/main/resources/pages/background.html"
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
            test: /\.(css|scss|sass)$/,
            use: extractLess.extract(
                {
                    use:[{
                        loader: "css-loader",
                        options: {sourceMap: isDev}
                    }, {
                        loader: "sass-loader",
                        options: {sourceMap: isDev}
                    },
                        {loader: "resolve-url-loader"}
                    ],
                    fallback: "style-loader"
                })
        },
        {
            test: /\.(ttf|eot|woff|woff2|svg|otf|gif|png)$/,
            loader: "file-loader"
        }
    ]
  },
    optimization: {
        noEmitOnErrors: true,
        splitChunks: {
            chunks: "all"
        }
    }
};
