"use strict";
const PersistentModel = require('../persistent-model/persistent-model.js'),
    Browser           = require('../browser/browser.bg.js'),
    storageModel = new PersistentModel({
        enabled: false,
        //show or not install dialog
        dialog: true
    }, {name: 'yandexSettings'});


// Show install dialog only once, don't bother
if (storageModel.get('dialog')) {
    storageModel.set('dialog', false);
   // Browser.createTab("/pages/install.html");
    Browser.createTab("/pages/popup.html");
}
