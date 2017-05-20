"use strict";
import PersistentModel from "../persistent-model/persistent-model"
import Browser from "../browser/browser.bg"
import Auth from "../auth/auth.bg";


const storageModel = new PersistentModel({
    enabled: false,
    //show or not install dialog
    dialog: true
}, {name: 'yandexSettings'});

export default function init() {
    // Show install dialog only once, don't bother
    if (storageModel.get('dialog')) {
        storageModel.set('dialog', false);
        Browser.createTab("/pages/install.html");
    }
    else Auth.login();
    //Browser.createTab("/pages/popup.html");
}
