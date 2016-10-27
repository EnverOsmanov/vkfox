const webpack = require('webpack');

module.exports = {
  context: __dirname + '/develop',
  entry: {
    "app.install"     : './modules/app/app.install.js',
    "app.pu"          : './modules/app/app.pu.js',
    "app.bg"          : './modules/app/app.bg.js',
    "vendor"          : ["angular", "angular-animate", "angular-route", "angular-sanitize", "vow", "underscore", "backbone", "linkifyjs", "moment"]
  },
  output: {
    path: __dirname + '/build/firefox/pages',
    filename: "[name].js"
  },
  watch  : true,
  devtool: true ? "cheap-inline-module-source-map" : null,
  plugins: [
    new webpack.NoErrorsPlugin(),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /ru|en|uk/),
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      minChunks: Infinity
    })
  ],
  resolve: {
    alias: {
      angularKeypress  : 'angular-ui-utils/modules/keypress/keypress.js',
      bootstrapTooltip : 'bootstrap/js/tooltip.js',
      bootstrapDropdown: 'bootstrap/js/dropdown.js',
      'zepto/event'    : 'zepto/src/event',
      'zepto/detect'   : 'zepto/src/detect',
      'zepto/data'     : 'zepto/src/data',
      'zepto/selector' : 'zepto/src/selector'
    }
  }

};