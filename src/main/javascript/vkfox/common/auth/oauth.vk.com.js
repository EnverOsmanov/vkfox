"use strict";

const port = chrome.runtime.connect();

port.postMessage(["auth:iframe", decodeURIComponent(window.location.href)]);

port.disconnect();
