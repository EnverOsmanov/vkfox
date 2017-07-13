const webpack = require('webpack');

module.exports = {
  context: __dirname + '/src/main/javascript',
  entry: {
    "app.install"     : './vkfox/app/app.install.ts',
    "app.pu"          : './vkfox/app/app.pu.ts',
    "app.bg"          : './vkfox/app/app.bg.ts',
    "ng"              : ["angular", "angular-animate", "angular-route", "angular-sanitize"],
    "vendor"          : ["vow", "underscore", "backbone", "linkifyjs", "moment"]
  },
  output: {
    path: __dirname + '/build/firefox/pages',
    filename: "[name].js"
  },
  watch  : true,
  devtool: false ? "cheap-inline-module-source-map" : false,
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /ru|en|uk/),
    new webpack.optimize.CommonsChunkPlugin({
      name: ["vendor", "ng"],
      minChunks: 2
    }),
  ],
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      angularKeypress  : 'angular-ui-utils/modules/keypress/keypress.js',
      bootstrapDropdown: 'bootstrap/js/dropdown.js'
    }
  },
  module: {
    rules: [
        { test: /\.ts$/, loader: "awesome-typescript-loader" },

        // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
        { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
    ]
  }

};