'use strict';

const NODE_ENV = process.env.NODE_ENV || 'development';
const webpack = require('webpack');

module.exports = {
    entry: './develop/modules/app/app.install',
    output: {
        filename: "buildWeb/firefox/pages/install.js"
    },

    watch: NODE_ENV == 'development',

    devtool: NODE_ENV == "development" ? "cheap-inline-module-source-map" : null,

    plugins: [
        new webpack.IgnorePlugin(/^sdk\//),
        new webpack.IgnorePlugin(/^@loader\/options/),
        new webpack.IgnorePlugin(/^toolkit\/loader/),
        new webpack.IgnorePlugin(/^chrome$/)

    ]
};