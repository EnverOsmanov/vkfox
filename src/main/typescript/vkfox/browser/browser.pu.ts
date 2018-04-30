"use strict";
import ProxyMethods from "../proxy-methods/proxy-methods.pu"
import Tab = browser.tabs.Tab;
/**
 * Returns a correct implementation
 * for background or popup page
 */

const namespace = "../browser/browser.bg";


export default {
    createTab(url: string): Promise<Tab> {
        return ProxyMethods.forwardM<Tab>(namespace, "createTab", url);
    },

    closePopup() { window.close() }
}
