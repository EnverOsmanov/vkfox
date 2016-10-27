const webpack = require('webpack');

module.exports = {
  context: __dirname + '/develop',
  entry: {
    "app.install": './modules/app/app.install.js',
    "app.pu"     : './modules/app/app.pu.js',
    "app.bg"     : './modules/app/app.bg.js'
  },
  output: {
    path: __dirname + '/build',
    filename: "[name].js"
  },
  watch  : true,
  devtool: true ? "cheap-inline-module-source-map" : null,
  plugins: [
    new webpack.IgnorePlugin(/^sdk\//),
    new webpack.IgnorePlugin(/^@loader\/options/),
    new webpack.IgnorePlugin(/^toolkit\/loader/),
    new webpack.IgnorePlugin(/^chrome$/),
    new webpack.NoErrorsPlugin(),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /ru|en|uk/),
    new webpack.optimize.CommonsChunkPlugin({
      names: ["vendor"],
      minChunks: 2
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