"use strict";

import Mediator from '../mediator/mediator.bg';


/**
 * This module is used to proxy methods call from one module to another.
 * Is used to proxy calls from popup to background.
 * ProxyMethods can proxy only methods that return promises or no value,
 * because use the asynchronous mediator underneath.
 */

export default {
    /**
     * Backup forwarded calls. Second arguments is required due to browserify issue
     * that you can't require some module, if it was not explicitely required in a file
     *
     * @param {String} namespace Name of module that accepts forwarded calls
     * @param {Object} Module Module implementation that backups forwarded calls.
     *
     * @returns {Object} returns second argument, used for chaining
     */
    connect: function (namespace: string, Module: object) {

        Mediator.sub('proxy-methods:' + namespace, function ({method, args, id}) {
            const result = Module[method].apply(Module, args);

            if (typeof result.then === "function") {
                result
                    .then(function (value) {
                        Mediator.pub('proxy-methods:' + id, {
                            method: 'resolve',
                            'args': value
                        });
                    })
                    .catch(function (value) {
                        Mediator.pub('proxy-methods:' + id, {
                            method: 'reject',
                            'args': value
                        });
                    });
            }
        });

        return Module;
    }
};
