"use strict";
import ProxyMethods from "../proxy-methods/proxy-methods.pu"
/**
 * Returns a correct implementation
 * for background or popup page
 */
const request: RequestT = ProxyMethods.forward('../request/request.bg.ts', ['api', 'post', 'get']);



interface RequestT {
    api(params: any): Promise<any>
    post(url: string, data: object|string): Promise<any>
    get(url: string, data: object|string): Promise<any>
}

export default request;