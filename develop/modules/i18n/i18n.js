"use strict";
const DEFAULT_LANGUAGE = 'en';

const i18n = {
  ru: require('./ru.js'),
  uk: require('./uk.js'),
  en: require('./en.js')
};

let language, locale, messages;

// Show russian locale for belorus
i18n.be = i18n.ru;
locale = navigator.language;

try {
    language = locale.split('-')[0].toLowerCase();
} catch (e) { console.warn("Locale is unsplitable")}

if (!i18n[language]) {
    language = DEFAULT_LANGUAGE;
}

messages = i18n[language].i18n[language];

module.exports = {
    /**
     * Returns current browser language
     *
     * @returns {String}
     */
    getLang: () => language,
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
