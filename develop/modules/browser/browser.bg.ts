"use strict";
import * as _ from "underscore"
import ProxyMethods from '../proxy-methods/proxy-methods.bg';

const BADGE_COLOR: [number, number, number, number] = [231, 76, 60, 255],
    ICON_ONLINE = {
        "19": "../..//assets/logo19.png",
        "38": "../../assets/logo38.png"
    },
    ICON_OFFLINE = {
        "19": "../../assets/logo19_offline.png",
        "38": "../../assets/logo38_offline.png"
    };



const Browser = {
    init: () => {

        // Set up popup and popup comminication
        browser.browserAction.setBadgeBackgroundColor({color: BADGE_COLOR});

        // overcome circular dependency through mediator
        _.defer( () => ProxyMethods.connect('../browser/browser.bg', Browser) );
    },

    getVkfoxVersion: () => browser.management.getSelf().then( info => info.version),
    /**
     * Sets icon to online status
     */
    setIconOnline: () => browser.browserAction.setIcon({ path: ICON_ONLINE }),
    /**
     * Sets icon to offline status
     */
    setIconOffline: () => browser.browserAction.setIcon({ path: ICON_OFFLINE }),
    /**
     * @param {String|Number} text
     */
    setBadgeText: text => browser.browserAction.setBadgeText({ text: String(text) }),
    /**
     * Says whether popup is visible
     *
     * @returns {Boolean}
     */
    isPopupOpened(): boolean {
        return Boolean(browser.extension.getViews({type: "popup"}).length)
    },
    /**
     * Says whether vk.com is currently active tab
     *
     * @returns {Promise<Boolean>} Returns promise that resolves to Boolean
     */
    isVKSiteActive: () => {
        return browser.tabs
            .query({active: true})
            .then(tabs => {
                if (tabs.length) return ~tabs[0].url.indexOf('vk.com');
                else return false;
            });

    },
    createTab: url => browser.tabs.create({ url }),
    /**
     * Closes all tabs that contain urlFragment in its url
     */
    closeTabs: urlFragment => {
        function closeTab(tab) {
            if (~tab.url.indexOf(urlFragment)) browser.tabs.remove(tab.id);
        }

        browser.tabs.query({}).then( tabs => tabs.forEach(closeTab) );
    }
};


export default Browser