"use strict";
// HTTPS only
// @see http://vk.com/pages?oid=-1&p=%D0%92%D1%8B%D0%BF%D0%BE%D0%BB%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5_%D0%B7%D0%B0%D0%BF%D1%80%D0%BE%D1%81%D0%BE%D0%B2_%D0%BA_API
import ProxyMethods from '../../proxy-methods/proxy-methods.bg'
import * as _ from "underscore"
import Auth from '../auth/auth.bg'
import {AccessTokenError} from "./models";
import {API_VERSION} from "../../common/config/config";
import {ApiOptions, ApiQuery, DErrorResponse, DResponse, ExecuteResponse} from "../../common/request/types";
import Browser from "../browser/browser.bg";
import {ProxyNames} from "../../mediator/messages";
import Request from "../../common/request/Request"


const apiQueriesQueue: ApiQuery[] = [];

const API_DOMAIN              = 'https://api.vk.com';
const API_QUERIES_PER_REQUEST = 15;
const API_REQUESTS_DEBOUNCE   = 400;
const REAUTH_DEBOUNCE         = 20 * 1000;
const networkErrorMessage = "NetworkError when attempting to fetch resource.";




function wait(time: number = REAUTH_DEBOUNCE): Promise<any> {
    return new Promise( (resolve) => setTimeout(resolve, time))
}

/**
 * Make HTTP RequestBg
 *
 */
function xhrMy(type: string, url: string, data: string | object, networkIssues: boolean = false): Promise<any> {

    function handleResponse(response: Response): Promise<any> {
        if (response.status === 401) {
            console.debug("Some error", response);
            return Auth
                .login(true)
                .then(() => xhrMy(type, url, data, networkIssues))
        }
        else return response.text().then(text => {
            try {
                if (networkIssues) Browser.setIconOnline();

                return JSON.parse(text)
            }
            catch (e) {
                console.error(`Not a JSON: ${text}`, e);
                return {};
            }
        })
    }

    function myFetch(): Promise<Response> {
        const encodedData = typeof data === "string" ? data : Request.querystring(data);
        type = type.toUpperCase();

        if (type === 'POST') {
            const opts = {
                method : type,
                body   : encodedData,
                headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" }
            };

            return fetch(url, opts);
        }
        else return fetch(`${url}?${encodedData}`, {credentials: "include"});
    }

    function handleError(e: Error) {
        if (e instanceof TypeError && e.message == networkErrorMessage) {
            console.debug("[F]: Network, retrying", url, data);
            Browser.setIconOffline();
            return wait().then(() => xhrMy(type, url, data, true))
        }
        else return Promise.reject(e);
    }

    return myFetch()
        .then(handleResponse, handleError);
}

function processingSmallPart(queriesToProcess: ApiQuery[]): Promise<void> {
    const executeCodeTokens = queriesToProcess.map( query => query.params.code.replace(/^return\s*|;$/g, ''));

    const executeCode = `return [${executeCodeTokens}];`;

    return Auth.getAccessToken().then( (accessToken) => {
        function handleSuccess(data: ExecuteResponse) {
            function rejectAll() {
                queriesToProcess.forEach(query => query.reject(new AccessTokenError(`VK: ${data.error.error_msg}`)))
            }

            if (data.execute_errors) {
                const notServerErrors = data.execute_errors.filter( error => error.error_code != 10);

                function haveAllResponses() {
                    return data.response.length != queriesToProcess.length
                }

                if (notServerErrors.length > 0 && haveAllResponses()) console.warn("APIquery", executeCode, data);
            }

            const { response } = data;
            if (Array.isArray(response)) {
                for (let i = 0; i < response.length; i++) {
                    queriesToProcess[i].resolve(response[i]);
                }
                RequestBg._processApiQueries();
            }
            else if (data.error && data.error.error_msg) {
                switch(data.error.error_code) {
                    case 5: { // auth failed
                        console.debug("[R]... Retrying", data.error);
                        return Auth.login(true)
                            .then(() => processingSmallPart(queriesToProcess));
                    }

                    case 3: { // invalid method
                        console.debug("[R]... Rejecting", data.error);
                        return Promise.reject(rejectAll());
                    }

                    case 10: { // server error
                        console.debug("[R]... Retrying", data.error);
                        return wait(60 * 1000).then( () => Promise.reject(rejectAll()));
                    }

                    case 12: {
                        console.debug("[R]", data.error);
                        return Promise.reject(rejectAll());
                    }

                    default: {
                        console.debug("[R]", data.error);
                        return wait(20 * 1000)
                            .then(rejectAll);
                    }
                }
            }
            else {
                console.error(`response is not array`, data);
            }
        }

        function handleFailure(e) {
            queriesToProcess.forEach( query => query.reject(e))
        }

        const method = "execute";
        const params = {
            method,
            code        : executeCode,
            access_token: accessToken,
            v           : API_VERSION
        };

        return RequestBg
            .post(`${API_DOMAIN}/method/${method}`, params)
            .then(handleSuccess)
            .catch(handleFailure);
    });
}


class RequestBg {

    static _processApiQueries = _.debounce( () => {
        if (apiQueriesQueue.length) {
            const queriesToProcess = apiQueriesQueue.splice(0, API_QUERIES_PER_REQUEST);
            processingSmallPart(queriesToProcess)
        }
    }, API_REQUESTS_DEBOUNCE);

    static get(url: string, data: object, dataType?: string) {
        return xhrMy("get", url, data)
    }

    static post(url: string, data: object, dataType?: string) {
        return xhrMy("post", url, data)
    }

    static api<R>(params: ApiOptions): Promise<R> {
        function promisify(resolve, reject) {
            apiQueriesQueue.push({ params, resolve, reject });
        }
        RequestBg._processApiQueries();
        return new Promise(promisify);
    }

    static async directApi(method: string, params: object): Promise<any> {

        const accessToken = await Auth.getAccessToken();

        const fullParams = {
            ...params,
            access_token: accessToken,
            v           : API_VERSION
        };

        const response: DResponse | DErrorResponse<object>
            = await RequestBg.get(`${API_DOMAIN}/method/${method}`, fullParams);

        if ("response" in response) return response.response;
        else if (response.error.error_code == 5) {
            console.debug("[R]... Retrying", response.error.error_msg);
            await Auth.login(true);

            return RequestBg.directApi(method, params);
        }
        else {
            console.error("[R]", response.error);

            return Promise.reject(new Error(`VK: ${response.error.error_msg}`))
        }
    }



}

ProxyMethods.connect(ProxyNames.RequestBg, RequestBg);

export default RequestBg;