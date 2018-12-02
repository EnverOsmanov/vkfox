"use strict";
import * as Config from "../../common/config/config";
import Mediator from "../../mediator/mediator.bg";
import Browser from "../browser/browser.bg";
import {Msg} from "../../mediator/messages";
import {AuthModel, AuthState} from "./models";
import {AuthModelI} from "./types";

const RETRY_INTERVAL = 60000; //ms

const authModel = new AuthModel();

let state = AuthState.NULL;

let iframe: HTMLIFrameElement,
    authPromise: Promise<AuthModelI>;


function tryLogin() {
    if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.name = "vkfox-login-iframe";
        document.body.appendChild(iframe);

        iframe.setAttribute("src", Config.AUTH_URI + "&time=" + Date.now());
        setTimeout(() => {
            //console.debug("With tab", state)
            if (state == AuthState.LOCKED_IFRAME) {
                state = AuthState.LOCKED_WINDOW;
                loginWithWindow();
            }
        }, RETRY_INTERVAL)
    }
}

function freeLogin() {
    if (document.body.contains(iframe)) document.body.removeChild(iframe);
    iframe = null;
}


// We need to authorize in own window, after user was logined in a tab
// In google chrome we use content-script for this purpose (declared in manifest.js)




function onAuthIframe(url: string) {
    if ((state === AuthState.LOCKED_IFRAME) || (state == AuthState.LOCKED_WINDOW)) {
        try {
            //console.log("new Token?", state)
            const userId = parseInt(url.match(/user_id=(\w+)(?:&|$)/i)[1], 10);
            const accessToken = url.match(/access_token=(\w+)(?:&|$)/i)[1];
            state = AuthState.LOCKED_TOKEN_PROCESSING;

            authModel.userId = userId;
            authModel.accessToken = accessToken;
        } catch (e) {
            console.error(`AuthIframe: ${e}`);
        }
    }
    else {
        console.debug("Token received but not locked anymore", state)
    }
    // After successful login we should close all auth tabs
    Browser.closeTabs(Config.AUTH_DOMAIN);
    freeLogin();
}

function loginWithWindow() {
    if (iframe) freeLogin();
    Browser.getOrCreate(Config.AUTH_URI);
}

function onAuthStateGet(): void {
    Mediator.pub(Msg.AuthState, state)
}

function onAuthOAuth(): void {
    if (state === AuthState.READY) Mediator.pub(Msg.AuthReady);
    else Auth.login(false, true);
}


function promisify(resolve: (AuthModelI) => void) {
    function onSuccess(data: AuthModelI) {
        state = AuthState.READY;
        Browser.setIconOnline();
        resolve(data);
    }

    Mediator.unsub(Msg.AuthToken, onSuccess);
    Mediator.once(Msg.AuthToken, onSuccess);
}


export default class Auth {

    static login(resetToken?: boolean, withWindow?: boolean): Promise<AuthModelI> {
        //console.debug("Login", state, resetToken, withWindow);
        //console.trace();

        if (state == AuthState.LOCKED_WINDOW) {
            if (withWindow) loginWithWindow();
        }
        else if (state !== AuthState.LOCKED_TOKEN_PROCESSING) {
            if (withWindow) {
                state = AuthState.LOCKED_WINDOW;
                loginWithWindow();
            }
            else {
                state = AuthState.LOCKED_IFRAME;
                tryLogin()
            }
        }

        Browser.setIconOffline();

        if (resetToken) return authPromise = new Promise(promisify);
        else return Auth.tokenReady();
    }

    static tokenReady(): Promise<AuthModelI> {
        if (authPromise) return authPromise;
        else return authPromise = new Promise(promisify);
    }

    static getAccessToken(): Promise<string> {
        return Auth.tokenReady().then( () => authModel.accessToken )
    }

    static init(): void {
        Mediator.sub(Msg.AuthIframe, onAuthIframe);
        Mediator.sub(Msg.AuthStateGet, onAuthStateGet);
        Mediator.sub(Msg.AuthOauth, onAuthOAuth);

        authModel.on("change:userId", () => Mediator.pub(Msg.AuthUser, authModel.toJSON()) );
        authModel.on("change:accessToken", () => Mediator.pub(Msg.AuthToken, authModel.toJSON()) );
    }
}
