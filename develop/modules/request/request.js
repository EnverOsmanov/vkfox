"use strict";
const Env = require('../env/env.js');
/**
 * Returns a correct implementation
 * for background or popup page
 */
if (Env.background) module.exports = require('./request.bg.js');
else {
    const ProxyMethods = require('../proxy-methods/proxy-methods.js');

    module.exports = ProxyMethods.forward('../request/request.bg.js', ['api', 'post', 'get']);
}
