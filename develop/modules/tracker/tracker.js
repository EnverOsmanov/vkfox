"use strict";

/*jshint bitwise: false */
/*global $ */
const _             = require('../shim/underscore.js')._,
    PersistentModel = require('../persistent-model/persistent-model.js'),
    I18n            = require('../i18n/i18n.js'),
    Env             = require('../env/env.js'),
    Browser         = require('../browser/browser.js'),
    Request         = require('../request/request.js'),
    Config          = require('../config/config.js'),
    Vow             = require("vow");

const url             = 'http://www.google-analytics.com/collect';
const persistentModel = new PersistentModel({}, {name: 'tracker'});

const commonParamsPromise = Browser.getVkfoxVersion().then( version => {
    return {
        v  : 1, // Version.
        tid: Config.TRACKER_ID, // Tracking ID / Web property / Property ID.
        cid: persistentModel.get('guid'), // Anonymous Client ID.
        ul : I18n.getLang(), //user language
        ap : version //app version
    };
});

/**
 * Creates unique identifier if VKfox instance
 *
 * @see http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
 */
function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
function getBrowserVersion() {
    return browser.runtime.getBrowserInfo()
        .then( info => `${info.name} ${info.version} (${info.buildID})`)
}
function getPage() {
    if (Env.background) return '/pages/background.html';
    else {
        if (location.hash) return location.hash.replace('#', '');
        else return location.pathname;
    }
}

if (!persistentModel.has('guid')) {
    persistentModel.set('guid', guid());
}

let tracker;
module.exports = tracker = {
    trackPage: function () {
        commonParamsPromise.then(function (params) {
            Request.post(url, _.extend({}, params, {
                t: 'pageview',          // Pageview hit type.
                dp: getPage() // Page
            }));
        });
    },
    /**
    * Tracks a custom event
    * @param {String} category
    * @param {String} action
    * @param {String} [label]
    * @param {Number} [value]
    */
    trackEvent: (category, action, label, value) => {
        return commonParamsPromise.then(function (params) {
            Request.post(url, _.extend({}, params, {
                t : 'event', // Event hit type
                ec: category, // Event Category. Required.
                ea: action, // Event Action. Required.
                el: label, // Event label.
                ev: value, // Event value.
                dp: getPage() // Page
            }));
        });
    },
    /**
     * Remote debug. All arguments would be send to Analytics.
     *
     * @param {...Mixed} var_args Any number of arguments,
     * that will be sent to Analytics
     */
    debug: function () {
        const args = Array.prototype.slice.call(arguments);

        Browser.getVkfoxVersion().then(function (version) {
            tracker.trackEvent(
                'debug;v' + version,
                JSON.stringify(args)
            );
        }).done();
    },
    /**
     * Remotely track an error
     *
     * @param {Error} stack
     */
    error: function (stack) {
        Vow.all([Browser.getVkfoxVersion(), getBrowserVersion()])
            .spread(function (vkfoxVersion, browserVersion) {
                this.trackEvent(
                    'error;v' + vkfoxVersion,
                    stack,
                    browserVersion
                ).bind(this);
            }).done();
    }
};
