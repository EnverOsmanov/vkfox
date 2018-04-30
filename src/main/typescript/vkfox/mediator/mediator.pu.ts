"use strict";
import Dispatcher from './dispatcher';

const mediator: { pub; sub; once; unsub } = Object.create(Dispatcher);
const activePort: browser.runtime.Port = browser.runtime.connect();

activePort.onMessage.addListener( (messageData) => {
    Dispatcher.pub.apply(Dispatcher, messageData);
});

mediator.pub = function () {
    Dispatcher.pub.apply(Dispatcher, arguments);
    activePort.postMessage([].slice.call(arguments));
};

export default mediator;
