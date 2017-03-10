const webpack = require('webpack');

module.exports = {
  context: __dirname + '/develop',
  entry: {
    "app.install"     : './modules/app/app.install.js',
    "app.pu"          : './modules/app/app.pu.js',
    "app.bg"          : './modules/app/app.bg.js',
    "ng"              : ["angular", "angular-animate", "angular-route", "angular-sanitize"],
    "vendor"          : ["vow", "underscore", "backbone", "linkifyjs", "moment"]
  },
  output: {
    path: __dirname + '/build/firefox/pages',
    filename: "[name].js"
  },
  watch  : true,
  devtool: true ? "cheap-inline-module-source-map" : null,
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /ru|en|uk/),
    new webpack.optimize.CommonsChunkPlugin({
      name: ["vendor", "ng"],
      minChunks: 2
    })
  ],
  resolve: {
    alias: {
      angularKeypress  : 'angular-ui-utils/modules/keypress/keypress.js',
      bootstrapTooltip : 'bootstrap/js/tooltip.js',
      bootstrapDropdown: 'bootstrap/js/dropdown.js'
    }
  }

};