"use strict";
import * as _ from "underscore";
import Mediator from '../mediator/mediator.pu';


/**
 * This module is used to proxy methods call from one module to another.
 * Is used to proxy calls from popup to background.
 * ProxyMethods can proxy only methods that return promises or no value,
 * because use the asynchronous mediator underneath.
 */

export default {
    /**
     * Forward calls of passed methods to nother side.
     * Another side must call 'connect' method to make it work.
     * Can forward only methods that return promise or undefined.
     *
     * @ {String} namespace Name of module, whose methods will be proxied
     * @ {Array} methodNames Contains names of methods, that will be proxied
     *
     * @returns {Object}
     */

    forwardM<R>(namespace: string, method: string, ...args) {
        const id = _.uniqueId();

        Mediator.pub(`proxy-methods:${namespace}`, {method, id, args});

        function promisify(resolve: (R) => void, reject: (any) => void) {
            Mediator.once(`proxy-methods:${id}`, ({method, args}) => {
                if (method === "resolve") resolve(args);
                else reject(args);
            });
        }

        return new Promise<R>(promisify);

    }
};
