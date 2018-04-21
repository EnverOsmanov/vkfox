"use strict";

import Mediator from "../mediator/mediator.bg";


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
    connect(namespace: string, Module: object): void {

        function callMethod({method, args, id}) {
            const result: Promise<any> = Module[method].apply(Module, args);

            result
                .then( args => {
                    return {
                        method: "resolve",
                        args
                    }
                })
                .catch( args => {
                    return {
                        method: "reject",
                        args
                    }
                })
                .then( callResult =>
                    Mediator.pub(`proxy-methods:${id}`, callResult)
                );
        }

        Mediator.sub(`proxy-methods:${namespace}`, callMethod);
    }
};
