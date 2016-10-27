"use strict";
const DEFAULT_LANGUAGE = 'en',
    _                  = require('../shim/underscore.js')._,

    i18n = _.extend(
        {},
        require('./ru.js'),
        require('./uk.js'),
        require('./en.js')
    );

let language, locale, messages;

// Show russian locale for belorus
i18n.be = i18n.ru;
locale = navigator.language;

try {
    language = locale.split('-')[0].toLowerCase();
} catch (e) {}

if (!i18n[language]) {
    language = DEFAULT_LANGUAGE;
}

messages = i18n[language];

module.exports = {
    /**
     * Returns current browser language
     *
     * @returns {String}
     */
    getLang: function () {
        return language;
    },
    /**
     * Returns localized text
     *
     * @param {String} key
     *
     * @returns {String}
     */
    get: function (key) {
        return messages[key].apply(
            messages,
            [].slice.call(arguments, 1)
        );
    }
};
