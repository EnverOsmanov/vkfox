"use strict";
/**
 * This module is used to proxy methods call from one module to another.
 * Is used to proxy calls from popup to background.
 * ProxyMethods can proxy only methods that return promises or no value,
 * because use the asynchronous Mediator underneath.
 */
const Vow    = require('vow'),
    _        = require('underscore')._,
    Mediator = require('../mediator/mediator.js');

module.exports = {
    /**
     * Backup forwarded calls. Second arguments is required due to browserify issue
     * that you can't require some module, if it was not explicitely required in a file
     *
     * @param {String} namespace Name of module that accepts forwarded calls
     * @param {Object} Module Module implementation that backups forwarded calls.
     *
     * @returns {Object} returns second argument, used for chaining
     */
    connect: function (namespace, Module) {
        Mediator.sub('proxy-methods:' + namespace, function (params) {
            const result = Module[params.method].apply(Module, params['arguments']);

            if (typeof result.then === "function") {
                result
                    .then(function (value) {
                        Mediator.pub('proxy-methods:' + params.id, {
                            method: 'resolve',
                            'arguments': [value]
                        });
                    })
                    .catch(function (value) {
                        Mediator.pub('proxy-methods:' + params.id, {
                            method: 'reject',
                            'arguments': [value]
                        });
                    });
            }
        });

        return Module;
    },
    /**
     * Forward calls of passed methods to nother side.
     * Another side must call 'connect' method to make it work.
     * Can forward only methods that return promise or undefined.
     *
     * @param {String} namespace Name of module, whose methods will be proxied
     * @param {Array} methodNames Contains names of methods, that will be proxied
     *
     * @returns {Object}
     */
    forward: function (namespace, methodNames) {
        return methodNames.reduce(function (exports, methodName) {
            exports[methodName] = function () {
                const id = _.uniqueId();

                Mediator.pub('proxy-methods:' + namespace, {
                    method: methodName,
                    id: id,
                    'arguments': [].slice.apply(arguments)
                });

                function promisify(resolve, reject) {
                    Mediator.once('proxy-methods:' + id, function (data) {
                        if (data.method === "resolve") resolve(data['arguments']);
                        else reject(data['arguments']);
                    });
                }

                return new Vow.Promise(promisify);
            };
            return exports;
        }, {});
    }
};
