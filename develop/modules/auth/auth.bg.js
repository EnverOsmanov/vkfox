"use strict";
const Config = require("../config/config.js"),
    Mediator = require("../mediator/mediator.js"),
    Browser  = require("../browser/browser.bg.js"),
    _        = require("underscore")._,
    Backbone = require("backbone"),
    Vow      = require("vow"),
    Msg      = require("../mediator/messages.js");

const RETRY_INTERVAL = 10000, //ms
    CREATED          = 1,
    IN_PROGRESS      = 1,
    READY            = 2;

const model = new Backbone.Model();

let Auth, iframe,
    state       = CREATED,
    authPromise = Vow.promise();

function tryLogin() {
    if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.name = "vkfox-login-iframe";
        document.body.appendChild(iframe);
    }
    iframe.setAttribute("src", Config.AUTH_URI + "&time=" + Date.now());
}

function freeLogin() {
    document.body.removeChild(iframe);
    iframe = null;
}

function onSuccess(data) {
    state = READY;
    Browser.setIconOnline();
    authPromise.fulfill(data);
}

// We need to authorize in own window, after user was logined in a tab
// In google chrome we use content-script for this purpose (declared in manifest.js)

Mediator.sub(Msg.AuthIframe, function (url) {
    try {
        model.set("userId",  parseInt(url.match(/user_id=(\w+)(?:&|$)/i)[1], 10));
        model.set("accessToken",  url.match(/access_token=(\w+)(?:&|$)/i)[1]);

        // After successful login we should close all auth tabs
        Browser.closeTabs(Config.AUTH_DOMAIN);
        freeLogin();
    } catch (e) {
        console.error(`AuthIframe: ${e}`);
    }
}.bind(this));

Mediator.sub(Msg.AuthStateGet, () => Mediator.pub(Msg.AuthState, state) );

Mediator.sub(Msg.AuthOauth, () => Browser.createTab(Config.AUTH_URI) );

Mediator.sub(Msg.AuthLogin, force => Auth.login(force) );

model.on("change:accessToken", () => Mediator.pub(Msg.AuthSuccess, model.toJSON()) );


module.exports = Auth = {
    retry           : _.debounce(function () {
        if (state === IN_PROGRESS) {
            Auth.login(true);
            Auth.retry();
        }
    }, RETRY_INTERVAL),
    login           : function (force) {
        if (force || state === CREATED) {
            Browser.setIconOffline();
            state = IN_PROGRESS;

            if (authPromise.isFulfilled()) {
                authPromise = Vow.promise();
            }

            tryLogin();
            Auth.retry();

            Mediator.unsub(Msg.AuthSuccess, onSuccess);
            Mediator.once(Msg.AuthSuccess, onSuccess);
        }
        return authPromise;
    },

    getAccessToken  : () => Auth.login().then( () => model.get("accessToken") ),

    getUserId       : () => Auth.login().then( () => model.get("userId") )
};

Auth.login();
