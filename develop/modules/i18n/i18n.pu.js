// Set correct language for "moment" library
var I18N = require('./i18n.js');

require('moment').locale(I18N.getLang());

module.exports = I18N;
