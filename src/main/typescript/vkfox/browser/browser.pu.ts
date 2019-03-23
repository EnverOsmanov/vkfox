"use strict";
import {Tabs} from "webextension-polyfill-ts"
import ProxyMethods from "../proxy-methods/proxy-methods.pu"
import Tab = Tabs.Tab;
import {ProxyNames} from "../mediator/messages";
/**
 * Returns a correct implementation
 * for background or popup page
 */


class BrowserPu {
    static createTab(url: string): Promise<Tab> {
        return ProxyMethods.forwardM<Tab>(ProxyNames.BrowserBg, "createTab", url);
    }

    static closePopup(): void { window.close() }
}

export default BrowserPu;
