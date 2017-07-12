"use strict";
const DEFAULT_LANGUAGE = 'en';

const i18n: any = {
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

export default class I18N {
    /**
     * Returns current browser language
     *
     * @returns {String}
     */
    static getLang() {
        return language
    }

    /**
     * Returns localized text
     *
     * @param {String} key
     * @param {Array} args
     *
     * @returns {String}
     */
    static get(key: string, ...args): string {
        return messages[key].apply(messages, args);
    }
};
