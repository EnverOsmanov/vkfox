"use strict";
// HTTPS only
// @see http://vk.com/pages?oid=-1&p=%D0%92%D1%8B%D0%BF%D0%BE%D0%BB%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5_%D0%B7%D0%B0%D0%BF%D1%80%D0%BE%D1%81%D0%BE%D0%B2_%D0%BA_API
import ProxyMethods from '../proxy-methods/proxy-methods.bg'
import * as Vow from 'vow'
import * as _ from "underscore"
import Auth from '../auth/auth.bg'
import {ApiOptions, ApiQuery} from "./models";

const apiQueriesQueue: ApiQuery[] = [];

const API_DOMAIN              = 'https://api.vk.com/';
const API_QUERIES_PER_REQUEST = 15;
const API_REQUESTS_DEBOUNCE   = 400;
const API_VERSION             = 4.99;
const REAUTH_DEBOUNCE         = 2000;
const XHR_TIMEOUT             = 30000;


/**
 * Convert an object into a query params string
 *
 * @param {Object} params
 *
 * @returns {String}
 */
function querystring(params: object): string {
    const query = [];

    for (const key in params) {
        if (params[key] === undefined || params[key] === null) {
            continue;
        }
        if (Array.isArray(params[key])) {
            for (let i = 0; i < params[key].length; ++i) {
                if (params[key][i] === undefined || params[key][i] === null) {
                    continue;
                }
                query.push(encodeURIComponent(key) + '[]=' + encodeURIComponent(params[key][i]));
            }
        }
        else query.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
    }
    return query.join('&');
}
/**
 * Make HTTP Request
 *
 * @param {String} type Post or get
 * @param {String} url
 * @param {Object|String} data to send
 */
function xhrMy(type: string, url: string, data: string|object): Promise<any> {
    // Custom errors

    class AccessTokenError extends Error {
        constructor(message?: string) {
            super(message);
            Object.setPrototypeOf(this, AccessTokenError.prototype)
        }
    }

    function handleResponse(response: Response): Promise<any> {
        if (response.status === 401) {
            console.debug("Some error", response)
            return Auth
                .login(true)
                .then(() => xhrMy(type, url, data))
        }
        else return response.text().then((text: string) => {
            try {
                return JSON.parse(text)
            }
            catch (e) {
                console.error(`Not a JSON: ${text}`, e);
                return text
            }
        })
    }

    function myFetch(): Promise<Response> {
        const encodedData = typeof data === "string" ? data : querystring(data);
        type = type.toUpperCase();

        if (type === 'POST') {
            const opts = {
                method : type,
                body   : encodedData,
                headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" }
            };

            return fetch(url, opts);
        }
        else return fetch(url + '?' + encodedData, {credentials: "include"});
    }

    return myFetch()
        .then(handleResponse);
}

class Request {

    static _processApiQueries = _.debounce(function () {
        if (apiQueriesQueue.length) {
            const queriesToProcess = apiQueriesQueue.splice(0, API_QUERIES_PER_REQUEST);

            const executeCodeTokens = queriesToProcess.map( query => query.params.code.replace(/^return\s*|;$/g, ''));

            const executeCode = `return [${executeCodeTokens}];`;

            Auth.getAccessToken().then(function (accessToken) {
                function handleSuccess(data) {
                    if (data.execute_errors) console.warn("APIquery", executeCode, data);

                    const response = data.response;
                    if (Array.isArray(response)) {
                        for (let i = 0; i < response.length; i++) {
                            queriesToProcess[i].resolve(response[i]);
                        }
                        Request._processApiQueries();
                    }
                    else {
                        console.error(`response is not array`, data);
                        // force relogin on API error
                        //forceReauth();
                    }
                }

                function handleFailure(e) {
                    queriesToProcess.forEach( query => query.reject(e))
                }

                const params = {
                    method      : 'execute',
                    code        : executeCode,
                    access_token: accessToken,
                    v           : API_VERSION
                };
                const method = "execute";

                return Request
                    .post(`${API_DOMAIN}method/${method}`, params)
                    .then(handleSuccess)
                    .catch(handleFailure);
            });
        }
    }, API_REQUESTS_DEBOUNCE);

    static get(url: string, data: object, dataType?: string) {
        return xhrMy('get', url, data)
    }

    static post(url: string, data: object, dataType?: string) {
        return xhrMy('post', url, data)
    }

    static api(params: ApiOptions): Promise<any> {
        function promisify(resolve, reject) {
            apiQueriesQueue.push({ params, resolve, reject });
        }
        Request._processApiQueries();
        return new Vow.Promise(promisify);
    }

}

ProxyMethods.connect('../request/request.bg.ts', Request);

export default Request;