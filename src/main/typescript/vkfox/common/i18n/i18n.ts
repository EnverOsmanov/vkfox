"use strict";
import {Sex} from "../users/types";

const DEFAULT_LANGUAGE = "en";
const i18n = {
    ru: require("../../../../json/i18n/ru.json"),
    en: require("../../../../json/i18n/en.json"),
    uk: require("../../../../json/i18n/uk.json"),
    be: null
};

let language: string,
    locale: string,
    messages: object;

// Show russian locale for belorus
i18n.be = i18n.ru;
locale = navigator.language;

try {
    language = locale.split('-')[0].toLowerCase();
} catch (e) { console.warn("Locale is unsplitable")}

if (!i18n[language]) {
    language = DEFAULT_LANGUAGE;
}

messages = i18n[language];

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
        const message = messages[key];

        return message
            ? message.apply(messages, args)
            : key;
    }

    static getWithGender(key: string, sex: Sex): string {
        const gender = sex === 1
            ? "female"
            : "male";

        return I18N.get(key, {GENDER: gender})
    }
};
