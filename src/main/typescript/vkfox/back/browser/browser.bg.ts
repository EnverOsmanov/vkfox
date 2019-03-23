"use strict";
import {browser, Tabs} from "webextension-polyfill-ts"
import ProxyMethods from '../../proxy-methods/proxy-methods.bg';
type Tab = Tabs.Tab;
import {ProxyNames} from "../../mediator/messages";

const BADGE_COLOR: [number, number, number, number] = [231, 76, 60, 255],
    ICON_ONLINE = {
        "19": "../..//assets/logo19.png",
        "38": "../../assets/logo38.png"
    },
    ICON_OFFLINE = {
        "19": "../../assets/logo19_offline.png",
        "38": "../../assets/logo38_offline.png"
    };



class Browser {
    static init() {

        // Set up popup and popup comminication
        browser.browserAction.setBadgeBackgroundColor({color: BADGE_COLOR});

        // overcome circular dependency through mediator
        ProxyMethods.connect(ProxyNames.BrowserBg, Browser);
    }

    static getVkfoxVersion(): Promise<string> {
        return browser.management.getSelf()
            .then( info => info.version);
    }

    /**
     * Sets icon to online status
     */
    static setIconOnline(): Promise<void> {
        return browser.browserAction.setIcon({ path: ICON_ONLINE })
    }

    /**
     * Sets icon to offline status
     */
    static setIconOffline(): Promise<void> {
        return browser.browserAction.setIcon({ path: ICON_OFFLINE })
    }

    /**
     * @param {String|Number} text
     */
    static setBadgeText(text: string | number): Promise<void> {
        return browser.browserAction.setBadgeText({ text: String(text) })
    }

    /**
     * Says whether popup is visible
     *
     * @returns {Boolean}
     */
    static isPopupOpened(): boolean {
        return Boolean(browser.extension.getViews({type: "popup"}).length)
    }

    /**
     * Says whether vk.com is currently active tab
     *
     * @returns {Promise<Boolean>} Returns promise that resolves to Boolean
     */
    static async isVKSiteActive(): Promise<boolean> {
        const tabs = await browser.tabs.query({active: true});

        return tabs.length
            ? tabs[0].url.includes("vk.com")
            : false;
    }

    static createTab(url: string): Promise<Tab> {
        return browser.tabs.create({url})
    }


    static getOrCreate(url: string): Promise<Tab> {
        function findOrCreate(tabs: Tab[]): Promise<Tab> {
            const found = tabs.find( tab => tab.url.includes(url));
            if (found && !found.active) browser.tabs.update(found.id, {active: true});

            return found
                ? Promise.resolve(found)
                : Browser.createTab(url)
        }

        return browser.tabs.query({})
            .then(findOrCreate)
    }

    /**
     * Closes all tabs that contain urlFragment in its url
     */
    static closeTabs(urlFragment: string): Promise<void> {
        function closeTabs(tabs: Tab[]) {
            const tabIds =
                tabs.filter( tab => tab.url.includes(urlFragment))
                    .map( tab => tab.id );

            return browser.tabs.remove(tabIds);
        }

        return browser.tabs.query({})
            .then(closeTabs)
    }
}


export default Browser