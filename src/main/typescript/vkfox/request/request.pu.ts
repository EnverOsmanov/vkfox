"use strict";
import ProxyMethods from "../proxy-methods/proxy-methods.pu"
/**
 * Returns a correct implementation
 * for background or popup page
 */

const namespace = "../request/request.bg.ts";


export default {

    api<R>(params: any): Promise<R> {
        return ProxyMethods.forwardM(namespace, "api", params)
    },

    directApi<R>(method: string, params: object): Promise<R> {
        return ProxyMethods.forwardM(namespace, "directApi", method, params)
    }

};