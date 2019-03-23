"use strict";
import {browser, Runtime} from "webextension-polyfill-ts"
import Dispatcher from './dispatcher';
import Port = Runtime.Port;

const mediator: { pub; sub; once; unsub } = Object.create(Dispatcher);
const activePort: Port = browser.runtime.connect();

activePort.onMessage.addListener( (messageData) => {
    Dispatcher.pub.apply(Dispatcher, messageData);
});

mediator.pub = function () {
    Dispatcher.pub.apply(Dispatcher, arguments);
    activePort.postMessage([].slice.call(arguments));
};

export default mediator;
