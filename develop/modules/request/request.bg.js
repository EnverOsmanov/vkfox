"use strict";
// HTTPS only
// @see http://vk.com/pages?oid=-1&p=%D0%92%D1%8B%D0%BF%D0%BE%D0%BB%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5_%D0%B7%D0%B0%D0%BF%D1%80%D0%BE%D1%81%D0%BE%D0%B2_%D0%BA_API
const Vow           = require('vow'),
    _               = require('underscore')._,
    ProxyMethods    = require('../proxy-methods/proxy-methods.js'),
    Auth            = require('../auth/auth.bg.js'),
    apiQueriesQueue = [];

const API_DOMAIN              = 'https://api.vk.com/';
const API_QUERIES_PER_REQUEST = 15;
const API_REQUESTS_DEBOUNCE   = 400;
const API_VERSION             = 4.99;
const REAUTH_DEBOUNCE         = 2000;
const XHR_TIMEOUT             = 30000;

let Request;

const forceReauth = _.debounce(() => Auth.login(true), REAUTH_DEBOUNCE);
/**
 * Convert an object into a query params string
 *
 * @param {Object} params
 *
 * @returns {String}
 */
function querystring(params) {
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
 * @param {String} dataType If "json" than reponseText will be parsed and returned as object
 */
function xhrMy(type, url, data) {
    // Custom errors
    function HttpError(message) {
        this.name = 'HttpError';
        this.message = message;
    }

    function AccessTokenError(message) {
        this.name = 'AccessTokenError';
        this.message = message;
    }

    [HttpError, AccessTokenError].forEach(constructor => {
        constructor.prototype = new Error();
        constructor.prototype.constructor = constructor;
    });
    /**
     * XMLHttpRequest onload handler.
     * Checks for an expired accessToken (e.g. a request that completed after relogin)
     *
     * @param {String} usedAccessToken
     * @param {Response} response
     */
    function onLoad(usedAccessToken, response) {
        return Auth.getAccessToken().then(function (accessToken) {
            if (accessToken === usedAccessToken) {
                    return response.text().then( text => {
                        try {
                            return JSON.parse(text)
                        }
                        catch (e) {
                            console.error(`Not a JSON: ${e}`);
                            return text
                        }
                    })

            }
            else return new AccessTokenError();
        });
    }

    function myFetch() {
        const encodedData = typeof data === 'string' ? data : querystring(data);
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

    return Auth.getAccessToken().then(function (accessToken) {

        return myFetch()
            .then( response => onLoad(accessToken, response))
            .catch(e => {
                console.error(`myFetch: ${e}`);
                return e });
    });
}

module.exports = Request = ProxyMethods.connect('../request/request.bg.js', {
    get: (url, data, dataType) => xhrMy('get', url, data, dataType),

    post: (url, data, dataType) => xhrMy('post', url, data, dataType),

    api: params => {
        function promisify(resolve) {
            apiQueriesQueue.push({
                params: params,
                promise: resolve
            });
        }
        Request._processApiQueries();
        return new Vow.Promise(promisify);
    },

    _processApiQueries: _.debounce(function () {
        if (apiQueriesQueue.length) {
            const queriesToProcess = apiQueriesQueue.splice(0, API_QUERIES_PER_REQUEST),
                executeCodeTokens = [];

            let method;

            for (let i = 0; i < queriesToProcess.length; i++) {
                const { params } = queriesToProcess[i];
                method = params.method || 'execute';

                if (params.method) {
                    method = params.method;
                    delete params.method;
                }

                if (method === 'execute') executeCodeTokens.push(params.code.replace(/^return\s*|;$/g, ''));
                // TODO not implemented
                else throw 'not implemented';
            }

            const executeCode = `return [${executeCodeTokens}];`;

            Auth.getAccessToken().then(function (accessToken) {
                function handleSuccess(data) {
                    if (data.execute_errors) console.warn(data.execute_errors + JSON.stringify(data.execute_errors));

                    const response = data.response;
                    if (Array.isArray(response)) {
                        for (let i = 0; i < response.length; i++) {
                            queriesToProcess[i].promise(response[i]);
                        }
                        Request._processApiQueries();
                    }
                    else {
                        console.warn(data);
                        // force relogin on API error
                        forceReauth();
                    }
                }

                function handleFailure(e) {
                    // force relogin on API error
                    forceReauth();
                    console.error(e);
                }

                const params = {
                    method      : 'execute',
                    code        : executeCode,
                    access_token: accessToken,
                    v           : API_VERSION
                };

                return Request
                    .post(`${API_DOMAIN}method/${method}`, params)
                    .then(handleSuccess)
                    .catch(handleFailure);
            });
        }
    }, API_REQUESTS_DEBOUNCE)
});
