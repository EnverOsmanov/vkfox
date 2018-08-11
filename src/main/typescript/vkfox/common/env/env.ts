declare const InstallTrigger: any;
declare const chrome: any;

const isPopup = typeof location !== 'undefined' && !~location.href.indexOf('background');
const isFirefox = typeof InstallTrigger !== "undefined";
const isChrome = !!chrome && !!chrome.webstore;

const Env = {
    firefox   : isFirefox,
    chrome    : isChrome,
    popup     : isPopup,
    background: !isPopup
};

export default Env;
