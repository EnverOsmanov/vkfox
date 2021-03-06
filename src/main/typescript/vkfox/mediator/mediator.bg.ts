"use strict";
import {browser} from "webextension-polyfill-ts"
import Dispatcher from './dispatcher';

const mediator = Object.create(Dispatcher);

let activePorts = [];

browser.runtime.onConnect.addListener( (port) => {
    activePorts.push(port);

    port.onMessage.addListener( messageData => Dispatcher.pub.apply(mediator, messageData) );

    port.onDisconnect.addListener( (p) => {
        activePorts = activePorts.filter(active => active !== p)
    });
});

mediator.pub = (...args) => {
    Dispatcher.pub.apply(mediator, args);

    activePorts.forEach( port => port.postMessage([].slice.call(args)) );
};

export default mediator;
