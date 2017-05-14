"use strict";

const port = browser.runtime.connect();

port.postMessage(["auth:iframe", decodeURIComponent(window.location.href)]);

port.disconnect();
