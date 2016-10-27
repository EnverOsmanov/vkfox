"use strict";
const BADGE_COLOR = [231, 76, 60, 255],
    ICON_ONLINE = {
        "19": "../..//assets/logo19.png",
        "38": "../../assets/logo38.png"
    },
    ICON_OFFLINE = {
        "19": "../../assets/logo19_offline.png",
        "38": "../../assets/logo38_offline.png"
    },

    Vow = require('../shim/vow.js'),
    _   = require('../shim/underscore.js')._;

let Browser;

// Set up popup and popup comminication
chrome.browserAction.setBadgeBackgroundColor({color: BADGE_COLOR});


// overcome circular dependency through Mediator
_.defer(function () {
    require('../proxy-methods/proxy-methods.js').connect('../browser/browser.bg.js', Browser);
});
module.exports = Browser = {
    getVkfoxVersion: (function () {
        return browser.management.getSelf().then( (info) => info.version);
    }),
    /**
     * Sets icon to online status
     */
    setIconOnline: function () {
        chrome.browserAction.setIcon({path: ICON_ONLINE});
    },
    /**
     * Sets icon to offline status
     */
    setIconOffline: function () {
        chrome.browserAction.setIcon({path: ICON_OFFLINE});
    },
    /**
     * @param {String|Number} text
     */
    setBadgeText: function (text) {
        chrome.browserAction.setBadgeText({text: String(text)});
    },
    /**
     * Says whether popup is visible
     *
     * @returns {Boolean}
     */
    isPopupOpened: function () {
        return Boolean(chrome.extension.getViews({type: "popup"}).length);
    },
    /**
     * Says whether vk.com is currently active tab
     *
     * @returns {Vow.promise} Returns promise that resolves to Boolean
     */
    isVKSiteActive: (function () {
        var getActiveTabUrl, tabs;

        getActiveTabUrl = function () {
            var promise = Vow.promise();
            chrome.tabs.query({active: true}, function (tabs) {
                if (tabs.length) {
                    promise.fulfill(tabs[0].url);
                }
            });
            return promise;
        };

        return function () {
            return getActiveTabUrl().then(function (url) {
                return ~url.indexOf('vk.com');
            });
        };
    })(),
    createTab: (function () {
        return function (url) {
            chrome.tabs.create({url: url});
        };
    })(),
    /**
     * Closes all tabs that contain urlFragment in its url
     */
    closeTabs: (function () {
        return function (urlFragment) {
            console.log("I WANT CLOSE: " + urlFragment)
            chrome.tabs.query({}, function (tabs) {
                tabs.forEach(function (tab) {
                    if (~tab.url.indexOf(urlFragment)) {
                        chrome.tabs.remove(tab.id);
                    }
                });
            });
        };
    })()
};
