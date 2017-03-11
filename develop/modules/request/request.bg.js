"use strict";
// HTTPS only
// @see http://vk.com/pages?oid=-1&p=%D0%92%D1%8B%D0%BF%D0%BE%D0%BB%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5_%D0%B7%D0%B0%D0%BF%D1%80%D0%BE%D1%81%D0%BE%D0%B2_%D0%BA_API
const Vow           = require('../shim/vow.js'),
    _               = require('../shim/underscore.js')._,
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
     * @param {Vow.promise} ajaxPromise Will be resolved or rejected
     * @param {String} usedAccessToken
     * @param {String} responseText
     * @param {String} dataType Is ignored currently
     */
    function onLoad(ajaxPromise, usedAccessToken, responseText) {
        Auth.getAccessToken().then(function (accessToken) {
            if (accessToken === usedAccessToken) {
                try {
                    ajaxPromise.fulfill(JSON.parse(responseText));
                }
                catch (e) {
                    ajaxPromise.fulfill(responseText)
                }
            }
            else ajaxPromise.reject(new AccessTokenError());
        });
    }

    return Auth.getAccessToken().then(function (accessToken) {
        const ajaxPromise = Vow.promise();
        const encodedData = typeof data === 'string' ? data : querystring(data);
        const xhr         = new XMLHttpRequest();

        xhr.onload = () => onLoad(ajaxPromise, accessToken, xhr.responseText);
        xhr.timeout = XHR_TIMEOUT;
        xhr.onerror = xhr.ontimeout = e => ajaxPromise.reject(new HttpError(e));

        type = type.toUpperCase();
        if (type === 'POST') {
            xhr.open(type, url, true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
            xhr.send(encodedData);
        } else {
            xhr.open(type, url + '?' + encodedData, true);
            xhr.send();
        }
        return ajaxPromise;
    });
}

module.exports = Request = ProxyMethods.connect('../request/request.bg.js', {
    get: (url, data, dataType) => xhrMy('get', url, data, dataType),

    post: (url, data, dataType) => xhrMy('post', url, data, dataType),

    api: params => {
        const promise = Vow.promise();
        apiQueriesQueue.push({
            params : params,
            promise: promise
        });
        Request._processApiQueries();
        return promise;
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
                            queriesToProcess[i].promise.fulfill(response[i]);
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
                    console.warn(e);
                }

                const params = {
                    method      : 'execute',
                    code        : executeCode,
                    access_token: accessToken,
                    v           : API_VERSION
                };

                Request
                    .post(`${API_DOMAIN}method/${method}`, params)
                    .then(handleSuccess, handleFailure)
                    .done();
            }).done();
        }
    }, API_REQUESTS_DEBOUNCE)
});
