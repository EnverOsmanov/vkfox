const webpack = require('webpack');

const isDev = process.env.NODE_ENV === "development";

module.exports = {
  context: __dirname + '/src/main/typescript',
  entry: {
    "app.install"     : './vkfox/app/app.install.tsx',
    "app.pu"          : './vkfox/popup/app/app.pu.tsx',
    "app.bg"          : './vkfox/app/app.bg.ts',
    "ng"              : ["react", "react-dom", "react-router-dom"],
    "vendor"          : ["underscore", "backbone", "linkifyjs", "moment"]
  },
  output: {
    path: __dirname + '/target/firefox/pages',
    filename: "[name].js"
  },
    mode: process.env.NODE_ENV,
  watch  : isDev,
  devtool: isDev ? "cheap-inline-module-source-map" : false,
  plugins: [
      new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /ru|en|uk/),
      new webpack.DefinePlugin({
          'process.env': {
              'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
          }
      })
  ],
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      bootstrapDropdown: 'bootstrap/js/dropdown.js'
    }
  },
  module: {
    rules: [
        { test: /\.tsx?$/, loader: "awesome-typescript-loader" },

        // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
        { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
    ]
  }

};