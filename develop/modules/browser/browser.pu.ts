"use strict";
import ProxyMethods from "../proxy-methods/proxy-methods.pu"
/**
 * Returns a correct implementation
 * for background or popup page
 */
const Browser = ProxyMethods.forward('../browser/browser.bg', [
    'createTab', 'getVkfoxVersion'
]);
Browser.closePopup = () => window.close();


export default Browser
