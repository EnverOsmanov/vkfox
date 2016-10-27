"use strict";
const Dispatcher = require('./dispatcher.js'),
    Mediator     = Object.create(Dispatcher),
    activePort   = chrome.runtime.connect();

activePort.onMessage.addListener(function (messageData) {
    Dispatcher.pub.apply(Dispatcher, messageData);
});

Mediator.pub = function () {
    Dispatcher.pub.apply(Dispatcher, arguments);
    activePort.postMessage([].slice.call(arguments));
};

module.exports = Mediator;
