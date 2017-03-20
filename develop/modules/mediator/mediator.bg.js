"use strict";
const Dispatcher = require('./dispatcher.js'),
    Mediator     = Object.create(Dispatcher);


let activePorts = [];

browser.runtime.onConnect.addListener(function (port) {
    activePorts.push(port);

    port.onMessage.addListener( messageData => Dispatcher.pub.apply(Mediator, messageData) );

    port.onDisconnect.addListener( () => activePorts = activePorts.filter( active => active !== port ) );
});

Mediator.pub = function () {
    const args = arguments;
    Dispatcher.pub.apply(Mediator, args);

    activePorts.forEach( port => port.postMessage([].slice.call(args)) );
};

module.exports = Mediator;
