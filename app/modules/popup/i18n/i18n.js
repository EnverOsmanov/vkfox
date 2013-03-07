define(function () {
    var lang = window.navigator.language.match(/(ru)|(en)/)[1] || 'ru';

    function factory() {
        var store = {};

        function i18n(key, data) {
            var translation;
            try {
                translation = store[key][lang];
            } catch (e) {
                throw new Error('Undefined keyset: ' + lang + ' ' + key);
            }

            if (typeof translation === 'function') {
                return translation(data);
            } else {
                return translation;
            }
        }
        i18n.decl = function (key, translations) {
            store[key] = translations;
        };
        return i18n;
    }
    return factory;
});