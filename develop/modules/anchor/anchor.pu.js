"use strict";
const Browser = require('../browser/browser.js');

$(document).on('click', '[anchor]', function (e) {
    const jTarget = $(e.currentTarget);

    Browser.createTab(jTarget.attr('anchor'));
});
