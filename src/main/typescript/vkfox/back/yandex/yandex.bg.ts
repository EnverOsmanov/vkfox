"use strict";
import Mediator from "../../mediator/mediator.bg"
import Browser from "../browser/browser.bg"
import {browser} from "webextension-polyfill-ts"
import PersistentModel from "../../common/persistent-model/persistent-model"
import Auth from "../auth/auth.bg";
import {Msg} from "../../mediator/messages";


const storageModel = new PersistentModel({
    enabled: false,
    //show or not install dialog
    dialog: true,
    name: "yandexSettings"
});

export default function init() {
    Mediator.sub(Msg.YandexDialogClose, () => Browser.closeTabs("pages/install.html") );

    // Show install dialog only once, don't bother
    if (storageModel.get("dialog")) {
        storageModel.set("dialog", false);
        return browser.tabs.create({url: "/pages/install.html"});
    }
    else {
        return Auth.login();
    }
}