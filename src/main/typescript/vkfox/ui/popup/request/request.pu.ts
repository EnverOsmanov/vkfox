"use strict";
import ProxyMethods from "../../../proxy-methods/proxy-methods.pu"
import {ProxyNames} from "../../../mediator/messages";
/**
 * Returns a correct implementation
 * for background or popup page
 */


export default {

    api<R>(params: any): Promise<R> {
        return ProxyMethods.forwardM(ProxyNames.RequestBg, "api", params)
    },

    directApi<R>(method: string, params: object): Promise<R> {
        return ProxyMethods.forwardM(ProxyNames.RequestBg, "directApi", method, params)
    }

};