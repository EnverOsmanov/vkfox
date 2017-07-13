"use strict";
const isPopup = typeof location !== 'undefined' && !~location.href.indexOf('background');

module.exports = {
    firefox:  true,
    popup: isPopup,
    background: !isPopup
};
