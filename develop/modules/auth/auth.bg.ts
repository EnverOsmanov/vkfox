"use strict";
import * as Config from "../config/config";
import Mediator from "../mediator/mediator.bg";
import Browser from "../browser/browser.bg";
import * as Vow from "vow";
import Msg from "../mediator/messages";
import {AuthModel} from "./models";

const RETRY_INTERVAL = 10000, //ms
    CREATED          = 1,
    IN_PROGRESS      = 2,
    READY            = 3;

const model = new AuthModel();

let state = CREATED;

let iframe: HTMLIFrameElement,
    authPromise: Promise<object>;


function tryLogin() {
    if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.name = "vkfox-login-iframe";
        document.body.appendChild(iframe);

        iframe.setAttribute("src", Config.AUTH_URI + "&time=" + Date.now());
        setTimeout(() => {
            if (state == IN_PROGRESS) Browser.createTab(Config.AUTH_URI)
        }, RETRY_INTERVAL)
    }
}

function freeLogin() {
    if (document.body.contains(iframe)) document.body.removeChild(iframe);
    iframe = null;
}

function onSuccess(data, resolve) {
    state = READY;
    Browser.setIconOnline();
    resolve(data);
}

// We need to authorize in own window, after user was logined in a tab
// In google chrome we use content-script for this purpose (declared in manifest.js)




function onAuthIframe(url: string) {

    try {
        model.userId = parseInt(url.match(/user_id=(\w+)(?:&|$)/i)[1], 10);
        model.accessToken = url.match(/access_token=(\w+)(?:&|$)/i)[1];

        // After successful login we should close all auth tabs
        Browser.closeTabs(Config.AUTH_DOMAIN);
        freeLogin();
    } catch (e) {
        console.error(`AuthIframe: ${e}`);
    }
}


function promisify(resolve) {

    Mediator.unsub(Msg.AuthSuccess, data => onSuccess(data, resolve));
    Mediator.once(Msg.AuthSuccess, data => onSuccess(data, resolve));
}


export default class Auth {

    static login(resetToken?: boolean, withWindow?: boolean) {
        console.debug("giveMeLogin", resetToken, withWindow, state, iframe);

        state = IN_PROGRESS;
        Browser.setIconOffline();

        if (withWindow) Browser.createTab(Config.AUTH_URI);
        else tryLogin();

        if (resetToken) return authPromise = new Vow.Promise(promisify);
        else return Auth.tokenReady();
    }

    static tokenReady() {
        if (authPromise) return authPromise;
        else return authPromise = new Vow.Promise(promisify);
    }

    static getAccessToken() {
        return Auth.tokenReady().then( () => model.accessToken )
    }

    static getUserId() {
        return Auth.tokenReady().then( () => model.userId )
    }

    static init() {
        Mediator.sub(Msg.AuthIframe, onAuthIframe);
        //Mediator.sub(Msg.AuthLogin, Auth.login);
        Mediator.sub(Msg.AuthStateGet, () => Mediator.pub(Msg.AuthState, state) );
        Mediator.sub(Msg.AuthOauth, () => Auth.login(false, true) );

        model.on("change:userId", () => Mediator.pub(Msg.AuthSuccess, model.toJSON()) );
    }
}
