"use strict";
const Env   = require('../env/env.js'),
    browser = require('../browser/browser.bg.js');

module.exports = require('../proxy-methods/proxy-methods.js').connect('../resize/resize.bg.js', {
    setPanelSize: function(width, height) {
    }
});
