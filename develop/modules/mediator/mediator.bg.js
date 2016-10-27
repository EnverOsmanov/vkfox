"use strict";
const Dispatcher = require('./dispatcher.js'),
    Mediator     = Object.create(Dispatcher);


let activePorts = [];

chrome.runtime.onConnect.addListener(function (port) {
    activePorts.push(port);
    port.onMessage.addListener(function (messageData) {
        Dispatcher.pub.apply(Mediator, messageData);
    });
    port.onDisconnect.addListener(function () {
        activePorts = activePorts.filter(function (active) {
            return active !== port;
        });
    });
});

Mediator.pub = function () {
    const args = arguments;
    Dispatcher.pub.apply(Mediator, args);

    activePorts.forEach(function (port) {
        port.postMessage([].slice.call(args));
    });
};

module.exports = Mediator;
